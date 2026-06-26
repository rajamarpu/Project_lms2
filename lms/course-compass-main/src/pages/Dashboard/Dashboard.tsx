import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Layers3,
  Loader2,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { useAuth } from "@/store/AuthContext";
import { courseApi } from "@/api/course.api";
import { platformApi, type NotificationItem } from "@/api/platform.api";
import { deriveLearningTracks } from "@/utils/learningTracks";

type Enrollment = {
  courseId: string;
  progress: number;
  status: string;
  updatedAt?: string;
  course: CourseView & { lessons?: unknown[] };
};

type CourseRecord = CourseView & {
  _count?: { enrollments?: number };
  instructor?: { name?: string };
  celebrityTeacher?: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

const quickActions = [
  {
    title: "Browse courses",
    copy: "Compare the catalog by topic, level, rating, and learner demand.",
    to: "/courses",
    tone: "from-cyan-500/15 to-blue-500/5",
  },
  {
    title: "Open learning paths",
    copy: "Follow a sequenced route from foundations to applied outcomes.",
    to: "/learning-paths",
    tone: "from-orange-500/15 to-amber-500/5",
  },
  {
    title: "Course work",
    copy: "Open assignments and lesson-based study tools inside your active course.",
    to: "/courses",
    tone: "from-teal-500/15 to-cyan-500/5",
  },
  {
    title: "View certificates",
    copy: "Track earned credentials and open verification details quickly.",
    to: "/certificates",
    tone: "from-blue-500/15 to-cyan-500/5",
  },
];

const toDisplayCourse = (course: CourseRecord): CourseView => ({
  ...course,
  thumbnail: course.thumbnail || fallbackImage,
  level: course.level || "Beginner",
  rating: course.rating || 0,
  enrollments: course._count?.enrollments || 0,
  lessons: Array.isArray(course.lessons)
    ? course.lessons.length
    : Number(course.lessons || 0),
  instructor:
    course.celebrityTeacher || course.instructor?.name || "Instructor",
});

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [catalog, setCatalog] = useState<CourseView[]>([]);
  const [recommended, setRecommended] = useState<CourseView[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [activity, setActivity] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      courseApi.getMyEnrollments(),
      courseApi.getAllCourses(),
      platformApi.certificates(),
      platformApi.notifications(),
    ])
      .then(
        ([
          enrollmentResponse,
          courseResponse,
          certificateResponse,
          notificationResponse,
        ]) => {
          if (!active) return;

          const current = (enrollmentResponse.data.data || []) as Enrollment[];
          const courseRows = (courseResponse.data.data || []) as CourseRecord[];
          const mappedCatalog = courseRows.map(toDisplayCourse);
          const enrolledIds = new Set(current.map((item) => String(item.courseId)));

          setCatalog(mappedCatalog);
          setEnrollments(current);
          setCertificateCount(
            (certificateResponse.data.data || []).filter(
              (item: { status: string }) => item.status === "issued",
            ).length,
          );
          setActivity((notificationResponse.data.data || []).slice(0, 5));
          setRecommended(
            mappedCatalog
              .filter((course) => !enrolledIds.has(String(course.id)))
              .sort(
                (left, right) =>
                  (right._count?.enrollments ?? right.enrollments ?? 0) -
                  (left._count?.enrollments ?? left.enrollments ?? 0),
              )
              .slice(0, 3),
          );
        },
      )
      .catch(() => {
        if (active) {
          setError("Your learning dashboard could not be loaded. Please retry.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const inProgress = enrollments.filter((item) => item.progress < 100);
  const completed = enrollments.filter(
    (item) => item.progress >= 100 || item.status === "completed",
  );
  const averageProgress = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (sum, item) => sum + Number(item.progress || 0),
          0,
        ) / enrollments.length,
      )
    : 0;
  const primaryCourse = inProgress[0];
  const featuredTracks = useMemo(
    () => deriveLearningTracks(catalog).slice(0, 3),
    [catalog],
  );

  if (loading) {
    return (
      <div className="container grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Preparing your learning workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell text-center">
        <p role="alert" className="text-muted-foreground">
          {error}
        </p>
        <button
          type="button"
          className="btn-primary mt-5"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="brand-band relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-[var(--shadow-overlay)] md:p-8">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--brand-cyan) 20%, transparent), transparent 22%), radial-gradient(circle at 82% 14%, color-mix(in srgb, var(--brand-orange) 15%, transparent), transparent 22%), radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--brand-blue) 12%, transparent), transparent 30%)",
          }}
        />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                Learner workspace
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-background/70">
                  {user?.avatar ? (
                    <img
                      src={`${
                        import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"
                      }${user.avatar}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : user?.name ? (
                    <span className="text-2xl font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserRound className="h-7 w-7 text-primary" />
                  )}
                </div>
                <div>
                  <p className="page-eyebrow">Welcome back</p>
                  <h1 className="brand-heading mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">
                    {user?.name?.split(" ")[0] || "Learner"}, keep your
                    momentum visible.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    We trimmed the dashboard down to what actually helps:
                    progress, next actions, sequenced tracks, and live learning
                    signals from your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {primaryCourse ? (
                <Link to={`/learn/${primaryCourse.courseId}`} className="btn-primary">
                  Resume learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/courses" className="btn-primary">
                  Find your first course
                </Link>
              )}
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
              >
                Browse catalog
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Courses enrolled",
                value: enrollments.length,
                icon: BookOpen,
                tone: "from-cyan-400/20 to-blue-400/10",
              },
              {
                label: "In progress",
                value: inProgress.length,
                icon: PlayCircle,
                tone: "from-teal-400/20 to-cyan-400/10",
              },
              {
                label: "Completed",
                value: completed.length,
                icon: CheckCircle2,
                tone: "from-orange-400/20 to-amber-400/10",
              },
              {
                label: "Average progress",
                value: `${averageProgress}%`,
                icon: Target,
                tone: "from-blue-400/20 to-cyan-400/10",
              },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className={`rounded-2xl border border-border bg-gradient-to-br ${tone} p-5 backdrop-blur-sm`}
              >
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-5 text-3xl font-extrabold">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.45fr_.95fr]">
        <div className="surface-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-eyebrow">Priority focus</p>
              <h2 className="mt-2 text-xl font-bold">
                {primaryCourse
                  ? primaryCourse.course.title
                  : "Pick the next course to start learning"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {primaryCourse
                  ? "Continue the active course with the highest unfinished progress. Lesson completion updates this bar directly."
                  : "You do not have an active course yet. Start with the catalog or follow a structured path."}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Average progress
              </p>
              <p className="mt-1 text-2xl font-extrabold">{averageProgress}%</p>
            </div>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all"
              style={{ width: `${Math.min(100, averageProgress)}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
            <span>{inProgress.length} active courses right now</span>
            <span>{completed.length} completed</span>
          </div>
          {primaryCourse && (
            <Link
              to={`/learn/${primaryCourse.courseId}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Resume this course
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {[
            {
              label: "Certificates issued",
              value: certificateCount,
              copy: "Verified completions already earned from your account.",
              icon: Trophy,
            },
            {
              label: "Active courses",
              value: inProgress.length,
              copy: "Courses you can open and continue right now.",
              icon: ClipboardCheck,
            },
          ].map(({ label, value, copy, icon: Icon }) => (
            <div key={label} className="surface-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-2xl font-extrabold">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className={`surface-card group bg-gradient-to-br ${item.tone} transition hover:-translate-y-1 hover:border-primary/30`}
          >
            <p className="page-eyebrow">Quick action</p>
            <h2 className="mt-2 text-lg font-bold group-hover:text-primary">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.copy}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-heading">Continue learning</h2>
            <p className="section-copy">
              Only active courses stay here, sorted by your current account
              progress.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Browse courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {inProgress.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {inProgress
              .sort((left, right) => right.progress - left.progress)
              .slice(0, 6)
              .map((item, index) => (
                <CourseCard
                  key={item.courseId}
                  index={index}
                  course={{
                    ...item.course,
                    progress: item.progress,
                    thumbnail: item.course.thumbnail || fallbackImage,
                    level: item.course.level || "Beginner",
                    category: item.course.category || "Course",
                    lessons: Array.isArray(item.course.lessons)
                      ? item.course.lessons.length
                      : item.course.lessons,
                  }}
                />
              ))}
          </div>
        ) : (
          <div className="surface-card text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No courses in progress.</p>
            <Link to="/courses" className="btn-primary mt-5">
              Find a course
            </Link>
          </div>
        )}
      </section>

      {featuredTracks.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="page-eyebrow">Featured tracks</p>
              <h2 className="section-heading">
                Sequenced from the live course catalog
              </h2>
              <p className="section-copy">
                These tracks are assembled from actual published courses, in a
                logical order from prerequisite to advanced study.
              </p>
            </div>
            <Link
              to="/learning-paths"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              View all paths
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredTracks.map((track) => (
              <Link
                key={track.slug}
                to={`/courses?q=${encodeURIComponent(track.query)}`}
                className="surface-card group transition hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Layers3 className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold group-hover:text-primary">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {track.description}
                </p>
                <div className="mt-5 space-y-2">
                  {track.courses.slice(0, 4).map((course, index) => (
                    <div
                      key={course.id}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/50 p-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.level} · {course.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Explore track
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="surface-card">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Assessments and assignments</h2>
              <p className="text-sm text-muted-foreground">
                Open coursework only where you already have active learning in
                motion.
              </p>
            </div>
          </div>
          {primaryCourse ? (
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
              <p className="font-semibold">{primaryCourse.course.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump directly into the course-work center for assessments,
                assignments, and recorded feedback.
              </p>
              <Link
                to={`/courses/${primaryCourse.courseId}/work`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Open coursework
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Enroll in a course to unlock coursework.
            </p>
          )}
        </div>

        <div className="surface-card">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Recent activity</h2>
              <p className="text-sm text-muted-foreground">
                The latest platform notifications tied to your account.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {activity.length ? (
              activity.map((item) => (
                <Link
                  to={item.actionUrl || "/notifications"}
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border p-3 transition hover:bg-muted"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {item.message}
                    </p>
                    <time className="mt-1 block text-[11px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <h2 className="section-heading">Recommended courses</h2>
          <p className="section-copy">
            These are real published courses outside your current enrollments,
            sorted by learner demand.
          </p>
        </div>
        {recommended.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <p className="surface-card text-center text-muted-foreground">
            No additional published courses are available.
          </p>
        )}
      </section>
    </div>
  );
}
