'use client';

import { Component, ReactNode, useState } from 'react';
import { errorHandler, ErrorType, ErrorSeverity } from '@adapters/core';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Handle error with our error handler
    errorHandler.handleError(error, {
      component: this.props.context || 'ErrorBoundary',
      additionalData: {
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      }
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center"
    >
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>

      <div className="bg-red-800/30 rounded-lg p-4 mb-6">
        <p className="text-red-300 text-sm font-mono break-all">
          {error.message}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <span>🔍</span>
          <span>Error details have been logged for debugging</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <span>🛠️</span>
          <span>Our team has been notified of this issue</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={retry}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          🔄 Try Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          🔄 Reload Page
        </motion.button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        If the problem persists, please contact support with the error details above.
      </div>
    </motion.div>
  );
}

// Hook-based error boundary for functional components
interface ErrorBoundaryHookResult {
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

export function useErrorBoundary(): ErrorBoundaryHookResult {
  const [error, setError] = useState<Error | null>(null);

  const clearError = () => setError(null);

  const handleError = (newError: Error) => {
    errorHandler.handleError(newError, {
      component: 'useErrorBoundary'
    });
    setError(newError);
  };

  return {
    error,
    setError: handleError,
    clearError
  };
}

// Async error boundary for data fetching
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ retry: () => void }>;
  onError?: (error: Error) => void;
}

export function AsyncErrorBoundary({ children, fallback, onError }: AsyncErrorBoundaryProps) {
  const { error, setError, clearError } = useErrorBoundary();

  const handleError = (err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  };

  if (error) {
    const FallbackComponent = fallback || DefaultErrorFallback;
    return <FallbackComponent error={error} retry={clearError} />;
  }

  return <>{children}</>;
}