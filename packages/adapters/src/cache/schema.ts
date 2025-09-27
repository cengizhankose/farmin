// SQLite database schema for historical data caching
export interface CacheEntry {
  id: string;
  key: string;
  data: string; // JSON string
  ttl: number; // Time to live in milliseconds
  createdAt: number;
  expiresAt: number;
  updatedAt: number;
  lastAccessed: number;
  accessCount: number;
}

export interface VolumeCacheEntry {
  id: string;
  protocol: string;
  pool: string;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  concentrationRisk: number;
  timestamp: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserMetricsCacheEntry {
  id: string;
  protocol: string;
  uniqueUsers24h: number;
  uniqueUsers7d: number;
  uniqueUsers30d: number;
  activeWallets: number;
  newUsers: number;
  userRetention: number;
  timestamp: number;
  createdAt: number;
  updatedAt: number;
}

export interface AggregatedMetrics {
  id: string;
  chain: string;
  totalVolume24h: number;
  totalVolume7d: number;
  totalVolume30d: number;
  totalUsers24h: number;
  totalUsers7d: number;
  totalUsers30d: number;
  protocolCount: number;
  timestamp: number;
  createdAt: number;
  updatedAt: number;
}

// Database initialization SQL
export const SCHEMA_SQL = `
-- Main cache table for generic key-value caching
CREATE TABLE IF NOT EXISTS cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  data TEXT NOT NULL,
  ttl INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  lastAccessed INTEGER NOT NULL,
  accessCount INTEGER DEFAULT 0
);

-- Volume data cache
CREATE TABLE IF NOT EXISTS volume_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocol TEXT NOT NULL,
  pool TEXT NOT NULL,
  volume24h REAL DEFAULT 0,
  volume7d REAL DEFAULT 0,
  volume30d REAL DEFAULT 0,
  concentrationRisk REAL DEFAULT 0,
  timestamp INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  UNIQUE(protocol, pool)
);

-- User metrics cache
CREATE TABLE IF NOT EXISTS user_metrics_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocol TEXT NOT NULL,
  uniqueUsers24h INTEGER DEFAULT 0,
  uniqueUsers7d INTEGER DEFAULT 0,
  uniqueUsers30d INTEGER DEFAULT 0,
  activeWallets INTEGER DEFAULT 0,
  newUsers INTEGER DEFAULT 0,
  userRetention REAL DEFAULT 0,
  timestamp INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  UNIQUE(protocol)
);

-- Aggregated metrics cache
CREATE TABLE IF NOT EXISTS aggregated_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain TEXT NOT NULL,
  totalVolume24h REAL DEFAULT 0,
  totalVolume7d REAL DEFAULT 0,
  totalVolume30d REAL DEFAULT 0,
  totalUsers24h INTEGER DEFAULT 0,
  totalUsers7d INTEGER DEFAULT 0,
  totalUsers30d INTEGER DEFAULT 0,
  protocolCount INTEGER DEFAULT 0,
  timestamp INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  UNIQUE(chain)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expiresAt);
CREATE INDEX IF NOT EXISTS idx_cache_last_accessed ON cache(lastAccessed);

CREATE INDEX IF NOT EXISTS idx_volume_protocol ON volume_cache(protocol);
CREATE INDEX IF NOT EXISTS idx_volume_timestamp ON volume_cache(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_metrics_protocol ON user_metrics_cache(protocol);
CREATE INDEX IF NOT EXISTS idx_user_metrics_timestamp ON user_metrics_cache(timestamp);

CREATE INDEX IF NOT EXISTS idx_aggregated_chain ON aggregated_metrics(chain);
CREATE INDEX IF NOT EXISTS idx_aggregated_timestamp ON aggregated_metrics(timestamp);

-- Cleanup triggers for expired entries
CREATE TRIGGER IF NOT EXISTS cleanup_expired_cache
AFTER INSERT ON cache
BEGIN
  DELETE FROM cache WHERE expiresAt < strftime('%s', 'subsec') * 1000;
END;
`;

// Utility queries
export const CLEANUP_QUERIES = [
  // Delete expired cache entries
  "DELETE FROM cache WHERE expiresAt < strftime('%s', 'subsec') * 1000",

  // Delete old volume data (keep last 30 days)
  "DELETE FROM volume_cache WHERE timestamp < strftime('%s', 'subsec') * 1000 - (30 * 24 * 60 * 60 * 1000)",

  // Delete old user metrics (keep last 30 days)
  "DELETE FROM user_metrics_cache WHERE timestamp < strftime('%s', 'subsec') * 1000 - (30 * 24 * 60 * 60 * 1000)",

  // Delete old aggregated metrics (keep last 30 days)
  "DELETE FROM aggregated_metrics WHERE timestamp < strftime('%s', 'subsec') * 1000 - (30 * 24 * 60 * 60 * 1000)",
];

export const CACHE_STATS_QUERIES = {
  totalEntries: "SELECT COUNT(*) as count FROM cache",
  expiredEntries: "SELECT COUNT(*) as count FROM cache WHERE expiresAt < strftime('%s', 'subsec') * 1000",
  volumeEntries: "SELECT COUNT(*) as count FROM volume_cache",
  userMetricsEntries: "SELECT COUNT(*) as count FROM user_metrics_cache",
  aggregatedEntries: "SELECT COUNT(*) as count FROM aggregated_metrics",
  averageTTL: "SELECT AVG(ttl) as avgTtl FROM cache",
  hitRate: "SELECT (SELECT COUNT(*) FROM cache WHERE accessCount > 0) * 100.0 / COUNT(*) as hitRate FROM cache",
};