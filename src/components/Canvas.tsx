import { useCallback, useEffect, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { kindMeta } from "@/lib/catalog";
import { useT } from "@/i18n";
import { mergeFlowEdges, mergeFlowNodes, withBoundaryGeometry } from "@/lib/flow-state";
import type { C4Element, ElementKind, HandleSide } from "@/lib/types";
import { HANDLE_SIDES } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace-store";
import { NODE_HEIGHT, NODE_WIDTH, type C4FlowEdge, type FlowNode } from "@/lib/view";
import { C4Edge } from "./edges/C4Edge";
import { BoundaryNode } from "./nodes/BoundaryNode";
import { C4ElementNode } from "./nodes/C4ElementNode";
import { NoteNode } from "./nodes/NoteNode";
import { NodeContextMenu } from "./NodeContextMenu";
import { ReadOnlyBanner } from "./ReadOnlyBanner";

const nodeTypes = {
  c4: C4ElementNode,
  note: NoteNode,
  boundary: BoundaryNode,
};

const edgeTypes = {
  c4: C4Edge,
};

const DRAG_KIND = "application/x-c4-kind";
const FIT_VIEW_EVENT = "c4:fit-view";

/** React Flow devuelve el id del handle; sólo aceptamos las 4 caras C4. */
function asSide(handleId: string | null | undefined): HandleSide | null {
  return HANDLE_SIDES.includes(handleId as HandleSide) ? (handleId as HandleSide) : null;
}

function CanvasInner() {
  const {
    workspace,
    view,
    level,
    scopeId,
    selection,
    layoutSignal,
    readOnly,
    select,
    moveElement,
    addElement,
    removeElement,
    duplicateElement,
    addRelationship,
    drillInto,
    beginTransaction,
    endTransaction,
  } = useWorkspace();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const t = useT();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: C4Element;
  } | null>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      event.preventDefault();
      if (readOnly) return;
      const el = workspace.elements.find((e) => e.id === node.id);
      if (!el) return;
      select({ type: "element", id: node.id });
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        element: el,
      });
    },
    [readOnly, select, workspace.elements],
  );

  // Estado propio del lienzo: React Flow necesita conservar la identidad y las
  // medidas de cada nodo, así que el modelo nunca reemplaza estos objetos.
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<C4FlowEdge[]>([]);

  const detailIdsRef = useRef(view.detailIds);
  detailIdsRef.current = view.detailIds;

  useEffect(() => {
    setNodes((current) => mergeFlowNodes(current, view.nodes, view.detailIds));
  }, [view.nodes, view.detailIds]);

  useEffect(() => {
    setEdges((current) => mergeFlowEdges(current, view.edges));
  }, [view.edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((current) =>
        withBoundaryGeometry(
          applyNodeChanges(changes, current) as FlowNode[],
          detailIdsRef.current,
        ),
      );

      for (const change of changes) {
        if (change.type === "position" && change.position) {
          if (!readOnly) {
            moveElement(change.id, change.position.x, change.position.y);
          }
        } else if (change.type === "select") {
          if (change.selected) {
            select({ type: "element", id: change.id });
          } else if (selection?.type === "element" && selection.id === change.id) {
            select(null);
          }
        }
      }
    },
    [moveElement, select, selection, readOnly],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((current) => applyEdgeChanges(changes, current) as C4FlowEdge[]);
      for (const change of changes) {
        if (change.type === "select") {
          if (change.selected) {
            select({ type: "relationship", id: change.id });
          } else if (selection?.type === "relationship" && selection.id === change.id) {
            select(null);
          }
        }
      }
    },
    [select, selection],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly || !connection.source || !connection.target) return;
      addRelationship({
        source: connection.source,
        target: connection.target,
        sourceHandle: asSide(connection.sourceHandle),
        targetHandle: asSide(connection.targetHandle),
        label: t("relation.defaultLabel"),
        technology: "",
        description: "",
        style: "sync",
      });
    },
    [addRelationship, t, readOnly],
  );

  const onNodeDragStart = useCallback(() => {
    if (!readOnly) beginTransaction();
  }, [beginTransaction, readOnly]);

  const onNodeDragStop = useCallback(() => {
    if (!readOnly) endTransaction();
  }, [endTransaction, readOnly]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: { id: string; data: unknown }) => {
      const data = node.data as { element?: { kind: ElementKind } };
      if (data.element && kindMeta(data.element.kind).drillable) drillInto(node.id);
    },
    [drillInto],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (readOnly) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    [readOnly],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (readOnly) return;
      const kind = event.dataTransfer.getData(DRAG_KIND) as ElementKind | "";
      if (!kind) return;
      const point = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addElement(kind, {
        x: point.x - NODE_WIDTH / 2,
        y: point.y - NODE_HEIGHT / 2,
      });
    },
    [addElement, screenToFlowPosition, readOnly],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fitView({ padding: 0.2, duration: 320, maxZoom: 1 });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [`${level}:${scopeId ?? "root"}`, layoutSignal, fitView]);

  useEffect(() => {
    const onFit = () => {
      void fitView({ padding: 0.2, duration: 320, maxZoom: 1 });
    };
    window.addEventListener(FIT_VIEW_EVENT, onFit);
    return () => window.removeEventListener(FIT_VIEW_EVENT, onFit);
  }, [fitView]);

  const isEmpty = nodes.filter((node) => node.type === "c4").length === 0;

  return (
    <div className="relative h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReadOnlyBanner />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={(_event, node) => {
          select({ type: "element", id: node.id });
          setContextMenu(null);
        }}
        onEdgeClick={(_event, edge) => {
          select({ type: "relationship", id: edge.id });
          setContextMenu(null);
        }}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={(event) => {
          event.preventDefault();
          setContextMenu(null);
        }}
        onPaneClick={() => {
          select(null);
          setContextMenu(null);
        }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={26}
        deleteKeyCode={null}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable
        minZoom={0.15}
        maxZoom={2.2}
        defaultEdgeOptions={{ type: "c4" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          nodeColor={(node) => {
            if (node.type === "boundary") return "rgba(147,112,219,0.18)";
            const data = node.data as { element?: { kind: ElementKind } };
            return data.element ? kindMeta(data.element.kind).bg : "#94a3b8";
          }}
          nodeStrokeWidth={2}
          maskColor="color-mix(in oklab, var(--background) 70%, transparent)"
        />
      </ReactFlow>

      {contextMenu ? (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          element={contextMenu.element}
          onDuplicate={() => duplicateElement(contextMenu.element.id)}
          onDelete={() => removeElement(contextMenu.element.id)}
          onClose={() => setContextMenu(null)}
        />
      ) : null}

      {isEmpty ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-sm rounded-xl border border-border bg-surface/90 px-5 py-4 text-center shadow-surface">
            <p className="text-sm font-semibold text-foreground">{t("canvas.emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted">{t("canvas.emptyBody")}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

export { DRAG_KIND, FIT_VIEW_EVENT };
