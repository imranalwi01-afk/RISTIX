// packages/frontend/src/components/banking/individual/assessment/ExportDialog.tsx
// ============================================================================
// EXPORT DIALOG COMPONENT FOR INDIVIDUAL ASSESSMENT
// ============================================================================
// Purpose: Provide user-friendly interface for export customization
// Features: Format selection, column picker, filename customization
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormGroup,
  Checkbox,
  Box,
  Typography,
  Alert,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  GridOn as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Description as CsvIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'xlsx' | 'csv' | 'pdf', options: ExportOptions) => void;
  currentFilters?: any;
  totalRecords: number;
}

export interface ExportOptions {
  fileName?: string;
  title?: string;
  columns?: string[];
  includeFilters?: boolean;
}

interface ExportColumn {
  key: string;
  label: string;
  defaultSelected: boolean;
}

// ============================================================================
// AVAILABLE EXPORT COLUMNS
// ============================================================================

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'account_number', label: 'Account Number', defaultSelected: true },
  { key: 'cif_number', label: 'CIF Number', defaultSelected: true },
  { key: 'cif_name', label: 'Customer Name', defaultSelected: true },
  { key: 'currency', label: 'Currency', defaultSelected: true },
  { key: 'outstanding', label: 'Outstanding Balance', defaultSelected: true },
  { key: 'ecl_ia_amt', label: 'ECL Amount', defaultSelected: true },
  { key: 'provision_ia_amt', label: 'Provision Amount', defaultSelected: true },
  { key: 'rating_code', label: 'Rating Code', defaultSelected: true },
  { key: 'dpd', label: 'Days Past Due', defaultSelected: true },
  { key: 'impaired_flag', label: 'Impaired Flag', defaultSelected: true },
  { key: 'method', label: 'Assessment Method', defaultSelected: true },
  { key: 'stage', label: 'Stage', defaultSelected: true },
  { key: 'createddate', label: 'Created Date', defaultSelected: false },
  { key: 'updateddate', label: 'Updated Date', defaultSelected: false }
];

// ============================================================================
// EXPORT DIALOG COMPONENT
// ============================================================================

export default function ExportDialog({
  open,
  onClose,
  onExport,
  currentFilters,
  totalRecords
}: ExportDialogProps) {
  // State
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('IFRS9 Individual Impairment Watchlist');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    EXPORT_COLUMNS.filter(col => col.defaultSelected).map(col => col.key)
  );

  // Generate default filename
  const generateFileName = (ext: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `ifrs9-watchlist-${timestamp}.${ext}`;
  };

  // Handle format change
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFormat = event.target.value as 'xlsx' | 'csv' | 'pdf';
    setFormat(newFormat);
    setFileName(generateFileName(newFormat));
  };

  // Handle column selection
  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnKey)) {
        // Ensure at least one column is selected
        if (prev.length === 1) return prev;
        return prev.filter(key => key !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  // Handle select all columns
  const handleSelectAll = () => {
    if (selectedColumns.length === EXPORT_COLUMNS.length) {
      // Deselect all except first one
      setSelectedColumns([EXPORT_COLUMNS[0].key]);
    } else {
      // Select all
      setSelectedColumns(EXPORT_COLUMNS.map(col => col.key));
    }
  };

  // Handle export
  const handleExport = () => {
    const options: ExportOptions = {
      fileName: fileName || generateFileName(format),
      title,
      columns: selectedColumns,
      includeFilters: true
    };

    onExport(format, options);
    onClose();
  };

  // Reset on close
  const handleClose = () => {
    setFormat('xlsx');
    setFileName('');
    setTitle('IFRS9 Individual Impairment Watchlist');
    setSelectedColumns(EXPORT_COLUMNS.filter(col => col.defaultSelected).map(col => col.key));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" fontWeight="bold">
            Export Watchlist
          </Typography>
          <Button
            size="small"
            onClick={handleClose}
            startIcon={<CloseIcon />}
            sx={{ minWidth: 'auto' }}
          >
            Close
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Customize your export settings and download
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Export Summary */}
          <Alert severity="info" icon={false}>
            <Typography variant="body2">
              <strong>{totalRecords}</strong> records will be exported with current filters
            </Typography>
          </Alert>

          {/* Format Selection */}
          <Box>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                Export Format
              </FormLabel>
              <RadioGroup value={format} onChange={handleFormatChange}>
                <Stack spacing={1}>
                  <FormControlLabel
                    value="xlsx"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <ExcelIcon color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">Excel (XLSX)</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Formatted spreadsheet with filters and styling
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="pdf"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <PdfIcon color="error" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">PDF</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Professional formatted report with summary
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <CsvIcon color="success" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">CSV</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Plain text format compatible with all spreadsheet apps
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Stack>
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider />

          {/* File Details */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              File Details
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Report title"
                size="small"
              />
              <TextField
                fullWidth
                label="File Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={generateFileName(format)}
                helperText={`Leave empty for default: ${generateFileName(format)}`}
                size="small"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Column Selection */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                Columns to Export
              </Typography>
              <Button size="small" onClick={handleSelectAll}>
                {selectedColumns.length === EXPORT_COLUMNS.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Selected: {selectedColumns.length} of {EXPORT_COLUMNS.length} columns
            </Typography>
            <FormGroup sx={{ mt: 1, maxHeight: 200, overflow: 'auto', pl: 1 }}>
              {EXPORT_COLUMNS.map((column) => (
                <FormControlLabel
                  key={column.key}
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => handleColumnToggle(column.key)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {column.label}
                      {!column.defaultSelected && (
                        <Chip label="Optional" size="small" sx={{ ml: 1, height: 16, fontSize: 10 }} />
                      )}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={selectedColumns.length === 0}
          startIcon={
            format === 'xlsx' ? <ExcelIcon /> : format === 'pdf' ? <PdfIcon /> : <CsvIcon />
          }
        >
          Export {format.toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
