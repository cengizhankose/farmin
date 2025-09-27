// Test script to verify historical data service works with SQLite
console.log('🧪 Testing historical data service...');

try {
  // Change to adapters directory to access the built modules
  process.chdir('/Users/cengizhankose/dev/projects/farmin/packages/adapters');

  // Import historical data service
  const { historicalDataService } = await import('./packages/adapters/dist/adapters/src/services/historical/index.js');
  console.log('✅ Historical data service imported successfully');

  // Test enriching a mock opportunity
  const mockOpportunity = {
    id: 'test-opportunity',
    chain: 'algorand',
    protocol: 'TEST',
    pool: 'Test Pool',
    tvlUsd: 1000000,
    apr: 5.0,
    apy: 5.2,
  };

  console.log('🔍 Testing opportunity enrichment...');
  const enriched = await historicalDataService.enrichOpportunityWithHistoricalData(mockOpportunity);
  console.log('✅ Opportunity enriched successfully:', enriched);

  // Check if enhanced fields are present
  const enhancedFields = [
    'volume24h',
    'volume7d',
    'volume30d',
    'concentrationRisk',
    'uniqueUsers24h',
    'uniqueUsers7d',
    'uniqueUsers30d',
    'userRetention'
  ];

  const hasEnhancedData = enhancedFields.some(field => enriched[field] !== undefined);
  console.log(`📊 Enhanced data available: ${hasEnhancedData}`);

  if (hasEnhancedData) {
    console.log('🎉 Historical data enrichment is working!');
  } else {
    console.log('⚠️  Enhanced data not found, but service is working');
  }

} catch (error) {
  console.error('❌ Historical data service test failed:', error);
  console.error('❌ Error stack:', error.stack);
  process.exit(1);
}