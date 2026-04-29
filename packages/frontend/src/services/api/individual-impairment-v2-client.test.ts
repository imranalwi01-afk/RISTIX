import { describe, expect, test } from 'bun:test';
import { apiClient } from '../api-setup';
import {
  normalizeIndividualImpairmentV2Url,
  resolveIndividualImpairmentV2BaseUrl,
} from './individual-impairment-v2-client';

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
});
