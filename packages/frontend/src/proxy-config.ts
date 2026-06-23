// packages/frontend/src/proxy-config.ts
// ============================================================================
// Static configuration constants for the proxy
// ============================================================================

// ✅ Route to Permission Mapping (Strictly Permission-Based)
export const ROUTE_PERMISSION_MAP: Record<string, string | string[]> = {
  // Module Access
  '/platform': 'admin.system.manage',
  '/consultant': 'consultant.access',
  '/regulator': 'regulator.access',

  // Dashboard
  // Dashboard should be accessible to any banking user with at least one banking.* permission.
  '/banking/dashboard': 'banking',

  // Impairment Modules
  '/banking/collective': 'banking.collective.view',
  '/banking/individual': 'banking.individual.view',

  // Analytics
  '/banking/analytics': 'banking.analytics.r.view',

  // System Setup (Strictly Protected)
  '/banking/setup/application': 'banking.setup.application',
  '/banking/setup/business': 'banking.setup.business',
  '/banking/setup': 'banking.setup',
  '/banking/parameters': 'banking.parameter',
  '/banking/maintenance/approval': 'approval.requests.approve',
  '/banking/maintenance/user-activity': 'admin.maintenance.access',
  '/banking/maintenance/access-management': ['admin.users.manage', 'admin.roles.manage', 'admin.maintenance.access'],
  '/banking/maintenance/job-monitoring': 'jobs',
  '/banking/maintenance': 'admin.users.manage', // Often includes role management

  // Tools
  '/banking/tools': 'banking.configuration.ifrs9.manage'
};

// ✅ SURGICAL ENHANCEMENT: Banking mode URL patterns
export const BANKING_MODE_PATTERNS = {
  conventional: [
    '/banking/conventional',
    '/conventional'
  ]
};

// ✅ Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/platform/login', // ✅ Allow platform login page
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/logout',  // ✅ ENHANCED: Allow logout route without auth checks
  '/showcase', // ✅ Allow showcase page publicly
  '/system/health' // ✅ EXPLICIT: Allow health check proxy to bypass auth
];

// ✅ Default redirects
export const STAKEHOLDER_REDIRECTS: Record<string, string> = {
  banking: '/banking/dashboard',
  platform: '/platform/users',
  consultant: '/consultant/dashboard',
  regulator: '/regulator/dashboard'
};
