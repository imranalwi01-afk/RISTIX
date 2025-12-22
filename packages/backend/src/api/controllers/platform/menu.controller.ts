// packages/backend/src/api/controllers/platform/menu.controller.ts
// ============================================================================
// Menu System API Controller
// ============================================================================
// Generated: 2025-01-12
// Purpose: RESTful API endpoints for database-driven menu system
// Methodology: Core Platform MVP - Menu System API
// Dependencies: DatabaseDrivenMenuService, Authentication, RBAC
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { DatabaseDrivenMenuService } from '../../../core/services/platform/database-driven-menu.service';
import { TenantRegistryService } from '../../../core/services/tenant/tenant-registry.service';
import { AuditService } from '../../../core/services/audit/audit.service';
import logger from '../../../utils/logger';

export class MenuController {
  private menuService: DatabaseDrivenMenuService;
  private tenantRegistryService: TenantRegistryService;
  private auditService: AuditService;

  constructor(
    menuService: DatabaseDrivenMenuService,
    tenantRegistryService: TenantRegistryService,
    auditService: AuditService
  ) {
    this.menuService = menuService;
    this.tenantRegistryService = tenantRegistryService;
    this.auditService = auditService;
  }

  /**
   * Get menu for current user context
   * GET /api/v1/menu
   */
  async getUserMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      // Build menu render context
      const context = {
        user: {
          userId: user.id,
          userType: user.userType || 'banking_staff',
          role: user.role,
          roleCodes: user.roleCodes || [], // ✅ Add role codes for menu compatibility
          tenantId: tenant?.id,
          bankingType: tenant?.banking_type,
          permissions: user.permissions || []
        },
        platform: {
          version: process.env.APP_VERSION || '1.0.0',
          features: this.getPlatformFeatures(),
          environment: process.env.NODE_ENV || 'development'
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          banking_type: tenant.banking_type,
          features: tenant.features || []
        } : undefined
      };

      const menuConfig = await this.menuService.getMenuForContext(context);

      res.json({
        success: true,
        data: {
          menu_configuration: {
            id: menuConfig.id,
            name: menuConfig.name,
            description: menuConfig.description,
            target_audience: menuConfig.target_audience,
            banking_mode: menuConfig.banking_mode,
            version: menuConfig.version
          },
          menu_items: menuConfig.menu_items,
          context: {
            user_type: context.user.userType,
            banking_type: context.tenant?.banking_type,
            tenant_name: context.tenant?.name
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          user_id: user.id,
          tenant_id: tenant?.id
        }
      });

    } catch (error) {
      logger.error('Failed to get user menu', {
        error: (error as Error).message,
        userId: (req as any).user?.id,
        tenantId: (req as any).tenant?.id
      });
      next(error);
    }
  }

  /**
   * Get breadcrumbs for current path
   * GET /api/v1/menu/breadcrumbs?path=/banking/portfolio/accounts
   */
  async getBreadcrumbs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { path } = req.query;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      if (!path || typeof path !== 'string') {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Path parameter is required'
        });
        return;
      }

      const context = {
        user: {
          userId: user.id,
          userType: user.userType || 'banking_staff',
          role: user.role,
          roleCodes: user.roleCodes || [], // ✅ Add role codes for menu compatibility
          tenantId: tenant?.id,
          bankingType: tenant?.banking_type,
          permissions: user.permissions || []
        },
        platform: {
          version: process.env.APP_VERSION || '1.0.0',
          features: this.getPlatformFeatures(),
          environment: process.env.NODE_ENV || 'development'
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          banking_type: tenant.banking_type,
          features: tenant.features || []
        } : undefined
      };

      const breadcrumbs = await this.menuService.generateBreadcrumbs(path, context);

      res.json({
        success: true,
        data: {
          breadcrumbs,
          current_path: path
        },
        meta: {
          timestamp: new Date().toISOString(),
          user_id: user.id
        }
      });

    } catch (error) {
      logger.error('Failed to get breadcrumbs', {
        error: (error as Error).message,
        path: req.query.path
      });
      next(error);
    }
  }

  /**
   * Get all menu configurations (Admin only)
   * GET /api/v1/admin/menu/configurations
   */
  async getMenuConfigurations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      // Check admin permissions
      if (!this.hasAdminPermission(user)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required'
        });
        return;
      }

      const { page = 1, limit = 20, target_audience, banking_mode } = req.query;

      // This would typically call a service method to get paginated configurations
      // For now, we'll return a placeholder response
      res.json({
        success: true,
        data: {
          configurations: [], // Placeholder
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: 0,
            totalPages: 0
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          requested_by: user.id
        }
      });

    } catch (error) {
      logger.error('Failed to get menu configurations', {
        error: (error as Error).message,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Create or update menu configuration (Admin only)
   * POST /api/v1/admin/menu/configurations
   */
  async upsertMenuConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        });
        return;
      }

      const user = (req as any).user;
      
      if (!this.hasAdminPermission(user)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required'
        });
        return;
      }

      const menuConfigData = {
        ...req.body,
        created_by: user.id
      };

      const result = await this.menuService.upsertMenuConfiguration(menuConfigData);

      // Log audit event
      await this.auditService.logSystemEvent({
        eventType: 'MENU_CONFIGURATION_CREATED',
        description: `Menu configuration created/updated: ${result.name}`,
        userId: user.id,
        metadata: {
          menuConfigId: result.id,
          targetAudience: result.target_audience
        }
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Menu configuration saved successfully',
        meta: {
          timestamp: new Date().toISOString(),
          created_by: user.id
        }
      });

    } catch (error) {
      logger.error('Failed to upsert menu configuration', {
        error: (error as Error).message,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Get menu items for specific configuration (Admin only)
   * GET /api/v1/admin/menu/configurations/:configId/items
   */
  async getMenuItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { configId } = req.params;
      const user = (req as any).user;

      if (!this.hasAdminPermission(user)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required'
        });
        return;
      }

      const menuItems = await this.menuService.getMenuItems(configId);

      res.json({
        success: true,
        data: {
          menu_items: menuItems,
          configuration_id: configId
        },
        meta: {
          timestamp: new Date().toISOString(),
          total_items: menuItems.length
        }
      });

    } catch (error) {
      logger.error('Failed to get menu items', {
        error: (error as Error).message,
        configId: req.params.configId
      });
      next(error);
    }
  }

  /**
   * Log menu access for analytics
   * POST /api/v1/menu/access-log
   */
  async logMenuAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { menu_item_id, accessed_url, response_time } = req.body;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      // This would typically log to the menu_access_logs table
      // For now, we'll just log to application logs
      logger.info('Menu access logged', {
        userId: user.id,
        tenantId: tenant?.id,
        menuItemId: menu_item_id,
        accessedUrl: accessed_url,
        responseTime: response_time,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: 'Access logged successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to log menu access', {
        error: (error as Error).message,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  /**
   * Get menu analytics (Admin only)
   * GET /api/v1/admin/menu/analytics
   */
  async getMenuAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!this.hasAdminPermission(user)) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required'
        });
        return;
      }

      const { 
        start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date = new Date().toISOString(),
        tenant_id
      } = req.query;

      // This would typically query the menu_access_logs table for analytics
      // For now, we'll return placeholder analytics
      const analytics = {
        summary: {
          total_accesses: 1250,
          unique_users: 45,
          most_accessed_items: [
            { menu_item: 'dashboard', title: 'Dashboard', access_count: 320 },
            { menu_item: 'portfolio-accounts', title: 'Portfolio Accounts', access_count: 185 },
            { menu_item: 'ecl-calculations', title: 'ECL Calculations', access_count: 142 }
          ],
          least_accessed_items: [
            { menu_item: 'system-health', title: 'System Health', access_count: 3 },
            { menu_item: 'advanced-settings', title: 'Advanced Settings', access_count: 5 }
          ]
        },
        time_series: [
          { date: '2025-01-01', accesses: 85 },
          { date: '2025-01-02', accesses: 92 },
          { date: '2025-01-03', accesses: 78 }
        ],
        user_patterns: {
          peak_hours: ['09:00-10:00', '14:00-15:00', '16:00-17:00'],
          average_session_items: 8.5,
          bounce_rate: 0.12
        }
      };

      res.json({
        success: true,
        data: analytics,
        filters: {
          start_date,
          end_date,
          tenant_id: tenant_id || 'all'
        },
        meta: {
          timestamp: new Date().toISOString(),
          generated_by: user.id
        }
      });

    } catch (error) {
      logger.error('Failed to get menu analytics', {
        error: (error as Error).message,
        userId: (req as any).user?.id
      });
      next(error);
    }
  }

  // Helper methods

  private getPlatformFeatures(): string[] {
    return [
      'MULTI_TENANT',
      'IFRS9_CALCULATIONS',
      'DUAL_BANKING',
      'ADVANCED_ANALYTICS',
      'WORKFLOW_ENGINE',
      'AUDIT_TRAIL'
    ];
  }

  private hasAdminPermission(user: any): boolean {
    return user.role === 'platform_admin' || 
           user.role === 'super_admin' ||
           (user.permissions && user.permissions.includes('MANAGE_MENU_SYSTEM'));
  }
}

export default MenuController;