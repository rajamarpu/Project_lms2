import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { CourseCard } from "@/components/common/CourseCard";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { courseApi } from "@/api/course.api";
import { getApiErrorMessage } from "@/api/client";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

const Courses = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selLevels, setSelLevels] = useState<string[]>([]);
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [showFilters, setShowFilters] = useState(false);

  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await courseApi.getAllCourses();
      setDbCourses(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError(getApiErrorMessage(err, "Couldn't load courses right now."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const topics = useMemo(() => {
    const allTopics = dbCourses.map((c) => c.category).filter(Boolean);
    return Array.from(new Set(allTopics)).sort();
  }, [dbCourses]);

  const filtered = useMemo(() => {
    const result = dbCourses.filter((c) => {
      const instructorName =
        typeof c.instructor === "object" ? c.instructor?.name : c.celebrityTeacher || c.instructor || "";
      if (query && !`${c.title} ${instructorName} ${c.category}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (selLevels.length && !selLevels.includes(c.level as any)) return false;
      if (selTopics.length && !selTopics.includes(c.category)) return false;
      return true;
    });

    if (sortBy === "Highest Rated") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "Newest") {
      result.sort((a, b) => (b.id > a.id ? 1 : -1));
    } else {
      result.sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0));
    }

    return result;
  }, [dbCourses, query, selLevels, selTopics, sortBy]);

  const clearAll = () => {
    setSelLevels([]);
    setSelTopics([]);
    setSortBy("Most Popular");
    setQuery("");
  };

  return (
    <div className="container section-sm">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-responsive-xl mb-2 text-foreground">Explore Courses</h1>
          <p className="text-muted-foreground/80 text-sm md:text-base">Find your next learning adventure</p>
        </div>
      </div>

      {/* Stats bar — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <span className="text-lg md:text-xl font-bold text-primary">{dbCourses.length}</span>
          <span className="text-xs md:text-sm text-muted-foreground">Total courses</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <span className="text-lg md:text-xl font-bold text-secondary">{filtered.length}</span>
          <span className="text-xs md:text-sm text-muted-foreground">Matching</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <span className="text-lg md:text-xl font-bold text-primary">{topics.length}</span>
          <span className="text-xs md:text-sm text-muted-foreground">Categories</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <span className="text-lg md:text-xl font-bold text-secondary">
            {dbCourses.length > 0
              ? (dbCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / dbCourses.length).toFixed(1)
              : "0"}
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">Avg rating</span>
        </div>
      </div>

      <div className="flex gap-3 mb-6 md:mb-8">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for AI, Python, Data Science…"
            aria-label="Search courses"
            className="input-field pl-12"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden btn-outline-teal !px-4"
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-6 lg:gap-10">
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
          onClose={() => setShowFilters(false)}
        />

        {/* Grid */}
        <div className="min-w-0">
          {isLoading ? (
            <LoadingSpinner fullPage label="Loading courses…" />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCourses} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No courses found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <button onClick={clearAll} className="btn-outline-teal">
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid-courses animate-fade-in">
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
