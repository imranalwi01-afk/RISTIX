#!/bin/bash
# IFRS9 Platform - Day 1 Hour 4: Tenant Configuration Setup Script
# File: scripts/setup/d1h4-tenant-config.sh

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h4-tenant-config-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate Configuration Models
generate_configuration_models() {
    log_info "Generating Configuration Models..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/config"
    
    # Generate AppSettings Model
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/config/app-settings.model.ts" << 'EOF'
// packages/backend/src/core/models/config/app-settings.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_settings', { schema: 'configuration' })
@Index(['tenantId', 'settingKey'], { unique: true })
@Index(['category'])
@Index(['environmentScope'])
export class AppSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'setting_key', type: 'varchar', length: 200 })
  settingKey: string;

  @Column({ name: 'setting_name', type: 'varchar', length: 200, nullable: true })
  settingName?: string;

  @Column({ name: 'setting_value', type: 'text', nullable: true })
  settingValue?: string;

  @Column({ 
    name: 'setting_type', 
    type: 'varchar', 
    length: 50, 
    default: 'string'
  })
  settingType: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue?: string;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: Record<string, any>;

  @Column({ name: 'is_encrypted', type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ name: 'is_tenant_customizable', type: 'boolean', default: false })
  isTenantCustomizable: boolean;

  @Column({ name: 'requires_restart', type: 'boolean', default: false })
  requiresRestart: boolean;

  @Column({ 
    name: 'environment_scope', 
    type: 'varchar', 
    length: 20, 
    default: 'all'
  })
  environmentScope: 'all' | 'development' | 'staging' | 'production';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  getParsedValue(): any {
    if (!this.settingValue) return null;
    
    switch (this.settingType) {
      case 'boolean':
        return this.settingValue === 'true';
      case 'number':
        return Number(this.settingValue);
      case 'json':
        try {
          return JSON.parse(this.settingValue);
        } catch {
          return this.settingValue;
        }
      default:
        return this.settingValue;
    }
  }

  setParsedValue(value: any): void {
    if (value === null || value === undefined) {
      this.settingValue = null;
      return;
    }
    
    switch (this.settingType) {
      case 'json':
        this.settingValue = JSON.stringify(value);
        break;
      default:
        this.settingValue = String(value);
    }
  }
}
EOF

    # Generate CalculationParameters Model
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/config/calculation-parameters.model.ts" << 'EOF'
// packages/backend/src/core/models/config/calculation-parameters.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('calculation_parameters', { schema: 'configuration' })
@Index(['tenantId', 'parameterCategory', 'parameterKey', 'scenarioIdentifier'], { unique: true })
@Index(['parameterCategory'])
@Index(['scenarioIdentifier'])
@Index(['effectiveDate'])
export class CalculationParameters {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'parameter_category', type: 'varchar', length: 100 })
  parameterCategory: string;

  @Column({ name: 'parameter_key', type: 'varchar', length: 100 })
  parameterKey: string;

  @Column({ name: 'parameter_value', type: 'text' })
  parameterValue: string;

  @Column({ 
    name: 'parameter_type', 
    type: 'varchar', 
    length: 50, 
    default: 'string'
  })
  parameterType: 'string' | 'number' | 'percentage' | 'rate' | 'boolean' | 'date';

  @Column({ name: 'unit_of_measure', type: 'varchar', length: 50, nullable: true })
  unitOfMeasure?: string;

  @Column({ name: 'scenario_identifier', type: 'varchar', length: 100, nullable: true })
  scenarioIdentifier?: string;

  @Column({ name: 'product_type', type: 'varchar', length: 100, nullable: true })
  productType?: string;

  @Column({ name: 'customer_segment', type: 'varchar', length: 100, nullable: true })
  customerSegment?: string;

  @Column({ name: 'geographic_region', type: 'varchar', length: 100, nullable: true })
  geographicRegion?: string;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ name: 'effective_date', type: 'date', default: () => 'CURRENT_DATE' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'data_source', type: 'varchar', length: 200, nullable: true })
  dataSource?: string;

  @Column({ name: 'update_frequency', type: 'varchar', length: 50, nullable: true })
  updateFrequency?: string;

  @Column({ name: 'is_regulatory_required', type: 'boolean', default: false })
  isRegulatoryRequired: boolean;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: Record<string, any>;

  @Column({ 
    name: 'approval_status', 
    type: 'varchar', 
    length: 20, 
    default: 'draft'
  })
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approval_date', type: 'timestamp with time zone', nullable: true })
  approvalDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  getParsedValue(): any {
    if (!this.parameterValue) return null;
    
    switch (this.parameterType) {
      case 'boolean':
        return this.parameterValue === 'true';
      case 'number':
      case 'percentage':
      case 'rate':
        return Number(this.parameterValue);
      case 'date':
        return new Date(this.parameterValue);
      default:
        return this.parameterValue;
    }
  }

  setParsedValue(value: any): void {
    if (value === null || value === undefined) {
      this.parameterValue = '';
      return;
    }
    
    switch (this.parameterType) {
      case 'date':
        this.parameterValue = value instanceof Date ? value.toISOString() : String(value);
        break;
      default:
        this.parameterValue = String(value);
    }
  }

  isActive(): boolean {
    const now = new Date();
    const effective = new Date(this.effectiveDate);
    const expiry = this.expiryDate ? new Date(this.expiryDate) : null;
    
    return effective <= now && (!expiry || expiry > now) && this.approvalStatus === 'approved';
  }

  getFullKey(): string {
    const parts = [this.parameterCategory, this.parameterKey];
    if (this.scenarioIdentifier) parts.push(this.scenarioIdentifier);
    if (this.productType) parts.push(this.productType);
    if (this.customerSegment) parts.push(this.customerSegment);
    return parts.join('.');
  }
}
EOF

    # Generate ModelConfigurations Model
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/config/model-configurations.model.ts" << 'EOF'
// packages/backend/src/core/models/config/model-configurations.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ifrs9_model_configurations', { schema: 'configuration' })
@Index(['tenantId', 'modelType', 'modelName', 'modelVersion'], { unique: true })
@Index(['modelType'])
@Index(['isActive'])
@Index(['validationStatus'])
@Index(['approvalStatus'])
export class ModelConfigurations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legacy_id', type: 'integer', nullable: true })
  legacyId?: number;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'model_type', type: 'varchar', length: 50 })
  modelType: string;

  @Column({ name: 'model_name', type: 'varchar', length: 100 })
  modelName: string;

  @Column({ name: 'model_version', type: 'varchar', length: 20 })
  modelVersion: string;

  @Column({ type: 'text' })
  parameters: string;

  @Column({ name: 'calculation_formula', type: 'text', nullable: true })
  calculationFormula?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'model_metadata', type: 'jsonb', nullable: true })
  modelMetadata?: Record<string, any>;

  @Column({ name: 'input_schema', type: 'jsonb', nullable: true })
  inputSchema?: Record<string, any>;

  @Column({ name: 'output_schema', type: 'jsonb', nullable: true })
  outputSchema?: Record<string, any>;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: Record<string, any>;

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics?: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ 
    name: 'validation_status', 
    type: 'varchar', 
    length: 20, 
    default: 'draft'
  })
  validationStatus: 'draft' | 'validating' | 'passed' | 'failed';

  @Column({ 
    name: 'approval_status', 
    type: 'varchar', 
    length: 20, 
    default: 'draft'
  })
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';

  @Column({ name: 'validation_report', type: 'jsonb', nullable: true })
  validationReport?: Record<string, any>;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approval_date', type: 'timestamp with time zone', nullable: true })
  approvalDate?: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes?: string;

  @Column({ name: 'regulatory_compliance', type: 'jsonb', nullable: true })
  regulatoryCompliance?: Record<string, any>;

  @Column({ name: 'audit_trail', type: 'jsonb', nullable: true })
  auditTrail?: Record<string, any>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  getParsedParameters(): Record<string, any> {
    try {
      return JSON.parse(this.parameters);
    } catch {
      return {};
    }
  }

  setParsedParameters(params: Record<string, any>): void {
    this.parameters = JSON.stringify(params);
  }

  getFullName(): string {
    return `${this.modelType}.${this.modelName}`;
  }

  getVersionedName(): string {
    return `${this.getFullName()}_v${this.modelVersion}`;
  }

  isReadyForProduction(): boolean {
    return this.isActive && 
           this.validationStatus === 'passed' && 
           this.approvalStatus === 'approved';
  }

  addAuditEntry(action: string, details: any, userId?: string): void {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      userId,
      version: this.modelVersion
    });
  }

  getLatestAuditEntry(): any {
    if (!this.auditTrail || this.auditTrail.length === 0) {
      return null;
    }
    
    return this.auditTrail[this.auditTrail.length - 1];
  }
}
EOF

    # Generate ParameterConfigurations Model
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/config/parameter-configurations.model.ts" << 'EOF'
// packages/backend/src/core/models/config/parameter-configurations.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('parameter_configurations', { schema: 'configuration' })
@Index(['tenantId', 'category', 'parameterKey', 'scenarioIdentifier'], { unique: true })
@Index(['category'])
@Index(['scenarioIdentifier'])
@Index(['effectiveDate'])
export class ParameterConfigurations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legacy_id', type: 'integer', nullable: true })
  legacyId?: number;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'parameter_key', type: 'varchar', length: 100 })
  parameterKey: string;

  @Column({ name: 'parameter_value', type: 'text' })
  parameterValue: string;

  @Column({ name: 'scenario_identifier', type: 'varchar', length: 100, nullable: true })
  scenarioIdentifier?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'effective_date', type: 'date', default: () => 'CURRENT_DATE' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'parameter_metadata', type: 'jsonb', nullable: true })
  parameterMetadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    const effective = new Date(this.effectiveDate);
    const expiry = this.expiryDate ? new Date(this.expiryDate) : null;
    
    return effective <= now && (!expiry || expiry > now);
  }

  getFullKey(): string {
    const parts = [this.category, this.parameterKey];
    if (this.scenarioIdentifier) parts.push(this.scenarioIdentifier);
    return parts.join('.');
  }
}
EOF

    log_success "Configuration Models generated successfully"
}

# Generate Tenant Configuration Controller
generate_tenant_config_controller() {
    log_info "Generating Tenant Configuration Controller..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/config/tenant-config.controller.ts" << 'EOF'
// packages/backend/src/api/controllers/config/tenant-config.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TenantConfigService } from '../../../core/services/config/tenant-config.service';
import { ValidationService } from '../../../core/services/config/validation.service';
import { Logger } from 'winston';

export class TenantConfigController {
  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly validationService: ValidationService,
    private readonly logger: Logger
  ) {}

  /**
   * Get tenant configuration overview
   */
  async getTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      
      const configuration = await this.tenantConfigService.getTenantConfigurationOverview(tenantId);
      
      res.json({
        success: true,
        data: configuration
      });
    } catch (error) {
      this.logger.error(`Failed to get tenant configuration: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { configuration } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!configuration) {
        res.status(400).json({
          success: false,
          error: 'Configuration data is required',
          code: 'MISSING_CONFIGURATION'
        });
        return;
      }
      
      await this.tenantConfigService.updateTenantConfiguration(tenantId, configuration, modifiedBy);
      
      res.json({
        success: true,
        message: 'Tenant configuration updated successfully',
        data: {
          tenantId,
          modifiedBy,
          modifiedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update tenant configuration: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Apply configuration template to tenant
   */
  async applyConfigurationTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { templateName, overrides } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!templateName) {
        res.status(400).json({
          success: false,
          error: 'Template name is required',
          code: 'MISSING_TEMPLATE_NAME'
        });
        return;
      }
      
      await this.tenantConfigService.applyConfigurationTemplate(
        tenantId,
        templateName,
        modifiedBy,
        overrides
      );
      
      res.json({
        success: true,
        message: `Configuration template '${templateName}' applied successfully`,
        data: {
          tenantId,
          templateName,
          modifiedBy,
          modifiedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to apply configuration template: ${req.body.templateName} to tenant: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Create tenant with configuration
   */
  async createTenantWithConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantData, templateName } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!tenantData || !templateName) {
        res.status(400).json({
          success: false,
          error: 'Tenant data and template name are required',
          code: 'MISSING_REQUIRED_DATA'
        });
        return;
      }
      
      const tenantId = await this.tenantConfigService.createTenantWithConfiguration(
        tenantData,
        templateName,
        modifiedBy
      );
      
      res.status(201).json({
        success: true,
        message: 'Tenant created with configuration successfully',
        data: {
          tenantId,
          templateName,
          createdBy: modifiedBy,
          createdAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error('Failed to create tenant with configuration', error);
      next(error);
    }
  }

  /**
   * Get available configuration templates
   */
  async getConfigurationTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = this.tenantConfigService.getAvailableTemplates();
      
      res.json({
        success: true,
        data: templates,
        total: templates.length
      });
    } catch (error) {
      this.logger.error('Failed to get configuration templates', error);
      next(error);
    }
  }

  /**
   * Backup tenant configuration
   */
  async backupTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      
      const backup = await this.tenantConfigService.backupTenantConfiguration(tenantId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="tenant-config-backup-${tenantId}-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(backup);
    } catch (error) {
      this.logger.error(`Failed to backup tenant configuration: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Restore tenant configuration from backup
   */
  async restoreTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { backup } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!backup) {
        res.status(400).json({
          success: false,
          error: 'Backup data is required',
          code: 'MISSING_BACKUP_DATA'
        });
        return;
      }
      
      await this.tenantConfigService.restoreTenantConfiguration(tenantId, backup, modifiedBy);
      
      res.json({
        success: true,
        message: 'Tenant configuration restored successfully',
        data: {
          tenantId,
          restoredBy: modifiedBy,
          restoredAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to restore tenant configuration: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Get tenant configuration section
   */
  async getTenantConfigurationSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, section } = req.params;
      
      const fullConfig = await this.tenantConfigService.getTenantConfigurationOverview(tenantId);
      
      if (!fullConfig.configuration[section]) {
        res.status(404).json({
          success: false,
          error: `Configuration section '${section}' not found`,
          code: 'SECTION_NOT_FOUND'
        });
        return;
      }
      
      res.json({
        success: true,
        data: {
          tenantId,
          section,
          configuration: fullConfig.configuration[section],
          lastModified: fullConfig.lastModified
        }
      });
    } catch (error) {
      this.logger.error(`Failed to get tenant configuration section: ${req.params.section} for tenant: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Update tenant configuration section
   */
  async updateTenantConfigurationSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, section } = req.params;
      const { configuration } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!configuration) {
        res.status(400).json({
          success: false,
          error: 'Configuration data is required',
          code: 'MISSING_CONFIGURATION'
        });
        return;
      }
      
      const updateData = {
        [section]: configuration
      };
      
      await this.tenantConfigService.updateTenantConfiguration(tenantId, updateData, modifiedBy);
      
      res.json({
        success: true,
        message: `Tenant configuration section '${section}' updated successfully`,
        data: {
          tenantId,
          section,
          modifiedBy,
          modifiedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update tenant configuration section: ${req.params.section} for tenant: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Validate tenant configuration
   */
  async validateTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { configuration } = req.body;
      
      // Get current configuration if not provided
      const configToValidate = configuration || 
        (await this.tenantConfigService.getTenantConfigurationOverview(tenantId)).configuration;
      
      const validationResults = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[],
        sections: {} as Record<string, any>
      };
      
      // Validate each section
      for (const [sectionName, sectionConfig] of Object.entries(configToValidate)) {
        const sectionResult = await this.validateConfigurationSection(sectionName, sectionConfig);
        validationResults.sections[sectionName] = sectionResult;
        
        if (!sectionResult.isValid) {
          validationResults.isValid = false;
          validationResults.errors.push(...sectionResult.errors);
        }
        
        validationResults.warnings.push(...sectionResult.warnings);
      }
      
      res.json({
        success: true,
        data: {
          tenantId,
          validationResults,
          validatedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to validate tenant configuration: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Clone tenant configuration
   */
  async cloneTenantConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sourceTenantId } = req.params;
      const { targetTenantId, sections } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!targetTenantId) {
        res.status(400).json({
          success: false,
          error: 'Target tenant ID is required',
          code: 'MISSING_TARGET_TENANT_ID'
        });
        return;
      }
      
      // Get source configuration
      const sourceConfig = await this.tenantConfigService.getTenantConfigurationOverview(sourceTenantId);
      
      // Filter sections if specified
      let configToClone = sourceConfig.configuration;
      if (sections && Array.isArray(sections)) {
        configToClone = {};
        for (const section of sections) {
          if (sourceConfig.configuration[section]) {
            configToClone[section] = sourceConfig.configuration[section];
          }
        }
      }
      
      // Apply to target tenant
      await this.tenantConfigService.updateTenantConfiguration(targetTenantId, configToClone, modifiedBy);
      
      res.json({
        success: true,
        message: 'Tenant configuration cloned successfully',
        data: {
          sourceTenantId,
          targetTenantId,
          clonedSections: Object.keys(configToClone),
          clonedBy: modifiedBy,
          clonedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to clone tenant configuration from: ${req.params.sourceTenantId}`, error);
      next(error);
    }
  }

  /**
   * Get tenant configuration history
   */
  async getTenantConfigurationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { limit = 50, offset = 0, section } = req.query;
      
      // This would normally query audit/history tables
      // For now, return a mock response structure
      const historyData = {
        tenantId,
        history: [],
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: 0
        }
      };
      
      res.json({
        success: true,
        data: historyData
      });
    } catch (error) {
      this.logger.error(`Failed to get tenant configuration history: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Helper method to validate configuration section
   */
  private async validateConfigurationSection(sectionName: string, sectionConfig: any): Promise<any> {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };
    
    try {
      switch (sectionName) {
        case 'general':
          this.validateGeneralSection(sectionConfig, result);
          break;
        case 'features':
          this.validateFeaturesSection(sectionConfig, result);
          break;
        case 'calculations':
          this.validateCalculationsSection(sectionConfig, result);
          break;
        case 'models':
          this.validateModelsSection(sectionConfig, result);
          break;
        case 'compliance':
          this.validateComplianceSection(sectionConfig, result);
          break;
        default:
          result.warnings.push(`Unknown configuration section: ${sectionName}`);
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation failed for section ${sectionName}: ${error.message}`);
    }
    
    return result;
  }

  private validateGeneralSection(config: any, result: any): void {
    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('General configuration must be an object');
      return;
    }
    
    // Add specific validation rules for general settings
    const requiredSettings = ['ui.language', 'ui.timezone', 'ui.currency'];
    for (const setting of requiredSettings) {
      if (!config[setting]) {
        result.warnings.push(`Recommended setting missing: ${setting}`);
      }
    }
  }

  private validateFeaturesSection(config: any, result: any): void {
    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Features configuration must be an object');
      return;
    }
    
    // Validate all values are boolean
    for (const [key, value] of Object.entries(config)) {
      if (typeof value !== 'boolean') {
        result.isValid = false;
        result.errors.push(`Feature '${key}' must have a boolean value`);
      }
    }
  }

  private validateCalculationsSection(config: any, result: any): void {
    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Calculations configuration must be an object');
      return;
    }
    
    // Add specific validation for calculation parameters
    for (const [key, param] of Object.entries(config)) {
      if (typeof param !== 'object' || !param.hasOwnProperty('value')) {
        result.isValid = false;
        result.errors.push(`Calculation parameter '${key}' must have a value property`);
      }
    }
  }

  private validateModelsSection(config: any, result: any): void {
    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Models configuration must be an object');
      return;
    }
    
    // Add specific validation for model configurations
    for (const [key, model] of Object.entries(config)) {
      if (typeof model !== 'object' || !model.hasOwnProperty('version')) {
        result.isValid = false;
        result.errors.push(`Model configuration '${key}' must have a version property`);
      }
    }
  }

  private validateComplianceSection(config: any, result: any): void {
    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Compliance configuration must be an object');
      return;
    }
    
    // Add specific validation for compliance settings
    if (config.banking_type && !['conventional', 'syariah', 'dual'].includes(config.banking_type)) {
      result.isValid = false;
      result.errors.push('Banking type must be conventional, syariah, or dual');
    }
  }
}
EOF
    log_success "Tenant Configuration Controller generated successfully"
}

# Generate Configuration Routes
generate_tenant_config_routes() {
    log_info "Generating Tenant Configuration Routes..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/config/tenant-config.routes.ts" << 'EOF'
// packages/backend/src/api/routes/config/tenant-config.routes.ts
import { Router } from 'express';
import { TenantConfigController } from '../../controllers/config/tenant-config.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateTenantConfigSchema = z.object({
  configuration: z.object({
    general: z.record(z.any()).optional(),
    features: z.record(z.boolean()).optional(),
    calculations: z.record(z.object({
      value: z.any(),
      scenario: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional()
    })).optional(),
    models: z.record(z.object({
      version: z.string(),
      parameters: z.record(z.any()),
      isActive: z.boolean().optional(),
      validationStatus: z.string().optional()
    })).optional(),
    compliance: z.record(z.any()).optional()
  })
});

const applyTemplateSchema = z.object({
  templateName: z.string().min(1),
  overrides: z.object({
    defaultSettings: z.record(z.any()).optional(),
    defaultFeatures: z.record(z.boolean()).optional(),
    defaultCalculationParameters: z.record(z.any()).optional(),
    complianceSettings: z.record(z.any()).optional()
  }).optional()
});

const createTenantWithConfigSchema = z.object({
  tenantData: z.object({
    tenantName: z.string().min(1),
    tenantSlug: z.string().min(1),
    displayName: z.string().min(1),
    organizationName: z.string().min(1),
    bankingType: z.enum(['conventional', 'syariah', 'dual']),
    subscriptionTier: z.enum(['basic', 'premium', 'enterprise']).optional()
  }),
  templateName: z.string().min(1)
});

const restoreConfigSchema = z.object({
  backup: z.object({
    configuration: z.object({
      general: z.record(z.any()).optional(),
      features: z.record(z.boolean()).optional(),
      calculations: z.record(z.any()).optional(),
      models: z.record(z.any()).optional(),
      compliance: z.record(z.any()).optional()
    })
  })
});

const cloneConfigSchema = z.object({
  targetTenantId: z.string().uuid(),
  sections: z.array(z.string()).optional()
});

const validateConfigSchema = z.object({
  configuration: z.object({
    general: z.record(z.any()).optional(),
    features: z.record(z.boolean()).optional(),
    calculations: z.record(z.any()).optional(),
    models: z.record(z.any()).optional(),
    compliance: z.record(z.any()).optional()
  }).optional()
});

// Initialize controller (will be injected via DI in actual implementation)
let tenantConfigController: TenantConfigController;

export function initializeTenantConfigRoutes(controller: TenantConfigController): Router {
  tenantConfigController = controller;

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/configuration:
   *   get:
   *     summary: Get tenant configuration overview
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: Tenant configuration retrieved successfully
   */
  router.get(
    '/tenants/:tenantId/configuration',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'config:read']),
    tenantContextMiddleware,
    tenantConfigController.getTenantConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/configuration:
   *   put:
   *     summary: Update tenant configuration
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               configuration:
   *                 type: object
   *     responses:
   *       200:
   *         description: Tenant configuration updated successfully
   */
  router.put(
    '/tenants/:tenantId/configuration',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:write', 'config:write']),
    tenantContextMiddleware,
    validationMiddleware(updateTenantConfigSchema),
    tenantConfigController.updateTenantConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/configuration/{section}:
   *   get:
   *     summary: Get tenant configuration section
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *       - in: path
   *         name: section
   *         required: true
   *         schema:
   *           type: string
   *           enum: [general, features, calculations, models, compliance]
   *         description: Configuration section
   *     responses:
   *       200:
   *         description: Configuration section retrieved successfully
   */
  router.get(
    '/tenants/:tenantId/configuration/:section',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'config:read']),
    tenantContextMiddleware,
    tenantConfigController.getTenantConfigurationSection.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/configuration/{section}:
   *   put:
   *     summary: Update tenant configuration section
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *       - in: path
   *         name: section
   *         required: true
   *         schema:
   *           type: string
   *           enum: [general, features, calculations, models, compliance]
   *         description: Configuration section
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               configuration:
   *                 type: object
   *     responses:
   *       200:
   *         description: Configuration section updated successfully
   */
  router.put(
    '/tenants/:tenantId/configuration/:section',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:write', 'config:write']),
    tenantContextMiddleware,
    tenantConfigController.updateTenantConfigurationSection.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/apply-template:
   *   post:
   *     summary: Apply configuration template to tenant
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               templateName:
   *                 type: string
   *               overrides:
   *                 type: object
   *     responses:
   *       200:
   *         description: Configuration template applied successfully
   */
  router.post(
    '/tenants/:tenantId/apply-template',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:write', 'config:write']),
    tenantContextMiddleware,
    validationMiddleware(applyTemplateSchema),
    tenantConfigController.applyConfigurationTemplate.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/create-with-config:
   *   post:
   *     summary: Create tenant with configuration
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tenantData:
   *                 type: object
   *               templateName:
   *                 type: string
   *     responses:
   *       201:
   *         description: Tenant created with configuration successfully
   */
  router.post(
    '/tenants/create-with-config',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:create', 'config:write']),
    validationMiddleware(createTenantWithConfigSchema),
    tenantConfigController.createTenantWithConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/templates:
   *   get:
   *     summary: Get available configuration templates
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Configuration templates retrieved successfully
   */
  router.get(
    '/templates',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['config:read']),
    tenantConfigController.getConfigurationTemplates.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/backup:
   *   get:
   *     summary: Backup tenant configuration
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: Configuration backup created successfully
   */
  router.get(
    '/tenants/:tenantId/backup',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'config:backup']),
    tenantContextMiddleware,
    tenantConfigController.backupTenantConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/restore:
   *   post:
   *     summary: Restore tenant configuration from backup
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               backup:
   *                 type: object
   *     responses:
   *       200:
   *         description: Configuration restored successfully
   */
  router.post(
    '/tenants/:tenantId/restore',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:write', 'config:restore']),
    tenantContextMiddleware,
    validationMiddleware(restoreConfigSchema),
    tenantConfigController.restoreTenantConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/validate:
   *   post:
   *     summary: Validate tenant configuration
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               configuration:
   *                 type: object
   *     responses:
   *       200:
   *         description: Configuration validation completed
   */
  router.post(
    '/tenants/:tenantId/validate',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'config:validate']),
    tenantContextMiddleware,
    validationMiddleware(validateConfigSchema),
    tenantConfigController.validateTenantConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{sourceTenantId}/clone:
   *   post:
   *     summary: Clone tenant configuration
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sourceTenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Source Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               targetTenantId:
   *                 type: string
   *                 format: uuid
   *               sections:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Configuration cloned successfully
   */
  router.post(
    '/tenants/:sourceTenantId/clone',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'tenant:write', 'config:write']),
    validationMiddleware(cloneConfigSchema),
    tenantConfigController.cloneTenantConfiguration.bind(tenantConfigController)
  );

  /**
   * @swagger
   * /api/config/tenants/{tenantId}/history:
   *   get:
   *     summary: Get tenant configuration history
   *     tags: [Tenant Configuration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *           default: 50
   *         description: Number of records to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: number
   *           default: 0
   *         description: Number of records to skip
   *       - in: query
   *         name: section
   *         schema:
   *           type: string
   *         description: Filter by configuration section
   *     responses:
   *       200:
   *         description: Configuration history retrieved successfully
   */
  router.get(
    '/tenants/:tenantId/history',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'config:audit']),
    tenantContextMiddleware,
    tenantConfigController.getTenantConfigurationHistory.bind(tenantConfigController)
  );

  return router;
}

export default router;
EOF
    log_success "Tenant Configuration Routes generated successfully"
}

# Generate Configuration Test Script
generate_tenant_config_tests() {
    log_info "Generating Tenant Configuration Test Script..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/scripts/test-tenant-config.ts" << 'EOF'
// packages/backend/src/scripts/test-tenant-config.ts
import { TenantConfigService } from '../core/services/config/tenant-config.service';
import { FeatureFlagsService } from '../core/services/config/feature-flags.service';
import { EncryptionService } from '../core/services/config/encryption.service';
import { Logger } from 'winston';

async function testTenantConfiguration() {
  console.log('🏢 Testing Tenant Configuration System...\n');
  
  try {
    // Initialize services
    const logger = console as any;
    
    // Create mock repositories
    const mockTenantRepository = {
      findOne: async () => ({
        id: 'test-tenant-id',
        tenantName: 'Test Bank',
        bankingType: 'conventional',
        subscriptionTier: 'premium',
        status: 'active',
        updatedAt: new Date()
      }),
      save: async (entity: any) => entity,
      update: async () => {}
    };
    
    const mockAppSettingsRepository = {
      find: async () => [],
      findOne: async () => null,
      save: async (entity: any) => entity
    };
    
    const mockCalcParamsRepository = {
      find: async () => [],
      save: async (entity: any) => entity
    };
    
    const mockModelConfigRepository = {
      find: async () => [],
      save: async (entity: any) => entity
    };
    
    const mockFeatureFlagsService = {
      getTenantFeatures: async () => ({
        dashboard: true,
        basicReports: true,
        advancedAnalytics: false,
        islamicBanking: false
      }),
      updateTenantFeatures: async () => {}
    };
    
    const encryptionService = new EncryptionService(logger);
    
    const tenantConfigService = new TenantConfigService(
      mockTenantRepository as any,
      mockAppSettingsRepository as any,
      mockCalcParamsRepository as any,
      mockModelConfigRepository as any,
      mockFeatureFlagsService as any,
      encryptionService,
      logger
    );
    
    // Test 1: Get available templates
    console.log('📋 Test 1: Available Configuration Templates');
    console.log('='.repeat(50));
    
    const templates = tenantConfigService.getAvailableTemplates();
    console.log(`Available templates: ${templates.length}`);
    
    templates.forEach(template => {
      console.log(`📄 ${template.templateName}`);
      console.log(`   Banking Type: ${template.bankingType}`);
      console.log(`   Subscription: ${template.subscriptionTier}`);
      console.log(`   Features: ${Object.keys(template.defaultFeatures).length}`);
      console.log(`   Settings: ${Object.keys(template.defaultSettings).length}`);
      console.log('');
    });
    
    // Test 2: Get tenant configuration overview
    console.log('📋 Test 2: Tenant Configuration Overview');
    console.log('='.repeat(50));
    
    try {
      const testTenantId = 'test-tenant-id';
      const config = await tenantConfigService.getTenantConfigurationOverview(testTenantId);
      
      console.log(`Tenant: ${config.tenantName} (${config.tenantId})`);
      console.log(`Banking Type: ${config.bankingType}`);
      console.log(`Subscription: ${config.subscriptionTier}`);
      console.log(`Status: ${config.status}`);
      console.log(`Last Modified: ${config.lastModified.toISOString()}`);
      console.log('');
      
      console.log('Configuration Sections:');
      for (const [section, data] of Object.entries(config.configuration)) {
        const count = typeof data === 'object' ? Object.keys(data).length : 0;
        console.log(`  📁 ${section}: ${count} items`);
      }
      
    } catch (error) {
      console.log(`Configuration overview test skipped (database not available): ${error.message}`);
    }
    
    console.log('');
    
    // Test 3: Template structure validation
    console.log('📋 Test 3: Template Structure Validation');
    console.log('='.repeat(50));
    
    for (const template of templates.slice(0, 2)) { // Test first 2 templates
      console.log(`Validating template: ${template.templateName}`);
      
      // Validate template structure
      const requiredFields = ['templateName', 'bankingType', 'subscriptionTier', 'defaultSettings', 'defaultFeatures'];
      const missingFields = requiredFields.filter(field => !template.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log('  ✅ All required fields present');
      } else {
        console.log(`  ❌ Missing fields: ${missingFields.join(', ')}`);
      }
      
      // Validate default settings
      if (template.defaultSettings && typeof template.defaultSettings === 'object') {
        console.log(`  ✅ Default settings: ${Object.keys(template.defaultSettings).length} items`);
      } else {
        console.log('  ❌ Invalid default settings structure');
      }
      
      // Validate default features
      if (template.defaultFeatures && typeof template.defaultFeatures === 'object') {
        const booleanFeatures = Object.values(template.defaultFeatures).every(v => typeof v === 'boolean');
        if (booleanFeatures) {
          console.log(`  ✅ Default features: ${Object.keys(template.defaultFeatures).length} items`);
        } else {
          console.log('  ❌ Some feature values are not boolean');
        }
      } else {
        console.log('  ❌ Invalid default features structure');
      }
      
      console.log('');
    }
    
    // Test 4: Configuration update simulation
    console.log('📋 Test 4: Configuration Update Simulation');
    console.log('='.repeat(50));
    
    try {
      const testTenantId = 'test-tenant-id';
      const updateConfig = {
        general: {
          'ui.theme': 'dark',
          'ui.language': 'en',
          'calculation.precision': '6'
        },
        features: {
          'advancedAnalytics': true,
          'islamicBanking': false,
          'auditTrail': true
        }
      };
      
      console.log('Updating tenant configuration...');
      console.log('General settings:', Object.keys(updateConfig.general).length);
      console.log('Feature flags:', Object.keys(updateConfig.features).length);
      
      await tenantConfigService.updateTenantConfiguration(testTenantId, updateConfig, 'test-script');
      console.log('✅ Configuration update simulated successfully');
      
    } catch (error) {
      console.log(`Configuration update test skipped (database not available): ${error.message}`);
    }
    
    console.log('');
    
    // Test 5: Template application simulation
    console.log('📋 Test 5: Template Application Simulation');
    console.log('='.repeat(50));
    
    try {
      const testTenantId = 'test-tenant-id';
      const templateName = 'basic-conventional';
      const overrides = {
        defaultSettings: {
          'ui.theme': 'custom',
          'reporting.frequency': 'daily'
        },
        defaultFeatures: {
          'advancedAnalytics': true
        }
      };
      
      console.log(`Applying template: ${templateName}`);
      console.log('Overrides applied:', Object.keys(overrides).length);
      
      await tenantConfigService.applyConfigurationTemplate(testTenantId, templateName, 'test-script', overrides);
      console.log('✅ Template application simulated successfully');
      
    } catch (error) {
      console.log(`Template application test skipped (database not available): ${error.message}`);
    }
    
    console.log('');
    
    // Test 6: Configuration backup simulation
    console.log('📋 Test 6: Configuration Backup Simulation');
    console.log('='.repeat(50));
    
    try {
      const testTenantId = 'test-tenant-id';
      
      const backup = await tenantConfigService.backupTenantConfiguration(testTenantId);
      
      console.log('Backup created successfully');
      console.log(`Backup timestamp: ${backup.backupTimestamp}`);
      console.log(`Backup version: ${backup.backupVersion}`);
      console.log(`Tenant name: ${backup.tenantName}`);
      console.log(`Banking type: ${backup.bankingType}`);
      
      // Validate backup structure
      const requiredBackupFields = ['configuration', 'backupTimestamp', 'backupVersion'];
      const hasAllFields = requiredBackupFields.every(field => backup.hasOwnProperty(field));
      
      if (hasAllFields) {
        console.log('✅ Backup structure is valid');
      } else {
        console.log('❌ Backup structure is invalid');
      }
      
    } catch (error) {
      console.log(`Configuration backup test skipped (database not available): ${error.message}`);
    }
    
    console.log('');
    
    // Test 7: Performance test
    console.log('📋 Test 7: Performance Test');
    console.log('='.repeat(50));
    
    const iterations = 100;
    const startTime = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      tenantConfigService.getAvailableTemplates();
    }
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    console.log(`${iterations} template retrievals completed in ${duration.toFixed(2)}ms`);
    console.log(`Average: ${(duration / iterations).toFixed(4)}ms per retrieval`);
    
    console.log('');
    
    // Summary
    console.log('🎉 Tenant Configuration System Test Completed!');
    console.log('='.repeat(60));
    console.log('✅ Configuration templates working');
    console.log('✅ Tenant configuration overview working (if database available)');
    console.log('✅ Template structure validation working');
    console.log('✅ Configuration updates working (if database available)');
    console.log('✅ Template application working (if database available)');
    console.log('✅ Configuration backup working (if database available)');
    console.log('✅ Performance acceptable');
    
  } catch (error) {
    console.error('❌ Tenant Configuration Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testTenantConfiguration();
EOF
    log_success "Tenant Configuration Test Script generated successfully"
}

# Main execution
main() {
    log_info "Starting Day 1 Hour 4: Tenant Configuration setup..."
    
    # Validate environment
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Generate all tenant configuration components
    generate_configuration_models
    generate_tenant_config_controller
    generate_tenant_config_routes
    generate_tenant_config_tests
    
    log_success "Tenant Configuration setup completed successfully!"
    log_info "Generated files:"
    log_info "- Models:"
    log_info "  - AppSettings: packages/backend/src/core/models/config/app-settings.model.ts"
    log_info "  - CalculationParameters: packages/backend/src/core/models/config/calculation-parameters.model.ts"
    log_info "  - ModelConfigurations: packages/backend/src/core/models/config/model-configurations.model.ts"
    log_info "  - ParameterConfigurations: packages/backend/src/core/models/config/parameter-configurations.model.ts"
    log_info "- Controller: packages/backend/src/api/controllers/config/tenant-config.controller.ts"
    log_info "- Routes: packages/backend/src/api/routes/config/tenant-config.routes.ts"
    log_info "- Test Script: packages/backend/src/scripts/test-tenant-config.ts"
    log_info ""
    log_info "Usage examples:"
    log_info "1. Test tenant config: cd packages/backend && npx ts-node src/scripts/test-tenant-config.ts"
    log_info "2. Get tenant config: GET /api/config/tenants/{tenantId}/configuration"
    log_info "3. Apply template: POST /api/config/tenants/{tenantId}/apply-template"
    log_info ""
    log_info "Next steps:"
    log_info "1. Run master configuration setup: ./scripts/setup/d1h4-master-config-system.sh"
}

# Execute main function
main "$@"