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
import ReportSummaryGrid, { KPIItem } from './ReportSummaryGrid';

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

interface MovementMatrixRow {
  movement_order?: number;
  movement?: string;
  stage_1_collective?: number | string;
  stage_2_collective?: number | string;
  stage_3_collective?: number | string;
  stage_1_individual?: number | string;
  stage_2_individual?: number | string;
  stage_3_individual?: number | string;
  poci?: number | string;
  total?: number | string;
}

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const items: KPIItem[] = [
    {
      title: 'Opening GCA',
      value: stats.openingGCA,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      mainColor: '#1e40af',
      bgGradient: 'linear-gradient(135deg, rgba(30, 64, 175, 0.02) 0%, rgba(59, 130, 246, 0.02) 100%)',
      chipLabel: 'GCA TRACKER'
    },
    {
      title: 'Closing GCA',
      value: stats.closingGCA,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      mainColor: '#059669',
      bgGradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%)',
      chipLabel: 'GCA TRACKER'
    },
    {
      title: 'Net Movement',
      value: stats.netGCAMovement,
      format: 'currency',
      icon: <GrowthIcon sx={{ fontSize: 32 }} />,
      gradient: stats.netGCAMovement >= 0
        ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
        : 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)',
      mainColor: stats.netGCAMovement >= 0 ? '#4f46e5' : '#be123c',
      bgGradient: stats.netGCAMovement >= 0
        ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(99, 102, 241, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(190, 18, 60, 0.02) 0%, rgba(251, 113, 133, 0.02) 100%)',
      chipLabel: 'GCA TRACKER'
    },
    {
      title: 'Growth Rate',
      value: stats.openingGCA > 0
        ? `${((stats.netGCAMovement / stats.openingGCA) * 100).toFixed(1)}%`
        : '0.0%',
      format: 'raw',
      icon: <ReportIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
      mainColor: '#475569',
      bgGradient: 'linear-gradient(135deg, rgba(71, 85, 105, 0.02) 0%, rgba(100, 116, 139, 0.02) 100%)',
      chipLabel: 'GCA TRACKER'
    }
  ];

  return <ReportSummaryGrid items={items} mdCols={2} sx={{ mb: 6 }} />;
};

const StageTransferMatrix: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Card sx={{ 
    mb: 6, 
    borderRadius: '20px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.04)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  }}>
    <CardContent sx={{ p: 5 }}>
      <Box sx={{ mb: 4, position: 'relative' }}>
        <Typography variant="h5" fontWeight={800} sx={{ 
          color: '#1e40af', 
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em'
        }}>
          Stage Transfer Analysis
        </Typography>
        <Box sx={{ 
          width: 80, 
          height: 4, 
          borderRadius: 2,
          background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)',
          opacity: 0.4
        }} />
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '16px', 
            border: `2px solid ${alpha('#d32f2f', 0.1)}`,
            background: `linear-gradient(135deg, ${alpha('#fff', 1)} 0%, ${alpha('#ffebee', 0.3)} 100%)`,
            boxShadow: `0 4px 12px ${alpha('#d32f2f', 0.08)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${alpha('#d32f2f', 0.12)}`
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '12px', 
                bgcolor: alpha('#d32f2f', 0.1),
                mr: 2,
                display: 'flex'
              }}>
                <TransferIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="error.main" sx={{ letterSpacing: '-0.01em' }}>
                Deterioration (Increased Risk)
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">Stage 1 → Stage 2</Typography>
                <Typography variant="body2" fontWeight={900} color="error.dark">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(stats.stageTransfers.stage1To2)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.openingGCA > 0 ? Math.min((stats.stageTransfers.stage1To2 / stats.openingGCA) * 100, 100) : 0}
                sx={{ 
                  height: 10, 
                  borderRadius: '5px', 
                  bgcolor: alpha('#ea580c', 0.1),
                  boxShadow: `inset 0 1px 2px ${alpha('#000', 0.05)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#ea580c',
                    borderRadius: '5px',
                    background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  } 
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">Stage 2 → Stage 3</Typography>
                <Typography variant="body2" fontWeight={900} color="error.dark">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(stats.stageTransfers.stage2To3)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.openingGCA > 0 ? Math.min((stats.stageTransfers.stage2To3 / stats.openingGCA) * 100, 100) : 0}
                sx={{ 
                  height: 10, 
                  borderRadius: '5px', 
                  bgcolor: alpha('#be123c', 0.1),
                  boxShadow: `inset 0 1px 2px ${alpha('#000', 0.05)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#be123c',
                    borderRadius: '5px',
                    background: 'linear-gradient(90deg, #be123c 0%, #fb7185 100%)',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  } 
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '16px', 
            border: `2px solid ${alpha('#2e7d32', 0.1)}`,
            background: `linear-gradient(135deg, ${alpha('#fff', 1)} 0%, ${alpha('#e8f5e9', 0.3)} 100%)`,
            boxShadow: `0 4px 12px ${alpha('#2e7d32', 0.08)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${alpha('#2e7d32', 0.12)}`
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '12px', 
                bgcolor: alpha('#2e7d32', 0.1),
                mr: 2,
                display: 'flex'
              }}>
                <TransferIcon sx={{ color: '#2e7d32', fontSize: 24, transform: 'rotate(180deg)' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="success.main" sx={{ letterSpacing: '-0.01em' }}>
                Improvement (Decreased Risk)
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">Stage 2 → Stage 1</Typography>
                <Typography variant="body2" fontWeight={900} color="success.dark">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(stats.stageTransfers.stage2To1)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.openingGCA > 0 ? Math.min((stats.stageTransfers.stage2To1 / stats.openingGCA) * 100, 100) : 0}
                sx={{ 
                  height: 10, 
                  borderRadius: '5px', 
                  bgcolor: alpha('#059669', 0.1),
                  boxShadow: `inset 0 1px 2px ${alpha('#000', 0.05)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#059669',
                    borderRadius: '5px',
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  } 
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">Stage 3 → Stage 2</Typography>
                <Typography variant="body2" fontWeight={900} color="success.dark">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(stats.stageTransfers.stage3To2)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.openingGCA > 0 ? Math.min((stats.stageTransfers.stage3To2 / stats.openingGCA) * 100, 100) : 0}
                sx={{ 
                  height: 10, 
                  borderRadius: '5px', 
                  bgcolor: alpha('#0284c7', 0.1),
                  boxShadow: `inset 0 1px 2px ${alpha('#000', 0.05)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#0284c7',
                    borderRadius: '5px',
                    background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  } 
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const GCACharts: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Grid container spacing={4} sx={{ mb: 6 }}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card sx={{ 
        height: '100%', 
        borderRadius: '20px', 
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Typography variant="h6" fontWeight={800} sx={{ 
              color: '#667eea', // Fallback
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}>
              GCA Movement Waterfall
            </Typography>
            <Box sx={{ 
              width: 60, 
              height: 4, 
              borderRadius: 2,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.6
            }} />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={stats.movementTrend}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f093fb" />
                  <stop offset="100%" stopColor="#f5576c" />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={alpha('#000', 0.06)}
                strokeWidth={1}
              />
              <XAxis 
                dataKey="period" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dx={-10}
                tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 0
                }).format(value)}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ 
                  fontWeight: 800, 
                  marginBottom: '8px',
                  color: '#1e293b',
                  fontSize: '14px'
                }}
                itemStyle={{
                  padding: '4px 0',
                  fontWeight: 600
                }}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(value),
                  name === 'gca' ? 'Movement' : 'Cumulative GCA'
                ]}
              />
              <Legend 
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              />
              <Bar 
                dataKey="gca" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                name="Movement"
                animationDuration={800}
                animationBegin={0}
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="url(#lineGradient)"
                strokeWidth={4}
                dot={{ 
                  r: 7, 
                  fill: '#f5576c', 
                  strokeWidth: 3, 
                  stroke: '#fff',
                  filter: 'drop-shadow(0 2px 4px rgba(245, 87, 108, 0.3))'
                }}
                activeDot={{
                  r: 9,
                  fill: '#f5576c',
                  strokeWidth: 4,
                  stroke: '#fff'
                }}
                name="Cumulative GCA"
                animationDuration={1000}
                animationBegin={200}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <Card sx={{ 
        height: '100%', 
        borderRadius: '20px', 
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Typography variant="h6" fontWeight={800} sx={{ 
              color: '#43e97b', // Fallback
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}>
              GCA by Stage
            </Typography>
            <Box sx={{ 
              width: 60, 
              height: 4, 
              borderRadius: 2,
              background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
              opacity: 0.6
            }} />
          </Box>

          <TableContainer sx={{ maxHeight: 350 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 800, 
                    borderBottom: '2px solid rgba(0,0,0,0.08)',
                    fontSize: '0.8rem',
                    color: '#475569',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    pb: 2
                  }}>
                    Stage
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 800, 
                    borderBottom: '2px solid rgba(0,0,0,0.08)',
                    fontSize: '0.8rem',
                    color: '#475569',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    pb: 2
                  }}>
                    Closing
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 800, 
                    borderBottom: '2px solid rgba(0,0,0,0.08)',
                    fontSize: '0.8rem',
                    color: '#475569',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    pb: 2
                  }}>
                    Move
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.gcaByStage.map((row, index) => {
                  const movement = row.closing - row.opening;
                  return (
                    <TableRow 
                      key={index} 
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(row.color, 0.04),
                          transition: 'background-color 0.2s ease'
                        },
                        borderBottom: index === stats.gcaByStage.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.04)'
                      }}
                    >
                      <TableCell sx={{ py: 2.5 }}>
                        <Chip 
                          size="small" 
                          label={row.stage}
                          sx={{ 
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            bgcolor: alpha(row.color, 0.12),
                            color: row.color,
                            border: 'none',
                            letterSpacing: 0.3,
                            px: 1.5,
                            height: 28
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.9rem', py: 2.5 }}>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          notation: 'compact',
                          maximumFractionDigits: 1
                        }).format(row.closing)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: movement > 0 ? 'error.main' : movement < 0 ? 'success.main' : 'text.secondary',
                            fontWeight: 900,
                            fontSize: '0.8rem',
                            bgcolor: movement > 0 
                              ? alpha('#d32f2f', 0.08) 
                              : movement < 0 
                                ? alpha('#2e7d32', 0.08) 
                                : 'transparent',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '6px',
                            display: 'inline-block'
                          }}
                        >
                          {movement > 0 ? '+' : ''}
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            notation: 'compact',
                            maximumFractionDigits: 1
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

      const aggregated = new Map<number, MovementMatrixRow>();
      data.forEach((row) => {
        const order = Number(row.movement_order || 0);
        if (!order) return;

        const current = aggregated.get(order) || {
          movement_order: order,
          movement: String(row.movement || `Movement ${order}`),
          stage_1_collective: 0,
          stage_2_collective: 0,
          stage_3_collective: 0,
          stage_1_individual: 0,
          stage_2_individual: 0,
          stage_3_individual: 0,
          poci: 0,
          total: 0,
        };

        current.stage_1_collective = (parseFloat(String(current.stage_1_collective || 0)) || 0) + (parseFloat(String(row.stage_1_collective || 0)) || 0);
        current.stage_2_collective = (parseFloat(String(current.stage_2_collective || 0)) || 0) + (parseFloat(String(row.stage_2_collective || 0)) || 0);
        current.stage_3_collective = (parseFloat(String(current.stage_3_collective || 0)) || 0) + (parseFloat(String(row.stage_3_collective || 0)) || 0);
        current.stage_1_individual = (parseFloat(String(current.stage_1_individual || 0)) || 0) + (parseFloat(String(row.stage_1_individual || 0)) || 0);
        current.stage_2_individual = (parseFloat(String(current.stage_2_individual || 0)) || 0) + (parseFloat(String(row.stage_2_individual || 0)) || 0);
        current.stage_3_individual = (parseFloat(String(current.stage_3_individual || 0)) || 0) + (parseFloat(String(row.stage_3_individual || 0)) || 0);
        current.poci = (parseFloat(String(current.poci || 0)) || 0) + (parseFloat(String(row.poci || 0)) || 0);
        current.total = (parseFloat(String(current.total || 0)) || 0) + (parseFloat(String(row.total || 0)) || 0);
        aggregated.set(order, current);
      });

      const getRow = (order: number) => aggregated.get(order);
      const getAmount = (order: number) => parseFloat(String(getRow(order)?.total || 0)) || 0;

      const openingRow = getRow(1);
      const closingRow = getRow(14);

      const stats = {
        ...initialStats,
        openingGCA: getAmount(1),
        closingGCA: getAmount(14),
        newBusinessGCA: Math.max(getAmount(7), 0),
        repayments: Math.abs(getAmount(10)),
        writeOffs: Math.abs(getAmount(11)),
        stageTransfers: {
          stage1To2: Math.abs(getAmount(2)),
          stage2To1: Math.abs(getAmount(4)),
          stage2To3: Math.abs(getAmount(5)),
          stage3To2: Math.abs(getAmount(6)),
        },
      };

      const netGCAMovement = stats.closingGCA - stats.openingGCA;

      const stageMap = new Map<string, GCAByStageItem>([
        ['Stage 1', { stage: 'Stage 1', opening: 0, closing: 0, accounts: 1, color: '#4CAF50' }],
        ['Stage 2', { stage: 'Stage 2', opening: 0, closing: 0, accounts: 1, color: '#FF9800' }],
        ['Stage 3', { stage: 'Stage 3', opening: 0, closing: 0, accounts: 1, color: '#F44336' }],
      ]);

      const stage1 = stageMap.get('Stage 1')!;
      const stage2 = stageMap.get('Stage 2')!;
      const stage3 = stageMap.get('Stage 3')!;

      stage1.opening = (parseFloat(String(openingRow?.stage_1_collective || 0)) || 0) + (parseFloat(String(openingRow?.stage_1_individual || 0)) || 0);
      stage2.opening = (parseFloat(String(openingRow?.stage_2_collective || 0)) || 0) + (parseFloat(String(openingRow?.stage_2_individual || 0)) || 0);
      stage3.opening = (parseFloat(String(openingRow?.stage_3_collective || 0)) || 0) + (parseFloat(String(openingRow?.stage_3_individual || 0)) || 0);
      stage1.closing = (parseFloat(String(closingRow?.stage_1_collective || 0)) || 0) + (parseFloat(String(closingRow?.stage_1_individual || 0)) || 0);
      stage2.closing = (parseFloat(String(closingRow?.stage_2_collective || 0)) || 0) + (parseFloat(String(closingRow?.stage_2_individual || 0)) || 0);
      stage3.closing = (parseFloat(String(closingRow?.stage_3_collective || 0)) || 0) + (parseFloat(String(closingRow?.stage_3_individual || 0)) || 0);

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
  const optionalParams = useMemo(() => ['segment_id', 'group_segment', 'stage'], []);

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
