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
