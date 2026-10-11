import { useCallback, useEffect, useRef } from "react";
import { buildWorkspaceFor, findExampleByCode, type ExampleTarget } from "@/lib/examples";
import { clearExampleCode, readExampleCode, setExampleCode } from "@/lib/examples/url";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { notify } from "./Toaster";

/**
 * Sincroniza el parámetro `?code=` con el workspace:
 * - al abrir la página carga el ejemplo indicado (si existe);
 * - `openExample` lo abre en una pestaña nueva con su propio enlace;
 * - si el usuario edita el modelo, el parámetro se limpia para no perder
 *   el trabajo al recargar;
 * - el botón "atrás" del navegador vuelve al ejemplo anterior.
 */
export function useExampleParam() {
  const { workspace, importWorkspace } = useWorkspace();
  const t = useT();
  const appliedRef = useRef<string | null>(null);
  const baselineRef = useRef<string | null>(null);
  const pendingRef = useRef(0);

  const apply = useCallback(
    (code: string, silent = false) => {
      const target: ExampleTarget | null = findExampleByCode(code);
      if (!target) {
        clearExampleCode("replace");
        notify(t("examples.notFound", { code }), "danger");
        return false;
      }
      pendingRef.current += 1;
      importWorkspace(buildWorkspaceFor(target));
      appliedRef.current = target.code;
      setExampleCode(target.code, "replace");
      if (!silent) notify(t("import.done", { name: target.code }), "success");
      return true;
    },
    [importWorkspace, t],
  );

  // 1. Al arrancar: aplica el código de la URL (una sola vez por código).
  useEffect(() => {
    const code = readExampleCode();
    if (code) apply(code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Botón atrás / adelante del navegador.
  useEffect(() => {
    const onPopState = () => {
      const code = readExampleCode();
      if (!code || code === appliedRef.current) return;
      apply(code, true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [apply]);

  // 3. Si el usuario edita el modelo, el enlace deja de forzar un ejemplo.
  useEffect(() => {
    if (baselineRef.current === null) {
      baselineRef.current = workspace.updatedAt;
      return;
    }
    if (pendingRef.current > 0) {
      // El cambio que acabamos de aplicar desde la URL no cuenta como edición.
      pendingRef.current -= 1;
      baselineRef.current = workspace.updatedAt;
      return;
    }
    if (baselineRef.current === workspace.updatedAt) return;
    baselineRef.current = workspace.updatedAt;
    if (appliedRef.current) clearExampleCode("replace");
  }, [workspace.updatedAt]);

  /** Abre el ejemplo en una pestaña nueva con `?code=<código>`. */
  const openExample = useCallback((code: string) => {
    const target = findExampleByCode(code);
    if (!target) {
      notify(t("examples.notFound", { code }), "danger");
      return;
    }
    const url = new URL(window.location.href);
    url.search = `?code=${encodeURIComponent(target.code)}`;
    url.hash = "";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }, [t]);

  return { openExample };
}
