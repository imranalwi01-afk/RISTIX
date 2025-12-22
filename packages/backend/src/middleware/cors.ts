// packages/backend/src/middleware/cors.ts
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { backendEnvironmentLoader } from '../config/environment-loader-backend';

/**
 * IFRS9 Platform CORS Configuration
 * Handles cross-origin requests for multi-tenant banking platform
 * ✅ CENTRALIZED CONFIGURATION: Uses environment loader for dynamic origins
 */

// Define allowed origins using centralized configuration
const getAllowedOrigins = (): string[] => {
  try {
    // Use centralized environment configuration
    const envConfig = backendEnvironmentLoader.getConfiguration();

    // Check if servers and servers.backend exist before accessing url
    let corsOrigins: string[] = [];
    if (envConfig && envConfig.servers && envConfig.servers.backend) {
      // The CORS origins should come from the cors.origins array, not servers.backend.url
      corsOrigins = envConfig.cors?.origins || [];
    }

    console.log(`✅ CORS configured with ${corsOrigins.length} origins from centralized config:`, corsOrigins);
    console.log(`🔍 Current environment:`, process.env.NODE_ENV);
    return corsOrigins;
  } catch (error) {
    console.warn('⚠️ Failed to load centralized CORS config, using environment variables:', error);

    // Fallback origins for emergencies
    const fallbackOrigins = [
      // Main production origins
      'https://ifrs9.ifrspro.id',
      'https://bifrs9.ifrspro.id',
      'https://ifrs9-iaf.ifrspro.id',
      'https://iaf-ifrs.danafin.com',
      'https://iaf-ifrs-be.danafin.com',
      'https://iaf-ifrs-analytics.danafin.com',

      // Additional domains from environment
      ...(process.env.ADDITIONAL_CORS_ORIGINS?.split(',') || [])
    ];

    return fallbackOrigins.filter(Boolean);
  }
};

// CORS options configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    console.log(`🔍 CORS origin check - Requested origin: ${origin}`);
    console.log(`🔍 CORS origin check - Allowed origins:`, allowedOrigins);

    // 🚀 CLOUDFLARE BYPASS: Always allow requests without Origin header
    // This handles Cloudflare stripping and ensures frontend can communicate
    if (!origin) {
      console.log(`✅ CORS BYPASS: Allowing request with no origin (Cloudflare stripped or mobile/curl)`);
      return callback(null, true);
    }

    // Check direct origin match
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowing origin: ${origin}`);
      callback(null, true);
      return;
    }

    // 🚀 COMPREHENSIVE IAF DOMAIN SUPPORT: Allow all IAF-related domains
    const iafDomains = [
      'https://iaf-ifrs.ifrspro.id',        // Development frontend
      'https://iaf-ifrs-be.ifrspro.id',       // Development backend
      'https://iaf-ifrs-analytics.ifrspro.id', // Development analytics
      'https://iaf-ifrs.danafin.com',         // Production frontend
      'https://iaf-ifrs-be.danafin.com',      // Production backend
      'https://iaf-ifrs-analytics.danafin.com', // Production analytics
      'https://ifrs9-iaf.ifrspro.id',         // Alternative development frontend
      'https://bifrs9-iaf.ifrspro.id',        // Alternative development backend
      'https://ifrs9-iaf-analytics.ifrspro.id'  // Alternative development analytics
    ];

    if (iafDomains.includes(origin)) {
      console.log(`✅ CORS allowing IAF domain: ${origin}`);
      callback(null, true);
      return;
    }

    // 🚀 DEVELOPMENT BYPASS: Allow common development patterns
    if (process.env.NODE_ENV !== 'production' ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('192.168.')) {
      console.log(`✅ CORS allowing development origin: ${origin}`);
      return callback(null, true);
    }

    console.warn(`❌ CORS blocked origin: ${origin}`);
    console.warn(`❌ Available origins:`, allowedOrigins);
    callback(new Error('Not allowed by CORS policy'), false);
  },
  
  credentials: true,
  
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
    'HEAD'
  ],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Tenant-ID',
    'X-Banking-Type',
    'X-Request-ID'
  ],
  
  exposedHeaders: [
    'X-Total-Count',
    'X-Request-ID',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  
  // Preflight cache duration (seconds)
  maxAge: 86400, // 24 hours
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Development CORS (more permissive)
const developmentCorsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: '*',
  exposedHeaders: '*',
  maxAge: 86400
};

// Create CORS middleware
export const corsMiddleware = cors(
  process.env.NODE_ENV === 'development' 
    ? developmentCorsOptions 
    : corsOptions
);

// Enhanced CORS handler for Cloudflare stripping issues
export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  console.log(`🔍 Enhanced CORS Handler - Origin: ${origin}`);
  console.log(`🔍 Enhanced CORS Handler - Headers:`, {
    origin,
    referer: req.headers.referer,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-forwarded-host': req.headers['x-forwarded-host'],
    'x-real-ip': req.headers['x-real-ip'],
    'user-agent': req.headers['user-agent']
  });

  // Handle Cloudflare stripped Origin header
  let allowedOrigin = '*';

  if (origin && allowedOrigins.includes(origin)) {
    // Normal case: Origin header present and allowed
    allowedOrigin = origin;
    console.log(`✅ CORS: Origin header allowed: ${origin}`);
  } else if (!origin) {
    // Cloudflare stripping case: No Origin header
    // Try to determine origin from other headers
    const referer = req.headers.referer;
    const userAgent = req.headers['user-agent'];
    const forwardedHost = req.headers['x-forwarded-host'] as string;

    console.log(`🔍 CORS: No Origin header - Checking Referer: ${referer}, User-Agent: ${userAgent}, Forwarded-Host: ${forwardedHost}`);

    // Allow if Referer is from allowed domain
    if (referer) {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.includes(refererOrigin)) {
        allowedOrigin = refererOrigin;
        console.log(`✅ CORS: Referer-based origin allowed: ${refererOrigin}`);
      }
    }

    // Allow if User-Agent indicates browser and forwarded host is allowed
    if (allowedOrigin === '*' && userAgent && userAgent.includes('Mozilla') && forwardedHost) {
      const forwardedDomain = `https://${forwardedHost}`;
      if (allowedOrigins.includes(forwardedDomain)) {
        allowedOrigin = forwardedDomain;
        console.log(`✅ CORS: Forwarded host-based origin allowed: ${forwardedDomain}`);
      }
    }

    // If still wildcard, try to set to first allowed origin for browser requests
    if (allowedOrigin === '*' && userAgent && userAgent.includes('Mozilla')) {
      const browserOrigins = allowedOrigins.filter(o => o.startsWith('https://'));
      if (browserOrigins.length > 0) {
        allowedOrigin = browserOrigins[0];
        console.log(`✅ CORS: Default browser origin allowed: ${allowedOrigin}`);
      }
    }
  } else {
    // Origin present but not in allowed list
    console.warn(`❌ CORS: Origin not allowed: ${origin}`);
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Tenant-ID,X-Banking-Type,X-Request-ID,Cache-Control');
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count,X-Request-ID,X-Rate-Limit-Remaining,X-Rate-Limit-Reset');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  console.log(`🔧 CORS Headers Set:`, {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD'
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS: Preflight request allowed for origin: ${allowedOrigin}`);
    res.status(204).send();
    return;
  }

  next();
};

// Specific CORS for authentication routes
export const authCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  try {
    // Use centralized environment configuration for auth origins
    const envConfig = backendEnvironmentLoader.getConfiguration();
    const allowedAuthOrigins = [
      envConfig?.servers?.backend?.url || '',
      envConfig?.rAnalytics?.url || '',
      ...(process.env.ADDITIONAL_AUTH_CORS_ORIGINS?.split(',') || [])
    ].filter(Boolean);

    if (origin && allowedAuthOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load centralized auth CORS config, using fallback:', error);

    // Fallback auth origins for emergencies
    const fallbackAuthOrigins = [
      'https://ifrs9.ifrspro.id',           // Main platform
      'https://ifrs9-iaf.ifrspro.id',       // IAF Development
      'https://iaf-ifrs.danafin.com',       // IAF Production
    ];

    if (origin && fallbackAuthOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
  }

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  next();
};

// Export CORS configuration for use in app config
export const corsConfig = {
  origins: getAllowedOrigins(),
  options: corsOptions,
  developmentOptions: developmentCorsOptions
};

// ============================================================================
// 🚀 COMPREHENSIVE CORS BYPASS MIDDLEWARE
// Handles Cloudflare header stripping and ensures frontend-backend communication
// ============================================================================

/**
 * 🔥 ULTIMATE CORS BYPASS - Zero Trust CORS Handler
 *
 * This middleware bypasses traditional CORS checks when headers are stripped
 * by reverse proxies (Cloudflare, Nginx, etc.) and implements intelligent
 * origin detection based on multiple request indicators.
 *
 * 🎯 PRIMARY GOAL: Ensure frontend-backend communication works regardless
 * of Cloudflare header stripping or reverse proxy interference
 */
export const ultimateCorsBypass = (req: Request, res: Response, next: NextFunction) => {
  console.log(`🚀 ULTIMATE CORS BYPASS - Processing request: ${req.method} ${req.url}`);

  // 🔍 Gather all available origin indicators
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const userAgent = req.headers['user-agent'];
  const forwardedHost = req.headers['x-forwarded-host'] as string;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const realIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
  const host = req.headers.host;

  console.log(`🔍 Request Headers Analysis:`, {
    origin,
    referer,
    userAgent: userAgent?.substring(0, 50) + '...',
    forwardedHost,
    forwardedProto,
    realIP,
    host
  });

  // 🌐 DETERMINE REQUEST TYPE AND TRUST LEVEL
  const isBrowserRequest = userAgent && userAgent.includes('Mozilla');
  const isAPIRequest = req.path.startsWith('/api/') || req.headers.authorization;
  const isHealthCheck = req.path === '/health' || req.path === '/status';
  const isPreflight = req.method === 'OPTIONS';

  // 🎯 INTELLIGENT ORIGIN DETECTION
  let allowedOrigin = '*';
  let trustReason = 'Default (bypass mode)';

  if (origin && getAllowedOrigins().includes(origin)) {
    // Normal case: Origin header present and allowed
    allowedOrigin = origin;
    trustReason = 'Direct origin match';
  } else if (!origin && isBrowserRequest) {
    // Cloudflare stripping case: No Origin header but browser user-agent
    trustReason = 'Browser request with stripped origin (Cloudflare)';

    // Try to reconstruct origin from referer
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (getAllowedOrigins().includes(refererOrigin)) {
          allowedOrigin = refererOrigin;
          trustReason = `Referer-based: ${refererOrigin}`;
        } else if (refererOrigin.includes('iaf-ifrs') || refererOrigin.includes('ifrs9-iaf')) {
          // Allow any IAF-related referer
          allowedOrigin = refererOrigin;
          trustReason = `IAF referer: ${refererOrigin}`;
        }
      } catch (e) {
        console.log(`⚠️ Could not parse referer: ${referer}`);
      }
    }

    // Try forwarded host
    if (allowedOrigin === '*' && forwardedHost) {
      const forwardedDomain = `${forwardedProto || 'https'}://${forwardedHost}`;
      if (getAllowedOrigins().includes(forwardedDomain)) {
        allowedOrigin = forwardedDomain;
        trustReason = `Forwarded host: ${forwardedDomain}`;
      } else if (forwardedHost.includes('iaf-ifrs') || forwardedHost.includes('ifrs9-iaf')) {
        // Allow any IAF-related forwarded host
        allowedOrigin = forwardedDomain;
        trustReason = `IAF forwarded host: ${forwardedDomain}`;
      }
    }

    // Fallback to first IAF domain for browser requests
    if (allowedOrigin === '*') {
      const iafDomains = getAllowedOrigins().filter(o =>
        o.includes('iaf-ifrs') || o.includes('ifrs9-iaf')
      );
      if (iafDomains.length > 0) {
        allowedOrigin = iafDomains[0];
        trustReason = `IAF fallback domain: ${allowedOrigin}`;
      }
    }
  } else if (origin) {
    // Origin present but not in allowed list
    trustReason = 'Origin not in allowed list';

    // Allow development origins in non-production
    if (process.env.NODE_ENV !== 'production' &&
        (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.'))) {
      allowedOrigin = origin;
      trustReason = 'Development environment bypass';
    }
  }

  // 🔒 ALWAYS ALLOW FOR CRITICAL ENDPOINTS
  if (isHealthCheck || isPreflight) {
    allowedOrigin = '*';
    trustReason = 'Critical endpoint (health/preflight) bypass';
  }

  // 🛡️ SET COMPREHENSIVE CORS HEADERS
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': allowedOrigin !== '*' ? 'true' : 'false',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD',
    'Access-Control-Allow-Headers': 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Tenant-ID,X-Banking-Type,X-Request-ID,Cache-Control,X-Real-IP,X-Forwarded-For,X-Forwarded-Proto',
    'Access-Control-Expose-Headers': 'X-Total-Count,X-Request-ID,X-Rate-Limit-Remaining,X-Rate-Limit-Reset,X-CORS-Bypass-Reason',
    'Access-Control-Max-Age': '86400',
    'X-CORS-Bypass-Reason': trustReason,
    'X-CORS-Bypass-Timestamp': new Date().toISOString()
  };

  // Apply all headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  console.log(`🔧 CORS Headers Applied:`, {
    'Access-Control-Allow-Origin': corsHeaders['Access-Control-Allow-Origin'],
    'Access-Control-Allow-Credentials': corsHeaders['Access-Control-Allow-Credentials'],
    'X-CORS-Bypass-Reason': corsHeaders['X-CORS-Bypass-Reason'],
    RequestType: isBrowserRequest ? 'Browser' : 'API/Server',
    Method: req.method,
    Path: req.path
  });

  // 🚀 HANDLE PREFLIGHT REQUESTS
  if (isPreflight) {
    console.log(`✅ PREFLIGHT BYPASS: ${req.method} ${req.url} allowed for origin: ${allowedOrigin}`);
    res.status(204).send();
    return;
  }

  // 🎯 CONTINUE TO NEXT MIDDLEWARE
  console.log(`✅ CORS BYPASS SUCCESS: Request allowed - Reason: ${trustReason}`);
  next();
};

/**
 * 🔥 MEGA CORS BYPASS - For emergency situations and testing
 *
 * This middleware completely bypasses CORS checks and allows all origins.
 * Use only in development or when troubleshooting CORS issues.
 */
export const megaCorsBypass = (req: Request, res: Response, next: NextFunction) => {
  console.log(`🔥 MEGA CORS BYPASS - Allowing ALL requests: ${req.method} ${req.url}`);

  // Set permissive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Mega-Cors-Bypass', 'true');
  res.setHeader('X-Mega-Cors-Timestamp', new Date().toISOString());

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }

  next();
};

export default corsMiddleware;

// CommonJS export for compatibility with require() statements
module.exports = {
  corsMiddleware,
  ultimateCorsBypass,
  megaCorsBypass
};