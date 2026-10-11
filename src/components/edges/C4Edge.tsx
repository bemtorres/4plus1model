import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { C4FlowEdge } from "@/lib/view";
import { useWorkspace } from "@/lib/workspace-store";

export function C4Edge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  markerStart,
  style,
  selected,
}: EdgeProps<C4FlowEdge>) {
  const { select } = useWorkspace();
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
    offset: 20,
  });

  const relationship = data?.relationship;
  const label = relationship?.label?.trim();
  const technology = relationship?.technology?.trim();

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
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
          <div className={`c4-edge__label ${selected ? "c4-edge__label--selected" : ""}`}>
            {label || "sin etiqueta"}
            {technology ? <span className="c4-edge__tech">«{technology}»</span> : null}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
