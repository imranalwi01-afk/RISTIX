// packages/backend/src/api/routes/lgd-setup.routes.ts
// ============================================================================
// LGD SETUP ROUTES - IFRS9 LOSS GIVEN DEFAULT CONFIGURATION MANAGEMENT
// ============================================================================
// Purpose: RESTful API routes for LGD Setup management
// Database: DS2 FRS9PRO (192.168.0.106:5433) - REAL DATABASE ONLY!
// Table: frs9_imp_ca_lgd_config
// ============================================================================

import { Router, Response, NextFunction } from 'express';
import {
  getAllLGDConfigs,
  getLGDBusinessParameters,
  createLGDConfig,
  updateLGDConfig,
  deleteLGDConfig,
  lgdSetupHealthCheck
} from '../controllers/lgd-setup.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// ============================================================================
// LGD SETUP ROUTES
// ============================================================================

/**
 * @route GET /api/v1/banking/collective/lgd-setup
 * @desc Get all LGD configurations with business parameter lookups
 * @access Private (requires JWT token)
 * @database DS2 FRS9PRO table: frs9_imp_ca_lgd_config
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    await getAllLGDConfigs(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/banking/collective/lgd-setup/business-parameters
 * @desc Get business parameters for LGD setup (methods, population types, segments)
 * @access Private (requires JWT token)
 * @database DS2 FRS9PRO tables: frs9_param_commond (B0022, B0023), frs9_param_segmenth
 */
router.get('/business-parameters', requireAuth, async (req, res, next) => {
  try {
    await getLGDBusinessParameters(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/banking/collective/lgd-setup/:id
 * @desc Get single LGD configuration by ID
 * @access Private (requires JWT token)
 */
router.get('/:id', requireAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // This endpoint could be implemented if needed for single record view
    // For now, frontend can use the data from getAll endpoint
    res.status(501).json({
      success: false,
      error: 'Single LGD config endpoint not implemented yet',
      message: 'Use GET /banking/collective/lgd-setup to get all configs'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/banking/collective/lgd-setup
 * @desc Create new LGD configuration
 * @access Private (requires JWT token)
 * @body LGD configuration data
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    await createLGDConfig(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/v1/banking/collective/lgd-setup/:id
 * @desc Update existing LGD configuration
 * @access Private (requires JWT token)
 * @body Partial LGD configuration data
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    await updateLGDConfig(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/v1/banking/collective/lgd-setup/:id
 * @desc Delete LGD configuration
 * @access Private (requires JWT token)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await deleteLGDConfig(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/banking/collective/lgd-setup/health
 * @desc Health check for LGD Setup service and DS2 database connectivity
 * @access Private (requires JWT token)
 */
router.get('/health', requireAuth, async (req, res, next) => {
  try {
    await lgdSetupHealthCheck(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;