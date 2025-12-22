// packages/backend/src/core/services/ecl-configuration-corrected.service.ts
// ============================================================================
// 🏦 ECL CONFIGURATION SERVICE - Real FRS9PRO Database Integration (CORRECTED)
// ============================================================================
// ✅ PATTERN: Direct PostgreSQL queries to actual legacy tables
// ✅ DATABASE: frs9_imp_ca_ecl_configh (header) + frs9_imp_ca_ecl_configd (detail)
// ✅ STRUCTURE: Based on ACTUAL database schema, not documentation assumptions
// ============================================================================

import { Pool, PoolClient } from 'pg';
import { backendEnvironmentLoader } from '../../config/environment-loader-backend';

// ============================================================================
// INTERFACES (Based on ACTUAL Table Structure - DS2 FRS9PRO Database)
// ============================================================================

// ECL Configuration Header (FRS9_IMP_CA_ECL_CONFIGH - REAL structure)
export interface EclConfigurationHeader {
  pkid?: number; // Primary key (smallint)
  ecl_model_name: string; // ECL Model Name (varchar(50))
  module?: string; // Module identifier (varchar(10))
  module_name?: string; // Module name from B0024 business setting
  effective_date: Date; // Model effective date
  active_flag: boolean; // Model active status
  last_run_period?: Date; // Last execution period
  last_run_status?: string; // Last run status (varchar(50))
  last_run_date?: Date; // Last execution timestamp
  
  // Audit fields
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
  
  // Related details
  details?: EclConfigurationDetail[];
}

// ECL Configuration Detail (FRS9_IMP_CA_ECL_CONFIGD - REAL structure)
export interface EclConfigurationDetail {
  pkid?: number; // Primary key (smallint)
  ecl_model_id?: number; // Foreign key to header (smallint)
  pf_segment_id?: number; // Portfolio segment ID (smallint)
  stage_rule_id?: number; // Stage rule ID (smallint)
  pd_model_id?: number; // PD model ID (smallint)
  lgd_model_id?: number; // LGD model ID (smallint)
  ead_model_id?: number; // EAD model ID (smallint)
  overlay_rate?: number; // Overlay rate (smallint, default 100)
  period_type?: number; // Period type (smallint)
  period_date?: Date; // Period date
  
  // Audit fields
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

// Service interfaces
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  producttype?: string;
  active_only?: boolean;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ComboDataSource {
  value: string;
  label: string;
  description?: string;
}

export interface SimulationResult {
  ecl_model_name: string;
  simulation_data: any[];
  execution_time: number;
  status: string;
}

// ============================================================================
// ECL CONFIGURATION SERVICE CLASS (REAL DATABASE INTEGRATION)
// ============================================================================

export class EclConfigurationService {
  private pool: Pool;

  constructor() {
    // Initialize connection to FRS9 database using centralized backend configuration
    const envConfig = backendEnvironmentLoader.getConfiguration();
    const frs9Config = envConfig.database.frs9;

    this.pool = new Pool({
      host: frs9Config.host,
      port: frs9Config.port,
      database: frs9Config.database,
      user: frs9Config.user,
      password: frs9Config.password,
      ssl: frs9Config.ssl ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    console.log('✅ [ECL-SVC-001] EclConfigurationService initialized - Connected to FRS9 database via centralized config');
    console.log(`📊 Database: ${frs9Config.database} at ${frs9Config.host}:${frs9Config.port}`);
  }

  // ==========================================================================
  // HEADER OPERATIONS (FRS9_IMP_CA_ECL_CONFIGH)
  // ==========================================================================

  /**
   * Get all ECL configuration headers with pagination
   */
  async getHeaders(params: PaginationParams): Promise<ServiceResult<{ data: EclConfigurationHeader[]; pagination: any }>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔍 [ECL-SVC-002] Fetching ECL configuration headers - Page ${params.page}, Limit ${params.limit}`);
      
      const offset = (params.page - 1) * params.limit;
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 0;

      // Build filters based on actual table structure
      if (params.search) {
        paramIndex++;
        whereClause += ` AND ecl_model_name ILIKE $${paramIndex}`;
        queryParams.push(`%${params.search}%`);
      }

      if (params.active_only) {
        paramIndex++;
        whereClause += ` AND active_flag = $${paramIndex}`;
        queryParams.push(true);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM frs9_imp_ca_ecl_configh 
        ${whereClause}
      `;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / params.limit);

      // Get paginated data with REAL column names and module mapping
      const dataQuery = `
        SELECT 
          h.pkid,
          h.ecl_model_name,
          h.module,
          COALESCE(m.paramdesc, 'Unknown Module') as module_name,
          h.effective_date,
          h.active_flag,
          h.last_run_period,
          h.last_run_status,
          h.last_run_date,
          h.createdby,
          h.createddate,
          h.createdhost,
          h.updatedby,
          h.updateddate,
          h.updatedhost
        FROM frs9_imp_ca_ecl_configh h
        LEFT JOIN frs9_param_commond m ON m.param_code = 'B0024' AND m.value1 = h.module
        ${whereClause.replace('WHERE 1=1', 'WHERE 1=1')}
        ORDER BY h.effective_date DESC, h.ecl_model_name ASC
        LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
      `;

      queryParams.push(params.limit, offset);
      const dataResult = await client.query(dataQuery, queryParams);

      // Fetch details for each header
      const headersWithDetails = [];
      for (const row of dataResult.rows) {
        const detailsQuery = `
          SELECT 
            pkid,
            ecl_model_id,
            pf_segment_id,
            stage_rule_id,
            pd_model_id,
            lgd_model_id,
            ead_model_id,
            overlay_rate,
            period_type,
            period_date,
            createdby,
            createddate,
            createdhost,
            updatedby,
            updateddate,
            updatedhost
          FROM frs9_imp_ca_ecl_configd 
          WHERE ecl_model_id = $1
          ORDER BY pkid ASC
        `;
        
        const detailsResult = await client.query(detailsQuery, [row.pkid]);
        const details: EclConfigurationDetail[] = detailsResult.rows.map(detail => ({
          pkid: detail.pkid,
          ecl_model_id: detail.ecl_model_id,
          pf_segment_id: detail.pf_segment_id,
          stage_rule_id: detail.stage_rule_id,
          pd_model_id: detail.pd_model_id,
          lgd_model_id: detail.lgd_model_id,
          ead_model_id: detail.ead_model_id,
          overlay_rate: detail.overlay_rate,
          period_type: detail.period_type,
          period_date: detail.period_date,
          createdby: detail.createdby,
          createddate: detail.createddate,
          createdhost: detail.createdhost,
          updatedby: detail.updatedby,
          updateddate: detail.updateddate,
          updatedhost: detail.updatedhost
        }));

        const headerWithDetails = {
          pkid: row.pkid,
          ecl_model_name: row.ecl_model_name,
          module: row.module,
          module_name: row.module_name,
          effective_date: row.effective_date,
          active_flag: row.active_flag,
          last_run_period: row.last_run_period,
          last_run_status: row.last_run_status,
          last_run_date: row.last_run_date,
          createdby: row.createdby,
          createddate: row.createddate,
          createdhost: row.createdhost,
          updatedby: row.updatedby,
          updateddate: row.updateddate,
          updatedhost: row.updatedhost,
          details: details
        };

        headersWithDetails.push(headerWithDetails);
      }

      console.log(`✅ [ECL-SVC-003] Retrieved ${headersWithDetails.length} ECL configuration headers with details (Page ${params.page}/${totalPages})`);

      return {
        success: true,
        data: {
          data: headersWithDetails,
          pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages
          }
        }
      };

    } catch (error) {
      console.error('❌ [ECL-SVC-004] Error fetching ECL configuration headers:', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get single ECL configuration header with details
   */
  async getHeader(pkid: number): Promise<ServiceResult<EclConfigurationHeader & { details?: EclConfigurationDetail[] }>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔍 [ECL-SVC-005] Fetching ECL configuration header with ID: ${pkid}`);

      // Get header
      const headerQuery = `
        SELECT 
          pkid,
          ecl_model_name,
          module,
          effective_date,
          active_flag,
          last_run_period,
          last_run_status,
          last_run_date,
          createdby,
          createddate,
          createdhost,
          updatedby,
          updateddate,
          updatedhost
        FROM frs9_imp_ca_ecl_configh 
        WHERE pkid = $1
      `;

      const headerResult = await client.query(headerQuery, [pkid]);
      
      if (headerResult.rows.length === 0) {
        return {
          success: false,
          error: `ECL Configuration with ID ${pkid} not found`
        };
      }

      const header: EclConfigurationHeader = {
        pkid: headerResult.rows[0].pkid,
        ecl_model_name: headerResult.rows[0].ecl_model_name,
        module: headerResult.rows[0].module,
        effective_date: headerResult.rows[0].effective_date,
        active_flag: headerResult.rows[0].active_flag,
        last_run_period: headerResult.rows[0].last_run_period,
        last_run_status: headerResult.rows[0].last_run_status,
        last_run_date: headerResult.rows[0].last_run_date,
        createdby: headerResult.rows[0].createdby,
        createddate: headerResult.rows[0].createddate,
        createdhost: headerResult.rows[0].createdhost,
        updatedby: headerResult.rows[0].updatedby,
        updateddate: headerResult.rows[0].updateddate,
        updatedhost: headerResult.rows[0].updatedhost
      };

      // Get associated details
      const detailQuery = `
        SELECT 
          pkid,
          ecl_model_id,
          pf_segment_id,
          stage_rule_id,
          pd_model_id,
          lgd_model_id,
          ead_model_id,
          overlay_rate,
          period_type,
          period_date,
          createdby,
          createddate,
          createdhost,
          updatedby,
          updateddate,
          updatedhost
        FROM frs9_imp_ca_ecl_configd 
        WHERE ecl_model_id = $1
        ORDER BY pkid
      `;

      const detailResult = await client.query(detailQuery, [pkid]);
      const details: EclConfigurationDetail[] = detailResult.rows.map(row => ({
        pkid: row.pkid,
        ecl_model_id: row.ecl_model_id,
        pf_segment_id: row.pf_segment_id,
        stage_rule_id: row.stage_rule_id,
        pd_model_id: row.pd_model_id,
        lgd_model_id: row.lgd_model_id,
        ead_model_id: row.ead_model_id,
        overlay_rate: row.overlay_rate,
        period_type: row.period_type,
        period_date: row.period_date,
        createdby: row.createdby,
        createddate: row.createddate,
        createdhost: row.createdhost,
        updatedby: row.updatedby,
        updateddate: row.updateddate,
        updatedhost: row.updatedhost
      }));

      console.log(`✅ [ECL-SVC-006] Retrieved ECL configuration header with ${details.length} detail records`);

      return {
        success: true,
        data: { ...header, details }
      };

    } catch (error) {
      console.error(`❌ [ECL-SVC-007] Error fetching ECL configuration header ${pkid}:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Create new ECL configuration header
   */
  async createHeader(headerData: Omit<EclConfigurationHeader, 'pkid' | 'createddate' | 'updateddate'>): Promise<ServiceResult<EclConfigurationHeader>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔧 [ECL-SVC-008] Creating new ECL configuration header: ${headerData.ecl_model_name}`);

      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO frs9_imp_ca_ecl_configh (
          ecl_model_name, module, effective_date, active_flag,
          last_run_period, last_run_status, last_run_date,
          createdby, createddate, createdhost
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9
        ) RETURNING *
      `;

      const values = [
        headerData.ecl_model_name,
        headerData.module || '1',
        headerData.effective_date,
        headerData.active_flag,
        headerData.last_run_period || null,
        headerData.last_run_status || null,
        headerData.last_run_date || null,
        headerData.createdby,
        headerData.createdhost
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');

      const newHeader: EclConfigurationHeader = {
        pkid: result.rows[0].pkid,
        ecl_model_name: result.rows[0].ecl_model_name,
        module: result.rows[0].module,
        effective_date: result.rows[0].effective_date,
        active_flag: result.rows[0].active_flag,
        last_run_period: result.rows[0].last_run_period,
        last_run_status: result.rows[0].last_run_status,
        last_run_date: result.rows[0].last_run_date,
        createdby: result.rows[0].createdby,
        createddate: result.rows[0].createddate,
        createdhost: result.rows[0].createdhost,
        updatedby: result.rows[0].updatedby,
        updateddate: result.rows[0].updateddate,
        updatedhost: result.rows[0].updatedhost
      };

      console.log(`✅ [ECL-SVC-009] ECL configuration header created with ID: ${newHeader.pkid}`);

      return {
        success: true,
        data: newHeader
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ [ECL-SVC-010] Error creating ECL configuration header:', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Update ECL configuration header
   */
  async updateHeader(pkid: number, updateData: Partial<EclConfigurationHeader>): Promise<ServiceResult<EclConfigurationHeader>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔧 [ECL-SVC-011] Updating ECL configuration header ID: ${pkid}`);

      await client.query('BEGIN');

      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Build dynamic update query based on provided fields
      if (updateData.ecl_model_name !== undefined) {
        updateFields.push(`ecl_model_name = $${paramIndex}`);
        updateValues.push(updateData.ecl_model_name);
        paramIndex++;
      }

      if (updateData.module !== undefined) {
        updateFields.push(`module = $${paramIndex}`);
        updateValues.push(updateData.module);
        paramIndex++;
      }

      if (updateData.effective_date !== undefined) {
        updateFields.push(`effective_date = $${paramIndex}`);
        updateValues.push(updateData.effective_date);
        paramIndex++;
      }

      if (updateData.active_flag !== undefined) {
        updateFields.push(`active_flag = $${paramIndex}`);
        updateValues.push(updateData.active_flag);
        paramIndex++;
      }

      if (updateData.last_run_status !== undefined) {
        updateFields.push(`last_run_status = $${paramIndex}`);
        updateValues.push(updateData.last_run_status);
        paramIndex++;
      }

      // Add updated audit fields
      updateFields.push(`updatedby = $${paramIndex}`);
      updateValues.push(updateData.updatedby || 'SYSTEM');
      paramIndex++;

      updateFields.push(`updateddate = NOW()`);
      
      updateFields.push(`updatedhost = $${paramIndex}`);
      updateValues.push(updateData.updatedhost || 'localhost');
      paramIndex++;

      // Add WHERE clause parameter
      updateValues.push(pkid);

      const updateQuery = `
        UPDATE frs9_imp_ca_ecl_configh 
        SET ${updateFields.join(', ')}
        WHERE pkid = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);
      
      if (result.rows.length === 0) {
        return {
          success: false,
          error: `ECL Configuration header with ID ${pkid} not found`
        };
      }

      await client.query('COMMIT');

      const updatedHeader: EclConfigurationHeader = {
        pkid: result.rows[0].pkid,
        ecl_model_name: result.rows[0].ecl_model_name,
        module: result.rows[0].module,
        effective_date: result.rows[0].effective_date,
        active_flag: result.rows[0].active_flag,
        last_run_period: result.rows[0].last_run_period,
        last_run_status: result.rows[0].last_run_status,
        last_run_date: result.rows[0].last_run_date,
        createdby: result.rows[0].createdby,
        createddate: result.rows[0].createddate,
        createdhost: result.rows[0].createdhost,
        updatedby: result.rows[0].updatedby,
        updateddate: result.rows[0].updateddate,
        updatedhost: result.rows[0].updatedhost
      };

      console.log(`✅ [ECL-SVC-012] ECL configuration header updated: ${updatedHeader.ecl_model_name}`);

      return {
        success: true,
        data: updatedHeader
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [ECL-SVC-013] Error updating ECL configuration header ${pkid}:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Delete ECL configuration header and all associated details
   */
  async deleteHeader(pkid: number): Promise<ServiceResult<boolean>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🗑️ [ECL-SVC-014] Deleting ECL configuration header ID: ${pkid}`);

      await client.query('BEGIN');

      // First delete associated details
      const deleteDetailsQuery = `DELETE FROM frs9_imp_ca_ecl_configd WHERE ecl_model_id = $1`;
      const detailResult = await client.query(deleteDetailsQuery, [pkid]);
      
      console.log(`🗑️ [ECL-SVC-015] Deleted ${detailResult.rowCount} associated detail records`);

      // Then delete the header
      const deleteHeaderQuery = `DELETE FROM frs9_imp_ca_ecl_configh WHERE pkid = $1`;
      const headerResult = await client.query(deleteHeaderQuery, [pkid]);
      
      if (headerResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: `ECL Configuration header with ID ${pkid} not found`
        };
      }

      await client.query('COMMIT');
      
      console.log(`✅ [ECL-SVC-016] ECL configuration header ${pkid} deleted successfully`);

      return {
        success: true,
        data: true
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ [ECL-SVC-017] Error deleting ECL configuration header ${pkid}:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // DETAIL OPERATIONS (FRS9_IMP_CA_ECL_CONFIGD)
  // ==========================================================================

  /**
   * Get all details for an ECL configuration header
   */
  async getDetails(eclModelId: number): Promise<ServiceResult<EclConfigurationDetail[]>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔍 [ECL-SVC-018] Fetching ECL configuration details for model ID: ${eclModelId}`);

      const query = `
        SELECT 
          pkid,
          ecl_model_id,
          pf_segment_id,
          stage_rule_id,
          pd_model_id,
          lgd_model_id,
          ead_model_id,
          overlay_rate,
          period_type,
          period_date,
          createdby,
          createddate,
          createdhost,
          updatedby,
          updateddate,
          updatedhost
        FROM frs9_imp_ca_ecl_configd 
        WHERE ecl_model_id = $1
        ORDER BY pkid
      `;

      const result = await client.query(query, [eclModelId]);
      
      const details: EclConfigurationDetail[] = result.rows.map(row => ({
        pkid: row.pkid,
        ecl_model_id: row.ecl_model_id,
        pf_segment_id: row.pf_segment_id,
        stage_rule_id: row.stage_rule_id,
        pd_model_id: row.pd_model_id,
        lgd_model_id: row.lgd_model_id,
        ead_model_id: row.ead_model_id,
        overlay_rate: row.overlay_rate,
        period_type: row.period_type,
        period_date: row.period_date,
        createdby: row.createdby,
        createddate: row.createddate,
        createdhost: row.createdhost,
        updatedby: row.updatedby,
        updateddate: row.updateddate,
        updatedhost: row.updatedhost
      }));

      console.log(`✅ [ECL-SVC-019] Retrieved ${details.length} ECL configuration detail records`);

      return {
        success: true,
        data: details
      };

    } catch (error) {
      console.error(`❌ [ECL-SVC-020] Error fetching ECL configuration details:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Create new ECL configuration detail
   */
  async createDetail(detailData: Omit<EclConfigurationDetail, 'pkid' | 'createddate' | 'updateddate'>): Promise<ServiceResult<EclConfigurationDetail>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔧 [ECL-SVC-021] Creating new ECL configuration detail for model ID: ${detailData.ecl_model_id}`);

      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO frs9_imp_ca_ecl_configd (
          ecl_model_id, pf_segment_id, stage_rule_id, pd_model_id,
          lgd_model_id, ead_model_id, overlay_rate, period_type, period_date,
          createdby, createddate, createdhost
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11
        ) RETURNING *
      `;

      const values = [
        detailData.ecl_model_id,
        detailData.pf_segment_id,
        detailData.stage_rule_id,
        detailData.pd_model_id,
        detailData.lgd_model_id,
        detailData.ead_model_id,
        detailData.overlay_rate || 100,
        detailData.period_type,
        detailData.period_date,
        detailData.createdby,
        detailData.createdhost
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');

      const newDetail: EclConfigurationDetail = {
        pkid: result.rows[0].pkid,
        ecl_model_id: result.rows[0].ecl_model_id,
        pf_segment_id: result.rows[0].pf_segment_id,
        stage_rule_id: result.rows[0].stage_rule_id,
        pd_model_id: result.rows[0].pd_model_id,
        lgd_model_id: result.rows[0].lgd_model_id,
        ead_model_id: result.rows[0].ead_model_id,
        overlay_rate: result.rows[0].overlay_rate,
        period_type: result.rows[0].period_type,
        period_date: result.rows[0].period_date,
        createdby: result.rows[0].createdby,
        createddate: result.rows[0].createddate,
        createdhost: result.rows[0].createdhost,
        updatedby: result.rows[0].updatedby,
        updateddate: result.rows[0].updateddate,
        updatedhost: result.rows[0].updatedhost
      };

      console.log(`✅ [ECL-SVC-022] ECL configuration detail created with ID: ${newDetail.pkid}`);

      return {
        success: true,
        data: newDetail
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ [ECL-SVC-023] Error creating ECL configuration detail:', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // COMBO BOX DATA SOURCES (For dropdown populations)
  // ==========================================================================

  /**
   * Get combo box data for various sources
   */
  async getComboBoxData(source: string): Promise<ServiceResult<ComboDataSource[]>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🔍 [ECL-SVC-024] Fetching combo box data for source: ${source}`);

      let query = '';
      let params: any[] = [];

      // Route to appropriate business settings based on source
      switch (source.toLowerCase()) {
        case 'modules':
          // Business Setting B0024 - Module mapping
          query = `
            SELECT DISTINCT 
              d.value1 as value,
              d.paramdesc as label,
              'Business Module Type' as description
            FROM frs9_param_commond d
            WHERE d.param_code = 'B0024'
            ORDER BY d.value1
          `;
          break;

        case 'portfolio_segments':
          // Portfolio Segment from FRS9_PARAM_SEGMENTH with segment_type='PF'
          query = `
            SELECT DISTINCT 
              pkid as value,
              segment as label,
              sub_segment as description
            FROM frs9_param_segmenth 
            WHERE segment_type = 'PF' AND active_flag = true
            ORDER BY segment
          `;
          break;

        case 'stage_rules':
          // Stage Rule from FRS9_PARAM_SCENARIO_RULESH with rule_type='STAGE'
          query = `
            SELECT DISTINCT 
              pkid as value,
              rule_name as label,
              value as description
            FROM frs9_param_scenario_rulesh 
            WHERE rule_type = 'STAGE' AND active_flag = true
            ORDER BY rule_name
          `;
          break;

        case 'pd_models':
          // PD Model from FRS9_IMP_CA_PD_CONFIG
          query = `
            SELECT DISTINCT 
              pkid as value,
              pd_model_name as label,
              CONCAT('PD Model - ', pd_method, ' (', interval, 'M)') as description
            FROM frs9_imp_ca_pd_config 
            WHERE active_flag = true
            ORDER BY pd_model_name
          `;
          break;

        case 'lgd_models':
          // LGD Model from FRS9_IMP_CA_LGD_CONFIG
          query = `
            SELECT DISTINCT 
              pkid as value,
              lgd_model_name as label,
              'LGD Model Configuration' as description
            FROM frs9_imp_ca_lgd_config 
            WHERE active_flag = true
            ORDER BY lgd_model_name
          `;
          break;

        case 'ead_models':
          // EAD Model from FRS9_IMP_CA_EAD_CONFIG
          query = `
            SELECT DISTINCT 
              pkid as value,
              ead_model_name as label,
              'EAD Model Configuration' as description
            FROM frs9_imp_ca_ead_config 
            WHERE active_flag = true
            ORDER BY ead_model_name
          `;
          break;

        case 'ccf_models':
          // CCF Model - No specific table exists, return empty result or placeholder
          query = `
            SELECT 
              NULL as value,
              'No CCF Models Available' as label,
              'CCF Model configuration not implemented' as description
            WHERE FALSE
          `;
          break;

        case 'period_types':
          // Period Type from Business Setting B0025
          query = `
            SELECT DISTINCT 
              d.value1 as value,
              d.paramdesc as label,
              'Period Type Configuration' as description
            FROM frs9_param_commond d
            WHERE d.param_code = 'B0025'
            ORDER BY d.value1
          `;
          break;

        case 'modelstatus':
          // Model execution status from existing data
          query = `
            SELECT DISTINCT 
              last_run_status as value,
              last_run_status as label,
              'Model Execution Status' as description
            FROM frs9_imp_ca_ecl_configh 
            WHERE last_run_status IS NOT NULL
            ORDER BY last_run_status
          `;
          break;

        case 'overlayrates':
          // Overlay rates from detail table
          query = `
            SELECT DISTINCT 
              overlay_rate::text as value,
              CONCAT('Overlay Rate: ', overlay_rate, '%') as label,
              'Portfolio Overlay Adjustment Rate' as description
            FROM frs9_imp_ca_ecl_configd 
            WHERE overlay_rate IS NOT NULL
            ORDER BY overlay_rate
          `;
          break;

        default:
          return {
            success: false,
            error: `Unsupported combo box data source: ${source}. Supported sources: modules, portfolio_segments, stage_rules, pd_models, lgd_models, ead_models, ccf_models, period_types, modelstatus, overlayrates`
          };
      }

      const result = await client.query(query, params);
      
      const comboData: ComboDataSource[] = result.rows.map(row => ({
        value: row.value,
        label: row.label,
        description: row.description || undefined
      }));

      console.log(`✅ [ECL-SVC-025] Retrieved ${comboData.length} combo box items for ${source}`);

      return {
        success: true,
        data: comboData
      };

    } catch (error) {
      console.error(`❌ [ECL-SVC-026] Error fetching combo box data for ${source}:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // SIMULATION INTEGRATION (FOR TESTING)
  // ==========================================================================

  /**
   * Run basic ECL model simulation (simplified for testing)
   */
  async runSimulation(eclModelId: number, previewData?: any, calculationDate?: Date): Promise<ServiceResult<SimulationResult>> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log(`🧪 [ECL-SVC-027] Running simulation for ECL model ID: ${eclModelId}`);

      // Get ECL model information
      const modelQuery = `
        SELECT ecl_model_name, module, effective_date, active_flag
        FROM frs9_imp_ca_ecl_configh 
        WHERE pkid = $1 AND active_flag = true
      `;
      
      const modelResult = await client.query(modelQuery, [eclModelId]);
      
      if (modelResult.rows.length === 0) {
        return {
          success: false,
          error: `Active ECL model with ID ${eclModelId} not found`
        };
      }

      const model = modelResult.rows[0];
      const startTime = Date.now();

      // Get model configuration details
      const detailsQuery = `
        SELECT 
          pf_segment_id, stage_rule_id, pd_model_id, 
          lgd_model_id, ead_model_id, overlay_rate
        FROM frs9_imp_ca_ecl_configd 
        WHERE ecl_model_id = $1
        ORDER BY pkid
      `;
      
      const detailsResult = await client.query(detailsQuery, [eclModelId]);
      
      // Simulate ECL calculation results
      const simulationData = detailsResult.rows.map((detail, index) => ({
        sequence: index + 1,
        segment_id: detail.pf_segment_id,
        stage_rule: detail.stage_rule_id,
        pd_model: detail.pd_model_id,
        lgd_model: detail.lgd_model_id,
        ead_model: detail.ead_model_id,
        overlay_rate: detail.overlay_rate,
        simulated_ecl: Math.random() * 100000, // Mock ECL calculation
        calculation_date: calculationDate || new Date(),
        status: 'simulated'
      }));

      const executionTime = Date.now() - startTime;

      const result: SimulationResult = {
        ecl_model_name: model.ecl_model_name,
        simulation_data: simulationData,
        execution_time: executionTime,
        status: 'completed'
      };

      console.log(`✅ [ECL-SVC-028] Simulation completed for ${model.ecl_model_name} (${simulationData.length} segments, ${executionTime}ms)`);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error(`❌ [ECL-SVC-029] Error running simulation:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Simulation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Update ECL Configuration Detail
   */
  async updateDetail(detailId: number, detailData: Partial<EclConfigurationDetail>): Promise<ServiceResult<EclConfigurationDetail>> {
    const client = await this.pool.connect();
    
    try {
      console.log(`🔧 [ECL-SVC-031] Updating ECL configuration detail ID: ${detailId}`);

      // Build the update query dynamically based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      const now = new Date();
      const updatedby = detailData.updatedby || detailData.createdby || 'system';
      const updatedhost = detailData.updatedhost || detailData.createdhost || 'localhost';

      // Add updated audit fields
      updateFields.push(`updatedby = $${paramCount++}`, `updateddate = $${paramCount++}`, `updatedhost = $${paramCount++}`);
      values.push(updatedby, now, updatedhost);

      // Add optional business fields
      if (detailData.pf_segment_id !== undefined) {
        updateFields.push(`pf_segment_id = $${paramCount++}`);
        values.push(detailData.pf_segment_id);
      }
      if (detailData.stage_rule_id !== undefined) {
        updateFields.push(`stage_rule_id = $${paramCount++}`);
        values.push(detailData.stage_rule_id);
      }
      if (detailData.pd_model_id !== undefined) {
        updateFields.push(`pd_model_id = $${paramCount++}`);
        values.push(detailData.pd_model_id);
      }
      if (detailData.lgd_model_id !== undefined) {
        updateFields.push(`lgd_model_id = $${paramCount++}`);
        values.push(detailData.lgd_model_id);
      }
      if (detailData.ead_model_id !== undefined) {
        updateFields.push(`ead_model_id = $${paramCount++}`);
        values.push(detailData.ead_model_id);
      }
      if (detailData.overlay_rate !== undefined) {
        updateFields.push(`overlay_rate = $${paramCount++}`);
        values.push(detailData.overlay_rate);
      }
      if (detailData.period_type !== undefined) {
        updateFields.push(`period_type = $${paramCount++}`);
        values.push(detailData.period_type);
      }
      if (detailData.period_date !== undefined) {
        updateFields.push(`period_date = $${paramCount++}`);
        values.push(detailData.period_date);
      }

      // Add the WHERE clause parameter
      values.push(detailId);

      const updateQuery = `
        UPDATE frs9_imp_ca_ecl_configd 
        SET ${updateFields.join(', ')}
        WHERE pkid = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'ECL configuration detail not found'
        };
      }

      const updatedDetail: EclConfigurationDetail = {
        pkid: result.rows[0].pkid,
        ecl_model_id: result.rows[0].ecl_model_id,
        pf_segment_id: result.rows[0].pf_segment_id,
        stage_rule_id: result.rows[0].stage_rule_id,
        pd_model_id: result.rows[0].pd_model_id,
        lgd_model_id: result.rows[0].lgd_model_id,
        ead_model_id: result.rows[0].ead_model_id,
        overlay_rate: result.rows[0].overlay_rate,
        period_type: result.rows[0].period_type,
        period_date: result.rows[0].period_date,
        createdby: result.rows[0].createdby,
        createddate: result.rows[0].createddate,
        createdhost: result.rows[0].createdhost,
        updatedby: result.rows[0].updatedby,
        updateddate: result.rows[0].updateddate,
        updatedhost: result.rows[0].updatedhost
      };

      console.log(`✅ [ECL-SVC-032] ECL configuration detail updated: ID ${detailId}`);

      return {
        success: true,
        data: updatedDetail
      };

    } catch (error) {
      console.error(`❌ [ECL-SVC-033] Error updating ECL configuration detail:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Update error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  /**
   * Delete ECL Configuration Detail
   */
  async deleteDetail(detailId: number): Promise<ServiceResult<void>> {
    const client = await this.pool.connect();
    
    try {
      console.log(`🗑️ [ECL-SVC-034] Deleting ECL configuration detail ID: ${detailId}`);

      const deleteQuery = `
        DELETE FROM frs9_imp_ca_ecl_configd 
        WHERE pkid = $1
      `;

      const result = await client.query(deleteQuery, [detailId]);

      if (result.rowCount === 0) {
        return {
          success: false,
          error: 'ECL configuration detail not found'
        };
      }

      console.log(`✅ [ECL-SVC-035] ECL configuration detail deleted: ID ${detailId}`);

      return {
        success: true
      };

    } catch (error) {
      console.error(`❌ [ECL-SVC-036] Error deleting ECL configuration detail:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // CLEANUP AND TESTING
  // ==========================================================================

  async close(): Promise<void> {
    await this.pool.end();
    console.log('✅ [ECL-SVC-030] EclConfigurationService connection pool closed');
  }
}

export default EclConfigurationService;