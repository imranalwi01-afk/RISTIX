// packages/frontend/src/app/banking/collective/ead-setup/page.tsx
import { Suspense } from 'react'
import EADSetupClient from './EADSetupClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EAD Setup | PSAK 413 Platform',
  description: 'Configure Exposure at Default (EAD) parameters for PSAK 413 calculations.',
}

export default function EADSetupPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <EADSetupClient />
    </Suspense>
  )
}
