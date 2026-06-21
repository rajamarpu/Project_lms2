import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Award, BookOpenCheck, BrainCircuit, BriefcaseBusiness, Code2, Compass, Search, ShieldCheck, Sparkles, Target, UsersRound } from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";

type Enrollment = { courseId: string; progress: number; course: CourseView };

const pathCards = [
  { title: "AI & Data", description: "Build practical foundations in Python, data, and intelligent systems.", icon: BrainCircuit, query: "AI" },
  { title: "Software Engineering", description: "Move from programming fundamentals to production applications.", icon: Code2, query: "Development" },
  { title: "Career & Business", description: "Strengthen business, leadership, and workplace-ready skills.", icon: BriefcaseBusiness, query: "Business" },
];

const benefits = [
  { icon: Target, title: "Structured progress", description: "Resume where you stopped and see completion update from real lesson activity." },
  { icon: UsersRound, title: "Expert-led learning", description: "Learn through managed courses, assignments, assessments, and instructor feedback." },
  { icon: Award, title: "Verified outcomes", description: "Earn credentials that can be previewed, printed, shared, and publicly verified." },
  { icon: ShieldCheck, title: "Learning you control", description: "Persistent preferences, bookmarks, notifications, and account security in one place." },
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
    Promise.all(requests).then(([catalog, enrollmentResponse]) => {
      if (!mounted) return;
      setCourses(catalog.data.data || []);
      setEnrollments(enrollmentResponse?.data?.data || []);
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return courses.filter((course) => `${course.title} ${course.category} ${typeof course.instructor === "object" ? course.instructor?.name : course.instructor || course.celebrityTeacher || ""}`.toLowerCase().includes(needle)).slice(0, 5);
  }, [courses, query]);
  const popular = useMemo(() => [...courses].sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0)).slice(0, 3), [courses]);
  const recommended = useMemo(() => courses.filter((course) => !enrollments.some((item) => String(item.courseId) === String(course.id))).slice(0, 3), [courses, enrollments]);
  const inProgress = enrollments.filter((item) => item.progress < 100).slice(0, 3);
  const categories = useMemo(() => Array.from(new Set(courses.map((course) => course.category).filter(Boolean))).slice(0, 8), [courses]);

  const search = (event: FormEvent) => { event.preventDefault(); navigate(`/courses?q=${encodeURIComponent(query.trim())}`); };
  const choose = (course: CourseView) => { setOpen(false); navigate(`/courses/${course.id}`); };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { setOpen(false); setActive(-1); }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive((value) => (value + 1) % suggestions.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((value) => value <= 0 ? suggestions.length - 1 : value - 1); }
    if (event.key === "Enter" && active >= 0) { event.preventDefault(); choose(suggestions[active]); }
  };

  const CourseSection = ({ title, description, items, action = "/courses" }: { title: string; description: string; items: CourseView[]; action?: string }) => <section className="container py-12 md:py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h2 className="section-heading">{title}</h2><p className="section-copy">{description}</p></div><Link to={action} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">View all <ArrowRight className="h-4 w-4" /></Link></div>{loading ? <div className="grid gap-6 md:grid-cols-3">{[0,1,2].map((item) => <div key={item} className="skeleton-block h-96" />)}</div> : items.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <div className="surface-card text-center text-sm text-muted-foreground">No published courses are available in this section yet.</div>}</section>;

  return <div className="pb-12">
    <section className="relative overflow-hidden border-b border-border"><div className="absolute inset-0 gradient-mesh-bg opacity-80" aria-hidden /><div className="container relative grid items-center gap-12 py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-28"><div><span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary"><Sparkles className="h-4 w-4" /> Learn with direction</span><h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">Build skills that move your <span className="text-gradient">career forward.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">Discover structured courses, practical assignments, expert guidance, and verified credentials in one connected learning workspace.</p><form onSubmit={search} className="relative mt-8 max-w-2xl"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(-1); }} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onKeyDown={onKeyDown} role="combobox" aria-expanded={open && Boolean(query.trim())} aria-controls="home-course-suggestions" placeholder="What do you want to learn?" className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-28 text-sm shadow-[var(--shadow-elevated)] outline-none focus:border-primary" /><button className="btn-primary absolute right-2 top-2 h-10 !px-4 !py-0" type="submit">Search</button>{open && query.trim() && <div id="home-course-suggestions" role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-[var(--shadow-overlay)]">{suggestions.length ? suggestions.map((course, index) => <button type="button" role="option" aria-selected={active === index} key={course.id} onMouseDown={() => choose(course)} className={`flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-0 ${active === index ? "bg-primary/10" : "hover:bg-muted"}`}><div className="h-12 w-16 overflow-hidden rounded-lg bg-muted">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />}</div><span><span className="block text-sm font-semibold">{course.title}</span><span className="text-xs text-muted-foreground">{course.category} · {course.level}</span></span></button>) : <p className="p-4 text-sm text-muted-foreground">No matching courses.</p>}</div>}</form><div className="mt-5 flex flex-wrap gap-3"><Link to="/courses" className="btn-primary">Explore courses <ArrowRight className="h-4 w-4" /></Link><Link to="/learning-paths" className="btn-outline-teal">Browse learning paths</Link></div></div><aside className="surface-card relative overflow-hidden"><div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/15 blur-3xl" aria-hidden /><p className="page-eyebrow">Your learning workspace</p><h2 className="mt-3 text-2xl font-bold">Everything stays connected</h2><div className="mt-6 space-y-4">{[[BookOpenCheck,"Structured courses","Lessons, progress, assessments and assignments"],[Compass,"Personal direction","Bookmarks, recommendations and learning paths"],[Award,"Verified achievement","Certificates with public verification"]].map(([Icon,title,copy]) => { const C = Icon as typeof BookOpenCheck; return <div key={String(title)} className="flex gap-3 rounded-xl border border-border bg-background/50 p-4"><C className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{String(copy)}</p></div></div>; })}</div></aside></div></section>

    {isAuthenticated && inProgress.length > 0 && <CourseSection title="Continue learning" description="Resume from your latest saved lesson progress." items={inProgress.map((item) => ({ ...item.course, progress: item.progress }))} action="/dashboard" />}
    <CourseSection title="Recommended for you" description="Published courses selected from skills you have not enrolled in yet." items={recommended} />
    <CourseSection title="Popular courses" description="Courses with the strongest enrollment activity across the platform." items={popular} />

    <section className="container py-12 md:py-16"><div className="mb-8"><p className="page-eyebrow">Guided development</p><h2 className="section-heading mt-2">Learning paths</h2><p className="section-copy">Follow a clearer sequence from foundation to practical capability.</p></div><div className="grid gap-5 lg:grid-cols-3">{pathCards.map(({ icon: Icon, title, description, query: pathQuery }) => <Link key={title} to={`/courses?q=${encodeURIComponent(pathQuery)}`} className="surface-card group block transition hover:-translate-y-1 hover:border-primary/40"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-bold group-hover:text-primary">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore path <ArrowRight className="h-4 w-4" /></span></Link>)}</div></section>

    {categories.length > 0 && <section className="border-y border-border bg-muted/20"><div className="container py-12"><div className="mb-7"><h2 className="section-heading">Explore by category</h2><p className="section-copy">Jump directly into the subject area that matches your goal.</p></div><div className="flex flex-wrap gap-3">{categories.map((category) => <Link key={category} to={`/courses?q=${encodeURIComponent(category)}`} className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold shadow-sm transition hover:border-primary hover:text-primary">{category}</Link>)}</div></div></section>}

    <section className="container py-12 md:py-16"><div className="mb-8 text-center"><p className="page-eyebrow">Built for meaningful progress</p><h2 className="section-heading mt-2">A complete learning experience</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({ icon: Icon, title, description }) => <article key={title} className="surface-card"><Icon className="h-6 w-6 text-primary" /><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></article>)}</div></section>
  </div>;
}
