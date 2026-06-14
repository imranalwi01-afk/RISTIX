'use client';

import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';

const AccessManagementPage = dynamic(
  () => import('@/components/maintenance/AccessManagementPage'),
  { ssr: false, loading: () => <TableSkeleton /> }
);

export default function AccessManagementPageRoute() {
  return <AccessManagementPage />;
}
