import {
  HistoricalData,
  MarketMetrics,
  RiskAnalysis,
  PerformanceMetrics,
  RewardBreakdown,
  AdvancedAnalytics,
  SocialMetrics,
  LiquidityAnalysis,
  ComparablePools
} from '../types/detail';

// Type definitions for return types
interface RewardOptimization {
  efficiency: {
    rewardToRevenueRatio: number;
    sustainability: string;
    costEffectiveness: number;
  };
  sustainability: {
    incentiveDuration: number;
    rewardVolatility: number;
    sustainabilityScore: number;
  };
  projection: {
    projectedAPR: number;
    projectedAPY: number;
    timeHorizon: string;
    assumptions: string[];
  };
  optimization: Array<{
    type: string;
    description: string;
    action: string;
  }>;
}

interface LiquidityEfficiency {
  depthEfficiency: number;
  concentrationEfficiency: number;
  stabilityEfficiency: number;
  utilizationEfficiency: number;
  overallScore: number;
}

interface PortfolioOptimization {
  correlationMatrix: any[][];
  efficientFrontier: any[];
  riskParity: any;
  optimalAllocation: any;
}

/**
 * Advanced Analytics Engine
 * Provides sophisticated calculations and insights for DeFi pools
 */
export class AnalyticsEngine {
  private precision = 6; // Decimal places for precision
  private riskWeights = {
    smartContract: 0.3,
    liquidity: 0.25,
    market: 0.2,
    protocol: 0.15,
    impermanentLoss: 0.1
  };

  /**
   * Calculate comprehensive performance metrics
   */
  calculatePerformanceMetrics(historicalData: HistoricalData): PerformanceMetrics {
    const returns = this.calculateReturns(historicalData);
    const riskMetrics = this.calculateRiskMetrics(historicalData);
    const benchmarks = this.generateBenchmarks(returns);
    const drawdown = this.calculateDrawdown(historicalData);
    const volatility = this.calculateVolatility(historicalData);
    const correlation = this.calculateCorrelation(historicalData);

    return {
      totalReturns: returns,
      riskAdjustedReturns: riskMetrics,
      benchmarks,
      drawdown,
      volatility,
      correlation
    };
  }

  /**
   * Calculate comprehensive risk analysis
   */
  calculateRiskAnalysis(
    marketMetrics: MarketMetrics,
    liquidityAnalysis: LiquidityAnalysis,
    smartContractInfo: any
  ): RiskAnalysis {
    const impermanentLossRisk = this.calculateImpermanentLossRisk(marketMetrics);
    const smartContractRisk = this.calculateSmartContractRisk(smartContractInfo);
    const liquidityRisk = this.calculateLiquidityRisk(liquidityAnalysis);
    const marketRisk = this.calculateMarketRisk(marketMetrics);
    const protocolRisk = this.calculateProtocolRisk();

    const overallRiskScore = this.calculateOverallRiskScore({
      impermanentLossRisk,
      smartContractRisk,
      liquidityRisk,
      marketRisk,
      protocolRisk
    });

    const riskFactors = this.generateRiskFactors({
      impermanentLossRisk,
      smartContractRisk,
      liquidityRisk,
      marketRisk,
      protocolRisk
    });

    return {
      impermanentLossRisk,
      smartContractRisk,
      liquidityRisk,
      marketRisk,
      protocolRisk,
      overallRiskScore,
      riskFactors
    };
  }

  /**
   * Calculate advanced analytics
   */
  calculateAdvancedAnalytics(
    marketMetrics: MarketMetrics,
    performanceMetrics: PerformanceMetrics,
    socialMetrics: SocialMetrics
  ): AdvancedAnalytics {
    const efficiencyMetrics = this.calculateEfficiencyMetrics(marketMetrics, performanceMetrics);
    const capitalEfficiency = this.calculateCapitalEfficiency(marketMetrics);
    const userBehavior = this.analyzeUserBehavior(socialMetrics);
    const marketPosition = this.analyzeMarketPosition(marketMetrics, performanceMetrics);
    const competitive = this.performCompetitiveAnalysis(marketMetrics);

    return {
      efficiencyMetrics,
      capitalEfficiency,
      userBehavior,
      marketPosition,
      competitive
    };
  }

  /**
   * Calculate reward optimization analysis
   */
  calculateRewardOptimization(rewardBreakdown: RewardBreakdown): RewardOptimization {
    const efficiency = this.calculateRewardEfficiency(rewardBreakdown);
    const sustainability = this.assessRewardSustainability(rewardBreakdown);
    const projection = this.projectRewards(rewardBreakdown);
    const optimization = this.suggestOptimization(rewardBreakdown);

    return {
      efficiency,
      sustainability,
      projection,
      optimization
    };
  }

  /**
   * Calculate liquidity efficiency metrics
   */
  calculateLiquidityEfficiency(liquidityAnalysis: LiquidityAnalysis, marketMetrics: MarketMetrics): LiquidityEfficiency {
    const depthScore = this.calculateDepthScore(liquidityAnalysis.depthChart);
    const concentrationScore = this.calculateConcentrationScore(liquidityAnalysis.concentration);
    const stabilityScore = this.calculateStabilityScore(liquidityAnalysis.stability);
    const utilizationScore = this.calculateUtilizationScore(marketMetrics.utilizationRate);

    return {
      depthEfficiency: depthScore,
      concentrationEfficiency: concentrationScore,
      stabilityEfficiency: stabilityScore,
      utilizationEfficiency: utilizationScore,
      overallScore: this.round((depthScore + concentrationScore + stabilityScore + utilizationScore) / 4)
    };
  }

  /**
   * Calculate portfolio optimization metrics
   */
  calculatePortfolioOptimization(pools: ComparablePools): PortfolioOptimization {
    const correlationMatrix = this.calculateCorrelationMatrix(pools);
    const efficientFrontier = this.calculateEfficientFrontier(pools);
    const riskParity = this.calculateRiskParity(pools);
    const optimalAllocation = this.suggestOptimalAllocation(pools);

    return {
      correlationMatrix,
      efficientFrontier,
      riskParity,
      optimalAllocation
    };
  }

  // Private calculation methods

  private calculateReturns(historicalData: HistoricalData) {
    if (!historicalData.tvl || historicalData.tvl.length < 2) {
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        quarterly: 0,
        yearly: 0,
        sinceInception: 0
      };
    }

    const tvl = historicalData.tvl;
    const returns = this.calculatePeriodReturns(tvl);

    return {
      daily: returns.daily,
      weekly: returns.weekly,
      monthly: returns.monthly,
      quarterly: returns.quarterly,
      yearly: returns.yearly,
      sinceInception: returns.sinceInception
    };
  }

  private calculatePeriodReturns(data: any[]) {
    if (data.length < 2) return { daily: 0, weekly: 0, monthly: 0, quarterly: 0, yearly: 0, sinceInception: 0 };

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;

    const dailyReturn = data.length >= 2 ?
      ((data[data.length - 1].value - data[data.length - 2].value) / data[data.length - 2].value) * 100 : 0;

    const weeklyReturn = data.length >= 7 ?
      ((lastValue - data[data.length - 7].value) / data[data.length - 7].value) * 100 : 0;

    const monthlyReturn = data.length >= 30 ?
      ((lastValue - data[data.length - 30].value) / data[data.length - 30].value) * 100 : 0;

    const quarterlyReturn = data.length >= 90 ?
      ((lastValue - data[data.length - 90].value) / data[data.length - 90].value) * 100 : 0;

    const yearlyReturn = data.length >= 365 ?
      ((lastValue - data[data.length - 365].value) / data[data.length - 365].value) * 100 : 0;

    const sinceInception = ((lastValue - firstValue) / firstValue) * 100;

    return {
      daily: this.round(dailyReturn),
      weekly: this.round(weeklyReturn),
      monthly: this.round(monthlyReturn),
      quarterly: this.round(quarterlyReturn),
      yearly: this.round(yearlyReturn),
      sinceInception: this.round(sinceInception)
    };
  }

  private calculateRiskMetrics(historicalData: HistoricalData) {
    if (!historicalData.tvl || historicalData.tvl.length < 2) {
      return {
        sharpeRatio: 0,
        sortinoRatio: 0,
        calmarRatio: 0,
        informationRatio: 0,
        alpha: 0,
        beta: 0
      };
    }

    const returns = this.calculateReturnsSeries(historicalData.tvl);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateStandardDeviation(returns);
    const riskFreeRate = 0.02; // Assume 2% risk-free rate

    const sharpeRatio = volatility > 0 ? (meanReturn - riskFreeRate) / volatility : 0;
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVolatility = this.calculateStandardDeviation(downsideReturns);
    const sortinoRatio = downsideVolatility > 0 ? (meanReturn - riskFreeRate) / downsideVolatility : 0;

    return {
      sharpeRatio: this.round(sharpeRatio),
      sortinoRatio: this.round(sortinoRatio),
      calmarRatio: 0, // Requires max drawdown
      informationRatio: 0, // Requires benchmark
      alpha: 0, // Requires benchmark
      beta: 0 // Requires benchmark correlation
    };
  }

  private calculateReturnsSeries(data: any[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const returnRate = ((data[i].value - data[i - 1].value) / data[i - 1].value);
      returns.push(returnRate);
    }
    return returns;
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;

    return Math.sqrt(variance);
  }

  private generateBenchmarks(returns: any) {
    return [
      {
        name: 'DeFi Pulse Index',
        period: '30d',
        benchmarkReturn: 5.2,
        poolReturn: returns.monthly,
        outperformance: this.round(returns.monthly - 5.2)
      },
      {
        name: 'S&P 500',
        period: '30d',
        benchmarkReturn: 2.1,
        poolReturn: returns.monthly,
        outperformance: this.round(returns.monthly - 2.1)
      }
    ];
  }

  private calculateDrawdown(historicalData: HistoricalData) {
    if (!historicalData.tvl || historicalData.tvl.length < 2) {
      return {
        maxDrawdown: 0,
        avgDrawdown: 0,
        currentDrawdown: 0,
        recoveryTime: 0,
        drawdownPeriods: []
      };
    }

    const tvl = historicalData.tvl;
    const drawdowns: any[] = [];
    let peak = tvl[0].value;
    let maxDrawdown = 0;

    for (let i = 1; i < tvl.length; i++) {
      const currentValue = tvl[i].value;
      const drawdown = ((peak - currentValue) / peak) * 100;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      if (currentValue > peak) {
        peak = currentValue;
      }

      drawdowns.push({
        date: tvl[i].date,
        drawdown: this.round(drawdown)
      });
    }

    return {
      maxDrawdown: this.round(maxDrawdown),
      avgDrawdown: this.round(drawdowns.reduce((sum, d) => sum + d.drawdown, 0) / drawdowns.length),
      currentDrawdown: this.round(drawdowns[drawdowns.length - 1]?.drawdown || 0),
      recoveryTime: 0, // Would need more complex calculation
      drawdownPeriods: drawdowns
    };
  }

  private calculateVolatility(historicalData: HistoricalData) {
    if (!historicalData.tvl || historicalData.tvl.length < 2) {
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        implied: 0,
        historical: []
      };
    }

    const returns = this.calculateReturnsSeries(historicalData.tvl);
    const dailyVolatility = this.calculateStandardDeviation(returns) * Math.sqrt(365) * 100;

    return {
      daily: this.round(dailyVolatility),
      weekly: this.round(dailyVolatility / Math.sqrt(7)),
      monthly: this.round(dailyVolatility / Math.sqrt(30)),
      yearly: this.round(dailyVolatility),
      implied: 0, // Would need options data
      historical: returns.map((r, i) => ({
        date: historicalData.tvl[i + 1]?.date || '',
        volatility: this.round(Math.abs(r) * 100),
        volume: historicalData.volume[i]?.value || 0
      }))
    };
  }

  private calculateCorrelation(historicalData: HistoricalData) {
    return {
      withBTC: 0, // Would need BTC price data
      withETH: 0, // Would need ETH price data
      withMarket: 0, // Would need market index data
      withSimilarPools: [] // Would need similar pools data
    };
  }

  private calculateImpermanentLossRisk(marketMetrics: MarketMetrics) {
    // Simplified IL risk calculation based on volatility and correlation
    const volatilityScore = Math.min(marketMetrics.priceImpact.volatility * 10, 100);
    const correlationScore = Math.abs(marketMetrics.priceImpact.correlation) * 100;
    const ilScore = (volatilityScore + correlationScore) / 2;

    return {
      score: this.round(ilScore),
      description: this.getILRiskDescription(ilScore),
      historicalIL: [],
      protection: this.getILProtectionMeasures()
    };
  }

  private getILRiskDescription(score: number): string {
    if (score < 20) return 'Low impermanent loss risk';
    if (score < 40) return 'Moderate impermanent loss risk';
    if (score < 60) return 'High impermanent loss risk';
    return 'Very high impermanent loss risk';
  }

  private getILProtectionMeasures(): string[] {
    return [
      'Stablecoin pairs minimize IL',
      'Correlated assets reduce IL',
      'Shorter positions reduce IL exposure',
      'Regular rebalancing can mitigate IL'
    ];
  }

  private calculateSmartContractRisk(smartContractInfo: any) {
    const auditScore = smartContractInfo.security?.audits?.[0]?.score || 0;
    const codeQuality = smartContractInfo.security?.codeQuality || 0;
    const hasTimelock = smartContractInfo.upgradeability?.timelock ? 25 : 0;
    const hasMultisig = smartContractInfo.upgradeability?.multisig ? 25 : 0;

    const score = this.round((auditScore + codeQuality + hasTimelock + hasMultisig) / 4);

    return {
      auditScore: this.round(auditScore),
      auditStatus: {
        audited: auditScore > 0,
        auditor: smartContractInfo.security?.audits?.[0]?.firm || 'Unknown',
        date: smartContractInfo.security?.audits?.[0]?.date || '',
        score: this.round(auditScore)
      },
      vulnerabilities: [],
      codeQuality: this.round(codeQuality),
      timelock: !!smartContractInfo.upgradeability?.timelock,
      multisig: !!smartContractInfo.upgradeability?.multisig,
      pauseFunction: !!smartContractInfo.security?.emergencyFunctions?.length
    };
  }

  private calculateLiquidityRisk(liquidityAnalysis: LiquidityAnalysis) {
    const concentrationPenalty = liquidityAnalysis.concentration.top10PercentShare;
    const depthScore = Math.min(liquidityAnalysis.depthChart.depthAtPrice / 1000000 * 100, 100);
    const stabilityScore = liquidityAnalysis.stability.stabilityScore;
    const providerCountScore = Math.min(liquidityAnalysis.providers.totalProviders / 100 * 100, 100);

    const score = this.round((depthScore + stabilityScore + providerCountScore - concentrationPenalty) / 3);

    return {
      score: Math.max(0, Math.min(100, score)),
      depth: this.round(depthScore),
      stability: this.round(stabilityScore),
      concentration: this.round(concentrationPenalty),
      providerCount: liquidityAnalysis.providers.totalProviders,
      topProviders: liquidityAnalysis.providers.topProviders.slice(0, 5)
    };
  }

  private calculateMarketRisk(marketMetrics: MarketMetrics) {
    const volatilityScore = Math.min(marketMetrics.priceImpact.volatility * 20, 100);
    const correlationScore = Math.abs(marketMetrics.priceImpact.correlation) * 100;
    const utilizationScore = marketMetrics.utilizationRate * 100;

    const score = this.round((volatilityScore + correlationScore + utilizationScore) / 3);

    return {
      volatility: this.round(volatilityScore),
      correlation: this.round(correlationScore),
      beta: 0, // Would need market data
      marketCapSensitivity: this.round(utilizationScore)
    };
  }

  private calculateProtocolRisk() {
    // Simplified protocol risk calculation
    return {
      age: 365, // Assuming 1 year
      tvlStability: 75, // Assuming good stability
      governance: {
        type: 'dao' as const,
        token: '',
        votingPower: 65,
        proposals: []
      },
      insurance: {
        covered: false,
        provider: '',
        coverage: 0
      }
    };
  }

  private calculateOverallRiskScore(risks: any): number {
    const weightedScore =
      risks.impermanentLossRisk.score * this.riskWeights.impermanentLoss +
      risks.smartContractRisk.auditScore * this.riskWeights.smartContract +
      risks.liquidityRisk.score * this.riskWeights.liquidity +
      risks.marketRisk.volatility * this.riskWeights.market +
      25 * this.riskWeights.protocol; // Fixed score for protocol

    return this.round(weightedScore);
  }

  private generateRiskFactors(risks: any) {
    const factors = [];

    if (risks.impermanentLossRisk.score > 60) {
      factors.push({
        category: 'Impermanent Loss',
        score: risks.impermanentLossRisk.score,
        impact: 'high' as const,
        description: 'High volatility increases IL risk',
        mitigation: 'Consider stablecoin pairs or shorter positions'
      });
    }

    if (risks.smartContractRisk.auditScore < 70) {
      factors.push({
        category: 'Smart Contract',
        score: risks.smartContractRisk.auditScore,
        impact: 'high' as const,
        description: 'Audit score indicates potential security concerns',
        mitigation: 'Wait for additional audits or security reviews'
      });
    }

    if (risks.liquidityRisk.score > 60) {
      factors.push({
        category: 'Liquidity',
        score: risks.liquidityRisk.score,
        impact: 'medium' as const,
        description: 'High liquidity concentration risk',
        mitigation: 'Monitor liquidity provider distribution'
      });
    }

    return factors;
  }

  private calculateEfficiencyMetrics(marketMetrics: MarketMetrics, performanceMetrics: PerformanceMetrics) {
    const feeEfficiency = marketMetrics.fees24h > 0 ?
      (marketMetrics.fees24h / marketMetrics.volume24h) * 100 : 0;

    const capitalEfficiency = marketMetrics.volume24h > 0 ?
      (marketMetrics.volume24h / (marketMetrics.volume24h * 0.003)) : 0; // Assuming 0.3% fee

    const volumeEfficiency = performanceMetrics.totalReturns.monthly > 0 ?
      (performanceMetrics.totalReturns.monthly / marketMetrics.utilizationRate) : 0;

    const liquidityUtilization = marketMetrics.utilizationRate * 100;

    return {
      feeEfficiency: this.round(feeEfficiency),
      capitalEfficiency: this.round(capitalEfficiency),
      volumeEfficiency: this.round(volumeEfficiency),
      liquidityUtilization: this.round(liquidityUtilization),
      overallScore: this.round((feeEfficiency + capitalEfficiency + volumeEfficiency + liquidityUtilization) / 4)
    };
  }

  private calculateCapitalEfficiency(marketMetrics: MarketMetrics) {
    return {
      tvlPerLpToken: 1000, // Simplified assumption
      feesPerTvl: marketMetrics.fees24h / (marketMetrics.volume24h * 100),
      volumePerTvl: marketMetrics.volume24h / (marketMetrics.volume24h * 0.003),
      efficiencyRatio: this.round((marketMetrics.fees24h / marketMetrics.volume24h) * 100)
    };
  }

  private analyzeUserBehavior(socialMetrics: SocialMetrics) {
    return {
      uniqueUsers24h: socialMetrics.community.uniqueUsers24h,
      uniqueUsers7d: socialMetrics.community.uniqueUsers7d,
      uniqueUsers30d: socialMetrics.community.uniqueUsers30d,
      activeAddresses: Math.floor(socialMetrics.community.uniqueUsers24h * 0.8),
      retentionRate: socialMetrics.community.uniqueUsers30d > 0 ?
        (socialMetrics.community.uniqueUsers7d / socialMetrics.community.uniqueUsers30d) * 100 : 0,
      acquisitionRate: socialMetrics.community.uniqueUsers7d > 0 ?
        ((socialMetrics.community.uniqueUsers24h - socialMetrics.community.uniqueUsers7d) / socialMetrics.community.uniqueUsers7d) * 100 : 0,
      transactionFrequency: 5.2, // Simplified assumption
      avgDepositSize: 5000, // Simplified assumption
      userSegments: [
        {
          segment: 'Whales',
          count: Math.floor(socialMetrics.community.uniqueUsers24h * 0.05),
          percentage: 5,
          avgDeposit: 50000,
          retention: 85
        },
        {
          segment: 'Retail',
          count: Math.floor(socialMetrics.community.uniqueUsers24h * 0.95),
          percentage: 95,
          avgDeposit: 2000,
          retention: 60
        }
      ]
    };
  }

  private analyzeMarketPosition(marketMetrics: MarketMetrics, performanceMetrics: PerformanceMetrics) {
    return {
      marketShare: 2.5, // Simplified assumption
      rank: 15, // Simplified assumption
      competitivePosition: 'Emerging Contender',
      strengths: ['High APY', 'Good liquidity', 'Active community'],
      weaknesses: ['New protocol', 'Limited audit history'],
      opportunities: ['Market expansion', 'Feature additions'],
      threats: ['Competition', 'Market volatility']
    };
  }

  private performCompetitiveAnalysis(marketMetrics: MarketMetrics) {
    return {
      topCompetitors: [
        { name: 'Uniswap', tvl: marketMetrics.volume24h * 5, apy: 3.2, volume: marketMetrics.volume24h * 3, marketShare: 25 },
        { name: 'Curve', tvl: marketMetrics.volume24h * 3, apy: 4.1, volume: marketMetrics.volume24h * 2, marketShare: 15 },
        { name: 'Balancer', tvl: marketMetrics.volume24h * 1.5, apy: 5.8, volume: marketMetrics.volume24h * 1.2, marketShare: 8 }
      ],
      relativePerformance: 120, // Above average
      marketTrends: [
        { trend: 'Yield farming growth', impact: 'positive' as const, timeframe: '6 months', description: 'Growing interest in yield optimization' },
        { trend: 'Liquidity mining decline', impact: 'negative' as const, timeframe: '3 months', description: 'Reduced incentive programs' }
      ]
    };
  }

  private calculateRewardEfficiency(rewardBreakdown: RewardBreakdown) {
    const totalCost = rewardBreakdown.totalRewards.totalAPR;
    const totalRevenue = rewardBreakdown.tradingFees.fees24h * 365; // Annualized
    const efficiency = totalCost > 0 ? (totalRevenue / totalCost) * 100 : 0;

    return {
      rewardToRevenueRatio: this.round(efficiency),
      sustainability: efficiency > 50 ? 'high' : efficiency > 25 ? 'medium' : 'low',
      costEffectiveness: this.round(efficiency)
    };
  }

  private assessRewardSustainability(rewardBreakdown: RewardBreakdown) {
    const incentiveDuration = rewardBreakdown.incentives.reduce((sum, inc) => sum + inc.duration, 0);
    const avgRewardRate = rewardBreakdown.totalRewards.totalAPR;

    return {
      incentiveDuration: incentiveDuration / rewardBreakdown.incentives.length,
      rewardVolatility: 15, // Simplified assumption
      sustainabilityScore: avgRewardRate < 20 ? 80 : avgRewardRate < 50 ? 60 : 40
    };
  }

  private projectRewards(rewardBreakdown: RewardBreakdown) {
    return {
      projectedAPR: rewardBreakdown.totalRewards.totalAPR * 0.9, // 10% reduction assumption
      projectedAPY: rewardBreakdown.totalRewards.totalAPY * 0.9,
      timeHorizon: '90 days',
      assumptions: [
        'Current reward rates maintained',
        'Market conditions stable',
        'No protocol changes'
      ]
    };
  }

  private suggestOptimization(rewardBreakdown: RewardBreakdown) {
    const suggestions = [];

    if (rewardBreakdown.totalRewards.totalAPR > 30) {
      suggestions.push({
        type: 'high_rewards',
        description: 'High reward rates may not be sustainable',
        action: 'Consider taking profits or diversifying'
      });
    }

    if (rewardBreakdown.tradingFees.apr < 1) {
      suggestions.push({
        type: 'low_fees',
        description: 'Low trading fee APR',
        action: 'Consider pools with higher trading volume'
      });
    }

    return suggestions;
  }

  private calculateDepthScore(depthChart: any): number {
    return this.round(Math.min(depthChart.depthAtPrice / 1000000 * 100, 100));
  }

  private calculateConcentrationScore(concentration: any): number {
    return this.round(100 - concentration.top10PercentShare);
  }

  private calculateStabilityScore(stability: any): number {
    return this.round(stability.stabilityScore);
  }

  private calculateUtilizationScore(utilizationRate: number): number {
    return this.round(utilizationRate * 100);
  }

  private calculateCorrelationMatrix(pools: ComparablePools): any[][] {
    // Simplified correlation matrix
    const size = pools.similarPools.length;
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

    // Fill diagonal with 1 (perfect correlation with self)
    for (let i = 0; i < size; i++) {
      matrix[i][i] = 1;
    }

    return matrix;
  }

  private calculateEfficientFrontier(pools: ComparablePools): any[] {
    // Simplified efficient frontier calculation
    return [
      { risk: 5, return: 8 },
      { risk: 10, return: 12 },
      { risk: 15, return: 16 },
      { risk: 20, return: 18 },
      { risk: 25, return: 19 }
    ];
  }

  private calculateRiskParity(pools: ComparablePools): any {
    return {
      targetRisk: 15,
      allocation: pools.similarPools.map(pool => ({
        pool: pool.name,
        allocation: 100 / pools.similarPools.length,
        contribution: pool.riskScore / pools.similarPools.length
      }))
    };
  }

  private suggestOptimalAllocation(pools: ComparablePools): any {
    const sortedBySharpe = [...pools.similarPools]
      .sort((a, b) => (b.apy / b.riskScore) - (a.apy / a.riskScore));

    return {
      strategy: 'Maximize Sharpe Ratio',
      allocation: sortedBySharpe.slice(0, 3).map(pool => ({
        pool: pool.name,
        allocation: 33.33,
        expectedReturn: pool.apy,
        expectedRisk: pool.riskScore
      }))
    };
  }

  private round(value: number): number {
    return Math.round(value * Math.pow(10, this.precision)) / Math.pow(10, this.precision);
  }
}

// Export singleton instance
export const analyticsEngine = new AnalyticsEngine();