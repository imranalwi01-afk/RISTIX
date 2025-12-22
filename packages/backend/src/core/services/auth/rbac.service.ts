// packages/backend/src/core/services/auth/rbac.service.ts
// ============================================================================
// 🛡️ ENHANCED RBAC SERVICE - Advanced Role-Based Access Control
// ============================================================================
// Based on TodoList-v2.md Hour 3 requirements and existing models
// ============================================================================

import { User, Role, UserRole } from '../../models';
import { Op } from 'sequelize';
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

      // ✅ ENHANCED: Immediate grant for IAF admin roles
      const userRoleCodes = user.roleCodes || [];
      const hasIafAdminRole = userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
                           userRoleCodes.includes('IAF_TENANT_ADMIN');

      if (hasIafAdminRole) {
        console.log(`✅ [RBAC] IAF admin access granted for user ${request.userId} with roleCodes: ${userRoleCodes.join(', ')}`);
        const result: PermissionCheckResult = {
          granted: true,
          reason: 'IAF admin full access granted',
          auditInfo: {
            timestamp: new Date(),
            ruleApplied: 'IAF_ADMIN_BYPASS',
            bankingCompliance: true
          }
        };

        // Audit the permission check
        await this.auditPermissionCheck(request, result, Date.now() - startTime);
        return result;
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

  private async getUserWithRoles(userId: string, tenantId: string): Promise<any | null> {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: UserRole,
          where: {
            tenantId,
            isActive: true,
            [Op.or]: [
              { validUntil: null },
              { validUntil: { [Op.gte]: new Date() } }
            ]
          },
          include: [{
            model: Role,
            where: { isActive: true }
          }]
        }]
      });

      if (!user) return null;

      // Access UserRoles association properly
      const userRoles = (user as any).UserRoles || [];

      // Transform to expected format
      const transformedUser: any = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId: user.tenantId,
        bankingAccess: user.bankingAccess,
        isActive: user.isActive,
        complianceLevel: user.syariahCertificationLevel,
        roles: userRoles.map((userRole: any) => ({
          id: userRole.Role.id,
          name: userRole.Role.roleName,
          description: userRole.Role.description,
          isSystemRole: userRole.Role.isSystemRole,
          bankingTypeSpecific: userRole.Role.bankingTypeSpecific,
          complianceLevel: userRole.Role.complianceLevel,
          hierarchyLevel: userRole.Role.hierarchyLevel,
          tenantId: userRole.Role.tenantId,
          permissions: this.transformPermissions(userRole.Role.permissions)
        }))
      };

      // ✅ ENHANCED: Check for IAF admin roles and grant full permissions
      const userRoleCodes = userRoles.map((userRole: any) => userRole.Role.role_code) || [];
      const hasIafAdminRole = userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
                           userRoleCodes.includes('IAF_TENANT_ADMIN');

      if (hasIafAdminRole) {
        console.log(`✅ [RBAC] IAF admin role detected for user ${userId}, granting full access`);

        // Add comprehensive permissions for IAF admin roles
        const adminPermissions = [
          '*',
          'full_admin_access',
          'users_read', 'users_create', 'users_update', 'users_delete',
          'roles_read', 'roles_create', 'roles_update', 'roles_delete',
          'permissions_read', 'permissions_create', 'permissions_update', 'permissions_delete',
          'tenants_read', 'tenants_create', 'tenants_update', 'tenants_delete',
          'system_manage', 'system_configure', 'system_monitor',
          'ifrs9_read', 'ifrs9_write', 'ifrs9_approve', 'ifrs9_execute',
          'portfolio_read', 'portfolio_write', 'portfolio_delete',
          'reports_read', 'reports_create', 'reports_generate', 'reports_delete',
          'audit_read', 'audit_create', 'audit_export',
          'etl_manage', 'data_upload', 'data_process', 'data_delete',
          'banking_all', 'conventional_all', 'syariah_all',
          'workflow_all', 'approval_all', 'configuration_all'
        ];

        // Add admin permissions to all IAF admin roles
        transformedUser.roles.forEach((role: any) => {
          if (userRoleCodes.includes('IAF_TENANT_SUPERADMIN') ||
              userRoleCodes.includes('IAF_TENANT_ADMIN')) {
            // Add all admin permissions
            adminPermissions.forEach(perm => {
              if (!role.permissions.find((p: Permission) => p.action === perm)) {
                role.permissions.push({
                  id: `admin_${perm}`,
                  name: `Admin ${perm}`,
                  resource: '*',
                  action: perm,
                  description: `Full admin access for ${perm}`,
                  bankingTypeRestriction: 'BOTH' as const
                });
              }
            });
          }
        });

        // Store role codes in user context for middleware access
        transformedUser.roleCodes = userRoleCodes;
      }

      return transformedUser;

    } catch (error) {
      console.error('Get user with roles error:', error);
      return null;
    }
  }

  private async getTenantBankingType(): Promise<'CONVENTIONAL' | 'SYARIAH' | 'DUAL'> {
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

  /**
   * Transform role permissions JSONB to Permission objects
   */
  private transformPermissions(permissions: Record<string, string[]>): Permission[] {
    const permissionList: Permission[] = [];
    
    for (const [resource, actions] of Object.entries(permissions)) {
      if (Array.isArray(actions)) {
        for (const action of actions) {
          permissionList.push({
            id: `${resource}:${action}`,
            name: `${resource}_${action}`.toUpperCase(),
            resource,
            action,
            description: `${action} permission for ${resource}`
          });
        }
      }
    }
    
    return permissionList;
  }

  /**
   * ✅ NEW: Assign role to user with full validation
   */
  async assignRoleToUser(params: {
    userId: string;
    roleId: string;
    tenantId: string;
    assignedBy: string;
    validUntil?: Date;
    bankingTypeRestriction?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    isTemporary?: boolean;
    temporaryReason?: string;
  }): Promise<{ success: boolean; userRole?: any; error?: string }> {
    try {
      // Validate user exists
      const user = await User.findByPk(params.userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Validate role exists
      const role = await Role.findByPk(params.roleId);
      if (!role) {
        return { success: false, error: 'Role not found' };
      }

      // Check if assignment already exists
      const existingAssignment = await UserRole.findOne({
        where: {
          userId: params.userId,
          roleId: params.roleId,
          tenantId: params.tenantId
        }
      });

      if (existingAssignment) {
        // Reactivate if inactive
        existingAssignment.isActive = true;
        existingAssignment.assignedBy = params.assignedBy;
        existingAssignment.assignedAt = new Date();
        existingAssignment.validUntil = params.validUntil;
        existingAssignment.bankingTypeRestriction = params.bankingTypeRestriction;
        existingAssignment.isTemporary = params.isTemporary || false;
        existingAssignment.temporaryReason = params.temporaryReason;
        
        await existingAssignment.save();
        
        return { success: true, userRole: existingAssignment };
      }

      // Create new assignment
      const userRole = await UserRole.create({
        userId: params.userId,
        roleId: params.roleId,
        tenantId: params.tenantId,
        assignedBy: params.assignedBy,
        validUntil: params.validUntil,
        bankingTypeRestriction: params.bankingTypeRestriction,
        isTemporary: params.isTemporary || false,
        temporaryReason: params.temporaryReason
      });

      // Invalidate user permissions cache
      await this.invalidateUserPermissionsCache(params.userId, params.tenantId);

      return { success: true, userRole };

    } catch (error) {
      console.error('Assign role to user error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * ✅ NEW: Revoke role from user
   */
  async revokeRoleFromUser(params: {
    userId: string;
    roleId: string;
    tenantId: string;
    revokedBy: string;
    reason?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const userRole = await UserRole.findOne({
        where: {
          userId: params.userId,
          roleId: params.roleId,
          tenantId: params.tenantId,
          isActive: true
        }
      });

      if (!userRole) {
        return { success: false, error: 'Role assignment not found' };
      }

      // Soft delete
      userRole.isActive = false;
      await userRole.save();

      // Invalidate user permissions cache
      await this.invalidateUserPermissionsCache(params.userId, params.tenantId);

      return { success: true };

    } catch (error) {
      console.error('Revoke role from user error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * ✅ NEW: Create custom role
   */
  async createCustomRole(params: {
    roleName: string;
    description?: string;
    permissions: Record<string, string[]>;
    bankingTypeSpecific?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    hierarchyLevel?: number;
    tenantId?: string;
    createdBy: string;
  }): Promise<{ success: boolean; role?: any; error?: string }> {
    try {
      // Check if role name exists
      const existingRole = await Role.findOne({
        where: {
          roleName: params.roleName,
          ...(params.tenantId && { tenantId: params.tenantId })
        }
      });

      if (existingRole) {
        return { success: false, error: 'Role name already exists' };
      }

      const role = await Role.create({
        roleName: params.roleName,
        description: params.description,
        permissions: params.permissions,
        bankingTypeSpecific: params.bankingTypeSpecific,
        hierarchyLevel: params.hierarchyLevel || 1,
        tenantId: params.tenantId,
        createdBy: params.createdBy,
        isSystemRole: false
      });

      return { success: true, role };

    } catch (error) {
      console.error('Create custom role error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * ✅ NEW: Get user's effective permissions with caching
   */
  async getEffectiveUserPermissions(userId: string, tenantId: string): Promise<{
    permissions: Permission[];
    roles: string[];
    bankingAccess: string;
    hierarchyLevel: number;
  }> {
    try {
      const cacheKey = `user_permissions:${userId}:${tenantId}`;
      
      // Try cache first
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const user = await this.getUserWithRoles(userId, tenantId);
      if (!user) {
        return {
          permissions: [],
          roles: [],
          bankingAccess: 'NONE',
          hierarchyLevel: 0
        };
      }

      // Aggregate permissions
      const allPermissions: Permission[] = [];
      const roleNames: string[] = [];
      let maxHierarchy = 0;

      for (const role of user.roles) {
        roleNames.push(role.name);
        allPermissions.push(...role.permissions);
        maxHierarchy = Math.max(maxHierarchy, role.hierarchyLevel);
      }

      // Remove duplicates
      const uniquePermissions = allPermissions.filter((perm, index, self) => 
        index === self.findIndex(p => p.resource === perm.resource && p.action === perm.action)
      );

      const result = {
        permissions: uniquePermissions,
        roles: roleNames,
        bankingAccess: user.bankingAccess,
        hierarchyLevel: maxHierarchy
      };

      // Cache for 5 minutes
      await this.redisService.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      return result;

    } catch (error) {
      console.error('Get effective user permissions error:', error);
      return {
        permissions: [],
        roles: [],
        bankingAccess: 'NONE',
        hierarchyLevel: 0
      };
    }
  }

  /**
   * ✅ NEW: Invalidate user permissions cache
   */
  private async invalidateUserPermissionsCache(userId: string, tenantId: string): Promise<void> {
    try {
      const cacheKey = `user_permissions:${userId}:${tenantId}`;
      await this.redisService.del(cacheKey);
    } catch (error) {
      console.error('Invalidate cache error:', error);
    }
  }

  /**
   * ✅ NEW: Bulk permission check for multiple resources
   */
  async bulkPermissionCheck(params: {
    userId: string;
    tenantId: string;
    checks: Array<{ resource: string; action: string }>;
    bankingType?: 'CONVENTIONAL' | 'SYARIAH';
  }): Promise<Record<string, boolean>> {
    try {
      const results: Record<string, boolean> = {};
      
      for (const check of params.checks) {
        const result = await this.checkPermission({
          userId: params.userId,
          tenantId: params.tenantId,
          resource: check.resource,
          action: check.action,
          bankingType: params.bankingType
        });
        
        results[`${check.resource}:${check.action}`] = result.granted;
      }
      
      return results;

    } catch (error) {
      console.error('Bulk permission check error:', error);
      return {};
    }
  }
}
