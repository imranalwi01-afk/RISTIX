// packages/backend/src/core/services/business-settings.service.ts
// ============================================================================
// 🔧 BUSINESS SETTINGS SERVICE - SEGMENTATION INTEGRATION
// ============================================================================
// ✅ PATTERN: Business Settings Integration for Dynamic Dropdowns
// ✅ DATABASE: FRS9PRO Business Settings (B0012-B0016)
// ✅ FEATURES: Table/Column lookup, Data type detection, Operator suggestions
// ============================================================================

import { Pool } from 'pg';
import { databaseConfig } from '../database/config/database.config';

// ============================================================================
// INTERFACES
// ============================================================================

interface TableInfo {
  table_name: string;
  table_description?: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  column_description?: string;
}

interface OperatorInfo {
  operator_code: string;
  operator_name: string;
  data_types: string[];
  requires_value2: boolean;
}

interface ConditionInfo {
  condition_code: string;
  condition_name: string;
}

interface ColumnValue {
  value: string;
  display_text?: string;
  count?: number;
}

interface SegmentType {
  type_code: string;
  type_name: string;
  description?: string;
}

// ============================================================================
// BUSINESS SETTINGS SERVICE CLASS
// ============================================================================

export class BusinessSettingsService {
  constructor() {
    console.log('✅ [BS-SERVICE-INIT] BusinessSettingsService initialized with real FRS9 database integration');
  }

  // Get FRS9 database connection
  private getFRS9Database(): Pool {
    return databaseConfig.getFRS9Connection();
  }

  // ============================================================================
  // B0012: TABLE NAMES
  // ============================================================================

  /**
   * Get table names from Business Setting B0012
   * Returns available database tables for segmentation rules
   */
  async getTableNames(): Promise<TableInfo[]> {
    try {
      console.log('🔍 [BS-SERVICE-001] Getting table names from Business Setting B0012');

      // Query business settings table for B0012 entries using FRS9 database
      const client = this.getFRS9Database();
      
      const query = `
        SELECT DISTINCT 
          pd.value1 as table_name,
          pd.value2 as table_description
        FROM frs9_param_commond pd
        INNER JOIN frs9_param_commonh ph ON pd.param_code = ph.param_code
        WHERE ph.param_code = 'B0012'
          AND ph.param_type = 'B'
          AND ph.is_active = true
          AND pd.value1 IS NOT NULL
        ORDER BY pd.value1
      `;

      const result = await client.query(query);
      const results = result.rows;
      
      // Fallback to commonly used IFRS9 tables if B0012 is not configured
      if (!results || results.length === 0) {
        console.log('⚠️ [BS-SERVICE-001] B0012 not configured, using default tables');
        return this.getDefaultTables();
      }

      const tables = results.map(row => ({
        table_name: row.table_name,
        table_description: row.table_description || row.table_name
      }));

      console.log(`✅ [BS-SERVICE-001] Retrieved ${tables.length} tables from B0012`);
      return tables;

    } catch (error) {
      console.error('❌ [BS-SERVICE-001] Failed to get table names:', error);
      
      // Return default tables as fallback
      console.log('🔄 [BS-SERVICE-001] Using default tables as fallback');
      return this.getDefaultTables();
    }
  }

  /**
   * Default tables used when B0012 is not configured
   */
  private getDefaultTables(): TableInfo[] {
    return [
      { table_name: 'portfolio_accounts', table_description: 'Portfolio Accounts' },
      { table_name: 'customers', table_description: 'Customer Information' },
      { table_name: 'products', table_description: 'Banking Products' },
      { table_name: 'transactions', table_description: 'Transaction History' },
      { table_name: 'credit_risk', table_description: 'Credit Risk Data' },
      { table_name: 'collateral', table_description: 'Collateral Information' },
      { table_name: 'financial_data', table_description: 'Financial Statements' }
    ];
  }

  // ============================================================================
  // B0013: COLUMN NAMES & DATA TYPES
  // ============================================================================

  /**
   * Get column names for a specific table from Business Setting B0013
   */
  async getColumnNames(tableName: string): Promise<ColumnInfo[]> {
    try {
      console.log(`🔍 [BS-SERVICE-002] Getting columns for table: ${tableName} from B0013`);

      const client = this.getFRS9Database();
      
      const query = `
        SELECT DISTINCT 
          pd.value1 as column_name,
          pd.value2 as data_type,
          pd.value3 as column_description
        FROM frs9_param_commond pd
        INNER JOIN frs9_param_commonh ph ON pd.param_code = ph.param_code
        WHERE ph.param_code = 'B0013'
          AND ph.param_type = 'B'
          AND ph.is_active = true
          AND pd.paramdesc = $1
          AND pd.value1 IS NOT NULL
        ORDER BY pd.value1
      `;

      const result = await client.query(query, [tableName]);
      const results = result.rows;

      // Fallback to introspecting actual table if B0013 is not configured
      if (!results || results.length === 0) {
        console.log(`⚠️ [BS-SERVICE-002] B0013 not configured for ${tableName}, using table introspection`);
        return await this.introspectTableColumns(tableName);
      }

      const columns = results.map((row: any) => ({
        column_name: row.column_name,
        data_type: row.data_type || 'VARCHAR',
        column_description: row.column_description || row.column_name
      }));

      console.log(`✅ [BS-SERVICE-002] Retrieved ${columns.length} columns for ${tableName}`);
      return columns;

    } catch (error) {
      console.error(`❌ [BS-SERVICE-002] Failed to get columns for ${tableName}:`, error);
      
      // Return fallback columns
      return await this.introspectTableColumns(tableName);
    }
  }

  /**
   * Get data type for a specific column from Business Setting B0013
   */
  async getDataType(tableName: string, columnName: string): Promise<string> {
    try {
      console.log(`🔍 [BS-SERVICE-003] Getting data type for ${tableName}.${columnName}`);

      const client = this.getFRS9Database();
      
      const query = `
        SELECT pd.value2 as data_type
        FROM frs9_param_commond pd
        INNER JOIN frs9_param_commonh ph ON pd.param_code = ph.param_code
        WHERE ph.param_code = 'B0013'
          AND ph.param_type = 'B'
          AND ph.is_active = true
          AND pd.paramdesc = $1
          AND pd.value1 = $2
        LIMIT 1
      `;

      const result = await client.query(query, [tableName, columnName]);
      const results = result.rows;

      if (results && results.length > 0) {
        const dataType = results[0].data_type;
        console.log(`✅ [BS-SERVICE-003] Data type for ${tableName}.${columnName}: ${dataType}`);
        return dataType;
      }

      // Fallback to introspecting actual column
      const dataType = await this.introspectColumnDataType(tableName, columnName);
      console.log(`🔄 [BS-SERVICE-003] Introspected data type: ${dataType}`);
      return dataType;

    } catch (error) {
      console.error(`❌ [BS-SERVICE-003] Failed to get data type for ${tableName}.${columnName}:`, error);
      return 'VARCHAR'; // Safe default
    }
  }

  /**
   * Introspect actual table columns when B0013 is not configured
   */
  private async introspectTableColumns(tableName: string): Promise<ColumnInfo[]> {
    try {
      const client = this.getFRS9Database();
      
      const query = `
        SELECT 
          column_name,
          CASE 
            WHEN data_type IN ('character varying', 'varchar', 'char', 'text') THEN 'VARCHAR'
            WHEN data_type IN ('integer', 'bigint', 'smallint') THEN 'NUMBER'
            WHEN data_type IN ('numeric', 'decimal', 'real', 'double precision') THEN 'NUMBER'
            WHEN data_type IN ('date', 'timestamp', 'timestamptz') THEN 'DATE'
            WHEN data_type = 'boolean' THEN 'BOOLEAN'
            ELSE 'VARCHAR'
          END as data_type
        FROM information_schema.columns
        WHERE table_name = $1
          AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      const result = await client.query(query, [tableName]);
      const results = result.rows;

      return results.map((row: any) => ({
        column_name: row.column_name,
        data_type: row.data_type,
        column_description: row.column_name
      }));

    } catch (error) {
      console.error(`❌ [BS-SERVICE-002] Failed to introspect table ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Introspect specific column data type
   */
  private async introspectColumnDataType(tableName: string, columnName: string): Promise<string> {
    try {
      const client = this.getFRS9Database();
      
      const query = `
        SELECT 
          CASE 
            WHEN data_type IN ('character varying', 'varchar', 'char', 'text') THEN 'VARCHAR'
            WHEN data_type IN ('integer', 'bigint', 'smallint') THEN 'NUMBER'
            WHEN data_type IN ('numeric', 'decimal', 'real', 'double precision') THEN 'NUMBER'
            WHEN data_type IN ('date', 'timestamp', 'timestamptz') THEN 'DATE'
            WHEN data_type = 'boolean' THEN 'BOOLEAN'
            ELSE 'VARCHAR'
          END as data_type
        FROM information_schema.columns
        WHERE table_name = $1
          AND column_name = $2
          AND table_schema = 'public'
        LIMIT 1
      `;

      const result = await client.query(query, [tableName, columnName]);
      const results = result.rows;

      if (results && results.length > 0) {
        return results[0].data_type;
      }

      return 'VARCHAR'; // Safe default

    } catch (error) {
      console.error(`❌ [BS-SERVICE-003] Failed to introspect column ${tableName}.${columnName}:`, error);
      return 'VARCHAR';
    }
  }

  // ============================================================================
  // B0014: OPERATORS
  // ============================================================================

  /**
   * Get operators for a specific data type from Business Setting B0014
   */
  async getOperators(dataType: string): Promise<OperatorInfo[]> {
    try {
      console.log(`🔍 [BS-SERVICE-004] Getting operators for data type: ${dataType} from B0014`);

      const client = this.getFRS9Database();
      
      const query = `
        SELECT 
          pd.value1 as operator_code,
          pd.value2 as operator_name,
          pd.value3 as requires_value2
        FROM frs9_param_commond pd
        INNER JOIN frs9_param_commonh ph ON pd.param_code = ph.param_code
        WHERE ph.param_code = 'B0014'
          AND ph.param_type = 'B'
          AND ph.is_active = true
          AND (pd.paramdesc = $1 OR pd.paramdesc = 'ALL')
        ORDER BY pd.value1
      `;

      const result = await client.query(query, [dataType.toUpperCase()]);
      const results = result.rows;

      // Fallback to default operators if B0014 is not configured
      if (!results || results.length === 0) {
        console.log(`⚠️ [BS-SERVICE-004] B0014 not configured for ${dataType}, using defaults`);
        return this.getDefaultOperators(dataType);
      }

      const operators = results.map((row: any) => ({
        operator_code: row.operator_code,
        operator_name: row.operator_name || row.operator_code,
        data_types: [dataType],
        requires_value2: row.requires_value2 === 'true' || row.requires_value2 === '1'
      }));

      console.log(`✅ [BS-SERVICE-004] Retrieved ${operators.length} operators for ${dataType}`);
      return operators;

    } catch (error) {
      console.error(`❌ [BS-SERVICE-004] Failed to get operators for ${dataType}:`, error);
      return this.getDefaultOperators(dataType);
    }
  }

  /**
   * Default operators when B0014 is not configured
   */
  private getDefaultOperators(dataType: string): OperatorInfo[] {
    const operators: Record<string, OperatorInfo[]> = {
      VARCHAR: [
        { operator_code: '=', operator_name: 'Equals', data_types: ['VARCHAR'], requires_value2: false },
        { operator_code: '<>', operator_name: 'Not Equals', data_types: ['VARCHAR'], requires_value2: false },
        { operator_code: 'LIKE', operator_name: 'Like', data_types: ['VARCHAR'], requires_value2: false },
        { operator_code: 'NOT LIKE', operator_name: 'Not Like', data_types: ['VARCHAR'], requires_value2: false },
        { operator_code: 'IN', operator_name: 'In List', data_types: ['VARCHAR'], requires_value2: false },
        { operator_code: 'NOT IN', operator_name: 'Not In List', data_types: ['VARCHAR'], requires_value2: false }
      ],
      NUMBER: [
        { operator_code: '=', operator_name: 'Equals', data_types: ['NUMBER'], requires_value2: false },
        { operator_code: '>', operator_name: 'Greater Than', data_types: ['NUMBER'], requires_value2: false },
        { operator_code: '<', operator_name: 'Less Than', data_types: ['NUMBER'], requires_value2: false },
        { operator_code: '>=', operator_name: 'Greater Than or Equal', data_types: ['NUMBER'], requires_value2: false },
        { operator_code: '<=', operator_name: 'Less Than or Equal', data_types: ['NUMBER'], requires_value2: false },
        { operator_code: '<>', operator_name: 'Not Equals', data_types: ['NUMBER'], requires_value2: false },
        { operator_code: 'BETWEEN', operator_name: 'Between', data_types: ['NUMBER'], requires_value2: true },
        { operator_code: 'IN', operator_name: 'In List', data_types: ['NUMBER'], requires_value2: false }
      ],
      DATE: [
        { operator_code: '=', operator_name: 'Equals', data_types: ['DATE'], requires_value2: false },
        { operator_code: '>', operator_name: 'After', data_types: ['DATE'], requires_value2: false },
        { operator_code: '<', operator_name: 'Before', data_types: ['DATE'], requires_value2: false },
        { operator_code: '>=', operator_name: 'On or After', data_types: ['DATE'], requires_value2: false },
        { operator_code: '<=', operator_name: 'On or Before', data_types: ['DATE'], requires_value2: false },
        { operator_code: 'BETWEEN', operator_name: 'Between Dates', data_types: ['DATE'], requires_value2: true }
      ],
      BOOLEAN: [
        { operator_code: '=', operator_name: 'Equals', data_types: ['BOOLEAN'], requires_value2: false }
      ]
    };

    return operators[dataType.toUpperCase()] || operators.VARCHAR;
  }

  // ============================================================================
  // B0015: CONDITIONS
  // ============================================================================

  /**
   * Get condition options (AND/OR) from Business Setting B0015
   */
  async getConditions(): Promise<ConditionInfo[]> {
    try {
      console.log('🔍 [BS-SERVICE-005] Getting conditions from Business Setting B0015');

      const client = this.getFRS9Database();
      
      const query = `
        SELECT 
          pd.value1 as condition_code,
          pd.value2 as condition_name
        FROM frs9_param_commond pd
        INNER JOIN frs9_param_commonh ph ON pd.param_code = ph.param_code
        WHERE ph.param_code = 'B0015'
          AND ph.param_type = 'B'
          AND ph.is_active = true
        ORDER BY pd.value1
      `;

      const result = await client.query(query);
      const results = result.rows;

      // Fallback to default conditions if B0015 is not configured
      if (!results || results.length === 0) {
        console.log('⚠️ [BS-SERVICE-005] B0015 not configured, using default conditions');
        return this.getDefaultConditions();
      }

      const conditions = results.map((row: any) => ({
        condition_code: row.condition_code,
        condition_name: row.condition_name || row.condition_code
      }));

      console.log(`✅ [BS-SERVICE-005] Retrieved ${conditions.length} conditions from B0015`);
      return conditions;

    } catch (error) {
      console.error('❌ [BS-SERVICE-005] Failed to get conditions:', error);
      return this.getDefaultConditions();
    }
  }

  /**
   * Default conditions when B0015 is not configured
   */
  private getDefaultConditions(): ConditionInfo[] {
    return [
      { condition_code: 'AND', condition_name: 'AND' },
      { condition_code: 'OR', condition_name: 'OR' }
    ];
  }

  // ============================================================================
  // B0016: COLUMN VALUES
  // ============================================================================

  /**
   * Get distinct values for IN/NOT IN operators from Business Setting B0016
   */
  async getColumnValues(tableName: string, columnName: string): Promise<ColumnValue[]> {
    try {
      console.log(`🔍 [BS-SERVICE-006] Getting column values for ${tableName}.${columnName} from B0016`);

      const client = this.getFRS9Database();
      
      // First try to get values from B0016 configuration
      const configQuery = `
        SELECT 
          pd.value1 as value,
          pd.value2 as display_text
        FROM frs9_param_commond pd
        INNER JOIN frs9_param_commonh ph ON pd.param_code = ph.param_code
        WHERE ph.param_code = 'B0016'
          AND ph.param_type = 'B'
          AND ph.is_active = true
          AND pd.paramdesc = $1
        ORDER BY pd.value1
      `;

      const configResult = await client.query(configQuery, [`${tableName}.${columnName}`]);
      const configResults = configResult.rows;

      if (configResults && configResults.length > 0) {
        const values = configResults.map((row: any) => ({
          value: row.value,
          display_text: row.display_text || row.value
        }));

        console.log(`✅ [BS-SERVICE-006] Retrieved ${values.length} configured values for ${tableName}.${columnName}`);
        return values;
      }

      // Fallback to querying actual table for distinct values
      console.log(`⚠️ [BS-SERVICE-006] No B0016 config found, querying actual table ${tableName}`);
      return await this.queryActualColumnValues(tableName, columnName);

    } catch (error) {
      console.error(`❌ [BS-SERVICE-006] Failed to get column values for ${tableName}.${columnName}:`, error);
      console.log(`🔄 [BS-SERVICE-006] Attempting fallback to actual table query for ${tableName}.${columnName}`);
      return await this.queryActualColumnValues(tableName, columnName);
    }
  }

  /**
   * Query actual table for distinct column values
   */
  private async queryActualColumnValues(tableName: string, columnName: string): Promise<ColumnValue[]> {
    try {
      const client = this.getFRS9Database();
      
      // First check if table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        ) as exists
      `;
      
      const tableExistsResult = await client.query(tableExistsQuery, [tableName.toLowerCase()]);
      
      if (!tableExistsResult.rows[0]?.exists) {
        console.log(`⚠️ [BS-SERVICE-006] Table ${tableName} does not exist, using fallback values`);
        return this.getFallbackColumnValues(tableName, columnName);
      }

      // Check if column exists in table
      const columnExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1 
          AND column_name = $2
        ) as exists
      `;
      
      const columnExistsResult = await client.query(columnExistsQuery, [tableName.toLowerCase(), columnName.toLowerCase()]);
      
      if (!columnExistsResult.rows[0]?.exists) {
        console.log(`⚠️ [BS-SERVICE-006] Column ${columnName} does not exist in ${tableName}, using fallback values`);
        return this.getFallbackColumnValues(tableName, columnName);
      }
      
      // Query actual table for distinct values 
      // Handle comma-separated values in existing data (like 'HE,KPR,CF,TNH')
      const query = `
        SELECT 
          DISTINCT TRIM(unnest(string_to_array(${columnName}, ','))) as value,
          COUNT(*) as count
        FROM ${tableName}
        WHERE ${columnName} IS NOT NULL AND ${columnName} != ''
        GROUP BY TRIM(unnest(string_to_array(${columnName}, ',')))
        HAVING TRIM(unnest(string_to_array(${columnName}, ','))) != ''
        ORDER BY count DESC, value
        LIMIT 100
      `;

      console.log(`📊 [BS-SERVICE-006] Executing query: ${query}`);
      const result = await client.query(query);
      const results = result.rows;

      if (!results || results.length === 0) {
        console.log(`⚠️ [BS-SERVICE-006] No data found in ${tableName}.${columnName}, using fallback values`);
        return this.getFallbackColumnValues(tableName, columnName);
      }

      const values = results.map((row: any) => ({
        value: String(row.value),
        display_text: String(row.value),
        count: parseInt(row.count) || 0
      }));

      console.log(`✅ [BS-SERVICE-006] Retrieved ${values.length} actual values from ${tableName}.${columnName}`);
      return values;

    } catch (error) {
      console.error(`❌ [BS-SERVICE-006] Failed to query actual values from ${tableName}.${columnName}:`, error);
      console.log(`🔄 [BS-SERVICE-006] Using fallback values for ${tableName}.${columnName}`);
      return this.getFallbackColumnValues(tableName, columnName);
    }
  }

  /**
   * Get fallback column values when actual table/column doesn't exist or has no data
   */
  private getFallbackColumnValues(tableName: string, columnName: string): ColumnValue[] {
    // Common banking column values for frequently used columns
    const fallbackValues: Record<string, Record<string, ColumnValue[]>> = {
      'portfolio_accounts': {
        'product_type': [
          { value: 'MORTGAGE', display_text: 'Mortgage Loan' },
          { value: 'PERSONAL_LOAN', display_text: 'Personal Loan' },
          { value: 'CREDIT_CARD', display_text: 'Credit Card' },
          { value: 'CORPORATE_LOAN', display_text: 'Corporate Loan' },
          { value: 'SME_LOAN', display_text: 'SME Loan' }
        ],
        'current_stage': [
          { value: '1', display_text: 'Stage 1 (12-month ECL)' },
          { value: '2', display_text: 'Stage 2 (Lifetime ECL)' },
          { value: '3', display_text: 'Stage 3 (Credit Impaired)' }
        ],
        'currency': [
          { value: 'IDR', display_text: 'Indonesian Rupiah' },
          { value: 'USD', display_text: 'US Dollar' },
          { value: 'EUR', display_text: 'Euro' }
        ]
      },
      'frs9_master_account': {
        'prd_code': [
          { value: 'HE', display_text: 'Home Equity' },
          { value: 'KPR', display_text: 'Kredit Pemilikan Rumah' },
          { value: 'CF', display_text: 'Cash Flow' },
          { value: 'TNH', display_text: 'Tanah' }
        ],
        'data_source': [
          { value: 'Lending', display_text: 'Lending System' },
          { value: 'Core System', display_text: 'Core Banking System' },
          { value: 'Treasury', display_text: 'Treasury System' },
          { value: 'Factoring', display_text: 'Factoring System' }
        ],
        'account_status': [
          { value: 'A', display_text: 'Active' },
          { value: 'R', display_text: 'Restructured' }
        ],
        'ext_rating_agency': [
          { value: 'PEFINDO', display_text: 'PEFINDO' },
          { value: 'FITCH', display_text: 'FITCH' },
          { value: 'S&P', display_text: 'Standard & Poor\'s' },
          { value: 'MOODYS', display_text: 'Moody\'s' }
        ]
      },
      'customers': {
        'customer_type': [
          { value: 'INDIVIDUAL', display_text: 'Individual Customer' },
          { value: 'CORPORATE', display_text: 'Corporate Customer' },
          { value: 'SME', display_text: 'Small Medium Enterprise' },
          { value: 'GOVERNMENT', display_text: 'Government Entity' }
        ],
        'risk_rating': [
          { value: 'LOW', display_text: 'Low Risk' },
          { value: 'MEDIUM', display_text: 'Medium Risk' },
          { value: 'HIGH', display_text: 'High Risk' }
        ]
      }
    };

    const tableKey = tableName.toLowerCase();
    const columnKey = columnName.toLowerCase();
    
    if (fallbackValues[tableKey] && fallbackValues[tableKey][columnKey]) {
      console.log(`📝 [BS-SERVICE-006] Using predefined fallback values for ${tableName}.${columnName}`);
      return fallbackValues[tableKey][columnKey];
    }

    // Generic fallback for unknown columns
    console.log(`📝 [BS-SERVICE-006] Using generic fallback values for ${tableName}.${columnName}`);
    return [
      { value: 'VALUE_1', display_text: 'Sample Value 1' },
      { value: 'VALUE_2', display_text: 'Sample Value 2' },
      { value: 'VALUE_3', display_text: 'Sample Value 3' }
    ];
  }

  // ============================================================================
  // SEGMENT TYPES
  // ============================================================================

  /**
   * Get segment type options for header dropdown
   */
  async getSegmentTypes(): Promise<SegmentType[]> {
    try {
      console.log('🔍 [BS-SERVICE-007] Getting segment types');

      // Could be configured in business settings, for now using defaults
      return this.getDefaultSegmentTypes();

    } catch (error) {
      console.error('❌ [BS-SERVICE-007] Failed to get segment types:', error);
      return this.getDefaultSegmentTypes();
    }
  }

  /**
   * Default segment types - matching legacy FRS9PRO database values
   */
  private getDefaultSegmentTypes(): SegmentType[] {
    return [
      { type_code: 'PD', type_name: 'PD (Probability of Default)', description: 'IFRS 9 Probability of Default risk component segmentation' },
      { type_code: 'LGD', type_name: 'LGD (Loss Given Default)', description: 'IFRS 9 Loss Given Default risk component segmentation' },
      { type_code: 'EAD', type_name: 'EAD (Exposure at Default)', description: 'IFRS 9 Exposure at Default risk component segmentation' },
      { type_code: 'PF', type_name: 'PF (Portfolio Factor)', description: 'Portfolio or Portfolio Factor segmentation classification' }
    ];
  }
}

// Export singleton instance
export const businessSettingsService = new BusinessSettingsService();