import { MarkerType } from "@xyflow/react";
import type { CSSProperties } from "react";
import type { Edge, EdgeMarker, Node } from "@xyflow/react";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  defaultNodeSize,
  depthOfKind,
  diagramDef,
  elementNodeSize,
  isDrillable,
  levelMeta,
} from "./diagrams";
import type {
  DiagramElement,
  DiagramId,
  DiagramRelationship,
  ElementKind,
  Level,
  Selection,
  Sheet,
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

export interface DiagramNodeData extends Record<string, unknown> {
  element: DiagramElement;
  /** `true` si el elemento pertenece al nivel/ámbito actual (no es contexto). */
  isDetail: boolean;
}

export interface BoundaryNodeData extends Record<string, unknown> {
  elementId: string;
  title: string;
  subtitle: string;
}

export type ElementFlowNode = Node<DiagramNodeData, "element">;
export type NoteFlowNode = Node<DiagramNodeData, "note">;
export type BoundaryFlowNode = Node<BoundaryNodeData, "boundary">;
export type FlowNode = ElementFlowNode | NoteFlowNode | BoundaryFlowNode;

export interface DiagramEdgeData extends Record<string, unknown> {
  relationship: DiagramRelationship;
}

export type DiagramFlowEdge = Edge<DiagramEdgeData, "element">;

export interface ViewResult {
  nodes: FlowNode[];
  edges: DiagramFlowEdge[];
  /** Elementos que pertenecen al ámbito actual (los "detalle"). */
  detailIds: string[];
  /** Elementos mostrados sólo como contexto externo. */
  contextIds: string[];
  scope: DiagramElement | null;
}

/* ------------------------------------------------------------------ */
/* Consultas sobre el modelo                                           */
/* ------------------------------------------------------------------ */

export function indexElements(sheet: Sheet): Map<string, DiagramElement> {
  return new Map(sheet.elements.map((element) => [element.id, element]));
}

export function childrenOf(sheet: Sheet, parentId: string | null): DiagramElement[] {
  return sheet.elements.filter((element) => element.parentId === parentId);
}

export function ancestorsOf(sheet: Sheet, element: DiagramElement): DiagramElement[] {
  const byId = indexElements(sheet);
  const chain: DiagramElement[] = [];
  let current = element.parentId ? byId.get(element.parentId) : undefined;
  while (current) {
    chain.push(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

export function depthOfElement(diagram: DiagramId, element: DiagramElement): number {
  return depthOfKind(diagram, element.kind);
}

/** Nivel al que se entra cuando se abre un elemento (null si no se puede). */
export function levelForElement(
  diagram: DiagramId,
  element: DiagramElement | undefined,
): Level | null {
  if (!element) return null;
  const depth = depthOfElement(diagram, element);
  const found = diagramDef(diagram).levels.find((item) => item.scopeDepth === depth);
  return found ? found.id : null;
}

/**
 * Elementos que pueden actuar como ámbito para un nivel: los de la profundidad
 * correcta que además admiten contenido.
 */
function scopeCandidates(
  diagram: DiagramId,
  sheet: Sheet,
  wantedDepth: number,
): DiagramElement[] {
  return sheet.elements.filter(
    (element) => depthOfElement(diagram, element) === wantedDepth && isDrillable(diagram, element.kind),
  );
}

/**
 * Devuelve el ámbito válido para el nivel pedido: el solicitado si sigue siendo
 * correcto, o el primer elemento navegable del nivel.
 */
export function resolveScopeId(
  diagram: DiagramId,
  sheet: Sheet,
  level: Level,
  preferredId?: string | null,
): string | null {
  const wantedDepth = levelMeta(diagram, level).scopeDepth;
  if (wantedDepth < 0) return null;
  const byId = indexElements(sheet);
  if (preferredId) {
    const preferred = byId.get(preferredId);
    if (
      preferred &&
      depthOfElement(diagram, preferred) === wantedDepth &&
      isDrillable(diagram, preferred.kind)
    ) {
      return preferredId;
    }
  }
  const candidates = scopeCandidates(diagram, sheet, wantedDepth);
  const withChildren = candidates.filter((candidate) =>
    sheet.elements.some((element) => element.parentId === candidate.id),
  );
  return (withChildren[0] ?? candidates[0])?.id ?? null;
}

/** Elementos navegables para el selector de ámbito. */
export function navigableElements(
  diagram: DiagramId,
  sheet: Sheet,
  level: Level,
): DiagramElement[] {
  const wantedDepth = levelMeta(diagram, level).scopeDepth;
  if (wantedDepth < 0) return [];
  return scopeCandidates(diagram, sheet, wantedDepth);
}

/* ------------------------------------------------------------------ */
/* Construcción de la vista                                            */
/* ------------------------------------------------------------------ */

/**
 * Sube un elemento hasta la profundidad del contexto actual, para que un
 * descendiente de otro ámbito se represente como su ancestro visible.
 */
function liftToDepth(
  diagram: DiagramId,
  sheet: Sheet,
  element: DiagramElement,
  targetDepth: number,
): DiagramElement {
  const byId = indexElements(sheet);
  let current = element;
  while (depthOfElement(diagram, current) > targetDepth && current.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

/**
 * Elemento visible más próximo a un extremo de una relación: el propio si está
 * visible, o su ancestro visible más cercano.
 */
function nearestVisible(
  byId: Map<string, DiagramElement>,
  id: string,
  visibleIds: Set<string>,
): string | null {
  let current = byId.get(id);
  while (current) {
    if (visibleIds.has(current.id)) return current.id;
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return null;
}

/** Orden estable de los pasos por `order` (los vacíos van al final). */
function sortedSteps(steps: DiagramElement[]): DiagramElement[] {
  return steps
    .map((element, index) => ({ element, index }))
    .sort((a, b) => {
      const orderA = a.element.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.element.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.index - b.index;
    })
    .map((entry) => entry.element);
}

export function buildView(
  sheet: Sheet,
  level: Level,
  scopeId: string | null,
  selection: Selection,
): ViewResult {
  const diagram = sheet.diagram;
  const def = diagramDef(diagram);
  const byId = indexElements(sheet);
  const meta = levelMeta(diagram, level);
  const detailDepth = meta.scopeDepth + 1;
  const isRootLevel = meta.scopeDepth < 0;

  const detail = sheet.elements.filter((element) =>
    isRootLevel
      ? depthOfElement(diagram, element) === 0 && element.parentId === null
      : depthOfElement(diagram, element) === detailDepth &&
        (scopeId ? element.parentId === scopeId : element.parentId === null),
  );
  const detailIds = new Set(detail.map((element) => element.id));

  // Vecinos de un salto, elevado a la profundidad del contexto.
  const contextIds = new Set<string>();
  if (!isRootLevel && detail.length > 0) {
    const ownerOf = (id: string): string | null => {
      let current = byId.get(id);
      while (current) {
        if (detailIds.has(current.id)) return current.id;
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
      return null;
    };
    for (const relationship of sheet.relationships) {
      const sourceOwner = ownerOf(relationship.source);
      const targetOwner = ownerOf(relationship.target);
      if (!sourceOwner && !targetOwner) continue;
      const otherId = sourceOwner ? relationship.target : relationship.source;
      if (otherId === scopeId) continue;
      const other = byId.get(otherId);
      if (!other) continue;
      const lifted = liftToDepth(diagram, sheet, other, meta.scopeDepth);
      if (lifted.id === scopeId || detailIds.has(lifted.id)) continue;
      contextIds.add(lifted.id);
    }

    // `showAllContext`: el contexto de ese nivel se muestra entero, aunque
    // todavía no haya relaciones (p. ej. todos los actores del sistema).
    if (def.flags?.showAllContext) {
      for (const element of sheet.elements) {
        if (element.id === scopeId) continue;
        if (depthOfElement(diagram, element) !== meta.scopeDepth) continue;
        if (detailIds.has(element.id)) continue;
        contextIds.add(element.id);
      }
    }
  }

  const visibleIds = new Set<string>([...detailIds, ...contextIds]);

  // Las notas son anotaciones: flotan sobre el diagrama en cualquier nivel.
  for (const note of sheet.elements) {
    if (note.kind === "note") {
      visibleIds.add(note.id);
      detailIds.add(note.id);
    }
  }

  const boundaryNodes: BoundaryFlowNode[] = [];

  if (!isRootLevel && scopeId && detail.length > 0) {
    const scope = byId.get(scopeId);
    if (scope) {
      const box = boundaryBox(
        detail.map((element) => {
          const size = elementNodeSize(diagram, element);
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
            subtitle: "",
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

  const elementNodes: (ElementFlowNode | NoteFlowNode)[] = [];
  for (const element of sheet.elements) {
    if (!visibleIds.has(element.id)) continue;
    const isSelected = selection?.type === "element" && selection.id === element.id;
    const isResizable = element.width != null || element.kind === "system";
    const shared = {
      id: element.id,
      position: { x: element.x, y: element.y },
      data: { element, isDetail: detailIds.has(element.id) },
      selected: isSelected,
      draggable: true,
      deletable: true,
      // El sistema (rectángulo del escenario) fija ancho/alto en el nodo de RF.
      ...(isResizable
        ? { style: { ...elementNodeSize(diagram, element) } }
        : {}),
    };
    elementNodes.push(
      element.kind === "note"
        ? { ...shared, type: "note", connectable: false }
        : { ...shared, type: "element" },
    );
  }

  // React Flow pinta en el orden del array: los nodos de abajo van primero.
  elementNodes.sort((a, b) => b.position.y - a.position.y || b.position.x - a.position.x);
  const nodes: FlowNode[] = [...elementNodes, ...boundaryNodes];

  const edges: DiagramFlowEdge[] = [];
  const drawnPairs = new Set<string>();
  const addEdge = (relationship: DiagramRelationship) => {
    const source = nearestVisible(byId, relationship.source, visibleIds);
    const target = nearestVisible(byId, relationship.target, visibleIds);
    if (!source || !target) return;
    if (source === scopeId || target === scopeId) return;
    if (source === target) return;
    if (!detailIds.has(source) && !detailIds.has(target)) return;
    const pair = JSON.stringify([source, target]);
    if (drawnPairs.has(pair)) return;
    drawnPairs.add(pair);
    const isSelected = selection?.type === "relationship" && selection.id === relationship.id;
    edges.push({
      id: relationship.id,
      source,
      target,
      sourceHandle: relationship.sourceHandle ?? undefined,
      targetHandle: relationship.targetHandle ?? undefined,
      type: "element",
      data: { relationship },
      selected: isSelected,
      ...edgeAppearance(relationship, isSelected),
    });
  };

  for (const relationship of sheet.relationships) {
    addEdge(relationship);
  }

  // `autoChain`: los pasos se encadenan automáticamente por `order`, sin
  // cablear relaciones a mano (las manuales ya dibujadas no se duplican).
  if (def.flags?.autoChain) {
    const steps = sortedSteps(detail.filter((element) => element.kind === "step"));
    for (let index = 0; index < steps.length - 1; index += 1) {
      const source = steps[index];
      const target = steps[index + 1];
      addEdge({
        id: `auto-${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        sourceHandle: null,
        targetHandle: null,
        label: "",
        description: "",
        style: "association",
      });
    }
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
  idleDashed: { strokeWidth: 1.5, strokeDasharray: "7 5" },
  activeDashed: { strokeWidth: 2.25, strokeDasharray: "7 5" },
};

/** Relaciones dibujadas con línea discontinua («include» y «extend»). */
export function isDashedStyle(style: DiagramRelationship["style"]): boolean {
  return style === "include" || style === "extend";
}

/**
 * Etiqueta efectiva de una arista: si es «include» o «extend» y el usuario no
 * escribió nada, se muestra el estereotipo entre guillemets.
 */
export function effectiveEdgeLabel(relationship: DiagramRelationship): string {
  const label = relationship.label.trim();
  if (label) return label;
  if (relationship.style === "include" || relationship.style === "extend") {
    return `«${relationship.style}»`;
  }
  return "";
}

/**
 * Marcador hueco (triángulo abierto) para generalizaciones UML.
 * Se define una sola vez en el lienzo (véase Canvas.tsx).
 */
export const UML_GENERALIZATION_MARKER = "url(#uml-generalization)";

/**
 * Estilo de la arista: color, grosor, discontinuidad y selección.
 *
 * UML clásico de casos de uso:
 * - association: línea sólida sin punta.
 * - include/extend: línea discontinua con punta abierta («...»).
 * - generalization: línea sólida con triángulo hueco.
 */
export function edgeAppearance(
  relationship: DiagramRelationship,
  selected: boolean,
): Pick<DiagramFlowEdge, "style" | "markerEnd" | "markerStart"> {
  const dashed = isDashedStyle(relationship.style);
  const base = dashed
    ? selected
      ? THICKNESSES.activeDashed
      : THICKNESSES.idleDashed
    : selected
      ? THICKNESSES.active
      : THICKNESSES.idle;
  const stroke = edgeStroke(selected, relationship.color);
  const width = typeof relationship.thickness === "number" ? relationship.thickness : undefined;
  const style: CSSProperties = { ...base, stroke };
  if (width) style.strokeWidth = width;

  let markerEnd: EdgeMarker | string | undefined;
  if (relationship.style === "association") {
    markerEnd = undefined;
  } else if (relationship.style === "generalization") {
    markerEnd = UML_GENERALIZATION_MARKER;
  } else {
    // include / extend: punta abierta en V
    markerEnd = {
      type: MarkerType.Arrow,
      color: stroke,
      width: 14,
      height: 14,
    };
  }

  return {
    style,
    markerEnd,
    markerStart: undefined,
  };
}

export { NODE_HEIGHT, NODE_WIDTH };
