'use client';

import axios from 'axios';

export type NormalizedQueryError = {
  message: string;
  status?: number;
  code?: string;
  isAuthError: boolean;
  isForbidden: boolean;
  isConflict: boolean;
  details?: unknown;
};

export function normalizeQueryError(error: unknown, fallbackMessage = 'Request failed'): NormalizedQueryError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (typeof data?.message === 'string' && data.message)
      || error.message
      || fallbackMessage;

    return {
      message,
      status,
      code: typeof data?.code === 'string' ? data.code : error.code,
      isAuthError: status === 401,
      isForbidden: status === 403,
      isConflict: status === 409,
      details: data?.details ?? data?.error ?? data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || fallbackMessage,
      code: error.name,
      isAuthError: false,
      isForbidden: false,
      isConflict: false,
    };
  }

  return {
    message: fallbackMessage,
    isAuthError: false,
    isForbidden: false,
    isConflict: false,
    details: error,
  };
}
