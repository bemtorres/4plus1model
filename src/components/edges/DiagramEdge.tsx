import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { effectiveEdgeLabel } from "@/lib/view";
import type { DiagramFlowEdge } from "@/lib/view";
import { useProject } from "@/lib/project-store";
import { Icon } from "@/components/icons";

export function DiagramEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  markerStart,
  style,
  selected,
}: EdgeProps<DiagramFlowEdge>) {
  const { select, invertRelationship, readOnly } = useProject();
  // UML clásico: las flechas de casos de uso son líneas rectas.
  const [path, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const relationship = data?.relationship;
  const label = relationship ? effectiveEdgeLabel(relationship) : "";
  const isStereotype = label.startsWith("«");
  const showOverlay = Boolean(label) || (selected && !readOnly);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      {showOverlay ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute select-none flex items-center gap-1.5"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            {label ? (
              <div
                className={[
                  "c4-edge__label cursor-pointer",
                  isStereotype ? "c4-edge__label--stereo" : "",
                  selected ? "c4-edge__label--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(e) => {
                  e.stopPropagation();
                  select({ type: "relationship", id });
                }}
              >
                {label}
              </div>
            ) : null}

            {selected && !readOnly ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  invertRelationship(id);
                }}
                className="flex items-center justify-center size-5 rounded-full bg-surface border border-accent text-accent hover:bg-accent hover:text-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                title="Invertir dirección de la flecha (Origen ⇄ Destino)"
                aria-label="Invertir dirección de la flecha"
              >
                <Icon name="swap" className="text-[11px]" />
              </button>
            ) : null}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
