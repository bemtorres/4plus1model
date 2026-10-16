import type { ReactNode } from "react";
import type { DiagramElement, ElementKind } from "@/lib/types";

export interface ShapeDefinition {
  kind: ElementKind;
  name: string;
  category: "general" | "4plus1" | "connector" | "misc";
  tooltip: string;
  icon: ReactNode;
  extra?: Partial<DiagramElement>;
}

/** Iconos vectoriales SVG para la rejilla de formas estilo Draw.io (trazo limpio negro/gris). */
export const GENERAL_SHAPES: ShapeDefinition[] = [
  // Fila 1
  {
    kind: "rectangle",
    name: "Rectángulo",
    category: "general",
    tooltip: "Rectángulo básico",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="4" y="10" width="32" height="20" rx="1" />
      </svg>
    ),
  },
  {
    kind: "roundedRect",
    name: "Rect. redondeado",
    category: "general",
    tooltip: "Rectángulo con esquinas redondeadas",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="4" y="10" width="32" height="20" rx="6" />
      </svg>
    ),
  },
  {
    kind: "text",
    name: "Texto",
    category: "general",
    tooltip: "Caja de texto simple",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="currentColor">
        <text x="20" y="24" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
          Text
        </text>
      </svg>
    ),
  },
  {
    kind: "heading",
    name: "Encabezado",
    category: "general",
    tooltip: "Título o encabezado de sección",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="currentColor">
        <text x="8" y="15" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          Heading
        </text>
        <line x1="8" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="8" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="8" y1="28" x2="24" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      </svg>
    ),
  },
  {
    kind: "ellipse",
    name: "Elipse",
    category: "general",
    tooltip: "Elipse u óvalo",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <ellipse cx="20" cy="20" rx="16" ry="10" />
      </svg>
    ),
  },

  // Fila 2
  {
    kind: "square",
    name: "Cuadrado",
    category: "general",
    tooltip: "Cuadrado equilátero",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="8" y="8" width="24" height="24" rx="1" />
      </svg>
    ),
  },
  {
    kind: "circle",
    name: "Círculo",
    category: "general",
    tooltip: "Círculo perfecto",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="20" cy="20" r="13" />
      </svg>
    ),
  },
  {
    kind: "process",
    name: "Proceso",
    category: "general",
    tooltip: "Subrutina o proceso predefinido",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="4" y="11" width="32" height="18" rx="1" />
        <line x1="10" y1="11" x2="10" y2="29" />
        <line x1="30" y1="11" x2="30" y2="29" />
      </svg>
    ),
  },
  {
    kind: "diamond",
    name: "Rombo",
    category: "general",
    tooltip: "Rombo de decisión lógica",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="20,6 34,20 20,34 6,20" />
      </svg>
    ),
  },
  {
    kind: "parallelogram",
    name: "Paralelogramo",
    category: "general",
    tooltip: "Entrada / salida de datos",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="10,10 36,10 30,30 4,30" />
      </svg>
    ),
  },

  // Fila 3
  {
    kind: "hexagon",
    name: "Hexágono",
    category: "general",
    tooltip: "Hexágono de preparación",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="11,9 29,9 36,20 29,31 11,31 4,20" />
      </svg>
    ),
  },
  {
    kind: "triangle",
    name: "Triángulo",
    category: "general",
    tooltip: "Triángulo orientador",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="20,8 34,32 6,32" />
      </svg>
    ),
  },
  {
    kind: "cylinder",
    name: "Cilindro",
    category: "general",
    tooltip: "Base de datos / Almacén",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M8,12 C8,8 32,8 32,12 C32,16 8,16 8,12 Z" />
        <path d="M8,12 L8,28 C8,32 32,32 32,28 L32,12" />
      </svg>
    ),
  },
  {
    kind: "cloud",
    name: "Nube",
    category: "general",
    tooltip: "Red o servicio Cloud",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12,28 C8,28 6,24 8,20 C8,16 12,14 15,15 C17,10 24,9 27,13 C31,12 34,15 33,19 C36,21 35,26 31,28 Z" />
      </svg>
    ),
  },
  {
    kind: "document",
    name: "Documento",
    category: "general",
    tooltip: "Documento con corte ondulado",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6,8 L34,8 L34,28 C28,25 24,33 16,30 C12,28 9,30 6,28 Z" />
      </svg>
    ),
  },

  // Fila 4
  {
    kind: "table",
    name: "Tabla",
    category: "general",
    tooltip: "Tabla / Matriz",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="6" y="8" width="28" height="24" rx="1" />
        <line x1="6" y1="16" x2="34" y2="16" />
        <line x1="16" y1="8" x2="16" y2="32" />
      </svg>
    ),
  },
  {
    kind: "cube",
    name: "Cubo 3D",
    category: "general",
    tooltip: "Cubo isométrico 3D / Servidor",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="20,6 34,13 20,20 6,13" />
        <polygon points="6,13 20,20 20,34 6,27" />
        <polygon points="20,20 34,13 34,27 20,34" />
      </svg>
    ),
  },
  {
    kind: "trapezoid",
    name: "Trapecio",
    category: "general",
    tooltip: "Operación manual",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="6,29 11,11 29,11 34,29" />
      </svg>
    ),
  },
  {
    kind: "note",
    name: "Nota",
    category: "general",
    tooltip: "Nota con esquina doblada",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M8,6 L26,6 L32,12 L32,34 L8,34 Z" />
        <polyline points="26,6 26,12 32,12" />
      </svg>
    ),
  },
  {
    kind: "callout",
    name: "Bocadillo",
    category: "general",
    tooltip: "Bocadillo de diálogo / Callout",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6,8 L34,8 L34,26 L20,26 L12,34 L12,26 L6,26 Z" />
      </svg>
    ),
  },

  // Fila 5
  {
    kind: "actor",
    name: "Actor",
    category: "general",
    tooltip: "Figura de palito / Actor UML",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="20" cy="10" r="4" />
        <line x1="20" y1="14" x2="20" y2="25" />
        <line x1="12" y1="18" x2="28" y2="18" />
        <line x1="20" y1="25" x2="13" y2="35" />
        <line x1="20" y1="25" x2="27" y2="35" />
      </svg>
    ),
  },
  {
    kind: "window",
    name: "Ventana",
    category: "general",
    tooltip: "Ventana / Marco de aplicación",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="6" y="8" width="28" height="24" rx="2" />
        <line x1="6" y1="14" x2="34" y2="14" />
        <circle cx="10" cy="11" r="1" fill="currentColor" />
        <circle cx="13" cy="11" r="1" fill="currentColor" />
        <circle cx="16" cy="11" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    kind: "folder",
    name: "Carpeta",
    category: "general",
    tooltip: "Carpeta de archivos o paquete",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6,10 L16,10 L19,14 L34,14 L34,30 L6,30 Z" />
      </svg>
    ),
  },
  {
    kind: "arrowRight",
    name: "Flecha ancha",
    category: "general",
    tooltip: "Flecha gruesa indicadora",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="6,15 22,15 22,9 34,20 22,31 22,25 6,25" />
      </svg>
    ),
  },
  {
    kind: "system",
    name: "Límite / Sistema",
    category: "general",
    tooltip: "Frontera contenedora del sistema",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2">
        <rect x="6" y="8" width="28" height="24" rx="2" />
      </svg>
    ),
  },
];

/** Formas del Modelo 4+1 organizadas por vista. */
export const FOUR_PLUS_ONE_SHAPES: {
  viewId: string;
  viewName: string;
  shapes: ShapeDefinition[];
}[] = [
  {
    viewId: "scenarios",
    viewName: "Escenarios (+1)",
    shapes: [
      {
        kind: "actor",
        name: "Actor",
        category: "4plus1",
        tooltip: "Actor primario o secundario",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="20" cy="10" r="4" />
            <line x1="20" y1="14" x2="20" y2="25" />
            <line x1="12" y1="18" x2="28" y2="18" />
            <line x1="20" y1="25" x2="13" y2="35" />
            <line x1="20" y1="25" x2="27" y2="35" />
          </svg>
        ),
      },
      {
        kind: "useCase",
        name: "Caso de Uso (Óvalo)",
        category: "4plus1",
        tooltip: "Actividad o caso de uso en forma de óvalo UML",
        extra: { radius: 9999 },
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <ellipse cx="20" cy="20" rx="16" ry="10" />
            <text x="20" y="22" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">
              UC
            </text>
          </svg>
        ),
      },
      {
        kind: "useCase",
        name: "Actividad (Rect. redondeado)",
        category: "4plus1",
        tooltip: "Actividad o caso de uso en rectángulo redondeado UML",
        extra: { radius: 16, name: "Actividad" },
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="5" y="10" width="30" height="20" rx="5" />
            <text x="20" y="22" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">
              ACT
            </text>
          </svg>
        ),
      },
      {
        kind: "system",
        name: "Frontera Sistema",
        category: "4plus1",
        tooltip: "Límite del sistema bajo estudio",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="5" y="6" width="30" height="28" rx="2" strokeDasharray="3 2" />
            <rect x="5" y="6" width="30" height="8" fill="currentColor" fillOpacity="0.1" />
          </svg>
        ),
      },
      {
        kind: "step",
        name: "Paso de Flujo",
        category: "4plus1",
        tooltip: "Paso individual de un caso de uso",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="6" y="13" width="28" height="14" rx="4" />
            <path d="M12,20 L28,20 M24,16 L28,20 L24,24" />
          </svg>
        ),
      },
    ],
  },
  {
    viewId: "logical",
    viewName: "Vista Lógica",
    shapes: [
      {
        kind: "class",
        name: "Clase UML",
        category: "4plus1",
        tooltip: "Clase con compartimentos de atributos y métodos",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="6" y="6" width="28" height="28" rx="1" />
            <line x1="6" y1="15" x2="34" y2="15" />
            <line x1="6" y1="24" x2="34" y2="24" />
          </svg>
        ),
      },
      {
        kind: "interface",
        name: "Interfaz UML",
        category: "4plus1",
        tooltip: "Contrato de interfaz",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="6" y="8" width="28" height="24" rx="1" strokeDasharray="3 2" />
            <line x1="6" y1="16" x2="34" y2="16" />
          </svg>
        ),
      },
      {
        kind: "domainEntity",
        name: "Entidad Dominio",
        category: "4plus1",
        tooltip: "Entidad de dominio DDD",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="6" y="8" width="28" height="24" rx="2" />
            <circle cx="20" cy="18" r="5" />
          </svg>
        ),
      },
      {
        kind: "subsystem",
        name: "Subsistema",
        category: "4plus1",
        tooltip: "Módulo lógico de alto nivel",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="6" y="6" width="28" height="28" rx="1" />
            <rect x="10" y="10" width="8" height="8" rx="1" />
            <rect x="22" y="10" width="8" height="8" rx="1" />
            <rect x="10" y="22" width="20" height="8" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    viewId: "process",
    viewName: "Vista de Procesos",
    shapes: [
      {
        kind: "process",
        name: "Proceso Activo",
        category: "4plus1",
        tooltip: "Proceso del sistema operativo",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="5" y="10" width="30" height="20" rx="4" />
            <circle cx="12" cy="20" r="3" fill="currentColor" />
          </svg>
        ),
      },
      {
        kind: "thread",
        name: "Hilo (Thread)",
        category: "4plus1",
        tooltip: "Hilo de ejecución ligero",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M10,20 Q15,10 20,20 T30,20" />
            <circle cx="30" cy="20" r="2" fill="currentColor" />
          </svg>
        ),
      },
      {
        kind: "queue",
        name: "Cola / Queue",
        category: "4plus1",
        tooltip: "Cola de mensajes o buffer",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="6" y="12" width="28" height="16" rx="2" />
            <line x1="12" y1="12" x2="12" y2="28" />
            <line x1="18" y1="12" x2="18" y2="28" />
            <line x1="24" y1="12" x2="24" y2="28" />
          </svg>
        ),
      },
      {
        kind: "eventStream",
        name: "Event Stream",
        category: "4plus1",
        tooltip: "Tópico o canal continuo de eventos",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6,20 C12,12 18,28 24,16 C28,10 32,20 34,20" />
          </svg>
        ),
      },
    ],
  },
  {
    viewId: "development",
    viewName: "Vista de Desarrollo",
    shapes: [
      {
        kind: "component",
        name: "Componente",
        category: "4plus1",
        tooltip: "Componente de software empaquetado",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="10" y="8" width="24" height="24" rx="1" />
            <rect x="6" y="12" width="8" height="5" rx="1" fill="var(--surface, #fff)" />
            <rect x="6" y="23" width="8" height="5" rx="1" fill="var(--surface, #fff)" />
          </svg>
        ),
      },
      {
        kind: "module",
        name: "Módulo / Paquete",
        category: "4plus1",
        tooltip: "Módulo o paquete de código fuente",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6,10 L16,10 L19,14 L34,14 L34,30 L6,30 Z" />
          </svg>
        ),
      },
      {
        kind: "layer",
        name: "Capa de Código",
        category: "4plus1",
        tooltip: "Capa arquitectónica horizontal",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="6" y="10" width="28" height="8" rx="1" />
            <rect x="6" y="22" width="28" height="8" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    viewId: "physical",
    viewName: "Vista Física",
    shapes: [
      {
        kind: "node",
        name: "Servidor / Nodo",
        category: "4plus1",
        tooltip: "Servidor físico o bare-metal",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="6" y="8" width="28" height="10" rx="1" />
            <circle cx="10" cy="13" r="1.5" fill="currentColor" />
            <rect x="6" y="22" width="28" height="10" rx="1" />
            <circle cx="10" cy="27" r="1.5" fill="currentColor" />
          </svg>
        ),
      },
      {
        kind: "virtualMachine",
        name: "Máquina Virtual",
        category: "4plus1",
        tooltip: "Instancia VM o Cloud Compute",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <polygon points="20,6 34,13 20,20 6,13" />
            <polygon points="6,13 20,20 20,34 6,27" />
            <polygon points="20,20 34,13 34,27 20,34" />
          </svg>
        ),
      },
      {
        kind: "container",
        name: "Contenedor Docker",
        category: "4plus1",
        tooltip: "Contenedor o Pod K8s",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="8" y="12" width="24" height="16" rx="2" />
            <line x1="14" y1="12" x2="14" y2="28" />
            <line x1="20" y1="12" x2="20" y2="28" />
            <line x1="26" y1="12" x2="26" y2="28" />
            <line x1="8" y1="20" x2="32" y2="20" />
          </svg>
        ),
      },
      {
        kind: "loadBalancer",
        name: "Balanceador",
        category: "4plus1",
        tooltip: "Load Balancer de tráfico de red",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <polygon points="20,8 32,20 20,32 8,20" />
            <line x1="14" y1="20" x2="26" y2="20" />
          </svg>
        ),
      },
      {
        kind: "networkZone",
        name: "Zona de Red / VPC",
        category: "4plus1",
        tooltip: "VPC, Subred o zona perimetral DMZ",
        icon: (
          <svg viewBox="0 0 40 40" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2">
            <rect x="6" y="8" width="28" height="24" rx="2" />
          </svg>
        ),
      },
    ],
  },
];
