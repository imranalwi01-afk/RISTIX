// packages/backend/src/core/services/bucket-parameter.service.ts
// ============================================================================
// 📊 BUCKET PARAMETER SERVICE - IFRS9 STANDARDIZATION
// ============================================================================
// ✅ PURPOSE: Standardized bucket parameter management with base service patterns
// ✅ PATTERN: Extends BaseService for consistency and error handling
// ✅ COMPLIANCE: IFRS9 standardization requirements
// ============================================================================

import { injectable, inject } from 'inversify';
import { Transaction, Op, WhereOptions } from 'sequelize';
import { TYPES } from '../container/dependency-injection.container';
import { ConfigurationFactoryService } from './configuration/configuration-factory.service';
import { LoggerService } from '../container/dependency-injection.container';
import { BaseService, ServiceOptions, PaginationOptions, ServiceResponse, SearchFilters } from './base/base.service';
import { BucketParameterHeader, BucketParameterDetail } from '../models/bucket-parameter.models';

// ============================================================================
// INTERFACES
// ============================================================================

interface BucketHeaderCreateData {
  bucket_name: string;
  bucket_description?: string;
  bucket_type: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  min_range?: number;
  max_range?: number;
  range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  active_flag?: boolean;
  seq?: number;
  created_by?: string;
  created_host?: string;
}

interface BucketHeaderUpdateData {
  bucket_name?: string;
  bucket_description?: string;
  bucket_type?: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  min_range?: number;
  max_range?: number;
  range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  active_flag?: boolean;
  seq?: number;
  updated_by?: string;
  updated_host?: string;
}

interface BucketDetailCreateData {
  range_from: number;
  range_to: number;
  bucket_label: string;
  bucket_code: string;
  pd_rate?: number;
  lgd_rate?: number;
  weight?: number;
  active_flag?: boolean;
  seq: number;
  created_by?: string;
  created_host?: string;
}

interface BucketDetailUpdateData {
  range_from?: number;
  range_to?: number;
  bucket_label?: string;
  bucket_code?: string;
  pd_rate?: number;
  lgd_rate?: number;
  weight?: number;
  active_flag?: boolean;
  seq?: number;
  updated_by?: string;
  updated_host?: string;
}

interface RangeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  gaps: Array<{ from: number; to: number }>;
  overlaps: Array<{
    detail1: { id: number; range_from: number; range_to: number; bucket_label: string };
    detail2: { id: number; range_from: number; range_to: number; bucket_label: string };
  }>;
}

interface ServiceHealth {
  database_connection: 'healthy' | 'unhealthy';
  models_loaded: boolean;
  last_check: Date;
  bucket_count: number;
  detail_count: number;
}

// ============================================================================
// BUCKET PARAMETER SERVICE CLASS
// ============================================================================

@injectable()
export class BucketParameterService extends BaseService {

  constructor(
    @inject(TYPES.Configuration) configuration: ConfigurationFactoryService,
    @inject(TYPES.Logger) logger: LoggerService
  ) {
    super(configuration, logger);
  }

  /**
   * Get service name for base class implementation
   */
  public getServiceName(): string {
    return 'BucketParameterService';
  }

  // ==========================================================================
  // HEADER OPERATIONS (Using BaseService patterns)
  // ==========================================================================

  /**
   * Get all bucket parameter headers with pagination and search
   */
  async getHeaders(params: PaginationOptions & { bucket_type?: string; active_flag?: boolean }): Promise<ServiceResponse<BucketParameterHeader[]>> {
    try {
      const { page, limit, search, bucket_type, active_flag } = params;
      const filters: SearchFilters = {};

      // Build search filters
      if (search) {
        filters.search = search;
        filters.fields = ['bucket_name', 'bucket_description', 'bucket_type'];
      }

      // Build custom filters for bucket type and active flag
      const customFilters: WhereOptions = {};
      if (bucket_type) {
        customFilters.bucket_type = bucket_type;
      }
      if (active_flag !== undefined) {
        customFilters.active_flag = active_flag;
      }
      filters.customFilters = customFilters;

      return await this.executeWithTransaction(async (transaction) => {
        const { count, rows } = await BucketParameterHeader.findAndCountAll({
          where: this.buildSearchQuery(filters),
          include: [{
            model: BucketParameterDetail,
            as: 'details',
            attributes: ['id'],
            required: false,
            transaction
          }],
          order: [['seq', 'ASC'], ['created_date', 'DESC']],
          limit,
          offset: (page - 1) * limit,
          distinct: true,
          transaction
        });

        // Add detail count to each header
        const headersWithCounts = rows.map(header => {
          const headerData = header.toJSON() as any;
          headerData.detail_count = headerData.details?.length || 0;
          delete headerData.details;
          return headerData;
        });

        return this.createPaginatedResponse(
          headersWithCounts,
          count,
          { page, limit, orderBy: 'seq', orderDirection: 'ASC' }
        );
      }, { useTransaction: false });

    } catch (error) {
      this.logger.error('Failed to retrieve bucket parameter headers', {
        error: error.message,
        params,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'getHeaders', params });
    }
  }

  /**
   * Get single bucket parameter header by ID
   */
  async getHeaderById(id: number): Promise<ServiceResponse<BucketParameterHeader>> {
    try {
      return await this.executeWithTransaction(async (transaction) => {
        const header = await BucketParameterHeader.findByPk(id, {
          include: [{
            model: BucketParameterDetail,
            as: 'details',
            order: [['seq', 'ASC'], ['range_from', 'ASC']],
            transaction
          }]
        });

        if (!header) {
          return this.createErrorResponse('Bucket parameter header not found', 'NOT_FOUND');
        }

        return this.createResponse(true, header);
      }, { useTransaction: false });

    } catch (error) {
      this.logger.error('Failed to retrieve bucket parameter header', {
        error: error.message,
        id,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'getHeaderById', id });
    }
  }

  /**
   * Create new bucket parameter header
   */
  async createHeader(data: BucketHeaderCreateData): Promise<ServiceResponse<BucketParameterHeader>> {
    try {
      return await this.executeWithTransaction(async (transaction) => {
        // Validate bucket name uniqueness
        const existingHeader = await BucketParameterHeader.findOne({
          where: { bucket_name: data.bucket_name },
          transaction
        });

        if (existingHeader) {
          return this.createErrorResponse(`Bucket parameter with name '${data.bucket_name}' already exists`, 'DUPLICATE_NAME');
        }

        // Auto-generate sequence if not provided
        if (!data.seq) {
          const maxSeq = await BucketParameterHeader.max('seq', { transaction }) as number;
          data.seq = (maxSeq || 0) + 1;
        }

        // Validate range logic
        if (data.min_range !== undefined && data.max_range !== undefined) {
          if (data.min_range >= data.max_range) {
            return this.createErrorResponse('Minimum range must be less than maximum range', 'INVALID_RANGE');
          }
        }

        const header = await BucketParameterHeader.create({
          ...data,
          created_date: new Date(),
          updated_date: new Date()
        }, { transaction });

        // Audit log
        this.auditLog('CREATE', 'BucketParameterHeader', String(header.id), data);

        return this.createResponse(true, header, undefined, undefined, {
          action: 'Bucket parameter header created',
          bucket_name: data.bucket_name
        });

      }, { useTransaction: true });

    } catch (error) {
      this.logger.error('Failed to create bucket parameter header', {
        error: error.message,
        data,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'createHeader', data });
    }
  }

  /**
   * Update bucket parameter header
   */
  async updateHeader(id: number, data: BucketHeaderUpdateData): Promise<ServiceResponse<BucketParameterHeader>> {
    try {
      return await this.executeWithTransaction(async (transaction) => {
        const header = await BucketParameterHeader.findByPk(id, { transaction });

        if (!header) {
          return this.createErrorResponse('Bucket parameter header not found', 'NOT_FOUND');
        }

        // Validate bucket name uniqueness if name is being changed
        if (data.bucket_name && data.bucket_name !== header.bucket_name) {
          const existingHeader = await BucketParameterHeader.findOne({
            where: {
              bucket_name: data.bucket_name,
              id: { [Op.ne]: id }
            },
            transaction
          });

          if (existingHeader) {
            return this.createErrorResponse(`Bucket parameter with name '${data.bucket_name}' already exists`, 'DUPLICATE_NAME');
          }
        }

        // Validate range logic
        if (data.min_range !== undefined && data.max_range !== undefined) {
          if (data.min_range >= data.max_range) {
            return this.createErrorResponse('Minimum range must be less than maximum range', 'INVALID_RANGE');
          }
        }

        await header.update({
          ...data,
          updated_date: new Date()
        }, { transaction });

        // Audit log
        this.auditLog('UPDATE', 'BucketParameterHeader', String(id), data);

        return this.createResponse(true, header, undefined, undefined, {
          action: 'Bucket parameter header updated',
          bucket_id: id
        });

      }, { useTransaction: true });

    } catch (error) {
      this.logger.error('Failed to update bucket parameter header', {
        error: error.message,
        id,
        data,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'updateHeader', id, data });
    }
  }

  /**
   * Delete bucket parameter header and all associated details
   */
  async deleteHeader(id: number): Promise<ServiceResponse<boolean>> {
    try {
      return await this.executeWithTransaction(async (transaction) => {
        const header = await BucketParameterHeader.findByPk(id, { transaction });

        if (!header) {
          return this.createErrorResponse('Bucket parameter header not found', 'NOT_FOUND');
        }

        // Delete all associated details first
        await BucketParameterDetail.destroy({
          where: { bucket_header_id: id },
          transaction
        });

        // Delete the header
        await header.destroy({ transaction });

        // Audit log
        this.auditLog('DELETE', 'BucketParameterHeader', String(id), { bucket_name: header.bucket_name });

        return this.createResponse(true, true, undefined, undefined, {
          action: 'Bucket parameter header deleted',
          bucket_id: id
        });

      }, { useTransaction: true });

    } catch (error) {
      this.logger.error('Failed to delete bucket parameter header', {
        error: error.message,
        id,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'deleteHeader', id });
    }
  }

  // ==========================================================================
  // DETAIL OPERATIONS
  // ==========================================================================

  /**
   * Get all details for a specific bucket header
   */
  async getDetailsByHeaderId(headerId: number): Promise<ServiceResponse<BucketParameterDetail[]>> {
    try {
      return await this.executeWithTransaction(async (transaction) => {
        const details = await BucketParameterDetail.findAll({
          where: { bucket_header_id: headerId },
          order: [['seq', 'ASC'], ['range_from', 'ASC']],
          transaction
        });

        return this.createResponse(true, details);
      }, { useTransaction: false });

    } catch (error) {
      this.logger.error('Failed to retrieve bucket parameter details', {
        error: error.message,
        headerId,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'getDetailsByHeaderId', headerId });
    }
  }

  /**
   * Validate bucket ranges for gaps and overlaps
   */
  async validateBucketRanges(headerId: number): Promise<ServiceResponse<RangeValidation>> {
    try {
      return await this.executeWithTransaction(async (transaction) => {
        const details = await BucketParameterDetail.findAll({
          where: {
            bucket_header_id: headerId,
            active_flag: true
          },
          order: [['range_from', 'ASC']],
          transaction
        });

        const validation: RangeValidation = {
          valid: true,
          errors: [],
          warnings: [],
          gaps: [],
          overlaps: []
        };

        if (details.length === 0) {
          validation.valid = false;
          validation.errors.push('No bucket ranges defined');
          return this.createResponse(true, validation);
        }

        // Check for overlaps
        for (let i = 0; i < details.length; i++) {
          for (let j = i + 1; j < details.length; j++) {
            const detail1 = details[i];
            const detail2 = details[j];

            if (this.rangesOverlap(
              detail1.range_from, detail1.range_to,
              detail2.range_from, detail2.range_to
            )) {
              validation.valid = false;
              validation.errors.push(`Overlap detected between '${detail1.bucket_label}' and '${detail2.bucket_label}'`);
              validation.overlaps.push({
                detail1: {
                  id: detail1.id,
                  range_from: detail1.range_from,
                  range_to: detail1.range_to,
                  bucket_label: detail1.bucket_label
                },
                detail2: {
                  id: detail2.id,
                  range_from: detail2.range_from,
                  range_to: detail2.range_to,
                  bucket_label: detail2.bucket_label
                }
              });
            }
          }
        }

        // Check for gaps
        for (let i = 0; i < details.length - 1; i++) {
          const currentDetail = details[i];
          const nextDetail = details[i + 1];

          if (currentDetail.range_to < nextDetail.range_from) {
            validation.warnings.push(`Gap detected between '${currentDetail.bucket_label}' and '${nextDetail.bucket_label}'`);
            validation.gaps.push({
              from: currentDetail.range_to,
              to: nextDetail.range_from
            });
          }
        }

        return this.createResponse(true, validation);
      }, { useTransaction: false });

    } catch (error) {
      this.logger.error('Failed to validate bucket ranges', {
        error: error.message,
        headerId,
        service: this.getServiceName()
      });
      return this.handleError(error, { method: 'validateBucketRanges', headerId });
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<ServiceResponse<ServiceHealth>> {
    try {
      return await this.executeWithTransaction(async () => {
        const [bucketCount, detailCount] = await Promise.all([
          BucketParameterHeader.count(),
          BucketParameterDetail.count()
        ]);

        const health: ServiceHealth = {
          database_connection: 'healthy',
          models_loaded: true,
          last_check: new Date(),
          bucket_count: bucketCount,
          detail_count: detailCount
        };

        return this.createResponse(true, health);
      }, { useTransaction: false });

    } catch (error) {
      this.logger.error('Failed to get service health', {
        error: error.message,
        service: this.getServiceName()
      });

      const health: ServiceHealth = {
        database_connection: 'unhealthy',
        models_loaded: false,
        last_check: new Date(),
        bucket_count: 0,
        detail_count: 0
      };

      return this.createResponse(false, health, 'Service health check failed', 'HEALTH_CHECK_FAILED');
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if two ranges overlap
   */
  private rangesOverlap(from1: number, to1: number, from2: number, to2: number): boolean {
    return !(to1 <= from2 || to2 <= from1);
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const bucketParameterService = new BucketParameterService();
export default bucketParameterService;