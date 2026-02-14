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

  const items = [
    {
      title: 'Total Accounts',
      value: stats.totalAccounts.toLocaleString('id-ID'),
      format: 'raw',
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.primaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'Average EAD',
      value: stats.avgEAD,
      format: 'currency',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.secondaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'Average CCF',
      value: `${(stats.avgCCF * 100).toFixed(2)}%`,
      format: 'raw',
      icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
      gradient: themeColors.tertiaryGradient,
      mainColor: themeColors.mainColor
    },
    {
      title: 'Avg Utilization',
      value: `${(stats.avgUtilization * 100).toFixed(2)}%`,
      format: 'raw',
      icon: <TimelineIcon sx={{ fontSize: 32 }} />,
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
                    color: item.mainColor, // Fallback
                    background: item.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                    fontSize: item.value.toString().length > 12 ? '1.5rem' : '2.125rem'
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
                    label="MODEL METRIC" 
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

const ModelParametersCard: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const { bankingMode } = useBankingTheme();
  
  const getThemeColors = () => {
    switch (bankingMode) {
      case 'syariah':
        return {
          primary: '#00695c',
          secondary: '#00897b',
          tertiary: '#00796b',
          shadowPrimary: 'rgba(0, 105, 92, 0.3)',
          shadowSecondary: 'rgba(0, 137, 123, 0.3)',
          shadowTertiary: 'rgba(0, 121, 107, 0.3)'
        };
      case 'dual':
        return {
          primary: '#37474f',
          secondary: '#546e7a',
          tertiary: '#455a64',
          shadowPrimary: 'rgba(55, 71, 79, 0.3)',
          shadowSecondary: 'rgba(84, 110, 122, 0.3)',
          shadowTertiary: 'rgba(69, 90, 100, 0.3)'
        };
      default:
        return {
          primary: '#667eea',
          secondary: '#43e97b',
          tertiary: '#4facfe',
          shadowPrimary: 'rgba(102, 126, 234, 0.3)',
          shadowSecondary: 'rgba(67, 233, 123, 0.3)',
          shadowTertiary: 'rgba(79, 172, 254, 0.3)'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <Card sx={{ 
      mb: 5, 
      borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          EAD Model Key Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${alpha(themeColors.primary, 0.7)} 100%)`, 
              color: 'white',
              borderRadius: 3,
              boxShadow: `0 8px 24px ${themeColors.shadowPrimary}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(themeColors.primary, 0.4)}`
              }
            }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Credit Conversion Factor</Typography>
              <Typography variant="h3" component="div" fontWeight="800" sx={{ my: 2 }}>
                {(stats.avgCCF * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Average CCF Rate
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              background: `linear-gradient(135deg, ${themeColors.secondary} 0%, ${alpha(themeColors.secondary, 0.7)} 100%)`, 
              color: 'white',
              borderRadius: 3,
              boxShadow: `0 8px 24px ${themeColors.shadowSecondary}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(themeColors.secondary, 0.4)}`
              }
            }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Utilization Rate</Typography>
              <Typography variant="h3" component="div" fontWeight="800" sx={{ my: 2 }}>
                {(stats.avgUtilization * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Current Avg Utilization
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              background: `linear-gradient(135deg, ${themeColors.tertiary} 0%, ${alpha(themeColors.tertiary, 0.7)} 100%)`, 
              color: 'white',
              borderRadius: 3,
              boxShadow: `0 8px 24px ${themeColors.shadowTertiary}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(themeColors.tertiary, 0.4)}`
              }
            }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>Exposure at Default</Typography>
              <Typography variant="h3" component="div" fontWeight="800" sx={{ my: 2 }}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(stats.avgEAD)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Average EAD Amount
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
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
              <YAxis yAxisId="left" axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
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
                dataKey="ead"
                stroke="#667eea"
                strokeWidth={3}
                fill="url(#colorEad)"
                name="EAD Amount"
              />
              <defs>
                <linearGradient id="colorEad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ccf"
                stroke="#ff4e50"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="CCF Rate"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilization"
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
  
  const [pivotData, setPivotData] = useState<Record<string, unknown>[]>([]);
  const [pivotColumns, setPivotColumns] = useState<string[]>([]);

  const handleDataLoaded = React.useCallback((data: Record<string, unknown>[]) => {
    const { pivotData: pData, columns: pCols } = processEADPivotData(data);
    setPivotData(pData);
    setPivotColumns(pCols);

    if (data && data.length > 0) {
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
  const optionalParams = useMemo(() => ['ead_config_id', 'segment_id'], []);

  return (
    <BaseIfrs9Report
      title="EAD Model Report"
      description="Exposure at Default model with payment averages, credit conversion factors, and utilization analysis"
      reportType="ead-model"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={false}
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards stats={summaryStats} />
      <ModelParametersCard stats={summaryStats} />
      <EADCharts stats={summaryStats} />

      <Card sx={{ mt: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Payment Average by Tenor (Pivoted)
          </Typography>
          <EADPivotTable 
            data={pivotData} 
            columns={pivotColumns}
          />
        </CardContent>
      </Card>
    </BaseIfrs9Report>
  );
};

const processEADPivotData = (data: Record<string, unknown>[]) => {
    if (!data || data.length === 0) return { pivotData: [], columns: [] };

    const firstRow = data[0];
    const baseColumns = ['account_id', 'product_type', 'segment_name', 'tenor'];
    
    const dynamicColumns = Object.keys(firstRow).filter(key => 
        key.match(/^(tenor|month|paym)_\d+$/)
    ).sort();

    const pivotCols = dynamicColumns.length > 0 ? dynamicColumns : Object.keys(firstRow).filter(k => !baseColumns.includes(k) && typeof firstRow[k] === 'number');
    const allColumns = [...baseColumns.filter(k => k in firstRow), ...pivotCols];
    
    return {
      pivotData: data,
      columns: allColumns
    };
};

const EADPivotTable = ({ data, columns }: { data: Record<string, any>[], columns: string[] }) => {
    if (!data || data.length === 0) return null;

    const baseColumns = columns.filter(col => !col.match(/^(tenor|month|paym)_\d+$/));
    const dynamicColumns = columns.filter(col => col.match(/^(tenor|month|paym)_\d+$/));

    const finalBase = dynamicColumns.length > 0 ? baseColumns : columns;
    const finalDynamic = dynamicColumns.length > 0 ? dynamicColumns : [];

    const { bankingMode } = useBankingTheme();
    const headerBg = bankingMode === 'syariah' ? '#004d40' : bankingMode === 'dual' ? '#263238' : '#0D47A1';

    return (
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ maxHeight: 600, overflow: 'auto', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: headerBg, color: 'white' }}>
              <tr>
                {finalBase.map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>
                    {col.replace(/_/g, ' ').toUpperCase()}
                  </th>
                ))}
                {finalDynamic.map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, minWidth: 80 }}>
                    {col.replace(/^(tenor|month|paym)_/, '').toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: index % 2 === 0 ? 'white' : '#f9faff' }}>
                  {finalBase.map(col => (
                    <td key={col} style={{ padding: '12px 16px' }}>
                      {row[col]?.toString() || '-'}
                    </td>
                  ))}
                  {finalDynamic.map(col => (
                    <td key={col} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                         {row[col] !== null && row[col] !== undefined ? (
                            new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(row[col])
                         ) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {data.length > 100 && (
           <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
             Showing first 100 rows. Export to see full data.
           </Typography>
        )}
      </Box>
    );
};

export default EADModelReport;
