// packages/frontend/src/app/banking/collective/fl-scalar/page.tsx
import { Suspense } from 'react'
import FLScalarClient from './FLScalarClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forward Looking Scalar | IFRS 9 Platform',
  description: 'Configure Forward Looking scalar adjustments for PD models.',
}

export default function FLScalarPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <FLScalarClient />
    </Suspense>
  )
}