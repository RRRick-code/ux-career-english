import type { LanguageItem } from "@/types";
import { renderHighlightedText } from "@/lib/content";

export function HighlightedText({
  text,
  item,
  className,
}: {
  text: string;
  item: LanguageItem;
  className?: string;
}) {
  return <>{renderHighlightedText(text, item, className)}</>;
}
