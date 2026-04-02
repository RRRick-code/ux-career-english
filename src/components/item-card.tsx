import {
  getExamplePatternForItem,
  getPatternUsageItems,
  getTaxonomyLabel,
} from "@/lib/content";
import type { DisplayMode, LanguageItem } from "@/types";

export function ItemCard({
  item,
  displayMode,
  onClick,
}: {
  item: LanguageItem;
  displayMode: DisplayMode;
  onClick: () => void;
}) {
  const showEnglish = displayMode !== "chinese";
  const showChinese = displayMode !== "english";
  const examplePattern = getExamplePatternForItem(item);
  const patternUsageItems =
    item.kind === "pattern" ? getPatternUsageItems(item.id) : [];

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
          <div className="text-sm font-medium leading-6 text-muted-foreground">
            {getTaxonomyLabel("intent", item.intent)}
          </div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">
            {item.kind === "pattern"
              ? patternUsageItems.length > 0
                ? `Used by ${patternUsageItems.length} item${
                    patternUsageItems.length === 1 ? "" : "s"
                  }`
                : "Standalone pattern"
              : examplePattern
                ? "Example sentence linked"
                : "Example sentence pending"}
          </div>
        </div>
      </div>
    </button>
  );
}
