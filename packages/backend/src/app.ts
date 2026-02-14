// packages/backend/src/app.ts
// ============================================================================
// 🩹 SURGICAL FIX: Add trust proxy configuration to fix rate limiting error
// ============================================================================
// ✅ FIXED: X-Forwarded-For header error
// ✅ ADDED: Trust proxy setting before rate limiting
// ✅ PRESERVED: All existing functionality
// ============================================================================

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// ✅ FIXED: Correct import paths (keep your existing imports)
import appConfig from './config/app';
import logger from './config/logger';
import databaseManager from './config/database';
import { modelManager } from './models';
import apiRoutes from './api/routes'; // ✅ Use your existing routes

// ✅ NEW: Import centralized database components (if they exist)
// Comment out if these don't exist in your project yet
// import { 
//   databaseConfig, 
//   type DatabaseServerConfig, 
//   type DatabaseInstanceConfig 
// } from './core/database/config/database.config';

const app: Application = express();

// ============================================================================
// 🩹 SURGICAL FIX: Trust proxy BEFORE rate limiting (fixes X-Forwarded-For error)
// ============================================================================
app.set('trust proxy', true); // ✅ ENHANCED FIX: Use true instead of 1 for better compatibility

// ✅ Initialize application
async function initializeApp(): Promise<void> {
  try {
    logger.info('🚀 IFRS9 Platform Backend Startup', {
      timestamp: new Date().toISOString(),
      environment: appConfig.nodeEnv,
      host: appConfig.host,
      port: appConfig.port,
    });

    // Initialize database connections
    logger.info('📊 Initializing database connections...');
    await databaseManager.initializeConnections();

    // Initialize models
    logger.info('🏗️ Initializing database models...');
    await modelManager.initializeModels();

    // ✅ NEW: Initialize centralized database system (optional)
    // logger.info('🔧 Initializing centralized database system...');
    // await initializeCentralizedDatabase();

    logger.info('✅ Application initialization completed');

  } catch (error) {
    logger.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// ✅ NEW: Centralized database initialization (optional)
// async function initializeCentralizedDatabase(): Promise<void> => {
//   try {
//     const health = await databaseConfig.healthCheck();
//     logger.info(`🏥 Database health check: ${health.status}`, {
//       healthy: health.connections.filter(c => c.status === 'healthy').length,
//       total: health.connections.length
//     });
//     logger.info('✅ Centralized database system ready');
//   } catch (error) {
//     logger.warn('⚠️ Centralized database system initialization failed:', error);
//   }
// }

// ✅ Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ✅ CORS configuration
app.use(cors({
  origin: appConfig.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Tenant-Slug'],
}));

// ✅ SURGICAL FIX: Enhanced rate limiting (now works with trust proxy)
app.use(rateLimit({
  windowMs: appConfig.rateLimitWindowMs || 900000, // 15 minutes
  max: appConfig.rateLimitMaxRequests || 1000,
  message: {
    success: false,
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ SURGICAL FIX: Skip rate limiting for development/internal IPs
  skip: (req) => {
    const ip = req.ip || '';
    const skipIPs = process.env.RATE_LIMIT_SKIP_IPS ?
      process.env.RATE_LIMIT_SKIP_IPS.split(',') :
      ['127.0.0.1', '::1', 'localhost', '192.168.0.85'];
    return skipIPs.some(skipIP => ip.includes(skipIP.trim()));
  }
}));

// ✅ Request processing middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ✅ NEW: System database status endpoints (optional - add if needed)
app.get('/api/v1/system/database-status', async (req: Request, res: Response) => {
  try {
    // Basic health check using your existing database manager
    const dbStatus = await databaseManager.getConnectionStatus();

    res.json({
      success: true,
      message: 'Database system status',
      data: {
        overall_status: dbStatus.all_healthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        databases: dbStatus
      }
    });
  } catch (error) {
    logger.error('Database status check failed:', error);
    res.status(503).json({
      success: false,
      error: 'Database status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ Add missing global health endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      service: 'IFRS9 Multi-Tenant Platform Backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ Mount API routes (using your existing route structure)
app.use('/api/v1', apiRoutes);

// ✅ Root endpoint with comprehensive platform information
app.get('/', (req: Request, res: Response) => {
  logger.info('Root endpoint accessed', {
    type: 'ROOT_ACCESS',
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'IFRS 9 Multi-Tenant Platform Backend',
    app_name: appConfig.appName,
    version: appConfig.appVersion,
    environment: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),

    // ✅ Server information
    server: {
      host: appConfig.host,
      port: appConfig.port,
      frontend_url: appConfig.frontendUrl,
      accessible_via: [
        appConfig.frontendUrl,
        ...(appConfig.host === '0.0.0.0' ? [
          `http://0.0.0.0:${appConfig.port}`,
          `http://127.0.0.1:${appConfig.port}`
        ] : [])
      ]
    },

    // ✅ Platform features
    platform_features: {
      multi_tenant_architecture: true,
      islamic_banking: appConfig.islamicBankingEnabled,
      syariah_compliance: appConfig.syariahComplianceRequired,
      ifrs9_calculations: true,
      dual_banking_support: true,
      tenant_isolation: true,
      approval_workflows: true,
      audit_trail: true,
      performance_monitoring: appConfig.performanceMonitoring,
      jwt_authentication: true, // ✅ FIXED
      rate_limiting_fixed: true // ✅ FIXED
    },

    // ✅ API navigation
    api_navigation: {
      api_base: '/api/v1',
      health_check: '/health',
      authentication: '/api/v1/auth/login',
      token_refresh: '/api/v1/auth/refresh', // ✅ FIXED: Now working
      api_info: '/api/v1',
      database_status: '/api/v1/system/database-status',
      banking_endpoints: '/api/v1/banking', // ✅ ADDED
      ifrs9_endpoints: '/api/v1/ifrs9' // ✅ ADDED
    },

    // ✅ Demo credentials for testing
    demo_credentials: {
      note: 'All users have password: 1019181716',
      examples: {
        platform_admin: {
          email: 'admin@ifrspro.id',
          password: '1019181716',
          description: 'Platform Super Administrator'
        },
        banking_conventional: {
          email: 'cro@metrobank.com',
          password: '1019181716',
          description: 'Bank Chief Risk Officer (Conventional)'
        },
        banking_syariah: {
          email: 'cro@barakahbank.com',
          password: '1019181716',
          description: 'Syariah Bank Chief Risk Officer (Islamic)'
        },
        banking_dana: { // ✅ ADDED: DANA Digital Bank
          email: 'ifrs.manager@dana.com',
          password: '1019181716',
          description: 'IFRS Manager - DANA Digital Bank'
        }
      }
    },

    // ✅ Quick start commands
    quick_start: {
      login_endpoint: `POST ${appConfig.frontendUrl}/api/v1/auth/login`,
      test_commands: [
        `curl ${appConfig.frontendUrl}/health`,
        `curl ${appConfig.frontendUrl}/api/v1`,
        `curl ${appConfig.frontendUrl}/api/v1/system/database-status`,
        `curl -X POST ${appConfig.frontendUrl}/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"ifrs.manager@dana.com","password":"1019181716","tenantId":"dana"}'`
      ]
    }
  });
});

// ✅ Global error handler (enhanced)
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = Date.now().toString();

  logger.error('Global error occurred', {
    type: 'GLOBAL_ERROR',
    requestId,
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    requestId,
    timestamp: new Date().toISOString(),

    // ✅ Development information
    ...(appConfig.nodeEnv === 'development' && {
      stack: error.stack,
      details: {
        method: req.method,
        path: req.originalUrl
      }
    }),

    // ✅ Help information
    help: {
      health_check: '/health',
      api_info: '/api/v1',
      database_status: '/api/v1/system/database-status',
      contact: 'Check server logs for detailed error information'
    }
  });
});

// ✅ Graceful shutdown handlers
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await databaseManager.closeAllConnections();
  // await databaseConfig.closeAllConnections(); // ✅ Uncomment if using centralized DB
  await modelManager.closeConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await databaseManager.closeAllConnections();
  // await databaseConfig.closeAllConnections(); // ✅ Uncomment if using centralized DB
  await modelManager.closeConnections();
  process.exit(0);
});

// ✅ Initialize application
initializeApp().catch(error => {
  logger.error('Failed to initialize app:', error);
  process.exit(1);
});

export default app;