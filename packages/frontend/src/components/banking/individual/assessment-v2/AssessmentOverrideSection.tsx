'use client';

import { AssessmentOverride } from '@/components/banking/individual/AssessmentOverride';
import { INDIVIDUAL_ASSESSMENT_V2_ROUTE } from '@/features/individual-impairment/routing';
import { INDIVIDUAL_IMPAIRMENT_V2_API_BASE } from '@/services/api/individual-impairment-v2-client';
import { useAssessmentWorkspaceEmbedded } from './embedded-context';

export function AssessmentOverrideSection() {
  const embedded = useAssessmentWorkspaceEmbedded();

  return (
    <AssessmentOverride
      embedded={embedded}
      apiBase={INDIVIDUAL_IMPAIRMENT_V2_API_BASE}
      routePath={INDIVIDUAL_ASSESSMENT_V2_ROUTE}
    />
  );
}
