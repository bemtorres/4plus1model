import { Handle, Position, type NodeProps } from "@xyflow/react";
import { iconOf, kindMeta, nodeStyle } from "@/lib/catalog";
import { HANDLE_SIDES, type HandleSide } from "@/lib/types";
import type { C4FlowNode } from "@/lib/view";
import { Icon } from "../icons";

const POSITIONS: Record<HandleSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

/** Las 4 caras de conexión: se arrastra desde la que se quiera usar. */
function SideHandles({ sides }: { sides: HandleSide[] }) {
  return (
    <>
      {HANDLE_SIDES.filter((side) => sides.includes(side)).map((side) => (
        <Handle
          key={side}
          id={side}
          type="source"
          position={POSITIONS[side]}
          className={`c4-handle c4-handle--${side}`}
          title={side}
          aria-label={`Conectar por ${side}`}
        />
      ))}
    </>
  );
}

interface Content {
  name: string;
  description: string;
  stereotype: string;
  tags: string[];
  icon: ReturnType<typeof iconOf>;
}

function Content({ name, description, stereotype, tags, icon }: Content) {
  return (
    <>
      <div className="c4-node__title">
        <Icon name={icon} className="c4-node__icon" />
        <span>{name}</span>
      </div>
      {description ? <div className="c4-node__desc">{description}</div> : null}
      {description || stereotype.includes(":") ? <div className="c4-node__divider" /> : null}
      <div className="c4-node__stereo">{stereotype}</div>
      {tags.length > 0 ? (
        <div className="c4-node__tags">
          {tags.map((tag) => (
            <span className="c4-node__tag" key={tag}>
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
  const meta = kindMeta(element.kind);
  const technology = element.technology.trim();
  const description = element.description.trim();
  const stereotype = technology
    ? `«${meta.c4Name}: ${technology}»`
    : `«${meta.c4Name}»`;

  const content = {
    name: element.name || "Sin nombre",
    description,
    stereotype,
    tags: element.tags,
    icon: iconOf(element),
  };

  const classes = ["c4-node"];
  if (selected) classes.push("c4-node--selected");
  if (!isDetail) classes.push("c4-node--context");

  // Las personas usan la silueta clásica de C4: círculo + cuerpo redondeado.
  if (meta.shape === "person") {
    return (
      <div
        className={selected ? "c4-person c4-person--selected" : "c4-person"}
        style={nodeStyle(element.kind, {
          color: element.color,
          borderColor: element.borderColor,
        })}
      >
        <div className="c4-person__head" />
        <div className={classes.join(" ")}>
          <div className="c4-person__body">
            <Content {...content} />
          </div>
        </div>
        <SideHandles sides={["left", "right", "bottom"]} />
      </div>
    );
  }

  return (
    <div
      className={classes.join(" ")}
      style={nodeStyle(element.kind, {
        color: element.color,
        borderColor: element.borderColor,
      })}
    >
      <SideHandles sides={["top", "right", "bottom", "left"]} />
      <Content {...content} />
    </div>
  );
}
