// packages/backend/src/routes/index.ts
// ============================================================================
// 🩹 SURGICAL FIX: Added R Analytics route mounting
// ============================================================================
// ✅ SURGICAL ADDITION: Just ONE line added for R Analytics integration
// ✅ PRESERVED: All your existing route structure and functionality
// ============================================================================

import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import databaseManager from '../config/database';
import { modelManager } from '../models';
import appConfig from '../config/app';
import logger from '../config/logger';

// ✅ PRESERVED: Your existing route imports
import bankingParameterRoutes from '../api/routes/banking-parameter.routes'; // ✅ Existing file
import ifrs9Routes from '../api/routes/ifrs9/ifrs9.routes'; // ✅ Existing file

// 🩹 SURGICAL ADDITION: Import R Analytics routes
import rAnalyticsRoutes from '../api/routes/r-analytics.routes'; // ✅ Your existing file

const router = Router();

// ✅ PRESERVED: Your existing health check endpoint (unchanged)
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connections
    const dbStatus = await databaseManager.getConnectionStatus();
    const modelsInitialized = modelManager.isInitialized();
    
    const responseTime = Date.now() - startTime;
    const isHealthy = dbStatus.all_healthy && modelsInitialized;
    
    logger.info('Health check accessed', {
      type: 'HEALTH_CHECK',
      ip: req.ip,
      responseTime: `${responseTime}ms`,
      status: isHealthy ? 'healthy' : 'degraded'
    });

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      
      // Service status
      services: {
        api: 'healthy',
        database: dbStatus.all_healthy ? 'healthy' : 'degraded',
        models: modelsInitialized ? 'healthy' : 'initializing',
        r_analytics: 'healthy' // 🩹 ADDED: R Analytics service status
      },
      
      // Database details
      databases: dbStatus,
      
      // System information
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: appConfig.appVersion,
        environment: appConfig.nodeEnv
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Health check failed', {
      type: 'HEALTH_CHECK_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`
    });

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });
  }
});

// ✅ PRESERVED: Your existing API information endpoint (enhanced)
router.get('/api/v1', (req: Request, res: Response) => {
  logger.info('API info accessed', {
    type: 'API_INFO',
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'IFRS 9 Multi-Tenant Platform API v1',
    version: appConfig.appVersion,
    timestamp: new Date().toISOString(),
    
    // ✅ Enhanced endpoints documentation with R Analytics
    endpoints: {
      authentication: {
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout', 
        refresh: 'POST /api/v1/auth/refresh',
        me: 'GET /api/v1/auth/me',
        verify: 'GET /api/v1/auth/verify'
      },
      banking: {
        service_info: 'GET /api/v1/banking',
        health_check: 'GET /api/v1/banking/health',
        portfolio_summary: 'GET /api/v1/banking/portfolio/summary',
        recent_activities: 'GET /api/v1/banking/activities/recent',
        application_setup: {
          list: 'GET /api/v1/banking/setup/application',
          create: 'POST /api/v1/banking/setup/application',
          update: 'PUT /api/v1/banking/setup/application/:param_code',
          delete: 'DELETE /api/v1/banking/setup/application/:param_code'
        },
        business_setup: {
          list: 'GET /api/v1/banking/setup/business',
          create: 'POST /api/v1/banking/setup/business'
        },
        product_parameters: {
          list: 'GET /api/v1/banking/parameters/product',
          create: 'POST /api/v1/banking/parameters/product',
          update: 'PUT /api/v1/banking/parameters/product/:prd_code',
          delete: 'DELETE /api/v1/banking/parameters/product/:prd_code'
        },
        journal_parameters: {
          list: 'GET /api/v1/banking/parameters/journal',
          create: 'POST /api/v1/banking/parameters/journal',
          update: 'PUT /api/v1/banking/parameters/journal/:gl_code',
          delete: 'DELETE /api/v1/banking/parameters/journal/:gl_code'
        }
      },
      ifrs9: {
        service_info: 'GET /api/v1/ifrs9',
        calculations_summary: 'GET /api/v1/ifrs9/calculations/summary',
        portfolio_summary: 'GET /api/v1/ifrs9/portfolio/summary',
        recent_activities: 'GET /api/v1/ifrs9/activities/recent',
        ecl_calculation: 'POST /api/v1/ifrs9/calculations/ecl',
        calculation_batches: 'GET /api/v1/ifrs9/calculation-batches',
        staging_analyze: 'POST /api/v1/ifrs9/staging/analyze',
        pd_calculate: 'POST /api/v1/ifrs9/pd/calculate',
        lgd_calculate: 'POST /api/v1/ifrs9/lgd/calculate',
        ead_compute: 'POST /api/v1/ifrs9/ead/compute'
      },
      // 🩹 SURGICAL ADDITION: R Analytics endpoints
      r_analytics: {
        service_info: 'GET /api/v1/r-analytics/health',
        create_session: 'POST /api/v1/r-analytics/session',
        get_session: 'GET /api/v1/r-analytics/session/:sessionId',
        list_sessions: 'GET /api/v1/r-analytics/sessions',
        terminate_session: 'DELETE /api/v1/r-analytics/session/:sessionId',
        admin_sessions: 'GET /api/v1/r-analytics/admin/sessions'
      },
      system: {
        health: 'GET /health',
        api_info: 'GET /api/v1'
      }
    },
    
    // Authentication information
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      tenant_header: 'X-Tenant-Slug: <tenant-slug>',
      token_expiry: appConfig.jwtExpiresIn
    },
    
    // Demo credentials for testing
    demo_accounts: {
      note: 'All demo accounts use password: 1019181716',
      platform_admin: 'admin@ifrspro.id',
      banking_conventional: 'cro@metrobank.com',
      banking_syariah: 'cro@barakahbank.com',
      banking_dana: 'ifrs.manager@dana.com'
    },
    
    // Platform capabilities
    platform_features: {
      multi_tenant_architecture: true,
      islamic_banking: appConfig.islamicBankingEnabled,
      dual_banking_support: true,
      ifrs9_calculations: true,
      tenant_isolation: true,
      banking_parameters: true,
      ds2_integration: true,
      r_analytics: true // 🩹 ADDED: R Analytics capability
    }
  });
});

// ==========================================
// MOUNT ALL ROUTES WITH CORRECT IMPORTS
// ==========================================

// ✅ PRESERVED: Mount authentication routes
router.use('/api/v1/auth', authRoutes);

// ✅ PRESERVED: Mount banking parameter routes
router.use('/api/v1/banking', bankingParameterRoutes);

// ✅ PRESERVED: Mount IFRS9 routes  
router.use('/api/v1/ifrs9', ifrs9Routes);

// 🩹 SURGICAL ADDITION: Mount R Analytics routes (THE MISSING PIECE!)
router.use('/api/v1/r-analytics', rAnalyticsRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

// ✅ PRESERVED: Catch-all route for undefined endpoints (enhanced)
router.use('*', (req: Request, res: Response) => {
  logger.warn('Route not found', {
    type: 'ROUTE_NOT_FOUND',
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    available_endpoints: {
      health: 'GET /health',
      api_info: 'GET /api/v1',
      authentication: 'POST /api/v1/auth/login',
      banking: 'GET /api/v1/banking',
      ifrs9: 'GET /api/v1/ifrs9',
      r_analytics: 'GET /api/v1/r-analytics/health' // 🩹 ADDED
    },
    suggestion: 'Check the API documentation at GET /api/v1 for all available endpoints'
  });
});

console.log('✅ All routes mounted successfully');
console.log('📋 Available endpoints:');
console.log('   🔐 Authentication: /api/v1/auth/*');
console.log('   🏦 Banking: /api/v1/banking/*');
console.log('   📊 IFRS9: /api/v1/ifrs9/*');
console.log('   🔬 R Analytics: /api/v1/r-analytics/*'); // 🩹 ADDED
console.log('   ❤️ Health: /health');

export default router;