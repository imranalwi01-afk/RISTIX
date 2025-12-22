// packages/frontend/src/app/banking/collective/bucket/page.tsx
// Redirect from /banking/collective/bucket to /banking/collective/bucket-parameter

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BucketRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct path
    router.replace('/banking/collective/bucket-parameter');
  }, [router]);

  return null;
}