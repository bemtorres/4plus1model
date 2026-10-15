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
import {
  ELEMENT_ICONS,
  diagramDef,
  iconOf,
  kindMeta,
  stylesOf,
} from "@/lib/diagrams";
import type {
  DiagramElement,
  DiagramRelationship,
  ElementKind,
  HandleSide,
  RelationshipStyle,
  Sheet,
} from "@/lib/types";
import { useProject } from "@/lib/project-store";
import { indexElements } from "@/lib/view";
import { useT, type TranslationKey } from "@/i18n";
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

/** Todos los elementos que cuelgan de `id` (hijos, nietos…). */
function descendantsOf(sheet: Sheet, id: string): Set<string> {
  const descendants = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const candidate of sheet.elements) {
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
  readOnly,
}: {
  value: DiagramElement["icon"];
  defaultIcon?: DiagramElement["icon"];
  kindLabel: string;
  onChange: (icon: DiagramElement["icon"]) => void;
  readOnly?: boolean;
}) {
  const t = useT();
  const isRemoved = value === null;
  const effectiveIcon = isRemoved ? null : (value ?? defaultIcon ?? null);
  const hasIcon = Boolean(effectiveIcon);
  const isCustom = value !== undefined && value !== defaultIcon;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FieldLabel>{t("inspector.icon")}</FieldLabel>
          {effectiveIcon ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-accent-soft text-accent">
              <Icon name={effectiveIcon} className="text-xs" />
              <span>{effectiveIcon}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-surface-secondary text-muted">
              Sin icono
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCustom && !readOnly ? (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[11px] text-accent hover:underline"
              title="Restablecer al icono por defecto"
            >
              {t("inspector.iconReset")}
            </button>
          ) : null}

          {!readOnly ? (
            hasIcon ? (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                title="Quitar icono de este elemento"
              >
                <Icon name="x" className="text-xs" />
                <span>Quitar icono</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChange(defaultIcon ?? "box")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-accent bg-accent-soft hover:bg-accent/25 transition-colors"
                title="Añadir icono a este elemento"
              >
                <Icon name="plus" className="text-xs" />
                <span>Añadir icono</span>
              </button>
            )
          ) : null}
        </div>
      </div>

      {/* Grid de selección de iconos */}
      <div className="grid grid-cols-8 gap-1 p-1 rounded-lg border border-border/70 bg-surface-secondary/40 max-h-48 overflow-y-auto">
        {/* Opción 1: Sin icono */}
        <button
          type="button"
          title="Sin icono (Quitar)"
          aria-label="Sin icono"
          aria-pressed={!hasIcon}
          disabled={readOnly}
          onClick={() => onChange(null)}
          className={[
            "grid h-7 place-items-center rounded-md border text-[12px] transition-all",
            !hasIcon
              ? "border-red-400 bg-red-500/20 text-red-600 dark:text-red-400 font-bold shadow-xs scale-105"
              : "border-dashed border-border/80 text-muted hover:border-red-400 hover:text-red-500 hover:bg-red-500/10",
          ].join(" ")}
        >
          <Icon name="x" />
        </button>

        {/* Lista de iconos disponibles */}
        {ELEMENT_ICONS.map((name) => {
          const active = hasIcon && effectiveIcon === name;
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={t("inspector.iconName", { name })}
              aria-pressed={active}
              disabled={readOnly}
              onClick={() => onChange(name)}
              className={[
                "grid h-7 place-items-center rounded-md border text-[13px] transition-all",
                active
                  ? "border-accent bg-accent-soft text-accent shadow-xs scale-105 ring-1 ring-accent/30"
                  : "border-transparent text-muted hover:border-border hover:bg-surface-secondary hover:text-foreground",
              ].join(" ")}
            >
              <Icon name={name} />
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">
        {!hasIcon
          ? "Sin icono visual asignado."
          : isCustom
            ? t("inspector.iconCustom")
            : t("inspector.iconDefaultOf", { kind: kindLabel })}
      </p>
    </div>
  );
}

function NewRelationForm({ element }: { element: DiagramElement }) {
  const { sheet, addRelationship, readOnly } = useProject();
  const t = useT();
  const styleLabel = useStyleLabel();
  const descendants = descendantsOf(sheet, element.id);
  const options = sheet.elements
    .filter((item) => item.id !== element.id && !descendants.has(item.id))
    .map((item) => ({ value: item.id, label: item.name }));

  const [target, setTarget] = useState("");
  const [side, setSide] = useState<HandleSide | null>(null);
  const [targetSide, setTargetSide] = useState<HandleSide | null>(null);
  const [label, setLabel] = useState("");
  const [style, setStyle] = useState<RelationshipStyle>("association");

  const create = () => {
    if (!target) return;
    addRelationship({
      source: element.id,
      target,
      sourceHandle: side,
      targetHandle: targetSide,
      label: label.trim(),
      description: "",
      style,
    });
    setTarget("");
    setSide(null);
    setTargetSide(null);
    setLabel("");
    setStyle("association");
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
        <FieldLabel>{t("inspector.style")}</FieldLabel>
        <Picker
          label={t("inspector.style")}
          disabled={readOnly}
          value={style}
          onChange={(value) => setStyle(value as RelationshipStyle)}
          options={stylesOf(sheet.diagram).map((item) => ({
            value: item,
            label: styleLabel(item),
          }))}
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
  // Fila 3 (Tonos profundos)
  { id: "c4-blue", label: "Azul profundo", bg: "#1168bd", border: "#0b4884", text: "#ffffff" },
  { id: "c4-navy", label: "Azul marino", bg: "#08427b", border: "#052e56", text: "#ffffff" },
  { id: "c4-steel", label: "Azul acero", bg: "#438dd5", border: "#2e6295", text: "#ffffff" },
  { id: "c4-gray", label: "Gris medio", bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
];

const GOAL_LEVELS = ["summary", "user", "subfunction"] as const;

function goalLevelKey(level: string) {
  return `inspector.useCase.goal.${level}` as TranslationKey;
}

/** Editor del flujo principal de un caso de uso (pasos ordenados). */
function UseCaseFlowEditor({
  useCase,
  readOnly,
}: {
  useCase: DiagramElement;
  readOnly: boolean;
}) {
  const { sheet, select, addElement, updateElement, removeElement, reorderStep } = useProject();
  const t = useT();

  const steps = sheet.elements
    .filter((item) => item.kind === "step" && item.parentId === useCase.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const move = (index: number, delta: number) => {
    const next = [...steps];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorderStep(
      useCase.id,
      next.map((item) => item.id),
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{t("inspector.useCase.flow")}</FieldLabel>
      {steps.length === 0 ? (
        <p className="text-[11px] text-muted italic">{t("inspector.noContent")}</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface-secondary/40 px-1.5 py-1"
            >
              <button
                type="button"
                onClick={() => select({ type: "element", id: step.id })}
                className="grid size-5 shrink-0 place-items-center rounded bg-surface text-[10px] font-bold text-accent hover:bg-accent-soft"
                aria-label={step.name}
              >
                {index + 1}
              </button>
              <input
                defaultValue={step.name}
                disabled={readOnly}
                onBlur={(event) => {
                  const next = event.target.value.trim();
                  if (next && next !== step.name) updateElement(step.id, { name: next });
                  else event.target.value = step.name;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                className="min-w-0 flex-1 bg-transparent px-1 text-xs text-foreground outline-none focus:bg-field"
              />
              {!readOnly ? (
                <span className="flex shrink-0 items-center">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={t("inspector.useCase.moveUp")}
                    className="grid size-6 place-items-center rounded text-muted hover:text-foreground disabled:opacity-30"
                  >
                    <Icon name="chevron-up" className="text-xs" />
                  </button>
                  <button
                    type="button"
                    disabled={index === steps.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={t("inspector.useCase.moveDown")}
                    className="grid size-6 place-items-center rounded text-muted hover:text-foreground disabled:opacity-30"
                  >
                    <Icon name="chevron-down" className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeElement(step.id)}
                    aria-label={t("common.delete")}
                    className="grid size-6 place-items-center rounded text-muted hover:text-danger"
                  >
                    <Icon name="x" className="text-xs" />
                  </button>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      )}
      {readOnly ? null : (
        <Button size="sm" variant="outline" onPress={() => addElement("step", undefined, useCase.id)}>
          {t("inspector.useCase.addStep")}
        </Button>
      )}
    </div>
  );
}

function ElementContentTab({
  element,
  readOnly,
  name,
  description,
  tags,
  parentOptions,
  childrenCount,
  relationshipsCount,
}: {
  element: DiagramElement;
  readOnly: boolean;
  name: ReturnType<typeof useDraftField<string>>;
  description: ReturnType<typeof useDraftField<string>>;
  tags: ReturnType<typeof useDraftField<string>>;
  parentOptions: { value: string; label: string }[];
  childrenCount: number;
  relationshipsCount: number;
}) {
  const { sheet, updateElement, removeElement, drillInto } = useProject();
  const t = useT();
  const diagram = sheet.diagram;
  const meta = kindMeta(diagram, element.kind);
  const levelLabel = useLevelLabel();

  const actorType = element.meta?.actorType ?? "primary";
  const goalLevel = element.meta?.goalLevel ?? "user";

  const setMeta = (key: string, value: string) => {
    updateElement(element.id, { meta: { ...element.meta, [key]: value } });
  };

  const preconditions = useDraftField(element.meta?.preconditions ?? "", (value) =>
    setMeta("preconditions", value),
  );
  const postconditions = useDraftField(element.meta?.postconditions ?? "", (value) =>
    setMeta("postconditions", value),
  );

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
                level: levelLabel(meta.drillLevel ?? "").toLowerCase(),
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

      {element.kind !== "note" ? (
        <TextField value={description.value} onChange={description.onChange} isDisabled={readOnly}>
          <Label>{t("inspector.description")}</Label>
          <TextArea
            rows={3}
            onBlur={description.onBlur}
            placeholder={t("inspector.descriptionPlaceholder")}
          />
        </TextField>
      ) : null}

      {element.kind === "actor" ? (
        <div className="flex flex-col gap-1.5">
          <FieldLabel>{t("inspector.actorType")}</FieldLabel>
          <Picker
            label={t("inspector.actorType")}
            disabled={readOnly}
            value={actorType}
            onChange={(value) => setMeta("actorType", value)}
            options={[
              { value: "primary", label: t("kind.actorType.primary") },
              { value: "secondary", label: t("kind.actorType.secondary") },
            ]}
          />
        </div>
      ) : null}

      {element.kind === "useCase" ? (
        <>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{t("inspector.useCase.goalLevel")}</FieldLabel>
            <Picker
              label={t("inspector.useCase.goalLevel")}
              disabled={readOnly}
              value={goalLevel}
              onChange={(value) => setMeta("goalLevel", value)}
              options={GOAL_LEVELS.map((level) => ({
                value: level,
                label: t(goalLevelKey(level)),
              }))}
            />
          </div>

          <TextField
            value={preconditions.value}
            onChange={preconditions.onChange}
            isDisabled={readOnly}
          >
            <Label>{t("inspector.useCase.preconditions")}</Label>
            <TextArea rows={2} onBlur={preconditions.onBlur} />
          </TextField>

          <TextField
            value={postconditions.value}
            onChange={postconditions.onChange}
            isDisabled={readOnly}
          >
            <Label>{t("inspector.useCase.postconditions")}</Label>
            <TextArea rows={2} onBlur={postconditions.onBlur} />
          </TextField>

          <UseCaseFlowEditor useCase={element} readOnly={readOnly} />
        </>
      ) : null}

      {element.kind === "actor" || element.kind === "system" ? (
        <TextField value={tags.value} onChange={tags.onChange} isDisabled={readOnly}>
          <Label>{t("inspector.tags")}</Label>
          <Input onBlur={tags.onBlur} placeholder={t("inspector.tagsPlaceholder")} />
        </TextField>
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
  element: DiagramElement;
  readOnly: boolean;
}) {
  const { sheet, updateElement } = useProject();
  const t = useT();
  const meta = kindMeta(sheet.diagram, element.kind);
  const kindLabel = useKindLabel();

  const showFill = element.fill !== false && element.color !== "transparent";
  const showBorder = element.border !== false;

  const isActor = element.kind === "actor";

  const FONT_OPTIONS = [
    { value: "", label: "Por defecto (Inter / Sistema)" },
    { value: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", label: "Segoe UI / Sans" },
    { value: "'Arial', 'Helvetica Neue', sans-serif", label: "Arial" },
    { value: "'Times New Roman', Times, serif", label: "Times New Roman (Serif)" },
    { value: "'Georgia', serif", label: "Georgia" },
    { value: "'Courier New', Courier, monospace", label: "Courier New (Monospace)" },
    { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
    { value: "'Verdana', sans-serif", label: "Verdana" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Estilos rápidos (swatches): desactivados para Actor según solicitud */}
      {!isActor ? (
        <>
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
        </>
      ) : null}

      {/* Relleno (fondo y opacidad): desactivado para Actor */}
      {!isActor ? (
        <>
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
              <span className="text-xs font-semibold text-foreground">
                {t("inspector.fill")}
              </span>
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
        </>
      ) : null}

      {/* Borde / Trazo: desactivado para Actor */}
      {!isActor ? (
        <>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBorder}
                disabled={readOnly}
                onChange={(e) => updateElement(element.id, { border: e.target.checked })}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-xs font-semibold text-foreground">
                {t("inspector.showBorder")}
              </span>
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
                  <span className="text-[11px] text-muted italic">Sin trazo específico</span>
                </div>
              )}
              <SimpleNumberInput
                label={t("inspector.radius")}
                value={element.radius ?? 6}
                min={0}
                max={60}
                suffix="px"
                readOnly={readOnly}
                onChange={(radius) => updateElement(element.id, { radius })}
              />
            </div>
          </div>
          <Separator />
        </>
      ) : null}

      {/* Tipografía: Familia de fuente, color de texto y tamaño de letra */}
      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold text-foreground">{t("inspector.typography")}</p>

        {/* Selector de fuente tipográfica */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Tipografía (Fuente)</FieldLabel>
          <Picker
            label="Tipografía"
            disabled={readOnly}
            value={element.fontFamily ?? ""}
            onChange={(val) => updateElement(element.id, { fontFamily: val ? val : null })}
            options={FONT_OPTIONS}
          />
        </div>

        {/* Color de texto y Tamaño de letra */}
        <div className="grid grid-cols-2 gap-2.5 items-start">
          <ColorField
            label="Color de letra"
            value={element.textColor}
            fallback={isActor ? "#0f172a" : meta.fg}
            readOnly={readOnly}
            onChange={(textColor) => updateElement(element.id, { textColor })}
          />
          <SimpleNumberInput
            label={t("inspector.noteSize")}
            value={element.size ?? 13}
            min={8}
            max={48}
            suffix="px"
            readOnly={readOnly}
            onChange={(size) => updateElement(element.id, { size })}
          />
        </div>
      </div>

      {/* Selector de iconos (no disponible para notas) */}
      {element.kind !== "note" ? (
        <>
          <Separator />
          <IconPicker
            value={element.icon}
            defaultIcon={meta.icon}
            kindLabel={kindLabel(element.kind)}
            readOnly={readOnly}
            onChange={(icon) => updateElement(element.id, { icon })}
          />
        </>
      ) : null}

      {/* Botón para restablecer al estilo por defecto */}
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
              fontFamily: null,
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
  element: DiagramElement;
  relationships: DiagramRelationship[];
}) {
  const { sheet, select, readOnly } = useProject();
  const t = useT();
  const styleLabel = useStyleLabel();
  const byId = indexElements(sheet);

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

function ElementInspector({ element }: { element: DiagramElement }) {
  const { sheet, updateElement, readOnly } = useProject();
  const [activeTab, setActiveTab] = useState<InspectorTab>("content");
  const t = useT();
  const diagram = sheet.diagram;
  const meta = kindMeta(diagram, element.kind);
  const kindLabel = useKindLabel();
  const byId = indexElements(sheet);

  const name = useDraftField(element.name, (value) =>
    updateElement(element.id, { name: value.trim() || t("inspector.name") }),
  );
  const description = useDraftField(element.description, (value) =>
    updateElement(element.id, { description: value }),
  );
  const tags = useDraftField(element.tags.join(", "), (value) =>
    updateElement(element.id, {
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }),
  );

  const descendants = descendantsOf(sheet, element.id);
  const parentOptions = [
    { value: "", label: t("inspector.scopeNone") },
    ...sheet.elements
      .filter(
        (candidate) =>
          kindMeta(diagram, candidate.kind).depth === meta.depth - 1 &&
          !descendants.has(candidate.id),
      )
      .map((candidate) => ({ value: candidate.id, label: candidate.name })),
  ];

  const children = sheet.elements.filter((item) => item.parentId === element.id);
  const relationships = sheet.relationships.filter(
    (relationship) => relationship.source === element.id || relationship.target === element.id,
  );
  const parentName = element.parentId ? (byId.get(element.parentId)?.name ?? "—") : null;
  const elementIcon = iconOf(diagram, element);

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
          {elementIcon ? <Icon name={elementIcon} /> : null}
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
          tags={tags}
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

function RelationshipInspector({ relationship }: { relationship: DiagramRelationship }) {
  const { sheet, updateRelationship, removeRelationship, select, readOnly } = useProject();
  const t = useT();
  const styleLabel = useStyleLabel();
  const byId = indexElements(sheet);
  const source = byId.get(relationship.source);
  const target = byId.get(relationship.target);
  const sourceIcon = source ? iconOf(sheet.diagram, source) : null;
  const targetIcon = target ? iconOf(sheet.diagram, target) : null;

  const label = useDraftField(relationship.label, (value) =>
    updateRelationship(relationship.id, { label: value }),
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
          {source && sourceIcon ? (
            <Icon name={sourceIcon} style={{ color: kindMeta(sheet.diagram, source.kind).bg }} />
          ) : null}
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
          {target && targetIcon ? (
            <Icon name={targetIcon} style={{ color: kindMeta(sheet.diagram, target.kind).bg }} />
          ) : null}
          <span className="truncate">{target?.name ?? "?"}</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>{t("inspector.style")}</FieldLabel>
        <Picker
          label={t("inspector.style")}
          disabled={readOnly}
          value={relationship.style}
          onChange={(value) =>
            updateRelationship(relationship.id, { style: value as RelationshipStyle })
          }
          options={stylesOf(sheet.diagram).map((style) => ({
            value: style,
            label: styleLabel(style),
          }))}
        />
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

      <TextField value={description.value} onChange={description.onChange} isDisabled={readOnly}>
        <Label>{t("inspector.relationDescription")}</Label>
        <TextArea rows={3} onBlur={description.onBlur} placeholder={t("inspector.relationDescriptionPlaceholder")} />
      </TextField>

      <ColorField
        label={t("inspector.color")}
        value={relationship.color}
        fallback={relationship.style === "generalization" ? "#4a4a4a" : "#4a4a4a"}
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

function UmlRelationPreview({ style }: { style: RelationshipStyle }) {
  const dashed = style === "include" || style === "extend";
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.5,
    fill: "none",
  } as const;

  return (
    <svg viewBox="0 0 76 22" className="h-[22px] w-[76px] shrink-0 text-muted" aria-hidden="true">
      {style === "generalization" ? (
        <>
          <line x1="4" y1="11" x2="60" y2="11" {...stroke} />
          <path d="M60 5.5 L71 11 L60 16.5 Z" {...stroke} />
        </>
      ) : (
        <>
          <line
            x1="4"
            y1="11"
            x2={style === "association" ? 72 : 61}
            y2="11"
            {...stroke}
            strokeDasharray={dashed ? "5 4" : undefined}
          />
          {style === "association" ? null : <path d="M61 5.5 L71 11 L61 16.5" {...stroke} />}
        </>
      )}
    </svg>
  );
}

function ProjectInspector() {
  const { project, sheet, renameProject, readOnly, level } = useProject();
  const t = useT();
  const levelLabel = useLevelLabel();
  const kindLabel = useKindLabel();
  const styleLabel = useStyleLabel();

  const name = useDraftField(project.name, (value) =>
    renameProject(value.trim() || t("inspector.workspace"), project.description),
  );
  const description = useDraftField(project.description, (value) =>
    renameProject(project.name, value),
  );

  const counts = sheet.elements.reduce<Record<string, number>>((accumulator, element) => {
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
            <dd className="font-medium text-foreground">{sheet.elements.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("common.relationships", { n: "" }).trim()}</dt>
            <dd className="font-medium text-foreground">{sheet.relationships.length}</dd>
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
  const { sheet, selection } = useProject();
  const element =
    selection?.type === "element"
      ? sheet.elements.find((item) => item.id === selection.id)
      : undefined;
  const relationship =
    selection?.type === "relationship"
      ? sheet.relationships.find((item) => item.id === selection.id)
      : undefined;

  return (
    <aside className={["panel panel--right", isOpenMobile ? "panel--mobile-open" : ""].join(" ").trim()}>
      {onClose ? (
        <div className="flex items-center justify-between border-b border-separator px-3 py-2 lg:hidden">
          <span className="text-xs font-semibold text-foreground">
            {element ? (element.name || t("inspector.name")) : relationship ? t("inspector.relationship") : t("inspector.workspace")}
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
          <ProjectInspector />
        )}
      </div>
    </aside>
  );
}
