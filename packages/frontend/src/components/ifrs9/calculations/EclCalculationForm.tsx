'use client';

// packages/frontend/src/components/ifrs9/calculations/EclCalculationForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Alert,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CalculateOutlined,
  ExpandMore,
  TuneOutlined,
  DateRange,
  Assessment
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface EclCalculationParams {
  calculationDate: Date;
  accountIds?: string[];
  parameters: {
    pd12mMethod: 'historical' | 'logistic' | 'market';
    lgdMethod: 'historical' | 'beta' | 'workout';
    eadMethod: 'current' | 'stressed' | 'regulatory';
    forwardLookingAdjustment: boolean;
    scenarioWeights?: {
      base: number;
      upside: number;
      downside: number;
    };
  };
}

interface EclCalculationFormProps {
  onCalculate: (params: EclCalculationParams) => void;
  loading?: boolean;
}

export const EclCalculationForm: React.FC<EclCalculationFormProps> = ({
  onCalculate,
  loading = false
}) => {
  const [calculationDate, setCalculationDate] = useState<Date>(new Date());
  const [accountIds, setAccountIds] = useState<string>('');
  const [pdMethod, setPdMethod] = useState<'historical' | 'logistic' | 'market'>('historical');
  const [lgdMethod, setLgdMethod] = useState<'historical' | 'beta' | 'workout'>('historical');
  const [eadMethod, setEadMethod] = useState<'current' | 'stressed' | 'regulatory'>('current');
  const [forwardLooking, setForwardLooking] = useState(false);
  const [baseWeight, setBaseWeight] = useState(50);
  const [upsideWeight, setUpsideWeight] = useState(20);
  const [downsideWeight, setDownsideWeight] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate scenario weights
    const totalWeight = baseWeight + upsideWeight + downsideWeight;
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError('Scenario weights must sum to 100%');
      return;
    }

    // Parse account IDs
    const accountIdArray = accountIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    const params: EclCalculationParams = {
      calculationDate,
      accountIds: accountIdArray.length > 0 ? accountIdArray : undefined,
      parameters: {
        pd12mMethod: pdMethod,
        lgdMethod,
        eadMethod,
        forwardLookingAdjustment: forwardLooking,
        scenarioWeights: forwardLooking ? {
          base: baseWeight / 100,
          upside: upsideWeight / 100,
          downside: downsideWeight / 100
        } : undefined
      }
    };

    onCalculate(params);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <CalculateOutlined sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            ECL Calculation Parameters
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Parameters */}
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>
                <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                Basic Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Calculation Date"
                  value={calculationDate}
                  onChange={(date: any) => setCalculationDate(date instanceof Date ? date : (date as any)?.toDate ? (date as any).toDate() : (date || new Date()))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Account IDs (comma-separated)"
                value={accountIds}
                onChange={(e) => setAccountIds(e.target.value)}
                placeholder="ACC001, ACC002, ACC003... (leave empty for all accounts)"
                helperText="Leave empty to calculate for all active accounts"
              />
            </Grid>

            {/* Calculation Methods */}
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Calculation Methods
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>PD Method</InputLabel>
                <Select
                  value={pdMethod}
                  label="PD Method"
                  onChange={(e) => setPdMethod(e.target.value as any)}
                >
                  <MenuItem value="historical">Historical</MenuItem>
                  <MenuItem value="logistic">Logistic Regression</MenuItem>
                  <MenuItem value="market">Market-based</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>LGD Method</InputLabel>
                <Select
                  value={lgdMethod}
                  label="LGD Method"
                  onChange={(e) => setLgdMethod(e.target.value as any)}
                >
                  <MenuItem value="historical">Historical</MenuItem>
                  <MenuItem value="beta">Beta Regression</MenuItem>
                  <MenuItem value="workout">Workout-based</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>EAD Method</InputLabel>
                <Select
                  value={eadMethod}
                  label="EAD Method"
                  onChange={(e) => setEadMethod(e.target.value as any)}
                >
                  <MenuItem value="current">Current Exposure</MenuItem>
                  <MenuItem value="stressed">Stressed</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Advanced Options */}
            <Grid size={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="advanced-options-content"
                  id="advanced-options-header"
                >
                  <Box display="flex" alignItems="center">
                    <TuneOutlined sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">Advanced Options</Typography>
                    <Chip
                      label="Optional"
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={forwardLooking}
                            onChange={(e) => setForwardLooking(e.target.checked)}
                          />
                        }
                        label="Forward-looking Adjustment"
                      />
                      <Typography variant="body2" color="textSecondary">
                        Apply macroeconomic scenario adjustments to ECL calculations
                      </Typography>
                    </Grid>

                    {forwardLooking && (
                      <>
                        <Grid size={12}>
                          <Typography variant="body1" gutterBottom>
                            Scenario Weights (must sum to 100%)
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Base Scenario (%)"
                            value={baseWeight}
                            onChange={(e) => setBaseWeight(Number(e.target.value))}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Upside Scenario (%)"
                            value={upsideWeight}
                            onChange={(e) => setUpsideWeight(Number(e.target.value))}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Downside Scenario (%)"
                            value={downsideWeight}
                            onChange={(e) => setDownsideWeight(Number(e.target.value))}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color={
                            Math.abs(baseWeight + upsideWeight + downsideWeight - 100) < 0.01
                              ? 'success.main' : 'error.main'
                          }>
                            Total: {baseWeight + upsideWeight + downsideWeight}%
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Submit Button */}
            <Grid size={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<CalculateOutlined />}
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : 'Start ECL Calculation'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};
