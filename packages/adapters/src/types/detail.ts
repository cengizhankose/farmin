import { Opportunity, Chain } from './types';

// Enhanced types for detail pages with comprehensive data

export interface DetailPageData {
  basic: Opportunity;
  market: MarketMetrics;
  risk: RiskAnalysis;
  performance: PerformanceMetrics;
  rewards: RewardBreakdown;
  analytics: AdvancedAnalytics;
  social: SocialMetrics;
  historical: HistoricalData;
  liquidity: LiquidityAnalysis;
  smartContract: SmartContractInfo;
  comparable: ComparablePools;
}

export interface MarketMetrics {
  volume24h: number;
  volume7d: number;
  volume30d: number;
  fees24h: number;
  fees7d: number;
  fees30d: number;
  utilizationRate: number;
  depth: MarketDepth;
  slippage: SlippageData;
  priceImpact: PriceImpactAnalysis;
}

export interface MarketDepth {
  depth1Percent: number;
  depth5Percent: number;
  depth10Percent: number;
  liquidityDistribution: LiquidityDistribution[];
}

export interface LiquidityDistribution {
  priceRange: string;
  liquidity: number;
  percentage: number;
}

export interface SlippageData {
  slippage10k: number;    // Slippage for $10k trade
  slippage50k: number;    // Slippage for $50k trade
  slippage100k: number;   // Slippage for $100k trade
  slippage1m: number;     // Slippage for $1M trade
}

export interface PriceImpactAnalysis {
  avgImpact: number;
  maxImpact: number;
  volatility: number;
  correlation: number;
}

export interface RiskAnalysis {
  impermanentLossRisk: ImpermanentLossRisk;
  smartContractRisk: SmartContractRisk;
  liquidityRisk: LiquidityRisk;
  marketRisk: MarketRisk;
  protocolRisk: ProtocolRisk;
  overallRiskScore: number;
  riskFactors: RiskFactor[];
}

export interface ImpermanentLossRisk {
  score: number;
  description: string;
  historicalIL: HistoricalILData[];
  protection: string[];
}

export interface HistoricalILData {
  date: string;
  ilPercentage: number;
  marketCondition: string;
}

export interface SmartContractRisk {
  auditScore: number;
  auditStatus: AuditStatus;
  vulnerabilities: Vulnerability[];
  codeQuality: number;
  timelock: boolean;
  multisig: boolean;
  pauseFunction: boolean;
}

export interface AuditStatus {
  audited: boolean;
  auditor: string;
  date: string;
  reportUrl?: string;
  score: number;
}

export interface Vulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  affectedComponent: string;
  resolved: boolean;
}

export interface LiquidityRisk {
  score: number;
  depth: number;
  stability: number;
  concentration: number;
  providerCount: number;
  topProviders: LiquidityProvider[];
}

export interface LiquidityProvider {
  address: string;
  share: number;
  value: number;
}

export interface MarketRisk {
  volatility: number;
  correlation: number;
  beta: number;
  marketCapSensitivity: number;
}

export interface ProtocolRisk {
  age: number;
  tvlStability: number;
  governance: GovernanceInfo;
  insurance: InsuranceInfo;
}

export interface GovernanceInfo {
  type: 'dao' | 'multisig' | 'centralized' | 'hybrid';
  token: string;
  votingPower: number;
  proposals: Proposal[];
}

export interface Proposal {
  id: string;
  title: string;
  status: 'active' | 'passed' | 'failed' | 'pending';
  votes: number;
  date: string;
}

export interface InsuranceInfo {
  covered: boolean;
  provider: string;
  coverage: number;
  expiry?: string;
}

export interface RiskFactor {
  category: string;
  score: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

export interface PerformanceMetrics {
  totalReturns: TotalReturns;
  riskAdjustedReturns: RiskAdjustedReturns;
  benchmarks: BenchmarkData[];
  drawdown: DrawdownAnalysis;
  volatility: VolatilityAnalysis;
  correlation: CorrelationAnalysis;
}

export interface TotalReturns {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
  sinceInception: number;
}

export interface RiskAdjustedReturns {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  informationRatio: number;
  alpha: number;
  beta: number;
}

export interface BenchmarkData {
  name: string;
  period: string;
  benchmarkReturn: number;
  poolReturn: number;
  outperformance: number;
}

export interface DrawdownAnalysis {
  maxDrawdown: number;
  avgDrawdown: number;
  currentDrawdown: number;
  recoveryTime: number;
  drawdownPeriods: DrawdownPeriod[];
}

export interface DrawdownPeriod {
  start: string;
  end: string;
  depth: number;
  duration: number;
}

export interface VolatilityAnalysis {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  implied: number;
  historical: HistoricalVolatility[];
}

export interface HistoricalVolatility {
  date: string;
  volatility: number;
  volume: number;
}

export interface CorrelationAnalysis {
  withBTC: number;
  withETH: number;
  withMarket: number;
  withSimilarPools: CorrelationData[];
}

export interface CorrelationData {
  poolName: string;
  correlation: number;
  period: string;
}

export interface RewardBreakdown {
  tradingFees: TradingFeeInfo;
  protocolRewards: ProtocolRewardInfo[];
  stakingRewards: StakingRewardInfo[];
  incentives: IncentiveProgram[];
  totalRewards: RewardSummary;
}

export interface TradingFeeInfo {
  rate: number;
  apr: number;
  volume24h: number;
  fees24h: number;
  efficiency: number;
}

export interface ProtocolRewardInfo {
  token: string;
  apr: number;
  amount: number;
  value: number;
  distribution: RewardDistribution;
}

export interface RewardDistribution {
  schedule: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'epoch';
  frequency: string;
  nextDistribution: string;
  remaining: number;
}

export interface StakingRewardInfo {
  platform: string;
  token: string;
  apr: number;
  lockup: number;
  conditions: StakingCondition[];
}

export interface StakingCondition {
  type: string;
  requirement: string;
  reward: number;
}

export interface IncentiveProgram {
  name: string;
  organizer: string;
  token: string;
  apr: number;
  duration: number;
  totalRewards: number;
  participation: number;
  eligibility: string[];
}

export interface RewardSummary {
  totalAPR: number;
  totalAPY: number;
  breakdown: RewardComponent[];
  projection: RewardProjection[];
}

export interface RewardComponent {
  type: 'trading_fees' | 'protocol_rewards' | 'staking_rewards' | 'incentives';
  apr: number;
  token: string;
  reliability: number;
}

export interface RewardProjection {
  period: string;
  estimatedRewards: number;
  assumptions: string[];
}

export interface AdvancedAnalytics {
  efficiencyMetrics: EfficiencyMetrics;
  capitalEfficiency: CapitalEfficiency;
  userBehavior: UserBehaviorAnalytics;
  marketPosition: MarketPositionAnalysis;
  competitive: CompetitiveAnalysis;
}

export interface EfficiencyMetrics {
  feeEfficiency: number;
  capitalEfficiency: number;
  volumeEfficiency: number;
  liquidityUtilization: number;
  overallScore: number;
}

export interface CapitalEfficiency {
  tvlPerLpToken: number;
  feesPerTvl: number;
  volumePerTvl: number;
  efficiencyRatio: number;
}

export interface UserBehaviorAnalytics {
  uniqueUsers24h: number;
  uniqueUsers7d: number;
  uniqueUsers30d: number;
  activeAddresses: number;
  retentionRate: number;
  acquisitionRate: number;
  transactionFrequency: number;
  avgDepositSize: number;
  userSegments: UserSegment[];
}

export interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
  avgDeposit: number;
  retention: number;
}

export interface MarketPositionAnalysis {
  marketShare: number;
  rank: number;
  competitivePosition: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitiveAnalysis {
  topCompetitors: Competitor[];
  relativePerformance: number;
  marketTrends: MarketTrend[];
}

export interface Competitor {
  name: string;
  tvl: number;
  apy: number;
  volume: number;
  marketShare: number;
}

export interface MarketTrend {
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  timeframe: string;
  description: string;
}

export interface SocialMetrics {
  community: CommunityMetrics;
  development: DevelopmentMetrics;
  media: MediaMetrics;
  sentiment: SentimentAnalysis;
}

export interface CommunityMetrics {
  twitterFollowers: number;
  discordMembers: number;
  telegramMembers: number;
  redditSubscribers: number;
  githubStars: number;
  governanceParticipants: number;
}

export interface DevelopmentMetrics {
  commits30d: number;
  contributors: number;
  prsMerged: number;
  issuesClosed: number;
  releases: number;
  codeQuality: number;
  activityScore: number;
}

export interface MediaMetrics {
  mentions24h: number;
  mentions7d: number;
  mentions30d: number;
  sentimentScore: number;
  trendingTopics: string[];
  mediaCoverage: MediaCoverage[];
}

export interface MediaCoverage {
  source: string;
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
  url?: string;
}

export interface SentimentAnalysis {
  overallScore: number;
  communityScore: number;
  developerScore: number;
  investorScore: number;
  mediaScore: number;
  trend: 'improving' | 'stable' | 'declining';
  factors: SentimentFactor[];
}

export interface SentimentFactor {
  factor: string;
  impact: number;
  trend: string;
  timeframe: string;
}

export interface HistoricalData {
  tvl: HistoricalValue[];
  apy: HistoricalValue[];
  volume: HistoricalValue[];
  fees: HistoricalValue[];
  users: HistoricalValue[];
  price: HistoricalPrice[];
  events: HistoricalEvent[];
}

export interface HistoricalValue {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface HistoricalPrice {
  date: string;
  price: number;
  volume: number;
  marketCap: number;
}

export interface HistoricalEvent {
  date: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'governance' | 'technical' | 'market';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  value?: number;
}

export interface LiquidityAnalysis {
  depthChart: LiquidityDepthData;
  concentration: LiquidityConcentration;
  providers: LiquidityProviderData;
  stability: LiquidityStability;
}

export interface LiquidityDepthData {
  pricePoints: PricePoint[];
  depthAtPrice: number;
  slippageCurve: SlippagePoint[];
}

export interface PricePoint {
  price: number;
  liquidity: number;
  cumulative: number;
}

export interface SlippagePoint {
  tradeSize: number;
  slippage: number;
  priceImpact: number;
}

export interface LiquidityConcentration {
  giniCoefficient: number;
  top10PercentShare: number;
  topProviderCount: number;
  herfindahlIndex: number;
}

export interface LiquidityProviderData {
  totalProviders: number;
  topProviders: TopProvider[];
  newProviders: ProviderActivity[];
  withdrawingProviders: ProviderActivity[];
}

export interface TopProvider {
  address: string;
  value: number;
  share: number;
  joinDate: string;
  deposits: number;
  withdrawals: number;
}

export interface ProviderActivity {
  period: string;
  count: number;
  totalValue: number;
  avgValue: number;
}

export interface LiquidityStability {
  stabilityScore: number;
  volatility: number;
  churnRate: number;
  retentionRate: number;
  providerDistribution: ProviderDistribution[];
}

export interface ProviderDistribution {
  cohort: string;
  count: number;
  percentage: number;
  avgValue: number;
}

export interface SmartContractInfo {
  address: string;
  version: string;
  deployDate: string;
  upgradeability: UpgradeabilityInfo;
  security: SecurityInfo;
  economics: ContractEconomics;
  integration: IntegrationInfo;
}

export interface UpgradeabilityInfo {
  upgradeable: boolean;
  admin: string;
  timelock?: TimelockInfo;
  proxyType: string;
}

export interface TimelockInfo {
  delay: number;
  admin: string;
  pendingTransactions: PendingTransaction[];
}

export interface PendingTransaction {
  id: string;
  target: string;
  value: number;
  eta: string;
  signature: string;
}

export interface SecurityInfo {
  audits: AuditInfo[];
  bugBounties: BugBountyInfo[];
  securityScore: number;
  knownVulnerabilities: string[];
  emergencyFunctions: EmergencyFunction[];
}

export interface AuditInfo {
  firm: string;
  date: string;
  score: number;
  reportUrl: string;
  findings: number;
  critical: number;
  high: number;
}

export interface BugBountyInfo {
  platform: string;
  amount: number;
  status: 'active' | 'paused';
  paid: number;
  open: number;
}

export interface EmergencyFunction {
  name: string;
  description: string;
  accessible: boolean;
  lastUsed?: string;
}

export interface ContractEconomics {
  feesCollected: number;
  revenue: number;
  costs: number;
  profit: number;
  efficiency: number;
}

export interface IntegrationInfo {
  protocols: IntegratedProtocol[];
  oracles: OracleInfo[];
  bridges: BridgeInfo[];
  composability: number;
}

export interface IntegratedProtocol {
  name: string;
  type: string;
  integrationDate: string;
  volumeShared: number;
}

export interface OracleInfo {
  name: string;
  type: string;
  assets: string[];
  updateFrequency: number;
  lastUpdate: string;
}

export interface BridgeInfo {
  name: string;
  chain: string;
  volume: number;
  fees: number;
}

export interface ComparablePools {
  similarPools: ComparablePool[];
  marketComparison: MarketComparison[];
  performanceComparison: PerformanceComparison[];
}

export interface ComparablePool {
  name: string;
  protocol: string;
  chain: Chain;
  tvl: number;
  apy: number;
  volume24h: number;
  riskScore: number;
  score: number;
  reasons: string[];
}

export interface MarketComparison {
  metric: string;
  poolValue: number;
  marketAverage: number;
  percentile: number;
  trend: string;
}

export interface PerformanceComparison {
  period: string;
  poolReturn: number;
  marketReturn: number;
  outperformance: number;
  sharpeRatio: number;
}

// API response types
export interface DetailPageResponse {
  success: boolean;
  data?: DetailPageData;
  error?: string;
  timestamp: number;
  cached: boolean;
  cacheKey: string;
}

export interface MarketMetricsResponse {
  success: boolean;
  data?: MarketMetrics;
  error?: string;
  timestamp: number;
}

export interface RiskAnalysisResponse {
  success: boolean;
  data?: RiskAnalysis;
  error?: string;
  timestamp: number;
}

// Request types
export interface DetailPageRequest {
  poolId: string;
  chain?: Chain;
  includeHistorical?: boolean;
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y';
  benchmarks?: string[];
  comparables?: boolean;
}

export interface AnalyticsRequest {
  poolIds: string[];
  metrics: string[];
  timeRange: string;
  granularity?: 'hourly' | 'daily' | 'weekly';
}