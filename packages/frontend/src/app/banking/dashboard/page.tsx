// packages/frontend/src/app/banking/dashboard/page.tsx
// ============================================================================
// 🚀 Banking Dashboard - Server Component Wrapper
// ============================================================================
// ✅ PATTERN: Small server component that wraps client component
// ✅ BENEFITS: Faster navigation, better code splitting, streaming support
// ============================================================================

import { Suspense } from 'react'
import DashboardClient from './DashboardClient'
import DashboardLoading from './loading'
import type { Metadata } from 'next'

// SEO Metadata (runs on server)
export const metadata: Metadata = {
  title: 'Banking Dashboard | IFRS 9 Platform',
  description: 'Real-time ECL calculations, portfolio metrics, and risk management dashboard for IFRS 9 compliance.',
}

// Server Component - renders instantly on navigation
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient />
    </Suspense>
  )
}