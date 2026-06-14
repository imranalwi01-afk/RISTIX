// packages/frontend/src/utils/routingDiagnostic.ts
// ============================================================================
// ROUTING DIAGNOSTIC TOOL
// ============================================================================
// Run this to check what's causing the /dashboard 404 error
// ============================================================================

export function diagnoseRoutingIssue() {
  return {
    expectedBankingURL: '/banking/dashboard',
    problematicURL: '/dashboard',
    fileStructure: 'src/app/banking/dashboard/page.tsx',
    solution: 'Replace routing files with corrected versions'
  };
}

export function checkDemoUsers() {
  const demoUsers = [
    { role: 'BANK_CRO', expected: '/banking/dashboard' },
    { role: 'SYARIAH_BANK_CRO', expected: '/banking/dashboard' },
    { role: 'PLATFORM_SUPER_ADMIN', expected: '/platform/dashboard' },
    { role: 'SENIOR_IFRS9_CONSULTANT', expected: '/consultant/dashboard' },
    { role: 'CENTRAL_BANK_DIRECTOR', expected: '/regulator/dashboard' }
  ];
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

if (typeof window !== 'undefined') {
  (window as any).diagnoseRouting = diagnoseRoutingIssue;
  (window as any).checkDemoUsers = checkDemoUsers;
  (window as any).getCorrectConfig = getCorrectRoutingConfig;
}