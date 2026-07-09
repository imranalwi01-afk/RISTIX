// packages/frontend/src/app/banking/collective/bucket/page.tsx
import { Suspense } from 'react'
import BucketClient from './BucketClient'
import CollectiveLoading from '../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bucket Parameters | PSAK 413 Platform',
  description: 'Configure staging bucket parameters for PSAK 413 impairment calculations.',
}

export default function BucketPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <BucketClient />
    </Suspense>
  )
}