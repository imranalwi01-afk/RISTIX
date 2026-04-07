'use client';

import React, { memo } from 'react';
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { PlayArrow as RunIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface CalculationActionBarProps {
  availableDates: string[];
  selectedProcessDate: string | null;
  processStatus: 'idle' | 'running' | 'queued' | 'completed' | 'error';
  onDateChange: (date: string) => void;
  onRun: () => void;
  onRefresh: () => void;
}

const CalculationActionBar = memo(function CalculationActionBar({
  availableDates,
  selectedProcessDate,
  processStatus,
  onDateChange,
  onRun,
  onRefresh,
}: CalculationActionBarProps) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="process-date-select-label">View Date</InputLabel>
          <Select
            labelId="process-date-select-label"
            id="process-date-select"
            value={selectedProcessDate || ''}
            label="View Date"
            onChange={(e) => onDateChange(e.target.value)}
          >
            <MenuItem value="">
              <em>Latest</em>
            </MenuItem>
            {availableDates.map((date, idx) => (
              <MenuItem key={`${date}-${idx}`} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<RunIcon />} onClick={onRun} disabled={processStatus === 'running'} color="primary">
          Run ECL Calculation
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={processStatus === 'running'}>
          Refresh
        </Button>
      </Box>

      {selectedProcessDate && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ECL calculation will use date: <strong>{selectedProcessDate}</strong> (from View Date dropdown)
          </Typography>
        </Alert>
      )}
    </>
  );
});

export default CalculationActionBar;
