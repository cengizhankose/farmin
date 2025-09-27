"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertTriangle, Shield, TrendingUp, Brain } from "lucide-react";

interface RiskScore {
  total: number;
  confidence: "high" | "medium" | "low";
  components: {
    liquidity: number;
    stability: number;
    yield: number;
    concentration: number;
    momentum: number;
  };
  drivers?: string[];
  // Enhanced risk data
  technicalRisk?: number;
  financialRisk?: number;
  operationalRisk?: number;
  securityRisk?: number;
  marketRegime?: string;
  system?: 'enhanced' | 'legacy';
  recommendations?: string[];
}

interface RiskTooltipProps {
  riskScore: RiskScore;
  opportunityId?: string;
  children: React.ReactNode;
}

const RiskTooltip: React.FC<RiskTooltipProps> = ({ riskScore, opportunityId, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);

  React.useEffect(() => {
    if (isVisible && opportunityId && riskScore.system === 'enhanced') {
      // Fetch enhanced risk data when tooltip is shown
      fetch(`/api/opportunities/${opportunityId}/risk`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.enhanced) {
            setEnhancedData(data.enhanced);
          }
        })
        .catch(console.error);
    }
  }, [isVisible, opportunityId, riskScore.system]);

  const getRiskColor = (score: number): string => {
    if (score <= 25) return "text-green-400";
    if (score <= 50) return "text-yellow-400";
    if (score <= 75) return "text-orange-400";
    return "text-red-400";
  };

  const getRiskLevel = (score: number): string => {
    if (score <= 25) return "Low";
    if (score <= 50) return "Medium";
    if (score <= 75) return "High";
    return "Critical";
  };

  const getRiskIcon = (score: number) => {
    if (score <= 25) return <Shield className="h-4 w-4 text-green-400" />;
    if (score <= 50) return <TrendingUp className="h-4 w-4 text-yellow-400" />;
    if (score <= 75) return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-80 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl"
            style={{
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: "8px",
            }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-4 border-transparent border-t-slate-700"></div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {getRiskIcon(riskScore.total)}
              <div className="flex-1">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Risk Analysis
                  {riskScore.system === 'enhanced' && (
                    <Brain className="h-3 w-3 text-purple-400" />
                  )}
                </h3>
                <p
                  className={`text-sm font-medium ${getRiskColor(riskScore.total)}`}
                >
                  {getRiskLevel(riskScore.total)} Risk ({riskScore.total}/100)
                </p>
              </div>
            </div>

            {/* Enhanced Risk Factors */}
            {enhancedData && (
              <div className="mb-3 p-3 rounded-lg bg-slate-800/50">
                <h4 className="text-xs font-medium text-slate-300 mb-2">
                  Advanced Risk Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {enhancedData.technicalRisk !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Technical</span>
                      <span className="text-white">
                        {(enhancedData.technicalRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {enhancedData.financialRisk !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Financial</span>
                      <span className="text-white">
                        {(enhancedData.financialRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {enhancedData.operationalRisk !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Operational</span>
                      <span className="text-white">
                        {(enhancedData.operationalRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {enhancedData.securityRisk !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Security</span>
                      <span className="text-white">
                        {(enhancedData.securityRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {enhancedData.marketRegime && (
                  <div className="mt-2 pt-2 border-t border-slate-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Market Regime</span>
                      <span className="text-purple-400 font-medium">
                        {enhancedData.marketRegime.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Standard Risk Components */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Liquidity Risk</span>
                <span className="text-white">
                  {Math.round(riskScore.components.liquidity)}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Stability Risk</span>
                <span className="text-white">
                  {Math.round(riskScore.components.stability)}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Yield Risk</span>
                <span className="text-white">
                  {Math.round(riskScore.components.yield)}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Concentration Risk</span>
                <span className="text-white">
                  {Math.round(riskScore.components.concentration)}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Momentum Risk</span>
                <span className="text-white">
                  {Math.round(riskScore.components.momentum)}/100
                </span>
              </div>
            </div>

            {/* Key Risk Drivers */}
            {(riskScore.drivers || enhancedData?.recommendations) && (
              <div className="border-t border-slate-700 pt-3">
                <h4 className="text-sm font-medium text-slate-300 mb-2">
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {riskScore.drivers?.slice(0, 2).map((driver, index) => (
                    <li
                      key={index}
                      className="text-xs text-slate-400 flex items-start gap-2"
                    >
                      <Info className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                      {driver}
                    </li>
                  ))}
                  {enhancedData?.recommendations?.slice(0, 1).map((rec: string, index: number) => (
                    <li
                      key={`rec-${index}`}
                      className="text-xs text-amber-400 flex items-start gap-2"
                    >
                      <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
              <span className="text-xs text-slate-500">Confidence</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    riskScore.confidence === "high"
                      ? "text-green-400"
                      : riskScore.confidence === "medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {riskScore.confidence.toUpperCase()}
                </span>
                {riskScore.system === 'enhanced' && (
                  <span className="text-xs text-purple-400">AI</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiskTooltip;
