import type { ElementKind, IconName, Level } from "./types";

export type { IconName };

/** Tamaño de referencia de un nodo (la persona añade la altura del círculo). */
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 116;

export interface KindMeta {
  kind: ElementKind;
  /** Nombre corto para la interfaz. */
  label: string;
  /** Estereotipo mostrado dentro del nodo («...»). */
  stereotype: string;
  /** Nombre en inglés (C4 canónico). */
  c4Name: string;
  level: Level;
  /** Profundidad en el modelo: 0 = contexto, 3 = código. */
  depth: number;
  bg: string;
  border: string;
  fg: string;
  stereo: string;
  radius: string;
  /** Forma del nodo (afecta al radio de borde). */
  shape: "person" | "system"   | "container"
  | "store"
  | "note";
  icon: IconName;
  /** Si el elemento se puede abrir en el siguiente nivel. */
  drillable: boolean;
  /** Keyword de Mermaid C4. */
  mermaid: string;
  /** Macro de C4-PlantUML. */
  plantUml: string;
  /** Sufijo `*_Boundary` en C4-PlantUML. */
  plantUmlBoundary: string | null;
}

export interface LevelMeta {
  id: Level;
  label: string;
  short: string;
  description: string;
  /** Tipos de elemento que se pueden crear en este nivel. */
  kinds: ElementKind[];
  /** Profundidad del elemento que actúa como ámbito. */
  scopeDepth: number;
}

export const LEVELS: LevelMeta[] = [
  {
    id: "context",
    label: "Contexto",
    short: "L1",
    description: "Personas y sistemas de software",
    kinds: ["person", "softwareSystem", "externalSystem", "note"],
    scopeDepth: -1,
  },
  {
    id: "container",
    label: "Contenedores",
    short: "L2",
    description: "Unidades ejecutables y almacenes de datos",
    kinds: ["container", "database", "queue", "note"],
    scopeDepth: 0,
  },
  {
    id: "component",
    label: "Componentes",
    short: "L3",
    description: "Módulos internos de un contenedor",
    kinds: ["component", "note"],
    scopeDepth: 1,
  },
  {
    id: "code",
    label: "Código",
    short: "L4",
    description: "Clases y funciones clave",
    kinds: ["code", "note"],
    scopeDepth: 2,
  },
];

const KINDS: Record<ElementKind, KindMeta> = {
  person: {
    kind: "person",
    label: "Persona",
    stereotype: "Persona",
    c4Name: "Person",
    level: "context",
    depth: 0,
    bg: "#08427b",
    border: "#052f56",
    fg: "#ffffff",
    stereo: "#bdddff",
    radius: "14px",
    shape: "person",
    icon: "user",
    drillable: false,
    mermaid: "Person",
    plantUml: "Person",
    plantUmlBoundary: null,
  },
  softwareSystem: {
    kind: "softwareSystem",
    label: "Sistema de software",
    stereotype: "Sistema de software",
    c4Name: "Software System",
    level: "context",
    depth: 0,
    bg: "#1168bd",
    border: "#052f56",
    fg: "#ffffff",
    stereo: "#bdddff",
    radius: "6px",
    shape: "system",
    icon: "cube",
    drillable: true,
    mermaid: "System",
    plantUml: "System",
    plantUmlBoundary: "System_Boundary",
  },
  externalSystem: {
    kind: "externalSystem",
    label: "Sistema externo",
    stereotype: "Sistema externo",
    c4Name: "External System",
    level: "context",
    depth: 0,
    bg: "#8c8c8c",
    border: "#5f5f5f",
    fg: "#ffffff",
    stereo: "#e6e6e6",
    radius: "6px",
    shape: "system",
    icon: "external",
    drillable: true,
    mermaid: "System_Ext",
    plantUml: "System_Ext",
    plantUmlBoundary: "System_Boundary",
  },
  container: {
    kind: "container",
    label: "Contenedor",
    stereotype: "Contenedor",
    c4Name: "Container",
    level: "container",
    depth: 1,
    bg: "#438dd5",
    border: "#052f56",
    fg: "#ffffff",
    stereo: "#bdddff",
    radius: "6px",
    shape: "container",
    icon: "box",
    drillable: true,
    mermaid: "Container",
    plantUml: "Container",
    plantUmlBoundary: "Container_Boundary",
  },
  database: {
    kind: "database",
    label: "Base de datos",
    stereotype: "Base de datos",
    c4Name: "Container: Database",
    level: "container",
    depth: 1,
    bg: "#b3d7f2",
    border: "#052f56",
    fg: "#052f56",
    stereo: "#3d6384",
    radius: "10px",
    shape: "store",
    icon: "database",
    drillable: false,
    mermaid: "ContainerDb",
    plantUml: "ContainerDb",
    plantUmlBoundary: "Container_Boundary",
  },
  queue: {
    kind: "queue",
    label: "Cola de mensajes",
    stereotype: "Cola de mensajes",
    c4Name: "Container Queue",
    level: "container",
    depth: 1,
    bg: "#438dd5",
    border: "#052f56",
    fg: "#ffffff",
    stereo: "#bdddff",
    radius: "10px",
    shape: "store",
    icon: "queue",
    drillable: false,
    mermaid: "ContainerQueue",
    plantUml: "ContainerQueue",
    plantUmlBoundary: "Container_Boundary",
  },
  component: {
    kind: "component",
    label: "Componente",
    stereotype: "Componente",
    c4Name: "Component",
    level: "component",
    depth: 2,
    bg: "#85bbf0",
    border: "#052f56",
    fg: "#052f56",
    stereo: "#1d4c78",
    radius: "6px",
    shape: "container",
    icon: "blocks",
    drillable: true,
    mermaid: "Component",
    plantUml: "Component",
    plantUmlBoundary: "Container_Boundary",
  },
  code: {
    kind: "code",
    label: "Code element",
    stereotype: "Code",
    c4Name: "Code Element",
    level: "code",
    depth: 3,
    bg: "#d9e7f5",
    border: "#052f56",
    fg: "#052f56",
    stereo: "#1d4c78",
    radius: "6px",
    shape: "container",
    icon: "code",
    drillable: false,
    mermaid: "Component",
    plantUml: "Component",
    plantUmlBoundary: null,
  },
  note: {
    kind: "note",
    label: "Note",
    stereotype: "Annotation",
    c4Name: "Note",
    level: "context",
    depth: 0,
    bg: "#fff8c5",
    border: "#e0b83c",
    fg: "#4a3a09",
    stereo: "#8a7420",
    radius: "10px",
    shape: "note",
    icon: "file",
    drillable: false,
    mermaid: "Component",
    plantUml: "Component",
    plantUmlBoundary: null,
  },
};

export function kindMeta(kind: ElementKind): KindMeta {
  return KINDS[kind];
}

/** Todos los tipos de elemento soportados. */
export const KINDS_ALL: ElementKind[] = Object.keys(KINDS) as ElementKind[];

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
];

export function isElementIcon(value: unknown): value is IconName {
  return typeof value === "string" && (ELEMENT_ICONS as string[]).includes(value);
}

/** Icono efectivo de un elemento: el personalizado o el de su tipo. */
export function iconOf(element: { kind: ElementKind; icon?: IconName }): IconName {
  return isElementIcon(element.icon) ? element.icon : kindMeta(element.kind).icon;
}

export function levelMeta(level: Level): LevelMeta {
  const found = LEVELS.find((item) => item.id === level);
  if (!found) throw new Error(`Nivel desconocido: ${level}`);
  return found;
}

export function levelOfKind(kind: ElementKind): Level {
  return kindMeta(kind).level;
}

export function depthOfKind(kind: ElementKind): number {
  return kindMeta(kind).depth;
}

export function isDrillable(kind: ElementKind): boolean {
  return kindMeta(kind).drillable;
}

/** Tamaño estimado de un nodo según su tipo (la persona es más alta). */
export function defaultNodeSize(kind: ElementKind): { width: number; height: number } {
  return kindMeta(kind).shape === "person"
    ? { width: NODE_WIDTH, height: NODE_HEIGHT + 48 }
    : { width: NODE_WIDTH, height: NODE_HEIGHT };
}

/** Clases CSS inline para pintar un nodo. */
export function nodeStyle(
  kind: ElementKind,
  overrides?: { color?: string | null; borderColor?: string | null },
): Record<string, string> {
  const meta = kindMeta(kind);
  return {
    "--c4-bg": overrides?.color ?? meta.bg,
    "--c4-border": overrides?.borderColor ?? meta.border,
    "--c4-fg": meta.fg,
    "--c4-stereo": meta.stereo,
    borderRadius: meta.shape === "person" ? "0" : meta.radius,
  } as Record<string, string>;
}
