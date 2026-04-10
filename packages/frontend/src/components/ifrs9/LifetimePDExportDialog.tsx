import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

interface LifetimePDExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: any) => void;
}

export default function LifetimePDExportDialog({ open, onClose, onExport }: LifetimePDExportDialogProps) {
  const [format, setFormat] = React.useState('xlsx');
  const [scope, setScope] = React.useState({
    summary: true,
    bySegment: true,
    fullAccount: false,
    charts: true
  });

  const handleScopeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScope({
      ...scope,
      [event.target.name]: event.target.checked
    });
  };

  const handleExport = () => {
    onExport({ format, scope });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={700}>Export Report Results</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the data scope and file format for your export. Both include the standard audit header.
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
            FILE FORMAT
          </FormLabel>
          <ToggleButtonGroup
            value={format}
            exclusive
            onChange={(_, next) => next && setFormat(next)}
            size="small"
            sx={{ mt: 0.5 }}
          >
            <ToggleButton value="xlsx" sx={{ fontWeight: 700, textTransform: 'none' }}>
              XLSX
            </ToggleButton>
            <ToggleButton value="csv" sx={{ fontWeight: 700, textTransform: 'none' }}>
              CSV
            </ToggleButton>
            <ToggleButton value="pdf" sx={{ fontWeight: 700, textTransform: 'none' }}>
              PDF
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
            EXPORT SCOPE
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={scope.summary} onChange={handleScopeChange} name="summary" />}
              label="Executive Summary (KPIs)"
            />
            <FormControlLabel
              control={<Checkbox checked={scope.bySegment} onChange={handleScopeChange} name="bySegment" />}
              label="Segment Breakdown"
            />
            <FormControlLabel
              control={<Checkbox checked={scope.fullAccount} onChange={handleScopeChange} name="fullAccount" />}
              label="Full Account Details (Heavy)"
            />
            <FormControlLabel
              control={<Checkbox checked={scope.charts} onChange={handleScopeChange} name="charts" />}
              label="Include Visualization Charts"
            />
          </FormGroup>
        </FormControl>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            * Header includes: Processing Date, Segments, PD Config/Method, Model Version, and User ID for auditability.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleExport}
          disabled={!Object.values(scope).some(v => v)}
        >
          Download Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
