'use client';

import { motion } from 'framer-motion';
import { HistoricalData, PerformanceMetrics } from '@adapters/core';

interface PerformanceChartProps {
  historicalData: HistoricalData;
  performanceMetrics: PerformanceMetrics;
}

export function PerformanceChart({ historicalData, performanceMetrics }: PerformanceChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">📈</span>
        Performance Analysis
      </h2>

      <div className="space-y-6">
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-4">📊</div>
          <p>Performance charts and historical data visualization</p>
          <p className="text-sm mt-2">TVL, APY, Volume trends over time</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-600/20 rounded-lg p-4 text-center">
            <div className="text-purple-300 text-sm">Daily Return</div>
            <div className="text-xl font-bold text-white">
              {performanceMetrics.totalReturns.daily.toFixed(2)}%
            </div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-4 text-center">
            <div className="text-blue-300 text-sm">Max Drawdown</div>
            <div className="text-xl font-bold text-white">
              {performanceMetrics.drawdown.maxDrawdown.toFixed(2)}%
            </div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-4 text-center">
            <div className="text-green-300 text-sm">Sharpe Ratio</div>
            <div className="text-xl font-bold text-white">
              {performanceMetrics.riskAdjustedReturns.sharpeRatio.toFixed(2)}
            </div>
          </div>
          <div className="bg-orange-600/20 rounded-lg p-4 text-center">
            <div className="text-orange-300 text-sm">Volatility</div>
            <div className="text-xl font-bold text-white">
              {performanceMetrics.volatility.daily.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}