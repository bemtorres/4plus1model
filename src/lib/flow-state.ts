import { elementNodeSize } from "./diagrams";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  boundaryBox,
  type BoundaryFlowNode,
  type DiagramFlowEdge,
  type ElementFlowNode,
  type FlowNode,
} from "./view";

/**
 * Puente entre el modelo y el estado interno de React Flow.
 *
 * React Flow reinicializa un nodo (y borra sus `handleBounds`) cuando recibe un
 * objeto nuevo sin `measured`, tal y como documenta su código interno. Para que
 * arrastrar un nodo no se rompa, aquí se conservan la identidad del objeto y sus
 * medidas, y sólo se reemplazan los campos que realmente cambian.
 */

function isBoundary(node: FlowNode): node is BoundaryFlowNode {
  return node.type === "boundary";
}

function sizeOf(node: FlowNode): { width: number; height: number } {
  return {
    width: node.measured?.width ?? NODE_WIDTH,
    height: node.measured?.height ?? NODE_HEIGHT,
  };
}

/**
 * `buildView` crea objetos `data` nuevos en cada pasada, así que comparamos por
 * contenido: si el elemento y su papel no han cambiado, el nodo no se toca.
 */
function sameData(prev: FlowNode, next: FlowNode): boolean {
  if (
    (prev.type === "element" && next.type === "element") ||
    (prev.type === "note" && next.type === "note")
  ) {
    return prev.data.element === next.data.element && prev.data.isDetail === next.data.isDetail;
  }
  if (prev.type === "boundary" && next.type === "boundary") {
    return (
      prev.data.title === next.data.title &&
      prev.data.subtitle === next.data.subtitle &&
      prev.data.elementId === next.data.elementId
    );
  }
  return false;
}

/** Recalcula el rectángulo de la frontera con las posiciones reales de sus hijos. */
export function withBoundaryGeometry(
  nodes: FlowNode[],
  detailIds: string[],
): FlowNode[] {
  const boundary = nodes.find(isBoundary);
  if (!boundary || detailIds.length === 0) return nodes;

  const children = nodes.filter(
    (node): node is ElementFlowNode => node.type === "element" && detailIds.includes(node.id),
  );
  const box = boundaryBox(
    children.map((node) => ({
      x: node.position.x,
      y: node.position.y,
      ...sizeOf(node),
    })),
  );
  if (!box) return nodes;

  const width = Number(boundary.style?.width ?? 0);
  const height = Number(boundary.style?.height ?? 0);
  if (
    box.x === boundary.position.x &&
    box.y === boundary.position.y &&
    box.width === width &&
    box.height === height
  ) {
    return nodes;
  }

  return nodes.map((node) =>
    node.id === boundary.id
      ? { ...node, position: { x: box.x, y: box.y }, style: { ...node.style, ...box } }
      : node,
  );
}

/**
 * Fusiona los nodos derivados del modelo con los que React Flow tiene en
 * memoria. Si nada cambió devuelve el mismo array, de modo que React Flow no
 * vuelve a adoptar los nodos (y no los vuelve a medir).
 */
export function mergeFlowNodes(
  current: FlowNode[],
  desired: FlowNode[],
  detailIds: string[],
): FlowNode[] {
  const previous = new Map(current.map((node) => [node.id, node]));
  let changed = desired.length !== current.length;

  const merged = desired.map((node) => {
    const prev = previous.get(node.id);
    if (!prev) {
      changed = true;
      return node;
    }
    if (prev.type !== node.type) {
      changed = true;
      return node;
    }

    // Mientras el nodo se arrastra manda la posición real del puntero.
    const dragging = prev.dragging === true && node.type !== "boundary";
    const position = dragging ? prev.position : node.position;

    const samePosition = prev.position.x === position.x && prev.position.y === position.y;
    const sameSelected = prev.selected === node.selected;
    const sameBox =
      prev.style?.width === node.style?.width && prev.style?.height === node.style?.height;

    if (samePosition && sameData(prev, node) && sameSelected && sameBox) {
      return prev;
    }

    changed = true;
    return {
      ...prev,
      ...node,
      position,
      // `measured` es lo que impide que React Flow reinicialice el nodo.
      measured: prev.measured,
    };
  });

  if (!changed) return current;
  return withBoundaryGeometry(merged, detailIds);
}

/** Equivalente a `mergeFlowNodes` para las aristas. */
export function mergeFlowEdges(
  current: DiagramFlowEdge[],
  desired: DiagramFlowEdge[],
): DiagramFlowEdge[] {
  if (desired.length === current.length) {
    let changed = false;
    const merged = desired.map((edge) => {
      const prev = current.find((item) => item.id === edge.id);
      if (
        prev &&
        prev.data?.relationship === edge.data?.relationship &&
        prev.selected === edge.selected &&
        prev.source === edge.source &&
        prev.target === edge.target &&
        prev.type === edge.type &&
        prev.style === edge.style &&
        prev.markerEnd === edge.markerEnd &&
        prev.markerStart === edge.markerStart
      ) {
        return prev;
      }
      changed = true;
      return edge;
    });
    if (!changed) return current;
    return merged;
  }
  return desired;
}
