// packages/backend/src/core/services/platform/platform-admin.service.ts
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseConfig } from '../../database/config/database.config';
import { appConfig } from '../../../config/app.config';

interface AuthUserInput {
  username: string;
  password: string;
  userType: string;
  consultantAccess?: boolean;
}

interface AuthResult {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];
    userType: string;
  };
  token: string;
  refreshToken: string;
}

interface BankingInstitutionInput {
  name: string;
  code: string;
  type: 'conventional' | 'syariah' | 'dual';
  country: string;
  swift_code?: string;
  created_by: string;
}

interface PaginationParams {
  page: number;
  perPage: number;
  sort: string;
  order: 'ASC' | 'DESC';
  filter: Record<string, any>;
}

export class PlatformAdminService {
  /**
   * Authenticate platform admin or consultant user
   */
  async authenticateUser(input: AuthUserInput): Promise<AuthResult> {
    try {
      const { username, password, userType, consultantAccess } = input;
      const platformDb = databaseConfig.getPlatformConnection();

      // Query platform users
      const userQuery = `
        SELECT id, username, email, password_hash, full_name, role, permissions, is_active
        FROM platform_admin.platform_users 
        WHERE (username = :username OR email = :username) 
        AND is_active = true
        AND (role = 'platform_admin' OR role = 'consultant_manager')
      `;

      const [results] = await platformDb.query(userQuery, {
        replacements: { username },
        type: 'SELECT'
      });

      if (!results || results.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = results[0] as any;

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        userType: userType,
        consultantAccess: consultantAccess || false
      };

      const token = jwt.sign(tokenPayload, appConfig.jwt.secret, {
        expiresIn: appConfig.jwt.expiresIn
      });

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        appConfig.jwt.refreshSecret || appConfig.jwt.secret,
        { expiresIn: appConfig.jwt.refreshExpiresIn }
      );

      // Update last login
      await platformDb.query(
        'UPDATE platform_admin.platform_users SET last_login_at = NOW() WHERE id = :userId',
        { replacements: { userId: user.id } }
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []),
          userType: userType
        },
        token,
        refreshToken
      };

    } catch (error) {
      console.error('Platform admin authentication error:', error);
      throw error;
    }
  }

  /**
   * Invalidate authentication token
   */
  async invalidateToken(token: string): Promise<void> {
    // TODO: Implement token blacklisting if needed
    // For now, we'll just log the logout
    console.log('Token invalidated:', token.substring(0, 20) + '...');
  }

  /**
   * Get banking institutions with pagination
   */
  async getBankingInstitutions(params: PaginationParams): Promise<{ data: any[]; total: number }> {
    try {
      const { page, perPage, sort, order, filter } = params;
      const offset = (page - 1) * perPage;
      const platformDb = databaseConfig.getPlatformConnection();

      // Build filter conditions
      let whereClause = 'WHERE 1=1';
      const replacements: any = { limit: perPage, offset };

      if (filter.name) {
        whereClause += ' AND name ILIKE :name';
        replacements.name = `%${filter.name}%`;
      }

      if (filter.type) {
        whereClause += ' AND type = :type';
        replacements.type = filter.type;
      }

      if (filter.country) {
        whereClause += ' AND country = :country';
        replacements.country = filter.country;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM platform_admin.tenants 
        ${whereClause}
      `;

      const [countResults] = await platformDb.query(countQuery, {
        replacements,
        type: 'SELECT'
      });

      const total = (countResults[0] as any).total;

      // Get data with pagination
      const dataQuery = `
        SELECT id, name, tenant_slug as code, banking_type as type, 
               database_name, status, created_at, updated_at
        FROM platform_admin.tenants 
        ${whereClause}
        ORDER BY ${sort} ${order}
        LIMIT :limit OFFSET :offset
      `;

      const [dataResults] = await platformDb.query(dataQuery, {
        replacements,
        type: 'SELECT'
      });

      return {
        data: dataResults as any[],
        total: parseInt(total)
      };

    } catch (error) {
      console.error('Get banking institutions error:', error);
      throw error;
    }
  }

  /**
   * Create banking institution (tenant)
   */
  async createBankingInstitution(input: BankingInstitutionInput): Promise<any> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();
      const institutionId = uuidv4();
      const slug = input.code.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const databaseName = `ifrspro_tenant_${slug}`;

      // Use centralized configuration for database host
      const envConfig = this.configService.getConfig();
      const dbHost = envConfig.database.host;
      const dbPort = envConfig.database.port;
      const dbUser = envConfig.database.username;
      const dbPassword = envConfig.database.password;

      const insertQuery = `
        INSERT INTO platform_admin.tenants (
          id, name, tenant_slug, banking_type, database_name,
          database_host, database_port, database_user, database_password_hash,
          status, created_at, updated_at
        ) VALUES (
          :id, :name, :slug, :type, :databaseName,
          :dbHost, :dbPort, :dbUser, :passwordHash,
          'active', NOW(), NOW()
        )
        RETURNING *
      `;

      const passwordHash = await bcrypt.hash(dbPassword, 12);

      const [results] = await platformDb.query(insertQuery, {
        replacements: {
          id: institutionId,
          name: input.name,
          slug: slug,
          type: input.bankingType || 'conventional',
          databaseName: databaseName,
          dbHost: dbHost,
          dbPort: dbPort,
          dbUser: dbUser,
          passwordHash: passwordHash
        },
        type: 'INSERT'
      });

      return results[0];

    } catch (error) {
      console.error('Create banking institution error:', error);
      throw error;
    }
  }

  /**
   * Get tenant overview for cross-tenant monitoring
   */
  async getTenantOverview(): Promise<any> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();

      const query = `
        SELECT 
          COUNT(*) as total_tenants,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
          COUNT(CASE WHEN banking_type = 'conventional' THEN 1 END) as conventional_banks,
          COUNT(CASE WHEN banking_type = 'syariah' THEN 1 END) as syariah_banks,
          COUNT(CASE WHEN banking_type = 'dual' THEN 1 END) as dual_banks
        FROM platform_admin.tenants
      `;

      const [results] = await platformDb.query(query, { type: 'SELECT' });
      return results[0];

    } catch (error) {
      console.error('Get tenant overview error:', error);
      throw error;
    }
  }

  /**
   * Get platform configuration
   */
  async getPlatformConfig(): Promise<any[]> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();

      const query = `
        SELECT key, value, description, category, is_sensitive, updated_at
        FROM platform_admin.configuration
        WHERE is_active = true
        ORDER BY category, key
      `;

      const [results] = await platformDb.query(query, { type: 'SELECT' });
      return results as any[];

    } catch (error) {
      console.error('Get platform config error:', error);
      throw error;
    }
  }

  /**
   * Update platform configuration
   */
  async updatePlatformConfig(input: { key: string; value: any; updated_by: string }): Promise<any> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();
      const { key, value, updated_by } = input;

      const updateQuery = `
        UPDATE platform_admin.configuration 
        SET value = :value, updated_at = NOW(), updated_by = :updatedBy
        WHERE key = :key
        RETURNING *
      `;

      const [results] = await platformDb.query(updateQuery, {
        replacements: {
          key,
          value: JSON.stringify(value),
          updatedBy: updated_by
        },
        type: 'UPDATE'
      });

      return results[0];

    } catch (error) {
      console.error('Update platform config error:', error);
      throw error;
    }
  }
}

export { PlatformAdminService };