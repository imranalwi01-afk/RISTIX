// ============================================================================
// REDIRECT DIAGNOSTIC SCRIPT
// ============================================================================
// File Path: packages/frontend/src/utils/redirectDiagnostic.ts
// Purpose: Find where wrong redirects are coming from
// Usage: Add to your login page temporarily for debugging
// ============================================================================

// ✅ Add this to your browser console after loading the page
export function diagnoseRedirects() {
  console.group('🔍 REDIRECT DIAGNOSTIC');

  // Check current URL and environment

  // Check stored user data
  const userData = localStorage.getItem('ifrs9_user_data');
  if (userData) {
    const user = JSON.parse(userData);

    // Test our redirect function
    import('./loginRedirect').then(({ getLoginRedirectUrl }) => {
      const correctRedirect = getLoginRedirectUrl(user.role || user.userRole || 'BANK_CRO'); // Safe fallback

      if (window.location.pathname !== correctRedirect) {
        console.warn('❌ WRONG REDIRECT DETECTED!');
        console.warn('Current:', window.location.pathname);
        console.warn('Should be:', correctRedirect);

        // Offer to fix immediately
        const shouldFix = confirm(`Wrong redirect detected!\nCurrent: ${window.location.pathname}\nShould be: ${correctRedirect}\n\nFix now?`);
        if (shouldFix) {
          window.location.href = correctRedirect;
        }
      } else {
      }
    });
  } else {
    console.warn('No user data found in localStorage');
  }

  // Check for hardcoded redirects in code

  // This will help identify where the wrong redirect is coming from
  const originalPush = History.prototype.pushState;
  History.prototype.pushState = function (state, title, url) {
    if (typeof url === 'string' && url.includes('/banking/')) {
      console.error('🚨 FOUND HARDCODED /banking/ REDIRECT:', url);
      console.trace('Stack trace to identify source:');
    }
    return originalPush.apply(this, arguments as any);
  };

  // Check router if available
  if ((window as any).next && (window as any).next.router) {
    const originalRouterPush = (window as any).next.router.push;
    (window as any).next.router.push = function (url: any, as: any, options: any) {
      if (typeof url === 'string' && url.includes('/banking/')) {
        console.error('🚨 FOUND Next.js ROUTER /banking/ REDIRECT:', url);
        console.trace('Stack trace to identify source:');
      }
      return originalRouterPush.call(this, url, as, options);
    };
  }

  console.groupEnd();
}

// ✅ Auto-run diagnostic in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', diagnoseRedirects);
  } else {
    diagnoseRedirects();
  }

  // Make available globally for manual testing
  (window as any).diagnoseRedirects = diagnoseRedirects;
}

// ✅ Export for manual use
export default diagnoseRedirects;