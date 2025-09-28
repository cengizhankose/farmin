export interface ApiConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  rateLimit: number;
  headers?: Record<string, string>;
}

export interface HistoricalDataConfig {
  bitquery: ApiConfig;
  dappradar: ApiConfig;
}

export const DEFAULT_CONFIG: HistoricalDataConfig = {
  bitquery: {
    name: 'Bitquery',
    baseUrl: 'https://streaming.bitquery.io/graphql',
    timeout: 10000,
    rateLimit: 60,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': '', // Will be set from environment
    },
  },
  dappradar: {
    name: 'DAppRadar',
    baseUrl: 'https://api.dappradar.com',
    timeout: 10000,
    rateLimit: 30,
    headers: {
      'X-BLOBR-KEY': '', // Will be set from environment
    },
  },
};

export class ApiConfigService {
  private config: HistoricalDataConfig;

  constructor(config?: Partial<HistoricalDataConfig>) {
    this.config = {
      bitquery: { ...DEFAULT_CONFIG.bitquery, ...config?.bitquery },
      dappradar: { ...DEFAULT_CONFIG.dappradar, ...config?.dappradar },
    };

    // Load API keys from environment
    try {
      // Try to access environment variables in different contexts
      const env = (typeof window !== 'undefined' && (window as any).env) ||
                 (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) ||
                 (globalThis as any).env || {};

      if (env.BITQUERY_API_KEY) {
        this.config.bitquery.apiKey = env.BITQUERY_API_KEY;
        this.config.bitquery.headers = {
          ...this.config.bitquery.headers,
          'X-API-KEY': env.BITQUERY_API_KEY,
        };
      }

      if (env.DAPPRADAR_API_KEY) {
        this.config.dappradar.apiKey = env.DAPPRADAR_API_KEY;
        this.config.dappradar.headers = {
          ...this.config.dappradar.headers,
          'X-BLOBR-KEY': env.DAPPRADAR_API_KEY,
        };
      }
    } catch (error) {
      console.warn('Failed to load environment variables:', error);
    }
  }

  getConfig(): HistoricalDataConfig {
    return this.config;
  }

  getBitqueryConfig(): ApiConfig {
    return this.config.bitquery;
  }

  getDappradarConfig(): ApiConfig {
    return this.config.dappradar;
  }

  isConfigured(): boolean {
    return Boolean(this.config.bitquery.apiKey && this.config.dappradar.apiKey);
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.bitquery.apiKey) {
      errors.push('BITQUERY_API_KEY is required');
    }

    if (!this.config.dappradar.apiKey) {
      errors.push('DAPPRADAR_API_KEY is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Global instance
export const apiConfigService = new ApiConfigService();