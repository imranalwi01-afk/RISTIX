// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/templates/banking/BankingFormTemplates.ts
// Generated: $(date)
// Phase: D2H3-P07 - Banking-Specific Form Templates
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: FormConfiguration, FormTemplateEngine
// Purpose: Pre-defined banking domain form templates for IFRS 9 platform
// ============================================================================

import { FormConfiguration } from '../../models/platform/FormConfiguration';
import { FormTemplateEngine } from '../../services/platform/FormTemplateEngine';

/**
 * Banking-specific form templates for IFRS 9 platform
 * Supports both conventional and Syariah banking
 */
export class BankingFormTemplates {
  private static readonly TEMPLATES = {
    // Customer Onboarding Templates
    CUSTOMER_ONBOARDING_CONVENTIONAL: 'customer-onboarding-conventional',
    CUSTOMER_ONBOARDING_SYARIAH: 'customer-onboarding-syariah',
    
    // Loan Application Templates
    LOAN_APPLICATION_CONVENTIONAL: 'loan-application-conventional',
    FINANCING_APPLICATION_SYARIAH: 'financing-application-syariah',
    
    // Portfolio Management Templates
    PORTFOLIO_IMPORT: 'portfolio-import',
    BATCH_UPLOAD: 'batch-upload',
    
    // Compliance Templates
    SYARIAH_COMPLIANCE_CHECK: 'syariah-compliance-check',
    REGULATORY_REPORTING: 'regulatory-reporting'
  };

  /**
   * Get customer onboarding template for conventional banking
   */
  static getCustomerOnboardingConventional(): Partial<FormConfiguration> {
    return {
      name: 'Customer Onboarding - Conventional',
      description: 'Standard customer onboarding form for conventional banking',
      bankingType: 'conventional',
      category: 'customer-management',
      fields: [
        {
          id: 'customer_name',
          type: 'text',
          label: 'Customer Name',
          required: true,
          validation: { minLength: 2, maxLength: 100 }
        },
        {
          id: 'customer_type',
          type: 'select',
          label: 'Customer Type',
          required: true,
          options: [
            { value: 'individual', label: 'Individual' },
            { value: 'corporate', label: 'Corporate' }
          ]
        },
        {
          id: 'identification_number',
          type: 'text',
          label: 'ID Number (KTP/NPWP)',
          required: true,
          validation: { pattern: '^[0-9]{16}$' }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          id: 'phone',
          type: 'text',
          label: 'Phone Number',
          required: true,
          validation: { pattern: '^\\+62[0-9]{9,12}$' }
        },
        {
          id: 'address',
          type: 'textarea',
          label: 'Address',
          required: true
        },
        {
          id: 'monthly_income',
          type: 'currency',
          label: 'Monthly Income (IDR)',
          required: true,
          validation: { min: 0 }
        }
      ],
      submitUrl: '/api/customers',
      redirectUrl: '/dashboard/customers',
      validationRules: ['required_fields', 'email_format', 'phone_format'],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        complianceLevel: 'standard'
      }
    };
  }

  /**
   * Get customer onboarding template for Syariah banking
   */
  static getCustomerOnboardingSyariah(): Partial<FormConfiguration> {
    return {
      name: 'Customer Onboarding - Syariah',
      description: 'Syariah-compliant customer onboarding form',
      bankingType: 'syariah',
      category: 'customer-management',
      fields: [
        {
          id: 'customer_name',
          type: 'text',
          label: 'Customer Name',
          required: true,
          validation: { minLength: 2, maxLength: 100 }
        },
        {
          id: 'customer_type',
          type: 'select',
          label: 'Customer Type',
          required: true,
          options: [
            { value: 'individual', label: 'Individual Muslim' },
            { value: 'corporate', label: 'Syariah Corporate' }
          ]
        },
        {
          id: 'syariah_compliance_agreement',
          type: 'checkbox',
          label: 'I agree to Syariah banking principles',
          required: true
        },
        {
          id: 'identification_number',
          type: 'text',
          label: 'ID Number (KTP/NPWP)',
          required: true,
          validation: { pattern: '^[0-9]{16}$' }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          id: 'phone',
          type: 'text',
          label: 'Phone Number',
          required: true,
          validation: { pattern: '^\\+62[0-9]{9,12}$' }
        },
        {
          id: 'address',
          type: 'textarea',
          label: 'Address',
          required: true
        },
        {
          id: 'monthly_income',
          type: 'currency',
          label: 'Monthly Income (IDR)',
          required: true,
          validation: { min: 0 }
        },
        {
          id: 'income_source_halal',
          type: 'checkbox',
          label: 'I confirm my income source is halal',
          required: true
        }
      ],
      submitUrl: '/api/customers',
      redirectUrl: '/dashboard/customers',
      validationRules: ['required_fields', 'email_format', 'phone_format', 'syariah_compliance'],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        complianceLevel: 'syariah',
        boardApproval: 'required'
      }
    };
  }

  /**
   * Get loan application template for conventional banking
   */
  static getLoanApplicationConventional(): Partial<FormConfiguration> {
    return {
      name: 'Loan Application - Conventional',
      description: 'Standard loan application form',
      bankingType: 'conventional',
      category: 'loan-management',
      fields: [
        {
          id: 'customer_id',
          type: 'select',
          label: 'Customer',
          required: true,
          dataSource: '/api/customers'
        },
        {
          id: 'loan_amount',
          type: 'currency',
          label: 'Loan Amount (IDR)',
          required: true,
          validation: { min: 1000000, max: 10000000000 }
        },
        {
          id: 'loan_purpose',
          type: 'select',
          label: 'Loan Purpose',
          required: true,
          options: [
            { value: 'business', label: 'Business' },
            { value: 'personal', label: 'Personal' },
            { value: 'property', label: 'Property' },
            { value: 'vehicle', label: 'Vehicle' }
          ]
        },
        {
          id: 'loan_term_months',
          type: 'number',
          label: 'Loan Term (Months)',
          required: true,
          validation: { min: 1, max: 360 }
        },
        {
          id: 'interest_rate',
          type: 'number',
          label: 'Interest Rate (%)',
          required: true,
          validation: { min: 0.1, max: 30 }
        },
        {
          id: 'collateral_type',
          type: 'select',
          label: 'Collateral Type',
          required: false,
          options: [
            { value: 'property', label: 'Property' },
            { value: 'vehicle', label: 'Vehicle' },
            { value: 'deposit', label: 'Deposit' },
            { value: 'guarantee', label: 'Personal Guarantee' }
          ]
        }
      ],
      submitUrl: '/api/loans',
      redirectUrl: '/dashboard/loans',
      validationRules: ['required_fields', 'amount_validation', 'term_validation'],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        complianceLevel: 'standard'
      }
    };
  }

  /**
   * Get financing application template for Syariah banking
   */
  static getFinancingApplicationSyariah(): Partial<FormConfiguration> {
    return {
      name: 'Financing Application - Syariah',
      description: 'Syariah-compliant financing application',
      bankingType: 'syariah',
      category: 'financing-management',
      fields: [
        {
          id: 'customer_id',
          type: 'select',
          label: 'Customer',
          required: true,
          dataSource: '/api/customers?type=syariah'
        },
        {
          id: 'financing_amount',
          type: 'currency',
          label: 'Financing Amount (IDR)',
          required: true,
          validation: { min: 1000000, max: 10000000000 }
        },
        {
          id: 'financing_type',
          type: 'select',
          label: 'Financing Type',
          required: true,
          options: [
            { value: 'murabaha', label: 'Murabaha (Sale & Purchase)' },
            { value: 'musharaka', label: 'Musharaka (Partnership)' },
            { value: 'mudharaba', label: 'Mudharaba (Profit Sharing)' },
            { value: 'ijara', label: 'Ijara (Lease)' },
            { value: 'istisna', label: 'Istisna (Manufacturing)' }
          ]
        },
        {
          id: 'financing_purpose',
          type: 'select',
          label: 'Financing Purpose',
          required: true,
          options: [
            { value: 'business_halal', label: 'Halal Business' },
            { value: 'property', label: 'Property (Halal)' },
            { value: 'education', label: 'Education' },
            { value: 'pilgrimage', label: 'Hajj/Umrah' }
          ]
        },
        {
          id: 'financing_term_months',
          type: 'number',
          label: 'Financing Term (Months)',
          required: true,
          validation: { min: 1, max: 300 }
        },
        {
          id: 'profit_sharing_ratio',
          type: 'number',
          label: 'Profit Sharing Ratio (%)',
          required: true,
          validation: { min: 10, max: 90 }
        },
        {
          id: 'syariah_board_approval',
          type: 'checkbox',
          label: 'Subject to Syariah Board approval',
          required: true,
          readOnly: true,
          defaultValue: true
        }
      ],
      submitUrl: '/api/financing',
      redirectUrl: '/dashboard/financing',
      validationRules: ['required_fields', 'amount_validation', 'syariah_compliance', 'halal_purpose'],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        complianceLevel: 'syariah',
        boardApproval: 'required'
      }
    };
  }

  /**
   * Get portfolio import template
   */
  static getPortfolioImportTemplate(): Partial<FormConfiguration> {
    return {
      name: 'Portfolio Data Import',
      description: 'Import portfolio data for IFRS 9 calculations',
      bankingType: 'both',
      category: 'data-management',
      fields: [
        {
          id: 'import_file',
          type: 'file',
          label: 'Portfolio Data File',
          required: true,
          validation: { 
            allowedTypes: ['xlsx', 'xls', 'csv'],
            maxSize: '50MB'
          }
        },
        {
          id: 'data_type',
          type: 'select',
          label: 'Data Type',
          required: true,
          options: [
            { value: 'customer_data', label: 'Customer Data' },
            { value: 'loan_data', label: 'Loan/Financing Data' },
            { value: 'payment_history', label: 'Payment History' },
            { value: 'collateral_data', label: 'Collateral Data' }
          ]
        },
        {
          id: 'effective_date',
          type: 'date',
          label: 'Effective Date',
          required: true
        },
        {
          id: 'banking_type_filter',
          type: 'select',
          label: 'Banking Type',
          required: true,
          options: [
            { value: 'conventional', label: 'Conventional' },
            { value: 'syariah', label: 'Syariah' },
            { value: 'both', label: 'Both' }
          ]
        }
      ],
      submitUrl: '/api/portfolio/import',
      redirectUrl: '/dashboard/portfolio',
      validationRules: ['required_fields', 'file_validation'],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        maxFileSize: '50MB',
        supportedFormats: ['xlsx', 'xls', 'csv']
      }
    };
  }

  /**
   * Register all banking templates
   */
  static async registerAllTemplates(templateEngine: FormTemplateEngine): Promise<void> {
    const templates = [
      {
        id: this.TEMPLATES.CUSTOMER_ONBOARDING_CONVENTIONAL,
        config: this.getCustomerOnboardingConventional()
      },
      {
        id: this.TEMPLATES.CUSTOMER_ONBOARDING_SYARIAH,
        config: this.getCustomerOnboardingSyariah()
      },
      {
        id: this.TEMPLATES.LOAN_APPLICATION_CONVENTIONAL,
        config: this.getLoanApplicationConventional()
      },
      {
        id: this.TEMPLATES.FINANCING_APPLICATION_SYARIAH,
        config: this.getFinancingApplicationSyariah()
      },
      {
        id: this.TEMPLATES.PORTFOLIO_IMPORT,
        config: this.getPortfolioImportTemplate()
      }
    ];

    for (const template of templates) {
      await templateEngine.registerTemplate(template.id, template.config);
    }
  }
}
