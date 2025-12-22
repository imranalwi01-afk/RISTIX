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

// Input types for audit operations
export interface AuditEventInput {
  eventType: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValues?: any;
  newValues?: any;
  businessProcess?: string;
  bankingType?: 'conventional' | 'syariah';
  tags?: string[];
}

export interface UserActivityInput {
  activityType: string;
  pageUrl?: string;
  actionPerformed?: string;
  targetEntity?: string;
  targetId?: string;
  actionResult: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  moduleAccessed?: string;
  additionalData?: any;
}

export interface DataAccessInput {
  accessedTable: string;
  accessedSchema?: string;
  accessType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  recordIds?: string[];
  recordCount?: number;
  sensitiveFields?: string[];
  sqlQuery?: string;
  businessJustification?: string;
  approvalReference?: string;
  rowsAffected?: number;
  dataExported?: boolean;
  exportFormat?: string;
  applicationName?: string;
  containsPii?: boolean;
  gdprBasis?: string;
  metadata?: any;
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
  initiatedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  syariahComplianceChecked?: boolean;
}
