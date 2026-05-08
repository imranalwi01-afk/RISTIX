import { describe, expect, test } from 'bun:test';
import { apiClient } from '../api-setup';
import { individualImpairmentScopedClient } from './individual-impairment-scoped-client';
import {
  normalizeIndividualImpairmentV2Url,
  resolveIndividualImpairmentV2BaseUrl,
} from './individual-impairment-v2-client';

const originalGet = apiClient.get;
const originalWindow = (globalThis as any).window;

function restoreGlobals() {
  apiClient.get = originalGet;
  apiClient.defaults.baseURL = '/api/v1';
  if (originalWindow === undefined) {
    delete (globalThis as any).window;
  } else {
    (globalThis as any).window = originalWindow;
  }
}

describe('individual impairment v2 API client helpers', () => {
  test('resolves v2 base from default v1 base', () => {
    apiClient.defaults.baseURL = 'https://example.test/api/v1';
    expect(resolveIndividualImpairmentV2BaseUrl()).toBe('https://example.test/api/v2/individual-impairment');
    apiClient.defaults.baseURL = '/api/v1';
  });

  test('normalizes legacy individual impairment URLs into v2-relative paths', () => {
    expect(normalizeIndividualImpairmentV2Url('/banking/individual/impairment/watchlist')).toBe('/watchlist');
    expect(normalizeIndividualImpairmentV2Url('/api/v2/individual-impairment/reports')).toBe('/reports');
  });

  test('keeps legacy assessment UI on the v1 api client', async () => {
    const calls: unknown[][] = [];
    apiClient.get = ((...args: unknown[]) => {
      calls.push(args);
      return Promise.resolve({ data: { success: true } } as any);
    }) as any;

    try {
      (globalThis as any).window = { location: { pathname: '/banking/individual/assessment' } };

      await individualImpairmentScopedClient.get('/banking/individual/impairment/watchlist');

      expect(calls).toEqual([['/banking/individual/impairment/watchlist', undefined]]);
    } finally {
      restoreGlobals();
    }
  });

  test('routes assessment-new UI through the v2 api client with normalized urls', async () => {
    const calls: unknown[][] = [];
    apiClient.get = ((...args: unknown[]) => {
      calls.push(args);
      return Promise.resolve({ data: { success: true } } as any);
    }) as any;

    try {
      apiClient.defaults.baseURL = '/api/v1';
      (globalThis as any).window = { location: { pathname: '/banking/individual/assessment-new' } };

      await individualImpairmentScopedClient.get('/banking/individual/impairment/watchlist', {
        params: { page: 1 },
      });

      expect(calls).toEqual([[
        '/watchlist',
        {
          baseURL: '/api/v2/individual-impairment',
          params: { page: 1 },
        },
      ]]);
    } finally {
      restoreGlobals();
    }
  });
});
