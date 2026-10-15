import type {
  DiagramElement,
  DiagramId,
  ElementKind,
  IconName,
  Level,
  RelationshipStyle,
} from "../types";
import { USECASE_DIAGRAM } from "./usecase";
import type { DiagramDef, KindMeta, LevelMeta, NodeShape } from "./types";

export type { DiagramDef, KindMeta, LevelMeta, NodeShape };
export { NODE_HEIGHT, NODE_WIDTH } from "./types";
import { NODE_HEIGHT, NODE_WIDTH } from "./types";

/** Registro de diagramas disponibles. El resto llegará en fases posteriores. */
/** Catálogo universal de metadatos para formas generales de Draw.io y 4+1. */
export const GENERAL_KINDS: Record<ElementKind, KindMeta> = {
  // Formas generales
  rectangle: { kind: "rectangle", label: "Rectángulo", stereotype: "Rectángulo", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "rectangle", icon: "box", drillable: false, size: { width: 160, height: 90 } },
  roundedRect: { kind: "roundedRect", label: "Rect. redondeado", stereotype: "Rect. redondeado", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "12px", shape: "roundedRect", icon: "box", drillable: false, size: { width: 160, height: 90 } },
  text: { kind: "text", label: "Texto", stereotype: "", level: "actors", depth: 0, bg: "transparent", border: "transparent", fg: "#0f172a", stereo: "transparent", radius: "0", shape: "text", icon: "file", drillable: false, size: { width: 140, height: 40 } },
  heading: { kind: "heading", label: "Encabezado", stereotype: "", level: "actors", depth: 0, bg: "transparent", border: "transparent", fg: "#0f172a", stereo: "transparent", radius: "0", shape: "heading", icon: "file", drillable: false, size: { width: 220, height: 48 } },
  ellipse: { kind: "ellipse", label: "Elipse", stereotype: "Elipse", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "9999px", shape: "ellipse", icon: "target", drillable: false, size: { width: 160, height: 90 } },
  square: { kind: "square", label: "Cuadrado", stereotype: "Cuadrado", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "rectangle", icon: "box", drillable: false, size: { width: 110, height: 110 } },
  circle: { kind: "circle", label: "Círculo", stereotype: "Círculo", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "9999px", shape: "ellipse", icon: "target", drillable: false, size: { width: 110, height: 110 } },
  process: { kind: "process", label: "Proceso", stereotype: "Proceso", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "process", icon: "settings", drillable: false, size: { width: 170, height: 90 } },
  diamond: { kind: "diamond", label: "Rombo", stereotype: "Decisión", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "diamond", icon: "target", drillable: false, size: { width: 140, height: 110 } },
  parallelogram: { kind: "parallelogram", label: "Paralelogramo", stereotype: "Datos", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "parallelogram", icon: "box", drillable: false, size: { width: 160, height: 80 } },
  hexagon: { kind: "hexagon", label: "Hexágono", stereotype: "Hexágono", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "hexagon", icon: "box", drillable: false, size: { width: 160, height: 90 } },
  triangle: { kind: "triangle", label: "Triángulo", stereotype: "Triángulo", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "triangle", icon: "arrow-right", drillable: false, size: { width: 130, height: 110 } },
  cylinder: { kind: "cylinder", label: "Cilindro", stereotype: "Base de datos", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "cylinder", icon: "database", drillable: false, size: { width: 140, height: 110 } },
  cloud: { kind: "cloud", label: "Nube", stereotype: "Nube", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "cloud", icon: "cloud", drillable: false, size: { width: 170, height: 100 } },
  document: { kind: "document", label: "Documento", stereotype: "Documento", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "document", icon: "file", drillable: false, size: { width: 150, height: 95 } },
  table: { kind: "table", label: "Tabla", stereotype: "Tabla", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "table", icon: "grid", drillable: false, size: { width: 180, height: 120 } },
  cube: { kind: "cube", label: "Cubo 3D", stereotype: "Nodo 3D", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "cube", icon: "cube", drillable: false, size: { width: 140, height: 120 } },
  trapezoid: { kind: "trapezoid", label: "Trapecio", stereotype: "Operación", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "trapezoid", icon: "box", drillable: false, size: { width: 160, height: 80 } },
  callout: { kind: "callout", label: "Bocadillo", stereotype: "Anotación", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "8px", shape: "callout", icon: "file", drillable: false, size: { width: 160, height: 90 } },
  window: { kind: "window", label: "Ventana", stereotype: "Ventana", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "6px", shape: "window", icon: "box", drillable: false, size: { width: 220, height: 140 } },
  folder: { kind: "folder", label: "Carpeta", stereotype: "Carpeta", level: "actors", depth: 0, bg: "#ffffff", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "4px", shape: "folder", icon: "folder", drillable: false, size: { width: 170, height: 100 } },
  arrowRight: { kind: "arrowRight", label: "Flecha ancha", stereotype: "Transición", level: "actors", depth: 0, bg: "#f1f5f9", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "arrowRight", icon: "arrow-right", drillable: false, size: { width: 140, height: 60 } },
  note: { kind: "note", label: "Nota", stereotype: "Nota", level: "actors", depth: 0, bg: "#fef9c3", border: "#ca8a04", fg: "#713f12", stereo: "#a16207", radius: "0", shape: "note", icon: "file", drillable: false, size: { width: 170, height: 90 } },
  actor: { kind: "actor", label: "Actor", stereotype: "Actor", level: "actors", depth: 0, bg: "transparent", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "person", icon: "user", drillable: false, size: { width: 120, height: 150 }, firstLayer: true },
  system: { kind: "system", label: "Sistema", stereotype: "Sistema", level: "actors", depth: 0, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "system", icon: "cube", drillable: true, size: { width: 480, height: 360 } },
  useCase: { kind: "useCase", label: "Caso de uso", stereotype: "Caso de uso", level: "usecases", depth: 1, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "24px", shape: "ellipse", icon: "target", drillable: true, size: { width: 220, height: 96 } },
  step: { kind: "step", label: "Paso", stereotype: "Paso", level: "steps", depth: 2, bg: "#f1f5f9", border: "#334155", fg: "#0f172a", stereo: "#64748b", radius: "8px", shape: "step", icon: "arrow-right", drillable: false, size: { width: 260, height: 64 } },
  // 4+1 Vistas
  class: { kind: "class", label: "Clase UML", stereotype: "Class", level: "actors", depth: 0, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "classBox", icon: "code", drillable: false, size: { width: 190, height: 130 } },
  interface: { kind: "interface", label: "Interfaz UML", stereotype: "Interface", level: "actors", depth: 0, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "classBox", icon: "code", drillable: false, size: { width: 190, height: 120 } },
  subsystem: { kind: "subsystem", label: "Subsistema", stereotype: "Subsistema", level: "actors", depth: 0, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "system", icon: "blocks", drillable: false, size: { width: 280, height: 180 } },
  domainEntity: { kind: "domainEntity", label: "Entidad Dominio", stereotype: "Entity", level: "actors", depth: 0, bg: "#f0fdf4", border: "#16a34a", fg: "#14532d", stereo: "#15803d", radius: "4px", shape: "classBox", icon: "box", drillable: false, size: { width: 190, height: 120 } },
  thread: { kind: "thread", label: "Hilo (Thread)", stereotype: "Hilo", level: "actors", depth: 0, bg: "#eff6ff", border: "#2563eb", fg: "#1e3a8a", stereo: "#3b82f6", radius: "8px", shape: "roundedRect", icon: "clock", drillable: false, size: { width: 170, height: 75 } },
  queue: { kind: "queue", label: "Cola / Queue", stereotype: "Cola de mensajes", level: "actors", depth: 0, bg: "#faf5ff", border: "#9333ea", fg: "#581c87", stereo: "#a855f7", radius: "0", shape: "queue", icon: "queue", drillable: false, size: { width: 180, height: 75 } },
  eventStream: { kind: "eventStream", label: "Event Stream", stereotype: "Stream", level: "actors", depth: 0, bg: "#fdf4ff", border: "#c026d3", fg: "#701a75", stereo: "#d946ef", radius: "8px", shape: "roundedRect", icon: "sparkles", drillable: false, size: { width: 180, height: 75 } },
  component: { kind: "component", label: "Componente", stereotype: "Componente", level: "actors", depth: 0, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "componentBox", icon: "box", drillable: false, size: { width: 180, height: 95 } },
  module: { kind: "module", label: "Módulo", stereotype: "Módulo", level: "actors", depth: 0, bg: "#ffffff", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "4px", shape: "folder", icon: "folder", drillable: false, size: { width: 180, height: 100 } },
  layer: { kind: "layer", label: "Capa / Layer", stereotype: "Capa", level: "actors", depth: 0, bg: "#f8fafc", border: "#64748b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "rectangle", icon: "layers", drillable: false, size: { width: 340, height: 100 } },
  node: { kind: "node", label: "Nodo / Servidor", stereotype: "Servidor", level: "actors", depth: 0, bg: "#f8fafc", border: "#1e293b", fg: "#0f172a", stereo: "#64748b", radius: "0", shape: "cube", icon: "server", drillable: false, size: { width: 170, height: 120 } },
  virtualMachine: { kind: "virtualMachine", label: "Máquina Virtual", stereotype: "VM", level: "actors", depth: 0, bg: "#f8fafc", border: "#0284c7", fg: "#0c4a6e", stereo: "#0284c7", radius: "4px", shape: "cube", icon: "server", drillable: false, size: { width: 170, height: 120 } },
  container: { kind: "container", label: "Contenedor", stereotype: "Container", level: "actors", depth: 0, bg: "#eff6ff", border: "#3b82f6", fg: "#1e3a8a", stereo: "#3b82f6", radius: "4px", shape: "roundedRect", icon: "box", drillable: false, size: { width: 170, height: 85 } },
  loadBalancer: { kind: "loadBalancer", label: "Balanceador", stereotype: "Load Balancer", level: "actors", depth: 0, bg: "#fef3c7", border: "#d97706", fg: "#78350f", stereo: "#b45309", radius: "8px", shape: "diamond", icon: "target", drillable: false, size: { width: 140, height: 95 } },
  networkZone: { kind: "networkZone", label: "Zona / Subred", stereotype: "VPC / Subred", level: "actors", depth: 0, bg: "#f8fafc", border: "#94a3b8", fg: "#334155", stereo: "#64748b", radius: "2px", shape: "system", icon: "globe", drillable: false, size: { width: 440, height: 300 } },
};

/** Registro de diagramas disponibles. */
export const DIAGRAMS: Record<DiagramId, DiagramDef> = {
  usecase: USECASE_DIAGRAM,
  logical: {
    ...USECASE_DIAGRAM,
    id: "logical",
    label: "Lógica",
    short: "LOG",
    description: "Vista de clases, entidades de dominio y contratos",
  },
  process: {
    ...USECASE_DIAGRAM,
    id: "process",
    label: "Procesos",
    short: "PROC",
    description: "Vista de procesos, hilos, colas y concurrencia",
  },
  development: {
    ...USECASE_DIAGRAM,
    id: "development",
    label: "Desarrollo",
    short: "DEV",
    description: "Vista de componentes, módulos y capas de software",
  },
  physical: {
    ...USECASE_DIAGRAM,
    id: "physical",
    label: "Física",
    short: "PHYS",
    description: "Vista de servidores, redes, nodos y despliegue",
  },
};

/** Orden del menú «+» de nuevas hojas. */
export const DIAGRAM_LIST: DiagramDef[] = [
  DIAGRAMS.usecase,
  DIAGRAMS.logical,
  DIAGRAMS.process,
  DIAGRAMS.development,
  DIAGRAMS.physical,
];

export function diagramDef(id: DiagramId): DiagramDef {
  return DIAGRAMS[id] ?? USECASE_DIAGRAM;
}

export function levelsOf(id: DiagramId): LevelMeta[] {
  return diagramDef(id).levels;
}

export function kindsOf(id: DiagramId, level: Level): ElementKind[] {
  return levelMeta(id, level).kinds;
}

export function kindMeta(id: DiagramId, kind: ElementKind): KindMeta {
  const meta = diagramDef(id).kinds[kind] ?? GENERAL_KINDS[kind];
  if (!meta) {
    // Si no se encuentra, devolvemos un fallback seguro para evitar excepciones
    return GENERAL_KINDS.rectangle;
  }
  return meta;
}

export function levelMeta(id: DiagramId, level: Level): LevelMeta {
  const meta = levelsOf(id).find((item) => item.id === level);
  if (!meta) throw new Error(`Nivel desconocido: ${level}`);
  return meta;
}

export function stylesOf(id: DiagramId): RelationshipStyle[] {
  return diagramDef(id).styles;
}

export function depthOfKind(id: DiagramId, kind: ElementKind): number {
  return kindMeta(id, kind).depth;
}

export function isDrillable(id: DiagramId, kind: ElementKind): boolean {
  return kindMeta(id, kind).drillable;
}

/** Tamaño por defecto de un nodo según su tipo. */
export function defaultNodeSize(id: DiagramId, kind: ElementKind): { width: number; height: number } {
  return kindMeta(id, kind).size ?? { width: NODE_WIDTH, height: NODE_HEIGHT };
}

/** Tamaño efectivo de un elemento: el escalado manual o el tamaño por defecto. */
export function elementNodeSize(
  id: DiagramId,
  element: { kind: ElementKind; width?: number | null; height?: number | null },
): { width: number; height: number } {
  const base = defaultNodeSize(id, element.kind);
  return {
    width: element.width ?? base.width,
    height: element.height ?? base.height,
  };
}

/** Iconos que se pueden asignar a un elemento. */
export const ELEMENT_ICONS: IconName[] = [
  "user",
  "users",
  "cube",
  "box",
  "blocks",
  "code",
  "database",
  "queue",
  "server",
  "cloud",
  "globe",
  "mobile",
  "lock",
  "cart",
  "bell",
  "robot",
  "settings",
  "key",
  "chart",
  "shield",
  "layers",
  "link",
  "diagram",
  "grid",
  "book",
  "clock",
  "folder",
  "external",
  "target",
  "palette",
];

export function isElementIcon(value: unknown): value is IconName {
  return typeof value === "string" && (ELEMENT_ICONS as string[]).includes(value);
}

/** Icono efectivo de un elemento: null si se quitó explícitamente, el personalizado si existe, o el de su tipo. */
export function iconOf(
  id: DiagramId,
  element: { kind: ElementKind; icon?: IconName | null },
): IconName | null {
  if (element.icon === null) return null;
  if (isElementIcon(element.icon)) return element.icon;
  return kindMeta(id, element.kind)?.icon ?? null;
}

function withAlpha(hex: string, percent: number): string {
  if (hex === "transparent" || !hex.startsWith("#")) return hex;
  const channel = (index: number) => Number.parseInt(hex.slice(index, index + 2), 16);
  const alpha = Math.min(100, Math.max(0, percent)) / 100;
  return `rgba(${channel(1)}, ${channel(3)}, ${channel(5)}, ${alpha})`;
}

/** Clases CSS inline para pintar un nodo. */
export function nodeStyle(
  id: DiagramId,
  kind: ElementKind,
  overrides?: {
    color?: string | null;
    borderColor?: string | null;
    textColor?: string | null;
    fontFamily?: string | null;
    size?: number | null;
    border?: boolean | null;
    fill?: boolean | null;
    radius?: number | null;
    bgOpacity?: number | null;
  },
): Record<string, string> {
  const meta = kindMeta(id, kind);
  const showFill = overrides?.fill !== false && overrides?.color !== "transparent";
  const baseBg = !showFill ? "transparent" : (overrides?.color ?? meta.bg);
  const opacity = overrides?.bgOpacity ?? 100;

  let bg = baseBg;
  if (!showFill || baseBg === "transparent" || opacity === 0) {
    bg = "transparent";
  } else if (opacity < 100 && baseBg.startsWith("#")) {
    bg = withAlpha(baseBg, opacity);
  }

  const showBorder = overrides?.border !== false;
  const border = showBorder ? (overrides?.borderColor ?? meta.border) : "transparent";
  const fg = overrides?.textColor ?? meta.fg;

  let radius = meta.radius;
  if (meta.shape === "person") {
    radius = "0";
  }
  if (
    meta.shape !== "person" &&
    overrides?.radius !== undefined &&
    overrides?.radius !== null
  ) {
    radius = `${overrides.radius}px`;
  }

  const style: Record<string, string> = {
    "--c4-bg": bg,
    "--c4-border": border,
    "--c4-fg": fg,
    "--c4-stereo": overrides?.textColor ? overrides.textColor : meta.stereo,
  };

  if (!showFill) {
    style.background = "transparent";
    style.backgroundColor = "transparent";
  }
  if (meta.shape !== "person") {
    style.borderRadius = radius;
  }
  if (!showBorder) {
    style.border = "none";
    style.borderColor = "transparent";
  }
  if (overrides?.size) {
    style.fontSize = `${overrides.size}px`;
  }
  if (overrides?.fontFamily) {
    style.fontFamily = overrides.fontFamily;
  }
  return style;
}

/** Estilos de relación disponibles en un diagrama. */
export function relationshipStyles(id: DiagramId): RelationshipStyle[] {
  return diagramDef(id).styles;
}

/** Nombre plano de un estilo (para exportar en español). */
export function styleLabel(style: RelationshipStyle): string {
  const labels: Record<RelationshipStyle, string> = {
    association: "Asociación",
    include: "Include",
    extend: "Extend",
    generalization: "Generalización",
  };
  return labels[style] ?? style;
}

/** Utilidad para mostrar un estereotipo entre guillemets. */
export function stereotypeOf(element: DiagramElement, id: DiagramId): string {
  return `«${kindMeta(id, element.kind).stereotype}»`;
}
