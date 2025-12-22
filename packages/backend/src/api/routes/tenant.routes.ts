// packages/backend/src/api/routes/tenant.routes.ts
// Tenant Management Routes - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md routing patterns

import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';

const router = Router();
const tenantController = new TenantController();

// Platform-level tenant management (no tenant context required)
router.post('/tenants', tenantController.createTenant.bind(tenantController));
router.get('/tenants', tenantController.listTenants.bind(tenantController));
router.get('/tenants/:tenantId', tenantController.getTenant.bind(tenantController));
router.get('/tenants/slug/:tenantSlug', tenantController.getTenantBySlug.bind(tenantController));
router.get('/health/tenants', tenantController.getTenantHealth.bind(tenantController));

// Tenant-specific routes (require tenant context)
router.get('/tenant/current', tenantController.getCurrentTenant.bind(tenantController));
router.get('/tenant/features', tenantController.getTenantFeatures.bind(tenantController));

// Banking type specific routes
router.get('/tenant/syariah-info', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Syariah banking information endpoint',
      bankingType: (req as any).tenant?.bankingType,
      compliance: (req as any).tenant?.settings
    }
  });
});

router.get('/tenant/conventional-info', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Conventional banking information endpoint',
      bankingType: (req as any).tenant?.bankingType
    }
  });
});

// Feature-specific routes
router.get('/tenant/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Advanced analytics endpoint',
      tenantId: (req as any).tenant?.id,
      features: (req as any).tenant?.features
    }
  });
});

export default router;