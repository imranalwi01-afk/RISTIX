'use client';

import React from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  ToggleButtonGroup, 
  ToggleButton, 
  Paper, 
  LinearProgress,
  Tooltip,
  Alert,
  IconButton
} from '@mui/material';
import { 
  Add as AddCircleIcon, 
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DcfScenarioRow } from './types';

interface DcfScenarioConfiguratorProps {
  selectedScenario: string;
  scenarioOptions: any[];
  onSelectedScenarioChange: (value: string) => void;
  scenarioCount: number;
  onScenarioCountChange: (value: number) => void;
  onShowScenario: () => void;
  scenarioRows: DcfScenarioRow[];
  onUpdateScenarioRow: (id: string, field: keyof DcfScenarioRow, value: string | number) => void;
  onDeleteScenarioRow: (id: string) => void;
  onAddScenarioRow: () => void;
  onSaveScenarioDraft: () => void;
}

export function DcfScenarioConfigurator({
  selectedScenario,
  scenarioOptions,
  onSelectedScenarioChange,
  scenarioCount,
  onScenarioCountChange,
  onShowScenario,
  scenarioRows,
  onUpdateScenarioRow,
  onDeleteScenarioRow,
  onAddScenarioRow,
  onSaveScenarioDraft
}: DcfScenarioConfiguratorProps) {
  
  const totalWeight = scenarioRows.reduce((sum, row) => sum + (Number(row.possibleOutcomeRate) || 0), 0);
  const isWeightValid = totalWeight === 100;

  const getScenarioColor = (index: number) => {
    switch(index) {
      case 0: return '#1976d2'; // Base
      case 1: return '#2e7d32'; // Optimistic
      case 2: return '#d32f2f'; // Pessimistic
      default: return '#757575';
    }
  };

  return (
    <Stack spacing={4}>
      {/* 1. Method Selection & Count */}
      <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              DCF SCENARIO METHOD
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedScenario}
                displayEmpty
                onChange={(event) => onSelectedScenarioChange(String(event.target.value))}
                sx={{ bgcolor: '#fff', borderRadius: 2 }}
                renderValue={(value) => {
                  const selected = scenarioOptions.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === String(value));
                  return selected ? String(selected.scenarioName || selected.name || value) : 'Select Method';
                }}
              >
                {scenarioOptions.map((option, index) => (
                  <MenuItem key={`${option.scenarioCode || index}`} value={String(option.scenarioCode || option.scenarioName || option.name || `Scenario ${index + 1}`)}>
                    {String(option.scenarioName || option.name || `Scenario ${index + 1}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              NUMBER OF SCENARIOS
            </Typography>
            <ToggleButtonGroup
              value={scenarioCount}
              exclusive
              onChange={(_, val) => val && onScenarioCountChange(val)}
              size="small"
              fullWidth
              sx={{ bgcolor: '#fff' }}
            >
              {[1, 2, 3].map((num) => (
                <ToggleButton key={num} value={num} sx={{ px: 3, borderRadius: 2 }}>
                  {num} Skenario
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button 
                variant="contained" 
                fullWidth 
                onClick={onShowScenario} 
                size="large"
                sx={{ height: 40, borderRadius: 2, boxShadow: 2 }}
            >
              Configure Details
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 2. Weight Tracker */}
      {scenarioRows.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid', borderColor: isWeightValid ? 'success.light' : 'warning.light' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">Total PO Rate Weighting</Typography>
              <Typography variant="body2" color={isWeightValid ? 'success.main' : 'error.main'} fontWeight="bold">
                {totalWeight}% / 100%
              </Typography>
            </Box>
            <LinearProgress 
                variant="determinate" 
                value={Math.min(totalWeight, 100)} 
                color={isWeightValid ? 'success' : 'warning'}
                sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          {isWeightValid ? <CheckCircleIcon color="success" /> : <WarningIcon color="warning" />}
        </Paper>
      )}

      {/* 3. Scenario Cards */}
      {scenarioRows.length > 0 && (
        <Box>
          <Stack spacing={2}>
            {scenarioRows.map((row, index) => (
              <Paper 
                key={row.id} 
                elevation={0}
                sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    border: '1px solid #eee',
                    borderLeft: '6px solid',
                    borderColor: getScenarioColor(index),
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={1.5}>
                    <TextField 
                        label="Weight %" size="small" fullWidth type="number" 
                        value={row.possibleOutcomeRate} 
                        onChange={(e) => onUpdateScenarioRow(row.id, 'possibleOutcomeRate', Number(e.target.value) || 0)} 
                    />
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <TextField label="Name" size="small" fullWidth value={row.scenarioName} onChange={(e) => onUpdateScenarioRow(row.id, 'scenarioName', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField label="Start" size="small" fullWidth type="date" value={row.periodStart} onChange={(e) => onUpdateScenarioRow(row.id, 'periodStart', e.target.value)} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField label="End" size="small" fullWidth type="date" value={row.periodEnd} onChange={(e) => onUpdateScenarioRow(row.id, 'periodEnd', e.target.value)} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField label="RR %" size="small" fullWidth type="number" value={row.repaymentRate} onChange={(e) => onUpdateScenarioRow(row.id, 'repaymentRate', Number(e.target.value) || 0)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Delete Scenario">
                        <IconButton color="error" onClick={() => onDeleteScenarioRow(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<AddCircleIcon />}
              onClick={onAddScenarioRow}
              sx={{ borderRadius: 2 }}
            >
              Add Scenario Row
            </Button>
            
            <Stack direction="row" spacing={2}>
               {!isWeightValid && (
                 <Alert severity="warning" size="small" sx={{ py: 0, border: 'none' }}>
                    Total PO Rate must be 100%
                 </Alert>
               )}
               <Button 
                variant="contained" 
                onClick={onSaveScenarioDraft}
                disabled={!isWeightValid}
                sx={{ px: 6, borderRadius: 2, fontWeight: 'bold' }}
               >
                 Save Draft
               </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
