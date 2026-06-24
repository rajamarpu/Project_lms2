import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in the component tree below it
 * so a single broken widget (e.g. a malformed API response causing a
 * `.map` on undefined) shows a recovery screen instead of a blank
 * white page for the whole app.
 *
 * Wrap this around <AppRouter /> in main.tsx.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Centralized place to wire up error reporting (Sentry, LogRocket, etc.)
    console.error("Uncaught UI error:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="glass-card max-w-md w-full p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="font-display font-bold text-xl mb-2 text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. You can try reloading the page or head back to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={this.handleReload} className="btn-primary">
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <button onClick={this.handleGoHome} className="btn-outline-teal">
                <Home className="w-4 h-4" /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
