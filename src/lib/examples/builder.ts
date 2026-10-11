import { defaultNodeSize } from "@/lib/catalog";
import { diagramScopes } from "@/lib/exporters";
import { centerPositions, computeLayout } from "@/lib/layout";
import { createId } from "@/lib/id";
import type {
  C4Element,
  C4Relationship,
  ElementKind,
  RelationshipStyle,
  Workspace,
} from "@/lib/types";
import { buildView } from "@/lib/view";

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
 * Especificación de un contenedor: `[nombre, tipo, tecnología, descripción]`.
 *
 * `tipo` sólo puede ser `container`, `database` o `queue` (los tres tipos
 * admitidos en el nivel 2). El nombre debe ser único en todo el ejemplo.
 */
export type ContainerSpec = [string, ElementKind, string, string];

/**
 * Especificación de una relación: `[origen, destino, etiqueta, tecnología?, estilo?]`.
 *
 * - `origen` / `destino` deben ser nombres declarados en `people`,
 *   `externalSystems`, `containers` o `componentSets`. El builder los
 *   resuelve a ids internos; si no existen, se ignora la relación (y en
 *   desarrollo se lanza un error, para no ocultar erratas).
 * - `tecnología` es el protocolo o mecanismo (HTTPS, gRPC, SQL, Kafka…).
 * - `estilo` es `"sync"` (por defecto), `"async"` (línea discontinua, para
 *   brokers y notificaciones) o `"bi"` (bidireccional).
 */
export type RelationSpec = [string, string, string, string?, RelationshipStyle?];

/**
 * Componentes de un contenedor (nivel 3). `container` debe coincidir con el
 * nombre de un contenedor declarado en `containers` y de tipo `container`
 * (las bases de datos y colas no se abren a nivel de componentes).
 */
export interface ComponentSet {
  /** Nombre del contenedor padre (debe existir en `containers`). */
  container: string;
  /** `[nombre, tecnología, descripción]` de cada componente. */
  components: [string, string, string][];
}

/**
 * Especificación declarativa de un caso de estudio del catálogo.
 *
 * Un ejemplo describe la arquitectura completa en sus tres primeros niveles
 * C4 y el builder genera el workspace con los cuatro (contexto, contenedores,
 * componentes y código) colocados automáticamente.
 */
export interface ExampleSpec {
  /** Slug ASCII en minúsculas y guiones: forma la URL y el nombre de imagen. */
  id: string;
  name: string;
  category: CategoryId;
  /** Referencia conceptual (no afiliada) que inspira el ejemplo. */
  reference: string;
  summary: string;
  /** Qué se ve bien en los diagramas C4 de este ejemplo. */
  focus: string;
  difficulty: Difficulty;
  /** `[nombre, descripción]` — sin tecnología (son actores, no software). */
  people: [string, string][];
  /** `[nombre, descripción, tecnología?]` — sistemas fuera del perímetro. */
  externalSystems?: [string, string, string?][];
  containers: ContainerSpec[];
  componentSets?: ComponentSet[];
  relations: RelationSpec[];
  /** Imagen en `public/examples` (opcional, se puede añadir después). */
  image?: string;
}

/**
 * Convierte una especificación en un workspace C4 completo: crea los
 * elementos jerárquicos (personas y sistemas en contexto, contenedores bajo
 * el sistema, componentes bajo su contenedor), resuelve las relaciones por
 * nombre y coloca cada nivel con el algoritmo de distribución por capas.
 *
 * Los ids se generan en cada construcción, por lo que la función es pura en
 * cuanto a contenido: dos llamadas producen el mismo modelo con otros ids.
 */
export function buildExampleWorkspace(spec: ExampleSpec): Workspace {
  const elements: C4Element[] = [];
  const relationships: C4Relationship[] = [];
  /** Nombre → id. El orden de inserción define la precedencia en colisiones. */
  const idByName = new Map<string, string>();
  const skipped: string[] = [];

  const push = (
    name: string,
    kind: ElementKind,
    description: string,
    technology: string,
    parentId: string | null,
  ) => {
    const id = createId("ex");
    idByName.set(name, id);
    elements.push({ id, kind, name, description, technology, tags: [], parentId, x: 0, y: 0 });
    return id;
  };

  // L1 · contexto: actores y el sistema propio (siempre primero, es el ámbito).
  for (const [name, description] of spec.people) push(name, "person", description, "", null);

  const systemId = push(spec.name, "softwareSystem", spec.summary, "", null);

  for (const [name, description, technology] of spec.externalSystems ?? []) {
    push(name, "externalSystem", description, technology ?? "", null);
  }

  // L2 · contenedores: todos cuelgan del sistema propio.
  for (const [name, kind, technology, description] of spec.containers) {
    push(name, kind, description, technology, systemId);
  }

  // L3 · componentes: cuelgan del contenedor declarado en cada conjunto.
  for (const set of spec.componentSets ?? []) {
    const parent = idByName.get(set.container);
    if (!parent) {
      skipped.push(`componentSets → contenedor inexistente "${set.container}"`);
      continue;
    }
    for (const [name, technology, description] of set.components) {
      push(name, "component", description, technology, parent);
    }
  }

  // Relaciones: se resuelven por nombre en cualquier nivel.
  for (const [source, target, label, technology, style] of spec.relations) {
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
      label,
      technology: technology ?? "",
      description: "",
      style: style ?? "sync",
    });
  }

  // En desarrollo las erratas del catálogo son fallos ruidosos, no silencios.
  if (skipped.length > 0 && import.meta.env.DEV) {
    throw new Error(
      `[examples] "${spec.id}" tiene referencias rotas:\n- ${skipped.join("\n- ")}`,
    );
  }

  const workspace: Workspace = {
    id: createId("ws"),
    name: spec.name,
    description: spec.summary,
    elements,
    relationships,
    updatedAt: new Date().toISOString(),
  };

  return layoutExample(workspace);
}

/**
 * Coloca cada nivel con el algoritmo por capas. Cada elemento es «detalle» en
 * un único nivel (por su profundidad), así que se posiciona una sola vez: la
 * primera vista que lo incluya fija sus coordenadas para el resto de niveles.
 */
export function layoutExample(workspace: Workspace): Workspace {
  const positions = new Map<string, { x: number; y: number }>();

  for (const { level, scopeId } of diagramScopes(workspace)) {
    const view = buildView(workspace, level, scopeId, null);
    const nodes = view.nodes.filter((node) => node.type === "c4");
    if (nodes.length === 0) continue;
    // Las personas arrancan en la primera capa para que queden a la izquierda.
    const people = nodes
      .filter((node) => node.data.element.kind === "person")
      .map((node) => node.id);
    const points = centerPositions(
      computeLayout(
        nodes.map((node) => ({
          id: node.id,
          ...defaultNodeSize(node.data.element.kind),
          order: 0,
        })),
        view.edges.map((edge) => ({ source: edge.source, target: edge.target })),
        { firstLayer: people },
      ),
    );
    for (const [id, point] of points) {
      if (!positions.has(id)) positions.set(id, point);
    }
  }

  return {
    ...workspace,
    elements: workspace.elements.map((element) => {
      const point = positions.get(element.id);
      return point ? { ...element, x: point.x, y: point.y } : element;
    }),
  };
}
