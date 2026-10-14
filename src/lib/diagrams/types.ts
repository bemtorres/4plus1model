import type {
  DiagramId,
  ElementKind,
  IconName,
  Level,
  RelationshipStyle,
} from "../types";

export type { IconName };

/** Tamaño de referencia de un nodo (la persona añade la altura del círculo). */
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 116;

export type NodeShape =
  | "person"
  | "ellipse"
  | "system"
  | "note"
  | "step"
  | "rectangle"
  | "roundedRect"
  | "text"
  | "heading"
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
  | "classBox"
  | "componentBox"
  | "queue";

export interface KindMeta {
  kind: ElementKind;
  /** Nombre corto para la interfaz (clave i18n `kind.<kind>`). */
  label: string;
  /** Estereotipo mostrado dentro del nodo («...»). */
  stereotype: string;
  /** Nivel en el que el tipo aparece en la paleta. */
  level: Level;
  /** Nivel al que se entra al hacer doble clic (si es drillable). */
  drillLevel?: Level;
  /** Profundidad en el modelo del diagrama (0 = más externo). */
  depth: number;
  bg: string;
  border: string;
  fg: string;
  stereo: string;
  radius: string;
  /** Forma del nodo. */
  shape: NodeShape;
  icon: IconName;
  /** Si el elemento se puede abrir en el siguiente nivel. */
  drillable: boolean;
  /** Tamaño por defecto; si falta se usa NODE_WIDTH × NODE_HEIGHT. */
  size?: { width: number; height: number };
  /** Los de este kind se colocan en la primera capa del autolayout. */
  firstLayer?: boolean;
}

export interface LevelMeta {
  id: Level;
  /** Clave i18n `level.<id>`. */
  label: string;
  short: string;
  description: string;
  /** Tipos de elemento que se pueden crear en este nivel. */
  kinds: ElementKind[];
  /** Profundidad del elemento que actúa como ámbito (-1 = nivel raíz). */
  scopeDepth: number;
}

export interface DiagramDef {
  id: DiagramId;
  label: string;
  short: string;
  description: string;
  icon: IconName;
  /** `true` si el diagrama aún no está disponible (menú «+»). */
  comingSoon?: boolean;
  levels: LevelMeta[];
  kinds: Record<ElementKind, KindMeta>;
  styles: RelationshipStyle[];
  flags?: {
    /** En niveles con ámbito, mostrar también el contexto aunque no haya relaciones. */
    showAllContext?: boolean;
    /** Encadenar automáticamente los hijos por `order` (flujo de pasos). */
    autoChain?: boolean;
  };
}
