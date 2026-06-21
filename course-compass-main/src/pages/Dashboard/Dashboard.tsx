import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, CheckCircle2, Loader2, PlayCircle, UserRound } from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { useAuth } from "@/store/AuthContext";
import { courseApi } from "@/api/course.api";
import { platformApi } from "@/api/platform.api";

type Enrollment = { courseId: string; progress: number; status: string; course: CourseView & { lessons?: unknown[] } };
type CourseRecord = CourseView & { _count?: { enrollments?: number }; instructor?: { name?: string }; celebrityTeacher?: string };

const fallbackImage = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommended, setRecommended] = useState<CourseView[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([courseApi.getMyEnrollments(), courseApi.getAllCourses(), platformApi.certificates()])
      .then(([enrollmentResponse, courseResponse, certificateResponse]) => {
        if (!active) return;
        const current = (enrollmentResponse.data.data || []) as Enrollment[];
        const courses = (courseResponse.data.data || []) as CourseRecord[];
        const enrolledIds = new Set(current.map((item) => item.courseId));
        setEnrollments(current);
        setCertificateCount((certificateResponse.data.data || []).filter((item: { status: string }) => item.status === "issued").length);
        setRecommended(courses.filter((course) => !enrolledIds.has(String(course.id))).slice(0, 6).map((course) => ({ ...course, thumbnail: course.thumbnail || fallbackImage, level: course.level || "Beginner", rating: course.rating || 0, enrollments: course._count?.enrollments || 0, lessons: Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessons || 0), instructor: course.celebrityTeacher || course.instructor?.name || "Instructor" })));
      })
      .catch(() => { if (active) setError("Your learning dashboard could not be loaded. Please retry."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const inProgress = enrollments.filter((item) => item.progress < 100);
  const completed = enrollments.filter((item) => item.progress >= 100 || item.status === "completed");
  const stats = [
    { label: "Courses enrolled", value: enrollments.length, icon: BookOpen },
    { label: "In progress", value: inProgress.length, icon: PlayCircle },
    { label: "Completed", value: completed.length, icon: CheckCircle2 },
    { label: "Certificates", value: certificateCount, icon: Award },
  ];

  if (loading) return <div className="container flex min-h-[55vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading dashboard" /></div>;
  if (error) return <div className="container py-16 text-center"><p role="alert" className="text-muted-foreground">{error}</p><button type="button" className="btn-primary mt-5" onClick={() => window.location.reload()}>Retry</button></div>;

  return <div className="container py-10">
    <header className="mb-10 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-muted">{user?.name ? <span className="text-2xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span> : <UserRound className="h-7 w-7 text-muted-foreground" />}</div><div><p className="text-sm text-muted-foreground">Welcome back</p><h1 className="font-display text-3xl font-bold">{user?.name || "Learner"}</h1></div></header>
    <section aria-label="Learning metrics" className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <article key={label} className="glass-card p-5"><Icon className="mb-3 h-5 w-5 text-primary" /><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></article>)}</section>
    <section className="mb-12"><div className="mb-5 flex items-end justify-between"><div><h2 className="font-display text-2xl font-bold">Continue learning</h2><p className="text-sm text-muted-foreground">Progress comes directly from your completed lessons.</p></div><Link to="/courses" className="text-sm font-semibold text-primary">Browse courses</Link></div>{inProgress.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{inProgress.map((item, index) => <CourseCard key={item.courseId} index={index} course={{ ...item.course, progress: item.progress, thumbnail: item.course.thumbnail || fallbackImage, level: item.course.level || "Beginner", category: item.course.category || "Course", lessons: Array.isArray(item.course.lessons) ? item.course.lessons.length : item.course.lessons }} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-10 text-center"><p className="text-muted-foreground">No courses in progress.</p><Link to="/courses" className="btn-primary mt-5 inline-flex">Find a course</Link></div>}</section>
    <section><h2 className="mb-5 font-display text-2xl font-bold">Recommended courses</h2>{recommended.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{recommended.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No additional published courses are available.</p>}</section>
  </div>;
}
