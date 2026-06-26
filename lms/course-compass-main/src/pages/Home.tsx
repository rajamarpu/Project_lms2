import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Layers3,
  PlayCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";

type Enrollment = { courseId: string; progress: number; course: CourseView };

const featuredTracks = [
  {
    title: "AI and Automation",
    description: "Learn prompt workflows, copilots, and practical automation for modern teams.",
    icon: BrainCircuit,
    query: "AI",
  },
  {
    title: "Product Engineering",
    description: "Ship software confidently with frontend, backend, testing, and delivery skills.",
    icon: Layers3,
    query: "Development",
  },
  {
    title: "Leadership and Growth",
    description: "Strengthen communication, execution, and team-ready professional habits.",
    icon: BriefcaseBusiness,
    query: "Business",
  },
];

const platformSignals = [
  { value: "4.9/5", label: "learner satisfaction" },
  { value: "120+", label: "hours of structured content" },
  { value: "100%", label: "certificate verification" },
];

const platformHighlights = [
  {
    icon: Target,
    title: "Guided progression",
    description: "Learning paths move from foundation to applied work with a clear outcome.",
  },
  {
    icon: BadgeCheck,
    title: "Assessments that matter",
    description: "Quizzes, assignments, and reviews are tied to completion and proof of skill.",
  },
  {
    icon: ShieldCheck,
    title: "Learner workspace",
    description: "Bookmarks, notifications, progress, and account settings stay in one place.",
  },
];

const workflowSteps = [
  {
    icon: Search,
    title: "Discover",
    description: "Search by topic, level, instructor, or category and land on the right path faster.",
  },
  {
    icon: PlayCircle,
    title: "Learn",
    description: "Watch lessons, complete assignments, and return to the exact place you left off.",
  },
  {
    icon: GraduationCap,
    title: "Prove",
    description: "Finish with assessments and certificates that can be shared or verified publicly.",
  },
];

const learnerOutcomes = [
  "Personalized dashboard with tracked progress",
  "Saved courses, reminders, and announcements",
  "Embedded flashcards and assessments",
  "Verified certificates after completion",
];

const instructorOutcomes = [
  "Publish structured courses and learning paths",
  "Track completion, engagement, and feedback",
  "Create assignments and assessments quickly",
  "Support cohort updates and learner guidance",
];

const testimonials = [
  {
    quote:
      "This feels like a product we could actually roll out to a team, not just a pretty marketing page.",
    name: "Aarav Mehta",
    role: "Product Analyst",
  },
  {
    quote:
      "The mix of courses, progress, assignments, and certificates gives the platform proper LMS credibility.",
    name: "Nisha Rao",
    role: "Instructional Designer",
  },
  {
    quote:
      "It reads like a training platform that supports both learners and instructors without feeling bloated.",
    name: "Daniel Carter",
    role: "Learning Ops Lead",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<CourseView[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const requests = [courseApi.getAllCourses(), ...(isAuthenticated ? [courseApi.getMyEnrollments()] : [])];

    Promise.all(requests)
      .then(([catalog, enrollmentResponse]) => {
        if (!mounted) return;
        setCourses(catalog.data.data || []);
        setEnrollments(enrollmentResponse?.data?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    return courses
      .filter((course) => {
        const instructor =
          typeof course.instructor === "object"
            ? course.instructor?.name
            : course.instructor || course.celebrityTeacher || "";
        return `${course.title} ${course.category} ${instructor}`.toLowerCase().includes(needle);
      })
      .slice(0, 5);
  }, [courses, query]);

  const popular = useMemo(
    () => [...courses].sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0)).slice(0, 3),
    [courses],
  );

  const recommended = useMemo(
    () =>
      courses
        .filter((course) => !enrollments.some((item) => String(item.courseId) === String(course.id)))
        .slice(0, 3),
    [courses, enrollments],
  );

  const inProgress = enrollments.filter((item) => item.progress < 100).slice(0, 3);
  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category).filter(Boolean))).slice(0, 8),
    [courses],
  );

  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/courses?q=${encodeURIComponent(query.trim())}`);
  };

  const choose = (course: CourseView) => {
    setOpen(false);
    navigate(`/courses/${course.id}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }

    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (value + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (value <= 0 ? suggestions.length - 1 : value - 1));
    }

    if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(suggestions[active]);
    }
  };

  const CourseSection = ({
    title,
    description,
    items,
    action = "/courses",
  }: {
    title: string;
    description: string;
    items: CourseView[];
    action?: string;
  }) => (
    <section className="container py-14 md:py-18">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-eyebrow">Learning catalog</p>
          <h2 className="section-heading mt-2">{title}</h2>
          <p className="section-copy">{description}</p>
        </div>
        <Link to={action} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="skeleton-block h-96" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      ) : (
        <div className="surface-card text-center text-sm text-muted-foreground">
          No published courses are available in this section yet.
        </div>
      )}
    </section>
  );

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-border bg-background text-foreground">
        <div
          className="absolute inset-0 opacity-100"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.10), transparent 22%), radial-gradient(circle at 78% 12%, rgba(99, 102, 241, 0.10), transparent 24%), radial-gradient(circle at 60% 100%, rgba(249, 115, 22, 0.08), transparent 32%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden />

        <div className="container relative grid items-center gap-12 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Modern learning platform
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight brand-heading md:text-7xl">
              One LMS for courses, cohorts, assignments, and certificates.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 brand-body md:text-lg">
              Course Compass is designed like a real platform homepage: clear value, practical learning flows,
              progress tracking, instructor tools, and proof of completion.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {platformSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
                >
                  <p className="text-lg font-extrabold text-foreground">{signal.value}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {signal.label}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={search} className="relative mt-8 max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                  setActive(-1);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded={open && Boolean(query.trim())}
                aria-controls="home-course-suggestions"
                placeholder="Search courses, categories, or instructors"
                className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-28 text-sm text-foreground shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18)] outline-none placeholder:text-muted-foreground focus:border-primary/60"
              />
              <button className="btn-primary absolute right-2 top-2 h-10 !px-4 !py-0" type="submit">
                Search
              </button>

              {open && query.trim() && (
                <div
                  id="home-course-suggestions"
                  role="listbox"
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_28px_70px_-24px_rgba(15,23,42,0.18)]"
                  >
                  {suggestions.length ? (
                    suggestions.map((course, index) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={active === index}
                        key={course.id}
                        onMouseDown={() => choose(course)}
                        className={`flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-0 ${
                          active === index ? "bg-primary/10" : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="h-12 w-16 overflow-hidden rounded-lg bg-muted">
                          {course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{course.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {course.category} · {course.level}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground">No matching courses.</p>
                  )}
                </div>
              )}
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">
                Explore courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/learning-paths" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:bg-muted/50">
                Browse learning paths
              </Link>
            </div>
          </div>

          <aside className="relative z-10">
            <div className="relative overflow-hidden rounded-[2rem] border border-border brand-panel p-6 shadow-[0_32px_80px_-30px_rgba(15,23,42,0.16)]">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
              <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-secondary/10 blur-3xl" aria-hidden />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Learner workspace</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">Everything stays connected</h2>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Weekly focus</p>
                  <p className="mt-1 text-lg font-extrabold text-foreground">7 hours</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-border bg-muted/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Continue learning</p>
                    <p className="mt-1 text-base font-semibold text-foreground">Build a course, lesson plan, and assessment</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">68% done</div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-muted">
                  <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-primary via-secondary to-accent" />
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <Rocket className="h-4 w-4 text-primary" />
                  Resume from the last saved lesson without losing your place.
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                    { title: "Assignments", copy: "Due tomorrow at 8:00 PM", tone: "bg-amber-400" },
                    { title: "Certificate", copy: "Ready after final assessment", tone: "bg-emerald-400" },
                    { title: "Mentor feedback", copy: "New review on your latest submission", tone: "bg-sky-400" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="container py-10">
          <div className="grid gap-4 md:grid-cols-3">
            {platformHighlights.map(({ icon: Icon, title, description }) => (
              <article key={title} className="surface-card bg-card/85">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-18">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="page-eyebrow">Featured tracks</p>
            <h2 className="section-heading mt-2">A homepage that looks like a real training catalog</h2>
            <p className="section-copy">Clear entry points for users who want outcomes, not just a list of links.</p>
          </div>
          <Link to="/learning-paths" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            View paths
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredTracks.map(({ icon: Icon, title, description, query: pathQuery }) => (
            <Link
              key={title}
              to={`/courses?q=${encodeURIComponent(pathQuery)}`}
              className="surface-card group block transition duration-300 hover:-translate-y-1 hover:border-primary/35"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold group-hover:text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Explore track
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {isAuthenticated && inProgress.length > 0 && (
        <CourseSection
          title="Continue learning"
          description="Resume from the lesson where you left off and keep momentum."
          items={inProgress.map((item) => ({ ...item.course, progress: item.progress }))}
          action="/dashboard"
        />
      )}

      <CourseSection
        title="Recommended for you"
        description="Published courses selected from skills you have not enrolled in yet."
        items={recommended}
      />

      <section className="container py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="page-eyebrow">Why it works</p>
            <h2 className="section-heading mt-2">Built like a product teams would trust</h2>
            <p className="section-copy mt-4">
              A good LMS should feel organized, credible, and easy to scan. This layout focuses on the parts
              learners actually care about: direction, progress, proof, and continuity.
            </p>

            <div className="mt-8 space-y-4">
              {workflowSteps.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Step 0{index + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="surface-card">
                <Compass className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-bold">For learners</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {learnerOutcomes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-card">
                <BriefcaseBusiness className="h-6 w-6 text-secondary" />
                <h3 className="mt-4 text-lg font-bold">For instructors</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {instructorOutcomes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="surface-card bg-gradient-to-br from-card via-card to-primary/5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="page-eyebrow">Platform snapshot</p>
                  <h3 className="mt-2 text-2xl font-bold">Designed for growth at every stage</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <Rocket className="h-4 w-4" />
                  Ready to launch
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { value: "120+", label: "hours of learning content" },
                  { value: "40+", label: "interactive assessments" },
                  { value: "100%", label: "certificate verification flow" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-2xl font-extrabold text-foreground">{item.value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseSection
        title="Popular courses"
        description="Courses with the strongest enrollment activity across the platform."
        items={popular}
      />

      {categories.length > 0 && (
        <section className="border-y border-border bg-muted/20">
          <div className="container py-14">
            <div className="mb-7">
              <p className="page-eyebrow">Explore more</p>
              <h2 className="section-heading mt-2">Browse by category</h2>
              <p className="section-copy">Jump directly into the subject area that matches your goal.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/courses?q=${encodeURIComponent(category)}`}
                  className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold shadow-sm transition hover:border-primary hover:text-primary"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container py-14 md:py-18">
        <div className="mb-8 text-center">
          <p className="page-eyebrow">What learners say</p>
          <h2 className="section-heading mt-2">Trusted by people who want measurable progress</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="surface-card">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">"{item.quote}"</p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container pb-8 md:pb-12">
        <div className="rounded-[2rem] border border-border bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <p className="page-eyebrow">Ready to get started</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight brand-heading md:text-4xl">
                  Turn the homepage into a page that feels like a real LMS business.
                </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Start with courses, follow a path, and keep everything connected from first lesson to final
                certificate.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/courses" className="btn-primary">
                Start exploring
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register/role" className="btn-outline-teal">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
