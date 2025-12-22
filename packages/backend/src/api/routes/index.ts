// packages/backend/src/api/routes/index.ts
// ============================================================================
// SURGICAL UPDATE: Add Platform Admin Routes for React Admin
// ============================================================================
// ✅ ADD this to your existing routes index after your existing routes
// ============================================================================

import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';

// ✅ DEFERRED: Load problematic routes using async import in loadRouteModules function

const router = Router();

// ✅ Mount authentication routes (always available)
router.use('/auth', authRoutes);
console.log('✅ Authentication routes loaded successfully');

// ✅ SURGICAL FIX: Direct user routes import (no try/catch)
import userRoutes from './user.routes';
router.use('/user', userRoutes);
console.log('✅ User routes loaded successfully');

// ✅ CRITICAL FIX: Add plural users route for frontend compatibility
router.use('/users', userRoutes);
console.log('✅ Users routes loaded successfully (plural for frontend compatibility)');

// ✅ SURGICAL ADDITION: Add platform admin routes for React Admin
try {
  console.log('🔄 Loading platform admin routes...');
  
  // Import platform admin routes
  const platformAdminRoutesModule = require('./platform-admin.routes');
  const platformAdminRoutes = platformAdminRoutesModule.default || platformAdminRoutesModule;
  
  if (platformAdminRoutes && typeof platformAdminRoutes === 'function') {
    router.use('/platform/admin', platformAdminRoutes);
    console.log('✅ Platform Admin routes loaded successfully');
    console.log('📋 Available platform admin endpoints:');
    console.log('   - GET  /api/v1/platform/admin/tenants');
    console.log('   - POST /api/v1/platform/admin/tenants');
    console.log('   - GET  /api/v1/platform/admin/platform-users');
    console.log('   - GET  /api/v1/platform/admin/consultants');
    console.log('   - GET  /api/v1/platform/admin/infrastructure');
    console.log('   - GET  /api/v1/platform/admin/audit-logs');
    console.log('   - GET  /api/v1/platform/admin/support-tickets');
    console.log('   - GET  /api/v1/platform/admin/analytics');
  } else {
    console.warn('⚠️ Platform admin routes module loaded but no valid router found');
    throw new Error('Invalid platform admin routes module');
  }
} catch (error) {
  console.error('❌ Failed to load platform admin routes:', error instanceof Error ? error.message : String(error));
  console.log('⚠️ Platform admin routes not available - React Admin will not work');
  
  // ✅ Provide a fallback route that explains the issue
  router.use('/platform/admin', (req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      message: 'Platform admin service is currently unavailable',
      error: {
        code: 'PLATFORM_ADMIN_SERVICE_UNAVAILABLE',
        reason: 'Service initialization failed',
        suggestion: 'Please check platform admin routes configuration and dependencies'
      },
      timestamp: new Date().toISOString(),
      note: 'This affects React Admin functionality for platform administration'
    });
  });
}

// ✅ IMPROVED: Better approval routes loading with detailed error handling
try {
  console.log('🔄 Loading approval routes...');
  
  // Import approval routes
  const approvalRoutesModule = require('./approval.routes');
  const approvalRoutes = approvalRoutesModule.default || approvalRoutesModule;
  
  if (approvalRoutes && typeof approvalRoutes === 'function') {
    router.use('/approval', approvalRoutes);
    console.log('✅ Approval routes loaded successfully');
  } else {
    console.warn('⚠️ Approval routes module loaded but no valid router found');
    throw new Error('Invalid approval routes module');
  }
} catch (error) {
  console.error('❌ Failed to load approval routes:', error instanceof Error ? error.message : String(error));
  console.log('⚠️ Approval routes not available - continuing without approval system');
  
  // ✅ Provide a fallback route that explains the issue
  router.use('/approval', (req: Request, res: Response) => {
    res.status(503).json({
      success: false,
      message: 'Approval system is currently unavailable',
      error: {
        code: 'APPROVAL_SERVICE_UNAVAILABLE',
        reason: 'Service initialization failed',
        suggestion: 'Please check service configuration and dependencies'
      },
      timestamp: new Date().toISOString()
    });
  });
}

// ✅ FIXED: Use static imports instead of dynamic requires for TypeScript compatibility
const loadedModules: string[] = ['User']; // User is already loaded
const failedModules: string[] = [];

// Import route modules statically
async function loadRouteModules() {
  // ✅ CRITICAL: Load auth-tenant routes first for dynamic login functionality
  try {
    const authTenantRoutes = await import('./auth-tenant.routes');
    router.use('/auth', authTenantRoutes.default);
    console.log('✅ Auth-Tenant routes loaded successfully - Dynamic login data available');
    loadedModules.push('Auth-Tenant');
  } catch (error) {
    console.log('⚠️ Auth-Tenant routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Auth-Tenant');
  }

  // ✅ CRITICAL: Load user registration routes for superadmin/admin setup
  try {
    const userRegistrationRoutes = await import('./user-registration.routes');
    router.use('/register', userRegistrationRoutes.default);
    console.log('✅ User Registration routes loaded successfully - Superadmin/Admin registration available');
    loadedModules.push('User Registration');
  } catch (error) {
    console.log('⚠️ User Registration routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('User Registration');
  }

  // ✅ Load core route modules with static imports
  try {
    const tenantRoutes = await import('./tenant.routes');
    router.use('/tenant', tenantRoutes.default);
    console.log('✅ Tenant routes loaded');
    loadedModules.push('Tenant');
  } catch (error) {
    console.log('⚠️ Tenant routes not available');
    failedModules.push('Tenant');
  }

  try {
    const tenantRegistryRoutes = await import('./tenant-registry.routes');
    router.use('/tenant/registry', tenantRegistryRoutes.default);
    console.log('✅ Tenant Registry routes loaded');
    loadedModules.push('Tenant Registry');
  } catch (error) {
    console.log('⚠️ Tenant Registry routes not available');
    failedModules.push('Tenant Registry');
  }

  try {
    const auditRoutes = await import('./audit.routes');
    router.use('/audit', auditRoutes.default);
    console.log('✅ Audit routes loaded');
    loadedModules.push('Audit');
  } catch (error) {
    console.log('⚠️ Audit routes not available');
    failedModules.push('Audit');
  }

  try {
    const securityRoutes = await import('./security.routes');
    router.use('/security', securityRoutes.default);
    console.log('✅ Security routes loaded');
    loadedModules.push('Security');
  } catch (error) {
    console.log('⚠️ Security routes not available');
    failedModules.push('Security');
  }

  try {
    const securityConfigRoutes = await import('./security-config.routes');
    router.use('/security/config', securityConfigRoutes.default);
    console.log('✅ Security Configuration routes loaded');
    loadedModules.push('Security Configuration');
  } catch (error) {
    console.log('⚠️ Security Configuration routes not available');
    failedModules.push('Security Configuration');
  }

  try {
    const workflowRoutes = await import('./workflow.routes');
    router.use('/workflow', workflowRoutes.default);
    console.log('✅ Workflow routes loaded');
    loadedModules.push('Workflow');
  } catch (error) {
    console.log('⚠️ Workflow routes not available');
    failedModules.push('Workflow');
  }

  try {
    const platformInfrastructureRoutes = await import('./platform-infrastructure.routes');
    router.use('/platform-infrastructure', platformInfrastructureRoutes.default);
    console.log('✅ Platform Infrastructure routes loaded');
    loadedModules.push('Platform Infrastructure');
  } catch (error) {
    console.log('⚠️ Platform Infrastructure routes not available');
    failedModules.push('Platform Infrastructure');
  }

  try {
    const ifrs9Routes = await import('./ifrs9/ifrs9.routes');
    router.use('/ifrs9', ifrs9Routes.default);
    // ✅ ADDITIONAL: Mount IFRS9 routes at /banking/ifrs9 for frontend compatibility
    router.use('/banking/ifrs9', ifrs9Routes.default);
    console.log('✅ IFRS9 routes loaded (both /ifrs9 and /banking/ifrs9)');
    loadedModules.push('IFRS9');
  } catch (error) {
    console.log('⚠️ IFRS9 routes not available');
    failedModules.push('IFRS9');
  }

  try {
    const etlWorkflowRoutes = await import('./etl/workflow.routes');
    router.use('/etl/workflow', etlWorkflowRoutes.default);
    console.log('✅ ETL Workflow routes loaded');
    loadedModules.push('ETL Workflow');
  } catch (error) {
    console.log('⚠️ ETL Workflow routes not available');
    failedModules.push('ETL Workflow');
  }

  try {
    const etlRoutes = await import('./etl/etl.routes');
    router.use('/etl', etlRoutes.default);
    console.log('✅ ETL Processing routes loaded');
    loadedModules.push('ETL Processing');
  } catch (error) {
    console.log('⚠️ ETL Processing routes not available');
    failedModules.push('ETL Processing');
  }

  // ✅ CRITICAL FIX: Load segmentation routes BEFORE banking parameters to avoid catch-all conflict
  try {
    // ✅ FIXED: Use direct import instead of async import to avoid loading issues
    const segmentationRoutes = require('./segmentation.routes');
    const segmentationRouter = segmentationRoutes.default || segmentationRoutes;

    if (segmentationRouter && typeof segmentationRouter === 'function') {
      router.use('/banking/segmentation', segmentationRouter);
      // ✅ ADDITIONAL: Mount segmentation routes at root level for frontend compatibility
      router.use('/segmentation', segmentationRouter);
      console.log('✅ Segmentation Configuration routes loaded (both /banking/segmentation and /segmentation)');
      loadedModules.push('Segmentation Configuration');
    } else {
      console.error('❌ Segmentation routes: Invalid export - not a function');
      failedModules.push('Segmentation Configuration');
    }
  } catch (error) {
    console.log('⚠️ Segmentation Configuration routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Segmentation Configuration');
  }

  try {
    const productParameterRoutes = await import('./product-parameter.routes');
    router.use('/banking/parameters/product', productParameterRoutes.default);
    console.log('✅ Product Parameters routes loaded');
    loadedModules.push('Product Parameters');
  } catch (error) {
    console.log('⚠️ Product Parameters routes not available');
    failedModules.push('Product Parameters');
  }

  try {
    const journalParameterRoutes = await import('./journal-parameter.routes');
    router.use('/banking/parameters/journal', journalParameterRoutes.default);
    console.log('✅ Journal Parameters routes loaded');
    loadedModules.push('Journal Parameters');
  } catch (error) {
    console.log('⚠️ Journal Parameters routes not available');
    failedModules.push('Journal Parameters');
  }

  // ✅ CRITICAL: Load business-settings routes for B0012-B0016 cascading dropdowns
  try {
    const businessSettingsRoutes = await import('./business-settings.routes');
    router.use('/banking/business-settings', businessSettingsRoutes.default);
    console.log('✅ Business Settings routes loaded for B0012-B0016 cascading dropdowns');
    loadedModules.push('Business Settings');
  } catch (error) {
    console.log('⚠️ Business Settings routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Business Settings');
  }

  // ✅ ENABLED: PD Setup routes for IFRS9 Collective Impairment PD Configuration
  try {
    const pdSetupRoutes = await import('./pd-setup.routes');
    // Mount at both paths to support frontend expectations
    router.use('/banking/pd-setup', pdSetupRoutes.default);
    router.use('/banking/collective/pd-setup', pdSetupRoutes.default);
    console.log('✅ PD Setup routes loaded - IFRS9 Collective Impairment PD Configuration (both /banking/pd-setup and /banking/collective/pd-setup)');
    loadedModules.push('PD Setup');
  } catch (error) {
    console.log('⚠️ PD Setup routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('PD Setup');
  }

  // ✅ CRITICAL: FL Scalar routes for IFRS9 Forward Looking Adjustments - REAL DATABASE ONLY
  try {
    const flScalarRoutes = await import('./fl-scalar.routes');
    router.use('/banking/collective/fl-scalar', flScalarRoutes.default);
    console.log('✅ FL Scalar routes loaded - IFRS9 Forward Looking Adjustment Scalars');
    loadedModules.push('FL Scalar');
  } catch (error) {
    console.log('⚠️ FL Scalar routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('FL Scalar');
  }

  // ✅ CRITICAL: Load LGD Setup routes for IFRS9 Loss Given Default Configuration
  try {
    const lgdSetupRoutes = await import('./lgd-setup.routes');
    // Mount at both paths to support frontend expectations
    router.use('/banking/collective/lgd-setup', lgdSetupRoutes.default);
    console.log('✅ LGD Setup routes loaded - IFRS9 Loss Given Default Configuration');
    loadedModules.push('LGD Setup');
  } catch (error) {
    console.log('⚠️ LGD Setup routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('LGD Setup');
  }

  // ✅ CRITICAL: EAD Setup routes for IFRS9 Exposure At Default Configuration - REAL DATABASE ONLY
  try {
    const eadSetupRoutes = await import('./ead-setup.routes');
    router.use('/banking/collective/ead-setup', eadSetupRoutes.default);
    console.log('✅ EAD Setup routes loaded - IFRS9 Exposure At Default Configuration');
    loadedModules.push('EAD Setup');
  } catch (error) {
    console.log('⚠️ EAD Setup routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('EAD Setup');
  }

  // ✅ FIXED: Load rule-base-setting routes with async import
  try {
    const ruleBaseSettingRoutes = await import('./rule-base-setting.routes');
    // Mount at both paths to support frontend expectations
    router.use('/banking/rule-base-setting', ruleBaseSettingRoutes.default);
    router.use('/banking/collective/rule-base', ruleBaseSettingRoutes.default);
    console.log('✅ Rule Base Setting routes loaded - full version with DS2 integration');
    loadedModules.push('Rule Base Setting');
  } catch (error) {
    console.log('⚠️ Rule Base Setting routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Rule Base Setting');
  }

  try {
    const bucketParameterRoutes = await import('./bucket-parameter.routes');
    // Mount at both paths to support frontend expectations
    router.use('/banking/bucket-parameter', bucketParameterRoutes.default);
    router.use('/banking/collective/bucket', bucketParameterRoutes.default);
    console.log('✅ Bucket Parameter routes loaded');
    loadedModules.push('Bucket Parameter');
  } catch (error) {
    console.log('⚠️ Bucket Parameter routes not available');
    failedModules.push('Bucket Parameter');
  }

  try {
    const collectiveParameterRoutes = await import('./collective-parameter.routes');
    router.use('/banking/collective-parameter', collectiveParameterRoutes.default);
    console.log('✅ Collective Parameter routes loaded');
    loadedModules.push('Collective Parameter');
  } catch (error) {
    console.log('⚠️ Collective Parameter routes not available');
    failedModules.push('Collective Parameter');
  }

  // ✅ CRITICAL: Load ECL Configuration routes for IFRS9 Expected Credit Loss Configuration
  try {
    const eclConfigRoutes = await import('./ecl-configuration.routes');
    // Mount at both paths to support frontend expectations
    router.use('/banking/collective/ecl-config', eclConfigRoutes.default);
    console.log('✅ ECL Configuration routes loaded - IFRS9 Expected Credit Loss Configuration');
    loadedModules.push('ECL Configuration');
  } catch (error) {
    console.log('⚠️ ECL Configuration routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('ECL Configuration');
  }

  // ✅ ENHANCED: Banking Resource CRUD routes for React Admin
  try {
    console.log('🔄 Attempting to load Banking Resource routes...');
    const bankingResourceRoutes = await import('./banking-resource.routes');
    console.log('📦 Banking Resource module loaded:', !!bankingResourceRoutes);
    console.log('📦 Banking Resource default export:', !!bankingResourceRoutes.default);
    console.log('📦 Banking Resource export type:', typeof bankingResourceRoutes.default);
    
    if (bankingResourceRoutes.default && typeof bankingResourceRoutes.default === 'function') {
      router.use('/banking/resources', bankingResourceRoutes.default);
      console.log('✅ Banking Resource CRUD routes loaded - React Admin banking resources');
      loadedModules.push('Banking Resources');
    } else {
      console.error('❌ Banking Resource routes: Invalid export - not a function');
      failedModules.push('Banking Resources');
    }
  } catch (error) {
    console.error('❌ Banking Resource CRUD routes error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    failedModules.push('Banking Resources');
  }

  // ✅ CRITICAL: Role Management routes for CRUD operations with tenant isolation
  try {
    const roleManagementRoutes = await import('./role-management.routes');
    router.use('/roles', roleManagementRoutes.default);
    console.log('✅ Role Management routes loaded - CRUD with tenant isolation');
    loadedModules.push('Role Management');
  } catch (error) {
    console.log('⚠️ Role Management routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Role Management');
  }

  // ✅ FIXED: Load banking main routes FIRST for portfolio/activities endpoints
  try {
    const bankingMainRoutes = await import('./banking.routes');
    router.use('/banking', bankingMainRoutes.default);
    console.log('✅ Banking main routes loaded - portfolio and activities endpoints');
    loadedModules.push('Banking Main');
  } catch (error) {
    console.log('⚠️ Banking main routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Banking Main');
  }

  // ✅ FIXED: Load banking parameters AFTER specific routes to avoid catch-all blocking
  try {
    const bankingRoutes = await import('./banking-parameter.routes');
    router.use('/banking', bankingRoutes.default);
    console.log('✅ Banking Parameters routes loaded');
    loadedModules.push('Banking Parameters');
  } catch (error) {
    console.log('⚠️ Banking Parameters routes not available');
    failedModules.push('Banking Parameters');
  }

  try {
    const applicationParameterRoutes = await import('./application-parameter.routes');
    router.use('/application', applicationParameterRoutes.default);
    console.log('✅ Application Parameters routes loaded');
    loadedModules.push('Application Parameters');
  } catch (error) {
    console.log('⚠️ Application Parameters routes not available');
    failedModules.push('Application Parameters');
  }

  try {
    const menuRoutes = await import('./menu.routes');
    router.use('/menu', menuRoutes.default);
    console.log('✅ Menu routes loaded - Database-driven menu system');
    loadedModules.push('Menu');
  } catch (error) {
    console.log('⚠️ Menu routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('Menu');
  }

  try {
    const businessParameterRoutes = await import('./business-parameter.routes');
    router.use('/business', businessParameterRoutes.default);
    console.log('✅ Business Parameters routes loaded');
    loadedModules.push('Business Parameters');
  } catch (error) {
    console.log('⚠️ Business Parameters routes not available');
    failedModules.push('Business Parameters');
  }

  // ✅ CRITICAL: Load User Activity Tracking routes
  try {
    const userActivityRoutes = await import('./user-activity.routes');
    router.use('/user-activity', userActivityRoutes.default);
    console.log('✅ User Activity Tracking routes loaded - Comprehensive monitoring system');
    loadedModules.push('User Activity Tracking');
  } catch (error) {
    console.log('⚠️ User Activity Tracking routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('User Activity Tracking');
  }

  try {
    console.log('🔄 Attempting to load R Analytics routes...');
    const rAnalyticsRoutes = await import('./r-analytics.routes');
    console.log('📦 R Analytics module loaded:', !!rAnalyticsRoutes);
    console.log('📦 R Analytics default export:', !!rAnalyticsRoutes.default);
    console.log('📦 R Analytics export type:', typeof rAnalyticsRoutes.default);

    if (rAnalyticsRoutes.default && typeof rAnalyticsRoutes.default === 'function') {
      router.use('/r-analytics', rAnalyticsRoutes.default);
      console.log('✅ R Analytics routes loaded');
      loadedModules.push('R Analytics');
    } else {
      console.error('❌ R Analytics routes: Invalid export - not a function');
      failedModules.push('R Analytics');
    }
  } catch (error) {
    console.error('❌ R Analytics routes error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    failedModules.push('R Analytics');
  }

  // ✅ CRITICAL: Individual Impairment Assessment Override routes for IFRS9 calculations
  try {
    console.log('🔄 Attempting to load Individual Impairment routes...');
    const individualImpairmentRoutes = await import('./individual-impairment.routes');
    console.log('📦 Individual Impairment module loaded:', !!individualImpairmentRoutes);
    console.log('📦 Individual Impairment default export:', !!individualImpairmentRoutes.default);
    console.log('📦 Individual Impairment export type:', typeof individualImpairmentRoutes.default);

    if (individualImpairmentRoutes.default && typeof individualImpairmentRoutes.default === 'function') {
      router.use('/ifrs9/individual-impairment', individualImpairmentRoutes.default);
      console.log('✅ Individual Impairment Assessment Override routes loaded');
      loadedModules.push('Individual Impairment');
    } else {
      console.error('❌ Individual Impairment routes: Invalid export - not a function');
      failedModules.push('Individual Impairment');
    }
  } catch (error) {
    console.error('❌ Individual Impairment routes error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    failedModules.push('Individual Impairment');
  }

  // ✅ CRITICAL: IFRS 9 Reports DS2 routes - Live database integration
  try {
    const ifrs9ReportsRoutes = await import('./ifrs9-reports.routes');
    router.use('/ifrs9/reports', ifrs9ReportsRoutes.default);
    console.log('✅ IFRS 9 Reports DS2 routes loaded - Live database integration');
    loadedModules.push('IFRS 9 Reports');
  } catch (error) {
    console.log('⚠️ IFRS 9 Reports routes not available:', error instanceof Error ? error.message : 'Unknown error');
    failedModules.push('IFRS 9 Reports');
  }

  // Check if platform admin loaded and add to loaded modules
  try {
    const platformAdminRoutes = await import('./platform-admin.routes');
    if (platformAdminRoutes.default && typeof platformAdminRoutes.default === 'function') {
      loadedModules.push('Platform Admin');
    }
  } catch (error) {
    failedModules.push('Platform Admin');
  }

  console.log('\n📊 Route Loading Summary:');
  console.log(`✅ Loaded modules (${loadedModules.length}):`, loadedModules);
  console.log(`❌ Failed modules (${failedModules.length}):`, failedModules);
}

// Load routes asynchronously
loadRouteModules().catch(error => {
  console.error('❌ Error loading route modules:', error);
});

// ✅ IMPROVED: Root endpoint with comprehensive API information
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'IFRS 9 Multi-Tenant Platform API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    
    // ✅ Available endpoints (updated to show what's actually loaded)
    endpoints: {
      authentication: '/api/v1/auth',
      user: '/api/v1/user',  // ✅ GUARANTEED TO BE AVAILABLE
      platform_admin: '/api/v1/platform/admin', // ✅ NEWLY ADDED
      approval: '/api/v1/approval',
      health: '/health',
      tenant: '/api/v1/tenant',
      audit: '/api/v1/audit',
      security: '/api/v1/security',
      workflow: '/api/v1/workflow',
      'platform-infrastructure': '/api/v1/platform-infrastructure',
      ifrs9: '/api/v1/ifrs9',
      etl: '/api/v1/etl',
      banking: '/api/v1/banking',
      r_analytics: '/api/v1/r-analytics',
      r_bridge: '/api/v1/r-bridge',
      individual_impairment: '/api/v1/ifrs9/individual-impairment'
    },

    // ✅ Service status
    service_status: {
      loaded_modules: loadedModules,
      failed_modules: failedModules,
      total_modules: loadedModules.length + failedModules.length,
      success_rate: `${Math.round((loadedModules.length / (loadedModules.length + failedModules.length)) * 100)}%`
    },

    // ✅ API capabilities
    capabilities: {
      multi_tenant: true,
      dual_banking: true,
      islamic_banking: process.env.ISLAMIC_BANKING_ENABLED === 'true',
      syariah_compliance: process.env.SYARIAH_COMPLIANCE_REQUIRED === 'true',
      approval_system: loadedModules.includes('Approval'),
      ifrs9_calculations: loadedModules.includes('IFRS9'),
      ifrs9_reports: loadedModules.includes('IFRS 9 Reports'),
      workflow_engine: loadedModules.includes('Workflow'),
      audit_trail: loadedModules.includes('Audit'),
      etl_processing: loadedModules.includes('ETL Workflow'),
      banking_parameters: loadedModules.includes('Banking Parameters'),
      user_management: true, // ✅ ALWAYS TRUE
      platform_administration: loadedModules.includes('Platform Admin'), // ✅ NEW
      react_admin_support: loadedModules.includes('Platform Admin'), // ✅ NEW
      r_analytics: loadedModules.includes('R Analytics'), // ✅ R Analytics support
      individual_impairment: loadedModules.includes('Individual Impairment') // ✅ Individual Impairment Assessment Override
    },

    // ✅ Platform information
    platform: {
      name: process.env.APP_NAME || 'IFRS9_Platform_Backend',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      tenant_tier: process.env.DEFAULT_TENANT_TIER || 'basic',
      max_connections: process.env.MAX_TENANT_CONNECTIONS || '10'
    },

    // ✅ Demo information
    demo_credentials: {
      email: 'admin@ifrspro.id',
      password: '1019181716',
      note: 'Use these credentials for platform admin access'
    },

    // ✅ NEW: React Admin information
    react_admin: {
      enabled: loadedModules.includes('Platform Admin'),
      endpoint: '/api/v1/platform/admin',
      resources: [
        'tenants',
        'platform-users', 
        'consultants',
        'infrastructure',
        'audit-logs',
        'support-tickets',
        'analytics'
      ],
      features: [
        'Multi-tenant banking institution management',
        'Platform user administration',
        'Consultant registry and project tracking',
        'Real-time infrastructure monitoring',
        'Comprehensive audit logging',
        'Support ticket management',
        'Platform analytics and reporting'
      ]
    }
  });
});

// ✅ IMPROVED: Enhanced health check endpoint  
router.get('/health', (req: Request, res: Response) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      
      // ✅ Service status based on actual loaded modules
      services: {
        api: 'online',
        authentication: 'online',
        user: 'online', // ✅ GUARANTEED
        platform_admin: loadedModules.includes('Platform Admin') ? 'online' : 'offline', // ✅ NEW
        approval: loadedModules.includes('Approval') ? 'online' : 'offline',
        tenant: loadedModules.includes('Tenant') ? 'online' : 'offline',
        audit: loadedModules.includes('Audit') ? 'online' : 'offline',
        security: loadedModules.includes('Security') ? 'online' : 'offline',
        workflow: loadedModules.includes('Workflow') ? 'online' : 'offline',
        ifrs9: loadedModules.includes('IFRS9') ? 'online' : 'offline',
        etl: loadedModules.includes('ETL Workflow') ? 'online' : 'offline',
        'banking-parameters': loadedModules.includes('Banking Parameters') ? 'online' : 'offline',
        database: 'unknown', // Could be checked if database service is available
        cache: 'unknown'
      },

      // ✅ System information
      system: {
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
          heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          external: Math.round(process.memoryUsage().external / 1024 / 1024) + 'MB'
        },
        cpu: process.cpuUsage(),
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      },

      // ✅ Configuration status
      configuration: {
        islamic_banking: process.env.ISLAMIC_BANKING_ENABLED === 'true',
        syariah_compliance: process.env.SYARIAH_COMPLIANCE_REQUIRED === 'true',
        environment: process.env.NODE_ENV,
        log_level: process.env.LOG_LEVEL,
        max_tenants: process.env.MAX_TENANT_CONNECTIONS
      },

      // ✅ API metrics
      api: {
        version: '1.0.0',
        modules_loaded: loadedModules.length + 1, // +1 for auth
        modules_failed: failedModules.length,
        endpoints_available: Object.keys(router.stack).length,
        cors_origins: process.env.CORS_ORIGINS?.split(',') || [],
        rate_limit: {
          max_requests: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
          window_minutes: Math.floor((parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')) / 60000)
        }
      },

      // ✅ NEW: React Admin status
      react_admin: {
        enabled: loadedModules.includes('Platform Admin'),
        status: loadedModules.includes('Platform Admin') ? 'operational' : 'unavailable',
        endpoint: '/api/v1/platform/admin',
        last_check: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(503).json({
      success: false,
      status: 'unhealthy', 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      services: {
        api: 'degraded'
      }
    });
  }
});

// ✅ SURGICAL FIX: Add simple fallback R Analytics Bridge route
router.use('/r-bridge', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'R Analytics Bridge API',
    version: '1.0.0',
    status: 'fallback_mode',
    description: 'Temporary fallback for R Analytics Bridge service',
    message: 'The full R Analytics Bridge service is temporarily disabled due to middleware initialization issues',
    endpoints: {
      health: 'GET /r-bridge/health - Service health check',
      calculations: 'POST /r-bridge/calculations/* - IFRS 9 calculations (currently unavailable)'
    },
    note: 'This is a temporary fallback. The full service will be restored once middleware dependencies are resolved.',
    timestamp: new Date().toISOString()
  });
});

// ✅ Service discovery endpoint (UPDATED)
router.get('/services', (req: Request, res: Response) => {
  const services = [
    {
      name: 'authentication',
      path: '/api/v1/auth',
      status: 'online',
      version: '1.0.0',
      description: 'User authentication and authorization'
    },
    {
      name: 'user',
      path: '/api/v1/user',
      status: 'online',
      version: '1.0.0',
      description: 'User management and administration'
    }
  ];

  // ✅ SURGICAL ADDITION: Add platform admin service
  if (loadedModules.includes('Platform Admin')) {
    services.push({
      name: 'platform-admin',
      path: '/api/v1/platform/admin',
      status: 'online',
      version: '1.0.0',
      description: 'Multi-tenant platform administration with React Admin support'
    });
  }

  // Add other dynamically loaded services
  if (loadedModules.includes('Approval')) {
    services.push({
      name: 'approval',
      path: '/api/v1/approval',
      status: 'online',
      version: '1.0.0',
      description: 'Four-eyes approval system'
    });
  }

  if (loadedModules.includes('Individual Impairment')) {
    services.push({
      name: 'individual-impairment',
      path: '/api/v1/ifrs9/individual-impairment',
      status: 'online',
      version: '1.0.0',
      description: 'Individual Impairment Assessment Override with DCF analysis'
    });
  }

  if (loadedModules.includes('IFRS9')) {
    services.push({
      name: 'ifrs9',
      path: '/api/v1/ifrs9',
      status: 'online',
      version: '1.0.0',
      description: 'IFRS9 calculation engine'
    });
  }

  if (loadedModules.includes('IFRS 9 Reports')) {
    services.push({
      name: 'ifrs9-reports',
      path: '/api/v1/ifrs9/reports',
      status: 'online',
      version: '1.0.0',
      description: 'IFRS 9 Reports with DS2 live database integration'
    });
  }

  if (loadedModules.includes('Workflow')) {
    services.push({
      name: 'workflow',
      path: '/api/v1/workflow',
      status: 'online',
      version: '1.0.0',
      description: 'Business process workflow engine'
    });
  }

  // Add banking services after workflow service
  if (loadedModules.includes('Banking Parameters')) {
    services.push({
      name: 'banking-parameters',
      path: '/api/v1/banking',
      status: 'online',
      version: '1.0.0',
      description: 'FRS9 banking parameter management (setup & parameters)'
    });
  }

  // Always include health service
  services.push({
    name: 'health',
    path: '/health',
    status: 'online',
    version: '1.0.0',
    description: 'System health monitoring'
  });

  res.json({
    success: true,
    data: {
      available_services: services,
      service_count: services.length,
      platform_capabilities: {
        multi_tenant: true,
        dual_banking: true,
        islamic_banking: process.env.ISLAMIC_BANKING_ENABLED === 'true',
        ifrs9_calculations: loadedModules.includes('IFRS9'),
        ifrs9_reports: loadedModules.includes('IFRS 9 Reports'),
        approval_workflows: loadedModules.includes('Approval'),
        audit_trail: loadedModules.includes('Audit'),
        etl_processing: loadedModules.includes('ETL Workflow'),
        banking_parameters: loadedModules.includes('Banking Parameters'),
        user_management: true,
        platform_administration: loadedModules.includes('Platform Admin'), // ✅ NEW
        react_admin_support: loadedModules.includes('Platform Admin'), // ✅ NEW
        individual_impairment_override: loadedModules.includes('Individual Impairment') // ✅ NEW
      },
      module_status: {
        loaded: loadedModules,
        failed: failedModules
      }
    }
  });
});

// ✅ API documentation endpoint (UPDATED)
router.get('/docs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      api_name: 'IFRS 9 Multi-Tenant Platform API',
      version: '1.0.0',
      description: 'RESTful API for IFRS 9 calculations and dual banking operations',
      documentation: {
        openapi: '3.0.0',
        base_url: '/api/v1',
        authentication: 'JWT Bearer Token',
        content_type: 'application/json'
      },
      endpoints: {
        // Core endpoints
        '/auth/login': 'POST - User authentication',
        '/auth/refresh': 'POST - Token refresh',
        '/auth/logout': 'POST - User logout',
        '/auth/me': 'GET - Current user info',
        '/auth/verify': 'GET - Token verification',

        // Menu endpoints
        '/menu/tree': 'GET - Get hierarchical menu tree',
        '/menu': 'GET - Get menu configuration',
        '/menu/breadcrumb': 'GET - Get breadcrumb navigation',
        '/menu/items': 'GET - Get menu items with filtering',
        
        // User management endpoints (GUARANTEED)
        'GET /user': 'List users with pagination',
        'POST /user': 'Create new user',
        'GET /user/:id': 'Get user by ID',
        'PUT /user/:id': 'Update user',
        '/user/:id/disable': 'POST - Disable user',
        '/user/:id/enable': 'POST - Enable user',
        '/user/health': 'GET - User service health',

        // ✅ NEW: Platform admin endpoints
        ...(loadedModules.includes('Platform Admin') && {
          '/platform/admin/tenants': 'GET/POST - Banking institutions management',
          '/platform/admin/platform-users': 'GET - Platform user management',
          '/platform/admin/consultants': 'GET/POST - Consultant registry',
          '/platform/admin/infrastructure': 'GET - Infrastructure monitoring',
          '/platform/admin/audit-logs': 'GET - Audit trail viewing',
          '/platform/admin/support-tickets': 'GET/POST - Support management',
          '/platform/admin/analytics': 'GET - Platform analytics'
        }),
        
        // Conditional endpoints based on loaded modules
        ...(loadedModules.includes('Approval') && {
          '/approval/requests': 'GET/POST - Approval requests management',
          '/approval/requests/:id/approve': 'POST - Approve request',
          '/approval/requests/:id/reject': 'POST - Reject request'
        }),
        
        ...(loadedModules.includes('IFRS9') && {
          '/ifrs9/calculate': 'POST - IFRS9 calculations',
          '/ifrs9/portfolios': 'GET/POST - Portfolio management'
        }),

        // ✅ NEW: IFRS 9 Reports endpoints with DS2 live database integration
        ...(loadedModules.includes('IFRS 9 Reports') && {
          '/ifrs9/reports/lifetime-pd/yearly': 'GET - Lifetime PD Yearly Marginal data with pivot structure',
          '/ifrs9/reports/lifetime-pd/monthly': 'GET - Lifetime PD Monthly Marginal data with pivot structure',
          '/ifrs9/reports/lifetime-lgd': 'GET - Lifetime LGD data with account details and recovery information',
          '/ifrs9/reports/ead-model': 'GET - EAD Model payment average data',
          '/ifrs9/reports/ecl-result': 'GET - ECL Result data from master account table',
          '/ifrs9/reports/ecl-movement': 'GET - ECL Movement data using stored procedures',
          '/ifrs9/reports/gca-movement': 'GET - GCA Movement data',
          '/ifrs9/reports/nominative-report': 'GET - Nominative Report with detailed account information (paginated)',
          '/ifrs9/reports/health': 'GET - DS2 FRS9PRO database connection health check',
          '/ifrs9/reports/metadata': 'GET - Available reports metadata and configuration'
        }),

        // ✅ NEW: Individual Impairment Assessment Override endpoints
        ...(loadedModules.includes('Individual Impairment') && {
          '/ifrs9/individual-impairment/watchlist': 'GET - Individual impairment watchlist with pagination and filtering',
          '/ifrs9/individual-impairment/watchlist/:accountId': 'GET - Get specific account details for impairment assessment',
          '/ifrs9/individual-impairment/assessment': 'GET - Get impairment assessment data for an account',
          '/ifrs9/individual-impairment/assessment': 'POST - Create or update impairment assessment',
          '/ifrs9/individual-impairment/assessment/:id': 'PUT - Update impairment assessment',
          '/ifrs9/individual-impairment/dcf/:accountId': 'GET - Get DCF analysis data for an account',
          '/ifrs9/individual-impairment/dcf/calculate': 'POST - Calculate DCF present value and ECL',
          '/ifrs9/individual-impairment/provision': 'GET - Get provision calculation results',
          '/ifrs9/individual-impairment/provision': 'POST - Calculate provision amounts',
          '/ifrs9/individual-impairment/trigger': 'GET - Get impairment trigger conditions',
          '/ifrs9/individual-impairment/trigger': 'POST - Update impairment trigger status',
          '/ifrs9/individual-impairment/scenario': 'GET - Get DCF scenario analysis data',
          '/ifrs9/individual-impairment/scenario': 'POST - Create scenario analysis',
          '/ifrs9/individual-impairment/scenario/:id': 'PUT - Update scenario analysis',
          '/ifrs9/individual-impairment/report': 'GET - Generate individual impairment assessment report',
          '/ifrs9/individual-impairment/health': 'GET - Individual impairment service health check'
        }),

        // Banking endpoints
        ...(loadedModules.includes('Banking Parameters') && {
          '/banking/setup/application': 'GET/POST - Application setup management',
          '/banking/setup/business': 'GET/POST - Business setup management',
          '/banking/parameters/product': 'GET/POST/PUT/DELETE - Product parameter management',
          '/banking/parameters/journal': 'GET/POST/PUT/DELETE - Journal parameter management'
        }),

        // Business Settings endpoints for B0012-B0016 cascading dropdowns
        ...(loadedModules.includes('Business Settings') && {
          '/banking/business-settings/tables': 'GET - B0012 table dropdown data',
          '/banking/business-settings/columns': 'GET - B0013 column dropdown data by table',
          '/banking/business-settings/data-type': 'GET - B0013 data type by column and table',
          '/banking/business-settings/operators': 'GET - B0014 operators by data type',
          '/banking/business-settings/conditions': 'GET - B0015 condition dropdown data',
          '/banking/business-settings/column-values': 'GET - B0016 multi-select values by column'
        }),

        // Segmentation Configuration endpoints
        ...(loadedModules.includes('Segmentation Configuration') && {
          '/banking/segmentation': 'GET/POST - Segmentation configuration management',
          '/banking/segmentation/:id': 'GET/PUT/DELETE - Segmentation CRUD operations',
          '/banking/segmentation/:id/details': 'GET/POST - Segmentation detail management',
          '/banking/segmentation/details/:detailId': 'PUT/DELETE - Segmentation detail operations'
        }),

        // Rule Base Setting endpoints
        ...(loadedModules.includes('Rule Base Setting') && {
          '/banking/rule-base-setting': 'GET/POST - Rule base setting management',
          '/banking/rule-base-setting/:id': 'GET/PUT/DELETE - Rule CRUD operations',
          '/banking/rule-base-setting/:id/details': 'GET/POST - Rule detail management',
          '/banking/rule-base-setting/details/:detailId': 'PUT/DELETE - Rule detail operations',
          '/banking/rule-base-setting/metadata/rule-types': 'GET - Rule types dropdown',
          '/banking/rule-base-setting/metadata/operators/:dataType': 'GET - Operators for data type',
          '/banking/rule-base-setting/business-settings/tables': 'GET - Business Settings tables',
          '/banking/rule-base-setting/business-settings/columns/:tableName': 'GET - Table columns',
          '/banking/rule-base-setting/business-settings/values/:tableName/:columnName': 'GET - Column values'
        }),

        // Collective Parameter endpoints (Module 3.4)
        ...(loadedModules.includes('Collective Parameter') && {
          '/banking/collective-parameter': 'GET/POST - Collective parameter management',
          '/banking/collective-parameter/:id': 'GET/PUT/DELETE - Collective parameter CRUD operations',
          '/banking/collective-parameter/:id/details': 'GET/POST - Collective parameter detail management',
          '/banking/collective-parameter/details/:detailId': 'PUT/DELETE - Collective parameter detail operations',
          '/banking/collective-parameter/:id/linkage-status': 'GET - Module linkage status (3.1-3.3)',
          '/banking/collective-parameter/:id/configuration': 'GET - Complete collective configuration',
          '/banking/collective-parameter/:id/validate': 'POST - Validate configuration',
          '/banking/collective-parameter/:id/preview-calculation': 'POST - Preview calculation impact',
          '/banking/collective-parameter/metadata/template-types': 'GET - Template types dropdown',
          '/banking/collective-parameter/metadata/calculation-methods': 'GET - Calculation methods dropdown',
          '/banking/collective-parameter/metadata/aggregation-levels': 'GET - Aggregation levels dropdown',
          '/banking/collective-parameter/metadata/parameter-types': 'GET - Parameter types dropdown',
          '/banking/collective-parameter/linked-modules/segmentation': 'GET - Available segmentation configs',
          '/banking/collective-parameter/linked-modules/rule-base-settings': 'GET - Available rule base settings',
          '/banking/collective-parameter/linked-modules/bucket-parameters': 'GET - Available bucket parameters'
        }),

        // Application parameter endpoints (Master-Detail Pattern)
        ...(loadedModules.includes('Application Parameters') && {
          '/application/headers': 'GET/POST - Application parameter headers management',
          '/application/headers/:id': 'PUT/DELETE - Update/delete application headers',
          '/application/headers/:id/details': 'GET/POST - Get/create details for header',
          '/application/details/:detailId': 'PUT/DELETE - Update/delete application details',
          '/application/health': 'GET - Application parameter service health',
          '/application/metadata': 'GET - Application parameter metadata'
        }),

        // Business parameter endpoints (Master-Detail Pattern)
        ...(loadedModules.includes('Business Parameters') && {
          '/business/headers': 'GET/POST - Business parameter headers management',
          '/business/headers/:id': 'PUT/DELETE - Update/delete business headers',
          '/business/headers/:id/details': 'GET/POST - Get/create details for header',
          '/business/details/:detailId': 'PUT/DELETE - Update/delete business details',
          '/business/health': 'GET - Business parameter service health',
          '/business/metadata': 'GET - Business parameter metadata'
        }),
        
        // System endpoints
        '/health': 'GET - System health check',
        '/services': 'GET - Service discovery',
        '/docs': 'GET - API documentation'
      },
      examples: {
        login: {
          url: 'POST /api/v1/auth/login',
          body: { 
            email: 'admin@ifrspro.id', 
            password: '1019181716'
          }
        },
        user_list: {
          url: 'GET /api/v1/user?page=1&limit=10',
          headers: {
            'Authorization': 'Bearer YOUR_JWT_TOKEN'
          }
        },
        // ✅ NEW: Platform admin examples
        ...(loadedModules.includes('Platform Admin') && {
          platform_admin_tenants: {
            url: 'GET /api/v1/platform/admin/tenants?page=1&limit=10',
            headers: {
              'Authorization': 'Bearer YOUR_PLATFORM_ADMIN_JWT_TOKEN'
            }
          }
        }),
        ...(loadedModules.includes('Approval') && {
          approval: {
            url: 'POST /api/v1/approval/requests',
            body: { 
              requestType: 'user_creation', 
              requestTitle: 'Create New User',
              tenantId: 'demo-bank'
            }
          }
        }),
        ...(loadedModules.includes('Banking Parameters') && {
          banking: {
            url: 'POST /api/v1/banking/parameters/product',
            body: {
              prd_code: 'KKB001',
              prd_desc: 'Consumer Loan',
              currency: 'IDR',
              active_flag: true
            }
          }
        })
      }
    }
  });
});

export default router;