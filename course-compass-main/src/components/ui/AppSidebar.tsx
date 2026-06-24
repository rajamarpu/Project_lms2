import { X, RotateCcw } from "lucide-react";
import { ReactNode } from "react";

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
  onClose?: () => void;
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
  onClose,
}: SidebarProps) => {
  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const sidebarContent = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-bold text-lg text-foreground tracking-wide">All Filters</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={clearAll}
            className="text-xs font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
          {/* Close button only matters on mobile drawer — clearing filters
              and closing the panel are different actions and must not share a button. */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden tap-target -mr-2 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <FilterGroup title="Sort By">
        {sortOptions.map((s) => (
          <label
            key={s}
            className="flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                sortBy === s ? "border-primary" : "border-border group-hover:border-primary/50"
              }`}
            >
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
          <Checkbox key={l} label={l} checked={selLevels.includes(l)} onChange={() => toggle(selLevels, setSelLevels, l)} />
        ))}
      </FilterGroup>

      {topics.length > 0 && (
        <FilterGroup title="Topics">
          {topics.map((t) => (
            <Checkbox key={t} label={t} checked={selTopics.includes(t)} onChange={() => toggle(selTopics, setSelTopics, t)} />
          ))}
        </FilterGroup>
      )}
    </>
  );

  return (
    <>
      {/* Mobile backdrop — tapping outside closes the drawer without clearing filters */}
      {showFilters && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:sticky inset-y-0 left-0 z-50 lg:z-0
          w-[85vw] max-w-[320px] lg:w-full lg:max-w-none
          bg-background lg:bg-transparent
          lg:border-r lg:border-border lg:pr-6
          shrink-0 top-0 lg:top-20
          h-screen lg:h-[calc(100vh-5rem)]
          overflow-y-auto overflow-x-hidden
          p-5 lg:p-0
          transition-transform duration-300 ease-in-out
          shadow-2xl lg:shadow-none
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

const FilterGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-6 pb-6 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
    <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 mb-4">{title}</h4>
    <div className="space-y-1">{children}</div>
  </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group">
    <div
      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
        checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-primary-foreground">
          <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    <span className="text-sm truncate">{label}</span>
  </label>
);
