# Algorand DeFi API Usage Guide - Test Çıktıları Temelinde Veri Akışı ve Kullanım

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Test Çıktıları ve Veri Akışı](#test-çıktıları-ve-veri-akışı)
3. [API Kullanım Senaryoları](#api-kullanım-senaryoları)
4. [Risk Modeli İçin Veri Toplama](#risk-modeli-için-veri-toplama)
5. [Optimizasyon Stratejileri](#optimizasyon-stratejileri)
6. [Error Handling ve Fallback](#error-handling-ve-fallback)
7. [Real-World Implementation Example](#real-world-implementation-example)
8. [Performance Metrics](#performance-metrics)

---

## Genel Bakış

Bu doküman, smoke testlerinin çıktılarından yola çıkarak Algorand DeFi veri kaynaklarının nasıl kullanılacağını, veri akışının nasıl yönetileceğini ve gerçek dünya senaryolarında bu API'lerin nasıl entegre edileceğini açıklamaktadır.

### Temel Veri Akışı

```
Test Çıktıları → Veri Analizi → API Entegrasyon → Risk Modeli → Karar Verme
```

---

## Test Çıktıları ve Veri Akışı

### 1. DeFiLlama Test Çıktıları

**Test Sonucu**: ✅ PASS
**Bulunan Veriler**: 1308 günlük TVL verisi, protocol detayları

**Veri Yapısı**:
```json
{
  "name": "Pact",
  "slug": "pact",
  "tvl": [
    {"date": 1640995200, "totalLiquidityUSD": 150000000},
    {"date": 1641081600, "totalLiquidityUSD": 152000000}
  ],
  "currentChainTvls": {
    "Algorand": 150000000
  }
}
```

**Veri Akışı**:
1. **Tarihsel TVL Verisi** → Risk stabilite analizi (ST)
2. **Anlık TVL** → Likidite riski hesaplama (LQ)
3. **Zincir Bazlı TVL** → Multi-chain risk analizi

### 2. Algorand Pools Test Çıktısı

**Test Sonucu**: ✅ PASS
**Bulunan Veriler**: Algorand zincirindeki çeşitli havuzlar

**Örnek Veri**:
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

**Veri Akışı**:
1. **TVL/Pool Verisi** → Havuz likidite analizi
2. **APY Verisi** → Yield risk hesaplama (YS)
3. **Pool Meta** -> Risk faktörleri için input

### 3. Folks Finance SDK Test Çıktısı

**Test Sonucu**: ✅ PASS
**Bulunan Veriler**: 100+ utility functions, lending market verileri

**SDK Exports**:
```
[
  "retrievePoolInfo", "prepareDepositIntoPool", "calcDepositInterestRate",
  "MainnetPools", "calcUtilisationRatio", "retrieveUserDepositInfo",
  // ... 100+ functions
]
```

**Veri Akışı**:
1. **Faiz Oranları** -> Lending market riski
2. **Pool Bilgileri** -> Borçlanma/mevduat oranları
3. **Kullanıcı Pozisyonları** -> Counterparty riski

---

## API Kullanım Senaryoları

### Senaryo 1: Havuz Risk Analizi

**Amaç**: Belirli bir havuzun risk skorunu hesaplama

**Adımlar**:
1. DeFiLlama'dan havuz TVL'sini çek
2. DeFiLlama Yields'dan APY verisini al
3. Tarihsel TVL verisini analiz et
4. Risk skorunu hesapla

**Implementation**:
```typescript
async function calculatePoolRisk(poolId: string): Promise<RiskScore> {
  // 1. Mevcut durum verilerini çek
  const currentData = await defiLlama.getPools('algorand')
  const pool = currentData.find(p => p.pool === poolId)

  if (!pool) throw new Error('Pool not found')

  // 2. Tarihsel TVL verisini çek
  const protocol = await defiLlama.getProtocol('pact') // veya ilgili protokol
  const historicalTVL = protocol.tvl.slice(-30) // Son 30 gün

  // 3. Risk metriklerini hesapla
  const tvlVolatility = calculateTVLVolatility(historicalTVL)
  const currentTVL = pool.tvlUsd
  const apy = pool.apy || 0

  // 4. Risk skorunu hesapla
  return {
    poolId,
    liquidityRisk: calculateLiquidityRisk(currentTVL, tvlVolatility),
    yieldRisk: calculateYieldRisk(apy, historicalTVL),
    stabilityRisk: calculateStabilityRisk(historicalTVL),
    timestamp: Date.now()
  }
}
```

### Senaryo 2: Portfolio Risk Analizi

**Amaç**: Kullanıcı portfolio'sunun genel riskini analiz etme

**Adımlar**:
1. Kullanıcının pozisyonlarını çek
2. Her havuz için risk skorunu hesapla
3. Portfolio bazında aggregate et

**Implementation**:
```typescript
async function analyzePortfolioRisk(userAddress: string): Promise<PortfolioRisk> {
  // 1. Kullanıcının pozisyonlarını çek (Folks SDK)
  const userPositions = await folksService.getUserPositions(userAddress)

  // 2. Her pozisyon için risk hesapla
  const positionRisks = await Promise.all(
    userPositions.map(async (position) => {
      const poolRisk = await calculatePoolRisk(position.poolId)
      return {
        ...position,
        risk: poolRisk,
        positionValue: position.amount * position.price
      }
    })
  )

  // 3. Portfolio riskini aggregate et
  const totalValue = positionRisks.reduce((sum, p) => sum + p.positionValue, 0)

  return {
    totalValue,
    weightedRiskScore: calculateWeightedRisk(positionRisks, totalValue),
    positionRisks,
    riskDistribution: calculateRiskDistribution(positionRisks),
    concentrationRisk: calculateConcentrationRisk(positionRisks)
  }
}
```

### Senaryo 3: Real-time Monitoring

**Amaç**: Havuzların gerçek zamanlı olarak monitor edilmesi

**Adımlar**:
1. Düzenli aralıklarla veri çek
2. Anomali tespiti yap
3. Alert mekanizmaları

**Implementation**:
```typescript
class PoolMonitor {
  private intervalMs: number

  constructor(intervalMs: number = 300000) { // 5 dakika
    this.intervalMs = intervalMs
  }

  async startMonitoring(pools: string[]): Promise<void> {
    setInterval(async () => {
      try {
        await this.checkPoolHealth(pools)
      } catch (error) {
        console.error('Monitoring error:', error)
      }
    }, this.intervalMs)
  }

  private async checkPoolHealth(pools: string[]): Promise<void> {
    // 1. Güncel verileri çek
    const currentData = await defiLlama.getPools('algorand')

    // 2. Her havuzu kontrol et
    for (const poolId of pools) {
      const pool = currentData.find(p => p.pool === poolId)

      if (!pool) {
        await this.alert('POOL_NOT_FOUND', { poolId })
        continue
      }

      // 3. Anomali kontrolü
      const anomalies = await this.detectAnomalies(pool)

      if (anomalies.length > 0) {
        await this.alert('ANOMALY_DETECTED', {
          poolId,
          anomalies,
          currentData: pool
        })
      }
    }
  }

  private async detectAnomalies(pool: any): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []

    // TVL düşüşü kontrolü
    if (pool.tvlUsd < POOL_TVL_THRESHOLD) {
      anomalies.push({
        type: 'LOW_TVL',
        severity: 'high',
        value: pool.tvlUsd,
        threshold: POOL_TVL_THRESHOLD
      })
    }

    // APY değişimi kontrolü
    if (pool.apy && pool.apy > APY_THRESHOLD_HIGH) {
      anomalies.push({
        type: 'HIGH_APY',
        severity: 'medium',
        value: pool.apy,
        threshold: APY_THRESHOLD_HIGH
      })
    }

    return anomalies
  }
}
```

---

## Risk Modeli İçin Veri Toplama

### 1. Liquidity Risk (LQ) Veri Toplama

**Gerekli Veriler**:
- TVL (anlık ve tarihsel)
- Pool büyüklüğü
- Trading volume
- Likidite derinliği

**Data Sources**:
```typescript
async function getLiquidityRiskData(poolId: string): Promise<LiquidityData> {
  // 1. DeFiLlama'dan TVL verisi
  const defiData = await defiLlama.getPools('algorand')
  const pool = defiData.find(p => p.pool === poolId)

  // 2. Tarihsel TVL
  const historical = await defiLlama.getHistoricalTVL(getProtocolSlug(poolId))

  // 3. Volume verisi (Bitquery)
  const volume24h = await bitquery.getVolume24h(poolId)

  return {
    currentTVL: pool?.tvlUsd || 0,
    historicalTVL: historical,
    volume24h,
    poolSize: pool?.tvlUsd || 0,
    timestamp: Date.now()
  }
}
```

### 2. Stability Risk (ST) Veri Toplama

**Gerekli Veriler**:
- TVL volatilitesi
- Zaman serisi trendleri
- Drawdown analizleri

**Data Sources**:
```typescript
async function getStabilityRiskData(poolId: string): Promise<StabilityData> {
  const historical = await defiLlama.getHistoricalTVL(getProtocolSlug(poolId), 90)

  // 1. Volatilite hesapla
  const volatility = calculateVolatility(historical.map(h => h.tvl))

  // 2. Trend analizi
  const trend = calculateTrend(historical)

  // 3. Max drawdown
  const maxDrawdown = calculateMaxDrawdown(historical)

  return {
    volatility,
    trend,
    maxDrawdown,
    timeSeries: historical,
    timestamp: Date.now()
  }
}
```

### 3. Yield Risk (YS) Veri Toplama

**Gerekli Veriler**:
- APY/APR verileri
- Faiz oranı değişimleri
- Reward token değerleri

**Data Sources**:
```typescript
async function getYieldRiskData(poolId: string): Promise<YieldData> {
  // 1. DeFiLlama yields
  const defiPools = await defiLlama.getPools('algorand')
  const pool = defiPools.find(p => p.pool === poolId)

  // 2. Folks Finance faiz oranları
  let folksAPR = 0
  try {
    const marketInfo = await folksService.getMarketInfo(getAssetId(poolId))
    folksAPR = marketInfo.depositAPR
  } catch (error) {
    // Folks Finance desteklemiyorsa, DeFiLlama verisini kullan
  }

  return {
    currentAPY: pool?.apy || folksAPR || 0,
    baseAPY: pool?.apyBase || 0,
    rewardAPY: pool?.apyReward || 0,
    folksAPR,
    timestamp: Date.now()
  }
}
```

### 4. Concentration Risk (CN) Veri Toplama

**Gerekli Veriler**:
- Benzersiz kullanıcı sayısı (UAW)
- Large holder analizi
- Volume/usuario ratio

**Data Sources**:
```typescript
async function getConcentrationRiskData(poolId: string): Promise<ConcentrationData> {
  // 1. DappRadar UAW verisi
  const dappId = getDappId(poolId)
  const metrics = await dappradar.getDappMetrics(dappId, '30d')

  // 2. Bitquery distinct users
  const distinctUsers = await bitquery.getDistinctUsers(poolId, 30)

  // 3. Volume per user
  const volume24h = await bitquery.getVolume24h(poolId)
  const volumePerUser = metrics.uaw > 0 ? volume24h / metrics.uaw : 0

  return {
    uaw: metrics.uaw,
    distinctUsers30d: distinctUsers,
    volumePerUser,
    balanceUSD: metrics.balanceUSD,
    concentrationRatio: calculateConcentrationRatio(metrics),
    timestamp: Date.now()
  }
}
```

---

## Optimizasyon Stratejileri

### 1. Caching Stratejisi

**Zaman bazlı caching**:
```typescript
class DataCache {
  private cache = new Map<string, { data: any; expires: number }>()

  async get<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number = 300000): Promise<T> {
    const cached = this.cache.get(key)

    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    const data = await fetchFn()
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    })

    return data
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}
```

### 2. Batching ve Parallel Requests

**Optimize edilmiş veri çekme**:
```typescript
async function fetchAllPoolData(pools: string[]): Promise<PoolData[]> {
  // Tüm istekleri parallel yap
  const [defiPools, protocols] = await Promise.all([
    defiLlama.getPools('algorand'),
    defiLlama.getAlgorandProtocols()
  ])

  // Pool verilerini batch halinde işle
  return pools.map(poolId => {
    const pool = defiPools.find(p => p.pool === poolId)
    const protocol = protocols.find(p => p.slug === getProtocolSlug(poolId))

    return {
      poolId,
      currentTVL: pool?.tvlUsd || 0,
      apy: pool?.apy || 0,
      protocolTVL: protocol?.tvl || 0,
      lastUpdated: Date.now()
    }
  })
}
```

### 3. Rate Limiting Handling

**Akıllı rate limiting**:
```typescript
class RateLimitManager {
  private requestCounts = new Map<string, number[]>()
  private windowMs = 60000 // 1 dakika

  canMakeRequest(api: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    const requests = this.requestCounts.get(api) || []
    const validRequests = requests.filter(time => time > windowStart)

    const limits = {
      defillama: 100,    // 100 request/dakika
      dappradar: 60,     // 60 request/dakika
      bitquery: 30       // 30 request/dakika
    }

    if (validRequests.length >= limits[api as keyof typeof limits]) {
      return false
    }

    validRequests.push(now)
    this.requestCounts.set(api, validRequests)
    return true
  }

  getBackoffTime(api: string): number {
    const requests = this.requestCounts.get(api) || []
    if (requests.length === 0) return 0

    const oldestRequest = Math.min(...requests)
    const timeSinceOldest = Date.now() - oldestRequest

    return Math.max(0, this.windowMs - timeSinceOldest)
  }
}
```

---

## Error Handling ve Fallback

### 1. Hiyerarşik Error Handling

**Multi-level fallback**:
```typescript
async function getPoolDataWithFallback(poolId: string): Promise<PoolData> {
  const errors: Error[] = []

  // Primary: DeFiLlama
  try {
    const data = await defiLlama.getPools('algorand')
    const pool = data.find(p => p.pool === poolId)
    if (pool) return { source: 'defillama', ...pool }
  } catch (error) {
    errors.push({ source: 'defillama', error })
  }

  // Fallback 1: Folks Finance
  try {
    if (isFolksPool(poolId)) {
      const marketInfo = await folksService.getMarketInfo(getAssetId(poolId))
      return {
        source: 'folks',
        poolId,
        tvlUsd: marketInfo.totalSupply,
        apy: marketInfo.depositAPR,
        symbol: marketInfo.symbol
      }
    }
  } catch (error) {
    errors.push({ source: 'folks', error })
  }

  // Fallback 2: Cached data
  try {
    const cached = cache.get(`pool_${poolId}`)
    if (cached) {
      return { source: 'cache', ...cached, isStale: true }
    }
  } catch (error) {
    errors.push({ source: 'cache', error })
  }

  // Tüm denemeler başarısız oldu
  throw new Error(`All data sources failed for pool ${poolId}`, {
    cause: errors
  })
}
```

### 2. Graceful Degradation

**Kısmi veri ile çalışma**:
```typescript
async function getRiskScorePartialData(poolId: string): Promise<PartialRiskScore> {
  const result: PartialRiskScore = {
    poolId,
    timestamp: Date.now(),
    dataQuality: 'partial'
  }

  // Her veri kaynağını bağımsız olarak dene
  try {
    const liquidityData = await getLiquidityRiskData(poolId)
    result.liquidityRisk = calculateLiquidityRisk(liquidityData)
    result.dataSources = ['liquidity']
  } catch (error) {
    result.errors = result.errors || []
    result.errors.push({ type: 'liquidity', error: error.message })
  }

  try {
    const stabilityData = await getStabilityRiskData(poolId)
    result.stabilityRisk = calculateStabilityRisk(stabilityData)
    result.dataSources = [...(result.dataSources || []), 'stability']
  } catch (error) {
    result.errors = result.errors || []
    result.errors.push({ type: 'stability', error: error.message })
  }

  // En az bir veri kaynağı başarılı olmalı
  if (!result.dataSources || result.dataSources.length === 0) {
    throw new Error('No data sources available')
  }

  return result
}
```

---

## Real-World Implementation Example

### Complete Risk Analysis Service

```typescript
class AlgorandRiskAnalysisService {
  private cache = new DataCache()
  private rateLimiter = new RateLimitManager()

  async analyzePoolRisk(poolId: string): Promise<ComprehensiveRiskAnalysis> {
    // Rate limiting kontrolü
    if (!this.rateLimiter.canMakeRequest('defillama')) {
      throw new Error('Rate limit exceeded for DeFiLlama')
    }

    // Cache'den kontrol et
    return this.cache.get(`risk_${poolId}`, async () => {
      // Paralel veri çekme
      const [liquidityData, stabilityData, yieldData, concentrationData] = await Promise.allSettled([
        this.getLiquidityData(poolId),
        this.getStabilityData(poolId),
        this.getYieldData(poolId),
        this.getConcentrationData(poolId)
      ])

      // Risk skorlarını hesapla
      const riskScores = this.calculateRiskScores({
        liquidity: liquidityData.status === 'fulfilled' ? liquidityData.value : null,
        stability: stabilityData.status === 'fulfilled' ? stabilityData.value : null,
        yield: yieldData.status === 'fulfilled' ? yieldData.value : null,
        concentration: concentrationData.status === 'fulfilled' ? concentrationData.value : null
      })

      return {
        poolId,
        riskScores,
        dataQuality: this.assessDataQuality([liquidityData, stabilityData, yieldData, concentrationData]),
        dataSources: this.getDataSources([liquidityData, stabilityData, yieldData, concentrationData]),
        errors: this.collectErrors([liquidityData, stabilityData, yieldData, concentrationData]),
        timestamp: Date.now()
      }
    }, 300000) // 5 dakika cache
  }

  private async getLiquidityData(poolId: string): Promise<LiquidityData> {
    // DeFiLlama ve Bitquery'den likidite verisi
    const [defiPools, volume24h] = await Promise.all([
      defiLlama.getPools('algorand'),
      bitquery.getVolume24h(poolId)
    ])

    const pool = defiPools.find(p => p.pool === poolId)

    return {
      currentTVL: pool?.tvlUsd || 0,
      volume24h,
      tvlToVolumeRatio: pool?.tvlUsd ? volume24h / pool.tvlUsd : 0,
      timestamp: Date.now()
    }
  }

  private calculateRiskScores(data: {
    liquidity: LiquidityData | null
    stability: StabilityData | null
    yield: YieldData | null
    concentration: ConcentrationData | null
  }): RiskScores {
    return {
      liquidityRisk: data.liquidity ? this.calculateLiquidityScore(data.liquidity) : 0.5,
      stabilityRisk: data.stability ? this.calculateStabilityScore(data.stability) : 0.5,
      yieldRisk: data.yield ? this.calculateYieldScore(data.yield) : 0.5,
      concentrationRisk: data.concentration ? this.calculateConcentrationScore(data.concentration) : 0.5,
      overallRisk: this.calculateOverallRisk(data)
    }
  }

  private calculateOverallRisk(data: any): number {
    // Ağırlıklı risk skorunu hesapla
    const weights = { liquidity: 0.3, stability: 0.3, yield: 0.2, concentration: 0.2 }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([key, weight]) => {
      if (data[key]) {
        totalScore += data[key].score * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? totalScore / totalWeight : 0.5
  }
}
```

### Usage Example

```typescript
// Risk analysis servisini kullan
const riskService = new AlgorandRiskAnalysisService()

async function monitorPool(poolId: string) {
  try {
    const analysis = await riskService.analyzePoolRisk(poolId)

    console.log(`Pool ${poolId} Risk Analysis:`)
    console.log(`- Overall Risk: ${(analysis.riskScores.overallRisk * 100).toFixed(1)}%`)
    console.log(`- Liquidity Risk: ${(analysis.riskScores.liquidityRisk * 100).toFixed(1)}%`)
    console.log(`- Stability Risk: ${(analysis.riskScores.stabilityRisk * 100).toFixed(1)}%`)
    console.log(`- Data Quality: ${analysis.dataQuality}`)

    // Risk seviyesine göre aksiyon al
    if (analysis.riskScores.overallRisk > 0.7) {
      await sendHighRiskAlert(analysis)
    } else if (analysis.riskScores.overallRisk > 0.5) {
      await sendMediumRiskAlert(analysis)
    }

  } catch (error) {
    console.error(`Risk analysis failed for pool ${poolId}:`, error)
    await sendAnalysisErrorAlert(poolId, error)
  }
}

// Belirli havuzları monitor et
const monitoredPools = [
  'folks-finance-algo-usdc',
  'tinyman-algo-usdc',
  'pact-algo-usdc'
]

monitoredPools.forEach(poolId => {
  monitorPool(poolId)

  // Her 5 dakikada bir tekrar et
  setInterval(() => monitorPool(poolId), 300000)
})
```

---

## Performance Metrics

### 1. Response Time Analytics

```typescript
class PerformanceMonitor {
  private metrics = new Map<string, number[]>()

  recordResponseTime(api: string, responseTimeMs: number): void {
    const times = this.metrics.get(api) || []
    times.push(responseTimeMs)

    // Son 100 isteği tut
    if (times.length > 100) {
      times.shift()
    }

    this.metrics.set(api, times)
  }

  getPerformanceStats(api: string): PerformanceStats {
    const times = this.metrics.get(api) || []

    if (times.length === 0) {
      return { average: 0, p95: 0, p99: 0 }
    }

    const sorted = times.sort((a, b) => a - b)
    const average = times.reduce((sum, t) => sum + t, 0) / times.length
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const p99 = sorted[Math.floor(sorted.length * 0.99)]

    return { average, p95, p99 }
  }
}
```

### 2. Data Quality Metrics

```typescript
interface DataQualityMetrics {
  freshness: number      // Veri tazeliği (dakika)
  completeness: number   // Veri bütünlüğü (%)
  accuracy: number       // Doğruluk skoru
  sources: number        // Kullanılan veri kaynağı sayısı
}

function calculateDataQuality(analysis: ComprehensiveRiskAnalysis): DataQualityMetrics {
  const now = Date.now()
  const ageMinutes = (now - analysis.timestamp) / 60000

  return {
    freshness: Math.max(0, 10 - ageMinutes), // 10 dakika içinde taze
    completeness: analysis.dataSources.length / 4, // 4 kaynak tam olmalı
    accuracy: analysis.errors.length === 0 ? 1 : Math.max(0, 1 - analysis.errors.length * 0.2),
    sources: analysis.dataSources.length
  }
}
```

Bu API kullanım kılavuzu, test çıktılarından yola çıkarak gerçek dünya senaryolarında bu veri kaynaklarının nasıl kullanılacağını, nasıl optimize edileceğini ve nasıl güvenilir bir risk analizi sistemi kurulacağını detaylı bir şekilde açıklamaktadır.