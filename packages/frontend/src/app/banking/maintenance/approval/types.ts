export interface ApprovalRequest {
  id: string;
  requestType: string;
  requestTypeLabel?: string;
  requestTitle: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  tenantId: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  description?: string;
  requestData?: any;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  completedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested' | 'delegated' | 'cancelled' | 'completed';
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
  approvalsRequired: number;
  approvalsReceived: number;
  currentApprovers: string[];
  expiresAt?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  complianceRelevant?: boolean;
  currentLevel?: number;
}

export interface ApprovalStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageApprovalTime: number;
  overdueRequests: number;
  infoRequestedRequests: number;
  delegatedRequests: number;
  criticalPendingRequests: number;
  uniqueRequestTypes: number;
  pendingByLevel: Array<{ level: number; count: number }>;
  byRequestType: Array<{ requestType: string; count: number }>;
}

export interface ApprovalAction {
  approvalId: string;
  action: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel';
  reason: string;
  delegateTo?: string;
}

export interface ApprovalMatrixLevel {
  level: number;
  name: string;
  requiredRoleCodes?: string[];
  requiredPermissionCodes?: string[];
  requiredCount?: number;
  timeoutHours?: number;
}

export interface ApprovalMatrix {
  id: string;
  name: string;
  description?: string | null;
  entityType: string;
  operationType?: string | null;
  bankingMode?: string | null;
  isActive?: boolean;
  syariahBoardRequired?: boolean;
  autoApprovalRules?: {
    bypassPermissions?: string[];
    autoApproveImpactLevels?: string[];
  } | null;
  levels: ApprovalMatrixLevel[];
  createdAt: string;
}

export interface ApprovalRoutingCandidate {
  userId: string;
  fullName: string;
  email: string;
  department?: string | null;
  position?: string | null;
  roleCodes: string[];
}

export interface ApprovalRoutingLevel {
  level: number;
  name: string;
  requiredRoleCodes: string[];
  requiredPermissionCodes: string[];
  requiredCount: number;
  timeoutHours?: number;
  candidateCount: number;
  candidates: ApprovalRoutingCandidate[];
}

export interface ApprovalRoutingItem {
  entityType: string;
  operationType: string;
  matrixId: string | null;
  matrixName: string;
  isActive: boolean;
  levels: ApprovalRoutingLevel[];
}

export type ApprovalOperation = 'create' | 'update' | 'delete';

export interface RequestRoutingMatch {
  entityType: string;
  operation: ApprovalOperation | null;
  operationMatched: boolean;
  routing: ApprovalRoutingItem | null;
}
