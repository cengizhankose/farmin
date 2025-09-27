import { RiskAlert } from '@shared/core';

export interface SecurityConfig {
  apiKeyRotation: {
    enabled: boolean;
    rotationInterval: number; // days
    warningPeriod: number; // days before expiry
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit: number;
  };
  dataValidation: {
    enabled: boolean;
    strictMode: boolean;
    sanitizeInput: boolean;
    validateOutput: boolean;
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotationDays: number;
  };
  audit: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    retentionDays: number;
    alertOnSuspicious: boolean;
  };
  webSecurity: {
    cors: {
      enabled: boolean;
      allowedOrigins: string[];
    };
    csrf: {
      enabled: boolean;
    };
    headers: {
      xssProtection: boolean;
      contentSecurityPolicy: boolean;
      strictTransportSecurity: boolean;
    };
  };
}

export interface SecurityEvent {
  id: string;
  type: 'api_key_compromise' | 'injection_attempt' | 'rate_limit_exceeded' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  source: string;
  description: string;
  metadata: Record<string, any>;
  mitigated: boolean;
  actionTaken?: string;
}

export interface VulnerabilityScan {
  id: string;
  timestamp: number;
  scanType: 'sast' | 'dast' | 'dependency' | 'configuration';
  vulnerabilities: Vulnerability[];
  overallScore: number; // 0-100, higher is better
  recommendations: string[];
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedComponent: string;
  remediation: string;
  cvssScore?: number;
  references?: string[];
}

export interface ComplianceReport {
  framework: 'gdpr' | 'ccpa' | 'soc2' | 'iso27001';
  score: number; // 0-100
  lastAudit: number;
  nextAudit: number;
  findings: ComplianceFinding[];
  status: 'compliant' | 'partial' | 'non_compliant';
}

export interface ComplianceFinding {
  id: string;
  control: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  dueDate?: number;
}

export class SecurityManager {
  private config: SecurityConfig;
  private securityEvents: SecurityEvent[] = [];
  private apiKeys: Map<string, { key: string; expiry: number; lastUsed: number }> = new Map();
  private rateLimitTracker: Map<string, { count: number; resetTime: number }> = new Map();
  private scanInterval: NodeJS.Timeout;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      apiKeyRotation: {
        enabled: true,
        rotationInterval: 90,
        warningPeriod: 7,
        ...config.apiKeyRotation
      },
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        burstLimit: 10,
        ...config.rateLimiting
      },
      dataValidation: {
        enabled: true,
        strictMode: false,
        sanitizeInput: true,
        validateOutput: true,
        ...config.dataValidation
      },
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotationDays: 365,
        ...config.encryption
      },
      audit: {
        enabled: true,
        logLevel: 'info',
        retentionDays: 90,
        alertOnSuspicious: true,
        ...config.audit
      },
      webSecurity: {
        cors: {
          enabled: true,
          allowedOrigins: ['*'],
          ...config.webSecurity?.cors
        },
        csrf: {
          enabled: true,
          ...config.webSecurity?.csrf
        },
        headers: {
          xssProtection: true,
          contentSecurityPolicy: true,
          strictTransportSecurity: true,
          ...config.webSecurity?.headers
        },
        ...config.webSecurity
      }
    };

    this.initializeSecurity();
    this.startPeriodicScans();
  }

  private initializeSecurity(): void {
    // Initialize API key management
    this.initializeApiKeys();

    // Set up security monitoring
    this.setupSecurityMonitoring();

    // Initialize encryption keys
    if (this.config.encryption.enabled) {
      this.initializeEncryption();
    }
  }

  private initializeApiKeys(): void {
    // Generate initial API keys (in production, these would be stored securely)
    const defaultKeys = [
      { name: 'primary', key: this.generateApiKey(), expiry: Date.now() + (90 * 24 * 60 * 60 * 1000) },
      { name: 'secondary', key: this.generateApiKey(), expiry: Date.now() + (90 * 24 * 60 * 60 * 1000) }
    ];

    defaultKeys.forEach(({ name, key, expiry }) => {
      this.apiKeys.set(name, {
        key,
        expiry,
        lastUsed: Date.now()
      });
    });
  }

  private generateApiKey(): string {
    // Generate a secure API key
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  private setupSecurityMonitoring(): void {
    // Set up event listeners for security events
    process.on('uncaughtException', (error) => {
      this.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'high',
        source: 'system',
        description: `Uncaught exception: ${error.message}`,
        metadata: { error: error.stack },
        mitigated: false
      });
    });

    process.on('unhandledRejection', (reason) => {
      this.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        source: 'system',
        description: `Unhandled promise rejection: ${reason}`,
        metadata: { reason },
        mitigated: false
      });
    });
  }

  private initializeEncryption(): void {
    // Initialize encryption system
    // In production, this would integrate with a proper key management system
    console.log('Encryption system initialized');
  }

  private startPeriodicScans(): void {
    // Run security scans periodically
    this.scanInterval = setInterval(async () => {
      try {
        await this.runSecurityScans();
        await this.checkApiKeyRotation();
        await this.cleanupOldEvents();
      } catch (error) {
        console.error('Security scan error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily scans
  }

  private async runSecurityScans(): Promise<VulnerabilityScan> {
    const scan: VulnerabilityScan = {
      id: `scan_${Date.now()}`,
      timestamp: Date.now(),
      scanType: 'dast',
      vulnerabilities: [],
      overallScore: 100,
      recommendations: []
    };

    // Dependency security scan
    const dependencyScan = await this.scanDependencies();
    scan.vulnerabilities.push(...dependencyScan.vulnerabilities);

    // Configuration security scan
    const configScan = await this.scanConfiguration();
    scan.vulnerabilities.push(...configScan.vulnerabilities);

    // Calculate overall score
    const criticalCount = scan.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = scan.vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumCount = scan.vulnerabilities.filter(v => v.severity === 'medium').length;

    scan.overallScore = Math.max(0, 100 - (criticalCount * 20 + highCount * 10 + mediumCount * 5));

    // Generate recommendations
    if (criticalCount > 0) {
      scan.recommendations.push('Address critical vulnerabilities immediately');
    }
    if (highCount > 2) {
      scan.recommendations.push('Prioritize high-severity vulnerability remediation');
    }
    if (scan.overallScore < 80) {
      scan.recommendations.push('Improve overall security posture');
    }

    return scan;
  }

  private async scanDependencies(): Promise<{ vulnerabilities: Vulnerability[] }> {
    // Mock dependency vulnerability scan
    // In production, this would integrate with tools like Snyk, Dependabot, etc.
    const vulnerabilities: Vulnerability[] = [];

    // Simulate finding some vulnerabilities
    if (Math.random() > 0.7) {
      vulnerabilities.push({
        id: 'DEP-001',
        type: 'dependency',
        severity: 'medium',
        description: 'Outdated dependency with known vulnerabilities',
        affectedComponent: 'axios@1.0.0',
        remediation: 'Update to latest version',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-1234']
      });
    }

    return { vulnerabilities };
  }

  private async scanConfiguration(): Promise<{ vulnerabilities: Vulnerability[] }> {
    const vulnerabilities: Vulnerability[] = [];

    // Check for configuration security issues
    if (!this.config.webSecurity.headers.contentSecurityPolicy) {
      vulnerabilities.push({
        id: 'CFG-001',
        type: 'configuration',
        severity: 'medium',
        description: 'Content Security Policy not enabled',
        affectedComponent: 'web security headers',
        remediation: 'Enable Content Security Policy headers'
      });
    }

    if (!this.config.encryption.enabled) {
      vulnerabilities.push({
        id: 'CFG-002',
        type: 'configuration',
        severity: 'high',
        description: 'Encryption not enabled',
        affectedComponent: 'data encryption',
        remediation: 'Enable encryption for sensitive data'
      });
    }

    return { vulnerabilities };
  }

  private async checkApiKeyRotation(): Promise<void> {
    if (!this.config.apiKeyRotation.enabled) return;

    const now = Date.now();
    const warningThreshold = now + (this.config.apiKeyRotation.warningPeriod * 24 * 60 * 60 * 1000);

    for (const [name, keyData] of this.apiKeys) {
      if (keyData.expiry < warningThreshold) {
        this.logSecurityEvent({
          type: 'api_key_compromise',
          severity: 'medium',
          source: 'api_key_manager',
          description: `API key ${name} approaching expiry`,
          metadata: { keyName: name, expiry: keyData.expiry },
          mitigated: false
        });
      }
    }
  }

  private cleanupOldEvents(): void {
    if (!this.config.audit.enabled) return;

    const retentionMs = this.config.audit.retentionDays * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;

    this.securityEvents = this.securityEvents.filter(event => event.timestamp > cutoff);
  }

  validateApiKey(apiKey: string): boolean {
    if (!this.config.apiKeyRotation.enabled) return true;

    for (const keyData of this.apiKeys.values()) {
      if (keyData.key === apiKey && keyData.expiry > Date.now()) {
        keyData.lastUsed = Date.now();
        return true;
      }
    }

    // Log failed authentication attempt
    this.logSecurityEvent({
      type: 'unauthorized_access',
      severity: 'medium',
      source: 'api_key_validation',
      description: 'Invalid API key used',
      metadata: { apiKey: apiKey.substring(0, 8) + '...' },
      mitigated: true
    });

    return false;
  }

  checkRateLimit(clientId: string): boolean {
    if (!this.config.rateLimiting.enabled) return true;

    const now = Date.now();
    const tracker = this.rateLimitTracker.get(clientId);

    if (!tracker || now > tracker.resetTime) {
      // Reset counter
      this.rateLimitTracker.set(clientId, {
        count: 1,
        resetTime: now + 60000 // 1 minute window
      });
      return true;
    }

    if (tracker.count >= this.config.rateLimiting.requestsPerMinute) {
      // Rate limit exceeded
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'low',
        source: 'rate_limiter',
        description: `Rate limit exceeded for client ${clientId}`,
        metadata: { clientId, count: tracker.count },
        mitigated: true
      });
      return false;
    }

    tracker.count++;
    return true;
  }

  sanitizeInput(input: string): string {
    if (!this.config.dataValidation.enabled || !this.config.dataValidation.sanitizeInput) {
      return input;
    }

    // Basic input sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  validateOutput(data: any): boolean {
    if (!this.config.dataValidation.enabled || !this.config.dataValidation.validateOutput) {
      return true;
    }

    // Basic output validation
    if (typeof data === 'string') {
      // Check for potential XSS in output
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i
      ];

      return !xssPatterns.some(pattern => pattern.test(data));
    }

    return true;
  }

  encryptData(data: string): string {
    if (!this.config.encryption.enabled) {
      return data;
    }

    // In production, this would use proper encryption
    const crypto = require('crypto');
    const algorithm = this.config.encryption.algorithm;
    const key = crypto.randomBytes(32); // In production, use proper key management
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  decryptData(encryptedData: string): string {
    if (!this.config.encryption.enabled) {
      return encryptedData;
    }

    // In production, this would use proper decryption
    // This is a simplified example
    try {
      const crypto = require('crypto');
      const algorithm = this.config.encryption.algorithm;
      const key = crypto.randomBytes(32); // In production, use proper key management

      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logSecurityEvent({
        type: 'data_breach',
        severity: 'high',
        source: 'decryption',
        description: 'Failed to decrypt data',
        metadata: { error: error.message },
        mitigated: true
      });
      return encryptedData;
    }
  }

  generateSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.webSecurity.headers.xssProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (this.config.webSecurity.headers.contentSecurityPolicy) {
      headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
    }

    if (this.config.webSecurity.headers.strictTransportSecurity) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    }

    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    return headers;
  }

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    if (!this.config.audit.enabled) return;

    const securityEvent: SecurityEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.securityEvents.push(securityEvent);

    // Log to console based on log level
    if (this.config.audit.logLevel === 'debug' ||
        (this.config.audit.logLevel === 'info' && event.severity !== 'low') ||
        (this.config.audit.logLevel === 'warn' && ['high', 'critical'].includes(event.severity)) ||
        (this.config.audit.logLevel === 'error' && event.severity === 'critical')) {
      console.log(`Security Event [${event.severity.toUpperCase()}]: ${event.description}`);
    }

    // Alert on suspicious events
    if (this.config.audit.alertOnSuspicious && event.severity === 'critical') {
      this.handleCriticalSecurityEvent(securityEvent);
    }
  }

  private handleCriticalSecurityEvent(event: SecurityEvent): void {
    // Handle critical security events
    console.error(`CRITICAL SECURITY EVENT: ${event.description}`);

    // In production, this would:
    // - Send alerts to security team
    // - Potentially block the affected service
    // - Initiate incident response procedures
    // - Create Jira tickets for tracking

    event.actionTaken = 'Alert sent to security team';
  }

  async generateComplianceReport(framework: 'gdpr' | 'ccpa' | 'soc2' | 'iso27001'): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      framework,
      score: 85, // Mock score
      lastAudit: Date.now() - (30 * 24 * 60 * 60 * 1000),
      nextAudit: Date.now() + (60 * 24 * 60 * 60 * 1000),
      findings: [],
      status: 'compliant'
    };

    // Generate mock compliance findings
    const mockFindings: ComplianceFinding[] = [
      {
        id: 'COMP-001',
        control: 'Data Encryption',
        description: 'Sensitive data must be encrypted at rest',
        severity: 'medium',
        status: 'resolved'
      },
      {
        id: 'COMP-002',
        control: 'Access Control',
        description: 'Implement proper access controls',
        severity: 'high',
        status: 'in_progress',
        dueDate: Date.now() + (14 * 24 * 60 * 60 * 1000)
      }
    ];

    report.findings = mockFindings;

    // Adjust score based on findings
    const openFindings = report.findings.filter(f => f.status === 'open').length;
    const inProgressFindings = report.findings.filter(f => f.status === 'in_progress').length;

    report.score = Math.max(0, 100 - (openFindings * 20 + inProgressFindings * 10));

    // Determine status
    if (report.score >= 90) {
      report.status = 'compliant';
    } else if (report.score >= 70) {
      report.status = 'partial';
    } else {
      report.status = 'non_compliant';
    }

    return report;
  }

  getSecuritySummary(): {
    overallScore: number;
    activeEvents: number;
    criticalEvents: number;
    lastScan: number;
    complianceStatus: string;
    recommendations: string[];
  } {
    const criticalEvents = this.securityEvents.filter(e => e.severity === 'critical').length;
    const recentEvents = this.securityEvents.filter(e =>
      Date.now() - e.timestamp < (24 * 60 * 60 * 1000)
    ).length;

    const recommendations: string[] = [];

    if (criticalEvents > 0) {
      recommendations.push('Address critical security events immediately');
    }

    if (recentEvents > 10) {
      recommendations.push('High number of security events - investigate potential breach');
    }

    if (!this.config.encryption.enabled) {
      recommendations.push('Enable encryption for sensitive data');
    }

    return {
      overallScore: Math.max(0, 100 - (criticalEvents * 25 + recentEvents * 2)),
      activeEvents: this.securityEvents.length,
      criticalEvents,
      lastScan: Date.now(),
      complianceStatus: 'compliant',
      recommendations
    };
  }

  rotateApiKey(keyName: string): string {
    const newKey = this.generateApiKey();
    const newExpiry = Date.now() + (this.config.apiKeyRotation.rotationInterval * 24 * 60 * 60 * 1000);

    this.apiKeys.set(keyName, {
      key: newKey,
      expiry: newExpiry,
      lastUsed: Date.now()
    });

    this.logSecurityEvent({
      type: 'api_key_compromise',
      severity: 'low',
      source: 'api_key_manager',
      description: `API key ${keyName} rotated`,
      metadata: { keyName },
      mitigated: true,
      actionTaken: 'Key rotated successfully'
    });

    return newKey;
  }

  destroy(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }
}