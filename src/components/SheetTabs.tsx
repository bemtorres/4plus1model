import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n";
import { diagramDef } from "@/lib/diagrams";
import { useProject } from "@/lib/project-store";
import type { Sheet } from "@/lib/types";
import { Icon } from "./icons";
import { SheetSettingsDialog } from "./SheetSettingsDialog";

interface MenuState {
  sheetId: string;
  x: number;
  y: number;
}

/**
 * Barra inferior de pestañas estilo Draw.io: cada pestaña es una vista del proyecto.
 * El botón «+» crea directamente una nueva vista limpia. Doble clic para renombrar.
 * Permite cambiar color e icono desde el menú contextual en un diálogo modal.
 */
export function SheetTabs() {
  const t = useT();
  const {
    project,
    activeSheetId,
    readOnly,
    selectSheet,
    renameSheet,
    updateSheet,
    duplicateSheet,
    removeSheet,
    addSheet,
  } = useProject();

  const [menu, setMenu] = useState<MenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [settingsSheet, setSettingsSheet] = useState<Sheet | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sheets = project.sheets;
  const hidden = readOnly && sheets.length <= 1;

  useEffect(() => {
    if (!menu) return;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  if (hidden) return null;

  const closeMenus = () => {
    setMenu(null);
  };

  const openSheetMenuAt = (sheetId: string, x: number, y: number) => {
    setMenu({
      sheetId,
      x: Math.min(x, window.innerWidth - 190),
      y: Math.max(8, y - 165),
    });
  };

  const commitRename = (sheetId: string, name: string) => {
    renameSheet(sheetId, name.trim());
    setRenamingId(null);
  };

  return (
    <>
      <div className="sheet-tabs scroll-thin" ref={containerRef}>
        {sheets.map((sheet, index) => {
          const def = diagramDef(sheet.diagram);
          const active = sheet.id === activeSheetId;
          const isRenaming = renamingId === sheet.id;
          const displayName = sheet.name || `Vista ${index + 1}`;
          const effectiveIcon = sheet.icon === null ? null : (sheet.icon ?? def.icon);
          const customColor = sheet.color || null;

          const tabStyle: React.CSSProperties = {
            ...(customColor && active
              ? {
                  borderTopColor: customColor,
                  borderTopWidth: "3px",
                  boxShadow: `inset 0 2px 0 0 ${customColor}`,
                }
              : customColor && !active
                ? {
                    borderTopColor: `${customColor}80`,
                    borderTopWidth: "2px",
                  }
                : {}),
          };

          return (
            <div
              key={sheet.id}
              className={`sheet-tab ${active ? "sheet-tab--active" : ""}`}
              role="tab"
              aria-selected={active}
              tabIndex={0}
              style={tabStyle}
              onClick={() => {
                if (isRenaming) return;
                selectSheet(sheet.id);
              }}
              onDoubleClick={() => {
                if (readOnly) return;
                setRenamingId(sheet.id);
                setMenu(null);
              }}
              onContextMenu={(event) => {
                if (readOnly) return;
                event.preventDefault();
                event.stopPropagation();
                openSheetMenuAt(sheet.id, event.clientX, event.clientY);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isRenaming) selectSheet(sheet.id);
              }}
            >
              {effectiveIcon ? (
                <Icon
                  name={effectiveIcon}
                  className="sheet-tab__icon"
                  style={customColor ? { color: customColor } : undefined}
                />
              ) : null}
              {isRenaming ? (
                <input
                  className="sheet-tab__input"
                  type="text"
                  autoFocus
                  defaultValue={sheet.name}
                  placeholder={`Vista ${index + 1}`}
                  aria-label={t("sheet.rename")}
                  onClick={(event) => event.stopPropagation()}
                  onBlur={(event) => commitRename(sheet.id, event.currentTarget.value)}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    } else if (event.key === "Escape") {
                      setRenamingId(null);
                      event.currentTarget.blur();
                    }
                  }}
                />
              ) : (
                <span className="sheet-tab__name">{displayName}</span>
              )}
              {!readOnly ? (
                <button
                  type="button"
                  className="sheet-tab__menu"
                  aria-label="Opciones de vista"
                  title="Opciones de vista"
                  onClick={(event) => {
                    event.stopPropagation();
                    const rect = event.currentTarget.getBoundingClientRect();
                    openSheetMenuAt(sheet.id, rect.left, rect.top);
                  }}
                >
                  ⋯
                </button>
              ) : null}
            </div>
          );
        })}

        {!readOnly ? (
          <button
            type="button"
            className="sheet-tab sheet-tab--new"
            aria-label="Nueva vista"
            title="Crear nueva vista"
            onClick={() => {
              closeMenus();
              const newId = addSheet("usecase");
              if (newId) {
                setRenamingId(newId);
              }
            }}
          >
            <Icon name="plus" />
          </button>
        ) : null}

        {menu ? (
          <div
            ref={menuRef}
            role="menu"
            className="sheet-menu"
            style={{ left: menu.x, top: menu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const target = sheets.find((s) => s.id === menu.sheetId);
                if (target) setSettingsSheet(target);
                closeMenus();
              }}
            >
              <Icon name="palette" className="text-xs" />
              <span>Color e icono…</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setRenamingId(menu.sheetId);
                closeMenus();
              }}
            >
              <Icon name="keyboard" className="text-xs" />
              <span>{t("sheet.rename")}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                duplicateSheet(menu.sheetId);
                closeMenus();
              }}
            >
              <Icon name="copy" className="text-xs" />
              <span>{t("sheet.duplicate")}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="sheet-menu__danger"
              disabled={sheets.length <= 1}
              title={sheets.length <= 1 ? t("sheet.lastOne") : undefined}
              onClick={() => {
                removeSheet(menu.sheetId);
                closeMenus();
              }}
            >
              <Icon name="trash" className="text-xs" />
              <span>{t("sheet.delete")}</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Modal para configurar color, icono y nombre de la vista */}
      <SheetSettingsDialog
        sheet={settingsSheet}
        isOpen={Boolean(settingsSheet)}
        onClose={() => setSettingsSheet(null)}
        onSave={updateSheet}
      />
    </>
  );
}
