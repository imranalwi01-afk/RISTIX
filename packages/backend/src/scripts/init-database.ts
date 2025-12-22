// packages/backend/src/scripts/init-databases.ts
// ✅ Complete database initialization script for all 4 databases

import { Sequelize } from 'sequelize';
import appConfig from '../config/app';
import logger from '../config/logger';

// ✅ Database configurations
const databases = [
  'ifrs9_platform_admin',
  'ifrs9_shared_services', 
  'ifrs9_tenant_demo_conventional',
  'ifrs9_tenant_demo_syariah'
];

// ✅ Create database if it doesn't exist
async function createDatabase(dbName: string): Promise<boolean> {
  try {
    logger.info(`🗄️ Creating database: ${dbName}`);
    
    // Connect to postgres database to create new database
    const postgresConnection = new Sequelize({
      host: appConfig.platformDbHost,
      port: appConfig.platformDbPort,
      dialect: 'postgres',
      username: appConfig.platformDbUser,
      password: appConfig.platformDbPassword,
      database: 'postgres',
      logging: false
    });

    await postgresConnection.authenticate();
    logger.info(`✅ Connected to PostgreSQL server`);
    
    // Check if database exists
    const [results] = await postgresConnection.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    ) as any[];

    if (results.length === 0) {
      // Create database with UTF-8 encoding
      await postgresConnection.query(`
        CREATE DATABASE "${dbName}" 
        WITH 
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.UTF-8'
        LC_CTYPE = 'en_US.UTF-8'
        TEMPLATE = template0
      `);
      logger.info(`✅ Created database: ${dbName}`);
    } else {
      logger.info(`✅ Database already exists: ${dbName}`);
    }

    await postgresConnection.close();
    return true;
  } catch (error) {
    logger.error(`❌ Failed to create database ${dbName}:`, error);
    return false;
  }
}

// ✅ Initialize database schemas
async function initializeSchema(dbName: string): Promise<boolean> {
  try {
    logger.info(`🏗️ Initializing schema for: ${dbName}`);
    
    const sequelize = new Sequelize({
      host: appConfig.platformDbHost,
      port: appConfig.platformDbPort,
      dialect: 'postgres',
      username: appConfig.platformDbUser,
      password: appConfig.platformDbPassword,
      database: dbName,
      logging: false
    });

    await sequelize.authenticate();
    
    // Enable extensions
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    
    // Create schemas based on database type
    if (dbName === 'ifrs9_platform_admin') {
      await initializePlatformSchema(sequelize);
    } else if (dbName === 'ifrs9_shared_services') {
      await initializeSharedSchema(sequelize);
    } else if (dbName.includes('tenant')) {
      await initializeTenantSchema(sequelize);
    }
    
    await sequelize.close();
    logger.info(`✅ Schema initialized for: ${dbName}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to initialize schema for ${dbName}:`, error);
    return false;
  }
}

// ✅ Platform admin database schema
async function initializePlatformSchema(sequelize: Sequelize): Promise<void> {
  await sequelize.query(`
    -- Users table for platform admin, consultants, regulators
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      "fullName" VARCHAR(255) NOT NULL,
      "stakeholderType" VARCHAR(50) NOT NULL DEFAULT 'platform_admin',
      role VARCHAR(100) NOT NULL DEFAULT 'USER',
      "isActive" BOOLEAN DEFAULT true,
      "lastLogin" TIMESTAMPTZ,
      preferences JSONB DEFAULT '{}',
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_stakeholder ON users("stakeholderType");
    CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");
  `);

  await sequelize.query(`
    -- Banking institutions table
    CREATE TABLE IF NOT EXISTS banking_institutions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      "bankingType" VARCHAR(50) NOT NULL,
      country VARCHAR(10) DEFAULT 'ID',
      tier VARCHAR(50) DEFAULT 'basic',
      "databaseName" VARCHAR(100) NOT NULL,
      "isActive" BOOLEAN DEFAULT true,
      settings JSONB DEFAULT '{}',
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_banking_institutions_slug ON banking_institutions(slug);
    CREATE INDEX IF NOT EXISTS idx_banking_institutions_type ON banking_institutions("bankingType");
    CREATE INDEX IF NOT EXISTS idx_banking_institutions_active ON banking_institutions("isActive");
  `);

  logger.info('✅ Platform admin schema created');
}

// ✅ Shared services database schema
async function initializeSharedSchema(sequelize: Sequelize): Promise<void> {
  await sequelize.query(`
    -- ECL Jobs table
    CREATE TABLE IF NOT EXISTS ecl_jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "tenantId" UUID NOT NULL,
      "jobName" VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      parameters JSONB DEFAULT '{}',
      results JSONB,
      "startedAt" TIMESTAMPTZ,
      "completedAt" TIMESTAMPTZ,
      "errorMessage" TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_ecl_jobs_tenant ON ecl_jobs("tenantId");
    CREATE INDEX IF NOT EXISTS idx_ecl_jobs_status ON ecl_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_ecl_jobs_created ON ecl_jobs("createdAt");
  `);

  await sequelize.query(`
    -- Consultant projects table
    CREATE TABLE IF NOT EXISTS consultant_projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "tenantId" UUID NOT NULL,
      "consultantId" UUID NOT NULL,
      "projectName" VARCHAR(255) NOT NULL,
      "projectType" VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      "startDate" DATE,
      "endDate" DATE,
      description TEXT,
      deliverables JSONB DEFAULT '[]',
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_consultant_projects_tenant ON consultant_projects("tenantId");
    CREATE INDEX IF NOT EXISTS idx_consultant_projects_consultant ON consultant_projects("consultantId");
    CREATE INDEX IF NOT EXISTS idx_consultant_projects_status ON consultant_projects(status);
  `);

  logger.info('✅ Shared services schema created');
}

// ✅ Tenant database schema
async function initializeTenantSchema(sequelize: Sequelize): Promise<void> {
  await sequelize.query(`
    -- Tenant users table
    CREATE TABLE IF NOT EXISTS tenant_users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      "fullName" VARCHAR(255) NOT NULL,
      "bankingType" VARCHAR(50) NOT NULL,
      department VARCHAR(100),
      position VARCHAR(100),
      permissions JSONB DEFAULT '{}',
      "isActive" BOOLEAN DEFAULT true,
      "lastLogin" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
    CREATE INDEX IF NOT EXISTS idx_tenant_users_banking_type ON tenant_users("bankingType");
    CREATE INDEX IF NOT EXISTS idx_tenant_users_active ON tenant_users("isActive");
  `);

  await sequelize.query(`
    -- Portfolio accounts table
    CREATE TABLE IF NOT EXISTS portfolio_accounts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "accountNumber" VARCHAR(100) NOT NULL UNIQUE,
      "customerId" UUID NOT NULL,
      "productType" VARCHAR(100) NOT NULL,
      balance DECIMAL(20,2) DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'IDR',
      stage INTEGER DEFAULT 1,
      "pdRating" VARCHAR(50),
      "lgdRating" VARCHAR(50),
      "isActive" BOOLEAN DEFAULT true,
      metadata JSONB DEFAULT '{}',
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_portfolio_accounts_number ON portfolio_accounts("accountNumber");
    CREATE INDEX IF NOT EXISTS idx_portfolio_accounts_customer ON portfolio_accounts("customerId");
    CREATE INDEX IF NOT EXISTS idx_portfolio_accounts_stage ON portfolio_accounts(stage);
    CREATE INDEX IF NOT EXISTS idx_portfolio_accounts_active ON portfolio_accounts("isActive");
  `);

  await sequelize.query(`
    -- Customers table
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "customerNumber" VARCHAR(100) NOT NULL UNIQUE,
      "fullName" VARCHAR(255) NOT NULL,
      "customerType" VARCHAR(50) NOT NULL,
      "riskRating" VARCHAR(50),
      "industryCode" VARCHAR(20),
      "countryCode" VARCHAR(10) DEFAULT 'ID',
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_customers_number ON customers("customerNumber");
    CREATE INDEX IF NOT EXISTS idx_customers_type ON customers("customerType");
    CREATE INDEX IF NOT EXISTS idx_customers_active ON customers("isActive");
  `);

  logger.info('✅ Tenant schema created');
}

// ✅ Insert basic banking institutions
async function insertBankingInstitutions(): Promise<void> {
  try {
    const sequelize = new Sequelize({
      host: appConfig.platformDbHost,
      port: appConfig.platformDbPort,
      dialect: 'postgres',
      username: appConfig.platformDbUser,
      password: appConfig.platformDbPassword,
      database: 'ifrs9_platform_admin',
      logging: false
    });

    await sequelize.authenticate();

    // Check if banking institutions already exist
    const [existing] = await sequelize.query(
      'SELECT COUNT(*) as count FROM banking_institutions'
    ) as any[];

    if (existing[0].count > 0) {
      logger.info('✅ Banking institutions already exist');
      await sequelize.close();
      return;
    }

    // Insert demo banking institutions
    await sequelize.query(`
      INSERT INTO banking_institutions (name, slug, "bankingType", "databaseName", tier, settings) VALUES
      ('Metro Commercial Bank', 'metro-commercial', 'conventional', 'ifrs9_tenant_demo_conventional', 'professional', '{"demo": true}'),
      ('Barakah Islamic Bank', 'barakah-islamic', 'syariah', 'ifrs9_tenant_demo_syariah', 'professional', '{"demo": true, "syariahCompliant": true}'),
      ('Universal Financial Group', 'universal-financial', 'dual', 'ifrs9_tenant_demo_conventional', 'enterprise', '{"demo": true, "dualBanking": true}')
    `);

    await sequelize.close();
    logger.info('✅ Banking institutions inserted');
  } catch (error) {
    logger.error('❌ Failed to insert banking institutions:', error);
  }
}

// ✅ Main initialization function
async function initializeAllDatabases(): Promise<void> {
  try {
    logger.info('🚀 Starting database initialization...');
    
    let successCount = 0;
    let errorCount = 0;

    // Create all databases
    for (const dbName of databases) {
      const created = await createDatabase(dbName);
      if (created) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    logger.info(`📊 Database creation summary: ${successCount} success, ${errorCount} errors`);

    // Initialize schemas
    for (const dbName of databases) {
      const initialized = await initializeSchema(dbName);
      if (!initialized) {
        errorCount++;
      }
    }

    // Insert basic data
    await insertBankingInstitutions();

    logger.info('✅ Database initialization completed!');
    logger.info('📋 Databases created:');
    databases.forEach(db => logger.info(`  - ${db}`));
    logger.info('');
    logger.info('🔗 Connection details:');
    logger.info(`  Host: ${appConfig.platformDbHost}:${appConfig.platformDbPort}`);
    logger.info(`  User: ${appConfig.platformDbUser}`);
    logger.info('');
    logger.info('▶️ Next steps:');
    logger.info('  1. Run: pnpm run db:seed (to create 28 dummy users)');
    logger.info('  2. Run: pnpm run dev (to start the application)');

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// ✅ Execute if called directly
if (require.main === module) {
  initializeAllDatabases()
    .then(() => {
      logger.info('🎉 Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeAllDatabases;