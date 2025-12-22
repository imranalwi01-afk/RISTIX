// packages/backend/src/core/services/config/tenant-config.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenants } from '../../models/tenant.model';
import { AppSettings } from '../../models/config/app-settings.model';
import { CalculationParameters } from '../../models/config/calculation-parameters.model';
import { ModelConfigurations } from '../../models/config/model-configurations.model';
import { FeatureFlagsService } from './feature-flags.service';
import { EncryptionService } from './encryption.service';
import { Logger } from 'winston';

export interface TenantConfigurationOverview {
  tenantId: string;
  tenantName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  subscriptionTier: string;
  status: string;
  configuration: {
    general: Record<string, any>;
    features: Record<string, boolean>;
    calculations: Record<string, any>;
    models: Record<string, any>;
    compliance: Record<string, any>;
  };
  lastModified: Date;
}

export interface TenantConfigurationTemplate {
  templateName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  defaultSettings: Record<string, any>;
  defaultFeatures: Record<string, boolean>;
  defaultCalculationParameters: Record<string, any>;
  complianceSettings: Record<string, any>;
}

@Injectable()
export class TenantConfigService {
  private configTemplates: Map<string, TenantConfigurationTemplate> = new Map();

  constructor(
    @InjectRepository(Tenants)
    private readonly tenantsRepository: Repository<Tenants>,
    
    @InjectRepository(AppSettings)
    private readonly appSettingsRepository: Repository<AppSettings>,
    
    @InjectRepository(CalculationParameters)
    private readonly calculationParametersRepository: Repository<CalculationParameters>,
    
    @InjectRepository(ModelConfigurations)
    private readonly modelConfigurationsRepository: Repository<ModelConfigurations>,
    
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly encryptionService: EncryptionService,
    private readonly logger: Logger
  ) {
    this.initializeConfigurationTemplates();
  }

  /**
   * Get tenant configuration overview
   */
  async getTenantConfigurationOverview(tenantId: string): Promise<TenantConfigurationOverview> {
    try {
      // Get tenant basic info
      const tenant = await this.tenantsRepository.findOne({
        where: { id: tenantId }
      });
      
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }
      
      // Get configuration sections
      const [general, features, calculations, models, compliance] = await Promise.all([
        this.getGeneralConfiguration(tenantId),
        this.featureFlagsService.getTenantFeatures(tenantId),
        this.getCalculationConfiguration(tenantId),
        this.getModelConfiguration(tenantId),
        this.getComplianceConfiguration(tenantId)
      ]);
      
      return {
        tenantId,
        tenantName: tenant.tenantName,
        bankingType: tenant.bankingType,
        subscriptionTier: tenant.subscriptionTier,
        status: tenant.status,
        configuration: {
          general,
          features,
          calculations,
          models,
          compliance
        },
        lastModified: tenant.updatedAt
      };
    } catch (error) {
      this.logger.error(`Failed to get tenant configuration overview for: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenantConfiguration(
    tenantId: string,
    configuration: Partial<TenantConfigurationOverview['configuration']>,
    modifiedBy: string
  ): Promise<void> {
    try {
      // Update general settings
      if (configuration.general) {
        await this.updateGeneralConfiguration(tenantId, configuration.general, modifiedBy);
      }
      
      // Update features
      if (configuration.features) {
        await this.featureFlagsService.updateTenantFeatures(tenantId, configuration.features, modifiedBy);
      }
      
      // Update calculation parameters
      if (configuration.calculations) {
        await this.updateCalculationConfiguration(tenantId, configuration.calculations, modifiedBy);
      }
      
      // Update model configurations
      if (configuration.models) {
        await this.updateModelConfiguration(tenantId, configuration.models, modifiedBy);
      }
      
      // Update compliance settings
      if (configuration.compliance) {
        await this.updateComplianceConfiguration(tenantId, configuration.compliance, modifiedBy);
      }
      
      // Update tenant's updated timestamp
      await this.tenantsRepository.update(tenantId, {
        updatedAt: new Date(),
        updatedBy: modifiedBy
      });
      
      this.logger.info(`Tenant configuration updated for: ${tenantId} by ${modifiedBy}`);
    } catch (error) {
      this.logger.error(`Failed to update tenant configuration for: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Apply configuration template to tenant
   */
  async applyConfigurationTemplate(
    tenantId: string,
    templateName: string,
    modifiedBy: string,
    overrides: Partial<TenantConfigurationTemplate> = {}
  ): Promise<void> {
    try {
      const template = this.configTemplates.get(templateName);
      if (!template) {
        throw new Error(`Configuration template not found: ${templateName}`);
      }
      
      // Merge template with overrides
      const finalConfig = {
        ...template,
        ...overrides,
        defaultSettings: { ...template.defaultSettings, ...overrides.defaultSettings },
        defaultFeatures: { ...template.defaultFeatures, ...overrides.defaultFeatures },
        defaultCalculationParameters: { ...template.defaultCalculationParameters, ...overrides.defaultCalculationParameters },
        complianceSettings: { ...template.complianceSettings, ...overrides.complianceSettings }
      };
      
      // Apply configuration
      await this.updateTenantConfiguration(tenantId, {
        general: finalConfig.defaultSettings,
        features: finalConfig.defaultFeatures,
        calculations: finalConfig.defaultCalculationParameters,
        compliance: finalConfig.complianceSettings
      }, modifiedBy);
      
      this.logger.info(`Configuration template '${templateName}' applied to tenant: ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to apply configuration template to tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Create new tenant with configuration
   */
  async createTenantWithConfiguration(
    tenantData: Partial<Tenants>,
    templateName: string,
    modifiedBy: string
  ): Promise<string> {
    try {
      // Create tenant
      const tenant = new Tenants();
      Object.assign(tenant, tenantData);
      tenant.createdAt = new Date();
      tenant.updatedAt = new Date();
      tenant.createdBy = modifiedBy;
      tenant.updatedBy = modifiedBy;
      
      const savedTenant = await this.tenantsRepository.save(tenant);
      
      // Apply configuration template
      await this.applyConfigurationTemplate(savedTenant.id, templateName, modifiedBy);
      
      this.logger.info(`Tenant created with configuration: ${savedTenant.id}`);
      return savedTenant.id;
    } catch (error) {
      this.logger.error('Failed to create tenant with configuration', error);
      throw error;
    }
  }

  /**
   * Backup tenant configuration
   */
  async backupTenantConfiguration(tenantId: string): Promise<any> {
    try {
      const configuration = await this.getTenantConfigurationOverview(tenantId);
      
      return {
        ...configuration,
        backupTimestamp: new Date(),
        backupVersion: '1.0'
      };
    } catch (error) {
      this.logger.error(`Failed to backup tenant configuration for: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Restore tenant configuration from backup
   */
  async restoreTenantConfiguration(
    tenantId: string,
    backup: any,
    modifiedBy: string
  ): Promise<void> {
    try {
      if (!backup.configuration) {
        throw new Error('Invalid backup format');
      }
      
      await this.updateTenantConfiguration(tenantId, backup.configuration, modifiedBy);
      
      this.logger.info(`Tenant configuration restored for: ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to restore tenant configuration for: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get available configuration templates
   */
  getAvailableTemplates(): TenantConfigurationTemplate[] {
    return Array.from(this.configTemplates.values());
  }

  /**
   * Private helper methods
   */
  private async getGeneralConfiguration(tenantId: string): Promise<Record<string, any>> {
    const settings = await this.appSettingsRepository.find({
      where: {
        tenantId,
        category: 'general'
      }
    });
    
    const config: Record<string, any> = {};
    for (const setting of settings) {
      config[setting.settingKey] = this.parseConfigValue(setting.settingValue, setting.settingType);
    }
    
    return config;
  }

  private async getCalculationConfiguration(tenantId: string): Promise<Record<string, any>> {
    const parameters = await this.calculationParametersRepository.find({
      where: { tenantId }
    });
    
    const config: Record<string, any> = {};
    for (const param of parameters) {
      const key = `${param.parameterCategory}.${param.parameterKey}`;
      config[key] = {
        value: this.parseConfigValue(param.parameterValue, param.parameterType),
        scenario: param.scenarioIdentifier,
        effectiveDate: param.effectiveDate,
        expiryDate: param.expiryDate
      };
    }
    
    return config;
  }

  private async getModelConfiguration(tenantId: string): Promise<Record<string, any>> {
    const models = await this.modelConfigurationsRepository.find({
      where: { tenantId }
    });
    
    const config: Record<string, any> = {};
    for (const model of models) {
      const key = `${model.modelType}.${model.modelName}`;
      config[key] = {
        version: model.modelVersion,
        parameters: JSON.parse(model.parameters),
        isActive: model.isActive,
        validationStatus: model.validationStatus
      };
    }
    
    return config;
  }

  private async getComplianceConfiguration(tenantId: string): Promise<Record<string, any>> {
    const settings = await this.appSettingsRepository.find({
      where: {
        tenantId,
        category: 'compliance'
      }
    });
    
    const config: Record<string, any> = {};
    for (const setting of settings) {
      config[setting.settingKey] = this.parseConfigValue(setting.settingValue, setting.settingType);
    }
    
    return config;
  }

  private async updateGeneralConfiguration(
    tenantId: string,
    config: Record<string, any>,
    modifiedBy: string
  ): Promise<void> {
    for (const [key, value] of Object.entries(config)) {
      const setting = new AppSettings();
      setting.tenantId = tenantId;
      setting.settingKey = key;
      setting.settingValue = String(value);
      setting.settingType = this.inferType(value);
      setting.category = 'general';
      setting.updatedBy = modifiedBy;
      setting.updatedAt = new Date();
      
      await this.appSettingsRepository.save(setting);
    }
  }

  private async updateCalculationConfiguration(
    tenantId: string,
    config: Record<string, any>,
    modifiedBy: string
  ): Promise<void> {
    for (const [key, paramConfig] of Object.entries(config)) {
      const [category, paramKey] = key.split('.');
      
      const parameter = new CalculationParameters();
      parameter.tenantId = tenantId;
      parameter.parameterCategory = category;
      parameter.parameterKey = paramKey;
      parameter.parameterValue = String(paramConfig.value);
      parameter.parameterType = this.inferType(paramConfig.value);
      parameter.scenarioIdentifier = paramConfig.scenario;
      parameter.effectiveDate = paramConfig.effectiveDate || new Date();
      parameter.expiryDate = paramConfig.expiryDate;
      parameter.updatedBy = modifiedBy;
      parameter.updatedAt = new Date();
      
      await this.calculationParametersRepository.save(parameter);
    }
  }

  private async updateModelConfiguration(
    tenantId: string,
    config: Record<string, any>,
    modifiedBy: string
  ): Promise<void> {
    for (const [key, modelConfig] of Object.entries(config)) {
      const [modelType, modelName] = key.split('.');
      
      const model = new ModelConfigurations();
      model.tenantId = tenantId;
      model.modelType = modelType;
      model.modelName = modelName;
      model.modelVersion = modelConfig.version;
      model.parameters = JSON.stringify(modelConfig.parameters);
      model.isActive = modelConfig.isActive;
      model.validationStatus = modelConfig.validationStatus;
      model.updatedBy = modifiedBy;
      model.updatedAt = new Date();
      
      await this.modelConfigurationsRepository.save(model);
    }
  }

  private async updateComplianceConfiguration(
    tenantId: string,
    config: Record<string, any>,
    modifiedBy: string
  ): Promise<void> {
    for (const [key, value] of Object.entries(config)) {
      const setting = new AppSettings();
      setting.tenantId = tenantId;
      setting.settingKey = key;
      setting.settingValue = String(value);
      setting.settingType = this.inferType(value);
      setting.category = 'compliance';
      setting.updatedBy = modifiedBy;
      setting.updatedAt = new Date();
      
      await this.appSettingsRepository.save(setting);
    }
  }

  private parseConfigValue(value: string, type: string): any {
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return Number(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  private inferType(value: any): string {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  }

  /**
   * Initialize configuration templates
   */
  private initializeConfigurationTemplates(): void {
    // Basic Conventional Banking Template
    this.configTemplates.set('basic-conventional', {
      templateName: 'Basic Conventional Banking',
      bankingType: 'conventional',
      subscriptionTier: 'basic',
      defaultSettings: {
        'ui.theme': 'light',
        'ui.language': 'en',
        'ui.timezone': 'UTC',
        'ui.currency': 'USD',
        'calculation.precision': '4',
        'reporting.frequency': 'monthly'
      },
      defaultFeatures: {
        'dashboard': true,
        'basicReports': true,
        'eclCalculations': true,
        'auditTrail': false,
        'advancedAnalytics': false,
        'stressTesting': false,
        'workflowManagement': false
      },
      defaultCalculationParameters: {
        'ecl.confidence_level': { value: 99.5, scenario: 'base' },
        'pd.floor_rate': { value: 0.03, scenario: 'base' },
        'lgd.floor_rate': { value: 0.10, scenario: 'base' }
      },
      complianceSettings: {
        'banking_type': 'conventional',
        'regulatory_framework': 'Basel_III',
        'compliance_monitoring': true
      }
    });

    // Premium Conventional Banking Template
    this.configTemplates.set('premium-conventional', {
      templateName: 'Premium Conventional Banking',
      bankingType: 'conventional',
      subscriptionTier: 'premium',
      defaultSettings: {
        'ui.theme': 'light',
        'ui.language': 'en',
        'ui.timezone': 'UTC',
        'ui.currency': 'USD',
        'calculation.precision': '6',
        'reporting.frequency': 'weekly'
      },
      defaultFeatures: {
        'dashboard': true,
        'basicReports': true,
        'advancedReports': true,
        'eclCalculations': true,
        'auditTrail': true,
        'advancedAnalytics': true,
        'stressTesting': true,
        'workflowManagement': true,
        'apiAccess': true
      },
      defaultCalculationParameters: {
        'ecl.confidence_level': { value: 99.9, scenario: 'base' },
        'pd.floor_rate': { value: 0.03, scenario: 'base' },
        'lgd.floor_rate': { value: 0.10, scenario: 'base' },
        'stress.pd_multiplier': { value: 2.0, scenario: 'stress' },
        'stress.lgd_multiplier': { value: 1.5, scenario: 'stress' }
      },
      complianceSettings: {
        'banking_type': 'conventional',
        'regulatory_framework': 'Basel_III',
        'compliance_monitoring': true,
        'stress_testing_required': true
      }
    });

    // Basic Islamic Banking Template
    this.configTemplates.set('basic-syariah', {
      templateName: 'Basic Islamic Banking',
      bankingType: 'syariah',
      subscriptionTier: 'basic',
      defaultSettings: {
        'ui.theme': 'islamic',
        'ui.language': 'en',
        'ui.timezone': 'UTC',
        'ui.currency': 'USD',
        'ui.calendar_type': 'islamic',
        'calculation.precision': '4',
        'reporting.frequency': 'monthly'
      },
      defaultFeatures: {
        'dashboard': true,
        'basicReports': true,
        'eclCalculations': true,
        'islamicBanking': true,
        'syariahCompliance': true,
        'auditTrail': false,
        'advancedAnalytics': false
      },
      defaultCalculationParameters: {
        'ecl.confidence_level': { value: 99.5, scenario: 'base' },
        'pd.floor_rate': { value: 0.03, scenario: 'base' },
        'lgd.floor_rate': { value: 0.10, scenario: 'base' },
        'syariah.profit_calculation_method': { value: 'declining_balance', scenario: 'base' }
      },
      complianceSettings: {
        'banking_type': 'syariah',
        'aaoifi_standards': true,
        'prohibited_sectors': ['alcohol', 'gambling', 'pork', 'conventional_banking', 'adult_entertainment'],
        'regulatory_framework': 'AAOIFI',
        'compliance_monitoring': true,
        'syariah_audit_required': true,
        'syariah_board_required': true
      }
    });

    // Premium Islamic Banking Template
    this.configTemplates.set('premium-syariah', {
      templateName: 'Premium Islamic Banking',
      bankingType: 'syariah',
      subscriptionTier: 'premium',
      defaultSettings: {
        'ui.theme': 'islamic',
        'ui.language': 'en',
        'ui.timezone': 'UTC',
        'ui.currency': 'USD',
        'ui.calendar_type': 'islamic',
        'calculation.precision': '6',
        'reporting.frequency': 'weekly'
      },
      defaultFeatures: {
        'dashboard': true,
        'basicReports': true,
        'advancedReports': true,
        'eclCalculations': true,
        'islamicBanking': true,
        'syariahCompliance': true,
        'auditTrail': true,
        'advancedAnalytics': true,
        'stressTesting': true,
        'workflowManagement': true,
        'apiAccess': true
      },
      defaultCalculationParameters: {
        'ecl.confidence_level': { value: 99.9, scenario: 'base' },
        'pd.floor_rate': { value: 0.03, scenario: 'base' },
        'lgd.floor_rate': { value: 0.10, scenario: 'base' },
        'syariah.profit_calculation_method': { value: 'declining_balance', scenario: 'base' },
        'syariah.zakat_calculation': { value: 'standard', scenario: 'base' },
        'stress.pd_multiplier': { value: 2.0, scenario: 'stress' },
        'stress.lgd_multiplier': { value: 1.5, scenario: 'stress' }
      },
      complianceSettings: {
        'banking_type': 'syariah',
        'aaoifi_standards': true,
        'prohibited_sectors': ['alcohol', 'gambling', 'pork', 'conventional_banking', 'adult_entertainment', 'tobacco', 'weapons'],
        'regulatory_framework': 'AAOIFI',
        'compliance_monitoring': true,
        'syariah_audit_required': true,
        'syariah_board_required': true,
        'syariah_audit_frequency': 12,
        'stress_testing_required': true
      }
    });

    this.logger.info(`Initialized ${this.configTemplates.size} configuration templates`);
  }
}
