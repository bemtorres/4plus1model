import { useT } from "./index";
import type { ElementKind, Level, RelationshipStyle } from "@/lib/types";

/** Etiqueta traducida de un tipo de elemento. */
export function useKindLabel() {
  const t = useT();
  return (kind: ElementKind) => t(`kind.${kind}`);
}

/** Etiqueta traducida de un nivel C4. */
export function useLevelLabel() {
  const t = useT();
  return (level: Level) => t(`level.${level}`);
}

/** Descripción traducida de un nivel C4. */
export function useLevelDescription() {
  const t = useT();
  return (level: Level) => t(`level.${level}.desc`);
}

/** Etiqueta traducida del estilo de una relación. */
export function useStyleLabel() {
  const t = useT();
  return (style: RelationshipStyle) => t(`style.${style}`);
}
