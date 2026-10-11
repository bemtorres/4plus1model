import { Button } from "@heroui/react";
import { buildEditUrl } from "@/lib/share";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { Icon } from "./icons";

/**
 * Aviso de solo lectura sobre el lienzo. El botón «Editar» abre una copia
 * editable del mismo diagrama en una pestaña nueva.
 */
export function ReadOnlyBanner() {
  const { readOnly } = useWorkspace();
  const t = useT();
  if (!readOnly) return null;

  const edit = () => {
    window.open(buildEditUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-2xl items-center gap-3 rounded-xl border border-accent/40 bg-surface/95 px-3 py-2 shadow-overlay backdrop-blur">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-soft-foreground">
          <Icon name="lock" className="text-sm" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{t("share.readOnly")}</p>
          <p className="truncate text-[11px] text-muted">{t("share.readOnlyHint")}</p>
        </div>
        <Button size="sm" variant="primary" className="shrink-0" onPress={edit}>
          <Icon name="external" />
          {t("share.edit")}
        </Button>
      </div>
    </div>
  );
}
