// packages/r-analytics/src/routes/ecl-routes.js
// ECL calculation API routes

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, JSON, and Excel files are allowed.'));
    }
  }
});

// Validation middleware
const validateECLRequest = [
  body('calculation_type').isIn(['basic', 'advanced', 'stress_test']),
  body('tenant_id').isUUID().optional(),
  body('portfolio_data').isArray().optional(),
  body('parameters').isObject().optional()
];

// Basic ECL calculation endpoint
router.post('/calculate', validateECLRequest, async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      calculation_type = 'basic',
      tenant_id,
      portfolio_data,
      parameters = {}
    } = req.body;

    // Generate calculation job ID
    const jobId = uuidv4();
    
    log_info(`Starting ECL calculation job: ${jobId}`);

    // Execute R calculation
    const calculationResult = await executeECLCalculation({
      jobId,
      calculationType: calculation_type,
      tenantId: tenant_id,
      portfolioData: portfolio_data,
      parameters
    });

    res.json({
      success: true,
      job_id: jobId,
      calculation_type: calculation_type,
      result: calculationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ECL calculation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Batch ECL calculation with file upload
router.post('/batch', upload.single('portfolio_file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio file is required'
      });
    }

    const {
      calculation_type = 'basic',
      tenant_id,
      parameters = '{}'
    } = req.body;

    const jobId = uuidv4();
    const filePath = req.file.path;

    log_info(`Starting batch ECL calculation job: ${jobId}`);

    // Process file and execute calculation
    const calculationResult = await executeBatchECLCalculation({
      jobId,
      calculationType: calculation_type,
      tenantId: tenant_id,
      filePath,
      parameters: JSON.parse(parameters)
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      job_id: jobId,
      calculation_type: calculation_type,
      file_processed: req.file.originalname,
      result: calculationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Batch ECL calculation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get calculation job status
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and get status
    const jobStatus = await getCalculationJobStatus(jobId);

    res.json({
      success: true,
      job_id: jobId,
      status: jobStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Job not found',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get calculation results
router.get('/results/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { format = 'json' } = req.query;

    // Get calculation results
    const results = await getCalculationResults(jobId, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ecl_results_${jobId}.csv"`);
      res.send(results);
    } else {
      res.json({
        success: true,
        job_id: jobId,
        results,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Results not found',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Stress testing endpoint
router.post('/stress-test', validateECLRequest, async (req, res) => {
  try {
    const {
      tenant_id,
      portfolio_data,
      stress_scenarios = ['base', 'adverse', 'severely_adverse'],
      parameters = {}
    } = req.body;

    const jobId = uuidv4();

    log_info(`Starting stress test job: ${jobId}`);

    // Execute stress test
    const stressTestResult = await executeStressTest({
      jobId,
      tenantId: tenant_id,
      portfolioData: portfolio_data,
      stressScenarios: stress_scenarios,
      parameters
    });

    res.json({
      success: true,
      job_id: jobId,
      stress_scenarios: stress_scenarios,
      result: stressTestResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stress test calculation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to execute ECL calculation in R
async function executeECLCalculation({ jobId, calculationType, tenantId, portfolioData, parameters }) {
  return new Promise((resolve, reject) => {
    // Prepare calculation data
    const calculationInput = {
      job_id: jobId,
      calculation_type: calculationType,
      tenant_id: tenantId,
      portfolio_data: portfolioData,
      parameters: {
        pd_params: parameters.pd_params || {},
        lgd_params: parameters.lgd_params || {},
        ead_params: parameters.ead_params || {},
        staging_params: parameters.staging_params || {}
      }
    };

    // Create R script for calculation
    const rScript = `
      # Load required libraries
      library(jsonlite)
      source('./scripts/ecl/basic_ecl_calculator.R')
      
      # Read input data
      input_json <- '${JSON.stringify(calculationInput)}'
      input_data <- fromJSON(input_json)
      
      # Convert portfolio data to data frame
      portfolio_df <- data.frame(input_data$portfolio_data)
      
      # Execute ECL calculation
      result <- calculate_basic_ecl(portfolio_df, input_data$parameters)
      
      # Export results
      output_results <- export_ecl_results(result)
      
      # Output JSON results
      cat(toJSON(output_results, auto_unbox = TRUE))
    `;

    // Execute R script
    const rProcess = spawn('R', ['--vanilla', '--quiet'], {
      cwd: path.join(__dirname, '../..')
    });

    let output = '';
    let errorOutput = '';

    rProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    rProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    rProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse R calculation results: ${parseError.message}`));
        }
      } else {
        reject(new Error(`R calculation failed: ${errorOutput}`));
      }
    });

    rProcess.on('error', (error) => {
      reject(new Error(`R process error: ${error.message}`));
    });

    // Send script to R
    rProcess.stdin.write(rScript);
    rProcess.stdin.end();
  });
}

// Helper function to execute batch ECL calculation
async function executeBatchECLCalculation({ jobId, calculationType, tenantId, filePath, parameters }) {
  return new Promise((resolve, reject) => {
    // Create R script for batch processing
    const rScript = `
      # Load required libraries
      library(jsonlite)
      library(data.table)
      source('./scripts/ecl/basic_ecl_calculator.R')
      
      # Read portfolio data from file
      portfolio_data <- tryCatch({
        if (grepl("\\\\.csv$", "${filePath}")) {
          fread("${filePath}")
        } else if (grepl("\\\\.json$", "${filePath}")) {
          fromJSON("${filePath}")
        } else {
          stop("Unsupported file format")
        }
      }, error = function(e) {
        stop(paste("Failed to read file:", e$message))
      })
      
      # Prepare calculation parameters
      calc_params <- fromJSON('${JSON.stringify(parameters)}')
      
      # Execute ECL calculation
      result <- calculate_basic_ecl(portfolio_data, calc_params)
      
      # Export results
      output_results <- export_ecl_results(result)
      
      # Add batch processing info
      output_results$batch_info <- list(
        job_id = "${jobId}",
        calculation_type = "${calculationType}",
        tenant_id = "${tenantId}",
        file_path = "${filePath}",
        total_records = nrow(portfolio_data)
      )
      
      # Output JSON results
      cat(toJSON(output_results, auto_unbox = TRUE))
    `;

    // Execute R script
    const rProcess = spawn('R', ['--vanilla', '--quiet'], {
      cwd: path.join(__dirname, '../..')
    });

    let output = '';
    let errorOutput = '';

    rProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    rProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    rProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse batch calculation results: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Batch R calculation failed: ${errorOutput}`));
      }
    });

    rProcess.on('error', (error) => {
      reject(new Error(`Batch R process error: ${error.message}`));
    });

    // Send script to R
    rProcess.stdin.write(rScript);
    rProcess.stdin.end();
  });
}

// Helper function to execute stress test
async function executeStressTest({ jobId, tenantId, portfolioData, stressScenarios, parameters }) {
  return new Promise((resolve, reject) => {
    // Create R script for stress testing
    const rScript = `
      # Load required libraries
      library(jsonlite)
      source('./scripts/ecl/basic_ecl_calculator.R')
      
      # Prepare stress test data
      stress_input <- fromJSON('${JSON.stringify({
        job_id: jobId,
        tenant_id: tenantId,
        portfolio_data: portfolioData,
        stress_scenarios: stressScenarios,
        parameters
      })}')
      
      # Convert portfolio data
      portfolio_df <- data.frame(stress_input$portfolio_data)
      
      # Execute stress test for each scenario
      stress_results <- list()
      
      for (scenario in stress_input$stress_scenarios) {
        # Adjust parameters for stress scenario
        scenario_params <- stress_input$parameters
        
        if (scenario == "adverse") {
          scenario_params$pd_params$economic_adjustment <- 0.5  # 50% increase in PD
          scenario_params$lgd_params$base_lgd <- scenario_params$lgd_params$base_lgd * 1.2  # 20% increase in LGD
        } else if (scenario == "severely_adverse") {
          scenario_params$pd_params$economic_adjustment <- 1.0  # 100% increase in PD
          scenario_params$lgd_params$base_lgd <- scenario_params$lgd_params$base_lgd * 1.5  # 50% increase in LGD
        }
        
        # Calculate ECL for scenario
        scenario_result <- calculate_basic_ecl(portfolio_df, scenario_params)
        stress_results[[scenario]] <- export_ecl_results(scenario_result)
      }
      
      # Prepare final output
      final_result <- list(
        job_id = "${jobId}",
        stress_test_results = stress_results,
        summary = list(
          scenarios_tested = length(stress_input$stress_scenarios),
          portfolio_accounts = nrow(portfolio_df)
        )
      )
      
      # Output JSON results
      cat(toJSON(final_result, auto_unbox = TRUE))
    `;

    // Execute R script
    const rProcess = spawn('R', ['--vanilla', '--quiet'], {
      cwd: path.join(__dirname, '../..')
    });

    let output = '';
    let errorOutput = '';

    rProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    rProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    rProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse stress test results: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Stress test R calculation failed: ${errorOutput}`));
      }
    });

    rProcess.on('error', (error) => {
      reject(new Error(`Stress test R process error: ${error.message}`));
    });

    // Send script to R
    rProcess.stdin.write(rScript);
    rProcess.stdin.end();
  });
}

// Placeholder functions for job management (implement based on your storage needs)
async function getCalculationJobStatus(jobId) {
  // Implement job status tracking
  return {
    status: 'completed',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
}

async function getCalculationResults(jobId, format) {
  // Implement result retrieval
  if (format === 'csv') {
    return 'job_id,account_id,ecl_amount\n' + jobId + ',test_account,1000.00';
  }
  
  return {
    job_id: jobId,
    results: 'Calculation results would be here'
  };
}

module.exports = router;
