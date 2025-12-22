// packages/backend/src/core/services/security/security-config.service.ts
// ============================================================================
// 🔒 SECURITY CONFIGURATION SERVICE - Encryption, MFA, and security policy management
// ============================================================================
// Based on TodoList-v2.md Hour 5 requirements and coding standards
// Features: Data encryption, MFA configuration, security policies, audit logging
// ============================================================================

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import { EventEmitter } from 'events';
import { configService } from '../configuration/configuration.service';

// ============================================================================
// 🔧 SECURITY INTERFACES
// ============================================================================

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
  masterKey: string;
  keyRotationInterval: number; // days
  lastKeyRotation: Date;
}

export interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email')[];
  totpConfig: {
    issuer: string;
    algorithm: 'SHA1' | 'SHA256' | 'SHA512';
    digits: number;
    period: number;
    window: number;
  };
  smsConfig: {
    provider: string;
    apiKey?: string;
    templateId?: string;
    validityMinutes: number;
  };
  emailConfig: {
    templateId: string;
    validityMinutes: number;
    fromAddress: string;
  };
  backupCodes: {
    enabled: boolean;
    codeCount: number;
    codeLength: number;
  };
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  tenantId?: string; // null for global policies
  
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    maxAge: number; // days
    lockoutAttempts: number;
    lockoutDuration: number; // minutes
  };

  sessionPolicy: {
    maxDuration: number; // minutes
    idleTimeout: number; // minutes
    maxConcurrentSessions: number;
    requireSecureConnection: boolean;
    ipWhitelist?: string[];
    geoRestrictions?: string[];
  };

  accessPolicy: {
    allowedHours?: string; // "09:00-17:00"
    allowedDays?: number[]; // [1,2,3,4,5] for weekdays
    timezone: string;
    ipRestrictions: boolean;
    geoBlocking: boolean;
    vpnDetection: boolean;
  };

  auditPolicy: {
    logAllActions: boolean;
    sensitiveDataMasking: boolean;
    retentionDays: number;
    realTimeAlerts: boolean;
    exportEnabled: boolean;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'encryption' | 'mfa' | 'policy_violation' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  algorithm: string;
  keyVersion: string;
}

// ============================================================================
// 🔒 SECURITY CONFIGURATION SERVICE
// ============================================================================

export class SecurityConfigService extends EventEmitter {
  private static instance: SecurityConfigService;
  private encryptionConfig: EncryptionConfig;
  private mfaConfig: MFAConfig;
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private encryptionKeys: Map<string, Buffer> = new Map();
  private currentKeyVersion: string;

  private constructor() {
    super();
    this.initializeSecurityConfig();
  }

  public static getInstance(): SecurityConfigService {
    if (!SecurityConfigService.instance) {
      SecurityConfigService.instance = new SecurityConfigService();
    }
    return SecurityConfigService.instance;
  }

  // ============================================================================
  // 🚀 INITIALIZATION
  // ============================================================================

  /**
   * Initialize security configuration
   */
  private async initializeSecurityConfig(): Promise<void> {
    try {
      console.log('🔒 Initializing Security Configuration Service...');

      // Load encryption configuration
      this.encryptionConfig = await this.loadEncryptionConfig();
      
      // Load MFA configuration
      this.mfaConfig = await this.loadMFAConfig();

      // Initialize encryption keys
      await this.initializeEncryptionKeys();

      // Load security policies
      await this.loadSecurityPolicies();

      // Start key rotation monitoring
      this.startKeyRotationMonitoring();

      console.log('✅ Security Configuration Service initialized');
      this.emit('security:initialized');

    } catch (error) {
      console.error('❌ Failed to initialize Security Configuration Service:', error);
      throw error;
    }
  }

  /**
   * Load encryption configuration
   */
  private async loadEncryptionConfig(): Promise<EncryptionConfig> {
    const defaultConfig: EncryptionConfig = {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      saltLength: 32,
      iterations: 100000,
      masterKey: this.getMasterKey(),
      keyRotationInterval: parseInt(configService.get('KEY_ROTATION_DAYS', '90')),
      lastKeyRotation: new Date()
    };

    // Load from database if available
    try {
      const dbConfig = await configService.getTenantConfiguration('security', 'encryption');
      return { ...defaultConfig, ...dbConfig };
    } catch (error) {
      console.warn('Using default encryption configuration');
      return defaultConfig;
    }
  }

  /**
   * Load MFA configuration
   */
  private async loadMFAConfig(): Promise<MFAConfig> {
    const defaultConfig: MFAConfig = {
      enabled: configService.getBoolean('MFA_ENABLED', true),
      methods: ['totp', 'email'],
      totpConfig: {
        issuer: configService.get('MFA_TOTP_ISSUER', 'IFRS Pro Platform'),
        algorithm: 'SHA256',
        digits: 6,
        period: 30,
        window: 1
      },
      smsConfig: {
        provider: configService.get('SMS_PROVIDER', 'twilio'),
        validityMinutes: 5
      },
      emailConfig: {
        templateId: 'mfa-verification',
        validityMinutes: 10,
        fromAddress: configService.get('MFA_EMAIL_FROM', 'security@ifrspro.id')
      },
      backupCodes: {
        enabled: true,
        codeCount: 10,
        codeLength: 8
      }
    };

    // Load from database if available
    try {
      const dbConfig = await configService.getTenantConfiguration('security', 'mfa');
      return { ...defaultConfig, ...dbConfig };
    } catch (error) {
      console.warn('Using default MFA configuration');
      return defaultConfig;
    }
  }

  // ============================================================================
  // 🔐 ENCRYPTION SERVICES
  // ============================================================================

  /**
   * Initialize encryption keys
   */
  private async initializeEncryptionKeys(): Promise<void> {
    // Generate current key version
    this.currentKeyVersion = `v${Date.now()}`;
    
    // Derive key from master key
    const derivedKey = crypto.pbkdf2Sync(
      this.encryptionConfig.masterKey,
      'ifrs-pro-platform',
      this.encryptionConfig.iterations,
      this.encryptionConfig.keyLength,
      'sha512'
    );

    this.encryptionKeys.set(this.currentKeyVersion, derivedKey);
    console.log(`🔑 Encryption key initialized: ${this.currentKeyVersion}`);
  }

  /**
   * Encrypt sensitive data
   */
  public encrypt(data: string, keyVersion?: string): EncryptedData {
    try {
      const version = keyVersion || this.currentKeyVersion;
      const key = this.encryptionKeys.get(version);
      
      if (!key) {
        throw new Error(`Encryption key not found: ${version}`);
      }

      const iv = crypto.randomBytes(this.encryptionConfig.ivLength);
      const salt = crypto.randomBytes(this.encryptionConfig.saltLength);

      const cipher = crypto.createCipher(this.encryptionConfig.algorithm, key);
      cipher.setAAD(salt);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();
      const encryptedWithAuth = encrypted + authTag.toString('hex');

      return {
        data: encryptedWithAuth,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        algorithm: this.encryptionConfig.algorithm,
        keyVersion: version
      };

    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decrypt(encryptedData: EncryptedData): string {
    try {
      const key = this.encryptionKeys.get(encryptedData.keyVersion);
      
      if (!key) {
        throw new Error(`Decryption key not found: ${encryptedData.keyVersion}`);
      }

      const authTag = Buffer.from(encryptedData.data.slice(-32), 'hex');
      const encrypted = encryptedData.data.slice(0, -32);

      const decipher = crypto.createDecipher(encryptedData.algorithm, key);
      decipher.setAAD(Buffer.from(encryptedData.salt, 'hex'));
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Hash password with security policies
   */
  public async hashPassword(password: string, policy?: SecurityPolicy): Promise<string> {
    // Validate password against policy
    if (policy) {
      const validation = this.validatePassword(password, policy);
      if (!validation.valid) {
        throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
      }
    }

    const saltRounds = configService.getNumber('BCRYPT_ROUNDS', 12);
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password hash
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('❌ Password verification failed:', error);
      return false;
    }
  }

  /**
   * Generate secure random token
   */
  public generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // ============================================================================
  // 🛡️ SECURITY POLICIES
  // ============================================================================

  /**
   * Load security policies from database
   */
  private async loadSecurityPolicies(): Promise<void> {
    try {
      // This would load from database in production
      const defaultPolicy = this.createDefaultSecurityPolicy();
      this.securityPolicies.set('default', defaultPolicy);
      
      console.log(`✅ Loaded ${this.securityPolicies.size} security policies`);
    } catch (error) {
      console.error('❌ Failed to load security policies:', error);
    }
  }

  /**
   * Create default security policy
   */
  private createDefaultSecurityPolicy(): SecurityPolicy {
    return {
      id: 'default',
      name: 'Default Security Policy',
      description: 'Standard security policy for IFRS Pro Platform',
      tenantId: null,

      passwordPolicy: {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventReuse: 5,
        maxAge: 90,
        lockoutAttempts: 5,
        lockoutDuration: 30
      },

      sessionPolicy: {
        maxDuration: 480, // 8 hours
        idleTimeout: 60, // 1 hour
        maxConcurrentSessions: 3,
        requireSecureConnection: true,
        ipWhitelist: undefined,
        geoRestrictions: undefined
      },

      accessPolicy: {
        allowedHours: undefined, // 24/7
        allowedDays: undefined, // All days
        timezone: 'Asia/Jakarta',
        ipRestrictions: false,
        geoBlocking: false,
        vpnDetection: true
      },

      auditPolicy: {
        logAllActions: true,
        sensitiveDataMasking: true,
        retentionDays: 365,
        realTimeAlerts: true,
        exportEnabled: false
      },

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };
  }

  /**
   * Get security policy for tenant
   */
  public getSecurityPolicy(tenantId?: string): SecurityPolicy {
    // Try tenant-specific policy first
    if (tenantId) {
      const tenantPolicy = this.securityPolicies.get(`tenant_${tenantId}`);
      if (tenantPolicy && tenantPolicy.isActive) {
        return tenantPolicy;
      }
    }

    // Fall back to default policy
    const defaultPolicy = this.securityPolicies.get('default');
    if (!defaultPolicy) {
      throw new Error('No security policy available');
    }

    return defaultPolicy;
  }

  /**
   * Validate password against security policy
   */
  public validatePassword(password: string, policy?: SecurityPolicy): {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  } {
    const activePolicy = policy || this.getSecurityPolicy();
    const errors: string[] = [];

    // Length check
    if (password.length < activePolicy.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${activePolicy.passwordPolicy.minLength} characters`);
    }
    if (password.length > activePolicy.passwordPolicy.maxLength) {
      errors.push(`Password must not exceed ${activePolicy.passwordPolicy.maxLength} characters`);
    }

    // Character requirements
    if (activePolicy.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (activePolicy.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (activePolicy.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (activePolicy.passwordPolicy.requireSymbols && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one symbol');
    }

    // Calculate strength
    let strengthScore = 0;
    strengthScore += Math.min(password.length / 4, 5);
    strengthScore += /[A-Z]/.test(password) ? 2 : 0;
    strengthScore += /[a-z]/.test(password) ? 2 : 0;
    strengthScore += /\d/.test(password) ? 2 : 0;
    strengthScore += /[!@#$%^&*(),.?\":{}|<>]/.test(password) ? 3 : 0;

    let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    if (strengthScore < 8) strength = 'weak';
    else if (strengthScore < 12) strength = 'medium';
    else if (strengthScore < 16) strength = 'strong';
    else strength = 'very_strong';

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  }

  // ============================================================================
  // 🔄 MFA SERVICES
  // ============================================================================

  /**
   * Generate TOTP secret for user
   */
  public generateTOTPSecret(): string {
    return crypto.randomBytes(32).toString('base32');
  }

  /**
   * Generate TOTP QR code URL
   */
  public generateTOTPQRCodeURL(userEmail: string, secret: string): string {
    const issuer = encodeURIComponent(this.mfaConfig.totpConfig.issuer);
    const label = encodeURIComponent(`${this.mfaConfig.totpConfig.issuer}:${userEmail}`);
    
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=${this.mfaConfig.totpConfig.algorithm}&digits=${this.mfaConfig.totpConfig.digits}&period=${this.mfaConfig.totpConfig.period}`;
  }

  /**
   * Generate backup codes for MFA
   */
  public generateMFABackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.mfaConfig.backupCodes.codeCount; i++) {
      codes.push(this.generateSecureToken(this.mfaConfig.backupCodes.codeLength / 2));
    }
    
    return codes;
  }

  // ============================================================================
  // 📊 SECURITY MONITORING
  // ============================================================================

  /**
   * Log security event
   */
  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    };

    console.log(`🚨 Security Event [${securityEvent.severity.toUpperCase()}]: ${securityEvent.type}`);
    
    // Emit event for real-time monitoring
    this.emit('security:event', securityEvent);

    // Store in database (in production)
    // await this.storeSecurityEvent(securityEvent);

    // Send alerts for high/critical events
    if (['high', 'critical'].includes(securityEvent.severity)) {
      this.emit('security:alert', securityEvent);
    }
  }

  // ============================================================================
  // 🔄 KEY ROTATION
  // ============================================================================

  /**
   * Start key rotation monitoring
   */
  private startKeyRotationMonitoring(): void {
    // Check every hour
    setInterval(() => {
      this.checkKeyRotation();
    }, 60 * 60 * 1000);
  }

  /**
   * Check if key rotation is needed
   */
  private checkKeyRotation(): void {
    const daysSinceRotation = Math.floor(
      (Date.now() - this.encryptionConfig.lastKeyRotation.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceRotation >= this.encryptionConfig.keyRotationInterval) {
      console.log('🔄 Key rotation required');
      this.emit('security:key-rotation-required');
    }
  }

  /**
   * Get or generate master key with proper persistence
   */
  private getMasterKey(): string {
    const envKey = configService.get('ENCRYPTION_MASTER_KEY');
    if (envKey) {
      console.log('🔑 Using master key from environment variables');
      return envKey;
    }

    // Check if we have a persistent key (for development)
    const persistentKeyPath = path.join(process.cwd(), '.encryption-key');
    try {
      if (require('fs').existsSync(persistentKeyPath)) {
        const persistentKey = require('fs').readFileSync(persistentKeyPath, 'utf8').trim();
        console.log('🔑 Using persistent master key from .encryption-key file');
        return persistentKey;
      }
    } catch (error) {
      console.warn('Failed to read persistent encryption key:', error.message);
    }

    // Generate new key
    const newKey = this.generateNewMasterKey();
    
    // In development, save key to file for persistence across restarts
    if (process.env.NODE_ENV === 'development') {
      try {
        require('fs').writeFileSync(persistentKeyPath, newKey, 'utf8');
        console.log('💾 Master key saved to .encryption-key for development persistence');
        console.log('📝 Add .encryption-key to .gitignore to prevent accidental commits');
      } catch (error) {
        console.warn('Failed to save persistent encryption key:', error.message);
      }
    }

    return newKey;
  }

  /**
   * Generate new master key with appropriate warnings
   */
  private generateNewMasterKey(): string {
    const key = crypto.randomBytes(64).toString('hex');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 CRITICAL: Generated new master key in production! Set ENCRYPTION_MASTER_KEY environment variable!');
      console.error('🚨 Previously encrypted data may become unreadable!');
      console.error('🚨 Generated key:', key.substring(0, 16) + '...');
    } else {
      console.warn('⚠️ Generated new master key for development');
      console.log('💡 To avoid this warning, set ENCRYPTION_MASTER_KEY in your .env file');
      console.log('💡 Development key preview:', key.substring(0, 16) + '...');
    }
    
    return key;
  }

  // ============================================================================
  // 🔧 UTILITY METHODS
  // ============================================================================

  /**
   * Get encryption configuration
   */
  public getEncryptionConfig(): EncryptionConfig {
    return { ...this.encryptionConfig };
  }

  /**
   * Get MFA configuration
   */
  public getMFAConfig(): MFAConfig {
    return { ...this.mfaConfig };
  }

  /**
   * Update security policy
   */
  public async updateSecurityPolicy(policy: SecurityPolicy): Promise<void> {
    policy.updatedAt = new Date();
    this.securityPolicies.set(policy.id, policy);
    
    // Persist to database
    await this.persistSecurityPolicy(policy);
    
    this.emit('security:policy-updated', policy);
    console.log(`✅ Security policy updated: ${policy.name}`);
  }

  /**
   * Persist security policy to database (placeholder)
   */
  private async persistSecurityPolicy(policy: SecurityPolicy): Promise<void> {
    // This would save to database in production
    console.log(`💾 Persisting security policy: ${policy.id}`);
  }
}

// Export singleton instance
export const securityConfigService = SecurityConfigService.getInstance();

// Export types
export type {
  EncryptionConfig,
  MFAConfig,
  SecurityPolicy,
  SecurityEvent,
  EncryptedData
};