import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { isRangeHighlighted } from "@/lib/storage";
import type { HighlightRange } from "@/types";

type MenuState = {
  range: HighlightRange;
  highlighted: boolean;
  left: number;
  top: number;
};

/**
 * Floating "划词" menu shown when the user selects text inside `containerRef`.
 * It surfaces a single contextual action — highlight or un-highlight — for the
 * current selection, mapped back to character offsets in `english`.
 */
export function SelectionHighlightMenu({
  containerRef,
  english,
  manualHighlights,
  onToggle,
}: {
  containerRef: RefObject<HTMLElement | null>;
  english: string;
  manualHighlights: HighlightRange[];
  onToggle: (range: HighlightRange) => void;
}) {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setMenu(null), []);

  const evaluateSelection = useCallback(() => {
    const container = containerRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.rangeCount === 0) {
      setMenu(null);
      return;
    }

    if (selection.isCollapsed) {
      setMenu(null);
      return;
    }

    const domRange = selection.getRangeAt(0);
    if (
      !container.contains(domRange.startContainer) ||
      !container.contains(domRange.endContainer)
    ) {
      setMenu(null);
      return;
    }

    const rawRange = domRangeToOffsets(container, domRange);
    const range = trimRange(english, rawRange);
    if (!range) {
      setMenu(null);
      return;
    }

    const rect = domRange.getBoundingClientRect();
    setMenu({
      range,
      highlighted: isRangeHighlighted(manualHighlights, range),
      left: rect.left + rect.width / 2,
      top: rect.top,
    });
  }, [containerRef, english, manualHighlights]);

  // Re-evaluate the selection on the gestures that finish one.
  useEffect(() => {
    const handleMouseUp = () => window.requestAnimationFrame(evaluateSelection);
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setMenu(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [evaluateSelection]);

  // Dismiss when scrolling or pressing Escape.
  useEffect(() => {
    if (!menu) {
      return;
    }

    const handleScroll = () => close();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menu, close]);

  if (!menu) {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border bg-white p-1 shadow-md"
      style={{ left: menu.left, top: menu.top - 8 }}
      // Keep the text selection alive until the action fires.
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        role="menuitem"
        className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-slate-100"
        onClick={() => {
          onToggle(menu.range);
          window.getSelection()?.removeAllRanges();
          close();
        }}
      >
        {menu.highlighted ? "Remove highlight" : "Highlight"}
      </button>
    </div>,
    document.body,
  );
}

/**
 * Maps a DOM Range inside `container` to character offsets within the
 * container's text content. The rendered text content equals the original
 * English string (highlight marks add no characters), so a left-to-right walk
 * over text nodes yields the correct offsets even across `<mark>` boundaries.
 */
function domRangeToOffsets(
  container: HTMLElement,
  domRange: Range,
): HighlightRange {
  const start = offsetWithinContainer(
    container,
    domRange.startContainer,
    domRange.startOffset,
  );
  const end = offsetWithinContainer(
    container,
    domRange.endContainer,
    domRange.endOffset,
  );

  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function offsetWithinContainer(
  container: HTMLElement,
  node: Node,
  offset: number,
): number {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let total = 0;
  let current = walker.nextNode();
  while (current) {
    if (current === node) {
      return total + offset;
    }
    total += current.textContent?.length ?? 0;
    current = walker.nextNode();
  }

  // Endpoint sits on an element node (e.g. between marks): `offset` counts
  // child nodes, which we cannot resolve here, so fall back to the total.
  return total;
}

/** Trims leading/trailing whitespace from a selection range. */
function trimRange(text: string, range: HighlightRange): HighlightRange | null {
  let { start, end } = range;
  start = Math.max(0, Math.min(start, text.length));
  end = Math.max(0, Math.min(end, text.length));

  while (start < end && /\s/.test(text[start])) {
    start += 1;
  }
  while (end > start && /\s/.test(text[end - 1])) {
    end -= 1;
  }

  return end > start ? { start, end } : null;
}
