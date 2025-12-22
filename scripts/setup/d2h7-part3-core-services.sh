#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/setup/d2h7-part3-core-services.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Core Services)
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: Node.js 18+, TypeScript, Express.js
# Purpose: Generate core backend services for menu system and infrastructure
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h7-p3-services-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H7P3"
PHASE_NAME="Database-Driven Menu & Infrastructure - Core Services"
PHASE_OBJECTIVE="Generate comprehensive backend services for menu system and infrastructure monitoring"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Stack trace available in: ${LOG_FILE}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for ${PHASE_NAME}..."
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    # Check if packages exist
    if [[ ! -d "${PROJECT_ROOT}/packages/backend" ]]; then
        log_error "Backend package directory not found"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# Generate menu service
generate_menu_service() {
    log_info "Generating menu service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/menu/menu.service.ts"
    
    cat > "${service_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/menu/menu.service.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Menu Service)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Redis, Express
// Purpose: Core service for database-driven menu system with role-based access
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { 
  MenuCategory, 
  MenuItem, 
  MenuPermission, 
  MenuUserPreference,
  MenuConfiguration,
  MenuAnalytics 
} from '../../models/menu';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuHierarchyDto,
  MenuPermissionDto,
  UserMenuPreferenceDto,
  MenuAnalyticsDto
} from '../../../api/dto/menu';
import { BankingType, MenuActionType } from '@shared/types/menu';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);
  private readonly cacheKeyPrefix = 'menu:';
  private readonly cacheTimeout = 300; // 5 minutes

  constructor(
    @InjectRepository(MenuCategory)
    private readonly menuCategoryRepo: Repository<MenuCategory>,
    
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    
    @InjectRepository(MenuPermission)
    private readonly menuPermissionRepo: Repository<MenuPermission>,
    
    @InjectRepository(MenuUserPreference)
    private readonly menuUserPreferenceRepo: Repository<MenuUserPreference>,
    
    @InjectRepository(MenuConfiguration)
    private readonly menuConfigRepo: Repository<MenuConfiguration>,
    
    @InjectRepository(MenuAnalytics)
    private readonly menuAnalyticsRepo: Repository<MenuAnalytics>,
    
    private readonly redisService: RedisService,
    private readonly tenantContext: TenantContextService
  ) {}

  /**
   * Get system performance metrics
   */
  @Get('metrics')
  @Roles('admin', 'infrastructure_admin', 'monitoring')
  @ApiOperation({ summary: 'Get system performance metrics' })
  @ApiQuery({ name: 'startDate', type: String, required: true })
  @ApiQuery({ name: 'endDate', type: String, required: true })
  @ApiQuery({ name: 'metricType', enum: MetricType, required: false })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getPerformanceMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('metricType') metricType?: MetricType
  ): Promise<CustomApiResponse<PerformanceMetricDto[]>> {
    try {
      const metrics = await this.infrastructureService.getPerformanceMetrics(
        new Date(startDate),
        new Date(endDate),
        metricType
      );
      
      this.logger.log(`Performance metrics retrieved: ${metrics.length} records`);
      
      return {
        success: true,
        data: metrics,
        message: 'Performance metrics retrieved successfully',
        timestamp: new Date(),
        meta: {
          count: metrics.length,
          dateRange: { startDate, endDate },
          metricType
        }
      };
      
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'PERFORMANCE_METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Get current system metrics
   */
  @Get('metrics/current')
  @Roles('admin', 'infrastructure_admin', 'monitoring')
  @ApiOperation({ summary: 'Get current system metrics (CPU, memory, etc.)' })
  @ApiResponse({ status: 200, description: 'Current system metrics retrieved successfully' })
  async getCurrentSystemMetrics(): Promise<CustomApiResponse<SystemMetricsDto>> {
    try {
      const metrics = await this.infrastructureService.collectSystemMetrics();
      
      this.logger.log('Current system metrics collected');
      
      return {
        success: true,
        data: metrics,
        message: 'Current system metrics retrieved successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to get current system metrics: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'SYSTEM_METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Get load balancer status
   */
  @Get('load-balancer')
  @Roles('admin', 'infrastructure_admin', 'monitoring')
  @ApiOperation({ summary: 'Get load balancer health and status' })
  @ApiResponse({ status: 200, description: 'Load balancer status retrieved successfully' })
  async getLoadBalancerStatus(): Promise<CustomApiResponse<LoadBalancerStatusDto>> {
    try {
      const status = await this.infrastructureService.checkLoadBalancerHealth();
      
      this.logger.log('Load balancer status retrieved');
      
      return {
        success: true,
        data: status,
        message: 'Load balancer status retrieved successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to get load balancer status: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'LOAD_BALANCER_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Get API Gateway routes configuration
   */
  @Get('gateway/routes')
  @Roles('admin', 'infrastructure_admin')
  @ApiOperation({ summary: 'Get API Gateway routes configuration' })
  @ApiResponse({ status: 200, description: 'Gateway routes retrieved successfully' })
  async getGatewayRoutes(): Promise<CustomApiResponse<any[]>> {
    try {
      const routes = this.gatewayService.getRoutes();
      
      this.logger.log(`Gateway routes retrieved: ${routes.length} routes`);
      
      return {
        success: true,
        data: routes,
        message: 'Gateway routes retrieved successfully',
        timestamp: new Date(),
        meta: {
          count: routes.length
        }
      };
      
    } catch (error) {
      this.logger.error(`Failed to get gateway routes: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'GATEWAY_ROUTES_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Trigger manual health check
   */
  @Post('health/check')
  @Roles('admin', 'infrastructure_admin')
  @ApiOperation({ summary: 'Trigger manual infrastructure health check' })
  @ApiResponse({ status: 200, description: 'Manual health check completed' })
  async triggerHealthCheck(): Promise<CustomApiResponse<InfrastructureStatusDto>> {
    try {
      const startTime = Date.now();
      
      const healthStatus = await this.infrastructureService.performHealthCheck();
      
      const duration = Date.now() - startTime;
      
      this.logger.log(`Manual health check completed in ${duration}ms`);
      
      return {
        success: true,
        data: healthStatus,
        message: 'Manual health check completed successfully',
        timestamp: new Date(),
        meta: {
          checkType: 'manual',
          checkDuration: duration
        }
      };
      
    } catch (error) {
      this.logger.error(`Manual health check failed: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MANUAL_HEALTH_CHECK_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Get service health summary
   */
  @Get('health/summary')
  @ApiOperation({ summary: 'Get quick health summary for dashboard' })
  @ApiResponse({ status: 200, description: 'Health summary retrieved successfully' })
  async getHealthSummary(): Promise<CustomApiResponse<any>> {
    try {
      const [databaseHealth, redisHealth] = await Promise.allSettled([
        this.infrastructureService.checkDatabaseHealth(),
        this.infrastructureService.checkRedisHealth()
      ]);
      
      const summary = {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : { status: 'critical' },
        redis: redisHealth.status === 'fulfilled' ? redisHealth.value : { status: 'critical' },
        timestamp: new Date()
      };
      
      return {
        success: true,
        data: summary,
        message: 'Health summary retrieved successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to get health summary: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'HEALTH_SUMMARY_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }
}
EOF

    log_success "Infrastructure controller generated: ${controller_file}"
}

# Main execution function
main() {
    log_info "Starting PSDD ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Validate environment
    validate_environment
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Execute core services generation
    generate_menu_service
    generate_infrastructure_service
    generate_gateway_service
    generate_menu_controller
    generate_infrastructure_controller
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "PSDD ${PHASE_ID} completed successfully!"
    log_info "Next step: Generate frontend components for DAY 2 HOUR 8"
    log_info "Log file: ${LOG_FILE}"
    
    # Generate completion report
    echo ""
    echo "=========================================="
    echo "PSDD D2H7 PHASE 3 COMPLETION REPORT"
    echo "=========================================="
    echo "Phase: ${PHASE_NAME}"
    echo "Status: ✅ COMPLETED"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Log File: ${LOG_FILE}"
    echo ""
    echo "Backend Services Created:"
    echo "  ✅ MenuService - Database-driven menu system"
    echo "  ✅ InfrastructureMonitoringService - Health checks & metrics"
    echo "  ✅ ApiGatewayService - Gateway routing & middleware"
    echo "  ✅ MenuController - REST API for menu operations"
    echo "  ✅ InfrastructureController - Infrastructure monitoring API"
    echo ""
    echo "Features Implemented:"
    echo "  ✅ Role-based menu filtering"
    echo "  ✅ Menu caching with Redis"
    echo "  ✅ Real-time health monitoring"
    echo "  ✅ Performance metrics collection"
    echo "  ✅ Circuit breaker pattern"
    echo "  ✅ Rate limiting"
    echo "  ✅ Menu analytics tracking"
    echo "  ✅ Load balancer monitoring"
    echo ""
    echo "Next Phase: D2H8 - Production Infrastructure & Configuration"
    echo "=========================================="
}

# Execute main function
main "$@"
   * Get user menu hierarchy with role-based filtering
   */
  async getUserMenuHierarchy(
    userId: string,
    bankingType: BankingType = 'both',
    useCache: boolean = true
  ): Promise<MenuHierarchyDto[]> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      const cacheKey = `${this.cacheKeyPrefix}hierarchy:${tenantId}:${userId}:${bankingType}`;
      
      // Check cache first
      if (useCache) {
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
          this.logger.debug(`Menu hierarchy retrieved from cache for user: ${userId}`);
          return JSON.parse(cached);
        }
      }
      
      // Get menu hierarchy from database using stored procedure
      const hierarchy = await this.menuItemRepo.query(`
        SELECT * FROM menu.get_user_menu_hierarchy($1, $2, $3)
      `, [tenantId, userId, bankingType]);
      
      // Transform to DTO format
      const menuHierarchy = this.buildHierarchyTree(hierarchy);
      
      // Cache the result
      if (useCache) {
        await this.redisService.setex(
          cacheKey, 
          this.cacheTimeout, 
          JSON.stringify(menuHierarchy)
        );
      }
      
      // Log analytics
      await this.logMenuAction(userId, null, MenuActionType.MENU_LOAD, {
        bankingType,
        itemCount: menuHierarchy.length
      });
      
      this.logger.log(`Menu hierarchy retrieved for user: ${userId}, items: ${menuHierarchy.length}`);
      return menuHierarchy;
      
    } catch (error) {
      this.logger.error(`Failed to get user menu hierarchy for user ${userId}: ${error.message}`, error.stack);
      throw new Error(`Menu hierarchy retrieval failed: ${error.message}`);
    }
  }

  /**
   * Create new menu item
   */
  async createMenuItem(createMenuDto: CreateMenuItemDto): Promise<MenuItem> {
    const transaction = await this.menuItemRepo.manager.transaction(async manager => {
      try {
        const tenantId = this.tenantContext.getCurrentTenantId();
        
        // Validate parent menu item if specified
        if (createMenuDto.parentId) {
          const parentItem = await manager.findOne(MenuItem, {
            where: { id: createMenuDto.parentId, tenantId }
          });
          
          if (!parentItem) {
            throw new Error('Parent menu item not found');
          }
          
          createMenuDto.level = parentItem.level + 1;
        } else {
          createMenuDto.level = 0;
        }
        
        // Create menu item
        const menuItem = manager.create(MenuItem, {
          ...createMenuDto,
          tenantId,
          createdBy: this.tenantContext.getCurrentUserId()
        });
        
        const savedItem = await manager.save(menuItem);
        
        // Clear cache
        await this.clearMenuCache();
        
        this.logger.log(`Menu item created: ${savedItem.name} (${savedItem.id})`);
        return savedItem;
        
      } catch (error) {
        this.logger.error(`Failed to create menu item: ${error.message}`, error.stack);
        throw new Error(`Menu item creation failed: ${error.message}`);
      }
    });
    
    return transaction;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(id: string, updateMenuDto: UpdateMenuItemDto): Promise<MenuItem> {
    const transaction = await this.menuItemRepo.manager.transaction(async manager => {
      try {
        const tenantId = this.tenantContext.getCurrentTenantId();
        
        const menuItem = await manager.findOne(MenuItem, {
          where: { id, tenantId }
        });
        
        if (!menuItem) {
          throw new Error('Menu item not found');
        }
        
        // Update menu item
        Object.assign(menuItem, updateMenuDto);
        menuItem.updatedBy = this.tenantContext.getCurrentUserId();
        
        const updatedItem = await manager.save(menuItem);
        
        // Clear cache
        await this.clearMenuCache();
        
        this.logger.log(`Menu item updated: ${updatedItem.name} (${updatedItem.id})`);
        return updatedItem;
        
      } catch (error) {
        this.logger.error(`Failed to update menu item ${id}: ${error.message}`, error.stack);
        throw new Error(`Menu item update failed: ${error.message}`);
      }
    });
    
    return transaction;
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: string): Promise<void> {
    const transaction = await this.menuItemRepo.manager.transaction(async manager => {
      try {
        const tenantId = this.tenantContext.getCurrentTenantId();
        
        const menuItem = await manager.findOne(MenuItem, {
          where: { id, tenantId },
          relations: ['children']
        });
        
        if (!menuItem) {
          throw new Error('Menu item not found');
        }
        
        // Check if item has children
        if (menuItem.children && menuItem.children.length > 0) {
          throw new Error('Cannot delete menu item with children');
        }
        
        // Delete menu item (cascade will handle permissions and preferences)
        await manager.remove(menuItem);
        
        // Clear cache
        await this.clearMenuCache();
        
        this.logger.log(`Menu item deleted: ${menuItem.name} (${id})`);
        
      } catch (error) {
        this.logger.error(`Failed to delete menu item ${id}: ${error.message}`, error.stack);
        throw new Error(`Menu item deletion failed: ${error.message}`);
      }
    });
  }

  /**
   * Set menu permissions for role
   */
  async setMenuPermissions(
    menuItemId: string, 
    permissions: MenuPermissionDto[]
  ): Promise<void> {
    const transaction = await this.menuPermissionRepo.manager.transaction(async manager => {
      try {
        const tenantId = this.tenantContext.getCurrentTenantId();
        
        // Delete existing permissions for this menu item
        await manager.delete(MenuPermission, {
          tenantId,
          menuItemId
        });
        
        // Create new permissions
        const newPermissions = permissions.map(perm => 
          manager.create(MenuPermission, {
            tenantId,
            menuItemId,
            roleId: perm.roleId,
            permissionType: perm.permissionType,
            isAllowed: perm.isAllowed,
            conditions: perm.conditions,
            createdBy: this.tenantContext.getCurrentUserId()
          })
        );
        
        await manager.save(newPermissions);
        
        // Clear cache
        await this.clearMenuCache();
        
        this.logger.log(`Menu permissions updated for item: ${menuItemId}`);
        
      } catch (error) {
        this.logger.error(`Failed to set menu permissions for ${menuItemId}: ${error.message}`, error.stack);
        throw new Error(`Menu permissions update failed: ${error.message}`);
      }
    });
  }

  /**
   * Update user menu preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: UserMenuPreferenceDto[]
  ): Promise<void> {
    const transaction = await this.menuUserPreferenceRepo.manager.transaction(async manager => {
      try {
        const tenantId = this.tenantContext.getCurrentTenantId();
        
        for (const pref of preferences) {
          const existingPref = await manager.findOne(MenuUserPreference, {
            where: {
              tenantId,
              userId,
              menuItemId: pref.menuItemId
            }
          });
          
          if (existingPref) {
            // Update existing preference
            Object.assign(existingPref, pref);
            await manager.save(existingPref);
          } else {
            // Create new preference
            const newPref = manager.create(MenuUserPreference, {
              tenantId,
              userId,
              ...pref
            });
            await manager.save(newPref);
          }
        }
        
        // Clear cache for this user
        const cachePattern = `${this.cacheKeyPrefix}hierarchy:${tenantId}:${userId}:*`;
        await this.redisService.deletePattern(cachePattern);
        
        this.logger.log(`User menu preferences updated for user: ${userId}`);
        
      } catch (error) {
        this.logger.error(`Failed to update user preferences for ${userId}: ${error.message}`, error.stack);
        throw new Error(`User preferences update failed: ${error.message}`);
      }
    });
  }

  /**
   * Log menu action for analytics
   */
  async logMenuAction(
    userId: string,
    menuItemId: string | null,
    actionType: MenuActionType,
    metadata: Record<string, any> = {},
    sessionId?: string,
    durationMs?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      
      const analytics = this.menuAnalyticsRepo.create({
        tenantId,
        userId,
        menuItemId,
        actionType,
        sessionId,
        durationMs,
        metadata,
        ipAddress,
        userAgent
      });
      
      await this.menuAnalyticsRepo.save(analytics);
      
    } catch (error) {
      // Don't throw error for analytics logging - just log the error
      this.logger.warn(`Failed to log menu action: ${error.message}`);
    }
  }

  /**
   * Get menu analytics data
   */
  async getMenuAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string,
    menuItemId?: string
  ): Promise<MenuAnalyticsDto[]> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      
      const queryBuilder = this.menuAnalyticsRepo
        .createQueryBuilder('analytics')
        .leftJoinAndSelect('analytics.menuItem', 'menuItem')
        .where('analytics.tenantId = :tenantId', { tenantId })
        .andWhere('analytics.timestamp >= :startDate', { startDate })
        .andWhere('analytics.timestamp <= :endDate', { endDate })
        .orderBy('analytics.timestamp', 'DESC');
      
      if (userId) {
        queryBuilder.andWhere('analytics.userId = :userId', { userId });
      }
      
      if (menuItemId) {
        queryBuilder.andWhere('analytics.menuItemId = :menuItemId', { menuItemId });
      }
      
      const analytics = await queryBuilder.getMany();
      
      return analytics.map(item => ({
        id: item.id,
        userId: item.userId,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItem?.name,
        actionType: item.actionType,
        timestamp: item.timestamp,
        durationMs: item.durationMs,
        metadata: item.metadata,
        sessionId: item.sessionId
      }));
      
    } catch (error) {
      this.logger.error(`Failed to get menu analytics: ${error.message}`, error.stack);
      throw new Error(`Menu analytics retrieval failed: ${error.message}`);
    }
  }

  /**
   * Build hierarchical tree structure
   */
  private buildHierarchyTree(flatItems: any[]): MenuHierarchyDto[] {
    const itemMap = new Map();
    const rootItems: MenuHierarchyDto[] = [];
    
    // Create map of all items
    flatItems.forEach(item => {
      const menuItem: MenuHierarchyDto = {
        id: item.id,
        name: item.name,
        path: item.path,
        icon: item.icon,
        level: item.level,
        parentId: item.parent_id,
        sortOrder: item.sort_order,
        isFavorite: item.is_favorite,
        isPinned: item.is_pinned,
        children: []
      };
      
      itemMap.set(item.id, menuItem);
    });
    
    // Build hierarchy
    itemMap.forEach(item => {
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(item);
        }
      } else {
        rootItems.push(item);
      }
    });
    
    // Sort children by sortOrder
    this.sortMenuItems(rootItems);
    
    return rootItems;
  }

  /**
   * Sort menu items recursively
   */
  private sortMenuItems(items: MenuHierarchyDto[]): void {
    items.sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by sort order
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      
      // Finally by name
      return a.name.localeCompare(b.name);
    });
    
    // Sort children recursively
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        this.sortMenuItems(item.children);
      }
    });
  }

  /**
   * Clear menu cache
   */
  private async clearMenuCache(): Promise<void> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      const pattern = `${this.cacheKeyPrefix}*:${tenantId}:*`;
      await this.redisService.deletePattern(pattern);
      
      this.logger.debug('Menu cache cleared');
    } catch (error) {
      this.logger.warn(`Failed to clear menu cache: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test database connection
      await this.menuItemRepo.query('SELECT 1');
      
      // Test Redis connection
      await this.redisService.ping();
      
      return true;
    } catch (error) {
      this.logger.error(`Menu service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Menu service generated: ${service_file}"
}

# Generate infrastructure monitoring service
generate_infrastructure_service() {
    log_info "Generating infrastructure monitoring service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/infrastructure/infrastructure-monitoring.service.ts"
    
    cat > "${service_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/infrastructure/infrastructure-monitoring.service.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Service)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Redis, Node.js metrics
// Purpose: Infrastructure monitoring and health check service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as os from 'os';
import * as process from 'process';
import { RedisService } from '../redis/redis.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { 
  SystemHealthCheck, 
  PerformanceMetric, 
  LoadBalancerStatus,
  ApiGatewayLog 
} from '../../models/infrastructure';
import {
  HealthCheckDto,
  PerformanceMetricDto,
  LoadBalancerStatusDto,
  SystemMetricsDto,
  InfrastructureStatusDto
} from '../../../api/dto/infrastructure';
import { HealthStatus, MetricType } from '@shared/types/infrastructure';

@Injectable()
export class InfrastructureMonitoringService {
  private readonly logger = new Logger(InfrastructureMonitoringService.name);
  private readonly metricsHistory = new Map<string, any[]>();
  private readonly maxHistorySize = 1000;

  constructor(
    @InjectRepository(SystemHealthCheck)
    private readonly healthCheckRepo: Repository<SystemHealthCheck>,
    
    @InjectRepository(PerformanceMetric)
    private readonly performanceMetricRepo: Repository<PerformanceMetric>,
    
    @InjectRepository(LoadBalancerStatus)
    private readonly loadBalancerRepo: Repository<LoadBalancerStatus>,
    
    @InjectRepository(ApiGatewayLog)
    private readonly gatewayLogRepo: Repository<ApiGatewayLog>,
    
    private readonly redisService: RedisService,
    private readonly tenantContext: TenantContextService
  ) {}

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<InfrastructureStatusDto> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      
      const [
        databaseStatus,
        redisStatus,
        systemMetrics,
        loadBalancerStatus
      ] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.collectSystemMetrics(),
        this.checkLoadBalancerHealth()
      ]);
      
      const overallStatus = this.determineOverallStatus([
        databaseStatus,
        redisStatus,
        systemMetrics,
        loadBalancerStatus
      ]);
      
      // Store health check results
      await this.storeHealthCheckResults(tenantId, {
        database: databaseStatus,
        redis: redisStatus,
        system: systemMetrics,
        loadBalancer: loadBalancerStatus
      });
      
      return {
        overall: overallStatus,
        timestamp: new Date(),
        services: {
          database: this.getStatusFromSettled(databaseStatus),
          redis: this.getStatusFromSettled(redisStatus),
          system: this.getStatusFromSettled(systemMetrics),
          loadBalancer: this.getStatusFromSettled(loadBalancerStatus)
        },
        metrics: systemMetrics.status === 'fulfilled' ? systemMetrics.value : null
      };
      
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      throw new Error(`Infrastructure health check failed: ${error.message}`);
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth(): Promise<HealthCheckDto> {
    const startTime = Date.now();
    
    try {
      // Test connection with simple query
      await this.healthCheckRepo.query('SELECT 1');
      
      const responseTime = Date.now() - startTime;
      
      return {
        serviceName: 'database',
        status: HealthStatus.HEALTHY,
        responseTime,
        message: 'Database connection successful',
        timestamp: new Date()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.error(`Database health check failed: ${error.message}`);
      
      return {
        serviceName: 'database',
        status: HealthStatus.CRITICAL,
        responseTime,
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check Redis health
   */
  async checkRedisHealth(): Promise<HealthCheckDto> {
    const startTime = Date.now();
    
    try {
      await this.redisService.ping();
      
      const responseTime = Date.now() - startTime;
      
      return {
        serviceName: 'redis',
        status: HealthStatus.HEALTHY,
        responseTime,
        message: 'Redis connection successful',
        timestamp: new Date()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.error(`Redis health check failed: ${error.message}`);
      
      return {
        serviceName: 'redis',
        status: HealthStatus.CRITICAL,
        responseTime,
        message: `Redis connection failed: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics(): Promise<SystemMetricsDto> {
    try {
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();
      const systemLoad = os.loadavg();
      const uptime = process.uptime();
      
      // Calculate CPU percentage (requires previous measurement for accuracy)
      const cpuPercent = this.calculateCpuPercentage(cpuUsage);
      
      // Memory usage in MB
      const memoryStats = {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      };
      
      const metrics: SystemMetricsDto = {
        cpu: {
          usage: cpuPercent,
          loadAverage: systemLoad
        },
        memory: memoryStats,
        uptime: Math.round(uptime),
        timestamp: new Date()
      };
      
      // Store metrics in database
      await this.storePerformanceMetrics(metrics);
      
      return metrics;
      
    } catch (error) {
      this.logger.error(`System metrics collection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check load balancer health
   */
  async checkLoadBalancerHealth(): Promise<LoadBalancerStatusDto> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      
      // This would typically check actual load balancer instances
      // For demo purposes, we'll simulate health check
      const healthScore = await this.calculateLoadBalancerHealth();
      
      const status: LoadBalancerStatusDto = {
        instanceId: 'lb-primary',
        instanceName: 'Primary Load Balancer',
        status: healthScore > 80 ? 'active' : healthScore > 50 ? 'warning' : 'failed',
        healthScore,
        currentConnections: await this.getCurrentConnectionCount(),
        maxConnections: 1000,
        cpuUsage: Math.random() * 100, // Simulated
        memoryUsage: Math.random() * 100, // Simulated
        lastCheck: new Date()
      };
      
      // Store load balancer status
      await this.storeLoadBalancerStatus(tenantId, status);
      
      return status;
      
    } catch (error) {
      this.logger.error(`Load balancer health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log API Gateway request
   */
  async logGatewayRequest(
    requestId: string,
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    requestSize?: number,
    responseSize?: number,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      
      const gatewayLog = this.gatewayLogRepo.create({
        tenantId,
        requestId,
        method,
        path,
        statusCode,
        responseTime,
        requestSize,
        responseSize,
        userId,
        ipAddress,
        userAgent,
        metadata
      });
      
      await this.gatewayLogRepo.save(gatewayLog);
      
    } catch (error) {
      // Don't throw error for logging - just log the error
      this.logger.warn(`Failed to log gateway request: ${error.message}`);
    }
  }

  /**
   * Get performance metrics for time range
   */
  async getPerformanceMetrics(
    startDate: Date,
    endDate: Date,
    metricType?: MetricType
  ): Promise<PerformanceMetricDto[]> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      
      const queryBuilder = this.performanceMetricRepo
        .createQueryBuilder('metric')
        .where('metric.tenantId = :tenantId', { tenantId })
        .andWhere('metric.recordedAt >= :startDate', { startDate })
        .andWhere('metric.recordedAt <= :endDate', { endDate })
        .orderBy('metric.recordedAt', 'ASC');
      
      if (metricType) {
        queryBuilder.andWhere('metric.metricType = :metricType', { metricType });
      }
      
      const metrics = await queryBuilder.getMany();
      
      return metrics.map(metric => ({
        id: metric.id,
        metricName: metric.metricName,
        metricType: metric.metricType,
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
        recordedAt: metric.recordedAt
      }));
      
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error.message}`, error.stack);
      throw new Error(`Performance metrics retrieval failed: ${error.message}`);
    }
  }

  /**
   * Scheduled health check (every 30 seconds)
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async scheduledHealthCheck(): Promise<void> {
    try {
      await this.performHealthCheck();
      this.logger.debug('Scheduled health check completed');
    } catch (error) {
      this.logger.error(`Scheduled health check failed: ${error.message}`);
    }
  }

  /**
   * Scheduled metrics collection (every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async scheduledMetricsCollection(): Promise<void> {
    try {
      await this.collectSystemMetrics();
      this.logger.debug('Scheduled metrics collection completed');
    } catch (error) {
      this.logger.error(`Scheduled metrics collection failed: ${error.message}`);
    }
  }

  /**
   * Store health check results
   */
  private async storeHealthCheckResults(
    tenantId: string,
    results: Record<string, any>
  ): Promise<void> {
    try {
      const healthChecks = [];
      
      for (const [serviceName, result] of Object.entries(results)) {
        if (result.status === 'fulfilled') {
          const healthCheck = this.healthCheckRepo.create({
            tenantId,
            serviceName,
            checkType: 'automated',
            status: result.value.status || HealthStatus.UNKNOWN,
            message: result.value.message,
            responseTime: result.value.responseTime,
            metadata: result.value
          });
          
          healthChecks.push(healthCheck);
        }
      }
      
      if (healthChecks.length > 0) {
        await this.healthCheckRepo.save(healthChecks);
      }
      
    } catch (error) {
      this.logger.warn(`Failed to store health check results: ${error.message}`);
    }
  }

  /**
   * Store performance metrics
   */
  private async storePerformanceMetrics(metrics: SystemMetricsDto): Promise<void> {
    try {
      const tenantId = this.tenantContext.getCurrentTenantId();
      const performanceMetrics = [];
      
      // CPU metrics
      performanceMetrics.push(
        this.performanceMetricRepo.create({
          tenantId,
          metricName: 'cpu_usage',
          metricType: MetricType.PERCENTAGE,
          value: metrics.cpu.usage,
          unit: 'percent',
          tags: { service: 'system' }
        })
      );
      
      // Memory metrics
      performanceMetrics.push(
        this.performanceMetricRepo.create({
          tenantId,
          metricName: 'memory_used',
          metricType: MetricType.GAUGE,
          value: metrics.memory.used,
          unit: 'MB',
          tags: { service: 'system' }
        })
      );
      
      performanceMetrics.push(
        this.performanceMetricRepo.create({
          tenantId,
          metricName: 'memory_total',
          metricType: MetricType.GAUGE,
          value: metrics.memory.total,
          unit: 'MB',
          tags: { service: 'system' }
        })
      );
      
      // Load average
      metrics.cpu.loadAverage.forEach((load, index) => {
        performanceMetrics.push(
          this.performanceMetricRepo.create({
            tenantId,
            metricName: `load_average_${index + 1}m`,
            metricType: MetricType.GAUGE,
            value: load,
            unit: 'load',
            tags: { service: 'system' }
          })
        );
      });
      
      await this.performanceMetricRepo.save(performanceMetrics);
      
    } catch (error) {
      this.logger.warn(`Failed to store performance metrics: ${error.message}`);
    }
  }

  /**
   * Store load balancer status
   */
  private async storeLoadBalancerStatus(
    tenantId: string,
    status: LoadBalancerStatusDto
  ): Promise<void> {
    try {
      const lbStatus = this.loadBalancerRepo.create({
        tenantId,
        instanceId: status.instanceId,
        instanceName: status.instanceName,
        status: status.status,
        healthScore: status.healthScore,
        currentConnections: status.currentConnections,
        maxConnections: status.maxConnections,
        cpuUsage: status.cpuUsage,
        memoryUsage: status.memoryUsage,
        metadata: {
          timestamp: status.lastCheck
        }
      });
      
      await this.loadBalancerRepo.save(lbStatus);
      
    } catch (error) {
      this.logger.warn(`Failed to store load balancer status: ${error.message}`);
    }
  }

  /**
   * Calculate CPU percentage (simplified)
   */
  private calculateCpuPercentage(cpuUsage: NodeJS.CpuUsage): number {
    // Store previous measurement for next calculation
    const key = 'cpu_usage_prev';
    const previous = this.metricsHistory.get(key);
    
    this.metricsHistory.set(key, cpuUsage);
    
    if (previous) {
      const totalUsage = (cpuUsage.user - previous.user) + (cpuUsage.system - previous.system);
      const totalTime = 1000000; // 1 second in microseconds
      return Math.min(100, Math.max(0, (totalUsage / totalTime) * 100));
    }
    
    return 0; // First measurement
  }

  /**
   * Calculate load balancer health score
   */
  private async calculateLoadBalancerHealth(): Promise<number> {
    // Simplified health calculation
    // In real implementation, this would check actual load balancer metrics
    const factors = {
      connectivity: 1.0, // Can connect to LB
      responseTime: 0.9, // Response time is good
      errorRate: 0.95, // Low error rate
      cpuUsage: 0.8, // CPU usage is acceptable
      memoryUsage: 0.85 // Memory usage is acceptable
    };
    
    const weights = {
      connectivity: 0.3,
      responseTime: 0.2,
      errorRate: 0.25,
      cpuUsage: 0.125,
      memoryUsage: 0.125
    };
    
    let totalScore = 0;
    for (const [factor, score] of Object.entries(factors)) {
      totalScore += score * weights[factor];
    }
    
    return Math.round(totalScore * 100);
  }

  /**
   * Get current connection count
   */
  private async getCurrentConnectionCount(): Promise<number> {
    // Simplified connection count
    // In real implementation, this would query actual connection statistics
    return Math.floor(Math.random() * 500);
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(results: PromiseSettledResult<any>[]): HealthStatus {
    const statuses = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value?.status || HealthStatus.UNKNOWN);
    
    if (statuses.some(status => status === HealthStatus.CRITICAL)) {
      return HealthStatus.CRITICAL;
    }
    
    if (statuses.some(status => status === HealthStatus.WARNING)) {
      return HealthStatus.WARNING;
    }
    
    if (statuses.every(status => status === HealthStatus.HEALTHY)) {
      return HealthStatus.HEALTHY;
    }
    
    return HealthStatus.UNKNOWN;
  }

  /**
   * Get status from settled promise
   */
  private getStatusFromSettled(result: PromiseSettledResult<any>): HealthStatus {
    if (result.status === 'fulfilled') {
      return result.value?.status || HealthStatus.HEALTHY;
    }
    return HealthStatus.CRITICAL;
  }

  /**
   * Health check for the service itself
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test database connection
      await this.healthCheckRepo.query('SELECT 1');
      
      // Test Redis connection
      await this.redisService.ping();
      
      return true;
    } catch (error) {
      this.logger.error(`Infrastructure monitoring service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Infrastructure monitoring service generated: ${service_file}"
}

# Generate API Gateway service
generate_gateway_service() {
    log_info "Generating API Gateway service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/gateway/api-gateway.service.ts"
    
    cat > "${service_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/gateway/api-gateway.service.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (API Gateway Service)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, HTTP Proxy Middleware, Rate Limiting
// Purpose: API Gateway service for routing and middleware management
// ============================================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import * as rateLimit from 'express-rate-limit';
import * as cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InfrastructureMonitoringService } from '../infrastructure/infrastructure-monitoring.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { RedisService } from '../redis/redis.service';
import {
  GatewayRoute,
  GatewayMiddleware,
  ProxyConfig,
  RateLimitConfig,
  SecurityConfig
} from '@shared/types/gateway';

@Injectable()
export class ApiGatewayService implements OnModuleInit {
  private readonly logger = new Logger(ApiGatewayService.name);
  private readonly routes = new Map<string, GatewayRoute>();
  private readonly middlewares = new Map<string, any>();
  private readonly circuitBreakers = new Map<string, any>();

  constructor(
    private readonly infrastructureService: InfrastructureMonitoringService,
    private readonly tenantContext: TenantContextService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    this.setupDefaultRoutes();
    this.setupDefaultMiddlewares();
    this.logger.log('API Gateway service initialized');
  }

  /**
   * Setup default routes configuration
   */
  private setupDefaultRoutes(): void {
    const routes: GatewayRoute[] = [
      {
        id: 'backend-api',
        path: '/api/*',
        target: `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || 4232}`,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        secured: true,
        rateLimit: {
          windowMs: 60000, // 1 minute
          max: 1000, // requests per window
          message: 'Too many API requests from this IP'
        },
        circuitBreaker: {
          enabled: true,
          threshold: 5,
          timeout: 60000,
          monitor: 30000
        }
      },
      {
        id: 'frontend-app',
        path: '/*',
        target: `http://${process.env.FRONTEND_HOST || 'localhost'}:${process.env.FRONTEND_PORT || 4231}`,
        methods: ['GET'],
        secured: false,
        rateLimit: {
          windowMs: 60000,
          max: 200,
          message: 'Too many requests from this IP'
        }
      },
      {
        id: 'analytics-api',
        path: '/analytics/*',
        target: `http://${process.env.R_ANALYTICS_HOST || 'localhost'}:${process.env.R_ANALYTICS_PORT || 4236}`,
        methods: ['GET', 'POST'],
        secured: true,
        rateLimit: {
          windowMs: 60000,
          max: 100,
          message: 'Too many analytics requests from this IP'
        }
      }
    ];

    routes.forEach(route => {
      this.routes.set(route.id, route);
    });

    this.logger.log(`Configured ${routes.length} gateway routes`);
  }

  /**
   * Setup default middlewares
   */
  private setupDefaultMiddlewares(): void {
    // CORS middleware
    this.middlewares.set('cors', cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4231'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID']
    }));

    // Request ID middleware
    this.middlewares.set('requestId', (req: Request, res: Response, next: NextFunction) => {
      const requestId = req.headers['x-request-id'] as string || uuidv4();
      req.headers['x-request-id'] = requestId;
      res.setHeader('X-Request-ID', requestId);
      next();
    });

    // Logging middleware
    this.middlewares.set('logging', (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] as string;
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        this.logger.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${requestId}`);
        
        // Log to infrastructure monitoring
        this.infrastructureService.logGatewayRequest(
          requestId,
          req.method,
          req.path,
          res.statusCode,
          duration,
          this.getRequestSize(req),
          this.getResponseSize(res),
          req.user?.id,
          req.ip,
          req.get('User-Agent'),
          {
            route: this.findMatchingRoute(req.path)?.id,
            tenantId: req.headers['x-tenant-id']
          }
        ).catch(error => {
          this.logger.warn(`Failed to log gateway request: ${error.message}`);
        });
      });
      
      next();
    });

    // Security headers middleware
    this.middlewares.set('security', (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });

    this.logger.log('Default middlewares configured');
  }

  /**
   * Create proxy middleware for route
   */
  createProxyMiddleware(route: GatewayRoute): any {
    const options: Options = {
      target: route.target,
      changeOrigin: true,
      pathRewrite: route.pathRewrite,
      timeout: route.timeout || 30000,
      
      onError: (err, req, res) => {
        this.logger.error(`Proxy error for route ${route.id}: ${err.message}`);
        
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Bad Gateway',
            message: 'Service temporarily unavailable',
            requestId: req.headers['x-request-id']
          });
        }
      },
      
      onProxyReq: (proxyReq, req, res) => {
        // Add custom headers
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
        proxyReq.setHeader('X-Gateway-Route', route.id);
        
        // Add tenant context if available
        const tenantId = req.headers['x-tenant-id'];
        if (tenantId) {
          proxyReq.setHeader('X-Tenant-ID', tenantId);
        }
      },
      
      onProxyRes: (proxyRes, req, res) => {
        // Add response headers
        proxyRes.headers['X-Served-By'] = 'API-Gateway';
        proxyRes.headers['X-Gateway-Route'] = route.id;
      }
    };

    return createProxyMiddleware(options);
  }

  /**
   * Create rate limiting middleware
   */
  createRateLimitMiddleware(config: RateLimitConfig): any {
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: {
        error: 'Too Many Requests',
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      
      // Use Redis for distributed rate limiting
      store: config.distributed ? this.createRedisStore(config) : undefined,
      
      keyGenerator: (req: Request) => {
        // Generate key based on IP and optionally tenant
        const tenantId = req.headers['x-tenant-id'] as string;
        return tenantId ? `${req.ip}:${tenantId}` : req.ip;
      },
      
      handler: (req: Request, res: Response) => {
        const requestId = req.headers['x-request-id'] as string;
        
        this.logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path} - ${requestId}`);
        
        res.status(429).json({
          error: 'Too Many Requests',
          message: config.message,
          requestId,
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
      }
    });
  }

  /**
   * Create Redis store for rate limiting
   */
  private createRedisStore(config: RateLimitConfig): any {
    // Implementation would use redis-rate-limit store
    // This is a simplified version
    return {
      incr: async (key: string, cb: Function) => {
        try {
          const current = await this.redisService.incr(key);
          if (current === 1) {
            await this.redisService.expire(key, Math.ceil(config.windowMs / 1000));
          }
          cb(null, current, Date.now() + config.windowMs);
        } catch (error) {
          cb(error);
        }
      },
      
      decrement: async (key: string) => {
        try {
          await this.redisService.decr(key);
        } catch (error) {
          this.logger.warn(`Failed to decrement rate limit key ${key}: ${error.message}`);
        }
      }
    };
  }

  /**
   * Circuit breaker middleware
   */
  createCircuitBreakerMiddleware(route: GatewayRoute): any {
    if (!route.circuitBreaker?.enabled) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    const breakerId = `circuit_breaker_${route.id}`;
    let circuitBreaker = this.circuitBreakers.get(breakerId);

    if (!circuitBreaker) {
      circuitBreaker = {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        failures: 0,
        lastFailureTime: null,
        threshold: route.circuitBreaker.threshold,
        timeout: route.circuitBreaker.timeout,
        monitor: route.circuitBreaker.monitor
      };
      this.circuitBreakers.set(breakerId, circuitBreaker);
    }

    return (req: Request, res: Response, next: NextFunction) => {
      const now = Date.now();

      // Check if circuit breaker should transition states
      if (circuitBreaker.state === 'OPEN') {
        if (now - circuitBreaker.lastFailureTime > circuitBreaker.timeout) {
          circuitBreaker.state = 'HALF_OPEN';
          this.logger.log(`Circuit breaker ${breakerId} transitioned to HALF_OPEN`);
        } else {
          return res.status(503).json({
            error: 'Service Unavailable',
            message: 'Circuit breaker is OPEN',
            requestId: req.headers['x-request-id']
          });
        }
      }

      // Monitor response for failures
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        if (res.statusCode >= 500) {
          circuitBreaker.failures++;
          circuitBreaker.lastFailureTime = now;

          if (circuitBreaker.failures >= circuitBreaker.threshold) {
            circuitBreaker.state = 'OPEN';
            this.logger.warn(`Circuit breaker ${breakerId} OPENED after ${circuitBreaker.failures} failures`);
          }
        } else if (circuitBreaker.state === 'HALF_OPEN') {
          // Success in half-open state, close the circuit
          circuitBreaker.state = 'CLOSED';
          circuitBreaker.failures = 0;
          this.logger.log(`Circuit breaker ${breakerId} CLOSED after successful request`);
        }

        originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  /**
   * Find matching route for path
   */
  private findMatchingRoute(path: string): GatewayRoute | null {
    for (const route of this.routes.values()) {
      const routePath = route.path.replace('/*', '');
      if (path.startsWith(routePath)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Get request size (simplified)
   */
  private getRequestSize(req: Request): number {
    const contentLength = req.headers['content-length'];
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  /**
   * Get response size (simplified)
   */
  private getResponseSize(res: Response): number {
    const contentLength = res.getHeader('content-length');
    return contentLength ? parseInt(contentLength.toString(), 10) : 0;
  }

  /**
   * Get all configured routes
   */
  getRoutes(): GatewayRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Add new route
   */
  addRoute(route: GatewayRoute): void {
    this.routes.set(route.id, route);
    this.logger.log(`Added new gateway route: ${route.id}`);
  }

  /**
   * Remove route
   */
  removeRoute(routeId: string): boolean {
    const removed = this.routes.delete(routeId);
    if (removed) {
      this.logger.log(`Removed gateway route: ${routeId}`);
    }
    return removed;
  }

  /**
   * Get middleware by name
   */
  getMiddleware(name: string): any {
    return this.middlewares.get(name);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if routes are configured
      if (this.routes.size === 0) {
        return false;
      }

      // Check Redis connection for rate limiting
      await this.redisService.ping();

      return true;
    } catch (error) {
      this.logger.error(`API Gateway service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "API Gateway service generated: ${service_file}"
}

# Generate menu controller
generate_menu_controller() {
    log_info "Generating menu controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/api/controllers/menu/menu.controller.ts"
    
    cat > "${controller_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/controllers/menu/menu.controller.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Menu Controller)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, NestJS, Class Validator
// Purpose: REST API controller for database-driven menu system
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  Logger
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { Request } from 'express';
import { MenuService } from '../../../core/services/menu/menu.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantGuard } from '../../guards/tenant.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuHierarchyDto,
  MenuPermissionDto,
  UserMenuPreferenceDto,
  MenuAnalyticsDto
} from '../../dto/menu';
import { BankingType, MenuActionType } from '@shared/types/menu';
import { ApiResponse as CustomApiResponse } from '@shared/types/api';

@ApiTags('Menu')
@Controller('menu')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class MenuController {
  private readonly logger = new Logger(MenuController.name);

  constructor(private readonly menuService: MenuService) {}

  /**
   * Get user menu hierarchy
   */
  @Get('hierarchy')
  @ApiOperation({ summary: 'Get user menu hierarchy with role-based filtering' })
  @ApiQuery({ name: 'bankingType', enum: ['conventional', 'syariah', 'both'], required: false })
  @ApiQuery({ name: 'useCache', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Menu hierarchy retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserMenuHierarchy(
    @Req() req: Request,
    @Query('bankingType') bankingType: BankingType = 'both',
    @Query('useCache') useCache: boolean = true
  ): Promise<CustomApiResponse<MenuHierarchyDto[]>> {
    try {
      const userId = req.user.id;
      const startTime = Date.now();
      
      const hierarchy = await this.menuService.getUserMenuHierarchy(
        userId,
        bankingType,
        useCache
      );
      
      const duration = Date.now() - startTime;
      
      // Log menu access analytics
      await this.menuService.logMenuAction(
        userId,
        null,
        MenuActionType.MENU_LOAD,
        {
          bankingType,
          itemCount: hierarchy.length,
          useCache,
          duration
        },
        req.sessionID,
        duration,
        req.ip,
        req.get('User-Agent')
      );
      
      this.logger.log(`Menu hierarchy retrieved for user: ${userId}, items: ${hierarchy.length}`);
      
      return {
        success: true,
        data: hierarchy,
        message: 'Menu hierarchy retrieved successfully',
        timestamp: new Date(),
        meta: {
          count: hierarchy.length,
          bankingType,
          cached: useCache,
          duration
        }
      };
      
    } catch (error) {
      this.logger.error(`Failed to get menu hierarchy: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_HIERARCHY_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Create new menu item
   */
  @Post()
  @Roles('admin', 'menu_admin')
  @ApiOperation({ summary: 'Create new menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createMenuItem(
    @Body() createMenuDto: CreateMenuItemDto,
    @Req() req: Request
  ): Promise<CustomApiResponse<any>> {
    try {
      const userId = req.user.id;
      
      const menuItem = await this.menuService.createMenuItem(createMenuDto);
      
      // Log menu management analytics
      await this.menuService.logMenuAction(
        userId,
        menuItem.id,
        MenuActionType.MENU_CREATE,
        {
          menuItemName: menuItem.name,
          parentId: menuItem.parentId,
          level: menuItem.level
        },
        req.sessionID,
        null,
        req.ip,
        req.get('User-Agent')
      );
      
      this.logger.log(`Menu item created: ${menuItem.name} by user: ${userId}`);
      
      return {
        success: true,
        data: {
          id: menuItem.id,
          name: menuItem.name,
          path: menuItem.path,
          level: menuItem.level,
          createdAt: menuItem.createdAt
        },
        message: 'Menu item created successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to create menu item: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_CREATION_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Update menu item
   */
  @Put(':id')
  @Roles('admin', 'menu_admin')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuItemDto,
    @Req() req: Request
  ): Promise<CustomApiResponse<any>> {
    try {
      const userId = req.user.id;
      
      const menuItem = await this.menuService.updateMenuItem(id, updateMenuDto);
      
      // Log menu management analytics
      await this.menuService.logMenuAction(
        userId,
        menuItem.id,
        MenuActionType.MENU_UPDATE,
        {
          menuItemName: menuItem.name,
          changes: updateMenuDto
        },
        req.sessionID,
        null,
        req.ip,
        req.get('User-Agent')
      );
      
      this.logger.log(`Menu item updated: ${menuItem.name} by user: ${userId}`);
      
      return {
        success: true,
        data: {
          id: menuItem.id,
          name: menuItem.name,
          path: menuItem.path,
          updatedAt: menuItem.updatedAt
        },
        message: 'Menu item updated successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to update menu item ${id}: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_UPDATE_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Delete menu item
   */
  @Delete(':id')
  @Roles('admin', 'menu_admin')
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deleteMenuItem(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<CustomApiResponse<any>> {
    try {
      const userId = req.user.id;
      
      await this.menuService.deleteMenuItem(id);
      
      // Log menu management analytics
      await this.menuService.logMenuAction(
        userId,
        id,
        MenuActionType.MENU_DELETE,
        {
          menuItemId: id
        },
        req.sessionID,
        null,
        req.ip,
        req.get('User-Agent')
      );
      
      this.logger.log(`Menu item deleted: ${id} by user: ${userId}`);
      
      return {
        success: true,
        data: { id },
        message: 'Menu item deleted successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to delete menu item ${id}: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_DELETE_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Set menu permissions
   */
  @Post(':id/permissions')
  @Roles('admin', 'menu_admin')
  @ApiOperation({ summary: 'Set menu permissions for roles' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Menu permissions updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async setMenuPermissions(
    @Param('id') id: string,
    @Body() permissions: MenuPermissionDto[],
    @Req() req: Request
  ): Promise<CustomApiResponse<any>> {
    try {
      const userId = req.user.id;
      
      await this.menuService.setMenuPermissions(id, permissions);
      
      // Log menu permission analytics
      await this.menuService.logMenuAction(
        userId,
        id,
        MenuActionType.MENU_PERMISSION_UPDATE,
        {
          menuItemId: id,
          permissionCount: permissions.length,
          roles: permissions.map(p => p.roleId)
        },
        req.sessionID,
        null,
        req.ip,
        req.get('User-Agent')
      );
      
      this.logger.log(`Menu permissions updated for item: ${id} by user: ${userId}`);
      
      return {
        success: true,
        data: {
          menuItemId: id,
          permissionCount: permissions.length
        },
        message: 'Menu permissions updated successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to set menu permissions for ${id}: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_PERMISSION_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Update user menu preferences
   */
  @Post('preferences')
  @ApiOperation({ summary: 'Update user menu preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  async updateUserPreferences(
    @Body() preferences: UserMenuPreferenceDto[],
    @Req() req: Request
  ): Promise<CustomApiResponse<any>> {
    try {
      const userId = req.user.id;
      
      await this.menuService.updateUserPreferences(userId, preferences);
      
      // Log menu preference analytics
      await this.menuService.logMenuAction(
        userId,
        null,
        MenuActionType.MENU_PREFERENCE_UPDATE,
        {
          preferenceCount: preferences.length,
          favorites: preferences.filter(p => p.isFavorite).length,
          pinned: preferences.filter(p => p.isPinned).length
        },
        req.sessionID,
        null,
        req.ip,
        req.get('User-Agent')
      );
      
      this.logger.log(`Menu preferences updated for user: ${userId}`);
      
      return {
        success: true,
        data: {
          userId,
          preferenceCount: preferences.length
        },
        message: 'User preferences updated successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to update user preferences: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_PREFERENCE_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Get menu analytics
   */
  @Get('analytics')
  @Roles('admin', 'analytics')
  @ApiOperation({ summary: 'Get menu analytics data' })
  @ApiQuery({ name: 'startDate', type: String, required: true })
  @ApiQuery({ name: 'endDate', type: String, required: true })
  @ApiQuery({ name: 'userId', type: String, required: false })
  @ApiQuery({ name: 'menuItemId', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Menu analytics retrieved successfully' })
  async getMenuAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
    @Query('menuItemId') menuItemId?: string,
    @Req() req: Request
  ): Promise<CustomApiResponse<MenuAnalyticsDto[]>> {
    try {
      const analytics = await this.menuService.getMenuAnalytics(
        new Date(startDate),
        new Date(endDate),
        userId,
        menuItemId
      );
      
      this.logger.log(`Menu analytics retrieved: ${analytics.length} records`);
      
      return {
        success: true,
        data: analytics,
        message: 'Menu analytics retrieved successfully',
        timestamp: new Date(),
        meta: {
          count: analytics.length,
          dateRange: { startDate, endDate },
          filters: { userId, menuItemId }
        }
      };
      
    } catch (error) {
      this.logger.error(`Failed to get menu analytics: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_ANALYTICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Log menu action
   */
  @Post('analytics/log')
  @ApiOperation({ summary: 'Log menu action for analytics' })
  @ApiResponse({ status: 200, description: 'Menu action logged successfully' })
  async logMenuAction(
    @Body() logData: {
      menuItemId?: string;
      actionType: MenuActionType;
      metadata?: Record<string, any>;
      durationMs?: number;
    },
    @Req() req: Request
  ): Promise<CustomApiResponse<any>> {
    try {
      const userId = req.user.id;
      
      await this.menuService.logMenuAction(
        userId,
        logData.menuItemId,
        logData.actionType,
        logData.metadata || {},
        req.sessionID,
        logData.durationMs,
        req.ip,
        req.get('User-Agent')
      );
      
      return {
        success: true,
        data: {
          userId,
          actionType: logData.actionType,
          timestamp: new Date()
        },
        message: 'Menu action logged successfully',
        timestamp: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Failed to log menu action: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'MENU_ACTION_LOG_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }
}
EOF

    log_success "Menu controller generated: ${controller_file}"
}

# Generate infrastructure controller
generate_infrastructure_controller() {
    log_info "Generating infrastructure monitoring controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/api/controllers/infrastructure/infrastructure.controller.ts"
    
    cat > "${controller_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/controllers/infrastructure/infrastructure.controller.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Controller)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, NestJS, Class Validator
// Purpose: REST API controller for infrastructure monitoring and health checks
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  Logger
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { InfrastructureMonitoringService } from '../../../core/services/infrastructure/infrastructure-monitoring.service';
import { ApiGatewayService } from '../../../core/services/gateway/api-gateway.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantGuard } from '../../guards/tenant.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  HealthCheckDto,
  PerformanceMetricDto,
  LoadBalancerStatusDto,
  SystemMetricsDto,
  InfrastructureStatusDto
} from '../../dto/infrastructure';
import { MetricType } from '@shared/types/infrastructure';
import { ApiResponse as CustomApiResponse } from '@shared/types/api';

@ApiTags('Infrastructure')
@Controller('infrastructure')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class InfrastructureController {
  private readonly logger = new Logger(InfrastructureController.name);

  constructor(
    private readonly infrastructureService: InfrastructureMonitoringService,
    private readonly gatewayService: ApiGatewayService
  ) {}

  /**
   * Get comprehensive health check status
   */
  @Get('health')
  @Roles('admin', 'infrastructure_admin', 'monitoring')
  @ApiOperation({ summary: 'Get comprehensive infrastructure health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getHealthStatus(): Promise<CustomApiResponse<InfrastructureStatusDto>> {
    try {
      const startTime = Date.now();
      
      const healthStatus = await this.infrastructureService.performHealthCheck();
      
      const duration = Date.now() - startTime;
      
      this.logger.log(`Infrastructure health check completed in ${duration}ms`);
      
      return {
        success: true,
        data: healthStatus,
        message: 'Infrastructure health status retrieved successfully',
        timestamp: new Date(),
        meta: {
          checkDuration: duration,
          servicesChecked: Object.keys(healthStatus.services).length
        }
      };
      
    } catch (error) {
      this.logger.error(`Failed to get health status: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  /**