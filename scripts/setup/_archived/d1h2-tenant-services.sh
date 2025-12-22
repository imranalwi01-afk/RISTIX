#!/bin/bash
# scripts/setup/d1h2-tenant-services.sh
# DAY 1 HOUR 2: Tenant Management Services Generator - IFRS 9 Multi-Tenant Platform
# Based on: 001-006-005-TodoList-v2.md and actual database backup schemas

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration following coding standards
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h2-tenant-services-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions following coding standards
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling following coding standards
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate tenant service with actual backup schema integration
generate_tenant_service() {
    log_info "Generating tenant management service..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/tenant"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/tenant/tenant.service.ts" << 'EOF'
// packages/backend/src/core/services/tenant/tenant.service.ts
// Multi-Tenant Management Service - IFRS 9 Multi-Tenant Platform
// Based on: actual database backup schemas and 001-006-008-coding-standards.md

import { v4 as uuidv4 } from 'uuid';
import { databaseConfig } from '../../database/config/database.config';
import { configService } from '../configuration/configuration.service';

// MANDATORY: Types based on actual platform_admin.tenants schema
interface TenantCreateInput {
  tenantName: string;
  displayName: string;
  organizationName?: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  subscriptionTier?: 'basic' | 'standard' | 'premium' | 'enterprise';
  tenantSettings?: Record<string, any>;
  featuresEnabled?: Record<string, boolean>;
  complianceSettings?: Record<string, any>;
}

interface TenantInfo {
  id: string;
  tenantName: string;
  tenantSlug: string;
  displayName: string;
  organizationName?: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  databaseName: string;
  databaseHost: string;
  databasePort: number;
  status: 'provisioning' | 'active' | 'suspended' | 'inactive';
  subscriptionTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  tenantSettings: Record<string, any>;
  featuresEnabled: Record<string, boolean>;
  complianceSettings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

interface TenantFeatures {
  dashboard: boolean;
  basicReports: boolean;
  eclCalculations: boolean;
  advancedAnalytics?: boolean;
  stressTesting?: boolean;
  islamicBanking?: boolean;
  syariahCompliance?: boolean;
  workflowManagement?: boolean;
  auditTrail?: boolean;
  apiAccess?: boolean;
  mobileApi?: boolean;
}

interface SyariahComplianceSettings {
  aaoifiStandards: boolean;
  prohibitedSectors: string[];
  regulatoryFramework: string;
  complianceMonitoring: boolean;
  syariahAuditRequired: boolean;
  syariahBoardRequired: boolean;
}

export class TenantService {
  private static instance: TenantService;
  private tenantCache: Map<string, TenantInfo> = new Map();
  private tenantSlugMap: Map<string, string> = new Map(); // slug -> tenantId mapping

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  // MANDATORY: Create new tenant with database provisioning
  public async createTenant(input: TenantCreateInput, createdBy: string = 'system'): Promise<TenantInfo> {
    const platformDb = databaseConfig.getPlatformConnection();
    const transaction = await platformDb.transaction();

    try {
      // Generate tenant ID and slug
      const tenantId = uuidv4();
      const tenantSlug = this.generateTenantSlug(input.tenantName);

      // Validate tenant name uniqueness
      await this.validateTenantUniqueness(input.tenantName, tenantSlug);

      // Generate database name
      const databaseName = `ifrspro_tenant_${tenantSlug}_${input.bankingType}`;

      // Set default features based on banking type
      const defaultFeatures = this.getDefaultFeatures(input.bankingType, input.subscriptionTier || 'basic');
      const featuresEnabled = { ...defaultFeatures, ...input.featuresEnabled };

      // Set compliance settings based on banking type
      const complianceSettings = this.getComplianceSettings(input.bankingType, input.complianceSettings);

      // Insert tenant record
      const insertQuery = `
        INSERT INTO platform_admin.tenants (
          id, tenant_name, tenant_slug, display_name, organization_name,
          banking_type, database_name, database_host, database_port,
          status, subscription_tier, tenant_settings, features_enabled,
          compliance_settings, created_by, created_at, updated_at
        ) VALUES (
          :tenantId, :tenantName, :tenantSlug, :displayName, :organizationName,
          :bankingType, :databaseName, :databaseHost, :databasePort,
          'provisioning', :subscriptionTier, :tenantSettings, :featuresEnabled,
          :complianceSettings, :createdBy, NOW(), NOW()
        ) RETURNING *
      `;

      const [tenantResult] = await platformDb.query(insertQuery, {
        replacements: {
          tenantId,
          tenantName: input.tenantName,
          tenantSlug,
          displayName: input.displayName,
          organizationName: input.organizationName,
          bankingType: input.bankingType,
          databaseName,
          databaseHost: 'localhost', // Default from TodoList-v2.md
          databasePort: 5432,
          subscriptionTier: input.subscriptionTier || 'basic',
          tenantSettings: JSON.stringify(input.tenantSettings || {}),
          featuresEnabled: JSON.stringify(featuresEnabled),
          complianceSettings: JSON.stringify(complianceSettings),
          createdBy
        },
        type: 'SELECT',
        transaction
      });

      // Provision tenant database
      await this.provisionTenantDatabase(tenantId, tenantSlug, input.bankingType);

      // Update tenant status to active
      await platformDb.query(
        'UPDATE platform_admin.tenants SET status = \'active\', updated_at = NOW() WHERE id = :tenantId',
        {
          replacements: { tenantId },
          transaction
        }
      );

      // Log tenant creation in global audit
      await this.logTenantEvent(
        tenantId,
        'TENANT_REGISTRATION',
        'CREATE',
        'TENANT',
        tenantId,
        `New ${input.bankingType} banking tenant registered: ${input.tenantName}`,
        {
          tenant_name: input.tenantName,
          banking_type: input.bankingType,
          database_name: databaseName,
          organization_name: input.organizationName,
          subscription_tier: input.subscriptionTier
        },
        createdBy,
        transaction
      );

      await transaction.commit();

      // Create tenant info object
      const tenantInfo: TenantInfo = {
        id: tenantId,
        tenantName: input.tenantName,
        tenantSlug,
        displayName: input.displayName,
        organizationName: input.organizationName,
        bankingType: input.bankingType,
        databaseName,
        databaseHost: 'localhost',
        databasePort: 5432,
        status: 'active',
        subscriptionTier: input.subscriptionTier || 'basic',
        tenantSettings: input.tenantSettings || {},
        featuresEnabled,
        complianceSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy
      };

      // Cache the tenant info
      this.cacheTenant(tenantInfo);

      return tenantInfo;

    } catch (error) {
      await transaction.rollback();
      console.error('Error creating tenant:', error);
      throw new Error(`Failed to create tenant: ${error}`);
    }
  }

  // MANDATORY: Get tenant by ID with caching
  public async getTenant(tenantId: string): Promise<TenantInfo | null> {
    // Check cache first
    if (this.tenantCache.has(tenantId)) {
      const cached = this.tenantCache.get(tenantId)!;
      // Check if cache is still valid (5 minutes)
      const cacheAge = Date.now() - cached.updatedAt.getTime();
      if (cacheAge < 300000) { // 5 minutes
        return cached;
      }
    }

    // Fetch from database
    const platformDb = databaseConfig.getPlatformConnection();
    
    try {
      const query = `
        SELECT 
          id, tenant_name, tenant_slug, display_name, organization_name,
          banking_type, database_name, database_host, database_port,
          status, subscription_tier, tenant_settings, features_enabled,
          compliance_settings, created_at, updated_at, created_by, updated_by
        FROM platform_admin.tenants 
        WHERE id = :tenantId
      `;

      const [results] = await platformDb.query(query, {
        replacements: { tenantId },
        type: 'SELECT'
      });

      if (!results || results.length === 0) {
        return null;
      }

      const tenant = this.mapDatabaseResultToTenantInfo(results[0] as any);
      this.cacheTenant(tenant);
      
      return tenant;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  }

  // MANDATORY: Get tenant by slug (for routing)
  public async getTenantBySlug(tenantSlug: string): Promise<TenantInfo | null> {
    // Check slug mapping cache
    const tenantId = this.tenantSlugMap.get(tenantSlug);
    if (tenantId) {
      return this.getTenant(tenantId);
    }

    // Fetch from database
    const platformDb = databaseConfig.getPlatformConnection();
    
    try {
      const query = `
        SELECT 
          id, tenant_name, tenant_slug, display_name, organization_name,
          banking_type, database_name, database_host, database_port,
          status, subscription_tier, tenant_settings, features_enabled,
          compliance_settings, created_at, updated_at, created_by, updated_by
        FROM platform_admin.tenants 
        WHERE tenant_slug = :tenantSlug AND status = 'active'
      `;

      const [results] = await platformDb.query(query, {
        replacements: { tenantSlug },
        type: 'SELECT'
      });

      if (!results || results.length === 0) {
        return null;
      }

      const tenant = this.mapDatabaseResultToTenantInfo(results[0] as any);
      this.cacheTenant(tenant);
      
      return tenant;
    } catch (error) {
      console.error('Error fetching tenant by slug:', error);
      return null;
    }
  }

  // MANDATORY: List all active tenants
  public async listTenants(
    limit: number = 50, 
    offset: number = 0,
    bankingType?: 'conventional' | 'syariah' | 'dual'
  ): Promise<{ tenants: TenantInfo[]; total: number }> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    try {
      let whereClause = "WHERE status = 'active'";
      const replacements: any = { limit, offset };
      
      if (bankingType) {
        whereClause += " AND banking_type = :bankingType";
        replacements.bankingType = bankingType;
      }

      const query = `
        SELECT 
          id, tenant_name, tenant_slug, display_name, organization_name,
          banking_type, database_name, database_host, database_port,
          status, subscription_tier, tenant_settings, features_enabled,
          compliance_settings, created_at, updated_at, created_by, updated_by
        FROM platform_admin.tenants 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
      `;

      const countQuery = `
        SELECT COUNT(*) as total 
        FROM platform_admin.tenants 
        ${whereClause}
      `;

      const [results, countResults] = await Promise.all([
        platformDb.query(query, {
          replacements,
          type: 'SELECT'
        }),
        platformDb.query(countQuery, {
          replacements: bankingType ? { bankingType } : {},
          type: 'SELECT'
        })
      ]);

      const tenants = (results[0] as any[]).map(row => this.mapDatabaseResultToTenantInfo(row));
      const total = (countResults[0] as any[])[0].total;

      return { tenants, total };
    } catch (error) {
      console.error('Error listing tenants:', error);
      return { tenants: [], total: 0 };
    }
  }

  // MANDATORY: Banking type-specific feature defaults
  private getDefaultFeatures(bankingType: string, subscriptionTier: string): TenantFeatures {
    const baseFeatures: TenantFeatures = {
      dashboard: true,
      basicReports: true,
      eclCalculations: true
    };

    if (bankingType === 'syariah' || bankingType === 'dual') {
      return {
        ...baseFeatures,
        islamicBanking: true,
        syariahCompliance: true,
        advancedAnalytics: subscriptionTier !== 'basic',
        workflowManagement: true,
        auditTrail: true
      };
    }

    return {
      ...baseFeatures,
      advancedAnalytics: subscriptionTier !== 'basic',
      stressTesting: subscriptionTier === 'premium' || subscriptionTier === 'enterprise'
    };
  }

  // MANDATORY: Banking type-specific compliance settings
  private getComplianceSettings(bankingType: string, customSettings?: Record<string, any>): SyariahComplianceSettings | Record<string, any> {
    if (bankingType === 'syariah' || bankingType === 'dual') {
      const syariahSettings: SyariahComplianceSettings = {
        aaoifiStandards: true,
        prohibitedSectors: [
          'alcohol', 'gambling', 'pork', 'conventional_banking',
          'adult_entertainment', 'tobacco', 'weapons'
        ],
        regulatoryFramework: 'OJK_Islamic',
        complianceMonitoring: true,
        syariahAuditRequired: true,
        syariahBoardRequired: true,
        ...customSettings
      };
      
      return syariahSettings;
    }

    return {
      banking_type: bankingType,
      regulatory_framework: 'OJK_Conventional',
      ...customSettings
    };
  }

  // Generate tenant slug from name
  private generateTenantSlug(tenantName: string): string {
    return tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }

  // Validate tenant uniqueness
  private async validateTenantUniqueness(tenantName: string, tenantSlug: string): Promise<void> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const existingQuery = `
      SELECT id FROM platform_admin.tenants 
      WHERE tenant_name = :tenantName OR tenant_slug = :tenantSlug
    `;

    const [existing] = await platformDb.query(existingQuery, {
      replacements: { tenantName, tenantSlug },
      type: 'SELECT'
    });

    if (existing && existing.length > 0) {
      throw new Error(`Tenant with name '${tenantName}' or slug '${tenantSlug}' already exists`);
    }
  }

  // Provision tenant database using schema generator
  private async provisionTenantDatabase(tenantId: string, tenantSlug: string, bankingType: string): Promise<void> {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const scriptPath = `${process.cwd()}/scripts/database/tenant-provisioning/create-tenant-schema.sh`;
      const child = spawn('bash', [scriptPath, tenantSlug, bankingType], {
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Tenant database provisioning failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Log tenant events in global audit trail
  private async logTenantEvent(
    tenantId: string,
    eventType: string,
    action: string,
    entityType: string,
    entityId: string,
    description: string,
    newValues: any,
    userId: string,
    transaction?: any
  ): Promise<void> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const auditQuery = `
      INSERT INTO platform_audit.global_audit_log (
        id, tenant_id, user_id, event_type, action, entity_type, entity_id,
        description, new_values, ip_address, created_at
      ) VALUES (
        :id, :tenantId, :userId, :eventType, :action, :entityType, :entityId,
        :description, :newValues, :ipAddress, NOW()
      )
    `;

    await platformDb.query(auditQuery, {
      replacements: {
        id: uuidv4(),
        tenantId,
        userId: userId === 'system' ? null : userId,
        eventType,
        action,
        entityType,
        entityId,
        description,
        newValues: JSON.stringify(newValues),
        ipAddress: '127.0.0.1'
      },
      transaction
    });
  }

  // Map database result to TenantInfo object
  private mapDatabaseResultToTenantInfo(row: any): TenantInfo {
    return {
      id: row.id,
      tenantName: row.tenant_name,
      tenantSlug: row.tenant_slug,
      displayName: row.display_name,
      organizationName: row.organization_name,
      bankingType: row.banking_type,
      databaseName: row.database_name,
      databaseHost: row.database_host,
      databasePort: row.database_port,
      status: row.status,
      subscriptionTier: row.subscription_tier,
      tenantSettings: typeof row.tenant_settings === 'string' ? JSON.parse(row.tenant_settings) : row.tenant_settings,
      featuresEnabled: typeof row.features_enabled === 'string' ? JSON.parse(row.features_enabled) : row.features_enabled,
      complianceSettings: typeof row.compliance_settings === 'string' ? JSON.parse(row.compliance_settings) : row.compliance_settings,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by
    };
  }

  // Cache tenant information
  private cacheTenant(tenant: TenantInfo): void {
    this.tenantCache.set(tenant.id, tenant);
    this.tenantSlugMap.set(tenant.tenantSlug, tenant.id);
  }

  // Clear cache
  public clearCache(): void {
    this.tenantCache.clear();
    this.tenantSlugMap.clear();
  }
}

// Export singleton instance
export const tenantService = TenantService.getInstance();

// Export types
export type {
  TenantCreateInput,
  TenantInfo,
  TenantFeatures,
  SyariahComplianceSettings
};
EOF
    
    log_success "Tenant management service generated"
}

# Generate tenant middleware for request routing
generate_tenant_middleware() {
    log_info "Generating tenant middleware for request routing..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/tenant.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/tenant.middleware.ts
// Multi-Tenant Request Routing Middleware - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md tenant isolation patterns

import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../../core/services/tenant/tenant.service';
import { databaseConfig } from '../../core/database/config/database.config';

// Extend Express Request to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        bankingType: 'conventional' | 'syariah' | 'dual';
        database: any; // Sequelize instance
        features: Record<string, boolean>;
        settings: Record<string, any>;
      };
    }
  }
}

interface TenantResolutionStrategy {
  type: 'header' | 'subdomain' | 'path' | 'query';
  extractTenantIdentifier(req: Request): string | null;
}

class HeaderStrategy implements TenantResolutionStrategy {
  type: 'header' = 'header';
  
  extractTenantIdentifier(req: Request): string | null {
    return req.headers['x-tenant-id'] as string || 
           req.headers['x-tenant-slug'] as string || 
           null;
  }
}

class SubdomainStrategy implements TenantResolutionStrategy {
  type: 'subdomain' = 'subdomain';
  
  extractTenantIdentifier(req: Request): string | null {
    const host = req.headers.host;
    if (!host) return null;
    
    const subdomain = host.split('.')[0];
    
    // Skip common subdomains
    if (['www', 'api', 'admin', 'app'].includes(subdomain)) {
      return null;
    }
    
    return subdomain;
  }
}

class PathStrategy implements TenantResolutionStrategy {
  type: 'path' = 'path';
  
  extractTenantIdentifier(req: Request): string | null {
    const pathMatch = req.path.match(/^\/tenant\/([^\/]+)/);
    return pathMatch ? pathMatch[1] : null;
  }
}

class QueryStrategy implements TenantResolutionStrategy {
  type: 'query' = 'query';
  
  extractTenantIdentifier(req: Request): string | null {
    return req.query.tenant as string || 
           req.query.tenant_id as string || 
           req.query.tenant_slug as string || 
           null;
  }
}

export class TenantMiddleware {
  private strategies: TenantResolutionStrategy[] = [
    new HeaderStrategy(),
    new SubdomainStrategy(),
    new PathStrategy(),
    new QueryStrategy()
  ];

  // MANDATORY: Main tenant resolution middleware
  public resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip tenant resolution for health checks and public endpoints
      if (this.isPublicEndpoint(req.path)) {
        return next();
      }

      // Try to resolve tenant using all strategies
      const tenantIdentifier = this.resolveTenantIdentifier(req);
      
      if (!tenantIdentifier) {
        return this.handleMissingTenant(req, res);
      }

      // Get tenant information
      const tenant = await this.getTenantInfo(tenantIdentifier);
      
      if (!tenant) {
        return this.handleTenantNotFound(req, res, tenantIdentifier);
      }

      // Check tenant status
      if (tenant.status !== 'active') {
        return this.handleInactiveTenant(req, res, tenant.status);
      }

      // Get tenant database connection
      const tenantDb = await databaseConfig.getTenantConnection(tenant.id);

      // Set tenant context in request
      req.tenant = {
        id: tenant.id,
        slug: tenant.tenantSlug,
        bankingType: tenant.bankingType,
        database: tenantDb,
        features: tenant.featuresEnabled,
        settings: tenant.tenantSettings
      };

      // Add tenant info to response headers (for debugging)
      if (process.env.NODE_ENV === 'development') {
        res.setHeader('X-Tenant-ID', tenant.id);
        res.setHeader('X-Tenant-Slug', tenant.tenantSlug);
        res.setHeader('X-Banking-Type', tenant.bankingType);
      }

      next();
    } catch (error) {
      console.error('Tenant resolution error:', error);
      res.status(500).json({
        error: 'Internal server error during tenant resolution',
        code: 'TENANT_RESOLUTION_ERROR'
      });
    }
  };

  // MANDATORY: Banking type detection middleware
  public requireBankingType = (allowedTypes: ('conventional' | 'syariah' | 'dual')[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.tenant) {
        return res.status(401).json({
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_MISSING'
        });
      }

      if (!allowedTypes.includes(req.tenant.bankingType)) {
        return res.status(403).json({
          error: `This endpoint requires ${allowedTypes.join(' or ')} banking type`,
          code: 'BANKING_TYPE_NOT_ALLOWED',
          allowedTypes,
          currentType: req.tenant.bankingType
        });
      }

      next();
    };
  };

  // MANDATORY: Feature requirement middleware
  public requireFeature = (featureName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.tenant) {
        return res.status(401).json({
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_MISSING'
        });
      }

      if (!req.tenant.features[featureName]) {
        return res.status(403).json({
          error: `Feature '${featureName}' is not enabled for this tenant`,
          code: 'FEATURE_NOT_ENABLED',
          requiredFeature: featureName
        });
      }

      next();
    };
  };

  // MANDATORY: Syariah compliance middleware
  public requireSyariahCompliance = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.tenant) {
        return res.status(401).json({
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_MISSING'
        });
      }

      if (req.tenant.bankingType === 'conventional') {
        return res.status(403).json({
          error: 'This endpoint requires Syariah banking compliance',
          code: 'SYARIAH_COMPLIANCE_REQUIRED'
        });
      }

      if (!req.tenant.features.syariahCompliance) {
        return res.status(403).json({
          error: 'Syariah compliance feature is not enabled',
          code: 'SYARIAH_COMPLIANCE_NOT_ENABLED'
        });
      }

      next();
    };
  };

  // Resolve tenant identifier using multiple strategies
  private resolveTenantIdentifier(req: Request): string | null {
    for (const strategy of this.strategies) {
      const identifier = strategy.extractTenantIdentifier(req);
      if (identifier) {
        return identifier;
      }
    }
    return null;
  }

  // Get tenant information by ID or slug
  private async getTenantInfo(identifier: string): Promise<any> {
    // Try UUID format first
    if (identifier.length === 36 && identifier.includes('-')) {
      return await tenantService.getTenant(identifier);
    }
    
    // Try as tenant slug
    return await tenantService.getTenantBySlug(identifier);
  }

  // Check if endpoint is public (no tenant required)
  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/health',
      '/metrics',
      '/api/v1/auth/platform',
      '/api/v1/platform',
      '/api/v1/status'
    ];

    return publicPaths.some(publicPath => path.startsWith(publicPath));
  }

  // Handle missing tenant identifier
  private handleMissingTenant(req: Request, res: Response): void {
    res.status(400).json({
      error: 'Tenant identification required',
      code: 'TENANT_IDENTIFIER_MISSING',
      hint: 'Provide tenant ID via header (X-Tenant-ID), subdomain, or path parameter'
    });
  }

  // Handle tenant not found
  private handleTenantNotFound(req: Request, res: Response, identifier: string): void {
    res.status(404).json({
      error: 'Tenant not found',
      code: 'TENANT_NOT_FOUND',
      identifier
    });
  }

  // Handle inactive tenant
  private handleInactiveTenant(req: Request, res: Response, status: string): void {
    res.status(403).json({
      error: 'Tenant is not active',
      code: 'TENANT_INACTIVE',
      status
    });
  }
}

// Export singleton instance
export const tenantMiddleware = new TenantMiddleware();

// Export convenience functions
export const resolveTenant = tenantMiddleware.resolve;
export const requireBankingType = tenantMiddleware.requireBankingType;
export const requireFeature = tenantMiddleware.requireFeature;
export const requireSyariahCompliance = tenantMiddleware.requireSyariahCompliance;
EOF
    
    log_success "Tenant middleware generated"
}

# Generate tenant controller for API endpoints
generate_tenant_controller() {
    log_info "Generating tenant controller for API endpoints..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/tenant.controller.ts" << 'EOF'
// packages/backend/src/api/controllers/tenant.controller.ts
// Tenant Management Controller - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md API patterns

import { Request, Response } from 'express';
import { tenantService, TenantCreateInput } from '../../core/services/tenant/tenant.service';
import { databaseConfig } from '../../core/database/config/database.config';

export class TenantController {
  // Create new tenant
  public static async createTenant(req: Request, res: Response): Promise<void> {
    try {
      const tenantData: TenantCreateInput = req.body;
      const createdBy = req.user?.id || 'system'; // Assuming auth middleware sets req.user

      const tenant = await tenantService.createTenant(tenantData, createdBy);

      res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to create tenant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get tenant by ID
  public static async getTenant(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const tenant = await tenantService.getTenant(tenantId);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found',
          tenantId
        });
        return;
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tenant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get tenant by slug
  public static async getTenantBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { tenantSlug } = req.params;
      const tenant = await tenantService.getTenantBySlug(tenantSlug);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found',
          tenantSlug
        });
        return;
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error fetching tenant by slug:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tenant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // List all tenants
  public static async listTenants(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const bankingType = req.query.bankingType as 'conventional' | 'syariah' | 'dual' | undefined;

      const result = await tenantService.listTenants(limit, offset, bankingType);

      res.json({
        success: true,
        data: result.tenants,
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: offset + limit < result.total
        },
        filters: {
          bankingType
        }
      });
    } catch (error) {
      console.error('Error listing tenants:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list tenants',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get current tenant info (from middleware context)
  public static async getCurrentTenant(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          error: 'No tenant context available'
        });
        return;
      }

      // Get full tenant information
      const tenant = await tenantService.getTenant(req.tenant.id);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Current tenant not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ...tenant,
          context: {
            bankingType: req.tenant.bankingType,
            features: req.tenant.features,
            settings: req.tenant.settings
          }
        }
      });
    } catch (error) {
      console.error('Error fetching current tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch current tenant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get tenant database health status
  public static async getTenantHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await databaseConfig.healthCheck();

      res.json({
        success: true,
        data: {
          platform: health.platform,
          shared: health.shared,
          tenants: health.tenants,
          summary: {
            totalConnections: Object.keys(health.tenants).length,
            healthyTenants: Object.values(health.tenants).filter(Boolean).length,
            unhealthyTenants: Object.values(health.tenants).filter(h => !h).length
          }
        }
      });
    } catch (error) {
      console.error('Error checking tenant health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check tenant health',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get tenant features and capabilities
  public static async getTenantFeatures(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          error: 'No tenant context available'
        });
        return;
      }

      const tenant = await tenantService.getTenant(req.tenant.id);

      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          tenantId: tenant.id,
          bankingType: tenant.bankingType,
          subscriptionTier: tenant.subscriptionTier,
          features: tenant.featuresEnabled,
          compliance: tenant.complianceSettings,
          capabilities: {
            syariahCompliance: tenant.bankingType === 'syariah' || tenant.bankingType === 'dual',
            advancedAnalytics: tenant.featuresEnabled.advancedAnalytics || false,
            stressTesting: tenant.featuresEnabled.stressTesting || false,
            workflowManagement: tenant.featuresEnabled.workflowManagement || false,
            auditTrail: tenant.featuresEnabled.auditTrail || false
          }
        }
      });
    } catch (error) {
      console.error('Error fetching tenant features:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tenant features',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
EOF
    
    log_success "Tenant controller generated"
}

# Generate tenant routes
generate_tenant_routes() {
    log_info "Generating tenant routes..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/tenant.routes.ts" << 'EOF'
// packages/backend/src/api/routes/tenant.routes.ts
// Tenant Management Routes - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md routing patterns

import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { resolveTenant, requireBankingType, requireFeature } from '../middleware/tenant.middleware';

const router = Router();

// Platform-level tenant management (no tenant context required)
router.post('/tenants', TenantController.createTenant);
router.get('/tenants', TenantController.listTenants);
router.get('/tenants/:tenantId', TenantController.getTenant);
router.get('/tenants/slug/:tenantSlug', TenantController.getTenantBySlug);
router.get('/health/tenants', TenantController.getTenantHealth);

// Tenant-specific routes (require tenant context)
router.use(resolveTenant);

router.get('/tenant/current', TenantController.getCurrentTenant);
router.get('/tenant/features', TenantController.getTenantFeatures);

// Banking type specific routes
router.get('/tenant/syariah-info', 
  requireBankingType(['syariah', 'dual']),
  (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Syariah banking information endpoint',
        bankingType: req.tenant?.bankingType,
        compliance: req.tenant?.settings
      }
    });
  }
);

router.get('/tenant/conventional-info', 
  requireBankingType(['conventional', 'dual']),
  (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Conventional banking information endpoint',
        bankingType: req.tenant?.bankingType
      }
    });
  }
);

// Feature-specific routes
router.get('/tenant/analytics', 
  requireFeature('advancedAnalytics'),
  (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Advanced analytics endpoint',
        tenantId: req.tenant?.id,
        features: req.tenant?.features
      }
    });
  }
);

export default router;
EOF
    
    log_success "Tenant routes generated"
}

# Main execution function following coding standards
main() {
    log_info "🚀 Starting Day 1 Hour 2: Tenant Management Services Generation"
    log_info "Following TodoList-v2.md tenant management requirements"
    
    # Step 1: Generate tenant service
    generate_tenant_service
    
    # Step 2: Generate tenant middleware
    generate_tenant_middleware
    
    # Step 3: Generate tenant controller
    generate_tenant_controller
    
    # Step 4: Generate tenant routes
    generate_tenant_routes
    
    log_success "✅ Day 1 Hour 2: Tenant Management Services completed successfully!"
    log_info "📍 Project location: ${PROJECT_ROOT}"
    log_info "📋 Log file: ${LOG_FILE}"
    log_info "🔄 Next step: Run './scripts/setup/d1h2-middleware-setup.sh'"
    
    echo ""
    echo "🎯 DAY 1 HOUR 2 COMPLETED - TENANT MANAGEMENT SERVICES"
    echo "✅ Tenant service with actual backup schema integration"
    echo "✅ Multi-tenant middleware with banking type detection"
    echo "✅ Tenant controller with comprehensive API endpoints"
    echo "✅ Tenant routes with feature and banking type requirements"
    echo ""
    echo "🏗️ Multi-tenant features ready:"
    echo "   • Tenant creation and provisioning"
    echo "   • Database-per-tenant connections"
    echo "   • Banking type routing (conventional/syariah/dual)"
    echo "   • Feature-based access control"
    echo "   • Tenant context middleware"
    echo "   • Syariah compliance enforcement"
    echo ""
    echo "🔄 Next: Run './scripts/setup/d1h2-middleware-setup.sh' for additional middleware"
    echo ""
}

# Execute main function with all arguments
main "$@"