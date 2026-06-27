import { type ElementType, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  BookMarked,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  CreditCard,
  Flame,
  GraduationCap,
  Layers3,
  LifeBuoy,
  ListChecks,
  MapPin,
  MessageSquare,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/common/LoadingSkeleton";
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
  course?: {
    title?: string;
    category?: string;
    level?: string;
    thumbnail?: string;
    instructor?: {
      name?: string;
    };
  };
};

type PaymentRecord = {
  id: string;
  amount: number;
  currency?: string;
  status: string;
  createdAt?: string;
};

type CertificateRecord = {
  id: string;
  status?: string;
  issuedAt?: string;
  course?: {
    title?: string;
  };
};

const formatMoney = (amount?: number, currency = "INR") =>
  `${currency} ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (value?: string | null) => {
  if (!value) return "Not started";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
};

const relativeTime = (value?: string | null) => {
  if (!value) return "Just now";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const clampProgress = (value?: number) => Math.max(0, Math.min(100, Math.round(Number(value || 0))));

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  to,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ElementType;
  tone: "blue" | "green" | "red" | "navy";
  to: string;
}) {
  const tones = {
    blue: "from-blue-700 via-blue-500 to-cyan-400",
    green: "from-emerald-600 via-teal-500 to-cyan-400",
    red: "from-rose-600 via-red-500 to-pink-500",
    navy: "from-slate-950 via-blue-900 to-cyan-700",
  };

  return (
    <Link
      to={to}
      aria-label={`Open ${label}`}
      className={`metric-card-premium group bg-gradient-to-br ${tones[tone]} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-6 translate-y-6 rounded-full border border-white/15" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-white/18 p-3 ring-1 ring-white/25 transition group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
          Open <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="metric-card-copy relative">
        <p className="metric-card-label">{label}</p>
        <p className="metric-card-value">{value}</p>
        <p className="metric-card-helper">{helper}</p>
      </div>
    </Link>
  );
}

function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`premium-panel rounded-[2rem] p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="brand-subheading text-xs font-bold uppercase tracking-[0.18em]">{eyebrow}</p>}
          <h2 className="brand-heading mt-1 font-display text-xl font-bold tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function EmptyMini({ title, text, to, label }: { title: string; text: string; to: string; label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-background/45 p-5 text-center">
      <CircleDashed className="mx-auto h-8 w-8 text-primary" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
      <Link to={to} className="btn-primary mt-4 inline-flex !px-4 !py-2 text-sm">
        {label}
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Array<{ courseId: string; course?: { title?: string } }>>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const fetchDashboardData = useCallback(async () => {
    setError("");
    try {
      const criticalResults = await Promise.allSettled([
        courseApi.getMyEnrollments(),
        platformApi.notifications(),
        platformApi.preferences(),
      ]);

      if (!mountedRef.current) return;

      setEnrollments(criticalResults[0].status === "fulfilled" ? (criticalResults[0].value.data?.data || []) : []);
      setNotifications(criticalResults[1].status === "fulfilled" ? (criticalResults[1].value.data?.data || []) : []);
      setPreferences(criticalResults[2].status === "fulfilled" ? (criticalResults[2].value.data?.data || null) : null);
      setLoading(false);

      void Promise.allSettled([
        platformApi.certificates(),
        platformApi.bookmarks(),
        platformApi.payments(),
        platformApi.supportTickets(),
      ]).then((secondaryResults) => {
        if (!mountedRef.current) return;

        setCertificates(secondaryResults[0].status === "fulfilled" ? (secondaryResults[0].value.data?.data || []) : []);
        setBookmarks(secondaryResults[1].status === "fulfilled" ? (secondaryResults[1].value.data?.data || []) : []);
        setPayments(secondaryResults[2].status === "fulfilled" ? (secondaryResults[2].value.data?.data || []) : []);
        setTickets(secondaryResults[3].status === "fulfilled" ? (secondaryResults[3].value.data?.data || []) : []);
      });
    } catch {
      if (mountedRef.current) {
        setError("Your learning dashboard could not be loaded. Please retry.");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useRefreshOnFocus(fetchDashboardData, [fetchDashboardData]);

  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => clampProgress(item.progress) < 100 && item.status !== "completed"),
    [enrollments]
  );
  const completedEnrollments = useMemo(
    () => enrollments.filter((item) => clampProgress(item.progress) >= 100 || item.status === "completed"),
    [enrollments]
  );
  const unreadNotifications = useMemo(() => notifications.filter((item) => !item.readAt), [notifications]);
  const issuedCertificates = useMemo(
    () => certificates.filter((item) => item.status === "issued" || !item.status),
    [certificates]
  );
  const paidPayments = useMemo(() => payments.filter((item) => item.status === "paid"), [payments]);
  const openTickets = useMemo(
    () => tickets.filter((item) => !["closed", "resolved"].includes(item.status?.toLowerCase?.() || "")),
    [tickets]
  );
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => sum + clampProgress(item.progress), 0) / enrollments.length)
    : 0;
  const continueCourse = useMemo(
    () =>
      [...activeEnrollments].sort((a, b) => {
        const aTime = new Date(a.lastAccessedAt || a.updatedAt || a.createdAt).getTime();
        const bTime = new Date(b.lastAccessedAt || b.updatedAt || b.createdAt).getTime();
        return bTime - aTime || clampProgress(b.progress) - clampProgress(a.progress);
      })[0],
    [activeEnrollments]
  );
  const sortedEnrollments = useMemo(
    () =>
      [...enrollments]
        .sort((a, b) => {
          const aTime = new Date(a.lastAccessedAt || a.updatedAt || a.createdAt).getTime();
          const bTime = new Date(b.lastAccessedAt || b.updatedAt || b.createdAt).getTime();
          return bTime - aTime;
        })
        .slice(0, 5),
    [enrollments]
  );
  const activity = useMemo(
    () =>
      [
        ...notifications.map((item) => ({
          id: `notification-${item.id}`,
          title: item.title,
          text: item.message,
          time: item.createdAt,
          icon: Bell,
          to: item.actionUrl || "/notifications",
          tone: "text-primary",
        })),
        ...tickets.map((item) => ({
          id: `ticket-${item.id}`,
          title: item.subject,
          text: `${item.priority || "Normal"} priority support ticket is ${item.status}.`,
          time: item.updatedAt || item.createdAt,
          icon: Ticket,
          to: "/support",
          tone: "text-secondary",
        })),
      ]
        .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
        .slice(0, 5),
    [notifications, tickets]
  );
  const verifiedSpend = paidPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const currency = paidPayments[0]?.currency || "INR";
  const timezone = preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "short" }).format(new Date());
  const currentCourseId = continueCourse?.courseId || sortedEnrollments[0]?.courseId;
  const courseworkPath = currentCourseId ? `/courses/${currentCourseId}/work` : "/courses";

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
    <div className="page-shell relative min-h-[calc(100vh-74px)] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.20),transparent_30%),radial-gradient(circle_at_82%_14%,hsl(var(--secondary)/0.22),transparent_32%),linear-gradient(180deg,hsl(var(--background)/0),hsl(var(--background))_82%)]" />
      <div className="absolute left-12 top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />
      <div className="absolute right-8 top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />

      <main className="container relative py-6 sm:py-8 lg:py-10">
        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
          <article className="surface-card relative overflow-hidden rounded-[2.25rem] p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_90%_8%,hsl(var(--secondary)/0.13),transparent_30%)]" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_300px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    UptoSkills learner cockpit
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {timezone}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {todayLabel}
                  </span>
                </div>

                <h1 className="brand-heading mt-7 max-w-3xl font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Keep learning with a clear next step.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                  Welcome back, {user?.name || "Learner"}. Track active courses, resume lessons, monitor certificates, and keep account support in one production-ready learning workspace.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {continueCourse ? (
                    <Link to={`/learn/${continueCourse.courseId}`} className="btn-primary">
                      Resume {continueCourse.course?.title || "course"} <PlayCircle className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link to="/courses" className="btn-primary">
                      Find your first course <Search className="h-4 w-4" />
                    </Link>
                  )}
                  <Link to="/learning-paths" className="btn-outline-teal">
                    Explore paths <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-5 py-3 text-sm font-bold transition hover:border-primary/30 hover:bg-background">
                    Browse catalog
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-background/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Learning health</p>
                    <p className="mt-1 text-2xl font-black">{avgProgress}%</p>
                  </div>
                  <div
                    className="relative flex h-24 w-24 items-center justify-center rounded-full"
                    style={{ background: `conic-gradient(hsl(var(--primary)) ${avgProgress}%, hsl(var(--muted)) 0)` }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background">
                      <Target className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active courses</span>
                    <span className="font-bold">{activeEnrollments.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-bold">{completedEnrollments.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Unread updates</span>
                    <span className="font-bold">{unreadNotifications.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="surface-card rounded-[2.25rem] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-primary to-secondary text-xl font-black text-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || <GraduationCap className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <h2 className="font-display text-2xl font-black">{user?.name || "Learner"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || "Learning account"}</p>
              </div>
            </div>
              <div className="mt-6 rounded-[1.5rem] border border-border bg-background/70 p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-bold">Account ready</p>
                  <p className="text-sm text-muted-foreground">Progress syncs when courses, payments, and support records update.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/certificates" className="rounded-[1.25rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5">
                <Award className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-black">{issuedCertificates.length}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Certificates</p>
              </Link>
              <Link to="/support" className="rounded-[1.25rem] border border-border bg-background/55 p-4 transition hover:border-secondary/35 hover:bg-secondary/5">
                <LifeBuoy className="h-5 w-5 text-secondary" />
                <p className="mt-3 text-2xl font-black">{openTickets.length}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Open tickets</p>
              </Link>
            </div>
          </aside>
        </section>

        <section className="metric-symmetry-grid mt-6">
          <MetricCard to={currentCourseId ? `/learn/${currentCourseId}` : "/courses"} label="Overall Progress" value={`${avgProgress}%`} helper={`${enrollments.length} enrolled course${enrollments.length === 1 ? "" : "s"} tracked from your account.`} icon={TrendingUp} tone="blue" />
          <MetricCard to={currentCourseId ? `/learn/${currentCourseId}` : "/courses"} label="Active Learning" value={activeEnrollments.length} helper="Courses currently in progress and ready to continue." icon={BookOpen} tone="green" />
          <MetricCard to="/certificates" label="Verified Certificates" value={issuedCertificates.length} helper="Issued credentials available from your certificate wallet." icon={BadgeCheck} tone="red" />
          <MetricCard to="/payments" label="Verified Spend" value={formatMoney(verifiedSpend, currency)} helper={`${paidPayments.length} successful payment${paidPayments.length === 1 ? "" : "s"} recorded.`} icon={Wallet} tone="navy" />
        </section>

        <section className="dashboard-pair-grid mt-6">
          <div className="dashboard-main-stack">
            <Panel
              title="Continue learning"
              eyebrow="Course workspace"
              action={
                <Link to="/courses" className="text-sm font-bold text-primary hover:underline">
                  View catalog
                </Link>
              }
            >
              {sortedEnrollments.length ? (
                <div className="dashboard-card-list">
                  {sortedEnrollments.map((item) => {
                    const progress = clampProgress(item.progress);
                    const isComplete = progress >= 100 || item.status === "completed";
                    return (
                      <Link
                        key={item.id}
                        to={`/learn/${item.courseId}`}
                        className="group grid gap-4 rounded-[1.5rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5 md:grid-cols-[minmax(0,1fr)_180px_auto]"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                              {item.course?.category || item.course?.level || "Course"}
                            </span>
                            <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">
                              {isComplete ? "Completed" : "In progress"}
                            </span>
                          </div>
                          <h3 className="mt-3 truncate font-display text-lg font-bold">{item.course?.title || "Untitled course"}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.course?.instructor?.name ? `Mentor: ${item.course.instructor.name}` : `Last activity: ${formatDate(item.lastAccessedAt || item.updatedAt || item.createdAt)}`}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold">{progress}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.max(progress, 4)}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background transition group-hover:bg-primary group-hover:text-primary-foreground">
                            {isComplete ? "Review" : "Resume"} <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyMini title="No active courses yet" text="Enroll in a course and your learning plan, progress, and next action will appear here." to="/courses" label="Browse courses" />
              )}
            </Panel>

            <Panel
              title="Learning activity"
              eyebrow="Realtime feed"
              action={
                <Link to="/notifications" className="text-sm font-bold text-primary hover:underline">
                  Open center
                </Link>
              }
            >
              {activity.length ? (
                <div className="dashboard-card-list">
                  {activity.map((item) => (
                    <Link key={item.id} to={item.to} className="flex gap-3 rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-primary/30 hover:bg-primary/5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted">
                        <item.icon className={`h-5 w-5 ${item.tone}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate font-bold">{item.title}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(item.time)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyMini title="No recent activity" text="Notifications, ticket changes, and learning updates will appear here as they happen." to="/courses" label="Explore courses" />
              )}
            </Panel>
          </div>

          <div className="dashboard-side-stack">
            <Panel title="Today's priorities" eyebrow="Action queue">
              <div className="dashboard-card-list">
                <Link to="/notifications" className="flex items-center justify-between rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5">
                  <span className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <span>
                      <span className="block font-bold">Unread updates</span>
                      <span className="text-sm text-muted-foreground">Announcements and account alerts</span>
                    </span>
                  </span>
                  <span className="text-2xl font-black">{unreadNotifications.length}</span>
                </Link>
                <Link to="/courses" className="flex items-center justify-between rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-secondary/35 hover:bg-secondary/5">
                  <span className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-secondary" />
                    <span>
                      <span className="block font-bold">Resume streak</span>
                      <span className="text-sm text-muted-foreground">Continue your latest course</span>
                    </span>
                  </span>
                  <span className="text-2xl font-black">{continueCourse ? `${clampProgress(continueCourse.progress)}%` : "0%"}</span>
                </Link>
                <Link to="/wishlist" className="flex items-center justify-between rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5">
                  <span className="flex items-center gap-3">
                    <BookMarked className="h-5 w-5 text-primary" />
                    <span>
                      <span className="block font-bold">Saved courses</span>
                      <span className="text-sm text-muted-foreground">Shortlisted learning options</span>
                    </span>
                  </span>
                  <span className="text-2xl font-black">{bookmarks.length}</span>
                </Link>
              </div>
            </Panel>

            <Panel title="Account operations" eyebrow="Payments & support">
              <div className="dashboard-card-list">
                <Link to="/payments" className="rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 font-bold">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payments
                    </span>
                    <span className="text-xl font-black">{formatMoney(verifiedSpend, currency)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{paidPayments.length} successful transaction{paidPayments.length === 1 ? "" : "s"} available for review.</p>
                </Link>
                <Link to="/support" className="rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-secondary/35 hover:bg-secondary/5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 font-bold">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                      Support
                    </span>
                    <span className="text-xl font-black">{openTickets.length}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Open requests connected to your learner account.</p>
                </Link>
                <Link to={courseworkPath} className="rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 font-bold">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Coursework
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Open assessments and assignments for your current course.</p>
                </Link>
              </div>
            </Panel>
          </div>
        </section>

        <section className="dashboard-triple-grid mt-6">
          <Panel
            title="Credential wallet"
            eyebrow="Certificates"
            action={
              <Link to="/certificates" className="text-sm font-bold text-primary hover:underline">
                View all
              </Link>
            }
          >
            {issuedCertificates.length ? (
              <div className="dashboard-card-list">
                {issuedCertificates.slice(0, 4).map((item) => (
                  <Link key={item.id} to="/certificates" className="flex items-center gap-3 rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-secondary/35 hover:bg-secondary/5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{item.course?.title || "UptoSkills certificate"}</p>
                      <p className="text-sm text-muted-foreground">Issued {formatDate(item.issuedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyMini title="No certificates yet" text="Complete a course to unlock verified credentials in this wallet." to="/courses" label="Start learning" />
            )}
          </Panel>

          <Panel title="Learning plan" eyebrow="Milestones">
            <div className="space-y-4">
              {[
                { label: "Enroll in a course", done: enrollments.length > 0 },
                { label: "Reach 50% average progress", done: avgProgress >= 50 },
                { label: "Complete a course", done: completedEnrollments.length > 0 },
                { label: "Earn a certificate", done: issuedCertificates.length > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.done ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}`}>
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                  </div>
                  <span className={`font-semibold ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Saved learning pipeline" eyebrow="Wishlist">
            {bookmarks.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {bookmarks.slice(0, 4).map((item) => (
                  <Link key={item.courseId} to={`/courses/${item.courseId}`} className="rounded-[1.35rem] border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:bg-primary/5">
                    <Star className="h-5 w-5 text-primary" />
                    <p className="mt-3 truncate font-bold">{item.course?.title || "Saved course"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Review this course from your saved list.</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyMini title="No saved courses" text="Save interesting courses to build a personal learning pipeline." to="/courses" label="Browse catalog" />
            )}
          </Panel>
        </section>
      </main>
    </div>
  );
}
