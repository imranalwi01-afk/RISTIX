// packages/backend/src/core/services/config/validation.service.ts
import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface EnvironmentValidationReport {
  timestamp: Date;
  environment: string;
  nodeVersion: string;
  platform: string;
  results: {
    environment: ValidationResult;
    database: ValidationResult;
    redis: ValidationResult;
    security: ValidationResult;
    files: ValidationResult;
    permissions: ValidationResult;
    networking: ValidationResult;
  };
  overallStatus: 'valid' | 'warnings' | 'invalid';
  score: number;
}

@Injectable()
export class ValidationService {
  constructor(private readonly logger: Logger) {}

  /**
   * Validate complete environment configuration
   */
  async validateEnvironment(): Promise<EnvironmentValidationReport> {
    this.logger.info('Starting comprehensive environment validation...');
    
    const report: EnvironmentValidationReport = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown',
      nodeVersion: process.version,
      platform: process.platform,
      results: {
        environment: await this.validateEnvironmentVariables(),
        database: await this.validateDatabaseConfiguration(),
        redis: await this.validateRedisConfiguration(),
        security: await this.validateSecurityConfiguration(),
        files: await this.validateFilePermissions(),
        permissions: await this.validateSystemPermissions(),
        networking: await this.validateNetworkConfiguration()
      },
      overallStatus: 'valid',
      score: 0
    };
    
    // Calculate overall status and score
    this.calculateOverallStatus(report);
    
    this.logger.info(`Environment validation completed with status: ${report.overallStatus} (Score: ${report.score}/100)`);
    
    return report;
  }

  /**
   * Validate environment variables
   */
  async validateEnvironmentVariables(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // Required environment variables
    const requiredVars = [
      'NODE_ENV',
      'APP_NAME',
      'APP_VERSION',
      'BACKEND_HOST',
      'BACKEND_PORT',
      'FRONTEND_HOST',
      'FRONTEND_PORT',
      'TENANT_DB_HOST',
      'TENANT_DB_PORT',
      'TENANT_DB_USER_PREFIX',
      'TENANT_DB_NAME_PREFIX',
      'REDIS_HOST',
      'REDIS_PORT',
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ];
    
    // Check required variables
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        result.errors.push(`Required environment variable missing: ${varName}`);
        result.isValid = false;
      }
    }
    
    // Validate specific variables
    if (process.env.NODE_ENV) {
      const validEnvironments = ['development', 'staging', 'production', 'test'];
      if (!validEnvironments.includes(process.env.NODE_ENV)) {
        result.errors.push(`Invalid NODE_ENV value: ${process.env.NODE_ENV}. Must be one of: ${validEnvironments.join(', ')}`);
        result.isValid = false;
      }
    }
    
    // Validate JWT secret
    if (process.env.JWT_SECRET) {
      if (process.env.JWT_SECRET.length < 32) {
        result.errors.push('JWT_SECRET must be at least 32 characters long');
        result.isValid = false;
      }
      if (process.env.JWT_SECRET === 'your_super_secret_jwt_signing_key') {
        result.errors.push('JWT_SECRET is using default value - must be changed for security');
        result.isValid = false;
      }
    }
    
    // Validate encryption key
    if (process.env.ENCRYPTION_KEY) {
      if (process.env.ENCRYPTION_KEY.length < 32) {
        result.errors.push('ENCRYPTION_KEY must be at least 32 characters long');
        result.isValid = false;
      }
      if (process.env.ENCRYPTION_KEY === 'your_32_character_data_encryption_key') {
        result.errors.push('ENCRYPTION_KEY is using default value - must be changed for security');
        result.isValid = false;
      }
    }
    
    // Validate port numbers
    const portVars = ['BACKEND_PORT', 'FRONTEND_PORT', 'R_ANALYTICS_PORT', 'TENANT_DB_PORT', 'REDIS_PORT'];
    for (const portVar of portVars) {
      if (process.env[portVar]) {
        const port = parseInt(process.env[portVar], 10);
        if (isNaN(port) || port < 1024 || port > 65535) {
          result.errors.push(`Invalid port number for ${portVar}: ${process.env[portVar]}`);
          result.isValid = false;
        }
      }
    }
    
    // Check for development-specific settings in production
    if (process.env.NODE_ENV === 'production') {
      if (process.env.APP_DEBUG === 'true') {
        result.warnings.push('APP_DEBUG should be false in production');
      }
      
      if (!process.env.LOG_LEVEL || process.env.LOG_LEVEL === 'debug') {
        result.warnings.push('LOG_LEVEL should be info or higher in production');
      }
    }
    
    // Recommendations
    if (!process.env.LOG_FILE) {
      result.recommendations.push('Consider setting LOG_FILE for centralized logging');
    }
    
    if (!process.env.CORS_ORIGINS) {
      result.recommendations.push('Consider setting CORS_ORIGINS for better security');
    }
    
    return result;
  }

  /**
   * Validate database configuration
   */
  async validateDatabaseConfiguration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    try {
      const { Client } = require('pg');
      
      // Test platform admin database connection
      const adminDbClient = new Client({
        host: process.env.PLATFORM_DB_HOST || process.env.TENANT_DB_HOST,
        port: parseInt(process.env.PLATFORM_DB_PORT || process.env.TENANT_DB_PORT || '5432', 10),
        user: process.env.PLATFORM_DB_USER || 'postgres',
        password: process.env.PLATFORM_DB_PASSWORD || 'postgres',
        database: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin'
      });
      
      await adminDbClient.connect();
      
      // Test basic query
      const versionResult = await adminDbClient.query('SELECT version()');
      this.logger.info(`Connected to PostgreSQL: ${versionResult.rows[0].version.split(' ')[1]}`);
      
      // Check required schemas
      const schemaResult = await adminDbClient.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name IN ('platform_admin', 'configuration', 'monitoring')
      `);
      
      const existingSchemas = schemaResult.rows.map(row => row.schema_name);
      const requiredSchemas = ['platform_admin', 'configuration', 'monitoring'];
      
      for (const schema of requiredSchemas) {
        if (!existingSchemas.includes(schema)) {
          result.errors.push(`Required database schema missing: ${schema}`);
          result.isValid = false;
        }
      }
      
      // Check required tables
      const tablesResult = await adminDbClient.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema IN ('platform_admin', 'configuration')
      `);
      
      const existingTables = tablesResult.rows.map(row => `${row.table_schema}.${row.table_name}`);
      const requiredTables = [
        'platform_admin.tenants',
        'platform_admin.platform_users',
        'configuration.app_settings',
        'configuration.calculation_parameters'
      ];
      
      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          result.warnings.push(`Database table not found (may not be created yet): ${table}`);
        }
      }
      
      await adminDbClient.end();
      
    } catch (error) {
      result.errors.push(`Database connection failed: ${error.message}`);
      result.isValid = false;
    }
    
    return result;
  }

  /**
   * Validate Redis configuration
   */
  async validateRedisConfiguration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    try {
      const redis = require('redis');
      
      const client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10)
      });
      
      await client.connect();
      
      // Test Redis operations
      await client.set('validation_test', 'success');
      const testValue = await client.get('validation_test');
      
      if (testValue !== 'success') {
        result.errors.push('Redis read/write test failed');
        result.isValid = false;
      }
      
      await client.del('validation_test');
      
      // Check Redis info
      const info = await client.info();
      const redisVersion = info.match(/redis_version:(\d+\.\d+\.\d+)/);
      if (redisVersion) {
        this.logger.info(`Connected to Redis: ${redisVersion[1]}`);
        
        // Check version compatibility
        const version = redisVersion[1].split('.').map(n => parseInt(n, 10));
        if (version[0] < 6) {
          result.warnings.push(`Redis version ${redisVersion[1]} is older than recommended (6.0+)`);
        }
      }
      
      await client.quit();
      
    } catch (error) {
      result.errors.push(`Redis connection failed: ${error.message}`);
      result.isValid = false;
    }
    
    return result;
  }

  /**
   * Validate security configuration
   */
  async validateSecurityConfiguration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // Check JWT configuration
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      result.errors.push('JWT_SECRET is not properly configured');
      result.isValid = false;
    }
    
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      result.errors.push('JWT_REFRESH_SECRET is not properly configured');
      result.isValid = false;
    }
    
    // Check encryption configuration
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
      result.errors.push('ENCRYPTION_KEY is not properly configured');
      result.isValid = false;
    }
    
    // Check salt rounds
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '12', 10);
    if (saltRounds < 10) {
      result.warnings.push('SALT_ROUNDS should be at least 10 for security');
    }
    if (saltRounds > 15) {
      result.warnings.push('SALT_ROUNDS is very high and may impact performance');
    }
    
    // Check HTTPS configuration for production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.SSL_ENABLED || process.env.SSL_ENABLED !== 'true') {
        result.warnings.push('SSL should be enabled in production');
      }
      
      if (!process.env.CORS_ORIGINS) {
        result.warnings.push('CORS_ORIGINS should be configured in production');
      }
    }
    
    // Check for weak secrets
    const secrets = [
      { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
      { name: 'JWT_REFRESH_SECRET', value: process.env.JWT_REFRESH_SECRET },
      { name: 'ENCRYPTION_KEY', value: process.env.ENCRYPTION_KEY }
    ];
    
    for (const secret of secrets) {
      if (secret.value) {
        const entropy = this.calculateEntropy(secret.value);
        if (entropy < 4.0) {
          result.warnings.push(`${secret.name} has low entropy (${entropy.toFixed(2)}), consider using a more random value`);
        }
      }
    }
    
    return result;
  }

  /**
   * Validate file permissions and structure
   */
  async validateFilePermissions(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // Check critical directories
    const criticalDirs = [
      { path: 'packages/backend/src', writable: false },
      { path: 'packages/frontend/src', writable: false },
      { path: 'logs', writable: true },
      { path: 'uploads', writable: true },
      { path: 'uploads/temp', writable: true },
      { path: 'config', writable: false }
    ];
    
    for (const dir of criticalDirs) {
      const fullPath = path.join(process.cwd(), dir.path);
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (!stats.isDirectory()) {
          result.errors.push(`Expected directory but found file: ${dir.path}`);
          result.isValid = false;
          continue;
        }
        
        // Check write permissions
        if (dir.writable) {
          try {
            const testFile = path.join(fullPath, '.write_test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
          } catch (error) {
            result.errors.push(`Directory not writable: ${dir.path}`);
            result.isValid = false;
          }
        }
        
      } catch (error) {
        if (error.code === 'ENOENT') {
          if (dir.writable) {
            result.warnings.push(`Directory missing (will be created): ${dir.path}`);
            // Try to create the directory
            try {
              fs.mkdirSync(fullPath, { recursive: true });
              result.recommendations.push(`Created missing directory: ${dir.path}`);
            } catch (createError) {
              result.errors.push(`Cannot create directory: ${dir.path} - ${createError.message}`);
              result.isValid = false;
            }
          } else {
            result.errors.push(`Required directory missing: ${dir.path}`);
            result.isValid = false;
          }
        } else {
          result.errors.push(`Cannot access directory: ${dir.path} - ${error.message}`);
          result.isValid = false;
        }
      }
    }
    
    // Check critical files
    const criticalFiles = [
      { path: 'package.json', required: true },
      { path: 'packages/backend/package.json', required: true },
      { path: 'packages/frontend/package.json', required: true },
      { path: '.env.example', required: false },
      { path: '.env', required: false }
    ];
    
    for (const file of criticalFiles) {
      const fullPath = path.join(process.cwd(), file.path);
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (!stats.isFile()) {
          if (file.required) {
            result.errors.push(`Expected file but found directory: ${file.path}`);
            result.isValid = false;
          }
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          if (file.required) {
            result.errors.push(`Required file missing: ${file.path}`);
            result.isValid = false;
          } else {
            result.warnings.push(`Optional file missing: ${file.path}`);
          }
        } else {
          result.errors.push(`Cannot access file: ${file.path} - ${error.message}`);
          result.isValid = false;
        }
      }
    }
    
    return result;
  }

  /**
   * Validate system permissions
   */
  async validateSystemPermissions(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // Check Node.js version
    const nodeVersion = process.version.replace('v', '');
    const [major, minor] = nodeVersion.split('.').map(n => parseInt(n, 10));
    
    if (major < 18) {
      result.errors.push(`Node.js version ${nodeVersion} is not supported. Minimum version is 18.0.0`);
      result.isValid = false;
    } else if (major === 18 && minor < 0) {
      result.warnings.push(`Node.js version ${nodeVersion} is below recommended (18.0.0+)`);
    }
    
    // Check available memory
    const totalMemory = require('os').totalmem();
    const availableMemory = require('os').freemem();
    const memoryGB = totalMemory / (1024 * 1024 * 1024);
    
    if (memoryGB < 2) {
      result.warnings.push(`System memory (${memoryGB.toFixed(1)}GB) is below recommended (4GB+)`);
    }
    
    if (availableMemory / totalMemory < 0.2) {
      result.warnings.push('System memory usage is high (>80% used)');
    }
    
    // Check disk space
    try {
      const stats = fs.statSync(process.cwd());
      // This is a simplified check - in a real implementation, you'd want to check actual disk usage
      result.recommendations.push('Monitor disk space usage regularly');
    } catch (error) {
      result.warnings.push('Cannot check disk space');
    }
    
    return result;
  }

  /**
   * Validate network configuration
   */
  async validateNetworkConfiguration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // Check port availability
    const portsToCheck = [
      { name: 'Backend', port: parseInt(process.env.BACKEND_PORT || '4232', 10) },
      { name: 'Frontend', port: parseInt(process.env.FRONTEND_PORT || '4231', 10) },
      { name: 'R Analytics', port: parseInt(process.env.R_ANALYTICS_PORT || '4236', 10) }
    ];
    
    for (const portCheck of portsToCheck) {
      try {
        const net = require('net');
        const server = net.createServer();
        
        await new Promise((resolve, reject) => {
          server.listen(portCheck.port, (err) => {
            if (err) {
              reject(err);
            } else {
              server.close(resolve);
            }
          });
        });
        
      } catch (error) {
        result.warnings.push(`Port ${portCheck.port} (${portCheck.name}) appears to be in use`);
      }
    }
    
    // Check hostname resolution
    const hosts = [
      process.env.TENANT_DB_HOST || 'localhost',
      process.env.REDIS_HOST || 'localhost'
    ];
    
    for (const host of hosts) {
      try {
        const dns = require('dns');
        await new Promise((resolve, reject) => {
          dns.lookup(host, (err, address) => {
            if (err) {
              reject(err);
            } else {
              resolve(address);
            }
          });
        });
      } catch (error) {
        result.errors.push(`Cannot resolve hostname: ${host}`);
        result.isValid = false;
      }
    }
    
    return result;
  }

  /**
   * Validate specific configuration key
   */
  async validateConfigurationKey(key: string, value: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // Define validation rules for specific configuration keys
    const validationRules: Record<string, (value: any) => ValidationResult> = {
      'database.host': (val) => {
        const res: ValidationResult = { isValid: true, errors: [], warnings: [], recommendations: [] };
        if (typeof val !== 'string' || val.length === 0) {
          res.errors.push('Database host must be a non-empty string');
          res.isValid = false;
        }
        return res;
      },
      
      'database.port': (val) => {
        const res: ValidationResult = { isValid: true, errors: [], warnings: [], recommendations: [] };
        const port = Number(val);
        if (isNaN(port) || port < 1 || port > 65535) {
          res.errors.push('Database port must be a number between 1 and 65535');
          res.isValid = false;
        }
        return res;
      },
      
      'jwt.secret': (val) => {
        const res: ValidationResult = { isValid: true, errors: [], warnings: [], recommendations: [] };
        if (typeof val !== 'string' || val.length < 32) {
          res.errors.push('JWT secret must be at least 32 characters long');
          res.isValid = false;
        }
        return res;
      },
      
      'encryption.key': (val) => {
        const res: ValidationResult = { isValid: true, errors: [], warnings: [], recommendations: [] };
        if (typeof val !== 'string' || val.length < 32) {
          res.errors.push('Encryption key must be at least 32 characters long');
          res.isValid = false;
        }
        return res;
      }
    };
    
    // Apply validation rule if exists
    if (validationRules[key]) {
      const ruleResult = validationRules[key](value);
      result.isValid = ruleResult.isValid;
      result.errors = ruleResult.errors;
      result.warnings = ruleResult.warnings;
      result.recommendations = ruleResult.recommendations;
    }
    
    return result;
  }

  /**
   * Calculate overall status and score
   */
  private calculateOverallStatus(report: EnvironmentValidationReport): void {
    let totalErrors = 0;
    let totalWarnings = 0;
    let validSections = 0;
    const totalSections = Object.keys(report.results).length;
    
    for (const [section, result] of Object.entries(report.results)) {
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      
      if (result.isValid) {
        validSections++;
      }
    }
    
    // Calculate score (0-100)
    const validityScore = (validSections / totalSections) * 60; // 60% for validity
    const errorPenalty = Math.min(totalErrors * 10, 30); // Max 30% penalty for errors
    const warningPenalty = Math.min(totalWarnings * 2, 10); // Max 10% penalty for warnings
    
    report.score = Math.max(0, validityScore - errorPenalty - warningPenalty);
    
    // Determine overall status
    if (totalErrors > 0) {
      report.overallStatus = 'invalid';
    } else if (totalWarnings > 0) {
      report.overallStatus = 'warnings';
    } else {
      report.overallStatus = 'valid';
    }
  }

  /**
   * Calculate entropy of a string (for password/secret strength)
   */
  private calculateEntropy(str: string): number {
    const charset = new Set(str);
    const charsetSize = charset.size;
    
    if (charsetSize === 0) return 0;
    
    const length = str.length;
    return Math.log2(Math.pow(charsetSize, length)) / length;
  }
}
