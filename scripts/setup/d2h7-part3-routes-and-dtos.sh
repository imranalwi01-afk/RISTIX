#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/setup/d2h7-part3-routes-and-dtos.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Routes & DTOs)
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: TypeScript, Class Validator, Express
# Purpose: Generate API routes and DTOs for menu system and infrastructure
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h7-p3-routes-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Generate menu DTOs
generate_menu_dtos() {
    log_info "Generating menu DTOs..."
    
    local dto_dir="${PROJECT_ROOT}/packages/backend/src/api/dto/menu"
    mkdir -p "${dto_dir}"
    
    # Menu hierarchy DTO
    cat > "${dto_dir}/menu-hierarchy.dto.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/dto/menu/menu-hierarchy.dto.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Menu DTOs)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Class Validator, Class Transformer
// Purpose: Data Transfer Objects for menu hierarchy and operations
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BankingType, MenuActionType, PermissionType } from '@shared/types/menu';

export class MenuHierarchyDto {
  @ApiProperty({ description: 'Menu item unique identifier' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Menu item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu item path/route' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: 'Menu item icon' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Menu item hierarchy level' })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'Parent menu item ID' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Sort order within level' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Is item marked as favorite by user' })
  @IsBoolean()
  isFavorite: boolean;

  @ApiProperty({ description: 'Is item pinned by user' })
  @IsBoolean()
  isPinned: boolean;

  @ApiProperty({ description: 'Child menu items', type: [MenuHierarchyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuHierarchyDto)
  children: MenuHierarchyDto[];
}

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Menu item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Parent menu item ID', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Menu item path/route', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: 'Menu item icon', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'React component name', required: false })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiProperty({ description: 'External URL', required: false })
  @IsString()
  @IsOptional()
  externalUrl?: string;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Menu level (auto-calculated)', required: false })
  @IsNumber()
  @IsOptional()
  level?: number;

  @ApiProperty({ description: 'Is menu item active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Is menu item visible' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean = true;

  @ApiProperty({ description: 'Is external URL' })
  @IsBoolean()
  @IsOptional()
  isExternal?: boolean = false;

  @ApiProperty({ description: 'Requires authentication' })
  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean = true;

  @ApiProperty({ 
    description: 'Banking type compatibility',
    enum: ['conventional', 'syariah', 'both']
  })
  @IsEnum(['conventional', 'syariah', 'both'])
  @IsOptional()
  bankingType?: BankingType = 'both';
}

export class UpdateMenuItemDto {
  @ApiProperty({ description: 'Menu item name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Menu item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Menu item path/route', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: 'Menu item icon', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'React component name', required: false })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiProperty({ description: 'External URL', required: false })
  @IsString()
  @IsOptional()
  externalUrl?: string;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Is menu item active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Is menu item visible', required: false })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({ description: 'Is external URL', required: false })
  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @ApiProperty({ description: 'Requires authentication', required: false })
  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean;

  @ApiProperty({ 
    description: 'Banking type compatibility',
    enum: ['conventional', 'syariah', 'both'],
    required: false
  })
  @IsEnum(['conventional', 'syariah', 'both'])
  @IsOptional()
  bankingType?: BankingType;
}

export class MenuPermissionDto {
  @ApiProperty({ description: 'Role ID' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ 
    description: 'Permission type',
    enum: ['view', 'edit', 'delete', 'admin']
  })
  @IsEnum(['view', 'edit', 'delete', 'admin'])
  permissionType: PermissionType;

  @ApiProperty({ description: 'Is permission allowed' })
  @IsBoolean()
  isAllowed: boolean;

  @ApiProperty({ description: 'Additional permission conditions', required: false })
  @IsOptional()
  conditions?: Record<string, any>;
}

export class UserMenuPreferenceDto {
  @ApiProperty({ description: 'Menu item ID' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ description: 'Is favorite', required: false })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean = false;

  @ApiProperty({ description: 'Is pinned', required: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean = false;

  @ApiProperty({ description: 'Is hidden', required: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = false;

  @ApiProperty({ description: 'Custom name', required: false })
  @IsString()
  @IsOptional()
  customName?: string;

  @ApiProperty({ description: 'Custom icon', required: false })
  @IsString()
  @IsOptional()
  customIcon?: string;

  @ApiProperty({ description: 'Custom sort order', required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Additional settings', required: false })
  @IsOptional()
  settings?: Record<string, any>;
}

export class MenuAnalyticsDto {
  @ApiProperty({ description: 'Analytics record ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Menu item ID' })
  @IsUUID()
  @IsOptional()
  menuItemId?: string;

  @ApiProperty({ description: 'Menu item name' })
  @IsString()
  @IsOptional()
  menuItemName?: string;

  @ApiProperty({ 
    description: 'Action type',
    enum: MenuActionType
  })
  @IsEnum(MenuActionType)
  actionType: MenuActionType;

  @ApiProperty({ description: 'Action timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;

  @ApiProperty({ description: 'Action duration in milliseconds', required: false })
  @IsNumber()
  @IsOptional()
  durationMs?: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Session ID', required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;
}
EOF

    log_success "Menu DTOs generated"
}

# Generate infrastructure DTOs
generate_infrastructure_dtos() {
    log_info "Generating infrastructure DTOs..."
    
    local dto_dir="${PROJECT_ROOT}/packages/backend/src/api/dto/infrastructure"
    mkdir -p "${dto_dir}"
    
    cat > "${dto_dir}/infrastructure.dto.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/dto/infrastructure/infrastructure.dto.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure DTOs)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Class Validator, Class Transformer
// Purpose: Data Transfer Objects for infrastructure monitoring and health checks
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { HealthStatus, MetricType } from '@shared/types/infrastructure';

export class HealthCheckDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  serviceName: string;

  @ApiProperty({ 
    description: 'Health status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  status: HealthStatus;

  @ApiProperty({ description: 'Response time in milliseconds' })
  @IsNumber()
  responseTime: number;

  @ApiProperty({ description: 'Health check message', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Check timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}

export class SystemMetricsDto {
  @ApiProperty({ description: 'CPU metrics' })
  @ValidateNested()
  @Type(() => CpuMetricsDto)
  cpu: CpuMetricsDto;

  @ApiProperty({ description: 'Memory metrics' })
  @ValidateNested()
  @Type(() => MemoryMetricsDto)
  memory: MemoryMetricsDto;

  @ApiProperty({ description: 'System uptime in seconds' })
  @IsNumber()
  uptime: number;

  @ApiProperty({ description: 'Metrics timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}

export class CpuMetricsDto {
  @ApiProperty({ description: 'CPU usage percentage' })
  @IsNumber()
  usage: number;

  @ApiProperty({ description: 'Load average array' })
  @IsArray()
  @IsNumber({}, { each: true })
  loadAverage: number[];
}

export class MemoryMetricsDto {
  @ApiProperty({ description: 'Used memory in MB' })
  @IsNumber()
  used: number;

  @ApiProperty({ description: 'Total memory in MB' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'External memory in MB' })
  @IsNumber()
  external: number;

  @ApiProperty({ description: 'RSS memory in MB' })
  @IsNumber()
  rss: number;
}

export class LoadBalancerStatusDto {
  @ApiProperty({ description: 'Load balancer instance ID' })
  @IsString()
  instanceId: string;

  @ApiProperty({ description: 'Load balancer instance name' })
  @IsString()
  instanceName: string;

  @ApiProperty({ 
    description: 'Instance status',
    enum: ['active', 'inactive', 'maintenance', 'failed']
  })
  @IsEnum(['active', 'inactive', 'maintenance', 'failed'])
  status: string;

  @ApiProperty({ description: 'Health score (0-100)' })
  @IsNumber()
  healthScore: number;

  @ApiProperty({ description: 'Current connection count' })
  @IsNumber()
  currentConnections: number;

  @ApiProperty({ description: 'Maximum connection limit' })
  @IsNumber()
  maxConnections: number;

  @ApiProperty({ description: 'CPU usage percentage' })
  @IsNumber()
  cpuUsage: number;

  @ApiProperty({ description: 'Memory usage percentage' })
  @IsNumber()
  memoryUsage: number;

  @ApiProperty({ description: 'Last check timestamp' })
  @Transform(({ value }) => new Date(value))
  lastCheck: Date;
}

export class PerformanceMetricDto {
  @ApiProperty({ description: 'Metric ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Metric name' })
  @IsString()
  metricName: string;

  @ApiProperty({ 
    description: 'Metric type',
    enum: ['gauge', 'counter', 'histogram', 'summary', 'percentage']
  })
  @IsEnum(['gauge', 'counter', 'histogram', 'summary', 'percentage'])
  metricType: MetricType;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Metric unit', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Metric tags', required: false })
  @IsOptional()
  tags?: Record<string, any>;

  @ApiProperty({ description: 'Recorded timestamp' })
  @Transform(({ value }) => new Date(value))
  recordedAt: Date;
}

export class InfrastructureStatusDto {
  @ApiProperty({ 
    description: 'Overall system status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  overall: HealthStatus;

  @ApiProperty({ description: 'Status check timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;

  @ApiProperty({ description: 'Individual service statuses' })
  @ValidateNested()
  @Type(() => ServiceStatusDto)
  services: ServiceStatusDto;

  @ApiProperty({ description: 'Current system metrics', required: false })
  @ValidateNested()
  @Type(() => SystemMetricsDto)
  @IsOptional()
  metrics?: SystemMetricsDto;
}

export class ServiceStatusDto {
  @ApiProperty({ 
    description: 'Database status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  database: HealthStatus;

  @ApiProperty({ 
    description: 'Redis status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  redis: HealthStatus;

  @ApiProperty({ 
    description: 'System status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  system: HealthStatus;

  @ApiProperty({ 
    description: 'Load balancer status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  loadBalancer: HealthStatus;
}
EOF

    log_success "Infrastructure DTOs generated"
}

# Generate menu routes
generate_menu_routes() {
    log_info "Generating menu routes..."
    
    local routes_file="${PROJECT_ROOT}/packages/backend/src/api/routes/menu/menu.routes.ts"
    
    cat > "${routes_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/routes/menu/menu.routes.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Menu Routes)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Express Validator
// Purpose: Express routes for database-driven menu system
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { MenuController } from '../../controllers/menu/menu.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorization.middleware';
import { validateTenant } from '../../middleware/tenant.middleware';
import { auditLog } from '../../middleware/audit.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';

const router = Router();
const menuController = new MenuController();

// Validation schemas
const createMenuItemValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('categoryId').optional().isUUID().withMessage('Valid category ID required'),
  body('parentId').optional().isUUID().withMessage('Valid parent ID required'),
  body('path').optional().isString().isLength({ max: 255 }),
  body('icon').optional().isString().isLength({ max: 50 }),
  body('component').optional().isString().isLength({ max: 100 }),
  body('externalUrl').optional().isURL().withMessage('Valid URL required'),
  body('sortOrder').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isVisible').optional().isBoolean(),
  body('isExternal').optional().isBoolean(),
  body('requiresAuth').optional().isBoolean(),
  body('bankingType').optional().isIn(['conventional', 'syariah', 'both'])
];

const updateMenuItemValidation = [
  param('id').isUUID().withMessage('Valid menu item ID required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('categoryId').optional().isUUID().withMessage('Valid category ID required'),
  body('path').optional().isString().isLength({ max: 255 }),
  body('icon').optional().isString().isLength({ max: 50 }),
  body('component').optional().isString().isLength({ max: 100 }),
  body('externalUrl').optional().isURL().withMessage('Valid URL required'),
  body('sortOrder').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isVisible').optional().isBoolean(),
  body('isExternal').optional().isBoolean(),
  body('requiresAuth').optional().isBoolean(),
  body('bankingType').optional().isIn(['conventional', 'syariah', 'both'])
];

const menuPermissionsValidation = [
  param('id').isUUID().withMessage('Valid menu item ID required'),
  body('*.roleId').isUUID().withMessage('Valid role ID required'),
  body('*.permissionType').isIn(['view', 'edit', 'delete', 'admin']),
  body('*.isAllowed').isBoolean(),
  body('*.conditions').optional().isObject()
];

const userPreferencesValidation = [
  body('*.menuItemId').isUUID().withMessage('Valid menu item ID required'),
  body('*.isFavorite').optional().isBoolean(),
  body('*.isPinned').optional().isBoolean(),
  body('*.isHidden').optional().isBoolean(),
  body('*.customName').optional().isString().isLength({ max: 100 }),
  body('*.customIcon').optional().isString().isLength({ max: 50 }),
  body('*.sortOrder').optional().isInt({ min: 0 }),
  body('*.settings').optional().isObject()
];

const menuAnalyticsValidation = [
  query('startDate').isISO8601().withMessage('Valid start date required'),
  query('endDate').isISO8601().withMessage('Valid end date required'),
  query('userId').optional().isUUID().withMessage('Valid user ID required'),
  query('menuItemId').optional().isUUID().withMessage('Valid menu item ID required')
];

const logMenuActionValidation = [
  body('menuItemId').optional().isUUID().withMessage('Valid menu item ID required'),
  body('actionType').isIn([
    'menu_load', 'menu_click', 'menu_hover', 'menu_search',
    'menu_create', 'menu_update', 'menu_delete',
    'menu_permission_update', 'menu_preference_update'
  ]).withMessage('Valid action type required'),
  body('metadata').optional().isObject(),
  body('durationMs').optional().isInt({ min: 0 })
];

// Middleware stack
const authMiddleware = [authenticate, validateTenant, rateLimitMiddleware];
const adminMiddleware = [...authMiddleware, authorize(['admin', 'menu_admin']), auditLog];

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array()
      },
      timestamp: new Date()
    });
  }
  next();
};

/**
 * GET /api/menu/hierarchy
 * Get user menu hierarchy with role-based filtering
 */
router.get('/hierarchy',
  ...authMiddleware,
  query('bankingType').optional().isIn(['conventional', 'syariah', 'both']),
  query('useCache').optional().isBoolean(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.getUserMenuHierarchy(req, res);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_HIERARCHY_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * POST /api/menu
 * Create new menu item
 */
router.post('/',
  ...adminMiddleware,
  createMenuItemValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.createMenuItem(req.body, req);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_CREATION_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * PUT /api/menu/:id
 * Update menu item
 */
router.put('/:id',
  ...adminMiddleware,
  updateMenuItemValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.updateMenuItem(req.params.id, req.body, req);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_UPDATE_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * DELETE /api/menu/:id
 * Delete menu item
 */
router.delete('/:id',
  ...adminMiddleware,
  param('id').isUUID().withMessage('Valid menu item ID required'),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.deleteMenuItem(req.params.id, req);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_DELETE_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * POST /api/menu/:id/permissions
 * Set menu permissions for roles
 */
router.post('/:id/permissions',
  ...adminMiddleware,
  menuPermissionsValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.setMenuPermissions(req.params.id, req.body, req);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_PERMISSION_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * POST /api/menu/preferences
 * Update user menu preferences
 */
router.post('/preferences',
  ...authMiddleware,
  userPreferencesValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.updateUserPreferences(req.body, req);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_PREFERENCE_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/menu/analytics
 * Get menu analytics data
 */
router.get('/analytics',
  ...authMiddleware,
  authorize(['admin', 'analytics']),
  menuAnalyticsValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.getMenuAnalytics(
        req.query.startDate as string,
        req.query.endDate as string,
        req.query.userId as string,
        req.query.menuItemId as string,
        req
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_ANALYTICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * POST /api/menu/analytics/log
 * Log menu action for analytics
 */
router.post('/analytics/log',
  ...authMiddleware,
  logMenuActionValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await menuController.logMenuAction(req.body, req);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MENU_ACTION_LOG_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

export default router;
EOF

    log_success "Menu routes generated"
}

# Generate infrastructure routes
generate_infrastructure_routes() {
    log_info "Generating infrastructure routes..."
    
    local routes_file="${PROJECT_ROOT}/packages/backend/src/api/routes/infrastructure/infrastructure.routes.ts"
    
    cat > "${routes_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/routes/infrastructure/infrastructure.routes.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Routes)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Express Validator
// Purpose: Express routes for infrastructure monitoring and health checks
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { InfrastructureController } from '../../controllers/infrastructure/infrastructure.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorization.middleware';
import { validateTenant } from '../../middleware/tenant.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';

const router = Router();
const infrastructureController = new InfrastructureController();

// Validation schemas
const metricsQueryValidation = [
  query('startDate').isISO8601().withMessage('Valid start date required'),
  query('endDate').isISO8601().withMessage('Valid end date required'),
  query('metricType').optional().isIn(['gauge', 'counter', 'histogram', 'summary', 'percentage'])
];

// Middleware stacks
const authMiddleware = [authenticate, validateTenant, rateLimitMiddleware];
const monitoringMiddleware = [...authMiddleware, authorize(['admin', 'infrastructure_admin', 'monitoring'])];
const adminMiddleware = [...authMiddleware, authorize(['admin', 'infrastructure_admin'])];

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array()
      },
      timestamp: new Date()
    });
  }
  next();
};

/**
 * GET /api/infrastructure/health
 * Get comprehensive infrastructure health status
 */
router.get('/health',
  ...monitoringMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getHealthStatus();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/health/summary
 * Get quick health summary for dashboard
 */
router.get('/health/summary',
  ...authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getHealthSummary();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_SUMMARY_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * POST /api/infrastructure/health/check
 * Trigger manual infrastructure health check
 */
router.post('/health/check',
  ...adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.triggerHealthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MANUAL_HEALTH_CHECK_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/metrics
 * Get system performance metrics
 */
router.get('/metrics',
  ...monitoringMiddleware,
  metricsQueryValidation,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getPerformanceMetrics(
        req.query.startDate as string,
        req.query.endDate as string,
        req.query.metricType as any
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/metrics/current
 * Get current system metrics
 */
router.get('/metrics/current',
  ...monitoringMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getCurrentSystemMetrics();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM_METRICS_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/load-balancer
 * Get load balancer health and status
 */
router.get('/load-balancer',
  ...monitoringMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getLoadBalancerStatus();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOAD_BALANCER_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

/**
 * GET /api/infrastructure/gateway/routes
 * Get API Gateway routes configuration
 */
router.get('/gateway/routes',
  ...adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await infrastructureController.getGatewayRoutes();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GATEWAY_ROUTES_ERROR',
          message: error.message
        },
        timestamp: new Date()
      });
    }
  }
);

export default router;
EOF

    log_success "Infrastructure routes generated"
}

# Generate shared types
generate_shared_types() {
    log_info "Generating shared types for menu and infrastructure..."
    
    # Menu types
    local menu_types_file="${PROJECT_ROOT}/packages/shared/src/types/menu/menu.types.ts"
    mkdir -p "$(dirname "${menu_types_file}")"
    
    cat > "${menu_types_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/menu/menu.types.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Shared Types)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: TypeScript
// Purpose: Shared type definitions for menu system
// ============================================================================

export type BankingType = 'conventional' | 'syariah' | 'both';

export type PermissionType = 'view' | 'edit' | 'delete' | 'admin';

export enum MenuActionType {
  MENU_LOAD = 'menu_load',
  MENU_CLICK = 'menu_click',
  MENU_HOVER = 'menu_hover',
  MENU_SEARCH = 'menu_search',
  MENU_CREATE = 'menu_create',
  MENU_UPDATE = 'menu_update',
  MENU_DELETE = 'menu_delete',
  MENU_PERMISSION_UPDATE = 'menu_permission_update',
  MENU_PREFERENCE_UPDATE = 'menu_preference_update'
}

export interface MenuItemBase {
  id: string;
  tenantId: string;
  categoryId?: string;
  parentId?: string;
  name: string;
  description?: string;
  path?: string;
  icon?: string;
  component?: string;
  externalUrl?: string;
  sortOrder: number;
  level: number;
  isActive: boolean;
  isVisible: boolean;
  isExternal: boolean;
  requiresAuth: boolean;
  bankingType: BankingType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface MenuHierarchy extends MenuItemBase {
  children: MenuHierarchy[];
  isFavorite?: boolean;
  isPinned?: boolean;
  isHidden?: boolean;
}

export interface MenuPermission {
  id: string;
  tenantId: string;
  menuItemId: string;
  roleId: string;
  permissionType: PermissionType;
  isAllowed: boolean;
  conditions?: Record<string, any>;
  createdAt: Date;
  createdBy: string;
}

export interface MenuUserPreference {
  id: string;
  tenantId: string;
  userId: string;
  menuItemId: string;
  isFavorite: boolean;
  isPinned: boolean;
  isHidden: boolean;
  customName?: string;
  customIcon?: string;
  sortOrder: number;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuAnalytics {
  id: string;
  tenantId: string;
  userId: string;
  menuItemId?: string;
  sessionId?: string;
  actionType: MenuActionType;
  timestamp: Date;
  durationMs?: number;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
EOF

    # Infrastructure types
    local infra_types_file="${PROJECT_ROOT}/packages/shared/src/types/infrastructure/infrastructure.types.ts"
    mkdir -p "$(dirname "${infra_types_file}")"
    
    cat > "${infra_types_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/infrastructure/infrastructure.types.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Types)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: TypeScript
// Purpose: Shared type definitions for infrastructure monitoring
// ============================================================================

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

export enum MetricType {
  GAUGE = 'gauge',
  COUNTER = 'counter',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
  PERCENTAGE = 'percentage'
}

export interface SystemHealthCheck {
  id: string;
  tenantId: string;
  serviceName: string;
  checkType: string;
  status: HealthStatus;
  message?: string;
  responseTime?: number;
  metadata?: Record<string, any>;
  checkedAt: Date;
}

export interface PerformanceMetric {
  id: string;
  tenantId: string;
  metricName: string;
  metricType: MetricType;
  value: number;
  unit?: string;
  tags?: Record<string, any>;
  recordedAt: Date;
}

export interface LoadBalancerStatus {
  id: string;
  tenantId: string;
  instanceId: string;
  instanceName?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'failed';
  healthScore: number;
  currentConnections: number;
  maxConnections: number;
  cpuUsage?: number;
  memoryUsage?: number;
  lastCheck: Date;
  metadata?: Record<string, any>;
}

export interface ApiGatewayLog {
  id: string;
  tenantId: string;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface InfrastructureStatus {
  overall: HealthStatus;
  timestamp: Date;
  services: {
    database: HealthStatus;
    redis: HealthStatus;
    system: HealthStatus;
    loadBalancer: HealthStatus;
  };
  metrics?: SystemMetrics;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    external: number;
    rss: number;
  };
  uptime: number;
  timestamp: Date;
}
EOF

    # Gateway types
    local gateway_types_file="${PROJECT_ROOT}/packages/shared/src/types/gateway/gateway.types.ts"
    mkdir -p "$(dirname "${gateway_types_file}")"
    
    cat > "${gateway_types_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/gateway/gateway.types.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Gateway Types)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: TypeScript
// Purpose: Shared type definitions for API Gateway
// ============================================================================

export interface GatewayRoute {
  id: string;
  path: string;
  target: string;
  methods: string[];
  secured: boolean;
  timeout?: number;
  pathRewrite?: Record<string, string>;
  rateLimit?: RateLimitConfig;
  circuitBreaker?: CircuitBreakerConfig;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  distributed?: boolean;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  threshold: number;
  timeout: number;
  monitor: number;
}

export interface ProxyConfig {
  target: string;
  changeOrigin: boolean;
  timeout: number;
  pathRewrite?: Record<string, string>;
}

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    headers: string[];
  };
  rateLimit: RateLimitConfig;
  headers: {
    contentSecurityPolicy: boolean;
    frameOptions: string;
    xssProtection: boolean;
    strictTransportSecurity: boolean;
  };
}

export interface GatewayMiddleware {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}
EOF

    log_success "Shared types generated"
}

# Main execution
log_info "Generating API routes and DTOs for menu system and infrastructure..."

generate_menu_dtos
generate_infrastructure_dtos
generate_menu_routes
generate_infrastructure_routes
generate_shared_types

log_success "All routes and DTOs generated successfully!"

echo ""
echo "=========================================="
echo "PSDD D2H7 ROUTES & DTOS COMPLETION REPORT"
echo "=========================================="
echo "Generated Components:"
echo "  ✅ Menu DTOs - Validation and data transfer objects"
echo "  ✅ Infrastructure DTOs - Health check and metrics DTOs"
echo "  ✅ Menu Routes - Express routes with validation"
echo "  ✅ Infrastructure Routes - Monitoring API routes"
echo "  ✅ Shared Types - TypeScript type definitions"
echo ""
echo "API Endpoints Available:"
echo "  📡 GET /api/menu/hierarchy - User menu hierarchy"
echo "  📡 POST /api/menu - Create menu item"
echo "  📡 PUT /api/menu/:id - Update menu item"
echo "  📡 DELETE /api/menu/:id - Delete menu item"
echo "  📡 POST /api/menu/:id/permissions - Set permissions"
echo "  📡 POST /api/menu/preferences - Update user preferences"
echo "  📡 GET /api/menu/analytics - Get analytics data"
echo "  📡 GET /api/infrastructure/health - Health status"
echo "  📡 GET /api/infrastructure/metrics - Performance metrics"
echo "  📡 GET /api/infrastructure/load-balancer - LB status"
echo "  📡 GET /api/infrastructure/gateway/routes - Gateway routes"
echo "=========================================="