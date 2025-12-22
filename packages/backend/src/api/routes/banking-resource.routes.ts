// packages/backend/src/api/routes/banking-resource.routes.ts
// ============================================================================
// MINIMAL Banking Resource Routes - Testing module loading
// ============================================================================

import { Router } from 'express';

const router = Router();

console.log('🔧 Banking Resource Routes: Creating minimal test router');

// Simple test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Banking Resource routes working - minimal test version',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Banking Resource Routes: Minimal router created successfully');

export default router;