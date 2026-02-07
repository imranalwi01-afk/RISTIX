// packages/frontend/src/components/ifrs9/ECLMovementReport.tsx
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
  Chip
} from '@mui/material';
import {
  SwapHoriz as MovementIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

const ECLMovementReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: 0,
    newProvisions: 0,
    releases: 0,
    writeOffs: 0,
    stageTransfers: 0,
    movementBreakdown: [] as any[]
  });

  const handleDataLoaded = (data: any[]) => {
    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        acc.openingBalance += row.opening_balance || 0;
        acc.closingBalance += row.closing_balance || 0;
        acc.newProvisions += row.new_provisions || 0;
        acc.releases += row.releases || 0;
        acc.writeOffs += row.write_offs || 0;
        acc.stageTransfers += row.stage_transfers || 0;
        return acc;
      }, {
        openingBalance: 0,
        closingBalance: 0,
        netMovement: 0,
        newProvisions: 0,
        releases: 0,
        writeOffs: 0,
        stageTransfers: 0,
        movementBreakdown: []
      });

      stats.netMovement = stats.closingBalance - stats.openingBalance;

      // Create movement breakdown for chart
      const movementData = [
        { category: 'Opening Balance', amount: stats.openingBalance, color: '#8884d8', type: 'balance' },
        { category: 'New Provisions', amount: stats.newProvisions, color: '#FF6B6B', type: 'increase' },
        { category: 'Stage Transfers', amount: stats.stageTransfers, color: '#4ECDC4', type: 'transfer' },
        { category: 'Releases', amount: -Math.abs(stats.releases), color: '#45B7D1', type: 'decrease' },
        { category: 'Write-offs', amount: -Math.abs(stats.writeOffs), color: '#96CEB4', type: 'decrease' },
        { category: 'Closing Balance', amount: stats.closingBalance, color: '#FFEAA7', type: 'balance' }
      ];

      stats.movementBreakdown = movementData;
      setSummaryStats(stats);
    }
  };

  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Opening Balance */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.dark', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <TimelineIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.openingBalance)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Opening Balance
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Closing Balance */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.dark', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <TimelineIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.closingBalance)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Closing Balance
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Net Movement */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{
          height: '100%',
          bgcolor: summaryStats.netMovement >= 0 ? 'warning.light' : 'info.light',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{
              bgcolor: summaryStats.netMovement >= 0 ? 'warning.dark' : 'info.dark',
              mx: 'auto', mb: 2, width: 56, height: 56
            }}>
              {summaryStats.netMovement >= 0 ?
                <IncreaseIcon sx={{ fontSize: 30 }} /> :
                <DecreaseIcon sx={{ fontSize: 30 }} />
              }
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {summaryStats.netMovement >= 0 ? '+' : ''}
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.netMovement)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Net Movement
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Movement Ratio */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ height: '100%', bgcolor: 'error.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'error.dark', mx: 'auto', mb: 2, width: 56, height: 56 }}>
              <MovementIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" component="div" fontWeight="bold">
              {summaryStats.openingBalance > 0
                ? ((Math.abs(summaryStats.netMovement) / summaryStats.openingBalance) * 100).toFixed(1)
                : 0}%
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Movement Ratio
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const MovementBreakdownTable = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ECL Movement Analysis
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Movement Category</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
                <TableCell align="center"><strong>Impact</strong></TableCell>
                <TableCell align="right"><strong>% of Opening</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryStats.movementBreakdown.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: row.color,
                          borderRadius: '50%'
                        }}
                      />
                      {row.category}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: row.amount > 0 ? 'error.main' : row.amount < 0 ? 'success.main' : 'text.primary'
                      }}
                    >
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(Math.abs(row.amount))}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {row.type === 'balance' ? (
                      <Chip size="small" label="Balance" color="default" />
                    ) : row.type === 'increase' || row.amount > 0 ? (
                      <Chip size="small" label="Increase" color="error" icon={<IncreaseIcon />} />
                    ) : (
                      <Chip size="small" label="Decrease" color="success" icon={<DecreaseIcon />} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {summaryStats.openingBalance > 0 && row.category !== 'Opening Balance'
                      ? `${((Math.abs(row.amount) / summaryStats.openingBalance) * 100).toFixed(1)}%`
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const MovementWaterfallChart = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ECL Movement Waterfall Analysis
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={summaryStats.movementBreakdown}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
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
                }).format(Math.abs(value)),
                value >= 0 ? 'Increase' : 'Decrease'
              ]}
              labelFormatter={(label) => `Movement: ${label}`}
            />
            <Bar
              dataKey="amount"
              name="Amount"
            >
              {summaryStats.movementBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Memoize params to prevent infinite loops (loading flicker)
  const requiredParams = React.useMemo(() => ['prc_date'], []);
  const optionalParams = React.useMemo(() => ['segment_id', 'stage'], []);

  return (
    <BaseIfrs9Report
      title="ECL Movement Report"
      description="ECL movement analysis using stored procedures with detailed breakdown of provisions, releases, and transfers"
      reportType="ecl-movement"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={false}
      supportsCharts={true}
    >
      <SummaryCards />
      <MovementBreakdownTable />
      <MovementWaterfallChart />
    </BaseIfrs9Report>
  );
};

export default ECLMovementReport;