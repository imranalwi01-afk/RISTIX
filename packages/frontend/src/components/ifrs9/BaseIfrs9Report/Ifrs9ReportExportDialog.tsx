// Ifrs9ReportExportDialog.tsx – Export dialog with format/scope options
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { alpha } from '@mui/material/styles'
import InfoIcon from '@mui/icons-material/Info'
import {
  DatePicker,
} from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField'
import type { ThemeStyles } from './types'

export interface ExportOptions {
  scope: string;
  format: string;
  fromDate: Date | null;
  toDate: Date | null;
}

interface Ifrs9ReportExportDialogProps {
  open: boolean;
  onClose: () => void;
  exportOptions: ExportOptions;
  onExportOptionsChange: (updater: (prev: ExportOptions) => ExportOptions) => void;
  onExecute: () => void;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportExportDialog: React.FC<Ifrs9ReportExportDialogProps> = ({
  open,
  onClose,
  exportOptions,
  onExportOptionsChange,
  onExecute,
  themeStyles,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 800, bgcolor: alpha(themeStyles.primary, 0.03) }}>
      Export Report
    </DialogTitle>
    <DialogContent sx={{ mt: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="export-scope-label">Data</InputLabel>
        <Select
          labelId="export-scope-label"
          label="Data"
          value={exportOptions.scope}
          onChange={(e) => onExportOptionsChange(prev => ({ ...prev, scope: String(e.target.value) }))}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          <MenuItem value="visible">Visible data</MenuItem>
          <MenuItem value="by_date">By date</MenuItem>
          <MenuItem value="date_range">Date range</MenuItem>
          <MenuItem value="all_pages">All (all pages for selected date)</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mt: 3 }}>
        <InputLabel id="export-format-label">Format</InputLabel>
        <Select
          labelId="export-format-label"
          label="Format"
          value={exportOptions.format}
          onChange={(e) => onExportOptionsChange(prev => ({ ...prev, format: String(e.target.value) }))}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
          <MenuItem value="csv">CSV (.csv)</MenuItem>
          <MenuItem value="pdf">PDF (.pdf)</MenuItem>
        </Select>
      </FormControl>

      {exportOptions.scope === 'date_range' && (
        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <DatePicker
            label="From"
            value={exportOptions.fromDate}
            onChange={(date: unknown) => {
              const finalDate = date && (date as { toDate?: () => Date }).toDate
                ? (date as { toDate: () => Date }).toDate()
                : (date as Date | null);
              onExportOptionsChange(prev => ({ ...prev, fromDate: finalDate }));
            }}
            enableAccessibleFieldDOMStructure={false}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
              }
            }}
          />
          <DatePicker
            label="To"
            value={exportOptions.toDate}
            onChange={(date: unknown) => {
              const finalDate = date && (date as { toDate?: () => Date }).toDate
                ? (date as { toDate: () => Date }).toDate()
                : (date as Date | null);
              onExportOptionsChange(prev => ({ ...prev, toDate: finalDate }));
            }}
            enableAccessibleFieldDOMStructure={false}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
              }
            }}
          />
        </Box>
      )}

      <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText', display: 'flex', gap: 1.5 }}>
        <InfoIcon />
        <Typography variant="caption" fontWeight={600}>
          Export will include Audit Header (T1) and calculation metadata.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
      <Button
        variant="contained"
        onClick={onExecute}
        sx={{
          background: themeStyles.gradient,
          fontWeight: 700,
          borderRadius: 2
        }}
      >
        Start Export
      </Button>
    </DialogActions>
  </Dialog>
);

export default React.memo(Ifrs9ReportExportDialog);
