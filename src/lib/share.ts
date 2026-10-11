import { normalizeWorkspace } from "./storage";
import type { Workspace } from "./types";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  decodeWorkspaceFromJwt,
  encodeWorkspaceToJwt,
  encodeWorkspaceToJwtSync,
  isJwtString,
} from "./jwt";

export {
  base64UrlToBytes,
  bytesToBase64Url,
  decodeWorkspaceFromJwt,
  encodeWorkspaceToJwt,
  encodeWorkspaceToJwtSync,
  isJwtString,
};

/**
 * El diagrama viaja dentro de la propia URL (comprimido con gzip y codificado
 * en base64url, o empaquetado como un JWT estándar RFC 7519), así que no hace falta servidor:
 * cualquiera con el enlace ve el mismo modelo. Quien lo abre entra en modo solo lectura.
 */
export const SHARE_PARAM = "share";
export const EDIT_PARAM = "edit";
export const JWT_PARAM = "jwt";
export const TOKEN_PARAM = "token";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function gzip(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Serializa el workspace a un texto comprimido apto para la URL. */
export async function encodeWorkspace(workspace: Workspace): Promise<string> {
  const raw = encoder.encode(JSON.stringify(workspace));
  const packed = await gzip(raw);
  return packed ? `g${bytesToBase64Url(packed)}` : `j${bytesToBase64Url(raw)}`;
}

/** Reconstruye el workspace desde un enlace, payload comprimido o token JWT. */
export async function decodeWorkspace(payload: string): Promise<Workspace | null> {
  try {
    const clean = payload.trim();
    if (isJwtString(clean) || (clean.startsWith("eyJ") && clean.includes("."))) {
      return await decodeWorkspaceFromJwt(clean);
    }
    const flag = clean[0];
    const bytes = base64UrlToBytes(clean.slice(1));
    const raw = flag === "g" ? await gunzip(bytes) : bytes;
    return normalizeWorkspace(JSON.parse(decoder.decode(raw)));
  } catch {
    return null;
  }
}

/**
 * Parsea el parámetro `edit` de la URL:
 * - `0`, `false`, `no`, `off` -> false (bloqueado / solo lectura)
 * - `1`, `true`, `yes`, `on` -> true (editable)
 * - ausente o desconocido -> null (usa comportamiento por defecto)
 */
export function parseEditParam(val: string | null | undefined): boolean | null {
  if (val == null) return null;
  const lower = val.trim().toLowerCase();
  if (lower === "0" || lower === "false" || lower === "no" || lower === "off") return false;
  if (lower === "1" || lower === "true" || lower === "yes" || lower === "on") return true;
  return null;
}

/**
 * Determina si el modo solo lectura (bloqueado) está activo según la URL:
 * - Si `edit=0` o `edit=false` -> true (solo lectura / bloqueado).
 * - Si `edit=1` o `edit=true` -> false (editable).
 * - Si falta `edit`:
 *   - Enlaces compartidos (?share=, ?jwt=, ?token=) -> true por defecto para proteger el modelo.
 *   - Navegación estándar -> false (el modo edición está activado por defecto).
 */
export function isReadOnlyFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const editParam = parseEditParam(params.get(EDIT_PARAM));
  if (editParam !== null) {
    return !editParam;
  }
  if (params.has(SHARE_PARAM) || params.has(JWT_PARAM) || params.has(TOKEN_PARAM)) {
    return true;
  }
  return false;
}

export function readSharePayload(): { payload: string; editable: boolean; isJwt: boolean } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const editParam = parseEditParam(params.get(EDIT_PARAM));
  const editable = editParam === true;

  const jwt = params.get(JWT_PARAM) || params.get(TOKEN_PARAM);
  if (jwt && jwt.length > 5) {
    return { payload: jwt.trim(), editable, isJwt: true };
  }
  const payload = params.get(SHARE_PARAM);
  if (!payload || payload.length < 2) return null;
  const isJwt = isJwtString(payload.trim());
  return { payload: payload.trim(), editable, isJwt };
}

/** Construye el enlace para abrir una copia editable en una pestaña nueva con `?edit=1`. */
export function buildEditUrl(): string {
  if (typeof window === "undefined") return "/editor";
  const url = new URL(window.location.href);
  url.pathname = "/editor";
  const shared = readSharePayload();
  if (shared) {
    if (shared.isJwt) {
      url.searchParams.set(JWT_PARAM, shared.payload);
    } else {
      url.searchParams.set(SHARE_PARAM, shared.payload);
    }
  }
  url.searchParams.set(EDIT_PARAM, "1");
  return url.toString();
}

/** Construye el enlace: solo lectura (?edit=0) por defecto, o editable con `?edit=1`. */
export function buildShareUrl(payload: string, editable: boolean, useJwt = false): string {
  const url = new URL(window.location.href);
  url.pathname = "/editor";
  url.search = "";
  url.hash = "";
  if (useJwt) {
    url.searchParams.set(JWT_PARAM, payload);
  } else {
    url.searchParams.set(SHARE_PARAM, payload);
  }
  url.searchParams.set(EDIT_PARAM, editable ? "1" : "0");
  return url.toString();
}

export function clearShareParams() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (
    !params.has(SHARE_PARAM) &&
    !params.has(EDIT_PARAM) &&
    !params.has(JWT_PARAM) &&
    !params.has(TOKEN_PARAM)
  ) {
    return;
  }
  params.delete(SHARE_PARAM);
  params.delete(EDIT_PARAM);
  params.delete(JWT_PARAM);
  params.delete(TOKEN_PARAM);
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}

/** Tamaño aproximado del enlace en caracteres. */
export function shareUrlLength(payload: string, editable: boolean, useJwt = false): number {
  return buildShareUrl(payload, editable, useJwt).length;
}
