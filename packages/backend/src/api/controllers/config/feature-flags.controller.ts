// packages/backend/src/api/controllers/config/feature-flags.controller.ts
import { Request, Response, NextFunction } from 'express';
import { FeatureFlagsService } from '../../../core/services/config/feature-flags.service';
import { ValidationService } from '../../../core/services/config/validation.service';
import { Logger } from 'winston';

export class FeatureFlagsController {
  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly validationService: ValidationService,
    private readonly logger: Logger
  ) {}

  /**
   * Get all feature flags
   */
  async getAllFeatureFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const flags = this.featureFlagsService.getAllFeatureFlags();
      
      res.json({
        success: true,
        data: flags,
        total: flags.length
      });
    } catch (error) {
      this.logger.error('Failed to get all feature flags', error);
      next(error);
    }
  }

  /**
   * Get feature flag by key
   */
  async getFeatureFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const flag = this.featureFlagsService.getFeatureFlag(key);
      
      if (!flag) {
        res.status(404).json({
          success: false,
          error: 'Feature flag not found',
          code: 'FEATURE_FLAG_NOT_FOUND'
        });
        return;
      }
      
      res.json({
        success: true,
        data: flag
      });
    } catch (error) {
      this.logger.error(`Failed to get feature flag: ${req.params.key}`, error);
      next(error);
    }
  }

  /**
   * Check if feature is enabled
   */
  async checkFeature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const { tenantId } = req.query;
      
      let enabled: boolean;
      
      if (tenantId) {
        enabled = await this.featureFlagsService.isTenantFeatureEnabled(tenantId as string, key);
      } else {
        enabled = this.featureFlagsService.isEnabled(key);
      }
      
      res.json({
        success: true,
        data: {
          key,
          enabled,
          tenantId: tenantId || null,
          checkedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to check feature: ${req.params.key}`, error);
      next(error);
    }
  }

  /**
   * Check multiple features
   */
  async checkMultipleFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { features } = req.body;
      const { tenantId } = req.query;
      
      if (!Array.isArray(features)) {
        res.status(400).json({
          success: false,
          error: 'Features must be an array',
          code: 'INVALID_INPUT'
        });
        return;
      }
      
      const results = await this.featureFlagsService.checkMultipleFeatures(
        features,
        tenantId as string
      );
      
      res.json({
        success: true,
        data: results,
        tenantId: tenantId || null,
        checkedAt: new Date()
      });
    } catch (error) {
      this.logger.error('Failed to check multiple features', error);
      next(error);
    }
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const { enabled, description } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      // Validate input
      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'enabled must be a boolean',
          code: 'INVALID_INPUT'
        });
        return;
      }
      
      await this.featureFlagsService.updateFeatureFlag(key, enabled, modifiedBy);
      
      res.json({
        success: true,
        message: `Feature flag '${key}' updated successfully`,
        data: {
          key,
          enabled,
          modifiedBy,
          modifiedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update feature flag: ${req.params.key}`, error);
      next(error);
    }
  }

  /**
   * Get tenant features
   */
  async getTenantFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      
      const features = await this.featureFlagsService.getTenantFeatures(tenantId);
      
      res.json({
        success: true,
        data: features,
        tenantId,
        total: Object.keys(features).length
      });
    } catch (error) {
      this.logger.error(`Failed to get tenant features: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Update tenant feature
   */
  async updateTenantFeature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, key } = req.params;
      const { enabled } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'enabled must be a boolean',
          code: 'INVALID_INPUT'
        });
        return;
      }
      
      await this.featureFlagsService.updateTenantFeature(tenantId, key, enabled, modifiedBy);
      
      res.json({
        success: true,
        message: `Tenant feature '${key}' updated successfully`,
        data: {
          tenantId,
          key,
          enabled,
          modifiedBy,
          modifiedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update tenant feature: ${req.params.key} for tenant: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Update multiple tenant features
   */
  async updateTenantFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { features } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!features || typeof features !== 'object') {
        res.status(400).json({
          success: false,
          error: 'features must be an object',
          code: 'INVALID_INPUT'
        });
        return;
      }
      
      // Validate all values are boolean
      for (const [key, value] of Object.entries(features)) {
        if (typeof value !== 'boolean') {
          res.status(400).json({
            success: false,
            error: `Feature '${key}' must have a boolean value`,
            code: 'INVALID_INPUT'
          });
          return;
        }
      }
      
      await this.featureFlagsService.updateTenantFeatures(tenantId, features, modifiedBy);
      
      res.json({
        success: true,
        message: `Updated ${Object.keys(features).length} features for tenant`,
        data: {
          tenantId,
          features,
          modifiedBy,
          modifiedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Failed to update tenant features for tenant: ${req.params.tenantId}`, error);
      next(error);
    }
  }

  /**
   * Export feature flags configuration
   */
  async exportFeatureFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.query;
      
      let exportData: any;
      
      if (tenantId) {
        // Export tenant-specific features
        const tenantFeatures = await this.featureFlagsService.getTenantFeatures(tenantId as string);
        exportData = {
          type: 'tenant_features',
          tenantId,
          features: tenantFeatures,
          exportedAt: new Date(),
          exportedBy: req.user?.id || 'system'
        };
      } else {
        // Export all global feature flags
        const allFlags = this.featureFlagsService.getAllFeatureFlags();
        exportData = {
          type: 'global_features',
          flags: allFlags,
          exportedAt: new Date(),
          exportedBy: req.user?.id || 'system'
        };
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="feature-flags-${tenantId || 'global'}-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(exportData);
    } catch (error) {
      this.logger.error('Failed to export feature flags', error);
      next(error);
    }
  }

  /**
   * Import feature flags configuration
   */
  async importFeatureFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data } = req.body;
      const modifiedBy = req.user?.id || 'system';
      
      if (!data || !data.type) {
        res.status(400).json({
          success: false,
          error: 'Invalid import data format',
          code: 'INVALID_IMPORT_DATA'
        });
        return;
      }
      
      let importedCount = 0;
      
      if (data.type === 'tenant_features' && data.tenantId && data.features) {
        await this.featureFlagsService.updateTenantFeatures(data.tenantId, data.features, modifiedBy);
        importedCount = Object.keys(data.features).length;
      } else if (data.type === 'global_features' && data.flags) {
        for (const flag of data.flags) {
          await this.featureFlagsService.updateFeatureFlag(flag.key, flag.enabled, modifiedBy);
          importedCount++;
        }
      } else {
        res.status(400).json({
          success: false,
          error: 'Unsupported import data type',
          code: 'UNSUPPORTED_IMPORT_TYPE'
        });
        return;
      }
      
      res.json({
        success: true,
        message: `Successfully imported ${importedCount} feature flags`,
        data: {
          type: data.type,
          tenantId: data.tenantId || null,
          importedCount,
          importedBy: modifiedBy,
          importedAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error('Failed to import feature flags', error);
      next(error);
    }
  }

  /**
   * Feature flags health check
   */
  async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allFlags = this.featureFlagsService.getAllFeatureFlags();
      const enabledFlags = allFlags.filter(flag => flag.enabled);
      
      const healthData = {
        status: 'healthy',
        totalFlags: allFlags.length,
        enabledFlags: enabledFlags.length,
        disabledFlags: allFlags.length - enabledFlags.length,
        lastChecked: new Date(),
        featuresLoadTime: process.hrtime.bigint() // Simplified timing
      };
      
      res.json({
        success: true,
        data: healthData
      });
    } catch (error) {
      this.logger.error('Feature flags health check failed', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          lastChecked: new Date(),
          error: error.message
        }
      });
    }
  }
}
