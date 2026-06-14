'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Calculate as CalculateIcon, Close as CloseIcon } from '@mui/icons-material';
import { PDStructureVisualization, FLScalarVisualization } from '@/components/banking/pd-setup/PDStructureVisualization';
import { PDConfigUI } from '../types';

interface PDResultsDialogProps {
  open: boolean;
  loading: boolean;
  selectedConfig: PDConfigUI | null;
  pdStructure: any[];
  scalarDetails: any[];
  onClose: () => void;
}

export const PDResultsDialog = memo(function PDResultsDialog({
  open,
  loading,
  selectedConfig,
  pdStructure,
  scalarDetails,
  onClose,
}: PDResultsDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" component="div" fontWeight={700}>
            PD Configuration Results
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Viewing results for: {selectedConfig?.model_name}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <PDStructureVisualization data={pdStructure} />
              </Paper>
            </Grid>

            {selectedConfig?.fl_flag && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <FLScalarVisualization details={scalarDetails} />
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={() => {
            alert('Re-calculation triggered (Demonstration)');
          }}
        >
          Re-calculate
        </Button>
      </DialogActions>
    </Dialog>
  );
});
