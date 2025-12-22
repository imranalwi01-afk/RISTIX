#!/bin/bash
# scripts/setup/d1h5-api-controllers-setup.sh
# IFRS9 Platform - Day 1 Hour 5: Security Framework API Controllers Setup

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h5-api-controllers-setup-$(date +%Y%m%d-%H%M%S).log"

# Create necessary directories (local project directories)
mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads,config}

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

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for API controllers setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Install with: npm install -g pnpm"
        exit 1
    fi
    
    # Check backend directory structure
    if [[ ! -d "${PROJECT_ROOT}/packages/backend" ]]; then
        log_error "Backend package directory not found. Run previous setup scripts first"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create API controllers directory structure
create_api_directories() {
    log_info "Creating API controllers directory structure..."
    
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    
    # API directories
    mkdir -p "${backend_src}/api/controllers"
    mkdir -p "${backend_src}/api/routes"
    mkdir -p "${backend_src}/api/middleware"
    mkdir -p "${backend_src}/api/validators"
    
    # Utils directories
    mkdir -p "${backend_src}/utils/"{audit,security,workflow,compliance}
    
    log_success "API controllers directory structure created"
}

# Generate Audit Controller
create_audit_controller() {
    log_info "Creating Audit Controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/api/controllers/audit.controller.ts"
    
    cat > "$controller_file" << 'EOF'
// packages/backend/src/api/controllers/audit.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuditService } from '../../core/services/audit/audit.service';
import { TenantContext } from '../../types/tenant.types';
import { AuditEventInput, UserActivityInput, DataAccessInput, CalculationAuditInput } from '../../types/audit.types';

// Validation schemas
const createAuditLogSchema = z.object({
  eventType: z.string().min(1).max(50),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid().optional(),
  entityName: z.string().max(255).optional(),
  oldValues: z.any().optional(),
  newValues: z.any().optional(),
  businessProcess: z.string().max(100).optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  complianceRelevant: z.boolean().optional(),
  regulatoryImpact: z.boolean().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  metadata: z.any().optional(),
  tags: z.array(z.string()).optional()
});

const userActivitySchema = z.object({
  activityType: z.string().min(1).max(50),
  pageUrl: z.string().url().optional(),
  actionPerformed: z.string().max(255).optional(),
  targetEntity: z.string().max(100).optional(),
  targetId: z.string().uuid().optional(),
  actionResult: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']).optional(),
  errorMessage: z.string().optional(),
  responseTimeMs: z.number().int().positive().optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  moduleAccessed: z.string().max(100).optional()
});

const auditQuerySchema = z.object({
  eventType: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  complianceRelevant: z.boolean().optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional()
});

export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Create audit log entry
   * POST /api/v1/audit/logs
   */
  public createAuditLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;
      const sessionId = req.sessionId;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Validate request body
      const validationResult = createAuditLogSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }

      const auditInput: AuditEventInput = {
        ...validationResult.data,
        userId,
        sessionId,
        ipAddress,
        userAgent,
        apiEndpoint: req.originalUrl,
        requestMethod: req.method
      };

      const auditEntry = await this.auditService.createAuditLog(tenantContext, auditInput);

      res.status(201).json({
        success: true,
        data: auditEntry
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      next(error);
    }
  };

  /**
   * Query audit logs
   * GET /api/v1/audit/logs
   */
  public queryAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate query parameters
      const validationResult = auditQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.errors
        });
        return;
      }

      const filters = {
        ...validationResult.data,
        dateFrom: validationResult.data.dateFrom ? new Date(validationResult.data.dateFrom) : undefined,
        dateTo: validationResult.data.dateTo ? new Date(validationResult.data.dateTo) : undefined
      };

      const result = await this.auditService.queryAuditLogs(tenantContext, filters);

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 50) < result.total
        }
      });
    } catch (error) {
      console.error('Error querying audit logs:', error);
      next(error);
    }
  };

  /**
   * Generate compliance report
   * POST /api/v1/audit/compliance/report
   */
  public generateComplianceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { reportType, dateFrom, dateTo } = req.body;

      const report = await this.auditService.generateComplianceReport(
        tenantContext,
        reportType,
        new Date(dateFrom),
        new Date(dateTo)
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      next(error);
    }
  };

  /**
   * Export audit logs
   * GET /api/v1/audit/export
   */
  public exportAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { format = 'csv', ...queryParams } = req.query;

      const result = await this.auditService.queryAuditLogs(tenantContext, {
        ...queryParams,
        limit: 10000
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `audit-logs-${tenantContext.tenantSlug}-${timestamp}.${format}`;

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(this.convertToCSV(result.logs));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json({
          success: true,
          data: result.logs
        });
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      next(error);
    }
  };

  private convertToCSV(logs: any[]): string {
    if (logs.length === 0) return '';
    
    const headers = ['id', 'eventType', 'entityType', 'userId', 'timestamp', 'riskLevel', 'complianceRelevant'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(header => `"${log[header] || ''}"`);
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}
EOF

    log_success "Audit Controller created successfully"
}

# Generate Workflow Controller
create_workflow_controller() {
    log_info "Creating Workflow Controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/api/controllers/workflow.controller.ts"
    
    cat > "$controller_file" << 'EOF'
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
EOF

    log_success "Workflow Controller created successfully"
}

# Generate Security Controller
create_security_controller() {
    log_info "Creating Security Controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/api/controllers/security.controller.ts"
    
    cat > "$controller_file" << 'EOF'
// packages/backend/src/api/controllers/security.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TenantContext } from '../../types/tenant.types';

// Validation schemas
const securityEventSchema = z.object({
  eventType: z.enum(['LOGIN_ATTEMPT', 'ACCESS_DENIED', 'PRIVILEGE_ESCALATION', 'SUSPICIOUS_ACTIVITY']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().max(500),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.any().optional()
});

const threatAssessmentSchema = z.object({
  ipAddress: z.string().ip().optional(),
  userId: z.string().uuid().optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional()
});

export class SecurityController {
  /**
   * Report security event
   * POST /api/v1/security/events
   */
  public reportSecurityEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;

      // Validate request body
      const validationResult = securityEventSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid security event data',
          details: validationResult.error.errors
        });
        return;
      }

      const securityEvent = {
        ...validationResult.data,
        tenantId: tenantContext.tenantId,
        reportedBy: userId,
        timestamp: new Date(),
        ipAddress: validationResult.data.ipAddress || req.ip,
        userAgent: validationResult.data.userAgent || req.get('User-Agent')
      };

      // Here you would save to platform audit or security logs
      // For now, just log and return success
      console.log('Security event reported:', securityEvent);

      res.status(201).json({
        success: true,
        data: {
          eventId: `sec-${Date.now()}`,
          message: 'Security event recorded successfully',
          severity: securityEvent.severity
        }
      });
    } catch (error) {
      console.error('Error reporting security event:', error);
      next(error);
    }
  };

  /**
   * Get security dashboard data
   * GET /api/v1/security/dashboard
   */
  public getSecurityDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { timeRange = '24h' } = req.query;

      // Mock security dashboard data
      const dashboardData = {
        summary: {
          totalEvents: 42,
          criticalAlerts: 2,
          blockedAttempts: 15,
          activeUsers: 128
        },
        threatLevel: 'MEDIUM',
        recentEvents: [
          {
            id: 'sec-001',
            type: 'LOGIN_ATTEMPT',
            severity: 'LOW',
            timestamp: new Date().toISOString(),
            description: 'Failed login attempt'
          }
        ],
        securityMetrics: {
          authenticationSuccessRate: 98.5,
          averageSessionDuration: 3600,
          suspiciousActivityCount: 3,
          complianceScore: 95.2
        }
      };

      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error getting security dashboard:', error);
      next(error);
    }
  };

  /**
   * Perform threat assessment
   * POST /api/v1/security/threat-assessment
   */
  public performThreatAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate request body
      const validationResult = threatAssessmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid threat assessment parameters',
          details: validationResult.error.errors
        });
        return;
      }

      // Mock threat assessment
      const threatAssessment = {
        assessmentId: `threat-${Date.now()}`,
        riskScore: 25.5,
        riskLevel: 'LOW',
        factors: [
          'Normal login patterns',
          'Familiar geographic location',
          'Standard banking hours activity'
        ],
        recommendations: [
          'Continue monitoring',
          'No immediate action required'
        ],
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: threatAssessment
      });
    } catch (error) {
      console.error('Error performing threat assessment:', error);
      next(error);
    }
  };

  /**
   * Get security configuration
   * GET /api/v1/security/configuration
   */
  public getSecurityConfiguration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Mock security configuration
      const securityConfig = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          maxAge: 90
        },
        sessionPolicy: {
          maxDuration: 8,
          idleTimeout: 30,
          concurrentSessions: 3
        },
        accessControl: {
          mfaRequired: true,
          ipWhitelisting: false,
          geofencing: true
        },
        auditSettings: {
          logLevel: 'DETAILED',
          retentionDays: 2555,
          realTimeAlerts: true
        }
      };

      res.status(200).json({
        success: true,
        data: securityConfig
      });
    } catch (error) {
      console.error('Error getting security configuration:', error);
      next(error);
    }
  };
}
EOF

    log_success "Security Controller created successfully"
}

# Generate Approval Controller
create_approval_controller() {
    log_info "Creating Approval Controller..."
    
    local controller_file="${PROJECT_ROOT}/packages/backend/src/api/controllers/approval.controller.ts"
    
    cat > "$controller_file" << 'EOF'
// packages/backend/src/api/controllers/approval.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TenantContext } from '../../types/tenant.types';

// Validation schemas
const approvalRequestSchema = z.object({
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'EXECUTE']),
  reason: z.string().max(500),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  approvers: z.array(z.string().uuid()).optional(),
  data: z.any().optional()
});

const bulkApprovalSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
  decision: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().max(1000).optional()
});

export class ApprovalController {
  /**
   * Request approval for an action
   * POST /api/v1/approvals/request
   */
  public requestApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;

      // Validate request body
      const validationResult = approvalRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid approval request data',
          details: validationResult.error.errors
        });
        return;
      }

      const approvalRequest = {
        ...validationResult.data,
        requesterId: userId,
        tenantId: tenantContext.tenantId,
        status: 'PENDING',
        createdAt: new Date(),
        approvalId: `apr-${Date.now()}`
      };

      // Mock approval request creation
      console.log('Approval request created:', approvalRequest);

      res.status(201).json({
        success: true,
        data: approvalRequest
      });
    } catch (error) {
      console.error('Error requesting approval:', error);
      next(error);
    }
  };

  /**
   * Get approval details
   * GET /api/v1/approvals/:approvalId
   */
  public getApprovalDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { approvalId } = req.params;

      if (!approvalId) {
        res.status(400).json({
          success: false,
          error: 'Invalid approval ID'
        });
        return;
      }

      // Mock approval details
      const approvalDetails = {
        id: approvalId,
        entityType: 'portfolio_account',
        entityId: 'acc-123',
        action: 'UPDATE',
        status: 'PENDING',
        requesterId: 'user-123',
        reason: 'Update account parameters for IFRS 9 compliance',
        approvalChain: [
          {
            level: 1,
            approver: 'manager-123',
            status: 'PENDING',
            assignedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        bankingType: 'conventional'
      };

      res.status(200).json({
        success: true,
        data: approvalDetails
      });
    } catch (error) {
      console.error('Error getting approval details:', error);
      next(error);
    }
  };

  /**
   * Approve or reject multiple tasks
   * POST /api/v1/approvals/bulk-decision
   */
  public processBulkApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;

      // Validate request body
      const validationResult = bulkApprovalSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid bulk approval data',
          details: validationResult.error.errors
        });
        return;
      }

      const { taskIds, decision, comments } = validationResult.data;

      // Mock bulk approval processing
      const results = taskIds.map(taskId => ({
        taskId,
        decision,
        approver: userId,
        processedAt: new Date().toISOString(),
        success: true
      }));

      res.status(200).json({
        success: true,
        data: {
          processedCount: taskIds.length,
          successCount: results.filter(r => r.success).length,
          failureCount: results.filter(r => !r.success).length,
          results
        }
      });
    } catch (error) {
      console.error('Error processing bulk approval:', error);
      next(error);
    }
  };

  /**
   * Get approval statistics
   * GET /api/v1/approvals/statistics
   */
  public getApprovalStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id;
      const { dateFrom, dateTo, scope = 'tenant' } = req.query;

      // Mock approval statistics
      const statistics = {
        pending: {
          total: 15,
          urgent: 3,
          overdue: 2,
          assignedToMe: scope === 'user' ? 5 : undefined
        },
        completed: {
          today: 8,
          thisWeek: 42,
          thisMonth: 156,
          approved: 134,
          rejected: 22
        },
        performance: {
          averageProcessingTime: '2.5 hours',
          onTimeRate: 94.5,
          escalationRate: 5.2
        },
        breakdown: {
          byEntityType: {
            'portfolio_account': 45,
            'calculation_job': 32,
            'configuration': 18,
            'user_management': 12
          },
          byUrgency: {
            'URGENT': 8,
            'HIGH': 23,
            'NORMAL': 67,
            'LOW': 15
          }
        }
      };

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting approval statistics:', error);
      next(error);
    }
  };

  /**
   * Get approval history
   * GET /api/v1/approvals/history
   */
  public getApprovalHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { entityType, entityId, limit = '50', offset = '0' } = req.query;

      const filters = {
        entityType: entityType as string,
        entityId: entityId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      // Mock approval history
      const history = [
        {
          id: 'apr-001',
          entityType: 'portfolio_account',
          entityId: 'acc-123',
          action: 'UPDATE',
          status: 'APPROVED',
          requestedBy: 'user-456',
          approvedBy: 'manager-789',
          requestedAt: '2025-01-20T10:00:00Z',
          completedAt: '2025-01-20T14:30:00Z',
          reason: 'Update ECL parameters'
        }
      ];

      res.status(200).json({
        success: true,
        data: history,
        pagination: {
          total: 1,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: false
        }
      });
    } catch (error) {
      console.error('Error getting approval history:', error);
      next(error);
    }
  };
}
EOF

    log_success "Approval Controller created successfully"
}

# Verify controllers setup
verify_controllers_setup() {
    log_info "Verifying API controllers setup..."
    
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    local required_controllers=(
        "${backend_src}/api/controllers/audit.controller.ts"
        "${backend_src}/api/controllers/workflow.controller.ts"
        "${backend_src}/api/controllers/security.controller.ts"
        "${backend_src}/api/controllers/approval.controller.ts"
    )
    
    for controller in "${required_controllers[@]}"; do
        if [[ -f "$controller" ]]; then
            log_success "✓ $(basename "$controller") created"
        else
            log_error "✗ $(basename "$controller") missing"
            return 1
        fi
    done
    
    # Check TypeScript compilation
    cd "${PROJECT_ROOT}/packages/backend"
    if pnpm run type-check 2>/dev/null; then
        log_success "✓ TypeScript compilation successful"
    else
        log_error "✗ TypeScript compilation failed"
        return 1
    fi
    
    log_success "API controllers setup verification completed successfully"
}

# MANDATORY: Main function
main() {
    log_info "🚀 Starting IFRS9 Platform - Day 1 Hour 5: Security Framework API Controllers Setup"
    
    # Validate environment
    validate_environment
    
    # Create directory structure
    log_info "📁 Creating API controllers directory structure..."
    create_api_directories
    
    # Create controllers
    log_info "⚙️ Creating Audit Controller..."
    create_audit_controller
    
    log_info "🔄 Creating Workflow Controller..."
    create_workflow_controller
    
    log_info "🔒 Creating Security Controller..."
    create_security_controller
    
    log_info "✅ Creating Approval Controller..."
    create_approval_controller
    
    # Verify setup
    log_info "🔍 Verifying controllers setup..."
    verify_controllers_setup
    
    log_success "🎉 Day 1 Hour 5: Security Framework API Controllers Setup completed successfully!"
    log_info "📋 Next step: Run d1h5-middleware-setup.sh to create security middleware"
}

# Execute main function with all arguments
main "$@"