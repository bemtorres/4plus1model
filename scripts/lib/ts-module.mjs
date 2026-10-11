/**
 * Carga módulos TypeScript del repo como módulos ES temporales.
 *
 * Los scripts no usan bundler ni transpilador, así que leemos el archivo, le
 * quitamos las anotaciones de tipo que lo separan de JavaScript válido y lo
 * importamos desde un fichero temporal. Sólo funciona con módulos cuyo código
 * de ejecución sea JavaScript plano (catálogos y mapas de constantes).
 *
 * Los `transforms` permiten ajustar las anotaciones propias de cada archivo.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function loadTsModule(url, transforms = []) {
  let source = readFileSync(url, "utf8");

  // `import type { … } from "…";` no aporta nada en tiempo de ejecución.
  source = source.replace(/import type \{[^}]+\} from "[^"]+";/g, "");
  // Los `as const` de los literales son sólo para el type checker.
  source = source.replace(/ as const;/g, ";");
  for (const [pattern, replacement] of transforms) {
    source = source.replace(pattern, replacement);
  }

  const dir = mkdtempSync(join(tmpdir(), "c4-script-"));
  const file = join(dir, "module.mjs");
  writeFileSync(file, source, "utf8");
  return import(pathToFileURL(file).href);
}

/** Transformaciones del catálogo de ejemplos (`src/lib/examples/catalog.ts`). */
export const CATALOG_TRANSFORMS = [
  [/export const EXAMPLES: ExampleSpec\[\]/, "export const EXAMPLES"],
  [/export const CATEGORY_ORDER: CategoryId\[\]/, "export const CATEGORY_ORDER"],
  [/export const DIFFICULTIES: Difficulty\[\]/, "export const DIFFICULTIES"],
];

/** Transformaciones del mapa de enlaces de referencia. */
export const REFERENCE_TRANSFORMS = [
  [/export const REFERENCE_URLS: Record<string, string> =/, "export const REFERENCE_URLS ="],
  [/export function referenceUrl\(reference: string\): string \| undefined \{/,
    "export function referenceUrl(reference) {"],
];

/** `import.meta.url` de un archivo del repositorio, relativo a `scripts/lib/`. */
export function repoUrl(relativePath) {
  return new URL(`../../${relativePath}`, import.meta.url);
}
