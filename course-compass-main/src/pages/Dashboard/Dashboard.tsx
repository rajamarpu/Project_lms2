import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, Award, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, Flame, Loader2, PlayCircle, Target, UserRound } from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { useAuth } from "@/store/AuthContext";
import { courseApi } from "@/api/course.api";
import { platformApi, type NotificationItem } from "@/api/platform.api";

type Enrollment = { courseId: string; progress: number; status: string; updatedAt?: string; course: CourseView & { lessons?: unknown[] } };
type CourseRecord = CourseView & { _count?: { enrollments?: number }; instructor?: { name?: string }; celebrityTeacher?: string };
const fallbackImage = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

const calculateStreak = (notifications: NotificationItem[]) => {
  const days = new Set(notifications.map((item) => new Date(item.createdAt).toISOString().slice(0, 10)));
  const cursor = new Date();
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommended, setRecommended] = useState<CourseView[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [activity, setActivity] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([courseApi.getMyEnrollments(), courseApi.getAllCourses(), platformApi.certificates(), platformApi.notifications()])
      .then(([enrollmentResponse, courseResponse, certificateResponse, notificationResponse]) => {
        if (!active) return;
        const current = (enrollmentResponse.data.data || []) as Enrollment[];
        const courses = (courseResponse.data.data || []) as CourseRecord[];
        const enrolledIds = new Set(current.map((item) => String(item.courseId)));
        setEnrollments(current);
        setCertificateCount((certificateResponse.data.data || []).filter((item: { status: string }) => item.status === "issued").length);
        setActivity((notificationResponse.data.data || []).slice(0, 6));
        setRecommended(courses.filter((course) => !enrolledIds.has(String(course.id))).slice(0, 3).map((course) => ({ ...course, thumbnail: course.thumbnail || fallbackImage, level: course.level || "Beginner", rating: course.rating || 0, enrollments: course._count?.enrollments || 0, lessons: Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessons || 0), instructor: course.celebrityTeacher || course.instructor?.name || "Instructor" })));
      })
      .catch(() => { if (active) setError("Your learning dashboard could not be loaded. Please retry."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const inProgress = enrollments.filter((item) => item.progress < 100);
  const completed = enrollments.filter((item) => item.progress >= 100 || item.status === "completed");
  const averageProgress = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + Number(item.progress || 0), 0) / enrollments.length) : 0;
  const streak = useMemo(() => calculateStreak(activity), [activity]);
  const primaryCourse = inProgress[0];
  const stats = [
    { label: "Overall progress", value: `${averageProgress}%`, icon: Target, to: primaryCourse ? `/learn/${primaryCourse.courseId}` : "/courses" },
    { label: "Courses active", value: inProgress.length, icon: PlayCircle, to: "/courses" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, to: "/certificates" },
    { label: "Certificates", value: certificateCount, icon: Award, to: "/certificates" },
  ];

  if (loading) return <div className="container grid min-h-[60vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm text-muted-foreground">Preparing your learning workspace…</p></div></div>;
  if (error) return <div className="page-shell text-center"><p role="alert" className="text-muted-foreground">{error}</p><button type="button" className="btn-primary mt-5" onClick={() => window.location.reload()}>Retry</button></div>;

  return <div className="page-shell">
    <header className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)] md:p-8"><div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" aria-hidden /><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/25 bg-primary/10">{user?.avatar ? <img src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}${user.avatar}`} alt="" className="h-full w-full object-cover" /> : user?.name ? <span className="text-2xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span> : <UserRound className="h-7 w-7 text-primary" />}</div><div><p className="page-eyebrow">Learner workspace</p><h1 className="mt-1 font-display text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Learner"}</h1><p className="mt-2 text-sm text-muted-foreground">Keep your momentum and pick up from your latest progress.</p></div></div>{primaryCourse ? <Link to={`/learn/${primaryCourse.courseId}`} className="btn-primary">Resume learning <ArrowRight className="h-4 w-4" /></Link> : <Link to="/courses" className="btn-primary">Find your first course</Link>}</div></header>

    <section aria-label="Learning metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(({ label, value, icon: Icon, to }) => <Link to={to} key={label} className="surface-card group transition hover:-translate-y-1 hover:border-primary/40"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-foreground group-hover:text-foreground">{label}</p></Link>)}</section>

    <section className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><div className="surface-card"><div className="flex items-center justify-between gap-3"><div><p className="page-eyebrow">Weekly goal</p><h2 className="mt-1 text-xl font-bold">Make progress on active courses</h2></div><Target className="h-6 w-6 text-primary" /></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, averageProgress)}%` }} /></div><div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{averageProgress}% average course progress</span><span>{inProgress.length} active</span></div></div><div className="surface-card"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-500"><Flame className="h-6 w-6" /></div><div><p className="text-sm text-muted-foreground">Learning streak</p><p className="text-2xl font-bold">{streak} day{streak === 1 ? "" : "s"}</p></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Calculated from consecutive days with recorded platform learning activity.</p></div></section>

    <section className="mt-12"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="section-heading">Continue learning</h2><p className="section-copy">Progress comes directly from completed lessons.</p></div><Link to="/courses" className="text-sm font-semibold text-primary">Browse courses</Link></div>{inProgress.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{inProgress.slice(0, 6).map((item, index) => <CourseCard key={item.courseId} index={index} course={{ ...item.course, progress: item.progress, thumbnail: item.course.thumbnail || fallbackImage, level: item.course.level || "Beginner", category: item.course.category || "Course", lessons: Array.isArray(item.course.lessons) ? item.course.lessons.length : item.course.lessons }} />)}</div> : <div className="surface-card text-center"><BookOpen className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-muted-foreground">No courses in progress.</p><Link to="/courses" className="btn-primary mt-5">Find a course</Link></div>}</section>

    <section className="mt-12 grid gap-6 lg:grid-cols-2"><div className="surface-card"><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-primary" /><div><h2 className="text-lg font-bold">Assessments & assignments</h2><p className="text-sm text-muted-foreground">Submit work and review persisted feedback.</p></div></div>{primaryCourse ? <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4"><p className="font-semibold">{primaryCourse.course.title}</p><p className="mt-1 text-sm text-muted-foreground">Open the course-work center for assessments and assignments.</p><Link to={`/courses/${primaryCourse.courseId}/work`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open coursework <ArrowRight className="h-4 w-4" /></Link></div> : <p className="mt-6 text-sm text-muted-foreground">Enroll in a course to access coursework.</p>}</div><div className="surface-card"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary" /><div><h2 className="text-lg font-bold">Learning activity</h2><p className="text-sm text-muted-foreground">Your most recent platform updates.</p></div></div><div className="mt-5 space-y-4">{activity.length ? activity.slice(0, 4).map((item) => <Link to={item.actionUrl || "/notifications"} key={item.id} className="flex gap-3 rounded-xl border border-border p-3 transition hover:bg-muted"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.message}</p><time className="mt-1 block text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</time></div></Link>) : <p className="text-sm text-muted-foreground">No recent activity yet.</p>}</div></div></section>

    <section className="mt-12"><div className="mb-6"><h2 className="section-heading">Recommended courses</h2><p className="section-copy">Published courses outside your current enrollments.</p></div>{recommended.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{recommended.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <p className="surface-card text-center text-muted-foreground">No additional published courses are available.</p>}</section>
  </div>;
}
