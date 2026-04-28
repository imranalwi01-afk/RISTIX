import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from '../api-setup';

const LEGACY_INDIVIDUAL_IMPAIRMENT_BASE = '/banking/individual/impairment';

export const INDIVIDUAL_IMPAIRMENT_V2_API_BASE = '/api/v2/individual-impairment';

function resolveIndividualImpairmentV2BaseUrl(): string {
  const configuredBase = String(apiClient.defaults.baseURL || '/api/v1').replace(/\/+$/, '');

  if (configuredBase.endsWith('/api/v1')) {
    return `${configuredBase.slice(0, -'/api/v1'.length)}${INDIVIDUAL_IMPAIRMENT_V2_API_BASE}`;
  }

  if (configuredBase.endsWith('/api')) {
    return `${configuredBase}/v2/individual-impairment`;
  }

  if (configuredBase.endsWith('/api/v2')) {
    return `${configuredBase}/individual-impairment`;
  }

  if (/^https?:\/\//.test(configuredBase)) {
    return `${configuredBase}${INDIVIDUAL_IMPAIRMENT_V2_API_BASE}`;
  }

  return INDIVIDUAL_IMPAIRMENT_V2_API_BASE;
}

function normalizeV2Url(url: string): string {
  if (url === LEGACY_INDIVIDUAL_IMPAIRMENT_BASE) return '/';
  if (url.startsWith(`${LEGACY_INDIVIDUAL_IMPAIRMENT_BASE}/`)) {
    return url.slice(LEGACY_INDIVIDUAL_IMPAIRMENT_BASE.length);
  }
  if (url === INDIVIDUAL_IMPAIRMENT_V2_API_BASE) return '/';
  if (url.startsWith(`${INDIVIDUAL_IMPAIRMENT_V2_API_BASE}/`)) {
    return url.slice(INDIVIDUAL_IMPAIRMENT_V2_API_BASE.length);
  }

  return url;
}

function withIndividualImpairmentV2Base(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    baseURL: resolveIndividualImpairmentV2BaseUrl(),
  };
}

export const individualImpairmentV2Client = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(normalizeV2Url(url), withIndividualImpairmentV2Base(config)),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post<T>(normalizeV2Url(url), data, withIndividualImpairmentV2Base(config)),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put<T>(normalizeV2Url(url), data, withIndividualImpairmentV2Base(config)),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(normalizeV2Url(url), withIndividualImpairmentV2Base(config)),
};
