// packages/backend/src/core/models/ifrs9/index.ts
// ============================================================================
// IFRS9 Models Export Index
// ============================================================================
// Generated: 2025-01-18
// Purpose: Central export for all IFRS9 database models
// Methodology: Core Platform MVP - IFRS9 Engine Completion
// ============================================================================

// Core ECL Models
export { EclCalculation } from './ecl-calculation.model';
export { EclParameter } from './ecl-parameter.model';

// Staging and Risk Models
export { StagingParameter } from './staging-parameter.model';
export { CreditRiskEvent } from './credit-risk-event.model';

// Validation Models
export { ValidationRule } from './validation-rule.model';
export { ValidationResult } from './validation-result.model';

// Statistical Models
export { PdModel } from './pd-model.model';
export { LgdModel } from './lgd-model.model';
export { EadModel, CcfParameter } from './ead-model.model';

// Re-export types and interfaces
export type { EclCalculationAttributes } from './ecl-calculation.model';
export type { EclParameterAttributes } from './ecl-parameter.model';
export type { StagingParameterAttributes } from './staging-parameter.model';
export type { CreditRiskEventAttributes } from './credit-risk-event.model';
export type { ValidationRuleAttributes } from './validation-rule.model';
export type { ValidationResultAttributes } from './validation-result.model';
export type { PdModelAttributes } from './pd-model.model';
export type { LgdModelAttributes } from './lgd-model.model';
export type { EadModelAttributes, CcfParameterAttributes } from './ead-model.model';

// Model registration helper for Sequelize
export const IFRS9_MODELS = [
  EclCalculation,
  EclParameter,
  StagingParameter,
  CreditRiskEvent,
  ValidationRule,
  ValidationResult,
  PdModel,
  LgdModel,
  EadModel,
  CcfParameter
] as const;

// Model names constants
export const IFRS9_MODEL_NAMES = {
  ECL_CALCULATION: 'EclCalculation',
  ECL_PARAMETER: 'EclParameter',
  STAGING_PARAMETER: 'StagingParameter',
  CREDIT_RISK_EVENT: 'CreditRiskEvent',
  VALIDATION_RULE: 'ValidationRule',
  VALIDATION_RESULT: 'ValidationResult',
  PD_MODEL: 'PdModel',
  LGD_MODEL: 'LgdModel',
  EAD_MODEL: 'EadModel',
  CCF_PARAMETER: 'CcfParameter'
} as const;

// Table schema information
export const IFRS9_SCHEMA_INFO = {
  schema: 'ifrs9',
  tables: {
    eclCalculations: 'ecl_calculations',
    eclParameters: 'ecl_parameters',
    stagingParameters: 'staging_parameters',
    creditRiskEvents: 'credit_risk_events',
    validationRules: 'validation_rules',
    validationResults: 'validation_results',
    pdModels: 'pd_models',
    lgdModels: 'lgd_models',
    eadModels: 'ead_models',
    ccfParameters: 'ccf_parameters'
  },
  indexes: {
    eclCalculations: [
      'tenant_id',
      'calculation_batch_id',
      'portfolio_account_id',
      'account_id',
      'calculation_date',
      'current_stage',
      'status',
      'methodology'
    ],
    eclParameters: [
      'tenant_id',
      'parameter_type',
      'parameter_category',
      'parameter_key',
      'effective_from_to',
      'is_active',
      'version'
    ],
    stagingParameters: [
      'tenant_id',
      'product_type',
      'customer_segment',
      'dpd_threshold_stage_2',
      'sicr_threshold',
      'is_active',
      'effective_from_to'
    ],
    creditRiskEvents: [
      'tenant_id',
      'portfolio_account_id',
      'event_type',
      'event_date',
      'significance_level',
      'stage_movement',
      'is_resolved'
    ],
    validationRules: [
      'tenant_id',
      'rule_type',
      'rule_category',
      'entity_type',
      'severity',
      'is_active',
      'execution_order',
      'effective_from_to'
    ],
    validationResults: [
      'tenant_id',
      'validation_rule_id',
      'entity_type',
      'entity_id',
      'batch_id',
      'execution_date',
      'validation_status',
      'is_blocking',
      'resolved_flag',
      'business_impact'
    ],
    pdModels: [
      'tenant_id',
      'model_name',
      'model_type',
      'product_type',
      'customer_segment',
      'term_structure',
      'is_active',
      'is_production',
      'calibration_date',
      'effective_from_to'
    ],
    lgdModels: [
      'tenant_id',
      'model_name',
      'model_type',
      'product_type',
      'customer_segment',
      'collateral_type',
      'is_active',
      'is_production',
      'calibration_date',
      'effective_from_to'
    ],
    eadModels: [
      'tenant_id',
      'model_name',
      'model_type',
      'product_type',
      'customer_segment',
      'facility_type',
      'is_active',
      'is_production',
      'calibration_date',
      'effective_from_to'
    ],
    ccfParameters: [
      'tenant_id',
      'ead_model_id',
      'product_type',
      'facility_type',
      'rating_grade',
      'is_active',
      'effective_from_to'
    ]
  }
} as const;