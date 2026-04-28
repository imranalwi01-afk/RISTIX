import { describe, expect, test } from 'bun:test';
import {
  buildIndividualAssessmentUrl,
  getIndividualAssessmentRouteBase,
  INDIVIDUAL_ASSESSMENT_ROUTE,
  INDIVIDUAL_ASSESSMENT_V2_ROUTE,
  isIndividualAssessmentV2Path,
} from './routing';

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
});
