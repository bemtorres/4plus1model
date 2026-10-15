import fs from "node:fs";
import path from "node:path";
import type { Project } from "./types";
import { normalizeProject } from "./storage";

export interface DevDiagramMeta {
  id: string;
  filename: string;
  name: string;
  description: string;
  updatedAt: string;
  sheetCount: number;
  elementCount: number;
  relationshipCount: number;
  sizeBytes: number;
}

/** Comprueba si el modo dev está habilitado en .env.local */
export function isDevEditionEnabled(): boolean {
  // Solo se permite en modo desarrollo (no producción)
  if (!import.meta.env.DEV) {
    return false;
  }

  // 1. Verificar variables de entorno del proceso
  if (process.env.PUBLIC_DEV_MODE === "true" || process.env.DEV_MODE === "true") {
    return true;
  }

  // 2. Leer directamente .env.local para hot-reloading inmediato
  try {
    const envLocalPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      return /^\s*(PUBLIC_DEV_MODE|DEV_MODE)\s*=\s*(true|1)\s*$/im.test(content);
    }
  } catch {
    /* ignore */
  }

  return false;
}

/** Devuelve la ruta absoluta a la carpeta de diagramas de prueba */
export function getTestDiagramsDir(): string {
  const dir = path.join(process.cwd(), "test-diagrams");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Sanitiza el nombre de archivo para evitar accesos indebidos fuera de test-diagrams */
export function sanitizeFilename(raw: string): string {
  let clean = raw.trim().replace(/\.json$/i, "");
  // Reemplazar caracteres no alfanuméricos por guiones
  clean = clean.replace(/[^a-zA-Z0-9_\-]/g, "-").toLowerCase();
  clean = clean.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return (clean || "diagrama-prueba") + ".json";
}

/** Lista todos los diagramas de prueba en JSON disponibles */
export function listTestDiagrams(): DevDiagramMeta[] {
  const dir = getTestDiagramsDir();
  seedInitialTestDiagramsIfEmpty(dir);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const items: DevDiagramMeta[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const stats = fs.statSync(fullPath);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const parsed = JSON.parse(raw);
      const projectPayload = parsed.project ?? parsed;

      let elementCount = 0;
      let relationshipCount = 0;
      const sheets = Array.isArray(projectPayload.sheets) ? projectPayload.sheets : [];

      for (const s of sheets) {
        elementCount += Array.isArray(s.elements) ? s.elements.length : 0;
        relationshipCount += Array.isArray(s.relationships) ? s.relationships.length : 0;
      }

      items.push({
        id: file.replace(/\.json$/, ""),
        filename: file,
        name: String(projectPayload.name || file.replace(/\.json$/, "")),
        description: String(projectPayload.description || ""),
        updatedAt: String(projectPayload.updatedAt || stats.mtime.toISOString()),
        sheetCount: sheets.length,
        elementCount,
        relationshipCount,
        sizeBytes: stats.size,
      });
    } catch {
      /* archivo no válido */
    }
  }

  // Ordenar los más recientes primero
  items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return items;
}

/** Lee y normaliza un diagrama de prueba desde disco */
export function readTestDiagram(id: string): { filename: string; project: Project } {
  const dir = getTestDiagramsDir();
  const filename = sanitizeFilename(id);
  const fullPath = path.join(dir, filename);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Diagrama de prueba "${filename}" no encontrado en test-diagrams`);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  const candidate = parsed.project ?? parsed;
  const project = normalizeProject(candidate);

  return { filename, project };
}

/** Guarda o actualiza un diagrama de prueba en disco */
export function writeTestDiagram(
  targetId: string,
  projectData: unknown,
): { filename: string; id: string; updatedAt: string } {
  const dir = getTestDiagramsDir();
  const filename = sanitizeFilename(targetId);
  const fullPath = path.join(dir, filename);

  const normalized = normalizeProject(projectData);
  const updatedAt = new Date().toISOString();
  normalized.updatedAt = updatedAt;

  const filePayload = {
    format: "4plus1-project",
    version: 1,
    savedAt: updatedAt,
    project: normalized,
  };

  fs.writeFileSync(fullPath, JSON.stringify(filePayload, null, 2), "utf-8");

  return {
    filename,
    id: filename.replace(/\.json$/, ""),
    updatedAt,
  };
}

/** Elimina un diagrama de prueba de disco */
export function deleteTestDiagram(id: string): boolean {
  const dir = getTestDiagramsDir();
  const filename = sanitizeFilename(id);
  const fullPath = path.join(dir, filename);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
}

/** Si el directorio está vacío, añade diagramas de prueba iniciales */
function seedInitialTestDiagramsIfEmpty(dir: string): void {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  if (files.length > 0) return;

  const sample1 = {
    format: "4plus1-project",
    version: 1,
    savedAt: new Date().toISOString(),
    project: {
      id: "pr_ecommerce_4p1",
      name: "Plataforma E-Commerce (Modelo 4+1)",
      description: "Ejemplo completo de arquitectura 4+1 con Vistas de Escenarios, Lógica, Proceso, Desarrollo y Física.",
      updatedAt: new Date().toISOString(),
      sheets: [
        {
          id: "sh_usecase",
          name: "1. Escenarios (+1)",
          diagram: "usecase",
          view: { level: "actors", scopeId: null },
          elements: [
            {
              id: "el_actor_cliente",
              kind: "actor",
              name: "Cliente Final",
              description: "Usuario registrado o invitado que busca productos y realiza compras.",
              x: 120,
              y: 180,
              icon: "user",
              tags: ["externo", "primario"],
            },
            {
              id: "el_actor_admin",
              kind: "actor",
              name: "Administrador",
              description: "Gestiona el catálogo de productos y supervisa inventario.",
              x: 120,
              y: 400,
              icon: "shield",
              tags: ["interno"],
            },
            {
              id: "el_sys_ecommerce",
              kind: "system",
              name: "Sistema E-Commerce",
              description: "Límite del sistema bajo estudio.",
              x: 320,
              y: 120,
              width: 500,
              height: 380,
              tags: ["sistema"],
            },
            {
              id: "el_uc_comprar",
              kind: "useCase",
              name: "Realizar Compra",
              description: "Proceso completo desde añadir artículos al carrito hasta el cobro.",
              x: 400,
              y: 180,
              parentId: "el_sys_ecommerce",
              tags: ["critico"],
            },
            {
              id: "el_uc_catalogo",
              kind: "useCase",
              name: "Buscar Catálogo",
              description: "Filtrado y consulta rápida de artículos en stock.",
              x: 400,
              y: 280,
              parentId: "el_sys_ecommerce",
              tags: ["publico"],
            },
            {
              id: "el_uc_gestion",
              kind: "useCase",
              name: "Gestionar Inventario",
              description: "Actualizar precios y stock de productos.",
              x: 400,
              y: 380,
              parentId: "el_sys_ecommerce",
              tags: ["admin"],
            },
          ],
          relationships: [
            {
              id: "rel_1",
              source: "el_actor_cliente",
              target: "el_uc_comprar",
              style: "association",
              label: "Inicia compra",
              description: "Checkout",
            },
            {
              id: "rel_2",
              source: "el_actor_cliente",
              target: "el_uc_catalogo",
              style: "association",
              label: "Consulta",
              description: "",
            },
            {
              id: "rel_3",
              source: "el_actor_admin",
              target: "el_uc_gestion",
              style: "association",
              label: "Actualiza",
              description: "",
            },
          ],
        },
        {
          id: "sh_logical",
          name: "2. Vista Lógica",
          diagram: "logical",
          view: { level: "container", scopeId: null },
          elements: [
            {
              id: "el_log_gateway",
              kind: "container",
              name: "API Gateway",
              description: "Enrutamiento, autenticación JWT y limitación de tasa.",
              x: 150,
              y: 200,
              icon: "globe",
              tags: ["edge"],
            },
            {
              id: "el_log_orders",
              kind: "container",
              name: "Servicio de Pedidos",
              description: "Gestión del ciclo de vida de compras y carritos.",
              x: 420,
              y: 150,
              icon: "cart",
              tags: ["core"],
            },
            {
              id: "el_log_catalog",
              kind: "container",
              name: "Servicio de Catálogo",
              description: "Gestión de artículos y categorías.",
              x: 420,
              y: 280,
              icon: "box",
              tags: ["core"],
            },
            {
              id: "el_log_db_orders",
              kind: "database",
              name: "DB Pedidos (PostgreSQL)",
              description: "Almacén relacional con soporte ACID.",
              x: 720,
              y: 150,
              icon: "database",
              tags: ["storage"],
            },
            {
              id: "el_log_cache_catalog",
              kind: "database",
              name: "Redis Cache",
              description: "Caché en memoria para catálogo de alta lectura.",
              x: 720,
              y: 280,
              icon: "database",
              tags: ["cache"],
            },
          ],
          relationships: [
            {
              id: "rel_log_1",
              source: "el_log_gateway",
              target: "el_log_orders",
              style: "sync",
              label: "HTTPS/REST",
              description: "",
            },
            {
              id: "rel_log_2",
              source: "el_log_gateway",
              target: "el_log_catalog",
              style: "sync",
              label: "HTTPS/REST",
              description: "",
            },
            {
              id: "rel_log_3",
              source: "el_log_orders",
              target: "el_log_db_orders",
              style: "sync",
              label: "TCP / SQL",
              description: "",
            },
            {
              id: "rel_log_4",
              source: "el_log_catalog",
              target: "el_log_cache_catalog",
              style: "sync",
              label: "TCP / Redis",
              description: "",
            },
          ],
        },
        {
          id: "sh_process",
          name: "3. Vista de Procesos",
          diagram: "process",
          view: { level: "container", scopeId: null },
          elements: [
            {
              id: "el_proc_producer",
              kind: "container",
              name: "Productor de Eventos",
              description: "Publica eventos de pedidos completados.",
              x: 150,
              y: 200,
              icon: "cart",
              tags: ["producer"],
            },
            {
              id: "el_proc_queue",
              kind: "queue",
              name: "Kafka: order-events",
              description: "Tópico particionado para eventos de compra.",
              x: 420,
              y: 200,
              icon: "queue",
              tags: ["event-bus"],
            },
            {
              id: "el_proc_consumer",
              kind: "container",
              name: "Worker de Pagos & Envíos",
              description: "Consume eventos asíncronamente y despacha cobros.",
              x: 700,
              y: 200,
              icon: "server",
              tags: ["consumer"],
            },
          ],
          relationships: [
            {
              id: "rel_proc_1",
              source: "el_proc_producer",
              target: "el_proc_queue",
              style: "async",
              label: "Publica OrderCreated",
              description: "",
            },
            {
              id: "rel_proc_2",
              source: "el_proc_queue",
              target: "el_proc_consumer",
              style: "async",
              label: "Consume evento",
              description: "",
            },
          ],
        },
      ],
    },
  };

  try {
    const f1 = path.join(dir, "ecommerce-4plus1.json");
    fs.writeFileSync(f1, JSON.stringify(sample1, null, 2), "utf-8");
  } catch {
    /* ignore */
  }
}
