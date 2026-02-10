// packages/frontend/src/components/ifrs9/ECLMovementReport.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

interface MovementBreakdownItem {
  category: string;
  amount: number;
  color: string;
  type: 'balance' | 'increase' | 'transfer' | 'decrease';
}

interface SummaryStats {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  newProvisions: number;
  releases: number;
  writeOffs: number;
  stageTransfers: number;
  movementBreakdown: MovementBreakdownItem[];
}

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const items = [
    {
      title: 'Opening Balance',
      value: stats.openingBalance,
      format: 'currency',
      icon: <TimelineIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: '#4facfe'
    },
    {
      title: 'Closing Balance',
      value: stats.closingBalance,
      format: 'currency',
      icon: <TimelineIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      mainColor: '#43e97b'
    },
    {
      title: 'Net Movement',
      value: stats.netMovement,
      format: 'currency',
      icon: stats.netMovement >= 0 ? <IncreaseIcon sx={{ fontSize: 32 }} /> : <DecreaseIcon sx={{ fontSize: 32 }} />,
      gradient: stats.netMovement >= 0
        ? 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      mainColor: stats.netMovement >= 0 ? '#ff4e50' : '#667eea'
    },
    {
      title: 'Movement Ratio',
      value: stats.openingBalance > 0
        ? `${((Math.abs(stats.netMovement) / stats.openingBalance) * 100).toFixed(1)}%`
        : '0.0%',
      format: 'raw',
      icon: <MovementIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      mainColor: '#667eea'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 5 }}>
      {items.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{
            height: '100%',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            background: 'white',
            boxShadow: `0 4px 12px ${alpha(item.mainColor, 0.12)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: `1px solid ${alpha(item.mainColor, 0.1)}`,
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 32px ${alpha(item.mainColor, 0.25)}`,
              '& .card-icon-container': {
                transform: 'rotate(10deg) scale(1.1)'
              }
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: 'text.secondary',
                    opacity: 0.8
                  }}
                >
                  {item.title}
                </Typography>
                <Box
                  className="card-icon-container"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: item.gradient,
                    color: 'white',
                    display: 'flex',
                    transition: 'transform 0.3s ease',
                    boxShadow: `0 4px 12px ${alpha(item.mainColor, 0.4)}`
                  }}
                >
                  {item.icon}
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: item.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  {item.format === 'currency'
                    ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(item.value as number)
                    : item.value
                  }
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                  <Chip
                    size="small"
                    label="PROVISION TRACK"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderColor: alpha(item.mainColor, 0.3),
                      color: item.mainColor
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const MovementBreakdownTable: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Card sx={{
    mb: 5,
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
  }}>
    <Box sx={{ p: 4, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: '#f8faff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" fontWeight={700}>
        ECL Movement Analysis
      </Typography>
      <Chip label="Movement Log" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#667eea', 0.1), color: '#667eea' }} />
    </Box>
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, color: 'text.secondary' }}>Movement Category</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, color: 'text.secondary' }}>Amount</TableCell>
            <TableCell align="center" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, color: 'text.secondary' }}>Impact Type</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, color: 'text.secondary' }}>% of Opening</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.movementBreakdown.map((row, index) => (
            <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#667eea', 0.02) } }}>
              <TableCell sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: row.color,
                      borderRadius: '50%',
                      boxShadow: `0 0 8px ${alpha(row.color, 0.5)}`
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>{row.category}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
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
                  <Chip size="small" label="Balance" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                ) : row.type === 'increase' || row.amount > 0 ? (
                  <Chip size="small" label="Increase" color="error" icon={<IncreaseIcon fontSize="small" />} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                ) : (
                  <Chip size="small" label="Decrease" color="success" icon={<DecreaseIcon fontSize="small" />} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                )}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  {stats.openingBalance > 0 && row.category !== 'Opening Balance' && row.category !== 'Closing Balance'
                    ? `${((Math.abs(row.amount) / stats.openingBalance) * 100).toFixed(1)}%`
                    : '-'
                  }
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Card>
);

const MovementWaterfallChart: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Card sx={{
    mb: 5,
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
  }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
        ECL Movement Waterfall Analysis
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={stats.movementBreakdown}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={100}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontWeight: 600 }}
            tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact'
            }).format(value)}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            formatter={(value: number) => [
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(Math.abs(value)),
              value >= 0 ? 'Increase / Balance' : 'Decrease'
            ]}
          />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
          >
            {stats.movementBreakdown.map((entry, index) => (
              <rect key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const ECLMovementReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: 0,
    newProvisions: 0,
    releases: 0,
    writeOffs: 0,
    stageTransfers: 0,
    movementBreakdown: []
  });

  const handleDataLoaded = React.useCallback((data: Record<string, unknown>[]) => {
    if (data && data.length > 0) {
      const stats = data.reduce<{
        openingBalance: number;
        closingBalance: number;
        netMovement: number;
        newProvisions: number;
        releases: number;
        writeOffs: number;
        stageTransfers: number;
        movementBreakdown: MovementBreakdownItem[];
      }>((acc, row) => {
        acc.openingBalance += parseFloat(row.opening_balance as string) || 0;
        acc.closingBalance += parseFloat(row.closing_balance as string) || 0;
        acc.newProvisions += parseFloat(row.new_provisions as string) || 0;
        acc.releases += parseFloat(row.releases as string) || 0;
        acc.writeOffs += parseFloat(row.write_offs as string) || 0;
        acc.stageTransfers += parseFloat(row.stage_transfers as string) || 0;
        return acc;
      }, {
        openingBalance: 0,
        closingBalance: 0,
        netMovement: 0,
        newProvisions: 0,
        releases: 0,
        writeOffs: 0,
        stageTransfers: 0,
        movementBreakdown: [] as MovementBreakdownItem[]
      });

      const netMovement = stats.closingBalance - stats.openingBalance;

      const movementData: MovementBreakdownItem[] = [
        { category: 'Opening Balance', amount: stats.openingBalance, color: '#667eea', type: 'balance' },
        { category: 'New Provisions', amount: stats.newProvisions, color: '#ff4e50', type: 'increase' },
        { category: 'Stage Transfers', amount: stats.stageTransfers, color: '#4facfe', type: 'transfer' },
        { category: 'Releases', amount: -Math.abs(stats.releases), color: '#43e97b', type: 'decrease' },
        { category: 'Write-offs', amount: -Math.abs(stats.writeOffs), color: '#38f9d7', type: 'decrease' },
        { category: 'Closing Balance', amount: stats.closingBalance, color: '#764ba2', type: 'balance' }
      ];

      setSummaryStats({
        ...stats,
        netMovement,
        movementBreakdown: movementData
      });
    }
  }, []);

  const requiredParams = useMemo(() => ['prc_date'], []);
  const optionalParams = useMemo(() => ['segment_id', 'stage'], []);

  return (
    <BaseIfrs9Report
      title="ECL Movement Report"
      description="Detailed analysis of expected credit loss movements across the reporting period with waterfall breakdown"
      reportType="ecl-movement"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={false}
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
      <MovementBreakdownTable stats={summaryStats} />
      <MovementWaterfallChart stats={summaryStats} />
    </BaseIfrs9Report>
  );
};

export default ECLMovementReport;