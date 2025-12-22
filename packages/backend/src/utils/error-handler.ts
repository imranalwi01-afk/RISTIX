// packages/backend/src/utils/error-handler.ts
// ============================================================================
// 🔧 ERROR HANDLER UTILITY - COMPATIBILITY LAYER
// ============================================================================
// ✅ PURPOSE: Provides handleAPIError function for controllers
// ✅ INTEGRATION: Works with existing error.middleware.ts
// ✅ PATTERN: Express.js error handling with proper error types
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// ============================================================================
// MAIN ERROR HANDLER FUNCTION
// ============================================================================

/**
 * handleAPIError - Standardized error handler for API controllers
 * Compatible with existing Express.js middleware patterns
 *
 * @param error - The error object
 * @param req - Express request object
 * @param res - Express response object (optional)
 * @param next - Express next function (recommended)
 */
export const handleAPIError = (
  error: any,
  req: Request,
  res?: Response,
  next?: NextFunction
): Response | void => {
  // If next function is provided, use middleware pattern (preferred)
  if (next) {
    return next(error);
  }

  // If res is provided but no next, handle directly (fallback pattern)
  if (res) {
    const apiError = formatAPIError(error, req);
    return res.status(apiError.statusCode || 500).json({
      success: false,
      error: apiError.message,
      code: apiError.code,
      details: apiError.details,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }

  // If neither res nor next provided, just format and throw
  const formattedError = formatAPIError(error, req);
  throw formattedError;
};

// ============================================================================
// ERROR FORMATTING UTILITIES
// ============================================================================

/**
 * Format error object according to API standards
 */
export const formatAPIError = (error: any, req: Request): APIError => {
  const apiError: APIError = new Error(error.message || 'Internal server error');

  // Preserve original error properties
  apiError.name = error.name || 'Error';
  apiError.stack = error.stack;
  apiError.statusCode = error.statusCode || 500;
  apiError.code = error.code || 'INTERNAL_ERROR';
  apiError.details = error.details;
  apiError.isOperational = error.isOperational || false;

  // Handle specific error types
  if (error instanceof z.ZodError) {
    apiError.statusCode = 400;
    apiError.code = 'VALIDATION_ERROR';
    apiError.message = 'Request validation failed';
    apiError.details = formatZodErrors(error.issues);
    apiError.isOperational = true;
  }

  // Handle Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    apiError.statusCode = 400;
    apiError.code = 'DATABASE_VALIDATION_ERROR';
    apiError.message = 'Database validation failed';
    apiError.details = formatSequelizeErrors(error.errors);
    apiError.isOperational = true;
  }

  // Handle Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    apiError.statusCode = 409;
    apiError.code = 'DUPLICATE_ENTRY';
    apiError.message = 'Resource already exists';
    apiError.isOperational = true;
  }

  // Handle database connection errors
  if (error.name === 'SequelizeConnectionError' || error.message.includes('connection')) {
    apiError.statusCode = 503;
    apiError.code = 'DATABASE_CONNECTION_ERROR';
    apiError.message = 'Database connection failed';
    apiError.isOperational = true;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    apiError.statusCode = 401;
    apiError.code = 'INVALID_TOKEN';
    apiError.message = 'Invalid authentication token';
    apiError.isOperational = true;
  }

  if (error.name === 'TokenExpiredError') {
    apiError.statusCode = 401;
    apiError.code = 'TOKEN_EXPIRED';
    apiError.message = 'Authentication token expired';
    apiError.isOperational = true;
  }

  // Handle tenant errors
  if (error.message.includes('tenant') || error.code === 'TENANT_NOT_FOUND') {
    apiError.statusCode = 404;
    apiError.code = 'TENANT_ERROR';
    apiError.isOperational = true;
  }

  // Handle banking compliance errors
  if (error.message.includes('syariah') || error.message.includes('compliance')) {
    apiError.statusCode = 403;
    apiError.code = 'BANKING_COMPLIANCE_ERROR';
    apiError.isOperational = true;
  }

  // Handle IFRS9 calculation errors
  if (error.message.includes('ECL') || error.message.includes('IFRS')) {
    apiError.statusCode = 422;
    apiError.code = 'IFRS9_CALCULATION_ERROR';
    apiError.isOperational = true;
  }

  return apiError;
};

// ============================================================================
// ERROR FORMATTING HELPERS
// ============================================================================

/**
 * Format Zod validation errors
 */
export const formatZodErrors = (errors: z.ZodIssue[]): ValidationErrorDetail[] => {
  return errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    value: (err as any).received || undefined
  }));
};

/**
 * Format Sequelize validation errors
 */
export const formatSequelizeErrors = (errors: any[]): ValidationErrorDetail[] => {
  return errors.map(err => ({
    field: err.path || err.field || 'unknown',
    message: err.message || 'Validation error',
    code: err.type || 'VALIDATION_ERROR',
    value: err.value
  }));
};

// ============================================================================
// CONVENIENCE ERROR CREATION FUNCTIONS
// ============================================================================

/**
 * Create a validation error
 */
export const createValidationError = (
  message: string,
  details?: ValidationErrorDetail[]
): APIError => {
  const error: APIError = new Error(message);
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  error.isOperational = true;
  return error;
};

/**
 * Create a not found error
 */
export const createNotFoundError = (
  resource: string,
  identifier?: string
): APIError => {
  const message = identifier
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`;

  const error: APIError = new Error(message);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  error.isOperational = true;
  return error;
};

/**
 * Create an unauthorized error
 */
export const createUnauthorizedError = (
  message: string = 'Authentication required'
): APIError => {
  const error: APIError = new Error(message);
  error.statusCode = 401;
  error.code = 'UNAUTHORIZED';
  error.isOperational = true;
  return error;
};

/**
 * Create a forbidden error
 */
export const createForbiddenError = (
  message: string = 'Insufficient permissions'
): APIError => {
  const error: APIError = new Error(message);
  error.statusCode = 403;
  error.code = 'FORBIDDEN';
  error.isOperational = true;
  return error;
};

/**
 * Create a conflict error
 */
export const createConflictError = (
  message: string,
  details?: any
): APIError => {
  const error: APIError = new Error(message);
  error.statusCode = 409;
  error.code = 'CONFLICT';
  error.details = details;
  error.isOperational = true;
  return error;
};

/**
 * Create a database error
 */
export const createDatabaseError = (
  message: string,
  originalError?: any
): APIError => {
  const error: APIError = new Error(message);
  error.statusCode = 503;
  error.code = 'DATABASE_ERROR';
  error.details = originalError ? { originalError: originalError.message } : undefined;
  error.isOperational = true;
  return error;
};

// ============================================================================
// ASYNC ERROR HANDLER WRAPPER
// ============================================================================

/**
 * Async wrapper for controller methods - handles promise rejections
 * Alternative to the middleware version
 */
export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleAPIError(error, req, res, next);
    });
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  handleAPIError,
  formatAPIError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createDatabaseError,
  asyncErrorHandler
};