// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/components/common/Dashboard.tsx
// Generated: Day 2 Hour 6 - Part 1 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6
// Purpose: Main dashboard with dual banking support and metrics
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance,
  Assessment,
  TrendingUp,
  Security,
  Notifications,
  Settings,
  MoreVert,
  Refresh,
  GetApp,
  Upload,
  Calculate
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Types
interface DashboardProps {
  bankingType: 'conventional' | 'syariah' | 'dual';
  tenantConfig: any;
  onBankingTypeChange: (type: 'conventional' | 'syariah' | 'dual') => void;
}

interface DashboardMetrics {
  totalPortfolios: number;
  totalExposure: number;
  eclCalculations: number;
  lastCalculationDate: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  systemHealth: 'healthy' | 'warning' | 'critical';
}

/**
 * Main Dashboard Component with Dual Banking Support
 * Displays key metrics, system status, and quick actions
 */
export const Dashboard: React.FC<any> = ({
  bankingType = 'conventional',
  tenantConfig = {},
  onBankingTypeChange = () => { }
}) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPortfolios: 0,
    totalExposure: 0,
    eclCalculations: 0,
    lastCalculationDate: '',
    complianceStatus: 'compliant',
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Load dashboard metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);

        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockMetrics: DashboardMetrics = {
          totalPortfolios: bankingType === 'syariah' ? 25 : 45,
          totalExposure: bankingType === 'syariah' ? 125000000 : 250000000,
          eclCalculations: 12,
          lastCalculationDate: new Date().toISOString().split('T')[0],
          complianceStatus: bankingType === 'syariah' ? 'compliant' : 'warning',
          systemHealth: 'healthy'
        };

        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [bankingType]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tenantConfig?.culturalSettings?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'non-compliant':
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {bankingType === 'syariah' ? 'Islamic Banking' : 'Conventional Banking'} Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={bankingType === 'syariah' ? 'Syariah Compliant' : 'Conventional Banking'}
              color={bankingType === 'syariah' ? 'success' : 'primary'}
              icon={<AccountBalance />}
            />
            <Chip
              label={`Compliance: ${metrics.complianceStatus}`}
              color={getStatusColor(metrics.complianceStatus) as any}
              size="small"
            />
            <Chip
              label={`System: ${metrics.systemHealth}`}
              color={getStatusColor(metrics.systemHealth) as any}
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => onBankingTypeChange(bankingType === 'syariah' ? 'conventional' : 'syariah')}>
              <ListItemIcon>
                <AccountBalance />
              </ListItemIcon>
              <ListItemText>
                Switch to {bankingType === 'syariah' ? 'Conventional' : 'Syariah'} Banking
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Portfolios */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Portfolios
                  </Typography>
                  <Typography variant="h5">
                    {metrics.totalPortfolios}
                  </Typography>
                </Box>
                <DashboardIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Exposure */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Exposure
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(metrics.totalExposure)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ECL Calculations */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    ECL Calculations
                  </Typography>
                  <Typography variant="h5">
                    {metrics.eclCalculations}
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, color: theme.palette.info.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Compliance
                  </Typography>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {metrics.complianceStatus}
                  </Typography>
                </Box>
                <Security sx={{
                  fontSize: 40,
                  color: (theme.palette[getStatusColor(metrics.complianceStatus) as keyof typeof theme.palette] as any)?.main || theme.palette.primary.main
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Quick Actions"
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Upload />}
                    sx={{ py: 2 }}
                  >
                    Upload Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Calculate />}
                    sx={{ py: 2 }}
                  >
                    Run ECL Calculation
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GetApp />}
                    sx={{ py: 2 }}
                  >
                    Export Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="System Status" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Last Calculation
                </Typography>
                <Typography variant="body1">
                  {metrics.lastCalculationDate}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Banking Type
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {bankingType} Banking
                </Typography>
              </Box>

              <Alert
                severity={getStatusColor(metrics.systemHealth) as any}
                sx={{ mt: 2 }}
              >
                System is {metrics.systemHealth}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Banking-specific alerts */}
      {bankingType === 'syariah' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Islamic Banking Mode:</strong> All calculations and operations are Syariah-compliant
            according to AAOIFI standards.
          </Typography>
        </Alert>
      )}

      {/* Recent Activities */}
      <Card>
        <CardHeader
          title="Recent Activities"
          action={
            <Button size="small" startIcon={<Notifications />}>
              View All
            </Button>
          }
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            No recent activities to display.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;