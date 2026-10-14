import { Button, Modal, Separator } from "@heroui/react";
import { useMemo } from "react";
import {
  EXPORT_FORMATS,
  downloadText,
  renderExport,
  slugify,
  type ExportFormat,
} from "@/lib/exporters";
import { buildExampleProject, type ExampleSpec } from "@/lib/examples";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { Icon } from "./icons";
import { notify } from "./Toaster";

const DOWNLOADABLE: ExportFormat[] = ["json", "markdown", "jwt"];

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
  const project = useMemo(() => (example ? buildExampleProject(example) : null), [example]);

  if (!example || !project) return null;

  const sheet = project.sheets[0];

  const download = (format: ExportFormat) => {
    const meta = EXPORT_FORMATS.find((item) => item.id === format)!;
    downloadText(
      `${slugify(example.name)}.${meta.extension}`,
      renderExport(project, format),
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
              <div className="flex flex-col gap-5">
                <p className="text-sm leading-relaxed text-foreground/90">{example.summary}</p>
                <p className="text-xs leading-relaxed text-muted">{example.focus}</p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <Icon name="users" className="shrink-0 text-sm text-muted" />
                    <span className="text-sm font-semibold text-foreground">
                      {sheet?.elements.filter((element) => element.kind === "actor").length ?? 0}
                    </span>
                    <span className="truncate text-[11px] text-muted">{t("kind.actor")}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <Icon name="cube" className="shrink-0 text-sm text-muted" />
                    <span className="text-sm font-semibold text-foreground">
                      {sheet?.elements.filter((element) => element.kind === "system").length ?? 0}
                    </span>
                    <span className="truncate text-[11px] text-muted">{t("kind.system")}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-2.5 py-2">
                    <Icon name="target" className="shrink-0 text-sm text-muted" />
                    <span className="text-sm font-semibold text-foreground">
                      {sheet?.elements.filter((element) => element.kind === "useCase").length ?? 0}
                    </span>
                    <span className="truncate text-[11px] text-muted">{t("kind.useCase")}</span>
                  </div>
                </div>

                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {t("kind.useCase")}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {(sheet?.elements ?? [])
                      .filter((element) => element.kind === "useCase")
                      .map((useCase) => (
                        <li
                          key={useCase.id}
                          className="rounded-lg border border-border px-3 py-2 text-xs leading-relaxed"
                        >
                          <span className="font-semibold text-foreground">{useCase.name}</span>
                          {useCase.description ? (
                            <p className="mt-0.5 text-muted">{useCase.description}</p>
                          ) : null}
                        </li>
                      ))}
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {t("examples.analysis.reference")}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-foreground">{example.reference}</p>
                </section>
                <p className="text-[11px] leading-relaxed text-muted">
                  {t("examples.analysis.independent")}
                </p>
              </div>
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
