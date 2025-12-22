// packages/backend/src/api/controllers/bucket-parameter.controller.ts
// ============================================================================
// BUCKET PARAMETER CONTROLLER - PHASE 3 MODULE 3.3
// ============================================================================
// Master-Detail controller for bucket parameter management
// Features: Range-based bucket logic, IFRS 9 aging buckets, master-detail CRUD
// Legacy compliance: ASP.NET MVC bucket parameter implementation
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { bucketParameterService } from '../../core/services/bucket-parameter.service';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createBucketHeaderSchema = z.object({
  bucket_name: z.string().min(1, 'Bucket name is required').max(100),
  bucket_description: z.string().max(500).optional(),
  bucket_type: z.enum(['AGING', 'RATING', 'AMOUNT', 'CUSTOM']),
  min_range: z.number().min(0).optional(),
  max_range: z.number().min(0).optional(),
  range_unit: z.enum(['DAYS', 'MONTHS', 'YEARS', 'AMOUNT', 'SCORE']).optional(),
  active_flag: z.boolean().default(true),
  seq: z.number().int().min(1).optional()
});

const updateBucketHeaderSchema = createBucketHeaderSchema.partial();

const createBucketDetailSchema = z.object({
  range_from: z.number().min(0),
  range_to: z.number().min(0),
  bucket_label: z.string().min(1, 'Bucket label is required').max(50),
  bucket_code: z.string().min(1, 'Bucket code is required').max(20),
  pd_rate: z.number().min(0).max(1).optional(),
  lgd_rate: z.number().min(0).max(1).optional(),
  weight: z.number().min(0).max(1).default(0),
  active_flag: z.boolean().default(true),
  seq: z.number().int().min(1)
}).refine(data => data.range_from <= data.range_to, {
  message: 'Range from must be less than or equal to range to',
  path: ['range_to']
});

const updateBucketDetailSchema = createBucketDetailSchema.partial();

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  bucket_type: z.enum(['AGING', 'RATING', 'AMOUNT', 'CUSTOM']).optional(),
  active_flag: z.enum(['true', 'false']).transform(val => val === 'true').optional()
});

// ============================================================================
// BUCKET PARAMETER CONTROLLER CLASS
// ============================================================================

export class BucketParameterController {

  // ==========================================================================
  // HEADER OPERATIONS
  // ==========================================================================

  /**
   * Get all bucket parameter headers with pagination and search
   */
  async getHeaders(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate query parameters
      const { page = 1, limit = 10, search, bucket_type, active_flag } = paginationSchema.parse(req.query);

      const result = await bucketParameterService.getHeaders({
        page,
        limit,
        search,
        bucket_type,
        active_flag
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Bucket parameter headers retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single bucket parameter header with details
   */
  async getHeader(req: Request, res: Response, next: NextFunction) {
    try {
      const headerId = parseInt(req.params.id);
      
      if (isNaN(headerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter ID',
          code: 'INVALID_ID'
        });
      }

      const result = await bucketParameterService.getHeaderById(headerId);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter header not found',
          code: 'BUCKET_HEADER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: result,
        message: 'Bucket parameter header retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new bucket parameter header
   */
  async createHeader(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createBucketHeaderSchema.parse(req.body);

      const result = await bucketParameterService.createHeader({
        ...validatedData,
        created_by: req.user?.email || 'system',
        created_host: req.ip
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Bucket parameter header created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: (error as any).errors,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  }

  /**
   * Update bucket parameter header
   */
  async updateHeader(req: Request, res: Response, next: NextFunction) {
    try {
      const headerId = parseInt(req.params.id);
      
      if (isNaN(headerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter ID',
          code: 'INVALID_ID'
        });
      }

      const validatedData = updateBucketHeaderSchema.parse(req.body);

      const result = await bucketParameterService.updateHeader(headerId, {
        ...validatedData,
        updated_by: req.user?.email || 'system',
        updated_host: req.ip
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter header not found',
          code: 'BUCKET_HEADER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: result,
        message: 'Bucket parameter header updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: (error as any).errors,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  }

  /**
   * Delete bucket parameter header and all associated details
   */
  async deleteHeader(req: Request, res: Response, next: NextFunction) {
    try {
      const headerId = parseInt(req.params.id);
      
      if (isNaN(headerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter ID',
          code: 'INVALID_ID'
        });
      }

      const success = await bucketParameterService.deleteHeader(headerId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter header not found',
          code: 'BUCKET_HEADER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Bucket parameter header and all details deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // DETAIL OPERATIONS
  // ==========================================================================

  /**
   * Get all details for a specific bucket header
   */
  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const headerId = parseInt(req.params.id);
      
      if (isNaN(headerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter ID',
          code: 'INVALID_ID'
        });
      }

      const result = await bucketParameterService.getDetailsByHeaderId(headerId);

      res.json({
        success: true,
        data: result,
        message: 'Bucket parameter details retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new detail for a bucket header
   */
  async createDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const headerId = parseInt(req.params.id);
      
      if (isNaN(headerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter ID',
          code: 'INVALID_ID'
        });
      }

      const validatedData = createBucketDetailSchema.parse(req.body);

      const result = await bucketParameterService.createDetail(headerId, {
        ...validatedData,
        created_by: req.user?.email || 'system',
        created_host: req.ip
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Bucket parameter detail created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: (error as any).errors,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  }

  /**
   * Update bucket parameter detail
   */
  async updateDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const detailId = parseInt(req.params.detailId);
      
      if (isNaN(detailId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket detail ID',
          code: 'INVALID_DETAIL_ID'
        });
      }

      const validatedData = updateBucketDetailSchema.parse(req.body);

      const result = await bucketParameterService.updateDetail(detailId, {
        ...validatedData,
        updated_by: req.user?.email || 'system',
        updated_host: req.ip
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter detail not found',
          code: 'BUCKET_DETAIL_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: result,
        message: 'Bucket parameter detail updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: (error as any).errors,
          code: 'VALIDATION_ERROR'
        });
      }
      next(error);
    }
  }

  /**
   * Delete bucket parameter detail
   */
  async deleteDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const detailId = parseInt(req.params.detailId);
      
      if (isNaN(detailId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket detail ID',
          code: 'INVALID_DETAIL_ID'
        });
      }

      const success = await bucketParameterService.deleteDetail(detailId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter detail not found',
          code: 'BUCKET_DETAIL_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Bucket parameter detail deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Get bucket types for dropdown
   */
  async getBucketTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const bucketTypes = [
        { value: 'AGING', label: 'Aging Buckets (DPD-based)' },
        { value: 'RATING', label: 'Rating Buckets (Credit Score)' },
        { value: 'AMOUNT', label: 'Amount Buckets (Exposure Size)' },
        { value: 'CUSTOM', label: 'Custom Buckets (User-defined)' }
      ];

      res.json({
        success: true,
        data: bucketTypes,
        message: 'Bucket types retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get range units for dropdown
   */
  async getRangeUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const rangeUnits = [
        { value: 'DAYS', label: 'Days (Aging Analysis)' },
        { value: 'MONTHS', label: 'Months (Term Analysis)' },
        { value: 'YEARS', label: 'Years (Long-term Analysis)' },
        { value: 'AMOUNT', label: 'Amount (Currency Units)' },
        { value: 'SCORE', label: 'Score (Rating Points)' }
      ];

      res.json({
        success: true,
        data: rangeUnits,
        message: 'Range units retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate bucket range overlaps
   */
  async validateRanges(req: Request, res: Response, next: NextFunction) {
    try {
      const headerId = parseInt(req.params.id);
      
      if (isNaN(headerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter ID',
          code: 'INVALID_ID'
        });
      }

      const validation = await bucketParameterService.validateBucketRanges(headerId);

      res.json({
        success: true,
        data: validation,
        message: 'Bucket range validation completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Service health check
   */
  async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const healthStatus = await bucketParameterService.getServiceHealth();

      res.json({
        success: true,
        data: healthStatus,
        message: 'Bucket parameter service is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================================
// EXPORT CONTROLLER INSTANCE
// ============================================================================

export const bucketParameterController = new BucketParameterController();
export default bucketParameterController;