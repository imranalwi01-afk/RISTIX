// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/middleware/formValidation.middleware.ts
// Generated: $(date)
// Phase: D2H3-P06 - Form Validation Middleware
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, Zod, FormValidationSchemas
// Purpose: Comprehensive form validation middleware for API routes
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { FormValidationSchemas } from '@shared/schemas';
import { Logger } from '@nestjs/common';
import { FormConfiguration } from '../../core/models/platform/FormConfiguration';
import { TenantContextService } from '../../core/services/tenant/TenantContextService';

export interface ValidationOptions {
  skipValidation?: boolean;
  allowPartialData?: boolean;
  customSchema?: z.ZodSchema;
  banking_type?: 'conventional' | 'syariah' | 'dual';
  form_type?: string;
}

export interface ValidatedRequest extends Request {
  validatedData?: Record<string, any>;
  formConfiguration?: FormConfiguration;
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

const logger = new Logger('FormValidationMiddleware');

/**
 * Validate form configuration creation
 */
export const validateFormConfiguration = (options: ValidationOptions = {}) => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.log('Validating form configuration data...');

      if (options.skipValidation) {
        return next();
      }

      const schema = options.customSchema || FormValidationSchemas.CreateFormConfigurationSchema;
      
      // Validate request body
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        logger.error(`Form configuration validation failed: ${errors.join(', ')}`);
        
        return res.status(400).json({
          success: false,
          error: 'Form configuration validation failed',
          details: errors,
          code: 'FORM_CONFIG_VALIDATION_ERROR'
        });
      }

      // Store validated data
      req.validatedData = validationResult.data;
      
      // Additional business rule validation
      const businessValidation = await validateBusinessRules(req.validatedData, options);
      if (!businessValidation.isValid) {
        logger.error(`Business rule validation failed: ${businessValidation.errors.join(', ')}`);
        
        return res.status(400).json({
          success: false,
          error: 'Business rule validation failed',
          details: businessValidation.errors,
          warnings: businessValidation.warnings,
          code: 'BUSINESS_RULE_VALIDATION_ERROR'
        });
      }

      req.validationResult = businessValidation;
      logger.log('Form configuration validation passed');
      next();

    } catch (error: any) {
      logger.error(`Form validation middleware error: ${error.message}`, error.stack);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'VALIDATION_MIDDLEWARE_ERROR'
      });
    }
  };
};

/**
 * Validate form submission data
 */
export const validateFormSubmission = (options: ValidationOptions = {}) => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.log('Validating form submission data...');

      if (options.skipValidation) {
        return next();
      }

      // Get form configuration ID from params or body
      const formConfigId = req.params.formId || req.body.form_configuration_id;
      
      if (!formConfigId) {
        return res.status(400).json({
          success: false,
          error: 'Form configuration ID is required',
          code: 'MISSING_FORM_CONFIG_ID'
        });
      }

      // Fetch form configuration
      const formConfig = await FormConfiguration.findByPk(formConfigId);
      if (!formConfig) {
        return res.status(404).json({
          success: false,
          error: 'Form configuration not found',
          code: 'FORM_CONFIG_NOT_FOUND'
        });
      }

      req.formConfiguration = formConfig;

      // Validate submission schema
      const submissionSchema = FormValidationSchemas.FormSubmissionSchema;
      const submissionResult = submissionSchema.safeParse(req.body);
      
      if (!submissionResult.success) {
        const errors = submissionResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        return res.status(400).json({
          success: false,
          error: 'Form submission validation failed',
          details: errors,
          code: 'FORM_SUBMISSION_VALIDATION_ERROR'
        });
      }

      // Validate submission data against form configuration
      const dataValidation = FormValidationSchemas.validateFormSubmission(
        formConfig,
        submissionResult.data.submission_data
      );

      if (!dataValidation.isValid) {
        logger.error(`Form data validation failed: ${dataValidation.errors.join(', ')}`);
        
        // If validate_only flag is set, return validation result without error status
        if (req.body.validate_only) {
          return res.json({
            success: false,
            validation_result: dataValidation,
            message: 'Validation completed'
          });
        }

        return res.status(400).json({
          success: false,
          error: 'Form data validation failed',
          details: dataValidation.errors,
          warnings: dataValidation.warnings,
          code: 'FORM_DATA_VALIDATION_ERROR'
        });
      }

      req.validatedData = submissionResult.data;
      req.validationResult = dataValidation;
      
      logger.log('Form submission validation passed');
      next();

    } catch (error: any) {
      logger.error(`Form submission validation error: ${error.message}`, error.stack);
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'VALIDATION_MIDDLEWARE_ERROR'
      });
    }
  };
};

/**
 * Validate banking-specific form data
 */
export const validateBankingForm = (bankingType: 'conventional' | 'syariah' | 'dual') => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.log(`Validating banking form for type: ${bankingType}`);

      const formData = req.validatedData || req.body;
      
      // Banking type specific validation
      if (bankingType === 'syariah' || (bankingType === 'dual' && formData.banking_type === 'syariah')) {
        const syariahValidation = await validateSyariahCompliance(formData);
        if (!syariahValidation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Syariah compliance validation failed',
            details: syariahValidation.errors,
            warnings: syariahValidation.warnings,
            code: 'SYARIAH_COMPLIANCE_ERROR'
          });
        }
      }

      // Additional banking regulations
      const regulatoryValidation = await validateRegulatoryCompliance(formData, bankingType);
      if (!regulatoryValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Regulatory compliance validation failed',
          details: regulatoryValidation.errors,
          warnings: regulatoryValidation.warnings,
          code: 'REGULATORY_COMPLIANCE_ERROR'
        });
      }

      logger.log('Banking form validation passed');
      next();

    } catch (error: any) {
      logger.error(`Banking form validation error: ${error.message}`, error.stack);
      return res.status(500).json({
        success: false,
        error: 'Banking validation error',
        code: 'BANKING_VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Validate customer onboarding forms
 */
export const validateCustomerOnboarding = () => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.log('Validating customer onboarding form...');

      const schema = FormValidationSchemas.CustomerOnboardingFormSchema;
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        return res.status(400).json({
          success: false,
          error: 'Customer onboarding validation failed',
          details: errors,
          code: 'CUSTOMER_ONBOARDING_VALIDATION_ERROR'
        });
      }

      // Additional KYC validation
      const kycValidation = await validateKYCRequirements(validationResult.data);
      if (!kycValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'KYC validation failed',
          details: kycValidation.errors,
          code: 'KYC_VALIDATION_ERROR'
        });
      }

      req.validatedData = validationResult.data;
      logger.log('Customer onboarding validation passed');
      next();

    } catch (error: any) {
      logger.error(`Customer onboarding validation error: ${error.message}`, error.stack);
      return res.status(500).json({
        success: false,
        error: 'Customer onboarding validation error',
        code: 'CUSTOMER_ONBOARDING_ERROR'
      });
    }
  };
};

/**
 * Validate loan application forms
 */
export const validateLoanApplication = () => {
  return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.log('Validating loan application form...');

      const schema = FormValidationSchemas.LoanApplicationFormSchema;
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        return res.status(400).json({
          success: false,
          error: 'Loan application validation failed',
          details: errors,
          code: 'LOAN_APPLICATION_VALIDATION_ERROR'
        });
      }

      // Credit risk validation
      const creditValidation = await validateCreditRiskRequirements(validationResult.data);
      if (!creditValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Credit risk validation failed',
          details: creditValidation.errors,
          warnings: creditValidation.warnings,
          code: 'CREDIT_RISK_VALIDATION_ERROR'
        });
      }

      req.validatedData = validationResult.data;
      logger.log('Loan application validation passed');
      next();

    } catch (error: any) {
      logger.error(`Loan application validation error: ${error.message}`, error.stack);
      return res.status(500).json({
        success: false,
        error: 'Loan application validation error',
        code: 'LOAN_APPLICATION_ERROR'
      });
    }
  };
};

/**
 * Validate business rules
 */
async function validateBusinessRules(
  data: Record<string, any>, 
  options: ValidationOptions
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Banking type validation
    if (options.banking_type === 'syariah' && data.form_type) {
      // Ensure Syariah forms have required compliance fields
      if (!data.form_schema?.fields?.some((field: any) => field.name === 'syariah_compliance_confirmation')) {
        errors.push('Syariah forms must include Syariah compliance confirmation field');
      }
    }

    // Form complexity validation
    if (data.form_schema?.fields?.length > 50) {
      warnings.push('Form has many fields (>50). Consider breaking into sections for better UX');
    }

    // Required field validation
    const requiredFields = data.form_schema?.fields?.filter((field: any) => field.required);
    if (requiredFields?.length > 20) {
      warnings.push('Many required fields (>20). Consider making some optional');
    }

  } catch (error) {
    logger.error(`Business rule validation error: ${error}`);
    errors.push('Business rule validation failed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Syariah compliance
 */
async function validateSyariahCompliance(
  data: Record<string, any>
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check for prohibited activities
    if (data.business_screening?.prohibited_activities_check === false) {
      errors.push('Cannot proceed with applications involving prohibited activities');
    }

    // Check financial ratios for Syariah compliance
    if (data.financial_ratios?.debt_to_equity > 33) {
      errors.push('Debt to equity ratio exceeds Syariah compliance threshold (33%)');
    }

    if (data.financial_ratios?.interest_income_percentage > 5) {
      warnings.push('Interest income percentage exceeds recommended threshold (5%)');
    }

    // Sector compliance check
    const prohibitedSectors = [
      'alcohol', 'gambling', 'pork', 'conventional_banking', 
      'adult_entertainment', 'tobacco', 'weapons'
    ];
    
    if (data.business_screening?.sector_classification && 
        prohibitedSectors.includes(data.business_screening.sector_classification)) {
      errors.push(`Business sector '${data.business_screening.sector_classification}' is not Syariah compliant`);
    }

  } catch (error) {
    logger.error(`Syariah compliance validation error: ${error}`);
    errors.push('Syariah compliance validation failed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate regulatory compliance
 */
async function validateRegulatoryCompliance(
  data: Record<string, any>,
  bankingType: string
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // OJK compliance for Indonesian banking
    if (data.customer_information?.nationality === 'ID') {
      // Indonesian customers require specific documentation
      if (!data.kyc_documents?.identity_document) {
        errors.push('Indonesian customers must provide KTP/identity document');
      }
    }

    // Anti-money laundering checks
    if (data.loan_details?.loan_amount > 1000000000) { // 1 billion IDR
      if (!data.additional_documentation?.source_of_funds) {
        warnings.push('Large loan amounts require source of funds documentation');
      }
    }

    // Banking type specific regulations
    if (bankingType === 'syariah') {
      if (!data.shariah_board?.review_required) {
        warnings.push('Syariah banking products typically require Shariah board review');
      }
    }

  } catch (error) {
    logger.error(`Regulatory compliance validation error: ${error}`);
    errors.push('Regulatory compliance validation failed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate KYC requirements
 */
async function validateKYCRequirements(
  data: Record<string, any>
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Required KYC documents
    const requiredDocs = ['identity_document', 'address_proof'];
    for (const doc of requiredDocs) {
      if (!data.kyc_documents?.[doc]) {
        errors.push(`Missing required KYC document: ${doc}`);
      }
    }

    // Income verification for high-risk customers
    if (data.financial_information?.monthly_income > 100000000) { // 100M IDR
      if (!data.kyc_documents?.income_proof) {
        warnings.push('High income customers should provide income proof');
      }
    }

    // Age verification
    if (data.personal_information?.date_of_birth) {
      const age = new Date().getFullYear() - new Date(data.personal_information.date_of_birth).getFullYear();
      if (age < 17) {
        errors.push('Customer must be at least 17 years old');
      }
      if (age > 80) {
        warnings.push('Elderly customers may require additional documentation');
      }
    }

  } catch (error) {
    logger.error(`KYC validation error: ${error}`);
    errors.push('KYC validation failed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate credit risk requirements
 */
async function validateCreditRiskRequirements(
  data: Record<string, any>
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Debt service ratio check
    const monthlyIncome = data.applicant_information?.monthly_income || 0;
    const loanAmount = data.loan_details?.loan_amount || 0;
    const repaymentPeriod = data.loan_details?.repayment_period || 12;
    
    if (monthlyIncome > 0 && loanAmount > 0) {
      const monthlyPayment = loanAmount / repaymentPeriod;
      const debtServiceRatio = (monthlyPayment / monthlyIncome) * 100;
      
      if (debtServiceRatio > 40) {
        errors.push('Debt service ratio exceeds maximum threshold (40%)');
      } else if (debtServiceRatio > 30) {
        warnings.push('Debt service ratio is high (>30%). Consider additional review');
      }
    }

    // Loan-to-value ratio for secured loans
    if (data.collateral_information?.collateral_value && loanAmount > 0) {
      const ltvRatio = (loanAmount / data.collateral_information.collateral_value) * 100;
      if (ltvRatio > 80) {
        warnings.push('Loan-to-value ratio is high (>80%). Consider additional collateral');
      }
    }

  } catch (error) {
    logger.error(`Credit risk validation error: ${error}`);
    errors.push('Credit risk validation failed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  validateFormConfiguration,
  validateFormSubmission,
  validateBankingForm,
  validateCustomerOnboarding,
  validateLoanApplication
};
