import { NextApiRequest, NextApiResponse } from 'next';
import { advancedAdapter } from '@adapters/core';
import { AdvancedAnalytics } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const {
    metrics,
    timeRange = '30d',
    granularity = 'daily'
  } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Pool ID is required',
      timestamp: Date.now()
    });
  }

  try {
    const startTime = Date.now();

    // Fetch comprehensive analytics data
    const [
      marketMetrics,
      riskAnalysis,
      performanceMetrics,
      rewardBreakdown,
      advancedAnalytics,
      socialMetrics
    ] = await Promise.all([
      advancedAdapter.getMarketMetrics(id),
      advancedAdapter.getRiskAnalysis(id),
      advancedAdapter.getPerformanceMetrics(id, timeRange as string),
      advancedAdapter.getRewardBreakdown(id),
      advancedAdapter.getAdvancedAnalytics(id),
      advancedAdapter.getSocialMetrics(id)
    ]);

    const processingTime = Date.now() - startTime;

    // Filter metrics if specified
    const requestedMetrics = metrics ? (metrics as string).split(',') : null;
    const filteredAnalytics = filterAnalytics(advancedAnalytics, requestedMetrics);

    const response = {
      success: true,
      data: {
        basic: {
          market: marketMetrics,
          risk: riskAnalysis,
          performance: performanceMetrics,
          rewards: rewardBreakdown
        },
        advanced: filteredAnalytics,
        social: socialMetrics
      },
      timestamp: Date.now(),
      metadata: {
        requestId: generateRequestId(),
        processingTime,
        metricsCount: countMetrics(filteredAnalytics),
        timeRange,
        granularity
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching analytics for pool ${id}:`, error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
      requestId: generateRequestId()
    });
  }
}

function generateRequestId(): string {
  return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function filterAnalytics(analytics: AdvancedAnalytics, requestedMetrics: string[] | null): Partial<AdvancedAnalytics> {
  if (!requestedMetrics || requestedMetrics.length === 0) {
    return analytics;
  }

  const result: Partial<AdvancedAnalytics> = {};

  if (requestedMetrics.includes('efficiency')) {
    result.efficiencyMetrics = analytics.efficiencyMetrics;
  }
  if (requestedMetrics.includes('capital')) {
    result.capitalEfficiency = analytics.capitalEfficiency;
  }
  if (requestedMetrics.includes('users')) {
    result.userBehavior = analytics.userBehavior;
  }
  if (requestedMetrics.includes('market')) {
    result.marketPosition = analytics.marketPosition;
  }
  if (requestedMetrics.includes('competitive')) {
    result.competitive = analytics.competitive;
  }

  return result;
}

function countMetrics(analytics: Partial<AdvancedAnalytics>): number {
  let count = 0;

  if (analytics.efficiencyMetrics) count++;
  if (analytics.capitalEfficiency) count++;
  if (analytics.userBehavior) count++;
  if (analytics.marketPosition) count++;
  if (analytics.competitive) count++;

  return count;
}