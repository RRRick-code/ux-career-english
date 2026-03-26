import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getTaxonomyLabel } from "@/lib/content";
import { getStatusLabel } from "@/lib/learning";
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

  const content = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{getTaxonomyLabel("kind", item.kind)}</Badge>
        <Badge>{getStatusLabel(record.status)}</Badge>
        <span className="text-sm text-muted-foreground">{record.progress}/100</span>
      </div>
      <div className="space-y-3">
        <section>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            English
          </div>
          <p className="mt-2 text-lg font-medium leading-8">{item.english}</p>
        </section>
        <section>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Chinese
          </div>
          <p className="mt-2 text-base leading-8 text-foreground/90">{item.chinese}</p>
        </section>
      </div>
      <Progress value={record.progress} />
      <Separator />
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <MetaRow label="Scene" value={getTaxonomyLabel("scene", item.scene)} />
        <MetaRow label="Module" value={getTaxonomyLabel("module", item.module)} />
        <MetaRow label="Intent" value={getTaxonomyLabel("intent", item.intent)} />
        <MetaRow label="Kind" value={getTaxonomyLabel("kind", item.kind)} />
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Item Details</SheetTitle>
            <SheetDescription>
              Review the full language item without leaving the library.
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Item Details</DrawerTitle>
          <DrawerDescription>
            Review the full language item without leaving the library.
          </DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
