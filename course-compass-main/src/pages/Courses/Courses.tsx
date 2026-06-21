import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Plus, RefreshCw } from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

const Courses = () => {
  const { user } = useAuth();
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

  useEffect(() => { setQuery(params.get("q") ?? ""); }, [params]);

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

  const topics = useMemo(() => {
    const allTopics = dbCourses.map((c) => c.category);
    return Array.from(new Set(allTopics)).sort();
  }, [dbCourses]);

  const filtered = useMemo(() => {
    const result = dbCourses.filter((c) => {
      const instructorName = typeof c.instructor === 'object' ? c.instructor?.name : (c.celebrityTeacher || c.instructor || '');
      if (query && !`${c.title} ${instructorName} ${c.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (selLevels.length && !selLevels.includes(c.level)) return false;
      if (selTopics.length && !selTopics.includes(c.category)) return false;
      return true;
    });

    if (sortBy === "Highest Rated") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Newest") {
      result.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else {
      // Most Popular
      result.sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0));
    }

    return result;
  }, [dbCourses, query, selLevels, selTopics, sortBy]);

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return dbCourses.filter((course) => {
      const instructor = typeof course.instructor === "object" ? course.instructor?.name : course.instructor;
      return `${course.title} ${course.category} ${instructor || course.celebrityTeacher || ""}`.toLowerCase().includes(value);
    }).slice(0, 6);
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

  const clearAll = () => { setSelLevels([]); setSelTopics([]); setSortBy("Most Popular"); setQuery(""); };

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2 text-foreground">Explore Courses</h1>
          <p className="text-muted-foreground/80">Find your next learning adventure</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"><span className="text-xl font-bold text-primary">{dbCourses.length}</span> <span className="text-sm text-muted-foreground">Total courses</span></div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"><span className="text-xl font-bold text-secondary">{filtered.length}</span> <span className="text-sm text-muted-foreground">Matching</span></div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"><span className="text-xl font-bold text-primary">{topics.length}</span> <span className="text-sm text-muted-foreground">Categories</span></div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"><span className="text-xl font-bold text-secondary">{dbCourses.length > 0 ? (dbCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / dbCourses.length).toFixed(1) : '0'}</span> <span className="text-sm text-muted-foreground">Avg rating</span></div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); setActiveSuggestion(-1); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
            onKeyDown={handleSearchKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen && Boolean(query.trim())}
            aria-controls="course-search-suggestions"
            aria-activedescendant={activeSuggestion >= 0 ? `course-suggestion-${activeSuggestion}` : undefined}
            placeholder="Search for AI, Python, Data Science…"
            className="w-full bg-card/50 backdrop-blur-md border border-border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
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
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-outline-teal !px-4 !py-3.5">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
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

        {/* Grid */}
        <div className="min-w-0">
          {isLoading ? (
             <div className="flex justify-center p-20">
               <div role="status"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /><span className="sr-only">Loading courses</span></div>
             </div>
          ) : loadError ? (
            <div className="surface-card p-10 text-center" role="alert"><p>{loadError}</p><button type="button" className="btn-primary mt-5" onClick={() => { setLoadError(""); setIsLoading(true); setReloadKey((value) => value + 1); }}><RefreshCw className="h-4 w-4" />Retry</button></div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
              <p className="text-muted-foreground mb-6 text-lg">No courses found matching your filters.</p>
              <button onClick={clearAll} className="btn-outline-teal">Clear filters</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
              {filtered.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

