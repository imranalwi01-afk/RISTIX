'use client';

import React, { memo } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface ImpairmentCalculationDialogProps {
  open: boolean;
  onClose: () => void;
}

const ImpairmentCalculationDialog = memo(function ImpairmentCalculationDialog({
  open,
  onClose,
}: ImpairmentCalculationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Run Impairment Calculation</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mt: 2 }}>
          This will run the IFRS 9 impairment calculation engine for all accounts.
        </Alert>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Calculation parameters:
        </Typography>
        <Box component="ul" sx={{ mt: 1 }}>
          <li>ECL Method: PD x LGD x EAD</li>
          <li>Staging: 12-month vs Lifetime ECL</li>
          <li>Discount Rate: Risk-free rate + credit spread</li>
          <li>Forward-looking: Economic scenarios applied</li>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>
          Run Calculation
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ImpairmentCalculationDialog;
