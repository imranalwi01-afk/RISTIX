'use client';

import dynamic from 'next/dynamic';

const PageContent = dynamic(() => import('./ApplicationClient.client'), {
  ssr: false,
  loading: () => <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
});

export default function ApplicationClientWrapper() {
  return <PageContent />;
}
