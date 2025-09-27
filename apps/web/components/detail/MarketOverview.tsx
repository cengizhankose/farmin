'use client';

import { motion } from 'framer-motion';
import { MarketMetrics, PerformanceMetrics } from '@adapters/core';

interface MarketOverviewProps {
  marketMetrics: MarketMetrics;
  performanceMetrics: PerformanceMetrics;
}

export function MarketOverview({ marketMetrics, performanceMetrics }: MarketOverviewProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">📊</span>
        Market Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">Volume Metrics</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm mb-1">24h Volume</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(marketMetrics.volume24h)}
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm mb-1">7d Volume</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(marketMetrics.volume7d)}
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm mb-1">30d Volume</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(marketMetrics.volume30d)}
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm mb-1">Volume Ratio (7d/24h)</div>
              <div className="text-xl font-bold text-white">
                {marketMetrics.volume24h > 0 ? (marketMetrics.volume7d / marketMetrics.volume24h / 7).toFixed(2) : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-300 mb-3">Fee Metrics</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-600/20 rounded-lg p-4">
              <div className="text-green-300 text-sm mb-1">24h Fees</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(marketMetrics.fees24h)}
              </div>
            </div>
            <div className="bg-green-600/20 rounded-lg p-4">
              <div className="text-green-300 text-sm mb-1">7d Fees</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(marketMetrics.fees7d)}
              </div>
            </div>
            <div className="bg-green-600/20 rounded-lg p-4">
              <div className="text-green-300 text-sm mb-1">30d Fees</div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(marketMetrics.fees30d)}
              </div>
            </div>
            <div className="bg-green-600/20 rounded-lg p-4">
              <div className="text-green-300 text-sm mb-1">Fee Rate</div>
              <div className="text-xl font-bold text-white">
                {((marketMetrics.fees24h / marketMetrics.volume24h) * 100).toFixed(3)}%
              </div>
            </div>
          </div>
        </div>

        {/* Market Depth */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">Market Depth</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded-lg">
              <span className="text-blue-300">1% Depth</span>
              <span className="text-white font-semibold">
                {formatCurrency(marketMetrics.depth.depth1Percent)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded-lg">
              <span className="text-blue-300">5% Depth</span>
              <span className="text-white font-semibold">
                {formatCurrency(marketMetrics.depth.depth5Percent)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded-lg">
              <span className="text-blue-300">10% Depth</span>
              <span className="text-white font-semibold">
                {formatCurrency(marketMetrics.depth.depth10Percent)}
              </span>
            </div>
          </div>
        </div>

        {/* Utilization & Slippage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-300 mb-3">Pool Health</h3>

          <div className="space-y-3">
            <div className="bg-orange-600/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-orange-300">Utilization Rate</span>
                <span className="text-white font-bold text-lg">
                  {(marketMetrics.utilizationRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${marketMetrics.utilizationRate * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-orange-300 text-sm font-medium">Slippage</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-orange-600/20 rounded p-2">
                  <div className="text-xs text-orange-300">$10K</div>
                  <div className="text-sm text-white font-semibold">
                    {(marketMetrics.slippage.slippage10k * 100).toFixed(3)}%
                  </div>
                </div>
                <div className="bg-orange-600/20 rounded p-2">
                  <div className="text-xs text-orange-300">$100K</div>
                  <div className="text-sm text-white font-semibold">
                    {(marketMetrics.slippage.slippage100k * 100).toFixed(3)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-600/20 rounded-lg p-4">
              <div className="text-orange-300 text-sm mb-1">Price Impact Volatility</div>
              <div className="text-white font-semibold">
                {(marketMetrics.priceImpact.volatility * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-pink-300 mb-3">Performance Summary</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-pink-600/20 rounded-lg p-4 text-center">
              <div className="text-pink-300 text-sm mb-1">Daily Return</div>
              <div className={`text-lg font-bold ${
                performanceMetrics.totalReturns.daily >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceMetrics.totalReturns.daily >= 0 ? '+' : ''}
                {performanceMetrics.totalReturns.daily.toFixed(2)}%
              </div>
            </div>
            <div className="bg-pink-600/20 rounded-lg p-4 text-center">
              <div className="text-pink-300 text-sm mb-1">Weekly Return</div>
              <div className={`text-lg font-bold ${
                performanceMetrics.totalReturns.weekly >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceMetrics.totalReturns.weekly >= 0 ? '+' : ''}
                {performanceMetrics.totalReturns.weekly.toFixed(2)}%
              </div>
            </div>
            <div className="bg-pink-600/20 rounded-lg p-4 text-center">
              <div className="text-pink-300 text-sm mb-1">Monthly Return</div>
              <div className={`text-lg font-bold ${
                performanceMetrics.totalReturns.monthly >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {performanceMetrics.totalReturns.monthly >= 0 ? '+' : ''}
                {performanceMetrics.totalReturns.monthly.toFixed(2)}%
              </div>
            </div>
            <div className="bg-pink-600/20 rounded-lg p-4 text-center">
              <div className="text-pink-300 text-sm mb-1">Sharpe Ratio</div>
              <div className="text-lg font-bold text-white">
                {performanceMetrics.riskAdjustedReturns.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}