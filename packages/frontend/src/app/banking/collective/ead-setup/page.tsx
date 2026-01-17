// packages/frontend/src/app/banking/collective/ead-setup/page.tsx
import { Suspense } from 'react'
import EADSetupClient from './EADSetupClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EAD Setup | IFRS 9 Platform',
  description: 'Configure Exposure at Default (EAD) parameters for IFRS 9 calculations.',
}

export default function EADSetupPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <EADSetupClient />
    </Suspense>
  )
}
