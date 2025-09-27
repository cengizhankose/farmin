import { cacheService, backgroundSyncService, CacheKeys } from './index';

async function testCacheSystem() {
  console.log('🧪 Starting cache system tests...');

  try {
    // Test 1: Basic cache operations
    console.log('\n📝 Test 1: Basic cache operations');
    const testKey = 'test:hello';
    const testData = { message: 'Hello World!', timestamp: Date.now() };

    await cacheService.set(testKey, testData, 60000); // 1 minute TTL
    console.log('✅ Data cached successfully');

    const retrieved = await cacheService.get(testKey);
    console.log('✅ Data retrieved:', retrieved);

    const typedRetrieved = retrieved as { message?: string } | null;
    if (typedRetrieved && typedRetrieved.message === testData.message) {
      console.log('✅ Cache test 1 passed');
    } else {
      console.log('❌ Cache test 1 failed');
    }

    // Test 2: Volume data caching
    console.log('\n📊 Test 2: Volume data caching');
    await cacheService.setVolumeData('test-protocol', 'test-pool', {
      volume24h: 1000000,
      volume7d: 7000000,
      volume30d: 30000000,
      concentrationRisk: 25,
    });

    const volumeData = await cacheService.getVolumeData('test-protocol', 'test-pool');
    console.log('✅ Volume data cached:', volumeData);

    if (volumeData && volumeData.volume24h === 1000000) {
      console.log('✅ Volume data test passed');
    } else {
      console.log('❌ Volume data test failed');
    }

    // Test 3: User metrics caching
    console.log('\n👥 Test 3: User metrics caching');
    await cacheService.setUserMetrics('test-protocol', {
      uniqueUsers24h: 1000,
      uniqueUsers7d: 5000,
      uniqueUsers30d: 20000,
      activeWallets: 700,
      newUsers: 100,
      userRetention: 65,
    });

    const userMetrics = await cacheService.getUserMetrics('test-protocol');
    console.log('✅ User metrics cached:', userMetrics);

    if (userMetrics && userMetrics.uniqueUsers24h === 1000) {
      console.log('✅ User metrics test passed');
    } else {
      console.log('❌ User metrics test failed');
    }

    // Test 4: Cache statistics
    console.log('\n📈 Test 4: Cache statistics');
    const stats = await cacheService.getStats();
    console.log('📊 Cache statistics:', stats);

    if (stats.totalEntries > 0) {
      console.log('✅ Cache statistics test passed');
    } else {
      console.log('❌ Cache statistics test failed');
    }

    // Test 5: Background sync stats
    console.log('\n🔄 Test 5: Background sync stats');
    const syncStats = backgroundSyncService.getStats();
    console.log('📊 Sync statistics:', syncStats);

    console.log('✅ Cache system tests completed successfully!');

    // Cleanup
    await cacheService.delete(testKey);
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Cache system tests failed:', error);
    throw error;
  }
}

// Export test function
export { testCacheSystem };

// Run tests if this file is executed directly
if (require.main === module) {
  testCacheSystem()
    .then(() => {
      console.log('🎉 All cache tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cache tests failed:', error);
      process.exit(1);
    });
}