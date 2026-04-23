'use client';

import React from 'react';
import {
  Box,
  Chip,
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
import type { ImpairmentModuleRowViewModel } from '../domain/ifrs9-modules.models';

interface ImpairmentModuleTableProps {
  rows: ImpairmentModuleRowViewModel[];
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

function formatCurrency(amount: number, currency: string | null | undefined = 'IDR') {
  const normalizedCurrency = currency ?? 'IDR';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function normalizeStage(stage: number | string | null | undefined) {
  const numericStage = Number(stage);
  return Number.isFinite(numericStage) ? numericStage : 0;
}

export function ImpairmentModuleTable({
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
}: ImpairmentModuleTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>PRC Date</TableCell>
            <TableCell>Account Number</TableCell>
            <TableCell>Facility Number</TableCell>
            <TableCell>CIF Number</TableCell>
            <TableCell>CIF Name</TableCell>
            <TableCell>Account Status</TableCell>
            <TableCell>Product Group</TableCell>
            <TableCell>Stage</TableCell>
            <TableCell align="right">Outstanding</TableCell>
            <TableCell align="right">ECL Final</TableCell>
            <TableCell align="right">ECL Coverage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={11} align="center">
                <Box display="flex" justifyContent="center" alignItems="center" py={6} gap={2}>
                  <CircularProgress size={24} />
                  <Typography variant="body1" color="text.secondary">
                    Loading impairment rows...
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : rows.length > 0 ? (
            rows.map((row) => {
              const stage = normalizeStage(row.stage);
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
                  <TableCell>{row.prcDate}</TableCell>
                  <TableCell>{row.accountNumber}</TableCell>
                  <TableCell>{row.facilityNumber || '-'}</TableCell>
                  <TableCell>{row.cifNumber || '-'}</TableCell>
                  <TableCell>{row.cifName || '-'}</TableCell>
                  <TableCell>{row.accountStatus || '-'}</TableCell>
                  <TableCell>{row.prdGroup || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={stage > 0 ? `Stage ${stage}` : 'N/A'}
                      color={stage === 3 ? 'error' : stage === 2 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(row.outstanding, row.currency)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.eclFinalAmt, row.currency)}</TableCell>
                  <TableCell align="right">{`${(row.eclCoverage * 100).toFixed(2)}%`}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={11} align="center">
                <Box py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No impairment results found
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
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
      />
    </TableContainer>
  );
}
