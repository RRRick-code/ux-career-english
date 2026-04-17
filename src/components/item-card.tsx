import { Star } from "lucide-react";
import { getTaxonomyLabel } from "@/lib/content";
import { ProgressDots } from "@/components/progress-dots";
import { cn } from "@/lib/utils";
import type { DisplayMode, LanguageItem } from "@/types";

export function ItemCard({
  item,
  displayMode,
  progress,
  isStarred,
  onClick,
}: {
  item: LanguageItem;
  displayMode: DisplayMode;
  progress: number;
  isStarred?: boolean;
  onClick: () => void;
}) {
  const showEnglish = displayMode !== "chinese";
  const showChinese = displayMode !== "english";

  return (
    <button
      className="relative h-full w-full rounded-3xl border bg-white px-4 py-4 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
      onClick={onClick}
      type="button"
    >
      <div className="flex h-full flex-col gap-3">
        {isStarred ? (
          <div className="absolute right-5 top-6 text-yellow-400">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
        ) : null}
        <div className={cn("flex-1 space-y-3", isStarred ? "pr-6" : "")}>
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
