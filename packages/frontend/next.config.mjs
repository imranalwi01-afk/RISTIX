/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  // Enable standalone output for Docker
  // Force webpack for bundle analyzer compatibility
  turbopack: {},
  output: 'standalone',
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'host.docker.internal',
    '*.ifrspro.id',
    'iaf-ifrs.ifrspro.id',
    'iaf-ifrs-be.ifrspro.id',
    '*.danafin.com',
    'iaf-ifrs.danafin.com',
    '*.danafin.id',
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
      'notistack',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      'date-fns',
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

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' wss: ws: http://localhost:* https://*.ifrspro.id https://*.danafin.com https://*.danafin.id",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/banking/individual/impairment',
        destination: '/banking/individual/assessment',
        permanent: false,
      },
      {
        source: '/banking/individual/impairment/:path*',
        destination: '/banking/individual/:path*',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const explicitProxyTarget =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL;

    // Strict URL cleanup: just trim and remove trailing slashes/api suffixes
    let proxyBase = (explicitProxyTarget || '').trim().replace(/\/+$/, '');
    while (/\/api(?:\/v1)?$/i.test(proxyBase)) {
      proxyBase = proxyBase.replace(/\/api(?:\/v1)?$/i, '');
    }

    // Default fallback if no ENV is set
    if (!proxyBase || proxyBase.length === 0) {
      console.warn('⚠️ No backend proxy target found in environment variables. Falling back to http://localhost:4232');
      proxyBase = 'http://localhost:4232';
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${proxyBase}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${proxyBase}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${proxyBase}/socket.io/:path*`,
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
    NEXT_PUBLIC_R_ANALYTICS_URL: process.env.NEXT_PUBLIC_R_ANALYTICS_URL || process.env.NEXT_PUBLIC_R_ANALYTICS_BASE_URL,
    NEXT_PUBLIC_R_ANALYTICS_BASE_URL: process.env.NEXT_PUBLIC_R_ANALYTICS_BASE_URL,
    NEXT_PUBLIC_R_API_URL: process.env.NEXT_PUBLIC_R_API_URL || process.env.NEXT_PUBLIC_RAPI_BASE_URL,
    NEXT_PUBLIC_R_API_BASE_URL: process.env.NEXT_PUBLIC_R_API_BASE_URL || process.env.NEXT_PUBLIC_RAPI_BASE_URL,
    NEXT_PUBLIC_RAPI_BASE_URL: process.env.NEXT_PUBLIC_RAPI_BASE_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
};

export default withBundleAnalyzer(nextConfig);
