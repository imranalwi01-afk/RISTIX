/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const normalizeBackendProxyBase = (rawValue) => {
  let value = (rawValue || '').trim().replace(/\/+$/, '');
  while (/\/api(?:\/v1)?$/i.test(value)) {
    value = value.replace(/\/api(?:\/v1)?$/i, '');
  }
  value = value
    .replace('https://bifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id')
    .replace('http://bifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id')
    .replace('https://ifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id')
    .replace('http://ifrs9-iaf.ifrspro.id', 'https://iaf-ifrs-be.ifrspro.id');
  return value;
};

const isLocalhostUrl = (value) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value || '');
const containsPublicDomain = (value) => /(ifrspro\.id|danafin\.(?:id|com))/i.test((value || '').toLowerCase());

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  // Enable standalone output for Docker
  output: 'standalone',
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'iaf-ifrs.ifrspro.id',
    '*.ifrspro.id',
    'iaf-ifrs.danafin.id',
    '*.danafin.id',
    'iaf-ifrs.danafin.com',
    '*.danafin.com',
  ],

  // Force transpilation of MUI packages to fix Turbopack bundling issues
  // Force transpilation of MUI packages to fix Turbopack bundling issues
  transpilePackages: [
    '@mui/material',
    '@mui/icons-material',
    '@mui/system',
    '@mui/lab',
    '@mui/x-data-grid',
    '@mui/x-date-pickers',
    '@mui/x-data-grid-pro',
    '@mui/x-data-grid-premium',
  ],



  // Enable SWC minification for faster builds



  // Improve development performance by disposing inactive pages
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },



  // Optimize package imports to reduce bundle size
  experimental: {

    optimizePackageImports: [
      'recharts',
      'lucide-react',
      'notistack'
    ],
    // Enable server actions for better performance
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },

  // Compiler optimizations
  compiler: {
    // Enable Emotion for MUI v7
    emotion: {
      sourceMap: true,
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
    // Remove console logs in production (keep errors and warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // Webpack configuration for DataGrid compatibility
  // webpack: (config, { isServer }) => {
  //   // Exclude DataGrid from optimization that breaks destructuring
  //   config.optimization = config.optimization || {};
  //   config.optimization.providedExports = false;

  //   return config;
  // },

  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'iaf-ifrs.ifrspro.id' },
      { protocol: 'https', hostname: 'danafin.com' },
      { protocol: 'https', hostname: 'iaf-ifrs.danafin.com' },
    ],
    formats: ['image/webp', 'image/avif']
  },

  // ============================================================================
  // API REWRITES
  // ============================================================================
  async rewrites() {
    const explicitProxyTarget =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL;

    let normalizedProxyBase = normalizeBackendProxyBase(explicitProxyTarget);
    const frontendUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || '').toLowerCase();
    const deploymentTarget = (process.env.DEPLOYMENT_TARGET || process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET || '').toLowerCase();
    const apiBaseUrlHint = (
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      ''
    ).toLowerCase();

    const isPublicDomainFrontend =
      containsPublicDomain(frontendUrl) ||
      containsPublicDomain(apiBaseUrlHint) ||
      deploymentTarget.includes('staging') ||
      deploymentTarget.includes('production') ||
      deploymentTarget.includes('prod');

    const shouldUseLocalhostProxy =
      deploymentTarget === 'localdev' &&
      (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1') || frontendUrl.length === 0);

    if (isLocalhostUrl(normalizedProxyBase) && !shouldUseLocalhostProxy) {
      normalizedProxyBase = '';
    }

    if (isPublicDomainFrontend && isLocalhostUrl(normalizedProxyBase)) {
      const fallbackPublicTarget =
        process.env.BACKEND_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_BACKEND_API_URL;
      normalizedProxyBase = normalizeBackendProxyBase(fallbackPublicTarget);
    }

    if (isPublicDomainFrontend && (!normalizedProxyBase || isLocalhostUrl(normalizedProxyBase))) {
      normalizedProxyBase = frontendUrl.includes('danafin.com')
        ? 'https://iaf-ifrs-be.danafin.com'
        : 'https://iaf-ifrs-be.ifrspro.id';
    }

    const proxyBase = normalizedProxyBase.startsWith('http://') || normalizedProxyBase.startsWith('https://')
      ? normalizedProxyBase
      : 'http://backend:4232';

    return [
      {
        source: '/api/:path*',
        destination: `${proxyBase}/api/:path*`,
      },
    ];
  },

  // ============================================================================
  // PRODUCTION OPTIMIZATIONS
  // ============================================================================

  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // ============================================================================
  // ENVIRONMENT VARIABLES
  // ============================================================================
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_DEPLOYMENT_TARGET: process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET,
  },
};

export default withBundleAnalyzer(nextConfig);
