// packages/backend/src/api/routes/business-settings.routes.ts
// ============================================================================
// 🎯 BUSINESS SETTINGS ROUTES FOR SEGMENTATION CONFIGURATION
// ============================================================================
// Implements exact user specifications for cascading dropdowns:
// - B0012: Table dropdown
// - B0013: Column dropdown (based on selected table) + Data type detection
// - B0014: Operator dropdown (based on selected data type)
// - B0015: Condition dropdown
// - B0016: Multi-select values (based on selected column and table)
// ============================================================================

import { Router } from 'express';
import { BusinessSettingsController } from '../controllers/business-settings.controller';
import { requireAuth } from '../../middleware/auth';
import { ParamCommond } from '../../core/models/frs9-parameter.models';
import { Sequelize } from 'sequelize';

const router = Router();
const businessSettingsController = new BusinessSettingsController();

// Test endpoint - no authentication required
router.get('/test-b0012', async (_req, res) => {
  try {
    console.log('🧪 [BusinessSettings] B0012 test requested');

    // Test database connection with timeout and raw SQL
    console.log('🔍 Testing database connection...');

    // Use the Sequelize instance directly with a timeout
    const sequelize = ParamCommond.sequelize;

    // Test basic connection first
    console.log('🔍 Testing basic database ping...');
    const [results, metadata] = await sequelize.query('SELECT 1 as test_connection', {
      type: sequelize.QueryTypes.SELECT,
      timeout: 5000 // 5 second timeout
    });

    console.log('✅ Database ping successful:', results);

    // Test table existence
    console.log('🔍 Testing table existence...');
    const [tableResults] = await sequelize.query(`
      SELECT COUNT(*) as table_exists
      FROM information_schema.tables
      WHERE table_name = 'frs9_param_commond'
    `, {
      type: sequelize.QueryTypes.SELECT,
      timeout: 5000
    });

    console.log('✅ Table existence check:', tableResults);

    // Test for specific param codes with simple query
    console.log('🔍 Testing B0012-B0016 param codes...');
    const paramCodes = ['B0012', 'B0013', 'B0014', 'B0015', 'B0016'];
    const resultsData: any = {};

    for (const code of paramCodes) {
      try {
        const [countResult] = await sequelize.query(`
          SELECT COUNT(*) as count
          FROM frs9_param_commond
          WHERE param_code = :code
        `, {
          replacements: { code },
          type: sequelize.QueryTypes.SELECT,
          timeout: 3000
        });

        resultsData[code] = { count: parseInt(countResult.count) };
        console.log(`✅ Found ${countResult.count} records for ${code}`);
      } catch (codeError) {
        console.error(`❌ Error checking ${code}:`, codeError);
        resultsData[code] = { error: codeError instanceof Error ? codeError.message : 'Unknown error' };
      }
    }

    return res.json({
      success: true,
      message: 'B0012-B0016 database connectivity test completed',
      data: {
        connectionTest: results,
        tableTest: tableResults,
        paramCodeCounts: resultsData,
        databaseInfo: {
          host: process.env.FRS9_DB_HOST,
          database: process.env.FRS9_DB_NAME,
          table: 'frs9_param_commond'
        }
      }
    });

  } catch (error) {
    console.error('❌ [BusinessSettings] B0012 test error:', error);
    res.status(500).json({
      success: false,
      error: 'B0012 test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      databaseInfo: {
        host: process.env.FRS9_DB_HOST,
        database: process.env.FRS9_DB_NAME
      }
    });
  }
});

// Health check endpoint - no authentication required
router.get('/health', async (_req, res) => {
  try {
    console.log('🏥 [BusinessSettings] Health check requested');

    // Test database connection to FRS9PRO
    const testConnection = await ParamCommond.findOne({
      where: { param_code: 'B0012' },
      attributes: ['pkid'],
      raw: true
    });

    res.json({
      success: true,
      message: 'Business Settings Service is healthy',
      database: {
        connected: testConnection !== null,
        frs9pro: 'Connected',
        table: 'frs9_param_commond'
      },
      service: 'business-settings',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [BusinessSettings] Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Business Settings service health check failed',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Apply authentication to all routes (except health check)
router.use(requireAuth);
  
// ==========================================
// BUSINESS SETTINGS API ENDPOINTS
// ==========================================

/**
 * Get From Business Setting (table frs9_param_commond) 'B0012'
 * Returns table names for dropdown
 * GET /api/v1/banking/business-settings/tables
 */
router.get('/tables', async (req, res) => {
  try {
    console.log('🗃️ [BusinessSettings] GET /tables requested');
    await businessSettingsController.getTables(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /tables route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get table options',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get from Business Setting(frs9_param_commond) ->distinct(VALUE1) 
 * where VALUE3 = selected TABLE_NAME
 * Returns column names for selected table
 * GET /api/v1/banking/business-settings/columns?table=TABLE_NAME
 */
router.get('/columns', async (req, res) => {
  try {
    console.log('🗂️ [BusinessSettings] GET /columns requested for table:', req.query.table);
    await businessSettingsController.getColumns(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /columns route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get column options',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get From Business Setting(table frs9_param_commond) B0013->distinct(VALUE2) 
 * Where Value 1 = selected Column Name and VALUE3 = selected TABLE_NAME
 * Returns data type for selected column in selected table
 * GET /api/v1/banking/business-settings/data-type?column=COLUMN_NAME&table=TABLE_NAME
 */
router.get('/data-type', async (req, res) => {
  try {
    console.log('🔢 [BusinessSettings] GET /data-type requested for column:', req.query.column, 'table:', req.query.table);
    await businessSettingsController.getDataType(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /data-type route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get data type',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get From Business Setting (table frs9_param_commond) B0014->Distinct Value1 
 * where Value2 = Selected Data Type
 * Returns operators for selected data type
 * GET /api/v1/banking/business-settings/operators?dataType=DATA_TYPE
 */
router.get('/operators', async (req, res) => {
  try {
    console.log('⚙️ [BusinessSettings] GET /operators requested for data type:', req.query.dataType);
    await businessSettingsController.getOperators(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /operators route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get operator options',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get From Business Setting(table frs9_param_commond) B15-> Distinct Value1
 * Returns AND/OR conditions
 * GET /api/v1/banking/business-settings/conditions
 */
router.get('/conditions', async (req, res) => {
  try {
    console.log('🔗 [BusinessSettings] GET /conditions requested');
    await businessSettingsController.getConditions(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /conditions route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get condition options',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get From Business Setting(table frs9_param_commond) B0016->Distinct Value1 
 * where Value2 = selected Column Name and VALUE3 = selected TABLE_NAME
 * Returns column values for multi-select (IN/NOT IN operators)
 * GET /api/v1/banking/business-settings/column-values?column=COLUMN_NAME&table=TABLE_NAME
 */
router.get('/column-values', async (req, res) => {
  try {
    console.log('📋 [BusinessSettings] GET /column-values requested for column:', req.query.column, 'table:', req.query.table);
    await businessSettingsController.getColumnValues(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /column-values route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get column values',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Debug endpoint to check available business settings
 * GET /api/v1/banking/business-settings/debug
 */
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 [BusinessSettings] GET /debug requested');
    await businessSettingsController.getDebugInfo(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /debug route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get debug information',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Temporary investigation endpoint for B0016 data structure
 * GET /api/v1/banking/business-settings/investigate-b0016
 */
router.get('/investigate-b0016', async (req, res) => {
  try {
    console.log('🔍 [BusinessSettings] GET /investigate-b0016 requested');
    await businessSettingsController.investigateB0016(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /investigate-b0016 route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to investigate B0016 data',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Investigation endpoint for segmentation tables in FRS9PRO database
 * GET /api/v1/banking/business-settings/investigate-segmentation-tables
 */
router.get('/investigate-segmentation-tables', async (req, res) => {
  try {
    console.log('🔍 [BusinessSettings] GET /investigate-segmentation-tables requested');
    await businessSettingsController.investigateSegmentationTables(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /investigate-segmentation-tables route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to investigate segmentation tables',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Investigation endpoint for field name case sensitivity
 * GET /api/v1/banking/business-settings/investigate-field-names
 */
router.get('/investigate-field-names', async (req, res) => {
  try {
    console.log('🔍 [BusinessSettings] GET /investigate-field-names requested');
    await businessSettingsController.investigateFieldNames(req, res);
  } catch (error) {
    console.error('❌ [BusinessSettings] GET /investigate-field-names route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to investigate field names',
      code: 'ROUTE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==========================================
// API DOCUMENTATION ENDPOINT
// ==========================================

/**
 * Health check endpoint - no authentication required
 * GET /api/v1/banking/business-settings/health
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 [BusinessSettings] Health check requested');

    // Test database connection
    const { ParamCommond } = await import('../controllers/business-settings.controller');
    const testConnection = await ParamCommond.findOne({
      where: { param_code: 'B0012' },
      attributes: ['pkid'],
      raw: true
    });

    res.json({
      success: true,
      message: 'Business Settings Service is healthy',
      database: {
        connected: testConnection !== null,
        frs9pro: 'Connected',
        table: 'frs9_param_commond'
      },
      service: 'business-settings',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [BusinessSettings] Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Business Settings service health check failed',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * Service information and available endpoints
 * GET /api/v1/banking/business-settings/
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Business Settings Service for Segmentation Configuration',
    version: '1.0.0',
    description: 'FRS9PRO business parameter integration for cascading dropdowns (B0012-B0016)',
    timestamp: new Date().toISOString(),
    
    database_info: {
      host: `${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'}`,
      database: process.env.FRS9_DB_NAME || 'FRS9PRO',
      table: 'frs9_param_commond',
      business_settings: ['B0012', 'B0013', 'B0014', 'B0015', 'B0016']
    },
    
    endpoints: {
      service_info: 'GET /banking/business-settings',
      debug_info: 'GET /banking/business-settings/debug',
      
      segmentation_dropdowns: {
        tables: 'GET /banking/business-settings/tables',
        columns: 'GET /banking/business-settings/columns?table=TABLE_NAME',
        data_type: 'GET /banking/business-settings/data-type?column=COLUMN&table=TABLE',
        operators: 'GET /banking/business-settings/operators?dataType=DATA_TYPE',
        conditions: 'GET /banking/business-settings/conditions',
        column_values: 'GET /banking/business-settings/column-values?column=COLUMN&table=TABLE'
      }
    },
    
    business_settings_mapping: {
      'B0012': {
        purpose: 'Table dropdown - Get table names',
        endpoint: '/tables',
        returns: 'Array of table names from VALUE1'
      },
      'B0013': {
        purpose: 'Column dropdown + Data type detection',
        endpoints: {
          columns: '/columns?table=TABLE_NAME',
          data_type: '/data-type?column=COLUMN&table=TABLE'
        },
        returns: 'Columns filtered by table, data type from VALUE2'
      },
      'B0014': {
        purpose: 'Operator dropdown based on data type',
        endpoint: '/operators?dataType=DATA_TYPE',
        returns: 'Operators from VALUE1 filtered by data type in VALUE2'
      },
      'B0015': {
        purpose: 'Condition dropdown (AND/OR)',
        endpoint: '/conditions',
        returns: 'Conditions from VALUE1'
      },
      'B0016': {
        purpose: 'Multi-select values for IN/NOT IN operators',
        endpoint: '/column-values?column=COLUMN&table=TABLE',
        returns: 'Column values from VALUE1 filtered by column+table'
      }
    },
    
    usage_example: {
      table_selection: '1. GET /tables → Select table',
      column_selection: '2. GET /columns?table=SELECTED_TABLE → Select column',
      data_type_detection: '3. GET /data-type?column=SELECTED_COLUMN&table=SELECTED_TABLE → Auto-populate data type',
      operator_selection: '4. GET /operators?dataType=DETECTED_TYPE → Select operator',
      condition_selection: '5. GET /conditions → Select AND/OR condition',
      value_selection: '6. For IN/NOT IN: GET /column-values?column=SELECTED_COLUMN&table=SELECTED_TABLE'
    }
  });
});

/**
 * Error handling for unmatched routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Business Settings endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    details: {
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    },
    available_endpoints: [
      'GET /banking/business-settings',
      'GET /banking/business-settings/debug',
      'GET /banking/business-settings/tables',
      'GET /banking/business-settings/columns?table=TABLE_NAME',
      'GET /banking/business-settings/data-type?column=COLUMN&table=TABLE',
      'GET /banking/business-settings/operators?dataType=DATA_TYPE',
      'GET /banking/business-settings/conditions',
      'GET /banking/business-settings/column-values?column=COLUMN&table=TABLE'
    ]
  });
});

console.log('✅ Business Settings routes loaded successfully - Implements exact B0012-B0016 specifications');
export default router;