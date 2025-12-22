#!/bin/bash
# scripts/setup/d2h4-visual-etl-designer-setup.sh
# Day 2 Hour 4: Visual ETL Designer with Advanced Capabilities

set -e
set -u

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h4-etl-designer-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Environment validation
validate_environment() {
    log_info "Validating environment for ETL Designer setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check PostgreSQL connectivity
    if ! pg_isready -h "${DB_HOST:-192.168.0.85}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" &> /dev/null; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    # Check Redis connectivity  
    if ! redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" ping &> /dev/null; then
        log_error "Redis is not accessible"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create ETL Designer directory structure
create_etl_directories() {
    log_info "Creating ETL Designer directory structure..."
    
    # Backend ETL directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl"/{designer,transformations,quality,lineage,execution}
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/etl"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/etl"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/etl"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/etl"
    
    # Frontend ETL directories
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/etl"/{designer,canvas,nodes,quality,lineage}
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/store/etl"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/hooks/etl"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/types/etl"
    
    # ETL Configuration directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/config"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/schemas"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/templates"
    
    log_success "ETL Designer directory structure created"
}

# Setup ETL database schemas
setup_etl_database() {
    log_info "Setting up ETL Designer database schemas..."
    
    # Create ETL schema in platform admin database
    psql -h "${DB_HOST:-192.168.0.85}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "ifrspro_platform_admin" << 'EOF'
-- ETL Designer Schema
CREATE SCHEMA IF NOT EXISTS etl_designer;

-- ETL Workflows Table
CREATE TABLE IF NOT EXISTS etl_designer.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_admin.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_definition JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, name, version)
);

-- ETL Transformations Table
CREATE TABLE IF NOT EXISTS etl_designer.transformations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES etl_designer.workflows(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    node_config JSONB NOT NULL,
    position JSONB NOT NULL,
    connections JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(workflow_id, node_id)
);

-- ETL Data Sources Table
CREATE TABLE IF NOT EXISTS etl_designer.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_admin.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    connection_config JSONB NOT NULL,
    schema_definition JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- ETL Execution History Table
CREATE TABLE IF NOT EXISTS etl_designer.execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES etl_designer.workflows(id) ON DELETE CASCADE,
    execution_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    execution_log JSONB,
    error_details JSONB,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ETL Data Quality Rules Table
CREATE TABLE IF NOT EXISTS etl_designer.quality_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_admin.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    rule_definition JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ETL Data Lineage Table
CREATE TABLE IF NOT EXISTS etl_designer.data_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES etl_designer.workflows(id) ON DELETE CASCADE,
    source_entity VARCHAR(255) NOT NULL,
    target_entity VARCHAR(255) NOT NULL,
    transformation_type VARCHAR(100) NOT NULL,
    lineage_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ETL Schema Evolution Table
CREATE TABLE IF NOT EXISTS etl_designer.schema_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES etl_designer.data_sources(id) ON DELETE CASCADE,
    previous_schema JSONB,
    current_schema JSONB NOT NULL,
    changes JSONB NOT NULL,
    impact_analysis JSONB,
    migration_strategy JSONB,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id ON etl_designer.workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON etl_designer.workflows(status);
CREATE INDEX IF NOT EXISTS idx_transformations_workflow_id ON etl_designer.transformations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_workflow_id ON etl_designer.execution_history(workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_status ON etl_designer.execution_history(status);
CREATE INDEX IF NOT EXISTS idx_data_lineage_workflow_id ON etl_designer.data_lineage(workflow_id);
CREATE INDEX IF NOT EXISTS idx_schema_evolution_data_source_id ON etl_designer.schema_evolution(data_source_id);

-- Grant permissions
GRANT USAGE ON SCHEMA etl_designer TO ifrspro_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA etl_designer TO ifrspro_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA etl_designer TO ifrspro_app;

EOF

    log_success "ETL Designer database schemas created"
}

# Install ETL-specific dependencies
install_etl_dependencies() {
    log_info "Installing ETL Designer dependencies..."
    
    # Backend dependencies
    cd "${PROJECT_ROOT}/packages/backend"
    
    # ETL and data processing libraries
    npm install --save \
        bull \
        bull-board \
        node-cron \
        fast-csv \
        xlsx \
        xml2js \
        ajv \
        ajv-formats \
        stream-json \
        highland \
        through2 \
        lodash.debounce \
        lodash.throttle
    
    # Development dependencies for ETL
    npm install --save-dev \
        @types/bull \
        @types/node-cron \
        @types/through2
    
    # Frontend dependencies
    cd "${PROJECT_ROOT}/packages/frontend"
    
    # ETL Designer UI libraries
    npm install --save \
        react-flow-renderer \
        @react-flow/core \
        @react-flow/controls \
        @react-flow/background \
        @react-flow/minimap \
        react-dnd \
        react-dnd-html5-backend \
        dagre \
        elkjs \
        d3-hierarchy \
        d3-selection \
        react-syntax-highlighter \
        react-json-view
    
    # Development dependencies for ETL UI
    npm install --save-dev \
        @types/react-syntax-highlighter \
        @types/d3-hierarchy \
        @types/d3-selection
    
    log_success "ETL Designer dependencies installed"
}

# Create ETL configuration files
create_etl_configuration() {
    log_info "Creating ETL Designer configuration files..."
    
    # ETL Designer configuration
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/config/etl.config.ts" << 'EOF'
// packages/backend/src/core/services/etl/config/etl.config.ts

export interface ETLConfig {
  maxConcurrentJobs: number;
  jobTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  memoryLimit: string;
  tempDirectory: string;
  logLevel: string;
}

export const ETL_CONFIG: ETLConfig = {
  maxConcurrentJobs: parseInt(process.env.ETL_MAX_CONCURRENT_JOBS || '5'),
  jobTimeout: parseInt(process.env.ETL_JOB_TIMEOUT || '300000'), // 5 minutes
  retryAttempts: parseInt(process.env.ETL_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.ETL_RETRY_DELAY || '5000'),
  batchSize: parseInt(process.env.ETL_BATCH_SIZE || '1000'),
  memoryLimit: process.env.ETL_MEMORY_LIMIT || '1GB',
  tempDirectory: process.env.ETL_TEMP_DIR || '/tmp/etl',
  logLevel: process.env.ETL_LOG_LEVEL || 'info'
};

export const NODE_TYPES = {
  SOURCE: 'source',
  TRANSFORM: 'transform',
  FILTER: 'filter',
  AGGREGATE: 'aggregate',
  JOIN: 'join',
  LOOKUP: 'lookup',
  VALIDATE: 'validate',
  OUTPUT: 'output',
  SPLIT: 'split',
  MERGE: 'merge'
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

export const CONNECTION_TYPES = {
  DATABASE: 'database',
  FILE: 'file',
  API: 'api',
  STREAM: 'stream',
  QUEUE: 'queue'
} as const;

export type ConnectionType = typeof CONNECTION_TYPES[keyof typeof CONNECTION_TYPES];
EOF

    # Create ETL environment variables
    cat >> "${PROJECT_ROOT}/.env.example" << 'EOF'

# ETL Designer Configuration
ETL_MAX_CONCURRENT_JOBS=5
ETL_JOB_TIMEOUT=300000
ETL_RETRY_ATTEMPTS=3
ETL_RETRY_DELAY=5000
ETL_BATCH_SIZE=1000
ETL_MEMORY_LIMIT=1GB
ETL_TEMP_DIR=/tmp/etl
ETL_LOG_LEVEL=info

# Redis Queue Configuration
REDIS_QUEUE_PREFIX=etl:
REDIS_QUEUE_DEFAULT_JOB_OPTIONS={"removeOnComplete":10,"removeOnFail":50}

# File Processing Configuration
FILE_UPLOAD_MAX_SIZE=100MB
FILE_UPLOAD_ALLOWED_TYPES=csv,xlsx,json,xml,txt
FILE_PROCESSING_CHUNK_SIZE=1000

EOF

    log_success "ETL Designer configuration files created"
}

# Setup Redis queues for ETL processing
setup_etl_queues() {
    log_info "Setting up Redis queues for ETL processing..."
    
    # Test Redis connection and setup queues
    redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" << 'EOF'
# Create ETL processing queues
SADD etl:queues "etl:high-priority"
SADD etl:queues "etl:normal-priority"
SADD etl:queues "etl:low-priority"
SADD etl:queues "etl:data-quality"
SADD etl:queues "etl:schema-evolution"

# Set default queue configurations
HSET etl:config:high-priority "maxConcurrency" "3"
HSET etl:config:high-priority "priority" "1"
HSET etl:config:normal-priority "maxConcurrency" "5"
HSET etl:config:normal-priority "priority" "2"
HSET etl:config:low-priority "maxConcurrency" "2"
HSET etl:config:low-priority "priority" "3"

EOF

    log_success "Redis queues for ETL processing configured"
}

# Create ETL sample templates
create_etl_templates() {
    log_info "Creating ETL Designer sample templates..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/templates"
    
    # Banking data transformation template
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/templates/banking-data-transform.json" << 'EOF'
{
  "templateId": "banking-data-transform",
  "name": "Banking Data Transformation",
  "description": "Standard banking data transformation with IFRS 9 compliance",
  "category": "banking",
  "version": "1.0.0",
  "workflow": {
    "nodes": [
      {
        "id": "source-1",
        "type": "source",
        "label": "Banking System Source",
        "position": { "x": 100, "y": 100 },
        "config": {
          "sourceType": "database",
          "connectionType": "postgresql",
          "query": "SELECT * FROM accounts WHERE status = 'active'",
          "refreshInterval": "1h"
        }
      },
      {
        "id": "validate-1",
        "type": "validate",
        "label": "Data Validation",
        "position": { "x": 300, "y": 100 },
        "config": {
          "rules": [
            {"field": "account_number", "type": "required"},
            {"field": "balance", "type": "numeric", "min": 0},
            {"field": "currency", "type": "enum", "values": ["IDR", "USD"]}
          ]
        }
      },
      {
        "id": "transform-1",
        "type": "transform",
        "label": "IFRS 9 Enrichment",
        "position": { "x": 500, "y": 100 },
        "config": {
          "transformations": [
            {"type": "add_column", "name": "risk_grade", "expression": "calculateRiskGrade(balance, payment_history)"},
            {"type": "add_column", "name": "staging", "expression": "determineStaging(risk_grade, days_past_due)"},
            {"type": "format_currency", "field": "balance", "currency": "currency"}
          ]
        }
      },
      {
        "id": "output-1",
        "type": "output",
        "label": "IFRS 9 Portfolio",
        "position": { "x": 700, "y": 100 },
        "config": {
          "outputType": "database",
          "table": "ifrs9_portfolio",
          "writeMode": "upsert",
          "keyColumns": ["account_number"]
        }
      }
    ],
    "connections": [
      {"source": "source-1", "target": "validate-1"},
      {"source": "validate-1", "target": "transform-1"},
      {"source": "transform-1", "target": "output-1"}
    ]
  }
}
EOF

    log_success "ETL Designer sample templates created"
}

# Main execution function
main() {
    log_info "🚀 Starting Day 2 Hour 4: Visual ETL Designer Setup"
    log_info "========================================================="
    
    # Validate environment
    validate_environment
    
    # Create directory structure
    create_etl_directories
    
    # Setup database schemas
    setup_etl_database
    
    # Install dependencies
    install_etl_dependencies
    
    # Create configuration files
    create_etl_configuration
    
    # Setup Redis queues
    setup_etl_queues
    
    # Create sample templates
    create_etl_templates
    
    log_success "========================================================="
    log_success "✅ Day 2 Hour 4: Visual ETL Designer Setup Completed!"
    log_success "========================================================="
    log_info "Next Steps:"
    log_info "1. Run the ETL service generation script"
    log_info "2. Start the ETL designer frontend components"
    log_info "3. Test the visual ETL workflow creation"
    log_info "4. Configure data sources and transformations"
    log_info ""
    log_info "🔗 Continue with: ./scripts/codegen/d2h4-generate-etl-services.sh"
}

# Execute main function
main "$@"