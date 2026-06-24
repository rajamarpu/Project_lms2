import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Consistent empty-state block used across course lists,
 * dashboards, tables, and search results.
 */
export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
      {icon ?? <Inbox className="w-6 h-6" />}
    </div>
    <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
