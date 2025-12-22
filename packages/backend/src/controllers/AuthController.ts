// packages/backend/src/controllers/AuthController.ts
// ✅ Authentication Controller with 28 Dummy Users Support
// CRITICAL: Handles login, JWT tokens, and multi-stakeholder authentication

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../core/models';
import appConfig from '../config/app';
import logger from '../config/logger';
import { jwtConfigService } from '../core/config/jwt.config';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  stakeholderType?: string;
  bankingType?: string;
  tenantId?: string;
  permissions: string[];
  sessionId: string;
}

export class AuthController {
  // ✅ Login endpoint with 28 dummy users support
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
        return;
      }

      logger.auth('Login attempt', undefined, { email, ip: req.ip });

      // Find user by email
      const user = await User.findOne({
        where: { 
          email: email.toLowerCase(),
          isActive: true 
        }
      });

      if (!user) {
        logger.auth('Login failed - user not found', undefined, { email, ip: req.ip });
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      // Check if user is locked
      if (user.isLocked()) {
        logger.auth('Login failed - account locked', user.id, { email, ip: req.ip });
        res.status(423).json({
          success: false,
          error: 'Account is temporarily locked. Please try again later.',
          code: 'ACCOUNT_LOCKED',
          lockedUntil: user.lockedUntil
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        // Increment failed attempts
        await user.incrementFailedAttempts();
        
        logger.auth('Login failed - invalid password', user.id, { 
          email, 
          ip: req.ip, 
          failedAttempts: user.failedLoginAttempts + 1 
        });

        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      // Reset failed attempts and update login info
      await user.resetFailedAttempts();
      await user.updateLoginInfo();

      // Generate session ID
      const sessionId = uuidv4();
      user.currentSessionId = sessionId;
      await user.save();

      // Create JWT payload
      const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        stakeholderType: user.stakeholderType,
        bankingType: user.bankingAccess,
        tenantId: user.tenantId,
        sessionId,
        permissions: this.getUserPermissions(user)
      };

      // ✅ Use centralized JWT configuration
      const jwtConfig = jwtConfigService.getConfiguration();

      // Generate tokens
      const accessToken = jwt.sign(jwtPayload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      const refreshToken = jwt.sign(
        { userId: user.id, sessionId },
        jwtConfig.refreshSecret,
        {
          expiresIn: jwtConfig.refreshExpiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.refreshAudience
        }
      );

      logger.auth('Login successful', user.id, { 
        email, 
        ip: req.ip,
        stakeholderType: user.stakeholderType,
        bankingType: user.bankingAccess
      });

      // Return successful login response
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role || 'user',
          stakeholderType: user.stakeholderType,
          bankingType: user.bankingAccess,
          tenantId: user.tenantId,
          permissions: this.getUserPermissions(user),
          lastLoginAt: user.lastLoginAt,
          syariahCertified: user.syariahCertified,
          mfaEnabled: user.mfaEnabled
        },
        tokens: {
          accessToken,
          refreshToken
        },
        session: {
          sessionId,
          expiresIn: appConfig.jwtExpiresIn
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during login',
        code: 'LOGIN_ERROR'
      });
    }
  };

  // ✅ Refresh token endpoint
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      // ✅ Verify refresh token using centralized configuration
      const jwtConfig = jwtConfigService.getConfiguration();
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.refreshAudience
      }) as any;
      
      // Find user and validate session
      const user = await User.findOne({
        where: { 
          id: decoded.userId,
          isActive: true,
          currentSessionId: decoded.sessionId
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      // Generate new tokens
      const newSessionId = uuidv4();
      user.currentSessionId = newSessionId;
      await user.save();

      const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        stakeholderType: user.stakeholderType,
        bankingType: user.bankingAccess,
        tenantId: user.tenantId,
        sessionId: newSessionId,
        permissions: this.getUserPermissions(user)
      };

      // ✅ Use centralized JWT configuration
      const jwtConfig = jwtConfigService.getConfiguration();
      const newAccessToken = jwt.sign(jwtPayload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      const newRefreshToken = jwt.sign(
        { userId: user.id, sessionId: newSessionId },
        jwtConfig.refreshSecret,
        {
          expiresIn: jwtConfig.refreshExpiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.refreshAudience
        }
      );

      logger.auth('Token refreshed', user.id, { ip: req.ip });

      res.json({
        success: true,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        },
        session: {
          sessionId: newSessionId,
          expiresIn: appConfig.jwtExpiresIn
        }
      });

    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_ERROR'
      });
    }
  };

  // ✅ Logout endpoint
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user as AuthenticatedUser;

      if (user) {
        // Clear session ID
        const userModel = await User.findByPk(user.id);
        if (userModel) {
          userModel.currentSessionId = null;
          await userModel.save();
        }

        logger.auth('Logout successful', user.id, { ip: req.ip });
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Error during logout',
        code: 'LOGOUT_ERROR'
      });
    }
  };

  // ✅ Get current user endpoint
  public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user as AuthenticatedUser;

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Get fresh user data
      const userModel = await User.findByPk(user.id);

      if (!userModel || !userModel.isActive) {
        res.status(401).json({
          success: false,
          error: 'User account not found or inactive',
          code: 'USER_INACTIVE'
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: userModel.id,
          email: userModel.email,
          fullName: userModel.fullName,
          role: userModel.role || 'user',
          stakeholderType: userModel.stakeholderType,
          bankingType: userModel.bankingAccess,
          tenantId: userModel.tenantId,
          permissions: this.getUserPermissions(userModel),
          lastLoginAt: userModel.lastLoginAt,
          loginCount: userModel.loginCount,
          syariahCertified: userModel.syariahCertified,
          mfaEnabled: userModel.mfaEnabled
        }
      });

    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving user information',
        code: 'USER_INFO_ERROR'
      });
    }
  };

  // ✅ Helper method to get user permissions based on role and stakeholder type
  private getUserPermissions(user: any): string[] {
    const basePermissions: string[] = ['dashboard_view', 'profile_edit'];
    
    // Platform admin permissions
    if (user.stakeholderType === 'platform-admin') {
      return [
        ...basePermissions,
        'platform_manage',
        'tenant_manage',
        'user_manage',
        'system_monitor',
        'platform_config'
      ];
    }

    // Banking permissions
    if (user.stakeholderType === 'banking') {
      const bankingPermissions = [
        ...basePermissions,
        'ifrs9_calculate',
        'portfolio_manage',
        'data_upload',
        'report_generate'
      ];

      // Add banking-type specific permissions
      if (user.bankingAccess === 'SYARIAH' || user.bankingAccess === 'BOTH') {
        bankingPermissions.push(
          'syariah_compliance',
          'islamic_products',
          'profit_sharing_calc',
          'dps_interaction'
        );
      }

      return bankingPermissions;
    }

    // Consultant permissions
    if (user.stakeholderType === 'consultant') {
      return [
        ...basePermissions,
        'model_validate',
        'implementation_review',
        'training_deliver',
        'documentation_access'
      ];
    }

    // Regulator permissions
    if (user.stakeholderType === 'regulator') {
      return [
        ...basePermissions,
        'compliance_monitor',
        'audit_review',
        'regulatory_report',
        'policy_enforce'
      ];
    }

    return basePermissions;
  }
}