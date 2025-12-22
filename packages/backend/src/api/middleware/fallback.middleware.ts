// packages/backend/src/api/middleware/fallback.middleware.ts
// ✅ FALLBACK MIDDLEWARE - Use when custom middleware not available

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// ✅ Security Headers Middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// ✅ CORS Configuration
export const corsConfig = cors({
  origin: [
    'https://ifrs9.ifrspro.id',
    'https://bifrs9.ifrspro.id',
    'http://localhost:3000',
    'http://127.0.0.1:4231',
    'http://0.0.0.0:4231',
    process.env.FRONTEND_URL || 'https://ifrs9.ifrspro.id'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Tenant-Slug', 
    'x-tenant-id',
    'x-request-time',
    'x-client'
  ],
  optionsSuccessStatus: 200
});

// ✅ Rate Limiting with proxy support
export const createRateLimit = () => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ FIX: Skip validation when X-Forwarded-For is present but trust proxy is disabled
  skip: (req) => {
    // Skip rate limiting if there are proxy headers but trust proxy is disabled
    if (req.headers['x-forwarded-for'] && !req.app.get('trust proxy')) {
      console.warn('⚠️ Skipping rate limit due to X-Forwarded-For header without trust proxy');
      return true;
    }
    return false;
  },
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// ✅ Request Sanitization
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// ✅ Banking Compliance Middleware
export const bankingComplianceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add basic compliance headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add banking-specific headers
  res.setHeader('X-Banking-Compliance', 'IFRS9-Multi-Tenant');
  res.setHeader('X-Data-Classification', 'CONFIDENTIAL');
  
  next();
};

// ✅ Security Event Logging
export const logSecurityEvents = (req: Request, res: Response, next: NextFunction) => {
  // Log security-relevant events
  const securityEvents = [
    '/auth/login',
    '/auth/logout',
    '/admin',
    '/platform-admin'
  ];
  
  const isSecurityEvent = securityEvents.some(path => req.path.includes(path));
  
  if (isSecurityEvent) {
    console.log(`[SECURITY] ${req.method} ${req.path} from ${req.ip} at ${new Date().toISOString()}`);
  }
  
  next();
};

// ✅ Helper function to sanitize objects
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
}

// ✅ Helper function to sanitize strings
function sanitizeString(str: string): string {
  return str
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[\/\!]*?[^<>]*?>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}