'use client';

// packages/frontend/src/components/ifrs9/ECLResultReport.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingDown as LossIcon,
  AccountBalance as BalanceIcon,
  PieChart as PieIcon
} from '@mui/icons-material';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  LabelList
} from 'recharts';
import { useBankingTheme } from '../../providers/BankingThemeProvider';
import BaseIfrs9Report from './BaseIfrs9Report';
import ReportSummaryGrid, { KPIItem } from './ReportSummaryGrid';

interface SegmentBreakdownItem {
  segment: string;
  ecl: number;
  outstanding: number;
  accounts: number;
  eclRatio: number;
}

interface SummaryStats {
  totalECL: number;
  stage1ECL: number;
  stage2ECL: number;
  stage3ECL: number;
  stage1Outstanding: number;
  stage2Outstanding: number;
  stage3Outstanding: number;
  totalOutstanding: number;
  eclRatio: number;
  totalOverlay: number;
  totalImpaired: number;
  segmentBreakdown: SegmentBreakdownItem[];
  stageDistribution: { name: string; value: number; color: string }[];
}

const MonitoringPanel: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const stageRows = useMemo(() => [
    { name: 'Stage 1', ecl: stats.stage1ECL, outstanding: stats.stage1Outstanding, color: '#4CAF50' },
    { name: 'Stage 2', ecl: stats.stage2ECL, outstanding: stats.stage2Outstanding, color: '#FF9800' },
    { name: 'Stage 3', ecl: stats.stage3ECL, outstanding: stats.stage3Outstanding, color: '#F44336' },
  ], [stats.stage1ECL, stats.stage2ECL, stats.stage3ECL, stats.stage1Outstanding, stats.stage2Outstanding, stats.stage3Outstanding]);

  const compactCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);

  return (
  <Card sx={{
    mb: 5,
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    background: 'white',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    overflowX: 'hidden',
  }}>
    <CardContent sx={{ p: 4, minWidth: 0, overflowX: 'hidden' }}>
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" />
        ECL Monitoring Overview
      </Typography>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Box sx={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small" sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Stage</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Outstanding</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>ECL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Coverage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stageRows.map((stage) => (
                <TableRow key={stage.name}>
                  <TableCell>{stage.name}</TableCell>
                  <TableCell align="right">{compactCurrency(stage.outstanding)}</TableCell>
                  <TableCell align="right">{compactCurrency(stage.ecl)}</TableCell>
                  <TableCell align="right">
                    {stage.outstanding > 0 ? ((stage.ecl / stage.outstanding) * 100).toFixed(2) : '0.00'}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box sx={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Segment</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Outstanding</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>ECL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Coverage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.segmentBreakdown.slice(0, 6).map((segment) => (
                <TableRow key={segment.segment}>
                  <TableCell>{segment.segment}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(segment.outstanding)}
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(segment.ecl)}
                  </TableCell>
                  <TableCell align="right">{segment.eclRatio.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </CardContent>
  </Card>
  );
};

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const { bankingMode } = useBankingTheme();

  const getThemeColors = () => {
    switch (bankingMode) {
      case 'conventional':
        return {
          primaryGradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
          secondaryGradient: 'linear-gradient(135deg, #1565C0 0%, #0B3D91 100%)',
          tertiaryGradient: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
          quaternaryGradient: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)',
          mainColor: '#1976D2'
        };
      case 'dual':
        return {
          primaryGradient: 'linear-gradient(135deg, #37474f 0%, #263238 100%)',
          secondaryGradient: 'linear-gradient(135deg, #546e7a 0%, #455a64 100%)',
          tertiaryGradient: 'linear-gradient(135deg, #78909c 0%, #607d8b 100%)',
          quaternaryGradient: 'linear-gradient(135deg, #90a4ae 0%, #78909c 100%)',
          mainColor: '#37474f'
        };
      default:
        return {
          primaryGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
          secondaryGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          tertiaryGradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
          quaternaryGradient: 'linear-gradient(135deg, #42E695 0%, #3BB2B8 100%)',
          mainColor: '#1976D2'
        };
    }
  };

  const tc = getThemeColors();

  const items: KPIItem[] = [
    {
      title: 'Total ECL Amount',
      value: stats.totalECL,
      format: 'currency',
      icon: <LossIcon sx={{ fontSize: 32 }} />,
      gradient: tc.primaryGradient,
      mainColor: tc.mainColor
    },
    {
      title: 'Total Outstanding',
      value: stats.totalOutstanding,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: tc.secondaryGradient,
      mainColor: tc.mainColor
    },
    {
      title: 'ECL Coverage Ratio',
      value: `${stats.eclRatio.toFixed(2)}%`,
      format: 'raw',
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      gradient: tc.tertiaryGradient,
      mainColor: tc.mainColor
    },
    {
      title: 'Overall Risk Level',
      value: stats.eclRatio < 2 ? 'Low' : stats.eclRatio < 5 ? 'Medium' : 'High',
      format: 'raw',
      icon: <PieIcon sx={{ fontSize: 32 }} />,
      gradient: tc.quaternaryGradient,
      mainColor: tc.mainColor
    },
    {
      title: 'ECL Overlay',
      value: stats.totalOverlay,
      format: 'currency',
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
      mainColor: '#1976D2'
    },
    {
      title: 'Impaired ECL (IA)',
      value: stats.totalImpaired,
      format: 'currency',
      icon: <LossIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      mainColor: '#f5576c'
    }
  ];

  return <ReportSummaryGrid items={items} mdCols={3} />;
};

const StageBreakdownCard: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const { bankingMode } = useBankingTheme();

  const getStageColor = (stage: number) => {
    if (bankingMode === 'dual') {
      return stage === 1 ? '#78909C' : stage === 2 ? '#546E7A' : '#37474F';
    }
    return stage === 1 ? '#4CAF50' : stage === 2 ? '#FF9800' : '#F44336';
  };

  return (
    <Card sx={{
      mb: 5,
      borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          ECL by IFRS 9 Stage
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{
              p: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${getStageColor(1)} 0%, ${alpha(getStageColor(1), 0.7)} 100%)`,
              color: 'white',
              borderRadius: 3,
              boxShadow: `0 8px 24px ${alpha(getStageColor(1), 0.3)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(getStageColor(1), 0.4)}`
              }
            }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Stage 1 (12-month ECL)</Typography>
              <Typography variant="h3" component="div" fontWeight="800" sx={{ my: 2 }}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(stats.stage1ECL)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Performing Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{
              p: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${getStageColor(2)} 0%, ${alpha(getStageColor(2), 0.7)} 100%)`,
              color: 'white',
              borderRadius: 3,
              boxShadow: `0 8px 24px ${alpha(getStageColor(2), 0.3)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(getStageColor(2), 0.4)}`
              }
            }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Stage 2 (Lifetime ECL)</Typography>
              <Typography variant="h3" component="div" fontWeight="800" sx={{ my: 2 }}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(stats.stage2ECL)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Underperforming Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              background: `linear-gradient(135deg, ${getStageColor(3)} 0%, ${alpha(getStageColor(3), 0.7)} 100%)`, 
              color: 'white',
              borderRadius: 3,
              boxShadow: `0 8px 24px ${alpha(getStageColor(3), 0.3)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(getStageColor(3), 0.4)}`
              }
            }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Stage 3 (Lifetime ECL)</Typography>
              <Typography variant="h3" component="div" fontWeight="800" sx={{ my: 2 }}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(stats.stage3ECL)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Non-Performing Assets
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ECLCharts: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  return (
    <Grid container spacing={4} sx={{ mb: 5 }}>
      {/* Stage Distribution Pie Chart */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: 'white',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieIcon color="primary" />
              ECL Distribution by Stage
            </Typography>
            <Box sx={{ height: 350, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {stats.stageDistribution.map((entry, index) => (
                      <linearGradient key={`pie-grad-${index}`} id={`pie-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={alpha(entry.color, 0.6)} stopOpacity={1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={stats.stageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {stats.stageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#pie-gradient-${index})`} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: 'none', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      padding: '12px 16px'
                    }}
                    formatter={(value: number) => [
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(value),
                      'ECL Amount'
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    content={({ payload }: { payload?: Array<{ value?: string; color?: string }> }) => (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                        {payload?.map((entry, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                              {entry.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -70%)', // Centered relative to the donut
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <Typography variant="h5" fontWeight={800} color="primary" sx={{ lineHeight: 1 }}>
                  {((stats.totalECL / stats.totalOutstanding) * 100 || 0).toFixed(2)}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800, fontSize: '0.6rem', letterSpacing: 0.5 }}>
                  AVG RATIO
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
  
      {/* Segment Analysis */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: 'white'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              ECL Analysis by Segment
            </Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.segmentBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="osGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
                  <XAxis 
                    dataKey="segment" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    height={80}
                    tick={{ fontSize: 10, fontWeight: 600, fill: alpha('#000', 0.6) }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(v) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(v)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 12, 
                      border: 'none', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      padding: '12px 16px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'ECL Amount' || name === 'Outstanding') {
                        return [new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          notation: 'compact'
                        }).format(value), name];
                      }
                      return [`${value.toFixed(2)}%`, name];
                    }}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Bar yAxisId="left" dataKey="ecl" fill="url(#barGradient)" name="ECL Amount" radius={[6, 6, 0, 0]} barSize={24}>
                    <LabelList 
                      dataKey="ecl" 
                      position="top" 
                      content={(props: { x?: number; y?: number; width?: number; value?: number }) => {
                        const x = props.x ?? 0;
                        const y = props.y ?? 0;
                        const width = props.width ?? 0;
                        const value = props.value ?? 0;
                        return (
                          <text x={x + width / 2} y={y - 10} fill={alpha('#000', 0.6)} textAnchor="middle" fontSize={9} fontWeight={800}>
                            {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                  <Bar yAxisId="left" dataKey="outstanding" fill="url(#osGradient)" name="Outstanding" opacity={0.3} radius={[6, 6, 0, 0]} barSize={24} />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="eclRatio" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    name="ECL Ratio %" 
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const ECLResultReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalECL: 0,
    stage1ECL: 0,
    stage2ECL: 0,
    stage3ECL: 0,
    stage1Outstanding: 0,
    stage2Outstanding: 0,
    stage3Outstanding: 0,
    totalOutstanding: 0,
    eclRatio: 0,
    totalOverlay: 0,
    totalImpaired: 0,
    segmentBreakdown: [],
    stageDistribution: []
  });

  const handleDataLoaded = React.useCallback((data: Record<string, unknown>[]) => {
    if (!data || data.length === 0) {
      setSummaryStats({
        totalECL: 0,
        stage1ECL: 0,
        stage2ECL: 0,
        stage3ECL: 0,
        stage1Outstanding: 0,
        stage2Outstanding: 0,
        stage3Outstanding: 0,
        totalOutstanding: 0,
        eclRatio: 0,
        totalOverlay: 0,
        totalImpaired: 0,
        segmentBreakdown: [],
        stageDistribution: []
      });
      return;
    }

    const getMetric = (row: Record<string, unknown>, keys: readonly string[]) => {
      for (const key of keys) {
        const value = row[key as keyof typeof row];
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed !== 0) return parsed;
      }
      for (const key of keys) {
        const value = row[key as keyof typeof row];
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return 0;
    };

    const aggregatedStats = data.reduce((acc: Partial<SummaryStats>, row: Record<string, unknown>) => {
      const eclAmount = getMetric(row, [
        'ecl_final',
        'eclFinal',
        'ecl_final_amt',
        'eclFinalAmt',
        'eclFinalAmount',
        'ecl_ca_onbs',
        'eclCaOnbs',
        'ecl_ca_onbs_amt',
        'eclAmount',
        'ecl_amount',
        'total_ecl',
      ]);
      const outstanding = getMetric(row, [
        'outstanding',
        'total_outstanding',
        'totalOutstanding',
        'outstanding_amt',
        'principal',
        'principal_amount',
      ]);
      const stageRaw = String(row.stage ?? '1').trim().toLowerCase();
      let stage = Number.parseInt(stageRaw.replace(/[^0-9]/g, ''), 10);
      if (Number.isNaN(stage) || stage < 1 || stage > 3) {
        stage = 1; // Default to Stage 1 to prevent ECL leakage
      }

      return {
        totalECL: (acc.totalECL || 0) + eclAmount,
        totalOutstanding: (acc.totalOutstanding || 0) + outstanding,
        stage1ECL: (acc.stage1ECL || 0) + (stage === 1 ? eclAmount : 0),
        stage2ECL: (acc.stage2ECL || 0) + (stage === 2 ? eclAmount : 0),
        stage3ECL: (acc.stage3ECL || 0) + (stage === 3 ? eclAmount : 0),
        stage1Outstanding: (acc.stage1Outstanding || 0) + (stage === 1 ? outstanding : 0),
        stage2Outstanding: (acc.stage2Outstanding || 0) + (stage === 2 ? outstanding : 0),
        stage3Outstanding: (acc.stage3Outstanding || 0) + (stage === 3 ? outstanding : 0),
        totalOverlay: (acc.totalOverlay || 0) + getMetric(row, [
          'ecl_overlay',
          'eclOverlay',
          'ecl_overlay_amt',
          'eclOverlayAmt',
          'overlay',
          'overlay_amount',
        ]),
        totalImpaired: (acc.totalImpaired || 0) + getMetric(row, [
          'ecl_ia',
          'eclIa',
          'ecl_ia_amt',
          'eclIaAmt',
          'ecl_ia_onbs',
          'eclIaOnbs',
          'ecl_ia_onbs_amt',
          'impaired_ecl',
        ]),
        eclRatio: 0,
        segmentBreakdown: [],
        stageDistribution: []
      };
    }, {} as Partial<SummaryStats>) as unknown as SummaryStats;

    aggregatedStats.eclRatio = aggregatedStats.totalOutstanding > 0
      ? (aggregatedStats.totalECL / aggregatedStats.totalOutstanding) * 100
      : 0;

    const stageData = [
      { name: 'Stage 1', value: aggregatedStats.stage1ECL, color: '#4CAF50' },
      { name: 'Stage 2', value: aggregatedStats.stage2ECL, color: '#FF9800' },
      { name: 'Stage 3', value: aggregatedStats.stage3ECL, color: '#F44336' }
    ];

    const segmentMap = new Map<string, Omit<SegmentBreakdownItem, 'eclRatio'>>();
    data.forEach(row => {
      const segmentLabel = String(
        row.segment ||
        row.group_segment ||
        row.sub_segment ||
        (row.segment_id ? `Segment ${row.segment_id}` : 'Uncategorized')
      );

      if (!segmentMap.has(segmentLabel)) {
        segmentMap.set(segmentLabel, {
          segment: segmentLabel,
          ecl: 0,
          outstanding: 0,
          accounts: 0
        });
      }

      const segmentData = segmentMap.get(segmentLabel)!;
      segmentData.ecl += getMetric(row, [
        'ecl_final',
        'eclFinal',
        'ecl_final_amt',
        'eclFinalAmt',
        'eclFinalAmount',
        'eclAmount',
        'ecl_amount',
        'total_ecl',
      ]);
      segmentData.outstanding += getMetric(row, [
        'outstanding',
        'total_outstanding',
        'totalOutstanding',
        'outstanding_amt',
        'principal',
        'principal_amount',
      ]);
      segmentData.accounts += 1;
    });

    const segmentBreakdown: SegmentBreakdownItem[] = Array.from(segmentMap.values())
      .map(item => ({
        ...item,
        eclRatio: item.outstanding > 0 ? (item.ecl / item.outstanding) * 100 : 0
      }))
      .sort((a, b) => b.ecl - a.ecl);

    setSummaryStats({
      ...aggregatedStats,
      segmentBreakdown,
      stageDistribution: stageData
    });
  }, []);

  const requiredParams = useMemo(() => ['prc_date'], []);
  const optionalParams = useMemo(() => ['segment_id', 'stage', 'account_status'], []);

  return (
    <BaseIfrs9Report
      title="ECL Result Report"
      description="Expected Credit Loss results aggregated by segment and stage with comprehensive risk analysis"
      reportType="ecl-result"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={true} paginationMode="cursor"
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
      <MonitoringPanel stats={summaryStats} />
      <StageBreakdownCard stats={summaryStats} />
      <ECLCharts stats={summaryStats} />
    </BaseIfrs9Report>
  );
};

export default ECLResultReport;
