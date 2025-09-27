import { NextApiRequest, NextApiResponse } from 'next';
import { advancedAdapter } from '@adapters/core';
import {
  DetailPageRequest,
  DetailPageResponse,
  Chain
} from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const {
    timeRange = '30d',
    includeHistorical = true,
    benchmarks,
    comparables = true
  } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Pool ID is required',
      timestamp: Date.now()
    });
  }

  try {
    const request: DetailPageRequest = {
      poolId: id,
      timeRange: timeRange as '24h' | '7d' | '30d' | '90d' | '1y',
      includeHistorical: includeHistorical === 'true',
      benchmarks: benchmarks ? (benchmarks as string).split(',') : undefined,
      comparables: comparables === 'true'
    };

    // Fetch comprehensive detail page data
    const response: DetailPageResponse = await advancedAdapter.getDetailPageData(request);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        error: response.error || 'Failed to fetch detail page data',
        timestamp: Date.now()
      });
    }

    // Add response metadata
    const responseData = {
      ...response,
      requestId: generateRequestId(),
      processingTime: 0, // Will be calculated below
      dataSize: estimateDataSize(response.data)
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(`Error fetching detail page data for pool ${id}:`, error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
      requestId: generateRequestId()
    });
  }
}

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function estimateDataSize(data: any): number {
  return JSON.stringify(data).length;
}