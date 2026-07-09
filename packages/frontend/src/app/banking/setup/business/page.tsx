// packages/frontend/src/app/banking/setup/business/page.tsx
import { Suspense } from 'react'
import BusinessClient from './BusinessClient'
import SetupLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Setup | PSAK 413 Platform',
  description: 'Configure business settings and parameters for PSAK 413 calculations.',
}

export default function BusinessSetupPage() {
  return (
    <Suspense fallback={<SetupLoading />}>
      <BusinessClient />
    </Suspense>
  )
}