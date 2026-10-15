import { useMemo } from "react";
import { Button, useTheme } from "@heroui/react";
import { LanguageProvider, LOCALES, useLocale, useT } from "@/i18n";
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

const VIEW_ICONS = ["target", "grid", "clock", "code", "server"] as const;
const VIEW_COLORS = [
  "bg-accent/15 border-accent/40 text-accent",
  "bg-blue-500/15 border-blue-500/40 text-blue-500",
  "bg-teal-500/15 border-teal-500/40 text-teal-500",
  "bg-purple-500/15 border-purple-500/40 text-purple-500",
  "bg-amber-500/15 border-amber-500/40 text-amber-500",
] as const;

function HomeContent() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const txt = useMemo(() => getHomeTexts(locale), [locale]);

  const [scenarioView, ...technicalViews] = txt.views;

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
                {txt.brand}
              </span>
              <span className="block text-[10px] font-medium text-muted">
                {txt.brandTagline}
              </span>
            </div>
          </a>

          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="#views"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground sm:inline-block"
            >
              {txt.viewsTitle}
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
          {/* Acción 1: Abrir editor de casos de uso */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-accent/40 bg-surface p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md">
            <div>
              <div className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground shadow-xs transition-transform group-hover:scale-105">
                <Icon name="target" className="text-xl" />
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

          {/* Acción 2: Crear proyecto nuevo (En blanco) */}
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

          {/* Acción 3: Aprender el modelo 4+1 */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-tertiary hover:shadow-md">
            <div>
              <div className="grid size-12 place-items-center rounded-xl border border-border bg-surface-secondary text-foreground shadow-xs transition-transform group-hover:scale-105">
                <Icon name="layers" className="text-xl" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">
                {txt.actionLearnTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {txt.actionLearnDesc}
              </p>
            </div>
            <a
              href="#views"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary py-2.5 text-xs font-semibold text-foreground transition-all hover:border-accent/50 hover:bg-surface"
            >
              <span>{txt.actionLearnBtn}</span>
              <Icon name="chevron-down" className="text-xs" />
            </a>
          </div>
        </div>
      </section>

      {/* Sección: El modelo 4+1 (las 5 vistas) */}
      <section id="views" className="border-t border-border/50 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {txt.viewsTitle}
            </h2>
            <p className="mt-2 text-sm text-muted">{txt.viewsSubtitle}</p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted">
              {txt.viewsIntro}
            </p>
          </div>

          {/* Vista +1 destacada (escenarios / casos de uso) */}
          <div className="mt-10 rounded-2xl border border-accent/40 bg-surface p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "rounded-md border px-2 py-0.5 font-mono text-xs font-bold",
                      VIEW_COLORS[0],
                    ].join(" ")}
                  >
                    {scenarioView.tag}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{scenarioView.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    <span className="size-1.5 rounded-full bg-accent" />
                    {txt.availableNow}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-accent">{scenarioView.question}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{scenarioView.detail}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <a
                  href="/editor"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-xs transition-opacity hover:opacity-90"
                >
                  <Icon name="diagram" />
                  <span>{txt.actionOpenBtn}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Las 4 vistas técnicas */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {technicalViews.map((view, index) => (
              <div
                key={view.tag}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-xs transition-colors hover:border-accent/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={[
                      "rounded-md border px-2 py-0.5 font-mono text-xs font-bold",
                      VIEW_COLORS[index + 1],
                    ].join(" ")}
                  >
                    {view.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-muted">
                    {txt.comingSoon}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">{view.name}</h3>
                <p className="mt-1 text-xs font-medium text-accent">{view.question}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{view.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Características Clave */}
      <section className="border-t border-border/50 bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {txt.featuresTitle}
            </h2>
            <p className="mt-2 text-xs text-muted sm:text-sm">{txt.featuresSubtitle}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon name="diagram" className="text-lg" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{txt.feature1Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{txt.feature1Desc}</p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon name="download" className="text-lg" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{txt.feature2Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{txt.feature2Desc}</p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon name="shield" className="text-lg" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-foreground">{txt.feature3Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{txt.feature3Desc}</p>
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
            <span>{txt.brand}</span>
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
              href="https://github.com/bemtorres/4plus1model"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
