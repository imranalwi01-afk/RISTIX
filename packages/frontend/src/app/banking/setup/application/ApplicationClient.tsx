'use client';

import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';

const PageContent = dynamic(() => import('./ApplicationClient.client'), {
  ssr: false,
  loading: () => <TableSkeleton />
});

export default function ApplicationClientWrapper() {
  return <PageContent />;
}
