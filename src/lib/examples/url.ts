/** Parámetro de URL que identifica el ejemplo a cargar: `?code=<código>`. */
export const CODE_PARAM = "code";

/** Expresión regular para validar slug seguro: solo minúsculas, números y guiones sencillos. */
export const CODE_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_CODE_LENGTH = 64;

/** Sanitiza y valida el código contra inyecciones y longitud máxima. */
export function sanitizeExampleCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const decoded = decodeURIComponent(raw).trim().toLowerCase();
    if (!decoded || decoded.length > MAX_CODE_LENGTH) return null;
    if (!CODE_SLUG_REGEX.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function hasExampleParam(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(CODE_PARAM);
}

export function readExampleCode(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(CODE_PARAM);
  return value ? sanitizeExampleCode(value) : null;
}

function write(params: URLSearchParams, mode: "push" | "replace") {
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

/** Deja el ejemplo en la URL para poder compartir o recargar el enlace. */
export function setExampleCode(code: string, mode: "push" | "replace" = "push") {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  params.set(CODE_PARAM, code);
  write(params, mode);
}

/** Quita el parámetro (el usuario ya está editando un modelo propio). */
export function clearExampleCode(mode: "push" | "replace" = "replace") {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has(CODE_PARAM)) return;
  params.delete(CODE_PARAM);
  write(params, mode);
}
