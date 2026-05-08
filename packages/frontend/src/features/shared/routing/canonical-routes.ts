export const canonicalRoutes = {
  ifrs9ReportsRoot: '/banking/ifrs9-reports',
  impairmentModule: '/banking/ifrs9/impairment-module',
  amortizationModule: '/banking/ifrs9/amortization-module',
  individualAssessment: '/banking/individual/assessment',
  individualAssessmentV2: '/banking/individual/assessment-new',
  ifrs9Reports: {
    eadModel: '/banking/ifrs9-reports/ead-model',
    eclMovement: '/banking/ifrs9-reports/ecl-movement',
    eclResult: '/banking/ifrs9-reports/ecl-result',
    gcaMovement: '/banking/ifrs9-reports/gca-movement',
    lifetimeLgd: '/banking/ifrs9-reports/lifetime-lgd',
    lifetimePd: '/banking/ifrs9-reports/lifetime-pd',
    nominative: '/banking/ifrs9-reports/nominative',
  },
} as const;
