import { diagramDef, kindMeta, levelMeta, styleLabel } from "./diagrams";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  buildView,
  indexElements,
  levelForElement,
  type FlowNode,
} from "./view";
import {
  PROJECT_FILE_FORMAT,
  PROJECT_FILE_VERSION,
  type DiagramElement,
  type Level,
  type Project,
  type ProjectFile,
  type Sheet,
} from "./types";

export { NODE_HEIGHT, NODE_WIDTH };

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function clean(value: string | undefined): string {
  return (value ?? "").replace(/\r?\n/g, " ").trim();
}

function md(value: string | undefined): string {
  return clean(value).replace(/\|/g, "\\|");
}

function isDiagramNode(node: FlowNode): node is Extract<FlowNode, { type: "element" | "note" }> {
  return node.type === "element" || node.type === "note";
}

interface Scope {
  level: Level;
  scopeId: string | null;
}

/**
 * Todos los diagramas de una hoja: nivel raíz + un diagrama por cada elemento
 * navegable con contenido (drill-down).
 */
function sheetScopes(sheet: Sheet): Scope[] {
  const def = diagramDef(sheet.diagram);
  const root = def.levels.find((item) => item.scopeDepth < 0);
  const scopes: Scope[] = root ? [{ level: root.id, scopeId: null }] : [];
  for (const element of sheet.elements) {
    const hasChildren = sheet.elements.some((child) => child.parentId === element.id);
    if (!hasChildren) continue;
    const level = levelForElement(sheet.diagram, element);
    if (level) scopes.push({ level, scopeId: element.id });
  }
  return scopes;
}

function scopeTitle(sheet: Sheet, level: Level, scopeId: string | null): string {
  const byId = indexElements(sheet);
  const scope = scopeId ? byId.get(scopeId) : undefined;
  const label = levelMeta(sheet.diagram, level).label;
  return scope ? `${label} · ${scope.name}` : label;
}

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

export function toProjectFile(project: Project): ProjectFile {
  return {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    project: { ...project, updatedAt: new Date().toISOString() },
  };
}

export function exportJson(project: Project): string {
  return JSON.stringify(toProjectFile(project), null, 2);
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

function markdownUseCase(sheet: Sheet, useCase: DiagramElement, lines: string[]) {
  const meta = useCase.meta ?? {};
  const steps = sheet.elements
    .filter((element) => element.kind === "step" && element.parentId === useCase.id)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

  lines.push(`#### ${clean(useCase.name)}`, "");
  if (clean(useCase.description)) lines.push(clean(useCase.description), "");
  if (meta.preconditions) lines.push(`**Precondiciones:** ${clean(meta.preconditions)}`, "");
  if (steps.length > 0) {
    lines.push("**Pasos:**", "");
    steps.forEach((step, index) => {
      const detail = clean(step.description);
      lines.push(`${index + 1}. ${clean(step.name)}${detail ? ` — ${detail}` : ""}`);
    });
    lines.push("");
  }
  if (meta.postconditions) lines.push(`**Postcondiciones:** ${clean(meta.postconditions)}`, "");
}

export function exportMarkdown(project: Project): string {
  const lines: string[] = [`# ${project.name}`, ""];
  if (clean(project.description)) lines.push(clean(project.description), "");

  for (const sheet of project.sheets) {
    lines.push(`## ${sheet.name}`, "");

    const elements = sheet.elements.filter((element) => element.kind !== "note");
    lines.push(
      `*${elements.length} elemento${elements.length === 1 ? "" : "s"} · ${
        sheet.relationships.length
      } relación${sheet.relationships.length === 1 ? "" : "es"}*`,
      "",
    );

    if (sheet.relationships.length > 0) {
      lines.push("| Origen | Estilo | Destino |", "| --- | --- | --- |");
      const byId = indexElements(sheet);
      for (const relationship of sheet.relationships) {
        const source = byId.get(relationship.source)?.name ?? "?";
        const target = byId.get(relationship.target)?.name ?? "?";
        const style = styleLabel(relationship.style);
        const label = clean(relationship.label);
        lines.push(`| ${md(source)} | ${style}${label ? ` (${md(label)})` : ""} | ${md(target)} |`);
      }
      lines.push("");
    }

    if (elements.length > 0) {
      lines.push("| Elemento | Tipo | Descripción |", "| --- | --- | --- |");
      for (const element of elements) {
        lines.push(
          `| ${md(element.name)} | ${kindMeta(sheet.diagram, element.kind).label} | ${
            md(clean(element.description)) || "—"
          } |`,
        );
      }
      lines.push("");
    }

    // Los casos de uso añaden su semántica: precondiciones, pasos y postcondiciones.
    if (sheet.diagram === "usecase") {
      const useCases = elements
        .filter((element) => element.kind === "useCase")
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const useCase of useCases) {
        markdownUseCase(sheet, useCase, lines);
      }

      const detailedUseCases = elements
        .filter((element) => element.kind === "detailedUseCase")
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const detailed of detailedUseCases) {
        markdownDetailedUseCase(sheet, detailed, lines);
      }
    }
  }

  return lines.join("\n");
}

function markdownDetailedUseCase(sheet: Sheet, element: DiagramElement, lines: string[]) {
  const meta = element.meta ?? {};
  const isSecondary = meta.useCaseType === "secondary";
  const parent = meta.parentDetailedUseCaseId
    ? sheet.elements.find((e) => e.id === meta.parentDetailedUseCaseId)
    : null;

  lines.push(`### Ficha de Caso de Uso Detallado: ${clean(element.name)}`, "");
  lines.push(
    `| Sección | Especificación |`,
    `| :--- | :--- |`,
    `| **Nombre del caso de uso** | ${clean(element.name)} (${isSecondary ? `Secundario${parent ? ` - Vinculado a: ${clean(parent.name)}` : ""}` : "Primario"}) |`,
    `| **Actor Principal** | ${clean(meta.actor) || "—"} |`,
    `| **Personal involucrado e intereses** | ${clean(meta.stakeholders) || "—"} |`,
    `| **Precondiciones** | ${clean(meta.preconditions) || "—"} |`,
    `| **Postcondiciones o garantías de éxito** | ${clean(meta.postconditions) || "—"} |`,
    `| **Escenario Principal (Flujo Básico)** | ${clean(meta.mainScenario) || "—"} |`,
    `| **Extensiones o Flujos Alternativos** | ${clean(meta.alternativeFlows) || "—"} |`,
    `| **Requisitos especiales** | ${clean(meta.specialRequirements) || "—"} |`,
    `| **Lista de tecnología y variaciones de datos** | ${clean(meta.techVariations) || "—"} |`,
    `| **Frecuencia con la que se lleva a cabo** | ${clean(meta.frequency) || "—"} |`,
    `| **Temas abiertos** | ${clean(meta.openIssues) || "—"} |`,
    "",
  );
}

/* ------------------------------------------------------------------ */
/* JWT                                                                 */
/* ------------------------------------------------------------------ */

import { encodeProjectToJwtSync } from "./jwt";

export function exportJwt(project: Project): string {
  return encodeProjectToJwtSync(project);
}

/* ------------------------------------------------------------------ */
/* Formatos y descarga                                                 */
/* ------------------------------------------------------------------ */

export type ExportFormat = "json" | "markdown" | "jwt";

export const EXPORT_FORMATS: {
  id: ExportFormat;
  label: string;
  extension: string;
}[] = [
  { id: "json", label: "JSON (4plus1-modeler)", extension: "json" },
  { id: "markdown", label: "Markdown", extension: "md" },
  { id: "jwt", label: "JWT (JSON Web Token)", extension: "jwt" },
];

export function renderExport(project: Project, format: ExportFormat): string {
  switch (format) {
    case "markdown":
      return exportMarkdown(project);
    case "jwt":
      return exportJwt(project);
    case "json":
    default:
      return exportJson(project);
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

export function describeProject(project: Project): string {
  const elements = project.sheets.reduce((total, sheet) => total + sheet.elements.length, 0);
  const relationships = project.sheets.reduce(
    (total, sheet) => total + sheet.relationships.length,
    0,
  );
  const sheets = project.sheets.length;
  return `${sheets} hoja${sheets === 1 ? "" : "s"} · ${elements} elemento${
    elements === 1 ? "" : "s"
  } · ${relationships} relación${relationships === 1 ? "" : "es"}`;
}
