import { normalizeProject } from "./storage";
import type { Project } from "./types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const DEFAULT_JWT_SECRET = "4plus1-modeler-secret-2026";

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

export interface ProjectJwtPayload {
  iss?: string;
  sub?: string;
  name?: string;
  description?: string;
  sheetsCount?: number;
  iat?: number;
  /** Payload del proyecto comprimido con gzip en Base64URL. */
  pz?: string;
  /** Payload del proyecto en JSON (versión síncrona). */
  project?: Project;
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

/** Convierte el proyecto a un JWT firmado con el proyecto comprimido (`pz`). */
export async function encodeProjectToJwt(
  project: Project,
  secret = DEFAULT_JWT_SECRET,
): Promise<string> {
  const raw = encoder.encode(JSON.stringify(project));
  const packed = await gzip(raw);
  const payload: ProjectJwtPayload = {
    iss: "4plus1.cafeycodigo.org",
    sub: "4plus1-project",
    name: project.name,
    description: project.description,
    sheetsCount: project.sheets.length,
    iat: Math.floor(Date.now() / 1000),
    pz: bytesToBase64Url(packed ?? raw),
  };
  if (!packed) payload.raw = true;
  return signJwt(payload as unknown as Record<string, unknown>, secret, "HS256");
}

/** Versión síncrona (alg: none) para exportadores síncronos: payload `project`. */
export function encodeProjectToJwtSync(project: Project): string {
  const header = { alg: "none", typ: "JWT" };
  const payload: ProjectJwtPayload = {
    iss: "4plus1.cafeycodigo.org",
    sub: "4plus1-project",
    name: project.name,
    description: project.description,
    sheetsCount: project.sheets.length,
    iat: Math.floor(Date.now() / 1000),
    project,
  };
  const headerB64 = bytesToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${headerB64}.${payloadB64}.`;
}

/** Reconstruye un proyecto desde un token JWT. */
export async function decodeProjectFromJwt(token: string): Promise<Project | null> {
  try {
    const { payload } = decodeJwt<Record<string, unknown>>(token);
    if (!payload || typeof payload !== "object") return null;

    if (typeof payload.pz === "string" && payload.pz.length > 0) {
      const bytes = base64UrlToBytes(payload.pz);
      const raw = payload.raw === true ? bytes : await gunzip(bytes);
      return normalizeProject(JSON.parse(decoder.decode(raw)));
    }

    const candidate =
      payload.project ??
      (Array.isArray(payload.sheets) ? payload : null);
    if (candidate) return normalizeProject(candidate);

    return null;
  } catch {
    return null;
  }
}

/** Reconstruye un proyecto de forma síncrona si el token contiene `project`. */
export function decodeProjectFromJwtSync(token: string): Project | null {
  try {
    const { payload } = decodeJwt<Record<string, unknown>>(token);
    if (!payload || typeof payload !== "object") return null;
    const candidate =
      payload.project ??
      (Array.isArray(payload.sheets) ? payload : null);
    if (candidate) return normalizeProject(candidate);
    return null;
  } catch {
    return null;
  }
}
