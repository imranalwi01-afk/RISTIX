// packages/frontend/src/config/environment-loader-frontend.ts
// Minimal frontend environment loader. Source of truth is env.

const getEnv = (key: string): string => (process.env[key] || '').trim();

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const stripApiSuffix = (value: string): string => {
  let normalized = trimTrailingSlash(value || '');

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
  const isServer = typeof window === 'undefined';
  const candidates = isServer ? [
    process.env.BACKEND_INTERNAL_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
    process.env.API_BASE_URL,
  ] : [
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.BACKEND_INTERNAL_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
    process.env.API_BASE_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = stripApiSuffix(candidate as string);
    if (normalized) return normalized;
  }

  return '';
};

const resolveApiBase = (backendOrigin: string): string => {
  const explicitApiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.API_BASE_URL;

  if (explicitApiBase) {
    const trimmedBase = explicitApiBase.trim();
    if (trimmedBase.startsWith('/')) {
      const normalizedPath = trimTrailingSlash(trimmedBase);
      if (/\/api(?:\/v1)?$/i.test(normalizedPath)) {
        return backendOrigin ? `${backendOrigin}${normalizedPath}` : normalizedPath;
      }
      return backendOrigin ? `${backendOrigin}${normalizedPath}/api/v1` : `${normalizedPath}/api/v1`;
    }

    return toApiV1(trimmedBase);
  }

  if (backendOrigin) return `${backendOrigin}/api/v1`;
  return '/api/v1';
};

const resolveWebsocketUrl = (backendOrigin: string): string => {
  const explicitWebsocket = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicitWebsocket) return stripApiSuffix(explicitWebsocket);
  if (backendOrigin) return backendOrigin;
  return '';
};

export interface FrontendEnvironmentConfig {
  nodeEnv: string;
  isProduction: boolean;
  features: {
    dynamicMenu: boolean;
  };
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
      features: {
        dynamicMenu: process.env.NEXT_PUBLIC_DYNAMIC_MENU_ENABLED === 'true',
      },
      api: {
        backend: backendApi,
        base: apiBase,
      },
      rAnalytics: {
        api: process.env.NEXT_PUBLIC_RAPI_BASE_URL || process.env.NEXT_PUBLIC_R_API_URL || process.env.NEXT_PUBLIC_R_ANALYTICS_API || process.env.NEXT_PUBLIC_R_API_BASE_URL || '/api',
        dashboard: process.env.NEXT_PUBLIC_R_ANALYTICS_URL || process.env.NEXT_PUBLIC_R_DASHBOARD_URL || process.env.NEXT_PUBLIC_R_ANALYTICS_BASE_URL || (() => {
          if (typeof window === 'undefined') return '';
          const host = window.location.hostname;
          if (host.includes('danafin')) return 'https://iaf-ifrs-analytics.danafin.com';
          if (host.includes('ifrspro')) return 'https://iaf-ifrs-analytics.ifrspro.id';
          if (host.includes('bdo-ki')) return 'https://analytics-ristix.bdo-ki.com';
          return 'http://' + host + ':4236';
        })(),
      },
      urls: {
        frontend: frontendUrl,
        backend: backendOrigin || backendApi,
        websocket: resolveWebsocketUrl(backendOrigin || backendApi),
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
