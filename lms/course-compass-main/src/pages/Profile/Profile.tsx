import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Camera,
  CheckCircle2,
  Heart,
  Layers3,
  Loader2,
  Lock,
  Mail,
  PlayCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/AuthContext";
import { profileApi } from "@/api/profile.api";
import { courseApi } from "@/api/course.api";
import { platformApi, type NotificationItem } from "@/api/platform.api";
import { apiErrorMessage } from "@/utils/apiError";
import { LearnerMetricCard } from "@/components/common/LearnerMetricCard";

type CourseView = {
  id: string;
  title: string;
  category: string;
  level: string;
  thumbnail?: string;
  progress?: number;
  duration?: string;
  lessons?: number | unknown[];
  celebrityTeacher?: string;
  instructor?: { name?: string } | string;
  _count?: { enrollments?: number };
};

type Enrollment = {
  courseId: string;
  progress: number;
  status: string;
  lastAccessedAt?: string;
  mentor?: string;
  course: CourseView;
};

type Certificate = {
  id: string;
  verificationId: string;
  courseId: string;
  issuedAt?: string;
  status: string;
  course: { title: string };
};

type Bookmark = {
  id: string;
  courseId: string;
  course: CourseView;
};

const emptyAvatar = "https://ui-avatars.com/api/?name=UptoSkills&background=0ea5e9&color=fff&bold=true";

const formatDate = (value?: string, fallback = "-") => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleDateString();
};

const formatDateTime = (value?: string, fallback = "-") => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleString();
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [learningStats, setLearningStats] = useState({ enrolled: 0, completed: 0, averageProgress: 0 });
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [infoBusy, setInfoBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setBio(user?.bio || "");
  }, [user?.bio, user?.name]);

  useEffect(() => {
    let active = true;

    Promise.all([
      courseApi.getMyEnrollments(),
      platformApi.certificates(),
      platformApi.notifications(),
      platformApi.bookmarks(),
    ])
      .then(([enrollmentResponse, certificateResponse, notificationResponse, bookmarkResponse]) => {
        if (!active) return;

        const rawEnrollments = (enrollmentResponse.data.data || []) as Enrollment[];
        const completed = rawEnrollments.filter((item) => item.progress >= 100 || item.status === "completed").length;
        const averageProgress = rawEnrollments.length
          ? Math.round(rawEnrollments.reduce((sum, item) => sum + Number(item.progress || 0), 0) / rawEnrollments.length)
          : 0;

        setEnrollments(rawEnrollments);
        setLearningStats({ enrolled: rawEnrollments.length, completed, averageProgress });
        setCertificates((certificateResponse.data.data || []).filter((item: Certificate) => item.status === "issued"));
        setNotifications((notificationResponse.data.data || []).slice(0, 10));
        setBookmarks(bookmarkResponse.data.data || []);
      })
      .catch((error) => {
        if (active) setLoadError(apiErrorMessage(error, "Profile data could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.readAt).length, [notifications]);
  const streak = useMemo(() => {
    const dates = new Set(notifications.map((item) => new Date(item.createdAt).toISOString().slice(0, 10)));
    const cursor = new Date();
    if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [notifications]);

  const activeEnrollments = enrollments.filter((item) => item.progress < 100);
  const completedEnrollments = enrollments.filter((item) => item.progress >= 100 || item.status === "completed");
  const recentCertificate = certificates[0];
  const profileImage = user?.avatar ? `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}${user.avatar}` : emptyAvatar;

  const handleSaveInfo = async (event: React.FormEvent) => {
    event.preventDefault();
    setInfoBusy(true);
    try {
      const response = await profileApi.updateProfile({ name, bio });
      updateUser({ name: response.data.data.name, bio: response.data.data.bio });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to update profile."));
    } finally {
      setInfoBusy(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be under 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarBusy(true);
    try {
      const response = await profileApi.updateAvatar(formData);
      updateUser({ avatar: response.data.avatarUrl });
      toast.success("Profile picture updated.");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to update profile picture."));
    } finally {
      setAvatarBusy(false);
      event.target.value = "";
    }
  };

  const handleSavePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setPasswordBusy(true);
    try {
      await profileApi.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to update password."));
    } finally {
      setPasswordBusy(false);
    }
  };

  const openNotification = async (item: NotificationItem) => {
    try {
      if (!item.readAt) {
        await platformApi.readNotification(item.id);
        setNotifications((current) => current.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)));
      }
      if (item.actionUrl) navigate(item.actionUrl);
    } catch {
      toast.error("Notification could not be opened.");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="page-shell grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading profile workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="portal-hero relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-[var(--shadow-overlay)] md:p-8">
        <div
          className="absolute inset-0 opacity-100"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 10% 20%, color-mix(in srgb, var(--brand-cyan) 22%, transparent), transparent 22%), radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--brand-coral) 18%, transparent), transparent 20%), radial-gradient(circle at 55% 100%, color-mix(in srgb, var(--brand-orange) 14%, transparent), transparent 28%)",
          }}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Learner profile
            </div>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-border bg-background/80">
                <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
                <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-sm transition hover:text-primary">
                  {avatarBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <p className="page-eyebrow">Account identity</p>
                <h1 className="brand-heading mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">{user.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Manage your learning identity, progress, certificates, and security in one premium learner hub.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold capitalize text-foreground">
                    {user.role}
                  </span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/notifications" className="btn-outline-teal">
              <Bell className="h-4 w-4" />
              Alerts
            </Link>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          {loadError}
        </div>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <LearnerMetricCard label="Courses enrolled" value={learningStats.enrolled} description="Total learning enrollments tied to your account." icon={BookOpen} accent="cyan" to="/dashboard" />
        <LearnerMetricCard label="Average progress" value={`${learningStats.averageProgress}%`} description="Average completion across all active enrollments." icon={BarChart3} accent="teal" to="/dashboard" />
        <LearnerMetricCard label="Saved courses" value={bookmarks.length} description="Courses you marked to revisit later." icon={Heart} accent="violet" to="/wishlist" />
        <LearnerMetricCard label="Certificates" value={certificates.length} description="Verified credentials available in your account." icon={Award} accent="orange" to="/certificates" />
        <LearnerMetricCard label="Unread alerts" value={unreadCount} description="Notifications that still need your attention." icon={Bell} accent="blue" to="/notifications" />
        <LearnerMetricCard label="Learning streak" value={`${streak} day${streak === 1 ? "" : "s"}`} description="Recent platform activity from your notifications." icon={Activity} accent="coral" to="/notifications" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="surface-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="page-eyebrow">Learning snapshot</p>
                <h2 className="mt-2 text-2xl font-bold">Your learner workspace at a glance</h2>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Completion rate</p>
                <p className="mt-1 text-2xl font-extrabold text-primary">{learningStats.averageProgress}%</p>
              </div>
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent" style={{ width: `${Math.min(100, learningStats.averageProgress)}%` }} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold">Active courses</p>
                <p className="mt-1 text-2xl font-bold text-primary">{activeEnrollments.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold">Completed courses</p>
                <p className="mt-1 text-2xl font-bold text-secondary">{completedEnrollments.length}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="page-eyebrow">Next step</p>
                  <h3 className="mt-2 text-xl font-bold">Continue where you left off</h3>
                </div>
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              {activeEnrollments[0] ? (
                <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-sm font-semibold">{activeEnrollments[0].course.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeEnrollments[0].mentor ? `Mentor: ${activeEnrollments[0].mentor}` : "Mentor not assigned"}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${activeEnrollments[0].progress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{activeEnrollments[0].progress}% complete</span>
                    <span>{activeEnrollments[0].lastAccessedAt ? `Last opened ${formatDate(activeEnrollments[0].lastAccessedAt)}` : "Recently updated"}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/learn/${activeEnrollments[0].courseId}`} className="btn-primary">
                      Resume course
                    </Link>
                    <Link to={`/courses/${activeEnrollments[0].courseId}/work`} className="btn-outline-teal">
                      Coursework
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">No active enrollments yet.</p>
                  <Link to="/courses" className="btn-primary mt-5 inline-flex">
                    Browse courses
                  </Link>
                </div>
              )}
            </div>

            <div className="surface-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="page-eyebrow">Proof of progress</p>
                  <h3 className="mt-2 text-xl font-bold">Certificates and verification</h3>
                </div>
                <Award className="h-6 w-6 text-primary" />
              </div>
              {recentCertificate ? (
                <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-5">
                  <p className="text-sm font-semibold">{recentCertificate.course.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Issued {formatDate(recentCertificate.issuedAt, "recently")} - ID {recentCertificate.verificationId}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/certificate/${recentCertificate.courseId}`} className="btn-primary">
                      View certificate
                    </Link>
                    <Link to={`/verify/${recentCertificate.verificationId}`} className="btn-outline-teal">
                      Verify publicly
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
                  <Award className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Complete an eligible course to unlock your first certificate.</p>
                  <Link to="/courses" className="btn-primary mt-5 inline-flex">
                    Explore courses
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="surface-card">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Active and completed enrollments</h2>
                <p className="text-sm text-muted-foreground">Your learning history stays visible in one place.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {enrollments.length ? (
                enrollments.map((item) => (
                  <article key={item.courseId} className="rounded-2xl border border-border bg-muted/15 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{item.course.title}</h3>
                          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.course.category} - {item.course.level} -{" "}
                          {item.course.lessons ? `${Array.isArray(item.course.lessons) ? item.course.lessons.length : item.course.lessons} lessons` : "Self-paced"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.lastAccessedAt ? `Last accessed ${formatDateTime(item.lastAccessedAt)}` : "No recent activity recorded"}
                          {item.mentor ? ` - Mentor: ${item.mentor}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/courses/${item.courseId}`} className="btn-outline-teal">
                          Course details
                        </Link>
                        <Link to={`/learn/${item.courseId}`} className="btn-primary">
                          {item.progress >= 100 ? "Review course" : "Continue learning"}
                        </Link>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent" style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.progress}% complete</span>
                      <span>{item.progress >= 100 ? "Completed" : "In progress"}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">No enrollments yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Start with the course catalog to build your learning path.</p>
                  <Link to="/courses" className="btn-primary mt-6 inline-flex">
                    Browse courses
                  </Link>
                </div>
              )}
            </div>

            {bookmarks.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-lg font-bold">Saved for later</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {bookmarks.slice(0, 3).map((item) => (
                    <Link key={item.id} to={`/courses/${item.courseId}`} className="rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/30">
                      <p className="text-sm font-semibold">{item.course.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.course.category} - {item.course.level}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="surface-card">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Recent learning events</h2>
                <p className="text-sm text-muted-foreground">Notifications and recent updates from the platform.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {notifications.length ? (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`flex w-full gap-4 rounded-2xl border p-5 text-left transition hover:bg-muted/40 ${
                      item.readAt ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-medium capitalize text-primary">{item.type}</span>
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
                          {formatDateTime(item.createdAt)}
                        </time>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      {item.actionUrl && <span className="mt-3 inline-flex text-sm font-semibold text-primary">Open linked page</span>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                  You are all caught up.
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_.82fr]">
            <div className="surface-card">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Personal information</h2>
                  <p className="text-sm text-muted-foreground">Update how your learner profile appears across the portal.</p>
                </div>
              </div>

              <form onSubmit={handleSaveInfo} className="mt-6 space-y-5">
                <label className="block text-sm font-medium">
                  Full name
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4"
                      required
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium">
                  Email address
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={user.email}
                      className="h-12 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 text-muted-foreground"
                      disabled
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium">
                  Bio
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Tell the platform a little about your learning goals."
                    className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background p-4"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/15 p-4">
                  <div>
                    <p className="text-sm font-semibold">Public profile image</p>
                    <p className="text-xs text-muted-foreground">Upload a learner-friendly profile image for community and course interactions.</p>
                  </div>
                  <label className="btn-outline-teal cursor-pointer">
                    <Camera className="h-4 w-4" />
                    Upload photo
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary" disabled={infoBusy}>
                    {infoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save profile
                  </button>
                  <Link to="/settings" className="btn-outline-teal">
                    Open settings
                  </Link>
                </div>
              </form>
            </div>

            <aside className="space-y-4">
              <div className="surface-card">
                <p className="page-eyebrow">Profile status</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-border bg-muted/15 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Role</p>
                    <p className="mt-1 text-lg font-bold capitalize">{user.role}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/15 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Certificates</p>
                    <p className="mt-1 text-lg font-bold">{certificates.length}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/15 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Unread notifications</p>
                    <p className="mt-1 text-lg font-bold">{unreadCount}</p>
                  </div>
                </div>
              </div>

              <div className="surface-card">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-bold">Trusted profile</h3>
                    <p className="text-sm text-muted-foreground">Keep your account details current for course records and certificates.</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />Name appears on issued credentials.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />Avatar syncs to your learner profile.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />Security updates stay in the same account.</li>
                </ul>
              </div>

              <div className="surface-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Learning tools</p>
                    <h3 className="mt-1 text-lg font-bold">Keep the workspace connected</h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/courses" className="btn-outline-teal">Study in courses</Link>
                  <Link to="/community" className="btn-primary">Community</Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="surface-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="page-eyebrow">Security</p>
              <h2 className="mt-2 text-xl font-bold">Change your password</h2>
            </div>
            <Lock className="h-5 w-5 text-primary" />
          </div>

          <form onSubmit={handleSavePassword} className="mt-6 space-y-5">
            <label className="block text-sm font-medium">
              Current password
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="block text-sm font-medium">
              New password
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-12"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="block text-sm font-medium">
              Confirm new password
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={passwordBusy}>
                {passwordBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Update password
              </button>
              <Link to="/support" className="btn-outline-teal">
                Need help?
              </Link>
            </div>
          </form>
        </div>

        <div className="surface-card">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Trusted profile</h2>
              <p className="text-sm text-muted-foreground">Keep your details current for courses, certificates, and community.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />Name appears on issued credentials.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />Avatar syncs to your learner profile.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />Security updates stay in the same account.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/courses" className="btn-outline-teal">Study in courses</Link>
            <Link to="/notifications" className="btn-primary">Notifications</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
