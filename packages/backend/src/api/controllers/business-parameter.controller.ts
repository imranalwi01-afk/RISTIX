// packages/backend/src/api/controllers/business-parameter.controller.ts
// ============================================================================
// 🔧 BUSI-001: BUSINESS PARAMETER CONTROLLER - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Correct Master-Detail architecture for Business Settings
// ✅ PATTERN: Master-Detail Pattern (same as Application Parameter)
// ✅ TABLES: frs9_param_commonh (headers) + frs9_param_commond (details)
// ✅ ENDPOINTS: 8 master-detail endpoints for Business parameters (param_type = 'B')
// ============================================================================

import { Request, Response } from 'express';
import { Transaction, Sequelize, Op } from 'sequelize';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { appConfig } from "../../config/app.config";
import {
  ParamCommonh,
  ParamCommond,
  checkFRS9DatabaseHealth,
  frs9Sequelize as sequelize
} from '../../core/models/frs9-parameter.models';

// Auth context interface
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
}

// Helper function to get audit context
const getAuditContext = (req: AuthenticatedRequest) => {
  const userContext = req.user || { userId: 'SYSTEM', email: 'system@ifrs9.local' };
  const now = new Date();
  return {
    createdby: userContext.email || 'SYSTEM',
    createddate: now,
    createdhost: req.ip || req.connection?.remoteAddress || 'localhost',
    updatedby: userContext.email || 'SYSTEM',
    updateddate: now,
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

export class BusinessParameterController {

  // ==========================================
  // MASTER-DETAIL HEADER OPERATIONS
  // ==========================================
  
  /**
   * GET /api/v1/business/:id - Get business header by ID
   */
  async getHeaderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(`📄 [BUSI-001] Getting business parameter header: ${req.params.id}`);

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Header ID is required',
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Get the specific header by param_code or pkid
      const header = await ParamCommonh.findOne({
        where: {
          param_type: 'B',
          [Op.or]: [
            { param_code: id },
            { pkid: id }
          ]
        }
      });

      if (!header) {
        res.status(404).json({
          success: false,
          error: 'Business parameter header not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: header,
        message: 'Business parameter header retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Get business header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get business parameter header',
        code: 'DATABASE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/business/headers - List all business headers
   */
  async getHeaders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('📋 [BUSI-001] Getting business parameter headers with master-detail pattern');
      
      const headers = await ParamCommonh.findAll({
        where: { param_type: 'B' }, // Business parameter type
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }],
        order: [['param_code', 'ASC']]
      });

      console.log(`✅ [BUSI-001] Found ${headers.length} business parameter headers`);
      
      // Transform to master-detail format expected by frontend
      const transformedData = headers.map(header => {
        const headerData = header.get({ plain: true });
        return {
          pkid: headerData.pkid,
          param_code: headerData.param_code,
          param_name: headerData.param_name,
          param_usage: headerData.param_usage,
          param_type: headerData.param_type,
          createdby: headerData.createdby,
          createddate: headerData.createddate,
          updatedby: headerData.updatedby,
          updateddate: headerData.updateddate,
          details: headerData.details || []
        };
      });

      res.status(200).json({
        success: true,
        data: transformedData,
        total: transformedData.length,
        message: `Successfully retrieved ${transformedData.length} business parameter headers`,
        pattern: 'Master-Detail',
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_commonh',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Get headers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get business parameter headers',
        code: 'GET_HEADERS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/v1/business/headers - Create new header
   */
  async createHeader(req: AuthenticatedRequest, res: Response): Promise<void> {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
      console.log('➕ [BUSI-001] Creating business parameter header with master-detail pattern');
      console.log('📋 [BUSI-001] Request body:', JSON.stringify(req.body, null, 2));
      
      // Validate request body
      const validationResult = createHeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
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
        param_type: 'B', // Business parameter type
        ...auditContext
      };

      const newHeader = await ParamCommonh.create(headerData, { transaction });
      console.log('✅ [BUSI-001] Header created successfully:', newHeader.param_code);

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
        console.log(`✅ [BUSI-001] Created ${createdDetails.length} detail records`);
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
        message: 'Business parameter header created successfully'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ [BUSI-001] Create header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create business parameter header',
        code: 'CREATE_HEADER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/v1/business/headers/:id - Update header
   */
  async updateHeader(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('📝 [BUSI-001] Updating business parameter header:', id);
      
      // Validate request body
      const validationResult = updateHeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
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
          error: 'Business parameter header not found',
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

      console.log('✅ [BUSI-001] Header updated successfully');

      res.status(200).json({
        success: true,
        data: updatedHeader,
        message: 'Business parameter header updated successfully'
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Update header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update business parameter header',
        code: 'UPDATE_HEADER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/v1/business/headers/:id - Delete header + cascade details
   */
  async deleteHeader(req: AuthenticatedRequest, res: Response): Promise<void> {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      console.log('🗑️ [BUSI-001] Deleting business parameter header with cascade:', id);

      // First get the header to find param_code
      const header = await ParamCommonh.findByPk(id);
      if (!header) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Business parameter header not found',
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

      console.log(`✅ [BUSI-001] Deleted header and ${deletedDetailsCount} detail records`);

      res.status(200).json({
        success: true,
        message: `Business parameter header deleted successfully (${deletedDetailsCount} details also removed)`
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ [BUSI-001] Delete header error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete business parameter header',
        code: 'DELETE_HEADER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // MASTER-DETAIL DETAIL OPERATIONS
  // ==========================================
  
  /**
   * GET /api/v1/business/headers/:id/details - Get details for header
   */
  async getDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('📋 [BUSI-001] Getting details for business parameter header:', id);

      // First get the header to find param_code
      const header = await ParamCommonh.findByPk(id);
      if (!header) {
        return res.status(404).json({
          success: false,
          error: 'Business parameter header not found',
          code: 'HEADER_NOT_FOUND'
        });
      }

      // Get details for this header
      const details = await ParamCommond.findAll({
        where: { param_code: header.param_code },
        order: [['param_seq', 'ASC']]
      });

      console.log(`✅ [BUSI-001] Found ${details.length} details for header ${header.param_code}`);

      res.status(200).json({
        success: true,
        data: details,
        total: details.length,
        message: `Successfully retrieved ${details.length} details for parameter ${header.param_code}`
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Get details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get business parameter details',
        code: 'GET_DETAILS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/v1/business/headers/:id/details - Create detail
   */
  async createDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('➕ [BUSI-001] Creating detail for business parameter header:', id);
      
      // Validate request body
      const validationResult = createDetailSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
        });
      }

      // First get the header to find param_code
      const header = await ParamCommonh.findByPk(id);
      if (!header) {
        return res.status(404).json({
          success: false,
          error: 'Business parameter header not found',
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
      console.log('✅ [BUSI-001] Detail created successfully');

      res.status(201).json({
        success: true,
        data: newDetail,
        message: 'Business parameter detail created successfully'
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Create detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create business parameter detail',
        code: 'CREATE_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/v1/business/details/:detailId - Update detail
   */
  async updateDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { detailId } = req.params;
      console.log('📝 [BUSI-001] Updating business parameter detail:', detailId);
      
      // Validate request body
      const validationResult = createDetailSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
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
          error: 'Business parameter detail not found',
          code: 'DETAIL_NOT_FOUND'
        });
      }

      // Get updated record
      const updatedDetail = await ParamCommond.findByPk(detailId);

      console.log('✅ [BUSI-001] Detail updated successfully');

      res.status(200).json({
        success: true,
        data: updatedDetail,
        message: 'Business parameter detail updated successfully'
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Update detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update business parameter detail',
        code: 'UPDATE_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/v1/business/details/:detailId - Delete detail
   */
  async deleteDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { detailId } = req.params;
      console.log('🗑️ [BUSI-001] Deleting business parameter detail:', detailId);

      const deletedCount = await ParamCommond.destroy({
        where: { pkid: detailId }
      });

      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Business parameter detail not found',
          code: 'DETAIL_NOT_FOUND'
        });
      }

      console.log('✅ [BUSI-001] Detail deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Business parameter detail deleted successfully'
      });

    } catch (error) {
      console.error('❌ [BUSI-001] Delete detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete business parameter detail',
        code: 'DELETE_DETAIL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // EXPORT OPERATIONS
  // ==========================================

  /**
   * GET /api/v1/business/headers/export - Export business parameters with filtering
   */
  async exportHeaders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('📄 [BUSI-001] Exporting business parameters with filtering');

      const { format = 'xlsx', search, status_filter, date_from, date_to } = req.query;

      // Build where conditions for filtering
      const whereConditions: any = { param_type: 'B' };

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

      console.log(`✅ [BUSI-001] Found ${headers.length} business parameters for export`);

      // Transform data for export
      const exportData = headers.map(header => {
        const headerData = header.get({ plain: true });
        return {
          'Parameter Code': headerData.param_code,
          'Parameter Name': headerData.param_name,
          'Parameter Usage': headerData.param_usage,
          'Parameter Type': headerData.param_type,
          'Total Details': headerData.details ? headerData.details.length : 0,
          'Created By': headerData.createdby,
          'Created Date': headerData.createddate,
          'Updated By': headerData.updatedby,
          'Updated Date': headerData.updateddate
        };
      });

      // Export based on format
      switch (format) {
        case 'xlsx':
          await this.exportAsXLSX(res, exportData, 'Business_Parameters');
          break;
        case 'xls':
          await this.exportAsXLS(res, exportData, 'Business_Parameters');
          break;
        case 'csv':
          await this.exportAsCSV(res, exportData, 'Business_Parameters');
          break;
        case 'pdf':
          await this.exportAsPDF(res, exportData, 'Business Parameters');
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid export format',
            code: 'INVALID_FORMAT'
          });
      }

    } catch (error) {
      console.error('❌ [BUSI-001] Export headers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export business parameters',
        code: 'EXPORT_HEADERS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/business/details/export - Export business parameter details
   */
  async exportDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('📄 [BUSI-001] Exporting business parameter details');

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
          where: { param_type: 'B' },
          required: true
        }],
        order: [['param_code', 'ASC'], ['param_seq', 'ASC']]
      });

      console.log(`✅ [BUSI-001] Found ${details.length} business parameter details for export`);

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
          await this.exportAsXLSX(res, exportData, 'Business_Parameter_Details');
          break;
        case 'xls':
          await this.exportAsXLS(res, exportData, 'Business_Parameter_Details');
          break;
        case 'csv':
          await this.exportAsCSV(res, exportData, 'Business_Parameter_Details');
          break;
        case 'pdf':
          await this.exportAsPDF(res, exportData, 'Business Parameter Details');
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid export format',
            code: 'INVALID_FORMAT'
          });
      }

    } catch (error) {
      console.error('❌ [BUSI-001] Export details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export business parameter details',
        code: 'EXPORT_DETAILS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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

      XLSX.utils.book_append_sheet(wb, ws, 'Business Parameters');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ [BUSI-001] XLSX export error:', error);
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

      XLSX.utils.book_append_sheet(wb, ws, 'Business Parameters');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xls' });

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.xls"`);
      res.send(buffer);

    } catch (error) {
      console.error('❌ [BUSI-001] XLS export error:', error);
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
      console.error('❌ [BUSI-001] CSV export error:', error);
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
      console.error('❌ [BUSI-001] PDF export error:', error);
      throw error;
    }
  }
}

console.log('✅ [BUSI-001] BusinessParameterController loaded - Master-Detail Pattern implemented');