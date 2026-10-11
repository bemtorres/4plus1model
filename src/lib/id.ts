
let counter = 0;

/** Identificador corto, legible y único dentro de la sesión. */
export function createId(prefix: string): string {
  counter += 1;
  const time = Date.now().toString(36);
  const seq = counter.toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${time}${seq}${rand}`;
}
