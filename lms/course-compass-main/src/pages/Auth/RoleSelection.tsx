import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";

const roles = [
  {
    key: "user",
    title: "Learner",
    description: "Access courses, save progress, and earn certificates.",
    details: ["Browse the full catalog", "Track learning milestones", "Join community discussions"],
    icon: BookOpen,
    action: "Continue as learner",
  },
  {
    key: "instructor",
    title: "Instructor",
    description: "Create courses, manage learners, and publish curriculum.",
    details: ["Build course content", "Monitor student performance", "Manage teaching workflows"],
    icon: GraduationCap,
    action: "Continue as instructor",
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">Create your account</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Choose your role</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Select the account type that matches your goals today. You can always update your preferences later in your profile.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <article key={role.key} className="group overflow-hidden rounded-[2rem] border border-border bg-card p-8 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">{role.title}</p>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{role.description}</p>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-foreground/90">
                  {role.details.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-[3px] inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => navigate(`/register?role=${role.key}`)}
                  className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  {role.action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
