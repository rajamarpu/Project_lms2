import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  BookOpen,
  Award,
  Clock3,
  FilterX,
  X,
  DollarSign,
  Star,
} from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { courseApi } from "@/api/course.api";
import { platformApi } from "@/api/platform.api";
import { resolveMediaUrl } from "@/utils/media";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

const Courses = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebounce(query, 300);
  const [selLevels, setSelLevels] = useState<string[]>([]);
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [showFilters, setShowFilters] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [minRating, setMinRating] = useState(0);
  const navigate = useNavigate();
  const [dbCourses, setDbCourses] = useState<CourseView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const fetchCourses = useCallback(async () => {
    try {
      const [coursesRes, bookmarksRes] = await Promise.allSettled([
        courseApi.getAllCourses(),
        platformApi.bookmarks(),
      ]);

      const bookmarks = bookmarksRes.status === "fulfilled" ? new Set((bookmarksRes.value.data.data || []).map((item: { courseId: string }) => String(item.courseId))) : new Set<string>();
      const courses = coursesRes.status === "fulfilled" ? (coursesRes.value.data.data || []) : [];
      setDbCourses(
        courses.map((course: CourseView) => ({
          ...course,
          bookmarked: bookmarks.has(String(course.id)),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  useRefreshOnFocus(fetchCourses, [fetchCourses]);

  const topics = useMemo(() => {
    const allTopics = dbCourses.map((c) => c.category);
    return Array.from(new Set(allTopics)).sort();
  }, [dbCourses]);

  const filtered = useMemo(() => {
    const result = dbCourses.filter((c) => {
      const instructorName = typeof c.instructor === "object" ? c.instructor?.name : (c.celebrityTeacher || c.instructor || "");
      if (debouncedQuery && !`${c.title} ${instructorName} ${c.category}`.toLowerCase().includes(debouncedQuery.toLowerCase())) return false;
      if (selLevels.length && !selLevels.includes(c.level)) return false;
      if (selTopics.length && !selTopics.includes(c.category)) return false;
      if (priceFilter === "free" && c.price && c.price > 0) return false;
      if (priceFilter === "paid" && (!c.price || c.price === 0)) return false;
      if (minRating > 0 && (c.rating || 0) < minRating) return false;
      return true;
    });

    if (sortBy === "Highest Rated") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "Newest") {
      result.sort((a, b) => (String(b.id) > String(a.id) ? 1 : -1));
    } else if (sortBy === "Price: Low to High") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      result.sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0));
    }

    return result;
  }, [dbCourses, debouncedQuery, selLevels, selTopics, sortBy, priceFilter, minRating]);

  const suggestions = useMemo(() => {
    const value = debouncedQuery.trim().toLowerCase();
    if (!value) return [];
    return dbCourses
      .filter((course) => {
        const instructor = typeof course.instructor === "object" ? course.instructor?.name : course.instructor;
        return `${course.title} ${course.category} ${instructor || course.celebrityTeacher || ""}`.toLowerCase().includes(value);
      })
      .slice(0, 6);
  }, [dbCourses, debouncedQuery]);

  const selectSuggestion = (course: CourseView) => {
    setSearchOpen(false);
    navigate(`/courses/${course.id}`);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setActiveSuggestion(-1);
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    }
  };

  const clearAll = useCallback(() => {
    setSelLevels([]);
    setSelTopics([]);
    setSortBy("Most Popular");
    setQuery("");
    setPriceFilter("all");
    setMinRating(0);
  }, []);

  const hasActiveFilters = selLevels.length > 0 || selTopics.length > 0 || query || priceFilter !== "all" || minRating > 0;

  const averageRating = dbCourses.length
    ? (dbCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / dbCourses.length).toFixed(1)
    : "0.0";

  return (
    <div className="page-shell container py-6 sm:py-8 lg:py-10">
      {/* Hero Section */}
      <section className="mb-8 overflow-hidden rounded-[2rem] surface-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Explore the catalog
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
              Discover the next skill that moves your career forward.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Search the catalog, compare course quality, filter by level or topic, and open premium learning experiences built for practical progress.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {[
              { icon: BookOpen, label: "Total courses", value: dbCourses.length },
              { icon: TrendingUp, label: "Matching", value: filtered.length },
              { icon: Award, label: "Categories", value: topics.length },
              { icon: Clock3, label: "Avg rating", value: averageRating },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-background/55 p-3 sm:p-4">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground sm:mt-3">{label}</p>
                <p className="mt-1 text-xl font-bold sm:text-2xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
              setActiveSuggestion(-1);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
            onKeyDown={handleSearchKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen && Boolean(query.trim())}
            aria-controls="course-search-suggestions"
            aria-activedescendant={activeSuggestion >= 0 ? `course-suggestion-${activeSuggestion}` : undefined}
            placeholder="Search for AI, design, leadership, or data skills..."
            className="w-full rounded-2xl border border-border bg-card/85 py-3.5 pl-12 pr-4 shadow-[var(--shadow-card)] outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 sm:py-4"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {searchOpen && query.trim() && (
            <div id="course-search-suggestions" role="listbox" className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-2xl border border-border bg-popover shadow-[var(--shadow-card)]">
              {suggestions.length ? suggestions.map((course, index) => {
                const instructor = typeof course.instructor === "object" ? course.instructor?.name : course.instructor;
                return (
                  <button
                    type="button"
                    id={`course-suggestion-${index}`}
                    role="option"
                    aria-selected={activeSuggestion === index}
                    key={course.id}
                    onMouseDown={() => selectSuggestion(course)}
                    className={`flex w-full items-center gap-3 border-b border-border/60 p-3 text-left last:border-0 ${activeSuggestion === index ? "bg-primary/10" : "hover:bg-muted"}`}
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted p-1">
                      {course.thumbnail ? (
                        <>
                          <img src={resolveMediaUrl(course.thumbnail)} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-md" />
                          <img src={resolveMediaUrl(course.thumbnail)} alt="" className="relative h-full w-full object-contain" />
                        </>
                      ) : <Search className="m-auto h-full w-5 text-muted-foreground" />}
                    </div>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{course.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{course.category} · {instructor || course.celebrityTeacher || "UptoSkills instructor"}</span>
                    </span>
                  </button>
                );
              }) : <p className="p-4 text-sm text-muted-foreground">No matching courses found.</p>}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Price Filter Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card/65 px-1 py-1">
            {(["all", "free", "paid"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPriceFilter(option)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  priceFilter === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "all" ? "All" : option === "free" ? "Free" : "Paid"}
              </button>
            ))}
          </div>

          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-outline-teal !px-4 !py-3">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AppSidebar
          sortBy={sortBy}
          setSortBy={setSortBy}
          selLevels={selLevels}
          setSelLevels={setSelLevels}
          selTopics={selTopics}
          setSelTopics={setSelTopics}
          clearAll={clearAll}
          levels={levels}
          topics={topics}
          showFilters={showFilters}
        />

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{dbCourses.length}</span> courses
            </p>
            {hasActiveFilters && (
              <button onClick={clearAll} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                <FilterX className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </div>

          {/* Rating Filter */}
          {minRating > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Min rating:</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMinRating(i === minRating ? 0 : i + 1)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-4 w-4 ${i < minRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setMinRating(0)} className="text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="Try adjusting your filters or search terms to find what you're looking for."
              actionLabel="Clear filters"
              onAction={clearAll}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
