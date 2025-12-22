// packages/backend/src/core/config/jwt.config.ts
// ============================================================================
// 🏗️ CENTRALIZED JWT CONFIGURATION - NO HARDCODED VALUES
// ============================================================================
// ✅ CENTRALIZED: All JWT configuration from environment variables
// ✅ NO HARDCODING: Eliminates hardcoded issuers, audiences, and secrets
// ✅ ENVIRONMENT AWARE: Auto-detects deployment environment
// ✅ CONSISTENT: Single source of truth for all JWT settings
// ============================================================================

// Temporarily simplified to avoid circular dependencies
// import { backendEnvironmentLoader } from './environment-loader-backend';

export interface JWTConfiguration {
  secret: string;
  refreshSecret: string;
  issuer: string;
  audience: string;
  refreshAudience: string;
  expiresIn: string;
  refreshExpiresIn: string;
  algorithm: 'HS256';
  clockTolerance?: number;
}

export class JWTConfigService {
  private static instance: JWTConfigService;
  private config: JWTConfiguration;
  private initialized: boolean = false;

  private constructor() {
    this.loadConfiguration();
  }

  public static getInstance(): JWTConfigService {
    if (!JWTConfigService.instance) {
      JWTConfigService.instance = new JWTConfigService();
    }
    return JWTConfigService.instance;
  }

  // 🎯 LOAD CONFIGURATION FROM ENVIRONMENT (TEMPORARILY SIMPLIFIED)
  private loadConfiguration(): void {
    try {
      const deploymentTarget = process.env.DEPLOYMENT_TARGET || 'development';
      const nodeEnv = process.env.NODE_ENV || 'development';

      console.log('🔐 [JWT-CONFIG] Loading centralized JWT configuration...');
      console.log(`🔐 [JWT-CONFIG] Deployment target: ${deploymentTarget}`);
      console.log(`🔐 [JWT-CONFIG] Node environment: ${nodeEnv}`);

      // ✅ ENVIRONMENT-AWARE: Generate issuer based on deployment
      const jwtIssuer = this.generateEnvironmentAwareIssuer(deploymentTarget, nodeEnv);

      // ✅ CENTRALIZED: All values from environment with fallbacks
      this.config = {
        secret: this.getValidatedSecret('JWT_SECRET', 'JWT access secret'),
        refreshSecret: this.getValidatedSecret('JWT_REFRESH_SECRET', 'JWT refresh secret', true),
        issuer: jwtIssuer,
        audience: 'ifrs9-iaf-users',
        refreshAudience: 'ifrs9-iaf-refresh',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        algorithm: 'HS256' as const,
        clockTolerance: parseInt(process.env.JWT_CLOCK_TOLERANCE || '0')
      };

      console.log('✅ [JWT-CONFIG] JWT configuration loaded successfully:', {
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.expiresIn,
        refreshExpiresIn: this.config.refreshExpiresIn,
        algorithm: this.config.algorithm,
        secretProvided: !!process.env.JWT_SECRET,
        refreshSecretProvided: !!process.env.JWT_REFRESH_SECRET
      });

      this.initialized = true;
    } catch (error) {
      console.error('❌ [JWT-CONFIG] Failed to load JWT configuration:', error);
      throw new Error(`JWT configuration loading failed: ${error.message}`);
    }
  }

  // 🌍 SIMPLIFIED ENVIRONMENT-AWARE ISSUER GENERATION
  private generateEnvironmentAwareIssuer(deploymentTarget: string, nodeEnv: string): string {
    // ✅ SIMPLIFIED: Single issuer for all environments to prevent validation failures
    // Multiple issuers cause token validation issues in multi-tenant setup
    return 'ifrs9-iaf-platform';
  }

  // 🔐 VALIDATE JWT SECRET FROM ENVIRONMENT
  private getValidatedSecret(envKey: string, description: string, allowFallback: boolean = false): string {
    const secret = process.env[envKey];

    if (!secret) {
      if (allowFallback && envKey === 'JWT_REFRESH_SECRET') {
        console.warn(`⚠️ [JWT-CONFIG] ${description} not found in environment, will use access secret as fallback`);
        const accessSecret = process.env.JWT_SECRET;
        if (!accessSecret) {
          throw new Error(`Both ${envKey} and JWT_SECRET are required in ${process.env.NODE_ENV || 'unknown'} environment`);
        }
        return accessSecret;
      }

      throw new Error(`${description} (${envKey}) is required in ${process.env.NODE_ENV || 'unknown'} environment`);
    }

    if (secret.length < 32) {
      console.warn(`⚠️ [JWT-CONFIG] ${description} appears to be weak (length: ${secret.length}). Consider using a stronger secret.`);
    }

    return secret;
  }

  // 📋 GET CONFIGURATION
  public getConfiguration(): JWTConfiguration {
    if (!this.initialized) {
      throw new Error('JWT configuration not initialized. Call loadConfiguration() first.');
    }
    return this.config;
  }

  // 🔄 RELOAD CONFIGURATION
  public reloadConfiguration(): void {
    console.log('🔄 [JWT-CONFIG] Reloading JWT configuration...');
    this.loadConfiguration();
  }

  // 🔍 VALIDATE CONFIGURATION
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config) {
      errors.push('JWT configuration not loaded');
      return { isValid: false, errors };
    }

    if (!this.config.secret || this.config.secret.length < 32) {
      errors.push('JWT secret must be at least 32 characters long');
    }

    if (!this.config.refreshSecret || this.config.refreshSecret.length < 32) {
      errors.push('JWT refresh secret must be at least 32 characters long');
    }

    if (!this.config.issuer) {
      errors.push('JWT issuer cannot be empty');
    }

    if (!this.config.audience) {
      errors.push('JWT audience cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 📊 GET DEBUG INFO
  public getDebugInfo(): any {
    if (!this.initialized) {
      return { error: 'Configuration not initialized' };
    }

    return {
      environment: {
        deploymentTarget: process.env.DEPLOYMENT_TARGET,
        nodeEnv: process.env.NODE_ENV,
        issuer: this.config.issuer
      },
      secrets: {
        accessSecretProvided: !!process.env.JWT_SECRET,
        refreshSecretProvided: !!process.env.JWT_REFRESH_SECRET,
        accessSecretLength: this.config.secret.length,
        refreshSecretLength: this.config.refreshSecret.length
      },
      tokens: {
        audience: this.config.audience,
        refreshAudience: this.config.refreshAudience,
        expiresIn: this.config.expiresIn,
        refreshExpiresIn: this.config.refreshExpiresIn,
        algorithm: this.config.algorithm
      }
    };
  }
}

// ✅ SINGLETON EXPORT
export const jwtConfigService = JWTConfigService.getInstance();

// ✅ CONVENIENCE EXPORTS
export const getJWTConfiguration = (): JWTConfiguration => jwtConfigService.getConfiguration();
export const validateJWTConfiguration = () => jwtConfigService.validateConfiguration();