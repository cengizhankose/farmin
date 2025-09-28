import { Opportunity } from '@farmin/shared';

export const TESTNET_MOCK_YIELD_OPPORTUNITY: Opportunity = {
  id: 'testnet-mock-yield-algo',
  chain: 'algorand',
  protocol: 'Mock Yield Protocol',
  pool: 'ALGO Yield Pool',
  tokens: ['ALGO'],
  apr: 5.0, // 5% APR
  apy: 5.12, // 5.12% APY (compounded)
  rewardToken: 'ALGO',
  tvlUsd: 10000, // Mock TVL for demo
  risk: 'low',
  source: 'mock',
  lastUpdated: Date.now(),
  poolId: 'testnet-mock-yield-746521428',
  logoUrl: '/logos/mock-yield.svg',
  exposure: 'Single Asset',
  ilRisk: 'None',
  stablecoin: false,
};

export const TESTNET_OPPORTUNITIES: Opportunity[] = [
  TESTNET_MOCK_YIELD_OPPORTUNITY,
];

export const isTestNetMode = (): boolean => {
  // Check both server-side and client-side environment variables
  return process.env.ALGORAND_NETWORK === 'testnet' ||
         process.env.NEXT_PUBLIC_ALGORAND_NETWORK === 'testnet';
};

export const getTestNetOpportunities = (): Opportunity[] => {
  if (!isTestNetMode()) {
    return [];
  }
  return TESTNET_OPPORTUNITIES;
};