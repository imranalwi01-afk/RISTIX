// packages/backend/src/api/controllers/platform-admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PlatformAdminService } from '../../core/services/platform/platform-admin.service';
import { ConsultantService } from '../../core/services/consultant/consultant.service';

export class PlatformAdminController {
  private platformAdminService: PlatformAdminService;
  private consultantService: ConsultantService;

  constructor() {
    this.platformAdminService = new PlatformAdminService();
    this.consultantService = new ConsultantService();
  }

  /**
   * Login platform admin or consultant user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, userType = 'platform_admin', consultantAccess = false } = req.body;
      
      const result = await this.platformAdminService.authenticateUser({
        username,
        password,
        userType,
        consultantAccess,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      console.error('Platform admin login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed',
        error: { code: 'AUTHENTICATION_FAILED' }
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        await this.platformAdminService.invalidateToken(token);
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Platform admin logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: { code: 'LOGOUT_ERROR' }
      });
    }
  }

  /**
   * Validate authentication token
   */
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: { code: 'INVALID_TOKEN' }
      });
    }
  }

  /**
   * Get banking institutions
   */
  async getBankingInstitutions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, perPage = 25, sort = 'created_at', order = 'DESC', filter = {} } = req.query;
      
      const result = await this.platformAdminService.getBankingInstitutions({
        page: Number(page),
        perPage: Number(perPage),
        sort: sort as string,
        order: order as 'ASC' | 'DESC',
        filter: typeof filter === 'string' ? JSON.parse(filter) : (filter as Record<string, any>),
      });

      res.set('Content-Range', `banking-institutions ${(Number(page) - 1) * Number(perPage)}-${Number(page) * Number(perPage)}/${result.total}`);
      res.json(result.data);
    } catch (error) {
      console.error('Get banking institutions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve banking institutions',
        error: { code: 'RETRIEVAL_ERROR' }
      });
    }
  }

  /**
   * Create banking institution
   */
  async createBankingInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionData = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.platformAdminService.createBankingInstitution({
        ...institutionData,
        created_by: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Banking institution created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Create banking institution error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create banking institution',
        error: { code: 'CREATION_ERROR' }
      });
    }
  }

  /**
   * Get consultants
   */
  async getConsultants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, perPage = 25, sort = 'created_at', order = 'DESC', filter = {} } = req.query;
      
      const result = await this.consultantService.getConsultants({
        page: Number(page),
        perPage: Number(perPage),
        sort: sort as string,
        order: order as 'ASC' | 'DESC',
        filter: typeof filter === 'string' ? JSON.parse(filter) : (filter as Record<string, any>),
      });

      res.set('Content-Range', `consultants ${(Number(page) - 1) * Number(perPage)}-${Number(page) * Number(perPage)}/${result.total}`);
      res.json(result.data);
    } catch (error) {
      console.error('Get consultants error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve consultants',
        error: { code: 'RETRIEVAL_ERROR' }
      });
    }
  }

  /**
   * Create consultant
   */
  async createConsultant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consultantData = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.consultantService.createConsultant({
        ...consultantData,
        created_by: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Consultant created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Create consultant error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create consultant',
        error: { code: 'CREATION_ERROR' }
      });
    }
  }

  /**
   * Get consultant projects
   */
  async getConsultantProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, perPage = 25, sort = 'created_at', order = 'DESC', filter = {} } = req.query;
      
      const result = await this.consultantService.getConsultantProjects({
        page: Number(page),
        perPage: Number(perPage),
        sort: sort as string,
        order: order as 'ASC' | 'DESC',
        filter: typeof filter === 'string' ? JSON.parse(filter) : (filter as Record<string, any>),
      });

      res.set('Content-Range', `consultant-projects ${(Number(page) - 1) * Number(perPage)}-${Number(page) * Number(perPage)}/${result.total}`);
      res.json(result.data);
    } catch (error) {
      console.error('Get consultant projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve consultant projects',
        error: { code: 'RETRIEVAL_ERROR' }
      });
    }
  }

  /**
   * Create consultant project
   */
  async createConsultantProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectData = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.consultantService.createConsultantProject({
        ...projectData,
        created_by: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Consultant project created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Create consultant project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create consultant project',
        error: { code: 'CREATION_ERROR' }
      });
    }
  }

  /**
   * Get tenant overview for cross-tenant monitoring
   */
  async getTenantOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.platformAdminService.getTenantOverview();

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get tenant overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tenant overview',
        error: { code: 'RETRIEVAL_ERROR' }
      });
    }
  }

  /**
   * Get platform configuration
   */
  async getPlatformConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.platformAdminService.getPlatformConfig();

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get platform config error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve platform configuration',
        error: { code: 'RETRIEVAL_ERROR' }
      });
    }
  }

  /**
   * Update platform configuration
   */
  async updatePlatformConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const userId = (req as any).user?.id;
      
      const result = await this.platformAdminService.updatePlatformConfig({
        key,
        value,
        updated_by: userId,
      });

      res.json({
        success: true,
        message: 'Platform configuration updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Update platform config error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update platform configuration',
        error: { code: 'UPDATE_ERROR' }
      });
    }
  }
}

// Export controller instance methods for use in routes
const platformAdminController = new PlatformAdminController();

export const {
  login,
  logout,
  validateToken,
  getBankingInstitutions,
  createBankingInstitution,
  getConsultants,
  createConsultant,
  getConsultantProjects,
  createConsultantProject,
  getTenantOverview,
  getPlatformConfig,
  updatePlatformConfig
} = platformAdminController;

export default platformAdminController;