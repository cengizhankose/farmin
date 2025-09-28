import { NextApiRequest, NextApiResponse } from 'next';
import { advancedAdapter } from '@adapters/core';
import { HistoricalData } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const {
    timeRange = '30d',
    dataTypes = 'tvl,apy,volume',
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
    const historicalData = await advancedAdapter.getHistoricalData(id, timeRange as string);
    const processingTime = Date.now() - startTime;

    // Filter data types if specified
    const requestedTypes = (dataTypes as string).split(',');
    const filteredData = filterHistoricalData(historicalData, requestedTypes);

    // Calculate summary statistics
    const summary = calculateHistoricalSummary(filteredData);

    const response = {
      success: true,
      data: filteredData,
      summary,
      metadata: {
        requestId: generateRequestId(),
        processingTime,
        timeRange,
        granularity,
        dataTypes: requestedTypes,
        dataPoints: countDataPoints(filteredData)
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching historical data for pool ${id}:`, error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
      requestId: generateRequestId()
    });
  }
}

function generateRequestId(): string {
  return `historical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function filterHistoricalData(data: HistoricalData, requestedTypes: string[]): Partial<HistoricalData> {
  const result: Partial<HistoricalData> = {};

  if (requestedTypes.includes('tvl')) {
    result.tvl = data.tvl;
  }
  if (requestedTypes.includes('apy')) {
    result.apy = data.apy;
  }
  if (requestedTypes.includes('volume')) {
    result.volume = data.volume;
  }
  if (requestedTypes.includes('fees')) {
    result.fees = data.fees;
  }
  if (requestedTypes.includes('users')) {
    result.users = data.users;
  }
  if (requestedTypes.includes('price')) {
    result.price = data.price;
  }
  if (requestedTypes.includes('events')) {
    result.events = data.events;
  }

  return result;
}

function calculateHistoricalSummary(data: Partial<HistoricalData>) {
  const summary: any = {};

  if (data.tvl && data.tvl.length > 0) {
    const tvlValues = data.tvl.map(d => d.value);
    summary.tvl = {
      current: tvlValues[tvlValues.length - 1],
      average: tvlValues.reduce((a, b) => a + b, 0) / tvlValues.length,
      min: Math.min(...tvlValues),
      max: Math.max(...tvlValues),
      change: data.tvl[data.tvl.length - 1]?.change || 0,
      changePercent: data.tvl[data.tvl.length - 1]?.changePercent || 0
    };
  }

  if (data.apy && data.apy.length > 0) {
    const apyValues = data.apy.map(d => d.value);
    summary.apy = {
      current: apyValues[apyValues.length - 1],
      average: apyValues.reduce((a, b) => a + b, 0) / apyValues.length,
      min: Math.min(...apyValues),
      max: Math.max(...apyValues),
      change: data.apy[data.apy.length - 1]?.change || 0,
      changePercent: data.apy[data.apy.length - 1]?.changePercent || 0
    };
  }

  if (data.volume && data.volume.length > 0) {
    const volumeValues = data.volume.map(d => d.value);
    summary.volume = {
      current: volumeValues[volumeValues.length - 1],
      average: volumeValues.reduce((a, b) => a + b, 0) / volumeValues.length,
      min: Math.min(...volumeValues),
      max: Math.max(...volumeValues),
      total: volumeValues.reduce((a, b) => a + b, 0)
    };
  }

  if (data.users && data.users.length > 0) {
    const userValues = data.users.map(d => d.value);
    summary.users = {
      current: userValues[userValues.length - 1],
      average: userValues.reduce((a, b) => a + b, 0) / userValues.length,
      min: Math.min(...userValues),
      max: Math.max(...userValues),
      change: data.users[data.users.length - 1]?.change || 0,
      changePercent: data.users[data.users.length - 1]?.changePercent || 0
    };
  }

  return summary;
}

function countDataPoints(data: Partial<HistoricalData>): number {
  let count = 0;
  if (data.tvl) count += data.tvl.length;
  if (data.apy) count += data.apy.length;
  if (data.volume) count += data.volume.length;
  if (data.fees) count += data.fees.length;
  if (data.users) count += data.users.length;
  if (data.price) count += data.price.length;
  if (data.events) count += data.events.length;
  return count;
}