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
  Typography
} from '@mui/material';
import { Add as AddCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  return (
    <>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Choose DCF Scenario</Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>DCF Scenario Rate</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedScenario}
                displayEmpty
                onChange={(event) => onSelectedScenarioChange(String(event.target.value))}
                renderValue={(value) => {
                  const selected = scenarioOptions.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === String(value));
                  return selected
                    ? String(selected.scenarioName || selected.name || value)
                    : 'Select DCF Scenario Method';
                }}
              >
                {scenarioOptions.map((option, index) => (
                  <MenuItem key={`${option.scenarioCode || option.scenarioName || option.name || index}`} value={String(option.scenarioCode || option.scenarioName || option.name || `Scenario ${index + 1}`)}>
                    {String(option.scenarioName || option.name || `Scenario ${index + 1}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>Number Of Scenario</Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={scenarioCount}
              onChange={(event) => onScenarioCountChange(Math.max(1, Math.min(3, Number(event.target.value) || 1)))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button variant="contained" onClick={onShowScenario} sx={{ mt: { xs: 1, md: 3 } }}>
              Show
            </Button>
          </Grid>
        </Grid>
      </Box>

      {scenarioRows.length > 0 ? (
        <Box>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Possible Outcome Rate</Typography></Grid>
            <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Scenario Name</Typography></Grid>
            <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Period Start</Typography></Grid>
            <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Period End</Typography></Grid>
            <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Repayment Rate (%)</Typography></Grid>
            <Grid size={{ xs: 12, md: 2 }} />
          </Grid>
          <Stack spacing={2}>
            {scenarioRows.map((row) => (
              <Grid container spacing={2} key={row.id} alignItems="center">
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField size="small" fullWidth type="number" value={row.possibleOutcomeRate} onChange={(event) => onUpdateScenarioRow(row.id, 'possibleOutcomeRate', Number(event.target.value) || 0)} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField size="small" fullWidth value={row.scenarioName} onChange={(event) => onUpdateScenarioRow(row.id, 'scenarioName', event.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField size="small" fullWidth type="date" value={row.periodStart} onChange={(event) => onUpdateScenarioRow(row.id, 'periodStart', event.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField size="small" fullWidth type="date" value={row.periodEnd} onChange={(event) => onUpdateScenarioRow(row.id, 'periodEnd', event.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField size="small" fullWidth type="number" value={row.repaymentRate} onChange={(event) => onUpdateScenarioRow(row.id, 'repaymentRate', Number(event.target.value) || 0)} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDeleteScenarioRow(row.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<AddCircleIcon />}
              onClick={onAddScenarioRow}
            >
              Add Scenario Row
            </Button>
            <Button variant="contained" onClick={onSaveScenarioDraft}>
              Save
            </Button>
          </Stack>
        </Box>
      ) : null}
    </>
  );
}
