import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { profileApi } from "@/api/profile.api";
import { Activity, Award, BarChart3, User, Lock, Save, Mail, Edit3, Camera, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/utils/apiError";
import { courseApi } from "@/api/course.api";
import { platformApi, type NotificationItem } from "@/api/platform.api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"overview" | "info" | "certificates" | "activity" | "security">("overview");
  const [learningStats, setLearningStats] = useState({ enrolled: 0, completed: 0, averageProgress: 0 });
  const [certificates, setCertificates] = useState<Array<{ id: string; courseId: string; course: { title: string }; issuedAt?: string }>>([]);
  const [activityItems, setActivityItems] = useState<NotificationItem[]>([]);
  
  // Profile Info State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([courseApi.getMyEnrollments(), platformApi.certificates(), platformApi.notifications()]).then(([enrollmentResponse, certificateResponse, notificationResponse]) => {
      if (!active) return;
      const enrollments = enrollmentResponse.data.data || [];
      const completed = enrollments.filter((item: { progress: number; status: string }) => item.progress >= 100 || item.status === 'completed').length;
      const averageProgress = enrollments.length ? Math.round(enrollments.reduce((sum: number, item: { progress: number }) => sum + Number(item.progress || 0), 0) / enrollments.length) : 0;
      setLearningStats({ enrolled: enrollments.length, completed, averageProgress });
      setCertificates((certificateResponse.data.data || []).filter((item: { status: string }) => item.status === 'issued'));
      setActivityItems((notificationResponse.data.data || []).slice(0, 8));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  if (!user) return null;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      const res = await profileApi.updateProfile({ name, bio });
      updateUser({ name: res.data.data.name, bio: res.data.data.bio });
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
    <div className="container py-8 max-w-4xl min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile information and security</p>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-2">
          <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === "overview" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}><BarChart3 className="w-4 h-4" /><span className="font-medium text-sm">Overview</span></button>
          <button
            onClick={() => setActiveTab("info")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === "info" 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="font-medium text-sm">Personal Info</span>
          </button>
          <button onClick={() => setActiveTab("certificates")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === "certificates" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}><Award className="w-4 h-4" /><span className="font-medium text-sm">Certificates</span></button>
          <button onClick={() => setActiveTab("activity")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === "activity" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}><Activity className="w-4 h-4" /><span className="font-medium text-sm">Activity</span></button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === "security" 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span className="font-medium text-sm">Security</span>
          </button>
        </aside>

        {/* Content */}
        <main className="glass-card p-6 md:p-8">
          {activeTab === "overview" && <div className="animate-in fade-in slide-in-from-right-4 duration-300"><div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center"><div className="h-24 w-24 overflow-hidden rounded-3xl border-2 border-primary/25 bg-primary/10">{user.avatar ? <img src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}${user.avatar}`} alt={user.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-3xl font-bold text-primary">{user.name.charAt(0)}</div>}</div><div><p className="page-eyebrow">Learning profile</p><h2 className="mt-1 text-2xl font-bold">{user.name}</h2><p className="mt-1 text-sm text-muted-foreground">{user.email}</p></div></div><div className="mt-7 grid gap-4 sm:grid-cols-3">{[[learningStats.enrolled,'Courses enrolled'],[`${learningStats.averageProgress}%`,'Average progress'],[certificates.length,'Certificates']].map(([value,label]) => <div key={String(label)} className="rounded-2xl border border-border bg-muted/25 p-5"><p className="text-2xl font-bold text-primary">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</div><div className="mt-7 rounded-2xl border border-border p-5"><h3 className="font-bold">Learning summary</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">You have completed {learningStats.completed} of {learningStats.enrolled} enrolled courses. Continue learning from your dashboard or review earned credentials here.</p><Link to="/dashboard" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Open learner dashboard</Link></div></div>}
          {activeTab === "info" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex items-center gap-4 border-b border-border pb-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase border-2 border-primary/20 overflow-hidden">
                    {user.avatar ? (
                      <img src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm cursor-pointer group-hover:scale-110">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                  </label>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>

              <form onSubmit={handleSaveInfo} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Full Name</label>
                  <div className="relative">
                    <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={user.email}
                      className="w-full bg-muted/60 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">To change your email, please contact support.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little bit about yourself..."
                    className="w-full bg-muted/30 border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[120px] resize-y"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingInfo}
                    className="btn-primary"
                  >
                    {isSavingInfo ? "Saving..." : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 border-b border-border pb-6">
                <h2 className="text-xl font-semibold mb-1">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-foreground/80">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      required
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      required
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="btn-primary"
                  >
                    {isSavingPassword ? "Updating..." : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Update Password
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          {activeTab === "certificates" && <div className="animate-in fade-in slide-in-from-right-4 duration-300"><div className="mb-6"><h2 className="text-xl font-semibold">Earned certificates</h2><p className="mt-1 text-sm text-muted-foreground">Preview and download verified course credentials.</p></div><div className="space-y-3">{certificates.length ? certificates.map((certificate) => <Link key={certificate.id} to={`/certificate/${certificate.courseId}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4 transition hover:bg-muted"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Award className="h-5 w-5" /></div><div><p className="font-semibold">{certificate.course.title}</p><p className="text-xs text-muted-foreground">Issued {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'recently'}</p></div></div><span className="text-sm font-semibold text-primary">View</span></Link>) : <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Complete an eligible course to earn your first certificate.</p>}</div></div>}
          {activeTab === "activity" && <div className="animate-in fade-in slide-in-from-right-4 duration-300"><div className="mb-6"><h2 className="text-xl font-semibold">Activity timeline</h2><p className="mt-1 text-sm text-muted-foreground">Recent learning and account events.</p></div><div className="space-y-4">{activityItems.length ? activityItems.map((item) => <div key={item.id} className="relative border-l-2 border-primary/25 pl-5"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" /><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.message}</p><time className="mt-1 block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</time></div>) : <p className="text-sm text-muted-foreground">No recent activity yet.</p>}</div></div>}
        </main>
      </div>
    </div>
  );
};

export default Profile;
