// packages/backend/src/api/controllers/role-management.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

/**
 * Role Management Controller
 * Handles CRUD operations for roles and permissions with proper tenant isolation
 * Uses real database connections - NO MOCK DATA
 */

interface TenantContext {
  id: string;
  slug: string;
  database: Pool;
  bankingType: 'conventional' | 'syariah' | 'dual';
}

interface Role {
  id: string;
  role_name: string;
  role_code: string;
  description?: string;
  permissions: Record<string, any>;
  is_system_role: boolean;
  is_active: boolean;
  tenant_id: string;
  created_at: Date;
  updated_at?: Date;
  assigned_users_count?: number;
}

interface Permission {
  id: string;
  module: string;
  resource: string;
  action: string;
  display_name: string;
  description: string;
  category: 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requires_approval: boolean;
  banking_specific: boolean;
  syariah_required?: boolean;
}

interface RoleFilters {
  type?: string;
  level?: string;
  banking_access?: string;
  is_active?: boolean;
  search_term?: string;
  page?: number;
  limit?: number;
}

export class RoleManagementController {
  
  /**
   * GET /api/v1/roles
   * Fetch all roles for the current tenant with filtering and pagination
   */
  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('🔍 DEBUG: Request tenant object:', req.tenant);
      const tenantContext = req.tenant as TenantContext;

      // 🔓 BYPASS FOR PLATFORM ADMINS - Admin and superadmin can access everywhere!
      // Check if user is authenticated and has platform admin roles
      if (req.user && req.user.roles) {
        const userRoles = req.user.roles;

        // Platform admins can bypass tenant context requirements
        if (userRoles.includes('PLATFORM_SUPER_ADMIN') ||
            userRoles.includes('PLATFORM_ADMIN') ||
            userRoles.includes('ADMIN') ||
            userRoles.includes('SUPER_ADMIN')) {
          console.log(`🔓 Platform admin bypass in getRoles: User ${userRoles} fetching all platform roles`);

          // Return platform-wide roles for platform admins
          const platformRoles = await this.getPlatformRoles();
          return res.json({
            success: true,
            data: platformRoles,
            message: 'Platform roles retrieved successfully',
            pagination: {
              page: 1,
              limit: platformRoles.length,
              total: platformRoles.length,
              totalPages: 1
            }
          });
        }
      }

      if (!tenantContext) {
        console.log('❌ DEBUG: No tenant context found');
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      console.log('🔍 DEBUG: Tenant context:', {
        id: tenantContext.id,
        slug: tenantContext.slug,
        hasDatabaseProperty: !!tenantContext.database,
        databaseType: typeof tenantContext.database
      });

      const filters = this.parseFilters(req.query);
      const { whereClause, queryParams } = this.buildRoleWhereClause(filters);
      
      // Get roles with user counts from real database (FIXED: match actual database schema)
      const rolesQuery = `
        SELECT 
          r.id,
          r.role_name,
          r.role_code,
          r.description,
          r.permissions,
          r.is_system_role,
          r.is_active,
          r.tenant_id,
          r.created_at,
          r.updated_at,
          COUNT(ur.user_id) as assigned_users_count
        FROM core.roles r
        LEFT JOIN core.user_roles ur ON r.id = ur.role_id
        ${whereClause}
        GROUP BY r.id, r.role_name, r.role_code, r.description, r.permissions, 
                 r.is_system_role, r.is_active, r.tenant_id, r.created_at, r.updated_at
        ORDER BY r.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const countQuery = `
        SELECT COUNT(DISTINCT r.id) as total
        FROM core.roles r
        LEFT JOIN core.user_roles ur ON r.id = ur.role_id
        ${whereClause}
      `;

      const limit = filters.limit || 25;
      const offset = ((filters.page || 1) - 1) * limit;

      console.log('🔍 DEBUG: About to execute database query');
      console.log('🔍 DEBUG: Database object exists?', !!tenantContext.database);
      console.log('🔍 DEBUG: Database has query method?', !!tenantContext.database?.query);

      // Execute queries
      console.log('🔍 DEBUG: Executing roles query...');
      const [rolesResult, countResult] = await Promise.all([
        tenantContext.database.query(rolesQuery, [...queryParams, limit, offset]),
        tenantContext.database.query(countQuery, queryParams)
      ]);

      const roles = rolesResult.rows;
      const total = parseInt(countResult.rows[0]?.total || '0');

      // Transform roles for frontend
      const transformedRoles = roles.map(role => ({
        id: role.id,
        name: role.role_name,
        displayName: this.formatDisplayName(role.role_name),
        description: role.description || '',
        type: this.determineRoleType(role.role_name),
        level: this.determineRoleLevel(role.role_name),
        bankingAccess: tenantContext.bankingType,
        isActive: role.is_active,
        isBuiltIn: this.isBuiltInRole(role.role_name),
        permissions: this.parsePermissions(role.permissions),
        islamicPermissions: role.islamic_banking_permissions || {},
        assignedUsers: parseInt(role.assigned_users_count || '0'),
        createdBy: 'system', // TODO: Get from audit log
        createdAt: role.created_at,
        updatedAt: role.updated_at
      }));

      return res.json({
        success: true,
        data: transformedRoles,
        pagination: {
          page: filters.page || 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          bankingType: tenantContext.bankingType,
          filtersApplied: Object.keys(filters).length > 0
        }
      });

    } catch (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch roles',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/v1/roles
   * Create a new role with proper validation
   */
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const tenantContext = req.tenant as TenantContext;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const {
        name,
        displayName,
        description,
        type,
        level,
        bankingAccess,
        isActive = true
      } = req.body;

      // Validate role name is unique
      const existingRoleQuery = 'SELECT id FROM core.roles WHERE role_name = $1';
      const existingRole = await tenantContext.database.query(existingRoleQuery, [name]);

      if (existingRole.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Role name already exists'
        });
      }

      // Create role in database
      const roleId = uuidv4();
      const insertQuery = `
        INSERT INTO core.roles (
          id, role_name, role_code, description, permissions, is_active, tenant_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;

      const permissions = {}; // Initialize with empty permissions
      const roleCode = name.toUpperCase().replace(/\s+/g, '_'); // Generate role code
      const result = await tenantContext.database.query(insertQuery, [
        roleId,
        name,
        roleCode,
        description,
        JSON.stringify(permissions),
        isActive,
        tenantContext.slug
      ]);

      const newRole = result.rows[0];

      // Transform for response
      const transformedRole = {
        id: newRole.id,
        name: newRole.role_name,
        displayName: displayName || this.formatDisplayName(newRole.role_name),
        description: newRole.description,
        type: type || this.determineRoleType(newRole.role_name),
        level: level || this.determineRoleLevel(newRole.role_name),
        bankingAccess: tenantContext.bankingType,
        isActive: newRole.is_active,
        isBuiltIn: false,
        permissions: [],
        assignedUsers: 0,
        createdBy: req.user?.id || 'system',
        createdAt: newRole.created_at,
        updatedAt: newRole.updated_at
      };

      return res.status(201).json({
        success: true,
        data: transformedRole,
        message: 'Role created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          createdBy: req.user?.id || 'system'
        }
      });

    } catch (error) {
      console.error('Error creating role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create role',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/v1/roles/:roleId
   * Update an existing role
   */
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const tenantContext = req.tenant as TenantContext;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const { roleId } = req.params;
      const {
        name,
        displayName,
        description,
        bankingAccess,
        isActive
      } = req.body;

      // Check if role exists and is not built-in
      const roleQuery = 'SELECT * FROM core.roles WHERE id = $1';
      const roleResult = await tenantContext.database.query(roleQuery, [roleId]);

      if (roleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }

      const existingRole = roleResult.rows[0];
      if (this.isBuiltInRole(existingRole.role_name)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify built-in role'
        });
      }

      // Check for name conflicts if changing name
      if (name && name !== existingRole.role_name) {
        const conflictQuery = 'SELECT id FROM core.roles WHERE role_name = $1 AND id != $2';
        const conflict = await tenantContext.database.query(conflictQuery, [name, roleId]);
        
        if (conflict.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Role name already exists'
          });
        }
      }

      // Update role
      const updateQuery = `
        UPDATE core.roles 
        SET role_name = COALESCE($1, role_name),
            description = COALESCE($2, description),
            role_code = COALESCE($3, role_code),
            is_active = COALESCE($4, is_active),
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;

      const updateResult = await tenantContext.database.query(updateQuery, [
        name || null,
        description || null,
        bankingAccess || null,
        isActive !== undefined ? isActive : null,
        roleId
      ]);

      const updatedRole = updateResult.rows[0];

      // Transform for response
      const transformedRole = {
        id: updatedRole.id,
        name: updatedRole.role_name,
        displayName: displayName || this.formatDisplayName(updatedRole.role_name),
        description: updatedRole.description,
        type: this.determineRoleType(updatedRole.role_name),
        level: this.determineRoleLevel(updatedRole.role_name),
        bankingAccess: updatedRole.role_code,
        isActive: updatedRole.is_active,
        isBuiltIn: this.isBuiltInRole(updatedRole.role_name),
        permissions: this.parsePermissions(updatedRole.permissions),
        createdAt: updatedRole.created_at,
        updatedAt: updatedRole.updated_at
      };

      return res.json({
        success: true,
        data: transformedRole,
        message: 'Role updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          updatedBy: req.user?.id || 'system'
        }
      });

    } catch (error) {
      console.error('Error updating role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update role',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/v1/roles/:roleId
   * Soft delete a role (set is_active = false)
   */
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant as TenantContext;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const { roleId } = req.params;

      // Check if role exists and is not built-in
      const roleQuery = 'SELECT * FROM core.roles WHERE id = $1';
      const roleResult = await tenantContext.database.query(roleQuery, [roleId]);

      if (roleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }

      const role = roleResult.rows[0];
      if (this.isBuiltInRole(role.role_name)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete built-in role'
        });
      }

      // Check if role has assigned users
      const userCountQuery = 'SELECT COUNT(*) as count FROM core.user_roles WHERE role_id = $1';
      const userCount = await tenantContext.database.query(userCountQuery, [roleId]);
      
      if (parseInt(userCount.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete role with assigned users. Remove user assignments first.'
        });
      }

      // Soft delete by setting is_active = false
      const deleteQuery = 'UPDATE core.roles SET is_active = false, updated_at = NOW() WHERE id = $1';
      await tenantContext.database.query(deleteQuery, [roleId]);

      return res.json({
        success: true,
        message: 'Role deleted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          deletedBy: req.user?.id || 'system'
        }
      });

    } catch (error) {
      console.error('Error deleting role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete role',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/v1/permissions
   * Get all available permissions for the current tenant
   */
  async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant as TenantContext;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      // Define permissions based on tenant type and banking mode
      const permissions = this.getPermissionsForTenant(tenantContext.bankingType);
      
      // Group by category
      const categories = this.groupPermissionsByCategory(permissions);

      return res.json({
        success: true,
        data: permissions,
        categories,
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          bankingType: tenantContext.bankingType,
          totalPermissions: permissions.length,
          totalCategories: categories.length
        }
      });

    } catch (error) {
      console.error('Error fetching permissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/v1/roles/:roleId/permissions
   * Update role permissions
   */
  async updateRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantContext = req.tenant as TenantContext;
      if (!tenantContext) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required'
        });
      }

      const { roleId } = req.params;
      const { permissions } = req.body;

      // Validate role exists
      const roleQuery = 'SELECT * FROM core.roles WHERE id = $1';
      const roleResult = await tenantContext.database.query(roleQuery, [roleId]);

      if (roleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }

      // Update permissions
      const updateQuery = `
        UPDATE core.roles 
        SET permissions = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await tenantContext.database.query(updateQuery, [
        JSON.stringify(permissions),
        roleId
      ]);

      return res.json({
        success: true,
        data: {
          roleId,
          permissions: JSON.parse(result.rows[0].permissions)
        },
        message: 'Role permissions updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: tenantContext.id,
          updatedBy: req.user?.id || 'system'
        }
      });

    } catch (error) {
      console.error('Error updating role permissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update role permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods
  private parseFilters(query: any): RoleFilters {
    return {
      type: query.type || undefined,
      level: query.level || undefined,
      banking_access: query.bankingAccess || undefined,
      is_active: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      search_term: query.search || query.searchTerm || undefined,
      page: parseInt(query.page) || 1,
      limit: Math.min(parseInt(query.limit) || 25, 100) // Max 100
    };
  }

  private buildRoleWhereClause(filters: RoleFilters): { whereClause: string; queryParams: any[] } {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.is_active !== undefined) {
      conditions.push(`r.is_active = $${paramIndex}`);
      params.push(filters.is_active);
      paramIndex++;
    }

    if (filters.banking_access) {
      conditions.push(`r.role_code = $${paramIndex}`);
      params.push(filters.banking_access);
      paramIndex++;
    }

    if (filters.search_term) {
      conditions.push(`(r.role_name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
      params.push(`%${filters.search_term}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, queryParams: params };
  }

  private formatDisplayName(roleName: string): string {
    return roleName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private determineRoleType(roleName: string): string {
    if (roleName.includes('PLATFORM') || roleName.includes('ADMIN')) return 'SYSTEM';
    if (roleName.includes('BANK') || roleName.includes('IFRS') || roleName.includes('SYARIAH')) return 'BANKING';
    return 'CUSTOM';
  }

  private determineRoleLevel(roleName: string): string {
    if (roleName.includes('PLATFORM')) return 'PLATFORM';
    if (roleName.includes('CRO') || roleName.includes('MANAGER')) return 'TENANT';
    return 'DEPARTMENT';
  }

  private determineBankingAccess(bankingTypeSpecific?: string, tenantType?: string): string {
    if (bankingTypeSpecific) return bankingTypeSpecific.toUpperCase();
    if (tenantType === 'syariah') return 'SYARIAH';
    if (tenantType === 'dual') return 'BOTH';
    return 'CONVENTIONAL';
  }

  private isBuiltInRole(roleName: string): boolean {
    const builtInRoles = [
      'PLATFORM_SUPER_ADMIN',
      'BANK_CRO',
      'IFRS9_MANAGER',
      'SYARIAH_COMPLIANCE_OFFICER',
      'DPS_BOARD_MEMBER'
    ];
    return builtInRoles.includes(roleName);
  }

  private parsePermissions(permissionsJson: any): Permission[] {
    try {
      if (typeof permissionsJson === 'string') {
        return JSON.parse(permissionsJson);
      }
      return Array.isArray(permissionsJson) ? permissionsJson : [];
    } catch {
      return [];
    }
  }

  private getPermissionsForTenant(bankingType: string): Permission[] {
    const basePermissions: Permission[] = [
      // Core permissions
      {
        id: 'perm-core-001',
        module: 'dashboard',
        resource: 'overview',
        action: 'read',
        display_name: 'View Dashboard',
        description: 'Access to main dashboard',
        category: 'CORE',
        risk_level: 'LOW',
        requires_approval: false,
        banking_specific: false
      },
      // Banking permissions
      {
        id: 'perm-banking-001',
        module: 'portfolio',
        resource: 'accounts',
        action: 'read',
        display_name: 'View Portfolio Accounts',
        description: 'View portfolio account information',
        category: 'BANKING',
        risk_level: 'LOW',
        requires_approval: false,
        banking_specific: true
      },
      {
        id: 'perm-banking-002',
        module: 'portfolio',
        resource: 'accounts',
        action: 'write',
        display_name: 'Modify Portfolio Accounts',
        description: 'Create and modify portfolio accounts',
        category: 'BANKING',
        risk_level: 'HIGH',
        requires_approval: true,
        banking_specific: true
      },
      // IFRS9 permissions
      {
        id: 'perm-ifrs9-001',
        module: 'ifrs9',
        resource: 'calculations',
        action: 'execute',
        display_name: 'Execute IFRS9 Calculations',
        description: 'Run ECL calculations and staging',
        category: 'IFRS9',
        risk_level: 'CRITICAL',
        requires_approval: true,
        banking_specific: true
      },
      {
        id: 'perm-ifrs9-002',
        module: 'ifrs9',
        resource: 'parameters',
        action: 'write',
        display_name: 'Manage IFRS9 Parameters',
        description: 'Modify IFRS9 calculation parameters',
        category: 'IFRS9',
        risk_level: 'HIGH',
        requires_approval: true,
        banking_specific: true
      },
      // Admin permissions
      {
        id: 'perm-admin-001',
        module: 'users',
        resource: 'users',
        action: 'manage',
        display_name: 'Manage Users',
        description: 'Create, modify, and disable users',
        category: 'ADMIN',
        risk_level: 'CRITICAL',
        requires_approval: true,
        banking_specific: false
      },
      {
        id: 'perm-admin-002',
        module: 'roles',
        resource: 'roles',
        action: 'manage',
        display_name: 'Manage Roles',
        description: 'Create and modify user roles',
        category: 'ADMIN',
        risk_level: 'CRITICAL',
        requires_approval: true,
        banking_specific: false
      },
      // Reporting permissions
      {
        id: 'perm-report-001',
        module: 'reports',
        resource: 'regulatory',
        action: 'generate',
        display_name: 'Generate Regulatory Reports',
        description: 'Generate reports for regulatory submission',
        category: 'REPORTING',
        risk_level: 'MEDIUM',
        requires_approval: false,
        banking_specific: true
      }
    ];

    // Add Syariah-specific permissions if needed
    if (bankingType === 'syariah' || bankingType === 'dual') {
      basePermissions.push({
        id: 'perm-syariah-001',
        module: 'syariah',
        resource: 'compliance',
        action: 'validate',
        display_name: 'Validate Syariah Compliance',
        description: 'Validate Islamic banking compliance',
        category: 'BANKING',
        risk_level: 'HIGH',
        requires_approval: false,
        banking_specific: true,
        syariah_required: true
      });
    }

    return basePermissions;
  }

  private groupPermissionsByCategory(permissions: Permission[]): { name: string; displayName: string; permissions: Permission[] }[] {
    const categories: { [key: string]: Permission[] } = {};
    
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    
    return Object.keys(categories).map(category => ({
      name: category,
      displayName: category.replace('_', ' '),
      permissions: categories[category]
    }));
  }

  /**
   * Get platform-wide roles for platform administrators
   * 🔓 This method bypasses tenant restrictions and returns all platform roles
   */
  private async getPlatformRoles(): Promise<Role[]> {
    try {
      console.log('🔓 Fetching platform-wide roles for platform admin');

      // Platform-wide role definitions (admin can access everywhere!)
      const platformRoles: Role[] = [
        {
          id: 'platform-super-admin',
          role_name: 'Platform Super Administrator',
          role_code: 'PLATFORM_SUPER_ADMIN',
          description: 'Super administrator with full platform access',
          permissions: {
            all: true,
            users_read: true,
            users_create: true,
            users_update: true,
            users_delete: true,
            system_manage: true,
            platform_admin: true,
            tenant_management: true,
            banking_override: true,
            ifrs9_override: true
          },
          is_system_role: true,
          is_active: true,
          tenant_id: 'platform',
          created_at: new Date(),
          assigned_users_count: 1
        },
        {
          id: 'platform-admin',
          role_name: 'Platform Administrator',
          role_code: 'PLATFORM_ADMIN',
          description: 'Platform administrator with full access to all features',
          permissions: {
            all: true,
            users_read: true,
            users_create: true,
            users_update: true,
            users_delete: true,
            system_manage: true,
            platform_admin: true
          },
          is_system_role: true,
          is_active: true,
          tenant_id: 'platform',
          created_at: new Date(),
          assigned_users_count: 0
        },
        {
          id: 'bank-cro',
          role_name: 'Chief Risk Officer',
          role_code: 'BANK_CRO',
          description: 'Chief Risk Officer with full risk management access',
          permissions: {
            risk_management: true,
            portfolio_read: true,
            ifrs9_read: true,
            ifrs9_write: true,
            reporting_read: true,
            compliance_read: true
          },
          is_system_role: true,
          is_active: true,
          tenant_id: 'platform',
          created_at: new Date(),
          assigned_users_count: 0
        },
        {
          id: 'ifrs-manager',
          role_name: 'IFRS 9 Manager',
          role_code: 'IFRS9_MANAGER',
          description: 'IFRS 9 calculation and compliance manager',
          permissions: {
            ifrs9_read: true,
            ifrs9_write: true,
            ifrs9_calculate: true,
            ifrs9_approve: true,
            reporting_read: true,
            reporting_write: true
          },
          is_system_role: true,
          is_active: true,
          tenant_id: 'platform',
          created_at: new Date(),
          assigned_users_count: 0
        }
      ];

      console.log(`🔓 Returning ${platformRoles.length} platform roles`);
      return platformRoles;

    } catch (error) {
      console.error('❌ Error fetching platform roles:', error);
      // Return empty array instead of throwing to prevent breaking the API
      return [];
    }
  }
}

export const roleManagementController = new RoleManagementController();