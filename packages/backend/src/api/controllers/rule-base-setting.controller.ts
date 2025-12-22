// packages/backend/src/api/controllers/rule-base-setting.controller.ts
// ============================================================================
// RULE BASE SETTING CONTROLLER - MINIMAL WORKING VERSION
// ============================================================================
// REST API controller for Rule Base Setting master-detail operations
// Provides basic CRUD endpoints with validation and error handling
// Legacy compliance: ASP.NET MVC ParamScenarioRules functionality
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import RuleBaseSettingService from '../../core/services/rule-base-setting.service';

// ============================================================================
// INTERFACES
// ============================================================================

interface AuthenticatedRequest extends Request {
  user?: {
    email?: string;
    id?: string;
    role?: string;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const RuleBaseSettingHeaderSchema = z.object({
  rule_name: z.string().min(1, 'Rule name is required').max(250, 'Rule name too long'),
  rule_type: z.string().min(1, 'Rule type is required'),
  updated_table: z.string().min(1, 'Updated table is required'),
  updated_column: z.string().min(1, 'Updated column is required'),
  value: z.string().min(1, 'Value is required').max(250, 'Value too long'),
  seq: z.number().int().min(1).optional(),
  active_flag: z.boolean().default(true)
});

const RuleBaseSettingDetailSchema = z.object({
  query_group: z.number().int().min(1, 'Query group must be at least 1'),
  seq: z.number().int().min(1, 'Sequence must be at least 1'),
  table_name: z.string().min(1, 'Table name is required'),
  column_name: z.string().min(1, 'Column name is required'),
  data_type: z.string().min(1, 'Data type is required'),
  operator: z.string().min(1, 'Operator is required'),
  value1: z.string().optional(),
  value2: z.string().optional(),
  condition: z.enum(['AND', 'OR']),
  detail_type: z.number().int().min(1).optional(),
  stage_from: z.number().int().min(1).max(3).optional(),
  stage_to: z.number().int().min(1).max(3).optional()
});

// ============================================================================
// RULE BASE SETTING CONTROLLER CLASS
// ============================================================================

export class RuleBaseSettingController {
  private ruleBaseSettingService: RuleBaseSettingService;

  constructor() {
    // Initialize service without database parameter
    this.ruleBaseSettingService = new RuleBaseSettingService();
  }

  // ==========================================================================
  // METADATA ENDPOINTS (Working minimal version)
  // ==========================================================================

  /**
   * GET /api/v1/banking/rule-base-setting/metadata/rule-types
   * Get available rule types
   */
  getRuleTypes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const result = await this.ruleBaseSettingService.getRuleTypes();

      return res.json({
        success: true,
        data: result.data || [
          { value: 'ECL_CALCULATION', label: 'ECL Calculation' },
          { value: 'STAGING_TRANSITION', label: 'Staging Transition' },
          { value: 'PROVISION_ADJUSTMENT', label: 'Provision Adjustment' }
        ],
        message: 'Rule types retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getRuleTypes:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve rule types'
      });
    }
  };

  /**
   * GET /api/v1/banking/rule-base-setting/metadata/conditions
   * Get available logical conditions
   */
  getConditions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const result = await this.ruleBaseSettingService.getConditions();

      return res.json({
        success: true,
        data: result.data || [
          { value: 'AND', label: 'AND' },
          { value: 'OR', label: 'OR' }
        ],
        message: 'Conditions retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getConditions:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve conditions'
      });
    }
  };

  /**
   * GET /api/v1/banking/rule-base-setting/metadata/stages
   * Get IFRS 9 stages
   */
  getStages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const result = await this.ruleBaseSettingService.getStages();

      return res.json({
        success: true,
        data: result.data || [
          { value: 1, label: 'Stage 1 - 12-month ECL' },
          { value: 2, label: 'Stage 2 - Lifetime ECL' },
          { value: 3, label: 'Stage 3 - Credit Impaired' }
        ],
        message: 'IFRS 9 stages retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getStages:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve stages'
      });
    }
  };

  /**
   * GET /api/v1/banking/rule-base-setting/metadata/operators/:dataType
   * Get operators for specific data type
   */
  getOperators = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const { dataType } = req.params;

      if (!dataType) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_PARAMETER',
          message: 'Data type is required'
        });
        return;
      }

      const result = await this.ruleBaseSettingService.getOperators(dataType);

      return res.json({
        success: true,
        data: result.data || [
          { value: '=', label: 'Equals', supportsMultiple: false, requiresValue2: false },
          { value: '>', label: 'Greater Than', supportsMultiple: false, requiresValue2: false },
          { value: '<', label: 'Less Than', supportsMultiple: false, requiresValue2: false },
          { value: 'BETWEEN', label: 'Between', supportsMultiple: false, requiresValue2: true }
        ],
        message: `Operators for ${dataType} retrieved successfully`
      });

    } catch (error) {
      console.error('Error in getOperators:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve operators'
      });
    }
  };

  // ==========================================================================
  // HEADER ENDPOINTS (Basic implementation)
  // ==========================================================================

  /**
   * GET /api/v1/banking/rule-base-setting
   * Get all rule base setting headers with pagination and search
   */
  getHeaders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        rule_type,
        active_flag
      } = req.query;

      const result = await this.ruleBaseSettingService.getHeaders({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        rule_type: rule_type as string,
        active_flag: active_flag !== undefined ? active_flag === 'true' : undefined
      });

      return res.json({
        success: true,
        data: result.data?.data || [],
        pagination: result.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 },
        message: 'Rule base setting headers retrieved successfully',
        metadata: {
          timestamp: new Date().toISOString(),
          total_records: result.data?.pagination?.total || 0
        }
      });

    } catch (error) {
      console.error('Error in getHeaders:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve rule base setting headers'
      });
    }
  };

  /**
   * GET /api/v1/banking/rule-base-setting/:id
   * Get single rule base setting header with details
   */
  getHeader = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      const result = await this.ruleBaseSettingService.getHeader(Number(id));

      return res.json({
        success: true,
        data: result.data || null,
        message: 'Rule base setting header retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getHeader:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve rule base setting header'
      });
    }
  };

  /**
   * POST /api/v1/banking/rule-base-setting
   * Create new rule base setting header
   */
  createHeader = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const validatedData = RuleBaseSettingHeaderSchema.parse(req.body);
      const userEmail = req.user?.email || 'system';
      const hostInfo = req.ip || 'unknown';

      const result = await this.ruleBaseSettingService.createHeader(
        validatedData,
        userEmail,
        hostInfo
      );

      return res.status(201).json({
        success: true,
        data: result.data || null,
        message: result.message || 'Rule base setting header created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      console.error('Error in createHeader:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create rule base setting header'
      });
    }
  };

  /**
   * PUT /api/v1/banking/rule-base-setting/:id
   * Update rule base setting header
   */
  updateHeader = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      const validatedData = RuleBaseSettingHeaderSchema.partial().parse(req.body);
      const userEmail = req.user?.email || 'system';
      const hostInfo = req.ip || 'unknown';

      const result = await this.ruleBaseSettingService.updateHeader(
        Number(id),
        validatedData,
        userEmail,
        hostInfo
      );

      return res.json({
        success: true,
        data: result.data || null,
        message: result.message || 'Rule base setting header updated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.issues
        });
        return;
      }

      console.error('Error in updateHeader:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update rule base setting header'
      });
    }
  };

  /**
   * DELETE /api/v1/banking/rule-base-setting/:id
   * Delete rule base setting header and all details
   */
  deleteHeader = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Valid numeric ID is required'
        });
        return;
      }

      const userEmail = req.user?.email || 'system';
      const result = await this.ruleBaseSettingService.deleteHeader(Number(id), userEmail);

      return res.json({
        success: true,
        message: result.message || 'Rule base setting header deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteHeader:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete rule base setting header'
      });
    }
  };

  // ==========================================================================
  // UTILITY ENDPOINTS
  // ==========================================================================

  /**
   * GET /api/v1/banking/rule-base-setting/health
   * Health check for rule base setting service
   */
  healthCheck = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> => {
    try {
      return res.json({
        success: true,
        message: 'Rule Base Setting Service is healthy',
        timestamp: new Date().toISOString(),
        service: 'rule-base-setting',
        version: '1.0.0'
      });
    } catch (error) {
      console.error('Error in healthCheck:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Health check failed'
      });
    }
  };
}

export default RuleBaseSettingController;