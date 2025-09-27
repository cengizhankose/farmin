import { RiskAssessment, RiskAlert, RiskMetrics, RiskThreshold } from '@shared/core';

export interface SystemRiskData {
  apiHealth: {
    [service: string]: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      uptime: number;
      lastCheck: number;
    };
  };
  dataQuality: {
    [source: string]: {
      accuracy: number;
    freshness: number;
    completeness: number;
    timestamp: number;
  };
  };
  performance: {
    responseTime: number;
    errorRate: number;
    throughput: number;
    timestamp: number;
  };
}

export interface RiskMonitoringConfig {
  thresholds: RiskThreshold[];
  alertChannels: {
    email?: string;
    webhook?: string;
    inApp: boolean;
  };
  checkInterval: number; // milliseconds
}

export class RiskMonitoringService {
  private config: RiskMonitoringConfig;
  private alerts: RiskAlert[] = [];
  private metrics: Map<string, number> = new Map();
  private thresholds: Map<string, RiskThreshold> = new Map();

  constructor(config: RiskMonitoringConfig) {
    this.config = config;
    this.initializeThresholds();
    this.startMonitoring();
  }

  private initializeThresholds(): void {
    this.config.thresholds.forEach(threshold => {
      this.thresholds.set(threshold.metric, threshold);
    });
  }

  async collectSystemRiskData(): Promise<SystemRiskData> {
    // Collect API health metrics
    const apiHealth = await this.checkApiHealth();

    // Collect data quality metrics
    const dataQuality = await this.assessDataQuality();

    // Collect performance metrics
    const performance = await this.collectPerformanceMetrics();

    return { apiHealth, dataQuality, performance };
  }

  private async checkApiHealth() {
    // Implementation for checking API health
    return {
      'defillama': {
        status: 'healthy' as const,
        responseTime: 150,
        uptime: 0.999,
        lastCheck: Date.now()
      }
    };
  }

  private async assessDataQuality() {
    // Implementation for assessing data quality
    return {
      'defillama': {
        accuracy: 0.98,
        freshness: 0.95,
        completeness: 0.99,
        timestamp: Date.now()
      }
    };
  }

  private async collectPerformanceMetrics() {
    // Implementation for collecting performance metrics
    return {
      responseTime: 120,
      errorRate: 0.01,
      throughput: 1000,
      timestamp: Date.now()
    };
  }

  async evaluateRisk(data: SystemRiskData): Promise<RiskMetrics> {
    const risks = {
      technical: this.assessTechnicalRisks(data),
      operational: this.assessOperationalRisks(data),
      financial: this.assessFinancialRisks(data),
      security: this.assessSecurityRisks(data)
    };

    const overallScore = this.calculateOverallRisk(risks);

    return {
      overallScore,
      category: this.categorizeRisk(overallScore),
      factors: this.identifyRiskFactors(risks),
      timestamp: Date.now(),
      confidence: this.calculateConfidence(risks)
    };
  }

  private assessTechnicalRisks(data: SystemRiskData) {
    let score = 0;

    // API availability risk
    const apiDownCount = Object.values(data.apiHealth).filter(
      service => service.status === 'down'
    ).length;
    score += apiDownCount * 25;

    // Data quality risk
    const avgDataQuality = Object.values(data.dataQuality).reduce(
      (sum, quality) => sum + (quality.accuracy + quality.freshness + quality.completeness) / 3, 0
    ) / Object.values(data.dataQuality).length;

    if (avgDataQuality < 0.9) score += 20;
    if (avgDataQuality < 0.8) score += 15;

    return Math.min(score, 100);
  }

  private assessOperationalRisks(data: SystemRiskData) {
    let score = 0;

    // Performance risk
    if (data.performance.responseTime > 1000) score += 15;
    if (data.performance.errorRate > 0.05) score += 20;

    // Resource utilization risk
    if (data.performance.throughput > 800) score += 10;

    return Math.min(score, 100);
  }

  private assessFinancialRisks(data: SystemRiskData) {
    let score = 0;

    // Data freshness impact on financial accuracy
    const freshnessScore = Object.values(data.dataQuality).reduce(
      (sum, quality) => sum + quality.freshness, 0
    ) / Object.values(data.dataQuality).length;

    if (freshnessScore < 0.95) score += 10;
    if (freshnessScore < 0.85) score += 15;

    return Math.min(score, 100);
  }

  private assessSecurityRisks(data: SystemRiskData) {
    let score = 0;

    // API security (rate limiting, authentication)
    const apiDegradedCount = Object.values(data.apiHealth).filter(
      service => service.status === 'degraded'
    ).length;
    score += apiDegradedCount * 10;

    return Math.min(score, 100);
  }

  private calculateOverallRisk(risks: any): number {
    const weights = {
      technical: 0.35,
      operational: 0.25,
      financial: 0.25,
      security: 0.15
    };

    return (
      risks.technical * weights.technical +
      risks.operational * weights.operational +
      risks.financial * weights.financial +
      risks.security * weights.security
    );
  }

  private categorizeRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score <= 25) return 'low';
    if (score <= 50) return 'medium';
    if (score <= 75) return 'high';
    return 'critical';
  }

  private identifyRiskFactors(risks: any): string[] {
    const factors: string[] = [];

    if (risks.technical > 50) factors.push('API Reliability Issues');
    if (risks.operational > 50) factors.push('Performance Degradation');
    if (risks.financial > 50) factors.push('Data Accuracy Concerns');
    if (risks.security > 50) factors.push('Security Vulnerabilities');

    return factors;
  }

  private calculateConfidence(risks: any): number {
    // Confidence decreases as risk increases
    const avgRisk = (risks.technical + risks.operational + risks.financial + risks.security) / 4;
    return Math.max(0.1, 1 - (avgRisk / 100));
  }

  private async checkThresholds(metricName: string, value: number): Promise<void> {
    const threshold = this.thresholds.get(metricName);
    if (!threshold || !threshold.enabled) return;

    if (value >= threshold.criticalLevel) {
      await this.createAlert('critical', metricName, value, threshold.criticalLevel);
    } else if (value >= threshold.warningLevel) {
      await this.createAlert('warning', metricName, value, threshold.warningLevel);
    }
  }

  private async createAlert(
    severity: 'info' | 'warning' | 'critical',
    metricName: string,
    currentValue: number,
    threshold: number
  ): Promise<void> {
    const alert: RiskAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'threshold_breach',
      severity,
      title: `${metricName} ${severity.toUpperCase()}`,
      message: `${metricName} is ${currentValue} (threshold: ${threshold})`,
      timestamp: Date.now(),
      protocolId: 'system',
      metricName,
      currentValue,
      threshold,
      acknowledged: false,
      actionRequired: severity === 'critical' ? 'immediate' : 'review'
    };

    this.alerts.push(alert);
    await this.notifyAlert(alert);
  }

  private async notifyAlert(alert: RiskAlert): Promise<void> {
    // Implement notification logic based on config
    if (this.config.alertChannels.inApp) {
      console.log('In-app alert:', alert);
    }

    if (this.config.alertChannels.webhook) {
      // Send webhook notification
    }

    if (this.config.alertChannels.email) {
      // Send email notification
    }
  }

  private startMonitoring(): void {
    setInterval(async () => {
      try {
        const data = await this.collectSystemRiskData();
        const metrics = await this.evaluateRisk(data);

        // Update metrics
        this.metrics.set('overall_risk', metrics.overallScore);
        this.metrics.set('technical_risk', metrics.category === 'critical' ? 80 : 60);
        this.metrics.set('operational_risk', 40);

        // Check thresholds
        for (const [metricName, value] of this.metrics) {
          await this.checkThresholds(metricName, value);
        }
      } catch (error) {
        console.error('Risk monitoring error:', error);
      }
    }, this.config.checkInterval);
  }

  getActiveAlerts(): RiskAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  async generateRiskReport(): Promise<{
    timestamp: number;
    overallRiskScore: number;
    riskCategory: string;
    activeAlerts: number;
    criticalAlerts: number;
    systemHealth: {
      api: number;
      data: number;
      performance: number;
    };
    recommendations: string[];
  }> {
    const data = await this.collectSystemRiskData();
    const metrics = await this.evaluateRisk(data);

    const criticalAlerts = this.getActiveAlerts().filter(a => a.severity === 'critical').length;

    return {
      timestamp: Date.now(),
      overallRiskScore: metrics.overallScore,
      riskCategory: metrics.category,
      activeAlerts: this.getActiveAlerts().length,
      criticalAlerts,
      systemHealth: {
        api: Object.values(data.apiHealth).filter(s => s.status === 'healthy').length / Object.values(data.apiHealth).length * 100,
        data: Object.values(data.dataQuality).reduce((sum, q) => sum + (q.accuracy + q.freshness + q.completeness) / 3, 0) / Object.values(data.dataQuality).length * 100,
        performance: Math.max(0, 100 - (data.performance.errorRate * 1000 + data.performance.responseTime / 10))
      },
      recommendations: this.generateRecommendations(metrics, this.getActiveAlerts())
    };
  }

  private generateRecommendations(metrics: RiskMetrics, alerts: RiskAlert[]): string[] {
    const recommendations: string[] = [];

    if (metrics.overallScore > 50) {
      recommendations.push('Implement additional data source redundancy');
    }

    if (alerts.some(a => a.metricName === 'response_time')) {
      recommendations.push('Optimize API response times and implement caching');
    }

    if (metrics.overallScore > 75) {
      recommendations.push('Enable failover mechanisms and consider load balancing');
    }

    return recommendations;
  }
}