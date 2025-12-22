// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/constants/ifrs9/index.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: None (Pure TypeScript constants)
// Purpose: Shared constants and enumerations for IFRS 9 services
// ============================================================================

/**
 * IFRS 9 Stage Constants
 */
export const IFRS9_STAGES = {
  STAGE_1: 1,
  STAGE_2: 2,
  STAGE_3: 3
} as const;

/**
 * Banking Type Constants
 */
export const BANKING_TYPES = {
  CONVENTIONAL: 'conventional',
  SYARIAH: 'syariah',
  DUAL: 'dual'
} as const;

/**
 * Calculation Method Constants
 */
export const CALCULATION_METHODS = {
  COLLECTIVE: 'collective',
  INDIVIDUAL: 'individual'
} as const;

/**
 * Event Types for Audit Logging
 */
export const AUDIT_EVENT_TYPES = {
  ECL_CALCULATION_STARTED: 'ECL_CALCULATION_STARTED',
  ECL_CALCULATION_COMPLETED: 'ECL_CALCULATION_COMPLETED',
  ECL_CALCULATION_FAILED: 'ECL_CALCULATION_FAILED',
  STAGING_ANALYSIS_COMPLETED: 'STAGING_ANALYSIS_COMPLETED',
  PD_CALCULATION_COMPLETED: 'PD_CALCULATION_COMPLETED',
  LGD_CALCULATION_COMPLETED: 'LGD_CALCULATION_COMPLETED',
  EAD_COMPUTATION_COMPLETED: 'EAD_COMPUTATION_COMPLETED',
  RESULT_AGGREGATION_COMPLETED: 'RESULT_AGGREGATION_COMPLETED',
  VALIDATION_EXECUTED: 'VALIDATION_EXECUTED',
  DATA_UPLOADED: 'DATA_UPLOADED',
  CONFIGURATION_CHANGED: 'CONFIGURATION_CHANGED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION'
} as const;

/**
 * Event Categories for Audit Logging
 */
export const AUDIT_EVENT_CATEGORIES = {
  CALCULATION: 'calculation',
  CONFIGURATION: 'configuration',
  DATA_UPLOAD: 'data_upload',
  SYSTEM: 'system',
  USER_ACTION: 'user_action',
  SECURITY: 'security'
} as const;

/**
 * Validation Types
 */
export const VALIDATION_TYPES = {
  PRE_CALCULATION: 'pre_calculation',
  POST_CALCULATION: 'post_calculation',
  DATA_QUALITY: 'data_quality'
} as const;

/**
 * Validation Scopes
 */
export const VALIDATION_SCOPES = {
  PORTFOLIO: 'portfolio',
  ACCOUNT: 'account',
  CALCULATION: 'calculation'
} as const;

/**
 * Validation Severities
 */
export const VALIDATION_SEVERITIES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

/**
 * Model Types
 */
export const MODEL_TYPES = {
  PD: {
    STATISTICAL: 'statistical',
    RATING_BASED: 'rating_based',
    HYBRID: 'hybrid'
  },
  LGD: {
    COLLATERAL_BASED: 'collateral_based',
    HISTORICAL: 'historical',
    REGULATORY: 'regulatory'
  },
  EAD: {
    CCF_BASED: 'ccf_based',
    BEHAVIORAL: 'behavioral',
    REGULATORY: 'regulatory'
  }
} as const;

/**
 * Aggregation Levels
 */
export const AGGREGATION_LEVELS = {
  PORTFOLIO: 'portfolio',
  PRODUCT: 'product',
  CUSTOMER_SEGMENT: 'customer_segment',
  STAGE: 'stage',
  CURRENCY: 'currency',
  GEOGRAPHY: 'geography',
  INDUSTRY: 'industry'
} as const;

/**
 * Product Types
 */
export const PRODUCT_TYPES = {
  MORTGAGE: 'mortgage',
  AUTO_LOAN: 'auto_loan',
  PERSONAL_LOAN: 'personal_loan',
  CREDIT_CARD: 'credit_card',
  BUSINESS_LOAN: 'business_loan',
  TRADE_FINANCE: 'trade_finance',
  OVERDRAFT: 'overdraft',
  TERM_DEPOSIT: 'term_deposit',
  LETTER_OF_CREDIT: 'letter_of_credit',
  GUARANTEE: 'guarantee',
  
  // Islamic Banking Products
  MURABAHA: 'murabaha',
  MUSHARAKA: 'musharaka',
  MUDHARABA: 'mudharaba',
  IJARA: 'ijara',
  ISTISNA: 'istisna',
  SALAM: 'salam',
  TAKAFUL: 'takaful'
} as const;

/**
 * Customer Types
 */
export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'individual',
  SME: 'sme',
  CORPORATE: 'corporate',
  GOVERNMENT: 'government',
  FINANCIAL_INSTITUTION: 'financial_institution'
} as const;

/**
 * Customer Segments
 */
export const CUSTOMER_SEGMENTS = {
  RETAIL: 'retail',
  PRIORITY: 'priority',
  PRIVATE: 'private',
  COMMERCIAL: 'commercial',
  CORPORATE: 'corporate',
  INSTITUTIONAL: 'institutional'
} as const;

/**
 * Collateral Types
 */
export const COLLATERAL_TYPES = {
  REAL_ESTATE: 'real_estate',
  CASH_DEPOSIT: 'cash_deposit',
  SECURITIES: 'securities',
  EQUIPMENT: 'equipment',
  INVENTORY: 'inventory',
  RECEIVABLES: 'receivables',
  VEHICLE: 'vehicle',
  GUARANTEE: 'guarantee',
  OTHER: 'other'
} as const;

/**
 * Currency Codes (Major currencies)
 */
export const CURRENCY_CODES = {
  IDR: 'IDR', // Indonesian Rupiah
  USD: 'USD', // US Dollar
  EUR: 'EUR', // Euro
  GBP: 'GBP', // British Pound
  JPY: 'JPY', // Japanese Yen
  SGD: 'SGD', // Singapore Dollar
  MYR: 'MYR', // Malaysian Ringgit
  THB: 'THB', // Thai Baht
  AUD: 'AUD', // Australian Dollar
  CNY: 'CNY'  // Chinese Yuan
} as const;

/**
 * Default Configuration Values
 */
export const DEFAULT_CONFIG = {
  CALCULATION: {
    BATCH_SIZE: 100,
    TIMEOUT_SECONDS: 300,
    MAX_PARALLEL_PROCESSES: 4,
    RETRY_ATTEMPTS: 3
  },
  STAGING: {
    STAGE_2_DPD_THRESHOLD: 30,
    STAGE_3_DPD_THRESHOLD: 90,
    SICR_PD_THRESHOLD: 2.0,
    SICR_RATING_NOTCHES: 2
  },
  PD: {
    BASE_RATE: 0.02,
    MIN_PD: 0.0001,
    MAX_PD: 0.9999,
    STRESS_MULTIPLIER: 1.5
  },
  LGD: {
    BASE_LGD: 0.45,
    MIN_LGD: 0.0001,
    MAX_LGD: 0.9999,
    DOWNTURN_MULTIPLIER: 1.2,
    COST_OF_RECOVERY: 0.15
  },
  EAD: {
    DEFAULT_CCF: 0.75,
    MIN_CCF: 0.0,
    MAX_CCF: 1.0,
    STRESS_MULTIPLIER: 1.2
  }
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  DATA_QUALITY: {
    DQ001: 'Mandatory Fields Check',
    DQ002: 'Data Type Validation',
    DQ003: 'Value Range Validation',
    DQ004: 'Data Consistency Check',
    DQ005: 'Duplicate Detection'
  },
  BUSINESS_LOGIC: {
    BL001: 'Staging Logic Validation',
    BL002: 'PD Reasonableness Check',
    BL003: 'LGD Bounds Validation',
    BL004: 'EAD Calculation Validation',
    BL005: 'ECL Formula Validation'
  },
  CALCULATION_CONSISTENCY: {
    CC001: 'ECL Formula Consistency',
    CC002: 'Stage Movement Validation',
    CC003: 'Portfolio Reconciliation',
    CC004: 'Currency Consistency'
  },
  REGULATORY_COMPLIANCE: {
    RC001: 'IFRS 9 Standard Compliance',
    RC002: 'Basel III Requirements',
    RC003: 'OJK Regulations',
    RC004: 'AAOIFI Standards (Islamic Banking)'
  }
} as const;

/**
 * Report Types
 */
export const REPORT_TYPES = {
  ECL_SUMMARY: 'ecl_summary',
  STAGE_MOVEMENT: 'stage_movement',
  PORTFOLIO_ANALYSIS: 'portfolio_analysis',
  MODEL_PERFORMANCE: 'model_performance',
  VALIDATION_REPORT: 'validation_report',
  AUDIT_TRAIL: 'audit_trail',
  DATA_LINEAGE: 'data_lineage',
  CALCULATION_HISTORY: 'calculation_history',
  USER_ACTIVITY: 'user_activity',
  COMPLIANCE_REPORT: 'compliance_report'
} as const;

/**
 * Export Formats
 */
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
} as const;

/**
 * API Response Status Codes
 */
export const API_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMITS = {
  CALCULATION: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  API_READ: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 500
  },
  API_WRITE: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 200
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  }
} as const;

/**
 * Permissions for IFRS 9 operations
 */
export const IFRS9_PERMISSIONS = {
  CALCULATE: 'ifrs9:calculate',
  READ: 'ifrs9:read',
  WRITE: 'ifrs9:write',
  AGGREGATE: 'ifrs9:aggregate',
  VALIDATE: 'ifrs9:validate',
  AUDIT: 'ifrs9:audit',
  CONFIGURE: 'ifrs9:configure',
  ADMIN: 'ifrs9:admin'
} as const;

/**
 * Time horizons for calculations (in months)
 */
export const TIME_HORIZONS = {
  MONTHS_12: 12,
  MONTHS_24: 24,
  MONTHS_36: 36,
  MONTHS_60: 60,
  MONTHS_120: 120, // 10 years
  LIFETIME: 9999
} as const;

/**
 * Staging reasons
 */
export const STAGING_REASONS = {
  PERFORMING: 'Performing account - no significant increase in credit risk',
  DPD_SICR: 'Significant increase in credit risk - days past due threshold exceeded',
  RATING_SICR: 'Significant increase in credit risk - rating deterioration',
  PD_SICR: 'Significant increase in credit risk - PD increase threshold exceeded',
  QUALITATIVE_SICR: 'Significant increase in credit risk - qualitative factors',
  DEFAULT_DPD: 'Credit-impaired - days past due default threshold exceeded',
  DEFAULT_QUALITATIVE: 'Credit-impaired - qualitative default indicators'
} as const;

/**
 * Islamic Banking compliance flags
 */
export const ISLAMIC_BANKING_FLAGS = {
  SYARIAH_COMPLIANT: 'syariah_compliant',
  NON_COMPLIANT: 'non_compliant',
  UNDER_REVIEW: 'under_review',
  AAOIFI_STANDARD: 'aaoifi_standard',
  LOCAL_STANDARD: 'local_standard'
} as const;

// Export all constants
export * from './validation';
export * from './models';
export * from './api';
