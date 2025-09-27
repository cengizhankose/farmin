import { NextApiRequest, NextApiResponse } from 'next';

// Simple system health - will integrate with real system later

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Mock system health for now - will integrate with real system later
    const systemHealth = {
      overall: 'healthy' as const,
      components: {
        api: 'healthy' as const,
        data: 'healthy' as const,
        security: 'healthy' as const,
        performance: 'healthy' as const
      },
      metrics: {
        uptime: 0.999,
        responseTime: 120,
        errorRate: 0.01,
        riskScore: 25
      },
      alerts: []
    };

    return res.status(200).json({
      success: true,
      data: systemHealth,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching system health:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now()
    });
  }
}