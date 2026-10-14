# Proyectos de ejemplo

Los 50 casos de estudio que incluye **C4 Modeler**. Cada uno es la
arquitectura completa de un producto ficticio, modelada con el modelo C4 en
los tres primeros niveles (contexto, contenedores y componentes) y abierta
en la app con el parámetro `?code=<id>`.

> Documento generado desde `src/lib/examples/catalog.ts` con `npm run doc`.
> No lo edites a mano: la siguiente generación lo sobrescribe.

> **Nombres ficticios.** Los proyectos no existen. Las empresas citadas como
> *referencia conceptual* sólo indican qué tipo de producto inspira el modelo:
> no implican afiliación ni reproducen arquitecturas propietarias.

## Cómo abrir un ejemplo

1. Abre la app con `?code=<id>`, por ejemplo `/?code=cinenova`. Si no hay
   código, se usa el ejemplo de demostración `online-store`.
2. Usa el selector de nivel para recorrer **L1** (contexto), **L2**
   (contenedores), **L3** (componentes) y **L4** (código).
3. Abre el diálogo de detalle para ver métricas, tecnologías y la tabla de
   relaciones de ese ejemplo.
4. Exporta el ejemplo a **PlantUML**, **Mermaid**, **Markdown** o **JSON**.

Los diagramas ya vienen colocados: el builder calcula las posiciones a partir
de la estructura declarada, no hay coordenadas escritas a mano.

## Resumen

- **50 proyectos** repartidos en **10 categorías**.
- Dificultad: **15** principiantes, **10** intermedios y **25** avanzados.

| # | Categoría | Ejemplos | Principiante | Intermedio | Avanzado |
| -: | --- | ---: | ---: | ---: | ---: |
| 1 | Streaming y entretenimiento | 5 | 1 | 2 | 2 |
| 2 | Comercio electrónico y marketplaces | 5 | 3 | 1 | 1 |
| 3 | Finanzas y fintech | 5 | 2 | 0 | 3 |
| 4 | Redes sociales y comunicación | 5 | 1 | 1 | 3 |
| 5 | Educación y EdTech | 5 | 3 | 2 | 0 |
| 6 | Salud y bienestar | 5 | 4 | 0 | 1 |
| 7 | Transporte y movilidad | 5 | 1 | 2 | 2 |
| 8 | Productividad y empresa | 5 | 0 | 2 | 3 |
| 9 | Inteligencia artificial y datos | 5 | 0 | 0 | 5 |
| 10 | Infraestructura, DevOps y seguridad | 5 | 0 | 0 | 5 |

## Índice

`L2` son los contenedores de aplicación, `Datos` las bases de datos y colas,
`L3` los componentes del conjunto que se abre y `Rel.` las relaciones
declaradas. Entre paréntesis, cuántas de ellas son `async` (línea discontinua
en el diagrama y `Rel_D` en PlantUML/Mermaid).

| # | Proyecto | Id | Categoría | Dificultad | Referencia | L2 | Datos | L3 | Rel. |
| -: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | [CineNova](#cinenova) | `cinenova` | Streaming y entretenimiento | Intermedio | Netflix | 5 | 3 | 3 | 11 (1 async) |
| 2 | [SonoraPlay](#sonoraplay) | `sonoraplay` | Streaming y entretenimiento | Intermedio | Spotify | 5 | 2 | 3 | 11 |
| 3 | [StreamArena](#streamarena) | `streamarena` | Streaming y entretenimiento | Avanzado | Twitch | 6 | 2 | 3 | 11 (1 async) |
| 4 | [PixelForge](#pixelforge) | `pixelforge` | Streaming y entretenimiento | Avanzado | Steam | 6 | 2 | 3 | 11 |
| 5 | [ComicVerse](#comicverse) | `comicverse` | Streaming y entretenimiento | Principiante | WEBTOON | 5 | 2 | 3 | 10 |
| 6 | [CompraFácil](#comprafacil) | `comprafacil` | Comercio electrónico y marketplaces | Intermedio | Mercado Libre | 6 | 3 | 3 | 13 (1 async) |
| 7 | [ModaClick](#modaclick) | `modaclick` | Comercio electrónico y marketplaces | Principiante | Zara online | 5 | 1 | 3 | 10 |
| 8 | [HechoLocal](#hecho-local) | `hecho-local` | Comercio electrónico y marketplaces | Principiante | Etsy | 5 | 1 | 3 | 10 |
| 9 | [SaborExpress](#saborexpress) | `saborexpress` | Comercio electrónico y marketplaces | Avanzado | Uber Eats | 6 | 2 | 3 | 12 (1 async) |
| 10 | [MercadoVerde](#mercadoverde) | `mercadoverde` | Comercio electrónico y marketplaces | Principiante | Instacart | 5 | 1 | 3 | 10 |
| 11 | [NovaBank](#novabank) | `novabank` | Finanzas y fintech | Avanzado | Revolut | 5 | 2 | 3 | 10 (1 async) |
| 12 | [BilleteraGo](#billetera-go) | `billetera-go` | Finanzas y fintech | Avanzado | PayPal | 5 | 2 | 3 | 11 (2 async) |
| 13 | [Inverta](#inverta) | `inverta` | Finanzas y fintech | Principiante | eToro | 4 | 2 | 3 | 9 |
| 14 | [CuentaClara](#cuentaclara) | `cuentaclara` | Finanzas y fintech | Principiante | Wallet by BudgetBakers | 4 | 1 | 3 | 7 |
| 15 | [PagoNexo](#pagonexo) | `pagonexo` | Finanzas y fintech | Avanzado | Stripe | 5 | 1 | 3 | 10 |
| 16 | [ConectaRed](#conectared) | `conectared` | Redes sociales y comunicación | Avanzado | Facebook | 6 | 2 | 3 | 11 (3 async) |
| 17 | [ClipLoop](#cliploop) | `cliploop` | Redes sociales y comunicación | Avanzado | TikTok | 5 | 3 | 3 | 10 (2 async) |
| 18 | [TalentoPro](#talentopro) | `talentopro` | Redes sociales y comunicación | Principiante | LinkedIn | 5 | 1 | 3 | 9 (1 async) |
| 19 | [EquipoChat](#equipo-chat) | `equipo-chat` | Redes sociales y comunicación | Intermedio | Slack | 6 | 1 | 3 | 11 (1 async) |
| 20 | [Reunión360](#reunion-360) | `reunion-360` | Redes sociales y comunicación | Avanzado | Zoom | 5 | 1 | 3 | 9 |
| 21 | [AulaNube](#aulanube) | `aulanube` | Educación y EdTech | Intermedio | Moodle | 5 | 1 | 3 | 10 |
| 22 | [CodeCampus](#codecampus) | `codecampus` | Educación y EdTech | Intermedio | Codecademy | 4 | 2 | 3 | 9 (1 async) |
| 23 | [LinguaQuest](#linguaquest) | `linguaquest` | Educación y EdTech | Principiante | Duolingo | 4 | 1 | 3 | 7 |
| 24 | [MentorLink](#mentorlink) | `mentorlink` | Educación y EdTech | Principiante | Preply | 5 | 1 | 3 | 10 |
| 25 | [Memora](#memora) | `memora` | Educación y EdTech | Principiante | Quizlet | 4 | 1 | 3 | 7 |
| 26 | [SaludConecta](#saludconecta) | `saludconecta` | Salud y bienestar | Avanzado | Teladoc | 6 | 2 | 3 | 12 (1 async) |
| 27 | [ClínicaFlow](#clinicaflow) | `clinicaflow` | Salud y bienestar | Principiante | Clinical management systems | 5 | 1 | 3 | 10 |
| 28 | [VitalTrack](#vitaltrack) | `vitaltrack` | Salud y bienestar | Principiante | Fitbit | 5 | 2 | 3 | 9 |
| 29 | [FarmaClick](#farmaclick) | `farmaclick` | Salud y bienestar | Principiante | Online pharmacies | 5 | 1 | 3 | 9 |
| 30 | [MenteSerena](#menteserena) | `menteserena` | Salud y bienestar | Principiante | Calm | 4 | 1 | 3 | 7 |
| 31 | [RutaYa](#rutaya) | `rutaya` | Transporte y movilidad | Avanzado | Uber | 5 | 2 | 3 | 10 (1 async) |
| 32 | [Hospeda](#hospeda) | `hospeda` | Transporte y movilidad | Intermedio | Airbnb | 6 | 2 | 3 | 11 (1 async) |
| 33 | [VueloDirecto](#vuelodirecto) | `vuelodirecto` | Transporte y movilidad | Avanzado | Skyscanner | 4 | 2 | 3 | 9 |
| 34 | [CiudadEnRuta](#ciudadenruta) | `ciudadenruta` | Transporte y movilidad | Intermedio | Google Maps Transit | 4 | 2 | 3 | 9 |
| 35 | [ElectroRuta](#electroruta) | `electroruta` | Transporte y movilidad | Principiante | PlugShare | 4 | 2 | 3 | 9 |
| 36 | [ProyectoZen](#proyectozen) | `proyectozen` | Productividad y empresa | Intermedio | Trello | 5 | 2 | 3 | 10 (2 async) |
| 37 | [Cliente360](#cliente360) | `cliente360` | Productividad y empresa | Avanzado | Salesforce | 6 | 2 | 3 | 11 (2 async) |
| 38 | [EmpresaNexo](#empresanexo) | `empresanexo` | Productividad y empresa | Avanzado | Odoo | 5 | 2 | 3 | 11 (1 async) |
| 39 | [ArchivoNube](#archivonube) | `archivonube` | Productividad y empresa | Intermedio | Dropbox | 4 | 2 | 3 | 9 (2 async) |
| 40 | [FlujoBot](#flujobot) | `flujobot` | Productividad y empresa | Avanzado | Zapier | 5 | 2 | 3 | 9 (2 async) |
| 41 | [AsistenteNova](#asistentenova) | `asistentenova` | Inteligencia artificial y datos | Avanzado | ChatGPT | 5 | 2 | 3 | 9 |
| 42 | [DocuMente](#documente) | `documente` | Inteligencia artificial y datos | Avanzado | NotebookLM | 5 | 3 | 3 | 11 (2 async) |
| 43 | [DataVision](#datavision) | `datavision` | Inteligencia artificial y datos | Avanzado | Power BI | 4 | 3 | 3 | 10 (1 async) |
| 44 | [PixelIA](#pixelia) | `pixelia` | Inteligencia artificial y datos | Avanzado | Midjourney | 5 | 3 | 3 | 10 (2 async) |
| 45 | [AgenteFlow](#agenteflow) | `agenteflow` | Inteligencia artificial y datos | Avanzado | AI agent platforms | 6 | 2 | 3 | 11 (1 async) |
| 46 | [NubeStack](#nubestack) | `nubestack` | Infraestructura, DevOps y seguridad | Avanzado | Vercel | 5 | 2 | 3 | 10 (2 async) |
| 47 | [CódigoLibre](#codigolibre) | `codigolibre` | Infraestructura, DevOps y seguridad | Avanzado | GitHub | 6 | 2 | 3 | 13 (3 async) |
| 48 | [Monitorix](#monitorix) | `monitorix` | Infraestructura, DevOps y seguridad | Avanzado | Datadog | 6 | 2 | 3 | 10 (4 async) |
| 49 | [EscudoDigital](#escudodigital) | `escudodigital` | Infraestructura, DevOps y seguridad | Avanzado | SIEM platforms | 6 | 2 | 3 | 11 (4 async) |
| 50 | [APIHub](#apihub) | `apihub` | Infraestructura, DevOps y seguridad | Avanzado | Kong / API gateways | 5 | 2 | 3 | 10 (1 async) |

## Detalle por categoría

### 1. Streaming y entretenimiento

5 proyectos: [CineNova](#cinenova), [SonoraPlay](#sonoraplay), [StreamArena](#streamarena), [PixelForge](#pixelforge), [ComicVerse](#comicverse).

<a id="cinenova"></a>

#### CineNova

*Id: `cinenova` · Streaming y entretenimiento · Intermedio · referencia conceptual: [Netflix](https://www.netflix.com/)*

**Qué es.** Subscription platform for films and series.

**Qué muestran los diagramas.** Catalogue, playback, users, recommendations and payments.

**Arquitectura.** CineNova · inspirado en Netflix — suscripción de vídeo bajo demanda.

> - **L1:** suscriptor y curador de contenido; pasarela de pago externa.
> - **L2:** app web/móvil, API de catálogo (Spring), servicio de reproducción (Go), motor de recomendaciones (Python), facturación (Spring), bus de eventos Kafka y dos almacenes: metadatos (PostgreSQL) y vídeo segmentado (S3 + CDN).
> - **L3:** el Reproductor se abre en token de sesión, enrutado de segmentos hacia el CDN más cercano y aplicación de licencias DRM.
> - **Flujo clave:** la app solicita reproducción → el servicio lee segmentos del almacenamiento y publica eventos de visualización en Kafka, que alimentan el motor de recomendaciones.

- **L1 · Personas:** `Subscriber` — Watches films and series on any device. · `Content Curator` — Adds titles to the catalogue and manages releases.
- **L1 · Sistemas externos:** `Payment Gateway` (HTTPS) — Authorises the monthly subscription.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web and Mobile App` | React + TypeScript | Catalogue, profiles and playback UI. |
| `Catalogue API` | Java / Spring Boot | Titles, seasons, availability and search. |
| `Playback Service` | Go | Streams video and manages sessions. |
| `Recommendation Engine` | Python | Personalised rows based on viewing history. |
| `Billing Service` | Java / Spring Boot | Subscriptions, invoices and retries. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Event Bus` | cola | Kafka | Decouples playback, billing and notifications. |
| `Media Database` | base de datos | PostgreSQL | Titles, users, subscriptions and viewing history. |
| `Video Storage` | base de datos | S3 + CDN | Encoded video segments. |

| L3 · componentes de `Playback Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Session Manager` | Go | Issues and validates playback tokens. |
| `Segment Router` | Go | Selects the CDN node closest to the viewer. |
| `DRM Module` | Go | Applies licence rules per device. |

**Relaciones.** 11 relaciones · 1 asíncrona.

<a id="sonoraplay"></a>

#### SonoraPlay

*Id: `sonoraplay` · Streaming y entretenimiento · Intermedio · referencia conceptual: [Spotify](https://www.spotify.com/)*

**Qué es.** Music streaming with playlists and podcasts.

**Qué muestran los diagramas.** Audio library, playback, search and subscriptions.

**Arquitectura.** SonoraPlay · inspirado en Spotify — música y podcasts con suscripción.

> - **L1:** oyente y gestor de artistas; pago externo y hosts de podcasts.
> - **L2:** reproductor móvil/web (React Native), API de audio (Node), reproducción (Go), listas de reproducción (Kotlin), suscripciones (Spring), índice de búsqueda OpenSearch y base de catálogo.
> - **L3:** el Reproductor se abre en handler de rangos HTTP, caché de segmentos populares y adaptación de bitrate a la conexión.
> - **Flujo clave:** la búsqueda es síncrona sobre OpenSearch mientras que la reproducción sirve audio cacheado cerca del oyente.

- **L1 · Personas:** `Listener` — Plays music and follows podcasts. · `Artist Manager` — Uploads and manages artist profiles.
- **L1 · Sistemas externos:** `Payment Gateway` (HTTPS) — Authorises subscriptions. · `Podcast Hosts` (HTTPS) — Publishes podcast episodes.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Mobile and Web Player` | React Native | Player, library and playlists. |
| `Audio API` | Node.js | Catalogue, search and user library. |
| `Playback Service` | Go | Audio streaming and caching. |
| `Playlist Service` | Kotlin | Collaborative and automatic playlists. |
| `Subscription Service` | Java / Spring Boot | Plans, trials and invoices. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Search Index` | base de datos | OpenSearch | Full-text catalogue search. |
| `Media Database` | base de datos | PostgreSQL | Tracks, artists, playlists and listeners. |

| L3 · componentes de `Playback Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Stream Handler` | Go | Serves ranged audio requests and resumes playback. |
| `Segment Cache` | Go | Caches popular tracks close to the listener. |
| `Bitrate Adapter` | Go | Adapts the stream to the connection quality. |

**Relaciones.** 11 relaciones.

<a id="streamarena"></a>

#### StreamArena

*Id: `streamarena` · Streaming y entretenimiento · Avanzado · referencia conceptual: [Twitch](https://www.twitch.tv/)*

**Qué es.** Live streaming platform for creators.

**Qué muestran los diagramas.** Live streaming, real-time chat, channels and donations.

**Arquitectura.** StreamArena · inspirado en Twitch — emisión en directo con chat.

> - **L1:** espectador y streamer; pasarela de pago y CDN de distribución.
> - **L2:** estudio del creador (Next), ingesta RTMP (Rust), distribución en directo (Go), chat en tiempo real (Elixir), canales (Kotlin), donaciones (Spring), cola Redis Streams y base de plataforma.
> - **L3:** el Chat se abre en presencia, broker de mensajes y filtro de moderación con timeouts por canal.
> - **Flujo clave:** el streamer envía RTMP a la ingesta, que empaqueta segmentos hacia el CDN; el chat hace fan-out por Redis Streams.

- **L1 · Personas:** `Viewer` — Watches live channels and donates. · `Streamer` — Broadcasts live and moderates the chat.
- **L1 · Sistemas externos:** `Payment Gateway` (HTTPS) — Processes donations. · `CDN Provider` (RTMP) — Distributes the live stream.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Streamer Studio` | Next.js | Broadcast control and channel settings. |
| `Ingest Gateway` | Rust | Receives the RTMP stream from creators. |
| `Live Streaming Service` | Go | Packages and distributes segments. |
| `Chat Service` | Elixir | Real-time messages and moderation. |
| `Channel Service` | Kotlin | Channels, followers and discovery. |
| `Donation Service` | Java / Spring Boot | Donations and creator payouts. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Chat Stream` | cola | Redis Streams | Fan-out of chat messages. |
| `Platform Database` | base de datos | PostgreSQL | Channels, users and donations. |

| L3 · componentes de `Chat Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Presence Tracker` | Elixir | Tracks who is connected to each channel. |
| `Message Broker` | Elixir | Broadcasts messages to connected clients. |
| `Moderation Filter` | Elixir | Applies channel rules and timeouts. |

**Relaciones.** 11 relaciones · 1 asíncrona.

<a id="pixelforge"></a>

#### PixelForge

*Id: `pixelforge` · Streaming y entretenimiento · Avanzado · referencia conceptual: [Steam](https://store.steampowered.com/)*

**Qué es.** Digital store and library of video games.

**Qué muestran los diagramas.** Catalogue, licences, downloads, community and achievements.

**Arquitectura.** PixelForge · inspirado en Steam — tienda y biblioteca de videojuegos.

> - **L1:** jugador y estudio asociado; pago y autoridad fiscal externas.
> - **L2:** cliente de juego (C++/Electron), escaparate (Go), licencias (Spring), descargas (Go), comunidad (Laravel), logros (Rust), base de catálogo y almacenamiento de builds en S3.
> - **L3:** Licencias se abre en registro de entitlements, emisor de licencias firmadas y revocación por reembolso.
> - **Flujo clave:** validar propiedad y descargar son rutas independientes: la licencia autoriza, el servicio de descarga sirve los binarios.

- **L1 · Personas:** `Gamer` — Buys, downloads and plays games. · `Studio Partner` — Publishes games and manages royalties.
- **L1 · Sistemas externos:** `Payment Gateway` (HTTPS) — Processes purchases. · `Tax Authority` (HTTPS) — Issues invoicing data.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Game Client` | C++ / Electron | Library, store and matchmaking. |
| `Storefront API` | Go | Catalogue, prices and regional pricing. |
| `Licensing Service` | Java / Spring Boot | Entitlements and DRM licences. |
| `Download Service` | Go | Chunked downloads and patch delivery. |
| `Community Service` | PHP / Laravel | Reviews, forums and friends. |
| `Achievement Service` | Rust | Tracks achievements and statistics. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Catalogue Database` | base de datos | PostgreSQL | Games, prices and reviews. |
| `Build Storage` | base de datos | S3 | Game binaries and patches. |

| L3 · componentes de `Licensing Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Entitlement Store` | Java | Records which owner has which game. |
| `Licence Issuer` | Java | Signs device licences and renews them. |
| `Refund Handler` | Java | Revokes licences when a purchase is refunded. |

**Relaciones.** 11 relaciones.

<a id="comicverse"></a>

#### ComicVerse

*Id: `comicverse` · Streaming y entretenimiento · Principiante · referencia conceptual: [WEBTOON](https://www.webtoons.com/)*

**Qué es.** Digital library of comics and graphic novels.

**Qué muestran los diagramas.** Publications, chapters, favourites and monetisation.

**Arquitectura.** ComicVerse · inspirado en WEBTOON — cómics digitales por capítulos.

> - **L1:** lector y estudio editorial; red de anuncios y pago externos.
> - **L2:** app lectora (Flutter), API editorial (NestJS), entrega de páginas (Java), suscripciones (Go), moderación (Python), base de cómics y páginas en S3 + CDN.
> - **L3:** la API editorial se abre en gestor de series, cargador de capítulos y motor de calendario de publicación por huso horario.
> - **Flujo clave:** publicar pasa por moderación (gRPC) antes de ser visible; las páginas se sirven desde CDN y el hueco libre lo llena la red de anuncios.

- **L1 · Personas:** `Reader` — Reads daily releases and saves favourites. · `Publishing Studio` — Publishes chapters and schedules releases.
- **L1 · Sistemas externos:** `Ad Network` (HTTPS) — Fills free slots with advertising. · `Payment Provider` (HTTPS) — Processes the subscription.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Reader App` | Flutter | Library, reader and daily list. |
| `Publishing API` | NestJS | Series, chapters and schedules. |
| `Reader Service` | Java | Page delivery and reading progress. |
| `Subscription Service` | Go | Plans and ad-free access. |
| `Moderation Service` | Python | Content review and reports. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Comics Database` | base de datos | PostgreSQL | Series, chapters and progress. |
| `Image Storage` | base de datos | S3 + CDN | Chapter pages. |

| L3 · componentes de `Publishing API` | Tecnología | Descripción |
| --- | --- | --- |
| `Series Manager` | NestJS | Series metadata and the release calendar. |
| `Chapter Uploader` | NestJS | Validates and stores chapter pages. |
| `Schedule Engine` | NestJS | Plans daily releases by time zone. |

**Relaciones.** 10 relaciones.

### 2. Comercio electrónico y marketplaces

5 proyectos: [CompraFácil](#comprafacil), [ModaClick](#modaclick), [HechoLocal](#hecho-local), [SaborExpress](#saborexpress), [MercadoVerde](#mercadoverde).

<a id="comprafacil"></a>

#### CompraFácil

*Id: `comprafacil` · Comercio electrónico y marketplaces · Intermedio · referencia conceptual: [Mercado Libre](https://www.mercadolibre.com/)*

**Qué es.** Marketplace connecting buyers with many sellers.

**Qué muestran los diagramas.** Catalogue, sellers, orders, payments and reputation.

**Arquitectura.** CompraFácil · inspirado en Mercado Libre — marketplace multi-vendedor.

> - **L1:** comprador y vendedor; pasarela que reparte el pago y API de transportista.
> - **L2:** tienda web/móvil (React), API del marketplace (Spring), búsqueda (Go), pedidos (Kotlin), orquestador de pagos (Java), servicio de vendedores (Node), cola RabbitMQ, base del marketplace e índice de búsqueda OpenSearch.
> - **L3:** el servicio de pedidos se abre en máquina de estados, reserva de stock con caducidad y adaptador del transportista.
> - **Flujo clave:** el pedido publica eventos en RabbitMQ que desacoplan pago repartido, métricas de vendedor y envío.

- **L1 · Personas:** `Buyer` — Searches products and places orders. · `Seller` — Publishes products and ships orders.
- **L1 · Sistemas externos:** `Payment Gateway` — Splits the payment between buyers and sellers. · `Carrier API` — Generates shipping labels and tracks parcels.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web and Mobile Store` | React | Catalogue, cart and checkout. |
| `Marketplace API` | Java / Spring Boot | Listings, orders and disputes. |
| `Search Service` | Go | Faceted search and ranking. |
| `Order Service` | Kotlin | Order state machine and history. |
| `Payment Orchestrator` | Java | Split payments, refunds and payouts. |
| `Seller Service` | Node.js | Seller onboarding and metrics. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Order Events` | cola | RabbitMQ | Asynchronous order processing. |
| `Marketplace Database` | base de datos | PostgreSQL | Listings, orders and ratings. |
| `Product Search Index` | base de datos | OpenSearch | Denormalised catalogue index. |

| L3 · componentes de `Order Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Order State Machine` | Kotlin | Validates transitions between states. |
| `Reservation Module` | Kotlin | Reserves stock for the configured minutes. |
| `Shipping Adapter` | Kotlin | Talks to the carrier API. |

**Relaciones.** 13 relaciones · 1 asíncrona.

<a id="modaclick"></a>

#### ModaClick

*Id: `modaclick` · Comercio electrónico y marketplaces · Principiante · referencia conceptual: [Zara online](https://www.zara.com/)*

**Qué es.** Online clothing and accessories store.

**Qué muestran los diagramas.** Inventory, variants, cart and logistics.

**Arquitectura.** ModaClick · inspirado en Zara online — tienda de moda con almacén.

> - **L1:** comprador y operario de almacén; pago y paquetería externos.
> - **L2:** escaparate (Next), API comercial (Node), inventario (Java), checkout (Kotlin), fulfillment (Java) y base de tienda.
> - **L3:** el inventario se abre en libro de stock, pool de reservas y reposición automática de unidades bajas.
> - **Flujo clave:** checkout reserva stock y dispara fulfillment; el operario recoge y envía desde su propio contenedor.

- **L1 · Personas:** `Shopper` — Browses collections and places orders. · `Warehouse Operator` — Picks, packs and ships orders.
- **L1 · Sistemas externos:** `Payment Gateway` — Processes card payments. · `Parcel Carrier` — Collects and delivers parcels.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Storefront` | Next.js | Catalogue, variants and cart. |
| `Commerce API` | Node.js | Products, prices and carts. |
| `Inventory Service` | Java | Stock by size and colour. |
| `Checkout Service` | Kotlin | Orders and returns. |
| `Fulfilment Service` | Java | Pick, pack and shipment status. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Store Database` | base de datos | PostgreSQL | Products, carts and orders. |

| L3 · componentes de `Inventory Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Stock Ledger` | Java | Available units per size and colour. |
| `Reservation Pool` | Java | Holds units while checkout runs. |
| `Replenishment Job` | Java | Reorders stock when a size runs low. |

**Relaciones.** 10 relaciones.

<a id="hecho-local"></a>

#### HechoLocal

*Id: `hecho-local` · Comercio electrónico y marketplaces · Principiante · referencia conceptual: [Etsy](https://www.etsy.com/)*

**Qué es.** Marketplace for handmade and artisan products.

**Qué muestran los diagramas.** Shops, listings, commissions and reviews.

**Arquitectura.** HechoLocal · inspirado en Etsy — marketplace de artesanía.

> - **L1:** comprador y artesano; pago con reparto y correo postal externos.
> - **L2:** web del marketplace (React), servicio de tiendas (Rails), carrito y checkout (Node), motor de comisiones (Java), reseñas (Python) y base del marketplace.
> - **L3:** el motor de comisiones se abre en cálculo de tarifas, calendario de pagos a artesanos y resolución fiscal por destino.
> - **Flujo clave:** el checkout calcula la comisión antes de cobrar y el motor la aplica después a los pagos del artesano.

- **L1 · Personas:** `Buyer` — Buys handmade items from small shops. · `Artisan` — Runs a shop and manages commissions.
- **L1 · Sistemas externos:** `Payment Gateway` — Pays out to artisans. · `Postal Service` — Ships international parcels.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Marketplace Web` | React | Search, shops and checkout. |
| `Shop Service` | Ruby on Rails | Shops, listings and reviews. |
| `Cart and Checkout` | Node.js | Cart, coupons and payment. |
| `Commission Engine` | Java | Fees, payouts and tax. |
| `Review Service` | Python | Ratings and moderation. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Marketplace Database` | base de datos | PostgreSQL | Shops, listings and orders. |

| L3 · componentes de `Commission Engine` | Tecnología | Descripción |
| --- | --- | --- |
| `Fee Calculator` | Java | Applies category rates and promotions. |
| `Payout Scheduler` | Java | Aggregates and schedules artisan payouts. |
| `Tax Resolver` | Java | Applies tax rules by destination. |

**Relaciones.** 10 relaciones.

<a id="saborexpress"></a>

#### SaborExpress

*Id: `saborexpress` · Comercio electrónico y marketplaces · Avanzado · referencia conceptual: [Uber Eats](https://www.ubereats.com/)*

**Qué es.** Food delivery ordering from local restaurants.

**Qué muestran los diagramas.** Restaurants, orders, couriers and GPS tracking.

**Arquitectura.** SaborExpress · inspirado en Uber Eats — comida a domicilio.

> - **L1:** cliente, restaurante y repartidor; pago y mapas externos.
> - **L2:** app de pedido (React Native), portal de restaurante (React), pedidos (Kotlin), despacho (Go), cartas (Node), localización (Rust), cola NATS de despacho y base de entrega.
> - **L3:** el despacho se abre en emparejamiento de repartidores, optimización de ruta multi-parada y cálculo de ETA con tráfico en vivo.
> - **Flujo clave:** el restaurante acepta → el despacho busca repartidor y publica asignaciones por NATS; el repartidor reporta desde la app.

- **L1 · Personas:** `Customer` — Orders food and tracks the courier. · `Restaurant` — Receives orders and prepares them. · `Courier` — Accepts trips, delivers orders and reports the location.
- **L1 · Sistemas externos:** `Payment Gateway` — Charges the customer and pays couriers. · `Maps Provider` — Geocoding and route calculation.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Ordering App` | React Native | Menu, cart and live tracking. |
| `Restaurant Portal` | React | Menus, orders and preparation times. |
| `Order Service` | Kotlin | Order lifecycle and dispatch. |
| `Dispatch Service` | Go | Assigns couriers and routes. |
| `Menu Service` | Node.js | Menus, dishes and availability. |
| `Location Service` | Rust | Geocoding and ETA calculation. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Dispatch Events` | cola | NATS | Courier assignments and location updates. |
| `Delivery Database` | base de datos | PostgreSQL | Orders, menus and ratings. |

| L3 · componentes de `Dispatch Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Courier Matcher` | Go | Pairs open orders with nearby couriers. |
| `Route Optimiser` | Go | Builds multi-stop delivery routes. |
| `ETA Calculator` | Go | Predicts arrival times from live traffic. |

**Relaciones.** 12 relaciones · 1 asíncrona.

<a id="mercadoverde"></a>

#### MercadoVerde

*Id: `mercadoverde` · Comercio electrónico y marketplaces · Principiante · referencia conceptual: [Instacart](https://www.instacart.com/)*

**Qué es.** Online supermarket with scheduled delivery slots.

**Qué muestran los diagramas.** Stock, order picking, payments and delivery windows.

**Arquitectura.** MercadoVerde · inspirado en Instacart — supermercado con franjas.

> - **L1:** comprador y picker de tienda; pago y última milla externos.
> - **L2:** app de cesta (React), escaparate (Node), cesta (Kotlin), franjas horarias (Java), picking optimizado (Go) y base de pedidos.
> - **L3:** la cesta se abre en gestión de líneas, reglas de sustitución y bloqueo de stock mientras el cliente decide.
> - **Flujo clave:** reservar franja y cesta se hacen en paralelo; la liberación de la tarea de picking la dispara la capacidad de la franja.

- **L1 · Personas:** `Shopper` — Schedules a delivery and picks products. · `Picker` — Walks the aisles collecting the order.
- **L1 · Sistemas externos:** `Payment Gateway` — Processes the payment. · `Last Mile Carrier` — Delivers the order.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Grocery Web App` | React | Catalogue, substitution rules and slots. |
| `Storefront API` | Node.js | Products, prices and promotions. |
| `Cart Service` | Kotlin | Cart, substitutions and reservations. |
| `Slot Service` | Java | Capacity per delivery window. |
| `Picking Service` | Go | Optimises the pick route. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Order Database` | base de datos | PostgreSQL | Products, carts and orders. |

| L3 · componentes de `Cart Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Basket Manager` | Kotlin | Adds, removes and prices basket lines. |
| `Substitution Rules` | Kotlin | Applies customer replacement preferences. |
| `Reservation Lock` | Kotlin | Holds stock while the basket is open. |

**Relaciones.** 10 relaciones.

### 3. Finanzas y fintech

5 proyectos: [NovaBank](#novabank), [BilleteraGo](#billetera-go), [Inverta](#inverta), [CuentaClara](#cuentaclara), [PagoNexo](#pagonexo).

<a id="novabank"></a>

#### NovaBank

*Id: `novabank` · Finanzas y fintech · Avanzado · referencia conceptual: [Revolut](https://www.revolut.com/)*

**Qué es.** Digital bank with accounts, cards and transfers.

**Qué muestran los diagramas.** Identity, accounts, transfers, audit and security.

**Arquitectura.** NovaBank · inspirado en Revolut — banca digital con tarjetas.

> - **L1:** cliente minorista y officer de compliance; red de tarjetas, raíles interbancarios (ISO 20022) e IdP (OIDC) externos.
> - **L2:** app móvil (Swift/Kotlin), core bancario (Spring), pagos (Kotlin), motor de riesgo (Python), compliance (Go), libro mayor PostgreSQL y stream Kafka de eventos financieros.
> - **L3:** el core se abre en el libro de partida doble, el orquestador de transferencias con reintentos y el generador de extractos PDF.
> - **Flujo clave:** cada movimiento contable publica en Kafka, que alimenta la traza de auditoría que revisa compliance.

- **L1 · Personas:** `Retail Customer` — Opens an account and moves money. · `Compliance Officer` — Reviews flagged transactions.
- **L1 · Sistemas externos:** `Card Network` (HTTPS) — Authorises card transactions. · `National Bank Rails` (ISO 20022) — Sends interbank transfers. · `Identity Provider` (OIDC) — Verifies the customer identity.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Mobile Banking App` | Swift + Kotlin | Accounts, cards and transfers. |
| `Core Banking Service` | Java / Spring Boot | Accounts, ledger and transfers. |
| `Payment Service` | Kotlin | Card authorisations and refunds. |
| `Risk Engine` | Python | Fraud scoring and limits. |
| `Compliance Service` | Go | KYC, AML alerts and audit trail. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Ledger Database` | base de datos | PostgreSQL | Double-entry ledger. |
| `Events Stream` | cola | Kafka | Financial events and audit stream. |

| L3 · componentes de `Core Banking Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Ledger Module` | Java | Double-entry postings and balances. |
| `Transfer Orchestrator` | Java | Schedules and retries interbank transfers. |
| `Statement Generator` | Java | Monthly statements in PDF. |

**Relaciones.** 10 relaciones · 1 asíncrona.

<a id="billetera-go"></a>

#### BilleteraGo

*Id: `billetera-go` · Finanzas y fintech · Avanzado · referencia conceptual: [PayPal](https://www.paypal.com/)*

**Qué es.** Digital wallet for payments and collections.

**Qué muestran los diagramas.** Balances, payments, merchants, reconciliation and fraud.

**Arquitectura.** BilleteraGo · inspirado en PayPal — billetera digital con comercios.

> - **L1:** usuario de billetera y comercio; red bancaria y buró de fraude.
> - **L2:** app (React Native), API de billetera (Go), gateway de comercio (Node), libro mayor (Java), antifraude (Python), base de billetera y cola Kafka de transacciones.
> - **L3:** el libro mayor se abre en motor de saldos, reconciliador contra extractos bancarios y constructor de extractos mensuales.
> - **Flujo clave:** la API publica cada transacción en Kafka; el antifraude consume el stream y además consulta el buró de forma síncrona.

- **L1 · Personas:** `Wallet User` — Sends money and requests charges. · `Merchant` — Accepts wallet payments.
- **L1 · Sistemas externos:** `Banking Network` (HTTPS) — Settles to bank accounts. · `Fraud Bureau` (HTTPS) — Cross-checks transactions.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Wallet App` | React Native | Balance, send and request flows. |
| `Wallet API` | Go | Accounts, transfers and statements. |
| `Merchant Gateway` | Node.js | Payment capture for merchants. |
| `Ledger Service` | Java | Balances and reconciliation. |
| `Fraud Service` | Python | Rules and models for fraud detection. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Wallet Database` | base de datos | PostgreSQL | Wallets, transactions and statements. |
| `Fraud Events` | cola | Kafka | Transaction stream for scoring. |

| L3 · componentes de `Ledger Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Balance Engine` | Java | Computes available and pending balances. |
| `Reconciliator` | Java | Matches entries against bank statements. |
| `Statement Builder` | Java | Renders monthly wallet statements. |

**Relaciones.** 11 relaciones · 2 asíncronas.

<a id="inverta"></a>

#### Inverta

*Id: `inverta` · Finanzas y fintech · Principiante · referencia conceptual: [eToro](https://www.etoro.com/)*

**Qué es.** Investment tracking and portfolio management.

**Qué muestran los diagramas.** Assets, quotes, portfolios and risk analysis.

**Arquitectura.** Inverta · inspirado en eToro — carteras y seguimiento de inversión.

> - **L1:** inversor y asesor financiero; proveedor de mercado (streaming) y banco custodio externos.
> - **L2:** app web (React), cartera (Node), datos de mercado (Go), analítica de riesgo (Python), caché de precios Redis y base de carteras.
> - **L3:** el servicio de cartera se abre en seguimiento de posiciones, puente de órdenes al bróker y cálculo de rendimiento frente a índice.
> - **Flujo clave:** los precios entran por WebSocket y se cachean; el riesgo se calcula bajo demanda con gRPC.

- **L1 · Personas:** `Investor` — Builds a portfolio and tracks performance. · `Financial Advisor` — Reviews client portfolios.
- **L1 · Sistemas externos:** `Market Data Provider` (WebSocket) — Streams prices and news. · `Custodian Bank` (HTTPS) — Safekeeps the securities.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Investor Web App` | React | Portfolio, charts and orders. |
| `Portfolio Service` | Node.js | Positions, orders and performance. |
| `Market Data Service` | Go | Prices and corporate actions. |
| `Risk Analytics` | Python | Volatility, exposure and VaR. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Price Cache` | base de datos | Redis | Latest quotes. |
| `Portfolio Database` | base de datos | PostgreSQL | Positions, orders and history. |

| L3 · componentes de `Portfolio Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Position Tracker` | Node.js | Maintains holdings and average cost. |
| `Order Gateway` | Node.js | Places and cancels broker orders. |
| `Performance Calculator` | Node.js | Computes returns against benchmarks. |

**Relaciones.** 9 relaciones.

<a id="cuentaclara"></a>

#### CuentaClara

*Id: `cuentaclara` · Finanzas y fintech · Principiante · referencia conceptual: [Wallet by BudgetBakers](https://www.budgetbakers.com/)*

**Qué es.** Personal budgeting and expense control.

**Qué muestran los diagramas.** Transactions, categories, budgets and reports.

**Arquitectura.** CuentaClara · inspirado en BudgetBakers — control de gasto personal.

> - **L1:** único actor (propietario del presupuesto); banco vía open banking.
> - **L2:** app (Flutter), transacciones (Node), presupuestos (Kotlin), informes (Python) y base de presupuestos.
> - **L3:** el motor de presupuestos se abre en cálculo de límites, despacho de alertas antes del límite y previsión de cierre de mes.
> - **Flujo clave:** la app importa movimientos del banco y los clasifica antes de compararlos con el presupuesto de la categoría.

- **L1 · Personas:** `Budget Owner` — Tracks spending and sets budgets.
- **L1 · Sistemas externos:** `Open Banking Provider` — Imports transactions from the bank.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Budget App` | Flutter | Transactions, budgets and reports. |
| `Transaction Service` | Node.js | Normalises and categorises movements. |
| `Budget Engine` | Kotlin | Budgets, alerts and forecasts. |
| `Reporting Service` | Python | Monthly summaries and exports. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Budget Database` | base de datos | PostgreSQL | Accounts, budgets and categories. |

| L3 · componentes de `Budget Engine` | Tecnología | Descripción |
| --- | --- | --- |
| `Budget Calculator` | Kotlin | Compares spend against category limits. |
| `Alert Dispatcher` | Kotlin | Warns before a budget is exceeded. |
| `Forecast Model` | Kotlin | Projects month-end balances. |

**Relaciones.** 7 relaciones.

<a id="pagonexo"></a>

#### PagoNexo

*Id: `pagonexo` · Finanzas y fintech · Avanzado · referencia conceptual: [Stripe](https://stripe.com/)*

**Qué es.** Payments API for commerce applications.

**Qué muestran los diagramas.** REST API, payments, webhooks, antifraud and bank integration.

**Arquitectura.** PagoNexo · inspirado en Stripe — API de pagos para desarrolladores.

> - **L1:** desarrollador del comercio y analista de operaciones; banco liquidador y esquemas de tarjeta externos.
> - **L2:** dashboard (React), API pública (Go), orquestador de pagos (Go), despachador de webhooks firmados (Rust), antifraude (Python) y base de pagos.
> - **L3:** el orquestador se abre en gestor de intenciones, política de reintentos por motivo de rechazo y planificador de liquidaciones.
> - **Flujo clave:** la intención de pago pasa por antifraude antes de ir a los esquemas; el resultado se notifica por webhook firmado.

- **L1 · Personas:** `Merchant Developer` — Integrates the API. · `Operations Analyst` — Reviews payments and disputes.
- **L1 · Sistemas externos:** `Banking Partner` — Settles funds to merchants. · `Card Schemes` — Authorises cards worldwide.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Developer Dashboard` | React | Keys, logs and test payments. |
| `Payments API` | Go | Public REST API. |
| `Payment Orchestrator` | Go | Payment intents and retries. |
| `Webhook Dispatcher` | Rust | Signed event delivery. |
| `Antifraud Service` | Python | Rules and risk scoring. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Ledger Database` | base de datos | PostgreSQL | Payments, fees and settlements. |

| L3 · componentes de `Payment Orchestrator` | Tecnología | Descripción |
| --- | --- | --- |
| `Intent Manager` | Go | Creates and tracks payment intents. |
| `Retry Policy` | Go | Retries declines with issuer-specific rules. |
| `Settlement Planner` | Go | Batches captures for settlement. |

**Relaciones.** 10 relaciones.

### 4. Redes sociales y comunicación

5 proyectos: [ConectaRed](#conectared), [ClipLoop](#cliploop), [TalentoPro](#talentopro), [EquipoChat](#equipo-chat), [Reunión360](#reunion-360).

<a id="conectared"></a>

#### ConectaRed

*Id: `conectared` · Redes sociales y comunicación · Avanzado · referencia conceptual: [Facebook](https://www.facebook.com/)*

**Qué es.** Social network with posts, followers and comments.

**Qué muestran los diagramas.** Profiles, feed, graph, notifications and moderation.

**Arquitectura.** ConectaRed · inspirado en Facebook — red social con feed y grafo.

> - **L1:** miembro y moderador de comunidad; correo y objeto de almacenamiento.
> - **L2:** app (React Native), publicación (Kotlin), feed (Go), grafo social (Java), notificaciones (Node), moderación (Python), cola Kafka de posts y base social.
> - **L3:** el feed se abre en worker de fan-out, ranker de relevancia y lector de timeline que fusiona fuentes.
> - **Flujo clave:** publicar escribe en Kafka; el feed consume y reordena, y la notificación se dispara desde el propio fan-out.

- **L1 · Personas:** `Member` — Publishes posts and interacts with friends. · `Community Moderator` — Sanctions reported content.
- **L1 · Sistemas externos:** `Email Provider` (SMTP) — Delivers notification emails. · `Object Storage` (HTTPS) — Stores photos and videos.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web and Mobile App` | React Native | Feed, profile and uploads. |
| `Post Service` | Kotlin | Publishing, reactions and comments. |
| `Feed Service` | Go | Fan-out on read and ranking. |
| `Graph Service` | Java | Friendships and follower graph. |
| `Notification Service` | Node.js | Push and email notifications. |
| `Moderation Service` | Python | Reports, classifiers and blocks. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Feed Stream` | cola | Kafka | Fan-out of post events. |
| `Social Database` | base de datos | PostgreSQL | Profiles, posts and edges. |

| L3 · componentes de `Feed Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Fan-out Worker` | Go | Replicates posts to follower timelines. |
| `Ranker` | Go | Scores posts for the personal feed. |
| `Timeline Reader` | Go | Merges ranked and chronological sources. |

**Relaciones.** 11 relaciones · 3 asíncronas.

<a id="cliploop"></a>

#### ClipLoop

*Id: `cliploop` · Redes sociales y comunicación · Avanzado · referencia conceptual: [TikTok](https://www.tiktok.com/)*

**Qué es.** Short video social network.

**Qué muestran los diagramas.** Video processing, personalised feed and analytics.

**Arquitectura.** ClipLoop · inspirado en TikTok — vídeo corto con feed personalizado.

> - **L1:** creador y espectador; CDN de vídeo y socio de moderación.
> - **L2:** estudio del creador (Next), ingesta (Rust), transcodificación (Go), recomendaciones (Python), feed (Kotlin), cola Kafka de trabajos, feature store Redis y base ClickHouse de métricas.
> - **L3:** las recomendaciones se abre en generación de candidatos, modelo de ranking y constructor de vectores de interacción.
> - **Flujo clave:** subir encola un job de transcodificación que un worker consume; el feed pide el siguiente clip por gRPC.

- **L1 · Personas:** `Creator` — Uploads short clips. · `Viewer` — Watches a personalised feed.
- **L1 · Sistemas externos:** `CDN Provider` (HTTPS) — Serves video segments. · `Moderation Partner` — Checks content safety.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Creator Studio` | Next.js | Upload, editing and analytics. |
| `Video Ingest` | Rust | Uploads and validates media. |
| `Transcoding Pipeline` | Go | Produces multiple renditions. |
| `Recommendation Service` | Python | Ranks clips for the viewer. |
| `Feed Service` | Kotlin | Serves the vertical feed. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Transcode Queue` | cola | Kafka | Video jobs. |
| `Feature Store` | base de datos | Redis | Recent interaction vectors. |
| `Video Database` | base de datos | ClickHouse | Clips, metadata and watch stats. |

| L3 · componentes de `Recommendation Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Candidate Generator` | Python | Retrieves candidate clips from recent activity. |
| `Ranking Model` | Python | Scores candidates for the viewer. |
| `Feature Builder` | Python | Builds the interaction vectors used at serving time. |

**Relaciones.** 10 relaciones · 2 asíncronas.

<a id="talentopro"></a>

#### TalentoPro

*Id: `talentopro` · Redes sociales y comunicación · Principiante · referencia conceptual: [LinkedIn](https://www.linkedin.com/)*

**Qué es.** Professional network connecting companies and workers.

**Qué muestran los diagramas.** Profiles, connections, job offers and recommendations.

**Arquitectura.** TalentoPro · inspirado en LinkedIn — red profesional y empleo.

> - **L1:** profesional y reclutador; correo y verificación de antecedentes.
> - **L2:** app web (React), perfiles (Node), red (Java), empleo (Kotlin), notificaciones (Go) y base profesional.
> - **L3:** el servicio de empleo se abre en publicación de vacantes, tracker de candidatos y matcher que rankea candidatos contra la oferta.
> - **Flujo clave:** aplicar escribe la candidatura; el servicio de red avisa por invitaciones y el de notificaciones entrega por correo.

- **L1 · Personas:** `Professional` — Builds a profile and applies to offers. · `Recruiter` — Publishes vacancies and searches candidates.
- **L1 · Sistemas externos:** `Email Provider` (SMTP) — Sends invitations and alerts. · `Background Check Provider` — Verifies professional records.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web App` | React | Profiles, feed and vacancies. |
| `Profile Service` | Node.js | CV, experience and endorsements. |
| `Network Service` | Java | Connections and degree of separation. |
| `Job Service` | Kotlin | Vacancies, applications and screening. |
| `Notification Service` | Go | Invitations and job alerts. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Professional Database` | base de datos | PostgreSQL | Profiles, offers and applications. |

| L3 · componentes de `Job Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Vacancy Publisher` | Kotlin | Publishes and expires job offers. |
| `Applicant Tracker` | Kotlin | Moves candidates through the pipeline. |
| `Screening Matcher` | Kotlin | Ranks applicants against the offer. |

**Relaciones.** 9 relaciones · 1 asíncrona.

<a id="equipo-chat"></a>

#### EquipoChat

*Id: `equipo-chat` · Redes sociales y comunicación · Intermedio · referencia conceptual: [Slack](https://slack.com/)*

**Qué es.** Team messaging for organisations.

**Qué muestran los diagramas.** Channels, messages, files, permissions and search.

**Arquitectura.** EquipoChat · inspirado en Slack — mensajería de equipo.

> - **L1:** miembro y admin de workspace; correo y almacenamiento de objetos.
> - **L2:** cliente escritorio/móvil (Electron), API de mensajería (Node), gateway en tiempo real (Go), presencia (Redis), ficheros (Kotlin), búsqueda (Rust) y base de mensajes.
> - **L3:** el gateway se abre en hub de conexiones, router de suscripciones por sala y buffer de backpressure para clientes lentos.
> - **Flujo clave:** el cliente mantiene un WebSocket con el gateway, que entrega eventos sin bloquear la API de mensajería.

- **L1 · Personas:** `Member` — Talks in channels and shares files. · `Workspace Admin` — Manages members and retention policies.
- **L1 · Sistemas externos:** `Email Provider` (SMTP) — Sends invitations and digests. · `Object Storage` — Stores uploaded files.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Desktop and Mobile Client` | Electron | Channels, threads and search. |
| `Messaging API` | Node.js | Messages, reactions and threads. |
| `Real-time Gateway` | Go | WebSocket fan-out. |
| `Presence Service` | Redis | Typing and availability. |
| `File Service` | Kotlin | Uploads and virus scanning. |
| `Search Service` | Rust | Full-text message search. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Message Database` | base de datos | PostgreSQL | Channels, messages and members. |

| L3 · componentes de `Real-time Gateway` | Tecnología | Descripción |
| --- | --- | --- |
| `Connection Hub` | Go | Maintains the WebSocket sessions. |
| `Subscription Router` | Go | Delivers events to the right rooms. |
| `Backpressure Buffer` | Go | Throttles slow clients without dropping events. |

**Relaciones.** 11 relaciones · 1 asíncrona.

<a id="reunion-360"></a>

#### Reunión360

*Id: `reunion-360` · Redes sociales y comunicación · Avanzado · referencia conceptual: [Zoom](https://zoom.us/)*

**Qué es.** Video conferencing and collaborative meetings.

**Qué muestran los diagramas.** Rooms, signalling, media, recordings and calendar.

**Arquitectura.** Reunión360 · inspirado en Zoom — videconferencia con grabación.

> - **L1:** anfitrión y invitado; calendario (OAuth) y relay TURN externos.
> - **L2:** cliente web (WebRTC), reuniones (Node), señalización (Go), gateway de medios SFU (C++), grabación (Kotlin) y base de reuniones.
> - **L3:** el gateway de medios se abre en mezcla selectiva de flujos, jitter buffer que oculta pérdidas y estimador de ancho de banda por nodo.
> - **Flujo clave:** señalización negocia el WebRTC y los medios viajan en paralelo por el SFU, que deriva a la grabación.

- **L1 · Personas:** `Host` — Schedules and starts the meeting. · `Guest` — Joins from a browser or device.
- **L1 · Sistemas externos:** `Calendar Provider` (OAuth) — Reads and creates events. · `TURN Provider` (STUN/TURN) — Relays media in restrictive networks.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web Client` | WebRTC | Media controls and virtual background. |
| `Meeting Service` | Node.js | Rooms, tokens and scheduling. |
| `Signalling Service` | Go | WebSocket negotiation. |
| `Media Gateway` | C++ | SFU mixing and forwarding. |
| `Recording Service` | Kotlin | Stores recordings and transcripts. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Meeting Database` | base de datos | PostgreSQL | Meetings, participants and recordings. |

| L3 · componentes de `Media Gateway` | Tecnología | Descripción |
| --- | --- | --- |
| `SFU Mixer` | C++ | Forwards selective streams between participants. |
| `Jitter Buffer` | C++ | Reorders packets and hides network loss. |
| `Bandwidth Estimator` | C++ | Adapts quality to each participant link. |

**Relaciones.** 9 relaciones.

### 5. Educación y EdTech

5 proyectos: [AulaNube](#aulanube), [CodeCampus](#codecampus), [LinguaQuest](#linguaquest), [MentorLink](#mentorlink), [Memora](#memora).

<a id="aulanube"></a>

#### AulaNube

*Id: `aulanube` · Educación y EdTech · Intermedio · referencia conceptual: [Moodle](https://moodle.org/)*

**Qué es.** Learning management platform.

**Qué muestran los diagramas.** Courses, enrolments, assessments, grades and roles.

**Arquitectura.** AulaNube · inspirado en Moodle — gestión del aprendizaje.

> - **L1:** estudiante, profesor y administrador; IdP SAML y proveedor de videoconferencia externos.
> - **L2:** app web (React), cursos (Kotlin), evaluaciones (Java), libreta de notas (Python), notificaciones (Node) y base del LMS.
> - **L3:** el servicio de evaluaciones se abre en motor de cuestionarios, almacén de entregas y flujo de calificación hacia el profesor.
> - **Flujo clave:** el SSO delegado en el IdP valida a profesores y alumnos antes de tocar el contenido del curso.

- **L1 · Personas:** `Student` — Follows courses and submits assessments. · `Teacher` — Creates content and grades submissions. · `Administrator` — Manages users and roles.
- **L1 · Sistemas externos:** `Identity Provider` (SAML) — Single sign-on for staff and students. · `Videoconference Provider` (HTTPS) — Live lessons.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Learning Web App` | React | Courses, forums and grades. |
| `Course Service` | Kotlin | Content, sections and enrolments. |
| `Assessment Service` | Java | Quizzes, submissions and grading. |
| `Gradebook Service` | Python | Weighted grades and transcripts. |
| `Notification Service` | Node.js | Deadlines and announcements. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `LMS Database` | base de datos | PostgreSQL | Courses, users and submissions. |

| L3 · componentes de `Assessment Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Quiz Engine` | Java | Builds and scores quizzes. |
| `Submission Store` | Java | Collects attempts and resubmissions. |
| `Grading Workflow` | Java | Routes work to the teacher and records grades. |

**Relaciones.** 10 relaciones.

<a id="codecampus"></a>

#### CodeCampus

*Id: `codecampus` · Educación y EdTech · Intermedio · referencia conceptual: [Codecademy](https://www.codecademy.com/)*

**Qué es.** Interactive programming courses.

**Qué muestran los diagramas.** Code editor, evaluator, exercises and progress.

**Arquitectura.** CodeCampus · inspirado en Codecademy — cursos de programación.

> - **L1:** alumno y autor de cursos; sandbox de ejecución y tutor LLM.
> - **L2:** IDE en el navegador (Monaco + React), cursos (Node), evaluador (Go), tutor (Python), cola NATS de ejecuciones y base de cursos.
> - **L3:** el evaluador se abre en test harness, despachador al sandbox con aislamiento y scorer de comprobaciones fallidas.
> - **Flujo clave:** cada solución se encola y se ejecuta fuera del proceso del evaluador; el resultado puntúa y guarda el progreso.

- **L1 · Personas:** `Learner` — Writes code and runs exercises. · `Course Author` — Writes exercises and solutions.
- **L1 · Sistemas externos:** `Code Runner Sandbox` (gRPC) — Executes untrusted code. · `LLM Tutor` — Explains the exercise in natural language.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Learning IDE` | Monaco + React | Editor, lessons and console. |
| `Course Service` | Node.js | Curriculum and progress. |
| `Evaluator Service` | Go | Test harness and scoring. |
| `Tutor Service` | Python | Hints powered by a language model. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Sandbox Queue` | cola | NATS | Execution jobs. |
| `Course Database` | base de datos | PostgreSQL | Lessons and progress. |

| L3 · componentes de `Evaluator Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Test Harness` | Go | Runs the exercise tests against the submission. |
| `Sandbox Dispatcher` | Go | Queues executions and isolates each run. |
| `Scorer` | Go | Computes the score and the failing checks. |

**Relaciones.** 9 relaciones · 1 asíncrona.

<a id="linguaquest"></a>

#### LinguaQuest

*Id: `linguaquest` · Educación y EdTech · Principiante · referencia conceptual: [Duolingo](https://www.duolingo.com/)*

**Qué es.** Language learning with challenges and streaks.

**Qué muestran los diagramas.** Lessons, levels, gamification and learning progress.

**Arquitectura.** LinguaQuest · inspirado en Duolingo — idiomas con gamificación.

> - **L1:** único actor (aprendiz); proveedor de texto a voz externo.
> - **L2:** app móvil (Flutter), lecciones (Kotlin), repetición espaciada (Python), progreso (Go) y base del aprendiz.
> - **L3:** el servicio de lecciones se abre en constructor de ejercicios, ajuste dinámico de dificultad y gestor de vidas y reintentos.
> - **Flujo clave:** cada lección agenda revisiones futuras que el servicio de repetición espaciada decide cuándo repasar.

- **L1 · Personas:** `Learner` — Completes daily lessons and reviews vocabulary.
- **L1 · Sistemas externos:** `Text to Speech Provider` — Pronunciation of exercises.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Mobile App` | Flutter | Lessons, streak and badges. |
| `Lesson Service` | Kotlin | Exercises, hearts and levels. |
| `Spaced Repetition Service` | Python | Schedules reviews. |
| `Progress Service` | Go | Streaks, leagues and achievements. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Learner Database` | base de datos | PostgreSQL | Learners, lessons and reviews. |

| L3 · componentes de `Lesson Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Exercise Builder` | Kotlin | Assembles lessons from the item bank. |
| `Difficulty Tuner` | Kotlin | Adjusts item difficulty to the learner. |
| `Heart Manager` | Kotlin | Applies the lives and retry rules. |

**Relaciones.** 7 relaciones.

<a id="mentorlink"></a>

#### MentorLink

*Id: `mentorlink` · Educación y EdTech · Principiante · referencia conceptual: [Preply](https://preply.com/)*

**Qué es.** Marketplace connecting students and tutors.

**Qué muestran los diagramas.** Profiles, schedule, bookings, sessions and payments.

**Arquitectura.** MentorLink · inspirado en Preply — clases particulares con pago en depósito (escrow).

> - **L1:** alumno y profesor; pago en depósito y proveedor de vídeo.
> - **L2:** marketplace (Next), reservas (Node), disponibilidad (Kotlin), sesión (Java), pagos al profesor (Go) y base del marketplace.
> - **L3:** las reservas se abren en bloqueo de franja, despacho de recordatorios y gestor de cancelaciones con ventanas de reembolso.
> - **Flujo clave:** el pago queda retenido hasta que la sesión se completa y el servicio de pagos libera la ganancia del profesor.

- **L1 · Personas:** `Student` — Books lessons with a tutor. · `Tutor` — Publishes availability and teaches.
- **L1 · Sistemas externos:** `Payment Provider` — Escrows the session payment. · `Video Provider` — Carries the lesson call.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Tutor Marketplace` | Next.js | Search, profiles and booking. |
| `Booking Service` | Node.js | Slots, reservations and reminders. |
| `Schedule Service` | Kotlin | Availability and time zones. |
| `Session Service` | Java | Live lesson room and notes. |
| `Payout Service` | Go | Tutor earnings and invoices. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Marketplace Database` | base de datos | PostgreSQL | Tutors, bookings and sessions. |

| L3 · componentes de `Booking Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Slot Reserve` | Node.js | Holds a tutor slot while the booking completes. |
| `Reminder Dispatcher` | Node.js | Sends lesson reminders. |
| `Cancellation Handler` | Node.js | Applies the refund windows. |

**Relaciones.** 10 relaciones.

<a id="memora"></a>

#### Memora

*Id: `memora` · Educación y EdTech · Principiante · referencia conceptual: [Quizlet](https://quizlet.com/)*

**Qué es.** Flashcards and quick self-assessments.

**Qué muestran los diagramas.** Decks, question banks, study sessions and statistics.

**Arquitectura.** Memora · inspirado en Quizlet — tarjetas de estudio.

> - **L1:** estudiante y profesor; sin sistemas externos (ejemplo autocontenido).
> - **L2:** app de estudio (React Native), mazos (Node), sesiones (Kotlin), estadísticas (Python) y base de estudio.
> - **L3:** las sesiones se abren en el scheduler de repetición espaciada, estado de la sesión en curso y escritura de cada repaso.
> - **Flujo clave:** el repaso alimenta las estadísticas que luego deciden qué tarjetas débiles volver a mostrar.

- **L1 · Personas:** `Student` — Creates decks and studies. · `Teacher` — Shares decks with the class.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Study App` | React Native | Decks, sessions and statistics. |
| `Deck Service` | Node.js | Cards, tags and sharing. |
| `Session Service` | Kotlin | Spaced repetition scheduling. |
| `Statistics Service` | Python | Progress and weak cards. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Study Database` | base de datos | PostgreSQL | Decks, cards and sessions. |

| L3 · componentes de `Session Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Scheduler` | Kotlin | Orders cards by the spaced repetition algorithm. |
| `Session State` | Kotlin | Tracks the current run and its results. |
| `Review Writer` | Kotlin | Persists each review for the statistics. |

**Relaciones.** 7 relaciones.

### 6. Salud y bienestar

5 proyectos: [SaludConecta](#saludconecta), [ClínicaFlow](#clinicaflow), [VitalTrack](#vitaltrack), [FarmaClick](#farmaclick), [MenteSerena](#menteserena).

<a id="saludconecta"></a>

#### SaludConecta

*Id: `saludconecta` · Salud y bienestar · Avanzado · referencia conceptual: [Teladoc](https://www.teladochealth.com/)*

**Qué es.** Telemedicine and remote consultations.

**Qué muestran los diagramas.** Patients, professionals, appointments, video calls and records.

**Arquitectura.** SaludConecta · inspirado en Teladoc — teleconsulta.

> - **L1:** paciente y médico; mutua y proveedor de vídeo externos.
> - **L2:** app del paciente (React Native), portal clínico (React), citas (Kotlin), telemedicina (Java), historia clínica (Go), facturación (Python), base clínica y stream Kafka de auditoría.
> - **L3:** la historia clínica se abre en almacén de notas, gestor de consentimientos y logger de auditoría inmutable.
> - **Flujo clave:** cada acceso a la historia se registra en el stream de auditoría; la facturación se dispara desde el flujo clínico.

- **L1 · Personas:** `Patient` — Books a consultation from home. · `Doctor` — Attends the consultation and writes the record.
- **L1 · Sistemas externos:** `Health Insurance` — Authorises and bills the consultation. · `Video Provider` — Carries the teleconsultation.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Patient App` | React Native | Booking, records and prescriptions. |
| `Clinical Portal` | React | Agenda and patient history. |
| `Appointment Service` | Kotlin | Slots, bookings and reminders. |
| `Telemedicine Service` | Java | Consultation rooms and notes. |
| `Clinical Records Service` | Go | EHR and prescriptions. |
| `Billing Service` | Python | Claims and reconciliation. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Clinical Database` | base de datos | PostgreSQL | Patients, appointments and records. |
| `Audit Stream` | cola | Kafka | Immutable access log. |

| L3 · componentes de `Clinical Records Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Record Store` | Go | Stores clinical notes and prescriptions. |
| `Consent Manager` | Go | Applies patient access consent. |
| `Audit Logger` | Go | Writes the immutable access trail. |

**Relaciones.** 12 relaciones · 1 asíncrona.

<a id="clinicaflow"></a>

#### ClínicaFlow

*Id: `clinicaflow` · Salud y bienestar · Principiante · referencia conceptual: [Clinical management systems](https://www.hl7.org/fhir/)*

**Qué es.** Clinic management: appointments and patient care.

**Qué muestran los diagramas.** Agenda, clinical record, care and billing.

**Arquitectura.** ClínicaFlow · inspirado en sistemas de gestión clínica.

> - **L1:** paciente, recepcionista y médico; aseguradora y laboratorio.
> - **L2:** app de la clínica (Angular), agenda (Java), historia clínica (Kotlin), facturación (Python), integraciones (Node) y base clínica.
> - **L3:** la historia clínica se abre en editor de notas estructuradas, emisor de recetas y visor de historial longitudinal.
> - **Flujo clave:** la agenda dispara la facturación, que delega en el servicio de integraciones los contactos con laboratorio y aseguradora.

- **L1 · Personas:** `Patient` — Books and manages appointments. · `Receptionist` — Manages the agenda and billing. · `Doctor` — Records the visit.
- **L1 · Sistemas externos:** `Insurance Provider` — Checks coverage. · `Laboratory` — Returns test results.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Clinic Web App` | Angular | Agenda, patients and billing. |
| `Scheduling Service` | Java | Appointments and waiting room. |
| `Clinical Record Service` | Kotlin | Notes, diagnosis and prescriptions. |
| `Billing Service` | Python | Invoices and insurance claims. |
| `Integration Service` | Node.js | Lab and insurance connectors. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Clinic Database` | base de datos | PostgreSQL | Patients, visits and invoices. |

| L3 · componentes de `Clinical Record Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Note Editor` | Kotlin | Structured visit notes and diagnosis codes. |
| `Prescription Writer` | Kotlin | Issues and renews prescriptions. |
| `History Viewer` | Kotlin | Presents the longitudinal record. |

**Relaciones.** 10 relaciones.

<a id="vitaltrack"></a>

#### VitalTrack

*Id: `vitaltrack` · Salud y bienestar · Principiante · referencia conceptual: [Fitbit](https://www.fitbit.com/)*

**Qué es.** Activity tracking and habit coaching.

**Qué muestran los diagramas.** Sensors, metrics, goals and mobile sync.

**Arquitectura.** VitalTrack · inspirado en Fitbit — actividad y coaching.

> - **L1:** usuario con wearable y coach; nube del fabricante del dispositivo.
> - **L2:** app móvil (Swift), sincronización (Go), métricas (Python), metas (Kotlin), panel del coach (React), serie temporal ClickHouse y caché Redis de agregados.
> - **L3:** el servicio de métricas se abre en escritor de series, agregador de totales y detector de anomalías de frecuencia cardiaca.
> - **Flujo clave:** los lotes de sensores se ingieren por lotes y se agregan para que el panel del coach no lea la serie cruda.

- **L1 · Personas:** `Tracker User` — Wears the device and reviews progress. · `Coach` — Reviews the metrics and adjusts goals.
- **L1 · Sistemas externos:** `Wearable Cloud` — Firmware updates and device sync.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Mobile App` | Swift | Dashboard, goals and social streaks. |
| `Sync Service` | Go | Ingests sensor batches. |
| `Metrics Service` | Python | Steps, sleep and heart rate. |
| `Goal Service` | Kotlin | Goals, streaks and reminders. |
| `Coach Dashboard` | React | Client overview. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Metrics Database` | base de datos | ClickHouse | Time series of measurements. |
| `Metrics Cache` | base de datos | Redis | Latest aggregated values. |

| L3 · componentes de `Metrics Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Series Writer` | Python | Appends sensor measurements to the store. |
| `Aggregator` | Python | Rolls up daily and weekly totals. |
| `Anomaly Detector` | Python | Flags unusual heart-rate patterns. |

**Relaciones.** 9 relaciones.

<a id="farmaclick"></a>

#### FarmaClick

*Id: `farmaclick` · Salud y bienestar · Principiante · referencia conceptual: [Online pharmacies](https://www.fda.gov/drugs)*

**Qué es.** Pharmacy catalogue and regulated prescription orders.

**Qué muestran los diagramas.** Products, inventory, prescriptions and controlled dispatch.

**Arquitectura.** FarmaClick · farmacia online con receta regulada.

> - **L1:** cliente y farmacéutico; autoridad sanitaria y pasarela de pago.
> - **L2:** web de farmacia (Next), catálogo (Node), recetas (Kotlin), pedidos (Java), inventario (Go) y base de farmacia.
> - **L3:** el servicio de pedidos se abre en puerta de receta que bloquea medicamentos regulados, asignación de lote por caducidad y nota de envío regulada.
> - **Flujo clave:** nada regulado sale sin validación de la autoridad; el lote se elige por fecha de caducidad para minimizar mermas.

- **L1 · Personas:** `Customer` — Orders medicines and uploads a prescription. · `Pharmacist` — Validates the prescription and prepares the order.
- **L1 · Sistemas externos:** `Health Authority` — Validates prescriptions. · `Payment Gateway` — Processes the payment.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Pharmacy Web App` | Next.js | Catalogue, cart and prescriptions. |
| `Catalogue Service` | Node.js | Products and stock visibility. |
| `Prescription Service` | Kotlin | Uploads and validation state. |
| `Order Service` | Java | Orders and regulated dispatch. |
| `Inventory Service` | Go | Stock by batch and expiry. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Pharmacy Database` | base de datos | PostgreSQL | Products, orders and prescriptions. |

| L3 · componentes de `Order Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Prescription Gate` | Java | Blocks regulated items without validation. |
| `Batch Allocator` | Java | Assigns batches by expiry date. |
| `Dispatch Note` | Java | Generates the regulated shipping note. |

**Relaciones.** 9 relaciones.

<a id="menteserena"></a>

#### MenteSerena

*Id: `menteserena` · Salud y bienestar · Principiante · referencia conceptual: [Calm](https://www.calm.com/)*

**Qué es.** Meditation and wellness application.

**Qué muestran los diagramas.** Media library, routines, profiles and subscriptions.

**Arquitectura.** MenteSerena · inspirado en Calm — meditación y bienestar.

> - **L1:** único actor (socio); pago y CDN de contenido externos.
> - **L2:** app de bienestar (Swift), catálogo de sesiones (Node), reproductor (Kotlin), suscripciones (Go) y base de socios.
> - **L3:** el reproductor se abre en reproducción con búfer, seguimiento de progreso y descarga para uso sin conexión.
> - **Flujo clave:** el progreso se escribe en la base para retomar la sesión en otro dispositivo y alimentar las rachas.

- **L1 · Personas:** `Member` — Follows guided sessions daily.
- **L1 · Sistemas externos:** `Payment Provider` — Processes the subscription. · `Content CDN` — Serves audio and video.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Wellness App` | Swift | Library, player and timer. |
| `Content Service` | Node.js | Sessions, categories and metadata. |
| `Player Service` | Kotlin | Streams media and tracks progress. |
| `Subscription Service` | Go | Plans and trials. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Wellness Database` | base de datos | PostgreSQL | Members, progress and plans. |

| L3 · componentes de `Player Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Stream Player` | Kotlin | Buffers and plays session media. |
| `Progress Tracker` | Kotlin | Records the listening position. |
| `Download Manager` | Kotlin | Caches sessions for offline use. |

**Relaciones.** 7 relaciones.

### 7. Transporte y movilidad

5 proyectos: [RutaYa](#rutaya), [Hospeda](#hospeda), [VueloDirecto](#vuelodirecto), [CiudadEnRuta](#ciudadenruta), [ElectroRuta](#electroruta).

<a id="rutaya"></a>

#### RutaYa

*Id: `rutaya` · Transporte y movilidad · Avanzado · referencia conceptual: [Uber](https://www.uber.com/)*

**Qué es.** On-demand ride hailing application.

**Qué muestran los diagramas.** Passengers, drivers, geolocation, fares and trips.

**Arquitectura.** RutaYa · inspirado en Uber — viajes bajo demanda.

> - **L1:** pasajero y conductor; mapas y pasarela de pago externos.
> - **L2:** app de pasajero (Swift), app de conductor (Kotlin), emparejamiento (Go), viajes (Java), localización (Rust), stream Redis de posiciones y base de viajes.
> - **L3:** el emparejamiento se abre en broker de solicitudes, monitor de oferta por zona y cálculo de tarifa dinámica.
> - **Flujo clave:** el conductor publica posiciones por WebSocket y el emparejamiento decide quién recoge; la tarifa se calcula al cerrar.

- **L1 · Personas:** `Passenger` — Requests a ride and pays. · `Driver` — Accepts trips and drives.
- **L1 · Sistemas externos:** `Maps Provider` — Matching, routing and ETA. · `Payment Gateway` — Charges the fare.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Passenger App` | Swift | Request, tracking and payment. |
| `Driver App` | Kotlin | Trip offers and navigation. |
| `Matching Service` | Go | Matches drivers with requests. |
| `Trip Service` | Java | Trip lifecycle and fare computation. |
| `Location Service` | Rust | ETA and route estimation. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Matching Stream` | cola | Redis Streams | Driver positions and trip offers. |
| `Trips Database` | base de datos | PostgreSQL | Trips, drivers and fares. |

| L3 · componentes de `Matching Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Request Broker` | Go | Pairs ride requests with nearby drivers. |
| `Supply Monitor` | Go | Balances driver density by zone. |
| `Surge Calculator` | Go | Applies multipliers when demand peaks. |

**Relaciones.** 10 relaciones · 1 asíncrona.

<a id="hospeda"></a>

#### Hospeda

*Id: `hospeda` · Transporte y movilidad · Intermedio · referencia conceptual: [Airbnb](https://www.airbnb.com/)*

**Qué es.** Tourist accommodation booking platform.

**Qué muestran los diagramas.** Hosts, availability, bookings, payments and reviews.

**Arquitectura.** Hospeda · inspirado en Airbnb — alojamiento turístico.

> - **L1:** huésped y anfitrión; pago y mensajería SMS externos.
> - **L2:** web del huésped (Next), panel del anfitrión (React), búsqueda (Go), reservas (Kotlin), pagos (Java), reseñas (Node), stream Kafka de reservas y base de estancias.
> - **L3:** las reservas se abren en verificador de disponibilidad, retención de la estancia durante el pago y motor de reglas de la casa.
> - **Flujo clave:** la reserva se confirma sólo si el pago se autoriza; los eventos de reserva/cancelación se publican en Kafka.

- **L1 · Personas:** `Guest` — Searches and books a place. · `Host` — Publishes listings and accepts bookings.
- **L1 · Sistemas externos:** `Payment Provider` — Collects the payment and pays hosts. · `Messaging Provider` — Delivers transactional SMS.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Guest Web App` | Next.js | Search, listing and checkout. |
| `Host Dashboard` | React | Listings, calendar and earnings. |
| `Search Service` | Go | Geo search, filters and ranking. |
| `Booking Service` | Kotlin | Availability and reservations. |
| `Payment Service` | Java | Guest charge and host payout. |
| `Review Service` | Node.js | Ratings and moderation. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Booking Stream` | cola | Kafka | Booking and cancellation events. |
| `Stay Database` | base de datos | PostgreSQL | Listings, bookings and reviews. |

| L3 · componentes de `Booking Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Availability Checker` | Kotlin | Validates dates against the calendar. |
| `Reservation Holder` | Kotlin | Holds the stay while payment completes. |
| `House Rules Engine` | Kotlin | Applies host rules and quiet hours. |

**Relaciones.** 11 relaciones · 1 asíncrona.

<a id="vuelodirecto"></a>

#### VueloDirecto

*Id: `vuelodirecto` · Transporte y movilidad · Avanzado · referencia conceptual: [Skyscanner](https://www.skyscanner.net/)*

**Qué es.** Flight search and booking engine.

**Qué muestran los diagramas.** Search, fares, airlines and reservations.

**Arquitectura.** VueloDirecto · inspirado en Skyscanner — buscador de vuelos.

> - **L1:** viajero; GDS de aerolíneas y proveedor de pago externos.
> - **L2:** app de búsqueda (React), servicio de búsqueda (Go), tarifas (Kotlin), reservas (Java), caché Redis de tarifas y base de reservas.
> - **L3:** el servicio de tarifas se abre en reglas de precios, conversor de divisa por mercado y cálculo de impuestos y tasas.
> - **Flujo clave:** la búsqueda es cacheada con TTL porque el GDS es lento y las tarifas caducan; la emisión del PNR va directa al GDS.

- **L1 · Personas:** `Traveller` — Searches flights and books a seat.
- **L1 · Sistemas externos:** `Airline GDS` — Global Distribution System for availability. · `Payment Provider` — Processes the payment.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Travel Search App` | React | Search, filters and checkout. |
| `Search Service` | Go | Aggregates and caches results. |
| `Fare Service` | Kotlin | Pricing rules and currency. |
| `Booking Service` | Java | PNR creation and ticketing. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Search Cache` | base de datos | Redis | Cached fares with TTL. |
| `Booking Database` | base de datos | PostgreSQL | Bookings and passengers. |

| L3 · componentes de `Fare Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Pricing Rules` | Kotlin | Applies fare families and discounts. |
| `Currency Converter` | Kotlin | Normalises prices per market. |
| `Tax Calculator` | Kotlin | Adds taxes and carrier fees. |

**Relaciones.** 9 relaciones.

<a id="ciudadenruta"></a>

#### CiudadEnRuta

*Id: `ciudadenruta` · Transporte y movilidad · Intermedio · referencia conceptual: [Google Maps Transit](https://www.google.com/maps)*

**Qué es.** Public transport journey planner.

**Qué muestran los diagramas.** Maps, routes, stops, timetables and geospatial data.

**Arquitectura.** CiudadEnRuta · inspirado en Google Maps Transit — planificador multimodal.

> - **L1:** viajero urbano; feeds GTFS de las agencias y proveedor de mapas.
> - **L2:** app planificadora (Flutter), rutas (Go), horarios (Kotlin), geocodificación (Rust), caché espacial Redis y base de tránsito.
> - **L3:** el servicio de rutas se abre en constructor del grafo multimodal, búsqueda de viajes con transbordos y estimación de precio.
> - **Flujo clave:** el planificador resuelve el viaje sobre el grafo y usa la caché espacial para las paradas próximas; los mapas se piden aparte.

- **L1 · Personas:** `Commuter` — Plans routes and checks arrivals.
- **L1 · Sistemas externos:** `Transit Agency Feeds` — GTFS timetables. · `Maps Provider` — Base map tiles and geocoding.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Planner App` | Flutter | Route planning and live arrivals. |
| `Routing Service` | Go | Multimodal graph search. |
| `Timetable Service` | Kotlin | GTFS ingestion and departures. |
| `Geocoding Service` | Rust | Addresses to coordinates. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Spatial Cache` | base de datos | Redis | Nearby stops. |
| `Transit Database` | base de datos | PostgreSQL | Stops, routes and timetables. |

| L3 · componentes de `Routing Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Graph Builder` | Go | Maintains the multimodal transit graph. |
| `Journey Search` | Go | Finds routes with transfers and constraints. |
| `Fare Estimator` | Go | Prices each journey from the agency fares. |

**Relaciones.** 9 relaciones.

<a id="electroruta"></a>

#### ElectroRuta

*Id: `electroruta` · Transporte y movilidad · Principiante · referencia conceptual: [PlugShare](https://www.plugshare.com/)*

**Qué es.** Locator of charging stations for electric vehicles.

**Qué muestran los diagramas.** Stations, availability, maps and user reports.

**Arquitectura.** ElectroRuta · inspirado en PlugShare — puntos de recarga de coches.

> - **L1:** conductor de VE y operador de estación; mapas y red de recarga.
> - **L2:** app del conductor (React Native), estaciones (Go), disponibilidad (Kotlin), reportes (Node), índice espacial PostGIS y base de estaciones.
> - **L3:** la disponibilidad se abre en sondeo de estado por conector, espejo de sesiones en curso y predicción del tiempo de espera.
> - **Flujo clave:** el estado en vivo viene por OCPP de la red operadora y se separa del directorio fijo de estaciones.

- **L1 · Personas:** `EV Driver` — Finds a charger on the route. · `Station Operator` — Publishes charger availability.
- **L1 · Sistemas externos:** `Maps Provider` — Map tiles and routing. · `Charging Network Operator` — OCPP session data.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Driver App` | React Native | Nearby stations and plug types. |
| `Station Service` | Go | Stations, connectors and pricing. |
| `Availability Service` | Kotlin | Real-time status per connector. |
| `Reporting Service` | Node.js | User photos and broken chargers. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Geo Index` | base de datos | PostGIS | Spatial queries on chargers. |
| `Station Database` | base de datos | PostgreSQL | Stations, reports and pricing. |

| L3 · componentes de `Availability Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Status Poller` | Kotlin | Polls connectors for live status. |
| `Session Mirror` | Kotlin | Mirrors ongoing charging sessions. |
| `Prediction Model` | Kotlin | Estimates waiting time per station. |

**Relaciones.** 9 relaciones.

### 8. Productividad y empresa

5 proyectos: [ProyectoZen](#proyectozen), [Cliente360](#cliente360), [EmpresaNexo](#empresanexo), [ArchivoNube](#archivonube), [FlujoBot](#flujobot).

<a id="proyectozen"></a>

#### ProyectoZen

*Id: `proyectozen` · Productividad y empresa · Intermedio · referencia conceptual: [Trello](https://trello.com/)*

**Qué es.** Project management with Kanban boards.

**Qué muestran los diagramas.** Boards, tasks, users, comments and notifications.

**Arquitectura.** ProyectoZen · inspirado en Trello — gestión con tableros Kanban.

> - **L1:** miembro del proyecto y propietario; correo (SMTP) e IdP (OIDC).
> - **L2:** app web (React), tableros (Node), tareas (Kotlin), notificaciones (Go), búsqueda (Rust), stream Kafka de actividad y base de tableros.
> - **L3:** el servicio de tareas se abre en gestor de tarjetas, rastreador de dependencias y motor de asignación equilibrada.
> - **Flujo clave:** cada cambio de tarjeta publica en Kafka; las menciones se resuelven en el servicio de tareas y salen por correo.

- **L1 · Personas:** `Project Member` — Organises and updates tasks. · `Project Owner` — Configures boards and members.
- **L1 · Sistemas externos:** `Email Provider` (SMTP) — Sends digests and mentions. · `Identity Provider` (OIDC) — Single sign-on.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web App` | React | Boards, lists and cards. |
| `Board Service` | Node.js | Boards, lists and permissions. |
| `Task Service` | Kotlin | Cards, checklists and due dates. |
| `Notification Service` | Go | Mentions and reminders. |
| `Search Service` | Rust | Cross-board search. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Activity Stream` | cola | Kafka | Card change events. |
| `Board Database` | base de datos | PostgreSQL | Boards, cards and comments. |

| L3 · componentes de `Task Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Card Manager` | Kotlin | Creates cards, checklists and due dates. |
| `Dependency Tracker` | Kotlin | Links cards and blocks progress. |
| `Assignment Engine` | Kotlin | Balances work across members. |

**Relaciones.** 10 relaciones · 2 asíncronas.

<a id="cliente360"></a>

#### Cliente360

*Id: `cliente360` · Productividad y empresa · Avanzado · referencia conceptual: [Salesforce](https://www.salesforce.com/)*

**Qué es.** CRM for opportunities and customers.

**Qué muestran los diagramas.** Contacts, sales pipeline, automation, reports and integrations.

**Arquitectura.** Cliente360 · inspirado en Salesforce — CRM de oportunidades.

> - **L1:** comercial y cliente final; correo y ERP externos.
> - **L2:** app comercial (React), API CRM (Spring), oportunidades (Kotlin), automatización (Node), informes (Python), hub de integración (Go), cola RabbitMQ y base del CRM.
> - **L3:** las oportunidades se abren en etapas del pipeline con criterios de salida, motor de previsión ponderada y cálculo de oferta.
> - **Flujo clave:** la automatización encola reglas que el ERP y el correo consumen vía el hub de integración.

- **L1 · Personas:** `Sales Rep` — Manages opportunities and forecasts. · `Customer` — Reviews their account and cases.
- **L1 · Sistemas externos:** `Email Provider` (SMTP) — Sends sequences and alerts. · `ERP` — Syncs orders and billing data.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Sales Web App` | React | Pipeline, accounts and cases. |
| `CRM API` | Java / Spring Boot | Accounts, contacts and activities. |
| `Opportunity Service` | Kotlin | Pipeline stages and forecasting. |
| `Automation Service` | Node.js | Rules, triggers and actions. |
| `Reporting Service` | Python | Dashboards and exports. |
| `Integration Hub` | Go | Sync with ERP and email. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Automation Queue` | cola | RabbitMQ | Rule execution jobs. |
| `CRM Database` | base de datos | PostgreSQL | Accounts, contacts and activities. |

| L3 · componentes de `Opportunity Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Pipeline Stage` | Kotlin | Validates stage transitions and exit criteria. |
| `Forecast Engine` | Kotlin | Aggregates weighted pipeline by period. |
| `Quote Calculator` | Kotlin | Builds quotes from the price book. |

**Relaciones.** 11 relaciones · 2 asíncronas.

<a id="empresanexo"></a>

#### EmpresaNexo

*Id: `empresanexo` · Productividad y empresa · Avanzado · referencia conceptual: [Odoo](https://www.odoo.com/)*

**Qué es.** ERP for inventory, purchasing and accounting.

**Qué muestran los diagramas.** Business modules, workflows, permissions and a central database.

**Arquitectura.** EmpresaNexo · inspirado en Odoo — ERP integrado.

> - **L1:** contable, responsable de compras y operario de almacén; autoridad fiscal y banca electrónica.
> - **L2:** cliente web del ERP (React), facturación (Java), compras (Kotlin), inventario (Java), contabilidad (Python), base de negocio y cola Kafka de flujos documentales.
> - **L3:** la facturación se abre en constructor de facturas, resolutor de régimen fiscal y adaptador de facturación electrónica.
> - **Flujo clave:** un movimiento de inventario publica en Kafka; la contabilidad recibe los asientos desde facturación por gRPC.

- **L1 · Personas:** `Accountant` — Records invoices and closes the period. · `Purchasing Manager` — Orders from suppliers. · `Warehouse Clerk` — Receives and counts stock.
- **L1 · Sistemas externos:** `Tax Authority` — Electronic invoicing. · `Bank Gateway` — Payment files and reconciliation.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `ERP Web Client` | React | Invoices, stock and purchasing. |
| `Invoicing Service` | Java | Invoices, credit notes and taxes. |
| `Purchasing Service` | Kotlin | Suppliers, orders and receipts. |
| `Inventory Service` | Java | Warehouses, moves and valuation. |
| `Accounting Service` | Python | Ledger, periods and reports. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Business Database` | base de datos | PostgreSQL | All business documents. |
| `Document Queue` | cola | Kafka | Document workflows and approvals. |

| L3 · componentes de `Invoicing Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Invoice Builder` | Java | Totals, taxes and credit notes. |
| `Tax Resolver` | Java | Applies the regime per jurisdiction. |
| `E-invoice Adapter` | Java | Serialises to the authority format. |

**Relaciones.** 11 relaciones · 1 asíncrona.

<a id="archivonube"></a>

#### ArchivoNube

*Id: `archivonube` · Productividad y empresa · Intermedio · referencia conceptual: [Dropbox](https://www.dropbox.com/)*

**Qué es.** Cloud document storage and collaboration.

**Qué muestran los diagramas.** Files, sync, permissions, versions and shared links.

**Arquitectura.** ArchivoNube · inspirado en Dropbox — documentos en la nube.

> - **L1:** miembro y admin de workspace; objeto de almacenamiento y correo.
> - **L2:** cliente escritorio/móvil (C#/Kotlin), API de ficheros (Go), sincronización (Rust), compartir (Node), cola Kafka de análisis de virus y base de metadatos.
> - **L3:** la sincronización se abre en motor de deltas, resolutor de conflictos y sincronización selectiva por carpeta.
> - **Flujo clave:** el cliente intercambia deltas con el servicio, que escribe metadatos y encola el análisis antivirus de cada subida.

- **L1 · Personas:** `Member` — Uploads, syncs and shares documents. · `Workspace Admin` — Sets retention and external sharing policies.
- **L1 · Sistemas externos:** `Object Storage` — Durable file storage. · `Email Provider` (SMTP) — Share notifications.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Desktop and Mobile Client` | C# + Kotlin | Sync engine and file browser. |
| `File API` | Go | Metadata, versions and links. |
| `Sync Service` | Rust | Delta sync and conflict resolution. |
| `Sharing Service` | Node.js | Shared links and permissions. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Virus Scan Pipeline` | cola | Kafka | Scan every uploaded file. |
| `Metadata Database` | base de datos | PostgreSQL | Files, versions and ACLs. |

| L3 · componentes de `Sync Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Delta Engine` | Rust | Computes and applies file deltas. |
| `Conflict Resolver` | Rust | Merges concurrent edits or keeps both. |
| `Selective Sync` | Rust | Syncs only the folders the member chose. |

**Relaciones.** 9 relaciones · 2 asíncronas.

<a id="flujobot"></a>

#### FlujoBot

*Id: `flujobot` · Productividad y empresa · Avanzado · referencia conceptual: [Zapier](https://zapier.com/)*

**Qué es.** Visual automation of processes and integrations.

**Qué muestran los diagramas.** Triggers, tasks, connectors, queues and flow execution.

**Arquitectura.** FlujoBot · inspirado en Zapier — automatización visual de procesos.

> - **L1:** constructor de automatizaciones y responsable de operaciones; APIs de terceros como único externo.
> - **L2:** constructor de flujos (React), API de flujos (Node), motor de ejecución (Rust), conectores (Java), planificador (Go), cola Kafka de ejecuciones y base de flujos.
> - **L3:** el motor de ejecución se abre en runner de pasos con timeout, supervisor de reintentos con backoff y bóveda de credenciales.
> - **Flujo clave:** el planificador encola ejecuciones que el motor consume; los conectores son los únicos que tocan credenciales externas.

- **L1 · Personas:** `Automation Builder` — Designs flows and connects apps. · `Ops Manager` — Monitors runs and failures.
- **L1 · Sistemas externos:** `Third-party APIs` — CRM, email, accounting services.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Flow Builder` | React | Canvas of triggers and actions. |
| `Flow API` | Node.js | Flow definitions and versions. |
| `Execution Engine` | Rust | Runs steps and retries. |
| `Connector Service` | Java | OAuth and API calls to external apps. |
| `Scheduler Service` | Go | Cron triggers and schedules. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Execution Queue` | cola | Kafka | Run jobs and step retries. |
| `Flow Database` | base de datos | PostgreSQL | Flows, runs and credentials. |

| L3 · componentes de `Execution Engine` | Tecnología | Descripción |
| --- | --- | --- |
| `Step Runner` | Rust | Executes each step with its own timeout. |
| `Retry Supervisor` | Rust | Replays failed steps with backoff. |
| `Credential Vault` | Rust | Injects secrets into connector calls. |

**Relaciones.** 9 relaciones · 2 asíncronas.

### 9. Inteligencia artificial y datos

5 proyectos: [AsistenteNova](#asistentenova), [DocuMente](#documente), [DataVision](#datavision), [PixelIA](#pixelia), [AgenteFlow](#agenteflow).

<a id="asistentenova"></a>

#### AsistenteNova

*Id: `asistentenova` · Inteligencia artificial y datos · Avanzado · referencia conceptual: [ChatGPT](https://chat.openai.com/)*

**Qué es.** Conversational assistant backed by language models.

**Qué muestran los diagramas.** Interface, AI API, sessions, tools and moderation.

**Arquitectura.** AsistenteNova · inspirado en ChatGPT — asistente conversacional.

> - **L1:** usuario y revisor de seguridad; proveedor de modelo y proveedor de seguridad de contenido externos.
> - **L2:** app de chat (React), API de conversación (Go), orquestador (Python), registro de herramientas (Node), moderación (Python), libro de tokens y base de conversaciones (ambas PostgreSQL).
> - **L3:** el orquestador se abre en constructor de prompts, router de herramientas y adaptador de streams del modelo.
> - **Flujo clave:** la respuesta vuelve por SSE mientras el orquestador aplica el filtro de salida antes de entregarse al cliente.

- **L1 · Personas:** `User` — Chats with the assistant. · `Safety Reviewer` — Audits flagged conversations.
- **L1 · Sistemas externos:** `Language Model Provider` — Generates completions. · `Content Safety Provider` — Classifies harmful output.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Chat App` | React | Conversation UI and streaming. |
| `Conversation API` | Go | Sessions, history and quotas. |
| `Orchestrator` | Python | Prompts, routing and tool calls. |
| `Tool Registry` | Node.js | Function calling and tools. |
| `Moderation Service` | Python | Input and output filters. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Token Ledger` | base de datos | PostgreSQL | Usage and billing units. |
| `Conversation Database` | base de datos | PostgreSQL | Messages and sessions. |

| L3 · componentes de `Orchestrator` | Tecnología | Descripción |
| --- | --- | --- |
| `Prompt Builder` | Python | Assembles system, history and tool results. |
| `Tool Router` | Python | Selects and invokes the right tool. |
| `Stream Adapter` | Python | Normalises model streams for the client. |

**Relaciones.** 9 relaciones.

<a id="documente"></a>

#### DocuMente

*Id: `documente` · Inteligencia artificial y datos · Avanzado · referencia conceptual: [NotebookLM](https://notebooklm.google.com/)*

**Qué es.** Question answering over corporate documents.

**Qué muestran los diagramas.** Document upload, extraction, embeddings, vector search and RAG.

**Arquitectura.** DocuMente · inspirado en NotebookLM — QA sobre documentos internos.

> - **L1:** trabajador del conocimiento y administrador de contenidos; proveedor de embeddings y de modelo de lenguaje.
> - **L2:** app de investigación (Next), ingesta (Go), embeddings (Python), recuperación (Python), respuesta (Kotlin), almacén vectorial pgvector, almacenamiento de documentos S3 y cola Kafka de índice.
> - **L3:** la recuperación se abre en búsqueda híbrida, reranking y mapeo de citas hacia la fuente original.
> - **Flujo clave:** la ingesta encola trabajos de indexación; en consulta, la recuperación filtra y el modelo responde con citas trazables.

- **L1 · Personas:** `Knowledge Worker` — Uploads documents and asks questions. · `Content Administrator` — Curates the shared corpus.
- **L1 · Sistemas externos:** `Embedding Provider` — Generates vector embeddings. · `Language Model Provider` — Answers grounded in the corpus.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Research App` | Next.js | Upload, chat and citations. |
| `Ingestion Service` | Go | Parses, chunks and normalises. |
| `Embedding Service` | Python | Vectors and re-indexing. |
| `Retrieval Service` | Python | Hybrid search and reranking. |
| `Answer Service` | Kotlin | Prompting, citations and streaming. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Vector Store` | base de datos | pgvector | Embeddings per tenant. |
| `Document Storage` | base de datos | S3 | Original files and extracted text. |
| `Index Queue` | cola | Kafka | Ingestion and re-index jobs. |

| L3 · componentes de `Retrieval Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Hybrid Searcher` | Python | Combines vector and keyword retrieval. |
| `Reranker` | Python | Orders candidates for the question. |
| `Citation Mapper` | Python | Links answer spans back to sources. |

**Relaciones.** 11 relaciones · 2 asíncronas.

<a id="datavision"></a>

#### DataVision

*Id: `datavision` · Inteligencia artificial y datos · Avanzado · referencia conceptual: [Power BI](https://www.microsoft.com/power-platform/products/power-bi)*

**Qué es.** Business analytics and KPI dashboards.

**Qué muestran los diagramas.** Data sources, ETL, analytical models and visualisations.

**Arquitectura.** DataVision · inspirado en Power BI — analítica de negocio.

> - **L1:** analista y ejecutivo; sistemas de origen e IdP de seguridad por fila (row-level security).
> - **L2:** espacio de trabajo (React), consulta (Go), ETL (Python), capa semántica (Kotlin), jobs programados Airflow, almacén Snowflake y caché Redis de resultados.
> - **L3:** la capa semántica se abre en catálogo de métricas, rastreador de linaje y compilador de métricas a SQL.
> - **Flujo clave:** las métricas se resuelven en la capa semántica antes de compilarse a SQL; el ETL carga el almacén con Airflow.

- **L1 · Personas:** `Analyst` — Builds datasets and dashboards. · `Executive` — Reviews company-wide indicators.
- **L1 · Sistemas externos:** `Source Systems` — CRM, ERP and event tracking. · `Identity Provider` — Row-level security.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Analytics Workspace` | React | Datasets, measures and dashboards. |
| `Query Service` | Go | Translates queries to SQL. |
| `ETL Pipeline` | Python | Ingestion and transformations. |
| `Semantic Layer` | Kotlin | Metrics definitions and lineage. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Scheduled Jobs` | cola | Airflow | Refresh schedules. |
| `Warehouse` | base de datos | Snowflake | Curated analytical tables. |
| `Result Cache` | base de datos | Redis | Cached query results. |

| L3 · componentes de `Semantic Layer` | Tecnología | Descripción |
| --- | --- | --- |
| `Metric Catalog` | Kotlin | Stores the definition of each measure. |
| `Lineage Tracker` | Kotlin | Maps columns back to source fields. |
| `Query Compiler` | Kotlin | Translates metrics into SQL. |

**Relaciones.** 10 relaciones · 1 asíncrona.

<a id="pixelia"></a>

#### PixelIA

*Id: `pixelia` · Inteligencia artificial y datos · Avanzado · referencia conceptual: [Midjourney](https://www.midjourney.com/)*

**Qué es.** AI image generation from prompts.

**Qué muestran los diagramas.** Prompts, generation API, job queue and media storage.

**Arquitectura.** PixelIA · inspirado en Midjourney — generación de imágenes con IA.

> - **L1:** artista y revisor de confianza; nube GPU y proveedor de seguridad.
> - **L2:** estudio (Next), API de generación (Go), prompts (Python), seguridad (Python), scheduler Celery, clúster de inferencia (Python), tienda de medios S3 y base de generaciones.
> - **L3:** el clúster se abre en worker de difusión, empaquetado de lotes para llenar las GPU y filtro de salida de imágenes.
> - **Flujo clave:** la generación es asíncrona (Celery) y el cliente consulta el estado; nada llega al almacenamiento sin pasar por seguridad.

- **L1 · Personas:** `Artist` — Writes prompts and downloads results. · `Trust Reviewer` — Reviews flagged generations.
- **L1 · Sistemas externos:** `GPU Cloud` — Runs the diffusion models. · `Content Safety Provider` — Checks the prompts and images.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Studio App` | Next.js | Prompts, gallery and history. |
| `Generation API` | Go | Creates jobs and polls status. |
| `Prompt Service` | Python | Prompt rewriting and presets. |
| `Safety Service` | Python | Prompt and image moderation. |
| `Inference Cluster` | Python | Diffusion workers on GPUs. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `GPU Scheduler` | cola | Celery | GPU job scheduling. |
| `Media Store` | base de datos | S3 | Generated images and metadata. |
| `Generation Database` | base de datos | PostgreSQL | Jobs, credits and history. |

| L3 · componentes de `Inference Cluster` | Tecnología | Descripción |
| --- | --- | --- |
| `Diffusion Worker` | Python | Runs the sampling loop on a GPU. |
| `Batch Scheduler` | Python | Packs prompts to fill the GPUs. |
| `Output Filter` | Python | Applies safety checks to the result. |

**Relaciones.** 10 relaciones · 2 asíncronas.

<a id="agenteflow"></a>

#### AgenteFlow

*Id: `agenteflow` · Inteligencia artificial y datos · Avanzado · referencia conceptual: [AI agent platforms](https://www.anthropic.com/)*

**Qué es.** Builder of AI agents with external tools.

**Qué muestran los diagramas.** Agents, models, tools, memory, execution and observability.

**Arquitectura.** AgenteFlow — plataformas de agentes de IA con herramientas externas.

> - **L1:** constructor de agentes y operador; modelo de lenguaje y APIs externas que el agente puede invocar.
> - **L2:** estudio de agentes (React), runtime (Rust), gateway de modelos (Go), herramientas (Node), memoria (Python), trazas (Kotlin), cola NATS y almacén de trazas ClickHouse.
> - **L3:** el runtime se abre en bucle de razonamiento, ensamblador de contexto desde memoria y guardrails que detienen acciones inseguras.
> - **Flujo clave:** cada ejecución queda trazada en ClickHouse; el gateway de modelos centraliza cuotas y enrutado entre proveedores.

- **L1 · Personas:** `Agent Builder` — Designs agents and tools. · `Operator` — Reviews traces and failures.
- **L1 · Sistemas externos:** `Language Model Provider` — Runs the agent brain. · `External Tools` — APIs the agent can call.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Agent Studio` | React | Agent graph, prompts and tests. |
| `Agent Runtime` | Rust | Executes the reasoning loop. |
| `Model Gateway` | Go | Routes to models and enforces quotas. |
| `Tool Service` | Node.js | Tool schemas and execution. |
| `Memory Service` | Python | Short and long term memory. |
| `Tracing Service` | Kotlin | Traces, spans and evaluations. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Agent Queue` | cola | NATS | Agent run jobs. |
| `Tracing Store` | base de datos | ClickHouse | Traces and metrics. |

| L3 · componentes de `Agent Runtime` | Tecnología | Descripción |
| --- | --- | --- |
| `Reasoning Loop` | Rust | Plans, acts and observes until the goal is met. |
| `Context Assembler` | Rust | Builds the model context from memory and tools. |
| `Guardrail Checker` | Rust | Stops unsafe or out-of-scope actions. |

**Relaciones.** 11 relaciones · 1 asíncrona.

### 10. Infraestructura, DevOps y seguridad

5 proyectos: [NubeStack](#nubestack), [CódigoLibre](#codigolibre), [Monitorix](#monitorix), [EscudoDigital](#escudodigital), [APIHub](#apihub).

<a id="nubestack"></a>

#### NubeStack

*Id: `nubestack` · Infraestructura, DevOps y seguridad · Avanzado · referencia conceptual: [Vercel](https://vercel.com/)*

**Qué es.** Platform to deploy and operate cloud applications.

**Qué muestran los diagramas.** Repositories, builds, deployments, CDN and domains.

**Arquitectura.** NubeStack · inspirado en Vercel — plataforma de despliegue.

> - **L1:** desarrollador y operador de plataforma; proveedor Git y DNS.
> - **L2:** dashboard (Next), plano de control (Go), builds (Rust), control de despliegues (Kotlin), enrutado (Go), cola Kafka y base de control.
> - **L3:** el servicio de build se abre en clonador de fuentes, runner de builds en sandbox y publicador de imágenes en el registro.
> - **Flujo clave:** el webhook del proveedor Git dispara la cadena build → despliegue → enrutado, toda ella encolada en Kafka.

- **L1 · Personas:** `Developer` — Connects a repository and deploys. · `Platform Operator` — Monitors builds and routing.
- **L1 · Sistemas externos:** `Git Provider` — Webhooks and repository contents. · `DNS Provider` — Custom domains and certificates.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Developer Dashboard` | Next.js | Projects, logs and domains. |
| `Control Plane API` | Go | Projects, deployments and settings. |
| `Build Service` | Rust | Builds images from the repository. |
| `Deployment Controller` | Kotlin | Schedules rollouts and rollbacks. |
| `Routing Service` | Go | Domain routing and certificates. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Build Queue` | cola | Kafka | Build and deploy jobs. |
| `Control Plane Database` | base de datos | PostgreSQL | Projects and deployment history. |

| L3 · componentes de `Build Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Source Cloner` | Rust | Fetches the commit to build. |
| `Builder Runner` | Rust | Executes the build in a sandbox. |
| `Image Publisher` | Rust | Pushes the image to the registry. |

**Relaciones.** 10 relaciones · 2 asíncronas.

<a id="codigolibre"></a>

#### CódigoLibre

*Id: `codigolibre` · Infraestructura, DevOps y seguridad · Avanzado · referencia conceptual: [GitHub](https://github.com/)*

**Qué es.** Repository hosting and development collaboration.

**Qué muestran los diagramas.** Repositories, commits, branches, reviews and CI/CD.

**Arquitectura.** CódigoLibre · inspirado en GitHub — alojamiento de repositorios.

> - **L1:** colaborador y maintainer; correo y registro de paquetes.
> - **L2:** cliente web/git (React), servicio git (Rust), pull requests (Java), CI/CD (Go), búsqueda (Rust), notificaciones (Node), cola Kafka y base de metadatos.
> - **L3:** CI/CD se abre en parser de pipelines, pool de runners y almacén de artefactos con caché.
> - **Flujo clave:** el push dispara pipelines encolados; cada PR indexa cambios y pide notificaciones a los revisores.

- **L1 · Personas:** `Contributor` — Opens pull requests and reviews code. · `Maintainer` — Merges changes and manages access.
- **L1 · Sistemas externos:** `Email Provider` (SMTP) — Notifications and mentions. · `Package Registry` — Publishes and resolves dependencies.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Web and Git Client` | React | Repository browsing and clone. |
| `Git Service` | Rust | Object storage for repository data. |
| `Pull Request Service` | Java | Reviews, checks and merges. |
| `CI/CD Service` | Go | Pipelines, runners and artefacts. |
| `Search Service` | Rust | Code and issue search. |
| `Notification Service` | Node.js | Activity digests. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Pipeline Queue` | cola | Kafka | Build jobs. |
| `Metadata Database` | base de datos | PostgreSQL | Repositories, issues and PRs. |

| L3 · componentes de `CI/CD Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Pipeline Parser` | Go | Reads the pipeline definition. |
| `Runner Pool` | Go | Schedules jobs on the runners. |
| `Artefact Store` | Go | Keeps build outputs and caches. |

**Relaciones.** 13 relaciones · 3 asíncronas.

<a id="monitorix"></a>

#### Monitorix

*Id: `monitorix` · Infraestructura, DevOps y seguridad · Avanzado · referencia conceptual: [Datadog](https://www.datadoghq.com/)*

**Qué es.** Infrastructure monitoring and application performance.

**Qué muestran los diagramas.** Agents, metrics, logs, traces and alerting.

**Arquitectura.** Monitorix · inspirado en Datadog — observabilidad de infraestructura.

> - **L1:** SRE y desarrollador; pager de guardia y fuentes de métricas.
> - **L2:** UI de observabilidad (React), pasarela de ingesta (Go), métricas (Rust), logs (Go), trazas (Kotlin), alertas (Node), cola Kafka de telemetría y almacén ClickHouse.
> - **L3:** el servicio de métricas se abre en escritor de series, motor de rollups preagregados y guardia de cardinalidad.
> - **Flujo clave:** agentes externos empujan telemetría, que se bufferiza en Kafka antes de repartirse a métricas, logs y trazas.

- **L1 · Personas:** `SRE` — Investigates alerts and dashboards. · `Developer` — Inspects the traces of a request.
- **L1 · Sistemas externos:** `Pager Provider` — Sends on-call pages. · `Metric Sources` — Kubernetes, cloud and databases.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Observability UI` | React | Dashboards, logs and traces. |
| `Ingestion Gateway` | Go | Receives metrics, logs and spans. |
| `Metrics Service` | Rust | Aggregates time series. |
| `Log Service` | Go | Indexes and searches logs. |
| `Trace Service` | Kotlin | Trace storage and exemplars. |
| `Alerting Engine` | Node.js | Evaluates rules and groups alerts. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Telemetry Queue` | cola | Kafka | Buffers incoming telemetry. |
| `Metrics Store` | base de datos | ClickHouse | Metrics, logs and traces. |

| L3 · componentes de `Metrics Service` | Tecnología | Descripción |
| --- | --- | --- |
| `Series Writer` | Rust | Appends samples to the time series. |
| `Rollup Engine` | Rust | Pre-aggregates at fixed resolutions. |
| `Cardinality Guard` | Rust | Rejects label sets that would explode storage. |

**Relaciones.** 10 relaciones · 4 asíncronas.

<a id="escudodigital"></a>

#### EscudoDigital

*Id: `escudodigital` · Infraestructura, DevOps y seguridad · Avanzado · referencia conceptual: [SIEM platforms](https://attack.mitre.org/)*

**Qué es.** Security incident management and analysis.

**Qué muestran los diagramas.** Collectors, event correlation, rules, alerts and audit.

**Arquitectura.** EscudoDigital · plataformas SIEM — gestión de incidentes de seguridad.

> - **L1:** analista y engineer de seguridad; IdP, nube y inteligencia de amenazas externas.
> - **L2:** consola SOC (React), colector (Go), correlación (Rust), reglas de detección (Python), gestión de casos (Kotlin), cola Kafka de eventos, servicio de indicadores (Go) y base OpenSearch.
> - **L3:** el motor de correlación se abre en agregador por ventana, paso de enriquecimiento con contexto y constructor de incidentes.
> - **Flujo clave:** los colectores normalizan a Kafka; la correlación levanta incidentes que el analista tria en la consola.

- **L1 · Personas:** `Security Analyst` — Triages incidents and writes rules. · `Security Engineer` — Maintains collectors and integrations.
- **L1 · Sistemas externos:** `Identity Provider` — Authentication logs. · `Cloud Provider` — Audit and flow logs. · `Threat Intelligence` — Indicators of compromise.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `SOC Console` | React | Incidents, timelines and hunting. |
| `Collector Service` | Go | Receives events from sources. |
| `Correlation Engine` | Rust | Aggregates events into incidents. |
| `Detection Rules Service` | Python | Rule authoring and testing. |
| `Case Management` | Kotlin | Incidents, tasks and evidence. |
| `Correlation Service` | Go | Matches indicators and hashes. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Event Queue` | cola | Kafka | Normalises incoming events. |
| `SIEM Database` | base de datos | OpenSearch | Events, incidents and audit log. |

| L3 · componentes de `Correlation Engine` | Tecnología | Descripción |
| --- | --- | --- |
| `Window Aggregator` | Rust | Groups events into incident windows. |
| `Enrichment Step` | Rust | Adds asset and user context. |
| `Incident Builder` | Rust | Raises and de-duplicates incidents. |

**Relaciones.** 11 relaciones · 4 asíncronas.

<a id="apihub"></a>

#### APIHub

*Id: `apihub` · Infraestructura, DevOps y seguridad · Avanzado · referencia conceptual: [Kong / API gateways](https://www.konghq.com/)*

**Qué es.** Centralised API and service management.

**Qué muestran los diagramas.** Gateway, authentication, rate limiting, services and metrics.

**Arquitectura.** APIHub · inspirado en Kong — gestión centralizada de APIs.

> - **L1:** consumidor de APIs y engineer de plataforma; IdP y servicios upstream (los microservicios tras el gateway).
> - **L2:** portal de desarrollador (React), gateway (Go), políticas (Kotlin), registro de servicios (Java), analítica (Python), caché Redis de políticas y base del gateway.
> - **L3:** el gateway se abre en resolución de rutas, filtro de autenticación y aplicador de límites por consumidor.
> - **Flujo clave:** todo tráfico de datos pasa por el gateway; el portal sólo aplica configuración y emite métricas de uso por Kafka.

- **L1 · Personas:** `API Consumer` — Integrates with the published APIs. · `Platform Engineer` — Publishes and secures routes.
- **L1 · Sistemas externos:** `Identity Provider` — Validates API consumers. · `Upstream Services` — The microservices behind the gateway.

| L2 · contenedores | Tecnología | Descripción |
| --- | --- | --- |
| `Developer Portal` | React | API catalogue and keys. |
| `API Gateway` | Go | Routing, quotas and authentication. |
| `Policy Service` | Kotlin | Rate limits and authorisation. |
| `Service Registry` | Java | Upstream discovery and health. |
| `API Analytics` | Python | Usage reports and anomalies. |

| L2 · almacenes y colas | Tipo | Tecnología | Descripción |
| --- | --- | --- | --- |
| `Policy Cache` | base de datos | Redis | Cached policies and counters. |
| `Gateway Database` | base de datos | PostgreSQL | Routes, consumers and quotas. |

| L3 · componentes de `API Gateway` | Tecnología | Descripción |
| --- | --- | --- |
| `Route Resolver` | Go | Maps requests to upstream services. |
| `Auth Filter` | Go | Validates tokens before proxying. |
| `Quota Enforcer` | Go | Applies per-consumer rate limits. |

**Relaciones.** 10 relaciones · 1 asíncrona.

## Mantenimiento

| Tarea | Dónde / cómo |
| --- | --- |
| Añadir o editar un proyecto | `src/lib/examples/catalog.ts` |
| Reglas de autoría y convenciones | [`src/lib/examples/README.md`](../src/lib/examples/README.md) |
| Enlaces de las tecnologías | `src/lib/examples/tech-links.ts` |
| Enlaces de las referencias conceptuales | `src/lib/examples/reference-links.ts` |
| Miniaturas de las tarjetas | `public/examples/<id>.webp` (640×360) |
| Regenerar este documento | `npm run doc` |
| Validar el catálogo | `npm run check:examples` |
| Typecheck y build | `npm run check` · `npm run build` |

| Cifra del catálogo | Valor |
| --- | --- |
| Relaciones totales | 499 |
| Relaciones `async` | 47 (9%) en 28 proyectos |
| Relaciones `bi` | 0 |
| Componentes declarados (L3) | 150 |
