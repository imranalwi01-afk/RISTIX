'use client';

import React, { memo } from 'react';
import { Box, Typography, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Assessment as AssessmentIcon, TableChart as TableChartIcon, Timeline as TimelineIcon, Download as DownloadIcon } from '@mui/icons-material';
import { api } from '@/services/api';

interface RAnalyticsComprehensiveDetailProps {
  data: any;
  hideDownloadButton?: boolean;
}

export const RAnalyticsComprehensiveDetail = memo(function RAnalyticsComprehensiveDetail({ data, hideDownloadButton }: RAnalyticsComprehensiveDetailProps) {
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

  const r2 = Number(modelPhase.r_squared || 0);
  const mape = Number(modelPhase.mape_insample || 0);

  const getR2Interpretation = (val: number) => {
    if (!val) return { text: 'N/A', color: 'text.secondary' };
    if (val >= 0.7) return { text: 'Strong Fit', color: 'success.main' };
    if (val >= 0.4) return { text: 'Moderate Fit', color: 'warning.main' };
    return { text: 'Weak Fit', color: 'error.main' };
  };

  const getMapeInterpretation = (val: number) => {
    if (!val) return { text: 'N/A', color: 'text.secondary' };
    if (val <= 10) return { text: 'Highly Accurate', color: 'success.main' };
    if (val <= 20) return { text: 'Good Forecasting', color: 'info.main' };
    if (val <= 50) return { text: 'Reasonable', color: 'warning.main' };
    return { text: 'Inaccurate', color: 'error.main' };
  };

  const r2Interpret = getR2Interpretation(r2);
  const mapeInterpret = getMapeInterpretation(mape);

  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'info.light', borderRadius: 2, bgcolor: alpha('#0288d1', 0.03) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="info" />
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
            R Analytics Comprehensive Results
          </Typography>
        </Box>
        {!hideDownloadButton && payload.id && (
          <Button
            variant="contained"
            color="info"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const baseUrl = api.client.defaults.baseURL || '/api/v1';
              const fullUrl = baseUrl.startsWith('http') ? baseUrl : `${window.location.origin}${baseUrl}`;
              window.open(`${fullUrl}/r-analytics/pd-afl-history/${payload.id}/download`, '_blank', 'noopener,noreferrer');
            }}
          >
            Download Excel Result
          </Button>
        )}
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
               <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Model Quality Assessment</Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            
            <Typography variant="caption" color="text.secondary">R-Squared Interpretation</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: r2Interpret.color }}>
                {r2Interpret.text}
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">MAPE Interpretation</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: mapeInterpret.color }}>
                {mapeInterpret.text}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary">Overall Recommendation</Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: (r2 >= 0.4 && mape <= 50) ? 'success.main' : 'error.main' }}>
              {(r2 >= 0.4 && mape <= 50) ? 'Acceptable for Calibration' : 'Requires Model Tuning'}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
               <TableChartIcon fontSize="small" color="success" />
               <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Execution Details</Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">Calculation Engine</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>R-Script Runtime v4.2</Typography>
            
            <Typography variant="caption" color="text.secondary">Output Artifact</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>Excel Binary (.xlsx)</Typography>

            <Typography variant="caption" color="text.secondary">Data Persistence</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, fontFamily: 'monospace' }}>frs9_r_pd_afl</Typography>

            <Typography variant="caption" color="text.secondary">Source Module</Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Macroeconomic & NPL Data</Typography>
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
