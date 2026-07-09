// packages/frontend/src/app/banking/collective/pd-setup/page.tsx
import { Suspense } from 'react'
import PDSetupClient from './PDSetupClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PD Setup | PSAK 413 Platform',
  description: 'Configure Probability of Default (PD) parameters for PSAK 413 calculations.',
}

export default function PDSetupPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <PDSetupClient />
    </Suspense>
  )
}