import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { effectiveEdgeLabel } from "@/lib/view";
import type { DiagramFlowEdge } from "@/lib/view";
import { useProject } from "@/lib/project-store";

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
  const { select } = useProject();
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

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute select-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              cursor: "pointer",
              pointerEvents: "all",
            }}
            onClick={(e) => {
              e.stopPropagation();
              select({ type: "relationship", id });
            }}
          >
            <div
              className={[
                "c4-edge__label",
                isStereotype ? "c4-edge__label--stereo" : "",
                selected ? "c4-edge__label--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
