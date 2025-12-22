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
