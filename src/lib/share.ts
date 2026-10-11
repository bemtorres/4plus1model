import { normalizeWorkspace } from "./storage";
import type { Workspace } from "./types";

/**
 * El diagrama viaja dentro de la propia URL (comprimido con gzip y codificado
 * en base64url), así que no hace falta servidor: cualquiera con el enlace ve el
 * mismo modelo. Quien lo abre entra en modo solo lectura.
 */
export const SHARE_PARAM = "share";
export const EDIT_PARAM = "edit";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

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

/** Serializa el workspace a un texto apto para la URL. */
export async function encodeWorkspace(workspace: Workspace): Promise<string> {
  const raw = encoder.encode(JSON.stringify(workspace));
  const packed = await gzip(raw);
  return packed ? `g${bytesToBase64Url(packed)}` : `j${bytesToBase64Url(raw)}`;
}

/** Reconstruye el workspace desde un enlace (null si está corrupto). */
export async function decodeWorkspace(payload: string): Promise<Workspace | null> {
  try {
    const flag = payload[0];
    const bytes = base64UrlToBytes(payload.slice(1));
    const raw = flag === "g" ? await gunzip(bytes) : bytes;
    return normalizeWorkspace(JSON.parse(decoder.decode(raw)));
  } catch {
    return null;
  }
}

export function readSharePayload(): { payload: string; editable: boolean } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const payload = params.get(SHARE_PARAM);
  if (!payload || payload.length < 2) return null;
  return { payload, editable: params.get(EDIT_PARAM) === "1" };
}

/** Construye el enlace: solo lectura por defecto, o editable con `?edit=1`. */
export function buildShareUrl(payload: string, editable: boolean): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set(SHARE_PARAM, payload);
  if (editable) url.searchParams.set(EDIT_PARAM, "1");
  return url.toString();
}

export function clearShareParams() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has(SHARE_PARAM) && !params.has(EDIT_PARAM)) return;
  params.delete(SHARE_PARAM);
  params.delete(EDIT_PARAM);
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}

/** Tamaño aproximado del enlace en caracteres. */
export function shareUrlLength(payload: string, editable: boolean): number {
  return buildShareUrl(payload, editable).length;
}
