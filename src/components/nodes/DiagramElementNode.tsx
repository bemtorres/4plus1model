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

/** Figura de palito UML: cabeza, torso, brazos, piernas, relleno opcional y badge de icono. */
function StickFigure({
  color,
  fillColor,
  size,
  icon,
}: {
  color: string;
  fillColor?: string;
  size?: number | null;
  icon?: string | null;
}) {
  const stroke = size ? Math.max(1.5, size / 8) : 2.25;
  const hasFill = fillColor && fillColor !== "transparent";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="uc-actor__svg"
        viewBox="0 0 64 96"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        aria-hidden="true"
      >
        {/* Cabeza con relleno opcional */}
        <circle cx="32" cy="12" r="10" fill={hasFill ? fillColor : "none"} />
        {/* Torso */}
        <line x1="32" y1="22" x2="32" y2="58" />
        {/* Brazos */}
        <line x1="10" y1="36" x2="54" y2="36" />
        {/* Piernas */}
        <line x1="32" y1="58" x2="14" y2="90" />
        <line x1="32" y1="58" x2="50" y2="90" />
      </svg>
      {/* Icono complementario si el usuario lo añade al actor */}
      {icon ? (
        <span
          className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full shadow-xs text-[11px] border border-border"
          style={{
            backgroundColor: hasFill ? fillColor : "var(--surface)",
            color,
          }}
          title={`Icono: ${icon}`}
        >
          <Icon name={icon as any} />
        </span>
      ) : null}
    </div>
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
        {icon ? <Icon name={icon} className="c4-node__icon" /> : null}
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
  const effectiveIcon = iconOf(sheet.diagram, element);

  const content: ContentProps = {
    name: element.name || "Sin nombre",
    description,
    stereotype,
    tags: element.tags,
    icon: effectiveIcon,
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
    fontFamily: element.fontFamily,
    size: element.size,
    border: element.border,
    fill: element.fill,
    radius: element.radius,
    bgOpacity: element.bgOpacity,
  };
  const computedStyle = nodeStyle(sheet.diagram, element.kind, styleOverrides);
  const isPerson = meta.shape === "person";
  const isResizable = !isPerson;
  const isSelected = Boolean(selected || isDirectlySelected);
  const canResize = isResizable && isSelected && !readOnly;

  const resizer = canResize ? (
    <NodeResizer
      isVisible={canResize}
      minWidth={meta.shape === "system" ? 120 : 30}
      minHeight={meta.shape === "system" ? 80 : 30}
      onResizeEnd={(_event, params) => {
        updateElement(element.id, {
          width: Math.round(params.width),
          height: Math.round(params.height),
          x: Math.round(params.x),
          y: Math.round(params.y),
        });
      }}
      lineStyle={{ stroke: "var(--accent, #3b82f6)", strokeWidth: 1.5 }}
      handleStyle={{
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: "var(--surface, #ffffff)",
        borderColor: "var(--accent, #3b82f6)",
        borderWidth: 1.5,
      }}
    />
  ) : null;

  const box = elementNodeSize(sheet.diagram, element);
  const boxStyle: React.CSSProperties = isResizable
    ? { width: "100%", height: "100%", boxSizing: "border-box" }
    : { width: box.width, minHeight: box.height };

  // El sistema es el rectángulo del escenario: escalable y siempre al fondo (sin handles de conexión).
  if (meta.shape === "system") {
    return (
      <>
        <div
          className={[...classes, "uc-system"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <div
            className="uc-system__header"
            style={{
              ...(element.textColor ? { color: element.textColor } : {}),
              ...(element.fontFamily ? { fontFamily: element.fontFamily } : {}),
            }}
          >
            <div
              className="uc-system__title"
              style={{
                ...(element.size ? { fontSize: `${element.size}px` } : {}),
              }}
            >
              {effectiveIcon ? (
                <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" />
              ) : null}
              <span>{element.name || "Sistema"}</span>
            </div>
            {description ? (
              <div
                className="uc-system__desc"
                style={{
                  ...(element.size ? { fontSize: `${Math.max(9, element.size - 2)}px` } : {}),
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>
        {resizer}
      </>
    );
  }

  // El actor es la figura de palito clásica, con el nombre debajo.
  if (meta.shape === "person") {
    const actorColor = element.borderColor ?? element.color;
    const strokeColor = actorColor ?? "currentColor";
    const nameColor = element.textColor ?? (actorColor ?? undefined);
    const showActorFill = element.fill !== false && element.color && element.color !== "transparent";
    const fillColor = showActorFill ? element.color! : undefined;

    const personClasses = ["uc-actor"];
    if (selected || isDirectlySelected) personClasses.push("uc-actor--selected");
    if (showHandles) personClasses.push("uc-actor--show-handles");

    const containerStyle: React.CSSProperties = {
      width: box.width,
      ...(element.fontFamily ? { fontFamily: element.fontFamily } : {}),
      ...(element.color && element.fill !== false && element.color !== "transparent"
        ? {
            backgroundColor: element.bgOpacity && element.bgOpacity < 100 && element.color.startsWith("#")
              ? `${element.color}${Math.round((element.bgOpacity / 100) * 255).toString(16).padStart(2, "0")}`
              : element.color,
            borderRadius: element.radius ? `${element.radius}px` : "12px",
          }
        : {}),
      ...(element.border && element.borderColor
        ? {
            border: `1.5px solid ${element.borderColor}`,
            borderRadius: element.radius ? `${element.radius}px` : "12px",
          }
        : {}),
    };

    return (
      <div className={personClasses.join(" ")} style={containerStyle}>
        <StickFigure
          color={strokeColor}
          fillColor={fillColor}
          size={element.size}
          icon={element.icon}
        />
        <div
          className="uc-actor__name"
          style={{
            ...(element.size ? { fontSize: `${element.size}px` } : {}),
            ...(nameColor ? { color: nameColor } : {}),
            ...(element.textColor ? ({ "--actor-custom-text": element.textColor } as React.CSSProperties) : {}),
            ...(element.fontFamily ? { fontFamily: element.fontFamily } : {}),
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
      <>
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
                ...(element.fontFamily ? { fontFamily: element.fontFamily } : {}),
              }}
            >
              {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
              <span>{element.name || "Caso de uso"}</span>
            </div>
            {description ? (
              <div className="uc-usecase__desc">{description}</div>
            ) : null}
          </div>
        </div>
        {resizer}
      </>
    );
  }

  // Cilindro / Base de Datos
  if (meta.shape === "cylinder") {
    return (
      <>
        <div
          className={[...classes, "drawio-shape drawio-cylinder"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="drawio-cylinder__top" />
          <div className="drawio-shape__title mt-3" style={element.textColor ? { color: element.textColor } : undefined}>
            {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
            <span>{element.name || "Base de datos"}</span>
          </div>
          {description ? (
            <div className="drawio-shape__desc">{description}</div>
          ) : null}
        </div>
        {resizer}
      </>
    );
  }

  // Nube
  if (meta.shape === "cloud") {
    return (
      <>
        <div
          className={[...classes, "drawio-shape drawio-cloud"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
            {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
            <span>{element.name || "Nube"}</span>
          </div>
          {description ? <div className="drawio-shape__desc">{description}</div> : null}
        </div>
        {resizer}
      </>
    );
  }

  // Rombo de decisión
  if (meta.shape === "diamond") {
    return (
      <>
        <div
          className={[...classes, "drawio-shape drawio-diamond"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
            {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
            <span>{element.name || "Decisión"}</span>
          </div>
          {description ? <div className="drawio-shape__desc">{description}</div> : null}
        </div>
        {resizer}
      </>
    );
  }

  // Cubo 3D / Servidor
  if (meta.shape === "cube") {
    return (
      <>
        <div
          className={[...classes, "drawio-shape drawio-cube"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
            {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
            <span>{element.name || "Servidor"}</span>
          </div>
          <div className="text-[10px] opacity-60 mt-0.5">«{meta.stereotype}»</div>
          {description ? <div className="drawio-shape__desc">{description}</div> : null}
        </div>
        {resizer}
      </>
    );
  }

  // Clase UML de 3 compartimentos
  if (meta.shape === "classBox") {
    return (
      <>
        <div
          className={[...classes, "drawio-classbox"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="drawio-classbox__header">
            <div className="drawio-classbox__stereo">«{meta.stereotype}»</div>
            <div className="drawio-classbox__name">
              {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
              <span>{element.name || "Clase"}</span>
            </div>
          </div>
          <div className="drawio-classbox__section">
            <div>+ id: UUID</div>
            <div>+ nombre: String</div>
          </div>
          <div className="drawio-classbox__section">
            <div>+ ejecutar(): void</div>
          </div>
        </div>
        {resizer}
      </>
    );
  }

  // Componente de Software
  if (meta.shape === "componentBox") {
    return (
      <>
        <div
          className={[...classes, "drawio-shape drawio-componentbox"].join(" ")}
          style={{ ...computedStyle, ...boxStyle }}
        >
          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
          <div className="drawio-shape__title" style={element.textColor ? { color: element.textColor } : undefined}>
            {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
            <span>{element.name || "Componente"}</span>
          </div>
          <div className="text-[10px] opacity-60 mt-0.5">«{meta.stereotype}»</div>
          {description ? <div className="drawio-shape__desc">{description}</div> : null}
        </div>
        {resizer}
      </>
    );
  }

  // Ventana de Aplicación
  if (meta.shape === "window") {
    return (
      <>
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
            <div className="drawio-shape__title">
              {effectiveIcon ? <Icon name={effectiveIcon} className="mr-1.5 inline-block shrink-0 align-middle text-xs" /> : null}
              <span>{element.name || "Ventana"}</span>
            </div>
            {description ? <div className="drawio-shape__desc">{description}</div> : null}
          </div>
        </div>
        {resizer}
      </>
    );
  }

  // Caso de Uso Detallado (Formato Libro / Dossier de Especificación)
  if (meta.shape === "detailedUseCase" || element.kind === "detailedUseCase") {
    const isSecondary = element.meta?.useCaseType === "secondary";
    const parentId = element.meta?.parentDetailedUseCaseId;
    const parentElem = parentId ? sheet.elements.find((e) => e.id === parentId) : null;
    const actorName = element.meta?.actor;

    let groupedCount = 0;
    try {
      if (element.meta?.groupedUseCaseIds) {
        const ids = JSON.parse(element.meta.groupedUseCaseIds);
        if (Array.isArray(ids)) groupedCount = ids.length;
      }
    } catch {
      // Ignorar si no es JSON válido
    }

    return (
      <>
        <div
          className={[
            ...classes,
            "group relative overflow-hidden flex flex-col justify-between p-2.5 select-none text-left rounded-xl shadow-md border-2 transition-shadow",
          ].join(" ")}
          style={{
            ...computedStyle,
            ...boxStyle,
            borderColor: element.borderColor ?? (isSecondary ? "#9333ea" : "#d97706"),
            backgroundColor:
              element.color ??
              (isSecondary
                ? "var(--surface, #faf5ff)"
                : "var(--surface, #fffdfa)"),
          }}
        >
          {/* Lomo de libro decorativo a la izquierda */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{
              backgroundColor: isSecondary ? "#9333ea" : "#d97706",
            }}
          />

          <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />

          <div className="pl-1.5">
            {/* Cabecera con Icono de Libro y Badges */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="grid size-5 place-items-center rounded-md text-white shadow-xs shrink-0"
                  style={{
                    backgroundColor: isSecondary ? "#9333ea" : "#d97706",
                  }}
                  title="Caso de Uso Detallado"
                >
                  <Icon name="book" className="text-xs" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
                  «CU Detallado»
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                  isSecondary
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                }`}
              >
                {isSecondary ? "Secundario" : "Primario"}
              </span>
            </div>

            {/* Título del Caso de Uso */}
            <div
              className="font-bold text-xs text-foreground line-clamp-2 leading-tight"
              style={element.textColor ? { color: element.textColor } : undefined}
            >
              {element.name || "Caso de Uso Detallado"}
            </div>

            {/* Actor principal */}
            {actorName ? (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted">
                <Icon name="user" className="text-[10px] shrink-0" />
                <span className="truncate">
                  Actor: <strong className="text-foreground">{actorName}</strong>
                </span>
              </div>
            ) : null}

            {/* Si es secundario y tiene padre */}
            {isSecondary && parentElem ? (
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-purple-700 dark:text-purple-300 truncate">
                <Icon name="link" className="text-[9px] shrink-0" />
                <span className="truncate">
                  Vinculado a: <strong>{parentElem.name}</strong>
                </span>
              </div>
            ) : null}

            {/* Si agrupa casos de uso */}
            {groupedCount > 0 ? (
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">
                <Icon name="cube" className="text-[9px] shrink-0" />
                <span>Agrupa {groupedCount} caso{groupedCount > 1 ? "s" : ""} de uso</span>
              </div>
            ) : null}
          </div>

          {/* Pie interactivo indicando doble clic */}
          <div className="pl-1.5 pt-1.5 mt-1 border-t border-border/50 flex items-center justify-between text-[9px] text-muted font-medium">
            <span className="flex items-center gap-1 truncate">
              <Icon name="file" className="text-[10px] shrink-0" />
              <span>Doble clic para ver ficha</span>
            </span>
            <span className="text-[8px] opacity-75 font-mono shrink-0">RUP / Cockburn</span>
          </div>
        </div>
        {resizer}
      </>
    );
  }

  // Texto libre / Encabezado
  if (meta.shape === "text" || meta.shape === "heading") {
    const isHeading = meta.shape === "heading";
    return (
      <>
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
        {resizer}
      </>
    );
  }

  return (
    <>
      <div className={classes.join(" ")} style={{ ...computedStyle, ...boxStyle }}>
        <SideHandles sides={["top", "right", "bottom", "left"]} show={showHandles} />
        <Content {...content} />
      </div>
      {resizer}
    </>
  );
}
