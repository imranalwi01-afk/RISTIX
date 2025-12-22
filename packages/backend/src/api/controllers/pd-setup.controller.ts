// packages/backend/src/api/controllers/pd-setup.controller.ts
// ============================================================================
// PD SETUP CONTROLLER - IFRS9 PROBABILITY OF DEFAULT CONFIGURATION
// ============================================================================
// Purpose: REST API endpoints for PD Setup Management (Collective Impairment)
// Database: DS2 FRS9PRO (192.168.0.106:5433) 
// Tables: frs9_imp_ca_pd_config, frs9_param_segmenth, frs9_param_commond, frs9_imp_ca_fl_scalarh
// Legacy Integration: Based on Views/PDConfig from legacy IFRS9 application
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { appConfig } from "../../config/app.config";

// Database connection for DS2 FRS9PRO - Use centralized configuration
import { getDS2DatabaseConfig } from '../../config/environment-loader-backend';

const ds2Config = getDS2DatabaseConfig();
const frs9ProPool = new Pool({
  host: ds2Config.host,
  port: ds2Config.port,
  user: ds2Config.user,
  password: ds2Config.password,
  database: ds2Config.database,
  ssl: ds2Config.ssl,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
});

// ============================================================================
// INTERFACES & VALIDATION SCHEMAS
// ============================================================================

interface PDConfig {
  pkid: number;
  pd_model_name: string;
  segment_id: number;
  pd_method: string;
  interval: number;
  population_type: string | null;
  observation_period: number;
  observation_start_date: string | null;
  multiplication: number | null;
  fl_flag: boolean;
  fl_scalar_id: number | null;
  ia_flag: boolean;
  bucket_group: string | null;
  active_flag: boolean;
  createdby?: string;
  createddate?: string;
  createdhost?: string;
  updatedby?: string;
  updateddate?: string;
  updatedhost?: string;
}

interface PopulationSegment {
  pkid: number;
  group_segment: string;
  segment: string;
  sub_segment: string | null;
  segment_type: string;
  seq: number;
  active_flag: boolean;
}

interface BusinessParameter {
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc: string;
}

interface FLScalar {
  pkid: number;
  scalar_name: string;
  active_flag: boolean;
}

// Validation schemas
const createPDConfigSchema = z.object({
  pd_model_name: z.string().min(1).max(255),
  segment_id: z.number().int().positive(),
  pd_method: z.enum(['1', '2', '3']),
  interval: z.number().int().min(0).max(36),
  population_type: z.string().nullable(),
  observation_period: z.number().int().min(0).max(120),
  observation_start_date: z.string().nullable(),
  multiplication: z.number().nullable(),
  fl_flag: z.boolean(),
  fl_scalar_id: z.number().int().nullable(),
  ia_flag: z.boolean(),
  bucket_group: z.string().nullable(),
  active_flag: z.boolean()
});

const updatePDConfigSchema = createPDConfigSchema.partial();

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

export class PDSetupController {

  // GET /api/v1/banking/pd-setup/configs
  // Get all PD configurations with joined data
  async getPDConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = `
        SELECT 
          pc.pkid,
          pc.pd_model_name,
          pc.segment_id,
          ps.group_segment as segment_name,
          pc.pd_method,
          pmethod.paramdesc as pd_method_desc,
          pc.interval,
          pc.population_type,
          ptype.paramdesc as population_type_desc,
          pc.observation_period,
          pc.observation_start_date,
          pc.multiplication,
          pc.fl_flag,
          pc.fl_scalar_id,
          fs.scalar_name as fl_scalar_name,
          pc.ia_flag,
          pc.bucket_group,
          pc.active_flag,
          pc.createdby,
          pc.createddate,
          pc.createdhost,
          pc.updatedby,
          pc.updateddate,
          pc.updatedhost
        FROM frs9_imp_ca_pd_config pc
        LEFT JOIN frs9_param_segmenth ps ON pc.segment_id = ps.pkid AND ps.segment_type = 'PD'
        LEFT JOIN frs9_param_commond pmethod ON pmethod.param_code = 'B0018' AND pmethod.value1 = pc.pd_method
        LEFT JOIN frs9_param_commond ptype ON ptype.param_code = 'B0019' AND ptype.value1 = pc.population_type
        LEFT JOIN frs9_imp_ca_fl_scalarh fs ON pc.fl_scalar_id = fs.pkid
        ORDER BY pc.pkid ASC
      `;

      const result = await frs9ProPool.query(query);

      // Get database configuration for response
      const dbConfig = appConfig.platformDb;

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
        message: 'PD configurations retrieved successfully',
        timestamp: new Date().toISOString(),
        database_info: {
          host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
          database: dbConfig.frs9.database,
          table: 'frs9_imp_ca_pd_config',
          ssl: dbConfig.frs9.ssl,
          environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('Error getting PD configurations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve PD configurations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/banking/pd-setup/segments
  // Get population segments for PD type
  async getPopulationSegments(req: Request, res: Response, next: NextFunction) {
    try {
      const { segment_type = 'PD' } = req.query;

      const query = `
        SELECT 
          pkid,
          group_segment,
          segment,
          sub_segment,
          segment_type,
          seq,
          active_flag
        FROM frs9_param_segmenth 
        WHERE segment_type = $1 
        ORDER BY seq ASC
      `;

      const result = await frs9ProPool.query(query, [segment_type]);

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
        message: 'Population segments retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting population segments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve population segments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/banking/pd-setup/business-parameters
  // Get business parameters for PD methods and population types
  async getBusinessParameters(req: Request, res: Response, next: NextFunction) {
    try {
      const { param_code } = req.query;

      let whereClause = '';
      const queryParams = [];

      if (param_code) {
        whereClause = 'WHERE param_code = $1';
        queryParams.push(param_code);
      } else {
        whereClause = "WHERE param_code IN ('B0018', 'B0019')";
      }

      const query = `
        SELECT 
          param_code,
          param_seq,
          value1,
          value2,
          value3,
          paramdesc
        FROM frs9_param_commond 
        ${whereClause}
        ORDER BY param_code, param_seq ASC
      `;

      const result = await frs9ProPool.query(query, queryParams);

      // Group by param_code
      const grouped = result.rows.reduce((acc: any, row: any) => {
        if (!acc[row.param_code]) {
          acc[row.param_code] = [];
        }
        acc[row.param_code].push({
          param_seq: row.param_seq,
          value1: row.value1,
          value2: row.value2,
          value3: row.value3,
          paramdesc: row.paramdesc
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: grouped,
        message: 'Business parameters retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting business parameters:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve business parameters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/banking/pd-setup/fl-scalars
  // Get FL scalar data
  async getFLScalars(req: Request, res: Response, next: NextFunction) {
    try {
      const query = `
        SELECT 
          pkid,
          scalar_name,
          active_flag
        FROM frs9_imp_ca_fl_scalarh 
        ORDER BY pkid ASC
      `;

      const result = await frs9ProPool.query(query);

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
        message: 'FL scalars retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting FL scalars:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve FL scalars',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/banking/pd-setup/bucket-groups
  // Get bucket groups from bucket header table
  async getBucketGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const query = `
        SELECT DISTINCT bucket_group
        FROM frs9_param_bucketh 
        ORDER BY bucket_group ASC
      `;

      const result = await frs9ProPool.query(query);

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
        message: 'Bucket groups retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting bucket groups:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bucket groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/banking/pd-setup/configs/:id
  // Get single PD configuration by ID
  async getPDConfigById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          pc.pkid,
          pc.pd_model_name,
          pc.segment_id,
          ps.group_segment as segment_name,
          pc.pd_method,
          pmethod.paramdesc as pd_method_desc,
          pc.interval,
          pc.population_type,
          ptype.paramdesc as population_type_desc,
          pc.observation_period,
          pc.observation_start_date,
          pc.multiplication,
          pc.fl_flag,
          pc.fl_scalar_id,
          fs.scalar_name as fl_scalar_name,
          pc.ia_flag,
          pc.bucket_group,
          pc.active_flag,
          pc.createdby,
          pc.createddate,
          pc.createdhost,
          pc.updatedby,
          pc.updateddate,
          pc.updatedhost
        FROM frs9_imp_ca_pd_config pc
        LEFT JOIN frs9_param_segmenth ps ON pc.segment_id = ps.pkid AND ps.segment_type = 'PD'
        LEFT JOIN frs9_param_commond pmethod ON pmethod.param_code = 'B0018' AND pmethod.value1 = pc.pd_method
        LEFT JOIN frs9_param_commond ptype ON ptype.param_code = 'B0019' AND ptype.value1 = pc.population_type
        LEFT JOIN frs9_imp_ca_fl_scalarh fs ON pc.fl_scalar_id = fs.pkid
        WHERE pc.pkid = $1
      `;

      const result = await frs9ProPool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PD configuration not found',
          code: 'PD_CONFIG_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'PD configuration retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting PD configuration by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve PD configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/v1/banking/pd-setup/configs
  // Create new PD configuration
  async createPDConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createPDConfigSchema.parse(req.body);

      const query = `
        INSERT INTO frs9_imp_ca_pd_config (
          pd_model_name, segment_id, pd_method, interval, population_type,
          observation_period, observation_start_date, multiplication,
          fl_flag, fl_scalar_id, ia_flag, bucket_group, active_flag,
          createdby, createddate, createdhost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15)
        RETURNING pkid
      `;

      const values = [
        validatedData.pd_model_name,
        validatedData.segment_id,
        validatedData.pd_method,
        validatedData.interval,
        validatedData.population_type,
        validatedData.observation_period,
        validatedData.observation_start_date,
        validatedData.multiplication,
        validatedData.fl_flag,
        validatedData.fl_scalar_id,
        validatedData.ia_flag,
        validatedData.bucket_group,
        validatedData.active_flag,
        req.user?.email || 'system',
        req.ip || 'localhost'
      ];

      const result = await frs9ProPool.query(query, values);

      res.status(201).json({
        success: true,
        data: {
          pkid: result.rows[0].pkid,
          ...validatedData
        },
        message: 'PD configuration created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        });
      }

      console.error('Error creating PD configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create PD configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/v1/banking/pd-setup/configs/:id
  // Update existing PD configuration
  async updatePDConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updatePDConfigSchema.parse(req.body);

      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(validatedData)) {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      // Add updated fields
      updateFields.push(`updatedby = $${paramIndex++}`);
      updateFields.push(`updateddate = NOW()`);
      updateFields.push(`updatedhost = $${paramIndex++}`);
      values.push(req.user?.email || 'system');
      values.push(req.ip || 'localhost');
      values.push(id); // WHERE condition

      const query = `
        UPDATE frs9_imp_ca_pd_config 
        SET ${updateFields.join(', ')}
        WHERE pkid = $${paramIndex}
        RETURNING pkid
      `;

      const result = await frs9ProPool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PD configuration not found',
          code: 'PD_CONFIG_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: {
          pkid: parseInt(id),
          ...validatedData
        },
        message: 'PD configuration updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        });
      }

      console.error('Error updating PD configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update PD configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/v1/banking/pd-setup/configs/:id
  // Delete PD configuration
  async deletePDConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const query = `
        DELETE FROM frs9_imp_ca_pd_config 
        WHERE pkid = $1
        RETURNING pkid
      `;

      const result = await frs9ProPool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PD configuration not found',
          code: 'PD_CONFIG_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'PD configuration deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting PD configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete PD configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/banking/pd-setup/health
  // Health check for PD Setup service and DS2 database connection
  async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const startTime = Date.now();
      
      // Test database connectivity
      const result = await frs9ProPool.query('SELECT NOW() as server_time, COUNT(*) as total_configs FROM frs9_imp_ca_pd_config');
      const responseTime = Date.now() - startTime;

      // Get database configuration for response
      const dbConfig = appConfig.platformDb;

      res.json({
        success: true,
        message: 'PD Setup service is healthy - DS2 connection working',
        data: {
          connection: 'healthy',
          database: dbConfig.frs9.database,
          host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
          server_time: result.rows[0].server_time,
          total_pd_configs: result.rows[0].total_configs,
          response_time_ms: responseTime,
          timestamp: new Date().toISOString(),
          ssl: dbConfig.frs9.ssl,
          environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });

    } catch (error) {
      console.error('PD Setup health check failed:', error);
      // Get database configuration for response
      const dbConfig = appConfig.platformDb;

      res.status(503).json({
        success: false,
        message: 'PD Setup service is unhealthy - DS2 database connection failed',
        data: {
          connection: 'unhealthy',
          database: dbConfig.frs9.database,
          host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          ssl: dbConfig.frs9.ssl,
          environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
        }
      });
    }
  }
}

// ============================================================================
// INDIVIDUAL FUNCTION EXPORTS FOR ROUTE CONFIGURATION
// ============================================================================

// PD Config operations
export const getPDConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await PDSetupController.prototype.getPDConfigs(req, res, next);
  } catch (error) {
    next(error);
  }
};
export const getPDConfigById = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.getPDConfigById(req, res, next);
export const createPDConfig = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.createPDConfig(req, res, next);
export const updatePDConfig = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.updatePDConfig(req, res, next);
export const deletePDConfig = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.deletePDConfig(req, res, next);

// Metadata operations
export const getPopulationSegments = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.getPopulationSegments(req, res, next);
export const getBusinessParameters = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.getBusinessParameters(req, res, next);
export const getFLScalars = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.getFLScalars(req, res, next);
export const getBucketGroups = (req: Request, res: Response, next: NextFunction) =>
  PDSetupController.prototype.getBucketGroups(req, res, next);

// Health check
export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const controller = new PDSetupController();
    await controller.healthCheck(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Create and export default instance
const pdSetupController = new PDSetupController();
export default pdSetupController;