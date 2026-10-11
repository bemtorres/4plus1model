import { kindMeta } from "@/lib/catalog";
import type { Level } from "@/lib/types";
import { buildView, resolveScopeId } from "@/lib/view";
import { technologyUrl } from "./tech-links";
import { referenceUrl } from "./reference-links";
import { buildExampleWorkspace, type ExampleSpec } from "./index";

export interface ExampleCounts {
  people: number;
  systems: number;
  externalSystems: number;
  containers: number;
  databases: number;
  queues: number;
  components: number;
  relationships: number;
}

export interface LevelSummary {
  level: Level;
  /** Elementos de detalle que muestra el nivel. */
  count: number;
  /** Tecnologías usadas por esos elementos. */
  technologies: string[];
}

export interface RelationshipRow {
  from: string;
  to: string;
  label: string;
  technology: string;
  style: string;
  async: boolean;
}

export interface ExampleAnalysis {
  counts: ExampleCounts;
  /** Niveles con contenido: contexto + los que se pueden abrir. */
  levels: LevelSummary[];
  /** Tecnologías únicas, con enlace oficial cuando se reconoce. */
  technologies: { name: string; url?: string }[];
  /** Sistemas externos de los que depende. */
  externalDependencies: { name: string; description: string }[];
  relationships: RelationshipRow[];
  /** 1 = pequeño, 2 = medio, 3 = grande. */
  complexity: 1 | 2 | 3;
  complexityScore: number;
  reference: string;
  referenceUrl?: string;
}

const LEVEL_ORDER: Level[] = ["context", "container", "component", "code"];

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

/**
 * Analiza el modelo generado de un ejemplo: métricas por nivel C4,
 * tecnologías implicadas, dependencias externas y tabla de relaciones.
 */
export function analyzeExample(spec: ExampleSpec): ExampleAnalysis {
  const workspace = buildExampleWorkspace(spec);

  const byKind = (kind: Parameters<typeof kindMeta>[0]) =>
    workspace.elements.filter((element) => element.kind === kind).length;

  const counts: ExampleCounts = {
    people: byKind("person"),
    systems: byKind("softwareSystem"),
    externalSystems: byKind("externalSystem"),
    containers: byKind("container"),
    // Base de datos y cola son tipos distintos: no se suman.
    databases: byKind("database"),
    queues: byKind("queue"),
    components: byKind("component"),
    relationships: workspace.relationships.length,
  };

  // Niveles con contenido real
  const levels: LevelSummary[] = [];
  const visit = (level: Level, scopeId: string | null) => {
    const view = buildView(workspace, level, scopeId, null);
    const detail = view.nodes.filter((node) => node.type === "c4");
    if (detail.length === 0) return;
    const technologies = unique(
      detail
        .filter((node) => node.data.isDetail)
        .map((node) => node.data.element.technology),
    );
    levels.push({ level, count: detail.filter((node) => node.data.isDetail).length, technologies });

    if (level === "context") {
      const first = workspace.elements.find(
        (element) => kindMeta(element.kind).depth === 0 && kindMeta(element.kind).drillable,
      );
      if (first) visit("container", resolveScopeId(workspace, "container", first.id));
      return;
    }
    if (level === "container") {
      const container = workspace.elements.find((element) =>
        workspace.elements.some(
          (child) => child.parentId === element.id && child.kind === "component",
        ),
      );
      if (container) visit("component", container.id);
      return;
    }
    if (level === "component") {
      const component = workspace.elements.find((element) =>
        workspace.elements.some((child) => child.parentId === element.id && child.kind === "code"),
      );
      if (component) visit("code", component.id);
    }
  };
  visit("context", null);
  levels.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));

  const technologies = unique([
    ...workspace.elements.map((element) => element.technology),
    ...workspace.relationships.map((relationship) => relationship.technology),
  ])
    .map((name) => ({ name, url: technologyUrl(name) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const nameById = new Map(workspace.elements.map((element) => [element.id, element.name]));
  const relationships: RelationshipRow[] = workspace.relationships.map((relationship) => ({
    from: nameById.get(relationship.source) ?? "?",
    to: nameById.get(relationship.target) ?? "?",
    label: relationship.label,
    technology: relationship.technology,
    style: relationship.style,
    async: relationship.style === "async",
  }));

  const externalDependencies = workspace.elements
    .filter((element) => element.kind === "externalSystem")
    .map((element) => ({ name: element.name, description: element.description }));

  const complexityScore =
    counts.containers * 2 + counts.components * 2 + counts.relationships + counts.externalSystems;
  const complexity: 1 | 2 | 3 = complexityScore >= 30 ? 3 : complexityScore >= 16 ? 2 : 1;

  return {
    counts,
    levels,
    technologies,
    externalDependencies,
    relationships,
    complexity,
    complexityScore,
    reference: spec.reference,
    referenceUrl: referenceUrl(spec.reference),
  };
}
