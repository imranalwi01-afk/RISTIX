// packages/backend/src/api/middleware/error.fallback.ts
// ✅ FALLBACK ERROR HANDLERS - Use when custom error handlers not available

import { Request, Response, NextFunction } from 'express';

// ✅ Validation Error Handler
export const validationErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'ValidationError' || error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  next(error);
};

// ✅ Database Error Handler
export const databaseErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'SequelizeError' || error.code === 'ECONNREFUSED') {
    console.error('Database error:', error.message);
    return res.status(503).json({
      success: false,
      error: 'Database service unavailable',
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
  next(error);
};

// ✅ Banking Error Handler
export const bankingErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.code === 'BANKING_COMPLIANCE_ERROR' || error.type === 'SYARIAH_VIOLATION') {
    return res.status(422).json({
      success: false,
      error: 'Banking compliance violation',
      code: error.code || 'BANKING_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  next(error);
};

// ✅ Not Found Handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    available_routes: {
      health: 'GET /health',
      status: 'GET /status',
      api: 'GET /api/v1',
      auth_login: 'POST /api/v1/auth/login',
      auth_status: 'GET /api/v1/auth/status'
    }
  });
};

// ✅ Global Error Handler
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
  
  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!res.headersSent) {
    return res.status(error.status || 500).json({
      success: false,
      error: isDevelopment ? error.message : 'Internal server error',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      ...(isDevelopment && {
        stack: error.stack,
        details: {
          method: req.method,
          path: req.originalUrl,
          body: req.body,
          query: req.query
        }
      })
    });
  }
};