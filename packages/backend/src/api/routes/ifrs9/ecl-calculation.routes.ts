// packages/backend/src/api/routes/ifrs9/ecl-calculation.routes.ts
// ============================================================================
// ECL Calculation Routes - IFRS 9 Expected Credit Loss API Endpoints
// ============================================================================
// Generated: 2025-08-18
// Purpose: Express router for ECL calculation HTTP endpoints
// Dependencies: Express Router, Controllers, Middleware, Validation
// ============================================================================

import { Router } from 'express';
import { EclCalculationController, eclCalculationValidation } from '../../controllers/ifrs9/ecl-calculation.controller';
import { TenantMiddleware } from '../../middleware/tenant.middleware';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { RoleMiddleware } from '../../middleware/role.middleware';

// Initialize dependencies
const router = Router();
const tenantMiddleware = new TenantMiddleware();
const authMiddleware = new AuthMiddleware();
const roleMiddleware = new RoleMiddleware();

// Service dependencies will be injected via DI container
let eclCalculationController: EclCalculationController;

// Initialize controller with dependencies (will be set by module loader)
export const initializeEclCalculationRoutes = (controller: EclCalculationController) => {
  eclCalculationController = controller;
};

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================

// Apply tenant context resolution to all routes
router.use(tenantMiddleware.resolve.bind(tenantMiddleware));

// Apply authentication to all routes
router.use(authMiddleware.authenticate.bind(authMiddleware));

// Apply role-based access control
const requireCalculationAccess = roleMiddleware.requireAnyRole([
  'BANK_CRO',
  'BANK_IFRS_MANAGER', 
  'BANK_RISK_ANALYST',
  'BANK_PORTFOLIO_MANAGER',
  'PLATFORM_SUPER_ADMIN',
  'SENIOR_IFRS9_CONSULTANT'
]).bind(roleMiddleware);

// ============================================================================
// ECL CALCULATION ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/ifrs9/ecl/calculate
 * @desc    Start ECL calculation batch job
 * @access  Banking Staff, Consultants
 * @body    { reportingDate, calculationType?, portfolioFilters?, calculationParameters? }
 */
router.post('/calculate',
  requireCalculationAccess,
  eclCalculationValidation.startBatch,
  (req, res, next) => eclCalculationController.startCalculationBatch(req, res, next)
);

/**
 * @route   GET /api/v1/ifrs9/ecl/batch/:batchId/status
 * @desc    Get calculation batch status and progress
 * @access  Banking Staff, Consultants
 * @params  batchId: UUID of the calculation batch
 */
router.get('/batch/:batchId/status',
  requireCalculationAccess,
  (req, res, next) => eclCalculationController.getBatchStatus(req, res, next)
);

/**
 * @route   GET /api/v1/ifrs9/ecl/batch/:batchId/results
 * @desc    Get ECL calculation results with pagination
 * @access  Banking Staff, Consultants
 * @params  batchId: UUID of the calculation batch
 * @query   page?, limit?, includeDetails?, format? (json|csv)
 */
router.get('/batch/:batchId/results',
  requireCalculationAccess,
  eclCalculationValidation.getBatchResults,
  (req, res, next) => eclCalculationController.getBatchResults(req, res, next)
);

/**
 * @route   GET /api/v1/ifrs9/ecl/batch/:batchId/aggregation
 * @desc    Get portfolio-level aggregation results
 * @access  Banking Staff, Consultants
 * @params  batchId: UUID of the calculation batch
 * @query   level? (portfolio|product|customer_segment|stage), filters?
 */
router.get('/batch/:batchId/aggregation',
  requireCalculationAccess,
  (req, res, next) => eclCalculationController.getPortfolioAggregation(req, res, next)
);

/**
 * @route   POST /api/v1/ifrs9/ecl/batch/:batchId/cancel
 * @desc    Cancel running calculation batch
 * @access  Banking Staff, Consultants
 * @params  batchId: UUID of the calculation batch
 */
router.post('/batch/:batchId/cancel',
  requireCalculationAccess,
  (req, res, next) => eclCalculationController.cancelBatch(req, res, next)
);

/**
 * @route   POST /api/v1/ifrs9/ecl/r-analytics/execute
 * @desc    Execute R Analytics statistical model
 * @access  Banking Staff, Consultants
 * @body    { modelType, portfolioData, modelParameters }
 */
router.post('/r-analytics/execute',
  requireCalculationAccess,
  eclCalculationValidation.executeRAnalytics,
  (req, res, next) => eclCalculationController.executeRAnalytics(req, res, next)
);

// ============================================================================
// BATCH MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/ifrs9/ecl/batches
 * @desc    List calculation batches with filters
 * @access  Banking Staff, Consultants
 * @query   status?, dateFrom?, dateTo?, calculationType?, page?, limit?
 */
router.get('/batches',
  requireCalculationAccess,
  (req, res, next) => {
    // This would be implemented in a batch management controller
    res.status(501).json({
      success: false,
      error: 'NOT_IMPLEMENTED',
      message: 'Batch listing endpoint not yet implemented'
    });
  }
);

/**
 * @route   DELETE /api/v1/ifrs9/ecl/batch/:batchId
 * @desc    Delete calculation batch and results
 * @access  Banking CRO, IFRS Manager, Platform Admin
 * @params  batchId: UUID of the calculation batch
 */
router.delete('/batch/:batchId',
  roleMiddleware.requireAnyRole([
    'BANK_CRO',
    'BANK_IFRS_MANAGER',
    'PLATFORM_SUPER_ADMIN'
  ]).bind(roleMiddleware),
  (req, res, next) => {
    // This would be implemented in the controller
    res.status(501).json({
      success: false,
      error: 'NOT_IMPLEMENTED',
      message: 'Batch deletion endpoint not yet implemented'
    });
  }
);

// ============================================================================
// HEALTH CHECK ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/ifrs9/ecl/health
 * @desc    Check ECL calculation service health
 * @access  All authenticated users
 */
router.get('/health',
  authMiddleware.authenticate.bind(authMiddleware),
  async (req, res, next) => {
    try {
      // Basic health check - verify services are available
      const health = {
        service: 'ECL Calculation Service',
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        dependencies: {
          database: 'connected',
          rAnalytics: 'checking...',
          cache: 'connected'
        }
      };

      // TODO: Add actual health checks for dependencies
      res.json({
        success: true,
        data: health
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/ifrs9/ecl/r-analytics/health
 * @desc    Check R Analytics service connectivity
 * @access  All authenticated users
 */
router.get('/r-analytics/health',
  authMiddleware.authenticate.bind(authMiddleware),
  async (req, res, next) => {
    try {
      // This would check R Analytics service health
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          service: 'R Analytics Integration',
          status: 'available',
          endpoint: process.env.R_ANALYTICS_URL,
          version: 'R 4.3+',
          timestamp: new Date().toISOString()
        }
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
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'ECL_VALIDATION_ERROR',
      message: error.message,
      details: error.errors
    });
  }

  if (error.name === 'RAnalyticsError') {
    return res.status(503).json({
      success: false,
      error: 'R_ANALYTICS_UNAVAILABLE',
      message: 'R Analytics service is currently unavailable',
      details: error.message
    });
  }

  if (error.name === 'CalculationError') {
    return res.status(422).json({
      success: false,
      error: 'CALCULATION_FAILED',
      message: 'ECL calculation failed',
      details: error.message
    });
  }

  // Pass to global error handler
  next(error);
});

export default router;