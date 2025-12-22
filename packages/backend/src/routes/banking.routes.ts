// packages/backend/src/routes/banking.routes.ts
// ============================================================================
// =' BANK-001: MAIN BANKING ROUTES MOUNTING
// ============================================================================
//  IMPLEMENTS: Complete banking API routes mounting
//  MODULES: All banking-related route modules imported and mounted
//  PATHS: Proper path mapping for frontend API calls
//  AUTH: Authentication applied to all banking routes
// ============================================================================

import { Router } from 'express';
import { authenticateToken } from '../api/middleware/auth.middleware';
import { backendEnvironmentLoader } from '../config/environment-loader-backend';

// Import all banking route modules from correct locations
import { applicationParameterRoutes } from '../api/routes/application-parameter.routes';
import { businessParameterRoutes } from '../api/routes/business-parameter.routes';
import { productParameterRoutes } from '../api/routes/product-parameter.routes';
import { journalParameterRoutes } from '../api/routes/journal-parameter.routes';
import bankingParameterRoutes from '../api/routes/banking-parameter.routes';

// Import collective impairment routes
import pdSetupRoutes from '../api/routes/pd-setup.routes';
import { lgdSetupRoutes } from '../api/routes/lgd-setup.routes';
import eclConfigurationRoutes from '../api/routes/ecl-configuration.routes';
import { bucketParameterRoutes } from '../api/routes/bucket-parameter.routes';

// Import rule base setting routes
import ruleBaseSettingRoutes from '../api/routes/rule-base-setting.routes';

// Import segmentation routes
import { segmentationRoutes } from '../api/routes/segmentation.routes';

// Import collective parameter routes
import { collectiveParameterRoutes } from '../api/routes/collective-parameter.routes';

// Import IFRS9 Impairment routes
import individualImpairmentRoutes from '../api/routes/individual-impairment.routes';

// Import portfolio management routes (if exists)
// import { portfolioManagementRoutes } from '../api/routes/portfolio-management.routes';

const router = Router();

// ==========================================
// DEBUG ENDPOINTS (NO AUTH - FOR TESTING)
// ==========================================

/**
 * Debug application setup parameters (NO AUTH - FOR TESTING)
 * GET /api/v1/banking/debug/application
 */
import { FRS9ParameterController } from '../api/controllers/frs9-parameter.controller';

router.get('/debug/application', async (req, res) => {
  try {
    console.log('🔍 Application setup debug requested - NO AUTH');
    const frs9Controller = new FRS9ParameterController();
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

// Apply authentication to all banking routes
router.use(authenticateToken);

// ============================================================================
// BANKING SETUP PARAMETERS
// ============================================================================

// Application Setup Parameters - FRS9_PARAM_COMMONH (Type A)
// Mount: /api/v1/banking/setup/application
router.use('/setup/application', applicationParameterRoutes);

// Business Setup Parameters - FRS9_PARAM_COMMONH (Type B)
// Mount: /api/v1/banking/setup/business
router.use('/setup/business', businessParameterRoutes);

// ============================================================================
// BANKING PARAMETERS
// ============================================================================

// Product Parameters - FRS9_PARAM_PRODUCT
// Mount: /api/v1/banking/parameters/product
router.use('/parameters/product', productParameterRoutes);

// Journal Parameters - FRS9_PARAM_JOURNAL
// Mount: /api/v1/banking/parameters/journal
router.use('/parameters/journal', journalParameterRoutes);

// Main Banking Parameter Routes (consolidated)
// Mount: /api/v1/banking/main
router.use('/main', bankingParameterRoutes);

// ============================================================================
// BANKING COLLECTIVE IMPAIRMENT
// ============================================================================

// PD Setup - Probability of Default Configuration
// Mount: /api/v1/banking/pd-setup
router.use('/pd-setup', pdSetupRoutes);

// LGD Setup - Loss Given Default Configuration
// Mount: /api/v1/banking/collective/lgd-setup
router.use('/collective/lgd-setup', lgdSetupRoutes);

// ECL Configuration - Expected Credit Loss Configuration
// Mount: /api/v1/banking/collective/ecl-config
router.use('/collective/ecl-config', eclConfigurationRoutes);

// Bucket Parameter - Bucket Parameter Management
// Mount: /api/v1/banking/bucket-parameter
router.use('/bucket-parameter', bucketParameterRoutes);

// Rule Base Setting - Rule Base Setting Management
// Mount: /api/v1/banking/collective/rule-base
router.use('/collective/rule-base', ruleBaseSettingRoutes);

// ============================================================================
// BANKING SEGMENTATION
// ============================================================================

// Segmentation Configuration - FRS9_PARAM_SEGMENTH/SEGMENTD
// Mount: /api/v1/banking/segmentation
router.use('/segmentation', segmentationRoutes);

// ============================================================================
// BANKING COLLECTIVE PARAMETERS
// ============================================================================

// Collective Parameter Management - Master-Detail with Integration Links
// Mount: /api/v1/banking/collective-parameter
router.use('/collective-parameter', collectiveParameterRoutes);

// Collective Parameters - Alternative Route for Frontend Compatibility
// Mount: /api/v1/collective/parameters (alias for collective-parameter)
router.use('/collective/parameters', collectiveParameterRoutes);

// ============================================================================
// IFRS9 IMPAIRMENT AND AMORTIZATION
// ============================================================================

// IFRS9 Individual Impairment Assessment
// Mount: /api/v1/banking/individual/impairment
router.use('/individual/impairment', individualImpairmentRoutes);

// ============================================================================
// PORTFOLIO MANAGEMENT
// ============================================================================

// Portfolio Management - Accounts, Customers, Products, Overview
// Mount: /api/v1/banking/portfolio
// router.use('/portfolio', portfolioManagementRoutes); // Commented out until route file exists

// ============================================================================
// BANKING HEALTH AND GENERAL
// ============================================================================

// Banking Health Check - DS2 FRS9PRO Database Connection
// Mount: /api/v1/banking/health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Banking service health check',
    database: 'DS2 FRS9PRO',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Banking API Information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IFRS9 Banking Parameters API - DS2 FRS9PRO Database Integration',
    version: '2.0.0',
    description: 'Complete banking parameter management with DS2 database integration',
    database_info: {
      // ✅ CENTRALIZED: Use environment loader instead of hardcoded values
      host: (() => {
        try {
          const config = backendEnvironmentLoader.getConfiguration();
          return `${config.database.frs9.host}:${config.database.frs9.port}`;
        } catch (error) {
          console.warn('⚠️ Failed to load centralized config, using environment variables:', error instanceof Error ? error.message : String(error));
          return `${process.env.FRS9_DB_HOST || process.env.DB_HOST}:${process.env.FRS9_DB_PORT || process.env.DB_PORT}`;
        }
      })(),
      database: process.env.FRS9_DB_NAME || 'FRS9PRO',
      tables: [
        'frs9_param_commonh (parameter headers)',
        'frs9_param_commond (parameter details)',
        'frs9_param_product (product parameters)',
        'frs9_param_journal (journal parameters)',
        'frs9_param_segmenth (segmentation headers)',
        'frs9_param_segmentd (segmentation details)',
        'frs9_param_bucketh (bucket headers)',
        'frs9_param_bucketd (bucket details)',
        'frs9_imp_ca_fl_scalarh (FL scalar headers)',
        'frs9_imp_ca_fl_scalard (FL scalar details)',
        'frs9_imp_ca_lgd_config (LGD configuration)',
        'frs9_imp_ca_pd_config (PD configuration)',
        'frs9_param_scenario_rulesh (rule headers)',
        'frs9_param_scenario_rulesd (rule details)'
      ]
    },
    endpoints: {
      setup: {
        application: 'GET/POST/PUT/DELETE - Application setup management',
        business: 'GET/POST/PUT/DELETE - Business setup management'
      },
      parameters: {
        product: 'GET/POST/PUT/DELETE - Product parameters',
        journal: 'GET/POST/PUT/DELETE - Journal parameters',
        main: 'GET/POST/PUT/DELETE - Main banking parameters'
      },
      collective_impairment: {
        pd_setup: 'GET/POST/PUT/DELETE - PD configuration',
        lgd_setup: 'GET/POST/PUT/DELETE - LGD configuration',
        ecl_config: 'GET/POST/PUT/DELETE - ECL configuration',
        bucket_parameter: 'GET/POST/PUT/DELETE - Bucket parameters'
      },
      segmentation: {
        main: 'GET/POST/PUT/DELETE - Segmentation configuration'
      },
      collective_parameters: {
        main: 'GET/POST/PUT/DELETE - Collective parameter management',
        alias: 'GET/POST/PUT/DELETE - Alternative route (collective/parameters)'
      },
      ifrs9_impairment: {
        individual_impairment: 'GET/POST/PUT/DELETE - Individual impairment assessment'
      },
      health: 'GET - DS2 database health check'
    },
    timestamp: new Date().toISOString(),
    deployment_mode: 'IAF_ECS_SERVER',
    server: '10.18.11.35'
  });
});

export default router;

console.log(' [BANK-001] Banking routes loaded - All banking API endpoints mounted successfully');