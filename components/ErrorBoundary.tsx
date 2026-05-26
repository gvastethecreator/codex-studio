import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { runtimeLogger } from '../utils/runtimeLogger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    runtimeLogger.error('Uncaught render error', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-950/50 border border-red-500/20 rounded-2xl">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-lg font-black text-zinc-200 uppercase tracking-widest mb-2">
            System Error
          </h2>
          <p className="text-xs text-zinc-500 text-center max-w-md">
            {this.props.fallbackMessage ||
              'A critical error occurred while rendering this component. Review the session logs or devtools output for details.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
