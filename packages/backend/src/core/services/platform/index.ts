// packages/backend/src/core/services/platform/index.ts
// ============================================================================
// Platform Services Export Index
// ============================================================================
// Generated: 2025-01-12
// Purpose: Central export for all platform services
// Methodology: Core Platform MVP - Service Organization
// ============================================================================

// Advanced Administration Services
export { AdvancedAdminService } from './advanced-admin.service';
export type {
  SystemHealthCheckResult,
  ServiceHealthStatus,
  TenantHealthStatus,
  SystemMetrics,
  TenantManagementRequest,
  BackupManagementRequest,
  MaintenanceWindow
} from './advanced-admin.service';

// Database-Driven Menu System
export { DatabaseDrivenMenuService } from './database-driven-menu.service';
export type {
  MenuItem,
  MenuConfiguration,
  MenuPermissionCheck,
  MenuRenderContext,
  BreadcrumbItem
} from './database-driven-menu.service';

// Platform Admin Service
export { PlatformAdminService } from './platform-admin.service';

// Platform Service Factory
export class PlatformServiceFactory {
  static createAdvancedAdminService(
    platformAdminService: any,
    configService: any,
    auditService: any,
    rAnalyticsService: any,
    logger: any
  ) {
    return new AdvancedAdminService(
      platformAdminService,
      configService,
      auditService,
      rAnalyticsService,
      logger
    );
  }

  static createDatabaseDrivenMenuService(
    configService: any,
    tenantRegistryService: any,
    auditService: any,
    logger: any
  ) {
    return new DatabaseDrivenMenuService(
      configService,
      tenantRegistryService,
      auditService,
      logger
    );
  }

  static createPlatformAdminService() {
    return new PlatformAdminService();
  }

  static createAllPlatformServices(dependencies: {
    platformAdminService: any;
    configService: any;
    auditService: any;
    rAnalyticsService: any;
    tenantRegistryService: any;
    logger: any;
  }) {
    const {
      platformAdminService,
      configService,
      auditService,
      rAnalyticsService,
      tenantRegistryService,
      logger
    } = dependencies;

    return {
      advancedAdminService: this.createAdvancedAdminService(
        platformAdminService,
        configService,
        auditService,
        rAnalyticsService,
        logger
      ),
      databaseDrivenMenuService: this.createDatabaseDrivenMenuService(
        configService,
        tenantRegistryService,
        auditService,
        logger
      ),
      platformAdminService: this.createPlatformAdminService()
    };
  }
}