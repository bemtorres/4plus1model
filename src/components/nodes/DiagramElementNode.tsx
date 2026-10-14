import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { elementNodeSize, iconOf, kindMeta, nodeStyle } from "@/lib/diagrams";
import { HANDLE_SIDES, type HandleSide } from "@/lib/types";
import type { ElementFlowNode } from "@/lib/view";
import { useProject } from "@/lib/project-store";
import { Icon } from "../icons";

const POSITIONS: Record<HandleSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

/** Las 4 caras de conexión: se muestran al seleccionar el nodo o una relación conectada. */
function SideHandles({ sides, show }: { sides: HandleSide[]; show?: boolean }) {
  return (
    <>
      {HANDLE_SIDES.filter((side) => sides.includes(side)).map((side) => (
        <Handle
          key={side}
          id={side}
          type="source"
          position={POSITIONS[side]}
          className={`c4-handle c4-handle--${side} ${show ? "c4-handle--visible" : ""}`}
          title={side}
          aria-label={`Conectar por ${side}`}
        />
      ))}
    </>
  );
}

/** Figura de palito UML: cabeza, torso, brazos y piernas. */
function StickFigure({ color, size }: { color: string; size?: number | null }) {
  const stroke = size ? Math.max(1.5, size / 8) : 2.25;
  return (
    <svg
      className="uc-actor__svg"
      viewBox="0 0 64 96"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="32" cy="12" r="10" />
      <line x1="32" y1="22" x2="32" y2="58" />
      <line x1="10" y1="36" x2="54" y2="36" />
      <line x1="32" y1="58" x2="14" y2="90" />
      <line x1="32" y1="58" x2="50" y2="90" />
    </svg>
  );
}

interface ContentProps {
  name: string;
  description: string;
  stereotype: string;
  tags: string[];
  icon: ReturnType<typeof iconOf>;
  size?: number | null;
  textColor?: string | null;
}

function Content({ name, description, stereotype, tags, icon, size, textColor }: ContentProps) {
  const titleStyle = size ? { fontSize: `${size}px` } : undefined;
  const descStyle = size ? { fontSize: `${Math.max(9, size - 2)}px` } : undefined;
  const stereoStyle = size ? { fontSize: `${Math.max(9, size - 2)}px` } : undefined;
  const colorStyle = textColor ? { color: textColor } : undefined;

  return (
    <>
      <div className="c4-node__title" style={{ ...titleStyle, ...colorStyle }}>
        <Icon name={icon} className="c4-node__icon" />
        <span>{name}</span>
      </div>
      {description ? (
        <div className="c4-node__desc" style={{ ...descStyle, ...colorStyle }}>
          {description}
        </div>
      ) : null}
      {description || stereotype.includes(":") ? <div className="c4-node__divider" /> : null}
      <div className="c4-node__stereo" style={{ ...stereoStyle, ...colorStyle }}>
        {stereotype}
      </div>
      {tags.length > 0 ? (
        <div className="c4-node__tags">
          {tags.map((tag) => (
            <span className="c4-node__tag" key={tag} style={colorStyle}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function DiagramElementNode({ data, selected }: NodeProps<ElementFlowNode>) {
  const { element, isDetail } = data;
  const { selection, sheet, readOnly, updateElement } = useProject();

  const isDirectlySelected =
    !readOnly && selection?.type === "element" && selection.id === element.id;
  const isConnectedToSelectedRelation =
    !readOnly &&
    selection?.type === "relationship" &&
    sheet.relationships.some(
      (rel) => rel.id === selection.id && (rel.source === element.id || rel.target === element.id),
    );

  const showHandles = isDirectlySelected || isConnectedToSelectedRelation;

  const meta = kindMeta(sheet.diagram, element.kind);
  const description = element.description.trim();
  const stereotype = `«${meta.stereotype}»`;

  const content: ContentProps = {
    name: element.name || "Sin nombre",
    description,
    stereotype,
    tags: element.tags,
    icon: iconOf(sheet.diagram, element),
    size: element.size,
    textColor: element.textColor,
  };

  const classes = ["c4-node"];
  if (selected || isDirectlySelected) classes.push("c4-node--selected");
  if (!isDetail) classes.push("c4-node--context");
  if (showHandles) classes.push("c4-node--show-handles");

  const styleOverrides = {
    color: element.color,
    borderColor: element.borderColor,
    textColor: element.textColor,
    size: element.size,
    border: element.border,
    fill: element.fill,
    radius: element.radius,
    bgOpacity: element.bgOpacity,
  };
  const computedStyle = nodeStyle(sheet.diagram, element.kind, styleOverrides);
  const box = elementNodeSize(sheet.diagram, element);
  const boxStyle: React.CSSProperties =
    meta.shape === "system"
      ? { width: "100%", height: "100%" }
      : { width: box.width, minHeight: box.height };

  // El sistema es el rectángulo del escenario: escalable y siempre al fondo.
  if (meta.shape === "system") {
    return (
      <>
        <NodeResizer
          isVisible={selected && !readOnly}
          minWidth={220}
          minHeight={160}
          onResizeEnd={(_event, params) => {
            updateElement(element.id, {
              width: Math.round(params.width),
              height: Math.round(params.height),
            });
          }}
          lineStyle={{ stroke: "var(--accent)" }}
          handleStyle={{ width: 9, height: 9, borderRadius: 2 }}
        />
        <div
          className={[...classes, "uc-system"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="uc-system__title" style={element.textColor ? { color: element.textColor } : undefined}>
            {element.name || "Sistema"}
          </div>
        </div>
      </>
    );
  }

  // El actor es la figura de palito clásica, con el nombre debajo.
  if (meta.shape === "person") {
    const strokeColor = element.borderColor ?? element.textColor ?? meta.border;
    const personClasses = ["uc-actor"];
    if (selected || isDirectlySelected) personClasses.push("uc-actor--selected");
    if (showHandles) personClasses.push("uc-actor--show-handles");

    return (
      <div className={personClasses.join(" ")} style={{ width: box.width }}>
        <StickFigure color={strokeColor} size={element.size} />
        <div
          className="uc-actor__name"
          style={{
            ...(element.size ? { fontSize: `${element.size}px` } : {}),
            ...(element.textColor ? { color: element.textColor } : {}),
          }}
        >
          {element.name || "Actor"}
        </div>
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
      </div>
    );
  }

  // Casos de uso y elipses: óvalo con el nombre centrado.
  if (meta.shape === "ellipse") {
    return (
      <div
        className={[...classes, "uc-usecase"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="uc-usecase__body">
          <div
            className="uc-usecase__name"
            style={{
              ...(element.size ? { fontSize: `${element.size}px` } : {}),
              ...(element.textColor ? { color: element.textColor } : {}),
            }}
          >
            {element.name || "Caso de uso"}
          </div>
          {description ? (
            <div className="uc-usecase__desc">{description}</div>
          ) : null}
        </div>
      </div>
    );
  }

  // Cilindro / Base de Datos
  if (meta.shape === "cylinder") {
    return (
      <div
        className={[...classes, "drawio-shape drawio-cylinder"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-cylinder__top" />
        <div className="drawio-shape__title mt-3" style={element.textColor ? { color: element.textColor } : undefined}>
          {element.name || "Base de datos"}
        </div>
        {description ? (
          <div className="drawio-shape__desc">{description}</div>
        ) : null}
      </div>
    );
  }

  // Nube
  if (meta.shape === "cloud") {
    return (
      <div
        className={[...classes, "drawio-shape drawio-cloud"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
          {element.name || "Nube"}
        </div>
        {description ? <div className="drawio-shape__desc">{description}</div> : null}
      </div>
    );
  }

  // Rombo de decisión
  if (meta.shape === "diamond") {
    return (
      <div
        className={[...classes, "drawio-shape drawio-diamond"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
          {element.name || "Decisión"}
        </div>
        {description ? <div className="drawio-shape__desc">{description}</div> : null}
      </div>
    );
  }

  // Cubo 3D / Servidor
  if (meta.shape === "cube") {
    return (
      <div
        className={[...classes, "drawio-shape drawio-cube"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
          {element.name || "Servidor"}
        </div>
        <div className="text-[10px] opacity-60 mt-0.5">«{meta.stereotype}»</div>
        {description ? <div className="drawio-shape__desc">{description}</div> : null}
      </div>
    );
  }

  // Clase UML de 3 compartimentos
  if (meta.shape === "classBox") {
    return (
      <div
        className={[...classes, "drawio-classbox"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-classbox__header">
          <div className="drawio-classbox__stereo">«{meta.stereotype}»</div>
          <div className="drawio-classbox__name">{element.name || "Clase"}</div>
        </div>
        <div className="drawio-classbox__section">
          <div>+ id: UUID</div>
          <div>+ nombre: String</div>
        </div>
        <div className="drawio-classbox__section">
          <div>+ ejecutar(): void</div>
        </div>
      </div>
    );
  }

  // Componente de Software
  if (meta.shape === "componentBox") {
    return (
      <div
        className={[...classes, "drawio-shape drawio-componentbox"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
          {element.name || "Componente"}
        </div>
        <div className="text-[10px] opacity-60 mt-0.5">«{meta.stereotype}»</div>
        {description ? <div className="drawio-shape__desc">{description}</div> : null}
      </div>
    );
  }

  // Ventana de Aplicación
  if (meta.shape === "window") {
    return (
      <div
        className={[...classes, "drawio-window"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div className="drawio-window__bar">
          <div className="drawio-window__dot" />
          <div className="drawio-window__dot" />
          <div className="drawio-window__dot" />
          <span className="text-[10px] font-semibold text-muted ml-1 truncate">
            {element.name || "Ventana"}
          </span>
        </div>
        <div className="drawio-window__body">
          <div className="drawio-shape__title">{element.name || "Ventana"}</div>
          {description ? <div className="drawio-shape__desc">{description}</div> : null}
        </div>
      </div>
    );
  }

  // Texto libre / Encabezado
  if (meta.shape === "text" || meta.shape === "heading") {
    const isHeading = meta.shape === "heading";
    return (
      <div
        className={[...classes, "drawio-text"].join(" ")}
        style={{ ...computedStyle, ...boxStyle }}
      >
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <div
          style={{
            fontSize: element.size ? `${element.size}px` : isHeading ? "18px" : "13px",
            fontWeight: isHeading ? 700 : 400,
            color: element.textColor ?? "var(--foreground)",
          }}
        >
          {element.name || (isHeading ? "Título" : "Texto")}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.join(" ")} style={{ ...computedStyle, ...boxStyle }}>
      <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
      <Content {...content} />
    </div>
  );
}
