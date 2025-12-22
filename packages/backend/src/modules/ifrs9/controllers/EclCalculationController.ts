// packages/backend/src/modules/ifrs9/controllers/EclCalculationController.ts
import { Request, Response, NextFunction } from 'express';
import { EclCalculationService } from '../services/EclCalculationService';
import { TenantContext } from '../../../core/interfaces/TenantContext';
import { ValidationError, BusinessLogicError } from '../../../core/errors';
import { validationResult } from 'express-validator';
import { sequelize } from '../../../core/database/connection';

export class EclCalculationController {
  private eclCalculationService: EclCalculationService;

  constructor() {
    this.eclCalculationService = new EclCalculationService();
  }

  /**
   * Start ECL calculation
   */
  public calculateEcl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      const { accountIds, calculationDate, parameters } = req.body;

      // Perform calculation
      const result = await this.eclCalculationService.calculateEcl({
        accountIds,
        calculationDate: new Date(calculationDate),
        parameters
      }, tenantContext, transaction);

      await transaction.commit();

      res.status(200).json({
        success: true,
        data: result,
        message: 'ECL calculation completed successfully'
      });

    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  /**
   * Get calculation history
   */
  public getCalculationHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      const { page = 1, limit = 10 } = req.query;
      
      // Get calculation jobs history (simplified)
      const jobs = await sequelize.models.EclJob.findAll({
        where: { tenantId: tenantContext.tenantId },
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit)
      });

      res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: jobs.length
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get calculation results by job ID
   */
  public getCalculationResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      const job = await sequelize.models.EclJob.findOne({
        where: { 
          id: jobId,
          tenantId: tenantContext.tenantId 
        }
      });

      if (!job) {
        throw new ValidationError('Calculation job not found');
      }

      res.status(200).json({
        success: true,
        data: job,
        message: 'Calculation results retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get portfolio summary
   */
  public getPortfolioSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      // Get portfolio summary statistics
      const summary = await sequelize.query(`
        SELECT 
          COUNT(*) as total_accounts,
          SUM(outstanding_amount) as total_outstanding,
          SUM(CASE WHEN current_stage = 1 THEN 1 ELSE 0 END) as stage1_count,
          SUM(CASE WHEN current_stage = 2 THEN 1 ELSE 0 END) as stage2_count,
          SUM(CASE WHEN current_stage = 3 THEN 1 ELSE 0 END) as stage3_count,
          SUM(ecl_12m) as total_ecl_12m,
          SUM(ecl_lifetime) as total_ecl_lifetime,
          SUM(CASE WHEN is_syariah_compliant = true THEN outstanding_amount ELSE 0 END) as syariah_outstanding
        FROM core.portfolio_accounts 
        WHERE tenant_id = :tenantId AND is_active = true
      `, {
        replacements: { tenantId: tenantContext.tenantId },
        type: sequelize.QueryTypes.SELECT
      });

      res.status(200).json({
        success: true,
        data: summary[0],
        message: 'Portfolio summary retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  };
}
