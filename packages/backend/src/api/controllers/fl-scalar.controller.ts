// packages/backend/src/api/controllers/fl-scalar.controller.ts
// ============================================================================
// FL SCALAR CONTROLLER - IFRS9 FORWARD LOOKING SCALAR MANAGEMENT
// ============================================================================
// Purpose: FL Scalar management for PD model adjustments
// Database: Environment-configured DS2 FRS9PRO - REAL DATABASE ONLY!
// Tables: frs9_imp_ca_fl_scalarh (header), frs9_imp_ca_fl_scalard (detail)
// ============================================================================
// CRITICAL: NO MOCK DATA, NO FALLBACK DATA, NO ASSUMPTIONS!
// ONLY REAL DATA FROM LIVE DATABASE!
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { appConfig } from "../../config/app.config";

// ============================================================================
// DATABASE CONNECTION - CENTRALIZED CONFIGURATION (REAL DATABASE)
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
// VALIDATION SCHEMAS
// ============================================================================

const FLScalarHeaderSchema = z.object({
  scalar_name: z.string().min(1, 'Scalar name is required'),
  active_flag: z.boolean().default(true)
});

const FLScalarDetailSchema = z.object({
  period: z.number().int().min(1, 'Period must be at least 1'),
  weighted_scalar: z.number().min(0, 'Weighted scalar must be non-negative')
});

const CreateFLScalarSchema = z.object({
  scalar_name: z.string().min(1, 'Scalar name is required'),
  active_flag: z.boolean().default(true),
  details: z.array(FLScalarDetailSchema).min(1, 'At least one period is required')
});

const UpdateFLScalarSchema = z.object({
  scalar_name: z.string().min(1, 'Scalar name is required').optional(),
  active_flag: z.boolean().optional(),
  details: z.array(FLScalarDetailSchema).optional()
});

// ============================================================================
// FL SCALAR CONTROLLER CLASS
// ============================================================================

class FLScalarController {
  
  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================
  async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const startTime = Date.now();
      const result = await frs9ProPool.query(`
        SELECT 
          COUNT(*) as total_scalars,
          SUM(CASE WHEN active_flag = true THEN 1 ELSE 0 END) as active_scalars,
          NOW() as server_time
        FROM frs9_imp_ca_fl_scalarh
      `);
      
      const detailsResult = await frs9ProPool.query(`
        SELECT COUNT(*) as total_details
        FROM frs9_imp_ca_fl_scalard
      `);
      
      res.json({
        success: true,
        message: 'FL Scalar service is healthy - DS2 connection working',
        data: {
          connection: 'healthy',
          database: databaseConfig.frs9.database,
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          server_time: result.rows[0].server_time,
          total_scalars: result.rows[0].total_scalars,
          active_scalars: result.rows[0].active_scalars,
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development',
          total_details: detailsResult.rows[0].total_details,
          response_time_ms: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ FL Scalar health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'FL Scalar service health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================================================
  // GET ALL FL SCALARS WITH DETAILS
  // ==========================================================================
  async getFLScalars(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🎯 Fetching FL Scalars from DS2 FRS9PRO database');
      
      // Get all headers
      const headerQuery = `
        SELECT 
          pkid,
          scalar_name,
          active_flag,
          createdby AS created_by,
          createddate AS created_date,
          createdhost AS created_host,
          updatedby AS updated_by,
          updateddate AS updated_date,
          updatedhost AS updated_host
        FROM frs9_imp_ca_fl_scalarh
        ORDER BY pkid
      `;
      
      const headersResult = await frs9ProPool.query(headerQuery);
      console.log(`✅ Found ${headersResult.rows.length} FL Scalars in database`);
      
      // Get all details grouped by scalar_id
      const detailsQuery = `
        SELECT 
          pkid,
          scalar_id,
          period,
          weighted_scalar,
          createdby AS created_by,
          createddate AS created_date,
          createdhost AS created_host,
          updatedby AS updated_by,
          updateddate AS updated_date,
          updatedhost AS updated_host
        FROM frs9_imp_ca_fl_scalard
        ORDER BY scalar_id, period
      `;
      
      const detailsResult = await frs9ProPool.query(detailsQuery);
      console.log(`✅ Found ${detailsResult.rows.length} FL Scalar details in database`);
      
      // Map details to headers
      const scalarsWithDetails = headersResult.rows.map(header => {
        const details = detailsResult.rows.filter(d => d.scalar_id === header.pkid);
        return {
          ...header,
          details
        };
      });
      
      res.json({
        success: true,
        data: scalarsWithDetails,
        total: scalarsWithDetails.length,
        message: 'FL Scalars retrieved successfully from DS2 database',
        database_info: {
          host: `${databaseConfig.frs9.host}:${databaseConfig.frs9.port}`,
          database: databaseConfig.frs9.database,
          tables: ['frs9_imp_ca_fl_scalarh', 'frs9_imp_ca_fl_scalard'],
          ssl: databaseConfig.frs9.ssl,
          environment: databaseConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    } catch (error) {
      console.error('❌ Error fetching FL Scalars:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FL Scalars',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================================================
  // GET SINGLE FL SCALAR BY ID
  // ==========================================================================
  async getFLScalarById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log(`📄 Fetching FL Scalar ${id} from DS2 database`);
      
      // Get header
      const headerQuery = `
        SELECT 
          pkid,
          scalar_name,
          active_flag,
          createdby AS created_by,
          createddate AS created_date,
          createdhost AS created_host,
          updatedby AS updated_by,
          updateddate AS updated_date,
          updatedhost AS updated_host
        FROM frs9_imp_ca_fl_scalarh
        WHERE pkid = $1
      `;
      
      const headerResult = await frs9ProPool.query(headerQuery, [id]);
      
      if (headerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'FL Scalar not found'
        });
      }
      
      // Get details
      const detailsQuery = `
        SELECT 
          pkid,
          scalar_id,
          period,
          weighted_scalar,
          createdby AS created_by,
          createddate AS created_date,
          createdhost AS created_host,
          updatedby AS updated_by,
          updateddate AS updated_date,
          updatedhost AS updated_host
        FROM frs9_imp_ca_fl_scalard
        WHERE scalar_id = $1
        ORDER BY period
      `;
      
      const detailsResult = await frs9ProPool.query(detailsQuery, [id]);
      
      const scalar = {
        ...headerResult.rows[0],
        details: detailsResult.rows
      };
      
      res.json({
        success: true,
        data: scalar,
        message: 'FL Scalar retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error fetching FL Scalar by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FL Scalar',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================================================
  // CREATE FL SCALAR
  // ==========================================================================
  async createFLScalar(req: Request, res: Response, next: NextFunction) {
    const client = await frs9ProPool.connect();
    
    try {
      // Validate request body
      const validatedData = CreateFLScalarSchema.parse(req.body);
      const { scalar_name, active_flag, details } = validatedData;
      
      console.log('➕ Creating FL Scalar in DS2 database');
      
      // Get user info from request (from auth middleware)
      const user = (req as any).user;
      const createdBy = user?.email || 'system';
      const createdHost = req.ip || 'unknown';
      
      await client.query('BEGIN');
      
      // Insert header
      const headerQuery = `
        INSERT INTO frs9_imp_ca_fl_scalarh (
          scalar_name,
          active_flag,
          createdby,
          createddate,
          createdhost
        ) VALUES ($1, $2, $3, NOW(), $4)
        RETURNING pkid, scalar_name, active_flag, 
                  createdby AS created_by, 
                  createddate AS created_date, 
                  createdhost AS created_host
      `;
      
      const headerResult = await client.query(headerQuery, [
        scalar_name,
        active_flag,
        createdBy,
        createdHost
      ]);
      
      const scalarId = headerResult.rows[0].pkid;
      
      // Insert details
      const insertedDetails = [];
      for (const detail of details) {
        const detailQuery = `
          INSERT INTO frs9_imp_ca_fl_scalard (
            scalar_id,
            period,
            weighted_scalar,
            createdby,
            createddate,
            createdhost
          ) VALUES ($1, $2, $3, $4, NOW(), $5)
          RETURNING pkid, scalar_id, period, weighted_scalar,
                    createdby AS created_by,
                    createddate AS created_date,
                    createdhost AS created_host
        `;
        
        const detailResult = await client.query(detailQuery, [
          scalarId,
          detail.period,
          detail.weighted_scalar,
          createdBy,
          createdHost
        ]);
        
        insertedDetails.push(detailResult.rows[0]);
      }
      
      await client.query('COMMIT');
      
      const result = {
        ...headerResult.rows[0],
        details: insertedDetails
      };
      
      console.log('✅ FL Scalar created successfully');
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'FL Scalar created successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating FL Scalar:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create FL Scalar',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // UPDATE FL SCALAR
  // ==========================================================================
  async updateFLScalar(req: Request, res: Response, next: NextFunction) {
    const client = await frs9ProPool.connect();
    
    try {
      const { id } = req.params;
      const validatedData = UpdateFLScalarSchema.parse(req.body);
      
      console.log(`✏️ Updating FL Scalar ${id} in DS2 database`);
      
      // Get user info
      const user = (req as any).user;
      const updatedBy = user?.email || 'system';
      const updatedHost = req.ip || 'unknown';
      
      await client.query('BEGIN');
      
      // Update header if needed
      if (validatedData.scalar_name !== undefined || validatedData.active_flag !== undefined) {
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        if (validatedData.scalar_name !== undefined) {
          updateFields.push(`scalar_name = $${paramCount++}`);
          updateValues.push(validatedData.scalar_name);
        }
        
        if (validatedData.active_flag !== undefined) {
          updateFields.push(`active_flag = $${paramCount++}`);
          updateValues.push(validatedData.active_flag);
        }
        
        updateFields.push(`updatedby = $${paramCount++}`);
        updateValues.push(updatedBy);
        
        updateFields.push(`updateddate = NOW()`);
        
        updateFields.push(`updatedhost = $${paramCount++}`);
        updateValues.push(updatedHost);
        
        updateValues.push(id); // For WHERE clause
        
        const headerQuery = `
          UPDATE frs9_imp_ca_fl_scalarh
          SET ${updateFields.join(', ')}
          WHERE pkid = $${paramCount}
        `;
        
        await client.query(headerQuery, updateValues);
      }
      
      // Update details if provided
      if (validatedData.details) {
        // Delete existing details
        await client.query('DELETE FROM frs9_imp_ca_fl_scalard WHERE scalar_id = $1', [id]);
        
        // Insert new details
        for (const detail of validatedData.details) {
          const detailQuery = `
            INSERT INTO frs9_imp_ca_fl_scalard (
              scalar_id,
              period,
              weighted_scalar,
              createdby,
              createddate,
              createdhost
            ) VALUES ($1, $2, $3, $4, NOW(), $5)
          `;
          
          await client.query(detailQuery, [
            id,
            detail.period,
            detail.weighted_scalar,
            updatedBy,
            updatedHost
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch updated data
      const updatedScalar = await this.getFLScalarByIdInternal(id);
      
      console.log('✅ FL Scalar updated successfully');
      
      res.json({
        success: true,
        data: updatedScalar,
        message: 'FL Scalar updated successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error updating FL Scalar:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update FL Scalar',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // DELETE FL SCALAR
  // ==========================================================================
  async deleteFLScalar(req: Request, res: Response, next: NextFunction) {
    const client = await frs9ProPool.connect();
    
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting FL Scalar ${id} from DS2 database`);
      
      await client.query('BEGIN');
      
      // Delete details first (foreign key constraint)
      await client.query('DELETE FROM frs9_imp_ca_fl_scalard WHERE scalar_id = $1', [id]);
      
      // Delete header
      const result = await client.query('DELETE FROM frs9_imp_ca_fl_scalarh WHERE pkid = $1', [id]);
      
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'FL Scalar not found'
        });
      }
      
      await client.query('COMMIT');
      
      console.log('✅ FL Scalar deleted successfully');
      
      res.json({
        success: true,
        message: 'FL Scalar deleted successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error deleting FL Scalar:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete FL Scalar',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  private async getFLScalarByIdInternal(id: string) {
    const headerQuery = `
      SELECT 
        pkid,
        scalar_name,
        active_flag,
        createdby AS created_by,
        createddate AS created_date,
        createdhost AS created_host,
        updatedby AS updated_by,
        updateddate AS updated_date,
        updatedhost AS updated_host
      FROM frs9_imp_ca_fl_scalarh
      WHERE pkid = $1
    `;
    
    const headerResult = await frs9ProPool.query(headerQuery, [id]);
    
    if (headerResult.rows.length === 0) {
      return null;
    }
    
    const detailsQuery = `
      SELECT 
        pkid,
        scalar_id,
        period,
        weighted_scalar,
        createdby AS created_by,
        createddate AS created_date,
        createdhost AS created_host,
        updatedby AS updated_by,
        updateddate AS updated_date,
        updatedhost AS updated_host
      FROM frs9_imp_ca_fl_scalard
      WHERE scalar_id = $1
      ORDER BY period
    `;
    
    const detailsResult = await frs9ProPool.query(detailsQuery, [id]);
    
    return {
      ...headerResult.rows[0],
      details: detailsResult.rows
    };
  }
}

// ============================================================================
// INDIVIDUAL FUNCTION EXPORTS FOR ROUTE CONFIGURATION
// ============================================================================

// FL Scalar operations
export const getFLScalars = FLScalarController.getFLScalars;
export const getFLScalarById = FLScalarController.getFLScalarById;
export const createFLScalar = FLScalarController.createFLScalar;
export const updateFLScalar = FLScalarController.updateFLScalar;
export const deleteFLScalar = FLScalarController.deleteFLScalar;

// Health check
export const healthCheck = FLScalarController.healthCheck;

export default new FLScalarController();