// packages/backend/src/types/workflow.types.ts

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  workflowName: string;
  workflowType: 'APPROVAL' | 'REVIEW' | 'VALIDATION' | 'ESCALATION';
  version: number;
  configuration: any;
  approvalLevels: number;
  parallelApproval: boolean;
  autoEscalation: boolean;
  escalationTimeoutHours: number;
  bankingType?: 'conventional' | 'syariah' | 'both';
  applicableProcesses: string[];
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  workflowDefinitionId: string;
  instanceNumber: string;
  entityType: string;
  entityId: string;
  entityData?: any;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  currentLevel: number;
  startedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  requestedBy: string;
  requestReason?: string;
  bankingType?: 'conventional' | 'syariah';
  businessImpact?: string;
  syariahComplianceRequired?: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  finalDecision?: 'APPROVED' | 'REJECTED';
  decisionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  approvalTasks?: ApprovalTask[];
}

export interface ApprovalTask {
  id: string;
  tenantId: string;
  taskNumber: string;
  workflowInstanceId: string;
  taskType: 'APPROVAL' | 'REVIEW' | 'VALIDATION' | 'INFORMATION';
  taskTitle: string;
  taskDescription?: string;
  assignedTo?: string;
  assignedRole?: string;
  assignedGroup?: string;
  currentAssigneeId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELEGATED' | 'ESCALATED';
  levelNumber: number;
  decision?: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE';
  decisionNotes?: string;
  decisionDate?: Date;
  createdAt: Date;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  bankingType?: 'conventional' | 'syariah';
  requiresSyariahBoard?: boolean;
  syariahComplianceNotes?: string;
  escalationLevel: number;
  escalatedFrom?: string;
  escalatedTo?: string;
  escalationReason?: string;
  delegatedTo?: string;
  delegationReason?: string;
  delegationExpiry?: Date;
  updatedAt: Date;
}

export interface ApprovalHistory {
  id: string;
  tenantId: string;
  approvalTaskId: string;
  workflowInstanceId: string;
  actionType: 'ASSIGNED' | 'STARTED' | 'APPROVED' | 'REJECTED' | 'DELEGATED' | 'ESCALATED';
  actionBy: string;
  actionTimestamp: Date;
  decision?: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE';
  comments?: string;
  attachments?: any;
  previousAssignee?: string;
  newAssignee?: string;
  bankingType?: 'conventional' | 'syariah';
  syariahReviewRequired?: boolean;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface NotificationQueue {
  id: string;
  tenantId: string;
  notificationType: 'TASK_ASSIGNED' | 'TASK_DUE' | 'TASK_ESCALATED' | 'WORKFLOW_COMPLETED';
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject: string;
  messageBody: string;
  messageHtml?: string;
  workflowInstanceId?: string;
  approvalTaskId?: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  sendVia: 'EMAIL' | 'SMS' | 'BOTH';
  createdAt: Date;
  scheduledFor: Date;
  sentAt?: Date;
  deliveryAttempts: number;
  lastAttemptAt?: Date;
  errorMessage?: string;
  bankingType?: 'conventional' | 'syariah';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface WorkflowCreateInput {
  workflowName: string;
  workflowType: 'APPROVAL' | 'REVIEW' | 'VALIDATION' | 'ESCALATION';
  entityType: string;
  entityId: string;
  entityData?: any;
  requestedBy: string;
  requestReason?: string;
  bankingType?: 'conventional' | 'syariah';
  businessImpact?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  syariahComplianceRequired?: boolean;
}

export interface ApprovalTaskInput {
  taskType: 'APPROVAL' | 'REVIEW' | 'VALIDATION' | 'INFORMATION';
  taskTitle: string;
  taskDescription?: string;
  assignedTo?: string;
  assignedRole?: string;
  assignedGroup?: string;
  levelNumber: number;
  requiresSyariahBoard?: boolean;
  dueDate?: Date;
}

export interface ApprovalDecisionInput {
  decision: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE';
  comments?: string;
  attachments?: any;
  delegateTo?: string;
  escalateTo?: string;
}

export interface WorkflowQueryFilters {
  status?: string;
  entityType?: string;
  priority?: string;
  bankingType?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
