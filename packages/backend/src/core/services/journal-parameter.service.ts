// packages/backend/src/core/services/journal-parameter.service.ts
// ============================================================================
// 🗄️ JOURNAL PARAMETER SERVICE: Business logic for frs9_param_journal
// ============================================================================
// ✅ PATTERN: Service layer for business logic and database operations
// ✅ DATABASE: DS2PG FRS9PRO.frs9_param_journal (192.168.0.106:5433)
// ✅ VALIDATION: Input validation and business rules
// ✅ AUDIT: Complete audit trail for all operations
// ============================================================================

import { Pool } from 'pg';
import { backendEnvironmentLoader } from '../../config/environment-loader-backend';

export interface JournalParameterData {
  pkid?: number;
  gl_group?: string;
  currency?: string;
  gl_type?: string;
  gl_code: string;
  gl_number?: string;
  dbcr?: string;
  gl_desc: string;
  active_flag?: boolean;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

export interface JournalParameterQuery {
  page: number;
  limit: number;
  search?: string;
  gl_group?: string;
  gl_type?: string;
  currency?: string;
  active_only?: boolean;
}

export class JournalParameterService {
  private frs9Pool: Pool;

  constructor() {
    // ✅ FIXED: Use centralized configuration instead of undefined databaseConfig
    const envConfig = backendEnvironmentLoader.getConfiguration();
    const frs9Config = envConfig.database.frs9;

    this.frs9Pool = new Pool({
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
      min: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });

    console.log(`✅ [JOUR-001] Journal Parameter Service initialized with FRS9 database: ${frs9Config.host}:${frs9Config.port}/${frs9Config.database}`);
  }

  // ============================================================================
  // GET JOURNAL PARAMETERS WITH FILTERING AND PAGINATION
  // ============================================================================
  async getJournalParameters(query: JournalParameterQuery): Promise<{
    data: JournalParameterData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      console.log('🔍 [JOUR-003] JournalParameterService: Getting journal parameters', query);

      // Build WHERE conditions
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Search filter
      if (query.search) {
        whereConditions.push(`(
          gl_code ILIKE $${paramIndex} OR 
          gl_desc ILIKE $${paramIndex} OR 
          gl_number ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${query.search}%`);
        paramIndex++;
      }

      // Specific filters
      if (query.gl_group) {
        whereConditions.push(`gl_group = $${paramIndex}`);
        queryParams.push(query.gl_group);
        paramIndex++;
      }

      if (query.gl_type) {
        whereConditions.push(`gl_type = $${paramIndex}`);
        queryParams.push(query.gl_type);
        paramIndex++;
      }

      if (query.currency) {
        whereConditions.push(`currency = $${paramIndex}`);
        queryParams.push(query.currency);
        paramIndex++;
      }

      if (query.active_only) {
        whereConditions.push(`active_flag = $${paramIndex}`);
        queryParams.push(true);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM frs9_param_journal 
        ${whereClause}
      `;

      const countResult = await this.frs9Pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const offset = (query.page - 1) * query.limit;
      const dataQuery = `
        SELECT 
          pkid, gl_group, currency, gl_type, gl_code, 
          gl_number, dbcr, gl_desc, active_flag,
          createdby, createddate, createdhost,
          updatedby, updateddate, updatedhost
        FROM frs9_param_journal 
        ${whereClause}
        ORDER BY gl_code ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(query.limit, offset);
      const dataResult = await this.frs9Pool.query(dataQuery, queryParams);

      console.log(`✅ [JOUR-003] Found ${total} journal parameters (page ${query.page})`);

      return {
        data: dataResult.rows,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      };

    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get journal parameters:', error);
      throw new Error(`Failed to fetch journal parameters: ${error.message}`);
    }
  }

  // ============================================================================
  // GET SINGLE JOURNAL PARAMETER BY GL CODE
  // ============================================================================
  async getJournalParameterByGLCode(gl_code: string): Promise<JournalParameterData | null> {
    try {
      console.log(`🔍 [JOUR-003] Getting journal parameter: ${gl_code}`);

      const query = `
        SELECT 
          pkid, gl_group, currency, gl_type, gl_code, 
          gl_number, dbcr, gl_desc, active_flag,
          createdby, createddate, createdhost,
          updatedby, updateddate, updatedhost
        FROM frs9_param_journal 
        WHERE gl_code = $1
      `;

      const result = await this.frs9Pool.query(query, [gl_code]);

      if (result.rows.length === 0) {
        console.log(`⚠️ [JOUR-003] Journal parameter not found: ${gl_code}`);
        return null;
      }

      console.log(`✅ [JOUR-003] Found journal parameter: ${gl_code}`);
      return result.rows[0];

    } catch (error: any) {
      console.error(`❌ [JOUR-003] Failed to get journal parameter ${gl_code}:`, error);
      throw new Error(`Failed to fetch journal parameter: ${error.message}`);
    }
  }

  // ============================================================================
  // CREATE NEW JOURNAL PARAMETER
  // ============================================================================
  async createJournalParameter(data: Omit<JournalParameterData, 'pkid'>): Promise<JournalParameterData> {
    try {
      console.log('➕ [JOUR-003] Creating journal parameter:', data.gl_code);

      // Check if GL code already exists
      const existing = await this.getJournalParameterByGLCode(data.gl_code);
      if (existing) {
        throw new Error(`Journal parameter with GL code '${data.gl_code}' already exists`);
      }

      const query = `
        INSERT INTO frs9_param_journal (
          gl_group, currency, gl_type, gl_code, gl_number, 
          dbcr, gl_desc, active_flag,
          createdby, createddate, createdhost
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING 
          pkid, gl_group, currency, gl_type, gl_code, 
          gl_number, dbcr, gl_desc, active_flag,
          createdby, createddate, createdhost,
          updatedby, updateddate, updatedhost
      `;

      const values = [
        data.gl_group || null,
        data.currency || null,
        data.gl_type || null,
        data.gl_code,
        data.gl_number || null,
        data.dbcr || null,
        data.gl_desc,
        data.active_flag !== undefined ? data.active_flag : true,
        data.createdby,
        data.createddate,
        data.createdhost
      ];

      const result = await this.frs9Pool.query(query, values);
      const created = result.rows[0];

      console.log(`✅ [JOUR-003] Created journal parameter: ${created.gl_code} (ID: ${created.pkid})`);
      return created;

    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to create journal parameter:', error);
      throw new Error(`Failed to create journal parameter: ${error.message}`);
    }
  }

  // ============================================================================
  // UPDATE JOURNAL PARAMETER
  // ============================================================================
  async updateJournalParameter(
    gl_code: string, 
    data: Partial<Omit<JournalParameterData, 'pkid' | 'gl_code' | 'createdby' | 'createddate' | 'createdhost'>>
  ): Promise<JournalParameterData | null> {
    try {
      console.log(`✏️ [JOUR-003] Updating journal parameter: ${gl_code}`);

      // Check if journal exists
      const existing = await this.getJournalParameterByGLCode(gl_code);
      if (!existing) {
        throw new Error(`Journal parameter with GL code '${gl_code}' not found`);
      }

      // Build UPDATE query dynamically
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.gl_group !== undefined) {
        updateFields.push(`gl_group = $${paramIndex}`);
        values.push(data.gl_group);
        paramIndex++;
      }

      if (data.currency !== undefined) {
        updateFields.push(`currency = $${paramIndex}`);
        values.push(data.currency);
        paramIndex++;
      }

      if (data.gl_type !== undefined) {
        updateFields.push(`gl_type = $${paramIndex}`);
        values.push(data.gl_type);
        paramIndex++;
      }

      if (data.gl_number !== undefined) {
        updateFields.push(`gl_number = $${paramIndex}`);
        values.push(data.gl_number);
        paramIndex++;
      }

      if (data.dbcr !== undefined) {
        updateFields.push(`dbcr = $${paramIndex}`);
        values.push(data.dbcr);
        paramIndex++;
      }

      if (data.gl_desc !== undefined) {
        updateFields.push(`gl_desc = $${paramIndex}`);
        values.push(data.gl_desc);
        paramIndex++;
      }

      if (data.active_flag !== undefined) {
        updateFields.push(`active_flag = $${paramIndex}`);
        values.push(data.active_flag);
        paramIndex++;
      }

      if (data.updatedby !== undefined) {
        updateFields.push(`updatedby = $${paramIndex}`);
        values.push(data.updatedby);
        paramIndex++;
      }

      if (data.updateddate !== undefined) {
        updateFields.push(`updateddate = $${paramIndex}`);
        values.push(data.updateddate);
        paramIndex++;
      }

      if (data.updatedhost !== undefined) {
        updateFields.push(`updatedhost = $${paramIndex}`);
        values.push(data.updatedhost);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        console.log(`⚠️ [JOUR-003] No fields to update for: ${gl_code}`);
        return existing;
      }

      values.push(gl_code); // WHERE parameter

      const query = `
        UPDATE frs9_param_journal 
        SET ${updateFields.join(', ')}
        WHERE gl_code = $${paramIndex}
        RETURNING 
          pkid, gl_group, currency, gl_type, gl_code, 
          gl_number, dbcr, gl_desc, active_flag,
          createdby, createddate, createdhost,
          updatedby, updateddate, updatedhost
      `;

      const result = await this.frs9Pool.query(query, values);
      const updated = result.rows[0];

      console.log(`✅ [JOUR-003] Updated journal parameter: ${gl_code}`);
      return updated;

    } catch (error: any) {
      console.error(`❌ [JOUR-003] Failed to update journal parameter ${gl_code}:`, error);
      throw new Error(`Failed to update journal parameter: ${error.message}`);
    }
  }

  // ============================================================================
  // DELETE JOURNAL PARAMETER
  // ============================================================================
  async deleteJournalParameter(gl_code: string): Promise<boolean> {
    try {
      console.log(`🗑️ [JOUR-003] Deleting journal parameter: ${gl_code}`);

      // Check if journal exists
      const existing = await this.getJournalParameterByGLCode(gl_code);
      if (!existing) {
        throw new Error(`Journal parameter with GL code '${gl_code}' not found`);
      }

      const query = `DELETE FROM frs9_param_journal WHERE gl_code = $1`;
      const result = await this.frs9Pool.query(query, [gl_code]);

      const deleted = result.rowCount > 0;
      if (deleted) {
        console.log(`✅ [JOUR-003] Deleted journal parameter: ${gl_code}`);
      } else {
        console.log(`⚠️ [JOUR-003] Journal parameter not deleted: ${gl_code}`);
      }

      return deleted;

    } catch (error: any) {
      console.error(`❌ [JOUR-003] Failed to delete journal parameter ${gl_code}:`, error);
      throw new Error(`Failed to delete journal parameter: ${error.message}`);
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  async healthCheck(): Promise<{
    connection: string;
    status: string;
    service: string;
    database: any;
    statistics: any;
    timestamp: string;
  }> {
    try {
      console.log('🏥 [JOUR-003] Journal parameter service health check');

      // Test database connectivity
      const testQuery = 'SELECT COUNT(*) as total FROM frs9_param_journal';
      const result = await this.frs9Pool.query(testQuery);
      const totalJournals = parseInt(result.rows[0].total);

      const activeQuery = 'SELECT COUNT(*) as active FROM frs9_param_journal WHERE active_flag = true';
      const activeResult = await this.frs9Pool.query(activeQuery);
      const activeJournals = parseInt(activeResult.rows[0].active);

      console.log(`✅ [JOUR-003] Health check passed - ${totalJournals} journal parameters available`);

      return {
        connection: 'healthy',
        status: 'operational',
        service: 'Journal Parameter Service',
        database: {
          host: `${frs9Config.host}:${frs9Config.port}`,
          database: frs9Config.database,
          table: 'frs9_param_journal'
        },
        statistics: {
          total_journals: totalJournals,
          active_journals: activeJournals,
          inactive_journals: totalJournals - activeJournals
        },
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('❌ [JOUR-003] Health check failed:', error);
      
      return {
        connection: 'unhealthy',
        status: 'error',
        service: 'Journal Parameter Service',
        database: {
          host: `${frs9Config.host}:${frs9Config.port}`,
          database: frs9Config.database,
          table: 'frs9_param_journal',
          error: error.message
        },
        statistics: {
          total_journals: 0,
          active_journals: 0,
          inactive_journals: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // BUSINESS SETTINGS METHODS FOR JOURNAL PARAMETER DROPDOWNS
  // ============================================================================

  // Get Currency options from B0001
  async getCurrencyOptions(): Promise<Array<{id: string, name: string}>> {
    try {
      console.log('🔍 [JOUR-003] Getting currency options from B0001');
      
      const query = `
        SELECT param_seq, value1, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code = 'B0001' 
        ORDER BY param_seq
      `;
      
      const result = await this.frs9Pool.query(query);
      
      const options = result.rows.map((row: any) => ({
        id: row.value1,
        name: row.paramdesc
      }));
      
      console.log(`✅ [JOUR-003] Found ${options.length} currency options`);
      return options;
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get currency options:', error);
      throw new Error(`Failed to fetch currency options: ${error.message}`);
    }
  }

  // Get Journal Type options from B0005
  async getJournalTypeOptions(): Promise<Array<{id: string, name: string}>> {
    try {
      console.log('🔍 [JOUR-003] Getting journal type options from B0005');
      
      const query = `
        SELECT param_seq, value1, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code = 'B0005' 
        ORDER BY param_seq
      `;
      
      const result = await this.frs9Pool.query(query);
      
      const options = result.rows.map((row: any) => ({
        id: row.value1,
        name: row.paramdesc
      }));
      
      console.log(`✅ [JOUR-003] Found ${options.length} journal type options`);
      return options;
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get journal type options:', error);
      throw new Error(`Failed to fetch journal type options: ${error.message}`);
    }
  }

  // Get Journal Code options from B0006
  async getJournalCodeOptions(): Promise<Array<{id: string, name: string}>> {
    try {
      console.log('🔍 [JOUR-003] Getting journal code options from B0006');
      
      const query = `
        SELECT param_seq, value1, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code = 'B0006' 
        ORDER BY param_seq
      `;
      
      const result = await this.frs9Pool.query(query);
      
      const options = result.rows.map((row: any) => ({
        id: row.value1,
        name: row.paramdesc
      }));
      
      console.log(`✅ [JOUR-003] Found ${options.length} journal code options`);
      return options;
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get journal code options:', error);
      throw new Error(`Failed to fetch journal code options: ${error.message}`);
    }
  }

  // Get DB/CR options from B0007
  async getDbCrOptions(): Promise<Array<{id: string, name: string}>> {
    try {
      console.log('🔍 [JOUR-003] Getting DB/CR options from B0007');
      
      const query = `
        SELECT param_seq, value1, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code = 'B0007' 
        ORDER BY param_seq
      `;
      
      const result = await this.frs9Pool.query(query);
      
      const options = result.rows.map((row: any) => ({
        id: row.value1,
        name: row.paramdesc
      }));
      
      console.log(`✅ [JOUR-003] Found ${options.length} DB/CR options`);
      return options;
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get DB/CR options:', error);
      throw new Error(`Failed to fetch DB/CR options: ${error.message}`);
    }
  }

  // Get GL Group options from rule based setting rule type = 'GL'
  async getGLGroupOptions(): Promise<Array<{id: string, name: string}>> {
    try {
      console.log('🔍 [JOUR-003] Getting GL Group options from rule based setting');
      
      // First try to get from rule based setting table
      // If table doesn't exist or no data, provide common GL groups as fallback
      const query = `
        SELECT DISTINCT value1, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code LIKE 'GL%' 
        OR paramdesc ILIKE '%asset%' 
        OR paramdesc ILIKE '%liabilit%'
        OR paramdesc ILIKE '%equity%'
        OR paramdesc ILIKE '%revenue%'
        OR paramdesc ILIKE '%expense%'
        ORDER BY value1
      `;
      
      const result = await this.frs9Pool.query(query);
      
      let options: Array<{id: string, name: string}> = [];
      
      if (result.rows.length > 0) {
        options = result.rows.map((row: any) => ({
          id: row.value1,
          name: row.paramdesc
        }));
      } else {
        // Fallback to standard GL groups if no data found
        options = [
          { id: 'ASSETS', name: 'Assets' },
          { id: 'LIABILITIES', name: 'Liabilities' },
          { id: 'EQUITY', name: 'Equity' },
          { id: 'REVENUE', name: 'Revenue' },
          { id: 'EXPENSES', name: 'Expenses' }
        ];
      }
      
      console.log(`✅ [JOUR-003] Found ${options.length} GL group options`);
      return options;
      
    } catch (error: any) {
      console.error('❌ [JOUR-003] Failed to get GL group options:', error);
      
      // Return standard fallback on error
      return [
        { id: 'ASSETS', name: 'Assets' },
        { id: 'LIABILITIES', name: 'Liabilities' },
        { id: 'EQUITY', name: 'Equity' },
        { id: 'REVENUE', name: 'Revenue' },
        { id: 'EXPENSES', name: 'Expenses' }
      ];
    }
  }
}

// Export service instance
export const journalParameterService = new JournalParameterService();