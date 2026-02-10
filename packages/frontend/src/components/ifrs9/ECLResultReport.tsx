// packages/frontend/src/components/ifrs9/ECLResultReport.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Paper,
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
  Line
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useBankingTheme } from '../../providers/BankingThemeProvider';
import BaseIfrs9Report from './BaseIfrs9Report';

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
  totalOutstanding: number;
  eclRatio: number;
  segmentBreakdown: SegmentBreakdownItem[];
  stageDistribution: { name: string; value: number; color: string }[];
}

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const { bankingMode } = useBankingTheme();

  const getThemeColors = () => {
    switch (bankingMode) {
      case 'syariah':
        return {
          primaryGradient: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
          secondaryGradient: 'linear-gradient(135deg, #00897b 0%, #00796b 100%)',
          tertiaryGradient: 'linear-gradient(135deg, #4db6ac 0%, #26a69a 100%)',
          quaternaryGradient: 'linear-gradient(135deg, #80cbc4 0%, #4db6ac 100%)',
          mainColor: '#00695c'
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

  const themeColors = getThemeColors();

  const items = [
    {
      title: 'Total ECL Amount',
      value: stats.totalECL,
      format: 'currency',
      icon: <LossIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.primaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'Total Outstanding',
      value: stats.totalOutstanding,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.secondaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'ECL Coverage Ratio',
      value: `${stats.eclRatio.toFixed(2)}%`,
      format: 'raw',
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.tertiaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'Overall Risk Level',
      value: stats.eclRatio < 2 ? 'Low' : stats.eclRatio < 5 ? 'Medium' : 'High',
      format: 'raw',
      icon: <PieIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.quaternaryGradient,
      mainColor: themeColors.mainColor
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
                    label="LIVE DATA"
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

const StageBreakdownCard: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const { bankingMode } = useBankingTheme();
  const theme = useTheme();

  const getStageColor = (stage: number) => {
    if (bankingMode === 'syariah') {
      return stage === 1 ? '#00897b' : stage === 2 ? '#00796b' : '#00695c';
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

const ECLCharts: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Grid container spacing={3} sx={{ mb: 5 }}>
    {/* Stage Distribution Pie Chart */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            ECL Distribution by Stage
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={stats.stageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: { name: string; value: number; percent: number }) =>
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
                {stats.stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
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
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            ECL Analysis by Segment
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={stats.segmentBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip
                formatter={(value: number | string, name: string) => {
                  if (name === 'ecl' || name === 'outstanding') {
                    return [new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(typeof value === 'string' ? parseFloat(value) : value), name === 'ecl' ? 'ECL Amount' : 'Outstanding'];
                  }
                  return [`${(typeof value === 'string' ? parseFloat(value) : value).toFixed(2)}%`, 'ECL Ratio'];
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

const ECLResultReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalECL: 0,
    stage1ECL: 0,
    stage2ECL: 0,
    stage3ECL: 0,
    totalOutstanding: 0,
    eclRatio: 0,
    segmentBreakdown: [],
    stageDistribution: []
  });

  const handleDataLoaded = React.useCallback((data: Record<string, unknown>[]) => {
    if (data && data.length > 0) {
      const aggregatedStats = data.reduce((acc: Partial<SummaryStats>, row: Record<string, unknown>) => {
        const eclAmount = Number(row.ecl_amount) || Number(row.total_ecl) || 0;
        const outstanding = Number(row.outstanding) || Number(row.total_outstanding) || 0;
        const stage = row.stage?.toString() || '1';

        return {
          totalECL: (acc.totalECL || 0) + eclAmount,
          totalOutstanding: (acc.totalOutstanding || 0) + outstanding,
          stage1ECL: (acc.stage1ECL || 0) + (stage === '1' ? eclAmount : 0),
          stage2ECL: (acc.stage2ECL || 0) + (stage === '2' ? eclAmount : 0),
          stage3ECL: (acc.stage3ECL || 0) + (stage === '3' ? eclAmount : 0),
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
      ].filter(item => item.value > 0);

      const segmentMap = new Map<string, Omit<SegmentBreakdownItem, 'eclRatio'>>();
      data.forEach(row => {
        const segment = (row.segment || row.group_segment || 'Default Segment') as string;
        if (!segmentMap.has(segment)) {
          segmentMap.set(segment, {
            segment,
            ecl: 0,
            outstanding: 0,
            accounts: 0
          });
        }
        const segmentData = segmentMap.get(segment)!;
        segmentData.ecl += parseFloat(row.ecl_final as string) || 0;
        segmentData.outstanding += parseFloat(row.outstanding as string) || 0;
        segmentData.accounts += 1;
      });

      const segmentBreakdown: SegmentBreakdownItem[] = Array.from(segmentMap.values()).map(item => ({
        ...item,
        eclRatio: item.outstanding > 0 ? (item.ecl / item.outstanding) * 100 : 0
      }));

      setSummaryStats({
        ...aggregatedStats,
        segmentBreakdown,
        stageDistribution: stageData
      });
    }
  }, []);

  const requiredParams = useMemo(() => ['prc_date'], []);
  const optionalParams = useMemo(() => ['segment_id', 'stage'], []);

  return (
    <BaseIfrs9Report
      title="ECL Result Report"
      description="Expected Credit Loss results aggregated by segment and stage with comprehensive risk analysis"
      reportType="ecl-result"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={false}
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
      <StageBreakdownCard stats={summaryStats} />
      <ECLCharts stats={summaryStats} />
    </BaseIfrs9Report>
  );
};

export default ECLResultReport;