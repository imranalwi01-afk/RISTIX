// packages/backend/src/api/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { handleAPIError, formatAPIError } from '../../utils/error-handler';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class ErrorMiddleware {
  public static globalErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // Use standardized error handler
    const errorResponse = handleAPIError(error, req);

    // Log the error using our standardized format
    ErrorMiddleware.logError(error, req);

    res.status(errorResponse.statusCode).json(errorResponse);
  };

  public static asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  public static notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error: AppError = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    error.isOperational = true;
    next(error);
  };

  public static bankingErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const tenant = (req as any).tenant;
    if (tenant?.bankingType === 'syariah') {
      console.error('[SYARIAH_BANKING_ERROR]', {
        error: error.message,
        tenant: tenant.id,
        user: (req as any).user?.id,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('ECL') || error.message.includes('IFRS')) {
      error.statusCode = 422;
      error.code = 'IFRS9_CALCULATION_ERROR';
    }

    if (error.message.includes('prohibited') || error.message.includes('AAOIFI')) {
      error.statusCode = 403;
      error.code = 'SYARIAH_COMPLIANCE_VIOLATION';
    }

    next(error);
  };

  public static validationErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
      error.statusCode = 400;
      error.isOperational = true;
    }

    next(error);
  };

  public static databaseErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (error.name === 'SequelizeConnectionError') {
      error.statusCode = 503;
      error.code = 'DATABASE_CONNECTION_ERROR';
      error.message = 'Database connection failed';
      error.isOperational = true;
    }

    if (error.name === 'SequelizeValidationError') {
      error.statusCode = 400;
      error.code = 'DATABASE_VALIDATION_ERROR';
      error.isOperational = true;
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      error.statusCode = 409;
      error.code = 'DUPLICATE_ENTRY';
      error.message = 'Resource already exists';
      error.isOperational = true;
    }

    next(error);
  };

  private static logError(error: AppError, req: Request): void {
    // Create standardized log entry
    const logLevel = ErrorMiddleware.determineLogLevel(error);
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      service: 'IFRS9-Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',

      error: {
        name: error.name,
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        statusCode: error.statusCode || 500,
        stack: error.stack,
        isOperational: error.isOperational || false
      },

      request: {
        method: req.method,
        path: req.path,
        url: req.originalUrl,
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin,
        referer: req.headers.referer
      },

      context: {
        userId: (req as any).user?.id,
        userEmail: (req as any).user?.email,
        userRole: (req as any).user?.role,
        tenantId: (req as any).tenant?.id,
        tenantSlug: (req as any).tenant?.slug,
        bankingType: (req as any).tenant?.bankingType,
        sessionId: (req as any).sessionId,
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    };

    // Format based on log level
    const logMessage = `[${logLevel.toUpperCase()}] ${error.code || 'ERROR'} - ${error.message}`;

    switch (logLevel) {
      case 'error':
        console.error(logMessage, JSON.stringify(logEntry, null, 2));
        break;
      case 'warn':
        console.warn(logMessage, JSON.stringify(logEntry, null, 2));
        break;
      case 'info':
        console.info(logMessage, JSON.stringify(logEntry, null, 2));
        break;
      default:
        console.log(logMessage, JSON.stringify(logEntry, null, 2));
    }
  }

  private static determineLogLevel(error: AppError): string {
    if (error.statusCode && error.statusCode >= 500) {
      return 'error';
    } else if (error.statusCode && error.statusCode >= 400) {
      return 'warn';
    } else {
      return 'info';
    }
  }
}

export const globalErrorHandler = ErrorMiddleware.globalErrorHandler;
export const asyncHandler = ErrorMiddleware.asyncHandler;
export const notFoundHandler = ErrorMiddleware.notFoundHandler;
export const bankingErrorHandler = ErrorMiddleware.bankingErrorHandler;
export const validationErrorHandler = ErrorMiddleware.validationErrorHandler;
export const databaseErrorHandler = ErrorMiddleware.databaseErrorHandler;
