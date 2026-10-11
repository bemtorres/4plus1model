import {
  Button,
  Input,
  Label,
  Modal,
  Separator,
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
  SimpleNumberInput,
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

const STYLE_PRESETS = [
  // Fila 1 (Pasteles claros con borde definido)
  { id: "white-dark", label: "Blanco / Oscuro", bg: "#ffffff", border: "#24292f", text: "#1f2937" },
  { id: "white-gray", label: "Blanco / Gris", bg: "#ffffff", border: "#9ca3af", text: "#374151" },
  { id: "soft-blue", label: "Azul suave", bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" },
  { id: "soft-green", label: "Verde suave", bg: "#dcfce7", border: "#22c55e", text: "#14532d" },
  // Fila 2 (Pasteles cálidos)
  { id: "soft-orange", label: "Naranja suave", bg: "#ffedd5", border: "#f97316", text: "#7c2d12" },
  { id: "soft-yellow", label: "Amarillo suave", bg: "#fef9c3", border: "#eab308", text: "#713f12" },
  { id: "soft-red", label: "Rojo suave", bg: "#fee2e2", border: "#ef4444", text: "#7f1d1d" },
  { id: "soft-purple", label: "Púrpura suave", bg: "#f3e8ff", border: "#a855f7", text: "#581c87" },
  // Fila 3 (C4 Clásicos)
  { id: "c4-blue", label: "C4 Azul", bg: "#1168bd", border: "#0b4884", text: "#ffffff" },
  { id: "c4-navy", label: "C4 Marino", bg: "#08427b", border: "#052e56", text: "#ffffff" },
  { id: "c4-steel", label: "C4 Acero", bg: "#438dd5", border: "#2e6295", text: "#ffffff" },
  { id: "c4-gray", label: "C4 Gris", bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
];

function ElementContentTab({
  element,
  readOnly,
  name,
  description,
  technology,
  tags,
  siblingKinds,
  parentOptions,
  childrenCount,
  relationshipsCount,
}: {
  element: C4Element;
  readOnly: boolean;
  name: ReturnType<typeof useDraftField<string>>;
  description: ReturnType<typeof useDraftField<string>>;
  technology: ReturnType<typeof useDraftField<string>>;
  tags: ReturnType<typeof useDraftField<string>>;
  siblingKinds: C4Element["kind"][];
  parentOptions: { value: string; label: string }[];
  childrenCount: number;
  relationshipsCount: number;
}) {
  const { updateElement, removeElement, drillInto } = useWorkspace();
  const t = useT();
  const meta = kindMeta(element.kind);
  const kindLabel = useKindLabel();
  const levelLabel = useLevelLabel();

  return (
    <div className="flex flex-col gap-4">
      {meta.drillable ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onPress={() => drillInto(element.id)}
          isDisabled={childrenCount === 0}
        >
          {childrenCount === 0
            ? t("inspector.noContent")
            : t("inspector.openLower", {
                level: levelLabel(kindMeta(element.kind).level).toLowerCase(),
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

      {element.kind !== "note" ? (
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
        </>
      ) : null}

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
          <p className="text-lg font-semibold text-foreground">{childrenCount}</p>
          <p className="text-[11px] text-muted">{t("inspector.internals")}</p>
        </div>
        <div className="rounded-lg bg-surface-secondary px-2 py-2">
          <p className="text-lg font-semibold text-foreground">{relationshipsCount}</p>
          <p className="text-[11px] text-muted">{t("common.relationships", { n: "" }).trim()}</p>
        </div>
      </div>

      {readOnly ? null : (
        <DeleteButton
          title={t("inspector.deleteTitle")}
          message={
            childrenCount > 0
              ? t("inspector.deleteElementWithChildren", {
                  name: element.name,
                  n: childrenCount,
                })
              : t("inspector.deleteElement", { name: element.name })
          }
          onDelete={() => removeElement(element.id)}
        />
      )}
    </div>
  );
}

function ElementStyleTab({
  element,
  readOnly,
}: {
  element: C4Element;
  readOnly: boolean;
}) {
  const { updateElement } = useWorkspace();
  const t = useT();
  const meta = kindMeta(element.kind);
  const kindLabel = useKindLabel();

  const showFill = element.fill !== false && element.color !== "transparent";
  const showBorder = element.border !== false;

  return (
    <div className="flex flex-col gap-3">
      {/* Estilos rÃ¡pidos / Swatches de muestra */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>{t("inspector.presets")}</FieldLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              disabled={readOnly}
              onClick={() =>
                updateElement(element.id, {
                  color: preset.bg,
                  borderColor: preset.border,
                  textColor: preset.text,
                  fill: true,
                  border: true,
                  bgOpacity: 100,
                })
              }
              className="group relative flex h-7 items-center justify-center rounded-md border transition-all hover:scale-[1.03] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{
                backgroundColor: preset.bg,
                borderColor: preset.border,
                borderWidth: "2px",
              }}
            >
              <span
                className="h-1 w-3 rounded-full opacity-60 group-hover:opacity-100"
                style={{ backgroundColor: preset.text }}
              />
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Relleno (Color de fondo y opacidad, con opción de check para activar/desactivar) */}
      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showFill}
            disabled={readOnly}
            onChange={(e) => {
              const fill = e.target.checked;
              updateElement(element.id, {
                fill,
                ...(fill && element.color === "transparent" ? { color: null } : {}),
              });
            }}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-xs font-semibold text-foreground">{t("inspector.fill")}</span>
        </label>
        {showFill ? (
          <div className="grid grid-cols-2 gap-2.5 items-start">
            <ColorField
              label={t("inspector.color")}
              value={element.color}
              fallback={meta.bg}
              readOnly={readOnly}
              onChange={(color) => updateElement(element.id, { color })}
            />
            <SimpleNumberInput
              label={t("inspector.bgOpacity")}
              value={element.bgOpacity ?? 100}
              min={0}
              max={100}
              step={5}
              suffix="%"
              readOnly={readOnly}
              onChange={(bgOpacity) => updateElement(element.id, { bgOpacity })}
            />
          </div>
        ) : (
          <p className="text-[11px] text-muted italic">
            Fondo transparente (sin relleno)
          </p>
        )}
      </div>

      <Separator />

      {/* Borde / Línea (Color, check para activar/desactivar y esquinas redondeadas) */}
      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showBorder}
            disabled={readOnly}
            onChange={(e) => updateElement(element.id, { border: e.target.checked })}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-xs font-semibold text-foreground">{t("inspector.showBorder")}</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5 items-start">
          {showBorder ? (
            <ColorField
              label={t("inspector.borderColor")}
              value={element.borderColor}
              fallback={meta.border}
              readOnly={readOnly}
              onChange={(borderColor) => updateElement(element.id, { borderColor })}
            />
          ) : (
            <div className="flex flex-col gap-1.5 pt-5">
              <span className="text-[11px] text-muted italic">Sin borde</span>
            </div>
          )}
          <SimpleNumberInput
            label={t("inspector.radius")}
            value={element.radius ?? (meta.shape === "person" ? 16 : 6)}
            min={0}
            max={60}
            suffix="px"
            readOnly={readOnly}
            onChange={(radius) => updateElement(element.id, { radius })}
          />
        </div>
      </div>

      <Separator />

      {/* Tipografía (Tamaño de letra y color del texto de lado a lado) */}
      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold text-foreground">{t("inspector.typography")}</p>
        <div className="grid grid-cols-2 gap-2.5 items-start">
          <SimpleNumberInput
            label={t("inspector.noteSize")}
            value={element.size ?? 13}
            min={8}
            max={48}
            suffix="px"
            readOnly={readOnly}
            onChange={(size) => updateElement(element.id, { size })}
          />
          <ColorField
            label={t("inspector.textColor")}
            value={element.textColor}
            fallback={meta.fg}
            readOnly={readOnly}
            onChange={(textColor) => updateElement(element.id, { textColor })}
          />
        </div>
      </div>

      {element.kind !== "note" ? <Separator /> : null}

      {/* Icono (si no es nota) */}
      {element.kind !== "note" ? (
        <Details label={t("inspector.icon")} open={false}>
          <IconPicker
            value={element.icon}
            defaultIcon={meta.icon}
            kindLabel={kindLabel(element.kind)}
            onChange={(icon) => updateElement(element.id, { icon })}
          />
        </Details>
      ) : null}

      {/* BotÃ³n para restablecer al estilo por defecto */}
      {!readOnly ? (
        <Button
          size="sm"
          variant="ghost"
          className="mt-1 w-full text-xs text-muted hover:text-foreground"
          onPress={() =>
            updateElement(element.id, {
              color: null,
              borderColor: null,
              textColor: null,
              size: null,
              border: null,
              fill: null,
              radius: null,
              bgOpacity: null,
              icon: undefined,
            })
          }
        >
          <Icon name="refresh" className="mr-1.5 text-xs" />
          {t("inspector.resetStyles")}
        </Button>
      ) : null}
    </div>
  );
}

function ElementRelationsTab({
  element,
  relationships,
}: {
  element: C4Element;
  relationships: C4Relationship[];
}) {
  const { workspace, select, readOnly } = useWorkspace();
  const t = useT();
  const styleLabel = useStyleLabel();
  const byId = indexElements(workspace);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">
            {relationships.length === 1
              ? `1 ${t("common.relationships", { n: "" }).trim()}`
              : `${relationships.length} ${t("common.relationships", { n: "" }).trim()}`}
          </p>
        </div>

        {relationships.length > 0 ? (
          <div className="flex flex-col gap-2">
            {relationships.map((rel) => {
              const isSource = rel.source === element.id;
              const otherId = isSource ? rel.target : rel.source;
              const other = byId.get(otherId);
              return (
                <div
                  key={rel.id}
                  className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-secondary/40 p-2.5 transition-colors hover:border-accent/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Icon
                        name={isSource ? "arrow-right" : "arrow-left"}
                        className="text-xs text-accent"
                      />
                      <span>
                        {isSource ? t("inspector.to") : t("inspector.from")}: {other?.name ?? "?"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => select({ type: "relationship", id: rel.id })}
                      className="rounded px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent-soft hover:underline"
                    >
                      {t("inspector.editRelation")}
                    </button>
                  </div>
                  {rel.label ? (
                    <p className="truncate text-xs text-muted">“{rel.label}”</p>
                  ) : null}
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <span className="rounded border border-border bg-surface px-1.5 py-0.5">
                      {styleLabel(rel.style)}
                    </span>
                    {rel.technology ? (
                      <span className="rounded border border-border bg-surface px-1.5 py-0.5">
                        {rel.technology}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-3 text-center">
            <p className="text-xs text-muted">{t("inspector.noRelations")}</p>
          </div>
        )}
      </div>

      {readOnly ? null : (
        <div className="border-t border-border pt-2">
          <NewRelationForm element={element} />
        </div>
      )}
    </div>
  );
}

type InspectorTab = "content" | "style" | "relations";

function ElementInspector({ element }: { element: C4Element }) {
  const { workspace, updateElement, readOnly } = useWorkspace();
  const [activeTab, setActiveTab] = useState<InspectorTab>("content");
  const t = useT();
  const meta = kindMeta(element.kind);
  const kindLabel = useKindLabel();
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
    <div className="flex flex-col gap-3 px-3 pb-6">
      <header className="flex items-start gap-2.5 pt-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg text-white"
          style={{
            background:
              element.color && element.color !== "transparent" ? element.color : meta.bg,
          }}
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

      {/* Navegación por 3 vistas: 1.- Contenido, 2.- Estilo, 3.- Relación */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-secondary p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={[
            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all select-none",
            activeTab === "content"
              ? "bg-surface text-foreground shadow-sm font-semibold"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          <Icon name="file" className="text-xs" />
          <span>{t("inspector.tabContent")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={[
            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all select-none",
            activeTab === "style"
              ? "bg-surface text-foreground shadow-sm font-semibold"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          <Icon name="wand" className="text-xs" />
          <span>{t("inspector.tabStyle")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("relations")}
          className={[
            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all select-none",
            activeTab === "relations"
              ? "bg-surface text-foreground shadow-sm font-semibold"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          <Icon name="link" className="text-xs" />
          <span>{t("inspector.tabRelations")}</span>
          {relationships.length > 0 ? (
            <span className="ml-0.5 rounded-full bg-accent/15 px-1.5 py-0.2 text-[10px] font-bold text-accent">
              {relationships.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* Pestañas */}
      {activeTab === "content" ? (
        <ElementContentTab
          element={element}
          readOnly={readOnly}
          name={name}
          description={description}
          technology={technology}
          tags={tags}
          siblingKinds={siblingKinds}
          parentOptions={parentOptions}
          childrenCount={children.length}
          relationshipsCount={relationships.length}
        />
      ) : activeTab === "style" ? (
        <ElementStyleTab element={element} readOnly={readOnly} />
      ) : (
        <ElementRelationsTab element={element} relationships={relationships} />
      )}
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

export function Inspector({
  onClose,
  isOpenMobile,
}: {
  onClose?: () => void;
  isOpenMobile?: boolean;
} = {}) {
  const t = useT();
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
    <aside className={["panel panel--right", isOpenMobile ? "panel--mobile-open" : ""].join(" ").trim()}>
      {onClose ? (
        <div className="flex items-center justify-between border-b border-separator px-3 py-2 lg:hidden">
          <span className="text-xs font-semibold text-foreground">
            {element ? t("inspector.elementType") : relationship ? t("inspector.relationship") : t("inspector.workspace")}
          </span>
          <Button isIconOnly size="sm" variant="ghost" onPress={onClose} aria-label="Cerrar panel">
            <Icon name="x" />
          </Button>
        </div>
      ) : null}
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
