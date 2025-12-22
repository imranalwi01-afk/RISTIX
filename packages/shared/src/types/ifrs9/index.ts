// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/ifrs9/index.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: None (Pure TypeScript types)
// Purpose: Shared TypeScript type definitions for IFRS 9 services
// ============================================================================

/**
 * IFRS 9 Stage enumeration
 */
export enum Ifrs9Stage {
  STAGE_1 = 1,
  STAGE_2 = 2,
  STAGE_3 = 3
}

/**
 * Banking type enumeration
 */
export enum BankingType {
  CONVENTIONAL = 'conventional',
  SYARIAH = 'syariah',
  DUAL = 'dual'
}

/**
 * Calculation method enumeration
 */
export enum CalculationMethod {
  COLLECTIVE = 'collective',
  INDIVIDUAL = 'individual'
}

/**
 * Portfolio Account interface
 */
export interface PortfolioAccount {
  id: string;
  tenantId: string;
  accountId: string;
  customerId: string;
  contractId?: string;
  productType: string;
  outstandingAmount: number;
  committedAmount?: number;
  originalAmount: number;
  currency: string;
  originationDate: Date;
  maturityDate?: Date;
  reportingDate: Date;
  currentStage: Ifrs9Stage;
  previousStage?: Ifrs9Stage;
  stageChangeDate?: Date;
  customerName?: string;
  customerType?: string;
  industryCode?: string;
  internalRating?: string;
  externalRating?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ECL Calculation Input interface
 */
export interface EclCalculationInput {
  tenantId: string;
  portfolioAccountIds?: string[];
  reportingDate: Date;
  scenarioId?: string;
  calculationMethod: CalculationMethod;
  forceRecalculation?: boolean;
}

/**
 * ECL Calculation Result interface
 */
export interface EclCalculationResult {
  calculationId: string;
  portfolioAccountId: string;
  currentStage: Ifrs9Stage;
  previousStage?: Ifrs9Stage;
  pd12Month: number;
  pdLifetime: number;
  lgd: number;
  ead: number;
  ecl12Month: number;
  eclLifetime: number;
  finalEcl: number;
  calculationDate: Date;
  methodology: string;
}

/**
 * ECL Calculation Summary interface
 */
export interface EclCalculationSummary {
  calculationId: string;
  totalAccounts: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  totalEcl: number;
  stage1Ecl: number;
  stage2Ecl: number;
  stage3Ecl: number;
  calculationTime: number;
  status: 'completed' | 'failed' | 'in_progress';
}

/**
 * Staging Analysis Input interface
 */
export interface StagingAnalysisInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  forceRecalculation?: boolean;
}

/**
 * Staging Analysis Result interface
 */
export interface StagingAnalysisResult {
  portfolioAccountId: string;
  currentStage: Ifrs9Stage;
  previousStage: Ifrs9Stage;
  stageChangeDate?: Date;
  stagingReason: string;
  daysPastDue: number;
  hasSignificantIncrease: boolean;
  isDefaulted: boolean;
  riskIndicators: RiskIndicators;
  stagingHistory: StagingHistoryEntry[];
}

/**
 * Risk Indicators interface
 */
export interface RiskIndicators {
  quantitativeFactors: {
    daysPastDue: number;
    utilizationRate: number;
    paymentBehavior: string;
  };
  qualitativeFactors: {
    industryRisk: string;
    managementQuality: string;
    businessConditions: string;
  };
  macroeconomicFactors: {
    gdpGrowth: number;
    unemploymentRate: number;
    interestRateEnvironment: string;
  };
}

/**
 * Staging History Entry interface
 */
export interface StagingHistoryEntry {
  id: string;
  portfolioAccountId: string;
  fromStage: Ifrs9Stage;
  toStage: Ifrs9Stage;
  stageChangeDate: Date;
  reason: string;
  daysPastDue: number;
  riskIndicators: RiskIndicators;
}

/**
 * PD Calculation Input interface
 */
export interface PdCalculationInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  stage: Ifrs9Stage;
  modelType?: 'statistical' | 'rating_based' | 'hybrid';
}

/**
 * PD Calculation Result interface
 */
export interface PdCalculationResult {
  portfolioAccountId: string;
  pd12Month: number;
  pdLifetime: number;
  pdCurve: Array<{ period: number; pd: number }>;
  modelType: string;
  modelVersion: string;
  calculationDate: Date;
  parameters: {
    baseRate: number;
    riskFactors: any;
    adjustments: any;
  };
}

/**
 * LGD Calculation Input interface
 */
export interface LgdCalculationInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  downturnLgd?: boolean;
  collateralRevaluation?: boolean;
}

/**
 * LGD Calculation Result interface
 */
export interface LgdCalculationResult {
  portfolioAccountId: string;
  lgd: number;
  recoveryRate: number;
  collateralValue: number;
  collateralCoverage: number;
  unsecuredPortion: number;
  securedRecoveryRate: number;
  unsecuredRecoveryRate: number;
  downturnAdjustment: number;
  calculationDate: Date;
  methodology: string;
  parameters: {
    collateralTypes: any[];
    recoveryRates: any;
    costOfRecovery: number;
    timeToRecovery: number;
  };
}

/**
 * EAD Computation Input interface
 */
export interface EadComputationInput {
  tenantId: string;
  portfolioAccountId: string;
  reportingDate: Date;
  timeHorizon?: number;
  includeFutureBehavior?: boolean;
}

/**
 * EAD Computation Result interface
 */
export interface EadComputationResult {
  portfolioAccountId: string;
  ead: number;
  outstandingAmount: number;
  committedAmount: number;
  undrawnAmount: number;
  ccf: number;
  expectedDrawdown: number;
  isOnBalanceSheet: boolean;
  isOffBalanceSheet: boolean;
  calculationDate: Date;
  timeHorizon: number;
  methodology: string;
  parameters: {
    ccfParameters: any;
    behaviorParameters: any;
    adjustments: any;
  };
}

/**
 * Aggregation Input interface
 */
export interface AggregationInput {
  tenantId: string;
  calculationBatchId: string;
  reportingDate: Date;
  aggregationLevel: 'portfolio' | 'product' | 'customer_segment' | 'stage';
  filterCriteria?: {
    productTypes?: string[];
    customerSegments?: string[];
    stages?: Ifrs9Stage[];
    branches?: string[];
  };
}

/**
 * Aggregation Result interface
 */
export interface AggregationResult {
  aggregationId: string;
  level: string;
  levelValue: string;
  totalAccounts: number;
  totalExposure: number;
  totalEcl: number;
  stage1Summary: StageAggregation;
  stage2Summary: StageAggregation;
  stage3Summary: StageAggregation;
  coverageRatio: number;
  calculationDate: Date;
  reportingDate: Date;
}

/**
 * Stage Aggregation interface
 */
export interface StageAggregation {
  accountCount: number;
  totalExposure: number;
  totalEcl: number;
  averagePd: number;
  averageLgd: number;
  coverageRatio: number;
  weightedAverageMaturity?: number;
}

/**
 * Portfolio Summary interface
 */
export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalEclProvision: number;
  overallCoverageRatio: number;
  stageDistribution: {
    stage1Percentage: number;
    stage2Percentage: number;
    stage3Percentage: number;
  };
  eclDistribution: {
    stage1EclPercentage: number;
    stage2EclPercentage: number;
    stage3EclPercentage: number;
  };
  movementAnalysis: {
    newAccounts: number;
    upgrades: number;
    downgrades: number;
    writeOffs: number;
  };
}

/**
 * Validation Input interface
 */
export interface ValidationInput {
  tenantId: string;
  calculationBatchId: string;
  validationType: 'pre_calculation' | 'post_calculation' | 'data_quality';
  scope: 'portfolio' | 'account' | 'calculation';
  portfolioAccountId?: string;
  calculationId?: string;
}

/**
 * Validation Result Summary interface
 */
export interface ValidationResultSummary {
  validationId: string;
  batchId: string;
  validationType: string;
  scope: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  overallStatus: 'passed' | 'failed' | 'warning';
  validationDate: Date;
  details: ValidationDetail[];
}

/**
 * Validation Detail interface
 */
export interface ValidationDetail {
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  severity: 'error' | 'warning' | 'info';
  status: 'passed' | 'failed' | 'warning';
  entityType: string;
  entityId: string;
  expectedValue?: any;
  actualValue?: any;
  message: string;
  recommendations?: string[];
}

/**
 * Audit Log Input interface
 */
export interface AuditLogInput {
  tenantId: string;
  userId: string;
  sessionId?: string;
  eventType: string;
  eventCategory: 'calculation' | 'configuration' | 'data_upload' | 'system' | 'user_action';
  entityType: string;
  entityId: string;
  description: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  businessDate?: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Trail Query interface
 */
export interface AuditTrailQuery {
  tenantId: string;
  entityType?: string;
  entityId?: string;
  eventType?: string;
  eventCategory?: string;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Audit Trail Response interface
 */
export interface AuditTrailResponse {
  auditLogs: AuditLogEntry[];
  totalCount: number;
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    eventTypes: { [key: string]: number };
    eventCategories: { [key: string]: number };
  };
}

/**
 * Audit Log Entry interface
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: string;
  entityType: string;
  entityId: string;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  businessDate?: Date;
}

/**
 * API Response wrapper interfaces
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  stack?: string; // Only in development
}

/**
 * Model parameter interfaces
 */
export interface ModelParameter {
  id: string;
  modelType: string;
  parameterKey: string;
  parameterValue: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  validationRules?: any;
  isRequired: boolean;
  defaultValue?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration interfaces
 */
export interface Ifrs9Configuration {
  tenantId: string;
  calculationSettings: {
    defaultMethod: CalculationMethod;
    enableParallelProcessing: boolean;
    batchSize: number;
    timeoutSeconds: number;
  };
  stagingParameters: {
    stage2DpdThreshold: number;
    stage3DpdThreshold: number;
    sicrPdThreshold: number;
    sicrRatingNotches: number;
  };
  modelParameters: {
    pdModel: {
      defaultModel: string;
      calibrationFrequency: string;
      backtestingFrequency: string;
    };
    lgdModel: {
      defaultModel: string;
      downturnMultiplier: number;
      recoveryRates: { [key: string]: number };
    };
    eadModel: {
      defaultCcf: number;
      stressMultiplier: number;
      behaviorModeling: boolean;
    };
  };
  validationRules: {
    dataQualityChecks: boolean;
    businessLogicValidation: boolean;
    calculationConsistency: boolean;
    regulatoryCompliance: boolean;
  };
  auditSettings: {
    enableDetailedLogging: boolean;
    retentionPeriodDays: number;
    complianceReporting: boolean;
  };
}

// Export all types
export * from './models';
export * from './enums';
export * from './constants';
