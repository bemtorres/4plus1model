import { useEffect, useState } from "react";
import { LanguageProvider } from "@/i18n";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace-store";
import { Canvas } from "./Canvas";
import { ExamplesDialog } from "./ExamplesDialog";
import { Inspector } from "./Inspector";
import { LeftPanel } from "./LeftPanel";
import { Toaster } from "./Toaster";
import { TopBar } from "./TopBar";
import { useExampleParam } from "./useExampleParam";
import { useShareParam } from "./useShareParam";

function isTyping(target: EventTarget | null): boolean {  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  );
}

function Shell() {
  const { selection, removeElement, removeRelationship, duplicateElement, undo, redo, autoLayout, readOnly, clearAll } =
    useWorkspace();
  const { openExample } = useExampleParam();
  useShareParam();
  const [examplesOpen, setExamplesOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      clearAll();
      params.delete("new");
      const query = params.toString();
      const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [clearAll]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (modifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (modifier && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (modifier && key === "l") {
        event.preventDefault();
        autoLayout();
        return;
      }
      if (modifier && key === "d") {
        if (!readOnly && selection?.type === "element") {
          event.preventDefault();
          duplicateElement(selection.id);
          return;
        }
      }

      if (isTyping(event.target)) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selection?.type === "element") removeElement(selection.id);
        else if (selection?.type === "relationship") removeRelationship(selection.id);
        else return;
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selection, removeElement, removeRelationship, duplicateElement, undo, redo, autoLayout, readOnly]);

  const [mobileDrawer, setMobileDrawer] = useState<"left" | "right" | null>(null);

  // Cerrar cajones móviles automáticamente cuando cambia la selección (si el usuario seleccionó algo en el lienzo)
  useEffect(() => {
    if (selection) {
      // Si seleccionó un elemento o relación, si no hay cajón abierto en móvil, el usuario puede abrir el inspector manualmente
    }
  }, [selection]);

  return (
    <div className="app-shell">
      <TopBar
        openExample={openExample}
        onOpenExamples={() => setExamplesOpen(true)}
        onOpenMobileLeft={() => setMobileDrawer((prev) => (prev === "left" ? null : "left"))}
        onOpenMobileRight={() => setMobileDrawer((prev) => (prev === "right" ? null : "right"))}
      />
      <div className={readOnly ? "app-body app-body--presentation" : "app-body"}>
        {!readOnly ? (
          <LeftPanel
            onOpenExamples={() => {
              setMobileDrawer(null);
              setExamplesOpen(true);
            }}
            onClose={() => setMobileDrawer(null)}
            isOpenMobile={mobileDrawer === "left"}
          />
        ) : null}
        <main className="relative min-h-0 bg-background flex-1">
          <Canvas />
          {/* Backdrop oscurecido para móvil cuando un menú/panel lateral está abierto */}
          {mobileDrawer && !readOnly ? (
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
              onClick={() => setMobileDrawer(null)}
              aria-label="Cerrar panel"
            />
          ) : null}
        </main>
        {!readOnly ? (
          <Inspector
            onClose={() => setMobileDrawer(null)}
            isOpenMobile={mobileDrawer === "right"}
          />
        ) : null}
      </div>
      <ExamplesDialog
        isOpen={examplesOpen}
        onOpenChange={setExamplesOpen}
        openExample={openExample}
      />
      <Toaster />
    </div>
  );
}

export function Modeler() {
  return (
    <LanguageProvider>
      <WorkspaceProvider>
        <Shell />
      </WorkspaceProvider>
    </LanguageProvider>
  );
}
