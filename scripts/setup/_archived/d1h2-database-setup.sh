#!/bin/bash
# scripts/setup/d1h2-database-setup.sh
# DAY 1 HOUR 2: Multi-Tenant Database Setup - IFRS 9 Multi-Tenant Platform
# Based on: 001-006-005-TodoList-v2.md and actual database backup schemas

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration following coding standards
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h2-database-setup-$(date +%Y%m%d-%H%M%S).log"

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

# Generate database configuration service with actual backup schemas
generate_database_config_service() {
    log_info "Generating database configuration service with actual backup schemas..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/config"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/database/config/database.config.ts" << 'EOF'
// packages/backend/src/core/database/config/database.config.ts
// Multi-Tenant Database Configuration - IFRS 9 Multi-Tenant Platform
// Based on: actual database backup schemas and 001-006-008-coding-standards.md

import { Sequelize, Options as SequelizeOptions } from 'sequelize';
import { configService } from '../../services/configuration/configuration.service';

interface DatabaseConnection {
  sequelize: Sequelize;
  type: 'platform' | 'shared' | 'tenant';
  tenantId?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
}

interface TenantDatabaseConfig {
  tenantId: string;
  tenantSlug: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  databaseName: string;
  host: string;
  port: number;
}

export class DatabaseConfigurationService {
  private static instance: DatabaseConfigurationService;
  private connections: Map<string, DatabaseConnection> = new Map();
  private platformConnection: Sequelize | null = null;
  private sharedServicesConnection: Sequelize | null = null;

  public static getInstance(): DatabaseConfigurationService {
    if (!DatabaseConfigurationService.instance) {
      DatabaseConfigurationService.instance = new DatabaseConfigurationService();
    }
    return DatabaseConfigurationService.instance;
  }

  private constructor() {
    this.initializePlatformConnection();
    this.initializeSharedServicesConnection();
  }

  // MANDATORY: Platform Admin Database Connection (following backup schema)
  private initializePlatformConnection(): void {
    const config = configService.getConfiguration();
    
    const sequelizeOptions: SequelizeOptions = {
      host: config.database.host || process.env.DB_HOST || 'localhost',
      port: config.database.port || parseInt(process.env.DB_PORT || '5432'),
      database: 'ifrspro_platform_admin', // MANDATORY: exact name from backup
      username: config.database.username || process.env.DB_USER || 'postgres',
      password: config.database.password || process.env.DB_PASSWORD || 'postgres',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000'),
        idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000')
      },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        application_name: 'ifrs9_platform_admin'
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        paranoid: false // Actual deletes for platform admin
      },
      // MANDATORY: Schema search path following backup structure
      searchPath: ['platform_admin', 'platform_audit', 'platform_analytics', 'platform_billing', 'public']
    };

    this.platformConnection = new Sequelize(sequelizeOptions);
    
    this.connections.set('platform', {
      sequelize: this.platformConnection,
      type: 'platform'
    });
  }

  // MANDATORY: Shared Services Database Connection
  private initializeSharedServicesConnection(): void {
    const config = configService.getConfiguration();
    
    const sequelizeOptions: SequelizeOptions = {
      host: config.database.host || process.env.DB_HOST || 'localhost',
      port: config.database.port || parseInt(process.env.DB_PORT || '5432'),
      database: 'ifrspro_shared_services', // MANDATORY: exact name from backup
      username: config.database.username || process.env.DB_USER || 'postgres',
      password: config.database.password || process.env.DB_PASSWORD || 'postgres',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: Math.floor(parseInt(process.env.DB_POOL_MAX || '20') / 2),
        min: Math.floor(parseInt(process.env.DB_POOL_MIN || '5') / 2),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000'),
        idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000')
      },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        application_name: 'ifrs9_shared_services'
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      // MANDATORY: Schema search path for shared services
      searchPath: ['shared_services', 'reference_data', 'calculation_engine', 'public']
    };

    this.sharedServicesConnection = new Sequelize(sequelizeOptions);
    
    this.connections.set('shared', {
      sequelize: this.sharedServicesConnection,
      type: 'shared'
    });
  }

  // MANDATORY: Tenant Database Connection (database-per-tenant isolation)
  public async getTenantConnection(tenantId: string): Promise<Sequelize> {
    const connectionKey = `tenant_${tenantId}`;
    
    // Return existing connection if available
    if (this.connections.has(connectionKey)) {
      return this.connections.get(connectionKey)!.sequelize;
    }

    // Get tenant configuration from platform admin
    const tenantConfig = await this.getTenantDatabaseConfig(tenantId);
    if (!tenantConfig) {
      throw new Error(`Tenant configuration not found for tenant: ${tenantId}`);
    }

    // Create new tenant connection
    const tenantConnection = await this.createTenantConnection(tenantConfig);
    
    this.connections.set(connectionKey, {
      sequelize: tenantConnection,
      type: 'tenant',
      tenantId: tenantConfig.tenantId,
      bankingType: tenantConfig.bankingType
    });

    return tenantConnection;
  }

  // MANDATORY: Get tenant database configuration from platform admin
  private async getTenantDatabaseConfig(tenantId: string): Promise<TenantDatabaseConfig | null> {
    if (!this.platformConnection) {
      throw new Error('Platform connection not initialized');
    }

    try {
      const query = `
        SELECT 
          id as tenant_id,
          tenant_slug,
          banking_type,
          database_name,
          database_host,
          database_port
        FROM platform_admin.tenants 
        WHERE id = :tenantId AND status = 'active'
      `;

      const [results] = await this.platformConnection.query(query, {
        replacements: { tenantId },
        type: 'SELECT'
      });

      if (!results || results.length === 0) {
        return null;
      }

      const tenant = results[0] as any;
      
      return {
        tenantId: tenant.tenant_id,
        tenantSlug: tenant.tenant_slug,
        bankingType: tenant.banking_type,
        databaseName: tenant.database_name,
        host: tenant.database_host || 'localhost',
        port: tenant.database_port || 5432
      };
    } catch (error) {
      console.error('Error fetching tenant database config:', error);
      return null;
    }
  }

  // MANDATORY: Create tenant-specific database connection
  private async createTenantConnection(tenantConfig: TenantDatabaseConfig): Promise<Sequelize> {
    const sequelizeOptions: SequelizeOptions = {
      host: tenantConfig.host,
      port: tenantConfig.port,
      database: tenantConfig.databaseName,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? 
        (sql: string) => console.log(`[TENANT:${tenantConfig.tenantSlug}] ${sql}`) : 
        false,
      pool: {
        max: 10, // Smaller pool per tenant
        min: 2,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000'),
        idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000')
      },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        application_name: `ifrs9_tenant_${tenantConfig.tenantSlug}`
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        paranoid: true // Soft deletes for tenant data
      },
      // MANDATORY: Schema search path based on banking type (from backup structure)
      searchPath: tenantConfig.bankingType === 'syariah' 
        ? ['core', 'calculation', 'staging', 'audit', 'workflow', 'configuration', 'analytics', 'public']
        : ['core', 'calculation', 'staging', 'audit', 'workflow', 'configuration', 'analytics', 'public']
    };

    const tenantSequelize = new Sequelize(sequelizeOptions);
    
    // Test connection
    await tenantSequelize.authenticate();
    
    return tenantSequelize;
  }

  // Get platform admin connection
  public getPlatformConnection(): Sequelize {
    if (!this.platformConnection) {
      throw new Error('Platform connection not initialized');
    }
    return this.platformConnection;
  }

  // Get shared services connection
  public getSharedServicesConnection(): Sequelize {
    if (!this.sharedServicesConnection) {
      throw new Error('Shared services connection not initialized');
    }
    return this.sharedServicesConnection;
  }

  // MANDATORY: Connection health check
  public async healthCheck(): Promise<{
    platform: boolean;
    shared: boolean;
    tenants: Record<string, boolean>;
  }> {
    const health = {
      platform: false,
      shared: false,
      tenants: {} as Record<string, boolean>
    };

    try {
      if (this.platformConnection) {
        await this.platformConnection.authenticate();
        health.platform = true;
      }
    } catch (error) {
      console.error('Platform database health check failed:', error);
    }

    try {
      if (this.sharedServicesConnection) {
        await this.sharedServicesConnection.authenticate();
        health.shared = true;
      }
    } catch (error) {
      console.error('Shared services database health check failed:', error);
    }

    // Check tenant connections
    for (const [key, connection] of this.connections) {
      if (key.startsWith('tenant_')) {
        try {
          await connection.sequelize.authenticate();
          health.tenants[key] = true;
        } catch (error) {
          health.tenants[key] = false;
        }
      }
    }

    return health;
  }

  // MANDATORY: Close all connections
  public async closeAllConnections(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const [key, connection] of this.connections) {
      closePromises.push(
        connection.sequelize.close().catch(error => 
          console.error(`Error closing connection ${key}:`, error)
        )
      );
    }

    if (this.platformConnection) {
      closePromises.push(
        this.platformConnection.close().catch(error => 
          console.error('Error closing platform connection:', error)
        )
      );
    }

    if (this.sharedServicesConnection) {
      closePromises.push(
        this.sharedServicesConnection.close().catch(error => 
          console.error('Error closing shared services connection:', error)
        )
      );
    }

    await Promise.all(closePromises);
    this.connections.clear();
    this.platformConnection = null;
    this.sharedServicesConnection = null;
  }
}

// Export singleton instance
export const databaseConfig = DatabaseConfigurationService.getInstance();

// Export types
export type {
  DatabaseConnection,
  TenantDatabaseConfig
};
EOF
    
    log_success "Database configuration service generated"
}

# Generate database migration script for platform admin
generate_platform_admin_migration() {
    log_info "Generating platform admin database migration..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/migrations/platform"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/database/migrations/platform/001-create-platform-admin.ts" << 'EOF'
// packages/backend/src/core/database/migrations/platform/001-create-platform-admin.ts
// Platform Admin Database Migration - IFRS 9 Multi-Tenant Platform
// Based on: ifrspro_platform_admin_backup.sql actual schema

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Enable extensions
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // Create schemas
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_admin');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_audit');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_analytics');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_billing');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_integration');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS platform_monitoring');
  await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS monitoring');

  // Create platform_admin.tenants table (from actual backup)
  await queryInterface.createTable({
    schema: 'platform_admin',
    tableName: 'tenants'
  }, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tenant_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    tenant_slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    organization_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    banking_type: {
      type: DataTypes.ENUM('conventional', 'syariah', 'dual'),
      allowNull: false
    },
    database_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    database_host: {
      type: DataTypes.STRING(100),
      defaultValue: 'localhost'
    },
    database_port: {
      type: DataTypes.INTEGER,
      defaultValue: 5432
    },
    status: {
      type: DataTypes.ENUM('provisioning', 'active', 'suspended', 'inactive'),
      defaultValue: 'provisioning'
    },
    subscription_tier: {
      type: DataTypes.ENUM('basic', 'standard', 'premium', 'enterprise'),
      defaultValue: 'basic'
    },
    tenant_settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    features_enabled: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    compliance_settings: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_by: {
      type: DataTypes.STRING(100),
      defaultValue: 'system'
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  });

  // Create platform_admin.platform_users table (from actual backup)
  await queryInterface.createTable({
    schema: 'platform_admin',
    tableName: 'platform_users'
  }, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'platform_admin'
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create global audit log (from actual backup)
  await queryInterface.createTable({
    schema: 'platform_audit',
    tableName: 'global_audit_log'
  }, {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create indexes (from actual backup)
  await queryInterface.addIndex('platform_admin.tenants', ['tenant_slug'], {
    name: 'idx_tenants_slug'
  });
  await queryInterface.addIndex('platform_admin.tenants', ['banking_type'], {
    name: 'idx_tenants_banking_type'
  });
  await queryInterface.addIndex('platform_admin.tenants', ['status'], {
    name: 'idx_tenants_status'
  });
  await queryInterface.addIndex('platform_admin.platform_users', ['email'], {
    name: 'idx_platform_users_email'
  });
  await queryInterface.addIndex('platform_audit.global_audit_log', ['tenant_id'], {
    name: 'idx_global_audit_tenant'
  });
  await queryInterface.addIndex('platform_audit.global_audit_log', ['created_at'], {
    name: 'idx_global_audit_created'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable({ schema: 'platform_audit', tableName: 'global_audit_log' });
  await queryInterface.dropTable({ schema: 'platform_admin', tableName: 'platform_users' });
  await queryInterface.dropTable({ schema: 'platform_admin', tableName: 'tenants' });
  
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_monitoring CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_integration CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_billing CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_analytics CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_audit CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS platform_admin CASCADE');
  await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS monitoring CASCADE');
}
EOF
    
    log_success "Platform admin migration generated"
}

# Generate tenant database schema generator script
generate_tenant_schema_generator() {
    log_info "Generating tenant database schema generator..."
    
    mkdir -p "${PROJECT_ROOT}/scripts/database/tenant-provisioning"
    
    cat > "${PROJECT_ROOT}/scripts/database/tenant-provisioning/create-tenant-schema.sh" << 'EOF'
#!/bin/bash
# scripts/database/tenant-provisioning/create-tenant-schema.sh
# Tenant Database Schema Generator - Based on actual backup schemas

set -e

# Parameters
TENANT_SLUG=$1
BANKING_TYPE=$2
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}

if [[ -z "$TENANT_SLUG" ]] || [[ -z "$BANKING_TYPE" ]]; then
    echo "Usage: $0 <tenant_slug> <banking_type>"
    echo "Banking types: conventional, syariah, dual"
    exit 1
fi

DATABASE_NAME="ifrspro_tenant_${TENANT_SLUG}_${BANKING_TYPE}"

echo "🔧 Creating tenant database schema: $DATABASE_NAME"

# Create database if not exists
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DATABASE_NAME" 2>/dev/null || echo "Database already exists"

# Apply schema based on banking type
if [[ "$BANKING_TYPE" == "syariah" ]] || [[ "$BANKING_TYPE" == "dual" ]]; then
    echo "📋 Applying Syariah banking schema..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DATABASE_NAME" << 'SQL'
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS calculation;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS configuration;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Syariah-specific tables
CREATE TABLE IF NOT EXISTS core.syariah_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_type VARCHAR(50) NOT NULL,
    contract_name VARCHAR(200) NOT NULL,
    description TEXT,
    compliance_rules JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core.syariah_screening (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID,
    screening_date DATE DEFAULT CURRENT_DATE,
    compliance_status VARCHAR(20) DEFAULT 'compliant',
    screening_criteria JSONB DEFAULT '{}'::jsonb,
    screening_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio accounts with Syariah fields
CREATE TABLE IF NOT EXISTS core.portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    account_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    contract_id VARCHAR(100),
    product_type VARCHAR(100) NOT NULL,
    outstanding_amount NUMERIC(20,2) DEFAULT 0.00 NOT NULL,
    committed_amount NUMERIC(20,2) DEFAULT 0.00,
    original_amount NUMERIC(20,2) DEFAULT 0.00 NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'IDR' NOT NULL,
    origination_date DATE NOT NULL,
    maturity_date DATE,
    reporting_date DATE NOT NULL,
    current_stage INTEGER DEFAULT 1 NOT NULL,
    previous_stage INTEGER,
    stage_change_date DATE,
    customer_name VARCHAR(200),
    customer_type VARCHAR(50),
    industry_sector VARCHAR(100),
    internal_rating VARCHAR(20),
    external_rating VARCHAR(20),
    pd_12m NUMERIC(10,8),
    pd_lifetime NUMERIC(10,8),
    lgd NUMERIC(8,6),
    ead NUMERIC(20,2),
    ecl_12m NUMERIC(20,2) DEFAULT 0.00,
    ecl_lifetime NUMERIC(20,2) DEFAULT 0.00,
    -- Syariah-specific fields
    is_syariah_compliant BOOLEAN DEFAULT true,
    syariah_contract_type VARCHAR(50),
    syariah_structure VARCHAR(100),
    profit_sharing_ratio NUMERIC(8,6),
    account_status VARCHAR(20) DEFAULT 'active' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON SCHEMA core IS 'Core tenant data with Syariah banking support';
SQL
else
    echo "📋 Applying Conventional banking schema..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DATABASE_NAME" << 'SQL'
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS calculation;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS configuration;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Portfolio accounts for conventional banking
CREATE TABLE IF NOT EXISTS core.portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    account_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    contract_id VARCHAR(100),
    product_type VARCHAR(100) NOT NULL,
    outstanding_amount NUMERIC(20,2) DEFAULT 0.00 NOT NULL,
    committed_amount NUMERIC(20,2) DEFAULT 0.00,
    original_amount NUMERIC(20,2) DEFAULT 0.00 NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'IDR' NOT NULL,
    origination_date DATE NOT NULL,
    maturity_date DATE,
    reporting_date DATE NOT NULL,
    current_stage INTEGER DEFAULT 1 NOT NULL,
    previous_stage INTEGER,
    stage_change_date DATE,
    customer_name VARCHAR(200),
    customer_type VARCHAR(50),
    industry_sector VARCHAR(100),
    internal_rating VARCHAR(20),
    external_rating VARCHAR(20),
    pd_12m NUMERIC(10,8),
    pd_lifetime NUMERIC(10,8),
    lgd NUMERIC(8,6),
    ead NUMERIC(20,2),
    ecl_12m NUMERIC(20,2) DEFAULT 0.00,
    ecl_lifetime NUMERIC(20,2) DEFAULT 0.00,
    account_status VARCHAR(20) DEFAULT 'active' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON SCHEMA core IS 'Core tenant data for conventional banking';
SQL
fi

echo "✅ Tenant database schema created successfully: $DATABASE_NAME"
EOF

    chmod +x "${PROJECT_ROOT}/scripts/database/tenant-provisioning/create-tenant-schema.sh"
    
    log_success "Tenant schema generator created"
}

# Generate database seeder for demo data
generate_database_seeder() {
    log_info "Generating database seeder for demo data..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/database/seeders"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/database/seeders/001-demo-tenants.ts" << 'EOF'
// packages/backend/src/core/database/seeders/001-demo-tenants.ts
// Demo Tenants Seeder - IFRS 9 Multi-Tenant Platform
// Based on: actual backup data from ifrspro_platform_admin_backup.sql

import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Insert demo conventional tenant (from actual backup)
  await queryInterface.bulkInsert('platform_admin.tenants', [
    {
      id: '61c42f2e-14ee-470e-88f3-eae34b51b838',
      tenant_name: 'demo_tenant',
      tenant_slug: 'demotenant',
      display_name: 'Demo Bank',
      organization_name: 'Demo Organization',
      banking_type: 'conventional',
      database_name: 'ifrspro_tenant_demo_conventional',
      database_host: 'localhost',
      database_port: 5432,
      status: 'active',
      subscription_tier: 'basic',
      tenant_settings: JSON.stringify({
        language: 'en',
        timezone: 'UTC',
        currency_default: 'USD'
      }),
      features_enabled: JSON.stringify({
        dashboard: true,
        basic_reports: true,
        ecl_calculations: true
      }),
      compliance_settings: JSON.stringify({
        banking_type: 'conventional',
        regulatory_framework: 'OJK_Conventional'
      }),
      created_at: new Date('2025-07-17 15:05:25.224162+07'),
      updated_at: new Date('2025-07-17 15:05:25.224162+07'),
      created_by: 'system'
    },
    // Insert demo syariah tenant (from actual backup)
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      tenant_name: 'demo_syariah',
      tenant_slug: 'demosyariah',
      display_name: 'Demo Islamic Bank',
      organization_name: 'Demo Islamic Banking Organization',
      banking_type: 'syariah',
      database_name: 'ifrspro_tenant_demo_syariah',
      database_host: 'localhost',
      database_port: 5432,
      status: 'active',
      subscription_tier: 'basic',
      tenant_settings: JSON.stringify({
        language: 'en',
        timezone: 'UTC',
        currency_default: 'USD',
        islamic_calendar: true,
        aaoifi_compliance: true,
        syariah_board_approval: true,
        syariah_audit_frequency: 12,
        profit_calculation_method: 'declining_balance'
      }),
      features_enabled: JSON.stringify({
        dashboard: true,
        api_access: true,
        audit_trail: true,
        basic_reports: true,
        stress_testing: true,
        islamic_banking: true,
        ecl_calculations: true,
        advanced_analytics: true,
        syariah_compliance: true,
        workflow_management: true
      }),
      compliance_settings: JSON.stringify({
        banking_type: 'syariah',
        aaoifi_standards: true,
        prohibited_sectors: [
          'alcohol', 'gambling', 'pork', 'conventional_banking',
          'adult_entertainment', 'tobacco', 'weapons'
        ],
        regulatory_framework: 'OJK_Islamic',
        compliance_monitoring: true,
        syariah_audit_required: true,
        syariah_board_required: true
      }),
      created_at: new Date('2025-07-17 22:24:16.813544+07'),
      updated_at: new Date('2025-07-17 22:24:16.813544+07'),
      created_by: 'system'
    }
  ]);

  // Insert platform admin user (from actual backup)
  await queryInterface.bulkInsert('platform_admin.platform_users', [
    {
      id: '11111111-1111-1111-1111-111111111111',
      username: 'admin',
      email: 'admin@ifrspro.id',
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjWEpJWQK', // 'admin123'
      full_name: 'Platform Administrator',
      role: 'super_admin',
      permissions: JSON.stringify([
        'platform:*', 'tenant:*', 'user:*', 'audit:*'
      ]),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Log tenant creation in audit trail (from actual backup)
  await queryInterface.bulkInsert('platform_audit.global_audit_log', [
    {
      id: '1d122ed5-1648-4703-9f73-c4b62d365ac5',
      tenant_id: '61c42f2e-14ee-470e-88f3-eae34b51b838',
      user_id: null,
      event_type: 'TENANT_REGISTRATION',
      action: 'CREATE',
      entity_type: 'TENANT',
      entity_id: '61c42f2e-14ee-470e-88f3-eae34b51b838',
      description: 'Demo conventional banking tenant registered',
      old_values: null,
      new_values: JSON.stringify({
        tenant_name: 'demo_tenant',
        banking_type: 'conventional',
        database_name: 'ifrspro_tenant_demo_conventional',
        subscription_tier: 'basic'
      }),
      ip_address: '127.0.0.1',
      created_at: new Date('2025-07-17 15:05:25.224162+07')
    },
    {
      id: 'eb4cd810-7bd6-40ac-b3be-12b95d89b9f4',
      tenant_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      user_id: null,
      event_type: 'TENANT_REGISTRATION',
      action: 'CREATE',
      entity_type: 'TENANT',
      entity_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      description: 'Demo Syariah banking tenant registered',
      old_values: null,
      new_values: JSON.stringify({
        tenant_name: 'demo_syariah',
        banking_type: 'syariah',
        database_name: 'ifrspro_tenant_demo_syariah',
        organization_name: 'Demo Islamic Banking Organization',
        subscription_tier: 'basic'
      }),
      ip_address: '127.0.0.1',
      created_at: new Date('2025-07-17 22:24:16.816708+07')
    }
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('platform_audit.global_audit_log', {
    tenant_id: ['61c42f2e-14ee-470e-88f3-eae34b51b838', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee']
  });
  
  await queryInterface.bulkDelete('platform_admin.platform_users', {
    email: 'admin@ifrspro.id'
  });
  
  await queryInterface.bulkDelete('platform_admin.tenants', {
    id: ['61c42f2e-14ee-470e-88f3-eae34b51b838', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee']
  });
}
EOF
    
    log_success "Database seeder generated"
}

# Main execution function following coding standards
main() {
    log_info "🚀 Starting Day 1 Hour 2: Multi-Tenant Database Setup"
    log_info "Following TodoList-v2.md database-per-tenant architecture requirements"
    
    # Step 1: Generate database configuration service
    generate_database_config_service
    
    # Step 2: Generate platform admin migration
    generate_platform_admin_migration
    
    # Step 3: Generate tenant schema generator
    generate_tenant_schema_generator
    
    # Step 4: Generate database seeder
    generate_database_seeder
    
    log_success "✅ Day 1 Hour 2: Multi-Tenant Database Setup completed successfully!"
    log_info "📍 Project location: ${PROJECT_ROOT}"
    log_info "📋 Log file: ${LOG_FILE}"
    log_info "🔄 Next step: Run './scripts/setup/d1h2-tenant-services.sh'"
    
    echo ""
    echo "🎯 DAY 1 HOUR 2 COMPLETED - MULTI-TENANT DATABASE SETUP"
    echo "✅ Database configuration service with actual backup schemas"
    echo "✅ Platform admin migration with production tables"
    echo "✅ Tenant schema generator for conventional/syariah banking"
    echo "✅ Database seeder with demo tenants from actual backup"
    echo ""
    echo "🗄️ Database architecture ready:"
    echo "   • Platform Admin DB: ifrspro_platform_admin"
    echo "   • Shared Services DB: ifrspro_shared_services"
    echo "   • Tenant DBs: ifrspro_tenant_{slug}_{banking_type}"
    echo "   • Complete database-per-tenant isolation"
    echo ""
    echo "🔄 Next: Run './scripts/setup/d1h2-tenant-services.sh' for tenant management services"
    echo ""
}

# Execute main function with all arguments
main "$@"