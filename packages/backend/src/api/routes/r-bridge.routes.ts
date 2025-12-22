// packages/backend/src/api/routes/r-bridge.routes.ts
// ============================================================================
// 🔬 R ANALYTICS BRIDGE ROUTES - Express.js to R API Integration (NEW)
// ============================================================================
// Based on TodoList-v2.md Hour 8 requirements
// Features: Separate from existing R Shiny embedding, complementary service
// ============================================================================

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { 
  rAnalyticsController,
  validateCalculationRequest,
  validateCustomCalculationRequest
} from '../controllers/r-analytics.controller';

// Initialize rate limit middleware
const rateLimitService = new RateLimitMiddleware();

const router = Router();

// ============================================================================
// 🛡️ MIDDLEWARE STACK
// ============================================================================

// Apply authentication to all routes
router.use(authMiddleware);

// Apply tenant context middleware (required for banking calculations)
router.use(tenantMiddleware);

// Apply rate limiting (stricter for computation-heavy endpoints)
const standardRateLimit = rateLimitService.generalLimit();
const calculationRateLimit = rateLimitService.strictLimit();

// ============================================================================
// 🏥 HEALTH AND STATUS ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/r-bridge/health
 * @desc    Get R Analytics Bridge service health status (separate from R Shiny)
 * @access  Protected (requires authentication)
 * @rate    Standard rate limit
 */
router.get('/health', 
  standardRateLimit,
  rAnalyticsController.getHealth.bind(rAnalyticsController)
);

/**
 * @route   GET /api/v1/r-bridge/models
 * @desc    Get available R statistical models for API integration
 * @access  Protected (requires authentication + tenant context)
 * @rate    Standard rate limit
 */
router.get('/models', 
  standardRateLimit,
  rAnalyticsController.getModels.bind(rAnalyticsController)
);

/**
 * @route   GET /api/v1/r-bridge/models/:modelName
 * @desc    Get specific model information
 * @access  Protected (requires authentication + tenant context)
 * @rate    Standard rate limit
 */
router.get('/models/:modelName', 
  standardRateLimit,
  rAnalyticsController.getModelInfo.bind(rAnalyticsController)
);

// ============================================================================
// 🧮 IFRS 9 CALCULATION ROUTES (API-based, not Shiny UI)
// ============================================================================

/**
 * @route   POST /api/v1/r-bridge/calculations/ecl
 * @desc    Calculate Expected Credit Loss via R API (backend integration)
 * @access  Protected (requires authentication + tenant context)
 * @rate    Calculation rate limit (more restrictive)
 * @body    { modelName: string, data: object[], parameters?: object }
 */
router.post('/calculations/ecl',
  calculationRateLimit,
  validateCalculationRequest,
  rAnalyticsController.calculateECL.bind(rAnalyticsController)
);

/**
 * @route   POST /api/v1/r-bridge/calculations/pd
 * @desc    Calculate Probability of Default via R API
 * @access  Protected (requires authentication + tenant context)
 * @rate    Calculation rate limit (more restrictive)
 * @body    { modelName: string, data: object[], parameters?: object }
 */
router.post('/calculations/pd',
  calculationRateLimit,
  validateCalculationRequest,
  rAnalyticsController.calculatePD.bind(rAnalyticsController)
);

/**
 * @route   POST /api/v1/r-bridge/calculations/lgd
 * @desc    Calculate Loss Given Default via R API
 * @access  Protected (requires authentication + tenant context)
 * @rate    Calculation rate limit (more restrictive)
 * @body    { modelName: string, data: object[], parameters?: object }
 */
router.post('/calculations/lgd',
  calculationRateLimit,
  validateCalculationRequest,
  rAnalyticsController.calculateLGD.bind(rAnalyticsController)
);

/**
 * @route   POST /api/v1/r-bridge/calculations/ead
 * @desc    Calculate Exposure at Default via R API
 * @access  Protected (requires authentication + tenant context)
 * @rate    Calculation rate limit (more restrictive)
 * @body    { modelName: string, data: object[], parameters?: object }
 */
router.post('/calculations/ead',
  calculationRateLimit,
  validateCalculationRequest,
  rAnalyticsController.calculateEAD.bind(rAnalyticsController)
);

/**
 * @route   POST /api/v1/r-bridge/calculations/staging
 * @desc    Perform IFRS 9 Staging Classification via R API
 * @access  Protected (requires authentication + tenant context)
 * @rate    Calculation rate limit (more restrictive)
 * @body    { modelName: string, data: object[], parameters?: object }
 */
router.post('/calculations/staging',
  calculationRateLimit,
  validateCalculationRequest,
  rAnalyticsController.performStaging.bind(rAnalyticsController)
);

/**
 * @route   POST /api/v1/r-bridge/calculations/custom
 * @desc    Execute custom calculation via R API (flexible calculation type)
 * @access  Protected (requires authentication + tenant context)
 * @rate    Calculation rate limit (more restrictive)
 * @body    { modelName: string, calculationType: string, data: object[], parameters?: object }
 */
router.post('/calculations/custom',
  calculationRateLimit,
  validateCustomCalculationRequest,
  rAnalyticsController.executeCustomCalculation.bind(rAnalyticsController)
);

// ============================================================================
// 📊 SERVICE INFORMATION ENDPOINT
// ============================================================================

/**
 * @route   GET /api/v1/r-bridge
 * @desc    Get R Analytics Bridge API information (separate from R Shiny service)
 * @access  Protected (requires authentication)
 * @rate    Standard rate limit
 */
router.get('/', 
  standardRateLimit,
  (req, res) => {
    res.json({
      success: true,
      service: 'R Analytics Bridge API',
      version: '1.0.0',
      description: 'Express.js to R Analytics service integration for IFRS 9 calculations (complementary to R Shiny)',
      note: 'This service provides API-based R calculations, while /r-analytics handles R Shiny UI embedding',
      endpoints: {
        health: {
          method: 'GET',
          path: '/health',
          description: 'Get R Analytics Bridge service health status'
        },
        models: {
          list: {
            method: 'GET',
            path: '/models',
            description: 'Get available statistical models'
          },
          info: {
            method: 'GET',
            path: '/models/:modelName',
            description: 'Get specific model information'
          }
        },
        calculations: {
          ecl: {
            method: 'POST',
            path: '/calculations/ecl',
            description: 'Calculate Expected Credit Loss via R API'
          },
          pd: {
            method: 'POST',
            path: '/calculations/pd',
            description: 'Calculate Probability of Default via R API'
          },
          lgd: {
            method: 'POST',
            path: '/calculations/lgd',
            description: 'Calculate Loss Given Default via R API'
          },
          ead: {
            method: 'POST',
            path: '/calculations/ead',
            description: 'Calculate Exposure at Default via R API'
          },
          staging: {
            method: 'POST',
            path: '/calculations/staging',
            description: 'Perform IFRS 9 staging classification via R API'
          },
          custom: {
            method: 'POST',
            path: '/calculations/custom',
            description: 'Execute custom calculation with flexible type via R API'
          }
        }
      },
      features: [
        'Multi-tenant support',
        'Banking type awareness (Conventional/Syariah)',
        'Comprehensive error handling',
        'Request validation',
        'Rate limiting',
        'Audit logging',
        'Health monitoring',
        'Complementary to R Shiny UI service'
      ],
      r_service: {
        baseUrl: process.env.R_ANALYTICS_URL,
        status: 'See /health endpoint for current status',
        note: 'This connects to R Analytics API service, separate from R Shiny sessions'
      },
      tenant: req.tenant ? {
        id: req.tenant.id,
        slug: req.tenant.slug,
        name: req.tenant.name
      } : null,
      timestamp: new Date().toISOString()
    });
  }
);

export default router;