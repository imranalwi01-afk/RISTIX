// packages/frontend/src/utils/routingDiagnostic.ts
// ============================================================================
// ROUTING DIAGNOSTIC TOOL
// ============================================================================
// Run this to check what's causing the /dashboard 404 error
// ============================================================================

export function diagnoseRoutingIssue() {
  console.log('🔍 ROUTING DIAGNOSTIC - CHECKING YOUR STRUCTURE');
  console.log('=====================================');
  
  // Check 1: File Structure vs Expected URLs
  console.log('📁 FILE STRUCTURE ANALYSIS:');
  console.log('Your tree shows: src/app/banking/dashboard/page.tsx');
  console.log('This should create URL: /banking/dashboard');
  console.log('NOT: /dashboard');
  console.log('');
  
  // Check 2: Current Routing Configuration
  console.log('🔧 CURRENT ROUTING CONFIGURATION:');
  
  // Check if loginRedirect exists and what it contains
  try {
    const loginRedirectModule = require('../utils/loginRedirect');
    console.log('loginRedirect.STAKEHOLDER_DASHBOARDS:', loginRedirectModule.STAKEHOLDER_DASHBOARDS);
    
    const bankingDashboard = loginRedirectModule.STAKEHOLDER_DASHBOARDS?.banking;
    if (bankingDashboard === '/dashboard') {
      console.error('❌ FOUND THE PROBLEM: loginRedirect still expects /dashboard');
      console.error('   This should be /banking/dashboard for your structure');
    } else if (bankingDashboard === '/banking/dashboard') {
      console.log('✅ loginRedirect is correct: /banking/dashboard');
    } else {
      console.warn('⚠️ Unexpected banking dashboard URL:', bankingDashboard);
    }
  } catch (error) {
    console.log('📄 loginRedirect not found or has import issues');
  }
  
  // Check 3: Middleware Configuration
  console.log('');
  console.log('🔐 MIDDLEWARE ANALYSIS:');
  console.log('Middleware should protect: /banking/*');
  console.log('Middleware should NOT protect: /dashboard (since it doesn\'t exist)');
  
  // Check 4: Demo User Configuration
  console.log('');
  console.log('🎭 DEMO USER ANALYSIS:');
  console.log('Demo users should redirect to: /banking/dashboard');
  console.log('If they redirect to /dashboard, that will cause 404');
  
  // Check 5: Possible Sources of /dashboard Request
  console.log('');
  console.log('🚨 POSSIBLE SOURCES OF /dashboard 404:');
  console.log('1. Old loginRedirect.ts file (STAKEHOLDER_DASHBOARDS.banking = "/dashboard")');
  console.log('2. Hard-coded redirects in components');
  console.log('3. Cached Redux state');
  console.log('4. Browser history/cached redirects');
  
  // Check 6: Solution Steps
  console.log('');
  console.log('🔧 SOLUTION STEPS:');
  console.log('1. Update packages/frontend/src/utils/loginRedirect.ts');
  console.log('2. Update packages/frontend/src/components/navigation/StakeholderRouter.tsx');
  console.log('3. Update packages/frontend/src/middleware.ts');
  console.log('4. Update packages/frontend/src/app/page.tsx');
  console.log('5. Clear browser cache and restart server');
  
  return {
    expectedBankingURL: '/banking/dashboard',
    problematicURL: '/dashboard',
    fileStructure: 'src/app/banking/dashboard/page.tsx',
    solution: 'Replace routing files with corrected versions'
  };
}

// Check specific demo user configuration
export function checkDemoUsers() {
  console.log('🎭 DEMO USER REDIRECT CHECK');
  console.log('==========================');
  
  const demoUsers = [
    { role: 'BANK_CRO', expected: '/banking/dashboard' },
    { role: 'SYARIAH_BANK_CRO', expected: '/banking/dashboard' },
    { role: 'PLATFORM_SUPER_ADMIN', expected: '/platform/dashboard' },
    { role: 'SENIOR_IFRS9_CONSULTANT', expected: '/consultant/dashboard' },
    { role: 'CENTRAL_BANK_DIRECTOR', expected: '/regulator/dashboard' }
  ];
  
  demoUsers.forEach(user => {
    console.log(`${user.role} → should redirect to: ${user.expected}`);
  });
  
  console.log('');
  console.log('❌ WRONG: Banking users → /dashboard (causes 404)');
  console.log('✅ CORRECT: Banking users → /banking/dashboard');
}

// Quick fix function
export function getCorrectRoutingConfig() {
  return {
    STAKEHOLDER_DASHBOARDS: {
      'platform-admin': '/platform/dashboard',
      'banking': '/banking/dashboard',        // ✅ CORRECT for your structure
      'consultant': '/consultant/dashboard',
      'regulator': '/regulator/dashboard',
    },
    PROTECTED_ROUTES: {
      '/banking': ['BANK_CRO', 'BANK_IFRS_MANAGER', /* etc */],
      '/platform': ['PLATFORM_SUPER_ADMIN', /* etc */],
      '/consultant': ['SENIOR_IFRS9_CONSULTANT', /* etc */],
      '/regulator': ['CENTRAL_BANK_DIRECTOR', /* etc */]
    }
  };
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).diagnoseRouting = diagnoseRoutingIssue;
  (window as any).checkDemoUsers = checkDemoUsers;
  (window as any).getCorrectConfig = getCorrectRoutingConfig;
  
  console.log('🔧 Routing diagnostic loaded!');
  console.log('Run in browser console:');
  console.log('- diagnoseRouting()');
  console.log('- checkDemoUsers()');
  console.log('- getCorrectConfig()');
}