'use client';

import React, { memo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import type { IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';

interface ImpairmentDetailsDialogProps {
  open: boolean;
  selectedRecord: IndividualImpairmentWatchlistItem | null;
  onClose: () => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

const ImpairmentDetailsDialog = memo(function ImpairmentDetailsDialog({
  open,
  selectedRecord,
  onClose,
  formatCurrency,
}: ImpairmentDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Impairment Details</DialogTitle>
      <DialogContent>
        {selectedRecord && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Account Number" value={selectedRecord.account_number} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Customer Name" value={selectedRecord.cif_name} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="CIF Number" value={selectedRecord.cif_number} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Currency" value={selectedRecord.currency} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Outstanding Balance" value={formatCurrency(selectedRecord.outstanding_balance, selectedRecord.currency)} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="ECL Amount" value={formatCurrency(selectedRecord.ecl_amount, selectedRecord.currency)} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Stage" value={`Stage ${selectedRecord.stage}`} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Impaired Flag" value={selectedRecord.impaired_flag === 'I' ? 'Impaired' : 'Not Impaired'} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Rating Code" value={selectedRecord.rating_code} disabled /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Assessment Status" value={selectedRecord.assessment_status} disabled /></Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});

export default ImpairmentDetailsDialog;
