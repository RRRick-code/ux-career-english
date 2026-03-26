import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusLabel } from "@/lib/learning";
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

export function FilterBar({
  filters,
  onFilterChange,
  displayMode,
  onDisplayModeChange,
  taxonomy,
}: {
  filters: ItemFilters;
  onFilterChange: (key: keyof ItemFilters, value: string) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (value: DisplayMode) => void;
  taxonomy: TaxonomyMap;
}) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <FilterSelect
          label="Scene"
          value={filters.scene}
          onValueChange={(value) => onFilterChange("scene", value)}
          options={taxonomy.scene.map((entry) => ({
            value: entry.key,
            label: entry.label,
          }))}
        />
        <FilterSelect
          label="Module"
          value={filters.module}
          onValueChange={(value) => onFilterChange("module", value)}
          options={taxonomy.module.map((entry) => ({
            value: entry.key,
            label: entry.label,
          }))}
        />
        <FilterSelect
          label="Intent"
          value={filters.intent}
          onValueChange={(value) => onFilterChange("intent", value)}
          options={taxonomy.intent.map((entry) => ({
            value: entry.key,
            label: entry.label,
          }))}
        />
        <FilterSelect
          label="Kind"
          value={filters.kind}
          onValueChange={(value) => onFilterChange("kind", value)}
          options={taxonomy.kind.map((entry) => ({
            value: entry.key,
            label: entry.label,
          }))}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onValueChange={(value) => onFilterChange("status", value)}
          options={[
            { value: "not_started", label: getStatusLabel("not_started") },
            { value: "in_progress", label: getStatusLabel("in_progress") },
            { value: "mastered", label: getStatusLabel("mastered") },
          ]}
        />
      </div>
      <Tabs
        value={displayMode}
        onValueChange={(value) => onDisplayModeChange(value as DisplayMode)}
      >
        <TabsList>
          <TabsTrigger value="bilingual">Bilingual</TabsTrigger>
          <TabsTrigger value="english">English Only</TabsTrigger>
          <TabsTrigger value="chinese">Chinese Only</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
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
