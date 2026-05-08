'use client';

import type { AssessmentSummaryDto, AssessmentWatchlistItemDto } from '../api/individual-impairment.api';

export type AssessmentWatchlistItemViewModel = AssessmentWatchlistItemDto;

export interface IndividualCustomerListRowViewModel {
  id: string | number;
  customerName: string;
  accountNumber: string;
  segment: string;
  stage: number;
  status: string;
  remarks: string;
  processDate: string | null;
}

export interface StandaloneWatchlistRowViewModel {
  id: string | number;
  customerName: string;
  accountNumber: string;
  segment: string;
  impairmentStatus: string;
  remarks: string;
  triggerDate: string | null;
  [key: string]: unknown;
}

export interface IndividualReportHistoryRowViewModel {
  id: string;
  reportPeriod: string;
  reportType: string;
  generatedBy: string;
  createdAt: string | null;
  status: string;
  totalRecords: number;
  [key: string]: unknown;
}

export interface IndividualReportListRowViewModel {
  id: string | number;
  pkid: number;
  iaId: number | null;
  downloadDate: string | null;
  customerNumber: string;
  customerName: string;
  accountId: number | null;
  accountNumber: string;
  currency: string;
  outstanding: number;
  dayPastDue: number;
  collectability: number | null;
  rating: string;
  eadAmount: number;
  pvDcfAmount: number;
  eclIaAmount: number;
  status: string;
  [key: string]: unknown;
}

const pickText = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const raw = value == null ? '' : String(value).trim();
    if (raw) return raw;
  }
  return undefined;
};

const normalizeSegment = (value: unknown): string => {
  const raw = String(value || '').trim();
  if (!raw) return 'Unknown';
  const upper = raw.toUpperCase();
  if (upper.includes('SME')) return 'SME';
  if (upper.includes('RETAIL')) return 'Retail';
  return raw;
};

export function toAssessmentWatchlist(rows: AssessmentWatchlistItemDto[] | undefined) {
  return Array.isArray(rows) ? rows : [];
}

export function toAssessmentSummary(data: Record<string, unknown> | undefined): AssessmentSummaryDto | undefined {
  if (!data) return undefined;

  return {
    totalAccounts: Number(data.totalAccounts ?? data.total_accounts ?? 0),
    impairedAccounts: Number(data.impairedAccounts ?? data.impaired_accounts ?? 0),
    pendingAssessments: Number(data.pendingAssessments ?? data.pending_assessments ?? 0),
    totalProvisions: Number(data.totalProvisions ?? data.total_provisions ?? 0),
    dataDate: (data.dataDate ?? data.data_date) as string | undefined,
  };
}

export function toIndividualCustomerListRows(rows: unknown[] | undefined): IndividualCustomerListRowViewModel[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const source = row as Record<string, unknown>;
    return {
      id: (source.account_number ?? source.account_id ?? source.pkid ?? source.id) as string | number,
      customerName: pickText(source.cif_name, source.customerName) ?? '-',
      accountNumber: pickText(source.account_number, source.accountNumber) ?? '-',
      segment: normalizeSegment(pickText(source.segment, source.sub_segment, source.group_segment)),
      stage: Number(source.stage || 1),
      status: pickText(source.assessment_status, source.status) ?? 'PENDING',
      remarks: pickText(source.remarks, source.notes, source.trigger_remarks) ?? '-',
      processDate: (source.prc_date ?? null) as string | null,
    };
  });
}

export function toStandaloneWatchlistRows(rows: unknown[] | undefined): StandaloneWatchlistRowViewModel[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const source = row as Record<string, unknown>;
    return {
      ...source,
      id: (source.id ?? source.pkid ?? source.account_id ?? source.accountId ?? source.account_number ?? source.accountNumber) as
        | string
        | number,
      customerName: pickText(source.customerName, source.cif_name, source.cifName) ?? '-',
      accountNumber: pickText(source.accountNumber, source.account_number, source.accountNo) ?? '-',
      segment: normalizeSegment(
        pickText(source.segment, source.sub_segment, source.group_segment, source.prd_group, source.prdGroup, source.prd_type, source.prdType)
      ),
      impairmentStatus: pickText(source.impairmentStatus, source.assessment_status, source.status) ?? 'WATCHLIST',
      remarks: pickText(source.remarks, source.notes, source.trigger_remarks, source.triggerRemarks) ?? '-',
      triggerDate: (source.triggerDate ?? source.prc_date ?? source.createddate ?? source.createdDate ?? null) as string | null,
    };
  });
}

export function toIndividualReportHistoryRows(rows: unknown[] | undefined): IndividualReportHistoryRowViewModel[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const source = row as Record<string, unknown>;
    const reportId = pickText(source.report_id, source.id) ?? `report-${index}`;

    return {
      ...source,
      id: reportId,
      reportPeriod:
        pickText(source.reportPeriod, source.report_period, source.period_start, source.period_end) ?? '-',
      reportType: pickText(source.reportType, source.report_type) ?? '-',
      generatedBy: pickText(source.generatedBy, source.generated_by, source.createdby) ?? '-',
      createdAt: (source.createdAt ?? source.created_at ?? source.generation_date ?? null) as string | null,
      status: pickText(source.status) ?? 'UNKNOWN',
      totalRecords: Number(source.totalRecords ?? source.total_records ?? source.record_count ?? 0),
    };
  });
}

export function toIndividualReportListRows(rows: unknown[] | undefined): IndividualReportListRowViewModel[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const source = row as Record<string, unknown>;
    const pkid = Number(source.pkid ?? index);
    const accountId = source.account_id ?? source.accountId;

    return {
      ...source,
      id: (source.pkid ?? source.ia_id ?? source.iaId ?? source.account_number ?? index) as string | number,
      pkid,
      iaId: source.ia_id == null && source.iaId == null ? null : Number(source.ia_id ?? source.iaId),
      downloadDate: (source.download_date ?? source.downloadDate ?? source.prc_date ?? source.prcDate ?? null) as string | null,
      customerNumber: pickText(source.customer_number, source.customerNumber, source.cif_number, source.cifNumber) ?? '-',
      customerName: pickText(source.customer_name, source.customerName, source.cif_name, source.cifName) ?? '-',
      accountId: accountId == null ? null : Number(accountId),
      accountNumber: pickText(source.account_number, source.accountNumber) ?? '-',
      currency: pickText(source.currency) ?? '-',
      outstanding: Number(source.outstanding ?? 0),
      dayPastDue: Number(source.day_past_due ?? source.dayPastDue ?? source.dpd ?? 0),
      collectability: source.collectability == null ? null : Number(source.collectability),
      rating: pickText(source.rating, source.rating_code, source.ratingCode) ?? '-',
      eadAmount: Number(source.ead_amt ?? source.eadAmt ?? 0),
      pvDcfAmount: Number(source.pv_dcf_amt ?? source.pvDcfAmt ?? 0),
      eclIaAmount: Number(source.ecl_ia_amt ?? source.eclIaAmt ?? 0),
      status: pickText(source.status) ?? '-',
    };
  });
}
