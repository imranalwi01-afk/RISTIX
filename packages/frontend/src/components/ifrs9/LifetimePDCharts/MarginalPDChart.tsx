import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MarginalPDChartProps {
  data: any[];
}

export default function MarginalPDChart({ data }: MarginalPDChartProps) {
  // Mock data if none provided
  const chartData = data?.length > 0 ? data : [
    { year: 'Y1', marginalPD: 0.02 },
    { year: 'Y2', marginalPD: 0.03 },
    { year: 'Y3', marginalPD: 0.035 },
    { year: 'Y4', marginalPD: 0.04 },
    { year: 'Y5', marginalPD: 0.045 },
  ];

  const isComparison = chartData.some(d => d.marginalPDB !== undefined);

  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      height: '100%'
    }}>
      <CardContent sx={{ p: 4, height: '100%' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Marginal PD Structure
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="year" axisLine={false} tickLine={false} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(val) => `${(val * 100).toFixed(1)}%`}
            />
            <Tooltip 
              formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Marginal PD']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
            />
            <Legend />
            <Bar 
              dataKey="marginalPD" 
              name="Marginal PD (Baseline)" 
              fill="#667eea" 
              radius={[4, 4, 0, 0]}
              barSize={isComparison ? 30 : 40}
            />
            {isComparison && (
               <Bar 
                dataKey="marginalPDB" 
                name="Marginal PD (Challenger)" 
                fill="#ec4899" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
