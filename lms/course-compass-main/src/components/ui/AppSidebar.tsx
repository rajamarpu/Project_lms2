import { X } from "lucide-react";

interface SidebarProps {
  sortBy: string;
  setSortBy: (v: string) => void;
  selLevels: string[];
  setSelLevels: (v: string[]) => void;
  selTopics: string[];
  setSelTopics: (v: string[]) => void;
  clearAll: () => void;
  levels: readonly string[];
  topics: string[];
  showFilters: boolean;
}

const sortOptions = ["Most Popular", "Highest Rated", "Newest"];

export const AppSidebar = ({
  sortBy,
  setSortBy,
  selLevels,
  setSelLevels,
  selTopics,
  setSelTopics,
  clearAll,
  levels,
  topics,
  showFilters,
}: SidebarProps) => {
  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const activeCount = selLevels.length + selTopics.length + (sortBy === "Most Popular" ? 0 : 1);

  return (
    <aside
      className={`${
        showFilters ? "block" : "hidden"
      } z-40 w-full overflow-y-auto overflow-x-hidden bg-background/95 p-4 shadow-[var(--shadow-overlay)] backdrop-blur lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-5rem)] lg:w-[clamp(240px,21vw,300px)] lg:shrink-0 lg:border-r lg:border-border lg:bg-transparent lg:p-0 lg:pr-6 lg:shadow-none ${showFilters ? "fixed inset-x-0 bottom-0 top-16" : ""}`}
    >
      <div className="mb-4 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="page-eyebrow">Refine catalog</p>
            <h3 className="mt-1 text-lg font-bold tracking-wide text-foreground">Filters</h3>
          </div>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-secondary transition hover:border-primary hover:text-primary"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {activeCount} active {activeCount === 1 ? "filter" : "filters"} applied
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sortBy !== "Most Popular" && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              Sorted: {sortBy}
            </span>
          )}
          {selLevels.map((level) => (
            <span key={level} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold text-foreground">
              {level}
            </span>
          ))}
          {selTopics.map((topic) => (
            <span key={topic} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold text-foreground">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <FilterGroup title="Sort By">
        {sortOptions.map((s) => (
          <label
            key={s}
            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${sortBy === s ? "border-primary" : "border-border group-hover:border-primary/50"}`}>
              {sortBy === s && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <input
              type="radio"
              name="sortBy"
              checked={sortBy === s}
              onChange={() => setSortBy(s)}
              className="sr-only"
            />
            <span className="text-sm">{s}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Level">
        {levels.map((l) => (
          <Checkbox
            key={l}
            label={l}
            checked={selLevels.includes(l)}
            onChange={() => toggle(selLevels, setSelLevels, l)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Topics">
        {topics.map((t) => (
          <Checkbox
            key={t}
            label={t}
            checked={selTopics.includes(t)}
            onChange={() => toggle(selTopics, setSelTopics, t)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
};

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4 rounded-[1.35rem] border border-border bg-card/80 p-4 pb-4 last:mb-0">
    <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">{title}</h4>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const Checkbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground">
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
      {checked && (
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-primary-foreground">
          <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    <span className="text-sm">{label}</span>
  </label>
);
