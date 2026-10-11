import { Button } from "@heroui/react";
import { useState } from "react";
import { buildEditUrl } from "@/lib/share";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { Icon } from "./icons";
import { FIT_VIEW_EVENT } from "./Canvas";
import { useFullscreen } from "./useFullscreen";

/**
 * Barra flotante de Modo Presentación sobre el lienzo.
 * Ofrece acceso rápido a Pantalla Completa, Ajustar Vista, Navegación de capas y Editar.
 */
export function ReadOnlyBanner() {
  const { readOnly } = useWorkspace();
  const t = useT();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [minimized, setMinimized] = useState(false);

  if (!readOnly) return null;

  const edit = () => {
    window.open(buildEditUrl(), "_blank", "noopener,noreferrer");
  };

  const fit = () => {
    window.dispatchEvent(new CustomEvent(FIT_VIEW_EVENT));
  };

  if (minimized) {
    return (
      <div className="pointer-events-none absolute bottom-4 left-4 z-20">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-all hover:bg-surface hover:shadow-md"
          title="Restaurar controles de presentación"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Presentación</span>
          <Icon name="chevron-up" className="text-xs" />
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-2xl items-center gap-2 sm:gap-3 rounded-xl border border-emerald-500/30 bg-surface/95 px-3 py-1.5 shadow-overlay backdrop-blur transition-all">
        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Modo Presentación</span>
        </span>

        <p className="hidden md:inline truncate text-[11px] text-muted">
          Navega por capas y explora el diseño
        </p>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted hover:text-foreground"
            onPress={toggleFullscreen}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            <Icon name={isFullscreen ? "minimize" : "fullscreen"} className="mr-1 text-xs" />
            <span className="hidden sm:inline">{isFullscreen ? "Salir" : "Pantalla completa"}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted hover:text-foreground"
            onPress={fit}
            title="Ajustar diagrama a la pantalla"
          >
            <Icon name="fit" className="mr-1 text-xs" />
            <span className="hidden sm:inline">Ajustar</span>
          </Button>
        </div>

        <Button size="sm" variant="primary" className="h-7 shrink-0 text-xs font-medium shadow-xs" onPress={edit}>
          <Icon name="external" />
          <span>{t("share.edit")}</span>
        </Button>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="ml-0.5 rounded p-1 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
          title="Minimizar barra"
          aria-label="Minimizar"
        >
          <Icon name="chevron-up" className="text-xs" />
        </button>
      </div>
    </div>
  );
}
