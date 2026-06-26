import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container flex min-h-[60vh] items-center justify-center py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-bold">{this.props.fallbackTitle || "Something went wrong"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.props.fallbackMessage || "An unexpected error occurred. Please try again."}
            </p>
            {this.state.error && (
              <p className="mt-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary mt-6 inline-flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}