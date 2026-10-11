/**
 * Modelo de datos del modelador C4.
 *
 * Un workspace contiene elementos (personas, sistemas, contenedores,
 * componentes y código) y relaciones entre ellos. Cada elemento cuelga
 * opcionalmente de un elemento de nivel superior mediante `parentId`, lo que
 * permite "bajar" de nivel (contexto -> contenedores -> componentes -> código).
 */

export type Level = "context" | "container" | "component" | "code";

export type ElementKind =
  | "person"
  | "softwareSystem"
  | "externalSystem"
  | "container"
  | "component"
  | "code"
  | "database"
  | "queue"
  | "note";

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
  | "keyboard";

export type RelationshipStyle = "sync" | "async" | "bi";

export interface C4Element {
  id: string;
  kind: ElementKind;
  name: string;
  description: string;
  technology: string;
  tags: string[];
  /** Elemento que lo contiene en el nivel superior. `null` = nivel contexto. */
  parentId: string | null;
  /** Icono personalizado; si no se indica se usa el del tipo de elemento. */
  icon?: IconName;
  /** Color de relleno. `null` = color por defecto, "transparent" = sin fondo. */
  color?: string | null;
  /** Color del borde. `null` = el color por defecto del tipo. */
  borderColor?: string | null;
  /** Color del texto. `null` = color por defecto. */
  textColor?: string | null;
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
  x: number;
  y: number;
}

/** Cara de un nodo por la que entra o sale una relación. `null` = automática. */
export type HandleSide = "top" | "right" | "bottom" | "left";

export const HANDLE_SIDES: HandleSide[] = ["top", "right", "bottom", "left"];

export interface C4Relationship {
  id: string;
  source: string;
  target: string;
  /** Cara del nodo de origen. `null` = la elige la app. */
  sourceHandle: HandleSide | null;
  /** Cara del nodo de destino. `null` = la elige la app. */
  targetHandle: HandleSide | null;
  label: string;
  technology: string;
  description: string;
  style: RelationshipStyle;
  /** Color de la línea. `null` = el color por defecto. */
  color?: string | null;
  /** Grosor de la línea en píxeles. `null` = grosor por defecto. */
  thickness?: number | null;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  elements: C4Element[];
  relationships: C4Relationship[];
  updatedAt: string;
}

export type Selection =
  | { type: "element"; id: string }
  | { type: "relationship"; id: string }
  | null;

export interface WorkspaceFile {
  format: "c4-modeler";
  version: 1;
  exportedAt: string;
  workspace: Workspace;
}

export const WORKSPACE_FILE_FORMAT = "c4-modeler" as const;
export const WORKSPACE_FILE_VERSION = 1 as const;
