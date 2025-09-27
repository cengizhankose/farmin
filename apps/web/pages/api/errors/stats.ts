import { NextApiRequest, NextApiResponse } from 'next';
import { errorHandler } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const metrics = errorHandler.getMetrics();
    const recentErrors = errorHandler.getRecentErrors(50);

    const response = {
      success: true,
      data: {
        metrics,
        recentErrors: recentErrors.map(error => ({
          type: error.type,
          severity: error.severity,
          message: error.message,
          timestamp: error.context.timestamp,
          component: error.context.component,
          retryable: error.retryable
        })),
        summary: {
          totalErrors: metrics.totalErrors,
          errorRate: metrics.totalErrors > 0 ?
            ((metrics.errorsBySeverity[('high' as any)] + metrics.errorsBySeverity[('critical' as any)]) / metrics.totalErrors * 100).toFixed(1) : 0,
          retryRate: metrics.retryCount > 0 ?
            (metrics.recoveryCount / metrics.retryCount * 100).toFixed(1) : 0,
          avgRecoveryTime: metrics.averageRecoveryTime.toFixed(0) + 'ms'
        }
      },
      timestamp: Date.now()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching error stats:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now()
    });
  }
}