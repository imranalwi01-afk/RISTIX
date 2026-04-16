'use client';

import React, { memo } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { RunConfig } from './types';

interface RunCalculationDialogProps {
  open: boolean;
  runConfig: RunConfig;
  selectedProcessDate: string | null;
  onClose: () => void;
  onChange: (next: RunConfig) => void;
  onConfirm: () => void;
}

const RunCalculationDialog = memo(function RunCalculationDialog({
  open,
  runConfig,
  selectedProcessDate,
  onClose,
  onChange,
  onConfirm,
}: RunCalculationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Run ECL Calculation</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="Process Date"
              value={runConfig.process_date ? new Date(runConfig.process_date) : null}
              onChange={(newValue) => {
                if (newValue) {
                  const dateStr = newValue instanceof Date ? newValue.toISOString().split('T')[0] : (newValue as any).toISOString().split('T')[0];
                  onChange({ ...runConfig, process_date: dateStr });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                  helperText: selectedProcessDate ? `Selected from View Date: ${selectedProcessDate}` : 'Default: Today',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Calculation Type</InputLabel>
              <Select
                value={runConfig.calculation_type}
                label="Calculation Type"
                onChange={(e) => onChange({ ...runConfig, calculation_type: e.target.value })}
              >
                <MenuItem value="full">Full Calculation</MenuItem>
                <MenuItem value="incremental">Incremental Update</MenuItem>
                <MenuItem value="validation">Validation Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">
              This will execute IFRS9 ECL calculations for all configured segments and models. The process may take several minutes to complete.
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained">
          Start Calculation
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default RunCalculationDialog;
