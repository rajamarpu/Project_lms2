import { Link } from "react-router-dom";
import { ShieldCheck, Users, Sparkles, BookOpen, LayoutGrid } from "lucide-react";
import { AuthHeroBackground } from "@/components/ui/AuthHeroBackground";
import { redirectToAdminAuth } from "@/utils/adminAuth";

const RoleSelect = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuthHeroBackground />

      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/20 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-300">
            <Sparkles className="w-4 h-4" /> Role selection
          </div>
          <h1 className="mt-8 text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Start with the right access.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-8">
            Choose whether you are a student or an admin first, then continue to the appropriate login or registration flow.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card glass-card-hover border border-border p-8 shadow-[0_0_45px_rgba(6,182,212,0.12)]">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Student Access</p>
                <h2 className="mt-3 text-2xl font-semibold">Learner journey</h2>
                <p className="mt-4 text-sm text-muted-foreground leading-6">
                  Browse courses, track progress, and continue learning from a student-first dashboard.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                to="/login?role=user"
                className="btn-outline-teal w-full justify-center py-3 text-sm"
              >
                Student Sign In
              </Link>
              <Link
                to="/register?role=user"
                className="btn-primary w-full justify-center py-3 text-sm"
              >
                Student Register
              </Link>
            </div>
          </div>

          <div className="glass-card glass-card-hover border border-border p-8 shadow-[0_0_45px_rgba(139,92,246,0.12)]">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Admin Access</p>
                <h2 className="mt-3 text-2xl font-semibold">Secure control</h2>
                <p className="mt-4 text-sm text-muted-foreground leading-6">
                  Manage users, courses, and analytics through a secure admin portal designed for your team.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => redirectToAdminAuth("/admin-login")}
                className="btn-outline-violet w-full justify-center py-3 text-sm"
              >
                Admin Sign In
              </button>

              <button
                type="button"
                onClick={() => redirectToAdminAuth("/admin-register")}
                className="btn-primary w-full justify-center py-3 text-sm"
              >
                Admin Register
              </button>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Admin registration is usually restricted. If you already have an account, use Admin Sign In.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleSelect;
