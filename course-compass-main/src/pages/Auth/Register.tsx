import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Sparkles, Mail, Lock, User, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { apiErrorMessage } from "@/utils/apiError";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(form.password)) return "Password must include a lowercase letter.";
    if (!/[A-Z]/.test(form.password)) return "Password must include an uppercase letter.";
    if (!/[0-9]/.test(form.password)) return "Password must include a number.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(form.name, form.email, form.password, form.role);
      if (result?.pending) {
        setPendingMessage(result.message || "Your account is pending admin approval.");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Registration failed. Check your connection and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = form.password;
    if (!password) return null;
    if (password.length < 8) return { label: "Too short", color: "bg-destructive", width: "w-1/4" };
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { label: "Needs mixed case and a number", color: "bg-amber-500", width: "w-3/4" };
    }
    return { label: "Strong", color: "bg-secondary", width: "w-full" };
  };

  const strength = passwordStrength();

  return (
    <div className="page-shell flex items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden min-h-[700px] flex-col justify-between overflow-hidden rounded-[2rem] surface-card p-10 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-secondary/18 to-background/30" aria-hidden />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Join UptoSkills
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
              Build skills with a platform designed for real progress.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              UptoSkills gives learners one place for courses, roadmaps, certificates, challenges, and enterprise-ready momentum.
            </p>
          </div>

          <div className="relative z-10 grid gap-4">
            {[
              ["Guided onboarding", "Structured learning starts with a clear profile and secure account setup."],
              ["Approval-aware access", "Learner accounts can preserve your current approval flow without changing auth logic."],
              ["Premium experience", "The same UptoSkills blue, teal, and red visual language carries across the entire journey."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border bg-background/55 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <p className="font-semibold">{title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-[2rem] p-6 sm:p-8">
          {pendingMessage ? (
            <div className="rounded-[1.75rem] border border-amber-500/30 bg-amber-500/6 p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="font-display text-2xl font-bold">Account Pending Approval</h2>
              <p className="mt-3 text-sm text-muted-foreground">{pendingMessage}</p>
              <p className="mt-5 text-sm text-muted-foreground">
                Once approved, you can <Link to="/login" className="font-medium text-primary hover:underline">sign in here</Link>.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Create learner account
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Start learning with UptoSkills</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create your account to access guided courses, learning paths, certificates, and progress tracking.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="register-name" className="text-sm font-medium text-foreground/80">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-2xl border border-border bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-email" className="text-sm font-medium text-foreground/80">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-border bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-password" className="text-sm font-medium text-foreground/80">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="8+ characters, mixed case and number"
                      minLength={8}
                      className="w-full rounded-2xl border border-border bg-background/65 py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {strength && (
                    <div className="space-y-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">Strength: <span className="font-medium">{strength.label}</span></p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-confirm" className="text-sm font-medium text-foreground/80">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="register-confirm"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className={`w-full rounded-2xl border py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/50 ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-destructive bg-background/65 focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                          : "border-border bg-background/65 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      }`}
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle confirm password visibility">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-destructive">Passwords do not match</p>}
                </div>

                <button
                  id="register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary mt-2 w-full justify-center py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" /> Create Account
                    </span>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-card px-3">Already have an account?</span>
                </div>
              </div>

              <Link to="/login" className="btn-outline-teal w-full justify-center py-3 text-sm font-medium">
                Sign In Instead
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Register;
