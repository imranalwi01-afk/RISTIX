// packages/frontend/src/utils/routingDebugFix.ts
// ============================================================================
// BANKING DASHBOARD ROUTING DEBUG FIX
// ============================================================================
// ✅ This helps debug why consultant dashboard is loading instead of banking
// ✅ Run this in browser console to identify the issue
// ============================================================================

export function debugBankingRouting() {
  console.group('🔍 BANKING ROUTING DEBUG');
  
  // Check current URL
  console.log('Current URL:', window.location.href);
  console.log('Current Pathname:', window.location.pathname);
  console.log('Expected:', '/banking/dashboard');
  
  // Check cookies
  const authToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];
  
  if (authToken) {
    try {
      const userData = JSON.parse(atob(authToken));
      console.log('User Data:', userData);
      console.log('User Role:', userData.role);
      console.log('Stakeholder:', userData.stakeholder);
      
      // Check if role should be banking
      const isBankingRole = userData.role?.includes('BANK_') || 
                           userData.role?.includes('SYARIAH_') ||
                           userData.role?.includes('DPS_');
      
      console.log('Should be banking user:', isBankingRole);
      
      if (isBankingRole && window.location.pathname !== '/banking/dashboard') {
        console.error('🚨 ROUTING ISSUE: Banking user not on banking dashboard');
        console.log('✅ SOLUTION: Redirect to /banking/dashboard');
        
        const shouldRedirect = confirm('Banking user detected but not on banking dashboard. Redirect now?');
        if (shouldRedirect) {
          window.location.href = '/banking/dashboard';
        }
      }
      
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  } else {
    console.warn('No auth token found');
  }
  
  // Check if middleware is working
  console.log('Middleware should protect /banking/* routes');
  console.log('Public routes: /, /login, /register, etc.');
  
  console.groupEnd();
}

// Auto-run debug when banking page loads
if (typeof window !== 'undefined' && window.location.pathname.includes('/banking/')) {
  console.log('🔧 Banking route detected, running debug...');
  setTimeout(debugBankingRouting, 1000);
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).debugBankingRouting = debugBankingRouting;
  console.log('🔧 Banking routing debug available: debugBankingRouting()');
}