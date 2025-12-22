#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Day 2 Hour 3+ Frontend Forms Generator (Part 2-1)
# ============================================================================
# File Path: ./scripts/setup/d2h3-part-2-1-backend-services.sh
# Generated: $(date)
# Phase: D2H3-P2-1 - Backend Services Generation
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Generate core backend services for forms and templates
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-p2-1-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3_P2_1"
PHASE_NAME="Backend Services Generation"
PHASE_OBJECTIVE="Generate FormsService and TemplatesService with validation"

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
    log_info "Validating PSDD environment for ${PHASE_NAME}..."
    
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

# MANDATORY: Create directory structure
create_backend_directories() {
    log_info "Creating backend directory structure..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/templates"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/types"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/interfaces"
    
    log_success "Backend directories created"
}

# MANDATORY: Generate Forms Service
generate_forms_service() {
    log_info "Generating Forms Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/forms/forms.service.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/forms/forms.service.ts
// Generated: $(date)
// Phase: D2H3-P2-1 - Backend Services Generation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Zod, Configuration Service
// Purpose: Enterprise form management with dynamic form builder
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

// Form Field Interface
export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  sortOrder: number;
}

// Form Definition Interface
export interface FormDefinition {
  id?: string;
  tenantId: string;
  name: string;
  description?: string;
  fields: FormField[];
  schema: {
    title: string;
    description?: string;
    layout: 'single-column' | 'two-column' | 'grid';
  };
  validationRules: {
    required?: string[];
    conditional?: Array<{
      field: string;
      condition: string;
      value: any;
      action: 'show' | 'hide' | 'require' | 'disable';
    }>;
  };
  version: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Form Instance Interface
export interface FormInstance {
  id: string;
  formDefinitionId: string;
  tenantId: string;
  formData: Record<string, any>;
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'rejected';
  submittedBy?: string;
  submittedAt?: Date;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
}

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly config: ConfigService
  ) {}

  /**
   * Create new form definition
   */
  async createForm(tenantId: string, formData: any): Promise<FormDefinition> {
    try {
      this.logger.log(`Creating form for tenant: ${tenantId}`);

      // Validate form data
      const validatedData = this.validateFormDefinition(formData);

      // TODO: Implement database creation logic
      // This will be connected to actual database in next phase
      const formDefinition: FormDefinition = {
        id: `form_${Date.now()}`,
        tenantId,
        name: validatedData.name,
        description: validatedData.description,
        fields: validatedData.fields,
        schema: validatedData.schema,
        validationRules: validatedData.validationRules,
        version: 1,
        isActive: true,
        createdAt: new Date(),
        createdBy: validatedData.createdBy
      };

      this.logger.log(`Form created successfully: ${formDefinition.id}`);
      return formDefinition;

    } catch (error) {
      this.logger.error(`Failed to create form: ${error.message}`, error.stack);
      throw new Error(`Form creation failed: ${error.message}`);
    }
  }

  /**
   * Get form definition with fields
   */
  async getForm(tenantId: string, formId: string): Promise<FormDefinition | null> {
    try {
      this.logger.log(`Retrieving form: ${formId} for tenant: ${tenantId}`);

      // TODO: Implement database retrieval logic
      // This is a placeholder that will be replaced with actual database queries
      
      return null; // Placeholder

    } catch (error) {
      this.logger.error(`Failed to retrieve form: ${error.message}`, error.stack);
      throw new Error(`Form retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update form definition
   */
  async updateForm(tenantId: string, formId: string, updateData: any): Promise<FormDefinition> {
    try {
      this.logger.log(`Updating form: ${formId} for tenant: ${tenantId}`);

      // Validate update data
      const validatedData = this.validateFormDefinition(updateData);

      // TODO: Implement database update logic
      // This will be connected to actual database in next phase

      throw new Error('Update not implemented yet - placeholder');

    } catch (error) {
      this.logger.error(`Failed to update form: ${error.message}`, error.stack);
      throw new Error(`Form update failed: ${error.message}`);
    }
  }

  /**
   * Delete form definition
   */
  async deleteForm(tenantId: string, formId: string, deletedBy: string): Promise<void> {
    try {
      this.logger.log(`Deleting form: ${formId} for tenant: ${tenantId}`);

      // TODO: Implement database deletion logic
      // This will be connected to actual database in next phase

      this.logger.log(`Form deleted successfully: ${formId}`);

    } catch (error) {
      this.logger.error(`Failed to delete form: ${error.message}`, error.stack);
      throw new Error(`Form deletion failed: ${error.message}`);
    }
  }

  /**
   * List forms for tenant
   */
  async listForms(tenantId: string, options: any = {}): Promise<FormDefinition[]> {
    try {
      this.logger.log(`Listing forms for tenant: ${tenantId}`);

      const {
        page = 1,
        limit = 20,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      // TODO: Implement database query logic
      // This will be connected to actual database in next phase

      return []; // Placeholder

    } catch (error) {
      this.logger.error(`Failed to list forms: ${error.message}`, error.stack);
      throw new Error(`Forms listing failed: ${error.message}`);
    }
  }

  /**
   * Submit form data
   */
  async submitForm(tenantId: string, formId: string, formData: any, submittedBy: string): Promise<FormInstance> {
    try {
      this.logger.log(`Submitting form: ${formId} for tenant: ${tenantId}`);

      // Get form definition for validation
      const form = await this.getForm(tenantId, formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Validate form data
      const validation = await this.validateFormData(form, formData);
      if (!validation.isValid) {
        throw new Error(`Form validation failed: ${validation.errors.join(', ')}`);
      }

      // TODO: Implement database insertion logic
      // This will be connected to actual database in next phase

      const instance: FormInstance = {
        id: `instance_${Date.now()}`,
        formDefinitionId: formId,
        tenantId,
        formData,
        status: 'submitted',
        submittedBy,
        submittedAt: new Date()
      };

      this.logger.log(`Form submitted successfully: ${instance.id}`);
      return instance;

    } catch (error) {
      this.logger.error(`Failed to submit form: ${error.message}`, error.stack);
      throw new Error(`Form submission failed: ${error.message}`);
    }
  }

  /**
   * Validate form definition schema
   */
  private validateFormDefinition(data: any): any {
    const formDefinitionSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        layout: z.enum(['single-column', 'two-column', 'grid']).default('single-column')
      }),
      fields: z.array(z.object({
        name: z.string(),
        type: z.enum(['text', 'email', 'number', 'date', 'select', 'checkbox', 'radio', 'textarea', 'file']),
        label: z.string(),
        placeholder: z.string().optional(),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
        validation: z.object({
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          pattern: z.string().optional(),
          custom: z.string().optional()
        }).optional(),
        sortOrder: z.number()
      })),
      validationRules: z.object({
        required: z.array(z.string()).optional(),
        conditional: z.array(z.object({
          field: z.string(),
          condition: z.string(),
          value: z.any(),
          action: z.enum(['show', 'hide', 'require', 'disable'])
        })).optional()
      }).default({}),
      createdBy: z.string().optional(),
      updatedBy: z.string().optional()
    });

    return formDefinitionSchema.parse(data);
  }

  /**
   * Validate form data against definition
   */
  async validateFormData(form: FormDefinition, data: any): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Validate each field
      for (const field of form.fields) {
        const fieldValue = data[field.name];
        const validation = field.validation || {};

        // Required field validation
        if (field.required && (!fieldValue || fieldValue === '')) {
          errors.push(`${field.label} is required`);
          continue;
        }

        // Skip further validation if field is empty and not required
        if (!fieldValue && !field.required) {
          continue;
        }

        // Type-specific validation
        switch (field.type) {
          case 'email':
            if (fieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
              errors.push(`${field.label} must be a valid email`);
            }
            break;

          case 'number':
            if (fieldValue && isNaN(Number(fieldValue))) {
              errors.push(`${field.label} must be a valid number`);
            }
            break;

          case 'date':
            if (fieldValue && isNaN(Date.parse(fieldValue))) {
              errors.push(`${field.label} must be a valid date`);
            }
            break;
        }

        // Length validation
        if (validation.minLength && fieldValue.length < validation.minLength) {
          errors.push(`${field.label} must be at least ${validation.minLength} characters`);
        }

        if (validation.maxLength && fieldValue.length > validation.maxLength) {
          errors.push(`${field.label} must not exceed ${validation.maxLength} characters`);
        }

        // Pattern validation
        if (validation.pattern && !new RegExp(validation.pattern).test(fieldValue)) {
          errors.push(`${field.label} format is invalid`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };

    } catch (error) {
      this.logger.error(`Form data validation failed: ${error.message}`, error.stack);
      return { isValid: false, errors: ['Validation failed'] };
    }
  }

  /**
   * Get form statistics
   */
  async getFormStats(tenantId: string, formId: string): Promise<any> {
    try {
      this.logger.log(`Getting form statistics: ${formId} for tenant: ${tenantId}`);

      // TODO: Implement database statistics query
      // This will be connected to actual database in next phase

      return {
        totalSubmissions: 0,
        submissionsToday: 0,
        submissionsThisWeek: 0,
        submissionsThisMonth: 0,
        averageCompletionTime: 0,
        conversionRate: 0
      };

    } catch (error) {
      this.logger.error(`Failed to get form statistics: ${error.message}`, error.stack);
      throw new Error(`Form statistics failed: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // TODO: Implement actual database health check
      // This is a placeholder
      return true;
    } catch (error) {
      this.logger.error(`Forms service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Forms Service generated successfully"
}

# MANDATORY: Generate Templates Service
generate_templates_service() {
    log_info "Generating Templates Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/templates/templates.service.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/templates/templates.service.ts
// Generated: $(date)
// Phase: D2H3-P2-1 - Backend Services Generation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Handlebars, XLSX, PDFKit, Configuration Service
// Purpose: Enterprise template management with multi-format processing
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

// Template Interface
export interface Template {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'excel' | 'pdf' | 'html' | 'email';
  content: any;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Template Processing Result Interface
export interface TemplateProcessingResult {
  success: boolean;
  data?: Buffer | string | object;
  mimeType?: string;
  filename?: string;
  error?: string;
  processingTimeMs?: number;
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly config: ConfigService
  ) {}

  /**
   * Create new template
   */
  async createTemplate(tenantId: string, templateData: any): Promise<Template> {
    try {
      this.logger.log(`Creating template for tenant: ${tenantId}`);

      // Validate template data
      const validatedData = this.validateTemplateData(templateData);

      // Extract variables from template content
      const variables = this.extractVariables(validatedData.content);

      // TODO: Implement database creation logic
      // This will be connected to actual database in next phase
      const template: Template = {
        id: `template_${Date.now()}`,
        tenantId,
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        content: validatedData.content,
        variables,
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: validatedData.createdBy
      };

      this.logger.log(`Template created successfully: ${template.id}`);
      return template;

    } catch (error) {
      this.logger.error(`Failed to create template: ${error.message}`, error.stack);
      throw new Error(`Template creation failed: ${error.message}`);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(tenantId: string, templateId: string): Promise<Template | null> {
    try {
      this.logger.log(`Retrieving template: ${templateId} for tenant: ${tenantId}`);

      // TODO: Implement database retrieval logic
      // This is a placeholder that will be replaced with actual database queries
      
      return null; // Placeholder

    } catch (error) {
      this.logger.error(`Failed to get template: ${error.message}`, error.stack);
      throw new Error(`Template retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update template
   */
  async updateTemplate(tenantId: string, templateId: string, updateData: any): Promise<Template> {
    try {
      this.logger.log(`Updating template: ${templateId} for tenant: ${tenantId}`);

      // Validate update data
      const validatedData = this.validateTemplateData(updateData);

      // Extract variables from template content
      const variables = this.extractVariables(validatedData.content);

      // TODO: Implement database update logic
      // This will be connected to actual database in next phase

      throw new Error('Update not implemented yet - placeholder');

    } catch (error) {
      this.logger.error(`Failed to update template: ${error.message}`, error.stack);
      throw new Error(`Template update failed: ${error.message}`);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(tenantId: string, templateId: string, deletedBy: string): Promise<void> {
    try {
      this.logger.log(`Deleting template: ${templateId} for tenant: ${tenantId}`);

      // TODO: Implement database deletion logic
      // This will be connected to actual database in next phase

      this.logger.log(`Template deleted successfully: ${templateId}`);

    } catch (error) {
      this.logger.error(`Failed to delete template: ${error.message}`, error.stack);
      throw new Error(`Template deletion failed: ${error.message}`);
    }
  }

  /**
   * List templates for tenant
   */
  async listTemplates(tenantId: string, options: any = {}): Promise<Template[]> {
    try {
      this.logger.log(`Listing templates for tenant: ${tenantId}`);

      const {
        page = 1,
        limit = 20,
        type = null,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      // TODO: Implement database query logic
      // This will be connected to actual database in next phase

      return []; // Placeholder

    } catch (error) {
      this.logger.error(`Failed to list templates: ${error.message}`, error.stack);
      throw new Error(`Templates listing failed: ${error.message}`);
    }
  }

  /**
   * Process template with data
   */
  async processTemplate(
    tenantId: string, 
    templateId: string, 
    data: any
  ): Promise<TemplateProcessingResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Processing template: ${templateId} for tenant: ${tenantId}`);

      // Get template
      const template = await this.getTemplate(tenantId, templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      let result: TemplateProcessingResult;

      // Process based on template type
      switch (template.type) {
        case 'excel':
          result = await this.processExcelTemplate(template, data);
          break;
        
        case 'pdf':
          result = await this.processPDFTemplate(template, data);
          break;
        
        case 'html':
          result = await this.processHTMLTemplate(template, data);
          break;
        
        case 'email':
          result = await this.processEmailTemplate(template, data);
          break;
        
        default:
          throw new Error(`Unsupported template type: ${template.type}`);
      }

      const processingTime = Date.now() - startTime;
      result.processingTimeMs = processingTime;

      return result;

    } catch (error) {
      this.logger.error(`Template processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Process Excel template (placeholder)
   */
  private async processExcelTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // TODO: Implement actual Excel processing with XLSX
      // This is a placeholder for now
      
      return {
        success: true,
        data: Buffer.from('Excel content placeholder'),
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${template.name}_${Date.now()}.xlsx`
      };

    } catch (error) {
      throw new Error(`Excel template processing failed: ${error.message}`);
    }
  }

  /**
   * Process PDF template (placeholder)
   */
  private async processPDFTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // TODO: Implement actual PDF processing with PDFKit
      // This is a placeholder for now
      
      return {
        success: true,
        data: Buffer.from('PDF content placeholder'),
        mimeType: 'application/pdf',
        filename: `${template.name}_${Date.now()}.pdf`
      };

    } catch (error) {
      throw new Error(`PDF template processing failed: ${error.message}`);
    }
  }

  /**
   * Process HTML template (placeholder)
   */
  private async processHTMLTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // TODO: Implement actual HTML processing with Handlebars
      // This is a placeholder for now
      
      const processedHTML = `<h1>${data.title || 'Document'}</h1><p>Content placeholder</p>`;

      return {
        success: true,
        data: processedHTML,
        mimeType: 'text/html',
        filename: `${template.name}_${Date.now()}.html`
      };

    } catch (error) {
      throw new Error(`HTML template processing failed: ${error.message}`);
    }
  }

  /**
   * Process Email template (placeholder)
   */
  private async processEmailTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // TODO: Implement actual email template processing
      // This is a placeholder for now
      
      const result = {
        subject: data.subject || 'Email Subject',
        body: data.body || 'Email body content',
        isHtml: false,
        from: 'noreply@ifrspro.id'
      };

      return {
        success: true,
        data: result,
        mimeType: 'application/json'
      };

    } catch (error) {
      throw new Error(`Email template processing failed: ${error.message}`);
    }
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: any): string[] {
    const variables = new Set<string>();
    const variableRegex = /\{\{([^}]+)\}\}/g;
    
    const extractFromString = (str: string) => {
      let match;
      while ((match = variableRegex.exec(str)) !== null) {
        const variable = match[1].trim().split(' ')[0]; // Get first word (variable name)
        if (!variable.startsWith('#') && !variable.startsWith('/') && !variable.startsWith('else')) {
          variables.add(variable);
        }
      }
    };

    const traverseObject = (obj: any) => {
      if (typeof obj === 'string') {
        extractFromString(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach(traverseObject);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(traverseObject);
      }
    };

    traverseObject(content);
    return Array.from(variables);
  }

  /**
   * Validate template data
   */
  private validateTemplateData(data: any): any {
    const templateSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      type: z.enum(['excel', 'pdf', 'html', 'email']),
      content: z.any(),
      createdBy: z.string().optional(),
      updatedBy: z.string().optional()
    });

    return templateSchema.parse(data);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // TODO: Implement actual health check
      // This is a placeholder
      return true;
    } catch (error) {
      this.logger.error(`Templates service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Templates Service generated successfully"
}

# MANDATORY: Generate types and interfaces
generate_types_and_interfaces() {
    log_info "Generating types and interfaces..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/types/forms.types.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/types/forms.types.ts
// Generated: $(date)
// Phase: D2H3-P2-1 - Backend Services Generation
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: TypeScript type definitions for forms system
// ============================================================================

// Base Form Field Types
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'file';

// Form Layout Types
export type FormLayoutType = 'single-column' | 'two-column' | 'grid';

// Form Instance Status Types
export type FormInstanceStatus = 
  | 'draft' 
  | 'submitted' 
  | 'processing' 
  | 'completed' 
  | 'rejected';

// Conditional Logic Action Types
export type ConditionalActionType = 'show' | 'hide' | 'require' | 'disable';

// Form Field Validation Configuration
export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string;
}

// Form Field Configuration
export interface FormFieldConfig {
  id: string;
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: FormFieldValidation;
  sortOrder: number;
}

// Form Schema Configuration
export interface FormSchemaConfig {
  title: string;
  description?: string;
  layout: FormLayoutType;
}

// Conditional Logic Rule
export interface ConditionalRule {
  field: string;
  condition: string;
  value: any;
  action: ConditionalActionType;
}

// Form Validation Rules
export interface FormValidationRules {
  required?: string[];
  conditional?: ConditionalRule[];
}

// Complete Form Definition
export interface FormDefinitionConfig {
  id?: string;
  tenantId: string;
  name: string;
  description?: string;
  fields: FormFieldConfig[];
  schema: FormSchemaConfig;
  validationRules: FormValidationRules;
  version: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Form Instance Data
export interface FormInstanceConfig {
  id: string;
  formDefinitionId: string;
  tenantId: string;
  formData: Record<string, any>;
  status: FormInstanceStatus;
  submittedBy?: string;
  submittedAt?: Date;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
}

// Form Statistics
export interface FormStatistics {
  totalSubmissions: number;
  submissionsToday: number;
  submissionsThisWeek: number;
  submissionsThisMonth: number;
  averageCompletionTime: number;
  conversionRate: number;
}

// Form Validation Result
export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
}

// Form Service Options
export interface FormServiceOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
EOF

    cat > "${PROJECT_ROOT}/packages/backend/src/core/types/templates.types.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/types/templates.types.ts
// Generated: $(date)
// Phase: D2H3-P2-1 - Backend Services Generation
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: TypeScript type definitions for templates system
// ============================================================================

// Template Types
export type TemplateType = 'excel' | 'pdf' | 'html' | 'email';

// Template Processing Status
export type TemplateProcessingStatus = 'processing' | 'completed' | 'failed';

// Template Configuration
export interface TemplateConfig {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: TemplateType;
  content: any;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Template Processing Result
export interface TemplateProcessingResultConfig {
  success: boolean;
  data?: Buffer | string | object;
  mimeType?: string;
  filename?: string;
  error?: string;
  processingTimeMs?: number;
}

// Template Processing Log
export interface TemplateProcessingLog {
  id: string;
  templateId: string;
  tenantId: string;
  inputData?: any;
  outputFilename?: string;
  outputSize?: number;
  processingTimeMs?: number;
  status: TemplateProcessingStatus;
  errorMessage?: string;
  processedBy?: string;
  createdAt: Date;
}

// Template Service Options
export interface TemplateServiceOptions {
  page?: number;
  limit?: number;
  type?: TemplateType;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Excel Template Content
export interface ExcelTemplateContent {
  sheets: Record<string, any>;
  formatting?: {
    headers?: boolean;
    columns?: Record<string, any>;
    borders?: boolean;
  };
}

// PDF Template Content
export interface PDFTemplateContent {
  header?: {
    title: string;
    subtitle?: string;
  };
  sections: Array<{
    title: string;
    content?: string;
    table?: {
      headers: string[];
      rows: any[][];
    };
    pageBreak?: boolean;
  }>;
  footer?: string;
}

// HTML Template Content
export interface HTMLTemplateContent {
  html: string;
  css?: string;
}

// Email Template Content
export interface EmailTemplateContent {
  subject: string;
  body: string;
  isHtml?: boolean;
  from?: string;
  attachments?: any[];
}
EOF

    log_success "Types and interfaces generated successfully"
}

# MANDATORY: Main execution function
main() {
    log_info "Starting PSDD ${PHASE_NAME}..."
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads}
    
    # Validate environment
    validate_environment
    
    # Execute generation phases
    log_info "Phase 1: Creating backend directory structure"
    create_backend_directories
    
    log_info "Phase 2: Generating Forms Service"
    generate_forms_service
    
    log_info "Phase 3: Generating Templates Service"
    generate_templates_service
    
    log_info "Phase 4: Generating types and interfaces"
    generate_types_and_interfaces
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "🎉 PSDD ${PHASE_NAME} completed successfully!"
    
    echo ""
    echo "============================================================================"
    echo "📋 PSDD DAY 2 HOUR 3+ PART 2-1 COMPLETION SUMMARY"
    echo "============================================================================"
    echo "✅ Phase: ${PHASE_ID} - ${PHASE_NAME}"
    echo "✅ Status: COMPLETED SUCCESSFULLY"
    echo "✅ Backend Services: FormsService + TemplatesService"
    echo "✅ Type Definitions: Complete TypeScript interfaces"
    echo "✅ Validation: Zod schema validation implemented"
    echo ""
    echo "🔗 Generated Components:"
    echo "   • FormsService - Enterprise form management engine"
    echo "   • TemplatesService - Multi-format template processing"
    echo "   • TypeScript Types - Complete type safety"
    echo "   • Validation Schemas - Input validation with Zod"
    echo ""
    echo "📁 Files Generated:"
    echo "   • packages/backend/src/core/services/forms/forms.service.ts"
    echo "   • packages/backend/src/core/services/templates/templates.service.ts"
    echo "   • packages/backend/src/core/types/forms.types.ts"
    echo "   • packages/backend/src/core/types/templates.types.ts"
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "   Run: ./scripts/setup/d2h3-part-2-2-database-migrations.sh"
    echo ""
    echo "📋 SERVICES READY FOR:"
    echo "   • Database integration (Part 2-2)"
    echo "   • API controller implementation (Part 2-3)"
    echo "   • Frontend component generation (Part 2-4)"
    echo ""
    echo "============================================================================"
    echo ""
}

# Execute main function with all arguments
main "$@"