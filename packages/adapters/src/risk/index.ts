// Comprehensive Risk Management System
// This module provides unified risk analysis and mitigation capabilities

export * from './monitoring';
export * from './api-reliability';
export * from './financial-analysis';
export * from './security-mitigation';

import { RiskMonitoringService, SystemRiskData, RiskMonitoringConfig } from './monitoring';
import { APIReliabilityManager, DataAdapter, DataAggregationStrategy } from './api-reliability';
import { FinancialRiskAnalyzer } from './financial-analysis';
import { SecurityManager, SecurityConfig } from './security-mitigation';

export interface RiskManagementConfig {
  monitoring?: Partial<RiskMonitoringConfig>;
  apiReliability?: {
    fallback?: any;
    aggregation?: Partial<DataAggregationStrategy>;
  };
  security?: Partial<SecurityConfig>;
}

export class RiskManager {
  private monitoring: RiskMonitoringService;
  private apiReliability: APIReliabilityManager;
  private financialAnalyzer: FinancialRiskAnalyzer;
  private security: SecurityManager;
  private initialized = false;

  constructor(private config: RiskManagementConfig = {}) {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize monitoring service
    this.monitoring = new RiskMonitoringService({
      thresholds: [
        {
          metric: 'overall_risk',
          warningLevel: 50,
          criticalLevel: 75,
          lookbackPeriod: 7,
          enabled: true,
          notificationChannels: ['in_app']
        },
        {
          metric: 'response_time',
          warningLevel: 1000,
          criticalLevel: 3000,
          lookbackPeriod: 1,
          enabled: true,
          notificationChannels: ['in_app']
        },
        {
          metric: 'error_rate',
          warningLevel: 0.05,
          criticalLevel: 0.1,
          lookbackPeriod: 1,
          enabled: true,
          notificationChannels: ['in_app']
        }
      ],
      alertChannels: {
        inApp: true
      },
      checkInterval: 30000,
      ...this.config.monitoring
    });

    // Initialize security manager
    this.security = new SecurityManager(this.config.security);

    // Initialize financial analyzer
    this.financialAnalyzer = new FinancialRiskAnalyzer();

    this.initialized = true;
  }

  initializeAPIReliability(adapters: any[]): void {
    if (!this.initialized) {
      throw new Error('RiskManager not initialized');
    }

    this.apiReliability = new APIReliabilityManager(
      adapters,
      this.config.apiReliability
    );
  }

  // System Health and Monitoring
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    components: {
      api: 'healthy' | 'degraded' | 'down';
      data: 'healthy' | 'degraded' | 'down';
      security: 'healthy' | 'degraded' | 'down';
      performance: 'healthy' | 'degraded' | 'down';
    };
    metrics: {
      uptime: number;
      responseTime: number;
      errorRate: number;
      riskScore: number;
    };
    alerts: any[];
  }> {
    const systemData = await this.monitoring.collectSystemRiskData();
    const riskMetrics = await this.monitoring.evaluateRisk(systemData);
    const alerts = this.monitoring.getActiveAlerts();
    const apiHealth = this.apiReliability?.getSystemReliability();
    const securitySummary = this.security.getSecuritySummary();

    const determineHealth = (score: number) => {
      if (score >= 80) return 'healthy';
      if (score >= 60) return 'degraded';
      return 'critical';
    };

    return {
      overall: determineHealth(riskMetrics.overallScore),
      components: {
        api: apiHealth?.overallHealth || 'healthy',
        data: determineHealth(systemData.dataQuality.defillama?.accuracy || 100),
        security: securitySummary.overallScore >= 80 ? 'healthy' : 'degraded',
        performance: determineHealth(100 - systemData.performance.errorRate * 1000)
      },
      metrics: {
        uptime: apiHealth?.uptime || 0.99,
        responseTime: systemData.performance.responseTime,
        errorRate: systemData.performance.errorRate,
        riskScore: riskMetrics.overallScore
      },
      alerts
    };
  }

  // Risk Assessment and Analysis
  async assessOpportunityRisk(opportunity: any): Promise<any> {
    return this.financialAnalyzer.analyzeOpportunityRisk(opportunity);
  }

  async generateRiskReport(): Promise<any> {
    return this.monitoring.generateRiskReport();
  }

  // API Reliability Methods
  async listOpportunities(): Promise<any[]> {
    if (!this.apiReliability) {
      throw new Error('API reliability not initialized. Call initializeAPIReliability() first.');
    }
    return this.apiReliability.listOpportunities();
  }

  async getOpportunity(id: string): Promise<any> {
    if (!this.apiReliability) {
      throw new Error('API reliability not initialized. Call initializeAPIReliability() first.');
    }
    return this.apiReliability.getOpportunity(id);
  }

  // Security Methods
  validateApiKey(apiKey: string): boolean {
    return this.security.validateApiKey(apiKey);
  }

  checkRateLimit(clientId: string): boolean {
    return this.security.checkRateLimit(clientId);
  }

  sanitizeInput(input: string): string {
    return this.security.sanitizeInput(input);
  }

  generateSecurityHeaders(): Record<string, string> {
    return this.security.generateSecurityHeaders();
  }

  // Market Analysis
  getMarketRegimeSummary(): any {
    return this.financialAnalyzer.getMarketRegimeSummary();
  }

  // Compliance and Reporting
  async generateComplianceReport(framework: 'gdpr' | 'ccpa' | 'soc2' | 'iso27001'): Promise<any> {
    return this.security.generateComplianceReport(framework);
  }

  // Alert Management
  getActiveAlerts(): any[] {
    return this.monitoring.getActiveAlerts();
  }

  acknowledgeAlert(alertId: string): void {
    this.monitoring.acknowledgeAlert(alertId);
  }

  // System Management
  getAdapterHealth(): Record<string, any> {
    return this.apiReliability?.getAdapterHealth() || {};
  }

  getSecuritySummary(): any {
    return this.security.getSecuritySummary();
  }

  // Emergency Actions
  emergencyShutdown(): void {
    console.log('EMERGENCY SHUTDOWN INITIATED');

    // Disable all adapters
    if (this.apiReliability) {
      const health = this.apiReliability.getAdapterHealth();
      Object.keys(health).forEach(adapterName => {
        this.apiReliability?.disableAdapter(adapterName);
      });
    }

    // Log security event
    this.security.logSecurityEvent({
      type: 'unauthorized_access',
      severity: 'critical',
      source: 'emergency_shutdown',
      description: 'Emergency shutdown initiated',
      metadata: { timestamp: Date.now() },
      mitigated: true,
      actionTaken: 'All adapters disabled, system shutdown'
    });
  }

  enableSystem(): void {
    console.log('System re-enabled');

    // Re-enable all adapters
    if (this.apiReliability) {
      const health = this.apiReliability.getAdapterHealth();
      Object.keys(health).forEach(adapterName => {
        this.apiReliability?.enableAdapter(adapterName);
      });
    }

    this.security.logSecurityEvent({
      type: 'unauthorized_access',
      severity: 'low',
      source: 'system_enable',
      description: 'System re-enabled after emergency shutdown',
      metadata: { timestamp: Date.now() },
      mitigated: true,
      actionTaken: 'All adapters re-enabled'
    });
  }

  // Configuration Updates
  updateMonitoringConfig(config: Partial<RiskMonitoringConfig>): void {
    // In a real implementation, this would update the monitoring service config
    console.log('Monitoring config updated:', config);
  }

  updateSecurityConfig(config: Partial<SecurityConfig>): void {
    // In a real implementation, this would update the security config
    console.log('Security config updated:', config);
  }

  rotateAllApiKeys(): Record<string, string> {
    const newKeys: Record<string, string> = {};
    const health = this.apiReliability?.getAdapterHealth() || {};

    Object.keys(health).forEach(adapterName => {
      newKeys[adapterName] = this.security.rotateApiKey(adapterName);
    });

    return newKeys;
  }

  // Status and Diagnostics
  getStatus(): {
    initialized: boolean;
    components: {
      monitoring: boolean;
      apiReliability: boolean;
      financialAnalyzer: boolean;
      security: boolean;
    };
    uptime: number;
    lastHealthCheck: number;
  } {
    return {
      initialized: this.initialized,
      components: {
        monitoring: !!this.monitoring,
        apiReliability: !!this.apiReliability,
        financialAnalyzer: !!this.financialAnalyzer,
        security: !!this.security
      },
      uptime: process.uptime(),
      lastHealthCheck: Date.now()
    };
  }

  // Cleanup
  destroy(): void {
    this.monitoring?.destroy();
    this.apiReliability?.destroy();
    this.financialAnalyzer?.destroy();
    this.security?.destroy();
    this.initialized = false;
  }
}

// Factory functions for easy initialization
export function createRiskManager(config?: RiskManagementConfig): RiskManager {
  return new RiskManager(config);
}

export function createStandaloneRiskAnalyzer(): FinancialRiskAnalyzer {
  return new FinancialRiskAnalyzer();
}

export function createStandaloneSecurityManager(config?: Partial<SecurityConfig>): SecurityManager {
  return new SecurityManager(config);
}

// Utility functions
export function calculateRiskScore(factors: {
  technical: number;
  financial: number;
  operational: number;
  security: number;
}): number {
  const weights = {
    technical: 0.35,
    financial: 0.25,
    operational: 0.25,
    security: 0.15
  };

  return (
    factors.technical * weights.technical +
    factors.financial * weights.financial +
    factors.operational * weights.operational +
    factors.security * weights.security
  );
}

export function categorizeRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

export function generateRiskRecommendations(riskAssessment: any): string[] {
  const recommendations: string[] = [];

  if (riskAssessment.overallScore > 75) {
    recommendations.push('Immediate action required - critical risk level detected');
    recommendations.push('Consider emergency shutdown procedures');
  }

  if (riskAssessment.overallScore > 50) {
    recommendations.push('High risk level - implement mitigation strategies immediately');
    recommendations.push('Increase monitoring frequency');
  }

  if (riskAssessment.components?.api === 'degraded') {
    recommendations.push('API performance degraded - investigate and optimize');
  }

  if (riskAssessment.components?.security === 'degraded') {
    recommendations.push('Security concerns detected - review access controls');
  }

  return recommendations;
}