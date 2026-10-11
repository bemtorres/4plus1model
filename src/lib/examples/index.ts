import { EXAMPLES } from "./catalog";
import { buildExampleWorkspace, type CategoryId, type ExampleSpec } from "./builder";
import { createSampleWorkspace } from "@/lib/sample";
import { sanitizeExampleCode } from "./url";
import type { Workspace } from "@/lib/types";

export type { CategoryId, Difficulty, ExampleSpec } from "./builder";
export { CATEGORY_ICONS, CATEGORY_ORDER, DIFFICULTIES, EXAMPLES } from "./catalog";
export { buildExampleWorkspace } from "./builder";

/** Código del ejemplo de demostración que venía incluido con la app. */
export const SAMPLE_CODE = "online-store";

export type ExampleTarget =
  | { kind: "catalog"; code: string; example: ExampleSpec }
  | { kind: "sample"; code: string };

/** Resuelve un código de ejemplo (el del catálogo o el de demostración). */
export function findExampleByCode(code: string): ExampleTarget | null {
  const normalized = sanitizeExampleCode(code);
  if (!normalized) return null;
  if (normalized === SAMPLE_CODE || normalized === "sample" || normalized === "demo") {
    return { kind: "sample", code: SAMPLE_CODE };
  }
  const example = EXAMPLES.find((item) => item.id === normalized);
  return example ? { kind: "catalog", code: example.id, example } : null;
}

export function buildWorkspaceFor(target: ExampleTarget): Workspace {
  return target.kind === "sample"
    ? createSampleWorkspace()
    : buildExampleWorkspace(target.example);
}

/** Normaliza texto para las búsquedas (sin acentos ni mayúsculas). */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export interface ExampleFilter {
  query?: string;
  category?: CategoryId | "all";
  difficulty?: string;
}

export function filterExamples({ query, category, difficulty }: ExampleFilter): ExampleSpec[] {
  const needle = normalize(query ?? "");
  return EXAMPLES.filter((example) => {
    if (category && category !== "all" && example.category !== category) return false;
    if (difficulty && difficulty !== "all" && example.difficulty !== difficulty) return false;
    if (!needle) return true;
    const haystack = normalize(
      [
        example.name,
        example.reference,
        example.summary,
        example.focus,
        example.category,
        example.containers.map(([name]) => name).join(" "),
      ].join(" "),
    );
    return needle.split(/\s+/).every((word) => haystack.includes(word));
  });
}

export function countByCategory(): Record<string, number> {
  return EXAMPLES.reduce<Record<string, number>>((accumulator, example) => {
    accumulator[example.category] = (accumulator[example.category] ?? 0) + 1;
    return accumulator;
  }, {});
}

/** Ruta de la imagen dentro de `public/examples`. */
export function exampleImage(id: string): string {
  return `/examples/${id}.png`;
}
