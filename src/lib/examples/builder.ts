import { centerPositions, computeLayout } from "@/lib/layout";
import { createId } from "@/lib/id";
import { defaultNodeSize } from "@/lib/diagrams";
import type {
  DiagramElement,
  DiagramRelationship,
  Project,
  RelationshipStyle,
  Sheet,
} from "@/lib/types";

/**
 * Categorías temáticas del catálogo. Deben coincidir con `CATEGORY_ORDER`
 * y con las claves `category.*` de los diccionarios i18n.
 */
export type CategoryId =
  | "streaming"
  | "ecommerce"
  | "fintech"
  | "social"
  | "education"
  | "health"
  | "transport"
  | "productivity"
  | "ai"
  | "infra";

export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * Especificación declarativa de un caso de estudio (diagrama de casos de uso).
 *
 * - `actors` son los actores primarios `[nombre, descripción]`.
 * - `secondaryActors` son actores secundarios del mismo formato.
 * - `useCases` son los casos de uso `[nombre, descripción, precondiciones?, postcondiciones?]`.
 * - `flows` asocia cada caso de uso con su lista de pasos del flujo principal.
 * - `relations` son `[origen, destino, etiqueta?, estilo?]`; los nombres se
 *   resuelven contra actores y casos de uso, y si no existen se ignora la
 *   relación (en desarrollo se lanza error para no ocultar erratas).
 */
export interface ExampleSpec {
  /** Slug ASCII en minúsculas y guiones: forma la URL y el nombre de imagen. */
  id: string;
  name: string;
  category: CategoryId;
  /** Referencia conceptual (no afiliada) que inspira el ejemplo. */
  reference: string;
  summary: string;
  /** Qué se ve bien en el diagrama de este ejemplo. */
  focus: string;
  difficulty: Difficulty;
  /** Nombre del sistema bajo estudio (si falta se usa `name`). */
  system?: string;
  actors: [string, string][];
  secondaryActors?: [string, string][];
  useCases: [string, string, string?, string?][];
  flows?: Record<string, string[]>;
  relations?: [string, string, string?, RelationshipStyle?][];
  /** Imagen en `public/examples` (opcional, se puede añadir después). */
  image?: string;
}

/**
 * Convierte una especificación en un `Project` con una hoja de casos de uso
 * completa: actores, sistema, casos de uso, flujo de pasos y relaciones por
 * nombre, con el primer nivel colocado por el algoritmo de capas.
 *
 * Los ids se generan en cada construcción: dos llamadas producen el mismo
 * modelo con otros ids.
 */
export function buildExampleProject(spec: ExampleSpec): Project {
  const elements: DiagramElement[] = [];
  const relationships: DiagramRelationship[] = [];
  /** Nombre → id. El orden de inserción define la precedencia en colisiones. */
  const idByName = new Map<string, string>();
  const skipped: string[] = [];

  const push = (
    name: string,
    kind: DiagramElement["kind"],
    description: string,
    parentId: string | null,
    meta?: Record<string, string>,
  ) => {
    const id = createId("ex");
    idByName.set(name, id);
    elements.push({ id, kind, name, description, tags: [], parentId, meta, x: 0, y: 0 });
    return id;
  };

  // Nivel 1 · actores y sistema.
  for (const [name, description] of spec.actors) {
    push(name, "actor", description, null, { actorType: "primary" });
  }
  for (const [name, description] of spec.secondaryActors ?? []) {
    push(name, "actor", description, null, { actorType: "secondary" });
  }

  const systemId = push(spec.system ?? spec.name, "system", spec.summary, null);

  // Nivel 2 · casos de uso dentro del sistema.
  for (const [name, description, preconditions, postconditions] of spec.useCases) {
    push(name, "useCase", description, systemId, {
      goalLevel: "user",
      ...(preconditions ? { preconditions } : {}),
      ...(postconditions ? { postconditions } : {}),
    });
  }

  // Nivel 3 · flujo de pasos de cada caso de uso.
  for (const [useCaseName, steps] of Object.entries(spec.flows ?? {})) {
    const parentId = idByName.get(useCaseName);
    if (!parentId) {
      skipped.push(`flows → caso de uso inexistente "${useCaseName}"`);
      continue;
    }
    steps.forEach((stepName, index) => {
      const id = createId("ex");
      elements.push({
        id,
        kind: "step",
        name: stepName,
        description: "",
        tags: [],
        parentId,
        order: index,
        x: 0,
        y: 0,
      });
    });
  }

  // Relaciones: se resuelven por nombre (actores ↔ casos de uso, etc.).
  for (const [source, target, label, style] of spec.relations ?? []) {
    const sourceId = idByName.get(source);
    const targetId = idByName.get(target);
    if (!sourceId || !targetId) {
      const missing = [!sourceId ? source : null, !targetId ? target : null]
        .filter(Boolean)
        .join(", ");
      skipped.push(`relación "${source}" → "${target}" (no existe: ${missing})`);
      continue;
    }
    relationships.push({
      id: createId("rel"),
      source: sourceId,
      target: targetId,
      sourceHandle: null,
      targetHandle: null,
      label: label ?? "",
      description: "",
      style: style ?? "association",
    });
  }

  // En desarrollo las erratas del catálogo son fallos ruidosos, no silencios.
  if (skipped.length > 0 && import.meta.env.DEV) {
    throw new Error(
      `[examples] "${spec.id}" tiene referencias rotas:\n- ${skipped.join("\n- ")}`,
    );
  }

  const sheet: Sheet = {
    id: createId("sh"),
    name: spec.name,
    diagram: "usecase",
    elements: layoutExampleElements(elements, relationships),
    relationships,
    view: { level: "actors", scopeId: null },
  };

  return {
    id: createId("prj"),
    name: spec.name,
    description: spec.summary,
    sheets: [sheet],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Coloca el nivel raíz (actores y sistema) con el algoritmo por capas; los
 * casos de uso y pasos se posicionarán al hacer «auto layout» o al abrir la
 * vista correspondiente.
 */
function layoutExampleElements(
  elements: DiagramElement[],
  relationships: DiagramRelationship[],
): DiagramElement[] {
  const roots = elements.filter((element) => element.parentId === null);
  if (roots.length === 0) return elements;

  const firstLayer = roots
    .filter((element) => element.kind === "actor")
    .map((element) => element.id);

  const points = centerPositions(
    computeLayout(
      roots.map((element) => ({
        id: element.id,
        ...defaultNodeSize("usecase", element.kind),
        order: 0,
      })),
      relationships
        .filter(
          (relationship) =>
            roots.some((root) => root.id === relationship.source) &&
            roots.some((root) => root.id === relationship.target),
        )
        .map((relationship) => ({ source: relationship.source, target: relationship.target })),
      { firstLayer },
    ),
  );

  const byId = new Map(points);
  return elements.map((element) => {
    const point = element.parentId === null ? byId.get(element.id) : undefined;
    return point ? { ...element, x: point.x, y: point.y } : element;
  });
}
