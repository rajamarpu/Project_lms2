import { Component } from "react";
import { FaExclamationTriangle, FaRedo, FaHome } from "react-icons/fa";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Admin UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--admin-page-bg, #16263a)" }}>
          <div
            className="max-w-md w-full p-8 text-center rounded-2xl border"
            style={{ background: "var(--admin-surface, #20324a)", borderColor: "var(--admin-border, #345070)" }}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <FaExclamationTriangle className="w-7 h-7" />
            </div>
            <h1 className="font-bold text-xl mb-2" style={{ color: "var(--admin-text-primary)" }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--admin-text-muted)" }}>
              An unexpected error occurred in the admin panel. Try reloading or return to the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--admin-accent, #3b82f6)", minHeight: 44 }}
              >
                <FaRedo className="w-4 h-4" /> Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-primary)", minHeight: 44 }}
              >
                <FaHome className="w-4 h-4" /> Go Home
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
