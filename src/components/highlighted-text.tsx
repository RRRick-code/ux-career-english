import { renderHighlightedText } from "@/lib/content";

export function HighlightedText({
  text,
  needle,
}: {
  text: string;
  needle: string;
}) {
  return <>{renderHighlightedText(text, needle)}</>;
}
