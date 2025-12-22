#!/bin/bash
# scripts/setup/d1h3-auth-setup.sh
# DAY 1 HOUR 3: Enterprise Authentication & Authorization System - IFRS 9 Multi-Tenant Platform
# 🎯 OBJECTIVE: Enterprise RBAC system with actual user/role tables

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/setup-d1h3-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate Authentication Service
generate_authentication_service() {
    log_info "Generating Enterprise Authentication Service..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/auth"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/auth/authentication.service.ts" << 'EOF'
// packages/backend/src/core/services/auth/authentication.service.ts
// Enterprise Authentication Service - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md security patterns

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { databaseConfig } from '../../database/config/database.config';
import { configService } from '../configuration/configuration.service';

interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
}

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
  tenantId?: string;
  role?: string;
}

interface AuthResult {
  success: boolean;
  user?: UserInfo;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  bankingType?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export class AuthenticationService {
  private static instance: AuthenticationService;

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  // MANDATORY: User login with tenant support
  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password, tenantId } = credentials;

      // Determine which database to check
      let user: any = null;
      let userType: 'platform' | 'tenant' = 'platform';

      // Check platform admin users first
      user = await this.findPlatformUser(email);
      
      // If not found and tenantId provided, check tenant users
      if (!user && tenantId) {
        user = await this.findTenantUser(email, tenantId);
        userType = 'tenant';
      }

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          error: 'Account is disabled'
        };
      }

      // Get user permissions and tenant info
      const userInfo = await this.buildUserInfo(user, userType, tenantId);

      // Generate tokens
      const tokens = await this.generateTokens(userInfo);

      // Update last login
      await this.updateLastLogin(user.id, userType, tenantId);

      // Log successful login
      await this.logAuthEvent(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', tenantId);

      return {
        success: true,
        user: userInfo,
        tokens
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // MANDATORY: User registration
  public async register(input: RegisterInput): Promise<AuthResult> {
    try {
      const { username, email, password, fullName, tenantId, role = 'user' } = input;

      // Validate password strength
      if (!this.isPasswordStrong(password)) {
        return {
          success: false,
          error: 'Password does not meet security requirements'
        };
      }

      // Check if user already exists
      const existingUser = tenantId 
        ? await this.findTenantUser(email, tenantId)
        : await this.findPlatformUser(email);

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      // Create user based on type
      if (tenantId) {
        await this.createTenantUser({
          id: userId,
          username,
          email,
          passwordHash,
          fullName,
          tenantId,
          role
        });
      } else {
        await this.createPlatformUser({
          id: userId,
          username,
          email,
          passwordHash,
          fullName,
          role
        });
      }

      // Get created user info
      const userType = tenantId ? 'tenant' : 'platform';
      const newUser = tenantId 
        ? await this.findTenantUser(email, tenantId)
        : await this.findPlatformUser(email);

      const userInfo = await this.buildUserInfo(newUser, userType, tenantId);

      // Log registration
      await this.logAuthEvent(userId, 'USER_REGISTERED', 'New user registered', tenantId);

      return {
        success: true,
        user: userInfo
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // MANDATORY: Token verification
  public async verifyToken(token: string): Promise<UserInfo | null> {
    try {
      const config = configService.getConfiguration();
      const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET;

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Verify user still exists and is active
      const userType = decoded.tenantId ? 'tenant' : 'platform';
      const user = decoded.tenantId 
        ? await this.findTenantUserById(decoded.userId, decoded.tenantId)
        : await this.findPlatformUserById(decoded.userId);

      if (!user || !user.is_active) {
        return null;
      }

      return await this.buildUserInfo(user, userType, decoded.tenantId);

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // MANDATORY: Password reset
  public async resetPassword(email: string, tenantId?: string): Promise<boolean> {
    try {
      const user = tenantId 
        ? await this.findTenantUser(email, tenantId)
        : await this.findPlatformUser(email);

      if (!user) {
        return false;
      }

      // Generate reset token (in real implementation, send via email)
      const resetToken = uuidv4();
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token in database
      await this.storePasswordResetToken(user.id, resetToken, resetExpiry, tenantId);

      // Log password reset request
      await this.logAuthEvent(user.id, 'PASSWORD_RESET_REQUESTED', 'Password reset requested', tenantId);

      return true;

    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }

  // MANDATORY: Change password
  public async changePassword(userId: string, oldPassword: string, newPassword: string, tenantId?: string): Promise<boolean> {
    try {
      const userType = tenantId ? 'tenant' : 'platform';
      const user = tenantId 
        ? await this.findTenantUserById(userId, tenantId)
        : await this.findPlatformUserById(userId);

      if (!user) {
        return false;
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isOldPasswordValid) {
        return false;
      }

      // Validate new password strength
      if (!this.isPasswordStrong(newPassword)) {
        return false;
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.updateUserPassword(userId, newPasswordHash, userType, tenantId);

      // Log password change
      await this.logAuthEvent(userId, 'PASSWORD_CHANGED', 'User changed password', tenantId);

      return true;

    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  // Find platform user by email
  private async findPlatformUser(email: string): Promise<any> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      SELECT id, username, email, password_hash, full_name, role, permissions, is_active, last_login_at
      FROM platform_admin.platform_users 
      WHERE email = :email
    `;

    const [results] = await platformDb.query(query, {
      replacements: { email },
      type: 'SELECT'
    });

    return results && results.length > 0 ? results[0] : null;
  }

  // Find platform user by ID
  private async findPlatformUserById(userId: string): Promise<any> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      SELECT id, username, email, password_hash, full_name, role, permissions, is_active, last_login_at
      FROM platform_admin.platform_users 
      WHERE id = :userId
    `;

    const [results] = await platformDb.query(query, {
      replacements: { userId },
      type: 'SELECT'
    });

    return results && results.length > 0 ? results[0] : null;
  }

  // Find tenant user by email
  private async findTenantUser(email: string, tenantId: string): Promise<any> {
    const tenantDb = await databaseConfig.getTenantConnection(tenantId);
    
    const query = `
      SELECT u.id, u.username, u.email, u.password_hash, u.full_name, u.is_active, u.last_login_at,
             u.tenant_id, r.role_name as role, r.permissions
      FROM core.users u
      LEFT JOIN core.roles r ON u.role_id = r.id
      WHERE u.email = :email AND u.tenant_id = :tenantId
    `;

    const [results] = await tenantDb.query(query, {
      replacements: { email, tenantId },
      type: 'SELECT'
    });

    return results && results.length > 0 ? results[0] : null;
  }

  // Find tenant user by ID
  private async findTenantUserById(userId: string, tenantId: string): Promise<any> {
    const tenantDb = await databaseConfig.getTenantConnection(tenantId);
    
    const query = `
      SELECT u.id, u.username, u.email, u.password_hash, u.full_name, u.is_active, u.last_login_at,
             u.tenant_id, r.role_name as role, r.permissions
      FROM core.users u
      LEFT JOIN core.roles r ON u.role_id = r.id
      WHERE u.id = :userId AND u.tenant_id = :tenantId
    `;

    const [results] = await tenantDb.query(query, {
      replacements: { userId, tenantId },
      type: 'SELECT'
    });

    return results && results.length > 0 ? results[0] : null;
  }

  // Build user info object
  private async buildUserInfo(user: any, userType: 'platform' | 'tenant', tenantId?: string): Promise<UserInfo> {
    let bankingType: string | undefined;

    // Get tenant info if this is a tenant user
    if (tenantId && userType === 'tenant') {
      const platformDb = databaseConfig.getPlatformConnection();
      const tenantQuery = `
        SELECT banking_type FROM platform_admin.tenants WHERE id = :tenantId
      `;
      const [tenantResults] = await platformDb.query(tenantQuery, {
        replacements: { tenantId },
        type: 'SELECT'
      });
      
      if (tenantResults && tenantResults.length > 0) {
        bankingType = (tenantResults[0] as any).banking_type;
      }
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role || 'user',
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []),
      tenantId: userType === 'tenant' ? tenantId : undefined,
      bankingType,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined
    };
  }

  // Generate JWT tokens
  private async generateTokens(user: UserInfo): Promise<{ accessToken: string; refreshToken: string }> {
    const config = configService.getConfiguration();
    const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET;
    const refreshSecret = config.security?.jwtRefreshSecret || process.env.JWT_REFRESH_SECRET;

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      tenantId: user.tenantId,
      bankingType: user.bankingType
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      refreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Create platform user
  private async createPlatformUser(userData: any): Promise<void> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      INSERT INTO platform_admin.platform_users (
        id, username, email, password_hash, full_name, role, permissions, is_active, created_at, updated_at
      ) VALUES (
        :id, :username, :email, :passwordHash, :fullName, :role, :permissions, true, NOW(), NOW()
      )
    `;

    await platformDb.query(query, {
      replacements: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        fullName: userData.fullName,
        role: userData.role,
        permissions: JSON.stringify([])
      }
    });
  }

  // Create tenant user
  private async createTenantUser(userData: any): Promise<void> {
    const tenantDb = await databaseConfig.getTenantConnection(userData.tenantId);
    
    const query = `
      INSERT INTO core.users (
        id, username, email, password_hash, full_name, tenant_id, is_active, created_at, updated_at
      ) VALUES (
        :id, :username, :email, :passwordHash, :fullName, :tenantId, true, NOW(), NOW()
      )
    `;

    await tenantDb.query(query, {
      replacements: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        fullName: userData.fullName,
        tenantId: userData.tenantId
      }
    });
  }

  // Update last login
  private async updateLastLogin(userId: string, userType: 'platform' | 'tenant', tenantId?: string): Promise<void> {
    if (userType === 'platform') {
      const platformDb = databaseConfig.getPlatformConnection();
      await platformDb.query(
        'UPDATE platform_admin.platform_users SET last_login_at = NOW() WHERE id = :userId',
        { replacements: { userId } }
      );
    } else if (tenantId) {
      const tenantDb = await databaseConfig.getTenantConnection(tenantId);
      await tenantDb.query(
        'UPDATE core.users SET last_login_at = NOW() WHERE id = :userId',
        { replacements: { userId } }
      );
    }
  }

  // Update user password
  private async updateUserPassword(userId: string, passwordHash: string, userType: 'platform' | 'tenant', tenantId?: string): Promise<void> {
    if (userType === 'platform') {
      const platformDb = databaseConfig.getPlatformConnection();
      await platformDb.query(
        'UPDATE platform_admin.platform_users SET password_hash = :passwordHash, updated_at = NOW() WHERE id = :userId',
        { replacements: { userId, passwordHash } }
      );
    } else if (tenantId) {
      const tenantDb = await databaseConfig.getTenantConnection(tenantId);
      await tenantDb.query(
        'UPDATE core.users SET password_hash = :passwordHash, updated_at = NOW() WHERE id = :userId',
        { replacements: { userId, passwordHash } }
      );
    }
  }

  // Store password reset token
  private async storePasswordResetToken(userId: string, token: string, expiry: Date, tenantId?: string): Promise<void> {
    // Implementation for password reset token storage
    // This would typically go in a separate password_reset_tokens table
  }

  // Validate password strength
  private isPasswordStrong(password: string): boolean {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  // Log authentication events
  private async logAuthEvent(userId: string, eventType: string, description: string, tenantId?: string): Promise<void> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      INSERT INTO platform_audit.global_audit_log (
        id, tenant_id, user_id, event_type, action, description, created_at
      ) VALUES (
        :id, :tenantId, :userId, :eventType, 'AUTH', :description, NOW()
      )
    `;

    await platformDb.query(query, {
      replacements: {
        id: uuidv4(),
        tenantId: tenantId || null,
        userId,
        eventType,
        description
      }
    });
  }
}

// Export singleton instance
export const authenticationService = AuthenticationService.getInstance();

// Export types
export type {
  LoginCredentials,
  RegisterInput,
  AuthResult,
  UserInfo
};
EOF
    
    log_success "Enterprise Authentication Service generated"
}

# Generate Authorization Service
generate_authorization_service() {
    log_info "Generating Authorization Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/auth/authorization.service.ts" << 'EOF'
// packages/backend/src/core/services/auth/authorization.service.ts
// Enterprise Authorization Service - IFRS 9 Multi-Tenant Platform
// Based on: 001-006-008-coding-standards.md RBAC patterns

import { databaseConfig } from '../../database/config/database.config';

interface Role {
  id: string;
  roleName: string;
  permissions: string[];
  bankingType?: string;
  tenantId?: string;
  isActive: boolean;
}

interface Permission {
  id: string;
  permissionName: string;
  resource: string;
  action: string;
  bankingType?: string;
  description?: string;
}

export class AuthorizationService {
  private static instance: AuthorizationService;

  public static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  // MANDATORY: Check if user has permission
  public async hasPermission(userId: string, permission: string, tenantId?: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId, tenantId);
      
      // Check for exact permission or wildcard permissions
      return userPermissions.includes(permission) ||
             userPermissions.includes('*') ||
             userPermissions.some(p => this.matchesWildcard(p, permission));

    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // MANDATORY: Check if user has role
  public async hasRole(userId: string, roleName: string, tenantId?: string): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId, tenantId);
      return userRoles.some(role => role.roleName === roleName);

    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  // MANDATORY: Get user permissions
  public async getUserPermissions(userId: string, tenantId?: string): Promise<string[]> {
    try {
      if (tenantId) {
        return await this.getTenantUserPermissions(userId, tenantId);
      } else {
        return await this.getPlatformUserPermissions(userId);
      }

    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  // MANDATORY: Get user roles
  public async getUserRoles(userId: string, tenantId?: string): Promise<Role[]> {
    try {
      if (tenantId) {
        return await this.getTenantUserRoles(userId, tenantId);
      } else {
        return await this.getPlatformUserRoles(userId);
      }

    } catch (error) {
      console.error('Get user roles error:', error);
      return [];
    }
  }

  // MANDATORY: Banking type permission check
  public async hasBankingPermission(userId: string, bankingType: string, permission: string, tenantId?: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId, tenantId);
      
      // Check if any role has permission for the specific banking type
      for (const role of roles) {
        if (!role.bankingType || role.bankingType === bankingType || role.bankingType === 'dual') {
          const rolePermissions = role.permissions;
          if (rolePermissions.includes(permission) || 
              rolePermissions.includes('*') ||
              rolePermissions.some(p => this.matchesWildcard(p, permission))) {
            return true;
          }
        }
      }

      return false;

    } catch (error) {
      console.error('Banking permission check error:', error);
      return false;
    }
  }

  // MANDATORY: Syariah compliance check
  public async hasSyariahAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      // Check if user has syariah banking permissions
      const hasSyariahPermission = await this.hasPermission(userId, 'syariah:access', tenantId);
      const hasBankingPermission = await this.hasBankingPermission(userId, 'syariah', 'banking:access', tenantId);
      
      return hasSyariahPermission || hasBankingPermission;

    } catch (error) {
      console.error('Syariah access check error:', error);
      return false;
    }
  }

  // Get platform user permissions
  private async getPlatformUserPermissions(userId: string): Promise<string[]> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      SELECT permissions FROM platform_admin.platform_users WHERE id = :userId
    `;

    const [results] = await platformDb.query(query, {
      replacements: { userId },
      type: 'SELECT'
    });

    if (results && results.length > 0) {
      const user = results[0] as any;
      return typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []);
    }

    return [];
  }

  // Get platform user roles
  private async getPlatformUserRoles(userId: string): Promise<Role[]> {
    const platformDb = databaseConfig.getPlatformConnection();
    
    const query = `
      SELECT u.role, u.permissions
      FROM platform_admin.platform_users u
      WHERE u.id = :userId
    `;

    const [results] = await platformDb.query(query, {
      replacements: { userId },
      type: 'SELECT'
    });

    if (results && results.length > 0) {
      const user = results[0] as any;
      return [{
        id: userId,
        roleName: user.role || 'user',
        permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []),
        isActive: true
      }];
    }

    return [];
  }

  // Get tenant user permissions
  private async getTenantUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const tenantDb = await databaseConfig.getTenantConnection(tenantId);
    
    const query = `
      SELECT r.permissions
      FROM core.users u
      LEFT JOIN core.roles r ON u.role_id = r.id
      WHERE u.id = :userId AND u.tenant_id = :tenantId
    `;

    const [results] = await tenantDb.query(query, {
      replacements: { userId, tenantId },
      type: 'SELECT'
    });

    if (results && results.length > 0) {
      const user = results[0] as any;
      return typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []);
    }

    return [];
  }

  // Get tenant user roles
  private async getTenantUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    const tenantDb = await databaseConfig.getTenantConnection(tenantId);
    
    const query = `
      SELECT r.id, r.role_name, r.permissions, r.banking_type
      FROM core.users u
      LEFT JOIN core.roles r ON u.role_id = r.id
      WHERE u.id = :userId AND u.tenant_id = :tenantId
    `;

    const [results] = await tenantDb.query(query, {
      replacements: { userId, tenantId },
      type: 'SELECT'
    });

    return (results as any[]).map(row => ({
      id: row.id,
      roleName: row.role_name,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || []),
      bankingType: row.banking_type,
      tenantId,
      isActive: true
    }));
  }

  // Check wildcard permission matching
  private matchesWildcard(wildcardPermission: string, permission: string): boolean {
    if (!wildcardPermission.includes('*')) {
      return false;
    }

    const pattern = wildcardPermission.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(permission);
  }
}

// Export singleton instance
export const authorizationService = AuthorizationService.getInstance();

// Export types
export type { Role, Permission };
EOF
    
    log_success "Authorization Service generated"
}

# Generate JWT Utilities
generate_jwt_utilities() {
    log_info "Generating JWT utilities..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/utils/auth"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/utils/auth/jwt.utils.ts" << 'EOF'
// packages/backend/src/utils/auth/jwt.utils.ts
// JWT Utilities - IFRS 9 Multi-Tenant Platform

import jwt from 'jsonwebtoken';
import { configService } from '../../core/services/configuration/configuration.service';

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
    const config = configService.getConfiguration();
    const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT secret is not configured');
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      issuer: 'ifrs9-platform',
      audience: 'ifrs9-users'
    });
  }

  // Generate refresh token
  public static generateRefreshToken(userId: string): string {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!refreshSecret) {
      throw new Error('JWT refresh secret is not configured');
    }

    return jwt.sign(
      { userId, type: 'refresh' },
      refreshSecret,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'ifrs9-platform',
        audience: 'ifrs9-users'
      }
    );
  }

  // Verify access token
  public static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const config = configService.getConfiguration();
      const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        throw new Error('JWT secret is not configured');
      }

      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'ifrs9-platform',
        audience: 'ifrs9-users'
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  public static verifyRefreshToken(token: string): { userId: string; type: string } | null {
    try {
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      
      if (!refreshSecret) {
        throw new Error('JWT refresh secret is not configured');
      }

      const decoded = jwt.verify(token, refreshSecret, {
        issuer: 'ifrs9-platform',
        audience: 'ifrs9-users'
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
EOF
    
    log_success "JWT utilities generated"
}

# Generate Authentication Controller
generate_auth_controller() {
    log_info "Generating Authentication Controller..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/auth.controller.ts" << 'EOF'
// packages/backend/src/api/controllers/auth.controller.ts
// Authentication Controller - IFRS 9 Multi-Tenant Platform

import { Request, Response } from 'express';
import { authenticationService } from '../../core/services/auth/authentication.service';
import { authorizationService } from '../../core/services/auth/authorization.service';

export class AuthController {
  // User login
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, tenantId } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      const result = await authenticationService.login({ email, password, tenantId });

      if (result.success) {
        res.json({
          success: true,
          message: 'Login successful',
          user: result.user,
          tokens: result.tokens
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // User registration
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName, tenantId, role } = req.body;

      if (!username || !email || !password || !fullName) {
        res.status(400).json({
          success: false,
          error: 'Username, email, password, and full name are required'
        });
        return;
      }

      const result = await authenticationService.register({
        username,
        email,
        password,
        fullName,
        tenantId,
        role
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Registration successful',
          user: result.user
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Registration controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get current user
  public static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Change password
  public static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Old password and new password are required'
        });
        return;
      }

      const success = await authenticationService.changePassword(
        req.user.id,
        oldPassword,
        newPassword,
        req.user.tenantId
      );

      if (success) {
        res.json({
          success: true,
          message: 'Password changed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to change password'
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get user permissions
  public static async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      const permissions = await authorizationService.getUserPermissions(
        req.user.id,
        req.user.tenantId
      );

      const roles = await authorizationService.getUserRoles(
        req.user.id,
        req.user.tenantId
      );

      res.json({
        success: true,
        data: {
          userId: req.user.id,
          permissions,
          roles,
          bankingType: req.user.bankingType
        }
      });
    } catch (error) {
      console.error('Get user permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Logout (client-side token removal, server-side can blacklist)
  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a more complete implementation, you would:
      // 1. Add the token to a blacklist/cache
      // 2. Log the logout event
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
EOF
    
    log_success "Authentication Controller generated"
}

# Generate Authentication Routes
generate_auth_routes() {
    log_info "Generating Authentication Routes..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/auth.routes.ts" << 'EOF'
// packages/backend/src/api/routes/auth.routes.ts
// Authentication Routes - IFRS 9 Multi-Tenant Platform

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { validate, ValidationSchemas } from '../middleware/validation.middleware';

const router = Router();

// Public authentication routes
router.post('/login', 
  validate({
    body: ValidationSchemas.login
  }),
  AuthController.login
);

router.post('/register',
  validate({
    body: ValidationSchemas.register
  }),
  AuthController.register
);

// Protected authentication routes
router.use(verifyToken);

router.get('/me', AuthController.getCurrentUser);

router.post('/change-password',
  validate({
    body: ValidationSchemas.changePassword
  }),
  AuthController.changePassword
);

router.get('/permissions', AuthController.getUserPermissions);

router.post('/logout', AuthController.logout);

export default router;
EOF
    
    log_success "Authentication Routes generated"
}

# Update validation schemas for authentication
update_validation_schemas() {
    log_info "Updating validation schemas for authentication..."
    
    cat >> "${PROJECT_ROOT}/packages/backend/src/api/middleware/validation.middleware.ts" << 'EOF'

// Authentication validation schemas
const authSchemas = {
  // Login schema
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    tenantId: z.string().uuid().optional()
  }),

  // Registration schema
  register: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    fullName: z.string().min(1, 'Full name is required').max(200),
    tenantId: z.string().uuid().optional(),
    role: z.string().optional()
  }),

  // Change password schema
  changePassword: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'New password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
  })
};

// Add auth schemas to ValidationSchemas
Object.assign(ValidationSchemas, authSchemas);
EOF
    
    log_success "Validation schemas updated for authentication"
}

# Update main Express app to include auth routes
update_express_app_with_auth() {
    log_info "Updating Express app to include authentication routes..."
    
    # Insert auth routes import
    sed -i '/import tenantRoutes/a import authRoutes from '\''./api/routes/auth.routes'\'';' "${PROJECT_ROOT}/packages/backend/src/index.ts"
    
    # Insert auth routes mounting
    sed -i '/app.use.*tenantRoutes/a app.use('\''/api/v1/auth'\'', authRoutes);' "${PROJECT_ROOT}/packages/backend/src/index.ts"
    
    log_success "Express app updated with authentication routes"
}

# Main function
main() {
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads,config}
    
    # Ensure log file is accessible
    touch "${LOG_FILE}" 2>/dev/null || {
        echo "Warning: Cannot create log file at ${LOG_FILE}, using console only"
        LOG_FILE="/dev/null"
    }
    
    log_info "🚀 Starting IFRS9 Platform - Day 1 Hour 3: Enterprise Authentication & Authorization System"
    log_info "🕐 Execution started at: $(date)"
    
    # Execute setup steps
    generate_authentication_service
    generate_authorization_service
    generate_jwt_utilities
    generate_auth_controller
    generate_auth_routes
    update_validation_schemas
    update_express_app_with_auth
    
    log_success "🎉 IFRS9 Platform Authentication & Authorization System Setup Completed Successfully!"
    log_info "📝 Setup log saved to: ${LOG_FILE}"
    log_info "🔄 Next: Execute './scripts/setup/d1h4-config-setup.sh' for Configuration Management System"
    log_info "🕐 Execution completed at: $(date)"
    
    echo ""
    echo "🎯 DAY 1 HOUR 3 COMPLETED - ENTERPRISE AUTHENTICATION & AUTHORIZATION SYSTEM"
    echo "✅ Authentication Service with multi-tenant support"
    echo "✅ Authorization Service with RBAC and banking type permissions"
    echo "✅ JWT utilities with access and refresh tokens"
    echo "✅ Authentication Controller with comprehensive endpoints"
    echo "✅ Authentication Routes with validation"
    echo "✅ Updated validation schemas for auth operations"
    echo "✅ Express app integration with auth routes"
    echo ""
    echo "🔐 Authentication features ready:"
    echo "   • Multi-tenant user authentication"
    echo "   • Platform admin vs tenant user support"
    echo "   • JWT token-based authentication"
    echo "   • Role-based access control (RBAC)"
    echo "   • Banking type-specific permissions"
    echo "   • Syariah compliance access control"
    echo "   • Password strength validation"
    echo "   • Comprehensive audit logging"
    echo ""
    echo "🌐 Authentication endpoints:"
    echo "   • POST /api/v1/auth/login - User login"
    echo "   • POST /api/v1/auth/register - User registration"
    echo "   • GET /api/v1/auth/me - Current user info"
    echo "   • POST /api/v1/auth/change-password - Change password"
    echo "   • GET /api/v1/auth/permissions - User permissions"
    echo "   • POST /api/v1/auth/logout - User logout"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Test authentication: pnpm run dev"
    echo "   2. Test login: curl -X POST http://localhost:4232/api/v1/auth/login"
    echo "   3. Continue with Day 1 Hour 4: ./scripts/setup/d1h4-config-setup.sh"
    echo ""
    echo "✅ HOUR 3 COMPLETE - ENTERPRISE AUTHENTICATION SYSTEM READY!"
}

# Execute main function with all arguments
main "$@"
