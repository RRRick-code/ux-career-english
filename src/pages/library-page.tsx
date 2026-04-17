import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FilterBar, defaultFilters } from "@/components/filter-bar";
import { ItemCard } from "@/components/item-card";
import { ItemDetailSheet } from "@/components/item-detail-sheet";
import { Button } from "@/components/ui/button";
import { items, taxonomy } from "@/lib/content";
import { useLearningRecords } from "@/hooks/use-learning-records";
import type { DisplayMode, ItemFilters, LanguageItem } from "@/types";

export function LibraryPage() {
  const { getRecord } = useLearningRecords();
  const [filters, setFilters] = useState<ItemFilters>(defaultFilters);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("bilingual");
  const [selectedItem, setSelectedItem] = useState<LanguageItem | null>(null);
  const clearAllFilters = () => setFilters(defaultFilters());

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const record = getRecord(item.id);

      if (filters.scene !== "all" && item.scene !== filters.scene) {
        return false;
      }
      if (filters.module !== "all" && item.module !== filters.module) {
        return false;
      }
      if (filters.intent !== "all" && item.intent !== filters.intent) {
        return false;
      }
      if (
        filters.kind === "term_phrase" &&
        item.kind !== "term" &&
        item.kind !== "phrase"
      ) {
        return false;
      }
      if (
        filters.kind !== "all" &&
        filters.kind !== "term_phrase" &&
        item.kind !== filters.kind
      ) {
        return false;
      }
      if (filters.status !== "all" && record.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters, getRecord]);

  const hasAnyContent = items.length > 0;

  return (
    <AppShell
      contentWidth="wide"
      title="Library"
      description="Browse every language item, review core content on each card, and open the full details in a side sheet."
    >
      <div className="space-y-6">
        {hasAnyContent ? (
          <FilterBar
            resultCount={filteredItems.length}
            onClearAllFilters={clearAllFilters}
            displayMode={displayMode}
            filters={filters}
            onDisplayModeChange={setDisplayMode}
            onFilterChange={(key, value) =>
              setFilters((current) => ({ ...current, [key]: value }))
            }
            taxonomy={taxonomy}
          />
        ) : null}

        {!hasAnyContent ? (
          <EmptyState
            title="No content available"
            description="Add items to data/language_items.json to populate the library."
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No items match the current filters"
            description="Reset or adjust filters to see more content."
            actions={
              <Button onClick={clearAllFilters}>Clear Filters</Button>
            }
          />
        ) : (
          <div className="grid auto-rows-fr gap-4 pb-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                displayMode={displayMode}
                isStarred={getRecord(item.id).starred}
                item={item}
                progress={getRecord(item.id).progress}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      <ItemDetailSheet
        item={selectedItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
          }
        }}
        open={Boolean(selectedItem)}
        record={selectedItem ? getRecord(selectedItem.id) : null}
      />
    </AppShell>
  );
}
