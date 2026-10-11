import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { kindMeta, defaultNodeSize } from "./catalog";
import { createId } from "./id";
import { centerPositions, computeLayout } from "./layout";
import { createEmptyWorkspace } from "./sample";
import { isReadOnlyFromUrl } from "./share";
import { createInitialState, savePersistedState } from "./storage";
import {
  NODE_WIDTH,
  buildView,
  indexElements,
  levelForElement,
  resolveScopeId,
  type ViewResult,
} from "./view";
import type {
  C4Element,
  C4Relationship,
  ElementKind,
  Level,
  Selection,
  Workspace,
} from "./types";

const HISTORY_LIMIT = 80;
const AUTOSAVE_DELAY = 350;

interface HistoryState {
  past: Workspace[];
  present: Workspace;
  future: Workspace[];
}

type Action =
  | { type: "commit"; next: Workspace | ((workspace: Workspace) => Workspace) }
  | { type: "mutate"; next: Workspace | ((workspace: Workspace) => Workspace) }
  | { type: "checkpoint"; snapshot: Workspace }
  | { type: "replace"; workspace: Workspace; withHistory?: boolean }
  | { type: "undo" }
  | { type: "redo" };

function stamp(workspace: Workspace): Workspace {
  return { ...workspace, updatedAt: new Date().toISOString() };
}

function historyReducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case "commit": {
      const next =
        typeof action.next === "function" ? action.next(state.present) : action.next;
      if (!next || next === state.present) return state;
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: stamp(next),
        future: [],
      };
    }
    case "mutate": {
      const next =
        typeof action.next === "function" ? action.next(state.present) : action.next;
      if (!next || next === state.present) return state;
      return { ...state, present: stamp(next) };
    }
    case "checkpoint": {
      if (action.snapshot === state.present) return state;
      return {
        past: [...state.past, action.snapshot].slice(-HISTORY_LIMIT),
        present: state.present,
        future: [],
      };
    }
    case "replace": {
      if (action.withHistory === false) {
        return { ...state, present: stamp(action.workspace) };
      }
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: stamp(action.workspace),
        future: [],
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: rest,
      };
    }
    default:
      return state;
  }
}

export interface WorkspaceApi {
  workspace: Workspace;
  level: Level;
  scopeId: string | null;
  selection: Selection;
  view: ViewResult;
  canUndo: boolean;
  canRedo: boolean;
  /** `true` cuando el diagrama viene de un enlace compartido: no se puede editar. */
  readOnly: boolean;
  setReadOnly: (readOnly: boolean) => void;
  /** Se incrementa al reorganizar para que el lienzo se ajuste a la vista. */
  layoutSignal: number;
  setLevel: (level: Level) => void;
  setScope: (scopeId: string | null) => void;
  select: (selection: Selection) => void;
  drillInto: (elementId: string) => void;
  goUp: () => void;
  addElement: (kind: ElementKind, position?: { x: number; y: number }) => string;
  updateElement: (id: string, patch: Partial<C4Element>) => void;
  moveElement: (id: string, x: number, y: number) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => string | null;
  addRelationship: (relationship: Omit<C4Relationship, "id">) => void;
  updateRelationship: (id: string, patch: Partial<C4Relationship>) => void;
  removeRelationship: (id: string) => void;
  renameWorkspace: (name: string, description: string) => void;
  autoLayout: () => void;
  importWorkspace: (workspace: Workspace, options?: { force?: boolean }) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  beginTransaction: () => void;
  endTransaction: () => void;
}

const WorkspaceContext = createContext<WorkspaceApi | null>(null);

export function useWorkspace(): WorkspaceApi {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace debe usarse dentro de <WorkspaceProvider>");
  return context;
}

function nextName(workspace: Workspace, kind: ElementKind): string {
  const label = kindMeta(kind).label;
  const sameKind = workspace.elements.filter((element) => element.kind === kind).length;
  return sameKind === 0 ? label : `${label} ${sameKind + 1}`;
}

/** Posición libre estimada cuando se añade un elemento sin coordenadas. */
function fallbackPosition(workspace: Workspace, kind: ElementKind): { x: number; y: number } {
  const meta = kindMeta(kind);
  const siblings = workspace.elements.filter((element) => element.kind === meta.kind);
  if (siblings.length === 0) return { x: 120, y: 120 };
  const maxX = Math.max(...siblings.map((element) => element.x));
  const minY = Math.min(...siblings.map((element) => element.y));
  return { x: maxX + NODE_WIDTH + 60, y: minY };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const initial = useRef(createInitialState()).current;
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial.workspace,
    future: [],
  });
  const [level, setLevelState] = useState<Level>(initial.level);
  const [scopeId, setScopeIdState] = useState<string | null>(initial.scopeId);
  const [selection, setSelection] = useState<Selection>(null);
  const [layoutSignal, setLayoutSignal] = useState(0);
  const [readOnly, setReadOnly] = useState<boolean>(isReadOnlyFromUrl);
  const readOnlyRef = useRef(false);
  readOnlyRef.current = readOnly;
  const transactionRef = useRef<Workspace | null>(null);

  const workspace = history.present;

  // El ámbito se recalcula si el elemento seleccionado deja de existir.
  useEffect(() => {
    const resolved = resolveScopeId(workspace, level, scopeId);
    if (resolved !== scopeId) setScopeIdState(resolved);
  }, [workspace, level, scopeId]);

  // Autosave: nunca se pisa el trabajo guardado con un diagrama compartido.
  useEffect(() => {
    if (readOnly) return;
    const timer = window.setTimeout(() => {
      savePersistedState({ workspace, level, scopeId });
    }, AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [workspace, level, scopeId, readOnly]);

  const commit = useCallback(
    (next: Workspace | ((current: Workspace) => Workspace), options?: { force?: boolean }) => {
      if (readOnlyRef.current && !options?.force) return;
      dispatch({ type: "commit", next });
    },
    [],
  );

  const view = useMemo(
    () => buildView(workspace, level, scopeId, selection),
    [workspace, level, scopeId, selection],
  );

  const setLevel = useCallback(
    (next: Level) => {
      setLevelState(next);
      setScopeIdState((current) => resolveScopeId(workspace, next, current));
      setSelection(null);
    },
    [workspace],
  );

  const setScope = useCallback(
    (next: string | null) => {
      setScopeIdState(resolveScopeId(workspace, level, next));
      setSelection(null);
    },
    [workspace, level],
  );

  const drillInto = useCallback(
    (elementId: string) => {
      const element = indexElements(workspace).get(elementId);
      const nextLevel = levelForElement(element);
      if (!nextLevel) return;
      setLevelState(nextLevel);
      setScopeIdState(elementId);
      setSelection({ type: "element", id: elementId });
    },
    [workspace],
  );

  const goUp = useCallback(() => {
    const byId = indexElements(workspace);
    const current = scopeId ? byId.get(scopeId) : undefined;
    const parent = current?.parentId ? byId.get(current.parentId) : undefined;
    if (!current) {
      setLevelState("context");
      setScopeIdState(null);
      return;
    }
    if (!parent) {
      setLevelState("context");
      setScopeIdState(null);
      setSelection(null);
      return;
    }
    const nextLevel = levelForElement(parent);
    if (nextLevel) {
      setLevelState(nextLevel);
      setScopeIdState(parent.id);
    }
    setSelection(null);
  }, [workspace, scopeId]);

  const addElement = useCallback(
    (kind: ElementKind, position?: { x: number; y: number }) => {
      const id = createId("el");
      // Las notas son anotaciones sueltas: nunca cuelgan de un contenedor.
      const parentId = kind === "note" || level === "context" ? null : scopeId;
      const spot = position ?? fallbackPosition(workspace, kind);
      const next: C4Element = {
        id,
        kind,
        name: nextName(workspace, kind),
        description: "",
        technology: "",
        tags: [],
        parentId,
        x: Math.round(spot.x),
        y: Math.round(spot.y),
      };
      commit((current) => ({ ...current, elements: [...current.elements, next] }));
      setSelection({ type: "element", id });
      return id;
    },
    [workspace, level, scopeId, commit],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<C4Element>) => {
      commit((current) => ({
        ...current,
        elements: current.elements.map((element) =>
          element.id === id ? { ...element, ...patch } : element,
        ),
      }));
    },
    [commit],
  );

  const moveElement = useCallback(
    (id: string, x: number, y: number) => {
      if (readOnlyRef.current) return;
      dispatch({
        type: "mutate",
        next: (current) => {
          const element = current.elements.find((item) => item.id === id);
          // Sin cambios reales no provocamos renderizados.
          if (!element || (element.x === x && element.y === y)) return current;
          return {
            ...current,
            elements: current.elements.map((item) =>
              item.id === id ? { ...item, x, y } : item,
            ),
          };
        },
      });
    },
    [],
  );

  const removeElement = useCallback(
    (id: string) => {
      commit((current) => {
        const doomed = new Set<string>([id]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const element of current.elements) {
            if (element.parentId && doomed.has(element.parentId) && !doomed.has(element.id)) {
              doomed.add(element.id);
              changed = true;
            }
          }
        }
        return {
          ...current,
          elements: current.elements.filter((element) => !doomed.has(element.id)),
          relationships: current.relationships.filter(
            (relationship) =>
              !doomed.has(relationship.source) && !doomed.has(relationship.target),
          ),
        };
      });
      setSelection((current) => (current && "id" in current && current.id === id ? null : current));
    },
    [commit],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      if (readOnlyRef.current) return null;
      let newId: string | null = null;
      commit((current) => {
        const target = current.elements.find((el) => el.id === id);
        if (!target) return current;

        newId = createId("el");
        const copy: C4Element = {
          ...target,
          id: newId,
          name: `${target.name} (copia)`,
          x: target.x + 40,
          y: target.y + 40,
        };
        return {
          ...current,
          elements: [...current.elements, copy],
        };
      });
      if (newId) {
        setSelection({ type: "element", id: newId });
      }
      return newId;
    },
    [commit],
  );

  const addRelationship = useCallback(
    (relationship: Omit<C4Relationship, "id">) => {
      const id = createId("rel");
      commit((current) => {
        const duplicate = current.relationships.some(
          (item) => item.source === relationship.source && item.target === relationship.target,
        );
        if (duplicate) return current;
        return { ...current, relationships: [...current.relationships, { ...relationship, id }] };
      });
      setSelection({ type: "relationship", id });
    },
    [commit],
  );

  const updateRelationship = useCallback(
    (id: string, patch: Partial<C4Relationship>) => {
      commit((current) => ({
        ...current,
        relationships: current.relationships.map((relationship) =>
          relationship.id === id ? { ...relationship, ...patch } : relationship,
        ),
      }));
    },
    [commit],
  );

  const removeRelationship = useCallback(
    (id: string) => {
      commit((current) => ({
        ...current,
        relationships: current.relationships.filter((relationship) => relationship.id !== id),
      }));
      setSelection((current) =>
        current && "id" in current && current.id === id ? null : current,
      );
    },
    [commit],
  );

  const renameWorkspace = useCallback(
    (name: string, description: string) => {
      commit((current) => ({ ...current, name, description }));
    },
    [commit],
  );

  const autoLayout = useCallback(() => {
    const nodes = view.nodes.filter((node) => node.type === "c4");
    if (nodes.length === 0) return;
    const people = nodes
      .filter((node) => node.data.element.kind === "person")
      .map((node) => node.id);
    const layoutNodes = nodes.map((node) => {
      const size = defaultNodeSize(node.data.element.kind);
      return {
        id: node.id,
        width: node.measured?.width ?? size.width,
        height: node.measured?.height ?? size.height,
        order: node.position.y * 10_000 + node.position.x,
      };
    });
    const layoutEdges = view.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));
    const points = centerPositions(
      computeLayout(layoutNodes, layoutEdges, { firstLayer: people }),
    );
    commit((current) => ({
      ...current,
      elements: current.elements.map((element) => {
        const point = points.get(element.id);
        return point ? { ...element, x: point.x, y: point.y } : element;
      }),
    }));
    setLayoutSignal((value) => value + 1);
  }, [view, commit]);

  const importWorkspace = useCallback(
    (next: Workspace, options?: { force?: boolean }) => {
      if (readOnlyRef.current && !options?.force) return;
      dispatch({ type: "replace", workspace: next });
      setLevelState("context");
      setScopeIdState(null);
      setSelection(null);
    },
    [],
  );

  const clearAll = useCallback(() => {
    importWorkspace(createEmptyWorkspace());
  }, [importWorkspace]);

  const undo = useCallback(() => {
    if (readOnlyRef.current) return;
    dispatch({ type: "undo" });
    setSelection(null);
  }, []);

  const redo = useCallback(() => {
    if (readOnlyRef.current) return;
    dispatch({ type: "redo" });
    setSelection(null);
  }, []);

  const beginTransaction = useCallback(() => {
    transactionRef.current = workspace;
  }, [workspace]);

  const endTransaction = useCallback(() => {
    const snapshot = transactionRef.current;
    transactionRef.current = null;
    if (snapshot && !readOnlyRef.current) dispatch({ type: "checkpoint", snapshot });
  }, []);

  const api = useMemo<WorkspaceApi>(
    () => ({
      workspace,
      level,
      scopeId,
      selection,
      view,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      readOnly,
      setReadOnly,
      layoutSignal,
      setLevel,
      setScope,
      select: setSelection,
      drillInto,
      goUp,
      addElement,
      updateElement,
      moveElement,
      removeElement,
      duplicateElement,
      addRelationship,
      updateRelationship,
      removeRelationship,
      renameWorkspace,
      autoLayout,
      importWorkspace,
      clearAll,
      undo,
      redo,
      beginTransaction,
      endTransaction,
    }),
    [
      workspace,
      level,
      scopeId,
      selection,
      view,
      history.past.length,
      history.future.length,
      readOnly,
      layoutSignal,
      setLevel,
      setScope,
      drillInto,
      goUp,
      addElement,
      updateElement,
      moveElement,
      removeElement,
      duplicateElement,
      addRelationship,
      updateRelationship,
      removeRelationship,
      renameWorkspace,
      autoLayout,
      importWorkspace,
      clearAll,
      undo,
      redo,
      beginTransaction,
      endTransaction,
    ],
  );

  return <WorkspaceContext.Provider value={api}>{children}</WorkspaceContext.Provider>;
}
