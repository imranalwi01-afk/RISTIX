// packages/frontend/src/data/demoUsers.ts
// ============================================================================
// IFRS9 IAF PLATFORM - IAF-SPECIFIC DEMO USERS DATABASE
// ============================================================================
// ✅ IAF ONLY: cleaned for single-tenant IAF deployment
// ✅ FOCUSED: Only IAF tenant users and platform administrators
// ============================================================================

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
  stakeholder: 'banking' | 'platform' | 'consultant' | 'regulator';
  bankingType: 'conventional' | null;
  company: string;
  tenantId: string | null;
  redirectUrl: string;
  description: string;
  avatar: string;
  department?: string;
  position?: string;
}

// ============================================================================
// IAF DEMO USERS DATABASE - SINGLE TENANT FOCUS
// ============================================================================
export const DEMO_USERS: DemoUser[] = [
  // ============================================================================
  // IAF INDONESIA AIRAWATA FINANCE USERS (5 Users) - Tenant: iaf
  // ============================================================================
  {
    id: 'iaf-cro-1',
    email: 'cro@iaf.co.id',
    name: 'Rizki Pratama',
    role: 'BANK_CRO',
    stakeholder: 'banking',
    bankingType: 'conventional',
    company: 'Indonesia Airawata Finance',
    tenantId: 'iaf',
    redirectUrl: '/banking/dashboard',
    description: 'Chief Risk Officer - Indonesia Airawata Finance',
    avatar: '👨‍💼',
    department: 'Risk Management',
    position: 'Chief Risk Officer'
  },
  {
    id: 'iaf-ifrs-1',
    email: 'ifrs.manager@iaf.co.id',
    name: 'Siti Nurhaliza',
    role: 'BANK_IFRS_MANAGER',
    stakeholder: 'banking',
    bankingType: 'conventional',
    company: 'Indonesia Airawata Finance',
    tenantId: 'iaf',
    redirectUrl: '/banking/dashboard',
    description: 'IFRS 9 Manager - Indonesia Airawata Finance',
    avatar: '👩‍💼',
    department: 'Risk Management',
    position: 'IFRS Manager'
  },
  {
    id: 'iaf-risk-1',
    email: 'risk.analyst@iaf.co.id',
    name: 'Budi Santoso',
    role: 'BANK_RISK_ANALYST',
    stakeholder: 'banking',
    bankingType: 'conventional',
    company: 'Indonesia Airawata Finance',
    tenantId: 'iaf',
    redirectUrl: '/banking/dashboard',
    description: 'Senior Risk Analyst - Indonesia Airawata Finance',
    avatar: '👨‍💻',
    department: 'Risk Management',
    position: 'Risk Analyst'
  },
  {
    id: 'iaf-portfolio-1',
    email: 'portfolio.manager@iaf.co.id',
    name: 'Dewi Lestari',
    role: 'BANK_PORTFOLIO_MANAGER',
    stakeholder: 'banking',
    bankingType: 'conventional',
    company: 'Indonesia Airawata Finance',
    tenantId: 'iaf',
    redirectUrl: '/banking/dashboard',
    description: 'Portfolio Manager - Indonesia Airawata Finance',
    avatar: '👩‍💻',
    department: 'Portfolio Management',
    position: 'Portfolio Manager'
  },
  {
    id: 'iaf-data-1',
    email: 'data.admin@iaf.co.id',
    name: 'Ahmad Wijaya',
    role: 'BANK_DATA_ADMIN',
    stakeholder: 'banking',
    bankingType: 'conventional',
    company: 'Indonesia Airawata Finance',
    tenantId: 'iaf',
    redirectUrl: '/banking/dashboard',
    description: 'Data Administrator - Indonesia Airawata Finance',
    avatar: '👨‍💻',
    department: 'Data Management',
    position: 'Data Administrator'
  },

  // ============================================================================
  // PLATFORM ADMIN USERS (1 User) - No Tenant
  // ============================================================================
  {
    id: 'platform-admin-1',
    email: 'admin@ifrspro.id',
    name: 'Michael Zhang',
    role: 'PLATFORM_SUPER_ADMIN',
    stakeholder: 'platform',
    bankingType: null,
    company: 'i9model Platform',
    tenantId: null,
    redirectUrl: '/platform/dashboard',
    description: 'Platform Super Administrator',
    avatar: '👨‍💻',
    department: 'Platform Operations',
    position: 'Super Administrator'
  },

  // ============================================================================
  // CONSULTANT USERS (1 User) - No Tenant
  // ============================================================================
  {
    id: 'consultant-1',
    email: 'consultant@pwc.com',
    name: 'Jennifer Smith',
    role: 'SENIOR_IFRS9_CONSULTANT',
    stakeholder: 'consultant',
    bankingType: null,
    company: 'PwC',
    tenantId: null,
    redirectUrl: '/consultant/dashboard',
    description: 'Senior IFRS 9 Consultant - PwC',
    avatar: '👩‍🎓',
    department: 'Financial Services',
    position: 'Senior Consultant'
  },

  // ============================================================================
  // REGULATOR USERS (1 User) - No Tenant
  // ============================================================================
  {
    id: 'regulator-1',
    email: 'supervisor@bi.go.id',
    name: 'Dr. Indra Sari',
    role: 'BANKING_SUPERVISION_HEAD',
    stakeholder: 'regulator',
    bankingType: null,
    company: 'Bank Indonesia',
    tenantId: null,
    redirectUrl: '/regulator/dashboard',
    description: 'Head of Banking Supervision - BI',
    avatar: '👩‍⚖️',
    department: 'Banking Supervision',
    position: 'Head of Supervision'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get stakeholder type from user role
 */
export const getStakeholderType = (user: DemoUser): string => {
  if (user.role.includes('BANK_') || user.role.includes('DPS_')) {
    return 'banking';
  }
  if (user.role.includes('PLATFORM_')) {
    return 'platform';
  }
  if (user.role.includes('CONSULTANT')) {
    return 'consultant';
  }
  return 'regulator';
};

/**
 * Validate user route and correct if needed
 */
export const validateUserRoute = (user: DemoUser): string => {
  const stakeholderType = getStakeholderType(user);
  
  // Banking users should go to /banking/dashboard
  if (stakeholderType === 'banking' && user.redirectUrl !== '/banking/dashboard') {
    console.warn(`🚨 CORRECTING ROUTE: ${user.redirectUrl} -> /banking/dashboard`);
    return '/banking/dashboard';
  }
  
  return user.redirectUrl;
};

/**
 * Group users by stakeholder type for UI display
 */
export const getGroupedUsers = () => {
  return DEMO_USERS.reduce((acc, user) => {
    const stakeholder = getStakeholderType(user);
    if (!acc[stakeholder]) acc[stakeholder] = [];
    acc[stakeholder].push(user);
    return acc;
  }, {} as Record<string, DemoUser[]>);
};

/**
 * Get user by email
 */
export const getUserByEmail = (email: string): DemoUser | undefined => {
  return DEMO_USERS.find(user => user.email === email);
};

/**
 * Get users by tenant
 */
export const getUsersByTenant = (tenantId: string | null): DemoUser[] => {
  return DEMO_USERS.filter(user => user.tenantId === tenantId);
};

/**
 * Check if user needs tenant ID for authentication
 */
export const userNeedsTenantId = (user: DemoUser): boolean => {
  return user.tenantId !== null;
};

// ============================================================================
// AUTHENTICATION CONSTANTS
// ============================================================================

export const AUTH_CONFIG = {
  DEMO_PASSWORD: '1019181716',
  get API_BASE_URL() {
    // ❌ REMOVED HARDCODED VALUES - Use centralized configuration system
    // Import and use the frontend environment loader for consistent URL resolution
    if (typeof window !== 'undefined') {
      try {
        // Dynamically import to avoid circular dependencies
        const { frontendEnvironmentLoader } = require('../config/environment-loader-frontend');
        const config = frontendEnvironmentLoader.getConfiguration();
        return config.urls?.backend || config.api?.backend || '';
      } catch (error) {
        console.warn('⚠️ [DEMO USERS] Could not load environment config, using fallback');
        return process.env.NEXT_PUBLIC_API_URL || '';
      }
    }
    return process.env.NEXT_PUBLIC_API_URL || '';
  },
  LOGIN_ENDPOINT: '/auth/login',
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_DATA_KEY: 'user_data'
};

// ============================================================================
// IAF TENANT CONFIGURATION - SINGLE TENANT
// ============================================================================

export const TENANT_CONFIG = {
  iaf: {
    name: 'Indonesia Airawata Finance',
    bankingType: 'conventional',
    theme: 'primary',
    users: 5
  }
} as const;

export type TenantId = keyof typeof TENANT_CONFIG;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default DEMO_USERS;