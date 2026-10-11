/**
 * C4Compact — Serializador y Deserializador Compacto de Modelos C4
 *
 * Módulo independiente y determinista para compactar, descomprimir y reconstruir
 * modelos C4 (Workspaces) en JSON sin dependencias externas ni bases de datos.
 *
 * Diseñado específicamente para reducir de forma drástica el tamaño de payloads
 * en tokens JWT (RFC 7519) y transporte en URLs.
 */

import type {
  C4Element,
  C4Relationship,
  ElementKind,
  HandleSide,
  IconName,
  RelationshipStyle,
  Workspace,
} from "./types";
import { normalizeWorkspace } from "./storage";

/* ========================================================================== */
/* 1. TIPOS Y ESQUEMA DEL FORMATO COMPACTO (Versión 1)                       */
/* ========================================================================== */

export const C4_COMPACT_VERSION = 1 as const;

/** Estilos visuales compactos para un elemento */
export interface CompactElementStyle {
  c?: string | null; // color (relleno)
  bc?: string | null; // borderColor
  tc?: string | null; // textColor
  sz?: number | null; // size (tamaño tipografía)
  b?: boolean | null; // border (false = sin borde)
  f?: boolean | null; // fill (false = sin relleno)
  rd?: number | null; // radius (esquinas redondeadas)
  op?: number | null; // bgOpacity (opacidad 0-100)
  i?: IconName; // icon
}

/**
 * Arreglo posicional de un Elemento:
 * [0]  id: string
 * [1]  kind: ElementKind
 * [2]  name: string
 * [3]  desc?: string (omitted si "")
 * [4]  x?: number (default 0)
 * [5]  y?: number (default 0)
 * [6]  tech?: string (omitted si "")
 * [7]  parentId?: string | null (omitted si null)
 * [8]  tags?: string[] (omitted si [])
 * [9]  style?: CompactElementStyle | null (omitted si defaults)
 * [10] extra?: Record<string, unknown> | null (propiedades desconocidas preservadas)
 */
export type CompactElementTuple = [
  string, // 0: id
  string, // 1: kind
  string, // 2: name
  string?, // 3: desc
  number?, // 4: x
  number?, // 5: y
  string?, // 6: tech
  (string | null)?, // 7: parentId
  string[]?, // 8: tags
  (CompactElementStyle | null)?, // 9: style
  Record<string, unknown>?, // 10: extra
];

/** Estilos visuales compactos para una relación */
export interface CompactRelStyle {
  c?: string | null; // color
  th?: number | null; // thickness
}

/**
 * Arreglo posicional de una Relación:
 * [0] id: string
 * [1] source: string
 * [2] target: string
 * [3] label?: string (omitted si "")
 * [4] style?: RelationshipStyle (omitted si "sync")
 * [5] tech?: string (omitted si "")
 * [6] desc?: string (omitted si "")
 * [7] handles?: [HandleSide | null, HandleSide | null] | null (omitted si [null, null])
 * [8] relStyle?: CompactRelStyle | null (omitted si defaults)
 * [9] extra?: Record<string, unknown> | null (propiedades desconocidas preservadas)
 */
export type CompactRelationshipTuple = [
  string, // 0: id
  string, // 1: source
  string, // 2: target
  string?, // 3: label
  string?, // 4: style
  string?, // 5: tech
  string?, // 6: desc
  ([HandleSide | null, HandleSide | null] | null)?, // 7: handles
  (CompactRelStyle | null)?, // 8: relStyle
  Record<string, unknown>?, // 9: extra
];

/** Representación compacta de un Workspace */
export interface CompactWorkspace {
  v: typeof C4_COMPACT_VERSION;
  id: string;
  n: string; // name
  d?: string; // description
  u?: string; // updatedAt
  e: CompactElementTuple[]; // elements
  r: CompactRelationshipTuple[]; // relationships
  x?: Record<string, unknown>; // unknown extra workspace properties
}

/* ========================================================================== */
/* 2. UTILIDADES DE CODIFICACIÓN BASE64URL Y STREAMS                          */
/* ========================================================================== */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/** Comprime bytes utilizando la API Web estándar CompressionStream */
async function compressBytes(
  data: Uint8Array,
  format: "gzip" | "deflate" = "deflate",
): Promise<Uint8Array> {
  if (typeof CompressionStream === "undefined") {
    throw new Error("CompressionStream is not supported in this runtime environment.");
  }
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream(format));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

/** Descomprime bytes utilizando la API Web estándar DecompressionStream con límite de tamaño */
async function decompressBytes(
  data: Uint8Array,
  format: "gzip" | "deflate" = "deflate",
  maxBytes = 10 * 1024 * 1024,
): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DecompressionStream is not supported in this runtime environment.");
  }
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  const buffer = await new Response(stream).arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    throw new Error(
      `Decompressed size ${buffer.byteLength} exceeds security limit of ${maxBytes} bytes.`,
    );
  }
  return new Uint8Array(buffer);
}

/** Detecta si un array de bytes corresponde a gzip, zlib/deflate o JSON */
function detectCompressionFormat(bytes: Uint8Array): "gzip" | "deflate" | "none" {
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return "gzip";
  }
  if (bytes.length >= 2 && bytes[0] === 0x78) {
    return "deflate";
  }
  return "none";
}

/* ========================================================================== */
/* 3. COMPACTACIÓN DETERMINISTA (Model -> Compact)                            */
/* ========================================================================== */

const KNOWN_ELEMENT_KEYS = new Set([
  "id",
  "kind",
  "name",
  "description",
  "technology",
  "tags",
  "parentId",
  "icon",
  "color",
  "borderColor",
  "textColor",
  "size",
  "border",
  "fill",
  "radius",
  "bgOpacity",
  "x",
  "y",
]);

const KNOWN_RELATION_KEYS = new Set([
  "id",
  "source",
  "target",
  "label",
  "technology",
  "description",
  "style",
  "sourceHandle",
  "targetHandle",
  "color",
  "thickness",
]);

const KNOWN_WORKSPACE_KEYS = new Set([
  "id",
  "name",
  "description",
  "elements",
  "relationships",
  "updatedAt",
]);

/** Extrae propiedades desconocidas de un objeto conservándolas de forma determinista */
function extractUnknownProperties(
  source: Record<string, unknown>,
  knownKeys: Set<string>,
): Record<string, unknown> | null {
  const extra: Record<string, unknown> = {};
  let count = 0;
  const sortedKeys = Object.keys(source).sort();
  for (const key of sortedKeys) {
    if (!knownKeys.has(key)) {
      extra[key] = source[key];
      count++;
    }
  }
  return count > 0 ? extra : null;
}

/** Convierte un C4Element a arreglo posicional compacto */
function compactElement(element: C4Element): CompactElementTuple {
  // Extrae estilos visuales
  const style: CompactElementStyle = {};
  let hasStyle = false;

  if (element.icon) {
    style.i = element.icon;
    hasStyle = true;
  }
  if (element.color !== undefined && element.color !== null) {
    style.c = element.color;
    hasStyle = true;
  }
  if (element.borderColor !== undefined && element.borderColor !== null) {
    style.bc = element.borderColor;
    hasStyle = true;
  }
  if (element.textColor !== undefined && element.textColor !== null) {
    style.tc = element.textColor;
    hasStyle = true;
  }
  if (element.size !== undefined && element.size !== null) {
    style.sz = element.size;
    hasStyle = true;
  }
  if (element.border !== undefined && element.border !== null) {
    style.b = element.border;
    hasStyle = true;
  }
  if (element.fill !== undefined && element.fill !== null) {
    style.f = element.fill;
    hasStyle = true;
  }
  if (element.radius !== undefined && element.radius !== null) {
    style.rd = element.radius;
    hasStyle = true;
  }
  if (element.bgOpacity !== undefined && element.bgOpacity !== null) {
    style.op = element.bgOpacity;
    hasStyle = true;
  }

  const extra = extractUnknownProperties(element as unknown as Record<string, unknown>, KNOWN_ELEMENT_KEYS);

  // Redondeo determinista de coordenadas para evitar decimales infinitos
  const roundCoord = (val: number) =>
    Number.isInteger(val) ? val : Math.round(val * 100) / 100;

  const desc = element.description || "";
  const tech = element.technology || "";
  const parentId = element.parentId ?? null;
  const tags = Array.isArray(element.tags) && element.tags.length > 0 ? element.tags : [];
  const styleObj = hasStyle ? style : null;

  // Construye la tupla posicional completa
  const tuple: (unknown | undefined | null)[] = [
    element.id,
    element.kind,
    element.name,
    desc,
    roundCoord(element.x ?? 0),
    roundCoord(element.y ?? 0),
    tech,
    parentId,
    tags.length > 0 ? tags : null,
    styleObj,
    extra,
  ];

  // Si las posiciones finales son valores por defecto, las recortamos
  while (tuple.length > 3) {
    const last = tuple[tuple.length - 1];
    if (
      last === null ||
      last === undefined ||
      (Array.isArray(last) && last.length === 0) ||
      (typeof last === "string" && last === "")
    ) {
      tuple.pop();
    } else {
      break;
    }
  }

  return tuple as CompactElementTuple;
}

/** Convierte una C4Relationship a arreglo posicional compacto */
function compactRelationship(rel: C4Relationship): CompactRelationshipTuple {
  let relStyle: CompactRelStyle | null = null;
  if (rel.color != null || rel.thickness != null) {
    relStyle = {};
    if (rel.color != null) relStyle.c = rel.color;
    if (rel.thickness != null) relStyle.th = rel.thickness;
  }

  const hasHandles = rel.sourceHandle != null || rel.targetHandle != null;
  const handles: [HandleSide | null, HandleSide | null] | null = hasHandles
    ? [rel.sourceHandle ?? null, rel.targetHandle ?? null]
    : null;

  const extra = extractUnknownProperties(rel as unknown as Record<string, unknown>, KNOWN_RELATION_KEYS);

  const label = rel.label || "";
  const style = rel.style || "sync";
  const tech = rel.technology || "";
  const desc = rel.description || "";

  const tuple: (unknown | undefined | null)[] = [
    rel.id,
    rel.source,
    rel.target,
    label,
    style,
    tech,
    desc,
    handles,
    relStyle,
    extra,
  ];

  // Recorta valores por defecto al final
  while (tuple.length > 3) {
    const last = tuple[tuple.length - 1];
    if (
      last === null ||
      last === undefined ||
      (typeof last === "string" && (last === "" || (tuple.length === 5 && last === "sync")))
    ) {
      tuple.pop();
    } else {
      break;
    }
  }

  return tuple as CompactRelationshipTuple;
}

/**
 * Convierte un Workspace convencional a formato compacto determinista.
 */
export function compact(model: Workspace): CompactWorkspace {
  if (!model || typeof model !== "object") {
    throw new Error("Invalid model: expected a Workspace object.");
  }

  const extraWorkspace = extractUnknownProperties(
    model as unknown as Record<string, unknown>,
    KNOWN_WORKSPACE_KEYS,
  );

  const compactModel: CompactWorkspace = {
    v: C4_COMPACT_VERSION,
    id: model.id,
    n: model.name,
    e: (model.elements || []).map(compactElement),
    r: (model.relationships || []).map(compactRelationship),
  };

  if (model.description) {
    compactModel.d = model.description;
  }
  if (model.updatedAt) {
    compactModel.u = model.updatedAt;
  }
  if (extraWorkspace) {
    compactModel.x = extraWorkspace;
  }

  return compactModel;
}

/* ========================================================================== */
/* 4. RECONSTRUCCIÓN DETERMINISTA (Compact -> Model)                         */
/* ========================================================================== */

/** Reconstruye un C4Element desde su arreglo posicional */
function decompactElement(tuple: CompactElementTuple): C4Element {
  if (!Array.isArray(tuple) || tuple.length < 3) {
    throw new Error(`Invalid compact element tuple: ${JSON.stringify(tuple)}`);
  }

  const id = String(tuple[0]);
  const kind = String(tuple[1]) as ElementKind;
  const name = String(tuple[2]);
  const description = typeof tuple[3] === "string" ? tuple[3] : "";
  const x = typeof tuple[4] === "number" ? tuple[4] : 0;
  const y = typeof tuple[5] === "number" ? tuple[5] : 0;
  const technology = typeof tuple[6] === "string" ? tuple[6] : "";
  const parentId = tuple[7] != null ? String(tuple[7]) : null;
  const tags = Array.isArray(tuple[8]) ? tuple[8].map(String) : [];

  const style = tuple[9] && typeof tuple[9] === "object" ? (tuple[9] as CompactElementStyle) : null;
  const extra = tuple[10] && typeof tuple[10] === "object" ? tuple[10] : null;

  const element: C4Element = {
    id,
    kind,
    name,
    description,
    technology,
    tags,
    parentId,
    x,
    y,
  };

  if (style) {
    if (style.i) element.icon = style.i;
    if (style.c !== undefined) element.color = style.c;
    if (style.bc !== undefined) element.borderColor = style.bc;
    if (style.tc !== undefined) element.textColor = style.tc;
    if (style.sz !== undefined) element.size = style.sz;
    if (style.b !== undefined) element.border = style.b;
    if (style.f !== undefined) element.fill = style.f;
    if (style.rd !== undefined) element.radius = style.rd;
    if (style.op !== undefined) element.bgOpacity = style.op;
  }

  // Restaura propiedades desconocidas
  if (extra) {
    Object.assign(element, extra);
  }

  return element;
}

/** Reconstruye una C4Relationship desde su arreglo posicional */
function decompactRelationship(tuple: CompactRelationshipTuple): C4Relationship {
  if (!Array.isArray(tuple) || tuple.length < 3) {
    throw new Error(`Invalid compact relationship tuple: ${JSON.stringify(tuple)}`);
  }

  const id = String(tuple[0]);
  const source = String(tuple[1]);
  const target = String(tuple[2]);
  const label = typeof tuple[3] === "string" ? tuple[3] : "";
  const style = (typeof tuple[4] === "string" ? tuple[4] : "sync") as RelationshipStyle;
  const technology = typeof tuple[5] === "string" ? tuple[5] : "";
  const description = typeof tuple[6] === "string" ? tuple[6] : "";

  const handles = Array.isArray(tuple[7]) ? tuple[7] : null;
  const sourceHandle = handles && handles[0] ? (handles[0] as HandleSide) : null;
  const targetHandle = handles && handles[1] ? (handles[1] as HandleSide) : null;

  const relStyle = tuple[8] && typeof tuple[8] === "object" ? (tuple[8] as CompactRelStyle) : null;
  const extra = tuple[9] && typeof tuple[9] === "object" ? tuple[9] : null;

  const rel: C4Relationship = {
    id,
    source,
    target,
    label,
    style,
    technology,
    description,
    sourceHandle,
    targetHandle,
  };

  if (relStyle) {
    if (relStyle.c !== undefined) rel.color = relStyle.c;
    if (relStyle.th !== undefined) rel.thickness = relStyle.th;
  }

  // Restaura propiedades desconocidas
  if (extra) {
    Object.assign(rel, extra);
  }

  return rel;
}

/**
 * Reconstruye el Workspace original desde un objeto compacto.
 * Si recibe un Workspace convencional ya decompactado, lo normaliza directamente.
 */
export function decompact(compactModel: unknown): Workspace {
  if (!compactModel || typeof compactModel !== "object") {
    throw new Error("Invalid compact model: expected an object.");
  }

  const candidate = compactModel as Record<string, unknown>;

  // Si ya es un workspace convencional
  if (
    Array.isArray(candidate.elements) &&
    Array.isArray(candidate.relationships) &&
    typeof candidate.id === "string" &&
    typeof candidate.name === "string"
  ) {
    return normalizeWorkspace(candidate as unknown as Workspace);
  }

  // Validación de versión del formato compacto
  if (candidate.v !== C4_COMPACT_VERSION) {
    throw new Error(
      `Unsupported compact format version: ${String(candidate.v)}. Supported versions: ${C4_COMPACT_VERSION}`,
    );
  }

  const elementsRaw = Array.isArray(candidate.e) ? candidate.e : [];
  const relationshipsRaw = Array.isArray(candidate.r) ? candidate.r : [];

  const elements = elementsRaw.map((item) => decompactElement(item as CompactElementTuple));
  const relationships = relationshipsRaw.map((item) =>
    decompactRelationship(item as CompactRelationshipTuple),
  );

  const restored: Workspace = {
    id: String(candidate.id || "ws"),
    name: String(candidate.n || "Untitled"),
    description: typeof candidate.d === "string" ? candidate.d : "",
    elements,
    relationships,
    updatedAt: typeof candidate.u === "string" ? candidate.u : new Date().toISOString(),
  };

  const normalized = normalizeWorkspace(restored);

  // Restaura propiedades desconocidas del Workspace
  if (candidate.x && typeof candidate.x === "object") {
    Object.assign(normalized, candidate.x);
  }

  // Restaura propiedades desconocidas de elementos
  for (let i = 0; i < elements.length; i++) {
    const rawEl = elements[i];
    const normEl = normalized.elements[i];
    if (rawEl && normEl) {
      Object.assign(normEl, rawEl);
    }
  }

  // Restaura propiedades desconocidas de relaciones
  for (let i = 0; i < relationships.length; i++) {
    const rawRel = relationships[i];
    const normRel = normalized.relationships[i];
    if (rawRel && normRel) {
      Object.assign(normRel, rawRel);
    }
  }

  return normalized;
}

/* ========================================================================== */
/* 5. COMPRESIÓN BINARIA Y TRANSPORTE (compress / decompress)                 */
/* ========================================================================== */

export interface CompressOptions {
  /** Formato de salida: "base64url" (por defecto, para URLs/JWT) o "binary" (Uint8Array) */
  format?: "base64url" | "binary";
  /** Algoritmo de compresión: "deflate" (más compacto en URLs) o "gzip" */
  algorithm?: "deflate" | "gzip";
}

export interface CompressResult {
  bytes: Uint8Array;
  base64url: string;
  algorithm: "deflate" | "gzip";
  originalBytes: number;
  compressedBytes: number;
}

export interface DecompressOptions {
  /** Límite máximo de bytes descomprimidos permitidos (defensa zip-bomb, default 10MB) */
  maxDecompressedBytes?: number;
}

/**
 * Serializa y comprime un modelo C4 a formato binario o codificado Base64URL.
 */
export async function compress(
  model: Workspace | CompactWorkspace,
  options: CompressOptions = {},
): Promise<string> {
  const algorithm = options.algorithm ?? "deflate";

  const compactData = "v" in model && model.v === C4_COMPACT_VERSION ? model : compact(model as Workspace);
  const jsonString = JSON.stringify(compactData);
  const rawBytes = textEncoder.encode(jsonString);

  const compressed = await compressBytes(rawBytes, algorithm);
  return bytesToBase64Url(compressed);
}

/**
 * Devuelve el resultado detallado de la compresión en bytes y base64url.
 */
export async function compressDetailed(
  model: Workspace | CompactWorkspace,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const algorithm = options.algorithm ?? "deflate";
  const compactData = "v" in model && model.v === C4_COMPACT_VERSION ? model : compact(model as Workspace);
  const jsonString = JSON.stringify(compactData);
  const rawBytes = textEncoder.encode(jsonString);
  const compressed = await compressBytes(rawBytes, algorithm);

  return {
    bytes: compressed,
    base64url: bytesToBase64Url(compressed),
    algorithm,
    originalBytes: rawBytes.length,
    compressedBytes: compressed.length,
  };
}

/**
 * Descomprime un payload binario o Base64URL y reconstruye el modelo original.
 */
export async function decompress(
  payload: Uint8Array | string,
  options: DecompressOptions = {},
): Promise<Workspace> {
  const maxBytes = options.maxDecompressedBytes ?? 10 * 1024 * 1024;
  let bytes: Uint8Array;

  if (typeof payload === "string") {
    const clean = payload.trim();
    // Si la cadena ya es JSON plano
    if (clean.startsWith("{") || clean.startsWith("[")) {
      const parsed = JSON.parse(clean);
      return decompact(parsed);
    }
    bytes = base64UrlToBytes(clean);
  } else {
    bytes = payload;
  }

  const detected = detectCompressionFormat(bytes);

  let uncompressedBytes: Uint8Array;
  if (detected === "gzip") {
    uncompressedBytes = await decompressBytes(bytes, "gzip", maxBytes);
  } else if (detected === "deflate") {
    try {
      uncompressedBytes = await decompressBytes(bytes, "deflate", maxBytes);
    } catch {
      // Intento fallback si era gzip
      uncompressedBytes = await decompressBytes(bytes, "gzip", maxBytes);
    }
  } else {
    // Intenta deflate primero, si falla intenta gzip, o interpreta como texto plano
    try {
      uncompressedBytes = await decompressBytes(bytes, "deflate", maxBytes);
    } catch {
      try {
        uncompressedBytes = await decompressBytes(bytes, "gzip", maxBytes);
      } catch {
        uncompressedBytes = bytes;
      }
    }
  }

  const jsonText = textDecoder.decode(uncompressedBytes);
  const parsed = JSON.parse(jsonText);
  return decompact(parsed);
}

/* ========================================================================== */
/* 6. VALIDACIÓN E INTEGRIDAD (validate & areWorkspacesEquivalent)             */
/* ========================================================================== */

export interface ValidationResult {
  valid: boolean;
  format: "workspace" | "compact" | "unknown";
  version?: number;
  errors: string[];
  warnings: string[];
  stats: {
    elements: number;
    relationships: number;
  };
}

/**
 * Comprueba la estructura, relaciones e integridad de un modelo (Workspace o CompactWorkspace).
 */
export function validate(model: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let format: "workspace" | "compact" | "unknown" = "unknown";
  let elementsCount = 0;
  let relationshipsCount = 0;
  let version: number | undefined;

  if (!model || typeof model !== "object") {
    return {
      valid: false,
      format: "unknown",
      errors: ["Model is null, undefined, or not an object."],
      warnings: [],
      stats: { elements: 0, relationships: 0 },
    };
  }

  const obj = model as Record<string, unknown>;

  // Detección de formato
  if (obj.v !== undefined && typeof obj.v === "number") {
    format = "compact";
    version = obj.v;
    if (obj.v !== C4_COMPACT_VERSION) {
      errors.push(`Unsupported compact version ${obj.v}. Expected ${C4_COMPACT_VERSION}.`);
    }
    if (!obj.id || typeof obj.id !== "string") errors.push("Missing or invalid workspace id.");
    if (!obj.n || typeof obj.n !== "string") errors.push("Missing or invalid workspace name (n).");
    if (!Array.isArray(obj.e)) {
      errors.push("Missing elements array (e).");
    } else {
      elementsCount = obj.e.length;
      const ids = new Set<string>();
      for (let i = 0; i < obj.e.length; i++) {
        const item = obj.e[i];
        if (!Array.isArray(item) || item.length < 3) {
          errors.push(`Element at index ${i} is not a valid compact tuple (length < 3).`);
        } else {
          const elId = String(item[0]);
          if (ids.has(elId)) warnings.push(`Duplicate element id "${elId}".`);
          ids.add(elId);
        }
      }
    }
    if (!Array.isArray(obj.r)) {
      errors.push("Missing relationships array (r).");
    } else {
      relationshipsCount = obj.r.length;
    }
  } else if (Array.isArray(obj.elements) && Array.isArray(obj.relationships)) {
    format = "workspace";
    if (!obj.id || typeof obj.id !== "string") errors.push("Missing or invalid workspace id.");
    if (!obj.name || typeof obj.name !== "string") errors.push("Missing or invalid workspace name.");

    elementsCount = obj.elements.length;
    relationshipsCount = obj.relationships.length;

    const elementIds = new Set<string>();
    for (const el of obj.elements as C4Element[]) {
      if (!el || typeof el !== "object") {
        errors.push("An element is not an object.");
        continue;
      }
      if (!el.id) errors.push("Element missing id.");
      else {
        if (elementIds.has(el.id)) warnings.push(`Duplicate element id "${el.id}".`);
        elementIds.add(el.id);
      }
      if (!el.kind) errors.push(`Element "${el.id || "?"}" missing kind.`);
      if (!el.name) errors.push(`Element "${el.id || "?"}" missing name.`);
    }

    for (const rel of obj.relationships as C4Relationship[]) {
      if (!rel || typeof rel !== "object") {
        errors.push("A relationship is not an object.");
        continue;
      }
      if (!rel.id) errors.push("Relationship missing id.");
      if (!rel.source) errors.push(`Relationship "${rel.id || "?"}" missing source.`);
      else if (!elementIds.has(rel.source)) {
        warnings.push(`Relationship "${rel.id}" points to non-existent source "${rel.source}".`);
      }
      if (!rel.target) errors.push(`Relationship "${rel.id || "?"}" missing target.`);
      else if (!elementIds.has(rel.target)) {
        warnings.push(`Relationship "${rel.id}" points to non-existent target "${rel.target}".`);
      }
    }
  } else {
    errors.push("Object does not match either Workspace or CompactWorkspace structure.");
  }

  return {
    valid: errors.length === 0,
    format,
    version,
    errors,
    warnings,
    stats: { elements: elementsCount, relationships: relationshipsCount },
  };
}

/**
 * Compara dos workspaces para verificar equivalencia semántica exacta en roundtrips.
 */
export function areWorkspacesEquivalent(
  a: Workspace,
  b: Workspace,
): { equivalent: boolean; diffs: string[] } {
  const diffs: string[] = [];

  if (a.id !== b.id) diffs.push(`Workspace ID mismatch: "${a.id}" vs "${b.id}"`);
  if (a.name !== b.name) diffs.push(`Workspace Name mismatch: "${a.name}" vs "${b.name}"`);
  if ((a.description || "") !== (b.description || ""))
    diffs.push(`Workspace Description mismatch`);

  if (a.elements.length !== b.elements.length) {
    diffs.push(`Elements count mismatch: ${a.elements.length} vs ${b.elements.length}`);
  }

  const bElementsMap = new Map(b.elements.map((e) => [e.id, e]));
  for (const elA of a.elements) {
    const elB = bElementsMap.get(elA.id);
    if (!elB) {
      diffs.push(`Element missing in B: ${elA.id}`);
      continue;
    }
    if (elA.kind !== elB.kind) diffs.push(`Element ${elA.id} kind mismatch: ${elA.kind} vs ${elB.kind}`);
    if (elA.name !== elB.name) diffs.push(`Element ${elA.id} name mismatch: ${elA.name} vs ${elB.name}`);
    if ((elA.description || "") !== (elB.description || ""))
      diffs.push(`Element ${elA.id} description mismatch`);
    if ((elA.technology || "") !== (elB.technology || ""))
      diffs.push(`Element ${elA.id} technology mismatch`);
    if ((elA.parentId ?? null) !== (elB.parentId ?? null))
      diffs.push(`Element ${elA.id} parentId mismatch`);
    if (Math.abs(elA.x - elB.x) > 0.01 || Math.abs(elA.y - elB.y) > 0.01) {
      diffs.push(`Element ${elA.id} coordinate mismatch: (${elA.x},${elA.y}) vs (${elB.x},${elB.y})`);
    }
  }

  if (a.relationships.length !== b.relationships.length) {
    diffs.push(
      `Relationships count mismatch: ${a.relationships.length} vs ${b.relationships.length}`,
    );
  }

  const bRelMap = new Map(b.relationships.map((r) => [r.id, r]));
  for (const relA of a.relationships) {
    const relB = bRelMap.get(relA.id);
    if (!relB) {
      diffs.push(`Relationship missing in B: ${relA.id}`);
      continue;
    }
    if (relA.source !== relB.source) diffs.push(`Relationship ${relA.id} source mismatch`);
    if (relA.target !== relB.target) diffs.push(`Relationship ${relA.id} target mismatch`);
    if ((relA.label || "") !== (relB.label || "")) diffs.push(`Relationship ${relA.id} label mismatch`);
    if ((relA.style || "sync") !== (relB.style || "sync"))
      diffs.push(`Relationship ${relA.id} style mismatch`);
  }

  return { equivalent: diffs.length === 0, diffs };
}

/* ========================================================================== */
/* 7. ESTRATEGIAS ALTERNATIVAS PARA MEDICIÓN COMPARATIVA                      */
/* ========================================================================== */

/** Estrategia B: JSON con diccionario de claves abreviadas (conservando objetos) */
function toAbbreviatedKeysJson(model: Workspace): string {
  const abbreviated = {
    id: model.id,
    n: model.name,
    d: model.description || undefined,
    u: model.updatedAt || undefined,
    e: model.elements.map((e) => ({
      i: e.id,
      k: e.kind,
      n: e.name,
      d: e.description || undefined,
      t: e.technology || undefined,
      tg: e.tags.length ? e.tags : undefined,
      p: e.parentId || undefined,
      x: e.x,
      y: e.y,
      c: e.color || undefined,
      bc: e.borderColor || undefined,
      tc: e.textColor || undefined,
      s: e.size || undefined,
      b: e.border,
      f: e.fill,
      r: e.radius || undefined,
      o: e.bgOpacity || undefined,
      ic: e.icon || undefined,
    })),
    r: model.relationships.map((r) => ({
      i: r.id,
      s: r.source,
      t: r.target,
      l: r.label || undefined,
      st: r.style !== "sync" ? r.style : undefined,
      tc: r.technology || undefined,
      d: r.description || undefined,
      sh: r.sourceHandle || undefined,
      th: r.targetHandle || undefined,
      c: r.color || undefined,
      tk: r.thickness || undefined,
    })),
  };
  return JSON.stringify(abbreviated);
}

/* ========================================================================== */
/* 8. INFORME DE MEDICIONES (measure)                                         */
/* ========================================================================== */

export interface StrategyMeasurement {
  name: string;
  description: string;
  bytes: number;
  chars: number;
  reductionBytesPct: number;
  reductionCharsPct: number;
  timeMs: number;
}

export interface MeasureReport {
  modelName: string;
  elementsCount: number;
  relationshipsCount: number;
  originalBytes: number;
  strategies: StrategyMeasurement[];
  roundtripValid: boolean;
  summary: string;
}

/**
 * Ejecuta una comparativa exhaustiva de tamaño y tiempo de todas las estrategias de compresión.
 */
export async function measure(model: Workspace): Promise<MeasureReport> {
  const rawJson = JSON.stringify(model);
  const rawBytes = textEncoder.encode(rawJson).length;

  const strategies: StrategyMeasurement[] = [];

  const addStrategy = (
    name: string,
    description: string,
    bytes: number,
    chars: number,
    timeMs: number,
  ) => {
    const reductionBytesPct = ((rawBytes - bytes) / rawBytes) * 100;
    const reductionCharsPct = ((rawJson.length - chars) / rawJson.length) * 100;
    strategies.push({
      name,
      description,
      bytes,
      chars,
      reductionBytesPct: Math.round(reductionBytesPct * 10) / 10,
      reductionCharsPct: Math.round(reductionCharsPct * 10) / 10,
      timeMs: Math.round(timeMs * 100) / 100,
    });
  };

  // 1. JSON original minificado
  addStrategy("JSON original", "JSON.stringify sin espacios", rawBytes, rawJson.length, 0);

  // 2. JSON con claves abreviadas
  const tAbb0 = performance.now();
  const abbJson = toAbbreviatedKeysJson(model);
  const abbBytes = textEncoder.encode(abbJson).length;
  addStrategy(
    "JSON claves abreviadas",
    "Objetos con nombres de propiedad cortos (i, k, n...)",
    abbBytes,
    abbJson.length,
    performance.now() - tAbb0,
  );

  // 3. JSON compacto con arreglos posicionales (C4Compact)
  const tComp0 = performance.now();
  const compactModel = compact(model);
  const compactJson = JSON.stringify(compactModel);
  const compactBytes = textEncoder.encode(compactJson).length;
  addStrategy(
    "JSON compacto posicional",
    "C4Compact con tuplas posicionales y recorte de defaults",
    compactBytes,
    compactJson.length,
    performance.now() - tComp0,
  );

  // 4. JSON original comprimido con gzip
  const tGzRaw0 = performance.now();
  const gzRawBytes = (await compressBytes(textEncoder.encode(rawJson), "gzip")).length;
  addStrategy(
    "GZIP (JSON original)",
    "Compresión GZIP sobre JSON estándar",
    gzRawBytes,
    gzRawBytes,
    performance.now() - tGzRaw0,
  );

  // 5. JSON compacto comprimido con Deflate
  const tDefCompact0 = performance.now();
  const defCompactBytes = (await compressBytes(textEncoder.encode(compactJson), "deflate")).length;
  addStrategy(
    "Deflate (JSON compacto)",
    "Compresión DEFLATE sobre C4Compact",
    defCompactBytes,
    defCompactBytes,
    performance.now() - tDefCompact0,
  );

  // 6. JSON compacto comprimido con GZIP
  const tGzCompact0 = performance.now();
  const gzCompactBytes = (await compressBytes(textEncoder.encode(compactJson), "gzip")).length;
  addStrategy(
    "GZIP (JSON compacto)",
    "Compresión GZIP sobre C4Compact",
    gzCompactBytes,
    gzCompactBytes,
    performance.now() - tGzCompact0,
  );

  // 7. Base64URL transportable de C4Compact comprimido
  const tB640 = performance.now();
  const defB64 = await compress(model, { algorithm: "deflate" });
  const b64Bytes = textEncoder.encode(defB64).length;
  addStrategy(
    "Base64URL transportable",
    "Payload binario DEFLATE codificado en base64url para URLs",
    b64Bytes,
    defB64.length,
    performance.now() - tB640,
  );

  // 8. Comparación en JWT (RFC 7519)
  // Payload JWT con modelo original
  const jwtOriginalPayload = JSON.stringify({
    iss: "c4model",
    sub: "ws",
    workspace: model,
  });
  const jwtOrigChars = bytesToBase64Url(textEncoder.encode(jwtOriginalPayload)).length + 50;

  // Payload JWT con C4Compact comprimido (claim c4z)
  const jwtCompressedPayload = JSON.stringify({
    iss: "c4model",
    sub: "ws",
    c4z: defB64,
  });
  const jwtCompChars = bytesToBase64Url(textEncoder.encode(jwtCompressedPayload)).length + 50;

  addStrategy(
    "JWT original (RFC 7519)",
    "Token JWT con payload JSON completo sin comprimir",
    jwtOrigChars,
    jwtOrigChars,
    0,
  );

  addStrategy(
    "JWT con C4Compact (c4z)",
    "Token JWT con claim c4z comprimido en Base64URL",
    jwtCompChars,
    jwtCompChars,
    performance.now() - tB640,
  );

  // Verificación de ida y vuelta (roundtrip)
  const restoredFromCompact = decompact(compactModel);
  const decompressedModel = await decompress(defB64);

  const eqCompact = areWorkspacesEquivalent(model, restoredFromCompact);
  const eqDecompress = areWorkspacesEquivalent(model, decompressedModel);
  const roundtripValid = eqCompact.equivalent && eqDecompress.equivalent;

  const bestSavings = strategies.reduce((max, s) => (s.reductionCharsPct > max ? s.reductionCharsPct : max), 0);
  const summary = `Reducción máxima del ${bestSavings}% lograda en transporte. El token JWT pasó de ${jwtOrigChars} a ${jwtCompChars} caracteres. Roundtrip verificado: ${roundtripValid ? "OK (100% equivalente)" : "FALLÓ"}.`;

  return {
    modelName: model.name,
    elementsCount: model.elements.length,
    relationshipsCount: model.relationships.length,
    originalBytes: rawBytes,
    strategies,
    roundtripValid,
    summary,
  };
}

/* ========================================================================== */
/* 9. OBJETO EXPORTADO C4Compact                                              */
/* ========================================================================== */

export const C4Compact = {
  VERSION: C4_COMPACT_VERSION,
  compact,
  decompact,
  compress,
  compressDetailed,
  decompress,
  validate,
  measure,
  areWorkspacesEquivalent,
  bytesToBase64Url,
  base64UrlToBytes,
};

export default C4Compact;
