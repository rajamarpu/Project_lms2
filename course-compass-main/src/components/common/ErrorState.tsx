import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * Standard error block shown when an API call fails.
 * Always offers a retry action when `onRetry` is supplied so
 * users aren't stuck on a dead screen after a network blip.
 */
export const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load this content. Please check your connection and try again.",
  onRetry,
}: ErrorStateProps) => (
  <div className="error-state">
    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-outline-teal btn-sm mt-2">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
