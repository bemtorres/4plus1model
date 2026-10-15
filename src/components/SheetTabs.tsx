import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/i18n";
import { APP_INFO } from "@/lib/author";
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

interface SelectorMenuState {
  x: number;
  y: number;
}

const MAX_VISIBLE_TABS = 5;

/**
 * Barra inferior de pestañas estilo Excel:
 * - Esquina inferior izquierda: «Desarrollado por Benjamin Mora Torres · fecha · versión»
 *   con enlace que abre la información en una nueva pestaña (`target="_blank"`).
 * - Muestra un máximo de 5 pestañas a la vez.
 * - Desplazamiento inteligente: Si estás en la vista 8, la barra se desplaza (slide)
 *   mostrando una ventana continua (ej: vistas 4, 5, 6, 7, 8) para mantener la vista activa visible.
 * - Flechas de desplazamiento «◀» y «▶» como en Excel para recorrer las pestañas.
 * - Botón selector «Vistas (N)» para ver y saltar directamente a cualquier vista en un menú.
 * - Cada pestaña permite cambiar color e icono en un modal.
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
  const [selectorOpen, setSelectorOpen] = useState<SelectorMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [settingsSheet, setSettingsSheet] = useState<Sheet | null>(null);
  const [startIndex, setStartIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const sheets = project.sheets;
  const hidden = readOnly && sheets.length <= 1;
  const hasOverflow = sheets.length > MAX_VISIBLE_TABS;
  const maxStartIndex = Math.max(0, sheets.length - MAX_VISIBLE_TABS);

  // Desplazamiento automático para mantener la pestaña activa dentro de la ventana visible de 5
  useEffect(() => {
    const activeIndex = sheets.findIndex((s) => s.id === activeSheetId);
    if (activeIndex === -1) return;

    setStartIndex((prev) => {
      // Si la activa está antes del inicio visible, retroceder la ventana
      if (activeIndex < prev) {
        return activeIndex;
      }
      // Si la activa está más adelante de la ventana visible, avanzar la ventana
      if (activeIndex >= prev + MAX_VISIBLE_TABS) {
        return Math.min(activeIndex - MAX_VISIBLE_TABS + 1, maxStartIndex);
      }
      // Mantener dentro de los límites si se borraron pestañas
      return Math.min(prev, maxStartIndex);
    });
  }, [activeSheetId, sheets.length, maxStartIndex]);

  // Pestañas visibles en la ventana actual (máximo 5 consecutivas)
  const visibleSheets = useMemo(() => {
    if (!hasOverflow) return sheets;
    const boundedStart = Math.min(Math.max(0, startIndex), maxStartIndex);
    return sheets.slice(boundedStart, boundedStart + MAX_VISIBLE_TABS);
  }, [sheets, startIndex, maxStartIndex, hasOverflow]);

  const canScrollLeft = hasOverflow && startIndex > 0;
  const canScrollRight = hasOverflow && startIndex < maxStartIndex;

  const scrollLeft = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    setStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  useEffect(() => {
    if (!menu && !selectorOpen) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || selectorRef.current?.contains(target)) return;
      setMenu(null);
      setSelectorOpen(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
        setSelectorOpen(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, selectorOpen]);

  if (hidden) return null;

  const closeMenus = () => {
    setMenu(null);
    setSelectorOpen(null);
  };

  const openSheetMenuAt = (sheetId: string, x: number, y: number) => {
    setSelectorOpen(null);
    setMenu({
      sheetId,
      x: Math.min(x, window.innerWidth - 190),
      y: Math.max(8, y - 165),
    });
  };

  const toggleSelector = (rect: DOMRect) => {
    setMenu(null);
    if (selectorOpen) {
      setSelectorOpen(null);
    } else {
      setSelectorOpen({
        x: Math.min(rect.left, window.innerWidth - 240),
        y: Math.max(8, rect.top - Math.min(320, sheets.length * 34 + 50)),
      });
    }
  };

  const commitRename = (sheetId: string, name: string) => {
    renameSheet(sheetId, name.trim());
    setRenamingId(null);
  };

  return (
    <>
      <div className="sheet-tabs-bar">
        {/* Esquina inferior izquierda: Desarrollado por Benjamin Mora Torres · fecha · versión */}
        <div className="sheet-tabs-bar__left">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="sheet-tabs-author"
            title="Abrir información del autor y del proyecto en una nueva pestaña"
          >
            <Icon name="info" className="text-xs opacity-75" />
            <span>
              Desarrollado por <strong>{APP_INFO.author}</strong> · {APP_INFO.date} · {APP_INFO.version}
            </span>
            <Icon name="external" className="text-[10px] opacity-60 ml-0.5" />
          </a>
        </div>

        {/* Centro: Controles de desplazamiento y pestañas de vistas */}
        <div className="sheet-tabs-bar__center">
          <div className="sheet-tabs scroll-thin" ref={containerRef}>
            {/* Controles estilo Excel: flechas de desplazamiento y selector cuando hay más de 5 pestañas */}
            {hasOverflow ? (
              <div className="flex items-center gap-1 mr-1.5 mb-1 shrink-0">
                <button
                  type="button"
                  className="sheet-nav-btn"
                  title="Desplazar pestañas a la izquierda"
                  aria-label="Desplazar pestañas a la izquierda"
                  disabled={!canScrollLeft}
                  onClick={scrollLeft}
                >
                  <Icon name="chevron-left" className="text-xs" />
                </button>
                <button
                  type="button"
                  className="sheet-nav-btn"
                  title="Desplazar pestañas a la derecha"
                  aria-label="Desplazar pestañas a la derecha"
                  disabled={!canScrollRight}
                  onClick={scrollRight}
                >
                  <Icon name="chevron-right" className="text-xs" />
                </button>
                <button
                  type="button"
                  className={`sheet-tab sheet-tab--selector ${selectorOpen ? "sheet-tab--active" : ""}`}
                  title={`Ver todas las vistas (${sheets.length} en total)`}
                  aria-label="Selector de vistas"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelector(event.currentTarget.getBoundingClientRect());
                  }}
                >
                  <Icon name="menu" className="text-xs" />
                  <span className="font-semibold text-xs">Vistas</span>
                  <span className="rounded-full bg-surface-secondary px-1.5 py-0.2 text-[10px] font-bold text-muted border border-border">
                    {sheets.length}
                  </span>
                  <Icon name={selectorOpen ? "chevron-down" : "chevron-up"} className="text-[10px] opacity-70" />
                </button>
              </div>
            ) : null}

            {/* Ventana de máximo 5 pestañas visibles consecutivas */}
            {visibleSheets.map((sheet) => {
              const actualIndex = sheets.findIndex((s) => s.id === sheet.id);
              const def = diagramDef(sheet.diagram);
              const active = sheet.id === activeSheetId;
              const isRenaming = renamingId === sheet.id;
              const displayName = sheet.name || `Vista ${actualIndex + 1}`;
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
                    setSelectorOpen(null);
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
                      placeholder={`Vista ${actualIndex + 1}`}
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

            {/* Botón «+» para crear una nueva vista */}
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
          </div>
        </div>

        {/* Lado derecho: Balance visual para mantener el centro simétrico en pantallas grandes */}
        <div className="sheet-tabs-bar__right hidden xl:flex" style={{ width: "240px" }} />
      </div>

      {/* Menú contextual de una vista concreta (⋯ o clic derecho) */}
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

      {/* Menú desplegable estilo Excel con todas las vistas */}
      {selectorOpen ? (
        <div
          ref={selectorRef}
          role="menu"
          className="sheet-menu sheet-menu--selector"
          style={{
            left: selectorOpen.x,
            top: selectorOpen.y,
            maxHeight: "320px",
            overflowY: "auto",
            minWidth: "220px",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted border-b border-border flex items-center justify-between">
            <span>Todas las vistas ({sheets.length})</span>
            <span className="text-[10px] text-accent font-medium">Excel Mode</span>
          </div>
          {sheets.map((s, idx) => {
            const def = diagramDef(s.diagram);
            const isSelected = s.id === activeSheetId;
            const sIcon = s.icon === null ? null : (s.icon ?? def.icon);
            const sColor = s.color || null;
            const sName = s.name || `Vista ${idx + 1}`;

            return (
              <button
                key={s.id}
                type="button"
                role="menuitem"
                className={isSelected ? "font-semibold bg-accent-soft text-accent" : ""}
                onClick={() => {
                  selectSheet(s.id);
                  closeMenus();
                }}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: sColor || "var(--muted)" }}
                />
                {sIcon ? (
                  <Icon
                    name={sIcon}
                    className="text-xs shrink-0"
                    style={sColor ? { color: sColor } : undefined}
                  />
                ) : null}
                <span className="truncate flex-1 text-left">{sName}</span>
                {isSelected ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-white font-bold ml-auto">
                    Activa
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

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
