import { Button, Modal, TextArea, TextField } from "@heroui/react";
import { useRef, useState } from "react";
import { WorkspaceParseError, parseWorkspaceFile } from "@/lib/storage";
import { useWorkspace } from "@/lib/workspace-store";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { notify } from "./Toaster";

export function ImportDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { importWorkspace } = useWorkspace();
  const t = useT();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setText("");
    setError(null);
  };

  const apply = () => {
    try {
      const workspace = parseWorkspaceFile(text);
      importWorkspace(workspace);
      onOpenChange(false);
      reset();
      notify(t("import.done", { name: workspace.name }), "success");
    } catch (cause) {
      const key: TranslationKey =
        cause instanceof WorkspaceParseError
          ? (cause.code as TranslationKey)
          : "import.readError";
      setError(t(key, cause instanceof WorkspaceParseError ? cause.params : undefined));
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setText(await file.text());
      setError(null);
    } catch {
      setError(t("import.readError"));
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("import.title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted">{t("import.hint")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json,.jwt,.c4model"
                  className="hidden"
                  onChange={(event) => void onFile(event.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => fileInputRef.current?.click()}
                >
                  {t("import.choose")}
                </Button>
                <TextField value={text} onChange={setText}>
                  <TextArea rows={10} placeholder='{ "format": "c4model", ... } / .json / .c4model / JWT' />
                </TextField>
                {error ? (
                  <p className="rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-xs text-danger-soft-foreground">
                    {error}
                  </p>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="primary" size="sm" isDisabled={!text.trim()} onPress={apply}>
                {t("topbar.import")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
