import type { LocaleCode } from "@/i18n";

export interface HomeTexts {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  actionOpenTitle: string;
  actionOpenDesc: string;
  actionOpenBtn: string;
  actionCreateTitle: string;
  actionCreateDesc: string;
  actionCreateBtn: string;
  actionExampleTitle: string;
  actionExampleDesc: string;
  actionExampleBtn: string;
  levelsTitle: string;
  levelsSubtitle: string;
  catalogTitle: string;
  catalogSubtitle: string;
  catalogSearchPlaceholder: string;
  catalogAll: string;
  catalogOpenBtn: string;
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
    heroBadge: "Modelado visual de arquitectura de software",
    heroTitle: "Modela y documenta tu arquitectura con el Modelo C4",
    heroSubtitle:
      "Diseña sistemas en el nivel de abstracción adecuado: desde el contexto general hasta contenedores, componentes y código. Visual, interactivo, con drill-down y exportaciones para tu repositorio.",
    actionOpenTitle: "Abrir C4 Modeler",
    actionOpenDesc: "Entra al editor interactivo y continúa con tu modelo guardado en este navegador.",
    actionOpenBtn: "Ir al Editor",
    actionCreateTitle: "Crear Nuevo Modelo",
    actionCreateDesc: "Inicia un espacio de trabajo limpio en blanco listo para diseñar tu propio sistema.",
    actionCreateBtn: "Empezar en Blanco",
    actionExampleTitle: "Cargar Ejemplo",
    actionExampleDesc: "Explora 50 casos de estudio reales: streaming, fintech, IA, comercio e infraestructura.",
    actionExampleBtn: "Ver Ejemplos",
    levelsTitle: "Los 4 Niveles de Abstracción C4",
    levelsSubtitle: "Haz zoom progresivo sin mezclar conceptos ni saturar los diagramas.",
    catalogTitle: "Catálogo de Arquitecturas de Estudio",
    catalogSubtitle: "Selecciona cualquiera de los 50 ejemplos para cargarlo directamente en el editor.",
    catalogSearchPlaceholder: "Buscar por nombre, tecnología o referencia...",
    catalogAll: "Todas las categorías",
    catalogOpenBtn: "Abrir en Editor",
    featuresTitle: "Todo lo que necesitas para documentar sistemas vivos",
    featuresSubtitle: "Una herramienta pensada para desarrolladores, arquitectos, docentes y estudiantes.",
    feature1Title: "Drill-down interactivo",
    feature1Desc: "Doble clic en un sistema o contenedor para descender de nivel y regresar cuando quieras.",
    feature2Title: "Exportación nativa",
    feature2Desc: "Genera diagramas en PlantUML, Mermaid, Markdown y JSON para mantenerlos en Git.",
    feature3Title: "100% privado en navegador",
    feature3Desc: "Sin servidores ni cuentas requeridas. Todo se almacena localmente en tu equipo.",
    ctaTitle: "¿Listo para estructurar tu arquitectura?",
    ctaSubtitle: "Abre el editor ahora mismo y comienza a modelar en cuestión de segundos.",
    ctaBtn: "Iniciar C4 Modeler",
  },
  en: {
    heroBadge: "Visual Software Architecture Modeling",
    heroTitle: "Model and document your architecture with the C4 Model",
    heroSubtitle:
      "Design systems at the right level of abstraction: from high-level context down to containers, components, and code. Visual, interactive, with drill-down and ready-to-commit exports.",
    actionOpenTitle: "Open C4 Modeler",
    actionOpenDesc: "Jump into the interactive canvas and continue with your saved model in this browser.",
    actionOpenBtn: "Launch Editor",
    actionCreateTitle: "Create New Model",
    actionCreateDesc: "Start with a clean, blank workspace ready to design your own system from scratch.",
    actionCreateBtn: "Start Blank Canvas",
    actionExampleTitle: "Load Example",
    actionExampleDesc: "Explore 50 real-world architectures modeled across streaming, fintech, AI, and infra.",
    actionExampleBtn: "Browse Examples",
    levelsTitle: "The 4 Levels of the C4 Model",
    levelsSubtitle: "Progressively zoom into details without mixing concerns or cluttering your diagrams.",
    catalogTitle: "50 Industry Architecture Study Cases",
    catalogSubtitle: "Pick any architecture example to load it directly into the canvas.",
    catalogSearchPlaceholder: "Search by name, technology, or reference...",
    catalogAll: "All categories",
    catalogOpenBtn: "Open in Editor",
    featuresTitle: "Everything you need to document living architectures",
    featuresSubtitle: "Designed for software architects, engineering teams, educators, and students.",
    feature1Title: "Interactive Drill-down",
    feature1Desc: "Double click systems or containers to zoom into the next level, and jump back anytime.",
    feature2Title: "Native Code Export",
    feature2Desc: "Export diagrams to PlantUML, Mermaid, Markdown, and JSON to store alongside code in Git.",
    feature3Title: "100% In-Browser Privacy",
    feature3Desc: "No server backend or login required. All diagrams and models stay strictly on your machine.",
    ctaTitle: "Ready to structure your architecture?",
    ctaSubtitle: "Launch the editor now and start diagramming in seconds.",
    ctaBtn: "Launch C4 Modeler",
  },
  pt: {
    heroBadge: "Modelagem visual de arquitetura de software",
    heroTitle: "Modele e documente a sua arquitetura com o Modelo C4",
    heroSubtitle:
      "Desenhe sistemas no nível certo de abstração: do contexto geral a contentores, componentes e código. Visual, interativo, com drill-down e exportações para o seu repositório.",
    actionOpenTitle: "Abrir C4 Modeler",
    actionOpenDesc: "Aceda à tela interativa e continue com o seu modelo guardado neste navegador.",
    actionOpenBtn: "Ir para o Editor",
    actionCreateTitle: "Criar Novo Modelo",
    actionCreateDesc: "Inicie um espaço de trabalho em branco para desenhar o seu próprio sistema do zero.",
    actionCreateBtn: "Começar em Branco",
    actionExampleTitle: "Carregar Exemplo",
    actionExampleDesc: "Explore 50 arquiteturas reais modeladas em streaming, fintech, IA, ecommerce e infraestrutura.",
    actionExampleBtn: "Ver Exemplos",
    levelsTitle: "Os 4 Níveis de Abstração C4",
    levelsSubtitle: "Faça zoom progressivo sem misturar conceitos nem saturar os diagramas.",
    catalogTitle: "Catálogo de Arquiteturas de Estudo",
    catalogSubtitle: "Selecione qualquer exemplo para carregá-lo diretamente no editor.",
    catalogSearchPlaceholder: "Pesquisar por nome, tecnologia ou referência...",
    catalogAll: "Todas as categorias",
    catalogOpenBtn: "Abrir no Editor",
    featuresTitle: "Tudo o que precisa para documentar sistemas vivos",
    featuresSubtitle: "Uma ferramenta pensada para desenvolvedores, arquitetos, professores e alunos.",
    feature1Title: "Drill-down interativo",
    feature1Desc: "Clique duas vezes num sistema ou contentor para descer de nível e voltar quando quiser.",
    feature2Title: "Exportação nativa",
    feature2Desc: "Gere diagramas em PlantUML, Mermaid, Markdown e JSON para manter no Git.",
    feature3Title: "100% privado no navegador",
    feature3Desc: "Sem servidores nem contas. Tudo fica guardado localmente no seu computador.",
    ctaTitle: "Pronto para estruturar a sua arquitetura?",
    ctaSubtitle: "Abra o editor agora e comece a modelar em segundos.",
    ctaBtn: "Iniciar C4 Modeler",
  },
  fr: {
    heroBadge: "Modélisation visuelle d'architecture logicielle",
    heroTitle: "Modélisez et documentez votre architecture avec le Modèle C4",
    heroSubtitle:
      "Concevez des systèmes au bon niveau d'abstraction : du contexte général aux conteneurs, composants et code. Visuel, interactif et prêt à exporter.",
    actionOpenTitle: "Ouvrir C4 Modeler",
    actionOpenDesc: "Accédez au canevas interactif et continuez avec votre modèle enregistré.",
    actionOpenBtn: "Aller à l'Éditeur",
    actionCreateTitle: "Créer un Nouveau Modèle",
    actionCreateDesc: "Démarrez avec un espace de travail vierge pour concevoir votre propre système.",
    actionCreateBtn: "Démarrer de Zéro",
    actionExampleTitle: "Charger un Exemple",
    actionExampleDesc: "Explorez 50 cas réels : streaming, fintech, IA, e-commerce et infrastructure.",
    actionExampleBtn: "Voir les Exemples",
    levelsTitle: "Les 4 Niveaux d'Abstraction C4",
    levelsSubtitle: "Zoomez progressivement sans mélanger les préoccupations.",
    catalogTitle: "Catalogue d'Architectures Réelles",
    catalogSubtitle: "Choisissez un exemple pour l'ouvrir directement dans l'éditeur.",
    catalogSearchPlaceholder: "Rechercher par nom, technologie ou référence...",
    catalogAll: "Toutes les catégories",
    catalogOpenBtn: "Ouvrir dans l'Éditeur",
    featuresTitle: "Tout ce dont vous avez besoin pour documenter vos systèmes",
    featuresSubtitle: "Un outil conçu pour les développeurs, architectes, formateurs et étudiants.",
    feature1Title: "Drill-down interactif",
    feature1Desc: "Double-cliquez pour plonger dans les niveaux inférieurs et revenir facilement.",
    feature2Title: "Export natif",
    feature2Desc: "Générez du PlantUML, Mermaid, Markdown et JSON pour versionner dans Git.",
    feature3Title: "100% privé dans le navigateur",
    feature3Desc: "Aucun serveur ni compte requis. Vos données restent sur votre machine.",
    ctaTitle: "Prêt à structurer votre architecture ?",
    ctaSubtitle: "Ouvrez l'éditeur dès maintenant et commencez à modéliser.",
    ctaBtn: "Lancer C4 Modeler",
  },
  de: {
    heroBadge: "Visuelle Softwarearchitektur-Modellierung",
    heroTitle: "Modellieren und dokumentieren Sie mit dem C4-Modell",
    heroSubtitle:
      "Entwerfen Sie Systeme auf der richtigen Abstraktionsebene: vom Kontext bis zu Containern, Komponenten und Code. Visuell, interaktiv und exportierbar.",
    actionOpenTitle: "C4 Modeler öffnen",
    actionOpenDesc: "Öffnen Sie das interaktive Canvas und arbeiten Sie an Ihrem Modell weiter.",
    actionOpenBtn: "Editor öffnen",
    actionCreateTitle: "Neues Modell erstellen",
    actionCreateDesc: "Starten Sie mit einem leeren Arbeitsbereich für Ihr eigenes System.",
    actionCreateBtn: "Leer starten",
    actionExampleTitle: "Beispiel laden",
    actionExampleDesc: "Erkunden Sie 50 reale Architekturen aus Streaming, Fintech, KI und Infrastruktur.",
    actionExampleBtn: "Beispiele ansehen",
    levelsTitle: "Die 4 Ebenen des C4-Modells",
    levelsSubtitle: "Zoomen Sie schrittweise hinein, ohne Details zu vermischen.",
    catalogTitle: "Katalog realer Architekturen",
    catalogSubtitle: "Wählen Sie ein Beispiel, um es direkt im Editor zu öffnen.",
    catalogSearchPlaceholder: "Nach Name, Technologie oder Referenz suchen...",
    catalogAll: "Alle Kategorien",
    catalogOpenBtn: "Im Editor öffnen",
    featuresTitle: "Alles, was Sie zur Dokumentation von Architekturen brauchen",
    featuresSubtitle: "Entwickelt für Architekten, Entwickler, Dozenten und Studierende.",
    feature1Title: "Interaktiver Drill-down",
    feature1Desc: "Doppelklicken Sie auf Container, um tiefer einzutauchen.",
    feature2Title: "Nativer Export",
    feature2Desc: "Exportieren Sie nach PlantUML, Mermaid, Markdown und JSON für Git.",
    feature3Title: "100% privat im Browser",
    feature3Desc: "Keine Server oder Accounts erforderlich. Alle Daten bleiben lokal.",
    ctaTitle: "Bereit für saubere Architekturdiagramme?",
    ctaSubtitle: "Starten Sie den Editor und legen Sie in Sekunden los.",
    ctaBtn: "C4 Modeler starten",
  },
  zh: {
    heroBadge: "软件架构可视化建模工具",
    heroTitle: "使用 C4 模型直观设计与记录软件架构",
    heroSubtitle:
      "在适当的抽象层次上设计系统：从全局上下文深入到容器、组件和代码。可视化、可交互并支持导出至 Git 仓库。",
    actionOpenTitle: "打开 C4 Modeler",
    actionOpenDesc: "进入交互式画布，继续编辑保存在当前浏览器中的模型。",
    actionOpenBtn: "进入编辑器",
    actionCreateTitle: "创建空白模型",
    actionCreateDesc: "从干净的空白工作区开始，从零设计你自己的软件系统。",
    actionCreateBtn: "新建空白画布",
    actionExampleTitle: "加载案例模型",
    actionExampleDesc: "探索涵盖流媒体、金融科技、AI、电商和基础设施的 50 个真实架构案例。",
    actionExampleBtn: "查看案例目录",
    levelsTitle: "C4 模型的 4 个抽象层级",
    levelsSubtitle: "逐层展开系统细节，不混淆关注点，让架构图清晰易懂。",
    catalogTitle: "50 个行业架构案例库",
    catalogSubtitle: "选择任意案例即可一键加载到编辑器中交互体验。",
    catalogSearchPlaceholder: "按名称、技术或参考产品搜索…",
    catalogAll: "所有分类",
    catalogOpenBtn: "在编辑器中打开",
    featuresTitle: "记录活架构所需的一切工具",
    featuresSubtitle: "专为软件架构师、工程师团队、高校师生打造。",
    feature1Title: "双击深入（Drill-down）",
    feature1Desc: "双击系统或容器即可展开下一层级，随时快速返回上一层。",
    feature2Title: "原生代码导出",
    feature2Desc: "导出为 PlantUML、Mermaid、Markdown 和 JSON，与代码一同纳入版本控制。",
    feature3Title: "100% 浏览器本地隐私",
    feature3Desc: "无需注册账号，无需后端服务器，所有模型安全存放在本地设备中。",
    ctaTitle: "准备好绘制清晰的架构图了吗？",
    ctaSubtitle: "立即启动编辑器，数秒内开启建模之旅。",
    ctaBtn: "启动 C4 Modeler",
  },
  ko: {
    heroBadge: "소프트웨어 아키텍처 시각적 모델링",
    heroTitle: "C4 모델로 소프트웨어 아키텍처 모델링 및 문서화",
    heroSubtitle:
      "적절한 추상화 수준에서 시스템을 설계하세요: 컨텍스트부터 컨테이너, 컴포넌트, 코드까지. 대화형 인터랙션과 내보내기 지원.",
    actionOpenTitle: "C4 Modeler 열기",
    actionOpenDesc: "대화형 캔버스에 접속하여 브라우저에 저장된 모델을 계속 편집합니다.",
    actionOpenBtn: "편집기로 이동",
    actionCreateTitle: "새 모델 만들기",
    actionCreateDesc: "처음부터 고유한 시스템을 설계할 수 있는 빈 작업 공간을 시작합니다.",
    actionCreateBtn: "빈 캔버스로 시작",
    actionExampleTitle: "예제 아키텍처 로드",
    actionExampleDesc: "스트리밍, 핀테크, AI, 인프라 등 50가지 실제 아키텍처 사례를 탐색하세요.",
    actionExampleBtn: "예제 살펴보기",
    levelsTitle: "C4 모델의 4가지 추상화 수준",
    levelsSubtitle: "다이어그램을 복잡하게 만들지 않고 점진적으로 세부 사항을 확대하세요.",
    catalogTitle: "50가지 실제 아키텍처 사례 카탈로그",
    catalogSubtitle: "원하는 예제를 선택하여 편집기로 바로 로드하세요.",
    catalogSearchPlaceholder: "이름, 기술 스택 또는 참조 제품 검색...",
    catalogAll: "전체 카테고리",
    catalogOpenBtn: "편집기에서 열기",
    featuresTitle: "살아있는 아키텍처를 문서화하는 데 필요한 모든 것",
    featuresSubtitle: "소프트웨어 아키텍트, 엔지니어, 교사 및 학생을 위해 제작되었습니다.",
    feature1Title: "대화형 드릴다운",
    feature1Desc: "시스템 또는 컨테이너를 두 번 클릭하여 다음 레벨로 이동하고 언제든지 돌아갈 수 있습니다.",
    feature2Title: "코드 내보내기 지원",
    feature2Desc: "PlantUML, Mermaid, Markdown, JSON으로 내보내 Git 저장소에 보관하세요.",
    feature3Title: "100% 브라우저 로컬 개인정보 보호",
    feature3Desc: "서버나 계정이 필요하지 않습니다. 모든 데이터는 안전하게 기기에 보관됩니다.",
    ctaTitle: "아키텍처를 구조화할 준비가 되셨나요?",
    ctaSubtitle: "지금 바로 편집기를 실행하여 몇 초 만에 다이어그램 작성을 시작하세요.",
    ctaBtn: "C4 Modeler 시작",
  },
};

export function getHomeTexts(locale: LocaleCode): HomeTexts {
  return HOME_TEXTS[locale] ?? HOME_TEXTS.en;
}
