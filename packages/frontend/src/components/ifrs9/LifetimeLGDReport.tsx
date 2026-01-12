// packages/frontend/src/components/ifrs9/LifetimeLGDReport.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  AccountBalance as BankIcon,
  PieChart as PieIcon
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import BaseIfrs9Report from './BaseIfrs9Report';

const LifetimeLGDReport: React.FC = () => {
  const [summaryStats, setSummaryStats] = useState({
    totalAccounts: 0,
    averageLGD: 0,
    totalRecoveryAmount: 0,
    avgRecoveryRate: 0,
    lgdDistribution: [] as any[]
  });

  const [pivotData, setPivotData] = useState<any[]>([]);
  const [pivotColumns, setPivotColumns] = useState<string[]>([]);

  const handleDataLoaded = (data: any[]) => {
    // Process Pivot Data
    const { pivotData: pData, columns: pCols } = processPivotData(data);
    setPivotData(pData);
    setPivotColumns(pCols);

    if (data && data.length > 0) {
      const stats = data.reduce((acc, row) => {
        acc.totalAccounts += 1;
        acc.totalRecoveryAmount += Number(row.recOs) || 0;
        acc.averageLGD += Number(row.lgdRate) || 0;
        return acc;
      }, {
        totalAccounts: 0,
        averageLGD: 0,
        totalRecoveryAmount: 0,
        avgRecoveryRate: 0,
        lgdDistribution: []
      });

      stats.averageLGD = stats.averageLGD / data.length;

      // Calculate LGD distribution
      const lgdRanges = [
        { range: '0-20%', min: 0, max: 0.2, count: 0, color: '#4CAF50' },
        { range: '21-40%', min: 0.2, max: 0.4, count: 0, color: '#FF9800' },
        { range: '41-60%', min: 0.4, max: 0.6, count: 0, color: '#FF5722' },
        { range: '61-80%', min: 0.6, max: 0.8, count: 0, color: '#F44336' },
        { range: '81-100%', min: 0.8, max: 1.0, count: 0, color: '#9C27B0' }
      ];

      data.forEach(row => {
        const lgd = Number(row.lgdRate) || 0;
        lgdRanges.forEach(range => {
          if (lgd >= range.min && lgd < range.max) {
            range.count += 1;
          }
        });
      });

      stats.lgdDistribution = lgdRanges.filter(range => range.count > 0);
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
              <BankIcon />
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

      {/* Average LGD */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
              <TrendingDownIcon />
            </Avatar>
            <Typography variant="h4" component="div">
              {(summaryStats.averageLGD * 100).toFixed(2)}%
            </Typography>
            <Typography color="text.secondary">
              Average LGD Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Recovery */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
              <AssessmentIcon />
            </Avatar>
            <Typography variant="h6" component="div">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(summaryStats.totalRecoveryAmount)}
            </Typography>
            <Typography color="text.secondary">
              Total Recovery
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* LGD Quality */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
              <PieIcon />
            </Avatar>
            <Typography variant="h6" component="div">
              {summaryStats.averageLGD < 0.3 ? 'Low' :
                summaryStats.averageLGD < 0.6 ? 'Medium' : 'High'}
            </Typography>
            <Typography color="text.secondary">
              LGD Risk Level
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const LGDCharts = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* LGD Distribution Bar Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              LGD Rate Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryStats.lgdDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [value, 'Accounts']}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* LGD Distribution Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              LGD Rate Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryStats.lgdDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count, percent }) =>
                    `${range}: ${count} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {summaryStats.lgdDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Memoize params to prevent infinite loops (loading flicker)
  const requiredParams = React.useMemo(() => ['prc_date'], []);
  const optionalParams = React.useMemo(() => ['lgd_config_id', 'segment_id'], []);

  return (
    <BaseIfrs9Report
      title="Lifetime LGD Report"
      description="Loss Given Default data with recovery information and account-level LGD calculations"
      reportType="lifetime-lgd"
      requiredParams={requiredParams}
      optionalParams={optionalParams}
      supportsPagination={true}
      supportsCharts={true}
      onDataLoaded={handleDataLoaded}
    >
      <SummaryCards />
      <SummaryCards />
      <LGDCharts />

      {/* Pivot Table Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recovery Sequence Analysis (Pivot)
          </Typography>
          <PivotTable
            data={pivotData}
            columns={pivotColumns}
          />
        </CardContent>
      </Card>
    </BaseIfrs9Report>
  );
};

// --- Pivot Components & Logic ---

const processPivotData = (data: any[]) => {
  if (!data || data.length === 0) return { pivotData: [], columns: [] };

  const firstRow = data[0];
  const baseColumns = ['accountId', 'cifName', 'segmentName', 'productType'];

  // Detect dynamic sequence columns (e.g. seq_1, seq_2 or period_1...)
  // Assuming backend returns seq_X for sequences or similar
  // We will look for keys starting with 'seq_' or 'recovery_'
  const dynamicColumns = Object.keys(firstRow).filter(key =>
    key.match(/^(seq|recovery|period)_\d+$/)
  ).sort();

  // If no dynamic columns found, fallback to standard numeric columns excluding base
  const pivotCols = dynamicColumns.length > 0 ? dynamicColumns : Object.keys(firstRow).filter(k => !baseColumns.includes(k) && typeof firstRow[k] === 'number');

  const allColumns = [...baseColumns.filter(k => k in firstRow), ...pivotCols];

  return {
    pivotData: data,
    columns: allColumns
  };
};

const PivotTable = ({ data, columns }: { data: any[], columns: string[] }) => {
  if (!data || data.length === 0) return null;

  const baseColumns = columns.filter(col => !col.match(/^(seq|recovery|period)_\d+$/));
  const dynamicColumns = columns.filter(col => col.match(/^(seq|recovery|period)_\d+$/));

  // Fallback if regex didn't catch anything (standard grid)
  const finalBase = dynamicColumns.length > 0 ? baseColumns : columns;
  const finalDynamic = dynamicColumns.length > 0 ? dynamicColumns : [];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#1976d2', color: 'white' }}>
            <tr>
              {finalBase.map(col => (
                <th key={col} style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  {col.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
              {finalDynamic.map(col => (
                <th key={col} style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd', minWidth: 80 }}>
                  {col.replace(/^(seq|recovery|period)_/, '').toUpperCase()}
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

export default LifetimeLGDReport;