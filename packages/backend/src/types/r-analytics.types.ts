// packages/backend/src/types/r-analytics.types.ts
// ============================================================================
// 🔬 R ANALYTICS BRIDGE TYPES - TypeScript definitions for R Analytics integration
// ============================================================================
// Based on TodoList-v2.md Hour 8 requirements
// ============================================================================

export interface RAnalyticsConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  apiKey?: string;
  healthCheckInterval: number;
}

export interface CalculationRequest {
  modelName: string;
  data: any[];
  parameters: Record<string, any>;
  calculationType: 'ECL' | 'PD' | 'LGD' | 'EAD' | 'STAGING';
  bankingType: 'CONVENTIONAL' | 'SYARIAH';
  tenantId: string;
  userId: string;
  requestId: string;
}

export interface CalculationResponse {
  success: boolean;
  results: any;
  metadata: {
    executionTime: number;
    recordsProcessed: number;
    modelVersion: string;
    rVersion: string;
    warnings?: string[];
    errors?: string[];
  };
  requestId: string;
  timestamp: Date;
}

export interface ModelInfo {
  name: string;
  version: string;
  description: string;
  parameters: Record<string, any>;
  bankingTypeSupported: string[];
  lastUpdated: Date;
  isActive: boolean;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  rVersion: string;
  availableModels: string[];
  memory: {
    used: number;
    available: number;
    percentage: number;
  };
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  errors: string[];
}

// Request/Response interfaces for API endpoints
export interface ECLCalculationRequest {
  modelName: string;
  data: Array<{
    accountId: string;
    outstandingAmount: number;
    pdRating: string;
    lgdRate?: number;
    maturityDate: string;
    originationDate: string;
    currentStage: number;
    bankingType: 'CONVENTIONAL' | 'SYARIAH';
    [key: string]: any;
  }>;
  parameters?: {
    discountRate?: number;
    recoveryRate?: number;
    prepaymentRate?: number;
    scenarioWeights?: number[];
    [key: string]: any;
  };
}

export interface PDCalculationRequest {
  modelName: string;
  data: Array<{
    accountId: string;
    customerRating: string;
    industryCode?: string;
    financialMetrics: Record<string, number>;
    behavioralMetrics?: Record<string, number>;
    macroeconomicFactors?: Record<string, number>;
    [key: string]: any;
  }>;
  parameters?: {
    referenceDate: string;
    timeHorizon: number; // months
    ratingMigrationMatrix?: number[][];
    [key: string]: any;
  };
}

export interface LGDCalculationRequest {
  modelName: string;
  data: Array<{
    accountId: string;
    collateralValue?: number;
    collateralType?: string;
    securityRanking?: string;
    recoveryHistory?: Record<string, number>;
    [key: string]: any;
  }>;
  parameters?: {
    cureRate?: number;
    collateralHaircut?: number;
    recoveryTimeframe?: number;
    [key: string]: any;
  };
}

export interface EADCalculationRequest {
  modelName: string;
  data: Array<{
    accountId: string;
    currentBalance: number;
    committedLimit: number;
    utilizedAmount: number;
    creditConversionFactor?: number;
    [key: string]: any;
  }>;
  parameters?: {
    stressScenario?: string;
    drawdownRate?: number;
    [key: string]: any;
  };
}

export interface StagingRequest {
  modelName: string;
  data: Array<{
    accountId: string;
    currentPD: number;
    originationPD: number;
    daysPastDue: number;
    significantIncreaseThreshold: number;
    creditImpairedIndicator?: boolean;
    qualitativeIndicators?: string[];
    [key: string]: any;
  }>;
  parameters?: {
    quantitativeThreshold?: number;
    pdChangeThreshold?: number;
    daysPastDueThresholds?: {
      stage2: number;
      stage3: number;
    };
    [key: string]: any;
  };
}

// Result interfaces
export interface ECLResult {
  accountId: string;
  eclAmount: number;
  stage: 1 | 2 | 3;
  twelveMonthECL: number;
  lifetimeECL: number;
  pdValue: number;
  lgdValue: number;
  eadValue: number;
  discountedValue: number;
  scenarioResults?: Array<{
    scenarioName: string;
    eclAmount: number;
    weight: number;
  }>;
}

export interface PDResult {
  accountId: string;
  pdValue: number;
  ratingGrade: string;
  pdCurve: Array<{
    month: number;
    cumulativePD: number;
    marginalPD: number;
  }>;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
}

export interface LGDResult {
  accountId: string;
  lgdValue: number;
  expectedRecovery: number;
  collateralValue: number;
  unsecuredLoss: number;
  recoveryTimeline: Array<{
    month: number;
    expectedRecovery: number;
  }>;
}

export interface EADResult {
  accountId: string;
  eadValue: number;
  currentExposure: number;
  potentialFutureExposure: number;
  creditConversionFactor: number;
  drawdownScenarios: Array<{
    scenarioName: string;
    eadValue: number;
    probability: number;
  }>;
}

export interface StagingResult {
  accountId: string;
  currentStage: 1 | 2 | 3;
  previousStage: 1 | 2 | 3;
  stageTransition: boolean;
  transitionReason: string[];
  quantitativeIndicators: {
    pdIncrease: number;
    daysPastDue: number;
    thresholdBreached: boolean;
  };
  qualitativeIndicators: string[];
  nextReviewDate: string;
}