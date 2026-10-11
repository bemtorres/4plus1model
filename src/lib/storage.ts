import { createSampleWorkspace } from "./sample";
import { KINDS_ALL, isElementIcon } from "./catalog";
import {
  WORKSPACE_FILE_FORMAT,
  WORKSPACE_FILE_VERSION,
  HANDLE_SIDES,
  type C4Element,
  type C4Relationship,
  type ElementKind,
  type HandleSide,
  type Level,
  type RelationshipStyle,
  type Workspace,
  type WorkspaceFile,
} from "./types";
import { createId } from "./id";

const STORAGE_KEY = "c4-modeler:workspace:v1";

export interface PersistedState {
  workspace: Workspace;
  level: Level;
  scopeId: string | null;
}

export function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    const workspace = normalizeWorkspace(parsed.workspace);
    const level: Level = parsed.level ?? "context";
    return {
      workspace,
      level,
      scopeId: typeof parsed.scopeId === "string" ? parsed.scopeId : null,
    };
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* cuota llena o modo privado: el modelo sigue vivo en memoria */
  }
}

export function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

const KINDS: ElementKind[] = KINDS_ALL;

const STYLES: RelationshipStyle[] = ["sync", "async", "bi"];

function side(value: unknown): HandleSide | null {
  return HANDLE_SIDES.includes(value as HandleSide) ? (value as HandleSide) : null;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Colores y métricas de nodos/líneas; se omiten si no hay valor propio. */
function color(value: unknown): string | null {
  if (value === "transparent") return "transparent";
  return typeof value === "string" && HEX.test(value) ? value : null;
}

const HEX = /^#[0-9a-f]{6}$/i;

function appearance(element: Record<string, unknown>): Partial<C4Element> {
  const result: Partial<C4Element> = {};
  const fill = color(element.color);
  const lineColor = color(element.borderColor);
  const textColor = color(element.textColor);
  if (fill !== null) result.color = fill;
  if (lineColor !== null) result.borderColor = lineColor;
  if (textColor !== null) result.textColor = textColor;
  if (typeof element.size === "number") result.size = num(element.size, 13);
  if (typeof element.border === "boolean") result.border = element.border;
  if (typeof element.fill === "boolean") result.fill = element.fill;
  if (typeof element.radius === "number") result.radius = num(element.radius, 10);
  if (typeof element.bgOpacity === "number") result.bgOpacity = num(element.bgOpacity, 100);
  return result;
}

export type ParseErrorCode =
  | "invalidWorkspace"
  | "missingLists"
  | "unknownKind"
  | "futureVersion"
  | "invalidJson";

export class WorkspaceParseError extends Error {
  constructor(
    public code: ParseErrorCode,
    public params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = "WorkspaceParseError";
  }
}

/** Valida y normaliza un workspace desconocido (import o almacenamiento local). */
export function normalizeWorkspace(input: unknown): Workspace {
  if (!input || typeof input !== "object") {
    throw new WorkspaceParseError("invalidWorkspace");
  }
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.elements) || !Array.isArray(raw.relationships)) {
    throw new WorkspaceParseError("missingLists");
  }

  const ids = new Set<string>();
  const elements: C4Element[] = raw.elements.map((item, index) => {
    const element = (item ?? {}) as Record<string, unknown>;
    const kind = KINDS.includes(element.kind as ElementKind)
      ? (element.kind as ElementKind)
      : null;
    if (!kind) {
      throw new WorkspaceParseError("unknownKind", { n: index + 1 });
    }
    let id = str(element.id) || createId("el");
    while (ids.has(id)) id = createId("el");
    ids.add(id);
    return {
      id,
      kind,
      name: str(element.name, "Untitled"),
      description: str(element.description),
      technology: str(element.technology),
      tags: Array.isArray(element.tags)
        ? element.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      parentId: typeof element.parentId === "string" ? element.parentId : null,
      ...(isElementIcon(element.icon) ? { icon: element.icon } : {}),
      ...appearance(element),
      x: num(element.x),
      y: num(element.y),
    } satisfies C4Element;
  });

  const relationshipIds = new Set<string>();
  const relationships: C4Relationship[] = raw.relationships
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const relation = item as Record<string, unknown>;
      const source = str(relation.source);
      const target = str(relation.target);
      if (!ids.has(source) || !ids.has(target)) return null;
      let id = str(relation.id) || createId("rel");
      while (relationshipIds.has(id)) id = createId("rel");
      relationshipIds.add(id);
      const relationship: C4Relationship = {
        id,
        source,
        target,
        sourceHandle: side(relation.sourceHandle),
        targetHandle: side(relation.targetHandle),
        label: str(relation.label),
        technology: str(relation.technology),
        description: str(relation.description),
        style: STYLES.includes(relation.style as RelationshipStyle)
          ? (relation.style as RelationshipStyle)
          : "sync",
      };
      const custom = color(relation.color);
      if (custom !== null) relationship.color = custom;
      if (typeof relation.thickness === "number") {
        relationship.thickness = num(relation.thickness, 1.5);
      }
      return relationship;
    })
    .filter((value): value is C4Relationship => value !== null);

  // Los parents que no existen se convierten en elementos de nivel contexto.
  for (const element of elements) {
    if (element.parentId && !ids.has(element.parentId)) element.parentId = null;
  }

  return {
    id: str(raw.id) || createId("ws"),
    name: str(raw.name, "Workspace"),
    description: str(raw.description),
    elements,
    relationships,
    updatedAt: str(raw.updatedAt) || new Date().toISOString(),
  };
}

/** Acepta el archivo exportado por la app, un workspace suelto o un token JWT (RFC 7519). */
export function parseWorkspaceFile(text: string): Workspace {
  const clean = text.trim();
  // Detección y desempaquetado de JWT (RFC 7519)
  if (clean.startsWith("eyJ") && clean.includes(".")) {
    try {
      const parts = clean.split(".");
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const decoded = new TextDecoder().decode(bytes);
      const payloadObj = JSON.parse(decoded) as Record<string, unknown>;
      const candidateWs =
        payloadObj.workspace ??
        (Array.isArray(payloadObj.elements) && Array.isArray(payloadObj.relationships)
          ? payloadObj
          : null);
      if (candidateWs) {
        return normalizeWorkspace(candidateWs);
      }
    } catch {
      // Si falla como JWT, continuar con JSON estándar
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new WorkspaceParseError("invalidJson");
  }
  const candidate = parsed as Partial<WorkspaceFile> & Record<string, unknown>;
  if (candidate?.format === WORKSPACE_FILE_FORMAT) {
    const version = Number(candidate.version);
    if (version > WORKSPACE_FILE_VERSION) {
      throw new WorkspaceParseError("futureVersion", {
        version,
        max: WORKSPACE_FILE_VERSION,
      });
    }
    return normalizeWorkspace(candidate.workspace);
  }
  return normalizeWorkspace(parsed);
}

export function createInitialState(): PersistedState {
  const persisted = loadPersistedState();
  if (persisted) return persisted;
  return { workspace: createSampleWorkspace(), level: "context", scopeId: null };
}
