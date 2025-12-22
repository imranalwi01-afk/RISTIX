// packages/backend/src/api/controllers/etl/workflow.controller.ts

import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ETLWorkflowService } from '../../../core/services/etl/workflow.service';
import { DataQualityEngine } from '../../../core/services/etl/quality/quality.engine';
import { DataLineageTracker } from '../../../core/services/etl/lineage/lineage.tracker';
import { PerformanceOptimizer } from '../../../core/services/etl/performance/performance.optimizer';
import { ErrorRecoveryManager } from '../../../core/services/etl/recovery/recovery.manager';
import { LoggerService } from '../../../utils/logger.service';

@injectable()
export class ETLWorkflowController {
  constructor(
    @inject(ETLWorkflowService) private workflowService: ETLWorkflowService,
    @inject(DataQualityEngine) private qualityEngine: DataQualityEngine,
    @inject(DataLineageTracker) private lineageTracker: DataLineageTracker,
    @inject(PerformanceOptimizer) private performanceOptimizer: PerformanceOptimizer,
    @inject(ErrorRecoveryManager) private recoveryManager: ErrorRecoveryManager,
    @inject(LoggerService) private logger: LoggerService
  ) {}

  async createWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, workflowDefinition } = req.body;
      const tenantId = req.tenant?.id;
      const userId = req.user?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const workflow = await this.workflowService.createWorkflow(
        tenantId,
        name,
        description,
        workflowDefinition,
        userId
      );

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      this.logger.error(`Failed to create workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_CREATE_FAILED'
      });
    }
  }

  async getWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const workflow = await this.workflowService.getWorkflow(id, tenantId);

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
          code: 'WORKFLOW_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      this.logger.error(`Failed to get workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_GET_FAILED'
      });
    }
  }

  async updateWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const workflow = await this.workflowService.updateWorkflow(id, tenantId, updates);

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      this.logger.error(`Failed to update workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_UPDATE_FAILED'
      });
    }
  }

  async deleteWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      await this.workflowService.deleteWorkflow(id, tenantId);

      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      this.logger.error(`Failed to delete workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_DELETE_FAILED'
      });
    }
  }

  async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const executionId = await this.workflowService.executeWorkflow(id, tenantId);

      res.json({
        success: true,
        data: { executionId },
        message: 'Workflow execution started'
      });
    } catch (error) {
      this.logger.error(`Failed to execute workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_EXECUTE_FAILED'
      });
    }
  }

  async getExecutionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const history = await this.workflowService.getExecutionHistory(
        id,
        tenantId,
        Number(limit),
        Number(offset)
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      this.logger.error(`Failed to get execution history: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'EXECUTION_HISTORY_FAILED'
      });
    }
  }

  async analyzePerformance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const profiles = await this.performanceOptimizer.analyzeWorkflowPerformance(id);

      res.json({
        success: true,
        data: profiles
      });
    } catch (error) {
      this.logger.error(`Failed to analyze performance: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'PERFORMANCE_ANALYSIS_FAILED'
      });
    }
  }

  async optimizeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { workflowDefinition } = req.body;

      const result = await this.performanceOptimizer.optimizeWorkflow(id, workflowDefinition);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.error(`Failed to optimize workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_OPTIMIZATION_FAILED'
      });
    }
  }

  async getLineage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const lineage = await this.lineageTracker.getLineageGraph(id);

      res.json({
        success: true,
        data: lineage
      });
    } catch (error) {
      this.logger.error(`Failed to get lineage: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'LINEAGE_GET_FAILED'
      });
    }
  }

  async analyzeImpact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nodeId } = req.query;

      if (!nodeId) {
        res.status(400).json({
          success: false,
          error: 'Node ID is required',
          code: 'NODE_ID_REQUIRED'
        });
        return;
      }

      const impact = await this.lineageTracker.analyzeImpact(id, String(nodeId));

      res.json({
        success: true,
        data: impact
      });
    } catch (error) {
      this.logger.error(`Failed to analyze impact: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'IMPACT_ANALYSIS_FAILED'
      });
    }
  }

  async validateDataQuality(req: Request, res: Response): Promise<void> {
    try {
      const { data, rules } = req.body;

      const report = await this.qualityEngine.validateData(data, rules);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error(`Failed to validate data quality: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'DATA_QUALITY_VALIDATION_FAILED'
      });
    }
  }

  async createCheckpoint(req: Request, res: Response): Promise<void> {
    try {
      const { executionId, nodeId, state, processedRecords, lastProcessedId } = req.body;

      const checkpoint = await this.recoveryManager.createCheckpoint(
        executionId,
        nodeId,
        state,
        processedRecords,
        lastProcessedId
      );

      res.status(201).json({
        success: true,
        data: checkpoint
      });
    } catch (error) {
      this.logger.error(`Failed to create checkpoint: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'CHECKPOINT_CREATE_FAILED'
      });
    }
  }

  async handleError(req: Request, res: Response): Promise<void> {
    try {
      const { executionId, nodeId, error, context } = req.body;

      const result = await this.recoveryManager.handleExecutionError(
        executionId,
        nodeId,
        error,
        context
      );

      res.json({
        success: true,
        data: result
      });
    } catch (recoveryError) {
      this.logger.error(`Failed to handle error: ${recoveryError.message}`);
      res.status(500).json({
        success: false,
        error: recoveryError.message,
        code: 'ERROR_HANDLING_FAILED'
      });
    }
  }
}
