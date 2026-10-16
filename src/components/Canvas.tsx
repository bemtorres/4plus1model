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
import { kindMeta } from "@/lib/diagrams";
import { useT } from "@/i18n";
import { mergeFlowEdges, mergeFlowNodes, withBoundaryGeometry } from "@/lib/flow-state";
import type { DiagramElement, ElementKind, HandleSide } from "@/lib/types";
import { HANDLE_SIDES } from "@/lib/types";
import { useProject } from "@/lib/project-store";
import { NODE_HEIGHT, NODE_WIDTH, type DiagramFlowEdge, type FlowNode } from "@/lib/view";
import { DiagramEdge } from "./edges/DiagramEdge";
import { BoundaryNode } from "./nodes/BoundaryNode";
import { DiagramElementNode } from "./nodes/DiagramElementNode";
import { NoteNode } from "./nodes/NoteNode";
import { NodeContextMenu } from "./NodeContextMenu";
import { ReadOnlyBanner } from "./ReadOnlyBanner";
import { DetailedUseCaseDialog } from "./DetailedUseCaseDialog";

const nodeTypes = {
  element: DiagramElementNode,
  note: NoteNode,
  boundary: BoundaryNode,
};

const edgeTypes = {
  element: DiagramEdge,
};

const DRAG_KIND = "application/x-kind";
const DRAG_EXTRA = "application/x-extra";
const FIT_VIEW_EVENT = "modeler:fit-view";

/** Marcador de triángulo hueco para generalizaciones UML (véase view.ts). */
function UmlMarkers() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <marker
          id="uml-generalization"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="11"
          markerHeight="11"
          orient="auto-start-reverse"
        >
          <path
            d="M1,1 L11,6 L1,11"
            fill="none"
            stroke="context-stroke"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </svg>
  );
}

/** React Flow devuelve el id del handle; sólo aceptamos las 4 caras. */
function asSide(handleId: string | null | undefined): HandleSide | null {
  return HANDLE_SIDES.includes(handleId as HandleSide) ? (handleId as HandleSide) : null;
}

function CanvasInner() {
  const {
    sheet,
    view,
    level,
    scopeId,
    selection,
    layoutSignal,
    readOnly,
    select,
    moveElement,
    updateElement,
    addElement,
    removeElement,
    duplicateElement,
    addRelationship,
    drillInto,
    beginTransaction,
    endTransaction,
  } = useProject();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const t = useT();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: DiagramElement;
  } | null>(null);

  const [detailedModalId, setDetailedModalId] = useState<string | null>(null);

  // Escuchar evento global para abrir la ficha de CU detallado desde cualquier parte
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom.detail?.id) {
        setDetailedModalId(custom.detail.id);
      }
    };
    window.addEventListener("modeler:open-detailed-use-case", handler);
    return () => window.removeEventListener("modeler:open-detailed-use-case", handler);
  }, []);

  const groupIntoDetailedUseCase = useCallback(
    (ucElement: DiagramElement) => {
      const newX = ucElement.x + 260;
      const newY = ucElement.y;

      const connectedActorRel = sheet.relationships.find(
        (rel) =>
          (rel.source === ucElement.id &&
            sheet.elements.find((e) => e.id === rel.target)?.kind === "actor") ||
          (rel.target === ucElement.id &&
            sheet.elements.find((e) => e.id === rel.source)?.kind === "actor"),
      );
      let actorName = "";
      if (connectedActorRel) {
        const actorId =
          connectedActorRel.source === ucElement.id
            ? connectedActorRel.target
            : connectedActorRel.source;
        actorName = sheet.elements.find((e) => e.id === actorId)?.name ?? "";
      }

      const childSteps = sheet.elements
        .filter((e) => e.kind === "step" && e.parentId === ucElement.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const mainScenario =
        childSteps.length > 0
          ? childSteps
              .map(
                (s, i) =>
                  `${i + 1}. ${s.name}${s.description ? ` (${s.description})` : ""}`,
              )
              .join("\n")
          : "";

      const newId = addElement(
        "detailedUseCase",
        { x: newX, y: newY },
        ucElement.parentId ?? undefined,
        {
          name: ucElement.name,
          description: `Especificación formal de ${ucElement.name}`,
          icon: "book",
          meta: {
            useCaseType: "primary",
            actor: actorName,
            stakeholders: "",
            preconditions: ucElement.meta?.preconditions ?? "",
            postconditions: ucElement.meta?.postconditions ?? "",
            mainScenario,
            alternativeFlows: "",
            specialRequirements: "",
            techVariations: "",
            frequency: "",
            openIssues: "",
            groupedUseCaseIds: JSON.stringify([ucElement.id]),
          },
        },
      );

      addRelationship({
        source: ucElement.id,
        target: newId,
        sourceHandle: "right",
        targetHandle: "left",
        label: "especifica",
        description: "Documentación detallada del caso de uso",
        style: "association",
      });

      select({ type: "element", id: newId });
      setDetailedModalId(newId);
    },
    [sheet.relationships, sheet.elements, addElement, addRelationship, select],
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      event.preventDefault();
      if (readOnly) return;
      const el = sheet.elements.find((e) => e.id === node.id);
      if (!el) return;
      select({ type: "element", id: node.id });
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        element: el,
      });
    },
    [readOnly, select, sheet.elements],
  );

  // Estado propio del lienzo: React Flow necesita conservar la identidad y las
  // medidas de cada nodo, así que el modelo nunca reemplaza estos objetos.
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<DiagramFlowEdge[]>([]);

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
        } else if (change.type === "dimensions" && change.dimensions && !change.resizing) {
          // Fin del redimensionado (NodeResizer): persistir el nuevo tamaño.
          if (!readOnly) {
            updateElement(change.id, {
              width: Math.round(change.dimensions.width),
              height: Math.round(change.dimensions.height),
            });
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
    [moveElement, updateElement, select, selection, readOnly],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((current) => applyEdgeChanges(changes, current) as DiagramFlowEdge[]);
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
        label: "",
        description: "",
        style: "association",
      });
    },
    [addRelationship, readOnly],
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
      if (!data.element) return;
      if (data.element.kind === "detailedUseCase") {
        setDetailedModalId(node.id);
        return;
      }
      if (kindMeta(sheet.diagram, data.element.kind).drillable) {
        drillInto(node.id);
      }
    },
    [drillInto, sheet.diagram],
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
      const extraStr = event.dataTransfer.getData(DRAG_EXTRA);
      let extra: Partial<DiagramElement> | undefined;
      if (extraStr) {
        try {
          extra = JSON.parse(extraStr);
        } catch {
          // Ignorar JSON malformado
        }
      }
      const point = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addElement(
        kind,
        {
          x: point.x - NODE_WIDTH / 2,
          y: point.y - NODE_HEIGHT / 2,
        },
        undefined,
        extra,
      );
    },
    [addElement, screenToFlowPosition, readOnly],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fitView({ padding: 0.2, duration: 320, maxZoom: 1 });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [`${sheet.id}:${level}:${scopeId ?? "root"}`, layoutSignal, fitView]);

  useEffect(() => {
    const onFit = () => {
      void fitView({ padding: 0.2, duration: 320, maxZoom: 1 });
    };
    window.addEventListener(FIT_VIEW_EVENT, onFit);
    return () => window.removeEventListener(FIT_VIEW_EVENT, onFit);
  }, [fitView]);

  const isEmpty = nodes.filter((node) => node.type === "element" || node.type === "note").length === 0;

  return (
    <div className="relative h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReadOnlyBanner />
      <UmlMarkers />
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
        defaultEdgeOptions={{ type: "element" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          nodeColor={(node) => {
            if (node.type === "boundary") return "rgba(100,116,139,0.2)";
            const data = node.data as { element?: { kind: ElementKind } };
            return data.element ? kindMeta(sheet.diagram, data.element.kind).bg : "#94a3b8";
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
          onOpenDetailed={() => setDetailedModalId(contextMenu.element.id)}
          onGroupIntoDetailed={() => groupIntoDetailedUseCase(contextMenu.element)}
        />
      ) : null}

      <DetailedUseCaseDialog
        isOpen={Boolean(detailedModalId)}
        onOpenChange={(open) => {
          if (!open) setDetailedModalId(null);
        }}
        elementId={detailedModalId}
        onSelectElement={(id) => setDetailedModalId(id)}
      />

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
  return <CanvasInner />;
}

export { DRAG_KIND, DRAG_EXTRA, FIT_VIEW_EVENT };
