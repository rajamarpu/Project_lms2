import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers3,
  Loader2,
  MapPinned,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { courseApi } from "@/api/course.api";

type PathCourse = { id: string; title: string; duration?: string; level?: string };
type LearningPath = { id: string; slug?: string; title: string; description: string; duration?: string; color?: string; courses?: PathCourse[] };

const roadmapNotes = [
  { title: "Role-based paths", text: "Stack your learning by job family, skill tier, or career outcome." },
  { title: "Milestone visibility", text: "Each path shows checkpoints, momentum, and completion context." },
  { title: "Enterprise planning", text: "Great for cohorts, onboarding programs, and upskilling initiatives." },
];

const LearningPaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await courseApi.getLearningPaths();
        setPaths(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch paths:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaths();
  }, []);

  return (
    <div className="page-shell container py-8 lg:py-10 min-h-[calc(100vh-80px)]">
      <section className="mb-10 overflow-hidden rounded-[2rem] surface-card p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <MapPinned className="h-3.5 w-3.5" /> Career roadmaps
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Follow a path from first lesson to job-ready confidence.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Learning paths organize the catalog into structured journeys so learners can see exactly where they are, what comes next, and how their career track is progressing.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Target, label: "Tracks", value: "Focused" },
              { icon: TrendingUp, label: "Momentum", value: "Visible" },
              { icon: BookOpen, label: "Lessons", value: "Sequenced" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-background/55 p-4">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center rounded-[2rem] border border-dashed border-border p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : paths.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border bg-card/35 p-16 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-lg font-semibold">No learning paths available yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Create courses first to unlock structured journeys and career tracks.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {paths.map((path, idx) => {
            const isOrange = path.color === "orange";
            const accentClass = isOrange ? "from-primary to-secondary" : "from-secondary to-primary";

            return (
              <article
                key={path.id}
                className="surface-card flex flex-col rounded-[2rem] p-6 md:p-8 opacity-0 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${isOrange ? "border-primary/35 bg-primary/10 text-primary" : "border-secondary/35 bg-secondary/10 text-secondary"}`}>
                      Path
                    </span>
                    <h2 className="mt-4 font-display text-2xl font-bold">{path.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{path.description}</p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClass} text-primary-foreground`}>
                    <Layers3 className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Duration</p>
                    <p className="mt-1 text-lg font-semibold">{path.duration || "Self-paced"}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Courses</p>
                    <p className="mt-1 text-lg font-semibold">{path.courses?.length || 0} modules</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {path.courses?.map((c, i) => (
                    <div key={c.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>
                          {i === 0 ? <Sparkles className="h-4 w-4" /> : i + 1}
                        </div>
                        {i < (path.courses?.length || 0) - 1 && <div className={`my-2 w-0.5 flex-1 bg-gradient-to-b ${accentClass}`} style={{ minHeight: "28px" }} />}
                      </div>
                      <Link to={`/learn/${c.id}`} className="group flex-1 pb-5 pt-1">
                        <p className="font-semibold transition-colors group-hover:text-primary">{c.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{c.duration || "4h 30m"} · {c.level || "Beginner"}</p>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-auto rounded-2xl border border-border bg-background/50 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Journey insight</p>
                      <p className="text-sm text-muted-foreground">
                        This path is designed to help learners see a clear route from foundation to advanced practice.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/learning-paths/${path.slug || path.id}`}
                  className="btn-primary mt-6 w-full justify-center"
                >
                  View full roadmap <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      )}

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {roadmapNotes.map(({ title, text }) => (
          <article key={title} className="surface-card rounded-[1.75rem] p-5">
            <p className="font-semibold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default LearningPaths;
