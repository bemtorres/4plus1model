# Guía de Parámetros de URL y Catálogo de Códigos

Este documento describe todos los parámetros que acepta **C4 Modeler** a través de la URL, las **nuevas reglas y validaciones estrictas** implementadas (sanitización de códigos, soporte de idioma y tema), y el catálogo completo de los 50 casos de estudio disponibles.

URL de la página principal: [https://c4model.cafeycodigo.org](https://c4model.cafeycodigo.org)  
URL del editor: [https://c4model.cafeycodigo.org/editor](https://c4model.cafeycodigo.org/editor)

---

## 1. Parámetros de URL disponibles

Los siguientes parámetros son procesados por el editor en `/editor`:

| Parámetro | Valores admitidos | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `?code=<id>` | Slug ASCII (máx. 64 caracteres) | Carga un caso de estudio del catálogo o el modelo de demostración. | `/editor?code=cinenova` |
| `?new=1` | `1` | Abre el editor con un lienzo completamente limpio en blanco. | `/editor?new=1` |
| `?lang=<locale>` | `en`, `es`, `pt`, `fr`, `de`, `zh`, `ko` | Define el idioma de la interfaz directamente desde el enlace. | `/editor?lang=es` |
| `?theme=<modo>` | `light`, `dark`, `system` | Define el tema visual (evita parpadeos o FOUC). | `/editor?theme=dark` |
| `?share=<payload>` | `g...` o `j...` (base64url) | Carga un modelo completo serializado en la URL. Modo solo lectura por defecto. | `/editor?share=gH4sIC...` |
| `?jwt=<token>` | Token JWT RFC 7519 (`header.payload.signature`) | Carga el proyecto empaquetado y firmado en formato JWT estándar. | `/editor?jwt=eyJhbGciOi...` |
| `?token=<token>` | Token JWT RFC 7519 | Alias equivalente a `?jwt=`. | `/editor?token=eyJhbGciOi...` |
| `?edit=<valor>` | `0`, `false`, `1`, `true` | Controla el modo edición. Por defecto está activado (`1`/`true`). Si se pasa `0` o `false`, el sistema se bloquea y oculta el modo edición (solo visualización con botón «Editar» que abre una copia en otra pestaña). | `/editor?edit=0&lang=es` |

---

## 2. Nuevas reglas y validaciones estrictas

### A. Regla de sanitización y validación de `?code=`

Para prevenir inyecciones de código (XSS), manipulación de rutas o saturación de memoria, el parámetro `?code=` pasa por una validación estricta en [`src/lib/examples/url.ts`](../src/lib/examples/url.ts):

1. **Formato Slug Estricto**:
   - Solo se permiten caracteres alfanuméricos en minúsculas y guiones sencillos.
   - Expresión regular validada: `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
   - Se rechaza cualquier carácter especial como `<`, `>`, `"`, `'`, `/`, `\`, espacios, acentos o dobles guiones.
2. **Longitud Máxima**:
   - Máximo **64 caracteres**. Si se excede, el valor es descartado de inmediato.
3. **Decodificación Segura**:
   - Se captura cualquier error de `decodeURIComponent` (ej. secuencias `%` malformadas).
4. **Respuesta ante entradas maliciosas o malformadas**:
   - Si el valor no cumple el formato, la aplicación **lo elimina inmediatamente de la URL** (`history.replaceState`) para no propagar enlaces rotos o maliciosos, y muestra una notificación segura de advertencia al usuario (`examples.notFound`).
5. **Limpieza automática al editar**:
   - Cuando el usuario edita el diagrama en el lienzo, la aplicación limpia el parámetro `?code=` de la URL para proteger el progreso del usuario de sobrescrituras al recargar.

### B. Regla de idioma con `?lang=`

Permite compartir enlaces preconfigurados en un idioma específico:

1. **Idiomas válidos**:
   - `en` (Inglés - por defecto)
   - `es` (Español)
   - `pt` (Portugués)
   - `fr` (Francés)
   - `de` (Alemán)
   - `zh` (Chino simplificado)
   - `ko` (Coreano)
2. **Validación**:
   - Si el valor de `?lang=` coincide con uno de los códigos soportados, se activa de inmediato, se actualiza el atributo `document.documentElement.lang` y se guarda en `localStorage` (`c4-modeler:locale`).
   - Si el valor no es reconocido (ej. `?lang=invalido`), se ignora de forma segura y se recurre a la preferencia previa o la detección del navegador.

### C. Regla de tema con `?theme=`

Permite incrustar o compartir la herramienta con un aspecto visual definido:

1. **Modos válidos**:
   - `light` (modo claro)
   - `dark` (modo oscuro)
   - `system` (sigue la preferencia del sistema operativo)
2. **Prevención de parpadeo (FOUC)**:
   - El tema se evalúa mediante un script en línea ejecutado en el `<head>` antes de que se renderice el HTML.
   - Si `?theme=` está presente, se almacena en `localStorage` (`heroui-theme`) y se aplica de inmediato al atributo `data-theme` y a la clase CSS del elemento `<html>`.
   - Los componentes de la interfaz sincronizan su estado reactivo automáticamente.

### D. Regla de intercambio con Tokens JWT (`?jwt=`, `?token=`)

Permite empaquetar todo el modelo de arquitectura C4 en un estándar internacional de la industria: **JSON Web Token (RFC 7519)**.

1. **Estructura del Token**:
   - **Header**: `{"alg": "HS256", "typ": "JWT"}` (firmado mediante Web Crypto API `HMAC-SHA256`).
   - **Payload**:
     - `iss`: `"c4model.cafeycodigo.org"` (emisor verificado).
     - `sub`: `"c4-workspace"` (tipo de recurso).
     - `name`: Nombre del proyecto/arquitectura.
     - `description`: Descripción general.
     - `elementsCount`: Número total de elementos C4.
     - `relationshipsCount`: Número total de relaciones.
     - `iat`: Timestamp Unix de emisión.
     - `workspace`: Objeto JSON completo con todos los niveles del modelo C4.
   - **Signature**: Firma criptográfica HMAC generada en el navegador.

2. **Ventajas frente a formatos propietarios**:
   - **Inspección en jwt.io**: Puedes pegar el token directamente en [jwt.io](https://jwt.io) para inspeccionar la arquitectura y sus metadatos sin necesidad de decodificadores especiales.
   - **Interoperabilidad con APIs**: Es un formato idóneo para transferir diagramas a través de cabeceras `Authorization: Bearer <token>` o parámetros de consulta en microservicios y pipelines CI/CD.
   - **Doble soporte de importación/exportación**:
     - En el menú **Exportar**, puedes descargar un archivo `.jwt` con el token firmado.
     - En el diálogo **Importar**, puedes pegar directamente la cadena JWT o arrastrar un archivo `.jwt`.

3. **Parámetro `?edit=1`**:
   - Al abrir un enlace `?jwt=...`, el editor inicia en modo lectura por defecto para evitar sobreescrituras accidentales.
   - Añadiendo `&edit=1` (o haciendo clic en "Editar en nueva pestaña"), se clona el espacio de trabajo en modo edición activo.

### E. Regla de control de edición (`?edit=0`, `?edit=false`, `?edit=1`, `?edit=true`)

Controla si el editor se abre en modo interactivo/editable o en modo de visualización bloqueado:

1. **Valores admitidos**:
   - **Bloqueado / Solo lectura**: `edit=0`, `edit=false` (también reconoce `no`, `off`).
   - **Editable**: `edit=1`, `edit=true` (también reconoce `yes`, `on`).
2. **Comportamiento por defecto**:
   - **El modo edición está activado por defecto** si no se especifica el parámetro `?edit` (para permitir modelar y experimentar libremente).
   - En el caso específico de enlaces compartidos (`?share=`, `?jwt=`), el modo protegido (solo lectura) se activa por seguridad a menos que se incluya explícitamente `&edit=1` o `&edit=true`.
3. **¿Qué ocurre cuando el sistema se bloquea (`edit=0` o `edit=false`)?**:
   - **Ocultación del modo edición**: La paleta izquierda de creación de elementos queda completamente oculta, impidiendo inserciones o arrastres accidentales.
   - **Lienzo bloqueado**: Los nodos y conexiones no se pueden arrastrar, modificar ni borrar.
   - **Inspector protegido**: Los formularios de edición de propiedades, estilos y eliminación quedan inhabilitados; el formulario de «Nueva relación» se oculta.
   - **Botón «Editar»**: Aparece de forma visible un banner con candado y un botón principal **«Editar en una pestaña nueva»** (tanto en el lienzo como en la barra superior `TopBar`). Al pulsar este botón, se abre una pestaña nueva con `edit=1` manteniendo todo el contexto (ej. idioma `lang`, tema `theme`, código `code` o token `jwt`), permitiendo modificar y continuar el proyecto sin perder nada.

---

## 3. Ejemplos combinados de URL

Puedes combinar los parámetros para crear enlaces completos:

```
# Abrir CineNova en español y con tema oscuro
https://c4model.cafeycodigo.org/editor?code=cinenova&lang=es&theme=dark

# Abrir NovaBank en inglés y tema claro
https://c4model.cafeycodigo.org/editor?code=novabank&lang=en&theme=light

# Abrir el modelo de demostración en portugués
https://c4model.cafeycodigo.org/editor?code=demo&lang=pt
```

---

## 4. Códigos especiales de demostración

| Código | Alias admitidos | Descripción |
| :--- | :--- | :--- |
| `online-store` | `sample`, `demo` | Modelo completo de demostración de una tienda online con los 4 niveles (Contexto, Contenedores, Componentes y Código). |

---

## 5. Catálogo completo de los 50 casos de estudio (`?code=<id>`)

### 1. Streaming y entretenimiento (`streaming`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `cinenova` | CineNova | Netflix | Intermedio | Catálogo, reproducción, recomendaciones y cobro de suscripción |
| `sonoraplay` | SonoraPlay | Spotify | Intermedio | Streaming de audio, listas colaborativas, búsqueda con OpenSearch |
| `streamarena` | StreamArena | Twitch | Avanzado | Emisión en directo RTMP, chat masivo en tiempo real con Redis Streams |
| `pixelforge` | PixelForge | Steam | Avanzado | Tienda de videojuegos, gestión de licencias DRM y descargas por bloques |
| `comicverse` | ComicVerse | WEBTOON | Principiante | Cómics digitales por capítulos, publicación programada y CDN |

### 2. Comercio electrónico (`ecommerce`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `comprafacil` | CompraFácil | Mercado Libre | Intermedio | Marketplace multi-vendedor, pagos repartidos y transportistas |
| `modaclick` | ModaClick | Zara online | Principiante | Catálogo de moda, variantes de stock, fulfillment y paquetería |
| `hecho-local` | HechoLocal | Etsy | Principiante | Marketplace de artesanía, cálculo de comisiones y envíos postales |
| `saborexpress` | SaborExpress | Uber Eats | Avanzado | Pedidos de comida, despacho dinámico de repartidores y cálculo de ETA |
| `mercadoverde` | MercadoVerde | Instacart | Principiante | Supermercado con franjas de entrega y optimización de rutas de picking |

### 3. Finanzas y fintech (`fintech`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `novabank` | NovaBank | Revolut | Avanzado | Core bancario, libro mayor de partida doble, tarjetas y compliance |
| `billetera-go` | BilleteraGo | PayPal | Avanzado | Billetera digital, captura en comercios, antifraude y liquidación bancaria |
| `inverta` | Inverta | eToro | Principiante | Gestión de carteras de inversión, streaming de cotizaciones y riesgo VaR |
| `cuentaclara` | CuentaClara | Wallet by BudgetBakers | Principiante | Presupuesto personal, importación vía Open Banking y alertas de gasto |
| `pagonexo` | PagoNexo | Stripe | Avanzado | API REST de pagos para desarrolladores, webhooks firmados y pasarelas |

### 4. Redes sociales y comunicación (`social`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `conectared` | ConectaRed | Facebook | Avanzado | Red social con grafo de amigos, fan-out de timeline y moderación |
| `cliploop` | ClipLoop | TikTok | Avanzado | Vídeos cortos, transcodificación asíncrona y motor de recomendación |
| `talentopro` | TalentoPro | LinkedIn | Intermedio | Red profesional, ofertas de empleo, postulaciones y red de contactos |
| `equipo-chat` | EquipoChat | Slack | Intermedio | Mensajería de equipo en tiempo real, canales, presencia y webhooks |
| `reunion-360` | Reunión360 | Zoom | Avanzado | Videoconferencias grupales WebRTC, señalización y grabación en nube |

### 5. Educación y e-learning (`education`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `aulanube` | AulaNube | Google Classroom | Principiante | Cursos online, entrega de tareas, calificaciones y notificaciones |
| `codecampus` | CodeCampus | LeetCode | Avanzado | Juez en línea para ejecución aislada de código, tests y ranking |
| `linguaquest` | LinguaQuest | Duolingo | Principiante | Aprendizaje de idiomas gamificado, rachas y lecciones adaptativas |
| `mentorlink` | MentorLink | ADPList | Principiante | Reserva de mentorías 1 a 1, sincronización de calendarios y videollamada |
| `memora` | Memora | Anki | Principiante | Tarjetas de memoria con algoritmo de repetición espaciada (SM-2) |

### 6. Salud y bienestar (`health`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `saludconecta` | SaludConecta | Teladoc | Intermedio | Telemedicina, triage médico virtual, recetas electrónicas y videoconsultas |
| `clinicaflow` | ClínicaFlow | Epic Systems | Avanzado | Historia clínica electrónica (EHR/EMR), interoperabilidad HL7/FHIR y turnos |
| `vitaltrack` | VitalTrack | Apple Health | Intermedio | Ingesta de métricas de wearables (ritmo cardíaco, pasos, sueño) y alertas |
| `farmaclick` | FarmaClick | CVS Pharmacy | Principiante | Farmacia en línea, validación de recetas médicas y reposición periódica |
| `menteserena` | MenteSerena | Headspace | Principiante | Meditaciones guiadas, seguimiento del estado de ánimo y contenido offline |

### 7. Transporte y logística (`transport`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `rutaya` | RutaYa | Uber | Avanzado | VTC, emparejamiento conductor-pasajero en tiempo real y cálculo de tarifa |
| `hospeda` | Hospeda | Airbnb | Intermedio | Alquiler vacacional, calendarios de disponibilidad, reservas y reseñas |
| `vuelodirecto` | VueloDirecto | Skyscanner | Intermedio | Metabuscador de vuelos con integración a múltiples GDS y alertas de precio |
| `ciudadenruta` | CiudadEnRuta | Citymapper | Intermedio | Rutas de transporte público multimodal con datos GTFS en tiempo real |
| `electroruta` | ElectroRuta | Tesla Supercharger | Intermedio | Red de cargadores de vehículos eléctricos, telemetría OCPP y pagos |

### 8. Productividad y empresa (`productivity`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `proyectozen` | ProyectoZen | Asana / Jira | Intermedio | Tableros Kanban, seguimiento de tareas, dependencias y sprint planning |
| `cliente360` | Cliente360 | Salesforce | Intermedio | CRM de ventas, embudos de conversión, pipeline y registro de interacciones |
| `empresanexo` | EmpresaNexo | SAP ERP | Avanzado | ERP empresarial: compras, facturación, almacén central y contabilidad |
| `archivonube` | ArchivoNube | Google Drive | Avanzado | Almacenamiento en la nube con deduplicación por bloques, versiones y sync |
| `flujobot` | FlujoBot | Zapier | Avanzado | Automatización de flujos entre apps por disparadores, pasos y webhooks |

### 9. Inteligencia Artificial (`ai`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `asistentenova` | AsistenteNova | ChatGPT | Intermedio | Chat conversacional con LLMs, streaming SSE y memoria de contexto |
| `documente` | Documente | Notion AI | Intermedio | Editor de notas con generación y reescritura de texto asistida por IA |
| `datavision` | DataVision | Power BI AI | Avanzado | Consultas analíticas en lenguaje natural (Text-to-SQL) y cuadros de mando |
| `pixelia` | Pixelia | Midjourney | Avanzado | Generación de imágenes por difusión, cola de GPU y almacenamiento S3 |
| `agenteflow` | AgenteFlow | LangChain | Avanzado | Orquestación de agentes autónomos con ejecución de herramientas y bucle ReAct |

### 10. Infraestructura y DevOps (`infra`)
| Código (`?code=`) | Nombre | Inspirado en | Dificultad | Enfoque principal |
| :--- | :--- | :--- | :--- | :--- |
| `nubestack` | NubeStack | AWS / GCP | Avanzado | Consola y API para provisión de instancias de cómputo y redes virtuales |
| `codigolibre` | CódigoLibre | GitHub | Avanzado | Servidor Git, pull requests, revisión de código y runners de CI/CD |
| `monitorix` | Monitorix | Datadog | Avanzado | Observabilidad: ingesta masiva de métricas, trazas distribuidas y alertas |
| `escudodigital` | EscudoDigital | Cloudflare | Avanzado | Proxy inverso, mitigación DDoS, WAF y red de distribución perimetral |
| `apihub` | APIHub | Postman | Intermedio | Repositorio de especificaciones OpenAPI, pruebas automáticas y mocks |
