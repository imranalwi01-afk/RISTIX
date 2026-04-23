'use client';

import api from '@/services/api';
import type {
  BaseIfrs9ReportProps,
  ReportFilters,
  ReportResponse,
} from '@/components/ifrs9/BaseIfrs9Report';
import type { EnterpriseTableQueryParams } from '@/types/enterprise-table';

function formatLocalDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export type Ifrs9ReportQueryInput = {
  reportType: BaseIfrs9ReportProps['reportType'];
  filters: ReportFilters;
  requiredParams: string[];
  supportsPagination: boolean;
  queryParams: EnterpriseTableQueryParams;
  deferredSearchTerm: string;
};

export function buildIfrs9ReportRequestParams(input: Ifrs9ReportQueryInput) {
  const { filters, supportsPagination, queryParams, deferredSearchTerm } = input;
  const serverQueryParams = supportsPagination ? {
    ...queryParams,
    search: deferredSearchTerm.trim() || undefined,
  } : {};

  return {
    prc_date: formatLocalDate(filters.prc_date!),
    pd_config_id: filters.pd_config_id,
    pd_method: filters.pd_method,
    scalar_id: filters.scalar_id,
    lgd_config_id: filters.lgd_config_id,
    lgd_method: filters.lgd_method,
    model_id: filters.model_id,
    ead_config_id: filters.ead_config_id,
    segment_id: Number.isFinite(Number(filters.segment_id)) ? filters.segment_id : undefined,
    scenario_id: filters.scenario_id,
    fl_flag: filters.fl_flag,
    branch_code: filters.branch_code,
    group_segment: filters.group_segment,
    page: supportsPagination ? queryParams.page : filters.page,
    limit: supportsPagination ? queryParams.limit : filters.limit,
    stage: Array.isArray(filters.stage)
      ? (filters.stage.length > 0 ? filters.stage.map(String) : undefined)
      : (filters.stage ? String(filters.stage) : undefined),
    ...serverQueryParams,
  };
}

export async function fetchIfrs9Report(input: Ifrs9ReportQueryInput): Promise<ReportResponse> {
  if (!input.filters.prc_date) {
    throw new Error('Processing date is required');
  }

  const params = buildIfrs9ReportRequestParams(input);

  switch (input.reportType) {
    case 'nominative-report':
      return api.banking.ifrs9Reports.nominativeReport.get(params);
    case 'lifetime-pd-yearly':
      return api.banking.ifrs9Reports.lifetimePD.getYearly(params);
    case 'lifetime-pd-monthly':
      return api.banking.ifrs9Reports.lifetimePD.getMonthly(params);
    case 'lifetime-pd-account-details':
      return api.banking.ifrs9Reports.lifetimePD.getAccountDetails(params);
    case 'lifetime-lgd':
      return api.banking.ifrs9Reports.lifetimeLGD.get(params);
    case 'ead-model': {
      const eadData = await api.banking.ifrs9Reports.eadModel.get(params);
      const eadSummary = await api.banking.ifrs9Reports.eadModel.getSummary(params);
      let summaryRow = eadSummary.data?.[0] ?? null;

      const summaryTotalAccounts =
        summaryRow && typeof summaryRow === 'object' && 'totalAccounts' in summaryRow
          ? Number((summaryRow as { totalAccounts?: unknown }).totalAccounts ?? 0)
          : 0;

      if (summaryTotalAccounts === 0) {
        const fallbackSummary = await api.banking.ifrs9Reports.eadModel.getSummary({
          ...params,
          ead_config_id: undefined,
          segment_id: undefined,
        });
        summaryRow = fallbackSummary.data?.[0] ?? summaryRow;
      }

      return {
        ...eadData,
        summary: summaryRow,
      };
    }
    case 'ecl-result':
      return api.banking.ifrs9Reports.eclResult.get(params);
    case 'ecl-movement':
      return api.banking.ifrs9Reports.eclMovement.get(params);
    case 'gca-movement':
      return api.banking.ifrs9Reports.gcaMovement.get(params);
    default:
      throw new Error(`Unknown report type: ${input.reportType}`);
  }
}
