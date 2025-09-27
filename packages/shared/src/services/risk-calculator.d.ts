/**
 * Basic risk calculator utilities
 */
export declare class RiskCalculator {
    /**
     * Calculate basic risk score from multiple factors
     */
    static calculateRiskScore(factors: {
        liquidity: number;
        stability: number;
        yield: number;
        concentration: number;
        momentum: number;
    }): number;
    /**
     * Get risk level from score
     */
    static getRiskLevel(score: number): 'low' | 'medium' | 'high';
    /**
     * Calculate volatility from historical data
     */
    static calculateVolatility(prices: number[]): number;
    /**
     * Calculate Sharpe ratio
     */
    static calculateSharpeRatio(returns: number[], riskFreeRate?: number): number;
    /**
     * Calculate maximum drawdown
     */
    static calculateMaxDrawdown(prices: number[]): number;
}
//# sourceMappingURL=risk-calculator.d.ts.map