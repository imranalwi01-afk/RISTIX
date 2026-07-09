// packages/frontend/src/app/banking/collective/page.tsx
// ============================================================================
// COLLECTIVE IMPAIRMENT LANDING PAGE
// ============================================================================

import { Suspense } from 'react';
import CollectiveLoading from './loading';
import type { Metadata } from 'next';
import CollectiveLandingClient from '@/app/banking/collective/CollectiveLandingClient';

export const metadata: Metadata = {
    title: 'Collective Impairment | PSAK 413 Platform',
    description: 'Manage Collective Impairment configurations including PD, LGD, EAD setup, segmentation, and ECL calculations.',
};

interface CollectivePageProps {
    searchParams: Promise<{ mode?: string }>;
}

export default async function CollectivePage({ searchParams }: CollectivePageProps) {
    const params = await searchParams;
    const mode = params?.mode || 'conventional';

    return (
        <Suspense fallback={<CollectiveLoading />}>
            <CollectiveLandingClient mode={mode} />
        </Suspense>
    );
}
