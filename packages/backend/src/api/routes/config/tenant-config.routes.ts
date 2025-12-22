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
