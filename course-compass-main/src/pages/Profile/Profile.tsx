import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { profileApi } from "@/api/profile.api";
import { courseApi } from "@/api/course.api";
import { platformApi } from "@/api/platform.api";
import {
  User,
  Lock,
  Save,
  Mail,
  Edit3,
  Camera,
  Eye,
  EyeOff,
  Award,
  Flame,
  ShieldCheck,
  Link2,
  Target,
  Sparkles,
  BarChart3,
  BookOpen,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/utils/apiError";

type EnrollmentSummary = {
  progress: number;
  status?: string;
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState((user as { phone?: string } | undefined)?.phone || "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [enrollRes, certRes] = await Promise.allSettled([
          courseApi.getMyEnrollments(),
          platformApi.certificates(),
        ]);
        if (enrollRes.status === "fulfilled") {
          setEnrollments((enrollRes.value?.data?.data || []) as EnrollmentSummary[]);
        }
        if (certRes.status === "fulfilled") {
          const certs = (certRes.value?.data?.data || []) as { status: string }[];
          setCertificateCount(certs.filter((c) => c.status === "issued").length);
        }
      } catch {
        // silently handled — stats will show zeros
      }
    };
    fetchStats();
  }, []);

  const inProgressCount = enrollments.filter((e) => e.progress < 100).length;
  const completedCount = enrollments.filter((e) => e.progress >= 100 || e.status === "completed").length;

  const profileStats = useMemo(() => [
    { label: "Courses", value: enrollments.length, icon: BookOpen },
    { label: "In progress", value: inProgressCount, icon: PlayCircle },
    { label: "Completed", value: completedCount, icon: CheckCircle2 },
    { label: "Certificates", value: certificateCount, icon: Award },
  ], [enrollments, certificateCount, inProgressCount, completedCount]);

  if (!user) return null;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      const res = await profileApi.updateProfile({ name, bio, phone });
      updateUser({ name: res.data.data.name, bio: res.data.data.bio, phone: res.data.data.phone });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, "Failed to update profile"));
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploadingAvatar(true);
    try {
      const res = await profileApi.updateAvatar(formData);
      updateUser({ avatar: res.data.avatarUrl });
      toast.success("Profile picture updated");
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, "Failed to update profile picture"));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSavingPassword(true);
    try {
      await profileApi.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, "Failed to update password"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="page-shell container py-8 lg:py-10 max-w-6xl min-h-[calc(100vh-80px)]">
      <section className="mb-8 overflow-hidden rounded-[2rem] surface-card">
        <div className="relative h-44 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
        <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr] md:p-8">
          <div className="relative -mt-24">
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-[2rem] border-4 border-background bg-primary/10 shadow-[var(--shadow-card)]">
              {user.avatar ? (
                <img src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}${user.avatar}`} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-3 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition hover:text-primary">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </label>
              {isUploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-background/60"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Profile overview</p>
                <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{user.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Your learning hub, milestones, achievements, and security controls live here. Update your personal identity and keep your learning story current.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {user.role} account
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {profileStats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-border bg-background/55 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="space-y-2 self-start">
          {[
            { id: "info", label: "Personal Info", icon: User },
            { id: "security", label: "Security", icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "info" | "security")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                activeTab === id
                  ? "bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(255,107,53,0.25)]"
                  : "border border-border bg-background/55 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </aside>

        <main className="surface-card rounded-[2rem] p-6 md:p-8">
          {activeTab === "info" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="rounded-2xl border border-border bg-background/55 p-5">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Learning progress</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your dashboard and profile are connected so goals, streaks, and achievements stay in sync.
                </p>
              </div>

              <form onSubmit={handleSaveInfo} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Full Name</label>
                  <div className="relative">
                    <Edit3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background/60 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={user.email}
                      className="w-full cursor-not-allowed rounded-2xl border border-border bg-muted/60 py-3 pl-10 pr-4 text-sm text-muted-foreground"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">To change your email, please contact support.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about your learning goals..."
                    className="min-h-[140px] w-full resize-y rounded-2xl border border-border bg-background/60 p-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-border bg-background/60 py-3 px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { icon: Link2, label: "GitHub", value: "Add account" },
                    { icon: Sparkles, label: "Learning goal", value: "Set goal" },
                    { icon: Target, label: "Interests", value: "Update topics" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl border border-border bg-background/50 p-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <p className="mt-3 text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSavingInfo} className="btn-primary">
                    {isSavingInfo ? "Saving..." : <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                {[
                  { title: "Two-factor auth", detail: "Add an extra layer of protection." },
                  { title: "Sessions", detail: "Review active devices and sign-outs." },
                  { title: "Data export", detail: "Keep a copy of your learner record." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border bg-background/55 p-4">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6 border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-1">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background/60 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-foreground/80">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background/60 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background/60 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      required
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSavingPassword} className="btn-primary">
                    {isSavingPassword ? "Updating..." : <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Update Password</span>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
