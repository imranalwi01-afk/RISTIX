'use client';

import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { TableChart as PreviewResultIcon } from '@mui/icons-material';
import type { ECLConfigHeader, ECLPreviewDetail, ECLPreviewHeader } from '../types';

interface ECLPreviewResultsDialogProps {
  open: boolean;
  previewLoading: boolean;
  previewDetailLoading: boolean;
  previewResults: ECLPreviewHeader[];
  previewDetailResults: ECLPreviewDetail[];
  selectedPreviewConfig: ECLConfigHeader | null;
  selectedPreviewResult: ECLPreviewHeader | null;
  onClose: () => void;
  onDrillDown: (row: ECLPreviewHeader) => void;
}

const formatAmount = (value?: string | number | null): string => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return String(value);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

function ECLPreviewResultsDialogComponent({
  open,
  previewLoading,
  previewDetailLoading,
  previewResults,
  previewDetailResults,
  selectedPreviewConfig,
  selectedPreviewResult,
  onClose,
  onDrillDown,
}: ECLPreviewResultsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PreviewResultIcon />
        Preview Result
        {selectedPreviewConfig ? ` - ${selectedPreviewConfig.ecl_model_name}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {previewLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : previewResults.length === 0 ? (
          <Alert severity="info">
            No preview result available for this ECL configuration. Run preview first.
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Preview Header Result
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account ID</TableCell>
                      <TableCell>Facility</TableCell>
                      <TableCell>CIF</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell align="right">Outstanding</TableCell>
                      <TableCell align="right">ECL Final</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewResults.map((row, index) => {
                      const isSelected =
                        selectedPreviewResult?.account_id !== null &&
                        selectedPreviewResult?.account_id !== undefined &&
                        selectedPreviewResult?.account_id === row.account_id;

                      return (
                        <TableRow key={`${row.account_id ?? 'row'}-${index}`} selected={isSelected} hover>
                          <TableCell>{row.account_id ?? '-'}</TableCell>
                          <TableCell>{row.facility_number || '-'}</TableCell>
                          <TableCell>{row.cif_number || '-'}</TableCell>
                          <TableCell>{row.stage ?? '-'}</TableCell>
                          <TableCell align="right">{formatAmount(row.outstanding)}</TableCell>
                          <TableCell align="right">{formatAmount(row.ecl_final)}</TableCell>
                          <TableCell>
                            <Button size="small" onClick={() => onDrillDown(row)}>
                              Drill Down
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPreviewResult
                  ? `Preview Detail - Account ${selectedPreviewResult.account_id ?? '-'}`
                  : 'Preview Detail'}
              </Typography>
              {previewDetailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : previewDetailResults.length === 0 ? (
                <Alert severity="info">
                  Select an account to view preview detail rows.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell>FL Year</TableCell>
                        <TableCell>FL Month</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell align="right">EAD</TableCell>
                        <TableCell align="right">PD</TableCell>
                        <TableCell align="right">LGD</TableCell>
                        <TableCell align="right">Probability</TableCell>
                        <TableCell align="right">ECL Weighted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewDetailResults.map((row, index) => (
                        <TableRow key={`${row.account_id ?? 'detail'}-${row.scenario_no ?? index}-${index}`} hover>
                          <TableCell>{row.scenario_no ?? '-'}</TableCell>
                          <TableCell>{row.fl_year ?? '-'}</TableCell>
                          <TableCell>{row.fl_month ?? '-'}</TableCell>
                          <TableCell>{row.stage ?? '-'}</TableCell>
                          <TableCell align="right">{formatAmount(row.ead)}</TableCell>
                          <TableCell align="right">{row.pd ?? '-'}</TableCell>
                          <TableCell align="right">{row.lgd ?? '-'}</TableCell>
                          <TableCell align="right">{row.probability ?? '-'}</TableCell>
                          <TableCell align="right">{formatAmount(row.ecl_weighted)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export const ECLPreviewResultsDialog = memo(ECLPreviewResultsDialogComponent);
