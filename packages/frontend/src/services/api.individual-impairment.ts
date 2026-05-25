// packages/frontend/src/services/api.individual-impairment.ts
// ============================================================================
// IFRS9 INDIVIDUAL IMPAIRMENT ASSESSMENT OVERRIDE API SERVICE
// ============================================================================
// Purpose: Individual account impairment assessment and DCF analysis
// API Endpoints:
// - /banking/individual/assessment uses legacy /api/v1/banking/individual/impairment/*
// - /banking/individual/assessment-new uses /api/v2/individual-impairment/*
// Database Integration: FRS9PRO database with real-time calculations
// ============================================================================

import { individualImpairmentScopedClient as apiClient } from './api/individual-impairment-scoped-client';

// ============================================================================
// TYPESCRIPT INTERFACES FOR INDIVIDUAL IMPAIRMENT
// ============================================================================

export interface IndividualImpairmentWatchlistItem {
  pkid: number;
  ia_id?: number;
  prc_date: string;
  eff_date: string;
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
  outstanding_balance: number;
  provision_amount: number;
  ecl_amount: number;
  stage: number;
  last_review_date: string;
  next_review_date: string;
  assigned_analyst: string;
  assessment_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notes?: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
  is_override?: boolean;
}

export interface IndividualImpairmentAssessment {
  pkid: number;
  ia_id?: number;
  account_id: number;
  account_number: string;
  cif_number: string;
  cif_name: string;
  prc_date: string;
  eff_date: string;
  currency: string;
  outstanding_balance: number;
  interest_rate: number;
  eff_interest_rate: number;
  dpd: number;
  collectability: number;
  rating_code: string;
  impaired_flag: 'I' | 'N';
  method: string;
  stage: number;
  previous_stage: number;
  impairment_reason: string;
  assessment_basis: string;
  supporting_documents: string[];
  analyst_comments: string;
  reviewer_comments?: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';
  approved_by?: string;
  approved_date?: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
}

export interface DCFData {
  account_id: number;
  account_number: string;
  cif_number: string;
  outstanding_balance: number;
  interest_rate: number;
  currency: string;
  payment_schedule: PaymentScheduleItem[];
  discount_rate: number;
  recovery_rate: number;
  prepayment_rate: number;
  lgd_rate: number;
  pd_rate: number;
  effective_date: string;
  maturity_date: string;
  scenario: 'BASE' | 'OPTIMISTIC' | 'PESSIMISTIC' | 'CUSTOM';
  assumptions: DCFAssumptions;
}

export interface PaymentScheduleItem {
  period: number;
  payment_date: string;
  scheduled_payment: number;
  expected_payment: number;
  probability_of_payment: number;
  discount_factor: number;
  present_value: number;
}

export interface DCFAssumptions {
  discount_rate: number;
  recovery_rate: number;
  prepayment_rate: number;
  lgd_rate: number;
  pd_rate: number;
  macro_adjustments: MacroAdjustments;
  custom_adjustments: Record<string, any>;
}

export interface MacroAdjustments {
  gdp_growth: number;
  unemployment_rate: number;
  inflation_rate: number;
  industry_outlook: string;
  regional_factors: Record<string, any>;
}

export interface DCFResult {
  account_id: number;
  scenario: string;
  calculation_date: string;
  outstanding_balance: number;
  present_value_cash_flows: number;
  expected_credit_loss: number;
  lifetime_ecl: number;
  twelve_month_ecl: number;
  best_estimate_ecl: number;
  pd_rate: number;
  lgd_rate: number;
  ead_rate: number;
  risk_adjusted_return: number;
  sensitivity_analysis: SensitivityAnalysis;
  calculation_breakdown: CalculationBreakdown;
}

export interface SensitivityAnalysis {
  discount_rate_impact: number;
  recovery_rate_impact: number;
  prepayment_rate_impact: number;
  lgd_rate_impact: number;
  pd_rate_impact: number;
  macro_factor_impact: number;
}

export interface CalculationBreakdown {
  undiscounted_cash_flows: number;
  discount_factor_total: number;
  expected_recovery: number;
  expected_loss: number;
  provision_required: number;
  coverage_ratio: number;
}

export interface ImpairmentTrigger {
  pkid: number;
  account_id: number;
  trigger_type: string;
  trigger_condition: string;
  threshold_value: number;
  current_value: number;
  trigger_status: 'ACTIVE' | 'INACTIVE' | 'MONITORING';
  trigger_date: string;
  last_checked: string;
  next_check: string;
  severity_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actions_required: string[];
  responsible_party: string;
  notes?: string;
}

export interface ImpairmentScenario {
  pkid: number;
  scenario_name: string;
  scenario_type: 'BASE' | 'STRESS' | 'REVERSE_STRESS' | 'CUSTOM';
  description: string;
  assumptions: ScenarioAssumptions;
  affected_accounts: number;
  created_by: string;
  created_date: string;
  is_active: boolean;
  last_run?: string;
  results?: ScenarioResults;
}

export interface ScenarioAssumptions {
  macro_economic: MacroAdjustments;
  portfolio_specific: PortfolioAssumptions;
  custom_parameters: Record<string, any>;
}

export interface PortfolioAssumptions {
  sector_adjustments: Record<string, number>;
  geographic_adjustments: Record<string, number>;
  product_type_adjustments: Record<string, number>;
  credit_quality_adjustments: Record<string, number>;
}

export interface ScenarioResults {
  total_exposure: number;
  total_ecl_base: number;
  total_ecl_scenario: number;
  ecl_impact: number;
  provision_increase: number;
  affected_accounts_count: number;
  high_risk_accounts: number;
  summary_metrics: Record<string, number>;
}

export interface ProvisionCalculation {
  account_id: number;
  provision_type: 'INDIVIDUAL' | 'COLLECTIVE';
  calculation_method: 'STANDARD' | 'ADVANCED' | 'SIMPLIFIED';
  provision_amount: number;
  previous_provision: number;
  provision_change: number;
  provision_ratio: number;
  coverage_ratio: number;
  effective_date: string;
  currency: string;
  stage: number;
  pd_rate: number;
  lgd_rate: number;
  ead_rate: number;
  calculated_ecl: number;
  regulatory_adjustments: RegulatoryAdjustments;
}

export interface RegulatoryAdjustments {
  floor_adjustment: number;
  ceiling_adjustment: number;
  transitional_adjustment: number;
  other_adjustments: Record<string, number>;
}

export interface ImpairmentReport {
  report_id: string;
  report_type: 'INDIVIDUAL_ASSESSMENT' | 'PORTFOLIO_SUMMARY' | 'REGULATORY' | 'MANAGEMENT';
  generation_date: string;
  period_start: string;
  period_end: string;
  currency: string;
  summary_data: ReportSummary;
  detailed_data: ReportDetails;
  recommendations: string[];
  generated_by: string;
  file_path?: string;
}

export interface ReportSummary {
  total_accounts: number;
  total_exposure: number;
  impaired_accounts: number;
  impaired_exposure: number;
  total_provision: number;
  provision_coverage: number;
  stage_distribution: Record<number, number>;
  industry_breakdown: Record<string, number>;
  risk_rating_distribution: Record<string, number>;
}

export interface ReportDetails {
  account_details: IndividualImpairmentWatchlistItem[];
  dcf_calculations: DCFResult[];
  scenario_analysis: ScenarioResults[];
  provision_calculations: ProvisionCalculation[];
  trend_analysis: TrendData[];
}

export interface TrendData {
  period: string;
  impaired_count: number;
  impaired_amount: number;
  provision_amount: number;
  coverage_ratio: number;
  stage_1_count: number;
  stage_2_count: number;
  stage_3_count: number;
}

export interface HistoryParams {
  entityType?: string;
  limit?: number;
  offset?: number;
}

export interface IADcfResultHeader {
  pkid: number;
  iaId: number | null;
  prcDate: string | null;
  effectiveDate: string | null;
  accountId: number | null;
  accountNumber: string;
  cifNumber: string;
  cifName: string;
  currency: string;
  dpd: number;
  collectability: number;
  ratingCode: string;
  interestRate: number;
  effInterestRate: number;
  outstanding: number;
  accruedInterest: number;
  carryingAmt: number;
  eadAmt: number;
  pvDcfAmt: number;
  eclIaAmt: number;
  createdby: string;
  createddate: string | null;
}

export interface IADcfResultDetailRow {
  pkid: number;
  iaId: number | null;
  prcDate: string | null;
  accountId: number | null;
  mob: number;
  periode: string | null;
  principal: number;
  interest: number;
  installment: number;
  collateral: number;
  poRate1: number;
  rrRate1: number;
  default1: number;
  poRate2: number;
  rrRate2: number;
  default2: number;
  poRate3: number;
  rrRate3: number;
  default3: number;
  pwAmt: number;
  discountFactor: number;
  pvAmt: number;
  beginningBalance: number;
  eirAmt: number;
  endingBalance: number;
}

export interface IADcfResultDetail {
  header: IADcfResultHeader | null;
  details: IADcfResultDetailRow[];
}

// ============================================================================
// INDIVIDUAL IMPAIRMENT API SERVICE
// ============================================================================

export const individualImpairmentAPI = {
  // Watchlist Management
  watchlist: {
    // Get watchlist summary
    getSummary: async (date?: string, mode?: string) => {
        console.log('📊 Fetching watchlist summary');
        const response = await apiClient.get('/banking/individual/impairment/watchlist/summary', { params: { date, mode } });
        return response.data;
    },

    // Get individual impairment watchlist with pagination and filtering
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      filter?: {
        stage?: number;
        impaired_flag?: 'I' | 'N';
        assessment_status?: string;
        priority_level?: string;
        rating_code?: string;
        dpd_range?: { min?: number; max?: number };
        balance_range?: { min?: number; max?: number };
        date_range?: { start?: string; end?: string };
        dateFrom?: string;
        dateTo?: string;
        analyst?: string;
        mode?: string;
      };
      sort?: {
        field?: string;
        order?: 'asc' | 'desc';
      };
    }) => {
      console.log('🔍 Fetching Individual Impairment watchlist from FRS9PRO database', params);
      const { mode: _mode, ...filterWithoutMode } = params?.filter ?? {};
      const response = await apiClient.get('/banking/individual/impairment/watchlist', {
        params: {
          ...params,
          filter: filterWithoutMode,
        },
      });
      return response.data;
    },

    // Get specific account details for impairment assessment
    getById: async (accountId: number) => {
      console.log(`📄 Fetching Individual Impairment details for account ${accountId}`);
      const response = await apiClient.get(`/banking/individual/impairment/${accountId}`);
      return response.data;
    },

    // Export watchlist to Excel/CSV/PDF
    export: async (format: 'xlsx' | 'csv' | 'pdf', filters?: any, options?: {
      fileName?: string;
      title?: string;
      columns?: string[];
      includeFilters?: boolean;
    }) => {
      console.log(`📤 Exporting Individual Impairment watchlist as ${format}`);

      try {
        // Make request with blob response type
        const response = await apiClient.post('/banking/individual/impairment/watchlist/export', {
          format,
          filters,
          options
        }, {
          responseType: 'blob'
        });

        // Create blob from response
        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream'
        });

        // Get filename from response headers or use provided one
        let filename = options?.fileName;
        if (!filename) {
          const contentDisposition = response.headers['content-disposition'];
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
        }

        // Fallback filename
        if (!filename) {
          const timestamp = new Date().toISOString().split('T')[0];
          filename = `watchlist-${timestamp}.${format}`;
        }

        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        console.log(`✅ Export completed: ${filename}`);

        return {
          success: true,
          fileName: filename,
          recordCount: parseInt(response.headers['x-export-records'] || '0'),
          message: 'Export completed successfully',
          download_url: url
        };
      } catch (error: any) {
        console.error('❌ Export failed:', error);

        // If error response is blob, convert to JSON for error message
        if (error.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || 'Export failed');
          } catch {
            throw new Error('Export failed: Unable to process response');
          }
        }

        throw error;
      }
    },

    // Remove account from watchlist
    remove: async (id: string, mode?: string) => {
      console.log(`🗑️ Removing account ${id} from Individual Impairment watchlist`, { mode });
      const response = await apiClient.delete(`/banking/individual/impairment/watchlist/${id}`, { params: { mode } });
      return response.data;
    }
  },

  // Assessment Management
  assessment: {
    // Get impairment assessment data for an account
    get: async (accountId: number) => {
      console.log(`📊 Fetching impairment assessment for account ${accountId}`);
      const response = await apiClient.get(`/banking/individual/impairment/${accountId}`);
      return response.data;
    },

    // Create or update impairment assessment
    create: async (assessmentData: Partial<IndividualImpairmentAssessment>) => {
      console.log('➕ Creating impairment assessment');
      const response = await apiClient.post('/banking/individual/impairment/assessment', assessmentData);
      return response.data;
    },

    // Update impairment assessment
    update: async (id: number, assessmentData: Partial<IndividualImpairmentAssessment>) => {
      console.log(`✏️ Updating impairment assessment ${id}`);
      const response = await apiClient.put(`/banking/individual/impairment/assessment/${id}`, assessmentData);
      return response.data;
    },

    // Get assessment history for an account
    getHistory: async (accountId: number) => {
      console.log(`📜 Fetching assessment history for account ${accountId}`);
      const response = await apiClient.get(`/banking/individual/impairment/assessment/${accountId}/history`);
      return response.data;
    },

    // Submit assessment for approval
    submit: async (id: number, comments?: string) => {
      console.log(`📤 Submitting assessment ${id} for approval`);
      const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/submit`, {
        comments
      });
      return response.data;
    },

    // Approve assessment
    approve: async (id: number, comments?: string) => {
      console.log(`✅ Approving assessment ${id}`);
      const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/approve`, {
        comments
      });
      return response.data;
    },

    // Reject assessment
    reject: async (id: number, reason: string) => {
      console.log(`❌ Rejecting assessment ${id}`);
      const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/reject`, {
        reason
      });
      return response.data;
    },

    // Reset assessment
    reset: async (id: number) => {
      console.log(`🔄 Resetting assessment ${id}`);
      const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/reset`);
      return response.data;
    }
  },

  // DCF Analysis
  dcf: {
    // Get DCF analysis data for an account
    getData: async (accountId: number, params?: {
      scenario?: string;
      effective_date?: string;
      include_historical?: boolean;
    }) => {
      console.log(`📈 Fetching DCF analysis data for account ${accountId}`);
      const response = await apiClient.get(`/banking/individual/impairment/dcf/${accountId}`, { params });
      return response.data;
    },

    // Calculate DCF present value and ECL
    calculate: async (accountId: number, dcfPayload: any) => {
      console.log(`🧮 Calculating DCF for account ${accountId}`, dcfPayload);
      // Send payload directly - already formatted by page.tsx
      const response = await apiClient.post(`/banking/individual/impairment/dcf/calculate`, dcfPayload);
      return response.data;
    },

    // Run DCF scenario analysis
    runScenarioAnalysis: async (accountId: number, scenarios: string[]) => {
      console.log(`🎭 Running DCF scenario analysis for account ${accountId}`);
      const response = await apiClient.post(`/banking/individual/impairment/dcf/scenario-analysis`, {
        account_id: accountId,
        scenarios
      });
      return response.data;
    },

    // Compare DCF results across scenarios
    compareScenarios: async (accountId: number, scenarios: string[]) => {
      console.log(`📊 Comparing DCF scenarios for account ${accountId}`);
      const response = await apiClient.post(`/banking/individual/impairment/dcf/compare-scenarios`, {
        account_id: accountId,
        scenarios
      });
      return response.data;
    }
  },

  // Batch Upload Support
  getDcfUploads: async () => {
    const response = await apiClient.get('/banking/individual/impairment/dcf-uploads');
    return response.data;
  },
  getDcfCashflows: async (uploadId: string) => {
    const response = await apiClient.get(`/banking/individual/impairment/dcf-uploads/${uploadId}/cashflows`);
    return response.data;
  },
  createBatchUpload: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/dcf-uploads', data);
    return response.data;
  },
  getDcfCalculations: async () => {
    const response = await apiClient.get('/banking/individual/impairment/dcf-calculations');
    return response.data;
  },
  getIaResultDetail: async (params: { accountId?: number | string; accountNumber?: string }) => {
    const response = await apiClient.get('/banking/individual/impairment/ia-results/detail', { params });
    return response.data;
  },

  // History / Audit Trail
  getHistory: async (params: HistoryParams) => {
    console.log('📜 Fetching individual impairment history', params);
    const response = await apiClient.get('/banking/individual/impairment/history', { params });
    return response.data;
  },

  // Standardized Flat Methods
  getWatchlist: async (params?: { segment?: string; status?: string }) => {
    const response = await apiClient.get('/banking/individual/impairment/watchlist', { params });
    return response.data;
  },
  addToWatchlist: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/watchlist', data);
    return response.data;
  },
  removeFromWatchlist: async (id: string, mode?: string) => {
    return individualImpairmentAPI.watchlist.remove(id, mode);
  },

  getOverrides: async (params?: { status?: string }) => {
    const response = await apiClient.get('/banking/individual/impairment/overrides', { params });
    return response.data;
  },
  createOverride: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/overrides', data);
    return response.data;
  },
  getScenarios: async (params?: { status?: string; accountId?: number }) => {
    const response = await apiClient.get('/banking/individual/impairment/scenarios', { params });
    return response.data;
  },
  createScenario: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/scenarios', data);
    return response.data;
  },
  updateScenarioStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/banking/individual/impairment/scenarios/${id}/status`, { status });
    return response.data;
  },

  // Provision Calculation
  provision: {
    // Get provision calculation results
    get: async (accountId: number, params?: {
      calculation_method?: string;
      effective_date?: string;
      include_regulatory?: boolean;
    }) => {
      console.log(`💰 Fetching provision calculation for account ${accountId}`);
      const response = await apiClient.get(`/banking/individual/impairment/provision`, {
        params: { account_id: accountId, ...params }
      });
      return response.data;
    },

    // Calculate provision amounts
    calculate: async (accountId: number, params: {
      calculation_method?: string;
      include_regulatory_adjustments?: boolean;
      assumptions?: Partial<DCFAssumptions>;
    }) => {
      console.log(`🧮 Calculating provision for account ${accountId}`);
      const response = await apiClient.post(`/banking/individual/impairment/provision`, {
        account_id: accountId,
        ...params
      });
      return response.data;
    },

    // Get provision recommendations
    getRecommendations: async (accountId: number) => {
      console.log(`💡 Getting provision recommendations for account ${accountId}`);
      const response = await apiClient.get(`/banking/individual/impairment/provision/${accountId}/recommendations`);
      return response.data;
    }
  },

  // Impairment Triggers
  triggers: {
    // Get impairment trigger conditions
    get: async (accountId?: number) => {
      console.log(`🚨 Fetching impairment triggers${accountId ? ` for account ${accountId}` : ''}`);
      const response = await apiClient.get('/banking/individual/impairment/trigger', {
        params: accountId ? { account_id: accountId } : {}
      });
      return response.data;
    },

    // Update impairment trigger status
    update: async (triggerId: number, updateData: {
      trigger_status?: 'ACTIVE' | 'INACTIVE' | 'MONITORING';
      current_value?: number;
      notes?: string;
    }) => {
      console.log(`🔄 Updating impairment trigger ${triggerId}`);
      const response = await apiClient.put(`/banking/individual/impairment/trigger/${triggerId}`, updateData);
      return response.data;
    },

    // Check trigger conditions for all accounts
    checkAll: async () => {
      console.log('🔍 Checking impairment triggers for all accounts');
      const response = await apiClient.post('/banking/individual/impairment/trigger/check-all');
      return response.data;
    },

    // Get trigger analytics
    getAnalytics: async (params?: {
      trigger_type?: string;
      severity_level?: string;
      date_range?: { start?: string; end?: string };
    }) => {
      console.log('📊 Getting impairment trigger analytics');
      const response = await apiClient.get('/banking/individual/impairment/trigger/analytics', { params });
      return response.data;
    }
  },

  // Scenario Analysis
  scenario: {
    // Get DCF scenario analysis data
    get: async (scenarioId?: number) => {
      console.log(`🎭 Fetching scenario analysis${scenarioId ? ` ${scenarioId}` : ''}`);
      const response = await apiClient.get('/banking/individual/impairment/scenario', {
        params: scenarioId ? { scenario_id: scenarioId } : {}
      });
      return response.data;
    },

    // Create scenario analysis
    create: async (scenarioData: {
      scenario_name: string;
      scenario_type: string;
      description: string;
      assumptions: ScenarioAssumptions;
      affected_accounts: number[];
    }) => {
      console.log('➕ Creating scenario analysis');
      const response = await apiClient.post('/banking/individual/impairment/scenario', scenarioData);
      return response.data;
    },

    // Update scenario analysis
    update: async (id: number, scenarioData: Partial<ImpairmentScenario>) => {
      console.log(`✏️ Updating scenario analysis ${id}`);
      const response = await apiClient.put(`/banking/individual/impairment/scenario/${id}`, scenarioData);
      return response.data;
    },

    // Run scenario analysis
    run: async (scenarioId: number) => {
      console.log(`🏃 Running scenario analysis ${scenarioId}`);
      const response = await apiClient.post(`/banking/individual/impairment/scenario/${scenarioId}/run`);
      return response.data;
    },

    // Compare scenarios
    compare: async (scenarioIds: number[]) => {
      console.log('📊 Comparing scenarios');
      const response = await apiClient.post('/banking/individual/impairment/scenario/compare', {
        scenario_ids: scenarioIds
      });
      return response.data;
    }
  },

  // Reporting
  reports: {
    // Get all reports with filtering
    getAll: async (params?: any) => {
      console.log('📋 Fetching all Individual Impairment reports');
      const response = await apiClient.get('/banking/individual/impairment/reports', { params });
      return response.data;
    },

    // Generate individual impairment assessment report
    generate: async (reportParams: {
      report_type: string;
      period_start: string;
      period_end: string;
      include_accounts?: number[];
      include_scenarios?: boolean;
      format?: 'PDF' | 'EXCEL' | 'JSON';
    }) => {
      console.log('📋 Generating Individual Impairment report');
      const response = await apiClient.post('/banking/individual/impairment/report', reportParams);
      return response.data;
    },

    // Get report history
    getHistory: async (params?: {
      report_type?: string;
      date_range?: { start?: string; end?: string };
      limit?: number;
    }) => {
      console.log('📜 Getting report history');
      const response = await apiClient.get('/banking/individual/impairment/report/history', { params });
      return response.data;
    },

    // Download report
    download: async (reportId: string) => {
      console.log(`📥 Downloading report ${reportId}`);
      const response = await apiClient.get(`/banking/individual/impairment/report/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    }
  },

  // Document Management
  documents: {
    // Get all documents for an account
    get: async (accountId: number) => {
      const response = await apiClient.get(`/banking/individual/impairment/documents/${accountId}`);
      return response.data;
    },

    // Download a document
    download: async (fileName: string) => {
      const response = await apiClient.get(`/banking/individual/impairment/documents/download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },

    // Upload a document
    upload: async (accountId: number, file: File, metadata?: Record<string, any>) => {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      const response = await apiClient.post(`/banking/individual/impairment/documents/upload/${accountId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
  },

  // Get assessment summary statistics
    getAssessmentSummary: async (date?: string) => {
    console.log('📊 Fetching assessment summary statistics');
    const response = await apiClient.get('/banking/individual/impairment/reports-summary', { params: { date } });
    return response.data;
  },

  // Health Check
  health: async () => {
    console.log('🏥 Checking Individual Impairment service health');
    const response = await apiClient.get('/banking/individual/impairment/health');
    return response.data;
  }
};

// ============================================================================
// HELPER FUNCTIONS FOR INDIVIDUAL IMPAIRMENT
// ============================================================================

export const individualImpairmentHelpers = {
  // Format currency values
  formatCurrency: (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Calculate impairment ratio
  calculateImpairmentRatio: (impairedAmount: number, totalAmount: number) => {
    if (totalAmount === 0) return 0;
    return (impairedAmount / totalAmount) * 100;
  },

  // Determine stage color
  getStageColor: (stage: number) => {
    switch (stage) {
      case 1: return '#4caf50'; // Green
      case 2: return '#ff9800'; // Orange
      case 3: return '#f44336'; // Red
      default: return '#757575'; // Grey
    }
  },

  // Get priority level color
  getPriorityColor: (priority: string) => {
    switch (priority) {
      case 'LOW': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'HIGH': return '#ff5722';
      case 'CRITICAL': return '#f44336';
      default: return '#757575';
    }
  },

  // Validate DCF assumptions
  validateDCFAssumptions: (assumptions: Partial<DCFAssumptions>) => {
    const errors: string[] = [];

    if (assumptions.discount_rate !== undefined && (assumptions.discount_rate < 0 || assumptions.discount_rate > 1)) {
      errors.push('Discount rate must be between 0 and 1');
    }

    if (assumptions.recovery_rate !== undefined && (assumptions.recovery_rate < 0 || assumptions.recovery_rate > 1)) {
      errors.push('Recovery rate must be between 0 and 1');
    }

    if (assumptions.prepayment_rate !== undefined && (assumptions.prepayment_rate < 0 || assumptions.prepayment_rate > 1)) {
      errors.push('Prepayment rate must be between 0 and 1');
    }

    if (assumptions.lgd_rate !== undefined && (assumptions.lgd_rate < 0 || assumptions.lgd_rate > 1)) {
      errors.push('LGD rate must be between 0 and 1');
    }

    if (assumptions.pd_rate !== undefined && (assumptions.pd_rate < 0 || assumptions.pd_rate > 1)) {
      errors.push('PD rate must be between 0 and 1');
    }

    return errors;
  },

  // Generate DCF calculation summary
  generateDCFSummary: (result: DCFResult) => {
    return {
      account_id: result.account_id,
      scenario: result.scenario,
      outstanding_balance: individualImpairmentHelpers.formatCurrency(result.outstanding_balance),
      present_value: individualImpairmentHelpers.formatCurrency(result.present_value_cash_flows),
      expected_credit_loss: individualImpairmentHelpers.formatCurrency(result.expected_credit_loss),
      lifetime_ecl: individualImpairmentHelpers.formatCurrency(result.lifetime_ecl),
      twelve_month_ecl: individualImpairmentHelpers.formatCurrency(result.twelve_month_ecl),
      coverage_ratio: `${(result.calculation_breakdown.coverage_ratio * 100).toFixed(2)}%`,
      risk_adjusted_return: individualImpairmentHelpers.formatCurrency(result.risk_adjusted_return)
    };
  }
};

export default individualImpairmentAPI;
