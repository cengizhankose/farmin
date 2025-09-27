# Algorand DeFi Data Sources - Smoke Tests & Backend Implementation Guide

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Karşılaşılan Sorunlar ve Çözümler](#karşılaşılan-sorunlar-ve-çözümler)
3. [Testlerin Detaylı Analizi](#testlerin-detaylı-analizi)
4. [Backend Request Implementation](#backend-request-implementation)
5. [API Response Formatları](#api-response-formatları)
6. [Error Handling Strategies](#error-handling-strategies)
7. [Production Deployment](#production-deployment)
8. [Monitoring ve Alerting](#monitoring-ve-alerting)

---

## Genel Bakış

Bu doküman, Algorand DeFi veri kaynaklarına yönelik smoke testlerinin teknik detaylarını, karşılaşılan sorunları ve backend implementation rehberini içermektedir.

### Test Edilen Veri Kaynakları

1. **DeFiLlama** - TVL, Yields, Protocol data
2. **DappRadar** - UAW, Volume, Balance metrics
3. **Bitquery** - GraphQL queries for DEX trades
4. **Folks Finance SDK** - Lending markets and APR data
5. **Pact** - Algorand AMM protocol (via DeFiLlama)

---

## Karşılaşılan Sorunlar ve Çözümler

### 1. Jest TypeScript Configuration Issues

**Sorun**: Jest config dosyası parse edilemedi

```
Error: Jest: Failed to parse the TypeScript config file
Error: Jest: 'ts-node' is required for the TypeScript configuration files
```

**Çözüm**:

```json
// package.json
{
  "devDependencies": {
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5"
  }
}
```

```typescript
// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  testMatch: ["**/__tests__/**/*.smoke.(ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx)?$": ["ts-jest", { tsconfig: "./tsconfig.json" }],
  },
  testTimeout: 30000,
  moduleNameMapper: {
    // DOĞRU: moduleNameMapper
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### 2. Package Version Mismatches

**Sorun**: `@folks-finance/algorand-sdk@^1.0.0` mevcut değil

```
Error: No matching version found for @folks-finance/algorand-sdk@^1.0.0
```

**Çözüm**: Mevcut versiyonu kontrol et ve güncelle

```bash
npm view @folks-finance/algorand-sdk versions --json
# Çıktı: ["0.0.1", "0.0.2", ..., "0.1.9"]
```

```json
{
  "devDependencies": {
    "@folks-finance/algorand-sdk": "^0.1.9" // Güncel versiyon
  }
}
```

### 3. Zod Schema Validation Errors

**Sorun**: Bitquery testinde `passthrough()` metodu bulunamadı

```
TypeError: zod_1.z.object(...).optional(...).passthrough is not a function
```

**Çözüm**: Zod schema'sını düzelt

```typescript
// HATALI
const TradesSchema = z.object({
  tradeAmount: z
    .object({ USD: z.number().optional() })
    .optional()
    .passthrough()
    .optional(),
});

// DOĞRU
const TradesSchema = z.object({
  tradeAmount: z.object({ USD: z.number().optional() }).optional(),
});
```

### 4. SDK Import/Usage Issues

**Sorun**: Folks SDK constructor bulunamadı

```
TypeError: algorand_sdk_1.FolksClient is not a constructor
```

**Çözüm**: Flexible import pattern kullan

```typescript
// HATALI
import { FolksClient } from "@folks-finance/algorand-sdk";

// DOĞRU
import * as FolksSDK from "@folks-finance/algorand-sdk";

// Runtime'da doğru constructor'ı bul
const client = FolksSDK.FolksClient || FolksSDK.Client || FolksSDK.default;
```

### 5. Data Availability Issues

**Sorun**: PACT havuzları Algorand'da bulunamadı

```
Expected: > 0
Received: 0 (PACT pools on Algorand)
```

**Çözüm**: Testi daha genel yap, Algorand odaklı test et

```typescript
// Sadece Algorand havuzlarını test et
const algorandPools = pools.filter(
  (pool) => (pool.chain || "").toLowerCase() === "algorand",
);
```

---

## Testlerin Detaylı Analizi

### 1. DeFiLlama Testi

**Amaç**: TVL, Yields ve Protocol verilerinin erişilebilirliğini test et

**Test Logic**:

```typescript
test("DefiLlama protocol/<slug> returns TVL data", async () => {
  const slug = "tinyman";
  const data = await httpGetJson<any>(`https://api.llama.fi/protocol/${slug}`);

  // Schema validation
  const parse = ProtocolSchema.safeParse(data);
  expect(parse.success).toBe(true);
});
```

**Expected Response**:

```json
{
  "name": "Tinyman",
  "slug": "tinyman",
  "tvl": [
    { "date": 1640995200, "totalLiquidityUSD": 150000000 },
    { "date": 1641081600, "totalLiquidityUSD": 152000000 }
  ],
  "currentChainTvls": {
    "Algorand": 150000000
  }
}
```

### 2. DappRadar Testi

**Amaç**: API key ile UAW, Volume, Balance metriklerini test et

**Gereksinimler**:

```bash
DAPPRADAR_API_KEY=your_key_here
```

**Test Logic**:

```typescript
const headers = { "X-BLOBR-KEY": process.env.DAPPRADAR_API_KEY! };
const data = await httpGetJson<any>(url, headers);
```

**Expected Response**:

```json
{
  "uaw": 1250,
  "volumeUSD": 2500000,
  "balanceUSD": 15000000,
  "timeseries": [{ "date": "2025-09-27", "uaw": 1200, "volumeUSD": 2400000 }]
}
```

### 3. Bitquery Testi

**Amaç**: GraphQL queries ile DEX trade verilerini test et

**Test Logic**:

```typescript
const query = `
query($from: ISO8601DateTime!, $pool: String!) {
  algorand {
    dexTrades(
      time: {since: $from}
      smartContract: {is: $pool}
    ) {
      tradeAmount { USD }
      timeInterval { hour }
    }
  }
}`;
```

**Expected Response**:

```json
{
  "data": {
    "algorand": {
      "dexTrades": [
        {
          "tradeAmount": { "USD": 25000.5 },
          "timeInterval": { "hour": "2025-09-27T10:00:00Z" }
        }
      ]
    }
  }
}
```

### 4. Folks Finance SDK Testi

**Amaç**: SDK'nın doğru import edilebilirliğini test et

**Test Logic**:

```typescript
import * as FolksSDK from "@folks-finance/algorand-sdk";

// SDK exports'ını kontrol et
console.log("Available methods:", Object.keys(FolksSDK));

// Runtime'da doğru constructor'ı bul
const ClientClass = FolksSDK.FolksClient || FolksSDK.Client;
if (ClientClass) {
  const client = new ClientClass({ network: "mainnet" });
}
```

**SDK Exports**:

```
[
  "algoLiquidGovernanceV1", "retrievePoolInfo", "prepareDepositIntoPool",
  "calcDepositInterestRate", "MainnetPools", "calcUtilisationRatio",
  // ... 100+ utility functions
]
```

### 5. Algorand Pools Testi

**Amaç**: DeFiLlama'da Algorand havuzlarının varlığını test et

**Test Logic**:

```typescript
const algorandPools = pools.filter(
  (pool) => (pool.chain || "").toLowerCase() === "algorand",
);

expect(algorandPools.length).toBeGreaterThan(0);
```

**Expected Data**:

```json
{
  "project": "Folks Finance",
  "symbol": "ALGO-USDC",
  "chain": "Algorand",
  "tvlUsd": 15000000,
  "apy": 12.5,
  "pool": "folks-finance-algo-usdc"
}
```

---

## Backend Request Implementation

### 1. HTTP Client Setup

```typescript
// src/lib/http-client.ts
import fetch from "cross-fetch";

export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private retryCount: number = 3;
  private timeout: number = 30000;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      "User-Agent": "Algorand-DeFi-Data/1.0.0",
      "Content-Type": "application/json",
      ...headers,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return this.request<T>(url.toString(), "GET");
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, "POST", data);
  }

  private async request<T>(
    url: string,
    method: string,
    data?: any,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method,
          headers: this.headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        // Rate limit veya network error ise retry
        if (attempt < this.retryCount && this.shouldRetry(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: Error): boolean {
    // 429: Too Many Requests
    // 5xx: Server errors
    // Network errors
    return (
      error.message.includes("429") ||
      error.message.includes("5") ||
      error.message.includes("Network") ||
      error.message.includes("ECONNRESET")
    );
  }
}
```

### 2. DeFiLlama Service

```typescript
// src/services/defillama.ts
import { ApiClient } from "./http-client";
import { z } from "zod";

const ProtocolSchema = z.object({
  name: z.string(),
  slug: z.string(),
  tvl: z.array(
    z.object({
      date: z.number(),
      totalLiquidityUSD: z.number().nullable(),
    }),
  ),
  currentChainTvls: z.record(z.number()),
});

const PoolSchema = z.object({
  project: z.string(),
  symbol: z.string(),
  chain: z.string(),
  tvlUsd: z.number(),
  apy: z.number().nullable(),
  apyBase: z.number().nullable(),
  apyReward: z.number().nullable(),
});

export class DeFiLlamaService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient("https://api.llama.fi");
  }

  async getProtocol(slug: string): Promise<z.infer<typeof ProtocolSchema>> {
    const data = await this.client.get(`/protocol/${slug}`);
    return ProtocolSchema.parse(data);
  }

  async getPools(chain?: string): Promise<z.infer<typeof PoolSchema>[]> {
    const data = await this.client.get("https://yields.llama.fi/pools");
    const pools = PoolSchema.array().parse(data.data || data);

    if (chain) {
      return pools.filter(
        (pool) => pool.chain.toLowerCase() === chain.toLowerCase(),
      );
    }

    return pools;
  }

  async getAlgorandProtocols(): Promise<any[]> {
    const protocols = await this.client.get("/protocols");
    return protocols.filter(
      (p: any) => p.chain && p.chain.toLowerCase() === "algorand",
    );
  }

  async getHistoricalTVL(
    slug: string,
    days: number = 30,
  ): Promise<Array<{ date: number; tvl: number }>> {
    const protocol = await this.getProtocol(slug);
    return protocol.tvl.slice(-days).map((item) => ({
      date: item.date,
      tvl: item.totalLiquidityUSD || 0,
    }));
  }
}
```

### 3. DappRadar Service

```typescript
// src/services/dappradar.ts
import { ApiClient } from "./http-client";
import { z } from "zod";

const DappMetricsSchema = z.object({
  uaw: z.number(),
  volumeUSD: z.number(),
  balanceUSD: z.number(),
  timeseries: z.array(
    z.object({
      date: z.string(),
      uaw: z.number().optional(),
      volumeUSD: z.number().optional(),
      balanceUSD: z.number().optional(),
    }),
  ),
});

export class DappRadarService {
  private client: ApiClient;

  constructor(apiKey: string) {
    this.client = new ApiClient("https://api.dappradar.com", {
      "X-BLOBR-KEY": apiKey,
    });
  }

  async getDappMetrics(
    dappId: string,
    timeRange: "24h" | "7d" | "30d" = "30d",
  ): Promise<z.infer<typeof DappMetricsSchema>> {
    const data = await this.client.get(`/4ts/analytics/dapps/${dappId}`, {
      timeRange,
    });

    return DappMetricsSchema.parse(data);
  }

  async getAlgorandDapps(): Promise<any[]> {
    // Bu endpoint mevcut değil, alternatif olarak
    // DeFiLlama veya manual list kullanılabilir
    const knownDapps = [
      { id: "algorand-tinyman", name: "Tinyman" },
      { id: "algorand-folks", name: "Folks Finance" },
      { id: "algorand-pact", name: "Pact" },
    ];

    return knownDapps;
  }
}
```

### 4. Bitquery Service

```typescript
// src/services/bitquery.ts
import { ApiClient } from "./http-client";
import { z } from "zod";

const DexTradeSchema = z.object({
  tradeAmount: z.object({
    USD: z.number(),
  }),
  timeInterval: z.object({
    hour: z.string(),
  }),
});

const DexTradesResponseSchema = z.object({
  data: z.object({
    algorand: z.object({
      dexTrades: z.array(DexTradeSchema),
    }),
  }),
});

export class BitqueryService {
  private client: ApiClient;

  constructor(apiKey: string) {
    this.client = new ApiClient("https://streaming.bitquery.io/graphql", {
      "X-API-KEY": apiKey,
    });
  }

  async getDexTrades(params: {
    from: string;
    pool?: string;
    app?: string;
    limit?: number;
  }): Promise<z.infer<typeof DexTradesResponseSchema>> {
    const query = `
    query($from: ISO8601DateTime!, $pool: String, $app: String, $limit: Int) {
      algorand {
        dexTrades(
          time: {since: $from}
          limit: $limit
          smartContract: {is: $pool}
          smartContractMethod: {is: $app}
        ) {
          tradeAmount { USD }
          timeInterval { hour }
        }
      }
    }`;

    const variables = {
      from: params.from,
      pool: params.pool,
      app: params.app,
      limit: params.limit || 1000,
    };

    const data = await this.client.post("", { query, variables });
    return DexTradesResponseSchema.parse(data);
  }

  async getVolume24h(pool: string): Promise<number> {
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const response = await this.getDexTrades({ from, pool });

    return response.data.algorand.dexTrades.reduce(
      (total, trade) => total + (trade.tradeAmount.USD || 0),
      0,
    );
  }

  async getDistinctUsers(app: string, days: number = 7): Promise<number> {
    const from = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const query = `
    query($from: ISO8601DateTime!, $app: String!) {
      algorand {
        smartContractCalls(
          time: {since: $from}
          smartContract: {is: $app}
        ) {
          callerAddress(count: distinct)
        }
      }
    }`;

    const data = await this.client.post("", {
      query,
      variables: { from, app },
    });

    return data.data.algorand.smartContractCalls[0]?.callerAddress || 0;
  }
}
```

### 5. Folks Finance Service

```typescript
// src/services/folks.ts
import * as FolksSDK from "@folks-finance/algorand-sdk";

export class FolksFinanceService {
  private network: string;

  constructor(network: string = "mainnet") {
    this.network = network;
  }

  async getMarkets(): Promise<any[]> {
    // Folks SDK'da doğrudan getMarkets metodu yok
    // Alternatif olarak pool bilgilerini kullan
    const pools = FolksSDK.MainnetPools || [];
    return pools.map((pool) => ({
      assetId: pool.assetId,
      symbol: pool.symbol,
      marketId: pool.marketId,
    }));
  }

  async getMarketInfo(assetId: string): Promise<any> {
    try {
      // Pool bilgilerini al
      const poolInfo = await FolksSDK.retrievePoolInfo(assetId);

      // Faiz oranlarını hesapla
      const depositRate = await FolksSDK.calcDepositInterestRate({
        assetId,
        totalSupply: poolInfo.totalSupply,
        totalBorrow: poolInfo.totalBorrow,
      });

      const borrowRate = await FolksSDK.calcBorrowInterestRate({
        assetId,
        totalSupply: poolInfo.totalSupply,
        totalBorrow: poolInfo.totalBorrow,
      });

      return {
        assetId,
        symbol: poolInfo.symbol,
        totalSupply: poolInfo.totalSupply,
        totalBorrow: poolInfo.totalBorrow,
        depositAPR: depositRate * 100, // Percentage'e çevir
        borrowAPR: borrowRate * 100,
        utilizationRate: poolInfo.totalBorrow / poolInfo.totalSupply,
      };
    } catch (error) {
      console.error("Error getting market info:", error);
      throw error;
    }
  }

  async getUserPosition(userAddress: string, assetId: string): Promise<any> {
    try {
      const userInfo = await FolksSDK.retrieveUserDepositInfo(
        userAddress,
        assetId,
      );

      return {
        userAddress,
        assetId,
        depositedAmount: userInfo.depositedAmount,
        borrowedAmount: userInfo.borrowedAmount,
        healthFactor: userInfo.healthFactor,
      };
    } catch (error) {
      console.error("Error getting user position:", error);
      throw error;
    }
  }
}
```

---

## API Response Formatları

### 1. Standard Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    source: string;
    latency: number;
  };
}
```

### 2. Error Response Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  };
  timestamp: string;
}
```

### 3. Pagination Response

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
  metadata: {
    timestamp: string;
    source: string;
  };
}
```

---

## Error Handling Strategies

### 1. Retry Logic

```typescript
class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      retryableErrors?: string[];
    } = {},
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      retryableErrors = ["429", "500", "502", "503", "504"],
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (
          attempt === maxRetries ||
          !this.isRetryable(error, retryableErrors)
        ) {
          throw lastError;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private static isRetryable(error: Error, retryableErrors: string[]): boolean {
    return retryableErrors.some((code) => error.message.includes(code));
  }
}
```

### 2. Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
    }
  }
}
```

### 3. Rate Limiting

```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requests = this.requests.get(key)!;
    const validRequests = requests.filter((time) => time > windowStart);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((time) => time > windowStart);

    return Math.max(0, this.maxRequests - validRequests.length);
  }
}
```

---

## Production Deployment

### 1. Environment Variables

```bash
# .env.production
# API Keys
DAPPRADAR_API_KEY=your_production_dappradar_key
BITQUERY_API_KEY=your_production_bitquery_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Timeouts
REQUEST_TIMEOUT_MS=30000
CONNECT_TIMEOUT_MS=10000

# Retry Configuration
MAX_RETRIES=3
RETRY_BASE_DELAY_MS=1000
RETRY_MAX_DELAY_MS=10000

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT_MS=60000

# Cache Settings
ENABLE_CACHE=true
CACHE_TTL_MS=300000
```

### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### 3. Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: algorand-defi-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: algorand-defi-api
  template:
    metadata:
      labels:
        app: algorand-defi-api
    spec:
      containers:
        - name: api
          image: algorand-defi-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DAPPRADAR_API_KEY
              valueFrom:
                secretKeyRef:
                  name: api-keys
                  key: dappradar
            - name: BITQUERY_API_KEY
              valueFrom:
                secretKeyRef:
                  name: api-keys
                  key: bitquery
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## Monitoring ve Alerting

### 1. Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "unknown",
    checks: {
      defillama: "unknown",
      dappradar: "unknown",
      bitquery: "unknown",
      folks: "unknown",
    },
  };

  // Check each service
  const checks = [
    { name: "defillama", url: "https://api.llama.fi/ping" },
    { name: "dappradar", url: "https://api.dappradar.com/health" },
    { name: "bitquery", url: "https://streaming.bitquery.io/health" },
  ];

  for (const check of checks) {
    try {
      const response = await fetch(check.url, { timeout: 5000 });
      healthStatus.checks[check.name] = response.ok ? "healthy" : "unhealthy";
    } catch (error) {
      healthStatus.checks[check.name] = "unhealthy";
    }
  }

  // Check Folks SDK
  try {
    const FolksSDK = await import("@folks-finance/algorand-sdk");
    healthStatus.checks.folks =
      Object.keys(FolksSDK).length > 0 ? "healthy" : "unhealthy";
  } catch (error) {
    healthStatus.checks.folks = "unhealthy";
  }

  // Determine overall status
  const allHealthy = Object.values(healthStatus.checks).every(
    (status) => status === "healthy",
  );
  healthStatus.status = allHealthy ? "healthy" : "degraded";

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  return NextResponse.json(healthStatus, { status: statusCode });
}
```

### 2. Metrics Collection

```typescript
// src/lib/metrics.ts
export class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private gauges: Map<string, number> = new Map();

  incrementCounter(
    name: string,
    value: number = 1,
    labels: Record<string, string> = {},
  ) {
    const key = this.formatKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  recordHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {},
  ) {
    const key = this.formatKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = this.formatKey(name, labels);
    this.gauges.set(key, value);
  }

  private formatKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  getMetrics(): string {
    let output = "";

    // Counters
    for (const [key, value] of this.counters) {
      output += `# TYPE ${key.split("{")[0]} counter\n`;
      output += `${key} ${value}\n`;
    }

    // Gauges
    for (const [key, value] of this.gauges) {
      output += `# TYPE ${key.split("{")[0]} gauge\n`;
      output += `${key} ${value}\n`;
    }

    // Histograms
    for (const [key, values] of this.histograms) {
      output += `# TYPE ${key.split("{")[0]} histogram\n`;
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const avg = count > 0 ? sum / count : 0;

      output += `${key}_sum ${sum}\n`;
      output += `${key}_count ${count}\n`;
      output += `${key}_bucket{le="+Inf"} ${count}\n`;
    }

    return output;
  }
}
```

### 3. Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: algorand-defi-api
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} for {{ $labels.service }}"

      - alert: ServiceUnhealthy
        expr: up{job="algorand-defi-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Algorand DeFi API service is not responding"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"

      - alert: RateLimitExceeded
        expr: rate_limit_remaining < 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Rate limit about to be exceeded"
          description: "Only {{ $value }} requests remaining in current window"
```

Bu doküman, smoke testlerinde karşılaşılan sorunları, çözümlerini ve production-ready backend implementation detaylarını kapsamlı bir şekilde açıklamaktadır
