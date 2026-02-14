// packages/backend/src/api/controllers/frs9-parameter.controller.ts
// ============================================================================
// 🔧 COMPREHENSIVE CRUD FIX: All 4 Parameter Types with Unified Transformers
// ============================================================================
// ✅ FIXED: Uses unified data transformers for consistent structure
// ✅ FIXED: Application Settings → frs9_param_commonh (corrected table)
// ✅ FIXED: Business Settings → frs9_param_commonh
// ✅ FIXED: Product Parameters → frs9_param_product
// ✅ FIXED: Journal Parameters → frs9_param_journal
// ✅ ENHANCED: Complete CRUD operations with proper error handling
// ============================================================================

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import { appConfig } from "../../config/app.config";
import { databaseConfig } from '../../core/database/config/database.config';
import {
  ParamCommonh,
  ParamCommond,
  ParamProduct,
  ParamJournal,
  checkFRS9DatabaseHealth
} from '../../core/models/frs9-parameter.models';

// Import unified data transformers
import {
  applicationTransformers,
  businessTransformers,
  productTransformers,
  journalTransformers,
  cleanData,
  validateRequired
} from '../transformers/parameter-transformers';

// Auth context interface - using global Express.Request extension from types/tenant.types.ts
// The global Express.Request already has user?: TenantUser property

// Helper function to get audit context
const getAuditContext = (req: Request) => {
  const userContext = req.user || { userId: 'SYSTEM', email: 'system@ifrs9.local' };
  return {
    createdby: userContext.email || 'SYSTEM',
    createdhost: req.ip || req.connection?.remoteAddress || 'localhost',
    updatedby: userContext.email || 'SYSTEM',
    updatedhost: req.ip || req.connection?.remoteAddress || 'localhost'
  };
};

// ✅ UPDATED: Data transformation helper for both System and Business parameters
// Removed legacy transformApplicationData function - now using unified applicationTransformers

// ✅ FIXED: Validation schemas with better error messages and proper constraints
const createParamHeaderSchema = z.object({
  param_code: z.string()
    .min(1, 'Parameter code is required')
    .max(10, 'Parameter code must be 10 characters or less')
    .regex(/^[A-Z0-9_-]+$/, 'Parameter code must contain only uppercase letters, numbers, underscores, and hyphens'),
  param_name: z.string().max(255).min(1).optional().default('Application Parameter'),
  param_usage: z.string().max(255).min(1).optional().default('System configuration parameter'),
  param_type: z.string().max(10).min(1).optional(), // Made optional since controller overrides this
  details: z.array(z.object({
    param_seq: z.number().int().min(1),
    value1: z.string().max(100),
    value2: z.string().max(100),
    value3: z.string().max(50),
    paramdesc: z.string().max(1000)
  })).optional()
});

const createProductSchema = z.object({
  data_source: z.string().max(20).min(1),
  prd_group: z.string().max(20).min(1),
  prd_type: z.string().max(20).min(1),
  prd_code: z.string().max(20).min(1),
  prd_desc: z.string().max(255).min(1),
  currency: z.string().max(5).min(1),
  amortization_type: z.string().max(10).optional(),
  al_flag: z.string().max(1).optional(),
  impaired_flag: z.boolean().optional(),
  bm_flag: z.boolean().optional(),
  expected_life: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().optional()),
  borrowing_rate: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  market_rate: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  active_flag: z.boolean().default(true)
});

// Separate update schema that allows partial updates and handles empty strings
const updateProductSchema = z.object({
  data_source: z.string().max(20).optional(),
  prd_group: z.string().max(20).optional(),
  prd_type: z.string().max(20).optional(),
  prd_code: z.string().max(20).optional(),
  prd_desc: z.string().max(255).optional(),
  currency: z.string().max(5).optional(),
  amortization_type: z.string().max(10).optional(),
  al_flag: z.string().max(1).optional(),
  impaired_flag: z.boolean().optional(),
  bm_flag: z.boolean().optional(),
  expected_life: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().optional()),
  borrowing_rate: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  market_rate: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  active_flag: z.boolean().optional()
});

const createJournalSchema = z.object({
  gl_group: z.string().max(20).optional(),
  currency: z.string().max(3).optional(),
  gl_type: z.string().max(20).optional(),
  gl_code: z.string().max(20).optional(),
  gl_number: z.string().max(20).optional(),
  dbcr: z.string().max(1).optional(),
  gl_desc: z.string().max(255).optional(),
  active_flag: z.boolean().default(true)
});

export class FRS9ParameterController {

  // ==========================================
  // HEALTH CHECK & DATABASE STATUS
  // ==========================================

  async checkDatabaseHealth(req: Request, res: Response): Promise<void> {
    try {
      console.log('🏥 [FRS9] Checking database health');

      const health = await checkFRS9DatabaseHealth();

      // ✅ ADDED: Database structure validation
      const structureInfo = await this.validateDatabaseStructure();

      if (health.connection === 'healthy') {
        res.status(200).json({
          success: true,
          data: {
            ...health,
            structure: structureInfo
          },
          message: 'FRS9 database is healthy - DS2 connection working'
        });
      } else {
        res.status(503).json({
          success: false,
          data: {
            ...health,
            structure: structureInfo
          },
          error: 'FRS9 database connection issues detected',
          code: 'DATABASE_UNHEALTHY'
        });
      }
    } catch (error) {
      console.error('❌ [FRS9] Database health check error:', error);
      res.status(503).json({
        success: false,
        error: 'Failed to check database health',
        code: 'HEALTH_CHECK_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ NEW: Database structure validation
  private async validateDatabaseStructure() {
    try {
      const systemParams = await ParamCommonh.count({ where: { param_type: 'S' } });
      const businessParams = await ParamCommonh.count({ where: { param_type: 'B' } });
      const applicationParams = await ParamCommonh.count({ where: { param_type: 'A' } });
      const totalDetails = await ParamCommond.count();
      const totalProducts = await ParamProduct.count();
      const totalJournals = await ParamJournal.count();

      return {
        table_counts: {
          system_parameters: systemParams,
          business_parameters: businessParams,
          application_parameters: applicationParams,
          total_details: totalDetails,
          product_parameters: totalProducts,
          journal_parameters: totalJournals
        },
        available_param_types: ['S', 'B'],
        notes: {
          application_setup: applicationParams > 0 ?
            'Using param_type = A' :
            'No param_type = A found, using param_type = S (System) instead',
          schema_compliance: 'No active_flag column in frs9_param_commonh table'
        }
      };
    } catch (error) {
      return {
        error: 'Failed to validate database structure',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==========================================
  // ✅ FIXED: APPLICATION SETUP METHODS (Now uses System parameters)
  // ==========================================

  async getApplicationSetup(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 [FRS9] Getting application setup parameters with master-detail relationship');

      // ✅ FIXED: Use frs9_param_commonh table for Application Settings with param_type = ['A', 'S'] (Application + System parameters)
      // ✅ ENHANCED: Include associated detail records for proper master-detail display
      const applications = await ParamCommonh.findAll({
        where: {
          param_type: ['A', 'S']
        },
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false, // LEFT JOIN to include headers even without details
          order: [['details', 'param_seq', 'ASC']]
        }],
        order: [['param_code', 'ASC']]
      });

      console.log(`✅ [FRS9] Found ${applications.length} application parameters from frs9_param_commonh`);

      // Debug: Show parameter types found
      const paramTypesFound = [...new Set(applications.map(app => app.param_type))];
      console.log(`📋 [FRS9] Parameter types found: ${paramTypesFound.join(', ')}`);

      // ✅ FIXED: Properly transform master-detail data for frontend display
      const transformedData = applications.map((app: any) => {
        const appData = app.get ? app.get({ plain: true }) : app;
        const details = appData.details || [];

        // Compute display value from detail records (legacy behavior)
        const displayValue = details.length > 0
          ? details.map((detail: any) => `${detail.value1}${detail.value2 ? ` (${detail.value2})` : ''}`).join(', ')
          : appData.param_name || 'No details';

        // Return proper master-detail structure matching EXACT legacy DataTables format
        return {
          ID: appData.pkid.toString(),              // Legacy DataTables expects ID as string
          CommonCode: appData.param_code,            // Legacy expects CommonCode
          Description: appData.param_name,           // Legacy expects Description
          Value: displayValue,                      // Legacy expects Value
          ParamType: appData.param_type,             // Legacy expects ParamType
          ParamUsage: appData.param_usage,           // Legacy expects ParamUsage
          DetailCount: details.length,               // Number of detail records
          param_category: 'Application',            // Legacy expects param_category
          is_editable: true,
          active_flag: true,
          created_by: appData.createdby,
          created_date: appData.createddate,
          updated_by: appData.updatedby,
          updated_date: appData.updateddate,
          // Include full details for master-detail view
          details: details.map((detail: any) => ({
            ID: detail.pkid.toString(),
            ParamCode: detail.param_code,
            SeqNo: detail.param_seq,
            Value1: detail.value1,
            Value2: detail.value2,
            Value3: detail.value3,
            Description: detail.paramdesc,
            param_seq: detail.param_seq,
            value1: detail.value1,
            value2: detail.value2,
            value3: detail.value3,
            paramdesc: detail.paramdesc,
            pkid: detail.pkid,
            param_code: detail.param_code
          }))
        };
      });

      console.log('✅ [FRS9] Application setup transformed with master-detail data:', transformedData.length, 'parameters');

      // Get database configuration
      const databaseConfig = appConfig.platformDb;

      res.status(200).json({
        success: true,
        data: transformedData,
        total: transformedData.length,
        message: `Successfully retrieved ${transformedData.length} application parameters`,
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_commonh',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get application setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get application setup parameters',
        code: 'GET_APPLICATION_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ NEW: Get application setup headers only (parameter headers without details)
  async getApplicationSetupHeaders(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 [FRS9] Getting application setup headers (parameters only) using unified transformers');

      // ✅ FIXED: Use frs9_param_commonh table for Application Settings with param_type = 'A' OR 'S'
      const applications = await ParamCommonh.findAll({
        where: {
          param_type: ['A', 'S']
        },
        order: [['param_code', 'ASC']]
      });

      console.log(`✅ [FRS9] Found ${applications.length} application parameters from frs9_param_commonh`);

      // ✅ NEW: Return only header information without details
      const transformedData = applications.map(app => ({
        param_code: app.param_code,
        param_name: app.param_name,
        param_usage: app.param_usage,
        param_type: app.param_type,
        createdby: app.createdby,
        createddate: app.createddate,
        createdhost: app.createdhost,
        updatedby: app.updatedby,
        updateddate: app.updateddate,
        updatedhost: app.updatedhost
      }));

      console.log('✅ [FRS9] Application setup headers transformed:', transformedData.length, 'headers');

      // Get database configuration
      const databaseConfig = appConfig.platformDb;

      res.status(200).json({
        success: true,
        data: transformedData,
        total: transformedData.length,
        message: `Successfully retrieved ${transformedData.length} application parameter headers`,
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_commonh',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get application setup headers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get application setup headers',
        code: 'GET_APPLICATION_SETUP_HEADERS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ UPDATED: Debug method with actual database analysis
  async getApplicationSetupDebug(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [FRS9] Debug application setup - detailed analysis with actual data');

      // Check what parameter types actually exist
      const paramTypeCounts = await ParamCommonh.findAll({
        attributes: [
          'param_type',
          [ParamCommonh.sequelize!.fn('COUNT', ParamCommonh.sequelize!.col('param_type')), 'count']
        ],
        group: ['param_type'],
        raw: true
      });

      // Get system parameters (since no application parameters exist)
      const systemParams = await ParamCommonh.findAll({
        where: { param_type: 'S' },
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }],
        order: [['param_code', 'ASC']],
        limit: 3 // Just a few for debugging
      });

      // Get raw data as plain objects
      const rawData = systemParams.map(app => app.get({ plain: true }));

      // Transform data using unified transformers
      const transformedData = systemParams.map(app => applicationTransformers.toFrontend(app));

      // Get database configuration
      const databaseConfig = appConfig.platformDb;

      res.status(200).json({
        success: true,
        debug: {
          timestamp: new Date().toISOString(),
          database: `DS2 FRS9PRO (${databaseConfig.frs9.host}:${databaseConfig.frs9.port})`,
          database_analysis: {
            param_type_distribution: paramTypeCounts,
            total_headers: await ParamCommonh.count(),
            total_details: await ParamCommond.count(),
            application_params_A: await ParamCommonh.count({ where: { param_type: 'A' } }),
            system_params_S: await ParamCommonh.count({ where: { param_type: 'S' } }),
            business_params_B: await ParamCommonh.count({ where: { param_type: 'B' } })
          },
          api_behavior: {
            application_setup_endpoint: 'Uses param_type = S (System) instead of A',
            reason: 'No param_type = A found in database',
            fallback_strategy: 'Map System parameters as Application Setup',
            data_returned: transformedData.length
          },
          data_structure: {
            raw_sample: rawData.length > 0 ? rawData[0] : null,
            transformed_sample: transformedData.length > 0 ? transformedData[0] : null,
            transformation_mapping: {
              'param_desc': 'from param_name or param_usage',
              'param_value': 'from details[0].value1',
              'param_category': 'SYSTEM (when param_type = S)',
              'is_editable': 'hardcoded to true',
              'active_flag': 'hardcoded to true (no active_flag column in DB)'
            }
          },
          schema_notes: {
            missing_columns: ['active_flag'],
            param_code_max_length: '10 chars (header) vs 50 chars (detail)',
            available_param_types: ['S', 'B'],
            recommendation: 'Consider using param_type = S for application setup'
          }
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Debug application setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to debug application setup',
        code: 'DEBUG_APPLICATION_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createApplicationSetup(req: Request, res: Response): Promise<void> {
    try {
      console.log('➕ [FRS9] Creating application setup parameter using unified transformers');
      console.log('📋 [FRS9] Request body received:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Validate required fields using unified validator
      const validationErrors = validateRequired(req.body, 'application');
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      // ✅ NEW: Use unified application transformer for database format
      const transformedData = applicationTransformers.toDatabase(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed payload using unified transformer:', JSON.stringify(transformedData, null, 2));

      // ✅ FIXED: Create in frs9_param_commonh table with param_type = 'S' (System/Application)
      const applicationParam = await ParamCommonh.create(cleanData({ ...transformedData, param_type: 'S' }));

      console.log('✅ [FRS9] Application setup parameter created successfully');

      // ✅ NEW: Use unified transformer for response
      const responseData = applicationTransformers.toFrontend(applicationParam);

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Application setup parameter created successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Create application setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create application setup parameter',
        code: 'CREATE_APPLICATION_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateApplicationSetup(req: Request, res: Response): Promise<void> {
    try {
      const { param_code } = req.params;
      console.log('📝 [FRS9] Updating application setup parameter using unified transformers:', param_code);

      // ✅ FIXED: Validate required fields using unified validator (for UPDATE operation)
      const validationErrors = validateRequired(req.body, 'application', true);
      if (validationErrors.length > 0) {
        console.log('❌ [FRS9] Validation failed:', validationErrors);
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      console.log('✅ [FRS9] Validation passed for UPDATE operation');

      const auditContext = getAuditContext(req);

      console.log('📋 [FRS9] Update request body:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Use unified application transformer for update data
      const updateData = applicationTransformers.toUpdateData(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed update data using unified transformer:', JSON.stringify(updateData, null, 2));

      // ✅ FIXED: Update in frs9_param_commonh table (header table, not detail table!)
      const [updatedCount] = await ParamCommonh.update(cleanData(updateData), {
        where: { param_code }
      });

      if (updatedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Application setup parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with param_code: ${param_code}`
        });
        return;
      }

      // ✅ NEW: Get updated record and transform for response
      const updatedRecord = await ParamCommonh.findOne({ where: { param_code } });
      const responseData = updatedRecord ? applicationTransformers.toFrontend(updatedRecord) : null;

      console.log('✅ [FRS9] Application setup parameter updated successfully');

      res.status(200).json({
        success: true,
        data: responseData,
        message: 'Application setup parameter updated successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Update application setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update application setup parameter',
        code: 'UPDATE_APPLICATION_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteApplicationSetup(req: Request, res: Response): Promise<void> {
    try {
      const { param_code } = req.params;
      console.log('🗑️ [FRS9] Deleting application setup parameter:', param_code);

      // ✅ FIXED: Delete from frs9_param_commonh table
      const deletedCount = await ParamCommonh.destroy({
        where: { param_code }
      });

      if (deletedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Application setup parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with param_code: ${param_code}`
        });
        return;
      }

      console.log('✅ [FRS9] Application setup parameter deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Application setup parameter deleted successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Delete application setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete application setup parameter',
        code: 'DELETE_APPLICATION_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // APPLICATION SETUP DETAIL METHODS (Master-Detail Operations)
  // ==========================================

  async getApplicationSetupDetails(req: Request, res: Response): Promise<void> {
    let client: any = null;
    try {
      const paramCode = req.params.param_code || req.params.paramCode;
      console.log(`📋 [FRS9] Getting application setup details for param_code: ${paramCode}`);

      // Validate parameter code
      if (!paramCode || paramCode.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Parameter code is required',
          code: 'MISSING_PARAM_CODE'
        });
        return;
      }

      // ✅ FIXED: Use centralized database configuration singleton
      const frs9Pool = databaseConfig.getFRS9Connection();

      console.log(`🔗 [FRS9] Using FRS9 database connection from centralized pool`);

      // Get a client from the pool
      client = await frs9Pool.connect();

      // ✅ LEGACY PATTERN: Direct SQL query following legacy DataTables pattern
      const query = `
        SELECT
          pkid,
          param_code,
          param_seq,
          value1,
          value2,
          value3,
          paramdesc,
          createdby,
          createddate,
          updatedby,
          updateddate
        FROM frs9_param_commond
        WHERE param_code = $1
        ORDER BY param_seq ASC
      `;

      console.log(`🔍 [FRS9] Executing SQL query: ${query.replace(/\s+/g, ' ').substring(0, 100)}...`);

      const result = await client.query(query, [paramCode]);

      console.log(`✅ [FRS9] SQL query successful. Found ${result.rows.length} detail records for param_code: ${paramCode}`);

      // ✅ LEGACY PATTERN: Transform to DataTables server-side format
      const transformedDetails = result.rows.map((row: any, index: number) => ({
        // DataTables primary key (required)
        ID: row.pkid.toString(),

        // Display columns matching legacy frontend
        SeqNo: row.param_seq,
        Value1: row.value1,
        Value2: row.value2,
        Value3: row.value3,
        Description: row.paramdesc,

        // Legacy DataTables compatibility
        pkid: row.pkid,
        param_seq: row.param_seq,
        value1: row.value1,
        value2: row.value2,
        value3: row.value3,
        paramdesc: row.paramdesc,
        param_code: row.param_code,
        created_by: row.createdby,
        created_date: row.createddate,
        updated_by: row.updatedby,
        updated_date: row.updateddate
      }));

      // ✅ LEGACY PATTERN: Return DataTables server-side response format
      res.status(200).json({
        success: true,
        data: transformedDetails,
        total: transformedDetails.length,
        message: `Successfully retrieved ${transformedDetails.length} detail records for ${paramCode}`,
        database_info: {
          host: 'FRS9PRO via centralized connection pool',
          database: 'FRS9PRO',
          table: 'frs9_param_commond',
          connection: 'PostgreSQL via centralized pool'
        },
        legacy_compatibility: {
          pattern: 'DataTables server-side processing',
          source: 'FRS9PRO database',
          table: 'frs9_param_commond',
          columns: ['ID', 'SeqNo', 'Value1', 'Value2', 'Value3', 'Description']
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get application setup details error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to get application setup details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to get application setup details',
        code: 'GET_APPLICATION_SETUP_DETAILS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      // ✅ FIXED: Always release the client back to the pool
      if (client) {
        client.release();
        console.log('🔄 [FRS9] Database client released back to connection pool');
      }
    }
  }

  async createApplicationSetupDetail(req: Request, res: Response): Promise<void> {
    try {
      const paramCode = req.params.param_code || req.params.paramCode;
      console.log(`➕ [FRS9] Creating application setup detail for param_code: ${paramCode}`);
      console.log('📋 [FRS9] Request body:', JSON.stringify(req.body, null, 2));

      const auditContext = getAuditContext(req);

      // ✅ UPDATED: Comprehensive duplicate check for param_code + param_seq OR Value1, Value2, Value3
      const duplicate = await ParamCommond.findOne({
        where: {
          param_code: paramCode,
          [Op.or]: [
            { param_seq: req.body.param_seq || req.body.SeqNo },
            {
              value1: req.body.value1 || req.body.Value1,
              value2: req.body.value2 || req.body.Value2 || '',
              value3: req.body.value3 || req.body.Value3 || ''
            }
          ]
        }
      });

      if (duplicate) {
        const isSeqDuplicate = duplicate.param_seq === (req.body.param_seq || req.body.SeqNo);
        res.status(400).json({
          success: false,
          error: 'DUPLICATE_ERROR',
          message: isSeqDuplicate ? 'Sequence already exists' : 'data already exist',
          code: 'DATA_ALREADY_EXIST'
        });
        return;
      }

      const detailData = {
        param_code: paramCode,
        param_seq: req.body.param_seq || req.body.SeqNo,
        value1: req.body.value1 || req.body.Value1,
        value2: req.body.value2 || req.body.Value2 || '',
        value3: req.body.value3 || req.body.Value3 || '',
        paramdesc: req.body.paramdesc || req.body.Description || '',
        createdby: auditContext.createdby,
        createddate: new Date(),
        createdhost: auditContext.createdhost
      };

      const newDetail = await ParamCommond.create(detailData);

      console.log('✅ [FRS9] Application setup detail created successfully');

      res.status(201).json({
        success: true,
        data: {
          ID: newDetail.pkid.toString(),
          SeqNo: newDetail.param_seq,
          Value1: newDetail.value1,
          Value2: newDetail.value2,
          Value3: newDetail.value3,
          Description: newDetail.paramdesc,
          ParamCode: newDetail.param_code
        },
        message: 'Application setup detail created successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Create application setup detail error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to create application setup detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to create application setup detail',
        code: 'CREATE_APPLICATION_SETUP_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateApplicationSetupDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.detail_id || req.params.id;
      console.log(`📝 [FRS9] Updating application setup detail ID: ${id}`);

      // ✅ UPDATED: Duplicate check for param_seq OR Value1, Value2, Value3 (excluding current record)
      const currentDetail = await ParamCommond.findByPk(id);
      if (currentDetail) {
          const duplicate = await ParamCommond.findOne({
            where: {
              param_code: currentDetail.param_code,
              pkid: { [Op.ne]: id },
              [Op.or]: [
                { param_seq: req.body.param_seq || req.body.SeqNo },
                {
                  value1: req.body.value1 || req.body.Value1,
                  value2: req.body.value2 || req.body.Value2 || '',
                  value3: req.body.value3 || req.body.Value3 || ''
                }
              ]
            }
          });

          if (duplicate) {
            const isSeqDuplicate = duplicate.param_seq === (req.body.param_seq || req.body.SeqNo);
            res.status(400).json({
              success: false,
              error: 'DUPLICATE_ERROR',
              message: isSeqDuplicate ? 'Sequence already exists' : 'data already exist',
              code: 'DATA_ALREADY_EXIST'
            });
            return;
          }
      }

      const auditContext = getAuditContext(req);

      const updateData = {
        param_seq: req.body.param_seq || req.body.SeqNo,
        value1: req.body.value1 || req.body.Value1,
        value2: req.body.value2 || req.body.Value2 || '',
        value3: req.body.value3 || req.body.Value3 || '',
        paramdesc: req.body.paramdesc || req.body.Description || '',
        updatedby: auditContext.updatedby || auditContext.createdby,
        updateddate: new Date(),
        updatedhost: auditContext.updatedhost || auditContext.createdhost
      };

      const [updatedCount] = await ParamCommond.update(updateData, {
        where: { pkid: id }
      });

      if (updatedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Application setup detail not found',
          code: 'DETAIL_NOT_FOUND',
          details: `No detail found with ID: ${id}`
        });
        return;
      }

      const updatedDetail = await ParamCommond.findOne({ where: { pkid: id } });

      console.log('✅ [FRS9] Application setup detail updated successfully');

      res.status(200).json({
        success: true,
        data: {
          ID: updatedDetail!.pkid.toString(),
          SeqNo: updatedDetail!.param_seq,
          Value1: updatedDetail!.value1,
          Value2: updatedDetail!.value2,
          Value3: updatedDetail!.value3,
          Description: updatedDetail!.paramdesc,
          ParamCode: updatedDetail!.param_code
        },
        message: 'Application setup detail updated successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Update application setup detail error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to update application setup detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to update application setup detail',
        code: 'UPDATE_APPLICATION_SETUP_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteApplicationSetupDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.detail_id || req.params.id;
      console.log(`🗑️ [FRS9] Deleting application setup detail ID: ${id}`);

      const deletedCount = await ParamCommond.destroy({
        where: { pkid: id }
      });

      if (deletedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Application setup detail not found',
          code: 'DETAIL_NOT_FOUND',
          details: `No detail found with ID: ${id}`
        });
        return;
      }

      console.log('✅ [FRS9] Application setup detail deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Application setup detail deleted successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Delete application setup detail error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to delete application setup detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to delete application setup detail',
        code: 'DELETE_APPLICATION_SETUP_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // BUSINESS SETUP METHODS (Already working correctly)
  // ==========================================

  async getBusinessSetup(req: Request, res: Response): Promise<void> {
    try {
      console.log('🏢 [FRS9] Getting business setup parameters using unified transformers');

      // ✅ FIXED: Use frs9_param_commonh table for Business Settings WITH details
      const business = await ParamCommonh.findAll({
        where: { param_type: 'B' },
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false // LEFT JOIN to include records without details
        }],
        order: [['param_code', 'ASC']]
      });

      console.log(`✅ [FRS9] Found ${business.length} business parameters from frs9_param_commonh`);

      // ✅ NEW: Use unified business transformers
      const transformedData = business.map(biz => businessTransformers.toFrontend(biz));

      console.log('✅ [FRS9] Business setup transformed using unified transformers:', transformedData.length, 'parameters');

      // Get database configuration
      const databaseConfig = appConfig.platformDb;

      res.status(200).json({
        success: true,
        data: transformedData,
        total: transformedData.length,
        message: `Successfully retrieved ${transformedData.length} business parameters`,
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_commonh',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get business setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get business setup parameters',
        code: 'GET_BUSINESS_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createBusinessSetup(req: Request, res: Response): Promise<void> {
    try {
      console.log('➕ [FRS9] Creating business setup parameter using unified transformers');
      console.log('📋 [FRS9] Request body received:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Validate required fields using unified validator
      const validationErrors = validateRequired(req.body, 'business');
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      // ✅ NEW: Use unified business transformer for database format
      const transformedData = businessTransformers.toDatabase(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed payload using unified transformer:', JSON.stringify(transformedData, null, 2));

      // ✅ FIXED: Create in frs9_param_commonh table
      const businessParam = await ParamCommonh.create(cleanData(transformedData));

      console.log('✅ [FRS9] Business setup parameter created successfully');

      // ✅ NEW: Use unified transformer for response
      const responseData = businessTransformers.toFrontend(businessParam);

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Business setup parameter created successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Create business setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create business setup parameter',
        code: 'CREATE_BUSINESS_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ NEW: Update Business Setup method
  async updateBusinessSetup(req: Request, res: Response): Promise<void> {
    try {
      const { param_code } = req.params;
      console.log('📝 [FRS9] Updating business setup parameter using unified transformers:', param_code);

      // ✅ FIXED: Pass true for isUpdate to skip param_code validation in body
      const validationErrors = validateRequired(req.body, 'business', true);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      // ✅ NEW: Use unified business transformer for update data
      const updateData = businessTransformers.toUpdateData(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed update data using unified transformer:', JSON.stringify(updateData, null, 2));

      // ✅ FIXED: Update in frs9_param_commonh table
      const [updatedCount] = await ParamCommonh.update(cleanData(updateData), {
        where: { param_code }
      });

      if (updatedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Business setup parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with param_code: ${param_code}`
        });
        return;
      }

      // ✅ NEW: Get updated record and transform for response
      const updatedRecord = await ParamCommonh.findOne({ where: { param_code } });
      const responseData = updatedRecord ? businessTransformers.toFrontend(updatedRecord) : null;

      console.log('✅ [FRS9] Business setup parameter updated successfully');

      res.status(200).json({
        success: true,
        data: responseData,
        message: 'Business setup parameter updated successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Update business setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update business setup parameter',
        code: 'UPDATE_BUSINESS_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ NEW: Delete Business Setup method
  async deleteBusinessSetup(req: Request, res: Response): Promise<void> {
    try {
      const { param_code } = req.params;
      console.log('🗑️ [FRS9] Deleting business setup parameter:', param_code);

      // ✅ FIXED: Delete from frs9_param_commonh table
      const deletedCount = await ParamCommonh.destroy({
        where: { param_code }
      });

      if (deletedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Business setup parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with param_code: ${param_code}`
        });
        return;
      }

      console.log('✅ [FRS9] Business setup parameter deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Business setup parameter deleted successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Delete business setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete business setup parameter',
        code: 'DELETE_BUSINESS_SETUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // PRODUCT PARAMETERS METHODS (No changes needed)
  // ==========================================

  async getProductParameters(req: Request, res: Response): Promise<void> {
    try {
      console.log('📦 [FRS9] Getting product parameters using unified transformers');

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // ✅ FIXED: Use frs9_param_product table for Product Parameters
      const { count, rows } = await ParamProduct.findAndCountAll({
        limit,
        offset,
        order: [['prd_code', 'ASC']]
      });

      console.log(`✅ [FRS9] Found ${count} product parameters from frs9_param_product (page ${page})`);

      // ✅ NEW: Use unified product transformers
      const transformedData = rows.map(product => productTransformers.toFrontend(product));

      console.log('✅ [FRS9] Product parameters transformed using unified transformers:', transformedData.length, 'parameters');

      // Get database configuration
      const databaseConfig = appConfig.platformDb;

      res.status(200).json({
        success: true,
        data: transformedData,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        },
        message: `Successfully retrieved ${transformedData.length} product parameters`,
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_product',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get product parameters error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product parameters',
        code: 'GET_PRODUCT_PARAMETERS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createProductParameter(req: Request, res: Response): Promise<void> {
    try {
      console.log('➕ [FRS9] Creating product parameter using unified transformers');
      console.log('📋 [FRS9] Request body received:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Validate required fields using unified validator
      const validationErrors = validateRequired(req.body, 'product');
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      // ✅ NEW: Use unified product transformer for database format
      const transformedData = productTransformers.toDatabase(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed payload using unified transformer:', JSON.stringify(transformedData, null, 2));

      // ✅ FIXED: Create in frs9_param_product table
      const productParam = await ParamProduct.create(cleanData(transformedData));

      console.log('✅ [FRS9] Product parameter created successfully');

      // ✅ NEW: Use unified transformer for response
      const responseData = productTransformers.toFrontend(productParam);

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Product parameter created successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Create product parameter error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product parameter',
        code: 'CREATE_PRODUCT_PARAMETER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateProductParameter(req: Request, res: Response): Promise<void> {
    try {
      const { prd_code } = req.params;
      console.log('📝 [FRS9] Updating product parameter using unified transformers:', prd_code);

      // ✅ NEW: Validate required fields using unified validator
      const validationErrors = validateRequired(req.body, 'product');
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      console.log('📋 [FRS9] Update request body:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Use unified product transformer for update data
      const updateData = productTransformers.toUpdateData(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed update data using unified transformer:', JSON.stringify(updateData, null, 2));

      // ✅ FIXED: Update in frs9_param_product table
      const [updatedCount] = await ParamProduct.update(cleanData(updateData), {
        where: { prd_code }
      });

      if (updatedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Product parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with prd_code: ${prd_code}`
        });
        return;
      }

      // ✅ NEW: Get updated record and transform for response
      const updatedRecord = await ParamProduct.findOne({ where: { prd_code } });
      const responseData = updatedRecord ? productTransformers.toFrontend(updatedRecord) : null;

      console.log('✅ [FRS9] Product parameter updated successfully');

      res.status(200).json({
        success: true,
        data: responseData,
        message: 'Product parameter updated successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Update product parameter error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product parameter',
        code: 'UPDATE_PRODUCT_PARAMETER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteProductParameter(req: Request, res: Response): Promise<void> {
    try {
      const { prd_code } = req.params;
      console.log('🗑️ [FRS9] Deleting product parameter:', prd_code);

      // ✅ FIXED: Delete from frs9_param_product table
      const deletedCount = await ParamProduct.destroy({
        where: { prd_code }
      });

      if (deletedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Product parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with prd_code: ${prd_code}`
        });
        return;
      }

      console.log('✅ [FRS9] Product parameter deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Product parameter deleted successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Delete product parameter error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product parameter',
        code: 'DELETE_PRODUCT_PARAMETER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // JOURNAL PARAMETERS METHODS (No changes needed)
  // ==========================================

  async getJournalParameters(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 [FRS9] Getting journal parameters using unified transformers');

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // ✅ FIXED: Use frs9_param_journal table for Journal Parameters
      const { count, rows } = await ParamJournal.findAndCountAll({
        limit,
        offset,
        order: [['gl_code', 'ASC']]
      });

      console.log(`✅ [FRS9] Found ${count} journal parameters from frs9_param_journal (page ${page})`);

      // ✅ NEW: Use unified journal transformers
      const transformedData = rows.map(journal => journalTransformers.toFrontend(journal));

      console.log('✅ [FRS9] Journal parameters transformed using unified transformers:', transformedData.length, 'parameters');

      // Get database configuration
      const databaseConfig = appConfig.platformDb;

      res.status(200).json({
        success: true,
        data: transformedData,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        },
        message: `Successfully retrieved ${transformedData.length} journal parameters`,
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_journal',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get journal parameters error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get journal parameters',
        code: 'GET_JOURNAL_PARAMETERS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      console.log('➕ [FRS9] Creating journal parameter using unified transformers');
      console.log('📋 [FRS9] Request body received:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Validate required fields using unified validator
      const validationErrors = validateRequired(req.body, 'journal');
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      // ✅ NEW: Use unified journal transformer for database format
      const transformedData = journalTransformers.toDatabase(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed payload using unified transformer:', JSON.stringify(transformedData, null, 2));

      // ✅ FIXED: Create in frs9_param_journal table
      const journalParam = await ParamJournal.create(cleanData(transformedData));

      console.log('✅ [FRS9] Journal parameter created successfully');

      // ✅ NEW: Use unified transformer for response
      const responseData = journalTransformers.toFrontend(journalParam);

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Journal parameter created successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Create journal parameter error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create journal parameter',
        code: 'CREATE_JOURNAL_PARAMETER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      const { gl_code } = req.params;
      console.log('📝 [FRS9] Updating journal parameter using unified transformers:', gl_code);

      // ✅ FIXED: Pass true for isUpdate to skip param_code validation in body
      const validationErrors = validateRequired(req.body, 'journal', true);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      const auditContext = getAuditContext(req);

      console.log('📋 [FRS9] Update request body:', JSON.stringify(req.body, null, 2));

      // ✅ NEW: Use unified journal transformer for update data
      const updateData = journalTransformers.toUpdateData(req.body, auditContext);

      console.log('🔄 [FRS9] Transformed update data using unified transformer:', JSON.stringify(updateData, null, 2));

      // ✅ FIXED: Update in frs9_param_journal table
      const [updatedCount] = await ParamJournal.update(cleanData(updateData), {
        where: { gl_code }
      });

      if (updatedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Journal parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with gl_code: ${gl_code}`
        });
        return;
      }

      // ✅ NEW: Get updated record and transform for response
      const updatedRecord = await ParamJournal.findOne({ where: { gl_code } });
      const responseData = updatedRecord ? journalTransformers.toFrontend(updatedRecord) : null;

      console.log('✅ [FRS9] Journal parameter updated successfully');

      res.status(200).json({
        success: true,
        data: responseData,
        message: 'Journal parameter updated successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Update journal parameter error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update journal parameter',
        code: 'UPDATE_JOURNAL_PARAMETER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      const { gl_code } = req.params;
      console.log('🗑️ [FRS9] Deleting journal parameter:', gl_code);

      // ✅ FIXED: Delete from frs9_param_journal table
      const deletedCount = await ParamJournal.destroy({
        where: { gl_code }
      });

      if (deletedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Journal parameter not found',
          code: 'PARAMETER_NOT_FOUND',
          details: `No parameter found with gl_code: ${gl_code}`
        });
        return;
      }

      console.log('✅ [FRS9] Journal parameter deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Journal parameter deleted successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Delete journal parameter error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete journal parameter',
        code: 'DELETE_JOURNAL_PARAMETER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBusinessSetupDetails(req: Request, res: Response): Promise<void> {
    let client;
    try {
      const paramCode = req.params.param_code || req.params.paramCode;
      console.log(`📋 [FRS9] Fetching business setup details for param_code: ${paramCode}`);

      // ✅ FIXED: Use pool.connect() to get a client for direct SQL execution
      const { pool } = require('../../core/database/connection');
      client = await pool.connect();
      console.log('🔌 [FRS9] Connected to DS2 database pool for master-detail query');

      const query = `
        SELECT 
          pkid::text as "ID",
          param_seq as "SeqNo",
          value1 as "Value1",
          value2 as "Value2",
          value3 as "Value3",
          paramdesc as "Description"
        FROM frs9_param_commond
        WHERE param_code = $1
        ORDER BY param_seq ASC
      `;

      const result = await client.query(query, [paramCode]);
      console.log(`✅ [FRS9] Found ${result.rows.length} details for ${paramCode}`);

      res.status(200).json({
        success: true,
        data: result.rows,
        meta: {
          total: result.rows.length,
          param_code: paramCode,
          columns: ['ID', 'SeqNo', 'Value1', 'Value2', 'Value3', 'Description']
        }
      });

    } catch (error) {
      console.error('❌ [FRS9] Get business setup details error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to get business setup details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to get business setup details',
        code: 'GET_BUSINESS_SETUP_DETAILS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      if (client) {
        client.release();
        console.log('🔄 [FRS9] Database client released back to connection pool');
      }
    }
  }

  async createBusinessSetupDetail(req: Request, res: Response): Promise<void> {
    try {
      const paramCode = req.params.param_code || req.params.paramCode;
      console.log(`➕ [FRS9] Creating business setup detail for param_code: ${paramCode}`);

      const auditContext = getAuditContext(req);

      // ✅ UPDATED: Comprehensive duplicate check for param_code + param_seq OR Value1, Value2, Value3
      const duplicate = await ParamCommond.findOne({
        where: {
          param_code: paramCode,
          [Op.or]: [
            { param_seq: req.body.param_seq || req.body.SeqNo },
            {
              value1: req.body.value1 || req.body.Value1,
              value2: req.body.value2 || req.body.Value2 || '',
              value3: req.body.value3 || req.body.Value3 || ''
            }
          ]
        }
      });

      if (duplicate) {
        const isSeqDuplicate = duplicate.param_seq === (req.body.param_seq || req.body.SeqNo);
        res.status(400).json({
          success: false,
          error: 'DUPLICATE_ERROR',
          message: isSeqDuplicate ? 'Sequence already exists' : 'data already exist',
          code: 'DATA_ALREADY_EXIST'
        });
        return;
      }

      const detailData = {
        param_code: paramCode,
        param_seq: req.body.param_seq || req.body.SeqNo,
        value1: req.body.value1 || req.body.Value1,
        value2: req.body.value2 || req.body.Value2 || '',
        value3: req.body.value3 || req.body.Value3 || '',
        paramdesc: req.body.paramdesc || req.body.Description || '',
        createdby: auditContext.createdby,
        createddate: new Date(),
        createdhost: auditContext.createdhost
      };

      const newDetail = await ParamCommond.create(detailData);

      console.log('✅ [FRS9] Business setup detail created successfully');

      res.status(201).json({
        success: true,
        data: {
          ID: newDetail.pkid.toString(),
          SeqNo: newDetail.param_seq,
          Value1: newDetail.value1,
          Value2: newDetail.value2,
          Value3: newDetail.value3,
          Description: newDetail.paramdesc,
          ParamCode: newDetail.param_code
        },
        message: 'Business setup detail created successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Create business setup detail error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to create business setup detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to create business setup detail',
        code: 'CREATE_BUSINESS_SETUP_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateBusinessSetupDetail(req: Request, res: Response): Promise<void> {
    try {
      const { detail_id } = req.params;
      const id = detail_id || req.body.ID || req.body.id;
      
      console.log(`📝 [FRS9] Updating business setup detail: ${id}`);

      // ✅ ADDED: Duplicate check for param_seq OR Value1, Value2, Value3 (excluding current record)
      const currentDetail = await ParamCommond.findByPk(id);
      if (currentDetail) {
        const duplicate = await ParamCommond.findOne({
          where: {
            param_code: currentDetail.param_code,
            pkid: { [Op.ne]: id },
            [Op.or]: [
              { param_seq: req.body.param_seq || req.body.SeqNo },
              {
                value1: req.body.value1 || req.body.Value1,
                value2: req.body.value2 || req.body.Value2 || '',
                value3: req.body.value3 || req.body.Value3 || ''
              }
            ]
          }
        });

        if (duplicate) {
          const isSeqDuplicate = duplicate.param_seq === (req.body.param_seq || req.body.SeqNo);
          res.status(400).json({
            success: false,
            error: 'DUPLICATE_ERROR',
            message: isSeqDuplicate ? 'Sequence already exists' : 'data already exist',
            code: 'DATA_ALREADY_EXIST'
          });
          return;
        }
      }

      const auditContext = getAuditContext(req);

      const updateData = {
        param_seq: req.body.param_seq || req.body.SeqNo,
        value1: req.body.value1 || req.body.Value1,
        value2: req.body.value2 || req.body.Value2 || '',
        value3: req.body.value3 || req.body.Value3 || '',
        paramdesc: req.body.paramdesc || req.body.Description || '',
        updatedby: auditContext.createdby,
        updateddate: new Date(),
        updatedhost: auditContext.createdhost
      };

      const [updatedCount] = await ParamCommond.update(updateData, {
        where: { pkid: id }
      });

      if (updatedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Detail not found',
          code: 'DETAIL_NOT_FOUND',
          details: `No detail found with id: ${id}`
        });
        return;
      }

      console.log('✅ [FRS9] Business setup detail updated successfully');

      res.status(200).json({
        success: true,
        message: 'Business setup detail updated successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Update business setup detail error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to update business setup detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to update business setup detail',
        code: 'UPDATE_BUSINESS_SETUP_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteBusinessSetupDetail(req: Request, res: Response): Promise<void> {
    try {
      const { detail_id } = req.params;
      const id = detail_id || req.body.ID || req.body.id;
      
      console.log(`🗑️ [FRS9] Deleting business setup detail: ${id}`);

      const deletedCount = await ParamCommond.destroy({
        where: { pkid: id }
      });

      if (deletedCount === 0) {
        res.status(404).json({
          success: false,
          error: 'Detail not found',
          code: 'DETAIL_NOT_FOUND',
          details: `No detail found with id: ${id}`
        });
        return;
      }

      console.log('✅ [FRS9] Business setup detail deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Business setup detail deleted successfully'
      });

    } catch (error) {
      console.error('❌ [FRS9] Delete business setup detail error:', error);
      res.status(500).json({
        success: false,
        message: `Failed to delete business setup detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Failed to delete business setup detail',
        code: 'DELETE_BUSINESS_SETUP_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// ============================================================================
// INDIVIDUAL FUNCTION EXPORTS FOR ROUTE CONFIGURATION
// ============================================================================

// Create controller instance for method exports
const frs9Controller = new FRS9ParameterController();

// Application Setup exports
export const getApplicationSetup = frs9Controller.getApplicationSetup.bind(frs9Controller);
export const createApplicationSetup = frs9Controller.createApplicationSetup.bind(frs9Controller);
export const updateApplicationSetup = frs9Controller.updateApplicationSetup.bind(frs9Controller);
export const deleteApplicationSetup = frs9Controller.deleteApplicationSetup.bind(frs9Controller);
export const getApplicationSetupHeaders = frs9Controller.getApplicationSetupHeaders.bind(frs9Controller);
export const getApplicationSetupDetails = frs9Controller.getApplicationSetupDetails.bind(frs9Controller);
export const createApplicationSetupDetail = frs9Controller.createApplicationSetupDetail.bind(frs9Controller);
export const updateApplicationSetupDetail = frs9Controller.updateApplicationSetupDetail.bind(frs9Controller);
export const deleteApplicationSetupDetail = frs9Controller.deleteApplicationSetupDetail.bind(frs9Controller);

// Business Setup exports
export const getBusinessSetup = frs9Controller.getBusinessSetup.bind(frs9Controller);
export const createBusinessSetup = frs9Controller.createBusinessSetup.bind(frs9Controller);
export const updateBusinessSetup = frs9Controller.updateBusinessSetup.bind(frs9Controller);
export const deleteBusinessSetup = frs9Controller.deleteBusinessSetup.bind(frs9Controller);
export const getBusinessSetupDetails = frs9Controller.getBusinessSetupDetails.bind(frs9Controller);
export const createBusinessSetupDetail = frs9Controller.createBusinessSetupDetail.bind(frs9Controller);
export const updateBusinessSetupDetail = frs9Controller.updateBusinessSetupDetail.bind(frs9Controller);
export const deleteBusinessSetupDetail = frs9Controller.deleteBusinessSetupDetail.bind(frs9Controller);

// Product Parameter exports
export const getProductParameters = frs9Controller.getProductParameters.bind(frs9Controller);
export const createProductParameter = frs9Controller.createProductParameter.bind(frs9Controller);
export const updateProductParameter = frs9Controller.updateProductParameter.bind(frs9Controller);
export const deleteProductParameter = frs9Controller.deleteProductParameter.bind(frs9Controller);

// Journal Parameter exports
export const getJournalParameters = frs9Controller.getJournalParameters.bind(frs9Controller);
export const createJournalParameter = frs9Controller.createJournalParameter.bind(frs9Controller);
export const updateJournalParameter = frs9Controller.updateJournalParameter.bind(frs9Controller);
export const deleteJournalParameter = frs9Controller.deleteJournalParameter.bind(frs9Controller);

// Health Check exports
export const checkDatabaseHealth = frs9Controller.checkDatabaseHealth.bind(frs9Controller);
export const getApplicationSetupDebug = frs9Controller.getApplicationSetupDebug.bind(frs9Controller);