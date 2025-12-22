#!/bin/bash
# scripts/codegen/generate-ifrs9-frontend.sh
# IFRS 9 Frontend Components Generator - DAY 3 HOUR 1

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/packages/frontend"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Generate IFRS 9 Dashboard Component
generate_ifrs9_dashboard() {
    log_info "Generating IFRS 9 dashboard component..."
    
    cat > "${FRONTEND_DIR}/src/components/ifrs9/dashboard/IfrsCalculationDashboard.tsx" << 'EOF'
// packages/frontend/src/components/ifrs9/dashboard/IfrsCalculationDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CalculateOutlined,
  TrendingUp,
  Assessment,
  AccountBalance,
  Timeline,
  Refresh
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import numeral from 'numeral';

interface EclCalculationResult {
  jobId: string;
  totalAccounts: number;
  processedAccounts: number;
  results: {
    stage1Count: number;
    stage2Count: number;
    stage3Count: number;
    totalEcl12m: number;
    totalEclLifetime: number;
    totalEcl: number;
  };
}

interface PortfolioSummary {
  total_accounts: number;
  total_outstanding: number;
  stage1_count: number;
  stage2_count: number;
  stage3_count: number;
  total_ecl_12m: number;
  total_ecl_lifetime: number;
  syariah_outstanding: number;
}

const COLORS = ['#4caf50', '#ff9800', '#f44336'];

export const IfrsCalculationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [calculationResult, setCalculationResult] = useState<EclCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolioSummary();
  }, []);

  const loadPortfolioSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ifrs9/portfolio/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': localStorage.getItem('tenantId') || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load portfolio summary');
      }

      const data = await response.json();
      setPortfolioSummary(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runEclCalculation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ifrs9/ecl/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': localStorage.getItem('tenantId') || ''
        },
        body: JSON.stringify({
          calculationDate: new Date().toISOString().split('T')[0],
          parameters: {
            pd12mMethod: 'historical',
            lgdMethod: 'historical',
            eadMethod: 'current'
          }
        })
      });

      if (!response.ok) {
        throw new Error('ECL calculation failed');
      }

      const data = await response.json();
      setCalculationResult(data.data);
      
      // Refresh portfolio summary
      await loadPortfolioSummary();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return numeral(amount).format('$0,0.00');
  };

  const formatPercentage = (value: number) => {
    return numeral(value).format('0.00%');
  };

  const getStageData = () => {
    if (!portfolioSummary) return [];
    
    return [
      { name: 'Stage 1', value: portfolioSummary.stage1_count, color: COLORS[0] },
      { name: 'Stage 2', value: portfolioSummary.stage2_count, color: COLORS[1] },
      { name: 'Stage 3', value: portfolioSummary.stage3_count, color: COLORS[2] }
    ];
  };

  if (loading && !portfolioSummary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <Assessment sx={{ mr: 2, verticalAlign: 'middle' }} />
          IFRS 9 Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadPortfolioSummary}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CalculateOutlined />}
            onClick={runEclCalculation}
            disabled={loading}
            color="primary"
          >
            {loading ? 'Calculating...' : 'Run ECL Calculation'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Portfolio Overview Cards */}
      {portfolioSummary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalance color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Accounts
                    </Typography>
                    <Typography variant="h5">
                      {numeral(portfolioSummary.total_accounts).format('0,0')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Outstanding
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(portfolioSummary.total_outstanding)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Timeline color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total ECL
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(portfolioSummary.total_ecl_12m + portfolioSummary.total_ecl_lifetime)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Syariah Portfolio
                    </Typography>
                    <Typography variant="h5">
                      {formatPercentage(portfolioSummary.syariah_outstanding / portfolioSummary.total_outstanding)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Stage Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IFRS 9 Stage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStageData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStageData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Stage Summary Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stage Analysis
              </Typography>
              {portfolioSummary && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Stage</TableCell>
                        <TableCell align="right">Accounts</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Chip label="Stage 1" color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          {numeral(portfolioSummary.stage1_count).format('0,0')}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(portfolioSummary.stage1_count / portfolioSummary.total_accounts)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">Normal</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Chip label="Stage 2" color="warning" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          {numeral(portfolioSummary.stage2_count).format('0,0')}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(portfolioSummary.stage2_count / portfolioSummary.total_accounts)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="warning.main">Watch</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Chip label="Stage 3" color="error" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          {numeral(portfolioSummary.stage3_count).format('0,0')}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(portfolioSummary.stage3_count / portfolioSummary.total_accounts)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="error.main">Impaired</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Calculation Results */}
        {calculationResult && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest ECL Calculation Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="primary">
                        {numeral(calculationResult.totalAccounts).format('0,0')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Accounts Processed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(calculationResult.results.totalEcl12m)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        12-Month ECL
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="warning.main">
                        {formatCurrency(calculationResult.results.totalEclLifetime)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Lifetime ECL
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="error.main">
                        {formatCurrency(calculationResult.results.totalEcl)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total ECL
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary">
                  Calculation ID: {calculationResult.jobId}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completed at: {format(new Date(), 'PPpp')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
EOF

    log_success "IFRS 9 dashboard component generated"
}

# Generate IFRS 9 calculation form
generate_calculation_form() {
    log_info "Generating IFRS 9 calculation form..."
    
    cat > "${FRONTEND_DIR}/src/components/ifrs9/calculations/EclCalculationForm.tsx" << 'EOF'
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
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                Basic Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Calculation Date"
                  value={calculationDate}
                  onChange={(date) => setCalculationDate(date || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
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
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Calculation Methods
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
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
            <Grid item xs={12}>
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
                    <Grid item xs={12}>
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
                        <Grid item xs={12}>
                          <Typography variant="body1" gutterBottom>
                            Scenario Weights (must sum to 100%)
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Base Scenario (%)"
                            value={baseWeight}
                            onChange={(e) => setBaseWeight(Number(e.target.value))}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Upside Scenario (%)"
                            value={upsideWeight}
                            onChange={(e) => setUpsideWeight(Number(e.target.value))}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Downside Scenario (%)"
                            value={downsideWeight}
                            onChange={(e) => setDownsideWeight(Number(e.target.value))}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
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
            <Grid item xs={12}>
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
EOF

    log_success "IFRS 9 calculation form generated"
}

# Generate IFRS 9 page component
generate_ifrs9_page() {
    log_info "Generating IFRS 9 main page..."
    
    cat > "${FRONTEND_DIR}/src/pages/ifrs9/index.tsx" << 'EOF'
// packages/frontend/src/pages/ifrs9/index.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import {
  Assessment,
  CalculateOutlined,
  History,
  Settings
} from '@mui/icons-material';
import { IfrsCalculationDashboard } from '../../components/ifrs9/dashboard/IfrsCalculationDashboard';
import { EclCalculationForm } from '../../components/ifrs9/calculations/EclCalculationForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ifrs9-tabpanel-${index}`}
      aria-labelledby={`ifrs9-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ifrs9-tab-${index}`,
    'aria-controls': `ifrs9-tabpanel-${index}`,
  };
}

export default function Ifrs9Page() {
  const [tabValue, setTabValue] = useState(0);
  const [calculationLoading, setCalculationLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCalculation = async (params: any) => {
    try {
      setCalculationLoading(true);
      
      const response = await fetch('/api/ifrs9/ecl/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-ID': localStorage.getItem('tenantId') || ''
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('ECL calculation failed');
      }

      const data = await response.json();
      
      // Switch to dashboard tab to show results
      setTabValue(0);
      
    } catch (err) {
      console.error('Calculation failed:', err);
      // Error handling would be done by the form component
    } finally {
      setCalculationLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          IFRS 9 Risk Management
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Expected Credit Loss calculation and portfolio risk analysis
        </Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="IFRS 9 navigation tabs">
          <Tab 
            icon={<Assessment />} 
            label="Dashboard" 
            {...a11yProps(0)} 
            sx={{ minHeight: 72 }}
          />
          <Tab 
            icon={<CalculateOutlined />} 
            label="Calculate ECL" 
            {...a11yProps(1)}
            sx={{ minHeight: 72 }}
          />
          <Tab 
            icon={<History />} 
            label="Calculation History" 
            {...a11yProps(2)}
            sx={{ minHeight: 72 }}
          />
          <Tab 
            icon={<Settings />} 
            label="Configuration" 
            {...a11yProps(3)}
            sx={{ minHeight: 72 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <IfrsCalculationDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <EclCalculationForm 
          onCalculate={handleCalculation}
          loading={calculationLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="textSecondary">
            Calculation History
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Coming in DAY 3 HOUR 2
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="textSecondary">
            IFRS 9 Configuration
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Model parameters and risk settings
          </Typography>
        </Box>
      </TabPanel>
    </Container>
  );
}
EOF

    log_success "IFRS 9 main page generated"
}

# Generate React Admin IFRS 9 resources
generate_react_admin_resources() {
    log_info "Generating React Admin IFRS 9 resources..."
    
    cat > "${FRONTEND_DIR}/src/admin/resources/PortfolioAccountResource.tsx" << 'EOF'
// packages/frontend/src/admin/resources/PortfolioAccountResource.tsx
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  ReferenceInput,
  Create,
  Filter,
  SearchInput,
  ChipField,
  FunctionField
} from 'react-admin';
import { Chip } from '@mui/material';

const PortfolioAccountFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="q" placeholder="Search accounts..." alwaysOn />
    <SelectInput
      source="currentStage"
      choices={[
        { id: 1, name: 'Stage 1' },
        { id: 2, name: 'Stage 2' },
        { id: 3, name: 'Stage 3' },
      ]}
      emptyText="All Stages"
    />
    <SelectInput
      source="customerType"
      choices={[
        { id: 'Individual', name: 'Individual' },
        { id: 'Corporate', name: 'Corporate' },
        { id: 'SME', name: 'SME' },
      ]}
      emptyText="All Customer Types"
    />
    <BooleanInput source="isSyariahCompliant" label="Syariah Compliant Only" />
  </Filter>
);

const StageChip = ({ record }: any) => {
  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={`Stage ${record.currentStage}`}
      color={getStageColor(record.currentStage)}
      size="small"
    />
  );
};

export const PortfolioAccountList = (props: any) => (
  <List {...props} filters={<PortfolioAccountFilter />} perPage={25}>
    <Datagrid rowClick="show">
      <TextField source="accountId" label="Account ID" />
      <TextField source="customerName" label="Customer" />
      <TextField source="productType" label="Product" />
      <NumberField 
        source="outstandingAmount" 
        label="Outstanding" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <FunctionField
        label="Stage"
        render={(record: any) => <StageChip record={record} />}
      />
      <NumberField source="pd12m" label="PD 12M" options={{ style: 'percent', minimumFractionDigits: 2 }} />
      <NumberField source="lgd" label="LGD" options={{ style: 'percent', minimumFractionDigits: 2 }} />
      <NumberField 
        source="ecl12m" 
        label="ECL 12M" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <BooleanField source="isSyariahCompliant" label="Syariah" />
      <DateField source="reportingDate" label="Reporting Date" />
    </Datagrid>
  </List>
);

export const PortfolioAccountShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="accountId" label="Account ID" />
      <TextField source="customerId" label="Customer ID" />
      <TextField source="customerName" label="Customer Name" />
      <TextField source="productType" label="Product Type" />
      <NumberField 
        source="outstandingAmount" 
        label="Outstanding Amount" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberField 
        source="committedAmount" 
        label="Committed Amount" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <TextField source="currencyCode" label="Currency" />
      <DateField source="originationDate" label="Origination Date" />
      <DateField source="maturityDate" label="Maturity Date" />
      <DateField source="reportingDate" label="Reporting Date" />
      
      <FunctionField
        label="IFRS 9 Stage"
        render={(record: any) => <StageChip record={record} />}
      />
      
      <TextField source="customerType" label="Customer Type" />
      <TextField source="industrySector" label="Industry Sector" />
      <TextField source="internalRating" label="Internal Rating" />
      <TextField source="externalRating" label="External Rating" />
      
      <NumberField source="pd12m" label="PD 12M" options={{ style: 'percent', minimumFractionDigits: 4 }} />
      <NumberField source="pdLifetime" label="PD Lifetime" options={{ style: 'percent', minimumFractionDigits: 4 }} />
      <NumberField source="lgd" label="LGD" options={{ style: 'percent', minimumFractionDigits: 2 }} />
      <NumberField 
        source="ead" 
        label="EAD" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberField 
        source="ecl12m" 
        label="ECL 12M" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberField 
        source="eclLifetime" 
        label="ECL Lifetime" 
        options={{ style: 'currency', currency: 'USD' }}
      />
      
      <BooleanField source="isSyariahCompliant" label="Syariah Compliant" />
      <TextField source="syariahContractType" label="Syariah Contract Type" />
      <TextField source="syariahStructure" label="Syariah Structure" />
      <NumberField source="profitSharingRatio" label="Profit Sharing Ratio" options={{ style: 'percent' }} />
      
      <TextField source="accountStatus" label="Account Status" />
      <BooleanField source="isActive" label="Active" />
      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />
    </SimpleShowLayout>
  </Show>
);

export const PortfolioAccountEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="accountId" label="Account ID" disabled />
      <TextInput source="customerId" label="Customer ID" />
      <TextInput source="customerName" label="Customer Name" />
      <TextInput source="productType" label="Product Type" />
      
      <NumberInput source="outstandingAmount" label="Outstanding Amount" />
      <NumberInput source="committedAmount" label="Committed Amount" />
      <TextInput source="currencyCode" label="Currency Code" />
      
      <DateInput source="originationDate" label="Origination Date" />
      <DateInput source="maturityDate" label="Maturity Date" />
      <DateInput source="reportingDate" label="Reporting Date" />
      
      <SelectInput
        source="currentStage"
        label="Current Stage"
        choices={[
          { id: 1, name: 'Stage 1 - Normal' },
          { id: 2, name: 'Stage 2 - Watch' },
          { id: 3, name: 'Stage 3 - Impaired' },
        ]}
      />
      
      <TextInput source="customerType" label="Customer Type" />
      <TextInput source="industrySector" label="Industry Sector" />
      <TextInput source="internalRating" label="Internal Rating" />
      <TextInput source="externalRating" label="External Rating" />
      
      <NumberInput source="pd12m" label="PD 12M" step={0.0001} />
      <NumberInput source="pdLifetime" label="PD Lifetime" step={0.0001} />
      <NumberInput source="lgd" label="LGD" step={0.01} />
      <NumberInput source="ead" label="EAD" />
      
      <BooleanInput source="isSyariahCompliant" label="Syariah Compliant" />
      <TextInput source="syariahContractType" label="Syariah Contract Type" />
      <TextInput source="syariahStructure" label="Syariah Structure" />
      <NumberInput source="profitSharingRatio" label="Profit Sharing Ratio" step={0.01} />
      
      <SelectInput
        source="accountStatus"
        label="Account Status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'closed', name: 'Closed' },
          { id: 'suspended', name: 'Suspended' },
          { id: 'default', name: 'Default' },
        ]}
      />
      <BooleanInput source="isActive" label="Active" />
    </SimpleForm>
  </Edit>
);

export const PortfolioAccountCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="accountId" label="Account ID" required />
      <TextInput source="customerId" label="Customer ID" required />
      <TextInput source="customerName" label="Customer Name" required />
      <TextInput source="productType" label="Product Type" required />
      
      <NumberInput source="outstandingAmount" label="Outstanding Amount" required />
      <NumberInput source="committedAmount" label="Committed Amount" />
      <TextInput source="currencyCode" label="Currency Code" defaultValue="USD" />
      
      <DateInput source="originationDate" label="Origination Date" required />
      <DateInput source="maturityDate" label="Maturity Date" required />
      <DateInput source="reportingDate" label="Reporting Date" defaultValue={new Date()} />
      
      <SelectInput
        source="currentStage"
        label="Current Stage"
        choices={[
          { id: 1, name: 'Stage 1 - Normal' },
          { id: 2, name: 'Stage 2 - Watch' },
          { id: 3, name: 'Stage 3 - Impaired' },
        ]}
        defaultValue={1}
      />
      
      <TextInput source="customerType" label="Customer Type" required />
      <TextInput source="industrySector" label="Industry Sector" />
      <TextInput source="internalRating" label="Internal Rating" />
      <TextInput source="externalRating" label="External Rating" />
      
      <BooleanInput source="isSyariahCompliant" label="Syariah Compliant" />
      <TextInput source="syariahContractType" label="Syariah Contract Type" />
      
      <SelectInput
        source="accountStatus"
        label="Account Status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'pending', name: 'Pending' },
        ]}
        defaultValue="active"
      />
    </SimpleForm>
  </Create>
);
EOF

    log_success "React Admin IFRS 9 resources generated"
}

# Main function
main() {
    log_info "Starting IFRS 9 frontend components generation..."
    
    # Create directories
    mkdir -p "${FRONTEND_DIR}/src/components/ifrs9"/{dashboard,calculations,reports}
    mkdir -p "${FRONTEND_DIR}/src/pages/ifrs9"
    mkdir -p "${FRONTEND_DIR}/src/admin/resources"
    
    # Generate components
    generate_ifrs9_dashboard
    generate_calculation_form
    generate_ifrs9_page
    generate_react_admin_resources
    
    log_success "IFRS 9 frontend components generation completed successfully!"
}

# Execute main function
main "$@"