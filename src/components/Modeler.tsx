import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { LanguageProvider } from "@/i18n";
import { ProjectProvider, useProject } from "@/lib/project-store";
import { DevModeProvider, useDevMode } from "@/lib/dev-mode";
import { Canvas } from "./Canvas";
import { Inspector } from "./Inspector";
import { LeftPanel } from "./LeftPanel";
import { SheetTabs } from "./SheetTabs";
import { Toaster } from "./Toaster";
import { TopBar } from "./TopBar";
import { useShareParam } from "./useShareParam";

function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  );
}

function Shell() {
  const {
    project,
    selection,
    removeElement,
    removeRelationship,
    duplicateElement,
    undo,
    redo,
    autoLayout,
    readOnly,
    clearAll,
  } = useProject();
  const devMode = useDevMode();
  useShareParam();

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

      // Ctrl+S / Cmd+S: Guardar directamente en archivo JSON en modo DEV
      if (modifier && key === "s") {
        if (devMode.isDevEnabled && devMode.activeDevFile) {
          event.preventDefault();
          devMode.saveCurrent(project);
          return;
        }
      }

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
  }, [selection, removeElement, removeRelationship, duplicateElement, undo, redo, autoLayout, readOnly, devMode, project]);

  const [mobileDrawer, setMobileDrawer] = useState<"left" | "right" | null>(null);

  return (
    <div className="app-shell">
      <TopBar
        onOpenMobileLeft={() => setMobileDrawer((prev) => (prev === "left" ? null : "left"))}
        onOpenMobileRight={() => setMobileDrawer((prev) => (prev === "right" ? null : "right"))}
      />
      <div className={readOnly ? "app-body app-body--presentation" : "app-body"}>
        {!readOnly ? (
          <LeftPanel
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
      <SheetTabs />
      <Toaster />
    </div>
  );
}

export function Modeler() {
  return (
    <LanguageProvider>
      <ProjectProvider>
        <DevModeProvider>
          <ReactFlowProvider>
            <Shell />
          </ReactFlowProvider>
        </DevModeProvider>
      </ProjectProvider>
    </LanguageProvider>
  );
}
