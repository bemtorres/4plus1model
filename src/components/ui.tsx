import { Button, Tooltip } from "@heroui/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { IconName } from "@/lib/catalog";
import type { HandleSide } from "@/lib/types";
import { useT, type TranslationKey } from "@/i18n";
import { Icon } from "./icons";
/* ------------------------------------------------------------------ */
/* Botón de icono con descripción                                     */
/* ------------------------------------------------------------------ */

export function IconButton({
  icon,
  label,
  onPress,
  isDisabled,
  variant = "ghost",
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  variant?: "ghost" | "outline" | "secondary" | "danger-soft";
}) {
  return (
    <Tooltip delay={250}>
      <Tooltip.Trigger>
        <Button
          isIconOnly
          size="sm"
          variant={variant}
          aria-label={label}
          isDisabled={isDisabled}
          onPress={onPress}
        >
          <Icon name={icon} className="text-[15px]" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/* Select nativo estilizado                                            */
/* ------------------------------------------------------------------ */

export interface PickerOption {
  value: string;
  label: string;
}

export function Picker({
  value,
  onChange,
  options,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  label: string;
  disabled?: boolean;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-[var(--field-radius)] border border-border bg-field px-2.5 text-sm text-field-foreground outline-none transition-colors hover:border-field-border-hover focus:border-field-border-focus disabled:opacity-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Control segmentado                                                  */
/* ------------------------------------------------------------------ */

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: string; hint?: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-[var(--radius)] bg-surface-secondary p-0.5"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={option.hint}
            onClick={() => onChange(option.id)}
            className={[
              "rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]"
                : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Selector de cara de conexión                                        */
/* ------------------------------------------------------------------ */

const SIDE_ICONS: { side: HandleSide; icon: IconName; label: TranslationKey }[] = [
  { side: "top", icon: "arrow-up", label: "side.top" },
  { side: "right", icon: "arrow-right", label: "side.right" },
  { side: "bottom", icon: "arrow-down", label: "side.bottom" },
  { side: "left", icon: "arrow-left", label: "side.left" },
];

export function SidePicker({
  value,
  onChange,
  label,
}: {
  value: HandleSide | null;
  onChange: (side: HandleSide | null) => void;
  label: string;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-[11px] text-muted">
          {value ? t(SIDE_ICONS.find((item) => item.side === value)!.label) : t("side.automatic")}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {SIDE_ICONS.map((item) => {
          const active = value === item.side;
          const name = t(item.label);
          return (
            <button
              key={item.side}
              type="button"
              title={name}
              aria-label={`${label}: ${name}`}
              aria-pressed={active}
              onClick={() => onChange(active ? null : item.side)}
              className={[
                "grid size-8 place-items-center rounded-lg border text-sm transition-colors",
                active
                  ? "border-accent bg-accent-soft text-accent-soft-foreground"
                  : "border-border text-muted hover:bg-surface-secondary hover:text-foreground",
              ].join(" ")}
            >
              <Icon name={item.icon} />
            </button>
          );
        })}
        <button
          type="button"
          title={t("side.automatic")}
          aria-label={`${label}: ${t("side.automatic")}`}
          aria-pressed={value === null}
          onClick={() => onChange(null)}
          className={[
            "ml-auto h-8 rounded-lg border px-2.5 text-[11px] transition-colors",
            value === null
              ? "border-accent bg-accent-soft text-accent-soft-foreground"
              : "border-border text-muted hover:bg-surface-secondary hover:text-foreground",
          ].join(" ")}
        >
          {t("common.auto")}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Título editable                                                     */
/* ------------------------------------------------------------------ */

/**
 * Campo que aparenta ser un texto hasta que se hace clic: `Enter` confirma,
 * `Escape` cancela y al salir del campo se guarda el cambio.
 */
export function EditableTitle({
  value,
  onCommit,
  placeholder,
  label,
  className,
  readOnly = false,
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) onCommit(next);
    else setDraft(value);
  };

  if (readOnly) {
    return (
      <p className={`truncate px-1.5 -mx-1.5 py-0.5 text-sm leading-tight font-semibold ${className ?? ""}`}>
        {value}
      </p>
    );
  }

  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      aria-label={label}
      title={label}
      spellCheck={false}
      onChange={(event) => {
        setEditing(true);
        setDraft(event.target.value);
      }}
      onFocus={(event) => {
        setEditing(true);
        event.currentTarget.select();
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === "Escape") {
          event.preventDefault();
          setDraft(value);
          setEditing(false);
          event.currentTarget.blur();
        }
      }}
      className={[
        "w-full min-w-0 rounded-md px-1.5 py-0.5 -mx-1.5 text-sm leading-tight font-semibold",
        "text-foreground transition-colors outline-none",
        editing
          ? "bg-field ring-2 ring-accent/40"
          : "hover:bg-surface-secondary focus:bg-surface-secondary focus:ring-2 focus:ring-accent/40",
        "placeholder:font-normal placeholder:text-muted",
        className,
      ].join(" ")}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Selector de color y grosor                                          */
/* ------------------------------------------------------------------ */

const HEX = /^#[0-9a-f]{6}$/i;

export function ColorField({
  label,
  value,
  fallback,
  onChange,
  readOnly,
}: {
  label: string;
  /** `null` = color por defecto del tipo. */
  value: string | null | undefined;
  /** Color que se muestra en la muestra cuando no hay valor propio. */
  fallback: string;
  onChange: (color: string | null) => void;
  readOnly?: boolean;
}) {
  const t = useT();
  const current = value && HEX.test(value) ? value : fallback;
  const isCustom = Boolean(value && HEX.test(value));
  const swatch = (
    <input
      type="color"
      value={current}
      aria-label={label}
      disabled={readOnly}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-1 min-w-0">
        <span className="text-xs font-medium text-muted truncate" title={label}>{label}</span>
        {isCustom && !readOnly ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 text-[10px] text-accent hover:underline"
          >
            {t("inspector.colorReset")}
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {swatch}
        <code className="font-mono text-[11px] text-muted uppercase">{current}</code>
      </div>
    </div>
  );
}

const THICKNESS_OPTIONS = ["", "1", "1.5", "2.5", "4", "6"];

export function ThicknessField({
  value,
  onChange,
  readOnly,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  readOnly?: boolean;
}) {
  const t = useT();
  const current = value === null || value === undefined ? "" : String(value);
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{t("inspector.thickness")}</FieldLabel>
      <div className="flex items-center gap-1">
        {THICKNESS_OPTIONS.map((option) => {
          const active = current === option;
          return (
            <button
              key={option || "auto"}
              type="button"
              disabled={readOnly}
              aria-pressed={active}
              onClick={() => onChange(option ? Number(option) : null)}
              className={[
                "h-8 min-w-9 rounded-md border px-1.5 text-[11px] transition-colors",
                active
                  ? "border-accent bg-accent-soft text-accent-soft-foreground"
                  : "border-border text-muted hover:bg-surface-secondary hover:text-foreground",
                readOnly ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              {option === "" ? t("common.auto") : `${option}px`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sección plegable                                                    */
/* ------------------------------------------------------------------ */

export function Details({
  label,
  children,
  open,
}: {
  label: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="details rounded-xl border border-border bg-surface-secondary/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-foreground select-none">
        {label}
        <Icon name="chevron-down" className="details__chevron text-muted" />
      </summary>
      <div className="flex flex-col gap-3 px-3 pt-1 pb-3">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Número con paso                                                     */
/* ------------------------------------------------------------------ */

export function SimpleNumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  readOnly = false,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  readOnly?: boolean;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState<string>(String(value ?? 0));

  useEffect(() => {
    setText(String(value ?? 0));
  }, [value]);

  const commit = (raw: string) => {
    let num = parseFloat(raw);
    if (Number.isNaN(num)) {
      num = value ?? 0;
    }
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    setText(String(num));
    onChange(num);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-xs font-medium text-muted truncate" title={label}>{label}</span>
      <div className="relative flex items-center">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={text}
          disabled={readOnly}
          onChange={(event) => {
            setText(event.target.value);
            const val = parseFloat(event.target.value);
            if (!Number.isNaN(val)) {
              const clamped = Math.min(
                max !== undefined ? max : Infinity,
                Math.max(min !== undefined ? min : -Infinity, val),
              );
              onChange(clamped);
            }
          }}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit((event.target as HTMLInputElement).value);
              (event.target as HTMLInputElement).blur();
            }
          }}
          className={[
            "h-9 w-full rounded-[var(--field-radius)] border border-border bg-field px-2.5 text-sm font-mono text-foreground outline-none transition-colors",
            "focus:border-field-border-focus focus:ring-1 focus:ring-accent/40",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            suffix ? "pr-9" : "",
            readOnly ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-2.5 text-xs font-medium text-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function NumberStepper({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  readOnly,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  readOnly?: boolean;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        <button
          type="button"
          disabled={readOnly || value <= min}
          aria-label={`${label} -`}
          onClick={() => onChange(clamp(value - step))}
          className="h-8 w-8 text-sm leading-none text-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          &minus;
        </button>
        <span className="flex-1 text-center font-mono text-xs text-foreground">
          {value}
          {suffix}
        </span>
        <button
          type="button"
          disabled={readOnly || value >= max}
          aria-label={`${label} +`}
          onClick={() => onChange(clamp(value + step))}
          className="h-8 w-8 text-sm leading-none text-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estructura de panel                                                 */
/* ------------------------------------------------------------------ */

export function PanelSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col">
      <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <h2 className="text-[11px] font-semibold tracking-wide text-muted uppercase">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-muted">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Campo con estado local (commit al salir)                            */
/* ------------------------------------------------------------------ */

export function useDraftField<T>(
  external: T,
  commit: (value: T) => void,
): {
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
} {
  const [local, setLocal] = useState(external);
  const dirtyRef = useRef(false);
  const externalRef = useRef(external);

  useEffect(() => {
    externalRef.current = external;
    if (!dirtyRef.current) setLocal(external);
  }, [external]);

  return {
    value: local,
    onChange: (value: T) => {
      dirtyRef.current = true;
      setLocal(value);
    },
    onBlur: () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      if (local !== externalRef.current) commit(local);
    },
  };
}
