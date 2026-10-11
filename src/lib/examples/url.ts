/** Parámetro de URL que identifica el ejemplo a cargar: `?code=<código>`. */
export const CODE_PARAM = "code";

export function readExampleCode(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(CODE_PARAM);
  return value && value.trim() ? value.trim() : null;
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
