'use client';

import { motion } from 'framer-motion';
import { AdvancedAnalytics, PerformanceMetrics, MarketMetrics, SocialMetrics } from '@adapters/core';

interface AdvancedMetricsProps {
  analytics: AdvancedAnalytics;
  performanceMetrics: PerformanceMetrics;
  marketMetrics: MarketMetrics;
  socialMetrics: SocialMetrics;
}

export function AdvancedMetrics({ analytics, performanceMetrics, marketMetrics, socialMetrics }: AdvancedMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Efficiency Metrics */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">⚡</span>
          Efficiency Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-600/20 rounded-lg p-4 text-center">
            <div className="text-purple-300 text-sm">Fee Efficiency</div>
            <div className="text-xl font-bold text-white">
              {analytics.efficiencyMetrics.feeEfficiency.toFixed(1)}%
            </div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-4 text-center">
            <div className="text-blue-300 text-sm">Capital Efficiency</div>
            <div className="text-xl font-bold text-white">
              {analytics.efficiencyMetrics.capitalEfficiency.toFixed(1)}%
            </div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-4 text-center">
            <div className="text-green-300 text-sm">Volume Efficiency</div>
            <div className="text-xl font-bold text-white">
              {analytics.efficiencyMetrics.volumeEfficiency.toFixed(1)}%
            </div>
          </div>
          <div className="bg-orange-600/20 rounded-lg p-4 text-center">
            <div className="text-orange-300 text-sm">Overall Score</div>
            <div className="text-xl font-bold text-white">
              {analytics.efficiencyMetrics.overallScore.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* User Behavior */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">👥</span>
          User Behavior Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-600/20 rounded-lg p-4 text-center">
            <div className="text-purple-300 text-sm">24h Users</div>
            <div className="text-xl font-bold text-white">
              {analytics.userBehavior.uniqueUsers24h.toLocaleString()}
            </div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-4 text-center">
            <div className="text-blue-300 text-sm">7d Users</div>
            <div className="text-xl font-bold text-white">
              {analytics.userBehavior.uniqueUsers7d.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-4 text-center">
            <div className="text-green-300 text-sm">Retention Rate</div>
            <div className="text-xl font-bold text-white">
              {analytics.userBehavior.retentionRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-orange-600/20 rounded-lg p-4 text-center">
            <div className="text-orange-300 text-sm">Avg Deposit</div>
            <div className="text-xl font-bold text-white">
              ${analytics.userBehavior.avgDepositSize.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Market Position */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">🎯</span>
          Market Position
        </h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-4">📊</div>
          <p>Advanced market position and competitive analysis</p>
          <p className="text-sm mt-2">Market share, ranking, SWOT analysis</p>
        </div>
      </div>
    </motion.div>
  );
}