import { Handle, Position, type NodeProps } from "@xyflow/react";
import { iconOf, kindMeta, nodeStyle } from "@/lib/catalog";
import { HANDLE_SIDES, type HandleSide } from "@/lib/types";
import type { C4FlowNode } from "@/lib/view";
import { useWorkspace } from "@/lib/workspace-store";
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

export function C4ElementNode({ data, selected }: NodeProps<C4FlowNode>) {
  const { element, isDetail } = data;
  const { selection, workspace, readOnly } = useWorkspace();

  const isDirectlySelected =
    !readOnly && selection?.type === "element" && selection.id === element.id;
  const isConnectedToSelectedRelation =
    !readOnly &&
    selection?.type === "relationship" &&
    workspace.relationships.some(
      (rel) => rel.id === selection.id && (rel.source === element.id || rel.target === element.id),
    );

  const showHandles = isDirectlySelected || isConnectedToSelectedRelation;

  const meta = kindMeta(element.kind);
  const technology = element.technology.trim();
  const description = element.description.trim();
  const stereotype = technology
    ? `«${meta.c4Name}: ${technology}»`
    : `«${meta.c4Name}»`;

  const content: ContentProps = {
    name: element.name || "Sin nombre",
    description,
    stereotype,
    tags: element.tags,
    icon: iconOf(element),
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
  const computedStyle = nodeStyle(element.kind, styleOverrides);

  // Las personas usan la silueta clásica de C4: círculo + cuerpo redondeado.
  if (meta.shape === "person") {
    const showBorder = element.border !== false;
    const showFill = element.fill !== false && element.color !== "transparent";
    const personHeadStyle: React.CSSProperties = {
      ...(!showBorder ? { border: "none", borderColor: "transparent" } : {}),
      ...(!showFill ? { background: "transparent" } : {}),
    };
    const personBodyStyle: React.CSSProperties = {
      ...(element.radius !== null && element.radius !== undefined
        ? { borderRadius: `${element.radius}px` }
        : {}),
      ...(!showBorder ? { border: "none", borderColor: "transparent" } : {}),
      ...(!showFill ? { background: "transparent" } : {}),
    };

    const personClasses = ["c4-person"];
    if (selected || isDirectlySelected) personClasses.push("c4-person--selected");
    if (showHandles) personClasses.push("c4-person--show-handles");

    return (
      <div
        className={personClasses.join(" ")}
        style={computedStyle}
      >
        <div className="c4-person__head" style={personHeadStyle} />
        <div className={classes.join(" ")}>
          <div className="c4-person__body" style={personBodyStyle}>
            <Content {...content} />
          </div>
        </div>
        <SideHandles sides={["left", "right", "bottom"]} show={showHandles} />
      </div>
    );
  }

  return (
    <div
      className={classes.join(" ")}
      style={computedStyle}
    >
      <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
      <Content {...content} />
    </div>
  );
}
