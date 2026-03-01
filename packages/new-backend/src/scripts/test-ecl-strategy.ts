
import { EclEngineFactory } from '../services/ecl-engines/ecl-engine-factory';

async function testEngineSwitching() {
    console.log('🧪 Testing ECL Engine Switching...\n');

    // Test R_ANALYTICS (Default)
    process.env.ECL_ENGINE_TYPE = 'R_ANALYTICS';
    const engineR = EclEngineFactory.getEngine();
    console.log(`1. Engine type for R_ANALYTICS: ${engineR.constructor.name}`);

    // Test TYPESCRIPT
    process.env.ECL_ENGINE_TYPE = 'TYPESCRIPT';
    const engineTS = EclEngineFactory.getEngine();
    console.log(`2. Engine type for TYPESCRIPT: ${engineTS.constructor.name}`);

    console.log('\n✅ Engine switching test completed.');
}

async function testRCalculation() {
    console.log('\n📡 Testing REclEngine (calling actual R service)...');

    // Note: This requires the R service to be running
    const engine = EclEngineFactory.getEngine(); // Should be TS if we don't reset, but we'll force R
    process.env.ECL_ENGINE_TYPE = 'R_ANALYTICS';
    const rEngine = EclEngineFactory.getEngine();

    const result = await rEngine.calculate({
        tenantId: 'iaf',
        processDate: '2024-01-31', // Example date
        parameters: {
            pdMethod: 'historical',
            lgdMethod: 'historical',
            eadMethod: 'current'
        }
    });

    console.log('Result:', JSON.stringify(result, null, 2));
}

// Run tests
const main = async () => {
    await testEngineSwitching();
    // await testRCalculation(); // Uncomment to test actual R call if service is up
};

main().catch(console.error);
