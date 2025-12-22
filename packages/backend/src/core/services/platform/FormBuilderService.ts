// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/platform/FormBuilderService.ts
// Generated: $(date)
// Phase: D2H3-P03 - Dynamic Form Builder Service
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: FormConfiguration model, validation schemas
// Purpose: Dynamic form builder service for advanced form management
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { FormConfiguration } from '../../models/platform/FormConfiguration';
import { FormValidationSchemas } from '@shared/schemas';
import { DatabaseService } from '../database/DatabaseService';
import { TenantContextService } from '../tenant/TenantContextService';
import { ConfigurationService } from '../configuration/ConfigurationService';
import { AuditService } from '../audit/AuditService';

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  validation?: Record<string, any>;
  options?: Array<{ label: string; value: string }>;
  conditional_logic?: Record<string, any>;
  banking_specific?: Record<string, any>;
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
  sections?: Array<{
    id: string;
    title: string;
    description?: string;
    fields: string[];
    conditional?: boolean;
  }>;
}

export interface CreateFormRequest {
  form_name: string;
  form_type: string;
  banking_type: 'conventional' | 'syariah' | 'dual';
  form_schema: FormSchema;
  validation_rules?: Record<string, any>;
  ui_configuration?: Record<string, any>;
  conditional_logic?: Record<string, any>;
  business_rules?: Record<string, any>;
  approval_workflow?: Record<string, any>;
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  form_version?: string;
  is_active?: boolean;
  is_default?: boolean;
}

@Injectable()
export class FormBuilderService {
  private readonly logger = new Logger(FormBuilderService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tenantContextService: TenantContextService,
    private readonly configurationService: ConfigurationService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Create new form configuration
   */
  async createForm(
    request: CreateFormRequest,
    userId: string
  ): Promise<FormConfiguration> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      this.logger.log(`Creating form configuration: ${request.form_name} for tenant: ${tenantId}`);

      // Validate form schema
      const validationResult = FormValidationSchemas.CreateFormConfigurationSchema.safeParse(request);
      if (!validationResult.success) {
        throw new Error(`Form validation failed: ${validationResult.error.message}`);
      }

      // Check for duplicate form name
      const existingForm = await FormConfiguration.findOne({
        where: {
          tenant_id: tenantId,
          form_name: request.form_name,
          is_active: true
        }
      });

      if (existingForm) {
        throw new Error(`Form with name '${request.form_name}' already exists`);
      }

      // Apply banking-specific configurations
      const enhancedSchema = await this.enhanceSchemaForBankingType(
        request.form_schema,
        request.banking_type
      );

      // Apply business rules
      const enhancedBusinessRules = await this.applyDefaultBusinessRules(
        request.business_rules || {},
        request.banking_type,
        request.form_type
      );

      // Create form configuration
      const formConfiguration = await FormConfiguration.create({
        tenant_id: tenantId,
        form_name: request.form_name,
        form_type: request.form_type as any,
        banking_type: request.banking_type,
        form_version: '1.0.0',
        form_schema: enhancedSchema,
        validation_rules: request.validation_rules || {},
        ui_configuration: this.getDefaultUIConfiguration(request.banking_type),
        conditional_logic: request.conditional_logic || {},
        business_rules: enhancedBusinessRules,
        approval_workflow: request.approval_workflow || { enabled: false, steps: [] },
        is_active: true,
        is_default: false,
        created_by: userId,
        updated_by: userId
      });

      // Audit log
      await this.auditService.logActivity({
        tenant_id: tenantId,
        user_id: userId,
        action: 'FORM_CREATED',
        resource_type: 'FormConfiguration',
        resource_id: formConfiguration.id,
        details: {
          form_name: request.form_name,
          form_type: request.form_type,
          banking_type: request.banking_type
        }
      });

      this.logger.log(`Form configuration created successfully: ${formConfiguration.id}`);
      return formConfiguration;

    } catch (error) {
      this.logger.error(`Failed to create form configuration: ${error.message}`, error.stack);
      throw new Error(`Failed to create form configuration: ${error.message}`);
    }
  }

  /**
   * Update existing form configuration
   */
  async updateForm(
    formId: string,
    request: UpdateFormRequest,
    userId: string
  ): Promise<FormConfiguration> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      this.logger.log(`Updating form configuration: ${formId} for tenant: ${tenantId}`);

      // Find existing form
      const existingForm = await FormConfiguration.findOne({
        where: {
          id: formId,
          tenant_id: tenantId
        }
      });

      if (!existingForm) {
        throw new Error(`Form configuration not found: ${formId}`);
      }

      // Create new version if schema changed
      if (request.form_schema) {
        request.form_version = this.incrementVersion(existingForm.form_version);
      }

      // Validate update request
      const validationResult = FormValidationSchemas.UpdateFormConfigurationSchema.safeParse(request);
      if (!validationResult.success) {
        throw new Error(`Form validation failed: ${validationResult.error.message}`);
      }

      // Update form configuration
      await existingForm.update({
        ...request,
        updated_by: userId
      });

      // Audit log
      await this.auditService.logActivity({
        tenant_id: tenantId,
        user_id: userId,
        action: 'FORM_UPDATED',
        resource_type: 'FormConfiguration',
        resource_id: formId,
        details: {
          changes: Object.keys(request),
          new_version: request.form_version
        }
      });

      this.logger.log(`Form configuration updated successfully: ${formId}`);
      return existingForm;

    } catch (error) {
      this.logger.error(`Failed to update form configuration: ${error.message}`, error.stack);
      throw new Error(`Failed to update form configuration: ${error.message}`);
    }
  }

  /**
   * Get form configuration by ID
   */
  async getForm(formId: string): Promise<FormConfiguration | null> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      const form = await FormConfiguration.findOne({
        where: {
          id: formId,
          tenant_id: tenantId,
          is_active: true
        }
      });

      return form;

    } catch (error) {
      this.logger.error(`Failed to get form configuration: ${error.message}`, error.stack);
      throw new Error(`Failed to get form configuration: ${error.message}`);
    }
  }

  /**
   * Get all forms for tenant
   */
  async getForms(filters: {
    form_type?: string;
    banking_type?: string;
    is_active?: boolean;
  } = {}): Promise<FormConfiguration[]> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      const where: any = {
        tenant_id: tenantId
      };

      if (filters.form_type) {
        where.form_type = filters.form_type;
      }

      if (filters.banking_type) {
        where.banking_type = filters.banking_type;
      }

      if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      const forms = await FormConfiguration.findAll({
        where,
        order: [['created_at', 'DESC']]
      });

      return forms;

    } catch (error) {
      this.logger.error(`Failed to get forms: ${error.message}`, error.stack);
      throw new Error(`Failed to get forms: ${error.message}`);
    }
  }

  /**
   * Delete form configuration
   */
  async deleteForm(formId: string, userId: string): Promise<void> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      this.logger.log(`Deleting form configuration: ${formId} for tenant: ${tenantId}`);

      const form = await FormConfiguration.findOne({
        where: {
          id: formId,
          tenant_id: tenantId
        }
      });

      if (!form) {
        throw new Error(`Form configuration not found: ${formId}`);
      }

      // Soft delete by setting is_active to false
      await form.update({
        is_active: false,
        updated_by: userId
      });

      // Audit log
      await this.auditService.logActivity({
        tenant_id: tenantId,
        user_id: userId,
        action: 'FORM_DELETED',
        resource_type: 'FormConfiguration',
        resource_id: formId,
        details: {
          form_name: form.form_name
        }
      });

      this.logger.log(`Form configuration deleted successfully: ${formId}`);

    } catch (error) {
      this.logger.error(`Failed to delete form configuration: ${error.message}`, error.stack);
      throw new Error(`Failed to delete form configuration: ${error.message}`);
    }
  }

  /**
   * Clone form configuration
   */
  async cloneForm(
    sourceFormId: string,
    newFormName: string,
    userId: string
  ): Promise<FormConfiguration> {
    const tenantId = this.tenantContextService.getCurrentTenantId();
    
    try {
      this.logger.log(`Cloning form configuration: ${sourceFormId} to ${newFormName}`);

      const sourceForm = await FormConfiguration.findOne({
        where: {
          id: sourceFormId,
          tenant_id: tenantId
        }
      });

      if (!sourceForm) {
        throw new Error(`Source form configuration not found: ${sourceFormId}`);
      }

      // Create cloned form
      const clonedForm = await FormConfiguration.create({
        tenant_id: tenantId,
        form_name: newFormName,
        form_type: sourceForm.form_type,
        banking_type: sourceForm.banking_type,
        form_version: '1.0.0',
        form_schema: sourceForm.form_schema,
        validation_rules: sourceForm.validation_rules,
        ui_configuration: sourceForm.ui_configuration,
        conditional_logic: sourceForm.conditional_logic,
        business_rules: sourceForm.business_rules,
        approval_workflow: sourceForm.approval_workflow,
        is_active: true,
        is_default: false,
        created_by: userId,
        updated_by: userId
      });

      // Audit log
      await this.auditService.logActivity({
        tenant_id: tenantId,
        user_id: userId,
        action: 'FORM_CLONED',
        resource_type: 'FormConfiguration',
        resource_id: clonedForm.id,
        details: {
          source_form_id: sourceFormId,
          new_form_name: newFormName
        }
      });

      this.logger.log(`Form configuration cloned successfully: ${clonedForm.id}`);
      return clonedForm;

    } catch (error) {
      this.logger.error(`Failed to clone form configuration: ${error.message}`, error.stack);
      throw new Error(`Failed to clone form configuration: ${error.message}`);
    }
  }

  /**
   * Enhance form schema for banking type
   */
  private async enhanceSchemaForBankingType(
    schema: FormSchema,
    bankingType: string
  ): Promise<FormSchema> {
    const enhancedSchema = { ...schema };
    
    // Add banking-specific fields based on type
    if (bankingType === 'syariah' || bankingType === 'dual') {
      // Add Syariah compliance fields
      const syariahFields = await this.getSyariahComplianceFields();
      enhancedSchema.fields = [...schema.fields, ...syariahFields];
    }

    // Add regulatory compliance fields
    const regulatoryFields = await this.getRegulatoryComplianceFields(bankingType);
    enhancedSchema.fields = [...enhancedSchema.fields, ...regulatoryFields];

    return enhancedSchema;
  }

  /**
   * Get default UI configuration for banking type
   */
  private getDefaultUIConfiguration(bankingType: string): Record<string, any> {
    const baseConfig = {
      theme: bankingType === 'syariah' ? 'syariah' : 'default',
      layout: 'single-column',
      show_progress: true,
      allow_save_draft: true,
      submit_button_text: 'Submit',
      cancel_button_text: 'Cancel'
    };

    if (bankingType === 'syariah') {
      return {
        ...baseConfig,
        branding: {
          primary_color: '#2E7D32', // Islamic green
          secondary_color: '#FFD700' // Gold
        }
      };
    }

    return baseConfig;
  }

  /**
   * Apply default business rules
   */
  private async applyDefaultBusinessRules(
    businessRules: Record<string, any>,
    bankingType: string,
    formType: string
  ): Promise<Record<string, any>> {
    const enhancedRules = { ...businessRules };

    if (bankingType === 'syariah') {
      enhancedRules.syariah_compliance_rules = [
        {
          rule_type: 'sector_screening',
          condition: 'prohibited_sectors',
          action: 'block',
          message: 'This sector is not Syariah compliant'
        },
        {
          rule_type: 'financial_ratio',
          condition: 'interest_income > 5%',
          action: 'warn',
          message: 'Interest income exceeds acceptable threshold for Syariah banking'
        }
      ];
    }

    return enhancedRules;
  }

  /**
   * Get Syariah compliance fields
   */
  private async getSyariahComplianceFields(): Promise<FormField[]> {
    return [
      {
        id: 'syariah_compliance_check',
        name: 'syariah_compliance_check',
        type: 'checkbox',
        label: 'Syariah Compliance Confirmation',
        required: true
      },
      {
        id: 'prohibited_activities_declaration',
        name: 'prohibited_activities_declaration',
        type: 'checkbox',
        label: 'I declare that my business does not involve prohibited activities (Riba, Gharar, Maysir)',
        required: true
      }
    ];
  }

  /**
   * Get regulatory compliance fields
   */
  private async getRegulatoryComplianceFields(bankingType: string): Promise<FormField[]> {
    const fields: FormField[] = [
      {
        id: 'regulatory_compliance',
        name: 'regulatory_compliance',
        type: 'checkbox',
        label: 'I acknowledge compliance with banking regulations',
        required: true
      }
    ];

    if (bankingType === 'syariah') {
      fields.push({
        id: 'aaoifi_compliance',
        name: 'aaoifi_compliance',
        type: 'checkbox',
        label: 'I acknowledge compliance with AAOIFI standards',
        required: true
      });
    }

    return fields;
  }

  /**
   * Increment form version
   */
  private incrementVersion(currentVersion: string): string {
    const versionParts = currentVersion.split('.').map(Number);
    versionParts[2] += 1;
    return versionParts.join('.');
  }
}

export default FormBuilderService;
