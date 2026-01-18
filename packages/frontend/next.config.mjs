/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  // Enable standalone output for Docker
  output: 'standalone',

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
  swcMinify: false,


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
      { protocol: 'https', hostname: 'bifrs9-iaf.ifrspro.id' },
      { protocol: 'https', hostname: 'danafin.com' },
      { protocol: 'https', hostname: 'iaf-ifrs.danafin.com' },
    ],
    formats: ['image/webp', 'image/avif']
  },

  // ============================================================================
  // API REWRITES
  // ============================================================================
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_API_URL
          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL.replace('/api/v1', '')}/api/:path*`
          : 'http://localhost:4232/api/:path*',
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