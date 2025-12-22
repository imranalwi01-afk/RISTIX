// packages/backend/src/core/services/user/user.service.ts
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import { User, Role, UserRole } from '../../models';
import { AuditService } from '../audit/audit.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { RedisService } from '../redis/redis.service';
import { Op } from 'sequelize';

export interface CreateUserInput {
  email: string;
  username: string;
  fullName: string;
  password: string;
  employeeId?: string;
  department?: string;
  position?: string;
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  syariahCertified?: boolean;
  syariahCertificationLevel?: string;
  tenantId: string;
  roleIds?: string[];
  createdBy?: string;
}

export interface UpdateUserInput {
  email?: string;
  username?: string;
  fullName?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  syariahCertified?: boolean;
  syariahCertificationLevel?: string;
  isActive?: boolean;
  updatedBy?: string;
}

export interface UserLoginInfo {
  lastLoginAt: Date;
  loginCount: number;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  bankingAccess?: string;
  isActive?: boolean;
  department?: string;
  syariahCertified?: boolean;
  includeRoles?: boolean;
}

export class UserService {
  constructor(
    private readonly auditService: AuditService,
    private readonly configService: ConfigurationService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: input.email },
            { username: input.username }
          ],
          tenantId: input.tenantId
        }
      });

      if (existingUser) {
        throw new Error(`User with email ${input.email} or username ${input.username} already exists`);
      }

      // Hash password
      const saltRounds = await this.configService.get<number>('security.bcrypt.saltRounds', input.tenantId, 12);
      const passwordHash = await bcrypt.hash(input.password, saltRounds);

      // Create user
      const user = await User.create({
        email: input.email,
        username: input.username,
        fullName: input.fullName,
        passwordHash,
        employeeId: input.employeeId,
        department: input.department,
        position: input.position,
        bankingAccess: input.bankingAccess,
        syariahCertified: input.syariahCertified || false,
        syariahCertificationLevel: input.syariahCertificationLevel,
        tenantId: input.tenantId,
        createdBy: input.createdBy,
        isActive: true,
        mfaEnabled: false,
        loginCount: 0,
        failedLoginAttempts: 0,
        forcePasswordChange: true, // Force password change on first login
        passwordChangedAt: new Date()
      });

      // Assign roles if provided
      if (input.roleIds && input.roleIds.length > 0) {
        await this.assignRolesToUser(user.id, input.roleIds, input.tenantId, input.createdBy);
      }

      // Audit user creation
      await this.auditService.log({
        userId: input.createdBy,
        tenantId: input.tenantId,
        eventType: 'USER_MANAGEMENT',
        action: 'USER_CREATED',
        description: `User created: ${input.email}`,
        entityType: 'User',
        entityId: user.id,
        entityName: input.fullName,
        newValues: {
          email: input.email,
          username: input.username,
          fullName: input.fullName,
          bankingAccess: input.bankingAccess,
          department: input.department
        },
        metadata: {
          roleIds: input.roleIds,
          syariahCertified: input.syariahCertified
        }
      });

      return user;

    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  /**
   * Get user by ID
   */
  async getById(userId: string, includeRoles: boolean = false): Promise<User | null> {
    try {
      const include = includeRoles ? [
        {
          model: Role,
          as: 'roles',
          through: {
            where: { isActive: true },
            attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
          },
          where: { isActive: true }
        }
      ] : undefined;

      return await User.findByPk(userId, { include });

    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error}`);
    }
  }

  /**
   * Get user by email and tenant
   */
  async getByEmailAndTenant(email: string, tenantId: string): Promise<User | null> {
    try {
      return await User.findOne({
        where: {
          email,
          tenantId,
          isActive: true
        },
        include: [
          {
            model: Role,
            as: 'roles',
            through: {
              where: { isActive: true },
              attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
            },
            where: { isActive: true }
          }
        ]
      });

    } catch (error) {
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Store old values for audit
      const oldValues = {
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bankingAccess: user.bankingAccess,
        department: user.department,
        isActive: user.isActive
      };

      // Update user
      await user.update({
        ...input,
        updatedBy: input.updatedBy
      });

      // Audit user update
      await this.auditService.log({
        userId: input.updatedBy,
        tenantId: user.tenantId,
        eventType: 'USER_MANAGEMENT',
        action: 'USER_UPDATED',
        description: `User updated: ${user.email}`,
        entityType: 'User',
        entityId: user.id,
        entityName: user.fullName,
        oldValues,
        newValues: input,
        changedFields: Object.keys(input)
      });

      return user;

    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password strength
      await this.validatePasswordStrength(newPassword);

      // Check password history to prevent reuse
      await this.checkPasswordHistory(user, newPassword);

      // Hash new password
      const saltRounds = await this.configService.get<number>('security.bcrypt.saltRounds', user.tenantId, 12);
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and history
      const passwordHistory = user.passwordHistory || [];
      passwordHistory.push(user.passwordHash);
      
      // Keep only last 5 passwords
      if (passwordHistory.length > 5) {
        passwordHistory.shift();
      }

      await user.update({
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        forcePasswordChange: false,
        passwordHistory,
        failedLoginAttempts: 0,
        lockedUntil: null
      });

      // Audit password change
      await this.auditService.log({
        userId,
        tenantId: user.tenantId,
        eventType: 'SECURITY',
        action: 'PASSWORD_CHANGED',
        description: 'User password changed',
        entityType: 'User',
        entityId: userId,
        entityName: user.fullName
      });

    } catch (error) {
      throw new Error(`Failed to change password: ${error}`);
    }
  }

  /**
   * Reset user password (admin action)
   */
  async resetPassword(userId: string, newPassword: string, adminUserId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate new password strength
      await this.validatePasswordStrength(newPassword);

      // Hash new password
      const saltRounds = await this.configService.get<number>('security.bcrypt.saltRounds', user.tenantId, 12);
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await user.update({
        passwordHash,
        passwordChangedAt: new Date(),
        forcePasswordChange: true, // Force user to change password on next login
        failedLoginAttempts: 0,
        lockedUntil: null
      });

      // Audit password reset
      await this.auditService.log({
        userId: adminUserId,
        tenantId: user.tenantId,
        eventType: 'SECURITY',
        action: 'PASSWORD_RESET',
        description: `Password reset for user: ${user.email}`,
        entityType: 'User',
        entityId: userId,
        entityName: user.fullName
      });

    } catch (error) {
      throw new Error(`Failed to reset password: ${error}`);
    }
  }

  /**
   * Enable/Setup MFA for user
   */
  async setupMfa(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate MFA secret
      const secret = speakeasy.generateSecret({
        name: `IFRS9 Platform (${user.email})`,
        issuer: 'IFRS9 Platform',
        length: 32
      });

      // Store secret (encrypted)
      await user.update({
        mfaSecret: secret.base32
      });

      // Audit MFA setup
      await this.auditService.log({
        userId,
        tenantId: user.tenantId,
        eventType: 'SECURITY',
        action: 'MFA_SETUP_INITIATED',
        description: 'MFA setup initiated',
        entityType: 'User',
        entityId: userId,
        entityName: user.fullName
      });

      return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url || ''
      };

    } catch (error) {
      throw new Error(`Failed to setup MFA: ${error}`);
    }
  }

  /**
   * Verify MFA code and enable MFA
   */
  async verifyAndEnableMfa(userId: string, token: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.mfaSecret) {
        throw new Error('User not found or MFA not initiated');
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time steps before/after current time
      });

      if (!verified) {
        throw new Error('Invalid MFA token');
      }

      // Enable MFA
      await user.update({
        mfaEnabled: true
      });

      // Audit MFA enabled
      await this.auditService.log({
        userId,
        tenantId: user.tenantId,
        eventType: 'SECURITY',
        action: 'MFA_ENABLED',
        description: 'MFA enabled for user',
        entityType: 'User',
        entityId: userId,
        entityName: user.fullName
      });

    } catch (error) {
      throw new Error(`Failed to verify and enable MFA: ${error}`);
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMfaCode(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.mfaSecret || !user.mfaEnabled) {
        return false;
      }

      return speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token,
        window: 2
      });

    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  /**
   * Update login information
   */
  async updateLoginInfo(userId: string, loginInfo: UserLoginInfo): Promise<void> {
    try {
      await User.update(loginInfo, {
        where: { id: userId }
      });

    } catch (error) {
      throw new Error(`Failed to update login info: ${error}`);
    }
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) return;

      await user.incrementFailedAttempts();

    } catch (error) {
      console.error('Failed to increment failed login attempts:', error);
    }
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId: string, roleIds: string[], tenantId: string, assignedBy?: string): Promise<void> {
    try {
      // Validate roles exist and are active
      const roles = await Role.findAll({
        where: {
          id: roleIds,
          isActive: true,
          [Op.or]: [
            { tenantId },
            { tenantId: null } // System roles
          ]
        }
      });

      if (roles.length !== roleIds.length) {
        throw new Error('One or more roles not found or inactive');
      }

      // Create user role assignments
      const userRoles = roleIds.map(roleId => ({
        userId,
        roleId,
        tenantId,
        assignedBy,
        isActive: true
      }));

      await UserRole.bulkCreate(userRoles, {
        updateOnDuplicate: ['assignedBy', 'assignedAt', 'isActive']
      });

      // Audit role assignment
      await this.auditService.log({
        userId: assignedBy,
        tenantId,
        eventType: 'USER_MANAGEMENT',
        action: 'ROLES_ASSIGNED',
        description: `Roles assigned to user`,
        entityType: 'User',
        entityId: userId,
        metadata: {
          roleIds,
          roleNames: roles.map(r => r.roleName)
        }
      });

    } catch (error) {
      throw new Error(`Failed to assign roles: ${error}`);
    }
  }

  /**
   * Get users with pagination and filtering
   */
  async getUsers(tenantId: string, options: UserQueryOptions = {}): Promise<{ users: User[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        bankingAccess,
        isActive,
        department,
        syariahCertified,
        includeRoles = false
      } = options;

      const offset = (page - 1) * limit;
      
      // Build where clause
      const where: any = { tenantId };
      
      if (search) {
        where[Op.or] = [
          { fullName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (bankingAccess) where.bankingAccess = bankingAccess;
      if (typeof isActive === 'boolean') where.isActive = isActive;
      if (department) where.department = department;
      if (typeof syariahCertified === 'boolean') where.syariahCertified = syariahCertified;

      const include = includeRoles ? [
        {
          model: Role,
          as: 'roles',
          through: {
            where: { isActive: true },
            attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
          },
          where: { isActive: true }
        }
      ] : undefined;

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [['fullName', 'ASC']],
        distinct: true
      });

      return { users, total };

    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }

  // Private helper methods
  private async validatePasswordStrength(password: string): Promise<void> {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  private async checkPasswordHistory(user: User, newPassword: string): Promise<void> {
    if (!user.passwordHistory) return;

    for (const oldPasswordHash of user.passwordHistory) {
      const isSamePassword = await bcrypt.compare(newPassword, oldPasswordHash);
      if (isSamePassword) {
        throw new Error('Cannot reuse previous passwords');
      }
    }
  }
}
