// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/models/platform/FormConfiguration.ts
// Generated: $(date)
// Phase: D2H3-P01 - Basic Form Configuration Models
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, DataTypes
// Purpose: Form configuration model for dynamic form management
// ============================================================================

import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface FormConfigurationAttributes {
  id: string;
  tenant_id: string;
  form_name: string;
  form_type: 'customer_onboarding' | 'loan_application' | 'ecl_calculation' | 'portfolio_import' | 'syariah_compliance' | 'custom';
  banking_type: 'conventional' | 'syariah' | 'dual';
  form_version: string;
  form_schema: Record<string, any>;
  validation_rules: Record<string, any>;
  ui_configuration: Record<string, any>;
  conditional_logic: Record<string, any>;
  business_rules: Record<string, any>;
  approval_workflow: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface FormConfigurationCreationAttributes extends Omit<FormConfigurationAttributes, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export class FormConfiguration extends Model<FormConfigurationAttributes, FormConfigurationCreationAttributes> implements FormConfigurationAttributes {
  public id!: string;
  public tenant_id!: string;
  public form_name!: string;
  public form_type!: 'customer_onboarding' | 'loan_application' | 'ecl_calculation' | 'portfolio_import' | 'syariah_compliance' | 'custom';
  public banking_type!: 'conventional' | 'syariah' | 'dual';
  public form_version!: string;
  public form_schema!: Record<string, any>;
  public validation_rules!: Record<string, any>;
  public ui_configuration!: Record<string, any>;
  public conditional_logic!: Record<string, any>;
  public business_rules!: Record<string, any>;
  public approval_workflow!: Record<string, any>;
  public is_active!: boolean;
  public is_default!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by!: string;
  public updated_by!: string;

  public static associate(models: any): void {
    // Associations will be defined here
    FormConfiguration.belongsTo(models.Tenant, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });
    
    FormConfiguration.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    
    FormConfiguration.hasMany(models.FormSubmission, {
      foreignKey: 'form_configuration_id',
      as: 'submissions'
    });
  }
}

export const initFormConfiguration = (sequelize: Sequelize): typeof FormConfiguration => {
  FormConfiguration.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
      },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        }
      },
      form_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200]
        }
      },
      form_type: {
        type: DataTypes.ENUM('customer_onboarding', 'loan_application', 'ecl_calculation', 'portfolio_import', 'syariah_compliance', 'custom'),
        allowNull: false
      },
      banking_type: {
        type: DataTypes.ENUM('conventional', 'syariah', 'dual'),
        allowNull: false,
        defaultValue: 'dual'
      },
      form_version: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '1.0.0',
        validate: {
          is: /^\d+\.\d+\.\d+$/
        }
      },
      form_schema: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        validate: {
          isValidSchema(value: any) {
            if (!value || typeof value !== 'object') {
              throw new Error('Form schema must be a valid JSON object');
            }
            if (!value.fields || !Array.isArray(value.fields)) {
              throw new Error('Form schema must contain fields array');
            }
          }
        }
      },
      validation_rules: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      ui_configuration: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          theme: 'default',
          layout: 'single-column',
          show_progress: true,
          allow_save_draft: true
        }
      },
      conditional_logic: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      business_rules: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      approval_workflow: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          enabled: false,
          steps: []
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'FormConfiguration',
      tableName: 'form_configurations',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['tenant_id', 'form_name', 'form_version']
        },
        {
          fields: ['tenant_id', 'form_type']
        },
        {
          fields: ['tenant_id', 'banking_type']
        },
        {
          fields: ['is_active']
        },
        {
          fields: ['is_default']
        }
      ],
      hooks: {
        beforeCreate: (instance: FormConfiguration) => {
          if (!instance.id) {
            instance.id = uuidv4();
          }
          instance.updated_by = instance.created_by;
        },
        beforeUpdate: (instance: FormConfiguration) => {
          instance.updated_at = new Date();
        }
      }
    }
  );

  return FormConfiguration;
};

export default FormConfiguration;
