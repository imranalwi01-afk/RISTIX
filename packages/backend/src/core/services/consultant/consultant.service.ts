// packages/backend/src/core/services/consultant/consultant.service.ts
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { databaseConfig } from '../../database/config/database.config';

interface ConsultantInput {
  username: string;
  email: string;
  full_name: string;
  company: string;
  specialization: string;
  certification_level?: string;
  created_by: string;
}

interface ConsultantProjectInput {
  title: string;
  description: string;
  tenant_id: string;
  consultant_id: string;
  start_date: Date;
  estimated_end_date: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  project_type: 'implementation' | 'validation' | 'audit' | 'training';
  created_by: string;
}

interface PaginationParams {
  page: number;
  perPage: number;
  sort: string;
  order: 'ASC' | 'DESC';
  filter: Record<string, any>;
}

export class ConsultantService {
  /**
   * Get consultants with pagination
   */
  async getConsultants(params: PaginationParams): Promise<{ data: any[]; total: number }> {
    try {
      const { page, perPage, sort, order, filter } = params;
      const offset = (page - 1) * perPage;
      const platformDb = databaseConfig.getPlatformConnection();

      // Build filter conditions
      let whereClause = "WHERE role IN ('consultant_manager', 'consultant')";
      const replacements: any = { limit: perPage, offset };

      if (filter.name) {
        whereClause += ' AND full_name ILIKE :name';
        replacements.name = `%${filter.name}%`;
      }

      if (filter.company) {
        whereClause += ' AND company ILIKE :company';
        replacements.company = `%${filter.company}%`;
      }

      if (filter.specialization) {
        whereClause += ' AND specialization = :specialization';
        replacements.specialization = filter.specialization;
      }

      if (filter.is_active !== undefined) {
        whereClause += ' AND is_active = :isActive';
        replacements.isActive = filter.is_active;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM platform_admin.platform_users 
        ${whereClause}
      `;

      const [countResults] = await platformDb.query(countQuery, {
        replacements,
        type: 'SELECT'
      });

      const total = (countResults[0] as any).total;

      // Get data with pagination
      const dataQuery = `
        SELECT id, username, email, full_name, company, specialization,
               certification_level, is_active, created_at, updated_at, last_login_at
        FROM platform_admin.platform_users 
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
      console.error('Get consultants error:', error);
      throw error;
    }
  }

  /**
   * Create consultant user
   */
  async createConsultant(input: ConsultantInput): Promise<any> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();
      const consultantId = uuidv4();
      
      // Generate temporary password
      const tempPassword = this.generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const insertQuery = `
        INSERT INTO platform_admin.platform_users (
          id, username, email, password_hash, full_name, role, company,
          specialization, certification_level, is_active, force_password_change,
          created_at, updated_at
        ) VALUES (
          :id, :username, :email, :passwordHash, :fullName, 'consultant',
          :company, :specialization, :certificationLevel, true, true,
          NOW(), NOW()
        )
        RETURNING id, username, email, full_name, company, specialization, 
                  certification_level, is_active, created_at
      `;

      const [results] = await platformDb.query(insertQuery, {
        replacements: {
          id: consultantId,
          username: input.username,
          email: input.email,
          passwordHash: passwordHash,
          fullName: input.full_name,
          company: input.company,
          specialization: input.specialization,
          certificationLevel: input.certification_level || 'basic'
        },
        type: 'INSERT'
      });

      const consultant = results[0] as any;

      // TODO: Send email with temporary password
      console.log(`Consultant created with temp password: ${tempPassword}`);

      return {
        ...consultant,
        tempPassword // Remove this in production, send via email instead
      };

    } catch (error) {
      console.error('Create consultant error:', error);
      throw error;
    }
  }

  /**
   * Get consultant projects with pagination
   */
  async getConsultantProjects(params: PaginationParams): Promise<{ data: any[]; total: number }> {
    try {
      const { page, perPage, sort, order, filter } = params;
      const offset = (page - 1) * perPage;
      const platformDb = databaseConfig.getPlatformConnection();

      // Build filter conditions
      let whereClause = 'WHERE 1=1';
      const replacements: any = { limit: perPage, offset };

      if (filter.consultant_id) {
        whereClause += ' AND cp.consultant_id = :consultantId';
        replacements.consultantId = filter.consultant_id;
      }

      if (filter.tenant_id) {
        whereClause += ' AND cp.tenant_id = :tenantId';
        replacements.tenantId = filter.tenant_id;
      }

      if (filter.status) {
        whereClause += ' AND cp.status = :status';
        replacements.status = filter.status;
      }

      if (filter.project_type) {
        whereClause += ' AND cp.project_type = :projectType';
        replacements.projectType = filter.project_type;
      }

      // Note: This assumes a consultant_projects table exists
      // You may need to create this table based on your requirements
      const query = `
        SELECT cp.id, cp.title, cp.description, cp.status, cp.project_type,
               cp.start_date, cp.estimated_end_date, cp.actual_end_date,
               c.full_name as consultant_name, c.company as consultant_company,
               t.name as tenant_name, t.banking_type,
               cp.created_at, cp.updated_at
        FROM platform_admin.consultant_projects cp
        LEFT JOIN platform_admin.platform_users c ON cp.consultant_id = c.id
        LEFT JOIN platform_admin.tenants t ON cp.tenant_id = t.id
        ${whereClause}
        ORDER BY ${sort} ${order}
        LIMIT :limit OFFSET :offset
      `;

      try {
        const [dataResults] = await platformDb.query(query, {
          replacements,
          type: 'SELECT'
        });

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total
          FROM platform_admin.consultant_projects cp
          LEFT JOIN platform_admin.platform_users c ON cp.consultant_id = c.id
          LEFT JOIN platform_admin.tenants t ON cp.tenant_id = t.id
          ${whereClause}
        `;

        const [countResults] = await platformDb.query(countQuery, {
          replacements,
          type: 'SELECT'
        });

        const total = (countResults[0] as any).total;

        return {
          data: dataResults as any[],
          total: parseInt(total)
        };

      } catch (error) {
        // If consultant_projects table doesn't exist, return empty results
        console.warn('Consultant projects table not found, returning empty results');
        return { data: [], total: 0 };
      }

    } catch (error) {
      console.error('Get consultant projects error:', error);
      throw error;
    }
  }

  /**
   * Create consultant project
   */
  async createConsultantProject(input: ConsultantProjectInput): Promise<any> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();
      const projectId = uuidv4();

      // First check if consultant_projects table exists, if not create it
      await this.ensureConsultantProjectsTable();

      const insertQuery = `
        INSERT INTO platform_admin.consultant_projects (
          id, title, description, tenant_id, consultant_id, start_date,
          estimated_end_date, status, project_type, created_at, updated_at
        ) VALUES (
          :id, :title, :description, :tenantId, :consultantId, :startDate,
          :estimatedEndDate, :status, :projectType, NOW(), NOW()
        )
        RETURNING *
      `;

      const [results] = await platformDb.query(insertQuery, {
        replacements: {
          id: projectId,
          title: input.title,
          description: input.description,
          tenantId: input.tenant_id,
          consultantId: input.consultant_id,
          startDate: input.start_date,
          estimatedEndDate: input.estimated_end_date,
          status: input.status,
          projectType: input.project_type
        },
        type: 'INSERT'
      });

      return results[0];

    } catch (error) {
      console.error('Create consultant project error:', error);
      throw error;
    }
  }

  /**
   * Generate temporary password for new consultants
   */
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Ensure consultant_projects table exists
   */
  private async ensureConsultantProjectsTable(): Promise<void> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS platform_admin.consultant_projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          tenant_id UUID NOT NULL REFERENCES platform_admin.tenants(id),
          consultant_id UUID NOT NULL REFERENCES platform_admin.platform_users(id),
          start_date DATE NOT NULL,
          estimated_end_date DATE,
          actual_end_date DATE,
          status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
          project_type VARCHAR(50) DEFAULT 'implementation' CHECK (project_type IN ('implementation', 'validation', 'audit', 'training')),
          budget_amount DECIMAL(15,2),
          actual_cost DECIMAL(15,2),
          progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await platformDb.query(createTableQuery);

      // Create indexes
      const createIndexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_consultant_projects_tenant ON platform_admin.consultant_projects(tenant_id)',
        'CREATE INDEX IF NOT EXISTS idx_consultant_projects_consultant ON platform_admin.consultant_projects(consultant_id)',
        'CREATE INDEX IF NOT EXISTS idx_consultant_projects_status ON platform_admin.consultant_projects(status)',
        'CREATE INDEX IF NOT EXISTS idx_consultant_projects_type ON platform_admin.consultant_projects(project_type)'
      ];

      for (const indexQuery of createIndexQueries) {
        await platformDb.query(indexQuery);
      }

    } catch (error) {
      console.error('Error ensuring consultant_projects table:', error);
      // Don't throw error, just log it
    }
  }
}

export { ConsultantService };