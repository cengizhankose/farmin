export interface RiskFactor {
    name: string;
    severity: 'low' | 'medium' | 'high';
    description?: string;
}
export interface RiskScore {
    total: number;
    overall: number;
    label: 'low' | 'medium' | 'high';
    components: {
        liquidity: number;
        stability: number;
        yield: number;
        concentration: number;
        momentum: number;
    };
    confidence: 'high' | 'medium' | 'low';
    timestamp: number;
    drivers?: string[];
}
export interface HistoricalRiskData {
    date: string;
    timestamp: number;
    overallRiskScore: number;
    individualRisks: {
        liquidity: number;
        stability: number;
        yield: number;
        concentration: number;
        momentum: number;
    };
    marketConditions?: {
        volatility: number;
        trend: 'up' | 'down' | 'sideways';
        sentiment: 'risk_on' | 'risk_off' | 'neutral';
    };
}
export interface AdvancedRiskMetrics {
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    maxDrawdownPeriod: number;
    valueAtRisk: number;
    expectedShortfall: number;
    betaToMarket: number;
    correlationToBenchmark: number;
    informationRatio: number;
    calmarRatio: number;
    omegaRatio: number;
}
export interface CorrelationData {
    protocolId: string;
    protocolName: string;
    correlation: number;
    beta: number;
    rSquared: number;
    pValue: number;
}
export interface SystemicRiskMetrics {
    marketCorrelation: number;
    betaToDeFiMarket: number;
    systemicContribution: number;
    contagionRisk: number;
    liquidityCascationRisk: number;
}
export interface RiskScenario {
    id: string;
    name: string;
    description: string;
    type: 'market_crash' | 'liquidity_crisis' | 'protocol_failure' | 'regulatory' | 'black_swan';
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    estimatedImpact: number;
    duration: string;
    triggers: string[];
    mitigationStrategies: string[];
    historicalPrecedence?: string[];
}
export interface StressTestResult {
    scenarioId: string;
    scenarioName: string;
    baselineValue: number;
    stressedValue: number;
    percentageLoss: number;
    riskFactorChanges: {
        [key: string]: number;
    };
    recoveryProjection: {
        timeToRecovery: string;
        recoveryPath: 'quick' | 'gradual' | 'prolonged';
    };
}
export interface RiskAlert {
    id: string;
    type: 'threshold_breach' | 'spike' | 'trend_change' | 'correlation_breakdown';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    timestamp: number;
    protocolId: string;
    metricName: string;
    currentValue: number;
    threshold: number;
    actionRequired?: string;
    acknowledged: boolean;
}
export interface RiskThreshold {
    metric: string;
    warningLevel: number;
    criticalLevel: number;
    lookbackPeriod: number;
    enabled: boolean;
    notificationChannels: ('email' | 'webhook' | 'in_app')[];
}
export interface PortfolioRiskMetrics {
    totalValue: number;
    weightedRiskScore: number;
    diversificationScore: number;
    concentrationRisk: number;
    correlationRisk: number;
    liquidityRisk: number;
    marketRisk: number;
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    var95: number;
    var99: number;
    expectedShortfall: number;
    beta: number;
    alpha: number;
    informationRatio: number;
}
export interface RiskComparison {
    protocolId: string;
    protocolName: string;
    currentRiskScore: number;
    riskPercentile: number;
    riskCategory: 'conservative' | 'moderate' | 'aggressive' | 'high_risk';
    peerAverage: number;
    riskAdjustedReturn: number;
    stabilityRank: number;
    liquidityRank: number;
    yieldRank: number;
}
export interface MarketRegime {
    regime: 'bull' | 'bear' | 'sideways' | 'high_volatility' | 'low_volatility';
    confidence: number;
    duration: string;
    characteristics: {
        volatility: number;
        trend_strength: number;
        correlation_level: number;
        liquidity_conditions: 'tight' | 'normal' | 'ample';
    };
    riskImplications: {
        preferred_strategies: string[];
        risk_factors: string[];
        hedging_recommendations: string[];
    };
}
export interface RiskAttribution {
    factor: string;
    contribution: number;
    marginalContribution: number;
    sensitivity: number;
    category: 'market' | 'credit' | 'liquidity' | 'operational' | 'systemic';
}
export interface MonteCarloResult {
    simulations: number;
    meanReturn: number;
    volatility: number;
    percentiles: {
        p5: number;
        p10: number;
        p25: number;
        p50: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
    };
    probabilityOfLoss: number;
    expectedLoss: number;
    tailRisk: number;
}
export interface LiquidityRiskMetrics {
    depthScore: number;
    slippage1M: number;
    slippage5M: number;
    marketImpact: number;
    recoveryTime: number;
    liquidityConcentration: number;
    tradingVolumeTrend: number;
    bidAskSpread: number;
    orderBookDepth: number;
}
export interface CounterpartyRiskMetrics {
    protocolHealthScore: number;
    smartContractRisk: number;
    auditScore: number;
    teamExperience: number;
    treasuryHealth: number;
    insuranceCoverage: number;
    governanceRisk: number;
    regulatoryCompliance: number;
}
export declare function isHistoricalRiskData(data: any): data is HistoricalRiskData;
export declare function isAdvancedRiskMetrics(data: any): data is AdvancedRiskMetrics;
export declare function isRiskAlert(data: any): data is RiskAlert;
//# sourceMappingURL=risk-advanced.d.ts.map