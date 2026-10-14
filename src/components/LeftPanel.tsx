import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useProject } from "@/lib/project-store";
import { useT } from "@/i18n";
import { DRAG_KIND } from "./Canvas";
import { Icon } from "./icons";
import {
  GENERAL_SHAPES,
  FOUR_PLUS_ONE_SHAPES,
  type ShapeDefinition,
} from "./drawio-shapes";
import { kindMeta, iconOf } from "@/lib/diagrams";
import type { DiagramElement, ElementKind } from "@/lib/types";

interface ScratchpadItem {
  id: string;
  kind: ElementKind;
  name: string;
}

export function LeftPanel({
  onClose,
  isOpenMobile,
}: {
  onClose?: () => void;
  isOpenMobile?: boolean;
}) {
  const {
    sheet,
    selection,
    addElement,
    select,
    drillInto,
    readOnly,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useProject();
  const t = useT();

  // Integración directa con React Flow para zoom y vista
  const { zoomIn, zoomOut, getZoom, setViewport, fitView } = useReactFlow();

  // Estados de acordeones
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(true);
  const [isGeneralOpen, setIsGeneralOpen] = useState(true);
  const [isFourPlusOneOpen, setIsFourPlusOneOpen] = useState(true);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [active41Tab, setActive41Tab] = useState<string>("all");

  // Estado del Bloc de notas (Scratchpad)
  const [scratchpadItems, setScratchpadItems] = useState<ScratchpadItem[]>(() => {
    try {
      const saved = localStorage.getItem("4plus1:scratchpad");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar bloc de notas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("4plus1:scratchpad", JSON.stringify(scratchpadItems));
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }, [scratchpadItems]);

  // Buscador de formas
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atajo de teclado: presionar '/' para enfocar el buscador
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Control de zoom
  const [currentZoomPercent, setCurrentZoomPercent] = useState<number>(100);
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);

  useEffect(() => {
    const updateZoom = () => {
      try {
        const z = getZoom();
        setCurrentZoomPercent(Math.round(z * 100));
      } catch {
        // Ignorar si aún no está inicializado
      }
    };
    updateZoom();
    const interval = setInterval(updateZoom, 600);
    return () => clearInterval(interval);
  }, [getZoom]);

  const handleZoomSelect = (percent: number) => {
    setZoomDropdownOpen(false);
    if (percent === 0) {
      void fitView({ padding: 0.2, duration: 250 });
    } else {
      const scale = percent / 100;
      setViewport({ x: 100, y: 100, zoom: scale }, { duration: 200 });
      setCurrentZoomPercent(percent);
    }
  };

  // Añadir elemento actual seleccionado al Bloc de notas
  const handleAddToScratchpad = () => {
    if (selection?.type === "element") {
      const target = sheet.elements.find((el) => el.id === selection.id);
      if (target) {
        setScratchpadItems((prev) => [
          ...prev,
          {
            id: `scratch_${Date.now()}`,
            kind: target.kind,
            name: target.name,
          },
        ]);
      }
    }
  };

  // Filtrado de formas por búsqueda
  const query = searchQuery.trim().toLowerCase();
  const filteredGeneral = query
    ? GENERAL_SHAPES.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.tooltip.toLowerCase().includes(query),
      )
    : GENERAL_SHAPES;

  const filtered41 = FOUR_PLUS_ONE_SHAPES.map((group) => ({
    ...group,
    shapes: query
      ? group.shapes.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.tooltip.toLowerCase().includes(query),
        )
      : active41Tab === "all" || active41Tab === group.viewId
        ? group.shapes
        : [],
  })).filter((group) => group.shapes.length > 0);

  // Jerarquía del árbol de elementos para la sección Outline
  const childrenByParent = new Map<string | null, DiagramElement[]>();
  for (const element of sheet.elements) {
    if (element.kind === "note") continue;
    const key = element.parentId;
    const list = childrenByParent.get(key);
    if (list) list.push(element);
    else childrenByParent.set(key, [element]);
  }
  const roots = childrenByParent.get(null) ?? [];
  const selectedId = selection?.type === "element" ? selection.id : null;

  return (
    <aside
      className={[
        "panel panel--left select-none text-foreground flex flex-col h-full bg-surface border-r border-separator w-full overflow-hidden",
        isOpenMobile ? "panel--mobile-open" : "",
      ]
        .join(" ")
        .trim()}
    >
      {/* 1. Barra superior de herramientas compacta estilo Draw.io */}
      <div className="flex items-center justify-between border-b border-separator px-2 py-1.5 bg-surface-secondary/40 text-muted">
        {/* Toggle / Menú lateral */}
        <div className="flex items-center gap-0.5">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-surface-secondary hover:text-foreground text-xs"
              title="Cerrar panel lateral"
              aria-label="Cerrar panel"
            >
              <Icon name="x" className="text-sm" />
            </button>
          ) : (
            <button
              type="button"
              className="p-1 rounded hover:bg-surface-secondary hover:text-foreground text-xs"
              title="Opciones de panel"
            >
              <Icon name="menu" className="text-sm" />
            </button>
          )}

          {/* Selector de Zoom desplegable */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setZoomDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface-secondary text-xs font-medium text-foreground hover:text-accent transition-colors"
              title="Zoom del lienzo"
            >
              <span>{currentZoomPercent}%</span>
              <Icon name="chevron-down" className="text-[10px] opacity-70" />
            </button>

            {zoomDropdownOpen ? (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setZoomDropdownOpen(false)}
              />
            ) : null}

            {zoomDropdownOpen ? (
              <div className="absolute left-0 top-full mt-1 w-28 rounded-lg border border-border bg-surface p-1 shadow-lg z-50 text-xs">
                {[50, 75, 100, 125, 150, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleZoomSelect(val)}
                    className={[
                      "w-full text-left px-2 py-1 rounded hover:bg-surface-secondary transition-colors",
                      currentZoomPercent === val
                        ? "font-bold text-accent bg-accent-soft/30"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    {val}%
                  </button>
                ))}
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => handleZoomSelect(0)}
                  className="w-full text-left px-2 py-1 rounded hover:bg-surface-secondary text-accent font-medium transition-colors"
                >
                  Ajustar ventana
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Acciones de zoom y deshacer / rehacer */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => zoomIn({ duration: 150 })}
            className="p-1 rounded hover:bg-surface-secondary hover:text-foreground transition-colors"
            title="Acercar (+)"
            aria-label="Acercar"
          >
            <Icon name="plus" className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => zoomOut({ duration: 150 })}
            className="p-1 rounded hover:bg-surface-secondary hover:text-foreground transition-colors"
            title="Alejar (-)"
            aria-label="Alejar"
          >
            <Icon name="x" className="text-xs rotate-45" />
          </button>

          <div className="h-3.5 w-px bg-separator mx-0.5" />

          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={[
              "p-1 rounded transition-colors",
              canUndo
                ? "hover:bg-surface-secondary hover:text-foreground text-foreground"
                : "opacity-30 cursor-not-allowed",
            ].join(" ")}
            title="Deshacer (Ctrl+Z)"
            aria-label="Deshacer"
          >
            <Icon name="undo" className="text-xs" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={[
              "p-1 rounded transition-colors",
              canRedo
                ? "hover:bg-surface-secondary hover:text-foreground text-foreground"
                : "opacity-30 cursor-not-allowed",
            ].join(" ")}
            title="Rehacer (Ctrl+Y)"
            aria-label="Rehacer"
          >
            <Icon name="redo" className="text-xs" />
          </button>
        </div>
      </div>

      {/* 2. Buscador instantáneo con atajo '/' */}
      <div className="p-2 border-b border-separator/60 bg-surface">
        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe / para buscar"
            className="w-full h-8 pl-3 pr-7 rounded-md border border-border bg-surface-secondary/50 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:bg-surface transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-muted hover:text-foreground"
              title="Borrar búsqueda"
            >
              <Icon name="x" className="text-xs" />
            </button>
          ) : (
            <span className="absolute right-2 text-muted pointer-events-none">
              <Icon name="search" className="text-xs opacity-60" />
            </span>
          )}
        </div>
      </div>

      {/* 3. Área scrollable con acordeones */}
      <div className="panel__scroll scroll-thin flex-1 overflow-y-auto">
        {/* Acordeón: Bloc de notas (Scratchpad) */}
        {!searchQuery ? (
          <div className="border-b border-separator/80">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-secondary/50 cursor-pointer transition-colors">
              <button
                type="button"
                onClick={() => setIsScratchpadOpen((prev) => !prev)}
                className="flex items-center gap-1.5 flex-1 text-left"
              >
                <Icon
                  name={isScratchpadOpen ? "chevron-down" : "chevron-right"}
                  className="text-[11px] text-muted transition-transform"
                />
                <span>Bloc de notas</span>
              </button>

              <div className="flex items-center gap-1 text-muted">
                <button
                  type="button"
                  onClick={handleAddToScratchpad}
                  className="p-1 rounded hover:bg-surface-secondary hover:text-accent transition-colors"
                  title="Guardar elemento seleccionado al bloc de notas"
                >
                  <Icon name="plus" className="text-xs" />
                </button>
                {scratchpadItems.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setScratchpadItems([])}
                    className="p-1 rounded hover:bg-surface-secondary hover:text-danger transition-colors"
                    title="Vaciar bloc de notas"
                  >
                    <Icon name="trash" className="text-xs" />
                  </button>
                ) : null}
              </div>
            </div>

            {isScratchpadOpen ? (
              <div className="px-3 pb-3 pt-1">
                {scratchpadItems.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const kind = e.dataTransfer.getData(DRAG_KIND) as ElementKind;
                      if (kind) {
                        setScratchpadItems((prev) => [
                          ...prev,
                          {
                            id: `scratch_${Date.now()}`,
                            kind,
                            name: kindMeta(sheet.diagram, kind).label,
                          },
                        ]);
                      }
                    }}
                    className="rounded-md border border-dashed border-border/80 px-2 py-4 text-center text-[11px] text-muted bg-surface-secondary/20 hover:border-accent/60 transition-colors"
                  >
                    Arrastrar elementos aquí
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {scratchpadItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        draggable={!readOnly}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(DRAG_KIND, item.kind);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => addElement(item.kind)}
                        className="group relative flex flex-col items-center justify-center p-1.5 rounded-md border border-border bg-surface hover:border-accent hover:bg-surface-secondary transition-all"
                        title={item.name}
                      >
                        <span className="text-xs text-foreground group-hover:text-accent">
                          <Icon name={kindMeta(sheet.diagram, item.kind).icon} />
                        </span>
                        <span className="text-[9px] truncate max-w-full text-muted mt-0.5">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Acordeón: General (La Rejilla 5xN estilo Draw.io) */}
        <div className="border-b border-separator/80">
          <button
            type="button"
            onClick={() => setIsGeneralOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-secondary/50 cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-1.5">
              <Icon
                name={isGeneralOpen ? "chevron-down" : "chevron-right"}
                className="text-[11px] text-muted transition-transform"
              />
              <span>General</span>
            </div>
            <span className="text-[10px] text-muted">{filteredGeneral.length}</span>
          </button>

          {isGeneralOpen ? (
            <div className="p-2 pt-1">
              <div className="grid grid-cols-5 gap-1">
                {filteredGeneral.map((shape) => (
                  <button
                    key={shape.kind + shape.name}
                    type="button"
                    draggable={!readOnly}
                    disabled={readOnly}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DRAG_KIND, shape.kind);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => addElement(shape.kind)}
                    title={shape.tooltip}
                    className="group relative flex items-center justify-center size-9 rounded border border-border/70 bg-surface hover:border-accent hover:bg-accent-soft/20 text-foreground transition-all duration-100 cursor-grab active:cursor-grabbing hover:scale-105 shadow-2xs"
                  >
                    <div className="size-6 text-foreground/80 group-hover:text-accent transition-colors flex items-center justify-center">
                      {shape.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Acordeón: Modelo 4+1 (Arquitectura por vistas) */}
        <div className="border-b border-separator/80">
          <button
            type="button"
            onClick={() => setIsFourPlusOneOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-secondary/50 cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-1.5">
              <Icon
                name={isFourPlusOneOpen ? "chevron-down" : "chevron-right"}
                className="text-[11px] text-muted transition-transform"
              />
              <span>Modelo 4+1 (Arquitectura)</span>
            </div>
            <span className="text-[10px] font-bold text-accent">5 vistas</span>
          </button>

          {isFourPlusOneOpen ? (
            <div className="px-2 pb-3 pt-1 flex flex-col gap-2">
              {/* Selector de sub-vista */}
              {!searchQuery ? (
                <div className="flex flex-wrap gap-1 border-b border-border/50 pb-2">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "scenarios", label: "Escenarios" },
                    { id: "logical", label: "Lógica" },
                    { id: "process", label: "Procesos" },
                    { id: "development", label: "Desarrollo" },
                    { id: "physical", label: "Física" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActive41Tab(tab.id)}
                      className={[
                        "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                        active41Tab === tab.id
                          ? "bg-accent text-white font-medium"
                          : "bg-surface-secondary text-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Grupos de formas 4+1 */}
              {filtered41.map((group) => (
                <div key={group.viewId} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-wide uppercase text-muted px-1">
                    {group.viewName}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {group.shapes.map((shape) => (
                      <button
                        key={shape.kind}
                        type="button"
                        draggable={!readOnly}
                        disabled={readOnly}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(DRAG_KIND, shape.kind);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => addElement(shape.kind)}
                        title={`${shape.name} — ${shape.tooltip}`}
                        className="group flex flex-col items-center justify-center p-1 rounded border border-border bg-surface hover:border-accent hover:bg-accent-soft/20 text-foreground transition-all cursor-grab active:cursor-grabbing"
                      >
                        <div className="size-6 text-foreground/85 group-hover:text-accent transition-colors flex items-center justify-center">
                          {shape.icon}
                        </div>
                        <span className="text-[9px] truncate max-w-full text-muted group-hover:text-foreground mt-0.5 font-medium">
                          {shape.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Acordeón: Árbol de Elementos del diagrama */}
        <div className="border-b border-separator/80">
          <button
            type="button"
            onClick={() => setIsOutlineOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-secondary/50 cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-1.5">
              <Icon
                name={isOutlineOpen ? "chevron-down" : "chevron-right"}
                className="text-[11px] text-muted transition-transform"
              />
              <span>Árbol del diagrama</span>
            </div>
            <span className="text-[10px] text-muted">{sheet.elements.length}</span>
          </button>

          {isOutlineOpen ? (
            <div className="px-2 pb-3 pt-1">
              {roots.length === 0 ? (
                <p className="rounded border border-dashed border-border px-2 py-3 text-center text-[11px] text-muted">
                  No hay elementos en este lienzo
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {roots.map((element) => (
                    <li key={element.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => select({ type: "element", id: element.id })}
                        onDoubleClick={() => drillInto(element.id)}
                        className={[
                          "flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors",
                          selectedId === element.id
                            ? "bg-accent-soft text-accent font-semibold"
                            : "text-foreground hover:bg-surface-secondary",
                        ].join(" ")}
                      >
                        <Icon
                          name={iconOf(sheet.diagram, element)}
                          className="text-xs text-muted"
                        />
                        <span className="truncate flex-1">{element.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* 4. Botón inferior: "+ Más formas" idéntico a la captura de Draw.io */}
      <div className="p-3 border-t border-separator bg-surface">
        <button
          type="button"
          onClick={() => {
            // Expande todas las secciones para explorar
            setIsGeneralOpen(true);
            setIsFourPlusOneOpen(true);
            setActive41Tab("all");
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-100 dark:bg-sky-950/70 hover:bg-sky-200 dark:hover:bg-sky-900/80 text-sky-800 dark:text-sky-300 font-semibold text-xs transition-colors shadow-2xs border border-sky-200 dark:border-sky-800/60"
        >
          <Icon name="plus" className="text-xs font-bold" />
          <span>+ Más formas</span>
        </button>
      </div>
    </aside>
  );
}
