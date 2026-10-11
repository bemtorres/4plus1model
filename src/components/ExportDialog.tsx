import { Button, Modal } from "@heroui/react";
import { useMemo } from "react";
import {
  EXPORT_FORMATS,
  downloadText,
  renderExport,
  slugify,
} from "@/lib/exporters";
import { useWorkspace } from "@/lib/workspace-store";
import { useT } from "@/i18n";
import { Icon } from "./icons";
import { notify } from "./Toaster";

export function ExportDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspace } = useWorkspace();
  const t = useT();
  const format = "c4model" as const;

  const meta = EXPORT_FORMATS[0];
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
      "application/json",
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
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon name="file" className="text-base text-accent" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {t("export.format.c4model")}
                      </p>
                      <p className="text-[11px] text-muted">
                        {t("export.hint", {
                          elements: workspace.elements.length,
                          relationships: workspace.relationships.length,
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                    .c4model
                  </span>
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
