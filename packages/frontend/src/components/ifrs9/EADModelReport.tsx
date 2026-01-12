// packages/frontend/src/components/ifrs9/EADModelReport.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BalanceIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import {
  LineChart,
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
import BaseIfrs9Report from './BaseIfrs9Report';

const EADModelReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState({
    totalAccounts: 0,
    avgEAD: 0,
    avgCCF: 0,
    avgUtilization: 0,
    eadTrend: [] as any[],
    productDistribution: [] as any[]
  });

  const [pivotData, setPivotData] = useState<any[]>([]);
  const [pivotColumns, setPivotColumns] = useState<string[]>([]);

  const handleDataLoaded = (data: any[]) => {
    // Process Pivot
    const { pivotData: pData, columns: pCols } = processEADPivotData(data);
    setPivotData(pData);
    setPivotColumns(pCols);

    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        const ead = Number(row.outstanding) || 0;
        const plafond = Number(row.plafond) || 0;
        const utilization = plafond > 0 ? ead / plafond : 0;

        acc.totalAccounts += 1;
        acc.avgEAD += ead;
        acc.avgCCF += 0; // Not available in result
        acc.avgUtilization += utilization;
        return acc;
      }, {
        totalAccounts: 0,
        avgEAD: 0,
        avgCCF: 0,
        avgUtilization: 0,
        eadTrend: [],
        productDistribution: []
      });

      stats.avgEAD = stats.avgEAD / data.length;
      stats.avgCCF = stats.avgCCF / data.length;
      stats.avgUtilization = stats.avgUtilization / data.length;

      // Create trend data (sample - would be from time series data)
      // Create trend data (sample - would be from time series data)
      const trendData = data.slice(0, 12).map((row, index) => {
        const ead = Number(row.outstanding) || 0;
        const plafond = Number(row.plafond) || 0;
        return {
          month: `M${index + 1}`,
          ead: ead,
          ccf: 0,
          utilization: plafond > 0 ? ead / plafond : 0
        };
      });

      // Product distribution
      const productMap = new Map();
      data.forEach(row => {
        const product = row.product_type || 'Unknown';
        if (productMap.has(product)) {
          productMap.set(product, productMap.get(product) + 1);
        } else {
          productMap.set(product, 1);
        }
      });

      const productDist = Array.from(productMap.entries()).map(([product, count]) => ({
        product,
        count,
        percentage: (count / data.length) * 100
      }));

      stats.eadTrend = trendData;
      stats.productDistribution = productDist;
      setSummaryStats(stats);
    }
  };

  const SummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Total Accounts */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
              <BalanceIcon />
            </Avatar>
            <Typography variant="h4" component="div">
              {summaryStats.totalAccounts.toLocaleString('id-ID')}
            </Typography>
            <Typography color="text.secondary">
              Total Accounts
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Average EAD */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
              <TrendingUpIcon />
            </Avatar>
            <Typography variant="h6" component="div">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.avgEAD)}
            </Typography>
            <Typography color="text.secondary">
              Average EAD
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Average CCF */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
              <AnalyticsIcon />
            </Avatar>
            <Typography variant="h4" component="div">
              {(summaryStats.avgCCF * 100).toFixed(2)}%
            </Typography>
            <Typography color="text.secondary">
              Average CCF
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Average Utilization */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
              <TimelineIcon />
            </Avatar>
            <Typography variant="h4" component="div">
              {(summaryStats.avgUtilization * 100).toFixed(2)}%
            </Typography>
            <Typography color="text.secondary">
              Avg Utilization
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const EADCharts = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* EAD Trend */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              EAD Model Trend Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={summaryStats.eadTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'ead') {
                      return [new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        notation: 'compact'
                      }).format(value), 'EAD Amount'];
                    }
                    return [`${(value * 100).toFixed(2)}%`, name.toUpperCase()];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ead"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="EAD Amount"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ccf"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="CCF Rate"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="utilization"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Utilization Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Product Distribution */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Product Distribution
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Product Type</strong></TableCell>
                    <TableCell align="right"><strong>Count</strong></TableCell>
                    <TableCell align="right"><strong>%</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryStats.productDistribution.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.product}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {row.count.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell align="right">
                        {row.percentage.toFixed(1)}%
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

  const ModelParametersCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          EAD Model Key Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4">
                {(summaryStats.avgCCF * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2">
                Credit Conversion Factor
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h4">
                {(summaryStats.avgUtilization * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2">
                Current Utilization Rate
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h6">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(summaryStats.avgEAD)}
              </Typography>
              <Typography variant="body2">
                Average Exposure at Default
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Memoize params to prevent infinite loops (loading flicker)
  const requiredParams = React.useMemo(() => ['prc_date'], []);
  const optionalParams = React.useMemo(() => ['ead_config_id', 'segment_id'], []);

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
      <SummaryCards />
      <ModelParametersCard />
      <SummaryCards />
      <ModelParametersCard />
      <EADCharts />

      {/* Pivot Table Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
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

// --- Pivot Components & Logic ---

const processEADPivotData = (data: any[]) => {
  if (!data || data.length === 0) return { pivotData: [], columns: [] };

  const firstRow = data[0];
  const baseColumns = ['accountId', 'cifName', 'segmentId', 'tenor'];

  // For EAD, we might want payment averages across sequences or time buckets
  // Regex for tenor_X or month_X columns
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

const EADPivotTable = ({ data, columns }: { data: any[], columns: string[] }) => {
  if (!data || data.length === 0) return null;

  const baseColumns = columns.filter(col => !col.match(/^(tenor|month|paym)_\d+$/));
  const dynamicColumns = columns.filter(col => col.match(/^(tenor|month|paym)_\d+$/));

  const finalBase = dynamicColumns.length > 0 ? baseColumns : columns;
  const finalDynamic = dynamicColumns.length > 0 ? dynamicColumns : [];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#2e7d32', color: 'white' }}>
            <tr>
              {finalBase.map(col => (
                <th key={col} style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  {col.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
              {finalDynamic.map(col => (
                <th key={col} style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd', minWidth: 80 }}>
                  {col.replace(/^(tenor|month|paym)_/, '').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 100).map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                {finalBase.map(col => (
                  <td key={col} style={{ padding: '8px' }}>
                    {row[col] || '-'}
                  </td>
                ))}
                {finalDynamic.map(col => (
                  <td key={col} style={{ padding: '8px', textAlign: 'right' }}>
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
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          Showing first 100 rows. Export to see full data.
        </Typography>
      )}
    </Box>
  );
};

export default EADModelReport;