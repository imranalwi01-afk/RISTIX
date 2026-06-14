'use client';

import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';

const PageContent = dynamic(() => import('./ECLConfigClient.client'), {
  ssr: false,
  loading: () => <TableSkeleton />
});

export default function ECLConfigClientWrapper() {
  return <PageContent />;
}
