// packages/backend/src/core/services/approval/four-eyes-approval.service.ts

// ✅ REMOVED: NestJS imports (this is an Express project)
// ✅ ADDED: Express-compatible configuration service interface
interface IConfigService {
  get(key: string): any;
}

export interface ApprovalRequest {
  id?: string;
  approvalDefinitionId: string;
  requestType: string;
  requestTitle: string;
  requestDescription?: string;
  requestData: Record<string, any>;
  requestedBy: string;
  requesterRole: string;
  tenantId: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  entityType?: string;
  entityId?: string;
  operationType: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
}

export interface ApprovalAction {
  approvalRequestId: string;
  approverId: string;
  approverRole: string;
  approvalLevel: number;
  action: 'approve' | 'reject' | 'request_info' | 'delegate';
  decisionReason?: string;
  conditions?: string;
  delegatedTo?: string;
  delegationReason?: string;
  syariahComplianceCheck?: boolean;
  regulatoryComplianceCheck?: boolean;
  complianceComments?: string;
  riskAssessment?: Record<string, any>;
  riskScore?: number;
  riskComments?: string;
}

export interface ApprovalMatrix {
  tenantId: string;
  matrixName: string;
  matrixType: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  amountThresholds: Record<string, number>;
  riskThresholds: Record<string, number>;
  approvalLevels: ApprovalLevel[];
  autoApprovalRules?: Record<string, any>;
  escalationRules?: Record<string, any>;
  syariahBoardApprovalRequired?: boolean;
  syariahComplianceRules?: Record<string, any>;
}

export interface ApprovalLevel {
  level: number;
  name: string;
  roles: string[];
  requiredCount: number;
  maxAmount?: number;
  conditions?: Record<string, any>;
}

// ✅ REMOVED: @Injectable() decorator (Express doesn't use it)
export class FourEyesApprovalService {
  constructor(private configService: IConfigService) {}

  public async createApprovalRequest(request: ApprovalRequest): Promise<string> {
    try {
      log_info(`Creating approval request: ${request.requestType}`);
      
      // Get approval matrix for this request type
      const matrix = await this.getApprovalMatrix(
        request.tenantId,
        request.requestType,
        request.bankingType
      );
      
      if (!matrix) {
        throw new Error(`No approval matrix found for ${request.requestType} in ${request.bankingType} banking`);
      }
      
      // Determine required approvals based on matrix
      const requiredApprovals = this.calculateRequiredApprovals(request, matrix);
      
      // Create approval request record
      const approvalId = this.generateApprovalId();
      
      // Store in database (implementation would use actual database)
      const approvalRequestData = {
        id: approvalId,
        ...request,
        approvalsRequired: requiredApprovals,
        status: 'pending',
        currentLevel: 1,
        requestedAt: new Date()
      };
      
      const firstApprovalLevel = matrix.approvalLevels?.[0];
      if (firstApprovalLevel) {
        await this.notifyApprovers(approvalId, firstApprovalLevel);
      } else {
        log_info(`Warning: No approval levels found for matrix ${matrix.matrixName}`);
      }

      
      // Create audit trail entry
      await this.createAuditTrailEntry(approvalId, 'created', `Approval request created`, {
        requestType: request.requestType,
        requestedBy: request.requestedBy,
        impactLevel: request.impactLevel
      });
      
      log_info(`Approval request created with ID: ${approvalId}`);
      return approvalId;
      
    } catch (error) {
      throw new Error(`Failed to create approval request: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async processApprovalAction(action: ApprovalAction): Promise<boolean> {
    try {
      log_info(`Processing approval action: ${action.action} by ${action.approverId}`);
      
      // Get current approval request
      const request = await this.getApprovalRequest(action.approvalRequestId);
      if (!request) {
        throw new Error(`Approval request not found: ${action.approvalRequestId}`);
      }
      
      // Validate approver authority
      await this.validateApproverAuthority(action.approverId, action.approverRole, request);
      
      // Process the action
      let requestCompleted = false;
      
      switch (action.action) {
        case 'approve':
          requestCompleted = await this.processApproval(request, action);
          break;
        case 'reject':
          requestCompleted = await this.processRejection(request, action);
          break;
        case 'request_info':
          await this.processInformationRequest(request, action);
          break;
        case 'delegate':
          await this.processDelegation(request, action);
          break;
        default:
          throw new Error(`Unknown approval action: ${action.action}`);
      }
      
      // Create audit trail entry
      await this.createAuditTrailEntry(
        action.approvalRequestId,
        action.action,
        `${action.action} action by ${action.approverRole}`,
        {
          approverId: action.approverId,
          approverRole: action.approverRole,
          decisionReason: action.decisionReason,
          riskScore: action.riskScore
        }
      );
      
      return requestCompleted;
      
    } catch (error) {
      throw new Error(`Failed to process approval action: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async getApprovalMatrix(
    tenantId: string,
    matrixType: string,
    bankingType: string
  ): Promise<ApprovalMatrix | null> {
    // Implementation would query database
    // For now, return a sample matrix
    
    // ✅ FIXED: Proper type casting for bankingType
    const validBankingType = bankingType as 'conventional' | 'syariah' | 'dual';
    
    const sampleMatrix: ApprovalMatrix = {
      tenantId,
      matrixName: `${matrixType} Approval Matrix`,
      matrixType,
      bankingType: validBankingType,
      amountThresholds: {
        low: 10000,
        medium: 100000,
        high: 1000000
      },
      riskThresholds: {
        low: 3,
        medium: 6,
        high: 8
      },
      approvalLevels: [
        {
          level: 1,
          name: 'Manager Approval',
          roles: ['manager', 'senior_analyst'],
          requiredCount: 1,
          maxAmount: 100000
        },
        {
          level: 2,
          name: 'Senior Manager Approval',
          roles: ['senior_manager', 'director'],
          requiredCount: 1,
          maxAmount: 1000000
        },
        {
          level: 3,
          name: 'Executive Approval',
          roles: ['director', 'ceo'],
          requiredCount: 2
        }
      ],
      syariahBoardApprovalRequired: validBankingType === 'syariah',
      syariahComplianceRules: validBankingType === 'syariah' ? {
        prohibitedSectors: ['alcohol', 'gambling', 'pork', 'conventional_banking'],
        requiresScholarApproval: true
      } : undefined
    };
    
    return sampleMatrix;
  }

  public async getPendingApprovals(approverId: string, approverRole: string): Promise<any[]> {
    try {
      // Implementation would query database for pending approvals
      // where the approver has authority
      
      const pendingApprovals = [
        {
          id: 'approval_001',
          requestType: 'user_creation',
          requestTitle: 'Create New Banking User',
          requestedBy: 'user_123',
          requesterRole: 'admin',
          impactLevel: 'medium',
          requestedAt: new Date(),
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          currentLevel: 1,
          bankingType: 'conventional'
        }
      ];
      
      return pendingApprovals;
      
    } catch (error) {
      throw new Error(`Failed to get pending approvals: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async getApprovalHistory(
    requestId?: string,
    tenantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      // Implementation would query approval audit trail
      
      const history = [
        {
          id: 'approval_001',
          requestType: 'configuration_change',
          status: 'approved',
          requestedBy: 'user_123',
          approvedBy: ['manager_456', 'director_789'],
          requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          totalApprovals: 2,
          auditTrail: [
            {
              event: 'created',
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
              actor: 'user_123'
            },
            {
              event: 'approved',
              timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
              actor: 'manager_456',
              reason: 'Configuration change approved - low risk'
            },
            {
              event: 'approved',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              actor: 'director_789',
              reason: 'Final approval granted'
            }
          ]
        }
      ];
      
      return history;
      
    } catch (error) {
      throw new Error(`Failed to get approval history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ✅ ADDED: Missing calculateRequiredApprovals method
  private calculateRequiredApprovals(request: ApprovalRequest, matrix: ApprovalMatrix): number {
    // Calculate required approvals based on request attributes and matrix rules
    let requiredCount = 0;
    
    // Check impact level
    switch (request.impactLevel) {
      case 'low':
        requiredCount = 1;
        break;
      case 'medium':
        requiredCount = 2;
        break;
      case 'high':
        requiredCount = 3;
        break;
      case 'critical':
        requiredCount = matrix.approvalLevels?.length || 3;
        break;
      default:
        requiredCount = 2;
    }
    
    // Additional rules for Syariah banking
    if (request.bankingType === 'syariah' && matrix.syariahBoardApprovalRequired) {
      requiredCount += 1;
    }
    
    return Math.min(requiredCount, matrix.approvalLevels?.length || 3);
  }

  // Private helper methods
  private async validateApproverAuthority(
    approverId: string,
    approverRole: string,
    request: any
  ): Promise<void> {
    // Validate that the approver has authority to approve this request
    // Implementation would check user roles and approval matrix
    
    if (!approverId || !approverRole) {
      throw new Error('Approver ID and role are required');
    }
    
    // Additional validation logic would go here
  }

  private async processApproval(request: any, action: ApprovalAction): Promise<boolean> {
    // Increment approval count
    const newApprovalCount = (request.approvalsReceived || 0) + 1;
    
    // Check if request is now fully approved
    const isFullyApproved = newApprovalCount >= request.approvalsRequired;
    
    if (isFullyApproved) {
      // Mark request as approved
      await this.updateRequestStatus(request.id, 'approved', action.approverId);
      
      // Execute the approved action
      await this.executeApprovedAction(request);
      
      // Notify stakeholders
      await this.notifyApprovalCompletion(request, 'approved');
    } else {
      // Move to next approval level if needed
      await this.progressToNextLevel(request);
    }
    
    return isFullyApproved;
  }

  private async processRejection(request: any, action: ApprovalAction): Promise<boolean> {
    // Mark request as rejected
    await this.updateRequestStatus(request.id, 'rejected', action.approverId);
    
    // Notify stakeholders
    await this.notifyApprovalCompletion(request, 'rejected');
    
    return true; // Request is completed (rejected)
  }

  private async processInformationRequest(request: any, action: ApprovalAction): Promise<void> {
    // Send information request to original requester
    await this.sendInformationRequest(request, action);
  }

  private async processDelegation(request: any, action: ApprovalAction): Promise<void> {
    if (!action.delegatedTo) {
      throw new Error('Delegation target is required');
    }
    
    // Update approver assignment
    await this.updateApproverAssignment(request.id, action.delegatedTo);
    
    // Notify new approver
    await this.notifyDelegatedApprover(request, action);
  }

  private async getApprovalRequest(requestId: string): Promise<any> {
    // Implementation would query database
    // Mock data for now
    return {
      id: requestId,
      requestType: 'configuration_change',
      approvalsReceived: 0,
      approvalsRequired: 2,
      status: 'pending',
      currentLevel: 1
    };
  }

  private async updateRequestStatus(requestId: string, status: string, approverId: string): Promise<void> {
    // Implementation would update database
    console.log(`Updated request ${requestId} status to ${status} by ${approverId}`);
  }

  private async executeApprovedAction(request: any): Promise<void> {
    // Implementation would execute the approved action
    console.log(`Executing approved action for request ${request.id}`);
  }

  private async progressToNextLevel(request: any): Promise<void> {
    // Implementation would move to next approval level
    console.log(`Moving request ${request.id} to next approval level`);
  }

  private async notifyApprovers(requestId: string, approvalLevel: ApprovalLevel): Promise<void> {
    // Implementation would send notifications to approvers
    console.log(`Notifying approvers for request ${requestId} at level ${approvalLevel.level}`);
  }

  private async notifyApprovalCompletion(request: any, outcome: string): Promise<void> {
    // Implementation would notify stakeholders of completion
    console.log(`Notifying completion of request ${request.id}: ${outcome}`);
  }

  private async sendInformationRequest(request: any, action: ApprovalAction): Promise<void> {
    // Implementation would send information request
    console.log(`Sending information request for ${request.id}`);
  }

  private async updateApproverAssignment(requestId: string, newApproverId: string): Promise<void> {
    // Implementation would update approver assignment
    console.log(`Delegating request ${requestId} to ${newApproverId}`);
  }

  private async notifyDelegatedApprover(request: any, action: ApprovalAction): Promise<void> {
    // Implementation would notify delegated approver
    console.log(`Notifying delegated approver ${action.delegatedTo} for request ${request.id}`);
  }

  private async createAuditTrailEntry(
    requestId: string,
    eventType: string,
    description: string,
    eventData: Record<string, any>
  ): Promise<void> {
    // Implementation would create audit trail entry
    console.log(`Audit: ${eventType} - ${description} for request ${requestId}`);
  }

  private generateApprovalId(): string {
    return 'approval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Check approval system health
      return true;
    } catch (error) {
      console.error('Approval service health check failed:', error);
      return false;
    }
  }
}

// Helper function for logging (would be imported from logging service)
function log_info(message: string): void {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}