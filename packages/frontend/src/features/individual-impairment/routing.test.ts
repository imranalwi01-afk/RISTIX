import { describe, expect, test } from 'bun:test';
import {
  buildIndividualAssessmentUrl,
  getIndividualAssessmentRouteBase,
  INDIVIDUAL_ASSESSMENT_ROUTE,
  INDIVIDUAL_ASSESSMENT_V2_ROUTE,
  isIndividualAssessmentV2Path,
} from './routing';
import { resolveIndividualImpairmentApiMode } from '@/services/api/individual-impairment-scoped-client';

describe('individual impairment frontend routing', () => {
  test('keeps legacy assessment route on v1 by default', () => {
    expect(isIndividualAssessmentV2Path('/banking/individual/assessment')).toBe(false);
    expect(getIndividualAssessmentRouteBase('/banking/individual/assessment')).toBe(INDIVIDUAL_ASSESSMENT_ROUTE);
  });

  test('routes assessment-new links to the v2 UI surface', () => {
    const params = new URLSearchParams({
      mode: 'conventional',
      accountNumber: '000131210158',
      tab: 'assessment-details',
    });

    expect(isIndividualAssessmentV2Path('/banking/individual/assessment-new')).toBe(true);
    expect(buildIndividualAssessmentUrl(params, '/banking/individual/assessment-new')).toBe(
      `${INDIVIDUAL_ASSESSMENT_V2_ROUTE}?mode=conventional&accountNumber=000131210158&tab=assessment-details`,
    );
  });

  test('maps canonical UI routes to the correct backend API generation', () => {
    expect(resolveIndividualImpairmentApiMode('/banking/individual/assessment')).toBe('v1');
    expect(resolveIndividualImpairmentApiMode('/banking/individual/assessment-new')).toBe('v2');
    expect(resolveIndividualImpairmentApiMode('/banking/individual/assessment-new?tab=watchlist')).toBe('v2');
  });
});
