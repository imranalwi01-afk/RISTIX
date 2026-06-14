// packages/frontend/src/components/ifrs9/EADModelReport.tsx
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
  alpha
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BalanceIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import {
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
import { useBankingTheme } from '../../providers/BankingThemeProvider';
import BaseIfrs9Report from './BaseIfrs9Report';
import ReportSummaryGrid, { KPIItem } from './ReportSummaryGrid';

interface EADTrendItem {
  month: string;
  ead: number;
  ccf: number;
  utilization: number;
}

interface ProductDistItem {
  product: string;
  count: number;
  percentage: number;
}

interface SummaryStats {
  totalAccounts: number;
  avgEAD: number;
  avgCCF: number;
  avgUtilization: number;
  eadTrend: EADTrendItem[];
  productDistribution: ProductDistItem[];
}

interface EADMatrixRow {
  id: string | number;
  ltMonth: number;
  values: Record<string, number | null>;
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
          primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          secondaryGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          tertiaryGradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
          quaternaryGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          mainColor: '#1976D2'
        };
    }
  };

  const themeColors = getThemeColors();

  const kpiItems: KPIItem[] = [
    {
      title: 'TOTAL ACCOUNTS',
      value: stats.totalAccounts,
      format: 'count',
      chipLabel: 'REPORTED',
      icon: <BalanceIcon fontSize="large" />,
      gradient: themeColors.primaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'AVERAGE EAD',
      value: stats.avgEAD,
      format: 'currency',
      chipLabel: 'EXPOSURE',
      icon: <TrendingUpIcon fontSize="large" />,
      gradient: themeColors.secondaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'AVERAGE CCF',
      value: stats.avgCCF * 100,
      format: 'percent',
      chipLabel: 'EAD-WEIGHTED',
      icon: <AnalyticsIcon fontSize="large" />,
      gradient: themeColors.tertiaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'AVG UTILIZATION',
      value: stats.avgUtilization * 100,
      format: 'percent',
      chipLabel: 'PORTFOLIO',
      icon: <TimelineIcon fontSize="large" />,
      gradient: themeColors.quaternaryGradient,
      mainColor: themeColors.mainColor
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', color: themeColors.mainColor }}>
        <AnalyticsIcon sx={{ mr: 1.5, fontSize: 32 }} />
        EAD Model Key Metrics
      </Typography>
      <ReportSummaryGrid items={kpiItems} mdCols={4} />
    </Box>
  );
};


const EADCharts: React.FC<{ stats: SummaryStats }> = ({ stats }) => (
  <Grid container spacing={3} sx={{ mb: 5 }}>
    {/* EAD Trend */}
    <Grid size={{ xs: 12, md: 8 }}>
      <Card sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            EAD Model Trend Analysis
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={stats.eadTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis 
                yAxisId="left" 
                axisLine={false} 
                tickLine={false} 
                width={80}
                tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value)}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                width={50}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                formatter={(value: number, name: string) => {
                  if (name === 'EAD Amount') {
                    return [new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact'
                    }).format(value), name];
                  }
                  return [`${(value * 100).toFixed(2)}%`, name];
                }}
              />
              <Legend iconType="circle" />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="eadAmount"
                stroke="#667eea"
                strokeWidth={3}
                fill="url(#colorEad)"
                name="EAD Amount"
              />
              <defs>
                <linearGradient id="colorEad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ccfRate"
                stroke="#ff4e50"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="CCF Rate"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilizationRate"
                stroke="#43e97b"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Utilization Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>

    {/* Product Distribution */}
    <Grid size={{ xs: 12, md: 4 }}>
      <Card sx={{ 
        height: '100%',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Product Distribution
          </Typography>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, borderBottom: '2px solid rgba(0,0,0,0.05)' }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, borderBottom: '2px solid rgba(0,0,0,0.05)' }}>Count</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, borderBottom: '2px solid rgba(0,0,0,0.05)' }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.productDistribution.map((row, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#000', 0.02) } }}>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.product}
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha('#667eea', 0.1),
                          color: '#667eea',
                          border: 'none'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {row.count.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} color="primary">
                        {row.percentage.toFixed(1)}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

const EADModelReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalAccounts: 0,
    avgEAD: 0,
    avgCCF: 0,
    avgUtilization: 0,
    eadTrend: [],
    productDistribution: []
  });

  const [pivotRows, setPivotRows] = useState<EADMatrixRow[]>([]);
  const [pivotMonths, setPivotMonths] = useState<string[]>([]);

  const handleDataLoaded = React.useCallback((data: Record<string, unknown>[], summary?: any) => {
    const { rows, monthColumns } = processEADPivotData(data);
    setPivotRows(rows);
    setPivotMonths(monthColumns);

    if (summary) {
      setSummaryStats({
        totalAccounts: summary.totalAccounts || 0,
        avgEAD: summary.avgEAD || 0,
        avgCCF: summary.avgCCF || 0,
        avgUtilization: summary.avgUtilization || 0,
        eadTrend: summary.eadTrend || [],
        productDistribution: summary.productDistribution || []
      });
    } else if (data && data.length > 0) {
      const stats = data.reduce<{ totalAccounts: number; avgEAD: number; avgCCF: number; avgUtilization: number }>((acc, row) => {
        const rowEad = parseFloat(row.ead_amount as string) || 0;
        const rowCcf = parseFloat(row.ccf_rate as string) || 0;
        const rowUtil = parseFloat(row.utilization_rate as string) || 0;

        return {
          totalAccounts: acc.totalAccounts + 1,
          avgEAD: acc.avgEAD + rowEad,
          avgCCF: acc.avgCCF + rowCcf,
          avgUtilization: acc.avgUtilization + rowUtil
        };
      }, {
        totalAccounts: 0,
        avgEAD: 0,
        avgCCF: 0,
        avgUtilization: 0
      });

      const avgEAD = stats.avgEAD / data.length;
      const avgCCF = stats.avgCCF / data.length;
      const avgUtilization = stats.avgUtilization / data.length;

      const trendData = data.slice(0, 12).map((row, index) => ({
        month: `M${index + 1}`,
        ead: parseFloat(row.ead_amount as string) || 0,
        ccf: parseFloat(row.ccf_rate as string) || 0,
        utilization: parseFloat(row.utilization_rate as string) || 0
      }));

      const productMap = new Map<string, number>();
      data.forEach(row => {
        const product = (row.product_type || 'Unknown') as string;
        productMap.set(product, (productMap.get(product) || 0) + 1);
      });

      const productDist = Array.from(productMap.entries()).map(([product, count]) => ({
        product,
        count,
        percentage: (count / data.length) * 100
      }));

      setSummaryStats({
        totalAccounts: stats.totalAccounts,
        avgEAD,
        avgCCF,
        avgUtilization,
        eadTrend: trendData,
        productDistribution: productDist
      });
    }
  }, []);

  const requiredParams = useMemo(() => ['prc_date'], []);
  const optionalParams = useMemo(() => ['ead_config_id'], []);

  return (
    <BaseIfrs9Report
      title="EAD Model Report"
      description="Exposure at Default model with payment averages, credit conversion factors, and utilization analysis"
      reportType="ead-model"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={false}
      supportsCharts={true}
      hideDataGrid={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
      <EADCharts stats={summaryStats} />

      <Card sx={{ mt: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
        <CardContent sx={{ p: 4, minWidth: 0, overflowX: 'hidden' }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Payment Average by Tenor (Pivoted)
          </Typography>
          <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: '100%',
                borderRadius: 4,
                overflowX: 'unset',
                overflowY: 'hidden',
                borderColor: alpha('#000', 0.08),
              }}
            >
              <Table stickyHeader size="small" sx={{ minWidth: Math.max(900, 140 + (pivotMonths.length * 140)) }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      minWidth: 140,
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: 'text.secondary',
                      bgcolor: 'background.paper',
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                    }}
                  >
                    LT/MONTH
                  </TableCell>
                  {pivotMonths.map((month) => (
                    <TableCell
                      key={month}
                      align="center"
                      sx={{
                        minWidth: 140,
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: 'text.secondary',
                        bgcolor: 'background.paper',
                      }}
                    >
                      {month}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pivotRows.length > 0 ? (
                  pivotRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          bgcolor: 'background.paper',
                          fontWeight: 700,
                        }}
                      >
                        {row.ltMonth}
                      </TableCell>
                      {pivotMonths.map((month) => (
                        <TableCell key={`${row.id}-${month}`} align="right" sx={{ color: 'text.secondary' }}>
                          {formatMatrixValue(row.values[month])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={Math.max(1, pivotMonths.length + 1)} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No EAD model detail data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ px: 1, pt: 2, color: 'text.secondary', fontSize: '0.95rem' }}>
            {pivotRows.length > 0 ? `1 - ${pivotRows.length} of ${pivotRows.length}` : '0 - 0 of 0'}
          </Box>
        </CardContent>
      </Card>
    </BaseIfrs9Report>
  );
};

const processEADPivotData = (data: Record<string, unknown>[]) => {
  if (!data || data.length === 0) return { rows: [] as EADMatrixRow[], monthColumns: [] as string[] };

  const firstRow = data[0];
  const monthColumns = Object.keys(firstRow)
    .filter((key) => key.match(/^paym_\d+$/i) || key.match(/^seq_\d+$/i) || key.match(/^month_\d+$/i))
    .sort((left, right) => {
      const leftNumber = Number(left.replace(/^[^\d]+/, ''));
      const rightNumber = Number(right.replace(/^[^\d]+/, ''));
      return leftNumber - rightNumber;
    })
    .map((key) => key.replace(/^[^\d]+/, ''));

  const rows: EADMatrixRow[] = data.map((row, index) => {
    const ltMonthRaw = row.tenor ?? row.lt_month ?? row.id ?? index + 1;
    const ltMonth = Number.isFinite(Number(ltMonthRaw)) ? Number(ltMonthRaw) : index + 1;
    const values = monthColumns.reduce<Record<string, number | null>>((acc, month) => {
      const rawValue = row[`paym_${month}`] ?? row[`seq_${month}`] ?? row[`month_${month}`];
      const parsedValue = rawValue === null || rawValue === undefined || rawValue === ''
        ? null
        : Number(rawValue);
      acc[month] = Number.isFinite(parsedValue) ? parsedValue : null;
      return acc;
    }, {});

    return {
      id: String(row.id ?? ltMonth),
      ltMonth,
      values,
    };
  });

  return { rows, monthColumns };
};

const formatMatrixValue = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 15,
  }).format(value);
};

export default EADModelReport;
