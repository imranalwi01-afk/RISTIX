'use client';

import type {
  AmortizationEventRow,
  AmortizationFeeCostRow,
  AmortizationJournalRow,
  AmortizationModuleDetail,
  AmortizationModuleRow,
  AmortizationScheduleRow,
  ImpairmentCollectiveDetailRow,
  ImpairmentIndividualDetailRow,
  ImpairmentIndividualSummary,
  ImpairmentJournalDetailRow,
  ImpairmentModuleContractDetail,
  ImpairmentModuleDetail,
  ImpairmentModuleRow,
} from '../api/ifrs9-modules.api';

export type ImpairmentModuleRowViewModel = ImpairmentModuleRow;
export type AmortizationModuleRowViewModel = AmortizationModuleRow;
export type ImpairmentModuleDetailViewModel = ImpairmentModuleDetail;
export type AmortizationModuleDetailViewModel = AmortizationModuleDetail;

function toNumber(value: unknown) {
  if (value == null || value === '') return 0;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toStringValue(value: unknown) {
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

export function toImpairmentModuleRows(rows: ImpairmentModuleRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    pkid: toStringValue(row.pkid),
    accountNumber: toStringValue(
      row.accountNumber
      ?? row.facilityNumber
      ?? ((row as unknown as Record<string, unknown>).accountId != null
        ? String((row as unknown as Record<string, unknown>).accountId)
        : null),
    ),
    facilityNumber: toStringValue(row.facilityNumber),
    cifName: toStringValue(row.cifName),
    accountStatus: toStringValue(row.accountStatus),
    dataSource: toStringValue(row.dataSource),
    prdGroup: toStringValue(row.prdGroup ?? (row as unknown as Record<string, unknown>).bucketGroup),
    prdType: toStringValue(row.prdType),
    prdCode: toStringValue(row.prdCode),
    branchCode: toStringValue(row.branchCode),
    currency: toStringValue(row.currency) ?? 'IDR',
    outstanding: toNumber(row.outstanding),
    eclFinalAmt: toNumber(
      row.eclFinalAmt
      ?? (row as unknown as Record<string, unknown>).eclFinal
      ?? (row as unknown as Record<string, unknown>).eclAmount,
    ),
    eclCoverage: toNumber(
      row.eclCoverage
      ?? (
        toNumber(row.outstanding) === 0
          ? 0
          : toNumber(
            row.eclFinalAmt
            ?? (row as unknown as Record<string, unknown>).eclFinal
            ?? (row as unknown as Record<string, unknown>).eclAmount,
          ) / toNumber(row.outstanding)
      ),
    ),
  }));
}

export function toAmortizationModuleRows(rows: AmortizationModuleRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    pkid: toStringValue(row.pkid),
    accountNumber: toStringValue(
      row.accountNumber
      ?? row.facilityNumber
      ?? ((row as unknown as Record<string, unknown>).accountId != null
        ? String((row as unknown as Record<string, unknown>).accountId)
        : null),
    ),
    cifName: toStringValue(row.cifName),
    facilityNumber: toStringValue(row.facilityNumber),
    branchCode: toStringValue(row.branchCode),
    dataSource: toStringValue(row.dataSource),
    prdCode: toStringValue(row.prdCode),
    prdType: toStringValue(row.prdType),
    currency: toStringValue(row.currency) ?? 'IDR',
    amortizationType: toStringValue(row.amortizationType ?? (row as unknown as Record<string, unknown>).amortType),
    exchangeRate: toNumber(row.exchangeRate),
    interestRate: toNumber(row.interestRate),
    effInterestRate: toNumber(row.effInterestRate),
    outstanding: toNumber(row.outstanding),
    plafond: toNumber(row.plafond),
    initialFeeAmt: toNumber(row.initialFeeAmt),
    initialCostAmt: toNumber(row.initialCostAmt),
    unamortFeeAmt: toNumber(row.unamortFeeAmt),
    unamortCostAmt: toNumber(row.unamortCostAmt),
    amortFeeAmt: toNumber(row.amortFeeAmt),
    amortCostAmt: toNumber(row.amortCostAmt),
  }));
}

function toContractDetail(detail: ImpairmentModuleContractDetail | null | undefined) {
  if (!detail) return null;
  return {
    ...detail,
    interestRate: toNumber(detail.interestRate),
    effInterestRate: toNumber(detail.effInterestRate),
    exchangeRate: toNumber(detail.exchangeRate),
    plafond: toNumber(detail.plafond),
    unusedAmt: toNumber(detail.unusedAmt),
    outstanding: toNumber(detail.outstanding),
    outstandingWo: toNumber(detail.outstandingWo),
    accruedInterest: toNumber(detail.accruedInterest),
    installmentAmt: toNumber(detail.installmentAmt),
    fixPrincipalAmt: toNumber(detail.fixPrincipalAmt),
    fixInterestAmt: toNumber(detail.fixInterestAmt),
    eclCaOnbsAmt: toNumber(detail.eclCaOnbsAmt),
    eclCaOffbsAmt: toNumber(detail.eclCaOffbsAmt),
    eclIaOnbsAmt: toNumber(detail.eclIaOnbsAmt),
    eclOverlayAmt: toNumber(detail.eclOverlayAmt),
    eclFinalAmt: toNumber(detail.eclFinalAmt),
    eclCoverage: toNumber(detail.eclCoverage),
    unwindingCaAmt: toNumber(detail.unwindingCaAmt),
    unwindingIaAmt: toNumber(detail.unwindingIaAmt),
    unwindingIaSumAmt: toNumber(detail.unwindingIaSumAmt),
  };
}

function toCollectiveDetails(rows: ImpairmentCollectiveDetailRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    eir: toNumber(row.eir),
    exchangeRate: toNumber(row.exchangeRate),
    outstanding: toNumber(row.outstanding),
    plafond: toNumber(row.plafond),
    ead: toNumber(row.ead),
    pd: toNumber(row.pd),
    lgd: toNumber(row.lgd),
    eclAmount: toNumber(row.eclAmount),
    probability: toNumber(row.probability),
    eclWeighted: toNumber(row.eclWeighted),
  }));
}

function toIndividualSummary(detail: ImpairmentIndividualSummary | null | undefined) {
  if (!detail) return null;
  return {
    ...detail,
    interestRate: toNumber(detail.interestRate),
    effInterestRate: toNumber(detail.effInterestRate),
    outstanding: toNumber(detail.outstanding),
    accruedInterest: toNumber(detail.accruedInterest),
    carryingAmt: toNumber(detail.carryingAmt),
    eadAmt: toNumber(detail.eadAmt),
    pvDcfAmt: toNumber(detail.pvDcfAmt),
    eclIaAmt: toNumber(detail.eclIaAmt),
  };
}

function toIndividualDetails(rows: ImpairmentIndividualDetailRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    principal: toNumber(row.principal),
    interest: toNumber(row.interest),
    installment: toNumber(row.installment),
    collateral: toNumber(row.collateral),
    poRate1: toNumber(row.poRate1),
    rrRate1: toNumber(row.rrRate1),
    default1: toNumber(row.default1),
    poRate2: toNumber(row.poRate2),
    rrRate2: toNumber(row.rrRate2),
    default2: toNumber(row.default2),
    poRate3: toNumber(row.poRate3),
    rrRate3: toNumber(row.rrRate3),
    default3: toNumber(row.default3),
    pwAmt: toNumber(row.pwAmt),
    discountFactor: toNumber(row.discountFactor),
    pvAmt: toNumber(row.pvAmt),
    beginningBalance: toNumber(row.beginningBalance),
    eirAmt: toNumber(row.eirAmt),
    endingBalance: toNumber(row.endingBalance),
  }));
}

function toJournalDetails(rows: ImpairmentJournalDetailRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    amount: toNumber(row.amount),
    amountIdr: toNumber(row.amountIdr),
  }));
}

export function toImpairmentModuleDetail(detail: ImpairmentModuleDetail | undefined) {
  return {
    contractDetail: toContractDetail(detail?.contractDetail),
    collectiveDetails: toCollectiveDetails(detail?.collectiveDetails),
    individualSummary: toIndividualSummary(detail?.individualSummary),
    individualDetails: toIndividualDetails(detail?.individualDetails),
    journalDetails: toJournalDetails(detail?.journalDetails),
  };
}

function toAmortizationFeeCosts(rows: AmortizationFeeCostRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    transactionAmount: toNumber(row.transactionAmount),
  }));
}

function toAmortizationSchedule(rows: AmortizationScheduleRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    interestRate: toNumber(row.interestRate),
    effectiveInterestRate: toNumber(row.effectiveInterestRate),
    outstandingPrincipal: toNumber(row.outstandingPrincipal),
    principal: toNumber(row.principal),
    interestContractual: toNumber(row.interestContractual),
    accruedInterest: toNumber(row.accruedInterest),
    installment: toNumber(row.installment),
    nocfOutstandingPrincipal: toNumber(row.nocfOutstandingPrincipal),
    nocfPrincipal: toNumber(row.nocfPrincipal),
    eyrStructureDiff: toNumber(row.eyrStructureDiff),
    marginEyrWithTc: toNumber(row.marginEyrWithTc),
    amortTotal: toNumber(row.amortTotal),
    unamortTotal: toNumber(row.unamortTotal),
    carryingAmount: toNumber(row.carryingAmount),
    amortCost: toNumber(row.amortCost),
    amortFee: toNumber(row.amortFee),
    unamortCost: toNumber(row.unamortCost),
    unamortFee: toNumber(row.unamortFee),
    unamortGainLoss: toNumber(row.unamortGainLoss),
    amortGainLoss: toNumber(row.amortGainLoss),
  }));
}

function toAmortizationEvents(rows: AmortizationEventRow[] | undefined) {
  return Array.isArray(rows) ? rows : [];
}

function toAmortizationJournal(rows: AmortizationJournalRow[] | undefined) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    journalAmount: toNumber(row.journalAmount),
    eqvJournalAmount: toNumber(row.eqvJournalAmount),
  }));
}

export function toAmortizationModuleDetail(detail: AmortizationModuleDetail | undefined) {
  return {
    contractDetail: detail?.contractDetail ? toAmortizationModuleRows([detail.contractDetail])[0] : null,
    feeCosts: toAmortizationFeeCosts(detail?.feeCosts),
    amortizationSchedule: toAmortizationSchedule(detail?.amortizationSchedule),
    events: toAmortizationEvents(detail?.events),
    journalDetails: toAmortizationJournal(detail?.journalDetails),
  };
}
