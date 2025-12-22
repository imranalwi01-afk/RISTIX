#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - PHASE 1C SETUP SCRIPT (PART 3 OF 5)
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-templates-setup-part3of5.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H3 - Advanced Forms & Templates Backend Services
# Methodology: Phased Shell-Driven Development (PSDD) v2.0
# Objective: Generate backend services and controllers for forms system
# Dependencies: PostgreSQL, Node.js, d2h3-forms-templates-setup-part2of5.sh
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-forms-templates-part3-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3P3"
PHASE_NAME="Advanced Forms & Templates Backend Services - Part 3"
PHASE_OBJECTIVE="Generate backend services and controllers"

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

# MANDATORY: Load configuration
load_configuration() {
    log_info "Loading configuration for ${PHASE_ID}..."
    
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_error "Environment configuration file not found"
        exit 1
    fi
}

# MANDATORY: Generate forms service
generate_forms_service() {
    log_info "Generating forms service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/modules/forms/services/forms.service.ts"
    
    cat > "${service_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/modules/forms/services/forms.service.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H3P3 - Advanced Forms & Templates Backend Services
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: PostgreSQL, Zod, Winston
// Purpose: Advanced form definition and submission management service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { z } from 'zod';
import { FormDefinition } from '../models/form-definition.entity';
import { FormSubmission } from '../models/form-submission.entity';
import { FormFieldDefinition } from '../models/form-field-definition.entity';

// Validation schemas
const createFormDefinitionSchema = z.object({
  name: z.string().min(1).max(255),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  schemaDefinition: z.record(z.any()),
  uiSchema: z.record(z.any()).optional(),
  validationRules: z.record(z.any()).optional(),
  formType: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().default(false)
});

const updateFormDefinitionSchema = createFormDefinitionSchema.partial().extend({
  id: z.string().uuid()
});

const createFormSubmissionSchema = z.object({
  formDefinitionId: z.string().uuid(),
  submissionData: z.record(z.any()),
  metadata: z.record(z.any()).optional()
});

export type CreateFormDefinitionInput = z.infer<typeof createFormDefinitionSchema>;
export type UpdateFormDefinitionInput = z.infer<typeof updateFormDefinitionSchema>;
export type CreateFormSubmissionInput = z.infer<typeof createFormSubmissionSchema>;

export interface FormDefinitionInfo {
  id: string;
  name: string;
  title: string;
  description?: string;
  version: number;
  status: string;
  formType: string;
  schemaDefinition: Record<string, any>;
  uiSchema?: Record<string, any>;
  validationRules?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmissionInfo {
  id: string;
  formDefinitionId: string;
  submissionData: Record<string, any>;
  status: string;
  submittedAt: Date;
  submittedBy: string;
  validationErrors?: Record<string, any>;
}

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    @InjectRepository(FormDefinition)
    private readonly formDefinitionRepository: Repository<FormDefinition>,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
    @InjectRepository(FormFieldDefinition)
    private readonly formFieldRepository: Repository<FormFieldDefinition>
  ) {}

  /**
   * Create a new form definition
   */
  public async createFormDefinition(
    input: CreateFormDefinitionInput,
    tenantId: string,
    createdBy: string
  ): Promise<FormDefinitionInfo> {
    const queryRunner = this.formDefinitionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate input
      const validatedInput = createFormDefinitionSchema.parse(input);

      // Check for existing form with same name
      const existingForm = await queryRunner.manager.findOne(FormDefinition, {
        where: { 
          tenantId, 
          name: validatedInput.name,
          status: 'published'
        }
      });

      if (existingForm) {
        throw new Error(`Form with name '${validatedInput.name}' already exists`);
      }

      // Create form definition
      const formDefinition = queryRunner.manager.create(FormDefinition, {
        ...validatedInput,
        tenantId,
        createdBy,
        version: 1,
        status: 'draft'
      });

      const savedForm = await queryRunner.manager.save(formDefinition);

      // Create form fields if schema contains fields
      if (validatedInput.schemaDefinition.properties) {
        const fieldPromises = Object.entries(validatedInput.schemaDefinition.properties).map(
          async ([fieldName, fieldConfig], index) => {
            const field = queryRunner.manager.create(FormFieldDefinition, {
              tenantId,
              formDefinitionId: savedForm.id,
              fieldName,
              fieldType: (fieldConfig as any).type || 'text',
              fieldConfig: fieldConfig as Record<string, any>,
              displayOrder: index,
              isRequired: validatedInput.schemaDefinition.required?.includes(fieldName) || false
            });
            return queryRunner.manager.save(field);
          }
        );

        await Promise.all(fieldPromises);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Form definition created: ${savedForm.id}`);

      return {
        id: savedForm.id,
        name: savedForm.name,
        title: savedForm.title,
        description: savedForm.description,
        version: savedForm.version,
        status: savedForm.status,
        formType: savedForm.formType,
        schemaDefinition: savedForm.schemaDefinition,
        uiSchema: savedForm.uiSchema,
        validationRules: savedForm.validationRules,
        createdAt: savedForm.createdAt,
        updatedAt: savedForm.updatedAt
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create form definition: ${error.message}`, error.stack);
      throw new Error(`Form definition creation failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get form definition by ID
   */
  public async getFormDefinition(
    id: string,
    tenantId: string
  ): Promise<FormDefinitionInfo | null> {
    try {
      const formDefinition = await this.formDefinitionRepository.findOne({
        where: { id, tenantId },
        relations: ['fields']
      });

      if (!formDefinition) {
        return null;
      }

      return {
        id: formDefinition.id,
        name: formDefinition.name,
        title: formDefinition.title,
        description: formDefinition.description,
        version: formDefinition.version,
        status: formDefinition.status,
        formType: formDefinition.formType,
        schemaDefinition: formDefinition.schemaDefinition,
        uiSchema: formDefinition.uiSchema,
        validationRules: formDefinition.validationRules,
        createdAt: formDefinition.createdAt,
        updatedAt: formDefinition.updatedAt
      };
    } catch (error) {
      this.logger.error(`Failed to get form definition: ${error.message}`, error.stack);
      throw new Error(`Form definition retrieval failed: ${error.message}`);
    }
  }

  /**
   * Submit form data
   */
  public async submitForm(
    input: CreateFormSubmissionInput,
    tenantId: string,
    submittedBy: string
  ): Promise<FormSubmissionInfo> {
    const queryRunner = this.formSubmissionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate input
      const validatedInput = createFormSubmissionSchema.parse(input);

      // Get form definition for validation
      const formDefinition = await queryRunner.manager.findOne(FormDefinition, {
        where: { id: validatedInput.formDefinitionId, tenantId }
      });

      if (!formDefinition) {
        throw new Error('Form definition not found');
      }

      // Validate submission data against form schema
      const validationErrors = await this.validateSubmissionData(
        validatedInput.submissionData,
        formDefinition.schemaDefinition,
        formDefinition.validationRules
      );

      // Create submission
      const submission = queryRunner.manager.create(FormSubmission, {
        tenantId,
        formDefinitionId: validatedInput.formDefinitionId,
        submissionData: validatedInput.submissionData,
        submittedBy,
        status: validationErrors.length > 0 ? 'draft' : 'submitted',
        validationErrors: validationErrors.length > 0 ? { errors: validationErrors } : null,
        metadata: validatedInput.metadata
      });

      const savedSubmission = await queryRunner.manager.save(submission);

      await queryRunner.commitTransaction();

      this.logger.log(`Form submitted: ${savedSubmission.id}`);

      return {
        id: savedSubmission.id,
        formDefinitionId: savedSubmission.formDefinitionId,
        submissionData: savedSubmission.submissionData,
        status: savedSubmission.status,
        submittedAt: savedSubmission.submittedAt,
        submittedBy: savedSubmission.submittedBy,
        validationErrors: savedSubmission.validationErrors
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to submit form: ${error.message}`, error.stack);
      throw new Error(`Form submission failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate submission data against form schema
   */
  private async validateSubmissionData(
    submissionData: Record<string, any>,
    schemaDefinition: Record<string, any>,
    validationRules?: Record<string, any>
  ): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Check required fields
      if (schemaDefinition.required) {
        for (const requiredField of schemaDefinition.required) {
          if (!submissionData[requiredField] && submissionData[requiredField] !== 0) {
            errors.push(`Field '${requiredField}' is required`);
          }
        }
      }

      // Validate field types and formats
      if (schemaDefinition.properties) {
        for (const [fieldName, fieldSchema] of Object.entries(schemaDefinition.properties)) {
          const fieldValue = submissionData[fieldName];
          const schema = fieldSchema as any;

          if (fieldValue !== undefined && fieldValue !== null) {
            // Type validation
            if (schema.type === 'string' && typeof fieldValue !== 'string') {
              errors.push(`Field '${fieldName}' must be a string`);
            } else if (schema.type === 'number' && typeof fieldValue !== 'number') {
              errors.push(`Field '${fieldName}' must be a number`);
            } else if (schema.type === 'boolean' && typeof fieldValue !== 'boolean') {
              errors.push(`Field '${fieldName}' must be a boolean`);
            }

            // Format validation
            if (schema.format === 'email' && typeof fieldValue === 'string') {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(fieldValue)) {
                errors.push(`Field '${fieldName}' must be a valid email`);
              }
            }

            // Min/Max length validation
            if (typeof fieldValue === 'string') {
              if (schema.minLength && fieldValue.length < schema.minLength) {
                errors.push(`Field '${fieldName}' must be at least ${schema.minLength} characters`);
              }
              if (schema.maxLength && fieldValue.length > schema.maxLength) {
                errors.push(`Field '${fieldName}' must not exceed ${schema.maxLength} characters`);
              }
            }

            // Min/Max value validation
            if (typeof fieldValue === 'number') {
              if (schema.minimum && fieldValue < schema.minimum) {
                errors.push(`Field '${fieldName}' must be at least ${schema.minimum}`);
              }
              if (schema.maximum && fieldValue > schema.maximum) {
                errors.push(`Field '${fieldName}' must not exceed ${schema.maximum}`);
              }
            }
          }
        }
      }

      // Custom validation rules
      if (validationRules && validationRules.customRules) {
        // TODO: Implement custom validation rules engine
        this.logger.debug('Custom validation rules found but not implemented yet');
      }

    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`);
      errors.push('Validation process failed');
    }

    return errors;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.formDefinitionRepository.query('SELECT 1');
      return result.length > 0;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

}

# MANDATORY: Generate templates service
generate_templates_service() {
    log_info "Generating templates service..."
    
    local service_file="${PROJECT_ROOT}/packages/backend/src/modules/templates/services/templates.service.ts"
    
    cat > "${service_file}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/modules/templates/services/templates.service.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H3P3 - Advanced Forms & Templates Backend Services
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: PostgreSQL, Handlebars, Zod
// Purpose: Advanced template definition and rendering service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { z } from 'zod';
import * as Handlebars from 'handlebars';
import { TemplateDefinition } from '../models/template-definition.entity';
import { TemplateInstance } from '../models/template-instance.entity';

// Validation schemas
const createTemplateDefinitionSchema = z.object({
  name: z.string().min(1).max(255),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  templateType: z.string().min(1).max(100),
  templateContent: z.record(z.any()),
  templateVariables: z.record(z.any()).optional(),
  renderingEngine: z.enum(['handlebars', 'mustache', 'ejs']).default('handlebars'),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional()
});

const renderTemplateSchema = z.object({
  templateId: z.string().uuid(),
  variables: z.record(z.any()),
  metadata: z.record(z.any()).optional()
});

export type CreateTemplateDefinitionInput = z.infer<typeof createTemplateDefinitionSchema>;
export type RenderTemplateInput = z.infer<typeof renderTemplateSchema>;

export interface TemplateDefinitionInfo {
  id: string;
  name: string;
  title: string;
  description?: string;
  templateType: string;
  templateContent: Record<string, any>;
  renderingEngine: string;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateRenderResult {
  id: string;
  templateId: string;
  renderedContent: string;
  generatedAt: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectRepository(TemplateDefinition)
    private readonly templateDefinitionRepository: Repository<TemplateDefinition>,
    @InjectRepository(TemplateInstance)
    private readonly templateInstanceRepository: Repository<TemplateInstance>
  ) {
    this.initializeHandlebarsHelpers();
  }

  /**
   * Create a new template definition
   */
  public async createTemplateDefinition(
    input: CreateTemplateDefinitionInput,
    tenantId: string,
    createdBy: string
  ): Promise<TemplateDefinitionInfo> {
    const queryRunner = this.templateDefinitionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate input
      const validatedInput = createTemplateDefinitionSchema.parse(input);

      // Check for existing template with same name
      const existingTemplate = await queryRunner.manager.findOne(TemplateDefinition, {
        where: { 
          tenantId, 
          name: validatedInput.name,
          status: 'published'
        }
      });

      if (existingTemplate) {
        throw new Error(`Template with name '${validatedInput.name}' already exists`);
      }

      // Create template definition
      const templateDefinition = queryRunner.manager.create(TemplateDefinition, {
        ...validatedInput,
        tenantId,
        createdBy,
        version: 1,
        status: 'draft'
      });

      const savedTemplate = await queryRunner.manager.save(templateDefinition);

      await queryRunner.commitTransaction();

      this.logger.log(`Template definition created: ${savedTemplate.id}`);

      return {
        id: savedTemplate.id,
        name: savedTemplate.name,
        title: savedTemplate.title,
        description: savedTemplate.description,
        templateType: savedTemplate.templateType,
        templateContent: savedTemplate.templateContent,
        renderingEngine: savedTemplate.renderingEngine,
        version: savedTemplate.version,
        status: savedTemplate.status,
        createdAt: savedTemplate.createdAt,
        updatedAt: savedTemplate.updatedAt
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create template definition: ${error.message}`, error.stack);
      throw new Error(`Template definition creation failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Render template with data
   */
  public async renderTemplate(
    input: RenderTemplateInput,
    tenantId: string,
    generatedBy: string
  ): Promise<TemplateRenderResult> {
    const queryRunner = this.templateInstanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate input
      const validatedInput = renderTemplateSchema.parse(input);

      // Get template definition
      const templateDefinition = await queryRunner.manager.findOne(TemplateDefinition, {
        where: { id: validatedInput.templateId, tenantId }
      });

      if (!templateDefinition) {
        throw new Error('Template definition not found');
      }

      // Render content based on engine
      let renderedContent: string;
      
      switch (templateDefinition.renderingEngine) {
        case 'handlebars':
          renderedContent = await this.renderHandlebars(
            templateDefinition.templateContent,
            validatedInput.variables
          );
          break;
        default:
          throw new Error(`Unsupported rendering engine: ${templateDefinition.renderingEngine}`);
      }

      // Create template instance
      const templateInstance = queryRunner.manager.create(TemplateInstance, {
        tenantId,
        templateDefinitionId: validatedInput.templateId,
        instanceData: validatedInput.variables,
        renderedContent,
        generatedBy,
        metadata: validatedInput.metadata
      });

      const savedInstance = await queryRunner.manager.save(templateInstance);

      await queryRunner.commitTransaction();

      this.logger.log(`Template rendered: ${savedInstance.id}`);

      return {
        id: savedInstance.id,
        templateId: savedInstance.templateDefinitionId,
        renderedContent: savedInstance.renderedContent,
        generatedAt: savedInstance.generatedAt,
        metadata: savedInstance.metadata
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to render template: ${error.message}`, error.stack);
      throw new Error(`Template rendering failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Render using Handlebars engine
   */
  private async renderHandlebars(
    templateContent: Record<string, any>,
    variables: Record<string, any>
  ): Promise<string> {
    try {
      const templateString = templateContent.template || templateContent.content;
      if (!templateString) {
        throw new Error('Template content not found');
      }

      const template = Handlebars.compile(templateString);
      return template(variables);
    } catch (error) {
      this.logger.error(`Handlebars rendering failed: ${error.message}`);
      throw new Error(`Template compilation failed: ${error.message}`);
    }
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHandlebarsHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: string | Date, format: string = 'YYYY-MM-DD') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString().split('T')[0]; // Basic date formatting
    });

    // Number formatting helper
    Handlebars.registerHelper('formatNumber', (number: number, decimals: number = 2) => {
      return number.toFixed(decimals);
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount);
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Loop index helper
    Handlebars.registerHelper('inc', (value: number) => {
      return parseInt(value) + 1;
    });
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.templateDefinitionRepository.query('SELECT 1');
      return result.length > 0;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Templates service generated: ${service_file}"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# Main execution
main() {
    log_info "Starting ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    load_configuration
    generate_forms_service
    generate_templates_service
    track_progress "${PHASE_ID}" "PART_3_COMPLETED"
    
    log_success "${PHASE_ID} Part 3 completed successfully!"
    log_info "Next: Run d2h3-forms-templates-setup-part4of5.sh"
    
    # Auto-continue to next part
    if [[ -f "${SCRIPT_DIR}/d2h3-forms-templates-setup-part4of5.sh" ]]; then
        log_info "Auto-continuing to Part 4..."
        "${SCRIPT_DIR}/d2h3-forms-templates-setup-part4of5.sh"
    else
        log_warning "Part 4 script not found. Manual execution required."
    fi
}

# Execute main function
main "$@"