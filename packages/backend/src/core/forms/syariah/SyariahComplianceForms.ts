// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/forms/syariah/SyariahComplianceForms.ts
// Generated: $(date)
// Phase: D2H3-P08 - Syariah Compliance Forms
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: FormConfiguration, AAOIFI Standards
// Purpose: Syariah compliance forms for Islamic banking operations
// ============================================================================

import { FormConfiguration } from '../../models/platform/FormConfiguration';

/**
 * Syariah compliance forms following AAOIFI standards
 * Islamic Financial Services Board (IFSB) compliance
 */
export class SyariahComplianceForms {
  
  /**
   * Syariah Board Review Form
   * For product approval and compliance assessment
   */
  static getSyariahBoardReviewForm(): Partial<FormConfiguration> {
    return {
      name: 'Syariah Board Review',
      description: 'Product review form for Syariah Board approval',
      bankingType: 'syariah',
      category: 'compliance',
      isSystemForm: true,
      fields: [
        {
          id: 'product_name',
          type: 'text',
          label: 'Product Name',
          required: true,
          validation: { minLength: 3, maxLength: 100 }
        },
        {
          id: 'product_type',
          type: 'select',
          label: 'Product Type',
          required: true,
          options: [
            { value: 'murabaha', label: 'Murabaha (Sale)' },
            { value: 'musharaka', label: 'Musharaka (Partnership)' },
            { value: 'mudharaba', label: 'Mudharaba (Profit Sharing)' },
            { value: 'ijara', label: 'Ijara (Lease)' },
            { value: 'istisna', label: 'Istisna (Manufacturing)' },
            { value: 'salam', label: 'Salam (Forward Sale)' },
            { value: 'sukuk', label: 'Sukuk (Islamic Bonds)' }
          ]
        },
        {
          id: 'aaoifi_standard',
          type: 'select',
          label: 'AAOIFI Standard Reference',
          required: true,
          options: [
            { value: 'fiqh_2', label: 'AAOIFI Fiqh Standard No. 2 (Sale/Salam)' },
            { value: 'fiqh_3', label: 'AAOIFI Fiqh Standard No. 3 (Default)' },
            { value: 'fiqh_5', label: 'AAOIFI Fiqh Standard No. 5 (Guarantees)' },
            { value: 'fiqh_8', label: 'AAOIFI Fiqh Standard No. 8 (Murabaha)' },
            { value: 'fiqh_12', label: 'AAOIFI Fiqh Standard No. 12 (Sharika/Musharaka)' },
            { value: 'fiqh_13', label: 'AAOIFI Fiqh Standard No. 13 (Mudharaba)' }
          ]
        },
        {
          id: 'syariah_principles',
          type: 'multiselect',
          label: 'Syariah Principles Applied',
          required: true,
          options: [
            { value: 'no_riba', label: 'No Riba (Interest)' },
            { value: 'no_gharar', label: 'No Gharar (Excessive Uncertainty)' },
            { value: 'no_maysir', label: 'No Maysir (Gambling)' },
            { value: 'asset_backed', label: 'Asset-Backed Transaction' },
            { value: 'risk_sharing', label: 'Risk Sharing' },
            { value: 'real_economic_activity', label: 'Real Economic Activity' }
          ]
        },
        {
          id: 'prohibited_activities_check',
          type: 'checkbox',
          label: 'Product does not involve prohibited activities',
          required: true
        },
        {
          id: 'underlying_asset',
          type: 'textarea',
          label: 'Description of Underlying Asset/Activity',
          required: true,
          validation: { minLength: 10, maxLength: 500 }
        },
        {
          id: 'profit_loss_structure',
          type: 'textarea',
          label: 'Profit/Loss Sharing Structure',
          required: true,
          validation: { minLength: 10, maxLength: 500 }
        },
        {
          id: 'board_member_review',
          type: 'select',
          label: 'Board Member Assigned',
          required: true,
          dataSource: '/api/syariah-board/members'
        },
        {
          id: 'review_status',
          type: 'select',
          label: 'Review Status',
          required: true,
          options: [
            { value: 'pending', label: 'Pending Review' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'conditional', label: 'Conditionally Approved' }
          ]
        },
        {
          id: 'fatwa_reference',
          type: 'text',
          label: 'Fatwa Reference Number',
          required: false,
          validation: { pattern: '^DSN-[0-9]{2}/[0-9]{4}' }
        }
      ],
      submitUrl: '/api/syariah/board-review',
      redirectUrl: '/dashboard/syariah/compliance',
      validationRules: ['required_fields', 'syariah_principles_check'],
      metadata: {
        version: '1.0.0',
        complianceStandard: 'AAOIFI',
        boardApproval: 'required',
        auditTrail: true
      }
    };
  }

  /**
   * Halal Income Verification Form
   */
  static getHalalIncomeVerificationForm(): Partial<FormConfiguration> {
    return {
      name: 'Halal Income Verification',
      description: 'Customer income source verification for Syariah compliance',
      bankingType: 'syariah',
      category: 'customer-verification',
      fields: [
        {
          id: 'customer_id',
          type: 'select',
          label: 'Customer',
          required: true,
          dataSource: '/api/customers?type=syariah'
        },
        {
          id: 'income_sources',
          type: 'multiselect',
          label: 'Income Sources',
          required: true,
          options: [
            { value: 'salary_halal', label: 'Salary (Halal Employment)' },
            { value: 'business_halal', label: 'Halal Business Income' },
            { value: 'investment_syariah', label: 'Syariah Investment Returns' },
            { value: 'rental_property', label: 'Rental Property Income' },
            { value: 'agricultural', label: 'Agricultural Income' },
            { value: 'inheritance', label: 'Inheritance (Halal)' },
            { value: 'gift_halal', label: 'Halal Gifts/Donations' }
          ]
        },
        {
          id: 'prohibited_income_check',
          type: 'checkbox',
          label: 'Customer confirms no income from prohibited sources',
          required: true
        },
        {
          id: 'employer_industry',
          type: 'select',
          label: 'Employer Industry',
          required: false,
          options: [
            { value: 'technology', label: 'Technology (Halal)' },
            { value: 'manufacturing', label: 'Manufacturing (Halal)' },
            { value: 'agriculture', label: 'Agriculture' },
            { value: 'education', label: 'Education' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'construction', label: 'Construction' },
            { value: 'trade', label: 'Trade (Halal Goods)' },
            { value: 'government', label: 'Government' }
          ]
        },
        {
          id: 'income_certification',
          type: 'file',
          label: 'Income Certification Documents',
          required: true,
          validation: { allowedTypes: ['pdf', 'jpg', 'png'], maxSize: '10MB' }
        }
      ],
      submitUrl: '/api/syariah/income-verification',
      redirectUrl: '/dashboard/customers',
      validationRules: ['required_fields', 'halal_income_verification'],
      metadata: {
        version: '1.0.0',
        complianceLevel: 'syariah',
        verificationRequired: true
      }
    };
  }

  /**
   * Syariah Audit Checklist Form
   */
  static getSyariahAuditChecklistForm(): Partial<FormConfiguration> {
    return {
      name: 'Syariah Audit Checklist',
      description: 'Internal Syariah audit compliance checklist',
      bankingType: 'syariah',
      category: 'audit',
      isSystemForm: true,
      fields: [
        {
          id: 'audit_period',
          type: 'text',
          label: 'Audit Period',
          required: true,
          validation: { pattern: '^[0-9]{4}-Q[1-4]' }
        },
        {
          id: 'product_compliance_check',
          type: 'checkbox',
          label: 'All products comply with Syariah principles',
          required: true
        },
        {
          id: 'contract_review_status',
          type: 'select',
          label: 'Contract Review Status',
          required: true,
          options: [
            { value: 'compliant', label: 'All Contracts Compliant' },
            { value: 'minor_issues', label: 'Minor Issues Identified' },
            { value: 'major_issues', label: 'Major Issues Identified' },
            { value: 'non_compliant', label: 'Non-Compliant Contracts Found' }
          ]
        },
        {
          id: 'zakah_calculation_verified',
          type: 'checkbox',
          label: 'Zakah calculations verified and accurate',
          required: true
        },
        {
          id: 'prohibited_transactions',
          type: 'number',
          label: 'Number of Prohibited Transactions (if any)',
          required: true,
          validation: { min: 0 }
        },
        {
          id: 'corrective_actions',
          type: 'textarea',
          label: 'Corrective Actions Required',
          required: false,
          validation: { maxLength: 1000 }
        }
      ],
      submitUrl: '/api/syariah/audit-checklist',
      redirectUrl: '/dashboard/syariah/audit',
      validationRules: ['required_fields', 'audit_validation'],
      metadata: {
        version: '1.0.0',
        auditStandard: 'IFSB-10',
        confidential: true
      }
    };
  }

  /**
   * Zakah Calculation Form
   */
  static getZakahCalculationForm(): Partial<FormConfiguration> {
    return {
      name: 'Zakah Calculation',
      description: 'Annual Zakah calculation for Syariah banking portfolio',
      bankingType: 'syariah',
      category: 'zakah',
      fields: [
        {
          id: 'calculation_year',
          type: 'number',
          label: 'Hijri Year',
          required: true,
          validation: { min: 1400, max: 1500 }
        },
        {
          id: 'zakatable_assets',
          type: 'currency',
          label: 'Total Zakatable Assets (IDR)',
          required: true,
          validation: { min: 0 }
        },
        {
          id: 'nisab_amount',
          type: 'currency',
          label: 'Nisab Amount (IDR)',
          required: true,
          validation: { min: 0 }
        },
        {
          id: 'zakah_rate',
          type: 'number',
          label: 'Zakah Rate (%)',
          required: true,
          defaultValue: 2.5,
          validation: { min: 0, max: 10 }
        },
        {
          id: 'calculated_zakah',
          type: 'currency',
          label: 'Calculated Zakah Amount (IDR)',
          required: true,
          readOnly: true
        },
        {
          id: 'distribution_method',
          type: 'select',
          label: 'Zakah Distribution Method',
          required: true,
          options: [
            { value: 'direct_distribution', label: 'Direct Distribution to Asnaf' },
            { value: 'zakah_institution', label: 'Through Zakah Institution' },
            { value: 'community_programs', label: 'Community Development Programs' }
          ]
        }
      ],
      submitUrl: '/api/syariah/zakah-calculation',
      redirectUrl: '/dashboard/syariah/zakah',
      validationRules: ['required_fields', 'nisab_validation', 'zakah_calculation'],
      metadata: {
        version: '1.0.0',
        calculationMethod: 'AAOIFI_FAS_9',
        automaticCalculation: true
      }
    };
  }

  /**
   * Register all Syariah compliance forms
   */
  static getAllSyariahForms(): Partial<FormConfiguration>[] {
    return [
      this.getSyariahBoardReviewForm(),
      this.getHalalIncomeVerificationForm(),
      this.getSyariahAuditChecklistForm(),
      this.getZakahCalculationForm()
    ];
  }
}
