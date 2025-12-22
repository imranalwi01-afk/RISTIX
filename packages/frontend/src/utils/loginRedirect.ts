// packages/frontend/src/utils/loginRedirect.ts
// ============================================================================
// CORRECTED FOR YOUR ACTUAL DIRECT FOLDER STRUCTURE
// ============================================================================
// Your structure: src/app/banking/dashboard/page.tsx → URL: /banking/dashboard
// NOT route groups: (banking) → /dashboard

export type StakeholderType = 'platform-admin' | 'banking' | 'consultant' | 'regulator';

// ✅ Role to stakeholder mapping
export const ROLE_TO_STAKEHOLDER_MAP: Record<string, StakeholderType> = {
  // Platform Admin Roles
  'PLATFORM_SUPER_ADMIN': 'platform-admin',
  'PLATFORM_TECH_ADMIN': 'platform-admin',
  'PLATFORM_OPERATIONS': 'platform-admin',
  'PLATFORM_SUPPORT': 'platform-admin',

  // Banking Institution Roles (Conventional)
  'BANK_CRO': 'banking',
  'BANK_IFRS_MANAGER': 'banking',
  'BANK_RISK_ANALYST': 'banking',
  'BANK_PORTFOLIO_MANAGER': 'banking',
  'BANK_DATA_ADMIN': 'banking',

  // Banking Institution Roles (Syariah)
  'SYARIAH_BANK_CRO': 'banking',
  'SYARIAH_COMPLIANCE_OFFICER': 'banking',
  'SYARIAH_IFRS_SPECIALIST': 'banking',
  'SYARIAH_PORTFOLIO_MANAGER': 'banking',
  'DPS_BOARD_MEMBER': 'banking',

  // Universal Banking Roles
  'BANK_CEO': 'banking',
  'DUAL_BANKING_RISK_HEAD': 'banking',

  // Consultant Roles
  'SENIOR_IFRS9_CONSULTANT': 'consultant',
  'ISLAMIC_BANKING_CONSULTANT': 'consultant',
  'RISK_CONSULTANT': 'consultant',
  'TECHNICAL_SPECIALIST': 'consultant',
  'R_ANALYTICS_CONSULTANT': 'consultant',
  'CONSULTANT_PROJECT_MANAGER': 'consultant',

  // Regulator Roles
  'CENTRAL_BANK_DIRECTOR': 'regulator',
  'BANKING_SUPERVISION_HEAD': 'regulator',
  'IFRS_SUPERVISOR': 'regulator',
  'ISLAMIC_BANKING_DIRECTOR': 'regulator',
  'SYARIAH_COMPLIANCE_AUDITOR': 'regulator',
  'MARKET_RISK_SUPERVISOR': 'regulator',
};

// ✅ CORRECTED: Default dashboard routes for YOUR actual DIRECT FOLDER structure
export const STAKEHOLDER_DASHBOARDS: Record<StakeholderType, string> = {
  'platform-admin': '/platform/dashboard',
  'banking': '/banking/dashboard',  // ✅ YOUR STRUCTURE: direct folder → /banking/dashboard
  'consultant': '/consultant/dashboard',
  'regulator': '/regulator/dashboard',
};

// ✅ Banking redirect validation for YOUR direct folder structure
export const validateBankingRedirect = (path: string, userRole: string): string => {
  console.group('🔍 Banking Redirect Validation - YOUR STRUCTURE');
  console.log('Input path:', path);
  console.log('User role:', userRole);
  console.log('YOUR Structure: src/app/banking/dashboard/page.tsx → URL: /banking/dashboard');
  
  // ✅ For YOUR structure, banking users should go to /banking/dashboard
  if ((userRole.includes('BANK_') || userRole.includes('SYARIAH_'))) {
    if (path !== '/banking/dashboard') {
      console.log('🔧 Banking user detected, redirecting to /banking/dashboard');
      console.log('✅ Matches YOUR direct folder structure');
      console.groupEnd();
      return '/banking/dashboard';
    }
  }
  
  // ✅ If someone mistakenly expects route group URLs, correct them
  if (path === '/dashboard' && (userRole.includes('BANK_') || userRole.includes('SYARIAH_'))) {
    console.warn('🚨 ROUTE GROUP EXPECTATION: /dashboard detected for banking user');
    console.log('✅ CORRECTED: Redirecting to /banking/dashboard (YOUR structure)');
    console.groupEnd();
    return '/banking/dashboard';
  }
  
  console.log('✅ Path validation passed:', path);
  console.groupEnd();
  return path;
};

// ✅ Get stakeholder type from user role
export const getStakeholderType = (userRole: string): StakeholderType | null => {
  return ROLE_TO_STAKEHOLDER_MAP[userRole] || null;
};

// ✅ Get default dashboard for user role
export const getDefaultDashboard = (userRole: string): string => {
  const stakeholderType = getStakeholderType(userRole);
  return stakeholderType ? STAKEHOLDER_DASHBOARDS[stakeholderType] : '/login';
};

// ✅ Smart redirect with YOUR direct folder validation
export const getSmartRedirect = (
  userRole: string, 
  requestedPath?: string, 
  fallbackPath?: string
): string => {
  console.group('🎯 Smart Redirect - YOUR STRUCTURE');
  console.log('User role:', userRole);
  console.log('Requested path:', requestedPath);
  console.log('Fallback path:', fallbackPath);
  console.log('YOUR Banking Structure: direct folders → /banking/dashboard');
  
  const stakeholderType = getStakeholderType(userRole);
  
  if (!stakeholderType) {
    console.log('❌ Unknown role, redirecting to login');
    console.groupEnd();
    return '/login';
  }
  
  let targetPath = requestedPath || fallbackPath || STAKEHOLDER_DASHBOARDS[stakeholderType];
  
  // ✅ Banking route validation for YOUR structure
  if (stakeholderType === 'banking') {
    targetPath = validateBankingRedirect(targetPath, userRole);
  }
  
  console.log('✅ Final redirect path:', targetPath);
  console.log('🏢 Stakeholder type:', stakeholderType);
  
  // ✅ Validation for YOUR banking structure
  if (stakeholderType === 'banking' && targetPath === '/banking/dashboard') {
    console.log('📁 YOUR Route structure validation:');
    console.log('  - File: src/app/banking/dashboard/page.tsx');
    console.log('  - URL: /banking/dashboard');
    console.log('  - Direct folder structure correctly used');
  }
  
  console.groupEnd();
  return targetPath;
};

// ✅ Role-based access validation for YOUR structure
export const hasAccessToPath = (userRole: string, path: string): boolean => {
  const stakeholderType = getStakeholderType(userRole);
  
  if (!stakeholderType) {
    return false;
  }
  
  // ✅ CORRECTED: Access patterns for YOUR actual direct folder structure
  const accessPatterns: Record<StakeholderType, string[]> = {
    'platform-admin': ['/platform'],
    // ✅ YOUR banking structure: direct folders → URLs with /banking/ prefix
    'banking': ['/banking'],  // All banking routes start with /banking/
    'consultant': ['/consultant'],
    'regulator': ['/regulator'],
  };
  
  const allowedPatterns = accessPatterns[stakeholderType];
  return allowedPatterns.some(pattern => path.startsWith(pattern));
};

// ✅ YOUR actual banking route mapping (corrected)
export const BANKING_ROUTE_MAPPING = {
  // ✅ YOUR ACTUAL routes (direct folder implementation)
  dashboard: '/banking/dashboard',          // src/app/banking/dashboard/page.tsx
  analytics: '/banking/analytics',          // src/app/banking/analytics/page.tsx
  collective: '/banking/collective',        // src/app/banking/collective/page.tsx
  data: '/banking/data',                   // src/app/banking/data/page.tsx
  ifrs9: '/banking/ifrs9',                 // src/app/banking/ifrs9/page.tsx
  individual: '/banking/individual',        // src/app/banking/individual/page.tsx
  maintenance: '/banking/maintenance',      // src/app/banking/maintenance/page.tsx
  mode: '/banking/mode',                   // src/app/banking/mode/page.tsx
  parameters: '/banking/parameters',        // src/app/banking/parameters/page.tsx
  portfolio: '/banking/portfolio',          // src/app/banking/portfolio/page.tsx
  reports: '/banking/reports',             // src/app/banking/reports/page.tsx
  setup: '/banking/setup',                 // src/app/banking/setup/page.tsx
  tools: '/banking/tools',                 // src/app/banking/tools/page.tsx
  workflow: '/banking/workflow',           // src/app/banking/workflow/page.tsx
  
  // ❌ WRONG routes (would be route group expectations)
  // '/dashboard' → DOES NOT EXIST for banking in YOUR structure
  // '/ifrs9' → DOES NOT EXIST for banking in YOUR structure
  // etc.
};

// ✅ Development debugging helper for YOUR structure
export const debugRouting = (userRole: string, requestedPath: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔧 Routing Debug - YOUR STRUCTURE');
    console.log('User Role:', userRole);
    console.log('Requested Path:', requestedPath);
    console.log('Stakeholder Type:', getStakeholderType(userRole));
    console.log('Default Dashboard:', getDefaultDashboard(userRole));
    console.log('Has Access:', hasAccessToPath(userRole, requestedPath));
    console.log('Smart Redirect:', getSmartRedirect(userRole, requestedPath));
    
    if (userRole.includes('BANK_') || userRole.includes('SYARIAH_')) {
      console.log('🏦 Banking User - YOUR STRUCTURE:');
      console.log('  - YOUR Correct Routes:', Object.values(BANKING_ROUTE_MAPPING));
      console.log('  - YOUR File Structure: src/app/banking/[page]/page.tsx');
      console.log('  - YOUR URL Generation: Direct folders with /banking/ prefix');
      console.log('  - YOUR Dashboard: /banking/dashboard');
      
      if (requestedPath === '/dashboard') {
        console.error('🚨 ROUTE GROUP EXPECTATION:', requestedPath);
        console.log('✅ Should be:', '/banking/dashboard');
        console.log('✅ This matches YOUR actual direct folder implementation');
      }
    }
    
    console.groupEnd();
  }
};

export default {
  ROLE_TO_STAKEHOLDER_MAP,
  STAKEHOLDER_DASHBOARDS,
  validateBankingRedirect,
  getStakeholderType,
  getDefaultDashboard,
  getSmartRedirect,
  hasAccessToPath,
  BANKING_ROUTE_MAPPING,
  debugRouting,
};