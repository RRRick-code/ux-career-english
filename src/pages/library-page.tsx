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
      if (filters.kind !== "all" && item.kind !== filters.kind) {
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
      title="Content library"
      description="Browse every language item, inspect progress, and filter by context without changing study state."
      actions={
        <Button variant="outline" onClick={() => setFilters(defaultFilters())}>
          Reset Filters
        </Button>
      }
    >
      <div className="space-y-6">
        <FilterBar
          displayMode={displayMode}
          filters={filters}
          onDisplayModeChange={setDisplayMode}
          onFilterChange={(key, value) =>
            setFilters((current) => ({ ...current, [key]: value }))
          }
          taxonomy={taxonomy}
        />

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
              <Button variant="outline" onClick={() => setFilters(defaultFilters())}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 pb-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                displayMode={displayMode}
                item={item}
                onClick={() => setSelectedItem(item)}
                record={getRecord(item.id)}
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
