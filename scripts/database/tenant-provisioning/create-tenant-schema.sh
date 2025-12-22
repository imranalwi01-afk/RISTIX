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
