import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { apiErrorMessage } from "@/utils/apiError";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setStatus("success");
      setMessage(response.data.message || "Reset link sent to your email.");
      if (response.data.resetLink) setResetLink(response.data.resetLink);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(apiErrorMessage(err, "Something went wrong. Please try again."));
    }
  };

  return (
    <div className="page-shell flex items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden min-h-[620px] flex-col justify-between overflow-hidden rounded-[2rem] surface-card p-10 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/22 via-secondary/16 to-background/30" aria-hidden />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Account recovery
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight">Recover access without losing your learning history.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Reset your password to get back to courses, certificates, dashboard progress, and your UptoSkills workspace.
            </p>
          </div>

          <div className="relative z-10 grid gap-4">
            {[
              "Courses and progress stay intact after password recovery.",
              "Reset links follow the current backend flow and timing.",
              "The learner experience stays consistent with the UptoSkills theme.",
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
              <Mail className="h-3.5 w-3.5" />
              Password recovery
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Forgot your password?</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter your email address and we will send a reset link to help you regain access.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-background/35 p-6">
            {status === "success" ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground">{message}</p>

                {resetLink && (
                  <div className="mt-4 break-all rounded-2xl border border-border bg-card/60 p-4 text-left">
                    <p className="mb-2 text-xs text-muted-foreground">Testing mode: Link generated</p>
                    <a href={resetLink} className="text-sm font-medium text-primary hover:underline">
                      {resetLink}
                    </a>
                  </div>
                )}

                <Link to="/login" className="btn-primary mt-4 w-full justify-center py-3 text-sm font-semibold">
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === "error" && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {message}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="reset-email" className="text-sm font-medium text-foreground/80">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-border bg-background/65 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button type="submit" disabled={status === "loading"} className="btn-primary mt-2 w-full justify-center py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to log in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
