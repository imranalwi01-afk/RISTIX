// packages/backend/src/config/logger.ts
import winston from 'winston';
import path from 'path';
import appConfig from './app';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };
    
    if (stack) {
      logEntry.stack = stack;
    }
    
    return JSON.stringify(logEntry, null, 0);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: appConfig.logLevel,
  format: logFormat,
  transports: [],
  exitOnError: false,
});

// Add console transport for development
if (appConfig.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true,
  }));
} else {
  logger.add(new winston.transports.Console({
    format: logFormat,
    handleExceptions: true,
    handleRejections: true,
  }));
}

// Add file transports if enabled
if (appConfig.logFileEnabled) {
  const logDir = path.resolve(process.cwd(), appConfig.logDir);
  
  // Combined log
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }));
  
  // Error log
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }));
  
  // Audit log
  logger.add(new winston.transports.File({
    filename: path.join(logDir, 'audit.log'),
    format: logFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 20,
  }));
}

// Create audit logger for security events
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level: 'AUDIT',
        message,
        ...meta
      });
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(appConfig.logDir, 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 50,
    })
  ],
});

// Create performance logger
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(appConfig.logDir, 'performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  ],
});

export default logger;
