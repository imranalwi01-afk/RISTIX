// packages/backend/src/core/services/base/base.service.ts
// ============================================================================
// 🔧 BASE SERVICE CLASS - IFRS9 STANDARDIZATION
// ============================================================================
// ✅ PURPOSE: Standardized base service with dependency injection and logging
// ✅ PATTERN: Abstract base class with common functionality
// ✅ COMPLIANCE: IFRS9 standardization requirements for service layer
// ============================================================================

import { inject, injectable } from 'inversify';
import { Sequelize, Transaction, WhereOptions, Op } from 'sequelize';
import { TYPES } from '../../container/dependency-injection.container';
import { ConfigurationFactoryService } from '../configuration/configuration-factory.service';
import { LoggerService } from '../../container/dependency-injection.container';

export interface ServiceOptions {
  useTransaction?: boolean;
  validateInputs?: boolean;
  auditLog?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp: string;
    requestId?: string;
  };
}

export interface SearchFilters {
  search?: string;
  exactMatch?: boolean;
  fields?: string[];
  dateRange?: {
    field: string;
    from: Date;
    to: Date;
  };
  numericRange?: {
    field: string;
    min?: number;
    max?: number;
  };
  enumValues?: {
    field: string;
    values: any[];
  };
  customFilters?: WhereOptions;
}

@injectable()
export abstract class BaseService {
  protected configuration: ConfigurationFactoryService;
  protected logger: LoggerService;

  constructor(
    @inject(TYPES.Configuration) configuration: ConfigurationFactoryService,
    @inject(TYPES.Logger) logger: LoggerService
  ) {
    this.configuration = configuration;
    this.logger = logger;
  }

  /**
   * Get database connection
   */
  protected getDatabase(): Sequelize {
    // This should be overridden in specific services or injected
    throw new Error('Database connection must be implemented in subclass');
  }

  /**
   * Execute operation with optional transaction
   */
  protected async executeWithTransaction<T>(
    operation: (transaction?: Transaction) => Promise<T>,
    options: ServiceOptions = {}
  ): Promise<T> {
    const useTransaction = options.useTransaction ?? true;
    const retryAttempts = options.retryAttempts ?? 3;
    const timeout = options.timeout ?? 30000;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        if (useTransaction) {
          const result = await this.getDatabase().transaction(async (transaction) => {
            return await operation(transaction);
          });
          return result;
        } else {
          return await operation();
        }
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Service operation attempt ${attempt} failed`, {
          error: lastError.message,
          service: this.constructor.name
        });

        if (attempt < retryAttempts) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Service operation failed after retries');
  }

  /**
   * Build search query from filters
   */
  protected buildSearchQuery(filters: SearchFilters): WhereOptions {
    const whereClause: WhereOptions = {};

    // Text search
    if (filters.search) {
      const searchFields = filters.fields || ['name', 'description'];
      const searchCondition = filters.exactMatch
        ? { [Op.or]: searchFields.map(field => ({ [field]: { [Op.eq]: filters.search } })) }
        : { [Op.or]: searchFields.map(field => ({ [field]: { [Op.iLike]: `%${filters.search}%` } })) };

      Object.assign(whereClause, searchCondition);
    }

    // Date range filter
    if (filters.dateRange) {
      whereClause[filters.dateRange.field] = {
        [Op.gte]: filters.dateRange.from,
        [Op.lte]: filters.dateRange.to
      };
    }

    // Numeric range filter
    if (filters.numericRange) {
      const numericCondition: any = {};
      if (filters.numericRange.min !== undefined) {
        numericCondition[Op.gte] = filters.numericRange.min;
      }
      if (filters.numericRange.max !== undefined) {
        numericCondition[Op.lte] = filters.numericRange.max;
      }
      whereClause[filters.numericRange.field] = numericCondition;
    }

    // Enum values filter
    if (filters.enumValues) {
      whereClause[filters.enumValues.field] = {
        [Op.in]: filters.enumValues.values
      };
    }

    // Custom filters
    if (filters.customFilters) {
      Object.assign(whereClause, filters.customFilters);
    }

    return whereClause;
  }

  /**
   * Build pagination options
   */
  protected buildPaginationOptions(pagination: PaginationOptions) {
    const { page, limit, offset, orderBy, orderDirection } = pagination;
    const calculatedOffset = offset ?? ((page - 1) * limit);

    return {
      offset: calculatedOffset,
      limit,
      order: orderBy ? [[orderBy, orderDirection || 'ASC']] : undefined
    };
  }

  /**
   * Create standardized service response
   */
  protected createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    code?: string,
    metadata?: any
  ): ServiceResponse<T> {
    return {
      success,
      data,
      error,
      code,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }

  /**
   * Create success response with pagination
   */
  protected createPaginatedResponse<T>(
    data: T[],
    total: number,
    pagination: PaginationOptions,
    additionalMetadata?: any
  ): ServiceResponse<T[]> {
    const totalPages = Math.ceil(total / pagination.limit);

    return this.createResponse(true, data, undefined, undefined, {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      ...additionalMetadata
    });
  }

  /**
   * Create error response
   */
  protected createErrorResponse(
    error: string | Error,
    code: string = 'SERVICE_ERROR',
    additionalMetadata?: any
  ): ServiceResponse {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = error instanceof Error && (error as any).code ? (error as any).code : code;

    return this.createResponse(false, undefined, errorMessage, errorCode, {
      ...additionalMetadata
    });
  }

  /**
   * Validate input data
   */
  protected validateInput(data: any, rules: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation - can be extended with specific validation libraries
    if (rules.required) {
      for (const field of rules.required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          errors.push(`${field} is required`);
        }
      }
    }

    if (rules.types) {
      for (const [field, type] of Object.entries(rules.types)) {
        if (data[field] !== undefined && typeof data[field] !== type) {
          errors.push(`${field} must be of type ${type}`);
        }
      }
    }

    if (rules.maxLength) {
      for (const [field, maxLength] of Object.entries(rules.maxLength)) {
        if (data[field] && String(data[field]).length > maxLength) {
          errors.push(`${field} exceeds maximum length of ${maxLength}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Audit log helper
   */
  protected auditLog(action: string, entity: string, entityId: string, data?: any, userId?: string): void {
    const auditData = {
      action,
      entity,
      entityId,
      data,
      userId: userId || 'system',
      timestamp: new Date().toISOString(),
      service: this.constructor.name
    };

    this.logger.info(`AUDIT: ${action} on ${entity}`, auditData);

    // TODO: Send to audit service
  }

  /**
   * Format error for logging
   */
  protected formatError(error: any, context?: any): any {
    return {
      message: error.message || 'Unknown error',
      stack: error.stack,
      code: error.code,
      context,
      service: this.constructor.name,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if feature is enabled
   */
  protected isFeatureEnabled(feature: string): boolean {
    return this.configuration.getFeatureFlags()[feature as keyof any] || false;
  }

  /**
   * Get configuration value
   */
  protected getConfig(section: string, key?: string): any {
    const config = this.configuration.getConfiguration();

    if (!key) {
      return config[section as keyof any];
    }

    return config[section as keyof any]?.[key];
  }

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize input data
   */
  protected sanitizeInput(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Basic sanitization - can be extended
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeInput(item));
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle service errors consistently
   */
  protected handleError(error: any, context?: any, errorCode?: string): ServiceResponse {
    const formattedError = this.formatError(error, context);

    this.logger.error('Service error occurred', formattedError);

    return this.createErrorResponse(error, errorCode, {
      service: this.constructor.name,
      context
    });
  }

  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract getServiceName(): string;
}

export default BaseService;