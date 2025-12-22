// packages/backend/src/core/models/business-parameter.models.ts
// ============================================================================
// 🔧 BUSI-002: BUSINESS PARAMETER MODELS - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Proper Master-Detail relationships for Business Parameters
// ✅ PATTERN: Master-Detail Pattern extending base FRS9 models (same as Application)
// ✅ TABLES: frs9_param_commonh (headers) + frs9_param_commond (details)
// ✅ FEATURES: Cascade delete, business validation, audit tracking
// ============================================================================

import { Transaction } from 'sequelize';
import { 
  ParamCommonh, 
  ParamCommond, 
  ParamCommonhAttributes, 
  ParamCommondAttributes 
} from './frs9-parameter.models';

// ==========================================
// BUSINESS PARAMETER SPECIFIC INTERFACES
// ==========================================

export interface BusinessHeaderAttributes extends ParamCommonhAttributes {
  // Business-specific enhancements
  param_type: 'B'; // Always 'B' for Business parameters
}

export interface BusinessDetailAttributes extends ParamCommondAttributes {
  // Business-specific enhancements with business validation
}

export interface BusinessParameterCreateRequest {
  param_code: string;
  param_name: string;
  param_usage: string;
  details?: {
    param_seq: number;
    value1: string;
    value2?: string;
    value3?: string;
    paramdesc?: string;
  }[];
}

export interface BusinessParameterUpdateRequest {
  param_name?: string;
  param_usage?: string;
}

export interface BusinessDetailCreateRequest {
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
}

export interface BusinessDetailUpdateRequest {
  param_seq?: number;
  value1?: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
}

// ==========================================
// BUSINESS PARAMETER SERVICE CLASS
// ==========================================

export class BusinessParameterService {
  
  // ==========================================
  // MASTER-DETAIL HEADER OPERATIONS
  // ==========================================
  
  /**
   * Get all business parameter headers with their details
   */
  static async getAllHeaders(): Promise<ParamCommonh[]> {
    try {
      console.log('📋 [BUSI-002] Getting all business parameter headers');
      
      const headers = await ParamCommonh.findAll({
        where: { param_type: 'B' },
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }],
        order: [
          ['param_code', 'ASC'],
          [{ model: ParamCommond, as: 'details' }, 'param_seq', 'ASC']
        ]
      });

      console.log(`✅ [BUSI-002] Found ${headers.length} business parameter headers`);
      return headers;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to get business headers:', error);
      throw error;
    }
  }

  /**
   * Get single business parameter header with details
   */
  static async getHeaderById(id: number): Promise<ParamCommonh | null> {
    try {
      console.log('🔍 [BUSI-002] Getting business parameter header by ID:', id);
      
      const header = await ParamCommonh.findByPk(id, {
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }]
      });

      if (!header) {
        console.log('⚠️ [BUSI-002] Business parameter header not found:', id);
        return null;
      }

      // Verify it's a business parameter
      if (header.param_type !== 'B') {
        console.log('⚠️ [BUSI-002] Header is not a business parameter:', header.param_type);
        return null;
      }

      console.log('✅ [BUSI-002] Found business parameter header:', header.param_code);
      return header;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to get business header by ID:', error);
      throw error;
    }
  }

  /**
   * Create new business parameter header with details
   */
  static async createHeader(
    data: BusinessParameterCreateRequest,
    auditContext: { createdby: string; createdhost: string },
    transaction?: Transaction
  ): Promise<{ header: ParamCommonh; details: ParamCommond[] }> {
    try {
      console.log('➕ [BUSI-002] Creating business parameter header:', data.param_code);
      
      // Validate param_code uniqueness
      const existingHeader = await ParamCommonh.findOne({
        where: { param_code: data.param_code }
      });
      
      if (existingHeader) {
        throw new Error(`Parameter code '${data.param_code}' already exists`);
      }

      // Create header
      const headerData = {
        param_code: data.param_code,
        param_name: data.param_name,
        param_usage: data.param_usage,
        param_type: 'B' as const,
        createdby: auditContext.createdby,
        createddate: new Date(),
        createdhost: auditContext.createdhost
      };

      const header = await ParamCommonh.create(headerData, { transaction });
      console.log('✅ [BUSI-002] Business header created:', header.param_code);

      // Create details if provided
      const details: ParamCommond[] = [];
      if (data.details && data.details.length > 0) {
        console.log(`📋 [BUSI-002] Creating ${data.details.length} detail records`);
        
        for (const detail of data.details) {
          const detailData = {
            param_code: data.param_code,
            param_seq: detail.param_seq,
            value1: detail.value1,
            value2: detail.value2 || '',
            value3: detail.value3 || '',
            paramdesc: detail.paramdesc || '',
            createdby: auditContext.createdby,
            createddate: new Date(),
            createdhost: auditContext.createdhost
          };

          const detailRecord = await ParamCommond.create(detailData, { transaction });
          details.push(detailRecord);
        }
        
        console.log(`✅ [BUSI-002] Created ${details.length} detail records`);
      }

      return { header, details };
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to create business header:', error);
      throw error;
    }
  }

  /**
   * Update business parameter header
   */
  static async updateHeader(
    id: number,
    data: BusinessParameterUpdateRequest,
    auditContext: { updatedby: string; updatedhost: string },
    transaction?: Transaction
  ): Promise<ParamCommonh | null> {
    try {
      console.log('📝 [BUSI-002] Updating business parameter header:', id);
      
      // Find header and verify it's a business parameter
      const header = await ParamCommonh.findByPk(id);
      if (!header || header.param_type !== 'B') {
        console.log('⚠️ [BUSI-002] Business parameter header not found:', id);
        return null;
      }

      // Update header
      const updateData = {
        ...data,
        updatedby: auditContext.updatedby,
        updateddate: new Date(),
        updatedhost: auditContext.updatedhost
      };

      await header.update(updateData, { transaction });
      console.log('✅ [BUSI-002] Business header updated:', header.param_code);

      // Return updated header with details
      const updatedHeader = await ParamCommonh.findByPk(id, {
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }]
      });

      return updatedHeader;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to update business header:', error);
      throw error;
    }
  }

  /**
   * Delete business parameter header with cascade
   */
  static async deleteHeader(
    id: number,
    transaction?: Transaction
  ): Promise<{ header: ParamCommonh; deletedDetailsCount: number }> {
    try {
      console.log('🗑️ [BUSI-002] Deleting business parameter header:', id);
      
      // Find header and verify it's a business parameter
      const header = await ParamCommonh.findByPk(id);
      if (!header || header.param_type !== 'B') {
        throw new Error(`Business parameter header not found: ${id}`);
      }

      // Delete all details first (cascade)
      const deletedDetailsCount = await ParamCommond.destroy({
        where: { param_code: header.param_code },
        transaction
      });

      // Delete header
      await header.destroy({ transaction });

      console.log(`✅ [BUSI-002] Deleted header and ${deletedDetailsCount} detail records`);
      return { header, deletedDetailsCount };
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to delete business header:', error);
      throw error;
    }
  }

  // ==========================================
  // MASTER-DETAIL DETAIL OPERATIONS
  // ==========================================
  
  /**
   * Get details for business parameter header
   */
  static async getDetailsByHeaderId(headerId: number): Promise<ParamCommond[]> {
    try {
      console.log('📋 [BUSI-002] Getting details for business parameter header:', headerId);
      
      // Find header first
      const header = await ParamCommonh.findByPk(headerId);
      if (!header || header.param_type !== 'B') {
        throw new Error(`Business parameter header not found: ${headerId}`);
      }

      // Get details
      const details = await ParamCommond.findAll({
        where: { param_code: header.param_code },
        order: [['param_seq', 'ASC']]
      });

      console.log(`✅ [BUSI-002] Found ${details.length} details for header ${header.param_code}`);
      return details;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to get business details:', error);
      throw error;
    }
  }

  /**
   * Create detail for business parameter header
   */
  static async createDetail(
    headerId: number,
    data: BusinessDetailCreateRequest,
    auditContext: { createdby: string; createdhost: string },
    transaction?: Transaction
  ): Promise<ParamCommond> {
    try {
      console.log('➕ [BUSI-002] Creating detail for business parameter header:', headerId);
      
      // Find header and verify it's a business parameter
      const header = await ParamCommonh.findByPk(headerId);
      if (!header || header.param_type !== 'B') {
        throw new Error(`Business parameter header not found: ${headerId}`);
      }

      // Validate sequence uniqueness
      const existingDetail = await ParamCommond.findOne({
        where: { 
          param_code: header.param_code,
          param_seq: data.param_seq
        }
      });
      
      if (existingDetail) {
        throw new Error(`Detail sequence ${data.param_seq} already exists for parameter ${header.param_code}`);
      }

      // Create detail
      const detailData = {
        param_code: header.param_code,
        param_seq: data.param_seq,
        value1: data.value1,
        value2: data.value2 || '',
        value3: data.value3 || '',
        paramdesc: data.paramdesc || '',
        createdby: auditContext.createdby,
        createddate: new Date(),
        createdhost: auditContext.createdhost
      };

      const detail = await ParamCommond.create(detailData, { transaction });
      console.log('✅ [BUSI-002] Business detail created:', detail.pkid);

      return detail;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to create business detail:', error);
      throw error;
    }
  }

  /**
   * Update business parameter detail
   */
  static async updateDetail(
    detailId: number,
    data: BusinessDetailUpdateRequest,
    auditContext: { updatedby: string; updatedhost: string },
    transaction?: Transaction
  ): Promise<ParamCommond | null> {
    try {
      console.log('📝 [BUSI-002] Updating business parameter detail:', detailId);
      
      // Find detail and verify it belongs to a business parameter
      const detail = await ParamCommond.findByPk(detailId, {
        include: [{
          model: ParamCommonh,
          as: 'header',
          where: { param_type: 'B' }
        }]
      });
      
      if (!detail) {
        console.log('⚠️ [BUSI-002] Business parameter detail not found:', detailId);
        return null;
      }

      // Validate sequence uniqueness if changing
      if (data.param_seq && data.param_seq !== detail.param_seq) {
        const existingDetail = await ParamCommond.findOne({
          where: { 
            param_code: detail.param_code,
            param_seq: data.param_seq,
            pkid: { [Symbol.for('ne')]: detailId } // Sequelize's not equal operator
          }
        });
        
        if (existingDetail) {
          throw new Error(`Detail sequence ${data.param_seq} already exists for parameter ${detail.param_code}`);
        }
      }

      // Update detail
      const updateData = {
        ...data,
        updatedby: auditContext.updatedby,
        updateddate: new Date(),
        updatedhost: auditContext.updatedhost
      };

      await detail.update(updateData, { transaction });
      console.log('✅ [BUSI-002] Business detail updated:', detail.pkid);

      return detail;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to update business detail:', error);
      throw error;
    }
  }

  /**
   * Delete business parameter detail
   */
  static async deleteDetail(
    detailId: number,
    transaction?: Transaction
  ): Promise<ParamCommond> {
    try {
      console.log('🗑️ [BUSI-002] Deleting business parameter detail:', detailId);
      
      // Find detail and verify it belongs to a business parameter
      const detail = await ParamCommond.findByPk(detailId, {
        include: [{
          model: ParamCommonh,
          as: 'header',
          where: { param_type: 'B' }
        }]
      });
      
      if (!detail) {
        throw new Error(`Business parameter detail not found: ${detailId}`);
      }

      // Delete detail
      await detail.destroy({ transaction });
      console.log('✅ [BUSI-002] Business detail deleted:', detailId);

      return detail;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to delete business detail:', error);
      throw error;
    }
  }

  // ==========================================
  // BUSINESS VALIDATION METHODS
  // ==========================================
  
  /**
   * Validate business parameter code format
   */
  static validateParameterCode(paramCode: string): boolean {
    // Business parameter codes should follow pattern: BIZ[0-9]{3}
    const pattern = /^BIZ[0-9]{3}$/;
    return pattern.test(paramCode);
  }

  /**
   * Get next available sequence number for details
   */
  static async getNextSequenceNumber(paramCode: string): Promise<number> {
    try {
      const maxSeq = await ParamCommond.max('param_seq', {
        where: { param_code: paramCode }
      }) as number;
      
      return (maxSeq || 0) + 1;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to get next sequence number:', error);
      return 1;
    }
  }

  /**
   * Validate detail sequence uniqueness
   */
  static async validateSequenceUniqueness(
    paramCode: string, 
    paramSeq: number, 
    excludeDetailId?: number
  ): Promise<boolean> {
    try {
      const whereClause: any = { 
        param_code: paramCode,
        param_seq: paramSeq
      };
      
      if (excludeDetailId) {
        whereClause.pkid = { [Symbol.for('ne')]: excludeDetailId };
      }
      
      const existingDetail = await ParamCommond.findOne({ where: whereClause });
      return !existingDetail;
      
    } catch (error) {
      console.error('❌ [BUSI-002] Failed to validate sequence uniqueness:', error);
      return false;
    }
  }

  /**
   * Business-specific validation for business rules
   */
  static validateBusinessRule(value1: string, value2?: string, value3?: string): boolean {
    // Business parameter specific validation
    // Could include checks for business rule formatting, valid values, etc.
    
    if (!value1 || value1.trim().length === 0) {
      return false;
    }
    
    // Business rules should not contain certain characters
    const invalidChars = /[<>\"'&]/;
    if (invalidChars.test(value1) || (value2 && invalidChars.test(value2)) || (value3 && invalidChars.test(value3))) {
      return false;
    }
    
    return true;
  }

  /**
   * Get business parameter categories
   */
  static getBusinessParameterCategories(): string[] {
    return [
      'APPROVAL_LIMITS',
      'CALCULATION_RULES',
      'VALIDATION_RULES',
      'WORKFLOW_CONFIG',
      'BUSINESS_LOGIC',
      'COMPLIANCE_RULES',
      'NOTIFICATION_CONFIG',
      'SYSTEM_BEHAVIOR'
    ];
  }
}

console.log('✅ [BUSI-002] BusinessParameterService loaded - Master-Detail Models implemented');

// Export singleton instance
export const businessParameterService = new BusinessParameterService();