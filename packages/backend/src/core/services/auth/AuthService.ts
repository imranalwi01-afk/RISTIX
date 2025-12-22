// packages/backend/src/core/services/auth/AuthService.ts
import { v4 as uuidv4 } from 'uuid';
import JWTService from '../../../utils/auth/jwt';
import PasswordService from '../../../utils/auth/password';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    tenantSlug: string;
  };
}

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthTokens | null> {
    try {
      // Mock authentication for DAY 2 HOUR 2 demo
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        const sessionId = uuidv4();
        const roles = ['admin'];
        const permissions = ['USER_READ', 'USER_WRITE', 'TENANT_MANAGE'];
        
        const tokens = JWTService.generateTokenPair({
          userId: 'user-123',
          tenantId: 'tenant-123',
          tenantSlug: credentials.tenantSlug,
          email: credentials.email,
          roles,
          permissions,
          sessionId,
        });

        console.log(`Mock login successful: ${credentials.email}`);

        return {
          ...tokens,
          user: {
            id: 'user-123',
            email: credentials.email,
            fullName: 'System Administrator',
            roles,
            permissions,
            tenantSlug: credentials.tenantSlug,
          },
        };
      }

      console.warn(`Login failed for: ${credentials.email}`);
      return null;

    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  public async logout(sessionId: string, userId: string): Promise<void> {
    console.log(`User logout: ${userId} (session: ${sessionId})`);
  }

  public async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number } | null> {
    try {
      const decoded = JWTService.verifyRefreshToken(refreshToken);
      if (!decoded) return null;

      const accessToken = JWTService.generateAccessToken({
        userId: decoded.userId,
        tenantId: 'tenant-123',
        tenantSlug: 'demo-tenant',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['USER_READ', 'USER_WRITE'],
        sessionId: decoded.sessionId,
      });

      return {
        accessToken,
        expiresIn: JWTService.getAccessTokenExpiry(),
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }
}

export default AuthService;
