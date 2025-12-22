// packages/backend/src/core/models/collective-parameter.models.ts
// ============================================================================
// 🔧 COLLECTIVE PARAMETER MODELS - PHASE 3 MODULE 3.4
// ============================================================================
// ✅ PATTERN: Master-Detail with Integration Links + Configuration Orchestration
// ✅ DATABASE: collective_parameter_headers + collective_parameter_details
// ✅ FEATURES: Module integration, validation engine, calculation preview
// ============================================================================

import { DataTypes, Model, Sequelize } from 'sequelize';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface CollectiveParameterHeaderAttributes {
  id: number;
  template_name: string;
  template_description?: string;
  template_type: 'PORTFOLIO' | 'SEGMENT' | 'PRODUCT' | 'CUSTOM';
  
  // Integration with other modules (3.1, 3.2, 3.3)
  segmentation_id?: number;
  rule_base_setting_id?: number;
  bucket_parameter_id?: number;
  
  // Collective calculation configuration
  calculation_method: 'COLLECTIVE' | 'HYBRID';
  aggregation_level: 'ACCOUNT' | 'SEGMENT' | 'PORTFOLIO';
  
  // IFRS 9 specific configurations (JSON)
  stage_override_rules?: any;
  sicr_triggers?: any;
  default_definitions?: any;
  
  // Execution settings
  active_flag: boolean;
  execution_priority: number;
  effective_date: Date;
  expiry_date?: Date;
  
  // Audit fields
  created_by: string;
  created_date: Date;
  created_host?: string;
  updated_by?: string;
  updated_date?: Date;
  updated_host?: string;
}

export interface CollectiveParameterHeaderCreationAttributes {
  template_name: string;
  template_description?: string;
  template_type: 'PORTFOLIO' | 'SEGMENT' | 'PRODUCT' | 'CUSTOM';
  segmentation_id?: number;
  rule_base_setting_id?: number;
  bucket_parameter_id?: number;
  calculation_method?: 'COLLECTIVE' | 'HYBRID';
  aggregation_level?: 'ACCOUNT' | 'SEGMENT' | 'PORTFOLIO';
  stage_override_rules?: any;
  sicr_triggers?: any;
  default_definitions?: any;
  active_flag?: boolean;
  execution_priority?: number;
  effective_date?: Date;
  expiry_date?: Date;
  created_by: string;
  created_date?: Date;
  created_host?: string;
}

export interface CollectiveParameterDetailAttributes {
  id: number;
  collective_parameter_id: number;
  
  // Parameter configuration
  parameter_type: 'PD_OVERRIDE' | 'LGD_ADJUSTMENT' | 'EAD_FACTOR' | 'STAGING_RULE' | 'SICR_THRESHOLD' | 'DEFAULT_TRIGGER';
  parameter_name: string;
  parameter_value: string;
  parameter_unit?: string;
  
  // Application scope
  apply_to_segment?: string;
  apply_to_product?: string;
  apply_to_stage?: number; // 1, 2, 3
  
  // Execution control
  execution_order: number;
  dependency_rules?: any;
  
  // Validation
  min_value?: number;
  max_value?: number;
  validation_rules?: any;
  
  active_flag: boolean;
  
  // Audit fields
  created_by: string;
  created_date: Date;
  created_host?: string;
  updated_by?: string;
  updated_date?: Date;
  updated_host?: string;
}

export interface CollectiveParameterDetailCreationAttributes {
  collective_parameter_id: number;
  parameter_type: 'PD_OVERRIDE' | 'LGD_ADJUSTMENT' | 'EAD_FACTOR' | 'STAGING_RULE' | 'SICR_THRESHOLD' | 'DEFAULT_TRIGGER';
  parameter_name: string;
  parameter_value: string;
  parameter_unit?: string;
  apply_to_segment?: string;
  apply_to_product?: string;
  apply_to_stage?: number;
  execution_order?: number;
  dependency_rules?: any;
  min_value?: number;
  max_value?: number;
  validation_rules?: any;
  active_flag?: boolean;
  created_by: string;
  created_date?: Date;
  created_host?: string;
}

// ============================================================================
// SEQUELIZE MODELS
// ============================================================================

export class CollectiveParameterHeader extends Model<
  CollectiveParameterHeaderAttributes,
  CollectiveParameterHeaderCreationAttributes
> implements CollectiveParameterHeaderAttributes {
  public id!: number;
  public template_name!: string;
  public template_description?: string;
  public template_type!: 'PORTFOLIO' | 'SEGMENT' | 'PRODUCT' | 'CUSTOM';
  
  public segmentation_id?: number;
  public rule_base_setting_id?: number;
  public bucket_parameter_id?: number;
  
  public calculation_method!: 'COLLECTIVE' | 'HYBRID';
  public aggregation_level!: 'ACCOUNT' | 'SEGMENT' | 'PORTFOLIO';
  
  public stage_override_rules?: any;
  public sicr_triggers?: any;
  public default_definitions?: any;
  
  public active_flag!: boolean;
  public execution_priority!: number;
  public effective_date!: Date;
  public expiry_date?: Date;
  
  public created_by!: string;
  public created_date!: Date;
  public created_host?: string;
  public updated_by?: string;
  public updated_date?: Date;
  public updated_host?: string;

  // Associations
  public readonly details?: CollectiveParameterDetail[];
  public readonly detail_count?: number;
}

export class CollectiveParameterDetail extends Model<
  CollectiveParameterDetailAttributes,
  CollectiveParameterDetailCreationAttributes
> implements CollectiveParameterDetailAttributes {
  public id!: number;
  public collective_parameter_id!: number;
  
  public parameter_type!: 'PD_OVERRIDE' | 'LGD_ADJUSTMENT' | 'EAD_FACTOR' | 'STAGING_RULE' | 'SICR_THRESHOLD' | 'DEFAULT_TRIGGER';
  public parameter_name!: string;
  public parameter_value!: string;
  public parameter_unit?: string;
  
  public apply_to_segment?: string;
  public apply_to_product?: string;
  public apply_to_stage?: number;
  
  public execution_order!: number;
  public dependency_rules?: any;
  
  public min_value?: number;
  public max_value?: number;
  public validation_rules?: any;
  
  public active_flag!: boolean;
  
  public created_by!: string;
  public created_date!: Date;
  public created_host?: string;
  public updated_by?: string;
  public updated_date?: Date;
  public updated_host?: string;
}

// ============================================================================
// MODEL INITIALIZATION FUNCTIONS
// ============================================================================

export const initCollectiveParameterHeader = (sequelize: Sequelize): typeof CollectiveParameterHeader => {
  CollectiveParameterHeader.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      template_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        comment: 'Collective parameter template name'
      },
      template_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Template description and purpose'
      },
      template_type: {
        type: DataTypes.ENUM('PORTFOLIO', 'SEGMENT', 'PRODUCT', 'CUSTOM'),
        allowNull: false,
        defaultValue: 'SEGMENT',
        comment: 'Type of collective parameter template'
      },
      
      // Integration with other modules
      segmentation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Link to Module 3.1 Segmentation Configuration'
      },
      rule_base_setting_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Link to Module 3.2 Rule Base Setting'
      },
      bucket_parameter_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Link to Module 3.3 Bucket Parameter'
      },
      
      // Collective calculation configuration
      calculation_method: {
        type: DataTypes.ENUM('COLLECTIVE', 'HYBRID'),
        allowNull: false,
        defaultValue: 'COLLECTIVE',
        comment: 'Calculation method for collective assessment'
      },
      aggregation_level: {
        type: DataTypes.ENUM('ACCOUNT', 'SEGMENT', 'PORTFOLIO'),
        allowNull: false,
        defaultValue: 'SEGMENT',
        comment: 'Level of aggregation for collective calculations'
      },
      
      // IFRS 9 specific configurations (JSON)
      stage_override_rules: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'IFRS 9 stage override rules configuration'
      },
      sicr_triggers: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Significant Increase in Credit Risk (SICR) triggers'
      },
      default_definitions: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Default definition parameters for Stage 3'
      },
      
      // Execution settings
      active_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Active status flag'
      },
      execution_priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Execution priority (lower = higher priority)'
      },
      effective_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Effective start date'
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expiry end date (null = no expiry)'
      },
      
      // Audit fields
      created_by: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Created by user email'
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Creation timestamp'
      },
      created_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Created from host/IP'
      },
      updated_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Updated by user email'
      },
      updated_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last update timestamp'
      },
      updated_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Updated from host/IP'
      },
    },
    {
      sequelize,
      tableName: 'collective_parameter_headers',
      schema: 'collective_impairment',
      timestamps: false,
      comment: 'Collective Parameter Master Template Configuration',
      indexes: [
        {
          name: 'idx_collective_parameter_headers_active',
          fields: ['active_flag', 'effective_date']
        },
        {
          name: 'idx_collective_parameter_headers_template_type',
          fields: ['template_type']
        },
        {
          name: 'idx_collective_parameter_headers_priority',
          fields: ['execution_priority', 'active_flag']
        }
      ]
    }
  );

  return CollectiveParameterHeader;
};

export const initCollectiveParameterDetail = (sequelize: Sequelize): typeof CollectiveParameterDetail => {
  CollectiveParameterDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      collective_parameter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to collective_parameter_headers'
      },
      
      // Parameter configuration
      parameter_type: {
        type: DataTypes.ENUM('PD_OVERRIDE', 'LGD_ADJUSTMENT', 'EAD_FACTOR', 'STAGING_RULE', 'SICR_THRESHOLD', 'DEFAULT_TRIGGER'),
        allowNull: false,
        comment: 'Type of collective parameter'
      },
      parameter_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Parameter name/description'
      },
      parameter_value: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Parameter value (string, number, or JSON)'
      },
      parameter_unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Unit of measurement (percentage, amount, ratio, etc.)'
      },
      
      // Application scope
      apply_to_segment: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Apply to specific segment (null = all segments)'
      },
      apply_to_product: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Apply to specific product (null = all products)'
      },
      apply_to_stage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 3
        },
        comment: 'Apply to specific IFRS 9 stage (1, 2, 3, null = all stages)'
      },
      
      // Execution control
      execution_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Order of execution within template'
      },
      dependency_rules: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Dependencies and conditional execution rules'
      },
      
      // Validation
      min_value: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: true,
        comment: 'Minimum allowed value for validation'
      },
      max_value: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: true,
        comment: 'Maximum allowed value for validation'
      },
      validation_rules: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Custom validation rules and constraints'
      },
      
      active_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Active status flag'
      },
      
      // Audit fields
      created_by: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Created by user email'
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Creation timestamp'
      },
      created_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Created from host/IP'
      },
      updated_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Updated by user email'
      },
      updated_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last update timestamp'
      },
      updated_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Updated from host/IP'
      },
    },
    {
      sequelize,
      tableName: 'collective_parameter_details',
      schema: 'collective_impairment',
      timestamps: false,
      comment: 'Collective Parameter Detail Configuration',
      indexes: [
        {
          name: 'idx_collective_parameter_details_header_id',
          fields: ['collective_parameter_id']
        },
        {
          name: 'idx_collective_parameter_details_type',
          fields: ['parameter_type', 'active_flag']
        },
        {
          name: 'idx_collective_parameter_details_execution',
          fields: ['collective_parameter_id', 'execution_order']
        }
      ]
    }
  );

  return CollectiveParameterDetail;
};

// ============================================================================
// MODEL ASSOCIATIONS
// ============================================================================

export const setupCollectiveParameterAssociations = (
  CollectiveParameterHeader: typeof CollectiveParameterHeader,
  CollectiveParameterDetail: typeof CollectiveParameterDetail
) => {
  // Header has many Details
  CollectiveParameterHeader.hasMany(CollectiveParameterDetail, {
    foreignKey: 'collective_parameter_id',
    as: 'details',
    onDelete: 'CASCADE'
  });

  // Detail belongs to Header
  CollectiveParameterDetail.belongsTo(CollectiveParameterHeader, {
    foreignKey: 'collective_parameter_id',
    as: 'header'
  });
};

// ============================================================================
// ADDITIONAL INTERFACES FOR BUSINESS LOGIC
// ============================================================================

export interface CollectiveConfiguration {
  header: CollectiveParameterHeaderAttributes;
  details: CollectiveParameterDetailAttributes[];
  segmentation?: any; // From Module 3.1
  ruleBaseSetting?: any; // From Module 3.2
  bucketParameter?: any; // From Module 3.3
}

export interface ConfigurationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CalculationPreview {
  impactedAccounts: number;
  stagingChanges: {
    stage1ToStage2: number;
    stage2ToStage3: number;
    stageDowngrades: number;
  };
  eclImpact: {
    totalEclBefore: number;
    totalEclAfter: number;
    eclChange: number;
    eclChangePercentage: number;
  };
  parameterApplication: {
    pdOverrides: number;
    lgdAdjustments: number;
    eadFactors: number;
    stagingRules: number;
  };
}

export interface ModuleLinkageStatus {
  segmentationLinked: boolean;
  ruleBaseLinked: boolean;
  bucketParameterLinked: boolean;
  configurationComplete: boolean;
  readyForCalculation: boolean;
}