import { Adapter } from '../protocols/base-adapter';
import { Opportunity } from '@shared/core';

export interface DataAdapter {
  name: string;
  adapter: Adapter;
  priority: number;
  health: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    lastCheck: number;
    consecutiveFailures: number;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsRemaining: number;
    resetTime: number;
  };
}

export interface DataAggregationStrategy {
  method: 'primary_fallback' | 'weighted_average' | 'consensus' | 'fastest';
  minSources: number;
  maxSources: number;
  timeout: number;
}

export interface FallbackConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  circuitBreaker: {
    threshold: number;
    timeout: number;
  };
}

export class APIReliabilityManager {
  private adapters: Map<string, DataAdapter> = new Map();
  private fallbackConfig: FallbackConfig;
  private aggregationStrategy: DataAggregationStrategy;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    adapters: Adapter[],
    config: {
      fallback?: Partial<FallbackConfig>;
      aggregation?: Partial<DataAggregationStrategy>;
    } = {}
  ) {
    this.initializeAdapters(adapters);
    this.fallbackConfig = {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      circuitBreaker: {
        threshold: 5,
        timeout: 30000
      },
      ...config.fallback
    };

    this.aggregationStrategy = {
      method: 'primary_fallback',
      minSources: 1,
      maxSources: 3,
      timeout: 5000,
      ...config.aggregation
    };

    this.startHealthChecks();
  }

  private initializeAdapters(adapters: Adapter[]): void {
    adapters.forEach((adapter, index) => {
      const name = adapter.constructor.name;
      this.adapters.set(name, {
        name,
        adapter,
        priority: index,
        health: {
          status: 'healthy',
          responseTime: 0,
          uptime: 1,
          lastCheck: Date.now(),
          consecutiveFailures: 0
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsRemaining: 60,
          resetTime: Date.now() + 60000
        }
      });
    });
  }

  async listOpportunities(): Promise<Opportunity[]> {
    const healthyAdapters = Array.from(this.adapters.values())
      .filter(adapter => adapter.health.status === 'healthy')
      .sort((a, b) => a.priority - b.priority);

    if (healthyAdapters.length < this.aggregationStrategy.minSources) {
      throw new Error(`Insufficient healthy data sources: ${healthyAdapters.length}/${this.aggregationStrategy.minSources}`);
    }

    switch (this.aggregationStrategy.method) {
      case 'primary_fallback':
        return this.executePrimaryFallback(healthyAdapters, 'list');
      case 'fastest':
        return this.executeFastest(healthyAdapters, 'list');
      case 'consensus':
        return this.executeConsensus(healthyAdapters, 'list');
      default:
        return this.executePrimaryFallback(healthyAdapters, 'list');
    }
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    const healthyAdapters = Array.from(this.adapters.values())
      .filter(adapter => adapter.health.status === 'healthy')
      .sort((a, b) => a.priority - b.priority);

    if (healthyAdapters.length === 0) {
      throw new Error('No healthy data sources available');
    }

    // Try primary adapter first
    const primary = healthyAdapters[0];
    try {
      const result = await this.executeWithRetry(
        () => primary.adapter.getOpportunity(id),
        primary.name
      );
      this.recordSuccess(primary.name);
      return result;
    } catch (error) {
      console.warn(`Primary adapter ${primary.name} failed, trying fallbacks`);
      this.recordFailure(primary.name);

      // Try fallback adapters
      for (let i = 1; i < healthyAdapters.length; i++) {
        try {
          const result = await this.executeWithRetry(
            () => healthyAdapters[i].adapter.getOpportunity(id),
            healthyAdapters[i].name
          );
          this.recordSuccess(healthyAdapters[i].name);
          return result;
        } catch (fallbackError) {
          this.recordFailure(healthyAdapters[i].name);
          continue;
        }
      }

      throw new Error('All data sources failed to fetch opportunity');
    }
  }

  private async executePrimaryFallback(
    adapters: DataAdapter[],
    method: 'list'
  ): Promise<Opportunity[]> {
    for (const adapter of adapters) {
      try {
        const result = await this.executeWithRetry(
          () => method === 'list' ? adapter.adapter.list() : Promise.resolve([]),
          adapter.name
        );
        this.recordSuccess(adapter.name);
        return result;
      } catch (error) {
        console.warn(`Adapter ${adapter.name} failed, trying next`);
        this.recordFailure(adapter.name);
        continue;
      }
    }

    throw new Error('All adapters failed');
  }

  private async executeFastest(
    adapters: DataAdapter[],
    method: 'list'
  ): Promise<Opportunity[]> {
    const promises = adapters
      .slice(0, this.aggregationStrategy.maxSources)
      .map(adapter =>
        this.executeWithTimeout(
          this.executeWithRetry(
            () => method === 'list' ? adapter.adapter.list() : Promise.resolve([]),
            adapter.name
          ),
          this.aggregationStrategy.timeout
        ).then(result => {
          this.recordSuccess(adapter.name);
          return { result, adapter: adapter.name };
        }).catch(error => {
          this.recordFailure(adapter.name);
          throw error;
        })
      );

    try {
      const results = await Promise.any(promises);
      return results.result;
    } catch (error) {
      throw new Error('All adapters failed or timed out');
    }
  }

  private async executeConsensus(
    adapters: DataAdapter[],
    method: 'list'
  ): Promise<Opportunity[]> {
    const promises = adapters
      .slice(0, Math.min(3, adapters.length))
      .map(adapter =>
        this.executeWithTimeout(
          this.executeWithRetry(
            () => method === 'list' ? adapter.adapter.list() : Promise.resolve([]),
            adapter.name
          ),
          this.aggregationStrategy.timeout
        ).then(result => {
          this.recordSuccess(adapter.name);
          return result;
        }).catch(error => {
          this.recordFailure(adapter.name);
          throw error;
        })
      );

    const results = await Promise.allSettled(promises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<Opportunity[]> =>
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    if (successfulResults.length < this.aggregationStrategy.minSources) {
      throw new Error(`Insufficient successful results for consensus: ${successfulResults.length}/${this.aggregationStrategy.minSources}`);
    }

    // Simple consensus: return the first successful result
    // In a real implementation, you might merge/validate results
    return successfulResults[0];
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    adapterName: string,
    retryCount = 0
  ): Promise<T> {
    if (!this.fallbackConfig.enabled) {
      return operation();
    }

    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.fallbackConfig.maxRetries) {
        throw error;
      }

      const adapter = this.adapters.get(adapterName);
      if (!adapter) throw error;

      // Check circuit breaker
      if (adapter.health.consecutiveFailures >= this.fallbackConfig.circuitBreaker.threshold) {
        const timeSinceLastFailure = Date.now() - adapter.health.lastCheck;
        if (timeSinceLastFailure < this.fallbackConfig.circuitBreaker.timeout) {
          throw new Error(`Circuit breaker open for ${adapterName}`);
        } else {
          // Reset circuit breaker
          adapter.health.consecutiveFailures = 0;
        }
      }

      // Exponential backoff
      const delay = this.fallbackConfig.retryDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.executeWithRetry(operation, adapterName, retryCount + 1);
    }
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  private recordSuccess(adapterName: string): void {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) return;

    adapter.health.status = 'healthy';
    adapter.health.consecutiveFailures = 0;
    adapter.health.uptime = this.calculateUptime(adapter.health);
    adapter.health.lastCheck = Date.now();
  }

  private recordFailure(adapterName: string): void {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) return;

    adapter.health.consecutiveFailures++;
    adapter.health.lastCheck = Date.now();

    if (adapter.health.consecutiveFailures >= 3) {
      adapter.health.status = 'degraded';
    }

    if (adapter.health.consecutiveFailures >= 5) {
      adapter.health.status = 'down';
    }
  }

  private calculateUptime(health: DataAdapter['health']): number {
    // Simple uptime calculation - in production, this would be more sophisticated
    if (health.status === 'down') return 0;
    if (health.status === 'degraded') return 0.8;
    return 0.99;
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const adapter of this.adapters.values()) {
        try {
          const startTime = Date.now();
          await this.executeWithTimeout(
            adapter.adapter.list(),
            3000
          );
          const responseTime = Date.now() - startTime;

          adapter.health.responseTime = responseTime;
          adapter.health.lastCheck = Date.now();

          // Update status based on response time
          if (responseTime > 2000) {
            adapter.health.status = 'degraded';
          } else {
            adapter.health.status = 'healthy';
          }

          adapter.health.consecutiveFailures = 0;
        } catch (error) {
          this.recordFailure(adapter.name);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  getAdapterHealth(): Record<string, DataAdapter['health']> {
    const health: Record<string, DataAdapter['health']> = {};
    this.adapters.forEach((adapter, name) => {
      health[name] = { ...adapter.health };
    });
    return health;
  }

  getSystemReliability(): {
    overallHealth: 'healthy' | 'degraded' | 'down';
    healthyAdapters: number;
    totalAdapters: number;
    averageResponseTime: number;
    uptime: number;
  } {
    const adapters = Array.from(this.adapters.values());
    const healthyAdapters = adapters.filter(a => a.health.status === 'healthy').length;
    const totalAdapters = adapters.length;
    const averageResponseTime = adapters.reduce((sum, a) => sum + a.health.responseTime, 0) / totalAdapters;
    const uptime = adapters.reduce((sum, a) => sum + a.health.uptime, 0) / totalAdapters;

    let overallHealth: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (healthyAdapters === 0) {
      overallHealth = 'down';
    } else if (healthyAdapters < totalAdapters * 0.5) {
      overallHealth = 'degraded';
    }

    return {
      overallHealth,
      healthyAdapters,
      totalAdapters,
      averageResponseTime,
      uptime
    };
  }

  enableAdapter(adapterName: string): void {
    const adapter = this.adapters.get(adapterName);
    if (adapter) {
      adapter.health.status = 'healthy';
      adapter.health.consecutiveFailures = 0;
    }
  }

  disableAdapter(adapterName: string): void {
    const adapter = this.adapters.get(adapterName);
    if (adapter) {
      adapter.health.status = 'down';
    }
  }

  updateRateLimit(adapterName: string, remaining: number, resetTime: number): void {
    const adapter = this.adapters.get(adapterName);
    if (adapter) {
      adapter.rateLimits.requestsRemaining = remaining;
      adapter.rateLimits.resetTime = resetTime;

      if (remaining === 0) {
        adapter.health.status = 'degraded';
      }
    }
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}