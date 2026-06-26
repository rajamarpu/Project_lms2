import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  FileQuestion,
  Heart,
  Layers3,
  LifeBuoy,
  Lightbulb,
  MapPin,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Ticket,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { CourseCard, type CourseView } from "@/components/common/CourseCard";
import { DashboardSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { courseApi } from "@/api/course.api";
import { platformApi, type NotificationItem, type Preferences, type SupportTicket } from "@/api/platform.api";
import { useAuth } from "@/store/AuthContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

type Enrollment = {
  id: string;
  courseId: string;
  progress: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  lastAccessedAt?: string | null;
  lastLessonId?: string | null;
  lastPositionSeconds?: number | null;
  mentor?: string | null;
  course: CourseView & {
    description?: string;
    lessons?: Array<{ id: string }>;
    instructor?: { name?: string };
    _count?: { lessons?: number; enrollments?: number };
  };
};

type CourseRecord = CourseView & {
  description?: string;
  _count?: { enrollments?: number };
  instructor?: { name?: string };
  lessons?: number | unknown[];
  celebrityTeacher?: string;
};

type Assessment = {
  id: string;
  title: string;
  description?: string;
  attemptLimit: number;
  dueAt?: string | null;
  attempts: { id: string; score?: number; submittedAt?: string }[];
  courseId?: string;
  courseTitle?: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  dueAt?: string | null;
  submissions: { id: string; status: string; submittedAt?: string }[];
  courseId?: string;
  courseTitle?: string;
};

type PaymentRecord = {
  id: string;
  amount: number;
  currency?: string;
  status: string;
  providerRef?: string;
  createdAt: string;
  course?: {
    id: string;
    title: string;
    category?: string;
    thumbnail?: string;
  };
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  courseId?: string | null;
};

type CourseWorkSummary = {
  assessments: Assessment[];
  assignments: Assignment[];
};

const fallbackImage = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

const formatMoney = (amount?: number, currency = "INR") => `${currency} ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Soon");

const statusClass = (status: string) => {
  if (["paid", "issued", "completed", "resolved"].includes(status)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (["pending", "processing", "open", "waiting"].includes(status)) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (["failed", "revoked", "closed"].includes(status)) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  return "bg-primary/10 text-primary border-primary/20";
};

const priorityClass = (priority: string) => {
  if (priority === "urgent") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  if (priority === "high") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (priority === "low") return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  return "bg-primary/10 text-primary border-primary/20";
};

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  to,
  tone = "primary",
  gradient = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper: string;
  to: string;
  tone?: "primary" | "secondary" | "emerald" | "amber" | "slate";
  gradient?: boolean;
}) {
  const toneClass = {
    primary: "text-primary bg-primary/10 border-primary/20",
    secondary: "text-secondary bg-secondary/10 border-secondary/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    slate: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  }[tone];

  return (
    <Link
      to={to}
      className="surface-card group relative overflow-hidden rounded-[1.8rem] p-5 text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
    >
      {gradient && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-secondary/10 blur-3xl" />
        </div>
      )}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="relative z-10 mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="relative z-10 mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="relative z-10 mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
    </Link>
  );
}

function SectionHeader({
  label,
  title,
  description,
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {label && <p className="text-sm font-semibold text-primary">{label}</p>}
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function FeedRow({
  icon: Icon,
  title,
  meta,
  description,
  to,
}: {
  icon: LucideIcon;
  title: string;
  meta?: string;
  description?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-[1.4rem] border border-border bg-background/50 p-4 transition-colors hover:border-primary/30 hover:bg-background/80"
    >
      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate font-semibold">{title}</p>
          {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
        </div>
        {description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [recommended, setRecommended] = useState<CourseRecord[]>([]);
  const [certificates, setCertificates] = useState<Array<{ id: string; status?: string }>>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bookmarks, setBookmarks] = useState<Array<{ courseId: string; course: CourseRecord }>>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [courseWork, setCourseWork] = useState<Record<string, CourseWorkSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        courseApi.getMyEnrollments(),
        courseApi.getAllCourses(),
        platformApi.certificates(),
        platformApi.notifications(),
        platformApi.announcements(),
        platformApi.bookmarks(),
        platformApi.payments(),
        platformApi.supportTickets(),
        platformApi.preferences(),
      ]);

      if (!mountedRef.current) return;

      const enrollmentRows = results[0].status === "fulfilled" ? ((results[0].value.data?.data || []) as Enrollment[]) : [];
      const courseRows = results[1].status === "fulfilled" ? ((results[1].value.data?.data || []) as CourseRecord[]) : [];
      const certificateRows = results[2].status === "fulfilled" ? ((results[2].value.data?.data || []) as Array<{ id: string; status?: string }>) : [];
      const notificationRows = results[3].status === "fulfilled" ? ((results[3].value.data?.data || []) as NotificationItem[]) : [];
      const announcementRows = results[4].status === "fulfilled" ? ((results[4].value.data?.data || []) as Announcement[]) : [];
      const bookmarkRows = results[5].status === "fulfilled" ? ((results[5].value.data?.data || []) as Array<{ courseId: string; course: CourseRecord }>) : [];
      const paymentRows = results[6].status === "fulfilled" ? ((results[6].value.data?.data || []) as PaymentRecord[]) : [];
      const ticketRows = results[7].status === "fulfilled" ? ((results[7].value.data?.data || []) as SupportTicket[]) : [];
      const preferenceRows = results[8].status === "fulfilled" ? ((results[8].value.data?.data || null) as Preferences | null) : null;

      setEnrollments(enrollmentRows);
      setCourses(courseRows);
      setCertificates(certificateRows);
      setNotifications(notificationRows);
      setAnnouncements(announcementRows);
      setBookmarks(bookmarkRows);
      setPayments(paymentRows);
      setTickets(ticketRows);
      setPreferences(preferenceRows);

      const activeEnrollments = enrollmentRows.filter((item) => item.progress < 100 && item.status !== "completed");
      const courseIds = activeEnrollments.slice(0, 3).map((item) => item.courseId);
      if (courseIds.length) {
        const workResponses = await Promise.allSettled(courseIds.map((courseId) => platformApi.courseWork(courseId)));
        if (mountedRef.current) {
          const workState: Record<string, CourseWorkSummary> = {};
          workResponses.forEach((result, index) => {
            if (result.status !== "fulfilled") return;
            const payload = result.value.data?.data as CourseWorkSummary | undefined;
            if (payload) workState[courseIds[index]] = payload;
          });
          setCourseWork(workState);
        }
      } else {
        setCourseWork({});
      }

      const enrolledIds = new Set(enrollmentRows.map((item) => String(item.courseId)));
      const bookmarkIds = new Set(bookmarkRows.map((item) => String(item.courseId)));
      const sortedCourses = [...courseRows].sort((a, b) => {
        const enrollmentsA = a._count?.enrollments ?? 0;
        const enrollmentsB = b._count?.enrollments ?? 0;
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        return enrollmentsB - enrollmentsA || ratingB - ratingA;
      });

      setRecommended(
        sortedCourses.filter((course) => !enrolledIds.has(String(course.id))).slice(0, 6).map((course) => ({
          ...course,
          thumbnail: course.thumbnail || fallbackImage,
          level: course.level || "Beginner",
          rating: course.rating || 0,
          enrollments: course._count?.enrollments || 0,
          lessons: Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessons || 0),
          instructor: course.celebrityTeacher || course.instructor?.name || "Instructor",
          bookmarked: bookmarkIds.has(String(course.id)),
        }))
      );
    } catch {
      if (mountedRef.current) setError("Your learning dashboard could not be loaded. Please retry.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useRefreshOnFocus(fetchDashboardData, [fetchDashboardData]);

  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => item.progress < 100 && item.status !== "completed"),
    [enrollments]
  );
  const completedEnrollments = useMemo(
    () => enrollments.filter((item) => item.progress >= 100 || item.status === "completed"),
    [enrollments]
  );
  const savedCourseIds = useMemo(() => new Set(bookmarks.map((item) => String(item.courseId))), [bookmarks]);
  const unreadNotifications = useMemo(() => notifications.filter((item) => !item.readAt), [notifications]);
  const issuedCertificates = useMemo(
    () => certificates.filter((item) => item.status === "issued" || !item.status),
    [certificates]
  );
  const paidPayments = useMemo(() => payments.filter((item) => item.status === "paid"), [payments]);
  const openTickets = useMemo(
    () => tickets.filter((item) => !["resolved", "closed"].includes(item.status)),
    [tickets]
  );
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => sum + (item.progress || 0), 0) / enrollments.length)
    : 0;
  const mostRecentActive = [...activeEnrollments].sort((a, b) => {
    const aTime = new Date(a.lastAccessedAt || a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.lastAccessedAt || b.updatedAt || b.createdAt).getTime();
    return bTime - aTime || b.progress - a.progress;
  })[0];
  const continueCourse = mostRecentActive || activeEnrollments[0];
  const courseWorkItems = Object.entries(courseWork).flatMap(([courseId, work]) => {
    const course = enrollments.find((item) => item.courseId === courseId)?.course;
    const courseTitle = course?.title || "Your course";
    return [
      ...work.assessments
        .filter((assessment) => assessment.attempts.length < assessment.attemptLimit)
        .map((assessment) => ({
          key: `assessment-${assessment.id}`,
          kind: "assessment" as const,
          title: assessment.title,
          courseTitle,
          courseId,
          dueAt: assessment.dueAt || null,
          meta: `${assessment.attempts.length}/${assessment.attemptLimit} attempts used`,
          icon: FileQuestion,
          to: `/courses/${courseId}/work`,
        })),
      ...work.assignments
        .filter((assignment) => !assignment.submissions.length || assignment.submissions[0]?.status !== "graded")
        .map((assignment) => ({
          key: `assignment-${assignment.id}`,
          kind: "assignment" as const,
          title: assignment.title,
          courseTitle,
          courseId,
          dueAt: assignment.dueAt || null,
          meta: `${assignment.maxPoints} points`,
          icon: Ticket,
          to: `/courses/${courseId}/work`,
        })),
    ];
  });
  const nextTasks = courseWorkItems
    .slice()
    .sort((a, b) => new Date(a.dueAt || "2099-12-31").getTime() - new Date(b.dueAt || "2099-12-31").getTime())
    .slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);
  const recentPayments = payments.slice(0, 3);
  const recentTickets = tickets.slice(0, 3);

  const stats = [
    {
      label: "Active courses",
      value: activeEnrollments.length,
      helper: "Ready to resume",
      icon: PlayCircle,
      to: "/courses",
      tone: "primary" as const,
      gradient: true,
    },
    {
      label: "Completed",
      value: completedEnrollments.length,
      helper: "Finished learning journeys",
      icon: CheckCircle2,
      to: "/certificates",
      tone: "emerald" as const,
    },
    {
      label: "Certificates",
      value: issuedCertificates.length,
      helper: "Issued and verified",
      icon: Award,
      to: "/certificates",
      tone: "amber" as const,
    },
    {
      label: "Saved courses",
      value: savedCourseIds.size,
      helper: "Backlog and wishlist",
      icon: Heart,
      to: "/wishlist",
      tone: "secondary" as const,
    },
    {
      label: "Unread alerts",
      value: unreadNotifications.length,
      helper: "Notifications waiting",
      icon: Bell,
      to: "/notifications",
      tone: "slate" as const,
    },
    {
      label: "Open tickets",
      value: openTickets.length,
      helper: "Support requests in flight",
      icon: LifeBuoy,
      to: "/support",
      tone: "amber" as const,
    },
  ];

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="container py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p role="alert" className="text-lg font-semibold">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button type="button" className="btn-primary mt-6" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_80%_10%,hsl(var(--secondary)/0.18),transparent_28%),linear-gradient(180deg,transparent,transparent_55%,hsl(var(--background)))]" />
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" aria-hidden />

      <div className="container relative py-6 sm:py-8 lg:py-10">
        <section className="mb-8 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <article className="surface-card relative overflow-hidden rounded-[2.4rem] p-6 sm:p-7 md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.12),transparent_28%),radial-gradient(circle_at_88%_12%,hsl(var(--secondary)/0.10),transparent_24%)]" />
            <div className="absolute right-6 top-6 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium learner workspace
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Welcome back, {user?.name || "Learner"}.
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                    A calm, premium command center for your active learning, saved courses, assessments, certificates, and support requests.
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-border bg-background/70 text-primary shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                  {user?.name ? (
                    <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <Lightbulb className="h-7 w-7" />
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    Overall progress
                  </div>
                  <p className="mt-3 text-3xl font-bold">{avgProgress}%</p>
                  <div className="mt-3 h-2 rounded-full bg-muted/70">
                    <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.max(avgProgress, 5)}%` }} />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    Active learning
                  </div>
                  <p className="mt-3 text-3xl font-bold text-foreground">{activeEnrollments.length}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Current in-progress enrollments from the database.</p>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5 text-secondary" />
                    Verified spend
                  </div>
                  <p className="mt-3 text-3xl font-bold">{formatMoney(paidPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0), paidPayments[0]?.currency || "INR")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{paidPayments.length} paid transaction{paidPayments.length === 1 ? "" : "s"} linked to your account.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/courses" className="btn-primary">
                  Browse courses <ArrowRight className="h-4 w-4" />
                </Link>
                {continueCourse && (
                  <Link to={`/learn/${continueCourse.courseId}`} className="btn-outline-teal">
                    Continue learning <PlayCircle className="h-4 w-4" />
                  </Link>
                )}
                <Link to="/support" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-background/80">
                  <LifeBuoy className="h-4 w-4 text-primary" />
                  Get help
                </Link>
              </div>
            </div>
          </article>

          <aside className="grid gap-4">
            <div className="surface-card rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">Current momentum</p>
                  <h2 className="mt-1 font-display text-xl font-semibold">Your learning arc</h2>
                </div>
                <CircleDashed className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-5 flex items-center gap-5">
                <div
                  className="relative flex h-28 w-28 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${avgProgress}%, hsl(var(--muted)) 0)`,
                  }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-background text-center">
                    <div>
                      <p className="text-2xl font-bold">{avgProgress}%</p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">average</p>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next milestone</p>
                    <p className="mt-1 font-semibold">{continueCourse?.course?.title || "Start a course to unlock your next milestone."}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {continueCourse ? `${continueCourse.progress}% complete and ready to resume.` : "Your progress timeline will appear here."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-background/50 p-3">
                      <BadgeCheck className="h-5 w-5 text-emerald-400" />
                      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Certificates</p>
                      <p className="mt-1 text-xl font-bold">{issuedCertificates.length}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/50 p-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Unread</p>
                      <p className="mt-1 text-xl font-bold">{unreadNotifications.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-secondary">Support signal</p>
                  <h2 className="mt-1 font-display text-xl font-semibold">Account activity</h2>
                </div>
                <Ticket className="h-5 w-5 text-secondary" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Tickets</p>
                  <p className="mt-1 text-2xl font-bold">{tickets.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <Layers3 className="h-5 w-5 text-secondary" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Bookmarks</p>
                  <p className="mt-1 text-2xl font-bold">{bookmarks.length}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The learner dashboard now surfaces persisted account activity from the backend, so the UI reflects actual support, reminder, and saved-course state.
              </p>
            </div>
          </aside>
        </section>

        <section aria-label="Learning metrics" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader
                label="Action"
                title="Continue learning"
                description="Resume your most recent course or jump back into the lesson that last received your attention."
                action={
                  <Link to="/courses" className="text-sm font-semibold text-primary">
                    Browse catalog
                  </Link>
                }
              />
              {continueCourse ? (
                <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
                  <img
                    src={continueCourse.course.thumbnail || fallbackImage}
                    alt={continueCourse.course.title}
                    className="h-40 w-full rounded-[1.5rem] object-cover"
                  />
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{continueCourse.course.category || "Course"}</span>
                      <span className="rounded-full bg-secondary/10 px-3 py-1 font-semibold text-secondary">{continueCourse.course.level || "Beginner"}</span>
                      {continueCourse.mentor && <span className="rounded-full bg-muted/60 px-3 py-1 font-semibold text-muted-foreground">Mentor: {continueCourse.mentor}</span>}
                    </div>
                    <h3 className="font-display text-2xl font-bold tracking-tight">{continueCourse.course.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {continueCourse.course.description || "Your resume point is synced with the backend so progress, notes, and next steps stay consistent across devices."}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 rounded-full bg-muted/70">
                        <div className="h-2.5 rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${continueCourse.progress}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-primary">{continueCourse.progress}%</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/learn/${continueCourse.courseId}`} className="btn-primary !py-2.5 text-sm">
                        Resume lesson <PlayCircle className="h-4 w-4" />
                      </Link>
                      <Link to={`/courses/${continueCourse.courseId}`} className="btn-outline-teal !py-2.5 text-sm">
                        View course
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No active courses yet"
                  description="Enroll in a course to unlock a premium continuation panel with your next lesson, progress, and work queue."
                  actionLabel="Find a course"
                  actionTo="/courses"
                />
              )}
            </section>

            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader
                label="Queue"
                title="Assessments and assignments"
                description="Every work item below comes from the backend and reflects what is currently due, pending, or awaiting submission."
                action={
                  <Link to="/learning-paths" className="text-sm font-semibold text-primary">
                    Learning paths
                  </Link>
                }
              />
              {nextTasks.length ? (
                <div className="space-y-3">
                  {nextTasks.map((item) => (
                    <FeedRow
                      key={item.key}
                      icon={item.icon}
                      title={item.title}
                      meta={`${item.courseTitle}${item.dueAt ? ` · Due ${formatDate(item.dueAt)}` : ""}`}
                      description={item.meta}
                      to={item.to}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileQuestion}
                  title="No pending work"
                  description="Published assessments and assignments will appear here when your enrolled courses expose them."
                  actionLabel="Browse courses"
                  actionTo="/courses"
                />
              )}
            </section>

            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader
                label="Discovery"
                title="Recommended courses"
                description="A curated, backend-sourced shortlist based on published courses you have not enrolled in yet."
                action={
                  <Link to="/courses" className="text-sm font-semibold text-primary">
                    See all
                  </Link>
                }
              />
              {recommended.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {recommended.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                  ))}
                </div>
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-border p-10 text-center text-muted-foreground">
                  No additional published courses are available right now.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader label="Alerts" title="Notifications" description="Unread updates from the backend, sorted newest first." />
              <div className="space-y-3">
                {recentNotifications.length ? (
                  recentNotifications.map((item) => (
                    <Link
                      key={item.id}
                      to={item.actionUrl || "/notifications"}
                      className="flex gap-3 rounded-[1.3rem] border border-border bg-background/50 p-4 transition-colors hover:border-primary/30 hover:bg-background/80"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-[1.3rem] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No unread notifications.
                  </p>
                )}
              </div>
              <Link to="/notifications" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open notification center <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader label="Updates" title="Announcements" description="Public platform announcements surfaced directly from the backend." />
              <div className="space-y-3">
                {recentAnnouncements.length ? (
                  recentAnnouncements.map((item) => (
                    <div key={item.id} className="rounded-[1.3rem] border border-border bg-background/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.3rem] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No announcements available.
                  </p>
                )}
              </div>
            </section>

            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader label="Billing" title="Payment snapshot" description="Your latest persisted billing records and access status." />
              <div className="space-y-3">
                {recentPayments.length ? (
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="rounded-[1.3rem] border border-border bg-background/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{payment.course?.title || "Course payment"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{payment.course?.category || "Billing record"}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusClass(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{formatMoney(payment.amount, payment.currency || "INR")}</span>
                        <span className="text-muted-foreground">{formatDate(payment.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.3rem] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No verified payment history yet.
                  </p>
                )}
              </div>
              <Link to="/payments" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open payments <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader label="Support" title="Open tickets" description="Your persisted support requests and service status." />
              <div className="space-y-3">
                {recentTickets.length ? (
                  recentTickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-[1.3rem] border border-border bg-background/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{ticket.subject}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {ticket._count?.messages || 0} message{ticket._count?.messages === 1 ? "" : "s"}
                            {ticket.assignee?.name ? ` · ${ticket.assignee.name}` : ""}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusClass(ticket.status)} ${priorityClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{ticket.status}</span>
                        <span className="text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.3rem] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No support tickets yet.
                  </p>
                )}
              </div>
              <Link to="/support" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open support <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="surface-card rounded-[2.2rem] p-5 sm:p-6">
              <SectionHeader label="Saved" title="Bookmarks" description="Courses you saved for later are backed by the platform bookmark API." />
              <div className="space-y-3">
                {bookmarks.length ? (
                  bookmarks.slice(0, 3).map((bookmark) => (
                    <Link
                      key={bookmark.courseId}
                      to={`/courses/${bookmark.courseId}`}
                      className="flex items-center gap-3 rounded-[1.3rem] border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-background/80"
                    >
                      <img src={bookmark.course.thumbnail || fallbackImage} alt="" className="h-12 w-14 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-sm">{bookmark.course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {bookmark.course.category || "Course"} · {bookmark.course.level || "Beginner"}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-[1.3rem] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No saved courses yet.
                  </p>
                )}
              </div>
              <Link to="/wishlist" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open wishlist <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </section>

        {activeEnrollments.length === 0 && recommended.length === 0 && recentNotifications.length === 0 && (
          <div className="mt-8">
            <EmptyState
              icon={BookOpen}
              title="Your dashboard is ready"
              description="Enroll in a course or open the catalog to populate your learning workspace with backend-sourced activity."
              actionLabel="Explore courses"
              actionTo="/courses"
            />
          </div>
        )}
      </div>
    </div>
  );
}
