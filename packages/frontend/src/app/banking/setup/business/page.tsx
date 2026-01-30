// packages/frontend/src/app/banking/setup/business/page.tsx
import { Suspense } from 'react'
import BusinessClient from './BusinessClient'
import SetupLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Setup | IFRS 9 Platform',
  description: 'Configure business settings and parameters for IFRS 9 calculations.',
}

export default function BusinessSetupPage() {
  return (
    <Suspense fallback={<SetupLoading />}>
      <BusinessClient />
    </Suspense>
  )
}