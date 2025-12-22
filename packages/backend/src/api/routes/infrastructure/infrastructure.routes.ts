// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/routes/infrastructure/infrastructure.routes.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Routes)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Express Validator
// Purpose: Express routes for infrastructure monitoring and health checks
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { InfrastructureController } from '../../controllers/infrastructure/infrastructure.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorization.middleware';
import { validateTenant } from '../../middleware/tenant.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';

const router = Router();
const infrastructureController = new InfrastructureController();

// Validation schemas
const metricsQueryValidation = [
  query('startDate').isISO8601().withMessage('Valid start date required'),
  query('endDate').isISO8601().withMessage('Valid end date required'),
  query('metricType').optional().isIn(['gauge', 'counter', 'histogram', 'summary', 'percentage'])
];

// Middleware stacks
const authMiddleware = [authenticate, validateTenant, rateLimitMiddleware];
const monitoringMiddleware = [...authMiddleware, authorize(['admin', 'infrastructure_admin', 'monitoring'])];
const adminMiddleware = [...authMiddleware, authorize(['admin', 'infrastructure_admin'])];

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array()
      },
      timestamp: new Date()
    });
  }
  next();
};

/**
 * GET /api/infrastructure/health
 * Get comprehensive infrastructure health status
 */
router.get('/health',
  ...monitoringMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getHealthStatus();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/health/summary
 * Get quick health summary for dashboard
 */
router.get('/health/summary',
  ...authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getHealthSummary();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_SUMMARY_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * POST /api/infrastructure/health/check
 * Trigger manual infrastructure health check
 */
router.post('/health/check',
  ...adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.triggerHealthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MANUAL_HEALTH_CHECK_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/metrics
 * Get system performance metrics
 */
router.get('/metrics',
  ...monitoringMiddleware,
  metricsQueryValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getPerformanceMetrics(
        req.query.startDate as string,
        req.query.endDate as string,
        req.query.metricType as any
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/metrics/current
 * Get current system metrics
 */
router.get('/metrics/current',
  ...monitoringMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getCurrentSystemMetrics();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM_METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/load-balancer
 * Get load balancer health and status
 */
router.get('/load-balancer',
  ...monitoringMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getLoadBalancerStatus();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOAD_BALANCER_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/gateway/routes
 * Get API Gateway routes configuration
 */
router.get('/gateway/routes',
  ...adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getGatewayRoutes();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GATEWAY_ROUTES_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

export default router;
