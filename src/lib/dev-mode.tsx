import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { DevDiagramMeta } from "./dev-diagrams";
import type { Project } from "./types";
import { notify } from "@/components/Toaster";

const ACTIVE_DEV_FILE_KEY = "4plus1:active-dev-file";

export interface DevModeApi {
  /** Indica si el modo de desarrollo está activado mediante .env.local */
  isDevEnabled: boolean;
  /** Nombre del archivo de prueba actualmente activo en el editor (ej: "ecommerce-4plus1.json") */
  activeDevFile: string | null;
  /** Lista de diagramas de prueba disponibles en disco */
  testDiagrams: DevDiagramMeta[];
  /** Indica si está cargando o guardando */
  loading: boolean;
  /** Marca de tiempo del último guardado en disco */
  lastSavedAt: string | null;
  /** Recarga la lista de diagramas desde el servidor */
  refreshList: () => Promise<void>;
  /** Carga un diagrama de prueba en el editor */
  loadDiagram: (id: string, onImport: (project: Project, opts?: { force?: boolean }) => void) => Promise<boolean>;
  /** Guarda el proyecto actual en el archivo JSON activo o en uno nuevo */
  saveCurrent: (project: Project, filename?: string) => Promise<boolean>;
  /** Elimina un archivo de diagrama de prueba del disco */
  deleteDiagram: (id: string) => Promise<boolean>;
  /** Desvincula el archivo activo (vuelve a modo proyecto libre) */
  detachActiveFile: () => void;
}

const DevModeContext = createContext<DevModeApi | null>(null);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [isDevEnabled, setIsDevEnabled] = useState<boolean>(() => {
    return Boolean(
      import.meta.env.DEV &&
      (import.meta.env.PUBLIC_DEV_MODE === "true" || import.meta.env.DEV_MODE === "true")
    );
  });

  const [activeDevFile, setActiveDevFileState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(ACTIVE_DEV_FILE_KEY);
  });

  const [testDiagrams, setTestDiagrams] = useState<DevDiagramMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const setActiveDevFile = useCallback((file: string | null) => {
    setActiveDevFileState(file);
    if (typeof window !== "undefined") {
      if (file) window.sessionStorage.setItem(ACTIVE_DEV_FILE_KEY, file);
      else window.sessionStorage.removeItem(ACTIVE_DEV_FILE_KEY);
    }
  }, []);

  // Consultar el estado real de la API al iniciar
  const checkStatus = useCallback(async () => {
    if (!import.meta.env.DEV) {
      setIsDevEnabled(false);
      return;
    }
    try {
      const res = await fetch("/api/dev/status");
      if (res.ok) {
        const data = await res.json();
        setIsDevEnabled(Boolean(data.enabled));
      } else {
        setIsDevEnabled(false);
      }
    } catch {
      setIsDevEnabled(false);
    }
  }, []);

  const refreshList = useCallback(async () => {
    if (!import.meta.env.DEV) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dev/diagrams");
      if (res.ok) {
        const data = await res.json();
        setTestDiagrams(data.items || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus().then(() => {
      refreshList();
    });
  }, [checkStatus, refreshList]);

  const loadDiagram = useCallback(
    async (id: string, onImport: (project: Project, opts?: { force?: boolean }) => void) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dev/diagrams/${encodeURIComponent(id)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "No se pudo cargar el archivo");
        }

        const data = await res.json();
        const project = data.project;
        if (!project) throw new Error("Archivo JSON no contiene un proyecto válido");

        onImport(project, { force: true });
        setActiveDevFile(data.filename);
        notify(`Diagrama cargado desde test-diagrams/${data.filename}`, "success");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        notify(msg, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setActiveDevFile],
  );

  const saveCurrent = useCallback(
    async (project: Project, filenameOverride?: string) => {
      const targetFilename = (filenameOverride || activeDevFile || project.name || "diagrama-prueba").trim();
      setLoading(true);
      try {
        const res = await fetch("/api/dev/diagrams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: targetFilename,
            project,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Error al guardar el archivo");
        }

        const data = await res.json();
        setActiveDevFile(data.filename);
        setLastSavedAt(new Date().toLocaleTimeString());
        notify(`Guardado en test-diagrams/${data.filename}`, "success");
        await refreshList();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        notify(msg, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [activeDevFile, setActiveDevFile, refreshList],
  );

  const deleteDiagram = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dev/diagrams/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "No se pudo eliminar el archivo");
        }

        if (activeDevFile && (activeDevFile === id || activeDevFile === `${id}.json`)) {
          setActiveDevFile(null);
        }

        notify(`Archivo ${id}.json eliminado de test-diagrams`, "info");
        await refreshList();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        notify(msg, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [activeDevFile, setActiveDevFile, refreshList],
  );

  const detachActiveFile = useCallback(() => {
    setActiveDevFile(null);
    notify("Diagrama desvinculado del archivo en disco", "info");
  }, [setActiveDevFile]);

  const value: DevModeApi = {
    isDevEnabled,
    activeDevFile,
    testDiagrams,
    loading,
    lastSavedAt,
    refreshList,
    loadDiagram,
    saveCurrent,
    deleteDiagram,
    detachActiveFile,
  };

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

export function useDevMode(): DevModeApi {
  const ctx = useContext(DevModeContext);
  if (!ctx) {
    // Fallback seguro si se usa fuera del Provider
    return {
      isDevEnabled: false,
      activeDevFile: null,
      testDiagrams: [],
      loading: false,
      lastSavedAt: null,
      refreshList: async () => {},
      loadDiagram: async () => false,
      saveCurrent: async () => false,
      deleteDiagram: async () => false,
      detachActiveFile: () => {},
    };
  }
  return ctx;
}
