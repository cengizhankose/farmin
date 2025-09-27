'use client';

import { motion } from 'framer-motion';
import { MarketMetrics, RiskAnalysis, SocialMetrics } from '@adapters/core';
import { Opportunity } from '@shared/core';

interface DetailHeaderProps {
  opportunity: Opportunity;
  marketMetrics: MarketMetrics;
  riskAnalysis: RiskAnalysis;
  socialMetrics: SocialMetrics;
}

export function DetailHeader({
  opportunity,
  marketMetrics,
  riskAnalysis,
  socialMetrics
}: DetailHeaderProps) {
  const getRiskColor = (score: number) => {
    if (score < 25) return 'text-green-400';
    if (score < 50) return 'text-yellow-400';
    if (score < 75) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskLevel = (score: number) => {
    if (score < 25) return 'Low';
    if (score < 50) return 'Medium';
    if (score < 75) return 'High';
    return 'Critical';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20" />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                  {opportunity.tokens[0]?.charAt(0) || '🏊'}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {opportunity.pool}
                  </h1>
                  <p className="text-xl text-gray-300">
                    {opportunity.protocol} • {opportunity.chain}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                  {opportunity.tokens.join(' / ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(riskAnalysis.overallRiskScore)} bg-opacity-20 ${
                  riskAnalysis.overallRiskScore < 25 ? 'bg-green-600/20' :
                  riskAnalysis.overallRiskScore < 50 ? 'bg-yellow-600/20' :
                  riskAnalysis.overallRiskScore < 75 ? 'bg-orange-600/20' :
                  'bg-red-600/20'
                }`}>
                  {getRiskLevel(riskAnalysis.overallRiskScore)} Risk
                </span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                  📈 24h Volume: {formatCurrency(marketMetrics.volume24h)}
                </span>
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <MetricCard
                label="TVL"
                value={formatCurrency(opportunity.tvlUsd)}
                change={marketMetrics.volume24h ? marketMetrics.volume24h / opportunity.tvlUsd * 100 : 0}
                icon="💰"
              />
              <MetricCard
                label="APY"
                value={`${opportunity.apy.toFixed(2)}%`}
                change={opportunity.apy - opportunity.apr}
                icon="📊"
                isPercentage
              />
              <MetricCard
                label="24h Volume"
                value={formatCurrency(marketMetrics.volume24h)}
                change={0} // Would need historical data
                icon="📈"
              />
              <MetricCard
                label="Risk Score"
                value={`${riskAnalysis.overallRiskScore.toFixed(0)}/100`}
                change={0}
                icon="⚠️"
                trend="neutral"
              />
            </motion.div>
          </div>

          {/* Right Column - Social & Quick Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
              <div className="space-y-3">
                <SocialMetric
                  icon="🐦"
                  label="Twitter"
                  value={socialMetrics.community.twitterFollowers.toLocaleString()}
                />
                <SocialMetric
                  icon="💬"
                  label="Discord"
                  value={socialMetrics.community.discordMembers.toLocaleString()}
                />
                <SocialMetric
                  icon="👥"
                  label="Active Users"
                  value={socialMetrics.community.uniqueUsers24h.toLocaleString()}
                />
                <SocialMetric
                  icon="📊"
                  label="Sentiment"
                  value={`${socialMetrics.sentiment.overallScore.toFixed(0)}/100`}
                  color={socialMetrics.sentiment.overallScore > 60 ? 'text-green-400' :
                          socialMetrics.sentiment.overallScore > 40 ? 'text-yellow-400' : 'text-red-400'}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Utilization</span>
                  <span className="text-white font-medium">
                    {(marketMetrics.utilizationRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fee Rate</span>
                  <span className="text-white font-medium">
                    {(marketMetrics.slippage.slippage10k * 100).toFixed(3)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Liquidity Depth</span>
                  <span className="text-white font-medium">
                    {formatCurrency(marketMetrics.depth.depth1Percent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Update</span>
                  <span className="text-white font-medium text-sm">
                    {new Date(opportunity.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  change: number;
  icon: string;
  isPercentage?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ label, value, change, icon, isPercentage, trend = 'neutral' }: MetricCardProps) {
  const getChangeColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400';
  };

  const getChangeIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return change > 0 ? '📈' : change < 0 ? '📉' : '➖';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {change !== 0 && (
        <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
          <span>{getChangeIcon()}</span>
          <span>
            {isPercentage ? change.toFixed(2) : (change * 100).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface SocialMetricProps {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

function SocialMetric({ icon, label, value, color = 'text-gray-300' }: SocialMetricProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span>{icon}</span>
        <span className="text-gray-400">{label}</span>
      </div>
      <span className={`${color} font-medium`}>{value}</span>
    </div>
  );
}