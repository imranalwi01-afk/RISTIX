// Ifrs9ReportDebugPanel.tsx – Admin debug toggle and query debug accordion
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { alpha } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ReportDebugMetadata, ThemeStyles } from './types'

interface Ifrs9ReportDebugPanelProps {
  canManageReportDebug: boolean;
  reportDebugEnabled: boolean;
  reportDebugLoading: boolean;
  reportDebugSaving: boolean;
  onToggleReportDebug: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  debugMeta: ReportDebugMetadata | null;
  title: string;
  dataLength: number;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportDebugPanel: React.FC<Ifrs9ReportDebugPanelProps> = ({
  canManageReportDebug,
  reportDebugEnabled,
  reportDebugLoading,
  reportDebugSaving,
  onToggleReportDebug,
  debugMeta,
  title,
  dataLength,
  themeStyles,
}) => {
  const debugReportTitle = String(debugMeta?.reportTitle || title);
  const debugRowCount = String(debugMeta?.rowCount ?? dataLength);
  const debugSourceTables = Array.isArray(debugMeta?.sourceTables) ? debugMeta.sourceTables : [];
  const debugFiltersApplied = (debugMeta?.filtersApplied as Record<string, unknown>) || {};
  const debugJoins = Array.isArray(debugMeta?.joins) ? debugMeta.joins : [];
  const debugEmptyReason = debugMeta?.emptyReason ? String(debugMeta.emptyReason) : '';
  const debugSqlPreview = debugMeta?.sqlPreview ? String(debugMeta.sqlPreview) : '';

  return (
    <>
      {canManageReportDebug && (
        <Card sx={{ mb: 2, borderRadius: 3, border: `1px solid ${alpha(themeStyles.primary, 0.15)}` }}>
          <CardContent sx={{ py: 2.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Admin Debug Options
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Global DB toggle for exposing source tables and query metadata in IFRS 9 report UI.
                </Typography>
              </Box>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={reportDebugEnabled}
                    onChange={onToggleReportDebug}
                    disabled={reportDebugLoading || reportDebugSaving}
                    color="primary"
                  />
                }
                label={reportDebugSaving ? 'Saving...' : reportDebugEnabled ? 'Debug ON' : 'Debug OFF'}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {debugMeta && (
        <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography fontWeight={700}>Report Query Debug</Typography>
              <Typography variant="body2" color="text.secondary">
                {debugReportTitle} · {debugRowCount} rows
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Source Tables</Typography>
                <List dense disablePadding>
                  {debugSourceTables.map((table) => (
                    <ListItem key={table} disableGutters sx={{ py: 0.25 }}>
                      <ListItemText primary={table} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Applied Filters</Typography>
                <List dense disablePadding>
                  {Object.entries(debugFiltersApplied).map(([key, value]) => (
                    <ListItem key={key} disableGutters sx={{ py: 0.25 }}>
                      <ListItemText primary={key} secondary={Array.isArray(value) ? value.join(', ') : String(value)} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              {debugJoins.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Join Path</Typography>
                  <List dense disablePadding>
                    {debugJoins.map((joinPath) => (
                      <ListItem key={joinPath} disableGutters sx={{ py: 0.25 }}>
                        <ListItemText primary={joinPath} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
              {debugEmptyReason && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="warning">{debugEmptyReason}</Alert>
                </Grid>
              )}
              {debugSqlPreview && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Query Preview</Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(themeStyles.primary, 0.04),
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.8rem',
                      overflowX: 'auto',
                    }}
                  >
                    {debugSqlPreview}
                  </Box>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default React.memo(Ifrs9ReportDebugPanel);
