import type { NodeProps } from "@xyflow/react";
import type { BoundaryFlowNode } from "@/lib/view";

export function BoundaryNode({ data }: NodeProps<BoundaryFlowNode>) {
  return (
    <div className="c4-boundary">
      <div className="c4-boundary__label">
        <span>{data.title}</span>
        {data.subtitle ? <span className="opacity-70">{data.subtitle}</span> : null}
      </div>
    </div>
  );
}
