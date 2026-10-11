import { useEffect, useState } from "react";

export type ToastTone = "info" | "success" | "danger";

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let sequence = 0;
let items: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
  for (const listener of listeners) listener(items);
}

export function notify(message: string, tone: ToastTone = "info", duration = 3200) {
  sequence += 1;
  const id = sequence;
  items = [...items, { id, message, tone }];
  emit();
  window.setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, duration);
}

const TONE_CLASS: Record<ToastTone, string> = {
  info: "border-border bg-surface text-foreground",
  success: "border-success/40 bg-success-soft text-success-soft-foreground",
  danger: "border-danger/40 bg-danger-soft text-danger-soft-foreground",
};

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setList);
    setList(items);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {list.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`animate-[c4-toast-in_160ms_ease-out] rounded-lg border px-3 py-2 text-sm shadow-overlay ${TONE_CLASS[item.tone]}`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
