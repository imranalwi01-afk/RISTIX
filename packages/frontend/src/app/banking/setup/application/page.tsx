import { Suspense } from 'react';
import ApplicationClient from './ApplicationClient';
import SetupLoading from '../loading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application Setup | PSAK 413 Platform',
  description: 'Configure application settings and system parameters for PSAK 413.',
}

export default function ApplicationSetupPage() {
  return (
    <Suspense fallback={<SetupLoading />}>
      <ApplicationClient />
    </Suspense>
  )
}