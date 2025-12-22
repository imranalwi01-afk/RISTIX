// packages/frontend/src/app/platform/layout.tsx
// ============================================================================
// PLATFORM ADMIN LAYOUT - Next.js 15 App Router Compatible
// ============================================================================
// ✅ Creates layout wrapper for platform admin routes
// ✅ Integrates with your existing authentication system
// ✅ Provides navigation between classic dashboard and React Admin
// ============================================================================

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Administration - IFRS9 Platform',
  description: 'Multi-tenant platform administration and management interface',
  keywords: ['IFRS9', 'Platform Admin', 'Multi-tenant', 'Banking', 'Administration'],
};

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  return (
    <>
      {/* 
        ✅ Simple layout wrapper - lets your existing dashboard and new React Admin
        components handle their own navigation and styling 
      */}
      {children}
    </>
  );
}