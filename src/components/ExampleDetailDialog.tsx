import { Button, Modal, Separator } from "@heroui/react";
import { useMemo } from "react";
import {
  EXPORT_FORMATS,
  downloadText,
  renderExport,
  slugify,
  type ExportFormat,
} from "@/lib/exporters";
import { analyzeExample, type ExampleAnalysis } from "@/lib/examples/analysis";
import { buildExampleWorkspace, type ExampleSpec } from "@/lib/examples";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { Icon } from "./icons";
import { notify } from "./Toaster";

const DOWNLOADABLE: ExportFormat[] = ["plantuml", "mermaid", "markdown", "json"];

function Stat({
  label,
  value,
  text,
  icon,
}: {
  label: string;
  value?: number;
  text?: string;
  icon: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
      <Icon name={icon} className="shrink-0 text-sm text-muted" />
      {text ? (
        <span className="text-sm font-semibold text-foreground">{text}</span>
      ) : (
        <span className="text-sm font-semibold text-foreground">{value}</span>
      )}
      <span className="truncate text-[11px] text-muted">{label}</span>
    </div>
  );
}

function AnalysisBody({
  example,
  analysis,
}: {
  example: ExampleSpec;
  analysis: ExampleAnalysis;
}) {
  const t = useT();
  const { counts } = analysis;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-foreground/90">{example.summary}</p>
      <p className="text-xs leading-relaxed text-muted">{example.focus}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t("kind.person")} value={counts.people} icon="users" />
        <Stat label={t("kind.softwareSystem")} value={counts.systems} icon="cube" />
        <Stat label={t("kind.container")} value={counts.containers} icon="box" />
        <Stat label={t("kind.database")} value={counts.databases} icon="database" />
        <Stat label={t("kind.queue")} value={counts.queues} icon="queue" />
        <Stat label={t("kind.component")} value={counts.components} icon="blocks" />
        <Stat label={t("kind.externalSystem")} value={counts.externalSystems} icon="external" />
        <Stat
          label={t("common.relationships", { n: "" }).trim()}
          value={counts.relationships}
          icon="link"
        />
        <Stat
          label={t("examples.analysis.complexity")}
          text={t(`examples.analysis.complexity.${analysis.complexity}` as TranslationKey)}
          icon="chart"
        />
      </div>

      <section>
        <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {t("examples.analysis.levels")}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          {analysis.levels.map((level) => (
            <li
              key={level.level}
              className="rounded-lg border border-border px-3 py-2 text-xs leading-relaxed"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {t(`level.${level.level}` as TranslationKey)}
                </span>
                <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] text-muted">
                  {level.count} {t("common.elements", { n: "" }).trim()}
                </span>
              </div>
              <p className="mt-0.5 text-muted">
                {t(`examples.analysis.level.${level.level}` as TranslationKey)}
              </p>
              {level.technologies.length > 0 ? (
                <p className="mt-1 flex flex-wrap gap-1">
                  {level.technologies.slice(0, 8).map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {t("examples.analysis.technologies")}
        </h3>
        {analysis.technologies.length === 0 ? (
          <p className="mt-1 text-xs text-muted">{t("examples.analysis.none")}</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {analysis.technologies.map((tech) => (
              <li key={tech.name}>
                {tech.url ? (
                  <a
                    href={tech.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    {tech.name}
                    <Icon name="external" className="text-[10px] opacity-50" />
                  </a>
                ) : (
                  <span className="inline-block rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">
                    {tech.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {t("examples.analysis.external")}
        </h3>
        {analysis.externalDependencies.length === 0 ? (
          <p className="mt-1 text-xs text-muted">{t("examples.analysis.none")}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {analysis.externalDependencies.map((dependency) => (
              <li key={dependency.name} className="text-xs leading-relaxed">
                <span className="font-medium text-foreground">{dependency.name}</span>
                <span className="text-muted"> — {dependency.description}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          {t("examples.analysis.relationships")} ({analysis.relationships.length})
        </h3>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-border">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-surface-secondary text-muted">
              <tr>
                <th className="px-2 py-1.5 font-medium">{t("inspector.origin")}</th>
                <th className="px-2 py-1.5 font-medium">{t("inspector.relationLabel")}</th>
                <th className="px-2 py-1.5 font-medium">{t("inspector.destination")}</th>
                <th className="px-2 py-1.5 font-medium">{t("inspector.technology")}</th>
              </tr>
            </thead>
            <tbody>
              {analysis.relationships.map((row, index) => (
                <tr key={`${row.from}-${row.to}-${index}`} className="border-t border-separator">
                  <td className="px-2 py-1.5 text-foreground">{row.from}</td>
                  <td className="px-2 py-1.5 text-muted">
                    {row.label}
                    {row.async ? (
                      <span className="ml-1 text-[10px] text-muted">({t("examples.analysis.async")})</span>
                    ) : null}
                  </td>
                  <td className="px-2 py-1.5 text-foreground">{row.to}</td>
                  <td className="px-2 py-1.5 text-muted">{row.technology || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      <section className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted">{t("examples.analysis.reference")}:</span>
        {analysis.referenceUrl ? (
          <a
            href={analysis.referenceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            {analysis.reference}
            <Icon name="external" className="text-[10px]" />
          </a>
        ) : (
          <span className="text-xs font-medium text-foreground">{analysis.reference}</span>
        )}
      </section>
      <p className="text-[11px] leading-relaxed text-muted">
        {t("examples.analysis.independent")}
      </p>
    </div>
  );
}

export function ExampleDetailDialog({
  example,
  isOpen,
  onOpenChange,
  openExample,
}: {
  example: ExampleSpec | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  openExample: (code: string) => void;
}) {
  const t = useT();
  const analysis = useMemo(() => (example ? analyzeExample(example) : null), [example]);
  const workspace = useMemo(
    () => (example ? buildExampleWorkspace(example) : null),
    [example],
  );

  if (!example || !analysis || !workspace) return null;

  const download = (format: ExportFormat) => {
    const meta = EXPORT_FORMATS.find((item) => item.id === format)!;
    downloadText(
      `${slugify(example.name)}.${meta.extension}`,
      renderExport(workspace, format),
      format === "json" ? "application/json" : "text/plain",
    );
    notify(t("export.downloaded", { ext: meta.extension }), "success");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="flex flex-col items-start gap-0.5">
                <span>{example.name}</span>
                <span className="text-xs font-normal text-muted">
                  {t(`category.${example.category}` as TranslationKey)} ·{" "}
                  {t(`examples.difficulty.${example.difficulty}` as TranslationKey)}
                </span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <AnalysisBody example={example} analysis={analysis} />
            </Modal.Body>
            <Modal.Footer>
              <div className="flex w-full flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] text-muted">
                  {t("examples.analysis.download")}:
                </span>
                {DOWNLOADABLE.map((format) => (
                  <Button
                    key={format}
                    size="sm"
                    variant="ghost"
                    onPress={() => download(format)}
                  >
                    {t(`export.format.${format}` as TranslationKey)}
                  </Button>
                ))}
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
                  {t("common.close")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    onOpenChange(false);
                    openExample(example.id);
                  }}
                >
                  <Icon name="diagram" />
                  {t("examples.open")}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
