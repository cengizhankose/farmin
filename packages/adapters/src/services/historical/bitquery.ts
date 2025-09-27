import { apiConfigService, ApiConfig } from './config';
import { cacheService, CacheKeys } from '../../cache';

export interface VolumeData {
  protocol: string;
  pool: string;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  concentrationRisk: number; // 0-100, percentage of top holders
  timestamp: number;
}

export interface BitqueryResponse {
  data?: {
    ethereum: {
      dexTrades: Array<{
        transaction: {
          hash: string;
        };
        buyAmount: number;
        sellAmount: number;
        date: {
          date: string;
        };
        exchange: {
          name: string;
        };
        baseCurrency: {
          symbol: string;
        };
        quoteCurrency: {
          symbol: string;
        };
      }>;
    };
  };
  errors?: Array<{
    message: string;
    locations: Array<{
      line: number;
      column: number;
    }>;
  }>;
}

export class BitqueryService {
  private config: ApiConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor() {
    this.config = apiConfigService.getBitqueryConfig();
  }

  async getProtocolVolumeData(protocol: string, days: number = 30): Promise<VolumeData> {
    const cacheKey = CacheKeys.protocolVolume(protocol, `${protocol}-pool`);

    // Try to get from cache first
    const cached = await cacheService.get<VolumeData>(cacheKey);
    if (cached) {
      console.log(`🎯 Cache hit for volume data: ${protocol}`);
      return cached;
    }

    // Fetch fresh data
    const result = await this.withRateLimit(async () => {
      const query = this.getVolumeQuery(protocol, days);
      return this.executeQuery(query);
    });

    const freshData: VolumeData = {
      protocol,
      pool: `${protocol}-pool`,
      volume24h: this.calculate24hVolume(result),
      volume7d: this.calculate7dVolume(result),
      volume30d: this.calculate30dVolume(result),
      concentrationRisk: await this.estimateConcentrationRisk(protocol),
      timestamp: Date.now(),
    };

    // Cache the result (4 hour TTL for volume data)
    await cacheService.set(cacheKey, freshData, 4 * 60 * 60 * 1000);

    // Also store in dedicated volume cache table
    await cacheService.setVolumeData(protocol, `${protocol}-pool`, freshData);

    console.log(`🚀 Fetched and cached fresh volume data: ${protocol}`);
    return freshData;
  }

  async getAlgorandDefiVolume(): Promise<{
    totalVolume24h: number;
    totalVolume7d: number;
    protocols: Record<string, VolumeData>;
  }> {
    const protocols = ['folks-finance', 'tinyman', 'pact'];
    const results: Record<string, VolumeData> = {};

    for (const protocol of protocols) {
      try {
        results[protocol] = await this.getProtocolVolumeData(protocol, 7);
      } catch (error) {
        console.warn(`Failed to fetch volume data for ${protocol}:`, error);
      }
    }

    const totalVolume24h = Object.values(results).reduce((sum, data) => sum + data.volume24h, 0);
    const totalVolume7d = Object.values(results).reduce((sum, data) => sum + data.volume7d, 0);

    return {
      totalVolume24h,
      totalVolume7d,
      protocols: results,
    };
  }

  private async executeQuery(query: string): Promise<BitqueryResponse> {
    if (!this.config.apiKey) {
      throw new Error('Bitquery API key not configured');
    }

    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: this.config.headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Bitquery API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getVolumeQuery(protocol: string, days: number): string {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return `
      query {
        ethereum(network: algorand) {
          dexTrades(
            options: {desc: "date.date", limit: 1000}
            date: {since: "${sinceDate.toISOString().split('T')[0]}"}
            exchangeName: {is: "${protocol}"}
          ) {
            transaction {
              hash
            }
            buyAmount
            sellAmount
            date {
              date
            }
            exchange {
              name
            }
            baseCurrency {
              symbol
            }
            quoteCurrency {
              symbol
            }
          }
        }
      }
    `;
  }

  private calculate24hVolume(data: BitqueryResponse): number {
    if (!data.data?.ethereum?.dexTrades) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentTrades = data.data.ethereum.dexTrades.filter(trade => {
      const tradeDate = new Date(trade.date.date);
      return tradeDate > yesterday;
    });

    return recentTrades.reduce((sum, trade) => sum + (trade.buyAmount + trade.sellAmount), 0);
  }

  private calculate7dVolume(data: BitqueryResponse): number {
    if (!data.data?.ethereum?.dexTrades) return 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekTrades = data.data.ethereum.dexTrades.filter(trade => {
      const tradeDate = new Date(trade.date.date);
      return tradeDate > weekAgo;
    });

    return weekTrades.reduce((sum, trade) => sum + (trade.buyAmount + trade.sellAmount), 0);
  }

  private calculate30dVolume(data: BitqueryResponse): number {
    if (!data.data?.ethereum?.dexTrades) return 0;

    return data.data.ethereum.dexTrades.reduce((sum, trade) => sum + (trade.buyAmount + trade.sellAmount), 0);
  }

  private async estimateConcentrationRisk(protocol: string): Promise<number> {
    // Simplified concentration risk calculation
    // In a real implementation, this would analyze top holder distributions
    try {
      // Mock estimation based on protocol maturity and TVL
      const riskFactors: Record<string, number> = {
        'folks-finance': 25, // Lower risk, more distributed
        'tinyman': 35,
        'pact': 45,
      };

      return riskFactors[protocol] || 40;
    } catch (error) {
      console.warn(`Failed to estimate concentration risk for ${protocol}:`, error);
      return 50; // Default medium risk
    }
  }

  private async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 60000 / this.config.rateLimit; // 60 seconds / rate limit

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    try {
      return await operation();
    } catch (error) {
      console.error(`Bitquery request failed:`, error);
      throw error;
    }
  }
}

// Global instance
export const bitqueryService = new BitqueryService();