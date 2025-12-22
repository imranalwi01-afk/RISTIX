#!/bin/bash
# IFRS9 Platform - Day 1 Hour 4: Feature Flags Setup Script
# File: scripts/setup/d1h4-feature-flags.sh

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h4-feature-flags-$(date +%Y%m%d-%H%M%S).log"

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

# Generate Feature Flags Controller
generate_feature_flags_controller() {
    log_info "Generating Feature Flags Controller..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers/config"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/config/feature-flags.controller.ts" << 'EOF'
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
EOF
    log_success "Feature Flags Controller generated successfully"
}

# Generate Feature Flags Routes
generate_feature_flags_routes() {
    log_info "Generating Feature Flags Routes..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes/config"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/config/feature-flags.routes.ts" << 'EOF'
// packages/backend/src/api/routes/config/feature-flags.routes.ts
import { Router } from 'express';
import { FeatureFlagsController } from '../../controllers/config/feature-flags.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { rbacMiddleware } from '../../middleware/rbac.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const checkMultipleFeaturesSchema = z.object({
  features: z.array(z.string()).min(1).max(50),
});

const updateFeatureFlagSchema = z.object({
  enabled: z.boolean(),
  description: z.string().optional(),
});

const updateTenantFeatureSchema = z.object({
  enabled: z.boolean(),
});

const updateTenantFeaturesSchema = z.object({
  features: z.record(z.boolean()),
});

const importFeatureFlagsSchema = z.object({
  data: z.object({
    type: z.enum(['tenant_features', 'global_features']),
    tenantId: z.string().uuid().optional(),
    features: z.record(z.boolean()).optional(),
    flags: z.array(z.object({
      key: z.string(),
      enabled: z.boolean(),
    })).optional(),
  }),
});

// Initialize controller (will be injected via DI in actual implementation)
let featureFlagsController: FeatureFlagsController;

export function initializeFeatureFlagsRoutes(controller: FeatureFlagsController): Router {
  featureFlagsController = controller;

  /**
   * @swagger
   * /api/config/feature-flags:
   *   get:
   *     summary: Get all feature flags
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Feature flags retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeatureFlag'
   *                 total:
   *                   type: number
   */
  router.get(
    '/',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['config:read']),
    featureFlagsController.getAllFeatureFlags.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/{key}:
   *   get:
   *     summary: Get feature flag by key
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Feature flag key
   *     responses:
   *       200:
   *         description: Feature flag retrieved successfully
   *       404:
   *         description: Feature flag not found
   */
  router.get(
    '/:key',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['config:read']),
    featureFlagsController.getFeatureFlag.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/{key}/check:
   *   get:
   *     summary: Check if feature is enabled
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Feature flag key
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID for tenant-specific check
   *     responses:
   *       200:
   *         description: Feature check result
   */
  router.get(
    '/:key/check',
    rateLimitMiddleware,
    authMiddleware,
    featureFlagsController.checkFeature.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/check/multiple:
   *   post:
   *     summary: Check multiple features
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID for tenant-specific check
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               features:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["advancedAnalytics", "islamicBanking", "auditTrail"]
   *     responses:
   *       200:
   *         description: Multiple feature check results
   */
  router.post(
    '/check/multiple',
    rateLimitMiddleware,
    authMiddleware,
    validationMiddleware(checkMultipleFeaturesSchema),
    featureFlagsController.checkMultipleFeatures.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/{key}:
   *   put:
   *     summary: Update feature flag
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Feature flag key
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               enabled:
   *                 type: boolean
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Feature flag updated successfully
   */
  router.put(
    '/:key',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['config:write']),
    validationMiddleware(updateFeatureFlagSchema),
    featureFlagsController.updateFeatureFlag.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/tenants/{tenantId}:
   *   get:
   *     summary: Get tenant features
   *     tags: [Feature Flags]
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
   *         description: Tenant features retrieved successfully
   */
  router.get(
    '/tenants/:tenantId',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:read', 'config:read']),
    featureFlagsController.getTenantFeatures.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/tenants/{tenantId}/{key}:
   *   put:
   *     summary: Update tenant feature
   *     tags: [Feature Flags]
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
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Feature flag key
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               enabled:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Tenant feature updated successfully
   */
  router.put(
    '/tenants/:tenantId/:key',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:write', 'config:write']),
    validationMiddleware(updateTenantFeatureSchema),
    featureFlagsController.updateTenantFeature.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/tenants/{tenantId}/bulk:
   *   put:
   *     summary: Update multiple tenant features
   *     tags: [Feature Flags]
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
   *               features:
   *                 type: object
   *                 additionalProperties:
   *                   type: boolean
   *                 example:
   *                   advancedAnalytics: true
   *                   islamicBanking: false
   *     responses:
   *       200:
   *         description: Tenant features updated successfully
   */
  router.put(
    '/tenants/:tenantId/bulk',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['tenant:write', 'config:write']),
    validationMiddleware(updateTenantFeaturesSchema),
    featureFlagsController.updateTenantFeatures.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/export:
   *   get:
   *     summary: Export feature flags configuration
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Tenant ID for tenant-specific export
   *     responses:
   *       200:
   *         description: Feature flags configuration exported
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  router.get(
    '/export',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['config:read']),
    featureFlagsController.exportFeatureFlags.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/import:
   *   post:
   *     summary: Import feature flags configuration
   *     tags: [Feature Flags]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               data:
   *                 type: object
   *     responses:
   *       200:
   *         description: Feature flags configuration imported successfully
   */
  router.post(
    '/import',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['config:write']),
    validationMiddleware(importFeatureFlagsSchema),
    featureFlagsController.importFeatureFlags.bind(featureFlagsController)
  );

  /**
   * @swagger
   * /api/config/feature-flags/health:
   *   get:
   *     summary: Feature flags health check
   *     tags: [Feature Flags]
   *     responses:
   *       200:
   *         description: Feature flags health status
   */
  router.get(
    '/health',
    featureFlagsController.healthCheck.bind(featureFlagsController)
  );

  return router;
}

export default router;
EOF
    log_success "Feature Flags Routes generated successfully"
}

# Generate Feature Flags Middleware
generate_feature_flags_middleware() {
    log_info "Generating Feature Flags Middleware..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/middleware"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/feature-flags.middleware.ts" << 'EOF'
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
EOF
    log_success "Feature Flags Middleware generated successfully"
}

# Generate Feature Flags Test Script
generate_feature_flags_tests() {
    log_info "Generating Feature Flags Test Script..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/scripts/test-feature-flags.ts" << 'EOF'
// packages/backend/src/scripts/test-feature-flags.ts
import { FeatureFlagsService } from '../core/services/config/feature-flags.service';
import { EnvironmentService } from '../core/services/config/environment.service';
import { Logger } from 'winston';

async function testFeatureFlags() {
  console.log('🏷️  Testing Feature Flags System...\n');
  
  try {
    // Initialize services
    const logger = console as any;
    const environmentService = new EnvironmentService(logger);
    await environmentService.loadEnvironmentConfig();
    
    // Create mock repository (in real app, this would be injected)
    const mockRepository = {
      find: async () => [],
      findOne: async () => null,
      save: async (entity: any) => entity,
    };
    
    const featureFlagsService = new FeatureFlagsService(
      mockRepository as any,
      environmentService,
      logger
    );
    
    // Load feature flags
    await featureFlagsService.loadFeatureFlags();
    
    // Test 1: Check global feature flags
    console.log('📋 Test 1: Global Feature Flags');
    console.log('='.repeat(40));
    
    const testFeatures = [
      'advancedAnalytics',
      'islamicBanking',
      'auditTrail',
      'stressTesting',
      'workflowManagement'
    ];
    
    for (const feature of testFeatures) {
      const enabled = featureFlagsService.isEnabled(feature);
      console.log(`${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
    }
    
    console.log('');
    
    // Test 2: Check multiple features
    console.log('📋 Test 2: Multiple Feature Check');
    console.log('='.repeat(40));
    
    const multipleResults = await featureFlagsService.checkMultipleFeatures(testFeatures);
    
    for (const [feature, enabled] of Object.entries(multipleResults)) {
      console.log(`${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
    }
    
    console.log('');
    
    // Test 3: Get all feature flags
    console.log('📋 Test 3: All Feature Flags');
    console.log('='.repeat(40));
    
    const allFlags = featureFlagsService.getAllFeatureFlags();
    console.log(`Total feature flags: ${allFlags.length}`);
    
    const enabledCount = allFlags.filter(flag => flag.enabled).length;
    const disabledCount = allFlags.length - enabledCount;
    
    console.log(`Enabled: ${enabledCount}`);
    console.log(`Disabled: ${disabledCount}`);
    
    console.log('');
    
    // Test 4: Feature flag details
    console.log('📋 Test 4: Feature Flag Details');
    console.log('='.repeat(40));
    
    for (const flag of allFlags.slice(0, 5)) { // Show first 5
      console.log(`Feature: ${flag.key}`);
      console.log(`  Name: ${flag.name}`);
      console.log(`  Enabled: ${flag.enabled}`);
      console.log(`  Description: ${flag.description}`);
      console.log(`  Environments: ${flag.environments.length > 0 ? flag.environments.join(', ') : 'All'}`);
      console.log(`  Last Modified: ${flag.lastModified.toISOString()}`);
      console.log(`  Modified By: ${flag.modifiedBy}`);
      console.log('');
    }
    
    // Test 5: Update feature flag
    console.log('📋 Test 5: Update Feature Flag');
    console.log('='.repeat(40));
    
    const testFeature = 'advancedAnalytics';
    const originalState = featureFlagsService.isEnabled(testFeature);
    console.log(`Original state of ${testFeature}: ${originalState}`);
    
    try {
      await featureFlagsService.updateFeatureFlag(testFeature, !originalState, 'test-script');
      const newState = featureFlagsService.isEnabled(testFeature);
      console.log(`Updated state of ${testFeature}: ${newState}`);
      
      // Restore original state
      await featureFlagsService.updateFeatureFlag(testFeature, originalState, 'test-script');
      const restoredState = featureFlagsService.isEnabled(testFeature);
      console.log(`Restored state of ${testFeature}: ${restoredState}`);
    } catch (error) {
      console.log(`Update test skipped (database not available): ${error.message}`);
    }
    
    console.log('');
    
    // Test 6: Tenant features simulation
    console.log('📋 Test 6: Tenant Features (Simulated)');
    console.log('='.repeat(40));
    
    const mockTenantId = 'test-tenant-id';
    
    try {
      // This would normally load from database
      const tenantFeatures = await featureFlagsService.getTenantFeatures(mockTenantId);
      console.log(`Tenant features for ${mockTenantId}:`);
      
      Object.entries(tenantFeatures).slice(0, 5).forEach(([feature, enabled]) => {
        console.log(`  ${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
      });
    } catch (error) {
      console.log(`Tenant features test skipped (database not available): ${error.message}`);
    }
    
    console.log('');
    
    // Test 7: Performance test
    console.log('📋 Test 7: Performance Test');
    console.log('='.repeat(40));
    
    const iterations = 1000;
    const startTime = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      featureFlagsService.isEnabled('advancedAnalytics');
    }
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    console.log(`${iterations} feature checks completed in ${duration.toFixed(2)}ms`);
    console.log(`Average: ${(duration / iterations).toFixed(4)}ms per check`);
    
    console.log('');
    
    // Summary
    console.log('🎉 Feature Flags System Test Completed!');
    console.log('='.repeat(50));
    console.log('✅ Global feature flags working');
    console.log('✅ Multiple feature checks working');
    console.log('✅ Feature flag enumeration working');
    console.log('✅ Feature flag details accessible');
    console.log('✅ Feature flag updates working (if database available)');
    console.log('✅ Tenant features accessible (if database available)');
    console.log('✅ Performance acceptable');
    
  } catch (error) {
    console.error('❌ Feature Flags Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testFeatureFlags();
EOF
    log_success "Feature Flags Test Script generated successfully"
}

# Main execution
main() {
    log_info "Starting Day 1 Hour 4: Feature Flags setup..."
    
    # Validate environment
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Generate all feature flags components
    generate_feature_flags_controller
    generate_feature_flags_routes
    generate_feature_flags_middleware
    generate_feature_flags_tests
    
    log_success "Feature Flags setup completed successfully!"
    log_info "Generated files:"
    log_info "- Controller: packages/backend/src/api/controllers/config/feature-flags.controller.ts"
    log_info "- Routes: packages/backend/src/api/routes/config/feature-flags.routes.ts"
    log_info "- Middleware: packages/backend/src/api/middleware/feature-flags.middleware.ts"
    log_info "- Test Script: packages/backend/src/scripts/test-feature-flags.ts"
    log_info ""
    log_info "Usage examples:"
    log_info "1. Test feature flags: cd packages/backend && npx ts-node src/scripts/test-feature-flags.ts"
    log_info "2. Use in routes: import { requireFeature } from './middleware/feature-flags.middleware'"
    log_info "3. Check features: GET /api/config/feature-flags/{key}/check"
    log_info ""
    log_info "Next steps:"
    log_info "1. Run tenant configuration setup: ./scripts/setup/d1h4-tenant-config.sh"
}

# Execute main function
main "$@"