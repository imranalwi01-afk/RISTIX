// packages/backend/src/core/services/individual-impairment.service.ts
// ============================================================================
// 🔧 INDIVIDUAL IMPAIRMENT ASSESSMENT OVERRIDE SERVICE
// ============================================================================
// ✅ PATTERN: Multi-table service with DCF analysis integration
// ✅ DATABASE: frs9_imp_ia_* tables with comprehensive calculations
// ✅ FEATURES: Individual account assessment, scenario analysis, DCF calculations
// ============================================================================

import { Pool } from 'pg';
import { AuditService } from './audit.service';
import { databaseConfig } from '../database/config/database.config';

// ============================================================================
// INTERFACES
// ============================================================================

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  filter?: {
    impairedFlag?: 'I' | 'N' | 'ALL';
    ratingCode?: string;
    dpdFrom?: number;
    dpdTo?: number;
    dateFrom?: string;
    dateTo?: string;
  };
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface IndividualImpairmentHeaderCreateData {
  prc_date: Date;
  eff_date: Date;
  cif_number: string;
  cif_name: string;
  account_id: number;
  account_number: string;
  currency: string;
  eff_interest_rate: number;
  interest_rate: number;
  dpd: number;
  collectability: number;
  rating_code: string;
  impaired_flag: 'I' | 'N';
  method: string;
  plafond: number;
  outstanding: number;
  accrued_interest: number;
  carrying_amt: number;
  ead_amt: number;
  scenario_id: number;
  n_of_scenario: number;
  po_rate_1?: number;
  po_rate_2?: number;
  po_rate_3?: number;
  sc_name_1?: string;
  sc_name_2?: string;
  sc_name_3?: string;
  trigger_remarks?: string;
}

interface IndividualImpairmentDetailCreateData {
  ia_id: number;
  account_id: number;
  eff_interest_rate?: number;
  mob?: number;
  periode?: Date;
  principal?: number;
  interest?: number;
  installment?: number;
  collateral?: number;
  po_rate_1?: number;
  po_rate_2?: number;
  po_rate_3?: number;
  rr_rate_1?: number;
  rr_rate_2?: number;
  rr_rate_3?: number;
  default_1?: number;
  default_2?: number;
  default_3?: number;
  pw_amt?: number;
  discount_factor?: number;
  pv_amt?: number;
  eir_amt?: number;
  beginning_balance?: number;
  ending_balance?: number;
}

interface DCFData {
  account_id: number;
  cash_flows: Array<{
    periode: Date;
    principal: number;
    interest: number;
    collateral: number;
  }>;
  scenario_data: {
    scenario_id: number;
    scenario_name: string;
    pd_rates: number[];
    recovery_rates: number[];
  };
}

interface DCFResult {
  total_pv: number;
  total_ecl: number;
  pv_dcf_amount: number;
  ecl_ia_amount: number;
  weighted_default_rate: number;
  weighted_recovery_rate: number;
}

// ============================================================================
// INDIVIDUAL IMPAIRMENT SERVICE CLASS
// ============================================================================

export class IndividualImpairmentService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
    console.log('✅ [II-SERVICE-INIT] IndividualImpairmentService initialized with real FRS9 database integration');
  }

  // Get FRS9 database connection
  private getFRS9Database(): Pool {
    return databaseConfig.getFRS9Connection();
  }

  // ============================================================================
  // HEADER OPERATIONS (WATCHLIST) - REAL DATABASE IMPLEMENTATION
  // ============================================================================

  /**
   * Get all individual impairment headers with pagination and filtering
   */
  async getWatchlist(options: PaginationOptions): Promise<PaginatedResult<any>> {
    const client = this.getFRS9Database();

    try {
      console.log('📋 [II-SERVICE-001] Getting individual impairment watchlist:', options);

      const { page, limit, search, filter } = options;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE h.status = 1';
      let searchParams: any[] = [];
      let paramIndex = 1;

      if (search) {
        whereClause += ` AND (h.cif_number ILIKE $${paramIndex} OR h.cif_name ILIKE $${paramIndex} OR h.account_number ILIKE $${paramIndex})`;
        searchParams.push(`%${search}%`);
        paramIndex++;
      }

      if (filter) {
        if (filter.impairedFlag && filter.impairedFlag !== 'ALL') {
          whereClause += ` AND h.impaired_flag = $${paramIndex}`;
          searchParams.push(filter.impairedFlag);
          paramIndex++;
        }

        if (filter.ratingCode) {
          whereClause += ` AND h.rating_code = $${paramIndex}`;
          searchParams.push(filter.ratingCode);
          paramIndex++;
        }

        if (filter.dpdFrom !== undefined) {
          whereClause += ` AND h.dpd >= $${paramIndex}`;
          searchParams.push(filter.dpdFrom);
          paramIndex++;
        }

        if (filter.dpdTo !== undefined) {
          whereClause += ` AND h.dpd <= $${paramIndex}`;
          searchParams.push(filter.dpdTo);
          paramIndex++;
        }

        if (filter.dateFrom) {
          whereClause += ` AND h.prc_date >= $${paramIndex}`;
          searchParams.push(filter.dateFrom);
          paramIndex++;
        }

        if (filter.dateTo) {
          whereClause += ` AND h.prc_date <= $${paramIndex}`;
          searchParams.push(filter.dateTo);
          paramIndex++;
        }
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM frs9_imp_ia_header h
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, searchParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT
          h.pkid as id,
          h.ia_id,
          h.prc_date,
          h.eff_date,
          h.cif_number,
          h.cif_name,
          h.account_id,
          h.account_number,
          h.currency,
          h.outstanding,
          h.ecl_ia_amt,
          h.rating_code,
          h.dpd,
          h.impaired_flag,
          h.method,
          h.status,
          h.createdby,
          h.createddate,
          h.updatedby,
          h.updateddate
        FROM frs9_imp_ia_header h
        ${whereClause}
        ORDER BY h.prc_date DESC, h.account_number ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const dataParams = [...searchParams, limit, offset];
      const dataResult = await client.query(dataQuery, dataParams);

      const totalPages = Math.ceil(total / limit);

      console.log(`✅ [II-SERVICE-001] Retrieved ${dataResult.rows.length} watchlist items`);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };

    } catch (error) {
      console.error('❌ [II-SERVICE-001] Error getting watchlist:', error);
      throw error;
    }
  }

  /**
   * Get single individual impairment header by ID
   */
  async getHeaderById(headerId: number): Promise<any> {
    const client = this.getFRS9Database();

    try {
      console.log(`📋 [II-SERVICE-002] Getting individual impairment header ID: ${headerId}`);

      const query = `
        SELECT
          h.pkid as id,
          h.ia_id,
          h.prc_date,
          h.eff_date,
          h.cif_number,
          h.cif_name,
          h.account_id,
          h.account_number,
          h.currency,
          h.eff_interest_rate,
          h.interest_rate,
          h.dpd,
          h.collectability,
          h.rating_code,
          h.impaired_flag,
          h.method,
          h.plafond,
          h.outstanding,
          h.accrued_interest,
          h.carrying_amt,
          h.ead_amt,
          h.pv_dcf_amt,
          h.ecl_ia_amt,
          h.scenario_id,
          h.n_of_scenario,
          h.po_rate_1,
          h.po_rate_2,
          h.po_rate_3,
          h.sc_name_1,
          h.sc_name_2,
          h.sc_name_3,
          h.status,
          h.trigger_remarks,
          h.createdby,
          h.createddate,
          h.createdhost,
          h.updatedby,
          h.updateddate,
          h.updatedhost,
          h.reviewedby,
          h.revieweddate,
          h.reviewedhost
        FROM frs9_imp_ia_header h
        WHERE h.pkid = $1
      `;

      const result = await client.query(query, [headerId]);

      if (result.rows.length === 0) {
        throw new Error(`Individual impairment header not found: ${headerId}`);
      }

      return result.rows[0];

    } catch (error) {
      console.error(`❌ [II-SERVICE-002] Header not found: ${headerId}`);
      throw error;
    }
  }

  /**
   * Update individual impairment header
   */
  async updateHeader(
    headerId: number,
    data: Partial<IndividualImpairmentHeaderCreateData>,
    updatedBy: string,
    updatedHost?: string
  ): Promise<any> {
    const client = this.getFRS9Database();

    try {
      console.log(`📋 [II-SERVICE-003] Updating individual impairment header ${headerId}`);

      // Build dynamic update query
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.impaired_flag !== undefined) {
        updateFields.push(`impaired_flag = $${paramIndex}`);
        params.push(data.impaired_flag);
        paramIndex++;
      }

      if (data.method !== undefined) {
        updateFields.push(`method = $${paramIndex}`);
        params.push(data.method);
        paramIndex++;
      }

      if (data.trigger_remarks !== undefined) {
        updateFields.push(`trigger_remarks = $${paramIndex}`);
        params.push(data.trigger_remarks);
        paramIndex++;
      }

      if (data.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(data.status);
        paramIndex++;
      }

      // Add audit fields
      updateFields.push(`updatedby = $${paramIndex}`);
      params.push(updatedBy);
      paramIndex++;

      updateFields.push(`updateddate = NOW()`);
      updateFields.push(`updatedhost = $${paramIndex}`);
      params.push(updatedHost || 'system');
      paramIndex++;

      // Add WHERE clause
      params.push(headerId);

      const query = `
        UPDATE frs9_imp_ia_header
        SET ${updateFields.join(', ')}
        WHERE pkid = $${paramIndex}
        RETURNING pkid as id, impaired_flag, method, trigger_remarks, updatedby, updateddate, updatedhost
      `;

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new Error(`Individual impairment header not found: ${headerId}`);
      }

      const updatedHeader = result.rows[0];

      // Log audit
      await this.auditService.log({
        action: 'UPDATE',
        entity: 'IndividualImpairmentHeader',
        entityId: headerId,
        performedBy: updatedBy,
        timestamp: new Date(),
        data: data
      });

      console.log(`✅ [II-SERVICE-003] Updated individual impairment header ${headerId}`);

      return updatedHeader;

    } catch (error) {
      console.error(`❌ [II-SERVICE-003] Error updating header ${headerId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // DETAIL OPERATIONS - REAL DATABASE IMPLEMENTATION
  // ============================================================================

  /**
   * Get all details for an individual impairment header
   */
  async getDetails(headerId: number): Promise<any[]> {
    const client = this.getFRS9Database();

    try {
      console.log(`📋 [II-SERVICE-004] Getting details for individual impairment header ID: ${headerId}`);

      const query = `
        SELECT
          d.pkid as id,
          d.ia_id,
          d.account_id,
          d.eff_interest_rate,
          d.mob,
          d.periode,
          d.principal,
          d.interest,
          d.installment,
          d.collateral,
          d.po_rate_1,
          d.po_rate_2,
          d.po_rate_3,
          d.rr_rate_1,
          d.rr_rate_2,
          d.rr_rate_3,
          d.default_1,
          d.default_2,
          d.default_3,
          d.pw_amt,
          d.discount_factor,
          d.pv_amt,
          d.eir_amt,
          d.beginning_balance,
          d.ending_balance,
          d.createdby,
          d.createddate,
          d.updatedby,
          d.updateddate
        FROM frs9_imp_ia_detail d
        WHERE d.ia_id = (SELECT ia_id FROM frs9_imp_ia_header WHERE pkid = $1)
        ORDER BY d.periode ASC, d.mob ASC
      `;

      const result = await client.query(query, [headerId]);
      console.log(`✅ [II-SERVICE-004] Retrieved ${result.rows.length} detail records`);
      return result.rows;

    } catch (error) {
      console.error(`❌ [II-SERVICE-004] Error getting details for header ${headerId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // DCF ANALYSIS OPERATIONS
  // ============================================================================

  /**
   * Get DCF data for an account
   */
  async getDCFData(accountId: number, prcDate: string): Promise<DCFData> {
    const client = this.getFRS9Database();

    try {
      console.log(`📋 [II-SERVICE-005] Getting DCF data for account ${accountId}, date ${prcDate}`);

      // Get cash flows
      const cashFlowQuery = `
        SELECT
          periode,
          COALESCE(principal, 0) as principal,
          COALESCE(interest, 0) as interest,
          COALESCE(collateral, 0) as collateral
        FROM frs9_imp_ia_dcf
        WHERE account_id = $1
        AND status = 'A'
        ORDER BY periode ASC
      `;

      const cashFlowResult = await client.query(cashFlowQuery, [accountId]);

      // Get scenario data from recovery rate table
      const scenarioQuery = `
        SELECT DISTINCT
          scenario_id,
          scenario_name,
          recovery_rate
        FROM frs9_imp_ia_rr
        WHERE effective_from <= $1
        AND (effective_to IS NULL OR effective_to >= $1)
        AND status = 'A'
        ORDER BY scenario_id
      `;

      const scenarioResult = await client.query(scenarioQuery, [prcDate]);

      // Build scenario data with PD rates (using default values for demo)
      const scenarioData = {
        scenario_id: 1,
        scenario_name: 'Base Scenario',
        pd_rates: [0.02, 0.03, 0.04], // Default PD rates
        recovery_rates: scenarioResult.rows.map(r => r.recovery_rate)
      };

      const dcfData: DCFData = {
        account_id: accountId,
        cash_flows: cashFlowResult.rows,
        scenario_data: scenarioData
      };

      console.log(`✅ [II-SERVICE-005] Retrieved DCF data for account ${accountId}`);
      return dcfData;

    } catch (error) {
      console.error(`❌ [II-SERVICE-005] Error getting DCF data for account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate DCF results
   */
  async calculateDCF(dcfData: DCFData): Promise<DCFResult> {
    try {
      console.log(`📋 [II-SERVICE-006] Calculating DCF for account ${dcfData.account_id}`);

      let totalPV = 0;
      let totalECL = 0;
      let principalSum = 0;
      let interestSum = 0;

      // Calculate present value of cash flows
      dcfData.cash_flows.forEach((cf, index) => {
        const period = index + 1;
        const discountFactor = 1 / Math.pow(1 + 0.08, period / 12); // 8% discount rate
        const cfPV = (cf.principal + cf.interest + cf.collateral) * discountFactor;

        totalPV += cfPV;
        principalSum += cf.principal;
        interestSum += cf.interest;
      });

      // Calculate ECL using PD rates and recovery rates
      const pdRate = dcfData.scenario_data.pd_rates[0]; // Use first PD rate
      const recoveryRate = dcfData.scenario_data.recovery_rates[0] || 0.6; // Use first recovery rate or default

      const lgdRate = 1 - recoveryRate;
      totalECL = totalPV * pdRate * lgdRate;

      const result: DCFResult = {
        total_pv: totalPV,
        total_ecl: totalECL,
        pv_dcf_amount: totalPV,
        ecl_ia_amount: totalECL,
        weighted_default_rate: pdRate,
        weighted_recovery_rate: recoveryRate
      };

      console.log(`✅ [II-SERVICE-006] DCF calculation completed for account ${dcfData.account_id}`);
      return result;

    } catch (error) {
      console.error(`❌ [II-SERVICE-006] Error calculating DCF:`, error);
      throw error;
    }
  }

  // ============================================================================
  // REPORT OPERATIONS
  // ============================================================================

  /**
   * Get assessment report data
   */
  async getAssessmentReport(options: PaginationOptions): Promise<PaginatedResult<any>> {
    const client = this.getFRS9Database();

    try {
      console.log('📋 [II-SERVICE-007] Getting assessment report data:', options);

      const { page, limit, search, filter } = options;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE h.status = 1';
      let searchParams: any[] = [];
      let paramIndex = 1;

      if (search) {
        whereClause += ` AND (h.cif_name ILIKE $${paramIndex} OR h.account_number ILIKE $${paramIndex})`;
        searchParams.push(`%${search}%`);
        paramIndex++;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM frs9_imp_ia_header h
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, searchParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated report data
      const dataQuery = `
        SELECT
          h.pkid as id,
          h.ia_id,
          h.prc_date,
          h.cif_number,
          h.cif_name,
          h.account_number,
          h.currency,
          h.outstanding,
          h.ecl_ia_amt,
          h.rating_code,
          h.dpd,
          h.impaired_flag,
          h.method,
          h.scenario_id,
          h.po_rate_1,
          h.rr_rate_1,
          h.trigger_remarks,
          h.createdby,
          h.createddate,
          h.updatedby,
          h.updateddate
        FROM frs9_imp_ia_header h
        ${whereClause}
        ORDER BY h.prc_date DESC, h.cif_name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const dataParams = [...searchParams, limit, offset];
      const dataResult = await client.query(dataQuery, dataParams);

      const totalPages = Math.ceil(total / limit);

      console.log(`✅ [II-SERVICE-007] Retrieved ${dataResult.rows.length} assessment report records`);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };

    } catch (error) {
      console.error('❌ [II-SERVICE-007] Error getting assessment report:', error);
      throw error;
    }
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate impairment flag
   */
  validateImpairedFlag(flag: string): boolean {
    return flag === 'I' || flag === 'N';
  }

  /**
   * Validate assessment method
   */
  validateAssessmentMethod(method: string): boolean {
    const validMethods = ['INDIVIDUAL', 'COLLLECTIVE', 'HYBRID', 'STAGE_1', 'STAGE_2', 'STAGE_3'];
    return validMethods.includes(method.toUpperCase());
  }

  /**
   * Validate rating code
   */
  validateRatingCode(ratingCode: string): boolean {
    const validRatings = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC', 'CC', 'C', 'D'];
    return validRatings.includes(ratingCode.toUpperCase());
  }
}