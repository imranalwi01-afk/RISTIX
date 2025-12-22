#!/bin/bash
# scripts/codegen/d2h4-generate-etl-services.sh
# Day 2 Hour 4: Generate Visual ETL Designer Services and Components

set -e
set -u

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h4-etl-codegen-$(date +%Y%m%d-%H%M%S).log"

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

# Generate ETL TypeScript types
generate_etl_types() {
    log_info "Generating ETL TypeScript types..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/types/etl.types.ts" << 'EOF'
// packages/backend/src/types/etl.types.ts

export interface ETLWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  workflowDefinition: WorkflowDefinition;
  status: WorkflowStatus;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowDefinition {
  nodes: ETLNode[];
  connections: NodeConnection[];
  settings: WorkflowSettings;
}

export interface ETLNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  config: NodeConfig;
  metadata?: NodeMetadata;
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  metadata?: ConnectionMetadata;
}

export interface Position {
  x: number;
  y: number;
}

export interface NodeConfig {
  [key: string]: any;
}

export interface NodeMetadata {
  description?: string;
  tags?: string[];
  lastModified?: Date;
  performance?: PerformanceMetrics;
}

export interface ConnectionMetadata {
  dataType?: string;
  sampleSize?: number;
  latency?: number;
}

export interface WorkflowSettings {
  parallelExecution: boolean;
  errorHandling: ErrorHandlingStrategy;
  retryPolicy: RetryPolicy;
  monitoring: MonitoringConfig;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  recordsProcessed: number;
  throughput: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  errorRate: number;
  latency: number;
  memoryUsage: number;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'deprecated' | 'error';
export type NodeType = 'source' | 'transform' | 'filter' | 'aggregate' | 'join' | 'lookup' | 'validate' | 'output' | 'split' | 'merge';
export type ErrorHandlingStrategy = 'stop' | 'skip' | 'retry' | 'log';

export interface DataSource {
  id: string;
  tenantId: string;
  name: string;
  sourceType: SourceType;
  connectionConfig: ConnectionConfig;
  schemaDefinition?: SchemaDefinition;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SourceType = 'database' | 'file' | 'api' | 'stream' | 'queue';

export interface ConnectionConfig {
  [key: string]: any;
}

export interface SchemaDefinition {
  fields: FieldDefinition[];
  constraints?: SchemaConstraints;
}

export interface FieldDefinition {
  name: string;
  type: DataType;
  nullable: boolean;
  primaryKey?: boolean;
  description?: string;
}

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'decimal' | 'json' | 'array';

export interface SchemaConstraints {
  uniqueKeys?: string[][];
  foreignKeys?: ForeignKeyConstraint[];
  checks?: CheckConstraint[];
}

export interface ForeignKeyConstraint {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface CheckConstraint {
  name: string;
  expression: string;
}

export interface ExecutionHistory {
  id: string;
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  executionLog?: ExecutionLog;
  errorDetails?: ErrorDetails;
  metrics?: ExecutionMetrics;
}

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface ExecutionLog {
  steps: ExecutionStep[];
  warnings: LogEntry[];
  info: LogEntry[];
}

export interface ExecutionStep {
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  recordsProcessed?: number;
  errors?: ErrorDetails[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: any;
}

export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  context?: any;
}

export interface ExecutionMetrics {
  totalRecordsProcessed: number;
  totalExecutionTime: number;
  avgThroughput: number;
  memoryPeak: number;
  nodeMetrics: { [nodeId: string]: PerformanceMetrics };
}

export interface QualityRule {
  id: string;
  tenantId: string;
  name: string;
  ruleType: QualityRuleType;
  ruleDefinition: QualityRuleDefinition;
  severity: QualitySeverity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QualityRuleType = 'completeness' | 'uniqueness' | 'validity' | 'consistency' | 'accuracy' | 'timeliness';
export type QualitySeverity = 'info' | 'warning' | 'error' | 'critical';

export interface QualityRuleDefinition {
  targetField?: string;
  condition: string;
  threshold?: number;
  customLogic?: string;
}

export interface DataLineage {
  id: string;
  workflowId: string;
  sourceEntity: string;
  targetEntity: string;
  transformationType: string;
  lineageMetadata: LineageMetadata;
}

export interface LineageMetadata {
  transformationDetails: string;
  impactRadius: string[];
  dependencies: string[];
  lastUpdated: Date;
}

export interface SchemaEvolution {
  id: string;
  dataSourceId: string;
  previousSchema?: SchemaDefinition;
  currentSchema: SchemaDefinition;
  changes: SchemaChange[];
  impactAnalysis: ImpactAnalysis;
  migrationStrategy: MigrationStrategy;
  appliedAt: Date;
}

export interface SchemaChange {
  type: 'add' | 'remove' | 'modify' | 'rename';
  field: string;
  oldValue?: any;
  newValue?: any;
  impact: 'breaking' | 'non-breaking' | 'warning';
}

export interface ImpactAnalysis {
  affectedWorkflows: string[];
  breakingChanges: SchemaChange[];
  recommendedActions: string[];
}

export interface MigrationStrategy {
  steps: MigrationStep[];
  rollbackPlan: MigrationStep[];
  validationRules: string[];
}

export interface MigrationStep {
  order: number;
  action: string;
  sql?: string;
  rollbackSql?: string;
}
EOF

    log_success "ETL TypeScript types generated"
}

# Generate ETL Workflow Service
generate_etl_workflow_service() {
    log_info "Generating ETL Workflow Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/workflow.service.ts" << 'EOF'
// packages/backend/src/core/services/etl/workflow.service.ts

import { injectable } from 'inversify';
import { Pool } from 'pg';
import { ETLWorkflow, WorkflowDefinition, ExecutionHistory } from '../../../types/etl.types';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../../../utils/logger.service';
import { ETLExecutionEngine } from './execution/execution.engine';
import { DataLineageTracker } from './lineage/lineage.tracker';

@injectable()
export class ETLWorkflowService {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService,
    private executionEngine: ETLExecutionEngine,
    private lineageTracker: DataLineageTracker
  ) {}

  async createWorkflow(
    tenantId: string,
    name: string,
    description: string,
    workflowDefinition: WorkflowDefinition,
    createdBy: string
  ): Promise<ETLWorkflow> {
    const pool = await this.databaseService.getPool('platform_admin');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate workflow definition
      await this.validateWorkflowDefinition(workflowDefinition);

      // Create workflow
      const workflowQuery = `
        INSERT INTO etl_designer.workflows (
          tenant_id, name, description, workflow_definition, 
          status, version, created_by
        )
        VALUES ($1, $2, $3, $4, 'draft', 1, $5)
        RETURNING *
      `;

      const workflowResult = await client.query(workflowQuery, [
        tenantId,
        name,
        description,
        JSON.stringify(workflowDefinition),
        createdBy
      ]);

      const workflow = workflowResult.rows[0];

      // Create transformation nodes
      for (const node of workflowDefinition.nodes) {
        await this.createTransformationNode(client, workflow.id, node);
      }

      // Track data lineage
      await this.lineageTracker.trackWorkflowLineage(workflow.id, workflowDefinition);

      await client.query('COMMIT');

      this.logger.info(`ETL Workflow created: ${workflow.id} for tenant: ${tenantId}`);

      return this.mapWorkflowFromDb(workflow);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to create ETL workflow: ${error.message}`);
      throw new Error(`Failed to create ETL workflow: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async getWorkflow(workflowId: string, tenantId: string): Promise<ETLWorkflow | null> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT w.*, 
               json_agg(
                 json_build_object(
                   'id', t.id,
                   'nodeId', t.node_id,
                   'nodeType', t.node_type,
                   'nodeConfig', t.node_config,
                   'position', t.position,
                   'connections', t.connections
                 )
               ) FILTER (WHERE t.id IS NOT NULL) as transformations
        FROM etl_designer.workflows w
        LEFT JOIN etl_designer.transformations t ON w.id = t.workflow_id
        WHERE w.id = $1 AND w.tenant_id = $2
        GROUP BY w.id
      `;

      const result = await pool.query(query, [workflowId, tenantId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapWorkflowFromDb(result.rows[0]);
    } catch (error) {
      this.logger.error(`Failed to get ETL workflow: ${error.message}`);
      throw new Error(`Failed to get ETL workflow: ${error.message}`);
    }
  }

  async updateWorkflow(
    workflowId: string,
    tenantId: string,
    updates: Partial<ETLWorkflow>
  ): Promise<ETLWorkflow> {
    const pool = await this.databaseService.getPool('platform_admin');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate workflow definition if updated
      if (updates.workflowDefinition) {
        await this.validateWorkflowDefinition(updates.workflowDefinition);
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updates.name) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name);
      }

      if (updates.description) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updates.description);
      }

      if (updates.workflowDefinition) {
        updateFields.push(`workflow_definition = $${paramIndex++}`);
        updateValues.push(JSON.stringify(updates.workflowDefinition));
        
        updateFields.push(`version = version + 1`);
      }

      if (updates.status) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updates.status);
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(workflowId, tenantId);

      const updateQuery = `
        UPDATE etl_designer.workflows 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);

      if (result.rows.length === 0) {
        throw new Error('Workflow not found');
      }

      // Update transformation nodes if workflow definition changed
      if (updates.workflowDefinition) {
        await this.updateTransformationNodes(client, workflowId, updates.workflowDefinition);
        await this.lineageTracker.updateWorkflowLineage(workflowId, updates.workflowDefinition);
      }

      await client.query('COMMIT');

      const workflow = result.rows[0];
      this.logger.info(`ETL Workflow updated: ${workflowId}`);

      return this.mapWorkflowFromDb(workflow);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to update ETL workflow: ${error.message}`);
      throw new Error(`Failed to update ETL workflow: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async deleteWorkflow(workflowId: string, tenantId: string): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if workflow has running executions
      const executionQuery = `
        SELECT COUNT(*) as running_count
        FROM etl_designer.execution_history
        WHERE workflow_id = $1 AND status = 'running'
      `;

      const executionResult = await client.query(executionQuery, [workflowId]);
      
      if (parseInt(executionResult.rows[0].running_count) > 0) {
        throw new Error('Cannot delete workflow with running executions');
      }

      // Delete workflow (cascade will handle related records)
      const deleteQuery = `
        DELETE FROM etl_designer.workflows
        WHERE id = $1 AND tenant_id = $2
      `;

      const result = await client.query(deleteQuery, [workflowId, tenantId]);

      if (result.rowCount === 0) {
        throw new Error('Workflow not found');
      }

      await client.query('COMMIT');

      this.logger.info(`ETL Workflow deleted: ${workflowId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to delete ETL workflow: ${error.message}`);
      throw new Error(`Failed to delete ETL workflow: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async executeWorkflow(workflowId: string, tenantId: string): Promise<string> {
    try {
      const workflow = await this.getWorkflow(workflowId, tenantId);
      
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (workflow.status !== 'active') {
        throw new Error('Only active workflows can be executed');
      }

      const executionId = await this.executionEngine.execute(workflow);
      
      this.logger.info(`ETL Workflow execution started: ${workflowId}, execution: ${executionId}`);
      
      return executionId;
    } catch (error) {
      this.logger.error(`Failed to execute ETL workflow: ${error.message}`);
      throw new Error(`Failed to execute ETL workflow: ${error.message}`);
    }
  }

  async getExecutionHistory(
    workflowId: string,
    tenantId: string,
    limit = 50,
    offset = 0
  ): Promise<ExecutionHistory[]> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT eh.*
        FROM etl_designer.execution_history eh
        JOIN etl_designer.workflows w ON eh.workflow_id = w.id
        WHERE eh.workflow_id = $1 AND w.tenant_id = $2
        ORDER BY eh.start_time DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [workflowId, tenantId, limit, offset]);

      return result.rows.map(row => ({
        id: row.id,
        workflowId: row.workflow_id,
        executionId: row.execution_id,
        status: row.status,
        startTime: row.start_time,
        endTime: row.end_time,
        executionLog: row.execution_log,
        errorDetails: row.error_details,
        metrics: row.metrics
      }));
    } catch (error) {
      this.logger.error(`Failed to get execution history: ${error.message}`);
      throw new Error(`Failed to get execution history: ${error.message}`);
    }
  }

  private async validateWorkflowDefinition(definition: WorkflowDefinition): Promise<void> {
    // Validate nodes
    if (!definition.nodes || definition.nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    // Validate node IDs are unique
    const nodeIds = definition.nodes.map(node => node.id);
    const uniqueNodeIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueNodeIds.size) {
      throw new Error('Node IDs must be unique');
    }

    // Validate connections reference valid nodes
    for (const connection of definition.connections) {
      if (!nodeIds.includes(connection.source)) {
        throw new Error(`Connection source node not found: ${connection.source}`);
      }
      if (!nodeIds.includes(connection.target)) {
        throw new Error(`Connection target node not found: ${connection.target}`);
      }
    }

    // Validate no circular dependencies
    this.validateNoCycles(definition.nodes, definition.connections);
  }

  private validateNoCycles(nodes: any[], connections: any[]): void {
    const graph: { [key: string]: string[] } = {};
    
    // Build adjacency list
    nodes.forEach(node => {
      graph[node.id] = [];
    });

    connections.forEach(conn => {
      graph[conn.source].push(conn.target);
    });

    // DFS to detect cycles
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      for (const neighbor of graph[nodeId]) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of Object.keys(graph)) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          throw new Error('Workflow contains circular dependencies');
        }
      }
    }
  }

  private async createTransformationNode(client: any, workflowId: string, node: any): Promise<void> {
    const query = `
      INSERT INTO etl_designer.transformations (
        workflow_id, node_id, node_type, node_config, position, connections
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await client.query(query, [
      workflowId,
      node.id,
      node.type,
      JSON.stringify(node.config),
      JSON.stringify(node.position),
      JSON.stringify(node.connections || [])
    ]);
  }

  private async updateTransformationNodes(
    client: any,
    workflowId: string,
    definition: WorkflowDefinition
  ): Promise<void> {
    // Delete existing nodes
    await client.query(
      'DELETE FROM etl_designer.transformations WHERE workflow_id = $1',
      [workflowId]
    );

    // Insert updated nodes
    for (const node of definition.nodes) {
      await this.createTransformationNode(client, workflowId, node);
    }
  }

  private mapWorkflowFromDb(row: any): ETLWorkflow {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      workflowDefinition: row.workflow_definition,
      status: row.status,
      version: row.version,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
EOF

    log_success "ETL Workflow Service generated"
}

# Generate ETL Execution Engine
generate_etl_execution_engine() {
    log_info "Generating ETL Execution Engine..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/execution"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/execution/execution.engine.ts" << 'EOF'
// packages/backend/src/core/services/etl/execution/execution.engine.ts

import { injectable } from 'inversify';
import Bull, { Queue, Job } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { ETLWorkflow, ExecutionHistory, ETLNode } from '../../../../types/etl.types';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { ETL_CONFIG } from '../config/etl.config';
import { TransformationProcessor } from './transformation.processor';
import { DataQualityEngine } from '../quality/quality.engine';

@injectable()
export class ETLExecutionEngine {
  private executionQueue: Queue;
  private priorityQueues: { [key: string]: Queue };

  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService,
    private transformationProcessor: TransformationProcessor,
    private qualityEngine: DataQualityEngine
  ) {
    this.initializeQueues();
  }

  private initializeQueues(): void {
    // Main execution queue
    this.executionQueue = new Bull('etl:execution', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: ETL_CONFIG.retryAttempts,
        backoff: {
          type: 'exponential',
          delay: ETL_CONFIG.retryDelay
        }
      }
    });

    // Priority queues
    this.priorityQueues = {
      'high': new Bull('etl:high-priority', { redis: this.getRedisConfig() }),
      'normal': new Bull('etl:normal-priority', { redis: this.getRedisConfig() }),
      'low': new Bull('etl:low-priority', { redis: this.getRedisConfig() })
    };

    // Setup queue processors
    this.setupQueueProcessors();
  }

  private getRedisConfig() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    };
  }

  private setupQueueProcessors(): void {
    // Main execution processor
    this.executionQueue.process('workflow-execution', ETL_CONFIG.maxConcurrentJobs, this.processWorkflow.bind(this));

    // Priority queue processors
    Object.entries(this.priorityQueues).forEach(([priority, queue]) => {
      queue.process('node-execution', this.getMaxConcurrency(priority), this.processNode.bind(this));
    });

    // Error handling
    this.executionQueue.on('failed', (job, err) => {
      this.logger.error(`ETL execution failed: ${job.id}, error: ${err.message}`);
    });

    this.executionQueue.on('completed', (job) => {
      this.logger.info(`ETL execution completed: ${job.id}`);
    });
  }

  private getMaxConcurrency(priority: string): number {
    const concurrencyMap: { [key: string]: number } = {
      'high': 3,
      'normal': 5,
      'low': 2
    };
    return concurrencyMap[priority] || 2;
  }

  async execute(workflow: ETLWorkflow): Promise<string> {
    const executionId = uuidv4();

    try {
      // Create execution history record
      await this.createExecutionHistory(workflow.id, executionId);

      // Add workflow to execution queue
      const job = await this.executionQueue.add('workflow-execution', {
        workflowId: workflow.id,
        executionId,
        workflow
      }, {
        jobId: executionId,
        timeout: ETL_CONFIG.jobTimeout
      });

      this.logger.info(`ETL workflow queued for execution: ${workflow.id}, execution: ${executionId}`);

      return executionId;
    } catch (error) {
      this.logger.error(`Failed to queue ETL workflow: ${error.message}`);
      throw new Error(`Failed to queue ETL workflow: ${error.message}`);
    }
  }

  private async processWorkflow(job: Job): Promise<void> {
    const { workflowId, executionId, workflow } = job.data;

    try {
      await this.updateExecutionStatus(executionId, 'running');

      this.logger.info(`Starting ETL workflow execution: ${workflowId}`);

      // Topological sort of nodes based on connections
      const executionOrder = this.getExecutionOrder(workflow.workflowDefinition.nodes, workflow.workflowDefinition.connections);

      // Execute nodes in order
      const executionResults: { [nodeId: string]: any } = {};
      
      for (const nodeId of executionOrder) {
        const node = workflow.workflowDefinition.nodes.find(n => n.id === nodeId);
        
        if (!node) {
          throw new Error(`Node not found: ${nodeId}`);
        }

        // Add node to appropriate priority queue
        const priority = this.getNodePriority(node);
        const nodeJob = await this.priorityQueues[priority].add('node-execution', {
          workflowId,
          executionId,
          node,
          previousResults: executionResults
        });

        // Wait for node completion
        const nodeResult = await nodeJob.finished();
        executionResults[nodeId] = nodeResult;

        // Update progress
        job.progress((Object.keys(executionResults).length / executionOrder.length) * 100);
      }

      // Workflow completed successfully
      await this.updateExecutionStatus(executionId, 'completed', {
        totalRecordsProcessed: this.calculateTotalRecords(executionResults),
        executionOrder,
        nodeResults: executionResults
      });

      this.logger.info(`ETL workflow execution completed: ${workflowId}`);

    } catch (error) {
      await this.updateExecutionStatus(executionId, 'failed', null, {
        code: 'WORKFLOW_EXECUTION_ERROR',
        message: error.message,
        stack: error.stack
      });

      this.logger.error(`ETL workflow execution failed: ${workflowId}, error: ${error.message}`);
      throw error;
    }
  }

  private async processNode(job: Job): Promise<any> {
    const { workflowId, executionId, node, previousResults } = job.data;

    try {
      this.logger.info(`Processing ETL node: ${node.id} in workflow: ${workflowId}`);

      const startTime = new Date();

      // Get input data based on node connections
      const inputData = this.getNodeInputData(node, previousResults);

      // Validate input data quality
      if (node.type !== 'source') {
        await this.qualityEngine.validateData(inputData, node.config.qualityRules || []);
      }

      // Process the node based on its type
      let result;
      switch (node.type) {
        case 'source':
          result = await this.transformationProcessor.processSource(node, inputData);
          break;
        case 'transform':
          result = await this.transformationProcessor.processTransform(node, inputData);
          break;
        case 'filter':
          result = await this.transformationProcessor.processFilter(node, inputData);
          break;
        case 'aggregate':
          result = await this.transformationProcessor.processAggregate(node, inputData);
          break;
        case 'join':
          result = await this.transformationProcessor.processJoin(node, inputData);
          break;
        case 'validate':
          result = await this.transformationProcessor.processValidate(node, inputData);
          break;
        case 'output':
          result = await this.transformationProcessor.processOutput(node, inputData);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();

      // Log node execution
      await this.logNodeExecution(executionId, node.id, startTime, endTime, 'completed', result);

      this.logger.info(`ETL node completed: ${node.id}, execution time: ${executionTime}ms`);

      return result;

    } catch (error) {
      await this.logNodeExecution(executionId, node.id, new Date(), new Date(), 'failed', null, {
        code: 'NODE_EXECUTION_ERROR',
        message: error.message,
        stack: error.stack
      });

      this.logger.error(`ETL node failed: ${node.id}, error: ${error.message}`);
      throw error;
    }
  }

  private getExecutionOrder(nodes: ETLNode[], connections: any[]): string[] {
    // Build adjacency list
    const graph: { [key: string]: string[] } = {};
    const inDegree: { [key: string]: number } = {};

    // Initialize
    nodes.forEach(node => {
      graph[node.id] = [];
      inDegree[node.id] = 0;
    });

    // Build graph
    connections.forEach(conn => {
      graph[conn.source].push(conn.target);
      inDegree[conn.target]++;
    });

    // Topological sort using Kahn's algorithm
    const queue: string[] = [];
    const result: string[] = [];

    // Find nodes with no incoming edges
    Object.keys(inDegree).forEach(nodeId => {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      // Remove this node from graph
      graph[nodeId].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }

    if (result.length !== nodes.length) {
      throw new Error('Workflow contains circular dependencies');
    }

    return result;
  }

  private getNodePriority(node: ETLNode): string {
    // Determine priority based on node type and configuration
    if (node.config.priority) {
      return node.config.priority;
    }

    // Default priorities by node type
    const priorityMap: { [key: string]: string } = {
      'source': 'high',
      'validate': 'high',
      'transform': 'normal',
      'filter': 'normal',
      'aggregate': 'low',
      'join': 'low',
      'output': 'high'
    };

    return priorityMap[node.type] || 'normal';
  }

  private getNodeInputData(node: ETLNode, previousResults: { [nodeId: string]: any }): any {
    // Find input connections for this node
    const inputData: any[] = [];

    // For source nodes, no input data needed
    if (node.type === 'source') {
      return null;
    }

    // Get input from connected nodes
    Object.keys(previousResults).forEach(sourceNodeId => {
      // Check if this source node connects to current node
      // This would need to be enhanced with actual connection logic
      if (previousResults[sourceNodeId]) {
        inputData.push(previousResults[sourceNodeId]);
      }
    });

    return inputData.length === 1 ? inputData[0] : inputData;
  }

  private calculateTotalRecords(executionResults: { [nodeId: string]: any }): number {
    let total = 0;
    Object.values(executionResults).forEach(result => {
      if (result && result.recordCount) {
        total += result.recordCount;
      }
    });
    return total;
  }

  private async createExecutionHistory(workflowId: string, executionId: string): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      INSERT INTO etl_designer.execution_history (
        workflow_id, execution_id, status, start_time
      )
      VALUES ($1, $2, 'running', NOW())
    `;

    await pool.query(query, [workflowId, executionId]);
  }

  private async updateExecutionStatus(
    executionId: string,
    status: string,
    metrics?: any,
    errorDetails?: any
  ): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      UPDATE etl_designer.execution_history
      SET status = $1, end_time = NOW(), metrics = $2, error_details = $3
      WHERE execution_id = $4
    `;

    await pool.query(query, [status, JSON.stringify(metrics), JSON.stringify(errorDetails), executionId]);
  }

  private async logNodeExecution(
    executionId: string,
    nodeId: string,
    startTime: Date,
    endTime: Date,
    status: string,
    result?: any,
    error?: any
  ): Promise<void> {
    // This would log individual node execution details
    // Implementation depends on your logging strategy
    this.logger.info(`Node execution logged: ${nodeId}, status: ${status}`);
  }

  async pauseExecution(executionId: string): Promise<void> {
    const job = await this.executionQueue.getJob(executionId);
    if (job) {
      await job.pause();
      await this.updateExecutionStatus(executionId, 'paused');
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const job = await this.executionQueue.getJob(executionId);
    if (job) {
      await job.resume();
      await this.updateExecutionStatus(executionId, 'running');
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const job = await this.executionQueue.getJob(executionId);
    if (job) {
      await job.remove();
      await this.updateExecutionStatus(executionId, 'cancelled');
    }
  }
}
EOF

    log_success "ETL Execution Engine generated"
}

# Generate Transformation Processor
generate_transformation_processor() {
    log_info "Generating Transformation Processor..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/execution/transformation.processor.ts" << 'EOF'
// packages/backend/src/core/services/etl/execution/transformation.processor.ts

import { injectable } from 'inversify';
import { ETLNode } from '../../../../types/etl.types';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import * as csv from 'fast-csv';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

@injectable()
export class TransformationProcessor {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async processSource(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;

    switch (config.sourceType) {
      case 'database':
        return await this.processDatabaseSource(config);
      case 'file':
        return await this.processFileSource(config);
      case 'api':
        return await this.processApiSource(config);
      default:
        throw new Error(`Unknown source type: ${config.sourceType}`);
    }
  }

  async processTransform(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData) {
      throw new Error('Transform node requires input data');
    }

    let data = Array.isArray(inputData) ? inputData : [inputData];

    // Apply transformations sequentially
    for (const transformation of config.transformations || []) {
      data = await this.applyTransformation(data, transformation);
    }

    return {
      data,
      recordCount: data.length,
      schema: this.inferSchema(data)
    };
  }

  async processFilter(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData || !inputData.data) {
      throw new Error('Filter node requires input data');
    }

    let filteredData = inputData.data;

    // Apply filters
    if (config.conditions) {
      for (const condition of config.conditions) {
        filteredData = filteredData.filter((record: any) => 
          this.evaluateCondition(record, condition)
        );
      }
    }

    return {
      data: filteredData,
      recordCount: filteredData.length,
      schema: inputData.schema,
      originalCount: inputData.recordCount,
      filteredCount: inputData.recordCount - filteredData.length
    };
  }

  async processAggregate(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData || !inputData.data) {
      throw new Error('Aggregate node requires input data');
    }

    const { groupBy, aggregations } = config;
    const data = inputData.data;

    // Group data
    const grouped = this.groupData(data, groupBy);
    
    // Apply aggregations
    const aggregatedData = Object.keys(grouped).map(key => {
      const group = grouped[key];
      const result: any = {};

      // Add grouping fields
      if (Array.isArray(groupBy)) {
        groupBy.forEach((field: string, index: number) => {
          result[field] = key.split('|')[index];
        });
      } else {
        result[groupBy] = key;
      }

      // Apply aggregation functions
      for (const agg of aggregations) {
        result[agg.outputField || `${agg.function}_${agg.field}`] = 
          this.applyAggregation(group, agg.field, agg.function);
      }

      return result;
    });

    return {
      data: aggregatedData,
      recordCount: aggregatedData.length,
      schema: this.inferSchema(aggregatedData),
      originalCount: inputData.recordCount
    };
  }

  async processJoin(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!Array.isArray(inputData) || inputData.length < 2) {
      throw new Error('Join node requires at least two input datasets');
    }

    const [leftData, rightData] = inputData;
    const { joinType, leftKey, rightKey } = config;

    const joinedData = this.performJoin(
      leftData.data,
      rightData.data,
      leftKey,
      rightKey,
      joinType
    );

    return {
      data: joinedData,
      recordCount: joinedData.length,
      schema: this.mergeSchemas(leftData.schema, rightData.schema)
    };
  }

  async processValidate(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData || !inputData.data) {
      throw new Error('Validate node requires input data');
    }

    const validationResults: any[] = [];
    const validRecords: any[] = [];
    const invalidRecords: any[] = [];

    for (const record of inputData.data) {
      const recordValidation = this.validateRecord(record, config.rules || []);
      
      if (recordValidation.isValid) {
        validRecords.push(record);
      } else {
        invalidRecords.push({
          ...record,
          _validationErrors: recordValidation.errors
        });
      }

      validationResults.push(recordValidation);
    }

    return {
      data: config.includeInvalid ? [...validRecords, ...invalidRecords] : validRecords,
      recordCount: validRecords.length,
      schema: inputData.schema,
      validation: {
        totalRecords: inputData.recordCount,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        validationRate: (validRecords.length / inputData.recordCount) * 100,
        errors: validationResults.filter(v => !v.isValid)
      }
    };
  }

  async processOutput(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData) {
      throw new Error('Output node requires input data');
    }

    switch (config.outputType) {
      case 'database':
        return await this.processDatabaseOutput(config, inputData);
      case 'file':
        return await this.processFileOutput(config, inputData);
      case 'api':
        return await this.processApiOutput(config, inputData);
      default:
        throw new Error(`Unknown output type: ${config.outputType}`);
    }
  }

  private async processDatabaseSource(config: any): Promise<any> {
    const { connectionId, query, database } = config;
    
    // Get database connection based on connectionId or use tenant database
    const pool = await this.databaseService.getPool(database || 'tenant');
    
    const result = await pool.query(query);
    
    return {
      data: result.rows,
      recordCount: result.rows.length,
      schema: this.inferSchemaFromDbResult(result.fields)
    };
  }

  private async processFileSource(config: any): Promise<any> {
    const { filePath, fileType, options = {} } = config;

    switch (fileType.toLowerCase()) {
      case 'csv':
        return await this.processCsvFile(filePath, options);
      case 'xlsx':
      case 'xls':
        return await this.processExcelFile(filePath, options);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private async processApiSource(config: any): Promise<any> {
    const { url, method = 'GET', headers = {}, body } = config;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const records = Array.isArray(data) ? data : [data];

    return {
      data: records,
      recordCount: records.length,
      schema: this.inferSchema(records)
    };
  }

  private async applyTransformation(data: any[], transformation: any): Promise<any[]> {
    const { type, ...params } = transformation;

    switch (type) {
      case 'add_column':
        return data.map(record => ({
          ...record,
          [params.name]: this.evaluateExpression(record, params.expression)
        }));
      
      case 'remove_column':
        return data.map(record => {
          const newRecord = { ...record };
          delete newRecord[params.field];
          return newRecord;
        });
      
      case 'rename_column':
        return data.map(record => {
          const newRecord = { ...record };
          newRecord[params.newName] = newRecord[params.oldName];
          delete newRecord[params.oldName];
          return newRecord;
        });
      
      case 'format_currency':
        return data.map(record => ({
          ...record,
          [params.field]: this.formatCurrency(record[params.field], params.currency)
        }));
      
      case 'calculate_age':
        return data.map(record => ({
          ...record,
          [params.outputField]: this.calculateAge(record[params.dateField])
        }));
      
      default:
        throw new Error(`Unknown transformation type: ${type}`);
    }
  }

  private evaluateCondition(record: any, condition: any): boolean {
    const { field, operator, value } = condition;
    const recordValue = record[field];

    switch (operator) {
      case 'equals':
        return recordValue === value;
      case 'not_equals':
        return recordValue !== value;
      case 'greater_than':
        return recordValue > value;
      case 'less_than':
        return recordValue < value;
      case 'contains':
        return String(recordValue).includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(recordValue);
      case 'is_null':
        return recordValue == null;
      case 'is_not_null':
        return recordValue != null;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private groupData(data: any[], groupBy: string | string[]): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};

    data.forEach(record => {
      let key: string;
      
      if (Array.isArray(groupBy)) {
        key = groupBy.map(field => record[field]).join('|');
      } else {
        key = record[groupBy];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    });

    return grouped;
  }

  private applyAggregation(group: any[], field: string, func: string): any {
    switch (func) {
      case 'count':
        return group.length;
      case 'sum':
        return group.reduce((sum, record) => sum + (parseFloat(record[field]) || 0), 0);
      case 'avg':
        const sum = group.reduce((sum, record) => sum + (parseFloat(record[field]) || 0), 0);
        return sum / group.length;
      case 'min':
        return Math.min(...group.map(record => parseFloat(record[field]) || 0));
      case 'max':
        return Math.max(...group.map(record => parseFloat(record[field]) || 0));
      case 'first':
        return group[0][field];
      case 'last':
        return group[group.length - 1][field];
      default:
        throw new Error(`Unknown aggregation function: ${func}`);
    }
  }

  private performJoin(
    leftData: any[],
    rightData: any[],
    leftKey: string,
    rightKey: string,
    joinType: string
  ): any[] {
    const result: any[] = [];

    switch (joinType) {
      case 'inner':
        leftData.forEach(leftRecord => {
          const rightMatches = rightData.filter(rightRecord => 
            leftRecord[leftKey] === rightRecord[rightKey]
          );
          rightMatches.forEach(rightRecord => {
            result.push({ ...leftRecord, ...rightRecord });
          });
        });
        break;

      case 'left':
        leftData.forEach(leftRecord => {
          const rightMatches = rightData.filter(rightRecord => 
            leftRecord[leftKey] === rightRecord[rightKey]
          );
          if (rightMatches.length > 0) {
            rightMatches.forEach(rightRecord => {
              result.push({ ...leftRecord, ...rightRecord });
            });
          } else {
            result.push(leftRecord);
          }
        });
        break;

      default:
        throw new Error(`Unsupported join type: ${joinType}`);
    }

    return result;
  }

  private validateRecord(record: any, rules: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
      const { field, type, ...params } = rule;
      const value = record[field];

      switch (type) {
        case 'required':
          if (value == null || value === '') {
            errors.push(`Field ${field} is required`);
          }
          break;
        case 'numeric':
          if (isNaN(value)) {
            errors.push(`Field ${field} must be numeric`);
          }
          if (params.min != null && value < params.min) {
            errors.push(`Field ${field} must be >= ${params.min}`);
          }
          if (params.max != null && value > params.max) {
            errors.push(`Field ${field} must be <= ${params.max}`);
          }
          break;
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Field ${field} must be a string`);
          }
          if (params.minLength != null && value.length < params.minLength) {
            errors.push(`Field ${field} must be at least ${params.minLength} characters`);
          }
          break;
        case 'enum':
          if (!params.values.includes(value)) {
            errors.push(`Field ${field} must be one of: ${params.values.join(', ')}`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async processDatabaseOutput(config: any, inputData: any): Promise<any> {
    const { table, writeMode = 'insert', keyColumns } = config;
    const pool = await this.databaseService.getPool('tenant');

    let recordsAffected = 0;

    if (writeMode === 'upsert' && keyColumns) {
      // Implement upsert logic
      for (const record of inputData.data) {
        const result = await this.upsertRecord(pool, table, record, keyColumns);
        recordsAffected += result.rowCount || 0;
      }
    } else {
      // Simple insert
      const columns = Object.keys(inputData.data[0]);
      const values = inputData.data.map((record: any) => 
        columns.map(col => record[col])
      );

      const placeholders = values.map((_, index) => 
        `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(', ')})`
      ).join(', ');

      const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
      const flatValues = values.flat();

      const result = await pool.query(query, flatValues);
      recordsAffected = result.rowCount || 0;
    }

    return {
      success: true,
      recordsAffected,
      table,
      writeMode
    };
  }

  private async upsertRecord(pool: any, table: string, record: any, keyColumns: string[]): Promise<any> {
    const columns = Object.keys(record);
    const values = Object.values(record);
    
    const insertColumns = columns.join(', ');
    const insertPlaceholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const updateSet = columns
      .filter(col => !keyColumns.includes(col))
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');
    
    const conflictColumns = keyColumns.join(', ');
    
    const query = `
      INSERT INTO ${table} (${insertColumns})
      VALUES (${insertPlaceholders})
      ON CONFLICT (${conflictColumns})
      DO UPDATE SET ${updateSet}
    `;

    return await pool.query(query, values);
  }

  private async processFileOutput(config: any, inputData: any): Promise<any> {
    const { filePath, fileType, options = {} } = config;

    switch (fileType.toLowerCase()) {
      case 'csv':
        return await this.writeCsvFile(filePath, inputData.data, options);
      case 'xlsx':
        return await this.writeExcelFile(filePath, inputData.data, options);
      default:
        throw new Error(`Unsupported output file type: ${fileType}`);
    }
  }

  private async processApiOutput(config: any, inputData: any): Promise<any> {
    const { url, method = 'POST', headers = {} } = config;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(inputData.data)
    });

    if (!response.ok) {
      throw new Error(`API output failed: ${response.statusText}`);
    }

    return {
      success: true,
      response: await response.json(),
      recordsSent: inputData.recordCount
    };
  }

  private inferSchema(data: any[]): any {
    if (data.length === 0) return {};

    const schema: any = {};
    const sample = data[0];

    Object.keys(sample).forEach(key => {
      const value = sample[key];
      schema[key] = {
        type: typeof value,
        nullable: data.some(record => record[key] == null)
      };
    });

    return schema;
  }

  private inferSchemaFromDbResult(fields: any[]): any {
    const schema: any = {};

    fields.forEach(field => {
      schema[field.name] = {
        type: this.mapDbTypeToJs(field.dataTypeID),
        nullable: true // Assume nullable unless specified
      };
    });

    return schema;
  }

  private mapDbTypeToJs(dataTypeID: number): string {
    // PostgreSQL OID mappings
    const typeMap: { [key: number]: string } = {
      16: 'boolean',
      20: 'number',
      21: 'number',
      23: 'number',
      25: 'string',
      1114: 'date',
      1184: 'date'
    };

    return typeMap[dataTypeID] || 'string';
  }

  private evaluateExpression(record: any, expression: string): any {
    // Simple expression evaluator
    // In production, you'd want a more robust solution
    try {
      // Replace field references with actual values
      let evaluatedExpression = expression;
      Object.keys(record).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluatedExpression = evaluatedExpression.replace(regex, JSON.stringify(record[key]));
      });

      // Evaluate the expression (be careful with eval in production!)
      return Function(`"use strict"; return (${evaluatedExpression})`)();
    } catch (error) {
      this.logger.warn(`Failed to evaluate expression: ${expression}, error: ${error.message}`);
      return null;
    }
  }

  private formatCurrency(value: any, currency: string): string {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR'
    }).format(numValue);
  }

  private calculateAge(dateValue: any): number {
    const birthDate = new Date(dateValue);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }

  private async processCsvFile(filePath: string, options: any): Promise<any> {
    // Implementation would read CSV file
    // Simplified for brevity
    throw new Error('CSV file processing not implemented');
  }

  private async processExcelFile(filePath: string, options: any): Promise<any> {
    // Implementation would read Excel file
    // Simplified for brevity
    throw new Error('Excel file processing not implemented');
  }

  private async writeCsvFile(filePath: string, data: any[], options: any): Promise<any> {
    // Implementation would write CSV file
    // Simplified for brevity
    throw new Error('CSV file writing not implemented');
  }

  private async writeExcelFile(filePath: string, data: any[], options: any): Promise<any> {
    // Implementation would write Excel file
    // Simplified for brevity
    throw new Error('Excel file writing not implemented');
  }

  private mergeSchemas(leftSchema: any, rightSchema: any): any {
    return { ...leftSchema, ...rightSchema };
  }
}
EOF

    log_success "Transformation Processor generated"
}

# Main execution function
main() {
    log_info "🚀 Starting Day 2 Hour 4: ETL Services Code Generation"
    log_info "============================================================"
    
    # Generate TypeScript types
    generate_etl_types
    
    # Generate core services
    generate_etl_workflow_service
    generate_etl_execution_engine
    generate_transformation_processor
    
    log_success "============================================================"
    log_success "✅ Day 2 Hour 4: ETL Services Code Generation Completed!"
    log_success "============================================================"
    log_info "Generated Components:"
    log_info "1. ✅ ETL TypeScript Types"
    log_info "2. ✅ ETL Workflow Service"
    log_info "3. ✅ ETL Execution Engine with Queue Management"
    log_info "4. ✅ Transformation Processor with Multiple Node Types"
    log_info ""
    log_info "🔗 Next: Run ./scripts/codegen/d2h4-generate-etl-frontend.sh"
}

# Execute main function
main "$@"