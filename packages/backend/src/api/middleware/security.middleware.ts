// packages/backend/src/api/middleware/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import backendEnvironmentLoader from '../../config/environment-loader-backend';

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true
});

/**
 * CORS configuration with tenant-aware origins
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Check - Origin:', origin);

    // Allow requests with no origin (mobile apps, server-to-server)
    if (!origin) {
      console.log('✅ CORS Allow - No origin (server-to-server)');
      return callback(null, true);
    }

    // Get allowed origins from environment with proper trimming
    const corsOriginsEnv = process.env.CORS_ORIGINS;
    console.log('🔧 CORS_ORIGINS from env:', corsOriginsEnv);

    // Load configuration from environment with error handling
    let frontendUrl = process.env.IAF_FRONTEND_URL || 'https://iaf-ifrs.danafin.com';
    let backendUrl = process.env.IAF_BACKEND_URL || 'https://iaf-ifrs-be.danafin.com';

    try {
      const config = backendEnvironmentLoader.getConfiguration();
      frontendUrl = config.urls.frontend;
      backendUrl = config.urls.backend;
      console.log('✅ Using centralized CORS config from environment loader');
    } catch (error) {
      console.warn('⚠️ Failed to load centralized CORS config, using environment variables:', error.message);
    }

    const allowedOrigins = corsOriginsEnv?.split(',').map(o => o.trim()) || [
      // IAF Development Domains (Current testing environment)
      'https://iaf-ifrs.ifrspro.id',
      'https://iaf-ifrs-be.ifrspro.id',
      'https://iaf-ifrs-analytics.ifrspro.id',
      'https://iaf-ifrs-analytics-calc.ifrspro.id',

      // IAF Production Domains
      process.env.IAF_FRONTEND_URL || 'https://iaf-ifrs.danafin.com',
      process.env.IAF_BACKEND_URL || 'https://iaf-ifrs-be.danafin.com',
      process.env.IAF_ANALYTICS_URL || 'https://iaf-ifrs-analytics.danafin.com',
      process.env.IAF_ANALYTICS_CALC_URL || 'https://iaf-ifrs-analytics-calc.danafin.com',

      // Development Domains
      process.env.DEV_FRONTEND_URL || 'https://ifrs9.ifrspro.id',
      process.env.DEV_BACKEND_URL || 'https://iaf-ifrs-be.ifrspro.id',

      // Fallback centralized config
      frontendUrl,
      backendUrl
    ];

    console.log('🔧 Allowed origins:', allowedOrigins);
    console.log('🔍 Checking if origin is allowed:', origin);

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS Allow - Origin found in allowed list');
      callback(null, true);
    } else {
      // In production mode for IAF, always allow the main IAF domains
      const iafDomains = [
        // Production IAF domains
        process.env.IAF_FRONTEND_URL || 'https://iaf-ifrs.danafin.com',
        process.env.IAF_BACKEND_URL || 'https://iaf-ifrs-be.danafin.com',
        process.env.IAF_ANALYTICS_URL || 'https://iaf-ifrs-analytics.danafin.com',
        process.env.IAF_ANALYTICS_CALC_URL || 'https://iaf-ifrs-analytics-calc.danafin.com',

        // Development IAF domains
        process.env.DEV_FRONTEND_URL || 'https://ifrs9-iaf.ifrspro.id',
        process.env.DEV_BACKEND_URL || 'https://iaf-ifrs-be.ifrspro.id',
        process.env.DEV_ANALYTICS_URL || 'https://iaf-ifrs-analytics.ifrspro.id',
        process.env.DEV_ANALYTICS_CALC_URL || 'https://iaf-ifrs-analytics-calc.ifrspro.id',

        // Alternative development domains
        'https://iaf-ifrs.ifrspro.id',
        'https://iaf-ifrs-be.ifrspro.id',
        'https://iaf-ifrs-analytics.ifrspro.id',
        'https://iaf-ifrs-analytics-calc.ifrspro.id',
        frontendUrl,
        backendUrl
      ];

      if (iafDomains.includes(origin)) {
        console.log('✅ CORS Allow - IAF domain match');
        callback(null, true);
      } else {
        console.log('❌ CORS Reject - Origin not allowed:', origin);
        console.log('📋 Allowed origins list:', allowedOrigins);
        callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Tenant-ID',
    'X-Tenant-Slug',
    'X-Banking-Type',
    'X-Session-ID',
    'X-Request-ID',
    'x-request-time',
    'x-client',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Origin',
    'Accept',
    'Accept-Language',
    'Accept-Encoding',
    'Connection',
    'Host',
    'Referer',
    'User-Agent'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Pagination-Page',
    'X-Pagination-Limit',
    'X-Rate-Limit-Remaining',
    'X-Response-Time'
  ],
  optionsSuccessStatus: 200,
  preflightContinue: false
});

/**
 * OPTIONS request debug middleware
 */
export const debugOptionsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'OPTIONS') {
    console.log('🔍 OPTIONS Request Debug:');
    console.log('  - Origin:', req.headers.origin);
    console.log('  - Method:', req.method);
    console.log('  - Path:', req.path);
    console.log('  - Access-Control-Request-Method:', req.headers['access-control-request-method']);
    console.log('  - Access-Control-Request-Headers:', req.headers['access-control-request-headers']);
    console.log('  - All Headers:', JSON.stringify(req.headers, null, 2));
  }
  next();
};

/**
 * Rate limiting configuration
 */
export const createRateLimit = (options?: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options?.max || 1000, // limit each IP to 1000 requests per windowMs
    message: options?.message || {
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'Too many requests from this IP address. Please wait before making more requests.',
      retryAfter: Math.round((options?.windowMs || (15 * 60 * 1000)) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options?.skipSuccessfulRequests || false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round((options?.windowMs || (15 * 60 * 1000)) / 1000)
      });
    }
  });
};

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Remove null bytes and control characters
  const sanitizeString = (str: string): string => {
    return str.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[sanitizeString(key)] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Security event logging middleware
 */
export const logSecurityEvents = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i,
    /<script.*?>.*?<\/script>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload|onerror|onclick/i
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  const suspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (suspicious) {
    console.warn('Suspicious request detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Monitor response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests (potential DoS)
    if (responseTime > 5000) {
      console.warn('Slow request detected:', {
        ip: req.ip,
        url: req.originalUrl,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

/**
 * Banking compliance security middleware
 */
export const bankingComplianceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Banking-specific security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Banking-Security', 'enabled');

  // Check if this is a Syariah banking request
  const bankingType = req.headers['x-banking-type'];
  if (bankingType === 'syariah') {
    res.set('X-Banking-Type', 'syariah');
    res.set('X-Compliance-Mode', 'aaoifi');
    req.headers['x-requires-syariah-audit'] = 'true';
  }

  next();
};