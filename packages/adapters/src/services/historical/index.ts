export { ApiConfigService, ApiConfig, HistoricalDataConfig, apiConfigService } from './config';
export {
  BitqueryService,
  VolumeData,
  BitqueryResponse,
  bitqueryService
} from './bitquery';
export {
  DAppRadarService,
  UserMetrics,
  DAppRadarResponse,
  dappradarService
} from './dappradar';

export interface HistoricalData {
  volume24h?: number;
  volume7d?: number;
  volume30d?: number;
  uniqueUsers24h?: number;
  uniqueUsers7d?: number;
  uniqueUsers30d?: number;
  concentrationRisk?: number;
  userRetention?: number;
  timestamp: number;
}

export class HistoricalDataService {
  async enrichOpportunityWithHistoricalData(opportunity: any): Promise<any> {
    const protocol = opportunity.protocol.toLowerCase();

    try {
      // Fetch volume data from Bitquery
      const volumeData = await import('./bitquery').then(m =>
        m.bitqueryService.getProtocolVolumeData(protocol, 30)
      );

      // Fetch user metrics from DAppRadar
      const userMetrics = await import('./dappradar').then(m =>
        m.dappradarService.getProtocolUserMetrics(protocol)
      );

      return {
        ...opportunity,
        volume24h: volumeData.volume24h,
        volume7d: volumeData.volume7d,
        volume30d: volumeData.volume30d,
        uniqueUsers24h: userMetrics.uniqueUsers24h,
        uniqueUsers7d: userMetrics.uniqueUsers7d,
        uniqueUsers30d: userMetrics.uniqueUsers30d,
        concentrationRisk: volumeData.concentrationRisk,
        userRetention: userMetrics.userRetention,
      };
    } catch (error) {
      console.warn(`Failed to enrich ${opportunity.id} with historical data:`, error);
      return opportunity;
    }
  }

  async getAlgorandHistoricalData() {
    try {
      const [volumeData, userMetrics] = await Promise.all([
        import('./bitquery').then(m => m.bitqueryService.getAlgorandDefiVolume()),
        import('./dappradar').then(m => m.dappradarService.getAlgorandDefiMetrics()),
      ]);

      return {
        volume: volumeData,
        users: userMetrics,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch Algorand historical data:', error);
      throw error;
    }
  }
}

export const historicalDataService = new HistoricalDataService();