#!/bin/bash
# ============================================================================
# PSDD SCRIPT - DAY 2 HOUR 3: FORMS BACKEND GENERATION
# ============================================================================
# Script: d2h3-forms-backend-generation.sh
# Phase: D2H3 - Forms Backend Services Generation
# Objective: Generate form builder and template engine backend services
# Generated: $(date)
# Following: 001-006-011-phased-shell-driven-development-psdd-methodology.md
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-forms-backend-$(date +%Y%m%d-%H%M%S).log"

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

# Generate form builder service
generate_form_builder_service() {
    log_info "Generating form builder service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/forms/form-builder.service.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/forms/form-builder.service.ts
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: Dynamic form builder service with drag-and-drop capabilities
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormDefinition } from '../models/forms/form-definition.entity';
import { FormSubmission } from '../models/forms/form-submission.entity';
import { ConfigurationService } from '../configuration/configuration.service';
import { TenantService } from '../tenant/tenant.service';
import { AuditService } from '../audit/audit.service';

export interface FormBuilderConfig {
  maxFields: number;
  maxSteps: number;
  strictValidation: boolean;
  enableAnalytics: boolean;
}

export interface FormFieldDefinition {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: any[];
  conditional?: ConditionalLogic;
  metadata?: any;
}

export interface ConditionalLogic {
  condition: string;
  field: string;
  operator: string;
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'required';
}

export interface FormDefinitionData {
  name: string;
  title: string;
  description?: string;
  category?: string;
  fields: FormFieldDefinition[];
  steps?: FormStep[];
  validationRules?: any;
  conditionalLogic?: ConditionalLogic[];
  permissions?: any;
  metadata?: any;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  order: number;
  conditional?: ConditionalLogic;
}

@Injectable()
export class FormBuilderService {
  private readonly logger = new Logger(FormBuilderService.name);

  constructor(
    @InjectRepository(FormDefinition)
    private readonly formDefinitionRepository: Repository<FormDefinition>,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
    private readonly configService: ConfigurationService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Get form builder configuration
   */
  async getFormBuilderConfig(tenantId: string): Promise<FormBuilderConfig> {
    try {
      const config = await this.configService.getTenantConfiguration(tenantId, 'forms');
      
      return {
        maxFields: parseInt(config['forms.builder.max_fields'] || '100'),
        maxSteps: parseInt(config['forms.builder.max_steps'] || '20'),
        strictValidation: config['forms.validation.strict_mode'] === 'true',
        enableAnalytics: config['forms.analytics.enabled'] === 'true'
      };
    } catch (error) {
      this.logger.error(`Failed to get form builder config: ${error.message}`);
      throw new Error(`Form builder configuration error: ${error.message}`);
    }
  }

  /**
   * Create new form definition
   */
  async createFormDefinition(
    tenantId: string,
    formData: FormDefinitionData,
    createdBy: string
  ): Promise<FormDefinition> {
    try {
      // Validate form data
      await this.validateFormDefinition(tenantId, formData);

      const formDefinition = this.formDefinitionRepository.create({
        tenantId,
        name: formData.name,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        schemaDefinition: {
          fields: formData.fields,
          steps: formData.steps || [],
          metadata: formData.metadata || {}
        },
        validationRules: formData.validationRules || {},
        conditionalLogic: formData.conditionalLogic || [],
        permissions: formData.permissions || {},
        createdBy,
        version: 1,
        isActive: true,
        isPublished: false
      });

      const savedForm = await this.formDefinitionRepository.save(formDefinition);

      // Audit trail
      await this.auditService.logActivity({
        tenantId,
        userId: createdBy,
        action: 'CREATE_FORM_DEFINITION',
        resource: 'forms',
        resourceId: savedForm.id,
        details: { formName: formData.name, version: 1 }
      });

      this.logger.log(`Form definition created: ${savedForm.id} for tenant: ${tenantId}`);
      return savedForm;

    } catch (error) {
      this.logger.error(`Failed to create form definition: ${error.message}`);
      throw new Error(`Form creation failed: ${error.message}`);
    }
  }

  /**
   * Update form definition
   */
  async updateFormDefinition(
    tenantId: string,
    formId: string,
    formData: Partial<FormDefinitionData>,
    updatedBy: string
  ): Promise<FormDefinition> {
    try {
      const existingForm = await this.formDefinitionRepository.findOne({
        where: { id: formId, tenantId }
      });

      if (!existingForm) {
        throw new Error('Form definition not found');
      }

      // Validate updated form data
      if (formData.fields || formData.steps) {
        const fullFormData = {
          ...existingForm,
          ...formData,
          fields: formData.fields || existingForm.schemaDefinition.fields,
          steps: formData.steps || existingForm.schemaDefinition.steps
        } as FormDefinitionData;
        
        await this.validateFormDefinition(tenantId, fullFormData);
      }

      // Update fields
      if (formData.name) existingForm.name = formData.name;
      if (formData.title) existingForm.title = formData.title;
      if (formData.description !== undefined) existingForm.description = formData.description;
      if (formData.category) existingForm.category = formData.category;
      
      if (formData.fields || formData.steps) {
        existingForm.schemaDefinition = {
          fields: formData.fields || existingForm.schemaDefinition.fields,
          steps: formData.steps || existingForm.schemaDefinition.steps,
          metadata: formData.metadata || existingForm.schemaDefinition.metadata
        };
      }

      if (formData.validationRules) existingForm.validationRules = formData.validationRules;
      if (formData.conditionalLogic) existingForm.conditionalLogic = formData.conditionalLogic;
      if (formData.permissions) existingForm.permissions = formData.permissions;

      existingForm.updatedBy = updatedBy;
      existingForm.updatedAt = new Date();

      const savedForm = await this.formDefinitionRepository.save(existingForm);

      // Audit trail
      await this.auditService.logActivity({
        tenantId,
        userId: updatedBy,
        action: 'UPDATE_FORM_DEFINITION',
        resource: 'forms',
        resourceId: savedForm.id,
        details: { formName: savedForm.name, changes: Object.keys(formData) }
      });

      this.logger.log(`Form definition updated: ${savedForm.id}`);
      return savedForm;

    } catch (error) {
      this.logger.error(`Failed to update form definition: ${error.message}`);
      throw new Error(`Form update failed: ${error.message}`);
    }
  }

  /**
   * Validate form definition
   */
  private async validateFormDefinition(tenantId: string, formData: FormDefinitionData): Promise<void> {
    const config = await this.getFormBuilderConfig(tenantId);

    // Check maximum fields limit
    if (formData.fields.length > config.maxFields) {
      throw new Error(`Form exceeds maximum field limit of ${config.maxFields}`);
    }

    // Check maximum steps limit
    if (formData.steps && formData.steps.length > config.maxSteps) {
      throw new Error(`Form exceeds maximum step limit of ${config.maxSteps}`);
    }

    // Validate field definitions
    for (const field of formData.fields) {
      await this.validateFieldDefinition(field, config.strictValidation);
    }

    // Validate conditional logic
    if (formData.conditionalLogic) {
      for (const condition of formData.conditionalLogic) {
        await this.validateConditionalLogic(condition, formData.fields);
      }
    }
  }

  /**
   * Validate field definition
   */
  private async validateFieldDefinition(field: FormFieldDefinition, strictValidation: boolean): Promise<void> {
    if (!field.id || !field.type || !field.name) {
      throw new Error('Field must have id, type, and name');
    }

    // Validate field name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
      throw new Error(`Invalid field name format: ${field.name}`);
    }

    // Validate field type
    const allowedTypes = ['text', 'email', 'number', 'date', 'select', 'multiselect', 'checkbox', 'radio', 'textarea', 'file'];
    if (!allowedTypes.includes(field.type)) {
      throw new Error(`Invalid field type: ${field.type}`);
    }

    // Strict validation checks
    if (strictValidation) {
      if (field.type === 'select' || field.type === 'radio' || field.type === 'multiselect') {
        if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
          throw new Error(`Field ${field.name} of type ${field.type} must have options`);
        }
      }
    }
  }

  /**
   * Validate conditional logic
   */
  private async validateConditionalLogic(condition: ConditionalLogic, fields: FormFieldDefinition[]): Promise<void> {
    // Check if referenced field exists
    const referencedField = fields.find(f => f.name === condition.field);
    if (!referencedField) {
      throw new Error(`Conditional logic references non-existent field: ${condition.field}`);
    }

    // Validate operator
    const allowedOperators = ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'];
    if (!allowedOperators.includes(condition.operator)) {
      throw new Error(`Invalid conditional logic operator: ${condition.operator}`);
    }

    // Validate action
    const allowedActions = ['show', 'hide', 'enable', 'disable', 'required'];
    if (!allowedActions.includes(condition.action)) {
      throw new Error(`Invalid conditional logic action: ${condition.action}`);
    }
  }

  /**
   * Get form definition by ID
   */
  async getFormDefinition(tenantId: string, formId: string): Promise<FormDefinition> {
    try {
      const form = await this.formDefinitionRepository.findOne({
        where: { id: formId, tenantId }
      });

      if (!form) {
        throw new Error('Form definition not found');
      }

      return form;
    } catch (error) {
      this.logger.error(`Failed to get form definition: ${error.message}`);
      throw new Error(`Form retrieval failed: ${error.message}`);
    }
  }

  /**
   * List form definitions
   */
  async listFormDefinitions(
    tenantId: string,
    options: {
      category?: string;
      isActive?: boolean;
      isPublished?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ forms: FormDefinition[]; total: number }> {
    try {
      const query = this.formDefinitionRepository.createQueryBuilder('form')
        .where('form.tenantId = :tenantId', { tenantId });

      if (options.category) {
        query.andWhere('form.category = :category', { category: options.category });
      }

      if (options.isActive !== undefined) {
        query.andWhere('form.isActive = :isActive', { isActive: options.isActive });
      }

      if (options.isPublished !== undefined) {
        query.andWhere('form.isPublished = :isPublished', { isPublished: options.isPublished });
      }

      if (options.search) {
        query.andWhere('(form.name ILIKE :search OR form.title ILIKE :search OR form.description ILIKE :search)', 
          { search: `%${options.search}%` });
      }

      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;

      const [forms, total] = await query
        .orderBy('form.updatedAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return { forms, total };
    } catch (error) {
      this.logger.error(`Failed to list form definitions: ${error.message}`);
      throw new Error(`Form listing failed: ${error.message}`);
    }
  }

  /**
   * Clone form definition
   */
  async cloneFormDefinition(
    tenantId: string,
    sourceFormId: string,
    newName: string,
    createdBy: string
  ): Promise<FormDefinition> {
    try {
      const sourceForm = await this.getFormDefinition(tenantId, sourceFormId);

      const clonedFormData: FormDefinitionData = {
        name: newName,
        title: `${sourceForm.title} (Copy)`,
        description: sourceForm.description,
        category: sourceForm.category,
        fields: JSON.parse(JSON.stringify(sourceForm.schemaDefinition.fields)),
        steps: JSON.parse(JSON.stringify(sourceForm.schemaDefinition.steps || [])),
        validationRules: JSON.parse(JSON.stringify(sourceForm.validationRules || {})),
        conditionalLogic: JSON.parse(JSON.stringify(sourceForm.conditionalLogic || [])),
        permissions: JSON.parse(JSON.stringify(sourceForm.permissions || {})),
        metadata: JSON.parse(JSON.stringify(sourceForm.schemaDefinition.metadata || {}))
      };

      return await this.createFormDefinition(tenantId, clonedFormData, createdBy);
    } catch (error) {
      this.logger.error(`Failed to clone form definition: ${error.message}`);
      throw new Error(`Form cloning failed: ${error.message}`);
    }
  }

  /**
   * Delete form definition
   */
  async deleteFormDefinition(tenantId: string, formId: string, deletedBy: string): Promise<void> {
    try {
      const form = await this.getFormDefinition(tenantId, formId);

      // Check if form has submissions
      const submissionCount = await this.formSubmissionRepository.count({
        where: { formDefinitionId: formId, tenantId }
      });

      if (submissionCount > 0) {
        // Soft delete - mark as inactive instead of hard delete
        form.isActive = false;
        form.updatedBy = deletedBy;
        form.updatedAt = new Date();
        await this.formDefinitionRepository.save(form);

        this.logger.log(`Form definition soft deleted: ${formId} (${submissionCount} submissions exist)`);
      } else {
        // Hard delete if no submissions
        await this.formDefinitionRepository.remove(form);
        this.logger.log(`Form definition hard deleted: ${formId}`);
      }

      // Audit trail
      await this.auditService.logActivity({
        tenantId,
        userId: deletedBy,
        action: 'DELETE_FORM_DEFINITION',
        resource: 'forms',
        resourceId: formId,
        details: { formName: form.name, submissionCount }
      });

    } catch (error) {
      this.logger.error(`Failed to delete form definition: ${error.message}`);
      throw new Error(`Form deletion failed: ${error.message}`);
    }
  }

  /**
   * Publish form definition
   */
  async publishFormDefinition(
    tenantId: string,
    formId: string,
    publishedBy: string
  ): Promise<FormDefinition> {
    try {
      const form = await this.getFormDefinition(tenantId, formId);

      form.isPublished = true;
      form.updatedBy = publishedBy;
      form.updatedAt = new Date();

      const savedForm = await this.formDefinitionRepository.save(form);

      // Audit trail
      await this.auditService.logActivity({
        tenantId,
        userId: publishedBy,
        action: 'PUBLISH_FORM_DEFINITION',
        resource: 'forms',
        resourceId: formId,
        details: { formName: form.name }
      });

      this.logger.log(`Form definition published: ${formId}`);
      return savedForm;
    } catch (error) {
      this.logger.error(`Failed to publish form definition: ${error.message}`);
      throw new Error(`Form publishing failed: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.formDefinitionRepository.count();
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Form builder service generated"
}

# Generate form validation service
generate_form_validation_service() {
    log_info "Generating form validation service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/forms/form-validation.service.ts" << 'EOF'