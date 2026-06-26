import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Moon, ShieldCheck, Sun } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
import { apiErrorMessage } from "@/utils/apiError";

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
        return;
      }
      if (user.role === "instructor") {
        navigate("/portal", { replace: true });
        return;
      }
      const requestedPath = (location.state as { from?: string } | null)?.from;
      navigate(requestedPath || "/dashboard", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "We could not sign you in. Check your credentials and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:block">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            UptoSkills learner access
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground xl:text-5xl">
            Sign in and continue from your saved learning progress.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Your dashboard, enrollments, certificates, notifications, and coursework are loaded from your account after login.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[520px] rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow-card)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <LockKeyhole className="h-3.5 w-3.5" />
                Learner sign-in
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Use your registered email and password.</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-primary/40"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <label className="block text-sm font-semibold text-foreground" htmlFor="login-email">
              Email address
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => {
                    setForm({ ...form, email: event.target.value });
                    setError("");
                  }}
                  placeholder="name@example.com"
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-foreground" htmlFor="login-password">
              <span className="flex items-center justify-between gap-3">
                Password
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </span>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => {
                    setForm({ ...form, password: event.target.value });
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button id="login-submit" type="submit" className="btn-primary h-12 w-full rounded-xl" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            New learner?
            <span className="h-px flex-1 bg-border" />
          </div>

          <Link to="/register" className="btn-outline-teal h-12 w-full rounded-xl">
            Create learner account
          </Link>
        </section>
      </div>
    </main>
  );
}
