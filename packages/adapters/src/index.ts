export * from "@shared/core";
export { adapterManager, AdapterManager } from "./adapter-manager";
export { DefiLlamaAdapter } from "./protocols/defillama";

// Advanced adapter for comprehensive detail pages
export { AdvancedAdapter, advancedAdapter } from "./adapters/advanced";

// Analytics engine for advanced calculations
export { AnalyticsEngine, analyticsEngine } from "./analytics/engine";

// Performance optimization utilities
export {
  PerformanceOptimizer,
  performanceOptimizer,
  memoize,
  createDataFetcher
} from "./utils/performance";

// Error handling utilities
export {
  ErrorHandler,
  errorHandler,
  ErrorType,
  ErrorSeverity,
  withErrorHandling,
  createSafeFunction
} from "./utils/error-handling";

// Historical data services
export {
  ApiConfigService,
  ApiConfig,
  HistoricalDataConfig,
  apiConfigService,
  BitqueryService,
  VolumeData,
  BitqueryResponse,
  bitqueryService,
  DAppRadarService,
  UserMetrics,
  DAppRadarResponse,
  dappradarService,
  HistoricalDataService,
  historicalDataService,
  HistoricalData,
} from "./services/historical";

// Cache services
export {
  CacheService,
  CacheStats,
  CacheConfig,
  cacheService,
  BackgroundSyncService,
  SyncConfig,
  SyncStats,
  backgroundSyncService,
  CacheKeys,
  CACHE_PRESETS,
  CacheUtils,
} from "./cache";

// Risk management system
export {
  RiskManager,
  RiskMonitoringService,
  APIReliabilityManager,
  FinancialRiskAnalyzer,
  SecurityManager,
  createRiskManager,
  createStandaloneRiskAnalyzer,
  createStandaloneSecurityManager,
  calculateRiskScore,
  categorizeRisk,
  generateRiskRecommendations,
  type RiskManagementConfig,
  type SystemRiskData,
  type RiskMonitoringConfig,
  type DataAdapter,
  type DataAggregationStrategy,
  type SecurityConfig,
} from "./risk";