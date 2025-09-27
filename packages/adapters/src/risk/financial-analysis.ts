import { Opportunity, RiskAssessment } from '@shared/core';

export interface MarketData {
  timestamp: number;
  price: number;
  volume: number;
  volatility: number;
  marketCap: number;
  tvl: number;
}

export interface VolatilityMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  implied: number;
  historical: number;
}

export interface YieldComponents {
  baseYield: number;
  rewardTokenYield: number;
  tradingFees: number;
  impermanentLoss: number;
  total: number;
  sustainability: number; // 0-1 score
}

export interface LiquidityAnalysis {
  depth: {
    '1m': number; // liquidity depth for $1M trade
    '5m': number; // liquidity depth for $5M trade
    '10m': number; // liquidity depth for $10M trade
  };
  concentration: number; // 0-1, higher means more concentrated
  slippage: {
    '1m': number;
    '5m': number;
    '10m': number;
  };
  utilization: number; // pool utilization rate
}

export interface RiskFactors {
  marketVolatility: number;
  liquidityRisk: number;
  smartContractRisk: number;
  impermanentLossRisk: number;
  yieldSustainabilityRisk: number;
  concentrationRisk: number;
  counterpartyRisk: number;
}

export interface StressTest {
  scenario: string;
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
  parameters: {
    priceChange: number;
    volumeChange: number;
    liquidityChange: number;
    volatilityChange: number;
  };
  impact: {
    valueChange: number;
    liquidityChange: number;
    apyChange: number;
    riskScoreChange: number;
  };
}

export class FinancialRiskAnalyzer {
  private historicalData: Map<string, MarketData[]> = new Map();
  private volatilityCache: Map<string, VolatilityMetrics> = new Map();
  private updateInterval: NodeJS.Timeout;

  constructor() {
    this.startPeriodicUpdates();
  }

  async analyzeOpportunityRisk(opportunity: Opportunity): Promise<{
    riskAssessment: RiskAssessment;
    marketConditions: {
      regime: 'bull' | 'bear' | 'sideways' | 'high_volatility' | 'low_volatility';
      confidence: number;
      volatility: VolatilityMetrics;
    };
    yieldAnalysis: YieldComponents;
    liquidityAnalysis: LiquidityAnalysis;
    stressTests: StressTest[];
    riskFactors: RiskFactors;
    recommendations: string[];
  }> {
    const marketData = await this.getMarketData(opportunity.chain, opportunity.pool);
    const volatility = await this.calculateVolatility(marketData);
    const yieldComponents = await this.analyzeYieldComponents(opportunity);
    const liquidityAnalysis = await this.analyzeLiquidity(opportunity);
    const stressTests = await this.runStressTests(opportunity, marketData);
    const riskFactors = await this.calculateRiskFactors(opportunity, marketData);
    const marketRegime = this.detectMarketRegime(marketData);

    const riskAssessment = this.generateRiskAssessment({
      opportunity,
      volatility,
      yieldComponents,
      liquidityAnalysis,
      stressTests,
      riskFactors,
      marketRegime
    });

    const recommendations = await this.generateRecommendations({
      opportunity,
      riskAssessment,
      marketConditions: marketRegime,
      stressTests,
      riskFactors
    });

    return {
      riskAssessment,
      marketConditions: {
        regime: marketRegime.regime,
        confidence: marketRegime.confidence,
        volatility
      },
      yieldAnalysis: yieldComponents,
      liquidityAnalysis,
      stressTests,
      riskFactors,
      recommendations
    };
  }

  private async getMarketData(chain: string, pool: string): Promise<MarketData[]> {
    const key = `${chain}:${pool}`;
    let data = this.historicalData.get(key);

    if (!data || data.length === 0) {
      // Fetch fresh data (mock implementation)
      data = await this.fetchMarketData(chain, pool);
      this.historicalData.set(key, data);
    }

    return data;
  }

  private async fetchMarketData(chain: string, pool: string): Promise<MarketData[]> {
    // Mock implementation - in production, this would fetch from actual data sources
    const data: MarketData[] = [];
    const now = Date.now();
    const basePrice = 1000 + Math.random() * 500;

    for (let i = 0; i < 30; i++) {
      const timestamp = now - (30 - i) * 24 * 60 * 60 * 1000;
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
      const volume = 1000000 + Math.random() * 500000;
      const volatility = 0.02 + Math.random() * 0.08;

      data.push({
        timestamp,
        price,
        volume,
        volatility,
        marketCap: price * 1000000,
        tvl: price * 500000
      });
    }

    return data;
  }

  private async calculateVolatility(marketData: MarketData[]): Promise<VolatilityMetrics> {
    const prices = marketData.map(d => d.price);
    const returns = [];

    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    if (returns.length === 0) {
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        implied: 0,
        historical: 0
      };
    }

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualize volatility
    const dailyVolatility = stdDev;
    const weeklyVolatility = dailyVolatility * Math.sqrt(7);
    const monthlyVolatility = dailyVolatility * Math.sqrt(30);
    const yearlyVolatility = dailyVolatility * Math.sqrt(365);

    return {
      daily: dailyVolatility,
      weekly: weeklyVolatility,
      monthly: monthlyVolatility,
      yearly: yearlyVolatility,
      implied: yearlyVolatility * 1.1, // Mock implied volatility
      historical: yearlyVolatility
    };
  }

  private async analyzeYieldComponents(opportunity: Opportunity): Promise<YieldComponents> {
    const baseYield = opportunity.apy * 0.6; // Assume 60% is base yield
    const rewardTokenYield = opportunity.apy * 0.3; // 30% from reward tokens
    const tradingFees = opportunity.apy * 0.1; // 10% from trading fees

    // Calculate impermanent loss risk (simplified)
    const impermanentLoss = Math.abs(opportunity.apy * 0.05 * Math.random());

    // Calculate sustainability score based on token emissions and other factors
    const sustainability = this.calculateYieldSustainability({
      baseYield,
      rewardTokenYield,
      tradingFees,
      opportunity
    });

    return {
      baseYield,
      rewardTokenYield,
      tradingFees,
      impermanentLoss,
      total: opportunity.apy,
      sustainability
    };
  }

  private calculateYieldSustainability(components: {
    baseYield: number;
    rewardTokenYield: number;
    tradingFees: number;
    opportunity: Opportunity;
  }): number {
    let score = 1.0;

    // Penalize high reward token emissions
    const rewardTokenRatio = components.rewardTokenYield / components.opportunity.apy;
    if (rewardTokenRatio > 0.5) {
      score *= 0.7;
    } else if (rewardTokenRatio > 0.3) {
      score *= 0.85;
    }

    // Bonus for high trading fees (sustainable)
    const feeRatio = components.tradingFees / components.opportunity.apy;
    if (feeRatio > 0.2) {
      score *= 1.1;
    }

    // Bonus for reasonable total APY
    if (components.opportunity.apy > 100) {
      score *= 0.8; // Very high APYs are less sustainable
    }

    return Math.min(score, 1.0);
  }

  private async analyzeLiquidity(opportunity: Opportunity): Promise<LiquidityAnalysis> {
    const tvl = opportunity.tvlUsd || 0;

    // Calculate liquidity depth (simplified)
    const depth = {
      '1m': Math.min(tvl * 0.01, 1000000),
      '5m': Math.min(tvl * 0.05, 5000000),
      '10m': Math.min(tvl * 0.1, 10000000)
    };

    // Calculate concentration (simplified - would need more data in production)
    const concentration = Math.random() * 0.8 + 0.1; // 0.1 to 0.9

    // Calculate slippage (simplified)
    const slippage = {
      '1m': (1000000 / tvl) * 0.01,
      '5m': (5000000 / tvl) * 0.01,
      '10m': (10000000 / tvl) * 0.01
    };

    // Pool utilization (mock data)
    const utilization = 0.6 + Math.random() * 0.3;

    return {
      depth,
      concentration,
      slippage,
      utilization
    };
  }

  private async runStressTests(
    opportunity: Opportunity,
    marketData: MarketData[]
  ): Promise<StressTest[]> {
    const currentPrice = marketData[marketData.length - 1]?.price || 1000;
    const currentTVL = opportunity.tvlUsd || 0;
    const currentAPY = opportunity.apy;

    const scenarios: StressTest[] = [
      {
        scenario: 'Market Crash (-30%)',
        severity: 'severe',
        parameters: {
          priceChange: -0.3,
          volumeChange: -0.5,
          liquidityChange: -0.2,
          volatilityChange: 2.0
        },
        impact: {
          valueChange: -0.25,
          liquidityChange: -0.15,
          apyChange: -0.1,
          riskScoreChange: 0.3
        }
      },
      {
        scenario: 'Liquidity Crisis (-50%)',
        severity: 'extreme',
        parameters: {
          priceChange: -0.2,
          volumeChange: -0.8,
          liquidityChange: -0.5,
          volatilityChange: 3.0
        },
        impact: {
          valueChange: -0.4,
          liquidityChange: -0.5,
          apyChange: -0.2,
          riskScoreChange: 0.5
        }
      },
      {
        scenario: 'High Volatility (+200%)',
        severity: 'moderate',
        parameters: {
          priceChange: 0,
          volumeChange: 1.5,
          liquidityChange: 0,
          volatilityChange: 2.0
        },
        impact: {
          valueChange: 0,
          liquidityChange: 0.1,
          apyChange: 0.05,
          riskScoreChange: 0.15
        }
      },
      {
        scenario: 'Protocol Hack Risk',
        severity: 'extreme',
        parameters: {
          priceChange: -0.5,
          volumeChange: -0.9,
          liquidityChange: -0.8,
          volatilityChange: 5.0
        },
        impact: {
          valueChange: -0.8,
          liquidityChange: -0.9,
          apyChange: -0.95,
          riskScoreChange: 0.8
        }
      }
    ];

    return scenarios;
  }

  private async calculateRiskFactors(
    opportunity: Opportunity,
    marketData: MarketData[]
  ): Promise<RiskFactors> {
    const volatility = await this.calculateVolatility(marketData);
    const liquidityAnalysis = await this.analyzeLiquidity(opportunity);

    return {
      marketVolatility: volatility.yearly,
      liquidityRisk: 1 - (liquidityAnalysis.depth['1m'] / (opportunity.tvlUsd || 1)),
      smartContractRisk: this.assessSmartContractRisk(opportunity),
      impermanentLossRisk: this.assessImpermanentLossRisk(opportunity),
      yieldSustainabilityRisk: 1 - this.calculateYieldSustainability({
        baseYield: opportunity.apy * 0.6,
        rewardTokenYield: opportunity.apy * 0.3,
        tradingFees: opportunity.apy * 0.1,
        opportunity
      }),
      concentrationRisk: liquidityAnalysis.concentration,
      counterpartyRisk: this.assessCounterpartyRisk(opportunity)
    };
  }

  private assessSmartContractRisk(opportunity: Opportunity): number {
    // Simplified smart contract risk assessment
    let risk = 0.3; // Base risk

    // Adjust based on TVL (larger protocols might be more battle-tested)
    if (opportunity.tvlUsd > 100000000) risk -= 0.1;
    if (opportunity.tvlUsd > 1000000000) risk -= 0.1;

    // Adjust based on age (older protocols are generally safer)
    // This would need actual protocol age data
    risk += 0.1;

    return Math.max(0, Math.min(1, risk));
  }

  private assessImpermanentLossRisk(opportunity: Opportunity): number {
    // Simplified impermanent loss risk
    // Higher for volatile assets and certain pool types
    let risk = 0.2;

    // Assume higher risk for pools with very high APY (often indicates volatility)
    if (opportunity.apy > 50) risk += 0.2;
    if (opportunity.apy > 100) risk += 0.2;

    return Math.min(1, risk);
  }

  private assessCounterpartyRisk(opportunity: Opportunity): number {
    // Simplified counterparty risk assessment
    // Would need protocol-specific data in production
    let risk = 0.2;

    // Adjust based on TVL (larger protocols might be more reliable)
    if (opportunity.tvlUsd > 50000000) risk -= 0.1;
    if (opportunity.tvlUsd > 500000000) risk -= 0.1;

    return Math.max(0, Math.min(1, risk));
  }

  private detectMarketRegime(marketData: MarketData[]): {
    regime: 'bull' | 'bear' | 'sideways' | 'high_volatility' | 'low_volatility';
    confidence: number;
  } {
    if (marketData.length < 7) {
      return { regime: 'sideways', confidence: 0.5 };
    }

    const prices = marketData.map(d => d.price);
    const recentPrices = prices.slice(-7);
    const olderPrices = prices.slice(-14, -7);

    const recentTrend = this.calculateTrend(recentPrices);
    const volatility = this.calculateVolatilityFromPrices(recentPrices);

    let regime: typeof marketData extends any[] ? 'bull' | 'bear' | 'sideways' | 'high_volatility' | 'low_volatility' : any;
    let confidence = 0.7;

    if (volatility > 0.15) {
      regime = 'high_volatility';
      confidence = 0.8;
    } else if (volatility < 0.02) {
      regime = 'low_volatility';
      confidence = 0.8;
    } else if (recentTrend > 0.05) {
      regime = 'bull';
      confidence = 0.75;
    } else if (recentTrend < -0.05) {
      regime = 'bear';
      confidence = 0.75;
    } else {
      regime = 'sideways';
      confidence = 0.6;
    }

    return { regime, confidence };
  }

  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0;

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];

    return (lastPrice - firstPrice) / firstPrice;
  }

  private calculateVolatilityFromPrices(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  private generateRiskAssessment(params: {
    opportunity: Opportunity;
    volatility: VolatilityMetrics;
    yieldComponents: YieldComponents;
    liquidityAnalysis: LiquidityAnalysis;
    stressTests: StressTest[];
    riskFactors: RiskFactors;
    marketRegime: { regime: string; confidence: number };
  }): RiskAssessment {
    const {
      opportunity,
      volatility,
      yieldComponents,
      liquidityAnalysis,
      stressTests,
      riskFactors,
      marketRegime
    } = params;

    // Calculate weighted risk score
    const weights = {
      marketVolatility: 0.25,
      liquidityRisk: 0.2,
      smartContractRisk: 0.2,
      yieldSustainability: 0.15,
      concentrationRisk: 0.1,
      counterpartyRisk: 0.1
    };

    const weightedScore =
      riskFactors.marketVolatility * weights.marketVolatility +
      riskFactors.liquidityRisk * weights.liquidityRisk +
      riskFactors.smartContractRisk * weights.smartContractRisk +
      riskFactors.yieldSustainabilityRisk * weights.yieldSustainability +
      riskFactors.concentrationRisk * weights.concentrationRisk +
      riskFactors.counterpartyRisk * weights.counterpartyRisk;

    // Normalize to 0-100 scale
    const totalScore = weightedScore * 100;

    // Determine risk level
    let level: 'low' | 'medium' | 'high';
    if (totalScore <= 30) level = 'low';
    else if (totalScore <= 60) level = 'medium';
    else level = 'high';

    const drivers: string[] = [];
    if (riskFactors.marketVolatility > 0.3) drivers.push('High Market Volatility');
    if (riskFactors.liquidityRisk > 0.5) drivers.push('Liquidity Concerns');
    if (riskFactors.yieldSustainabilityRisk > 0.5) drivers.push('Unsustainable Yield');
    if (riskFactors.smartContractRisk > 0.4) drivers.push('Smart Contract Risk');

    return {
      level,
      score: Math.round(totalScore),
      factors: drivers,
      timestamp: Date.now(),
      confidence: marketRegime.confidence
    };
  }

  private async generateRecommendations(params: {
    opportunity: Opportunity;
    riskAssessment: RiskAssessment;
    marketConditions: { regime: string; confidence: number };
    stressTests: StressTest[];
    riskFactors: RiskFactors;
  }): Promise<string[]> {
    const { opportunity, riskAssessment, marketConditions, stressTests, riskFactors } = params;
    const recommendations: string[] = [];

    // Market regime recommendations
    if (marketConditions.regime === 'high_volatility') {
      recommendations.push('Consider reducing position size during high volatility periods');
      recommendations.push('Monitor positions more frequently in volatile markets');
    }

    if (marketConditions.regime === 'bear') {
      recommendations.push('Be cautious with new investments during bear market conditions');
      recommendations.push('Focus on stable, low-risk opportunities');
    }

    // Risk-based recommendations
    if (riskFactors.liquidityRisk > 0.5) {
      recommendations.push('High liquidity risk detected - consider smaller position sizes');
    }

    if (riskFactors.yieldSustainabilityRisk > 0.5) {
      recommendations.push('Yield sustainability concerns - monitor reward token emissions');
      recommendations.push('Consider opportunities with more sustainable yield sources');
    }

    if (riskFactors.smartContractRisk > 0.4) {
      recommendations.push('Smart contract risk above average - consider insurance options');
    }

    // Opportunity-specific recommendations
    if (opportunity.apy > 100) {
      recommendations.push('Very high APY may indicate higher risk - verify sustainability');
    }

    // Stress test recommendations
    const severeStressTest = stressTests.find(st => st.severity === 'extreme');
    if (severeStressTest && severeStressTest.impact.valueChange < -0.3) {
      recommendations.push('Stress testing shows significant downside risk - consider position limits');
    }

    // General recommendations
    if (riskAssessment.level === 'high') {
      recommendations.push('High risk opportunity - ensure proper risk management');
      recommendations.push('Consider diversifying across multiple opportunities');
    }

    return recommendations;
  }

  private startPeriodicUpdates(): void {
    // Update market data periodically
    this.updateInterval = setInterval(() => {
      // In production, this would fetch fresh market data
      console.log('Updating financial risk data...');
    }, 300000); // Every 5 minutes
  }

  getMarketRegimeSummary(): {
    currentRegime: string;
    regimeHistory: Array<{ regime: string; timestamp: number; confidence: number }>;
    upcomingChanges: string[];
  } {
    // Mock implementation
    return {
      currentRegime: 'moderate_volatility',
      regimeHistory: [
        { regime: 'bull', timestamp: Date.now() - 86400000, confidence: 0.8 },
        { regime: 'sideways', timestamp: Date.now() - 172800000, confidence: 0.6 }
      ],
      upcomingChanges: [
        'Potential regime shift in next 24-48 hours',
        'Monitor volatility indicators closely'
      ]
    };
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}