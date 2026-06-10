'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { IADcfDetailClient } from './IADcfDetailClient';

function IADCFDetailPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  return <IADcfDetailClient accountId={accountId} accountNumber={accountNumber} />;
}

export default function IADCFDetailPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <IADCFDetailPage />
    </Suspense>
  );
}
