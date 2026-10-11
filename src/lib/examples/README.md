# Cómo escribir un ejemplo del catálogo

Guía para humanos **e inteligencias artificiales** que añadan o modifiquen un
caso de estudio de `catalog.ts`. Sigue las reglas de este documento y ejecuta
la verificación al final: el validador (`npm run check:examples`) las comprueba
todas de forma automática.

---

## 1. Qué es un ejemplo

Un ejemplo es la arquitectura de un producto ficticio, modelada con el **modelo
C4** y descrita de forma **declarativa**: no se escriben nodos ni coordenadas,
se declara la estructura y el builder genera el workspace con los diagramas ya
colocados.

Cada ejemplo se abre en la app con `?code=<id>` y se puede exportar a PlantUML,
Mermaid, Markdown y JSON.

Los nombres de los proyectos son ficticios. El campo `reference` cita una
empresa o producto real **sólo como referencia conceptual**: no implica
afiliación ni reproduce arquitecturas propietarias.

---

## 2. Mapa de archivos

| Archivo | Rol |
| --- | --- |
| `src/lib/examples/builder.ts` | Tipos del catálogo (`ExampleSpec`) y el builder que genera el `Workspace`. |
| `src/lib/examples/catalog.ts` | **El catálogo.** El único archivo que hay que tocar para añadir un ejemplo. |
| `src/lib/examples/index.ts` | Búsqueda, filtrado y resolución de `?code=`. |
| `src/lib/examples/analysis.ts` | Métricas del diálogo de detalle (conteos, niveles, tecnologías, tabla de relaciones). |
| `src/lib/examples/tech-links.ts` | Enlace oficial por tecnología (para las píldoras del diálogo). |
| `src/lib/examples/reference-links.ts` | Enlace del producto que inspira cada ejemplo. |
| `scripts/validate-examples.mjs` | Validador de reglas duras (`npm run check:examples`). |
| `public/examples/` | Miniaturas `<id>.png` (opcionales; ver su README). |
| `src/lib/catalog.ts` | Metadatos de tipos y niveles C4 (no confundir con el catálogo de ejemplos). |
| `src/lib/types.ts` | Modelo de datos: `C4Element`, `C4Relationship`, `Workspace`. |
| `src/lib/view.ts` | Construye la vista de un nivel/ámbito (nodos, fronteras, aristas). |

---

## 3. Cómo funciona el pipeline

```
ExampleSpec (declarativo)
      │  buildExampleWorkspace()   ← builder.ts
      ▼
Workspace (elementos con parentId + relaciones + x/y)
      │  layoutExample()           ← distribución por capas, una posición por elemento
      ▼
buildView(workspace, level, scopeId)   ← view.ts
      │
      ├──► Editor (Canvas)          niveles L1–L4 con drill-down
      ├──► analyzeExample()         métricas del diálogo de detalle
      └──► exporters.ts             PlantUML / Mermaid / Markdown / JSON
```

Un elemento es «detalle» en **un único nivel**, según su profundidad:

| Nivel | Scope | Kinds admitidos | Quién es el ámbito |
| --- | --- | --- | --- |
| `context` (L1) | `null` | `person`, `softwareSystem`, `externalSystem`, `note` | — |
| `container` (L2) | un `softwareSystem` | `container`, `database`, `queue`, `note` | el sistema propio (se crea solo) |
| `component` (L3) | un `container` | `component`, `note` | cada contenedor con componentes |
| `code` (L4) | un `component` | `code`, `note` | lo declara el ejemplo demo, no el catálogo |

> **El catálogo sólo declara L1–L3.** El nivel de código (L4) sólo existe en el
> workspace de demostración (`src/lib/sample.ts`). No hace falta añadirlo.

---

## 4. Anatomía de un ejemplo

```ts
{
  id: "nombrecorto",                 // slug ASCII: forma la URL y la imagen
  name: "NombreComercial",           // nombre del softwareSystem (L1)
  category: "fintech",               // CategoryId, debe estar en CATEGORY_ORDER
  reference: "Stripe",               // producto que inspira (con enlace en reference-links)
  summary: "One-liner in English.",  // descripción del sistema propio
  focus: "What the diagrams show well.",
  difficulty: "advanced",            // beginner | intermediate | advanced
  people: [                          // L1 · actores, SIN tecnología
    ["Customer", "Buys things and tracks orders."],
  ],
  externalSystems: [                 // L1 · fuera del perímetro
    ["Payment Gateway", "Charges the card.", "HTTPS"],
  ],
  containers: [                      // L2 · [nombre, kind, tecnología, descripción]
    ["Storefront", "container", "Next.js", "Catalogue and cart."],
    ["Orders DB", "database", "PostgreSQL", "Orders and lines."],
    ["Order Events", "queue", "Kafka", "Async order processing."],
  ],
  componentSets: [                   // L3 · un conjunto por contenedor a abrir
    {
      container: "Order Service",    // debe existir en containers y ser kind "container"
      components: [
        ["State Machine", "Kotlin", "Validates state transitions."],
      ],
    },
  ],
  relations: [                       // [origen, destino, etiqueta, tecnología?, estilo?]
    ["Customer", "Storefront", "Buys online", "HTTPS"],
    ["Order Service", "Order Events", "Publishes events", "Kafka", "async"],
  ],
}
```

### Campos, de memoria

- `id` — slug en `a-z0-9-`. **Nunca acentos ni ñ**: forma la imagen
  `public/examples/<id>.png` y el parámetro `?code=`.
- `people` — `[nombre, descripción]`. Sin tecnología: son actores.
- `externalSystems` — `[nombre, descripción, tecnología?]`. Opcional.
- `containers` — `[nombre, kind, tecnología, descripción]`. `kind` sólo puede
  ser `container`, `database` o `queue`.
- `componentSets` — un objeto por contenedor que se quiera abrir en L3.
- `relations` — `[origen, destino, etiqueta, tecnología?, estilo?]`. `origen` y
  `destino` son **nombres** declarados en cualquiera de los campos anteriores.

---

## 5. Reglas duras

El validador las comprueba todas. Romper una falla `npm run check:examples`.

1. **`id` slug ASCII** — `/^[a-z0-9]+(-[a-z0-9]+)*$/` y único.
2. **Nombres únicos en todo el ejemplo** — el builder resuelve las relaciones
   por nombre en un único `Map`; una colisión hace que un elemento pise a otro
   y aparezcan bucles absurdos. Esto incluye el `name` del sistema propio.
3. **Todos los extremos de `relations` existen** — escritos exactamente igual
   que en `people` / `externalSystems` / `containers` / `componentSets`.
4. **Sin bucles** — `source === target` no es una relación válida.
5. **Nada suelto** — cada contenedor y cada persona debe aparecer en al menos
   una relación. Las bases de datos son sumideros legítimos.
6. **Ningún contenedor «inalcanzable»** — si sólo tiene salidas hacia
   externos o bases de datos, falta quién lo llame. Añade la relación de
   entrada o reconsidera el diseño.
7. **`componentSets` obligatorio** — sin él el nivel de componentes (L3) del
   ejemplo queda vacío.
8. **`componentSets.container`** debe existir en `containers` y ser de kind
   `container` (las bases de datos y colas no se abren en componentes).
9. **Textos no vacíos** — nombres, descripciones, tecnologías y etiquetas.
10. **Estilo de relación** — sólo `sync` (por defecto), `async` o `bi`.

En `astro dev` el builder **lanza un error** si una relación apunta a un
nombre inexistente, para que las erratas no se oculten en silencio. En
producción esa relación se omite sin romper la app.

---

## 6. Convenciones de estilo

### Idioma

Los **textos visibles** (nombres, descripciones, etiquetas de relación) van en
**inglés**, para que el catálogo sea legible con cualquier idioma de la
interfaz. Los **comentarios del código** van en español, igual que el resto del
repositorio.

### Tamaño y balance

| Dificultad | Contenedores (sin BD/colas) | Componentes | Relaciones |
| --- | --- | --- | --- |
| `beginner` | 3–5 | 3 | 7–10 |
| `intermediate` | 5–6 | 3 | 10–12 |
| `advanced` | 5–7 | 3 | 10–13 |

Una persona debe interactuar con el sistema; cada contenedor debe tener
sentido aislado. No llenes de contenedores vacíos: mejor 5 bien conectados que
9 con tres huérfanos.

### Tecnologías

- Escribe el **lenguaje o framework real** en los contenedores
  (`Java / Spring Boot`, `Go`, `Kotlin`, `React Native`…).
- En las relaciones escribe el **protocolo o mecanismo**
  (`HTTPS`, `HTTPS/JSON`, `gRPC`, `SQL`, `Kafka`, `RESP`, `WebSocket`, `SSE`…).
- Reutiliza tecnologías que ya existan en `tech-links.ts`; si añades una nueva
  y tiene web oficial, añade también su `RegExp → URL` allí.

### Estilo de relación: cuándo marcar `async`

El quinto elemento `"async"` dibuja la línea **discontinua** (y `Rel_D` en
PlantUML/Mermaid). Márcalo cuando el mecanismo sea de mensajería o
notificación:

| Marcar `async` | No marcar (sync) |
| --- | --- |
| Brokers: `Kafka`, `AMQP`, `RabbitMQ`, `NATS`, `Redis Streams`, `Celery`, `Airflow` | Llamadas RPC: `gRPC`, `HTTPS`, `HTTPS/JSON`, `HTTP` |
| Correo y log: `SMTP`, `Syslog` | Bases de datos: `SQL`, `RESP`, `ODBC` |
| Cualquier «publica/encola/consume» de un evento | `WebSocket`, `SSE`, `WebRTC` (interactivos) |

Si la relación es «X consume de la cola», el **origen debe ser la cola**:
`["Cola", "Worker", "Delivers jobs", "Kafka", "async"]`. Así el worker tiene
quién lo llame y el diagrama refleja el desacople.

### Comentario de arquitectura

Cada ejemplo lleva un bloque de comentario **encima** que resume su modelo, en
este formato exacto:

```ts
/* Nombre · inspirado en X — una línea de qué es.
 * L1: actores y sistemas externos relevantes.
 * L2: contenedores por tecnología, más colas y almacenes.
 * L3: qué contenedor se abre y sus tres componentes.
 * Flujo clave: el recorrido principal que explica el diagrama. */
```

Ese comentario es la principal fuente de contexto para quien mantenga el
ejemplo sin reconstruir el modelo mental: escríbelo siempre.

---

## 7. Qué contenedor abrir en L3

Elige el contenedor **más interesante del dominio**, no el más grande:

- ✅ el núcleo del negocio (`Order Service`, `Core Banking Service`,
  `Orchestrator`, `Matching Service`).
- ✅ el que resuelve el problema técnico distintivo (`Media Gateway`,
  `Sync Service`, `Execution Engine`).
- ❌ la app web o el cliente (son UI, no lógica que valga la pena abrir).
- ❌ la base de datos o la cola (no se pueden abrir: `kind` distinto de
  `container`).

Cada conjunto lleva **exactamente 3 componentes** con `[nombre, tecnología,
descripción]`. La tecnología suele ser la misma que la del contenedor padre o
la de su ecosistema (`Java` dentro de un contenedor `Java / Spring Boot`).

Las relaciones **entre componentes de contenedores distintos** se modelan
igual: el builder las eleva automáticamente al nivel correcto.

---

## 8. Proceso paso a paso

1. **Elige el hueco.** Revisa `CATEGORY_ORDER` y los ejemplos existentes para
   no duplicar un producto ya cubierto. Añade la categoría sólo si es nueva
   (también en `CATEGORY_ICONS` y en las claves `category.*` de los i18n).
2. **Diseña L1.** 1–3 personas + el sistema propio + 0–3 externos. Los
   externos sólo aparecen si algo del sistema los necesita de verdad.
3. **Diseña L2.** Contenedores con tecnología real; al menos un `database` y,
   si el flujo lo pide, un `queue`. Que todo esté conectado.
4. **Diseña L3.** Un `componentSet` de 3 componentes sobre el contenedor del
   dominio.
5. **Escribe las relaciones.** Cubre: persona → sistema, app → API, API →
   dominio, dominio → datos, dominio → externo. Marca `async` donde toque.
6. **Añade el bloque de comentario** de arquitectura encima del objeto.
7. **Verifica:**

   ```bash
   npm run check:examples   # reglas duras del catálogo
   npm run check            # typecheck
   npm run dev              # abrir ?code=<id> y mirar los 4 niveles
   ```

8. **Miniatura (opcional).** `public/examples/<id>.png` a 640×360; si no
   existe, la tarjeta muestra un marcador sin errores.

### Inserta el ejemplo en su categoría

El array `EXAMPLES` está agrupado por categorías con un separador de sección.
Coloca el nuevo ejemplo **al final de la sección de su categoría**, y actualiza
el comentario del encabezado si el número de la sección deja de ser el
correcto (el orden es: streaming, ecommerce, fintech, social, education,
health, transport, productivity, ai, infra).

---

## 9. Errores que ya se corrigieron (no los repitas)

Estos fallos pasaron el code review real del catálogo y son los más fáciles de
volver a cometer:

| Error | Síntoma | Causa |
| --- | --- | --- |
| Persona y contenedor con el mismo nombre | Bucle A→A en el diagrama | El `Map` de nombres los fusiona; el último gana. |
| `id: "proyectozén"` | Imagen 404 y URL rota | El id forma un nombre de archivo: sólo slug ASCII. |
| Base de datos sin relaciones | Nodo flotante aislado | Se declaró el almacén pero nadie escribe en él. |
| Persona sin relaciones | Actor que no toca el sistema | Falta la relación `Persona → contenedor`. |
| Servicio «inalcanzable» | Contenedor que sólo habla con externos | Falta la relación de entrada desde la app o el dominio. |
| Worker de cola con la cola como destino | Worker sin origen | Invertir la relación: `Cola → Worker`. |
| `componentSets` en una `database` | El nivel L3 no se abre | Sólo los `container` son «drillable». |
| Typo en el nombre de un extremo | Relación desaparecida sin avisar | El builder la omitía en silencio; ahora falla en dev. |
| Etiquetas de relación en español | Texto inconsistente en un catálogo en inglés | Mantén los textos visibles en inglés. |

---

## 10. Tareas comunes

**Añadir tecnología a `tech-links.ts`**

```ts
[/grafana/i, "https://grafana.com/"],
```

**Enlazar la referencia del ejemplo** — añade la entrada en
`reference-links.ts` con el texto **exacto** del campo `reference`.

**Marcar una relación como bidireccional** — quinta posición `"bi"`. Reserva
esto para flujos de ida y vuelta reales (p. ej. sincronización); casi siempre
basta con dos relaciones explícitas.

**Cambiar el sistema propio de nombre** — recuerda actualizar también el
`name` de todos los `relations` y el comentario de arquitectura.
