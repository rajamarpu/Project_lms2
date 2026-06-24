import { FaSpinner, FaInbox, FaExclamationTriangle, FaRedo } from "react-icons/fa";

export const LoadingSpinner = ({ size = "md", fullPage = false, label }) => {
  const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <FaSpinner className={`${sizeMap[size]} animate-spin`} style={{ color: "var(--admin-accent, #3b82f6)" }} />
      {label && <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{label}</p>}
    </div>
  );
  if (fullPage) {
    return <div className="flex items-center justify-center min-h-[40vh] w-full py-16">{spinner}</div>;
  }
  return spinner;
};

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 px-4 text-center gap-3 rounded-2xl border" style={{ borderColor: "var(--admin-border-subtle)" }}>
    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--admin-surface)", color: "var(--admin-text-muted)" }}>
      {icon ?? <FaInbox className="w-6 h-6" />}
    </div>
    <h3 className="font-semibold text-lg" style={{ color: "var(--admin-text-primary)" }}>{title}</h3>
    {description && <p className="text-sm max-w-sm" style={{ color: "var(--admin-text-muted)" }}>{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorState = ({ title = "Something went wrong", message = "We couldn't load this data. Please try again.", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
      <FaExclamationTriangle className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-lg" style={{ color: "var(--admin-text-primary)" }}>{title}</h3>
    <p className="text-sm max-w-sm" style={{ color: "var(--admin-text-muted)" }}>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border mt-2" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}>
        <FaRedo className="w-4 h-4" /> Try Again
      </button>
    )}
  </div>
);
