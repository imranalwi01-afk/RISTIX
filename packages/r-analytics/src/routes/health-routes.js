// packages/r-analytics/src/routes/health-routes.js
// Health check and status routes

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'R Analytics API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed system status
router.get('/status', async (req, res) => {
  try {
    const status = {
      success: true,
      system: {
        service: 'R Analytics API',
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime_seconds: process.uptime(),
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
      },
      r_service: {
        status: 'checking...',
        version: null,
        packages_status: 'unknown'
      },
      database: {
        status: 'checking...',
        connections: []
      }
    };

    // Check R availability
    try {
      const rVersion = await checkRVersion();
      status.r_service.status = 'available';
      status.r_service.version = rVersion;
      status.r_service.packages_status = 'installed';
    } catch (error) {
      status.r_service.status = 'unavailable';
      status.r_service.error = error.message;
    }

    // Check database connections
    try {
      const dbStatus = await checkDatabaseConnections();
      status.database = dbStatus;
    } catch (error) {
      status.database.status = 'error';
      status.database.error = error.message;
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// R service specific health check
router.get('/r-service', async (req, res) => {
  try {
    // Test R script execution
    const testResult = await executeRHealthCheck();
    
    res.json({
      success: true,
      r_service: {
        status: 'healthy',
        version: testResult.version,
        packages: testResult.packages,
        test_calculation: testResult.test_result,
        response_time_ms: testResult.execution_time
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'R service unavailable',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to check R version
function checkRVersion() {
  return new Promise((resolve, reject) => {
    const rProcess = spawn('R', ['--version']);
    let output = '';
    
    rProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    rProcess.on('close', (code) => {
      if (code === 0) {
        const versionMatch = output.match(/R version (\d+\.\d+\.\d+)/);
        if (versionMatch) {
          resolve(versionMatch[1]);
        } else {
          reject(new Error('Could not parse R version'));
        }
      } else {
        reject(new Error('R is not available'));
      }
    });
    
    rProcess.on('error', (error) => {
      reject(new Error(`R execution failed: ${error.message}`));
    });
  });
}

// Helper function to check database connections
function checkDatabaseConnections() {
  return new Promise((resolve, reject) => {
    // Create R script to test database connections
    const testScript = `
      source('./config/database.R')
      result <- test_db_connections()
      cat(jsonlite::toJSON(result, auto_unbox = TRUE))
    `;
    
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
          resolve({
            status: 'connected',
            connections: result
          });
        } catch (parseError) {
          reject(new Error('Failed to parse database test results'));
        }
      } else {
        reject(new Error(`Database test failed: ${errorOutput}`));
      }
    });
    
    rProcess.stdin.write(testScript);
    rProcess.stdin.end();
  });
}

// Helper function to execute R health check
function executeRHealthCheck() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const healthScript = `
      # Test basic R functionality
      test_data <- data.frame(
        amount = c(1000, 2000, 3000),
        pd = c(0.01, 0.02, 0.03),
        lgd = c(0.4, 0.5, 0.6)
      )
      
      # Simple ECL calculation
      test_data$ecl <- test_data$amount * test_data$pd * test_data$lgd
      
      result <- list(
        version = R.version.string,
        packages = c("jsonlite", "dplyr", "survival"),
        test_result = sum(test_data$ecl),
        status = "ok"
      )
      
      cat(jsonlite::toJSON(result, auto_unbox = TRUE))
    `;
    
    const rProcess = spawn('R', ['--vanilla', '--quiet']);
    
    let output = '';
    let errorOutput = '';
    
    rProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    rProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    rProcess.on('close', (code) => {
      const executionTime = Date.now() - startTime;
      
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          result.execution_time = executionTime;
          resolve(result);
        } catch (parseError) {
          reject(new Error('Failed to parse R health check results'));
        }
      } else {
        reject(new Error(`R health check failed: ${errorOutput}`));
      }
    });
    
    rProcess.stdin.write(healthScript);
    rProcess.stdin.end();
  });
}

module.exports = router;
