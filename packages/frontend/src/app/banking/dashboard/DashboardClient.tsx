'use client';

import dynamic from 'next/dynamic';
import { LoadingFallback } from '@/components/common/LoadingSkeleton';

const PageContent = dynamic(() => import('./DashboardClientUI'), {
  ssr: false,
  loading: () => <LoadingFallback />
});

export default function DashboardClientWrapper() {
  return <PageContent />;
}
