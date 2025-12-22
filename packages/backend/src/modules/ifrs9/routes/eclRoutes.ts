// packages/backend/src/modules/ifrs9/routes/eclRoutes.ts
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { EclCalculationController } from '../controllers/EclCalculationController';
import { authenticate } from '../../../core/middleware/auth';
import { requireTenantAccess } from '../../../core/middleware/tenant';
import { requirePermission } from '../../../core/middleware/permissions';

const router = Router();
const eclController = new EclCalculationController();

// Apply middleware to all routes
router.use(authenticate);
router.use(requireTenantAccess);

/**
 * POST /api/ifrs9/ecl/calculate
 * Start ECL calculation
 */
router.post('/calculate',
  requirePermission(['ifrs9:calculate']),
  [
    body('calculationDate')
      .isISO8601()
      .withMessage('Valid calculation date is required'),
    body('accountIds')
      .optional()
      .isArray()
      .withMessage('Account IDs must be an array'),
    body('parameters')
      .optional()
      .isObject()
      .withMessage('Parameters must be an object')
  ],
  eclController.calculateEcl
);

/**
 * GET /api/ifrs9/ecl/history
 * Get calculation history
 */
router.get('/history',
  requirePermission(['ifrs9:read']),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  eclController.getCalculationHistory
);

/**
 * GET /api/ifrs9/ecl/results/:jobId
 * Get calculation results by job ID
 */
router.get('/results/:jobId',
  requirePermission(['ifrs9:read']),
  [
    param('jobId')
      .isUUID()
      .withMessage('Valid job ID is required')
  ],
  eclController.getCalculationResults
);

/**
 * GET /api/ifrs9/portfolio/summary
 * Get portfolio summary
 */
router.get('/portfolio/summary',
  requirePermission(['ifrs9:read']),
  eclController.getPortfolioSummary
);

export default router;
