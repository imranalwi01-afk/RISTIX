// packages/frontend/src/components/ifrs9/LifetimePDReport.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  TableRow
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LifetimePDReport: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [pivotColumns, setPivotColumns] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Process data for pivot table display
  const processPivotData = useCallback((data: any[], type: 'yearly' | 'monthly') => {
    if (!data || data.length === 0) return { pivotData: [], columns: [], chartData: [] };

    const firstRow = data[0];

    // Check if pivoted (has year_X columns)
    const isPivoted = Object.keys(firstRow).some(key => key.match(/^(year|month)_\d+$/));

    let allColumns: string[] = [];
    let chartDataPoints: any[] = [];

    if (isPivoted) {
      // Updated to use camelCase keys matching new backend joins
      const baseColumns = ['accountId', 'cifName', 'productType', 'segmentName'];

      const periodColumns = Object.keys(firstRow).filter(key =>
        type === 'yearly' ? key.match(/^year_\d+$/) : key.match(/^month_\d+$/)
      ).sort();

      allColumns = [...baseColumns.filter(k => k in firstRow), ...periodColumns];

      // Chart data from first row
      const sampleAccount = data[0];
      chartDataPoints = periodColumns.map(col => ({
        period: col.replace(/^(year|month)_/, ''),
        pd: sampleAccount[col] || 0,
        label: type === 'yearly' ? `Year ${col.replace('year_', '')}` : `Month ${col.replace('month_', '')}`
      }));
    } else {
      // Normalized data (e.g. from frs9ImpCaPdTs)
      // Use available columns from backend
      const potentialBaseColumns = ['pdModelName', 'pdModelId', 'bucketId', 'pdYear', 'pdMonth', 'pdRate'];
      allColumns = potentialBaseColumns.filter(k => k in firstRow);

      // Chart data from mapping rows (limit to first 50 to avoid clutter)
      chartDataPoints = data.slice(0, 50).map(row => ({
        period: row.pdYear || row.pdMonth,
        pd: row.pdRate || 0,
        label: type === 'yearly' ? `Year ${row.pdYear}` : `Month ${row.pdMonth}`
      }));
    }

    return {
      pivotData: data,
      columns: allColumns,
      chartData: chartDataPoints
    };
  }, []);

  // Handle data loaded from yearly report
  const handleYearlyDataLoaded = (data: any[]) => {
    const { pivotData, columns, chartData } = processPivotData(data, 'yearly');
    setYearlyData(pivotData);
    setPivotColumns(columns);
    if (tabValue === 0) {
      setChartData(chartData);
    }
  };

  // Handle data loaded from monthly report
  const handleMonthlyDataLoaded = (data: any[]) => {
    const { pivotData, columns, chartData } = processPivotData(data, 'monthly');
    setMonthlyData(pivotData);
    if (tabValue === 1) {
      setChartData(chartData);
    }
  };

  // Custom pivot table component
  const PivotTable = ({ data, columns, title }: { data: any[], columns: string[], title: string }) => {
    if (!data || data.length === 0) return null;

    const baseColumns = columns.filter(col => !col.match(/^(year|month)_\d+$/));
    const periodColumns = columns.filter(col => col.match(/^(year|month)_\d+$/));

    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          {title} - Pivot View
        </Typography>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {baseColumns.map(col => (
                  <TableCell key={col} sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>
                    {col.replace(/_/g, ' ').toUpperCase()}
                  </TableCell>
                ))}
                {periodColumns.map(col => (
                  <TableCell
                    key={col}
                    align="right"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      minWidth: 80
                    }}
                  >
                    {col.replace(/^(year|month)_/, '').toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, 100).map((row, index) => (
                <TableRow key={row.account_id || index} hover>
                  {baseColumns.map(col => (
                    <TableCell key={col}>
                      {col === 'product_type' ? (
                        <Chip
                          size="small"
                          label={row[col]}
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        row[col] || '-'
                      )}
                    </TableCell>
                  ))}
                  {periodColumns.map(col => (
                    <TableCell key={col} align="right">
                      {row[col] !== null && row[col] !== undefined ? (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: row[col] > 0.1 ? 'bold' : 'normal',
                            color: row[col] > 0.5 ? 'error.main' : 'inherit'
                          }}
                        >
                          {(row[col] * 100).toFixed(4)}%
                        </Typography>
                      ) : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {data.length > 100 && (
          <Alert severity="info" sx={{ m: 2 }}>
            Showing first 100 rows out of {data.length} total records. Use export function to get complete data.
          </Alert>
        )}
      </Paper>
    );
  };

  // Chart component
  const PDChart = ({ data, type }: { data: any[], type: 'yearly' | 'monthly' }) => {
    if (!data || data.length === 0) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lifetime PD Trend - {type === 'yearly' ? 'Yearly' : 'Monthly'} Marginal
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${(value * 100).toFixed(4)}%`, 'PD Rate']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pd"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="PD Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };


  // Memoize params to prevent infinite loops
  const yearlyRequiredParams = React.useMemo(() => ['prc_date'], []);
  const yearlyOptionalParams = React.useMemo(() => ['pd_config_id', 'segment_id', 'fl_flag'], []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lifetime PD Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Probability of Default data with dynamic pivot structure showing marginal PD rates across time periods
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Yearly Marginal PD" />
          <Tab label="Monthly Marginal PD" />
        </Tabs>
      </Box>

      {/* Yearly PD Report */}
      <TabPanel value={tabValue} index={0}>
        <BaseIfrs9Report
          title=""
          reportType="lifetime-pd-yearly"
          requiredParams={yearlyRequiredParams}
          optionalParams={yearlyOptionalParams}
          supportsPagination={false}
          supportsCharts={true}
          onDataLoaded={handleYearlyDataLoaded}
        >
          <Box>
            <PDChart data={chartData} type="yearly" />
            <PivotTable
              data={yearlyData}
              columns={pivotColumns}
              title="Yearly Marginal PD"
            />
          </Box>
        </BaseIfrs9Report>
      </TabPanel>

      {/* Monthly PD Report */}
      <TabPanel value={tabValue} index={1}>
        <BaseIfrs9Report
          title=""
          reportType="lifetime-pd-monthly"
          requiredParams={yearlyRequiredParams}
          optionalParams={yearlyOptionalParams}
          supportsPagination={false}
          supportsCharts={true}
          onDataLoaded={handleMonthlyDataLoaded}
        >
          <Box>
            <PDChart data={chartData} type="monthly" />
            <PivotTable
              data={monthlyData}
              columns={pivotColumns}
              title="Monthly Marginal PD"
            />
          </Box>
        </BaseIfrs9Report>
      </TabPanel>
    </Box>
  );
};

export default LifetimePDReport;