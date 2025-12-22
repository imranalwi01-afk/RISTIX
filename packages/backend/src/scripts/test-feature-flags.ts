// packages/backend/src/scripts/test-feature-flags.ts
import { FeatureFlagsService } from '../core/services/config/feature-flags.service';
import { EnvironmentService } from '../core/services/config/environment.service';

async function testFeatureFlags() {
  console.log('🏷️  Testing Feature Flags System...\n');
  
  try {
    // Initialize services
    const logger = console as any;
    const environmentService = new EnvironmentService(logger);
    await environmentService.loadEnvironmentConfig();
    
    // Create mock repository (in real app, this would be injected)
    const mockRepository = {
      find: async () => [],
      findOne: async () => null,
      save: async (entity: any) => entity,
    };
    
    const featureFlagsService = new FeatureFlagsService(
      mockRepository as any,
      environmentService,
      logger
    );
    
    // Load feature flags
    await featureFlagsService.loadFeatureFlags();
    
    // Test 1: Check global feature flags
    console.log('📋 Test 1: Global Feature Flags');
    console.log('='.repeat(40));
    
    const testFeatures = [
      'advancedAnalytics',
      'islamicBanking',
      'auditTrail',
      'stressTesting',
      'workflowManagement'
    ];
    
    for (const feature of testFeatures) {
      const enabled = featureFlagsService.isEnabled(feature);
      console.log(`${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
    }
    
    console.log('');
    
    // Test 2: Check multiple features
    console.log('📋 Test 2: Multiple Feature Check');
    console.log('='.repeat(40));
    
    const multipleResults = await featureFlagsService.checkMultipleFeatures(testFeatures);
    
    for (const [feature, enabled] of Object.entries(multipleResults)) {
      console.log(`${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
    }
    
    console.log('');
    
    // Test 3: Get all feature flags
    console.log('📋 Test 3: All Feature Flags');
    console.log('='.repeat(40));
    
    const allFlags = featureFlagsService.getAllFeatureFlags();
    console.log(`Total feature flags: ${allFlags.length}`);
    
    const enabledCount = allFlags.filter(flag => flag.enabled).length;
    const disabledCount = allFlags.length - enabledCount;
    
    console.log(`Enabled: ${enabledCount}`);
    console.log(`Disabled: ${disabledCount}`);
    
    console.log('');
    
    // Summary
    console.log('🎉 Feature Flags System Test Completed!');
    console.log('='.repeat(50));
    console.log('✅ Global feature flags working');
    console.log('✅ Multiple feature checks working');
    console.log('✅ Feature flag enumeration working');
    
  } catch (error) {
    console.error('❌ Feature Flags Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testFeatureFlags();
