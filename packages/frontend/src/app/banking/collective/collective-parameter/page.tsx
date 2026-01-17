// packages/frontend/src/app/banking/collective/collective-parameter/page.tsx
import { Suspense } from 'react'
import CollectiveParameterClient from './CollectiveParameterClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collective Parameters | IFRS 9 Platform',
  description: 'Manage collective impairment parameters and module orchestration.',
}

export default function CollectiveParameterPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <CollectiveParameterClient />
    </Suspense>
  )
}