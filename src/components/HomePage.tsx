import { useState, useMemo } from "react";
import { Button, useTheme } from "@heroui/react";
import { LanguageProvider, LOCALES, useLocale, useT } from "@/i18n";
import {
  CATEGORY_ICONS,
  CATEGORY_ORDER,
  filterExamples,
  type CategoryId,
} from "@/lib/examples";
import { ExamplesDialog } from "./ExamplesDialog";
import { Icon } from "./icons";
import { Picker } from "./ui";
import { getHomeTexts } from "./home-i18n";

export function HomePage() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

function HomeContent() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const txt = useMemo(() => getHomeTexts(locale), [locale]);

  const [examplesModalOpen, setExamplesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevelTab, setActiveLevelTab] = useState<"context" | "container" | "component" | "code">("context");

  // Filtrado de ejemplos en la landing
  const displayedExamples = useMemo(() => {
    return filterExamples({
      category: selectedCategory,
      query: searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  const levelInfo = {
    context: {
      num: "L1",
      name: t("level.context"),
      desc: t("level.context.desc"),
      detail:
        "Define el panorama general: quiénes son los usuarios y qué sistemas externos interactúan con la solución sin entrar en detalles tecnológicos internos.",
      icon: "users" as const,
      color: "bg-blue-500/15 border-blue-500/40 text-blue-500",
    },
    container: {
      num: "L2",
      name: t("level.container"),
      desc: t("level.container.desc"),
      detail:
        "Muestra la arquitectura de alto nivel: aplicaciones web y móviles, servicios backend, APIs, bases de datos y colas de mensajería.",
      icon: "server" as const,
      color: "bg-teal-500/15 border-teal-500/40 text-teal-500",
    },
    component: {
      num: "L3",
      name: t("level.component"),
      desc: t("level.component.desc"),
      detail:
        "Descompone un contenedor individual en sus módulos y componentes de software clave, sus responsabilidades e interfaces internas.",
      icon: "grid" as const,
      color: "bg-purple-500/15 border-purple-500/40 text-purple-500",
    },
    code: {
      num: "L4",
      name: t("level.code"),
      desc: t("level.code.desc"),
      detail:
        "Nivel opcional de máxima profundidad: clases principales, funciones y patrones de implementación dentro de un componente.",
      icon: "code" as const,
      color: "bg-amber-500/15 border-amber-500/40 text-amber-500",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      {/* Luz ambiental de fondo */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in oklab, var(--accent) 30%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Barra de navegación superior */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="group flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Icon name="diagram" className="text-lg" />
            </span>
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-foreground">
                C4 Modeler
              </span>
              <span className="block text-[10px] font-medium text-muted">
                Software Architecture
              </span>
            </div>
          </a>

          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="#catalog"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground sm:inline-block"
            >
              {txt.actionExampleTitle}
            </a>
            <a
              href="#levels"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground md:inline-block"
            >
              {txt.levelsTitle}
            </a>
            <a
              href="/about"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
            >
              {t("about.nav")}
            </a>

            <div className="h-4 w-px bg-border/60" />

            {/* Selector de idioma */}
            <div className="w-24 sm:w-28">
              <Picker
                label={t("about.language")}
                value={locale}
                onChange={(value) => setLocale(value as (typeof LOCALES)[number]["code"])}
                options={LOCALES.map((item) => ({ value: item.code, label: item.short }))}
              />
            </div>

            {/* Alternar tema */}
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={resolvedTheme === "dark" ? t("topbar.themeLight") : t("topbar.themeDark")}
              onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-lg text-muted hover:text-foreground"
            >
              <Icon name={resolvedTheme === "dark" ? "sun" : "moon"} className="text-sm" />
            </Button>

            {/* Botón principal al editor */}
            <a
              href="/editor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow"
            >
              <Icon name="diagram" className="text-sm" />
              <span>{txt.actionOpenBtn}</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-medium text-accent shadow-xs">
          <Icon name="sparkles" className="text-xs" />
          <span>{txt.heroBadge}</span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-foreground via-foreground to-muted bg-clip-text text-transparent">
            {txt.heroTitle}
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {txt.heroSubtitle}
        </p>

        {/* 3 Acciones Principales */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {/* Acción 1: Abrir Editor (Continuar modelo actual) */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-accent/40 bg-surface p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md">
            <div>
              <div className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground shadow-xs transition-transform group-hover:scale-105">
                <Icon name="diagram" className="text-xl" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">
                {txt.actionOpenTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.actionOpenDesc}
              </p>
            </div>
            <a
              href="/editor"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-semibold text-accent-foreground shadow-xs transition-all hover:opacity-90"
            >
              <span>{txt.actionOpenBtn}</span>
              <Icon name="chevron-right" className="text-xs" />
            </a>
          </div>

          {/* Acción 2: Crear Modelo Nuevo (En blanco) */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-tertiary hover:shadow-md">
            <div>
              <div className="grid size-12 place-items-center rounded-xl border border-border bg-surface-secondary text-foreground shadow-xs transition-transform group-hover:scale-105">
                <Icon name="plus" className="text-xl" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">
                {txt.actionCreateTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.actionCreateDesc}
              </p>
            </div>
            <a
              href="/editor?new=1"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary py-2.5 text-xs font-semibold text-foreground transition-all hover:border-accent/50 hover:bg-surface"
            >
              <span>{txt.actionCreateBtn}</span>
              <Icon name="chevron-right" className="text-xs" />
            </a>
          </div>

          {/* Acción 3: Cargar Ejemplo (Catálogo de 50 arquitecturas) */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-tertiary hover:shadow-md">
            <div>
              <div className="grid size-12 place-items-center rounded-xl border border-border bg-surface-secondary text-foreground shadow-xs transition-transform group-hover:scale-105">
                <Icon name="layers" className="text-xl" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">
                {txt.actionExampleTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.actionExampleDesc}
              </p>
            </div>
            <a
              href="#catalog"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary py-2.5 text-xs font-semibold text-foreground transition-all hover:border-accent/50 hover:bg-surface"
            >
              <span>{txt.actionExampleBtn}</span>
              <Icon name="chevron-down" className="text-xs" />
            </a>
          </div>
        </div>
      </section>

      {/* Sección: Los 4 Niveles de C4 */}
      <section id="levels" className="border-t border-border/50 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {txt.levelsTitle}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {txt.levelsSubtitle}
            </p>
          </div>

          {/* Selector de pestañas de nivel */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl border border-border bg-surface p-1 shadow-xs">
              {(["context", "container", "component", "code"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevelTab(lvl)}
                  className={[
                    "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                    activeLevelTab === lvl
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <span className="font-mono text-[10px] opacity-80">{levelInfo[lvl].num}</span>
                  <span>{levelInfo[lvl].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta detallada del nivel activo */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <span className={["rounded-md border px-2 py-0.5 font-mono text-xs font-bold", levelInfo[activeLevelTab].color].join(" ")}>
                    {levelInfo[activeLevelTab].num}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {levelInfo[activeLevelTab].name}
                  </h3>
                </div>
                <p className="mt-1 text-xs font-medium text-accent">
                  {levelInfo[activeLevelTab].desc}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {levelInfo[activeLevelTab].detail}
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <a
                  href={`/editor`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-xs transition-opacity hover:opacity-90"
                >
                  <Icon name="diagram" />
                  <span>{txt.actionOpenBtn}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Catálogo de Ejemplos */}
      <section id="catalog" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-0.5 text-xs text-muted">
              <Icon name="layers" className="text-xs" />
              <span>50 casos de estudio disponibles</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {txt.catalogTitle}
            </h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {txt.catalogSubtitle}
            </p>
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={txt.catalogSearchPlaceholder}
                className="w-full rounded-xl border border-border bg-surface py-2 pr-3 pl-8 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Filtros de Categorías */}
        <div className="mt-6 flex gap-1.5 overflow-x-auto pb-2 scroll-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              selectedCategory === "all"
                ? "bg-accent text-accent-foreground font-semibold"
                : "border border-border bg-surface text-muted hover:text-foreground",
            ].join(" ")}
          >
            {txt.catalogAll}
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const icon = CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "border border-border bg-surface text-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon name={icon} className="text-xs" />
                <span className="capitalize">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Cuadrícula de Ejemplos */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedExamples.slice(0, 12).map((example) => {
            const icon = CATEGORY_ICONS[example.category];
            return (
              <div
                key={example.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all duration-200 hover:border-accent/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent capitalize">
                      <Icon name={icon} className="text-xs" />
                      {example.category}
                    </span>
                    <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-muted">
                      {example.difficulty}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-foreground">
                    {example.name}
                  </h3>
                  <p className="text-xs text-muted">
                    {t("examples.reference", { name: example.reference })}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                    {example.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {example.containers.slice(0, 3).map(([cName]) => (
                      <span
                        key={cName}
                        className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] text-muted"
                      >
                        {cName}
                      </span>
                    ))}
                    {example.containers.length > 3 && (
                      <span className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] text-muted">
                        +{example.containers.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  <code className="text-[10px] text-muted font-mono">
                    ?code={example.id}
                  </code>
                  <a
                    href={`/editor?code=${encodeURIComponent(example.id)}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{txt.catalogOpenBtn}</span>
                    <Icon name="chevron-right" className="text-xs" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón para ver los 50 en modal */}
        <div className="mt-8 text-center">
          <Button
            size="md"
            variant="outline"
            onPress={() => setExamplesModalOpen(true)}
            className="rounded-xl px-5 py-2 text-xs font-semibold"
          >
            <Icon name="layers" />
            <span>Explorar los 50 casos en el modal completo</span>
          </Button>
        </div>
      </section>

      {/* Sección: Características Clave */}
      <section className="border-t border-border/50 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {txt.featuresTitle}
            </h2>
            <p className="mt-2 text-xs text-muted sm:text-sm">
              {txt.featuresSubtitle}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon name="target" className="text-lg" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                {txt.feature1Title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.feature1Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon name="download" className="text-lg" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                {txt.feature2Title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.feature2Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon name="shield" className="text-lg" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                {txt.feature3Title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Llamada a la acción final (CTA) */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-accent/40 bg-gradient-to-b from-surface to-surface-secondary p-8 shadow-sm sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
            {txt.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
            {txt.ctaSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/editor"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90"
            >
              <Icon name="diagram" className="text-sm" />
              <span>{txt.ctaBtn}</span>
            </a>
            <a
              href="/editor?new=1"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-xs font-semibold text-foreground transition-all hover:border-accent/40"
            >
              <Icon name="plus" className="text-sm" />
              <span>{txt.actionCreateBtn}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-surface py-8 text-center text-xs text-muted">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-medium">
            <span>C4 Modeler</span>
            <span>·</span>
            <span>cafeycodigo.org</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="/editor" className="hover:text-foreground">
              {txt.actionOpenBtn}
            </a>
            <a href="/about" className="hover:text-foreground">
              {t("about.nav")}
            </a>
            <a
              href="https://github.com/bemtorres/c4model"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Modal de Ejemplos completo */}
      <ExamplesDialog
        isOpen={examplesModalOpen}
        onOpenChange={setExamplesModalOpen}
        openExample={(code) => {
          window.location.href = `/editor?code=${encodeURIComponent(code)}`;
        }}
      />
    </div>
  );
}
