// packages/backend/src/core/database/SecurityValidator.ts

import { databaseRegistry, DatabaseDefinition } from './DatabaseRegistry';
import { logger } from '../../utils/logger';

export interface SecurityValidationResult {
  databaseId: string;
  databaseName: string;
  isValid: boolean;
  warnings: string[];
  errors: string[];
  securityLevel: 'secure' | 'warning' | 'insecure' | 'critical';
  recommendations: string[];
  details: {
    sslConfigured: boolean;
    weakPassword: boolean;
    passwordComplexity: PasswordComplexity;
    connectionSecurity: ConnectionSecurity;
    hostSecurity: HostSecurity;
    complianceStatus: ComplianceStatus;
  };
}

export interface PasswordComplexity {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  score: number; // 0-100
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
}

export interface ConnectionSecurity {
  sslEnabled: boolean;
  sslRequired: boolean;
  encryptionStrength: string;
  certificateValidation: boolean;
  connectionTimeout: number;
  maxConnections: number;
  poolingEnabled: boolean;
}

export interface HostSecurity {
  isLocalhost: boolean;
  isPrivateIP: boolean;
  isPublicIP: boolean;
  isProductionDomain: boolean;
  hostCategory: 'localhost' | 'private' | 'public' | 'production';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceStatus {
  encryptionRequired: boolean;
  encryptionCompliant: boolean;
  auditTrailRequired: boolean;
  auditTrailCompliant: boolean;
  gdprCompliant: boolean;
  soxCompliant: boolean;
  pciCompliant: boolean;
}

export interface SecurityValidationOptions {
  strictMode?: boolean;
  checkPasswordComplexity?: boolean;
  checkHostSecurity?: boolean;
  checkCompliance?: boolean;
  minPasswordLength?: number;
  requireSpecialChars?: boolean;
  allowPublicHosts?: boolean;
  enforceSSL?: boolean;
}

/**
 * Database Security Validator
 *
 * This service validates database connections and configurations against security best practices,
 * compliance requirements, and organizational security policies.
 */
export class DatabaseSecurityValidator {
  private static instance: DatabaseSecurityValidator;
  private defaultOptions: SecurityValidationOptions = {
    strictMode: false,
    checkPasswordComplexity: true,
    checkHostSecurity: true,
    checkCompliance: true,
    minPasswordLength: 12,
    requireSpecialChars: true,
    allowPublicHosts: false,
    enforceSSL: true
  };

  private constructor() {}

  public static getInstance(): DatabaseSecurityValidator {
    if (!DatabaseSecurityValidator.instance) {
      DatabaseSecurityValidator.instance = new DatabaseSecurityValidator();
    }
    return DatabaseSecurityValidator.instance;
  }

  /**
   * Validate security of all registered databases
   */
  public validateAllDatabases(options: SecurityValidationOptions = {}): SecurityValidationResult[] {
    const opts = { ...this.defaultOptions, ...options };
    const databases = databaseRegistry.getAllDatabases();
    const results: SecurityValidationResult[] = [];

    logger.info(`🔒 Performing security validation for ${databases.length} databases`);

    databases.forEach(db => {
      try {
        const result = this.validateDatabaseSecurity(db.id, opts);
        results.push(result);
      } catch (error) {
        logger.error(`❌ Security validation failed for ${db.id}:`, error);
        results.push(this.createErrorResult(db, error));
      }
    });

    const summary = this.generateSecuritySummary(results);
    logger.info(`🔒 Security validation complete: ${summary.secure} secure, ${summary.warnings} warnings, ${summary.insecure} insecure, ${summary.critical} critical`);

    return results;
  }

  /**
   * Validate security of a specific database
   */
  public validateDatabaseSecurity(
    databaseId: string,
    options: SecurityValidationOptions = {}
  ): SecurityValidationResult {
    const opts = { ...this.defaultOptions, ...options };
    const dbDef = databaseRegistry.getDatabaseById(databaseId);

    if (!dbDef) {
      throw new Error(`Database definition not found: ${databaseId}`);
    }

    logger.debug(`🔒 Validating security for ${databaseId}`);

    const result: SecurityValidationResult = {
      databaseId,
      databaseName: dbDef.name,
      isValid: true,
      warnings: [],
      errors: [],
      securityLevel: 'secure',
      recommendations: [],
      details: {
        sslConfigured: false,
        weakPassword: false,
        passwordComplexity: this.analyzePasswordComplexity(dbDef.password),
        connectionSecurity: this.analyzeConnectionSecurity(dbDef),
        hostSecurity: this.analyzeHostSecurity(dbDef),
        complianceStatus: this.analyzeComplianceStatus(dbDef)
      }
    };

    // Perform security checks
    this.validateSSLConfiguration(dbDef, result, opts);
    this.validatePasswordSecurity(dbDef, result, opts);
    this.validateHostSecurity(dbDef, result, opts);
    this.validateConnectionSecurity(dbDef, result, opts);
    this.validateComplianceRequirements(dbDef, result, opts);

    // Determine overall security level
    this.determineSecurityLevel(result);

    // Generate recommendations
    this.generateSecurityRecommendations(result);

    return result;
  }

  /**
   * Analyze password complexity
   */
  private analyzePasswordComplexity(password: string): PasswordComplexity {
    const complexity: PasswordComplexity = {
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      score: 0,
      strength: 'very_weak'
    };

    // Calculate score
    let score = 0;
    if (complexity.length >= 8) score += 20;
    if (complexity.length >= 12) score += 20;
    if (complexity.hasUppercase) score += 15;
    if (complexity.hasLowercase) score += 15;
    if (complexity.hasNumbers) score += 15;
    if (complexity.hasSpecialChars) score += 15;

    complexity.score = Math.min(score, 100);

    // Determine strength
    if (complexity.score >= 80) complexity.strength = 'very_strong';
    else if (complexity.score >= 60) complexity.strength = 'strong';
    else if (complexity.score >= 40) complexity.strength = 'moderate';
    else if (complexity.score >= 20) complexity.strength = 'weak';
    else complexity.strength = 'very_weak';

    return complexity;
  }

  /**
   * Analyze connection security
   */
  private analyzeConnectionSecurity(dbDef: DatabaseDefinition): ConnectionSecurity {
    return {
      sslEnabled: dbDef.ssl,
      sslRequired: dbDef.type === 'production' || dbDef.priority === 'critical',
      encryptionStrength: dbDef.ssl ? 'TLS' : 'None',
      certificateValidation: dbDef.ssl, // Simplified - in real implementation, check cert validation
      connectionTimeout: 10000, // Default - should come from pool config
      maxConnections: dbDef.maxConnections,
      poolingEnabled: true // Always enabled in our implementation
    };
  }

  /**
   * Analyze host security
   */
  private analyzeHostSecurity(dbDef: DatabaseDefinition): HostSecurity {
    const host = dbDef.host;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const isPrivateIP = this.isPrivateIP(host);
    const isPublicIP = this.isPublicIP(host);
    const isProductionDomain = host.includes('danafin.com') || host.includes('ifrspro.id');

    let hostCategory: HostSecurity['hostCategory'];
    let riskLevel: HostSecurity['riskLevel'];

    if (isLocalhost) {
      hostCategory = 'localhost';
      riskLevel = 'low';
    } else if (isProductionDomain) {
      hostCategory = 'production';
      riskLevel = 'medium';
    } else if (isPrivateIP) {
      hostCategory = 'private';
      riskLevel = 'medium';
    } else if (isPublicIP) {
      hostCategory = 'public';
      riskLevel = 'high';
    } else {
      hostCategory = 'public';
      riskLevel = 'critical';
    }

    return {
      isLocalhost,
      isPrivateIP,
      isPublicIP,
      isProductionDomain,
      hostCategory,
      riskLevel
    };
  }

  /**
   * Analyze compliance status
   */
  private analyzeComplianceStatus(dbDef: DatabaseDefinition): ComplianceStatus {
    const isProduction = dbDef.type === 'production' || dbDef.priority === 'critical';
    const sslEnabled = dbDef.ssl;

    return {
      encryptionRequired: isProduction,
      encryptionCompliant: !isProduction || sslEnabled,
      auditTrailRequired: isProduction,
      auditTrailCompliant: true, // Assume compliant - in real implementation, check audit log setup
      gdprCompliant: sslEnabled, // Simplified GDPR check
      soxCompliant: isProduction && sslEnabled, // Simplified SOX check
      pciCompliant: false // Not typically applicable for internal databases
    };
  }

  /**
   * Validate SSL configuration
   */
  private validateSSLConfiguration(
    dbDef: DatabaseDefinition,
    result: SecurityValidationResult,
    options: SecurityValidationOptions
  ): void {
    const isProduction = dbDef.type === 'production' || dbDef.priority === 'critical';

    result.details.sslConfigured = dbDef.ssl;

    if (options.enforceSSL && isProduction && !dbDef.ssl) {
      result.isValid = false;
      result.errors.push('SSL is required for production databases');
    } else if (!dbDef.ssl) {
      result.warnings.push('SSL is not enabled - data will be transmitted in clear text');
    }

    if (dbDef.ssl) {
      result.recommendations.push('SSL is enabled for secure data transmission');
    }
  }

  /**
   * Validate password security
   */
  private validatePasswordSecurity(
    dbDef: DatabaseDefinition,
    result: SecurityValidationResult,
    options: SecurityValidationOptions
  ): void {
    if (!options.checkPasswordComplexity) return;

    const complexity = result.details.passwordComplexity;
    const minLength = options.minPasswordLength || 12;

    result.details.weakPassword = complexity.strength === 'very_weak' || complexity.strength === 'weak';

    if (complexity.length < minLength) {
      result.warnings.push(`Password length (${complexity.length}) is below recommended minimum (${minLength})`);
    }

    if (!complexity.hasUppercase) {
      result.warnings.push('Password should contain uppercase letters');
    }

    if (!complexity.hasNumbers) {
      result.warnings.push('Password should contain numbers');
    }

    if (options.requireSpecialChars && !complexity.hasSpecialChars) {
      result.warnings.push('Password should contain special characters');
    }

    if (result.details.weakPassword) {
      result.recommendations.push('Use a stronger password with mixed case, numbers, and special characters');
    }
  }

  /**
   * Validate host security
   */
  private validateHostSecurity(
    dbDef: DatabaseDefinition,
    result: SecurityValidationResult,
    options: SecurityValidationOptions
  ): void {
    const hostSecurity = result.details.hostSecurity;

    if (!options.checkHostSecurity) return;

    if (hostSecurity.hostCategory === 'public' && !options.allowPublicHosts) {
      result.errors.push('Public IP addresses are not allowed for database connections');
      result.isValid = false;
    }

    if (hostSecurity.riskLevel === 'critical') {
      result.errors.push('Database host poses critical security risk');
      result.isValid = false;
    }

    if (hostSecurity.riskLevel === 'high') {
      result.warnings.push('Database host poses high security risk');
      result.recommendations.push('Consider using private network or VPN for database access');
    }

    if (hostSecurity.isLocalhost) {
      result.recommendations.push('Localhost connection - suitable for development only');
    }
  }

  /**
   * Validate connection security
   */
  private validateConnectionSecurity(
    dbDef: DatabaseDefinition,
    result: SecurityValidationResult,
    options: SecurityValidationOptions
  ): void {
    const connSecurity = result.details.connectionSecurity;

    if (dbDef.maxConnections > 50) {
      result.warnings.push(`High connection limit (${dbDef.maxConnections}) may impact performance`);
    }

    if (dbDef.maxConnections < 5) {
      result.warnings.push(`Low connection limit (${dbDef.maxConnections}) may cause connection bottlenecks`);
    }

    if (!connSecurity.poolingEnabled) {
      result.errors.push('Connection pooling is required for production databases');
      result.isValid = false;
    }
  }

  /**
   * Validate compliance requirements
   */
  private validateComplianceRequirements(
    dbDef: DatabaseDefinition,
    result: SecurityValidationResult,
    options: SecurityValidationOptions
  ): void {
    if (!options.checkCompliance) return;

    const compliance = result.details.complianceStatus;

    if (compliance.encryptionRequired && !compliance.encryptionCompliant) {
      result.errors.push('Encryption is required for compliance but not configured');
      result.isValid = false;
    }

    if (compliance.auditTrailRequired && !compliance.auditTrailCompliant) {
      result.warnings.push('Audit trail is required for compliance');
    }

    // Compliance recommendations
    if (compliance.gdprCompliant) {
      result.recommendations.push('Configuration appears GDPR compliant');
    }

    if (compliance.soxCompliant) {
      result.recommendations.push('Configuration appears SOX compliant');
    }
  }

  /**
   * Determine overall security level
   */
  private determineSecurityLevel(result: SecurityValidationResult): void {
    if (result.errors.length > 0) {
      result.securityLevel = 'critical';
      result.isValid = false;
    } else if (result.warnings.length > 5) {
      result.securityLevel = 'insecure';
      result.isValid = false;
    } else if (result.warnings.length > 2) {
      result.securityLevel = 'warning';
    } else if (result.warnings.length > 0) {
      result.securityLevel = 'warning';
    } else {
      result.securityLevel = 'secure';
    }
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(result: SecurityValidationResult): void {
    if (result.recommendations.length === 0) {
      result.recommendations.push('Database configuration appears secure');
    }

    // Add general recommendations based on type
    const dbDef = databaseRegistry.getDatabaseById(result.databaseId);
    if (dbDef) {
      if (dbDef.type === 'production') {
        result.recommendations.push('Ensure regular security audits for production databases');
        result.recommendations.push('Implement database activity monitoring');
      }

      if (dbDef.priority === 'critical') {
        result.recommendations.push('Consider implementing failover and backup strategies');
      }
    }
  }

  /**
   * Generate security summary
   */
  private generateSecuritySummary(results: SecurityValidationResult[]): {
    total: number;
    secure: number;
    warnings: number;
    insecure: number;
    critical: number;
  } {
    return {
      total: results.length,
      secure: results.filter(r => r.securityLevel === 'secure').length,
      warnings: results.filter(r => r.securityLevel === 'warning').length,
      insecure: results.filter(r => r.securityLevel === 'insecure').length,
      critical: results.filter(r => r.securityLevel === 'critical').length
    };
  }

  /**
   * Create error result for failed validation
   */
  private createErrorResult(dbDef: DatabaseDefinition, error: any): SecurityValidationResult {
    return {
      databaseId: dbDef.id,
      databaseName: dbDef.name,
      isValid: false,
      warnings: [],
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
      securityLevel: 'critical',
      recommendations: ['Fix validation errors and retry'],
      details: {
        sslConfigured: false,
        weakPassword: false,
        passwordComplexity: this.analyzePasswordComplexity(''),
        connectionSecurity: this.analyzeConnectionSecurity(dbDef),
        hostSecurity: this.analyzeHostSecurity(dbDef),
        complianceStatus: this.analyzeComplianceStatus(dbDef)
      }
    };
  }

  /**
   * Check if IP address is private
   */
  private isPrivateIP(host: string): boolean {
    // Basic check for private IP ranges
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./
    ];

    return privateRanges.some(range => range.test(host));
  }

  /**
   * Check if IP address is public
   */
  private isPublicIP(host: string): boolean {
    // Basic check - in real implementation, use proper IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(host)) return false;

    return !this.isPrivateIP(host) && !this.isLocalhost(host);
  }

  /**
   * Check if host is localhost
   */
  private isLocalhost(host: string): boolean {
    return host === 'localhost' || host === '127.0.0.1';
  }

  /**
   * Update default validation options
   */
  public setDefaultOptions(options: Partial<SecurityValidationOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    logger.info('🔒 Updated default security validation options');
  }

  /**
   * Get current default options
   */
  public getDefaultOptions(): SecurityValidationOptions {
    return { ...this.defaultOptions };
  }
}

// Export singleton instance
export const databaseSecurityValidator = DatabaseSecurityValidator.getInstance();