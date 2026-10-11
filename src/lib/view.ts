import { MarkerType } from "@xyflow/react";
import type { CSSProperties } from "react";
import type { Edge, EdgeMarker, Node } from "@xyflow/react";
import {
  LEVELS,
  NODE_HEIGHT,
  NODE_WIDTH,
  defaultNodeSize,
  depthOfKind,
  isDrillable,
  levelMeta,
} from "./catalog";

export { NODE_HEIGHT, NODE_WIDTH };
import type {
  C4Element,
  C4Relationship,
  Level,
  Selection,
  Workspace,
} from "./types";

/** Tamaño de referencia usado para calcular separaciones y fronteras. */
const BOUNDARY_PADDING_X = 56;
const BOUNDARY_PADDING_TOP = 72;
const BOUNDARY_PADDING_BOTTOM = 40;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoxInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Rectángulo que envuelve a los elementos indicados, con el margen visual. */
export function boundaryBox(boxes: BoxInput[]): Box | null {
  if (boxes.length === 0) return null;
  const minX = Math.min(...boxes.map((box) => box.x)) - BOUNDARY_PADDING_X;
  const maxX = Math.max(...boxes.map((box) => box.x + box.width)) + BOUNDARY_PADDING_X;
  const minY = Math.min(...boxes.map((box) => box.y)) - BOUNDARY_PADDING_TOP;
  const maxY = Math.max(...boxes.map((box) => box.y + box.height)) + BOUNDARY_PADDING_BOTTOM;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export interface C4NodeData extends Record<string, unknown> {
  element: C4Element;
  /** `true` si el elemento pertenece al nivel/ámbito actual (no es contexto). */
  isDetail: boolean;
}

export interface BoundaryNodeData extends Record<string, unknown> {
  elementId: string;
  title: string;
  subtitle: string;
}

export type C4FlowNode = Node<C4NodeData, "c4">;
export type NoteFlowNode = Node<NoteNodeData, "note">;
export type BoundaryFlowNode = Node<BoundaryNodeData, "boundary">;
export type FlowNode = C4FlowNode | NoteFlowNode | BoundaryFlowNode;

export interface NoteNodeData extends Record<string, unknown> {
  element: C4Element;
  isDetail: boolean;
}

export interface C4EdgeData extends Record<string, unknown> {
  relationship: C4Relationship;
}

export type C4FlowEdge = Edge<C4EdgeData, "c4">;

export interface ViewResult {
  nodes: FlowNode[];
  edges: C4FlowEdge[];
  /** Elementos que pertenecen al ámbito actual (los "detalle"). */
  detailIds: string[];
  /** Elementos mostrados sólo como contexto externo. */
  contextIds: string[];
  scope: C4Element | null;
}

/* ------------------------------------------------------------------ */
/* Consultas sobre el modelo                                           */
/* ------------------------------------------------------------------ */

export function indexElements(workspace: Workspace): Map<string, C4Element> {
  return new Map(workspace.elements.map((element) => [element.id, element]));
}

export function childrenOf(workspace: Workspace, parentId: string | null): C4Element[] {
  return workspace.elements.filter((element) => element.parentId === parentId);
}

export function ancestorsOf(workspace: Workspace, element: C4Element): C4Element[] {
  const byId = indexElements(workspace);
  const chain: C4Element[] = [];
  let current = element.parentId ? byId.get(element.parentId) : undefined;
  while (current) {
    chain.push(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

export function depthOfElement(element: C4Element): number {
  return depthOfKind(element.kind);
}

/** Nivel al que se entra cuando se abre un elemento (undefined si no se puede). */
export function levelForElement(element: C4Element | undefined): Level | null {
  if (!element) return null;
  const depth = depthOfElement(element);
  const level = LEVELS.find((item) => item.scopeDepth === depth);
  return level ? level.id : null;
}

/**
 * Elementos que pueden actuar como ámbito para un nivel: los de la profundidad
 * correcta que además admiten contenido (personas y códigos quedan fuera).
 */
function scopeCandidates(workspace: Workspace, wantedDepth: number): C4Element[] {
  return workspace.elements.filter(
    (element) => depthOfElement(element) === wantedDepth && isDrillable(element.kind),
  );
}

/**
 * Devuelve el ámbito válido para el nivel pedido: el solicitado si sigue siendo
 * correcto, o el primer elemento navegable del nivel.
 */
export function resolveScopeId(
  workspace: Workspace,
  level: Level,
  preferredId?: string | null,
): string | null {
  if (level === "context") return null;
  const wantedDepth = levelMeta(level).scopeDepth;
  const byId = indexElements(workspace);
  if (preferredId) {
    const preferred = byId.get(preferredId);
    if (preferred && depthOfElement(preferred) === wantedDepth && isDrillable(preferred.kind)) {
      return preferredId;
    }
  }
  const candidates = scopeCandidates(workspace, wantedDepth);
  const withChildren = candidates.filter((candidate) =>
    workspace.elements.some((element) => element.parentId === candidate.id),
  );
  return (withChildren[0] ?? candidates[0])?.id ?? null;
}

/** Elementos navegables para el selector de ámbito. */
export function navigableElements(workspace: Workspace, level: Level): C4Element[] {
  if (level === "context") return [];
  return scopeCandidates(workspace, levelMeta(level).scopeDepth);
}

/* ------------------------------------------------------------------ */
/* Construcción de la vista                                            */
/* ------------------------------------------------------------------ */

/**
 * Sube un elemento hasta la profundidad del contexto actual, para que un
 * componente de otro contenedor se represente como su contenedor.
 */
function liftToDepth(workspace: Workspace, element: C4Element, targetDepth: number): C4Element {
  const byId = indexElements(workspace);
  let current = element;
  while (depthOfElement(current) > targetDepth && current.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

export function buildView(
  workspace: Workspace,
  level: Level,
  scopeId: string | null,
  selection: Selection,
): ViewResult {
  const byId = indexElements(workspace);
  const meta = levelMeta(level);
  const detailDepth = meta.scopeDepth + 1;
  const isContextLevel = level === "context";

  const detail = workspace.elements.filter((element) =>
    isContextLevel
      ? depthOfElement(element) === detailDepth
      : depthOfElement(element) === detailDepth &&
        (scopeId ? element.parentId === scopeId : element.parentId === null),
  );
  const detailIds = new Set(detail.map((element) => element.id));

  // Vecinos de un salto, elevado a la profundidad del contexto.
  const contextIds = new Set<string>();
  if (!isContextLevel && detail.length > 0) {
    for (const relationship of workspace.relationships) {
      const touchesSource = detailIds.has(relationship.source);
      const touchesTarget = detailIds.has(relationship.target);
      if (!touchesSource && !touchesTarget) continue;
      const otherId = touchesSource ? relationship.target : relationship.source;
      if (otherId === scopeId) continue;
      const other = byId.get(otherId);
      if (!other) continue;
      const lifted = liftToDepth(workspace, other, meta.scopeDepth);
      if (lifted.id === scopeId || detailIds.has(lifted.id)) continue;
      contextIds.add(lifted.id);
    }
  }

  const visibleIds = new Set<string>([...detailIds, ...contextIds]);

  // Las notas son anotaciones: flotan sobre el diagrama en cualquier nivel.
  for (const note of workspace.elements) {
    if (note.kind === "note") {
      visibleIds.add(note.id);
      detailIds.add(note.id);
    }
  }

  const boundaryNodes: BoundaryFlowNode[] = [];

  if (!isContextLevel && scopeId && detail.length > 0) {
    const scope = byId.get(scopeId);
    if (scope) {
      const box = boundaryBox(
        detail.map((element) => {
          const size = defaultNodeSize(element.kind);
          return { x: element.x, y: element.y, ...size };
        }),
      );
      if (box) {
        boundaryNodes.push({
          id: `boundary-${scope.id}`,
          type: "boundary",
          position: { x: box.x, y: box.y },
          data: {
            elementId: scope.id,
            title: scope.name,
            subtitle: scope.technology,
          },
          draggable: false,
          selectable: false,
          focusable: false,
          connectable: false,
          deletable: false,
          zIndex: -1,
          style: { width: box.width, height: box.height },
        });
      }
    }
  }

  const elementNodes: (C4FlowNode | NoteFlowNode)[] = [];
  for (const element of workspace.elements) {
    if (!visibleIds.has(element.id)) continue;
    const isSelected = selection?.type === "element" && selection.id === element.id;
    const shared = {
      id: element.id,
      position: { x: element.x, y: element.y },
      data: { element, isDetail: detailIds.has(element.id) },
      selected: isSelected,
      draggable: true,
      deletable: true,
    };
    elementNodes.push(
      element.kind === "note"
        ? { ...shared, type: "note", connectable: false }
        : { ...shared, type: "c4" },
    );
  }

  // React Flow pinta en el orden del array: los nodos de abajo van primero para
  // que el nodo de arriba (y su caja) tape cualquier elemento que se solape.
  elementNodes.sort((a, b) => b.position.y - a.position.y || b.position.x - a.position.x);
  const nodes: FlowNode[] = [...elementNodes, ...boundaryNodes];

  const edges: C4FlowEdge[] = [];
  for (const relationship of workspace.relationships) {
    if (relationship.source === scopeId || relationship.target === scopeId) continue;
    if (!visibleIds.has(relationship.source) || !visibleIds.has(relationship.target)) continue;
    if (!detailIds.has(relationship.source) && !detailIds.has(relationship.target)) continue;
    const isSelected = selection?.type === "relationship" && selection.id === relationship.id;
    edges.push({
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      sourceHandle: relationship.sourceHandle ?? undefined,
      targetHandle: relationship.targetHandle ?? undefined,
      type: "c4",
      data: { relationship },
      selected: isSelected,
      ...edgeAppearance(relationship, isSelected),
    });
  }

  return {
    nodes,
    edges,
    detailIds: [...detailIds],
    contextIds: [...contextIds],
    scope: scopeId ? (byId.get(scopeId) ?? null) : null,
  };
}

export function edgeStroke(selected: boolean, color?: string | null): string {
  if (color) return color;
  return selected ? "var(--accent)" : "var(--muted)";
}

const THICKNESSES: Record<string, CSSProperties> = {
  idle: { strokeWidth: 1.5 },
  active: { strokeWidth: 2.25 },
  idleAsync: { strokeWidth: 1.5, strokeDasharray: "7 5" },
  activeAsync: { strokeWidth: 2.25, strokeDasharray: "7 5" },
};

/** Estilo de la arista: color, grosor, asincronía y selección. */
export function edgeAppearance(
  relationship: C4Relationship,
  selected: boolean,
): Pick<C4FlowEdge, "style" | "markerEnd" | "markerStart"> {
  const dashed = relationship.style === "async";
  const base = dashed
    ? selected
      ? THICKNESSES.activeAsync
      : THICKNESSES.idleAsync
    : selected
      ? THICKNESSES.active
      : THICKNESSES.idle;
  const stroke = edgeStroke(selected, relationship.color);
  const width = typeof relationship.thickness === "number" ? relationship.thickness : undefined;
  const style: CSSProperties = { ...base, stroke };
  if (width) style.strokeWidth = width;
  const marker: EdgeMarker = {
    type: MarkerType.ArrowClosed,
    color: stroke,
    width: 16,
    height: 16,
  };
  return {
    style,
    markerEnd: marker,
    markerStart: relationship.style === "bi" ? { ...marker } : undefined,
  };
}

