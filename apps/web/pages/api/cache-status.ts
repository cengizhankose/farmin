import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Try to initialize and test cache services
    const result: any = {
      cacheInitialized: false,
      backgroundSyncRunning: false,
      databaseCreated: false,
      cacheStats: null,
      syncStats: null,
      error: null
    };

    // Test cache service initialization (server-side only)
    try {
      console.log("🔍 Starting cache service initialization...");

      // First try to import better-sqlite3 directly
      console.log("📦 Testing better-sqlite3 import...");
      const Database = require('better-sqlite3');
      console.log("✅ better-sqlite3 imported successfully");

      // Initialize with explicit path
      const fs = require('fs');
      const path = require('path');
      console.log("📍 Current working directory:", process.cwd());
      const dbPath = path.join(process.cwd(), 'cache.db');
      console.log("📁 Database path:", dbPath);

      // Try to create a simple database first
      console.log("🗄️ Testing basic database creation...");
      const testDb = new Database(dbPath);
      testDb.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
      testDb.exec("INSERT INTO test (name) VALUES ('test')");
      const row = testDb.prepare('SELECT * FROM test').get();
      console.log("✅ Basic database test successful:", row);
      testDb.close();

      // Now try to import the CacheService
      console.log("📦 Importing CacheService...");
      const { CacheService } = await import("../../../../packages/adapters/dist/adapters/src/cache/CacheService.js");
      console.log("✅ CacheService imported successfully");

      // Create cache service instance
      console.log("🚀 Creating CacheService instance...");
      const cacheService = new CacheService({
        dbPath: dbPath,
        defaultTTL: 5 * 60 * 1000,
        enableStats: true
      });
      console.log("✅ CacheService instance created successfully");

      // Try to get cache stats to see if it's working
      const stats = await cacheService.getStats();
      result.cacheStats = stats;
      result.cacheInitialized = true;
      console.log("✅ Cache stats retrieved:", stats);

      // Check if database file exists
      if (fs.existsSync(dbPath)) {
        result.databaseCreated = true;
        result.databasePath = dbPath;
        const dbStats = fs.statSync(dbPath);
        result.databaseSize = dbStats.size;
        console.log("✅ Database file exists, size:", dbStats.size);
      }

    } catch (error) {
      result.error = `Cache initialization failed: ${error.message}`;
      console.error("❌ Cache initialization error:", error);
      console.error("❌ Error stack:", error.stack);
    }

    // Test background sync service
    try {
      const { backgroundSyncService } = await import("../../../../packages/adapters/dist/adapters/src/cache/index.js");
      const syncStats = backgroundSyncService.getStats();
      result.syncStats = syncStats;
      result.backgroundSyncRunning = true;
    } catch (error) {
      console.warn("Background sync not available:", error.message);
    }

    return res.status(200).json(result);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}