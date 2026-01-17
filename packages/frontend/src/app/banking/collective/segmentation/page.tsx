// packages/frontend/src/app/banking/collective/segmentation/page.tsx
// ============================================================================
// 🚀 Segmentation Configuration - Server Component Wrapper
// ============================================================================
// ✅ PATTERN: Small server component that wraps client component
// ✅ BENEFITS: Faster navigation, better code splitting, streaming support
// ============================================================================

import { Suspense } from 'react'
import SegmentationClient from './SegmentationClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

// SEO Metadata (runs on server)
export const metadata: Metadata = {
  title: 'Segmentation Configuration | IFRS 9 Platform',
  description: 'Configure population segmentation rules for IFRS 9 ECL calculations.',
}

// Server Component - renders instantly on navigation
export default function SegmentationPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <SegmentationClient />
    </Suspense>
  )
}