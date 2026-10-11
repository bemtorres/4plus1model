import { Button, Separator } from "@heroui/react";
import { iconOf, kindMeta, levelMeta } from "@/lib/catalog";
import type { C4Element, ElementKind } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace-store";
import { useT } from "@/i18n";
import { useKindLabel, useLevelDescription, useLevelLabel } from "@/i18n/labels";
import { DRAG_KIND } from "./Canvas";
import { Icon } from "./icons";
import { PanelSection } from "./ui";

function PaletteItem({
  kind,
  onAdd,
  disabled,
}: {
  kind: ElementKind;
  onAdd: () => void;
  disabled?: boolean;
}) {
  const meta = kindMeta(kind);
  const kindLabel = useKindLabel();
  return (
    <li>
      <button
        type="button"
        draggable={!disabled}
        disabled={disabled}
        onDragStart={(event) => {
          event.dataTransfer.setData(DRAG_KIND, kind);
          event.dataTransfer.effectAllowed = "copy";
        }}
        onClick={onAdd}
        className={[
          "drag-item group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors",
          disabled
            ? "cursor-not-allowed opacity-45"
            : "hover:border-border hover:bg-surface-secondary",
        ].join(" ")}
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-md text-white"
          style={{ background: meta.bg }}
        >
          <Icon name={meta.icon} className="text-sm" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {kindLabel(kind)}
          </span>
          <span className="block truncate text-[11px] text-muted">{meta.c4Name}</span>
        </span>
        <Icon
          name="plus"
          className={`text-sm text-muted transition-opacity ${disabled ? "" : "opacity-0 group-hover:opacity-100"}`}
        />
      </button>
    </li>
  );
}

function OutlineRow({
  element,
  depth,
  childrenByParent,
  selectedId,
  onSelect,
  onOpen,
}: {
  element: C4Element;
  depth: number;
  childrenByParent: Map<string | null, C4Element[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const meta = kindMeta(element.kind);
  const children = childrenByParent.get(element.id) ?? [];
  const selected = selectedId === element.id;
  const canOpen = meta.drillable && children.length > 0;

  return (
    <>
      <li>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(element.id)}
          onDoubleClick={() => canOpen && onOpen(element.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSelect(element.id);
          }}
          className={[
            "group flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-1.5 text-sm transition-colors",
            selected
              ? "bg-accent-soft text-accent-soft-foreground"
              : "text-foreground hover:bg-surface-secondary",
          ].join(" ")}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
        >
          <Icon
            name={iconOf(element)}
            className="shrink-0 text-sm"
            style={{ color: meta.bg }}
          />
          <span className="min-w-0 flex-1 truncate">{element.name}</span>
          {canOpen ? (
            <Icon
              name="chevron-right"
              className="text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          ) : null}
        </div>
      </li>
      {children.map((child) => (
        <OutlineRow
          key={child.id}
          element={child}
          depth={depth + 1}
          childrenByParent={childrenByParent}
          selectedId={selectedId}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </>
  );
}

export function LeftPanel({ onOpenExamples }: { onOpenExamples: () => void }) {
  const { workspace, level, scopeId, selection, addElement, select, drillInto, readOnly } =
    useWorkspace();
  const t = useT();
  const meta = levelMeta(level);
  const levelLabel = useLevelLabel();
  const levelDescription = useLevelDescription();

  const childrenByParent = new Map<string | null, C4Element[]>();
  for (const element of workspace.elements) {
    // Las notas no forman parte del árbol: sólo viven en el lienzo.
    if (element.kind === "note") continue;
    const key = element.parentId;
    const list = childrenByParent.get(key);
    if (list) list.push(element);
    else childrenByParent.set(key, [element]);
  }
  const roots = childrenByParent.get(null) ?? [];
  const selectedId = selection?.type === "element" ? selection.id : null;
  const scopeName = workspace.elements.find((element) => element.id === scopeId)?.name;

  const shortcuts = [
    { key: "sidebar.shortcutDrag", value: "sidebar.shortcutDragValue" },
    { key: "sidebar.shortcutConnect", value: "sidebar.shortcutConnectValue" },
    { key: "sidebar.shortcutOpen", value: "sidebar.shortcutOpenValue" },
    { key: "sidebar.shortcutDelete", value: "sidebar.shortcutDeleteValue" },
  ] as const;

  return (
    <aside className="panel panel--left">
      <div className="panel__scroll scroll-thin">
        <PanelSection
          title={t("sidebar.palette", { level: levelLabel(level) })}
          action={
            <span className="text-[11px] text-muted" title={levelDescription(level)}>
              {meta.short}
            </span>
          }
        >
          <ul className="flex flex-col gap-0.5 px-2 pb-3">
            {meta.kinds.map((kind) => (
              <PaletteItem key={kind} kind={kind} onAdd={() => addElement(kind)} disabled={readOnly} />
            ))}
          </ul>
          <p className="px-3 pb-3 text-[11px] leading-relaxed text-muted">
            {readOnly
              ? t("share.readOnly")
              : level === "context" || !scopeName
                ? `${t("sidebar.dragHint")}.`
                : `${t("sidebar.dragHintScope", { scope: scopeName })}.`}
          </p>
        </PanelSection>

        <Separator />

        <PanelSection
          title={t("sidebar.elements")}
          action={<span className="text-[11px] text-muted">{workspace.elements.length}</span>}
        >
          {roots.length === 0 ? (
            <div className="px-3 pb-4">
              <p className="rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted">
                {t("sidebar.empty")}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onPress={onOpenExamples}
              >
                <Icon name="grid" />
                {t("examples.nav")}
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5 px-2 pb-4">
              {roots.map((element) => (
                <OutlineRow
                  key={element.id}
                  element={element}
                  depth={0}
                  childrenByParent={childrenByParent}
                  selectedId={selectedId}
                  onSelect={(id) => select({ type: "element", id })}
                  onOpen={drillInto}
                />
              ))}
            </ul>
          )}
        </PanelSection>

        <Separator />

        <div className="px-3 py-3">
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
            {t("sidebar.shortcuts")}
          </p>
          <dl className="space-y-1 text-[11px] text-muted">
            {shortcuts.map((shortcut) => (
              <div className="flex justify-between gap-2" key={shortcut.key}>
                <dt>{t(shortcut.key)}</dt>
                <dd className="font-medium text-foreground">{t(shortcut.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </aside>
  );
}
