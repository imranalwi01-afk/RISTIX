// packages/frontend/src/app/banking/collective/rule-base/page.tsx
import { Suspense } from 'react'
import RuleBaseClient from './RuleBaseClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rule Base Configuration | PSAK 413 Platform',
  description: 'Configure staging rules and migration logic for PSAK 413 calculations.',
}

export default function RuleBasePage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <RuleBaseClient />
    </Suspense>
  )
}