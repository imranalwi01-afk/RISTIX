// packages/backend/src/index.ts
// ✅ SURGICAL FIX: Properly mount API routes with /api/v1 prefix

// ✅ CRITICAL FIX: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Verify NODE_ENV is loaded
console.log('🔧 Environment loaded:', process.env.NODE_ENV || 'undefined');

import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

// ✅ CRITICAL: Initialize dependency injection container before importing routes
import { initializeContainer } from './core/container/index';

// ✅ Import centralized configuration
import { backendEnvironmentLoader } from './config/environment-loader-backend';

// Initialize the container first
console.log('🔧 Initializing dependency injection container...');
const container = initializeContainer();
console.log('✅ Dependency injection container initialized');

// ✅ FIXED: Import your actual API routes (after container initialization)
import apiRoutes from './api/routes/index';

// Import middleware - try custom first, fall back to basic
let securityHeaders, corsConfig, createRateLimit, sanitizeRequest, bankingComplianceMiddleware, logSecurityEvents, debugOptionsMiddleware;
let globalErrorHandler, notFoundHandler, bankingErrorHandler, validationErrorHandler, databaseErrorHandler;

try {
  // Try to import custom middleware
  const securityMiddleware = require('./api/middleware/security.middleware');
  securityHeaders = securityMiddleware.securityHeaders;
  corsConfig = securityMiddleware.corsConfig;
  createRateLimit = securityMiddleware.createRateLimit;
  sanitizeRequest = securityMiddleware.sanitizeRequest;
  bankingComplianceMiddleware = securityMiddleware.bankingComplianceMiddleware;
  logSecurityEvents = securityMiddleware.logSecurityEvents;
  debugOptionsMiddleware = securityMiddleware.debugOptionsMiddleware;
  console.log('✅ Custom security middleware loaded');
} catch (error) {
  // Fall back to basic middleware
  const fallbackSecurity = require('./api/middleware/fallback.middleware');
  securityHeaders = fallbackSecurity.securityHeaders;
  corsConfig = fallbackSecurity.corsConfig;
  createRateLimit = fallbackSecurity.createRateLimit;
  sanitizeRequest = fallbackSecurity.sanitizeRequest;
  bankingComplianceMiddleware = fallbackSecurity.bankingComplianceMiddleware;
  logSecurityEvents = fallbackSecurity.logSecurityEvents;
  console.log('⚠️ Using fallback security middleware');
}

try {
  // Try to import custom error handlers
  const errorMiddleware = require('./api/middleware/error.middleware');
  globalErrorHandler = errorMiddleware.globalErrorHandler;
  notFoundHandler = errorMiddleware.notFoundHandler;
  bankingErrorHandler = errorMiddleware.bankingErrorHandler;
  validationErrorHandler = errorMiddleware.validationErrorHandler;
  databaseErrorHandler = errorMiddleware.databaseErrorHandler;
  console.log('✅ Custom error handlers loaded');
} catch (error) {
  // Fall back to basic error handlers
  const fallbackErrors = require('./api/middleware/error.fallback');
  globalErrorHandler = fallbackErrors.globalErrorHandler;
  notFoundHandler = fallbackErrors.notFoundHandler;
  bankingErrorHandler = fallbackErrors.bankingErrorHandler;
  validationErrorHandler = fallbackErrors.validationErrorHandler;
  databaseErrorHandler = fallbackErrors.databaseErrorHandler;
  console.log('⚠️ Using fallback error handlers');
}

// Import logger - try custom first, fall back to minimal
let logger;
try {
  logger = require('./config/logger').default || require('./config/logger');
  console.log('✅ Custom logger loaded');
} catch (error) {
  // Create minimal console logger
  logger = {
    info: (msg: any, meta?: any) => console.log(meta ? `[INFO] ${msg}` : `[INFO] ${msg}`, meta || ''),
    warn: (msg: any, meta?: any) => console.warn(meta ? `[WARN] ${msg}` : `[WARN] ${msg}`, meta || ''),
    error: (msg: any, meta?: any) => console.error(meta ? `[ERROR] ${msg}` : `[ERROR] ${msg}`, meta || ''),
    debug: (msg: any, meta?: any) => console.debug(meta ? `[DEBUG] ${msg}` : `[DEBUG] ${msg}`, meta || '')
  };
  console.log('⚠️ Using fallback console logger');
}

// Load environment configuration
dotenv.config();

const app = express();

// ✅ CRITICAL FIX: Configure Express trust proxy for rate limiting
app.set('trust proxy', 1); // Trust first proxy (nginx/reverse proxy)

// ✅ Use centralized configuration system

const config = backendEnvironmentLoader.getConfiguration();
const PORT = process.env.PORT || config.servers.backend.port;
const HOST = config.servers.backend.host;
const APP_NAME = process.env.APP_NAME || 'IFRS9_Platform_Backend';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const NODE_ENV = config.deployment.nodeEnv;

// ✅ IFRS9 Configuration from environment variables
const ISLAMIC_BANKING_ENABLED = process.env.ISLAMIC_BANKING_ENABLED === 'true';
const SYARIAH_COMPLIANCE_REQUIRED = process.env.SYARIAH_COMPLIANCE_REQUIRED === 'true';
const MAX_TENANT_CONNECTIONS = parseInt(process.env.MAX_TENANT_CONNECTIONS || '10');
const DEFAULT_TENANT_TIER = process.env.DEFAULT_TENANT_TIER || 'basic';
const FRONTEND_URL = config.urls.frontend;

// ✅ SECURITY MIDDLEWARE STACK (order matters)
app.use(securityHeaders);
if (debugOptionsMiddleware) app.use(debugOptionsMiddleware);
app.use(corsConfig);
app.use(createRateLimit());
app.use(sanitizeRequest);

// ✅ BASIC MIDDLEWARE
app.use(compression());

// ✅ Morgan logging with winston integration
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ AUDIT LOGGING
app.use(logSecurityEvents);

// ✅ HEALTH CHECK ENDPOINT (public, no middleware)
app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: APP_NAME,
      version: APP_VERSION,
      environment: NODE_ENV,
      
      server: {
        host: HOST,
        port: PORT,
        frontend_url: FRONTEND_URL,
        accessible_via: [
          `http://localhost:${PORT}`,
          ...(HOST === '0.0.0.0' ? [`http://[YOUR_IP]:${PORT}`] : [])
        ]
      },
      
      platform: {
        islamic_banking: ISLAMIC_BANKING_ENABLED,
        syariah_compliance: SYARIAH_COMPLIANCE_REQUIRED,
        max_tenant_connections: MAX_TENANT_CONNECTIONS,
        default_tenant_tier: DEFAULT_TENANT_TIER
      },
      
      features: {
        multiTenant: true,
        dualBanking: true,
        syariahCompliance: SYARIAH_COMPLIANCE_REQUIRED,
        ifrs9Calculations: true,
        authenticationAPI: true,
        routes_mounted: true
      },

      // ✅ Available API routes
      api_routes: {
        base: '/api/v1',
        authentication: '/api/v1/auth',
        health: '/health',
        status: '/status'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: APP_NAME,
      error: 'Health check failed'
    });
  }
});

// ✅ PLATFORM STATUS ENDPOINT
app.get('/status', (req, res) => {
  res.json({
    platform: APP_NAME,
    version: APP_VERSION,
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    
    server: {
      host: HOST,
      port: PORT,
      frontend_url: FRONTEND_URL,
      network_accessible: HOST === '0.0.0.0',
      accessible_via: [
        `http://localhost:${PORT}`,
        ...(HOST === '0.0.0.0' ? [
          `http://0.0.0.0:${PORT}`,
          `http://[YOUR_IP]:${PORT}`
        ] : [])
      ]
    },
    
    banking_support: {
      conventional: true,
      syariah: ISLAMIC_BANKING_ENABLED,
      dual_mode: true,
      compliance_required: SYARIAH_COMPLIANCE_REQUIRED
    },
    
    multi_tenant: {
      enabled: true,
      max_connections: MAX_TENANT_CONNECTIONS,
      default_tier: DEFAULT_TENANT_TIER,
      isolation: 'database-per-tenant'
    },
    
    api_status: {
      base_url: '/api/v1',
      authentication_available: true,
      routes_mounted: true,
      endpoints: [
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/logout',
        'GET /api/v1/auth/verify',
        'GET /api/v1/auth/me',
        'GET /api/v1/auth/status'
      ]
    },
    
    features: [
      'multi-tenant-architecture',
      'database-per-tenant',
      'dual-banking-support',
      ...(SYARIAH_COMPLIANCE_REQUIRED ? ['syariah-compliance'] : []),
      'ifrs9-calculations',
      'jwt-authentication',
      'api-v1-routes'
    ]
  });
});

// ✅ BANKING COMPLIANCE MIDDLEWARE for banking operations
app.use('/api/v1', bankingComplianceMiddleware);

// ✅ CRITICAL FIX: Mount API routes with /api/v1 prefix
console.log('🔄 Mounting API routes...');
app.use('/api/v1', apiRoutes);
console.log('✅ API routes mounted at /api/v1');

// ✅ Root endpoint with comprehensive platform information
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed', {
    type: 'ROOT_ACCESS',
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'IFRS 9 Multi-Tenant Platform Backend',
    app_name: APP_NAME,
    version: APP_VERSION,
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    
    // ✅ Server information
    server: {
      host: HOST,
      port: PORT,
      frontend_url: FRONTEND_URL,
      accessible_via: [
        `http://localhost:${PORT}`,
        ...(HOST === '0.0.0.0' ? [
          `http://0.0.0.0:${PORT}`,
          `http://127.0.0.1:${PORT}`
        ] : [])
      ]
    },
    
    // ✅ Platform features
    platform_features: {
      multi_tenant_architecture: true,
      islamic_banking: ISLAMIC_BANKING_ENABLED,
      syariah_compliance: SYARIAH_COMPLIANCE_REQUIRED,
      ifrs9_calculations: true,
      dual_banking_support: true,
      tenant_isolation: true,
      jwt_authentication: true,
      api_v1_routes: true
    },
    
    // ✅ API navigation
    api_navigation: {
      api_base: '/api/v1',
      health_check: '/health',
      status: '/status',
      authentication: '/api/v1/auth',
      auth_endpoints: {
        login: '/api/v1/auth/login',
        logout: '/api/v1/auth/logout',
        verify: '/api/v1/auth/verify',
        me: '/api/v1/auth/me',
        status: '/api/v1/auth/status'
      }
    },
    
    // ✅ Demo credentials for testing
    demo_credentials: {
      note: 'All users have password: 1019181716',
      platform_admin: {
        email: 'admin@ifrspro.id',
        password: '1019181716',
        description: 'Platform Super Administrator'
      },
      banking_conventional: {
        email: 'cro@metrobank.com',
        password: '1019181716',
        tenantId: 'demo_conventional',
        description: 'Bank Chief Risk Officer (Conventional)'
      },
      banking_syariah: {
        email: 'cro@syariahbank.com',
        password: '1019181716',
        tenantId: 'demo_syariah',
        description: 'Syariah Bank Chief Risk Officer (Islamic)'
      }
    },
    
    // ✅ Quick start commands
    quick_start: {
      test_health: `curl http://localhost:${PORT}/health`,
      test_api: `curl http://localhost:${PORT}/api/v1`,
      test_auth_status: `curl http://localhost:${PORT}/api/v1/auth/status`,
      test_login: `curl -X POST http://localhost:${PORT}/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@ifrspro.id","password":"1019181716"}'`,
      test_banking_login: `curl -X POST http://localhost:${PORT}/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"cro@metrobank.com","password":"1019181716","tenantId":"demo_conventional"}'`
    }
  });
});

// ✅ ERROR HANDLING MIDDLEWARE STACK (order matters)
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(bankingErrorHandler);
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Mount simple test route
import simpleTestRoutes from './api/routes/simple-test.routes';
app.use('/test', simpleTestRoutes);

// ✅ GRACEFUL SHUTDOWN HANDLING
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// ✅ START SERVER
app.listen(PORT, HOST, () => {
  const logMessage = (msg: string) => {
    logger.info(msg);
  };

  // ✅ Get centralized configuration
  const config = backendEnvironmentLoader.getConfiguration();
  const backendConfig = config.servers.backend;
  const protocol = backendConfig.url.startsWith('https') ? 'https' : 'http';
  const backendHost = backendConfig.host;
  const backendPort = backendConfig.port;

  logMessage('🚀 IFRS 9 Multi-Tenant Platform Backend Started');
  logMessage(`📍 Server: ${protocol}://${backendHost}:${backendPort}`);
  logMessage(`📍 Health: ${protocol}://${backendHost}:${backendPort}/health`);
  logMessage(`📍 Status: ${protocol}://${backendHost}:${backendPort}/status`);
  logMessage(`📍 API Base: ${protocol}://${backendHost}:${backendPort}/api/v1`);
  logMessage(`🔐 Auth Login: ${protocol}://${backendHost}:${backendPort}/api/v1/auth/login`);
  logMessage(`🏗️ Environment: ${NODE_ENV}`);
  logMessage(`🏛️ App: ${APP_NAME} v${APP_VERSION}`);
  logMessage(`🌐 Backend URL: ${backendConfig.url}`);
  
  if (ISLAMIC_BANKING_ENABLED) {
    logMessage('🕌 Islamic Banking: Enabled');
  }
  if (SYARIAH_COMPLIANCE_REQUIRED) {
    logMessage('📜 Syariah Compliance: Required');
  }
  
  logMessage(`🏢 Max Tenant Connections: ${MAX_TENANT_CONNECTIONS}`);
  logMessage(`⭐ Default Tenant Tier: ${DEFAULT_TENANT_TIER}`);
  logMessage(`🔒 Security: Enabled (Helmet, CORS, Rate Limiting)`);
  logMessage(`📊 Multi-Tenant: Database-per-tenant isolation`);
  logMessage(`🛣️ API Routes: Mounted at /api/v1`);
  logMessage(`✅ Ready for multi-tenant banking operations`);
  
  if (HOST === '0.0.0.0') {
    logMessage(`🌐 Network Access: Server accessible from other machines`);
    logMessage(`🔗 Local Access: ${protocol}://localhost:${backendPort}`);
    logMessage(`🔗 Network Access: ${protocol}://[YOUR_IP]:${backendPort}`);
  }

  // ✅ Display test commands
  console.log('\n🧪 QUICK TEST COMMANDS:');
  console.log(`curl ${backendConfig.url}/health`);
  console.log(`curl ${backendConfig.url}/api/v1/auth/status`);
  console.log(`curl -X POST ${backendConfig.url}/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@ifrspro.id","password":"1019181716"}'`);
  console.log('');
});

export default app;