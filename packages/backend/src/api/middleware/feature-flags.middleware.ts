// packages/backend/src/api/middleware/feature-flags.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { FeatureFlagsService } from '../../core/services/config/feature-flags.service';
import { Logger } from 'winston';

export interface FeatureRequest extends Request {
  features?: Record<string, boolean>;
  tenantFeatures?: Record<string, boolean>;
}

/**
 * Middleware to check feature flags
 */
export function requireFeature(featureKey: string) {
  return async (req: FeatureRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const featureFlagsService = req.app.get('featureFlagsService') as FeatureFlagsService;
      const tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
      
      let enabled: boolean;
      
      if (tenantId) {
        enabled = await featureFlagsService.isTenantFeatureEnabled(tenantId, featureKey);
      } else {
        enabled = featureFlagsService.isEnabled(featureKey);
      }
      
      if (!enabled) {
        res.status(403).json({
          success: false,
          error: `Feature '${featureKey}' is not enabled`,
          code: 'FEATURE_DISABLED',
          feature: featureKey,
          tenantId: tenantId || null
        });
        return;
      }
      
      next();
    } catch (error) {
      const logger = req.app.get('logger') as Logger;
      logger.error(`Feature flag check failed for '${featureKey}'`, error);
      
      res.status(500).json({
        success: false,
        error: 'Feature flag check failed',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware to check multiple features (all must be enabled)
 */
export function requireFeatures(featureKeys: string[]) {
  return async (req: FeatureRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const featureFlagsService = req.app.get('featureFlagsService') as FeatureFlagsService;
      const tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
      
      const results = await featureFlagsService.checkMultipleFeatures(featureKeys, tenantId);
      const disabledFeatures = featureKeys.filter(key => !results[key]);
      
      if (disabledFeatures.length > 0) {
        res.status(403).json({
          success: false,
          error: `Required features are not enabled: ${disabledFeatures.join(', ')}`,
          code: 'FEATURES_DISABLED',
          disabledFeatures,
          tenantId: tenantId || null
        });
        return;
      }
      
      // Attach feature results to request for later use
      req.features = results;
      
      next();
    } catch (error) {
      const logger = req.app.get('logger') as Logger;
      logger.error(`Multiple feature flags check failed for: ${featureKeys.join(', ')}`, error);
      
      res.status(500).json({
        success: false,
        error: 'Feature flags check failed',
        code: 'FEATURES_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware to check any of the features (at least one must be enabled)
 */
export function requireAnyFeature(featureKeys: string[]) {
  return async (req: FeatureRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const featureFlagsService = req.app.get('featureFlagsService') as FeatureFlagsService;
      const tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
      
      const results = await featureFlagsService.checkMultipleFeatures(featureKeys, tenantId);
      const enabledFeatures = featureKeys.filter(key => results[key]);
      
      if (enabledFeatures.length === 0) {
        res.status(403).json({
          success: false,
          error: `None of the required features are enabled: ${featureKeys.join(', ')}`,
          code: 'NO_FEATURES_ENABLED',
          checkedFeatures: featureKeys,
          tenantId: tenantId || null
        });
        return;
      }
      
      // Attach feature results to request for later use
      req.features = results;
      
      next();
    } catch (error) {
      const logger = req.app.get('logger') as Logger;
      logger.error(`Any feature flags check failed for: ${featureKeys.join(', ')}`, error);
      
      res.status(500).json({
        success: false,
        error: 'Feature flags check failed',
        code: 'FEATURES_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware to load tenant features into request
 */
export function loadTenantFeatures() {
  return async (req: FeatureRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const featureFlagsService = req.app.get('featureFlagsService') as FeatureFlagsService;
      const tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;
      
      if (tenantId) {
        req.tenantFeatures = await featureFlagsService.getTenantFeatures(tenantId);
      }
      
      next();
    } catch (error) {
      const logger = req.app.get('logger') as Logger;
      logger.error('Failed to load tenant features', error);
      
      // Don't fail the request, just continue without features
      next();
    }
  };
}

/**
 * Banking-specific feature middleware
 */
export const requireIslamicBanking = requireFeature('islamicBanking');
export const requireConventionalBanking = requireFeature('conventionalBanking');
export const requireDualBanking = requireFeatures(['islamicBanking', 'conventionalBanking']);
export const requireSyariahCompliance = requireFeature('syariahCompliance');
export const requireAdvancedAnalytics = requireFeature('advancedAnalytics');
export const requireAuditTrail = requireFeature('auditTrail');
export const requireStressTesting = requireFeature('stressTesting');
export const requireWorkflowManagement = requireFeature('workflowManagement');
export const requireMobileApi = requireFeature('mobileApi');

/**
 * MVP-specific feature middleware
 */
export const requireMvpMultiTenant = requireFeature('multiTenantArchitecture');
export const requireMvpRbac = requireFeature('rbacAuthentication');
export const requireMvpAuditWorkflow = requireFeature('auditWorkflow');
export const requireMvpBankingDataModels = requireFeature('bankingDataModels');
export const requireMvpEtlPipeline = requireFeature('etlPipeline');
export const requireMvpFormsTemplates = requireFeature('formsTemplates');
export const requireMvpReactAdmin = requireFeature('reactAdminFramework');
export const requireMvpDualBankingConfig = requireFeature('dualBankingConfiguration');
export const requireMvpBankingResourceManagement = requireFeature('bankingResourceManagement');
export const requireMvpRApiIntegration = requireFeature('rApiIntegration');
export const requireMvpInfrastructure = requireFeature('infrastructure');
export const requireMvpLegacyIntegration = requireFeature('legacyIntegration');
export const requireMvpProductionConfig = requireFeature('productionConfiguration');

/**
 * Combined feature middleware for common use cases
 */
export const requireBankingFeatures = requireAnyFeature(['islamicBanking', 'conventionalBanking']);
export const requireAnalyticsFeatures = requireAnyFeature(['advancedAnalytics', 'basicAnalytics']);
export const requireReportingFeatures = requireAnyFeature(['basicReports', 'advancedReports']);
export const requireComplianceFeatures = requireAnyFeature(['auditTrail', 'syariahCompliance']);

export default {
  requireFeature,
  requireFeatures,
  requireAnyFeature,
  loadTenantFeatures,
  // Banking-specific
  requireIslamicBanking,
  requireConventionalBanking,
  requireDualBanking,
  requireSyariahCompliance,
  requireAdvancedAnalytics,
  requireAuditTrail,
  requireStressTesting,
  requireWorkflowManagement,
  requireMobileApi,
  // MVP-specific
  requireMvpMultiTenant,
  requireMvpRbac,
  requireMvpAuditWorkflow,
  requireMvpBankingDataModels,
  requireMvpEtlPipeline,
  requireMvpFormsTemplates,
  requireMvpReactAdmin,
  requireMvpDualBankingConfig,
  requireMvpBankingResourceManagement,
  requireMvpRApiIntegration,
  requireMvpInfrastructure,
  requireMvpLegacyIntegration,
  requireMvpProductionConfig,
  // Combined
  requireBankingFeatures,
  requireAnalyticsFeatures,
  requireReportingFeatures,
  requireComplianceFeatures
};
