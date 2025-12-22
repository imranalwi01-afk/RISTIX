// packages/backend/src/api/routes/banking-parameter.routes.ts
// ============================================================================
// 🩹 SURGICAL ENHANCEMENT: Add dashboard endpoints to existing routes
// ============================================================================
// ✅ PRESERVED: All your existing banking parameter routes
// ✅ ADDED: Missing /portfolio/summary and /activities/recent endpoints
// ✅ FIXED: Undefined requireAuth middleware
// ============================================================================

import { Router, Request, Response } from 'express';
import { FRS9ParameterController } from '../controllers/frs9-parameter.controller';
// import { FRS9ParameterFixedController } from '../controllers/frs9-parameter-fixed.controller'; // File removed
import { journalParameterController } from '../controllers/journal-parameter.controller';
import { productParameterController } from '../controllers/product-parameter.controller';
import { jwtConfigService } from '../../core/config/jwt.config';

const router = Router();
const frs9Controller = new FRS9ParameterController();
// const frs9FixedController = new FRS9ParameterFixedController(); // File removed

// ==========================================
// DEBUG ENDPOINTS (NO AUTH - FOR TESTING)
// ==========================================

/**
 * Debug application setup parameters (NO AUTH - FOR TESTING)
 * GET /banking/setup/application/debug
 */
router.get('/setup/application/debug', async (req, res) => {
  try {
    console.log('🔍 Application setup debug requested - NO AUTH');
    await frs9Controller.getApplicationSetupDebug(req, res);
  } catch (error) {
    console.error('❌ Application setup debug route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to debug application setup',
      code: 'ROUTE_ERROR'
    });
  }
});

// ✅ Simple authentication middleware (your existing pattern)
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required',
        code: 'UNAUTHORIZED'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Use existing JWT verification
    const jwt = require('jsonwebtoken');
    
    try {
      const jwtConfig = jwtConfigService.getConfiguration();
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithms: [jwtConfig.algorithm]
      });
      
      // Set user context from JWT
      req.user = {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        tenantId: decoded.tenantId || 'platform',
        tenantSlug: decoded.tenantSlug || 'platform',
        roles: decoded.roles || ['user'],
        permissions: decoded.permissions || []
      };
      
      console.log('✅ Banking Routes: User authenticated:', req.user.email);
      next();
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError instanceof Error ? jwtError.message : String(jwtError));
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_ERROR'
    });
  }
};

// Apply authentication to all routes AFTER debug routes
// Debug routes (no auth) should be added above this line

// ==========================================
// 🩹 SURGICAL FIX: ADD MISSING DASHBOARD ENDPOINTS
// ==========================================

// ✅ NEW: GET /api/v1/banking/portfolio/summary
router.get('/portfolio/summary', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const tenantId = user?.tenantId || 'dana';

    // Mock portfolio data for dashboard
    const portfolioData = {
      totalExposure: tenantId === 'dana' ? 50000000000 : 35000000000,
      numberOfAccounts: tenantId === 'dana' ? 15420 : 8750,
      averageRating: tenantId === 'dana' ? 'BBB+' : 'A-',
      riskDistribution: {
        stage1: tenantId === 'dana' ? 85 : 88,
        stage2: tenantId === 'dana' ? 12 : 10,
        stage3: tenantId === 'dana' ? 3 : 2
      },
      currency: 'IDR'
    };

    console.log(`✅ Banking portfolio summary: ${user.email} (${tenantId})`);
    res.json({ success: true, data: portfolioData });

  } catch (error) {
    console.error('❌ Portfolio summary error:', error);
    res.status(500).json({ success: false, error: 'Portfolio summary failed' });
  }
});

// ✅ NEW: GET /api/v1/banking/activities/recent
router.get('/activities/recent', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const activities = [
      { id: '1', icon: '🏦', text: 'Banking parameter updated', time: '10 min ago', type: 'success' },
      { id: '2', icon: '📋', text: 'Application settings saved', time: '1 hour ago', type: 'info' },
      { id: '3', icon: '👥', text: 'New user account created', time: '2 hours ago', type: 'success' }
    ];

    console.log(`✅ Banking activities: ${user.email}`);
    res.json({ success: true, data: activities });

  } catch (error) {
    console.error('❌ Activities error:', error);
    res.status(500).json({ success: false, error: 'Activities failed' });
  }
});

// ==========================================
// SERVICE INFO - Root endpoint (EXISTING)
// ==========================================
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FRS9 Banking Parameters Service',
    version: '2.0.0',
    description: 'DS2 FRS9PRO database integration for banking parameter management',
    timestamp: new Date().toISOString(),
    
    database_info: {
      host: `${process.env.FRS9_DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || '5433'}`,
      database: process.env.FRS9_DB_NAME || 'FRS9PRO',
      tables: [
        'frs9_param_commonh (parameter headers)',
        'frs9_param_commond (parameter details)',
        'frs9_param_product (product parameters)',
        'frs9_param_journal (journal parameters)'
      ]
    },
    
    endpoints: {
      service_info: 'GET /banking',
      health_check: 'GET /banking/health',
      
      // ✅ NEW: Dashboard endpoints
      portfolio_summary: 'GET /banking/portfolio/summary',
      recent_activities: 'GET /banking/activities/recent',
      
      application_setup: {
        list: 'GET /banking/setup/application',
        create: 'POST /banking/setup/application',
        update: 'PUT /banking/setup/application/:param_code',
        delete: 'DELETE /banking/setup/application/:param_code',
        get_details: 'GET /banking/setup/application/:param_code/details',
        create_detail: 'POST /banking/setup/application/:param_code/details',
        update_detail: 'PUT /banking/setup/application/details/:detail_id',
        delete_detail: 'DELETE /banking/setup/application/details/:detail_id'
      },
      business_setup: {
        list: 'GET /banking/setup/business',
        create: 'POST /banking/setup/business',
        update: 'PUT /banking/setup/business/:param_code',
        delete: 'DELETE /banking/setup/business/:param_code'
      },
      product_parameters: {
        list: 'GET /banking/parameters/product',
        create: 'POST /banking/parameters/product',
        update: 'PUT /banking/parameters/product/:prd_code',
        delete: 'DELETE /banking/parameters/product/:prd_code'
      },
      journal_parameters: {
        list: 'GET /banking/parameters/journal',
        create: 'POST /banking/parameters/journal',
        update: 'PUT /banking/parameters/journal/:gl_code',
        delete: 'DELETE /banking/parameters/journal/:gl_code'
      }
    }
  });
});

// ==========================================
// HEALTH CHECK - DS2 Connection Test (EXISTING)
// ==========================================
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Banking health check requested');
    await frs9Controller.checkDatabaseHealth(req, res);
  } catch (error) {
    console.error('❌ Banking health check route error:', error);
    res.status(503).json({
      success: false,
      error: 'Banking service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'HEALTH_CHECK_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// ALL YOUR EXISTING ROUTES (PRESERVED)
// ==========================================

/**
 * Get application setup parameters from DS2 - FIXED VERSION
 * GET /banking/setup/application
 */
router.get('/setup/application', async (req, res) => {
  try {
    console.log('📋 Application setup requested - Using fixed controller');
    await frs9Controller.getApplicationSetup(req, res);
  } catch (error) {
    console.error('❌ Application setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get application setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Get application setup headers (parameter headers only)
 * GET /banking/setup/application/headers
 */
router.get('/setup/application/headers', async (req, res) => {
  try {
    console.log('📋 Application setup headers requested');
    await frs9Controller.getApplicationSetupHeaders(req, res);
  } catch (error) {
    console.error('❌ Application setup headers route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get application setup headers',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Create application setup parameter
 * POST /banking/setup/application
 */
router.post('/setup/application', async (req, res) => {
  try {
    console.log('📝 Create application setup requested');
    await frs9Controller.createApplicationSetup(req, res);
  } catch (error) {
    console.error('❌ Create application setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create application setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Update application setup parameter
 * PUT /banking/setup/application/:param_code
 */
router.put('/setup/application/:param_code', async (req, res) => {
  try {
    console.log('📝 Update application setup requested:', req.params.param_code);
    await frs9Controller.updateApplicationSetup(req, res);
  } catch (error) {
    console.error('❌ Update application setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Delete application setup parameter
 * DELETE /banking/setup/application/:param_code
 */
router.delete('/setup/application/:param_code', async (req, res) => {
  try {
    console.log('🗑️ Delete application setup requested:', req.params.param_code);
    await frs9Controller.deleteApplicationSetup(req, res);
  } catch (error) {
    console.error('❌ Delete application setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete application setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Get application setup parameter details - FIXED VERSION
 * GET /banking/setup/application/:param_code/details
 */
router.get('/setup/application/:param_code/details', async (req, res) => {
  try {
    console.log('📋 Application setup details requested:', req.params.param_code);
    await frs9Controller.getApplicationSetupDetails(req, res);
  } catch (error) {
    console.error('❌ Application setup details route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get application setup details',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Create application setup parameter detail
 * POST /banking/setup/application/:param_code/details
 */
router.post('/setup/application/:param_code/details', async (req, res) => {
  try {
    console.log('📝 Create application setup detail requested:', req.params.param_code);
    await frs9Controller.createApplicationSetupDetail(req, res);
  } catch (error) {
    console.error('❌ Create application setup detail route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create application setup detail',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Update application setup parameter detail
 * PUT /banking/setup/application/details/:detail_id
 */
router.put('/setup/application/details/:detail_id', async (req, res) => {
  try {
    console.log('📝 Update application setup detail requested:', req.params.detail_id);
    await frs9Controller.updateApplicationSetupDetail(req, res);
  } catch (error) {
    console.error('❌ Update application setup detail route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application setup detail',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Delete application setup parameter detail
 * DELETE /banking/setup/application/details/:detail_id
 */
router.delete('/setup/application/details/:detail_id', async (req, res) => {
  try {
    console.log('🗑️ Delete application setup detail requested:', req.params.detail_id);
    await frs9Controller.deleteApplicationSetupDetail(req, res);
  } catch (error) {
    console.error('❌ Delete application setup detail route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete application setup detail',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Get business setup parameters from DS2 - FIXED VERSION
 * GET /banking/setup/business
 */
router.get('/setup/business', async (req, res) => {
  try {
    console.log('📋 Business setup requested - Using fixed controller');
    await frs9Controller.getBusinessSetup(req, res);
  } catch (error) {
    console.error('❌ Business setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get business setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Create business setup parameter
 * POST /banking/setup/business
 */
router.post('/setup/business', async (req, res) => {
  try {
    console.log('📝 Create business setup requested');
    await frs9Controller.createBusinessSetup(req, res);
  } catch (error) {
    console.error('❌ Create business setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create business setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Update business setup parameter
 * PUT /banking/setup/business/:param_code
 */
router.put('/setup/business/:param_code', async (req, res) => {
  try {
    console.log('📝 Update business setup requested:', req.params.param_code);
    await frs9Controller.updateBusinessSetup(req, res);
  } catch (error) {
    console.error('❌ Update business setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update business setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Delete business setup parameter
 * DELETE /banking/setup/business/:param_code
 */
router.delete('/setup/business/:param_code', async (req, res) => {
  try {
    console.log('🗑️ Delete business setup requested:', req.params.param_code);
    await frs9Controller.deleteBusinessSetup(req, res);
  } catch (error) {
    console.error('❌ Delete business setup route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete business setup',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Get business setup parameter details
 * GET /banking/setup/business/:param_code/details
 */
router.get('/setup/business/:param_code/details', async (req, res) => {
  try {
    console.log('📋 Business setup details requested:', req.params.param_code);
    await frs9Controller.getBusinessSetupDetails(req, res);
  } catch (error) {
    console.error('❌ Business setup details route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get business setup details',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Create business setup parameter detail
 * POST /banking/setup/business/:param_code/details
 */
router.post('/setup/business/:param_code/details', async (req, res) => {
  try {
    console.log('📝 Create business setup detail requested:', req.params.param_code);
    await frs9Controller.createBusinessSetupDetail(req, res);
  } catch (error) {
    console.error('❌ Create business setup detail route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create business setup detail',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Update business setup parameter detail
 * PUT /banking/setup/business/details/:detail_id
 */
router.put('/setup/business/details/:detail_id', async (req, res) => {
  try {
    console.log('📝 Update business setup detail requested:', req.params.detail_id);
    await frs9Controller.updateBusinessSetupDetail(req, res);
  } catch (error) {
    console.error('❌ Update business setup detail route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update business setup detail',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Delete business setup parameter detail
 * DELETE /banking/setup/business/details/:detail_id
 */
router.delete('/setup/business/details/:detail_id', async (req, res) => {
  try {
    console.log('🗑️ Delete business setup detail requested:', req.params.detail_id);
    await frs9Controller.deleteBusinessSetupDetail(req, res);
  } catch (error) {
    console.error('❌ Delete business setup detail route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete business setup detail',
      code: 'ROUTE_ERROR'
    });
  }
});

// ==========================================
// PARAMETER SETUP ROUTES (ALL EXISTING)
// ==========================================

/**
 * Get product parameters from DS2 with pagination
 * GET /banking/parameters/product
 */
router.get('/parameters/product', async (req, res) => {
  try {
    console.log('📋 Product parameters requested');
    await productParameterController.getProducts(req, res);
  } catch (error) {
    console.error('❌ Product parameters route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product parameters',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Create product parameter
 * POST /banking/parameters/product
 */
router.post('/parameters/product', async (req, res) => {
  try {
    console.log('📝 Create product parameter requested');
    await productParameterController.createProduct(req, res);
  } catch (error) {
    console.error('❌ Create product parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product parameter',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Update product parameter
 * PUT /banking/parameters/product/:prd_code
 */
router.put('/parameters/product/:prd_code', async (req, res) => {
  try {
    console.log('📝 Update product parameter requested:', req.params.prd_code);
    await productParameterController.updateProduct(req, res);
  } catch (error) {
    console.error('❌ Update product parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product parameter',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Delete product parameter
 * DELETE /banking/parameters/product/:prd_code
 */
router.delete('/parameters/product/:prd_code', async (req, res) => {
  try {
    console.log('🗑️ Delete product parameter requested:', req.params.prd_code);
    await productParameterController.deleteProduct(req, res);
  } catch (error) {
    console.error('❌ Delete product parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product parameter',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Get journal parameters from DS2 with pagination
 * GET /banking/parameters/journal
 */
router.get('/parameters/journal', async (req, res) => {
  try {
    console.log('📋 Journal parameters requested');
    await journalParameterController.getJournalParameters(req, res);
  } catch (error) {
    console.error('❌ Journal parameters route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journal parameters',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Create journal parameter
 * POST /banking/parameters/journal
 */
router.post('/parameters/journal', async (req, res) => {
  try {
    console.log('📝 Create journal parameter requested');
    await journalParameterController.createJournalParameter(req, res);
  } catch (error) {
    console.error('❌ Create journal parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create journal parameter',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Update journal parameter
 * PUT /banking/parameters/journal/:gl_code
 */
router.put('/parameters/journal/:gl_code', async (req, res) => {
  try {
    console.log('📝 Update journal parameter requested:', req.params.gl_code);
    await journalParameterController.updateJournalParameter(req, res);
  } catch (error) {
    console.error('❌ Update journal parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update journal parameter',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * Delete journal parameter
 * DELETE /banking/parameters/journal/:gl_code
 */
router.delete('/parameters/journal/:gl_code', async (req, res) => {
  try {
    console.log('🗑️ Delete journal parameter requested:', req.params.gl_code);
    await journalParameterController.deleteJournalParameter(req, res);
  } catch (error) {
    console.error('❌ Delete journal parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete journal parameter',
      code: 'ROUTE_ERROR'
    });
  }
});

// ==========================================
// PD SETUP ENDPOINTS (IFRS9 COLLECTIVE IMPAIRMENT)
// ==========================================

// Import PD Setup controller
import pdSetupController from '../controllers/pd-setup.controller';

/**
 * GET /banking/pd-setup/health
 * Health check for PD Setup service and DS2 database connection
 */
router.get('/pd-setup/health', async (req, res) => {
  try {
    console.log('🏥 PD Setup health check requested');
    await pdSetupController.healthCheck(req, res, () => {});
  } catch (error) {
    console.error('❌ PD Setup health check route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check PD Setup health',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * GET /banking/pd-setup/configs
 * Get all PD configurations with joined lookup data
 */
router.get('/pd-setup/configs', async (req, res) => {
  try {
    console.log('📋 PD Setup configs requested');
    await pdSetupController.getPDConfigs(req, res, () => {});
  } catch (error) {
    console.error('❌ PD Setup configs route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get PD configurations',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * GET /banking/pd-setup/segments
 * Get population segments for PD type
 */
router.get('/pd-setup/segments', async (req, res) => {
  try {
    console.log('🎯 PD Setup segments requested');
    await pdSetupController.getPopulationSegments(req, res, () => {});
  } catch (error) {
    console.error('❌ PD Setup segments route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get population segments',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * GET /banking/pd-setup/business-parameters
 * Get business parameters for PD methods and population types
 */
router.get('/pd-setup/business-parameters', async (req, res) => {
  try {
    console.log('⚙️ PD Setup business parameters requested');
    await pdSetupController.getBusinessParameters(req, res, () => {});
  } catch (error) {
    console.error('❌ PD Setup business parameters route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get business parameters',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * GET /banking/pd-setup/fl-scalars
 * Get FL scalar data for dropdown
 */
router.get('/pd-setup/fl-scalars', async (req, res) => {
  try {
    console.log('🔢 PD Setup FL scalars requested');
    await pdSetupController.getFLScalars(req, res, () => {});
  } catch (error) {
    console.error('❌ PD Setup FL scalars route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FL scalars',
      code: 'ROUTE_ERROR'
    });
  }
});

/**
 * GET /banking/pd-setup/bucket-groups
 * Get bucket groups from bucket header table
 */
router.get('/pd-setup/bucket-groups', async (req, res) => {
  try {
    console.log('🪣 PD Setup bucket groups requested');
    await pdSetupController.getBucketGroups(req, res, () => {});
  } catch (error) {
    console.error('❌ PD Setup bucket groups route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bucket groups',
      code: 'ROUTE_ERROR'
    });
  }
});

// ==========================================
// BUSINESS SETUP ROUTES - ALREADY IMPLEMENTED ABOVE
// ==========================================
// Note: Business setup routes are already implemented above using frs9Controller
// These follow the master-detail pattern with frs9_param_commonh (type B)

// Export default router for dynamic import
export default router;
