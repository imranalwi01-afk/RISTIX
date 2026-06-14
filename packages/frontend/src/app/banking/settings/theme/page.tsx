'use client';

import dynamic from 'next/dynamic';
import { LoadingFallback } from '@/components/common/LoadingSkeleton';

const PageContent = dynamic(() => import('./page.client'), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

export default function ThemeSettingsPage() {
  return <PageContent />;
}
