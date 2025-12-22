// packages/backend/src/api/middleware/validation.middleware.ts
// ============================================================================
// 🔧 API VALIDATION MIDDLEWARE - STANDARDIZED
// ============================================================================
// ✅ PURPOSE: Standardized input validation using Zod schemas
// ✅ INTEGRATION: Works with centralized error handling and response patterns
// ✅ PATTERN: Express.js middleware with comprehensive validation
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../../utils/errors';
import { sendError } from '../../utils/api-response';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  skipOnError?: boolean;
  transformData?: boolean;
}

export class ValidationMiddleware {
  constructor() {}

  /**
   * Generic validation middleware
   */
  validate(options: ValidationOptions) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const errors: any[] = [];

        // Validate request body
        if (options.body) {
          try {
            const result = options.body.parse(req.body);
            if (options.transformData) {
              req.body = result;
            }
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'body',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        // Validate query parameters
        if (options.query) {
          try {
            const result = options.query.parse(req.query);
            if (options.transformData) {
              req.query = result;
            }
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'query',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        // Validate URL parameters
        if (options.params) {
          try {
            const result = options.params.parse(req.params);
            if (options.transformData) {
              req.params = result;
            }
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'params',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        // Validate headers
        if (options.headers) {
          try {
            options.headers.parse(req.headers);
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                location: 'headers',
                errors: this.formatZodErrors(error)
              });
            }
          }
        }

        if (errors.length > 0) {
          if (!options.skipOnError) {
            const validationError = new ValidationError(
              'Request validation failed',
              errors.flat()
            );
            return sendError(res, validationError, req);
          }
        }

        next();

      } catch (error) {
        console.error('Validation middleware error:', error);
        const internalError = new ValidationError(
          'Internal validation error',
          error instanceof Error ? [error.message] : ['Unknown validation error']
        );
        sendError(res, internalError, req);
      }
    };
  }

  /**
   * Simple request validation for common scenarios
   */
  validateRequest() {
    return this.validate({
      transformData: true,
      skipOnError: false
    });
  }

  /**
   * Tenant-specific validation
   */
  validateTenantContext() {
    const tenantSchema = z.object({
      'x-tenant-slug': z.string().min(1).optional(),
      'x-tenant-id': z.string().uuid().optional()
    });

    return this.validate({
      headers: tenantSchema,
      skipOnError: true
    });
  }

  /**
   * Banking type validation
   */
  validateBankingType() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as any;
        const bankingType = req.get('X-Banking-Type') || req.query.bankingType;
        
        if (bankingType && !['CONVENTIONAL', 'SYARIAH'].includes(bankingType as string)) {
          const error = new ValidationError(
            'Invalid banking type specified',
            [{
              field: 'bankingType',
              message: `Invalid banking type: ${bankingType}. Allowed values: CONVENTIONAL, SYARIAH`,
              code: 'INVALID_ENUM_VALUE',
              value: bankingType
            }]
          );
          return sendError(res, error, req);
        }

        // Validate user has access to this banking type
        if (authReq.user && bankingType) {
          const userBankingAccess = authReq.user.bankingAccess;
          if (userBankingAccess !== 'BOTH' && userBankingAccess !== bankingType) {
            const error = new ValidationError(
              'Banking type access denied',
              [{
                field: 'bankingType',
                message: `User does not have access to ${bankingType} banking type`,
                code: 'ACCESS_DENIED',
                value: bankingType
              }]
            );
            return sendError(res, error, req, 403);
          }
        }

        next();

      } catch (error) {
        console.error('Banking type validation error:', error);
        next();
      }
    };
  }

  /**
   * Pagination validation
   */
  validatePagination() {
    const paginationSchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(1000).default(20),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).default('asc')
    });

    return this.validate({
      query: paginationSchema,
      transformData: true,
      skipOnError: false
    });
  }

  // Private helper methods
  private formatZodErrors(error: ZodError): any[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      received: err.received
    }));
  }
}

// Common validation schemas for reuse
export const CommonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  bankingType: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']),

  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(1000).default(20)
  })
};

// Convenience exports
const validationMiddleware = new ValidationMiddleware();
export const validateRequest = validationMiddleware.validateRequest();
