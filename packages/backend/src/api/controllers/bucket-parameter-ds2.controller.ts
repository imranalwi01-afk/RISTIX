// packages/backend/src/api/controllers/bucket-parameter-ds2.controller.ts
// ============================================================================
// BUCKET PARAMETER DS2 CONTROLLER - CENTRALIZED CONFIGURATION
// ============================================================================
// Direct connection to DS2 FRS9PRO database for bucket parameter management
// Database: frs9_param_bucketh (Headers) + frs9_param_bucketd (Details)
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

interface BucketHeader {
  pkid: number;
  bucket_group: string;
  bucket_desc: string;
  basis: string;
  bucket_default: number;
  closed_flag: boolean;
  wo_flag: boolean;
  createdby?: string;
  createddate?: string;
  createdhost?: string;
  updatedby?: string;
  updateddate?: string;
  updatedhost?: string;
  details_count?: number;
}

interface BucketDetail {
  pkid: number;
  pkid_header: number;
  bucket_id: number;
  bucket_name: string;
  range_start: number;
  range_end: number | null;
  createdby?: string;
  createddate?: string;
  createdhost?: string;
  updatedby?: string;
  updateddate?: string;
  updatedhost?: string;
}

// ============================================================================
// BUCKET PARAMETER DS2 CONTROLLER CLASS
// ============================================================================

export class BucketParameterDS2Controller {
  
  // ==========================================================================
  // HEADER OPERATIONS (frs9_param_bucketh)
  // ==========================================================================

  /**
   * Get all bucket parameter headers with pagination and search
   */
  static async getBucketHeaders(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        basis = '',
        active_only = false 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Base query with detail counts
      let countQuery = `
        SELECT COUNT(*) as total
        FROM frs9_param_bucketh h
        WHERE 1=1
      `;
      
      let dataQuery = `
        SELECT 
          h.*,
          COUNT(d.pkid) as details_count
        FROM frs9_param_bucketh h
        LEFT JOIN frs9_param_bucketd d ON h.pkid = d.pkid_header
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Add search filter
      if (search) {
        const searchCondition = ` AND (h.bucket_group ILIKE $${paramIndex} OR h.bucket_desc ILIKE $${paramIndex})`;
        countQuery += searchCondition;
        dataQuery += searchCondition;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Add basis filter
      if (basis) {
        const basisCondition = ` AND h.basis = $${paramIndex}`;
        countQuery += basisCondition;
        dataQuery += basisCondition;
        queryParams.push(basis);
        paramIndex++;
      }

      // Complete data query
      dataQuery += `
        GROUP BY h.pkid, h.bucket_group, h.bucket_desc, h.basis, h.bucket_default, 
                 h.closed_flag, h.wo_flag, h.createdby, h.createddate, h.createdhost,
                 h.updatedby, h.updateddate, h.updatedhost
        ORDER BY h.bucket_group ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const limitParams = [...queryParams, Number(limit), offset];

      // Execute queries
      const [countResult, dataResult] = await Promise.all([
        frs9ProPool.query(countQuery, queryParams),
        frs9ProPool.query(dataQuery, limitParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
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
        message: 'Bucket parameter headers retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_bucketh',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    } catch (error) {
      console.error('Error in getBucketHeaders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bucket parameter headers',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get single bucket parameter header with details
   */
  static async getBucketHeader(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter header ID'
        });
      }

      // Get header with details
      const headerQuery = `
        SELECT 
          h.*,
          COUNT(d.pkid) as details_count
        FROM frs9_param_bucketh h
        LEFT JOIN frs9_param_bucketd d ON h.pkid = d.pkid_header
        WHERE h.pkid = $1
        GROUP BY h.pkid, h.bucket_group, h.bucket_desc, h.basis, h.bucket_default,
                 h.closed_flag, h.wo_flag, h.createdby, h.createddate, h.createdhost,
                 h.updatedby, h.updateddate, h.updatedhost
      `;

      const detailsQuery = `
        SELECT *
        FROM frs9_param_bucketd
        WHERE pkid_header = $1
        ORDER BY bucket_id ASC
      `;

      const [headerResult, detailsResult] = await Promise.all([
        frs9ProPool.query(headerQuery, [Number(id)]),
        frs9ProPool.query(detailsQuery, [Number(id)])
      ]);

      if (headerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter header not found'
        });
      }

      const header = headerResult.rows[0];
      const details = detailsResult.rows;

      res.json({
        success: true,
        data: {
          ...header,
          details
        },
        message: 'Bucket parameter header retrieved successfully from DS2 database'
      });
    } catch (error) {
      console.error('Error in getBucketHeader:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bucket parameter header',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get bucket parameter details for a specific header
   */
  static async getBucketDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket parameter header ID'
        });
      }

      const query = `
        SELECT *
        FROM frs9_param_bucketd
        WHERE pkid_header = $1
        ORDER BY bucket_id ASC, range_start ASC
      `;

      const result = await frs9ProPool.query(query, [Number(id)]);

      res.json({
        success: true,
        data: result.rows,
        message: 'Bucket parameter details retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_bucketd',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    } catch (error) {
      console.error('Error in getBucketDetails:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bucket parameter details',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Create new bucket parameter header
   */
  static async createBucketHeader(req: Request, res: Response) {
    const client = await frs9ProPool.connect();
    
    try {
      await client.query('BEGIN');
      
      const {
        bucket_group,
        bucket_desc,
        basis,
        bucket_default,
        closed_flag = false,
        wo_flag = false
      } = req.body;

      // Validate required fields
      if (!bucket_group || !bucket_desc || !basis) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: bucket_group, bucket_desc, basis'
        });
      }

      // Check if bucket_group already exists
      const existingQuery = `
        SELECT pkid FROM frs9_param_bucketh 
        WHERE bucket_group = $1
      `;
      const existingResult = await client.query(existingQuery, [bucket_group]);
      
      if (existingResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Bucket group already exists',
          code: 'DUPLICATE_BUCKET_GROUP'
        });
      }

      // Insert header
      const insertQuery = `
        INSERT INTO frs9_param_bucketh (
          bucket_group, bucket_desc, basis, bucket_default, 
          closed_flag, wo_flag, createdby, createddate, createdhost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING *
      `;

      const values = [
        bucket_group,
        bucket_desc,
        basis,
        bucket_default || 1,
        closed_flag,
        wo_flag,
        req.user?.email || 'system',
        req.ip || 'localhost'
      ];

      const result = await client.query(insertQuery, values);
      
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Bucket parameter header created successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createBucketHeader:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create bucket parameter header',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      client.release();
    }
  }

  /**
   * Create new bucket parameter detail
   */
  static async createBucketDetail(req: Request, res: Response) {
    const client = await frs9ProPool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { id } = req.params; // header ID
      const {
        bucket_id,
        bucket_name,
        range_start,
        range_end
      } = req.body;

      // Validate required fields
      if (!bucket_id || !bucket_name || range_start === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: bucket_id, bucket_name, range_start'
        });
      }

      // Verify header exists
      const headerQuery = `
        SELECT pkid FROM frs9_param_bucketh WHERE pkid = $1
      `;
      const headerResult = await client.query(headerQuery, [Number(id)]);
      
      if (headerResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Bucket parameter header not found'
        });
      }

      // Check if bucket_id already exists for this header
      const existingQuery = `
        SELECT pkid FROM frs9_param_bucketd 
        WHERE pkid_header = $1 AND bucket_id = $2
      `;
      const existingResult = await client.query(existingQuery, [Number(id), bucket_id]);
      
      if (existingResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Bucket ID already exists for this header',
          code: 'DUPLICATE_BUCKET_ID'
        });
      }

      // Insert detail
      const insertQuery = `
        INSERT INTO frs9_param_bucketd (
          pkid_header, bucket_id, bucket_name, range_start, range_end,
          createdby, createddate, createdhost
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
        RETURNING *
      `;

      const values = [
        Number(id),
        bucket_id,
        bucket_name,
        range_start,
        range_end || null,
        req.user?.email || 'system',
        req.ip || 'localhost'
      ];

      const result = await client.query(insertQuery, values);
      
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Bucket parameter detail created successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createBucketDetail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create bucket parameter detail',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Get basis options for dropdown (B0017 from Business Parameters)
   */
  static async getBasisOptions(req: Request, res: Response) {
    try {
      // B0017 - BASIS options from business parameters
      const query = `
        SELECT param_seq, value1, value2, value3, paramdesc
        FROM frs9_param_commond 
        WHERE param_code = 'B0017'
        ORDER BY param_seq ASC
      `;

      const result = await frs9ProPool.query(query);

      res.json({
        success: true,
        data: result.rows,
        message: 'Basis options retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          table: 'frs9_param_commond',
          param_code: 'B0017',
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    } catch (error) {
      console.error('Error in getBasisOptions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve basis options',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get bucket parameter statistics
   */
  static async getBucketStats(req: Request, res: Response) {
    try {
      const query = `
        SELECT 
          h.basis,
          COUNT(h.pkid) as header_count,
          COUNT(d.pkid) as detail_count,
          AVG(sub.bucket_count) as avg_buckets_per_header
        FROM frs9_param_bucketh h
        LEFT JOIN frs9_param_bucketd d ON h.pkid = d.pkid_header
        LEFT JOIN (
          SELECT pkid_header, COUNT(*) as bucket_count
          FROM frs9_param_bucketd
          GROUP BY pkid_header
        ) sub ON h.pkid = sub.pkid_header
        GROUP BY h.basis
        ORDER BY h.basis
      `;

      const result = await frs9ProPool.query(query);

      res.json({
        success: true,
        data: result.rows,
        message: 'Bucket parameter statistics retrieved successfully',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    } catch (error) {
      console.error('Error in getBucketStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bucket parameter statistics',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

// ============================================================================
// INDIVIDUAL FUNCTION EXPORTS FOR ROUTE CONFIGURATION
// ============================================================================

export const getBucketHeaders = BucketParameterDS2Controller.getBucketHeaders;
export const getBucketHeader = BucketParameterDS2Controller.getBucketHeader;
export const getBucketDetails = BucketParameterDS2Controller.getBucketDetails;
export const createBucketHeader = BucketParameterDS2Controller.createBucketHeader;
export const createBucketDetail = BucketParameterDS2Controller.createBucketDetail;
export const getBasisOptions = BucketParameterDS2Controller.getBasisOptions;
export const getBucketStats = BucketParameterDS2Controller.getBucketStats;

// ============================================================================
// EXPORT CONTROLLER
// ============================================================================

export default BucketParameterDS2Controller;