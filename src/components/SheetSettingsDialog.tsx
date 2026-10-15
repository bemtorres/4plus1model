import { Button, Modal } from "@heroui/react";
import { useState, useEffect } from "react";
import type { Sheet, IconName } from "@/lib/types";
import { ELEMENT_ICONS, diagramDef } from "@/lib/diagrams";
import { Icon } from "./icons";
import { notify } from "./Toaster";

const COLOR_PRESETS = [
  { label: "Por defecto", value: null, hex: "transparent", border: "var(--border)" },
  { label: "Azul", value: "#3b82f6", hex: "#3b82f6", border: "#2563eb" },
  { label: "Índigo", value: "#6366f1", hex: "#6366f1", border: "#4f46e5" },
  { label: "Púrpura", value: "#a855f7", hex: "#a855f7", border: "#9333ea" },
  { label: "Esmeralda", value: "#10b981", hex: "#10b981", border: "#059669" },
  { label: "Ámbar", value: "#f59e0b", hex: "#f59e0b", border: "#d97706" },
  { label: "Naranja", value: "#f97316", hex: "#f97316", border: "#ea580c" },
  { label: "Rojo", value: "#ef4444", hex: "#ef4444", border: "#dc2626" },
  { label: "Cian", value: "#06b6d4", hex: "#06b6d4", border: "#0891b2" },
  { label: "Grafito", value: "#64748b", hex: "#64748b", border: "#475569" },
];

export function SheetSettingsDialog({
  sheet,
  isOpen,
  onClose,
  onSave,
}: {
  sheet: Sheet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetId: string, patch: { name: string; color?: string | null; icon?: IconName | null }) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [icon, setIcon] = useState<IconName | null | undefined>(undefined);
  const [iconFilter, setIconFilter] = useState("");

  useEffect(() => {
    if (sheet && isOpen) {
      setName(sheet.name || "");
      setColor(sheet.color ?? null);
      setIcon(sheet.icon);
      setIconFilter("");
    }
  }, [sheet, isOpen]);

  if (!sheet) return null;

  const def = diagramDef(sheet.diagram);
  const effectiveIcon = icon === null ? null : (icon ?? def.icon);
  const effectiveColor = color ?? null;

  const filteredIcons = ELEMENT_ICONS.filter((item) =>
    iconFilter ? item.toLowerCase().includes(iconFilter.toLowerCase()) : true,
  );

  const handleSave = () => {
    onSave(sheet.id, {
      name: name.trim(),
      color: effectiveColor,
      icon,
    });
    notify("Vista actualizada", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog className="max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
            <Modal.Header className="border-b border-border p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="grid size-9 place-items-center rounded-xl text-base shadow-xs"
                  style={{
                    backgroundColor: effectiveColor ? `${effectiveColor}20` : "var(--surface-secondary)",
                    color: effectiveColor || "var(--accent)",
                    border: `1px solid ${effectiveColor ? `${effectiveColor}40` : "var(--border)"}`,
                  }}
                >
                  {effectiveIcon ? <Icon name={effectiveIcon} /> : <Icon name="diagram" />}
                </div>
                <div>
                  <Modal.Heading className="text-base font-bold text-foreground">
                    Personalizar Vista
                  </Modal.Heading>
                  <p className="text-xs text-muted">
                    Configura el nombre, color distintivo e icono de la pestaña inferior
                  </p>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body className="max-h-[65vh] overflow-y-auto p-4 sm:p-5 flex flex-col gap-5">
              {/* Vista previa en tiempo real */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-foreground">Vista previa de la pestaña:</span>
                <div className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-border bg-surface-secondary/40">
                  {/* Pestaña activa */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-t-lg border border-border transition-all shadow-xs"
                    style={{
                      borderTopColor: effectiveColor || "var(--accent)",
                      borderTopWidth: "3px",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                  >
                    {effectiveIcon ? (
                      <Icon
                        name={effectiveIcon}
                        style={{ color: effectiveColor || "inherit" }}
                        className="text-xs"
                      />
                    ) : null}
                    <span>{name.trim() || sheet.name || "Vista"}</span>
                  </div>

                  {/* Pestaña inactiva */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted rounded-t-lg border border-border opacity-70"
                    style={{
                      borderTopColor: effectiveColor ? `${effectiveColor}80` : "transparent",
                      borderTopWidth: effectiveColor ? "2px" : "1px",
                      backgroundColor: "color-mix(in oklab, var(--surface) 60%, var(--background))",
                    }}
                  >
                    {effectiveIcon ? (
                      <Icon
                        name={effectiveIcon}
                        style={{ color: effectiveColor || "inherit" }}
                        className="text-xs opacity-75"
                      />
                    ) : null}
                    <span>{name.trim() || sheet.name || "Vista"}</span>
                  </div>
                </div>
              </div>

              {/* Nombre de la vista */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="sheet-name-input">
                  Nombre de la vista:
                </label>
                <input
                  id="sheet-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Escenarios de Usuario, Diagrama Principal…"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Color distintivo */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Color distintivo:</span>
                  {color ? (
                    <button
                      type="button"
                      onClick={() => setColor(null)}
                      className="text-[11px] text-accent hover:underline cursor-pointer"
                    >
                      Restablecer (por defecto)
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = color === preset.value;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        title={preset.label}
                        onClick={() => setColor(preset.value)}
                        className={[
                          "group relative flex h-7 w-7 items-center justify-center rounded-lg border transition-all hover:scale-105 cursor-pointer",
                          isSelected ? "ring-2 ring-accent ring-offset-1 scale-105 shadow-xs" : "",
                        ].join(" ")}
                        style={{
                          backgroundColor: preset.value ? preset.hex : "var(--surface)",
                          borderColor: preset.border,
                        }}
                      >
                        {preset.value === null ? (
                          <span className="text-[10px] text-muted font-bold">∅</span>
                        ) : isSelected ? (
                          <span className="size-2 rounded-full bg-white shadow-xs" />
                        ) : null}
                      </button>
                    );
                  })}

                  {/* Selector de color personalizado */}
                  <label
                    title="Elegir color personalizado"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-border bg-surface-secondary text-muted hover:border-accent hover:text-foreground cursor-pointer transition-all"
                  >
                    <input
                      type="color"
                      value={color || "#3b82f6"}
                      onChange={(e) => setColor(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">+</span>
                  </label>
                </div>
              </div>

              {/* Icono distintivo */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Icono:</span>
                  <div className="flex items-center gap-2">
                    {icon !== undefined ? (
                      <button
                        type="button"
                        onClick={() => setIcon(undefined)}
                        className="text-[11px] text-accent hover:underline cursor-pointer"
                      >
                        Usar el del diagrama
                      </button>
                    ) : null}
                    {icon !== null ? (
                      <button
                        type="button"
                        onClick={() => setIcon(null)}
                        className="text-[11px] text-red-500 hover:underline cursor-pointer"
                      >
                        Quitar icono
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Buscador de iconos */}
                <input
                  type="text"
                  placeholder="Buscar icono por nombre…"
                  value={iconFilter}
                  onChange={(e) => setIconFilter(e.target.value)}
                  className="rounded-lg border border-border bg-surface-secondary/50 px-2.5 py-1 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />

                {/* Grid de iconos */}
                <div className="grid grid-cols-8 gap-1 p-1 rounded-xl border border-border/80 bg-surface-secondary/40 max-h-40 overflow-y-auto">
                  {/* Opción: Sin icono */}
                  <button
                    type="button"
                    title="Sin icono"
                    onClick={() => setIcon(null)}
                    className={[
                      "grid h-8 place-items-center rounded-lg border text-xs transition-all cursor-pointer",
                      icon === null
                        ? "border-red-400 bg-red-500/15 text-red-500 font-bold scale-105"
                        : "border-transparent text-muted hover:border-border hover:bg-surface-secondary hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon name="x" />
                  </button>

                  {/* Iconos disponibles */}
                  {filteredIcons.map((name) => {
                    const isSelected = (icon ?? def.icon) === name && icon !== null;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => setIcon(name)}
                        className={[
                          "grid h-8 place-items-center rounded-lg border text-sm transition-all cursor-pointer",
                          isSelected
                            ? "border-accent bg-accent-soft text-accent scale-105 shadow-xs font-bold"
                            : "border-transparent text-muted hover:border-border hover:bg-surface-secondary hover:text-foreground",
                        ].join(" ")}
                      >
                        <Icon name={name} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-t border-border p-3 sm:p-4 flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onPress={onClose}>
                Cancelar
              </Button>
              <Button size="sm" variant="primary" onPress={handleSave}>
                Guardar cambios
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
