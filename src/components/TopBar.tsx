import { Button, Dropdown, Separator, useTheme } from "@heroui/react";
import { useEffect, useState } from "react";
import { diagramDef, levelMeta, levelsOf } from "@/lib/diagrams";
import type { Level } from "@/lib/types";
import { useProject } from "@/lib/project-store";
import { LOCALES, useLocale, useT } from "@/i18n";
import { useLevelDescription, useLevelLabel } from "@/i18n/labels";
import { ExportDialog } from "./ExportDialog";
import { FIT_VIEW_EVENT } from "./Canvas";
import { Icon } from "./icons";
import { ImportDialog } from "./ImportDialog";
import { ExamplesDialog } from "./ExamplesDialog";
import { buildProjectFor, findExampleByCode } from "@/lib/examples";
import { buildEditUrl } from "@/lib/share";
import { ShareDialog } from "./ShareDialog";
import { notify } from "./Toaster";
import { IconButton, EditableTitle, Picker, SegmentedControl } from "./ui";
import { useFullscreen } from "./useFullscreen";

export function TopBar({
  onOpenMobileLeft,
  onOpenMobileRight,
}: {
  onOpenMobileLeft?: () => void;
  onOpenMobileRight?: () => void;
}) {
  const {
    project,
    sheet,
    level,
    scopeId,
    navigable,
    setLevel,
    setScope,
    goUp,
    canUndo,
    canRedo,
    undo,
    redo,
    autoLayout,
    clearAll,
    renameProject,
    importProject,
    readOnly,
  } = useProject();
  const t = useT();
  const { setLocale, locale } = useLocale();
  const levelLabel = useLevelLabel();
  const levelDescription = useLevelDescription();
  const { resolvedTheme, setTheme } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openExample = (code: string) => {
    const target = findExampleByCode(code);
    if (!target) return;
    const project = buildProjectFor(target);
    importProject(project, { force: true });
    notify(t("import.done", { name: project.name }), "success");
  };

  useEffect(() => {
    const syncThemeFromUrl = () => {
      const param = new URLSearchParams(window.location.search).get("theme")?.trim().toLowerCase();
      if (param === "light" || param === "dark" || param === "system") {
        setTheme(param);
      }
    };
    syncThemeFromUrl();
    window.addEventListener("popstate", syncThemeFromUrl);
    return () => window.removeEventListener("popstate", syncThemeFromUrl);
  }, [setTheme]);

  const def = diagramDef(sheet.diagram);
  const levels = levelsOf(sheet.diagram);
  const showLevels = levels.length > 1;
  const currentLevel = levelMeta(sheet.diagram, level);
  const showScope = currentLevel.scopeDepth >= 0;
  const scopes = navigable;

  return (
    <header className="topbar scroll-thin flex items-center gap-3 overflow-x-auto px-3 py-2">
      {/* Botón de Menú Drawer para móvil */}
      <Button
        isIconOnly
        size="sm"
        variant="outline"
        className="lg:hidden shrink-0"
        onPress={() => setMobileMenuOpen(true)}
        aria-label="Abrir menú de opciones"
      >
        <Icon name="menu" className="text-base" />
      </Button>

      {!readOnly && onOpenMobileLeft ? (
        <Button
          isIconOnly
          size="sm"
          variant="outline"
          className="lg:hidden shrink-0"
          onPress={onOpenMobileLeft}
          aria-label="Abrir catálogo de elementos"
        >
          <Icon name="plus" />
        </Button>
      ) : null}

      <div className="flex min-w-0 items-center gap-2">
        <a
          href="/"
          title="Volver a la página principal"
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground shadow-xs transition-transform hover:scale-105"
        >
          <Icon name="diagram" className="text-lg" />
        </a>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <EditableTitle
              value={project.name}
              onCommit={(name) => renameProject(name, project.description)}
              placeholder={t("inspector.workspace")}
              label={t("inspector.workspace")}
              readOnly={readOnly}
            />
            {readOnly ? (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Presentación
              </span>
            ) : null}
          </div>
          <p className="truncate text-[11px] leading-tight text-muted">
            {t("topbar.summary", {
              elements: sheet.elements.length,
              relationships: sheet.relationships.length,
            })}
          </p>
        </div>
      </div>

      {/* El lienzo ahora es libre al estilo Draw.io; la navegación por vistas se realiza en las pestañas inferiores */}

      {!showScope ? null : (
        <div className="hidden sm:flex items-center gap-2">
          <Button size="sm" variant="ghost" onPress={goUp}>
            <Icon name="chevron-up" />
            {t("topbar.up")}
          </Button>
          <div className="w-48 lg:w-52">
            <Picker
              label={t("topbar.scope")}
              value={scopeId ?? ""}
              onChange={(value) => setScope(value || null)}
              options={
                scopes.length > 0
                  ? scopes.map((element) => ({ value: element.id, label: element.name }))
                  : [{ value: "", label: t("topbar.scopeEmpty") }]
              }
            />
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Controles de escritorio */}
      <div className="hidden lg:flex items-center gap-1">
        {!readOnly ? (
          <>
            <IconButton
              icon="undo"
              label={t("topbar.undo")}
              onPress={undo}
              isDisabled={!canUndo}
            />
            <IconButton
              icon="redo"
              label={t("topbar.redo")}
              onPress={redo}
              isDisabled={!canRedo}
            />
            <Separator orientation="vertical" className="mx-1 h-6" />
            <IconButton
              icon="wand"
              label={t("topbar.autoLayout", { level: levelLabel(level).toLowerCase() })}
              onPress={() => {
                autoLayout();
                notify(t("toast.layoutDone"), "success");
              }}
            />
          </>
        ) : null}

        <IconButton
          icon={isFullscreen ? "minimize" : "fullscreen"}
          label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          onPress={toggleFullscreen}
        />

        <IconButton
          icon="fit"
          label={t("topbar.fit")}
          onPress={() => window.dispatchEvent(new CustomEvent(FIT_VIEW_EVENT))}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {!readOnly ? (
          <IconButton icon="link" label={t("share.title")} onPress={() => setShareOpen(true)} />
        ) : null}

        {!readOnly ? (
          <IconButton
            icon="upload"
            label={t("topbar.import")}
            onPress={() => setImportOpen(true)}
          />
        ) : null}

        {readOnly ? (
          <Button
            size="sm"
            variant="primary"
            className="shrink-0 font-medium shadow-xs"
            onPress={() => window.open(buildEditUrl(), "_blank", "noopener,noreferrer")}
          >
            <Icon name="external" />
            {t("share.edit")}
          </Button>
        ) : null}

        {!readOnly ? (
          <Button size="sm" variant="secondary" onPress={() => setExportOpen(true)}>
            <Icon name="download" />
            {t("topbar.export")}
          </Button>
        ) : null}
        <IconButton
          icon={resolvedTheme === "dark" ? "sun" : "moon"}
          label={resolvedTheme === "dark" ? t("topbar.themeLight") : t("topbar.themeDark")}
          onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        />

        <div className="w-28">
          <Picker
            label={t("topbar.language")}
            value={locale}
            onChange={(value) => setLocale(value as (typeof LOCALES)[number]["code"])}
            options={LOCALES.map((item) => ({ value: item.code, label: item.label }))}
          />
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Dropdown>
          <Dropdown.Trigger>
            <Button isIconOnly size="sm" variant="ghost" aria-label={t("topbar.more")}>
              <Icon name="chevron-down" />
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu<{ id: string }>
              onAction={(key) => {
                if (String(key) === "clear") {
                  clearAll();
                  notify(t("toast.cleared"), "info");
                } else if (String(key) === "about") {
                  window.location.href = "/about";
                }
              }}
            >
              <Dropdown.Item id="about">{t("about.nav")}</Dropdown.Item>
              {readOnly ? null : <Dropdown.Item id="clear">{t("topbar.menuClear")}</Dropdown.Item>}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      {/* Controles rápidos en móvil */}
      <div className="flex lg:hidden items-center gap-1">
        {!readOnly ? (
          <>
            <IconButton
              icon="undo"
              label={t("topbar.undo")}
              onPress={undo}
              isDisabled={!canUndo}
            />
            <IconButton
              icon="redo"
              label={t("topbar.redo")}
              onPress={redo}
              isDisabled={!canRedo}
            />
          </>
        ) : null}

        <IconButton
          icon="fit"
          label={t("topbar.fit")}
          onPress={() => window.dispatchEvent(new CustomEvent(FIT_VIEW_EVENT))}
        />

        {!readOnly && onOpenMobileRight ? (
          <Button
            isIconOnly
            size="sm"
            variant="outline"
            className="shrink-0"
            onPress={onOpenMobileRight}
            aria-label="Abrir propiedades / inspector"
          >
            <Icon name="settings" />
          </Button>
        ) : null}
      </div>

      {/* Menú Drawer lateral para móvil */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-[300px] max-w-[85vw] bg-surface border-r border-separator h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-separator px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icon name="diagram" className="text-sm" />
                </span>
                <span className="text-sm font-semibold text-foreground">Menú de Opciones</span>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <Icon name="x" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-thin">
              {/* Nivel del diagrama activo */}
              {showLevels ? (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t("topbar.level")}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {levels.map((item) => (
                      <Button
                        key={item.id}
                        size="sm"
                        variant={level === item.id ? "primary" : "outline"}
                        className="text-xs justify-start"
                        onPress={() => {
                          setLevel(item.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {levelLabel(item.id)}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {showScope ? (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t("topbar.scope")}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Picker
                      label={t("topbar.scope")}
                      value={scopeId ?? ""}
                      onChange={(value) => setScope(value || null)}
                      options={
                        scopes.length > 0
                          ? scopes.map((element) => ({ value: element.id, label: element.name }))
                          : [{ value: "", label: t("topbar.scopeEmpty") }]
                      }
                    />
                    <Button size="sm" variant="ghost" className="justify-start" onPress={goUp}>
                      <Icon name="chevron-up" />
                      {t("topbar.up")}
                    </Button>
                  </div>
                </div>
              ) : null}

              <Separator />

              {/* Acciones del diagrama */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Acciones
                </p>
                <div className="flex flex-col gap-1">
                  {!readOnly ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-xs"
                        onPress={() => {
                          autoLayout();
                          notify(t("toast.layoutDone"), "success");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="wand" />
                        {t("topbar.autoLayout", { level: levelLabel(level).toLowerCase() })}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-xs"
                        onPress={() => {
                          setShareOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="link" />
                        {t("share.title")}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-xs"
                        onPress={() => {
                          setExportOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="download" />
                        {t("topbar.export")}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-xs"
                        onPress={() => {
                          setImportOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="upload" />
                        {t("topbar.import")}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-xs"
                        onPress={() => {
                          setExamplesOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon name="book" />
                        {t("examples.nav")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      className="justify-start text-xs"
                      onPress={() => window.open(buildEditUrl(), "_blank", "noopener,noreferrer")}
                    >
                      <Icon name="external" />
                      {t("share.edit")}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="justify-start text-xs"
                    onPress={() => {
                      toggleFullscreen();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon name={isFullscreen ? "minimize" : "fullscreen"} />
                    {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Ajustes: Idioma y Tema */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Configuración
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Tema</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  >
                    <Icon name={resolvedTheme === "dark" ? "sun" : "moon"} />
                    {resolvedTheme === "dark" ? t("topbar.themeLight") : t("topbar.themeDark")}
                  </Button>
                </div>

                <Picker
                  label={t("topbar.language")}
                  value={locale}
                  onChange={(value) => setLocale(value as (typeof LOCALES)[number]["code"])}
                  options={LOCALES.map((item) => ({ value: item.code, label: item.label }))}
                />

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start text-xs"
                  onPress={() => {
                    window.location.href = "/about";
                  }}
                >
                  <Icon name="info" />
                  {t("about.nav")}
                </Button>

                {!readOnly ? (
                  <Button
                    size="sm"
                    variant="danger-soft"
                    className="w-full justify-start text-xs mt-2"
                    onPress={() => {
                      clearAll();
                      notify(t("toast.cleared"), "info");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon name="trash" />
                    {t("topbar.menuClear")}
                  </Button>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <ExportDialog isOpen={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog isOpen={importOpen} onOpenChange={setImportOpen} />
      <ShareDialog isOpen={shareOpen} onOpenChange={setShareOpen} />
      <ExamplesDialog
        isOpen={examplesOpen}
        onOpenChange={setExamplesOpen}
        openExample={openExample}
      />
    </header>
  );
}
