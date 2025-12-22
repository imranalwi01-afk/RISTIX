// packages/frontend/src/components/ifrs9/GCAMovementReport.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  TrendingUp as GrowthIcon,
  SwapVert as TransferIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

const GCAMovementReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState({
    openingGCA: 0,
    closingGCA: 0,
    netGCAMovement: 0,
    newBusinessGCA: 0,
    repayments: 0,
    writeOffs: 0,
    stageTransfers: {
      stage1To2: 0,
      stage2To1: 0,
      stage2To3: 0,
      stage3To2: 0
    },
    gcaByStage: [] as any[],
    movementTrend: [] as any[]
  });

  const handleDataLoaded = (data: any[]) => {
    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        acc.openingGCA += row.opening_gca || 0;
        acc.closingGCA += row.closing_gca || 0;
        acc.newBusinessGCA += row.new_business || 0;
        acc.repayments += row.repayments || 0;
        acc.writeOffs += row.write_offs || 0;
        
        // Stage transfers
        acc.stageTransfers.stage1To2 += row.stage1_to_stage2 || 0;
        acc.stageTransfers.stage2To1 += row.stage2_to_stage1 || 0;
        acc.stageTransfers.stage2To3 += row.stage2_to_stage3 || 0;
        acc.stageTransfers.stage3To2 += row.stage3_to_stage2 || 0;
        
        return acc;
      }, {
        openingGCA: 0,
        closingGCA: 0,
        netGCAMovement: 0,
        newBusinessGCA: 0,
        repayments: 0,
        writeOffs: 0,
        stageTransfers: {
          stage1To2: 0,
          stage2To1: 0,
          stage2To3: 0,
          stage3To2: 0
        },
        gcaByStage: [],
        movementTrend: []
      });
      
      stats.netGCAMovement = stats.closingGCA - stats.openingGCA;
      
      // GCA by Stage (aggregated from data)
      const stageMap = new Map();
      data.forEach(row => {
        const stage = row.current_stage || 1;
        const stageKey = `Stage ${stage}`;
        
        if (!stageMap.has(stageKey)) {
          stageMap.set(stageKey, {
            stage: stageKey,
            opening: 0,
            closing: 0,
            accounts: 0,
            color: stage === 1 ? '#4CAF50' : stage === 2 ? '#FF9800' : '#F44336'
          });
        }
        
        const stageData = stageMap.get(stageKey);
        stageData.opening += row.opening_gca || 0;
        stageData.closing += row.closing_gca || 0;
        stageData.accounts += 1;
      });
      
      // Movement trend (sample data - would be time series in real implementation)
      const trendData = [
        { period: 'Opening', gca: stats.openingGCA, cumulative: stats.openingGCA },
        { period: 'New Business', gca: stats.newBusinessGCA, cumulative: stats.openingGCA + stats.newBusinessGCA },
        { period: 'Repayments', gca: -stats.repayments, cumulative: stats.openingGCA + stats.newBusinessGCA - stats.repayments },
        { period: 'Write-offs', gca: -stats.writeOffs, cumulative: stats.openingGCA + stats.newBusinessGCA - stats.repayments - stats.writeOffs },
        { period: 'Closing', gca: stats.closingGCA, cumulative: stats.closingGCA }
      ];
      
      stats.gcaByStage = Array.from(stageMap.values());
      stats.movementTrend = trendData;
      setSummaryStats(stats);
    }
  };

  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Opening GCA */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', bgcolor: 'info.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.dark', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <BalanceIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.openingGCA)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Opening GCA
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Closing GCA */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.dark', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <BalanceIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.closingGCA)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Closing GCA
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Net Movement */}
      <Grid item xs={12} md={3}>
        <Card sx={{ 
          height: '100%', 
          bgcolor: summaryStats.netGCAMovement >= 0 ? 'primary.light' : 'warning.light', 
          color: 'white' 
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ 
              bgcolor: summaryStats.netGCAMovement >= 0 ? 'primary.dark' : 'warning.dark', 
              mx: 'auto', mb: 2, width: 56, height: 56 
            }}>
              <GrowthIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {summaryStats.netGCAMovement >= 0 ? '+' : ''}
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.netGCAMovement)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Net GCA Movement
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Growth Rate */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', bgcolor: 'error.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'error.dark', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <ReportIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {summaryStats.openingGCA > 0 
                ? `${((summaryStats.netGCAMovement / summaryStats.openingGCA) * 100).toFixed(1)}%`
                : '0%'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Growth Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const StageTransferMatrix = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stage Transfer Analysis
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Deterioration (Increased Risk)
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Stage 1 → Stage 2</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(summaryStats.stageTransfers.stage1To2)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.openingGCA > 0 ? (summaryStats.stageTransfers.stage1To2 / summaryStats.openingGCA) * 100 : 0}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Stage 2 → Stage 3</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(summaryStats.stageTransfers.stage2To3)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.openingGCA > 0 ? (summaryStats.stageTransfers.stage2To3 / summaryStats.openingGCA) * 100 : 0}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Improvement (Decreased Risk)
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Stage 2 → Stage 1</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(summaryStats.stageTransfers.stage2To1)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.openingGCA > 0 ? (summaryStats.stageTransfers.stage2To1 / summaryStats.openingGCA) * 100 : 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Stage 3 → Stage 2</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(summaryStats.stageTransfers.stage3To2)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summaryStats.openingGCA > 0 ? (summaryStats.stageTransfers.stage3To2 / summaryStats.openingGCA) * 100 : 0}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const GCACharts = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* GCA Movement Trend */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              GCA Movement Waterfall
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={summaryStats.movementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(value)}
                />
                <Tooltip 
                  formatter={(value: number, name) => [
                    new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(value),
                    name === 'gca' ? 'Movement' : 'Cumulative GCA'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="gca" 
                  fill="#8884d8" 
                  name="Movement"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#ff7300" 
                  strokeWidth={3}
                  name="Cumulative GCA"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* GCA by Stage */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              GCA by Stage
            </Typography>
            <TableContainer sx={{ maxHeight: 350 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Stage</strong></TableCell>
                    <TableCell align="right"><strong>Opening</strong></TableCell>
                    <TableCell align="right"><strong>Closing</strong></TableCell>
                    <TableCell align="right"><strong>Movement</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryStats.gcaByStage.map((row, index) => {
                    const movement = row.closing - row.opening;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={row.stage}
                            sx={{ backgroundColor: row.color, color: 'white' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            notation: 'compact'
                          }).format(row.opening)}
                        </TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            notation: 'compact'
                          }).format(row.closing)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              color: movement > 0 ? 'error.main' : movement < 0 ? 'success.main' : 'text.secondary',
                              fontWeight: 'bold'
                            }}
                          >
                            {movement > 0 ? '+' : ''}
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              notation: 'compact'
                            }).format(movement)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <BaseIfrs9Report
      title="GCA Movement Report"
      description="Gross Carrying Amount movement reporting with detailed stage transfer analysis and risk migration tracking"
      reportType="gca-movement"
      requiredParams={['prc_date']}
      optionalParams={['segment_id', 'stage']}
      supportsPagination={false}
      supportsCharts={true}
    >
      <SummaryCards />
      <StageTransferMatrix />
      <GCACharts />
    </BaseIfrs9Report>
  );
};

export default GCAMovementReport;