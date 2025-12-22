#!/bin/bash
# PSDD METHODOLOGY - MANDATORY HEADER PATTERN
# Script: d2h3-p02-validation-schemas.sh
# Phase: D2H3-P02 - Form Validation Schemas
# Objective: Generate validation schemas for advanced form management
# Generated: $(date)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-p02-$(date +%Y%m%d-%H%M%S).log"

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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# Generate form validation schemas
generate_form_validation_schemas() {
    local schema_path="${PROJECT_ROOT}/packages/shared/schemas/src/api/form.schemas.ts"
    
    log_info "Generating form validation schemas: ${schema_path}"
    
    mkdir -p "$(dirname "${schema_path}")"
    
    cat > "${schema_path}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/schemas/src/api/form.schemas.ts
// Generated: $(date)
// Phase: D2H3-P02 - Form Validation Schemas
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Zod, form validation
// Purpose: Comprehensive form validation schemas for banking forms
// ============================================================================

import { z } from 'zod';

// Base form field schema
export const FormFieldSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum([
    'text', 'number', 'email', 'password', 'textarea', 'select', 
    'multiselect', 'checkbox', 'radio', 'date', 'datetime', 
    'currency', 'percentage', 'file', 'signature', 'conditional'
  ]),
  label: z.string().min(1).max(200),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    custom: z.array(z.string()).optional()
  }).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  conditional_logic: z.object({
    show_if: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
      value: z.any()
    })).optional(),
    required_if: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
      value: z.any()
    })).optional()
  }).optional(),
  banking_specific: z.object({
    banking_type: z.enum(['conventional', 'syariah', 'dual']).optional(),
    product_types: z.array(z.string()).optional(),
    regulatory_requirements: z.array(z.string()).optional(),
    syariah_compliance: z.object({
      shariah_board_approval: z.boolean().optional(),
      aaoifi_standard: z.string().optional(),
      prohibited_sectors: z.array(z.string()).optional()
    }).optional()
  }).optional()
});

// Form configuration creation schema
export const CreateFormConfigurationSchema = z.object({
  form_name: z.string().min(1).max(200),
  form_type: z.enum(['customer_onboarding', 'loan_application', 'ecl_calculation', 'portfolio_import', 'syariah_compliance', 'custom']),
  banking_type: z.enum(['conventional', 'syariah', 'dual']).default('dual'),
  form_version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  form_schema: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    fields: z.array(FormFieldSchema).min(1),
    sections: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      fields: z.array(z.string()),
      conditional: z.boolean().default(false)
    })).optional()
  }),
  validation_rules: z.object({
    global: z.array(z.object({
      rule: z.string(),
      message: z.string(),
      fields: z.array(z.string())
    })).optional(),
    field_level: z.record(z.any()).optional(),
    business_rules: z.array(z.object({
      name: z.string(),
      condition: z.string(),
      action: z.enum(['show_error', 'show_warning', 'hide_field', 'show_field', 'set_value']),
      message: z.string().optional(),
      target_field: z.string().optional(),
      target_value: z.any().optional()
    })).optional()
  }),
  ui_configuration: z.object({
    theme: z.enum(['default', 'banking', 'syariah']).default('default'),
    layout: z.enum(['single-column', 'two-column', 'tabs', 'accordion']).default('single-column'),
    show_progress: z.boolean().default(true),
    allow_save_draft: z.boolean().default(true),
    submit_button_text: z.string().default('Submit'),
    cancel_button_text: z.string().default('Cancel'),
    custom_css: z.string().optional(),
    branding: z.object({
      logo: z.string().optional(),
      primary_color: z.string().optional(),
      secondary_color: z.string().optional()
    }).optional()
  }).optional(),
  conditional_logic: z.object({
    global_conditions: z.array(z.object({
      id: z.string(),
      condition: z.string(),
      actions: z.array(z.object({
        type: z.enum(['show', 'hide', 'enable', 'disable', 'set_value', 'set_required']),
        target: z.string(),
        value: z.any().optional()
      }))
    })).optional()
  }).optional(),
  business_rules: z.object({
    banking_type_rules: z.array(z.object({
      banking_type: z.enum(['conventional', 'syariah']),
      field_modifications: z.array(z.object({
        field_id: z.string(),
        modification: z.enum(['hide', 'show', 'require', 'optional', 'set_value']),
        value: z.any().optional()
      }))
    })).optional(),
    syariah_compliance_rules: z.array(z.object({
      rule_type: z.enum(['sector_screening', 'financial_ratio', 'board_approval']),
      condition: z.string(),
      action: z.enum(['block', 'warn', 'require_approval']),
      message: z.string()
    })).optional()
  }).optional(),
  approval_workflow: z.object({
    enabled: z.boolean().default(false),
    steps: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['approval', 'review', 'validation']),
      approvers: z.array(z.string()),
      required_approvals: z.number().min(1),
      auto_approve_conditions: z.array(z.string()).optional(),
      timeout_hours: z.number().optional()
    })).optional()
  }).optional(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false)
});

// Form configuration update schema
export const UpdateFormConfigurationSchema = CreateFormConfigurationSchema.partial();

// Form submission schema
export const FormSubmissionSchema = z.object({
  form_configuration_id: z.string().uuid(),
  submission_data: z.record(z.any()),
  status: z.enum(['draft', 'submitted', 'in_review', 'approved', 'rejected']).default('draft'),
  save_as_draft: z.boolean().default(false),
  validate_only: z.boolean().default(false),
  additional_metadata: z.record(z.any()).optional()
});

// Banking-specific form templates
export const CustomerOnboardingFormSchema = z.object({
  personal_information: z.object({
    full_name: z.string().min(1).max(200),
    date_of_birth: z.string().datetime(),
    nationality: z.string(),
    id_number: z.string(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string()
  }),
  financial_information: z.object({
    monthly_income: z.number().min(0),
    employment_type: z.enum(['employed', 'self_employed', 'retired', 'unemployed']),
    employer_name: z.string().optional(),
    bank_statements: z.array(z.string()).optional()
  }),
  kyc_documents: z.object({
    identity_document: z.string(),
    address_proof: z.string(),
    income_proof: z.string().optional()
  }),
  banking_preferences: z.object({
    banking_type: z.enum(['conventional', 'syariah']),
    preferred_products: z.array(z.string()),
    communication_preferences: z.array(z.enum(['email', 'sms', 'phone', 'mail']))
  })
});

export const LoanApplicationFormSchema = z.object({
  loan_details: z.object({
    loan_amount: z.number().min(1),
    loan_purpose: z.string(),
    repayment_period: z.number().min(1).max(360),
    banking_type: z.enum(['conventional', 'syariah']),
    product_type: z.string()
  }),
  applicant_information: z.object({
    customer_id: z.string().uuid(),
    co_applicants: z.array(z.object({
      name: z.string(),
      relationship: z.string(),
      income: z.number()
    })).optional()
  }),
  collateral_information: z.object({
    collateral_type: z.enum(['property', 'vehicle', 'cash_deposit', 'securities', 'none']),
    collateral_value: z.number().optional(),
    collateral_documents: z.array(z.string()).optional()
  }),
  syariah_specific: z.object({
    financing_structure: z.enum(['murabaha', 'musharaka', 'mudharaba', 'ijarah']).optional(),
    shariah_compliance_confirmation: z.boolean().optional(),
    shariah_board_approval: z.boolean().optional()
  }).optional()
});

export const SyariahComplianceFormSchema = z.object({
  business_screening: z.object({
    business_nature: z.string(),
    prohibited_activities_check: z.boolean(),
    sector_classification: z.string(),
    shariah_compliance_score: z.number().min(0).max(100).optional()
  }),
  financial_ratios: z.object({
    debt_to_equity: z.number().optional(),
    interest_income_percentage: z.number().min(0).max(100).optional(),
    non_compliant_revenue_percentage: z.number().min(0).max(100).optional()
  }),
  shariah_board: z.object({
    review_required: z.boolean(),
    board_members: z.array(z.string()).optional(),
    review_date: z.string().datetime().optional(),
    approval_status: z.enum(['pending', 'approved', 'rejected', 'conditional']).optional(),
    conditions: z.array(z.string()).optional()
  })
});

// Form validation utilities
export const validateFormSubmission = (
  formConfiguration: any,
  submissionData: any
): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic field validation
  if (formConfiguration.form_schema.fields) {
    for (const field of formConfiguration.form_schema.fields) {
      const value = submissionData[field.name];
      
      // Required field validation
      if (field.required && (!value || value === '')) {
        errors.push(`${field.label} is required`);
      }
      
      // Type-specific validation
      if (value) {
        switch (field.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(`${field.label} must be a valid email address`);
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${field.label} must be a number`);
            }
            break;
          case 'currency':
            if (isNaN(Number(value)) || Number(value) < 0) {
              errors.push(`${field.label} must be a positive number`);
            }
            break;
        }
      }
      
      // Custom validation rules
      if (field.validation) {
        if (field.validation.min && Number(value) < field.validation.min) {
          errors.push(`${field.label} must be at least ${field.validation.min}`);
        }
        if (field.validation.max && Number(value) > field.validation.max) {
          errors.push(`${field.label} must be at most ${field.validation.max}`);
        }
        if (field.validation.minLength && String(value).length < field.validation.minLength) {
          errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
        }
        if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
          errors.push(`${field.label} must be at most ${field.validation.maxLength} characters`);
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
          errors.push(`${field.label} format is invalid`);
        }
      }
    }
  }

  // Business rules validation
  if (formConfiguration.business_rules?.syariah_compliance_rules) {
    for (const rule of formConfiguration.business_rules.syariah_compliance_rules) {
      if (rule.rule_type === 'sector_screening') {
        const businessNature = submissionData.business_screening?.business_nature;
        if (businessNature && rule.condition.includes(businessNature)) {
          if (rule.action === 'block') {
            errors.push(rule.message);
          } else if (rule.action === 'warn') {
            warnings.push(rule.message);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Export all schemas
export const FormValidationSchemas = {
  FormFieldSchema,
  CreateFormConfigurationSchema,
  UpdateFormConfigurationSchema,
  FormSubmissionSchema,
  CustomerOnboardingFormSchema,
  LoanApplicationFormSchema,
  SyariahComplianceFormSchema,
  validateFormSubmission
};

export default FormValidationSchemas;
EOF

    log_success "Generated form validation schemas: ${schema_path}"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# MANDATORY: Main function
main() {
    log_info "Starting D2H3-P02: Form Validation Schemas..."
    
    # Generate form validation schemas
    generate_form_validation_schemas
    
    # Track progress
    track_progress "D2H3-P02" "COMPLETED"
    
    log_success "D2H3-P02 execution completed successfully"
    log_info "Next phase: Run ./scripts/psdd/d2h3-p03-form-builder-service.sh"
}

# Execute main function
main "$@"