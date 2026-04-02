import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  getExamplePatternForItem,
  getPatternUsageItems,
  getTaxonomyLabel,
} from "@/lib/content";
import { getStatusLabel } from "@/lib/learning";
import { HighlightedText } from "@/components/highlighted-text";
import type { LanguageItem, LearningRecord } from "@/types";

export function ItemDetailSheet({
  item,
  record,
  open,
  onOpenChange,
}: {
  item: LanguageItem | null;
  record: LearningRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!item || !record) {
    return null;
  }

  const kindLabel = getTaxonomyLabel("kind", item.kind);
  const sceneLabel = getTaxonomyLabel("scene", item.scene);
  const moduleLabel = getTaxonomyLabel("module", item.module);
  const intentLabel = getTaxonomyLabel("intent", item.intent);
  const statusLabel = getStatusLabel(record.status);
  const examplePattern = getExamplePatternForItem(item);
  const patternUsageItems =
    item.kind === "pattern" ? getPatternUsageItems(item.id) : [];

  const content = (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-8 px-6 pb-8 pt-6 md:px-8 md:pb-10">
        <section className="space-y-3">
          <SectionLabel>English</SectionLabel>
          <p className="text-2xl font-semibold leading-10 text-foreground">
            {item.english}
          </p>
        </section>

        <section className="space-y-3 border-t border-border/70 pt-6">
          <SectionLabel>Chinese</SectionLabel>
          <p className="text-base leading-8 text-foreground/80">{item.chinese}</p>
        </section>

        {item.kind !== "pattern" ? (
          <section className="space-y-3 border-t border-border/70 pt-6">
            <SectionLabel>Example Sentence</SectionLabel>
            {examplePattern ? (
              <div className="rounded-2xl border bg-slate-50 px-4 py-4">
                <p className="text-base leading-8 text-foreground/80">
                  <HighlightedText
                    needle={item.english}
                    text={examplePattern.english}
                  />
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Linked pattern
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No example sentence linked yet.
              </p>
            )}
          </section>
        ) : null}

        {item.kind === "pattern" ? (
          <section className="space-y-3 border-t border-border/70 pt-6">
            <SectionLabel>Used By</SectionLabel>
            {patternUsageItems.length > 0 ? (
              <div className="space-y-2">
                {patternUsageItems.map((usageItem) => (
                  <div
                    key={usageItem.id}
                    className="rounded-2xl border bg-slate-50 px-4 py-3"
                  >
                    <div className="text-sm font-medium leading-6 text-foreground">
                      {usageItem.english}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTaxonomyLabel("kind", usageItem.kind)} · {usageItem.id}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No linked term or phrase yet.
              </p>
            )}
          </section>
        ) : null}

        <section className="space-y-4 border-t border-border/70 pt-6">
          <SectionLabel>Details</SectionLabel>
          <div className="space-y-3">
            <MetaRow label="Intent" value={intentLabel} />
            <MetaRow label="Scene" value={sceneLabel} />
            <MetaRow label="Module" value={moduleLabel} />
            <MetaRow label="Kind" value={kindLabel} />
            <MetaRow label="Status" value={statusLabel} />
            <MetaRow label="Progress" value={`${record.progress}/100`} />
            <MetaRow label="ID" value={item.id} />
          </div>
        </section>
      </div>
    </ScrollArea>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="overflow-hidden p-0"
          style={{
            width: "min(60vw, 48rem)",
            maxWidth: "min(60vw, 48rem)",
          }}
        >
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="border-b border-border/70 px-8 py-6 pr-16">
              <SheetTitle>Item Details</SheetTitle>
              <SheetDescription>
                Review the full language item without leaving the library.
              </SheetDescription>
            </SheetHeader>
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-hidden">
        <div className="flex max-h-[88vh] min-h-0 flex-col">
          <DrawerHeader className="border-b border-border/70 px-6 pb-4 pt-4 text-left">
            <DrawerTitle>Item Details</DrawerTitle>
            <DrawerDescription>
              Review the full language item without leaving the library.
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-base leading-7 text-foreground">{value}</div>
    </div>
  );
}
