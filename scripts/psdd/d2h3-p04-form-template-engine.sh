#!/bin/bash
# PSDD METHODOLOGY - MANDATORY HEADER PATTERN
# Script: d2h3-p04-form-template-engine.sh
# Phase: D2H3-P04 - Form Template Engine
# Objective: Generate form template engine for banking form templates
# Generated: $(date)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-p04-$(date +%Y%m%d-%H%M%S).log"

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

# Generate form template engine
generate_form_template_engine() {
    local template_path="${PROJECT_ROOT}/packages/backend/src/core/services/platform/FormTemplateEngine.ts"
    
    log_info "Generating form template engine: ${template_path}"
    
    mkdir -p "$(dirname "${template_path}")"
    
    cat > "${template_path}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/platform/FormTemplateEngine.ts
// Generated: $(date)
// Phase: D2H3-P04 - Form Template Engine
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: FormConfiguration, template processing
// Purpose: Form template engine for banking-specific form generation
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { FormConfiguration } from '../../models/platform/FormConfiguration';
import { TenantContextService } from '../tenant/TenantContextService';
import { ConfigurationService } from '../configuration/ConfigurationService';

export interface FormTemplate {
  id: string;
  name: string;
  category: 'banking' | 'syariah' | 'regulatory' | 'custom';
  banking_type: 'conventional' | 'syariah' | 'dual';
  form_type: string;
  template_schema: Record<string, any>;
  default_values: Record<string, any>;
  validation_rules: Record<string, any>;
  business_rules: Record<string, any>;
  ui_configuration: Record<string, any>;
  is_system_template: boolean;
}

@Injectable()
export class FormTemplateEngine {
  private readonly logger = new Logger(FormTemplateEngine.name);
  private templates: Map<string, FormTemplate> = new Map();

  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly configurationService: ConfigurationService
  ) {
    this.initializeSystemTemplates();
  }

  /**
   * Initialize system form templates
   */
  private initializeSystemTemplates(): void {
    this.logger.log('Initializing system form templates...');

    // Customer Onboarding Templates
    this.registerTemplate(this.createCustomerOnboardingTemplate('conventional'));
    this.registerTemplate(this.createCustomerOnboardingTemplate('syariah'));

    // Loan Application Templates
    this.registerTemplate(this.createLoanApplicationTemplate('conventional'));
    this.registerTemplate(this.createSyariahFinancingTemplate());

    // Portfolio Import Templates
    this.registerTemplate(this.createPortfolioImportTemplate());

    // Syariah Compliance Templates
    this.registerTemplate(this.createSyariahComplianceTemplate());

    // ECL Calculation Templates
    this.registerTemplate(this.createECLCalculationTemplate());

    this.logger.log(`Loaded ${this.templates.size} system templates`);
  }

  /**
   * Register a form template
   */
  private registerTemplate(template: FormTemplate): void {
    this.templates.set(template.id, template);
    this.logger.debug(`Registered template: ${template.name} (${template.id})`);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<FormTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates
   */
  async getTemplates(filters: {
    category?: string;
    banking_type?: string;
    form_type?: string;
  } = {}): Promise<FormTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (filters.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters.banking_type) {
      templates = templates.filter(t => 
        t.banking_type === filters.banking_type || t.banking_type === 'dual'
      );
    }

    if (filters.form_type) {
      templates = templates.filter(t => t.form_type === filters.form_type);
    }

    return templates;
  }

  /**
   * Create form configuration from template
   */
  async createFormFromTemplate(
    templateId: string,
    formName: string,
    userId: string,
    customizations?: Record<string, any>
  ): Promise<any> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      this.logger.log(`Creating form from template: ${templateId} -> ${formName}`);

      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Apply customizations
      const formSchema = customizations?.form_schema 
        ? { ...template.template_schema, ...customizations.form_schema }
        : template.template_schema;

      const validationRules = customizations?.validation_rules
        ? { ...template.validation_rules, ...customizations.validation_rules }
        : template.validation_rules;

      const uiConfiguration = customizations?.ui_configuration
        ? { ...template.ui_configuration, ...customizations.ui_configuration }
        : template.ui_configuration;

      // Create form configuration
      const formConfig = {
        form_name: formName,
        form_type: template.form_type,
        banking_type: template.banking_type,
        form_schema: formSchema,
        validation_rules: validationRules,
        ui_configuration: uiConfiguration,
        business_rules: template.business_rules,
        approval_workflow: { enabled: false, steps: [] }
      };

      return formConfig;

    } catch (error) {
      this.logger.error(`Failed to create form from template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create customer onboarding template
   */
  private createCustomerOnboardingTemplate(bankingType: 'conventional' | 'syariah'): FormTemplate {
    const baseFields = [
      {
        id: 'full_name',
        name: 'full_name',
        type: 'text',
        label: 'Full Name',
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: 'date_of_birth',
        name: 'date_of_birth',
        type: 'date',
        label: 'Date of Birth',
        required: true
      },
      {
        id: 'nationality',
        name: 'nationality',
        type: 'select',
        label: 'Nationality',
        required: true,
        options: [
          { label: 'Indonesia', value: 'ID' },
          { label: 'Malaysia', value: 'MY' },
          { label: 'Singapore', value: 'SG' }
        ]
      },
      {
        id: 'id_number',
        name: 'id_number',
        type: 'text',
        label: 'ID Number',
        required: true,
        validation: { pattern: '^[0-9]+$' }
      },
      {
        id: 'phone',
        name: 'phone',
        type: 'text',
        label: 'Phone Number',
        required: true,
        validation: { pattern: '^[+]?[0-9\\s\\-\\(\\)]+$' }
      },
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Email Address',
        required: true
      },
      {
        id: 'address',
        name: 'address',
        type: 'textarea',
        label: 'Address',
        required: true
      },
      {
        id: 'monthly_income',
        name: 'monthly_income',
        type: 'currency',
        label: 'Monthly Income',
        required: true,
        validation: { min: 0 }
      }
    ];

    if (bankingType === 'syariah') {
      baseFields.push(
        {
          id: 'syariah_compliance_confirmation',
          name: 'syariah_compliance_confirmation',
          type: 'checkbox',
          label: 'I confirm compliance with Syariah principles',
          required: true
        },
        {
          id: 'prohibited_activities_declaration',
          name: 'prohibited_activities_declaration',
          type: 'checkbox',
          label: 'I declare no involvement in prohibited activities (Riba, Gharar, Maysir)',
          required: true
        }
      );
    }

    return {
      id: `customer_onboarding_${bankingType}`,
      name: `Customer Onboarding - ${bankingType.charAt(0).toUpperCase() + bankingType.slice(1)}`,
      category: bankingType === 'syariah' ? 'syariah' : 'banking',
      banking_type: bankingType,
      form_type: 'customer_onboarding',
      template_schema: {
        title: `Customer Onboarding Form - ${bankingType.charAt(0).toUpperCase() + bankingType.slice(1)} Banking`,
        description: `Complete customer onboarding for ${bankingType} banking services`,
        fields: baseFields
      },
      default_values: {},
      validation_rules: {
        field_level: {
          email: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
          phone: { pattern: '^[+]?[0-9\\s\\-\\(\\)]+$' },
          monthly_income: { min: 0 }
        }
      },
      business_rules: bankingType === 'syariah' ? {
        syariah_compliance_rules: [
          {
            rule_type: 'sector_screening',
            condition: 'prohibited_sectors',
            action: 'block',
            message: 'Employment in prohibited sectors not allowed for Syariah banking'
          }
        ]
      } : {},
      ui_configuration: {
        theme: bankingType === 'syariah' ? 'syariah' : 'default',
        layout: 'single-column',
        show_progress: true,
        branding: bankingType === 'syariah' ? {
          primary_color: '#2E7D32',
          secondary_color: '#FFD700'
        } : {}
      },
      is_system_template: true
    };
  }

  /**
   * Create loan application template
   */
  private createLoanApplicationTemplate(bankingType: 'conventional'): FormTemplate {
    return {
      id: 'loan_application_conventional',
      name: 'Loan Application - Conventional',
      category: 'banking',
      banking_type: bankingType,
      form_type: 'loan_application',
      template_schema: {
        title: 'Loan Application Form',
        description: 'Apply for conventional banking loan products',
        fields: [
          {
            id: 'loan_amount',
            name: 'loan_amount',
            type: 'currency',
            label: 'Loan Amount',
            required: true,
            validation: { min: 10000000, max: 10000000000 }
          },
          {
            id: 'loan_purpose',
            name: 'loan_purpose',
            type: 'select',
            label: 'Loan Purpose',
            required: true,
            options: [
              { label: 'Home Purchase', value: 'home_purchase' },
              { label: 'Car Purchase', value: 'car_purchase' },
              { label: 'Business Investment', value: 'business_investment' },
              { label: 'Personal Use', value: 'personal_use' }
            ]
          },
          {
            id: 'repayment_period',
            name: 'repayment_period',
            type: 'number',
            label: 'Repayment Period (months)',
            required: true,
            validation: { min: 12, max: 360 }
          },
          {
            id: 'interest_rate_type',
            name: 'interest_rate_type',
            type: 'select',
            label: 'Interest Rate Type',
            required: true,
            options: [
              { label: 'Fixed Rate', value: 'fixed' },
              { label: 'Floating Rate', value: 'floating' }
            ]
          }
        ]
      },
      default_values: {
        interest_rate_type: 'floating'
      },
      validation_rules: {
        field_level: {
          loan_amount: { min: 10000000, max: 10000000000 },
          repayment_period: { min: 12, max: 360 }
        }
      },
      business_rules: {},
      ui_configuration: {
        theme: 'default',
        layout: 'single-column',
        show_progress: true
      },
      is_system_template: true
    };
  }

  /**
   * Create Syariah financing template
   */
  private createSyariahFinancingTemplate(): FormTemplate {
    return {
      id: 'syariah_financing',
      name: 'Syariah Financing Application',
      category: 'syariah',
      banking_type: 'syariah',
      form_type: 'loan_application',
      template_schema: {
        title: 'Syariah Financing Application',
        description: 'Apply for Syariah-compliant financing products',
        fields: [
          {
            id: 'financing_amount',
            name: 'financing_amount',
            type: 'currency',
            label: 'Financing Amount',
            required: true,
            validation: { min: 10000000, max: 50000000000 }
          },
          {
            id: 'financing_structure',
            name: 'financing_structure',
            type: 'select',
            label: 'Financing Structure',
            required: true,
            options: [
              { label: 'Murabaha (Cost Plus)', value: 'murabaha' },
              { label: 'Musharaka (Partnership)', value: 'musharaka' },
              { label: 'Mudharaba (Profit Sharing)', value: 'mudharaba' },
              { label: 'Ijarah (Leasing)', value: 'ijarah' }
            ]
          },
          {
            id: 'financing_purpose',
            name: 'financing_purpose',
            type: 'textarea',
            label: 'Financing Purpose',
            required: true
          },
          {
            id: 'asset_description',
            name: 'asset_description',
            type: 'textarea',
            label: 'Asset Description',
            required: true
          },
          {
            id: 'syariah_compliance_declaration',
            name: 'syariah_compliance_declaration',
            type: 'checkbox',
            label: 'I declare this financing is for Syariah-compliant purposes',
            required: true
          }
        ]
      },
      default_values: {
        financing_structure: 'murabaha'
      },
      validation_rules: {
        field_level: {
          financing_amount: { min: 10000000, max: 50000000000 }
        }
      },
      business_rules: {
        syariah_compliance_rules: [
          {
            rule_type: 'sector_screening',
            condition: 'prohibited_sectors',
            action: 'block',
            message: 'Financing not available for non-Syariah compliant activities'
          }
        ]
      },
      ui_configuration: {
        theme: 'syariah',
        layout: 'single-column',
        show_progress: true,
        branding: {
          primary_color: '#2E7D32',
          secondary_color: '#FFD700'
        }
      },
      is_system_template: true
    };
  }

  /**
   * Create portfolio import template
   */
  private createPortfolioImportTemplate(): FormTemplate {
    return {
      id: 'portfolio_import',
      name: 'Portfolio Data Import',
      category: 'banking',
      banking_type: 'dual',
      form_type: 'portfolio_import',
      template_schema: {
        title: 'Portfolio Data Import',
        description: 'Import portfolio data for IFRS 9 calculations',
        fields: [
          {
            id: 'import_file',
            name: 'import_file',
            type: 'file',
            label: 'Portfolio Data File',
            required: true,
            validation: {
              file_types: ['xlsx', 'csv'],
              max_size: 52428800
            }
          },
          {
            id: 'data_type',
            name: 'data_type',
            type: 'select',
            label: 'Data Type',
            required: true,
            options: [
              { label: 'Loan Portfolio', value: 'loan_portfolio' },
              { label: 'Customer Data', value: 'customer_data' },
              { label: 'Economic Parameters', value: 'economic_params' }
            ]
          },
          {
            id: 'reporting_date',
            name: 'reporting_date',
            type: 'date',
            label: 'Reporting Date',
            required: true
          }
        ]
      },
      default_values: {
        validation_level: 'strict'
      },
      validation_rules: {},
      business_rules: {},
      ui_configuration: {
        theme: 'default',
        layout: 'single-column',
        show_progress: true
      },
      is_system_template: true
    };
  }

  /**
   * Create Syariah compliance template
   */
  private createSyariahComplianceTemplate(): FormTemplate {
    return {
      id: 'syariah_compliance',
      name: 'Syariah Compliance Assessment',
      category: 'syariah',
      banking_type: 'syariah',
      form_type: 'syariah_compliance',
      template_schema: {
        title: 'Syariah Compliance Assessment',
        description: 'Assess Syariah compliance for financing applications',
        fields: [
          {
            id: 'business_nature',
            name: 'business_nature',
            type: 'textarea',
            label: 'Nature of Business',
            required: true
          },
          {
            id: 'sector_classification',
            name: 'sector_classification',
            type: 'select',
            label: 'Sector Classification',
            required: true,
            options: [
              { label: 'Agriculture', value: 'agriculture' },
              { label: 'Manufacturing', value: 'manufacturing' },
              { label: 'Services', value: 'services' },
              { label: 'Technology', value: 'technology' }
            ]
          },
          {
            id: 'prohibited_activities_check',
            name: 'prohibited_activities_check',
            type: 'checkbox',
            label: 'No involvement in prohibited activities',
            required: true
          },
          {
            id: 'shariah_board_review',
            name: 'shariah_board_review',
            type: 'select',
            label: 'Shariah Board Review Required',
            required: true,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]
          }
        ]
      },
      default_values: {
        shariah_board_review: 'yes'
      },
      validation_rules: {},
      business_rules: {
        syariah_compliance_rules: [
          {
            rule_type: 'sector_screening',
            condition: 'prohibited_sectors',
            action: 'block',
            message: 'This sector is not Syariah compliant'
          }
        ]
      },
      ui_configuration: {
        theme: 'syariah',
        layout: 'single-column',
        show_progress: true,
        branding: {
          primary_color: '#2E7D32'
        }
      },
      is_system_template: true
    };
  }

  /**
   * Create ECL calculation template
   */
  private createECLCalculationTemplate(): FormTemplate {
    return {
      id: 'ecl_calculation',
      name: 'ECL Calculation Parameters',
      category: 'banking',
      banking_type: 'dual',
      form_type: 'ecl_calculation',
      template_schema: {
        title: 'ECL Calculation Parameters',
        description: 'Configure parameters for Expected Credit Loss calculations',
        fields: [
          {
            id: 'calculation_date',
            name: 'calculation_date',
            type: 'date',
            label: 'Calculation Date',
            required: true
          },
          {
            id: 'portfolio_segment',
            name: 'portfolio_segment',
            type: 'multiselect',
            label: 'Portfolio Segments',
            required: true,
            options: [
              { label: 'Retail Loans', value: 'retail' },
              { label: 'Corporate Loans', value: 'corporate' },
              { label: 'SME Loans', value: 'sme' }
            ]
          },
          {
            id: 'model_version',
            name: 'model_version',
            type: 'select',
            label: 'Model Version',
            required: true,
            options: [
              { label: 'Model v1.0', value: 'v1.0' },
              { label: 'Model v2.0', value: 'v2.0' }
            ]
          }
        ]
      },
      default_values: {
        scenario_type: 'base_case',
        output_format: 'detailed'
      },
      validation_rules: {},
      business_rules: {},
      ui_configuration: {
        theme: 'default',
        layout: 'single-column',
        show_progress: true
      },
      is_system_template: true
    };
  }

  /**
   * Export template to JSON
   */
  async exportTemplate(templateId: string): Promise<string> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  async importTemplate(templateJson: string): Promise<FormTemplate> {
    try {
      const template: FormTemplate = JSON.parse(templateJson);
      
      // Validate template structure
      if (!template.id || !template.name || !template.template_schema) {
        throw new Error('Invalid template structure');
      }

      // Mark as custom template
      template.is_system_template = false;
      
      this.registerTemplate(template);
      return template;

    } catch (error) {
      this.logger.error(`Failed to import template: ${error.message}`, error.stack);
      throw new Error(`Failed to import template: ${error.message}`);
    }
  }
}

export default FormTemplateEngine;
EOF

    log_success "Generated form template engine: ${template_path}"
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
    log_info "Starting D2H3-P04: Form Template Engine..."
    
    # Generate form template engine
    generate_form_template_engine
    
    # Track progress
    track_progress "D2H3-P04" "COMPLETED"
    
    log_success "D2H3-P04 execution completed successfully"
    log_info "Next phase: Run ./scripts/psdd/d2h3-p05-react-form-components.sh"
}

# Execute main function
main "$@"