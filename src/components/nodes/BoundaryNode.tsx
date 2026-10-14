import type { NodeProps } from "@xyflow/react";
import type { BoundaryFlowNode } from "@/lib/view";

export function BoundaryNode({ data }: NodeProps<BoundaryFlowNode>) {
  return (
    <div className="uc-boundary">
      <div className="uc-boundary__label">
        <span>{data.title}</span>
      </div>
    </div>
  );
}
