// packages/backend/src/api/routes/ifrs9.routes.ts
// ============================================================================
// 🩹 ENHANCED: Dashboard endpoints with REAL database integration
// ============================================================================
// ✅ PRESERVED: All your existing IFRS9 routes structure
// ✅ REPLACED: Mock data with real database queries from frs9_master_account
// ✅ FIXED: Authentication middleware for dashboard calls
// ============================================================================

import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import DashboardController from '../controllers/dashboard.controller';

const router = Router();

// Apply authentication individually to routes
// Note: Removed global authentication to match auth routes pattern

// ==========================================
// 🚀 REAL DATABASE ENDPOINTS - Dashboard Data
// ==========================================

// ✅ REAL: GET /api/v1/ifrs9/calculations/summary (from frs9_master_account)
router.get('/calculations/summary', authenticateToken, DashboardController.getCalculationsSummary as RequestHandler);

// ✅ REAL: GET /api/v1/ifrs9/calculations/portfolio-trend (historical trend)
router.get('/calculations/portfolio-trend', authenticateToken, DashboardController.getPortfolioTrend as RequestHandler);

// ✅ REAL: GET /api/v1/ifrs9/portfolio/summary (portfolio metrics)
router.get('/portfolio/summary', authenticateToken, DashboardController.getPortfolioMetrics as RequestHandler);

// ✅ REAL: GET /api/v1/ifrs9/activities/recent (recent calculation activities)
router.get('/activities/recent', authenticateToken, DashboardController.getRecentActivities as RequestHandler);

// ==========================================
// SERVICE INFO - Root endpoint (EXISTING PRESERVED)
// ==========================================
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IFRS 9 Calculation Service',
    version: '2.0.0',
    description: 'Expected Credit Loss calculation and portfolio analysis service',
    timestamp: new Date().toISOString(),
    
    endpoints: {
      service_info: 'GET /ifrs9',
      
      // ✅ NEW: Dashboard endpoints
      calculations_summary: 'GET /ifrs9/calculations/summary',
      portfolio_summary: 'GET /ifrs9/portfolio/summary',
      recent_activities: 'GET /ifrs9/activities/recent',
      
      // Existing calculation endpoints
      ecl_calculation: 'POST /ifrs9/calculations/ecl',
      calculation_batches: 'GET /ifrs9/calculation-batches',
      staging_analyze: 'POST /ifrs9/staging/analyze',
      pd_calculate: 'POST /ifrs9/pd/calculate',
      lgd_calculate: 'POST /ifrs9/lgd/calculate',
      ead_compute: 'POST /ifrs9/ead/compute'
    },
    
    calculation_features: {
      stage_classification: 'Automatic IFRS 9 staging (Stage 1, 2, 3)',
      ecl_calculation: 'Expected Credit Loss computation',
      pd_modeling: 'Probability of Default modeling',
      lgd_estimation: 'Loss Given Default estimation',
      ead_computation: 'Exposure at Default computation',
      scenario_analysis: 'Forward-looking scenario analysis',
      portfolio_monitoring: 'Real-time portfolio risk monitoring'
    }
  });
});

// ==========================================
// ALL YOUR EXISTING CALCULATION ROUTES (PRESERVED)
// ==========================================

// ECL Calculation endpoints
router.post('/calculations/ecl', async (req, res) => {
  try {
    console.log('🧮 ECL calculation requested');
    
    // Mock ECL calculation response (replace with real calculation engine)
    const result = {
      calculationId: `ECL_${Date.now()}`,
      portfolioId: req.body.portfolioId,
      totalECL: 2500000000,
      stage1ECL: 1200000000,
      stage2ECL: 800000000,
      stage3ECL: 500000000,
      calculationDate: new Date().toISOString(),
      status: 'completed'
    };

    res.json({
      success: true,
      message: 'ECL calculation completed successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ ECL calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'ECL calculation failed',
      code: 'ECL_CALCULATION_ERROR'
    });
  }
});

router.get('/calculation-batches', async (req, res) => {
  try {
    console.log('📊 Calculation batches requested');
    
    const batches = [
      {
        batchId: 'BATCH_001',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        portfolioCount: 1250,
        totalECL: 2500000000
      },
      {
        batchId: 'BATCH_002',
        status: 'running',
        createdAt: new Date().toISOString(),
        portfolioCount: 850,
        totalECL: null
      }
    ];

    res.json({ success: true, data: batches });
  } catch (error) {
    console.error('❌ Calculation batches error:', error);
    res.status(500).json({ success: false, error: 'Failed to get calculation batches' });
  }
});

router.post('/staging/analyze', async (req, res) => {
  try {
    console.log('🔍 Staging analysis requested');
    
    const analysis = {
      analysisId: `STAGE_${Date.now()}`,
      portfolioId: req.body.portfolioId,
      stagingResults: {
        stage1: { count: 8520, percentage: 85.2 },
        stage2: { count: 980, percentage: 9.8 },
        stage3: { count: 500, percentage: 5.0 }
      },
      significantIncreaseFlags: 125,
      analysisDate: new Date().toISOString()
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('❌ Staging analysis error:', error);
    res.status(500).json({ success: false, error: 'Staging analysis failed' });
  }
});

router.post('/pd/calculate', async (req, res) => {
  try {
    console.log('📈 PD calculation requested');
    
    const pdResult = {
      calculationId: `PD_${Date.now()}`,
      portfolioId: req.body.portfolioId,
      averagePD: 0.025,
      pdByStage: {
        stage1: 0.008,
        stage2: 0.045,
        stage3: 0.850
      },
      modelVersion: 'PD_MODEL_v2.1',
      calculationDate: new Date().toISOString()
    };

    res.json({ success: true, data: pdResult });
  } catch (error) {
    console.error('❌ PD calculation error:', error);
    res.status(500).json({ success: false, error: 'PD calculation failed' });
  }
});

router.post('/lgd/calculate', async (req, res) => {
  try {
    console.log('📉 LGD calculation requested');
    
    const lgdResult = {
      calculationId: `LGD_${Date.now()}`,
      portfolioId: req.body.portfolioId,
      averageLGD: 0.45,
      lgdByProductType: {
        mortgage: 0.25,
        creditCard: 0.75,
        commercial: 0.40,
        islamic: 0.35
      },
      modelVersion: 'LGD_MODEL_v1.8',
      calculationDate: new Date().toISOString()
    };

    res.json({ success: true, data: lgdResult });
  } catch (error) {
    console.error('❌ LGD calculation error:', error);
    res.status(500).json({ success: false, error: 'LGD calculation failed' });
  }
});

router.post('/ead/compute', async (req, res) => {
  try {
    console.log('💰 EAD computation requested');
    
    const eadResult = {
      computationId: `EAD_${Date.now()}`,
      portfolioId: req.body.portfolioId,
      totalEAD: 47500000000,
      eadByStage: {
        stage1: 42000000000,
        stage2: 4500000000,
        stage3: 1000000000
      },
      ccfApplied: true,
      computationDate: new Date().toISOString()
    };

    res.json({ success: true, data: eadResult });
  } catch (error) {
    console.error('❌ EAD computation error:', error);
    res.status(500).json({ success: false, error: 'EAD computation failed' });
  }
});

// ==========================================
// ERROR HANDLING (EXISTING)
// ==========================================

/**
 * Handle any unmatched IFRS9 routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'IFRS9 endpoint not found',
    code: 'IFRS9_ENDPOINT_NOT_FOUND',
    details: {
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    },
    available_endpoints: {
      service_info: 'GET /api/v1/ifrs9',
      calculations_summary: 'GET /api/v1/ifrs9/calculations/summary', // ✅ NEW
      portfolio_summary: 'GET /api/v1/ifrs9/portfolio/summary', // ✅ NEW
      recent_activities: 'GET /api/v1/ifrs9/activities/recent', // ✅ NEW
      ecl_calculation: 'POST /api/v1/ifrs9/calculations/ecl',
      calculation_batches: 'GET /api/v1/ifrs9/calculation-batches',
      staging_analyze: 'POST /api/v1/ifrs9/staging/analyze',
      pd_calculate: 'POST /api/v1/ifrs9/pd/calculate',
      lgd_calculate: 'POST /api/v1/ifrs9/lgd/calculate',
      ead_compute: 'POST /api/v1/ifrs9/ead/compute'
    }
  });
});

// ==========================================
// 🚨 NEW: Missing IFRS9 Impairment and Amortization Routes
// ==========================================

// ✅ NEW: GET /api/v1/ifrs9/impairment - IFRS9 Impairment Module
router.get('/impairment', async (req, res) => {
  try {
    const user = (req as any).user;
    const tenantId = user?.tenantId || 'iaf';

    console.log('🩹 IFRS9 Impairment module accessed for tenant:', tenantId);

    // Mock impairment data (replace with real impairment calculation engine)
    const impairmentData = {
      success: true,
      data: {
        totalImpairment: 4500000000,
        stage1Impairment: 1800000000,
        stage2Impairment: 1500000000,
        stage3Impairment: 1200000000,
        impairmentRatio: 2.8,
        currency: 'IDR',
        lastCalculationDate: new Date().toISOString(),
        calculationMethod: 'Standardized Approach',
        riskWeightedAssets: 160000000000
      },
      meta: {
        module: 'IFRS9 Impairment',
        description: 'Individual and Collective Impairment Assessment',
        tenant: tenantId,
        timestamp: new Date().toISOString()
      }
    };

    res.json(impairmentData);
  } catch (error) {
    console.error('❌ Impairment module error:', error);
    res.status(500).json({
      success: false,
      error: 'Impairment calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ NEW: GET /api/v1/ifrs9/amortization - IFRS9 Amortization Module
router.get('/amortization', async (req, res) => {
  try {
    const user = (req as any).user;
    const tenantId = user?.tenantId || 'iaf';

    console.log('📊 IFRS9 Amortization module accessed for tenant:', tenantId);

    // Mock amortization data (replace with real amortization calculation engine)
    const amortizationData = {
      success: true,
      data: {
        totalAmortizedAmount: 8500000000,
        effectiveInterestRate: 8.5,
        originalCarryingAmount: 10000000000,
        unamortizedDiscount: 1500000000,
        grossCarryingAmount: 8500000000,
        amortizationMethod: 'EIR (Effective Interest Rate)',
        currency: 'IDR',
        lastCalculationDate: new Date().toISOString(),
        contractType: 'Fixed Rate'
      },
      meta: {
        module: 'IFRS9 Amortization',
        description: 'EIR and Amortized Cost Calculation',
        tenant: tenantId,
        timestamp: new Date().toISOString()
      }
    };

    res.json(amortizationData);
  } catch (error) {
    console.error('❌ Amortization module error:', error);
    res.status(500).json({
      success: false,
      error: 'Amortization calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

console.log('✅ Enhanced IFRS9 calculation routes module loaded successfully');
export default router;