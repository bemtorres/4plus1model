import { Separator } from "@heroui/react";
import { AUTHOR, PROJECT, REFERENCES } from "@/lib/author";
import { LOCALES, LanguageProvider, useLocale, useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { Icon } from "./icons";
import { Picker } from "./ui";

const BENEFITS: TranslationKey[] = [
  "about.benefit.levels",
  "about.benefit.drill",
  "about.benefit.relations",
  "about.benefit.export",
  "about.benefit.persist",
];

const BENEFIT_ICONS = ["target", "layers", "link", "download", "shield"] as const;

function ReferenceCard({ reference }: { reference: (typeof REFERENCES)[number] }) {
  const isMethodology = reference.id === "c4model";
  return (
    <li
      className={[
        "rounded-xl border p-3 transition-colors",
        isMethodology
          ? "border-accent/40 bg-accent-soft/40"
          : "border-border hover:border-border-tertiary",
      ].join(" ")}
    >
      <a
        href={reference.url}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent"
      >
        {reference.name}
        <Icon
          name="external"
          className="text-xs opacity-60 transition-opacity group-hover:opacity-100"
        />
      </a>
      <p className="mt-1 text-xs leading-relaxed text-muted">{reference.description}</p>
    </li>
  );
}

export function AboutPage() {
  return (
    <LanguageProvider>
      <AboutContent />
    </LanguageProvider>
  );
}

function AboutContent() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-separator bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3">
          <a
            href="/editor"
            className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <Icon name="chevron-left" />
            {t("about.back")}
          </a>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{t("about.language")}</span>
            <div className="w-28">
              <Picker
                label={t("about.language")}
                value={locale}
                onChange={(value) => setLocale(value as (typeof LOCALES)[number]["code"])}
                options={LOCALES.map((item) => ({ value: item.code, label: item.label }))}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent text-2xl text-accent-foreground">
            <Icon name="diagram" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("about.nav")} · {PROJECT.name}
            </h1>
            <p className="text-sm text-muted">{t("app.tagline")}</p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            {t("about.authorTitle")}
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-surface-secondary text-xl font-semibold text-foreground">
              {AUTHOR.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">{AUTHOR.name}</h2>
              <p className="text-sm text-muted">{t("about.role")}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t("about.bio")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={AUTHOR.links.linkedin}
                  target="_blank"
                  rel="noreferrer noopener me"
                  className="button button--outline button--sm inline-flex items-center gap-1.5"
                >
                  <Icon name="link" />
                  LinkedIn
                </a>
                <a
                  href={AUTHOR.links.github}
                  target="_blank"
                  rel="noreferrer noopener me"
                  className="button button--outline button--sm inline-flex items-center gap-1.5"
                >
                  <Icon name="code" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("about.projectTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted">{t("about.projectBody")}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft/30 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Icon name="target" className="text-accent" />
            {t("about.c4Title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t("about.c4Body")}</p>
          <a
            href={PROJECT.methodologyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {PROJECT.methodology} — {PROJECT.methodologyUrl.replace(/^https?:\/\//, "")}
            <Icon name="external" className="text-xs" />
          </a>

          <Separator className="my-4" />

          <h3 className="text-sm font-semibold text-foreground">
            {t("about.benefitTitle")}
          </h3>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {BENEFITS.map((key, index) => (
              <li key={key} className="flex items-start gap-2">
                <Icon
                  name={BENEFIT_ICONS[index]}
                  className="mt-0.5 shrink-0 text-sm text-accent"
                />
                <span className="text-[13px] leading-relaxed text-muted">{t(key)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">
            {t("about.referencesTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("about.referencesBody")}
          </p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {REFERENCES.map((reference) => (
              <ReferenceCard key={reference.id} reference={reference} />
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t border-separator pt-5 text-xs text-muted">
          <p>{t("about.builtWith")}</p>
          <p className="mt-1">
            <a
              href={AUTHOR.links.github}
              target="_blank"
              rel="noreferrer noopener me"
              title={t("about.viewProfile")}
              className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-accent"
            >
              <Icon name="code" />
              {t("about.createdBy", { name: AUTHOR.name })}
              <Icon name="external" className="text-[10px] opacity-60" />
            </a>
          </p>
          <p className="mt-1">{t("about.languageSwitchNote")}</p>
        </footer>
      </main>
    </div>
  );
}
