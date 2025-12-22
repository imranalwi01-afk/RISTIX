// packages/backend/src/api/controllers/ead-setup.controller.ts
// ============================================================================
// EAD SETUP CONTROLLER - IFRS9 EXPOSURE AT DEFAULT CONFIGURATION
// ============================================================================
// Purpose: Controller for managing EAD configurations with DS2 database integration
// Database: DS2 FRS9PRO (192.168.0.106:5433) - REAL DATABASE ONLY!
// Tables: frs9_imp_ca_ead_config, frs9_param_commond, frs9_param_segmenth
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

// DS2 Database connection for EAD configurations
const ds2Pool = new Pool({
  host: process.env.DS2_HOST || '192.168.0.106',
  port: parseInt(process.env.DS2_PORT || '5433'),
  database: process.env.DS2_DATABASE || 'FRS9PRO',
  user: process.env.DS2_USER || 'postgres',
  password: process.env.DS2_PASSWORD || 'postgres',
  ssl: false, // NO SSL as per requirements
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ============================================================================
// EAD CONFIGURATION CRUD OPERATIONS
// ============================================================================

/**
 * Get all EAD configurations with business parameter lookups
 */
export const getAllEADConfigs = async (req: Request, res: Response, next: NextFunction) => {
  const client = await ds2Pool.connect();

  try {
    // Query EAD configurations with business parameter lookups
    // Use ONLY actual column names from frs9_imp_ca_ead_config table
    const query = `
      SELECT
        ead.pkid,
        ead.ead_model_name,
        ead.ead_method,
        ead.calc_method,
        ead.segment_id,
        ead.active_flag,
        ead.createddate,
        ead.createdby,
        ead.updateddate,
        ead.updatedby,
        ead.createdhost,
        ead.updatedhost,
        -- Business parameter lookups - use actual column references
        COALESCE(seg.group_segment, '') as segment_name,
        COALESCE(bp1.paramdesc, '') as ead_method_desc,
        COALESCE(bp2.paramdesc, '') as calc_method_desc
      FROM frs9_imp_ca_ead_config ead
      LEFT JOIN frs9_param_segmenth seg ON ead.segment_id = seg.pkid AND seg.segment_type = 'EAD'
      LEFT JOIN frs9_param_commond bp1 ON ead.ead_method = bp1.value1 AND bp1.param_code = 'B0024'
      LEFT JOIN frs9_param_commond bp2 ON ead.calc_method = bp2.value1 AND bp2.param_code = 'B0026'
      ORDER BY ead.pkid DESC
    `;

    const result = await client.query(query);

    // Transform database result to match frontend interface
    const eadConfigs = result.rows.map(row => ({
      pkid: row.pkid,
      ead_model_name: row.ead_model_name,
      ead_method: row.ead_method,
      calc_method: row.calc_method,
      segment_id: row.segment_id,
      segment_name: row.segment_name || `Segment ${row.segment_id}`,
      ead_method_desc: row.ead_method_desc,
      calc_method_desc: row.calc_method_desc,
      active_flag: row.active_flag,
      created_by: row.createdby,
      created_date: row.createddate?.toISOString?.()?.split('T')[0] || row.createddate,
      updated_by: row.updatedby,
      updated_date: row.updateddate?.toISOString?.()?.split('T')[0] || row.updateddate
    }));

    res.json({
      success: true,
      data: eadConfigs,
      total: result.rowCount,
      message: `Retrieved ${result.rowCount} EAD configurations from DS2 database`,
      database_info: {
        host: `${process.env.DS2_HOST || '192.168.0.106'}:${process.env.DS2_PORT || '5433'}`,
        database: process.env.DS2_DATABASE || 'FRS9PRO',
        table: 'frs9_imp_ca_ead_config',
        ssl: false,
        environment: 'development'
      }
    });

  } catch (error) {
    console.error('EAD Setup Database Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('does not exist')) {
        return res.status(404).json({
          success: false,
          error: 'EAD configuration table not found',
          details: 'Table frs9_imp_ca_ead_config does not exist in DS2 database',
          code: 'EAD_TABLE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        return res.status(503).json({
          success: false,
          error: 'DS2 database connection failed',
          details: 'Cannot connect to FRS9PRO database for EAD configurations',
          code: 'EAD_DATABASE_CONNECTION_FAILED',
          timestamp: new Date().toISOString()
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve EAD configurations',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'EAD_SETUP_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};

/**
 * Get business parameters for EAD setup (methods, population types, segments)
 */
export const getEADBusinessParameters = async (req: Request, res: Response, next: NextFunction) => {
  const client = await ds2Pool.connect();

  try {
    // Get EAD methods (B0024)
    const eadMethodsQuery = `
      SELECT param_seq as value, value1 as code, paramdesc as label, value2, value3
      FROM frs9_param_commond
      WHERE param_code = 'B0024'
      ORDER BY param_seq
    `;

    // Get population types (B0025)
    const populationTypesQuery = `
      SELECT param_seq as value, value1 as code, paramdesc as label, value2, value3
      FROM frs9_param_commond
      WHERE param_code = 'B0025'
      ORDER BY param_seq
    `;

    // Get EAD segments
    const segmentsQuery = `
      SELECT pkid as value, segment as code, segment as label, segment_type
      FROM frs9_param_segmenth
      WHERE segment_type = 'EAD' AND active_flag = true
      ORDER BY seq
    `;

    const [eadMethodsResult, populationTypesResult, segmentsResult] = await Promise.all([
      client.query(eadMethodsQuery),
      client.query(populationTypesQuery),
      client.query(segmentsQuery)
    ]);

    // Transform EAD methods with business logic flags
    const eadMethods = eadMethodsResult.rows.map(row => ({
      value: row.value,
      label: row.label,
      code: row.code,
      requires_collateral: row.value === 1 || row.value === 2,
      requires_historical: row.value === 1 || row.value === 2,
      allows_percentage: row.value === 3
    }));

    console.log(`✅ Retrieved EAD business parameters: ${eadMethods.length} methods, ${populationTypesResult.rows.length} populations, ${segmentsResult.rows.length} segments`);

    res.json({
      success: true,
      data: {
        eadMethods: eadMethods,
        populationTypes: populationTypesResult.rows,
        segments: segmentsResult.rows
      },
      message: 'EAD business parameters retrieved successfully from DS2 database',
      database_info: {
        host: process.env.DS2_HOST || '192.168.0.106',
        database: process.env.DS2_DATABASE || 'FRS9PRO',
        tables: [
          'frs9_param_commond (B0024 - EAD Methods)',
          'frs9_param_commond (B0025 - Population Types)',
          'frs9_param_segmenth (EAD Segments)'
        ],
        ssl: false,
        environment: 'development'
      }
    });

  } catch (error) {
    console.error('EAD Business Parameters Database Error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve EAD business parameters',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'EAD_BUSINESS_PARAMS_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};

/**
 * Create new EAD configuration
 */
export const createEADConfig = async (req: Request, res: Response, next: NextFunction) => {
  const client = await ds2Pool.connect();

  try {
    const {
      ead_model_name,
      ead_method,
      calc_method,
      segment_id,
      active_flag = true
    } = req.body;

    // Validation
    if (!ead_model_name || !ead_method || !segment_id) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: {
          ead_model_name: !ead_model_name ? 'EAD model name is required' : null,
          ead_method: !ead_method ? 'EAD method is required' : null,
          segment_id: !segment_id ? 'Segment ID is required' : null
        },
        code: 'EAD_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Insert new EAD configuration
    const insertQuery = `
      INSERT INTO frs9_imp_ca_ead_config
      (ead_model_name, ead_method, calc_method, segment_id, active_flag, createddate, createdby, createdhost)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING pkid, ead_model_name, ead_method, calc_method, segment_id, active_flag, createddate
    `;

    const values = [
      ead_model_name,
      ead_method,
      calc_method || null,
      segment_id,
      active_flag,
      req.user?.email || 'system',
      req.ip || 'localhost'
    ];

    const insertResult = await client.query(insertQuery, values);

    console.log(`✅ Created EAD configuration with PKID: ${insertResult.rows[0].pkid}`);

    res.status(201).json({
      success: true,
      data: insertResult.rows[0],
      message: 'EAD configuration created successfully in DS2 database'
    });

  } catch (error) {
    console.error('EAD Setup Create Error:', error);

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'EAD configuration already exists',
        details: error.message,
        code: 'EAD_DUPLICATE_CONFIG',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create EAD configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'EAD_CREATE_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};

/**
 * Update existing EAD configuration
 */
export const updateEADConfig = async (req: Request, res: Response, next: NextFunction) => {
  const client = await ds2Pool.connect();

  try {
    const { id } = req.params;
    const {
      ead_model_name,
      ead_method,
      calc_method,
      segment_id,
      active_flag
    } = req.body;

    // Check if EAD configuration exists
    const checkQuery = `SELECT pkid FROM frs9_imp_ca_ead_config WHERE pkid = $1`;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'EAD configuration not found',
        details: `No EAD configuration found with ID: ${id}`,
        code: 'EAD_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (ead_model_name !== undefined) {
      updateFields.push(`ead_model_name = $${paramCount++}`);
      values.push(ead_model_name);
    }

    if (ead_method !== undefined) {
      updateFields.push(`ead_method = $${paramCount++}`);
      values.push(ead_method);
    }

    if (calc_method !== undefined) {
      updateFields.push(`calc_method = $${paramCount++}`);
      values.push(calc_method);
    }

    if (segment_id !== undefined) {
      updateFields.push(`segment_id = $${paramCount++}`);
      values.push(segment_id);
    }

    if (active_flag !== undefined) {
      updateFields.push(`active_flag = $${paramCount++}`);
      values.push(active_flag);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        details: 'At least one field must be provided for update',
        code: 'EAD_NO_UPDATE_FIELDS',
        timestamp: new Date().toISOString()
      });
    }

    updateFields.push(`updateddate = NOW()`);
    updateFields.push(`updatedby = $${paramCount++}`);
    updateFields.push(`updatedhost = $${paramCount++}`);
    values.push(req.user?.email || 'system');
    values.push(req.ip || 'localhost');
    values.push(id);

    const updateQuery = `
      UPDATE frs9_imp_ca_ead_config
      SET ${updateFields.join(', ')}
      WHERE pkid = $${paramCount}
      RETURNING pkid, ead_model_name, ead_method, calc_method, segment_id, active_flag, updateddate
    `;

    const updateResult = await client.query(updateQuery, values);

    res.json({
      success: true,
      data: updateResult.rows[0],
      message: 'EAD configuration updated successfully',
      database_info: {
        host: process.env.DS2_HOST || '192.168.0.106',
        database: process.env.DS2_DATABASE || 'FRS9PRO',
        table: 'frs9_imp_ca_ead_config'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('EAD Setup Update Error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to update EAD configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'EAD_UPDATE_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};

/**
 * Delete EAD configuration
 */
export const deleteEADConfig = async (req: Request, res: Response, next: NextFunction) => {
  const client = await ds2Pool.connect();

  try {
    const { id } = req.params;

    // Check if EAD configuration exists
    const checkQuery = `SELECT pkid, ead_model_name FROM frs9_imp_ca_ead_config WHERE pkid = $1`;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'EAD configuration not found',
        details: `No EAD configuration found with ID: ${id}`,
        code: 'EAD_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Delete EAD configuration
    const deleteQuery = `DELETE FROM frs9_imp_ca_ead_config WHERE pkid = $1`;
    await client.query(deleteQuery, [id]);

    console.log(`✅ Deleted EAD configuration ${id}`);

    res.json({
      success: true,
      message: 'EAD configuration deleted successfully from DS2 database'
    });

  } catch (error) {
    console.error('EAD Setup Delete Error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to delete EAD configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'EAD_DELETE_ERROR',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};

/**
 * Health check for EAD Setup service and DS2 database connectivity
 */
export const eadSetupHealthCheck = async (req: Request, res: Response, next: NextFunction) => {
  const client = await ds2Pool.connect();

  try {
    // Test basic database connectivity
    await client.query('SELECT NOW() as server_time, version() as postgres_version');

    // Test EAD configuration table access
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'frs9_imp_ca_ead_config'
      ) as table_exists
    `);

    const tableExists = tableCheck.rows[0].table_exists;

    if (tableExists) {
      const countCheck = await client.query('SELECT COUNT(*) as total_configs FROM frs9_imp_ca_ead_config');
      const totalConfigs = parseInt(countCheck.rows[0].total_configs);

      res.json({
        success: true,
        data: {
          service: 'EAD Setup Service',
          status: 'healthy',
          database: {
            connection: 'healthy',
            host: process.env.DS2_HOST || '192.168.0.106',
            database: process.env.DS2_DATABASE || 'FRS9PRO',
            port: process.env.DS2_PORT || '5433'
          },
          table: {
            name: 'frs9_imp_ca_ead_config',
            exists: true,
            total_configs: totalConfigs
          },
          features: {
            ead_configurations: true,
            business_parameters: true,
            crud_operations: true
          }
        },
        message: 'EAD Setup service is healthy and connected to DS2 database',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        data: {
          service: 'EAD Setup Service',
          status: 'degraded',
          database: {
            connection: 'healthy',
            host: process.env.DS2_HOST || '192.168.0.106',
            database: process.env.DS2_DATABASE || 'FRS9PRO'
          },
          table: {
            name: 'frs9_imp_ca_ead_config',
            exists: false
          },
          features: {
            ead_configurations: false,
            business_parameters: 'limited',
            crud_operations: false
          }
        },
        message: 'DS2 database connected but EAD configuration table not found',
        code: 'EAD_TABLE_MISSING',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('EAD Setup Health Check Error:', error);

    res.status(503).json({
      success: false,
      data: {
        service: 'EAD Setup Service',
        status: 'unhealthy',
        database: {
          connection: 'failed',
          host: process.env.DS2_HOST || '192.168.0.106',
          database: process.env.DS2_DATABASE || 'FRS9PRO'
        },
        features: {
          ead_configurations: false,
          business_parameters: false,
          crud_operations: false
        }
      },
      error: 'DS2 database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'EAD_DATABASE_CONNECTION_FAILED',
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
};