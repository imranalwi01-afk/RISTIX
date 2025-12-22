#!/bin/bash
# IFRS9 Platform - Day 1 Hour 4: Configuration Management System Setup
# File: scripts/setup/d1h4-config-management-setup.sh

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h4-config-setup-$(date +%Y%m%d-%H%M%S).log"

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

# Main configuration management setup function
setup_configuration_management() {
    log_info "Starting Configuration Management System setup..."
    
    # Create configuration directory structure
    log_info "Creating configuration directory structure..."
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/config"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/config"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/config/environments"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/config/schemas"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/config/validators"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/config"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/config"
    log_success "Configuration directory structure created"
    
    # Generate Configuration Service
    log_info "Generating Configuration Service..."
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/config/configuration.service.ts" << 'EOF'
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
EOF
    log_success "Configuration Service generated successfully"
    
    # Generate Environment Service
    log_info "Generating Environment Service..."
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/config/environment.service.ts" << 'EOF'
// packages/backend/src/core/services/config/environment.service.ts
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from 'winston';

export interface EnvironmentConfig {
  nodeEnv: string;
  appName: string;
  appVersion: string;
  appDebug: boolean;
  
  // Server Configuration
  backendHost: string;
  backendPort: number;
  frontendHost: string;
  frontendPort: number;
  rAnalyticsHost: string;
  rAnalyticsPort: number;
  
  // Database Configuration
  tenantDbHost: string;
  tenantDbPort: number;
  tenantDbUserPrefix: string;
  tenantDbNamePrefix: string;
  tenantDbSsl: string;
  
  // Redis Configuration
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  redisDb: number;
  redisTokenBlacklistDb: number;
  redisSessionDb: number;
  
  // Security Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  encryptionKey: string;
  saltRounds: number;
  
  // Feature Flags
  featureAdvancedAnalytics: boolean;
  featureIslamicBanking: boolean;
  featureAuditTrail: boolean;
  featureStressTesting: boolean;
  featureMobileApi: boolean;
  featureWorkflowManagement: boolean;
  featureSyariahCompliance: boolean;
  
  // MVP Flags
  mvpMultiTenantArchitecture: boolean;
  mvpRbacAuthentication: boolean;
  mvpAuditWorkflow: boolean;
  mvpBankingDataModels: boolean;
  mvpEtlPipeline: boolean;
  mvpFormsTemplates: boolean;
  mvpReactAdminFramework: boolean;
  mvpDualBankingConfiguration: boolean;
  mvpBankingResourceManagement: boolean;
  mvpRApiIntegration: boolean;
  mvpInfrastructure: boolean;
  mvpLegacyIntegration: boolean;
  mvpProductionConfiguration: boolean;
  
  // Logging Configuration
  logLevel: string;
  logFile: string;
  logMaxSize: string;
  logMaxFiles: number;
}

@Injectable()
export class EnvironmentService {
  private config: EnvironmentConfig;
  private configLoaded = false;

  constructor(private readonly logger: Logger) {}

  /**
   * Load environment configuration
   */
  async loadEnvironmentConfig(): Promise<void> {
    try {
      const environment = process.env.NODE_ENV || 'development';
      
      // Load base .env file
      const baseEnvPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(baseEnvPath)) {
        dotenv.config({ path: baseEnvPath });
      }
      
      // Load environment-specific .env file
      const envPath = path.join(process.cwd(), `.env.${environment}`);
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
      }
      
      // Load local overrides
      const localEnvPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath, override: true });
      }
      
      // Parse and validate configuration
      this.config = this.parseEnvironmentVariables();
      this.validateRequiredConfiguration();
      this.configLoaded = true;
      
      this.logger.info(`Environment configuration loaded for: ${environment}`);
    } catch (error) {
      this.logger.error('Failed to load environment configuration', error);
      throw error;
    }
  }

  /**
   * Get configuration value
   */
  get<T = any>(key: string, defaultValue?: T): T {
    if (!this.configLoaded) {
      throw new Error('Environment configuration not loaded. Call loadEnvironmentConfig() first.');
    }
    
    // Check direct environment variable
    const envValue = process.env[key];
    if (envValue !== undefined) {
      return this.parseValue(envValue) as T;
    }
    
    // Check parsed configuration
    const configKey = this.toCamelCase(key);
    if (configKey in this.config) {
      return (this.config as any)[configKey] as T;
    }
    
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    throw new Error(`Environment variable '${key}' not found and no default value provided`);
  }

  /**
   * Get all configuration
   */
  getAll(): EnvironmentConfig {
    if (!this.configLoaded) {
      throw new Error('Environment configuration not loaded. Call loadEnvironmentConfig() first.');
    }
    
    return { ...this.config };
  }

  /**
   * Check if environment is development
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if environment is production
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if environment is staging
   */
  isStaging(): boolean {
    return this.get('NODE_ENV') === 'staging';
  }

  /**
   * Check if environment is test
   */
  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Get database configuration for specific tenant
   */
  getTenantDatabaseConfig(tenantSlug: string, bankingType: 'conventional' | 'syariah'): any {
    return {
      host: this.config.tenantDbHost,
      port: this.config.tenantDbPort,
      username: `${this.config.tenantDbUserPrefix}${tenantSlug}_${bankingType}`,
      database: `${this.config.tenantDbNamePrefix}${tenantSlug}_${bankingType}`,
      ssl: this.config.tenantDbSsl === 'require'
    };
  }

  /**
   * Get Redis configuration
   */
  getRedisConfig(purpose: 'default' | 'session' | 'tokenBlacklist' = 'default'): any {
    let db = this.config.redisDb;
    
    switch (purpose) {
      case 'session':
        db = this.config.redisSessionDb;
        break;
      case 'tokenBlacklist':
        db = this.config.redisTokenBlacklistDb;
        break;
    }
    
    return {
      host: this.config.redisHost,
      port: this.config.redisPort,
      password: this.config.redisPassword || undefined,
      db
    };
  }

  /**
   * Validate environment configuration
   */
  validateConfiguration(): string[] {
    const errors: string[] = [];
    
    // Required configurations
    const required = [
      'NODE_ENV',
      'APP_NAME',
      'BACKEND_PORT',
      'FRONTEND_PORT',
      'TENANT_DB_HOST',
      'TENANT_DB_PORT',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'REDIS_HOST',
      'REDIS_PORT'
    ];
    
    for (const key of required) {
      if (!process.env[key]) {
        errors.push(`Required environment variable missing: ${key}`);
      }
    }
    
    // Validate JWT secret length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
    
    // Validate encryption key length
    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters long');
    }
    
    // Validate port numbers
    const ports = ['BACKEND_PORT', 'FRONTEND_PORT', 'R_ANALYTICS_PORT', 'TENANT_DB_PORT', 'REDIS_PORT'];
    for (const portKey of ports) {
      const port = process.env[portKey];
      if (port && (isNaN(Number(port)) || Number(port) < 1024 || Number(port) > 65535)) {
        errors.push(`Invalid port number for ${portKey}: ${port}`);
      }
    }
    
    return errors;
  }

  /**
   * Parse environment variables into typed configuration
   */
  private parseEnvironmentVariables(): EnvironmentConfig {
    return {
      nodeEnv: this.get('NODE_ENV', 'development'),
      appName: this.get('APP_NAME', 'IFRS9_Multi_Tenant_Platform'),
      appVersion: this.get('APP_VERSION', '1.0.0'),
      appDebug: this.parseBoolean('APP_DEBUG', false),
      
      // Server Configuration
      backendHost: this.get('BACKEND_HOST', 'localhost'),
      backendPort: this.parseNumber('BACKEND_PORT', 4232),
      frontendHost: this.get('FRONTEND_HOST', 'localhost'),
      frontendPort: this.parseNumber('FRONTEND_PORT', 4231),
      rAnalyticsHost: this.get('R_ANALYTICS_HOST', 'localhost'),
      rAnalyticsPort: this.parseNumber('R_ANALYTICS_PORT', 4236),
      
      // Database Configuration
      tenantDbHost: this.get('TENANT_DB_HOST', 'localhost'),
      tenantDbPort: this.parseNumber('TENANT_DB_PORT', 5432),
      tenantDbUserPrefix: this.get('TENANT_DB_USER_PREFIX', 'tenant_'),
      tenantDbNamePrefix: this.get('TENANT_DB_NAME_PREFIX', 'ifrs9_tenant_'),
      tenantDbSsl: this.get('TENANT_DB_SSL', 'require'),
      
      // Redis Configuration
      redisHost: this.get('REDIS_HOST', 'localhost'),
      redisPort: this.parseNumber('REDIS_PORT', 6379),
      redisPassword: this.get('REDIS_PASSWORD', '1234567890'),
      redisDb: this.parseNumber('REDIS_DB', 10),
      redisTokenBlacklistDb: this.parseNumber('REDIS_TOKEN_BLACKLIST_DB', 4),
      redisSessionDb: this.parseNumber('REDIS_SESSION_DB', 10),
      
      // Security Configuration
      jwtSecret: this.get('JWT_SECRET', ''),
      jwtExpiresIn: this.get('JWT_EXPIRES_IN', '8h'),
      jwtRefreshSecret: this.get('JWT_REFRESH_SECRET', ''),
      jwtRefreshExpiresIn: this.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      encryptionKey: this.get('ENCRYPTION_KEY', ''),
      saltRounds: this.parseNumber('SALT_ROUNDS', 12),
      
      // Feature Flags
      featureAdvancedAnalytics: this.parseBoolean('FEATURE_ADVANCED_ANALYTICS', true),
      featureIslamicBanking: this.parseBoolean('FEATURE_ISLAMIC_BANKING', true),
      featureAuditTrail: this.parseBoolean('FEATURE_AUDIT_TRAIL', true),
      featureStressTesting: this.parseBoolean('FEATURE_STRESS_TESTING', true),
      featureMobileApi: this.parseBoolean('FEATURE_MOBILE_API', true),
      featureWorkflowManagement: this.parseBoolean('FEATURE_WORKFLOW_MANAGEMENT', true),
      featureSyariahCompliance: this.parseBoolean('FEATURE_SYARIAH_COMPLIANCE', true),
      
      // MVP Flags
      mvpMultiTenantArchitecture: this.parseBoolean('MVP_MULTI_TENANT_ARCHITECTURE', true),
      mvpRbacAuthentication: this.parseBoolean('MVP_RBAC_AUTHENTICATION', true),
      mvpAuditWorkflow: this.parseBoolean('MVP_AUDIT_WORKFLOW', true),
      mvpBankingDataModels: this.parseBoolean('MVP_BANKING_DATA_MODELS', true),
      mvpEtlPipeline: this.parseBoolean('MVP_ETL_PIPELINE', true),
      mvpFormsTemplates: this.parseBoolean('MVP_FORMS_TEMPLATES', true),
      mvpReactAdminFramework: this.parseBoolean('MVP_REACT_ADMIN_FRAMEWORK', true),
      mvpDualBankingConfiguration: this.parseBoolean('MVP_DUAL_BANKING_CONFIGURATION', true),
      mvpBankingResourceManagement: this.parseBoolean('MVP_BANKING_RESOURCE_MANAGEMENT', true),
      mvpRApiIntegration: this.parseBoolean('MVP_R_API_INTEGRATION', true),
      mvpInfrastructure: this.parseBoolean('MVP_INFRASTRUCTURE', true),
      mvpLegacyIntegration: this.parseBoolean('MVP_LEGACY_INTEGRATION', true),
      mvpProductionConfiguration: this.parseBoolean('MVP_PRODUCTION_CONFIGURATION', true),
      
      // Logging Configuration
      logLevel: this.get('LOG_LEVEL', 'info'),
      logFile: this.get('LOG_FILE', '/var/log/ifrspro/app.log'),
      logMaxSize: this.get('LOG_MAX_SIZE', '100MB'),
      logMaxFiles: this.parseNumber('LOG_MAX_FILES', 10)
    };
  }

  /**
   * Validate required configuration
   */
  private validateRequiredConfiguration(): void {
    const errors = this.validateConfiguration();
    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Helper methods
   */
  private parseBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private parseNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private parseValue(value: string): any {
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try to parse as number
    if (!isNaN(Number(value))) return Number(value);
    
    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private toCamelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
EOF
    log_success "Environment Service generated successfully"
    
    # Generate Feature Flags Service
    log_info "Generating Feature Flags Service..."
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/config/feature-flags.service.ts" << 'EOF'
// packages/backend/src/core/services/config/feature-flags.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from '../../models/config/app-settings.model';
import { EnvironmentService } from './environment.service';
import { Logger } from 'winston';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environments: string[];
  tenantOverrides: Record<string, boolean>;
  lastModified: Date;
  modifiedBy: string;
}

export interface TenantFeatures {
  [key: string]: boolean;
}

@Injectable()
export class FeatureFlagsService {
  private featureFlagsCache: Map<string, FeatureFlag> = new Map();
  private tenantFeaturesCache: Map<string, TenantFeatures> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(AppSettings)
    private readonly appSettingsRepository: Repository<AppSettings>,
    
    private readonly environmentService: EnvironmentService,
    private readonly logger: Logger
  ) {}

  /**
   * Load feature flags from database and environment
   */
  async loadFeatureFlags(): Promise<void> {
    try {
      this.logger.info('Loading feature flags...');
      
      // Load global feature flags from environment
      const globalFlags = this.loadGlobalFeatureFlags();
      
      // Load database feature flags
      const dbFlags = await this.loadDatabaseFeatureFlags();
      
      // Merge flags (database overrides environment)
      for (const [key, flag] of globalFlags) {
        this.featureFlagsCache.set(key, flag);
      }
      
      for (const [key, flag] of dbFlags) {
        this.featureFlagsCache.set(key, flag);
      }
      
      this.logger.info(`Loaded ${this.featureFlagsCache.size} feature flags`);
    } catch (error) {
      this.logger.error('Failed to load feature flags', error);
      throw error;
    }
  }

  /**
   * Check if feature is enabled globally
   */
  isEnabled(featureKey: string): boolean {
    const flag = this.featureFlagsCache.get(featureKey);
    if (!flag) {
      // If feature flag doesn't exist, check environment variable as fallback
      const envKey = `FEATURE_${featureKey.toUpperCase()}`;
      return this.environmentService.get(envKey, false);
    }
    
    // Check if feature is enabled for current environment
    const currentEnv = this.environmentService.get('NODE_ENV', 'development');
    if (flag.environments.length > 0 && !flag.environments.includes(currentEnv)) {
      return false;
    }
    
    return flag.enabled;
  }

  /**
   * Check if feature is enabled for specific tenant
   */
  async isTenantFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    try {
      // Get tenant features
      const tenantFeatures = await this.getTenantFeatures(tenantId);
      
      // Check tenant override first
      if (featureKey in tenantFeatures) {
        return tenantFeatures[featureKey];
      }
      
      // Fallback to global feature flag
      return this.isEnabled(featureKey);
    } catch (error) {
      this.logger.error(`Failed to check tenant feature: ${featureKey} for tenant: ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Get all features for a tenant
   */
  async getTenantFeatures(tenantId: string): Promise<TenantFeatures> {
    const cacheKey = `tenant_${tenantId}`;
    
    // Check cache first
    if (this.tenantFeaturesCache.has(cacheKey)) {
      return this.tenantFeaturesCache.get(cacheKey)!;
    }
    
    try {
      // Load from database
      const settings = await this.appSettingsRepository.find({
        where: {
          tenantId,
          category: 'features'
        }
      });
      
      const tenantFeatures: TenantFeatures = {};
      
      // Add global features as defaults
      for (const [key, flag] of this.featureFlagsCache) {
        tenantFeatures[key] = flag.enabled;
      }
      
      // Override with tenant-specific settings
      for (const setting of settings) {
        const featureKey = setting.settingKey.replace('features.', '');
        tenantFeatures[featureKey] = setting.settingValue === 'true';
      }
      
      // Cache the result
      this.tenantFeaturesCache.set(cacheKey, tenantFeatures);
      
      return tenantFeatures;
    } catch (error) {
      this.logger.error(`Failed to get tenant features for tenant: ${tenantId}`, error);
      return {};
    }
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(
    featureKey: string,
    enabled: boolean,
    modifiedBy: string
  ): Promise<void> {
    try {
      // Update in database
      const setting = new AppSettings();
      setting.settingKey = `features.${featureKey}`;
      setting.settingValue = enabled.toString();
      setting.settingType = 'boolean';
      setting.category = 'features';
      setting.description = `Feature flag for ${featureKey}`;
      setting.updatedBy = modifiedBy;
      setting.updatedAt = new Date();
      
      await this.appSettingsRepository.save(setting);
      
      // Update cache
      const existing = this.featureFlagsCache.get(featureKey);
      if (existing) {
        existing.enabled = enabled;
        existing.lastModified = new Date();
        existing.modifiedBy = modifiedBy;
      } else {
        this.featureFlagsCache.set(featureKey, {
          key: featureKey,
          name: featureKey,
          description: `Feature flag for ${featureKey}`,
          enabled,
          environments: [],
          tenantOverrides: {},
          lastModified: new Date(),
          modifiedBy
        });
      }
      
      this.logger.info(`Feature flag updated: ${featureKey} = ${enabled} by ${modifiedBy}`);
    } catch (error) {
      this.logger.error(`Failed to update feature flag: ${featureKey}`, error);
      throw error;
    }
  }

  /**
   * Update tenant feature
   */
  async updateTenantFeature(
    tenantId: string,
    featureKey: string,
    enabled: boolean,
    modifiedBy: string
  ): Promise<void> {
    try {
      // Update in database
      const setting = new AppSettings();
      setting.tenantId = tenantId;
      setting.settingKey = `features.${featureKey}`;
      setting.settingValue = enabled.toString();
      setting.settingType = 'boolean';
      setting.category = 'features';
      setting.description = `Tenant-specific feature flag for ${featureKey}`;
      setting.updatedBy = modifiedBy;
      setting.updatedAt = new Date();
      
      await this.appSettingsRepository.save(setting);
      
      // Clear tenant cache
      const cacheKey = `tenant_${tenantId}`;
      this.tenantFeaturesCache.delete(cacheKey);
      
      this.logger.info(`Tenant feature updated: ${featureKey} = ${enabled} for tenant: ${tenantId} by ${modifiedBy}`);
    } catch (error) {
      this.logger.error(`Failed to update tenant feature: ${featureKey} for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Update multiple tenant features
   */
  async updateTenantFeatures(
    tenantId: string,
    features: Record<string, boolean>,
    modifiedBy?: string
  ): Promise<void> {
    try {
      for (const [featureKey, enabled] of Object.entries(features)) {
        await this.updateTenantFeature(tenantId, featureKey, enabled, modifiedBy || 'system');
      }
      
      this.logger.info(`Updated ${Object.keys(features).length} features for tenant: ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to update tenant features for tenant: ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Get all feature flags
   */
  getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlagsCache.values());
  }

  /**
   * Get feature flag by key
   */
  getFeatureFlag(featureKey: string): FeatureFlag | null {
    return this.featureFlagsCache.get(featureKey) || null;
  }

  /**
   * Check multiple features at once
   */
  async checkMultipleFeatures(
    featureKeys: string[],
    tenantId?: string
  ): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    
    for (const key of featureKeys) {
      if (tenantId) {
        result[key] = await this.isTenantFeatureEnabled(tenantId, key);
      } else {
        result[key] = this.isEnabled(key);
      }
    }
    
    return result;
  }

  /**
   * Load global feature flags from environment variables
   */
  private loadGlobalFeatureFlags(): Map<string, FeatureFlag> {
    const flags = new Map<string, FeatureFlag>();
    
    // Define default feature flags based on TodoList-v2.md
    const defaultFeatures = [
      'advancedAnalytics',
      'islamicBanking',
      'auditTrail',
      'stressTesting',
      'mobileApi',
      'workflowManagement',
      'syariahCompliance',
      'multiTenantArchitecture',
      'rbacAuthentication',
      'auditWorkflow',
      'bankingDataModels',
      'etlPipeline',
      'formsTemplates',
      'reactAdminFramework',
      'dualBankingConfiguration',
      'bankingResourceManagement',
      'rApiIntegration',
      'infrastructure',
      'legacyIntegration',
      'productionConfiguration'
    ];
    
    for (const feature of defaultFeatures) {
      const envKey = `FEATURE_${feature.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
      const mvpKey = `MVP_${feature.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
      
      const enabled = this.environmentService.get(envKey, false) || 
                     this.environmentService.get(mvpKey, false);
      
      flags.set(feature, {
        key: feature,
        name: this.formatFeatureName(feature),
        description: `Feature flag for ${this.formatFeatureName(feature)}`,
        enabled,
        environments: [],
        tenantOverrides: {},
        lastModified: new Date(),
        modifiedBy: 'system'
      });
    }
    
    return flags;
  }

  /**
   * Load feature flags from database
   */
  private async loadDatabaseFeatureFlags(): Promise<Map<string, FeatureFlag>> {
    const flags = new Map<string, FeatureFlag>();
    
    try {
      const settings = await this.appSettingsRepository.find({
        where: {
          category: 'features',
          tenantId: null // Global settings only
        }
      });
      
      for (const setting of settings) {
        const featureKey = setting.settingKey.replace('features.', '');
        
        flags.set(featureKey, {
          key: featureKey,
          name: setting.settingName || this.formatFeatureName(featureKey),
          description: setting.description || `Feature flag for ${featureKey}`,
          enabled: setting.settingValue === 'true',
          environments: setting.environmentScope ? [setting.environmentScope] : [],
          tenantOverrides: {},
          lastModified: setting.updatedAt || new Date(),
          modifiedBy: setting.updatedBy || 'system'
        });
      }
    } catch (error) {
      this.logger.warn('Failed to load feature flags from database', error);
    }
    
    return flags;
  }

  /**
   * Format feature name for display
   */
  private formatFeatureName(featureKey: string): string {
    return featureKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}
EOF
    log_success "Feature Flags Service generated successfully"
}

# Generate Tenant Configuration Service
generate_tenant_config_service() {
    log_info "Generating Tenant Configuration Service..."
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/config/tenant-config.service.ts" << 'EOF'
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
EOF
    log_success "Tenant Configuration Service generated successfully"
}

# Main execution
main() {
    log_info "Starting Day 1 Hour 4: Configuration Management System setup..."
    
    # Validate environment
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed"
        exit 1
    fi
    
    # Create directory structure and generate services
    setup_configuration_management
    generate_tenant_config_service
    
    log_success "Configuration Management System setup completed successfully!"
    log_info "Next steps:"
    log_info "1. Run environment validation: ./scripts/setup/d1h4-environment-validation.sh"
    log_info "2. Setup feature flags: ./scripts/setup/d1h4-feature-flags.sh"
    log_info "3. Configure tenant settings: ./scripts/setup/d1h4-tenant-config.sh"
    log_info "4. Run master configuration: ./scripts/setup/d1h4-master-config-system.sh"
}

# Execute main function
main "$@"