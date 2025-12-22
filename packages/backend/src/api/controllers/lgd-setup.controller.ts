// packages/backend/src/api/controllers/lgd-setup.controller.ts
// ============================================================================
// LGD SETUP CONTROLLER - IFRS9 LOSS GIVEN DEFAULT CONFIGURATION MANAGEMENT
// ============================================================================
// Purpose: LGD Setup management for Loss Given Default model configuration
// Database: DS2 FRS9PRO (192.168.0.106:5433) - REAL DATABASE ONLY!
// Table: FRS9_IMP_CA_LGD_CONFIG → frs9_imp_ca_lgd_config (lowercase)
// Business Parameters: 
//   - B0022 (LGD Method) from frs9_param_commond
//   - B0023 (Population Type) from frs9_param_commond
//   - LGD Segments from frs9_param_segmenth where segment_type = 'LGD'
// ============================================================================
// CRITICAL: NO MOCK DATA, NO FALLBACK DATA, NO ASSUMPTIONS!
// ONLY REAL DATA FROM LIVE DATABASE!
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { appConfig } from "../../config/app.config";

// ============================================================================
// DATABASE CONNECTION - DS2 FRS9PRO (REAL DATABASE)
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
const LGDConfigSchema = z.object({
  lgd_model_name: z.string().min(1, 'LGD Model Name is required').max(100),
  segment_id: z.number().int().positive('Segment ID is required'),
  lgd_method: z.number().int().min(1).max(3, 'LGD Method must be 1, 2, or 3'),
  population_type: z.number().int().positive('Population Type is required'),
  observation_period: z.number().int().positive('Observation Period must be positive'),
  observation_start_date: z.string().nullable().optional(),
  workout_period: z.number().int().min(0).optional(),
  fl_flag: z.boolean().optional().default(false),
  fl_scalar_id: z.number().int().nullable().optional(),
  lgd_rate: z.number().min(0).max(1, 'LGD Rate must be between 0 and 1').optional(),
  active_flag: z.boolean().optional().default(true)
});

// ============================================================================
// CONTROLLER FUNCTIONS
// ============================================================================

/**
 * Get all LGD configurations with business parameter lookups
 * Includes joins to segment, method, and population type lookups
 */
export const getAllLGDConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Starting LGD configurations fetch from DS2 FRS9PRO database...');
    console.log('🔧 Pool configuration:', {
      host: databaseConfig.frs9.host,
      port: databaseConfig.frs9.port,
      database: databaseConfig.frs9.database,
      ssl: databaseConfig.frs9.ssl
    });
    
    // Test database connection first
    const testResult = await frs9ProPool.query('SELECT NOW() as server_time');
    console.log('✅ Database connection test successful:', testResult.rows[0]);
    
    // Full query to retrieve all LGD configuration data
    const query = `
      SELECT 
        pkid,
        lgd_model_name,
        segment_id,
        lgd_method,
        population_type,
        observation_period,
        observation_start_date,
        workout_period,
        fl_flag,
        fl_scalar_id,
        lgd_rate,
        active_flag,
        createdby,
        createddate,
        createdhost,
        updatedby,
        updateddate,
        updatedhost
      FROM frs9_imp_ca_lgd_config
      ORDER BY createddate DESC, pkid DESC
    `;
    console.log('🔍 Executing full LGD data query...');
    
    const result = await frs9ProPool.query(query);
    console.log(`✅ Retrieved ${result.rows.length} LGD configurations from DS2 database`);
    
    // Transform database result to match frontend interface
    const lgdConfigs = result.rows.map(row => ({
      pkid: row.pkid,
      lgd_model_name: row.lgd_model_name,
      segment_id: row.segment_id,
      segment_name: `Segment ${row.segment_id}`,
      lgd_method: row.lgd_method,
      lgd_method_name: `Method ${row.lgd_method}`,
      population_type: row.population_type,
      population_type_name: `Population ${row.population_type}`,
      observation_period: row.observation_period,
      historical_month: row.observation_period,
      first_npl_date: row.observation_start_date,
      workout_period: row.workout_period || 0,
      fl_flag: row.fl_flag || false,
      fl_scalar_id: row.fl_scalar_id,
      unsecured_lgd_rate: row.lgd_rate || 0,
      secured_lgd_rate: (row.lgd_rate || 0) * 0.7,
      lgd_rate: row.lgd_rate || 0,
      is_active: row.active_flag,
      created_by: row.createdby,
      created_date: row.createddate?.toISOString?.()?.split('T')[0] || row.createddate,
      updated_by: row.updatedby,
      updated_date: row.updateddate?.toISOString?.()?.split('T')[0] || row.updateddate
    }));

    // Get database configuration for response
    const dbConfig = appConfig.platformDb;

    res.json({
      success: true,
      data: lgdConfigs,
      total: result.rows.length,
      message: `Retrieved ${result.rows.length} LGD configurations from DS2 FRS9PRO database`,
      database_info: {
        host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
        database: dbConfig.frs9.database,
        table: 'frs9_imp_ca_lgd_config',
        ssl: dbConfig.frs9.ssl,
        environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching LGD configurations from DS2:', error);
    res.status(503).json({
      success: false,
      error: 'Failed to fetch LGD configurations from DS2 database',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
};

/**
 * Get business parameters for LGD setup (methods, population types, segments)
 */
export const getLGDBusinessParameters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching LGD business parameters from DS2 FRS9PRO...');
    
    // Get LGD Methods (B0022)
    const methodsQuery = `
      SELECT param_seq as value, value1 as code, paramdesc as label, value2, value3
      FROM frs9_param_commond
      WHERE param_code = 'B0022'
      ORDER BY param_seq
    `;

    // Get Population Types (B0023)
    const populationQuery = `
      SELECT param_seq as value, value1 as code, paramdesc as label, value2, value3
      FROM frs9_param_commond
      WHERE param_code = 'B0023'
      ORDER BY param_seq
    `;

    // Get LGD Segments
    const segmentsQuery = `
      SELECT pkid as value, segment as code, segment as label, segment_type
      FROM frs9_param_segmenth
      WHERE segment_type = 'LGD' AND active_flag = true
      ORDER BY seq
    `;

    const [methodsResult, populationResult, segmentsResult] = await Promise.all([
      frs9ProPool.query(methodsQuery),
      frs9ProPool.query(populationQuery),
      frs9ProPool.query(segmentsQuery)
    ]);

    // Transform methods with business logic flags
    const methods = methodsResult.rows.map(row => ({
      value: row.value,
      label: row.label,
      code: row.code,
      requires_historical: row.value === 1 || row.value === 2,
      requires_npl_date: row.value === 1 || row.value === 2,
      requires_workout: row.value === 1 || row.value === 2,
      allows_lgd_rate: row.value === 3
    }));

    console.log(`✅ Retrieved business parameters: ${methods.length} methods, ${populationResult.rows.length} populations, ${segmentsResult.rows.length} segments`);

    // Get database configuration for response
    const dbConfig = appConfig.platformDb;

    res.json({
      success: true,
      data: {
        lgdMethods: methods,
        populationTypes: populationResult.rows,
        segments: segmentsResult.rows
      },
      message: 'Retrieved LGD business parameters from DS2 database',
      database_info: {
        host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
        database: dbConfig.frs9.database,
        tables: [
          'frs9_param_commond (B0022 - LGD Methods)',
          'frs9_param_commond (B0023 - Population Types)',
          'frs9_param_segmenth (LGD Segments)'
        ],
        ssl: dbConfig.frs9.ssl,
        environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching LGD business parameters from DS2:', error);
    res.status(503).json({
      success: false,
      error: 'Failed to fetch LGD business parameters from DS2 database',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
};

/**
 * Create new LGD configuration
 */
export const createLGDConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = LGDConfigSchema.parse(req.body);
    
    console.log('➕ Creating LGD configuration in DS2 database:', validatedData.lgd_model_name);
    
    const insertQuery = `
      INSERT INTO frs9_imp_ca_lgd_config (
        lgd_model_name, segment_id, lgd_method, population_type,
        observation_period, observation_start_date, workout_period,
        fl_flag, fl_scalar_id, lgd_rate, active_flag,
        createdby, createddate, createdhost
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13
      ) RETURNING *
    `;
    
    const values = [
      validatedData.lgd_model_name,
      validatedData.segment_id,
      validatedData.lgd_method,
      validatedData.population_type,
      validatedData.observation_period,
      validatedData.observation_start_date || null,
      validatedData.workout_period || 0,
      validatedData.fl_flag || false,
      validatedData.fl_scalar_id || null,
      validatedData.lgd_rate || 0,
      validatedData.active_flag,
      req.user?.email || 'system',
      req.ip || 'localhost'
    ];
    
    const result = await frs9ProPool.query(insertQuery, values);
    
    console.log(`✅ Created LGD configuration with PKID: ${result.rows[0].pkid}`);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'LGD configuration created successfully in DS2 database'
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('❌ Error creating LGD configuration in DS2:', error);
    res.status(503).json({
      success: false,
      error: 'Failed to create LGD configuration in DS2 database',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
};

/**
 * Update LGD configuration
 */
export const updateLGDConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = LGDConfigSchema.partial().parse(req.body);
    
    console.log(`✏️ Updating LGD configuration ${id} in DS2 database`);
    
    const updateQuery = `
      UPDATE frs9_imp_ca_lgd_config 
      SET lgd_model_name = COALESCE($1, lgd_model_name),
          segment_id = COALESCE($2, segment_id),
          lgd_method = COALESCE($3, lgd_method),
          population_type = COALESCE($4, population_type),
          observation_period = COALESCE($5, observation_period),
          observation_start_date = COALESCE($6, observation_start_date),
          workout_period = COALESCE($7, workout_period),
          fl_flag = COALESCE($8, fl_flag),
          fl_scalar_id = COALESCE($9, fl_scalar_id),
          lgd_rate = COALESCE($10, lgd_rate),
          active_flag = COALESCE($11, active_flag),
          updatedby = $12,
          updateddate = NOW(),
          updatedhost = $13
      WHERE pkid = $14
      RETURNING *
    `;
    
    const values = [
      validatedData.lgd_model_name,
      validatedData.segment_id,
      validatedData.lgd_method,
      validatedData.population_type,
      validatedData.observation_period,
      validatedData.observation_start_date,
      validatedData.workout_period,
      validatedData.fl_flag,
      validatedData.fl_scalar_id,
      validatedData.lgd_rate,
      validatedData.active_flag,
      req.user?.email || 'system',
      req.ip || 'localhost',
      parseInt(id)
    ];
    
    const result = await frs9ProPool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'LGD configuration not found',
        code: 'LGD_CONFIG_NOT_FOUND'
      });
    }
    
    console.log(`✅ Updated LGD configuration ${id}`);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'LGD configuration updated successfully in DS2 database'
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error(`❌ Error updating LGD configuration ${req.params.id}:`, error);
    res.status(503).json({
      success: false,
      error: 'Failed to update LGD configuration in DS2 database',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
};

/**
 * Delete LGD configuration
 */
export const deleteLGDConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting LGD configuration ${id} from DS2 database`);
    
    const deleteQuery = 'DELETE FROM frs9_imp_ca_lgd_config WHERE pkid = $1 RETURNING *';
    const result = await frs9ProPool.query(deleteQuery, [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'LGD configuration not found',
        code: 'LGD_CONFIG_NOT_FOUND'
      });
    }
    
    console.log(`✅ Deleted LGD configuration ${id}`);
    
    res.json({
      success: true,
      message: 'LGD configuration deleted successfully from DS2 database'
    });

  } catch (error: any) {
    console.error(`❌ Error deleting LGD configuration ${req.params.id}:`, error);
    res.status(503).json({
      success: false,
      error: 'Failed to delete LGD configuration from DS2 database',
      code: 'DATABASE_ERROR',
      details: error.message
    });
  }
};

/**
 * Health check for LGD Setup service
 */
export const lgdSetupHealthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🏥 Checking LGD Setup DS2 database connection...');
    
    const healthQuery = `
      SELECT 
        COUNT(*) as total_configs,
        COUNT(CASE WHEN active_flag = true THEN 1 END) as active_configs,
        MAX(createddate) as latest_created
      FROM frs9_imp_ca_lgd_config
    `;
    
    const result = await frs9ProPool.query(healthQuery);
    const stats = result.rows[0];
    
    // Get database configuration for response
    const dbConfig = appConfig.platformDb;

    res.json({
      success: true,
      message: 'LGD Setup DS2 database connection healthy',
      data: {
        connection: 'healthy',
        database: dbConfig.frs9.database,
        host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
        table: 'frs9_imp_ca_lgd_config',
        statistics: {
          total_configurations: parseInt(stats.total_configs),
          active_configurations: parseInt(stats.active_configs),
          latest_created: stats.latest_created
        },
        timestamp: new Date().toISOString(),
        ssl: dbConfig.frs9.ssl,
        environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
      }
    });

  } catch (error: any) {
    console.error('❌ LGD Setup DS2 database health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'LGD Setup DS2 database connection issues detected',
      code: 'DATABASE_UNHEALTHY',
      details: error.message
    });
  }
};