'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
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
import type { AmortizationModuleDetailViewModel, AmortizationModuleRowViewModel } from '../domain/ifrs9-modules.models';

type AmortizationEventViewModel = AmortizationModuleDetailViewModel['events'][number];

interface AmortizationModuleDetailsPanelProps {
  selectedRow: AmortizationModuleRowViewModel | null;
  loading: boolean;
  error: string | null;
  detail: AmortizationModuleDetailViewModel | null;
  detailSupported: boolean;
  compatibilityMessage?: string | null;
}

function normalizeCurrencyCode(currency: string | null | undefined) {
  const normalized = String(currency ?? 'IDR').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : 'IDR';
}

function formatCurrency(value: number | null | undefined, currency = 'IDR') {
  const safeCurrency = normalizeCurrencyCode(currency);
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  }
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function normalizeDateKey(value: unknown) {
  if (!value) return '';
  const text = String(value).trim();
  if (!text) return '';
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return text.slice(0, 10);
}

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3, width: '100%', minWidth: 0, overflowX: 'hidden' }}>{children}</Box>;
}

function ScrollTable({
  minWidth,
  children,
  sx,
}: {
  minWidth: number;
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch', ...sx }}>
      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'unset' }}>
        <Table size="small" sx={{ minWidth }}>
          {children}
        </Table>
      </TableContainer>
    </Box>
  );
}

function KeyValueGrid({ entries }: { entries: Array<{ label: string; value: unknown }> }) {
  return (
    <Grid container spacing={2}>
      {entries.map((entry) => (
        <Grid key={entry.label} size={{ xs: 12, md: 6 }}>
          <Box display="flex" gap={1.5}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200 }}>
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

export function AmortizationModuleDetailsPanel({
  selectedRow,
  loading,
  error,
  detail,
  detailSupported,
  compatibilityMessage,
}: AmortizationModuleDetailsPanelProps) {
  const [tab, setTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<AmortizationEventViewModel | null>(null);

  const contractEntries = useMemo(() => {
    const contract = detail?.contractDetail;
    if (!contract) return [];

    return [
      { label: 'Reporting Date', value: contract.prcDate },
      { label: 'Account ID', value: contract.accountId },
      { label: 'Account Number', value: contract.accountNumber },
      { label: 'Customer Number', value: contract.cifNumber },
      { label: 'Customer Name', value: contract.cifName },
      { label: 'Facility Number', value: contract.facilityNumber },
      { label: 'Branch Code', value: contract.branchCode },
      { label: 'Data Source', value: contract.dataSource },
      { label: 'Product Code', value: contract.prdCode },
      { label: 'Product Type', value: contract.prdType },
      { label: 'Currency', value: contract.currency },
      { label: 'Exchange Rate', value: contract.exchangeRate },
      { label: 'BI Collectability', value: contract.collectability },
      { label: 'Day Past Due', value: contract.dpd },
      { label: 'Interest Rate', value: `${Number(contract.interestRate ?? 0).toFixed(4)}%` },
      { label: 'Effective Interest Rate', value: `${Number(contract.effInterestRate ?? 0).toFixed(4)}%` },
      { label: 'Start Date', value: contract.startDate },
      { label: 'Maturity Date', value: contract.maturityDate },
      { label: 'Restructure Flag', value: contract.restructureFlag },
      { label: 'Restructure Date', value: contract.restructureDate },
      { label: 'Asset Classification', value: contract.assetClass },
      { label: 'Amortization Type', value: contract.amortizationType },
      { label: 'Outstanding Balance', value: formatCurrency(contract.outstanding, contract.currency || 'IDR') },
      { label: 'Plafond', value: formatCurrency(contract.plafond, contract.currency || 'IDR') },
      { label: 'Initial Fee Amount', value: formatCurrency(contract.initialFeeAmt, contract.currency || 'IDR') },
      { label: 'Initial Cost Amount', value: formatCurrency(contract.initialCostAmt, contract.currency || 'IDR') },
      { label: 'Unamort Fee Amount', value: formatCurrency(contract.unamortFeeAmt, contract.currency || 'IDR') },
      { label: 'Unamort Cost Amount', value: formatCurrency(contract.unamortCostAmt, contract.currency || 'IDR') },
      { label: 'Amort Fee Amount', value: formatCurrency(contract.amortFeeAmt, contract.currency || 'IDR') },
      { label: 'Amort Cost Amount', value: formatCurrency(contract.amortCostAmt, contract.currency || 'IDR') },
    ];
  }, [detail?.contractDetail]);

  const feeRows = detail?.feeCosts.filter((row) => row.transactionType === 'F') ?? [];
  const costRows = detail?.feeCosts.filter((row) => row.transactionType === 'C') ?? [];
  const selectedEventDateKey = normalizeDateKey(selectedEvent?.effectiveDate || selectedEvent?.eventDate);
  const selectedEventScheduleRows = useMemo(() => {
    if (!detail || !selectedEventDateKey) return [];
    return detail.amortizationSchedule.filter((row) => normalizeDateKey(row.prcDate) === selectedEventDateKey);
  }, [detail, selectedEventDateKey]);

  useEffect(() => {
    setSelectedEvent(null);
  }, [selectedRow?.pkid, detail]);

  return (
    <Card sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <CardContent sx={{ minWidth: 0, overflowX: 'hidden' }}>
        <Box mb={2}>
          <Typography variant="h6">Amortization Module Details</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedRow
              ? `Selected contract: ${selectedRow.accountNumber} / ${selectedRow.facilityNumber || '-'}`
              : 'Select a row from the amortization list to inspect the detail tabs.'}
          </Typography>
        </Box>

        {!selectedRow ? (
          <Alert severity="info">No row selected yet.</Alert>
        ) : !detailSupported ? (
          <Alert severity="warning">
            {compatibilityMessage || 'Detail tabs belum tersedia karena backend lokal masih memakai endpoint amortization lama.'}
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
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                '.MuiTab-root': {
                  whiteSpace: 'nowrap',
                  minHeight: 52,
                },
              }}
            >
              <Tab label="Contract Details" />
              <Tab label="Fee / Cost" />
              <Tab label="Amortization & Event" />
              <Tab label="Journal Details" />
            </Tabs>

            <TabPanel value={tab} index={0}>
              <KeyValueGrid entries={contractEntries} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Fee Transactions
              </Typography>
              {feeRows.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>No fee rows were found in `frs9_master_transaction_cost`.</Alert>
              ) : (
                <ScrollTable minWidth={860} sx={{ mb: 3 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Reporting Date</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Transaction Code</TableCell>
                        <TableCell>Debit Credit Flag</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell align="right">Transaction Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feeRows.map((row, index) => (
                        <TableRow key={`${row.reportingDate ?? index}-${row.transactionCode ?? index}-F`}>
                          <TableCell>{row.reportingDate || '-'}</TableCell>
                          <TableCell>{row.accountNumber || '-'}</TableCell>
                          <TableCell>{row.transactionCode || '-'}</TableCell>
                          <TableCell>{row.debitCreditFlag || '-'}</TableCell>
                          <TableCell>{row.currency || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(row.transactionAmount, row.currency || detail.contractDetail?.currency || 'IDR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </ScrollTable>
              )}

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Cost Transactions
              </Typography>
              {costRows.length === 0 ? (
                <Alert severity="info">No cost rows were found in `frs9_master_transaction_cost`.</Alert>
              ) : (
                <ScrollTable minWidth={860}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Reporting Date</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Transaction Code</TableCell>
                        <TableCell>Debit Credit Flag</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell align="right">Transaction Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {costRows.map((row, index) => (
                        <TableRow key={`${row.reportingDate ?? index}-${row.transactionCode ?? index}-C`}>
                          <TableCell>{row.reportingDate || '-'}</TableCell>
                          <TableCell>{row.accountNumber || '-'}</TableCell>
                          <TableCell>{row.transactionCode || '-'}</TableCell>
                          <TableCell>{row.debitCreditFlag || '-'}</TableCell>
                          <TableCell>{row.currency || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(row.transactionAmount, row.currency || detail.contractDetail?.currency || 'IDR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </ScrollTable>
              )}
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Event Changes
              </Typography>
              {detail.events.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>No event rows were found in `frs9_event_changes`.</Alert>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Select one event change row to load the matching amortization schedule from `frs9_eir_ecf`.
                  </Alert>
                  <ScrollTable minWidth={1100} sx={{ mb: 3 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event Date</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Event ID</TableCell>
                        <TableCell>Event Description</TableCell>
                        <TableCell>Effective Date</TableCell>
                        <TableCell>Before Value</TableCell>
                        <TableCell>After Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.events.map((row, index) => {
                        const eventDate = row.eventDate ?? null;
                        const accountNumber = row.accountNumber ?? null;
                        const eventId = row.eventId ?? null;
                        const eventDescription = row.eventDescription ?? null;
                        const effectiveDate = row.effectiveDate ?? null;
                        const beforeValue = row.beforeValue ?? null;
                        const afterValue = row.afterValue ?? null;
                        const isSelected = selectedEvent === row;
                        return (
                          <TableRow
                            key={`${eventDate ?? index}-${eventId ?? index}`}
                            hover
                            selected={isSelected}
                            onClick={() => setSelectedEvent(row)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{eventDate || '-'}</TableCell>
                            <TableCell>{accountNumber || '-'}</TableCell>
                            <TableCell>{eventId ?? '-'}</TableCell>
                            <TableCell>{eventDescription || '-'}</TableCell>
                            <TableCell>{effectiveDate || '-'}</TableCell>
                            <TableCell>{beforeValue || '-'}</TableCell>
                            <TableCell>{afterValue || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </ScrollTable>
                </>
              )}

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Amortization Schedule
              </Typography>
              {!selectedEvent ? (
                <Alert severity="info">
                  Select an event change row first. The schedule is filtered by the selected event effective date.
                </Alert>
              ) : selectedEventScheduleRows.length === 0 ? (
                <Alert severity="info">
                  No amortization schedule row was found in `frs9_eir_ecf` for selected event date {selectedEventDateKey || '-'}.
                </Alert>
              ) : (
                <ScrollTable minWidth={1180}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Processing Date</TableCell>
                      <TableCell>Counter</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell align="right">Interest Rate</TableCell>
                      <TableCell align="right">Effective Rate</TableCell>
                      <TableCell align="right">Outstanding Principal</TableCell>
                      <TableCell align="right">Principal</TableCell>
                      <TableCell align="right">Interest Contractual</TableCell>
                      <TableCell align="right">Amort Total</TableCell>
                      <TableCell align="right">Carrying Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEventScheduleRows.map((row, index) => (
                      <TableRow key={`${row.prcDate ?? index}-${row.counter ?? index}-${row.paymentDate ?? index}`}>
                        <TableCell>{row.prcDate || '-'}</TableCell>
                        <TableCell>{row.counter ?? '-'}</TableCell>
                        <TableCell>{row.paymentDate || '-'}</TableCell>
                        <TableCell align="right">{`${Number(row.interestRate ?? 0).toFixed(4)}%`}</TableCell>
                        <TableCell align="right">{`${Number(row.effectiveInterestRate ?? 0).toFixed(4)}%`}</TableCell>
                        <TableCell align="right">{formatCurrency(row.outstandingPrincipal, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        <TableCell align="right">{formatCurrency(row.principal, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        <TableCell align="right">{formatCurrency(row.interestContractual, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        <TableCell align="right">{formatCurrency(row.amortTotal, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        <TableCell align="right">{formatCurrency(row.carryingAmount, detail.contractDetail?.currency || 'IDR')}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </ScrollTable>
              )}
            </TabPanel>

            <TabPanel value={tab} index={3}>
              {detail.journalDetails.length === 0 ? (
                <Alert severity="info">No journal row was found in `frs9_amort_journal_data`.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Reporting Date</TableCell>
                        <TableCell>Branch Code</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Journal Type</TableCell>
                        <TableCell>Journal Description</TableCell>
                        <TableCell>GL Account</TableCell>
                        <TableCell>Debit Credit</TableCell>
                        <TableCell align="right">Journal Amount</TableCell>
                        <TableCell align="right">Eqv Journal Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.journalDetails.map((row, index) => (
                        <TableRow key={`${row.reportingDate ?? index}-${row.glAccount ?? index}-${row.debitCredit ?? index}`}>
                          <TableCell>{row.reportingDate || '-'}</TableCell>
                          <TableCell>{row.branchCode || '-'}</TableCell>
                          <TableCell>{row.currency || '-'}</TableCell>
                          <TableCell>{row.journalType || '-'}</TableCell>
                          <TableCell>{row.journalDescription || '-'}</TableCell>
                          <TableCell>{row.glAccount || '-'}</TableCell>
                          <TableCell>{row.debitCredit || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(row.journalAmount, row.currency || detail.contractDetail?.currency || 'IDR')}</TableCell>
                          <TableCell align="right">{formatCurrency(row.eqvJournalAmount, 'IDR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </>
        )}
      </CardContent>
    </Card>
  );
}
