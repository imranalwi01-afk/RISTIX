// packages/frontend/src/app/banking/collective/lgd-setup/page.tsx
import { Suspense } from 'react'
import LGDSetupClient from './LGDSetupClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LGD Setup | PSAK 413 Platform',
  description: 'Configure Loss Given Default (LGD) parameters for PSAK 413 calculations.',
}

export default function LGDSetupPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <LGDSetupClient />
    </Suspense>
  )
}
