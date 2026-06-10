'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IndividualPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/banking/individual/assessment');
  }, [router]);

  return null;
}
