export {
  CacheService,
  CacheStats,
  CacheConfig,
  cacheService,
} from './CacheService';

export {
  BackgroundSyncService,
  SyncConfig,
  SyncStats,
  backgroundSyncService,
} from './BackgroundSync';

export {
  CacheEntry,
  VolumeCacheEntry,
  UserMetricsCacheEntry,
  AggregatedMetrics,
  SCHEMA_SQL,
  CLEANUP_QUERIES,
  CACHE_STATS_QUERIES,
} from './schema';

// Helper utilities for cache keys
export class CacheKeys {
  static protocolVolume(protocol: string, pool: string): string {
    return `volume:${protocol}:${pool}`;
  }

  static protocolUserMetrics(protocol: string): string {
    return `user_metrics:${protocol}`;
  }

  static aggregatedMetrics(chain: string): string {
    return `aggregated:${chain}`;
  }

  static historicalData(protocol: string): string {
    return `historical:${protocol}`;
  }

  static apiResponse(api: string, endpoint: string, params?: string): string {
    const key = `api:${api}:${endpoint}`;
    return params ? `${key}:${params}` : key;
  }
}

// Cache configuration presets
export const CACHE_PRESETS = {
  // Short-term cache for real-time data (2-5 minutes)
  REALTIME: {
    defaultTTL: 2 * 60 * 1000, // 2 minutes
    maxEntries: 1000,
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
  },

  // Medium-term cache for historical data (1-6 hours)
  HISTORICAL: {
    defaultTTL: 4 * 60 * 60 * 1000, // 4 hours
    maxEntries: 5000,
    cleanupInterval: 30 * 60 * 1000, // 30 minutes
  },

  // Long-term cache for aggregated metrics (12-24 hours)
  AGGREGATED: {
    defaultTTL: 12 * 60 * 60 * 1000, // 12 hours
    maxEntries: 100,
    cleanupInterval: 2 * 60 * 60 * 1000, // 2 hours
  },
};

// Cache utilities
export const CacheUtils = {
  // Generate cache-friendly key from parameters
  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.filter(Boolean).join(':')}`;
  },

  // Check if cached data is still fresh
  isFresh(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp < maxAge;
  },

  // Calculate cache hit rate
  calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  },

  // Format cache duration in human-readable format
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },
};