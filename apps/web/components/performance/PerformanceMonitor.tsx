'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceStats {
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  totalDataSize: number;
  errorRate: number;
  cacheSize: number;
  hitRate: number;
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchPerformanceStats();
    }
  }, [isVisible]);

  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch('/api/performance/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch performance stats:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(!isVisible)}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center text-lg
          ${isVisible ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          text-white shadow-lg transition-colors
        `}
      >
        {isVisible ? '✕' : '⚡'}
      </motion.button>

      {/* Performance Dashboard */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <h3 className="text-white font-bold flex items-center justify-between">
                <span>⚡ Performance Monitor</span>
                <button
                  onClick={fetchPerformanceStats}
                  className="text-white/80 hover:text-white text-sm"
                >
                  🔄
                </button>
              </h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {stats ? (
                <>
                  {/* Cache Performance */}
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                    <h4 className="text-green-300 font-semibold mb-2">Cache Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hit Rate:</span>
                        <span className="text-green-400 font-medium">{stats.hitRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cache Size:</span>
                        <span className="text-white">{stats.cacheSize} entries</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data Size:</span>
                        <span className="text-white">{formatBytes(stats.totalDataSize)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Request Performance */}
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                    <h4 className="text-blue-300 font-semibold mb-2">Request Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Requests:</span>
                        <span className="text-white">{stats.requestCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Response:</span>
                        <span className="text-blue-400 font-medium">
                          {formatResponseTime(stats.averageResponseTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Error Rate:</span>
                        <span className={`${stats.errorRate > 5 ? 'text-red-400' : 'text-green-400'} font-medium`}>
                          {stats.errorRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cache Stats */}
                  <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                    <h4 className="text-purple-300 font-semibold mb-2">Cache Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cache Hits:</span>
                        <span className="text-green-400">{stats.cacheHits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cache Misses:</span>
                        <span className="text-orange-400">{stats.cacheMisses}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Tips */}
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                    <h4 className="text-yellow-300 font-semibold mb-2">💡 Optimization Tips</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      {stats.hitRate < 80 && (
                        <p>• Consider increasing cache TTL for better hit rates</p>
                      )}
                      {stats.averageResponseTime > 1000 && (
                        <p>• High response times detected, check API endpoints</p>
                      )}
                      {stats.errorRate > 5 && (
                        <p>• High error rate, review error handling</p>
                      )}
                      {stats.hitRate >= 80 && stats.averageResponseTime < 500 && stats.errorRate < 2 && (
                        <p>• Excellent performance! 🎉</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm">Loading performance data...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}