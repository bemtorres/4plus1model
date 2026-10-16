/**
 * Modelo de datos del modelador 4+1.
 *
 * Un proyecto contiene hojas (sheets); cada hoja es un diagrama de un tipo
 * concreto (por ahora «casos de uso») con sus elementos y relaciones. Cada
 * elemento cuelga opcionalmente de otro mediante `parentId`, lo que permite
 * "bajar" de nivel (actores y sistemas -> casos de uso -> flujo de pasos).
 */

export type DiagramId = "usecase" | "logical" | "process" | "development" | "physical";

export type ElementKind =
  // Formas generales (estilo Draw.io)
  | "rectangle"
  | "roundedRect"
  | "text"
  | "heading"
  | "ellipse"
  | "square"
  | "circle"
  | "process"
  | "diamond"
  | "parallelogram"
  | "hexagon"
  | "triangle"
  | "cylinder"
  | "cloud"
  | "document"
  | "table"
  | "cube"
  | "trapezoid"
  | "callout"
  | "window"
  | "folder"
  | "arrowRight"
  // Escenarios (+1)
  | "actor"
  | "system"
  | "useCase"
  | "detailedUseCase"
  | "step"
  // Lógica
  | "class"
  | "interface"
  | "subsystem"
  | "domainEntity"
  // Procesos
  | "thread"
  | "queue"
  | "eventStream"
  // Desarrollo
  | "component"
  | "module"
  | "layer"
  // Física
  | "node"
  | "virtualMachine"
  | "container"
  | "loadBalancer"
  | "networkZone"
  // Universal
  | "note";

export type RelationshipStyle = "association" | "include" | "extend" | "generalization";

/** Id de un nivel dentro de un diagrama (p. ej. "actors" | "usecases" | "steps"). */
export type Level = string;

/** Iconos disponibles en la interfaz (nodos, paneles y acciones). */
export type IconName =
  | "user"
  | "users"
  | "cube"
  | "box"
  | "blocks"
  | "code"
  | "database"
  | "queue"
  | "server"
  | "cloud"
  | "globe"
  | "mobile"
  | "lock"
  | "cart"
  | "bell"
  | "robot"
  | "settings"
  | "key"
  | "chart"
  | "shield"
  | "layers"
  | "link"
  | "diagram"
  | "grid"
  | "book"
  | "clock"
  | "folder"
  | "external"
  | "target"
  | "wand"
  | "download"
  | "upload"
  | "undo"
  | "redo"
  | "sun"
  | "moon"
  | "plus"
  | "trash"
  | "copy"
  | "chevron-down"
  | "chevron-right"
  | "chevron-up"
  | "chevron-left"
  | "arrow-up"
  | "arrow-right"
  | "arrow-down"
  | "arrow-left"
  | "fit"
  | "file"
  | "info"
  | "search"
  | "refresh"
  | "keyboard"
  | "fullscreen"
  | "minimize"
  | "sparkles"
  | "menu"
  | "palette"
  | "swap"
  | "x";

export interface DiagramElement {
  id: string;
  kind: ElementKind;
  name: string;
  description: string;
  tags: string[];
  /** Elemento que lo contiene en el nivel superior. `null` = nivel raíz. */
  parentId: string | null;
  /** Icono personalizado; null = sin icono; undefined = usar el por defecto del tipo. */
  icon?: IconName | null;
  /** Color de relleno. `null` = color por defecto, "transparent" = sin fondo. */
  color?: string | null;
  /** Color del borde. `null` = el color por defecto del tipo. */
  borderColor?: string | null;
  /** Color del texto. `null` = color por defecto. */
  textColor?: string | null;
  /** Familia tipográfica (`null` = por defecto del sistema/inter). */
  fontFamily?: string | null;
  /** Tamaño de letra en píxeles. */
  size?: number | null;
  /** Mostrar borde (`false` = sin borde). */
  border?: boolean | null;
  /** Mostrar relleno (`false` = fondo transparente). */
  fill?: boolean | null;
  /** Radio del borde en píxeles (esquinas redondeadas). */
  radius?: number | null;
  /** Opacidad del fondo en porcentaje (100 = opaco, 0 = transparente). */
  bgOpacity?: number | null;
  /** Posición en el flujo (steps). Se reordena desde el inspector. */
  order?: number | null;
  /** Ancho en píxeles (sistema/boundary escalable). `null` = tamaño por defecto. */
  width?: number | null;
  /** Alto en píxeles (sistema/boundary escalable). `null` = tamaño por defecto. */
  height?: number | null;
  /** Datos específicos del tipo (actorType, preconditions, postconditions…). */
  meta?: Record<string, string>;
  x: number;
  y: number;
}

/** Cara de un nodo por la que entra o sale una relación. `null` = automática. */
export type HandleSide = "top" | "right" | "bottom" | "left";

export const HANDLE_SIDES: HandleSide[] = ["top", "right", "bottom", "left"];

export interface DiagramRelationship {
  id: string;
  source: string;
  target: string;
  /** Cara del nodo de origen. `null` = la elige la app. */
  sourceHandle: HandleSide | null;
  /** Cara del nodo de destino. `null` = la elige la app. */
  targetHandle: HandleSide | null;
  label: string;
  description: string;
  style: RelationshipStyle;
  /** Color de la línea. `null` = el color por defecto. */
  color?: string | null;
  /** Grosor de la línea en píxeles. `null` = grosor por defecto. */
  thickness?: number | null;
}

/** Una pestaña del editor: un diagrama concreto con su vista activa. */
export interface Sheet {
  id: string;
  name: string;
  diagram: DiagramId;
  elements: DiagramElement[];
  relationships: DiagramRelationship[];
  /** Vista recordada de la hoja (nivel + ámbito). */
  view: { level: Level; scopeId: string | null };
  /** Icono personalizado de la pestaña; null = sin icono. */
  icon?: IconName | null;
  /** Color distintivo de la pestaña. */
  color?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  sheets: Sheet[];
  updatedAt: string;
}

export type Selection =
  | { type: "element"; id: string }
  | { type: "relationship"; id: string }
  | null;

export interface ProjectFile {
  format: "4plus1-modeler";
  version: 1;
  exportedAt?: string;
  savedAt?: string;
  project: Project;
}

export const PROJECT_FILE_FORMAT = "4plus1-modeler" as const;
export const PROJECT_FILE_VERSION = 1 as const;
