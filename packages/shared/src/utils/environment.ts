// packages/shared/src/utils/environment.ts
// ============================================================================
// 🌍 ENVIRONMENT DETECTION UTILITY - SHARED ACROSS FRONTEND & BACKEND
// ============================================================================
// ✅ Auto-detects deployment environment (development, staging, production, iaf)
// ✅ Auto-detects deployment type (local, ecs, aws, azure)
// ✅ Provides consistent environment detection across all services
// ✅ Type-safe environment constants and utilities
// ============================================================================

// ============================================================================
// 🔧 ENVIRONMENT TYPES
// ============================================================================

export type Environment = 'development' | 'staging' | 'production' | 'iaf';
export type DeploymentType = 'local' | 'ecs' | 'aws' | 'azure';

export interface EnvironmentInfo {
  environment: Environment;
  deploymentType: DeploymentType;
  isProduction: boolean;
  isIAF: boolean;
  isLocal: boolean;
  isECS: boolean;
  nodeEnv: string;
}

// ============================================================================
// 🌍 ENVIRONMENT DETECTION FUNCTIONS
// ============================================================================

/**
 * Get environment variable (works in both browser and node.js)
 */
export const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
    if (value) return value;
  }
  
  // Browser environment
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const value = (window as any).__ENV__[key];
    if (value) return value;
  }
  
  return defaultValue;
};

/**
 * Detect current environment
 */
export const detectEnvironment = (): Environment => {
  const nodeEnv = getEnvVar('NODE_ENV', 'development');
  const envSuffix = getEnvVar('ENV_SUFFIX', '');
  const deploymentTarget = getEnvVar('DEPLOYMENT_TARGET', '');
  
  // Check for IAF-specific deployment
  if (envSuffix === 'iaf' || deploymentTarget === 'iaf') {
    return 'iaf';
  }
  
  // Standard environments
  switch (nodeEnv) {
    case 'production':
      return 'production';
    case 'staging':
      return 'staging';
    case 'development':
    default:
      return 'development';
  }
};

/**
 * Detect deployment type
 */
export const detectDeploymentType = (): DeploymentType => {
  // Check backend host for ECS deployment
  const backendHost = getEnvVar('BACKEND_HOST', '') || getEnvVar('NEXT_PUBLIC_BACKEND_HOST', '');
  
  if (backendHost === '10.18.11.35') {
    return 'ecs'; // Alibaba ECS
  }
  
  if (backendHost.includes('amazonaws.com')) {
    return 'aws';
  }
  
  if (backendHost.includes('azure')) {
    return 'azure';
  }
  
  // Check for localhost/local development
  if (backendHost === 'localhost' || backendHost === '127.0.0.1') {
    return 'local';
  }
  
  // Default to local if no specific deployment detected
  return 'local';
};

/**
 * Get comprehensive environment information
 */
export const getEnvironmentInfo = (): EnvironmentInfo => {
  const environment = detectEnvironment();
  const deploymentType = detectDeploymentType();
  const nodeEnv = getEnvVar('NODE_ENV', 'development')!;
  
  return {
    environment,
    deploymentType,
    isProduction: environment === 'production' || environment === 'iaf',
    isIAF: environment === 'iaf',
    isLocal: deploymentType === 'local',
    isECS: deploymentType === 'ecs',
    nodeEnv
  };
};

/**
 * Check if running in specific environment
 */
export const isEnvironment = (env: Environment): boolean => {
  return detectEnvironment() === env;
};

/**
 * Check if running on specific deployment type
 */
export const isDeploymentType = (type: DeploymentType): boolean => {
  return detectDeploymentType() === type;
};

/**
 * Check if running in production (including IAF)
 */
export const isProduction = (): boolean => {
  const env = detectEnvironment();
  return env === 'production' || env === 'iaf';
};

/**
 * Check if running in IAF deployment
 */
export const isIAF = (): boolean => {
  return detectEnvironment() === 'iaf';
};

/**
 * Check if running locally
 */
export const isLocal = (): boolean => {
  return detectDeploymentType() === 'local';
};

/**
 * Check if running on ECS
 */
export const isECS = (): boolean => {
  return detectDeploymentType() === 'ecs';
};

// ============================================================================
// 🏗️ URL BUILDERS
// ============================================================================

/**
 * Build server URL based on environment
 */
export const buildServerUrl = (
  service: 'frontend' | 'backend' | 'r-analytics',
  fallbackHost: string = 'localhost',
  fallbackPort: string = '3000'
): string => {
  let host: string;
  let port: string;
  
  switch (service) {
    case 'frontend':
      host = getEnvVar('FRONTEND_HOST') || getEnvVar('NEXT_PUBLIC_FRONTEND_HOST') || fallbackHost;
      port = getEnvVar('FRONTEND_PORT') || getEnvVar('NEXT_PUBLIC_FRONTEND_PORT') || '4231';
      break;
    case 'backend':
      host = getEnvVar('BACKEND_HOST') || getEnvVar('NEXT_PUBLIC_BACKEND_HOST') || fallbackHost;
      port = getEnvVar('BACKEND_PORT') || getEnvVar('NEXT_PUBLIC_BACKEND_PORT') || '4232';
      break;
    case 'r-analytics':
      host = getEnvVar('R_ANALYTICS_HOST') || getEnvVar('NEXT_PUBLIC_R_ANALYTICS_HOST') || fallbackHost;
      port = getEnvVar('R_ANALYTICS_PORT') || getEnvVar('NEXT_PUBLIC_R_ANALYTICS_PORT') || '4236';
      break;
    default:
      host = fallbackHost;
      port = fallbackPort;
  }
  
  // Use HTTPS for production domains, HTTP for everything else
  const protocol = (host.includes('.com') || host.includes('.id')) ? 'https' : 'http';
  
  return `${protocol}://${host}:${port}`;
};

/**
 * Build API URL based on environment
 */
export const buildApiUrl = (
  service: 'backend' | 'r-analytics' = 'backend'
): string => {
  const baseUrl = buildServerUrl(service);
  
  switch (service) {
    case 'backend':
      return `${baseUrl}/api/v1`;
    case 'r-analytics':
      return `${baseUrl}/api`;
    default:
      return `${baseUrl}/api`;
  }
};

// ============================================================================
// 🔍 ENVIRONMENT LOGGING
// ============================================================================

/**
 * Log current environment information
 */
export const logEnvironmentInfo = (serviceName: string = 'Service'): void => {
  const envInfo = getEnvironmentInfo();
  
  console.log(`🌍 ${serviceName} Environment Information:`);
  console.log(`  - Environment: ${envInfo.environment}`);
  console.log(`  - Deployment Type: ${envInfo.deploymentType}`);
  console.log(`  - Node ENV: ${envInfo.nodeEnv}`);
  console.log(`  - Is Production: ${envInfo.isProduction}`);
  console.log(`  - Is IAF: ${envInfo.isIAF}`);
  console.log(`  - Is Local: ${envInfo.isLocal}`);
  console.log(`  - Is ECS: ${envInfo.isECS}`);
  
  if (envInfo.isECS) {
    console.log(`  - Backend URL: ${buildServerUrl('backend')}`);
    console.log(`  - Frontend URL: ${buildServerUrl('frontend')}`);
    console.log(`  - R Analytics URL: ${buildServerUrl('r-analytics')}`);
  }
};

// ============================================================================
// 🚨 ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Validate environment configuration
 */
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const envInfo = getEnvironmentInfo();
  
  // Check critical environment variables
  if (!getEnvVar('NODE_ENV')) {
    errors.push('NODE_ENV is not set');
  }
  
  if (envInfo.isECS) {
    // Validate ECS-specific configuration
    if (!getEnvVar('BACKEND_HOST') && !getEnvVar('NEXT_PUBLIC_BACKEND_HOST')) {
      errors.push('BACKEND_HOST not configured for ECS deployment');
    }
    
    if (!getEnvVar('DB_HOST') && !getEnvVar('NEXT_PUBLIC_DB_HOST')) {
      errors.push('DB_HOST not configured for ECS deployment');
    }
  }
  
  if (envInfo.isProduction && !getEnvVar('JWT_SECRET')) {
    errors.push('JWT_SECRET not configured for production environment');
  }
  
  const isValid = errors.length === 0;
  
  if (isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.error('❌ Environment validation failed:', errors);
  }
  
  return { isValid, errors };
};

// ============================================================================
// 🌟 DEFAULT EXPORTS
// ============================================================================

export default {
  getEnvVar,
  detectEnvironment,
  detectDeploymentType,
  getEnvironmentInfo,
  isEnvironment,
  isDeploymentType,
  isProduction,
  isIAF,
  isLocal,
  isECS,
  buildServerUrl,
  buildApiUrl,
  logEnvironmentInfo,
  validateEnvironment
};