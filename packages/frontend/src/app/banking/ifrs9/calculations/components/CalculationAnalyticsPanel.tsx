'use client';

import React, { memo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import type { EclTrendItem, StageDistributionItem } from './types';

interface CalculationAnalyticsPanelProps {
  stageDistributionData: StageDistributionItem[];
  eclTrendData: EclTrendItem[];
}

const CalculationAnalyticsPanel = memo(function CalculationAnalyticsPanel({
  stageDistributionData,
  eclTrendData,
}: CalculationAnalyticsPanelProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Stage Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>ECL Trend by Stage</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eclTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(Number(value))} />
                <RechartsTooltip formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)} />
                <Legend />
                <Line type="monotone" dataKey="stage1" stroke="#4CAF50" name="Stage 1" strokeWidth={2} />
                <Line type="monotone" dataKey="stage2" stroke="#FF9800" name="Stage 2" strokeWidth={2} />
                <Line type="monotone" dataKey="stage3" stroke="#F44336" name="Stage 3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

export default CalculationAnalyticsPanel;
