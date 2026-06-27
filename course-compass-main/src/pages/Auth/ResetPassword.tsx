import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import axios from "axios";
import { apiErrorMessage } from "@/utils/apiError";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const ResetPassword = () => {
  const { id, token } = useParams<{ id: string; token: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const response = await axios.put(`${API_URL}/auth/reset-password/${id}/${token}`, {
        password: form.password,
      });
      setStatus("success");
      setMessage(response.data.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(apiErrorMessage(err, "Invalid or expired token. Please try again."));
    }
  };

  if (!id || !token) {
    return (
      <div className="page-shell flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
          Invalid password reset link. Please request a new one.
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden min-h-[620px] flex-col justify-between overflow-hidden rounded-[2rem] surface-card p-10 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/22 via-secondary/16 to-background/30" aria-hidden />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure access
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight">Create a new password and return to learning.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Your recovery flow keeps the current UptoSkills auth path intact while giving the experience a cleaner enterprise-grade presentation.
            </p>
          </div>

          <div className="relative z-10 grid gap-4">
            {[
              "Protected reset flow with the existing backend token verification.",
              "Clear status messaging and stronger form hierarchy.",
              "Consistent UptoSkills blue, teal, and red theme in both dark and light mode.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-background/55 p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Secure Access
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Create a new password</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Set a fresh password below and we will redirect you back to the UptoSkills sign-in screen.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-background/35 p-6">
            {status === "success" ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Password Reset Complete</h3>
                <p className="text-sm text-muted-foreground">{message}</p>
                <button onClick={() => navigate("/login")} className="btn-primary mt-4 w-full justify-center py-3 text-sm font-semibold">
                  Go to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === "error" && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {message}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground/80">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                      className="w-full rounded-2xl border border-border bg-background/65 py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your new password"
                      className="w-full rounded-2xl border border-border bg-background/65 py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || !form.password || !form.confirmPassword}
                  className="btn-primary mt-4 w-full justify-center py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;
