export interface LayoutNode {
  id: string;
  width: number;
  height: number;
  /** Orden estable (posición vertical actual). */
  order: number;
}

export interface LayoutEdge {
  source: string;
  target: string;
}

export interface Point {
  x: number;
  y: number;
}

const GAP_X = 150;
const GAP_Y = 56;

/**
 * Distribución por capas (tipo Sugiyama simplificado):
 * 1. Se asigna una capa a cada nodo mediante el camino más largo desde las raíces.
 * 2. Se ordenan los nodos de cada capa por el baricentro de sus vecinos.
 * 3. Se reparten las coordenadas centrando el diagrama en el origen.
 *
 * Los ciclos se rompen ignorando las aristas de retroceso durante el cálculo.
 */
export function computeLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: { firstLayer?: string[] } = {},
): Map<string, Point> {
  const result = new Map<string, Point>();
  if (nodes.length === 0) return result;

  const ids = new Set(nodes.map((node) => node.id));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  const push = (map: Map<string, string[]>, key: string, value: string) => {
    const list = map.get(key);
    if (list) list.push(value);
    else map.set(key, [value]);
  };
  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target) || edge.source === edge.target) continue;
    push(outgoing, edge.source, edge.target);
    push(incoming, edge.target, edge.source);
  }

  // 1. Capas
  const layerOf = new Map<string, number>();
  const state = new Map<string, "visiting" | "done">();
  const visit = (id: string): number => {
    const cached = layerOf.get(id);
    if (cached !== undefined && state.get(id) === "done") return cached;
    if (state.get(id) === "visiting") return 0;
    state.set(id, "visiting");
    let layer = 0;
    for (const next of outgoing.get(id) ?? []) {
      if (state.get(next) === "visiting") continue;
      layer = Math.max(layer, visit(next) + 1);
    }
    state.set(id, "done");
    layerOf.set(id, layer);
    return layer;
  };
  for (const node of nodes) visit(node.id);

  const layers: string[][] = [];
  for (const node of nodes) {
    const layer = layerOf.get(node.id) ?? 0;
    (layers[layer] ?? (layers[layer] = [])).push(node.id);
  }

  const positionOf = new Map<string, number>();
  layers.forEach((layer) => layer.forEach((id, index) => positionOf.set(id, index)));

  // Orden estable: la primera capa prioriza personas, el resto por altura actual.
  const firstLayerPriority = new Map<string, number>();
  (options.firstLayer ?? []).forEach((id, index) => firstLayerPriority.set(id, index));
  layers[0]?.sort((a, b) => {
    const pa = firstLayerPriority.get(a) ?? Number.MAX_SAFE_INTEGER;
    const pb = firstLayerPriority.get(b) ?? Number.MAX_SAFE_INTEGER;
    if (pa !== pb) return pa - pb;
    const na = nodes.find((node) => node.id === a);
    const nb = nodes.find((node) => node.id === b);
    return (na?.order ?? 0) - (nb?.order ?? 0);
  });

  // 2. Baricentro
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (let pass = 0; pass < 6; pass += 1) {
    const down = pass % 2 === 0;
    const range = down
      ? layers.map((_, index) => index)
      : layers.map((_, index) => layers.length - 1 - index);
    for (const index of range) {
      const layer = layers[index];
      if (!layer || layer.length < 2) continue;
      const neighbors = down ? incoming : outgoing;
      layer.sort((a, b) => {
        const score = (id: string) => {
          const list = neighbors.get(id) ?? [];
          if (list.length === 0) return positionOf.get(id) ?? 0;
          const total = list.reduce(
            (sum, other) => sum + (positionOf.get(other) ?? 0) + (byId.has(other) ? 1 : 0),
            0,
          );
          return total / list.length;
        };
        const diff = score(a) - score(b);
        if (Math.abs(diff) > 0.0001) return diff;
        return (byId.get(a)?.order ?? 0) - (byId.get(b)?.order ?? 0);
      });
      layer.forEach((id, position) => positionOf.set(id, position));
    }
  }

  // 3. Coordenadas
  const layerWidths = layers.map((layer) =>
    Math.max(0, ...(layer ?? []).map((id) => byId.get(id)?.width ?? 0)),
  );
  const layerHeights = layers.map((layer) =>
    layer.reduce((total, id) => total + (byId.get(id)?.height ?? 0), 0) +
      Math.max(0, (layer?.length ?? 0) - 1) * GAP_Y,
  );

  let x = 0;
  const tallest = Math.max(...layerHeights, 0);
  layers.forEach((layer, index) => {
    const width = layerWidths[index];
    let y = (tallest - layerHeights[index]) / 2;
    for (const id of layer ?? []) {
      const node = byId.get(id);
      if (!node) continue;
      result.set(id, { x, y });
      y += node.height + GAP_Y;
    }
    x += width + GAP_X;
  });

  return result;
}

/** Desplaza un conjunto de posiciones para que su centro quede cerca del origen. */
export function centerPositions(points: Map<string, Point>): Map<string, Point> {
  if (points.size === 0) return points;
  let sumX = 0;
  let sumY = 0;
  for (const point of points.values()) {
    sumX += point.x;
    sumY += point.y;
  }
  const offsetX = sumX / points.size;
  const offsetY = sumY / points.size;
  const centered = new Map<string, Point>();
  for (const [id, point] of points) {
    centered.set(id, { x: Math.round(point.x - offsetX), y: Math.round(point.y - offsetY) });
  }
  return centered;
}
