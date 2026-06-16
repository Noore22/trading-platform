'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-card rounded-2xl border border-gray-800 m-8">
          <AlertTriangle size={48} className="text-danger mb-4 animate-pulse" />
          <h2 className="text-lg font-bold text-white mb-2">Dashboard Render Exception</h2>
          <p className="text-textSecondary text-xs max-w-md mb-6 leading-relaxed">
            A React runtime error occurred during rendering this view.
          </p>
          <div className="bg-background text-danger font-mono text-[10px] p-4 rounded-xl max-w-lg overflow-x-auto border border-gray-900 mb-6 text-left w-full">
            {this.state.error?.toString()}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="py-2.5 px-6 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl transition"
          >
            Reset view state
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
