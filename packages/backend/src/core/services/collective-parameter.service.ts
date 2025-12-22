// packages/backend/src/core/services/collective-parameter.service.ts
// ============================================================================
// 🔧 COLLECTIVE PARAMETER SERVICE - PHASE 3 MODULE 3.4
// ============================================================================
// ✅ PATTERN: Master-Detail with Integration Links + Configuration Orchestration
// ✅ DATABASE: collective_parameter_headers + collective_parameter_details
// ✅ FEATURES: Module integration, validation engine, calculation preview
// ============================================================================

import { Pool } from 'pg';
import { getTenantDatabaseConnection } from '../config/database-connection';
import { databaseConfig } from '../database/config/database.config';
import {
  CollectiveParameterHeaderAttributes,
  CollectiveParameterHeaderCreationAttributes,
  CollectiveParameterDetailAttributes,
  CollectiveParameterDetailCreationAttributes,
  CollectiveConfiguration,
  ConfigurationValidation,
  CalculationPreview,
  ModuleLinkageStatus
} from '../models/collective-parameter.models';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CreateCollectiveParameterData {
  template_name: string;
  template_description?: string;
  template_type: 'PORTFOLIO' | 'SEGMENT' | 'PRODUCT' | 'CUSTOM';
  segmentation_id?: number;
  rule_base_setting_id?: number;
  bucket_parameter_id?: number;
  calculation_method?: 'COLLECTIVE' | 'HYBRID';
  aggregation_level?: 'ACCOUNT' | 'SEGMENT' | 'PORTFOLIO';
  stage_override_rules?: any;
  sicr_triggers?: any;
  default_definitions?: any;
  active_flag?: boolean;
  execution_priority?: number;
  effective_date?: Date;
  expiry_date?: Date;
}

export interface UpdateCollectiveParameterData {
  template_name?: string;
  template_description?: string;
  template_type?: 'PORTFOLIO' | 'SEGMENT' | 'PRODUCT' | 'CUSTOM';
  segmentation_id?: number;
  rule_base_setting_id?: number;
  bucket_parameter_id?: number;
  calculation_method?: 'COLLECTIVE' | 'HYBRID';
  aggregation_level?: 'ACCOUNT' | 'SEGMENT' | 'PORTFOLIO';
  stage_override_rules?: any;
  sicr_triggers?: any;
  default_definitions?: any;
  active_flag?: boolean;
  execution_priority?: number;
  effective_date?: Date;
  expiry_date?: Date;
}

export interface CreateCollectiveParameterDetailData {
  parameter_type: 'PD_OVERRIDE' | 'LGD_ADJUSTMENT' | 'EAD_FACTOR' | 'STAGING_RULE' | 'SICR_THRESHOLD' | 'DEFAULT_TRIGGER';
  parameter_name: string;
  parameter_value: string;
  parameter_unit?: string;
  apply_to_segment?: string;
  apply_to_product?: string;
  apply_to_stage?: number;
  execution_order?: number;
  dependency_rules?: any;
  min_value?: number;
  max_value?: number;
  validation_rules?: any;
  active_flag?: boolean;
}

export interface UpdateCollectiveParameterDetailData {
  parameter_type?: 'PD_OVERRIDE' | 'LGD_ADJUSTMENT' | 'EAD_FACTOR' | 'STAGING_RULE' | 'SICR_THRESHOLD' | 'DEFAULT_TRIGGER';
  parameter_name?: string;
  parameter_value?: string;
  parameter_unit?: string;
  apply_to_segment?: string;
  apply_to_product?: string;
  apply_to_stage?: number;
  execution_order?: number;
  dependency_rules?: any;
  min_value?: number;
  max_value?: number;
  validation_rules?: any;
  active_flag?: boolean;
}

// ============================================================================
// COLLECTIVE PARAMETER SERVICE CLASS
// ============================================================================

export class CollectiveParameterService {
  private db: Pool;
  private initialized: boolean = false;

  constructor() {
    console.log('✅ [COLL-001] CollectiveParameterService initialized - Orchestration layer ready');
    // Initialize synchronously using platform connection as fallback
    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      // Try to get tenant database connection synchronously
      this.db = databaseConfig.getConnectionById('tenant_iaf');
      console.log('✅ [COLL-001] Using tenant database connection');
    } catch (error) {
      console.warn('⚠️ [COLL-001] Failed to get tenant connection, using platform connection as fallback:', error.message);
      try {
        this.db = databaseConfig.getPlatformConnection();
        console.log('✅ [COLL-001] Using platform database connection as fallback');
      } catch (platformError) {
        console.error('❌ [COLL-001] Failed to initialize any database connection:', platformError.message);
        throw new Error('Database connection initialization failed');
      }
    }
    this.initialized = true;
  }

  // ============================================================================
  // HEADER OPERATIONS (MASTER)
  // ============================================================================

  async getHeaders(params: PaginationParams): Promise<ServiceResult<PaginatedResult<CollectiveParameterHeaderAttributes>>> {
    try {
      console.log('🔍 [COLL-002] Getting collective parameter headers with pagination:', params);

      const offset = (params.page - 1) * params.limit;
      let whereClause = '';
      const queryParams: any[] = [params.limit, offset];

      if (params.search) {
        whereClause = `WHERE h.template_name ILIKE $3 OR h.template_description ILIKE $3`;
        queryParams.push(`%${params.search}%`);
      }

      // Query with detail count
      const query = `
        SELECT 
          h.id,
          h.template_name,
          h.template_description,
          h.template_type,
          h.segmentation_id,
          h.rule_base_setting_id,
          h.bucket_parameter_id,
          h.calculation_method,
          h.aggregation_level,
          h.stage_override_rules,
          h.sicr_triggers,
          h.default_definitions,
          h.active_flag,
          h.execution_priority,
          h.effective_date,
          h.expiry_date,
          h.created_by,
          h.created_date,
          h.updated_by,
          h.updated_date,
          COALESCE(COUNT(d.id), 0) as detail_count
        FROM collective_impairment.collective_parameter_headers h
        LEFT JOIN collective_impairment.collective_parameter_details d ON h.id = d.collective_parameter_id AND d.active_flag = true
        ${whereClause}
        GROUP BY h.id
        ORDER BY h.execution_priority ASC, h.effective_date DESC
        LIMIT $1 OFFSET $2
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM collective_impairment.collective_parameter_headers h
        ${whereClause}
      `;

      const [dataResult, countResult] = await Promise.all([
        this.db.query(query, queryParams),
        this.db.query(countQuery, params.search ? [`%${params.search}%`] : [])
      ]);

      const total = parseInt(countResult.rows[0]?.total || '0');
      const totalPages = Math.ceil(total / params.limit);

      console.log(`✅ [COLL-002] Retrieved ${dataResult.rows.length} collective parameter headers`);

      return {
        success: true,
        data: {
          data: dataResult.rows,
          pagination: {
            total,
            page: params.page,
            limit: params.limit,
            totalPages
          }
        }
      };

    } catch (error) {
      console.error('❌ [COLL-002] Failed to get collective parameter headers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getHeaderById(id: number): Promise<ServiceResult<CollectiveParameterHeaderAttributes>> {
    try {
      console.log(`🔍 [COLL-003] Getting collective parameter header by ID: ${id}`);

      const query = `
        SELECT 
          h.*,
          COALESCE(COUNT(d.id), 0) as detail_count
        FROM collective_impairment.collective_parameter_headers h
        LEFT JOIN collective_impairment.collective_parameter_details d ON h.id = d.collective_parameter_id AND d.active_flag = true
        WHERE h.id = $1
        GROUP BY h.id
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Collective parameter header not found'
        };
      }

      console.log(`✅ [COLL-003] Retrieved collective parameter header: ${result.rows[0].template_name}`);

      return {
        success: true,
        data: result.rows[0]
      };

    } catch (error) {
      console.error(`❌ [COLL-003] Failed to get collective parameter header ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createHeader(data: CreateCollectiveParameterData, createdBy: string, createdHost?: string): Promise<ServiceResult<CollectiveParameterHeaderAttributes>> {
    const client = await this.db.connect();
    
    try {
      console.log('➕ [COLL-004] Creating collective parameter header:', data.template_name);

      await client.query('BEGIN');

      // Check for duplicate template name
      const duplicateCheck = await client.query(
        'SELECT id FROM collective_impairment.collective_parameter_headers WHERE template_name = $1',
        [data.template_name]
      );

      if (duplicateCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Template name already exists'
        };
      }

      const insertQuery = `
        INSERT INTO collective_impairment.collective_parameter_headers (
          template_name, template_description, template_type,
          segmentation_id, rule_base_setting_id, bucket_parameter_id,
          calculation_method, aggregation_level,
          stage_override_rules, sicr_triggers, default_definitions,
          active_flag, execution_priority, effective_date, expiry_date,
          created_by, created_date, created_host
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), $17
        ) RETURNING *
      `;

      const values = [
        data.template_name,
        data.template_description || null,
        data.template_type,
        data.segmentation_id || null,
        data.rule_base_setting_id || null,
        data.bucket_parameter_id || null,
        data.calculation_method || 'COLLECTIVE',
        data.aggregation_level || 'SEGMENT',
        data.stage_override_rules ? JSON.stringify(data.stage_override_rules) : null,
        data.sicr_triggers ? JSON.stringify(data.sicr_triggers) : null,
        data.default_definitions ? JSON.stringify(data.default_definitions) : null,
        data.active_flag !== undefined ? data.active_flag : true,
        data.execution_priority || 1,
        data.effective_date || new Date(),
        data.expiry_date || null,
        createdBy,
        createdHost || null
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');

      console.log(`✅ [COLL-004] Created collective parameter header: ${result.rows[0].template_name}`);

      return {
        success: true,
        data: result.rows[0],
        message: 'Collective parameter header created successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ [COLL-004] Failed to create collective parameter header:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      client.release();
    }
  }

  async updateHeader(id: number, data: UpdateCollectiveParameterData, updatedBy: string, updatedHost?: string): Promise<ServiceResult<CollectiveParameterHeaderAttributes>> {
    const client = await this.db.connect();
    
    try {
      console.log(`✏️ [COLL-005] Updating collective parameter header ID: ${id}`);

      await client.query('BEGIN');

      // Check if header exists
      const existingHeader = await client.query(
        'SELECT id FROM collective_impairment.collective_parameter_headers WHERE id = $1',
        [id]
      );

      if (existingHeader.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Collective parameter header not found'
        };
      }

      // Check for duplicate template name (if being updated)
      if (data.template_name) {
        const duplicateCheck = await client.query(
          'SELECT id FROM collective_impairment.collective_parameter_headers WHERE template_name = $1 AND id != $2',
          [data.template_name, id]
        );

        if (duplicateCheck.rows.length > 0) {
          await client.query('ROLLBACK');
          return {
            success: false,
            error: 'Template name already exists'
          };
        }
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (data.template_name !== undefined) {
        updateFields.push(`template_name = $${paramIndex++}`);
        updateValues.push(data.template_name);
      }
      if (data.template_description !== undefined) {
        updateFields.push(`template_description = $${paramIndex++}`);
        updateValues.push(data.template_description);
      }
      if (data.template_type !== undefined) {
        updateFields.push(`template_type = $${paramIndex++}`);
        updateValues.push(data.template_type);
      }
      if (data.segmentation_id !== undefined) {
        updateFields.push(`segmentation_id = $${paramIndex++}`);
        updateValues.push(data.segmentation_id);
      }
      if (data.rule_base_setting_id !== undefined) {
        updateFields.push(`rule_base_setting_id = $${paramIndex++}`);
        updateValues.push(data.rule_base_setting_id);
      }
      if (data.bucket_parameter_id !== undefined) {
        updateFields.push(`bucket_parameter_id = $${paramIndex++}`);
        updateValues.push(data.bucket_parameter_id);
      }
      if (data.calculation_method !== undefined) {
        updateFields.push(`calculation_method = $${paramIndex++}`);
        updateValues.push(data.calculation_method);
      }
      if (data.aggregation_level !== undefined) {
        updateFields.push(`aggregation_level = $${paramIndex++}`);
        updateValues.push(data.aggregation_level);
      }
      if (data.stage_override_rules !== undefined) {
        updateFields.push(`stage_override_rules = $${paramIndex++}`);
        updateValues.push(data.stage_override_rules ? JSON.stringify(data.stage_override_rules) : null);
      }
      if (data.sicr_triggers !== undefined) {
        updateFields.push(`sicr_triggers = $${paramIndex++}`);
        updateValues.push(data.sicr_triggers ? JSON.stringify(data.sicr_triggers) : null);
      }
      if (data.default_definitions !== undefined) {
        updateFields.push(`default_definitions = $${paramIndex++}`);
        updateValues.push(data.default_definitions ? JSON.stringify(data.default_definitions) : null);
      }
      if (data.active_flag !== undefined) {
        updateFields.push(`active_flag = $${paramIndex++}`);
        updateValues.push(data.active_flag);
      }
      if (data.execution_priority !== undefined) {
        updateFields.push(`execution_priority = $${paramIndex++}`);
        updateValues.push(data.execution_priority);
      }
      if (data.effective_date !== undefined) {
        updateFields.push(`effective_date = $${paramIndex++}`);
        updateValues.push(data.effective_date);
      }
      if (data.expiry_date !== undefined) {
        updateFields.push(`expiry_date = $${paramIndex++}`);
        updateValues.push(data.expiry_date);
      }

      // Add audit fields
      updateFields.push(`updated_by = $${paramIndex++}`, `updated_date = NOW()`, `updated_host = $${paramIndex++}`);
      updateValues.push(updatedBy, updatedHost || null);

      updateValues.push(id); // Add ID for WHERE clause

      const updateQuery = `
        UPDATE collective_impairment.collective_parameter_headers 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);
      await client.query('COMMIT');

      console.log(`✅ [COLL-005] Updated collective parameter header: ${result.rows[0].template_name}`);

      return {
        success: true,
        data: result.rows[0],
        message: 'Collective parameter header updated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [COLL-005] Failed to update collective parameter header ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      client.release();
    }
  }

  async deleteHeader(id: number): Promise<ServiceResult<boolean>> {
    const client = await this.db.connect();
    
    try {
      console.log(`🗑️ [COLL-006] Deleting collective parameter header ID: ${id}`);

      await client.query('BEGIN');

      // Check if header exists and get detail count
      const headerCheck = await client.query(`
        SELECT 
          h.template_name,
          COALESCE(COUNT(d.id), 0) as detail_count
        FROM collective_impairment.collective_parameter_headers h
        LEFT JOIN collective_impairment.collective_parameter_details d ON h.id = d.collective_parameter_id
        WHERE h.id = $1
        GROUP BY h.id, h.template_name
      `, [id]);

      if (headerCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Collective parameter header not found'
        };
      }

      const headerInfo = headerCheck.rows[0];
      console.log(`🔍 [COLL-006] Found header "${headerInfo.template_name}" with ${headerInfo.detail_count} details`);

      // Delete details first (cascade should handle this, but being explicit)
      if (parseInt(headerInfo.detail_count) > 0) {
        await client.query(
          'DELETE FROM collective_impairment.collective_parameter_details WHERE collective_parameter_id = $1',
          [id]
        );
        console.log(`🗑️ [COLL-006] Deleted ${headerInfo.detail_count} detail records`);
      }

      // Delete header
      await client.query(
        'DELETE FROM collective_impairment.collective_parameter_headers WHERE id = $1',
        [id]
      );

      await client.query('COMMIT');

      console.log(`✅ [COLL-006] Deleted collective parameter header "${headerInfo.template_name}" and all details`);

      return {
        success: true,
        data: true,
        message: 'Collective parameter header and all details deleted successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [COLL-006] Failed to delete collective parameter header ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // DETAIL OPERATIONS (DETAIL)
  // ============================================================================

  async getDetails(headerId: number, params?: PaginationParams): Promise<ServiceResult<PaginatedResult<CollectiveParameterDetailAttributes>>> {
    try {
      console.log(`🔍 [COLL-007] Getting collective parameter details for header ID: ${headerId}`);

      if (params) {
        const offset = (params.page - 1) * params.limit;
        
        const query = `
          SELECT * FROM collective_impairment.collective_parameter_details
          WHERE collective_parameter_id = $1
          ORDER BY execution_order ASC, parameter_type ASC
          LIMIT $2 OFFSET $3
        `;

        const countQuery = `
          SELECT COUNT(*) as total
          FROM collective_impairment.collective_parameter_details
          WHERE collective_parameter_id = $1
        `;

        const [dataResult, countResult] = await Promise.all([
          this.db.query(query, [headerId, params.limit, offset]),
          this.db.query(countQuery, [headerId])
        ]);

        const total = parseInt(countResult.rows[0]?.total || '0');
        const totalPages = Math.ceil(total / params.limit);

        return {
          success: true,
          data: {
            data: dataResult.rows,
            pagination: {
              total,
              page: params.page,
              limit: params.limit,
              totalPages
            }
          }
        };
      } else {
        const query = `
          SELECT * FROM collective_impairment.collective_parameter_details
          WHERE collective_parameter_id = $1
          ORDER BY execution_order ASC, parameter_type ASC
        `;

        const result = await this.db.query(query, [headerId]);

        return {
          success: true,
          data: {
            data: result.rows,
            pagination: {
              total: result.rows.length,
              page: 1,
              limit: result.rows.length,
              totalPages: 1
            }
          }
        };
      }

    } catch (error) {
      console.error(`❌ [COLL-007] Failed to get collective parameter details for header ${headerId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createDetail(headerId: number, data: CreateCollectiveParameterDetailData, createdBy: string, createdHost?: string): Promise<ServiceResult<CollectiveParameterDetailAttributes>> {
    const client = await this.db.connect();
    
    try {
      console.log(`➕ [COLL-008] Creating collective parameter detail for header ID: ${headerId}`);

      await client.query('BEGIN');

      // Verify header exists
      const headerCheck = await client.query(
        'SELECT id FROM collective_impairment.collective_parameter_headers WHERE id = $1',
        [headerId]
      );

      if (headerCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Collective parameter header not found'
        };
      }

      // Check for duplicate parameter name within the same header and scope
      const duplicateCheck = await client.query(`
        SELECT id FROM collective_impairment.collective_parameter_details 
        WHERE collective_parameter_id = $1 
        AND parameter_name = $2 
        AND COALESCE(apply_to_segment, '') = COALESCE($3, '')
        AND COALESCE(apply_to_stage, 0) = COALESCE($4, 0)
      `, [headerId, data.parameter_name, data.apply_to_segment || '', data.apply_to_stage || 0]);

      if (duplicateCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Parameter name with this scope already exists in the template'
        };
      }

      const insertQuery = `
        INSERT INTO collective_impairment.collective_parameter_details (
          collective_parameter_id, parameter_type, parameter_name, parameter_value, parameter_unit,
          apply_to_segment, apply_to_product, apply_to_stage,
          execution_order, dependency_rules, min_value, max_value, validation_rules,
          active_flag, created_by, created_date, created_host
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), $16
        ) RETURNING *
      `;

      const values = [
        headerId,
        data.parameter_type,
        data.parameter_name,
        data.parameter_value,
        data.parameter_unit || null,
        data.apply_to_segment || null,
        data.apply_to_product || null,
        data.apply_to_stage || null,
        data.execution_order || 1,
        data.dependency_rules ? JSON.stringify(data.dependency_rules) : null,
        data.min_value || null,
        data.max_value || null,
        data.validation_rules ? JSON.stringify(data.validation_rules) : null,
        data.active_flag !== undefined ? data.active_flag : true,
        createdBy,
        createdHost || null
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');

      console.log(`✅ [COLL-008] Created collective parameter detail: ${result.rows[0].parameter_name}`);

      return {
        success: true,
        data: result.rows[0],
        message: 'Collective parameter detail created successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [COLL-008] Failed to create collective parameter detail for header ${headerId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      client.release();
    }
  }

  async updateDetail(detailId: number, data: UpdateCollectiveParameterDetailData, updatedBy: string, updatedHost?: string): Promise<ServiceResult<CollectiveParameterDetailAttributes>> {
    const client = await this.db.connect();
    
    try {
      console.log(`✏️ [COLL-009] Updating collective parameter detail ID: ${detailId}`);

      await client.query('BEGIN');

      // Check if detail exists
      const existingDetail = await client.query(
        'SELECT collective_parameter_id FROM collective_impairment.collective_parameter_details WHERE id = $1',
        [detailId]
      );

      if (existingDetail.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Collective parameter detail not found'
        };
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (data.parameter_type !== undefined) {
        updateFields.push(`parameter_type = $${paramIndex++}`);
        updateValues.push(data.parameter_type);
      }
      if (data.parameter_name !== undefined) {
        updateFields.push(`parameter_name = $${paramIndex++}`);
        updateValues.push(data.parameter_name);
      }
      if (data.parameter_value !== undefined) {
        updateFields.push(`parameter_value = $${paramIndex++}`);
        updateValues.push(data.parameter_value);
      }
      if (data.parameter_unit !== undefined) {
        updateFields.push(`parameter_unit = $${paramIndex++}`);
        updateValues.push(data.parameter_unit);
      }
      if (data.apply_to_segment !== undefined) {
        updateFields.push(`apply_to_segment = $${paramIndex++}`);
        updateValues.push(data.apply_to_segment);
      }
      if (data.apply_to_product !== undefined) {
        updateFields.push(`apply_to_product = $${paramIndex++}`);
        updateValues.push(data.apply_to_product);
      }
      if (data.apply_to_stage !== undefined) {
        updateFields.push(`apply_to_stage = $${paramIndex++}`);
        updateValues.push(data.apply_to_stage);
      }
      if (data.execution_order !== undefined) {
        updateFields.push(`execution_order = $${paramIndex++}`);
        updateValues.push(data.execution_order);
      }
      if (data.dependency_rules !== undefined) {
        updateFields.push(`dependency_rules = $${paramIndex++}`);
        updateValues.push(data.dependency_rules ? JSON.stringify(data.dependency_rules) : null);
      }
      if (data.min_value !== undefined) {
        updateFields.push(`min_value = $${paramIndex++}`);
        updateValues.push(data.min_value);
      }
      if (data.max_value !== undefined) {
        updateFields.push(`max_value = $${paramIndex++}`);
        updateValues.push(data.max_value);
      }
      if (data.validation_rules !== undefined) {
        updateFields.push(`validation_rules = $${paramIndex++}`);
        updateValues.push(data.validation_rules ? JSON.stringify(data.validation_rules) : null);
      }
      if (data.active_flag !== undefined) {
        updateFields.push(`active_flag = $${paramIndex++}`);
        updateValues.push(data.active_flag);
      }

      // Add audit fields
      updateFields.push(`updated_by = $${paramIndex++}`, `updated_date = NOW()`, `updated_host = $${paramIndex++}`);
      updateValues.push(updatedBy, updatedHost || null);

      updateValues.push(detailId); // Add ID for WHERE clause

      const updateQuery = `
        UPDATE collective_impairment.collective_parameter_details 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);
      await client.query('COMMIT');

      console.log(`✅ [COLL-009] Updated collective parameter detail: ${result.rows[0].parameter_name}`);

      return {
        success: true,
        data: result.rows[0],
        message: 'Collective parameter detail updated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [COLL-009] Failed to update collective parameter detail ${detailId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      client.release();
    }
  }

  async deleteDetail(detailId: number): Promise<ServiceResult<boolean>> {
    try {
      console.log(`🗑️ [COLL-010] Deleting collective parameter detail ID: ${detailId}`);

      const checkQuery = 'SELECT parameter_name FROM collective_impairment.collective_parameter_details WHERE id = $1';
      const checkResult = await this.db.query(checkQuery, [detailId]);

      if (checkResult.rows.length === 0) {
        return {
          success: false,
          error: 'Collective parameter detail not found'
        };
      }

      const parameterName = checkResult.rows[0].parameter_name;

      await this.db.query(
        'DELETE FROM collective_impairment.collective_parameter_details WHERE id = $1',
        [detailId]
      );

      console.log(`✅ [COLL-010] Deleted collective parameter detail: ${parameterName}`);

      return {
        success: true,
        data: true,
        message: 'Collective parameter detail deleted successfully'
      };

    } catch (error) {
      console.error(`❌ [COLL-010] Failed to delete collective parameter detail ${detailId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ============================================================================
  // INTEGRATION AND ORCHESTRATION METHODS (MODULE 3.4 SPECIFIC)
  // ============================================================================

  async getModuleLinkageStatus(headerId: number): Promise<ServiceResult<ModuleLinkageStatus>> {
    try {
      console.log(`🔍 [COLL-011] Getting module linkage status for header ID: ${headerId}`);

      const query = `
        SELECT 
          segmentation_id,
          rule_base_setting_id,
          bucket_parameter_id
        FROM collective_impairment.collective_parameter_headers
        WHERE id = $1
      `;

      const result = await this.db.query(query, [headerId]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Collective parameter header not found'
        };
      }

      const row = result.rows[0];
      
      const status: ModuleLinkageStatus = {
        segmentationLinked: !!row.segmentation_id,
        ruleBaseLinked: !!row.rule_base_setting_id,
        bucketParameterLinked: !!row.bucket_parameter_id,
        configurationComplete: !!(row.segmentation_id && row.rule_base_setting_id && row.bucket_parameter_id),
        readyForCalculation: !!(row.segmentation_id && row.rule_base_setting_id && row.bucket_parameter_id)
      };

      return {
        success: true,
        data: status
      };

    } catch (error) {
      console.error(`❌ [COLL-011] Failed to get module linkage status:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getCollectiveConfiguration(headerId: number): Promise<ServiceResult<CollectiveConfiguration>> {
    try {
      console.log(`🔍 [COLL-012] Building collective configuration for header ID: ${headerId}`);

      // Get header with linked module IDs
      const headerResult = await this.getHeaderById(headerId);
      if (!headerResult.success || !headerResult.data) {
        return {
          success: false,
          error: 'Collective parameter header not found'
        };
      }

      // Get details
      const detailsResult = await this.getDetails(headerId);
      if (!detailsResult.success || !detailsResult.data) {
        return {
          success: false,
          error: 'Failed to load collective parameter details'
        };
      }

      const configuration: CollectiveConfiguration = {
        header: headerResult.data,
        details: detailsResult.data.data,
        // TODO: Load actual segmentation, rules, and bucket data when those services are available
        segmentation: headerResult.data.segmentation_id ? { id: headerResult.data.segmentation_id } : undefined,
        ruleBaseSetting: headerResult.data.rule_base_setting_id ? { id: headerResult.data.rule_base_setting_id } : undefined,
        bucketParameter: headerResult.data.bucket_parameter_id ? { id: headerResult.data.bucket_parameter_id } : undefined
      };

      console.log(`✅ [COLL-012] Built collective configuration with ${configuration.details.length} parameters`);

      return {
        success: true,
        data: configuration
      };

    } catch (error) {
      console.error(`❌ [COLL-012] Failed to build collective configuration:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async validateConfiguration(headerId: number): Promise<ServiceResult<ConfigurationValidation>> {
    try {
      console.log(`🔍 [COLL-013] Validating collective configuration for header ID: ${headerId}`);

      const configResult = await this.getCollectiveConfiguration(headerId);
      if (!configResult.success || !configResult.data) {
        return {
          success: false,
          error: 'Failed to load configuration for validation'
        };
      }

      const config = configResult.data;
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation rules
      if (!config.segmentation && !config.ruleBaseSetting && !config.bucketParameter) {
        errors.push('At least one module linkage (Segmentation, Rules, or Bucket) is required');
      }

      if (config.details.length === 0) {
        warnings.push('No parameter details configured');
      }

      // Check for duplicate execution orders
      const executionOrders = config.details.map(d => d.execution_order);
      const duplicateOrders = executionOrders.filter((order, index) => executionOrders.indexOf(order) !== index);
      if (duplicateOrders.length > 0) {
        warnings.push(`Duplicate execution orders found: ${duplicateOrders.join(', ')}`);
      }

      // Check parameter value ranges
      config.details.forEach(detail => {
        if (detail.min_value !== null && detail.max_value !== null && detail.min_value > detail.max_value) {
          errors.push(`Invalid range for parameter "${detail.parameter_name}": min > max`);
        }
      });

      // Suggestions for optimization
      if (config.details.length > 20) {
        suggestions.push('Consider breaking down complex templates into smaller, focused ones');
      }

      if (!config.segmentation) {
        suggestions.push('Link a segmentation configuration for better portfolio targeting');
      }

      const validation: ConfigurationValidation = {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
      };

      console.log(`✅ [COLL-013] Configuration validation complete - Valid: ${validation.isValid}`);

      return {
        success: true,
        data: validation
      };

    } catch (error) {
      console.error(`❌ [COLL-013] Failed to validate configuration:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async previewCalculation(headerId: number, sampleData?: any): Promise<ServiceResult<CalculationPreview>> {
    try {
      console.log(`🔍 [COLL-014] Generating calculation preview for header ID: ${headerId}`);

      // For now, return a mock preview. This would integrate with the actual ECL calculation engine
      const mockPreview: CalculationPreview = {
        impactedAccounts: 1250,
        stagingChanges: {
          stage1ToStage2: 45,
          stage2ToStage3: 12,
          stageDowngrades: 8
        },
        eclImpact: {
          totalEclBefore: 25000000,
          totalEclAfter: 27500000,
          eclChange: 2500000,
          eclChangePercentage: 10.0
        },
        parameterApplication: {
          pdOverrides: 15,
          lgdAdjustments: 8,
          eadFactors: 5,
          stagingRules: 3
        }
      };

      console.log(`✅ [COLL-014] Generated calculation preview`);

      return {
        success: true,
        data: mockPreview,
        message: 'Calculation preview generated (mock data for development)'
      };

    } catch (error) {
      console.error(`❌ [COLL-014] Failed to generate calculation preview:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // ============================================================================
  // HELPER METHODS FOR INTEGRATION
  // ============================================================================

  async getParameterTypes(): Promise<ServiceResult<string[]>> {
    try {
      const parameterTypes = [
        'PD_OVERRIDE',
        'LGD_ADJUSTMENT', 
        'EAD_FACTOR',
        'STAGING_RULE',
        'SICR_THRESHOLD',
        'DEFAULT_TRIGGER'
      ];

      return {
        success: true,
        data: parameterTypes
      };

    } catch (error) {
      console.error('❌ [COLL-015] Failed to get parameter types:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getTemplateTypes(): Promise<ServiceResult<string[]>> {
    try {
      const templateTypes = [
        'PORTFOLIO',
        'SEGMENT',
        'PRODUCT',
        'CUSTOM'
      ];

      return {
        success: true,
        data: templateTypes
      };

    } catch (error) {
      console.error('❌ [COLL-016] Failed to get template types:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}