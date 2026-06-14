'use client';

import React, { memo } from 'react';
import { Box, Typography, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Assessment as AssessmentIcon, TableChart as TableChartIcon, Timeline as TimelineIcon } from '@mui/icons-material';

interface RAnalyticsComprehensiveDetailProps {
  data: any;
}

export const RAnalyticsComprehensiveDetail = memo(function RAnalyticsComprehensiveDetail({ data }: RAnalyticsComprehensiveDetailProps) {
  const payload = data || {};
  
  // Fallback to root level if nested objects don't exist (this matches our actual payload shape)
  const modelPhase = payload.model_phase || {
    r_squared: payload.r_squared || payload.rSquared,
    mape_insample: payload.mape,
    formula: payload.model_name || payload.modelName || 'N/A'
  };
  
  const forecastPhase = payload.forecast_phase || {};
  const pdaflPhase = payload.pdafl_phase || {};
  const pdSummaryTable = pdaflPhase.pd_summary_table || [];

  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'info.light', borderRadius: 2, bgcolor: alpha('#0288d1', 0.03) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AssessmentIcon color="info" />
        <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
          R Analytics Comprehensive Results
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
               <TimelineIcon fontSize="small" color="primary" />
               <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Modeling Phase</Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">Model / Formula</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontFamily: 'monospace', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
              {modelPhase.formula || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">R-Squared (R²)</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>{modelPhase.r_squared ? Number(modelPhase.r_squared).toFixed(4) : 'N/A'}</Typography>
            <Typography variant="caption" color="text.secondary">MAPE In-Sample</Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>{modelPhase.mape_insample ? `${Number(modelPhase.mape_insample).toFixed(4)}%` : 'N/A'}</Typography>
            {payload.snapshot_date && (
              <>
                <Typography variant="caption" color="text.secondary">Snapshot Date</Typography>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>{new Date(payload.snapshot_date).toLocaleString()}</Typography>
              </>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
               <AssessmentIcon fontSize="small" color="secondary" />
               <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Forecast Phase</Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">Method Applied</Typography>
            <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 500 }}>{forecastPhase.method || 'N/A'}</Typography>
            <Typography variant="caption" color="text.secondary">Horizon Years</Typography>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>{forecastPhase.horizon_years || 'N/A'} Years</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
               <TableChartIcon fontSize="small" color="success" />
               <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>PD-AFL Calculation</Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">Scenario Weights (Base / Best / Worst)</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
              {pdaflPhase.weights?.base ? `${pdaflPhase.weights.base * 100}%` : '-'} / {' '}
              {pdaflPhase.weights?.best ? `${pdaflPhase.weights.best * 100}%` : '-'} / {' '}
              {pdaflPhase.weights?.worst ? `${pdaflPhase.weights.worst * 100}%` : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">PD Floor</Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {pdaflPhase.pd_floor ? `${(pdaflPhase.pd_floor * 100).toFixed(4)}%` : 'N/A'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {pdSummaryTable.length > 0 && (
        <Box sx={{ mt: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
           <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>PD Summary Table</Typography>
           <TableContainer>
             <Table size="small">
               <TableHead>
                 <TableRow sx={{ bgcolor: 'grey.50' }}>
                   <TableCell><strong>Year</strong></TableCell>
                   <TableCell align="right"><strong>Marginal PD</strong></TableCell>
                   <TableCell align="right"><strong>Cumulative PD</strong></TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {pdSummaryTable.map((row: any, i: number) => (
                   <TableRow key={i}>
                     <TableCell>Year {row.year || i + 1}</TableCell>
                     <TableCell align="right">{(row.marginal * 100).toFixed(4)}%</TableCell>
                     <TableCell align="right">{(row.cumulative * 100).toFixed(4)}%</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
        </Box>
      )}
    </Box>
  );
});
