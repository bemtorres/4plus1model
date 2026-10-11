import type { CategoryId, Difficulty, ExampleSpec } from "./builder";

/**
 * Catálogo de 50 casos de estudio.
 *
 * Los nombres de los proyectos son ficticios y las empresas citadas en
 * `reference` son referencias conceptuales: estos modelos son independientes
 * y no están afiliados a ninguna de ellas.
 *
 * Cada ejemplo declara la arquitectura en los tres primeros niveles C4
 * (contexto, contenedores y componentes); el builder añade el nivel de
 * código y coloca los diagramas. La convención completa para escribir un
 * ejemplo nuevo está en `src/lib/examples/README.md`.
 *
 * Convenciones de este archivo:
 * - Los textos visibles (nombres, descripciones, etiquetas) están en inglés
 *   para que el catálogo sea legible en cualquier idioma de la interfaz.
 * - Los comentarios de cada ejemplo describen su arquitectura y sus flujos
 *   clave, para poder mantenerlos sin reconstruir el modelo mental.
 * - Las relaciones por broker o correo llevan estilo `"async"` (línea
 *   discontinua en el diagrama y `Rel_D` en PlantUML/Mermaid).
 */
export const EXAMPLES: ExampleSpec[] = [
  /* ================================================================= */
  /* 1. Streaming y entretenimiento                                     */
  /* ================================================================= */

  /* CineNova · inspirado en Netflix — suscripción de vídeo bajo demanda.
   * L1: suscriptor y curador de contenido; pasarela de pago externa.
   * L2: app web/móvil, API de catálogo (Spring), servicio de reproducción
   *     (Go), motor de recomendaciones (Python), facturación (Spring),
   *     bus de eventos Kafka y dos almacenes: metadatos (PostgreSQL) y
   *     vídeo segmentado (S3 + CDN).
   * L3: el Reproductor se abre en token de sesión, enrutado de segmentos
   *     hacia el CDN más cercano y aplicación de licencias DRM.
   * Flujo clave: la app solicita reproducción → el servicio lee segmentos
   *     del almacenamiento y publica eventos de visualización en Kafka, que
   *     alimentan el motor de recomendaciones. */
  {
    id: "cinenova",
    name: "CineNova",
    category: "streaming",
    reference: "Netflix",
    summary: "Subscription platform for films and series.",
    focus: "Catalogue, playback, users, recommendations and payments.",
    difficulty: "intermediate",
    people: [
      ["Subscriber", "Watches films and series on any device."],
      ["Content Curator", "Adds titles to the catalogue and manages releases."],
    ],
    externalSystems: [["Payment Gateway", "Authorises the monthly subscription.", "HTTPS"]],
    containers: [
      ["Web and Mobile App", "container", "React + TypeScript", "Catalogue, profiles and playback UI."],
      ["Catalogue API", "container", "Java / Spring Boot", "Titles, seasons, availability and search."],
      ["Playback Service", "container", "Go", "Streams video and manages sessions."],
      ["Recommendation Engine", "container", "Python", "Personalised rows based on viewing history."],
      ["Billing Service", "container", "Java / Spring Boot", "Subscriptions, invoices and retries."],
      ["Event Bus", "queue", "Kafka", "Decouples playback, billing and notifications."],
      ["Media Database", "database", "PostgreSQL", "Titles, users, subscriptions and viewing history."],
      ["Video Storage", "database", "S3 + CDN", "Encoded video segments."],
    ],
    componentSets: [
      {
        container: "Playback Service",
        components: [
          ["Session Manager", "Go", "Issues and validates playback tokens."],
          ["Segment Router", "Go", "Selects the CDN node closest to the viewer."],
          ["DRM Module", "Go", "Applies licence rules per device."],
        ],
      },
    ],
    relations: [
      ["Subscriber", "Web and Mobile App", "Browses and plays", "HTTPS"],
      ["Content Curator", "Catalogue API", "Manages the catalogue", "HTTPS"],
      ["Web and Mobile App", "Catalogue API", "Searches titles", "HTTPS/JSON"],
      ["Web and Mobile App", "Playback Service", "Requests playback", "HTTPS"],
      ["Web and Mobile App", "Billing Service", "Manages the subscription", "HTTPS"],
      ["Catalogue API", "Recommendation Engine", "Asks for related titles", "gRPC"],
      ["Catalogue API", "Media Database", "Reads titles and availability", "SQL"],
      ["Playback Service", "Event Bus", "Publishes viewing events", "Kafka", "async"],
      ["Billing Service", "Payment Gateway", "Charges the subscription", "HTTPS"],
      ["Recommendation Engine", "Media Database", "Reads viewing history", "SQL"],
      ["Session Manager", "Segment Router", "Resolves the segment source", "Go"],
      ["Session Manager", "DRM Module", "Validates the playback licence", "Go"],
      ["Segment Router", "Video Storage", "Reads video segments", "HTTPS"],
    ],
  },

  /* SonoraPlay · inspirado en Spotify — música y podcasts con suscripción.
   * L1: oyente y gestor de artistas; pago externo y hosts de podcasts.
   * L2: reproductor móvil/web (React Native), API de audio (Node),
   *     reproducción (Go), listas de reproducción (Kotlin), suscripciones
   *     (Spring), índice de búsqueda OpenSearch y base de catálogo.
   * L3: el Reproductor se abre en handler de rangos HTTP, caché de
   *     segmentos populares y adaptación de bitrate a la conexión.
   * Flujo clave: la búsqueda es síncrona sobre OpenSearch mientras que la
   *     reproducción sirve audio cacheado cerca del oyente. */
  {
    id: "sonoraplay",
    name: "SonoraPlay",
    category: "streaming",
    reference: "Spotify",
    summary: "Music streaming with playlists and podcasts.",
    focus: "Audio library, playback, search and subscriptions.",
    difficulty: "intermediate",
    people: [
      ["Listener", "Plays music and follows podcasts."],
      ["Artist Manager", "Uploads and manages artist profiles."],
    ],
    externalSystems: [
      ["Payment Gateway", "Authorises subscriptions.", "HTTPS"],
      ["Podcast Hosts", "Publishes podcast episodes.", "HTTPS"],
    ],
    containers: [
      ["Mobile and Web Player", "container", "React Native", "Player, library and playlists."],
      ["Audio API", "container", "Node.js", "Catalogue, search and user library."],
      ["Playback Service", "container", "Go", "Audio streaming and caching."],
      ["Playlist Service", "container", "Kotlin", "Collaborative and automatic playlists."],
      ["Subscription Service", "container", "Java / Spring Boot", "Plans, trials and invoices."],
      ["Search Index", "database", "OpenSearch", "Full-text catalogue search."],
      ["Media Database", "database", "PostgreSQL", "Tracks, artists, playlists and listeners."],
    ],
    componentSets: [
      {
        container: "Playback Service",
        components: [
          ["Stream Handler", "Go", "Serves ranged audio requests and resumes playback."],
          ["Segment Cache", "Go", "Caches popular tracks close to the listener."],
          ["Bitrate Adapter", "Go", "Adapts the stream to the connection quality."],
        ],
      },
    ],
    relations: [
      ["Listener", "Mobile and Web Player", "Plays music", "HTTPS"],
      ["Artist Manager", "Audio API", "Manages the artist profile", "HTTPS"],
      ["Mobile and Web Player", "Audio API", "Searches and browses", "HTTPS/JSON"],
      ["Mobile and Web Player", "Playback Service", "Streams audio", "HTTPS"],
      ["Mobile and Web Player", "Playlist Service", "Edits playlists", "HTTPS"],
      ["Mobile and Web Player", "Subscription Service", "Manages the plan", "HTTPS"],
      ["Audio API", "Search Index", "Full-text search", "HTTP"],
      ["Audio API", "Media Database", "Reads catalogue and library", "SQL"],
      ["Audio API", "Podcast Hosts", "Fetches episodes", "HTTPS"],
      ["Subscription Service", "Payment Gateway", "Charges the plan", "HTTPS"],
      ["Subscription Service", "Media Database", "Reads the plan", "SQL"],
      ["Stream Handler", "Segment Cache", "Looks up cached audio", "Go"],
      ["Stream Handler", "Bitrate Adapter", "Asks for the bitrate profile", "Go"],
      ["Segment Cache", "Media Database", "Reads the audio catalogue", "SQL"],
    ],
  },

  /* StreamArena · inspirado en Twitch — emisión en directo con chat.
   * L1: espectador y streamer; pasarela de pago y CDN de distribución.
   * L2: estudio del creador (Next), ingesta RTMP (Rust), distribución en
   *     directo (Go), chat en tiempo real (Elixir), canales (Kotlin),
   *     donaciones (Spring), cola Redis Streams y base de plataforma.
   * L3: el Chat se abre en presencia, broker de mensajes y filtro de
   *     moderación con timeouts por canal.
   * Flujo clave: el streamer envía RTMP a la ingesta, que empaqueta
   *     segmentos hacia el CDN; el chat hace fan-out por Redis Streams. */
  {
    id: "streamarena",
    name: "StreamArena",
    category: "streaming",
    reference: "Twitch",
    summary: "Live streaming platform for creators.",
    focus: "Live streaming, real-time chat, channels and donations.",
    difficulty: "advanced",
    people: [
      ["Viewer", "Watches live channels and donates."],
      ["Streamer", "Broadcasts live and moderates the chat."],
    ],
    externalSystems: [
      ["Payment Gateway", "Processes donations.", "HTTPS"],
      ["CDN Provider", "Distributes the live stream.", "RTMP"],
    ],
    containers: [
      ["Streamer Studio", "container", "Next.js", "Broadcast control and channel settings."],
      ["Ingest Gateway", "container", "Rust", "Receives the RTMP stream from creators."],
      ["Live Streaming Service", "container", "Go", "Packages and distributes segments."],
      ["Chat Service", "container", "Elixir", "Real-time messages and moderation."],
      ["Channel Service", "container", "Kotlin", "Channels, followers and discovery."],
      ["Donation Service", "container", "Java / Spring Boot", "Donations and creator payouts."],
      ["Chat Stream", "queue", "Redis Streams", "Fan-out of chat messages."],
      ["Platform Database", "database", "PostgreSQL", "Channels, users and donations."],
    ],
    componentSets: [
      {
        container: "Chat Service",
        components: [
          ["Presence Tracker", "Elixir", "Tracks who is connected to each channel."],
          ["Message Broker", "Elixir", "Broadcasts messages to connected clients."],
          ["Moderation Filter", "Elixir", "Applies channel rules and timeouts."],
        ],
      },
    ],
    relations: [
      ["Streamer", "Streamer Studio", "Goes live", "HTTPS"],
      ["Viewer", "Streamer Studio", "Watches a channel", "HTTPS"],
      ["Streamer Studio", "Ingest Gateway", "Sends the RTMP stream", "RTMP"],
      ["Ingest Gateway", "Live Streaming Service", "Forwards segments", "gRPC"],
      ["Live Streaming Service", "CDN Provider", "Publishes segments", "RTMP"],
      ["Streamer Studio", "Chat Service", "Sends and reads messages", "WebSocket"],
      ["Streamer Studio", "Channel Service", "Reads followers and discovery", "HTTPS"],
      ["Streamer Studio", "Donation Service", "Sends a donation", "HTTPS"],
      ["Donation Service", "Payment Gateway", "Charges the donation", "HTTPS"],
      ["Donation Service", "Platform Database", "Records the donation", "SQL"],
      ["Presence Tracker", "Message Broker", "Publishes presence updates", "Elixir"],
      ["Moderation Filter", "Message Broker", "Filters before fan-out", "Elixir"],
      ["Message Broker", "Chat Stream", "Delivers messages to subscribers", "Redis", "async"],
    ],
  },

  /* PixelForge · inspirado en Steam — tienda y biblioteca de videojuegos.
   * L1: jugador y estudio asociado; pago y autoridad fiscal externas.
   * L2: cliente de juego (C++/Electron), escaparate (Go), licencias
   *     (Spring), descargas (Go), comunidad (Laravel), logros (Rust),
   *     base de catálogo y almacenamiento de builds en S3.
   * L3: Licencias se abre en registro de entitlements, emisor de
   *     licencias firmadas y revocación por reembolso.
   * Flujo clave: validar propiedad y descargar son rutas independientes:
   *     la licencia autoriza, el servicio de descarga sirve los binarios. */
  {
    id: "pixelforge",
    name: "PixelForge",
    category: "streaming",
    reference: "Steam",
    summary: "Digital store and library of video games.",
    focus: "Catalogue, licences, downloads, community and achievements.",
    difficulty: "advanced",
    people: [
      ["Gamer", "Buys, downloads and plays games."],
      ["Studio Partner", "Publishes games and manages royalties."],
    ],
    externalSystems: [
      ["Payment Gateway", "Processes purchases.", "HTTPS"],
      ["Tax Authority", "Issues invoicing data.", "HTTPS"],
    ],
    containers: [
      ["Game Client", "container", "C++ / Electron", "Library, store and matchmaking."],
      ["Storefront API", "container", "Go", "Catalogue, prices and regional pricing."],
      ["Licensing Service", "container", "Java / Spring Boot", "Entitlements and DRM licences."],
      ["Download Service", "container", "Go", "Chunked downloads and patch delivery."],
      ["Community Service", "container", "PHP / Laravel", "Reviews, forums and friends."],
      ["Achievement Service", "container", "Rust", "Tracks achievements and statistics."],
      ["Catalogue Database", "database", "PostgreSQL", "Games, prices and reviews."],
      ["Build Storage", "database", "S3", "Game binaries and patches."],
    ],
    componentSets: [
      {
        container: "Licensing Service",
        components: [
          ["Entitlement Store", "Java", "Records which owner has which game."],
          ["Licence Issuer", "Java", "Signs device licences and renews them."],
          ["Refund Handler", "Java", "Revokes licences when a purchase is refunded."],
        ],
      },
    ],
    relations: [
      ["Gamer", "Game Client", "Browses and plays", "HTTPS"],
      ["Studio Partner", "Storefront API", "Publishes a game", "HTTPS"],
      ["Game Client", "Storefront API", "Reads the catalogue", "HTTPS/JSON"],
      ["Game Client", "Licensing Service", "Validates ownership", "HTTPS"],
      ["Game Client", "Download Service", "Downloads the game", "HTTPS"],
      ["Game Client", "Community Service", "Publishes a review", "HTTPS"],
      ["Game Client", "Achievement Service", "Reports progress", "HTTPS"],
      ["Download Service", "Build Storage", "Reads binaries", "HTTPS"],
      ["Storefront API", "Tax Authority", "Reports sales", "HTTPS"],
      ["Storefront API", "Payment Gateway", "Charges the purchase", "HTTPS"],
      ["Licence Issuer", "Entitlement Store", "Writes the issued licence", "Java"],
      ["Refund Handler", "Entitlement Store", "Revokes the entitlement", "Java"],
      ["Entitlement Store", "Catalogue Database", "Reads entitlements", "SQL"],
    ],
  },

  /* ComicVerse · inspirado en WEBTOON — cómics digitales por capítulos.
   * L1: lector y estudio editorial; red de anuncios y pago externos.
   * L2: app lectora (Flutter), API editorial (NestJS), entrega de páginas
   *     (Java), suscripciones (Go), moderación (Python), base de cómics y
   *     páginas en S3 + CDN.
   * L3: la API editorial se abre en gestor de series, cargador de
   *     capítulos y motor de calendario de publicación por huso horario.
   * Flujo clave: publicar pasa por moderación (gRPC) antes de ser visible;
   *     las páginas se sirven desde CDN y el hueco libre lo llena la red
   *     de anuncios. */
  {
    id: "comicverse",
    name: "ComicVerse",
    category: "streaming",
    reference: "WEBTOON",
    summary: "Digital library of comics and graphic novels.",
    focus: "Publications, chapters, favourites and monetisation.",
    difficulty: "beginner",
    people: [
      ["Reader", "Reads daily releases and saves favourites."],
      ["Publishing Studio", "Publishes chapters and schedules releases."],
    ],
    externalSystems: [
      ["Ad Network", "Fills free slots with advertising.", "HTTPS"],
      ["Payment Provider", "Processes the subscription.", "HTTPS"],
    ],
    containers: [
      ["Reader App", "container", "Flutter", "Library, reader and daily list."],
      ["Publishing API", "container", "NestJS", "Series, chapters and schedules."],
      ["Reader Service", "container", "Java", "Page delivery and reading progress."],
      ["Subscription Service", "container", "Go", "Plans and ad-free access."],
      ["Moderation Service", "container", "Python", "Content review and reports."],
      ["Comics Database", "database", "PostgreSQL", "Series, chapters and progress."],
      ["Image Storage", "database", "S3 + CDN", "Chapter pages."],
    ],
    componentSets: [
      {
        container: "Publishing API",
        components: [
          ["Series Manager", "NestJS", "Series metadata and the release calendar."],
          ["Chapter Uploader", "NestJS", "Validates and stores chapter pages."],
          ["Schedule Engine", "NestJS", "Plans daily releases by time zone."],
        ],
      },
    ],
    relations: [
      ["Reader", "Reader App", "Reads chapters", "HTTPS"],
      ["Publishing Studio", "Publishing API", "Publishes chapters", "HTTPS"],
      ["Reader App", "Publishing API", "Lists series", "HTTPS/JSON"],
      ["Reader App", "Reader Service", "Loads pages", "HTTPS"],
      ["Reader App", "Subscription Service", "Manages the plan", "HTTPS"],
      ["Reader Service", "Image Storage", "Reads page images", "HTTPS"],
      ["Reader Service", "Ad Network", "Requests an ad slot", "HTTPS"],
      ["Subscription Service", "Payment Provider", "Charges the plan", "HTTPS"],
      ["Chapter Uploader", "Series Manager", "Validates the chapter order", "NestJS"],
      ["Schedule Engine", "Moderation Service", "Submits for review", "gRPC"],
      ["Chapter Uploader", "Comics Database", "Writes chapters", "SQL"],
    ],
  },

  /* ================================================================= */
  /* 2. Comercio electrónico y marketplaces                            */
  /* ================================================================= */

  /* CompraFácil · inspirado en Mercado Libre — marketplace multi-vendedor.
   * L1: comprador y vendedor; pasarela que reparte el pago y API de
   *     transportista.
   * L2: tienda web/móvil (React), API del marketplace (Spring), búsqueda
   *     (Go), pedidos (Kotlin), orquestador de pagos (Java), servicio de
   *     vendedores (Node), cola RabbitMQ, base del marketplace e índice
   *     de búsqueda OpenSearch.
   * L3: el servicio de pedidos se abre en máquina de estados, reserva de
   *     stock con caducidad y adaptador del transportista.
   * Flujo clave: el pedido publica eventos en RabbitMQ que desacoplan
   *     pago repartido, métricas de vendedor y envío. */
  {
    id: "comprafacil",
    name: "CompraFácil",
    category: "ecommerce",
    reference: "Mercado Libre",
    summary: "Marketplace connecting buyers with many sellers.",
    focus: "Catalogue, sellers, orders, payments and reputation.",
    difficulty: "intermediate",
    people: [
      ["Buyer", "Searches products and places orders."],
      ["Seller", "Publishes products and ships orders."],
    ],
    externalSystems: [
      ["Payment Gateway", "Splits the payment between buyers and sellers."],
      ["Carrier API", "Generates shipping labels and tracks parcels."],
    ],
    containers: [
      ["Web and Mobile Store", "container", "React", "Catalogue, cart and checkout."],
      ["Marketplace API", "container", "Java / Spring Boot", "Listings, orders and disputes."],
      ["Search Service", "container", "Go", "Faceted search and ranking."],
      ["Order Service", "container", "Kotlin", "Order state machine and history."],
      ["Payment Orchestrator", "container", "Java", "Split payments, refunds and payouts."],
      ["Seller Service", "container", "Node.js", "Seller onboarding and metrics."],
      ["Order Events", "queue", "RabbitMQ", "Asynchronous order processing."],
      ["Marketplace Database", "database", "PostgreSQL", "Listings, orders and ratings."],
      ["Product Search Index", "database", "OpenSearch", "Denormalised catalogue index."],
    ],
    componentSets: [
      {
        container: "Order Service",
        components: [
          ["Order State Machine", "Kotlin", "Validates transitions between states."],
          ["Reservation Module", "Kotlin", "Reserves stock for the configured minutes."],
          ["Shipping Adapter", "Kotlin", "Talks to the carrier API."],
        ],
      },
    ],
    relations: [
      ["Buyer", "Web and Mobile Store", "Browses and buys", "HTTPS"],
      ["Seller", "Marketplace API", "Manages listings", "HTTPS"],
      ["Web and Mobile Store", "Marketplace API", "Places the order", "HTTPS/JSON"],
      ["Web and Mobile Store", "Search Service", "Searches products", "HTTPS"],
      ["Marketplace API", "Order Service", "Creates the order", "gRPC"],
      ["Marketplace API", "Payment Orchestrator", "Requests the split payment", "gRPC"],
      ["Marketplace API", "Seller Service", "Serves onboarding and metrics", "gRPC"],
      ["Order Service", "Order Events", "Publishes order events", "AMQP", "async"],
      ["Order Service", "Marketplace Database", "Writes the order", "SQL"],
      ["Search Service", "Product Search Index", "Queries the index", "HTTP"],
      ["Payment Orchestrator", "Payment Gateway", "Splits the payment", "HTTPS"],
      ["Seller Service", "Marketplace Database", "Reads seller metrics", "SQL"],
      ["Order State Machine", "Reservation Module", "Reserves the items", "Kotlin"],
      ["Order State Machine", "Shipping Adapter", "Requests the shipping label", "Kotlin"],
      ["Shipping Adapter", "Carrier API", "Generates the label", "HTTPS"],
    ],
  },

  /* ModaClick · inspirado en Zara online — tienda de moda con almacén.
   * L1: comprador y operario de almacén; pago y paquetería externos.
   * L2: escaparate (Next), API comercial (Node), inventario (Java),
   *     checkout (Kotlin), fulfillment (Java) y base de tienda.
   * L3: el inventario se abre en libro de stock, pool de reservas y
   *     reposición automática de unidades bajas.
   * Flujo clave: checkout reserva stock y dispara fulfillment; el
   *     operario recoge y envía desde su propio contenedor. */
  {
    id: "modaclick",
    name: "ModaClick",
    category: "ecommerce",
    reference: "Zara online",
    summary: "Online clothing and accessories store.",
    focus: "Inventory, variants, cart and logistics.",
    difficulty: "beginner",
    people: [
      ["Shopper", "Browses collections and places orders."],
      ["Warehouse Operator", "Picks, packs and ships orders."],
    ],
    externalSystems: [
      ["Payment Gateway", "Processes card payments."],
      ["Parcel Carrier", "Collects and delivers parcels."],
    ],
    containers: [
      ["Storefront", "container", "Next.js", "Catalogue, variants and cart."],
      ["Commerce API", "container", "Node.js", "Products, prices and carts."],
      ["Inventory Service", "container", "Java", "Stock by size and colour."],
      ["Checkout Service", "container", "Kotlin", "Orders and returns."],
      ["Fulfilment Service", "container", "Java", "Pick, pack and shipment status."],
      ["Store Database", "database", "PostgreSQL", "Products, carts and orders."],
    ],
    componentSets: [
      {
        container: "Inventory Service",
        components: [
          ["Stock Ledger", "Java", "Available units per size and colour."],
          ["Reservation Pool", "Java", "Holds units while checkout runs."],
          ["Replenishment Job", "Java", "Reorders stock when a size runs low."],
        ],
      },
    ],
    relations: [
      ["Shopper", "Storefront", "Browses and buys", "HTTPS"],
      ["Warehouse Operator", "Fulfilment Service", "Picks orders", "HTTPS"],
      ["Storefront", "Commerce API", "Reads products and prices", "HTTPS/JSON"],
      ["Commerce API", "Inventory Service", "Checks stock", "gRPC"],
      ["Storefront", "Checkout Service", "Places the order", "HTTPS"],
      ["Checkout Service", "Payment Gateway", "Charges the order", "HTTPS"],
      ["Checkout Service", "Inventory Service", "Reserves stock", "gRPC"],
      ["Checkout Service", "Fulfilment Service", "Sends the shipment", "gRPC"],
      ["Fulfilment Service", "Parcel Carrier", "Registers the parcel", "HTTPS"],
      ["Commerce API", "Store Database", "Reads catalogue", "SQL"],
      ["Reservation Pool", "Stock Ledger", "Decrements the available stock", "Java"],
      ["Replenishment Job", "Stock Ledger", "Replenishes the levels", "Java"],
      ["Stock Ledger", "Store Database", "Reads and writes stock", "SQL"],
    ],
  },

  /* HechoLocal · inspirado en Etsy — marketplace de artesanía.
   * L1: comprador y artesano; pago con reparto y correo postal externos.
   * L2: web del marketplace (React), servicio de tiendas (Rails), carrito
   *     y checkout (Node), motor de comisiones (Java), reseñas (Python) y
   *     base del marketplace.
   * L3: el motor de comisiones se abre en cálculo de tarifas, calendario
   *     de pagos a artesanos y resolución fiscal por destino.
   * Flujo clave: el checkout calcula la comisión antes de cobrar y el
   *     motor la aplica después a los pagos del artesano. */
  {
    id: "hecho-local",
    name: "HechoLocal",
    category: "ecommerce",
    reference: "Etsy",
    summary: "Marketplace for handmade and artisan products.",
    focus: "Shops, listings, commissions and reviews.",
    difficulty: "beginner",
    people: [
      ["Buyer", "Buys handmade items from small shops."],
      ["Artisan", "Runs a shop and manages commissions."],
    ],
    externalSystems: [
      ["Payment Gateway", "Pays out to artisans."],
      ["Postal Service", "Ships international parcels."],
    ],
    containers: [
      ["Marketplace Web", "container", "React", "Search, shops and checkout."],
      ["Shop Service", "container", "Ruby on Rails", "Shops, listings and reviews."],
      ["Cart and Checkout", "container", "Node.js", "Cart, coupons and payment."],
      ["Commission Engine", "container", "Java", "Fees, payouts and tax."],
      ["Review Service", "container", "Python", "Ratings and moderation."],
      ["Marketplace Database", "database", "PostgreSQL", "Shops, listings and orders."],
    ],
    componentSets: [
      {
        container: "Commission Engine",
        components: [
          ["Fee Calculator", "Java", "Applies category rates and promotions."],
          ["Payout Scheduler", "Java", "Aggregates and schedules artisan payouts."],
          ["Tax Resolver", "Java", "Applies tax rules by destination."],
        ],
      },
    ],
    relations: [
      ["Buyer", "Marketplace Web", "Browses and buys", "HTTPS"],
      ["Artisan", "Shop Service", "Manages the shop", "HTTPS"],
      ["Marketplace Web", "Shop Service", "Reads listings", "HTTPS/JSON"],
      ["Marketplace Web", "Cart and Checkout", "Checks out", "HTTPS"],
      ["Cart and Checkout", "Payment Gateway", "Charges the buyer", "HTTPS"],
      ["Cart and Checkout", "Commission Engine", "Calculates the fee", "gRPC"],
      ["Cart and Checkout", "Postal Service", "Ships the parcel", "HTTPS"],
      ["Shop Service", "Review Service", "Publishes ratings", "gRPC"],
      ["Shop Service", "Marketplace Database", "Reads and writes", "SQL"],
      ["Fee Calculator", "Tax Resolver", "Adds taxes to the fee", "Java"],
      ["Payout Scheduler", "Fee Calculator", "Reads the commission to pay", "Java"],
      ["Payout Scheduler", "Shop Service", "Updates the payout", "gRPC"],
    ],
  },

  /* SaborExpress · inspirado en Uber Eats — comida a domicilio.
   * L1: cliente, restaurante y repartidor; pago y mapas externos.
   * L2: app de pedido (React Native), portal de restaurante (React),
   *     pedidos (Kotlin), despacho (Go), cartas (Node), localización
   *     (Rust), cola NATS de despacho y base de entrega.
   * L3: el despacho se abre en emparejamiento de repartidores, optimización
   *     de ruta multi-parada y cálculo de ETA con tráfico en vivo.
   * Flujo clave: el restaurante acepta → el despacho busca repartidor y
   *     publica asignaciones por NATS; el repartidor reporta desde la app. */
  {
    id: "saborexpress",
    name: "SaborExpress",
    category: "ecommerce",
    reference: "Uber Eats",
    summary: "Food delivery ordering from local restaurants.",
    focus: "Restaurants, orders, couriers and GPS tracking.",
    difficulty: "advanced",
    people: [
      ["Customer", "Orders food and tracks the courier."],
      ["Restaurant", "Receives orders and prepares them."],
      ["Courier", "Accepts trips, delivers orders and reports the location."],
    ],
    externalSystems: [
      ["Payment Gateway", "Charges the customer and pays couriers."],
      ["Maps Provider", "Geocoding and route calculation."],
    ],
    containers: [
      ["Ordering App", "container", "React Native", "Menu, cart and live tracking."],
      ["Restaurant Portal", "container", "React", "Menus, orders and preparation times."],
      ["Order Service", "container", "Kotlin", "Order lifecycle and dispatch."],
      ["Dispatch Service", "container", "Go", "Assigns couriers and routes."],
      ["Menu Service", "container", "Node.js", "Menus, dishes and availability."],
      ["Location Service", "container", "Rust", "Geocoding and ETA calculation."],
      ["Dispatch Events", "queue", "NATS", "Courier assignments and location updates."],
      ["Delivery Database", "database", "PostgreSQL", "Orders, menus and ratings."],
    ],
    componentSets: [
      {
        container: "Dispatch Service",
        components: [
          ["Courier Matcher", "Go", "Pairs open orders with nearby couriers."],
          ["Route Optimiser", "Go", "Builds multi-stop delivery routes."],
          ["ETA Calculator", "Go", "Predicts arrival times from live traffic."],
        ],
      },
    ],
    relations: [
      ["Customer", "Ordering App", "Places the order", "HTTPS"],
      ["Restaurant", "Restaurant Portal", "Accepts and prepares", "HTTPS"],
      ["Courier", "Dispatch Service", "Accepts trips and sends location", "HTTPS"],
      ["Ordering App", "Menu Service", "Reads the menu", "HTTPS/JSON"],
      ["Ordering App", "Order Service", "Places the order", "HTTPS"],
      ["Restaurant Portal", "Order Service", "Accepts the order", "HTTPS"],
      ["Order Service", "Dispatch Service", "Asks for a courier", "gRPC"],
      ["Dispatch Service", "Dispatch Events", "Publishes assignments", "NATS", "async"],
      ["Dispatch Service", "Location Service", "Calculates the route", "gRPC"],
      ["Order Service", "Payment Gateway", "Charges the customer", "HTTPS"],
      ["Order Service", "Delivery Database", "Writes the order", "SQL"],
      ["Courier Matcher", "Route Optimiser", "Plans the courier route", "Go"],
      ["Route Optimiser", "ETA Calculator", "Computes the arrival time", "Go"],
      ["Route Optimiser", "Maps Provider", "Geocodes addresses", "HTTPS"],
    ],
  },

  /* MercadoVerde · inspirado en Instacart — supermercado con franjas.
   * L1: comprador y picker de tienda; pago y última milla externos.
   * L2: app de cesta (React), escaparate (Node), cesta (Kotlin), franjas
   *     horarias (Java), picking optimizado (Go) y base de pedidos.
   * L3: la cesta se abre en gestión de líneas, reglas de sustitución y
   *     bloqueo de stock mientras el cliente decide.
   * Flujo clave: reservar franja y cesta se hacen en paralelo; la liberación
   *     de la tarea de picking la dispara la capacidad de la franja. */
  {
    id: "mercadoverde",
    name: "MercadoVerde",
    category: "ecommerce",
    reference: "Instacart",
    summary: "Online supermarket with scheduled delivery slots.",
    focus: "Stock, order picking, payments and delivery windows.",
    difficulty: "beginner",
    people: [
      ["Shopper", "Schedules a delivery and picks products."],
      ["Picker", "Walks the aisles collecting the order."],
    ],
    externalSystems: [
      ["Payment Gateway", "Processes the payment."],
      ["Last Mile Carrier", "Delivers the order."],
    ],
    containers: [
      ["Grocery Web App", "container", "React", "Catalogue, substitution rules and slots."],
      ["Storefront API", "container", "Node.js", "Products, prices and promotions."],
      ["Cart Service", "container", "Kotlin", "Cart, substitutions and reservations."],
      ["Slot Service", "container", "Java", "Capacity per delivery window."],
      ["Picking Service", "container", "Go", "Optimises the pick route."],
      ["Order Database", "database", "PostgreSQL", "Products, carts and orders."],
    ],
    componentSets: [
      {
        container: "Cart Service",
        components: [
          ["Basket Manager", "Kotlin", "Adds, removes and prices basket lines."],
          ["Substitution Rules", "Kotlin", "Applies customer replacement preferences."],
          ["Reservation Lock", "Kotlin", "Holds stock while the basket is open."],
        ],
      },
    ],
    relations: [
      ["Shopper", "Grocery Web App", "Builds the basket", "HTTPS"],
      ["Shopper", "Slot Service", "Chooses a delivery window", "HTTPS"],
      ["Picker", "Picking Service", "Follows the pick route", "HTTPS"],
      ["Grocery Web App", "Storefront API", "Reads products", "HTTPS/JSON"],
      ["Grocery Web App", "Cart Service", "Manages the basket", "HTTPS"],
      ["Cart Service", "Slot Service", "Reserves capacity", "gRPC"],
      ["Slot Service", "Picking Service", "Releases the pick task", "gRPC"],
      ["Picking Service", "Order Database", "Updates picked items", "SQL"],
      ["Picking Service", "Last Mile Carrier", "Dispatches the order", "HTTPS"],
      ["Basket Manager", "Substitution Rules", "Applies the substitutions", "Kotlin"],
      ["Basket Manager", "Reservation Lock", "Locks the items", "Kotlin"],
      ["Basket Manager", "Payment Gateway", "Charges the order", "HTTPS"],
    ],
  },

  /* ================================================================= */
  /* 3. Finanzas y fintech                                              */
  /* ================================================================= */

  /* NovaBank · inspirado en Revolut — banca digital con tarjetas.
   * L1: cliente minorista y officer de compliance; red de tarjetas, raíles
   *     interbancarios (ISO 20022) e IdP (OIDC) externos.
   * L2: app móvil (Swift/Kotlin), core bancario (Spring), pagos (Kotlin),
   *     motor de riesgo (Python), compliance (Go), libro mayor
   *     PostgreSQL y stream Kafka de eventos financieros.
   * L3: el core se abre en el libro de partida doble, el orquestador de
   *     transferencias con reintentos y el generador de extractos PDF.
   * Flujo clave: cada movimiento contable publica en Kafka, que alimenta
   *     la traza de auditoría que revisa compliance. */
  {
    id: "novabank",
    name: "NovaBank",
    category: "fintech",
    reference: "Revolut",
    summary: "Digital bank with accounts, cards and transfers.",
    focus: "Identity, accounts, transfers, audit and security.",
    difficulty: "advanced",
    people: [
      ["Retail Customer", "Opens an account and moves money."],
      ["Compliance Officer", "Reviews flagged transactions."],
    ],
    externalSystems: [
      ["Card Network", "Authorises card transactions.", "HTTPS"],
      ["National Bank Rails", "Sends interbank transfers.", "ISO 20022"],
      ["Identity Provider", "Verifies the customer identity.", "OIDC"],
    ],
    containers: [
      ["Mobile Banking App", "container", "Swift + Kotlin", "Accounts, cards and transfers."],
      ["Core Banking Service", "container", "Java / Spring Boot", "Accounts, ledger and transfers."],
      ["Payment Service", "container", "Kotlin", "Card authorisations and refunds."],
      ["Risk Engine", "container", "Python", "Fraud scoring and limits."],
      ["Compliance Service", "container", "Go", "KYC, AML alerts and audit trail."],
      ["Ledger Database", "database", "PostgreSQL", "Double-entry ledger."],
      ["Events Stream", "queue", "Kafka", "Financial events and audit stream."],
    ],
    componentSets: [
      {
        container: "Core Banking Service",
        components: [
          ["Ledger Module", "Java", "Double-entry postings and balances."],
          ["Transfer Orchestrator", "Java", "Schedules and retries interbank transfers."],
          ["Statement Generator", "Java", "Monthly statements in PDF."],
        ],
      },
    ],
    relations: [
      ["Retail Customer", "Mobile Banking App", "Transfers money", "HTTPS"],
      ["Compliance Officer", "Compliance Service", "Reviews alerts", "HTTPS"],
      ["Mobile Banking App", "Core Banking Service", "Manages accounts", "HTTPS"],
      ["Mobile Banking App", "Payment Service", "Authorises card payments", "HTTPS"],
      ["Payment Service", "Card Network", "Authorises the transaction", "HTTPS"],
      ["Payment Service", "Risk Engine", "Scores the transaction", "gRPC"],
      ["Core Banking Service", "Events Stream", "Publishes ledger events", "Kafka", "async"],
      ["Compliance Service", "Identity Provider", "Verifies identity", "OIDC"],
      ["Transfer Orchestrator", "Ledger Module", "Posts the transfer", "Java"],
      ["Statement Generator", "Ledger Module", "Reads the entries", "Java"],
      ["Ledger Module", "Ledger Database", "Posts entries", "SQL"],
      ["Transfer Orchestrator", "National Bank Rails", "Sends transfers", "ISO 20022"],
    ],
  },

  /* BilleteraGo · inspirado en PayPal — billetera digital con comercios.
   * L1: usuario de billetera y comercio; red bancaria y buró de fraude.
   * L2: app (React Native), API de billetera (Go), gateway de comercio
   *     (Node), libro mayor (Java), antifraude (Python), base de billetera
   *     y cola Kafka de transacciones.
   * L3: el libro mayor se abre en motor de saldos, reconciliador contra
   *     extractos bancarios y constructor de extractos mensuales.
   * Flujo clave: la API publica cada transacción en Kafka; el antifraude
   *     consume el stream y además consulta el buró de forma síncrona. */
  {
    id: "billetera-go",
    name: "BilleteraGo",
    category: "fintech",
    reference: "PayPal",
    summary: "Digital wallet for payments and collections.",
    focus: "Balances, payments, merchants, reconciliation and fraud.",
    difficulty: "advanced",
    people: [
      ["Wallet User", "Sends money and requests charges."],
      ["Merchant", "Accepts wallet payments."],
    ],
    externalSystems: [
      ["Banking Network", "Settles to bank accounts.", "HTTPS"],
      ["Fraud Bureau", "Cross-checks transactions.", "HTTPS"],
    ],
    containers: [
      ["Wallet App", "container", "React Native", "Balance, send and request flows."],
      ["Wallet API", "container", "Go", "Accounts, transfers and statements."],
      ["Merchant Gateway", "container", "Node.js", "Payment capture for merchants."],
      ["Ledger Service", "container", "Java", "Balances and reconciliation."],
      ["Fraud Service", "container", "Python", "Rules and models for fraud detection."],
      ["Wallet Database", "database", "PostgreSQL", "Wallets, transactions and statements."],
      ["Fraud Events", "queue", "Kafka", "Transaction stream for scoring."],
    ],
    componentSets: [
      {
        container: "Ledger Service",
        components: [
          ["Balance Engine", "Java", "Computes available and pending balances."],
          ["Reconciliator", "Java", "Matches entries against bank statements."],
          ["Statement Builder", "Java", "Renders monthly wallet statements."],
        ],
      },
    ],
    relations: [
      ["Wallet User", "Wallet App", "Sends and requests money", "HTTPS"],
      ["Merchant", "Merchant Gateway", "Accepts payments", "HTTPS"],
      ["Wallet App", "Wallet API", "Manages the wallet", "HTTPS/JSON"],
      ["Merchant Gateway", "Wallet API", "Captures the payment", "HTTPS"],
      ["Wallet API", "Ledger Service", "Moves the balance", "gRPC"],
      ["Wallet API", "Fraud Service", "Scores before confirming", "gRPC"],
      ["Wallet API", "Fraud Events", "Publishes transactions", "Kafka", "async"],
      ["Fraud Events", "Fraud Service", "Delivers transactions to score", "Kafka", "async"],
      ["Fraud Service", "Fraud Bureau", "Checks the counterparty", "HTTPS"],
      ["Balance Engine", "Reconciliator", "Provides the balances to check", "Java"],
      ["Statement Builder", "Balance Engine", "Reads the balance history", "Java"],
      ["Balance Engine", "Wallet Database", "Writes entries", "SQL"],
      ["Reconciliator", "Banking Network", "Settles to the bank", "HTTPS"],
    ],
  },

  /* Inverta · inspirado en eToro — carteras y seguimiento de inversión.
   * L1: inversor y asesor financiero; proveedor de mercado (streaming) y
   *     banco custodio externos.
   * L2: app web (React), cartera (Node), datos de mercado (Go), analítica
   *     de riesgo (Python), caché de precios Redis y base de carteras.
   * L3: el servicio de cartera se abre en seguimiento de posiciones, puente
   *     de órdenes al bróker y cálculo de rendimiento frente a índice.
   * Flujo clave: los precios entran por WebSocket y se cachean; el riesgo
   *     se calcula bajo demanda con gRPC. */
  {
    id: "inverta",
    name: "Inverta",
    category: "fintech",
    reference: "eToro",
    summary: "Investment tracking and portfolio management.",
    focus: "Assets, quotes, portfolios and risk analysis.",
    difficulty: "beginner",
    people: [
      ["Investor", "Builds a portfolio and tracks performance."],
      ["Financial Advisor", "Reviews client portfolios."],
    ],
    externalSystems: [
      ["Market Data Provider", "Streams prices and news.", "WebSocket"],
      ["Custodian Bank", "Safekeeps the securities.", "HTTPS"],
    ],
    containers: [
      ["Investor Web App", "container", "React", "Portfolio, charts and orders."],
      ["Portfolio Service", "container", "Node.js", "Positions, orders and performance."],
      ["Market Data Service", "container", "Go", "Prices and corporate actions."],
      ["Risk Analytics", "container", "Python", "Volatility, exposure and VaR."],
      ["Price Cache", "database", "Redis", "Latest quotes."],
      ["Portfolio Database", "database", "PostgreSQL", "Positions, orders and history."],
    ],
    componentSets: [
      {
        container: "Portfolio Service",
        components: [
          ["Position Tracker", "Node.js", "Maintains holdings and average cost."],
          ["Order Gateway", "Node.js", "Places and cancels broker orders."],
          ["Performance Calculator", "Node.js", "Computes returns against benchmarks."],
        ],
      },
    ],
    relations: [
      ["Investor", "Investor Web App", "Manages the portfolio", "HTTPS"],
      ["Financial Advisor", "Investor Web App", "Reviews portfolios", "HTTPS"],
      ["Investor Web App", "Portfolio Service", "Reads and orders", "HTTPS/JSON"],
      ["Investor Web App", "Market Data Service", "Subscribes to prices", "WebSocket"],
      ["Portfolio Service", "Price Cache", "Reads the latest quote", "RESP"],
      ["Portfolio Service", "Risk Analytics", "Requests a risk report", "gRPC"],
      ["Market Data Service", "Market Data Provider", "Consumes the feed", "WebSocket"],
      ["Order Gateway", "Position Tracker", "Records the fill", "Node.js"],
      ["Performance Calculator", "Position Tracker", "Reads positions", "Node.js"],
      ["Position Tracker", "Portfolio Database", "Writes positions", "SQL"],
      ["Order Gateway", "Custodian Bank", "Places settlement orders", "HTTPS"],
    ],
  },

  /* CuentaClara · inspirado en BudgetBakers — control de gasto personal.
   * L1: único actor (propietario del presupuesto); banco vía open banking.
   * L2: app (Flutter), transacciones (Node), presupuestos (Kotlin),
   *     informes (Python) y base de presupuestos.
   * L3: el motor de presupuestos se abre en cálculo de límites, despacho
   *     de alertas antes del límite y previsión de cierre de mes.
   * Flujo clave: la app importa movimientos del banco y los clasifica antes
   *     de compararlos con el presupuesto de la categoría. */
  {
    id: "cuentaclara",
    name: "CuentaClara",
    category: "fintech",
    reference: "Wallet by BudgetBakers",
    summary: "Personal budgeting and expense control.",
    focus: "Transactions, categories, budgets and reports.",
    difficulty: "beginner",
    people: [["Budget Owner", "Tracks spending and sets budgets."]],
    externalSystems: [
      ["Open Banking Provider", "Imports transactions from the bank."],
    ],
    containers: [
      ["Budget App", "container", "Flutter", "Transactions, budgets and reports."],
      ["Transaction Service", "container", "Node.js", "Normalises and categorises movements."],
      ["Budget Engine", "container", "Kotlin", "Budgets, alerts and forecasts."],
      ["Reporting Service", "container", "Python", "Monthly summaries and exports."],
      ["Budget Database", "database", "PostgreSQL", "Accounts, budgets and categories."],
    ],
    componentSets: [
      {
        container: "Budget Engine",
        components: [
          ["Budget Calculator", "Kotlin", "Compares spend against category limits."],
          ["Alert Dispatcher", "Kotlin", "Warns before a budget is exceeded."],
          ["Forecast Model", "Kotlin", "Projects month-end balances."],
        ],
      },
    ],
    relations: [
      ["Budget Owner", "Budget App", "Reviews spending", "HTTPS"],
      ["Budget App", "Transaction Service", "Lists movements", "HTTPS/JSON"],
      ["Budget App", "Budget Engine", "Edits budgets", "HTTPS"],
      ["Transaction Service", "Open Banking Provider", "Imports transactions", "HTTPS"],
      ["Transaction Service", "Budget Database", "Writes movements", "SQL"],
      ["Budget Engine", "Reporting Service", "Requests a report", "gRPC"],
      ["Reporting Service", "Budget Database", "Aggregates by category", "SQL"],
      ["Forecast Model", "Budget Calculator", "Feeds the projections", "Kotlin"],
      ["Alert Dispatcher", "Budget Calculator", "Watches the thresholds", "Kotlin"],
      ["Budget Calculator", "Budget Database", "Reads and writes budgets", "SQL"],
    ],
  },

  /* PagoNexo · inspirado en Stripe — API de pagos para desarrolladores.
   * L1: desarrollador del comercio y analista de operaciones; banco
   *     liquidador y esquemas de tarjeta externos.
   * L2: dashboard (React), API pública (Go), orquestador de pagos (Go),
   *     despachador de webhooks firmados (Rust), antifraude (Python) y
   *     base de pagos.
   * L3: el orquestador se abre en gestor de intenciones, política de
   *     reintentos por motivo de rechazo y planificador de liquidaciones.
   * Flujo clave: la intención de pago pasa por antifraude antes de ir a
   *     los esquemas; el resultado se notifica por webhook firmado. */
  {
    id: "pagonexo",
    name: "PagoNexo",
    category: "fintech",
    reference: "Stripe",
    summary: "Payments API for commerce applications.",
    focus: "REST API, payments, webhooks, antifraud and bank integration.",
    difficulty: "advanced",
    people: [
      ["Merchant Developer", "Integrates the API."],
      ["Operations Analyst", "Reviews payments and disputes."],
    ],
    externalSystems: [
      ["Banking Partner", "Settles funds to merchants."],
      ["Card Schemes", "Authorises cards worldwide."],
    ],
    containers: [
      ["Developer Dashboard", "container", "React", "Keys, logs and test payments."],
      ["Payments API", "container", "Go", "Public REST API."],
      ["Payment Orchestrator", "container", "Go", "Payment intents and retries."],
      ["Webhook Dispatcher", "container", "Rust", "Signed event delivery."],
      ["Antifraud Service", "container", "Python", "Rules and risk scoring."],
      ["Ledger Database", "database", "PostgreSQL", "Payments, fees and settlements."],
    ],
    componentSets: [
      {
        container: "Payment Orchestrator",
        components: [
          ["Intent Manager", "Go", "Creates and tracks payment intents."],
          ["Retry Policy", "Go", "Retries declines with issuer-specific rules."],
          ["Settlement Planner", "Go", "Batches captures for settlement."],
        ],
      },
    ],
    relations: [
      ["Merchant Developer", "Developer Dashboard", "Configures the integration", "HTTPS"],
      ["Merchant Developer", "Payments API", "Creates payments", "HTTPS"],
      ["Developer Dashboard", "Payments API", "Lists transactions", "HTTPS/JSON"],
      ["Payments API", "Payment Orchestrator", "Orchestrates the payment", "gRPC"],
      ["Payments API", "Webhook Dispatcher", "Registers a webhook", "gRPC"],
      ["Payment Orchestrator", "Antifraud Service", "Scores the payment", "gRPC"],
      ["Payment Orchestrator", "Ledger Database", "Records the payment", "SQL"],
      ["Operations Analyst", "Developer Dashboard", "Reviews logs", "HTTPS"],
      ["Intent Manager", "Retry Policy", "Schedules the retry", "Go"],
      ["Settlement Planner", "Intent Manager", "Reads the settled intents", "Go"],
      ["Intent Manager", "Card Schemes", "Authorises the card", "HTTPS"],
      ["Settlement Planner", "Banking Partner", "Settles funds", "HTTPS"],
    ],
  },

  /* ================================================================= */
  /* 4. Redes sociales y comunicación                                    */
  /* ================================================================= */

  /* ConectaRed · inspirado en Facebook — red social con feed y grafo.
   * L1: miembro y moderador de comunidad; correo y objeto de almacenamiento.
   * L2: app (React Native), publicación (Kotlin), feed (Go), grafo social
   *     (Java), notificaciones (Node), moderación (Python), cola Kafka de
   *     posts y base social.
   * L3: el feed se abre en worker de fan-out, ranker de relevancia y
   *     lector de timeline que fusiona fuentes.
   * Flujo clave: publicar escribe en Kafka; el feed consume y reordena, y
   *     la notificación se dispara desde el propio fan-out. */
  {
    id: "conectared",
    name: "ConectaRed",
    category: "social",
    reference: "Facebook",
    summary: "Social network with posts, followers and comments.",
    focus: "Profiles, feed, graph, notifications and moderation.",
    difficulty: "advanced",
    people: [
      ["Member", "Publishes posts and interacts with friends."],
      ["Community Moderator", "Sanctions reported content."],
    ],
    externalSystems: [
      ["Email Provider", "Delivers notification emails.", "SMTP"],
      ["Object Storage", "Stores photos and videos.", "HTTPS"],
    ],
    containers: [
      ["Web and Mobile App", "container", "React Native", "Feed, profile and uploads."],
      ["Post Service", "container", "Kotlin", "Publishing, reactions and comments."],
      ["Feed Service", "container", "Go", "Fan-out on read and ranking."],
      ["Graph Service", "container", "Java", "Friendships and follower graph."],
      ["Notification Service", "container", "Node.js", "Push and email notifications."],
      ["Moderation Service", "container", "Python", "Reports, classifiers and blocks."],
      ["Feed Stream", "queue", "Kafka", "Fan-out of post events."],
      ["Social Database", "database", "PostgreSQL", "Profiles, posts and edges."],
    ],
    componentSets: [
      {
        container: "Feed Service",
        components: [
          ["Fan-out Worker", "Go", "Replicates posts to follower timelines."],
          ["Ranker", "Go", "Scores posts for the personal feed."],
          ["Timeline Reader", "Go", "Merges ranked and chronological sources."],
        ],
      },
    ],
    relations: [
      ["Member", "Web and Mobile App", "Publishes and reacts", "HTTPS"],
      ["Community Moderator", "Moderation Service", "Reviews reports", "HTTPS"],
      ["Web and Mobile App", "Post Service", "Creates posts", "HTTPS"],
      ["Web and Mobile App", "Feed Service", "Loads the feed", "HTTPS"],
      ["Web and Mobile App", "Graph Service", "Manages the friend list", "HTTPS"],
      ["Post Service", "Object Storage", "Stores media", "HTTPS"],
      ["Post Service", "Feed Stream", "Publishes post events", "Kafka", "async"],
      ["Feed Stream", "Feed Service", "Delivers post events", "Kafka", "async"],
      ["Feed Service", "Notification Service", "Triggers notifications", "gRPC"],
      ["Notification Service", "Email Provider", "Sends email", "SMTP", "async"],
      ["Moderation Service", "Social Database", "Applies sanctions", "SQL"],
      ["Fan-out Worker", "Ranker", "Orders the new posts", "Go"],
      ["Timeline Reader", "Ranker", "Reads the ranked posts", "Go"],
      ["Feed Stream", "Fan-out Worker", "Delivers post events", "Kafka", "async"],
    ],
  },

  /* ClipLoop · inspirado en TikTok — vídeo corto con feed personalizado.
   * L1: creador y espectador; CDN de vídeo y socio de moderación.
   * L2: estudio del creador (Next), ingesta (Rust), transcodificación (Go),
   *     recomendaciones (Python), feed (Kotlin), cola Kafka de trabajos,
   *     feature store Redis y base ClickHouse de métricas.
   * L3: las recomendaciones se abre en generación de candidatos, modelo de
   *     ranking y constructor de vectores de interacción.
   * Flujo clave: subir encola un job de transcodificación que un worker
   *     consume; el feed pide el siguiente clip por gRPC. */
  {
    id: "cliploop",
    name: "ClipLoop",
    category: "social",
    reference: "TikTok",
    summary: "Short video social network.",
    focus: "Video processing, personalised feed and analytics.",
    difficulty: "advanced",
    people: [
      ["Creator", "Uploads short clips."],
      ["Viewer", "Watches a personalised feed."],
    ],
    externalSystems: [
      ["CDN Provider", "Serves video segments.", "HTTPS"],
      ["Moderation Partner", "Checks content safety."],
    ],
    containers: [
      ["Creator Studio", "container", "Next.js", "Upload, editing and analytics."],
      ["Video Ingest", "container", "Rust", "Uploads and validates media."],
      ["Transcoding Pipeline", "container", "Go", "Produces multiple renditions."],
      ["Recommendation Service", "container", "Python", "Ranks clips for the viewer."],
      ["Feed Service", "container", "Kotlin", "Serves the vertical feed."],
      ["Transcode Queue", "queue", "Kafka", "Video jobs."],
      ["Feature Store", "database", "Redis", "Recent interaction vectors."],
      ["Video Database", "database", "ClickHouse", "Clips, metadata and watch stats."],
    ],
    componentSets: [
      {
        container: "Recommendation Service",
        components: [
          ["Candidate Generator", "Python", "Retrieves candidate clips from recent activity."],
          ["Ranking Model", "Python", "Scores candidates for the viewer."],
          ["Feature Builder", "Python", "Builds the interaction vectors used at serving time."],
        ],
      },
    ],
    relations: [
      ["Creator", "Creator Studio", "Uploads a clip", "HTTPS"],
      ["Viewer", "Feed Service", "Watches the feed", "HTTPS"],
      ["Creator Studio", "Video Ingest", "Uploads the file", "HTTPS"],
      ["Video Ingest", "Transcode Queue", "Enqueues a transcode job", "Kafka", "async"],
      ["Transcode Queue", "Transcoding Pipeline", "Delivers transcode jobs", "Kafka", "async"],
      ["Transcoding Pipeline", "CDN Provider", "Publishes renditions", "HTTPS"],
      ["Feed Service", "Recommendation Service", "Asks for the next clip", "gRPC"],
      ["Recommendation Service", "Video Database", "Reads clip metadata", "SQL"],
      ["Video Ingest", "Moderation Partner", "Checks content", "HTTPS"],
      ["Candidate Generator", "Feature Builder", "Enriches the candidates", "Python"],
      ["Candidate Generator", "Ranking Model", "Scores the candidates", "Python"],
      ["Ranking Model", "Feature Store", "Reads interaction vectors", "RESP"],
    ],
  },

  /* TalentoPro · inspirado en LinkedIn — red profesional y empleo.
   * L1: profesional y reclutador; correo y verificación de antecedentes.
   * L2: app web (React), perfiles (Node), red (Java), empleo (Kotlin),
   *     notificaciones (Go) y base profesional.
   * L3: el servicio de empleo se abre en publicación de vacantes, tracker
   *     de candidatos y matcher que rankea candidatos contra la oferta.
   * Flujo clave: aplicar escribe la candidatura; el servicio de red avisa
   *     por invitaciones y el de notificaciones entrega por correo. */
  {
    id: "talentopro",
    name: "TalentoPro",
    category: "social",
    reference: "LinkedIn",
    summary: "Professional network connecting companies and workers.",
    focus: "Profiles, connections, job offers and recommendations.",
    difficulty: "beginner",
    people: [
      ["Professional", "Builds a profile and applies to offers."],
      ["Recruiter", "Publishes vacancies and searches candidates."],
    ],
    externalSystems: [
      ["Email Provider", "Sends invitations and alerts.", "SMTP"],
      ["Background Check Provider", "Verifies professional records."],
    ],
    containers: [
      ["Web App", "container", "React", "Profiles, feed and vacancies."],
      ["Profile Service", "container", "Node.js", "CV, experience and endorsements."],
      ["Network Service", "container", "Java", "Connections and degree of separation."],
      ["Job Service", "container", "Kotlin", "Vacancies, applications and screening."],
      ["Notification Service", "container", "Go", "Invitations and job alerts."],
      ["Professional Database", "database", "PostgreSQL", "Profiles, offers and applications."],
    ],
    componentSets: [
      {
        container: "Job Service",
        components: [
          ["Vacancy Publisher", "Kotlin", "Publishes and expires job offers."],
          ["Applicant Tracker", "Kotlin", "Moves candidates through the pipeline."],
          ["Screening Matcher", "Kotlin", "Ranks applicants against the offer."],
        ],
      },
    ],
    relations: [
      ["Professional", "Web App", "Edits the profile", "HTTPS"],
      ["Recruiter", "Job Service", "Publishes a vacancy", "HTTPS"],
      ["Web App", "Profile Service", "Reads profiles", "HTTPS/JSON"],
      ["Web App", "Network Service", "Manages connections", "HTTPS"],
      ["Web App", "Job Service", "Applies to a vacancy", "HTTPS"],
      ["Job Service", "Background Check Provider", "Verifies the record", "HTTPS"],
      ["Network Service", "Notification Service", "Sends invitations", "gRPC"],
      ["Notification Service", "Email Provider", "Delivers email", "SMTP", "async"],
      ["Screening Matcher", "Applicant Tracker", "Scores the applicants", "Kotlin"],
      ["Applicant Tracker", "Vacancy Publisher", "Links applications to the vacancy", "Kotlin"],
      ["Applicant Tracker", "Professional Database", "Writes applications", "SQL"],
    ],
  },

  /* EquipoChat · inspirado en Slack — mensajería de equipo.
   * L1: miembro y admin de workspace; correo y almacenamiento de objetos.
   * L2: cliente escritorio/móvil (Electron), API de mensajería (Node),
   *     gateway en tiempo real (Go), presencia (Redis), ficheros (Kotlin),
   *     búsqueda (Rust) y base de mensajes.
   * L3: el gateway se abre en hub de conexiones, router de suscripciones
   *     por sala y buffer de backpressure para clientes lentos.
   * Flujo clave: el cliente mantiene un WebSocket con el gateway, que
   *     entrega eventos sin bloquear la API de mensajería. */
  {
    id: "equipo-chat",
    name: "EquipoChat",
    category: "social",
    reference: "Slack",
    summary: "Team messaging for organisations.",
    focus: "Channels, messages, files, permissions and search.",
    difficulty: "intermediate",
    people: [
      ["Member", "Talks in channels and shares files."],
      ["Workspace Admin", "Manages members and retention policies."],
    ],
    externalSystems: [
      ["Email Provider", "Sends invitations and digests.", "SMTP"],
      ["Object Storage", "Stores uploaded files."],
    ],
    containers: [
      ["Desktop and Mobile Client", "container", "Electron", "Channels, threads and search."],
      ["Messaging API", "container", "Node.js", "Messages, reactions and threads."],
      ["Real-time Gateway", "container", "Go", "WebSocket fan-out."],
      ["Presence Service", "container", "Redis", "Typing and availability."],
      ["File Service", "container", "Kotlin", "Uploads and virus scanning."],
      ["Search Service", "container", "Rust", "Full-text message search."],
      ["Message Database", "database", "PostgreSQL", "Channels, messages and members."],
    ],
    componentSets: [
      {
        container: "Real-time Gateway",
        components: [
          ["Connection Hub", "Go", "Maintains the WebSocket sessions."],
          ["Subscription Router", "Go", "Delivers events to the right rooms."],
          ["Backpressure Buffer", "Go", "Throttles slow clients without dropping events."],
        ],
      },
    ],
    relations: [
      ["Member", "Desktop and Mobile Client", "Sends messages", "HTTPS"],
      ["Workspace Admin", "Messaging API", "Manages the workspace", "HTTPS"],
      ["Desktop and Mobile Client", "Messaging API", "Posts messages", "HTTPS/JSON"],
      ["Messaging API", "Message Database", "Persists messages and threads", "SQL"],
      ["Messaging API", "Real-time Gateway", "Pushes messages", "gRPC"],
      ["Desktop and Mobile Client", "Presence Service", "Updates presence", "HTTPS"],
      ["Desktop and Mobile Client", "File Service", "Uploads files", "HTTPS"],
      ["File Service", "Object Storage", "Stores the file", "HTTPS"],
      ["Messaging API", "Search Service", "Indexes messages", "gRPC"],
      ["Messaging API", "Email Provider", "Sends notifications", "SMTP", "async"],
      ["Connection Hub", "Subscription Router", "Registers the subscriptions", "Go"],
      ["Subscription Router", "Backpressure Buffer", "Queues slow consumers", "Go"],
      ["Connection Hub", "Desktop and Mobile Client", "Delivers events", "WebSocket"],
    ],
  },

  /* Reunión360 · inspirado en Zoom — videconferencia con grabación.
   * L1: anfitrión y invitado; calendario (OAuth) y relay TURN externos.
   * L2: cliente web (WebRTC), reuniones (Node), señalización (Go),
   *     gateway de medios SFU (C++), grabación (Kotlin) y base de reuniones.
   * L3: el gateway de medios se abre en mezcla selectiva de flujos, jitter
   *     buffer que oculta pérdidas y estimador de ancho de banda por nodo.
   * Flujo clave: señalización negocia el WebRTC y los medios viajan en
   *     paralelo por el SFU, que deriva a la grabación. */
  {
    id: "reunion-360",
    name: "Reunión360",
    category: "social",
    reference: "Zoom",
    summary: "Video conferencing and collaborative meetings.",
    focus: "Rooms, signalling, media, recordings and calendar.",
    difficulty: "advanced",
    people: [
      ["Host", "Schedules and starts the meeting."],
      ["Guest", "Joins from a browser or device."],
    ],
    externalSystems: [
      ["Calendar Provider", "Reads and creates events.", "OAuth"],
      ["TURN Provider", "Relays media in restrictive networks.", "STUN/TURN"],
    ],
    containers: [
      ["Web Client", "container", "WebRTC", "Media controls and virtual background."],
      ["Meeting Service", "container", "Node.js", "Rooms, tokens and scheduling."],
      ["Signalling Service", "container", "Go", "WebSocket negotiation."],
      ["Media Gateway", "container", "C++", "SFU mixing and forwarding."],
      ["Recording Service", "container", "Kotlin", "Stores recordings and transcripts."],
      ["Meeting Database", "database", "PostgreSQL", "Meetings, participants and recordings."],
    ],
    componentSets: [
      {
        container: "Media Gateway",
        components: [
          ["SFU Mixer", "C++", "Forwards selective streams between participants."],
          ["Jitter Buffer", "C++", "Reorders packets and hides network loss."],
          ["Bandwidth Estimator", "C++", "Adapts quality to each participant link."],
        ],
      },
    ],
    relations: [
      ["Host", "Web Client", "Schedules the meeting", "HTTPS"],
      ["Guest", "Web Client", "Joins the meeting", "HTTPS"],
      ["Web Client", "Signalling Service", "Negotiates media", "WebSocket"],
      ["Web Client", "Media Gateway", "Sends media", "WebRTC"],
      ["Web Client", "Meeting Service", "Manages the room", "HTTPS/JSON"],
      ["Meeting Service", "Calendar Provider", "Syncs the calendar", "OAuth"],
      ["Media Gateway", "Recording Service", "Streams the recording", "gRPC"],
      ["Recording Service", "Meeting Database", "Saves the recording", "SQL"],
      ["SFU Mixer", "Jitter Buffer", "Feeds the jitter buffer", "C++"],
      ["Bandwidth Estimator", "SFU Mixer", "Adjusts the stream bitrate", "C++"],
      ["SFU Mixer", "TURN Provider", "Relays media", "STUN/TURN"],
    ],
  },

  /* ================================================================= */
  /* 5. Educación y EdTech                                             */
  /* ================================================================= */

  /* AulaNube · inspirado en Moodle — gestión del aprendizaje.
   * L1: estudiante, profesor y administrador; IdP SAML y proveedor de
   *     videoconferencia externos.
   * L2: app web (React), cursos (Kotlin), evaluaciones (Java), libreta de
   *     notas (Python), notificaciones (Node) y base del LMS.
   * L3: el servicio de evaluaciones se abre en motor de cuestionarios,
   *     almacén de entregas y flujo de calificación hacia el profesor.
   * Flujo clave: el SSO delegado en el IdP valida a profesores y alumnos
   *     antes de tocar el contenido del curso. */
  {
    id: "aulanube",
    name: "AulaNube",
    category: "education",
    reference: "Moodle",
    summary: "Learning management platform.",
    focus: "Courses, enrolments, assessments, grades and roles.",
    difficulty: "intermediate",
    people: [
      ["Student", "Follows courses and submits assessments."],
      ["Teacher", "Creates content and grades submissions."],
      ["Administrator", "Manages users and roles."],
    ],
    externalSystems: [
      ["Identity Provider", "Single sign-on for staff and students.", "SAML"],
      ["Videoconference Provider", "Live lessons.", "HTTPS"],
    ],
    containers: [
      ["Learning Web App", "container", "React", "Courses, forums and grades."],
      ["Course Service", "container", "Kotlin", "Content, sections and enrolments."],
      ["Assessment Service", "container", "Java", "Quizzes, submissions and grading."],
      ["Gradebook Service", "container", "Python", "Weighted grades and transcripts."],
      ["Notification Service", "container", "Node.js", "Deadlines and announcements."],
      ["LMS Database", "database", "PostgreSQL", "Courses, users and submissions."],
    ],
    componentSets: [
      {
        container: "Assessment Service",
        components: [
          ["Quiz Engine", "Java", "Builds and scores quizzes."],
          ["Submission Store", "Java", "Collects attempts and resubmissions."],
          ["Grading Workflow", "Java", "Routes work to the teacher and records grades."],
        ],
      },
    ],
    relations: [
      ["Student", "Learning Web App", "Follows a course", "HTTPS"],
      ["Teacher", "Learning Web App", "Creates content", "HTTPS"],
      ["Administrator", "Course Service", "Manages roles", "HTTPS"],
      ["Learning Web App", "Course Service", "Reads course content", "HTTPS/JSON"],
      ["Learning Web App", "Assessment Service", "Submits an assessment", "HTTPS"],
      ["Gradebook Service", "LMS Database", "Writes grades", "SQL"],
      ["Course Service", "Identity Provider", "Verifies users", "SAML"],
      ["Course Service", "Videoconference Provider", "Schedules live lessons", "HTTPS"],
      ["Course Service", "Notification Service", "Sends announcements", "gRPC"],
      ["Quiz Engine", "Submission Store", "Stores the submission", "Java"],
      ["Grading Workflow", "Submission Store", "Reads the submissions to grade", "Java"],
      ["Grading Workflow", "Gradebook Service", "Sends grades", "gRPC"],
    ],
  },

  /* CodeCampus · inspirado en Codecademy — cursos de programación.
   * L1: alumno y autor de cursos; sandbox de ejecución y tutor LLM.
   * L2: IDE en el navegador (Monaco + React), cursos (Node), evaluador
   *     (Go), tutor (Python), cola NATS de ejecuciones y base de cursos.
   * L3: el evaluador se abre en test harness, despachador al sandbox con
   *     aislamiento y scorer de comprobaciones fallidas.
   * Flujo clave: cada solución se encola y se ejecuta fuera del proceso
   *     del evaluador; el resultado puntúa y guarda el progreso. */
  {
    id: "codecampus",
    name: "CodeCampus",
    category: "education",
    reference: "Codecademy",
    summary: "Interactive programming courses.",
    focus: "Code editor, evaluator, exercises and progress.",
    difficulty: "intermediate",
    people: [
      ["Learner", "Writes code and runs exercises."],
      ["Course Author", "Writes exercises and solutions."],
    ],
    externalSystems: [
      ["Code Runner Sandbox", "Executes untrusted code.", "gRPC"],
      ["LLM Tutor", "Explains the exercise in natural language."],
    ],
    containers: [
      ["Learning IDE", "container", "Monaco + React", "Editor, lessons and console."],
      ["Course Service", "container", "Node.js", "Curriculum and progress."],
      ["Evaluator Service", "container", "Go", "Test harness and scoring."],
      ["Tutor Service", "container", "Python", "Hints powered by a language model."],
      ["Sandbox Queue", "queue", "NATS", "Execution jobs."],
      ["Course Database", "database", "PostgreSQL", "Lessons and progress."],
    ],
    componentSets: [
      {
        container: "Evaluator Service",
        components: [
          ["Test Harness", "Go", "Runs the exercise tests against the submission."],
          ["Sandbox Dispatcher", "Go", "Queues executions and isolates each run."],
          ["Scorer", "Go", "Computes the score and the failing checks."],
        ],
      },
    ],
    relations: [
      ["Learner", "Learning IDE", "Writes and runs code", "HTTPS"],
      ["Course Author", "Course Service", "Publishes lessons", "HTTPS"],
      ["Learning IDE", "Course Service", "Loads the lesson", "HTTPS/JSON"],
      ["Learning IDE", "Evaluator Service", "Submits a solution", "HTTPS"],
      ["Evaluator Service", "Code Runner Sandbox", "Executes in a sandbox", "gRPC"],
      ["Learning IDE", "Tutor Service", "Asks for a hint", "HTTPS"],
      ["Tutor Service", "LLM Tutor", "Generates the explanation", "HTTPS"],
      ["Test Harness", "Sandbox Dispatcher", "Dispatches the run", "Go"],
      ["Sandbox Dispatcher", "Sandbox Queue", "Enqueues the run", "NATS", "async"],
      ["Scorer", "Course Database", "Writes progress", "SQL"],
    ],
  },

  /* LinguaQuest · inspirado en Duolingo — idiomas con gamificación.
   * L1: único actor (aprendiz); proveedor de texto a voz externo.
   * L2: app móvil (Flutter), lecciones (Kotlin), repetición espaciada
   *     (Python), progreso (Go) y base del aprendiz.
   * L3: el servicio de lecciones se abre en constructor de ejercicios,
   *     ajuste dinámico de dificultad y gestor de vidas y reintentos.
   * Flujo clave: cada lección agenda revisiones futuras que el servicio de
   *     repetición espaciada decide cuándo repasar. */
  {
    id: "linguaquest",
    name: "LinguaQuest",
    category: "education",
    reference: "Duolingo",
    summary: "Language learning with challenges and streaks.",
    focus: "Lessons, levels, gamification and learning progress.",
    difficulty: "beginner",
    people: [["Learner", "Completes daily lessons and reviews vocabulary."]],
    externalSystems: [["Text to Speech Provider", "Pronunciation of exercises."]],
    containers: [
      ["Mobile App", "container", "Flutter", "Lessons, streak and badges."],
      ["Lesson Service", "container", "Kotlin", "Exercises, hearts and levels."],
      ["Spaced Repetition Service", "container", "Python", "Schedules reviews."],
      ["Progress Service", "container", "Go", "Streaks, leagues and achievements."],
      ["Learner Database", "database", "PostgreSQL", "Learners, lessons and reviews."],
    ],
    componentSets: [
      {
        container: "Lesson Service",
        components: [
          ["Exercise Builder", "Kotlin", "Assembles lessons from the item bank."],
          ["Difficulty Tuner", "Kotlin", "Adjusts item difficulty to the learner."],
          ["Heart Manager", "Kotlin", "Applies the lives and retry rules."],
        ],
      },
    ],
    relations: [
      ["Learner", "Mobile App", "Practises", "HTTPS"],
      ["Mobile App", "Lesson Service", "Loads exercises", "HTTPS/JSON"],
      ["Mobile App", "Progress Service", "Reads the streak", "HTTPS"],
      ["Lesson Service", "Spaced Repetition Service", "Schedules reviews", "gRPC"],
      ["Lesson Service", "Text to Speech Provider", "Requests audio", "HTTPS"],
      ["Spaced Repetition Service", "Learner Database", "Writes review cards", "SQL"],
      ["Progress Service", "Learner Database", "Reads achievements", "SQL"],
      ["Difficulty Tuner", "Exercise Builder", "Rebalances the exercises", "Kotlin"],
      ["Heart Manager", "Difficulty Tuner", "Slows down on mistakes", "Kotlin"],
      ["Heart Manager", "Learner Database", "Reads and writes learner progress", "SQL"],
    ],
  },

  /* MentorLink · inspirado en Preply — clases particulares con pago en
   * depósito (escrow).
   * L1: alumno y profesor; pago en depósito y proveedor de vídeo.
   * L2: marketplace (Next), reservas (Node), disponibilidad (Kotlin),
   *     sesión (Java), pagos al profesor (Go) y base del marketplace.
   * L3: las reservas se abren en bloqueo de franja, despacho de recordatorios
   *     y gestor de cancelaciones con ventanas de reembolso.
   * Flujo clave: el pago queda retenido hasta que la sesión se completa y
   *     el servicio de pagos libera la ganancia del profesor. */
  {
    id: "mentorlink",
    name: "MentorLink",
    category: "education",
    reference: "Preply",
    summary: "Marketplace connecting students and tutors.",
    focus: "Profiles, schedule, bookings, sessions and payments.",
    difficulty: "beginner",
    people: [
      ["Student", "Books lessons with a tutor."],
      ["Tutor", "Publishes availability and teaches."],
    ],
    externalSystems: [
      ["Payment Provider", "Escrows the session payment."],
      ["Video Provider", "Carries the lesson call."],
    ],
    containers: [
      ["Tutor Marketplace", "container", "Next.js", "Search, profiles and booking."],
      ["Booking Service", "container", "Node.js", "Slots, reservations and reminders."],
      ["Schedule Service", "container", "Kotlin", "Availability and time zones."],
      ["Session Service", "container", "Java", "Live lesson room and notes."],
      ["Payout Service", "container", "Go", "Tutor earnings and invoices."],
      ["Marketplace Database", "database", "PostgreSQL", "Tutors, bookings and sessions."],
    ],
    componentSets: [
      {
        container: "Booking Service",
        components: [
          ["Slot Reserve", "Node.js", "Holds a tutor slot while the booking completes."],
          ["Reminder Dispatcher", "Node.js", "Sends lesson reminders."],
          ["Cancellation Handler", "Node.js", "Applies the refund windows."],
        ],
      },
    ],
    relations: [
      ["Student", "Tutor Marketplace", "Books a lesson", "HTTPS"],
      ["Tutor", "Tutor Marketplace", "Publishes availability", "HTTPS"],
      ["Tutor", "Payout Service", "Reviews earnings", "HTTPS"],
      ["Tutor Marketplace", "Booking Service", "Creates the booking", "HTTPS"],
      ["Booking Service", "Payment Provider", "Escrows the payment", "HTTPS"],
      ["Booking Service", "Session Service", "Creates the room", "gRPC"],
      ["Session Service", "Video Provider", "Runs the call", "HTTPS"],
      ["Payout Service", "Booking Service", "Reads the completed session", "gRPC"],
      ["Schedule Service", "Marketplace Database", "Writes availability", "SQL"],
      ["Cancellation Handler", "Slot Reserve", "Releases the slot", "Node.js"],
      ["Reminder Dispatcher", "Slot Reserve", "Reads the upcoming slots", "Node.js"],
      ["Slot Reserve", "Schedule Service", "Reserves the slot", "gRPC"],
    ],
  },

  /* Memora · inspirado en Quizlet — tarjetas de estudio.
   * L1: estudiante y profesor; sin sistemas externos (ejemplo autocontenido).
   * L2: app de estudio (React Native), mazos (Node), sesiones (Kotlin),
   *     estadísticas (Python) y base de estudio.
   * L3: las sesiones se abren en el scheduler de repetición espaciada,
   *     estado de la sesión en curso y escritura de cada repaso.
   * Flujo clave: el repaso alimenta las estadísticas que luego deciden
   *     qué tarjetas débiles volver a mostrar. */
  {
    id: "memora",
    name: "Memora",
    category: "education",
    reference: "Quizlet",
    summary: "Flashcards and quick self-assessments.",
    focus: "Decks, question banks, study sessions and statistics.",
    difficulty: "beginner",
    people: [
      ["Student", "Creates decks and studies."],
      ["Teacher", "Shares decks with the class."],
    ],
    externalSystems: [],
    containers: [
      ["Study App", "container", "React Native", "Decks, sessions and statistics."],
      ["Deck Service", "container", "Node.js", "Cards, tags and sharing."],
      ["Session Service", "container", "Kotlin", "Spaced repetition scheduling."],
      ["Statistics Service", "container", "Python", "Progress and weak cards."],
      ["Study Database", "database", "PostgreSQL", "Decks, cards and sessions."],
    ],
    componentSets: [
      {
        container: "Session Service",
        components: [
          ["Scheduler", "Kotlin", "Orders cards by the spaced repetition algorithm."],
          ["Session State", "Kotlin", "Tracks the current run and its results."],
          ["Review Writer", "Kotlin", "Persists each review for the statistics."],
        ],
      },
    ],
    relations: [
      ["Student", "Study App", "Studies", "HTTPS"],
      ["Teacher", "Study App", "Shares a deck", "HTTPS"],
      ["Study App", "Deck Service", "Manages cards", "HTTPS/JSON"],
      ["Study App", "Session Service", "Starts a session", "HTTPS"],
      ["Deck Service", "Study Database", "Reads and writes decks", "SQL"],
      ["Statistics Service", "Study Database", "Aggregates progress", "SQL"],
      ["Scheduler", "Session State", "Starts the session state", "Kotlin"],
      ["Review Writer", "Session State", "Reads the review history", "Kotlin"],
      ["Session State", "Statistics Service", "Records the session", "gRPC"],
      ["Review Writer", "Study Database", "Writes the reviews", "SQL"],
    ],
  },

  /* ================================================================= */
  /* 6. Salud y bienestar                                              */
  /* ================================================================= */

  /* SaludConecta · inspirado en Teladoc — teleconsulta.
   * L1: paciente y médico; mutua y proveedor de vídeo externos.
   * L2: app del paciente (React Native), portal clínico (React), citas
   *     (Kotlin), telemedicina (Java), historia clínica (Go), facturación
   *     (Python), base clínica y stream Kafka de auditoría.
   * L3: la historia clínica se abre en almacén de notas, gestor de
   *     consentimientos y logger de auditoría inmutable.
   * Flujo clave: cada acceso a la historia se registra en el stream de
   *     auditoría; la facturación se dispara desde el flujo clínico. */
  {
    id: "saludconecta",
    name: "SaludConecta",
    category: "health",
    reference: "Teladoc",
    summary: "Telemedicine and remote consultations.",
    focus: "Patients, professionals, appointments, video calls and records.",
    difficulty: "advanced",
    people: [
      ["Patient", "Books a consultation from home."],
      ["Doctor", "Attends the consultation and writes the record."],
    ],
    externalSystems: [
      ["Health Insurance", "Authorises and bills the consultation."],
      ["Video Provider", "Carries the teleconsultation."],
    ],
    containers: [
      ["Patient App", "container", "React Native", "Booking, records and prescriptions."],
      ["Clinical Portal", "container", "React", "Agenda and patient history."],
      ["Appointment Service", "container", "Kotlin", "Slots, bookings and reminders."],
      ["Telemedicine Service", "container", "Java", "Consultation rooms and notes."],
      ["Clinical Records Service", "container", "Go", "EHR and prescriptions."],
      ["Billing Service", "container", "Python", "Claims and reconciliation."],
      ["Clinical Database", "database", "PostgreSQL", "Patients, appointments and records."],
      ["Audit Stream", "queue", "Kafka", "Immutable access log."],
    ],
    componentSets: [
      {
        container: "Clinical Records Service",
        components: [
          ["Record Store", "Go", "Stores clinical notes and prescriptions."],
          ["Consent Manager", "Go", "Applies patient access consent."],
          ["Audit Logger", "Go", "Writes the immutable access trail."],
        ],
      },
    ],
    relations: [
      ["Patient", "Patient App", "Books a consultation", "HTTPS"],
      ["Doctor", "Clinical Portal", "Attends the appointment", "HTTPS"],
      ["Patient App", "Appointment Service", "Books and cancels", "HTTPS"],
      ["Patient App", "Clinical Records Service", "Reads the history", "HTTPS"],
      ["Clinical Portal", "Appointment Service", "Reads the agenda", "HTTPS"],
      ["Clinical Portal", "Billing Service", "Tracks the claim", "HTTPS"],
      ["Patient App", "Telemedicine Service", "Joins the consultation", "HTTPS"],
      ["Clinical Portal", "Telemedicine Service", "Writes the record", "HTTPS"],
      ["Telemedicine Service", "Video Provider", "Carries the call", "HTTPS"],
      ["Billing Service", "Health Insurance", "Sends the claim", "HTTPS"],
      ["Record Store", "Consent Manager", "Checks consent before writing", "Go"],
      ["Audit Logger", "Record Store", "Logs record access", "Go"],
      ["Record Store", "Clinical Database", "Reads and writes records", "SQL"],
      ["Audit Logger", "Audit Stream", "Logs record access", "Kafka", "async"],
    ],
  },

  /* ClínicaFlow · inspirado en sistemas de gestión clínica.
   * L1: paciente, recepcionista y médico; aseguradora y laboratorio.
   * L2: app de la clínica (Angular), agenda (Java), historia clínica
   *     (Kotlin), facturación (Python), integraciones (Node) y base clínica.
   * L3: la historia clínica se abre en editor de notas estructuradas,
   *     emisor de recetas y visor de historial longitudinal.
   * Flujo clave: la agenda dispara la facturación, que delega en el
   *     servicio de integraciones los contactos con laboratorio y aseguradora. */
  {
    id: "clinicaflow",
    name: "ClínicaFlow",
    category: "health",
    reference: "Clinical management systems",
    summary: "Clinic management: appointments and patient care.",
    focus: "Agenda, clinical record, care and billing.",
    difficulty: "beginner",
    people: [
      ["Patient", "Books and manages appointments."],
      ["Receptionist", "Manages the agenda and billing."],
      ["Doctor", "Records the visit."],
    ],
    externalSystems: [
      ["Insurance Provider", "Checks coverage."],
      ["Laboratory", "Returns test results."],
    ],
    containers: [
      ["Clinic Web App", "container", "Angular", "Agenda, patients and billing."],
      ["Scheduling Service", "container", "Java", "Appointments and waiting room."],
      ["Clinical Record Service", "container", "Kotlin", "Notes, diagnosis and prescriptions."],
      ["Billing Service", "container", "Python", "Invoices and insurance claims."],
      ["Integration Service", "container", "Node.js", "Lab and insurance connectors."],
      ["Clinic Database", "database", "PostgreSQL", "Patients, visits and invoices."],
    ],
    componentSets: [
      {
        container: "Clinical Record Service",
        components: [
          ["Note Editor", "Kotlin", "Structured visit notes and diagnosis codes."],
          ["Prescription Writer", "Kotlin", "Issues and renews prescriptions."],
          ["History Viewer", "Kotlin", "Presents the longitudinal record."],
        ],
      },
    ],
    relations: [
      ["Patient", "Clinic Web App", "Books a visit", "HTTPS"],
      ["Receptionist", "Clinic Web App", "Manages the agenda", "HTTPS"],
      ["Doctor", "Clinical Record Service", "Writes the visit note", "HTTPS"],
      ["Clinic Web App", "Scheduling Service", "Books and reschedules", "HTTPS/JSON"],
      ["Clinic Web App", "Clinical Record Service", "Opens the record", "HTTPS"],
      ["Scheduling Service", "Billing Service", "Triggers invoicing", "gRPC"],
      ["Billing Service", "Integration Service", "Sends the claim", "gRPC"],
      ["Integration Service", "Insurance Provider", "Checks coverage", "HTTPS"],
      ["Integration Service", "Laboratory", "Fetches results", "HTTPS"],
      ["Prescription Writer", "Note Editor", "Links the prescription to the note", "Kotlin"],
      ["History Viewer", "Note Editor", "Reads past notes", "Kotlin"],
      ["Note Editor", "Clinic Database", "Writes records", "SQL"],
    ],
  },

  /* VitalTrack · inspirado en Fitbit — actividad y coaching.
   * L1: usuario con wearable y coach; nube del fabricante del dispositivo.
   * L2: app móvil (Swift), sincronización (Go), métricas (Python), metas
   *     (Kotlin), panel del coach (React), serie temporal ClickHouse y
   *     caché Redis de agregados.
   * L3: el servicio de métricas se abre en escritor de series, agregador
   *     de totales y detector de anomalías de frecuencia cardiaca.
   * Flujo clave: los lotes de sensores se ingieren por lotes y se agregan
   *     para que el panel del coach no lea la serie cruda. */
  {
    id: "vitaltrack",
    name: "VitalTrack",
    category: "health",
    reference: "Fitbit",
    summary: "Activity tracking and habit coaching.",
    focus: "Sensors, metrics, goals and mobile sync.",
    difficulty: "beginner",
    people: [
      ["Tracker User", "Wears the device and reviews progress."],
      ["Coach", "Reviews the metrics and adjusts goals."],
    ],
    externalSystems: [["Wearable Cloud", "Firmware updates and device sync."]],
    containers: [
      ["Mobile App", "container", "Swift", "Dashboard, goals and social streaks."],
      ["Sync Service", "container", "Go", "Ingests sensor batches."],
      ["Metrics Service", "container", "Python", "Steps, sleep and heart rate."],
      ["Goal Service", "container", "Kotlin", "Goals, streaks and reminders."],
      ["Coach Dashboard", "container", "React", "Client overview."],
      ["Metrics Database", "database", "ClickHouse", "Time series of measurements."],
      ["Metrics Cache", "database", "Redis", "Latest aggregated values."],
    ],
    componentSets: [
      {
        container: "Metrics Service",
        components: [
          ["Series Writer", "Python", "Appends sensor measurements to the store."],
          ["Aggregator", "Python", "Rolls up daily and weekly totals."],
          ["Anomaly Detector", "Python", "Flags unusual heart-rate patterns."],
        ],
      },
    ],
    relations: [
      ["Tracker User", "Mobile App", "Reviews progress", "HTTPS"],
      ["Coach", "Coach Dashboard", "Reviews clients", "HTTPS"],
      ["Mobile App", "Sync Service", "Sends sensor data", "HTTPS"],
      ["Sync Service", "Wearable Cloud", "Syncs the device", "HTTPS"],
      ["Sync Service", "Metrics Service", "Stores measurements", "gRPC"],
      ["Metrics Service", "Metrics Cache", "Caches aggregates", "RESP"],
      ["Mobile App", "Goal Service", "Manages goals", "HTTPS"],
      ["Coach Dashboard", "Metrics Service", "Queries metrics", "gRPC"],
      ["Series Writer", "Aggregator", "Feeds the aggregates", "Python"],
      ["Aggregator", "Anomaly Detector", "Passes the series to detect", "Python"],
      ["Series Writer", "Metrics Database", "Writes time series", "SQL"],
    ],
  },

  /* FarmaClick · farmacia online con receta regulada.
   * L1: cliente y farmacéutico; autoridad sanitaria y pasarela de pago.
   * L2: web de farmacia (Next), catálogo (Node), recetas (Kotlin),
   *     pedidos (Java), inventario (Go) y base de farmacia.
   * L3: el servicio de pedidos se abre en puerta de receta que bloquea
   *     medicamentos regulados, asignación de lote por caducidad y nota
   *     de envío regulada.
   * Flujo clave: nada regulado sale sin validación de la autoridad; el
   *     lote se elige por fecha de caducidad para minimizar mermas. */
  {
    id: "farmaclick",
    name: "FarmaClick",
    category: "health",
    reference: "Online pharmacies",
    summary: "Pharmacy catalogue and regulated prescription orders.",
    focus: "Products, inventory, prescriptions and controlled dispatch.",
    difficulty: "beginner",
    people: [
      ["Customer", "Orders medicines and uploads a prescription."],
      ["Pharmacist", "Validates the prescription and prepares the order."],
    ],
    externalSystems: [
      ["Health Authority", "Validates prescriptions."],
      ["Payment Gateway", "Processes the payment."],
    ],
    containers: [
      ["Pharmacy Web App", "container", "Next.js", "Catalogue, cart and prescriptions."],
      ["Catalogue Service", "container", "Node.js", "Products and stock visibility."],
      ["Prescription Service", "container", "Kotlin", "Uploads and validation state."],
      ["Order Service", "container", "Java", "Orders and regulated dispatch."],
      ["Inventory Service", "container", "Go", "Stock by batch and expiry."],
      ["Pharmacy Database", "database", "PostgreSQL", "Products, orders and prescriptions."],
    ],
    componentSets: [
      {
        container: "Order Service",
        components: [
          ["Prescription Gate", "Java", "Blocks regulated items without validation."],
          ["Batch Allocator", "Java", "Assigns batches by expiry date."],
          ["Dispatch Note", "Java", "Generates the regulated shipping note."],
        ],
      },
    ],
    relations: [
      ["Customer", "Pharmacy Web App", "Places an order", "HTTPS"],
      ["Pharmacist", "Prescription Service", "Validates the prescription", "HTTPS"],
      ["Pharmacy Web App", "Catalogue Service", "Searches products", "HTTPS/JSON"],
      ["Pharmacy Web App", "Order Service", "Checks out", "HTTPS"],
      ["Prescription Service", "Health Authority", "Verifies the prescription", "HTTPS"],
      ["Order Service", "Payment Gateway", "Charges the order", "HTTPS"],
      ["Catalogue Service", "Pharmacy Database", "Reads products", "SQL"],
      ["Inventory Service", "Pharmacy Database", "Writes stock movements", "SQL"],
      ["Prescription Gate", "Batch Allocator", "Releases the batches", "Java"],
      ["Dispatch Note", "Batch Allocator", "Reads the allocated batches", "Java"],
      ["Batch Allocator", "Inventory Service", "Reserves batches", "gRPC"],
    ],
  },

  /* MenteSerena · inspirado en Calm — meditación y bienestar.
   * L1: único actor (socio); pago y CDN de contenido externos.
   * L2: app de bienestar (Swift), catálogo de sesiones (Node), reproductor
   *     (Kotlin), suscripciones (Go) y base de socios.
   * L3: el reproductor se abre en reproducción con búfer, seguimiento de
   *     progreso y descarga para uso sin conexión.
   * Flujo clave: el progreso se escribe en la base para retomar la sesión
   *     en otro dispositivo y alimentar las rachas. */
  {
    id: "menteserena",
    name: "MenteSerena",
    category: "health",
    reference: "Calm",
    summary: "Meditation and wellness application.",
    focus: "Media library, routines, profiles and subscriptions.",
    difficulty: "beginner",
    people: [["Member", "Follows guided sessions daily."]],
    externalSystems: [
      ["Payment Provider", "Processes the subscription."],
      ["Content CDN", "Serves audio and video."],
    ],
    containers: [
      ["Wellness App", "container", "Swift", "Library, player and timer."],
      ["Content Service", "container", "Node.js", "Sessions, categories and metadata."],
      ["Player Service", "container", "Kotlin", "Streams media and tracks progress."],
      ["Subscription Service", "container", "Go", "Plans and trials."],
      ["Wellness Database", "database", "PostgreSQL", "Members, progress and plans."],
    ],
    componentSets: [
      {
        container: "Player Service",
        components: [
          ["Stream Player", "Kotlin", "Buffers and plays session media."],
          ["Progress Tracker", "Kotlin", "Records the listening position."],
          ["Download Manager", "Kotlin", "Caches sessions for offline use."],
        ],
      },
    ],
    relations: [
      ["Member", "Wellness App", "Practises", "HTTPS"],
      ["Wellness App", "Content Service", "Lists sessions", "HTTPS/JSON"],
      ["Wellness App", "Player Service", "Plays a session", "HTTPS"],
      ["Wellness App", "Subscription Service", "Manages the plan", "HTTPS"],
      ["Subscription Service", "Payment Provider", "Charges the plan", "HTTPS"],
      ["Player Service", "Wellness Database", "Records progress", "SQL"],
      ["Stream Player", "Progress Tracker", "Reports playback progress", "Kotlin"],
      ["Download Manager", "Progress Tracker", "Syncs offline progress", "Kotlin"],
      ["Stream Player", "Content CDN", "Streams media", "HTTPS"],
    ],
  },

  /* ================================================================= */
  /* 7. Transporte, viajes y movilidad                                 */
  /* ================================================================= */

  /* RutaYa · inspirado en Uber — viajes bajo demanda.
   * L1: pasajero y conductor; mapas y pasarela de pago externos.
   * L2: app de pasajero (Swift), app de conductor (Kotlin), emparejamiento
   *     (Go), viajes (Java), localización (Rust), stream Redis de posiciones
   *     y base de viajes.
   * L3: el emparejamiento se abre en broker de solicitudes, monitor de
   *     oferta por zona y cálculo de tarifa dinámica.
   * Flujo clave: el conductor publica posiciones por WebSocket y el
   *     emparejamiento decide quién recoge; la tarifa se calcula al cerrar. */
  {
    id: "rutaya",
    name: "RutaYa",
    category: "transport",
    reference: "Uber",
    summary: "On-demand ride hailing application.",
    focus: "Passengers, drivers, geolocation, fares and trips.",
    difficulty: "advanced",
    people: [
      ["Passenger", "Requests a ride and pays."],
      ["Driver", "Accepts trips and drives."],
    ],
    externalSystems: [
      ["Maps Provider", "Matching, routing and ETA."],
      ["Payment Gateway", "Charges the fare."],
    ],
    containers: [
      ["Passenger App", "container", "Swift", "Request, tracking and payment."],
      ["Driver App", "container", "Kotlin", "Trip offers and navigation."],
      ["Matching Service", "container", "Go", "Matches drivers with requests."],
      ["Trip Service", "container", "Java", "Trip lifecycle and fare computation."],
      ["Location Service", "container", "Rust", "ETA and route estimation."],
      ["Matching Stream", "queue", "Redis Streams", "Driver positions and trip offers."],
      ["Trips Database", "database", "PostgreSQL", "Trips, drivers and fares."],
    ],
    componentSets: [
      {
        container: "Matching Service",
        components: [
          ["Request Broker", "Go", "Pairs ride requests with nearby drivers."],
          ["Supply Monitor", "Go", "Balances driver density by zone."],
          ["Surge Calculator", "Go", "Applies multipliers when demand peaks."],
        ],
      },
    ],
    relations: [
      ["Passenger", "Passenger App", "Requests a ride", "HTTPS"],
      ["Driver", "Driver App", "Accepts trips", "HTTPS"],
      ["Passenger App", "Matching Service", "Sends the request", "gRPC"],
      ["Driver App", "Matching Service", "Streams positions", "WebSocket"],
      ["Matching Service", "Location Service", "Calculates the ETA", "gRPC"],
      ["Location Service", "Maps Provider", "Routes and geocodes", "HTTPS"],
      ["Matching Service", "Trip Service", "Creates the trip", "gRPC"],
      ["Trip Service", "Payment Gateway", "Charges the fare", "HTTPS"],
      ["Trip Service", "Trips Database", "Writes the trip", "SQL"],
      ["Request Broker", "Supply Monitor", "Feeds the live supply", "Go"],
      ["Request Broker", "Surge Calculator", "Asks for the surge", "Go"],
      ["Request Broker", "Matching Stream", "Publishes trip offers", "Redis", "async"],
    ],
  },

  /* Hospeda · inspirado en Airbnb — alojamiento turístico.
   * L1: huésped y anfitrión; pago y mensajería SMS externos.
   * L2: web del huésped (Next), panel del anfitrión (React), búsqueda (Go),
   *     reservas (Kotlin), pagos (Java), reseñas (Node), stream Kafka de
   *     reservas y base de estancias.
   * L3: las reservas se abren en verificador de disponibilidad, retención
   *     de la estancia durante el pago y motor de reglas de la casa.
   * Flujo clave: la reserva se confirma sólo si el pago se autoriza; los
   *     eventos de reserva/cancelación se publican en Kafka. */
  {
    id: "hospeda",
    name: "Hospeda",
    category: "transport",
    reference: "Airbnb",
    summary: "Tourist accommodation booking platform.",
    focus: "Hosts, availability, bookings, payments and reviews.",
    difficulty: "intermediate",
    people: [
      ["Guest", "Searches and books a place."],
      ["Host", "Publishes listings and accepts bookings."],
    ],
    externalSystems: [
      ["Payment Provider", "Collects the payment and pays hosts."],
      ["Messaging Provider", "Delivers transactional SMS."],
    ],
    containers: [
      ["Guest Web App", "container", "Next.js", "Search, listing and checkout."],
      ["Host Dashboard", "container", "React", "Listings, calendar and earnings."],
      ["Search Service", "container", "Go", "Geo search, filters and ranking."],
      ["Booking Service", "container", "Kotlin", "Availability and reservations."],
      ["Payment Service", "container", "Java", "Guest charge and host payout."],
      ["Review Service", "container", "Node.js", "Ratings and moderation."],
      ["Booking Stream", "queue", "Kafka", "Booking and cancellation events."],
      ["Stay Database", "database", "PostgreSQL", "Listings, bookings and reviews."],
    ],
    componentSets: [
      {
        container: "Booking Service",
        components: [
          ["Availability Checker", "Kotlin", "Validates dates against the calendar."],
          ["Reservation Holder", "Kotlin", "Holds the stay while payment completes."],
          ["House Rules Engine", "Kotlin", "Applies host rules and quiet hours."],
        ],
      },
    ],
    relations: [
      ["Guest", "Guest Web App", "Books a stay", "HTTPS"],
      ["Host", "Host Dashboard", "Manages listings", "HTTPS"],
      ["Guest Web App", "Search Service", "Searches stays", "HTTPS"],
      ["Search Service", "Stay Database", "Reads listings", "SQL"],
      ["Guest Web App", "Booking Service", "Creates the reservation", "HTTPS"],
      ["Host Dashboard", "Booking Service", "Accepts the request", "HTTPS"],
      ["Booking Service", "Booking Stream", "Publishes booking events", "Kafka", "async"],
      ["Payment Service", "Payment Provider", "Collects and pays", "HTTPS"],
      ["Booking Service", "Messaging Provider", "Sends confirmations", "HTTPS"],
      ["Guest Web App", "Review Service", "Publishes a review", "HTTPS"],
      ["Reservation Holder", "Availability Checker", "Verifies the dates", "Kotlin"],
      ["House Rules Engine", "Reservation Holder", "Validates the house rules", "Kotlin"],
      ["Reservation Holder", "Payment Service", "Authorises the charge", "gRPC"],
    ],
  },

  /* VueloDirecto · inspirado en Skyscanner — buscador de vuelos.
   * L1: viajero; GDS de aerolíneas y proveedor de pago externos.
   * L2: app de búsqueda (React), servicio de búsqueda (Go), tarifas
   *     (Kotlin), reservas (Java), caché Redis de tarifas y base de
   *     reservas.
   * L3: el servicio de tarifas se abre en reglas de precios, conversor de
   *     divisa por mercado y cálculo de impuestos y tasas.
   * Flujo clave: la búsqueda es cacheada con TTL porque el GDS es lento y
   *     las tarifas caducan; la emisión del PNR va directa al GDS. */
  {
    id: "vuelodirecto",
    name: "VueloDirecto",
    category: "transport",
    reference: "Skyscanner",
    summary: "Flight search and booking engine.",
    focus: "Search, fares, airlines and reservations.",
    difficulty: "advanced",
    people: [["Traveller", "Searches flights and books a seat."]],
    externalSystems: [
      ["Airline GDS", "Global Distribution System for availability."],
      ["Payment Provider", "Processes the payment."],
    ],
    containers: [
      ["Travel Search App", "container", "React", "Search, filters and checkout."],
      ["Search Service", "container", "Go", "Aggregates and caches results."],
      ["Fare Service", "container", "Kotlin", "Pricing rules and currency."],
      ["Booking Service", "container", "Java", "PNR creation and ticketing."],
      ["Search Cache", "database", "Redis", "Cached fares with TTL."],
      ["Booking Database", "database", "PostgreSQL", "Bookings and passengers."],
    ],
    componentSets: [
      {
        container: "Fare Service",
        components: [
          ["Pricing Rules", "Kotlin", "Applies fare families and discounts."],
          ["Currency Converter", "Kotlin", "Normalises prices per market."],
          ["Tax Calculator", "Kotlin", "Adds taxes and carrier fees."],
        ],
      },
    ],
    relations: [
      ["Traveller", "Travel Search App", "Searches and books", "HTTPS"],
      ["Travel Search App", "Search Service", "Queries flights", "HTTPS/JSON"],
      ["Travel Search App", "Booking Service", "Confirms the booking", "HTTPS"],
      ["Search Service", "Airline GDS", "Queries availability", "HTTPS"],
      ["Search Service", "Search Cache", "Caches fares", "RESP"],
      ["Search Service", "Fare Service", "Applies pricing rules", "gRPC"],
      ["Booking Service", "Airline GDS", "Issues the PNR", "HTTPS"],
      ["Booking Service", "Payment Provider", "Charges the ticket", "HTTPS"],
      ["Booking Service", "Booking Database", "Writes the reservation", "SQL"],
      ["Pricing Rules", "Currency Converter", "Converts the fare", "Kotlin"],
      ["Pricing Rules", "Tax Calculator", "Adds taxes to the fare", "Kotlin"],
      ["Currency Converter", "Search Cache", "Caches the quoted fare", "RESP"],
    ],
  },

  /* CiudadEnRuta · inspirado en Google Maps Transit — planificador multimodal.
   * L1: viajero urbano; feeds GTFS de las agencias y proveedor de mapas.
   * L2: app planificadora (Flutter), rutas (Go), horarios (Kotlin),
   *     geocodificación (Rust), caché espacial Redis y base de tránsito.
   * L3: el servicio de rutas se abre en constructor del grafo multimodal,
   *     búsqueda de viajes con transbordos y estimación de precio.
   * Flujo clave: el planificador resuelve el viaje sobre el grafo y usa la
   *     caché espacial para las paradas próximas; los mapas se piden aparte. */
  {
    id: "ciudadenruta",
    name: "CiudadEnRuta",
    category: "transport",
    reference: "Google Maps Transit",
    summary: "Public transport journey planner.",
    focus: "Maps, routes, stops, timetables and geospatial data.",
    difficulty: "intermediate",
    people: [["Commuter", "Plans routes and checks arrivals."]],
    externalSystems: [
      ["Transit Agency Feeds", "GTFS timetables."],
      ["Maps Provider", "Base map tiles and geocoding."],
    ],
    containers: [
      ["Planner App", "container", "Flutter", "Route planning and live arrivals."],
      ["Routing Service", "container", "Go", "Multimodal graph search."],
      ["Timetable Service", "container", "Kotlin", "GTFS ingestion and departures."],
      ["Geocoding Service", "container", "Rust", "Addresses to coordinates."],
      ["Spatial Cache", "database", "Redis", "Nearby stops."],
      ["Transit Database", "database", "PostgreSQL", "Stops, routes and timetables."],
    ],
    componentSets: [
      {
        container: "Routing Service",
        components: [
          ["Graph Builder", "Go", "Maintains the multimodal transit graph."],
          ["Journey Search", "Go", "Finds routes with transfers and constraints."],
          ["Fare Estimator", "Go", "Prices each journey from the agency fares."],
        ],
      },
    ],
    relations: [
      ["Commuter", "Planner App", "Plans a journey", "HTTPS"],
      ["Planner App", "Routing Service", "Requests routes", "HTTPS/JSON"],
      ["Planner App", "Timetable Service", "Shows departures", "HTTPS"],
      ["Planner App", "Geocoding Service", "Resolves the journey endpoints", "gRPC"],
      ["Routing Service", "Spatial Cache", "Reads nearby stops", "RESP"],
      ["Timetable Service", "Transit Agency Feeds", "Ingests GTFS", "HTTPS"],
      ["Geocoding Service", "Maps Provider", "Geocodes addresses", "HTTPS"],
      ["Planner App", "Maps Provider", "Shows the base map", "HTTPS"],
      ["Graph Builder", "Journey Search", "Serves the transit graph", "Go"],
      ["Journey Search", "Fare Estimator", "Adds fares to the trip", "Go"],
      ["Graph Builder", "Transit Database", "Reads the network", "SQL"],
    ],
  },

  /* ElectroRuta · inspirado en PlugShare — puntos de recarga de coches.
   * L1: conductor de VE y operador de estación; mapas y red de recarga.
   * L2: app del conductor (React Native), estaciones (Go), disponibilidad
   *     (Kotlin), reportes (Node), índice espacial PostGIS y base de
   *     estaciones.
   * L3: la disponibilidad se abre en sondeo de estado por conector,
   *     espejo de sesiones en curso y predicción del tiempo de espera.
   * Flujo clave: el estado en vivo viene por OCPP de la red operadora y se
   *     separa del directorio fijo de estaciones. */
  {
    id: "electroruta",
    name: "ElectroRuta",
    category: "transport",
    reference: "PlugShare",
    summary: "Locator of charging stations for electric vehicles.",
    focus: "Stations, availability, maps and user reports.",
    difficulty: "beginner",
    people: [
      ["EV Driver", "Finds a charger on the route."],
      ["Station Operator", "Publishes charger availability."],
    ],
    externalSystems: [
      ["Maps Provider", "Map tiles and routing."],
      ["Charging Network Operator", "OCPP session data."],
    ],
    containers: [
      ["Driver App", "container", "React Native", "Nearby stations and plug types."],
      ["Station Service", "container", "Go", "Stations, connectors and pricing."],
      ["Availability Service", "container", "Kotlin", "Real-time status per connector."],
      ["Reporting Service", "container", "Node.js", "User photos and broken chargers."],
      ["Geo Index", "database", "PostGIS", "Spatial queries on chargers."],
      ["Station Database", "database", "PostgreSQL", "Stations, reports and pricing."],
    ],
    componentSets: [
      {
        container: "Availability Service",
        components: [
          ["Status Poller", "Kotlin", "Polls connectors for live status."],
          ["Session Mirror", "Kotlin", "Mirrors ongoing charging sessions."],
          ["Prediction Model", "Kotlin", "Estimates waiting time per station."],
        ],
      },
    ],
    relations: [
      ["EV Driver", "Driver App", "Finds a charger", "HTTPS"],
      ["Station Operator", "Station Service", "Updates the station", "HTTPS"],
      ["Driver App", "Station Service", "Searches stations", "HTTPS/JSON"],
      ["Station Service", "Geo Index", "Spatial query", "SQL"],
      ["Station Service", "Availability Service", "Reads live status", "gRPC"],
      ["Driver App", "Reporting Service", "Reports a charger", "HTTPS"],
      ["Reporting Service", "Station Database", "Writes the report", "SQL"],
      ["Driver App", "Maps Provider", "Shows the map", "HTTPS"],
      ["Status Poller", "Session Mirror", "Mirrors the live status", "Kotlin"],
      ["Prediction Model", "Session Mirror", "Learns from the sessions", "Kotlin"],
      ["Status Poller", "Charging Network Operator", "Reads sessions", "OCPP"],
    ],
  },

  /* ================================================================= */
  /* 8. Productividad y gestión empresarial                             */
  /* ================================================================= */

  /* ProyectoZen · inspirado en Trello — gestión con tableros Kanban.
   * L1: miembro del proyecto y propietario; correo (SMTP) e IdP (OIDC).
   * L2: app web (React), tableros (Node), tareas (Kotlin), notificaciones
   *     (Go), búsqueda (Rust), stream Kafka de actividad y base de tableros.
   * L3: el servicio de tareas se abre en gestor de tarjetas, rastreador de
   *     dependencias y motor de asignación equilibrada.
   * Flujo clave: cada cambio de tarjeta publica en Kafka; las menciones
   *     se resuelven en el servicio de tareas y salen por correo. */
  {
    id: "proyectozen",
    name: "ProyectoZen",
    category: "productivity",
    reference: "Trello",
    summary: "Project management with Kanban boards.",
    focus: "Boards, tasks, users, comments and notifications.",
    difficulty: "intermediate",
    people: [
      ["Project Member", "Organises and updates tasks."],
      ["Project Owner", "Configures boards and members."],
    ],
    externalSystems: [
      ["Email Provider", "Sends digests and mentions.", "SMTP"],
      ["Identity Provider", "Single sign-on.", "OIDC"],
    ],
    containers: [
      ["Web App", "container", "React", "Boards, lists and cards."],
      ["Board Service", "container", "Node.js", "Boards, lists and permissions."],
      ["Task Service", "container", "Kotlin", "Cards, checklists and due dates."],
      ["Notification Service", "container", "Go", "Mentions and reminders."],
      ["Search Service", "container", "Rust", "Cross-board search."],
      ["Activity Stream", "queue", "Kafka", "Card change events."],
      ["Board Database", "database", "PostgreSQL", "Boards, cards and comments."],
    ],
    componentSets: [
      {
        container: "Task Service",
        components: [
          ["Card Manager", "Kotlin", "Creates cards, checklists and due dates."],
          ["Dependency Tracker", "Kotlin", "Links cards and blocks progress."],
          ["Assignment Engine", "Kotlin", "Balances work across members."],
        ],
      },
    ],
    relations: [
      ["Project Member", "Web App", "Updates tasks", "HTTPS"],
      ["Project Owner", "Board Service", "Configures the board", "HTTPS"],
      ["Web App", "Board Service", "Reads boards", "HTTPS/JSON"],
      ["Web App", "Task Service", "Moves cards", "HTTPS"],
      ["Board Service", "Activity Stream", "Publishes changes", "Kafka", "async"],
      ["Task Service", "Notification Service", "Sends mentions", "gRPC"],
      ["Notification Service", "Email Provider", "Sends digests", "SMTP", "async"],
      ["Web App", "Search Service", "Searches across boards", "HTTPS"],
      ["Board Service", "Identity Provider", "Verifies users", "OIDC"],
      ["Dependency Tracker", "Card Manager", "Validates the dependencies", "Kotlin"],
      ["Assignment Engine", "Card Manager", "Assigns the cards", "Kotlin"],
      ["Card Manager", "Board Database", "Writes cards", "SQL"],
    ],
  },

  /* Cliente360 · inspirado en Salesforce — CRM de oportunidades.
   * L1: comercial y cliente final; correo y ERP externos.
   * L2: app comercial (React), API CRM (Spring), oportunidades (Kotlin),
   *     automatización (Node), informes (Python), hub de integración (Go),
   *     cola RabbitMQ y base del CRM.
   * L3: las oportunidades se abren en etapas del pipeline con criterios de
   *     salida, motor de previsión ponderada y cálculo de oferta.
   * Flujo clave: la automatización encola reglas que el ERP y el correo
   *     consumen vía el hub de integración. */
  {
    id: "cliente360",
    name: "Cliente360",
    category: "productivity",
    reference: "Salesforce",
    summary: "CRM for opportunities and customers.",
    focus: "Contacts, sales pipeline, automation, reports and integrations.",
    difficulty: "advanced",
    people: [
      ["Sales Rep", "Manages opportunities and forecasts."],
      ["Customer", "Reviews their account and cases."],
    ],
    externalSystems: [
      ["Email Provider", "Sends sequences and alerts.", "SMTP"],
      ["ERP", "Syncs orders and billing data."],
    ],
    containers: [
      ["Sales Web App", "container", "React", "Pipeline, accounts and cases."],
      ["CRM API", "container", "Java / Spring Boot", "Accounts, contacts and activities."],
      ["Opportunity Service", "container", "Kotlin", "Pipeline stages and forecasting."],
      ["Automation Service", "container", "Node.js", "Rules, triggers and actions."],
      ["Reporting Service", "container", "Python", "Dashboards and exports."],
      ["Integration Hub", "container", "Go", "Sync with ERP and email."],
      ["Automation Queue", "queue", "RabbitMQ", "Rule execution jobs."],
      ["CRM Database", "database", "PostgreSQL", "Accounts, contacts and activities."],
    ],
    componentSets: [
      {
        container: "Opportunity Service",
        components: [
          ["Pipeline Stage", "Kotlin", "Validates stage transitions and exit criteria."],
          ["Forecast Engine", "Kotlin", "Aggregates weighted pipeline by period."],
          ["Quote Calculator", "Kotlin", "Builds quotes from the price book."],
        ],
      },
    ],
    relations: [
      ["Sales Rep", "Sales Web App", "Manages the pipeline", "HTTPS"],
      ["Customer", "Sales Web App", "Opens a case", "HTTPS"],
      ["Sales Web App", "Reporting Service", "Views dashboards", "HTTPS"],
      ["Sales Web App", "CRM API", "Reads and writes records", "HTTPS/JSON"],
      ["CRM API", "Opportunity Service", "Advances the deal", "gRPC"],
      ["Opportunity Service", "Automation Service", "Triggers the automation", "gRPC"],
      ["Automation Service", "Automation Queue", "Enqueues the job", "AMQP", "async"],
      ["Automation Service", "Integration Hub", "Calls the ERP", "gRPC"],
      ["Integration Hub", "ERP", "Syncs orders", "HTTPS"],
      ["Integration Hub", "Email Provider", "Sends sequences", "SMTP", "async"],
      ["Reporting Service", "CRM Database", "Aggregates metrics", "SQL"],
      ["Forecast Engine", "Pipeline Stage", "Reads the pipeline", "Kotlin"],
      ["Pipeline Stage", "Quote Calculator", "Requests the quote", "Kotlin"],
      ["Pipeline Stage", "CRM Database", "Reads and writes deals", "SQL"],
    ],
  },

  /* EmpresaNexo · inspirado en Odoo — ERP integrado.
   * L1: contable, responsable de compras y operario de almacén; autoridad
   *     fiscal y banca electrónica.
   * L2: cliente web del ERP (React), facturación (Java), compras (Kotlin),
   *     inventario (Java), contabilidad (Python), base de negocio y cola
   *     Kafka de flujos documentales.
   * L3: la facturación se abre en constructor de facturas, resolutor de
   *     régimen fiscal y adaptador de facturación electrónica.
   * Flujo clave: un movimiento de inventario publica en Kafka; la
   *     contabilidad recibe los asientos desde facturación por gRPC. */
  {
    id: "empresanexo",
    name: "EmpresaNexo",
    category: "productivity",
    reference: "Odoo",
    summary: "ERP for inventory, purchasing and accounting.",
    focus: "Business modules, workflows, permissions and a central database.",
    difficulty: "advanced",
    people: [
      ["Accountant", "Records invoices and closes the period."],
      ["Purchasing Manager", "Orders from suppliers."],
      ["Warehouse Clerk", "Receives and counts stock."],
    ],
    externalSystems: [
      ["Tax Authority", "Electronic invoicing."],
      ["Bank Gateway", "Payment files and reconciliation."],
    ],
    containers: [
      ["ERP Web Client", "container", "React", "Invoices, stock and purchasing."],
      ["Invoicing Service", "container", "Java", "Invoices, credit notes and taxes."],
      ["Purchasing Service", "container", "Kotlin", "Suppliers, orders and receipts."],
      ["Inventory Service", "container", "Java", "Warehouses, moves and valuation."],
      ["Accounting Service", "container", "Python", "Ledger, periods and reports."],
      ["Business Database", "database", "PostgreSQL", "All business documents."],
      ["Document Queue", "queue", "Kafka", "Document workflows and approvals."],
    ],
    componentSets: [
      {
        container: "Invoicing Service",
        components: [
          ["Invoice Builder", "Java", "Totals, taxes and credit notes."],
          ["Tax Resolver", "Java", "Applies the regime per jurisdiction."],
          ["E-invoice Adapter", "Java", "Serialises to the authority format."],
        ],
      },
    ],
    relations: [
      ["Accountant", "ERP Web Client", "Records invoices", "HTTPS"],
      ["Purchasing Manager", "ERP Web Client", "Creates purchase orders", "HTTPS"],
      ["Warehouse Clerk", "ERP Web Client", "Receives stock", "HTTPS"],
      ["ERP Web Client", "Invoicing Service", "Issues invoices", "HTTPS"],
      ["ERP Web Client", "Purchasing Service", "Manages orders", "HTTPS"],
      ["Invoicing Service", "Accounting Service", "Posts entries", "gRPC"],
      ["Purchasing Service", "Inventory Service", "Receives goods", "gRPC"],
      ["Inventory Service", "Document Queue", "Publishes stock moves", "Kafka", "async"],
      ["Accounting Service", "Bank Gateway", "Reconciles payments", "HTTPS"],
      ["Accounting Service", "Business Database", "Writes the ledger", "SQL"],
      ["Invoice Builder", "Tax Resolver", "Applies the tax rules", "Java"],
      ["E-invoice Adapter", "Invoice Builder", "Serialises the invoice", "Java"],
      ["E-invoice Adapter", "Tax Authority", "Sends the invoice", "HTTPS"],
    ],
  },

  /* ArchivoNube · inspirado en Dropbox — documentos en la nube.
   * L1: miembro y admin de workspace; objeto de almacenamiento y correo.
   * L2: cliente escritorio/móvil (C#/Kotlin), API de ficheros (Go),
   *     sincronización (Rust), compartir (Node), cola Kafka de análisis de
   *     virus y base de metadatos.
   * L3: la sincronización se abre en motor de deltas, resolutor de
   *     conflictos y sincronización selectiva por carpeta.
   * Flujo clave: el cliente intercambia deltas con el servicio, que escribe
   *     metadatos y encola el análisis antivirus de cada subida. */
  {
    id: "archivonube",
    name: "ArchivoNube",
    category: "productivity",
    reference: "Dropbox",
    summary: "Cloud document storage and collaboration.",
    focus: "Files, sync, permissions, versions and shared links.",
    difficulty: "intermediate",
    people: [
      ["Member", "Uploads, syncs and shares documents."],
      ["Workspace Admin", "Sets retention and external sharing policies."],
    ],
    externalSystems: [
      ["Object Storage", "Durable file storage."],
      ["Email Provider", "Share notifications.", "SMTP"],
    ],
    containers: [
      ["Desktop and Mobile Client", "container", "C# + Kotlin", "Sync engine and file browser."],
      ["File API", "container", "Go", "Metadata, versions and links."],
      ["Sync Service", "container", "Rust", "Delta sync and conflict resolution."],
      ["Sharing Service", "container", "Node.js", "Shared links and permissions."],
      ["Virus Scan Pipeline", "queue", "Kafka", "Scan every uploaded file."],
      ["Metadata Database", "database", "PostgreSQL", "Files, versions and ACLs."],
    ],
    componentSets: [
      {
        container: "Sync Service",
        components: [
          ["Delta Engine", "Rust", "Computes and applies file deltas."],
          ["Conflict Resolver", "Rust", "Merges concurrent edits or keeps both."],
          ["Selective Sync", "Rust", "Syncs only the folders the member chose."],
        ],
      },
    ],
    relations: [
      ["Member", "Desktop and Mobile Client", "Syncs files", "HTTPS"],
      ["Workspace Admin", "File API", "Sets policies", "HTTPS"],
      ["Desktop and Mobile Client", "Sync Service", "Exchanges deltas", "HTTPS"],
      ["Sync Service", "File API", "Reads metadata", "gRPC"],
      ["File API", "Object Storage", "Stores bytes", "HTTPS"],
      ["File API", "Virus Scan Pipeline", "Enqueues the scan", "Kafka", "async"],
      ["File API", "Sharing Service", "Creates shared links", "gRPC"],
      ["Sharing Service", "Email Provider", "Sends share emails", "SMTP", "async"],
      ["File API", "Metadata Database", "Reads and writes metadata", "SQL"],
      ["Selective Sync", "Delta Engine", "Filters the deltas", "Rust"],
      ["Delta Engine", "Conflict Resolver", "Resolves the conflicting deltas", "Rust"],
      ["Delta Engine", "Metadata Database", "Reads file metadata", "SQL"],
    ],
  },

  /* FlujoBot · inspirado en Zapier — automatización visual de procesos.
   * L1: constructor de automatizaciones y responsable de operaciones;
   *     APIs de terceros como único externo.
   * L2: constructor de flujos (React), API de flujos (Node), motor de
   *     ejecución (Rust), conectores (Java), planificador (Go), cola Kafka
   *     de ejecuciones y base de flujos.
   * L3: el motor de ejecución se abre en runner de pasos con timeout,
   *     supervisor de reintentos con backoff y bóveda de credenciales.
   * Flujo clave: el planificador encola ejecuciones que el motor consume;
   *     los conectores son los únicos que tocan credenciales externas. */
  {
    id: "flujobot",
    name: "FlujoBot",
    category: "productivity",
    reference: "Zapier",
    summary: "Visual automation of processes and integrations.",
    focus: "Triggers, tasks, connectors, queues and flow execution.",
    difficulty: "advanced",
    people: [
      ["Automation Builder", "Designs flows and connects apps."],
      ["Ops Manager", "Monitors runs and failures."],
    ],
    externalSystems: [["Third-party APIs", "CRM, email, accounting services."]],
    containers: [
      ["Flow Builder", "container", "React", "Canvas of triggers and actions."],
      ["Flow API", "container", "Node.js", "Flow definitions and versions."],
      ["Execution Engine", "container", "Rust", "Runs steps and retries."],
      ["Connector Service", "container", "Java", "OAuth and API calls to external apps."],
      ["Scheduler Service", "container", "Go", "Cron triggers and schedules."],
      ["Execution Queue", "queue", "Kafka", "Run jobs and step retries."],
      ["Flow Database", "database", "PostgreSQL", "Flows, runs and credentials."],
    ],
    componentSets: [
      {
        container: "Execution Engine",
        components: [
          ["Step Runner", "Rust", "Executes each step with its own timeout."],
          ["Retry Supervisor", "Rust", "Replays failed steps with backoff."],
          ["Credential Vault", "Rust", "Injects secrets into connector calls."],
        ],
      },
    ],
    relations: [
      ["Automation Builder", "Flow Builder", "Designs flows", "HTTPS"],
      ["Ops Manager", "Flow Builder", "Monitors runs", "HTTPS"],
      ["Flow Builder", "Flow API", "Saves the flow", "HTTPS/JSON"],
      ["Flow API", "Scheduler Service", "Registers triggers", "gRPC"],
      ["Scheduler Service", "Execution Queue", "Enqueues runs", "Kafka", "async"],
      ["Execution Queue", "Execution Engine", "Delivers run jobs", "Kafka", "async"],
      ["Execution Engine", "Connector Service", "Calls external APIs", "gRPC"],
      ["Connector Service", "Third-party APIs", "Performs the action", "HTTPS"],
      ["Step Runner", "Retry Supervisor", "Reports the failed step", "Rust"],
      ["Step Runner", "Credential Vault", "Reads the step credentials", "Rust"],
      ["Step Runner", "Flow Database", "Writes run logs", "SQL"],
    ],
  },

  /* ================================================================= */
  /* 9. Inteligencia artificial y datos                               */
  /* ================================================================= */

  /* AsistenteNova · inspirado en ChatGPT — asistente conversacional.
   * L1: usuario y revisor de seguridad; proveedor de modelo y proveedor
   *     de seguridad de contenido externos.
   * L2: app de chat (React), API de conversación (Go), orquestador (Python),
   *     registro de herramientas (Node), moderación (Python), libro de
   *     tokens y base de conversaciones (ambas PostgreSQL).
   * L3: el orquestador se abre en constructor de prompts, router de
   *     herramientas y adaptador de streams del modelo.
   * Flujo clave: la respuesta vuelve por SSE mientras el orquestador aplica
   *     el filtro de salida antes de entregarse al cliente. */
  {
    id: "asistentenova",
    name: "AsistenteNova",
    category: "ai",
    reference: "ChatGPT",
    summary: "Conversational assistant backed by language models.",
    focus: "Interface, AI API, sessions, tools and moderation.",
    difficulty: "advanced",
    people: [
      ["User", "Chats with the assistant."],
      ["Safety Reviewer", "Audits flagged conversations."],
    ],
    externalSystems: [
      ["Language Model Provider", "Generates completions."],
      ["Content Safety Provider", "Classifies harmful output."],
    ],
    containers: [
      ["Chat App", "container", "React", "Conversation UI and streaming."],
      ["Conversation API", "container", "Go", "Sessions, history and quotas."],
      ["Orchestrator", "container", "Python", "Prompts, routing and tool calls."],
      ["Tool Registry", "container", "Node.js", "Function calling and tools."],
      ["Moderation Service", "container", "Python", "Input and output filters."],
      ["Token Ledger", "database", "PostgreSQL", "Usage and billing units."],
      ["Conversation Database", "database", "PostgreSQL", "Messages and sessions."],
    ],
    componentSets: [
      {
        container: "Orchestrator",
        components: [
          ["Prompt Builder", "Python", "Assembles system, history and tool results."],
          ["Tool Router", "Python", "Selects and invokes the right tool."],
          ["Stream Adapter", "Python", "Normalises model streams for the client."],
        ],
      },
    ],
    relations: [
      ["User", "Chat App", "Sends a message", "HTTPS"],
      ["Safety Reviewer", "Moderation Service", "Reviews conversations", "HTTPS"],
      ["Chat App", "Conversation API", "Streams the answer", "SSE"],
      ["Conversation API", "Orchestrator", "Builds the prompt", "gRPC"],
      ["Orchestrator", "Tool Registry", "Invokes a tool", "gRPC"],
      ["Orchestrator", "Moderation Service", "Checks the output", "gRPC"],
      ["Conversation API", "Conversation Database", "Stores messages", "SQL"],
      ["Conversation API", "Token Ledger", "Records usage", "SQL"],
      ["Prompt Builder", "Tool Router", "Adds the tool context", "Python"],
      ["Tool Router", "Stream Adapter", "Streams the tool output", "Python"],
      ["Stream Adapter", "Language Model Provider", "Generates tokens", "HTTPS"],
      ["Moderation Service", "Content Safety Provider", "Classifies the output", "HTTPS"],
    ],
  },

  /* DocuMente · inspirado en NotebookLM — QA sobre documentos internos.
   * L1: trabajador del conocimiento y administrador de contenidos;
   *     proveedor de embeddings y de modelo de lenguaje.
   * L2: app de investigación (Next), ingesta (Go), embeddings (Python),
   *     recuperación (Python), respuesta (Kotlin), almacén vectorial
   *     pgvector, almacenamiento de documentos S3 y cola Kafka de índice.
   * L3: la recuperación se abre en búsqueda híbrida, reranking y mapeo de
   *     citas hacia la fuente original.
   * Flujo clave: la ingesta encola trabajos de indexación; en consulta, la
   *     recuperación filtra y el modelo responde con citas trazables. */
  {
    id: "documente",
    name: "DocuMente",
    category: "ai",
    reference: "NotebookLM",
    summary: "Question answering over corporate documents.",
    focus: "Document upload, extraction, embeddings, vector search and RAG.",
    difficulty: "advanced",
    people: [
      ["Knowledge Worker", "Uploads documents and asks questions."],
      ["Content Administrator", "Curates the shared corpus."],
    ],
    externalSystems: [
      ["Embedding Provider", "Generates vector embeddings."],
      ["Language Model Provider", "Answers grounded in the corpus."],
    ],
    containers: [
      ["Research App", "container", "Next.js", "Upload, chat and citations."],
      ["Ingestion Service", "container", "Go", "Parses, chunks and normalises."],
      ["Embedding Service", "container", "Python", "Vectors and re-indexing."],
      ["Retrieval Service", "container", "Python", "Hybrid search and reranking."],
      ["Answer Service", "container", "Kotlin", "Prompting, citations and streaming."],
      ["Vector Store", "database", "pgvector", "Embeddings per tenant."],
      ["Document Storage", "database", "S3", "Original files and extracted text."],
      ["Index Queue", "queue", "Kafka", "Ingestion and re-index jobs."],
    ],
    componentSets: [
      {
        container: "Retrieval Service",
        components: [
          ["Hybrid Searcher", "Python", "Combines vector and keyword retrieval."],
          ["Reranker", "Python", "Orders candidates for the question."],
          ["Citation Mapper", "Python", "Links answer spans back to sources."],
        ],
      },
    ],
    relations: [
      ["Knowledge Worker", "Research App", "Asks a question", "HTTPS"],
      ["Content Administrator", "Ingestion Service", "Curates the corpus", "HTTPS"],
      ["Research App", "Ingestion Service", "Uploads documents", "HTTPS"],
      ["Ingestion Service", "Index Queue", "Enqueues indexing", "Kafka", "async"],
      ["Index Queue", "Embedding Service", "Delivers indexing jobs", "Kafka", "async"],
      ["Embedding Service", "Embedding Provider", "Computes embeddings", "HTTPS"],
      ["Embedding Service", "Vector Store", "Writes vectors", "SQL"],
      ["Research App", "Retrieval Service", "Searches the corpus", "gRPC"],
      ["Retrieval Service", "Answer Service", "Sends candidates", "gRPC"],
      ["Answer Service", "Language Model Provider", "Generates the answer", "HTTPS"],
      ["Ingestion Service", "Document Storage", "Reads originals", "HTTPS"],
      ["Hybrid Searcher", "Reranker", "Sends the candidates", "Python"],
      ["Reranker", "Citation Mapper", "Adds the citations", "Python"],
      ["Hybrid Searcher", "Vector Store", "Searches the vector index", "SQL"],
    ],
  },

  /* DataVision · inspirado en Power BI — analítica de negocio.
   * L1: analista y ejecutivo; sistemas de origen e IdP de seguridad por
   *     fila (row-level security).
   * L2: espacio de trabajo (React), consulta (Go), ETL (Python), capa
   *     semántica (Kotlin), jobs programados Airflow, almacén Snowflake y
   *     caché Redis de resultados.
   * L3: la capa semántica se abre en catálogo de métricas, rastreador de
   *     linaje y compilador de métricas a SQL.
   * Flujo clave: las métricas se resuelven en la capa semántica antes de
   *     compilarse a SQL; el ETL carga el almacén con Airflow. */
  {
    id: "datavision",
    name: "DataVision",
    category: "ai",
    reference: "Power BI",
    summary: "Business analytics and KPI dashboards.",
    focus: "Data sources, ETL, analytical models and visualisations.",
    difficulty: "advanced",
    people: [
      ["Analyst", "Builds datasets and dashboards."],
      ["Executive", "Reviews company-wide indicators."],
    ],
    externalSystems: [
      ["Source Systems", "CRM, ERP and event tracking."],
      ["Identity Provider", "Row-level security."],
    ],
    containers: [
      ["Analytics Workspace", "container", "React", "Datasets, measures and dashboards."],
      ["Query Service", "container", "Go", "Translates queries to SQL."],
      ["ETL Pipeline", "container", "Python", "Ingestion and transformations."],
      ["Semantic Layer", "container", "Kotlin", "Metrics definitions and lineage."],
      ["Scheduled Jobs", "queue", "Airflow", "Refresh schedules."],
      ["Warehouse", "database", "Snowflake", "Curated analytical tables."],
      ["Result Cache", "database", "Redis", "Cached query results."],
    ],
    componentSets: [
      {
        container: "Semantic Layer",
        components: [
          ["Metric Catalog", "Kotlin", "Stores the definition of each measure."],
          ["Lineage Tracker", "Kotlin", "Maps columns back to source fields."],
          ["Query Compiler", "Kotlin", "Translates metrics into SQL."],
        ],
      },
    ],
    relations: [
      ["Analyst", "Analytics Workspace", "Builds dashboards", "HTTPS"],
      ["Executive", "Analytics Workspace", "Reviews KPIs", "HTTPS"],
      ["Analytics Workspace", "Semantic Layer", "Resolves metrics", "HTTPS/JSON"],
      ["Query Service", "Warehouse", "Executes SQL", "ODBC"],
      ["Query Service", "Result Cache", "Reads cached results", "RESP"],
      ["Scheduled Jobs", "ETL Pipeline", "Triggers the scheduled runs", "Airflow", "async"],
      ["ETL Pipeline", "Source Systems", "Extracts data", "HTTPS"],
      ["ETL Pipeline", "Warehouse", "Loads tables", "Snowflake"],
      ["Semantic Layer", "Identity Provider", "Applies row-level security", "OIDC"],
      ["Query Compiler", "Metric Catalog", "Resolves the metric definitions", "Kotlin"],
      ["Lineage Tracker", "Metric Catalog", "Reads the metric sources", "Kotlin"],
      ["Query Compiler", "Query Service", "Compiles the query", "gRPC"],
    ],
  },

  /* PixelIA · inspirado en Midjourney — generación de imágenes con IA.
   * L1: artista y revisor de confianza; nube GPU y proveedor de seguridad.
   * L2: estudio (Next), API de generación (Go), prompts (Python), seguridad
   *     (Python), scheduler Celery, clúster de inferencia (Python), tienda
   *     de medios S3 y base de generaciones.
   * L3: el clúster se abre en worker de difusión, empaquetado de lotes para
   *     llenar las GPU y filtro de salida de imágenes.
   * Flujo clave: la generación es asíncrona (Celery) y el cliente consulta
   *     el estado; nada llega al almacenamiento sin pasar por seguridad. */
  {
    id: "pixelia",
    name: "PixelIA",
    category: "ai",
    reference: "Midjourney",
    summary: "AI image generation from prompts.",
    focus: "Prompts, generation API, job queue and media storage.",
    difficulty: "advanced",
    people: [
      ["Artist", "Writes prompts and downloads results."],
      ["Trust Reviewer", "Reviews flagged generations."],
    ],
    externalSystems: [
      ["GPU Cloud", "Runs the diffusion models."],
      ["Content Safety Provider", "Checks the prompts and images."],
    ],
    containers: [
      ["Studio App", "container", "Next.js", "Prompts, gallery and history."],
      ["Generation API", "container", "Go", "Creates jobs and polls status."],
      ["Prompt Service", "container", "Python", "Prompt rewriting and presets."],
      ["Safety Service", "container", "Python", "Prompt and image moderation."],
      ["GPU Scheduler", "queue", "Celery", "GPU job scheduling."],
      ["Inference Cluster", "container", "Python", "Diffusion workers on GPUs."],
      ["Media Store", "database", "S3", "Generated images and metadata."],
      ["Generation Database", "database", "PostgreSQL", "Jobs, credits and history."],
    ],
    componentSets: [
      {
        container: "Inference Cluster",
        components: [
          ["Diffusion Worker", "Python", "Runs the sampling loop on a GPU."],
          ["Batch Scheduler", "Python", "Packs prompts to fill the GPUs."],
          ["Output Filter", "Python", "Applies safety checks to the result."],
        ],
      },
    ],
    relations: [
      ["Artist", "Studio App", "Generates images", "HTTPS"],
      ["Trust Reviewer", "Safety Service", "Reviews content", "HTTPS"],
      ["Studio App", "Generation API", "Creates a job", "HTTPS/JSON"],
      ["Generation API", "Prompt Service", "Enhances the prompt", "gRPC"],
      ["Generation API", "Safety Service", "Checks the prompt", "gRPC"],
      ["Generation API", "GPU Scheduler", "Enqueues the job", "Celery", "async"],
      ["GPU Scheduler", "Inference Cluster", "Schedules GPUs", "Celery", "async"],
      ["Inference Cluster", "Media Store", "Stores the image", "HTTPS"],
      ["Generation API", "Generation Database", "Records credits", "SQL"],
      ["Batch Scheduler", "Diffusion Worker", "Assigns the render job", "Python"],
      ["Diffusion Worker", "Output Filter", "Post-processes the image", "Python"],
      ["Diffusion Worker", "GPU Cloud", "Runs the model", "HTTPS"],
      ["Safety Service", "Content Safety Provider", "Checks prompts and images", "HTTPS"],
    ],
  },

  /* AgenteFlow — plataformas de agentes de IA con herramientas externas.
   * L1: constructor de agentes y operador; modelo de lenguaje y APIs
   *     externas que el agente puede invocar.
   * L2: estudio de agentes (React), runtime (Rust), gateway de modelos (Go),
   *     herramientas (Node), memoria (Python), trazas (Kotlin), cola NATS
   *     y almacén de trazas ClickHouse.
   * L3: el runtime se abre en bucle de razonamiento, ensamblador de
   *     contexto desde memoria y guardrails que detienen acciones inseguras.
   * Flujo clave: cada ejecución queda trazada en ClickHouse; el gateway de
   *     modelos centraliza cuotas y enrutado entre proveedores. */
  {
    id: "agenteflow",
    name: "AgenteFlow",
    category: "ai",
    reference: "AI agent platforms",
    summary: "Builder of AI agents with external tools.",
    focus: "Agents, models, tools, memory, execution and observability.",
    difficulty: "advanced",
    people: [
      ["Agent Builder", "Designs agents and tools."],
      ["Operator", "Reviews traces and failures."],
    ],
    externalSystems: [
      ["Language Model Provider", "Runs the agent brain."],
      ["External Tools", "APIs the agent can call."],
    ],
    containers: [
      ["Agent Studio", "container", "React", "Agent graph, prompts and tests."],
      ["Agent Runtime", "container", "Rust", "Executes the reasoning loop."],
      ["Model Gateway", "container", "Go", "Routes to models and enforces quotas."],
      ["Tool Service", "container", "Node.js", "Tool schemas and execution."],
      ["Memory Service", "container", "Python", "Short and long term memory."],
      ["Tracing Service", "container", "Kotlin", "Traces, spans and evaluations."],
      ["Agent Queue", "queue", "NATS", "Agent run jobs."],
      ["Tracing Store", "database", "ClickHouse", "Traces and metrics."],
    ],
    componentSets: [
      {
        container: "Agent Runtime",
        components: [
          ["Reasoning Loop", "Rust", "Plans, acts and observes until the goal is met."],
          ["Context Assembler", "Rust", "Builds the model context from memory and tools."],
          ["Guardrail Checker", "Rust", "Stops unsafe or out-of-scope actions."],
        ],
      },
    ],
    relations: [
      ["Agent Builder", "Agent Studio", "Configures the agent", "HTTPS"],
      ["Operator", "Tracing Service", "Reviews traces", "HTTPS"],
      ["Agent Studio", "Agent Runtime", "Runs the agent", "HTTPS/JSON"],
      ["Agent Runtime", "Agent Queue", "Enqueues the run", "NATS", "async"],
      ["Model Gateway", "Language Model Provider", "Completes the prompt", "HTTPS"],
      ["Agent Runtime", "Tool Service", "Executes a tool", "gRPC"],
      ["Tool Service", "External Tools", "Performs the action", "HTTPS"],
      ["Agent Runtime", "Memory Service", "Reads and writes memory", "gRPC"],
      ["Agent Runtime", "Tracing Service", "Reports spans", "gRPC"],
      ["Tracing Service", "Tracing Store", "Persists traces and spans", "SQL"],
      ["Reasoning Loop", "Context Assembler", "Assembles the context", "Rust"],
      ["Guardrail Checker", "Reasoning Loop", "Blocks unsafe steps", "Rust"],
      ["Reasoning Loop", "Model Gateway", "Calls the model", "gRPC"],
    ],
  },

  /* ================================================================= */
  /* 10. Infraestructura, desarrollo y ciberseguridad                 */
  /* ================================================================= */

  /* NubeStack · inspirado en Vercel — plataforma de despliegue.
   * L1: desarrollador y operador de plataforma; proveedor Git y DNS.
   * L2: dashboard (Next), plano de control (Go), builds (Rust), control de
   *     despliegues (Kotlin), enrutado (Go), cola Kafka y base de control.
   * L3: el servicio de build se abre en clonador de fuentes, runner de
   *     builds en sandbox y publicador de imágenes en el registro.
   * Flujo clave: el webhook del proveedor Git dispara la cadena build →
   *     despliegue → enrutado, toda ella encolada en Kafka. */
  {
    id: "nubestack",
    name: "NubeStack",
    category: "infra",
    reference: "Vercel",
    summary: "Platform to deploy and operate cloud applications.",
    focus: "Repositories, builds, deployments, CDN and domains.",
    difficulty: "advanced",
    people: [
      ["Developer", "Connects a repository and deploys."],
      ["Platform Operator", "Monitors builds and routing."],
    ],
    externalSystems: [
      ["Git Provider", "Webhooks and repository contents."],
      ["DNS Provider", "Custom domains and certificates."],
    ],
    containers: [
      ["Developer Dashboard", "container", "Next.js", "Projects, logs and domains."],
      ["Control Plane API", "container", "Go", "Projects, deployments and settings."],
      ["Build Service", "container", "Rust", "Builds images from the repository."],
      ["Deployment Controller", "container", "Kotlin", "Schedules rollouts and rollbacks."],
      ["Routing Service", "container", "Go", "Domain routing and certificates."],
      ["Build Queue", "queue", "Kafka", "Build and deploy jobs."],
      ["Control Plane Database", "database", "PostgreSQL", "Projects and deployment history."],
    ],
    componentSets: [
      {
        container: "Build Service",
        components: [
          ["Source Cloner", "Rust", "Fetches the commit to build."],
          ["Builder Runner", "Rust", "Executes the build in a sandbox."],
          ["Image Publisher", "Rust", "Pushes the image to the registry."],
        ],
      },
    ],
    relations: [
      ["Developer", "Developer Dashboard", "Deploys an app", "HTTPS"],
      ["Platform Operator", "Developer Dashboard", "Inspects deployments", "HTTPS"],
      ["Developer Dashboard", "Control Plane API", "Triggers a deployment", "HTTPS/JSON"],
      ["Control Plane API", "Git Provider", "Receives webhooks", "HTTPS"],
      ["Control Plane API", "Build Queue", "Enqueues the build", "Kafka", "async"],
      ["Build Queue", "Build Service", "Delivers build jobs", "Kafka", "async"],
      ["Build Service", "Deployment Controller", "Publishes the image", "gRPC"],
      ["Deployment Controller", "Routing Service", "Updates the routing", "gRPC"],
      ["Routing Service", "DNS Provider", "Provisions certificates", "HTTPS"],
      ["Control Plane API", "Control Plane Database", "Writes history", "SQL"],
      ["Source Cloner", "Builder Runner", "Hands over the source", "Rust"],
      ["Builder Runner", "Image Publisher", "Publishes the artefacts", "Rust"],
      ["Source Cloner", "Git Provider", "Clones the repository", "HTTPS"],
    ],
  },

  /* CódigoLibre · inspirado en GitHub — alojamiento de repositorios.
   * L1: colaborador y maintainer; correo y registro de paquetes.
   * L2: cliente web/git (React), servicio git (Rust), pull requests (Java),
   *     CI/CD (Go), búsqueda (Rust), notificaciones (Node), cola Kafka y
   *     base de metadatos.
   * L3: CI/CD se abre en parser de pipelines, pool de runners y almacén de
   *     artefactos con caché.
   * Flujo clave: el push dispara pipelines encolados; cada PR indexa cambios
   *     y pide notificaciones a los revisores. */
  {
    id: "codigolibre",
    name: "CódigoLibre",
    category: "infra",
    reference: "GitHub",
    summary: "Repository hosting and development collaboration.",
    focus: "Repositories, commits, branches, reviews and CI/CD.",
    difficulty: "advanced",
    people: [
      ["Contributor", "Opens pull requests and reviews code."],
      ["Maintainer", "Merges changes and manages access."],
    ],
    externalSystems: [
      ["Email Provider", "Notifications and mentions.", "SMTP"],
      ["Package Registry", "Publishes and resolves dependencies."],
    ],
    containers: [
      ["Web and Git Client", "container", "React", "Repository browsing and clone."],
      ["Git Service", "container", "Rust", "Object storage for repository data."],
      ["Pull Request Service", "container", "Java", "Reviews, checks and merges."],
      ["CI/CD Service", "container", "Go", "Pipelines, runners and artefacts."],
      ["Search Service", "container", "Rust", "Code and issue search."],
      ["Notification Service", "container", "Node.js", "Activity digests."],
      ["Pipeline Queue", "queue", "Kafka", "Build jobs."],
      ["Metadata Database", "database", "PostgreSQL", "Repositories, issues and PRs."],
    ],
    componentSets: [
      {
        container: "CI/CD Service",
        components: [
          ["Pipeline Parser", "Go", "Reads the pipeline definition."],
          ["Runner Pool", "Go", "Schedules jobs on the runners."],
          ["Artefact Store", "Go", "Keeps build outputs and caches."],
        ],
      },
    ],
    relations: [
      ["Contributor", "Web and Git Client", "Clones and pushes", "HTTPS"],
      ["Maintainer", "Web and Git Client", "Reviews and merges", "HTTPS"],
      ["Web and Git Client", "Git Service", "Reads repository objects", "HTTPS"],
      ["Web and Git Client", "Pull Request Service", "Opens a pull request", "HTTPS/JSON"],
      ["Git Service", "Metadata Database", "Indexes repositories and refs", "SQL"],
      ["Git Service", "CI/CD Service", "Triggers pipelines", "HTTPS"],
      ["Pull Request Service", "Metadata Database", "Stores pull requests", "SQL"],
      ["Pipeline Queue", "CI/CD Service", "Delivers build jobs", "Kafka", "async"],
      ["CI/CD Service", "Package Registry", "Publishes artefacts", "HTTPS"],
      ["Pull Request Service", "Search Service", "Indexes changes", "gRPC"],
      ["Pull Request Service", "Notification Service", "Requests notifications", "gRPC"],
      ["Notification Service", "Email Provider", "Sends digests", "SMTP", "async"],
      ["Pipeline Parser", "Runner Pool", "Schedules the jobs", "Go"],
      ["Runner Pool", "Artefact Store", "Stores the artefacts", "Go"],
      ["Runner Pool", "Pipeline Queue", "Enqueues build jobs", "Kafka", "async"],
    ],
  },

  /* Monitorix · inspirado en Datadog — observabilidad de infraestructura.
   * L1: SRE y desarrollador; pager de guardia y fuentes de métricas.
   * L2: UI de observabilidad (React), pasarela de ingesta (Go), métricas
   *     (Rust), logs (Go), trazas (Kotlin), alertas (Node), cola Kafka de
   *     telemetría y almacén ClickHouse.
   * L3: el servicio de métricas se abre en escritor de series, motor de
   *     rollups preagregados y guardia de cardinalidad.
   * Flujo clave: agentes externos empujan telemetría, que se bufferiza en
   *     Kafka antes de repartirse a métricas, logs y trazas. */
  {
    id: "monitorix",
    name: "Monitorix",
    category: "infra",
    reference: "Datadog",
    summary: "Infrastructure monitoring and application performance.",
    focus: "Agents, metrics, logs, traces and alerting.",
    difficulty: "advanced",
    people: [
      ["SRE", "Investigates alerts and dashboards."],
      ["Developer", "Inspects the traces of a request."],
    ],
    externalSystems: [
      ["Pager Provider", "Sends on-call pages."],
      ["Metric Sources", "Kubernetes, cloud and databases."],
    ],
    containers: [
      ["Observability UI", "container", "React", "Dashboards, logs and traces."],
      ["Ingestion Gateway", "container", "Go", "Receives metrics, logs and spans."],
      ["Metrics Service", "container", "Rust", "Aggregates time series."],
      ["Log Service", "container", "Go", "Indexes and searches logs."],
      ["Trace Service", "container", "Kotlin", "Trace storage and exemplars."],
      ["Alerting Engine", "container", "Node.js", "Evaluates rules and groups alerts."],
      ["Telemetry Queue", "queue", "Kafka", "Buffers incoming telemetry."],
      ["Metrics Store", "database", "ClickHouse", "Metrics, logs and traces."],
    ],
    componentSets: [
      {
        container: "Metrics Service",
        components: [
          ["Series Writer", "Rust", "Appends samples to the time series."],
          ["Rollup Engine", "Rust", "Pre-aggregates at fixed resolutions."],
          ["Cardinality Guard", "Rust", "Rejects label sets that would explode storage."],
        ],
      },
    ],
    relations: [
      ["SRE", "Observability UI", "Investigates alerts", "HTTPS"],
      ["Developer", "Observability UI", "Reads traces", "HTTPS"],
      ["Metric Sources", "Ingestion Gateway", "Sends telemetry", "HTTPS"],
      ["Ingestion Gateway", "Telemetry Queue", "Buffers telemetry", "Kafka", "async"],
      ["Telemetry Queue", "Metrics Service", "Delivers metrics", "Kafka", "async"],
      ["Telemetry Queue", "Log Service", "Delivers logs", "Kafka", "async"],
      ["Telemetry Queue", "Trace Service", "Delivers spans", "Kafka", "async"],
      ["Metrics Service", "Alerting Engine", "Evaluates rules", "gRPC"],
      ["Alerting Engine", "Pager Provider", "Pages the on-call", "HTTPS"],
      ["Observability UI", "Metrics Store", "Queries data", "SQL"],
      ["Series Writer", "Rollup Engine", "Feeds the rollups", "Rust"],
      ["Cardinality Guard", "Series Writer", "Guards the series cardinality", "Rust"],
      ["Rollup Engine", "Metrics Store", "Writes rolled-up metrics", "SQL"],
    ],
  },

  /* EscudoDigital · plataformas SIEM — gestión de incidentes de seguridad.
   * L1: analista y engineer de seguridad; IdP, nube y inteligencia de
   *     amenazas externas.
   * L2: consola SOC (React), colector (Go), correlación (Rust), reglas de
   *     detección (Python), gestión de casos (Kotlin), cola Kafka de
   *     eventos, servicio de indicadores (Go) y base OpenSearch.
   * L3: el motor de correlación se abre en agregador por ventana, paso de
   *     enriquecimiento con contexto y constructor de incidentes.
   * Flujo clave: los colectores normalizan a Kafka; la correlación levanta
   *     incidentes que el analista tria en la consola. */
  {
    id: "escudodigital",
    name: "EscudoDigital",
    category: "infra",
    reference: "SIEM platforms",
    summary: "Security incident management and analysis.",
    focus: "Collectors, event correlation, rules, alerts and audit.",
    difficulty: "advanced",
    people: [
      ["Security Analyst", "Triages incidents and writes rules."],
      ["Security Engineer", "Maintains collectors and integrations."],
    ],
    externalSystems: [
      ["Identity Provider", "Authentication logs."],
      ["Cloud Provider", "Audit and flow logs."],
      ["Threat Intelligence", "Indicators of compromise."],
    ],
    containers: [
      ["SOC Console", "container", "React", "Incidents, timelines and hunting."],
      ["Collector Service", "container", "Go", "Receives events from sources."],
      ["Correlation Engine", "container", "Rust", "Aggregates events into incidents."],
      ["Detection Rules Service", "container", "Python", "Rule authoring and testing."],
      ["Case Management", "container", "Kotlin", "Incidents, tasks and evidence."],
      ["Event Queue", "queue", "Kafka", "Normalises incoming events."],
      ["Correlation Service", "container", "Go", "Matches indicators and hashes."],
      ["SIEM Database", "database", "OpenSearch", "Events, incidents and audit log."],
    ],
    componentSets: [
      {
        container: "Correlation Engine",
        components: [
          ["Window Aggregator", "Rust", "Groups events into incident windows."],
          ["Enrichment Step", "Rust", "Adds asset and user context."],
          ["Incident Builder", "Rust", "Raises and de-duplicates incidents."],
        ],
      },
    ],
    relations: [
      ["Security Analyst", "SOC Console", "Triages incidents", "HTTPS"],
      ["Security Engineer", "SOC Console", "Writes detection rules", "HTTPS"],
      ["SOC Console", "Case Management", "Manages incidents", "HTTPS/JSON"],
      ["SOC Console", "Detection Rules Service", "Authors and tests rules", "HTTPS"],
      ["Identity Provider", "Collector Service", "Sends auth logs", "Syslog", "async"],
      ["Cloud Provider", "Collector Service", "Sends audit logs", "Syslog", "async"],
      ["Collector Service", "Event Queue", "Normalises events", "Kafka", "async"],
      ["Event Queue", "Correlation Engine", "Delivers events", "Kafka", "async"],
      ["Correlation Engine", "Correlation Service", "Matches indicators", "gRPC"],
      ["Correlation Service", "Threat Intelligence", "Queries indicators", "HTTPS"],
      ["Window Aggregator", "Enrichment Step", "Enriches the window", "Rust"],
      ["Enrichment Step", "Incident Builder", "Raises the incident", "Rust"],
      ["Incident Builder", "SIEM Database", "Writes incidents", "SQL"],
      ["Enrichment Step", "Threat Intelligence", "Enriches indicators", "HTTPS"],
    ],
  },

  /* APIHub · inspirado en Kong — gestión centralizada de APIs.
   * L1: consumidor de APIs y engineer de plataforma; IdP y servicios
   *     upstream (los microservicios tras el gateway).
   * L2: portal de desarrollador (React), gateway (Go), políticas (Kotlin),
   *     registro de servicios (Java), analítica (Python), caché Redis de
   *     políticas y base del gateway.
   * L3: el gateway se abre en resolución de rutas, filtro de autenticación
   *     y aplicador de límites por consumidor.
   * Flujo clave: todo tráfico de datos pasa por el gateway; el portal sólo
   *     aplica configuración y emite métricas de uso por Kafka. */
  {
    id: "apihub",
    name: "APIHub",
    category: "infra",
    reference: "Kong / API gateways",
    summary: "Centralised API and service management.",
    focus: "Gateway, authentication, rate limiting, services and metrics.",
    difficulty: "advanced",
    people: [
      ["API Consumer", "Integrates with the published APIs."],
      ["Platform Engineer", "Publishes and secures routes."],
    ],
    externalSystems: [
      ["Identity Provider", "Validates API consumers."],
      ["Upstream Services", "The microservices behind the gateway."],
    ],
    containers: [
      ["Developer Portal", "container", "React", "API catalogue and keys."],
      ["API Gateway", "container", "Go", "Routing, quotas and authentication."],
      ["Policy Service", "container", "Kotlin", "Rate limits and authorisation."],
      ["Service Registry", "container", "Java", "Upstream discovery and health."],
      ["API Analytics", "container", "Python", "Usage reports and anomalies."],
      ["Policy Cache", "database", "Redis", "Cached policies and counters."],
      ["Gateway Database", "database", "PostgreSQL", "Routes, consumers and quotas."],
    ],
    componentSets: [
      {
        container: "API Gateway",
        components: [
          ["Route Resolver", "Go", "Maps requests to upstream services."],
          ["Auth Filter", "Go", "Validates tokens before proxying."],
          ["Quota Enforcer", "Go", "Applies per-consumer rate limits."],
        ],
      },
    ],
    relations: [
      ["API Consumer", "Developer Portal", "Gets an API key", "HTTPS"],
      ["Platform Engineer", "Developer Portal", "Publishes routes", "HTTPS"],
      ["Developer Portal", "API Gateway", "Applies configuration", "HTTPS"],
      ["API Gateway", "Policy Service", "Evaluates policies", "gRPC"],
      ["Policy Service", "Identity Provider", "Validates tokens", "OIDC"],
      ["API Gateway", "Upstream Services", "Proxies the request", "HTTPS"],
      ["API Gateway", "API Analytics", "Emits usage metrics", "Kafka", "async"],
      ["API Analytics", "Gateway Database", "Aggregates usage", "SQL"],
      ["Auth Filter", "Route Resolver", "Authorises before routing", "Go"],
      ["Quota Enforcer", "Route Resolver", "Checks quotas before proxying", "Go"],
      ["Route Resolver", "Service Registry", "Resolves upstreams", "gRPC"],
      ["Quota Enforcer", "Policy Cache", "Reads cached counters", "RESP"],
    ],
  },
];

export const CATEGORY_ORDER: CategoryId[] = [
  "streaming",
  "ecommerce",
  "fintech",
  "social",
  "education",
  "health",
  "transport",
  "productivity",
  "ai",
  "infra",
];

/** Icono de la tarjeta de cada categoría (nombres de `src/components/icons`). */
export const CATEGORY_ICONS = {
  streaming: "layers",
  ecommerce: "cart",
  fintech: "chart",
  social: "users",
  education: "book",
  health: "shield",
  transport: "globe",
  productivity: "grid",
  ai: "robot",
  infra: "server",
} as const;

export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
