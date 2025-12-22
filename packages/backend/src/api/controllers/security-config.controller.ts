// packages/backend/src/api/controllers/security-config.controller.ts
// ============================================================================
// 🔒 SECURITY CONFIGURATION CONTROLLER - REST API for security management
// ============================================================================
// Based on TodoList-v2.md Hour 5 requirements
// Features: Encryption management, MFA configuration, security policies
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { 
  securityConfigService,
  SecurityPolicy,
  EncryptionConfig,
  MFAConfig
} from '../../core/services/security/security-config.service';

export class SecurityConfigController {

  // ============================================================================
  // 📋 SERVICE INFORMATION
  // ============================================================================

  /**
   * Get security service information
   * GET /api/v1/security/config
   */
  public async getServiceInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encryptionConfig = securityConfigService.getEncryptionConfig();
      const mfaConfig = securityConfigService.getMFAConfig();

      // Remove sensitive information
      const safeEncryptionConfig = {
        algorithm: encryptionConfig.algorithm,
        keyLength: encryptionConfig.keyLength,
        keyRotationInterval: encryptionConfig.keyRotationInterval,
        lastKeyRotation: encryptionConfig.lastKeyRotation
      };

      const safeMfaConfig = {
        enabled: mfaConfig.enabled,
        methods: mfaConfig.methods,
        totpConfig: {
          issuer: mfaConfig.totpConfig.issuer,
          algorithm: mfaConfig.totpConfig.algorithm,
          digits: mfaConfig.totpConfig.digits,
          period: mfaConfig.totpConfig.period
        },
        backupCodes: {
          enabled: mfaConfig.backupCodes.enabled,
          codeCount: mfaConfig.backupCodes.codeCount,
          codeLength: mfaConfig.backupCodes.codeLength
        }
      };

      res.json({
        success: true,
        service: 'Security Configuration Service',
        version: '1.0.0',
        description: 'Encryption, MFA, and security policy management for IFRS9 Multi-Tenant Platform',
        features: [
          'Data encryption/decryption',
          'Multi-factor authentication (MFA)',
          'Security policy management',
          'Password policy enforcement',
          'Security event logging',
          'Key rotation management',
          'TOTP/SMS/Email MFA support',
          'Backup codes generation'
        ],
        endpoints: {
          service_info: 'GET /security/config',
          encryption: 'POST /security/config/encryption',
          mfa_setup: 'POST /security/config/mfa/:userId/setup',
          security_policies: 'GET /security/config/policies',
          password_validation: 'POST /security/config/password/validate'
        },
        configuration: {
          encryption: safeEncryptionConfig,
          mfa: safeMfaConfig
        },
        meta: {
          timestamp: new Date().toISOString(),
          uptime: Math.floor(process.uptime())
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🔐 ENCRYPTION SERVICES
  // ============================================================================

  /**
   * Encrypt data
   * POST /api/v1/security/config/encryption/encrypt
   */
  public async encryptData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { data } = req.body;
      const userId = (req as any).user?.id;

      // Encrypt the data
      const encryptedData = securityConfigService.encrypt(data);

      // Log security event
      securityConfigService.logSecurityEvent({
        type: 'encryption',
        severity: 'low',
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'data_encryption',
          dataLength: data.length,
          algorithm: encryptedData.algorithm,
          keyVersion: encryptedData.keyVersion
        }
      });

      res.json({
        success: true,
        data: {
          encrypted: encryptedData,
          metadata: {
            algorithm: encryptedData.algorithm,
            keyVersion: encryptedData.keyVersion,
            originalLength: data.length,
            encryptedLength: encryptedData.data.length
          }
        },
        message: 'Data encrypted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.get('X-Request-ID')
        }
      });

    } catch (error) {
      // Log encryption failure
      securityConfigService.logSecurityEvent({
        type: 'encryption',
        severity: 'medium',
        userId: (req as any).user?.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'encryption_failed',
          error: error.message
        }
      });

      next(error);
    }
  }

  /**
   * Decrypt data
   * POST /api/v1/security/config/encryption/decrypt
   */
  public async decryptData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { encryptedData } = req.body;
      const userId = (req as any).user?.id;

      // Decrypt the data
      const decryptedData = securityConfigService.decrypt(encryptedData);

      // Log security event
      securityConfigService.logSecurityEvent({
        type: 'encryption',
        severity: 'low',
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'data_decryption',
          keyVersion: encryptedData.keyVersion,
          algorithm: encryptedData.algorithm
        }
      });

      res.json({
        success: true,
        data: {
          decrypted: decryptedData,
          metadata: {
            originalKeyVersion: encryptedData.keyVersion,
            originalAlgorithm: encryptedData.algorithm
          }
        },
        message: 'Data decrypted successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      // Log decryption failure
      securityConfigService.logSecurityEvent({
        type: 'encryption',
        severity: 'high',
        userId: (req as any).user?.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'decryption_failed',
          error: error.message
        }
      });

      next(error);
    }
  }

  // ============================================================================
  // 🛡️ PASSWORD MANAGEMENT
  // ============================================================================

  /**
   * Validate password against security policy
   * POST /api/v1/security/config/password/validate
   */
  public async validatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { password, tenantId } = req.body;
      const userId = (req as any).user?.id;

      // Get security policy
      const policy = securityConfigService.getSecurityPolicy(tenantId);
      
      // Validate password
      const validation = securityConfigService.validatePassword(password, policy);

      // Log validation attempt
      securityConfigService.logSecurityEvent({
        type: 'authentication',
        severity: 'low',
        userId,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'password_validation',
          valid: validation.valid,
          strength: validation.strength,
          policyId: policy.id
        }
      });

      res.json({
        success: true,
        data: {
          valid: validation.valid,
          strength: validation.strength,
          errors: validation.errors,
          policy: {
            id: policy.id,
            name: policy.name,
            requirements: policy.passwordPolicy
          }
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Hash password
   * POST /api/v1/security/config/password/hash
   */
  public async hashPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { password, tenantId } = req.body;
      const userId = (req as any).user?.id;

      // Get security policy
      const policy = securityConfigService.getSecurityPolicy(tenantId);

      // Hash password with policy validation
      const hashedPassword = await securityConfigService.hashPassword(password, policy);

      // Log password hashing
      securityConfigService.logSecurityEvent({
        type: 'authentication',
        severity: 'low',
        userId,
        tenantId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'password_hashing',
          policyId: policy.id
        }
      });

      res.json({
        success: true,
        data: {
          hash: hashedPassword,
          algorithm: 'bcrypt',
          policy: policy.id
        },
        message: 'Password hashed successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🔄 MFA MANAGEMENT
  // ============================================================================

  /**
   * Setup TOTP MFA for user
   * POST /api/v1/security/config/mfa/:userId/totp/setup
   */
  public async setupTOTPMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { userId } = req.params;
      const { userEmail } = req.body;
      const requestingUserId = (req as any).user?.id;

      // Generate TOTP secret
      const secret = securityConfigService.generateTOTPSecret();
      
      // Generate QR code URL
      const qrCodeURL = securityConfigService.generateTOTPQRCodeURL(userEmail, secret);

      // Generate backup codes
      const backupCodes = securityConfigService.generateMFABackupCodes();

      // Log MFA setup
      securityConfigService.logSecurityEvent({
        type: 'mfa',
        severity: 'medium',
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'totp_mfa_setup',
          targetUserId: userId,
          method: 'totp'
        }
      });

      res.json({
        success: true,
        data: {
          secret,
          qrCodeURL,
          backupCodes,
          instructions: {
            step1: 'Scan the QR code with your authenticator app',
            step2: 'Enter the 6-digit code from your app to verify setup',
            step3: 'Save the backup codes in a secure location'
          }
        },
        message: 'TOTP MFA setup initiated',
        meta: {
          timestamp: new Date().toISOString(),
          userId
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate MFA backup codes
   * POST /api/v1/security/config/mfa/:userId/backup-codes
   */
  public async generateBackupCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { userId } = req.params;
      const requestingUserId = (req as any).user?.id;

      // Generate new backup codes
      const backupCodes = securityConfigService.generateMFABackupCodes();

      // Log backup codes generation
      securityConfigService.logSecurityEvent({
        type: 'mfa',
        severity: 'medium',
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'backup_codes_generated',
          targetUserId: userId,
          codeCount: backupCodes.length
        }
      });

      res.json({
        success: true,
        data: {
          backupCodes,
          warning: 'These codes can only be used once. Store them securely.',
          instructions: [
            'Save these codes in a secure location',
            'Each code can only be used once',
            'Use these codes if you lose access to your primary MFA device'
          ]
        },
        message: 'MFA backup codes generated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          userId
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // 🛡️ SECURITY POLICIES
  // ============================================================================

  /**
   * Get security policies
   * GET /api/v1/security/config/policies
   */
  public async getSecurityPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.query;
      
      // Get security policy
      const policy = securityConfigService.getSecurityPolicy(tenantId as string);

      res.json({
        success: true,
        data: {
          policy,
          effective: {
            tenantSpecific: !!tenantId && policy.tenantId === tenantId,
            policyId: policy.id,
            lastUpdated: policy.updatedAt
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantId || null
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate secure token
   * POST /api/v1/security/config/token/generate
   */
  public async generateSecureToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { length = 32 } = req.body;
      const userId = (req as any).user?.id;

      // Generate secure token
      const token = securityConfigService.generateSecureToken(length);

      // Log token generation
      securityConfigService.logSecurityEvent({
        type: 'encryption',
        severity: 'low',
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          action: 'secure_token_generated',
          tokenLength: length
        }
      });

      res.json({
        success: true,
        data: {
          token,
          length,
          entropy: Math.log2(Math.pow(16, length)),
          warning: 'Store this token securely. It cannot be retrieved again.'
        },
        message: 'Secure token generated successfully',
        meta: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

// ============================================================================
// 🔧 VALIDATION MIDDLEWARE
// ============================================================================

export const validateEncryptionRequest = [
  body('data')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Data must be between 1 and 10000 characters')
];

export const validateDecryptionRequest = [
  body('encryptedData')
    .isObject()
    .withMessage('Encrypted data must be an object'),
  body('encryptedData.data')
    .isString()
    .withMessage('Encrypted data.data must be a string'),
  body('encryptedData.iv')
    .isString()
    .withMessage('Encrypted data.iv must be a string'),
  body('encryptedData.salt')
    .isString()
    .withMessage('Encrypted data.salt must be a string'),
  body('encryptedData.keyVersion')
    .isString()
    .withMessage('Encrypted data.keyVersion must be a string')
];

export const validatePasswordRequest = [
  body('password')
    .isLength({ min: 1, max: 200 })
    .withMessage('Password is required and must not exceed 200 characters'),
  body('tenantId')
    .optional()
    .isUUID()
    .withMessage('Tenant ID must be a valid UUID')
];

export const validateMFASetupRequest = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('userEmail')
    .isEmail()
    .withMessage('Valid email address is required')
];

export const validateTokenGenerationRequest = [
  body('length')
    .optional()
    .isInt({ min: 8, max: 128 })
    .withMessage('Token length must be between 8 and 128')
];

// Export controller instance
export const securityConfigController = new SecurityConfigController();