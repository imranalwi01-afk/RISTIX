// packages/backend/src/api/controllers/rule-base-setting-ds2.controller.ts
// ============================================================================
// RULE BASE SETTING CONTROLLER - IFRS9 RULE-BASED COLLECTIVE IMPAIRMENT
// ============================================================================
// REST API controller for Rule Base Setting master-detail operations
// Database: DS2 FRS9PRO (192.168.0.106:5433) - REAL DATABASE ONLY!
// Tables: 
//   - frs9_param_scenario_rulesh (Headers) - 4 records
//   - frs9_param_scenario_rulesd (Details) - 11 records  
//   - view_param_scenario_rules (Combined view)
// Legacy compliance: ASP.NET MVC ParamScenarioRules controller implementation
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

// Helper function to generate database info
const getDatabaseInfo = (tableName?: string) => {
  const dbConfig = appConfig.platformDb;
  return {
    host: `${dbConfig.frs9.host}:${dbConfig.frs9.port}`,
    database: dbConfig.frs9.database,
    ...(tableName && { table: tableName }),
    ssl: dbConfig.frs9.ssl,
    environment: dbConfig.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
  };
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const RuleHeaderSchema = z.object({
  rule_name: z.string().min(1, 'Rule name is required').max(250),
  rule_type: z.enum(['DEFAULT', 'STAGE', 'GL', 'CUSTOM']),
  updated_table: z.string().min(1, 'Updated table is required').max(100),
  updated_column: z.string().min(1, 'Updated column is required').max(100),
  value: z.string().min(1, 'Value is required').max(250),
  seq: z.number().int().min(1).optional(),
  active_flag: z.boolean().optional().default(true)
});

const RuleDetailSchema = z.object({
  query_group: z.number().int().min(1),
  seq: z.number().int().min(1),
  table_name: z.string().min(1, 'Table name is required').max(100),
  column_name: z.string().min(1, 'Column name is required').max(100),
  data_type: z.enum(['VARCHAR', 'CHAR', 'NUMBER', 'INT', 'BIT', 'DATE', 'DATETIME', 'BOOLEAN']),
  operator: z.enum(['=', '!=', '<>', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'IS NULL', 'IS NOT NULL']),
  value1: z.string().optional(),
  value2: z.string().optional(),
  condition: z.enum(['AND', 'OR']),
  detail_type: z.string().optional(),
  stage_from: z.string().optional(),
  stage_to: z.string().optional()
});

// ============================================================================
// CONTROLLER FUNCTIONS
// ============================================================================

/**
 * Get all rule base setting headers with details count
 * Returns nested table format with header-detail structure
 */
export const getRuleHeaders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Starting Rule Base Setting fetch from DS2 FRS9PRO database...');
    console.log('🔧 Pool configuration:', {
      host: databaseConfig.frs9.host,
      port: databaseConfig.frs9.port,
      database: databaseConfig.frs9.database,
      ssl: databaseConfig.frs9.ssl
    });
    
    // Test database connection first
    const testResult = await frs9ProPool.query('SELECT NOW() as server_time');
    console.log('✅ Database connection test successful:', testResult.rows[0]);
    
    // Get headers with detail counts
    const headerQuery = `
      SELECT 
        h.pkid,
        h.rule_name,
        h.rule_type,
        h.updated_table,
        h.updated_column,
        h.value,
        h.seq,
        h.active_flag,
        h.createdby,
        h.createddate,
        h.createdhost,
        h.updatedby,
        h.updateddate,
        h.updatedhost,
        COUNT(d.pkid) as detail_count
      FROM frs9_param_scenario_rulesh h
      LEFT JOIN frs9_param_scenario_rulesd d ON h.pkid = d.rule_id
      GROUP BY h.pkid, h.rule_name, h.rule_type, h.updated_table, h.updated_column, 
               h.value, h.seq, h.active_flag, h.createdby, h.createddate, h.createdhost,
               h.updatedby, h.updateddate, h.updatedhost
      ORDER BY h.seq ASC, h.createddate DESC
    `;
    console.log('🔍 Executing rule headers query...');
    
    const headerResult = await frs9ProPool.query(headerQuery);
    console.log(`✅ Retrieved ${headerResult.rows.length} rule headers from DS2 database`);
    
    // Transform database result to match frontend interface
    const ruleHeaders = headerResult.rows.map(row => ({
      pkid: row.pkid,
      rule_name: row.rule_name,
      rule_type: row.rule_type,
      updated_table: row.updated_table,
      updated_column: row.updated_column,
      value: row.value,
      seq: row.seq,
      active_flag: row.active_flag,
      detail_count: parseInt(row.detail_count) || 0,
      createdby: row.createdby,
      createddate: row.createddate,
      createdhost: row.createdhost,
      updatedby: row.updatedby,
      updateddate: row.updateddate,
      updatedhost: row.updatedhost
    }));

    res.json({
      success: true,
      message: 'Rule Base Setting headers retrieved successfully from DS2 database',
      data: ruleHeaders,
      total: ruleHeaders.length,
      database_info: getDatabaseInfo('frs9_param_scenario_rulesh')
    });

  } catch (error) {
    console.error('❌ Error fetching rule headers:', error);
    
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve rule base setting headers from DS2 database',
      details: error.message,
      database_info: {
        ...getDatabaseInfo(),
        error_type: error.code || 'UNKNOWN'
      }
    });
  }
};

/**
 * Get single rule header with all details (nested table format)
 */
export const getRuleHeader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ruleId = parseInt(req.params.id);
    if (isNaN(ruleId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid rule ID'
      });
    }

    console.log(`🔍 Fetching rule header ${ruleId} with details...`);

    // Get header with details
    const query = `
      SELECT 
        h.pkid,
        h.rule_name,
        h.rule_type,
        h.updated_table,
        h.updated_column,
        h.value,
        h.seq,
        h.active_flag,
        h.createdby,
        h.createddate,
        h.createdhost,
        h.updatedby,
        h.updateddate,
        h.updatedhost,
        d.pkid as detail_id,
        d.query_group,
        d.seq as detail_seq,
        d.table_name,
        d.column_name,
        d.data_type,
        d.operator,
        d.value1,
        d.value2,
        d.condition,
        d.detail_type,
        d.stage_from,
        d.stage_to,
        d.createdby as detail_createdby,
        d.createddate as detail_createddate
      FROM frs9_param_scenario_rulesh h
      LEFT JOIN frs9_param_scenario_rulesd d ON h.pkid = d.rule_id
      WHERE h.pkid = $1
      ORDER BY d.query_group ASC, d.seq ASC
    `;

    const result = await frs9ProPool.query(query, [ruleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Rule header with ID ${ruleId} not found`
      });
    }

    // Transform to nested format
    const headerRow = result.rows[0];
    const ruleData = {
      pkid: headerRow.pkid,
      rule_name: headerRow.rule_name,
      rule_type: headerRow.rule_type,
      updated_table: headerRow.updated_table,
      updated_column: headerRow.updated_column,
      value: headerRow.value,
      seq: headerRow.seq,
      active_flag: headerRow.active_flag,
      createdby: headerRow.createdby,
      createddate: headerRow.createddate,
      createdhost: headerRow.createdhost,
      updatedby: headerRow.updatedby,
      updateddate: headerRow.updateddate,
      updatedhost: headerRow.updatedhost,
      details: result.rows
        .filter(row => row.detail_id) // Only rows with detail data
        .map(row => ({
          pkid: row.detail_id,
          rule_id: headerRow.pkid,
          query_group: row.query_group,
          seq: row.detail_seq,
          table_name: row.table_name,
          column_name: row.column_name,
          data_type: row.data_type,
          operator: row.operator,
          value1: row.value1,
          value2: row.value2,
          condition: row.condition,
          detail_type: row.detail_type,
          stage_from: row.stage_from,
          stage_to: row.stage_to,
          createdby: row.detail_createdby,
          createddate: row.detail_createddate
        }))
    };

    console.log(`✅ Retrieved rule ${ruleId} with ${ruleData.details.length} details`);

    res.json({
      success: true,
      message: `Rule base setting retrieved successfully from DS2 database`,
      data: ruleData,
      database_info: {
        ...getDatabaseInfo(),
        tables: ['frs9_param_scenario_rulesh', 'frs9_param_scenario_rulesd']
      }
    });

  } catch (error) {
    console.error('❌ Error fetching rule header:', error);
    
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve rule header from DS2 database',
      details: error.message
    });
  }
};

/**
 * Get rule details for a specific rule ID
 */
export const getRuleDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ruleId = parseInt(req.params.id);
    if (isNaN(ruleId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid rule ID'
      });
    }

    console.log(`🔍 Fetching rule details for rule ${ruleId}...`);

    const query = `
      SELECT 
        pkid,
        rule_id,
        query_group,
        seq,
        table_name,
        column_name,
        data_type,
        operator,
        value1,
        value2,
        condition,
        detail_type,
        stage_from,
        stage_to,
        createdby,
        createddate,
        createdhost,
        updatedby,
        updateddate,
        updatedhost
      FROM frs9_param_scenario_rulesd
      WHERE rule_id = $1
      ORDER BY query_group ASC, seq ASC
    `;

    const result = await frs9ProPool.query(query, [ruleId]);
    console.log(`✅ Retrieved ${result.rows.length} rule details`);

    res.json({
      success: true,
      message: 'Rule details retrieved successfully from DS2 database',
      data: result.rows,
      total: result.rows.length,
      database_info: getDatabaseInfo('frs9_param_scenario_rulesd')
    });

  } catch (error) {
    console.error('❌ Error fetching rule details:', error);
    
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve rule details from DS2 database',
      details: error.message
    });
  }
};

/**
 * Create new rule header
 */
export const createRuleHeader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📝 Creating new rule header...');
    
    // Validate input data
    const validatedData = RuleHeaderSchema.parse(req.body);
    
    const query = `
      INSERT INTO frs9_param_scenario_rulesh 
      (rule_name, rule_type, updated_table, updated_column, value, seq, active_flag, 
       createdby, createddate, createdhost)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
      RETURNING pkid, rule_name, rule_type, updated_table, updated_column, value, seq, active_flag, createddate
    `;

    const values = [
      validatedData.rule_name,
      validatedData.rule_type,
      validatedData.updated_table,
      validatedData.updated_column,
      validatedData.value,
      validatedData.seq || 1,
      validatedData.active_flag,
      'system', // TODO: Get from auth context
      req.ip || req.connection?.remoteAddress || 'localhost' // Get from request IP
    ];

    const result = await frs9ProPool.query(query, values);
    const newRule = result.rows[0];
    
    console.log(`✅ Created rule header with ID ${newRule.pkid}`);

    res.status(201).json({
      success: true,
      message: 'Rule header created successfully',
      data: newRule,
      database_info: getDatabaseInfo('frs9_param_scenario_rulesh')
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('❌ Error creating rule header:', error);
    
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create rule header',
      details: error.message
    });
  }
};

/**
 * Create new rule detail
 */
export const createRuleDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ruleId = parseInt(req.params.id);
    if (isNaN(ruleId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid rule ID'
      });
    }

    console.log(`📝 Creating new rule detail for rule ${ruleId}...`);
    
    // Validate input data
    const validatedData = RuleDetailSchema.parse(req.body);
    
    const query = `
      INSERT INTO frs9_param_scenario_rulesd 
      (rule_id, query_group, seq, table_name, column_name, data_type, operator, 
       value1, value2, condition, detail_type, stage_from, stage_to, 
       createdby, createddate, createdhost)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15)
      RETURNING pkid, rule_id, query_group, seq, table_name, column_name, data_type, 
                operator, value1, value2, condition, detail_type, stage_from, stage_to, createddate
    `;

    const values = [
      ruleId,
      validatedData.query_group,
      validatedData.seq,
      validatedData.table_name,
      validatedData.column_name,
      validatedData.data_type,
      validatedData.operator,
      validatedData.value1 || null,
      validatedData.value2 || null,
      validatedData.condition,
      validatedData.detail_type || null,
      validatedData.stage_from || null,
      validatedData.stage_to || null,
      'system', // TODO: Get from auth context
      req.ip || req.connection?.remoteAddress || 'localhost' // Get from request IP
    ];

    const result = await frs9ProPool.query(query, values);
    const newDetail = result.rows[0];
    
    console.log(`✅ Created rule detail with ID ${newDetail.pkid}`);

    res.status(201).json({
      success: true,
      message: 'Rule detail created successfully',
      data: newDetail,
      database_info: getDatabaseInfo('frs9_param_scenario_rulesd')
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('❌ Error creating rule detail:', error);
    
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create rule detail',
      details: error.message
    });
  }
};

/**
 * Get metadata endpoints for dropdowns
 */
export const getRuleTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching rule types from DS2 database...');
    
    const query = `
      SELECT DISTINCT rule_type, 
             COUNT(*) as usage_count
      FROM frs9_param_scenario_rulesh
      WHERE rule_type IS NOT NULL
      GROUP BY rule_type
      ORDER BY rule_type
    `;

    const result = await frs9ProPool.query(query);
    
    const ruleTypes = result.rows.map(row => ({
      value: row.rule_type,
      label: row.rule_type,
      usage_count: parseInt(row.usage_count)
    }));

    res.json({
      success: true,
      message: 'Rule types retrieved successfully from DS2 database',
      data: ruleTypes,
      database_info: getDatabaseInfo('frs9_param_scenario_rulesh')
    });

  } catch (error) {
    console.error('❌ Error fetching rule types:', error);
    
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve rule types from DS2 database',
      details: error.message
    });
  }
};

/**
 * Get operators for specific data type
 */
export const getOperators = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dataType } = req.params;
    console.log(`🔍 Fetching operators for data type: ${dataType}`);

    // Define operators based on data type (from legacy system analysis)
    const operatorMap: Record<string, Array<{ value: string; label: string }>> = {
      'VARCHAR': [
        { value: '=', label: 'Equal (=)' },
        { value: '!=', label: 'Not Equal (!=)' },
        { value: 'LIKE', label: 'Like (LIKE)' },
        { value: 'NOT LIKE', label: 'Not Like (NOT LIKE)' },
        { value: 'IN', label: 'In (IN)' },
        { value: 'NOT IN', label: 'Not In (NOT IN)' },
        { value: 'IS NULL', label: 'Is Null (IS NULL)' },
        { value: 'IS NOT NULL', label: 'Is Not Null (IS NOT NULL)' }
      ],
      'NUMBER': [
        { value: '=', label: 'Equal (=)' },
        { value: '!=', label: 'Not Equal (!=)' },
        { value: '>', label: 'Greater Than (>)' },
        { value: '>=', label: 'Greater Equal (>=)' },
        { value: '<', label: 'Less Than (<)' },
        { value: '<=', label: 'Less Equal (<=)' },
        { value: 'BETWEEN', label: 'Between (BETWEEN)' },
        { value: 'IN', label: 'In (IN)' },
        { value: 'NOT IN', label: 'Not In (NOT IN)' },
        { value: 'IS NULL', label: 'Is Null (IS NULL)' },
        { value: 'IS NOT NULL', label: 'Is Not Null (IS NOT NULL)' }
      ],
      'INT': [
        { value: '=', label: 'Equal (=)' },
        { value: '!=', label: 'Not Equal (!=)' },
        { value: '>', label: 'Greater Than (>)' },
        { value: '>=', label: 'Greater Equal (>=)' },
        { value: '<', label: 'Less Than (<)' },
        { value: '<=', label: 'Less Equal (<=)' },
        { value: 'BETWEEN', label: 'Between (BETWEEN)' },
        { value: 'IN', label: 'In (IN)' },
        { value: 'NOT IN', label: 'Not In (NOT IN)' }
      ],
      'BIT': [
        { value: '=', label: 'Equal (=)' },
        { value: '!=', label: 'Not Equal (!=)' },
        { value: 'IS NULL', label: 'Is Null (IS NULL)' },
        { value: 'IS NOT NULL', label: 'Is Not Null (IS NOT NULL)' }
      ],
      'DATE': [
        { value: '=', label: 'Equal (=)' },
        { value: '!=', label: 'Not Equal (!=)' },
        { value: '>', label: 'After (>)' },
        { value: '>=', label: 'On or After (>=)' },
        { value: '<', label: 'Before (<)' },
        { value: '<=', label: 'On or Before (<=)' },
        { value: 'BETWEEN', label: 'Between (BETWEEN)' },
        { value: 'IS NULL', label: 'Is Null (IS NULL)' },
        { value: 'IS NOT NULL', label: 'Is Not Null (IS NOT NULL)' }
      ]
    };

    const operators = operatorMap[dataType.toUpperCase()] || operatorMap['VARCHAR'];

    res.json({
      success: true,
      message: `Operators for data type '${dataType}' retrieved successfully`,
      data: operators
    });

  } catch (error) {
    console.error('❌ Error fetching operators:', error);
    
    res.status(500).json({
      success: false,
      error: 'SERVICE_ERROR',
      message: 'Failed to retrieve operators',
      details: error.message
    });
  }
};

/**
 * Get conditions (AND/OR)
 */
export const getConditions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conditions = [
      { value: 'AND', label: 'AND' },
      { value: 'OR', label: 'OR' }
    ];

    res.json({
      success: true,
      message: 'Conditions retrieved successfully',
      data: conditions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVICE_ERROR',
      message: 'Failed to retrieve conditions'
    });
  }
};

/**
 * Get IFRS 9 stages
 */
export const getStages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stages = [
      { value: 1, label: 'Stage 1 (12-month ECL)' },
      { value: 2, label: 'Stage 2 (Lifetime ECL)' },
      { value: 3, label: 'Stage 3 (Credit Impaired)' }
    ];

    res.json({
      success: true,
      message: 'IFRS 9 stages retrieved successfully',
      data: stages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVICE_ERROR',
      message: 'Failed to retrieve stages'
    });
  }
};

export default {
  getRuleHeaders,
  getRuleHeader,
  getRuleDetails,
  createRuleHeader,
  createRuleDetail,
  getRuleTypes,
  getOperators,
  getConditions,
  getStages
};