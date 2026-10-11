import { kindMeta, levelMeta } from "./catalog";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  buildView,
  indexElements,
  levelForElement,
  type FlowNode,
} from "./view";
import {
  WORKSPACE_FILE_FORMAT,
  WORKSPACE_FILE_VERSION,
  type C4Element,
  type Level,
  type Workspace,
  type WorkspaceFile,
} from "./types";

export { NODE_HEIGHT, NODE_WIDTH };

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function alias(element: C4Element): string {
  return element.id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function quote(value: string): string {
  return `"${value.replace(/"/g, "'").replace(/\r?\n/g, " ").trim()}"`;
}

function clean(value: string | undefined): string {
  return (value ?? "").replace(/\r?\n/g, " ").trim();
}

function isElementNode(node: FlowNode): node is Extract<FlowNode, { type: "c4" }> {
  return node.type === "c4";
}

/** Nodos que se exportan: elementos C4 y notas. */
function isDiagramNode(node: FlowNode): node is Extract<FlowNode, { type: "c4" | "note" }> {
  return node.type === "c4" || node.type === "note";
}

interface Scope {
  level: Level;
  scopeId: string | null;
}

/** Todos los diagramas del workspace: contexto + un diagrama por ámbito. */
export function diagramScopes(workspace: Workspace): Scope[] {
  const scopes: Scope[] = [{ level: "context", scopeId: null }];
  for (const element of workspace.elements) {
    const hasChildren = workspace.elements.some((child) => child.parentId === element.id);
    if (!hasChildren) continue;
    const level = levelForElement(element);
    if (level) scopes.push({ level, scopeId: element.id });
  }
  return scopes;
}

function scopeTitle(workspace: Workspace, level: Level, scopeId: string | null): string {
  const byId = indexElements(workspace);
  const scope = scopeId ? byId.get(scopeId) : undefined;
  const label = levelMeta(level).label;
  return scope ? `${label} · ${scope.name}` : label;
}

/* ------------------------------------------------------------------ */
/* PlantUML (C4-PlantUML)                                              */
/* ------------------------------------------------------------------ */

function plantUmlDeclaration(element: C4Element): string {
  const meta = kindMeta(element.kind);
  const name = quote(element.name);
  const description = quote(clean(element.description));
  if (element.kind === "note") {
    const color = element.color ? ` #${element.color.replace("#", "")}` : "";
    return `note ${quote(clean(element.name))} as ${alias(element)}${color}`;
  }
  if (meta.depth === 0) {
    return `${meta.plantUml}(${alias(element)}, ${name}, ${description})`;
  }
  const technology = quote(clean(element.technology) || "Sin tecnología");
  return `${meta.plantUml}(${alias(element)}, ${name}, ${technology}, ${description})`;
}

/** Colores propios del elemento en sintaxis C4 (PlantUML y Mermaid). */
function elementStyleLine(element: C4Element): string | null {
  const fill = element.color ?? null;
  const border = element.borderColor ?? null;
  const font = element.textColor ?? null;
  if (!fill && !border && !font) return null;
  const parts = [
    fill ? `$bgColor="${fill}"` : null,
    border ? `$borderColor="${border}"` : null,
    font ? `$fontColor="${font}"` : null,
  ].filter((part): part is string => part !== null);
  return `UpdateElementStyle(${alias(element)}, ${parts.join(", ")})`;
}

function plantUmlDiagram(workspace: Workspace, level: Level, scopeId: string | null): string {
  const view = buildView(workspace, level, scopeId, null);
  const visible = view.nodes.filter(isDiagramNode);
  if (visible.length === 0) return "";

  const byId = indexElements(workspace);
  const kinds = new Set(visible.map((node) => node.data.element.kind));

  const includes: string[] = [];
  if (kinds.has("person") || kinds.has("softwareSystem") || kinds.has("externalSystem")) {
    includes.push("!include <C4/C4_Context>");
  }
  if (kinds.has("container") || kinds.has("database") || kinds.has("queue")) {
    includes.push("!include <C4/C4_Container>");
  }
  if (kinds.has("component") || kinds.has("code")) {
    includes.push("!include <C4/C4_Component>");
  }

  const lines: string[] = [
    "@startuml",
    `title ${workspace.name} - ${scopeTitle(workspace, level, scopeId)}`,
    ...includes,
  ];

  const detail = visible.filter((node) => node.data.isDetail);
  const context = visible.filter((node) => !node.data.isDetail);

  for (const node of context) lines.push(plantUmlDeclaration(node.data.element));

  if (scopeId) {
    const scope = byId.get(scopeId);
    const boundary = scope ? kindMeta(scope.kind).plantUmlBoundary : null;
    lines.push(
      boundary
        ? `${boundary}(${alias(scope!)}, ${quote(scope!.name)}) {`
        : `package "${quote(scope?.name ?? "Detalle")}" {`,
    );
    for (const node of detail) lines.push(`  ${plantUmlDeclaration(node.data.element)}`);
    lines.push("}");
  } else {
    for (const node of detail) lines.push(plantUmlDeclaration(node.data.element));
  }

  for (const edge of view.edges) {
    const relationship = edge.data?.relationship;
    if (!relationship) continue;
    const arrow =
      relationship.style === "bi" ? "BiRel" : relationship.style === "async" ? "Rel_D" : "Rel";
    const source = alias(byId.get(relationship.source)!);
    const target = alias(byId.get(relationship.target)!);
    const technology = clean(relationship.technology);
    const label = quote(clean(relationship.label));
    const suffix = technology ? `, ${quote(technology)}` : "";
    lines.push(`${arrow}(${source}, ${target}, ${label}${suffix})`);

    const color = relationship.color;
    const thickness = relationship.thickness;
    if (color || thickness) {
      const style = [
        color ? `$lineColor="${color}"` : null,
        thickness ? `$thickness=${thickness}` : null,
      ].filter((part): part is string => part !== null);
      lines.push(`UpdateRelStyle(${source}, ${target}, ${style.join(", ")})`);
    }
  }

  for (const node of visible) {
    const style = elementStyleLine(node.data.element);
    if (style) lines.push(style);
  }

  lines.push("@enduml");
  return lines.join("\n");
}

export function exportPlantUml(workspace: Workspace): string {
  return diagramScopes(workspace)
    .map(({ level, scopeId }) => plantUmlDiagram(workspace, level, scopeId))
    .filter((text) => text.length > 0)
    .join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Mermaid (C4)                                                        */
/* ------------------------------------------------------------------ */

const MERMAID_KEYWORD: Record<string, string> = {
  person: "Person",
  softwareSystem: "System",
  externalSystem: "System_Ext",
  container: "Container",
  database: "ContainerDb",
  queue: "ContainerQueue",
  component: "Component",
  code: "Component",
};

function mermaidDiagram(workspace: Workspace, level: Level, scopeId: string | null): string {
  const view = buildView(workspace, level, scopeId, null);
  const visible = view.nodes.filter(isElementNode);
  if (visible.length === 0) return "";

  const diagramType =
    level === "context" ? "C4Context" : level === "container" ? "C4Container" : "C4Component";
  const byId = indexElements(workspace);

  const lines: string[] = [
    diagramType,
    `    title ${workspace.name} - ${scopeTitle(workspace, level, scopeId)}`,
    '    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")',
  ];

  for (const node of visible) {
    const element = node.data.element;
    const keyword = MERMAID_KEYWORD[element.kind];
    const label = quote(element.name);
    const description = quote(clean(element.description));
    const isNested = ["container", "database", "queue", "component", "code"].includes(
      element.kind,
    );
    const payload = isNested
      ? `${label}, ${quote(clean(element.technology) || "Sin tecnología")}, ${description}`
      : `${label}, ${description}`;
    lines.push(`    ${keyword}(${alias(element)}, ${payload})`);
  }

  for (const node of visible) {
    const style = elementStyleLine(node.data.element);
    if (style) lines.push(`    ${style}`);
  }

  for (const edge of view.edges) {
    const relationship = edge.data?.relationship;
    if (!relationship) continue;
    const arrow =
      relationship.style === "bi" ? "BiRel" : relationship.style === "async" ? "Rel_D" : "Rel";
    const source = alias(byId.get(relationship.source)!);
    const target = alias(byId.get(relationship.target)!);
    const technology = clean(relationship.technology);
    const label = quote(clean(relationship.label));
    const payload = technology ? `${label}, ${quote(technology)}` : label;
    lines.push(`    ${arrow}(${source}, ${target}, ${payload})`);
  }

  return lines.join("\n");
}

export function exportMermaid(workspace: Workspace): string {
  const parts = diagramScopes(workspace)
    .map(({ level, scopeId }) => mermaidDiagram(workspace, level, scopeId))
    .filter((text) => text.length > 0);
  return `%% Generado con C4 Modeler\n\n${parts.join("\n\n")}`;
}

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

export function toWorkspaceFile(workspace: Workspace): WorkspaceFile {
  return {
    format: WORKSPACE_FILE_FORMAT,
    version: WORKSPACE_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    workspace: { ...workspace, updatedAt: new Date().toISOString() },
  };
}

export function exportJson(workspace: Workspace): string {
  return JSON.stringify(toWorkspaceFile(workspace), null, 2);
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

export function exportMarkdown(workspace: Workspace): string {
  const byId = indexElements(workspace);
  const lines: string[] = [`# ${workspace.name}`, ""];
  if (clean(workspace.description)) lines.push(clean(workspace.description), "");

  const label = (elementId: string): string => {
    const element = byId.get(elementId);
    if (!element) return "?";
    const technology = clean(element.technology);
    return technology ? `${element.name} (${technology})` : element.name;
  };

  for (const { level, scopeId } of diagramScopes(workspace)) {
    const view = buildView(workspace, level, scopeId, null);
    const visible = view.nodes.filter(isElementNode);
    if (visible.length === 0) continue;

    const scopeName = scopeId ? byId.get(scopeId)?.name : undefined;
    lines.push(scopeName ? `## ${levelMeta(level).label} de ${scopeName}` : `## ${levelMeta(level).label}`);
    lines.push("");

    lines.push("| Origen | Relación | Destino | Tecnología |", "| --- | --- | --- | --- |");
    for (const edge of view.edges) {
      const relationship = edge.data?.relationship;
      if (!relationship) continue;
      lines.push(
        `| ${label(relationship.source)} | ${clean(relationship.label) || "—"} | ${label(
          relationship.target,
        )} | ${clean(relationship.technology) || "—"} |`,
      );
    }
    lines.push("");

    lines.push("| Elemento | Tipo | Descripción |", "| --- | --- | --- |");
    for (const node of visible) {
      const element = node.data.element;
      lines.push(
        `| ${element.name} | ${kindMeta(element.kind).label} | ${clean(element.description) || "—"} |`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Formatos y descarga                                                 */
/* ------------------------------------------------------------------ */

export type ExportFormat = "json" | "plantuml" | "mermaid" | "markdown";

export const EXPORT_FORMATS: {
  id: ExportFormat;
  label: string;
  extension: string;
}[] = [
  { id: "plantuml", label: "PlantUML (C4)", extension: "puml" },
  { id: "mermaid", label: "Mermaid (C4)", extension: "mmd" },
  { id: "markdown", label: "Markdown", extension: "md" },
  { id: "json", label: "JSON", extension: "json" },
];

export function renderExport(workspace: Workspace, format: ExportFormat): string {
  switch (format) {
    case "plantuml":
      return exportPlantUml(workspace);
    case "mermaid":
      return exportMermaid(workspace);
    case "markdown":
      return exportMarkdown(workspace);
    case "json":
    default:
      return exportJson(workspace);
  }
}

export function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "diagrama"
  );
}

export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function describeWorkspace(workspace: Workspace): string {
  const elements = workspace.elements.length;
  const relationships = workspace.relationships.length;
  return `${elements} elemento${elements === 1 ? "" : "s"} · ${relationships} relación${
    relationships === 1 ? "" : "es"
  }`;
}
