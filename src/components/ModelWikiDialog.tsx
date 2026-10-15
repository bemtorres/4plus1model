import { Button, Modal } from "@heroui/react";
import { useState } from "react";
import { Icon } from "./icons";
import type { DiagramId } from "@/lib/types";

interface WikiSection {
  id: DiagramId | "intro";
  title: string;
  badge: string;
  icon: "diagram" | "target" | "blocks" | "cube" | "queue" | "layers";
  summary: string;
  elements: {
    name: string;
    icon: string;
    elementKind?: "actor" | "usecase" | "system" | "step" | "class" | "component" | "node" | "queue";
    description: string;
    notation?: string;
  }[];
  relationships: {
    name: string;
    type: string;
    lineStyle: string;
    description: string;
  }[];
  rules: string[];
  example: string;
}

/**
 * Previsualización gráfica realista del elemento (el personaje stickman, el óvalo, la caja del sistema, etc.)
 */
function ElementVisualPreview({
  icon,
  kind,
}: {
  icon: string;
  kind?: string;
}) {
  if (kind === "actor") {
    return (
      <div
        className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent border border-accent/30 shadow-xs"
        title="Actor UML (Personaje)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-6">
          {/* Cabeza */}
          <circle cx="12" cy="5" r="3" />
          {/* Tronco */}
          <line x1="12" y1="8" x2="12" y2="15" />
          {/* Brazos */}
          <line x1="6" y1="11" x2="18" y2="11" />
          {/* Piernas */}
          <line x1="12" y1="15" x2="7" y2="21" />
          <line x1="12" y1="15" x2="17" y2="21" />
        </svg>
      </div>
    );
  }

  if (kind === "usecase") {
    return (
      <div
        className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent border border-accent/30 shadow-xs"
        title="Caso de Uso (Óvalo UML)"
      >
        <svg viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-5">
          <ellipse cx="14" cy="10" rx="12" ry="7" />
        </svg>
      </div>
    );
  }

  if (kind === "system") {
    return (
      <div
        className="grid size-10 place-items-center rounded-xl bg-surface-secondary text-foreground border border-border shadow-xs"
        title="Límite del Sistema (Frontera)"
      >
        <svg viewBox="0 0 26 22" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-5">
          <rect x="2" y="2" width="22" height="18" rx="2" strokeDasharray="3 2" />
          <line x1="2" y1="7" x2="24" y2="7" />
        </svg>
      </div>
    );
  }

  if (kind === "step") {
    return (
      <div
        className="grid size-10 place-items-center rounded-xl bg-surface-secondary text-foreground border border-border shadow-xs"
        title="Paso de Flujo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5">
          <circle cx="6" cy="12" r="3" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <polyline points="13 9 16 12 13 15" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </div>
    );
  }

  return (
    <span className="grid size-10 place-items-center rounded-xl bg-surface-secondary text-foreground border border-border shadow-xs">
      <Icon name={icon as any} className="size-5" />
    </span>
  );
}

/**
 * Previsualización SVG del trazo real de la relación UML (línea continua, discontinua con flecha, triángulo hueco, rombo, etc.)
 */
function RelationLinePreview({ type }: { type: string }) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 2,
    fill: "none",
  } as const;

  if (type === "association") {
    return (
      <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
        {/* Línea continua sólida */}
        <line x1="4" y1="11" x2="80" y2="11" {...stroke} />
      </svg>
    );
  }

  if (type === "include" || type === "extend") {
    return (
      <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
        {/* Línea discontinua con flecha abierta */}
        <line x1="4" y1="11" x2="68" y2="11" {...stroke} strokeDasharray="5 4" />
        <path d="M68 6 L78 11 L68 16" {...stroke} />
      </svg>
    );
  }

  if (type === "generalization" || type === "realization") {
    const isDashed = type === "realization";
    return (
      <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
        {/* Línea continua o discontinua con triángulo hueco */}
        <line x1="4" y1="11" x2="68" y2="11" {...stroke} strokeDasharray={isDashed ? "5 4" : undefined} />
        <path d="M68 5 L80 11 L68 17 Z" stroke="currentColor" strokeWidth={1.75} fill="var(--surface)" />
      </svg>
    );
  }

  if (type === "composition" || type === "aggregation") {
    const isFilled = type === "composition";
    return (
      <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
        {/* Rombo lleno o hueco */}
        <path
          d="M6 11 L13 6 L20 11 L13 16 Z"
          stroke="currentColor"
          strokeWidth={1.75}
          fill={isFilled ? "currentColor" : "var(--surface)"}
        />
        <line x1="20" y1="11" x2="80" y2="11" {...stroke} />
      </svg>
    );
  }

  if (type === "asyncMessage") {
    return (
      <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
        {/* Flecha abierta discontinua */}
        <line x1="4" y1="11" x2="70" y2="11" {...stroke} strokeDasharray="4 3" />
        <path d="M70 6 L79 11 L70 16" {...stroke} />
      </svg>
    );
  }

  if (type === "stream") {
    return (
      <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
        {/* Doble línea con flecha */}
        <line x1="4" y1="9" x2="72" y2="9" {...stroke} />
        <line x1="4" y1="13" x2="72" y2="13" {...stroke} />
        <path d="M72 6 L80 11 L72 16 Z" fill="currentColor" />
      </svg>
    );
  }

  // Fallback: flecha sólida simple
  return (
    <svg viewBox="0 0 84 22" className="h-6 w-20 shrink-0 text-accent" aria-hidden="true">
      <line x1="4" y1="11" x2="70" y2="11" {...stroke} />
      <path d="M70 6 L79 11 L70 16" {...stroke} />
    </svg>
  );
}

const WIKI_DATA: WikiSection[] = [
  {
    id: "usecase",
    title: "1. Vista de Escenarios (+1 / Casos de Uso)",
    badge: "Escenarios (+1)",
    icon: "target",
    summary:
      "La vista central que une y valida a las otras 4 vistas. Describe los requisitos funcionales del sistema desde el punto de vista de los usuarios finales y sistemas externos.",
    elements: [
      {
        name: "Actor (Personaje)",
        icon: "user",
        elementKind: "actor",
        description: "Entidad externa (humano, dispositivo u otro sistema) que interactúa con el sistema realizando o beneficiándose de un caso de uso.",
        notation: "Símbolo de figura humana (stickman) o caja con estereotipo «actor».",
      },
      {
        name: "Caso de Uso (Óvalo)",
        icon: "target",
        elementKind: "usecase",
        description: "Secuencia de acciones que el sistema realiza para producir un resultado observable de valor para un actor específico.",
        notation: "Óvalo o elipse con el verbo de acción en infinitivo (ej: «Autenticar Usuario»).",
      },
      {
        name: "Límite del Sistema / Frontera",
        icon: "box",
        elementKind: "system",
        description: "Define el alcance o frontera del sistema o subsistema en análisis. Los casos de uso residen dentro; los actores fuera.",
        notation: "Rectángulo amplio con el nombre del sistema en la cabecera.",
      },
      {
        name: "Paso del Flujo (Escenario)",
        icon: "diagram",
        elementKind: "step",
        description: "Paso individual secuencial dentro del escenario principal o alternativo del caso de uso.",
        notation: "Caja de paso numerada conectada secuencialmente.",
      },
    ],
    relationships: [
      {
        name: "Asociación",
        type: "association",
        lineStyle: "Línea continua sólida sin flecha",
        description: "Conecta a un Actor (personaje) con el Caso de Uso en el que participa o interactúa.",
      },
      {
        name: "«include» (Inclusión obligatoria)",
        type: "include",
        lineStyle: "Línea discontinua con flecha abierta hacia el caso incluido",
        description: "Indica que el caso de uso base ejecuta obligatoriamente el comportamiento de otro caso para completarse.",
      },
      {
        name: "«extend» (Extensión opcional)",
        type: "extend",
        lineStyle: "Línea discontinua con flecha abierta hacia el caso base",
        description: "Comportamiento opcional o condicional que amplía al caso base bajo ciertas condiciones.",
      },
      {
        name: "Generalización (Herencia)",
        type: "generalization",
        lineStyle: "Línea continua con triángulo hueco",
        description: "Herencia entre actores (ej: Administrador hereda de Usuario) o especialización entre casos de uso (ej: Pago Tarjeta hereda de Pago).",
      },
    ],
    rules: [
      "Los actores nunca se conectan directamente entre sí mediante asociaciones (solo generalizaciones).",
      "Los casos de uso deben comenzar con un verbo de acción claro (ej: «Gestionar Pedidos», «Pagar Factura»).",
      "«include» apunta al caso reutilizado; «extend» apunta al caso base que es extendido.",
    ],
    example: "Cliente -> (Realizar Pedido) --«include»--> (Verificar Stock) y (Pago Tarjeta) --generaliza--> (Procesar Pago).",
  },
  {
    id: "logical",
    title: "2. Vista Lógica (Diseño y Dominio)",
    badge: "Lógica",
    icon: "blocks",
    summary:
      "Muestra la descomposición funcional del software en clases, interfaces, subsistemas y modelos de dominio. Dirigida a diseñadores y desarrolladores.",
    elements: [
      {
        name: "Clase",
        icon: "blocks",
        description: "Estructura con atributos y métodos que encapsula datos y comportamiento.",
        notation: "Caja de 3 compartimentos (Nombre, Atributos, Métodos).",
      },
      {
        name: "Interfaz",
        icon: "code",
        description: "Contrato de operaciones sin implementación que deben cumplir las clases concretas.",
        notation: "Caja con estereotipo «interface» o símbolo piruleta (lollipop).",
      },
      {
        name: "Entidad de Dominio",
        icon: "database",
        description: "Objeto de negocio con identidad única a lo largo de su ciclo de vida (DDD).",
        notation: "Caja con estereotipo «entity».",
      },
      {
        name: "Subsistema",
        icon: "folder",
        description: "Conjunto agrupado de clases y módulos con alta cohesión interna.",
        notation: "Paquete contenedor con pestaña superior.",
      },
    ],
    relationships: [
      {
        name: "Dependencia",
        type: "dependency",
        lineStyle: "Línea discontinua con flecha simple",
        description: "Un elemento utiliza o depende temporalmente de otro.",
      },
      {
        name: "Realización / Implementación",
        type: "realization",
        lineStyle: "Línea discontinua con triángulo hueco",
        description: "Una clase implementa las operaciones definidas por una interfaz.",
      },
      {
        name: "Agregación",
        type: "aggregation",
        lineStyle: "Línea continua con rombo hueco",
        description: "Relación todo-parte débil; las partes pueden existir sin el todo.",
      },
      {
        name: "Composición",
        type: "composition",
        lineStyle: "Línea continua con rombo relleno",
        description: "Relación todo-parte fuerte; la destrucción del todo destruye las partes.",
      },
    ],
    rules: [
      "Seguir el principio de responsabilidad única (SRP).",
      "Favorecer composición sobre herencia cuando sea viable.",
    ],
    example: "OrderService implementa IOrderService y compone Order, el cual agrega OrderItem.",
  },
  {
    id: "process",
    title: "3. Vista de Procesos (Concurrencia y Rendimiento)",
    badge: "Procesos",
    icon: "queue",
    summary:
      "Modela los hilos de ejecución, procesos, concurrencia, sincronización, eventos y colas de mensajes del sistema. Dirigida a integradores y arquitectos de rendimiento.",
    elements: [
      {
        name: "Proceso",
        icon: "server",
        description: "Unidad independiente de ejecución con su propio espacio de memoria.",
        notation: "Caja con bordes redondeados dobles o icono de proceso.",
      },
      {
        name: "Hilo (Thread)",
        icon: "refresh",
        description: "Línea liviana de ejecución concurrente dentro de un mismo proceso.",
        notation: "Línea ondulada o caja compacta de hilo.",
      },
      {
        name: "Cola de Mensajes",
        icon: "queue",
        description: "Búfer persistente o en memoria para comunicación asíncrona desacoplada.",
        notation: "Cilindro horizontal con divisiones de mensajes.",
      },
      {
        name: "Flujo de Eventos (Event Stream)",
        icon: "wand",
        description: "Secuencia continua de eventos distribuidos (ej: Kafka, RabbitMQ).",
        notation: "Cinta o flecha ancha segmentada.",
      },
    ],
    relationships: [
      {
        name: "Llamada Síncrona",
        type: "syncCall",
        lineStyle: "Flecha sólida con cabeza rellena",
        description: "El emisor espera la respuesta antes de continuar la ejecución.",
      },
      {
        name: "Mensaje Asíncrono",
        type: "asyncMessage",
        lineStyle: "Flecha discontinua abierta (animada)",
        description: "El emisor envía y continúa inmediatamente (fire and forget).",
      },
      {
        name: "Suscripción / Stream",
        type: "stream",
        lineStyle: "Doble flecha continua",
        description: "Consumo de eventos o telemetría en tiempo real.",
      },
    ],
    rules: [
      "Evitar bloqueos mutuos (deadlocks) definiendo orden estricto de adquisición de recursos.",
      "Identificar procesos que requieran tolerancia a fallos y reintentos.",
    ],
    example: "API Gateway envía síncrono al Auth Service y asíncrono a la cola 'order-events'.",
  },
  {
    id: "development",
    title: "4. Vista de Desarrollo (Implementación y Código)",
    badge: "Desarrollo",
    icon: "layers",
    summary:
      "Estructura física del código fuente: paquetes, módulos, componentes compilados, librerías y artefactos. Dirigida a desarrolladores y líderes técnicos.",
    elements: [
      {
        name: "Componente",
        icon: "cube",
        description: "Módulo autónomo de software con interfaces bien definidas.",
        notation: "Rectángulo con dos rectángulos pequeños a la izquierda o etiqueta «component».",
      },
      {
        name: "Capa (Layer)",
        icon: "layers",
        description: "División horizontal de responsabilidades (ej: Presentación, Negocio, Datos).",
        notation: "Banda horizontal delimitada.",
      },
      {
        name: "Paquete / Módulo",
        icon: "folder",
        description: "Agrupación de archivos de código fuente, clases y recursos.",
        notation: "Carpeta con pestaña superior.",
      },
      {
        name: "Artefacto",
        icon: "file",
        description: "Archivo generado por la compilación o empaquetado (JAR, DLL, Dockerfile).",
        notation: "Página doblada en la esquina con nombre de archivo.",
      },
    ],
    relationships: [
      {
        name: "Dependencia de Código",
        type: "dependency",
        lineStyle: "Línea discontinua con flecha abierta",
        description: "Un módulo requiere importar o enlazar a otro para compilar o ejecutar.",
      },
      {
        name: "Empaquetado",
        type: "composition",
        lineStyle: "Contención dentro de la misma caja o paquete",
        description: "Un componente o capa contiene a otros módulos.",
      },
    ],
    rules: [
      "Respetar la dirección de dependencias: las capas superiores dependen de las inferiores, no al revés.",
      "Evitar dependencias circulares entre paquetes o módulos.",
    ],
    example: "Capa Web -> depende de -> Capa de Dominio -> depende de -> Capa de Persistencia.",
  },
  {
    id: "physical",
    title: "5. Vista Física (Despliegue e Infraestructura)",
    badge: "Física",
    icon: "cube",
    summary:
      "Mapeo de los componentes de software en la infraestructura física y de nube: servidores, contenedores, redes y balanceadores. Dirigida a ingenieros DevOps y de infraestructura.",
    elements: [
      {
        name: "Nodo / Servidor",
        icon: "server",
        description: "Recurso computacional con procesador y memoria (bare-metal o instancia EC2).",
        notation: "Cubo en perspectiva 3D.",
      },
      {
        name: "Contenedor / Pod",
        icon: "cube",
        description: "Entorno aislado y ligero de ejecución (ej: Docker, Kubernetes Pod).",
        notation: "Caja hexagonal o cúbica con logo de contenedor.",
      },
      {
        name: "Balanceador de Carga",
        icon: "external",
        description: "Distribuye el tráfico de red entre varios servidores o instancias.",
        notation: "Nodo con flechas divergentes hacia los destinos.",
      },
      {
        name: "Zona de Red / VPC",
        icon: "globe",
        description: "Subred o zona de seguridad (ej: Subred Pública, Subred Privada de BD).",
        notation: "Caja amplia con borde punteado de contención.",
      },
    ],
    relationships: [
      {
        name: "Despliegue (Deploy)",
        type: "deployOn",
        lineStyle: "Contención física o flecha «deploy»",
        description: "Indica en qué nodo físico o máquina virtual corre cada componente.",
      },
      {
        name: "Enlace de Red",
        type: "networkLink",
        lineStyle: "Línea continua con etiqueta de protocolo (HTTPS, gRPC, TCP)",
        description: "Conexión de comunicaciones físicas entre dos nodos.",
      },
    ],
    rules: [
      "Especificar puertos, protocolos y certificados en los enlaces de red.",
      "Aislar las bases de datos en zonas de red privadas sin exposición pública directa.",
    ],
    example: "Cliente -> [HTTPS:443] -> ALB -> [HTTP:8080] -> Contenedor Docker en VPC Privada.",
  },
];

export function ModelWikiDialog({
  isOpen,
  onClose,
  initialView = "usecase",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialView?: DiagramId;
}) {
  const [selectedSection, setSelectedSection] = useState<DiagramId>(initialView);
  const [filter, setFilter] = useState("");

  const section = WIKI_DATA.find((item) => item.id === selectedSection) || WIKI_DATA[0];

  const filteredElements = section.elements.filter(
    (el) =>
      !filter ||
      el.name.toLowerCase().includes(filter.toLowerCase()) ||
      el.description.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="xl">
          <Modal.Dialog className="max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header del Modal */}
            <Modal.Header className="border-b border-border p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground text-lg shadow-xs">
                  <Icon name="book" />
                </div>
                <div>
                  <Modal.Heading className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Guía y Wiki del Modelo 4+1</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                      Philippe Kruchten
                    </span>
                  </Modal.Heading>
                  <p className="text-xs text-muted">
                    Definiciones completas, elementos gráficos y nomenclatura de trazos UML
                  </p>
                </div>
              </div>
            </Modal.Header>

            {/* Pestañas de selección de vistas 4+1 */}
            <div className="border-b border-border bg-surface-secondary/40 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scroll-thin">
              {WIKI_DATA.map((item) => {
                const isActive = item.id === selectedSection;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSection(item.id)}
                    className={[
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                        : "text-muted hover:text-foreground hover:bg-surface-secondary",
                    ].join(" ")}
                  >
                    <Icon name={item.icon as any} className="text-xs" />
                    <span>{item.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Cuerpo del Modal */}
            <Modal.Body className="overflow-y-auto p-5 space-y-6 flex-1">
              {/* Resumen de la vista */}
              <div className="rounded-xl border border-accent/30 bg-accent-soft/30 p-4">
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <Icon name={section.icon as any} className="text-accent" />
                  <span>{section.title}</span>
                </h3>
                <p className="text-xs leading-relaxed text-foreground/90">{section.summary}</p>
                {section.example ? (
                  <div className="mt-2.5 pt-2 border-t border-accent/20 text-[11px] text-muted">
                    <strong className="text-foreground">Ejemplo común: </strong>
                    <span>{section.example}</span>
                  </div>
                ) : null}
              </div>

              {/* Elementos con previsualización gráfica auténtica (personaje, óvalo, caja) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Elementos de esta vista ({filteredElements.length})
                  </h4>
                  <div className="relative w-56">
                    <input
                      type="text"
                      placeholder="Buscar concepto o elemento…"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                    {filter ? (
                      <button
                        type="button"
                        onClick={() => setFilter("")}
                        className="absolute right-2 top-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredElements.map((el) => (
                    <div
                      key={el.name}
                      className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-accent/40 shadow-2xs"
                    >
                      <ElementVisualPreview icon={el.icon} kind={el.elementKind} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-foreground">{el.name}</span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed mt-1">{el.description}</p>
                        {el.notation ? (
                          <div className="mt-2 text-[10px] bg-surface-secondary/80 rounded-md px-2 py-1 text-muted border border-border/50">
                            <span className="font-semibold text-foreground">Forma / Notación: </span>
                            <span>{el.notation}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relaciones con trazos gráficos de líneas UML */}
              {section.relationships.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Nomenclatura UML y Tipos de Línea
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {section.relationships.map((rel) => (
                      <div
                        key={rel.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          {/* Previsualización gráfica de la línea */}
                          <div className="rounded-lg border border-border bg-surface-secondary/60 px-2 py-1 flex items-center justify-center">
                            <RelationLinePreview type={rel.type} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{rel.name}</span>
                              <span className="text-[10px] text-accent font-medium px-2 py-0.5 rounded-full bg-accent-soft border border-accent/20">
                                {rel.lineStyle}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted mt-1 leading-snug">{rel.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Reglas y Buenas Prácticas */}
              {section.rules.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Reglas y Buenas Prácticas
                  </h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-[11px] text-muted">
                    {section.rules.map((rule, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Modal.Body>

            {/* Footer del Modal */}
            <Modal.Footer className="border-t border-border p-3 sm:p-4 flex items-center justify-between">
              <span className="text-[11px] text-muted hidden sm:inline">
                Consejo: Puedes cambiar entre las 5 vistas usando las pestañas superiores
              </span>
              <Button size="sm" variant="primary" onPress={onClose}>
                Entendido
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
