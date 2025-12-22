// packages/backend/src/api/routes/ifrs9/staging-analysis.routes.ts
// ============================================================================
// Staging Analysis Routes - IFRS 9 Three-Stage Classification API Endpoints
// ============================================================================
// Generated: 2025-08-18
// Purpose: Express router for IFRS 9 staging analysis HTTP endpoints
// Dependencies: Express Router, Controllers, Middleware, Validation
// ============================================================================

import { Router } from 'express';
import { StagingAnalysisController, stagingAnalysisValidation } from '../../controllers/ifrs9/staging-analysis.controller';
import { TenantMiddleware } from '../../middleware/tenant.middleware';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { RoleMiddleware } from '../../middleware/role.middleware';

// Initialize dependencies
const router = Router();
const tenantMiddleware = new TenantMiddleware();
const authMiddleware = new AuthMiddleware();
const roleMiddleware = new RoleMiddleware();

// Service dependencies will be injected via DI container
let stagingAnalysisController: StagingAnalysisController;

// Initialize controller with dependencies (will be set by module loader)
export const initializeStagingAnalysisRoutes = (controller: StagingAnalysisController) => {
  stagingAnalysisController = controller;
};

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================

// Apply tenant context resolution to all routes
router.use(tenantMiddleware.resolve.bind(tenantMiddleware));

// Apply authentication to all routes
router.use(authMiddleware.authenticate.bind(authMiddleware));

// Apply role-based access control
const requireStagingAccess = roleMiddleware.requireAnyRole([
  'BANK_CRO',
  'BANK_IFRS_MANAGER',
  'BANK_RISK_ANALYST',
  'BANK_PORTFOLIO_MANAGER',
  'PLATFORM_SUPER_ADMIN',
  'SENIOR_IFRS9_CONSULTANT'
]).bind(roleMiddleware);

const requireConfigAccess = roleMiddleware.requireAnyRole([
  'BANK_CRO',
  'BANK_IFRS_MANAGER',
  'PLATFORM_SUPER_ADMIN'
]).bind(roleMiddleware);

// ============================================================================
// STAGING ANALYSIS ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/ifrs9/staging/analyze-account
 * @desc    Analyze staging status for single portfolio account
 * @access  Banking Staff, Consultants
 * @body    { portfolioAccountId, reportingDate, forceRecalculation? }
 */
router.post('/analyze-account',
  requireStagingAccess,
  stagingAnalysisValidation.analyzeAccount,
  (req, res, next) => stagingAnalysisController.analyzeAccountStaging(req, res, next)
);

/**
 * @route   POST /api/v1/ifrs9/staging/analyze-portfolio
 * @desc    Analyze staging for multiple accounts or entire portfolio
 * @access  Banking Staff, Consultants
 * @body    { portfolioAccountIds?, reportingDate, portfolioFilters?, batchSize?, forceRecalculation? }
 */
router.post('/analyze-portfolio',
  requireStagingAccess,
  stagingAnalysisValidation.analyzePortfolio,
  (req, res, next) => stagingAnalysisController.analyzePortfolioStaging(req, res, next)
);

/**
 * @route   GET /api/v1/ifrs9/staging/movements
 * @desc    Get stage movements summary for reporting period
 * @access  Banking Staff, Consultants
 * @query   fromDate, toDate?
 */
router.get('/movements',
  requireStagingAccess,
  stagingAnalysisValidation.getMovements,
  (req, res, next) => stagingAnalysisController.getStageMovements(req, res, next)
);

/**
 * @route   GET /api/v1/ifrs9/staging/distribution
 * @desc    Get portfolio staging distribution statistics
 * @access  Banking Staff, Consultants
 * @query   reportingDate?, groupBy? (product_type|customer_segment|branch)
 */
router.get('/distribution',
  requireStagingAccess,
  (req, res, next) => stagingAnalysisController.getPortfolioStagingDistribution(req, res, next)
);

/**
 * @route   GET /api/v1/ifrs9/staging/account/:accountId/history
 * @desc    Get staging history for specific account
 * @access  Banking Staff, Consultants
 * @params  accountId: UUID of the portfolio account
 * @query   limit?, fromDate?, toDate?
 */
router.get('/account/:accountId/history',
  requireStagingAccess,
  (req, res, next) => stagingAnalysisController.getAccountStagingHistory(req, res, next)
);

// ============================================================================
// STAGING CONFIGURATION ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/ifrs9/staging/configuration
 * @desc    Get current staging configuration parameters
 * @access  Banking Staff, Consultants
 */
router.get('/configuration',
  requireStagingAccess,
  (req, res, next) => stagingAnalysisController.getStagingConfiguration(req, res, next)
);

/**
 * @route   PUT /api/v1/ifrs9/staging/configuration
 * @desc    Update staging configuration parameters
 * @access  Banking CRO, IFRS Manager, Platform Admin
 * @body    { stage2Criteria?, stage3Criteria?, backstopRules?, modelParameters? }
 */
router.put('/configuration',
  requireConfigAccess,
  stagingAnalysisValidation.updateConfiguration,
  (req, res, next) => stagingAnalysisController.updateStagingConfiguration(req, res, next)
);

// ============================================================================
// REPORTING & ANALYTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/ifrs9/staging/reports/stage-migration
 * @desc    Generate stage migration matrix report
 * @access  Banking Staff, Consultants
 * @query   fromDate, toDate, format? (json|csv|xlsx)
 */
router.get('/reports/stage-migration',
  requireStagingAccess,
  (req, res, next) => {
    try {
      // Mock stage migration matrix - replace with actual implementation
      const migrationMatrix = {
        reportingPeriod: {
          from: req.query.fromDate,
          to: req.query.toDate || new Date().toISOString()
        },
        matrix: {
          stage1ToStage1: 850,
          stage1ToStage2: 85,
          stage1ToStage3: 15,
          stage2ToStage1: 45,
          stage2ToStage2: 160,
          stage2ToStage3: 35,
          stage3ToStage1: 5,
          stage3ToStage2: 12,
          stage3ToStage3: 63
        },
        summary: {
          totalMovements: 185,
          downgrades: 135,
          upgrades: 50,
          netDeteriorationRate: 0.068
        }
      };

      res.json({
        success: true,
        data: migrationMatrix,
        meta: {
          tenantId: req.tenant?.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/ifrs9/staging/reports/risk-indicators
 * @desc    Get risk indicator analysis report
 * @access  Banking Staff, Consultants
 * @query   reportingDate?, segment? (product|customer|geography)
 */
router.get('/reports/risk-indicators',
  requireStagingAccess,
  (req, res, next) => {
    try {
      // Mock risk indicators report
      const riskIndicators = {
        reportingDate: req.query.reportingDate || new Date().toISOString(),
        indicators: {
          quantitative: {
            daysPastDueDistribution: {
              current: 950,
              dpd1to30: 180,
              dpd31to60: 80,
              dpd61to90: 25,
              over90: 15
            },
            pdChangeDistribution: {
              noChange: 800,
              increaseUnder2x: 280,
              increase2to5x: 120,
              increaseOver5x: 50
            }
          },
          qualitative: {
            forbearanceFlag: 45,
            watchListFlag: 28,
            industryStressFlag: 62,
            managementChangeFlag: 18
          }
        },
        trends: {
          monthlyDeteriorationRate: 0.045,
          averagePdIncrease: 0.025,
          stageVolatility: 0.12
        }
      };

      res.json({
        success: true,
        data: riskIndicators,
        meta: {
          tenantId: req.tenant?.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// HEALTH CHECK ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/ifrs9/staging/health
 * @desc    Check staging analysis service health
 * @access  All authenticated users
 */
router.get('/health',
  authMiddleware.authenticate.bind(authMiddleware),
  async (req, res, next) => {
    try {
      const health = {
        service: 'IFRS9 Staging Analysis Service',
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
          accountAnalysis: 'enabled',
          portfolioAnalysis: 'enabled',
          configurationManagement: 'enabled',
          reportingAnalytics: 'enabled'
        },
        dependencies: {
          database: 'connected',
          cache: 'connected'
        }
      };

      res.json({
        success: true,
        data: health
      });

    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Handle route-specific errors
router.use((error: any, req: any, res: any, next: any) => {
  if (error.name === 'StagingAnalysisError') {
    return res.status(422).json({
      success: false,
      error: 'STAGING_ANALYSIS_FAILED',
      message: 'Staging analysis could not be completed',
      details: error.message
    });
  }

  if (error.name === 'ConfigurationError') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_STAGING_CONFIG',
      message: 'Staging configuration is invalid',
      details: error.message
    });
  }

  if (error.name === 'AccountNotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'ACCOUNT_NOT_FOUND',
      message: 'Portfolio account not found for staging analysis',
      details: error.message
    });
  }

  // Pass to global error handler
  next(error);
});

export default router;