import { Button, Modal } from "@heroui/react";
import { useMemo, useState } from "react";
import {
  CATEGORY_ICONS,
  CATEGORY_ORDER,
  EXAMPLES,
  countByCategory,
  exampleImage,
  filterExamples,
  type CategoryId,
} from "@/lib/examples";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n";
import { ExampleDetailDialog } from "./ExampleDetailDialog";
import { Icon } from "./icons";

type OpenExample = (code: string) => void;

function ExampleCard({
  example,
  openExample,
  onAnalyze,
}: {
  example: (typeof EXAMPLES)[number];
  openExample: OpenExample;
  onAnalyze: (example: (typeof EXAMPLES)[number]) => void;
}) {
  const t = useT();
  const [brokenImage, setBrokenImage] = useState(false);
  const icon = CATEGORY_ICONS[example.category];

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50">
      <div className="relative h-28 w-full overflow-hidden bg-surface-secondary">
        {brokenImage ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted">
            <Icon name={icon} className="text-2xl opacity-50" />
            <span className="px-3 text-center text-[10px] leading-tight">
              {t("examples.imageMissing", { id: example.id })}
            </span>
          </div>
        ) : (
          <img
            src={exampleImage(example.id)}
            alt={t("examples.imageAlt", { name: example.name })}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.endsWith(".png")) {
                target.src = target.src.replace(/\.png$/, ".webp");
              } else {
                setBrokenImage(true);
              }
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-foreground">
          <Icon name={icon} className="text-xs" />
          {t(`category.${example.category}` as TranslationKey)}
        </span>
        <span className="absolute top-2 right-2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] text-muted">
          {t(`examples.difficulty.${example.difficulty}` as TranslationKey)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{example.name}</h3>
          <span className="shrink-0 text-[10px] text-muted">
            {t("examples.reference", { name: example.reference })}
          </span>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted">{example.summary}</p>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted/80">{example.focus}</p>
        {/* <code className="w-fit rounded bg-surface-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted">
          ?code={example.id}
        </code> */}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          {/* <Button size="sm" variant="outline" className="flex-1" onPress={copyLink}>
            <Icon name="link" />
            {t("examples.copyLink")}
          </Button> */}
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
            onPress={() => openExample(example.id)}
          >
            <Icon name="diagram" />
            {t("examples.open")}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => onAnalyze(example)}
          className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-transparent py-1 text-[11px] text-muted transition-colors hover:border-border hover:bg-surface-secondary hover:text-foreground"
        >
          <Icon name="info" className="text-xs" />
          {t("examples.viewAnalysis")}
        </button>
      </div>
    </li>
  );
}

export function ExamplesDialog({
  isOpen,
  onOpenChange,
  openExample,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  openExample: (code: string) => void;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [analyzing, setAnalyzing] = useState<(typeof EXAMPLES)[number] | null>(null);
  const totals = useMemo(() => countByCategory(), []);

  const results = useMemo(
    () => filterExamples({ query, category }),
    [query, category],
  );

  const open = (code: string) => {
    openExample(code);
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="full">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("examples.title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <p className="text-xs text-muted">{t("examples.subtitle")}</p>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Icon
                      name="search"
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("examples.searchPlaceholder")}
                      aria-label={t("examples.search")}
                      className="h-10 w-full rounded-[var(--field-radius)] border border-border bg-field pr-3 pl-9 text-sm outline-none focus:border-field-border-focus"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCategory("all")}
                      aria-pressed={category === "all"}
                      className={[
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        category === "all"
                          ? "border-accent bg-accent-soft text-accent-soft-foreground"
                          : "border-border text-muted hover:bg-surface-secondary hover:text-foreground",
                      ].join(" ")}
                    >
                      {t("examples.all")} ({EXAMPLES.length})
                    </button>
                    {CATEGORY_ORDER.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCategory(id)}
                        aria-pressed={category === id}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                          category === id
                            ? "border-accent bg-accent-soft text-accent-soft-foreground"
                            : "border-border text-muted hover:bg-surface-secondary hover:text-foreground",
                        ].join(" ")}
                      >
                        <Icon name={CATEGORY_ICONS[id]} className="text-xs" />
                        {t(`category.${id}` as TranslationKey)}
                        <span className="opacity-60">{totals[id] ?? 0}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>
                      {t("examples.results", { n: results.length, total: EXAMPLES.length })}
                    </span>
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      {t("examples.empty")}
                    </p>
                    <p className="mt-1 text-xs text-muted">{t("examples.emptyHint")}</p>
                  </div>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {results.map((example) => (
                      <ExampleCard
                        key={example.id}
                        example={example}
                        openExample={open}
                        onAnalyze={setAnalyzing}
                      />
                    ))}
                  </ul>
                )}

                <p className="text-[11px] leading-relaxed text-muted">
                  {t("examples.disclaimer")}
                </p>
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
      <ExampleDetailDialog
        example={analyzing}
        isOpen={analyzing !== null}
        onOpenChange={(next) => {
          if (!next) setAnalyzing(null);
        }}
        openExample={openExample}
      />
    </Modal>
  );
}
