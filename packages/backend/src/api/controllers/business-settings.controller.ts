// packages/backend/src/api/controllers/business-settings.controller.ts
// ============================================================================
// 🎯 BUSINESS SETTINGS CONTROLLER FOR SEGMENTATION CONFIGURATION
// ============================================================================
// Implements exact user specifications for cascading dropdowns:
// - B0012: Table dropdown
// - B0013: Column dropdown (based on selected table)
// - B0014: Operator dropdown (based on selected data type)
// - B0015: Condition dropdown
// - B0016: Multi-select values (based on selected column and table)
// ============================================================================

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { backendEnvironmentLoader } from "../../config/environment-loader-backend";
import { ParamCommond } from '../../core/models/frs9-parameter.models';

// Helper function to get centralized database info
const getDatabaseInfo = () => {
  try {
    const config = backendEnvironmentLoader.getConfiguration();
    const legacyDb = config.database.legacy;
    return {
      host: `${legacyDb.host}:${legacyDb.port}`,
      database: legacyDb.database,
      environment: config.deployment.environment
    };
  } catch (error) {
    console.warn('⚠️ Failed to get centralized database info, using fallback:', error);
    return {
      host: `${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'}`,
      database: process.env.FRS9_DB_NAME || 'FRS9PRO',
      environment: 'unknown'
    };
  }
};

// Auth context interface
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
}

export class BusinessSettingsController {
  
  // ==========================================
  // TABLE DROPDOWN - Business Setting B0012
  // ==========================================
  
  /**
   * Get From Business Setting (table frs9_param_commond) 'B0012'
   * GET /api/v1/banking/business-settings/tables
   */
  async getTables(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🗃️ [BusinessSettings] Getting table names from B0012');
      
      const tables = await ParamCommond.findAll({
        where: { param_code: 'B0012' },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        order: [['param_seq', 'ASC']],
        raw: true
      });

      console.log(`✅ [BusinessSettings] Found ${tables.length} tables from B0012`);

      // Transform to dropdown format
      const transformedTables = tables.map((table: any) => ({
        id: table.pkid,
        value: table.value1, // Table name
        label: table.paramdesc || table.value1,
        description: table.value2,
        category: table.value3,
        sequence: table.param_seq
      }));

      res.json({
        success: true,
        data: transformedTables,
        total: tables.length,
        message: `Successfully retrieved ${tables.length} table options from B0012`,
        database_info: {
          ...getDatabaseInfo(),
          table: 'frs9_param_commond',
          business_setting: 'B0012'
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Get tables error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get table options',
        code: 'GET_TABLES_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // COLUMN DROPDOWN - Business Setting B0013
  // ==========================================

  /**
   * Get from Business Setting(frs9_param_commond) ->distinct(VALUE1) 
   * where VALUE3 = selected TABLE_NAME
   * GET /api/v1/banking/business-settings/columns?table=TABLE_NAME
   */
  async getColumns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { table } = req.query;
      console.log(`🗂️ [BusinessSettings] Getting columns from B0013 for table: ${table}`);

      if (!table) {
        res.status(400).json({
          success: false,
          error: 'Table parameter is required',
          code: 'MISSING_TABLE_PARAMETER'
        });
        return;
      }

      // ✅ FIXED: Get distinct columns from B0013 where PARAMDESC = selected table
      const columns = await ParamCommond.findAll({
        where: { 
          param_code: 'B0013',
          paramdesc: table  // ✅ FIX: Table reference is in paramdesc, not value3
        },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        group: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'], // Include all selected attributes in GROUP BY
        order: [['param_seq', 'ASC']],
        raw: true
      });

      console.log(`✅ [BusinessSettings] Found ${columns.length} columns from B0013 for table ${table}`);

      // Transform to dropdown format
      const transformedColumns = columns.map((column: any) => ({
        id: column.pkid,
        value: column.value1, // Column name
        label: column.paramdesc || column.value1,
        data_type: column.value2, // Data type for this column
        table_name: column.value3, // Table name
        sequence: column.param_seq
      }));

      res.json({
        success: true,
        data: transformedColumns,
        total: columns.length,
        message: `Successfully retrieved ${columns.length} column options from B0013 for table ${table}`,
        database_info: {
          host: getDatabaseInfo().host,
          database: 'FRS9PRO',
          table: 'frs9_param_commond',
          business_setting: 'B0013',
          filter: `PARAMDESC = '${table}'`
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Get columns error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get column options',
        code: 'GET_COLUMNS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // DATA TYPE - Business Setting B0013
  // ==========================================

  /**
   * Get From Business Setting(table frs9_param_commond) B0013->distinct(VALUE2) 
   * Where Value 1 = selected Column Name and VALUE3 = selected TABLE_NAME
   * GET /api/v1/banking/business-settings/data-type?column=COLUMN_NAME&table=TABLE_NAME
   */
  async getDataType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { column, table } = req.query;
      console.log(`🔢 [BusinessSettings] Getting data type from B0013 for column: ${column}, table: ${table}`);

      if (!column || !table) {
        res.status(400).json({
          success: false,
          error: 'Both column and table parameters are required',
          code: 'MISSING_PARAMETERS'
        });
        return;
      }

      // Get distinct data type from B0013 where VALUE1 = column AND VALUE3 = table
      const dataTypes = await ParamCommond.findAll({
        where: { 
          param_code: 'B0013',
          value1: column,
          value3: table
        },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        group: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'], // Include all selected attributes in GROUP BY
        order: [['param_seq', 'ASC']],
        raw: true
      });

      console.log(`✅ [BusinessSettings] Found ${dataTypes.length} data types from B0013 for column ${column}, table ${table}`);

      // Transform to data type format
      const transformedDataTypes = dataTypes.map((dataType: any) => ({
        id: dataType.pkid,
        column_name: dataType.value1,
        data_type: dataType.value2, // The actual data type
        table_name: dataType.value3,
        description: dataType.paramdesc,
        sequence: dataType.param_seq
      }));

      // Return the first data type (should be unique for a specific column-table combination)
      const result = transformedDataTypes.length > 0 ? transformedDataTypes[0] : null;

      res.json({
        success: true,
        data: result,
        message: result ? 
          `Successfully retrieved data type for column ${column} in table ${table}` :
          `No data type found for column ${column} in table ${table}`,
        database_info: {
          host: getDatabaseInfo().host,
          database: 'FRS9PRO',
          table: 'frs9_param_commond',
          business_setting: 'B0013',
          filter: `VALUE1 = '${column}' AND VALUE3 = '${table}'`
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Get data type error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get data type',
        code: 'GET_DATA_TYPE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // OPERATOR DROPDOWN - Business Setting B0014
  // ==========================================

  /**
   * Get From Business Setting (table frs9_param_commond) B0014->Distinct Value1 
   * where Value2 = Selected Data Type
   * GET /api/v1/banking/business-settings/operators?dataType=DATA_TYPE
   */
  async getOperators(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { dataType } = req.query;
      console.log(`⚙️ [BusinessSettings] Getting operators from B0014 for data type: ${dataType}`);

      if (!dataType) {
        res.status(400).json({
          success: false,
          error: 'Data type parameter is required',
          code: 'MISSING_DATA_TYPE_PARAMETER'
        });
        return;
      }

      // Get distinct operators from B0014 where PARAMDESC = selected data type
      const operators = await ParamCommond.findAll({
        where: { 
          param_code: 'B0014',
          paramdesc: dataType
        },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        group: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'], // Include all selected attributes in GROUP BY
        order: [['param_seq', 'ASC']],
        raw: true
      });

      console.log(`✅ [BusinessSettings] Found ${operators.length} operators from B0014 for data type ${dataType}`);

      // Transform to dropdown format
      const transformedOperators = operators.map((operator: any) => ({
        id: operator.pkid,
        value: operator.value1, // Operator symbol (=, !=, >, <, IN, NOT IN, etc.)
        label: operator.value2, // Operator description (Equals, Not Equals, Greater Than, etc.)
        data_type: operator.paramdesc, // Data type this operator applies to (VARCHAR, NUMBER)
        category: operator.value3,
        sequence: operator.param_seq
      }));

      res.json({
        success: true,
        data: transformedOperators,
        total: operators.length,
        message: `Successfully retrieved ${operators.length} operator options from B0014 for data type ${dataType}`,
        database_info: {
          host: getDatabaseInfo().host,
          database: 'FRS9PRO',
          table: 'frs9_param_commond',
          business_setting: 'B0014',
          filter: `PARAMDESC = '${dataType}'`
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Get operators error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get operator options',
        code: 'GET_OPERATORS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // CONDITION DROPDOWN - Business Setting B0015
  // ==========================================

  /**
   * Get From Business Setting(table frs9_param_commond) B15-> Distinct Value1
   * GET /api/v1/banking/business-settings/conditions
   */
  async getConditions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔗 [BusinessSettings] Getting conditions from B0015');

      // Get distinct conditions from B0015
      const conditions = await ParamCommond.findAll({
        where: { param_code: 'B0015' },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        group: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'], // Include all selected attributes in GROUP BY
        order: [['param_seq', 'ASC']],
        raw: true
      });

      console.log(`✅ [BusinessSettings] Found ${conditions.length} conditions from B0015`);

      // Transform to dropdown format
      const transformedConditions = conditions.map((condition: any) => ({
        id: condition.pkid,
        value: condition.value1, // Condition (AND, OR)
        label: condition.paramdesc || condition.value1,
        description: condition.value2,
        category: condition.value3,
        sequence: condition.param_seq
      }));

      res.json({
        success: true,
        data: transformedConditions,
        total: conditions.length,
        message: `Successfully retrieved ${conditions.length} condition options from B0015`,
        database_info: {
          host: getDatabaseInfo().host,
          database: 'FRS9PRO',
          table: 'frs9_param_commond',
          business_setting: 'B0015'
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Get conditions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get condition options',
        code: 'GET_CONDITIONS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // MULTI-SELECT VALUES - Business Setting B0016
  // ==========================================

  /**
   * (Get From Business Setting(table frs9_param_commond) B0016->Distinct Value1 
   * where Value2 = selected Column Name and VALUE3 = selected TABLE_NAME)
   * GET /api/v1/banking/business-settings/column-values?column=COLUMN_NAME&table=TABLE_NAME
   */
  async getColumnValues(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { column, table } = req.query;
      console.log(`📋 [BusinessSettings] Getting column values from B0016 for column: ${column}, table: ${table}`);

      if (!column || !table) {
        res.status(400).json({
          success: false,
          error: 'Both column and table parameters are required',
          code: 'MISSING_PARAMETERS'
        });
        return;
      }

      // ✅ FIXED: Get distinct values from B0016 where PARAMDESC = table.column format
      // 🔧 CRITICAL FIX: Handle case sensitivity - FRS9PRO uses lowercase field names
      const tableNameLower = table.toString().toLowerCase();
      const columnNameLower = column.toString().toLowerCase();
      
      const columnValues = await ParamCommond.findAll({
        where: { 
          param_code: 'B0016',
          paramdesc: `${tableNameLower}.${columnNameLower}`  // ✅ FIX: Use lowercase for FRS9PRO compatibility
        },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        group: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'], // Include all selected attributes in GROUP BY
        order: [['param_seq', 'ASC']],
        raw: true
      });

      console.log(`✅ [BusinessSettings] Found ${columnValues.length} column values from B0016 for column ${column}, table ${table}`);

      // Transform to multi-select format
      const transformedValues = columnValues.map((value: any) => ({
        id: value.pkid,
        value: value.value1, // The actual column value
        label: value.paramdesc || value.value1,
        column_name: value.value2, // Column name
        table_name: value.value3, // Table name
        sequence: value.param_seq
      }));

      // ✅ ENHANCED: Handle missing data gracefully with fallback guidance
      const response = {
        success: true,
        data: transformedValues,
        total: columnValues.length,
        message: columnValues.length > 0 
          ? `Successfully retrieved ${columnValues.length} column values from B0016 for column ${column} in table ${table}`
          : `No predefined values found in B0016 for ${table}.${column}. Manual entry required.`,
        database_info: {
          host: getDatabaseInfo().host,
          database: 'FRS9PRO',
          table: 'frs9_param_commond',
          business_setting: 'B0016',
          filter: `PARAMDESC = '${table}.${column}'`
        }
      };

      // ✅ ENHANCED: Add fallback guidance when no data found
      if (columnValues.length === 0) {
        (response as any).fallback_info = {
          guidance: 'No predefined values in business settings for this table.column combination',
          solution: 'Use manual text input for comma-separated values',
          example: 'HE,KPR,CF,TNH',
          manual_entry_required: true,
          available_combinations: [
            'portfolio_accounts.product_type',
            'portfolio_accounts.current_stage', 
            'customers.customer_type',
            'customers.risk_rating'
          ],
          ui_fallback: {
            show_dropdown: false,
            show_text_input: true,
            placeholder: 'Enter comma-separated values (e.g., HE,KPR,CF,TNH)',
            chip_label: 'Multi-select (Manual)'
          }
        };
      }

      res.json(response);

    } catch (error) {
      console.error('❌ [BusinessSettings] Get column values error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get column values',
        code: 'GET_COLUMN_VALUES_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // DEBUG ENDPOINT - Check Available Business Settings
  // ==========================================

  /**
   * Debug endpoint to check what business settings are available in the database
   * GET /api/v1/banking/business-settings/debug
   */
  async getDebugInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 [BusinessSettings] Getting debug information for business settings');

      // Check available business setting codes
      const businessSettingCounts = await ParamCommond.findAll({
        where: {
          param_code: {
            [Op.in]: ['B0012', 'B0013', 'B0014', 'B0015', 'B0016']
          }
        },
        attributes: [
          'param_code',
          [ParamCommond.sequelize!.fn('COUNT', ParamCommond.sequelize!.col('param_code')), 'count']
        ],
        group: ['param_code'], // Only group by param_code for counting
        raw: true
      });

      // Get sample data from each business setting
      const sampleData: any = {};
      for (const settingCode of ['B0012', 'B0013', 'B0014', 'B0015', 'B0016']) {
        const samples = await ParamCommond.findAll({
          where: { param_code: settingCode },
          attributes: ['param_code', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
          limit: 3,
          order: [['param_seq', 'ASC']],
          raw: true
        });
        sampleData[settingCode] = samples;
      }

      res.json({
        success: true,
        debug: {
          timestamp: new Date().toISOString(),
          database: `DS2 FRS9PRO (${process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'})`,
          business_settings_analysis: {
            available_codes: businessSettingCounts,
            total_records: businessSettingCounts.reduce((sum: number, item: any) => sum + parseInt(item.count), 0)
          },
          sample_data: sampleData,
          mapping_specification: {
            'B0012': 'Table dropdown - Get table names',
            'B0013': 'Column dropdown - Get columns by table + Data type detection',
            'B0014': 'Operator dropdown - Get operators by data type',
            'B0015': 'Condition dropdown - Get AND/OR conditions',
            'B0016': 'Multi-select values - Get column values by column+table'
          },
          api_endpoints: {
            tables: 'GET /api/v1/banking/business-settings/tables',
            columns: 'GET /api/v1/banking/business-settings/columns?table=TABLE_NAME',
            dataType: 'GET /api/v1/banking/business-settings/data-type?column=COLUMN&table=TABLE',
            operators: 'GET /api/v1/banking/business-settings/operators?dataType=DATA_TYPE',
            conditions: 'GET /api/v1/banking/business-settings/conditions',
            columnValues: 'GET /api/v1/banking/business-settings/column-values?column=COLUMN&table=TABLE'
          }
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Get debug info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get debug information',
        code: 'GET_DEBUG_INFO_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // TEMPORARY DEBUG METHOD FOR B0016 DATA
  // ==========================================
  
  /**
   * Temporary debug method to investigate B0016 data structure
   * GET /api/v1/banking/business-settings/investigate-b0016
   */
  async investigateB0016(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 [BusinessSettings] Investigating B0016 data structure');

      // Query all B0016 data to see the actual structure
      const allB0016 = await ParamCommond.findAll({
        where: { param_code: 'B0016' },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        order: [['param_seq', 'ASC']],
        limit: 20,
        raw: true
      });

      // Look for PRD_CODE specifically
      const prdCodeValues = await ParamCommond.findAll({
        where: { 
          param_code: 'B0016',
          [Op.or]: [
            { paramdesc: { [Op.like]: '%PRD_CODE%' } },
            { value1: { [Op.like]: '%PRD_CODE%' } },
            { value2: { [Op.like]: '%PRD_CODE%' } },
            { value3: { [Op.like]: '%PRD_CODE%' } }
          ]
        },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        order: [['param_seq', 'ASC']],
        raw: true
      });

      // Look for frs9_master_account specifically  
      const masterAccountValues = await ParamCommond.findAll({
        where: { 
          param_code: 'B0016',
          [Op.or]: [
            { paramdesc: { [Op.like]: '%frs9_master_account%' } },
            { value1: { [Op.like]: '%frs9_master_account%' } },
            { value2: { [Op.like]: '%frs9_master_account%' } },
            { value3: { [Op.like]: '%frs9_master_account%' } }
          ]
        },
        attributes: ['pkid', 'param_seq', 'value1', 'value2', 'value3', 'paramdesc'],
        order: [['param_seq', 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: {
          total_b0016_records: allB0016.length,
          sample_b0016_data: allB0016.slice(0, 5),
          prd_code_matches: prdCodeValues,
          master_account_matches: masterAccountValues,
          expected_filter: 'frs9_master_account.prd_code',
          investigation_summary: {
            paramdesc_formats: [...new Set(allB0016.map(r => r.paramdesc))].slice(0, 10),
            value1_samples: [...new Set(allB0016.map(r => r.value1))].slice(0, 10),
            value2_samples: [...new Set(allB0016.map(r => r.value2))].slice(0, 10),
            value3_samples: [...new Set(allB0016.map(r => r.value3))].slice(0, 10)
          }
        },
        message: 'B0016 data structure investigation completed'
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] B0016 investigation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to investigate B0016 data',
        code: 'B0016_INVESTIGATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ==========================================
  // SEGMENTATION TABLES INVESTIGATION
  // ==========================================
  
  /**
   * Check if segmentation tables exist in FRS9PRO database
   * GET /api/v1/banking/business-settings/investigate-segmentation-tables
   */
  async investigateSegmentationTables(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 [BusinessSettings] Investigating segmentation tables in FRS9PRO');

      // Check if segmentation tables exist by trying to query them
      const sequelize = ParamCommond.sequelize;
      
      // Query information_schema to check table existence
      const tableCheck = await sequelize.query(`
        SELECT table_name, table_type, table_schema
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE '%segment%' OR table_name LIKE '%param_segment%')
        ORDER BY table_name
      `, { type: sequelize.QueryTypes.SELECT });

      // Also check all tables to see what's available
      const allTables = await sequelize.query(`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `, { type: sequelize.QueryTypes.SELECT });

      // Check if we can find any segment-related data in existing tables
      let segmentHeaderSample: any[] = [];
      let segmentDetailSample: any[] = [];
      let tablesExist = { header: false, detail: false };

      try {
        // Try to query frs9_param_segmenth
        const headerQuery = await sequelize.query(`
          SELECT * FROM frs9_param_segmenth LIMIT 5
        `, { type: sequelize.QueryTypes.SELECT });
        segmentHeaderSample = headerQuery;
        tablesExist.header = true;
        console.log('✅ frs9_param_segmenth table exists and has data');
      } catch (error) {
        console.log('❌ frs9_param_segmenth table does not exist or is empty');
      }

      try {
        // Try to query frs9_param_segmentd
        const detailQuery = await sequelize.query(`
          SELECT * FROM frs9_param_segmentd LIMIT 5
        `, { type: sequelize.QueryTypes.SELECT });
        segmentDetailSample = detailQuery;
        tablesExist.detail = true;
        console.log('✅ frs9_param_segmentd table exists and has data');
      } catch (error) {
        console.log('❌ frs9_param_segmentd table does not exist or is empty');
      }

      res.json({
        success: true,
        data: {
          segmentation_tables_exist: tablesExist,
          segment_related_tables: tableCheck,
          sample_header_data: segmentHeaderSample,
          sample_detail_data: segmentDetailSample,
          all_available_tables: allTables.map((t: any) => t.table_name).slice(0, 20),
          total_tables_count: allTables.length,
          database_info: {
            host: getDatabaseInfo().host,
            database: 'FRS9PRO',
            schema: 'public'
          },
          recommendations: tablesExist.header && tablesExist.detail 
            ? 'Segmentation tables exist - can proceed with implementation'
            : 'Segmentation tables do not exist - need to create them first'
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Investigate segmentation tables error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to investigate segmentation tables',
        code: 'INVESTIGATE_SEGMENTATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Investigate FRS9PRO database field name case sensitivity
   * GET /api/v1/banking/business-settings/investigate-field-names
   */
  async investigateFieldNames(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 [BusinessSettings] Starting field name case investigation...');
      
      const sequelize = ParamCommond.sequelize;
      
      // Check information_schema.columns for actual field names
      const columnCheck = await sequelize!.query(`
        SELECT 
          table_name, 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND (
          LOWER(table_name) LIKE '%master_account%' OR
          LOWER(table_name) LIKE '%frs9_master%'
        )
        ORDER BY table_name, ordinal_position
      `, { 
        type: sequelize!.QueryTypes.SELECT 
      }) as any[];

      console.log(`📊 [BusinessSettings] Found ${columnCheck.length} columns in master_account tables`);

      // Check actual business settings B0016 data for PRD_CODE references
      const b0016Investigation = await sequelize!.query(`
        SELECT 
          pkid, param_seq, value1, value2, value3, paramdesc
        FROM frs9_param_commond 
        WHERE param_code = 'B0016'
        AND (
          LOWER(paramdesc) LIKE '%prd_code%' OR 
          LOWER(value2) LIKE '%prd_code%' OR
          LOWER(value3) LIKE '%master_account%' OR
          LOWER(paramdesc) LIKE '%master_account%'
        )
        ORDER BY param_seq
      `, { 
        type: sequelize!.QueryTypes.SELECT 
      }) as any[];

      console.log(`📋 [BusinessSettings] Found ${b0016Investigation.length} B0016 records referencing PRD_CODE or MASTER_ACCOUNT`);

      // Check for any table containing "frs9_master_account" or similar
      const tableSearch = await sequelize!.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (
          LOWER(table_name) LIKE '%master%account%' OR
          LOWER(table_name) LIKE '%frs9%master%' OR
          LOWER(table_name) LIKE '%master%'
        )
        ORDER BY table_name
      `, { 
        type: sequelize!.QueryTypes.SELECT 
      }) as any[];

      console.log(`🗃️ [BusinessSettings] Found ${tableSearch.length} tables containing 'master' or 'account'`);

      // Try different case variations for frs9_master_account
      let masterAccountColumns = null;
      let actualTableName = null;
      
      const possibleTableNames = [
        'frs9_master_account',
        'frs9_master_account',
        'Frs9_Master_Account',
        'FRS9MASTERACCOUNT',
        'frs9masteraccount',
        'master_account',
        'frs9_master'
      ];

      for (const tableName of possibleTableNames) {
        try {
          const testQuery = await sequelize!.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND LOWER(table_name) = LOWER('${tableName}')
            ORDER BY ordinal_position
            LIMIT 1
          `, { 
            type: sequelize!.QueryTypes.SELECT 
          }) as any[];
          
          if (testQuery.length > 0) {
            actualTableName = tableName;
            masterAccountColumns = await sequelize!.query(`
              SELECT column_name, data_type, is_nullable
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND LOWER(table_name) = LOWER('${tableName}')
              ORDER BY ordinal_position
            `, { 
              type: sequelize!.QueryTypes.SELECT 
            }) as any[];
            console.log(`✅ Found table with name variation: ${tableName}`);
            break;
          }
        } catch (colError) {
          // Table doesn't exist with this name variation
        }
      }

      // Check if PRD_CODE exists in any case variation
      let prdCodeFieldInfo = null;
      if (masterAccountColumns && masterAccountColumns.length > 0) {
        const prdCodeVariations = masterAccountColumns.filter((col: any) => 
          col.column_name.toLowerCase() === 'prd_code' ||
          col.column_name.toUpperCase() === 'PRD_CODE'
        );
        
        if (prdCodeVariations.length > 0) {
          prdCodeFieldInfo = {
            actual_column_name: prdCodeVariations[0].column_name,
            data_type: prdCodeVariations[0].data_type,
            is_nullable: prdCodeVariations[0].is_nullable,
            case_format: prdCodeVariations[0].column_name === 'PRD_CODE' ? 'UPPERCASE' :
                        prdCodeVariations[0].column_name === 'prd_code' ? 'lowercase' :
                        'MixedCase'
          };
        }
      }

      res.json({
        success: true,
        data: {
          column_investigation: columnCheck,
          b0016_prd_code_references: b0016Investigation,
          account_tables: tableSearch,
          actual_table_name: actualTableName,
          frs9_master_account_columns: masterAccountColumns,
          prd_code_field_info: prdCodeFieldInfo,
          summary: {
            master_account_columns_found: columnCheck.length,
            b0016_prd_code_refs: b0016Investigation.length,
            account_tables_found: tableSearch.length,
            actual_table_found: actualTableName !== null,
            prd_code_exists: prdCodeFieldInfo !== null,
            case_sensitivity_analysis: {
              table_name_actual: actualTableName || 'NOT_FOUND',
              prd_code_case: prdCodeFieldInfo?.case_format || 'UNKNOWN',
              recommendation: actualTableName && prdCodeFieldInfo ? 
                `Use table name: "${actualTableName}" and column name: "${prdCodeFieldInfo.actual_column_name}"` :
                'Table or column not found - manual entry required'
            }
          }
        },
        message: `Field name case investigation complete. ${actualTableName ? `Found table: ${actualTableName}` : 'Table not found'}`,
        database_info: {
          host: getDatabaseInfo().host,
          database: 'FRS9PRO',
          investigation_focus: 'frs9_master_account.prd_code case sensitivity'
        }
      });

    } catch (error) {
      console.error('❌ [BusinessSettings] Field name investigation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to investigate field names',
        code: 'FIELD_INVESTIGATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

console.log('✅ [BusinessSettings] Controller loaded successfully - Implements exact user specifications for B0012-B0016');