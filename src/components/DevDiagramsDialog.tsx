import { Button, Modal } from "@heroui/react";
import { useState } from "react";
import type { DevModeApi } from "@/lib/dev-mode";
import type { Project } from "@/lib/types";
import { Icon } from "./icons";

export function DevDiagramsDialog({
  isOpen,
  onClose,
  devMode,
  currentProject,
  onImportProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  devMode: DevModeApi;
  currentProject: Project;
  onImportProject: (project: Project, opts?: { force?: boolean }) => void;
}) {
  const [newFilename, setNewFilename] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  const filteredItems = devMode.testDiagrams.filter((item) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.filename.toLowerCase().includes(q);
  });

  const handleSaveAsNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename.trim()) return;
    const ok = await devMode.saveCurrent(currentProject, newFilename.trim());
    if (ok) {
      setNewFilename("");
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <Modal.Header className="border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Icon name="code" className="text-base" />
                  </div>
                  <Modal.Heading className="text-base font-bold text-foreground">
                    Modo Edición DEV · Diagramas de Prueba
                  </Modal.Heading>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  .env.local activo
                </span>
              </div>
              <p className="text-xs text-muted">
                Los diagramas se leen y persisten como archivos <code className="font-mono text-foreground font-semibold">.json</code> directamente en la carpeta <code className="font-mono text-accent">test-diagrams/</code> de tu proyecto.
              </p>
            </div>
          </Modal.Header>

          <Modal.Body className="max-h-[65vh] overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* Barra superior de acciones */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-surface-secondary/50 p-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="font-medium shadow-xs"
                  onPress={() => setIsCreating((prev) => !prev)}
                >
                  <Icon name="plus" />
                  Guardar diagrama actual como JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={devMode.loading}
                  onPress={() => devMode.refreshList()}
                  title="Recargar archivos de disco"
                >
                  <Icon name="refresh" className={devMode.loading ? "animate-spin" : ""} />
                  Recargar
                </Button>
              </div>

              {devMode.activeDevFile ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted">Archivo activo:</span>
                  <span className="inline-flex items-center gap-1 rounded bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                    📄 {devMode.activeDevFile}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] text-muted hover:text-foreground px-1.5"
                    onPress={devMode.detachActiveFile}
                    title="Desvincular del archivo en disco"
                  >
                    Desvincular
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Formulario desplegable para guardar nuevo archivo */}
            {isCreating ? (
              <form
                onSubmit={handleSaveAsNew}
                className="flex flex-col gap-2 rounded-xl border border-accent/40 bg-accent-soft/10 p-3 transition-all"
              >
                <p className="text-xs font-semibold text-foreground">
                  Guardar proyecto actual en un nuevo archivo JSON:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="ej: microservicios-pagos.json"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  />
                  <Button size="sm" variant="primary" type="submit" isDisabled={devMode.loading}>
                    <Icon name="download" />
                    Guardar archivo
                  </Button>
                  <Button size="sm" variant="ghost" onPress={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : null}

            {/* Buscador de diagramas si hay más de 2 */}
            {devMode.testDiagrams.length > 2 ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filtrar diagramas de prueba…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
            ) : null}

            {/* Lista de diagramas de prueba */}
            <div className="flex flex-col gap-2.5">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-muted">
                  <Icon name="file" className="text-2xl opacity-40" />
                  <p className="text-xs">No hay diagramas de prueba en la carpeta test-diagrams/</p>
                  <Button size="sm" variant="outline" onPress={() => setIsCreating(true)}>
                    Crear el primero a partir del diagrama actual
                  </Button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isActive = devMode.activeDevFile === item.filename;
                  return (
                    <div
                      key={item.id}
                      className={[
                        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all",
                        isActive
                          ? "border-accent bg-accent-soft/15 shadow-xs ring-1 ring-accent/30"
                          : "border-border bg-surface hover:border-border/80 hover:bg-surface-secondary/30",
                      ].join(" ")}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {item.filename}
                          </span>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Abierto en el editor
                            </span>
                          ) : null}
                          <span className="text-[10px] text-muted font-mono">
                            {(item.sizeBytes / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        {item.name !== item.filename.replace(/\.json$/, "") ? (
                          <p className="text-xs font-semibold text-foreground truncate">
                            {item.name}
                          </p>
                        ) : null}

                        {item.description ? (
                          <p className="text-[11px] text-muted line-clamp-1">
                            {item.description}
                          </p>
                        ) : null}

                        <div className="flex items-center gap-3 text-[11px] text-muted pt-0.5">
                          <span>📑 {item.sheetCount} vistas</span>
                          <span>📦 {item.elementCount} elementos</span>
                          <span>🔗 {item.relationshipCount} relaciones</span>
                          <span className="text-[10px] opacity-75">
                            {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant={isActive ? "secondary" : "primary"}
                          className="font-medium text-xs h-8"
                          isDisabled={devMode.loading}
                          onPress={() => {
                            devMode.loadDiagram(item.id, onImportProject);
                            onClose();
                          }}
                        >
                          <Icon name="diagram" className="text-xs" />
                          {isActive ? "Recargar" : "Cargar en editor"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          isDisabled={devMode.loading}
                          onPress={() => {
                            if (window.confirm(`¿Sobrescribir "${item.filename}" con el estado actual del editor?`)) {
                              devMode.saveCurrent(currentProject, item.filename);
                            }
                          }}
                          title="Sobrescribir archivo con el proyecto actual"
                        >
                          <Icon name="download" className="text-xs" />
                          Sobrescribir
                        </Button>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          className="text-muted hover:text-red-500 h-8 w-8"
                          isDisabled={devMode.loading}
                          onPress={() => {
                            if (window.confirm(`¿Eliminar permanentemente "${item.filename}" del disco?`)) {
                              devMode.deleteDiagram(item.id);
                            }
                          }}
                          title="Eliminar archivo del disco"
                        >
                          <Icon name="trash" className="text-xs" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Modal.Body>

          <Modal.Footer className="border-t border-border p-3 sm:p-4 flex items-center justify-between">
            <span className="text-[11px] text-muted">
              Ruta en servidor: <code className="font-mono text-foreground font-semibold">test-diagrams/</code>
            </span>
            <Button size="sm" variant="secondary" onPress={onClose}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
  );
}
