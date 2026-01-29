// packages/frontend/src/app/consultant/layout.tsx
// ============================================================================
// IFRS9 FRONTEND - CONSULTANT ROUTE GROUP LAYOUT
// ============================================================================

import React from 'react';
import ConsultantLayout from '../../components/navigation/layouts/ConsultantLayout';

export default function ConsultantRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsultantLayout title="Consultant Portal">
      {children as any}
    </ConsultantLayout>
  );
}
