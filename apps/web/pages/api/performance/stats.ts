import { NextApiRequest, NextApiResponse } from 'next';
import { performanceOptimizer } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const metrics = performanceOptimizer.getMetrics();
    const cacheStats = performanceOptimizer.getCacheStats();

    const response = {
      success: true,
      data: {
        ...metrics,
        cacheSize: cacheStats.entries,
        hitRate: cacheStats.hitRate
      },
      timestamp: Date.now()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching performance stats:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now()
    });
  }
}