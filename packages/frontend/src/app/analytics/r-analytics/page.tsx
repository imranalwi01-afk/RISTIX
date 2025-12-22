// packages/frontend/src/app/analytics/r-analytics/page.tsx
// ============================================================================
// 🔄 R ANALYTICS ROUTE REDIRECT
// ============================================================================
// Purpose: Redirect /analytics/r-analytics to /banking/analytics/r-analytics
// This ensures backward compatibility and provides a cleaner URL for users
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RAnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct R-Analytics page
    router.replace('/banking/analytics/r-analytics');
  }, [router]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>
          Redirecting to R Analytics...
        </h2>
        <p style={{ color: '#666', margin: 0 }}>
          Taking you to the IFRS9 R Analytics dashboard
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}