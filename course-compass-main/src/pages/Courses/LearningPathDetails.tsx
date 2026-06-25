import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Layers, Map, PlayCircle, ChevronLeft, Target } from "lucide-react";
import { courseApi } from "@/api/course.api";
import type { CourseView } from "@/components/common/CourseCard";

type CourseRecord = CourseView & {
  description?: string;
  celebrityTeacher?: string;
  instructor?: { name?: string };
  _count?: { enrollments?: number };
};

type DisplayCourse = Omit<CourseView, "instructor" | "lessons" | "enrollments"> & {
  description?: string;
  instructor: string;
  lessons: number;
  enrollments: string;
};

const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export default function LearningPathDetails() {
  const { id } = useParams<{ id: string }>();
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAllCourses();
        const mapped = (res.data.data as CourseRecord[]).map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.celebrityTeacher || course.instructor?.name || "Instructor",
          category: course.category,
          level: course.level || "Beginner",
          thumbnail: course.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
          lessons: Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessons || 0),
          duration: course.duration || "Self-paced",
          rating: course.rating || 0,
          enrollments: String(course._count?.enrollments ?? 0),
        }));

        const matched = mapped.filter((course) => slugify(course.category) === id);
        if (!active) return;

        setCourses(matched);
        setCategoryName(matched[0]?.category || "");
      } catch (error) {
        console.error("Failed to fetch learning path", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchCourses();
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-20 min-h-[calc(100vh-80px)] grid place-items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="container py-20 min-h-[calc(100vh-80px)]">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/60 bg-card/80 p-10 text-center shadow-[var(--shadow-soft)]">
          <Map className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
          <h2 className="text-2xl font-bold">Path Not Found</h2>
          <p className="mt-2 text-muted-foreground">We could not find any courses for this learning path.</p>
          <Link to="/learning-paths" className="btn-primary mt-6 inline-flex items-center gap-2">
            Browse all paths
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14 min-h-[calc(100vh-80px)] max-w-6xl">
      <Link to="/learning-paths" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to learning paths
      </Link>

      <div className="brand-band mt-6 overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-overlay)]">
        <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_.8fr] md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Target className="h-4 w-4" />
              Career roadmap
            </div>
            <h1 className="brand-heading mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
              {categoryName} learning path
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Follow a curated sequence of courses designed to build confidence, skill depth, and practical job-ready knowledge.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Total courses</p>
                <p className="mt-1 text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Estimated time</p>
                <p className="mt-1 text-2xl font-bold">{courses.length * 4} weeks</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-border bg-background/70 p-4">
            {[
              { icon: Layers, title: "Structured flow", copy: "Foundation, learning, and completion all in one path." },
              { icon: PlayCircle, title: "Course-first learning", copy: "Each step opens the next relevant course in sequence." },
              { icon: CheckCircle2, title: "Completion focused", copy: "Build toward real outcomes with verified learning milestones." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {courses.map((course, index) => (
          <article key={course.id} className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/80 shadow-[var(--shadow-soft)]">
            <div className="grid lg:grid-cols-[360px_1fr]">
              <div className="relative min-h-[240px] bg-muted">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-foreground backdrop-blur-sm">
                  Step {index + 1}
                </div>
                <div className="absolute bottom-5 left-5 rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{course.level}</p>
                  <p className="mt-1 text-sm font-semibold">{course.duration}</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1">{course.category}</span>
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1">{course.enrollments} learners</span>
                </div>

                <h2 className="mt-4 text-3xl font-bold font-display tracking-tight">{course.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                  {course.description}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Lessons</p>
                    <p className="mt-2 text-2xl font-bold">{course.lessons}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Instructor</p>
                    <p className="mt-2 text-lg font-semibold">{course.instructor}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Duration</p>
                    <p className="mt-2 text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {course.duration}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link to={`/courses/${course.id}`} className="btn-primary inline-flex items-center gap-2">
                    Open course
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-[1.75rem] border border-border/60 bg-card/80 p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="page-eyebrow">Outcome</p>
            <h2 className="mt-2 text-2xl font-bold">Career ready from foundation to finish</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete this path to build real momentum and move toward applied projects and interviews.
            </p>
          </div>
          <Link to="/dashboard" className="btn-outline-teal inline-flex items-center gap-2">
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
