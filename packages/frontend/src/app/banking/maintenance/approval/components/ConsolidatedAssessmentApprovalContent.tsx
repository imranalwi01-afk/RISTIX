import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack,
  Avatar,
  alpha,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DescriptionIcon,
  MonetizationOn as MonetizationOnIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';

interface ConsolidatedAssessmentApprovalContentProps {
  data: any;
  formatDate: (date: string) => string;
}

export const ConsolidatedAssessmentApprovalContent: React.FC<ConsolidatedAssessmentApprovalContentProps> = ({ 
  data, 
  formatDate 
}) => {
  const theme = useTheme();

  if (!data) return null;

  const results = data.results || {};
  const cashflows = data.cashflows || [];
  
  const handleDownload = (fileName: string) => {
    if (!fileName) return;
    const url = `/api/v1/individual-impairment/overrides/documents/${fileName}`;
    window.open(url, '_blank');
  };

  const getStageColor = (stage: number | string) => {
    const s = Number(stage);
    if (s === 1) return theme.palette.success.main;
    if (s === 2) return theme.palette.warning.main;
    if (s === 3) return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 2 }}>
      {/* Customer & Basic Info */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Customer Information</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{data.cifName || 'N/A'}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">CIF Number:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.cifNumber || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Account Number:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.accountNumber || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Outstanding:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {results.outstanding?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Proposed Assessment Change</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Stage Adjustment</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, py: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Current Stage</Typography>
                  <Chip 
                    label={`Stage ${data.originalStage || '-'}`} 
                    size="small"
                    sx={{ bgcolor: alpha(getStageColor(data.originalStage), 0.1), color: getStageColor(data.originalStage), fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="h4" color="text.secondary">→</Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Proposed Stage</Typography>
                  <Chip 
                    label={`Stage ${data.overrideStage || '-'}`} 
                    variant="filled"
                    sx={{ bgcolor: getStageColor(data.overrideStage), color: '#fff', fontWeight: 700, px: 1 }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Justification:</Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                  "{data.justification || 'No justification provided.'}"
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DCF Results Summary */}
      {results && results.presentValue !== undefined && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MonetizationOnIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>DCF Calculation Results</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>NPV (PRESENT VALUE)</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {results.presentValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 2 }}>
                  <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>IMPAIRMENT LOSS (LGD)</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {results.lgd?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="caption" color="success" sx={{ fontWeight: 700 }}>RECOMMENDED PROVISION</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {results.recommendedProvision?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Documents & Files */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FileIcon color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Attachments & Source Files</Typography>
          </Box>
          <Grid container spacing={2}>
            {data.supportingDocument && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2">Adjustment Document</Typography>
                    <Typography variant="caption" color="text.secondary">{data.supportingDocument}</Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(data.supportingDocument)}
                  >
                    Download
                  </Button>
                </Box>
              </Grid>
            )}
            {data.fileName && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2">DCF Source File</Typography>
                    <Typography variant="caption" color="text.secondary">{data.fileName}</Typography>
                  </Box>
                  {/* Note: In a real system, we might need a different way to download the raw DCF file if it wasn't saved as an override doc */}
                  <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'info.main' }}>
                    Calculated from uploaded data
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Cashflow Preview Table */}
      {cashflows && cashflows.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }} align="right">Principal</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }} align="right">Interest</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }} align="right">Collateral</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }} align="right">PV Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashflows.slice(0, 12).map((cf: any, index: number) => (
                <TableRow key={index} hover>
                  <TableCell>{cf.period ? formatDate(cf.period) : (cf.periode ? formatDate(cf.periode) : `Period ${index + 1}`)}</TableCell>
                  <TableCell align="right">{Number(cf.principal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right">{Number(cf.interest || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right">{Number(cf.collateral || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {Number(cf.pvAmt || cf.pv || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
              {cashflows.length > 12 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ fontStyle: 'italic', color: 'text.secondary', py: 1 }}>
                    Showing first 12 of {cashflows.length} rows. Full calculation available in Assessment Workspace.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
