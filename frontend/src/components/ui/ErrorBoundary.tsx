import { Component, type ErrorInfo, type ReactNode } from 'react';

import Button from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('AR component failed to load', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-card p-6 text-center">
          <div className="max-w-sm space-y-4">
            <p className="font-display text-2xl font-bold text-white">AR failed to load.</p>
            <p className="text-sm text-white/70">Try refreshing the page or enabling camera access again.</p>
            <Button onClick={this.handleRetry}>Retry</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
