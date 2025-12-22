// packages/frontend/src/app/regulator/layout.tsx
// ============================================================================
// IFRS9 FRONTEND - REGULATOR ROUTE GROUP LAYOUT
// ============================================================================

import React from 'react';
import RegulatorLayout from '../../components/navigation/layouts/RegulatorLayout';

export default function RegulatorRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegulatorLayout>
      {children}
    </RegulatorLayout>
  );
}
