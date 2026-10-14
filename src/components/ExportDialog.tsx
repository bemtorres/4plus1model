import { Button, Modal } from "@heroui/react";
import { useMemo, useState } from "react";
import {
  EXPORT_FORMATS,
  describeProject,
  downloadText,
  renderExport,
  slugify,
  type ExportFormat,
} from "@/lib/exporters";
import { useProject } from "@/lib/project-store";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { Icon } from "./icons";
import { Picker } from "./ui";
import { notify } from "./Toaster";

export function ExportDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { project } = useProject();
  const t = useT();
  const [format, setFormat] = useState<ExportFormat>("json");

  const meta = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[0];
  const content = useMemo(() => renderExport(project, format), [project, format]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      notify(t("export.copied"), "success");
    } catch {
      notify(t("export.copyError"), "danger");
    }
  };

  const download = () => {
    downloadText(
      `${slugify(project.name)}.${meta.extension}`,
      content,
      meta.extension === "json" ? "application/json" : "text/plain",
    );
    notify(t("export.downloaded", { ext: meta.extension }), "success");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("export.title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-secondary/60 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon name="file" className="text-base text-accent" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {t(`export.format.${format}` as TranslationKey)}
                      </p>
                      <p className="text-[11px] text-muted">{describeProject(project)}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                    .{meta.extension}
                  </span>
                </div>
                <div className="w-56">
                  <Picker
                    label={t("export.format")}
                    value={format}
                    onChange={(value) => setFormat(value as ExportFormat)}
                    options={EXPORT_FORMATS.map((item) => ({
                      value: item.id,
                      label: item.label,
                    }))}
                  />
                </div>
                <pre className="max-h-[46vh] overflow-auto rounded-lg border border-border bg-surface-secondary p-3 font-mono text-[11px] leading-relaxed whitespace-pre text-foreground">
                  {content}
                </pre>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
                {t("common.close")}
              </Button>
              <Button variant="outline" size="sm" onPress={copy}>
                <Icon name="copy" />
                {t("common.copy")}
              </Button>
              <Button variant="primary" size="sm" onPress={download}>
                <Icon name="download" />
                {t("export.download", { ext: meta.extension })}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
