import { NextApiRequest, NextApiResponse } from 'next';
import { advancedAdapter } from '@adapters/core';
import { MarketMetricsResponse } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Pool ID is required',
      timestamp: Date.now()
    });
  }

  try {
    const startTime = Date.now();
    const marketMetrics = await advancedAdapter.getMarketMetrics(id);
    const processingTime = Date.now() - startTime;

    const response: MarketMetricsResponse = {
      success: true,
      data: marketMetrics,
      timestamp: Date.now()
    };

    return res.status(200).json({
      ...response,
      requestId: generateRequestId(),
      processingTime,
      cacheStatus: 'fresh'
    });
  } catch (error) {
    console.error(`Error fetching market metrics for pool ${id}:`, error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
      requestId: generateRequestId()
    });
  }
}

function generateRequestId(): string {
  return `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}