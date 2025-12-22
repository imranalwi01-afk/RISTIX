// packages/backend/src/api/routes/security-config.routes.ts
// ============================================================================
// 🔒 SECURITY CONFIGURATION ROUTES - REST API for security management
// ============================================================================
// Based on TodoList-v2.md Hour 5 requirements
// Features: Encryption, MFA, security policies, password management
// ============================================================================

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  securityConfigController,
  validateEncryptionRequest,
  validateDecryptionRequest,
  validatePasswordRequest,
  validateMFASetupRequest,
  validateTokenGenerationRequest
} from '../controllers/security-config.controller';

const router = Router();

// ============================================================================
// 🛡️ MIDDLEWARE STACK
// ============================================================================

// Apply authentication to all routes
router.use(authMiddleware);

// Note: No tenant middleware - security services are platform-wide

// ============================================================================
// 📋 SERVICE INFORMATION
// ============================================================================

/**
 * @route   GET /api/v1/security/config
 * @desc    Get security service information and configuration
 * @access  Protected (requires authentication)
 */
router.get('/',
  securityConfigController.getServiceInfo.bind(securityConfigController)
);

// ============================================================================
// 🔐 ENCRYPTION SERVICES
// ============================================================================

/**
 * @route   POST /api/v1/security/config/encryption/encrypt
 * @desc    Encrypt sensitive data
 * @access  Protected (requires authentication)
 * @body    { data: string }
 */
router.post('/encryption/encrypt',
  validateEncryptionRequest,
  securityConfigController.encryptData.bind(securityConfigController)
);

/**
 * @route   POST /api/v1/security/config/encryption/decrypt
 * @desc    Decrypt sensitive data
 * @access  Protected (requires authentication)
 * @body    { encryptedData: EncryptedData }
 */
router.post('/encryption/decrypt',
  validateDecryptionRequest,
  securityConfigController.decryptData.bind(securityConfigController)
);

// ============================================================================
// 🛡️ PASSWORD MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/v1/security/config/password/validate
 * @desc    Validate password against security policy
 * @access  Protected (requires authentication)
 * @body    { password: string, tenantId?: string }
 */
router.post('/password/validate',
  validatePasswordRequest,
  securityConfigController.validatePassword.bind(securityConfigController)
);

/**
 * @route   POST /api/v1/security/config/password/hash
 * @desc    Hash password with security policy validation
 * @access  Protected (requires authentication)
 * @body    { password: string, tenantId?: string }
 */
router.post('/password/hash',
  validatePasswordRequest,
  securityConfigController.hashPassword.bind(securityConfigController)
);

// ============================================================================
// 🔄 MFA MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/v1/security/config/mfa/:userId/totp/setup
 * @desc    Setup TOTP MFA for user
 * @access  Protected (requires authentication)
 * @params  userId - UUID of the user
 * @body    { userEmail: string }
 */
router.post('/mfa/:userId/totp/setup',
  validateMFASetupRequest,
  securityConfigController.setupTOTPMFA.bind(securityConfigController)
);

/**
 * @route   POST /api/v1/security/config/mfa/:userId/backup-codes
 * @desc    Generate MFA backup codes
 * @access  Protected (requires authentication)
 * @params  userId - UUID of the user
 */
router.post('/mfa/:userId/backup-codes',
  validateMFASetupRequest.slice(0, 1), // Only validate userId param
  securityConfigController.generateBackupCodes.bind(securityConfigController)
);

// ============================================================================
// 🛡️ SECURITY POLICIES
// ============================================================================

/**
 * @route   GET /api/v1/security/config/policies
 * @desc    Get security policies for tenant or default
 * @access  Protected (requires authentication)
 * @query   ?tenantId=uuid
 */
router.get('/policies',
  securityConfigController.getSecurityPolicies.bind(securityConfigController)
);

// ============================================================================
// 🔧 UTILITY SERVICES
// ============================================================================

/**
 * @route   POST /api/v1/security/config/token/generate
 * @desc    Generate secure random token
 * @access  Protected (requires authentication)
 * @body    { length?: number }
 */
router.post('/token/generate',
  validateTokenGenerationRequest,
  securityConfigController.generateSecureToken.bind(securityConfigController)
);

export default router;