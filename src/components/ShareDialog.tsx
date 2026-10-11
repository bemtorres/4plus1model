import { Button, Modal, Separator } from "@heroui/react";
import { useEffect, useState } from "react";
import { buildShareUrl, encodeWorkspace } from "@/lib/share";
import { encodeWorkspaceToJwt } from "@/lib/jwt";
import { useT } from "@/i18n";
import { useWorkspace } from "@/lib/workspace-store";
import { Icon } from "./icons";
import { notify } from "./Toaster";

type Payload = {
  payload: string;
  viewUrl: string;
  editUrl: string;
  length: number;
  jwtToken: string;
  jwtViewUrl: string;
  jwtEditUrl: string;
  jwtIoUrl: string;
} | null;

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
    Promise.all([
      encodeWorkspace(workspace),
      encodeWorkspaceToJwt(workspace),
    ]).then(([payload, jwtToken]) => {
      if (cancelled) return;
      setData({
        payload,
        viewUrl: buildShareUrl(payload, false, false),
        editUrl: buildShareUrl(payload, true, false),
        length: payload.length,
        jwtToken,
        jwtViewUrl: buildShareUrl(jwtToken, false, true),
        jwtEditUrl: buildShareUrl(jwtToken, true, true),
        jwtIoUrl: `https://jwt.io/#debugger-io?token=${encodeURIComponent(jwtToken)}`,
      });
      setBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, workspace]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

                    <Separator />

                    <section className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Icon name="key" className="text-amber-500" />
                          <h3 className="text-sm font-semibold text-foreground">
                            {t("share.jwtTitle")}
                          </h3>
                        </div>
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20">
                          RFC 7519 · C4Compact · HS256
                        </span>
                      </div>
                      <p className="text-xs text-muted">{t("share.jwtHint")}</p>

                      <div className="rounded-lg border border-border bg-surface-secondary/70 p-2 text-[11px] font-mono text-muted overflow-hidden">
                        <div className="truncate text-foreground/80 select-all" title={data.jwtToken}>
                          {data.jwtToken.slice(0, 48)}...{data.jwtToken.slice(-16)}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                          <span>{data.jwtToken.length} chars</span>
                          <span>header.payload.signature</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => void copy(data.jwtToken)}
                        >
                          <Icon name="copy" />
                          {t("share.copyJwt")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => void copy(data.jwtViewUrl)}
                        >
                          <Icon name="copy" />
                          {t("share.copyJwtUrl")}
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full justify-center text-xs"
                        onPress={() => openInTab(data.jwtIoUrl)}
                      >
                        <Icon name="external" />
                        {t("share.openJwtIo")}
                      </Button>
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
