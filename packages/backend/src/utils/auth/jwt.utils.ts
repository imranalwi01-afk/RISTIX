// packages/backend/src/utils/auth/jwt.utils.ts
// JWT Utilities - IFRS 9 Multi-Tenant Platform
// ✅ UPDATED: Uses centralized JWT configuration service

import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfigService } from '../../core/config/jwt.config';

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  bankingType?: string;
}

export class JWTUtils {
  // Generate access token
  public static generateAccessToken(payload: TokenPayload): string {
    const jwtConfig = jwtConfigService.getConfiguration();

    const options: SignOptions = {
      expiresIn: jwtConfig.expiresIn as string,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithm: jwtConfig.algorithm
    };

    return jwt.sign(payload, jwtConfig.secret, options);
  }

  // Generate refresh token
  public static generateRefreshToken(userId: string): string {
    const jwtConfig = jwtConfigService.getConfiguration();

    const options: SignOptions = {
        expiresIn: jwtConfig.refreshExpiresIn as string,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.refreshAudience,
        algorithm: jwtConfig.algorithm
      };

    return jwt.sign(
      { userId, type: 'refresh' },
      jwtConfig.refreshSecret,
      options
    );
  }

  // Verify access token
  public static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const jwtConfig = jwtConfigService.getConfiguration();

      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithms: [jwtConfig.algorithm]
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  public static verifyRefreshToken(token: string): { userId: string; type: string } | null {
    try {
      const jwtConfig = jwtConfigService.getConfiguration();

      const decoded = jwt.verify(token, jwtConfig.refreshSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.refreshAudience,
        algorithms: [jwtConfig.algorithm]
      }) as { userId: string; type: string };

      if (decoded.type !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Extract token from Authorization header
  public static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }

  // Get token expiry
  public static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
