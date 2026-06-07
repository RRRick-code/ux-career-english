import type { HighlightRange, LanguageItem } from "@/types";
import {
  renderHighlightedText,
  renderHighlightedTextWithManual,
} from "@/lib/content";

export function HighlightedText({
  text,
  item,
  className,
  manualHighlights,
}: {
  text: string;
  item: LanguageItem;
  className?: string;
  /**
   * When provided, the user's manual highlights are rendered as a separate
   * light-yellow layer on top of the content-driven highlight.
   */
  manualHighlights?: HighlightRange[];
}) {
  if (manualHighlights) {
    return (
      <>
        {renderHighlightedTextWithManual(
          text,
          item,
          manualHighlights,
          className,
        )}
      </>
    );
  }

  return <>{renderHighlightedText(text, item, className)}</>;
}
