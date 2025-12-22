// packages/frontend/src/app/banking/collective/rules/page.tsx
// Redirect from /banking/collective/rules to /banking/collective/rule-base

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RulesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct path
    router.replace('/banking/collective/rule-base');
  }, [router]);

  return null;
}