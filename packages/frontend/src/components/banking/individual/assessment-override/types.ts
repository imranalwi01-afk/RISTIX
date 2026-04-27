export interface DcfScenarioRow {
  id: string;
  possibleOutcomeRate: number;
  scenarioName: string;
  periodStart: string;
  periodEnd: string;
  repaymentRate: number;
}

export interface ParsedDcfRow {
  accountNumber: string;
  periode: string;
  principal: number;
  interest: number;
  collateral: number;
}

export interface PersistedDcfRow extends ParsedDcfRow {
  pkid: number;
  mob?: number;
}

export interface PersistedIaHeader {
  effectiveDate?: string | null;
  accountNumber?: string;
  cifNumber?: string;
  cifName?: string;
  currency?: string;
  dpd?: number;
  collectability?: number;
  ratingCode?: string;
  interestRate?: number;
  effInterestRate?: number;
  outstanding?: number;
  accruedInterest?: number;
  carryingAmt?: number;
  eadAmt?: number;
  pvDcfAmt?: number;
  eclIaAmt?: number;
}

export interface PersistedIaDetailRow {
  pkid: number;
  mob: number;
  periode: string | null;
  principal: number;
  interest: number;
  installment: number;
  collateral: number;
  poRate1: number;
  rrRate1: number;
  default1: number;
  poRate2: number;
  rrRate2: number;
  default2: number;
  poRate3: number;
  rrRate3: number;
  default3: number;
  pwAmt: number;
  discountFactor: number;
  pvAmt: number;
  beginningBalance: number;
  eirAmt: number;
  endingBalance: number;
}

export interface PersistedIaResultDetail {
  header: PersistedIaHeader | null;
  cashflows: PersistedDcfRow[];
  details: PersistedIaDetailRow[];
}

export interface OverrideRequestFormData {
  customerName: string;
  accountNumber: string;
  currentStage: number;
  overrideStage: number;
  justification: string;
  supportingDocumentName: string;
  supportingDocumentContent: string;
}
