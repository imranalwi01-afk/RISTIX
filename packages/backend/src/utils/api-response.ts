// packages/backend/src/utils/api-response.ts
// ============================================================================
// 🚀 API RESPONSE STANDARDIZATION UTILITY
// ============================================================================
// ✅ PURPOSE: Provides standardized success response formatting
// ✅ INTEGRATION: Works with existing error-handler.ts
// ✅ PATTERN: Express.js response handling with consistent format
// ============================================================================

import { Request, Response } from 'express';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
  path: string;
  method: string;
  duration?: number;
  version?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

export interface ServiceOptions {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  startTime?: number;
}

// ============================================================================
// SUCCESS RESPONSE BUILDERS
// ============================================================================

/**
 * Create a standardized success response
 *
 * @param res - Express response object
 * @param data - Response data
 * @param message - Optional success message
 * @param options - Additional response options
 * @returns Express response with standardized format
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  options: ServiceOptions = {}
): Response => {
  const startTime = options.startTime || Date.now();
  const duration = Date.now() - startTime;

  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Operation successful',
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options.requestId,
      tenantId: options.tenantId,
      userId: options.userId,
      path: (res.req as Request).path,
      method: (res.req as Request).method,
      duration,
      version: '1.0.0'
    }
  };

  return res.status(200).json(response);
};

/**
 * Create a paginated success response
 *
 * @param res - Express response object
 * @param data - Response data array
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @param options - Additional response options
 * @returns Express response with paginated format
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  options: ServiceOptions = {}
): Response => {
  const startTime = options.startTime || Date.now();
  const duration = Date.now() - startTime;

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message: message || 'Data retrieved successfully',
    pagination,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options.requestId,
      tenantId: options.tenantId,
      userId: options.userId,
      path: (res.req as Request).path,
      method: (res.req as Request).method,
      duration,
      version: '1.0.0'
    }
  };

  return res.status(200).json(response);
};

/**
 * Create a created response (201)
 *
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Optional success message
 * @param options - Additional response options
 * @returns Express response with 201 status
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message?: string,
  options: ServiceOptions = {}
): Response => {
  const startTime = options.startTime || Date.now();
  const duration = Date.now() - startTime;

  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Resource created successfully',
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options.requestId,
      tenantId: options.tenantId,
      userId: options.userId,
      path: (res.req as Request).path,
      method: (res.req as Request).method,
      duration,
      version: '1.0.0'
    }
  };

  return res.status(201).json(response);
};

/**
 * Create an accepted response (202)
 *
 * @param res - Express response object
 * @param data - Response data
 * @param message - Optional success message
 * @param options - Additional response options
 * @returns Express response with 202 status
 */
export const sendAccepted = <T>(
  res: Response,
  data: T,
  message?: string,
  options: ServiceOptions = {}
): Response => {
  const startTime = options.startTime || Date.now();
  const duration = Date.now() - startTime;

  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Request accepted for processing',
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options.requestId,
      tenantId: options.tenantId,
      userId: options.userId,
      path: (res.req as Request).path,
      method: (res.req as Request).method,
      duration,
      version: '1.0.0'
    }
  };

  return res.status(202).json(response);
};

/**
 * Create a no content response (204)
 *
 * @param res - Express response object
 * @param options - Additional response options
 * @returns Express response with 204 status
 */
export const sendNoContent = (
  res: Response,
  options: ServiceOptions = {}
): Response => {
  const startTime = options.startTime || Date.now();
  const duration = Date.now() - startTime;

  // For 204 responses, we don't include a body, but we can add headers
  res.set({
    'X-Response-Time': `${duration}ms`,
    'X-Timestamp': new Date().toISOString(),
    'X-Request-Id': options.requestId || '',
    'X-Tenant-Id': options.tenantId || '',
    'X-User-Id': options.userId || ''
  });

  return res.status(204).send();
};

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

/**
 * Create pagination metadata
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total items
 * @returns Pagination metadata object
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Extract pagination options from query parameters
 *
 * @param query - Express request query object
 * @param defaultLimit - Default items per page
 * @param maxLimit - Maximum allowed items per page
 * @returns Pagination options
 */
export const extractPaginationOptions = (
  query: any,
  defaultLimit: number = 10,
  maxLimit: number = 100
): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// ============================================================================
// RESPONSE MIDDLEWARE WRAPPER
// ============================================================================

/**
 * Middleware to add response timing and metadata
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const responseMetadataMiddleware = (
  req: Request,
  res: Response,
  next: any
): void => {
  // Add start time to request
  (req as any).startTime = Date.now();

  // Override res.json to add metadata
  const originalJson = res.json;
  res.json = function(data: any) {
    if (data && typeof data === 'object' && !data.meta) {
      const startTime = (req as any).startTime || Date.now();
      const duration = Date.now() - startTime;

      // Add metadata to existing responses if they follow our pattern
      if (data.success === true) {
        data.meta = {
          timestamp: new Date().toISOString(),
          requestId: (req as any).requestId,
          tenantId: (req as any).tenant?.id,
          userId: (req as any).user?.id,
          path: req.path,
          method: req.method,
          duration,
          version: '1.0.0'
        };
      }
    }
    return originalJson.call(this, data);
  };

  next();
};

// ============================================================================
// SERVICE RESPONSE BUILDERS
// ============================================================================

/**
 * Service response builder class for controllers
 */
export class ServiceResponseBuilder<T> {
  private response: Partial<ApiResponse<T>> = {};

  constructor(private res: Response, private req: Request) {}

  data(data: T): ServiceResponseBuilder<T> {
    this.response.data = data;
    return this;
  }

  message(message: string): ServiceResponseBuilder<T> {
    this.response.message = message;
    return this;
  }

  meta(meta: Partial<ResponseMeta>): ServiceResponseBuilder<T> {
    this.response.meta = {
      timestamp: new Date().toISOString(),
      requestId: meta.requestId || (this.req as any).requestId,
      tenantId: meta.tenantId || (this.req as any).tenant?.id,
      userId: meta.userId || (this.req as any).user?.id,
      path: this.req.path,
      method: this.req.method,
      version: '1.0.0',
      ...meta
    };
    return this;
  }

  build(statusCode: number = 200): Response {
    const finalResponse: ApiResponse<T> = {
      success: true,
      data: this.response.data as T,
      message: this.response.message || 'Operation successful',
      meta: this.response.meta as ResponseMeta
    };

    return this.res.status(statusCode).json(finalResponse);
  }

  ok(): Response {
    return this.build(200);
  }

  created(): Response {
    return this.build(201);
  }

  accepted(): Response {
    return this.build(202);
  }
}

/**
 * Create a service response builder
 *
 * @param res - Express response object
 * @param req - Express request object
 * @returns ServiceResponseBuilder instance
 */
export const createServiceResponse = <T>(
  res: Response,
  req: Request
): ServiceResponseBuilder<T> => {
  return new ServiceResponseBuilder<T>(res, req);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  sendSuccess,
  sendPaginatedSuccess,
  sendCreated,
  sendAccepted,
  sendNoContent,
  createPaginationMeta,
  extractPaginationOptions,
  responseMetadataMiddleware,
  createServiceResponse,
  ServiceResponseBuilder
};