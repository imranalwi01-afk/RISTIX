// packages/backend/src/services/AuthService.ts
// ✅ SURGICAL UPDATE: Authentication service with real database integration

import jwt from 'jsonwebtoken';
import { modelManager } from '../models';
import logger from '../config/logger';

interface LoginResult {
  user: any;
  accessToken: string;
  refreshToken: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  stakeholderType: string;
  bankingType?: string;
  tenantId?: string;
  permissions: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '8h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Login with email and password (supports 28 dummy users)
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Try to find user in tenant databases first (for banking users)
      let user = await this.findUserInTenantDatabases(email);
      let userType = 'tenant';
      
      // If not found in tenant databases, try platform admin
      if (!user) {
        user = await modelManager.platformUser.findOne({
          where: { email, is_active: true }
        });
        userType = 'platform';
      }
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
      
      // Update last login
      user.last_login_at = new Date();
      await user.save();
      
      // Generate session ID
      const sessionId = this.generateSessionId();
      
      // Create JWT payload
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        stakeholderType: user.stakeholder_type || 'platform-admin',
        bankingType: user.banking_type,
        tenantId: user.tenant_id,
        permissions: user.permissions || [],
        sessionId,
      };
      
      // Generate tokens
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(user.id, sessionId);
      
      logger.info('User login successful', {
        userId: user.id,
        email: user.email,
        role: user.role,
        stakeholderType: user.stakeholder_type,
        userType,
      });
      
      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      };
      
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }
  
  /**
   * Find user in tenant databases (conventional and syariah)
   */
  private async findUserInTenantDatabases(email: string): Promise<any> {
    try {
      // Try conventional tenant database
      const ConventionalUserModel = modelManager.getTenantUserModel('conventional');
      let user = await ConventionalUserModel.findOne({
        where: { email, is_active: true }
      });
      
      if (user) return user;
      
      // Try syariah tenant database
      const SyariahUserModel = modelManager.getTenantUserModel('syariah');
      user = await SyariahUserModel.findOne({
        where: { email, is_active: true }
      });
      
      return user;
      
    } catch (error) {
      logger.error('Error finding user in tenant databases:', error);
      return null;
    }
  }
  
  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      return null;
    }
  }
  
  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      
      // Find user and generate new tokens
      const user = await this.findUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const sessionId = this.generateSessionId();
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        stakeholderType: user.stakeholder_type || 'platform-admin',
        bankingType: user.banking_type,
        tenantId: user.tenant_id,
        permissions: user.permissions || [],
        sessionId,
      };
      
      return {
        accessToken: this.generateAccessToken(payload),
        refreshToken: this.generateRefreshToken(user.id, sessionId),
      };
      
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }
  
  /**
   * Find user by ID across all databases
   */
  private async findUserById(userId: string): Promise<any> {
    // Try platform admin first
    let user = await modelManager.platformUser.findByPk(userId);
    if (user) return user;
    
    // Try tenant databases
    const ConventionalUserModel = modelManager.getTenantUserModel('conventional');
    user = await ConventionalUserModel.findByPk(userId);
    if (user) return user;
    
    const SyariahUserModel = modelManager.getTenantUserModel('syariah');
    user = await SyariahUserModel.findByPk(userId);
    return user;
  }
  
  /**
   * Generate access token
   */
  private generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: this.accessTokenExpiry,
    });
  }
  
  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign(
      { userId, sessionId, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Logout (invalidate session)
   */
  async logout(sessionId: string): Promise<void> {
    try {
      // In a production environment, you'd store sessions in Redis and remove them here
      // For now, we'll just log the logout
      logger.info('User logout', { sessionId });
    } catch (error) {
      logger.error('Logout error:', error);
    }
  }
}

// packages/backend/src/controllers/AuthController.ts
// ✅ Authentication controller with 28 dummy users support

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import logger from '../config/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/v1/auth/login
   * Login with email and password (supports 28 dummy users)
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
          error: { code: 'MISSING_CREDENTIALS' }
        });
        return;
      }

      // Attempt login
      const loginResult = await this.authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: loginResult
      });

      logger.info('Login successful', {
        userId: loginResult.user.id,
        email: loginResult.user.email,
        role: loginResult.user.role,
        ip: req.ip
      });

    } catch (error: any) {
      logger.error('Login failed', {
        email: req.body.email,
        error: error.message,
        ip: req.ip
      });

      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
        error: { code: 'LOGIN_FAILED' }
      });
    }
  };

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          error: { code: 'MISSING_REFRESH_TOKEN' }
        });
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });

    } catch (error: any) {
      logger.error('Token refresh failed', {
        error: error.message,
        ip: req.ip
      });

      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: { code: 'TOKEN_REFRESH_FAILED' }
      });
    }
  };

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      
      if (user?.sessionId) {
        await this.authService.logout(user.sessionId);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });

      logger.info('Logout successful', {
        userId: user?.id,
        sessionId: user?.sessionId,
        ip: req.ip
      });

    } catch (error: any) {
      logger.error('Logout failed', {
        error: error.message,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: { code: 'LOGOUT_FAILED' }
      });
    }
  };

  /**
   * GET /api/v1/auth/me
   * Get current user information
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
          error: { code: 'NOT_AUTHENTICATED' }
        });
        return;
      }

      res.json({
        success: true,
        message: 'User information retrieved',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            stakeholderType: user.stakeholderType,
            bankingType: user.bankingType,
            tenantId: user.tenantId,
            permissions: user.permissions,
          }
        }
      });

    } catch (error: any) {
      logger.error('Get current user failed', {
        error: error.message,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get user information',
        error: { code: 'GET_USER_FAILED' }
      });
    }
  };
}

// packages/backend/src/middleware/auth.ts
// ✅ Authentication middleware with real token verification

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import logger from '../config/logger';

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Authenticate JWT token and set user context
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No authorization token provided',
          error: { code: 'NO_TOKEN' }
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = await this.authService.verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error: { code: 'INVALID_TOKEN' }
        });
        return;
      }

      // Set user context
      (req as any).user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        stakeholderType: decoded.stakeholderType,
        bankingType: decoded.bankingType,
        tenantId: decoded.tenantId,
        permissions: decoded.permissions,
        sessionId: decoded.sessionId,
      };

      next();

    } catch (error) {
      logger.error('Authentication middleware error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: { code: 'AUTH_ERROR' }
      });
    }
  };

  /**
   * Check if user has required permission
   */
  requirePermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: { code: 'NOT_AUTHENTICATED' }
        });
        return;
      }

      if (!user.permissions || !user.permissions.includes(permission)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          error: { 
            code: 'INSUFFICIENT_PERMISSION',
            required: permission
          }
        });
        return;
      }

      next();
    };
  };

  /**
   * Check if user has required role
   */
  requireRole = (requiredRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: { code: 'NOT_AUTHENTICATED' }
        });
        return;
      }

      if (!requiredRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient role',
          error: { 
            code: 'INSUFFICIENT_ROLE',
            required: requiredRoles
          }
        });
        return;
      }

      next();
    };
  };
}

// Export middleware instances
export const authMiddleware = new AuthMiddleware();
export const authenticate = authMiddleware.authenticate;
export const requirePermission = authMiddleware.requirePermission;
export const requireRole = authMiddleware.requireRole;