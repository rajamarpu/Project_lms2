import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/30 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && (
        <div className="mt-6">
          {actionTo ? (
            <Link to={actionTo} className="btn-primary inline-flex items-center gap-2">
              {actionLabel}
            </Link>
          ) : onAction ? (
            <button type="button" onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}