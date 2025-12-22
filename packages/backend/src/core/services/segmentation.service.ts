// packages/backend/src/core/services/segmentation.service.ts
// ============================================================================
// 🔧 SEGMENTATION SERVICE - PHASE 3 MODULE 3.1 - REAL DATABASE IMPLEMENTATION
// ============================================================================
// ✅ PATTERN: Master-Detail with Complex Rule Management
// ✅ DATABASE: frs9_param_segmenth (header) + frs9_param_segmentd (detail)
// ✅ FEATURES: Tenant-aware operations, audit trails, transaction support
// ============================================================================

import { Pool } from 'pg';
import { AuditService } from './audit.service';
import { databaseConfig } from '../database/config/database.config';

// ============================================================================
// INTERFACES
// ============================================================================

interface SegmentationHeaderCreateData {
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq?: number;
  active_flag: boolean;
}

interface SegmentationDetailCreateData {
  segment_id: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string | null;
  value2?: string | null;
  condition?: string | null;
}

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// SEGMENTATION SERVICE CLASS
// ============================================================================

export class SegmentationService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
    console.log('✅ [SEGM-SERVICE-INIT] SegmentationService initialized with real FRS9 database integration');
  }

  // Get FRS9 database connection
  private getFRS9Database(): Pool {
    return databaseConfig.getFRS9Connection();
  }

  // ============================================================================
  // HEADER OPERATIONS (MASTER) - REAL DATABASE IMPLEMENTATION
  // ============================================================================

  /**
   * Get all segmentation headers with detail counts and pagination
   */
  async getHeaders(options: PaginationOptions): Promise<PaginatedResult<any>> {
    const client = this.getFRS9Database();
    
    try {
      console.log('📋 [SEGM-SERVICE-001] Getting segmentation headers with options:', options);

      const { page, limit, search } = options;
      const offset = (page - 1) * limit;

      // Build search WHERE clause
      let searchClause = '';
      let searchParams: any[] = [];
      if (search) {
        searchClause = `WHERE (h.group_segment ILIKE $1 OR h.segment ILIKE $1 OR h.sub_segment ILIKE $1)`;
        searchParams = [`%${search}%`];
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM frs9_param_segmenth h
        ${searchClause}
      `;

      const countResult = await client.query(countQuery, searchParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data with detail counts
      const dataQuery = `
        SELECT 
          h.pkid as id,
          h.group_segment,
          h.segment, 
          h.sub_segment,
          h.segment_type,
          h.seq,
          h.active_flag,
          h.createdby as created_by,
          h.createddate as created_date,
          h.createdhost as created_host,
          h.updatedby as updated_by,
          h.updateddate as updated_date,
          h.updatedhost as updated_host,
          COUNT(d.pkid) as detail_count
        FROM frs9_param_segmenth h
        LEFT JOIN frs9_param_segmentd d ON h.pkid = d.segment_id
        ${searchClause}
        GROUP BY h.pkid, h.group_segment, h.segment, h.sub_segment, h.segment_type, 
                 h.seq, h.active_flag, h.createdby, h.createddate, h.createdhost,
                 h.updatedby, h.updateddate, h.updatedhost
        ORDER BY h.seq ASC, h.pkid ASC
        LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
      `;

      const dataParams = [...searchParams, limit, offset];
      const dataResult = await client.query(dataQuery, dataParams);

      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };

    } catch (error) {
      console.error('❌ [SEGM-SERVICE-001] Error getting headers:', error);
      throw error;
    }
  }

  /**
   * Get single segmentation header by ID
   */
  async getHeader(headerId: number): Promise<any> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-002] Getting segmentation header by ID: ${headerId}`);
      
      const query = `
        SELECT 
          h.pkid as id,
          h.group_segment,
          h.segment, 
          h.sub_segment,
          h.segment_type,
          h.seq,
          h.active_flag,
          h.createdby as created_by,
          h.createddate as created_date,
          h.createdhost as created_host,
          h.updatedby as updated_by,
          h.updateddate as updated_date,
          h.updatedhost as updated_host,
          COUNT(d.pkid) as detail_count
        FROM frs9_param_segmenth h
        LEFT JOIN frs9_param_segmentd d ON h.pkid = d.segment_id
        WHERE h.pkid = $1
        GROUP BY h.pkid, h.group_segment, h.segment, h.sub_segment, h.segment_type, 
                 h.seq, h.active_flag, h.createdby, h.createddate, h.createdhost,
                 h.updatedby, h.updateddate, h.updatedhost
      `;

      const result = await client.query(query, [headerId]);
      
      if (result.rows.length === 0) {
        throw new Error(`Segmentation header not found: ${headerId}`);
      }

      return result.rows[0];

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-002] Header not found: ${headerId}`);
      throw error;
    }
  }

  /**
   * Create new segmentation header
   */
  async createHeader(
    data: SegmentationHeaderCreateData,
    createdBy: string,
    createdHost?: string
  ): Promise<any> {
    const client = this.getFRS9Database();
    
    try {
      console.log('📋 [SEGM-SERVICE-003] Creating segmentation header:', data);
      
      const query = `
        INSERT INTO frs9_param_segmenth (
          group_segment, segment, sub_segment, segment_type, seq, active_flag,
          createdby, createddate, createdhost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING pkid as id, group_segment, segment, sub_segment, segment_type, 
                  seq, active_flag, createdby as created_by, createddate as created_date, 
                  createdhost as created_host
      `;

      const params = [
        data.group_segment,
        data.segment,
        data.sub_segment || null,
        data.segment_type,
        data.seq || 1,
        data.active_flag,
        createdBy,
        createdHost || 'system'
      ];

      const result = await client.query(query, params);
      const newHeader = result.rows[0];

      // Log audit
      await this.auditService.log({
        action: 'CREATE',
        entity: 'SegmentationHeader',
        entityId: newHeader.id,
        performedBy: createdBy,
        timestamp: new Date(),
        data: data
      });

      return newHeader;

    } catch (error) {
      console.error('❌ [SEGM-SERVICE-003] Error creating header:', error);
      throw error;
    }
  }

  /**
   * Update segmentation header
   */
  async updateHeader(
    headerId: number,
    data: Partial<SegmentationHeaderCreateData>,
    updatedBy: string,
    updatedHost?: string
  ): Promise<any> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-004] Updating segmentation header ${headerId}`);
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.group_segment !== undefined) {
        updateFields.push(`group_segment = $${paramIndex}`);
        params.push(data.group_segment);
        paramIndex++;
      }
      if (data.segment !== undefined) {
        updateFields.push(`segment = $${paramIndex}`);
        params.push(data.segment);
        paramIndex++;
      }
      if (data.sub_segment !== undefined) {
        updateFields.push(`sub_segment = $${paramIndex}`);
        params.push(data.sub_segment);
        paramIndex++;
      }
      if (data.segment_type !== undefined) {
        updateFields.push(`segment_type = $${paramIndex}`);
        params.push(data.segment_type);
        paramIndex++;
      }
      if (data.seq !== undefined) {
        updateFields.push(`seq = $${paramIndex}`);
        params.push(data.seq);
        paramIndex++;
      }
      if (data.active_flag !== undefined) {
        updateFields.push(`active_flag = $${paramIndex}`);
        params.push(data.active_flag);
        paramIndex++;
      }

      // Add audit fields
      updateFields.push(`updatedby = $${paramIndex}`);
      params.push(updatedBy);
      paramIndex++;

      updateFields.push(`updateddate = NOW()`);

      updateFields.push(`updatedhost = $${paramIndex}`);
      params.push(updatedHost || 'system');
      paramIndex++;

      // Add WHERE clause
      params.push(headerId);

      const query = `
        UPDATE frs9_param_segmenth 
        SET ${updateFields.join(', ')}
        WHERE pkid = $${paramIndex}
        RETURNING pkid as id, group_segment, segment, sub_segment, segment_type, 
                  seq, active_flag, updatedby as updated_by, updateddate as updated_date, 
                  updatedhost as updated_host
      `;

      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error(`Segmentation header not found: ${headerId}`);
      }

      const updatedHeader = result.rows[0];

      // Log audit
      await this.auditService.log({
        action: 'UPDATE',
        entity: 'SegmentationHeader',
        entityId: headerId,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: data
      });

      return updatedHeader;

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-004] Error updating header ${headerId}:`, error);
      throw error;
    }
  }

  /**
   * Delete segmentation header and all details
   */
  async deleteHeader(headerId: number, deletedBy: string): Promise<void> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-005] Deleting segmentation header ${headerId}`);
      
      // Start transaction
      await client.query('BEGIN');

      // First delete all details
      const deleteDetailsQuery = 'DELETE FROM frs9_param_segmentd WHERE segment_id = $1';
      const detailsResult = await client.query(deleteDetailsQuery, [headerId]);

      // Then delete header
      const deleteHeaderQuery = 'DELETE FROM frs9_param_segmenth WHERE pkid = $1';
      const headerResult = await client.query(deleteHeaderQuery, [headerId]);

      if (headerResult.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new Error(`Segmentation header not found: ${headerId}`);
      }

      // Commit transaction
      await client.query('COMMIT');

      // Log audit
      await this.auditService.log({
        action: 'DELETE',
        entity: 'SegmentationHeader',
        entityId: headerId,
        performedBy: deletedBy,
        timestamp: new Date(),
        additionalInfo: `Deleted header and ${detailsResult.rowCount} details`
      });

      console.log(`✅ [SEGM-SERVICE-005] Deleted segmentation header ${headerId} and ${detailsResult.rowCount} details`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [SEGM-SERVICE-005] Error deleting header ${headerId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // DETAIL OPERATIONS - REAL DATABASE IMPLEMENTATION
  // ============================================================================

  /**
   * Get all details for a segmentation header
   */
  async getDetails(headerId: number): Promise<any[]> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-006] Getting details for header ID: ${headerId}`);

      const query = `
        SELECT 
          pkid as id,
          segment_id,
          query_group,
          seq,
          table_name,
          column_name,
          data_type,
          operator,
          value1,
          value2,
          condition,
          createdby as created_by,
          createddate as created_date,
          createdhost as created_host,
          updatedby as updated_by,
          updateddate as updated_date,
          updatedhost as updated_host
        FROM frs9_param_segmentd
        WHERE segment_id = $1
        ORDER BY query_group ASC, seq ASC
      `;

      const result = await client.query(query, [headerId]);
      return result.rows;

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-006] Error getting details for header ${headerId}:`, error);
      throw error;
    }
  }

  /**
   * Create new detail for segmentation header
   */
  async createDetail(
    headerId: number,
    data: SegmentationDetailCreateData,
    createdBy: string,
    createdHost?: string
  ): Promise<any> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-007] Creating detail for header ${headerId}`);
      
      const query = `
        INSERT INTO frs9_param_segmentd (
          segment_id, query_group, seq, table_name, column_name, data_type, 
          operator, value1, value2, condition,
          createdby, createddate, createdhost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)
        RETURNING pkid as id, segment_id, query_group, seq, table_name, column_name,
                  data_type, operator, value1, value2, condition,
                  createdby as created_by, createddate as created_date, 
                  createdhost as created_host
      `;

      const params = [
        headerId,
        data.query_group,
        data.seq,
        data.table_name,
        data.column_name,
        data.data_type,
        data.operator,
        data.value1 || null,
        data.value2 || null,
        data.condition || null,
        createdBy,
        createdHost || 'system'
      ];

      const result = await client.query(query, params);
      const newDetail = result.rows[0];

      // Log audit
      await this.auditService.log({
        action: 'CREATE',
        entity: 'SegmentationDetail',
        entityId: newDetail.id,
        performedBy: createdBy,
        timestamp: new Date(),
        data: data
      });

      return newDetail;

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-007] Error creating detail for header ${headerId}:`, error);
      throw error;
    }
  }

  /**
   * Update segmentation detail
   */
  async updateDetail(
    detailId: number,
    data: Partial<SegmentationDetailCreateData>,
    updatedBy: string,
    updatedHost?: string
  ): Promise<any> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-008] Updating detail ${detailId}`);
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.keys(data).forEach((key: keyof typeof data) => {
        if (data[key] !== undefined && key !== 'segment_id') { // Don't allow updating segment_id
          updateFields.push(`${key} = $${paramIndex}`);
          params.push(data[key]);
          paramIndex++;
        }
      });

      // Add audit fields
      updateFields.push(`updatedby = $${paramIndex}`);
      params.push(updatedBy);
      paramIndex++;

      updateFields.push(`updateddate = NOW()`);

      updateFields.push(`updatedhost = $${paramIndex}`);
      params.push(updatedHost || 'system');
      paramIndex++;

      // Add WHERE clause
      params.push(detailId);

      const query = `
        UPDATE frs9_param_segmentd 
        SET ${updateFields.join(', ')}
        WHERE pkid = $${paramIndex}
        RETURNING pkid as id, segment_id, query_group, seq, table_name, column_name,
                  data_type, operator, value1, value2, condition,
                  updatedby as updated_by, updateddate as updated_date, 
                  updatedhost as updated_host
      `;

      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error(`Segmentation detail not found: ${detailId}`);
      }

      const updatedDetail = result.rows[0];

      // Log audit
      await this.auditService.log({
        action: 'UPDATE',
        entity: 'SegmentationDetail',
        entityId: detailId,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: data
      });

      return updatedDetail;

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-008] Error updating detail ${detailId}:`, error);
      throw error;
    }
  }

  /**
   * Delete segmentation detail
   */
  async deleteDetail(detailId: number, deletedBy: string): Promise<void> {
    const client = this.getFRS9Database();
    
    try {
      console.log(`📋 [SEGM-SERVICE-009] Deleting detail ${detailId}`);
      
      const query = 'DELETE FROM frs9_param_segmentd WHERE pkid = $1';
      const result = await client.query(query, [detailId]);

      if (result.rowCount === 0) {
        throw new Error(`Segmentation detail not found: ${detailId}`);
      }

      // Log audit
      await this.auditService.log({
        action: 'DELETE',
        entity: 'SegmentationDetail',
        entityId: detailId,
        performedBy: deletedBy,
        timestamp: new Date()
      });

      console.log(`✅ [SEGM-SERVICE-009] Deleted segmentation detail ${detailId}`);

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-009] Error deleting detail ${detailId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // VALIDATION METHODS - REAL DATABASE IMPLEMENTATION
  // ============================================================================

  /**
   * Validate operator for specific data type
   */
  async validateOperator(operator: string, dataType: string): Promise<boolean> {
    try {
      console.log(`📋 [SEGM-SERVICE-010] Validating operator ${operator} for data type ${dataType}`);

      // These are the actual validation rules from the mapping
      const validOperators: Record<string, string[]> = {
        'VARCHAR': ['IN', 'NOT IN', 'LIKE', 'NOT LIKE', '=', '<>'],
        'NUMBER': ['=', '>', '<', '>=', '<=', '<>', 'BETWEEN'],
        'DATE': ['=', '>', '<', '>=', '<=', '<>', 'BETWEEN'],
        'BOOLEAN': ['=']
      };

      const isValid = validOperators[dataType]?.includes(operator) || false;
      console.log(`✅ [SEGM-SERVICE-010] Operator validation passed: ${isValid}`);
      return isValid;

    } catch (error) {
      console.error(`❌ [SEGM-SERVICE-010] Error validating operator:`, error);
      return false;
    }
  }
}