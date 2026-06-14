'use client';

import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./DashboardClientUI'), {
  ssr: false,
  loading: () => <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
});

export default function DashboardClientWrapper() {
  return <PageContent />;
}
