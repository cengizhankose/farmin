import { NextApiRequest, NextApiResponse } from 'next';
import { advancedAdapter } from '@adapters/core';
import { ComparablePools } from '@adapters/core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const {
    maxResults = '5',
    sortBy = 'score',
    filterRisk,
    filterTVL
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
    let comparablePools = await advancedAdapter.getComparablePools(id);
    const processingTime = Date.now() - startTime;

    // Apply filters
    if (filterRisk || filterTVL) {
      comparablePools = applyFilters(comparablePools, {
        maxRisk: filterRisk ? parseFloat(filterRisk as string) : undefined,
        minTVL: filterTVL ? parseFloat(filterTVL as string) : undefined
      });
    }

    // Apply sorting
    comparablePools = sortComparablePools(comparablePools, sortBy as string);

    // Limit results
    const max = parseInt(maxResults as string, 10);
    comparablePools = limitResults(comparablePools, max);

    // Calculate summary statistics
    const summary = calculateComparableSummary(comparablePools);

    const response = {
      success: true,
      data: comparablePools,
      summary,
      metadata: {
        requestId: generateRequestId(),
        processingTime,
        totalPools: comparablePools.similarPools.length,
        sortBy,
        filters: {
          risk: filterRisk,
          tvl: filterTVL
        },
        maxResults
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching comparable pools for ${id}:`, error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: Date.now(),
      requestId: generateRequestId()
    });
  }
}

function generateRequestId(): string {
  return `comparable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function applyFilters(pools: ComparablePools, filters: { maxRisk?: number; minTVL?: number }): ComparablePools {
  let filtered = pools;

  if (filters.maxRisk !== undefined) {
    filtered = {
      ...filtered,
      similarPools: filtered.similarPools.filter(pool => pool.riskScore <= filters.maxRisk!)
    };
  }

  if (filters.minTVL !== undefined) {
    filtered = {
      ...filtered,
      similarPools: filtered.similarPools.filter(pool => pool.tvl >= filters.minTVL!)
    };
  }

  return filtered;
}

function sortComparablePools(pools: ComparablePools, sortBy: string): ComparablePools {
  const sortFunctions: Record<string, (a: any, b: any) => number> = {
    score: (a, b) => b.score - a.score,
    tvl: (a, b) => b.tvl - a.tvl,
    apy: (a, b) => b.apy - a.apy,
    volume: (a, b) => b.volume24h - a.volume24h,
    risk: (a, b) => a.riskScore - b.riskScore
  };

  const sortFunction = sortFunctions[sortBy] || sortFunctions.score;

  return {
    ...pools,
    similarPools: [...pools.similarPools].sort(sortFunction)
  };
}

function limitResults(pools: ComparablePools, max: number): ComparablePools {
  return {
    ...pools,
    similarPools: pools.similarPools.slice(0, max)
  };
}

function calculateComparableSummary(pools: ComparablePools) {
  if (pools.similarPools.length === 0) {
    return {
      avgTVL: 0,
      avgAPY: 0,
      avgRiskScore: 0,
      avgVolume: 0,
      topPerformers: [],
      riskDistribution: { low: 0, medium: 0, high: 0 }
    };
  }

  const totalTVL = pools.similarPools.reduce((sum, pool) => sum + pool.tvl, 0);
  const totalAPY = pools.similarPools.reduce((sum, pool) => sum + pool.apy, 0);
  const totalRisk = pools.similarPools.reduce((sum, pool) => sum + pool.riskScore, 0);
  const totalVolume = pools.similarPools.reduce((sum, pool) => sum + pool.volume24h, 0);

  const topPerformers = [...pools.similarPools]
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 3)
    .map(pool => ({ name: pool.name, apy: pool.apy }));

  const riskDistribution = pools.similarPools.reduce((acc, pool) => {
    if (pool.riskScore < 33) acc.low++;
    else if (pool.riskScore < 66) acc.medium++;
    else acc.high++;
    return acc;
  }, { low: 0, medium: 0, high: 0 });

  return {
    avgTVL: totalTVL / pools.similarPools.length,
    avgAPY: totalAPY / pools.similarPools.length,
    avgRiskScore: totalRisk / pools.similarPools.length,
    avgVolume: totalVolume / pools.similarPools.length,
    topPerformers,
    riskDistribution
  };
}