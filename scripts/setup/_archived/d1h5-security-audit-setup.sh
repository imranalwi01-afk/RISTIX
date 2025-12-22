#!/bin/bash
# scripts/setup/d1h5-security-services-setup.sh
# IFRS9 Platform - Day 1 Hour 5: Security Framework & Audit System Services Setup

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h5-security-services-setup-$(date +%Y%m%d-%H%M%S).log"

# Create necessary directories (local project directories, NOT system directories)
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
    log_info "Validating environment for security services setup..."
    
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
        log_error "Backend package directory not found. Run d1h1-enterprise-setup.sh first"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create directory structure for security services
create_service_directories() {
    log_info "Creating security services directory structure..."
    
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    
    # Core services directories
    mkdir -p "${backend_src}/core/services/"{audit,workflow,security,compliance,notification,approval}
    
    # API directories
    mkdir -p "${backend_src}/api/controllers"
    mkdir -p "${backend_src}/api/routes"
    mkdir -p "${backend_src}/api/middleware"
    mkdir -p "${backend_src}/api/validators"
    
    # Utils directories
    mkdir -p "${backend_src}/utils/"{audit,security,workflow,compliance}
    
    # Types directories
    mkdir -p "${backend_src}/types/"{audit,workflow,security}
    
    log_success "Security services directory structure created"
}

# Create audit service
create_audit_service() {
    log_info "Creating audit service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/audit/audit.service.ts"
    
    cat > "$service_file" << 'EOF'
// packages/backend/src/core/services/audit/audit.service.ts
import { Sequelize, Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { TenantContext } from '../../../types/tenant.types';
import { AuditLogEntry, UserActivityLog, DataAccessLog, CalculationAuditLog } from '../../../types/audit.types';
import { DatabaseService } from '../database/database.service';
import { ConfigurationService } from '../configuration/configuration.service';

export interface AuditServiceConfig {
  enableRealTimeAudit: boolean;
  auditRetentionDays: number;
  sensitiveFieldMasking: boolean;
  complianceMode: 'strict' | 'standard' | 'minimal';
  batchSize: number;
}

export interface AuditEventInput {
  eventType: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValues?: any;
  newValues?: any;
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  apiEndpoint?: string;
  requestMethod?: string;
  bankingType?: 'conventional' | 'syariah';
  businessProcess?: string;
  complianceRelevant?: boolean;
  regulatoryImpact?: boolean;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: any;
  tags?: string[];
}

export interface UserActivityInput {
  userId: string;
  sessionId: string;
  activityType: string;
  pageUrl?: string;
  actionPerformed?: string;
  targetEntity?: string;
  targetId?: string;
  actionResult?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  responseTimeMs?: number;
  bankingType?: 'conventional' | 'syariah';
  moduleAccessed?: string;
}

export interface DataAccessInput {
  userId: string;
  accessedTable: string;
  accessedSchema?: string;
  accessType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  recordIds?: string[];
  recordCount?: number;
  sensitiveFields?: string[];
  businessJustification?: string;
  approvalReference?: string;
  bankingType?: 'conventional' | 'syariah';
  containsPii?: boolean;
  gdprBasis?: string;
}

export interface CalculationAuditInput {
  calculationType: string;
  calculationRunId: string;
  jobId?: string;
  inputParameters?: any;
  dataSources?: string[];
  modelVersions?: any;
  calculationMethod?: string;
  rScriptVersion?: string;
  algorithmVersion?: string;
  calculationStatus: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  resultsSummary?: any;
  validationResults?: any;
  calculationDurationMs?: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
  initiatedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  bankingType?: 'conventional' | 'syariah';
  syariahComplianceChecked?: boolean;
  errorDetails?: any;
  warnings?: string[];
}

export class AuditService {
  private readonly databaseService: DatabaseService;
  private readonly configService: ConfigurationService;
  private config: AuditServiceConfig;

  constructor(
    databaseService: DatabaseService,
    configService: ConfigurationService
  ) {
    this.databaseService = databaseService;
    this.configService = configService;
    this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    this.config = await this.configService.getServiceConfig('audit', {
      enableRealTimeAudit: true,
      auditRetentionDays: 2555, // 7 years
      sensitiveFieldMasking: true,
      complianceMode: 'strict',
      batchSize: 1000
    });
  }

  /**
   * Create comprehensive audit log entry
   */
  async createAuditLog(
    tenantContext: TenantContext,
    input: AuditEventInput,
    transaction?: Transaction
  ): Promise<AuditLogEntry> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      const auditEntry = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        oldValues: this.maskSensitiveData(input.oldValues),
        newValues: this.maskSensitiveData(input.newValues),
        changedFields: this.extractChangedFields(input.oldValues, input.newValues),
        changeSummary: this.generateChangeSummary(input.oldValues, input.newValues),
        userId: input.userId,
        sessionId: input.sessionId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        apiEndpoint: input.apiEndpoint,
        requestMethod: input.requestMethod,
        bankingType: input.bankingType,
        businessProcess: input.businessProcess,
        complianceRelevant: input.complianceRelevant || false,
        regulatoryImpact: input.regulatoryImpact || false,
        riskLevel: input.riskLevel || 'LOW',
        timestamp: new Date(),
        createdAt: new Date(),
        metadata: input.metadata,
        tags: input.tags || []
      };

      const result = await db.query(
        `INSERT INTO audit.audit_logs (
          id, tenant_id, event_type, entity_type, entity_id, entity_name,
          old_values, new_values, changed_fields, change_summary,
          user_id, session_id, ip_address, user_agent, api_endpoint, request_method,
          banking_type, business_process, compliance_relevant, regulatory_impact, risk_level,
          timestamp, created_at, metadata, tags
        ) VALUES (
          :id, :tenantId, :eventType, :entityType, :entityId, :entityName,
          :oldValues, :newValues, :changedFields, :changeSummary,
          :userId, :sessionId, :ipAddress, :userAgent, :apiEndpoint, :requestMethod,
          :bankingType, :businessProcess, :complianceRelevant, :regulatoryImpact, :riskLevel,
          :timestamp, :createdAt, :metadata, :tags
        ) RETURNING *`,
        {
          replacements: auditEntry,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      // Real-time compliance monitoring
      if (auditEntry.complianceRelevant || auditEntry.regulatoryImpact) {
        await this.triggerComplianceMonitoring(tenantContext, auditEntry);
      }

      return auditEntry;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw new Error(`Failed to create audit log: ${error.message}`);
    }
  }

  /**
   * Log user activity for session tracking
   */
  async logUserActivity(
    tenantContext: TenantContext,
    input: UserActivityInput,
    transaction?: Transaction
  ): Promise<UserActivityLog> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      const activityLog = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        userId: input.userId,
        sessionId: input.sessionId,
        activityType: input.activityType,
        pageUrl: input.pageUrl,
        actionPerformed: input.actionPerformed,
        targetEntity: input.targetEntity,
        targetId: input.targetId,
        actionResult: input.actionResult || 'SUCCESS',
        errorMessage: input.errorMessage,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        responseTimeMs: input.responseTimeMs,
        bankingType: input.bankingType,
        moduleAccessed: input.moduleAccessed,
        activityTimestamp: new Date(),
        additionalData: {
          sessionDuration: await this.calculateSessionDuration(input.sessionId),
          pageLoadTime: input.responseTimeMs
        }
      };

      const result = await db.query(
        `INSERT INTO audit.user_activity_logs (
          id, tenant_id, user_id, session_id, activity_type,
          page_url, action_performed, target_entity, target_id,
          action_result, error_message, ip_address, user_agent,
          response_time_ms, banking_type, module_accessed,
          activity_timestamp, additional_data
        ) VALUES (
          :id, :tenantId, :userId, :sessionId, :activityType,
          :pageUrl, :actionPerformed, :targetEntity, :targetId,
          :actionResult, :errorMessage, :ipAddress, :userAgent,
          :responseTimeMs, :bankingType, :moduleAccessed,
          :activityTimestamp, :additionalData
        ) RETURNING *`,
        {
          replacements: activityLog,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      return activityLog;
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw new Error(`Failed to log user activity: ${error.message}`);
    }
  }

  /**
   * Log data access for sensitive data tracking
   */
  async logDataAccess(
    tenantContext: TenantContext,
    input: DataAccessInput,
    transaction?: Transaction
  ): Promise<DataAccessLog> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      const dataAccessLog = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        userId: input.userId,
        accessedTable: input.accessedTable,
        accessedSchema: input.accessedSchema || 'core',
        accessType: input.accessType,
        recordIds: input.recordIds,
        recordCount: input.recordCount || 0,
        sensitiveFields: input.sensitiveFields,
        businessJustification: input.businessJustification,
        approvalReference: input.approvalReference,
        bankingType: input.bankingType,
        containsPii: input.containsPii || false,
        gdprBasis: input.gdprBasis,
        accessTimestamp: new Date(),
        metadata: {
          queryHash: this.generateQueryHash(input),
          dataClassification: await this.classifyDataSensitivity(input.accessedTable, input.sensitiveFields)
        }
      };

      const result = await db.query(
        `INSERT INTO audit.data_access_logs (
          id, tenant_id, user_id, accessed_table, accessed_schema, access_type,
          record_ids, record_count, sensitive_fields, business_justification,
          approval_reference, banking_type, contains_pii, gdpr_basis,
          access_timestamp, metadata
        ) VALUES (
          :id, :tenantId, :userId, :accessedTable, :accessedSchema, :accessType,
          :recordIds, :recordCount, :sensitiveFields, :businessJustification,
          :approvalReference, :bankingType, :containsPii, :gdprBasis,
          :accessTimestamp, :metadata
        ) RETURNING *`,
        {
          replacements: dataAccessLog,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      return dataAccessLog;
    } catch (error) {
      console.error('Error logging data access:', error);
      throw new Error(`Failed to log data access: ${error.message}`);
    }
  }

  /**
   * Log financial calculation audit
   */
  async logCalculationAudit(
    tenantContext: TenantContext,
    input: CalculationAuditInput,
    transaction?: Transaction
  ): Promise<CalculationAuditLog> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      const calculationLog = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        calculationType: input.calculationType,
        calculationRunId: input.calculationRunId,
        jobId: input.jobId,
        inputParameters: input.inputParameters,
        dataSources: input.dataSources,
        modelVersions: input.modelVersions,
        calculationMethod: input.calculationMethod,
        rScriptVersion: input.rScriptVersion,
        algorithmVersion: input.algorithmVersion,
        calculationStatus: input.calculationStatus,
        resultsSummary: input.resultsSummary,
        validationResults: input.validationResults,
        calculationDurationMs: input.calculationDurationMs,
        memoryUsageMb: input.memoryUsageMb,
        cpuUsagePercent: input.cpuUsagePercent,
        initiatedBy: input.initiatedBy,
        reviewedBy: input.reviewedBy,
        approvedBy: input.approvedBy,
        bankingType: input.bankingType,
        syariahComplianceChecked: input.syariahComplianceChecked || false,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        errorDetails: input.errorDetails,
        warnings: input.warnings
      };

      const result = await db.query(
        `INSERT INTO audit.calculation_audit_logs (
          id, tenant_id, calculation_type, calculation_run_id, job_id,
          input_parameters, data_sources, model_versions, calculation_method,
          r_script_version, algorithm_version, calculation_status,
          results_summary, validation_results, calculation_duration_ms,
          memory_usage_mb, cpu_usage_percent, initiated_by, reviewed_by, approved_by,
          banking_type, syariah_compliance_checked, started_at, completed_at, created_at,
          error_details, warnings
        ) VALUES (
          :id, :tenantId, :calculationType, :calculationRunId, :jobId,
          :inputParameters, :dataSources, :modelVersions, :calculationMethod,
          :rScriptVersion, :algorithmVersion, :calculationStatus,
          :resultsSummary, :validationResults, :calculationDurationMs,
          :memoryUsageMb, :cpuUsagePercent, :initiatedBy, :reviewedBy, :approvedBy,
          :bankingType, :syariahComplianceChecked, :startedAt, :completedAt, :createdAt,
          :errorDetails, :warnings
        ) RETURNING *`,
        {
          replacements: calculationLog,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      return calculationLog;
    } catch (error) {
      console.error('Error logging calculation audit:', error);
      throw new Error(`Failed to log calculation audit: ${error.message}`);
    }
  }

  /**
   * Query audit logs with filters
   */
  async queryAuditLogs(
    tenantContext: TenantContext,
    filters: {
      eventType?: string;
      entityType?: string;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      riskLevel?: string;
      complianceRelevant?: boolean;
      bankingType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      let whereClause = 'WHERE tenant_id = :tenantId';
      const replacements: any = { tenantId: tenantContext.tenantId };

      if (filters.eventType) {
        whereClause += ' AND event_type = :eventType';
        replacements.eventType = filters.eventType;
      }

      if (filters.entityType) {
        whereClause += ' AND entity_type = :entityType';
        replacements.entityType = filters.entityType;
      }

      if (filters.userId) {
        whereClause += ' AND user_id = :userId';
        replacements.userId = filters.userId;
      }

      if (filters.dateFrom) {
        whereClause += ' AND timestamp >= :dateFrom';
        replacements.dateFrom = filters.dateFrom;
      }

      if (filters.dateTo) {
        whereClause += ' AND timestamp <= :dateTo';
        replacements.dateTo = filters.dateTo;
      }

      if (filters.riskLevel) {
        whereClause += ' AND risk_level = :riskLevel';
        replacements.riskLevel = filters.riskLevel;
      }

      if (filters.complianceRelevant !== undefined) {
        whereClause += ' AND compliance_relevant = :complianceRelevant';
        replacements.complianceRelevant = filters.complianceRelevant;
      }

      if (filters.bankingType) {
        whereClause += ' AND banking_type = :bankingType';
        replacements.bankingType = filters.bankingType;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM audit.audit_logs ${whereClause}`;
      const countResult = await db.query(countQuery, {
        replacements,
        type: db.QueryTypes.SELECT
      });
      const total = countResult[0].total;

      // Get paginated results
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      
      const dataQuery = `
        SELECT * FROM audit.audit_logs 
        ${whereClause} 
        ORDER BY timestamp DESC 
        LIMIT :limit OFFSET :offset
      `;
      
      replacements.limit = limit;
      replacements.offset = offset;

      const logs = await db.query(dataQuery, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      return { logs, total };
    } catch (error) {
      console.error('Error querying audit logs:', error);
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    tenantContext: TenantContext,
    reportType: 'GDPR' | 'SOX' | 'BASEL' | 'AAOIFI',
    dateFrom: Date,
    dateTo: Date
  ): Promise<any> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);
      
      const reportQueries = {
        GDPR: this.buildGDPRComplianceQuery(),
        SOX: this.buildSOXComplianceQuery(),
        BASEL: this.buildBaselComplianceQuery(),
        AAOIFI: this.buildAAOIFIComplianceQuery()
      };

      const query = reportQueries[reportType];
      const result = await db.query(query, {
        replacements: {
          tenantId: tenantContext.tenantId,
          dateFrom,
          dateTo
        },
        type: db.QueryTypes.SELECT
      });

      return {
        reportType,
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo },
        data: result,
        summary: await this.generateReportSummary(result, reportType)
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error(`Failed to generate compliance report: ${error.message}`);
    }
  }

  // Private helper methods
  private maskSensitiveData(data: any): any {
    if (!data || !this.config.sensitiveFieldMasking) return data;
    
    const sensitiveFields = [
      'password', 'ssn', 'account_number', 'card_number', 
      'phone', 'email', 'national_id', 'passport'
    ];
    
    const masked = { ...data };
    sensitiveFields.forEach(field => {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    });
    
    return masked;
  }

  private extractChangedFields(oldValues: any, newValues: any): string[] {
    if (!oldValues || !newValues) return [];
    
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    allKeys.forEach(key => {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changedFields.push(key);
      }
    });
    
    return changedFields;
  }

  private generateChangeSummary(oldValues: any, newValues: any): string {
    const changedFields = this.extractChangedFields(oldValues, newValues);
    if (changedFields.length === 0) return 'No changes detected';
    
    return `Modified fields: ${changedFields.join(', ')}`;
  }

  private async triggerComplianceMonitoring(
    tenantContext: TenantContext,
    auditEntry: any
  ): Promise<void> {
    // Real-time compliance monitoring logic
    // This would trigger alerts, notifications, or automated responses
    console.log('Compliance monitoring triggered for:', auditEntry.eventType);
  }

  private async calculateSessionDuration(sessionId: string): Promise<number> {
    // Calculate session duration from first activity
    return 0; // Placeholder
  }

  private generateQueryHash(input: DataAccessInput): string {
    const hashData = `${input.accessedTable}-${input.accessType}-${input.sensitiveFields?.join(',')}`;
    return Buffer.from(hashData).toString('base64');
  }

  private async classifyDataSensitivity(table: string, fields?: string[]): Promise<string> {
    // Data classification logic
    const sensitivePatterns = ['account', 'customer', 'payment', 'personal'];
    const isSensitive = sensitivePatterns.some(pattern => 
      table.toLowerCase().includes(pattern) || 
      fields?.some(field => field.toLowerCase().includes(pattern))
    );
    
    return isSensitive ? 'SENSITIVE' : 'NORMAL';
  }

  private buildGDPRComplianceQuery(): string {
    return `
      SELECT 
        event_type,
        COUNT(*) as event_count,
        COUNT(CASE WHEN contains_pii THEN 1 END) as pii_events,
        COUNT(CASE WHEN gdpr_basis IS NOT NULL THEN 1 END) as justified_events
      FROM audit.data_access_logs 
      WHERE tenant_id = :tenantId 
        AND access_timestamp BETWEEN :dateFrom AND :dateTo
      GROUP BY event_type
    `;
  }

  private buildSOXComplianceQuery(): string {
    return `
      SELECT 
        entity_type,
        COUNT(*) as changes,
        COUNT(CASE WHEN regulatory_impact THEN 1 END) as financial_impact,
        COUNT(CASE WHEN compliance_relevant THEN 1 END) as compliance_relevant
      FROM audit.audit_logs 
      WHERE tenant_id = :tenantId 
        AND timestamp BETWEEN :dateFrom AND :dateTo
        AND (regulatory_impact = true OR compliance_relevant = true)
      GROUP BY entity_type
    `;
  }

  private buildBaselComplianceQuery(): string {
    return `
      SELECT 
        calculation_type,
        COUNT(*) as calculations,
        COUNT(CASE WHEN calculation_status = 'SUCCESS' THEN 1 END) as successful,
        AVG(calculation_duration_ms) as avg_duration
      FROM audit.calculation_audit_logs 
      WHERE tenant_id = :tenantId 
        AND created_at BETWEEN :dateFrom AND :dateTo
      GROUP BY calculation_type
    `;
  }

  private buildAAOIFIComplianceQuery(): string {
    return `
      SELECT 
        business_process,
        COUNT(*) as activities,
        COUNT(CASE WHEN syariah_compliance_checked THEN 1 END) as syariah_checked,
        COUNT(CASE WHEN banking_type = 'syariah' THEN 1 END) as syariah_activities
      FROM audit.calculation_audit_logs 
      WHERE tenant_id = :tenantId 
        AND created_at BETWEEN :dateFrom AND :dateTo
        AND banking_type IN ('syariah', 'dual')
      GROUP BY business_process
    `;
  }

  private async generateReportSummary(data: any[], reportType: string): Promise<any> {
    return {
      totalRecords: data.length,
      reportType,
      complianceScore: this.calculateComplianceScore(data, reportType),
      recommendations: this.generateRecommendations(data, reportType)
    };
  }

  private calculateComplianceScore(data: any[], reportType: string): number {
    // Simple compliance scoring logic
    if (data.length === 0) return 100;
    
    switch (reportType) {
      case 'GDPR':
        const piiCompliance = data.reduce((acc, row) => 
          acc + (row.justified_events / Math.max(row.pii_events, 1)), 0) / data.length;
        return Math.round(piiCompliance * 100);
      
      case 'SOX':
        const financialCompliance = data.reduce((acc, row) => 
          acc + (row.compliance_relevant / Math.max(row.changes, 1)), 0) / data.length;
        return Math.round(financialCompliance * 100);
      
      default:
        return 95; // Default score
    }
  }

  private generateRecommendations(data: any[], reportType: string): string[] {
    const recommendations: string[] = [];
    
    if (reportType === 'GDPR') {
      recommendations.push('Ensure all PII access has proper justification');
      recommendations.push('Regular GDPR compliance training for staff');
    }
    
    if (reportType === 'SOX') {
      recommendations.push('Implement stronger change control procedures');
      recommendations.push('Regular financial data access reviews');
    }
    
    return recommendations;
  }
}
EOF

    log_success "Audit service created successfully"
}

# Create workflow service
create_workflow_service() {
    log_info "Creating workflow service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/core/services/workflow/workflow.service.ts"
    
    cat > "$service_file" << 'EOF'
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
EOF

    log_success "Workflow service created successfully"
}

# Install required dependencies
install_dependencies() {
    log_info "Installing security services dependencies..."
    
    cd "${PROJECT_ROOT}/packages/backend"
    
    # Install additional dependencies for security services
    pnpm add uuid @types/uuid
    pnpm add winston
    pnpm add nodemailer @types/nodemailer
    pnpm add crypto-js @types/crypto-js
    pnpm add jsonwebtoken @types/jsonwebtoken
    
    log_success "Dependencies installed successfully"
}

# Create TypeScript types
create_typescript_types() {
    log_info "Creating TypeScript types for security services..."
    
    local types_dir="${PROJECT_ROOT}/packages/backend/src/types"
    
    # Audit types
    cat > "${types_dir}/audit.types.ts" << 'EOF'
// packages/backend/src/types/audit.types.ts

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  changeSummary?: string;
  userId: string;
  userName?: string;
  userRole?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  apiEndpoint?: string;
  requestMethod?: string;
  bankingType?: 'conventional' | 'syariah';
  businessProcess?: string;
  calculationRunId?: string;
  complianceRelevant: boolean;
  regulatoryImpact: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  createdAt: Date;
  metadata?: any;
  tags?: string[];
}

export interface UserActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  sessionId: string;
  activityType: string;
  pageUrl?: string;
  actionPerformed?: string;
  targetEntity?: string;
  targetId?: string;
  actionResult: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  responseTimeMs?: number;
  bankingType?: 'conventional' | 'syariah';
  moduleAccessed?: string;
  activityTimestamp: Date;
  sessionDuration?: number;
  additionalData?: any;
}

export interface DataAccessLog {
  id: string;
  tenantId: string;
  userId: string;
  accessedTable: string;
  accessedSchema?: string;
  accessType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  recordIds?: string[];
  recordCount?: number;
  sensitiveFields?: string[];
  sqlQuery?: string;
  queryHash?: string;
  businessJustification?: string;
  approvalReference?: string;
  rowsAffected?: number;
  dataExported?: boolean;
  exportFormat?: string;
  ipAddress?: string;
  applicationName?: string;
  bankingType?: 'conventional' | 'syariah';
  containsPii?: boolean;
  gdprBasis?: string;
  accessTimestamp: Date;
  metadata?: any;
}

export interface CalculationAuditLog {
  id: string;
  tenantId: string;
  calculationType: string;
  calculationRunId: string;
  jobId?: string;
  inputParameters?: any;
  dataSources?: string[];
  modelVersions?: any;
  calculationMethod?: string;
  rScriptVersion?: string;
  algorithmVersion?: string;
  calculationStatus: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  resultsSummary?: any;
  validationResults?: any;
  calculationDurationMs?: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
  initiatedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  bankingType?: 'conventional' | 'syariah';
  syariahComplianceChecked?: boolean;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  errorDetails?: any;
  warnings?: string[];
}

export interface ComplianceReport {
  reportType: 'GDPR' | 'SOX' | 'BASEL' | 'AAOIFI';
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  data: any[];
  summary: {
    totalRecords: number;
    complianceScore: number;
    recommendations: string[];
  };
}

export interface AuditQueryFilters {
  eventType?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  riskLevel?: string;
  complianceRelevant?: boolean;
  bankingType?: string;
  limit?: number;
  offset?: number;
}
EOF

    # Workflow types
    cat > "${types_dir}/workflow.types.ts" << 'EOF'
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
EOF

    log_success "TypeScript types created successfully"
}

# Verify services setup
verify_services_setup() {
    log_info "Verifying security services setup..."
    
    # Check if service files exist
    local backend_src="${PROJECT_ROOT}/packages/backend/src"
    local required_files=(
        "${backend_src}/core/services/audit/audit.service.ts"
        "${backend_src}/core/services/workflow/workflow.service.ts"
        "${backend_src}/types/audit.types.ts"
        "${backend_src}/types/workflow.types.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "✓ $(basename "$file") created"
        else
            log_error "✗ $(basename "$file") missing"
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
    
    log_success "Security services setup verification completed successfully"
}

# MANDATORY: Main function
main() {
    log_info "🚀 Starting IFRS9 Platform - Day 1 Hour 5: Security Framework & Audit System Services Setup"
    
    # Validate environment
    validate_environment
    
    # Create directory structure
    log_info "📁 Creating security services directory structure..."
    create_service_directories
    
    # Install dependencies
    log_info "📦 Installing required dependencies..."
    install_dependencies
    
    # Create TypeScript types
    log_info "📝 Creating TypeScript types..."
    create_typescript_types
    
    # Create core services
    log_info "⚙️ Creating audit service..."
    create_audit_service
    
    log_info "🔄 Creating workflow service..."
    create_workflow_service
    
    # Verify setup
    log_info "✅ Verifying services setup..."
    verify_services_setup
    
    log_success "🎉 Day 1 Hour 5: Security Framework & Audit System Services Setup completed successfully!"
    log_info "📋 Next step: Continue with Day 1 Hour 6 - Banking Data Models & Portfolio Management"
}

# Execute main function with all arguments
main "$@"