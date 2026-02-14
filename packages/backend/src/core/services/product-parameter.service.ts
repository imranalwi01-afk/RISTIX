// packages/backend/src/core/services/product-parameter.service.ts
// ============================================================================
// 🔧 PROD-003: PRODUCT PARAMETER SERVICE - BUSINESS LOGIC LAYER  
// ============================================================================
// ✅ IMPLEMENTS: Business logic for Product Parameter operations
// ✅ PATTERN: Service layer with validation and business rules
// ✅ FEATURES: Advanced queries, business validation, statistical analysis
// ✅ INTEGRATION: Sequelize models with IFRS 9 compliance
// ============================================================================

import { Transaction, Op } from 'sequelize';
import { ProductParameter, createProductAuditContext } from '../models/product-parameter.models';
import { frs9Sequelize } from '../models/frs9-parameter.models';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface ProductParameterQuery {
  page?: number;
  limit?: number;
  search?: string;
  prd_group?: string;
  prd_type?: string;
  currency?: string;
  active_only?: boolean;
  sort_by?: 'prd_code' | 'prd_desc' | 'createddate' | 'expected_life';
  sort_order?: 'ASC' | 'DESC';
}

export interface ProductParameterCreateData {
  data_source?: string;
  prd_group?: string;
  prd_type?: string;
  prd_code: string;
  prd_desc?: string;
  currency?: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bmi_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag?: boolean;
}

export interface ProductParameterUpdateData {
  data_source?: string;
  prd_group?: string;
  prd_type?: string;
  prd_desc?: string;
  currency?: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bmi_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag?: boolean;
}

export interface ProductParameterResult {
  data: ProductParameter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductParameterStatistics {
  total_products: number;
  active_products: number;
  inactive_products: number;
  by_group: Record<string, number>;
  by_type: Record<string, number>;
  by_currency: Record<string, number>;
  average_borrowing_rate: number;
  average_market_rate: number;
  average_expected_life: number;
}

// ==========================================
// PRODUCT PARAMETER SERVICE CLASS
// ==========================================

export class ProductParameterService {

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Get all product parameters with advanced filtering and pagination
   */
  async getProducts(
    query: ProductParameterQuery,
    userEmail?: string
  ): Promise<ProductParameterResult> {
    try {
      console.log('🔍 [PROD-003] ProductParameterService.getProducts:', query);

      // Set defaults
      const page = query.page || 1;
      const limit = Math.min(query.limit || 20, 100); // Max 100 items per page
      const offset = (page - 1) * limit;
      const sortBy = query.sort_by || 'prd_code';
      const sortOrder = query.sort_order || 'ASC';

      // Build where conditions
      const whereConditions: any = {};

      // Search across multiple fields
      if (query.search) {
        whereConditions[Op.or] = [
          { prd_code: { [Op.iLike]: `%${query.search}%` } },
          { prd_desc: { [Op.iLike]: `%${query.search}%` } },
          { prd_group: { [Op.iLike]: `%${query.search}%` } },
          { prd_type: { [Op.iLike]: `%${query.search}%` } }
        ];
      }

      // Apply filters
      if (query.prd_group) {
        whereConditions.prd_group = query.prd_group;
      }

      if (query.prd_type) {
        whereConditions.prd_type = query.prd_type;
      }

      if (query.currency) {
        whereConditions.currency = query.currency;
      }

      if (query.active_only) {
        whereConditions.active_flag = true;
      }

      // Execute query with pagination
      const { count, rows } = await ProductParameter.findAndCountAll({
        where: whereConditions,
        limit: limit,
        offset: offset,
        order: [[sortBy, sortOrder]],
        attributes: {
          exclude: ['createdhost', 'updatedhost'] // Exclude sensitive info
        }
      });

      console.log(`✅ [PROD-003] Found ${count} product parameters (page ${page})`);

      return {
        data: rows,
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
      };

    } catch (error) {
      console.error('❌ [PROD-003] Error in getProducts:', error);
      throw new Error(`Failed to get product parameters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get specific product parameter by ID
   */
  async getProductById(id: number): Promise<ProductParameter | null> {
    try {
      console.log(`🔍 [PROD-003] Getting product parameter by ID: ${id}`);

      const product = await ProductParameter.findByPk(id, {
        attributes: {
          exclude: ['createdhost', 'updatedhost']
        }
      });

      if (product) {
        console.log(`✅ [PROD-003] Product parameter found: ${product.prd_code}`);
      } else {
        console.log(`⚠️ [PROD-003] Product parameter not found: ID ${id}`);
      }

      return product;

    } catch (error) {
      console.error(`❌ [PROD-003] Error getting product by ID ${id}:`, error);
      throw new Error(`Failed to get product parameter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get product parameter by code
   */
  async getProductByCode(prdCode: string): Promise<ProductParameter | null> {
    try {
      console.log(`🔍 [PROD-003] Getting product parameter by code: ${prdCode}`);

      const product = await ProductParameter.findOne({
        where: { prd_code: prdCode },
        attributes: {
          exclude: ['createdhost', 'updatedhost']
        }
      });

      if (product) {
        console.log(`✅ [PROD-003] Product parameter found: ${product.prd_desc}`);
      } else {
        console.log(`⚠️ [PROD-003] Product parameter not found: Code ${prdCode}`);
      }

      return product;

    } catch (error) {
      console.error(`❌ [PROD-003] Error getting product by code ${prdCode}:`, error);
      throw new Error(`Failed to get product parameter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new product parameter with business validation
   */
  async createProduct(
    data: ProductParameterCreateData,
    userEmail?: string,
    hostIp?: string
  ): Promise<ProductParameter> {
    const transaction: Transaction = await frs9Sequelize.transaction();

    try {
      console.log('✨ [PROD-003] Creating product parameter:', data);

      // Business validation: Check if product code already exists
      const existingProduct = await ProductParameter.findOne({
        where: { prd_code: data.prd_code },
        transaction
      });

      if (existingProduct) {
        await transaction.rollback();
        throw new Error(`Product code '${data.prd_code}' already exists`);
      }

      // Business validation: Validate rates
      if (data.borrowing_rate && (data.borrowing_rate < 0 || data.borrowing_rate > 100)) {
        await transaction.rollback();
        throw new Error('Borrowing rate must be between 0 and 100');
      }

      if (data.market_rate && (data.market_rate < 0 || data.market_rate > 100)) {
        await transaction.rollback();
        throw new Error('Market rate must be between 0 and 100');
      }

      // Business validation: Validate expected life
      if (data.expected_life && (data.expected_life < 1 || data.expected_life > 600)) {
        await transaction.rollback();
        throw new Error('Expected life must be between 1 and 600 months');
      }

      // Create audit context
      const auditContext = createProductAuditContext(userEmail, hostIp);

      // Prepare data with defaults
      const productData = {
        ...data,
        active_flag: data.active_flag ?? true,
        impaired_flag: data.impaired_flag ?? false,
        bmi_flag: data.bmi_flag ?? true,
        ...auditContext
      };

      // Create product parameter
      const product = await ProductParameter.create(productData, { transaction });

      await transaction.commit();

      console.log(`✅ [PROD-003] Product parameter created: ${product.prd_code} (ID: ${product.pkid})`);

      return product;

    } catch (error) {
      await transaction.rollback();
      console.error('❌ [PROD-003] Error creating product parameter:', error);
      throw error;
    }
  }

  /**
   * Update existing product parameter with business validation
   */
  async updateProduct(
    id: number,
    data: ProductParameterUpdateData,
    userEmail?: string,
    hostIp?: string
  ): Promise<ProductParameter> {
    const transaction: Transaction = await frs9Sequelize.transaction();

    try {
      console.log(`🔄 [PROD-003] Updating product parameter ID: ${id}`, data);

      // Find existing product
      const product = await ProductParameter.findByPk(id, { transaction });

      if (!product) {
        await transaction.rollback();
        throw new Error(`Product parameter not found: ID ${id}`);
      }

      // Business validation: Validate rates
      if (data.borrowing_rate !== undefined && (data.borrowing_rate < 0 || data.borrowing_rate > 100)) {
        await transaction.rollback();
        throw new Error('Borrowing rate must be between 0 and 100');
      }

      if (data.market_rate !== undefined && (data.market_rate < 0 || data.market_rate > 100)) {
        await transaction.rollback();
        throw new Error('Market rate must be between 0 and 100');
      }

      // Business validation: Validate expected life
      if (data.expected_life !== undefined && (data.expected_life < 1 || data.expected_life > 600)) {
        await transaction.rollback();
        throw new Error('Expected life must be between 1 and 600 months');
      }

      // Create audit context for update
      const auditContext = createProductAuditContext(userEmail, hostIp);
      const updateData = {
        ...data,
        updatedby: auditContext.updatedby,
        updateddate: auditContext.updateddate,
        updatedhost: auditContext.updatedhost
      };

      // Update product
      await product.update(updateData, { transaction });

      await transaction.commit();

      console.log(`✅ [PROD-003] Product parameter updated: ${product.prd_code} (ID: ${product.pkid})`);

      return product;

    } catch (error) {
      await transaction.rollback();
      console.error(`❌ [PROD-003] Error updating product parameter ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update product parameter by product code
   */
  async updateProductByCode(
    productCode: string,
    data: Partial<ProductParameterCreateData>,
    userEmail?: string,
    hostInfo?: string
  ): Promise<ProductParameter> {
    const transaction: Transaction = await frs9Sequelize.transaction();

    try {
      console.log(`🔄 [PROD-003] Updating product parameter by code: ${productCode}`, data);

      // Find existing product by code
      const product = await ProductParameter.findOne({ 
        where: { prd_code: productCode },
        transaction 
      });

      if (!product) {
        await transaction.rollback();
        throw new Error(`Product parameter not found: ${productCode}`);
      }

      // Business validation: Validate rates
      if (data.borrowing_rate !== undefined && (data.borrowing_rate < 0 || data.borrowing_rate > 100)) {
        await transaction.rollback();
        throw new Error('Borrowing rate must be between 0 and 100');
      }

      if (data.market_rate !== undefined && (data.market_rate < 0 || data.market_rate > 100)) {
        await transaction.rollback();
        throw new Error('Market rate must be between 0 and 100');
      }

      // Prepare update data
      const updateData = {
        ...data,
        updatedby: userEmail || 'system',
        updateddate: new Date(),
        updatedhost: hostInfo || 'unknown'
      };

      // Update the product
      await product.update(updateData, { transaction });

      await transaction.commit();

      console.log(`✅ [PROD-003] Product parameter updated successfully: ${product.prd_code}`);
      return product;

    } catch (error) {
      await transaction.rollback();
      console.error(`❌ [PROD-003] Error updating product parameter ${productCode}:`, error);
      throw error;
    }
  }

  /**
   * Delete product parameter by code with dependency checking
   */
  async deleteProductByCode(productCode: string, userEmail?: string): Promise<void> {
    const transaction: Transaction = await frs9Sequelize.transaction();

    try {
      console.log(`🗑️ [PROD-003] Deleting product parameter by code: ${productCode}`);

      // Find existing product by code
      const product = await ProductParameter.findOne({ 
        where: { prd_code: productCode },
        transaction 
      });

      if (!product) {
        await transaction.rollback();
        throw new Error(`Product parameter not found: ${productCode}`);
      }

      // Business validation: Check for dependencies (future enhancement)
      // TODO: Check if product is used in portfolio accounts or other tables
      // For now, we allow deletion but log the action

      console.log(`⚠️ [PROD-003] Deleting product: ${product.prd_code} - ${product.prd_desc}`);

      // Delete the product
      await product.destroy({ transaction });

      await transaction.commit();
      console.log(`✅ [PROD-003] Product parameter deleted successfully: ${productCode}`);

    } catch (error) {
      await transaction.rollback();
      console.error(`❌ [PROD-003] Error deleting product parameter ${productCode}:`, error);
      throw error;
    }
  }

  /**
   * Delete product parameter with dependency checking (legacy ID-based method)
   */
  async deleteProduct(id: number, userEmail?: string): Promise<void> {
    const transaction: Transaction = await frs9Sequelize.transaction();

    try {
      console.log(`🗑️ [PROD-003] Deleting product parameter ID: ${id}`);

      // Find existing product
      const product = await ProductParameter.findByPk(id, { transaction });

      if (!product) {
        await transaction.rollback();
        throw new Error(`Product parameter not found: ID ${id}`);
      }

      // Business validation: Check for dependencies (future enhancement)
      // TODO: Check if product is used in portfolio accounts or other tables
      // For now, we allow deletion but log the action

      console.log(`⚠️ [PROD-003] Deleting product: ${product.prd_code} - ${product.prd_desc}`);

      // Delete the product
      await product.destroy({ transaction });

      await transaction.commit();

      console.log(`✅ [PROD-003] Product parameter deleted: ${product.prd_code} (ID: ${id})`);

    } catch (error) {
      await transaction.rollback();
      console.error(`❌ [PROD-003] Error deleting product parameter ID ${id}:`, error);
      throw error;
    }
  }

  // ==========================================
  // BUSINESS INTELLIGENCE OPERATIONS
  // ==========================================

  /**
   * Get product parameter statistics for dashboard
   */
  async getProductStatistics(): Promise<ProductParameterStatistics> {
    try {
      console.log('📊 [PROD-003] Getting product parameter statistics');

      // Get basic counts
      const totalProducts = await ProductParameter.count();
      const activeProducts = await ProductParameter.count({ where: { active_flag: true } });
      const inactiveProducts = totalProducts - activeProducts;

      // Get all products for grouping analysis
      const allProducts = await ProductParameter.findAll({
        attributes: ['prd_group', 'prd_type', 'currency', 'borrowing_rate', 'market_rate', 'expected_life'],
        where: { active_flag: true }
      });

      // Group by product group
      const byGroup: Record<string, number> = {};
      const byType: Record<string, number> = {};
      const byCurrency: Record<string, number> = {};

      let totalBorrowingRate = 0;
      let totalMarketRate = 0;
      let totalExpectedLife = 0;
      let borrowingRateCount = 0;
      let marketRateCount = 0;
      let expectedLifeCount = 0;

      allProducts.forEach(product => {
        // Group by product group
        if (product.prd_group) {
          byGroup[product.prd_group] = (byGroup[product.prd_group] || 0) + 1;
        }

        // Group by product type
        if (product.prd_type) {
          byType[product.prd_type] = (byType[product.prd_type] || 0) + 1;
        }

        // Group by currency
        if (product.currency) {
          byCurrency[product.currency] = (byCurrency[product.currency] || 0) + 1;
        }

        // Calculate averages
        if (product.borrowing_rate) {
          totalBorrowingRate += product.borrowing_rate;
          borrowingRateCount++;
        }

        if (product.market_rate) {
          totalMarketRate += product.market_rate;
          marketRateCount++;
        }

        if (product.expected_life) {
          totalExpectedLife += product.expected_life;
          expectedLifeCount++;
        }
      });

      const statistics: ProductParameterStatistics = {
        total_products: totalProducts,
        active_products: activeProducts,
        inactive_products: inactiveProducts,
        by_group: byGroup,
        by_type: byType,
        by_currency: byCurrency,
        average_borrowing_rate: borrowingRateCount > 0 ? totalBorrowingRate / borrowingRateCount : 0,
        average_market_rate: marketRateCount > 0 ? totalMarketRate / marketRateCount : 0,
        average_expected_life: expectedLifeCount > 0 ? totalExpectedLife / expectedLifeCount : 0
      };

      console.log('✅ [PROD-003] Product statistics generated successfully');

      return statistics;

    } catch (error) {
      console.error('❌ [PROD-003] Error getting product statistics:', error);
      throw new Error(`Failed to get product statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get distinct values for filter options
   */
  async getFilterOptions(): Promise<{
    product_groups: string[];
    product_types: string[];
    currencies: string[];
  }> {
    try {
      console.log('🔧 [PROD-003] Getting filter options');

      const [groupResults, typeResults, currencyResults] = await Promise.all([
        ProductParameter.findAll({
          attributes: ['prd_group'],
          where: {
            prd_group: { [Op.not]: null },
            active_flag: true
          },
          group: ['prd_group'],
          order: [['prd_group', 'ASC']]
        }),
        ProductParameter.findAll({
          attributes: ['prd_type'],
          where: {
            prd_type: { [Op.not]: null },
            active_flag: true
          },
          group: ['prd_type'],
          order: [['prd_type', 'ASC']]
        }),
        ProductParameter.findAll({
          attributes: ['currency'],
          where: {
            currency: { [Op.not]: null },
            active_flag: true
          },
          group: ['currency'],
          order: [['currency', 'ASC']]
        })
      ]);

      const options = {
        product_groups: groupResults.map(item => item.prd_group!).filter(Boolean),
        product_types: typeResults.map(item => item.prd_type!).filter(Boolean),
        currencies: currencyResults.map(item => item.currency!).filter(Boolean)
      };

      console.log('✅ [PROD-003] Filter options generated successfully');

      return options;

    } catch (error) {
      console.error('❌ [PROD-003] Error getting filter options:', error);
      throw new Error(`Failed to get filter options: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get instrument class options from FRS9PRO parameter B0003
   */
  async getInstrumentClassOptions(): Promise<Array<{ id: string; name: string; }>> {
    try {
      console.log('🔍 [PROD-003] Getting instrument class options from B0003');

      // Query FRS9PRO database for instrument class options
      const query = `
        SELECT param_seq, value1, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code = 'B0003' 
        ORDER BY param_seq
      `;

      const [results] = await frs9Sequelize.query(query);

      // Transform results to React Admin format
      const options = (results as any[]).map((row: any) => ({
        id: row.value1,
        name: row.paramdesc
      }));

      console.log('✅ [PROD-003] Instrument class options retrieved:', options);

      return options;

    } catch (error) {
      console.error('❌ [PROD-003] Error getting instrument class options:', error);
      throw new Error(`Failed to get instrument class options: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==========================================
  // VALIDATION HELPERS
  // ==========================================

  /**
   * Validate product code format and uniqueness
   */
  async validateProductCode(prdCode: string, excludeId?: number): Promise<{ valid: boolean; message?: string }> {
    try {
      // Format validation
      if (!/^[A-Z0-9_-]+$/.test(prdCode)) {
        return {
          valid: false,
          message: 'Product code must contain only uppercase letters, numbers, underscores, and hyphens'
        };
      }

      if (prdCode.length > 20) {
        return {
          valid: false,
          message: 'Product code must be maximum 20 characters'
        };
      }

      // Uniqueness validation
      const whereCondition: any = { prd_code: prdCode };
      if (excludeId) {
        whereCondition.pkid = { [Op.ne]: excludeId };
      }

      const existingProduct = await ProductParameter.findOne({ where: whereCondition });

      if (existingProduct) {
        return {
          valid: false,
          message: `Product code '${prdCode}' already exists`
        };
      }

      return { valid: true };

    } catch (error) {
      console.error('❌ [PROD-003] Error validating product code:', error);
      return {
        valid: false,
        message: 'Error validating product code'
      };
    }
  }

  /**
   * Health check for product parameter service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    connection: boolean;
    total_records: number;
    last_updated?: Date;
  }> {
    try {
      console.log('🏥 [PROD-003] Product parameter service health check');

      // Test database connection
      await frs9Sequelize.authenticate();

      // Test table access
      const count = await ProductParameter.count();

      // Get last updated record
      const lastRecord = await ProductParameter.findOne({
        where: { updateddate: { [Op.not]: null } },
        order: [['updateddate', 'DESC']],
        attributes: ['updateddate']
      });

      return {
        status: 'healthy',
        connection: true,
        total_records: count,
        last_updated: lastRecord?.updateddate
      };

    } catch (error) {
      console.error('❌ [PROD-003] Health check failed:', error);
      return {
        status: 'unhealthy',
        connection: false,
        total_records: 0
      };
    }
  }
}

// Export service instance
export const productParameterService = new ProductParameterService();

console.log('✅ [PROD-003] ProductParameterService loaded - Business logic layer operational');