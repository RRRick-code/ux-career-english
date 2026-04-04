import { getTaxonomyLabel } from "@/lib/content";
import { ProgressDots } from "@/components/progress-dots";
import type { DisplayMode, LanguageItem } from "@/types";

export function ItemCard({
  item,
  displayMode,
  progress,
  onClick,
}: {
  item: LanguageItem;
  displayMode: DisplayMode;
  progress: number;
  onClick: () => void;
}) {
  const showEnglish = displayMode !== "chinese";
  const showChinese = displayMode !== "english";

  return (
    <button
      className="h-full w-full rounded-3xl border bg-white px-4 py-4 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
      onClick={onClick}
      type="button"
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex-1 space-y-3">
          {showEnglish ? (
            <section>
              <p className="text-xl font-semibold leading-8">{item.english}</p>
            </section>
          ) : null}
          {showChinese ? (
            <section>
              <p className="text-sm leading-6 text-muted-foreground">{item.chinese}</p>
            </section>
          ) : null}
        </div>
        <div className="border-t border-border/70 pt-3">
          <div className="flex items-center justify-between gap-3 text-xs leading-5 text-muted-foreground">
            <div className="min-w-0 truncate">
              {getTaxonomyLabel("scene", item.scene)} /{" "}
              {getTaxonomyLabel("intent", item.intent)}
            </div>
            <ProgressDots progress={progress} />
          </div>
        </div>
      </div>
    </button>
  );
}
