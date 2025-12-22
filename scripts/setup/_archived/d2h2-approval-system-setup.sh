#!/bin/bash
# scripts/setup/d2h2-approval-system-setup.sh
# DAY 2 HOUR 2: Four-Eyes Approval System - FILE GENERATOR
# OBJECTIVE: Enterprise approval workflows with multi-level approvals

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h2-approval-system-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Load environment variables
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
fi

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for approval system setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Install with: npm install -g pnpm"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Generate approval system folder structure
generate_approval_directories() {
    log_info "Generating approval system directory structure..."
    
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    
    # Create approval system directories following exact project structure
    local directories=(
        "${backend_src}/core/services/approval"
        "${backend_src}/api/controllers/approval"
        "${backend_src}/api/routes/approval"
        "${backend_src}/api/middleware/approval"
        "${backend_src}/api/validators/approval"
        "${backend_src}/core/models/approval"
        "${backend_src}/core/repositories/approval"
        "${backend_src}/utils/approval"
        "${backend_src}/config/approval"
        "${PROJECT_ROOT}/database/schemas/approval"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "${dir}"
        log_info "Created directory: ${dir}"
    done
    
    log_success "Approval system directories created"
}

# Generate four-eyes approval service file
generate_four_eyes_approval_service() {
    log_info "Generating four-eyes approval service file..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/approval/four-eyes-approval.service.ts"
    
    cat > "${service_file}" << 'EOF'
// packages/backend/src/core/services/approval/four-eyes-approval.service.ts

import { injectable, inject } from 'inversify';
import { Transaction } from 'sequelize';
import { Logger } from '../../../utils/logger';
import { DatabaseService } from '../database/database.service';
import { NotificationService } from '../notifications/notification.service';
import { AuditService } from '../audit/audit.service';
import { approvalConfig, ApprovalSystemConfig } from '../../../config/approval/approval.config';

// Four-Eyes Approval Types
interface ApprovalRequest {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  approvalType: 'four_eyes' | 'multi_level' | 'single';
  requiredApprovers: number;
  currentApprovers: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'normal' | 'high' | 'critical';
  expiresAt: Date;
  requestData: Record<string, any>;
  businessJustification: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

interface ApprovalAction {
  id: string;
  approvalRequestId: string;
  approverId: string;
  action: 'approve' | 'reject' | 'delegate' | 'request_info';
  comments: string;
  actionAt: Date;
  ipAddress?: string;
  userAgent?: string;
  delegatedTo?: string;
}

interface ApprovalHierarchy {
  id: string;
  tenantId: string;
  entityType: string;
  level: number;
  roleRequired: string;
  minApprovers: number;
  maxApprovers: number;
  timeoutHours: number;
  escalationRoles: string[];
  conditions: Record<string, any>;
}

interface DelegationRule {
  id: string;
  tenantId: string;
  delegatorId: string;
  delegateId: string;
  entityTypes: string[];
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  conditions: Record<string, any>;
}

@injectable()
export class FourEyesApprovalService {
  private readonly logger = new Logger('FourEyesApprovalService');
  private readonly config: ApprovalSystemConfig;

  constructor(
    @inject('DatabaseService') private databaseService: DatabaseService,
    @inject('NotificationService') private notificationService: NotificationService,
    @inject('AuditService') private auditService: AuditService
  ) {
    this.config = approvalConfig;
  }

  /**
   * Create approval request
   */
  public async createApprovalRequest(
    tenantId: string,
    request: {
      entityType: string;
      entityId: string;
      requestedBy: string;
      requestData: Record<string, any>;
      businessJustification: string;
      priority?: 'low' | 'normal' | 'high' | 'critical';
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<ApprovalRequest> {
    const transaction = await this.databaseService.transaction();

    try {
      // Determine approval type and required approvers
      const approvalHierarchy = await this.getApprovalHierarchy(tenantId, request.entityType, request.requestData);
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (approvalHierarchy?.timeoutHours || this.config.defaultTimeoutHours));

      // Create approval request
      const approvalRequest = await this.databaseService.query(
        `INSERT INTO approval.requests 
         (tenant_id, entity_type, entity_id, requested_by, approval_type, required_approvers, 
          status, priority, expires_at, request_data, business_justification, risk_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          tenantId,
          request.entityType,
          request.entityId,
          request.requestedBy,
          approvalHierarchy ? 'multi_level' : 'four_eyes',
          approvalHierarchy?.minApprovers || 2,
          'pending',
          request.priority || 'normal',
          expiresAt,
          JSON.stringify(request.requestData),
          request.businessJustification,
          request.riskLevel || 'medium'
        ],
        { transaction }
      );

      // Create approval hierarchy steps if applicable
      if (approvalHierarchy) {
        await this.createApprovalSteps(approvalRequest[0].id, approvalHierarchy, transaction);
      }

      // Notify potential approvers
      await this.notifyApprovers(tenantId, approvalRequest[0], approvalHierarchy);

      await transaction.commit();

      await this.auditService.logActivity({
        tenantId,
        userId: request.requestedBy,
        action: 'approval_request_created',
        entityType: 'approval_request',
        entityId: approvalRequest[0].id,
        details: {
          entityType: request.entityType,
          entityId: request.entityId,
          priority: request.priority,
          riskLevel: request.riskLevel
        }
      });

      this.logger.info('Approval request created', {
        tenantId,
        approvalRequestId: approvalRequest[0].id,
        entityType: request.entityType,
        entityId: request.entityId,
        requestedBy: request.requestedBy
      });

      return approvalRequest[0] as ApprovalRequest;

    } catch (error) {
      await transaction.rollback();
      this.logger.error('Failed to create approval request', { error, tenantId, request });
      throw new Error(`Failed to create approval request: ${error.message}`);
    }
  }

  /**
   * Process approval action
   */
  public async processApprovalAction(
    tenantId: string,
    approvalRequestId: string,
    action: {
      approverId: string;
      action: 'approve' | 'reject' | 'delegate' | 'request_info';
      comments: string;
      delegatedTo?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{ success: boolean; status: string; nextApprovers?: string[] }> {
    const transaction = await this.databaseService.transaction();

    try {
      // Get approval request
      const approvalRequest = await this.databaseService.query(
        `SELECT * FROM approval.requests WHERE id = $1 AND tenant_id = $2`,
        [approvalRequestId, tenantId]
      );

      if (!approvalRequest.length) {
        throw new Error('Approval request not found');
      }

      const request = approvalRequest[0];

      // Validate approval request status
      if (request.status !== 'pending') {
        throw new Error(`Cannot process action on ${request.status} approval request`);
      }

      // Check if request has expired
      if (new Date() > new Date(request.expires_at)) {
        await this.expireApprovalRequest(approvalRequestId, transaction);
        throw new Error('Approval request has expired');
      }

      // Validate approver permissions
      await this.validateApproverPermissions(tenantId, action.approverId, request);

      // Record approval action
      await this.databaseService.query(
        `INSERT INTO approval.actions 
         (approval_request_id, approver_id, action, comments, ip_address, user_agent, delegated_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          approvalRequestId,
          action.approverId,
          action.action,
          action.comments,
          action.ipAddress,
          action.userAgent,
          action.delegatedTo
        ],
        { transaction }
      );

      let finalStatus = 'pending';
      let nextApprovers: string[] = [];

      // Process based on action type
      switch (action.action) {
        case 'approve':
          const result = await this.processApproval(request, action.approverId, transaction);
          finalStatus = result.status;
          nextApprovers = result.nextApprovers || [];
          break;

        case 'reject':
          finalStatus = await this.processRejection(request, action.approverId, action.comments, transaction);
          break;

        case 'delegate':
          if (!action.delegatedTo) {
            throw new Error('Delegation target is required');
          }
          await this.processDelegation(request, action.approverId, action.delegatedTo, transaction);
          finalStatus = 'pending'; // Still pending after delegation
          break;

        case 'request_info':
          await this.processInfoRequest(request, action.approverId, action.comments, transaction);
          finalStatus = 'pending'; // Still pending after info request
          break;

        default:
          throw new Error(`Unknown approval action: ${action.action}`);
      }

      // Update approval request status
      if (finalStatus !== 'pending') {
        await this.databaseService.query(
          `UPDATE approval.requests SET status = $1, updated_at = NOW() WHERE id = $2`,
          [finalStatus, approvalRequestId],
          { transaction }
        );
      }

      await transaction.commit();

      // Send notifications based on final status
      await this.sendActionNotifications(tenantId, request, action, finalStatus, nextApprovers);

      await this.auditService.logActivity({
        tenantId,
        userId: action.approverId,
        action: `approval_${action.action}`,
        entityType: 'approval_request',
        entityId: approvalRequestId,
        details: {
          originalEntityType: request.entity_type,
          originalEntityId: request.entity_id,
          finalStatus,
          comments: action.comments
        }
      });

      this.logger.info('Approval action processed', {
        tenantId,
        approvalRequestId,
        action: action.action,
        approverId: action.approverId,
        finalStatus
      });

      return {
        success: true,
        status: finalStatus,
        nextApprovers: nextApprovers.length > 0 ? nextApprovers : undefined
      };

    } catch (error) {
      await transaction.rollback();
      this.logger.error('Failed to process approval action', { error, tenantId, approvalRequestId, action });
      throw new Error(`Failed to process approval action: ${error.message}`);
    }
  }

  /**
   * Get pending approvals for user
   */
  public async getPendingApprovals(
    tenantId: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
      priority?: string;
      entityType?: string;
    } = {}
  ): Promise<{
    approvals: ApprovalRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { page = 1, limit = 10, priority, entityType } = options;
      const offset = (page - 1) * limit;

      let whereClause = `WHERE ar.tenant_id = $1 AND ar.status = 'pending' 
                        AND (ah.role_required IN (
                          SELECT role_name FROM user_roles WHERE user_id = $2
                        ) OR ar.requested_by = $2)`;
      const params: any[] = [tenantId, userId];
      let paramIndex = 3;

      if (priority) {
        whereClause += ` AND ar.priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      if (entityType) {
        whereClause += ` AND ar.entity_type = $${paramIndex}`;
        params.push(entityType);
        paramIndex++;
      }

      // Get total count
      const countResult = await this.databaseService.query(
        `SELECT COUNT(DISTINCT ar.id) as total 
         FROM approval.requests ar
         LEFT JOIN approval.hierarchy ah ON ar.entity_type = ah.entity_type AND ar.tenant_id = ah.tenant_id
         ${whereClause}`,
        params
      );

      // Get approvals with pagination
      const approvals = await this.databaseService.query(
        `SELECT DISTINCT ar.*, 
                COUNT(aa.id) as current_approvers,
                STRING_AGG(DISTINCT u.name, ', ') as approver_names
         FROM approval.requests ar
         LEFT JOIN approval.hierarchy ah ON ar.entity_type = ah.entity_type AND ar.tenant_id = ah.tenant_id
         LEFT JOIN approval.actions aa ON ar.id = aa.approval_request_id AND aa.action = 'approve'
         LEFT JOIN users u ON aa.approver_id = u.id
         ${whereClause}
         GROUP BY ar.id
         ORDER BY ar.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      return {
        approvals: approvals as ApprovalRequest[],
        total: parseInt(countResult[0].total),
        page,
        limit
      };

    } catch (error) {
      this.logger.error('Failed to get pending approvals', { error, tenantId, userId, options });
      throw new Error(`Failed to get pending approvals: ${error.message}`);
    }
  }

  /**
   * Create delegation rule
   */
  public async createDelegationRule(
    tenantId: string,
    delegation: {
      delegatorId: string;
      delegateId: string;
      entityTypes: string[];
      validFrom: Date;
      validTo: Date;
      conditions?: Record<string, any>;
    }
  ): Promise<DelegationRule> {
    const transaction = await this.databaseService.transaction();

    try {
      // Validate delegation permissions
      await this.validateDelegationPermissions(tenantId, delegation.delegatorId, delegation.delegateId);

      // Create delegation rule
      const delegationRule = await this.databaseService.query(
        `INSERT INTO approval.delegation_rules 
         (tenant_id, delegator_id, delegate_id, entity_types, valid_from, valid_to, conditions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          tenantId,
          delegation.delegatorId,
          delegation.delegateId,
          delegation.entityTypes,
          delegation.validFrom,
          delegation.validTo,
          JSON.stringify(delegation.conditions || {})
        ],
        { transaction }
      );

      await transaction.commit();

      await this.auditService.logActivity({
        tenantId,
        userId: delegation.delegatorId,
        action: 'delegation_rule_created',
        entityType: 'delegation_rule',
        entityId: delegationRule[0].id,
        details: {
          delegateId: delegation.delegateId,
          entityTypes: delegation.entityTypes,
          validFrom: delegation.validFrom,
          validTo: delegation.validTo
        }
      });

      this.logger.info('Delegation rule created', {
        tenantId,
        delegationRuleId: delegationRule[0].id,
        delegatorId: delegation.delegatorId,
        delegateId: delegation.delegateId
      });

      return delegationRule[0] as DelegationRule;

    } catch (error) {
      await transaction.rollback();
      this.logger.error('Failed to create delegation rule', { error, tenantId, delegation });
      throw new Error(`Failed to create delegation rule: ${error.message}`);
    }
  }

  // Private helper methods
  private async getApprovalHierarchy(
    tenantId: string, 
    entityType: string, 
    requestData: Record<string, any>
  ): Promise<ApprovalHierarchy | null> {
    const hierarchy = await this.databaseService.query(
      `SELECT * FROM approval.hierarchy 
       WHERE tenant_id = $1 AND entity_type = $2 
       ORDER BY level ASC`,
      [tenantId, entityType]
    );

    return hierarchy.length > 0 ? hierarchy[0] as ApprovalHierarchy : null;
  }

  private async createApprovalSteps(
    approvalRequestId: string, 
    hierarchy: ApprovalHierarchy, 
    transaction: Transaction
  ): Promise<void> {
    await this.databaseService.query(
      `INSERT INTO approval.steps (approval_request_id, level, role_required, min_approvers, timeout_hours)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        approvalRequestId,
        hierarchy.level,
        hierarchy.roleRequired,
        hierarchy.minApprovers,
        hierarchy.timeoutHours
      ],
      { transaction }
    );
  }

  private async notifyApprovers(
    tenantId: string, 
    approvalRequest: ApprovalRequest, 
    hierarchy: ApprovalHierarchy | null
  ): Promise<void> {
    // Get potential approvers based on hierarchy or default roles
    const approvers = await this.getEligibleApprovers(tenantId, approvalRequest, hierarchy);
    
    for (const approver of approvers) {
      await this.notificationService.sendApprovalNotification({
        tenantId,
        approverId: approver.id,
        approvalRequestId: approvalRequest.id,
        entityType: approvalRequest.entityType,
        priority: approvalRequest.priority,
        expiresAt: approvalRequest.expiresAt
      });
    }
  }

  private async getEligibleApprovers(
    tenantId: string, 
    approvalRequest: ApprovalRequest, 
    hierarchy: ApprovalHierarchy | null
  ): Promise<any[]> {
    let roleFilter = "role_name IN ('approver', 'admin', 'supervisor')";
    
    if (hierarchy) {
      roleFilter = `role_name = '${hierarchy.roleRequired}'`;
    }

    return await this.databaseService.query(
      `SELECT u.id, u.name, u.email 
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.tenant_id = $1 AND ${roleFilter} AND u.is_active = true`,
      [tenantId]
    );
  }

  private async validateApproverPermissions(
    tenantId: string, 
    approverId: string, 
    request: ApprovalRequest
  ): Promise<void> {
    const approver = await this.databaseService.query(
      `SELECT u.*, ur.role_name 
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1 AND u.tenant_id = $2`,
      [approverId, tenantId]
    );

    if (!approver.length) {
      throw new Error('Approver not found or insufficient permissions');
    }

    // Additional permission checks can be added here
  }

  private async processApproval(
    request: ApprovalRequest, 
    approverId: string, 
    transaction: Transaction
  ): Promise<{ status: string; nextApprovers?: string[] }> {
    // Increment current approvers count
    const updatedRequest = await this.databaseService.query(
      `UPDATE approval.requests 
       SET current_approvers = current_approvers + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [request.id],
      { transaction }
    );

    const newCount = updatedRequest[0].current_approvers;
    const required = updatedRequest[0].required_approvers;

    if (newCount >= required) {
      return { status: 'approved' };
    } else {
      return { status: 'pending', nextApprovers: [] };
    }
  }

  private async processRejection(
    request: ApprovalRequest, 
    approverId: string, 
    comments: string, 
    transaction: Transaction
  ): Promise<string> {
    // Any rejection results in final rejection
    return 'rejected';
  }

  private async processDelegation(
    request: ApprovalRequest, 
    delegatorId: string, 
    delegatedTo: string, 
    transaction: Transaction
  ): Promise<void> {
    // Create delegation record and notify delegate
    await this.databaseService.query(
      `INSERT INTO approval.delegations (approval_request_id, delegator_id, delegate_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [request.id, delegatorId, delegatedTo],
      { transaction }
    );
  }

  private async processInfoRequest(
    request: ApprovalRequest, 
    requesterId: string, 
    infoRequest: string, 
    transaction: Transaction
  ): Promise<void> {
    // Create info request record and notify requester
    await this.databaseService.query(
      `INSERT INTO approval.info_requests (approval_request_id, requester_id, info_request, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [request.id, requesterId, infoRequest],
      { transaction }
    );
  }

  private async expireApprovalRequest(approvalRequestId: string, transaction: Transaction): Promise<void> {
    await this.databaseService.query(
      `UPDATE approval.requests SET status = 'expired', updated_at = NOW() WHERE id = $1`,
      [approvalRequestId],
      { transaction }
    );
  }

  private async sendActionNotifications(
    tenantId: string,
    request: ApprovalRequest,
    action: any,
    finalStatus: string,
    nextApprovers: string[]
  ): Promise<void> {
    // Send notifications based on the action and final status
    // Implementation depends on notification service
  }

  private async validateDelegationPermissions(
    tenantId: string,
    delegatorId: string,
    delegateId: string
  ): Promise<void> {
    // Validate that both users exist and have appropriate permissions
    const users = await this.databaseService.query(
      `SELECT id, role_name FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id IN ($1, $2) AND u.tenant_id = $3`,
      [delegatorId, delegateId, tenantId]
    );

    if (users.length !== 2) {
      throw new Error('Invalid delegator or delegate');
    }
  }
}

EOF

    log_success "Generated four-eyes approval service: ${service_file}"
}

# Generate multi-level approval service file
generate_multi_level_approval_service() {
    log_info "Generating multi-level approval service file..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/approval/multi-level-approval.service.ts"
    
    cat > "${service_file}" << 'EOF'
// packages/backend/src/core/services/approval/multi-level-approval.service.ts

import { injectable, inject } from 'inversify';
import { Transaction } from 'sequelize';
import { Logger } from '../../../utils/logger';
import { DatabaseService } from '../database/database.service';
import { NotificationService } from '../notifications/notification.service';

interface ApprovalLevel {
  id: string;
  tenantId: string;
  entityType: string;
  level: number;
  levelName: string;
  roleRequired: string;
  minApprovers: number;
  maxApprovers: number;
  timeoutHours: number;
  escalationRoles: string[];
  autoApprovalThreshold?: number;
  conditions: Record<string, any>;
  isParallel: boolean;
  createdAt: Date;
}

interface LevelApproval {
  id: string;
  approvalRequestId: string;
  level: number;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  comments: string;
  approvedAt?: Date;
  escalatedAt?: Date;
  escalatedTo?: string;
}

@injectable()
export class MultiLevelApprovalService {
  private readonly logger = new Logger('MultiLevelApprovalService');

  constructor(
    @inject('DatabaseService') private databaseService: DatabaseService,
    @inject('NotificationService') private notificationService: NotificationService
  ) {}

  /**
   * Create multi-level approval hierarchy
   */
  public async createApprovalHierarchy(
    tenantId: string,
    hierarchy: {
      entityType: string;
      levels: Array<{
        level: number;
        levelName: string;
        roleRequired: string;
        minApprovers: number;
        maxApprovers?: number;
        timeoutHours: number;
        escalationRoles: string[];
        autoApprovalThreshold?: number;
        conditions?: Record<string, any>;
        isParallel?: boolean;
      }>;
    }
  ): Promise<ApprovalLevel[]> {
    const transaction = await this.databaseService.transaction();

    try {
      const createdLevels: ApprovalLevel[] = [];

      // Create each approval level
      for (const levelData of hierarchy.levels) {
        const level = await this.databaseService.query(
          `INSERT INTO approval.levels 
           (tenant_id, entity_type, level, level_name, role_required, min_approvers, 
            max_approvers, timeout_hours, escalation_roles, auto_approval_threshold, 
            conditions, is_parallel)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *`,
          [
            tenantId,
            hierarchy.entityType,
            levelData.level,
            levelData.levelName,
            levelData.roleRequired,
            levelData.minApprovers,
            levelData.maxApprovers || levelData.minApprovers,
            levelData.timeoutHours,
            levelData.escalationRoles,
            levelData.autoApprovalThreshold,
            JSON.stringify(levelData.conditions || {}),
            levelData.isParallel || false
          ],
          { transaction }
        );

        createdLevels.push(level[0] as ApprovalLevel);
      }

      await transaction.commit();

      this.logger.info('Multi-level approval hierarchy created', {
        tenantId,
        entityType: hierarchy.entityType,
        levels: hierarchy.levels.length
      });

      return cre