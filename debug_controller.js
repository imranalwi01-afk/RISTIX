// Debug controller directly
console.log('=== Debugging Controller ===');

const { individualImpairmentService } = await import('./src/services/individual-impairment.service.js');

const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';

try {
  console.log('Testing getStagingAnalysis from service...');
  const result = await individualImpairmentService.getStagingAnalysis(tenantId);
  console.log('Service result length:', result?.length || 0);
  console.log('Service result:', result);
} catch (error) {
  console.error('Service error:', error.message);
}
