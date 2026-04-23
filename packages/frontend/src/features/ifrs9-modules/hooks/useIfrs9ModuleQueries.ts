'use client';

import axios from 'axios';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { fetchAmortizationModuleDetail, fetchAmortizationModuleResults, fetchImpairmentModuleDetail, fetchImpairmentModuleResults } from '../api/ifrs9-modules.api';
import { toAmortizationModuleDetail, toAmortizationModuleRows, toImpairmentModuleDetail, toImpairmentModuleRows } from '../domain/ifrs9-modules.models';

function resolveModuleErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return `${fallbackMessage} Backend lokal yang sedang jalan kemungkinan masih route lama atau belum restart.`;
    }

    const responseMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function useImpairmentModuleResultsQuery(params: { page: number; limit: number; prcDate?: string; search?: string }) {
  return useQuery({
    queryKey: businessQueryKeys.list('impairment-module', params),
    queryFn: async () => {
      try {
        const response = await fetchImpairmentModuleResults(params);
        const rows = toImpairmentModuleRows(response.data);
        const detailSupported = rows.some((row) => Boolean(row.pkid));
        const compatibilityMessage = rows.length > 0 && !detailSupported
          ? 'Backend lokal masih mengembalikan payload impairment lama. Table tetap tampil, tetapi detail tabs baru butuh backend restart ke route tech-spec terbaru.'
          : null;

        return {
          success: response.success,
          message: compatibilityMessage ?? response.message,
          effectivePrcDate: response.effectivePrcDate ?? null,
          rows,
          total: Number(response.pagination?.total ?? response.data?.length ?? 0),
          detailSupported,
          compatibilityMessage,
        };
      } catch (error) {
        return {
          success: false,
          message: resolveModuleErrorMessage(error, 'Failed to load impairment results.'),
          effectivePrcDate: null,
          rows: [],
          total: 0,
          detailSupported: false,
          compatibilityMessage: null,
        };
      }
    },
    placeholderData: keepPreviousData,
  });
}

export function useImpairmentModuleDetailQuery(pkid: string | null) {
  return useQuery({
    queryKey: businessQueryKeys.detail('impairment-module', pkid ?? 'none'),
    queryFn: async () => {
      try {
        const response = await fetchImpairmentModuleDetail(pkid as string);
        return {
          success: response.success,
          message: response.message,
          data: toImpairmentModuleDetail(response.data),
        };
      } catch (error) {
        return {
          success: false,
          message: resolveModuleErrorMessage(error, 'Failed to load impairment detail.'),
          data: null,
        };
      }
    },
    enabled: Boolean(pkid),
    placeholderData: keepPreviousData,
  });
}

export function useAmortizationModuleResultsQuery(params: { page: number; limit: number; prcDate?: string; search?: string }) {
  return useQuery({
    queryKey: businessQueryKeys.list('amortization-module', params),
    queryFn: async () => {
      try {
        const response = await fetchAmortizationModuleResults(params);
        const rows = toAmortizationModuleRows(response.data);
        const detailSupported = rows.some((row) => Boolean(row.pkid));
        const compatibilityMessage = rows.length > 0 && !detailSupported
          ? 'Backend lokal masih mengembalikan payload amortization lama. Table tetap tampil, tetapi detail tabs baru butuh backend restart ke route tech-spec terbaru.'
          : null;

        return {
          success: response.success,
          message: compatibilityMessage ?? response.message,
          effectivePrcDate: response.effectivePrcDate ?? null,
          rows,
          total: Number(response.pagination?.total ?? response.data?.length ?? 0),
          detailSupported,
          compatibilityMessage,
        };
      } catch (error) {
        return {
          success: false,
          message: resolveModuleErrorMessage(error, 'Failed to load amortization results.'),
          effectivePrcDate: null,
          rows: [],
          total: 0,
          detailSupported: false,
          compatibilityMessage: null,
        };
      }
    },
    placeholderData: keepPreviousData,
  });
}

export function useAmortizationModuleDetailQuery(pkid: string | null) {
  return useQuery({
    queryKey: businessQueryKeys.detail('amortization-module', pkid ?? 'none'),
    queryFn: async () => {
      try {
        const response = await fetchAmortizationModuleDetail(pkid as string);
        return {
          success: response.success,
          message: response.message,
          data: toAmortizationModuleDetail(response.data),
        };
      } catch (error) {
        return {
          success: false,
          message: resolveModuleErrorMessage(error, 'Failed to load amortization detail.'),
          data: null,
        };
      }
    },
    enabled: Boolean(pkid),
    placeholderData: keepPreviousData,
  });
}
