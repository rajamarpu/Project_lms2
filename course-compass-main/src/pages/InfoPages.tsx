import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Award, Bell, BookOpen, CheckCircle2, ChevronDown, CreditCard, FileQuestion, Globe2, Headphones,
  LifeBuoy, Lock, MessageCircle, MonitorCog, Palette, Search, ShieldCheck,
  Sparkles, TicketCheck, UserCog, Users, Video, Zap,
} from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { platformApi, type NotificationItem, type Preferences } from "@/api/platform.api";
import { useAuth } from "@/store/AuthContext";

const features = [
  { icon: BookOpen, title: "Structured learning", text: "Courses, lessons, learning paths, and progress in one focused workspace." },
  { icon: Video, title: "Flexible course delivery", text: "Learn through video, lesson resources, assessments, and practical assignments." },
  { icon: Users, title: "Expert-led instruction", text: "Clear instructor profiles and managed course experiences for every cohort." },
  { icon: TicketCheck, title: "Verified achievement", text: "Completion tracking and certificates make every milestone visible." },
  { icon: Zap, title: "Progress that stays useful", text: "Continue learning, recommendations, and streaks keep momentum easy to understand." },
  { icon: ShieldCheck, title: "Role-aware workspaces", text: "Learners, instructors, and administrators see tools relevant to their responsibilities." },
];

export function Features() {
  return (
    <div className="container py-12 md:py-16">
      <header className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold text-primary">UptoSkills learning platform</p>
        <h1 className="font-display text-3xl font-bold md:text-5xl">Everything needed to learn with direction</h1>
        <p className="mt-4 text-muted-foreground">A calm, connected LMS experience built around skills, progress, and practical outcomes.</p>
      </header>
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <article key={title} className="glass-card flex h-full flex-col p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>
      <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <h2 className="font-display text-xl font-semibold">Ready to build your next skill?</h2>
        <Link to="/courses" className="btn-primary mt-5">Explore courses</Link>
      </div>
    </div>
  );
}

const faqs = [
  ["How do I continue an enrolled course?", "Open your dashboard and choose Continue Learning. Your saved progress determines where you resume."],
  ["Where can I find certificates?", "Completed and approved certificates appear in the Certificates page and can be opened individually."],
  ["How do I update my profile?", "Use Profile for your photo and personal information, or Settings for experience preferences."],
];

export function Support() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticket, setTicket] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ticket.subject.trim() || !ticket.message.trim()) return toast.error("Add a subject and message.");
    if (!isAuthenticated) { toast.error("Sign in to create a support ticket."); navigate('/login', { state: { from: '/support' } }); return; }
    setSubmitting(true);
    try {
      await platformApi.createTicket({ subject: ticket.subject, description: ticket.message });
      setTicket({ subject: "", message: "" });
      toast.success("Support ticket raised successfully.");
    } catch { toast.error("The ticket could not be created. Please try again."); }
    finally { setSubmitting(false); }
  };
  return (
    <div className="container py-12">
      <header className="mb-10 max-w-2xl"><p className="text-sm font-semibold text-primary">Help Center</p><h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">How can we help?</h1><p className="mt-3 text-muted-foreground">Find an answer, review common issues, or raise a support request.</p></header>
      <section className="grid gap-5 md:grid-cols-3">
        {([
          [FileQuestion, "Documentation", "Browse guidance for courses, profiles, and certificates."],
          [MessageCircle, "Live chat", "Chat availability: Monday–Friday, 9:00–18:00 IST."],
          [Headphones, "Contact support", "Email support@uptoskills.com for account-sensitive help."],
        ] as const).map(([Icon, title, text]) => <article key={title} className="glass-card p-5"><Icon className="mb-4 h-6 w-6 text-primary" /><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{text}</p></article>)}
      </section>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="glass-card p-6"><h2 className="font-display text-xl font-semibold">Frequently asked questions</h2><div className="mt-5 divide-y divide-border">{faqs.map(([question, answer], index) => <div key={question} className="py-3"><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 text-left font-medium" aria-expanded={openFaq === index}>{question}<ChevronDown className={`h-4 w-4 transition-transform ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="pt-3 text-sm leading-6 text-muted-foreground">{answer}</p>}</div>)}</div></section>
        <form onSubmit={submit} className="glass-card p-6"><div className="flex items-center gap-3"><LifeBuoy className="h-6 w-6 text-primary" /><h2 className="font-display text-xl font-semibold">Raise a ticket</h2></div><label className="mt-5 block text-sm font-medium">Subject<input value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3" /></label><label className="mt-4 block text-sm font-medium">Describe the issue<textarea value={ticket.message} onChange={(e) => setTicket({ ...ticket, message: e.target.value })} className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background p-3" /></label><button className="btn-primary mt-5" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit ticket'}</button></form>
      </div>
    </div>
  );
}

export function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { platformApi.notifications().then(({ data }) => setItems(data.data)).catch(() => toast.error('Notifications could not be loaded.')).finally(() => setLoading(false)); }, []);
  const markAll = async () => { await platformApi.readAllNotifications(); setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))); };
  const open = async (item: NotificationItem) => { if (!item.readAt) { await platformApi.readNotification(item.id); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)); } if (item.actionUrl) navigate(item.actionUrl); };
  return <div className="container max-w-4xl py-12"><header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Updates</p><h1 className="mt-1 font-display text-3xl font-bold">Notification center</h1><p className="mt-2 text-muted-foreground">Course, assignment, instructor, and certificate activity.</p></div><button type="button" className="btn-outline-teal !py-2" onClick={markAll}>Mark all read</button></header><section className="space-y-3" aria-busy={loading}>{loading ? <p role="status" className="p-10 text-center text-muted-foreground">Loading notifications…</p> : items.length ? items.map((item) => <article key={item.id} className={`flex gap-4 rounded-2xl border p-5 ${item.readAt ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}><div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bell className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><span className="text-xs font-medium capitalize text-primary">{item.type}</span><h2 className="font-semibold">{item.title}</h2></div><time className="text-xs text-muted-foreground" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time></div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p>{item.actionUrl && <button type="button" className="mt-3 text-sm font-semibold text-primary" onClick={() => open(item)}>View details</button>}</div></article>) : <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">You are all caught up.</p>}</section></div>;
}

export function Settings() {
  const { theme, setTheme } = useTheme();
  const defaults: Preferences = { language: 'English', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, emailNotifications: false, courseNotifications: true, deadlineReminders: true, reducedMotion: false };
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  useEffect(() => { platformApi.preferences().then(({ data }) => setPrefs(data.data)).catch(() => toast.error('Preferences could not be loaded.')); }, []);
  useEffect(() => { document.documentElement.dataset.reducedMotion = String(Boolean(prefs.reducedMotion)); }, [prefs.reducedMotion]);
  const options = useMemo(() => [["courseNotifications", "Course updates"], ["deadlineReminders", "Assignments and assessments"], ["emailNotifications", "Email summaries"]] as const, []);
  const save = async () => { try { const { data } = await platformApi.updatePreferences(prefs); setPrefs(data.data); toast.success("Preferences saved."); } catch { toast.error('Preferences could not be saved.'); } };
  const informational = [
    { icon: UserCog, title: 'Account', copy: 'Update your name, biography, and profile picture.', action: '/profile', label: 'Open profile' },
    { icon: Lock, title: 'Security', copy: 'Change your password and review account security.', action: '/profile', label: 'Security settings' },
    { icon: ShieldCheck, title: 'Privacy', copy: 'Learning activity is used only for progress and recommendations.', action: '/support', label: 'Privacy help' },
    { icon: Award, title: 'Certificates', copy: 'View, print, share, and verify earned credentials.', action: '/certificates', label: 'My certificates' },
    { icon: CreditCard, title: 'Payments', copy: 'Billing is recorded only when a verified transaction exists.', action: '/support', label: 'Billing support' },
  ];
  return <div className="page-shell max-w-6xl"><header className="mb-10"><p className="page-eyebrow">Preferences & account</p><h1 className="page-title">Settings center</h1><p className="page-description">Manage your account, security, learning experience, notifications, theme, language, privacy, certificates, and payment support.</p></header><div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><div className="space-y-6"><section className="surface-card"><div className="flex items-center gap-3"><Palette className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">Theme</h2><p className="text-xs text-muted-foreground">Choose light, dark, or follow your system.</p></div></div><div className="mt-5 grid grid-cols-3 gap-2">{(['system','light','dark'] as const).map((choice) => <button key={choice} type="button" aria-pressed={theme === choice} onClick={() => setTheme(choice)} className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${theme === choice ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}>{choice}</button>)}</div></section><section className="surface-card"><div className="flex items-center gap-3"><Globe2 className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">Language & region</h2><p className="text-xs text-muted-foreground">Personalize language and timezone-aware dates.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Language<select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"><option>English</option><option>Hindi</option></select></label><label className="text-sm font-medium">Timezone<input value={prefs.timezone} readOnly className="mt-2 h-11 w-full rounded-xl border border-border bg-muted/50 px-3 text-muted-foreground" /></label></div></section><section className="surface-card"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><div><h2 className="font-semibold">Notifications</h2><p className="text-xs text-muted-foreground">Control course, deadline, and email updates.</p></div></div><div className="mt-5 divide-y divide-border">{options.map(([key, label]) => <label key={key} className="flex min-h-14 items-center justify-between gap-3"><span className="text-sm">{label}</span><input type="checkbox" checked={Boolean(prefs[key])} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} className="h-5 w-5 accent-primary" /></label>)}</div><label className="mt-4 flex min-h-12 items-center justify-between rounded-xl border border-border px-4"><span className="text-sm">Reduced motion</span><input type="checkbox" checked={Boolean(prefs.reducedMotion)} onChange={(e) => setPrefs({ ...prefs, reducedMotion: e.target.checked })} className="h-5 w-5 accent-primary" /></label></section><div className="sticky bottom-4 flex flex-wrap gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-[var(--shadow-overlay)] backdrop-blur"><button type="button" onClick={save} className="btn-primary">Save preferences</button><button type="button" onClick={() => setPrefs(defaults)} className="btn-outline-teal">Reset defaults</button></div></div><aside className="space-y-4">{informational.map(({ icon: Icon, title, copy, action, label }) => <section key={title} className="surface-card"><Icon className="h-5 w-5 text-primary" /><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p><Link to={action} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">{label}</Link></section>)}</aside></div></div>;
}
