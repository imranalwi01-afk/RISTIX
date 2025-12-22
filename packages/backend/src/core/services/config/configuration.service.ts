// packages/backend/src/core/services/config/configuration.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from '../../models/config/app-settings.model';
import { CalculationParameters } from '../../models/config/calculation-parameters.model';
import { ModelConfigurations } from '../../models/config/model-configurations.model';
import { ParameterConfigurations } from '../../models/config/parameter-configurations.model';
import { EnvironmentService } from './environment.service';
import { FeatureFlagsService } from './feature-flags.service';
import { EncryptionService } from './encryption.service';
import { ValidationService } from './validation.service';
import { Logger } from 'winston';

export interface ConfigurationValue {
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';
  isDefault: boolean;
  lastModified: Date;
  modifiedBy: string;
}

export interface TenantConfiguration {
  tenantId: string;
  settings: Record<string, ConfigurationValue>;
  features: Record<string, boolean>;
  calculationParameters: Record<string, any>;
  modelConfigurations: Record<string, any>;
}

@Injectable()
export class ConfigurationService {
  private configCache: Map<string, ConfigurationValue> = new Map();
  private tenantConfigCache: Map<string, TenantConfiguration> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(AppSettings)
    private readonly appSettingsRepository: Repository<AppSettings>,
    
    @InjectRepository(CalculationParameters)
    private readonly calculationParametersRepository: Repository<CalculationParameters>,
    
    @InjectRepository(ModelConfigurations)
    private readonly modelConfigurationsRepository: Repository<ModelConfigurations>,
    
    @InjectRepository(ParameterConfigurations)
    private readonly parameterConfigurationsRepository: Repository<ParameterConfigurations>,
    
    private readonly environmentService: EnvironmentService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly encryptionService: EncryptionService,
    private readonly validationService: ValidationService,
    private readonly logger: Logger
  ) {}

  /**
   * Initialize configuration system
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Configuration Management System...');
    
    try {
      // Load environment-specific configurations
      await this.environmentService.loadEnvironmentConfig();
      
      // Load feature flags
      await this.featureFlagsService.loadFeatureFlags();
      
      // Validate configuration integrity
      await this.validateSystemConfiguration();
      
      // Setup configuration watchers
      this.setupConfigurationWatchers();
      
      this.logger.info('Configuration Management System initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Configuration Management System', error);
      throw error;
    }
  }

  /**
   * Get configuration value with fallback chain:
   * 1. Tenant-specific override
   * 2. Environment variable
   * 3. Database setting
   * 4. Default value
   */
  async get<T = any>(key: string, defaultValue?: T, tenantId?: string): Promise<T> {
    try {
      // Check tenant-specific override first
      if (tenantId) {
        const tenantValue = await this.getTenantSpecificConfig(tenantId, key);
        if (tenantValue !== null && tenantValue !== undefined) {
          return tenantValue as T;
        }
      }
      
      // Check cache
      const cacheKey = tenantId ? `${tenantId}:${key}` : `global:${key}`;
      if (this.configCache.has(cacheKey)) {
        const cached = this.configCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
          return cached.value as T;
        }
      }
      
      // Check environment variable
      const envValue = this.environmentService.get(key);
      if (envValue !== undefined) {
        this.setCacheValue(cacheKey, envValue, 'string', false);
        return envValue as T;
      }
      
      // Load from database
      const dbConfig = await this.loadFromDatabase(key, tenantId);
      if (dbConfig) {
        let value = dbConfig.settingValue;
        
        // Decrypt if necessary
        if (dbConfig.settingType === 'encrypted') {
          value = await this.encryptionService.decrypt(value);
        }
        
        // Parse based on type
        value = this.parseConfigValue(value, dbConfig.settingType);
        
        this.setCacheValue(cacheKey, value, dbConfig.settingType, false);
        return value as T;
      }
      
      // Return default value
      if (defaultValue !== undefined) {
        this.setCacheValue(cacheKey, defaultValue, 'string', true);
        return defaultValue;
      }
      
      throw new Error(`Configuration key '${key}' not found and no default value provided`);
    } catch (error) {
      this.logger.error(`Failed to get configuration for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Set configuration value
   */
  async set(key: string, value: any, tenantId?: string, encrypted = false): Promise<void> {
    try {
      await this.validationService.validateConfigurationKey(key, value);
      
      let settingValue = value;
      let settingType = this.inferType(value);
      
      // Encrypt if required
      if (encrypted) {
        settingValue = await this.encryptionService.encrypt(String(value));
        settingType = 'encrypted';
      }
      
      // Save to database
      await this.saveToDatabase(key, settingValue, settingType, tenantId);
      
      // Update cache
      const cacheKey = tenantId ? `${tenantId}:${key}` : `global:${key}`;
      this.setCacheValue(cacheKey, value, settingType, false);
      
      this.logger.info(`Configuration updated: ${key} = ${encrypted ? '[ENCRYPTED]' : value}`);
    } catch (error) {
      this.logger.error(`Failed to set configuration for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get multiple configuration values
   */
  async getMultiple(keys: string[], tenantId?: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    
    for (const key of keys) {
      try {
        result[key] = await this.get(key, null, tenantId);
      } catch (error) {
        this.logger.warn(`Failed to get configuration for key: ${key}`, error);
        result[key] = null;
      }
    }
    
    return result;
  }

  /**
   * Get tenant-specific configuration
   */
  async getTenantConfiguration(tenantId: string): Promise<TenantConfiguration> {
    if (this.tenantConfigCache.has(tenantId)) {
      const cached = this.tenantConfigCache.get(tenantId);
      if (cached && this.isTenantCacheValid(cached)) {
        return cached;
      }
    }
    
    try {
      // Load tenant settings
      const settings = await this.appSettingsRepository.find({
        where: { tenantId },
        order: { settingKey: 'ASC' }
      });
      
      // Load calculation parameters
      const calculationParams = await this.calculationParametersRepository.find({
        where: { tenantId },
        order: { parameterCategory: 'ASC' }
      });
      
      // Load model configurations
      const modelConfigs = await this.modelConfigurationsRepository.find({
        where: { tenantId },
        order: { modelType: 'ASC' }
      });
      
      // Build configuration object
      const tenantConfig: TenantConfiguration = {
        tenantId,
        settings: {},
        features: {},
        calculationParameters: {},
        modelConfigurations: {}
      };
      
      // Process settings
      for (const setting of settings) {
        tenantConfig.settings[setting.settingKey] = {
          value: this.parseConfigValue(setting.settingValue, setting.settingType),
          type: setting.settingType,
          isDefault: false,
          lastModified: setting.updatedAt,
          modifiedBy: setting.updatedBy || 'system'
        };
      }
      
      // Process calculation parameters
      for (const param of calculationParams) {
        const key = `${param.parameterCategory}.${param.parameterKey}`;
        tenantConfig.calculationParameters[key] = {
          value: this.parseConfigValue(param.parameterValue, param.parameterType),
          scenario: param.scenarioIdentifier,
          productType: param.productType,
          customerSegment: param.customerSegment,
          effectiveDate: param.effectiveDate,
          expiryDate: param.expiryDate
        };
      }
      
      // Process model configurations
      for (const model of modelConfigs) {
        const key = `${model.modelType}.${model.modelName}`;
        tenantConfig.modelConfigurations[key] = {
          version: model.modelVersion,
          parameters: JSON.parse(model.parameters),
          isActive: model.isActive,
          validationStatus: model.validationStatus,
          approvalStatus: model.approvalStatus
        };
      }
      
      // Get feature flags
      tenantConfig.features = await this.featureFlagsService.getTenantFeatures(tenantId);
      
      // Cache the result
      this.tenantConfigCache.set(tenantId, tenantConfig);
      
      return tenantConfig;
    } catch (error) {
      this.logger.error(`Failed to get tenant configuration for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenantConfiguration(
    tenantId: string,
    updates: Partial<TenantConfiguration>
  ): Promise<void> {
    try {
      // Update settings
      if (updates.settings) {
        for (const [key, configValue] of Object.entries(updates.settings)) {
          await this.set(key, configValue.value, tenantId, configValue.type === 'encrypted');
        }
      }
      
      // Update features
      if (updates.features) {
        await this.featureFlagsService.updateTenantFeatures(tenantId, updates.features);
      }
      
      // Update calculation parameters
      if (updates.calculationParameters) {
        for (const [key, param] of Object.entries(updates.calculationParameters)) {
          const [category, paramKey] = key.split('.');
          await this.updateCalculationParameter(tenantId, category, paramKey, param);
        }
      }
      
      // Clear cache
      this.tenantConfigCache.delete(tenantId);
      
      this.logger.info(`Tenant configuration updated for tenant: ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to update tenant configuration for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get calculation parameter
   */
  async getCalculationParameter(
    tenantId: string,
    category: string,
    key: string,
    scenario?: string
  ): Promise<any> {
    try {
      const whereClause: any = {
        tenantId,
        parameterCategory: category,
        parameterKey: key
      };
      
      if (scenario) {
        whereClause.scenarioIdentifier = scenario;
      }
      
      const parameter = await this.calculationParametersRepository.findOne({
        where: whereClause,
        order: { effectiveDate: 'DESC' }
      });
      
      if (!parameter) {
        return null;
      }
      
      return this.parseConfigValue(parameter.parameterValue, parameter.parameterType);
    } catch (error) {
      this.logger.error(`Failed to get calculation parameter: ${category}.${key}`, error);
      throw error;
    }
  }

  /**
   * Validate system configuration
   */
  private async validateSystemConfiguration(): Promise<void> {
    const requiredKeys = [
      'database.host',
      'database.port',
      'database.name',
      'jwt.secret',
      'encryption.key',
      'redis.host',
      'redis.port'
    ];
    
    for (const key of requiredKeys) {
      try {
        await this.get(key);
      } catch (error) {
        throw new Error(`Required configuration key missing: ${key}`);
      }
    }
  }

  /**
   * Setup configuration watchers
   */
  private setupConfigurationWatchers(): void {
    // Watch for database changes
    setInterval(async () => {
      try {
        // Check for configuration changes and update cache
        await this.refreshConfigurationCache();
      } catch (error) {
        this.logger.error('Failed to refresh configuration cache', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Helper methods
   */
  private async getTenantSpecificConfig(tenantId: string, key: string): Promise<any> {
    const setting = await this.appSettingsRepository.findOne({
      where: { tenantId, settingKey: key }
    });
    
    if (!setting) {
      return null;
    }
    
    let value = setting.settingValue;
    if (setting.settingType === 'encrypted') {
      value = await this.encryptionService.decrypt(value);
    }
    
    return this.parseConfigValue(value, setting.settingType);
  }

  private async loadFromDatabase(key: string, tenantId?: string): Promise<AppSettings | null> {
    const whereClause: any = { settingKey: key };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    
    return this.appSettingsRepository.findOne({ where: whereClause });
  }

  private async saveToDatabase(
    key: string,
    value: string,
    type: string,
    tenantId?: string
  ): Promise<void> {
    const setting = new AppSettings();
    setting.settingKey = key;
    setting.settingValue = value;
    setting.settingType = type;
    setting.tenantId = tenantId;
    setting.updatedAt = new Date();
    
    await this.appSettingsRepository.save(setting);
  }

  private async updateCalculationParameter(
    tenantId: string,
    category: string,
    key: string,
    param: any
  ): Promise<void> {
    const parameter = new CalculationParameters();
    parameter.tenantId = tenantId;
    parameter.parameterCategory = category;
    parameter.parameterKey = key;
    parameter.parameterValue = String(param.value);
    parameter.parameterType = this.inferType(param.value);
    parameter.scenarioIdentifier = param.scenario;
    parameter.productType = param.productType;
    parameter.customerSegment = param.customerSegment;
    parameter.effectiveDate = param.effectiveDate || new Date();
    parameter.expiryDate = param.expiryDate;
    parameter.updatedAt = new Date();
    
    await this.calculationParametersRepository.save(parameter);
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

  private setCacheValue(key: string, value: any, type: string, isDefault: boolean): void {
    this.configCache.set(key, {
      value,
      type: type as any,
      isDefault,
      lastModified: new Date(),
      modifiedBy: 'system'
    });
  }

  private isCacheValid(cached: ConfigurationValue): boolean {
    return Date.now() - cached.lastModified.getTime() < this.cacheTimeout;
  }

  private isTenantCacheValid(cached: TenantConfiguration): boolean {
    // For simplicity, using a basic cache validation
    // In production, you might want more sophisticated cache invalidation
    return true;
  }

  private async refreshConfigurationCache(): Promise<void> {
    // Clear expired cache entries
    for (const [key, cached] of this.configCache.entries()) {
      if (!this.isCacheValid(cached)) {
        this.configCache.delete(key);
      }
    }
  }
}
