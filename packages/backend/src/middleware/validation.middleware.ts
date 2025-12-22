// packages/backend/src/middleware/validation.middleware.ts
// ============================================================================
// IFRS9 PLATFORM - VALIDATION MIDDLEWARE
// ============================================================================
// File Path: packages/backend/src/middleware/validation.middleware.ts
// Updated: 2025-08-06
// Purpose: Request validation middleware for banking operations
// Dependencies: joi, express
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Banking Type Validation Schema
 */
export const bankingTypeSchema = Joi.string()
  .valid('conventional', 'syariah', 'dual')
  .default('conventional')
  .messages({
    'any.only': 'Banking type must be either conventional, syariah, or dual'
  });

/**
 * UUID Validation Schema
 */
export const uuidSchema = Joi.string()
  .guid({ version: 'uuidv4' })
  .required()
  .messages({
    'string.guid': 'Invalid UUID format',
    'any.required': 'UUID is required'
  });

/**
 * Pagination Validation Schema
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC')
});

/**
 * Banking Parameter Validation Schemas
 */
export const productParameterSchema = Joi.object({
  data_source: Joi.string().required().messages({
    'any.required': 'Data source is required'
  }),
  prd_group: Joi.string().required().messages({
    'any.required': 'Product group is required'
  }),
  prd_type: Joi.string().required().messages({
    'any.required': 'Product type is required'
  }),
  prd_code: Joi.string().required().messages({
    'any.required': 'Product code is required'
  }),
  prd_desc: Joi.string().required().messages({
    'any.required': 'Product description is required'
  }),
  currency: Joi.string().length(3).default('IDR').messages({
    'string.length': 'Currency must be 3 characters (e.g., IDR, USD)'
  }),
  amortization_type: Joi.string().valid('EIR', 'SL', 'COMPOUND').default('EIR').messages({
    'any.only': 'Amortization type must be EIR, SL, or COMPOUND'
  }),
  al_flag: Joi.string().valid('A', 'L').default('A').messages({
    'any.only': 'AL flag must be A (Asset) or L (Liability)'
  }),
  impaired_flag: Joi.boolean().default(false),
  bm_flag: Joi.boolean().default(false),
  active_flag: Joi.boolean().default(true),
  banking_type: bankingTypeSchema
});

/**
 * Journal Parameter Validation Schema
 */
export const journalParameterSchema = Joi.object({
  gl_group: Joi.string().required().messages({
    'any.required': 'GL group is required'
  }),
  currency: Joi.string().length(3).default('IDR'),
  gl_type: Joi.string().valid('BALANCE_SHEET', 'INCOME_STATEMENT', 'MEMO').required().messages({
    'any.required': 'GL type is required',
    'any.only': 'GL type must be BALANCE_SHEET, INCOME_STATEMENT, or MEMO'
  }),
  gl_code: Joi.string().required().messages({
    'any.required': 'GL code is required'
  }),
  gl_number: Joi.string().required().messages({
    'any.required': 'GL number is required'
  }),
  dbcr: Joi.string().valid('D', 'C').required().messages({
    'any.required': 'Debit/Credit indicator is required',
    'any.only': 'DBCR must be D (Debit) or C (Credit)'
  }),
  gl_desc: Joi.string().required().messages({
    'any.required': 'GL description is required'
  }),
  active_flag: Joi.boolean().default(true),
  banking_type: bankingTypeSchema
});

/**
 * General Parameter Validation Schema (for frs9_param_commond/commonh) - CREATE
 */
export const generalParameterSchema = Joi.object({
  param_code: Joi.string().required().messages({
    'any.required': 'Parameter code is required'
  }),
  param_name: Joi.string().required().messages({
    'any.required': 'Parameter name is required'
  }),
  param_usage: Joi.string().allow('').optional(),
  param_type: Joi.string().valid('A', 'B', 'S').required().messages({
    'any.required': 'Parameter type is required',
    'any.only': 'Parameter type must be A (Application), B (Business), or S (System)'
  }),
  details: Joi.array().items(
    Joi.object({
      param_seq: Joi.number().integer().min(1).required(),
      value1: Joi.string().allow('').optional(),
      value2: Joi.string().allow('').optional(),
      value3: Joi.string().allow('').optional(),
      paramdesc: Joi.string().allow('').optional()
    })
  ).min(1).messages({
    'array.min': 'At least one parameter detail is required'
  }),
  banking_type: bankingTypeSchema
});

/**
 * General Parameter Update Validation Schema (for frs9_param_commond/commonh) - UPDATE
 * param_code is not required as it comes from URL parameters
 */
export const generalParameterUpdateSchema = Joi.object({
  param_name: Joi.string().optional().messages({
    'any.required': 'Parameter name is required'
  }),
  param_usage: Joi.string().allow('').optional(),
  param_value: Joi.string().allow('').optional(), // For frontend compatibility
  param_desc: Joi.string().allow('').optional(),  // For frontend compatibility
  param_type: Joi.string().valid('A', 'B', 'S').optional().messages({
    'any.only': 'Parameter type must be A (Application), B (Business), or S (System)'
  }),
  details: Joi.array().items(
    Joi.object({
      param_seq: Joi.number().integer().min(1).optional(),
      value1: Joi.string().allow('').optional(),
      value2: Joi.string().allow('').optional(),
      value3: Joi.string().allow('').optional(),
      paramdesc: Joi.string().allow('').optional()
    })
  ).optional(),
  banking_type: bankingTypeSchema
});

/**
 * Syariah Compliance Validation
 */
export const syariahComplianceSchema = Joi.object({
  is_syariah_compliant: Joi.boolean().default(false),
  syariah_contract_type: Joi.when('is_syariah_compliant', {
    is: true,
    then: Joi.string().valid('MURABAHA', 'IJARAH', 'MUSHARAKAH', 'MUDHARABAH', 'SALAM', 'ISTISNA').required(),
    otherwise: Joi.string().optional()
  }),
  dps_approval_required: Joi.boolean().default(false),
  profit_sharing_ratio: Joi.when('syariah_contract_type', {
    is: Joi.string().valid('MUSHARAKAH', 'MUDHARABAH'),
    then: Joi.number().min(0).max(100),
    otherwise: Joi.number().optional()
  })
});

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationErrors
      });
      return;
    }

    // Replace the original data with validated/sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Validate banking type compatibility
 */
export const validateBankingTypeAccess = (req: Request, res: Response, next: NextFunction): void => {
  const userBankingType = req.user?.bankingType;
  const requestedBankingType = req.body.banking_type || req.query.banking_type || 'conventional';

  // Platform admins can access any banking type
  if (req.user?.roles.includes('PLATFORM_ADMIN')) {
    return next();
  }

  // Check if user has access to requested banking type
  if (userBankingType === 'dual' || userBankingType === requestedBankingType) {
    return next();
  }

  res.status(403).json({
    success: false,
    error: 'Banking type access denied',
    code: 'BANKING_TYPE_ACCESS_DENIED',
    message: `User with ${userBankingType} access cannot access ${requestedBankingType} banking operations`
  });
};

/**
 * Validate Syariah compliance requirements
 */
export const validateSyariahCompliance = (req: Request, res: Response, next: NextFunction): void => {
  const { banking_type, is_syariah_compliant } = req.body;

  if (banking_type === 'syariah' || is_syariah_compliant) {
    // Check if user has Syariah certification
    if (!req.user?.syariahCertified) {
      return res.status(403).json({
        success: false,
        error: 'Syariah certification required',
        code: 'SYARIAH_CERTIFICATION_REQUIRED',
        message: 'Only Syariah-certified users can handle Islamic banking operations'
      });
    }

    // Validate Syariah-specific fields
    const { error } = syariahComplianceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Syariah compliance validation failed',
        code: 'SYARIAH_VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
  }

  next();
};

/**
 * Pre-configured validation middleware
 */
export const validatePagination = validate(paginationSchema, 'query');
export const validateProductParameter = validate(productParameterSchema);
export const validateJournalParameter = validate(journalParameterSchema);
export const validateGeneralParameter = validate(generalParameterSchema);
export const validateGeneralParameterUpdate = validate(generalParameterUpdateSchema);
export const validateUuidParam = validate(Joi.object({ id: uuidSchema }), 'params');

/**
 * Banking parameter update validation
 */
export const validateParameterUpdate = (req: Request, res: Response, next: NextFunction): void => {
  // Only allow updates to specific fields
  const allowedFields = [
    'prd_desc', 'currency', 'amortization_type', 'al_flag', 'impaired_flag', 
    'bm_flag', 'active_flag', 'gl_desc', 'param_name', 'param_usage', 'details'
  ];
  
  const updateFields = Object.keys(req.body);
  const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
  
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid update fields',
      code: 'INVALID_UPDATE_FIELDS',
      details: {
        invalidFields,
        allowedFields
      }
    });
  }
  
  next();
};

export default {
  validate,
  validatePagination,
  validateProductParameter,
  validateJournalParameter,
  validateGeneralParameter,
  validateGeneralParameterUpdate,
  validateBankingTypeAccess,
  validateSyariahCompliance,
  validateParameterUpdate
};