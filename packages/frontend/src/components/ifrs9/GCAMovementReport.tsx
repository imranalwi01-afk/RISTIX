// packages/frontend/src/components/ifrs9/GCAMovementReport.tsx
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
  Paper,
  Chip,
  LinearProgress,
  alpha
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
  ResponsiveContainer
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

interface StageTransferStats {
  stage1To2: number;
  stage2To1: number;
  stage2To3: number;
  stage3To2: number;
}

interface GCAByStageItem {
  stage: string;
  opening: number;
  closing: number;
  accounts: number;
  color: string;
}

interface MovementTrendItem {
  period: string;
  gca: number;
  cumulative: number;
}

interface SummaryStats {
  openingGCA: number;
  closingGCA: number;
  netGCAMovement: number;
  newBusinessGCA: number;
  repayments: number;
  writeOffs: number;
  stageTransfers: StageTransferStats;
  gcaByStage: GCAByStageItem[];
  movementTrend: MovementTrendItem[];
}

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const items = [
    {
      title: 'Opening GCA',
      value: stats.openingGCA,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: '#4facfe'
    },
    {
      title: 'Closing GCA',
      value: stats.closingGCA,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      mainColor: '#43e97b'
    },
    {
      title: 'Net Movement',
      value: stats.netGCAMovement,
      format: 'currency',
      icon: <GrowthIcon sx={{ fontSize: 32 }} />,
      gradient: stats.netGCAMovement >= 0
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)',
      mainColor: stats.netGCAMovement >= 0 ? '#667eea' : '#ff4e50'
    },
    {
      title: 'Growth Rate',
      value: stats.openingGCA > 0
        ? `${((stats.netGCAMovement / stats.openingGCA) * 100).toFixed(1)}%`
        : '0.0%',
      format: 'raw',
      icon: <ReportIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
      mainColor: '#ff4e50'
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
                    label="GCA TRACKER"
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

const StageTransferMatrix: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Card sx={{
    mb: 5,
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
  }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Stage Transfer Analysis
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={700} color="error.main">
              Deterioration (Increased Risk)
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Stage 1 → Stage 2</Typography>
                <Typography variant="body2" fontWeight="800">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(stats.stageTransfers.stage1To2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.openingGCA > 0 ? (stats.stageTransfers.stage1To2 / stats.openingGCA) * 100 : 0}
                sx={{ height: 10, borderRadius: 5, bgcolor: alpha('#ed6c02', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#ed6c02' } }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Stage 2 → Stage 3</Typography>
                <Typography variant="body2" fontWeight="800">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(stats.stageTransfers.stage2To3)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.openingGCA > 0 ? (stats.stageTransfers.stage2To3 / stats.openingGCA) * 100 : 0}
                sx={{ height: 10, borderRadius: 5, bgcolor: alpha('#d32f2f', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#d32f2f' } }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={700} color="success.main">
              Improvement (Decreased Risk)
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Stage 2 → Stage 1</Typography>
                <Typography variant="body2" fontWeight="800">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(stats.stageTransfers.stage2To1)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.openingGCA > 0 ? (stats.stageTransfers.stage2To1 / stats.openingGCA) * 100 : 0}
                sx={{ height: 10, borderRadius: 5, bgcolor: alpha('#2e7d32', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32' } }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Stage 3 → Stage 2</Typography>
                <Typography variant="body2" fontWeight="800">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(stats.stageTransfers.stage3To2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.openingGCA > 0 ? (stats.stageTransfers.stage3To2 / stats.openingGCA) * 100 : 0}
                sx={{ height: 10, borderRadius: 5, bgcolor: alpha('#0288d1', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#0288d1' } }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const GCACharts: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Grid container spacing={3} sx={{ mb: 5 }}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            GCA Movement Waterfall
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={stats.movementTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
              <XAxis dataKey="period" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact'
                }).format(value)}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(value),
                  name === 'gca' ? 'Movement' : 'Cumulative GCA'
                ]}
              />
              <Legend iconType="circle" />
              <Bar
                dataKey="gca"
                fill="#667eea"
                radius={[4, 4, 0, 0]}
                name="Movement"
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#ff7300"
                strokeWidth={3}
                dot={{ r: 6, fill: '#ff7300', strokeWidth: 2, stroke: '#fff' }}
                name="Cumulative GCA"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            GCA by Stage
          </Typography>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, borderBottom: '2px solid rgba(0,0,0,0.05)' }}>Stage</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, borderBottom: '2px solid rgba(0,0,0,0.05)' }}>Closing</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, borderBottom: '2px solid rgba(0,0,0,0.05)' }}>Move</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.gcaByStage.map((row, index) => {
                  const movement = row.closing - row.opening;
                  return (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#000', 0.02) } }}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.stage}
                          sx={{
                            fontWeight: 700,
                            bgcolor: alpha(row.color, 0.1),
                            color: row.color,
                            border: 'none'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          notation: 'compact'
                        }).format(row.closing)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="caption"
                          sx={{
                            color: movement > 0 ? 'error.main' : movement < 0 ? 'success.main' : 'text.secondary',
                            fontWeight: 800
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

const GCAMovementReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
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

  const handleDataLoaded = React.useCallback((data: Record<string, unknown>[]) => {
    if (data && data.length > 0) {
      const initialStats: SummaryStats = {
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
      };

      const stats = data.reduce<SummaryStats>((acc, row) => {
        acc.openingGCA += parseFloat(row.opening_gca as string) || 0;
        acc.closingGCA += parseFloat(row.closing_gca as string) || 0;
        acc.newBusinessGCA += parseFloat(row.new_business as string) || 0;
        acc.repayments += parseFloat(row.repayments as string) || 0;
        acc.writeOffs += parseFloat(row.write_offs as string) || 0;

        acc.stageTransfers.stage1To2 += parseFloat(row.stage1_to_stage2 as string) || 0;
        acc.stageTransfers.stage2To1 += parseFloat(row.stage2_to_stage1 as string) || 0;
        acc.stageTransfers.stage2To3 += parseFloat(row.stage2_to_stage3 as string) || 0;
        acc.stageTransfers.stage3To2 += parseFloat(row.stage3_to_stage2 as string) || 0;

        return acc;
      }, initialStats);

      const netGCAMovement = stats.closingGCA - stats.openingGCA;

      const stageMap = new Map<string, GCAByStageItem>();
      data.forEach(row => {
        const stage = (row.current_stage || 1) as number;
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

        const stageData = stageMap.get(stageKey)!;
        stageData.opening += parseFloat(row.opening_gca as string) || 0;
        stageData.closing += parseFloat(row.closing_gca as string) || 0;
        stageData.accounts += 1;
      });

      const trendData: MovementTrendItem[] = [
        { period: 'Opening', gca: stats.openingGCA, cumulative: stats.openingGCA },
        { period: 'New Business', gca: stats.newBusinessGCA, cumulative: stats.openingGCA + stats.newBusinessGCA },
        { period: 'Repayments', gca: -stats.repayments, cumulative: stats.openingGCA + stats.newBusinessGCA - stats.repayments },
        { period: 'Write-offs', gca: -stats.writeOffs, cumulative: stats.openingGCA + stats.newBusinessGCA - stats.repayments - stats.writeOffs },
        { period: 'Closing', gca: stats.closingGCA, cumulative: stats.closingGCA }
      ];

      setSummaryStats({
        ...stats,
        netGCAMovement,
        gcaByStage: Array.from(stageMap.values()),
        movementTrend: trendData
      });
    }
  }, []);

  const requiredParams = useMemo(() => ['prc_date'], []);
  const optionalParams = useMemo(() => ['segment_id', 'stage'], []);

  return (
    <BaseIfrs9Report
      title="GCA Movement Report"
      description="Gross Carrying Amount movement reporting with detailed stage transfer analysis and risk migration tracking"
      reportType="gca-movement"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={false}
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
      <StageTransferMatrix stats={summaryStats} />
      <GCACharts stats={summaryStats} />
    </BaseIfrs9Report>
  );
};

export default GCAMovementReport;