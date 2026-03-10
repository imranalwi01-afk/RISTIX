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
  ResponsiveContainer,
  Cell,
  LabelList
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

interface MovementMatrixRow {
  movement_order?: number;
  movement?: string;
  total?: number | string;
}

const SummaryCards: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const items = [
    {
      title: 'Opening Balance',
      value: stats.openingBalance,
      format: 'currency',
      icon: <TimelineIcon sx={{ fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)',
      mainColor: '#3A1C71',
      secondaryColor: '#FFAF7B'
    },
    {
      title: 'Closing Balance',
      value: stats.closingBalance,
      format: 'currency',
      icon: <TimelineIcon sx={{ fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)',
      mainColor: '#1D976C',
      secondaryColor: '#93F9B9'
    },
    {
      title: 'Net Movement',
      value: stats.netMovement,
      format: 'currency',
      icon: stats.netMovement >= 0 ? <IncreaseIcon sx={{ fontSize: 24 }} /> : <DecreaseIcon sx={{ fontSize: 24 }} />,
      gradient: stats.netMovement >= 0 
        ? 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' 
        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: stats.netMovement >= 0 ? '#DD2476' : '#4facfe',
      secondaryColor: stats.netMovement >= 0 ? '#FF512F' : '#00f2fe'
    },
    {
      title: 'Volatility Index',
      value: stats.openingBalance > 0 
        ? `${((Math.abs(stats.netMovement) / stats.openingBalance) * 100).toFixed(1)}%`
        : '0.0%',
      format: 'raw',
      icon: <MovementIcon sx={{ fontSize: 24 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      mainColor: '#667eea',
      secondaryColor: '#764ba2'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {items.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{
            height: '100%',
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 15px 35px ${alpha(item.mainColor, 0.1)}`,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
              transform: 'translateY(-12px) scale(1.02)',
              boxShadow: `0 25px 50px ${alpha(item.mainColor, 0.2)}`,
              background: 'rgba(255, 255, 255, 0.85)',
              '& .icon-glow': {
                boxShadow: `0 0 25px ${alpha(item.secondaryColor, 0.6)}`,
                transform: 'rotate(15deg) scale(1.2)'
              }
            }
          }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -30, 
                right: -30, 
                width: 120, 
                height: 120, 
                background: item.gradient,
                opacity: 0.03,
                borderRadius: '50%',
                filter: 'blur(20px)'
              }} />

              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: 2, 
                      color: 'text.secondary',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Box 
                  className="icon-glow"
                  sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: '16px', 
                    background: item.gradient,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s ease',
                    boxShadow: `0 8px 20px ${alpha(item.mainColor, 0.4)}`,
                  }}
                >
                  {item.icon}
                </Box>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 900,
                    letterSpacing: -1,
                    background: item.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
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
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 1 }}>
                    Live Tracking
                  </Typography>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50', animation: 'pulse 1.5s infinite' }} />
                </Box>
              </Box>
            </CardContent>
            
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.7; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.7; }
              }
            `}} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const MovementWaterfallChart: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Card sx={{ 
    mb: 6, 
    borderRadius: 6, 
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
    background: 'white',
    border: '1px solid rgba(0,0,0,0.03)',
    overflow: 'hidden'
  }}>
    <Box sx={{ p: 5, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
          Waterfall Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualizing Provision Dynamics across Categories
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip label="Dynamic" size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }} />
        <Chip label="Exportable" size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }} />
      </Box>
    </Box>
    <CardContent sx={{ p: 5 }}>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart 
          data={stats.movementBreakdown}
          margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
        >
          <defs>
            {stats.movementBreakdown.map((entry, index) => (
              <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1" key={index}>
                <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                <stop offset="100%" stopColor={alpha(entry.color, 0.6)} stopOpacity={0.8}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
          <XAxis 
            dataKey="category" 
            angle={-20} 
            textAnchor="end" 
            height={80}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontWeight: 700, fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact'
            }).format(value)}
          />
          <Tooltip 
            cursor={{ fill: alpha('#6366f1', 0.05), radius: 10 }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
            itemStyle={{ fontWeight: 800, fontSize: '14px' }}
            formatter={(value: number) => [
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(Math.abs(value)),
              'ECL Impact'
            ]}
          />
          <Bar 
            dataKey="amount" 
            radius={[12, 12, 0, 0]}
            barSize={50}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {stats.movementBreakdown.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient-${index})`}
              />
            ))}
            <LabelList 
              dataKey="amount" 
              position="top" 
              offset={15}
              formatter={(value) => new Intl.NumberFormat('id-ID', {
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(Math.abs(value))}
              style={{ fontWeight: 800, fontSize: 13, fill: '#1e293b' }}
            />
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
      const aggregated = new Map<number, MovementMatrixRow>();
      data.forEach((row) => {
        const order = Number(row.movement_order || 0);
        if (!order) return;

        const current = aggregated.get(order) || {
          movement_order: order,
          movement: String(row.movement || `Movement ${order}`),
          total: 0,
        };

        current.total = (parseFloat(current.total as string) || 0) + (parseFloat(row.total as string) || 0);
        aggregated.set(order, current);
      });

      const getAmount = (order: number) => parseFloat(String(aggregated.get(order)?.total || 0)) || 0;

      const openingBalance = getAmount(1);
      const closingBalance = getAmount(14);
      const stageTransfers = [2, 3, 4, 5, 6].reduce((sum, order) => sum + Math.abs(getAmount(order)), 0);
      const provisionValues = [7, 8, 9, 10, 13].map(getAmount);
      const newProvisions = provisionValues.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
      const releases = provisionValues.filter((value) => value < 0).reduce((sum, value) => sum + Math.abs(value), 0);
      const writeOffs = Math.abs(getAmount(11));
      const netMovement = closingBalance - openingBalance;

      const movementBreakdown = Array.from(aggregated.values())
        .sort((a, b) => Number(a.movement_order || 0) - Number(b.movement_order || 0))
        .map((row) => {
          const order = Number(row.movement_order || 0);
          const total = parseFloat(String(row.total || 0)) || 0;
          const type: MovementBreakdownItem['type'] =
            order === 1 || order === 14 ? 'balance'
              : [2, 3, 4, 5, 6].includes(order) ? 'transfer'
                : total >= 0 ? 'increase'
                  : 'decrease';
          const color = type === 'balance'
            ? (order === 1 ? '#6366f1' : '#8b5cf6')
            : type === 'transfer'
              ? '#3b82f6'
              : type === 'increase'
                ? '#ef4444'
                : '#22c55e';

          return {
            category: String(row.movement || `Movement ${order}`),
            amount: total,
            color,
            type,
          };
        });

      setSummaryStats({
        openingBalance: 0,
        closingBalance: 0,
        netMovement: 0,
        newProvisions: 0,
        releases: 0,
        writeOffs: 0,
        stageTransfers: 0,
        movementBreakdown: [] as MovementBreakdownItem[]
      });

      setSummaryStats({
        openingBalance,
        closingBalance,
        netMovement,
        newProvisions,
        releases,
        writeOffs,
        stageTransfers,
        movementBreakdown,
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
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800, 
            mb: 1, 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MovementIcon sx={{ mr: 1.5, color: '#6366f1' }} />
          ECL Movement Analysis
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Quantitative breakdown of provision changes during the reporting period
        </Typography>
      </Box>
      
      <SummaryCards stats={summaryStats} />
      <MovementWaterfallChart stats={summaryStats} />
    </BaseIfrs9Report>
  );
};

export default ECLMovementReport;
