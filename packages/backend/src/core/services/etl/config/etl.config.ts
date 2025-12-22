// packages/backend/src/core/services/etl/config/etl.config.ts

export const ETL_CONFIG = {
  // Queue configuration
  maxConcurrentJobs: parseInt(process.env.ETL_MAX_CONCURRENT_JOBS || '5'),
  retryAttempts: parseInt(process.env.ETL_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.ETL_RETRY_DELAY || '2000'),
  jobTimeout: parseInt(process.env.ETL_JOB_TIMEOUT || '300000'), // 5 minutes

  // Data processing limits
  maxRecordsPerBatch: parseInt(process.env.ETL_MAX_RECORDS_PER_BATCH || '10000'),
  maxFileSize: parseInt(process.env.ETL_MAX_FILE_SIZE || '100'), // MB
  allowedFileTypes: (process.env.ETL_ALLOWED_FILE_TYPES || 'csv,xlsx,json').split(','),

  // Validation configuration
  enableDataQuality: process.env.ETL_ENABLE_DATA_QUALITY !== 'false',
  qualityThreshold: parseFloat(process.env.ETL_QUALITY_THRESHOLD || '95.0'),
  
  // Performance settings
  enableMetrics: process.env.ETL_ENABLE_METRICS !== 'false',
  metricsInterval: parseInt(process.env.ETL_METRICS_INTERVAL || '30000'), // 30 seconds
  
  // Storage configuration
  tempDirectory: process.env.ETL_TEMP_DIR || '/tmp/etl',
  uploadDirectory: process.env.ETL_UPLOAD_DIR || '/uploads/etl',
  archiveDirectory: process.env.ETL_ARCHIVE_DIR || '/archive/etl',
  
  // Database configuration
  enableTransactions: process.env.ETL_ENABLE_TRANSACTIONS !== 'false',
  transactionTimeout: parseInt(process.env.ETL_TRANSACTION_TIMEOUT || '60000'), // 1 minute
  
  // Monitoring and logging
  logLevel: process.env.ETL_LOG_LEVEL || 'info',
  enableAuditTrail: process.env.ETL_ENABLE_AUDIT_TRAIL !== 'false',
  
  // Node types configuration
  nodeTypes: {
    source: {
      supportedTypes: ['database', 'file', 'api', 'stream'],
      maxConnections: 5,
      timeout: 30000
    },
    transform: {
      supportedOperations: ['add_column', 'remove_column', 'rename_column', 'format_currency', 'calculate_age'],
      maxTransformations: 50
    },
    filter: {
      supportedOperators: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'is_null', 'is_not_null'],
      maxConditions: 20
    },
    aggregate: {
      supportedFunctions: ['count', 'sum', 'avg', 'min', 'max', 'first', 'last'],
      maxGroupByFields: 10
    },
    join: {
      supportedTypes: ['inner', 'left', 'right', 'full'],
      maxDatasets: 5
    },
    validate: {
      supportedRules: ['required', 'numeric', 'string', 'enum', 'date', 'email'],
      maxRules: 100
    },
    output: {
      supportedTypes: ['database', 'file', 'api'],
      writeModes: ['insert', 'update', 'upsert', 'replace']
    }
  },

  // Error handling
  errorHandling: {
    onValidationError: process.env.ETL_ON_VALIDATION_ERROR || 'stop', // stop, skip, log
    onTransformError: process.env.ETL_ON_TRANSFORM_ERROR || 'skip',
    onOutputError: process.env.ETL_ON_OUTPUT_ERROR || 'stop',
    maxErrorsPerNode: parseInt(process.env.ETL_MAX_ERRORS_PER_NODE || '100')
  },

  // Schema evolution
  schemaEvolution: {
    enableAutoDetection: process.env.ETL_ENABLE_SCHEMA_AUTO_DETECTION !== 'false',
    enableValidation: process.env.ETL_ENABLE_SCHEMA_VALIDATION !== 'false',
    strictMode: process.env.ETL_SCHEMA_STRICT_MODE === 'true'
  },

  // Data lineage
  dataLineage: {
    enableTracking: process.env.ETL_ENABLE_DATA_LINEAGE !== 'false',
    maxLineageDepth: parseInt(process.env.ETL_MAX_LINEAGE_DEPTH || '10'),
    enableImpactAnalysis: process.env.ETL_ENABLE_IMPACT_ANALYSIS !== 'false'
  }
};

// Default quality rules for different data types
export const DEFAULT_QUALITY_RULES = {
  banking: [
    {
      id: 'banking_account_id_required',
      name: 'Account ID Required',
      ruleType: 'completeness' as const,
      ruleDefinition: {
        targetField: 'account_id',
        condition: 'account_id != null AND account_id != ""'
      },
      severity: 'critical' as const,
      isActive: true
    },
    {
      id: 'banking_amount_valid',
      name: 'Amount Must Be Numeric',
      ruleType: 'validity' as const,
      ruleDefinition: {
        targetField: 'amount',
        condition: 'range:0,999999999'
      },
      severity: 'error' as const,
      isActive: true
    },
    {
      id: 'banking_currency_valid',
      name: 'Currency Code Valid',
      ruleType: 'validity' as const,
      ruleDefinition: {
        targetField: 'currency',
        condition: 'enum:IDR,USD,EUR,SGD,MYR'
      },
      severity: 'warning' as const,
      isActive: true
    },
    {
      id: 'banking_date_timeliness',
      name: 'Transaction Date Timeliness',
      ruleType: 'timeliness' as const,
      ruleDefinition: {
        targetField: 'transaction_date',
        condition: '90 days_ago'
      },
      severity: 'warning' as const,
      isActive: true
    }
  ],
  
  ifrs9: [
    {
      id: 'ifrs9_stage_valid',
      name: 'IFRS9 Stage Valid',
      ruleType: 'validity' as const,
      ruleDefinition: {
        targetField: 'current_stage',
        condition: 'enum:1,2,3'
      },
      severity: 'critical' as const,
      isActive: true
    },
    {
      id: 'ifrs9_pd_range',
      name: 'PD Within Valid Range',
      ruleType: 'validity' as const,
      ruleDefinition: {
        targetField: 'pd_12_month',
        condition: 'range:0,1'
      },
      severity: 'error' as const,
      isActive: true
    },
    {
      id: 'ifrs9_lgd_range',
      name: 'LGD Within Valid Range',
      ruleType: 'validity' as const,
      ruleDefinition: {
        targetField: 'lgd',
        condition: 'range:0,1'
      },
      severity: 'error' as const,
      isActive: true
    },
    {
      id: 'ifrs9_ead_positive',
      name: 'EAD Must Be Positive',
      ruleType: 'validity' as const,
      ruleDefinition: {
        targetField: 'ead',
        condition: 'range:0,999999999999'
      },
      severity: 'error' as const,
      isActive: true
    }
  ]
};

// Template workflow definitions
export const WORKFLOW_TEMPLATES = {
  banking_data_import: {
    name: 'Banking Data Import',
    description: 'Standard template for importing banking transaction data',
    nodes: [
      {
        id: 'source_1',
        type: 'source' as const,
        label: 'Data Source',
        position: { x: 100, y: 100 },
        config: {
          sourceType: 'file',
          fileType: 'csv',
          hasHeader: true,
          delimiter: ',',
          qualityRules: DEFAULT_QUALITY_RULES.banking
        }
      },
      {
        id: 'validate_1',
        type: 'validate' as const,
        label: 'Data Validation',
        position: { x: 300, y: 100 },
        config: {
          rules: [
            { field: 'account_id', type: 'required' },
            { field: 'amount', type: 'numeric', min: 0 },
            { field: 'transaction_date', type: 'date' }
          ],
          includeInvalid: false
        }
      },
      {
        id: 'transform_1',
        type: 'transform' as const,
        label: 'Data Transformation',
        position: { x: 500, y: 100 },
        config: {
          transformations: [
            {
              type: 'format_currency',
              field: 'amount',
              currency: 'IDR'
            },
            {
              type: 'add_column',
              name: 'processed_date',
              expression: 'new Date().toISOString()'
            }
          ]
        }
      },
      {
        id: 'output_1',
        type: 'output' as const,
        label: 'Database Output',
        position: { x: 700, y: 100 },
        config: {
          outputType: 'database',
          table: 'banking_transactions',
          writeMode: 'insert'
        }
      }
    ],
    connections: [
      { id: 'conn_1', source: 'source_1', target: 'validate_1' },
      { id: 'conn_2', source: 'validate_1', target: 'transform_1' },
      { id: 'conn_3', source: 'transform_1', target: 'output_1' }
    ],
    settings: {
      parallelExecution: false,
      errorHandling: 'stop' as const,
      retryPolicy: {
        maxAttempts: 3,
        backoffStrategy: 'exponential' as const,
        initialDelay: 1000,
        maxDelay: 10000
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000,
        alertThresholds: {
          errorRate: 5,
          latency: 30000,
          memoryUsage: 80
        }
      }
    }
  },

  ifrs9_calculation_pipeline: {
    name: 'IFRS9 Calculation Pipeline',
    description: 'Template for IFRS9 ECL calculation data processing',
    nodes: [
      {
        id: 'source_portfolio',
        type: 'source' as const,
        label: 'Portfolio Data',
        position: { x: 100, y: 100 },
        config: {
          sourceType: 'database',
          query: 'SELECT * FROM core.portfolio_accounts WHERE is_active = true',
          qualityRules: DEFAULT_QUALITY_RULES.ifrs9
        }
      },
      {
        id: 'validate_ifrs9',
        type: 'validate' as const,
        label: 'IFRS9 Validation',
        position: { x: 300, y: 100 },
        config: {
          rules: [
            { field: 'account_id', type: 'required' },
            { field: 'outstanding_amount', type: 'numeric', min: 0 },
            { field: 'current_stage', type: 'enum', values: [1, 2, 3] }
          ]
        }
      },
      {
        id: 'transform_staging',
        type: 'transform' as const,
        label: 'Staging Calculation',
        position: { x: 500, y: 50 },
        config: {
          transformations: [
            {
              type: 'add_column',
              name: 'requires_lifetime_ecl',
              expression: 'current_stage >= 2'
            }
          ]
        }
      },
      {
        id: 'transform_ecl',
        type: 'transform' as const,
        label: 'ECL Calculation',
        position: { x: 500, y: 150 },
        config: {
          transformations: [
            {
              type: 'add_column',
              name: 'final_ecl',
              expression: 'requires_lifetime_ecl ? ecl_lifetime : ecl_12_month'
            }
          ]
        }
      },
      {
        id: 'output_results',
        type: 'output' as const,
        label: 'ECL Results',
        position: { x: 700, y: 100 },
        config: {
          outputType: 'database',
          table: 'ifrs9_calculations.ecl_results',
          writeMode: 'upsert',
          keyColumns: ['account_id', 'calculation_date']
        }
      }
    ],
    connections: [
      { id: 'conn_1', source: 'source_portfolio', target: 'validate_ifrs9' },
      { id: 'conn_2', source: 'validate_ifrs9', target: 'transform_staging' },
      { id: 'conn_3', source: 'transform_staging', target: 'transform_ecl' },
      { id: 'conn_4', source: 'transform_ecl', target: 'output_results' }
    ],
    settings: {
      parallelExecution: true,
      errorHandling: 'skip' as const,
      retryPolicy: {
        maxAttempts: 5,
        backoffStrategy: 'exponential' as const,
        initialDelay: 2000,
        maxDelay: 30000
      },
      monitoring: {
        enabled: true,
        metricsInterval: 15000,
        alertThresholds: {
          errorRate: 2,
          latency: 60000,
          memoryUsage: 90
        }
      }
    }
  }
};