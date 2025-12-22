// packages/backend/src/core/services/workflow/workflow.service.ts
import { Sequelize, Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { TenantContext } from '../../../types/tenant.types';
import { 
  WorkflowDefinition, 
  WorkflowInstance, 
  ApprovalTask, 
  ApprovalHistory,
  WorkflowCreateInput,
  ApprovalTaskInput,
  ApprovalDecisionInput
} from '../../../types/workflow.types';
import { DatabaseService } from '../database/database.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';

export interface WorkflowServiceConfig {
  defaultEscalationTimeoutHours: number;
  maxApprovalLevels: number;
  enableAutoEscalation: boolean;
  parallelApprovalSupport: boolean;
  notificationRetryAttempts: number;
}

export interface CreateWorkflowInput {
  workflowName: string;
  workflowType: 'APPROVAL' | 'REVIEW' | 'VALIDATION' | 'ESCALATION';
  entityType: string;
  entityId: string;
  entityData: any;
  requestedBy: string;
  requestReason?: string;
  bankingType?: 'conventional' | 'syariah';
  businessImpact?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  syariahComplianceRequired?: boolean;
}

export interface ApprovalDecision {
  decision: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE';
  comments?: string;
  attachments?: any;
  delegateTo?: string;
  escalateTo?: string;
}

export class WorkflowService {
  private readonly databaseService: DatabaseService;
  private readonly configService: ConfigurationService;
  private readonly notificationService: NotificationService;
  private readonly auditService: AuditService;
  private config: WorkflowServiceConfig;

  constructor(
    databaseService: DatabaseService,
    configService: ConfigurationService,
    notificationService: NotificationService,
    auditService: AuditService
  ) {
    this.databaseService = databaseService;
    this.configService = configService;
    this.notificationService = notificationService;
    this.auditService = auditService;
    this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    this.config = await this.configService.getServiceConfig('workflow', {
      defaultEscalationTimeoutHours: 24,
      maxApprovalLevels: 5,
      enableAutoEscalation: true,
      parallelApprovalSupport: true,
      notificationRetryAttempts: 3
    });
  }

  /**
   * Create a new workflow instance with approval tasks
   */
  async createWorkflow(
    tenantContext: TenantContext,
    input: CreateWorkflowInput,
    transaction?: Transaction
  ): Promise<WorkflowInstance> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      // Get workflow definition
      const workflowDefinition = await this.getWorkflowDefinition(
        tenantContext, 
        input.workflowType, 
        input.entityType,
        input.bankingType
      );

      if (!workflowDefinition) {
        throw new Error(`No workflow definition found for ${input.workflowType} - ${input.entityType}`);
      }

      // Create workflow instance
      const instanceNumber = await this.generateInstanceNumber(tenantContext);
      
      const workflowInstance = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        workflowDefinitionId: workflowDefinition.id,
        instanceNumber,
        entityType: input.entityType,
        entityId: input.entityId,
        entityData: input.entityData,
        status: 'PENDING',
        currentLevel: 1,
        startedAt: new Date(),
        dueDate: this.calculateDueDate(workflowDefinition.configuration),
        requestedBy: input.requestedBy,
        requestReason: input.requestReason,
        bankingType: input.bankingType,
        businessImpact: input.businessImpact,
        syariahComplianceRequired: input.syariahComplianceRequired || false,
        priority: input.priority || 'NORMAL',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert workflow instance
      await db.query(
        `INSERT INTO workflow.workflow_instances (
          id, tenant_id, workflow_definition_id, instance_number,
          entity_type, entity_id, entity_data, status, current_level,
          started_at, due_date, requested_by, request_reason,
          banking_type, business_impact, syariah_compliance_required,
          priority, created_at, updated_at
        ) VALUES (
          :id, :tenantId, :workflowDefinitionId, :instanceNumber,
          :entityType, :entityId, :entityData, :status, :currentLevel,
          :startedAt, :dueDate, :requestedBy, :requestReason,
          :bankingType, :businessImpact, :syariahComplianceRequired,
          :priority, :createdAt, :updatedAt
        )`,
        {
          replacements: workflowInstance,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      // Create approval tasks based on workflow definition
      await this.createApprovalTasks(
        tenantContext, 
        workflowInstance, 
        workflowDefinition, 
        transaction
      );

      // Audit workflow creation
      await this.auditService.createAuditLog(tenantContext, {
        eventType: 'WORKFLOW_CREATED',
        entityType: 'workflow_instance',
        entityId: workflowInstance.id,
        entityName: instanceNumber,
        newValues: workflowInstance,
        userId: input.requestedBy,
        businessProcess: 'workflow_management',
        bankingType: input.bankingType,
        complianceRelevant: true
      }, transaction);

      // Send initial notifications
      await this.sendWorkflowNotifications(tenantContext, workflowInstance);

      return workflowInstance;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }

  /**
   * Process approval decision
   */
  async processApprovalDecision(
    tenantContext: TenantContext,
    taskId: string,
    userId: string,
    decision: ApprovalDecision,
    transaction?: Transaction
  ): Promise<ApprovalTask> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      // Get approval task
      const task = await this.getApprovalTask(tenantContext, taskId);
      if (!task) {
        throw new Error('Approval task not found');
      }

      // Validate user can make decision
      await this.validateApprovalAuthority(tenantContext, task, userId);

      // Update approval task
      const updatedTask = {
        ...task,
        status: 'COMPLETED',
        decision: decision.decision,
        decisionNotes: decision.comments,
        decisionDate: new Date(),
        completedAt: new Date(),
        updatedAt: new Date()
      };

      await db.query(
        `UPDATE workflow.approval_tasks 
         SET status = :status, decision = :decision, decision_notes = :decisionNotes,
             decision_date = :decisionDate, completed_at = :completedAt, updated_at = :updatedAt
         WHERE id = :id AND tenant_id = :tenantId`,
        {
          replacements: {
            ...updatedTask,
            id: taskId,
            tenantId: tenantContext.tenantId
          },
          type: db.QueryTypes.UPDATE,
          transaction
        }
      );

      // Create approval history record
      await this.createApprovalHistory(tenantContext, {
        approvalTaskId: taskId,
        workflowInstanceId: task.workflowInstanceId,
        actionType: decision.decision,
        actionBy: userId,
        decision: decision.decision,
        comments: decision.comments,
        attachments: decision.attachments
      }, transaction);

      // Handle delegation if requested
      if (decision.decision === 'DELEGATE' && decision.delegateTo) {
        await this.delegateApprovalTask(tenantContext, taskId, userId, decision.delegateTo, decision.comments, transaction);
      }

      // Process workflow based on decision
      await this.processWorkflowDecision(tenantContext, task.workflowInstanceId, decision, transaction);

      // Audit approval decision
      await this.auditService.createAuditLog(tenantContext, {
        eventType: 'APPROVAL_DECISION',
        entityType: 'approval_task',
        entityId: taskId,
        oldValues: task,
        newValues: updatedTask,
        userId,
        businessProcess: 'approval_workflow',
        bankingType: task.bankingType,
        complianceRelevant: true,
        metadata: {
          decision: decision.decision,
          workflowInstanceId: task.workflowInstanceId
        }
      }, transaction);

      return updatedTask;
    } catch (error) {
      console.error('Error processing approval decision:', error);
      throw new Error(`Failed to process approval decision: ${error.message}`);
    }
  }

  /**
   * Get workflow instance with tasks
   */
  async getWorkflowInstance(
    tenantContext: TenantContext,
    instanceId: string
  ): Promise<WorkflowInstance | null> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      const instances = await db.query(
        `SELECT 
           wi.*,
           wd.workflow_name,
           wd.workflow_type,
           wd.configuration as workflow_config
         FROM workflow.workflow_instances wi
         JOIN workflow.workflow_definitions wd ON wi.workflow_definition_id = wd.id
         WHERE wi.id = :instanceId AND wi.tenant_id = :tenantId`,
        {
          replacements: { instanceId, tenantId: tenantContext.tenantId },
          type: db.QueryTypes.SELECT
        }
      );

      if (instances.length === 0) return null;

      const instance = instances[0];

      // Get approval tasks
      const tasks = await db.query(
        `SELECT * FROM workflow.approval_tasks 
         WHERE workflow_instance_id = :instanceId AND tenant_id = :tenantId
         ORDER BY level_number, created_at`,
        {
          replacements: { instanceId, tenantId: tenantContext.tenantId },
          type: db.QueryTypes.SELECT
        }
      );

      return {
        ...instance,
        approvalTasks: tasks
      };
    } catch (error) {
      console.error('Error getting workflow instance:', error);
      throw new Error(`Failed to get workflow instance: ${error.message}`);
    }
  }

  /**
   * Get pending approvals for user
   */
  async getUserPendingApprovals(
    tenantContext: TenantContext,
    userId: string,
    filters?: {
      priority?: string;
      bankingType?: string;
      entityType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ tasks: ApprovalTask[]; total: number }> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      let whereClause = `WHERE at.tenant_id = :tenantId 
                         AND at.current_assignee_id = :userId 
                         AND at.status IN ('PENDING', 'IN_PROGRESS')`;
      
      const replacements: any = { tenantId: tenantContext.tenantId, userId };

      if (filters?.priority) {
        whereClause += ' AND wi.priority = :priority';
        replacements.priority = filters.priority;
      }

      if (filters?.bankingType) {
        whereClause += ' AND at.banking_type = :bankingType';
        replacements.bankingType = filters.bankingType;
      }

      if (filters?.entityType) {
        whereClause += ' AND wi.entity_type = :entityType';
        replacements.entityType = filters.entityType;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM workflow.approval_tasks at
        JOIN workflow.workflow_instances wi ON at.workflow_instance_id = wi.id
        ${whereClause}
      `;
      
      const countResult = await db.query(countQuery, {
        replacements,
        type: db.QueryTypes.SELECT
      });
      const total = countResult[0].total;

      // Get paginated tasks
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      
      const dataQuery = `
        SELECT 
          at.*,
          wi.entity_type,
          wi.entity_id,
          wi.instance_number,
          wi.priority,
          wi.business_impact,
          wd.workflow_name,
          wd.workflow_type
        FROM workflow.approval_tasks at
        JOIN workflow.workflow_instances wi ON at.workflow_instance_id = wi.id
        JOIN workflow.workflow_definitions wd ON wi.workflow_definition_id = wd.id
        ${whereClause}
        ORDER BY 
          CASE at.status WHEN 'IN_PROGRESS' THEN 1 ELSE 2 END,
          CASE wi.priority 
            WHEN 'URGENT' THEN 1 
            WHEN 'HIGH' THEN 2 
            WHEN 'NORMAL' THEN 3 
            ELSE 4 
          END,
          at.due_date ASC
        LIMIT :limit OFFSET :offset
      `;
      
      replacements.limit = limit;
      replacements.offset = offset;

      const tasks = await db.query(dataQuery, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      return { tasks, total };
    } catch (error) {
      console.error('Error getting user pending approvals:', error);
      throw new Error(`Failed to get user pending approvals: ${error.message}`);
    }
  }

  /**
   * Escalate overdue tasks
   */
  async escalateOverdueTasks(tenantContext: TenantContext): Promise<number> {
    try {
      if (!this.config.enableAutoEscalation) {
        return 0;
      }

      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      // Find overdue tasks
      const overdueTasks = await db.query(
        `SELECT * FROM workflow.approval_tasks 
         WHERE tenant_id = :tenantId 
           AND status IN ('PENDING', 'IN_PROGRESS')
           AND due_date < NOW()
           AND escalation_level < :maxEscalationLevel`,
        {
          replacements: { 
            tenantId: tenantContext.tenantId,
            maxEscalationLevel: this.config.maxApprovalLevels
          },
          type: db.QueryTypes.SELECT
        }
      );

      let escalatedCount = 0;

      for (const task of overdueTasks) {
        await this.escalateTask(tenantContext, task);
        escalatedCount++;
      }

      return escalatedCount;
    } catch (error) {
      console.error('Error escalating overdue tasks:', error);
      throw new Error(`Failed to escalate overdue tasks: ${error.message}`);
    }
  }

  // Private helper methods
  private async getWorkflowDefinition(
    tenantContext: TenantContext,
    workflowType: string,
    entityType: string,
    bankingType?: string
  ): Promise<WorkflowDefinition | null> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    const definitions = await db.query(
      `SELECT * FROM workflow.workflow_definitions 
       WHERE tenant_id = :tenantId 
         AND workflow_type = :workflowType
         AND :entityType = ANY(applicable_processes)
         AND (banking_type = :bankingType OR banking_type = 'both')
         AND is_active = true
       ORDER BY is_default DESC, version DESC
       LIMIT 1`,
      {
        replacements: { 
          tenantId: tenantContext.tenantId,
          workflowType,
          entityType,
          bankingType: bankingType || 'conventional'
        },
        type: db.QueryTypes.SELECT
      }
    );

    return definitions.length > 0 ? definitions[0] : null;
  }

  private async generateInstanceNumber(tenantContext: TenantContext): Promise<string> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    const result = await db.query(
      `SELECT COUNT(*) + 1 as next_number 
       FROM workflow.workflow_instances 
       WHERE tenant_id = :tenantId`,
      {
        replacements: { tenantId: tenantContext.tenantId },
        type: db.QueryTypes.SELECT
      }
    );

    const nextNumber = result[0].next_number;
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    return `WF-${currentDate}-${String(nextNumber).padStart(4, '0')}`;
  }

  private calculateDueDate(configuration: any): Date {
    const timeoutHours = configuration.escalationTimeoutHours || this.config.defaultEscalationTimeoutHours;
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + timeoutHours);
    return dueDate;
  }

  private async createApprovalTasks(
    tenantContext: TenantContext,
    workflowInstance: any,
    workflowDefinition: WorkflowDefinition,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    const configuration = workflowDefinition.configuration;
    
    for (let level = 1; level <= workflowDefinition.approvalLevels; level++) {
      const levelConfig = configuration.levels?.[level - 1] || configuration.defaultLevel;
      
      const taskNumber = await this.generateTaskNumber(tenantContext, workflowInstance.instanceNumber, level);
      
      const approvalTask = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        taskNumber,
        workflowInstanceId: workflowInstance.id,
        taskType: levelConfig.taskType || 'APPROVAL',
        taskTitle: `${workflowDefinition.workflowName} - Level ${level} Approval`,
        taskDescription: levelConfig.description || `Approval required for ${workflowInstance.entityType}`,
        assignedTo: levelConfig.assignedTo,
        assignedRole: levelConfig.assignedRole,
        assignedGroup: levelConfig.assignedGroup,
        currentAssigneeId: levelConfig.assignedTo,
        status: level === 1 ? 'PENDING' : 'WAITING',
        levelNumber: level,
        createdAt: new Date(),
        dueDate: this.calculateDueDate(configuration),
        bankingType: workflowInstance.bankingType,
        requiresSyariahBoard: levelConfig.requiresSyariahBoard || false,
        updatedAt: new Date()
      };

      await db.query(
        `INSERT INTO workflow.approval_tasks (
          id, tenant_id, task_number, workflow_instance_id,
          task_type, task_title, task_description,
          assigned_to, assigned_role, assigned_group, current_assignee_id,
          status, level_number, created_at, due_date,
          banking_type, requires_syariah_board, updated_at
        ) VALUES (
          :id, :tenantId, :taskNumber, :workflowInstanceId,
          :taskType, :taskTitle, :taskDescription,
          :assignedTo, :assignedRole, :assignedGroup, :currentAssigneeId,
          :status, :levelNumber, :createdAt, :dueDate,
          :bankingType, :requiresSyariahBoard, :updatedAt
        )`,
        {
          replacements: approvalTask,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );
    }
  }

  private async generateTaskNumber(
    tenantContext: TenantContext,
    instanceNumber: string,
    level: number
  ): Promise<string> {
    return `${instanceNumber}-L${level}`;
  }

  private async getApprovalTask(
    tenantContext: TenantContext,
    taskId: string
  ): Promise<ApprovalTask | null> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    const tasks = await db.query(
      `SELECT * FROM workflow.approval_tasks 
       WHERE id = :taskId AND tenant_id = :tenantId`,
      {
        replacements: { taskId, tenantId: tenantContext.tenantId },
        type: db.QueryTypes.SELECT
      }
    );

    return tasks.length > 0 ? tasks[0] : null;
  }

  private async validateApprovalAuthority(
    tenantContext: TenantContext,
    task: ApprovalTask,
    userId: string
  ): Promise<void> {
    // Check if user is authorized to approve this task
    if (task.currentAssigneeId && task.currentAssigneeId !== userId) {
      throw new Error('User not authorized to approve this task');
    }

    if (task.status !== 'PENDING' && task.status !== 'IN_PROGRESS') {
      throw new Error('Task is not in an approvable state');
    }
  }

  private async createApprovalHistory(
    tenantContext: TenantContext,
    historyData: any,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    const history = {
      id: uuidv4(),
      tenantId: tenantContext.tenantId,
      ...historyData,
      actionTimestamp: new Date()
    };

    await db.query(
      `INSERT INTO workflow.approval_history (
        id, tenant_id, approval_task_id, workflow_instance_id,
        action_type, action_by, action_timestamp, decision, comments, attachments
      ) VALUES (
        :id, :tenantId, :approvalTaskId, :workflowInstanceId,
        :actionType, :actionBy, :actionTimestamp, :decision, :comments, :attachments
      )`,
      {
        replacements: history,
        type: db.QueryTypes.INSERT,
        transaction
      }
    );
  }

  private async delegateApprovalTask(
    tenantContext: TenantContext,
    taskId: string,
    fromUserId: string,
    toUserId: string,
    reason?: string,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    await db.query(
      `UPDATE workflow.approval_tasks 
       SET current_assignee_id = :toUserId,
           delegated_to = :toUserId,
           delegation_reason = :reason,
           status = 'PENDING',
           updated_at = NOW()
       WHERE id = :taskId AND tenant_id = :tenantId`,
      {
        replacements: {
          toUserId,
          reason,
          taskId,
          tenantId: tenantContext.tenantId
        },
        type: db.QueryTypes.UPDATE,
        transaction
      }
    );
  }

  private async processWorkflowDecision(
    tenantContext: TenantContext,
    workflowInstanceId: string,
    decision: ApprovalDecision,
    transaction?: Transaction
  ): Promise<void> {
    if (decision.decision === 'APPROVE') {
      await this.progressWorkflow(tenantContext, workflowInstanceId, transaction);
    } else if (decision.decision === 'REJECT') {
      await this.rejectWorkflow(tenantContext, workflowInstanceId, transaction);
    } else if (decision.decision === 'SEND_BACK') {
      await this.sendBackWorkflow(tenantContext, workflowInstanceId, transaction);
    }
  }

  private async progressWorkflow(
    tenantContext: TenantContext,
    workflowInstanceId: string,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    // Check if all tasks at current level are approved
    const instance = await this.getWorkflowInstance(tenantContext, workflowInstanceId);
    const currentLevelTasks = instance.approvalTasks.filter(
      task => task.levelNumber === instance.currentLevel
    );
    
    const allApproved = currentLevelTasks.every(task => task.decision === 'APPROVE');
    
    if (allApproved) {
      // Check if there are more levels
      const nextLevelTasks = instance.approvalTasks.filter(
        task => task.levelNumber === instance.currentLevel + 1
      );
      
      if (nextLevelTasks.length > 0) {
        // Move to next level
        await db.query(
          `UPDATE workflow.workflow_instances 
           SET current_level = current_level + 1, status = 'IN_PROGRESS', updated_at = NOW()
           WHERE id = :workflowInstanceId AND tenant_id = :tenantId`,
          {
            replacements: { workflowInstanceId, tenantId: tenantContext.tenantId },
            type: db.QueryTypes.UPDATE,
            transaction
          }
        );
        
        // Activate next level tasks
        await db.query(
          `UPDATE workflow.approval_tasks 
           SET status = 'PENDING', updated_at = NOW()
           WHERE workflow_instance_id = :workflowInstanceId 
             AND level_number = :nextLevel 
             AND tenant_id = :tenantId`,
          {
            replacements: { 
              workflowInstanceId, 
              nextLevel: instance.currentLevel + 1,
              tenantId: tenantContext.tenantId 
            },
            type: db.QueryTypes.UPDATE,
            transaction
          }
        );
      } else {
        // Workflow complete
        await this.completeWorkflow(tenantContext, workflowInstanceId, 'APPROVED', transaction);
      }
    }
  }

  private async rejectWorkflow(
    tenantContext: TenantContext,
    workflowInstanceId: string,
    transaction?: Transaction
  ): Promise<void> {
    await this.completeWorkflow(tenantContext, workflowInstanceId, 'REJECTED', transaction);
  }

  private async sendBackWorkflow(
    tenantContext: TenantContext,
    workflowInstanceId: string,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    // Reset workflow to first level
    await db.query(
      `UPDATE workflow.workflow_instances 
       SET current_level = 1, status = 'PENDING', updated_at = NOW()
       WHERE id = :workflowInstanceId AND tenant_id = :tenantId`,
      {
        replacements: { workflowInstanceId, tenantId: tenantContext.tenantId },
        type: db.QueryTypes.UPDATE,
        transaction
      }
    );
    
    // Reset all tasks
    await db.query(
      `UPDATE workflow.approval_tasks 
       SET status = CASE WHEN level_number = 1 THEN 'PENDING' ELSE 'WAITING' END,
           decision = NULL, decision_notes = NULL, decision_date = NULL,
           completed_at = NULL, updated_at = NOW()
       WHERE workflow_instance_id = :workflowInstanceId AND tenant_id = :tenantId`,
      {
        replacements: { workflowInstanceId, tenantId: tenantContext.tenantId },
        type: db.QueryTypes.UPDATE,
        transaction
      }
    );
  }

  private async completeWorkflow(
    tenantContext: TenantContext,
    workflowInstanceId: string,
    finalDecision: string,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    await db.query(
      `UPDATE workflow.workflow_instances 
       SET status = :status, final_decision = :finalDecision, completed_at = NOW(), updated_at = NOW()
       WHERE id = :workflowInstanceId AND tenant_id = :tenantId`,
      {
        replacements: { 
          status: finalDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          finalDecision,
          workflowInstanceId, 
          tenantId: tenantContext.tenantId 
        },
        type: db.QueryTypes.UPDATE,
        transaction
      }
    );
  }

  private async escalateTask(
    tenantContext: TenantContext,
    task: ApprovalTask,
    transaction?: Transaction
  ): Promise<void> {
    const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
    
    // Logic to find escalation target
    // This would involve role hierarchy lookup
    const escalationTarget = await this.findEscalationTarget(tenantContext, task);
    
    if (escalationTarget) {
      await db.query(
        `UPDATE workflow.approval_tasks 
         SET escalation_level = escalation_level + 1,
             escalated_from = current_assignee_id,
             escalated_to = :escalationTarget,
             current_assignee_id = :escalationTarget,
             escalation_reason = 'Automatic escalation due to timeout',
             updated_at = NOW()
         WHERE id = :taskId AND tenant_id = :tenantId`,
        {
          replacements: {
            escalationTarget,
            taskId: task.id,
            tenantId: tenantContext.tenantId
          },
          type: db.QueryTypes.UPDATE,
          transaction
        }
      );

      // Send escalation notifications
      await this.notificationService.sendEscalationNotification(
        tenantContext,
        task,
        escalationTarget
      );
    }
  }

  private async findEscalationTarget(
    tenantContext: TenantContext,
    task: ApprovalTask
  ): Promise<string | null> {
    // Implementation would lookup organizational hierarchy
    // For now, return null to indicate no escalation target found
    return null;
  }

  private async sendWorkflowNotifications(
    tenantContext: TenantContext,
    workflowInstance: any
  ): Promise<void> {
    // Send notifications to relevant stakeholders
    // Implementation would use NotificationService
    console.log('Sending workflow notifications for:', workflowInstance.instanceNumber);
  }
}
