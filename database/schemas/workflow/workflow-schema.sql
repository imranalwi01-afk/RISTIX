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

