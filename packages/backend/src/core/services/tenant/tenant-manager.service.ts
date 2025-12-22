// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/tenant/tenant-manager.service.ts
// Generated: Rab 23 Jul 2025 08:08:44  WIB
// Phase: D2H1 - Tenant Management Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, PostgreSQL, UUID, Bcrypt
// Purpose: Comprehensive tenant management with multi-stakeholder support
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { 
    TenantCreateInput, 
    TenantInfo, 
    TenantUpdateInput,
    StakeholderType,
    BankingType,
    TenantStatus,
    TenantDatabaseConfig,
    MultiStakeholderAccess
} from '../../types/tenant-management.types';

@Injectable()
export class TenantManagerService {
    private readonly logger = new Logger(TenantManagerService.name);
    private readonly platformPool: Pool;
    private readonly sharedPool: Pool;

    constructor() {
        // Platform admin database connection
        this.platformPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Shared services database connection
        this.sharedPool = new Pool({
            host: process.env.SHARED_DB_HOST || 'localhost',
            port: parseInt(process.env.SHARED_DB_PORT || '5432'),
            database: process.env.SHARED_DB_NAME || 'ifrspro_shared_services',
            user: process.env.SHARED_DB_USER || 'postgres',
            password: process.env.SHARED_DB_PASSWORD || 'postgres',
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    /**
     * Create new tenant with multi-stakeholder support
     */
    async createTenant(input: TenantCreateInput): Promise<TenantInfo> {
        const client = await this.platformPool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Generate tenant ID and database name
            const tenantId = uuidv4();
            const tenantSlug = this.generateTenantSlug(input.tenantName);
            const databaseName = this.generateDatabaseName(tenantSlug, input.bankingType);
            
            this.logger.log(`Creating tenant: ${input.tenantName} (${tenantId})`);

            // Insert tenant record
            const tenantQuery = `
                INSERT INTO platform_admin.tenants (
                    id, tenant_name, tenant_slug, display_name, organization_name,
                    banking_type, database_name, database_host, database_port,
                    status, subscription_tier, tenant_settings, features_enabled,
                    compliance_settings, created_at, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15)
                RETURNING *
            `;

            const tenantResult = await client.query(tenantQuery, [
                tenantId,
                input.tenantName,
                tenantSlug,
                input.displayName || input.tenantName,
                input.organizationName,
                input.bankingType,
                databaseName,
                process.env.DB_HOST || 'localhost',
                parseInt(process.env.DB_PORT || '5432'),
                'provisioning',
                input.subscriptionTier || 'basic',
                input.tenantSettings || {},
                this.getDefaultFeatures(input.bankingType),
                this.getComplianceSettings(input.bankingType),
                'system'
            ]);

            // Create tenant database
            await this.createTenantDatabase(databaseName, input.bankingType);

            // Setup multi-stakeholder access
            if (input.stakeholderAccess) {
                await this.setupStakeholderAccess(tenantId, input.stakeholderAccess, client);
            }

            // Log tenant creation
            await this.logTenantActivity(tenantId, 'TENANT_CREATION', {
                tenant_name: input.tenantName,
                banking_type: input.bankingType,
                database_name: databaseName,
                stakeholder_types: input.stakeholderAccess?.map(s => s.stakeholderType) || []
            }, client);

            await client.query('COMMIT');
            
            const tenant = tenantResult.rows[0];
            
            this.logger.log(`Tenant created successfully: ${tenant.tenant_name}`);
            
            return this.mapToTenantInfo(tenant);

        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error(`Failed to create tenant: ${error.message}`, error.stack);
            throw new Error(`Tenant creation failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Update tenant configuration
     */
    async updateTenant(tenantId: string, input: TenantUpdateInput): Promise<TenantInfo> {
        const client = await this.platformPool.connect();
        
        try {
            this.logger.log(`Updating tenant: ${tenantId}`);

            const updateQuery = `
                UPDATE platform_admin.tenants 
                SET 
                    display_name = COALESCE($2, display_name),
                    organization_name = COALESCE($3, organization_name),
                    tenant_settings = COALESCE($4, tenant_settings),
                    features_enabled = COALESCE($5, features_enabled),
                    compliance_settings = COALESCE($6, compliance_settings),
                    status = COALESCE($7, status),
                    updated_at = NOW(),
                    updated_by = $8
                WHERE id = $1
                RETURNING *
            `;

            const result = await client.query(updateQuery, [
                tenantId,
                input.displayName,
                input.organizationName,
                input.tenantSettings,
                input.featuresEnabled,
                input.complianceSettings,
                input.status,
                input.updatedBy || 'system'
            ]);

            if (result.rows.length === 0) {
                throw new Error('Tenant not found');
            }

            // Log tenant update
            await this.logTenantActivity(tenantId, 'TENANT_UPDATE', input, client);

            const tenant = result.rows[0];
            this.logger.log(`Tenant updated successfully: ${tenant.tenant_name}`);
            
            return this.mapToTenantInfo(tenant);

        } catch (error) {
            this.logger.error(`Failed to update tenant: ${error.message}`, error.stack);
            throw new Error(`Tenant update failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Get tenant by ID with stakeholder access validation
     */
    async getTenant(tenantId: string, stakeholderType?: StakeholderType): Promise<TenantInfo> {
        const client = await this.platformPool.connect();
        
        try {
            const query = `
                SELECT t.*, 
                       COALESCE(sa.access_level, 'read') as stakeholder_access_level
                FROM platform_admin.tenants t
                LEFT JOIN platform_admin.stakeholder_access sa ON t.id = sa.tenant_id 
                    AND sa.stakeholder_type = $2
                WHERE t.id = $1 AND t.status != 'deleted'
            `;

            const result = await client.query(query, [tenantId, stakeholderType || 'platform_admin']);

            if (result.rows.length === 0) {
                throw new Error('Tenant not found or access denied');
            }

            return this.mapToTenantInfo(result.rows[0]);

        } catch (error) {
            this.logger.error(`Failed to get tenant: ${error.message}`, error.stack);
            throw new Error(`Tenant retrieval failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * List tenants with stakeholder filtering
     */
    async listTenants(stakeholderType?: StakeholderType, filters?: any): Promise<TenantInfo[]> {
        const client = await this.platformPool.connect();
        
        try {
            let query = `
                SELECT DISTINCT t.*, 
                       COALESCE(sa.access_level, 'read') as stakeholder_access_level
                FROM platform_admin.tenants t
                LEFT JOIN platform_admin.stakeholder_access sa ON t.id = sa.tenant_id
                WHERE t.status != 'deleted'
            `;

            const params: any[] = [];
            let paramIndex = 1;

            // Add stakeholder filtering
            if (stakeholderType && stakeholderType !== 'platform_admin') {
                query += ` AND sa.stakeholder_type = $${paramIndex}`;
                params.push(stakeholderType);
                paramIndex++;
            }

            // Add additional filters
            if (filters?.bankingType) {
                query += ` AND t.banking_type = $${paramIndex}`;
                params.push(filters.bankingType);
                paramIndex++;
            }

            if (filters?.status) {
                query += ` AND t.status = $${paramIndex}`;
                params.push(filters.status);
                paramIndex++;
            }

            query += ` ORDER BY t.created_at DESC`;

            const result = await client.query(query, params);
            
            return result.rows.map(row => this.mapToTenantInfo(row));

        } catch (error) {
            this.logger.error(`Failed to list tenants: ${error.message}`, error.stack);
            throw new Error(`Tenant listing failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Create tenant database with banking-specific schema
     */
    private async createTenantDatabase(databaseName: string, bankingType: BankingType): Promise<void> {
        const masterClient = await new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: 'postgres',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        }).connect();

        try {
            this.logger.log(`Creating database: ${databaseName}`);

            // Create database
            await masterClient.query(`CREATE DATABASE ${databaseName}`);

            // Apply tenant schema based on banking type
            await this.applyTenantSchema(databaseName, bankingType);

            this.logger.log(`Database created successfully: ${databaseName}`);

        } catch (error) {
            this.logger.error(`Failed to create database: ${error.message}`, error.stack);
            throw error;
        } finally {
            masterClient.release();
        }
    }

    /**
     * Apply banking-specific schema to tenant database
     */
    private async applyTenantSchema(databaseName: string, bankingType: BankingType): Promise<void> {
        const tenantClient = await new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: databaseName,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        }).connect();

        try {
            // Enable extensions
            await tenantClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            await tenantClient.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

            // Create core schemas
            const schemas = ['core', 'staging', 'calculation', 'audit', 'workflow', 'configuration'];
            for (const schema of schemas) {
                await tenantClient.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
            }

            // Apply banking-specific schemas
            if (bankingType === 'syariah' || bankingType === 'dual') {
                await tenantClient.query('CREATE SCHEMA IF NOT EXISTS syariah_compliance');
                await this.applySyariahSchema(tenantClient);
            }

            // Apply core tenant schema
            await this.applyCoreSchema(tenantClient, bankingType);

        } catch (error) {
            this.logger.error(`Failed to apply tenant schema: ${error.message}`, error.stack);
            throw error;
        } finally {
            tenantClient.release();
        }
    }

    /**
     * Setup stakeholder access permissions
     */
    private async setupStakeholderAccess(
        tenantId: string, 
        stakeholderAccess: MultiStakeholderAccess[], 
        client: any
    ): Promise<void> {
        for (const access of stakeholderAccess) {
            const accessQuery = `
                INSERT INTO platform_admin.stakeholder_access (
                    id, tenant_id, stakeholder_type, stakeholder_id,
                    access_level, permissions, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            `;

            await client.query(accessQuery, [
                uuidv4(),
                tenantId,
                access.stakeholderType,
                access.stakeholderId,
                access.accessLevel,
                access.permissions || {}
            ]);
        }
    }

    /**
     * Generate tenant slug from name
     */
    private generateTenantSlug(tenantName: string): string {
        return tenantName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
    }

    /**
     * Generate database name based on tenant and banking type
     */
    private generateDatabaseName(tenantSlug: string, bankingType: BankingType): string {
        const suffix = bankingType === 'syariah' ? '_syariah' : 
                      bankingType === 'dual' ? '_dual' : '_conventional';
        return `ifrspro_tenant_${tenantSlug}${suffix}`;
    }

    /**
     * Get default features based on banking type
     */
    private getDefaultFeatures(bankingType: BankingType): object {
        const baseFeatures = {
            dashboard: true,
            basic_reports: true,
            ecl_calculations: true,
            api_access: true,
            audit_trail: true
        };

        if (bankingType === 'syariah' || bankingType === 'dual') {
            return {
                ...baseFeatures,
                islamic_banking: true,
                syariah_compliance: true,
                aaoifi_reports: true
            };
        }

        return baseFeatures;
    }

    /**
     * Get compliance settings based on banking type
     */
    private getComplianceSettings(bankingType: BankingType): object {
        if (bankingType === 'syariah' || bankingType === 'dual') {
            return {
                banking_type: bankingType,
                aaoifi_standards: true,
                syariah_audit_required: true,
                syariah_board_required: true,
                prohibited_sectors: [
                    'alcohol', 'gambling', 'pork', 'conventional_banking',
                    'adult_entertainment', 'tobacco', 'weapons'
                ]
            };
        }

        return {
            banking_type: 'conventional',
            basel_compliance: true,
            regulatory_framework: 'conventional'
        };
    }

    /**
     * Apply core database schema
     */
    private async applyCoreSchema(client: any, bankingType: BankingType): Promise<void> {
        // Core portfolio accounts table
        const portfolioSchema = `
            CREATE TABLE core.portfolio_accounts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                account_id VARCHAR(100) NOT NULL,
                customer_id VARCHAR(100) NOT NULL,
                product_type VARCHAR(100) NOT NULL,
                outstanding_amount DECIMAL(20,2) DEFAULT 0.00,
                currency_code VARCHAR(3) DEFAULT 'IDR',
                origination_date DATE NOT NULL,
                maturity_date DATE,
                reporting_date DATE NOT NULL,
                current_stage INTEGER DEFAULT 1,
                banking_type VARCHAR(20) DEFAULT '${bankingType}',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        
        await client.query(portfolioSchema);
    }

    /**
     * Apply Syariah-specific schema
     */
    private async applySyariahSchema(client: any): Promise<void> {
        const syariahSchema = `
            CREATE TABLE syariah_compliance.syariah_board_decisions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                decision_reference VARCHAR(50) UNIQUE NOT NULL,
                product_id UUID,
                contract_type VARCHAR(50),
                decision_type VARCHAR(50),
                decision_details TEXT,
                islamic_justification TEXT,
                board_members JSONB,
                decision_date DATE,
                effective_date DATE,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        
        await client.query(syariahSchema);
    }

    /**
     * Log tenant activity
     */
    private async logTenantActivity(
        tenantId: string, 
        eventType: string, 
        details: any, 
        client: any
    ): Promise<void> {
        const logQuery = `
            INSERT INTO platform_audit.global_audit_log (
                id, tenant_id, event_type, action, description,
                new_values, ip_address, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `;

        await client.query(logQuery, [
            uuidv4(),
            tenantId,
            eventType,
            'CREATE',
            `Tenant activity: ${eventType}`,
            details,
            '127.0.0.1'
        ]);
    }

    /**
     * Map database row to TenantInfo
     */
    private mapToTenantInfo(row: any): TenantInfo {
        return {
            id: row.id,
            tenantName: row.tenant_name,
            tenantSlug: row.tenant_slug,
            displayName: row.display_name,
            organizationName: row.organization_name,
            bankingType: row.banking_type,
            databaseConfig: {
                databaseName: row.database_name,
                host: row.database_host,
                port: row.database_port
            },
            status: row.status,
            subscriptionTier: row.subscription_tier,
            tenantSettings: row.tenant_settings,
            featuresEnabled: row.features_enabled,
            complianceSettings: row.compliance_settings,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            stakeholderAccessLevel: row.stakeholder_access_level
        };
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            const platformCheck = await this.platformPool.query('SELECT 1');
            const sharedCheck = await this.sharedPool.query('SELECT 1');
            return platformCheck.rows.length > 0 && sharedCheck.rows.length > 0;
        } catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Cleanup resources
     */
    async onModuleDestroy(): Promise<void> {
        await this.platformPool.end();
        await this.sharedPool.end();
    }
}
