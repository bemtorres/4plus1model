import { useT, type TranslationKey } from "./index";
import type { ElementKind, Level, RelationshipStyle } from "@/lib/types";

/** Etiqueta traducida de un tipo de elemento. */
export function useKindLabel() {
  const t = useT();
  return (kind: ElementKind) => t(`kind.${kind}` as TranslationKey);
}

/** Etiqueta traducida de un nivel del diagrama. */
export function useLevelLabel() {
  const t = useT();
  return (level: Level) => t(`level.${level}` as TranslationKey);
}

/** Descripción traducida de un nivel del diagrama. */
export function useLevelDescription() {
  const t = useT();
  return (level: Level) => t(`level.${level}.desc` as TranslationKey);
}

/** Etiqueta traducida del estilo de una relación. */
export function useStyleLabel() {
  const t = useT();
  return (style: RelationshipStyle) => t(`style.${style}` as TranslationKey);
}
