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
      // Use raw pg Pool query with positional parameters
      const client = await platformDb.connect();
      const query = `
        SELECT 
          id, tenant_name, tenant_slug, display_name, organization_name,
          banking_type, database_name, database_host, database_port,
          status, subscription_tier, tenant_settings, features_enabled,
          compliance_settings, created_at, updated_at, created_by, updated_by
        FROM platform_admin.tenants 
        WHERE id = $1
      `;

      const result = await client.query(query, [tenantId]);
      client.release();
      const results = result.rows;

      if (!results || results.length === 0) {
        return null;
      }

      const tenant = this.mapDatabaseResultToTenantInfo(results[0] as any);
      this.cacheTenant(tenant);
      
      return tenant;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching tenant ${tenantId}:`, error);
      
      // If this is a timeout error, log additional details for diagnosis
      if (errorMsg.includes('timeout')) {
        console.error(`⚠️ Database timeout detected for tenant ${tenantId}. Consider increasing timeout values.`);
        console.error(`Current timeout configuration: ${process.env.DATABASE_CONNECTION_TIMEOUT || '60000'}ms`);
      }
      
      return null;
    }
  }

  // MANDATORY: Get tenant by slug (for routing)
  public async getTenantBySlug(tenantSlug: string): Promise<TenantInfo | null> {
    // ✅ CORRECTED: Clean tenant slug mapping (removed all test mappings)
    // Each tenant should directly map to its own database
    // No slug remapping needed - use actual tenant slugs
    
    const mappedSlug = tenantSlug; // Direct mapping - no transformation needed
    
    // Check slug mapping cache
    const tenantId = this.tenantSlugMap.get(mappedSlug);
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
        WHERE tenant_slug = $1 AND status = 'active'
      `;

      const results = await platformDb.query(query, [mappedSlug]);

      if (!results || !results.rows || results.rows.length === 0) {
        return null;
      }

      const tenant = this.mapDatabaseResultToTenantInfo(results.rows[0] as any);
      this.cacheTenant(tenant);
      
      // ✅ CRITICAL: Cache the original slug mapping for future requests
      if (mappedSlug !== tenantSlug) {
        this.tenantSlugMap.set(tenantSlug, tenant.id);
        console.log(`✅ Cached tenant slug mapping: ${tenantSlug} -> ${tenant.id} (${tenant.tenantSlug})`);
      }
      
      return tenant;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching tenant by slug ${tenantSlug}:`, error);
      
      // If this is a timeout error, log additional details for diagnosis
      if (errorMsg.includes('timeout')) {
        console.error(`⚠️ Database timeout detected for tenant slug ${tenantSlug}. Consider increasing timeout values.`);
        console.error(`Current timeout configuration: ${process.env.DATABASE_CONNECTION_TIMEOUT || '60000'}ms`);
      }
      
      return null;
    }
  }

  // MANDATORY: List all active tenants
  public async listTenants(params: {
    limit?: number;
    offset?: number;
    bankingType?: 'conventional' | 'syariah' | 'dual';
    includeInactive?: boolean;
  } = {}): Promise<{ data: TenantInfo[]; total: number }> {
    const { limit = 50, offset = 0, bankingType, includeInactive = false } = params;
    const platformDb = databaseConfig.getPlatformConnection();
    
    try {
      // Build where conditions with proper replacements
      const replacements: any = {};
      let whereConditions: string[] = [];
      
      if (!includeInactive) {
        whereConditions.push("status = :status");
        replacements.status = 'active';
      }
      
      if (bankingType) {
        whereConditions.push("banking_type = :bankingType");
        replacements.bankingType = bankingType;
      }
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

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

      // Add pagination parameters
      replacements.limit = limit;
      replacements.offset = offset;

      // Execute both queries using raw pg Pool
      const client = await platformDb.connect();
      
      try {
        // Build parameter arrays for raw queries
        const queryParams: any[] = [];
        let paramIndex = 1;
        
        // Replace named parameters with positional ones
        let finalQuery = query;
        let finalCountQuery = countQuery;
        
        // Replace parameters in order they appear
        if (replacements.status) {
          finalQuery = finalQuery.replace(':status', `$${paramIndex}`);
          finalCountQuery = finalCountQuery.replace(':status', `$${paramIndex}`);
          queryParams.push(replacements.status);
          paramIndex++;
        }
        
        if (replacements.bankingType) {
          finalQuery = finalQuery.replace(':bankingType', `$${paramIndex}`);
          finalCountQuery = finalCountQuery.replace(':bankingType', `$${paramIndex}`);
          queryParams.push(replacements.bankingType);
          paramIndex++;
        }
        
        // Add pagination parameters
        finalQuery = finalQuery.replace(':limit', `$${paramIndex++}`);
        finalQuery = finalQuery.replace(':offset', `$${paramIndex++}`);
        queryParams.push(limit, offset);
        
        // Execute queries
        const results = await client.query(finalQuery, queryParams);
        const countResults = await client.query(finalCountQuery, queryParams.slice(0, -2)); // Remove limit/offset for count
        
        const data = results.rows.map(row => this.mapDatabaseResultToTenantInfo(row));
        const total = parseInt(countResults.rows[0].total);

        return { data, total };
        
      } catch (queryError) {
        client.release();
        throw queryError;
      }
    } catch (error) {
      console.error('Error listing tenants:', error);
      return { data: [], total: 0 };
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
