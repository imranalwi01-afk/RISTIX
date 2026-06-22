'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ImpairmentModuleDetailViewModel, ImpairmentModuleRowViewModel } from '../domain/ifrs9-modules.models';

interface ImpairmentModuleDetailsPanelProps {
  selectedRow: ImpairmentModuleRowViewModel | null;
  loading: boolean;
  error: string | null;
  detail: ImpairmentModuleDetailViewModel | null;
  detailSupported: boolean;
  compatibilityMessage?: string | null;
}

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  A: 'Active',
  N: 'Normal',
  I: 'Inactive',
  D: 'Default',
  C: 'Closed',
};

function formatCurrency(value: number | null | undefined, currency: string | null | undefined = 'IDR') {
  const normalizedCurrency = currency ?? 'IDR';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function formatPercent(value: number | null | undefined, digits = 4) {
  const numericValue = Number(value);
  return `${Number.isFinite(numericValue) ? numericValue.toFixed(digits) : Number(0).toFixed(digits)}%`;
}

function KeyValueGrid({ entries }: { entries: Array<{ label: string; value: unknown }> }) {
  return (
    <Grid container spacing={2}>
      {entries.map((entry) => (
        <Grid key={entry.label} size={{ xs: 12, md: 6 }}>
          <Box display="flex" gap={1.5}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
              {entry.label}
            </Typography>
            <Typography variant="body2">:</Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatValue(entry.value)}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3, width: '100%', minWidth: 0, overflowX: 'hidden' }}>{children}</Box>;
}

function ScrollTable({
  minWidth,
  children,
}: {
  minWidth: number;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'unset' }}>
        <Table size="small" sx={{ minWidth }}>
          {children}
        </Table>
      </TableContainer>
    </Box>
  );
}

export function ImpairmentModuleDetailsPanel({
  selectedRow,
  loading,
  error,
  detail,
  detailSupported,
  compatibilityMessage,
}: ImpairmentModuleDetailsPanelProps) {
  const [tab, setTab] = useState(0);

  const contractEntries = useMemo(() => {
    const contract = detail?.contractDetail;
    if (!contract) return [];

    return [
      { label: 'PRC_DATE', value: contract.prcDate },
      { label: 'ACCOUNT_NUMBER', value: contract.accountNumber },
      { label: 'FACILITY_NUMBER', value: contract.facilityNumber },
      { label: 'CIF_NUMBER', value: contract.cifNumber },
      { label: 'CIF_NAME', value: contract.cifName },
      { label: 'ACCOUNT_STATUS', value: contract.accountStatus ? `${contract.accountStatus} - ${ACCOUNT_STATUS_LABELS[contract.accountStatus] || contract.accountStatus}` : null },
      { label: 'DATA_SOURCE', value: contract.dataSource },
      { label: 'PRD_GROUP', value: contract.prdGroup },
      { label: 'PRD_TYPE', value: contract.prdType },
      { label: 'PRD_CODE', value: contract.prdCode },
      { label: 'BRANCH_CODE', value: contract.branchCode },
      { label: 'TENOR_ORG', value: contract.tenorOrg },
      { label: 'START_DATE', value: contract.startDate },
      { label: 'MATURITY_DATE', value: contract.maturityDate },
      { label: 'PAID_OFF_DATE', value: contract.paidOffDate },
      { label: 'WRITE_OFF_DATE', value: contract.writeOffDate },
      { label: 'FIRST_PAYMENT_DATE', value: contract.firstPaymentDate },
      { label: 'NEXT_PAYMENT_DATE', value: contract.nextPaymentDate },
      { label: 'LAST_PAYMENT_DATE', value: contract.lastPaymentDate },
      { label: 'GRACE_TYPE', value: contract.graceType },
      { label: 'GRACE_START_DATE', value: contract.graceStartDate },
      { label: 'GRACE_END_DATE', value: contract.graceEndDate },
      { label: 'INTEREST_RATE', value: formatPercent(contract.interestRate) },
      { label: 'EFF_INTEREST_RATE', value: formatPercent(contract.effInterestRate) },
      { label: 'COLLECTABILITY', value: contract.collectability },
      { label: 'DPD', value: contract.dpd },
      { label: 'EXT_RATING_CODE_INITIAL', value: contract.extRatingCodeInitial },
      { label: 'EXT_RATING_AGENCY_INITIAL', value: contract.extRatingAgencyInitial },
      { label: 'EXT_RATING_CODE', value: contract.extRatingCode },
      { label: 'EXT_RATING_AGENCY', value: contract.extRatingAgency },
      { label: 'PAYMENT_CODE', value: contract.paymentCode },
      { label: 'PAYMENT_TERM', value: contract.paymentTerm },
      { label: 'PAYMENT_FREQ', value: contract.paymentFreq },
      { label: 'INT_PMT_TERM', value: contract.intPmtTerm },
      { label: 'INT_PMT_FREQ', value: contract.intPmtFreq },
      { label: 'NPL_FLAG', value: contract.nplFlag },
      { label: 'NPL_DATE', value: contract.nplDate },
      { label: 'RESTRUCTURE_FLAG', value: contract.restructureFlag },
      { label: 'RESTRUCTURE_DATE', value: contract.restructureDate },
      { label: 'RESTRUCTURE_REVIEW_DATE', value: contract.restructureReviewDate },
      { label: 'INTEREST_BASE', value: contract.interestBase },
      { label: 'ASSET_CLASS', value: contract.assetClass },
      { label: 'CURRENCY', value: contract.currency },
      { label: 'EXCHANGE_RATE', value: contract.exchangeRate },
      { label: 'PLAFOND', value: formatCurrency(contract.plafond, contract.currency) },
      { label: 'UNUSED_AMT', value: formatCurrency(contract.unusedAmt, contract.currency) },
      { label: 'OUTSTANDING', value: formatCurrency(contract.outstanding, contract.currency) },
      { label: 'OUTSTANDING_WO', value: formatCurrency(contract.outstandingWo, contract.currency) },
      { label: 'ACCRUED_INTEREST', value: formatCurrency(contract.accruedInterest, contract.currency) },
      { label: 'INSTALLMENT_AMT', value: formatCurrency(contract.installmentAmt, contract.currency) },
      { label: 'FIX_PRINCIPAL_AMT', value: formatCurrency(contract.fixPrincipalAmt, contract.currency) },
      { label: 'FIX_INTEREST_AMT', value: formatCurrency(contract.fixInterestAmt, contract.currency) },
      { label: 'IMPAIRED_FLAG', value: contract.impairedFlag },
      { label: 'IMPAIRED_STATUS', value: contract.impairedStatus },
      { label: 'GROUP_SEGMENT', value: contract.groupSegment },
      { label: 'SEGMENT', value: contract.segment },
      { label: 'SUB_SEGMENT', value: contract.subSegment },
      { label: 'BUCKET_ID', value: contract.bucketId },
      { label: 'SICR_FLAG', value: contract.sicrFlag },
      { label: 'STAGE', value: contract.stage },
      { label: 'ECL_CA_ONBS_AMT', value: formatCurrency(contract.eclCaOnbsAmt, contract.currency) },
      { label: 'ECL_CA_OFFBS_AMT', value: formatCurrency(contract.eclCaOffbsAmt, contract.currency) },
      { label: 'ECL_IA_ONBS_AMT', value: formatCurrency(contract.eclIaOnbsAmt, contract.currency) },
      { label: 'ECL_OVERLAY_AMT', value: formatCurrency(contract.eclOverlayAmt, contract.currency) },
      { label: 'ECL_FINAL_AMT', value: formatCurrency(contract.eclFinalAmt, contract.currency) },
      { label: 'ECL_COVERAGE', value: `${Number(contract.eclCoverage ?? 0).toFixed(4)}%` },
      { label: 'UNWINDING_CA_AMT', value: formatCurrency(contract.unwindingCaAmt, contract.currency) },
      { label: 'UNWINDING_IA_AMT', value: formatCurrency(contract.unwindingIaAmt, contract.currency) },
      { label: 'UNWINDING_IA_SUM_AMT', value: formatCurrency(contract.unwindingIaSumAmt, contract.currency) },
    ];
  }, [detail?.contractDetail]);

  const individualSummaryEntries = useMemo(() => {
    const summary = detail?.individualSummary;
    if (!summary) return [];

    const summaryCurrency = summary.currency || detail?.contractDetail?.currency || 'IDR';

    return [
      { label: 'REPORTING_DATE', value: summary.reportingDate },
      { label: 'ACCOUNT_NUMBER', value: summary.accountNumber },
      { label: 'CIF_NUMBER', value: summary.cifNumber },
      { label: 'CIF_NAME', value: summary.cifName },
      { label: 'CURRENCY', value: summary.currency },
      { label: 'DPD', value: summary.dpd },
      { label: 'COLLECTABILITY', value: summary.collectability },
      { label: 'RATING_CODE', value: summary.ratingCode },
      { label: 'INTEREST_RATE', value: formatPercent(summary.interestRate) },
      { label: 'EFF_INTEREST_RATE', value: formatPercent(summary.effInterestRate) },
      { label: 'OUTSTANDING', value: formatCurrency(summary.outstanding, summaryCurrency) },
      { label: 'ACCRUED_INTEREST', value: formatCurrency(summary.accruedInterest, summaryCurrency) },
      { label: 'CARRYING_AMT', value: formatCurrency(summary.carryingAmt, summaryCurrency) },
      { label: 'EAD_AMT', value: formatCurrency(summary.eadAmt, summaryCurrency) },
      { label: 'PV_DCF_AMT', value: formatCurrency(summary.pvDcfAmt, summaryCurrency) },
      { label: 'ECL_IA_AMT', value: formatCurrency(summary.eclIaAmt, summaryCurrency) },
    ];
  }, [detail?.contractDetail?.currency, detail?.individualSummary]);

  return (
    <Card sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <CardContent sx={{ minWidth: 0, overflowX: 'hidden' }}>
        <Box mb={2}>
          <Typography variant="h6">
            Impairment Module Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedRow
              ? `Selected contract: ${selectedRow.accountNumber} / ${selectedRow.facilityNumber || '-'}`
              : 'Select a row from the impairment list to inspect the detail tabs.'}
          </Typography>
        </Box>

        {!selectedRow ? (
          <Alert severity="info">No row selected yet.</Alert>
        ) : !detailSupported ? (
          <Alert severity="warning">
            {compatibilityMessage || 'Detail tabs belum tersedia karena backend lokal masih memakai endpoint impairment lama.'}
          </Alert>
        ) : loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8} gap={2}>
            <CircularProgress size={24} />
            <Typography color="text.secondary">Loading detail tabs...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !detail ? (
          <Alert severity="info">No detail payload returned for the selected contract.</Alert>
        ) : (
          <>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth">
              <Tab label="Contract Details" />
              <Tab label="Collective Impairment Details" />
              <Tab label="Individual Impairment Details" />
              <Tab label="Journal Details" />
            </Tabs>
            <Divider />

            <TabPanel value={tab} index={0}>
              <KeyValueGrid entries={contractEntries} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              {detail.collectiveDetails.length === 0 ? (
                <Alert severity="info">No collective impairment detail row was found in `frs9_imp_ca_result_d`.</Alert>
              ) : (
                <ScrollTable minWidth={920}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell>Bucket</TableCell>
                        <TableCell align="right">EAD</TableCell>
                        <TableCell align="right">PD</TableCell>
                        <TableCell align="right">LGD</TableCell>
                        <TableCell align="right">ECL (BFL)</TableCell>
                        <TableCell align="right">ECL (AFL)</TableCell>
                        <TableCell align="right">Weighted ECL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.collectiveDetails.map((row, index) => (
                        <TableRow key={`${row.accountId}-${row.flSeq ?? index}`}>
                          <TableCell>{row.stage ?? '-'}</TableCell>
                          <TableCell>{row.bucketId ?? '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(row.ead, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{Number(row.pd ?? 0).toFixed(6)}</TableCell>
                          <TableCell align="right">{Number(row.lgd ?? 0).toFixed(6)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.eclBfl, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.eclAfl, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.eclWeightedAfl, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </ScrollTable>
              )}
            </TabPanel>

            <TabPanel value={tab} index={2}>
              {detail.individualSummary ? (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Individual Impairment Header
                  </Typography>
                  <KeyValueGrid entries={individualSummaryEntries} />
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No individual impairment header row was found in `frs9_imp_ia_result_h`.
                </Alert>
              )}

              {detail.individualDetails.length === 0 ? (
                <Alert severity="info">No individual impairment detail row was found in `frs9_imp_ia_result_d`.</Alert>
              ) : (
                <ScrollTable minWidth={980}>
                    <TableHead>
                      <TableRow>
                        <TableCell>MOB</TableCell>
                        <TableCell>Periode</TableCell>
                        <TableCell align="right">Principal</TableCell>
                        <TableCell align="right">Interest</TableCell>
                        <TableCell align="right">Installment</TableCell>
                        <TableCell align="right">Collateral</TableCell>
                        <TableCell align="right">PV Amt</TableCell>
                        <TableCell align="right">Ending Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.individualDetails.map((row, index) => (
                        <TableRow key={`${row.mob ?? index}-${row.periode ?? index}`}>
                          <TableCell>{row.mob ?? '-'}</TableCell>
                          <TableCell>{row.periode ?? '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(row.principal, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.interest, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.installment, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.collateral, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.pvAmt, detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.endingBalance, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </ScrollTable>
              )}
            </TabPanel>

            <TabPanel value={tab} index={3}>
              {detail.journalDetails.length === 0 ? (
                <Alert severity="info">No journal row was found in `frs9_imp_journal_data`.</Alert>
              ) : (
                <ScrollTable minWidth={980}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Journal Code</TableCell>
                        <TableCell>DB/CR</TableCell>
                        <TableCell>GL Number</TableCell>
                        <TableCell>GL Desc</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Amount IDR</TableCell>
                        <TableCell>Source Process</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.journalDetails.map((row, index) => (
                        <TableRow key={`${row.journalCode ?? index}-${row.dbCr ?? index}-${row.glNumber ?? index}`}>
                          <TableCell>{row.journalCode || '-'}</TableCell>
                          <TableCell>{row.dbCr || '-'}</TableCell>
                          <TableCell>{row.glNumber || '-'}</TableCell>
                          <TableCell>{row.glDesc || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(row.amount, row.currency || detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.amountIdr, 'IDR')}</TableCell>
                          <TableCell>{row.sourceProcess || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </ScrollTable>
              )}
            </TabPanel>
          </>
        )}
      </CardContent>
    </Card>
  );
}
