import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface SurvivalChartProps {
  data: any[];
}

export default function SurvivalChart({ data }: SurvivalChartProps) {
  const chartData = data?.length > 0 ? data : [];

  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      height: '100%'
    }}>
      <CardContent sx={{ p: 4, height: '100%' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Survival vs Cumulative PD
        </Typography>
        {chartData.length === 0 ? (
          <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No lifetime PD data available for the selected filters.
            </Typography>
          </Box>
        ) : (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="year" axisLine={false} tickLine={false} />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#00c853" 
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Survival Rate', angle: -90, position: 'insideLeft', fill: '#00c853' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#ff9800" 
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Cumulative PD', angle: 90, position: 'insideRight', fill: '#ff9800' }}
            />
            <Tooltip 
               formatter={(value: number) => [`${(value * 100).toFixed(2)}%`]}
               contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="survival" 
              name="Survival (Baseline)" 
              stroke="#00c853" 
              strokeWidth={3} 
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {chartData.some(d => d.survivalB !== undefined) && (
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="survivalB" 
                name="Survival (Challenger)" 
                stroke="#00c853" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            )}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="cumulativePD" 
              name="Cumulative PD (Baseline)" 
              stroke="#ff9800" 
              strokeWidth={3} 
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {chartData.some(d => d.cumulativePDB !== undefined) && (
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="cumulativePDB" 
                name="Cumulative PD (Challenger)" 
                stroke="#ff9800" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
