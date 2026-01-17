// packages/frontend/src/app/banking/collective/lgd-setup/page.tsx
import { Suspense } from 'react'
import LGDSetupClient from './LGDSetupClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LGD Setup | IFRS 9 Platform',
  description: 'Configure Loss Given Default (LGD) parameters for IFRS 9 calculations.',
}

export default function LGDSetupPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <LGDSetupClient />
    </Suspense>
  )
}
