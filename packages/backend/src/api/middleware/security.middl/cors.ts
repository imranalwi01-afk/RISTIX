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
    const corsOrigins = envConfig.cors.origins;

    console.log(`✅ CORS configured with ${corsOrigins.length} origins from centralized config:`, corsOrigins);
    console.log(`🔍 Current origin being checked:`, process.env.NODE_ENV);
    return corsOrigins;
  } catch (error) {
    console.warn('⚠️ Failed to load centralized CORS config, using fallback origins:', error);

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

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`✅ CORS allowing request with no origin`);
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      console.warn(`❌ Available origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS policy'), false);
    }
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

// Manual CORS handler for specific routes
export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  // Set CORS headers manually if needed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
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
      envConfig.servers.backend.url,
      envConfig.rAnalytics.url,
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

export default corsMiddleware;

// CommonJS export for compatibility with require() statements
module.exports = { corsMiddleware };