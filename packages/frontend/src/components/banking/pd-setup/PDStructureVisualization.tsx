import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  useTheme,
  alpha
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

interface PDStructureData {
  bucket_id: string;
  fl_year: number;
  fl_seq: number;
  pd: number;
  pd_non_fl: number;
  prc_date: string;
}

interface PDStructureVisualizationProps {
  data: PDStructureData[];
  title?: string;
}

export const PDStructureVisualization: React.FC<PDStructureVisualizationProps> = ({ 
  data, 
  title = 'Marginal PD Structure' 
}) => {
  const theme = useTheme();

  // Sort and transform data for Recharts
  const sortedData = [...data].sort((a, b) => {
    if (a.fl_year !== b.fl_year) return a.fl_year - b.fl_year;
    return a.fl_seq - b.fl_seq;
  });

  const chartData = sortedData.map((d, index) => ({
    label: `Y${d.fl_year}-P${d.fl_seq}`,
    pd: d.pd,
    pd_non_fl: d.pd_non_fl,
    index
  }));

  if (data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No structure data available for this configuration.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="label" 
            angle={-45} 
            textAnchor="end" 
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => `${(val * 100).toFixed(1)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ 
              borderRadius: 12, 
              border: 'none', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(4)}%`]}
          />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar 
            name="PD (FL Adjusted)" 
            dataKey="pd" 
            fill={theme.palette.primary.main} 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            name="PD (Non-FL)" 
            dataKey="pd_non_fl" 
            fill={alpha(theme.palette.primary.light, 0.4)} 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface FLScalarDetail {
  pkid: number;
  scalar_id: number;
  period: number;
  weighted_scalar: number;
}

interface FLScalarVisualizationProps {
  details: FLScalarDetail[];
  title?: string;
}

export const FLScalarVisualization: React.FC<FLScalarVisualizationProps> = ({
  details,
  title = 'FL Scalar Weights'
}) => {
  const theme = useTheme();

  const chartData = [...details]
    .sort((a, b) => a.period - b.period)
    .map(d => ({
      period: `P${d.period}`,
      weight: d.weighted_scalar
    }));

  if (details.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No scalar details available.</Typography>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ 
              borderRadius: 12, 
              border: 'none', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            name="Scalar Weight" 
            stroke={theme.palette.secondary.main} 
            strokeWidth={3}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
