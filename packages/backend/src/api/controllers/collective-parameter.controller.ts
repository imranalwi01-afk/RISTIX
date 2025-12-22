// packages/backend/src/api/controllers/collective-parameter.controller.ts
// ============================================================================
// 🔧 COLLECTIVE PARAMETER CONTROLLER - PHASE 3 MODULE 3.4
// ============================================================================
// ✅ PATTERN: Master-Detail with Integration Links + Configuration Orchestration
// ✅ FEATURES: Module integration (3.1-3.3), validation engine, calculation preview
// ✅ LEGACY: ASP.NET MVC collective parameter management functionality
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import { CollectiveParameterService } from '../../core/services/collective-parameter.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CollectiveParameterHeaderSchema = z.object({
  template_name: z.string().min(1, 'Template name is required').max(200, 'Template name too long'),
  template_description: z.string().max(500, 'Description too long').optional(),
  template_type: z.enum(['PORTFOLIO', 'SEGMENT', 'PRODUCT', 'CUSTOM'], {
    required_error: 'Template type is required'
  }),
  
  // Integration with other modules (3.1, 3.2, 3.3)
  segmentation_id: z.number().int().positive().optional(),
  rule_base_setting_id: z.number().int().positive().optional(),
  bucket_parameter_id: z.number().int().positive().optional(),
  
  // Collective calculation configuration
  calculation_method: z.enum(['COLLECTIVE', 'HYBRID'], {
    required_error: 'Calculation method is required'
  }).default('COLLECTIVE'),
  aggregation_level: z.enum(['ACCOUNT', 'SEGMENT', 'PORTFOLIO'], {
    required_error: 'Aggregation level is required'
  }).default('SEGMENT'),
  
  // IFRS 9 specific configurations (JSON)
  stage_override_rules: z.any().optional(),
  sicr_triggers: z.any().optional(),
  default_definitions: z.any().optional(),
  
  // Execution settings
  active_flag: z.boolean().default(true),
  execution_priority: z.number().int().min(1).default(1),
  effective_date: z.string().datetime().optional().transform(str => str ? new Date(str) : new Date()),
  expiry_date: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined)
});

const CollectiveParameterDetailSchema = z.object({
  parameter_type: z.enum(['PD_OVERRIDE', 'LGD_ADJUSTMENT', 'EAD_FACTOR', 'STAGING_RULE', 'SICR_THRESHOLD', 'DEFAULT_TRIGGER'], {
    required_error: 'Parameter type is required'
  }),
  parameter_name: z.string().min(1, 'Parameter name is required').max(200, 'Parameter name too long'),
  parameter_value: z.string().min(1, 'Parameter value is required'),
  parameter_unit: z.string().max(50, 'Parameter unit too long').optional(),
  
  // Application scope
  apply_to_segment: z.string().max(100, 'Segment name too long').optional(),
  apply_to_product: z.string().max(100, 'Product name too long').optional(),
  apply_to_stage: z.number().int().min(1).max(3).optional(),
  
  // Execution control
  execution_order: z.number().int().min(1).default(1),
  dependency_rules: z.any().optional(),
  
  // Validation
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  validation_rules: z.any().optional(),
  
  active_flag: z.boolean().default(true)
});

const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  template_type: z.enum(['PORTFOLIO', 'SEGMENT', 'PRODUCT', 'CUSTOM']).optional(),
  active_flag: z.enum(['true', 'false']).transform(val => val === 'true').optional()
});

// ============================================================================
// COLLECTIVE PARAMETER CONTROLLER CLASS
// ============================================================================

export class CollectiveParameterController {
  private collectiveParameterService: CollectiveParameterService;

  constructor() {
    this.collectiveParameterService = new CollectiveParameterService();
    console.log('✅ [COLL-CTRL-001] CollectiveParameterController initialized - Module 3.4 ready');
  }

  // ==========================================================================
  // HEADER ENDPOINTS (MASTER)
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective-parameter
   * Get all collective parameter headers with pagination and search
   */
  getHeaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔍 [COLL-CTRL-002] Getting collective parameter headers');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: errors.array()
        });
        return;
      }

      const { page, limit, search, template_type, active_flag } = PaginationSchema.parse(req.query);

      const result = await this.collectiveParameterService.getHeaders({
        page,
        limit,
        search,
        template_type,
        active_flag
      });

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-003] Retrieved ${result.data?.data.length || 0} collective parameter headers`);

      res.json({
        success: true,
        data: result.data?.data || [],
        pagination: result.data?.pagination,
        message: 'Collective parameter headers retrieved successfully',
        metadata: {
          timestamp: new Date().toISOString(),
          total_records: result.data?.pagination.total || 0,
          module: 'collective_parameter',
          version: '3.4'
        }
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-004] Error in getHeaders:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve collective parameter headers'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/:id
   * Get single collective parameter header with details
   */
  getHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`🔍 [COLL-CTRL-005] Getting collective parameter header ID: ${id}`);

      const result = await this.collectiveParameterService.getHeader(Number(id));

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-006] Retrieved collective parameter header: ${result.data?.template_name}`);

      res.json({
        success: true,
        data: result.data,
        message: 'Collective parameter header retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-007] Error in getHeader:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve collective parameter header'
      });
    }
  };

  /**
   * POST /api/v1/banking/collective-parameter
   * Create new collective parameter header
   */
  createHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('📝 [COLL-CTRL-008] Creating collective parameter header');
      
      const validatedData = CollectiveParameterHeaderSchema.parse(req.body);

      const userEmail = req.user?.email || 'system';
      const hostInfo = req.ip || 'unknown';

      const result = await this.collectiveParameterService.createHeader(
        validatedData,
        userEmail,
        hostInfo
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'CREATION_FAILED',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-009] Created collective parameter header: ${result.data?.template_name}`);

      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      console.error('❌ [COLL-CTRL-010] Error in createHeader:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create collective parameter header'
      });
    }
  };

  /**
   * PUT /api/v1/banking/collective-parameter/:id
   * Update collective parameter header
   */
  updateHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`📝 [COLL-CTRL-011] Updating collective parameter header ID: ${id}`);

      const validatedData = CollectiveParameterHeaderSchema.partial().parse(req.body);

      const userEmail = req.user?.email || 'system';
      const hostInfo = req.ip || 'unknown';

      const result = await this.collectiveParameterService.updateHeader(
        Number(id),
        validatedData,
        userEmail,
        hostInfo
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'UPDATE_FAILED',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-012] Updated collective parameter header: ${result.data?.template_name}`);

      res.json({
        success: true,
        data: result.data,
        message: result.message
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      console.error('❌ [COLL-CTRL-013] Error in updateHeader:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update collective parameter header'
      });
    }
  };

  /**
   * DELETE /api/v1/banking/collective-parameter/:id
   * Delete collective parameter header and all details
   */
  deleteHeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`🗑️ [COLL-CTRL-014] Deleting collective parameter header ID: ${id}`);

      const userEmail = req.user?.email || 'system';

      const result = await this.collectiveParameterService.deleteHeader(Number(id), userEmail);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'DELETE_FAILED',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-015] Deleted collective parameter header ID: ${id}`);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-016] Error in deleteHeader:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete collective parameter header'
      });
    }
  };

  // ==========================================================================
  // DETAIL ENDPOINTS
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective-parameter/:id/details
   * Get all details for a specific collective parameter header
   */
  getDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric collective parameter ID is required'
        });
        return;
      }

      console.log(`🔍 [COLL-CTRL-017] Getting details for collective parameter ID: ${id}`);

      const result = await this.collectiveParameterService.getDetails(Number(id));

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-018] Retrieved ${result.data?.length || 0} details for collective parameter ID: ${id}`);

      res.json({
        success: true,
        data: result.data || [],
        message: 'Collective parameter details retrieved successfully',
        metadata: {
          collective_parameter_id: Number(id),
          detail_count: result.data?.length || 0
        }
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-019] Error in getDetails:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve collective parameter details'
      });
    }
  };

  /**
   * POST /api/v1/banking/collective-parameter/:id/details
   * Create new detail for a collective parameter header
   */
  createDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric collective parameter ID is required'
        });
        return;
      }

      console.log(`📝 [COLL-CTRL-020] Creating detail for collective parameter ID: ${id}`);

      const validatedData = CollectiveParameterDetailSchema.parse(req.body);

      const userEmail = req.user?.email || 'system';
      const hostInfo = req.ip || 'unknown';

      const result = await this.collectiveParameterService.createDetail(
        Number(id),
        validatedData,
        userEmail,
        hostInfo
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'CREATION_FAILED',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-021] Created detail: ${result.data?.parameter_name}`);

      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      console.error('❌ [COLL-CTRL-022] Error in createDetail:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create collective parameter detail'
      });
    }
  };

  /**
   * PUT /api/v1/banking/collective-parameter/details/:detailId
   * Update collective parameter detail
   */
  updateDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { detailId } = req.params;

      if (!detailId || isNaN(Number(detailId))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric detail ID is required'
        });
        return;
      }

      console.log(`📝 [COLL-CTRL-023] Updating collective parameter detail ID: ${detailId}`);

      const validatedData = CollectiveParameterDetailSchema.partial().parse(req.body);

      const userEmail = req.user?.email || 'system';
      const hostInfo = req.ip || 'unknown';

      const result = await this.collectiveParameterService.updateDetail(
        Number(detailId),
        validatedData,
        userEmail,
        hostInfo
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'UPDATE_FAILED',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-024] Updated detail: ${result.data?.parameter_name}`);

      res.json({
        success: true,
        data: result.data,
        message: result.message
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      console.error('❌ [COLL-CTRL-025] Error in updateDetail:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update collective parameter detail'
      });
    }
  };

  /**
   * DELETE /api/v1/banking/collective-parameter/details/:detailId
   * Delete collective parameter detail
   */
  deleteDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { detailId } = req.params;

      if (!detailId || isNaN(Number(detailId))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric detail ID is required'
        });
        return;
      }

      console.log(`🗑️ [COLL-CTRL-026] Deleting collective parameter detail ID: ${detailId}`);

      const userEmail = req.user?.email || 'system';

      const result = await this.collectiveParameterService.deleteDetail(Number(detailId), userEmail);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'DELETE_FAILED',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-027] Deleted collective parameter detail ID: ${detailId}`);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-028] Error in deleteDetail:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete collective parameter detail'
      });
    }
  };

  // ==========================================================================
  // INTEGRATION ENDPOINTS (MODULE 3.4 SPECIFIC)
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective-parameter/:id/linkage-status
   * Get module linkage status with modules 3.1-3.3
   */
  getModuleLinkageStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`🔗 [COLL-CTRL-029] Getting module linkage status for ID: ${id}`);

      const result = await this.collectiveParameterService.getModuleLinkageStatus(Number(id));

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-030] Retrieved module linkage status for ID: ${id}`);

      res.json({
        success: true,
        data: result.data,
        message: 'Module linkage status retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-031] Error in getModuleLinkageStatus:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve module linkage status'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/:id/configuration
   * Get complete collective configuration with linked modules
   */
  getCollectiveConfiguration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`⚙️ [COLL-CTRL-032] Getting collective configuration for ID: ${id}`);

      const result = await this.collectiveParameterService.getCollectiveConfiguration(Number(id));

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-033] Retrieved collective configuration for ID: ${id}`);

      res.json({
        success: true,
        data: result.data,
        message: 'Collective configuration retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-034] Error in getCollectiveConfiguration:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve collective configuration'
      });
    }
  };

  /**
   * POST /api/v1/banking/collective-parameter/:id/validate
   * Validate collective parameter configuration
   */
  validateConfiguration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`🔍 [COLL-CTRL-035] Validating configuration for ID: ${id}`);

      const result = await this.collectiveParameterService.validateConfiguration(Number(id));

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-036] Configuration validation completed for ID: ${id}`);

      res.json({
        success: true,
        data: result.data,
        message: 'Configuration validation completed'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-037] Error in validateConfiguration:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate configuration'
      });
    }
  };

  /**
   * POST /api/v1/banking/collective-parameter/:id/preview-calculation
   * Preview calculation impact with sample data
   */
  previewCalculation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      console.log(`📊 [COLL-CTRL-038] Previewing calculation for ID: ${id}`);

      const sampleData = req.body; // Optional sample data

      const result = await this.collectiveParameterService.previewCalculation(Number(id), sampleData);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      console.log(`✅ [COLL-CTRL-039] Calculation preview completed for ID: ${id}`);

      res.json({
        success: true,
        data: result.data,
        message: 'Calculation preview completed successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-040] Error in previewCalculation:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to preview calculation'
      });
    }
  };

  // ==========================================================================
  // METADATA ENDPOINTS
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective-parameter/metadata/template-types
   * Get available template types
   */
  getTemplateTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templateTypes = [
        { value: 'PORTFOLIO', label: 'Portfolio Level - Aggregate all accounts' },
        { value: 'SEGMENT', label: 'Segment Level - Group by customer segments' },
        { value: 'PRODUCT', label: 'Product Level - Group by product types' },
        { value: 'CUSTOM', label: 'Custom Level - User-defined grouping' }
      ];

      res.json({
        success: true,
        data: templateTypes,
        message: 'Template types retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-041] Error in getTemplateTypes:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve template types'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/metadata/calculation-methods
   * Get available calculation methods
   */
  getCalculationMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const calculationMethods = [
        { value: 'COLLECTIVE', label: 'Collective Assessment - Homogeneous groups' },
        { value: 'HYBRID', label: 'Hybrid Approach - Collective + Individual' }
      ];

      res.json({
        success: true,
        data: calculationMethods,
        message: 'Calculation methods retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-042] Error in getCalculationMethods:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve calculation methods'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/metadata/aggregation-levels
   * Get available aggregation levels
   */
  getAggregationLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const aggregationLevels = [
        { value: 'ACCOUNT', label: 'Account Level - Individual account analysis' },
        { value: 'SEGMENT', label: 'Segment Level - Customer segment grouping' },
        { value: 'PORTFOLIO', label: 'Portfolio Level - Portfolio-wide analysis' }
      ];

      res.json({
        success: true,
        data: aggregationLevels,
        message: 'Aggregation levels retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-043] Error in getAggregationLevels:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve aggregation levels'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/metadata/parameter-types
   * Get available parameter types
   */
  getParameterTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parameterTypes = [
        { value: 'PD_OVERRIDE', label: 'PD Override - Probability of Default adjustment' },
        { value: 'LGD_ADJUSTMENT', label: 'LGD Adjustment - Loss Given Default modification' },
        { value: 'EAD_FACTOR', label: 'EAD Factor - Exposure at Default multiplier' },
        { value: 'STAGING_RULE', label: 'Staging Rule - IFRS 9 stage assignment logic' },
        { value: 'SICR_THRESHOLD', label: 'SICR Threshold - Significant increase criteria' },
        { value: 'DEFAULT_TRIGGER', label: 'Default Trigger - Stage 3 identification rules' }
      ];

      res.json({
        success: true,
        data: parameterTypes,
        message: 'Parameter types retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-044] Error in getParameterTypes:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve parameter types'
      });
    }
  };

  // ==========================================================================
  // LINKED MODULE ENDPOINTS
  // ==========================================================================

  /**
   * GET /api/v1/banking/collective-parameter/linked-modules/segmentation
   * Get available segmentation configurations for linking
   */
  getAvailableSegmentations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔗 [COLL-CTRL-045] Getting available segmentation configurations');

      const result = await this.collectiveParameterService.getAvailableSegmentations();

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Available segmentation configurations retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-046] Error in getAvailableSegmentations:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve available segmentation configurations'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/linked-modules/rule-base-settings
   * Get available rule base settings for linking
   */
  getAvailableRuleBaseSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔗 [COLL-CTRL-047] Getting available rule base settings');

      const result = await this.collectiveParameterService.getAvailableRuleBaseSettings();

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Available rule base settings retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-048] Error in getAvailableRuleBaseSettings:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve available rule base settings'
      });
    }
  };

  /**
   * GET /api/v1/banking/collective-parameter/linked-modules/bucket-parameters
   * Get available bucket parameters for linking
   */
  getAvailableBucketParameters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔗 [COLL-CTRL-049] Getting available bucket parameters');

      const result = await this.collectiveParameterService.getAvailableBucketParameters();

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'SERVICE_ERROR',
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Available bucket parameters retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [COLL-CTRL-050] Error in getAvailableBucketParameters:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve available bucket parameters'
      });
    }
  };
}

export default CollectiveParameterController;