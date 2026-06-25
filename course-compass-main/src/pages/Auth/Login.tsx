import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpenCheck, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Moon, ShieldCheck, Sun } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
import { apiErrorMessage } from "@/utils/apiError";

const benefits = [
  "Resume lessons from your last saved position",
  "Access assignments, assessments, and certificates",
  "Join community discussions and course activity",
];

export default function Login() {
  const { login } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Enter your email address and password.");
      return;
    }
    setIsLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      if (user.role === "admin") {
        window.location.assign(import.meta.env.VITE_ADMIN_URL || "http://localhost:3001/admin-login");
      } else if (user.role === "instructor") {
        navigate("/portal", { replace: true });
      } else {
        const requestedPath = (location.state as { from?: string } | null)?.from;
        navigate(requestedPath || "/dashboard", { replace: true });
      }
    } catch (err) {
      setError(apiErrorMessage(err, "We could not sign you in. Check your credentials and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 gradient-mesh-bg opacity-70" aria-hidden />
      <button type="button" onClick={toggleTheme} className="absolute right-5 top-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm" aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}>
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="brand-auth-panel hidden min-h-[650px] flex-col justify-between p-10 text-white lg:flex">
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-white/14 px-4 py-3 backdrop-blur"><BookOpenCheck className="h-6 w-6" /><span className="font-display text-lg font-semibold">UptoSkills LMS</span></div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Your learning workspace</p>
            <h1 className="mt-4 max-w-lg font-display text-4xl font-bold leading-tight">Learn consistently. Track real progress. Build skills that last.</h1>
            <p className="mt-5 max-w-lg leading-7 text-white/80">One secure account for courses, coursework, community support, and verifiable achievements.</p>
            <ul className="mt-8 space-y-4">{benefits.map((item) => <li key={item} className="flex items-center gap-3 text-sm text-white/90"><CheckCircle2 className="h-5 w-5 shrink-0" />{item}</li>)}</ul>
          </div>
          <p className="text-xs text-white/65">Protected sessions · Role-based access · Persisted progress</p>
        </section>

        <section className="flex min-h-[650px] items-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><ShieldCheck className="h-3.5 w-3.5" />Secure learner sign-in</div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your account details to continue learning.</p>
            </div>

            {error && <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <label className="block text-sm font-semibold text-foreground" htmlFor="login-email">Email address<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="login-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); setError(""); }} placeholder="name@example.com" className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10" /></div></label>

              <label className="block text-sm font-semibold text-foreground" htmlFor="login-password"><span className="flex items-center justify-between">Password<Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link></span><div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="login-password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={form.password} onChange={(event) => { setForm({ ...form, password: event.target.value }); setError(""); }} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>

              <button id="login-submit" type="submit" disabled={isLoading} className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : <>Sign in securely<ArrowRight className="h-4 w-4" /></>}</button>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />New to UptoSkills?<span className="h-px flex-1 bg-border" /></div>
            <Link to="/register" className="btn-outline-teal h-12 w-full">Create learner account</Link>
            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to use the platform responsibly and protect your account credentials.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
