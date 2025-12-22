// packages/backend/src/core/models/application-parameter.models.ts
// ============================================================================
// 🔧 APPL-002: APPLICATION PARAMETER MODELS - MASTER-DETAIL PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Proper Master-Detail relationships for Application Parameters
// ✅ PATTERN: Master-Detail Pattern extending base FRS9 models
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
// APPLICATION PARAMETER SPECIFIC INTERFACES
// ==========================================

export interface ApplicationHeaderAttributes extends ParamCommonhAttributes {
  // Application-specific enhancements
  param_type: 'A'; // Always 'A' for Application parameters
}

export interface ApplicationDetailAttributes extends ParamCommondAttributes {
  // Application-specific enhancements with business validation
}

export interface ApplicationParameterCreateRequest {
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

export interface ApplicationParameterUpdateRequest {
  param_name?: string;
  param_usage?: string;
}

export interface ApplicationDetailCreateRequest {
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
}

export interface ApplicationDetailUpdateRequest {
  param_seq?: number;
  value1?: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
}

// ==========================================
// APPLICATION PARAMETER SERVICE CLASS
// ==========================================

export class ApplicationParameterService {
  
  // ==========================================
  // MASTER-DETAIL HEADER OPERATIONS
  // ==========================================
  
  /**
   * Get all application parameter headers with their details
   */
  static async getAllHeaders(): Promise<ParamCommonh[]> {
    try {
      console.log('📋 [APPL-002] Getting all application parameter headers');
      
      const headers = await ParamCommonh.findAll({
        where: { param_type: 'A' },
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

      console.log(`✅ [APPL-002] Found ${headers.length} application parameter headers`);
      return headers;
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to get application headers:', error);
      throw error;
    }
  }

  /**
   * Get single application parameter header with details
   */
  static async getHeaderById(id: number): Promise<ParamCommonh | null> {
    try {
      console.log('🔍 [APPL-002] Getting application parameter header by ID:', id);
      
      const header = await ParamCommonh.findByPk(id, {
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }]
      });

      if (!header) {
        console.log('⚠️ [APPL-002] Application parameter header not found:', id);
        return null;
      }

      // Verify it's an application parameter
      if (header.param_type !== 'A') {
        console.log('⚠️ [APPL-002] Header is not an application parameter:', header.param_type);
        return null;
      }

      console.log('✅ [APPL-002] Found application parameter header:', header.param_code);
      return header;
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to get application header by ID:', error);
      throw error;
    }
  }

  /**
   * Create new application parameter header with details
   */
  static async createHeader(
    data: ApplicationParameterCreateRequest,
    auditContext: { createdby: string; createdhost: string },
    transaction?: Transaction
  ): Promise<{ header: ParamCommonh; details: ParamCommond[] }> {
    try {
      console.log('➕ [APPL-002] Creating application parameter header:', data.param_code);
      
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
        param_type: 'A' as const,
        createdby: auditContext.createdby,
        createddate: new Date(),
        createdhost: auditContext.createdhost
      };

      const header = await ParamCommonh.create(headerData, { transaction });
      console.log('✅ [APPL-002] Application header created:', header.param_code);

      // Create details if provided
      const details: ParamCommond[] = [];
      if (data.details && data.details.length > 0) {
        console.log(`📋 [APPL-002] Creating ${data.details.length} detail records`);
        
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
        
        console.log(`✅ [APPL-002] Created ${details.length} detail records`);
      }

      return { header, details };
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to create application header:', error);
      throw error;
    }
  }

  /**
   * Update application parameter header
   */
  static async updateHeader(
    id: number,
    data: ApplicationParameterUpdateRequest,
    auditContext: { updatedby: string; updatedhost: string },
    transaction?: Transaction
  ): Promise<ParamCommonh | null> {
    try {
      console.log('📝 [APPL-002] Updating application parameter header:', id);
      
      // Find header and verify it's an application parameter
      const header = await ParamCommonh.findByPk(id);
      if (!header || header.param_type !== 'A') {
        console.log('⚠️ [APPL-002] Application parameter header not found:', id);
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
      console.log('✅ [APPL-002] Application header updated:', header.param_code);

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
      console.error('❌ [APPL-002] Failed to update application header:', error);
      throw error;
    }
  }

  /**
   * Delete application parameter header with cascade
   */
  static async deleteHeader(
    id: number,
    transaction?: Transaction
  ): Promise<{ header: ParamCommonh; deletedDetailsCount: number }> {
    try {
      console.log('🗑️ [APPL-002] Deleting application parameter header:', id);
      
      // Find header and verify it's an application parameter
      const header = await ParamCommonh.findByPk(id);
      if (!header || header.param_type !== 'A') {
        throw new Error(`Application parameter header not found: ${id}`);
      }

      // Delete all details first (cascade)
      const deletedDetailsCount = await ParamCommond.destroy({
        where: { param_code: header.param_code },
        transaction
      });

      // Delete header
      await header.destroy({ transaction });

      console.log(`✅ [APPL-002] Deleted header and ${deletedDetailsCount} detail records`);
      return { header, deletedDetailsCount };
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to delete application header:', error);
      throw error;
    }
  }

  // ==========================================
  // MASTER-DETAIL DETAIL OPERATIONS
  // ==========================================
  
  /**
   * Get details for application parameter header
   */
  static async getDetailsByHeaderId(headerId: number): Promise<ParamCommond[]> {
    try {
      console.log('📋 [APPL-002] Getting details for application parameter header:', headerId);
      
      // Find header first
      const header = await ParamCommonh.findByPk(headerId);
      if (!header || header.param_type !== 'A') {
        throw new Error(`Application parameter header not found: ${headerId}`);
      }

      // Get details
      const details = await ParamCommond.findAll({
        where: { param_code: header.param_code },
        order: [['param_seq', 'ASC']]
      });

      console.log(`✅ [APPL-002] Found ${details.length} details for header ${header.param_code}`);
      return details;
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to get application details:', error);
      throw error;
    }
  }

  /**
   * Create detail for application parameter header
   */
  static async createDetail(
    headerId: number,
    data: ApplicationDetailCreateRequest,
    auditContext: { createdby: string; createdhost: string },
    transaction?: Transaction
  ): Promise<ParamCommond> {
    try {
      console.log('➕ [APPL-002] Creating detail for application parameter header:', headerId);
      
      // Find header and verify it's an application parameter
      const header = await ParamCommonh.findByPk(headerId);
      if (!header || header.param_type !== 'A') {
        throw new Error(`Application parameter header not found: ${headerId}`);
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
      console.log('✅ [APPL-002] Application detail created:', detail.pkid);

      return detail;
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to create application detail:', error);
      throw error;
    }
  }

  /**
   * Update application parameter detail
   */
  static async updateDetail(
    detailId: number,
    data: ApplicationDetailUpdateRequest,
    auditContext: { updatedby: string; updatedhost: string },
    transaction?: Transaction
  ): Promise<ParamCommond | null> {
    try {
      console.log('📝 [APPL-002] Updating application parameter detail:', detailId);
      
      // Find detail and verify it belongs to an application parameter
      const detail = await ParamCommond.findByPk(detailId, {
        include: [{
          model: ParamCommonh,
          as: 'header',
          where: { param_type: 'A' }
        }]
      });
      
      if (!detail) {
        console.log('⚠️ [APPL-002] Application parameter detail not found:', detailId);
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
      console.log('✅ [APPL-002] Application detail updated:', detail.pkid);

      return detail;
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to update application detail:', error);
      throw error;
    }
  }

  /**
   * Delete application parameter detail
   */
  static async deleteDetail(
    detailId: number,
    transaction?: Transaction
  ): Promise<ParamCommond> {
    try {
      console.log('🗑️ [APPL-002] Deleting application parameter detail:', detailId);
      
      // Find detail and verify it belongs to an application parameter
      const detail = await ParamCommond.findByPk(detailId, {
        include: [{
          model: ParamCommonh,
          as: 'header',
          where: { param_type: 'A' }
        }]
      });
      
      if (!detail) {
        throw new Error(`Application parameter detail not found: ${detailId}`);
      }

      // Delete detail
      await detail.destroy({ transaction });
      console.log('✅ [APPL-002] Application detail deleted:', detailId);

      return detail;
      
    } catch (error) {
      console.error('❌ [APPL-002] Failed to delete application detail:', error);
      throw error;
    }
  }

  // ==========================================
  // BUSINESS VALIDATION METHODS
  // ==========================================
  
  /**
   * Validate application parameter code format
   */
  static validateParameterCode(paramCode: string): boolean {
    // Application parameter codes should follow pattern: APP[0-9]{3}
    const pattern = /^APP[0-9]{3}$/;
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
      console.error('❌ [APPL-002] Failed to get next sequence number:', error);
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
      console.error('❌ [APPL-002] Failed to validate sequence uniqueness:', error);
      return false;
    }
  }
}

// ============================================================================
// APPLICATION PARAMETER SERVICE CLASS
// ============================================================================

export class ApplicationParameterService {

  /**
   * Get all application parameter headers with their details
   */
  static async getAllHeaders(): Promise<ParamCommonh[]> {
    try {
      console.log('📋 [APPL-002] Getting all application parameter headers');

      const headers = await ParamCommonh.findAll({
        where: { param_type: 'A' },
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

      console.log(`✅ [APPL-002] Found ${headers.length} application parameter headers`);
      return headers;

    } catch (error) {
      console.error('❌ [APPL-002] Failed to get application headers:', error);
      throw error;
    }
  }

  /**
   * Get single application parameter header with details
   */
  static async getHeaderById(id: number): Promise<ParamCommonh | null> {
    try {
      console.log('🔍 [APPL-002] Getting application parameter header by ID:', id);

      const header = await ParamCommonh.findByPk(id, {
        include: [{
          model: ParamCommond,
          as: 'details',
          required: false
        }]
      });

      if (!header) {
        console.log('⚠️ [APPL-002] Application parameter header not found:', id);
        return null;
      }

      // Verify it's an application parameter
      if (header.param_type !== 'A') {
        console.log('⚠️ [APPL-002] Header is not an application parameter:', header.param_type);
        return null;
      }

      console.log('✅ [APPL-002] Found application parameter header:', header.param_code);
      return header;

    } catch (error) {
      console.error('❌ [APPL-002] Failed to get application header by ID:', error);
      throw error;
    }
  }
}

// Re-export base models and functions for controller use
export {
  ParamCommonh,
  ParamCommond,
  checkFRS9DatabaseHealth,
  frs9Sequelize
} from './frs9-parameter.models';

// Export singleton instance
export const applicationParameterService = new ApplicationParameterService();

console.log('✅ [APPL-002] ApplicationParameterService loaded - Master-Detail Models implemented');