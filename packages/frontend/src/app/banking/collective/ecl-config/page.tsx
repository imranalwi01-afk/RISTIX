// packages/frontend/src/app/banking/collective/ecl-config/page.tsx
import { Suspense } from 'react'
import ECLConfigClient from './ECLConfigClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECL Configuration | IFRS 9 Platform',
  description: 'Configure Expected Credit Loss (ECL) calculation parameters.',
}

export default function ECLConfigPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <ECLConfigClient />
    </Suspense>
  )
}
