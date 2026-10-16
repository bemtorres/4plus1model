import { useEffect, useRef } from "react";
import { useT } from "@/i18n";
import { kindMeta } from "@/lib/diagrams";
import { useProject } from "@/lib/project-store";
import type { DiagramElement } from "@/lib/types";

interface NodeContextMenuProps {
  x: number;
  y: number;
  element: DiagramElement;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onOpenDetailed?: () => void;
  onGroupIntoDetailed?: () => void;
}

export function NodeContextMenu({
  x,
  y,
  element,
  onDuplicate,
  onDelete,
  onClose,
  onOpenDetailed,
  onGroupIntoDetailed,
}: NodeContextMenuProps) {
  const t = useT();
  const menuRef = useRef<HTMLDivElement>(null);
  const { sheet } = useProject();
  const meta = kindMeta(sheet.diagram, element.kind);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Asegura que el menú no se salga de los límites de la pantalla
  const menuWidth = 230;
  const menuHeight = 180;
  const clampedX = Math.max(12, Math.min(x, window.innerWidth - menuWidth - 12));
  const clampedY = Math.max(12, Math.min(y, window.innerHeight - menuHeight - 12));

  return (
    <div
      className="fixed inset-0 z-50 select-none"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        ref={menuRef}
        role="menu"
        aria-label={`Opciones para ${element.name}`}
        className="fixed z-50 w-56 overflow-hidden rounded-xl border border-border/80 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 text-xs"
        style={{ left: `${clampedX}px`, top: `${clampedY}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con nombre y tipo del componente */}
        <div className="px-2.5 py-1.5 border-b border-border/60 mb-1">
          <p className="truncate font-medium text-foreground text-[12px] leading-tight" title={element.name}>
            {element.name || meta.label}
          </p>
          <p className="text-[10px] text-muted truncate mt-0.5">{meta.label}</p>
        </div>

        {/* Abrir ficha técnica si es un caso de uso detallado */}
        {element.kind === "detailedUseCase" && onOpenDetailed ? (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] transition-colors text-left cursor-pointer mb-1 font-semibold"
            onClick={() => {
              onOpenDetailed();
              onClose();
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">📖</span>
              <span>Abrir Ficha Detallada</span>
            </span>
            <kbd className="text-[9px] font-mono text-amber-700/80 dark:text-amber-300/80 bg-amber-500/10 rounded px-1.5 py-0.5">
              2-clic
            </kbd>
          </button>
        ) : null}

        {/* Agrupar en CU Detallado si es un caso de uso ordinario */}
        {element.kind === "useCase" && onGroupIntoDetailed ? (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-foreground hover:bg-accent-soft hover:text-accent active:scale-[0.98] transition-colors text-left cursor-pointer mb-1"
            onClick={() => {
              onGroupIntoDetailed();
              onClose();
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">📦</span>
              <span className="font-medium">Agrupar en CU Detallado</span>
            </span>
          </button>
        ) : null}

        {/* Opción Duplicar */}
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-foreground hover:bg-surface-secondary active:scale-[0.98] transition-colors text-left cursor-pointer"
          onClick={() => {
            onDuplicate();
            onClose();
          }}
        >
          <span className="flex items-center gap-2">
            <svg
              className="text-muted text-[13px]"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span className="font-medium">{t("common.duplicate")}</span>
          </span>
          <kbd className="text-[10px] font-mono text-muted bg-surface-secondary/80 border border-border/70 rounded px-1.5 py-0.5">
            Ctrl+D
          </kbd>
        </button>

        {/* Opción Eliminar */}
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-danger hover:bg-danger-soft active:scale-[0.98] transition-colors text-left mt-0.5 cursor-pointer"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <span className="flex items-center gap-2">
            <svg
              className="text-danger text-[13px]"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            <span className="font-medium">{t("common.delete")}</span>
          </span>
          <kbd className="text-[10px] font-mono text-muted bg-surface-secondary/80 border border-border/70 rounded px-1.5 py-0.5">
            Supr
          </kbd>
        </button>
      </div>
    </div>
  );
}
