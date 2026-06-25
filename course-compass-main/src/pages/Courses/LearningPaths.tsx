import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Clock, Layers, RefreshCw, Sparkles, Target } from "lucide-react";
import { courseApi } from "@/api/course.api";

type PathCourse = { id: string; title: string; duration?: string; level?: string };
type LearningPath = { id: string; slug?: string; title: string; description: string; duration?: string; color?: string; courses?: PathCourse[] };

const palette = {
  blue: "from-cyan-500/15 to-blue-500/5",
  orange: "from-orange-500/15 to-amber-500/5",
  teal: "from-emerald-500/15 to-teal-500/5",
  violet: "from-violet-500/15 to-fuchsia-500/5",
};

const LearningPaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await courseApi.getLearningPaths();
        setPaths(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch paths:", err);
        setError("Learning paths could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaths();
  }, [reloadKey]);

  return (
    <div className="container py-10 min-h-[calc(100vh-80px)]">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-secondary/5 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Learning paths
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Structured journeys from foundation to job-ready skill.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Each path groups the right courses into a clear route so learners can focus on outcomes instead of guessing what to study next.
            </p>
          </div>
          <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/50">
            Explore courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { value: `${paths.length}`, label: "Available paths", icon: Layers },
            { value: `${paths.reduce((sum, path) => sum + (path.courses?.length || 0), 0)}`, label: "Courses mapped", icon: Target },
            { value: "Guided", label: "Learning style", icon: BadgeCheck },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-2xl font-extrabold text-foreground">{value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="surface-card mt-8 p-12 text-center" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn-primary mt-5"
            onClick={() => {
              setError("");
              setIsLoading(true);
              setReloadKey((value) => value + 1);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : paths.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border/50 bg-card/30 p-16 text-center backdrop-blur-sm">
          <p className="mb-6 text-lg text-muted-foreground">
            No learning paths are available yet. Explore individual courses while new journeys are prepared.
          </p>
          <Link to="/courses" className="btn-primary">
            Explore courses
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {paths.map((path, idx) => {
            const isOrange = path.color === "orange";
            const tone = palette[path.color as keyof typeof palette] || palette.violet;

            return (
              <article
                key={path.id}
                className={`surface-card bg-gradient-to-br ${tone} flex flex-col p-7 md:p-8 transition hover:-translate-y-1 hover:border-primary/30`}
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${isOrange ? "border-primary/30 bg-primary/10 text-primary" : "border-secondary/30 bg-secondary/10 text-secondary"}`}>
                      Path roadmap
                    </span>
                    <h2 className="mt-3 text-2xl font-bold">{path.title}</h2>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isOrange ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                    <Layers className="h-7 w-7" />
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">{path.description}</p>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground" />
                    {path.duration || "Self-paced"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-foreground" />
                    {path.courses?.length || 0} courses
                  </span>
                </div>

                <div className="mt-8 space-y-3 flex-1">
                  {path.courses?.map((c, i) => (
                    <div key={c.id} className="flex gap-4 rounded-2xl border border-border bg-card/80 p-4">
                      <div className="flex flex-col items-center">
                        <div className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold ${i === 0 ? (isOrange ? "border-primary bg-primary text-primary-foreground" : "border-secondary bg-secondary text-secondary-foreground") : "border-border bg-background text-muted-foreground"}`}>
                          {i === 0 ? <BadgeCheck className="h-5 w-5" /> : i + 1}
                        </div>
                        {i < (path.courses?.length || 0) - 1 && (
                          <div className={`my-2 w-0.5 flex-1 min-h-[34px] ${isOrange ? "bg-gradient-to-b from-primary/60 to-border" : "bg-gradient-to-b from-secondary/60 to-border"}`} />
                        )}
                      </div>
                      <Link to={`/learn/${c.id}`} className="flex-1 pb-4 pt-1">
                        <p className="font-semibold transition-colors group-hover:text-primary">{c.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{c.duration || "4h 30m"} · {c.level || "Beginner"}</p>
                      </Link>
                    </div>
                  ))}
                </div>

                <Link to={`/learning-paths/${path.id}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-primary/90">
                  View full roadmap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
