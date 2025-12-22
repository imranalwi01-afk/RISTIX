// packages/backend/src/api/routes/ead-setup.routes.ts
// ============================================================================
// EAD SETUP ROUTES - IFRS9 EXPOSURE AT DEFAULT CONFIGURATION MANAGEMENT
// ============================================================================
// Purpose: RESTful API routes for EAD Setup management
// Database: DS2 FRS9PRO (192.168.0.106:5433) - REAL DATABASE ONLY!
// Table: frs9_imp_ca_ead_config
// ============================================================================

import { Router, Response, NextFunction } from 'express';
import {
  getAllEADConfigs,
  getEADBusinessParameters,
  createEADConfig,
  updateEADConfig,
  deleteEADConfig,
  eadSetupHealthCheck
} from '../controllers/ead-setup.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// ============================================================================
// EAD SETUP ROUTES
// ============================================================================

/**
 * @route GET /api/v1/banking/collective/ead-setup
 * @desc Get all EAD configurations with business parameter lookups
 * @access Private (requires JWT token)
 * @database DS2 FRS9PRO table: frs9_imp_ca_ead_config
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    await getAllEADConfigs(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/banking/collective/ead-setup/business-parameters
 * @desc Get business parameters for EAD setup (methods, population types, segments)
 * @access Private (requires JWT token)
 * @database DS2 FRS9PRO tables: frs9_param_commond (B0024, B0025), frs9_param_segmenth
 */
router.get('/business-parameters', requireAuth, async (req, res, next) => {
  try {
    await getEADBusinessParameters(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/banking/collective/ead-setup/:id
 * @desc Get single EAD configuration by ID
 * @access Private (requires JWT token)
 */
router.get('/:id', requireAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // This endpoint could be implemented if needed for single record view
    // For now, frontend can use the data from getAll endpoint
    res.status(501).json({
      success: false,
      error: 'Single EAD config endpoint not implemented yet',
      message: 'Use GET /banking/collective/ead-setup to get all configs'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/banking/collective/ead-setup
 * @desc Create new EAD configuration
 * @access Private (requires JWT token)
 * @body EAD configuration data
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    await createEADConfig(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/v1/banking/collective/ead-setup/:id
 * @desc Update existing EAD configuration
 * @access Private (requires JWT token)
 * @body Partial EAD configuration data
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    await updateEADConfig(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/v1/banking/collective/ead-setup/:id
 * @desc Delete EAD configuration
 * @access Private (requires JWT token)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await deleteEADConfig(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/banking/collective/ead-setup/health
 * @desc Health check for EAD Setup service and DS2 database connectivity
 * @access Private (requires JWT token)
 */
router.get('/health', requireAuth, async (req, res, next) => {
  try {
    await eadSetupHealthCheck(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;