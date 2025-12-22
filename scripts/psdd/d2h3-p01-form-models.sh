#!/bin/bash
# PSDD METHODOLOGY - MANDATORY HEADER PATTERN
# Script: d2h3-p01-form-models.sh
# Phase: D2H3-P01 - Basic Form Configuration Models
# Objective: Generate basic form configuration models for advanced form management
# Generated: $(date)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-p01-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

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

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for D2H3-P01..."
    
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    local required_tools=("node" "pnpm")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_warning "No .env file found. Using defaults."
    fi
    
    log_success "Environment validation completed"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Generate form configuration model
generate_form_configuration_model() {
    local model_path="${PROJECT_ROOT}/packages/backend/src/core/models/platform/FormConfiguration.ts"
    
    log_info "Generating form configuration model: ${model_path}"
    
    mkdir -p "$(dirname "${model_path}")"
    
    cat > "${model_path}" << 'EOF'
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
EOF

    log_success "Generated form configuration model: ${model_path}"
}

# MANDATORY: Main function
main() {
    log_info "Starting D2H3-P01: Basic Form Configuration Models..."
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads}
    
    # Validate environment
    validate_environment
    
    # Generate form configuration model
    generate_form_configuration_model
    
    # Track progress
    track_progress "D2H3-P01" "COMPLETED"
    
    log_success "D2H3-P01 execution completed successfully"
    log_info "Next phase: Run ./scripts/psdd/d2h3-p02-validation-schemas.sh"
}

# Execute main function with all arguments
main "$@"