import {
  Button,
  Input,
  Label,
  Modal,
  Separator,
  Switch,
  TextArea,
  TextField,
} from "@heroui/react";
import { useState } from "react";
import { ELEMENT_ICONS, KINDS_ALL, iconOf, kindMeta } from "@/lib/catalog";
import type {
  C4Element,
  C4Relationship,
  HandleSide,
  RelationshipStyle,
  Workspace,
} from "@/lib/types";
import { useWorkspace } from "@/lib/workspace-store";
import { indexElements } from "@/lib/view";
import { useT } from "@/i18n";
import { useKindLabel, useLevelLabel, useStyleLabel } from "@/i18n/labels";
import { Icon } from "./icons";
import {
  ColorField,
  Details,
  FieldLabel,
  NumberStepper,
  Picker,
  SidePicker,
  ThicknessField,
  useDraftField,
} from "./ui";

function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
}) {
  const t = useT();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-muted">{message}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onPress={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                {t("common.delete")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function DeleteButton({
  onDelete,
  title,
  message,
}: {
  onDelete: () => void;
  title: string;
  message: string;
}) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        variant="danger-soft"
        className="w-full"
        onPress={() => setIsOpen(true)}
      >
        {t("common.delete")}
      </Button>
      <ConfirmDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        message={message}
        onConfirm={onDelete}
      />
    </>
  );
}

/** Todos los elementos que cuelgan de `id`. */
function descendantsOf(workspace: Workspace, id: string): Set<string> {
  const descendants = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const candidate of workspace.elements) {
      if (
        candidate.parentId &&
        (descendants.has(candidate.parentId) || candidate.parentId === id) &&
        !descendants.has(candidate.id)
      ) {
        descendants.add(candidate.id);
        grew = true;
      }
    }
  }
  return descendants;
}

function IconPicker({
  value,
  defaultIcon,
  kindLabel,
  onChange,
}: {
  value: C4Element["icon"];
  defaultIcon: C4Element["icon"];
  kindLabel: string;
  onChange: (icon: C4Element["icon"]) => void;
}) {
  const t = useT();
  const isCustom = value !== undefined && value !== defaultIcon;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>{t("inspector.icon")}</FieldLabel>
        {isCustom ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] text-accent hover:underline"
          >
            {t("inspector.iconReset")}
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-9 gap-1">
        {ELEMENT_ICONS.map((name) => {
          const active = (value ?? defaultIcon) === name;
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={t("inspector.iconName", { name })}
              aria-pressed={active}
              onClick={() => onChange(name)}
              className={[
                "grid h-7 place-items-center rounded-md border text-[13px] transition-colors",
                active
                  ? "border-accent bg-accent-soft text-accent-soft-foreground"
                  : "border-border text-muted hover:bg-surface-secondary hover:text-foreground",
              ].join(" ")}
            >
              <Icon name={name} />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted">
        {isCustom
          ? t("inspector.iconCustom")
          : t("inspector.iconDefaultOf", { kind: kindLabel })}
      </p>
    </div>
  );
}

function NewRelationForm({ element }: { element: C4Element }) {
  const { workspace, addRelationship, readOnly } = useWorkspace();
  const t = useT();
  const descendants = descendantsOf(workspace, element.id);
  const options = workspace.elements
    .filter((item) => item.id !== element.id && !descendants.has(item.id))
    .map((item) => ({ value: item.id, label: item.name }));

  const [target, setTarget] = useState("");
  const [side, setSide] = useState<HandleSide | null>(null);
  const [targetSide, setTargetSide] = useState<HandleSide | null>(null);
  const [label, setLabel] = useState("");

  const create = () => {
    if (!target) return;
    addRelationship({
      source: element.id,
      target,
      sourceHandle: side,
      targetHandle: targetSide,
      label: label.trim() || t("relation.defaultLabel"),
      technology: "",
      description: "",
      style: "sync",
    });
    setTarget("");
    setSide(null);
    setTargetSide(null);
    setLabel("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-secondary/60 p-3">
      <p className="text-xs font-semibold text-foreground">{t("inspector.newRelation")}</p>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>{t("inspector.destination")}</FieldLabel>
        <Picker
          label={t("inspector.destination")}
          disabled={readOnly}
          value={target}
          onChange={setTarget}
          options={
            options.length > 0
              ? [{ value: "", label: t("inspector.chooseElement") }, ...options]
              : [{ value: "", label: t("inspector.noElementsAvailable") }]
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>{t("inspector.relationLabel")}</FieldLabel>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={t("inspector.relationLabelPlaceholder")}
          className="h-9 w-full rounded-[var(--field-radius)] border border-border bg-field px-2.5 text-sm outline-none focus:border-field-border-focus"
        />
      </div>
      <SidePicker value={side} onChange={setSide} label={t("inspector.sideExit")} />
      <SidePicker value={targetSide} onChange={setTargetSide} label={t("inspector.sideEntry")} />
      <Button size="sm" variant="primary" onPress={create} isDisabled={!target}>
        {t("inspector.addArrow")}
      </Button>
    </div>
  );
}

function ElementInspector({ element }: { element: C4Element }) {
  const { workspace, updateElement, removeElement, drillInto, readOnly } = useWorkspace();
  const t = useT();
  const meta = kindMeta(element.kind);
  const kindLabel = useKindLabel();
  const levelLabel = useLevelLabel();
  const byId = indexElements(workspace);

  const name = useDraftField(element.name, (value) =>
    updateElement(element.id, { name: value.trim() || "Untitled" }),
  );
  const description = useDraftField(element.description, (value) =>
    updateElement(element.id, { description: value }),
  );
  const technology = useDraftField(element.technology, (value) =>
    updateElement(element.id, { technology: value }),
  );
  const tags = useDraftField(element.tags.join(", "), (value) =>
    updateElement(element.id, {
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }),
  );

  const siblingKinds = KINDS_ALL.filter(
    (kind) => kind !== "note" && kindMeta(kind).depth === meta.depth,
  );

  const descendants = descendantsOf(workspace, element.id);
  const parentOptions = [
    { value: "", label: t("inspector.scopeNone") },
    ...workspace.elements
      .filter(
        (candidate) =>
          kindMeta(candidate.kind).depth === meta.depth - 1 && !descendants.has(candidate.id),
      )
      .map((candidate) => ({ value: candidate.id, label: candidate.name })),
  ];

  const children = workspace.elements.filter((item) => item.parentId === element.id);
  const relationships = workspace.relationships.filter(
    (relationship) => relationship.source === element.id || relationship.target === element.id,
  );
  const parentName = element.parentId ? (byId.get(element.parentId)?.name ?? "—") : null;

  return (
    <div className="flex flex-col gap-4 px-3 pb-6">
      <header className="flex items-start gap-2.5 pt-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg text-white"
          style={{ background: meta.bg }}
        >
          <Icon name={iconOf(element)} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{element.name}</p>
          <p className="truncate text-xs text-muted">
            {kindLabel(element.kind)}
            {parentName ? ` · ${parentName}` : ""}
          </p>
        </div>
      </header>

      {meta.drillable ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onPress={() => drillInto(element.id)}
          isDisabled={children.length === 0}
        >
          {children.length === 0
            ? t("inspector.noContent")
            : t("inspector.openLower", {
                level: levelLabel(kindMeta(children[0].kind).level).toLowerCase(),
              })}
        </Button>
      ) : null}

<TextField value={name.value} onChange={name.onChange} isDisabled={readOnly}>
        <Label>{element.kind === "note" ? t("inspector.noteText") : t("inspector.name")}</Label>
        {element.kind === "note" ? (
          <TextArea
            rows={3}
            onBlur={name.onBlur}
            placeholder={t("inspector.noteTextPlaceholder")}
          />
        ) : (
          <Input onBlur={name.onBlur} />
        )}
      </TextField>

      {element.kind === "note" ? (
        <NoteAppearance element={element} readOnly={readOnly} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label={t("inspector.color")}
            value={element.color}
            fallback={meta.bg}
            readOnly={readOnly}
            onChange={(color) => updateElement(element.id, { color })}
          />
          <ColorField
            label={t("inspector.borderColor")}
            value={element.borderColor}
            fallback={meta.border}
            readOnly={readOnly}
            onChange={(borderColor) => updateElement(element.id, { borderColor })}
          />
        </div>
      )}

      {siblingKinds.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <FieldLabel>{t("inspector.elementType")}</FieldLabel>
          <Picker
            label={t("inspector.elementType")}
            disabled={readOnly}
            value={element.kind}
            onChange={(value) => updateElement(element.id, { kind: value as C4Element["kind"] })}
            options={siblingKinds.map((kind) => ({
              value: kind,
              label: kindLabel(kind),
            }))}
          />
        </div>
      ) : null}

{element.kind === "note" ? null : (
        <>
          <TextField value={technology.value} onChange={technology.onChange} isDisabled={readOnly}>
            <Label>{t("inspector.technology")}</Label>
            <Input
              onBlur={technology.onBlur}
              placeholder={
                meta.depth === 0 ? t("inspector.technologyNA") : "React, PostgreSQL…"
              }
              disabled={meta.depth === 0}
            />
          </TextField>

          <TextField value={description.value} onChange={description.onChange} isDisabled={readOnly}>
            <Label>{t("inspector.description")}</Label>
            <TextArea
              rows={3}
              onBlur={description.onBlur}
              placeholder={t("inspector.descriptionPlaceholder")}
            />
          </TextField>

          <TextField value={tags.value} onChange={tags.onChange} isDisabled={readOnly}>
            <Label>{t("inspector.tags")}</Label>
            <Input onBlur={tags.onBlur} placeholder={t("inspector.tagsPlaceholder")} />
          </TextField>

          {readOnly ? null : (
            <IconPicker
              value={element.icon}
              defaultIcon={meta.icon}
              kindLabel={kindLabel(element.kind)}
              onChange={(icon) => updateElement(element.id, { icon })}
            />
          )}
          {readOnly ? null : <NewRelationForm element={element} />}
        </>
      )}

      {meta.depth > 0 ? (
        <div className="flex flex-col gap-1.5">
          <FieldLabel>{t("inspector.scope")}</FieldLabel>
          <Picker
            label={t("inspector.scope")}
            disabled={readOnly}
            value={element.parentId ?? ""}
            onChange={(value) =>
              updateElement(element.id, { parentId: value === "" ? null : value })
            }
            options={parentOptions}
          />
        </div>
      ) : null}

      <Separator />

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-surface-secondary px-2 py-2">
          <p className="text-lg font-semibold text-foreground">{children.length}</p>
          <p className="text-[11px] text-muted">{t("inspector.internals")}</p>
        </div>
        <div className="rounded-lg bg-surface-secondary px-2 py-2">
          <p className="text-lg font-semibold text-foreground">{relationships.length}</p>
          <p className="text-[11px] text-muted">{t("common.relationships", { n: "" }).trim()}</p>
        </div>
      </div>

      {readOnly ? null : (
<DeleteButton
          title={t("inspector.deleteTitle")}
          message={
            children.length > 0
              ? t("inspector.deleteElementWithChildren", {
                  name: element.name,
                  n: children.length,
                })
              : t("inspector.deleteElement", { name: element.name })
          }
          onDelete={() => removeElement(element.id)}
        />
      )}
    </div>
  );
}

function NoteAppearance({ element, readOnly }: { element: C4Element; readOnly: boolean }) {
  const { updateElement } = useWorkspace();
  const t = useT();
  const meta = kindMeta("note");
  const showBorder = element.border !== false;

  return (
    <div className="flex flex-col gap-2">
      <Details label={t("inspector.color")}>
        <ColorField
          label={t("inspector.color")}
          value={element.color}
          fallback={meta.bg}
          readOnly={readOnly}
          onChange={(color) => updateElement(element.id, { color })}
        />
        <NumberStepper
          label={t("inspector.bgOpacity")}
          value={element.bgOpacity ?? 100}
          min={10}
          max={100}
          step={5}
          suffix="%"
          readOnly={readOnly}
          onChange={(bgOpacity) => updateElement(element.id, { bgOpacity })}
        />
      </Details>

      <Details label={t("inspector.noteSize")}>
        <NumberStepper
          label={t("inspector.noteSize")}
          value={element.size ?? 13}
          min={8}
          max={48}
          step={1}
          suffix="px"
          readOnly={readOnly}
          onChange={(size) => updateElement(element.id, { size })}
        />
      </Details>

      <Details label={t("inspector.showBorder")} open={showBorder}>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>{t("inspector.showBorder")}</FieldLabel>
          <Switch
            size="sm"
            aria-label={t("inspector.showBorder")}
            isSelected={showBorder}
            isDisabled={readOnly}
            onChange={(border: boolean) => updateElement(element.id, { border })}
          />
        </div>
        {showBorder ? (
          <ColorField
            label={t("inspector.borderColor")}
            value={element.borderColor}
            fallback={meta.border}
            readOnly={readOnly}
            onChange={(borderColor) => updateElement(element.id, { borderColor })}
          />
        ) : null}
      </Details>

      <Details label={t("inspector.radius")}>
        <NumberStepper
          label={t("inspector.radius")}
          value={element.radius ?? 10}
          min={0}
          max={60}
          step={2}
          suffix="px"
          readOnly={readOnly}
          onChange={(radius) => updateElement(element.id, { radius })}
        />
      </Details>
    </div>
  );
}

function RelationshipInspector({ relationship }: { relationship: C4Relationship }) {
  const { workspace, updateRelationship, removeRelationship, select, readOnly } = useWorkspace();
  const t = useT();
  const styleLabel = useStyleLabel();
  const byId = indexElements(workspace);
  const source = byId.get(relationship.source);
  const target = byId.get(relationship.target);

  const label = useDraftField(relationship.label, (value) =>
    updateRelationship(relationship.id, { label: value }),
  );
  const technology = useDraftField(relationship.technology, (value) =>
    updateRelationship(relationship.id, { technology: value }),
  );
  const description = useDraftField(relationship.description, (value) =>
    updateRelationship(relationship.id, { description: value }),
  );

  return (
    <div className="flex flex-col gap-4 px-3 pb-6">
      <header className="flex items-start gap-2.5 pt-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-soft-foreground">
          <Icon name="link" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t("inspector.relationship")}
          </p>
          <p className="text-xs text-muted">
            {source?.name ?? "?"} → {target?.name ?? "?"}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1">
        <FieldLabel>{t("inspector.origin")}</FieldLabel>
        <button
          type="button"
          onClick={() => select({ type: "element", id: relationship.source })}
          className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-surface-secondary"
        >
          {source ? <Icon name={iconOf(source)} style={{ color: kindMeta(source.kind).bg }} /> : null}
          <span className="truncate">{source?.name ?? "?"}</span>
        </button>
        <span className="mt-2 block text-xs font-medium text-muted">
          {t("inspector.destination")}
        </span>
        <button
          type="button"
          onClick={() => select({ type: "element", id: relationship.target })}
          className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-surface-secondary"
        >
          {target ? <Icon name={iconOf(target)} style={{ color: kindMeta(target.kind).bg }} /> : null}
          <span className="truncate">{target?.name ?? "?"}</span>
        </button>
      </div>

      <TextField value={label.value} onChange={label.onChange} isDisabled={readOnly}>
        <Label>{t("inspector.relationLabel")}</Label>
        <Input onBlur={label.onBlur} placeholder={t("inspector.relationLabelPlaceholder")} />
      </TextField>

      {readOnly ? null : (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-secondary/60 p-3">
          <p className="text-xs font-semibold text-foreground">{t("inspector.sides")}</p>
          <SidePicker
            value={relationship.sourceHandle}
            onChange={(side) => updateRelationship(relationship.id, { sourceHandle: side })}
            label={t("inspector.sideExitOf", { name: source?.name ?? "?" })}
          />
          <SidePicker
            value={relationship.targetHandle}
            onChange={(side) => updateRelationship(relationship.id, { targetHandle: side })}
            label={t("inspector.sideEntryTo", { name: target?.name ?? "?" })}
          />
        </div>
      )}

      <TextField value={technology.value} onChange={technology.onChange} isDisabled={readOnly}>
        <Label>{t("inspector.relationTechnology")}</Label>
        <Input
          onBlur={technology.onBlur}
          placeholder={t("inspector.relationTechnologyPlaceholder")}
        />
      </TextField>

      <TextField value={description.value} onChange={description.onChange} isDisabled={readOnly}>
        <Label>{t("inspector.relationDescription")}</Label>
        <TextArea rows={3} onBlur={description.onBlur} placeholder={t("inspector.relationDescriptionPlaceholder")} />
      </TextField>

<div className="flex flex-col gap-1.5">
        <FieldLabel>{t("inspector.style")}</FieldLabel>
        <Picker
          label={t("inspector.style")}
          disabled={readOnly}
          value={relationship.style}
          onChange={(value) =>
            updateRelationship(relationship.id, { style: value as RelationshipStyle })
          }
          options={(["sync", "async", "bi"] as RelationshipStyle[]).map((style) => ({
            value: style,
            label: styleLabel(style),
          }))}
        />
      </div>

      <ColorField
        label={t("inspector.color")}
        value={relationship.color}
        fallback={relationship.style === "async" ? "#8a8a8a" : "#4a4a4a"}
        readOnly={readOnly}
        onChange={(color) => updateRelationship(relationship.id, { color })}
      />

      <ThicknessField
        value={relationship.thickness}
        readOnly={readOnly}
        onChange={(thickness) => updateRelationship(relationship.id, { thickness })}
      />

      <Separator />

      {readOnly ? null : (
<DeleteButton
          title={t("inspector.deleteRelationTitle")}
          message={t("inspector.deleteRelation")}
          onDelete={() => removeRelationship(relationship.id)}
        />
      )}
    </div>
  );
}

function WorkspaceInspector() {
  const { workspace, renameWorkspace, level, readOnly } = useWorkspace();
  const t = useT();
  const levelLabel = useLevelLabel();
  const kindLabel = useKindLabel();

  const name = useDraftField(
    workspace.name,
    (value) => renameWorkspace(value.trim() || "Workspace", workspace.description),
  );
  const description = useDraftField(workspace.description, (value) =>
    renameWorkspace(workspace.name, value),
  );

  const counts = workspace.elements.reduce<Record<string, number>>((accumulator, element) => {
    const label = kindLabel(element.kind);
    accumulator[label] = (accumulator[label] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="flex flex-col gap-4 px-3 pb-6">
      <header className="pt-3">
        <p className="text-sm font-semibold text-foreground">{t("inspector.workspace")}</p>
        <p className="text-xs text-muted">{t("inspector.workspaceHint")}</p>
      </header>

      <TextField value={name.value} onChange={name.onChange} isDisabled={readOnly}>
        <Label>{t("inspector.name")}</Label>
        <Input onBlur={name.onBlur} />
      </TextField>

      <TextField value={description.value} onChange={description.onChange} isDisabled={readOnly}>
        <Label>{t("inspector.description")}</Label>
        <TextArea
          rows={3}
          onBlur={description.onBlur}
          placeholder={t("inspector.workspaceDescriptionPlaceholder")}
        />
      </TextField>

      <Separator />

      <div>
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {t("inspector.summary")}
        </p>
        <dl className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted">{t("inspector.activeLevel")}</dt>
            <dd className="font-medium text-foreground">{levelLabel(level)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("common.elements", { n: "" }).trim()}</dt>
            <dd className="font-medium text-foreground">{workspace.elements.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("common.relationships", { n: "" }).trim()}</dt>
            <dd className="font-medium text-foreground">{workspace.relationships.length}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {t("inspector.byType")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(counts).map(([label, count]) => (
            <li
              key={label}
              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-foreground"
            >
              {label} · {count}
            </li>
          ))}
          {Object.keys(counts).length === 0 ? (
            <li className="text-xs text-muted">{t("inspector.noElementsYet")}</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

export function Inspector() {
  const { workspace, selection } = useWorkspace();
  const element =
    selection?.type === "element"
      ? workspace.elements.find((item) => item.id === selection.id)
      : undefined;
  const relationship =
    selection?.type === "relationship"
      ? workspace.relationships.find((item) => item.id === selection.id)
      : undefined;

  return (
    <aside className="panel panel--right">
      <div className="panel__scroll scroll-thin">
        {element ? (
          <ElementInspector element={element} />
        ) : relationship ? (
          <RelationshipInspector relationship={relationship} />
        ) : (
          <WorkspaceInspector />
        )}
      </div>
    </aside>
  );
}
