// packages/frontend/src/components/ifrs9/LifetimeLGDReport.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  AccountBalance as BankIcon,
  PieChart as PieIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

const LifetimeLGDReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState({
    totalAccounts: 0,
    averageLGD: 0,
    totalRecoveryAmount: 0,
    avgRecoveryRate: 0,
    lgdDistribution: [] as any[]
  });

  const handleDataLoaded = (data: any[]) => {
    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        acc.totalAccounts += 1;
        acc.totalRecoveryAmount += row.recovery_amount || 0;
        acc.averageLGD += row.lgd_rate || 0;
        return acc;
      }, {
        totalAccounts: 0,
        averageLGD: 0,
        totalRecoveryAmount: 0,
        avgRecoveryRate: 0,
        lgdDistribution: []
      });
      
      stats.averageLGD = stats.averageLGD / data.length;
      
      // Calculate LGD distribution
      const lgdRanges = [
        { range: '0-20%', min: 0, max: 0.2, count: 0, color: '#4CAF50' },
        { range: '21-40%', min: 0.2, max: 0.4, count: 0, color: '#FF9800' },
        { range: '41-60%', min: 0.4, max: 0.6, count: 0, color: '#FF5722' },
        { range: '61-80%', min: 0.6, max: 0.8, count: 0, color: '#F44336' },
        { range: '81-100%', min: 0.8, max: 1.0, count: 0, color: '#9C27B0' }
      ];
      
      data.forEach(row => {
        const lgd = row.lgd_rate || 0;
        lgdRanges.forEach(range => {
          if (lgd >= range.min && lgd < range.max) {
            range.count += 1;
          }
        });
      });
      
      stats.lgdDistribution = lgdRanges.filter(range => range.count > 0);
      setSummaryStats(stats);
    }
  };

  const SummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Total Accounts */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
              <BankIcon />
            </Avatar>
            <Typography variant="h4" component="div">
              {summaryStats.totalAccounts.toLocaleString('id-ID')}
            </Typography>
            <Typography color="text.secondary">
              Total Accounts
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Average LGD */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
              <TrendingDownIcon />
            </Avatar>
            <Typography variant="h4" component="div">
              {(summaryStats.averageLGD * 100).toFixed(2)}%
            </Typography>
            <Typography color="text.secondary">
              Average LGD Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Recovery */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
              <AssessmentIcon />
            </Avatar>
            <Typography variant="h6" component="div">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.totalRecoveryAmount)}
            </Typography>
            <Typography color="text.secondary">
              Total Recovery
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* LGD Quality */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
              <PieIcon />
            </Avatar>
            <Typography variant="h6" component="div">
              {summaryStats.averageLGD < 0.3 ? 'Low' : 
               summaryStats.averageLGD < 0.6 ? 'Medium' : 'High'}
            </Typography>
            <Typography color="text.secondary">
              LGD Risk Level
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const LGDCharts = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* LGD Distribution Bar Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              LGD Rate Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryStats.lgdDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Accounts']}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* LGD Distribution Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              LGD Rate Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryStats.lgdDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count, percent }) => 
                    `${range}: ${count} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {summaryStats.lgdDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <BaseIfrs9Report
      title="Lifetime LGD Report"
      description="Loss Given Default data with recovery information and account-level LGD calculations"
      reportType="lifetime-lgd"
      requiredParams={['prc_date']}
      optionalParams={['lgd_config_id', 'segment_id']}
      supportsPagination={true}
      supportsCharts={true}
    >
      <SummaryCards />
      <LGDCharts />
    </BaseIfrs9Report>
  );
};

export default LifetimeLGDReport;