import { normalizeWorkspace } from "./storage";
import type { Workspace } from "./types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const DEFAULT_JWT_SECRET = "c4model-secret-key-2026";

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

export interface JwtEnvelope<T = unknown> {
  header: {
    alg: string;
    typ: string;
    [key: string]: unknown;
  };
  payload: T;
  signature: string;
}

export interface WorkspaceJwtPayload {
  iss?: string;
  sub?: string;
  name?: string;
  description?: string;
  elementsCount?: number;
  relationshipsCount?: number;
  iat?: number;
  workspace: Workspace;
  [key: string]: unknown;
}

/** Comprueba si una cadena tiene estructura de token JWT (base64url con puntos). */
export function isJwtString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const clean = value.trim();
  if (!clean.startsWith("eyJ")) return false;
  const parts = clean.split(".");
  return parts.length === 2 || parts.length === 3;
}

/** Genera la firma HMAC-SHA256 para el token usando Web Crypto API. */
async function computeHmacSha256(data: string, secret: string): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return bytesToBase64Url(new Uint8Array(signature));
  } catch {
    return null;
  }
}

/** Firma y empaqueta un objeto como JSON Web Token (RFC 7519). */
export async function signJwt(
  payload: Record<string, unknown>,
  secret = DEFAULT_JWT_SECRET,
  algorithm: "HS256" | "none" = "HS256",
): Promise<string> {
  const header = {
    alg: algorithm,
    typ: "JWT",
  };
  const headerB64 = bytesToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;

  if (algorithm === "HS256") {
    const signatureB64 = await computeHmacSha256(data, secret);
    if (signatureB64) {
      return `${data}.${signatureB64}`;
    }
  }

  // Fallback si no hay soporte Web Crypto o algoritmo "none"
  return `${data}.`;
}

/** Desempaqueta y decodifica un JWT sin validar criptográficamente la firma. */
export function decodeJwt<T = unknown>(token: string): JwtEnvelope<T> {
  const clean = token.trim();
  const parts = clean.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT: missing parts");
  }
  const headerJson = decoder.decode(base64UrlToBytes(parts[0]));
  const payloadJson = decoder.decode(base64UrlToBytes(parts[1]));

  return {
    header: JSON.parse(headerJson),
    payload: JSON.parse(payloadJson) as T,
    signature: parts[2] ?? "",
  };
}

/** Convierte todo el workspace del modelo a un JWT estándar RFC 7519. */
export async function encodeWorkspaceToJwt(
  workspace: Workspace,
  secret = DEFAULT_JWT_SECRET,
): Promise<string> {
  const payload: WorkspaceJwtPayload = {
    iss: "c4model.cafeycodigo.org",
    sub: "c4-workspace",
    name: workspace.name,
    description: workspace.description,
    elementsCount: workspace.elements.length,
    relationshipsCount: workspace.relationships.length,
    iat: Math.floor(Date.now() / 1000),
    workspace,
  };
  return signJwt(payload as unknown as Record<string, unknown>, secret, "HS256");
}

/** Versión síncrona de generación de JWT (alg: none) para exportadores síncronos. */
export function encodeWorkspaceToJwtSync(workspace: Workspace): string {
  const header = { alg: "none", typ: "JWT" };
  const payload: WorkspaceJwtPayload = {
    iss: "c4model.cafeycodigo.org",
    sub: "c4-workspace",
    name: workspace.name,
    description: workspace.description,
    elementsCount: workspace.elements.length,
    relationshipsCount: workspace.relationships.length,
    iat: Math.floor(Date.now() / 1000),
    workspace,
  };
  const headerB64 = bytesToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${headerB64}.${payloadB64}.`;
}

/** Reconstruye un Workspace desde un token JWT (devuelve null si está corrupto). */
export function decodeWorkspaceFromJwt(token: string): Workspace | null {
  try {
    const { payload } = decodeJwt<Record<string, unknown>>(token);
    if (!payload || typeof payload !== "object") return null;

    // Puede ser payload.workspace o el propio payload si tiene elements y relationships
    const candidate =
      payload.workspace ??
      (Array.isArray(payload.elements) && Array.isArray(payload.relationships) ? payload : null);

    if (!candidate) return null;
    return normalizeWorkspace(candidate);
  } catch {
    return null;
  }
}
