#!/bin/bash
# IFRS9 Platform - Day 1 Hour 4: Environment Validation Script
# File: scripts/setup/d1h4-environment-validation.sh

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h4-env-validation-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warn() {
    echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate Environment Validation Service
generate_validation_service() {
    log_info "Generating Environment Validation Service..."
    
    # Create validation service directory
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/config"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/config/validation.service.ts" << 'EOF'
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
EOF
    log_success "Environment Validation Service generated successfully"
}

# Generate Encryption Service
generate_encryption_service() {
    log_info "Generating Encryption Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/config/encryption.service.ts" << 'EOF'
// packages/backend/src/core/services/config/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private encryptionKey: Buffer;

  constructor(private readonly logger: Logger) {
    this.initializeEncryption();
  }

  /**
   * Initialize encryption with key from environment
   */
  private initializeEncryption(): void {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    if (key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    
    // Derive key using PBKDF2
    this.encryptionKey = crypto.pbkdf2Sync(key, 'ifrs9-platform-salt', 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(text: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('ifrs9-platform', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine IV + encrypted data + auth tag
      return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const tag = Buffer.from(parts[2], 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('ifrs9-platform', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash password or sensitive data
   */
  async hash(data: string, salt?: string): Promise<string> {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha256').toString('hex');
    return `${actualSalt}:${hash}`;
  }

  /**
   * Verify hashed data
   */
  async verifyHash(data: string, hashedData: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedData.split(':');
      const verifyHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha256').toString('hex');
      return hash === verifyHash;
    } catch (error) {
      this.logger.error('Hash verification failed', error);
      return false;
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate JWT secret
   */
  generateJWTSecret(): string {
    return this.generateSecureRandom(64);
  }

  /**
   * Generate encryption key
   */
  generateEncryptionKey(): string {
    return this.generateSecureRandom(32);
  }
}
EOF
    log_success "Encryption Service generated successfully"
}

# Generate Environment Configuration Files
generate_environment_configs() {
    log_info "Generating Environment Configuration Files..."
    
    # Create environment config directory
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/config/environments"
    
    # Generate Development Configuration
    cat > "${PROJECT_ROOT}/packages/backend/src/core/config/environments/development.config.ts" << 'EOF'
// packages/backend/src/core/config/environments/development.config.ts
export const developmentConfig = {
  environment: 'development',
  
  // Application Settings
  app: {
    name: 'IFRS9_Multi_Tenant_Platform',
    version: '1.0.0',
    debug: true,
    hotReload: true,
    sourceMaps: true,
    mockExternalServices: true
  },
  
  // Server Configuration
  server: {
    backend: {
      host: 'localhost',
      port: 4232,
      cors: {
        origin: ['http://localhost:4231', 'http://localhost:3000'],
        credentials: true
      }
    },
    frontend: {
      host: 'localhost',
      port: 4231
    },
    rAnalytics: {
      host: 'localhost',
      port: 4236
    }
  },
  
  // Database Configuration
  database: {
    tenant: {
      host: 'localhost',
      port: 5432,
      userPrefix: 'tenant_',
      namePrefix: 'ifrs9_tenant_',
      ssl: false,
      pool: {
        max: 10,
        min: 2,
        idle: 10000
      }
    },
    platform: {
      host: 'localhost',
      port: 5432,
      name: 'ifrspro_platform_admin',
      user: 'postgres',
      password: 'postgres',
      ssl: false
    }
  },
  
  // Redis Configuration
  redis: {
    host: 'localhost',
    port: 6379,
    password: '1234567890',
    db: 10,
    tokenBlacklistDb: 4,
    sessionDb: 10,
    keyPrefix: 'ifrs9:dev:'
  },
  
  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret_minimum_32_characters_long',
      expiresIn: '8h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_minimum_32_characters',
      refreshExpiresIn: '7d'
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY || 'dev_encryption_key_32_characters_min',
      algorithm: 'aes-256-gcm'
    },
    bcrypt: {
      saltRounds: 10 // Lower for development performance
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // More requests for development
      message: 'Too many requests from this IP'
    }
  },
  
  // Feature Flags
  features: {
    advancedAnalytics: true,
    islamicBanking: true,
    auditTrail: true,
    stressTesting: true,
    mobileApi: true,
    workflowManagement: true,
    syariahCompliance: true,
    multiTenantArchitecture: true,
    rbacAuthentication: true,
    auditWorkflow: true,
    bankingDataModels: true,
    etlPipeline: true,
    formsTemplates: true,
    reactAdminFramework: true,
    dualBankingConfiguration: true,
    bankingResourceManagement: true,
    rApiIntegration: true,
    infrastructure: true,
    legacyIntegration: true,
    productionConfiguration: true
  },
  
  // Logging Configuration
  logging: {
    level: 'debug',
    file: './logs/app.log',
    maxSize: '100MB',
    maxFiles: 10,
    console: true,
    colorize: true
  },
  
  // File Upload Configuration
  upload: {
    maxSize: '50MB',
    allowedTypes: ['xlsx', 'csv', 'json', 'pdf'],
    path: './uploads',
    tempPath: './uploads/temp'
  },
  
  // R Analytics Configuration
  rAnalytics: {
    enabled: true,
    executable: 'Rscript',
    scriptsPath: './packages/r-analytics/scripts',
    modelsPath: './packages/r-analytics/models',
    maxMemoryMB: 1024,
    timeoutSeconds: 180,
    concurrent: 3
  },
  
  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      interval: 30000
    },
    metrics: {
      enabled: true,
      endpoint: '/metrics'
    }
  },
  
  // External Services
  external: {
    mockMode: true,
    legacyFrs9Pro: {
      enabled: false,
      baseUrl: 'http://localhost:8080'
    }
  }
};
EOF
    
    # Generate Production Configuration
    cat > "${PROJECT_ROOT}/packages/backend/src/core/config/environments/production.config.ts" << 'EOF'
// packages/backend/src/core/config/environments/production.config.ts
export const productionConfig = {
  environment: 'production',
  
  // Application Settings
  app: {
    name: 'IFRS9_Multi_Tenant_Platform',
    version: process.env.APP_VERSION || '1.0.0',
    debug: false,
    hotReload: false,
    sourceMaps: false,
    mockExternalServices: false
  },
  
  // Server Configuration
  server: {
    backend: {
      host: process.env.BACKEND_HOST || '0.0.0.0',
      port: parseInt(process.env.BACKEND_PORT || '4232', 10),
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['https://ifrs9.ifrspro.id'],
        credentials: true
      }
    },
    frontend: {
      host: process.env.FRONTEND_HOST || '0.0.0.0',
      port: parseInt(process.env.FRONTEND_PORT || '4231', 10)
    },
    rAnalytics: {
      host: process.env.R_ANALYTICS_HOST || '0.0.0.0',
      port: parseInt(process.env.R_ANALYTICS_PORT || '4236', 10)
    }
  },
  
  // Database Configuration
  database: {
    tenant: {
      host: process.env.TENANT_DB_HOST || 'localhost',
      port: parseInt(process.env.TENANT_DB_PORT || '5432', 10),
      userPrefix: process.env.TENANT_DB_USER_PREFIX || 'tenant_',
      namePrefix: process.env.TENANT_DB_NAME_PREFIX || 'ifrs9_tenant_',
      ssl: process.env.TENANT_DB_SSL === 'require',
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '20', 10),
        min: parseInt(process.env.DB_POOL_MIN || '5', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      }
    },
    platform: {
      host: process.env.PLATFORM_DB_HOST || process.env.TENANT_DB_HOST,
      port: parseInt(process.env.PLATFORM_DB_PORT || process.env.TENANT_DB_PORT || '5432', 10),
      name: process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
      user: process.env.PLATFORM_DB_USER || 'ifrspro_platform_app',
      password: process.env.PLATFORM_DB_PASSWORD,
      ssl: process.env.PLATFORM_DB_SSL === 'require'
    }
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '10', 10),
    tokenBlacklistDb: parseInt(process.env.REDIS_TOKEN_BLACKLIST_DB || '4', 10),
    sessionDb: parseInt(process.env.REDIS_SESSION_DB || '10', 10),
    keyPrefix: 'ifrs9:prod:'
  },
  
  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm'
    },
    bcrypt: {
      saltRounds: parseInt(process.env.SALT_ROUNDS || '12', 10)
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      message: 'Too many requests from this IP'
    }
  },
  
  // Feature Flags (from environment)
  features: {
    advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
    islamicBanking: process.env.FEATURE_ISLAMIC_BANKING === 'true',
    auditTrail: process.env.FEATURE_AUDIT_TRAIL === 'true',
    stressTesting: process.env.FEATURE_STRESS_TESTING === 'true',
    mobileApi: process.env.FEATURE_MOBILE_API === 'true',
    workflowManagement: process.env.FEATURE_WORKFLOW_MANAGEMENT === 'true',
    syariahCompliance: process.env.FEATURE_SYARIAH_COMPLIANCE === 'true',
    multiTenantArchitecture: process.env.MVP_MULTI_TENANT_ARCHITECTURE === 'true',
    rbacAuthentication: process.env.MVP_RBAC_AUTHENTICATION === 'true',
    auditWorkflow: process.env.MVP_AUDIT_WORKFLOW === 'true',
    bankingDataModels: process.env.MVP_BANKING_DATA_MODELS === 'true',
    etlPipeline: process.env.MVP_ETL_PIPELINE === 'true',
    formsTemplates: process.env.MVP_FORMS_TEMPLATES === 'true',
    reactAdminFramework: process.env.MVP_REACT_ADMIN_FRAMEWORK === 'true',
    dualBankingConfiguration: process.env.MVP_DUAL_BANKING_CONFIGURATION === 'true',
    bankingResourceManagement: process.env.MVP_BANKING_RESOURCE_MANAGEMENT === 'true',
    rApiIntegration: process.env.MVP_R_API_INTEGRATION === 'true',
    infrastructure: process.env.MVP_INFRASTRUCTURE === 'true',
    legacyIntegration: process.env.MVP_LEGACY_INTEGRATION === 'true',
    productionConfiguration: process.env.MVP_PRODUCTION_CONFIGURATION === 'true'
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || '/var/log/ifrspro/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '100MB',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '10', 10),
    console: false,
    colorize: false
  },
  
  // File Upload Configuration
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || '50MB',
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['xlsx', 'csv', 'json', 'pdf'],
    path: process.env.UPLOAD_PATH || '/var/uploads/ifrspro',
    tempPath: process.env.UPLOAD_TEMP_PATH || '/tmp/ifrspro'
  },
  
  // R Analytics Configuration
  rAnalytics: {
    enabled: process.env.R_SERVICE_ENABLED === 'true',
    executable: process.env.R_EXECUTABLE || 'Rscript',
    scriptsPath: process.env.R_SCRIPTS_PATH || '/app/packages/r-analytics/scripts',
    modelsPath: process.env.R_MODELS_PATH || '/app/packages/r-analytics/models',
    maxMemoryMB: parseInt(process.env.R_MAX_MEMORY_MB || '2048', 10),
    timeoutSeconds: parseInt(process.env.R_TIMEOUT_SECONDS || '300', 10),
    concurrent: parseInt(process.env.R_MAX_CONCURRENT || '5', 10)
  },
  
  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      endpoint: process.env.HEALTH_CHECK_ENDPOINT || '/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10)
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics'
    }
  },
  
  // External Services
  external: {
    mockMode: false,
    legacyFrs9Pro: {
      enabled: process.env.LEGACY_FRS9PRO_ENABLED === 'true',
      baseUrl: process.env.LEGACY_FRS9PRO_URL
    }
  }
};
EOF
    
    # Generate Configuration Index
    cat > "${PROJECT_ROOT}/packages/backend/src/core/config/index.ts" << 'EOF'
// packages/backend/src/core/config/index.ts
import { developmentConfig } from './environments/development.config';
import { productionConfig } from './environments/production.config';

export interface AppConfig {
  environment: string;
  app: {
    name: string;
    version: string;
    debug: boolean;
    hotReload: boolean;
    sourceMaps: boolean;
    mockExternalServices: boolean;
  };
  server: {
    backend: {
      host: string;
      port: number;
      cors: {
        origin: string | string[];
        credentials: boolean;
      };
    };
    frontend: {
      host: string;
      port: number;
    };
    rAnalytics: {
      host: string;
      port: number;
    };
  };
  database: {
    tenant: {
      host: string;
      port: number;
      userPrefix: string;
      namePrefix: string;
      ssl: boolean;
      pool: {
        max: number;
        min: number;
        idle: number;
      };
    };
    platform: {
      host: string;
      port: number;
      name: string;
      user: string;
      password?: string;
      ssl: boolean;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    tokenBlacklistDb: number;
    sessionDb: number;
    keyPrefix: string;
  };
  security: {
    jwt: {
      secret?: string;
      expiresIn: string;
      refreshSecret?: string;
      refreshExpiresIn: string;
    };
    encryption: {
      key?: string;
      algorithm: string;
    };
    bcrypt: {
      saltRounds: number;
    };
    rateLimit: {
      windowMs: number;
      max: number;
      message: string;
    };
  };
  features: Record<string, boolean>;
  logging: {
    level: string;
    file: string;
    maxSize: string;
    maxFiles: number;
    console: boolean;
    colorize: boolean;
  };
  upload: {
    maxSize: string;
    allowedTypes: string[];
    path: string;
    tempPath: string;
  };
  rAnalytics: {
    enabled: boolean;
    executable: string;
    scriptsPath: string;
    modelsPath: string;
    maxMemoryMB: number;
    timeoutSeconds: number;
    concurrent: number;
  };
  monitoring: {
    healthCheck: {
      enabled: boolean;
      endpoint: string;
      interval: number;
    };
    metrics: {
      enabled: boolean;
      endpoint: string;
    };
  };
  external: {
    mockMode: boolean;
    legacyFrs9Pro: {
      enabled: boolean;
      baseUrl?: string;
    };
  };
}

/**
 * Get configuration based on environment
 */
export function getConfig(): AppConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      // For now, use production config for staging with some modifications
      return {
        ...productionConfig,
        environment: 'staging',
        app: {
          ...productionConfig.app,
          debug: true
        },
        logging: {
          ...productionConfig.logging,
          level: 'debug',
          console: true
        }
      };
    case 'test':
      return {
        ...developmentConfig,
        environment: 'test',
        database: {
          ...developmentConfig.database,
          platform: {
            ...developmentConfig.database.platform,
            name: 'ifrspro_platform_admin_test'
          }
        },
        redis: {
          ...developmentConfig.redis,
          db: 15,
          keyPrefix: 'ifrs9:test:'
        }
      };
    default:
      return developmentConfig;
  }
}

export const config = getConfig();

// Export specific configs for direct access
export { developmentConfig, productionConfig };

// Environment-specific exports
export const isDevelopment = config.environment === 'development';
export const isProduction = config.environment === 'production';
export const isStaging = config.environment === 'staging';
export const isTest = config.environment === 'test';
EOF
    
    log_success "Environment Configuration Files generated successfully"
}

# Generate validation tests
generate_validation_tests() {
    log_info "Generating validation test script..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/scripts/validate-environment.ts" << 'EOF'
// packages/backend/src/scripts/validate-environment.ts
import { ValidationService } from '../core/services/config/validation.service';
import { Logger } from 'winston';

async function runValidation() {
  const logger = console as any; // Simple logger for script
  const validationService = new ValidationService(logger);
  
  try {
    console.log('🔍 Starting comprehensive environment validation...\n');
    
    const report = await validationService.validateEnvironment();
    
    // Print summary
    console.log('='.repeat(60));
    console.log('ENVIRONMENT VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`Environment: ${report.environment}`);
    console.log(`Node.js Version: ${report.nodeVersion}`);
    console.log(`Platform: ${report.platform}`);
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Score: ${report.score}/100`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}\n`);
    
    // Print detailed results
    for (const [section, result] of Object.entries(report.results)) {
      console.log(`📋 ${section.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      if (result.isValid) {
        console.log('✅ Status: VALID');
      } else {
        console.log('❌ Status: INVALID');
      }
      
      if (result.errors.length > 0) {
        console.log('❌ Errors:');
        result.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
      
      if (result.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        result.recommendations.forEach(rec => console.log(`   - ${rec}`));
      }
      
      console.log('');
    }
    
    // Exit with appropriate code
    if (report.overallStatus === 'invalid') {
      console.log('❌ Environment validation failed. Please fix the errors above.');
      process.exit(1);
    } else if (report.overallStatus === 'warnings') {
      console.log('⚠️  Environment validation passed with warnings. Consider addressing them.');
      process.exit(0);
    } else {
      console.log('✅ Environment validation passed successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

runValidation();
EOF
    
    log_success "Validation test script generated successfully"
}

# Main execution
main() {
    log_info "Starting Day 1 Hour 4: Environment Validation setup..."
    
    # Validate environment
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Generate services and configurations
    generate_validation_service
    generate_encryption_service
    generate_environment_configs
    generate_validation_tests
    
    log_success "Environment Validation setup completed successfully!"
    log_info "Generated files:"
    log_info "- Validation Service: packages/backend/src/core/services/config/validation.service.ts"
    log_info "- Encryption Service: packages/backend/src/core/services/config/encryption.service.ts"
    log_info "- Development Config: packages/backend/src/core/config/environments/development.config.ts"
    log_info "- Production Config: packages/backend/src/core/config/environments/production.config.ts"
    log_info "- Config Index: packages/backend/src/core/config/index.ts"
    log_info "- Validation Script: packages/backend/src/scripts/validate-environment.ts"
    log_info ""
    log_info "Next steps:"
    log_info "1. Run feature flags setup: ./scripts/setup/d1h4-feature-flags.sh"
    log_info "2. Test validation: cd packages/backend && npx ts-node src/scripts/validate-environment.ts"
}

# Execute main function
main "$@"