// Test service directly
import { ifrs9CalculationsService } from './packages/new-backend/src/services/ifrs9-calculations.service.js';

async function testService() {
    try {
        console.log('🧪 Testing getBatchResults service directly...');
        
        const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
        const processDate = '2026-01-26';
        
        const result = await ifrs9CalculationsService.getBatchResults(tenantId, processDate);
        console.log('📊 Service result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ Service error:', error);
    }
}

testService();
