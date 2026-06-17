import axios from 'axios';
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

function toNumeric(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isNotFoundError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeStatus = (error as { status?: unknown; response?: { status?: unknown } }).status;
    const maybeResponseStatus = (error as { response?: { status?: unknown } }).response?.status;
    if (maybeStatus === 404 || maybeResponseStatus === 404) return true;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  return /\bnot found\b/i.test(message);
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
  const { filters, supportsPagination, queryParams, deferredSearchTerm, reportType } = input;
  const shouldSendSegmentId = reportType !== 'ead-model';
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
    segment_id: shouldSendSegmentId && Number.isFinite(Number(filters.segment_id)) ? filters.segment_id : undefined,
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
      {
        const [summaryResult, detailData] = await Promise.all([
          api.banking.ifrs9Reports.lifetimeLGD.getSummary(params)
            .then((response) => ({ response, missing: false }))
            .catch((error: unknown) => {
              if (isNotFoundError(error)) {
                return { response: null, missing: true };
              }

              throw error;
            }),
          api.banking.ifrs9Reports.lifetimeLGD.get(params),
        ]);

        const summaryData = summaryResult.response;
        const detailRows = Array.isArray(detailData?.data) ? detailData.data : [];
        const effectivePrcDate = summaryData?.effectivePrcDate ?? detailData?.effectivePrcDate ?? params.prc_date ?? null;
        const fallbackSummaryRow = detailRows.length > 0
          ? (() => {
              const totals = detailRows.reduce(
                (acc: { totalEad: number; totalPvRecovery: number; weightedLgdRate: number }, row: Record<string, unknown>) => {
                  const ead = toNumeric(row.os_at_default ?? row.ead_amount ?? row.ead);
                  const pvRecovery = toNumeric(row.recovery_amount_pv ?? row.total_recovery_pv ?? row.recovery_amount);
                  const lgdRate = toNumeric(row.lgd_rate ?? row.final_lgd ?? row.lgd);

                  acc.totalEad += ead;
                  acc.totalPvRecovery += pvRecovery;
                  acc.weightedLgdRate += lgdRate * ead;
                  return acc;
                },
                { totalEad: 0, totalPvRecovery: 0, weightedLgdRate: 0 }
              );

              const recRate = totals.totalEad > 0 ? totals.totalPvRecovery / totals.totalEad : 0;
              const lgdRate = totals.totalEad > 0 ? totals.weightedLgdRate / totals.totalEad : (1 - recRate);

              return {
                id: 1,
                period: effectivePrcDate,
                lgd_model: 'Selected LGD Model',
                total_ead: totals.totalEad,
                total_pv_recovery: totals.totalPvRecovery,
                rec_rate: recRate,
                lgd_rate: lgdRate,
              };
            })()
          : null;

        const summaryRows = Array.isArray(summaryData?.data) && summaryData.data.length > 0
          ? summaryData.data
          : (fallbackSummaryRow ? [fallbackSummaryRow] : []);
        
        if (detailRows.length > 0) {
          return {
            ...detailData,
            data: detailRows,
            summary: {
              ...(summaryData?.summary ?? {}),
              detailRows,
              summarySource: summaryResult.missing ? 'detail-fallback' : 'summary-endpoint',
            },
            effectivePrcDate,
            meta: detailData?.meta ?? summaryData?.meta,
            message: detailData?.message ?? summaryData?.message,
          };
        }

        const rowsWithDetails = summaryRows.map((row: Record<string, unknown>, index: number) => ({
          ...row,
          id: row.id ?? index + 1,
          _detail_rows: [],
        }));

        return {
          ...summaryData,
          data: rowsWithDetails,
          columns: [
            { field: 'period', headerName: 'Period', width: 160, type: 'date' },
            { field: 'lgd_model', headerName: 'LGD Model', width: 220, type: 'string' },
            { field: 'total_ead', headerName: 'Total EAD', width: 190, type: 'number' },
            { field: 'total_pv_recovery', headerName: 'Total PV Recovery', width: 220, type: 'number' },
            { field: 'rec_rate', headerName: 'Rec. Rate (%)', width: 160, type: 'number' },
            { field: 'lgd_rate', headerName: 'LGD', width: 140, type: 'number' },
          ],
          summary: {
            ...(summaryData?.summary ?? {}),
            detailRows: summaryRows,
            summarySource: summaryResult.missing ? 'detail-fallback' : 'summary-endpoint',
          },
          effectivePrcDate,
          meta: summaryData?.meta ?? detailData?.meta,
          message: summaryData?.message ?? detailData?.message,
        };
      }
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
