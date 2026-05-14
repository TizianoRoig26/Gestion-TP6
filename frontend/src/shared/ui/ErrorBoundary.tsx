import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Algo salió mal
          </h2>
          <p className="text-text-secondary mb-8">
            Ocurrió un error inesperado. Recargá la página e intentá de nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-500 text-white px-6 py-2 rounded-button hover:bg-primary-600 transition-colors"
          >
            Recargar página
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-8 text-left bg-surface-tertiary p-4 rounded-lg text-sm overflow-auto max-w-2xl mx-auto">
              {this.state.error.message}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
