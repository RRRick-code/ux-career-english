import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTaxonomyLabel } from "@/lib/content";
import { getStatusLabel } from "@/lib/learning";
import type { DisplayMode, LanguageItem, LearningRecord } from "@/types";

export function ItemCard({
  item,
  record,
  displayMode,
  onClick,
}: {
  item: LanguageItem;
  record: LearningRecord;
  displayMode: DisplayMode;
  onClick: () => void;
}) {
  const primaryText = displayMode === "chinese" ? item.chinese : item.english;
  const secondaryText =
    displayMode === "bilingual"
      ? item.chinese
      : displayMode === "chinese"
        ? item.english
        : null;

  return (
    <button className="w-full text-left" onClick={onClick} type="button">
      <Card className="h-full transition-colors hover:border-foreground/20 hover:bg-accent/30">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getTaxonomyLabel("kind", item.kind)}</Badge>
              <Badge>{getStatusLabel(record.status)}</Badge>
              <span className="text-xs text-muted-foreground">{record.progress}/100</span>
            </div>
            <CardTitle className="text-lg leading-7">{primaryText}</CardTitle>
            {secondaryText ? (
              <p className="text-sm text-muted-foreground">{secondaryText}</p>
            ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <Metadata label="Scene" value={getTaxonomyLabel("scene", item.scene)} />
            <Metadata label="Module" value={getTaxonomyLabel("module", item.module)} />
            <Metadata label="Intent" value={getTaxonomyLabel("intent", item.intent)} />
          </div>
          <Progress value={record.progress} />
        </CardContent>
      </Card>
    </button>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}
