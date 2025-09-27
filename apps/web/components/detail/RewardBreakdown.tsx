'use client';

import { motion } from 'framer-motion';
import { RewardBreakdown } from '@adapters/core';

interface RewardBreakdownProps {
  rewardBreakdown: RewardBreakdown;
  expanded?: boolean;
}

export function RewardBreakdown({ rewardBreakdown, expanded = false }: RewardBreakdownProps) {
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
        <span className="mr-3">💰</span>
        Reward Breakdown
      </h2>

      <div className="space-y-6">
        {/* Total Rewards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-600/20 rounded-lg p-4">
            <div className="text-green-300 text-sm mb-1">Total APR</div>
            <div className="text-3xl font-bold text-white">
              {rewardBreakdown.totalRewards.totalAPR.toFixed(2)}%
            </div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-4">
            <div className="text-blue-300 text-sm mb-1">Total APY</div>
            <div className="text-3xl font-bold text-white">
              {rewardBreakdown.totalRewards.totalAPY.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Trading Fees */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300">Trading Fees</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm">Rate</div>
              <div className="text-lg font-bold text-white">
                {(rewardBreakdown.tradingFees.rate * 100).toFixed(3)}%
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm">24h Volume</div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(rewardBreakdown.tradingFees.volume24h)}
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm">24h Fees</div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(rewardBreakdown.tradingFees.fees24h)}
              </div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4">
              <div className="text-purple-300 text-sm">Fee APR</div>
              <div className="text-lg font-bold text-white">
                {rewardBreakdown.tradingFees.apr.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Rewards */}
        {rewardBreakdown.protocolRewards.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-300">Protocol Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardBreakdown.protocolRewards.map((reward, index) => (
                <div key={index} className="bg-green-600/20 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300">{reward.token}</span>
                    <span className="text-white font-bold">{reward.apr.toFixed(2)}%</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {formatCurrency(reward.value)} daily
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reward Breakdown Details */}
        {expanded && rewardBreakdown.totalRewards.breakdown.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-300">Reward Components</h3>
            <div className="space-y-3">
              {rewardBreakdown.totalRewards.breakdown.map((component, index) => (
                <div key={index} className="bg-orange-600/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-300 capitalize">
                      {component.type.replace('_', ' ')}
                    </span>
                    <span className="text-white font-bold">{component.apr.toFixed(2)}%</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Token: {component.token}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for additional reward information */}
        <div className="text-center text-gray-400 py-4">
          <p className="text-sm">Detailed reward analysis and optimization suggestions</p>
        </div>
      </div>
    </motion.div>
  );
}