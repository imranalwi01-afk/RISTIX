// packages/frontend/src/app/banking/collective/rule-base/page.tsx
import { Suspense } from 'react'
import RuleBaseClient from './RuleBaseClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rule Base Configuration | IFRS 9 Platform',
  description: 'Configure staging rules and migration logic for IFRS 9 calculations.',
}

export default function RuleBasePage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <RuleBaseClient />
    </Suspense>
  )
}