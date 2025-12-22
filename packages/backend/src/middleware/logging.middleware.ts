// packages/backend/src/middleware/logging.middleware.ts
// ============================================================================
// IFRS9 PLATFORM - LOGGING MIDDLEWARE
// ============================================================================
// File Path: packages/backend/src/middleware/logging.middleware.ts
// Updated: 2025-07-23
// Purpose: Comprehensive request/response logging with performance monitoring
// Dependencies: winston, uuid, express
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ifrs9-backend' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Extend Express Request interface
interface ExtendedRequest extends Request {
  requestId?: string;
  startTime?: number;
  user?: {
    id: string;
    email: string;
    tenantId: string;
  };
}

/**
 * Request ID Generator Middleware
 * Generates unique request ID for tracking
 */
export const requestIdMiddleware = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Request Logging Middleware
 * Logs incoming requests with comprehensive metadata
 */
export const requestLogger = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  req.startTime = Date.now();
  
  const logData = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    referer: req.headers.referer,
    tenantSlug: req.headers['x-tenant-slug'],
    timestamp: new Date().toISOString()
  };

  logger.info('Incoming Request', {
    type: 'REQUEST',
    ...logData
  });

  next();
};

/**
 * Response Logging Middleware
 * Logs responses with performance metrics
 */
export const responseLogger = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send
  res.send = function(data) {
    logResponse(req, res, data);
    return originalSend.call(this, data);
  };

  // Override res.json
  res.json = function(data) {
    logResponse(req, res, data);
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Error Logging Middleware
 * Captures and logs all errors with context
 */
export const errorLogger = (
  error: Error,
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  const errorData = {
    requestId: req.requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      tenantId: req.user.tenantId
    } : null,
    timestamp: new Date().toISOString()
  };

  logger.error('Request Error', errorData);
  next(error);
};

/**
 * Authentication Event Logger
 * Logs authentication-related events
 */
export const authEventLogger = {
  loginAttempt: (email: string, ip: string, success: boolean, reason?: string) => {
    logger.info('Authentication Event', {
      type: 'LOGIN_ATTEMPT',
      email,
      ip,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  logout: (userId: string, email: string, sessionId: string) => {
    logger.info('Authentication Event', {
      type: 'LOGOUT',
      userId,
      email,
      sessionId,
      timestamp: new Date().toISOString()
    });
  },

  tokenRefresh: (userId: string, sessionId: string) => {
    logger.info('Authentication Event', {
      type: 'TOKEN_REFRESH',
      userId,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Performance Monitoring Middleware
 * Monitors API response times and system performance
 */
export const performanceMonitor = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        type: 'PERFORMANCE',
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    }

    // Log performance metrics
    logger.debug('Request Performance', {
      type: 'PERFORMANCE',
      requestId: req.requestId,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });

  next();
};

/**
 * Helper function to log response data
 */
function logResponse(req: ExtendedRequest, res: Response, data: any): void {
  const duration = req.startTime ? Date.now() - req.startTime : 0;
  
  const logData = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    responseSize: Buffer.isBuffer(data) ? data.length : JSON.stringify(data || {}).length,
    user: req.user ? {
      id: req.user.id,
      tenantId: req.user.tenantId
    } : null,
    timestamp: new Date().toISOString()
  };

  if (res.statusCode >= 400) {
    logger.warn('Response Error', {
      type: 'RESPONSE_ERROR',
      ...logData,
      responseData: data
    });
  } else {
    logger.info('Response Sent', {
      type: 'RESPONSE',
      ...logData
    });
  }
}

/**
 * Database Query Logger
 * Logs database operations for monitoring
 */
export const dbQueryLogger = {
  logQuery: (query: string, duration: number, tenant?: string) => {
    logger.debug('Database Query', {
      type: 'DB_QUERY',
      query: query.substring(0, 200), // Truncate long queries
      duration: `${duration}ms`,
      tenant,
      timestamp: new Date().toISOString()
    });
  },

  logSlowQuery: (query: string, duration: number, tenant?: string) => {
    logger.warn('Slow Database Query', {
      type: 'DB_SLOW_QUERY',
      query: query.substring(0, 500),
      duration: `${duration}ms`,
      tenant,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger;