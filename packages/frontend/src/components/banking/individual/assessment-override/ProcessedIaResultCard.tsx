'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { PersistedDcfRow, PersistedIaDetailRow, PersistedIaHeader } from './types';
import { formatAmount, formatDisplayDate, readHeaderNumber } from './utils';

function SectionMetaChips({
  cashflowCount,
  detailCount,
  header
}: {
  cashflowCount: number;
  detailCount: number;
  header: PersistedIaHeader | null;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
      <Chip label={`Raw DCF Rows: ${cashflowCount}`} size="small" variant="outlined" />
      <Chip label={`IA Detail Rows: ${detailCount}`} size="small" variant="outlined" />
      <Chip
        label={`PV DCF: ${formatAmount(header?.pvDcfAmt)}`}
        size="small"
        color="info"
        variant="outlined"
      />
      <Chip
        label={`ECL IA: ${formatAmount(header?.eclIaAmt)}`}
        size="small"
        color="warning"
        variant="outlined"
      />
    </Stack>
  );
}

interface ProcessedIaResultCardProps {
  persistedHeader: PersistedIaHeader | null;
  persistedCashflows: PersistedDcfRow[];
  persistedIaDetails: PersistedIaDetailRow[];
  embedded?: boolean;
}

export function ProcessedIaResultCard({
  persistedHeader,
  persistedCashflows,
  persistedIaDetails,
  embedded = false
}: ProcessedIaResultCardProps) {
  const content = (
    <>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Processed Legacy IA Result
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This section mirrors the legacy IA discounted cash flow review: raw uploaded rows, processed header result, and generated IA detail cash flow rows.
        </Typography>
        <SectionMetaChips
          cashflowCount={persistedCashflows.length}
          detailCount={persistedIaDetails.length}
          header={persistedHeader}
        />
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>1. DCF Upload Report Detail</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Raw uploaded rows persisted to legacy `FRS9_IMP_IA_DCF`.
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320, overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Collateral</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {persistedCashflows.length > 0 ? persistedCashflows.map((row) => (
                    <TableRow key={row.pkid}>
                      <TableCell>{row.accountNumber}</TableCell>
                      <TableCell>{formatDisplayDate(row.periode)}</TableCell>
                      <TableCell align="right">{formatAmount(row.principal)}</TableCell>
                      <TableCell align="right">{formatAmount(row.interest)}</TableCell>
                      <TableCell align="right">{formatAmount(row.collateral)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No DCF upload data available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {persistedHeader ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1.5 }}>2. IA Discounted Cash Flow Detail</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Processed account-level result persisted to legacy `FRS9_IMP_IA_HEADER`.
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Effective Date</TableCell>
                      <TableCell>Account Number</TableCell>
                      <TableCell>CIF Number</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Currency</TableCell>
                      <TableCell align="right">Day Past Due</TableCell>
                      <TableCell align="right">Collectability</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell align="right">Interest Rate</TableCell>
                      <TableCell align="right">Effective Interest Rate</TableCell>
                      <TableCell align="right">Outstanding</TableCell>
                      <TableCell align="right">Accrued Interest</TableCell>
                      <TableCell align="right">Carrying Amount</TableCell>
                      <TableCell align="right">EAD Amount</TableCell>
                      <TableCell align="right">PV DCF Amount</TableCell>
                      <TableCell align="right">ECL IA Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{formatDisplayDate(persistedHeader.effectiveDate)}</TableCell>
                      <TableCell>{persistedHeader.accountNumber || '-'}</TableCell>
                      <TableCell>{persistedHeader.cifNumber || '-'}</TableCell>
                      <TableCell>{persistedHeader.cifName || '-'}</TableCell>
                      <TableCell>{persistedHeader.currency || '-'}</TableCell>
                      <TableCell align="right">{readHeaderNumber(persistedHeader, 'dpd')}</TableCell>
                      <TableCell align="right">{readHeaderNumber(persistedHeader, 'collectability')}</TableCell>
                      <TableCell>{persistedHeader.ratingCode || '-'}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.interestRate)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.effInterestRate)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.outstanding)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.accruedInterest)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.carryingAmt)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.eadAmt)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.pvDcfAmt)}</TableCell>
                      <TableCell align="right">{formatAmount(persistedHeader.eclIaAmt)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : null}

          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>3. IA Detail Cash Flow</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Generated schedule rows persisted to legacy `FRS9_IMP_IA_DETAIL`.
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420, overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>No.</TableCell>
                    <TableCell>Estimated Date</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Installment</TableCell>
                    <TableCell align="right">Collateral</TableCell>
                    <TableCell align="right">Pos Rate 1</TableCell>
                    <TableCell align="right">Repayment Rate 1</TableCell>
                    <TableCell align="right">Default 1</TableCell>
                    <TableCell align="right">Pos Rate 2</TableCell>
                    <TableCell align="right">Repayment Rate 2</TableCell>
                    <TableCell align="right">Default 2</TableCell>
                    <TableCell align="right">Pos Rate 3</TableCell>
                    <TableCell align="right">Repayment Rate 3</TableCell>
                    <TableCell align="right">Default 3</TableCell>
                    <TableCell align="right">PW Amt</TableCell>
                    <TableCell align="right">Discount Factor</TableCell>
                    <TableCell align="right">PV Amt</TableCell>
                    <TableCell align="right">Beginning Balance</TableCell>
                    <TableCell align="right">EIR Amt</TableCell>
                    <TableCell align="right">Ending Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {persistedIaDetails.length > 0 ? persistedIaDetails.map((row) => (
                    <TableRow key={row.pkid}>
                      <TableCell>{row.mob}</TableCell>
                      <TableCell>{formatDisplayDate(row.periode)}</TableCell>
                      <TableCell align="right">{formatAmount(row.principal)}</TableCell>
                      <TableCell align="right">{formatAmount(row.interest)}</TableCell>
                      <TableCell align="right">{formatAmount(row.installment)}</TableCell>
                      <TableCell align="right">{formatAmount(row.collateral)}</TableCell>
                      <TableCell align="right">{formatAmount(row.poRate1)}</TableCell>
                      <TableCell align="right">{formatAmount(row.rrRate1)}</TableCell>
                      <TableCell align="right">{formatAmount(row.default1)}</TableCell>
                      <TableCell align="right">{formatAmount(row.poRate2)}</TableCell>
                      <TableCell align="right">{formatAmount(row.rrRate2)}</TableCell>
                      <TableCell align="right">{formatAmount(row.default2)}</TableCell>
                      <TableCell align="right">{formatAmount(row.poRate3)}</TableCell>
                      <TableCell align="right">{formatAmount(row.rrRate3)}</TableCell>
                      <TableCell align="right">{formatAmount(row.default3)}</TableCell>
                      <TableCell align="right">{formatAmount(row.pwAmt)}</TableCell>
                      <TableCell align="right">{formatAmount(row.discountFactor)}</TableCell>
                      <TableCell align="right">{formatAmount(row.pvAmt)}</TableCell>
                      <TableCell align="right">{formatAmount(row.beginningBalance)}</TableCell>
                      <TableCell align="right">{formatAmount(row.eirAmt)}</TableCell>
                      <TableCell align="right">{formatAmount(row.endingBalance)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={21} align="center">No IA detailed cash flow data available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
    </>
  );

  if (embedded) {
    return <Box>{content}</Box>;
  }

  return (
    <Card>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
