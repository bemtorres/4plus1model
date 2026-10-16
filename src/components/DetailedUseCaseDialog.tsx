import { Button, Modal, Separator, Tab, Tabs } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/lib/project-store";
import { useT } from "@/i18n";
import { Icon } from "./icons";
import { notify } from "./Toaster";
import type { DiagramElement } from "@/lib/types";

interface DetailedUseCaseDialogProps {
  elementId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectElement?: (id: string) => void;
}

export function DetailedUseCaseDialog({
  elementId,
  isOpen,
  onOpenChange,
  onSelectElement,
}: DetailedUseCaseDialogProps) {
  const { sheet, updateElement, addRelationship, select } = useProject();
  const t = useT();

  const element = useMemo(
    () => (elementId ? sheet.elements.find((el) => el.id === elementId) : null),
    [sheet.elements, elementId],
  );

  // Todos los casos de uso disponibles en la hoja actual
  const allUseCases = useMemo(
    () => sheet.elements.filter((el) => el.kind === "useCase"),
    [sheet.elements],
  );

  // Todos los actores en la hoja actual
  const allActors = useMemo(
    () => sheet.elements.filter((el) => el.kind === "actor"),
    [sheet.elements],
  );

  // Otros casos de uso detallados disponibles (para enlazar como padre si es secundario)
  const otherDetailedUseCases = useMemo(
    () =>
      sheet.elements.filter(
        (el) => el.kind === "detailedUseCase" && el.id !== elementId,
      ),
    [sheet.elements, elementId],
  );

  // Estados locales editables
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [name, setName] = useState("");
  const [useCaseType, setUseCaseType] = useState<"primary" | "secondary">("primary");
  const [parentDetailedUseCaseId, setParentDetailedUseCaseId] = useState("");
  const [groupedUseCaseIds, setGroupedUseCaseIds] = useState<string[]>([]);
  const [actor, setActor] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [preconditions, setPreconditions] = useState("");
  const [postconditions, setPostconditions] = useState("");
  const [mainScenario, setMainScenario] = useState("");
  const [alternativeFlows, setAlternativeFlows] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [techVariations, setTechVariations] = useState("");
  const [frequency, setFrequency] = useState("");
  const [openIssues, setOpenIssues] = useState("");

  // Sincronizar estado local al abrir el diálogo o cambiar de elemento
  useEffect(() => {
    if (!element) return;
    const meta = element.meta ?? {};
    setName(element.name || "Caso de Uso Detallado");
    setUseCaseType((meta.useCaseType as "primary" | "secondary") || "primary");
    setParentDetailedUseCaseId(meta.parentDetailedUseCaseId || "");
    try {
      setGroupedUseCaseIds(meta.groupedUseCaseIds ? JSON.parse(meta.groupedUseCaseIds) : []);
    } catch {
      setGroupedUseCaseIds([]);
    }
    setActor(meta.actor || "");
    setStakeholders(meta.stakeholders || "");
    setPreconditions(meta.preconditions || "");
    setPostconditions(meta.postconditions || "");
    setMainScenario(meta.mainScenario || "");
    setAlternativeFlows(meta.alternativeFlows || "");
    setSpecialRequirements(meta.specialRequirements || "");
    setTechVariations(meta.techVariations || "");
    setFrequency(meta.frequency || "");
    setOpenIssues(meta.openIssues || "");
  }, [element]);

  if (!element) return null;

  // Manejar alternancia de selección de casos de uso agrupados
  const toggleGroupedUseCase = (ucId: string) => {
    setGroupedUseCaseIds((prev) =>
      prev.includes(ucId) ? prev.filter((id) => id !== ucId) : [...prev, ucId],
    );
  };

  // Importar / Sincronizar datos automáticamente desde los casos de uso agrupados
  const syncFromGroupedUseCases = () => {
    if (groupedUseCaseIds.length === 0) {
      notify("Selecciona al menos un caso de uso para importar sus datos.", "warning");
      return;
    }

    const selectedUCs = sheet.elements.filter((el) => groupedUseCaseIds.includes(el.id));
    if (selectedUCs.length === 0) return;

    // Tomar nombre si es el único o combinar
    if (selectedUCs.length === 1 && (!name || name === "CU Detallado")) {
      setName(selectedUCs[0].name);
    }

    // Buscar actor conectado mediante relaciones
    const connectedActorIds = sheet.relationships
      .filter((rel) =>
        groupedUseCaseIds.some(
          (ucId) =>
            (rel.source === ucId && sheet.elements.find((e) => e.id === rel.target)?.kind === "actor") ||
            (rel.target === ucId && sheet.elements.find((e) => e.id === rel.source)?.kind === "actor"),
        ),
      )
      .map((rel) =>
        groupedUseCaseIds.includes(rel.source) ? rel.target : rel.source,
      );

    if (connectedActorIds.length > 0 && !actor) {
      const actorNames = connectedActorIds
        .map((aId) => sheet.elements.find((e) => e.id === aId)?.name)
        .filter(Boolean);
      if (actorNames.length > 0) {
        setActor(actorNames.join(", "));
      }
    }

    // Precondiciones y postcondiciones combinadas
    const preList = selectedUCs
      .map((uc) => uc.meta?.preconditions?.trim())
      .filter(Boolean);
    if (preList.length > 0 && !preconditions) {
      setPreconditions(preList.join("\n"));
    }

    const postList = selectedUCs
      .map((uc) => uc.meta?.postconditions?.trim())
      .filter(Boolean);
    if (postList.length > 0 && !postconditions) {
      setPostconditions(postList.join("\n"));
    }

    // Pasos del flujo (elementos tipo "step" con parentId en alguno de los casos de uso seleccionados)
    const childSteps = sheet.elements
      .filter((el) => el.kind === "step" && groupedUseCaseIds.includes(el.parentId ?? ""))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (childSteps.length > 0 && !mainScenario) {
      const formattedSteps = childSteps
        .map(
          (step, idx) =>
            `${idx + 1}. ${step.name}${step.description ? ` (${step.description})` : ""}`,
        )
        .join("\n");
      setMainScenario(formattedSteps);
    }

    notify(
      `Datos sincronizados desde ${selectedUCs.length} caso(s) de uso agrupado(s).`,
      "success",
    );
  };

  // Guardar cambios en el elemento
  const handleSave = () => {
    updateElement(element.id, {
      name: name.trim() || "Caso de Uso Detallado",
      description: `CU ${useCaseType === "secondary" ? "Secundario" : "Primario"}${actor ? ` - Actor: ${actor}` : ""}`,
      meta: {
        ...element.meta,
        useCaseType,
        parentDetailedUseCaseId: useCaseType === "secondary" ? parentDetailedUseCaseId : "",
        groupedUseCaseIds: JSON.stringify(groupedUseCaseIds),
        actor,
        stakeholders,
        preconditions,
        postconditions,
        mainScenario,
        alternativeFlows,
        specialRequirements,
        techVariations,
        frequency,
        openIssues,
      },
    });

    // Si es secundario y se vinculó a un CU padre, crear la relación visual si no existe ya
    if (useCaseType === "secondary" && parentDetailedUseCaseId) {
      const alreadyConnected = sheet.relationships.some(
        (rel) =>
          (rel.source === element.id && rel.target === parentDetailedUseCaseId) ||
          (rel.target === element.id && rel.source === parentDetailedUseCaseId),
      );
      if (!alreadyConnected) {
        addRelationship({
          source: element.id,
          target: parentDetailedUseCaseId,
          sourceHandle: "left",
          targetHandle: "right",
          label: "extiende / secundario",
          description: "Relación de caso de uso secundario a primario",
          style: "extend",
        });
      }
    }

    notify("Ficha de Caso de Uso Detallado guardada con éxito.", "success");
    onOpenChange(false);
  };

  // Generar tabla en formato Markdown para copiar
  const generateMarkdownTable = () => {
    const parentElem = otherDetailedUseCases.find((e) => e.id === parentDetailedUseCaseId);
    const parentText =
      useCaseType === "secondary" && parentElem
        ? ` (Secundario - Vinculado a: ${parentElem.name})`
        : useCaseType === "secondary"
          ? " (Secundario)"
          : " (Primario)";

    return `# Especificación de Caso de Uso Detallado: ${name}

| Sección | Descripción |
| :--- | :--- |
| **Nombre del caso de uso** | ${name}${parentText} |
| **Actor Principal** | ${actor || "—"} |
| **Personal involucrado e intereses** | ${stakeholders ? stakeholders.replace(/\n/g, "<br/>") : "—"} |
| **Precondiciones** | ${preconditions ? preconditions.replace(/\n/g, "<br/>") : "—"} |
| **Postcondiciones o garantías de éxito** | ${postconditions ? postconditions.replace(/\n/g, "<br/>") : "—"} |
| **Escenario Principal (Flujo Básico)** | ${mainScenario ? mainScenario.replace(/\n/g, "<br/>") : "—"} |
| **Extensiones o Flujos Alternativos** | ${alternativeFlows ? alternativeFlows.replace(/\n/g, "<br/>") : "—"} |
| **Requisitos especiales** | ${specialRequirements ? specialRequirements.replace(/\n/g, "<br/>") : "—"} |
| **Lista de tecnología y variaciones de datos** | ${techVariations ? techVariations.replace(/\n/g, "<br/>") : "—"} |
| **Frecuencia con la que se lleva a cabo** | ${frequency || "—"} |
| **Temas abiertos** | ${openIssues ? openIssues.replace(/\n/g, "<br/>") : "—"} |
`;
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownTable());
      notify("Tabla Markdown copiada al portapapeles.", "success");
    } catch {
      notify("No se pudo copiar al portapapeles.", "danger");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const parentElem = otherDetailedUseCases.find((e) => e.id === parentDetailedUseCaseId);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="xl" className="max-h-[92vh]">
          <Modal.Dialog className="flex flex-col max-h-[90vh]">
            <Modal.Header className="shrink-0 border-b border-border/70 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full pr-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid size-10 place-items-center rounded-xl text-white shadow-sm shrink-0 ${
                      useCaseType === "secondary" ? "bg-purple-600" : "bg-amber-600"
                    }`}
                  >
                    <Icon name="book" className="text-xl" />
                  </div>
                  <div>
                    <Modal.Heading className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span>{name || "Caso de Uso Detallado"}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          useCaseType === "secondary"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                        }`}
                      >
                        {useCaseType === "secondary" ? "Secundario" : "Primario"}
                      </span>
                    </Modal.Heading>
                    <p className="text-xs text-muted">
                      Especificación técnica completa RUP / Cockburn y agrupación
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <div className="inline-flex rounded-lg border border-border bg-surface-secondary/60 p-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("editor")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        activeTab === "editor"
                          ? "bg-surface text-foreground shadow-xs"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon name="palette" className="text-xs" />
                      <span>Formulario</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        activeTab === "preview"
                          ? "bg-surface text-foreground shadow-xs"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon name="grid" className="text-xs" />
                      <span>Ficha Formal</span>
                    </button>
                  </div>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
              {activeTab === "editor" ? (
                <div className="space-y-6">
                  {/* SECCIÓN 1: Clasificación, Primario/Secundario y Enlaces */}
                  <div className="rounded-xl border border-border bg-surface-secondary/40 p-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Icon name="settings" className="text-xs text-accent" />
                      <span>1. Clasificación y Vinculación</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tipo de Caso de Uso */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5">
                          Tipo de Caso de Uso
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setUseCaseType("primary")}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                              useCaseType === "primary"
                                ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold shadow-xs"
                                : "border-border bg-surface text-muted hover:bg-surface-secondary"
                            }`}
                          >
                            <span className="size-2 rounded-full bg-amber-500" />
                            <span>Primario</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setUseCaseType("secondary")}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                              useCaseType === "secondary"
                                ? "border-purple-500 bg-purple-500/15 text-purple-900 dark:text-purple-200 font-semibold shadow-xs"
                                : "border-border bg-surface text-muted hover:bg-surface-secondary"
                            }`}
                          >
                            <span className="size-2 rounded-full bg-purple-500" />
                            <span>Secundario</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-muted mt-1.5">
                          {useCaseType === "primary"
                            ? "Cumple el objetivo central de un actor primario."
                            : "Subfunción o extensión de otro caso de uso detallado."}
                        </p>
                      </div>

                      {/* Enlace a otro CU Detallado si es Secundario */}
                      {useCaseType === "secondary" ? (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Enlazar a Caso de Uso Detallado Principal
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={parentDetailedUseCaseId}
                              onChange={(e) => setParentDetailedUseCaseId(e.target.value)}
                              className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                            >
                              <option value="">-- Seleccionar CU Principal --</option>
                              {otherDetailedUseCases.map((other) => (
                                <option key={other.id} value={other.id}>
                                  {other.name || "Sin nombre"} (
                                  {other.meta?.useCaseType === "secondary"
                                    ? "Secundario"
                                    : "Primario"}
                                  )
                                </option>
                              ))}
                            </select>
                            {parentElem && onSelectElement ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onPress={() => {
                                  onSelectElement(parentElem.id);
                                }}
                                title="Ir a la ficha del CU principal"
                              >
                                <Icon name="external" className="text-xs" />
                              </Button>
                            ) : null}
                          </div>
                          {parentElem ? (
                            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-medium">
                              <Icon name="link" className="text-xs" />
                              <span>Enlazado a: {parentElem.name}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted mt-1">
                              Selecciona a qué caso de uso principal pertenece esta subrutina o extensión.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-muted p-2 rounded-lg bg-surface border border-dashed border-border/80">
                          <Icon name="info" className="text-sm mr-2 text-amber-500 shrink-0" />
                          <span>
                            Este caso de uso es primario. Los casos de uso secundarios podrán enlazar directamente a este.
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-2" />

                    {/* Agrupación de Casos de Uso del Diagrama */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="text-xs font-semibold text-foreground block">
                            Casos de Uso Agrupados del Diagrama
                          </label>
                          <p className="text-[11px] text-muted">
                            Marca qué casos de uso del diagrama actual están documentados en este libro.
                          </p>
                        </div>
                        {groupedUseCaseIds.length > 0 ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={syncFromGroupedUseCases}
                            className="text-[11px] h-7 px-2.5 font-medium"
                          >
                            <Icon name="refresh" className="text-xs mr-1" />
                            <span>Cargar datos</span>
                          </Button>
                        ) : null}
                      </div>

                      {allUseCases.length === 0 ? (
                        <p className="text-xs text-muted italic bg-surface p-2 rounded-lg border border-border">
                          No hay casos de uso en el diagrama para agrupar. Añade óvalos de casos de uso primero.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1.5 bg-surface rounded-lg border border-border">
                          {allUseCases.map((uc) => {
                            const isChecked = groupedUseCaseIds.includes(uc.id);
                            return (
                              <label
                                key={uc.id}
                                className={`flex items-center gap-2 p-1.5 rounded-md text-xs cursor-pointer select-none transition-colors border ${
                                  isChecked
                                    ? "bg-accent/10 border-accent/40 text-foreground font-medium"
                                    : "hover:bg-surface-secondary border-transparent text-muted"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleGroupedUseCase(uc.id)}
                                  className="rounded border-border text-accent focus:ring-accent"
                                />
                                <span className="truncate">{uc.name || "Caso de uso"}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN 2: Los 11 Puntos de la Especificación Detallada */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Icon name="file" className="text-xs text-accent" />
                      <span>2. Campos de la Ficha Técnica (RUP / Cockburn)</span>
                    </h3>

                    {/* 1. Nombre del caso de uso */}
                    <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                      <label className="block text-xs font-bold text-foreground">
                        1. Nombre del caso de uso
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Procesar Pedido de Compra"
                        className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    {/* 2. Actor Principal */}
                    <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-foreground">
                          2. Actor Principal
                        </label>
                        <span className="text-[11px] text-muted">
                          Recurre a los servicios del sistema para cumplir un objetivo
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={actor}
                          onChange={(e) => setActor(e.target.value)}
                          placeholder="Ej: Cliente Registrado, Cajero, Administrador..."
                          className="flex-1 bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        {allActors.length > 0 ? (
                          <select
                            onChange={(e) => {
                              if (e.target.value) setActor(e.target.value);
                            }}
                            className="bg-surface-secondary border border-border rounded-lg px-2 text-xs text-muted hover:text-foreground focus:outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Insertar actor del diagrama...
                            </option>
                            {allActors.map((act) => (
                              <option key={act.id} value={act.name}>
                                {act.name}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    </div>

                    {/* 3. Personal involucrado e intereses */}
                    <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-foreground">
                          3. Personal involucrado e intereses
                        </label>
                        <span className="text-[11px] text-muted">
                          Intereses de los mismos en el sistema mediante este caso de uso
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={stakeholders}
                        onChange={(e) => setStakeholders(e.target.value)}
                        placeholder="Ej: Cliente: desea compras rápidas y seguras. Vendedor: asegurar cobro. Contabilidad: registro fiscal adecuado."
                        className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    {/* 4 & 5. Precondiciones y Postcondiciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Precondiciones */}
                      <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                        <label className="block text-xs font-bold text-foreground">
                          4. Precondiciones
                        </label>
                        <p className="text-[11px] text-muted leading-tight">
                          Establecen lo que siempre debe cumplirse antes de comenzar un escenario del caso de uso.
                        </p>
                        <textarea
                          rows={3}
                          value={preconditions}
                          onChange={(e) => setPreconditions(e.target.value)}
                          placeholder="Ej: El usuario ha iniciado sesión y tiene artículos en su carrito de compras."
                          className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent mt-1"
                        />
                      </div>

                      {/* Postcondiciones */}
                      <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                        <label className="block text-xs font-bold text-foreground">
                          5. Postcondiciones o garantías de éxito
                        </label>
                        <p className="text-[11px] text-muted leading-tight">
                          Establece el estado del sistema cuando el caso de uso se completa con éxito.
                        </p>
                        <textarea
                          rows={3}
                          value={postconditions}
                          onChange={(e) => setPostconditions(e.target.value)}
                          placeholder="Ej: El pago fue acreditado, se generó la factura y el inventario fue actualizado."
                          className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent mt-1"
                        />
                      </div>
                    </div>

                    {/* 6. Escenario Principal (Flujo Básico) */}
                    <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-foreground">
                          6. Escenario Principal (Flujo Básico / Operaciones)
                        </label>
                        <span className="text-[11px] text-muted">
                          Camino de éxito típico cuando "todo va bien"
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={mainScenario}
                        onChange={(e) => setMainScenario(e.target.value)}
                        placeholder={`1. El cliente pulsa el botón de checkout.\n2. El sistema muestra el resumen de compra y solicita la dirección de envío.\n3. El cliente confirma la dirección y selecciona el método de pago.\n4. El sistema procesa la transacción con la pasarela bancaria.\n5. El sistema emite la confirmación y envía el recibo por correo.`}
                        className="w-full font-mono text-xs leading-relaxed bg-field border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    {/* 7. Extensiones o Flujos Alternativos */}
                    <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-foreground">
                          7. Extensiones o Flujos Alternativos
                        </label>
                        <span className="text-[11px] text-muted">
                          Bifurcaciones de éxito y fracaso (condición y manejo)
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={alternativeFlows}
                        onChange={(e) => setAlternativeFlows(e.target.value)}
                        placeholder={`*a. En cualquier momento el cliente cancela la operación: el sistema guarda el carrito y vuelve al catálogo.\n4a. Tarjeta rechazada: el sistema notifica el error y solicita otro método de pago.\n4b. Tiempo de espera agotado: el sistema informa de la interrupción y permite reintentar.`}
                        className="w-full font-mono text-xs leading-relaxed bg-field border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    {/* 8 & 9. Requisitos especiales y Variaciones Técnicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Requisitos especiales */}
                      <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                        <label className="block text-xs font-bold text-foreground">
                          8. Requisitos especiales (no funcionales)
                        </label>
                        <p className="text-[11px] text-muted leading-tight">
                          Requisitos no funcionales y restricciones asociadas al caso de uso.
                        </p>
                        <textarea
                          rows={3}
                          value={specialRequirements}
                          onChange={(e) => setSpecialRequirements(e.target.value)}
                          placeholder="Ej: Tiempo de respuesta en cobro < 3s. Cumplimiento de estándar PCI-DSS."
                          className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent mt-1"
                        />
                      </div>

                      {/* Lista de tecnología y variaciones de datos */}
                      <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                        <label className="block text-xs font-bold text-foreground">
                          9. Lista de tecnología y variaciones de datos
                        </label>
                        <p className="text-[11px] text-muted leading-tight">
                          Variaciones técnicas de cómo debe hacerse algo.
                        </p>
                        <textarea
                          rows={3}
                          value={techVariations}
                          onChange={(e) => setTechVariations(e.target.value)}
                          placeholder="Ej: Pago con tarjeta de crédito, débito, PayPal o Apple Pay. Código de barras por escáner o entrada manual."
                          className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent mt-1"
                        />
                      </div>
                    </div>

                    {/* 10 & 11. Frecuencia y Temas Abiertos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Frecuencia */}
                      <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                        <label className="block text-xs font-bold text-foreground">
                          10. Frecuencia con la que se lleva a cabo
                        </label>
                        <input
                          type="text"
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          placeholder="Ej: Continuo, 500 veces al día, Semanal..."
                          className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      {/* Temas abiertos */}
                      <div className="rounded-xl border border-border p-3.5 bg-surface space-y-1">
                        <label className="block text-xs font-bold text-foreground">
                          11. Temas abiertos (preguntas / sugerencias)
                        </label>
                        <input
                          type="text"
                          value={openIssues}
                          onChange={(e) => setOpenIssues(e.target.value)}
                          placeholder="Ej: ¿Se admitirán cupones de descuento? ¿Requiere autenticación 2FA?"
                          className="w-full bg-field border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: VISTA FICHA FORMAL (TABLA RUP / COCKBURN) */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <p className="text-xs text-muted">
                      Previsualización en formato de tabla estándar de especificación formal de casos de uso.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onPress={copyMarkdown}>
                        <Icon name="copy" className="text-xs mr-1" />
                        <span>Copiar Markdown</span>
                      </Button>
                      <Button size="sm" variant="outline" onPress={handlePrint}>
                        <Icon name="download" className="text-xs mr-1" />
                        <span>Imprimir</span>
                      </Button>
                    </div>
                  </div>

                  {/* Tabla Formal Idéntica a la Imagen proporcionada */}
                  <div className="overflow-x-auto rounded-xl border-2 border-foreground/80 bg-surface shadow-md">
                    <table className="w-full border-collapse text-xs text-foreground">
                      <tbody>
                        {/* 1. Nombre */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="w-1/3 py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Nombre del caso de uso.
                          </td>
                          <td className="w-2/3 py-2.5 px-3.5 align-top font-semibold text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span>{name || "Caso de uso sin nombre"}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  useCaseType === "secondary"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300"
                                }`}
                              >
                                {useCaseType === "secondary"
                                  ? `Secundario${parentElem ? ` (Vinculado a: ${parentElem.name})` : ""}`
                                  : "Primario"}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* 2. Actor Principal */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Actor Principal. <span className="font-normal not-italic text-muted text-[11px] block">Recurre a los servicios del sistema para cumplir un objetivo.</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top">
                            {actor ? (
                              <strong className="text-foreground">{actor}</strong>
                            ) : (
                              <span className="text-muted italic">—</span>
                            )}
                          </td>
                        </tr>

                        {/* 3. Personal involucrado e intereses */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Personal involucrado e intereses de los mismos en el sistema, mediante ese caso de uso
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed">
                            {stakeholders || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>

                        {/* 4. Precondiciones */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Precondiciones, <span className="font-normal not-italic text-muted text-[11px] block">establecen lo que siempre debe cumplirse antes de comenzar un escenario del caso de uso.</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed">
                            {preconditions || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>

                        {/* 5. Postcondiciones */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Postcondiciones o garantías de éxito <span className="font-normal not-italic text-muted text-[11px] block">establece el estado del sistema cuando el caso de uso se completa con éxito</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed">
                            {postconditions || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>

                        {/* 6. Escenario Principal */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Escenario Principal <span className="font-normal not-italic text-muted text-[11px] block">se trata de los pasos del <em>Flujo Básico</em>, describe el camino de éxito típico, cuando "todo va bien" se le conoce también como <em>operaciones</em>.</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                            {mainScenario || <span className="text-muted font-sans italic">—</span>}
                          </td>
                        </tr>

                        {/* 7. Extensiones o Flujos Alternativos */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Extensiones o Flujos Alternativos, <span className="font-normal not-italic text-muted text-[11px] block">indican todas las otras bifurcaciones tanto de éxito como de fracaso. Una extensión tiene dos partes: la condición y el manejo y hacen referencia a pasos estipulados en el Flujo Básico.</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                            {alternativeFlows || <span className="text-muted font-sans italic">—</span>}
                          </td>
                        </tr>

                        {/* 8. Requisitos especiales */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Requisitos especiales, <span className="font-normal not-italic text-muted text-[11px] block">requisitos no funcionales, restricciones que se asocian a un caso de uso.</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed">
                            {specialRequirements || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>

                        {/* 9. Lista de tecnología y variaciones */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Lista de tecnología y variaciones de datos, <span className="font-normal not-italic text-muted text-[11px] block">variaciones técnicas de cómo debe hacerse algo.</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed">
                            {techVariations || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>

                        {/* 10. Frecuencia */}
                        <tr className="border-b border-foreground/60 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Frecuencia con la que se lleva cabo el caso de uso
                          </td>
                          <td className="py-2.5 px-3.5 align-top leading-relaxed">
                            {frequency || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>

                        {/* 11. Temas abiertos */}
                        <tr className="hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold italic border-r border-foreground/60 align-top bg-surface-secondary/40">
                            Temas abiertos <span className="font-normal not-italic text-muted text-[11px] block">para estipular posibles preguntas, sugerencias...</span>
                          </td>
                          <td className="py-2.5 px-3.5 align-top whitespace-pre-wrap leading-relaxed">
                            {openIssues || <span className="text-muted italic">—</span>}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="shrink-0 border-t border-border/70 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted hidden sm:inline">
                  {groupedUseCaseIds.length > 0
                    ? `Agrupa ${groupedUseCaseIds.length} caso(s) de uso`
                    : "Sin casos de uso agrupados"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onPress={handleSave}>
                  <Icon name="wand" className="text-xs mr-1" />
                  <span>Guardar Ficha</span>
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
