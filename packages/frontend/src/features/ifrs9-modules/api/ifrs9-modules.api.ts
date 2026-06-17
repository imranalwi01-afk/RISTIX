import apiClient from '@/services/api-client';

export interface ModuleListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  cursor?: string | null;
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface ImpairmentModuleRow {
  pkid?: string | null;
  prcDate: string;
  accountId: number;
  accountNumber?: string | null;
  facilityNumber?: string | null;
  cifNumber: string;
  cifName?: string | null;
  accountStatus?: string | null;
  dataSource?: string | null;
  prdGroup?: string | null;
  prdType?: string | null;
  prdCode?: string | null;
  branchCode?: string | null;
  currency?: string | null;
  stage: number | string;
  outstanding: number;
  eclFinalAmt: number;
  eclCoverage: number;
  impairedFlag?: boolean | null;
}

export interface ImpairmentModuleContractDetail extends ImpairmentModuleRow {
  tenorOrg?: number | null;
  startDate?: string | null;
  maturityDate?: string | null;
  paidOffDate?: string | null;
  writeOffDate?: string | null;
  firstPaymentDate?: string | null;
  nextPaymentDate?: string | null;
  lastPaymentDate?: string | null;
  graceType?: string | null;
  graceStartDate?: string | null;
  graceEndDate?: string | null;
  interestRate?: number | null;
  effInterestRate?: number | null;
  collectability?: number | null;
  dpd?: number | null;
  extRatingCodeInitial?: string | null;
  extRatingAgencyInitial?: string | null;
  extRatingCode?: string | null;
  extRatingAgency?: string | null;
  paymentCode?: string | null;
  paymentTerm?: string | null;
  paymentFreq?: number | null;
  intPmtTerm?: string | null;
  intPmtFreq?: number | null;
  nplFlag?: boolean | null;
  nplDate?: string | null;
  restructureFlag?: boolean | null;
  restructureDate?: string | null;
  restructureReviewDate?: string | null;
  interestBase?: string | null;
  assetClass?: string | null;
  exchangeRate?: number | null;
  plafond?: number | null;
  unusedAmt?: number | null;
  outstandingWo?: number | null;
  accruedInterest?: number | null;
  installmentAmt?: number | null;
  fixPrincipalAmt?: number | null;
  fixInterestAmt?: number | null;
  impairedStatus?: string | null;
  groupSegment?: string | null;
  segment?: string | null;
  subSegment?: string | null;
  bucketId?: number | null;
  sicrFlag?: boolean | null;
  eclCaOnbsAmt?: number | null;
  eclCaOffbsAmt?: number | null;
  eclIaOnbsAmt?: number | null;
  eclOverlayAmt?: number | null;
  unwindingCaAmt?: number | null;
  unwindingIaAmt?: number | null;
  unwindingIaSumAmt?: number | null;
}

export interface ImpairmentCollectiveDetailRow {
  prcDate?: string | null;
  accountId: number;
  accountNumber?: string | null;
  eclConfigId?: number | null;
  eclModelId?: number | null;
  defaultRuleId?: number | null;
  periodDate?: string | null;
  pdConfigId?: number | null;
  bucketId?: number | null;
  lgd?: number | null;
  cifNumber?: string | null;
  fibAmt?: number | null;
  accruedInterest?: number | null;
  stage?: number | null;
  eqvOutstanding?: number | null;
  eir?: number | null;
  eadConfigId?: number | null;
  eadMethod?: number | null;
  eadCalcMethod?: number | null;
  flSeq?: number | null;
  paymentEom?: string | null;
  paymAvg?: number | null;
  principal?: number | null;
  sumPrincipal?: number | null;
  interest?: number | null;
  nextInterest?: number | null;
  sumNextInterest?: number | null;
  ead?: number | null;
  probability?: number | null;
  pdNonFl?: number | null;
  pd?: number | null;
  eclBfl?: number | null;
  eclAfl?: number | null;
  eclWeightedBfl?: number | null;
  eclWeightedAfl?: number | null;
}

export interface ImpairmentIndividualSummary {
  reportingDate?: string | null;
  accountNumber?: string | null;
  cifNumber?: string | null;
  cifName?: string | null;
  currency?: string | null;
  dpd?: number | null;
  collectability?: number | null;
  ratingCode?: string | null;
  interestRate?: number | null;
  effInterestRate?: number | null;
  outstanding?: number | null;
  accruedInterest?: number | null;
  carryingAmt?: number | null;
  eadAmt?: number | null;
  pvDcfAmt?: number | null;
  eclIaAmt?: number | null;
}

export interface ImpairmentIndividualDetailRow {
  mob?: number | null;
  periode?: string | null;
  principal?: number | null;
  interest?: number | null;
  installment?: number | null;
  collateral?: number | null;
  poRate1?: number | null;
  rrRate1?: number | null;
  default1?: number | null;
  poRate2?: number | null;
  rrRate2?: number | null;
  default2?: number | null;
  poRate3?: number | null;
  rrRate3?: number | null;
  default3?: number | null;
  pwAmt?: number | null;
  discountFactor?: number | null;
  pvAmt?: number | null;
  beginningBalance?: number | null;
  eirAmt?: number | null;
  endingBalance?: number | null;
}

export interface ImpairmentJournalDetailRow {
  reportingDate?: string | null;
  accountId?: number | null;
  facilityNumber?: string | null;
  cifNumber?: string | null;
  prdCode?: string | null;
  currency?: string | null;
  journalCode?: string | null;
  journalCode2?: string | null;
  reverse?: boolean | null;
  flagCf?: string | null;
  dbCr?: string | null;
  glNumber?: string | null;
  amount?: number | null;
  amountIdr?: number | null;
  sourceProcess?: string | null;
  intmId?: string | null;
  branch?: string | null;
  noRef?: string | null;
  valCtrCode?: string | null;
  glDesc?: string | null;
  glCostCenter?: string | null;
  createdDate?: string | null;
  createdBy?: string | null;
}

export interface ImpairmentModuleDetail {
  contractDetail: ImpairmentModuleContractDetail | null;
  collectiveDetails: ImpairmentCollectiveDetailRow[];
  individualSummary: ImpairmentIndividualSummary | null;
  individualDetails: ImpairmentIndividualDetailRow[];
  journalDetails: ImpairmentJournalDetailRow[];
}

export interface AmortizationModuleRow {
  pkid?: string | null;
  accountId: number;
  prcDate: string;
  accountNumber?: string | null;
  cifNumber?: string | null;
  cifName?: string | null;
  facilityNumber?: string | null;
  branchCode?: string | null;
  dataSource?: string | null;
  prdCode?: string | null;
  prdType?: string | null;
  currency?: string | null;
  exchangeRate?: number | null;
  collectability?: number | null;
  dpd?: number | null;
  interestRate?: number | null;
  effInterestRate?: number | null;
  startDate?: string | null;
  maturityDate?: string | null;
  restructureFlag?: boolean | null;
  restructureDate?: string | null;
  assetClass?: string | null;
  amortizationType?: string | null;
  outstanding?: number | null;
  plafond?: number | null;
  initialFeeAmt?: number | null;
  initialCostAmt?: number | null;
  unamortFeeAmt?: number | null;
  unamortCostAmt?: number | null;
  amortFeeAmt?: number | null;
  amortCostAmt?: number | null;
}

export interface AmortizationFeeCostRow {
  reportingDate?: string | null;
  accountNumber?: string | null;
  transactionCode?: string | null;
  debitCreditFlag?: string | null;
  transactionType?: string | null;
  currency?: string | null;
  transactionAmount?: number | null;
  accountId?: number | null;
}

export interface AmortizationScheduleRow {
  accountNumber?: string | null;
  counter?: number | null;
  paymentDate?: string | null;
  interestRate?: number | null;
  effectiveInterestRate?: number | null;
  outstandingPrincipal?: number | null;
  principal?: number | null;
  interestContractual?: number | null;
  accruedInterest?: number | null;
  installment?: number | null;
  nocfOutstandingPrincipal?: number | null;
  nocfPrincipal?: number | null;
  eyrStructureDiff?: number | null;
  marginEyrWithTc?: number | null;
  amortTotal?: number | null;
  unamortTotal?: number | null;
  carryingAmount?: number | null;
  amortCost?: number | null;
  amortFee?: number | null;
  unamortCost?: number | null;
  unamortFee?: number | null;
  unamortGainLoss?: number | null;
  amortGainLoss?: number | null;
  prcDate?: string | null;
  accountId?: number | null;
}

export interface AmortizationEventRow {
  eventDate?: string | null;
  accountNumber?: string | null;
  eventId?: number | null;
  eventDescription?: string | null;
  effectiveDate?: string | null;
  beforeValue?: string | null;
  afterValue?: string | null;
}

export interface AmortizationJournalRow {
  reportingDate?: string | null;
  accountId?: number | null;
  branchCode?: string | null;
  currency?: string | null;
  journalType?: string | null;
  journalDescription?: string | null;
  glAccount?: string | null;
  debitCredit?: string | null;
  journalAmount?: number | null;
  eqvJournalAmount?: number | null;
}

export interface AmortizationModuleDetail {
  contractDetail: AmortizationModuleRow | null;
  feeCosts: AmortizationFeeCostRow[];
  amortizationSchedule: AmortizationScheduleRow[];
  events: AmortizationEventRow[];
  journalDetails: AmortizationJournalRow[];
}

interface ModuleListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination?: ModuleListPagination;
  effectivePrcDate?: string | null;
}

interface ModuleDetailResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function fetchImpairmentModuleResults(params: { page?: number; limit: number; cursor?: string; prcDate?: string; search?: string }) {
  const { data } = await apiClient.get<ModuleListResponse<ImpairmentModuleRow>>(
    '/banking/ifrs9/impairment-module/results',
    { params },
  );
  return data;
}

export async function fetchImpairmentModuleDetail(pkid: string) {
  const { data } = await apiClient.get<ModuleDetailResponse<ImpairmentModuleDetail>>(
    `/banking/ifrs9/impairment-module/results/${pkid}/details`,
  );
  return data;
}

export async function fetchAmortizationModuleResults(params: { page?: number; limit: number; cursor?: string; prcDate?: string; search?: string }) {
  const { data } = await apiClient.get<ModuleListResponse<AmortizationModuleRow>>(
    '/banking/ifrs9/amortization-module',
    { params },
  );
  return data;
}

export async function fetchAmortizationModuleDetail(pkid: string) {
  const { data } = await apiClient.get<ModuleDetailResponse<AmortizationModuleDetail>>(
    `/banking/ifrs9/amortization-module/results/${pkid}/details`,
  );
  return data;
}
