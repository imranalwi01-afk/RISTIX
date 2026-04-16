'use client';

import React, { memo } from 'react';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import type { CalculationResult } from './types';

interface CalculationResultDetailsDialogProps {
  open: boolean;
  selectedResult: CalculationResult | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

const CalculationResultDetailsDialog = memo(function CalculationResultDetailsDialog({
  open,
  selectedResult,
  onClose,
  formatCurrency,
}: CalculationResultDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Account Calculation Details</DialogTitle>
      <DialogContent>
        {selectedResult && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2">Facility Number:</Typography>
              <Typography variant="body1">{selectedResult.facility_number}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2">CIF Number:</Typography>
              <Typography variant="body1">{selectedResult.cif_number}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2">Current Stage:</Typography>
              <Chip label={`Stage ${selectedResult.stage}`} color={selectedResult.stage === 1 ? 'success' : selectedResult.stage === 2 ? 'warning' : 'error'} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2">Outstanding Amount:</Typography>
              <Typography variant="body1">{formatCurrency(selectedResult.outstanding || 0)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2">ECL Amount:</Typography>
              <Typography variant="body1">{formatCurrency(selectedResult.ecl_amount || 0)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2">Final ECL:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(selectedResult.ecl_final || 0)}
              </Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});

export default CalculationResultDetailsDialog;
