import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Target,
  ShieldCheck,
} from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { courseApi } from "@/api/course.api";
import { Loader2 } from "lucide-react";

const pillars = [
  { icon: BookOpen, title: "Deep course library", text: "Explore structured programs, roadmaps, and practical lessons built for enterprise learning." },
  { icon: ShieldCheck, title: "Secure progression", text: "Resume learning, track certificates, and keep progress visible across every device." },
  { icon: Target, title: "Goal-oriented paths", text: "Courses, work queues, and certificates keep progress tied to real platform records." },
];

const Home = () => {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<CourseView[]>([]);
  const [publishedCourseCount, setPublishedCourseCount] = useState(0);
  const [featured, setFeatured] = useState<CourseView[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    courseApi
      .getAllCourses()
      .then((res) => {
        const rows = res.data.data || [];
        setCourses(rows);
        setPublishedCourseCount(Number(res.data.meta?.total || rows.length));
        setFeatured(rows.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/courses?q=${encodeURIComponent(query)}`);
  };

  const totalEnrollments = courses.reduce((sum, course) => sum + Number(course._count?.enrollments || course.enrollments || 0), 0);
  const averageRating = courses.length
    ? (courses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / courses.length).toFixed(1)
    : "0.0";
  const topCourse = featured[0];
  const totalLessons = courses.reduce((sum, course) => sum + (Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessons || 0)), 0);
  const highlightStats = [
    { icon: TrendingUp, label: `${publishedCourseCount} published`, value: "Courses from database" },
    { icon: Users, label: `${totalEnrollments} enrollments`, value: "Persisted enrollment count" },
    { icon: Award, label: `${averageRating} avg rating`, value: "From course records" },
    { icon: Zap, label: `${totalLessons} lessons`, value: "Available lesson count" },
  ];

  return (
    <div className="page-shell">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-bg animate-mesh" />
        <div className="aurora-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none" />

        <div className="container relative pb-20 pt-12 md:pb-28 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary opacity-0 animate-fade-in">
                <Sparkles className="h-3.5 w-3.5" /> UptoSkills LMS
              </span>
              <h1 className="font-display text-4xl font-bold leading-tight opacity-0 animate-fade-in md:text-6xl lg:text-7xl" style={{ animationDelay: "100ms" }}>
                Learn like a team.
                <span className="text-gradient block">Perform like a platform.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground opacity-0 animate-fade-in md:text-lg" style={{ animationDelay: "200ms" }}>
                UptoSkills combines curated learning paths, progress tracking, certificates, discussions, and enterprise-ready workflows in one premium workspace.
              </p>

              <form onSubmit={onSearch} className="relative mt-10 max-w-2xl opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses, paths, certificates, or topics"
                  className="w-full rounded-2xl border border-border bg-card/85 py-4 pl-14 pr-36 shadow-[var(--shadow-card)] outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button type="submit" className="btn-primary !rounded-xl !px-5 !py-2.5 text-sm">
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <Link to="/courses" className="btn-primary">
                  Explore courses <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/learning-paths" className="btn-outline-teal">
                  View roadmaps
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="surface-card rounded-[2rem] p-6 text-foreground md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">Live catalog snapshot</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">{topCourse?.title || "Courses loading from the backend"}</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Catalog coverage</span>
                      <span className="font-semibold text-foreground">{publishedCourseCount} courses</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/60">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${publishedCourseCount ? 100 : 4}%` }} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background/50 p-4">
                      <Play className="h-5 w-5 text-primary" />
                      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Featured course</p>
                      <p className="mt-1 font-semibold text-foreground">{topCourse?.title || "No published course yet"}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/50 p-4">
                      <Award className="h-5 w-5 text-secondary" />
                      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Average rating</p>
                      <p className="mt-1 font-semibold text-foreground">{averageRating}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {highlightStats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="surface-card rounded-[1.75rem] p-4 text-foreground">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <article key={title} className="surface-card rounded-[1.75rem] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Trending this week</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Featured learning experiences</h2>
          </div>
          <Link to="/courses" className="hidden text-sm font-semibold text-primary md:inline-flex">View all courses</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        )}
      </section>

      <section className="container pb-16">
        <div className="surface-card overflow-hidden rounded-[2rem] p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-secondary">Enterprise ready</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Built for learners, instructors, and teams.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                The platform already supports dashboards, certificates, reviews, community, and role-aware access. This redesign pushes those capabilities into a cleaner, faster, more premium experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard" className="btn-primary">
                  Open dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/features" className="btn-outline-teal">
                  See platform features
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Progress tracking", "Enrollments, lesson completion, and resume points."],
                ["Certificates", "Verification, gallery, sharing, and milestone visibility."],
                ["Community", "Questions, topics, trends, and contributor recognition."],
                ["Secure access", "JWT auth, role-aware routes, and protected workflows."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-border bg-background/50 p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
