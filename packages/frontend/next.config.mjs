/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove all experimental features that might cause issues
  experimental: {
    // Remove optimizeCss as it might cause issues
    // optimizePackageImports: [],
  },

  // Simplified compiler
  compiler: {
    // Remove emotion for now to isolate the issue
    // emotion: false,
  },

  // Remove complex webpack configuration
  // webpack: (config) => config,

  // Keep only essential rewrites
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

  // Remove complex headers for now
  // async headers() { return []; },

  // Simplified images config
  images: {
    domains: ['localhost', 'iaf-ifrs.ifrspro.id'],
  },

  // Remove transpilePackages
  // transpilePackages: [],

  // Keep only essential env variables (NODE_ENV is not allowed here)
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_DEPLOYMENT_TARGET: process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET,
  },

  // Remove allowedDevOrigins for now
  // allowedDevOrigins: [],
};

export default nextConfig;