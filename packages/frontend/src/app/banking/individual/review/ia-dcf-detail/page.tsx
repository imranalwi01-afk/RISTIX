'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { IADcfDetailClient } from './IADcfDetailClient';

export default function IADCFDetailPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  return <IADcfDetailClient accountId={accountId} accountNumber={accountNumber} />;
}
