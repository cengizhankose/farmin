'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DetailPageData,
  MarketMetrics,
  RiskAnalysis,
  PerformanceMetrics,
  AdvancedAnalytics
} from '@adapters/core';
import { Opportunity } from '@shared/core';

// Import sub-components
import { DetailHeader } from './DetailHeader';
import { MarketOverview } from './MarketOverview';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { PerformanceChart } from './PerformanceChart';
import { RewardBreakdown } from './RewardBreakdown';
import { AdvancedMetrics } from './AdvancedMetrics';
import { LiquidityAnalysis } from './LiquidityAnalysis';
import { ComparablePools } from './ComparablePools';
import { RouterTab } from './RouterTab';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface DetailPageProps {
  poolId: string;
  opportunity?: Opportunity;
}

export function DetailPage({ poolId, opportunity }: DetailPageProps) {
  const [detailData, setDetailData] = useState<DetailPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDetailData();
  }, [poolId]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/opportunities/${poolId}/detail?timeRange=30d&includeHistorical=true`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch detail data');
      }

      setDetailData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <ErrorMessage
          message={error}
          onRetry={fetchDetailData}
          className="max-w-md"
        />
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <ErrorMessage message="No data available" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header Section */}
      <DetailHeader
        opportunity={detailData.basic}
        marketMetrics={detailData.market}
        riskAnalysis={detailData.risk}
        socialMetrics={detailData.social}
      />

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'risk', label: 'Risk', icon: '⚠️' },
              { id: 'rewards', label: 'Rewards', icon: '💰' },
              { id: 'liquidity', label: 'Liquidity', icon: '💧' },
              { id: 'comparable', label: 'Compare', icon: '🔄' },
              ...(detailData.basic?.id === 'testnet-mock-yield-algo' ? [{ id: 'router', label: 'Router', icon: '🔗' }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-purple-600/20'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MarketOverview
                  marketMetrics={detailData.market}
                  performanceMetrics={detailData.performance}
                />
                <RiskAnalysisCard riskAnalysis={detailData.risk} />
                <PerformanceChart
                  historicalData={detailData.historical}
                  performanceMetrics={detailData.performance}
                />
                <RewardBreakdown rewardBreakdown={detailData.rewards} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <AdvancedMetrics
                analytics={detailData.analytics}
                performanceMetrics={detailData.performance}
                marketMetrics={detailData.market}
                socialMetrics={detailData.social}
              />
            )}

            {activeTab === 'risk' && (
              <div className="space-y-8">
                <RiskAnalysisCard
                  riskAnalysis={detailData.risk}
                  expanded={true}
                />
                <LiquidityAnalysis liquidityAnalysis={detailData.liquidity} />
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-8">
                <RewardBreakdown
                  rewardBreakdown={detailData.rewards}
                  expanded={true}
                />
              </div>
            )}

            {activeTab === 'liquidity' && (
              <LiquidityAnalysis
                liquidityAnalysis={detailData.liquidity}
                expanded={true}
              />
            )}

            {activeTab === 'comparable' && (
              <ComparablePools comparablePools={detailData.comparable} />
            )}

            {activeTab === 'router' && detailData.basic?.id === 'testnet-mock-yield-algo' && (
              <RouterTab opportunity={detailData.basic} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Action Buttons - Only show for TestNet Mock-Yield */}
      {detailData.basic?.id === 'testnet-mock-yield-algo' && (
        <div className="sticky bottom-0 bg-black/80 backdrop-blur-xl border-t border-purple-500/20 p-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Last updated: {new Date(detailData.basic.lastUpdated).toLocaleString()}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchDetailData}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={() => setActiveTab('router')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors"
              >
                🔗 Go to Router
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}