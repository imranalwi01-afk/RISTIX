// packages/backend/src/api/controllers/ifrs9-reports-ds2.controller.ts
// ============================================================================
// IFRS 9 REPORTS DS2 CONTROLLER - CENTRALIZED CONFIGURATION
// ============================================================================
// Direct connection to DS2 FRS9PRO database for IFRS 9 reporting
// Database: Multiple IFRS 9 tables (FRS9PRO) for comprehensive reporting
// Live DB: Environment-configured DS2 FRS9PRO - ACTUAL DATA, NO MOCK DATA
// ============================================================================

import { Request, Response } from 'express';
import { Pool } from 'pg';
import { appConfig } from "../../config/app.config";

// ============================================================================
// DATABASE CONNECTION - CENTRALIZED CONFIGURATION
// ============================================================================

const databaseConfig = appConfig.platformDb;
const frs9ProPool = new Pool({
  host: databaseConfig.frs9.host,
  port: databaseConfig.frs9.port,
  user: databaseConfig.frs9.user,
  password: databaseConfig.frs9.password,
  database: databaseConfig.frs9.database,
  ssl: databaseConfig.frs9.ssl,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
});

// ============================================================================
// INTERFACES - BASED ON ACTUAL DATABASE STRUCTURE
// ============================================================================

interface ReportFilter {
  prc_date: string;
  pd_config_id?: number;
  lgd_config_id?: number;
  ead_config_id?: number;
  segment_id?: number;
  pd_method?: number;
  lgd_method?: number;
  fl_flag?: boolean;
  bucket_id?: number;
  stage?: string;
}

interface LifetimePDData {
  bucket_id: number;
  fl_year?: number;
  fl_seq?: number;
  pd_rate: number;
  weighted_scalar?: number;
}

interface LifetimeLGDData {
  account_number: string;
  cif_name: string;
  first_npl_date: string;
  os_at_default: number;
  seq: number;
  pv_recovery: number;
  lgd_rate?: number;
  rec_rate?: number;
}

interface EADModelData {
  tenor: number;
  seq: number;
  paym_avg: number;
}

interface ECLResultData {
  prc_date: string;
  branch_code: string;
  segment_id: number;
  group_segment: string;
  segment: string;
  sub_segment: string;
  currency: string;
  impaired_flag: boolean;
  stage: string;
  outstanding: number;
  accrued_interest: number;
  ecl_ca_onbs_amt: number;
  ecl_ca_offbs_amt: number;
  ecl_ia_onbs_amt: number;
  ecl_overlay_amt: number;
  ecl_final_amt: number;
  ecl_coverage: number;
}

// ============================================================================
// IFRS 9 REPORTS DS2 CONTROLLER CLASS
// ============================================================================

export class Ifrs9ReportsDS2Controller {

  // ==========================================================================
  // LIFETIME PD OPERATIONS
  // ==========================================================================

  /**
   * Get Lifetime PD Yearly Marginal data with pivot structure
   */
  static async getLifetimePDYearly(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        pd_config_id = 1,
        pd_method = 1,
        scalar_id = 0,
        fl_flag = false
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      // Build the dynamic query based on the legacy SQL logic
      const query = `
        WITH pd_yearly AS (
          SELECT 
            bucket_id AS bucket_year,
            fl_year,
            CASE WHEN $4 = true THEN pd ELSE pd_non_fl END AS pd_rate
          FROM frs9_imp_ca_pd_structure 
          WHERE prc_date = $1 
            AND pd_config_id = $2 
            AND pd_method = $3
        ),
        pivot_columns AS (
          SELECT DISTINCT fl_year 
          FROM pd_yearly 
          ORDER BY fl_year
        )
        SELECT * FROM pd_yearly
        ORDER BY bucket_year;
      `;

      const result = await frs9ProPool.query(query, [
        prc_date,
        pd_config_id,
        pd_method,
        fl_flag
      ]);

      // Get pivot columns for dynamic table headers
      const columnsQuery = `
        SELECT DISTINCT fl_year 
        FROM frs9_imp_ca_pd_structure 
        WHERE prc_date = $1 AND pd_config_id = $2 AND pd_method = $3
        ORDER BY fl_year;
      `;

      const columnsResult = await frs9ProPool.query(columnsQuery, [
        prc_date,
        pd_config_id,
        pd_method
      ]);

      // Get FL Scalar data
      const scalarQuery = `
        SELECT 
          fl_year,
          CASE WHEN $4 = true THEN SUM(weighted_scalar) ELSE 1 END AS pd_scalar
        FROM frs9_imp_ca_pd_structure 
        WHERE prc_date = $1 AND pd_config_id = $2 AND pd_method = $3
        GROUP BY fl_year
        ORDER BY fl_year;
      `;

      const scalarResult = await frs9ProPool.query(scalarQuery, [
        prc_date,
        pd_config_id,
        pd_method,
        fl_flag
      ]);

      res.json({
        success: true,
        data: result.rows,
        columns: columnsResult.rows.map(row => ({ data: `year_${row.fl_year}`, title: `Year ${row.fl_year}` })),
        scalar_data: scalarResult.rows,
        message: 'Lifetime PD Yearly data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_imp_ca_pd_structure',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getLifetimePDYearly:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Lifetime PD Yearly data',
        details: (error as Error).message
      });
    }
  }

  /**
   * Get Lifetime PD Monthly Marginal data with pivot structure
   */
  static async getLifetimePDMonthly(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        pd_config_id = 1,
        pd_method = 1,
        scalar_id = 0,
        fl_flag = false
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      const query = `
        WITH pd_monthly AS (
          SELECT 
            bucket_id AS bucket_month,
            fl_seq,
            CASE WHEN $4 = true THEN pd ELSE pd_non_fl END AS pd_rate
          FROM frs9_imp_ca_pd_structure 
          WHERE prc_date = $1 
            AND pd_config_id = $2 
            AND pd_method = $3
        )
        SELECT * FROM pd_monthly
        ORDER BY bucket_month;
      `;

      const result = await frs9ProPool.query(query, [
        prc_date,
        pd_config_id,
        pd_method,
        fl_flag
      ]);

      // Get pivot columns for monthly data
      const columnsQuery = `
        SELECT DISTINCT fl_seq 
        FROM frs9_imp_ca_pd_structure 
        WHERE prc_date = $1 AND pd_config_id = $2 AND pd_method = $3
        ORDER BY fl_seq;
      `;

      const columnsResult = await frs9ProPool.query(columnsQuery, [
        prc_date,
        pd_config_id,
        pd_method
      ]);

      res.json({
        success: true,
        data: result.rows,
        columns: columnsResult.rows.map(row => ({ data: `month_${row.fl_seq}`, title: `Month ${row.fl_seq}` })),
        message: 'Lifetime PD Monthly data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_imp_ca_pd_structure',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getLifetimePDMonthly:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Lifetime PD Monthly data',
        details: (error as Error).message
      });
    }
  }

  /**
   * Get Lifetime PD Account-level details from PD structure table
   * This endpoint exposes raw rows from frs9_imp_ca_pd_structure
   * so the frontend can build a dynamic pivot table / data grid.
   */
  static async getLifetimePDAccountDetails(req: Request, res: Response) {
    try {
      const {
        prc_date,
        pd_config_id = 1,
        pd_method = 1,
        fl_flag = false,
        page,
        limit
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      // Optional simple pagination (frontend currently does client-side pagination)
      const pageNumber = page ? Number(page) : 1;
      const pageSize = limit ? Number(limit) : 1000;
      const offset = (pageNumber - 1) * pageSize;

      const query = `
        SELECT *
        FROM frs9_imp_ca_pd_structure
        WHERE prc_date = $1
          AND pd_config_id = $2
          AND pd_method = $3
        ORDER BY bucket_id, fl_year, fl_seq
        LIMIT $4 OFFSET $5;
      `;

      const result = await frs9ProPool.query(query, [
        prc_date,
        pd_config_id,
        pd_method,
        pageSize,
        offset
      ]);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM frs9_imp_ca_pd_structure
        WHERE prc_date = $1
          AND pd_config_id = $2
          AND pd_method = $3;
      `;
      const countResult = await frs9ProPool.query(countQuery, [
        prc_date,
        pd_config_id,
        pd_method
      ]);
      const total = parseInt(countResult.rows[0]?.total || '0', 10);
      const totalPages = Math.ceil(total / pageSize);

      // Get column structure from table metadata (even if data is empty)
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'frs9_imp_ca_pd_structure'
        ORDER BY ordinal_position;
      `;
      const columnsResult = await frs9ProPool.query(columnsQuery);

      // Build column metadata for frontend
      const columnMetadata = columnsResult.rows.map(col => ({
        field: col.column_name,
        headerName: col.column_name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        type: col.data_type === 'numeric' || col.data_type === 'double precision' || col.data_type === 'integer' ? 'number' : 'string',
        width: col.data_type === 'date' || col.data_type === 'timestamp without time zone' ? 120 : 150
      }));

      // Return response with column metadata even if data is empty
      res.json({
        success: true,
        data: result.rows,
        columns: columnMetadata, // ✅ Add column metadata so frontend can render grid even with empty data
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total: total,
          totalPages: totalPages
        },
        message: result.rows.length === 0 
          ? 'No Lifetime PD Data available' 
          : 'Lifetime PD account details retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_imp_ca_pd_structure',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    } catch (error) {
      console.error('Error in getLifetimePDAccountDetails:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Lifetime PD account details',
        details: (error as Error).message
      });
    }
  }

  // ==========================================================================
  // LIFETIME LGD OPERATIONS
  // ==========================================================================

  /**
   * Get Lifetime LGD data with account details and recovery information
   */
  static async getLifetimeLGD(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        lgd_config_id = 2,
        lgd_method = 1,
        model_id = 0,
        page = 1,
        limit = 20
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      // 1. Get distinct sequences for dynamic pivot columns
      const distinctSeqQuery = `
        SELECT DISTINCT c.seq 
        FROM frs9_imp_ca_lgd_data b
        INNER JOIN frs9_imp_ca_lgd_rec_d c ON b.account_id = c.account_id 
        WHERE b.prc_date <= $1 AND b.lgd_config_id = $2
        ORDER BY c.seq;
      `;
      const distinctSeqResult = await frs9ProPool.query(distinctSeqQuery, [prc_date, lgd_config_id]);
      const seqs = distinctSeqResult.rows.map(r => r.seq);
      
      // Build dynamic pivot columns using conditional aggregation (PostgreSQL equivalent of PIVOT)
      const pivotCols = seqs.map(s => `SUM(CASE WHEN c.seq = ${s} THEN c.npv_eqv_rec ELSE 0 END) AS "seq_${s}"`).join(',\n          ');
      const pivotSelectList = seqs.length > 0 ? `, ${pivotCols}` : '';

      // 2. Main LGD data query with dynamic pivot and pagination
      const offset = (Number(page) - 1) * Number(limit);
      const query = `
        SELECT 
          a.account_number AS account_id,
          a.cif_name AS customer_name,
          b.prc_date AS first_npl_date,
          b.eqv_at_default AS ead_amount,
          b.lgd AS lgd_rate,
          b.pv_recovery AS recovery_amount_pv,
          COALESCE(m.segment_name, 'Unknown') AS segment_name,
          COALESCE(m.prd_type, 'Unknown') AS product_type
          ${pivotSelectList}
        FROM frs9_account_id a
        INNER JOIN frs9_imp_ca_lgd_data b ON a.account_id = b.account_id
        INNER JOIN frs9_imp_ca_lgd_rec_d c ON b.account_id = c.account_id 
        LEFT JOIN frs9_master_account m ON a.account_number = m.account_number AND b.prc_date = m.prc_date
        WHERE b.prc_date <= $1
          AND b.lgd_config_id = $2
        GROUP BY a.account_number, a.cif_name, b.prc_date, b.eqv_at_default, b.lgd, b.pv_recovery, m.segment_name, m.prd_type
        ORDER BY a.account_number
        LIMIT $3 OFFSET $4;
      `;

      // 3. Count query for total records
      const countQuery = `
        SELECT COUNT(DISTINCT a.account_number) as total
        FROM frs9_account_id a
        INNER JOIN frs9_imp_ca_lgd_data b ON a.account_id = b.account_id
        INNER JOIN frs9_imp_ca_lgd_rec_d c ON b.account_id = c.account_id 
        WHERE b.prc_date <= $1
          AND b.lgd_config_id = $2;
      `;

      const [result, countResult] = await Promise.all([
        frs9ProPool.query(query, [prc_date, lgd_config_id, Number(limit), offset]),
        frs9ProPool.query(countQuery, [prc_date, lgd_config_id])
      ]);

      const total = countResult.rows && countResult.rows.length > 0 ? 
        parseInt(countResult.rows[0].total || 0) : 0;
      const totalPages = Math.ceil(total / Number(limit));

      // 4. Get LGD summary data (updated to match user's SQL)
      const summaryQuery = `
        SELECT 
          a.prc_date AS period,
          b.lgd_model_name AS lgd_model,
          a.eqv_os AS total_ead,
          a.npv_eqv_rec AS total_pv_recovery,
          a.rec_rate,
          a.lgd AS lgd_rate 
        FROM frs9_imp_ca_lgd_h a
        INNER JOIN frs9_imp_ca_lgd_config b ON a.lgd_config_id = b.pkid
        WHERE a.prc_date = $1 
          AND a.lgd_config_id = $2;
      `;

      const summaryResult = await frs9ProPool.query(summaryQuery, [
        prc_date,
        lgd_config_id
      ]);

      res.json({
        success: true,
        data: result.rows,
        columns: seqs.map(s => ({ data: `seq_${s}`, title: `Seq ${s}` })),
        summary: summaryResult.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total,
          totalPages: totalPages
        },
        message: 'Lifetime LGD data retrieved successfully from DS2 database with dynamic pivot',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          tables: ['frs9_account_id', 'frs9_imp_ca_lgd_data', 'frs9_imp_ca_lgd_rec_d', 'frs9_imp_ca_lgd_h', 'frs9_imp_ca_lgd_config'],
          ssl: databaseConfig.frs9.ssl
        }
      });

    } catch (error) {
      console.error('Error in getLifetimeLGD:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Lifetime LGD data',
        details: (error as Error).message
      });
    }
  }

  // ==========================================================================
  // EAD MODEL OPERATIONS
  // ==========================================================================

  /**
   * Get EAD Model payment average data
   */
  static async getEADModel(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        ead_config_id = 1
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      const query = `
        SELECT 
          a.tenor AS lt_month,
          a.counter AS seq,
          a.paym_avg
        FROM frs9_imp_ca_ead_paym_avg a 
        WHERE a.prc_date = $1 
          AND a.segment_id = $2
        ORDER BY a.tenor, a.counter;
      `;

      const result = await frs9ProPool.query(query, [
        prc_date,
        ead_config_id
      ]);

      // Get pivot columns for sequences
      const columnsQuery = `
        SELECT DISTINCT a.counter AS seq
        FROM frs9_imp_ca_ead_paym_avg a 
        WHERE a.prc_date = $1 AND a.segment_id = $2
        ORDER BY a.counter;
      `;

      const columnsResult = await frs9ProPool.query(columnsQuery, [
        prc_date,
        ead_config_id
      ]);

      res.json({
        success: true,
        data: result.rows,
        columns: columnsResult.rows.map(row => ({ data: `seq_${row.seq}`, title: `Seq ${row.seq}` })),
        message: 'EAD Model data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_imp_ca_ead_paym_avg',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getEADModel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve EAD Model data',
        details: (error as Error).message
      });
    }
  }

  // ==========================================================================
  // ECL RESULT OPERATIONS
  // ==========================================================================

  /**
   * Get ECL Result data from master account table
   */
  static async getECLResult(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        segment_id,
        segment_ids,
        stage,
        sub_segment
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      let baseQuery = `
        SELECT 
          prc_date AS period,
          branch_code,
          segment_id,
          group_segment,
          segment,
          sub_segment,
          currency,
          impaired_flag,
          impaired_status,
          bucket_id,
          sicr_flag,
          stage,
          SUM(outstanding) AS outstanding,
          SUM(accrued_interest) AS accrued_interest,
          SUM(ecl_ca_onbs_amt) AS ecl_ca_on_bs,
          SUM(ecl_ca_offbs_amt) AS ecl_ca_off_bs,
          SUM(ecl_ia_onbs_amt) AS ecl_ia,
          SUM(ecl_overlay_amt) AS ecl_overlay,
          SUM(ecl_final_amt) AS ecl_final,
          CASE 
            WHEN SUM(outstanding) = 0 THEN 0 
            ELSE SUM(ecl_final_amt) / SUM(outstanding) 
          END AS ecl_coverage,
          SUM(unwinding_ca_amt) AS unwinding_ca,
          SUM(unwinding_ia_amt) AS unwinding_ia,
          SUM(unwinding_ia_sum_amt) AS total_unwinding_ia
        FROM frs9_master_account
        WHERE prc_date = $1
      `;

      const params: any[] = [prc_date];

      // Dynamic Segment Filtering
      if (segment_ids && Array.isArray(segment_ids) && segment_ids.length > 0) {
        baseQuery += ` AND segment_id = ANY($${params.length + 1})`;
        params.push(segment_ids.map(id => Number(id)));
      } else if (segment_id) {
        baseQuery += ` AND segment_id = $${params.length + 1}`;
        params.push(Number(segment_id));
      }

      // Add optional filters
      if (stage) {
        baseQuery += ` AND stage = $${params.length + 1}`;
        params.push(stage);
      }

      if (sub_segment) {
        baseQuery += ` AND sub_segment = $${params.length + 1}`;
        params.push(sub_segment);
      }

      const finalQuery = `
        WITH summary AS (
          ${baseQuery}
          GROUP BY 
            prc_date, branch_code, segment_id, group_segment, segment, sub_segment,
            currency, impaired_flag, impaired_status, bucket_id, sicr_flag, stage
        )
        SELECT 
          ROW_NUMBER() OVER(ORDER BY branch_code, stage, bucket_id) as id,
          *
        FROM summary
        ORDER BY id;
      `;

      const result = await frs9ProPool.query(finalQuery, params);

      // Define explicit column metadata for the datagrid
      const columnMetadata = [
        { field: 'id', headerName: 'ID', type: 'number', width: 70 },
        { field: 'period', headerName: 'Period', type: 'date', width: 120 },
        { field: 'branch_code', headerName: 'Branch', type: 'string', width: 100 },
        { field: 'segment', headerName: 'Segment', type: 'string', width: 150 },
        { field: 'sub_segment', headerName: 'Sub-Segment', type: 'string', width: 150 },
        { field: 'stage', headerName: 'Stage', type: 'number', width: 80 },
        { field: 'outstanding', headerName: 'Outstanding', type: 'number', width: 180 },
        { field: 'accrued_interest', headerName: 'Accrued Interest', type: 'number', width: 150 },
        { field: 'ecl_ca_on_bs', headerName: 'ECL On-BS', type: 'number', width: 150 },
        { field: 'ecl_ca_off_bs', headerName: 'ECL Off-BS', type: 'number', width: 150 },
        { field: 'ecl_ia', headerName: 'ECL IA', type: 'number', width: 150 },
        { field: 'ecl_overlay', headerName: 'ECL Overlay', type: 'number', width: 150 },
        { field: 'ecl_final', headerName: 'ECL Final', type: 'number', width: 180 },
        { field: 'ecl_coverage', headerName: 'ECL Coverage %', type: 'number', width: 140 },
        { field: 'total_unwinding_ia', headerName: 'Unwinding IA', type: 'number', width: 140 }
      ];

      res.json({
        success: true,
        data: result.rows,
        columns: columnMetadata,
        total: result.rows.length,
        message: 'ECL Result data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_master_account',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getECLResult:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ECL Result data',
        details: (error as Error).message
      });
    }
  }

  // ==========================================================================
  // ECL MOVEMENT OPERATIONS
  // ==========================================================================

  /**
   * Get ECL Movement data using stored procedure
   */
  static async getECLMovement(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        prc_type = 'M',
        ecl_model_id = 0
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      // Call stored procedure for movement data (corrected procedure name and parameters)
      const query = `CALL sp_frs9_imp_movement_data($1, $2, $3);`;

      const result = await frs9ProPool.query(query, [
        prc_date,
        prc_type,
        ecl_model_id
      ]);

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
        message: 'ECL Movement data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_imp_movement_data',
          procedure: 'sp_frs9_imp_movement_data',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getECLMovement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ECL Movement data',
        details: (error as Error).message
      });
    }
  }

  // ==========================================================================
  // GCA MOVEMENT OPERATIONS
  // ==========================================================================

  /**
   * Get GCA Movement data from frs9_gca_movement table
   */
  static async getGCAMovement(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        segment_id,
        stage
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      // Query from dedicated GCA Movement table
      const query = `
        SELECT 
          prc_date,
          segment_id,
          stage as current_stage,
          account_number,
          opening_gca,
          closing_gca,
          new_business,
          repayments,
          write_offs,
          stage1_to_stage2,
          stage2_to_stage1,
          stage2_to_stage3,
          stage3_to_stage2
        FROM frs9_gca_movement
        WHERE prc_date = $1
      `;

      const params: any[] = [prc_date];
      let finalQuery = query;

      // Add optional filters
      if (segment_id) {
        finalQuery += ` AND segment_id = $${params.length + 1}`;
        params.push(segment_id);
      }

      if (stage) {
        finalQuery += ` AND stage = $${params.length + 1}`;
        params.push(stage);
      }

      finalQuery += ' ORDER BY account_number, stage LIMIT 1000;';

      const result = await frs9ProPool.query(finalQuery, params);

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
        message: 'GCA Movement data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_gca_movement',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getGCAMovement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve GCA Movement data',
        details: (error as Error).message
      });
    }
  }

  // ==========================================================================
  // NOMINATIVE REPORT OPERATIONS
  // ==========================================================================

  /**
   * Get Nominative Report data with detailed account information
   */
  static async getNominativeReport(req: Request, res: Response) {
    try {
      const { 
        prc_date,
        segment_id,
        stage,
        branch_code,
        page = 1,
        limit = 100
      } = req.query;

      if (!prc_date) {
        return res.status(400).json({
          success: false,
          error: 'Processing date is required'
        });
      }

      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          prc_date,
          account_number,
          facility_number,
          cif_number,
          cif_name,
          branch_code,
          prd_group,
          prd_type,
          prd_code,
          segment,
          sub_segment,
          stage,
          bucket_id,
          outstanding,
          accrued_interest,
          ecl_final_amt,
          sicr_flag,
          impaired_flag,
          dpd,
          collectability,
          internal_rating_code,
          ext_rating_code,
          currency,
          interest_rate,
          start_date,
          maturity_date
        FROM frs9_master_account
        WHERE prc_date = $1
      `;

      const params: any[] = [prc_date];

      // Add optional filters
      if (segment_id) {
        query += ` AND segment_id = $${params.length + 1}`;
        params.push(segment_id);
      }

      if (stage) {
        query += ` AND stage = $${params.length + 1}`;
        params.push(stage);
      }

      if (branch_code) {
        query += ` AND branch_code = $${params.length + 1}`;
        params.push(branch_code);
      }

      // Create count query with the same WHERE conditions
      let countQuery = `SELECT COUNT(*) as total FROM frs9_master_account WHERE prc_date = $1`;
      const countParams = [prc_date];
      
      if (segment_id) {
        countQuery += ` AND segment_id = $${countParams.length + 1}`;
        countParams.push(segment_id);
      }
      if (stage) {
        countQuery += ` AND stage = $${countParams.length + 1}`;
        countParams.push(stage);
      }
      if (branch_code) {
        countQuery += ` AND branch_code = $${countParams.length + 1}`;
        countParams.push(branch_code);
      }

      query += ` ORDER BY account_number LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);

      const [dataResult, countResult] = await Promise.all([
        frs9ProPool.query(query, params),
        frs9ProPool.query(countQuery, countParams)
      ]);

      // Check if countResult has data
      const total = countResult.rows && countResult.rows.length > 0 ? 
        parseInt(countResult.rows[0].total || 0) : 0;
      const totalPages = Math.ceil(total / Number(limit));

      res.json({
        success: true,
        data: dataResult.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages
        },
        message: 'Nominative Report data retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_master_account',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error in getNominativeReport:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Nominative Report data',
        details: (error as Error).message
      });
    }
  }
}

// ============================================================================
// EXPORT CONTROLLER
// ============================================================================

export default Ifrs9ReportsDS2Controller;