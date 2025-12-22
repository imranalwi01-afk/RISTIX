// packages/r-analytics/src/services/r-executor.service.js
// R Script Execution Service

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'r-executor' },
  transports: [
    new winston.transports.File({ filename: './logs/r-executor.log' }),
    new winston.transports.Console()
  ]
});

class RExecutorService {
  constructor() {
    this.scriptsPath = path.join(__dirname, '../../scripts');
    this.tempPath = path.join(__dirname, '../../temp');
    this.ensureTempDirectory();
  }

  ensureTempDirectory() {
    if (!fs.existsSync(this.tempPath)) {
      fs.mkdirSync(this.tempPath, { recursive: true });
    }
  }

  /**
   * Execute R script with data and parameters
   * @param {string} scriptName - Name of R script to execute
   * @param {Object} data - Input data for R script
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - R script execution results
   */
  async executeScript(scriptName, data = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const scriptPath = path.join(this.scriptsPath, scriptName);
      
      // Validate script exists
      if (!fs.existsSync(scriptPath)) {
        return reject(new Error(`R script not found: ${scriptPath}`));
      }

      // Prepare execution options
      const execOptions = {
        timeout: options.timeout || 300000, // 5 minutes default
        maxBuffer: options.maxBuffer || 50 * 1024 * 1024, // 50MB default
        cwd: path.join(__dirname, '../..'),
        ...options.spawnOptions
      };

      // Create temporary data file if needed
      let tempDataFile = null;
      if (Object.keys(data).length > 0) {
        tempDataFile = path.join(this.tempPath, `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`);
        fs.writeFileSync(tempDataFile, JSON.stringify(data));
      }

      // Prepare R command
      const rArgs = ['--vanilla', '--quiet'];
      if (options.source) {
        rArgs.push('--source', scriptPath);
      }

      // Create R script execution wrapper
      const rScript = this.createScriptWrapper(scriptPath, tempDataFile, options);
      
      logger.info(`Executing R script: ${scriptName}`, {
        scriptPath,
        dataFile: tempDataFile,
        options: execOptions
      });

      // Execute R process
      const rProcess = spawn('R', rArgs, execOptions);
      
      let output = '';
      let errorOutput = '';

      // Collect output
      rProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      rProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Handle process completion
      rProcess.on('close', (code) => {
        const executionTime = Date.now() - startTime;
        
        // Clean up temporary files
        if (tempDataFile && fs.existsSync(tempDataFile)) {
          fs.unlinkSync(tempDataFile);
        }

        if (code === 0) {
          try {
            // Parse R output
            const result = this.parseROutput(output);
            
            logger.info(`R script execution completed successfully`, {
              scriptName,
              executionTime,
              outputLength: output.length
            });

            resolve({
              success: true,
              result,
              execution_time: executionTime,
              output: output.trim(),
              timestamp: new Date().toISOString()
            });
            
          } catch (parseError) {
            logger.error(`Failed to parse R output`, {
              scriptName,
              parseError: parseError.message,
              output: output.substring(0, 1000) // First 1000 chars for debugging
            });

            reject(new Error(`Failed to parse R output: ${parseError.message}`));
          }
        } else {
          logger.error(`R script execution failed`, {
            scriptName,
            exitCode: code,
            errorOutput,
            executionTime
          });

          reject(new Error(`R script failed with exit code ${code}: ${errorOutput}`));
        }
      });

      // Handle process errors
      rProcess.on('error', (error) => {
        logger.error(`R process error`, {
          scriptName,
          error: error.message
        });

        // Clean up temporary files
        if (tempDataFile && fs.existsSync(tempDataFile)) {
          fs.unlinkSync(tempDataFile);
        }

        reject(new Error(`R process error: ${error.message}`));
      });

      // Send script to R process
      rProcess.stdin.write(rScript);
      rProcess.stdin.end();
    });
  }

  /**
   * Create R script wrapper with error handling and data loading
   * @param {string} scriptPath - Path to main R script
   * @param {string} dataFile - Path to temporary data file
   * @param {Object} options - Execution options
   * @returns {string} - Complete R script
   */
  createScriptWrapper(scriptPath, dataFile, options = {}) {
    const includes = options.includes || [];
    const libraries = options.libraries || ['jsonlite'];

    return `
      # R Script Execution Wrapper
      options(warn = -1)  # Suppress warnings
      
      # Error handling
      tryCatch({
        # Load required libraries
        ${libraries.map(lib => `library(${lib})`).join('\n        ')}
        
        # Load includes
        ${includes.map(inc => `source('${inc}')`).join('\n        ')}
        
        # Load input data if provided
        ${dataFile ? `
        input_data <- fromJSON('${dataFile}')
        ` : 'input_data <- list()'}
        
        # Execute main script
        source('${scriptPath}')
        
      }, error = function(e) {
        # Output error in JSON format
        error_result <- list(
          success = FALSE,
          error = e$message,
          timestamp = Sys.time()
        )
        cat(toJSON(error_result, auto_unbox = TRUE))
        quit(status = 1)
      })
    `;
  }

  /**
   * Parse R script output to extract JSON results
   * @param {string} output - Raw R output
   * @returns {Object} - Parsed results
   */
  parseROutput(output) {
    // Clean output - remove R console messages
    const lines = output.split('\n');
    let jsonLines = [];
    let inJsonBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and R console output
      if (!trimmed || trimmed.startsWith('>') || trimmed.startsWith('+')) {
        continue;
      }
      
      // Detect JSON start
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        inJsonBlock = true;
      }
      
      if (inJsonBlock) {
        jsonLines.push(trimmed);
      }
      
      // Detect JSON end
      if (trimmed.endsWith('}') || trimmed.endsWith(']')) {
        break;
      }
    }

    if (jsonLines.length === 0) {
      throw new Error('No JSON output found in R script results');
    }

    const jsonOutput = jsonLines.join('');
    return JSON.parse(jsonOutput);
  }

  /**
   * Execute ECL calculation with portfolio data
   * @param {Array} portfolioData - Portfolio data array
   * @param {Object} parameters - Calculation parameters
   * @returns {Promise<Object>} - ECL calculation results
   */
  async calculateECL(portfolioData, parameters = {}) {
    return this.executeScript('ecl/basic_ecl_calculator.R', {
      portfolio_data: portfolioData,
      parameters
    }, {
      libraries: ['jsonlite', 'dplyr', 'survival'],
      timeout: 600000 // 10 minutes for ECL calculations
    });
  }

  /**
   * Execute stress test calculations
   * @param {Array} portfolioData - Portfolio data array
   * @param {Array} scenarios - Stress test scenarios
   * @param {Object} parameters - Calculation parameters
   * @returns {Promise<Object>} - Stress test results
   */
  async executeStressTest(portfolioData, scenarios, parameters = {}) {
    return this.executeScript('ecl/stress_test_calculator.R', {
      portfolio_data: portfolioData,
      stress_scenarios: scenarios,
      parameters
    }, {
      libraries: ['jsonlite', 'dplyr', 'survival', 'forecast'],
      timeout: 900000 // 15 minutes for stress tests
    });
  }

  /**
   * Validate data format for R processing
   * @param {Array|Object} data - Data to validate
   * @returns {Promise<Object>} - Validation results
   */
  async validateData(data) {
    return this.executeScript('utilities/data_validator.R', {
      data_to_validate: data
    }, {
      libraries: ['jsonlite', 'dplyr'],
      timeout: 30000 // 30 seconds for validation
    });
  }

  /**
   * Get R service health status
   * @returns {Promise<Object>} - Health status
   */
  async getHealthStatus() {
    return this.executeScript('utilities/health_check.R', {}, {
      libraries: ['jsonlite'],
      timeout: 10000 // 10 seconds for health check
    });
  }
}

module.exports = RExecutorService;

// packages/r-analytics/src/utils/data-converter.js
// Data conversion utilities for R integration

class DataConverter {
  /**
   * Convert JavaScript array to R data frame format
   * @param {Array} data - JavaScript array of objects
   * @returns {Object} - R-compatible data structure
   */
  static toRDataFrame(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { columns: {}, nrows: 0 };
    }

    // Get all unique column names
    const allColumns = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(col => allColumns.add(col));
    });

    // Convert to column-wise structure
    const columns = {};
    for (const col of allColumns) {
      columns[col] = data.map(row => row[col] !== undefined ? row[col] : null);
    }

    return {
      columns,
      nrows: data.length
    };
  }

  /**
   * Convert R data frame format to JavaScript array
   * @param {Object} rDataFrame - R data frame structure
   * @returns {Array} - JavaScript array of objects
   */
  static fromRDataFrame(rDataFrame) {
    if (!rDataFrame.columns || rDataFrame.nrows === 0) {
      return [];
    }

    const result = [];
    const columnNames = Object.keys(rDataFrame.columns);
    
    for (let i = 0; i < rDataFrame.nrows; i++) {
      const row = {};
      columnNames.forEach(col => {
        row[col] = rDataFrame.columns[col][i];
      });
      result.push(row);
    }

    return result;
  }

  /**
   * Validate data structure for R processing
   * @param {*} data - Data to validate
   * @returns {Object} - Validation result
   */
  static validateForR(data) {
    const validation = {
      is_valid: true,
      errors: [],
      warnings: [],
      data_type: null,
      record_count: 0
    };

    try {
      if (Array.isArray(data)) {
        validation.data_type = 'array';
        validation.record_count = data.length;

        if (data.length === 0) {
          validation.warnings.push('Data array is empty');
        } else {
          // Check for consistent structure
          const firstRowKeys = Object.keys(data[0]);
          const inconsistentRows = data.filter(row => {
            const rowKeys = Object.keys(row);
            return JSON.stringify(rowKeys.sort()) !== JSON.stringify(firstRowKeys.sort());
          });

          if (inconsistentRows.length > 0) {
            validation.warnings.push(`${inconsistentRows.length} rows have inconsistent structure`);
          }

          // Check for required fields for ECL calculations
          const requiredFields = ['account_id', 'outstanding_amount'];
          const missingFields = requiredFields.filter(field => !(field in data[0]));
          
          if (missingFields.length > 0) {
            validation.warnings.push(`Missing recommended fields: ${missingFields.join(', ')}`);
          }
        }
      } else if (typeof data === 'object' && data !== null) {
        validation.data_type = 'object';
        validation.record_count = 1;
      } else {
        validation.is_valid = false;
        validation.errors.push('Data must be an array or object');
      }

    } catch (error) {
      validation.is_valid = false;
      validation.errors.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Convert numeric values to appropriate R format
   * @param {*} value - Value to convert
   * @returns {*} - R-compatible value
   */
  static toRNumeric(value) {
    if (value === null || value === undefined || value === '') {
      return null; // R NA equivalent
    }

    const num = Number(value);
    if (isNaN(num)) {
      return null;
    }

    return num;
  }

  /**
   * Convert date values to R-compatible format
   * @param {*} value - Date value to convert
   * @returns {string|null} - R-compatible date string
   */
  static toRDate(value) {
    if (!value) return null;

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Return ISO date string (YYYY-MM-DD format preferred by R)
      return date.toISOString().split('T')[0];
    } catch (error) {
      return null;
    }
  }

  /**
   * Sanitize data for safe R processing
   * @param {Array|Object} data - Data to sanitize
   * @returns {Array|Object} - Sanitized data
   */
  static sanitizeForR(data) {
    if (Array.isArray(data)) {
      return data.map(row => this.sanitizeObjectForR(row));
    } else if (typeof data === 'object' && data !== null) {
      return this.sanitizeObjectForR(data);
    }
    
    return data;
  }

  /**
   * Sanitize object for R processing
   * @param {Object} obj - Object to sanitize
   * @returns {Object} - Sanitized object
   */
  static sanitizeObjectForR(obj) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Clean key name (R doesn't like spaces or special characters)
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      
      // Process value based on type
      if (typeof value === 'number') {
        sanitized[cleanKey] = isNaN(value) ? null : value;
      } else if (typeof value === 'string') {
        // Handle special cases
        if (value === '' || value.toLowerCase() === 'na' || value.toLowerCase() === 'null') {
          sanitized[cleanKey] = null;
        } else if (!isNaN(Number(value))) {
          sanitized[cleanKey] = Number(value);
        } else {
          sanitized[cleanKey] = value;
        }
      } else if (value instanceof Date) {
        sanitized[cleanKey] = this.toRDate(value);
      } else if (value === null || value === undefined) {
        sanitized[cleanKey] = null;
      } else {
        sanitized[cleanKey] = String(value);
      }
    }
    
    return sanitized;
  }
}

module.exports = DataConverter;

// packages/r-analytics/src/controllers/ecl-controller.js
// ECL Calculation Controller

const RExecutorService = require('../services/r-executor.service');
const DataConverter = require('../utils/data-converter');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ecl-controller' },
  transports: [
    new winston.transports.File({ filename: './logs/ecl-controller.log' }),
    new winston.transports.Console()
  ]
});

class ECLController {
  constructor() {
    this.rExecutor = new RExecutorService();
  }

  /**
   * Execute basic ECL calculation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateBasicECL(req, res) {
    const jobId = uuidv4();
    
    try {
      const {
        portfolio_data,
        parameters = {},
        tenant_id
      } = req.body;

      logger.info(`Starting ECL calculation`, {
        jobId,
        tenantId: tenant_id,
        portfolioCount: portfolio_data?.length || 0
      });

      // Validate input data
      const validation = DataConverter.validateForR(portfolio_data);
      if (!validation.is_valid) {
        return res.status(400).json({
          success: false,
          job_id: jobId,
          error: 'Data validation failed',
          details: validation.errors,
          timestamp: new Date().toISOString()
        });
      }

      // Sanitize data for R processing
      const sanitizedData = DataConverter.sanitizeForR(portfolio_data);

      // Execute ECL calculation
      const result = await this.rExecutor.calculateECL(sanitizedData, parameters);

      logger.info(`ECL calculation completed successfully`, {
        jobId,
        executionTime: result.execution_time
      });

      res.json({
        success: true,
        job_id: jobId,
        calculation_type: 'basic_ecl',
        result: result.result,
        execution_time_ms: result.execution_time,
        validation_warnings: validation.warnings,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`ECL calculation failed`, {
        jobId,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        job_id: jobId,
        error: 'ECL calculation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Execute stress test calculation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async executeStressTest(req, res) {
    const jobId = uuidv4();
    
    try {
      const {
        portfolio_data,
        stress_scenarios = ['base', 'adverse', 'severely_adverse'],
        parameters = {},
        tenant_id
      } = req.body;

      logger.info(`Starting stress test`, {
        jobId,
        tenantId: tenant_id,
        portfolioCount: portfolio_data?.length || 0,
        scenarios: stress_scenarios
      });

      // Validate and sanitize data
      const validation = DataConverter.validateForR(portfolio_data);
      if (!validation.is_valid) {
        return res.status(400).json({
          success: false,
          job_id: jobId,
          error: 'Data validation failed',
          details: validation.errors
        });
      }

      const sanitizedData = DataConverter.sanitizeForR(portfolio_data);

      // Execute stress test
      const result = await this.rExecutor.executeStressTest(
        sanitizedData, 
        stress_scenarios, 
        parameters
      );

      logger.info(`Stress test completed successfully`, {
        jobId,
        executionTime: result.execution_time,
        scenariosProcessed: stress_scenarios.length
      });

      res.json({
        success: true,
        job_id: jobId,
        calculation_type: 'stress_test',
        scenarios: stress_scenarios,
        result: result.result,
        execution_time_ms: result.execution_time,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Stress test failed`, {
        jobId,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        job_id: jobId,
        error: 'Stress test calculation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new ECLController();