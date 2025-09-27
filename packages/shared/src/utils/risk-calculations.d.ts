import { PortfolioRiskMetrics, MonteCarloResult, MarketRegime } from "../types/risk-advanced";
/**
 * Advanced Risk Calculations Library
 * Provides sophisticated financial risk metrics and analysis functions
 */
export declare class RiskCalculations {
    private static readonly DAYS_PER_YEAR;
    private static readonly RISK_FREE_RATE;
    private static readonly CONFIDENCE_LEVELS;
    /**
     * Calculate Sharpe Ratio
     * Measures excess return per unit of volatility
     */
    static calculateSharpeRatio(returns: number[], riskFreeRate?: number, periodsPerYear?: number): number;
    /**
     * Calculate Sortino Ratio
     * Similar to Sharpe but only considers downside volatility
     */
    static calculateSortinoRatio(returns: number[], riskFreeRate?: number, targetReturn?: number, periodsPerYear?: number): number;
    /**
     * Calculate Value at Risk (VaR)
     * Maximum expected loss over a time period at a confidence level
     */
    static calculateValueAtRisk(returns: number[], confidenceLevel?: number, timeHorizon?: number): number;
    /**
     * Calculate Expected Shortfall (CVaR)
     * Average loss beyond the VaR threshold
     */
    static calculateExpectedShortfall(returns: number[], confidenceLevel?: number): number;
    /**
     * Calculate Maximum Drawdown and period
     */
    static calculateMaxDrawdown(values: number[]): {
        maxDrawdown: number;
        maxDrawdownPeriod: number;
        drawdownStartIndex?: number;
        drawdownEndIndex?: number;
    };
    /**
     * Calculate Beta to market/benchmark
     */
    static calculateBeta(assetReturns: number[], marketReturns: number[]): number;
    /**
     * Calculate correlation coefficient
     */
    static calculateCorrelation(series1: number[], series2: number[]): number;
    /**
     * Calculate Calmar Ratio
     * Annualized return relative to maximum drawdown
     */
    static calculateCalmarRatio(annualizedReturn: number, maxDrawdown: number): number;
    /**
     * Calculate Omega Ratio
     * Probability weighted ratio of gains versus losses relative to a threshold
     */
    static calculateOmegaRatio(returns: number[], threshold?: number): number;
    /**
     * Calculate Information Ratio
     * Measures active return per unit of active risk
     */
    static calculateInformationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number;
    /**
     * Monte Carlo Simulation for risk assessment
     */
    static runMonteCarloSimulation(initialValue: number, expectedReturn: number, volatility: number, timeHorizon: number, simulations?: number): MonteCarloResult;
    /**
     * Calculate portfolio risk metrics
     */
    static calculatePortfolioRisk(positions: Array<{
        value: number;
        returns: number[];
        beta?: number;
        correlationToPortfolio?: number;
    }>): PortfolioRiskMetrics;
    private static calculateStandardDeviation;
    private static boxMullerTransform;
    private static cumulateReturns;
    private static calculateCorrelationMatrix;
    private static calculateDiversificationScore;
    private static calculateAverageCorrelation;
    private static calculatePortfolioLiquidityRisk;
    /**
     * Detect market regime based on volatility and trends
     */
    static detectMarketRegime(prices: number[], volatilityWindow?: number, trendWindow?: number): MarketRegime;
    private static getRegimeRiskImplications;
}
//# sourceMappingURL=risk-calculations.d.ts.map