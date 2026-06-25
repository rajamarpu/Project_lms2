import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export type MetricAccent = "orange" | "coral" | "teal" | "cyan" | "blue" | "violet";

const accents: Record<MetricAccent, string> = {
  orange: "var(--brand-orange)",
  coral: "var(--brand-coral)",
  teal: "var(--brand-teal)",
  cyan: "var(--brand-cyan)",
  blue: "var(--brand-blue)",
  violet: "var(--brand-violet)",
};

export function LearnerMetricCard({ label, value, description, icon: Icon, accent, to }: { label: string; value: string | number; description: string; icon: LucideIcon; accent: MetricAccent; to: string }) {
  return <Link to={to} className="metric-card group focus-visible:ring-2 focus-visible:ring-primary" style={{ "--card-accent": accents[accent] } as React.CSSProperties} aria-label={`${label}: ${value}. ${description}`}>
    <div className="flex items-start justify-between gap-3"><span className="metric-icon"><Icon className="h-5 w-5" aria-hidden /></span><span className="text-xs font-bold uppercase tracking-[.13em] brand-muted">Live data</span></div>
    <p className="mt-5 text-3xl font-extrabold tracking-tight" style={{ color: accents[accent] }}>{value}</p>
    <h2 className="mt-1 text-sm font-bold brand-body">{label}</h2>
    <p className="mt-2 text-xs leading-5 brand-muted">{description}</p>
  </Link>;
}
