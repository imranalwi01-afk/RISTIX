'use client';

import { individualImpairmentAPI, type IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import { individualImpairmentAPI as individualImpairmentFlatAPI } from '@/services/api/individual-impairment.api';

export interface AssessmentSummaryDto {
  totalAccounts: number;
  impairedAccounts: number;
  pendingAssessments: number;
  totalProvisions: number;
  dataDate?: string;
}

export interface AssessmentWatchlistFilters {
  search?: string;
  stage?: string;
  impairedFlag?: string;
  priorityLevel?: string;
  downloadDate?: string;
  mode: string;
  page: number;
  limit: number;
}

export interface IndividualCustomerListFilters {
  page: number;
  limit: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StandaloneWatchlistFilters {
  page: number;
  limit: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface WatchlistCreateInput {
  customerName: string;
  accountNumber: string;
  segment: string;
  remarks?: string;
}

export async function fetchAssessmentWatchlist(params: AssessmentWatchlistFilters) {
  const stageValue = Number.parseInt(params.stage ?? '', 10);
  const stage = Number.isFinite(stageValue) ? stageValue : undefined;
  const impairedFlag =
    params.impairedFlag === 'I' || params.impairedFlag === 'N'
      ? params.impairedFlag
      : undefined;

  return individualImpairmentAPI.watchlist.getAll({
    page: params.page,
    limit: params.limit,
    search: params.search,
    filter: {
      stage,
      impaired_flag: impairedFlag,
      priority_level: params.priorityLevel,
      date_range: params.downloadDate ? { start: params.downloadDate, end: params.downloadDate } : undefined,
    },
  });
}

export async function fetchAssessmentSummary(downloadDate: string | undefined, mode: string) {
  return individualImpairmentAPI.watchlist.getSummary(downloadDate, mode);
}

export async function fetchAssessmentAccountBySearch(accountId: string, accountNumber: string, mode: string) {
  const response = await individualImpairmentAPI.watchlist.getAll({
    page: 1,
    limit: 1,
    search: accountNumber,
  });

  if (!response?.success || !Array.isArray(response.data) || response.data.length === 0) {
    return null;
  }

  return response.data.find((row) => String(row.account_id) === String(accountId)) ?? response.data[0] ?? null;
}

export type AssessmentWatchlistItemDto = IndividualImpairmentWatchlistItem;

export async function fetchIndividualCustomerList(params: IndividualCustomerListFilters) {
  return individualImpairmentFlatAPI.getCustomerList({
    page: params.page,
    limit: params.limit,
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
}

export async function fetchStandaloneWatchlist(params: StandaloneWatchlistFilters) {
  return individualImpairmentFlatAPI.getWatchlist({
    page: params.page,
    limit: params.limit,
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
}

export async function createStandaloneWatchlistEntry(input: WatchlistCreateInput) {
  return individualImpairmentFlatAPI.addToWatchlist(input);
}

export async function removeStandaloneWatchlistEntry(id: string) {
  return individualImpairmentFlatAPI.removeFromWatchlist(id);
}

export async function fetchIndividualReportHistory() {
  return individualImpairmentAPI.reports.getHistory();
}

export async function fetchIndividualReportAssessmentList(params: {
  page: number;
  limit: number;
  search?: string;
  mode: string;
}) {
  return individualImpairmentAPI.watchlist.getAll({
    page: params.page,
    limit: params.limit,
    search: params.search,
  });
}
