// packages/backend/src/api/controllers/journal-parameter.controller.ts
// ============================================================================
// 🗄️ JOURNAL PARAMETER CONTROLLER: Standalone CRUD for frs9_param_journal
// ============================================================================
// ✅ PATTERN: Standalone CRUD operations (not master-detail)
// ✅ DATABASE: DS2PG FRS9PRO.frs9_param_journal (192.168.0.106:5433)
// ✅ VALIDATION: Zod schemas for input validation
// ✅ AUDIT: Complete audit trail for all operations
// ============================================================================

import { Request, Response } from 'express';
import { z } from 'zod';
import { appConfig } from "../../config/app.config";
import { journalParameterService } from '../../core/services/journal-parameter.service';

// ✅ Zod validation schemas
const journalParameterSchema = z.object({
  gl_group: z.string().max(20).optional(),
  currency: z.string().max(3).optional(), // ✅ FIXED: Accept up to 3 character currency (IDR, USD, EUR)
  gl_type: z.string().max(20).optional(),
  gl_code: z.string()
    .min(1, 'GL code is required')
    .max(20, 'GL code must be 20 characters or less')
    .regex(/^[A-Z0-9_-]+$/, 'GL code must contain only uppercase letters, numbers, underscores, and hyphens'),
  gl_number: z.string().max(20).optional(),
  dbcr: z.enum(['D', 'C']).optional(),
  gl_desc: z.string()
    .max(255, 'GL description must be 255 characters or less')
    .optional(), // ✅ FIXED: Allow empty description
  active_flag: z.boolean().default(true)
});

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(() => '1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default(() => '20'),
  search: z.string().optional(),
  gl_group: z.string().optional(),
  gl_type: z.string().optional(),
  currency: z.string().optional(),
  active_only: z.enum(['true', 'false']).optional()
});

export class JournalParameterController {
  
  // ============================================================================
  // GET /api/v1/banking/parameters/journal - List journal parameters
  // ============================================================================
  async getJournalParameters(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [JOUR-002] Getting journal parameters with query:', req.query);
      
      const query = querySchema.parse(req.query);
      
      // Use service to get journal parameters
      const result = await journalParameterService.getJournalParameters({
        page: query.page,
        limit: query.limit,
        search: query.search,
        gl_group: query.gl_group,
        gl_type: query.gl_type,
        currency: query.currency,
        active_only: query.active_only === 'true'
      });
      
      console.log(`✅ [JOUR-002] Found ${result.total} journal parameters (page ${query.page})`);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        filters: {
          search: query.search,
          gl_group: query.gl_group,
          gl_type: query.gl_type,
          currency: query.currency,
          active_only: query.active_only
        },
        message: 'Journal parameters retrieved successfully from DS2 database',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_journal',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-002] Failed to get journal parameters:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_FETCH_ERROR',
        message: 'Failed to fetch journal parameters',
        details: error.message
      });
    }
  }
  
  // ============================================================================
  // GET /api/v1/banking/parameters/journal/:gl_code - Get single journal parameter
  // ============================================================================
  async getJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      const { gl_code } = req.params;
      console.log(`🔍 [JOUR-002] Getting journal parameter: ${gl_code}`);
      
      const journal = await journalParameterService.getJournalParameterByGLCode(gl_code);
      
      if (!journal) {
        res.status(404).json({
          success: false,
          error: 'JOURNAL_NOT_FOUND',
          message: `Journal parameter with GL code '${gl_code}' not found`
        });
        return;
      }
      
      console.log(`✅ [JOUR-002] Found journal parameter: ${gl_code}`);
      
      res.status(200).json({
        success: true,
        data: journal,
        message: 'Journal parameter retrieved successfully'
      });
      
    } catch (error: any) {
      console.error(`❌ [JOUR-002] Failed to get journal parameter ${req.params.gl_code}:`, error);
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_FETCH_ERROR',
        message: 'Failed to fetch journal parameter',
        details: error.message
      });
    }
  }
  
  // ============================================================================
  // POST /api/v1/banking/parameters/journal - Create journal parameter
  // ============================================================================
  async createJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      console.log('➕ [JOUR-002] Creating journal parameter:', req.body);
      
      const validatedData = journalParameterSchema.parse(req.body);
      const userEmail = (req as any).user?.email || 'system@ifrspro.id';
      const userHost = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Create journal parameter using service
      const journalData = {
        ...validatedData,
        gl_desc: validatedData.gl_desc || '', // ✅ FIXED: Ensure gl_desc is never undefined
        createdby: userEmail,
        createddate: new Date(),
        createdhost: userHost
      };
      
      const newJournal = await journalParameterService.createJournalParameter(journalData);
      
      console.log(`✅ [JOUR-002] Created journal parameter: ${newJournal.gl_code} (ID: ${newJournal.pkid})`);
      
      res.status(201).json({
        success: true,
        data: newJournal,
        message: 'Journal parameter created successfully'
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-002] Failed to create journal parameter:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid journal parameter data',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
        return;
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
          success: false,
          error: 'DUPLICATE_GL_CODE',
          message: 'GL code already exists',
          details: error.errors?.[0]?.message || 'Unique constraint violation'
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_CREATE_ERROR',
        message: 'Failed to create journal parameter',
        details: error.message
      });
    }
  }
  
  // ============================================================================
  // PUT /api/v1/banking/parameters/journal/:gl_code - Update journal parameter
  // ============================================================================
  async updateJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      const { gl_code } = req.params;
      console.log(`✏️ [JOUR-002] Updating journal parameter: ${gl_code}`);
      
      const validatedData = journalParameterSchema.partial().parse(req.body);
      const userEmail = (req as any).user?.email || 'system@ifrspro.id';
      const userHost = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Update journal parameter using service
      const updateData = {
        ...validatedData,
        updatedby: userEmail,
        updateddate: new Date(),
        updatedhost: userHost
      };
      
      const journal = await journalParameterService.updateJournalParameter(gl_code, updateData);
      
      if (!journal) {
        res.status(404).json({
          success: false,
          error: 'JOURNAL_NOT_FOUND',
          message: `Journal parameter with GL code '${gl_code}' not found`
        });
        return;
      }
      
      console.log(`✅ [JOUR-002] Updated journal parameter: ${gl_code}`);
      
      res.status(200).json({
        success: true,
        data: journal,
        message: 'Journal parameter updated successfully'
      });
      
    } catch (error: any) {
      console.error(`❌ [JOUR-002] Failed to update journal parameter ${req.params.gl_code}:`, error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid journal parameter data',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_UPDATE_ERROR',
        message: 'Failed to update journal parameter',
        details: error.message
      });
    }
  }
  
  // ============================================================================
  // DELETE /api/v1/banking/parameters/journal/:gl_code - Delete journal parameter
  // ============================================================================
  async deleteJournalParameter(req: Request, res: Response): Promise<void> {
    try {
      const { gl_code } = req.params;
      console.log(`🗑️ [JOUR-002] Deleting journal parameter: ${gl_code}`);
      
      // Delete journal parameter using service
      const deleted = await journalParameterService.deleteJournalParameter(gl_code);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'JOURNAL_NOT_FOUND',
          message: `Journal parameter with GL code '${gl_code}' not found`
        });
        return;
      }
      
      console.log(`✅ [JOUR-002] Deleted journal parameter: ${gl_code}`);
      
      res.status(200).json({
        success: true,
        message: 'Journal parameter deleted successfully'
      });
      
    } catch (error: any) {
      console.error(`❌ [JOUR-002] Failed to delete journal parameter ${req.params.gl_code}:`, error);
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_DELETE_ERROR',
        message: 'Failed to delete journal parameter',
        details: error.message
      });
    }
  }
  
  // ============================================================================
  // GET /api/v1/banking/parameters/journal/health - Health check endpoint
  // ============================================================================
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      console.log('🏥 [JOUR-002] Journal parameter health check');
      
      // Get health status from service
      const journalHealth = await journalParameterService.healthCheck();
      
      console.log(`✅ [JOUR-002] Health check passed - ${journalHealth.statistics.total_journals} journal parameters available`);
      
      res.status(200).json({
        success: true,
        data: journalHealth,
        message: 'Journal parameter service is healthy'
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-002] Health check failed:', error);
      
      res.status(503).json({
        success: false,
        error: 'SERVICE_UNHEALTHY',
        message: 'Journal parameter service health check failed',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ============================================================================
  // BUSINESS SETTINGS ENDPOINTS FOR JOURNAL PARAMETER DROPDOWNS
  // ============================================================================

  // GET /api/v1/banking/parameters/journal/gl-group-options
  async getGLGroupOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [JOUR-003] Getting GL Group options');
      
      const options = await journalParameterService.getGLGroupOptions();
      
      console.log(`✅ [JOUR-003] Found ${options.length} GL group options`);
      
      res.status(200).json({
        success: true,
        data: options,
        message: 'GL group options retrieved successfully',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            source: 'Rule Based Setting (rule type = GL)',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get GL group options:', error);
      
      res.status(500).json({
        success: false,
        error: 'GL_GROUP_OPTIONS_ERROR',
        message: 'Failed to fetch GL group options',
        details: error.message
      });
    }
  }

  // GET /api/v1/banking/parameters/journal/currency-options
  async getCurrencyOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [JOUR-003] Getting currency options');
      
      const options = await journalParameterService.getCurrencyOptions();
      
      console.log(`✅ [JOUR-003] Found ${options.length} currency options`);
      
      res.status(200).json({
        success: true,
        data: options,
        message: 'Currency options retrieved successfully',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_commond',
            source: 'Business Setting B0001',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get currency options:', error);
      
      res.status(500).json({
        success: false,
        error: 'CURRENCY_OPTIONS_ERROR',
        message: 'Failed to fetch currency options',
        details: error.message
      });
    }
  }

  // GET /api/v1/banking/parameters/journal/journal-type-options
  async getJournalTypeOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [JOUR-003] Getting journal type options');
      
      const options = await journalParameterService.getJournalTypeOptions();
      
      console.log(`✅ [JOUR-003] Found ${options.length} journal type options`);
      
      res.status(200).json({
        success: true,
        data: options,
        message: 'Journal type options retrieved successfully',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_commond',
            source: 'Business Setting B0005',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get journal type options:', error);
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_TYPE_OPTIONS_ERROR',
        message: 'Failed to fetch journal type options',
        details: error.message
      });
    }
  }

  // GET /api/v1/banking/parameters/journal/journal-code-options
  async getJournalCodeOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [JOUR-003] Getting journal code options');
      
      const options = await journalParameterService.getJournalCodeOptions();
      
      console.log(`✅ [JOUR-003] Found ${options.length} journal code options`);
      
      res.status(200).json({
        success: true,
        data: options,
        message: 'Journal code options retrieved successfully',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_commond',
            source: 'Business Setting B0006',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get journal code options:', error);
      
      res.status(500).json({
        success: false,
        error: 'JOURNAL_CODE_OPTIONS_ERROR',
        message: 'Failed to fetch journal code options',
        details: error.message
      });
    }
  }

  // GET /api/v1/banking/parameters/journal/dbcr-options
  async getDbCrOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [JOUR-003] Getting DB/CR options');
      
      const options = await journalParameterService.getDbCrOptions();
      
      console.log(`✅ [JOUR-003] Found ${options.length} DB/CR options`);
      
      res.status(200).json({
        success: true,
        data: options,
        message: 'DB/CR options retrieved successfully',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_commond',
            source: 'Business Setting B0007',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get DB/CR options:', error);
      
      res.status(500).json({
        success: false,
        error: 'DBCR_OPTIONS_ERROR',
        message: 'Failed to fetch DB/CR options',
        details: error.message
      });
    }
  }
}

// Export controller instance
export const journalParameterController = new JournalParameterController();