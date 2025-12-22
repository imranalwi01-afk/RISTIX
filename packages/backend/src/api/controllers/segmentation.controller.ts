// packages/backend/src/api/controllers/segmentation.controller.ts
// ============================================================================
// 🔧 SEGMENTATION CONFIGURATION CONTROLLER - PHASE 3 MODULE 3.1
// ============================================================================
// ✅ PATTERN: Master-Detail with Dynamic Forms + Business Settings Integration
// ✅ DATABASE: frs9_param_segmenth (header) + frs9_param_segmentd (detail)
// ✅ FEATURES: Cascading dropdowns, conditional value inputs, operator validation
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import { SegmentationService } from '../../core/services/segmentation.service';
import { BusinessSettingsService } from '../../core/services/business-settings.service';
import { handleAPIError } from '../../utils/error-handler';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SegmentationHeaderSchema = z.object({
  group_segment: z.string().min(1, 'Group Segment is required').max(150, 'Group Segment must be 150 characters or less'),
  segment: z.string().min(1, 'Segment is required').max(150, 'Segment must be 150 characters or less'),
  sub_segment: z.string().max(150, 'Sub Segment must be 150 characters or less').transform(val => val || undefined).optional(),
  segment_type: z.string().min(1, 'Segment Type is required'),
  seq: z.union([z.number().int().min(1, 'Sequence must be at least 1'), z.null()]).optional().transform(val => val === null ? undefined : val),
  active_flag: z.boolean().default(true)
});

const SegmentationDetailSchema = z.object({
  segment_id: z.number().int().min(1, 'Segment ID is required'),
  query_group: z.number().int().min(1, 'Query Group is required'),
  seq: z.number().int().min(1, 'Sequence is required'),
  table_name: z.string().min(1, 'Table Name is required'),
  column_name: z.string().min(1, 'Column Name is required'),
  data_type: z.string().min(1, 'Data Type is required'),
  operator: z.string().min(1, 'Operator is required'),
  value1: z.string().optional().nullable(),
  value2: z.string().optional().nullable(),
  condition: z.string().optional().nullable()
});

// ============================================================================
// SEGMENTATION CONTROLLER CLASS
// ============================================================================

export class SegmentationController {
  private segmentationService: SegmentationService;
  private businessSettingsService: BusinessSettingsService;

  constructor() {
    this.segmentationService = new SegmentationService();
    this.businessSettingsService = new BusinessSettingsService();
    console.log('✅ [SEGM-CTRL-INIT] SegmentationController initialized with real database integration');
  }

  // ============================================================================
  // HEADER ENDPOINTS (MASTER)
  // ============================================================================

  /**
   * GET /api/v1/banking/segmentation
   * Get all segmentation headers with detail counts
   */
  async getHeaders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [SEGM-001] Getting segmentation headers with detail counts');
      
      const { page = 1, limit = 10, search } = req.query;
      
      const result = await this.segmentationService.getHeaders({
        page: Number(page),
        limit: Number(limit),
        search: search as string
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-001] Failed to get segmentation headers:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/banking/segmentation
   * Create new segmentation header
   */
  async createHeader(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('➕ [SEGM-002] Creating segmentation header:', req.body);
      
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      // Validate with Zod schema
      console.log('🔍 [SEGM-002] Raw request body before Zod validation:', JSON.stringify(req.body, null, 2));
      
      let validatedData;
      try {
        validatedData = SegmentationHeaderSchema.parse(req.body);
        console.log('✅ [SEGM-002] Zod validation passed:', JSON.stringify(validatedData, null, 2));
      } catch (zodError: any) {
        console.error('❌ [SEGM-002] Zod validation failed:', zodError);
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: zodError.errors || zodError.message
        });
        return;
      }
      
      const header = await this.segmentationService.createHeader(
        validatedData,
        (req as any).user?.email,
        req.ip
      );

      res.status(201).json({
        success: true,
        data: header,
        message: 'Segmentation header created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-002] Failed to create segmentation header:', error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/banking/segmentation/:id
   * Update segmentation header
   */
  async updateHeader(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerId = parseInt(req.params.id);
      console.log(`✏️ [SEGM-003] Updating segmentation header ID: ${headerId}`, req.body);
      
      if (isNaN(headerId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid header ID'
        });
        return;
      }

      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      // Validate with Zod schema
      const validatedData = SegmentationHeaderSchema.parse(req.body);
      
      const header = await this.segmentationService.updateHeader(
        headerId,
        validatedData,
        (req as any).user?.email,
        req.ip
      );

      res.json({
        success: true,
        data: header,
        message: 'Segmentation header updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-003] Failed to update segmentation header:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/banking/segmentation/:id
   * Delete segmentation header and cascade delete details
   */
  async deleteHeader(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerId = parseInt(req.params.id);
      console.log(`🗑️ [SEGM-004] Deleting segmentation header ID: ${headerId}`);
      
      if (isNaN(headerId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid header ID'
        });
        return;
      }

      await this.segmentationService.deleteHeader(headerId, (req as any).user?.email || 'system');

      res.json({
        success: true,
        message: 'Segmentation header and all details deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-004] Failed to delete segmentation header:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/:id
   * Get single segmentation header with basic info
   */
  async getHeaderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerId = parseInt(req.params.id);
      console.log(`🔍 [SEGM-005] Getting segmentation header ID: ${headerId}`);
      
      if (isNaN(headerId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid header ID'
        });
        return;
      }

      const header = await this.segmentationService.getHeader(headerId);

      if (!header) {
        res.status(404).json({
          success: false,
          error: 'HEADER_NOT_FOUND',
          message: 'Segmentation header not found'
        });
        return;
      }

      res.json({
        success: true,
        data: header,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-005] Failed to get segmentation header:', error);
      next(error);
    }
  }

  // ============================================================================
  // DETAIL ENDPOINTS (DETAIL)
  // ============================================================================

  /**
   * GET /api/v1/banking/segmentation/:id/details
   * Get all detail rules for a segmentation header
   */
  async getDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerId = parseInt(req.params.id);
      console.log(`🔍 [SEGM-006] Getting segmentation details for header ID: ${headerId}`);
      
      if (isNaN(headerId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid header ID'
        });
        return;
      }

      const details = await this.segmentationService.getDetails(headerId);

      res.json({
        success: true,
        data: details,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id,
          headerId: headerId
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-006] Failed to get segmentation details:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/banking/segmentation/:id/details
   * Create new detail rule for segmentation header
   */
  async createDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const headerId = parseInt(req.params.id);
      console.log(`➕ [SEGM-007] Creating segmentation detail for header ID: ${headerId}`, req.body);
      
      if (isNaN(headerId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid header ID'
        });
        return;
      }

      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      // Add header ID to request body
      const detailData = { ...req.body, segment_id: headerId };
      
      // Validate with Zod schema
      const validatedData = SegmentationDetailSchema.parse(detailData);
      
      const detail = await this.segmentationService.createDetail(
        headerId,
        validatedData,
        (req as any).user?.email || 'system',
        req.ip
      );

      res.status(201).json({
        success: true,
        data: detail,
        message: 'Segmentation detail created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id,
          headerId: headerId
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-007] Failed to create segmentation detail:', error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/banking/segmentation/details/:detailId
   * Update segmentation detail rule
   */
  async updateDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const detailId = parseInt(req.params.detailId);
      console.log(`✏️ [SEGM-008] Updating segmentation detail ID: ${detailId}`, req.body);
      
      if (isNaN(detailId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid detail ID'
        });
        return;
      }

      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      // Partial validation for update (segment_id not required)
      const updateSchema = SegmentationDetailSchema.omit({ segment_id: true });
      const validatedData = updateSchema.parse(req.body);
      
      const detail = await this.segmentationService.updateDetail(
        detailId,
        validatedData,
        (req as any).user?.email,
        req.ip
      );

      res.json({
        success: true,
        data: detail,
        message: 'Segmentation detail updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-008] Failed to update segmentation detail:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/banking/segmentation/details/:detailId
   * Delete segmentation detail rule
   */
  async deleteDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const detailId = parseInt(req.params.detailId);
      console.log(`🗑️ [SEGM-009] Deleting segmentation detail ID: ${detailId}`);
      
      if (isNaN(detailId)) {
        res.status(400).json({
          success: false,
          error: 'INVALID_ID',
          message: 'Invalid detail ID'
        });
        return;
      }

      await this.segmentationService.deleteDetail(detailId, (req as any).user?.email || 'system');

      res.json({
        success: true,
        message: 'Segmentation detail deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          tenantId: (req as any).tenant?.id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-009] Failed to delete segmentation detail:', error);
      next(error);
    }
  }

  // ============================================================================
  // BUSINESS SETTINGS INTEGRATION ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/banking/segmentation/business-settings/tables
   * Get table names from Business Setting B0012
   */
  async getTableNames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [SEGM-010] Getting table names from Business Setting B0012');
      
      const tables = await this.businessSettingsService.getTableNames();

      res.json({
        success: true,
        data: tables,
        message: 'Table names retrieved successfully from Business Setting B0012',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          businessSetting: 'B0012'
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-010] Failed to get table names:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/business-settings/columns/:tableName
   * Get column names for selected table from Business Setting B0013
   */
  async getColumnNames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tableName = req.params.tableName;
      console.log(`🔍 [SEGM-011] Getting column names for table: ${tableName} from Business Setting B0013`);
      
      if (!tableName) {
        res.status(400).json({
          success: false,
          error: 'MISSING_TABLE_NAME',
          message: 'Table name is required'
        });
        return;
      }

      const columns = await this.businessSettingsService.getColumnNames(tableName);

      res.json({
        success: true,
        data: columns,
        message: `Column names retrieved successfully for table ${tableName}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          businessSetting: 'B0013',
          tableName: tableName
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-011] Failed to get column names:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/business-settings/data-type/:tableName/:columnName
   * Get data type for selected column from Business Setting B0013
   */
  async getDataType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableName, columnName } = req.params;
      console.log(`🔍 [SEGM-012] Getting data type for ${tableName}.${columnName} from Business Setting B0013`);
      
      if (!tableName || !columnName) {
        res.status(400).json({
          success: false,
          error: 'MISSING_PARAMETERS',
          message: 'Table name and column name are required'
        });
        return;
      }

      const dataType = await this.businessSettingsService.getDataType(tableName, columnName);

      res.json({
        success: true,
        data: { dataType },
        message: `Data type retrieved successfully for ${tableName}.${columnName}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          businessSetting: 'B0013',
          tableName: tableName,
          columnName: columnName
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-012] Failed to get data type:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/business-settings/operators/:dataType
   * Get operators for selected data type from Business Setting B0014
   */
  async getOperators(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dataType = req.params.dataType;
      console.log(`🔍 [SEGM-013] Getting operators for data type: ${dataType} from Business Setting B0014`);
      
      if (!dataType) {
        res.status(400).json({
          success: false,
          error: 'MISSING_DATA_TYPE',
          message: 'Data type is required'
        });
        return;
      }

      const operators = await this.businessSettingsService.getOperators(dataType);

      res.json({
        success: true,
        data: operators,
        message: `Operators retrieved successfully for data type ${dataType}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          businessSetting: 'B0014',
          dataType: dataType
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-013] Failed to get operators:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/business-settings/conditions
   * Get condition options (AND/OR) from Business Setting B0015
   */
  async getConditions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [SEGM-014] Getting conditions from Business Setting B0015');
      
      const conditions = await this.businessSettingsService.getConditions();

      res.json({
        success: true,
        data: conditions,
        message: 'Conditions retrieved successfully from Business Setting B0015',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          businessSetting: 'B0015'
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-014] Failed to get conditions:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/business-settings/values/:tableName/:columnName
   * Get distinct values for IN/NOT IN operators from Business Setting B0016
   */
  async getColumnValues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableName, columnName } = req.params;
      console.log(`🔍 [SEGM-015] Getting column values for ${tableName}.${columnName} from Business Setting B0016`);
      
      if (!tableName || !columnName) {
        res.status(400).json({
          success: false,
          error: 'MISSING_PARAMETERS',
          message: 'Table name and column name are required'
        });
        return;
      }

      const values = await this.businessSettingsService.getColumnValues(tableName, columnName);

      res.json({
        success: true,
        data: values,
        message: `Column values retrieved successfully for ${tableName}.${columnName}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id,
          businessSetting: 'B0016',
          tableName: tableName,
          columnName: columnName
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-015] Failed to get column values:', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/banking/segmentation/business-settings/segment-types
   * Get segment type options for header dropdown
   */
  async getSegmentTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [SEGM-016] Getting segment types');
      
      const segmentTypes = await this.businessSettingsService.getSegmentTypes();

      res.json({
        success: true,
        data: segmentTypes,
        message: 'Segment types retrieved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).id
        }
      });

    } catch (error) {
      console.error('❌ [SEGM-016] Failed to get segment types:', error);
      next(error);
    }
  }
}

// Export controller instance
export const segmentationController = new SegmentationController();