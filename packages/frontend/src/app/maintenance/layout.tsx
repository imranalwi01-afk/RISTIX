// packages/frontend/src/app/maintenance/layout.tsx
// ============================================================================
// 🗄️ IAF MAINTENANCE SECTION LAYOUT
// ============================================================================
// ✅ PURPOSE: Layout wrapper for maintenance section routes
// ✅ IMPLEMENTATION: Minimal layout that redirects to banking maintenance
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // If someone accesses /maintenance directly, redirect to banking maintenance
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname === '/maintenance' || pathname === '/maintenance/') {
        router.replace('/banking/maintenance');
        return;
      }
    }
  }, [router]);

  return <>{children}</>;
}