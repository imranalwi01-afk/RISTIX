#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Day 2 Hour 3+ CODE GENERATION SETUP
# ============================================================================
# File Path: ./scripts/setup/d2h3-advanced-forms-templates-setup.sh
# Generated: $(date)
# Phase: D2H3 - Advanced Forms & Templates System
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Generate advanced forms and templates management system
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3"
PHASE_NAME="Advanced Forms & Templates System"
PHASE_OBJECTIVE="Enterprise form management with drag-and-drop builder"

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
    log_error "Stack trace available in: ${LOG_FILE}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for ${PHASE_NAME}..."
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    # Validate required tools
    local required_tools=("node" "pnpm" "psql")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Load environment configuration
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

# MANDATORY: Directory structure creation
create_directory_structure() {
    log_info "Creating directory structure for ${PHASE_NAME}..."
    
    # Backend directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/templates"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/validators/forms"
    
    # Frontend directories
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/templates"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/form-builder"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/services/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/types/forms"
    
    # Database directories
    mkdir -p "${PROJECT_ROOT}/database/migrations/forms"
    mkdir -p "${PROJECT_ROOT}/database/seeders/forms"
    
    log_success "Directory structure created"
}

# MANDATORY: Generate backend forms service
generate_forms_service() {
    log_info "Generating Forms Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/forms/forms.service.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/forms/forms.service.ts
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates System
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Zod, Configuration Service
// Purpose: Enterprise form management with dynamic form builder
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { FormDefinition, FormField, FormValidation } from '../../types/forms.types';
import { DatabaseService } from '../database/database.service';
import { TenantService } from '../tenant/tenant.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly database: DatabaseService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Create new form definition
   */
  async createForm(tenantId: string, formData: any): Promise<FormDefinition> {
    const transaction = await this.database.transaction();
    
    try {
      this.logger.log(`Creating form for tenant: ${tenantId}`);

      // Validate form data
      const validatedData = this.validateFormDefinition(formData);

      // Create form definition
      const formDefinition = await this.database.query(
        `INSERT INTO forms.form_definitions 
         (tenant_id, name, description, form_schema, validation_rules, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [
          tenantId,
          validatedData.name,
          validatedData.description,
          JSON.stringify(validatedData.schema),
          JSON.stringify(validatedData.validationRules),
          validatedData.createdBy
        ],
        { transaction }
      );

      // Create form fields
      for (const field of validatedData.fields) {
        await this.database.query(
          `INSERT INTO forms.form_fields 
           (form_id, field_name, field_type, field_config, validation_rules, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            formDefinition[0].id,
            field.name,
            field.type,
            JSON.stringify(field.config),
            JSON.stringify(field.validation),
            field.sortOrder
          ],
          { transaction }
        );
      }

      await transaction.commit();

      // Log audit trail
      await this.auditService.logAction({
        tenantId,
        action: 'FORM_CREATED',
        resourceType: 'form_definition',
        resourceId: formDefinition[0].id,
        details: { formName: validatedData.name }
      });

      this.logger.log(`Form created successfully: ${formDefinition[0].id}`);
      return formDefinition[0];

    } catch (error) {
      await transaction.rollback();
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

      const formData = await this.database.query(
        `SELECT fd.*, 
                json_agg(
                  json_build_object(
                    'id', ff.id,
                    'name', ff.field_name,
                    'type', ff.field_type,
                    'config', ff.field_config,
                    'validation', ff.validation_rules,
                    'sortOrder', ff.sort_order
                  ) ORDER BY ff.sort_order
                ) as fields
         FROM forms.form_definitions fd
         LEFT JOIN forms.form_fields ff ON fd.id = ff.form_id
         WHERE fd.tenant_id = $1 AND fd.id = $2 AND fd.deleted_at IS NULL
         GROUP BY fd.id`,
        [tenantId, formId]
      );

      if (formData.length === 0) {
        return null;
      }

      return formData[0];

    } catch (error) {
      this.logger.error(`Failed to retrieve form: ${error.message}`, error.stack);
      throw new Error(`Form retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update form definition
   */
  async updateForm(tenantId: string, formId: string, updateData: any): Promise<FormDefinition> {
    const transaction = await this.database.transaction();
    
    try {
      this.logger.log(`Updating form: ${formId} for tenant: ${tenantId}`);

      // Validate update data
      const validatedData = this.validateFormDefinition(updateData);

      // Update form definition
      const updatedForm = await this.database.query(
        `UPDATE forms.form_definitions 
         SET name = $3, description = $4, form_schema = $5, 
             validation_rules = $6, updated_at = NOW(), updated_by = $7
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [
          tenantId,
          formId,
          validatedData.name,
          validatedData.description,
          JSON.stringify(validatedData.schema),
          JSON.stringify(validatedData.validationRules),
          validatedData.updatedBy
        ],
        { transaction }
      );

      if (updatedForm.length === 0) {
        throw new Error('Form not found or already deleted');
      }

      // Update form fields (delete and recreate for simplicity)
      await this.database.query(
        `DELETE FROM forms.form_fields WHERE form_id = $1`,
        [formId],
        { transaction }
      );

      // Recreate form fields
      for (const field of validatedData.fields) {
        await this.database.query(
          `INSERT INTO forms.form_fields 
           (form_id, field_name, field_type, field_config, validation_rules, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            formId,
            field.name,
            field.type,
            JSON.stringify(field.config),
            JSON.stringify(field.validation),
            field.sortOrder
          ],
          { transaction }
        );
      }

      await transaction.commit();

      // Log audit trail
      await this.auditService.logAction({
        tenantId,
        action: 'FORM_UPDATED',
        resourceType: 'form_definition',
        resourceId: formId,
        details: { formName: validatedData.name }
      });

      this.logger.log(`Form updated successfully: ${formId}`);
      return updatedForm[0];

    } catch (error) {
      await transaction.rollback();
      this.logger.error(`Failed to update form: ${error.message}`, error.stack);
      throw new Error(`Form update failed: ${error.message}`);
    }
  }

  /**
   * Delete form definition
   */
  async deleteForm(tenantId: string, formId: string, deletedBy: string): Promise<void> {
    const transaction = await this.database.transaction();
    
    try {
      this.logger.log(`Deleting form: ${formId} for tenant: ${tenantId}`);

      // Soft delete form definition
      const result = await this.database.query(
        `UPDATE forms.form_definitions 
         SET deleted_at = NOW(), deleted_by = $3
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL
         RETURNING name`,
        [tenantId, formId, deletedBy],
        { transaction }
      );

      if (result.length === 0) {
        throw new Error('Form not found or already deleted');
      }

      await transaction.commit();

      // Log audit trail
      await this.auditService.logAction({
        tenantId,
        action: 'FORM_DELETED',
        resourceType: 'form_definition',
        resourceId: formId,
        details: { formName: result[0].name }
      });

      this.logger.log(`Form deleted successfully: ${formId}`);

    } catch (error) {
      await transaction.rollback();
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

      const offset = (page - 1) * limit;

      let query = `
        SELECT fd.id, fd.name, fd.description, fd.created_at, fd.updated_at,
               fd.created_by, fd.updated_by,
               COUNT(fi.id) as submission_count
        FROM forms.form_definitions fd
        LEFT JOIN forms.form_instances fi ON fd.id = fi.form_definition_id
        WHERE fd.tenant_id = $1 AND fd.deleted_at IS NULL
      `;

      const params = [tenantId];

      if (search) {
        query += ` AND (fd.name ILIKE $${params.length + 1} OR fd.description ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }

      query += ` GROUP BY fd.id ORDER BY fd.${sortBy} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const forms = await this.database.query(query, params);

      this.logger.log(`Retrieved ${forms.length} forms for tenant: ${tenantId}`);
      return forms;

    } catch (error) {
      this.logger.error(`Failed to list forms: ${error.message}`, error.stack);
      throw new Error(`Forms listing failed: ${error.message}`);
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
        config: z.object({
          label: z.string(),
          placeholder: z.string().optional(),
          required: z.boolean().default(false),
          options: z.array(z.string()).optional()
        }),
        validation: z.object({
          required: z.boolean().default(false),
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
      }),
      createdBy: z.string().optional(),
      updatedBy: z.string().optional()
    });

    return formDefinitionSchema.parse(data);
  }

  /**
   * Validate form data against definition
   */
  async validateFormData(formId: string, data: any): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const form = await this.getForm(data.tenantId, formId);
      if (!form) {
        return { isValid: false, errors: ['Form not found'] };
      }

      const errors: string[] = [];

      // Validate each field
      for (const field of form.fields) {
        const fieldValue = data[field.name];
        const validation = field.validation || {};

        // Required field validation
        if (validation.required && (!fieldValue || fieldValue === '')) {
          errors.push(`${field.config.label} is required`);
          continue;
        }

        // Skip further validation if field is empty and not required
        if (!fieldValue && !validation.required) {
          continue;
        }

        // Type-specific validation
        switch (field.type) {
          case 'email':
            if (fieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
              errors.push(`${field.config.label} must be a valid email`);
            }
            break;

          case 'number':
            if (fieldValue && isNaN(Number(fieldValue))) {
              errors.push(`${field.config.label} must be a valid number`);
            }
            break;

          case 'date':
            if (fieldValue && isNaN(Date.parse(fieldValue))) {
              errors.push(`${field.config.label} must be a valid date`);
            }
            break;
        }

        // Length validation
        if (validation.minLength && fieldValue.length < validation.minLength) {
          errors.push(`${field.config.label} must be at least ${validation.minLength} characters`);
        }

        if (validation.maxLength && fieldValue.length > validation.maxLength) {
          errors.push(`${field.config.label} must not exceed ${validation.maxLength} characters`);
        }

        // Pattern validation
        if (validation.pattern && !new RegExp(validation.pattern).test(fieldValue)) {
          errors.push(`${field.config.label} format is invalid`);
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
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.database.query('SELECT 1 FROM forms.form_definitions LIMIT 1');
      return true;
    } catch (error) {
      this.logger.error(`Forms service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Forms Service generated"
}

# MANDATORY: Generate templates service
generate_templates_service() {
    log_info "Generating Templates Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/templates/templates.service.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/templates/templates.service.ts
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates System
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Handlebars, Configuration Service
// Purpose: Enterprise template management with Excel and PDF generation
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import * as XLSX from 'xlsx';
import * as PDFKit from 'pdfkit';
import { DatabaseService } from '../database/database.service';
import { TenantService } from '../tenant/tenant.service';
import { AuditService } from '../audit/audit.service';
import { z } from 'zod';

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
}

export interface TemplateProcessingResult {
  success: boolean;
  data?: Buffer | string;
  mimeType?: string;
  filename?: string;
  error?: string;
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly database: DatabaseService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService
  ) {
    this.initializeHandlebarsHelpers();
  }

  /**
   * Create new template
   */
  async createTemplate(tenantId: string, templateData: any): Promise<Template> {
    const transaction = await this.database.transaction();
    
    try {
      this.logger.log(`Creating template for tenant: ${tenantId}`);

      // Validate template data
      const validatedData = this.validateTemplateData(templateData);

      // Extract variables from template content
      const variables = this.extractVariables(validatedData.content);

      const template = await this.database.query(
        `INSERT INTO templates.templates 
         (tenant_id, name, description, type, content, variables, version, is_active, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 1, true, $7, NOW())
         RETURNING *`,
        [
          tenantId,
          validatedData.name,
          validatedData.description,
          validatedData.type,
          JSON.stringify(validatedData.content),
          JSON.stringify(variables),
          validatedData.createdBy
        ],
        { transaction }
      );

      await transaction.commit();

      // Log audit trail
      await this.auditService.logAction({
        tenantId,
        action: 'TEMPLATE_CREATED',
        resourceType: 'template',
        resourceId: template[0].id,
        details: { templateName: validatedData.name, type: validatedData.type }
      });

      this.logger.log(`Template created successfully: ${template[0].id}`);
      return template[0];

    } catch (error) {
      await transaction.rollback();
      this.logger.error(`Failed to create template: ${error.message}`, error.stack);
      throw new Error(`Template creation failed: ${error.message}`);
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
    try {
      this.logger.log(`Processing template: ${templateId} for tenant: ${tenantId}`);

      // Get template
      const template = await this.getTemplate(tenantId, templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Process based on template type
      switch (template.type) {
        case 'excel':
          return await this.processExcelTemplate(template, data);
        
        case 'pdf':
          return await this.processPDFTemplate(template, data);
        
        case 'html':
          return await this.processHTMLTemplate(template, data);
        
        case 'email':
          return await this.processEmailTemplate(template, data);
        
        default:
          throw new Error(`Unsupported template type: ${template.type}`);
      }

    } catch (error) {
      this.logger.error(`Template processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process Excel template
   */
  private async processExcelTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // Create new workbook
      const workbook = XLSX.utils.book_new();

      // Process each sheet in template
      for (const [sheetName, sheetTemplate] of Object.entries(template.content.sheets || {})) {
        const processedData = this.processTemplateVariables(sheetTemplate, data);
        
        // Convert processed data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(processedData.rows || []);
        
        // Apply formatting if specified
        if (processedData.formatting) {
          this.applyExcelFormatting(worksheet, processedData.formatting);
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return {
        success: true,
        data: buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${template.name}_${Date.now()}.xlsx`
      };

    } catch (error) {
      throw new Error(`Excel template processing failed: ${error.message}`);
    }
  }

  /**
   * Process PDF template
   */
  private async processPDFTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      const doc = new PDFKit();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            success: true,
            data: buffer,
            mimeType: 'application/pdf',
            filename: `${template.name}_${Date.now()}.pdf`
          });
        });

        doc.on('error', reject);

        try {
          // Process template content with data
          const processedContent = this.processTemplateVariables(template.content, data);

          // Add content to PDF
          if (processedContent.header) {
            doc.fontSize(16).text(processedContent.header.title, { align: 'center' });
            doc.moveDown();
          }

          if (processedContent.sections) {
            for (const section of processedContent.sections) {
              doc.fontSize(12).text(section.title, { underline: true });
              doc.moveDown(0.5);
              
              if (section.content) {
                doc.fontSize(10).text(section.content);
                doc.moveDown();
              }

              if (section.table) {
                this.addTableToPDF(doc, section.table);
              }
            }
          }

          doc.end();

        } catch (error) {
          reject(new Error(`PDF generation failed: ${error.message}`));
        }
      });

    } catch (error) {
      throw new Error(`PDF template processing failed: ${error.message}`);
    }
  }

  /**
   * Process HTML template
   */
  private async processHTMLTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // Compile Handlebars template
      const compiledTemplate = Handlebars.compile(template.content.html);
      
      // Process with data
      const processedHTML = compiledTemplate(data);

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
   * Process Email template
   */
  private async processEmailTemplate(
    template: Template, 
    data: any
  ): Promise<TemplateProcessingResult> {
    try {
      // Process subject and body
      const subjectTemplate = Handlebars.compile(template.content.subject || '');
      const bodyTemplate = Handlebars.compile(template.content.body || '');

      const processedSubject = subjectTemplate(data);
      const processedBody = bodyTemplate(data);

      return {
        success: true,
        data: {
          subject: processedSubject,
          body: processedBody,
          isHtml: template.content.isHtml || false
        },
        mimeType: 'application/json'
      };

    } catch (error) {
      throw new Error(`Email template processing failed: ${error.message}`);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(tenantId: string, templateId: string): Promise<Template | null> {
    try {
      const result = await this.database.query(
        `SELECT * FROM templates.templates 
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
        [tenantId, templateId]
      );

      return result[0] || null;

    } catch (error) {
      this.logger.error(`Failed to get template: ${error.message}`, error.stack);
      throw new Error(`Template retrieval failed: ${error.message}`);
    }
  }

  /**
   * List templates for tenant
   */
  async listTemplates(tenantId: string, options: any = {}): Promise<Template[]> {
    try {
      const {
        page = 1,
        limit = 20,
        type = null,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      let query = `
        SELECT id, name, description, type, version, is_active, created_at, updated_at
        FROM templates.templates 
        WHERE tenant_id = $1 AND deleted_at IS NULL
      `;

      const params = [tenantId];

      if (type) {
        query += ` AND type = ${params.length + 1}`;
        params.push(type);
      }

      if (search) {
        query += ` AND (name ILIKE ${params.length + 1} OR description ILIKE ${params.length + 1})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ${params.length + 1} OFFSET ${params.length + 2}`;
      params.push(limit, offset);

      return await this.database.query(query, params);

    } catch (error) {
      this.logger.error(`Failed to list templates: ${error.message}`, error.stack);
      throw new Error(`Templates listing failed: ${error.message}`);
    }
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHandlebarsHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(date));
    });

    // Number formatting helper
    Handlebars.registerHelper('formatNumber', (number: number, decimals: number = 2) => {
      if (typeof number !== 'number') return '';
      return number.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      if (typeof amount !== 'number') return '';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
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
        variables.add(variable);
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
   * Process template variables with data
   */
  private processTemplateVariables(templateContent: any, data: any): any {
    const template = Handlebars.compile(JSON.stringify(templateContent));
    return JSON.parse(template(data));
  }

  /**
   * Apply Excel formatting
   */
  private applyExcelFormatting(worksheet: any, formatting: any): void {
    // Apply basic formatting - this is a simplified implementation
    if (formatting.headers) {
      // Bold headers, etc.
    }
    if (formatting.columns) {
      // Column widths, etc.
    }
  }

  /**
   * Add table to PDF
   */
  private addTableToPDF(doc: any, table: any): void {
    const startX = 50;
    let currentY = doc.y;
    const rowHeight = 20;
    const columnWidth = 100;

    // Table headers
    if (table.headers) {
      doc.font('Helvetica-Bold');
      table.headers.forEach((header: string, index: number) => {
        doc.text(header, startX + (index * columnWidth), currentY, {
          width: columnWidth,
          align: 'left'
        });
      });
      currentY += rowHeight;
    }

    // Table rows
    doc.font('Helvetica');
    table.rows.forEach((row: any[]) => {
      row.forEach((cell: any, index: number) => {
        doc.text(String(cell), startX + (index * columnWidth), currentY, {
          width: columnWidth,
          align: 'left'
        });
      });
      currentY += rowHeight;
    });

    doc.y = currentY + 10; // Add some space after table
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
      createdBy: z.string().optional()
    });

    return templateSchema.parse(data);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.database.query('SELECT 1 FROM templates.templates LIMIT 1');
      return true;
    } catch (error) {
      this.logger.error(`Templates service health check failed: ${error.message}`);
      return false;
    }
  }
}
EOF

    log_success "Templates Service generated"
}

# MANDATORY: Generate forms controller
generate_forms_controller() {
    log_info "Generating Forms Controller..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/forms/forms.controller.ts" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/controllers/forms/forms.controller.ts
// Generated: $(date)
// Phase: D2H3 - Advanced Forms & Templates System
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, FormsService, ValidationMiddleware
// Purpose: REST API controller for forms management
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { FormsService } from '../../../core/services/forms/forms.service';
import { AuditService } from '../../../core/services/audit/audit.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
  tenant?: {
    id: string;
    slug: string;
    bankingType: string;
  };
}

@Injectable()
export class FormsController {
  private readonly logger = new Logger(FormsController.name);

  constructor(
    private readonly formsService: FormsService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Create new form
   * POST /api/forms
   */
  async createForm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger.log(`Creating form for tenant: ${req.tenant?.id}`);

      const formData = {
        ...req.body,
        createdBy: req.user?.id
      };

      const form = await this.formsService.createForm(req.tenant!.id, formData);

      res.status(201).json({
        success: true,
        data: form,
        message: 'Form created successfully'
      });

    } catch (error) {
      this.logger.error(`Form creation failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Get form by ID
   * GET /api/forms/:id
   */
  async getForm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.log(`Getting form: ${id} for tenant: ${req.tenant?.id}`);

      const form = await this.formsService.getForm(req.tenant!.id, id);

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
          code: 'FORM_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: form
      });

    } catch (error) {
      this.logger.error(`Form retrieval failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Update form
   * PUT /api/forms/:id
   */
  async updateForm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.log(`Updating form: ${id} for tenant: ${req.tenant?.id}`);

      const updateData = {
        ...req.body,
        updatedBy: req.user?.id
      };

      const form = await this.formsService.updateForm(req.tenant!.id, id, updateData);

      res.json({
        success: true,
        data: form,
        message: 'Form updated successfully'
      });

    } catch (error) {
      this.logger.error(`Form update failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Delete form
   * DELETE /api/forms/:id
   */
  async deleteForm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.log(`Deleting form: ${id} for tenant: ${req.tenant?.id}`);

      await this.formsService.deleteForm(req.tenant!.id, id, req.user!.id);

      res.json({
        success: true,
        message: 'Form deleted successfully'
      });

    } catch (error) {
      this.logger.error(`Form deletion failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * List forms
   * GET /api/forms
   */
  async listForms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger.log(`Listing forms for tenant: ${req.tenant?.id}`);

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string || '',
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: req.query.sortOrder as string || 'DESC'
      };

      const forms = await this.formsService.listForms(req.tenant!.id, options);

      res.json({
        success: true,
        data: forms,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: forms.length
        }
      });

    } catch (error) {
      this.logger.error(`Forms listing failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Validate form data
   * POST /api/forms/:id/validate
   */
  async validateFormData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.log(`Validating form data for form: ${id}`);

      const validationResult = await this.formsService.validateFormData(id, {
        ...req.body,
        tenantId: req.tenant!.id
      });

      res.json({
        success: true,
        data: validationResult
      });

    } catch (error) {
      this.logger.error(`Form validation failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Submit form data
   * POST /api/forms/:id/submit
   */
  async submitForm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.log(`Submitting form: ${id} for tenant: ${req.tenant?.id}`);

      // First validate the form data
      const validationResult = await this.formsService.validateFormData(id, {
        ...req.body,
        tenantId: req.tenant!.id
      });

      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Form validation failed',
          code: 'FORM_VALIDATION_FAILED',
          details: validationResult.errors
        });
        return;
      }

      // Store form submission (you would implement this in FormsService)
      // const submission = await this.formsService.submitForm(req.tenant!.id, id, req.body, req.user!.id);

      // Log audit trail
      await this.auditService.logAction({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        action: 'FORM_SUBMITTED',
        resourceType: 'form_submission',
        resourceId: id,
        details: { formId: id }
      });

      res.json({
        success: true,
        message: 'Form submitted successfully',
        data: { formId: id, submittedAt: new Date() }
      });

    } catch (error) {
      this.logger.error(`Form submission failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Get form schema for dynamic rendering
   * GET /api/forms/:id/schema
   */
  async getFormSchema(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      this.logger.log(`Getting form schema: ${id} for tenant: ${req.tenant?.id}`);

      const form = await this.formsService.getForm(req.tenant!.id, id);

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
          code: 'FORM_NOT_FOUND'
        });
        return;
      }

      // Return only the schema information needed for rendering
      const schema = {
        id: form.id,
        name: form.name,
        description: form.description,
        schema: form.form_schema,
        fields: form.fields,
        validationRules: form.validation_rules
      };

      res.json({
        success: true,
        data: schema
      });

    } catch (error) {
      this.logger.error(`Form schema retrieval failed: ${error.message}`, error.stack);
      next(error);
    }
  }

  /**
   * Clone form
   * POST /api/forms/:id/clone
   */
  async cloneForm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      this.logger.log(`Cloning form: ${id} for tenant: ${req.tenant?.id}`);

      // Get original form
      const originalForm = await this.formsService.getForm(req.tenant!.id, id);
      
      if (!originalForm) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
          code: 'FORM_NOT_FOUND'
        });
        return;
      }

      // Create cloned form
      const clonedFormData = {
        name: name || `${originalForm.name} (Copy)`,
        description: originalForm.description,
        schema: originalForm.form_schema,
        fields: originalForm.fields,
        validationRules: originalForm.validation_rules,
        createdBy: req.user?.id
      };

      const clonedForm = await this.formsService.createForm(req.tenant!.id, clonedFormData);

      res.status(201).json({
        success: true,
        data: clonedForm,
        message: 'Form cloned successfully'
      });

    } catch (error) {
      this.logger.error(`Form cloning failed: ${error.message}`, error.stack);
      next(error);
    }
  }
}
EOF

    log_success "Forms Controller generated"
}

# MANDATORY: Main execution function
main() {
    log_info "Starting PSDD ${PHASE_NAME} setup..."
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads}
    
    # Validate environment
    validate_environment
    
    # Create directory structure
    create_directory_structure
    
    # Generate core services
    generate_forms_service
    generate_templates_service
    generate_forms_controller
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "PSDD ${PHASE_NAME} setup completed successfully!"
    log_info "Next: Run './scripts/setup/d2h3-forms-frontend-generator.sh' for frontend components"
}

# Execute main function with all arguments
main "$@"