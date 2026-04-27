'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import type { AmortizationModuleRowViewModel } from '../domain/ifrs9-modules.models';

interface AmortizationModuleTableProps {
  rows: AmortizationModuleRowViewModel[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  selectedPkid: string | null;
  detailSupported: boolean;
  onSelectRow: (pkid: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

function normalizeCurrencyCode(currency: string | null | undefined) {
  const normalized = String(currency ?? 'IDR').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : 'IDR';
}

function formatCurrency(amount: number | null | undefined, currency = 'IDR') {
  const safeCurrency = normalizeCurrencyCode(currency);
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }
}

export function AmortizationModuleTable({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading,
  selectedPkid,
  detailSupported,
  onSelectRow,
  onPageChange,
  onRowsPerPageChange,
}: AmortizationModuleTableProps) {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          borderRadius: 2,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table size="small" sx={{ minWidth: 1480 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>PRC Date</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Account Number</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Customer</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Facility Number</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Currency</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Amortization Type</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Outstanding</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Initial Fee</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Initial Cost</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Unamort Fee</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Unamort Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Box display="flex" justifyContent="center" alignItems="center" py={6} gap={2}>
                    <CircularProgress size={24} />
                    <Typography variant="body1" color="text.secondary">
                      Loading amortization contracts...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row) => {
                const rowKey = row.pkid ?? `legacy-${row.accountId}-${row.accountNumber ?? row.facilityNumber ?? 'row'}`;
                const rowSelectable = detailSupported && Boolean(row.pkid);
                return (
                  <TableRow
                    hover
                    key={rowKey}
                    selected={Boolean(row.pkid) && selectedPkid === row.pkid}
                    onClick={() => {
                      if (row.pkid) {
                        onSelectRow(row.pkid);
                      }
                    }}
                    sx={{ cursor: rowSelectable ? 'pointer' : 'default' }}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>{row.prcDate}</TableCell>
                    <TableCell sx={{ minWidth: 160, wordBreak: 'break-word' }}>{row.accountNumber}</TableCell>
                    <TableCell sx={{ minWidth: 180, wordBreak: 'break-word' }}>{row.cifName || '-'}</TableCell>
                    <TableCell sx={{ minWidth: 150, wordBreak: 'break-word' }}>{row.facilityNumber || '-'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.currency || '-'}</TableCell>
                    <TableCell sx={{ minWidth: 140, wordBreak: 'break-word' }}>{row.amortizationType || '-'}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.outstanding, row.currency || 'IDR')}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.initialFeeAmt, row.currency || 'IDR')}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.initialCostAmt, row.currency || 'IDR')}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.unamortFeeAmt, row.currency || 'IDR')}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.unamortCostAmt, row.currency || 'IDR')}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Box py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No amortization contracts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      The current process date query against `frs9_master_account` returned no rows.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        sx={{
          width: '100%',
          maxWidth: '100%',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
          '.MuiTablePagination-toolbar': {
            px: { xs: 1.5, md: 2 },
            flexWrap: 'wrap',
            rowGap: 1,
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
          },
        }}
      />
    </Box>
  );
}
