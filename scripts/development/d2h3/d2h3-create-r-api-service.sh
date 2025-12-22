#!/bin/bash
# scripts/development/d2h3-create-r-api-service.sh
# Day 2 Hour 3: Create Express API Service for R Integration
# OBJECTIVE: Complete R API integration layer

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-r-api-service-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    exit ${exit_code}
}

trap handle_error ERR

# Create Express.js main application file
create_express_app() {
    log_info "Creating Express.js main application for R API service..."
    
    cat > "${PROJECT_ROOT}/packages/r-analytics/src/index.js" << 'EOF'
// packages/r-analytics/src/index.js
// Express.js API Service for R Analytics Integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import route handlers
const eclRoutes = require('./routes/ecl-routes');
const healthRoutes = require('./routes/health-routes');
const modelRoutes = require('./routes/model-routes');
const dataRoutes = require('./routes/data-routes');

// Import middleware
const errorHandler = require('./middleware/error-handler');
const rateLimiter = require('./middleware/rate-limiter');
const requestLogger = require('./middleware/request-logger');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.R_ANALYTICS_PORT || 8001;
const HOST = process.env.R_ANALYTICS_HOST || '0.0.0.0';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID']
}));

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/ecl', eclRoutes);
app.use('/api/v1/models', modelRoutes);
app.use('/api/v1/data', dataRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'IFRS 9 R Analytics API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      ecl_calculations: '/api/v1/ecl',
      models: '/api/v1/models',
      data: '/api/v1/data'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requested_path: req.originalUrl,
    available_endpoints: [
      '/api/v1/health',
      '/api/v1/ecl',
      '/api/v1/models',
      '/api/v1/data'
    ]
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 IFRS 9 R Analytics API Server started successfully!`);
  console.log(`📍 Server running on: http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/api/v1/health`);
  console.log(`📊 ECL calculations: http://${HOST}:${PORT}/api/v1/ecl`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

module.exports = app;
EOF

    log_success "Express.js main application created"
}

# Create middleware files
create_middleware() {
    log_info "Creating middleware files for R API service..."
    
    # Error handler middleware
    cat > "${PROJECT_ROOT}/packages/r-analytics/src/middleware/error-handler.js" << 'EOF'
// packages/r-analytics/src/middleware/error-handler.js
// Centralized error handling middleware

const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'r-analytics-api' },
  transports: [
    new winston.transports.File({ filename: './logs/error.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determine error type and response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'R_CALCULATION_ERROR') {
    statusCode = 422;
    message = 'R Calculation Failed';
  } else if (err.name === 'DATABASE_ERROR') {
    statusCode = 503;
    message = 'Database Service Unavailable';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      code: err.code || 'UNKNOWN_ERROR',
      type: err.name || 'ServerError',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || 'unknown'
    },
    // Include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
EOF

    # Rate limiter middleware
    cat > "${PROJECT_ROOT}/packages/r-analytics/src/middleware/rate-limiter.js" << 'EOF'
// packages/r-analytics/src/middleware/rate-limiter.js
// Rate limiting middleware for R API service

const { RateLimiterMemory } = require('rate-limiter-flexible');

// Configure rate limiters for different endpoints
const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 // Block for 60 seconds if limit exceeded
});

const calculationLimiter = new RateLimiterMemory({
  keyPrefix: 'calculation',
  points: 10, // Number of calculation requests
  duration: 60, // Per 60 seconds
  blockDuration: 120 // Block for 2 minutes if limit exceeded
});

const heavyCalculationLimiter = new RateLimiterMemory({
  keyPrefix: 'heavy_calculation',
  points: 3, // Number of heavy calculation requests
  duration: 300, // Per 5 minutes
  blockDuration: 600 // Block for 10 minutes if limit exceeded
});

// General rate limiter middleware
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // Determine which limiter to use based on route
    let limiter = generalLimiter;
    
    if (req.path.includes('/ecl/calculate')) {
      limiter = calculationLimiter;
    } else if (req.path.includes('/ecl/batch') || req.path.includes('/models/train')) {
      limiter = heavyCalculationLimiter;
    }
    
    // Get client identifier (IP address or user ID)
    const key = req.ip || req.connection.remoteAddress;
    
    // Check rate limit
    await limiter.consume(key);
    
    next();
    
  } catch (rejRes) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after_seconds: secs,
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = rateLimiterMiddleware;
EOF

    # Request logger middleware
    cat > "${PROJECT_ROOT}/packages/r-analytics/src/middleware/request-logger.js" << 'EOF'
// packages/r-analytics/src/middleware/request-logger.js
// Request logging middleware

const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'r-analytics-api' },
  transports: [
    new winston.transports.File({ filename: './logs/requests.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const requestLogger = (req, res, next) => {
  // Add request ID
  req.id = uuidv4();
  req.startTime = Date.now();
  
  // Log request details
  logger.info({
    type: 'REQUEST',
    request_id: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString()
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - req.startTime;
    
    logger.info({
      type: 'RESPONSE',
      request_id: req.id,
      status: res.statusCode,
      response_time_ms: responseTime,
      content_length: JSON.stringify(data).length,
      timestamp: new Date().toISOString()
    });
    
    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;
EOF

    log_success "Middleware files created"
}

# Create route handlers
create_route_handlers() {
    log_info "Creating route handlers for R API service..."
    
    # Create routes directory
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/src/routes"
    
    # Health check routes
    cat > "${PROJECT_ROOT}/packages/r-analytics/src/routes/health-routes.js" << 'EOF'
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
EOF

    log_success "Route handlers created"
}

# Main execution function
main() {
    log_info "Creating Express API service for R integration..."
    
    # Create middleware directory
    mkdir -p "${PROJECT_ROOT}/packages/r-analytics/src/middleware"
    
    # Execute creation steps
    create_express_app
    create_middleware
    create_route_handlers
    
    log_success "Express API service for R integration created successfully!"
    log_info "Next step: Run d2h3-create-ecl-routes.sh to create ECL calculation routes"
}

# Execute main function
main "$@"