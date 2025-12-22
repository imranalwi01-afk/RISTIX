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
