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
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable SWC minification for faster builds


  // Improve development performance by disposing inactive pages
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // ============================================================================
  // TURBOPACK CONFIGURATION (for `next dev --turbo`)
  // ============================================================================
  // Note: Turbopack has better built-in file watching, no need for webpack watchOptions
  turbopack: {
    // Resolve aliases if needed
    // resolveAlias: {},
  },

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      'react-admin',
      'ra-data-simple-rest',
      'recharts',
      'lucide-react',
      'notistack'
    ],
    // Enable server actions for better performance
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Disable server minification to fix Turbopack + Emotion/stylis compatibility
    serverMinification: false
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production (keep errors and warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================
  images: {
    domains: ['localhost', 'iaf-ifrs.ifrspro.id', 'bifrs9-iaf.ifrspro.id', 'danafin.com', 'iaf-ifrs.danafin.com'],
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