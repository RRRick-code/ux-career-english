import type { LanguageItem } from "@/types";
import { renderHighlightedText } from "@/lib/content";

export function HighlightedText({
  text,
  item,
}: {
  text: string;
  item: LanguageItem;
}) {
  return <>{renderHighlightedText(text, item)}</>;
}
