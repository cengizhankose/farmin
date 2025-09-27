import { NextApiRequest, NextApiResponse } from 'next';
import { performanceOptimizer } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: Date.now()
    });
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'clear':
        performanceOptimizer.clearCache();
        return res.status(200).json({
          success: true,
          message: 'Cache cleared successfully',
          timestamp: Date.now()
        });

      case 'stats':
        const stats = performanceOptimizer.getCacheStats();
        return res.status(200).json({
          success: true,
          data: stats,
          timestamp: Date.now()
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          timestamp: Date.now()
        });
    }
  } catch (error) {
    console.error('Error managing cache:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now()
    });
  }
}