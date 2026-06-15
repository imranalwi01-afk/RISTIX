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
  
  // Check cookies
  const authToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];
  
  if (authToken) {
    try {
      const userData = JSON.parse(atob(authToken));
      
      // Check if role should be banking
      const isBankingRole = userData.role?.includes('BANK_') || 
                           userData.role?.includes('DPS_');
      
      
      if (isBankingRole && window.location.pathname !== '/banking/dashboard') {
        console.error('🚨 ROUTING ISSUE: Banking user not on banking dashboard');
        
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
  console.groupEnd();
}

// Auto-run debug when banking page loads
if (typeof window !== 'undefined' && window.location.pathname.includes('/banking/')) {
  setTimeout(debugBankingRouting, 1000);
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).debugBankingRouting = debugBankingRouting;
}