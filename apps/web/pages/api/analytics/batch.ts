import { NextApiRequest, NextApiResponse } from 'next';
import { advancedAdapter } from '@adapters/core';
import { AnalyticsRequest } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    poolIds,
    metrics = 'market,risk,performance',
    timeRange = '30d',
    granularity = 'daily'
  } = req.body;

  if (!poolIds || !Array.isArray(poolIds) || poolIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Pool IDs array is required',
      timestamp: Date.now()
    });
  }

  if (poolIds.length > 10) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 10 pools allowed per request',
      timestamp: Date.now()
    });
  }

  try {
    const startTime = Date.now();
    const metricsList = (metrics as string).split(',');

    // Fetch data for all pools in parallel
    const poolPromises = poolIds.map(async (poolId) => {
      try {
        const [market, risk, performance, rewards, analytics] = await Promise.all([
          metricsList.includes('market') ? advancedAdapter.getMarketMetrics(poolId) : null,
          metricsList.includes('risk') ? advancedAdapter.getRiskAnalysis(poolId) : null,
          metricsList.includes('performance') ? advancedAdapter.getPerformanceMetrics(poolId, timeRange) : null,
          metricsList.includes('rewards') ? advancedAdapter.getRewardBreakdown(poolId) : null,
          metricsList.includes('analytics') ? advancedAdapter.getAdvancedAnalytics(poolId) : null
        ]);

        return {
          poolId,
          success: true,
          data: {
            market,
            risk,
            performance,
            rewards,
            analytics
          }
        };
      } catch (error) {
        return {
          poolId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(poolPromises);
    const processingTime = Date.now() - startTime;

    // Calculate summary statistics
    const summary = calculateBatchSummary(results, metricsList);

    const response = {
      success: true,
      data: results,
      summary,
      metadata: {
        requestId: generateRequestId(),
        processingTime,
        totalPools: poolIds.length,
        successfulPools: results.filter(r => r.success).length,
        failedPools: results.filter(r => !r.success).length,
        requestedMetrics: metricsList,
        timeRange,
        granularity
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in batch analytics request:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
      requestId: generateRequestId()
    });
  }
}

function generateRequestId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateBatchSummary(results: any[], metricsList: string[]) {
  const successfulResults = results.filter(r => r.success);

  if (successfulResults.length === 0) {
    return {
      totalTVL: 0,
      avgAPY: 0,
      avgRiskScore: 0,
      totalVolume24h: 0
    };
  }

  let totalTVL = 0;
  let totalAPY = 0;
  let totalRiskScore = 0;
  let totalVolume24h = 0;

  successfulResults.forEach(result => {
    if (result.data.market) {
      totalTVL += result.data.market.volume24h || 0;
      totalVolume24h += result.data.market.volume24h || 0;
    }
    if (result.data.risk) {
      totalRiskScore += result.data.risk.overallRiskScore || 0;
    }
    if (result.data.performance) {
      totalAPY += result.data.performance.totalReturns?.daily || 0;
    }
  });

  return {
    totalTVL,
    avgAPY: successfulResults.length > 0 ? totalAPY / successfulResults.length : 0,
    avgRiskScore: successfulResults.length > 0 ? totalRiskScore / successfulResults.length : 0,
    totalVolume24h
  };
}