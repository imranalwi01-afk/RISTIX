// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/routes/forms.routes.ts
// Generated: $(date)
// Phase: D2H3-P09 - Form API Routes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express, FormBuilderService, FormTemplateEngine
// Purpose: REST API endpoints for dynamic form management
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';
import { validateTenant } from '../middleware/tenant.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { FormBuilderService } from '../../core/services/platform/FormBuilderService';
import { FormTemplateEngine } from '../../core/services/platform/FormTemplateEngine';
import { BankingFormTemplates } from '../../core/templates/banking/BankingFormTemplates';
import { SyariahComplianceForms } from '../../core/forms/syariah/SyariahComplianceForms';

const router = Router();

// Initialize services
const formBuilderService = new FormBuilderService();
const formTemplateEngine = new FormTemplateEngine();

// Validation schemas
const createFormValidation = [
  body('name').notEmpty().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('description').optional().isString().isLength({ max: 500 }),
  body('bankingType').isIn(['conventional', 'syariah', 'both']).withMessage('Invalid banking type'),
  body('category').notEmpty().withMessage('Category is required'),
  body('fields').isArray({ min: 1 }).withMessage('At least one field is required'),
  body('fields.*.id').notEmpty().withMessage('Field ID is required'),
  body('fields.*.type').isIn(['text', 'email', 'number', 'select', 'checkbox', 'date', 'file', 'currency', 'textarea']).withMessage('Invalid field type'),
  body('fields.*.label').notEmpty().withMessage('Field label is required'),
  body('submitUrl').isURL().withMessage('Valid submit URL is required'),
  body('validationRules').optional().isArray()
];

const updateFormValidation = [
  param('id').isUUID().withMessage('Valid form ID is required'),
  body('name').optional().isLength({ min: 3, max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('bankingType').optional().isIn(['conventional', 'syariah', 'both']),
  body('fields').optional().isArray(),
  body('submitUrl').optional().isURL(),
  body('validationRules').optional().isArray()
];

const getFormValidation = [
  param('id').isUUID().withMessage('Valid form ID is required')
];

const listFormsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().isString(),
  query('bankingType').optional().isIn(['conventional', 'syariah', 'both']),
  query('search').optional().isString().isLength({ max: 100 })
];

// Middleware stack
const authMiddleware = [authenticate, validateTenant, authorize(['read'])];
const writeMiddleware = [authenticate, validateTenant, authorize(['write']), auditLog];

/**
 * GET /api/forms
 * Get all forms with filtering and pagination
 */
router.get('/forms', 
  ...authMiddleware,
  listFormsValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { page = 1, limit = 20, category, bankingType, search } = req.query;
      const tenantId = req.tenant?.id;

      const result = await formBuilderService.listForms({
        tenantId,
        page: Number(page),
        limit: Number(limit),
        category: category as string,
        bankingType: bankingType as 'conventional' | 'syariah' | 'both',
        search: search as string
      });

      res.json({
        success: true,
        data: result.forms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          pages: Math.ceil(result.total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/forms/:id
 * Get specific form by ID
 */
router.get('/forms/:id',
  ...authMiddleware,
  getFormValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const tenantId = req.tenant?.id;

      const form = await formBuilderService.getForm(id, tenantId);

      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }

      res.json({
        success: true,
        data: form
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/forms
 * Create new form
 */
router.post('/forms',
  ...writeMiddleware,
  createFormValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const tenantId = req.tenant?.id;
      const userId = req.user?.id;
      const formData = req.body;

      const form = await formBuilderService.createForm({
        ...formData,
        tenantId,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Form created successfully',
        data: form
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/forms/:id
 * Update existing form
 */
router.put('/forms/:id',
  ...writeMiddleware,
  updateFormValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const userId = req.user?.id;
      const updateData = req.body;

      const form = await formBuilderService.updateForm(id, {
        ...updateData,
        tenantId,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Form updated successfully',
        data: form
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/forms/:id
 * Delete form
 */
router.delete('/forms/:id',
  ...writeMiddleware,
  getFormValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const tenantId = req.tenant?.id;

      await formBuilderService.deleteForm(id, tenantId);

      res.json({
        success: true,
        message: 'Form deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/forms/templates
 * Get available form templates
 */
router.get('/forms/templates',
  ...authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenant?.id;
      const bankingType = req.query.bankingType as 'conventional' | 'syariah' | 'both';

      const templates = await formTemplateEngine.getAvailableTemplates(tenantId, bankingType);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/forms/from-template/:templateId
 * Create form from template
 */
router.post('/forms/from-template/:templateId',
  ...writeMiddleware,
  param('templateId').notEmpty().withMessage('Template ID is required'),
  body('name').notEmpty().withMessage('Form name is required'),
  body('customizations').optional().isObject(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { templateId } = req.params;
      const { name, customizations } = req.body;
      const tenantId = req.tenant?.id;
      const userId = req.user?.id;

      const form = await formTemplateEngine.createFormFromTemplate(templateId, {
        name,
        tenantId,
        createdBy: userId,
        customizations
      });

      res.status(201).json({
        success: true,
        message: 'Form created from template successfully',
        data: form
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/forms/:id/clone
 * Clone existing form
 */
router.post('/forms/:id/clone',
  ...writeMiddleware,
  getFormValidation,
  body('name').notEmpty().withMessage('New form name is required'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name } = req.body;
      const tenantId = req.tenant?.id;
      const userId = req.user?.id;

      const clonedForm = await formBuilderService.cloneForm(id, {
        name,
        tenantId,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Form cloned successfully',
        data: clonedForm
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/forms/:id/submissions
 * Get form submissions
 */
router.get('/forms/:id/submissions',
  ...authMiddleware,
  getFormValidation,
  listFormsValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const tenantId = req.tenant?.id;

      const result = await formBuilderService.getFormSubmissions(id, {
        tenantId,
        page: Number(page),
        limit: Number(limit)
      });

      res.json({
        success: true,
        data: result.submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          pages: Math.ceil(result.total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/forms/:id/submit
 * Submit form data
 */
router.post('/forms/:id/submit',
  authenticate,
  validateTenant,
  getFormValidation,
  body('data').isObject().withMessage('Form data is required'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { data } = req.body;
      const tenantId = req.tenant?.id;
      const userId = req.user?.id;

      const submission = await formBuilderService.submitForm(id, {
        data,
        tenantId,
        submittedBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Form submitted successfully',
        data: submission
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
