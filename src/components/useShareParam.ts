import { useEffect, useState } from "react";
import { clearShareParams, decodeWorkspace, readSharePayload } from "@/lib/share";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { notify } from "./Toaster";

/**
 * Carga un diagrama compartido (`?share=<payload>`):
 * - sin `?edit=1` se abre en **solo lectura** y no se guarda en el navegador,
 *   para no pisar el trabajo de quien lo recibe;
 * - con `?edit=1` se abre una copia editable (nueva pestaña) que sí se guarda.
 */
export function useShareParam() {
  const { importWorkspace, readOnly, setReadOnly } = useWorkspace();
  const t = useT();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const shared = readSharePayload();
    if (!shared) return;

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { readOnly, setReadOnly, error };
}
