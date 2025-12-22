// packages/backend/src/api/routes/admin-dashboard.routes.ts
// ============================================================================
// Advanced Administration Dashboard Routes for IFRS9 Platform
// ============================================================================
// Generated: 2025-08-30
// Purpose: RESTful routes for comprehensive system administration
// Methodology: Core Platform MVP - Advanced Administration Implementation
// Dependencies: AdminDashboardController, authentication, authorization
// ============================================================================

import { Router } from 'express';
import { AdminDashboardController, adminDashboardValidation } from '../controllers/admin-dashboard.controller';
import { AdvancedAdminService } from '../../core/services/platform/advanced-admin.service';
import { DatabaseDrivenMenuService } from '../../core/services/platform/database-driven-menu.service';
import { TenantRegistryService } from '../../core/services/tenant/tenant-registry.service';
import { AuditService } from '../../core/services/audit/audit.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { logger } from '../../core/services/logging/winston.service';

const router = Router();

// Initialize services
const advancedAdminService = new AdvancedAdminService();
const databaseDrivenMenuService = new DatabaseDrivenMenuService(
  null, // ConfigurationService will be injected
  null, // TenantRegistryService will be injected
  null, // AuditService will be injected
  logger
);
const tenantRegistryService = TenantRegistryService.getInstance();
const auditService = new AuditService();

// Initialize controller
const adminDashboardController = new AdminDashboardController(
  advancedAdminService,
  databaseDrivenMenuService,
  tenantRegistryService,
  auditService
);

// Apply middleware to all admin routes
router.use(authMiddleware);
router.use(adminAuthMiddleware); // Ensures only admin users can access
router.use(rateLimitMiddleware({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute for admin operations
  message: 'Too many admin requests from this IP'
}));

// ============================================================================
// SYSTEM OVERVIEW ROUTES
// ============================================================================

/**
 * @route GET /api/v1/admin/dashboard/overview
 * @desc Get comprehensive system overview
 * @access Admin
 * @scope system:read
 */
router.get('/overview', (req, res, next) => {
  adminDashboardController.getSystemOverview(req, res, next);
});

/**
 * @route GET /api/v1/admin/dashboard/health
 * @desc Get real-time system health status
 * @access Admin
 * @scope system:health:read
 */
router.get('/health', (req, res, next) => {
  adminDashboardController.getSystemHealth(req, res, next);
});

/**
 * @route GET /api/v1/admin/dashboard/metrics
 * @desc Get system performance metrics
 * @access Admin
 * @scope system:metrics:read
 */
router.get('/metrics', (req, res, next) => {
  adminDashboardController.getSystemMetrics(req, res, next);
});

// ============================================================================
// TENANT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /api/v1/admin/dashboard/tenants
 * @desc Get tenants overview with filtering
 * @access Admin
 * @scope tenant:read
 */
router.get('/tenants', (req, res, next) => {
  adminDashboardController.getTenantsOverview(req, res, next);
});

/**
 * @route PUT /api/v1/admin/dashboard/tenants/:tenantId/config
 * @desc Update tenant configuration
 * @access Admin
 * @scope tenant:config:write
 */
router.put('/tenants/:tenantId/config', 
  adminDashboardValidation.updateTenantConfig,
  (req, res, next) => {
    adminDashboardController.updateTenantConfiguration(req, res, next);
  }
);

/**
 * @route GET /api/v1/admin/dashboard/tenants/:tenantId/health
 * @desc Get specific tenant health status
 * @access Admin
 * @scope tenant:health:read
 */
router.get('/tenants/:tenantId/health', async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const tenantHealth = await advancedAdminService.getTenantHealthStatus(tenantId);
    
    res.json({
      success: true,
      data: tenantHealth,
      meta: {
        tenantId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get tenant health status', {
      tenantId: req.params.tenantId,
      error: error.message
    });
    next(error);
  }
});

/**
 * @route POST /api/v1/admin/dashboard/tenants/:tenantId/restart
 * @desc Restart tenant services (emergency operation)
 * @access Admin
 * @scope tenant:restart
 */
router.post('/tenants/:tenantId/restart', async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const adminContext = {
      userId: (req as any).user?.id || 'system',
      reason: req.body.reason || 'Manual restart'
    };
    
    logger.warn('Tenant restart initiated', { tenantId, ...adminContext });
    
    const result = await tenantRegistryService.restartTenantServices(tenantId, adminContext);
    
    // Audit the restart operation
    await auditService.log({
      userId: adminContext.userId,
      action: 'TENANT_RESTART',
      entityType: 'tenant',
      entityId: tenantId,
      details: { reason: adminContext.reason },
      severity: 'CRITICAL'
    });

    res.json({
      success: true,
      data: result,
      message: 'Tenant services restart initiated',
      meta: {
        tenantId,
        timestamp: new Date().toISOString(),
        initiatedBy: adminContext.userId
      }
    });
  } catch (error) {
    logger.error('Failed to restart tenant services', {
      tenantId: req.params.tenantId,
      error: error.message
    });
    next(error);
  }
});

// ============================================================================
// CONFIGURATION MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /api/v1/admin/dashboard/config
 * @desc Get platform configuration
 * @access Admin
 * @scope config:read
 */
router.get('/config', (req, res, next) => {
  adminDashboardController.getPlatformConfiguration(req, res, next);
});

/**
 * @route PUT /api/v1/admin/dashboard/config/:configKey
 * @desc Update platform configuration
 * @access Admin
 * @scope config:write
 */
router.put('/config/:configKey',
  adminDashboardValidation.updatePlatformConfig,
  (req, res, next) => {
    adminDashboardController.updatePlatformConfiguration(req, res, next);
  }
);

/**
 * @route POST /api/v1/admin/dashboard/config/backup
 * @desc Create configuration backup
 * @access Admin
 * @scope config:backup
 */
router.post('/config/backup', async (req, res, next) => {
  try {
    const adminContext = {
      userId: (req as any).user?.id || 'system',
      description: req.body.description || 'Manual backup'
    };
    
    const backup = await advancedAdminService.createConfigurationBackup(adminContext);
    
    res.json({
      success: true,
      data: backup,
      message: 'Configuration backup created successfully',
      meta: {
        timestamp: new Date().toISOString(),
        createdBy: adminContext.userId
      }
    });
  } catch (error) {
    logger.error('Failed to create configuration backup', {
      error: error.message
    });
    next(error);
  }
});

/**
 * @route POST /api/v1/admin/dashboard/config/restore/:backupId
 * @desc Restore configuration from backup
 * @access Admin
 * @scope config:restore
 */
router.post('/config/restore/:backupId', async (req, res, next) => {
  try {
    const { backupId } = req.params;
    const adminContext = {
      userId: (req as any).user?.id || 'system',
      reason: req.body.reason || 'Manual restore'
    };
    
    logger.warn('Configuration restore initiated', { backupId, ...adminContext });
    
    const result = await advancedAdminService.restoreConfigurationBackup(backupId, adminContext);
    
    // Audit the restore operation
    await auditService.log({
      userId: adminContext.userId,
      action: 'CONFIG_RESTORE',
      entityType: 'configuration',
      entityId: backupId,
      details: { reason: adminContext.reason },
      severity: 'CRITICAL'
    });

    res.json({
      success: true,
      data: result,
      message: 'Configuration restored successfully',
      meta: {
        backupId,
        timestamp: new Date().toISOString(),
        restoredBy: adminContext.userId
      }
    });
  } catch (error) {
    logger.error('Failed to restore configuration', {
      backupId: req.params.backupId,
      error: error.message
    });
    next(error);
  }
});

// ============================================================================
// AUDIT AND COMPLIANCE ROUTES
// ============================================================================

/**
 * @route GET /api/v1/admin/dashboard/audit
 * @desc Get audit trail and compliance data
 * @access Admin
 * @scope audit:read
 */
router.get('/audit', (req, res, next) => {
  adminDashboardController.getAuditTrail(req, res, next);
});

/**
 * @route POST /api/v1/admin/dashboard/reports
 * @desc Generate system reports
 * @access Admin
 * @scope reports:generate
 */
router.post('/reports',
  adminDashboardValidation.generateReport,
  (req, res, next) => {
    adminDashboardController.generateSystemReport(req, res, next);
  }
);

/**
 * @route GET /api/v1/admin/dashboard/reports/:reportId
 * @desc Download generated report
 * @access Admin
 * @scope reports:download
 */
router.get('/reports/:reportId', async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const report = await advancedAdminService.getGeneratedReport(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'REPORT_NOT_FOUND',
        message: 'Generated report not found'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', report.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    
    if (report.format === 'json') {
      res.json(report.data);
    } else {
      res.send(report.data);
    }
  } catch (error) {
    logger.error('Failed to download report', {
      reportId: req.params.reportId,
      error: error.message
    });
    next(error);
  }
});

// ============================================================================
// ALERTS AND NOTIFICATIONS ROUTES
// ============================================================================

/**
 * @route GET /api/v1/admin/dashboard/alerts
 * @desc Get system alerts and notifications
 * @access Admin
 * @scope alerts:read
 */
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = await adminDashboardController.getSystemAlerts(req);
    
    res.json({
      success: true,
      data: alerts,
      meta: {
        timestamp: new Date().toISOString(),
        count: alerts.length
      }
    });
  } catch (error) {
    logger.error('Failed to get system alerts', {
      error: error.message
    });
    next(error);
  }
});

/**
 * @route POST /api/v1/admin/dashboard/alerts/:alertId/acknowledge
 * @desc Acknowledge system alert
 * @access Admin
 * @scope alerts:acknowledge
 */
router.post('/alerts/:alertId/acknowledge', (req, res, next) => {
  adminDashboardController.acknowledgeAlert(req, res, next);
});

/**
 * @route DELETE /api/v1/admin/dashboard/alerts/:alertId
 * @desc Dismiss system alert
 * @access Admin
 * @scope alerts:dismiss
 */
router.delete('/alerts/:alertId', async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const adminContext = {
      userId: (req as any).user?.id || 'system'
    };
    
    const result = await advancedAdminService.dismissAlert(alertId, adminContext.userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Alert dismissed successfully',
      meta: {
        alertId,
        timestamp: new Date().toISOString(),
        dismissedBy: adminContext.userId
      }
    });
  } catch (error) {
    logger.error('Failed to dismiss alert', {
      alertId: req.params.alertId,
      error: error.message
    });
    next(error);
  }
});

// ============================================================================
// MAINTENANCE AND UTILITIES ROUTES
// ============================================================================

/**
 * @route POST /api/v1/admin/dashboard/maintenance/cache/clear
 * @desc Clear system cache
 * @access Admin
 * @scope maintenance:cache
 */
router.post('/maintenance/cache/clear', async (req, res, next) => {
  try {
    const { cacheType = 'all' } = req.body;
    const adminContext = {
      userId: (req as any).user?.id || 'system'
    };
    
    logger.info('Cache clear initiated', { cacheType, ...adminContext });
    
    const result = await advancedAdminService.clearSystemCache(cacheType, adminContext.userId);
    
    res.json({
      success: true,
      data: result,
      message: 'System cache cleared successfully',
      meta: {
        cacheType,
        timestamp: new Date().toISOString(),
        clearedBy: adminContext.userId
      }
    });
  } catch (error) {
    logger.error('Failed to clear system cache', {
      error: error.message
    });
    next(error);
  }
});

/**
 * @route POST /api/v1/admin/dashboard/maintenance/db/optimize
 * @desc Optimize database performance
 * @access Admin
 * @scope maintenance:database
 */
router.post('/maintenance/db/optimize', async (req, res, next) => {
  try {
    const adminContext = {
      userId: (req as any).user?.id || 'system'
    };
    
    logger.info('Database optimization initiated', adminContext);
    
    const result = await advancedAdminService.optimizeDatabase(adminContext.userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Database optimization completed',
      meta: {
        timestamp: new Date().toISOString(),
        initiatedBy: adminContext.userId
      }
    });
  } catch (error) {
    logger.error('Failed to optimize database', {
      error: error.message
    });
    next(error);
  }
});

export default router;