import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  ShowChart,
  Settings,
  PlayArrow,
  Refresh,
  Download,
  Warning
} from '@mui/icons-material';
import { useNotify } from 'react-admin';

interface ECLSummary {
  totalECL: number;
  stage1ECL: number;
  stage2ECL: number;
  stage3ECL: number;
  eclRate: number;
  totalAccounts: number;
  lastCalculated: string;
}

interface ModelStatus {
  pdModel: { status: string; accuracy: number; lastTrained: string };
  lgdModel: { status: string; rSquared: number; lastTrained: string };
  eadModel: { status: string; rSquared: number; lastTrained: string };
}

export const IFRS9Dashboard: React.FC = () => {
  const [eclSummary, setEclSummary] = useState<ECLSummary | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load ECL summary
      const eclResponse = await fetch('/api/v1/ifrs9/ecl/summary');
      if (eclResponse.ok) {
        const eclData = await eclResponse.json();
        setEclSummary(eclData.data);
      }

      // Load model status
      const modelsResponse = await fetch('/api/v1/r-analytics/models/status');
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModelStatus(modelsData.data);
      }

    } catch (error) {
      notify('Failed to load dashboard data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const runECLCalculation = async () => {
    try {
      setCalculating(true);
      const response = await fetch('/api/v1/ifrs9/ecl/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runType: 'full_portfolio' })
      });

      if (response.ok) {
        notify('ECL calculation started successfully', { type: 'success' });
        setTimeout(loadDashboardData, 2000); // Reload after 2 seconds
      } else {
        throw new Error('Calculation failed');
      }
    } catch (error) {
      notify('Failed to start ECL calculation', { type: 'error' });
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          IFRS 9 Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={calculating ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={runECLCalculation}
            disabled={calculating}
          >
            {calculating ? 'Calculating...' : 'Run ECL Calculation'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ECL Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total ECL</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ${eclSummary?.totalECL?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ECL Rate: {((eclSummary?.eclRate || 0) * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Stage 1 ECL</Typography>
              <Typography variant="h4" color="success.main">
                ${eclSummary?.stage1ECL?.toLocaleString() || '0'}
              </Typography>
              <Chip label="12-month ECL" size="small" color="success" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Stage 2 ECL</Typography>
              <Typography variant="h4" color="warning.main">
                ${eclSummary?.stage2ECL?.toLocaleString() || '0'}
              </Typography>
              <Chip label="Lifetime ECL" size="small" color="warning" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Stage 3 ECL</Typography>
              <Typography variant="h4" color="error.main">
                ${eclSummary?.stage3ECL?.toLocaleString() || '0'}
              </Typography>
              <Chip label="Credit Impaired" size="small" color="error" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Status Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">PD Model</Typography>
                <Chip
                  label={modelStatus?.pdModel?.status || 'Unknown'}
                  color={modelStatus?.pdModel?.status === 'active' ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="body1">
                Accuracy: {((modelStatus?.pdModel?.accuracy || 0) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last Trained: {modelStatus?.pdModel?.lastTrained || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">LGD Model</Typography>
                <Chip
                  label={modelStatus?.lgdModel?.status || 'Unknown'}
                  color={modelStatus?.lgdModel?.status === 'active' ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="body1">
                R²: {((modelStatus?.lgdModel?.rSquared || 0) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last Trained: {modelStatus?.lgdModel?.lastTrained || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">EAD Model</Typography>
                <Chip
                  label={modelStatus?.eadModel?.status || 'Unknown'}
                  color={modelStatus?.eadModel?.status === 'active' ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="body1">
                R²: {((modelStatus?.eadModel?.rSquared || 0) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last Trained: {modelStatus?.eadModel?.lastTrained || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assessment />}
                  >
                    View Calculations
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ShowChart />}
                  >
                    Model Management
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Download />}
                  >
                    Generate Reports
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Settings />}
                  >
                    Configuration
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>System Status</Typography>
              <Alert severity="success" sx={{ mb: 1 }}>
                R Analytics Service: Online
              </Alert>
              <Alert severity="success" sx={{ mb: 1 }}>
                IFRS 9 Calculation Engine: Ready
              </Alert>
              <Alert severity="info">
                Last Portfolio Update: {eclSummary?.lastCalculated || 'N/A'}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IFRS9Dashboard;
