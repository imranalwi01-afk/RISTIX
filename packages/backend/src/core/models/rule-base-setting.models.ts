// packages/backend/src/core/models/rule-base-setting.models.ts
// ============================================================================
// RULE BASE SETTING MODELS - PHASE 3 MODULE 3.2
// ============================================================================
// Master-Detail pattern with Extended Functionality for Rule-based Updates
// Legacy compliance: ASP.NET MVC ParamScenarioRules implementation
// Database tables: Legacy Rule Based Setting tables (to be identified)
// ============================================================================

import { DataTypes, Model, Sequelize, Transaction } from 'sequelize';

// ============================================================================
// INTERFACES - TypeScript Type Definitions
// ============================================================================

export interface RuleBaseSettingHeaderAttributes {
  id?: number;
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value: string;
  seq?: number;
  active_flag: boolean;
  created_by?: string;
  created_date?: Date;
  created_host?: string;
  updated_by?: string;
  updated_date?: Date;
  updated_host?: string;
}

export interface RuleBaseSettingDetailAttributes {
  id?: number;
  rule_id: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: string;
  detail_type?: number;
  stage_from?: number;
  stage_to?: number;
  created_by?: string;
  created_date?: Date;
  created_host?: string;
  updated_by?: string;
  updated_date?: Date;
  updated_host?: string;
}

export interface RuleBaseSettingHeaderCreateData {
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value: string;
  seq?: number;
  active_flag?: boolean;
}

export interface RuleBaseSettingDetailCreateData {
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: string;
  detail_type?: number;
  stage_from?: number;
  stage_to?: number;
}

// ============================================================================
// RULE BASE SETTING HEADER MODEL
// ============================================================================

export class RuleBaseSettingHeader extends Model<RuleBaseSettingHeaderAttributes> 
  implements RuleBaseSettingHeaderAttributes {
  
  public id!: number;
  public rule_name!: string;
  public rule_type!: string;
  public updated_table!: string;
  public updated_column!: string;
  public value!: string;
  public seq!: number;
  public active_flag!: boolean;
  public created_by?: string;
  public created_date?: Date;
  public created_host?: string;
  public updated_by?: string;
  public updated_date?: Date;
  public updated_host?: string;

  // Associations
  public details?: RuleBaseSettingDetail[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// RULE BASE SETTING DETAIL MODEL
// ============================================================================

export class RuleBaseSettingDetail extends Model<RuleBaseSettingDetailAttributes> 
  implements RuleBaseSettingDetailAttributes {
  
  public id!: number;
  public rule_id!: number;
  public query_group!: number;
  public seq!: number;
  public table_name!: string;
  public column_name!: string;
  public data_type!: string;
  public operator!: string;
  public value1?: string;
  public value2?: string;
  public condition!: string;
  public detail_type?: number;
  public stage_from?: number;
  public stage_to?: number;
  public created_by?: string;
  public created_date?: Date;
  public created_host?: string;
  public updated_by?: string;
  public updated_date?: Date;
  public updated_host?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// MODEL INITIALIZATION FUNCTIONS
// ============================================================================

export const initRuleBaseSettingHeader = (sequelize: Sequelize) => {
  RuleBaseSettingHeader.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key for rule base setting header'
    },
    rule_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      comment: 'Name of the rule'
    },
    rule_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Type of the rule (from dropdown)'
    },
    updated_table: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Target table to be updated by the rule'
    },
    updated_column: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Target column to be updated by the rule'
    },
    value: {
      type: DataTypes.STRING(250),
      allowNull: false,
      comment: 'Value to be set in the target column'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Sequence number for rule execution order'
    },
    active_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Active status of the rule'
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'User who created the record'
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: 'Date when record was created'
    },
    created_host: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Host/IP where record was created'
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'User who last updated the record'
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when record was last updated'
    },
    updated_host: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Host/IP where record was last updated'
    }
  }, {
    sequelize,
    modelName: 'RuleBaseSettingHeader',
    tableName: 'rule_base_setting_headers',
    schema: 'collective_impairment',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_rule_base_setting_header_rule_name',
        fields: ['rule_name']
      },
      {
        name: 'idx_rule_base_setting_header_rule_type',
        fields: ['rule_type']
      },
      {
        name: 'idx_rule_base_setting_header_active',
        fields: ['active_flag']
      },
      {
        name: 'idx_rule_base_setting_header_seq',
        fields: ['seq']
      }
    ],
    comment: 'Rule base setting headers for collective impairment rule-based updates'
  });

  return RuleBaseSettingHeader;
};

export const initRuleBaseSettingDetail = (sequelize: Sequelize) => {
  RuleBaseSettingDetail.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key for rule base setting detail'
    },
    rule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rule_base_setting_headers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Foreign key to rule base setting header'
    },
    query_group: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Query grouping for complex conditions'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Sequence number within the rule'
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Source table name for condition evaluation'
    },
    column_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Source column name for condition evaluation'
    },
    data_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Data type of the source column (auto-detected)'
    },
    operator: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Comparison operator (=, >, <, LIKE, IN, BETWEEN, etc.)'
    },
    value1: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'First comparison value (or only value for single operators)'
    },
    value2: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Second comparison value (for BETWEEN operator)'
    },
    condition: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'AND',
      comment: 'Logical condition (AND/OR) to next rule'
    },
    detail_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Detail type for categorization'
    },
    stage_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Source stage for IFRS 9 stage-based rules'
    },
    stage_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target stage for IFRS 9 stage-based rules'
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'User who created the record'
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: 'Date when record was created'
    },
    created_host: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Host/IP where record was created'
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'User who last updated the record'
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when record was last updated'
    },
    updated_host: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Host/IP where record was last updated'
    }
  }, {
    sequelize,
    modelName: 'RuleBaseSettingDetail',
    tableName: 'rule_base_setting_details',
    schema: 'collective_impairment',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_rule_base_setting_detail_rule_id',
        fields: ['rule_id']
      },
      {
        name: 'idx_rule_base_setting_detail_query_group',
        fields: ['query_group']
      },
      {
        name: 'idx_rule_base_setting_detail_seq',
        fields: ['seq']
      },
      {
        name: 'idx_rule_base_setting_detail_table_column',
        fields: ['table_name', 'column_name']
      },
      {
        name: 'idx_rule_base_setting_detail_stage',
        fields: ['stage_from', 'stage_to']
      }
    ],
    comment: 'Rule base setting detail conditions for collective impairment rules'
  });

  return RuleBaseSettingDetail;
};

// ============================================================================
// MODEL ASSOCIATIONS
// ============================================================================

export const setupRuleBaseSettingAssociations = () => {
  // Header has many Details
  RuleBaseSettingHeader.hasMany(RuleBaseSettingDetail, {
    foreignKey: 'rule_id',
    as: 'details',
    onDelete: 'CASCADE'
  });

  // Detail belongs to Header
  RuleBaseSettingDetail.belongsTo(RuleBaseSettingHeader, {
    foreignKey: 'rule_id',
    as: 'header'
  });
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const RuleBaseSettingValidationHelpers = {
  // Validate rule types
  isValidRuleType: (ruleType: string): boolean => {
    const validTypes = ['STAGE_MOVEMENT', 'VALUE_UPDATE', 'CONDITION_CHECK', 'CUSTOM'];
    return validTypes.includes(ruleType);
  },

  // Validate operators
  isValidOperator: (operator: string): boolean => {
    const validOperators = ['=', '!=', '<>', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'IS NULL', 'IS NOT NULL'];
    return validOperators.includes(operator);
  },

  // Validate logical conditions
  isValidCondition: (condition: string): boolean => {
    const validConditions = ['AND', 'OR'];
    return validConditions.includes(condition);
  },

  // Validate stage values
  isValidStage: (stage: number): boolean => {
    return stage >= 1 && stage <= 3;
  },

  // Check if operator requires value2
  requiresValue2: (operator: string): boolean => {
    return operator === 'BETWEEN';
  },

  // Check if operator requires no values
  requiresNoValues: (operator: string): boolean => {
    return ['IS NULL', 'IS NOT NULL'].includes(operator);
  },

  // Validate data types
  isValidDataType: (dataType: string): boolean => {
    const validTypes = ['VARCHAR', 'CHAR', 'NVARCHAR', 'TEXT', 'NUMBER', 'INT', 'DECIMAL', 'FLOAT', 'BIGINT', 'SMALLINT', 'DATE', 'DATETIME', 'BOOLEAN', 'BIT'];
    return validTypes.includes(dataType.toUpperCase());
  }
};

// ============================================================================
// CONSTANTS FOR DROPDOWNS
// ============================================================================

export const RuleBaseSettingConstants = {
  RULE_TYPES: [
    { value: 'STAGE_MOVEMENT', label: 'Stage Movement Rule' },
    { value: 'VALUE_UPDATE', label: 'Value Update Rule' },
    { value: 'CONDITION_CHECK', label: 'Condition Check Rule' },
    { value: 'CUSTOM', label: 'Custom Rule' }
  ],

  OPERATORS: [
    { value: '=', label: 'Equal (=)', dataTypes: ['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'] },
    { value: '!=', label: 'Not Equal (!=)', dataTypes: ['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'] },
    { value: '<>', label: 'Not Equal (<>)', dataTypes: ['VARCHAR', 'NUMBER', 'DATE'] },
    { value: '>', label: 'Greater Than (>)', dataTypes: ['NUMBER', 'DATE'] },
    { value: '>=', label: 'Greater Equal (>=)', dataTypes: ['NUMBER', 'DATE'] },
    { value: '<', label: 'Less Than (<)', dataTypes: ['NUMBER', 'DATE'] },
    { value: '<=', label: 'Less Equal (<=)', dataTypes: ['NUMBER', 'DATE'] },
    { value: 'LIKE', label: 'Like (LIKE)', dataTypes: ['VARCHAR'] },
    { value: 'NOT LIKE', label: 'Not Like (NOT LIKE)', dataTypes: ['VARCHAR'] },
    { value: 'IN', label: 'In (IN)', dataTypes: ['VARCHAR', 'NUMBER'], supportsMultiple: true },
    { value: 'NOT IN', label: 'Not In (NOT IN)', dataTypes: ['VARCHAR', 'NUMBER'], supportsMultiple: true },
    { value: 'BETWEEN', label: 'Between (BETWEEN)', dataTypes: ['NUMBER', 'DATE'], requiresValue2: true },
    { value: 'IS NULL', label: 'Is Null (IS NULL)', dataTypes: ['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'], requiresNoValues: true },
    { value: 'IS NOT NULL', label: 'Is Not Null (IS NOT NULL)', dataTypes: ['VARCHAR', 'NUMBER', 'DATE', 'BOOLEAN'], requiresNoValues: true }
  ],

  CONDITIONS: [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
  ],

  DATA_TYPES: [
    { value: 'VARCHAR', label: 'Text (VARCHAR)', category: 'string' },
    { value: 'NUMBER', label: 'Number (NUMBER)', category: 'number' },
    { value: 'DATE', label: 'Date (DATE)', category: 'date' },
    { value: 'BOOLEAN', label: 'Boolean (BOOLEAN)', category: 'boolean' }
  ],

  STAGES: [
    { value: 1, label: 'Stage 1 (12-month ECL)' },
    { value: 2, label: 'Stage 2 (Lifetime ECL)' },
    { value: 3, label: 'Stage 3 (Credit Impaired)' }
  ]
};

export default {
  RuleBaseSettingHeader,
  RuleBaseSettingDetail,
  initRuleBaseSettingHeader,
  initRuleBaseSettingDetail,
  setupRuleBaseSettingAssociations,
  RuleBaseSettingValidationHelpers,
  RuleBaseSettingConstants
};