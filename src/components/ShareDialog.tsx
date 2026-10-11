import { Button, Modal, Separator } from "@heroui/react";
import { useEffect, useState } from "react";
import { buildShareUrl, encodeWorkspace } from "@/lib/share";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { Icon } from "./icons";
import { notify } from "./Toaster";

type Payload = { payload: string; viewUrl: string; editUrl: string; length: number } | null;

export function ShareDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { workspace, readOnly } = useWorkspace();
  const t = useT();
  const [data, setData] = useState<Payload>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setData(null);
      return;
    }
    let cancelled = false;
    setBusy(true);
    encodeWorkspace(workspace).then((payload) => {
      if (cancelled) return;
      setData({
        payload,
        viewUrl: buildShareUrl(payload, false),
        editUrl: buildShareUrl(payload, true),
        length: payload.length,
      });
      setBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, workspace]);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      notify(t("share.copied"), "success");
    } catch {
      notify(t("export.copyError"), "danger");
    }
  };

  const openInTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("share.title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <p className="text-xs leading-relaxed text-muted">{t("share.hint")}</p>

                {readOnly ? (
                  <p className="rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-muted">
                    {t("share.fromReadOnly")}
                  </p>
                ) : null}

                {busy || !data ? (
                  <p className="py-6 text-center text-xs text-muted">{t("share.building")}</p>
                ) : (
                  <>
                    <section className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {t("share.viewTitle")}
                        </h3>
                        <span className="text-[11px] text-muted">
                          {data.length} chars · {t("share.size")}
                        </span>
                      </div>
                      <p className="text-xs text-muted">{t("share.viewHint")}</p>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onPress={() => void copy(data.viewUrl)}
                        >
                          <Icon name="copy" />
                          {t("common.copy")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => openInTab(data.viewUrl)}
                        >
                          <Icon name="external" />
                        </Button>
                      </div>
                    </section>

                    <Separator />

                    <section className="flex flex-col gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t("share.editTitle")}
                      </h3>
                      <p className="text-xs text-muted">{t("share.editHint")}</p>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="primary"
                          className="flex-1"
                          onPress={() => void copy(data.editUrl)}
                        >
                          <Icon name="copy" />
                          {t("common.copy")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => openInTab(data.editUrl)}
                        >
                          <Icon name="external" />
                        </Button>
                      </div>
                    </section>
                  </>
                )}

                <p className="text-[11px] leading-relaxed text-muted">{t("share.privacy")}</p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
                {t("common.close")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
