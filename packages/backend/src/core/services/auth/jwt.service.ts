// packages/backend/src/core/services/auth/jwt.service.ts
// ✅ UPDATED: Uses centralized JWT configuration service
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { AuditService } from '../audit/audit.service';
import { jwtConfigService } from '../../config/jwt.config';

export interface JWTPayload {
  // Standard JWT claims
  iss: string;        // Issuer
  sub: string;        // Subject (user ID)
  aud: string;        // Audience (tenant ID)
  exp: number;        // Expiration time
  iat: number;        // Issued at
  jti: string;        // JWT ID
  
  // Multi-tenant context
  tenantId: string;
  tenantSlug: string;
  bankingType: 'CONVENTIONAL' | 'SYARIAH' | 'DUAL';
  
  // User context
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  
  // Security context
  sessionId: string;
  deviceId: string;
  ipAddress: string;
  mfaVerified: boolean;
  riskScore: number;
  
  // Banking permissions
  bankingPermissions: {
    conventional?: string[];
    syariah?: string[];
  };
  complianceLevel: string;
  
  // Operational context
  lastPasswordChange: number;
  forcePasswordChange: boolean;
  temporaryAccess: boolean;
  auditContext: {
    loginMethod: string;
    geolocation?: string;
    userAgent: string;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthContext {
  sessionId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  geolocation?: string;
  loginMethod: 'password' | 'mfa' | 'sso';
  mfaVerified: boolean;
  riskScore: number;
  temporaryAccess: boolean;
}

export class JWTService {
  private readonly accessTokenExpiry = 15 * 60; // 15 minutes
  private readonly refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days
  
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigurationService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(
    user: any,
    tenant: any,
    authContext: AuthContext
  ): Promise<TokenPair> {
    try {
      // ✅ CENTRALIZED CONFIGURATION: Use JWT config service for all settings
      const jwtConfig = jwtConfigService.getConfiguration();

      console.log('🔐 JWT Service: Using centralized JWT configuration');

      // Get user permissions for this tenant
      const permissions = await this.getUserPermissions(user.id, tenant.id);
      const bankingPermissions = await this.getBankingPermissions(user.id, tenant.id, tenant.bankingType);

      // Generate session ID for both tokens
      const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

      // Create access token payload (aligned with authentication service)
      const accessPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'user',
        permissions: permissions,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        bankingType: tenant.bankingType,
        userType: 'tenant',
        sessionId: sessionId,
        deviceId: authContext.deviceId,
        ipAddress: authContext.ipAddress,
        mfaVerified: authContext.mfaVerified,
        riskScore: authContext.riskScore,
        bankingPermissions,
        complianceLevel: tenant.complianceLevel || 'standard',
        lastPasswordChange: user.passwordChangedAt?.getTime() || Date.now(),
        forcePasswordChange: user.forcePasswordChange || false,
        temporaryAccess: authContext.temporaryAccess,
        auditContext: {
          loginMethod: authContext.loginMethod,
          geolocation: authContext.geolocation,
          userAgent: authContext.userAgent
        }
      };

      // Create refresh token payload (minimal claims)
      const refreshPayload = {
        userId: user.id,
        tenantId: tenant.id,
        sessionId: sessionId,
        type: 'refresh',
        userType: 'tenant'
      };

      // ✅ CENTRALIZED CONFIGURATION: Use JWT config service for all token settings
      const accessToken = jwt.sign(accessPayload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithm: jwtConfig.algorithm
      } as jwt.SignOptions);

      const refreshToken = jwt.sign(refreshPayload, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshExpiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.refreshAudience,
        algorithm: jwtConfig.algorithm
      } as jwt.SignOptions);
      
      // Store session in Redis
      await this.storeSession(authContext.sessionId, {
        userId: user.id,
        tenantId: tenant.id,
        deviceId: authContext.deviceId,
        ipAddress: authContext.ipAddress,
        userAgent: authContext.userAgent,
        accessTokenJti: accessPayload.jti,
        refreshTokenJti: refreshPayload.jti,
        loginTime: new Date(),
        lastActivity: new Date(),
        mfaVerified: authContext.mfaVerified,
        riskScore: authContext.riskScore
      });
      
      // Audit log
      await this.auditService.log({
        userId: user.id,
        tenantId: tenant.id,
        eventType: 'AUTHENTICATION',
        action: 'TOKEN_GENERATED',
        description: 'JWT token pair generated',
        metadata: {
          sessionId: authContext.sessionId,
          deviceId: authContext.deviceId,
          loginMethod: authContext.loginMethod,
          mfaVerified: authContext.mfaVerified
        },
        ipAddress: authContext.ipAddress,
        userAgent: authContext.userAgent
      });
      
      return {
        accessToken,
        refreshToken,
        expiresIn: this.accessTokenExpiry,
        tokenType: 'Bearer'
      };
      
    } catch (error) {
      throw new Error(`Failed to generate JWT tokens: ${error}`);
    }
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string, tokenType: 'access' | 'refresh' = 'access'): Promise<JWTPayload> {
    try {
      // ✅ CENTRALIZED CONFIGURATION: Use JWT config service for verification
      const jwtConfig = jwtConfigService.getConfiguration();

      // Verify token with centralized audience validation
      const audience = tokenType === 'access'
        ? jwtConfig.audience
        : jwtConfig.refreshAudience;

      const secret = tokenType === 'access' ? jwtConfig.secret : jwtConfig.refreshSecret;

      console.log(`🔍 JWT Service: Verifying ${tokenType} token with centralized configuration`);

      const payload = jwt.verify(token, secret, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: audience
      }) as any;
      
      // Check if token is blacklisted
      const isBlacklisted = await this.redisService.get(`blacklist:${payload.jti}`);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }
      
      // Check session validity for access tokens
      if (tokenType === 'access') {
        const session = await this.getSession(payload.sessionId);
        if (!session || session.accessTokenJti !== payload.jti) {
          throw new Error('Invalid session');
        }
        
        // Update last activity
        await this.updateSessionActivity(payload.sessionId);
      }
      
      return payload;
      
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid token: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const refreshPayload = await this.verifyToken(refreshToken, 'refresh');
      
      // Get session
      const session = await this.getSession(refreshPayload.sessionId);
      if (!session || session.refreshTokenJti !== refreshPayload.jti) {
        throw new Error('Invalid refresh token session');
      }
      
      // Get user and tenant
      const user = await this.getUserById(refreshPayload.sub);
      const tenant = await this.getTenantById(refreshPayload.tenantId);
      
      if (!user || !tenant || !user.isActive) {
        throw new Error('User or tenant not found or inactive');
      }
      
      // Create new auth context
      const authContext: AuthContext = {
        sessionId: refreshPayload.sessionId,
        deviceId: session.deviceId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        loginMethod: 'refresh',
        mfaVerified: session.mfaVerified,
        riskScore: session.riskScore,
        temporaryAccess: false
      };
      
      // Generate new token pair
      const newTokenPair = await this.generateTokenPair(user, tenant, authContext);
      
      // Blacklist old refresh token
      await this.blacklistToken(refreshPayload.jti, this.refreshTokenExpiry);
      
      return newTokenPair;
      
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error}`);
    }
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(token: string, sessionId?: string): Promise<void> {
    try {
      const payload = await this.verifyToken(token, 'access');
      
      // Blacklist access token
      await this.blacklistToken(payload.jti, this.accessTokenExpiry);
      
      // Remove session if provided
      if (sessionId || payload.sessionId) {
        await this.removeSession(sessionId || payload.sessionId);
      }
      
      // Audit log
      await this.auditService.log({
        userId: payload.userId,
        tenantId: payload.tenantId,
        eventType: 'AUTHENTICATION',
        action: 'TOKEN_REVOKED',
        description: 'JWT token revoked (logout)',
        metadata: {
          sessionId: payload.sessionId,
          tokenJti: payload.jti
        },
        ipAddress: payload.ipAddress,
        userAgent: payload.auditContext.userAgent
      });
      
    } catch (error) {
      // Silent fail for revocation - token might already be invalid
      console.warn('Token revocation warning:', error);
    }
  }

  // Private helper methods
  private async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    // TODO: Implement actual permission resolution from database
    return [];
  }

  private async getBankingPermissions(
    userId: string, 
    tenantId: string, 
    bankingType: string
  ): Promise<{ conventional?: string[]; syariah?: string[] }> {
    // TODO: Implement actual banking permission resolution from database
    return {};
  }

  private async storeSession(sessionId: string, sessionData: any): Promise<void> {
    await this.redisService.setex(
      `session:${sessionId}`,
      this.refreshTokenExpiry,
      JSON.stringify(sessionData)
    );
  }

  private async getSession(sessionId: string): Promise<any> {
    const sessionData = await this.redisService.get(`session:${sessionId}`);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date();
      await this.storeSession(sessionId, session);
    }
  }

  private async removeSession(sessionId: string): Promise<void> {
    await this.redisService.del(`session:${sessionId}`);
  }

  private async blacklistToken(jti: string, ttl: number): Promise<void> {
    await this.redisService.setex(`blacklist:${jti}`, ttl, 'revoked');
  }

  private async getUserById(userId: string): Promise<any> {
    // TODO: Implement actual user lookup from database
    return null;
  }

  private async getTenantById(tenantId: string): Promise<any> {
    // TODO: Implement actual tenant lookup from database
    return null;
  }
}
