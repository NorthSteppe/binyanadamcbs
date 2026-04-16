import { Component, ErrorInfo, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  children: ReactNode;
  /** When this prop changes, the boundary resets. Pass location.key for route resets. */
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when the route changes
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            An unexpected error occurred on this page.
          </p>
          {this.state.error && (
            <pre className="text-xs text-left bg-muted rounded-lg p-3 max-w-lg overflow-auto max-h-40 text-destructive">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2 rounded-full border border-border text-sm font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Route-aware error boundary — automatically resets when the user navigates
 * to a new page, so a crash on one page never bleeds into another.
 * Must be rendered inside a <BrowserRouter>.
 */
export const RouteErrorBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.key}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
