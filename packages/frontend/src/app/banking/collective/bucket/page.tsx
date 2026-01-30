// packages/frontend/src/app/banking/collective/bucket/page.tsx
import { Suspense } from 'react'
import BucketClient from './BucketClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bucket Parameters | IFRS 9 Platform',
  description: 'Configure staging bucket parameters for IFRS 9 impairment calculations.',
}

export default function BucketPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <BucketClient />
    </Suspense>
  )
}