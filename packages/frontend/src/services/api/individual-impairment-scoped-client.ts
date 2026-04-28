import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from '../api-setup';
import { isIndividualAssessmentV2Path } from '@/features/individual-impairment/routing';
import { individualImpairmentV2Client } from './individual-impairment-v2-client';

function shouldUseIndividualImpairmentV2(): boolean {
  if (typeof window === 'undefined') return false;
  return isIndividualAssessmentV2Path(window.location.pathname);
}

export const individualImpairmentScopedClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    shouldUseIndividualImpairmentV2()
      ? individualImpairmentV2Client.get<T>(url, config)
      : apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    shouldUseIndividualImpairmentV2()
      ? individualImpairmentV2Client.post<T>(url, data, config)
      : apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    shouldUseIndividualImpairmentV2()
      ? individualImpairmentV2Client.put<T>(url, data, config)
      : apiClient.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    shouldUseIndividualImpairmentV2()
      ? individualImpairmentV2Client.delete<T>(url, config)
      : apiClient.delete<T>(url, config),
};
