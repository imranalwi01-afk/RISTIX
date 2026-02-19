// Test staging summary specifically
console.log('=== Testing Staging Summary ===');

const { individualImpairmentController } = await import('./src/controllers/individual-impairment.controller.js');

// Mock context
const mockContext = {
  get: (key) => {
    if (key === 'tenantId') return 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
    return null;
  },
  json: (data) => {
    console.log('Controller response:', JSON.stringify(data, null, 2));
    return data;
  }
};

try {
  console.log('Testing controller.getStagingSummary...');
  const result = await individualImpairmentController.getStagingSummary(mockContext);
  console.log('Controller result type:', typeof result);
  console.log('Controller result:', result);
} catch (error) {
  console.error('Controller error:', error.message);
  console.error('Controller stack:', error.stack);
}
