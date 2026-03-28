import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-bg text-text flex items-center justify-center p-6">
          <div className="max-w-[420px] w-full rounded-[20px] border border-white/20 bg-surface p-6 text-center">
            <h1 className="font-display text-xl font-bold mb-2">Something Broke</h1>
            <p className="text-sm text-text-muted mb-4">
              We hit a snag. Refresh the app and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] px-5 py-2.5 font-semibold"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
