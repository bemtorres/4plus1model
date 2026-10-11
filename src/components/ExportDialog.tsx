import { Button, Modal } from "@heroui/react";
import { useMemo, useState } from "react";
import {
  EXPORT_FORMATS,
  downloadText,
  renderExport,
  slugify,
  type ExportFormat,
} from "@/lib/exporters";
import { useWorkspace } from "@/lib/workspace-store";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { Icon } from "./icons";
import { notify } from "./Toaster";
import { Picker } from "./ui";

export function ExportDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspace } = useWorkspace();
  const t = useT();
  const [format, setFormat] = useState<ExportFormat>("c4model");

  const meta = EXPORT_FORMATS.find((item) => item.id === format) ?? EXPORT_FORMATS[0];
  const content = useMemo(() => renderExport(workspace, format), [workspace, format]);

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
      `${slugify(workspace.name)}.${meta.extension}`,
      content,
      format === "json" || format === "c4model"
        ? "application/json"
        : format === "jwt"
          ? "application/jwt"
          : "text/plain",
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
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted">
                    {t("export.format")}
                  </span>
                  <Picker
                    label={t("export.format")}
                    value={format}
                    onChange={(value) => setFormat(value as ExportFormat)}
                    options={EXPORT_FORMATS.map((item) => ({
                      value: item.id,
                      label: t(`export.format.${item.id}` as TranslationKey),
                    }))}
                  />
                </div>
                <p className="text-xs text-muted">
                  {t("export.hint", {
                    elements: workspace.elements.length,
                    relationships: workspace.relationships.length,
                  })}
                </p>
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
