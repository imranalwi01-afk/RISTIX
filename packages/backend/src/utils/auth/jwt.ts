// packages/backend/src/utils/auth/jwt.ts
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SignOptions } from 'jsonwebtoken';
import { jwtConfigService } from '../../core/config/jwt.config';
import { configService } from '../../core/services/configuration/configuration.service';

/**
 * JWT Authentication Service
 * Handles token creation, validation, and refresh logic
 */

export interface JwtPayload {
  userId: string;
  username?: string;
  email: string;
  role?: string;
  roles?: string[];
  permissions: string[];
  roleCodes?: string[];
  tenantId: string;
  tenantSlug: string;
  bankingType?: string;
  userType?: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenPayload {
  userId: string;
  tenantId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

class JwtService {
  private jwtSecret: string = '';
  private jwtExpiresIn: string = '';
  private refreshSecret: string = '';
  private refreshExpiresIn: string = '';
  private issuer: string = '';
  private activeSessions: Map<string, Set<string>> = new Map(); // userId -> Set of sessionIds

  constructor() {
    // Initialize when configuration is loaded
    this.initializeSecrets();
  }

  /**
   * Initialize JWT secrets from centralized configuration
   */
  private initializeSecrets(): void {
    try {
      // ✅ Use centralized JWT configuration service
      const jwtConfig = jwtConfigService.getConfiguration();

      this.jwtSecret = jwtConfig.secret;
      this.jwtExpiresIn = jwtConfig.expiresIn;
      this.refreshSecret = jwtConfig.refreshSecret;
      this.refreshExpiresIn = jwtConfig.refreshExpiresIn;
      this.issuer = jwtConfig.issuer;

      console.log(`✅ JWT Service initialized with centralized config - Issuer: ${this.issuer}`);

    } catch (error) {
      console.error('❌ CRITICAL: JWT Service initialization failed:', error);
      // In production, this should terminate the application
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`JWT configuration error: ${errorMessage}`);
    }
  }

  /**
   * Generate refresh token secret from main JWT secret
   */
  private generateRefreshSecret(mainSecret: string): string {
    return crypto
      .createHash('sha256')
      .update(mainSecret + 'refresh-salt')
      .digest('hex');
  }

  /**
   * Generate a unique session ID
   */
  public generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create JWT access token
   */
  public createAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    try {
      const tokenPayload: JwtPayload = {
        ...payload,
        sessionId: payload.sessionId || this.generateSessionId(),
      };

      const signOptions: SignOptions = {
        expiresIn: this.jwtExpiresIn as string,
        issuer: this.issuer,
        audience: jwtConfigService.getConfiguration().audience,
      };

      const token = jwt.sign(tokenPayload, this.jwtSecret, signOptions);

      // Track active session
      this.addActiveSession(payload.userId, tokenPayload.sessionId);

      console.log(`✅ JWT access token created for user: ${payload.email}`);
      return token;
    } catch (error) {
      console.error('❌ Failed to create access token:', error);
      throw new Error(`Token creation failed: ${error}`);
    }
  }

  /**
   * Create JWT refresh token
   */
  public createRefreshToken(userId: string, tenantId: string, sessionId: string): string {
    try {
      const payload: RefreshTokenPayload = {
        userId,
        tenantId,
        sessionId,
      };

      const refreshSignOptions: SignOptions = {
        expiresIn: this.refreshExpiresIn as string,
        issuer: this.issuer,
        audience: jwtConfigService.getConfiguration().refreshAudience,
      };

      const token = jwt.sign(payload, this.refreshSecret, refreshSignOptions);

      console.log(`✅ JWT refresh token created for user: ${userId}`);
      return token;
    } catch (error) {
      console.error('❌ Failed to create refresh token:', error);
      throw new Error(`Refresh token creation failed: ${error}`);
    }
  }

  /**
   * Create token pair (access + refresh)
   */
  public createTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp' | 'sessionId'>): TokenPair {
    const sessionId = this.generateSessionId();
    const tokenPayload = { ...payload, sessionId };

    const accessToken = this.createAccessToken(tokenPayload);
    const refreshToken = this.createRefreshToken(payload.userId, payload.tenantId, sessionId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirationTime(this.jwtExpiresIn),
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify and decode JWT access token
   */
  public verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: this.issuer,
        audience: jwtConfigService.getConfiguration().audience,
      }) as JwtPayload;

      // Check if session is still active (temporarily disabled for compatibility)
      // TODO: Re-enable session tracking when authentication service uses JWT service consistently
      // if (!this.isSessionActive(decoded.userId, decoded.sessionId)) {
      //   throw new Error('Session has been invalidated');
      // }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid token: ${error.message}`);
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.NotBeforeError) {
        throw new Error('Token not active yet');
      } else {
        throw new Error(`Token verification failed: ${error}`);
      }
    }
  }

  /**
   * Verify and decode JWT refresh token
   */
  public verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: this.issuer,
        audience: jwtConfigService.getConfiguration().refreshAudience,
      }) as RefreshTokenPayload;

      // Check if session is still active (temporarily disabled for compatibility)
      // TODO: Re-enable session tracking when authentication service uses JWT service consistently
      // if (!this.isSessionActive(decoded.userId, decoded.sessionId)) {
      //   throw new Error('Refresh session has been invalidated');
      // }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid refresh token: ${error.message}`);
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else {
        throw new Error(`Refresh token verification failed: ${error}`);
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshAccessToken(refreshToken: string, userPayload: Omit<JwtPayload, 'iat' | 'exp' | 'sessionId'>): Promise<TokenPair> {
    try {
      const refreshPayload = this.verifyRefreshToken(refreshToken);
      
      // Ensure the refresh token belongs to the same user
      if (refreshPayload.userId !== userPayload.userId || refreshPayload.tenantId !== userPayload.tenantId) {
        throw new Error('Refresh token does not match user credentials');
      }

      // Create new token pair with the same session ID
      const newAccessToken = this.createAccessToken({
        ...userPayload,
        sessionId: refreshPayload.sessionId,
      });

      return {
        accessToken: newAccessToken,
        refreshToken, // Keep the same refresh token
        expiresIn: this.getExpirationTime(this.jwtExpiresIn),
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error);
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  public decodeToken(token: string): any {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      throw new Error(`Token decode failed: ${error}`);
    }
  }

  /**
   * Invalidate a specific session
   */
  public invalidateSession(userId: string, sessionId: string): void {
    const userSessions = this.activeSessions.get(userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.activeSessions.delete(userId);
      }
      console.log(`✅ Session invalidated: ${sessionId} for user: ${userId}`);
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  public invalidateAllUserSessions(userId: string): void {
    this.activeSessions.delete(userId);
    console.log(`✅ All sessions invalidated for user: ${userId}`);
  }

  /**
   * Check if session is active
   */
  public isSessionActive(userId: string, sessionId: string): boolean {
    const userSessions = this.activeSessions.get(userId);
    return userSessions ? userSessions.has(sessionId) : false;
  }

  /**
   * Add active session
   */
  private addActiveSession(userId: string, sessionId: string): void {
    if (!this.activeSessions.has(userId)) {
      this.activeSessions.set(userId, new Set());
    }
    this.activeSessions.get(userId)!.add(sessionId);
  }

  /**
   * Get active sessions count for user
   */
  public getActiveSessionsCount(userId: string): number {
    const userSessions = this.activeSessions.get(userId);
    return userSessions ? userSessions.size : 0;
  }

  /**
   * Get all active sessions for user
   */
  public getActiveSessions(userId: string): string[] {
    const userSessions = this.activeSessions.get(userId);
    return userSessions ? Array.from(userSessions) : [];
  }

  /**
   * Convert expiration string to seconds
   */
  private getExpirationTime(expiresIn: string): number {
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));
    
    switch (timeUnit) {
      case 's': return timeValue;
      case 'm': return timeValue * 60;
      case 'h': return timeValue * 3600;
      case 'd': return timeValue * 86400;
      default: return 28800; // 8 hours default
    }
  }

  /**
   * Validate token format
   */
  public validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Each part should be base64 encoded
    try {
      for (const part of parts) {
        Buffer.from(part, 'base64');
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract bearer token from Authorization header
   */
  public extractBearerToken(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return this.validateTokenFormat(token) ? token : null;
  }

  /**
   * Create token for demo/development purposes
   */
  public createDemoToken(userInfo: {
    userId: string;
    tenantId: string;
    tenantSlug: string;
    email: string;
    roles: string[];
    bankingType: 'conventional' | 'syariah' | 'dual';
  }): TokenPair {
    const permissions = this.generatePermissionsFromRoles(userInfo.roles);
    
    return this.createTokenPair({
      userId: userInfo.userId,
      tenantId: userInfo.tenantId,
      tenantSlug: userInfo.tenantSlug,
      email: userInfo.email,
      roles: userInfo.roles,
      bankingType: userInfo.bankingType,
      permissions,
    });
  }

  /**
   * Generate permissions based on roles
   */
  private generatePermissionsFromRoles(roles: string[]): string[] {
    const permissionMap: Record<string, string[]> = {
      'BANK_CRO': ['read:dashboard', 'read:reports', 'read:calculations', 'manage:users'],
      'BANK_IFRS_MANAGER': ['read:dashboard', 'write:calculations', 'read:reports', 'manage:models'],
      'BANK_RISK_ANALYST': ['read:dashboard', 'write:calculations', 'read:reports'],
      'BANK_AUDITOR': ['read:dashboard', 'read:reports', 'read:audit_trail'],
      'CONSULTANT': ['read:dashboard', 'read:reports', 'write:recommendations'],
      'REGULATOR': ['read:all', 'audit:all'],
      'PLATFORM_ADMIN': ['admin:all'],
    };

    const permissions = new Set<string>();
    
    for (const role of roles) {
      const rolePermissions = permissionMap[role] || [];
      for (const permission of rolePermissions) {
        permissions.add(permission);
      }
    }

    return Array.from(permissions);
  }

  /**
   * Get JWT service statistics
   */
  public getStatistics(): {
    totalActiveSessions: number;
    activeUsers: number;
    averageSessionsPerUser: number;
    jwtConfig: {
      expiresIn: string;
      issuer: string;
      algorithm: string;
    };
  } {
    const totalActiveSessions = Array.from(this.activeSessions.values())
      .reduce((total, sessions) => total + sessions.size, 0);
    
    const activeUsers = this.activeSessions.size;
    const averageSessionsPerUser = activeUsers > 0 ? totalActiveSessions / activeUsers : 0;

    return {
      totalActiveSessions,
      activeUsers,
      averageSessionsPerUser: Math.round(averageSessionsPerUser * 100) / 100,
      jwtConfig: {
        expiresIn: this.jwtExpiresIn,
        issuer: this.issuer,
        algorithm: 'HS256',
      },
    };
  }
}

// Export singleton instance
export const jwtService = new JwtService();
export default jwtService;