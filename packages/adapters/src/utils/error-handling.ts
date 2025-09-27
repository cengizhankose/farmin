/**
 * Comprehensive Error Handling Strategy
 * Provides centralized error management, logging, and recovery mechanisms
 */

export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  NOT_FOUND = 'not_found',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  component?: string;
  endpoint?: string;
  userId?: string;
  requestId?: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

export interface AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  context: ErrorContext;
  retryable: boolean;
  suggestions?: string[];
  code?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  retryCount: number;
  recoveryCount: number;
  averageRecoveryTime: number;
}

export class ErrorHandler {
  private errors: AppError[] = [];
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {} as Record<ErrorType, number>,
    errorsBySeverity: {} as Record<ErrorSeverity, number>,
    retryCount: 0,
    recoveryCount: 0,
    averageRecoveryTime: 0
  };
  private subscribers: Array<(error: AppError) => void> = [];
  private maxErrorHistory = 1000;

  constructor() {
    this.initializeErrorMetrics();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Create a standardized application error
   */
  createError(
    message: string,
    type: ErrorType,
    severity: ErrorSeverity,
    context: Partial<ErrorContext> = {},
    retryable: boolean = false,
    suggestions?: string[]
  ): AppError {
    const error: AppError = {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}Error`,
      message,
      type,
      severity,
      retryable,
      suggestions,
      context: {
        timestamp: Date.now(),
        ...context
      }
    };

    return error;
  }

  /**
   * Handle an error with logging and metrics
   */
  handleError(error: Error | AppError, context: Partial<ErrorContext> = {}): AppError {
    const appError = this.normalizeError(error, context);

    // Log error
    this.logError(appError);

    // Update metrics
    this.updateMetrics(appError);

    // Notify subscribers
    this.notifySubscribers(appError);

    // Add to history
    this.addToHistory(appError);

    return appError;
  }

  /**
   * Execute a function with comprehensive error handling
   */
  async executeWithErrorHandling<T>(
    fn: () => Promise<T>,
    options: {
      retries?: number;
      fallback?: () => Promise<T>;
      timeout?: number;
      context?: Partial<ErrorContext>;
      errorHandler?: (error: AppError) => void;
    } = {}
  ): Promise<T> {
    const {
      retries = 3,
      fallback,
      timeout = 30000,
      context = {},
      errorHandler
    } = options;

    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Add timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        );

        const result = await Promise.race([fn(), timeoutPromise]);

        // If we get here, the operation succeeded
        if (attempt > 1) {
          this.metrics.recoveryCount++;
          const recoveryTime = Date.now() - lastError!.context.timestamp;
          this.updateRecoveryTime(recoveryTime);
        }

        return result;
      } catch (error) {
        lastError = this.handleError(error as Error, {
          ...context,
          additionalData: {
            ...context.additionalData,
            attempt,
            maxAttempts: retries
          }
        });

        this.metrics.retryCount++;

        if (errorHandler) {
          errorHandler(lastError);
        }

        // Don't retry if error is not retryable or this is the last attempt
        if (!lastError.retryable || attempt === retries) {
          break;
        }

        // Exponential backoff before retry
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we have a fallback, use it
    if (fallback) {
      try {
        return await fallback();
      } catch (fallbackError) {
        const fallbackAppError = this.handleError(fallbackError as Error, {
          ...context,
          additionalData: {
            ...context.additionalData,
            fallbackError: true
          }
        });
        throw fallbackAppError;
      }
    }

    // Throw the last error if no fallback
    throw lastError;
  }

  /**
   * Retry a function with specific conditions
   */
  async retryWithCondition<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: AppError) => boolean,
    options: {
      maxRetries?: number;
      delay?: number;
      context?: Partial<ErrorContext>;
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000, context = {} } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const appError = this.handleError(error as Error, context);

        if (!shouldRetry(appError) || attempt === maxRetries) {
          throw appError;
        }

        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw new Error('Retry failed unexpectedly');
  }

  /**
   * Subscribe to error notifications
   */
  subscribe(callback: (error: AppError) => void): () => void {
    this.subscribers.push(callback);

    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get error metrics
   */
  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errors = [];
    console.log('Error history cleared');
  }

  /**
   * Get error suggestions based on type
   */
  getErrorSuggestions(errorType: ErrorType): string[] {
    const suggestions: Record<ErrorType, string[]> = {
      [ErrorType.NETWORK]: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact your network administrator'
      ],
      [ErrorType.API]: [
        'Check the API documentation',
        'Verify your API credentials',
        'Contact the API provider'
      ],
      [ErrorType.VALIDATION]: [
        'Check your input parameters',
        'Verify data format requirements',
        'Review validation rules'
      ],
      [ErrorType.TIMEOUT]: [
        'Increase timeout value',
        'Check network connectivity',
        'Try again later'
      ],
      [ErrorType.RATE_LIMIT]: [
        'Wait before making another request',
        'Implement request throttling',
        'Contact the service provider for higher limits'
      ],
      [ErrorType.AUTHENTICATION]: [
        'Verify your credentials',
        'Check authentication token',
        'Ensure proper permissions'
      ],
      [ErrorType.NOT_FOUND]: [
        'Verify the resource exists',
        'Check the URL or identifier',
        'Contact support if the resource should exist'
      ],
      [ErrorType.INTERNAL]: [
        'Try again later',
        'Contact support if the problem persists',
        'Check system status'
      ],
      [ErrorType.UNKNOWN]: [
        'Try refreshing the page',
        'Contact support with details',
        'Check browser console for more information'
      ]
    };

    return suggestions[errorType] || ['Try again', 'Contact support'];
  }

  private normalizeError(error: Error | AppError, context: Partial<ErrorContext>): AppError {
    if ('type' in error && 'severity' in error) {
      // Already an AppError
      return {
        ...error,
        context: {
          ...error.context,
          ...context,
          additionalData: {
            ...error.context.additionalData,
            ...context.additionalData
          }
        }
      };
    }

    // Convert standard Error to AppError
    let type: ErrorType = ErrorType.UNKNOWN;
    let severity: ErrorSeverity = ErrorSeverity.MEDIUM;
    let retryable = true;

    // Determine error type based on message or name
    if (error.message.includes('network') || error.message.includes('fetch')) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
    } else if (error.message.includes('timeout')) {
      type = ErrorType.TIMEOUT;
      severity = ErrorSeverity.MEDIUM;
    } else if (error.message.includes('401') || error.message.includes('403')) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      retryable = false;
    } else if (error.message.includes('404')) {
      type = ErrorType.NOT_FOUND;
      severity = ErrorSeverity.LOW;
      retryable = false;
    } else if (error.message.includes('429')) {
      type = ErrorType.RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      retryable = false;
    }

    return this.createError(
      error.message,
      type,
      severity,
      context,
      retryable,
      this.getErrorSuggestions(type)
    );
  }

  private logError(error: AppError): void {
    const logMessage = `[${error.severity.toUpperCase()}] ${error.type}: ${error.message}`;

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(logMessage, error.context);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, error.context);
        break;
      case ErrorSeverity.LOW:
        console.info(logMessage, error.context);
        break;
    }
  }

  private updateMetrics(error: AppError): void {
    this.metrics.totalErrors++;
    this.metrics.errorsByType[error.type] = (this.metrics.errorsByType[error.type] || 0) + 1;
    this.metrics.errorsBySeverity[error.severity] = (this.metrics.errorsBySeverity[error.severity] || 0) + 1;
  }

  private updateRecoveryTime(recoveryTime: number): void {
    this.metrics.averageRecoveryTime =
      (this.metrics.averageRecoveryTime * (this.metrics.recoveryCount - 1) + recoveryTime) / this.metrics.recoveryCount;
  }

  private notifySubscribers(error: AppError): void {
    this.subscribers.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error handler subscriber:', callbackError);
      }
    });
  }

  private addToHistory(error: AppError): void {
    this.errors.push(error);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrorHistory) {
      this.errors = this.errors.slice(-this.maxErrorHistory);
    }
  }

  private initializeErrorMetrics(): void {
    Object.values(ErrorType).forEach(type => {
      this.metrics.errorsByType[type] = 0;
    });

    Object.values(ErrorSeverity).forEach(severity => {
      this.metrics.errorsBySeverity[severity] = 0;
    });
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = this.handleError(event.reason, {
          component: 'global',
          additionalData: { unhandledRejection: true }
        });

        console.error('Unhandled promise rejection:', error);
      });

      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        const error = this.handleError(event.error, {
          component: 'global',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });

        console.error('Uncaught error:', error);
      });
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error patterns
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    retries?: number;
    fallback?: () => ReturnType<T>;
    context?: Partial<ErrorContext>;
  }
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>) => {
    return errorHandler.executeWithErrorHandling(
      () => fn(...args),
      {
        ...options,
        context: options?.context
      }
    );
  };
};

export const createSafeFunction = <T extends (...args: any[]) => any>(
  fn: T,
  defaultValue: ReturnType<T>,
  options?: {
    context?: Partial<ErrorContext>;
    errorHandler?: (error: AppError) => void;
  }
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = errorHandler.handleError(error as Error, options?.context);

      if (options?.errorHandler) {
        options.errorHandler(appError);
      }

      return defaultValue;
    }
  };
};