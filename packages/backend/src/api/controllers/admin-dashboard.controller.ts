// packages/backend/src/api/controllers/admin-dashboard.controller.ts
// ============================================================================
// Advanced Administration Dashboard Controller for IFRS9 Platform
// ============================================================================
// Generated: 2025-08-30
// Purpose: Comprehensive administration dashboard with system monitoring
// Methodology: Core Platform MVP - Advanced Administration Implementation
// Dependencies: AdvancedAdminService, DatabaseDrivenMenuService, TenantRegistryService
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { AdvancedAdminService } from '../../core/services/platform/advanced-admin.service';
import { DatabaseDrivenMenuService } from '../../core/services/platform/database-driven-menu.service';
import { TenantRegistryService } from '../../core/services/tenant/tenant-registry.service';
import { AuditService } from '../../core/services/audit/audit.service';
import winstonService from '../../core/services/logging/winston.service';

export interface AdminDashboardContext {
  userId: string;
  userType: string;
  role: string;
  permissions: string[];
  tenantId?: string;
}

export class AdminDashboardController {
  constructor(
    private readonly advancedAdminService: AdvancedAdminService,
    private readonly menuService: DatabaseDrivenMenuService,
    private readonly tenantRegistryService: TenantRegistryService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Get comprehensive system overview
   * GET /api/v1/admin/dashboard/overview
   */
  async getSystemOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const adminContext = this.extractAdminContext(req);
      
      winstonService.info('Fetching system overview', {
        userId: adminContext.userId,
        userType: adminContext.userType
      });

      // Get system health check
      const healthCheck = await this.advancedAdminService.performSystemHealthCheck();
      
      // Get system metrics
      const systemMetrics = await this.advancedAdminService.getSystemMetrics();
      
      // Get tenant overview
      const tenantOverview = this.tenantRegistryService.getRegistryStatistics();
      
      // Get recent audit activities
      const recentActivities = await this.auditService.getAuditTrail({
        filters: {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h ago
          endDate: new Date()
        },
        pagination: { limit: 20, page: 1 }
      });

      // Get banking analytics summary
      const bankingAnalytics = await this.advancedAdminService.getBankingAnalyticsSummary();

      const overview = {
        timestamp: new Date().toISOString(),
        health: healthCheck,
        metrics: systemMetrics,
        tenants: tenantOverview,
        recentActivities,
        banking: bankingAnalytics,
        alerts: await this.getSystemAlerts(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '1.0.0'
      };

      res.json({
        success: true,
        data: overview,
        meta: {
          requestId: (req as any).id,
          timestamp: new Date().toISOString(),
          userId: adminContext.userId
        }
      });

    } catch (error) {
      winstonService.error('Failed to get system overview', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Get real-time system health status
   * GET /api/v1/admin/dashboard/health
   */
  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const { includeDetails = 'true' } = req.query;
      
      winstonService.info('Performing system health check', {
        includeDetails: includeDetails === 'true'
      });

      const healthCheck = await this.advancedAdminService.performSystemHealthCheck();
      
      if (includeDetails !== 'true') {
        // Return simplified health status
        const simplifiedHealth = {
          overall: healthCheck.overall,
          services: Object.keys(healthCheck.services).reduce((acc, key) => {
            acc[key as string] = healthCheck.services[key as keyof typeof healthCheck.services].status;
            return acc;
          }, {} as Record<string, any>),
          tenantsSummary: {
            total: healthCheck.tenants.total,
            healthy: healthCheck.tenants.healthy,
            issues: healthCheck.tenants.degraded + healthCheck.tenants.critical
          }
        };
        
        return res.json({
          success: true,
          data: simplifiedHealth,
          meta: {
            timestamp: new Date().toISOString(),
            simplified: true
          }
        });
      }

      res.json({
        success: true,
        data: healthCheck,
        meta: {
          timestamp: new Date().toISOString(),
          detailed: true
        }
      });

    } catch (error) {
      winstonService.error('Health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Get system performance metrics
   * GET /api/v1/admin/dashboard/metrics
   */
  async getSystemMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeRange = '1h' } = req.query;
      
      winstonService.info('Fetching system metrics', { timeRange });

      const metrics = await this.advancedAdminService.getSystemMetrics();
      const performance = await this.advancedAdminService.getPerformanceMetrics(timeRange as string);
      const usage = await this.advancedAdminService.getResourceUsage();

      res.json({
        success: true,
        data: {
          current: metrics,
          performance,
          usage,
          timeRange
        },
        meta: {
          timestamp: new Date().toISOString(),
          timeRange
        }
      });

    } catch (error) {
      winstonService.error('Failed to get system metrics', {
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Get tenant management dashboard
   * GET /api/v1/admin/dashboard/tenants
   */
  async getTenantsOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        status = 'all', 
        bankingType = 'all', 
        sortBy = 'created_at',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      winstonService.info('Fetching tenants overview', {
        status, bankingType, sortBy, sortOrder
      });

      const filters = {
        status: status !== 'all' ? status as string : undefined,
        bankingType: bankingType !== 'all' ? bankingType as string : undefined
      };

      const tenants = await this.tenantRegistryService.getTenants({
        filters,
        sort: { field: sortBy as string, order: sortOrder as 'asc' | 'desc' },
        pagination: { page: Number(page), limit: Number(limit) }
      });

      const overview = await this.tenantRegistryService.getTenantOverview();
      const healthStatus = await this.advancedAdminService.getTenantsHealthStatus();

      res.json({
        success: true,
        data: {
          tenants: tenants.tenants,
          overview,
          healthStatus,
          pagination: tenants.pagination
        },
        meta: {
          timestamp: new Date().toISOString(),
          filters
        }
      });

    } catch (error) {
      winstonService.error('Failed to get tenants overview', {
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Manage tenant configuration
   * PUT /api/v1/admin/dashboard/tenants/:tenantId/config
   */
  async updateTenantConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { tenantId } = req.params;
      const configUpdate = req.body;
      const adminContext = this.extractAdminContext(req);

      winstonService.info('Updating tenant configuration', {
        tenantId,
        userId: adminContext.userId,
        configKeys: Object.keys(configUpdate)
      });

      const result = await this.tenantRegistryService.updateTenantConfiguration({
        tenantId,
        category: 'configuration',
        updates: configUpdate,
        updatedBy: adminContext.userId
      });

      // Audit the configuration change
      await this.auditService.logSimpleAudit({
        userId: adminContext.userId,
        action: 'TENANT_CONFIG_UPDATE',
        entityId: tenantId,
        details: {
          newValues: configUpdate,
          changedFields: Object.keys(configUpdate)
        },
        severity: 'HIGH'
      });

      res.json({
        success: true,
        data: result,
        message: 'Tenant configuration updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId,
          updatedBy: adminContext.userId
        }
      });

    } catch (error) {
      winstonService.error('Failed to update tenant configuration', {
        tenantId: req.params.tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Get platform configuration management
   * GET /api/v1/admin/dashboard/config
   */
  async getPlatformConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const { category = 'all' } = req.query;
      
      winstonService.info('Fetching platform configuration', { category });

      const configuration = await this.advancedAdminService.getPlatformConfiguration(
        category as string
      );

      res.json({
        success: true,
        data: configuration,
        meta: {
          timestamp: new Date().toISOString(),
          category
        }
      });

    } catch (error) {
      winstonService.error('Failed to get platform configuration', {
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Update platform configuration
   * PUT /api/v1/admin/dashboard/config/:configKey
   */
  async updatePlatformConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { configKey } = req.params;
      const { value, category = 'general' } = req.body;
      const adminContext = this.extractAdminContext(req);

      winstonService.info('Updating platform configuration', {
        configKey,
        category,
        userId: adminContext.userId
      });

      const result = await this.advancedAdminService.updatePlatformConfiguration({
        key: configKey,
        value,
        category,
        updatedBy: adminContext.userId
      });

      // Audit the configuration change
      await this.auditService.logSimpleAudit({
        userId: adminContext.userId,
        action: 'PLATFORM_CONFIG_UPDATE',
        entityId: configKey,
        details: {
          newValue: value,
          category
        },
        severity: 'HIGH'
      });

      res.json({
        success: true,
        data: result,
        message: 'Platform configuration updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          configKey,
          updatedBy: adminContext.userId
        }
      });

    } catch (error) {
      winstonService.error('Failed to update platform configuration', {
        configKey: req.params.configKey,
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Get audit trail and compliance reports
   * GET /api/v1/admin/dashboard/audit
   */
  async getAuditTrail(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        startDate,
        endDate,
        userId,
        action,
        entityType,
        severity = 'all',
        page = 1,
        limit = 50
      } = req.query;

      winstonService.info('Fetching audit trail', {
        startDate, endDate, userId, action, entityType, severity
      });

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        userId: userId as string,
        action: action as string,
        entityType: entityType as string,
        severity: severity !== 'all' ? severity as string : undefined
      };

      const auditData = await this.auditService.getAuditTrail({
        filters,
        pagination: { page: Number(page), limit: Number(limit) }
      });

      const summary = await this.auditService.getAuditSummary(filters);

      res.json({
        success: true,
        data: {
          auditLogs: auditData.logs,
          summary,
          pagination: auditData.pagination
        },
        meta: {
          timestamp: new Date().toISOString(),
          filters
        }
      });

    } catch (error) {
      winstonService.error('Failed to get audit trail', {
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Generate system reports
   * POST /api/v1/admin/dashboard/reports
   */
  async generateSystemReport(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const {
        reportType,
        dateRange,
        format = 'json',
        includeDetails = true,
        tenantFilter
      } = req.body;
      
      const adminContext = this.extractAdminContext(req);

      winstonService.info('Generating system report', {
        reportType,
        format,
        userId: adminContext.userId
      });

      const reportData = await this.advancedAdminService.generateSystemReport({
        type: reportType,
        dateRange,
        format,
        includeDetails,
        tenantFilter,
        generatedBy: adminContext.userId
      });

      // Audit the report generation
      await this.auditService.logSimpleAudit({
        userId: adminContext.userId,
        action: 'SYSTEM_REPORT_GENERATED',
        entityId: reportData.reportId,
        details: {
          reportType,
          format,
          dateRange
        },
        severity: 'MEDIUM'
      });

      res.json({
        success: true,
        data: reportData,
        message: 'System report generated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          reportType,
          format,
          generatedBy: adminContext.userId
        }
      });

    } catch (error) {
      winstonService.error('Failed to generate system report', {
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Get system alerts and notifications
   * GET /api/v1/admin/dashboard/alerts
   */
  async getSystemAlerts(req?: Request): Promise<any[]> {
    try {
      const alerts = await this.advancedAdminService.getSystemAlerts({
        includeResolved: req ? req.query.includeResolved === 'true' : false,
        severity: req ? req.query.severity as string : undefined
      });

      return alerts;
    } catch (error) {
      winstonService.error('Failed to get system alerts', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Acknowledge system alert
   * POST /api/v1/admin/dashboard/alerts/:alertId/acknowledge
   */
  async acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { alertId } = req.params;
      const { comment } = req.body;
      const adminContext = this.extractAdminContext(req);

      winstonService.info('Acknowledging system alert', {
        alertId,
        userId: adminContext.userId
      });

      const result = await this.advancedAdminService.acknowledgeAlert({
        alertId,
        acknowledgedBy: adminContext.userId,
        comment
      });

      res.json({
        success: true,
        data: result,
        message: 'Alert acknowledged successfully',
        meta: {
          timestamp: new Date().toISOString(),
          alertId,
          acknowledgedBy: adminContext.userId
        }
      });

    } catch (error) {
      winstonService.error('Failed to acknowledge alert', {
        alertId: req.params.alertId,
        error: error instanceof Error ? error.message : String(error)
      });
      next(error);
    }
  }

  /**
   * Extract admin context from request
   */
  private extractAdminContext(req: Request): AdminDashboardContext {
    const user = (req as any).user;
    const tenant = (req as any).tenant;

    return {
      userId: user?.id || 'system',
      userType: user?.user_type || 'admin',
      role: user?.role || 'admin',
      permissions: user?.permissions || [],
      tenantId: tenant?.id
    };
  }
}

// Validation rules for admin dashboard endpoints
export const adminDashboardValidation = {
  updateTenantConfig: [
    param('tenantId').isUUID().withMessage('Invalid tenant ID'),
    body('config').isObject().withMessage('Configuration must be an object')
  ],

  updatePlatformConfig: [
    param('configKey').isString().isLength({ min: 1 }).withMessage('Config key is required'),
    body('value').exists().withMessage('Config value is required'),
    body('category').optional().isString().withMessage('Category must be a string')
  ],

  generateReport: [
    body('reportType').isIn([
      'system_health', 'tenant_overview', 'audit_summary', 
      'performance_metrics', 'banking_analytics', 'compliance_report'
    ]).withMessage('Invalid report type'),
    body('dateRange').isObject().withMessage('Date range must be an object'),
    body('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Invalid format')
  ]
};

export default AdminDashboardController;