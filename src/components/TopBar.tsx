import { Button, Dropdown, Separator, useTheme } from "@heroui/react";
import { useEffect, useState } from "react";
import { LEVELS } from "@/lib/catalog";
import type { Level } from "@/lib/types";
import { navigableElements } from "@/lib/view";
import { useWorkspace } from "@/lib/workspace-store";
import { LOCALES, useLocale, useT } from "@/i18n";
import { useLevelDescription, useLevelLabel } from "@/i18n/labels";
import { ExportDialog } from "./ExportDialog";
import { FIT_VIEW_EVENT } from "./Canvas";
import { Icon } from "./icons";
import { ImportDialog } from "./ImportDialog";
import { buildEditUrl } from "@/lib/share";
import { ShareDialog } from "./ShareDialog";
import { notify } from "./Toaster";
import { IconButton, EditableTitle, Picker, SegmentedControl } from "./ui";
import { useFullscreen } from "./useFullscreen";

export function TopBar({
  onOpenExamples,
}: {
  openExample?: (code: string) => void;
  onOpenExamples: () => void;
}) {
  const {
    workspace,
    level,
    scopeId,
    setLevel,
    setScope,
    goUp,
    canUndo,
    canRedo,
    undo,
    redo,
    autoLayout,
    clearAll,
    renameWorkspace,
    readOnly,
  } = useWorkspace();
  const t = useT();
  const { setLocale, locale } = useLocale();
  const levelLabel = useLevelLabel();
  const levelDescription = useLevelDescription();
  const { resolvedTheme, setTheme } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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

  const scopes = navigableElements(workspace, level);

  return (
    <header className="topbar scroll-thin flex items-center gap-3 overflow-x-auto px-3 py-2">
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
              value={workspace.name}
              onCommit={(name) => renameWorkspace(name, workspace.description)}
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
              elements: workspace.elements.length,
              relationships: workspace.relationships.length,
            })}
          </p>
        </div>
      </div>

      {!readOnly ? (
        <>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            onPress={onOpenExamples}
          >
            <Icon name="grid" />
            {t("examples.nav")}
          </Button>
          <Separator orientation="vertical" className="h-8" />
        </>
      ) : null}

      <SegmentedControl<Level>
        label={t("topbar.level")}
        value={level}
        onChange={setLevel}
        options={LEVELS.map((item) => ({
          id: item.id,
          label: levelLabel(item.id),
          hint: levelDescription(item.id),
        }))}
      />

      {level === "context" ? null : (
        <>
          <Button size="sm" variant="ghost" onPress={goUp}>
            <Icon name="chevron-up" />
            {t("topbar.up")}
          </Button>
          <div className="w-52">
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
        </>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
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

        <IconButton
          icon="info"
          label={t("about.nav")}
          onPress={() => {
            window.location.href = "/about";
          }}
        />

        {!readOnly ? (
          <Dropdown>
            <Dropdown.Trigger>
              <Button isIconOnly size="sm" variant="ghost" aria-label={t("topbar.more")}>
                <Icon name="chevron-down" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu<{ id: string }>
                onAction={(key) => {
                  if (String(key) === "examples") {
                    onOpenExamples();
                  } else if (String(key) === "clear") {
                    clearAll();
                    notify(t("toast.cleared"), "info");
                  }
                }}
              >
                <Dropdown.Item id="examples">{t("examples.nav")}</Dropdown.Item>
                <Dropdown.Item id="clear">{t("topbar.menuClear")}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        ) : null}
      </div>

      <ExportDialog isOpen={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog isOpen={importOpen} onOpenChange={setImportOpen} />
      <ShareDialog isOpen={shareOpen} onOpenChange={setShareOpen} />
    </header>
  );
}
