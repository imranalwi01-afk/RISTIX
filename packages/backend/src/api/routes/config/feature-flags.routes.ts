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
