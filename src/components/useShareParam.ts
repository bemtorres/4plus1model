import { useEffect, useState } from "react";
import { clearShareParams, decodeWorkspace, isReadOnlyFromUrl, readSharePayload } from "@/lib/share";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { notify } from "./Toaster";

/**
 * Carga un diagrama compartido (`?share=<payload>` o `?jwt=<token>`) o gestiona el modo bloqueado (`?edit=0`):
 * - con `?edit=0` o `?edit=false` (o compartido sin `edit=1`) se abre en **solo lectura** y oculta el modo edición;
 * - con `?edit=1` o `?edit=true` se abre en modo edición completo.
 */
export function useShareParam() {
  const { importWorkspace, readOnly, setReadOnly } = useWorkspace();
  const t = useT();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sincronizar estado inicial según la URL
    setReadOnly(isReadOnlyFromUrl());

    const onPopState = () => {
      setReadOnly(isReadOnlyFromUrl());
    };
    window.addEventListener("popstate", onPopState);

    const shared = readSharePayload();
    if (!shared) {
      return () => {
        window.removeEventListener("popstate", onPopState);
      };
    }

    let cancelled = false;
    decodeWorkspace(shared.payload).then((workspace) => {
      if (cancelled) return;
      if (!workspace) {
        setError(t("share.invalid"));
        clearShareParams();
        return;
      }
      importWorkspace(workspace, { force: true });
      setReadOnly(!shared.editable);
      if (!shared.editable) notify(t("share.loadedReadOnly", { name: workspace.name }), "info");
    });

    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { readOnly, setReadOnly, error };
}
