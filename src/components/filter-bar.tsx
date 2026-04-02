import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusLabel } from "@/lib/learning";
import { cn } from "@/lib/utils";
import type { DisplayMode, ItemFilters, TaxonomyMap } from "@/types";

const filterDefaults: ItemFilters = {
  scene: "all",
  module: "all",
  intent: "all",
  kind: "all",
  status: "all",
};

export function defaultFilters(): ItemFilters {
  return { ...filterDefaults };
}

type DataFilterKey = keyof ItemFilters;

type FilterOption = {
  value: string;
  label: string;
};

const displayOptions: FilterOption[] = [
  { value: "bilingual", label: "Bilingual" },
  { value: "english", label: "English Only" },
  { value: "chinese", label: "Chinese Only" },
];

const termAndPhraseKindOption: FilterOption = {
  value: "term_phrase",
  label: "Term & Phrase",
};

const filterLabels: Record<DataFilterKey, string> = {
  scene: "Scene",
  module: "Module",
  intent: "Intent",
  kind: "Kind",
  status: "Status",
};

export function FilterBar({
  resultCount,
  onClearAllFilters,
  filters,
  onFilterChange,
  displayMode,
  onDisplayModeChange,
  taxonomy,
}: {
  resultCount: number;
  onClearAllFilters: () => void;
  filters: ItemFilters;
  onFilterChange: (key: keyof ItemFilters, value: string) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (value: DisplayMode) => void;
  taxonomy: TaxonomyMap;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const filterOptions = useMemo<Record<DataFilterKey, FilterOption[]>>(
    () => ({
      scene: taxonomy.scene.map((entry) => ({
        value: entry.key,
        label: entry.label,
      })),
      module: taxonomy.module.map((entry) => ({
        value: entry.key,
        label: entry.label,
      })),
      intent: taxonomy.intent.map((entry) => ({
        value: entry.key,
        label: entry.label,
      })),
      kind: [
        ...taxonomy.kind
          .filter((entry) => entry.key !== "pattern")
          .map((entry) => ({
            value: entry.key,
            label: entry.label,
          })),
        termAndPhraseKindOption,
        ...taxonomy.kind
          .filter((entry) => entry.key === "pattern")
          .map((entry) => ({
            value: entry.key,
            label: entry.label,
          })),
      ],
      status: [
        { value: "not_started", label: getStatusLabel("not_started") },
        { value: "in_progress", label: getStatusLabel("in_progress") },
        { value: "mastered", label: getStatusLabel("mastered") },
      ],
    }),
    [taxonomy],
  );
  const activeFilters = useMemo(
    () =>
      (Object.keys(filterLabels) as DataFilterKey[]).reduce<
        Array<{ key: DataFilterKey; label: string; value: string }>
      >((current, key) => {
        const selectedValue = filters[key];

        if (selectedValue === "all") {
          return current;
        }

        const optionLabel =
          filterOptions[key].find((option) => option.value === selectedValue)?.label ??
          selectedValue;

        current.push({
          key,
          label: filterLabels[key],
          value: optionLabel,
        });

        return current;
      }, []),
    [filterOptions, filters],
  );
  const activeFilterCount = activeFilters.length;

  return (
    <div className="space-y-4">
      <section
        aria-label="Content library filters"
        className="rounded-3xl border bg-white px-4 py-4 sm:px-5"
      >
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">{formatResultCount(resultCount)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatActiveFilterCount(activeFilterCount)}</span>
              {activeFilterCount > 0 ? (
                <Badge
                  className="border-border bg-slate-50 text-foreground"
                  variant="outline"
                >
                  {activeFilterCount}
                </Badge>
              ) : null}
            </div>
          </div>

          <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
            <DrawerTrigger asChild>
              <Button
                className="shrink-0 rounded-xl bg-white"
                variant="outline"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge className="ml-1 bg-slate-900 text-white">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader className="text-left">
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>
                  {formatResultCount(resultCount)} shown. Results update as soon as
                  you change a filter.
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-2">
                <div className="space-y-4">
                  <FilterSelect
                    label="Display"
                    options={displayOptions}
                    triggerClassName="w-full bg-white"
                    value={displayMode}
                    onValueChange={(value) =>
                      onDisplayModeChange(value as DisplayMode)
                    }
                  />
                  <FilterSelect
                    label="Scene"
                    options={filterOptions.scene}
                    triggerClassName="w-full bg-white"
                    value={filters.scene}
                    onValueChange={(value) => onFilterChange("scene", value)}
                  />
                  <FilterSelect
                    label="Module"
                    options={filterOptions.module}
                    triggerClassName="w-full bg-white"
                    value={filters.module}
                    onValueChange={(value) => onFilterChange("module", value)}
                  />
                  <FilterSelect
                    label="Intent"
                    options={filterOptions.intent}
                    triggerClassName="w-full bg-white"
                    value={filters.intent}
                    onValueChange={(value) => onFilterChange("intent", value)}
                  />
                  <FilterSelect
                    label="Kind"
                    options={filterOptions.kind}
                    triggerClassName="w-full bg-white"
                    value={filters.kind}
                    onValueChange={(value) => onFilterChange("kind", value)}
                  />
                  <FilterSelect
                    label="Status"
                    options={filterOptions.status}
                    triggerClassName="w-full bg-white"
                    value={filters.status}
                    onValueChange={(value) => onFilterChange("status", value)}
                  />
                </div>
              </div>
              <DrawerFooter className="border-t bg-white">
                <Button
                  disabled={activeFilterCount === 0}
                  variant="ghost"
                  onClick={onClearAllFilters}
                >
                  Clear filters
                </Button>
                <DrawerClose asChild>
                  <Button className="rounded-xl">Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="hidden space-y-4 lg:block">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-medium">{formatResultCount(resultCount)}</div>
            <div className="text-sm text-muted-foreground">
              {formatActiveFilterCount(activeFilterCount)}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <FilterSelect
              className="min-w-[10rem] grow xl:grow-0"
              label="Display"
              options={displayOptions}
              size="sm"
              triggerClassName="w-full min-w-[10rem] bg-white"
              value={displayMode}
              onValueChange={(value) => onDisplayModeChange(value as DisplayMode)}
            />
            <FilterSelect
              className="min-w-[10rem] grow xl:grow-0"
              label="Scene"
              options={filterOptions.scene}
              size="sm"
              triggerClassName="w-full min-w-[10rem] bg-white"
              value={filters.scene}
              onValueChange={(value) => onFilterChange("scene", value)}
            />
            <FilterSelect
              className="min-w-[12rem] grow xl:grow-0"
              label="Module"
              options={filterOptions.module}
              size="sm"
              triggerClassName="w-full min-w-[12rem] bg-white"
              value={filters.module}
              onValueChange={(value) => onFilterChange("module", value)}
            />
            <FilterSelect
              className="min-w-[11rem] grow xl:grow-0"
              label="Intent"
              options={filterOptions.intent}
              size="sm"
              triggerClassName="w-full min-w-[11rem] bg-white"
              value={filters.intent}
              onValueChange={(value) => onFilterChange("intent", value)}
            />
            <FilterSelect
              className="min-w-[10rem] grow xl:grow-0"
              label="Kind"
              options={filterOptions.kind}
              size="sm"
              triggerClassName="w-full min-w-[10rem] bg-white"
              value={filters.kind}
              onValueChange={(value) => onFilterChange("kind", value)}
            />
            <FilterSelect
              className="min-w-[10rem] grow xl:grow-0"
              label="Status"
              options={filterOptions.status}
              size="sm"
              triggerClassName="w-full min-w-[10rem] bg-white"
              value={filters.status}
              onValueChange={(value) => onFilterChange("status", value)}
            />
          </div>
        </div>
      </section>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Button
              key={filter.key}
              className="rounded-full border-border bg-white text-foreground hover:bg-slate-50"
              size="xs"
              type="button"
              variant="outline"
              onClick={() => onFilterChange(filter.key, "all")}
            >
              <span className="text-muted-foreground">{filter.label}:</span>
              <span>{filter.value}</span>
              <X className="size-3.5 text-muted-foreground" />
            </Button>
          ))}
          <Button
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            size="sm"
            type="button"
            variant="link"
            onClick={onClearAllFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  className,
  label,
  value,
  onValueChange,
  options,
  triggerClassName,
  size = "default",
}: {
  className?: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  triggerClassName?: string;
  size?: "sm" | "default";
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName} size={size}>
          <SelectValue placeholder={`All ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function formatResultCount(resultCount: number) {
  return `${resultCount} result${resultCount === 1 ? "" : "s"}`;
}

function formatActiveFilterCount(activeFilterCount: number) {
  if (activeFilterCount === 0) {
    return "No active filters";
  }

  return `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`;
}
