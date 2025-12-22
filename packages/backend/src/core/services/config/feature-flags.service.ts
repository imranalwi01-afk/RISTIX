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
