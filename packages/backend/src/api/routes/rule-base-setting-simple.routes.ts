// packages/backend/src/api/routes/rule-base-setting-simple.routes.ts
// ============================================================================
// SIMPLE RULE BASE SETTING ROUTES - FOR TESTING STANDARDIZATION
// ============================================================================

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';

const router = Router();

/**
 * Simple test endpoint for rule base setting
 */
router.get('/test', requireAuth, async (req, res) => {
  try {
    console.log('✅ Rule Base Setting test endpoint accessed');

    res.json({
      success: true,
      message: 'Rule Base Setting service is working',
      data: {
        service: 'Rule Base Setting',
        status: 'operational',
        timestamp: new Date().toISOString(),
        standardization: 'Phase 2 - Business Logic Standardization Complete'
      }
    });
  } catch (error: any) {
    console.error('❌ Rule Base Setting test error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      message: error.message
    });
  }
});

/**
 * Simple metadata endpoint for rule types
 */
router.get('/metadata/rule-types', requireAuth, async (req, res) => {
  try {
    console.log('✅ Rule Base Setting metadata accessed');

    res.json({
      success: true,
      data: [
        { value: 'ECL_CALCULATION', label: 'ECL Calculation' },
        { value: 'STAGING_TRANSITION', label: 'Staging Transition' },
        { value: 'PROVISION_ADJUSTMENT', label: 'Provision Adjustment' },
        { value: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
        { value: 'COLLATERAL_VALUATION', label: 'Collateral Valuation' }
      ],
      message: 'Rule types retrieved successfully'
    });
  } catch (error: any) {
    console.error('❌ Rule Base Setting metadata error:', error);
    res.status(500).json({
      success: false,
      error: 'Metadata endpoint failed',
      message: error.message
    });
  }
});

export default router;