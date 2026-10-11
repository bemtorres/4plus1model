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
  const { selection, removeElement, removeRelationship, undo, redo, autoLayout, readOnly } =
    useWorkspace();
  const { openExample } = useExampleParam();
  useShareParam();
  const [examplesOpen, setExamplesOpen] = useState(false);

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
  }, [selection, removeElement, removeRelationship, undo, redo, autoLayout]);

  return (
    <div className="app-shell">
      <TopBar openExample={openExample} onOpenExamples={() => setExamplesOpen(true)} />
      <div className="app-body">
        <LeftPanel onOpenExamples={() => setExamplesOpen(true)} />
        <main className="relative min-h-0 bg-background">
          <Canvas />
        </main>
        <Inspector />
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
