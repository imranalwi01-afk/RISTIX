import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ShowChart as ShowChartIcon,
  PlayArrow as RunIcon,
  Clear as ClearIcon,
  Addchart as AddChartIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import {
  type IndividualImpairmentWatchlistItem,
  type IndividualImpairmentAssessment
} from '@/services/api.individual-impairment';

interface DCFAnalysisTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  onCalculate: (parameters: any) => void;
  loading: boolean;
}

export function DCFAnalysisTab({ account, assessment, onCalculate, loading }: DCFAnalysisTabProps) {
  const [parameters, setParameters] = useState({
    discountRate: 8.5,
    projectedGrowthRate: 2.0,
    recoveryRate: 60.0,
    timeHorizon: 60,
    paymentFrequency: 'monthly',
    scenarioType: 'base'
  });

  const [scenarioData, setScenarioData] = useState([
    { name: 'Base Case', discountRate: 8.5, recoveryRate: 60.0, growthRate: 2.0 },
    { name: 'Optimistic', discountRate: 6.5, recoveryRate: 75.0, growthRate: 3.5 },
    { name: 'Pessimistic', discountRate: 12.0, recoveryRate: 40.0, growthRate: 0.5 }
  ]);

  const [activeScenario, setActiveScenario] = useState('base');
  const [calculationResults, setCalculationResults] = useState<any>(null);

  const handleParameterChange = (field: string, value: any) => {
    setParameters(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    onCalculate({
      ...parameters,
      scenarioType: activeScenario,
      accountId: account?.account_id
    });
  };

  const handleScenarioChange = (scenarioName: string) => {
    const scenario = scenarioData.find(s => s.name === scenarioName);
    if (scenario) {
      setParameters(prev => ({
        ...prev,
        discountRate: scenario.discountRate,
        recoveryRate: scenario.recoveryRate,
        projectedGrowthRate: scenario.growthRate
      }));
      setActiveScenario(scenarioName.toLowerCase().replace(' ', ''));
    }
  };

  // Local helper function for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Local helper function for rendering stage chip
  const renderStageChipLocal = (stage: number) => {
    const colors = {
      1: '#4caf50',
      2: '#ff9800',
      3: '#f44336'
    };
    const labels = {
      1: 'Stage 1',
      2: 'Stage 2',
      3: 'Stage 3'
    };

    return (
      <Chip
        label={labels[stage as keyof typeof labels] || 'Unknown'}
        size="small"
        sx={{
          backgroundColor: colors[stage as keyof typeof colors] || '#757575',
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Local helper function for rendering impaired flag
  const renderImpairedFlagLocal = (flag: string) => {
    return (
      <Chip
        label={flag === 'I' ? 'Impaired' : 'Non-Impaired'}
        size="small"
        color={flag === 'I' ? 'error' : 'success'}
        variant="outlined"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalculateIcon sx={{ mr: 1 }} />
        DCF Analysis - {account?.account_number} - {account?.cif_name}
      </Typography>

      <Grid container spacing={2}>
        {/* DCF Parameters - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                DCF Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Discount Rate (%)"
                  type="number"
                  value={parameters.discountRate}
                  onChange={(e) => handleParameterChange('discountRate', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  size="small"
                  helperText="Annual discount rate for present value calculation"
                />

                <TextField
                  label="Recovery Rate (%)"
                  type="number"
                  value={parameters.recoveryRate}
                  onChange={(e) => handleParameterChange('recoveryRate', parseFloat(e.target.value))}
                  inputProps={{ step: 1, min: 0, max: 100 }}
                  size="small"
                  helperText="Expected recovery rate of outstanding balance"
                />

                <TextField
                  label="Growth Rate (%)"
                  type="number"
                  value={parameters.projectedGrowthRate}
                  onChange={(e) => handleParameterChange('projectedGrowthRate', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: -10, max: 20 }}
                  size="small"
                  helperText="Projected cash flow growth rate"
                />

                <TextField
                  label="Time Horizon (months)"
                  type="number"
                  value={parameters.timeHorizon}
                  onChange={(e) => handleParameterChange('timeHorizon', parseInt(e.target.value))}
                  inputProps={{ step: 1, min: 1, max: 360 }}
                  size="small"
                  helperText="Analysis period in months"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Payment Frequency</InputLabel>
                  <Select
                    value={parameters.paymentFrequency}
                    label="Payment Frequency"
                    onChange={(e) => handleParameterChange('paymentFrequency', e.target.value)}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<RunIcon />}
                    onClick={handleCalculate}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={20} /> : 'Calculate DCF'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => setCalculationResults(null)}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information - Right Column beside DCF Parameters */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Outstanding Balance:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(account?.outstanding_balance || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Current Provision:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(account?.provision_amount || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Current Stage:</Typography>
                  <Box sx={{ mt: 1 }}>
                    {account && renderStageChipLocal(account.stage)}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Impaired Status:</Typography>
                  <Box sx={{ mt: 1 }}>
                    {account && renderImpairedFlagLocal(account.impaired_flag)}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Scenario Analysis - Full Width Below */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AddChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Scenario Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {scenarioData.map((scenario) => (
                  <Button
                    key={scenario.name}
                    variant={activeScenario.includes(scenario.name.toLowerCase()) ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleScenarioChange(scenario.name)}
                    sx={{ flex: '1 1 auto' }}
                  >
                    {scenario.name}
                  </Button>
                ))}
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell>Discount Rate</TableCell>
                      <TableCell>Recovery Rate</TableCell>
                      <TableCell>Growth Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scenarioData.map((scenario) => (
                      <TableRow key={scenario.name}>
                        <TableCell>{scenario.name}</TableCell>
                        <TableCell>{scenario.discountRate}%</TableCell>
                        <TableCell>{scenario.recoveryRate}%</TableCell>
                        <TableCell>{scenario.growthRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
