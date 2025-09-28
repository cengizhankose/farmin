'use client';

import { motion } from 'framer-motion';
import { ComparablePools } from '@adapters/core';

interface ComparablePoolsProps {
  comparablePools: ComparablePools;
}

export function ComparablePools({ comparablePools }: ComparablePoolsProps) {
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
      className="space-y-8"
    >
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">🔄</span>
          Comparable Pools
        </h2>

        {comparablePools.similarPools.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-purple-600/20 rounded-lg p-4 text-center">
                <div className="text-purple-300 text-sm">Avg TVL</div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(comparablePools.similarPools.reduce((sum, pool) => sum + pool.tvl, 0) / comparablePools.similarPools.length)}
                </div>
              </div>
              <div className="bg-blue-600/20 rounded-lg p-4 text-center">
                <div className="text-blue-300 text-sm">Avg APY</div>
                <div className="text-lg font-bold text-white">
                  {(comparablePools.similarPools.reduce((sum, pool) => sum + pool.apy, 0) / comparablePools.similarPools.length).toFixed(2)}%
                </div>
              </div>
              <div className="bg-green-600/20 rounded-lg p-4 text-center">
                <div className="text-green-300 text-sm">Avg Risk</div>
                <div className="text-lg font-bold text-white">
                  {comparablePools.similarPools.reduce((sum, pool) => sum + pool.riskScore, 0) / comparablePools.similarPools.length.toFixed(0)}/100
                </div>
              </div>
              <div className="bg-orange-600/20 rounded-lg p-4 text-center">
                <div className="text-orange-300 text-sm">Total Pools</div>
                <div className="text-lg font-bold text-white">
                  {comparablePools.similarPools.length}
                </div>
              </div>
            </div>

            {/* Pool Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-gray-300">Pool</th>
                    <th className="text-left py-3 px-4 text-gray-300">Protocol</th>
                    <th className="text-right py-3 px-4 text-gray-300">TVL</th>
                    <th className="text-right py-3 px-4 text-gray-300">APY</th>
                    <th className="text-right py-3 px-4 text-gray-300">Volume</th>
                    <th className="text-right py-3 px-4 text-gray-300">Risk</th>
                    <th className="text-right py-3 px-4 text-gray-300">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {comparablePools.similarPools.map((pool, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-white">{pool.name}</td>
                      <td className="py-3 px-4 text-gray-300">{pool.protocol}</td>
                      <td className="py-3 px-4 text-right text-white">
                        {formatCurrency(pool.tvl)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {pool.apy.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {formatCurrency(pool.volume24h)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          pool.riskScore < 25 ? 'bg-green-600/20 text-green-400' :
                          pool.riskScore < 50 ? 'bg-yellow-600/20 text-yellow-400' :
                          pool.riskScore < 75 ? 'bg-orange-600/20 text-orange-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {pool.riskScore.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {pool.score.toFixed(0)}/100
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p>No comparable pools found</p>
            <p className="text-sm mt-2">Try different filters or parameters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}