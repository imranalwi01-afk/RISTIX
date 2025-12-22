// packages/backend/src/api/controllers/workflow.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { WorkflowService } from '../../core/services/workflow/workflow.service';
import { TenantContext } from '../../types/tenant.types';
import { CreateWorkflowInput, ApprovalDecision } from '../../types/workflow.types';

// Validation schemas
const createWorkflowSchema = z.object({
  workflowName: z.string().min(1).max(100),
  workflowType: z.enum(['APPROVAL', 'REVIEW', 'VALIDATION', 'ESCALATION']),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
  entityData: z.any().optional(),
  requestReason: z.string().max(500).optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  businessImpact: z.string().max(100).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  syariahComplianceRequired: z.boolean().optional()
});

const approvalDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'SEND_BACK', 'DELEGATE']),
  comments: z.string().max(1000).optional(),
  attachments: z.any().optional(),
  delegateTo: z.string().uuid().optional(),
  escalateTo: z.string().uuid().optional()
});

const workflowQuerySchema = z.object({
  status: z.string().optional(),
  entityType: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  assignedTo: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional()
});

export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * Create workflow instance
   * POST /api/v1/workflow/instances
   */
  public createWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;

      // Validate request body
      const validationResult = createWorkflowSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid workflow data',
          details: validationResult.error.errors
        });
        return;
      }

      const workflowInput: CreateWorkflowInput = {
        ...validationResult.data,
        requestedBy: userId
      };

      const workflow = await this.workflowService.createWorkflow(tenantContext, workflowInput);

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      next(error);
    }
  };

  /**
   * Get workflow instance
   * GET /api/v1/workflow/instances/:instanceId
   */
  public getWorkflowInstance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { instanceId } = req.params;

      if (!instanceId || !z.string().uuid().safeParse(instanceId).success) {
        res.status(400).json({
          success: false,
          error: 'Invalid workflow instance ID'
        });
        return;
      }

      const workflow = await this.workflowService.getWorkflowInstance(tenantContext, instanceId);

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow instance not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      console.error('Error getting workflow instance:', error);
      next(error);
    }
  };

  /**
   * Process approval decision
   * POST /api/v1/workflow/tasks/:taskId/decision
   */
  public processApprovalDecision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;
      const { taskId } = req.params;

      if (!taskId || !z.string().uuid().safeParse(taskId).success) {
        res.status(400).json({
          success: false,
          error: 'Invalid task ID'
        });
        return;
      }

      // Validate request body
      const validationResult = approvalDecisionSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid approval decision data',
          details: validationResult.error.errors
        });
        return;
      }

      const decision: ApprovalDecision = validationResult.data;

      const task = await this.workflowService.processApprovalDecision(
        tenantContext,
        taskId,
        userId,
        decision
      );

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error processing approval decision:', error);
      next(error);
    }
  };

  /**
   * Get user pending approvals
   * GET /api/v1/workflow/users/:userId/pending
   */
  public getUserPendingApprovals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { userId } = req.params;
      const { priority, bankingType, entityType, limit = '20', offset = '0' } = req.query;

      if (!userId || !z.string().uuid().safeParse(userId).success) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const filters = {
        priority: priority as string,
        bankingType: bankingType as 'conventional' | 'syariah',
        entityType: entityType as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const result = await this.workflowService.getUserPendingApprovals(
        tenantContext,
        userId,
        filters
      );

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + filters.limit < result.total
        }
      });
    } catch (error) {
      console.error('Error getting user pending approvals:', error);
      next(error);
    }
  };

  /**
   * Escalate overdue tasks
   * POST /api/v1/workflow/escalate-overdue
   */
  public escalateOverdueTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      const escalatedCount = await this.workflowService.escalateOverdueTasks(tenantContext);

      res.status(200).json({
        success: true,
        data: {
          escalatedTasksCount: escalatedCount,
          message: `${escalatedCount} overdue tasks were escalated`
        }
      });
    } catch (error) {
      console.error('Error escalating overdue tasks:', error);
      next(error);
    }
  };

  /**
   * Get workflow statistics
   * GET /api/v1/workflow/statistics
   */
  public getWorkflowStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { dateFrom, dateTo } = req.query;

      // This would be implemented in the WorkflowService
      // For now, return mock statistics
      const statistics = {
        totalWorkflows: 0,
        pendingApprovals: 0,
        completedToday: 0,
        overdueTask: 0,
        averageProcessingTime: 0,
        workflowsByStatus: {},
        approvalsByType: {}
      };

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting workflow statistics:', error);
      next(error);
    }
  };
}
