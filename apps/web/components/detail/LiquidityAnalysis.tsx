'use client';

import { motion } from 'framer-motion';
import { LiquidityAnalysis } from '@adapters/core';

interface LiquidityAnalysisProps {
  liquidityAnalysis: LiquidityAnalysis;
  expanded?: boolean;
}

export function LiquidityAnalysis({ liquidityAnalysis, expanded = false }: LiquidityAnalysisProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">💧</span>
        Liquidity Analysis
      </h2>

      <div className="space-y-6">
        {/* Liquidity Concentration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Concentration</h3>
            <div className="space-y-3">
              <div className="bg-purple-600/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-300">Gini Coefficient</span>
                  <span className="text-white font-bold">
                    {liquidityAnalysis.concentration.giniCoefficient.toFixed(3)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Lower values indicate better distribution
                </div>
              </div>
              <div className="bg-purple-600/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-300">Top 10% Share</span>
                  <span className="text-white font-bold">
                    {liquidityAnalysis.concentration.top10PercentShare.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${liquidityAnalysis.concentration.top10PercentShare}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Providers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-300">Providers</h3>
            <div className="space-y-3">
              <div className="bg-green-600/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-300">Total Providers</span>
                  <span className="text-white font-bold">
                    {liquidityAnalysis.providers.totalProviders.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-green-600/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-300">Stability Score</span>
                  <span className="text-white font-bold">
                    {liquidityAnalysis.stability.stabilityScore.toFixed(1)}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed View */}
        {expanded && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-300">Detailed Analysis</h3>
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">📊</div>
              <p>Detailed liquidity depth charts and provider distribution</p>
              <p className="text-sm mt-2">Liquidity depth curves and concentration analysis</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}