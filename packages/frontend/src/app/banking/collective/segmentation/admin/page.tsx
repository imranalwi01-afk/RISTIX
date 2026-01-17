// packages/frontend/src/app/banking/collective/segmentation/admin/page.tsx
import { Suspense } from 'react'
import AdminClient from './AdminClient'
import CollectiveLoading from '../../loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Segmentation Admin | IFRS 9 Platform',
  description: 'Advanced segmentation administration with React Admin integration.',
}

export default function SegmentationAdminPage() {
  return (
    <Suspense fallback={<CollectiveLoading />}>
      <AdminClient />
    </Suspense>
  )
}