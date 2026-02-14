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
      icon: <BalanceIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: '#4facfe',
      bgGradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.03) 0%, rgba(0, 242, 254, 0.03) 100%)'
    },
    {
      title: 'Closing GCA',
      value: stats.closingGCA,
      format: 'currency',
      icon: <BalanceIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      mainColor: '#43e97b',
      bgGradient: 'linear-gradient(135deg, rgba(67, 233, 123, 0.03) 0%, rgba(56, 249, 215, 0.03) 100%)'
    },
    {
      title: 'Net Movement',
      value: stats.netGCAMovement,
      format: 'currency',
      icon: <GrowthIcon sx={{ fontSize: 36 }} />,
      gradient: stats.netGCAMovement >= 0 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        : 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)',
      mainColor: stats.netGCAMovement >= 0 ? '#667eea' : '#ff4e50',
      bgGradient: stats.netGCAMovement >= 0
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)'
        : 'linear-gradient(135deg, rgba(255, 78, 80, 0.03) 0%, rgba(249, 212, 35, 0.03) 100%)'
    },
    {
      title: 'Growth Rate',
      value: stats.openingGCA > 0
        ? `${((stats.netGCAMovement / stats.openingGCA) * 100).toFixed(1)}%`
        : '0.0%',
      format: 'raw',
      icon: <ReportIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      mainColor: '#f5576c',
      bgGradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.03) 0%, rgba(245, 87, 108, 0.03) 100%)'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {items.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{
            height: '100%',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(to bottom, white 0%, ${alpha('#f8fafc', 0.5)} 100%)`,
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 1px 3px ${alpha(item.mainColor, 0.08)},
              0 4px 12px ${alpha(item.mainColor, 0.12)},
              0 12px 32px ${alpha(item.mainColor, 0.08)}
            `,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: `1px solid ${alpha(item.mainColor, 0.12)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: item.bgGradient,
              opacity: 0,
              transition: 'opacity 0.4s ease',
              pointerEvents: 'none',
              zIndex: 0
            },
            '&:hover': {
              transform: 'translateY(-12px) scale(1.02)',
              boxShadow: `
                0 4px 12px ${alpha(item.mainColor, 0.12)},
                0 12px 32px ${alpha(item.mainColor, 0.2)},
                0 24px 56px ${alpha(item.mainColor, 0.15)}
              `,
              borderColor: alpha(item.mainColor, 0.2),
              '&::before': {
                opacity: 1
              },
              '& .card-icon-container': {
                transform: 'rotate(12deg) scale(1.15)',
                boxShadow: `0 8px 24px ${alpha(item.mainColor, 0.5)}`
              },
              '& .value-text': {
                transform: 'scale(1.05)',
                letterSpacing: '-0.02em'
              }
            }
          }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: 2, 
                    color: 'text.secondary',
                    opacity: 0.7,
                    fontSize: '0.7rem',
                    lineHeight: 1.4
                  }}
                >
                  {item.title}
                </Typography>
                <Box
                  className="card-icon-container"
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    background: item.gradient,
                    color: 'white',
                    display: 'flex',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: `
                      0 4px 12px ${alpha(item.mainColor, 0.35)},
                      0 2px 6px ${alpha(item.mainColor, 0.25)}
                    `
                  }}
                >
                  {item.icon}
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Typography 
                  className="value-text"
                  variant="h3" 
                  sx={{ 
                    fontWeight: 900,
                    color: item.mainColor, // Fallback
                    background: item.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1.5,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small" 
                    label="GCA TRACKER" 
                    variant="outlined"
                    sx={{ 
                      height: 22, 
                      fontSize: '0.65rem', 
                      fontWeight: 800,
                      borderColor: alpha(item.mainColor, 0.25),
                      color: item.mainColor,
                      letterSpacing: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: alpha(item.mainColor, 0.5),
                        bgcolor: alpha(item.mainColor, 0.05)
                      }
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
          color: '#667eea', // Fallback
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.6
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
                  height: 12, 
                  borderRadius: '6px', 
                  bgcolor: alpha('#ed6c02', 0.12),
                  boxShadow: `inset 0 2px 4px ${alpha('#000', 0.1)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#ed6c02',
                    borderRadius: '6px',
                    background: 'linear-gradient(90deg, #ed6c02 0%, #ff9800 100%)',
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
                  height: 12, 
                  borderRadius: '6px', 
                  bgcolor: alpha('#d32f2f', 0.12),
                  boxShadow: `inset 0 2px 4px ${alpha('#000', 0.1)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#d32f2f',
                    borderRadius: '6px',
                    background: 'linear-gradient(90deg, #d32f2f 0%, #f44336 100%)',
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
                  height: 12, 
                  borderRadius: '6px', 
                  bgcolor: alpha('#2e7d32', 0.12),
                  boxShadow: `inset 0 2px 4px ${alpha('#000', 0.1)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#2e7d32',
                    borderRadius: '6px',
                    background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)',
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
                  height: 12, 
                  borderRadius: '6px', 
                  bgcolor: alpha('#0288d1', 0.12),
                  boxShadow: `inset 0 2px 4px ${alpha('#000', 0.1)}`,
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#0288d1',
                    borderRadius: '6px',
                    background: 'linear-gradient(90deg, #0288d1 0%, #03a9f4 100%)',
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