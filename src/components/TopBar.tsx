import { Button, Dropdown, Separator, useTheme } from "@heroui/react";
import { useState } from "react";
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
import { ShareDialog } from "./ShareDialog";
import { notify } from "./Toaster";
import { IconButton, EditableTitle, Picker, SegmentedControl } from "./ui";

export function TopBar({
  openExample,
  onOpenExamples,
}: {
  openExample: (code: string) => void;
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
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const scopes = navigableElements(workspace, level);

  return (
    <header className="topbar scroll-thin flex items-center gap-3 overflow-x-auto px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon name="diagram" className="text-lg" />
        </span>
        <div className="min-w-0">
          <EditableTitle
            value={workspace.name}
            onCommit={(name) => renameWorkspace(name, workspace.description)}
            placeholder={t("inspector.workspace")}
            label={t("inspector.workspace")}
            readOnly={readOnly}
          />
          <p className="truncate text-[11px] leading-tight text-muted">
            {t("topbar.summary", {
              elements: workspace.elements.length,
              relationships: workspace.relationships.length,
            })}
          </p>
        </div>
      </div>

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
        <IconButton
          icon="undo"
          label={t("topbar.undo")}
          onPress={undo}
          isDisabled={readOnly || !canUndo}
        />
        <IconButton
          icon="redo"
          label={t("topbar.redo")}
          onPress={redo}
          isDisabled={readOnly || !canRedo}
        />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <IconButton
          icon="wand"
          label={t("topbar.autoLayout", { level: levelLabel(level).toLowerCase() })}
          onPress={() => {
            autoLayout();
            notify(t("toast.layoutDone"), "success");
          }}
          isDisabled={readOnly}
        />
        <IconButton
          icon="fit"
          label={t("topbar.fit")}
          onPress={() => window.dispatchEvent(new CustomEvent(FIT_VIEW_EVENT))}
        />
        <IconButton icon="link" label={t("share.title")} onPress={() => setShareOpen(true)} />
        <IconButton
          icon="upload"
          label={t("topbar.import")}
          onPress={() => setImportOpen(true)}
          isDisabled={readOnly}
        />
        <Button size="sm" variant="secondary" onPress={() => setExportOpen(true)}>
          <Icon name="download" />
          {t("topbar.export")}
        </Button>
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
                } else if (String(key) === "clear" && !readOnly) {
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
      </div>

      <ExportDialog isOpen={exportOpen} onOpenChange={setExportOpen} />
      <ImportDialog isOpen={importOpen} onOpenChange={setImportOpen} />
      <ShareDialog isOpen={shareOpen} onOpenChange={setShareOpen} />
    </header>
  );
}
