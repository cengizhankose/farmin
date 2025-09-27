import Database from 'better-sqlite3';
import {
  CacheEntry,
  VolumeCacheEntry,
  UserMetricsCacheEntry,
  AggregatedMetrics,
  SCHEMA_SQL,
  CLEANUP_QUERIES,
  CACHE_STATS_QUERIES
} from './schema';

export interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  volumeEntries: number;
  userMetricsEntries: number;
  aggregatedEntries: number;
  averageTtl: number;
  hitRate: number;
}

export interface CacheConfig {
  dbPath?: string;
  defaultTTL: number; // milliseconds
  maxEntries: number;
  cleanupInterval: number; // milliseconds
  enableStats: boolean;
}

export class CacheService {
  private db: Database.Database;
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      dbPath: './cache.db', // Use persistent database file by default
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxEntries: 10000,
      cleanupInterval: 10 * 60 * 1000, // 10 minutes
      enableStats: true,
      ...config,
    };

    // Initialize database
    this.db = new Database(this.config.dbPath);
    this.initializeDatabase();
    this.startCleanupTimer();
  }

  private initializeDatabase(): void {
    try {
      // Create schema
      this.db.exec(SCHEMA_SQL);

      // Run initial cleanup
      this.runCleanup();

      console.log('✅ Cache database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize cache database:', error);
      throw error;
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.runCleanup();
    }, this.config.cleanupInterval);

    console.log(`🕐 Cleanup timer started (interval: ${this.config.cleanupInterval}ms)`);
  }

  private runCleanup(): void {
    try {
      for (const query of CLEANUP_QUERIES) {
        const result = this.db.prepare(query).run();
        if (result.changes > 0) {
          console.log(`🧹 Cleaned up ${result.changes} expired entries`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to run cleanup:', error);
    }
  }

  // Generic cache operations
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO cache (key, data, ttl, createdAt, expiresAt, updatedAt, lastAccessed, accessCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `);

      stmt.run(
        key,
        JSON.stringify(data),
        ttl || this.config.defaultTTL,
        now,
        expiresAt,
        now,
        now
      );

      // Check if we need to prune old entries
      await this.pruneIfNeeded();
    } catch (error) {
      console.error(`❌ Failed to cache data for key "${key}":`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM cache WHERE key = ? AND expiresAt > ?');
      const now = Date.now();
      const row = stmt.get(key, now) as CacheEntry | undefined;

      if (row) {
        // Update access statistics
        this.db.prepare('UPDATE cache SET lastAccessed = ?, accessCount = accessCount + 1 WHERE key = ?')
          .run(now, key);

        return JSON.parse(row.data);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get cached data for key "${key}":`, error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare('DELETE FROM cache WHERE key = ?');
      const result = stmt.run(key);
      return result.changes > 0;
    } catch (error) {
      console.error(`❌ Failed to delete cached data for key "${key}":`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      this.db.exec('DELETE FROM cache');
      console.log('🗑️ Cache cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      throw error;
    }
  }

  // Volume cache operations
  async setVolumeData(protocol: string, pool: string, data: {
    volume24h: number;
    volume7d: number;
    volume30d: number;
    concentrationRisk: number;
  }): Promise<void> {
    try {
      const now = Date.now();
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO volume_cache
        (protocol, pool, volume24h, volume7d, volume30d, concentrationRisk, timestamp, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        protocol,
        pool,
        data.volume24h,
        data.volume7d,
        data.volume30d,
        data.concentrationRisk,
        now,
        now,
        now
      );
    } catch (error) {
      console.error(`❌ Failed to cache volume data for ${protocol}/${pool}:`, error);
      throw error;
    }
  }

  async getVolumeData(protocol: string, pool: string): Promise<VolumeCacheEntry | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM volume_cache WHERE protocol = ? AND pool = ?');
      const row = stmt.get(protocol, pool) as VolumeCacheEntry | undefined;
      return row || null;
    } catch (error) {
      console.error(`❌ Failed to get volume data for ${protocol}/${pool}:`, error);
      return null;
    }
  }

  // User metrics cache operations
  async setUserMetrics(protocol: string, data: {
    uniqueUsers24h: number;
    uniqueUsers7d: number;
    uniqueUsers30d: number;
    activeWallets: number;
    newUsers: number;
    userRetention: number;
  }): Promise<void> {
    try {
      const now = Date.now();
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO user_metrics_cache
        (protocol, uniqueUsers24h, uniqueUsers7d, uniqueUsers30d, activeWallets, newUsers, userRetention, timestamp, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        protocol,
        data.uniqueUsers24h,
        data.uniqueUsers7d,
        data.uniqueUsers30d,
        data.activeWallets,
        data.newUsers,
        data.userRetention,
        now,
        now,
        now
      );
    } catch (error) {
      console.error(`❌ Failed to cache user metrics for ${protocol}:`, error);
      throw error;
    }
  }

  async getUserMetrics(protocol: string): Promise<UserMetricsCacheEntry | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM user_metrics_cache WHERE protocol = ?');
      const row = stmt.get(protocol) as UserMetricsCacheEntry | undefined;
      return row || null;
    } catch (error) {
      console.error(`❌ Failed to get user metrics for ${protocol}:`, error);
      return null;
    }
  }

  // Aggregated metrics operations
  async setAggregatedMetrics(chain: string, data: {
    totalVolume24h: number;
    totalVolume7d: number;
    totalVolume30d: number;
    totalUsers24h: number;
    totalUsers7h: number;
    totalUsers30h: number;
    protocolCount: number;
  }): Promise<void> {
    try {
      const now = Date.now();
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO aggregated_metrics
        (chain, totalVolume24h, totalVolume7d, totalVolume30d, totalUsers24h, totalUsers7h, totalUsers30h, protocolCount, timestamp, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        chain,
        data.totalVolume24h,
        data.totalVolume7d,
        data.totalVolume30d,
        data.totalUsers24h,
        data.totalUsers7h,
        data.totalUsers30h,
        data.protocolCount,
        now,
        now,
        now
      );
    } catch (error) {
      console.error(`❌ Failed to cache aggregated metrics for ${chain}:`, error);
      throw error;
    }
  }

  async getAggregatedMetrics(chain: string): Promise<AggregatedMetrics | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM aggregated_metrics WHERE chain = ?');
      const row = stmt.get(chain) as AggregatedMetrics | undefined;
      return row || null;
    } catch (error) {
      console.error(`❌ Failed to get aggregated metrics for ${chain}:`, error);
      return null;
    }
  }

  // Statistics
  async getStats(): Promise<CacheStats> {
    try {
      const stats: CacheStats = {
        totalEntries: 0,
        expiredEntries: 0,
        volumeEntries: 0,
        userMetricsEntries: 0,
        aggregatedEntries: 0,
        averageTtl: 0,
        hitRate: 0,
      };

      for (const [key, query] of Object.entries(CACHE_STATS_QUERIES)) {
        try {
          const row = this.db.prepare(query).get() as any;
          if (row && typeof row.count === 'number') {
            stats[key as keyof CacheStats] = row.count;
          } else if (row && typeof row.avgTtl === 'number') {
            stats.averageTtl = row.avgTtl;
          } else if (row && typeof row.hitRate === 'number') {
            stats.hitRate = row.hitRate;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get cache stat "${key}":`, error);
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      throw error;
    }
  }

  // Prune old entries if cache is full
  private async pruneIfNeeded(): Promise<void> {
    try {
      const countResult = this.db.prepare('SELECT COUNT(*) as count FROM cache').get() as { count: number };

      if (countResult.count > this.config.maxEntries) {
        const toDelete = countResult.count - this.config.maxEntries + (this.config.maxEntries * 0.1); // Delete extra 10%

        const stmt = this.db.prepare(`
          DELETE FROM cache
          WHERE id IN (
            SELECT id FROM cache
            ORDER BY lastAccessed ASC
            LIMIT ?
          )
        `);

        const result = stmt.run(toDelete);
        console.log(`🗑️ Pruned ${result.changes} old cache entries`);
      }
    } catch (error) {
      console.error('❌ Failed to prune cache:', error);
    }
  }

  // Cleanup
  close(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    try {
      this.db.close();
      console.log('🔒 Cache database closed');
    } catch (error) {
      console.error('❌ Failed to close cache database:', error);
    }
  }
}

// Global instance with persistent database
export const cacheService = new CacheService({
  dbPath: './cache.db',
});