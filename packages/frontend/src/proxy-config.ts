// packages/frontend/src/proxy-config.ts
// ============================================================================
// Static configuration constants for the proxy
// ============================================================================

// ✅ Route to Permission Mapping (Strictly Permission-Based)
export const ROUTE_PERMISSION_MAP: Record<string, string | string[]> = {
  // Module Access
  '/platform': 'admin.system.view',
  '/consultant': 'consultant.access',
  '/regulator': 'regulator.access',

  // Dashboard
  // Dashboard should be accessible to any banking user with at least one banking.* permission.
  '/banking/dashboard': 'banking.dashboard.view',

  // Impairment Modules
  '/banking/collective': 'banking.collective.bucket.view',
  '/banking/individual': 'banking.individual.view',

  // Analytics
  '/banking/analytics': 'banking.analytics.r.view',

  // System Setup (Strictly Protected)
  '/banking/setup/application': 'banking.setup.application.view',
  '/banking/setup/business': 'banking.setup.business.view',
  '/banking/setup': 'banking.setup.view',
  '/banking/parameters': 'banking.parameter.product.view',
  '/banking/maintenance/approval': 'approval.requests.approve',
  '/banking/maintenance/user-activity': 'admin.maintenance.user_activity.view',
  '/banking/maintenance/access-management': ['admin.users.view', 'admin.roles.view'],
  '/banking/maintenance/menu-matrix': 'admin.maintenance.menu_matrix.view',
  '/banking/maintenance/smtp': ['admin.maintenance.smtp.view', 'admin.super_admin'],
  '/banking/maintenance/impersonate': 'admin.super_admin',
  '/banking/maintenance/job-monitoring': ['jobs.view', 'admin.system.view'],
  '/banking/maintenance': 'admin.system.view',
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
