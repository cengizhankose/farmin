/**
 * Performance Optimization Utilities
 * Provides caching, deduplication, and performance monitoring for API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

interface PerformanceMetrics {
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  totalDataSize: number;
  errorRate: number;
}

interface RequestOptions {
  cacheKey?: string;
  ttl?: number;
  retries?: number;
  timeout?: number;
  dedupeKey?: string;
}

export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    totalDataSize: 0,
    errorRate: 0
  };

  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheSize = 1000;
  private readonly cleanupInterval = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Execute a function with performance optimizations
   */
  async execute<T>(
    fn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const startTime = performance.now();
    const { cacheKey, ttl = this.defaultTTL, retries = 3, timeout = 30000, dedupeKey } = options;

    try {
      this.metrics.requestCount++;

      // Check cache first
      if (cacheKey) {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          this.updateResponseTime(startTime);
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Deduplicate concurrent requests
      const requestKey = dedupeKey || cacheKey || Math.random().toString(36).substr(2, 9);
      let promise = this.pendingRequests.get(requestKey);

      if (!promise) {
        promise = this.executeWithRetry(fn, retries, timeout);
        this.pendingRequests.set(requestKey, promise);

        try {
          const result = await promise;

          // Cache the result if cacheKey is provided
          if (cacheKey) {
            this.setToCache(cacheKey, result, ttl);
          }

          return result;
        } finally {
          this.pendingRequests.delete(requestKey);
        }
      }

      return await promise;
    } catch (error) {
      this.metrics.errorRate = ((this.metrics.errorRate * (this.metrics.requestCount - 1) + 1) / this.metrics.requestCount);
      throw error;
    } finally {
      this.updateResponseTime(startTime);
    }
  }

  /**
   * Execute multiple functions in parallel with batching
   */
  async batchExecute<T>(
    functions: Array<() => Promise<T>>,
    options: RequestOptions = {}
  ): Promise<T[]> {
    const batchSize = 5; // Process 5 requests at a time
    const results: T[] = [];

    for (let i = 0; i < functions.length; i += batchSize) {
      const batch = functions.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(fn => this.execute(fn, options))
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch execution failed:', result.reason);
        }
      }
    }

    return results;
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Performance cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    entries: number;
    totalSize: number;
    hitRate: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const hitRate = this.metrics.requestCount > 0 ?
      (this.metrics.cacheHits / this.metrics.requestCount) * 100 : 0;

    return {
      entries: this.cache.size,
      totalSize,
      hitRate,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    timeout: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        // Add timeout to the promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        );

        return await Promise.race([fn(), timeoutPromise]);
      } catch (error) {
        lastError = error as Error;
        if (i === retries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Unknown error');
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setToCache<T>(key: string, data: T, ttl: number): void {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntries();
    }

    const size = JSON.stringify(data).length;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      size
    });

    this.metrics.totalDataSize += size;
  }

  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = Math.floor(this.maxCacheSize * 0.2); // Remove 20% of entries
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      this.metrics.totalDataSize -= entries[i][1].size;
    }
  }

  private updateResponseTime(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) / this.metrics.requestCount;
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cleanupInterval);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.metrics.totalDataSize -= entry.size;
      }
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Utility functions for common patterns
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const createDataFetcher = <T>(
  fetchFn: () => Promise<T>,
  options: RequestOptions = {}
) => {
  return () => performanceOptimizer.execute(fetchFn, options);
};