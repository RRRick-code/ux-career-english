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
    <button
      className="w-full rounded-3xl border bg-white px-5 py-5 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
      onClick={onClick}
      type="button"
    >
      <div className="space-y-4">
        <div className="space-y-1 text-xs uppercase tracking-wide text-muted-foreground">
          <div>{getTaxonomyLabel("kind", item.kind)}</div>
          <div>{getStatusLabel(record.status)}</div>
          <div>{record.progress}/100</div>
        </div>
        <div className="space-y-2">
          <div className="text-lg font-semibold leading-7">{primaryText}</div>
          {secondaryText ? (
            <p className="text-sm leading-6 text-muted-foreground">{secondaryText}</p>
          ) : null}
        </div>
        <div className="space-y-2 text-sm">
          <Metadata label="Scene" value={getTaxonomyLabel("scene", item.scene)} />
          <Metadata label="Module" value={getTaxonomyLabel("module", item.module)} />
          <Metadata label="Intent" value={getTaxonomyLabel("intent", item.intent)} />
        </div>
        <Progress value={record.progress} />
      </div>
    </button>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}
