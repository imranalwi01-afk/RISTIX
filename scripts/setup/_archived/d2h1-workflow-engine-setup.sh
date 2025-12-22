#!/bin/bash
# scripts/setup/d2h1-workflow-engine-setup.sh
# DAY 2 HOUR 1: Master Workflow Engine Setup
# OBJECTIVE: Enterprise workflow automation system

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h1-workflow-engine-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Load environment variables
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
fi

# Database connection configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for workflow engine setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Install with: npm install -g pnpm"
        exit 1
    fi
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" &> /dev/null; then
        log_error "PostgreSQL database is not accessible at ${DB_HOST}:${DB_PORT}"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create workflow database schemas
setup_workflow_schemas() {
    log_info "Setting up workflow database schemas..."
    
    # Create workflow schema SQL
    local workflow_schema_sql="${PROJECT_ROOT}/database/schemas/workflow/workflow-schema.sql"
    mkdir -p "$(dirname "${workflow_schema_sql}")"
    
    cat > "${workflow_schema_sql}" << 'EOF'
-- Workflow Engine Database Schema
-- packages/backend/database/schemas/workflow/workflow-schema.sql

-- Create workflow schema
CREATE SCHEMA IF NOT EXISTS workflow;

-- Workflow definitions table
CREATE TABLE IF NOT EXISTS workflow.definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    initial_state VARCHAR(100) NOT NULL,
    final_states TEXT[] NOT NULL,
    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow.steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL REFERENCES workflow.definitions(id) ON DELETE CASCADE,
    step_key VARCHAR(100) NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('manual', 'automated', 'decision', 'parallel', 'gateway')),
    handler_type VARCHAR(50) CHECK (handler_type IN ('service', 'user', 'system', 'external')),
    handler_config JSONB DEFAULT '{}',
    timeout_seconds INTEGER DEFAULT 300,
    retry_attempts INTEGER DEFAULT 0,
    conditions JSONB DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow transitions table
CREATE TABLE IF NOT EXISTS workflow.transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL REFERENCES workflow.definitions(id) ON DELETE CASCADE,
    from_step VARCHAR(100) NOT NULL,
    to_step VARCHAR(100) NOT NULL,
    condition_expression TEXT,
    guard_conditions JSONB DEFAULT '{}',
    action_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow instances table
CREATE TABLE IF NOT EXISTS workflow.instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL REFERENCES workflow.definitions(id),
    tenant_id UUID NOT NULL,
    current_state VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'suspended', 'terminated')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    context JSONB DEFAULT '{}',
    variables JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    started_by UUID NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Workflow tasks table
CREATE TABLE IF NOT EXISTS workflow.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow.instances(id) ON DELETE CASCADE,
    step_key VARCHAR(100) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'failed', 'skipped')),
    assigned_to UUID,
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'normal',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow execution history table
CREATE TABLE IF NOT EXISTS workflow.execution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow.instances(id) ON DELETE CASCADE,
    step_key VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    from_state VARCHAR(100),
    to_state VARCHAR(100),
    executed_by UUID,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Workflow business process automation table
CREATE TABLE IF NOT EXISTS workflow.business_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    process_name VARCHAR(255) NOT NULL,
    process_type VARCHAR(100) NOT NULL,
    automation_level VARCHAR(50) DEFAULT 'semi' CHECK (automation_level IN ('manual', 'semi', 'full')),
    trigger_conditions JSONB DEFAULT '{}',
    business_rules JSONB DEFAULT '{}',
    sla_config JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow performance metrics table
CREATE TABLE IF NOT EXISTS workflow.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_definition_id UUID NOT NULL REFERENCES workflow.definitions(id),
    tenant_id UUID NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_instances INTEGER DEFAULT 0,
    completed_instances INTEGER DEFAULT 0,
    failed_instances INTEGER DEFAULT 0,
    avg_completion_time_ms BIGINT DEFAULT 0,
    min_completion_time_ms BIGINT DEFAULT 0,
    max_completion_time_ms BIGINT DEFAULT 0,
    sla_violations INTEGER DEFAULT 0,
    throughput_per_hour DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_tenant ON workflow.definitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_status ON workflow.definitions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_definition ON workflow.steps(workflow_definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_definition ON workflow.transitions(workflow_definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_definition ON workflow.instances(workflow_definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_tenant ON workflow.instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow.instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_instance ON workflow.tasks(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_assigned ON workflow.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON workflow.tasks(status);
CREATE INDEX IF NOT EXISTS idx_workflow_history_instance ON workflow.execution_history(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_business_processes_tenant ON workflow.business_processes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_performance_tenant_date ON workflow.performance_metrics(tenant_id, metric_date);

-- Grant permissions
GRANT USAGE ON SCHEMA workflow TO ifrspro_platform_app;
GRANT ALL ON ALL TABLES IN SCHEMA workflow TO ifrspro_platform_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA workflow TO ifrspro_platform_app;

EOF

    # Apply schema to platform admin database
    log_info "Applying workflow schema to platform admin database..."
    
    local platform_admin_db="ifrspro_platform_admin"
    if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${platform_admin_db}"; then
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${platform_admin_db}" -f "${workflow_schema_sql}"
        log_success "Workflow schema applied to platform admin database"
    else
        log_error "Platform admin database not found: ${platform_admin_db}"
        exit 1
    fi
}

# Create workflow engine service directories
create_workflow_directories() {
    log_info "Creating workflow engine directory structure..."
    
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    
    # Create workflow service directories
    mkdir -p "${backend_src}/core/services/workflow"
    mkdir -p "${backend_src}/api/controllers/workflow"
    mkdir -p "${backend_src}/api/routes/workflow"
    mkdir -p "${backend_src}/api/middleware/workflow"
    mkdir -p "${backend_src}/api/validators/workflow"
    mkdir -p "${backend_src}/core/models/workflow"
    mkdir -p "${backend_src}/core/repositories/workflow"
    mkdir -p "${backend_src}/utils/workflow"
    
    log_success "Workflow engine directories created"
}

# Install workflow engine dependencies
install_workflow_dependencies() {
    log_info "Installing workflow engine dependencies..."
    
    cd "${PROJECT_ROOT}"
    
    # Add workflow-specific dependencies
    local workflow_deps=(
        "node-cron@^3.0.3"
        "bull@^4.12.2"
        "ioredis@^5.3.2"
        "express-rate-limit@^7.1.5"
        "compression@^1.7.4"
        "helmet@^7.1.0"
    )
    
    for dep in "${workflow_deps[@]}"; do
        log_info "Installing ${dep}..."
        pnpm add "${dep}" --workspace-root
    done
    
    log_success "Workflow engine dependencies installed"
}

# Create workflow configuration
create_workflow_configuration() {
    log_info "Creating workflow engine configuration..."
    
    local config_dir="${PROJECT_ROOT}/packages/backend/src/config/workflow"
    mkdir -p "${config_dir}"
    
    cat > "${config_dir}/workflow.config.ts" << 'EOF'
// packages/backend/src/config/workflow/workflow.config.ts

export interface WorkflowEngineConfig {
  maxConcurrentProcesses: number;
  defaultTimeout: number;
  retryAttempts: number;
  enableParallelProcessing: boolean;
  performanceMetrics: boolean;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  scheduling: {
    enableCronJobs: boolean;
    defaultCronPattern: string;
    maxScheduledJobs: number;
  };
  sla: {
    defaultSlaHours: number;
    escalationEnabled: boolean;
    notificationChannels: string[];
  };
}

export const workflowConfig: WorkflowEngineConfig = {
  maxConcurrentProcesses: parseInt(process.env.WORKFLOW_MAX_CONCURRENT || '50'),
  defaultTimeout: parseInt(process.env.WORKFLOW_DEFAULT_TIMEOUT || '300000'), // 5 minutes
  retryAttempts: parseInt(process.env.WORKFLOW_RETRY_ATTEMPTS || '3'),
  enableParallelProcessing: process.env.WORKFLOW_PARALLEL_PROCESSING === 'true',
  performanceMetrics: process.env.WORKFLOW_PERFORMANCE_METRICS !== 'false',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_WORKFLOW_DB || '1')
  },
  scheduling: {
    enableCronJobs: process.env.WORKFLOW_CRON_ENABLED !== 'false',
    defaultCronPattern: process.env.WORKFLOW_DEFAULT_CRON || '0 9 * * *', // 9 AM daily
    maxScheduledJobs: parseInt(process.env.WORKFLOW_MAX_SCHEDULED || '100')
  },
  sla: {
    defaultSlaHours: parseInt(process.env.WORKFLOW_DEFAULT_SLA_HOURS || '24'),
    escalationEnabled: process.env.WORKFLOW_ESCALATION_ENABLED !== 'false',
    notificationChannels: ['email', 'slack']
  }
};

EOF

    log_success "Workflow configuration created"
}

# Update environment variables
update_environment_variables() {
    log_info "Updating environment variables for workflow engine..."
    
    local env_file="${PROJECT_ROOT}/.env"
    
    # Add workflow-specific environment variables if they don't exist
    local workflow_env_vars=(
        "WORKFLOW_MAX_CONCURRENT=50"
        "WORKFLOW_DEFAULT_TIMEOUT=300000"
        "WORKFLOW_RETRY_ATTEMPTS=3"
        "WORKFLOW_PARALLEL_PROCESSING=true"
        "WORKFLOW_PERFORMANCE_METRICS=true"
        "REDIS_WORKFLOW_DB=1"
        "WORKFLOW_CRON_ENABLED=true"
        "WORKFLOW_DEFAULT_CRON=0 9 * * *"
        "WORKFLOW_MAX_SCHEDULED=100"
        "WORKFLOW_DEFAULT_SLA_HOURS=24"
        "WORKFLOW_ESCALATION_ENABLED=true"
    )
    
    for env_var in "${workflow_env_vars[@]}"; do
        local var_name=$(echo "${env_var}" | cut -d'=' -f1)
        if ! grep -q "^${var_name}=" "${env_file}" 2>/dev/null; then
            echo "${env_var}" >> "${env_file}"
            log_info "Added environment variable: ${var_name}"
        fi
    done
    
    log_success "Environment variables updated"
}

# Main function
main() {
    log_info "Starting DAY 2 HOUR 1: Master Workflow Engine Setup..."
    
    # Validate environment
    validate_environment
    
    # Create workflow directories
    create_workflow_directories
    
    # Setup database schemas
    setup_workflow_schemas
    
    # Install dependencies
    install_workflow_dependencies
    
    # Create configuration
    create_workflow_configuration
    
    # Update environment variables
    update_environment_variables
    
    log_success "============================================"
    log_success "DAY 2 HOUR 1: Master Workflow Engine Setup Complete!"
    log_success "============================================"
    log_success "Next Steps:"
    log_success "1. Run: ./scripts/setup/d2h1-workflow-services.sh"
    log_success "2. Review workflow configuration in packages/backend/src/config/workflow/"
    log_success "3. Test workflow engine with sample processes"
    log_success "============================================"
}

# Execute main function with all arguments
main "$@"