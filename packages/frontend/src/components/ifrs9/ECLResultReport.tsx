// packages/frontend/src/components/ifrs9/ECLResultReport.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingDown as LossIcon,
  AccountBalance as BalanceIcon,
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
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

const ECLResultReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState({
    totalECL: 0,
    stage1ECL: 0,
    stage2ECL: 0,
    stage3ECL: 0,
    totalOutstanding: 0,
    eclRatio: 0,
    segmentBreakdown: [] as any[],
    stageDistribution: [] as any[]
  });

  const handleDataLoaded = (data: any[]) => {
    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        const eclAmount = row.ecl_amount || 0;
        const outstanding = row.outstanding_amount || 0;
        const stage = row.current_stage || 1;
        
        acc.totalECL += eclAmount;
        acc.totalOutstanding += outstanding;
        
        if (stage === 1) acc.stage1ECL += eclAmount;
        else if (stage === 2) acc.stage2ECL += eclAmount;
        else if (stage === 3) acc.stage3ECL += eclAmount;
        
        return acc;
      }, {
        totalECL: 0,
        stage1ECL: 0,
        stage2ECL: 0,
        stage3ECL: 0,
        totalOutstanding: 0,
        eclRatio: 0,
        segmentBreakdown: [],
        stageDistribution: []
      });
      
      stats.eclRatio = stats.totalOutstanding > 0 ? (stats.totalECL / stats.totalOutstanding) * 100 : 0;
      
      // Stage distribution for pie chart
      const stageData = [
        { name: 'Stage 1', value: stats.stage1ECL, color: '#4CAF50' },
        { name: 'Stage 2', value: stats.stage2ECL, color: '#FF9800' },
        { name: 'Stage 3', value: stats.stage3ECL, color: '#F44336' }
      ].filter(item => item.value > 0);
      
      // Segment breakdown (sample aggregation)
      const segmentMap = new Map();
      data.forEach(row => {
        const segment = row.segment_name || 'Default Segment';
        if (!segmentMap.has(segment)) {
          segmentMap.set(segment, {
            segment,
            ecl: 0,
            outstanding: 0,
            accounts: 0
          });
        }
        const segmentData = segmentMap.get(segment);
        segmentData.ecl += row.ecl_amount || 0;
        segmentData.outstanding += row.outstanding_amount || 0;
        segmentData.accounts += 1;
      });
      
      const segmentBreakdown = Array.from(segmentMap.values()).map(item => ({
        ...item,
        eclRatio: item.outstanding > 0 ? (item.ecl / item.outstanding) * 100 : 0
      }));
      
      stats.segmentBreakdown = segmentBreakdown;
      stats.stageDistribution = stageData;
      setSummaryStats(stats);
    }
  };

  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Total ECL */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <LossIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h5" component="div" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.totalECL)}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Total ECL Amount
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Outstanding */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <BalanceIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h5" component="div" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.totalOutstanding)}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Total Outstanding
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* ECL Ratio */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <AssessmentIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h5" component="div" fontWeight="bold">
              {summaryStats.eclRatio.toFixed(2)}%
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              ECL Coverage Ratio
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Level */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ 
              bgcolor: summaryStats.eclRatio < 2 ? 'success.main' : 
                       summaryStats.eclRatio < 5 ? 'warning.main' : 'error.main',
              mx: 'auto', mb: 2, width: 56, height: 56 
            }}>
              <PieIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h5" component="div" fontWeight="bold">
              {summaryStats.eclRatio < 2 ? 'Low' : 
               summaryStats.eclRatio < 5 ? 'Medium' : 'High'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Overall Risk Level
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const StageBreakdownCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ECL by IFRS 9 Stage
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>Stage 1 (12-month ECL)</Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(summaryStats.stage1ECL)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Performing Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>Stage 2 (Lifetime ECL)</Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(summaryStats.stage2ECL)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Underperforming Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>Stage 3 (Lifetime ECL)</Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(summaryStats.stage3ECL)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Non-Performing Assets
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const ECLCharts = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Stage Distribution Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ECL Distribution by Stage
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={summaryStats.stageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(value)} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summaryStats.stageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(value),
                    'ECL Amount'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Segment Analysis */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ECL Analysis by Segment
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={summaryStats.segmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'ecl' || name === 'outstanding') {
                      return [new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact'
                      }).format(value), name === 'ecl' ? 'ECL Amount' : 'Outstanding'];
                    }
                    return [`${value.toFixed(2)}%`, 'ECL Ratio'];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="ecl" fill="#FF6B6B" name="ECL Amount" />
                <Bar yAxisId="left" dataKey="outstanding" fill="#4ECDC4" name="Outstanding" opacity={0.7} />
                <Line yAxisId="right" dataKey="eclRatio" stroke="#45B7D1" strokeWidth={3} name="ECL Ratio %" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <BaseIfrs9Report
      title="ECL Result Report"
      description="Expected Credit Loss results aggregated by segment and stage with comprehensive risk analysis"
      reportType="ecl-result"
      requiredParams={['prc_date']}
      optionalParams={['segment_id', 'stage']}
      supportsPagination={false}
      supportsCharts={true}
    >
      <SummaryCards />
      <StageBreakdownCard />
      <ECLCharts />
    </BaseIfrs9Report>
  );
};

export default ECLResultReport;