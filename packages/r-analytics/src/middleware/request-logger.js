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
