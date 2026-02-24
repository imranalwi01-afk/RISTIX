// packages/frontend/src/config/environment-loader-frontend.ts
// Minimal frontend environment loader. Source of truth is env.

const getEnv = (key: string): string => (process.env[key] || '').trim();

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const canonicalizeLegacyHosts = (value: string): string => {
  return (value || '')
    .replace('https://bifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id')
    .replace('http://bifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id')
    .replace('https://ifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id')
    .replace('http://ifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id');
};

const stripApiSuffix = (value: string): string => {
  let normalized = trimTrailingSlash(canonicalizeLegacyHosts(value || ''));
  while (/\/api(?:\/v1)?$/i.test(normalized)) {
    normalized = normalized.replace(/\/api(?:\/v1)?$/i, '');
  }
  return normalized;
};

const toApiV1 = (value: string): string => {
  const stripped = stripApiSuffix(value);
  if (!stripped) return '/api/v1';
  if (stripped.startsWith('http://') || stripped.startsWith('https://') || stripped.startsWith('/')) {
    return `${stripped}/api/v1`;
  }
  return '/api/v1';
};

const resolveBackendOrigin = (): string => {
  const candidates = [
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
    process.env.API_BASE_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    return stripApiSuffix(candidate as string);
  }

  return '';
};

const resolveApiBase = (backendOrigin: string): string => {
  const explicitApiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.API_BASE_URL;

  if (explicitApiBase) return toApiV1(explicitApiBase);
  if (backendOrigin) return `${backendOrigin}/api/v1`;
  return '/api/v1';
};

export interface FrontendEnvironmentConfig {
  nodeEnv: string;
  isProduction: boolean;
  api: {
    backend: string;
    base: string;
  };
  rAnalytics: {
    api: string;
    dashboard: string;
  };
  urls: {
    frontend: string;
    backend: string;
    websocket: string;
  };
  iaf: {
    tenantId: string;
    bankingType: string;
  };
}

class FrontendEnvironmentLoader {
  private static instance: FrontendEnvironmentLoader;
  private config: FrontendEnvironmentConfig | null = null;

  public static getInstance(): FrontendEnvironmentLoader {
    if (!FrontendEnvironmentLoader.instance) {
      FrontendEnvironmentLoader.instance = new FrontendEnvironmentLoader();
    }
    return FrontendEnvironmentLoader.instance;
  }

  public loadConfiguration(): FrontendEnvironmentConfig {
    const isProduction = process.env.NODE_ENV === 'production';

    const backendOrigin = resolveBackendOrigin();
    const apiBase = resolveApiBase(backendOrigin);
    const backendApi = backendOrigin ? `${backendOrigin}/api/v1` : apiBase;

    const defaultFrontend =
      typeof window !== 'undefined'
        ? window.location.origin
        : '';
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || defaultFrontend;

    this.config = {
      nodeEnv: process.env.NODE_ENV || (isProduction ? 'production' : 'development'),
      isProduction,
      api: {
        backend: backendApi,
        base: apiBase,
      },
      rAnalytics: {
        api: process.env.NEXT_PUBLIC_RAPI_BASE_URL || process.env.NEXT_PUBLIC_R_API_URL || process.env.NEXT_PUBLIC_R_ANALYTICS_API || process.env.NEXT_PUBLIC_R_API_BASE_URL || '/api',
        dashboard: process.env.NEXT_PUBLIC_R_ANALYTICS_URL || process.env.NEXT_PUBLIC_R_DASHBOARD_URL || process.env.NEXT_PUBLIC_R_ANALYTICS_BASE_URL || '',
      },
      urls: {
        frontend: frontendUrl,
        backend: backendOrigin || backendApi,
        websocket: process.env.NEXT_PUBLIC_WS_URL || '',
      },
      iaf: {
        tenantId: process.env.NEXT_PUBLIC_TENANT_ID || 'iaf',
        bankingType: process.env.NEXT_PUBLIC_BANKING_TYPE || 'conventional',
      },
    };

    return this.config;
  }

  public getConfiguration(): FrontendEnvironmentConfig {
    if (!this.config) {
      this.config = this.loadConfiguration();
    }
    return this.config;
  }
}

export const frontendEnvironmentLoader = FrontendEnvironmentLoader.getInstance();
frontendEnvironmentLoader.loadConfiguration();
