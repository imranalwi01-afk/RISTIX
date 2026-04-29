export const INDIVIDUAL_ASSESSMENT_ROUTE = '/banking/individual/assessment';
export const INDIVIDUAL_ASSESSMENT_V2_ROUTE = '/banking/individual/assessment-new';

export function isIndividualAssessmentV2Path(pathname?: string | null): boolean {
  return Boolean(pathname?.startsWith(INDIVIDUAL_ASSESSMENT_V2_ROUTE));
}

export function getIndividualAssessmentRouteBase(pathname?: string | null): string {
  return isIndividualAssessmentV2Path(pathname)
    ? INDIVIDUAL_ASSESSMENT_V2_ROUTE
    : INDIVIDUAL_ASSESSMENT_ROUTE;
}

export function buildIndividualAssessmentUrl(
  params: URLSearchParams,
  pathname?: string | null,
): string {
  return `${getIndividualAssessmentRouteBase(pathname)}?${params.toString()}`;
}
