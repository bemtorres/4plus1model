import type { LocaleCode } from "@/i18n";

export interface HomeViewText {
  tag: string;
  name: string;
  question: string;
  detail: string;
  available: boolean;
}

export interface HomeTexts {
  brand: string;
  brandTagline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  actionOpenTitle: string;
  actionOpenDesc: string;
  actionOpenBtn: string;
  actionCreateTitle: string;
  actionCreateDesc: string;
  actionCreateBtn: string;
  actionLearnTitle: string;
  actionLearnDesc: string;
  actionLearnBtn: string;
  viewsTitle: string;
  viewsSubtitle: string;
  viewsIntro: string;
  views: HomeViewText[];
  availableNow: string;
  comingSoon: string;
  featuresTitle: string;
  featuresSubtitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBtn: string;
}

const HOME_TEXTS: Record<LocaleCode, HomeTexts> = {
  es: {
    brand: "4+1 Modeler",
    brandTagline: "Arquitectura de Software",
    heroBadge: "Modelo arquitectónico 4+1 · Philippe Kruchten",
    heroTitle: "Documenta tu arquitectura con las 5 vistas del modelo 4+1",
    heroSubtitle:
      "El modelo 4+1 describe el sistema desde cinco puntos de vista: cuatro vistas técnicas —lógica, proceso, desarrollo y física— más la vista de escenarios que las une. Empieza por los casos de uso y da forma al resto.",
    actionOpenTitle: "Editor de Casos de Uso",
    actionOpenDesc:
      "Modela actores, sistemas, casos de uso y flujos principales en un lienzo interactivo con drill-down.",
    actionOpenBtn: "Abrir el Editor",
    actionCreateTitle: "Nuevo Proyecto en Blanco",
    actionCreateDesc:
      "Crea un proyecto limpio con pestañas de hojas, listo para modelar desde cero.",
    actionCreateBtn: "Empezar en Blanco",
    actionLearnTitle: "¿Qué es el 4+1?",
    actionLearnDesc:
      "Descubre las cinco vistas de Kruchten y cómo se conectan entre sí.",
    actionLearnBtn: "Ver las vistas",
    viewsTitle: "Las cinco vistas del modelo 4+1",
    viewsSubtitle:
      "Cada vista responde una pregunta distinta del arquitecto; juntas describen el sistema completo.",
    viewsIntro:
      "Philippe Kruchten propuso en 1995 describir la arquitectura de software mediante cuatro vistas técnicas —la lógica, la de proceso, la de desarrollo y la física— gobernadas por una quinta vista, la de escenarios (casos de uso), que actúa de hilo conductor y valida que las cuatro anteriores se sostienen entre sí.",
    views: [
      {
        tag: "+1",
        name: "Escenarios",
        question: "¿Qué hace el sistema y quién lo usa?",
        detail:
          "Casos de uso con actores, flujos de pasos y reglas: la vista que da sentido a las demás. Es la primera vista disponible en el editor.",
        available: true,
      },
      {
        tag: "V1",
        name: "Lógica",
        question: "¿Cómo es la estructura estática del sistema?",
        detail:
          "Entidades, clases y sus relaciones: qué elementos componen el software y cómo se organizan conceptualmente.",
        available: false,
      },
      {
        tag: "V2",
        name: "Proceso",
        question: "¿Cómo se ejecuta y se coordina en tiempo de ejecución?",
        detail:
          "Procesos, hilos, concurrencia y sincronización: el comportamiento dinámico del sistema.",
        available: false,
      },
      {
        tag: "V3",
        name: "Desarrollo",
        question: "¿Cómo se organiza el código fuente?",
        detail:
          "Módulos, paquetes, capas y dependencias entre partes del software desde la mirada de quien lo programa.",
        available: false,
      },
      {
        tag: "V4",
        name: "Física",
        question: "¿Dónde y cómo se despliega?",
        detail:
          "Nodos, servidores, redes e infraestructura: el mapeo del software sobre el hardware.",
        available: false,
      },
    ],
    availableNow: "Disponible ahora",
    comingSoon: "Próximamente",
    featuresTitle: "Todo lo que necesitas para modelar con 4+1",
    featuresSubtitle:
      "Una herramienta pensada para arquitectos, desarrolladores, docentes y estudiantes.",
    feature1Title: "Drill-down por casos de uso",
    feature1Desc:
      "Pasa de actores y sistemas a los casos de uso y al flujo de pasos con un clic; vuelve al nivel superior cuando quieras.",
    feature2Title: "Exportación nativa",
    feature2Desc:
      "Descarga tu modelo en JSON, Markdown o JWT firmado para versionarlo junto al código en Git.",
    feature3Title: "100% privado en navegador",
    feature3Desc:
      "Sin servidores ni cuentas: el proyecto se guarda en tu navegador y se comparte por enlace.",
    ctaTitle: "¿Listo para modelar tu arquitectura?",
    ctaSubtitle: "Abre el editor de casos de uso y describe tu sistema en minutos.",
    ctaBtn: "Iniciar 4+1 Modeler",
  },
  en: {
    brand: "4+1 Modeler",
    brandTagline: "Software Architecture",
    heroBadge: "4+1 architectural model · Philippe Kruchten",
    heroTitle: "Document your architecture with the five views of the 4+1 model",
    heroSubtitle:
      "The 4+1 model describes a system from five viewpoints: four technical views — logical, process, development and physical — plus the scenario view that ties them together. Start with use cases and shape the rest.",
    actionOpenTitle: "Use-Case Editor",
    actionOpenDesc:
      "Model actors, systems, use cases and main flows on an interactive canvas with drill-down.",
    actionOpenBtn: "Open the Editor",
    actionCreateTitle: "New Blank Project",
    actionCreateDesc:
      "Start a clean project with sheet tabs, ready to model from scratch.",
    actionCreateBtn: "Start Blank",
    actionLearnTitle: "What is 4+1?",
    actionLearnDesc:
      "Discover Kruchten's five views and how they connect to each other.",
    actionLearnBtn: "Explore the views",
    viewsTitle: "The five views of the 4+1 model",
    viewsSubtitle:
      "Each view answers a different question from the architect; together they describe the whole system.",
    viewsIntro:
      "Philippe Kruchten proposed in 1995 describing software architecture through four technical views — logical, process, development and physical — governed by a fifth, the scenario view (use cases), which acts as the golden thread and validates that the other four hold together.",
    views: [
      {
        tag: "+1",
        name: "Scenarios",
        question: "What does the system do and who uses it?",
        detail:
          "Use cases with actors, step flows and rules: the view that gives meaning to the others. It is the first view available in the editor.",
        available: true,
      },
      {
        tag: "V1",
        name: "Logical",
        question: "What does the static structure of the system look like?",
        detail:
          "Entities, classes and their relationships: the elements that make up the software and how they are organized conceptually.",
        available: false,
      },
      {
        tag: "V2",
        name: "Process",
        question: "How does it run and coordinate at runtime?",
        detail:
          "Processes, threads, concurrency and synchronization: the dynamic behavior of the system.",
        available: false,
      },
      {
        tag: "V3",
        name: "Development",
        question: "How is the source code organized?",
        detail:
          "Modules, packages, layers and dependencies among software parts from the programmer's perspective.",
        available: false,
      },
      {
        tag: "V4",
        name: "Physical",
        question: "Where and how is it deployed?",
        detail:
          "Nodes, servers, networks and infrastructure: mapping the software onto the hardware.",
        available: false,
      },
    ],
    availableNow: "Available now",
    comingSoon: "Coming soon",
    featuresTitle: "Everything you need to model with 4+1",
    featuresSubtitle:
      "A tool designed for architects, developers, educators, and students.",
    feature1Title: "Use-case drill-down",
    feature1Desc:
      "Move from actors and systems into use cases and step flows with one click; jump back to the upper level anytime.",
    feature2Title: "Native export",
    feature2Desc:
      "Download your model as JSON, Markdown, or a signed JWT to version it alongside code in Git.",
    feature3Title: "100% in-browser privacy",
    feature3Desc:
      "No servers or accounts: the project stays in your browser and is shared through a link.",
    ctaTitle: "Ready to model your architecture?",
    ctaSubtitle: "Open the use-case editor and describe your system in minutes.",
    ctaBtn: "Launch 4+1 Modeler",
  },
  pt: {
    brand: "4+1 Modeler",
    brandTagline: "Arquitetura de Software",
    heroBadge: "Modelo arquitetônico 4+1 · Philippe Kruchten",
    heroTitle: "Documente a sua arquitetura com as cinco visões do modelo 4+1",
    heroSubtitle:
      "O modelo 4+1 descreve o sistema a partir de cinco pontos de vista: quatro visões técnicas — lógica, processo, desenvolvimento e física — mais a visão de cenários que as une. Comece pelos casos de uso e dê forma ao resto.",
    actionOpenTitle: "Editor de Casos de Uso",
    actionOpenDesc:
      "Modele atores, sistemas, casos de uso e fluxos principais num canvas interativo com drill-down.",
    actionOpenBtn: "Abrir o Editor",
    actionCreateTitle: "Novo Projeto em Branco",
    actionCreateDesc:
      "Crie um projeto limpo com separadores de folhas, pronto para modelar do zero.",
    actionCreateBtn: "Começar em Branco",
    actionLearnTitle: "O que é o 4+1?",
    actionLearnDesc:
      "Descubra as cinco visões de Kruchten e como se conectam entre si.",
    actionLearnBtn: "Ver as visões",
    viewsTitle: "As cinco visões do modelo 4+1",
    viewsSubtitle:
      "Cada visão responde a uma pergunta diferente do arquiteto; juntas descrevem o sistema completo.",
    viewsIntro:
      "Philippe Kruchten propôs em 1995 descrever a arquitetura de software através de quatro visões técnicas — a lógica, a de processo, a de desenvolvimento e a física — governadas por uma quinta, a de cenários (casos de uso), que atua como fio condutor e valida que as quatro anteriores se sustentam entre si.",
    views: [
      {
        tag: "+1",
        name: "Cenários",
        question: "O que o sistema faz e quem o utiliza?",
        detail:
          "Casos de uso com atores, fluxos de passos e regras: a visão que dá sentido às demais. É a primeira visão disponível no editor.",
        available: true,
      },
      {
        tag: "V1",
        name: "Lógica",
        question: "Como é a estrutura estática do sistema?",
        detail:
          "Entidades, classes e suas relações: os elementos que compõem o software e como se organizam conceitualmente.",
        available: false,
      },
      {
        tag: "V2",
        name: "Processo",
        question: "Como executa e se coordena em tempo de execução?",
        detail:
          "Processos, threads, concorrência e sincronização: o comportamento dinâmico do sistema.",
        available: false,
      },
      {
        tag: "V3",
        name: "Desenvolvimento",
        question: "Como se organiza o código-fonte?",
        detail:
          "Módulos, pacotes, camadas e dependências entre partes do software na perspectiva de quem o programa.",
        available: false,
      },
      {
        tag: "V4",
        name: "Física",
        question: "Onde e como é implantado?",
        detail:
          "Nós, servidores, redes e infraestrutura: o mapeamento do software sobre o hardware.",
        available: false,
      },
    ],
    availableNow: "Disponível agora",
    comingSoon: "Em breve",
    featuresTitle: "Tudo o que precisa para modelar com 4+1",
    featuresSubtitle:
      "Uma ferramenta pensada para arquitetos, desenvolvedores, professores e alunos.",
    feature1Title: "Drill-down por casos de uso",
    feature1Desc:
      "Passe de atores e sistemas para os casos de uso e o fluxo de passos com um clique; volte ao nível superior quando quiser.",
    feature2Title: "Exportação nativa",
    feature2Desc:
      "Descarregue o seu modelo em JSON, Markdown ou JWT assinado para versionar junto com o código no Git.",
    feature3Title: "100% privado no navegador",
    feature3Desc:
      "Sem servidores nem contas: o projeto fica no seu navegador e é partilhado por link.",
    ctaTitle: "Pronto para modelar a sua arquitetura?",
    ctaSubtitle: "Abra o editor de casos de uso e descreva o seu sistema em minutos.",
    ctaBtn: "Iniciar 4+1 Modeler",
  },
  fr: {
    brand: "4+1 Modeler",
    brandTagline: "Architecture Logicielle",
    heroBadge: "Modèle architectural 4+1 · Philippe Kruchten",
    heroTitle: "Documentez votre architecture avec les cinq vues du modèle 4+1",
    heroSubtitle:
      "Le modèle 4+1 décrit un système depuis cinq points de vue : quatre vues techniques — logique, processus, développement et physique — plus la vue des scénarios qui les relie. Commencez par les cas d'utilisation.",
    actionOpenTitle: "Éditeur de Cas d'Utilisation",
    actionOpenDesc:
      "Modélisez acteurs, systèmes, cas d'utilisation et flux principaux sur un canevas interactif avec drill-down.",
    actionOpenBtn: "Ouvrir l'Éditeur",
    actionCreateTitle: "Nouveau Projet Vide",
    actionCreateDesc:
      "Créez un projet propre avec des onglets de feuilles, prêt à modéliser depuis zéro.",
    actionCreateBtn: "Démarrer de Zéro",
    actionLearnTitle: "Qu'est-ce que le 4+1 ?",
    actionLearnDesc:
      "Découvrez les cinq vues de Kruchten et comment elles se connectent.",
    actionLearnBtn: "Voir les vues",
    viewsTitle: "Les cinq vues du modèle 4+1",
    viewsSubtitle:
      "Chaque vue répond à une question différente de l'architecte ; ensemble, elles décrivent le système complet.",
    viewsIntro:
      "Philippe Kruchten a proposé en 1995 de décrire l'architecture logicielle à travers quatre vues techniques — logique, processus, développement et physique — gouvernées par une cinquième, la vue des scénarios (cas d'utilisation), qui sert de fil conducteur et valide la cohérence des quatre autres.",
    views: [
      {
        tag: "+1",
        name: "Scénarios",
        question: "Que fait le système et qui l'utilise ?",
        detail:
          "Cas d'utilisation avec acteurs, flux d'étapes et règles : la vue qui donne sens aux autres. C'est la première vue disponible dans l'éditeur.",
        available: true,
      },
      {
        tag: "V1",
        name: "Logique",
        question: "Quelle est la structure statique du système ?",
        detail:
          "Entités, classes et leurs relations : les éléments qui composent le logiciel et leur organisation conceptuelle.",
        available: false,
      },
      {
        tag: "V2",
        name: "Processus",
        question: "Comment s'exécute-t-il et se coordonne-t-il ?",
        detail:
          "Processus, threads, concurrence et synchronisation : le comportement dynamique du système.",
        available: false,
      },
      {
        tag: "V3",
        name: "Développement",
        question: "Comment le code source est-il organisé ?",
        detail:
          "Modules, paquetages, couches et dépendances entre parties du logiciel du point de vue du développeur.",
        available: false,
      },
      {
        tag: "V4",
        name: "Physique",
        question: "Où et comment est-il déployé ?",
        detail:
          "Nœuds, serveurs, réseaux et infrastructure : le logiciel mappé sur le matériel.",
        available: false,
      },
    ],
    availableNow: "Disponible maintenant",
    comingSoon: "Bientôt disponible",
    featuresTitle: "Tout ce dont vous avez besoin pour modéliser avec le 4+1",
    featuresSubtitle:
      "Un outil conçu pour les architectes, développeurs, formateurs et étudiants.",
    feature1Title: "Drill-down par cas d'utilisation",
    feature1Desc:
      "Passez des acteurs et systèmes aux cas d'utilisation et au flux d'étapes en un clic ; revenez au niveau supérieur quand vous voulez.",
    feature2Title: "Export natif",
    feature2Desc:
      "Téléchargez votre modèle en JSON, Markdown ou JWT signé pour le versionner avec le code dans Git.",
    feature3Title: "100% privé dans le navigateur",
    feature3Desc:
      "Aucun serveur ni compte : le projet reste dans votre navigateur et se partage par lien.",
    ctaTitle: "Prêt à modéliser votre architecture ?",
    ctaSubtitle: "Ouvrez l'éditeur de cas d'utilisation et décrivez votre système en quelques minutes.",
    ctaBtn: "Lancer 4+1 Modeler",
  },
  de: {
    brand: "4+1 Modeler",
    brandTagline: "Softwarearchitektur",
    heroBadge: "4+1-Architekturmodell · Philippe Kruchten",
    heroTitle:
      "Dokumentieren Sie Ihre Architektur mit den fünf Sichten des 4+1-Modells",
    heroSubtitle:
      "Das 4+1-Modell beschreibt ein System aus fünf Blickwinkeln: vier technischen Sichten — logisch, Prozess, Entwicklung und physisch — sowie die Szenarien-Sicht, die sie verbindet. Beginnen Sie mit Use Cases.",
    actionOpenTitle: "Use-Case-Editor",
    actionOpenDesc:
      "Modellieren Sie Akteure, Systeme, Use Cases und Hauptabläufe auf einer interaktiven Fläche mit Drill-down.",
    actionOpenBtn: "Editor öffnen",
    actionCreateTitle: "Neues leeres Projekt",
    actionCreateDesc:
      "Starten Sie ein sauberes Projekt mit Registerkarten, bereit zum Modellieren ab Null.",
    actionCreateBtn: "Leer starten",
    actionLearnTitle: "Was ist 4+1?",
    actionLearnDesc:
      "Entdecken Sie die fünf Sichten von Kruchten und wie sie zusammenhängen.",
    actionLearnBtn: "Sichten ansehen",
    viewsTitle: "Die fünf Sichten des 4+1-Modells",
    viewsSubtitle:
      "Jede Sicht beantwortet eine andere Frage des Architekten; zusammen beschreiben sie das gesamte System.",
    viewsIntro:
      "Philippe Kruchten schlug 1995 vor, Softwarearchitektur durch vier technische Sichten — logisch, Prozess, Entwicklung und physisch — zu beschreiben, die durch eine fünfte, die Szenarien-Sicht (Use Cases), als roter Faden gegengeprüft wird.",
    views: [
      {
        tag: "+1",
        name: "Szenarien",
        question: "Was macht das System und wer nutzt es?",
        detail:
          "Use Cases mit Akteuren, Schrittfolgen und Regeln: die Sicht, die den übrigen Sinn verleiht. Sie ist zuerst im Editor verfügbar.",
        available: true,
      },
      {
        tag: "V1",
        name: "Logisch",
        question: "Wie sieht die statische Struktur des Systems aus?",
        detail:
          "Entitäten, Klassen und ihre Beziehungen: die Bestandteile der Software und ihre konzeptionelle Ordnung.",
        available: false,
      },
      {
        tag: "V2",
        name: "Prozess",
        question: "Wie läuft und koordiniert es sich zur Laufzeit?",
        detail:
          "Prozesse, Threads, Nebenläufigkeit und Synchronisation: das dynamische Verhalten des Systems.",
        available: false,
      },
      {
        tag: "V3",
        name: "Entwicklung",
        question: "Wie ist der Quellcode organisiert?",
        detail:
          "Module, Pakete, Schichten und Abhängigkeiten zwischen Softwareteilen aus Sicht der Entwickler.",
        available: false,
      },
      {
        tag: "V4",
        name: "Physisch",
        question: "Wo und wie wird es bereitgestellt?",
        detail:
          "Knoten, Server, Netze und Infrastruktur: die Zuordnung der Software zur Hardware.",
        available: false,
      },
    ],
    availableNow: "Jetzt verfügbar",
    comingSoon: "Demnächst",
    featuresTitle: "Alles, was Sie zum Modellieren mit 4+1 brauchen",
    featuresSubtitle:
      "Ein Werkzeug für Architekten, Entwickler, Dozenten und Studierende.",
    feature1Title: "Use-Case-Drill-down",
    feature1Desc:
      "Gehen Sie mit einem Klick von Akteuren und Systemen zu Use Cases und Schrittfolgen; kehren Sie jederzeit auf die obere Ebene zurück.",
    feature2Title: "Nativer Export",
    feature2Desc:
      "Laden Sie Ihr Modell als JSON, Markdown oder signiertes JWT herunter, um es mit dem Code in Git zu versionieren.",
    feature3Title: "100% privat im Browser",
    feature3Desc:
      "Keine Server oder Konten: Das Projekt bleibt in Ihrem Browser und wird über einen Link geteilt.",
    ctaTitle: "Bereit, Ihre Architektur zu modellieren?",
    ctaSubtitle:
      "Öffnen Sie den Use-Case-Editor und beschreiben Sie Ihr System in Minuten.",
    ctaBtn: "4+1 Modeler starten",
  },
  zh: {
    brand: "4+1 Modeler",
    brandTagline: "软件架构",
    heroBadge: "4+1 架构模型 · Philippe Kruchten",
    heroTitle: "用 4+1 模型的五个视图记录你的架构",
    heroSubtitle:
      "4+1 模型从五个视角描述系统：四个技术视图——逻辑、进程、开发和物理——再加上将它们联系在一起的场景视图。从用例开始，逐步完善其余部分。",
    actionOpenTitle: "用例编辑器",
    actionOpenDesc:
      "在支持钻取的交互式画布上建模参与者、系统、用例与主流程。",
    actionOpenBtn: "打开编辑器",
    actionCreateTitle: "新建空白项目",
    actionCreateDesc: "创建带工作表标签的干净项目，从零开始建模。",
    actionCreateBtn: "从空白开始",
    actionLearnTitle: "什么是 4+1？",
    actionLearnDesc: "了解 Kruchten 的五个视图及其相互关系。",
    actionLearnBtn: "查看视图",
    viewsTitle: "4+1 模型的五个视图",
    viewsSubtitle: "每个视图回答架构师的一个不同问题；合在一起描述完整的系统。",
    viewsIntro:
      "Philippe Kruchten 于 1995 年提出用四个技术视图——逻辑、进程、开发和物理——描述软件架构，并由第五个视图——场景（用例）——作为主线将它们串起并验证其一致性。",
    views: [
      {
        tag: "+1",
        name: "场景",
        question: "系统做什么、谁在使用它？",
        detail:
          "包含参与者、步骤流程和规则的用例：赋予其他视图意义的视图。这是编辑器中首个可用的视图。",
        available: true,
      },
      {
        tag: "V1",
        name: "逻辑",
        question: "系统的静态结构是什么样的？",
        detail: "实体、类及其关系：构成软件的元素及其概念上的组织方式。",
        available: false,
      },
      {
        tag: "V2",
        name: "进程",
        question: "系统在运行时如何执行与协调？",
        detail: "进程、线程、并发与同步：系统的动态行为。",
        available: false,
      },
      {
        tag: "V3",
        name: "开发",
        question: "源代码如何组织？",
        detail: "模块、包、分层以及软件各部分之间的依赖关系（开发者视角）。",
        available: false,
      },
      {
        tag: "V4",
        name: "物理",
        question: "部署在哪里、如何部署？",
        detail: "节点、服务器、网络与基础设施：软件到硬件的映射。",
        available: false,
      },
    ],
    availableNow: "现已可用",
    comingSoon: "即将推出",
    featuresTitle: "使用 4+1 建模所需的一切",
    featuresSubtitle: "专为架构师、开发者、教师和学生打造的工具。",
    feature1Title: "用例钻取",
    feature1Desc:
      "一键从参与者和系统进入用例与步骤流程，随时返回上一层级。",
    feature2Title: "原生导出",
    feature2Desc:
      "将模型导出为 JSON、Markdown 或签名 JWT，与代码一起纳入 Git 版本管理。",
    feature3Title: "100% 浏览器本地隐私",
    feature3Desc: "无需服务器或账号：项目保存在浏览器中，通过链接分享。",
    ctaTitle: "准备好为你的架构建模了吗？",
    ctaSubtitle: "打开用例编辑器，几分钟内描述你的系统。",
    ctaBtn: "启动 4+1 Modeler",
  },
  ko: {
    brand: "4+1 Modeler",
    brandTagline: "소프트웨어 아키텍처",
    heroBadge: "4+1 아키텍처 모델 · Philippe Kruchten",
    heroTitle: "4+1 모델의 다섯 가지 뷰로 아키텍처를 문서화하세요",
    heroSubtitle:
      "4+1 모델은 시스템을 다섯 가지 관점에서 기술합니다: 네 가지 기술 뷰 — 논리, 프로세스, 개발, 물리 — 그리고 이들을 연결하는 시나리오 뷰. 유스케이스부터 시작하세요.",
    actionOpenTitle: "유스케이스 편집기",
    actionOpenDesc:
      "드릴다운이 가능한 대화형 캔버스에서 액터, 시스템, 유스케이스와 주 흐름을 모델링하세요.",
    actionOpenBtn: "편집기 열기",
    actionCreateTitle: "새 빈 프로젝트",
    actionCreateDesc: "시트 탭이 있는 깨끗한 프로젝트를 만들어 처음부터 모델링하세요.",
    actionCreateBtn: "빈 상태로 시작",
    actionLearnTitle: "4+1이란?",
    actionLearnDesc: "Kruchten의 다섯 가지 뷰와 그 관계를 알아보세요.",
    actionLearnBtn: "뷰 살펴보기",
    viewsTitle: "4+1 모델의 다섯 가지 뷰",
    viewsSubtitle: "각 뷰는 아키텍트의 서로 다른 질문에 답하며, 합쳐져 전체 시스템을 기술합니다.",
    viewsIntro:
      "Philippe Kruchten은 1995년에 소프트웨어 아키텍처를 네 가지 기술 뷰(논리, 프로세스, 개발, 물리)로 기술하고, 다섯 번째 뷰인 시나리오(유스케이스)가 이를 관통하며 나머지 네 뷰의 정합성을 검증한다고 제안했습니다.",
    views: [
      {
        tag: "+1",
        name: "시나리오",
        question: "시스템이 무엇을 하고 누가 사용하나요?",
        detail:
          "액터, 단계 흐름, 규칙을 포함한 유스케이스: 다른 뷰에 의미를 부여하는 뷰입니다. 편집기에서 가장 먼저 사용할 수 있습니다.",
        available: true,
      },
      {
        tag: "V1",
        name: "논리",
        question: "시스템의 정적 구조는 어떤가요?",
        detail:
          "엔터티, 클래스와 그 관계: 소프트웨어를 구성하는 요소와 개념적 구성입니다.",
        available: false,
      },
      {
        tag: "V2",
        name: "프로세스",
        question: "실행 시 어떻게 동작하고 조정되나요?",
        detail: "프로세스, 스레드, 동시성 및 동기화: 시스템의 동적 행동입니다.",
        available: false,
      },
      {
        tag: "V3",
        name: "개발",
        question: "소스 코드는 어떻게 조직되나요?",
        detail: "모듈, 패키지, 계층과 소프트웨어 부분 간 의존성(개발자 관점).",
        available: false,
      },
      {
        tag: "V4",
        name: "물리",
        question: "어디에 어떻게 배포되나요?",
        detail: "노드, 서버, 네트워크, 인프라: 소프트웨어를 하드웨어에 매핑한 것입니다.",
        available: false,
      },
    ],
    availableNow: "지금 사용 가능",
    comingSoon: "출시 예정",
    featuresTitle: "4+1 모델링에 필요한 모든 것",
    featuresSubtitle: "아키텍트, 개발자, 교사와 학생을 위해 설계된 도구입니다.",
    feature1Title: "유스케이스 드릴다운",
    feature1Desc:
      "클릭 한 번으로 액터와 시스템에서 유스케이스와 단계 흐름으로 이동하고, 언제든지 상위 레벨로 돌아올 수 있습니다.",
    feature2Title: "네이티브 내보내기",
    feature2Desc:
      "모델을 JSON, Markdown 또는 서명된 JWT로 내보내 Git에서 코드와 함께 버전 관리하세요.",
    feature3Title: "100% 브라우저 로컬 개인정보 보호",
    feature3Desc:
      "서버나 계정이 필요 없습니다. 프로젝트는 브라우저에 머무르며 링크로 공유됩니다.",
    ctaTitle: "아키텍처를 모델링할 준비가 되셨나요?",
    ctaSubtitle: "유스케이스 편집기를 열고 몇 분 안에 시스템을 설명하세요.",
    ctaBtn: "4+1 Modeler 시작",
  },
};

export function getHomeTexts(locale: LocaleCode): HomeTexts {
  return HOME_TEXTS[locale] ?? HOME_TEXTS.en;
}
