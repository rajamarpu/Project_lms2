import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Layers3,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { courseApi } from "@/api/course.api";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

const Courses = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selLevels, setSelLevels] = useState<string[]>([]);
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [showFilters, setShowFilters] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const navigate = useNavigate();

  const [dbCourses, setDbCourses] = useState<CourseView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAllCourses();
        setDbCourses(res.data.data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setLoadError("The course catalogue could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [reloadKey]);

  const topics = useMemo(() => Array.from(new Set(dbCourses.map((c) => c.category))).sort(), [dbCourses]);

  const filtered = useMemo(() => {
    const result = dbCourses.filter((c) => {
      const instructorName = typeof c.instructor === "object" ? c.instructor?.name : (c.celebrityTeacher || c.instructor || "");
      if (query && !`${c.title} ${instructorName} ${c.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (selLevels.length && !selLevels.includes(c.level)) return false;
      if (selTopics.length && !selTopics.includes(c.category)) return false;
      return true;
    });

    if (sortBy === "Highest Rated") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "Newest") {
      result.sort((a, b) => (String(b.id) > String(a.id) ? 1 : -1));
    } else {
      result.sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0));
    }

    return result;
  }, [dbCourses, query, selLevels, selTopics, sortBy]);

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return dbCourses
      .filter((course) => {
        const instructor = typeof course.instructor === "object" ? course.instructor?.name : course.instructor;
        return `${course.title} ${course.category} ${instructor || course.celebrityTeacher || ""}`.toLowerCase().includes(value);
      })
      .slice(0, 6);
  }, [dbCourses, query]);

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

  const clearAll = () => {
    setSelLevels([]);
    setSelTopics([]);
    setSortBy("Most Popular");
    setQuery("");
  };

  return (
    <div className="container py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Course catalog
            </div>
            <h1 className="brand-heading mt-5 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Explore curated courses built for real learning outcomes.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Search the catalog, compare levels, and jump into the next skill that matches your goals.
            </p>
          </div>
          <Link to="/learning-paths" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/50">
            Browse learning paths
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { value: dbCourses.length, label: "Total courses", icon: BookOpen, tone: "text-primary" },
            { value: filtered.length, label: "Matching filters", icon: Target, tone: "text-secondary" },
            {
              value: dbCourses.length > 0 ? (dbCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / dbCourses.length).toFixed(1) : "0",
              label: "Average rating",
              icon: Star,
              tone: "text-amber-500",
            },
          ].map(({ value, label, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Icon className={`h-5 w-5 ${tone}`} />
              <p className="mt-4 text-2xl font-extrabold text-foreground">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: BadgeCheck, title: "Useful course data", text: "Cards focus on rating, lessons, instructor, and learner demand." },
          { icon: Layers3, title: "Clear sorting", text: "Move between popularity, rating, and newest additions without visual clutter." },
          { icon: Target, title: "Focused filters", text: "Narrow by level and topic while keeping the catalog easy to scan." },
          { icon: Star, title: "Consistent discovery", text: "The full course area now reads like one polished product surface." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="surface-card bg-card/80">
            <Icon className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
            placeholder="Search for AI, Python, Data Science..."
            className="w-full rounded-xl border border-border bg-background pl-12 pr-4 py-3.5 shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          {searchOpen && query.trim() && (
            <div id="course-search-suggestions" role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-overlay)]">
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
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted p-1">
                      {course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-contain" /> : <Search className="m-auto h-full w-5 text-muted-foreground" />}
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
        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground xl:flex xl:items-center">
            <span className="font-semibold text-foreground">{filtered.length}</span>
            <span className="ml-2">courses match your current filters</span>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-outline-teal !px-4 !py-3.5">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
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
          {isLoading ? (
            <div className="flex justify-center p-20">
              <div role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                <span className="sr-only">Loading courses</span>
              </div>
            </div>
          ) : loadError ? (
            <div className="surface-card p-10 text-center" role="alert">
              <p>{loadError}</p>
              <button type="button" className="btn-primary mt-5" onClick={() => { setLoadError(""); setIsLoading(true); setReloadKey((value) => value + 1); }}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card/30 p-16 text-center backdrop-blur-sm">
              <p className="mb-6 text-lg text-muted-foreground">No courses found matching your filters.</p>
              <button onClick={clearAll} className="btn-outline-teal">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 animate-fade-in sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c, i) => (
                <CourseCard key={c.id} course={c} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
