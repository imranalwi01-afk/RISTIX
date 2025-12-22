#!/bin/bash
# scripts/setup/d1h3-service-layer.sh
# IFRS9 Platform - Generate Service Layer Components for Authentication

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d1h3-services-$(date +%Y%m%d-%H%M%S).log"

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

# Create service directories
create_service_directories() {
    log_info "Creating service directories..."
    
    local backend_dir="${PROJECT_ROOT}/packages/backend"
    
    # Core services
    mkdir -p "${backend_dir}/src/core/services/user"
    mkdir -p "${backend_dir}/src/core/services/audit"
    mkdir -p "${backend_dir}/src/core/services/redis"
    mkdir -p "${backend_dir}/src/core/services/tenant"
    mkdir -p "${backend_dir}/src/core/services/notification"
    mkdir -p "${backend_dir}/src/core/services/validation"
    
    log_success "Service directories created"
}

# Generate User Service
generate_user_service() {
    log_info "Generating User Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/user/user.service.ts" << 'EOF'
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
EOF

    log_success "User Service generated successfully"
}

# Generate Audit Service
generate_audit_service() {
    log_info "Generating Audit Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/audit/audit.service.ts" << 'EOF'
// packages/backend/src/core/services/audit/audit.service.ts
import { AuditLog } from '../../models';
import { RedisService } from '../redis/redis.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogInput {
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  correlationId?: string;
  eventType: string;
  action: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  applicationName?: string;
  moduleName?: string;
  functionName?: string;
  businessDate?: Date;
  calculationDate?: Date;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  complianceCategory?: string;
  executionTimeMs?: number;
  metadata?: Record<string, any>;
}

export interface AuditQueryOptions {
  userId?: string;
  tenantId?: string;
  eventType?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  riskLevel?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  includeMetadata?: boolean;
}

export interface AuditSummary {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByRisk: Record<string, number>;
  topUsers: Array<{ userId: string; email: string; eventCount: number }>;
  recentHighRiskEvents: AuditLog[];
}

export class AuditService {
  private batchBuffer: AuditLogInput[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly batchSize = 100;
  private readonly batchTimeoutMs = 5000; // 5 seconds

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigurationService
  ) {
    this.startBatchProcessor();
  }

  /**
   * Log an audit event
   */
  async log(input: AuditLogInput): Promise<void> {
    try {
      // Add correlation ID if not provided
      if (!input.correlationId) {
        input.correlationId = uuidv4();
      }

      // Set default risk level
      if (!input.riskLevel) {
        input.riskLevel = this.calculateRiskLevel(input);
      }

      // Check if we should use batching
      const useBatching = await this.configService.get<boolean>('audit.useBatching', input.tenantId, true);
      
      if (useBatching && !this.isHighPriorityEvent(input)) {
        // Add to batch buffer
        this.batchBuffer.push(input);
        
        // Process batch if it's full
        if (this.batchBuffer.length >= this.batchSize) {
          await this.processBatch();
        }
      } else {
        // Log immediately for high priority events
        await this.logImmediate(input);
      }

      // Cache recent events for quick access
      await this.cacheRecentEvent(input);

    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log multiple events in batch
   */
  async logBatch(inputs: AuditLogInput[]): Promise<void> {
    try {
      const auditLogs = inputs.map(input => this.prepareAuditLog(input));
      
      await AuditLog.bulkCreate(auditLogs, {
        ignoreDuplicates: true
      });

      // Cache high priority events
      for (const input of inputs) {
        if (this.isHighPriorityEvent(input)) {
          await this.cacheRecentEvent(input);
        }
      }

    } catch (error) {
      console.error('Batch audit logging error:', error);
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(options: AuditQueryOptions = {}): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const {
        userId,
        tenantId,
        eventType,
        action,
        entityType,
        entityId,
        riskLevel,
        startDate,
        endDate,
        page = 1,
        limit = 50,
        includeMetadata = false
      } = options;

      const offset = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};
      
      if (userId) where.userId = userId;
      if (tenantId) where.tenantId = tenantId;
      if (eventType) where.eventType = eventType;
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;
      if (riskLevel) where.riskLevel = riskLevel;
      
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      // Define attributes to include
      const attributes = includeMetadata ? undefined : {
        exclude: ['oldValues', 'newValues', 'metadata']
      };

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where,
        attributes,
        limit,
        offset,
        order: [['timestamp', 'DESC']],
        include: includeMetadata ? [
          {
            model: require('../../models').User,
            as: 'user',
            attributes: ['id', 'email', 'fullName']
          }
        ] : undefined
      });

      return { logs, total };

    } catch (error) {
      throw new Error(`Failed to get audit logs: ${error}`);
    }
  }

  /**
   * Get audit trail for specific entity
   */
  async getEntityAuditTrail(entityType: string, entityId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      return await AuditLog.findAll({
        where: {
          entityType,
          entityId
        },
        include: [
          {
            model: require('../../models').User,
            as: 'user',
            attributes: ['id', 'email', 'fullName']
          }
        ],
        order: [['timestamp', 'DESC']],
        limit
      });

    } catch (error) {
      throw new Error(`Failed to get entity audit trail: ${error}`);
    }
  }

  /**
   * Get audit summary for dashboard
   */
  async getAuditSummary(tenantId?: string, days: number = 7): Promise<AuditSummary> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const where: any = {
        timestamp: {
          gte: startDate
        }
      };
      
      if (tenantId) {
        where.tenantId = tenantId;
      }

      // Get total events
      const totalEvents = await AuditLog.count({ where });

      // Get events by type
      const eventTypeResults = await AuditLog.findAll({
        where,
        attributes: [
          'eventType',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        group: ['eventType'],
        order: [[AuditLog.sequelize!.literal('count'), 'DESC']]
      });

      const eventsByType = eventTypeResults.reduce((acc: Record<string, number>, row: any) => {
        acc[row.eventType] = parseInt(row.get('count'));
        return acc;
      }, {});

      // Get events by risk level
      const riskLevelResults = await AuditLog.findAll({
        where,
        attributes: [
          'riskLevel',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        group: ['riskLevel'],
        order: [[AuditLog.sequelize!.literal('count'), 'DESC']]
      });

      const eventsByRisk = riskLevelResults.reduce((acc: Record<string, number>, row: any) => {
        acc[row.riskLevel] = parseInt(row.get('count'));
        return acc;
      }, {});

      // Get top users by activity
      const topUserResults = await AuditLog.findAll({
        where: {
          ...where,
          userId: { [require('sequelize').Op.ne]: null }
        },
        attributes: [
          'userId',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('AuditLog.id')), 'eventCount']
        ],
        include: [
          {
            model: require('../../models').User,
            as: 'user',
            attributes: ['email']
          }
        ],
        group: ['userId', 'user.id', 'user.email'],
        order: [[AuditLog.sequelize!.literal('eventCount'), 'DESC']],
        limit: 10
      });

      const topUsers = topUserResults.map((row: any) => ({
        userId: row.userId,
        email: row.user?.email || 'Unknown',
        eventCount: parseInt(row.get('eventCount'))
      }));

      // Get recent high risk events
      const recentHighRiskEvents = await AuditLog.findAll({
        where: {
          ...where,
          riskLevel: ['high', 'critical']
        },
        include: [
          {
            model: require('../../models').User,
            as: 'user',
            attributes: ['id', 'email', 'fullName']
          }
        ],
        order: [['timestamp', 'DESC']],
        limit: 20
      });

      return {
        totalEvents,
        eventsByType,
        eventsByRisk,
        topUsers,
        recentHighRiskEvents
      };

    } catch (error) {
      throw new Error(`Failed to get audit summary: ${error}`);
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    query: string, 
    tenantId?: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      const where: any = {
        [require('sequelize').Op.or]: [
          { description: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { action: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { eventType: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { entityName: { [require('sequelize').Op.iLike]: `%${query}%` } }
        ]
      };

      if (tenantId) {
        where.tenantId = tenantId;
      }

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where,
        include: [
          {
            model: require('../../models').User,
            as: 'user',
            attributes: ['id', 'email', 'fullName']
          }
        ],
        limit,
        offset,
        order: [['timestamp', 'DESC']]
      });

      return { logs, total };

    } catch (error) {
      throw new Error(`Failed to search audit logs: ${error}`);
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await AuditLog.destroy({
        where: {
          timestamp: {
            lt: cutoffDate
          },
          riskLevel: ['low', 'medium'] // Keep high risk logs longer
        }
      });

      // Log the cleanup operation
      await this.log({
        eventType: 'SYSTEM',
        action: 'AUDIT_CLEANUP',
        description: `Cleaned up ${deletedCount} old audit logs`,
        metadata: {
          retentionDays,
          cutoffDate,
          deletedCount
        },
        riskLevel: 'low'
      });

      return deletedCount;

    } catch (error) {
      throw new Error(`Failed to cleanup old logs: ${error}`);
    }
  }

  // Private helper methods
  private async logImmediate(input: AuditLogInput): Promise<void> {
    const auditLog = this.prepareAuditLog(input);
    await AuditLog.create(auditLog);
  }

  private prepareAuditLog(input: AuditLogInput): any {
    return {
      userId: input.userId,
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      correlationId: input.correlationId || uuidv4(),
      eventType: input.eventType,
      action: input.action,
      description: input.description,
      entityType: input.entityType,
      entityId: input.entityId,
      entityName: input.entityName,
      oldValues: input.oldValues,
      newValues: input.newValues,
      changedFields: input.changedFields,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      requestPath: input.requestPath,
      requestMethod: input.requestMethod,
      applicationName: input.applicationName || 'IFRS9-Platform',
      moduleName: input.moduleName,
      functionName: input.functionName,
      businessDate: input.businessDate,
      calculationDate: input.calculationDate,
      riskLevel: input.riskLevel || 'low',
      complianceCategory: input.complianceCategory,
      executionTimeMs: input.executionTimeMs,
      timestamp: new Date()
    };
  }

  private calculateRiskLevel(input: AuditLogInput): 'low' | 'medium' | 'high' | 'critical' {
    // Authentication and security events
    if (input.eventType === 'AUTHENTICATION' || input.eventType === 'AUTHORIZATION') {
      if (input.action.includes('FAILED') || input.action.includes('VIOLATION')) {
        return 'high';
      }
      return 'medium';
    }

    // Data changes
    if (input.oldValues && Object.keys(input.oldValues).length > 0) {
      return 'medium';
    }

    // Security events
    if (input.eventType === 'SECURITY') {
      return 'high';
    }

    // Financial calculations
    if (input.eventType === 'CALCULATION' || input.eventType === 'IFRS9') {
      return 'medium';
    }

    return 'low';
  }

  private isHighPriorityEvent(input: AuditLogInput): boolean {
    return input.riskLevel === 'high' || 
           input.riskLevel === 'critical' ||
           input.eventType === 'SECURITY' ||
           (input.eventType === 'AUTHENTICATION' && input.action.includes('FAILED'));
  }

  private async cacheRecentEvent(input: AuditLogInput): Promise<void> {
    try {
      if (this.isHighPriorityEvent(input)) {
        const cacheKey = `recent_audit:${input.tenantId || 'global'}`;
        const event = {
          ...input,
          timestamp: new Date().toISOString()
        };
        
        await this.redisService.lpush(cacheKey, JSON.stringify(event));
        await this.redisService.ltrim(cacheKey, 0, 99); // Keep last 100 events
        await this.redisService.expire(cacheKey, 3600); // 1 hour TTL
      }
    } catch (error) {
      console.error('Failed to cache recent event:', error);
    }
  }

  private startBatchProcessor(): void {
    // Process batch every 5 seconds
    setInterval(async () => {
      if (this.batchBuffer.length > 0) {
        await this.processBatch();
      }
    }, this.batchTimeoutMs);
  }

  private async processBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    try {
      const batch = this.batchBuffer.splice(0);
      await this.logBatch(batch);
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }
}
EOF

    log_success "Audit Service generated successfully"
}

# Generate Redis Service
generate_redis_service() {
    log_info "Generating Redis Service..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/redis/redis.service.ts" << 'EOF'
// packages/backend/src/core/services/redis/redis.service.ts
import Redis from 'ioredis';
import { ConfigurationService } from '../configuration/configuration.service';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  family: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export class RedisService {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;
  private isConnected: boolean = false;

  constructor(private readonly configService: ConfigurationService) {
    this.initialize();
  }

  /**
   * Initialize Redis connections
   */
  private async initialize(): Promise<void> {
    try {
      const config = await this.getRedisConfig();
      
      // Main client for general operations
      this.client = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db,
        retryDelayOnFailover: config.retryDelayOnFailover,
        maxRetriesPerRequest: config.maxRetriesPerRequest,
        lazyConnect: config.lazyConnect,
        keepAlive: config.keepAlive,
        family: config.family
      });

      // Separate connections for pub/sub
      this.subscriber = this.client.duplicate();
      this.publisher = this.client.duplicate();

      // Set up event handlers
      this.setupEventHandlers();

      // Connect
      await this.connect();
      
    } catch (error) {
      console.error('Redis initialization error:', error);
      throw error;
    }
  }

  /**
   * Connect to Redis
   */
  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.subscriber.connect();
      await this.publisher.connect();
      
      this.isConnected = true;
      console.log('✅ Redis connected successfully');
      
    } catch (error) {
      console.error('Redis connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Basic Redis operations
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    try {
      await this.client.setex(key, seconds, value);
    } catch (error) {
      console.error(`Redis SETEX error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Increment operations
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error(`Redis DECR error for key ${key}:`, error);
      throw error;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      console.error(`Redis INCRBY error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Hash operations
   */
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      console.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hmset(key: string, hash: Record<string, string>): Promise<void> {
    try {
      await this.client.hmset(key, hash);
    } catch (error) {
      console.error(`Redis HMSET error for key ${key}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hdel(key, field);
    } catch (error) {
      console.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
      return 0;
    }
  }

  /**
   * List operations
   */
  async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lpush(key, value);
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.rpush(key, value);
    } catch (error) {
      console.error(`Redis RPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      console.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      console.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      console.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.client.ltrim(key, start, stop);
    } catch (error) {
      console.error(`Redis LTRIM error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set operations
   */
  async sadd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sadd(key, member);
    } catch (error) {
      console.error(`Redis SADD error for key ${key}:`, error);
      throw error;
    }
  }

  async srem(key: string, member: string): Promise<number> {
    try {
      return await this.client.srem(key, member);
    } catch (error) {
      console.error(`Redis SREM error for key ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error(`Redis SISMEMBER error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Pub/Sub operations
   */
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      console.error(`Redis PUBLISH error for channel ${channel}:`, error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
    } catch (error) {
      console.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      console.error(`Redis UNSUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Cache operations with JSON support
   */
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis getJson error for key ${key}:`, error);
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.set(key, jsonValue, ttl);
    } catch (error) {
      console.error(`Redis setJson error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Session management
   */
  async getSession(sessionId: string): Promise<any> {
    return this.getJson(`session:${sessionId}`);
  }

  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.setJson(`session:${sessionId}`, data, ttl);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  /**
   * Lock operations (for distributed locking)
   */
  async acquireLock(lockKey: string, ttl: number = 30): Promise<boolean> {
    try {
      const result = await this.client.set(lockKey, '1', 'PX', ttl * 1000, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error(`Redis acquireLock error for key ${lockKey}:`, error);
      return false;
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.del(lockKey);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy'
      };
    }
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): { isConnected: boolean } {
    return {
      isConnected: this.isConnected
    };
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      await this.subscriber.disconnect();
      await this.publisher.disconnect();
      this.isConnected = false;
      console.log('Redis disconnected');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  // Private helper methods
  private async getRedisConfig(): Promise<RedisConfig> {
    return {
      host: await this.configService.get<string>('redis.host', undefined, 'localhost'),
      port: await this.configService.get<number>('redis.port', undefined, 6379),
      password: await this.configService.get<string>('redis.password', undefined, undefined),
      db: await this.configService.get<number>('redis.db', undefined, 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4
    };
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Redis client connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }
}
EOF

    log_success "Redis Service generated successfully"
}

# Main function
main() {
    log_info "Starting Service Layer Generation..."
    
    # Create service directories
    create_service_directories
    
    # Generate all service components
    generate_user_service
    generate_audit_service
    generate_redis_service
    
    log_success "Service Layer Generation completed successfully!"
    log_info "Generated files:"
    log_info "- User Service: packages/backend/src/core/services/user/user.service.ts"
    log_info "- Audit Service: packages/backend/src/core/services/audit/audit.service.ts"
    log_info "- Redis Service: packages/backend/src/core/services/redis/redis.service.ts"
}

# Execute main function with all arguments
main "$@"