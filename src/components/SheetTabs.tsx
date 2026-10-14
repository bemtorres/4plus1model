import { useEffect, useRef, useState } from "react";
import { useT, type TranslationKey } from "@/i18n";
import { DIAGRAM_LIST, diagramDef } from "@/lib/diagrams";
import { useProject } from "@/lib/project-store";
import type { DiagramId } from "@/lib/types";
import { Icon } from "./icons";

interface MenuState {
  sheetId: string;
  x: number;
  y: number;
}

interface NewMenuState {
  x: number;
  y: number;
}

/**
 * Barra inferior de pestañas estilo draw.io: cada pestaña es una hoja del
 * proyecto. Doble clic para renombrar; menú «⋯» para renombrar/duplicar/eliminar.
 */
export function SheetTabs() {
  const t = useT();
  const {
    project,
    activeSheetId,
    readOnly,
    selectSheet,
    renameSheet,
    duplicateSheet,
    removeSheet,
    addSheet,
  } = useProject();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [newMenu, setNewMenu] = useState<NewMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);

  const sheets = project.sheets;
  const hidden = readOnly && sheets.length <= 1;

  useEffect(() => {
    if (!menu && !newMenu) return;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      if (newMenuRef.current?.contains(event.target as Node)) return;
      setMenu(null);
      setNewMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
        setNewMenu(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, newMenu]);

  if (hidden) return null;

  const closeMenus = () => {
    setMenu(null);
    setNewMenu(null);
  };

  const openSheetMenu = (sheetId: string, rect: DOMRect) => {
    setNewMenu(null);
    setMenu({
      sheetId,
      x: Math.min(rect.left, window.innerWidth - 180),
      y: Math.max(8, rect.top - 132),
    });
  };

  const commitRename = (sheetId: string, name: string) => {
    const next = name.trim();
    if (next) renameSheet(sheetId, next);
    setRenamingId(null);
  };

  return (
    <div className="sheet-tabs scroll-thin" ref={containerRef}>
      {sheets.map((sheet) => {
        const def = diagramDef(sheet.diagram);
        const active = sheet.id === activeSheetId;
        const isRenaming = renamingId === sheet.id;
        return (
          <div
            key={sheet.id}
            className={`sheet-tab ${active ? "sheet-tab--active" : ""}`}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            onClick={() => {
              if (isRenaming) return;
              selectSheet(sheet.id);
            }}
            onDoubleClick={() => {
              if (readOnly) return;
              setRenamingId(sheet.id);
              setMenu(null);
              setNewMenu(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isRenaming) selectSheet(sheet.id);
            }}
          >
            <Icon name={def.icon} className="sheet-tab__icon" />
            {isRenaming ? (
              <input
                className="sheet-tab__input"
                type="text"
                autoFocus
                defaultValue={sheet.name}
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
              <span className="sheet-tab__name">{sheet.name}</span>
            )}
            {!readOnly ? (
              <button
                type="button"
                className="sheet-tab__menu"
                aria-label={t("sheet.rename")}
                onClick={(event) => {
                  event.stopPropagation();
                  openSheetMenu(sheet.id, event.currentTarget.getBoundingClientRect());
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
          aria-label={t("sheet.new")}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setMenu(null);
            setNewMenu({
              x: Math.min(rect.left, window.innerWidth - 220),
              y: Math.max(8, rect.top - 40 - DIAGRAM_LIST.length * 34),
            });
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
              setRenamingId(menu.sheetId);
              closeMenus();
            }}
          >
            {t("sheet.rename")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              duplicateSheet(menu.sheetId);
              closeMenus();
            }}
          >
            {t("sheet.duplicate")}
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
            {t("sheet.delete")}
          </button>
        </div>
      ) : null}

      {newMenu ? (
        <div
          ref={newMenuRef}
          role="menu"
          className="sheet-menu"
          style={{ left: newMenu.x, top: newMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {DIAGRAM_LIST.map((def) => (
            <button
              key={def.id}
              type="button"
              role="menuitem"
              className={def.comingSoon ? "sheet-menu__soon" : undefined}
              disabled={def.comingSoon}
              title={def.comingSoon ? t("sheet.comingSoon") : undefined}
              onClick={() => {
                addSheet(def.id as DiagramId);
                closeMenus();
              }}
            >
              <Icon name={def.icon} />
              <span>{t(`diagram.${def.id}` as TranslationKey)}</span>
              {def.comingSoon ? <em>{t("sheet.comingSoon")}</em> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
