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
import { createId } from "./id";
import { centerPositions, computeLayout } from "./layout";
import { createEmptyProject } from "./sample";
import { isReadOnlyFromUrl } from "./share";
import { createInitialState, savePersistedState } from "./storage";
import { defaultNodeSize, diagramDef, kindMeta } from "./diagrams";
import {
  buildView,
  indexElements,
  levelForElement,
  navigableElements,
  resolveScopeId,
  type ViewResult,
} from "./view";
import type {
  DiagramElement,
  DiagramId,
  DiagramRelationship,
  ElementKind,
  Level,
  Project,
  Selection,
  Sheet,
} from "./types";

const HISTORY_LIMIT = 80;
const AUTOSAVE_DELAY = 350;

interface HistoryState {
  past: Project[];
  present: Project;
  future: Project[];
}

type Action =
  | { type: "commit"; next: Project | ((project: Project) => Project) }
  | { type: "mutate"; next: Project | ((project: Project) => Project) }
  | { type: "checkpoint"; snapshot: Project }
  | { type: "replace"; project: Project; withHistory?: boolean }
  | { type: "undo" }
  | { type: "redo" };

function stamp(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
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
        return { ...state, present: stamp(action.project) };
      }
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: stamp(action.project),
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

/** Sustituye una hoja por id; si no existe, devuelve el proyecto intacto. */
function withSheet(
  project: Project,
  sheetId: string,
  update: (sheet: Sheet) => Sheet,
): Project {
  let changed = false;
  const sheets = project.sheets.map((sheet) => {
    if (sheet.id !== sheetId) return sheet;
    const next = update(sheet);
    if (next !== sheet) changed = true;
    return next;
  });
  return changed ? { ...project, sheets } : project;
}

export interface ProjectApi {
  project: Project;
  activeSheetId: string;
  sheet: Sheet;
  selection: Selection;
  view: ViewResult;
  canUndo: boolean;
  canRedo: boolean;
  /** `true` cuando el proyecto viene de un enlace compartido: no se puede editar. */
  readOnly: boolean;
  setReadOnly: (readOnly: boolean) => void;
  /** Se incrementa al reorganizar para que el lienzo se ajuste a la vista. */
  layoutSignal: number;
  // hojas
  addSheet: (diagram?: DiagramId, name?: string) => string;
  removeSheet: (id: string) => void;
  renameSheet: (id: string, name: string) => void;
  updateSheet: (id: string, patch: Partial<Pick<Sheet, "name" | "color" | "icon" | "diagram">>) => void;
  duplicateSheet: (id: string) => string;
  selectSheet: (id: string) => void;
  renameProject: (name: string, description: string) => void;
  // vista
  /** Nivel activo de la hoja actual. */
  level: Level;
  setLevel: (level: Level) => void;
  setScope: (scopeId: string | null) => void;
  drillInto: (elementId: string) => void;
  goUp: () => void;
  /** Ámbito efectivo (resuelto) del nivel actual. */
  scopeId: string | null;
  /** Elementos navegables del nivel actual (selector de ámbito). */
  navigable: DiagramElement[];
  // elementos/relaciones (hoja activa)
  select: (selection: Selection) => void;
  addElement: (
    kind: ElementKind,
    position?: { x: number; y: number },
    parentId?: string | null,
    extra?: Partial<DiagramElement>,
  ) => string;
  updateElement: (id: string, patch: Partial<DiagramElement>) => void;
  moveElement: (id: string, x: number, y: number) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => string | null;
  reorderStep: (useCaseId: string, orderedStepIds: string[]) => void;
  addRelationship: (relationship: Omit<DiagramRelationship, "id">) => void;
  updateRelationship: (id: string, patch: Partial<DiagramRelationship>) => void;
  invertRelationship: (id: string) => void;
  removeRelationship: (id: string) => void;
  // acciones
  autoLayout: () => void;
  importProject: (project: Project, options?: { force?: boolean }) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  beginTransaction: () => void;
  endTransaction: () => void;
}

const ProjectContext = createContext<ProjectApi | null>(null);

export function useProject(): ProjectApi {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject debe usarse dentro de <ProjectProvider>");
  return context;
}

/** Alias temporal para migrar los componentes poco a poco. */
export const useWorkspace = useProject;
export type WorkspaceApi = ProjectApi;

function nextName(sheet: Sheet, kind: ElementKind): string {
  const label = kindMeta(sheet.diagram, kind).label;
  const sameKind = sheet.elements.filter((element) => element.kind === kind).length;
  return sameKind === 0 ? label : `${label} ${sameKind + 1}`;
}

/** Posición libre estimada cuando se añade un elemento sin coordenadas. */
function fallbackPosition(sheet: Sheet, kind: ElementKind): { x: number; y: number } {
  const size = defaultNodeSize(sheet.diagram, kind);
  const siblings = sheet.elements.filter((element) => element.kind === kind);
  if (siblings.length === 0) return { x: 120, y: 120 };
  const maxX = Math.max(...siblings.map((element) => element.x));
  const minY = Math.min(...siblings.map((element) => element.y));
  return { x: maxX + size.width + 60, y: minY };
}

/** Clona una hoja con todos los ids nuevos (elementos, relaciones y padres). */
function cloneSheet(sheet: Sheet, name: string): Sheet {
  const idMap = new Map<string, string>();
  for (const element of sheet.elements) idMap.set(element.id, createId("el"));
  return {
    ...sheet,
    id: createId("sh"),
    name,
    elements: sheet.elements.map((element) => ({
      ...element,
      id: idMap.get(element.id)!,
      parentId: element.parentId ? (idMap.get(element.parentId) ?? null) : null,
    })),
    relationships: sheet.relationships.map((relationship) => ({
      ...relationship,
      id: createId("rel"),
      source: idMap.get(relationship.source) ?? relationship.source,
      target: idMap.get(relationship.target) ?? relationship.target,
    })),
  };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const initial = useRef(createInitialState()).current;
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial.project,
    future: [],
  });
  const [activeSheetId, setActiveSheetId] = useState<string>(initial.activeSheetId);
  const [selection, setSelection] = useState<Selection>(null);
  const [layoutSignal, setLayoutSignal] = useState(0);
  const [readOnly, setReadOnly] = useState<boolean>(isReadOnlyFromUrl);
  const readOnlyRef = useRef(false);
  readOnlyRef.current = readOnly;
  const transactionRef = useRef<Project | null>(null);

  const project = history.present;

  const sheet = useMemo(
    () => project.sheets.find((item) => item.id === activeSheetId) ?? project.sheets[0],
    [project, activeSheetId],
  );

  // Ámbito recordado por la hoja, resuelto contra el contenido actual.
  const scopeId = useMemo(
    () => resolveScopeId(sheet.diagram, sheet, sheet.view.level, sheet.view.scopeId),
    [sheet],
  );

  const level = sheet.view.level;

  const navigable = useMemo(
    () => navigableElements(sheet.diagram, sheet, level),
    [sheet, level],
  );

  // Autosave: nunca se pisa el trabajo guardado con un proyecto compartido.
  useEffect(() => {
    if (readOnly) return;
    const timer = window.setTimeout(() => {
      savePersistedState({ project, activeSheetId: sheet.id });
    }, AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [project, sheet.id, readOnly]);

  // Al eliminar una pestaña activa, se pasa a la primera.
  useEffect(() => {
    if (!project.sheets.some((item) => item.id === activeSheetId)) {
      setActiveSheetId(project.sheets[0].id);
    }
  }, [project, activeSheetId]);

  const commit = useCallback(
    (next: Project | ((current: Project) => Project), options?: { force?: boolean }) => {
      if (readOnlyRef.current && !options?.force) return;
      dispatch({ type: "commit", next });
    },
    [],
  );

  /** Aplica `update` a la hoja activa dentro de un commit. */
  const mutateActiveSheet = useCallback(
    (
      update: (sheet: Sheet) => Sheet,
      options?: { history?: "commit" | "mutate" | "none" },
    ) => {
      if (readOnlyRef.current) return;
      const mode = options?.history ?? "commit";
      if (mode === "none") return;
      dispatch({
        type: mode,
        next: (current: Project) => withSheet(current, sheet.id, update),
      });
    },
    [sheet.id],
  );

  const view = useMemo(
    () => buildView(sheet, level, scopeId, selection),
    [sheet, level, scopeId, selection],
  );

  const setLevel = useCallback(
    (next: Level) => {
      mutateActiveSheet((current) => ({
        ...current,
        view: {
          level: next,
          scopeId: resolveScopeId(current.diagram, current, next, current.view.scopeId),
        },
      }));
      setSelection(null);
    },
    [mutateActiveSheet],
  );

  const setScope = useCallback(
    (next: string | null) => {
      mutateActiveSheet((current) => ({
        ...current,
        view: {
          ...current.view,
          scopeId: resolveScopeId(current.diagram, current, current.view.level, next),
        },
      }));
      setSelection(null);
    },
    [mutateActiveSheet],
  );

  const drillInto = useCallback(
    (elementId: string) => {
      const element = indexElements(sheet).get(elementId);
      const nextLevel = levelForElement(sheet.diagram, element);
      if (!nextLevel) return;
      mutateActiveSheet((current) => ({
        ...current,
        view: { level: nextLevel, scopeId: elementId },
      }));
      setSelection({ type: "element", id: elementId });
    },
    [sheet, mutateActiveSheet],
  );

  const goUp = useCallback(() => {
    const byId = indexElements(sheet);
    const current = scopeId ? byId.get(scopeId) : undefined;
    const parent = current?.parentId ? byId.get(current.parentId) : undefined;
    if (!current) {
      const root = diagramDef(sheet.diagram).levels.find((item) => item.scopeDepth < 0);
      if (root) setLevel(root.id);
      return;
    }
    if (!parent) {
      const root = diagramDef(sheet.diagram).levels.find((item) => item.scopeDepth < 0);
      if (root) setLevel(root.id);
      return;
    }
    const nextLevel = levelForElement(sheet.diagram, parent);
    if (nextLevel) {
      mutateActiveSheet((currentSheet) => ({
        ...currentSheet,
        view: { level: nextLevel, scopeId: parent.id },
      }));
    }
    setSelection(null);
  }, [sheet, scopeId, setLevel, mutateActiveSheet]);

  const addSheet = useCallback(
    (diagram: DiagramId = "usecase", name?: string) => {
      if (readOnlyRef.current) return "";
      const def = diagramDef(diagram);
      const id = createId("sh");
      const sheetIndex = project.sheets.length + 1;
      const sheetName = name !== undefined ? name : `Vista ${sheetIndex}`;
      const next: Sheet = {
        id,
        name: sheetName,
        diagram,
        elements: [],
        relationships: [],
        view: { level: def.levels[0].id, scopeId: null },
      };
      commit((current) => ({ ...current, sheets: [...current.sheets, next] }));
      setActiveSheetId(id);
      setSelection(null);
      return id;
    },
    [project, commit],
  );

  const removeSheet = useCallback(
    (id: string) => {
      if (readOnlyRef.current) return;
      commit((current) => {
        if (current.sheets.length <= 1) return current;
        return { ...current, sheets: current.sheets.filter((item) => item.id !== id) };
      });
    },
    [commit],
  );

  const renameSheet = useCallback(
    (id: string, name: string) => {
      commit((current) => ({
        ...current,
        sheets: current.sheets.map((item) => (item.id === id ? { ...item, name } : item)),
      }));
    },
    [commit],
  );

  const updateSheet = useCallback(
    (id: string, patch: Partial<Pick<Sheet, "name" | "color" | "icon" | "diagram">>) => {
      commit((current) => ({
        ...current,
        sheets: current.sheets.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      }));
    },
    [commit],
  );

  const duplicateSheet = useCallback(
    (id: string) => {
      if (readOnlyRef.current) return "";
      const source = project.sheets.find((item) => item.id === id);
      if (!source) return "";
      const copyId = createId("sh");
      commit((current) => ({
        ...current,
        sheets: [
          ...current.sheets,
          { ...cloneSheet(source, `${source.name} (copia)`), id: copyId },
        ],
      }));
      setActiveSheetId(copyId);
      setSelection(null);
      return copyId;
    },
    [project, commit],
  );

  const selectSheet = useCallback((id: string) => {
    setActiveSheetId(id);
    setSelection(null);
  }, []);

  const renameProject = useCallback(
    (name: string, description: string) => {
      commit((current) => ({ ...current, name, description }));
    },
    [commit],
  );

  const addElement = useCallback(
    (
      kind: ElementKind,
      position?: { x: number; y: number },
      parentIdOverride?: string | null,
      extra?: Partial<DiagramElement>,
    ) => {
      const id = createId("el");
      const meta = kindMeta(sheet.diagram, kind);
      // Las notas son anotaciones sueltas: nunca cuelgan de un contenedor.
      const parentId =
        parentIdOverride !== undefined
          ? parentIdOverride
          : kind === "note" || meta.depth === 0
            ? null
            : (scopeId ?? null);
      const spot = position ?? fallbackPosition(sheet, kind);
      const baseName = extra?.name ?? nextName(sheet, kind);
      const next: DiagramElement = {
        id,
        kind,
        name: baseName,
        description: "",
        tags: [],
        parentId,
        meta: meta.depth >= 1 ? {} : undefined,
        ...(kind === "step" ? { order: maxStepOrder(sheet, parentId) } : {}),
        x: Math.round(spot.x),
        y: Math.round(spot.y),
        ...extra,
      };
      mutateActiveSheet((current) => ({ ...current, elements: [...current.elements, next] }));
      setSelection({ type: "element", id });
      return id;
    },
    [sheet, scopeId, mutateActiveSheet],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<DiagramElement>) => {
      mutateActiveSheet((current) => ({
        ...current,
        elements: current.elements.map((element) =>
          element.id === id ? { ...element, ...patch } : element,
        ),
      }));
    },
    [mutateActiveSheet],
  );

  const moveElement = useCallback(
    (id: string, x: number, y: number) => {
      if (readOnlyRef.current) return;
      dispatch({
        type: "mutate",
        next: (current) =>
          withSheet(current, sheet.id, (currentSheet) => {
            const element = currentSheet.elements.find((item) => item.id === id);
            // Sin cambios reales no provocamos renderizados.
            if (!element || (element.x === x && element.y === y)) return currentSheet;
            return {
              ...currentSheet,
              elements: currentSheet.elements.map((item) =>
                item.id === id ? { ...item, x, y } : item,
              ),
            };
          }),
      });
    },
    [sheet.id],
  );

  const removeElement = useCallback(
    (id: string) => {
      mutateActiveSheet((current) => {
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
    [mutateActiveSheet],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      if (readOnlyRef.current) return null;
      let newId: string | null = null;
      mutateActiveSheet((current) => {
        const target = current.elements.find((el) => el.id === id);
        if (!target) return current;

        newId = createId("el");
        const copy: DiagramElement = {
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
    [mutateActiveSheet],
  );

  const reorderStep = useCallback(
    (useCaseId: string, orderedStepIds: string[]) => {
      mutateActiveSheet((current) => ({
        ...current,
        elements: current.elements.map((element) => {
          if (element.kind !== "step" || element.parentId !== useCaseId) return element;
          const index = orderedStepIds.indexOf(element.id);
          return index === -1 ? element : { ...element, order: index };
        }),
      }));
    },
    [mutateActiveSheet],
  );

  const addRelationship = useCallback(
    (relationship: Omit<DiagramRelationship, "id">) => {
      const id = createId("rel");
      mutateActiveSheet((current) => {
        const duplicate = current.relationships.some(
          (item) => item.source === relationship.source && item.target === relationship.target,
        );
        if (duplicate) return current;
        return { ...current, relationships: [...current.relationships, { ...relationship, id }] };
      });
      setSelection({ type: "relationship", id });
    },
    [mutateActiveSheet],
  );

  const updateRelationship = useCallback(
    (id: string, patch: Partial<DiagramRelationship>) => {
      mutateActiveSheet((current) => ({
        ...current,
        relationships: current.relationships.map((relationship) =>
          relationship.id === id ? { ...relationship, ...patch } : relationship,
        ),
      }));
    },
    [mutateActiveSheet],
  );

  const invertRelationship = useCallback(
    (id: string) => {
      mutateActiveSheet((current) => ({
        ...current,
        relationships: current.relationships.map((rel) =>
          rel.id === id
            ? {
                ...rel,
                source: rel.target,
                target: rel.source,
                sourceHandle: rel.targetHandle,
                targetHandle: rel.sourceHandle,
              }
            : rel,
        ),
      }));
    },
    [mutateActiveSheet],
  );

  const removeRelationship = useCallback(
    (id: string) => {
      mutateActiveSheet((current) => ({
        ...current,
        relationships: current.relationships.filter((relationship) => relationship.id !== id),
      }));
      setSelection((current) =>
        current && "id" in current && current.id === id ? null : current,
      );
    },
    [mutateActiveSheet],
  );

  const autoLayout = useCallback(() => {
    const nodes = view.nodes.filter((node) => node.type === "element");
    if (nodes.length === 0) return;
    const firstLayer = nodes
      .filter((node) => kindMeta(sheet.diagram, node.data.element.kind).firstLayer)
      .map((node) => node.id);
    const layoutNodes = nodes.map((node) => {
      const size = defaultNodeSize(sheet.diagram, node.data.element.kind);
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
      computeLayout(layoutNodes, layoutEdges, { firstLayer }),
    );
    mutateActiveSheet((current) => ({
      ...current,
      elements: current.elements.map((element) => {
        const point = points.get(element.id);
        return point ? { ...element, x: point.x, y: point.y } : element;
      }),
    }));
    setLayoutSignal((value) => value + 1);
  }, [view, sheet.diagram, mutateActiveSheet]);

  const importProject = useCallback(
    (next: Project, options?: { force?: boolean }) => {
      if (readOnlyRef.current && !options?.force) return;
      dispatch({ type: "replace", project: next });
      setActiveSheetId(next.sheets[0].id);
      setSelection(null);
    },
    [],
  );

  const clearAll = useCallback(() => {
    importProject(createEmptyProject());
  }, [importProject]);

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
    transactionRef.current = project;
  }, [project]);

  const endTransaction = useCallback(() => {
    const snapshot = transactionRef.current;
    transactionRef.current = null;
    if (snapshot && !readOnlyRef.current) dispatch({ type: "checkpoint", snapshot });
  }, []);

  const api = useMemo<ProjectApi>(
    () => ({
      project,
      activeSheetId: sheet.id,
      sheet,
      selection,
      view,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      readOnly,
      setReadOnly,
      layoutSignal,
      addSheet,
      removeSheet,
      renameSheet,
      updateSheet,
      duplicateSheet,
      selectSheet,
      renameProject,
      level: sheet.view.level,
      setLevel,
      setScope,
      drillInto,
      goUp,
      scopeId,
      navigable,
      select: setSelection,
      addElement,
      updateElement,
      moveElement,
      removeElement,
      duplicateElement,
      reorderStep,
      addRelationship,
      updateRelationship,
      invertRelationship,
      removeRelationship,
      autoLayout,
      importProject,
      clearAll,
      undo,
      redo,
      beginTransaction,
      endTransaction,
    }),
    [
      project,
      sheet,
      selection,
      view,
      history.past.length,
      history.future.length,
      readOnly,
      layoutSignal,
      addSheet,
      removeSheet,
      renameSheet,
      updateSheet,
      duplicateSheet,
      selectSheet,
      renameProject,
      setLevel,
      setScope,
      drillInto,
      goUp,
      scopeId,
      navigable,
      addElement,
      updateElement,
      moveElement,
      removeElement,
      duplicateElement,
      reorderStep,
      addRelationship,
      updateRelationship,
      invertRelationship,
      removeRelationship,
      autoLayout,
      importProject,
      clearAll,
      undo,
      redo,
      beginTransaction,
      endTransaction,
    ],
  );

  return <ProjectContext.Provider value={api}>{children}</ProjectContext.Provider>;
}

/** Siguiente `order` libre entre los pasos del mismo contenedor. */
function maxStepOrder(sheet: Sheet, parentId: string | null): number {
  const orders = sheet.elements
    .filter((element) => element.kind === "step" && element.parentId === parentId)
    .map((element) => element.order ?? -1);
  return orders.length === 0 ? 0 : Math.max(...orders) + 1;
}
