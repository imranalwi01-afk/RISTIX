// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/providers/data/platformDataProvider.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin, Axios
// Purpose: Connect to ifrspro_platform_admin database with consultant access
// ============================================================================

import { DataProvider, fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

const apiUrl = process.env.REACT_APP_PLATFORM_API_URL || '/api/platform/admin';
const httpClient = fetchUtils.fetchJson;

export interface PlatformDataProviderConfig {
  apiUrl: string;
  httpClient: typeof httpClient;
  consultantAccess: boolean;
}

/**
 * Platform Data Provider for ifrspro_platform_admin database
 * Supports cross-tenant access and consultant user management
 */
export const platformDataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('content-range')?.split('/').pop() || '0', 10),
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('content-range')?.split('/').pop() || '0', 10),
    }));
  },

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    })) as any,

  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json }));
  },
};

/**
 * Enhanced platform data provider with consultant access
 */
export const createPlatformDataProvider = (config: Partial<PlatformDataProviderConfig> = {}) => {
  const finalConfig = {
    apiUrl: config.apiUrl || apiUrl,
    httpClient: config.httpClient || httpClient,
    consultantAccess: config.consultantAccess || false,
  };

  // Add consultant-specific headers if consultant access is enabled
  if (finalConfig.consultantAccess) {
    const enhancedHttpClient = (url: string, options: any = {}) => {
      return finalConfig.httpClient(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Consultant-Access': 'true',
          'X-Access-Level': 'platform-admin',
        },
      });
    };

    return {
      ...platformDataProvider,
      // Override methods to use enhanced HTTP client
      getList: (resource: string, params: any) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
          sort: JSON.stringify([field, order]),
          range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
          filter: JSON.stringify(params.filter),
        };
        const url = `${finalConfig.apiUrl}/${resource}?${stringify(query)}`;

        return enhancedHttpClient(url).then(({ headers, json }: any) => ({
          data: json,
          total: parseInt(headers.get('content-range')?.split('/').pop() || '0', 10),
        }));
      },
    };
  }

  return platformDataProvider;
};

export default platformDataProvider;
