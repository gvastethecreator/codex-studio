import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';
import { runtimeLogger } from '../utils/runtimeLogger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onDismiss?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    runtimeLogger.error('Uncaught render error', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className={
            this.props.onDismiss
              ? 'studio-dialog fixed bottom-6 right-6 z-[150] flex w-[min(28rem,calc(100vw-3rem))] max-h-[calc(100dvh-3rem)] flex-col items-center overflow-y-auto p-6 shadow-2xl'
              : 'w-full h-full flex flex-col items-center justify-center p-6 bg-[color:var(--wb-panel)]/50 border border-red-500/20 rounded-[var(--wb-radius)]'
          }
        >
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-[color:var(--wb-ink)] tracking-normal mb-2">
            System Error
          </h2>
          <p className="text-xs text-[color:var(--wb-muted)] text-center max-w-md">
            {this.props.fallbackMessage ||
              'A critical error occurred while rendering this component. Review the session logs or devtools output for details.'}
          </p>
          <button
            type="button"
            onClick={() =>
              this.props.onDismiss
                ? window.location.reload()
                : this.setState({ hasError: false, error: null })
            }
            className="mt-6 px-4 py-2 bg-red-500/10 text-[color:var(--wb-danger)] hover:bg-red-500/20 rounded-[var(--wb-radius)] text-xs font-bold tracking-normal transition-colors"
          >
            {this.props.onDismiss ? 'Reload Studio' : 'Retry'}
          </button>
          {this.props.onDismiss && (
            <button
              type="button"
              onClick={this.props.onDismiss}
              className="studio-ghost-control mt-3"
            >
              Close and return to Studio
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
