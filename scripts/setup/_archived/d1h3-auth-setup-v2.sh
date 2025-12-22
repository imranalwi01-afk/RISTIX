#!/bin/bash
# scripts/setup/d1h3-auth-setup.sh
# IFRS9 Platform - Day 1 Hour 3: Advanced RBAC Authentication System
# This script generates the complete authentication system with JWT, RBAC, and multi-tenant security

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h3-auth-setup-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating environment for authentication system setup..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    
    if ! printf '%s\n%s\n' "${required_version}" "${node_version}" | sort -V -C; then
        log_error "Node.js version ${node_version} is below required ${required_version}"
        exit 1
    fi
    
    # Check project structure
    if [[ ! -d "${PROJECT_ROOT}/packages/backend" ]]; then
        log_error "Backend package directory not found"
        exit 1
    fi
    
    # Check database connectivity
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" &> /dev/null; then
        log_error "PostgreSQL database is not accessible"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Create authentication directory structure
create_auth_directories() {
    log_info "Creating authentication directory structure..."
    
    local backend_dir="${PROJECT_ROOT}/packages/backend"
    
    # Core authentication services
    mkdir -p "${backend_dir}/src/core/services/auth"
    mkdir -p "${backend_dir}/src/core/services/redis"
    mkdir -p "${backend_dir}/src/core/services/audit"
    
    # Authentication middleware
    mkdir -p "${backend_dir}/src/api/middleware"
    
    # Authentication controllers and routes
    mkdir -p "${backend_dir}/src/api/controllers"
    mkdir -p "${backend_dir}/src/api/routes"
    
    # Database models
    mkdir -p "${backend_dir}/src/core/models"
    
    # Authentication types
    mkdir -p "${backend_dir}/src/types"
    
    # Test directories
    mkdir -p "${backend_dir}/tests/unit/auth"
    mkdir -p "${backend_dir}/tests/integration/auth"
    
    log_success "Authentication directory structure created"
}

# Generate JWT Service
generate_jwt_service() {
    log_info "Generating JWT Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/auth/jwt.service.ts" << 'EOF'
// packages/backend/src/core/services/auth/jwt.service.ts
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { AuditService } from '../audit/audit.service';

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
  private readonly issuer = 'ifrs9-platform';
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
      // Get JWT configuration
      const jwtSecret = await this.configService.get<string>('jwt.secret');
      const signingKey = await this.configService.get<string>('jwt.signingKey');
      
      // Get user permissions for this tenant
      const permissions = await this.getUserPermissions(user.id, tenant.id);
      const bankingPermissions = await this.getBankingPermissions(user.id, tenant.id, tenant.bankingType);
      
      // Create access token payload
      const accessPayload: JWTPayload = {
        // Standard claims
        iss: this.issuer,
        sub: user.id,
        aud: `tenant:${tenant.id}`,
        exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
        iat: Math.floor(Date.now() / 1000),
        jti: uuidv4(),
        
        // Multi-tenant context
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        bankingType: tenant.bankingType,
        
        // User context
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles?.map((role: any) => role.roleName) || [],
        permissions,
        
        // Security context
        sessionId: authContext.sessionId,
        deviceId: authContext.deviceId,
        ipAddress: authContext.ipAddress,
        mfaVerified: authContext.mfaVerified,
        riskScore: authContext.riskScore,
        
        // Banking permissions
        bankingPermissions,
        complianceLevel: tenant.complianceLevel || 'standard',
        
        // Operational context
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
        iss: this.issuer,
        sub: user.id,
        aud: `tenant:${tenant.id}`,
        exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry,
        iat: Math.floor(Date.now() / 1000),
        jti: uuidv4(),
        type: 'refresh',
        sessionId: authContext.sessionId
      };
      
      // Sign tokens
      const accessToken = jwt.sign(accessPayload, signingKey, { algorithm: 'RS256' });
      const refreshToken = jwt.sign(refreshPayload, jwtSecret, { algorithm: 'HS256' });
      
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
      // Get appropriate secret/key
      const secret = tokenType === 'access' 
        ? await this.configService.get<string>('jwt.signingKey')
        : await this.configService.get<string>('jwt.secret');
      
      const algorithm = tokenType === 'access' ? 'RS256' : 'HS256';
      
      // Verify token
      const payload = jwt.verify(token, secret, { 
        algorithms: [algorithm],
        issuer: this.issuer
      }) as JWTPayload;
      
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
EOF

    log_success "JWT Service generated successfully"
}

# Generate RBAC Service
generate_rbac_service() {
    log_info "Generating RBAC Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/auth/rbac.service.ts" << 'EOF'
// packages/backend/src/core/services/auth/rbac.service.ts
import { ConfigurationService } from '../configuration/configuration.service';
import { AuditService } from '../audit/audit.service';
import { RedisService } from '../redis/redis.service';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  bankingTypeRestriction?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  complianceLevel?: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  bankingTypeSpecific?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  complianceLevel?: string;
  hierarchyLevel: number;
  tenantId?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  tenantId: string;
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  isActive: boolean;
  complianceLevel?: string;
}

export interface PermissionCheckRequest {
  userId: string;
  tenantId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
  bankingType?: 'CONVENTIONAL' | 'SYARIAH';
}

export interface PermissionCheckResult {
  granted: boolean;
  reason: string;
  conditions?: Record<string, any>;
  auditInfo: {
    timestamp: Date;
    ruleApplied: string;
    bankingCompliance: boolean;
  };
}

export class RBACService {
  private readonly CACHE_TTL = 300; // 5 minutes
  
  constructor(
    private readonly configService: ConfigurationService,
    private readonly auditService: AuditService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Check if user has permission to perform action on resource
   */
  async checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResult> {
    try {
      const startTime = Date.now();
      
      // Get user with roles and permissions
      const user = await this.getUserWithRoles(request.userId, request.tenantId);
      if (!user || !user.isActive) {
        return this.denyAccess('User not found or inactive');
      }
      
      // Check tenant context
      if (user.tenantId !== request.tenantId) {
        return this.denyAccess('Tenant context mismatch');
      }
      
      // Get tenant banking type for validation
      const tenantBankingType = await this.getTenantBankingType(request.tenantId);
      const effectiveBankingType = request.bankingType || tenantBankingType;
      
      // Validate banking access
      if (!this.validateBankingAccess(user, effectiveBankingType)) {
        return this.denyAccess('Banking type access not permitted');
      }
      
      // Check if user has any matching permissions
      let bestMatch: Permission | null = null;
      let matchScore = 0;
      
      for (const role of user.roles) {
        for (const permission of role.permissions) {
          const score = this.calculatePermissionMatch(permission, request);
          if (score > matchScore) {
            matchScore = score;
            bestMatch = permission;
          }
        }
      }
      
      if (!bestMatch || matchScore === 0) {
        return this.denyAccess('No matching permissions found');
      }
      
      // Validate banking type restriction
      if (!this.validateBankingTypeRestriction(bestMatch, effectiveBankingType)) {
        return this.denyAccess('Banking type restriction violation');
      }
      
      // Validate compliance level
      if (!this.validateComplianceLevel(user, bestMatch)) {
        return this.denyAccess('Compliance level insufficient');
      }
      
      // Validate conditions
      const conditionResult = await this.validateConditions(bestMatch, request);
      if (!conditionResult.valid) {
        return this.denyAccess(`Condition validation failed: ${conditionResult.reason}`);
      }
      
      // Permission granted
      const result: PermissionCheckResult = {
        granted: true,
        reason: 'Permission granted',
        conditions: bestMatch.conditions,
        auditInfo: {
          timestamp: new Date(),
          ruleApplied: `${bestMatch.resource}:${bestMatch.action}`,
          bankingCompliance: true
        }
      };
      
      // Audit the permission check
      await this.auditPermissionCheck(request, result, Date.now() - startTime);
      
      return result;
      
    } catch (error) {
      return this.denyAccess(`Permission check error: ${error}`);
    }
  }

  /**
   * Get all permissions for a user in a tenant
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<Permission[]> {
    try {
      const cacheKey = `user_permissions:${userId}:${tenantId}`;
      
      // Try cache first
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const user = await this.getUserWithRoles(userId, tenantId);
      if (!user) {
        return [];
      }
      
      // Aggregate all permissions from all roles
      const permissions: Permission[] = [];
      const seen = new Set<string>();
      
      for (const role of user.roles) {
        for (const permission of role.permissions) {
          const key = `${permission.resource}:${permission.action}`;
          if (!seen.has(key)) {
            seen.add(key);
            permissions.push(permission);
          }
        }
      }
      
      // Cache the result
      await this.redisService.setex(cacheKey, this.CACHE_TTL, JSON.stringify(permissions));
      
      return permissions;
      
    } catch (error) {
      throw new Error(`Failed to get user permissions: ${error}`);
    }
  }

  /**
   * Get banking-specific permissions
   */
  async getBankingPermissions(
    userId: string, 
    tenantId: string, 
    bankingType: 'CONVENTIONAL' | 'SYARIAH'
  ): Promise<Permission[]> {
    try {
      const allPermissions = await this.getUserPermissions(userId, tenantId);
      
      return allPermissions.filter(permission => {
        // Include permissions that are not banking-specific or match the banking type
        return !permission.bankingTypeRestriction || 
               permission.bankingTypeRestriction === 'BOTH' ||
               permission.bankingTypeRestriction === bankingType;
      });
      
    } catch (error) {
      throw new Error(`Failed to get banking permissions: ${error}`);
    }
  }

  // Private helper methods
  private denyAccess(reason: string): PermissionCheckResult {
    return {
      granted: false,
      reason,
      auditInfo: {
        timestamp: new Date(),
        ruleApplied: 'ACCESS_DENIED',
        bankingCompliance: false
      }
    };
  }

  private async getUserWithRoles(userId: string, tenantId: string): Promise<User | null> {
    // TODO: Implement actual user lookup with roles from database
    return null;
  }

  private async getTenantBankingType(tenantId: string): Promise<'CONVENTIONAL' | 'SYARIAH' | 'DUAL'> {
    // TODO: Implement actual tenant banking type lookup
    return 'CONVENTIONAL';
  }

  private validateBankingAccess(user: User, bankingType: string): boolean {
    return user.bankingAccess === 'BOTH' || user.bankingAccess === bankingType;
  }

  private calculatePermissionMatch(permission: Permission, request: PermissionCheckRequest): number {
    let score = 0;
    
    // Exact resource match
    if (permission.resource === request.resource) {
      score += 100;
    } else if (permission.resource === '*') {
      score += 50;
    }
    
    // Exact action match
    if (permission.action === request.action) {
      score += 100;
    } else if (permission.action === '*') {
      score += 50;
    }
    
    return score;
  }

  private validateBankingTypeRestriction(
    permission: Permission, 
    bankingType: string
  ): boolean {
    if (!permission.bankingTypeRestriction) return true;
    if (permission.bankingTypeRestriction === 'BOTH') return true;
    return permission.bankingTypeRestriction === bankingType;
  }

  private validateComplianceLevel(user: User, permission: Permission): boolean {
    if (!permission.complianceLevel) return true;
    // TODO: Implement compliance level validation logic
    return true;
  }

  private async validateConditions(
    permission: Permission, 
    request: PermissionCheckRequest
  ): Promise<{ valid: boolean; reason?: string }> {
    if (!permission.conditions) {
      return { valid: true };
    }
    
    // TODO: Implement condition validation logic
    return { valid: true };
  }

  private async auditPermissionCheck(
    request: PermissionCheckRequest, 
    result: PermissionCheckResult, 
    executionTime: number
  ): Promise<void> {
    await this.auditService.log({
      userId: request.userId,
      tenantId: request.tenantId,
      eventType: 'AUTHORIZATION',
      action: 'PERMISSION_CHECK',
      description: `Permission check: ${request.resource}:${request.action}`,
      metadata: {
        resource: request.resource,
        action: request.action,
        granted: result.granted,
        reason: result.reason,
        executionTimeMs: executionTime
      }
    });
  }
}
EOF

    log_success "RBAC Service generated successfully"
}

# Generate Authentication Controller
generate_auth_controller() {
    log_info "Generating Authentication Controller..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/auth.controller.ts" << 'EOF'
// packages/backend/src/api/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { JWTService, AuthContext } from '../../core/services/auth/jwt.service';
import { RBACService } from '../../core/services/auth/rbac.service';
import { UserService } from '../../core/services/user/user.service';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { AuditService } from '../../core/services/audit/audit.service';
import { ValidationService } from '../../core/services/validation/validation.service';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
  deviceId: z.string().optional(),
  mfaCode: z.string().optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

export class AuthController {
  constructor(
    private readonly jwtService: JWTService,
    private readonly rbacService: RBACService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService,
    private readonly validationService: ValidationService
  ) {}

  /**
   * User login with multi-tenant support
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const validatedData = loginSchema.parse(req.body);
      
      // Get tenant by slug
      const tenant = await this.tenantService.getBySlug(validatedData.tenantSlug);
      if (!tenant || !tenant.isActive) {
        res.status(401).json({
          success: false,
          error: 'Invalid tenant or tenant inactive',
          code: 'INVALID_TENANT'
        });
        return;
      }
      
      // Get user by email within tenant context
      const user = await this.userService.getByEmailAndTenant(
        validatedData.email, 
        tenant.id
      );
      
      if (!user || !user.isActive) {
        // Audit failed login attempt
        await this.auditService.log({
          tenantId: tenant.id,
          eventType: 'AUTHENTICATION',
          action: 'LOGIN_FAILED',
          description: 'User not found or inactive',
          metadata: {
            email: validatedData.email,
            reason: 'USER_NOT_FOUND_OR_INACTIVE'
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }
      
      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        res.status(423).json({
          success: false,
          error: 'Account temporarily locked',
          code: 'ACCOUNT_LOCKED',
          lockedUntil: user.lockedUntil
        });
        return;
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(
        validatedData.password, 
        user.passwordHash
      );
      
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.userService.incrementFailedLoginAttempts(user.id);
        
        // Audit failed login attempt
        await this.auditService.log({
          userId: user.id,
          tenantId: tenant.id,
          eventType: 'AUTHENTICATION',
          action: 'LOGIN_FAILED',
          description: 'Invalid password',
          metadata: {
            email: validatedData.email,
            reason: 'INVALID_PASSWORD',
            failedAttempts: user.failedLoginAttempts + 1
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }
      
      // Check MFA if enabled
      let mfaVerified = !user.mfaEnabled;
      if (user.mfaEnabled) {
        if (!validatedData.mfaCode) {
          res.status(422).json({
            success: false,
            error: 'MFA code required',
            code: 'MFA_REQUIRED'
          });
          return;
        }
        
        // Verify MFA code
        mfaVerified = await this.userService.verifyMfaCode(
          user.id, 
          validatedData.mfaCode
        );
        
        if (!mfaVerified) {
          res.status(401).json({
            success: false,
            error: 'Invalid MFA code',
            code: 'INVALID_MFA_CODE'
          });
          return;
        }
      }
      
      // Calculate risk score (simplified)
      const riskScore = await this.calculateRiskScore(req, user, tenant);
      
      // Create authentication context
      const authContext: AuthContext = {
        sessionId: uuidv4(),
        deviceId: validatedData.deviceId || uuidv4(),
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        geolocation: req.get('X-Forwarded-For'),
        loginMethod: mfaVerified ? 'mfa' : 'password',
        mfaVerified,
        riskScore,
        temporaryAccess: false
      };
      
      // Generate JWT token pair
      const tokenPair = await this.jwtService.generateTokenPair(
        user, 
        tenant, 
        authContext
      );
      
      // Update user login info
      await this.userService.updateLoginInfo(user.id, {
        lastLoginAt: new Date(),
        loginCount: user.loginCount + 1,
        failedLoginAttempts: 0,
        lockedUntil: null
      });
      
      // Audit successful login
      await this.auditService.log({
        userId: user.id,
        tenantId: tenant.id,
        eventType: 'AUTHENTICATION',
        action: 'LOGIN_SUCCESS',
        description: 'User logged in successfully',
        metadata: {
          sessionId: authContext.sessionId,
          deviceId: authContext.deviceId,
          mfaVerified,
          riskScore,
          bankingType: tenant.bankingType
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles?.map(role => role.roleName) || [],
            bankingAccess: user.bankingAccess,
            forcePasswordChange: user.forcePasswordChange
          },
          tenant: {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name,
            bankingType: tenant.bankingType
          },
          tokens: tokenPair,
          session: {
            sessionId: authContext.sessionId,
            expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
          }
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      
      const tokenPair = await this.jwtService.refreshToken(validatedData.refreshToken);
      
      res.status(200).json({
        success: true,
        data: {
          tokens: tokenPair
        }
      });
      
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  }

  /**
   * User logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await this.jwtService.revokeToken(token);
      }
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get current user profile
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      // User and tenant info should be available from auth middleware
      const user = (req as any).user;
      const tenant = (req as any).tenant;
      
      if (!user || !tenant) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }
      
      // Get user permissions
      const permissions = await this.rbacService.getUserPermissions(user.id, tenant.id);
      const bankingPermissions = await this.rbacService.getBankingPermissions(
        user.id, 
        tenant.id, 
        tenant.bankingType
      );
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles?.map((role: any) => role.roleName) || [],
            bankingAccess: user.bankingAccess,
            permissions: permissions.map(p => `${p.resource}:${p.action}`),
            bankingPermissions
          },
          tenant: {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name,
            bankingType: tenant.bankingType
          }
        }
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // Private helper methods
  private async calculateRiskScore(req: Request, user: any, tenant: any): Promise<number> {
    let riskScore = 0;
    
    // Check for suspicious IP patterns
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || '';
    
    // Basic risk factors
    if (!userAgent.includes('Mozilla')) riskScore += 20;
    if (ipAddress.startsWith('10.') || ipAddress.startsWith('192.168.')) riskScore -= 10;
    
    // Time-based risk (login outside business hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) riskScore += 15;
    
    // Account age risk
    const accountAge = Date.now() - user.createdAt.getTime();
    if (accountAge < 24 * 60 * 60 * 1000) riskScore += 25; // Less than 24 hours old
    
    return Math.max(0, Math.min(100, riskScore));
  }
}
EOF

    log_success "Authentication Controller generated successfully"
}

# Generate Authentication Middleware
generate_auth_middleware() {
    log_info "Generating Authentication Middleware..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/middleware/auth.middleware.ts" << 'EOF'
// packages/backend/src/api/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../../core/services/auth/jwt.service';
import { RBACService } from '../../core/services/auth/rbac.service';
import { UserService } from '../../core/services/user/user.service';
import { TenantService } from '../../core/services/tenant/tenant.service';
import { AuditService } from '../../core/services/audit/audit.service';

export interface AuthenticatedRequest extends Request {
  user?: any;
  tenant?: any;
  jwtPayload?: JWTPayload;
  permissions?: string[];
}

export class AuthMiddleware {
  constructor(
    private readonly jwtService: JWTService,
    private readonly rbacService: RBACService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Authenticate user using JWT token
   */
  authenticate() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Get token from Authorization header
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({
            success: false,
            error: 'Authentication token required',
            code: 'TOKEN_REQUIRED'
          });
          return;
        }
        
        const token = authHeader.substring(7);
        
        // Verify JWT token
        const payload = await this.jwtService.verifyToken(token, 'access');
        
        // Get user details
        const user = await this.userService.getById(payload.userId);
        if (!user || !user.isActive) {
          res.status(401).json({
            success: false,
            error: 'User not found or inactive',
            code: 'USER_INACTIVE'
          });
          return;
        }
        
        // Get tenant details
        const tenant = await this.tenantService.getById(payload.tenantId);
        if (!tenant || !tenant.isActive) {
          res.status(401).json({
            success: false,
            error: 'Tenant not found or inactive',
            code: 'TENANT_INACTIVE'
          });
          return;
        }
        
        // Check if user belongs to tenant
        if (user.tenantId !== tenant.id) {
          res.status(403).json({
            success: false,
            error: 'User does not belong to tenant',
            code: 'TENANT_MISMATCH'
          });
          return;
        }
        
        // Check if password change is forced
        if (user.forcePasswordChange) {
          res.status(422).json({
            success: false,
            error: 'Password change required',
            code: 'PASSWORD_CHANGE_REQUIRED'
          });
          return;
        }
        
        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          res.status(423).json({
            success: false,
            error: 'Account temporarily locked',
            code: 'ACCOUNT_LOCKED',
            lockedUntil: user.lockedUntil
          });
          return;
        }
        
        // Get user permissions
        const permissions = await this.rbacService.getUserPermissions(user.id, tenant.id);
        
        // Attach user, tenant, and permissions to request
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).tenant = tenant;
        (req as AuthenticatedRequest).jwtPayload = payload;
        (req as AuthenticatedRequest).permissions = permissions.map(p => `${p.resource}:${p.action}`);
        
        next();
        
      } catch (error) {
        console.error('Authentication error:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('expired')) {
            res.status(401).json({
              success: false,
              error: 'Token expired',
              code: 'TOKEN_EXPIRED'
            });
            return;
          }
          
          if (error.message.includes('invalid') || error.message.includes('malformed')) {
            res.status(401).json({
              success: false,
              error: 'Invalid token',
              code: 'TOKEN_INVALID'
            });
            return;
          }
        }
        
        res.status(401).json({
          success: false,
          error: 'Authentication failed',
          code: 'AUTH_FAILED'
        });
      }
    };
  }

  /**
   * Require specific permission
   */
  requirePermission(resource: string, action: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as AuthenticatedRequest;
        
        if (!authReq.user || !authReq.tenant) {
          res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
          return;
        }
        
        // Check permission
        const permissionResult = await this.rbacService.checkPermission({
          userId: authReq.user.id,
          tenantId: authReq.tenant.id,
          resource,
          action,
          context: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
          },
          bankingType: authReq.tenant.bankingType
        });
        
        if (!permissionResult.granted) {
          // Audit access denied
          await this.auditService.log({
            userId: authReq.user.id,
            tenantId: authReq.tenant.id,
            eventType: 'AUTHORIZATION',
            action: 'ACCESS_DENIED',
            description: `Access denied for ${resource}:${action}`,
            metadata: {
              resource,
              action,
              reason: permissionResult.reason,
              path: req.path,
              method: req.method
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          
          res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'PERMISSION_DENIED',
            details: {
              resource,
              action,
              reason: permissionResult.reason
            }
          });
          return;
        }
        
        next();
        
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Require specific role
   */
  requireRole(roleName: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as AuthenticatedRequest;
        
        if (!authReq.user || !authReq.tenant) {
          res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
          return;
        }
        
        // Check if user has the required role
        const hasRole = authReq.user.roles?.some((role: any) => role.roleName === roleName);
        
        if (!hasRole) {
          // Audit access denied
          await this.auditService.log({
            userId: authReq.user.id,
            tenantId: authReq.tenant.id,
            eventType: 'AUTHORIZATION',
            action: 'ROLE_ACCESS_DENIED',
            description: `Role access denied: ${roleName}`,
            metadata: {
              requiredRole: roleName,
              userRoles: authReq.user.roles?.map((role: any) => role.roleName) || [],
              path: req.path,
              method: req.method
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          
          res.status(403).json({
            success: false,
            error: 'Insufficient role permissions',
            code: 'ROLE_DENIED',
            details: {
              requiredRole: roleName
            }
          });
          return;
        }
        
        next();
        
      } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Require banking type access
   */
  requireBankingAccess(bankingType: 'CONVENTIONAL' | 'SYARIAH') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as AuthenticatedRequest;
        
        if (!authReq.user || !authReq.tenant) {
          res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
          return;
        }
        
        // Check banking access
        const hasAccess = authReq.user.bankingAccess === 'BOTH' || 
                         authReq.user.bankingAccess === bankingType;
        
        if (!hasAccess) {
          res.status(403).json({
            success: false,
            error: 'Banking type access denied',
            code: 'BANKING_ACCESS_DENIED',
            details: {
              requiredBankingType: bankingType,
              userBankingAccess: authReq.user.bankingAccess
            }
          });
          return;
        }
        
        next();
        
      } catch (error) {
        console.error('Banking access check error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  /**
   * Optional authentication (user info if available)
   */
  optionalAuth() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          next();
          return;
        }
        
        const token = authHeader.substring(7);
        
        try {
          const payload = await this.jwtService.verifyToken(token, 'access');
          const user = await this.userService.getById(payload.userId);
          const tenant = await this.tenantService.getById(payload.tenantId);
          
          if (user && user.isActive && tenant && tenant.isActive) {
            const permissions = await this.rbacService.getUserPermissions(user.id, tenant.id);
            
            (req as AuthenticatedRequest).user = user;
            (req as AuthenticatedRequest).tenant = tenant;
            (req as AuthenticatedRequest).jwtPayload = payload;
            (req as AuthenticatedRequest).permissions = permissions.map(p => `${p.resource}:${p.action}`);
          }
        } catch (error) {
          // Ignore token errors for optional auth
        }
        
        next();
        
      } catch (error) {
        // Ignore errors for optional auth
        next();
      }
    };
  }
}
EOF

    log_success "Authentication Middleware generated successfully"
}

# Generate User Model (based on actual database schema)
generate_user_model() {
    log_info "Generating User Model (based on actual database schema)..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/models/user.model.ts" << 'EOF'
// packages/backend/src/core/models/user.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

// User attributes interface (based on actual database schema from backup files)
export interface UserAttributes {
  id: string;
  legacyId?: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordChangedAt: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  
  // Multi-factor authentication
  mfaEnabled: boolean;
  mfaSecret?: string;
  
  // Banking access control
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  
  // Syariah-specific fields
  syariahCertified?: boolean;
  syariahCertificationDate?: Date;
  syariahCertificationLevel?: string;
  
  // Session management
  loginCount: number;
  currentSessionId?: string;
  
  // Security
  forcePasswordChange: boolean;
  passwordHistory?: string[];
  
  // Tenant isolation
  tenantId: string;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Optional attributes for creation
interface UserCreationAttributes extends Optional<UserAttributes, 
  'id' | 'legacyId' | 'lastLoginAt' | 'passwordChangedAt' | 'failedLoginAttempts' | 
  'lockedUntil' | 'mfaEnabled' | 'mfaSecret' | 'syariahCertified' | 
  'syariahCertificationDate' | 'syariahCertificationLevel' | 'loginCount' | 
  'currentSessionId' | 'forcePasswordChange' | 'passwordHistory' | 'createdAt' | 
  'updatedAt' | 'createdBy' | 'updatedBy'
> {}

// User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public legacyId?: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public fullName!: string;
  public employeeId?: string;
  public department?: string;
  public position?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public passwordChangedAt!: Date;
  public failedLoginAttempts!: number;
  public lockedUntil?: Date;
  
  // Multi-factor authentication
  public mfaEnabled!: boolean;
  public mfaSecret?: string;
  
  // Banking access control
  public bankingAccess!: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  
  // Syariah-specific fields
  public syariahCertified?: boolean;
  public syariahCertificationDate?: Date;
  public syariahCertificationLevel?: string;
  
  // Session management
  public loginCount!: number;
  public currentSessionId?: string;
  
  // Security
  public forcePasswordChange!: boolean;
  public passwordHistory?: string[];
  
  // Tenant isolation
  public tenantId!: string;
  
  // Audit fields
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;

  // Instance methods
  public async incrementFailedAttempts(): Promise<void> {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await this.save();
  }

  public async resetFailedAttempts(): Promise<void> {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    await this.save();
  }

  public async updateLoginInfo(): Promise<void> {
    this.lastLoginAt = new Date();
    this.loginCount += 1;
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    await this.save();
  }

  public isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  public hasBankingAccess(bankingType: 'CONVENTIONAL' | 'SYARIAH'): boolean {
    return this.bankingAccess === 'BOTH' || this.bankingAccess === bankingType;
  }

  public isSyariahCompliant(): boolean {
    return this.syariahCertified === true && 
           this.syariahCertificationDate && 
           this.syariahCertificationDate <= new Date();
  }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    legacyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'For migration from existing system'
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Multi-factor authentication
    mfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mfaSecret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    
    // Banking access control
    bankingAccess: {
      type: DataTypes.ENUM('CONVENTIONAL', 'SYARIAH', 'BOTH'),
      defaultValue: 'CONVENTIONAL'
    },
    
    // Syariah-specific fields
    syariahCertified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    syariahCertificationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    syariahCertificationLevel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    // Session management
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentSessionId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    
    // Security
    forcePasswordChange: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    passwordHistory: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    
    // Tenant isolation
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    
    // Audit fields
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    schema: 'core',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['tenantId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['legacyId']
      },
      {
        fields: ['bankingAccess']
      },
      {
        fields: ['syariahCertified']
      },
      {
        unique: true,
        fields: ['tenantId', 'email'],
        name: 'unique_tenant_email'
      }
    ],
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      syariahCertified: {
        where: {
          syariahCertified: true
        }
      },
      byTenant: (tenantId: string) => ({
        where: {
          tenantId
        }
      }),
      byBankingAccess: (bankingType: string) => ({
        where: {
          bankingAccess: [bankingType, 'BOTH']
        }
      })
    }
  }
);

export default User;
EOF

    log_success "User Model generated successfully"
}

# Generate authentication routes
generate_auth_routes() {
    log_info "Generating Authentication Routes..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/routes/auth.routes.ts" << 'EOF'
// packages/backend/src/api/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { SecurityMiddleware } from '../middleware/security.middleware';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';

export function createAuthRoutes(
  authController: AuthController,
  authMiddleware: AuthMiddleware,
  validationMiddleware: ValidationMiddleware,
  securityMiddleware: SecurityMiddleware,
  rateLimitMiddleware: RateLimitMiddleware
): Router {
  const router = Router();

  // Apply security middleware to all auth routes
  router.use(securityMiddleware.security());
  
  // Auth endpoints with rate limiting
  router.post('/login', 
    rateLimitMiddleware.authLimit(),
    validationMiddleware.validateRequest(),
    authController.login.bind(authController)
  );
  
  router.post('/refresh',
    rateLimitMiddleware.tokenLimit(),
    validationMiddleware.validateRequest(),
    authController.refresh.bind(authController)
  );
  
  router.post('/logout',
    authMiddleware.optionalAuth(),
    authController.logout.bind(authController)
  );
  
  // Protected routes requiring authentication
  router.get('/me',
    authMiddleware.authenticate(),
    authController.me.bind(authController)
  );
  
  // Health check endpoint (public)
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Authentication service is healthy',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

export default createAuthRoutes;
EOF

    log_success "Authentication Routes generated successfully"
}

# Generate setup test script
generate_test_script() {
    log_info "Generating authentication test script..."
    
    cat > "${PROJECT_ROOT}/scripts/setup/test-auth-system.sh" << 'TESTEOF'
#!/bin/bash
# scripts/setup/test-auth-system.sh
# Test script for authentication system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Configuration
BACKEND_URL="http://localhost:4232"
TEST_TENANT="demo-conventional"
TEST_EMAIL="admin@demo-conventional.com"
TEST_PASSWORD="admin123"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Test health endpoint
test_health() {
    log_info "Testing health endpoint..."
    
    response=$(curl -s -w "%{http_code}" "${BACKEND_URL}/api/v1/auth/health" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "Health endpoint is working"
    else
        log_error "Health endpoint failed: $response"
        return 1
    fi
}

# Test login endpoint
test_login() {
    log_info "Testing login endpoint..."
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\",
            \"tenantSlug\": \"${TEST_TENANT}\"
        }" \
        "${BACKEND_URL}/api/v1/auth/login" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "Login endpoint is working"
        # Extract access token for further tests
        ACCESS_TOKEN=$(echo "$response" | jq -r '.data.tokens.accessToken' 2>/dev/null || echo "")
        export ACCESS_TOKEN
    else
        log_error "Login endpoint failed: $response"
        return 1
    fi
}

# Test me endpoint (requires authentication)
test_me() {
    if [[ -z "$ACCESS_TOKEN" ]]; then
        log_error "No access token available for /me test"
        return 1
    fi
    
    log_info "Testing /me endpoint..."
    
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        "${BACKEND_URL}/api/v1/auth/me" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "/me endpoint is working"
    else
        log_error "/me endpoint failed: $response"
        return 1
    fi
}

# Test logout endpoint
test_logout() {
    if [[ -z "$ACCESS_TOKEN" ]]; then
        log_error "No access token available for logout test"
        return 1
    fi
    
    log_info "Testing logout endpoint..."
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        "${BACKEND_URL}/api/v1/auth/logout" || echo "000")
    
    if [[ "$response" == *"200" ]]; then
        log_success "Logout endpoint is working"
    else
        log_error "Logout endpoint failed: $response"
        return 1
    fi
}

# Main test function
main() {
    log_info "Starting authentication system tests..."
    
    # Check if backend is running
    if ! curl -s "${BACKEND_URL}/health" >/dev/null 2>&1; then
        log_error "Backend server is not running at ${BACKEND_URL}"
        exit 1
    fi
    
    # Run tests
    test_health || exit 1
    test_login || exit 1
    test_me || exit 1
    test_logout || exit 1
    
    log_success "All authentication tests passed!"
}

main "$@"
TESTEOF

    chmod +x "${PROJECT_ROOT}/scripts/setup/test-auth-system.sh"
    log_success "Authentication test script generated successfully"
}

# Install authentication dependencies
install_auth_dependencies() {
    log_info "Installing authentication dependencies..."
    
    cd "${PROJECT_ROOT}/packages/backend"
    
    # JWT and crypto dependencies
    pnpm add jsonwebtoken bcrypt uuid
    pnpm add -D @types/jsonwebtoken @types/bcrypt @types/uuid
    
    # Authentication middleware dependencies
    pnpm add express-rate-limit helmet cors compression
    pnpm add -D @types/cors
    
    # Validation
    pnpm add zod
    
    # MFA support
    pnpm add speakeasy qrcode
    pnpm add -D @types/speakeasy @types/qrcode
    
    log_success "Authentication dependencies installed successfully"
}

# Main function
main() {
    log_info "Starting Day 1 Hour 3: Advanced RBAC Authentication System setup..."
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp}
    
    # Validate environment
    validate_environment
    
    # Create authentication directory structure
    create_auth_directories
    
    # Install dependencies
    install_auth_dependencies
    
    # Generate authentication system files
    generate_jwt_service
    generate_rbac_service
    generate_auth_controller
    generate_auth_middleware
    generate_user_model
    generate_auth_routes
    generate_test_script
    
    log_success "Authentication system setup completed successfully!"
    log_info "Next steps:"
    log_info "1. Start the backend server: cd packages/backend && pnpm run dev"
    log_info "2. Test the authentication endpoints: ./scripts/setup/test-auth-system.sh"
    log_info "3. Continue with Day 1 Hour 4: Configuration Management"
}

# Execute main function with all arguments
main "$@"