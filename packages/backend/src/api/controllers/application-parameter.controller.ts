// packages/backend/src/api/controllers/application-parameter.controller.ts
// ============================================================================
// 🔧 APPL-001: APPLICATION PARAMETER CONTROLLER - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Correct Master-Detail architecture for Application Settings
// ✅ PATTERN: Master-Detail Pattern as identified in legacy analysis
// ✅ TABLES: frs9_param_commonh (headers) + frs9_param_commond (details)
// ✅ ENDPOINTS: 8 master-detail endpoints as per TodoList APPL-001
// ============================================================================

import { Request, Response } from 'express';
import { Transaction, Op, QueryTypes } from 'sequelize';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import {
  ParamCommonh,
  ParamCommond,
  frs9Sequelize as sequelize
} from '../../core/models/frs9-parameter.models';
import { backendEnvironmentLoader } from "../../config/environment-loader-backend";

// Simple auth context for controllers - extend Express Request
interface AppAuthenticatedRequest extends Request {
  user?: any;
}

// Extended interface for models with associations
interface ParamCommonhWithDetails extends ParamCommonh {
  details?: ParamCommond[];
}

// Helper function to get audit context
const getAuditContext = (req: AppAuthenticatedRequest) => {
  const userContext = req.user || {
    userId: 'SYSTEM',
    email: 'system@ifrs9.local',
    tenantSlug: 'system',
    bankingType: 'conventional',
    permissions: [],
    sessionId: 'system'
  };
  return {
    createdby: userContext.email || 'SYSTEM',
    createddate: new Date(),
    createdhost: req.ip || req.connection?.remoteAddress || 'localhost',
    updatedby: userContext.email || 'SYSTEM',
    updateddate: new Date(),
    updatedhost: req.ip || req.connection?.remoteAddress || 'localhost'
  };
};

// Validation schemas for master-detail pattern
const createHeaderSchema = z.object({
  param_code: z.string()
    .min(1, 'Parameter code is required')
    .max(10, 'Parameter code must be 10 characters or less')
    .regex(/^[A-Z0-9_-]+$/, 'Parameter code must contain only uppercase letters, numbers, underscores, and hyphens'),
  param_name: z.string().max(255).min(1, 'Parameter name is required'),
  param_usage: z.string().max(255).min(1, 'Parameter usage is required'),
  details: z.array(z.object({
    param_seq: z.number().int().min(1),
    value1: z.string().max(100),
    value2: z.string().max(100).optional(),
    value3: z.string().max(50).optional(),
    paramdesc: z.string().max(1000).optional()
  })).optional().default([])
});

const createDetailSchema = z.object({
  param_seq: z.number().int().min(1),
  value1: z.string().max(100).min(1, 'Value1 is required'),
  value2: z.string().max(100).optional(),
  value3: z.string().max(50).optional(),
  paramdesc: z.string().max(1000).optional()
});

const updateHeaderSchema = z.object({
  param_name: z.string().max(255).optional(),
  param_usage: z.string().max(255).optional()
});

export class ApplicationParameterController {
  
  // ==========================================
  // MASTER-DETAIL HEADER OPERATIONS
  // ==========================================
  
  /**
   * GET /api/v1/application/:id - Get application header by ID
   */
  async getHeaderById(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      console.log(`📄 [APPL-001] Getting application parameter header: ${req.params.id}`);

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Header ID is required',
          code: 'VALIDATION_ERROR'
        });
      }

      // Get the specific header by param_code or pkid
      const headerResults = await sequelize.query(
        `
        SELECT
          pkid,
          param_code,
          param_name,
          param_usage,
          param_type,
          createdby,
          createddate,
          updatedby,
          updateddate
        FROM frs9_param_commonh
        WHERE param_type = 'S' AND (param_code = :id OR pkid = :id)
        LIMIT 1
        `,
        {
          replacements: { id },
          type: QueryTypes.SELECT
        }
      ) as any[];

      if (!headerResults || headerResults.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Application parameter header not found',
          code: 'NOT_FOUND'
        });
      }

      const header = headerResults[0];

      return res.json({
        success: true,
        data: header,
        message: 'Application parameter header retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [APPL-001] Get application header error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get application parameter header',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/application/headers - List all application headers
   */
  async getHeaders(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      console.log('📋 [APPL-001] Getting application parameter headers with master-detail pattern (param_type = S for Application Settings)');

      // DEBUG: Test raw SQL query first
      console.log('🔍 [DEBUG] Testing raw SQL query...');
      const [rawResults, rawMeta] = await sequelize.query(
        "SELECT COUNT(*) as count FROM frs9_param_commonh WHERE param_type = 'S'",
        { type: QueryTypes.SELECT }
      );
      console.log(`🔍 [DEBUG] Raw SQL count result:`, rawResults);

      // DEBUG: Test all param_type values
      const [typeResults] = await sequelize.query(
        "SELECT param_type, COUNT(*) as count FROM frs9_param_commonh GROUP BY param_type",
        { type: QueryTypes.SELECT }
      );
      console.log(`🔍 [DEBUG] All param_type counts:`, typeResults);

      const headers = await ParamCommonh.findAll({
        where: { param_type: 'S' },
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }],
        order: [['param_code', 'ASC']]
      });

      console.log(`✅ [APPL-001] Found ${headers.length} application parameter headers`);

      // Transform to master-detail format expected by frontend
      const transformedData = headers.map(header => {
        const headerData = header.toJSON();
        return {
          ...headerData,
          details: (header as any).details || []
        };
      });

      return res.json({
        success: true,
        data: transformedData,
        total: transformedData.length,
        message: `Successfully retrieved ${transformedData.length} application parameter headers`,
        pattern: 'Master-Detail',
        database_info: (() => {
          const dbConfig = backendEnvironmentLoader.getDatabaseConfig();
          return {
            host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
            database: dbConfig.frs9.database,
            table: 'frs9_param_commonh',
            ssl: dbConfig.frs9.ssl,
            environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });

    } catch (error) {
      console.error('❌ [APPL-001] Failed to get application parameter headers:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/v1/application/headers - Create new header
   */
  async createHeader(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
      console.log('➕ [APPL-001] Creating application parameter header with master-detail pattern');
      console.log('📋 [APPL-001] Request body:', JSON.stringify(req.body, null, 2));
      
      // Validate request body
      const validationResult = createHeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const { param_code, param_name, param_usage, details } = validationResult.data;
      const auditContext = getAuditContext(req);
      
      // Check if param_code already exists
      const existingHeader = await ParamCommonh.findOne({
        where: { param_code }
      });
      
      if (existingHeader) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Parameter code already exists',
          code: 'DUPLICATE_PARAM_CODE'
        });
      }

      // Create header
      const headerData = {
        param_code,
        param_name,
        param_usage,
        param_type: 'S', // Application parameter type (System/Application Settings)
        ...auditContext
      };

      const newHeader = await ParamCommonh.create(headerData, { transaction });
      console.log('✅ [APPL-001] Header created successfully:', newHeader.param_code);

      // Create details if provided
      const createdDetails = [];
      if (details && details.length > 0) {
        for (const detail of details) {
          const detailData = {
            param_code,
            param_seq: detail.param_seq,
            value1: detail.value1,
            value2: detail.value2 || '',
            value3: detail.value3 || '',
            paramdesc: detail.paramdesc || '',
            ...auditContext
          };

          const newDetail = await ParamCommond.create(detailData, { transaction });
          createdDetails.push(newDetail);
        }
        console.log(`✅ [APPL-001] Created ${createdDetails.length} detail records`);
      }

      await transaction.commit();

      // Return created header with details
      const responseData = {
        pkid: newHeader.pkid,
        param_code: newHeader.param_code,
        param_name: newHeader.param_name,
        param_usage: newHeader.param_usage,
        param_type: newHeader.param_type,
        createdby: newHeader.createdby,
        createddate: newHeader.createddate,
        details: createdDetails
      };

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Application parameter header created successfully'
      });
      return res;

    } catch (error) {
      await transaction.rollback();
      console.error('❌ [APPL-001] Create header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create application parameter header',
        code: 'CREATE_HEADER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  /**
   * PUT /api/v1/application/headers/:id - Update header
   */
  async updateHeader(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      console.log('📝 [APPL-001] Updating application parameter header:', id);
      
      // Validate request body
      const validationResult = updateHeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const auditContext = getAuditContext(req);
      const updateData = {
        ...validationResult.data,
        ...auditContext
      };

      const [updatedCount] = await ParamCommonh.update(updateData, {
        where: { pkid: id }
      });

      if (updatedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Application parameter header not found',
          code: 'HEADER_NOT_FOUND'
        });
      }

      // Get updated record
      const updatedHeader = await ParamCommonh.findByPk(id, {
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }]
      });

      console.log('✅ [APPL-001] Header updated successfully');

      res.status(200).json({
        success: true,
        data: updatedHeader,
        message: 'Application parameter header updated successfully'
      });
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Update header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update application parameter header',
        code: 'UPDATE_HEADER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  /**
   * DELETE /api/v1/application/headers/:id - Delete header + cascade details
   */
  async deleteHeader(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      console.log('🗑️ [APPL-001] Deleting application parameter header with cascade:', id);

      // First get the header to find param_code
      const header = await ParamCommonh.findByPk(id);
      if (!header) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Application parameter header not found',
          code: 'HEADER_NOT_FOUND'
        });
      }

      // Delete all details first (cascade)
      const deletedDetailsCount = await ParamCommond.destroy({
        where: { param_code: header.param_code },
        transaction
      });

      // Delete header
      const deletedHeaderCount = await ParamCommonh.destroy({
        where: { pkid: id },
        transaction
      });

      await transaction.commit();

      console.log(`✅ [APPL-001] Deleted header and ${deletedDetailsCount} detail records`);

      res.status(200).json({
        success: true,
        message: `Application parameter header deleted successfully (${deletedDetailsCount} details also removed)`
      });
      return res;

    } catch (error) {
      await transaction.rollback();
      console.error('❌ [APPL-001] Delete header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete application parameter header',
        code: 'DELETE_HEADER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  // ==========================================
  // MASTER-DETAIL DETAIL OPERATIONS
  // ==========================================
  
  /**
   * GET /api/v1/application/headers/:id/details - Get details for header
   */
  async getDetails(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      console.log('📋 [APPL-001] Getting details for application parameter header:', id);

      // First get the header to find param_code
      const header = await ParamCommonh.findByPk(id);
      if (!header) {
        return res.status(404).json({
          success: false,
          error: 'Application parameter header not found',
          code: 'HEADER_NOT_FOUND'
        });
      }

      // Get details for this header
      const details = await ParamCommond.findAll({
        where: { param_code: header.param_code },
        order: [['param_seq', 'ASC']]
      });

      console.log(`✅ [APPL-001] Found ${details.length} details for header ${header.param_code}`);

      res.status(200).json({
        success: true,
        data: details,
        total: details.length,
        message: `Successfully retrieved ${details.length} details for parameter ${header.param_code}`
      });
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Get details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get application parameter details',
        code: 'GET_DETAILS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  /**
   * POST /api/v1/application/headers/:id/details - Create detail
   */
  async createDetail(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      console.log('➕ [APPL-001] Creating detail for application parameter header:', id);
      
      // Validate request body
      const validationResult = createDetailSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      // First get the header to find param_code
      const header = await ParamCommonh.findByPk(id);
      if (!header) {
        return res.status(404).json({
          success: false,
          error: 'Application parameter header not found',
          code: 'HEADER_NOT_FOUND'
        });
      }

      const auditContext = getAuditContext(req);
      const detailData = {
        param_code: header.param_code,
        ...validationResult.data,
        value2: validationResult.data.value2 || '',
        value3: validationResult.data.value3 || '',
        paramdesc: validationResult.data.paramdesc || '',
        ...auditContext
      };

      const newDetail = await ParamCommond.create(detailData);
      console.log('✅ [APPL-001] Detail created successfully');

      res.status(201).json({
        success: true,
        data: newDetail,
        message: 'Application parameter detail created successfully'
      });
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Create detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create application parameter detail',
        code: 'CREATE_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  /**
   * PUT /api/v1/application/details/:detailId - Update detail
   */
  async updateDetail(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { detailId } = req.params;
      console.log('📝 [APPL-001] Updating application parameter detail:', detailId);
      
      // Validate request body
      const validationResult = createDetailSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const auditContext = getAuditContext(req);
      const updateData = {
        ...validationResult.data,
        ...auditContext
      };

      const [updatedCount] = await ParamCommond.update(updateData, {
        where: { pkid: detailId }
      });

      if (updatedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Application parameter detail not found',
          code: 'DETAIL_NOT_FOUND'
        });
      }

      // Get updated record
      const updatedDetail = await ParamCommond.findByPk(detailId);

      console.log('✅ [APPL-001] Detail updated successfully');

      res.status(200).json({
        success: true,
        data: updatedDetail,
        message: 'Application parameter detail updated successfully'
      });
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Update detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update application parameter detail',
        code: 'UPDATE_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  /**
   * DELETE /api/v1/application/details/:detailId - Delete detail
   */
  async deleteDetail(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { detailId } = req.params;
      console.log('🗑️ [APPL-001] Deleting application parameter detail:', detailId);

      const deletedCount = await ParamCommond.destroy({
        where: { pkid: detailId }
      });

      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Application parameter detail not found',
          code: 'DETAIL_NOT_FOUND'
        });
      }

      console.log('✅ [APPL-001] Detail deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Application parameter detail deleted successfully'
      });
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Delete detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete application parameter detail',
        code: 'DELETE_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  // ==========================================
  // EXPORT OPERATIONS
  // ==========================================

  /**
   * GET /api/v1/application/headers/export - Export application parameters with filtering
   */
  async exportHeaders(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      console.log('📄 [APPL-001] Exporting application parameters with filtering');

      const { format = 'xlsx', search, status_filter, date_from, date_to } = req.query;

      // Build where conditions for filtering
      const whereConditions: any = { param_type: 'A' };

      if (search) {
        whereConditions[Op.or] = [
          { param_code: { [Op.iLike]: `%${search}%` } },
          { param_name: { [Op.iLike]: `%${search}%` } },
          { param_usage: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (date_from || date_to) {
        whereConditions.createddate = {};
        if (date_from) {
          whereConditions.createddate[Op.gte] = new Date(date_from as string);
        }
        if (date_to) {
          whereConditions.createddate[Op.lte] = new Date(date_to as string);
        }
      }

      // Get filtered headers with details
      const headers = await ParamCommonh.findAll({
        where: whereConditions,
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }],
        order: [['param_code', 'ASC']]
      });

      console.log(`✅ [APPL-001] Found ${headers.length} application parameters for export`);

      // Transform data for export
      const exportData = headers.map(header => {
        const headerData = header.get({ plain: true }) as any;
        const detailsCount = (headerData as any).details ? (headerData as any).details.length : 0;
        return {
          'Parameter Code': headerData.param_code,
          'Parameter Name': headerData.param_name,
          'Parameter Usage': headerData.param_usage,
          'Parameter Type': headerData.param_type,
          'Total Details': detailsCount,
          'Created By': headerData.createdby,
          'Created Date': headerData.createddate,
          'Updated By': headerData.updatedby,
          'Updated Date': headerData.updateddate
        };
      });

      // Export based on format
      switch (format) {
        case 'xlsx':
          await this.exportAsXLSX(res, exportData, 'Application_Parameters');
          break;
        case 'xls':
          await this.exportAsXLS(res, exportData, 'Application_Parameters');
          break;
        case 'csv':
          await this.exportAsCSV(res, exportData, 'Application_Parameters');
          break;
        case 'pdf':
          await this.exportAsPDF(res, exportData, 'Application Parameters');
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid export format',
            code: 'INVALID_FORMAT'
          });
          return res;
      }
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Export headers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export application parameters',
        code: 'EXPORT_HEADERS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  /**
   * GET /api/v1/application/details/export - Export application parameter details
   */
  async exportDetails(req: AppAuthenticatedRequest, res: Response): Promise<Response> {
    try {
      console.log('📄 [APPL-001] Exporting application parameter details');

      const { format = 'xlsx', param_code } = req.query;

      let whereConditions: any = {};

      if (param_code) {
        whereConditions.param_code = param_code;
      }

      // Get details with optional filtering
      const details = await ParamCommond.findAll({
        where: whereConditions,
        include: [{
          model: ParamCommonh,
          as: 'header',
          where: { param_type: 'A' },
          required: true
        }],
        order: [['param_code', 'ASC'], ['param_seq', 'ASC']]
      });

      console.log(`✅ [APPL-001] Found ${details.length} application parameter details for export`);

      // Transform data for export
      const exportData = details.map(detail => {
        const detailData = detail.get({ plain: true });
        return {
          'Parameter Code': detailData.param_code,
          'Parameter Sequence': detailData.param_seq,
          'Value 1': detailData.value1,
          'Value 2': detailData.value2 || '',
          'Value 3': detailData.value3 || '',
          'Parameter Description': detailData.paramdesc || '',
          'Created By': detailData.createdby,
          'Created Date': detailData.createddate,
          'Updated By': detailData.updatedby,
          'Updated Date': detailData.updateddate
        };
      });

      // Export based on format
      switch (format) {
        case 'xlsx':
          await this.exportAsXLSX(res, exportData, 'Application_Parameter_Details');
          break;
        case 'xls':
          await this.exportAsXLS(res, exportData, 'Application_Parameter_Details');
          break;
        case 'csv':
          await this.exportAsCSV(res, exportData, 'Application_Parameter_Details');
          break;
        case 'pdf':
          await this.exportAsPDF(res, exportData, 'Application Parameter Details');
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid export format',
            code: 'INVALID_FORMAT'
          });
          return res;
      }
      return res;

    } catch (error) {
      console.error('❌ [APPL-001] Export details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export application parameter details',
        code: 'EXPORT_DETAILS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return res;
    }
  }

  // ==========================================
  // PRIVATE EXPORT HELPER METHODS
  // ==========================================

  /**
   * Export data as XLSX format
   */
  private async exportAsXLSX(res: Response, data: any[], filename: string): Promise<void> {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Application Parameters');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ [APPL-001] XLSX export error:', error);
      throw error;
    }
  }

  /**
   * Export data as XLS format
   */
  private async exportAsXLS(res: Response, data: any[], filename: string): Promise<void> {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Application Parameters');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xls' });

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xls"`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ [APPL-001] XLS export error:', error);
      throw error;
    }
  }

  /**
   * Export data as CSV format
   */
  private async exportAsCSV(res: Response, data: any[], filename: string): Promise<void> {
    try {
      const parser = new Parser();
      const csv = parser.parse(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);

    } catch (error) {
      console.error('❌ [APPL-001] CSV export error:', error);
      throw error;
    }
  }

  /**
   * Export data as PDF format
   */
  private async exportAsPDF(res: Response, data: any[], title: string): Promise<void> {
    try {
      const doc = new PDFDocument({ margin: 30 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title}_${new Date().toISOString().split('T')[0]}.pdf"`);

      doc.pipe(res);

      // Add title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();

      // Add export date
      doc.fontSize(10).text(`Export Date: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      if (data.length === 0) {
        doc.fontSize(12).text('No data found', { align: 'center' });
      } else {
        // Table headers
        const headers = Object.keys(data[0]);
        const tableTop = doc.y;
        let rowHeight = 20;
        let currentY = tableTop;

        // Draw headers
        headers.forEach((header, index) => {
          const x = 30 + (index * 80);
          doc.fontSize(8).text(header, x, currentY, { width: 75, ellipsis: true });
        });

        currentY += rowHeight;

        // Draw rows
        data.forEach((row, rowIndex) => {
          if (currentY > doc.page.height - 50) {
            doc.addPage();
            currentY = 30;
          }

          headers.forEach((header, colIndex) => {
            const x = 30 + (colIndex * 80);
            const value = row[header] || '';
            doc.fontSize(8).text(String(value), x, currentY, { width: 75, ellipsis: true });
          });

          currentY += rowHeight;
        });
      }

      doc.end();

    } catch (error) {
      console.error('❌ [APPL-001] PDF export error:', error);
      throw error;
    }
  }
}

console.log('✅ [APPL-001] ApplicationParameterController loaded - Master-Detail Pattern implemented');