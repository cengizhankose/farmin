'use client';

import { motion } from 'framer-motion';
import { RiskAnalysis } from '@adapters/core';

interface RiskAnalysisCardProps {
  riskAnalysis: RiskAnalysis;
  expanded?: boolean;
}

export function RiskAnalysisCard({ riskAnalysis, expanded = false }: RiskAnalysisCardProps) {
  const getRiskColor = (score: number) => {
    if (score < 25) return 'text-green-400 bg-green-600/20';
    if (score < 50) return 'text-yellow-400 bg-yellow-600/20';
    if (score < 75) return 'text-orange-400 bg-orange-600/20';
    return 'text-red-400 bg-red-600/20';
  };

  const getRiskLevel = (score: number) => {
    if (score < 25) return 'Low';
    if (score < 50) return 'Medium';
    if (score < 75) return 'High';
    return 'Critical';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">⚠️</span>
        Risk Analysis
      </h2>

      <div className="space-y-6">
        {/* Overall Risk Score */}
        <div className="text-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-full ${getRiskColor(riskAnalysis.overallRiskScore)}`}>
            <span className="text-3xl font-bold mr-2">{riskAnalysis.overallRiskScore.toFixed(0)}</span>
            <span className="text-lg font-semibold">/100</span>
            <span className="ml-3 text-lg">{getRiskLevel(riskAnalysis.overallRiskScore)} Risk</span>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RiskMetric
            title="Impermanent Loss"
            score={riskAnalysis.impermanentLossRisk.score}
            description={riskAnalysis.impermanentLossRisk.description}
            color="blue"
          />
          <RiskMetric
            title="Smart Contract"
            score={riskAnalysis.smartContractRisk.auditScore}
            description={`Audit Score: ${riskAnalysis.smartContractRisk.auditScore.toFixed(0)}`}
            color="purple"
          />
          <RiskMetric
            title="Liquidity"
            score={riskAnalysis.liquidityRisk.score}
            description={`${riskAnalysis.liquidityRisk.providerCount} providers`}
            color="green"
          />
          <RiskMetric
            title="Market"
            score={riskAnalysis.marketRisk.volatility}
            description={`Volatility: ${(riskAnalysis.marketRisk.volatility * 100).toFixed(1)}%`}
            color="orange"
          />
        </div>

        {/* Risk Factors */}
        {expanded && riskAnalysis.riskFactors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Key Risk Factors</h3>
            {riskAnalysis.riskFactors.map((factor, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{factor.category}</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    factor.impact === 'high' ? 'bg-red-600/20 text-red-400' :
                    factor.impact === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-green-600/20 text-green-400'
                  }`}>
                    {factor.impact.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{factor.description}</p>
                <p className="text-blue-300 text-sm">💡 {factor.mitigation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface RiskMetricProps {
  title: string;
  score: number;
  description: string;
  color: string;
}

function RiskMetric({ title, score, description, color }: RiskMetricProps) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-600/20',
    purple: 'text-purple-400 bg-purple-600/20',
    green: 'text-green-400 bg-green-600/20',
    orange: 'text-orange-400 bg-orange-600/20'
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-white">{title}</h4>
        <span className={`px-2 py-1 rounded text-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
          {score.toFixed(0)}/100
        </span>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}