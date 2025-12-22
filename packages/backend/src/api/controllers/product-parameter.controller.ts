// packages/backend/src/api/controllers/product-parameter.controller.ts
// ============================================================================
// 🔧 PROD-002: PRODUCT PARAMETER CONTROLLER - STANDALONE CRUD PATTERN
// ============================================================================
// ✅ IMPLEMENTS: Complete REST API controller for Product Parameters
// ✅ PATTERN: Standalone CRUD Pattern with service layer integration
// ✅ ENDPOINTS: CRUD (4) + Health (1) = 5 total endpoints
// ✅ INTEGRATION: ProductParameterService for business logic
// ============================================================================

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { appConfig } from "../../config/app.config";
import { productParameterService } from '../../core/services/product-parameter.service';

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
    return true; // Has validation errors
  }
  return false; // No validation errors
};

export class ProductParameterController {
  /**
   * Get all product parameters with pagination and filtering
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [PROD-002] Getting product parameters with query:', req.query);

      // Check validation errors from express-validator
      if (handleValidationErrors(req, res)) return;

      // Use service layer for business logic
      const result = await productParameterService.getProducts(
        req.query,
        (req as any).user?.email
      );

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        message: `Product parameters retrieved successfully from DS2 database`,
        database_info: (() => {
          const config = appConfig.platformDb;
          return {
            host: `${config.frs9.host}:${config.frs9.port}`,
            database: config.frs9.database,
            table: 'frs9_param_product',
            ssl: config.frs9.ssl,
            environment: config.frs9.host.includes('rds.aliyuncs.com') ? 'production' : 'development'
          };
        })()
      });

    } catch (error) {
      console.error('❌ [PROD-002] Error getting product parameters:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product parameters',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get instrument class options from FRS9PRO parameter B0003
   */
  async getInstrumentClassOptions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [PROD-002] Getting instrument class options from B0003');

      // Use service layer to get instrument class options
      const options = await productParameterService.getInstrumentClassOptions();

      res.json({
        success: true,
        data: options,
        message: 'Instrument class options retrieved successfully',
        source: 'frs9_param_commond with param_code B0003'
      });

    } catch (error) {
      console.error('❌ [PROD-002] Error getting instrument class options:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get instrument class options',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new product parameter
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      console.log('✨ [PROD-002] Creating product parameter:', req.body);

      // Check validation errors from express-validator
      if (handleValidationErrors(req, res)) return;

      // Use service layer for business logic
      const product = await productParameterService.createProduct(
        req.body,
        (req as any).user?.email,
        req.ip
      );

      console.log(`✅ [PROD-002] Product parameter created successfully: ${product.prd_code}`);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product parameter created successfully'
      });

    } catch (error) {
      console.error('❌ [PROD-002] Error creating product parameter:', error);

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          error: 'Product code already exists',
          code: 'DUPLICATE_PRODUCT_CODE',
          details: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create product parameter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update existing product parameter
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productCode = req.params.prd_code;
      console.log(`🔄 [PROD-002] Updating product parameter by code: ${productCode}`, req.body);

      // Check validation errors from express-validator
      if (handleValidationErrors(req, res)) return;

      // Use service layer for business logic
      const product = await productParameterService.updateProductByCode(
        productCode,
        req.body,
        (req as any).user?.email,
        req.ip
      );

      console.log(`✅ [PROD-002] Product parameter updated successfully: ${product.prd_code}`);

      res.json({
        success: true,
        data: product,
        message: 'Product parameter updated successfully'
      });

    } catch (error) {
      console.error('❌ [PROD-002] Error updating product parameter:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Product parameter not found',
          code: 'PRODUCT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update product parameter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete product parameter
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const productCode = req.params.prd_code;
      console.log(`🗑️ [PROD-002] Deleting product parameter by code: ${productCode}`);

      // Check validation errors from express-validator
      if (handleValidationErrors(req, res)) return;

      // Use service layer for business logic
      await productParameterService.deleteProductByCode(
        productCode,
        (req as any).user?.email
      );

      console.log(`✅ [PROD-002] Product parameter deleted successfully: ${productCode}`);

      res.status(200).json({
        success: true,
        message: 'Product parameter deleted successfully'
      });

    } catch (error) {
      console.error('❌ [PROD-002] Error deleting product parameter:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Product parameter not found',
          code: 'PRODUCT_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete product parameter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get specific product parameter by ID
   */
  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      console.log(`🔍 [PROD-002] Getting product parameter ID: ${productId}`);

      // Check validation errors from express-validator
      if (handleValidationErrors(req, res)) return;

      // Use service layer for business logic
      const product = await productParameterService.getProductById(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product parameter not found',
          code: 'PRODUCT_NOT_FOUND'
        });
        return;
      }

      console.log(`✅ [PROD-002] Product parameter found: ${product.prd_code}`);

      res.json({
        success: true,
        data: product,
        message: 'Product parameter retrieved successfully'
      });

    } catch (error) {
      console.error('❌ [PROD-002] Error getting product parameter:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product parameter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Health check for product parameter service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      console.log('🏥 [PROD-002] Product parameter health check');

      // Use service layer for health check
      const healthStatus = await productParameterService.healthCheck();
      const config = appConfig.platformDb.frs9;

      if (healthStatus.status === 'healthy') {
        res.json({
          success: true,
          message: 'Product parameter service is healthy - DS2 connection working',
          data: {
            connection: 'healthy',
            database: config.database,
            host: `${config.host}:${config.port}`,
            table: 'frs9_param_product',
            ssl: config.ssl,
            environment: config.host.includes('rds.aliyuncs.com') ? 'production' : 'development',
            total_records: healthStatus.total_records,
            last_updated: healthStatus.last_updated,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(503).json({
          success: false,
          data: {
            connection: 'unhealthy',
            database: config.database,
            host: `${config.host}:${config.port}`,
            ssl: config.ssl,
            environment: config.host.includes('rds.aliyuncs.com') ? 'production' : 'development',
            total_records: healthStatus.total_records
          },
          error: 'Product parameter service is unhealthy',
          code: 'SERVICE_UNHEALTHY'
        });
      }

    } catch (error) {
      console.error('❌ [PROD-002] Health check failed:', error);
      const config = appConfig.platformDb.frs9;

      res.status(503).json({
        success: false,
        data: {
          connection: 'unhealthy',
          database: config.database,
          host: `${config.host}:${config.port}`,
          ssl: config.ssl,
          environment: config.host.includes('rds.aliyuncs.com') ? 'production' : 'development',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        error: 'FRS9 database connection issues detected',
        code: 'DATABASE_UNHEALTHY'
      });
    }
  }
}

// Export controller instance
export const productParameterController = new ProductParameterController();