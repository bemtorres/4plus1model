import { createSampleProject } from "./sample";
import { DIAGRAMS, diagramDef, isElementIcon } from "./diagrams";
import {
  PROJECT_FILE_FORMAT,
  PROJECT_FILE_VERSION,
  HANDLE_SIDES,
  type DiagramElement,
  type DiagramId,
  type DiagramRelationship,
  type ElementKind,
  type HandleSide,
  type Level,
  type Project,
  type ProjectFile,
  type RelationshipStyle,
  type Sheet,
} from "./types";
import { createId } from "./id";

const STORAGE_KEY = "4plus1:project:v1";

export interface PersistedState {
  project: Project;
  activeSheetId: string;
}

export function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    const project = normalizeProject(parsed.project);
    const activeSheetId =
      typeof parsed.activeSheetId === "string" &&
      project.sheets.some((sheet) => sheet.id === parsed.activeSheetId)
        ? parsed.activeSheetId
        : project.sheets[0].id;
    return { project, activeSheetId };
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

function appearance(element: Record<string, unknown>): Partial<DiagramElement> {
  const result: Partial<DiagramElement> = {};
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

function metaMap(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    (pair): pair is [string, string] => typeof pair[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export type ParseErrorCode =
  | "invalidProject"
  | "missingSheets"
  | "unknownKind"
  | "futureVersion"
  | "unknownFormat"
  | "invalidJson";

export class ProjectParseError extends Error {
  constructor(
    public code: ParseErrorCode,
    public params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = "ProjectParseError";
  }
}

function diagramIdOf(value: unknown): DiagramId {
  return typeof value === "string" && value in DIAGRAMS ? (value as DiagramId) : "usecase";
}

/** Valida y normaliza una hoja desconocida. Los kinds inválidos se descartan. */
function normalizeSheet(input: unknown): Sheet {
  const raw = (input ?? {}) as Record<string, unknown>;
  const diagram = diagramIdOf(raw.diagram);
  const def = diagramDef(diagram);
  const validKinds = new Set(Object.keys(def.kinds));

  const ids = new Set<string>();
  const elements: DiagramElement[] = [];
  for (const item of Array.isArray(raw.elements) ? raw.elements : []) {
    const element = (item ?? {}) as Record<string, unknown>;
    const kind = str(element.kind);
    if (!validKinds.has(kind)) continue;
    let id = str(element.id) || createId("el");
    while (ids.has(id)) id = createId("el");
    ids.add(id);
    const meta = metaMap(element.meta);
    elements.push({
      id,
      kind: kind as ElementKind,
      name: str(element.name, "Untitled"),
      description: str(element.description),
      tags: Array.isArray(element.tags)
        ? element.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      parentId: typeof element.parentId === "string" ? element.parentId : null,
      ...(isElementIcon(element.icon) ? { icon: element.icon } : {}),
      ...appearance(element),
      ...(typeof element.order === "number" ? { order: num(element.order) } : {}),
      ...(meta ? { meta } : {}),
      x: num(element.x),
      y: num(element.y),
    } satisfies DiagramElement);
  }

  const validStyles = new Set<string>(def.styles);
  const relationshipIds = new Set<string>();
  const relationships: DiagramRelationship[] = [];
  for (const item of Array.isArray(raw.relationships) ? raw.relationships : []) {
    if (!item || typeof item !== "object") continue;
    const relation = item as Record<string, unknown>;
    const source = str(relation.source);
    const target = str(relation.target);
    if (!ids.has(source) || !ids.has(target)) continue;
    let id = str(relation.id) || createId("rel");
    while (relationshipIds.has(id)) id = createId("rel");
    relationshipIds.add(id);
    const style = str(relation.style);
    const relationship: DiagramRelationship = {
      id,
      source,
      target,
      sourceHandle: side(relation.sourceHandle),
      targetHandle: side(relation.targetHandle),
      label: str(relation.label),
      description: str(relation.description),
      style: (validStyles.has(style) ? style : "association") as RelationshipStyle,
    };
    const custom = color(relation.color);
    if (custom !== null) relationship.color = custom;
    if (typeof relation.thickness === "number") {
      relationship.thickness = num(relation.thickness, 1.5);
    }
    relationships.push(relationship);
  }

  // Los parents que no existen se convierten en elementos raíz.
  for (const element of elements) {
    if (element.parentId && !ids.has(element.parentId)) element.parentId = null;
  }

  // Reindexar `order` de los pasos para evitar huecos o duplicados.
  const stepGroups = new Map<string, DiagramElement[]>();
  for (const element of elements) {
    if (element.kind !== "step" || !element.parentId) continue;
    const list = stepGroups.get(element.parentId);
    if (list) list.push(element);
    else stepGroups.set(element.parentId, [element]);
  }
  for (const steps of stepGroups.values()) {
    steps
      .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
      .forEach((step, index) => {
        step.order = index;
      });
  }

  const viewRaw = (raw.view ?? {}) as Record<string, unknown>;
  const levelIds = new Set(def.levels.map((item) => item.id));
  const level = str(viewRaw.level, def.levels[0].id);
  const scopeId = typeof viewRaw.scopeId === "string" && ids.has(viewRaw.scopeId) ? viewRaw.scopeId : null;

  const sheetIcon = isElementIcon(raw.icon) ? raw.icon : (raw.icon === null ? null : undefined);
  const sheetColor = color(raw.color);

  return {
    id: str(raw.id) || createId("sh"),
    name: str(raw.name, "Hoja"),
    diagram,
    elements,
    relationships,
    view: { level: levelIds.has(level) ? level : def.levels[0].id, scopeId },
    ...(sheetIcon !== undefined ? { icon: sheetIcon } : {}),
    ...(sheetColor !== null ? { color: sheetColor } : {}),
  };
}

/** Valida y normaliza un proyecto desconocido (import o almacenamiento local). */
export function normalizeProject(input: unknown): Project {
  if (!input || typeof input !== "object") {
    throw new ProjectParseError("invalidProject");
  }
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.sheets)) {
    throw new ProjectParseError("missingSheets");
  }
  const sheets = raw.sheets.map((sheet) => normalizeSheet(sheet));
  if (sheets.length === 0) {
    throw new ProjectParseError("missingSheets");
  }
  return {
    id: str(raw.id) || createId("pr"),
    name: str(raw.name, "Proyecto"),
    description: str(raw.description),
    sheets,
    updatedAt: str(raw.updatedAt) || new Date().toISOString(),
  };
}

/** Acepta el archivo exportado por la app, un proyecto suelto o un token JWT. */
export function parseProjectFile(text: string): Project {
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
      const candidate =
        payloadObj.project ??
        (Array.isArray(payloadObj.sheets) ? payloadObj : null);
      if (candidate) {
        return normalizeProject(candidate);
      }
    } catch {
      // Si falla como JWT, continuar con JSON estándar
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ProjectParseError("invalidJson");
  }
  const candidate = parsed as Partial<ProjectFile> & Record<string, unknown>;
  if (candidate?.format === PROJECT_FILE_FORMAT) {
    const version = Number(candidate.version);
    if (version > PROJECT_FILE_VERSION) {
      throw new ProjectParseError("futureVersion", {
        version,
        max: PROJECT_FILE_VERSION,
      });
    }
    return normalizeProject(candidate.project ?? candidate);
  }
  if (candidate?.format) {
    throw new ProjectParseError("unknownFormat", { format: str(candidate.format) });
  }
  return normalizeProject(parsed);
}

export function createInitialState(): PersistedState {
  const persisted = loadPersistedState();
  if (persisted) {
    const isOldSample =
      persisted.project.description === "Diagrama de casos de uso de ejemplo: tienda online." ||
      persisted.project.sheets.some((s) =>
        s.elements.some((el) => el.id === "uc-actor-cliente" || el.id === "uc-system-tienda"),
      );
    if (isOldSample) {
      const blank = createSampleProject();
      savePersistedState({ project: blank, activeSheetId: blank.sheets[0].id });
      return { project: blank, activeSheetId: blank.sheets[0].id };
    }
    return persisted;
  }
  const project = createSampleProject();
  return { project, activeSheetId: project.sheets[0].id };
}
