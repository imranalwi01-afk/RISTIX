// packages/frontend/src/components/ifrs9/LifetimePDReport.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pd-tabpanel-${index}`}
      aria-labelledby={`pd-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, md: 3 } }}>{children}</Box>}
    </div>
  );
}

const PDChart: React.FC<{ data: any[]; type: 'yearly' | 'monthly' }> = ({ data, type }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card sx={{ 
      mb: 4, 
      borderRadius: 4, 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Lifetime PD Trend - {type === 'yearly' ? 'Yearly' : 'Monthly'} Marginal
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.05)} />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontWeight: 600 }}
              tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              formatter={(value: number) => [`${(value * 100).toFixed(4)}%`, 'PD Rate']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="pd" 
              stroke="#667eea" 
              strokeWidth={4}
              dot={{ r: 6, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              name="PD Rate (Marginal)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const PDPivotTable: React.FC<{ data: any[]; columns: string[]; title: string }> = ({ data, columns, title }) => {
  if (!data || data.length === 0) return null;

  const baseColumns = columns.filter(col => !col.match(/^(year|month)_\d+$/));
  const periodColumns = columns.filter(col => col.match(/^(year|month)_\d+$/));

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {title} - Detailed View
        </Typography>
        <Chip label={`${data.length} Records`} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#667eea', 0.1), color: '#667eea' }} />
      </Box>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {baseColumns.map(col => (
                <TableCell key={col} sx={{ fontWeight: 800, bgcolor: '#f8faff', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                  {col.replace(/_/g, ' ')}
                </TableCell>
              ))}
              {periodColumns.map(col => (
                <TableCell 
                  key={col} 
                  align="right" 
                  sx={{ 
                    fontWeight: 800, 
                    bgcolor: '#f8faff', 
                    color: 'text.secondary',
                    textTransform: 'uppercase', 
                    fontSize: '0.75rem', 
                    letterSpacing: 1,
                    minWidth: 90
                  }}
                >
                  {col.replace(/^(year|month)_/, '').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(0, 100).map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#667eea', 0.02) } }}>
                {baseColumns.map(col => (
                  <td key={col} style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                    {col === 'product_type' ? (
                      <Chip 
                        size="small" 
                        label={row[col]} 
                        sx={{ fontWeight: 600, bgcolor: alpha('#667eea', 0.08), color: '#667eea', border: 'none' }}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight={baseColumns.includes(col) && col.includes('name') ? 600 : 400}>
                        {row[col] || '-'}
                      </Typography>
                    )}
                  </td>
                ))}
                {periodColumns.map(col => (
                  <td key={col} style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {row[col] !== null && row[col] !== undefined ? (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: row[col] > 0.1 ? 800 : 600,
                          color: row[col] > 0.5 ? 'error.main' : 'text.primary'
                        }}
                      >
                        {(row[col] * 100).toFixed(4)}%
                      </Typography>
                    ) : '-'}
                  </td>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data.length > 100 && (
        <Box sx={{ p: 2, bgcolor: alpha('#0288d1', 0.04) }}>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'info.main', fontWeight: 600 }}>
            Showing first 100 entries. Use Export to view full dataset.
          </Typography>
        </Box>
      )}
    </Card>
  );
};

const LifetimePDReport: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [pivotColumns, setPivotColumns] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0 && yearlyData.length > 0) {
        const { chartData } = processPivotData(yearlyData, 'yearly');
        setChartData(chartData);
    } else if (newValue === 1 && monthlyData.length > 0) {
        const { chartData } = processPivotData(monthlyData, 'monthly');
        setChartData(chartData);
    }
  };

  const processPivotData = useCallback((data: any[], type: 'yearly' | 'monthly') => {
    if (!data || data.length === 0) return { pivotData: [], columns: [], chartData: [] };

    const firstRow = data[0];
    const baseColumns = ['account_id', 'customer_name', 'product_type', 'segment_name'];
    
    const periodColumns = Object.keys(firstRow).filter(key => 
      type === 'yearly' 
        ? key.match(/^year_\d+$/)
        : key.match(/^month_\d+$/)
    ).sort((a, b) => {
        const numA = parseInt(a.split('_')[1]);
        const numB = parseInt(b.split('_')[1]);
        return numA - numB;
    });

    const allColumns = [...baseColumns.filter(c => c in firstRow), ...periodColumns];
    
    const sampleAccount = data[0];
    const chartDataPoints = periodColumns.map(col => ({
      period: col.replace(/^(year|month)_/, ''),
      pd: sampleAccount[col] || 0,
      label: type === 'yearly' ? `Year ${col.replace('year_', '')}` : `Month ${col.replace('month_', '')}`
    }));

    return {
      pivotData: data,
      columns: allColumns,
      chartData: chartDataPoints
    };
  }, []);

  const handleYearlyDataLoaded = React.useCallback((data: any[]) => {
    const { pivotData, columns, chartData } = processPivotData(data, 'yearly');
    setYearlyData(pivotData);
    setPivotColumns(columns);
    if (tabValue === 0) {
      setChartData(chartData);
    }
  }, [processPivotData, tabValue]);

  const handleMonthlyDataLoaded = React.useCallback((data: any[]) => {
    const { pivotData, columns, chartData } = processPivotData(data, 'monthly');
    setMonthlyData(pivotData);
    if (tabValue === 1) {
      setChartData(chartData);
      setPivotColumns(columns); // Update columns for monthly view
    }
  }, [processPivotData, tabValue]);

  const yearlyRequiredParams = useMemo(() => ['prc_date'], []);
  const yearlyOptionalParams = useMemo(() => ['pd_config_id', 'pd_method', 'scalar_id', 'segment_id', 'fl_flag'], []);
  
  return (
    <Box sx={{ p: 0 }}>
      {/* Tabs with premium styling */}
      <Paper sx={{ 
        mb: 4, 
        borderRadius: 4, 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
            },
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              py: 2.5,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: '#667eea'
              }
            }
          }}
        >
          <Tab label="Yearly Marginal PD" />
          <Tab label="Monthly Marginal PD" />
        </Tabs>
      </Paper>

      {/* Yearly PD Report */}
      <TabPanel value={tabValue} index={0}>
        <BaseIfrs9Report
          title="Yearly Lifetime PD"
          description="Probability of Default projections across multi-year horizons based on historical migration and forward-looking factors"
          reportType="lifetime-pd-yearly"
          requiredParams={yearlyRequiredParams}
          optionalParams={yearlyOptionalParams}
          supportsPagination={false}
          supportsCharts={true}
          onDataLoaded={handleYearlyDataLoaded}
        >
          <PDChart data={chartData} type="yearly" />
          <PDPivotTable 
            data={yearlyData} 
            columns={pivotColumns} 
            title="Yearly Marginal PD"
          />
        </BaseIfrs9Report>
      </TabPanel>

      {/* Monthly PD Report */}
      <TabPanel value={tabValue} index={1}>
        <BaseIfrs9Report
          title="Monthly Lifetime PD"
          description="Granular monthly Probability of Default projections reflecting short-term risk dynamics and payment behavior"
          reportType="lifetime-pd-monthly"
          requiredParams={yearlyRequiredParams}
          optionalParams={yearlyOptionalParams}
          supportsPagination={false}
          supportsCharts={true}
          onDataLoaded={handleMonthlyDataLoaded}
        >
          <PDChart data={chartData} type="monthly" />
          <PDPivotTable 
            data={monthlyData} 
            columns={pivotColumns} 
            title="Monthly Marginal PD"
          />
        </BaseIfrs9Report>
      </TabPanel>
    </Box>
  );
};

export default LifetimePDReport;