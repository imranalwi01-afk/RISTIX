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
