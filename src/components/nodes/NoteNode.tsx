import type { NodeProps } from "@xyflow/react";
import { kindMeta } from "@/lib/catalog";
import type { NoteFlowNode } from "@/lib/view";

const DEFAULT_BG = "#fff8c5";
const DEFAULT_BORDER = "#e0b83c";
const DEFAULT_TEXT = "#4a3a09";

/** Aplica transparencia al fondo sin afectar al texto ni al borde. */
function withAlpha(hex: string, percent: number): string {
  const channel = (index: number) => Number.parseInt(hex.slice(index, index + 2), 16);
  const alpha = Math.min(100, Math.max(0, percent)) / 100;
  return `rgba(${channel(1)}, ${channel(3)}, ${channel(5)}, ${alpha})`;
}

/**
 * Anotación de texto libre: color de fondo (con transparencia opcional), color
 * del texto, tamaño, borde opcional con su propio color y esquinas redondeadas.
 */
export function NoteNode({ data, selected }: NodeProps<NoteFlowNode>) {
  const { element } = data;
  const meta = kindMeta("note");
  const showBorder = element.border !== false;
  const showFill = element.fill !== false && element.color !== "transparent";
  const radius = element.radius ?? 10;
  const size = element.size ?? 13;
  const background = element.color ?? DEFAULT_BG;
  const opacity = element.bgOpacity ?? 100;

  const bg =
    !showFill || opacity === 0 || background === "transparent"
      ? "transparent"
      : opacity >= 100
        ? background
        : withAlpha(background, opacity);

  return (
    <div
      className={[
        "c4-note",
        selected ? "c4-note--selected" : "",
      ].join(" ")}
      style={{
        background: bg,
        color: element.textColor ?? DEFAULT_TEXT,
        fontSize: `${size}px`,
        borderRadius: `${radius}px`,
        border: showBorder
          ? `2px solid ${element.borderColor ?? DEFAULT_BORDER}`
          : "2px solid transparent",
      }}
    >
      <div className="c4-note__text">{element.name || meta.label}</div>
    </div>
  );
}