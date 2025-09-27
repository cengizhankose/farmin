'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { errorHandler, ErrorType, ErrorSeverity } from '@adapters/core';

interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  retryCount: number;
  recoveryCount: number;
  averageRecoveryTime: number;
}

interface RecentError {
  type: string;
  severity: string;
  message: string;
  timestamp: number;
  component?: string;
  retryable: boolean;
}

export function ErrorMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);

  useEffect(() => {
    if (isVisible) {
      fetchErrorStats();
    }
  }, [isVisible]);

  const fetchErrorStats = async () => {
    try {
      const response = await fetch('/api/errors/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data.metrics);
        setRecentErrors(data.data.recentErrors);
      }
    } catch (error) {
      console.error('Failed to fetch error stats:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-600/20';
      case 'high': return 'text-orange-400 bg-orange-600/20';
      case 'medium': return 'text-yellow-400 bg-yellow-600/20';
      case 'low': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(!isVisible)}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center text-lg
          ${isVisible ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
          text-white shadow-lg transition-colors relative
        `}
      >
        {isVisible ? '✕' : '⚠️'}
        {/* Error indicator dot */}
        {!isVisible && stats && stats.totalErrors > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Error Dashboard */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
              <h3 className="text-white font-bold flex items-center justify-between">
                <span>⚠️ Error Monitor</span>
                <button
                  onClick={fetchErrorStats}
                  className="text-white/80 hover:text-white text-sm"
                >
                  🔄
                </button>
              </h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {stats ? (
                <>
                  {/* Error Summary */}
                  <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3">
                    <h4 className="text-red-300 font-semibold mb-2">Error Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Errors:</span>
                        <span className="text-white font-medium">{stats.totalErrors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Retry Rate:</span>
                        <span className="text-green-400 font-medium">
                          {stats.retryCount > 0 ? ((stats.recoveryCount / stats.retryCount) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Recovery:</span>
                        <span className="text-blue-400 font-medium">
                          {stats.averageRecoveryTime.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Critical/High:</span>
                        <span className="text-red-400 font-medium">
                          {(stats.errorsBySeverity.critical || 0) + (stats.errorsBySeverity.high || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Errors by Type */}
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                    <h4 className="text-blue-300 font-semibold mb-2">Errors by Type</h4>
                    <div className="space-y-1">
                      {Object.entries(stats.errorsByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-gray-400 capitalize">{type.replace('_', ' ')}:</span>
                          <span className="text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Errors */}
                  <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                    <h4 className="text-purple-300 font-semibold mb-2">Recent Errors</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {recentErrors.length > 0 ? (
                        recentErrors.map((error, index) => (
                          <div key={index} className="bg-gray-800 rounded p-2 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-2 py-1 rounded ${getSeverityColor(error.severity)}`}>
                                {error.severity}
                              </span>
                              <span className="text-gray-500">{formatTime(error.timestamp)}</span>
                            </div>
                            <div className="text-gray-300 font-medium mb-1">
                              {error.type.replace('_', ' ')}
                            </div>
                            <div className="text-gray-400 text-xs truncate">
                              {error.message}
                            </div>
                            {error.component && (
                              <div className="text-gray-500 text-xs mt-1">
                                Component: {error.component}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-4">
                          No recent errors 🎉
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                    <h4 className="text-green-300 font-semibold mb-2">System Health</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 font-medium">
                          {stats.errorsBySeverity.critical === 0 && stats.errorsBySeverity.high === 0 ? 'Healthy' : 'Issues Detected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Recovery Rate:</span>
                        <span className={`${stats.retryCount > 0 && stats.recoveryCount / stats.retryCount > 0.8 ? 'text-green-400' : 'text-yellow-400'} font-medium`}>
                          {stats.retryCount > 0 ? ((stats.recoveryCount / stats.retryCount) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm">Loading error data...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <button
                  onClick={() => {
                    errorHandler.clearHistory();
                    fetchErrorStats();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Clear History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}