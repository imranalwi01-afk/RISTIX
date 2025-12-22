// packages/backend/src/api/controllers/ecl-configuration-corrected.controller.ts
// ============================================================================
// 🏦 ECL CONFIGURATION CONTROLLER - Real FRS9PRO Database Integration (CORRECTED)
// ============================================================================
// ✅ PATTERN: Master-Detail with actual legacy tables integration
// ✅ DATABASE: frs9_imp_ca_ecl_configh (header) + frs9_imp_ca_ecl_configd (detail)  
// ✅ STRUCTURE: Based on ACTUAL database schema from DS2 FRS9PRO
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import EclConfigurationService from '../../core/services/ecl-configuration.service';
import { appConfig } from "../../config/app.config";

// ============================================================================
// VALIDATION SCHEMAS (Based on ACTUAL Table Structure)
// ============================================================================

// ECL Configuration Header Schema (FRS9_IMP_CA_ECL_CONFIGH - REAL structure)
const EclConfigurationHeaderSchema = z.object({
  ecl_model_name: z.string().min(1, 'ECL model name is required').max(50, 'Model name too long'),
  module: z.string().max(10, 'Module identifier too long').optional(),
  effective_date: z.string().datetime().transform(str => new Date(str)),
  active_flag: z.boolean().default(true),
  last_run_period: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  last_run_status: z.string().max(50, 'Status too long').optional(),
  last_run_date: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  
  // Audit fields (required for creation)
  createdby: z.string().min(1, 'Created by is required').max(50),
  createdhost: z.string().max(50, 'Host name too long').default('localhost')
});

// ECL Configuration Detail Schema (FRS9_IMP_CA_ECL_CONFIGD - REAL structure)
const EclConfigurationDetailSchema = z.object({
  ecl_model_id: z.number().int().positive('ECL model ID must be positive'),
  pf_segment_id: z.number().int().positive().optional(),
  stage_rule_id: z.number().int().positive().optional(),
  pd_model_id: z.number().int().positive().optional(),
  lgd_model_id: z.number().int().positive().optional(),
  ead_model_id: z.number().int().positive().optional(),
  overlay_rate: z.number().int().min(0).max(1000).default(100),
  period_type: z.number().int().optional(),
  period_date: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
  
  // Audit fields
  createdby: z.string().min(1, 'Created by is required').max(50),
  createdhost: z.string().max(50, 'Host name too long').default('localhost')
});

// Update schemas (partial)
const EclConfigurationHeaderUpdateSchema = EclConfigurationHeaderSchema.partial()
  .extend({
    updatedby: z.string().max(50, 'Updated by too long').optional(),
    updatedhost: z.string().max(50, 'Host name too long').default('localhost')
  });

const EclConfigurationDetailUpdateSchema = EclConfigurationDetailSchema.partial()
  .extend({
    updatedby: z.string().max(50, 'Updated by too long').optional(),
    updatedhost: z.string().max(50, 'Host name too long').default('localhost')
  });

// Simulation request schema
const SimulationRequestSchema = z.object({
  preview_data: z.any().optional(),
  calculation_date: z.string().datetime().optional().transform(str => str ? new Date(str) : new Date())
});

// ============================================================================
// ECL CONFIGURATION CONTROLLER CLASS
// ============================================================================

export class EclConfigurationController {
  private eclConfigurationService: EclConfigurationService;

  constructor() {
    this.eclConfigurationService = new EclConfigurationService();
    console.log('✅ [ECL-CTRL-001] EclConfigurationController initialized - DS2 FRS9PRO integration');
  }

  // ==========================================================================
  // HEADER OPERATIONS (FRS9_IMP_CA_ECL_CONFIGH)
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective/ecl-config
   * Get all ECL configuration headers with pagination
   */
  getHeaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔍 [ECL-CTRL-002] Getting ECL configuration headers');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      // Extract pagination and filter parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const active_only = req.query.active_flag === 'true';

      // Call service
      const result = await this.eclConfigurationService.getHeaders({
        page,
        limit,
        search,
        active_only
      });

      if (result.success) {
        console.log(`✅ [ECL-CTRL-003] Retrieved ${result.data?.data.length || 0} ECL configuration headers`);
        // Get database configuration
        const databaseConfig = appConfig.platformDb;

        res.json({
          success: true,
          data: result.data?.data || [],
          pagination: result.data?.pagination,
          message: 'ECL configuration headers retrieved successfully from DS2 database',
          database_info: {
            host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
            database: databaseConfig.frs9.database,
            table: 'frs9_imp_ca_ecl_configh',
            ssl: databaseConfig.frs9.ssl,
            environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: 'Failed to retrieve ECL configuration headers'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-004] Error in getHeaders:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * GET /api/v1/banking/collective/ecl-config/:pkid
   * Get single ECL configuration header with details
   */
  getHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pkid = parseInt(req.params.pkid);
      console.log(`🔍 [ECL-CTRL-005] Getting ECL configuration header ID: ${pkid}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(pkid)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration ID',
          error: 'INVALID_ID'
        });
        return;
      }

      const result = await this.eclConfigurationService.getHeader(pkid);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-006] Retrieved ECL configuration: ${result.data?.ecl_model_name}`);
        res.json({
          success: true,
          data: result.data,
          message: 'ECL configuration header retrieved successfully with details'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          message: `ECL configuration header with ID ${pkid} not found`
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-007] Error in getHeader:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * POST /api/v1/banking/collective/ecl-config
   * Create new ECL configuration header
   */
  createHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔧 [ECL-CTRL-008] Creating new ECL configuration header');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      // Validate request body with Zod
      const validationResult = EclConfigurationHeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration header data',
          errors: validationResult.error.errors
        });
        return;
      }

      const headerData = validationResult.data;

      // Call service
      const result = await this.eclConfigurationService.createHeader(headerData);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-009] ECL configuration header created: ${result.data?.ecl_model_name}`);
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'ECL configuration header created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to create ECL configuration header'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-010] Error in createHeader:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * PUT /api/v1/banking/collective/ecl-config/:pkid
   * Update ECL configuration header
   */
  updateHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pkid = parseInt(req.params.pkid);
      console.log(`🔧 [ECL-CTRL-011] Updating ECL configuration header ID: ${pkid}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(pkid)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration ID',
          error: 'INVALID_ID'
        });
        return;
      }

      // Validate request body with Zod
      const validationResult = EclConfigurationHeaderUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration header update data',
          errors: validationResult.error.errors
        });
        return;
      }

      const updateData = validationResult.data;

      // Call service
      const result = await this.eclConfigurationService.updateHeader(pkid, updateData);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-012] ECL configuration header updated: ${result.data?.ecl_model_name}`);
        res.json({
          success: true,
          data: result.data,
          message: 'ECL configuration header updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          message: 'Failed to update ECL configuration header'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-013] Error in updateHeader:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * DELETE /api/v1/banking/collective/ecl-config/:pkid
   * Delete ECL configuration header and all details
   */
  deleteHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pkid = parseInt(req.params.pkid);
      console.log(`🗑️ [ECL-CTRL-014] Deleting ECL configuration header ID: ${pkid}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(pkid)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration ID',
          error: 'INVALID_ID'
        });
        return;
      }

      // Call service
      const result = await this.eclConfigurationService.deleteHeader(pkid);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-015] ECL configuration header deleted: ID ${pkid}`);
        res.json({
          success: true,
          message: 'ECL configuration header and all details deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          message: 'Failed to delete ECL configuration header'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-016] Error in deleteHeader:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  // ==========================================================================
  // DETAIL OPERATIONS (FRS9_IMP_CA_ECL_CONFIGD)
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective/ecl-config/:pkid/details
   * Get all details for an ECL configuration header
   */
  getDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eclModelId = parseInt(req.params.pkid);
      console.log(`🔍 [ECL-CTRL-017] Getting ECL configuration details for model ID: ${eclModelId}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(eclModelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL model ID',
          error: 'INVALID_ID'
        });
        return;
      }

      const result = await this.eclConfigurationService.getDetails(eclModelId);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-018] Retrieved ${result.data?.length || 0} ECL configuration details`);
        res.json({
          success: true,
          data: result.data || [],
          message: 'ECL configuration details retrieved successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: 'Failed to retrieve ECL configuration details'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-019] Error in getDetails:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * POST /api/v1/banking/collective/ecl-config/:pkid/details
   * Create new detail for an ECL configuration header
   */
  createDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eclModelId = parseInt(req.params.pkid);
      console.log(`🔧 [ECL-CTRL-020] Creating new ECL configuration detail for model ID: ${eclModelId}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(eclModelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL model ID',
          error: 'INVALID_ID'
        });
        return;
      }

      // Validate request body with Zod
      const detailValidation = EclConfigurationDetailSchema.safeParse({
        ...req.body,
        ecl_model_id: eclModelId
      });

      if (!detailValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration detail data',
          errors: detailValidation.error.issues
        });
        return;
      }

      const detailData = detailValidation.data;

      // Call service
      const result = await this.eclConfigurationService.createDetail(detailData);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-021] ECL configuration detail created with ID: ${result.data?.pkid}`);
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'ECL configuration detail created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'Failed to create ECL configuration detail'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-022] Error in createDetail:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * PUT /api/v1/banking/collective/ecl-config/details/:detailId
   * Update ECL configuration detail
   */
  updateDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const detailId = parseInt(req.params.detailId);
      console.log(`🔧 [ECL-CTRL-022] Updating ECL configuration detail ID: ${detailId}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(detailId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid detail ID',
          error: 'INVALID_ID'
        });
        return;
      }

      // Validate request body with Zod
      const zodValidation = EclConfigurationDetailSchema.safeParse(req.body);
      if (!zodValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL configuration detail data',
          errors: zodValidation.error.issues
        });
        return;
      }

      const updateData = zodValidation.data;

      // Call service
      const result = await this.eclConfigurationService.updateDetail(detailId, updateData);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-023] ECL configuration detail updated: ID ${detailId}`);
        res.json({
          success: true,
          data: result.data,
          message: 'ECL configuration detail updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          message: 'Failed to update ECL configuration detail'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-024] Error in updateDetail:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * DELETE /api/v1/banking/collective/ecl-config/details/:detailId
   * Delete ECL configuration detail
   */
  deleteDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const detailId = parseInt(req.params.detailId);
      console.log(`🗑️ [ECL-CTRL-025] Deleting ECL configuration detail ID: ${detailId}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(detailId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid detail ID',
          error: 'INVALID_ID'
        });
        return;
      }

      // Call service
      const result = await this.eclConfigurationService.deleteDetail(detailId);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-026] ECL configuration detail deleted: ID ${detailId}`);
        res.json({
          success: true,
          message: 'ECL configuration detail deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error,
          message: 'Failed to delete ECL configuration detail'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-027] Error in deleteDetail:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  // ==========================================================================
  // SIMULATION AND INTEGRATION
  // ==========================================================================

  /**
   * POST /api/v1/banking/collective/ecl-config/:pkid/simulate
   * Run ECL model simulation
   */
  runSimulation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eclModelId = parseInt(req.params.pkid);
      console.log(`🧪 [ECL-CTRL-023] Running simulation for ECL model ID: ${eclModelId}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (isNaN(eclModelId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid ECL model ID',
          error: 'INVALID_ID'
        });
        return;
      }

      // Validate simulation request data
      const simulationValidation = SimulationRequestSchema.safeParse(req.body);
      if (!simulationValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid simulation request data',
          errors: simulationValidation.error.issues
        });
        return;
      }

      const { preview_data, calculation_date } = simulationValidation.data;

      // Call simulation service
      const result = await this.eclConfigurationService.runSimulation(
        eclModelId, 
        preview_data, 
        calculation_date
      );

      if (result.success) {
        console.log(`✅ [ECL-CTRL-024] Simulation completed for ${result.data?.ecl_model_name} (${result.data?.execution_time}ms)`);
        res.json({
          success: true,
          data: result.data,
          message: 'ECL model simulation completed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: 'ECL model simulation failed'
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-025] Error in runSimulation:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * GET /api/v1/banking/collective/ecl-config/combo-data/:source
   * Get combo box data from business settings
   */
  getComboBoxData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const source = req.params.source;
      console.log(`🔍 [ECL-CTRL-026] Getting combo box data for source: ${source}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const result = await this.eclConfigurationService.getComboBoxData(source);

      if (result.success) {
        console.log(`✅ [ECL-CTRL-027] Retrieved ${result.data?.length || 0} combo box items for ${source}`);
        res.json({
          success: true,
          data: result.data || [],
          message: `Combo box data for ${source} retrieved successfully`
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: `Failed to retrieve combo box data for ${source}`
        });
      }

    } catch (error) {
      console.error('❌ [ECL-CTRL-028] Error in getComboBoxData:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };
}

// ============================================================================
// INDIVIDUAL FUNCTION EXPORTS FOR ROUTE CONFIGURATION
// ============================================================================

// Create controller instance
const eclConfigurationController = new EclConfigurationController();

// Header operations
export const getHeaders = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.getHeaders(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const getHeader = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.getHeader(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const createHeader = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.createHeader(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const updateHeader = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.updateHeader(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const deleteHeader = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.deleteHeader(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Detail operations
export const getDetails = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.getDetails(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const createDetail = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.createDetail(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const updateDetail = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.updateDetail(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const deleteDetail = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.deleteDetail(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Simulation and integration
export const runSimulation = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.runSimulation(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const getComboBoxData = (req: Request, res: Response, next: NextFunction) => {
  try {
    return eclConfigurationController.getComboBoxData(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default EclConfigurationController;