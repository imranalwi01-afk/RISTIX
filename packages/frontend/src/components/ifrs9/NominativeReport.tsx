// packages/frontend/src/components/ifrs9/NominativeReport.tsx
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance as AccountIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import BaseIfrs9Report from './BaseIfrs9Report';

const NominativeReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = React.useState({
    totalAccounts: 0,
    stage1Count: 0,
    stage2Count: 0,
    stage3Count: 0,
    totalECL: 0,
    totalOutstanding: 0
  });

  const handleDataLoaded = (data: any[]) => {
    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        acc.totalAccounts += 1;
        acc.totalOutstanding += row.outstanding_amount || 0;
        acc.totalECL += row.ecl_amount || 0;
        
        if (row.current_stage === 1) acc.stage1Count += 1;
        else if (row.current_stage === 2) acc.stage2Count += 1;
        else if (row.current_stage === 3) acc.stage3Count += 1;
        
        return acc;
      }, {
        totalAccounts: 0,
        stage1Count: 0,
        stage2Count: 0,
        stage3Count: 0,
        totalECL: 0,
        totalOutstanding: 0
      });
      
      setSummaryStats(stats);
    }
  };

  const SummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Total Accounts */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <AccountIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {summaryStats.totalAccounts.toLocaleString('id-ID')}
            </Typography>
            <Typography color="text.secondary">
              Total Accounts
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Outstanding */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" component="div">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.totalOutstanding)}
            </Typography>
            <Typography color="text.secondary">
              Outstanding Amount
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total ECL */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6" component="div">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.totalECL)}
            </Typography>
            <Typography color="text.secondary">
              Total ECL
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* ECL Ratio */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h6" component="div">
              {summaryStats.totalOutstanding > 0 
                ? ((summaryStats.totalECL / summaryStats.totalOutstanding) * 100).toFixed(2)
                : 0}%
            </Typography>
            <Typography color="text.secondary">
              ECL Ratio
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Stage Distribution */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              IFRS 9 Stage Distribution
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    size="small" 
                    label="Stage 1" 
                    color="success" 
                    sx={{ mr: 1, minWidth: 70 }}
                  />
                  <Typography variant="body2">
                    {summaryStats.stage1Count.toLocaleString('id-ID')} accounts
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.totalAccounts > 0 ? (summaryStats.stage1Count / summaryStats.totalAccounts) * 100 : 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {summaryStats.totalAccounts > 0 
                    ? ((summaryStats.stage1Count / summaryStats.totalAccounts) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    size="small" 
                    label="Stage 2" 
                    color="warning" 
                    sx={{ mr: 1, minWidth: 70 }}
                  />
                  <Typography variant="body2">
                    {summaryStats.stage2Count.toLocaleString('id-ID')} accounts
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.totalAccounts > 0 ? (summaryStats.stage2Count / summaryStats.totalAccounts) * 100 : 0}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {summaryStats.totalAccounts > 0 
                    ? ((summaryStats.stage2Count / summaryStats.totalAccounts) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    size="small" 
                    label="Stage 3" 
                    color="error" 
                    sx={{ mr: 1, minWidth: 70 }}
                  />
                  <Typography variant="body2">
                    {summaryStats.stage3Count.toLocaleString('id-ID')} accounts
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.totalAccounts > 0 ? (summaryStats.stage3Count / summaryStats.totalAccounts) * 100 : 0}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {summaryStats.totalAccounts > 0 
                    ? ((summaryStats.stage3Count / summaryStats.totalAccounts) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <BaseIfrs9Report
      title="Nominative Report"
      description="Detailed account-level IFRS 9 data with comprehensive account information and ECL calculations"
      reportType="nominative-report"
      requiredParams={['prc_date']}
      optionalParams={['segment_id', 'stage', 'branch_code']}
      supportsPagination={true}
      supportsCharts={true}
    >
      <SummaryCards />
    </BaseIfrs9Report>
  );
};

export default NominativeReport;