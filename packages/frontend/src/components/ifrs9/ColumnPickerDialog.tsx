// packages/frontend/src/components/ifrs9/ColumnPickerDialog.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  ViewColumn as ColumnIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean; // Cannot be hidden
}

interface ColumnPickerDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onApply: (columns: ColumnConfig[]) => void;
}

const ColumnPickerDialog: React.FC<ColumnPickerDialogProps> = ({
  open,
  onClose,
  columns,
  onApply
}) => {
  const [selectedColumns, setSelectedColumns] = useState<ColumnConfig[]>(columns);

  const handleToggle = (key: string) => {
    setSelectedColumns(prev =>
      prev.map(col =>
        col.key === key && !col.required
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(prev =>
      prev.map(col => ({ ...col, visible: true }))
    );
  };

  const handleDeselectAll = () => {
    setSelectedColumns(prev =>
      prev.map(col =>
        col.required ? col : { ...col, visible: false }
      )
    );
  };

  const handleReset = () => {
    setSelectedColumns(columns);
  };

  const handleApply = () => {
    onApply(selectedColumns);
    onClose();
  };

  const visibleCount = selectedColumns.filter(col => col.visible).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="column-picker-dialog-title">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ColumnIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" id="column-picker-dialog-title">Column Visibility</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close column picker">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {visibleCount} of {columns.length} columns visible
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="small" variant="outlined" onClick={handleDeselectAll}>
            Deselect All
          </Button>
          <Button size="small" variant="outlined" startIcon={<ResetIcon />} onClick={handleReset}>
            Reset
          </Button>
        </Box>

        <FormGroup>
          {selectedColumns.map((col) => (
            <Box
              key={col.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={col.visible}
                    onChange={() => handleToggle(col.key)}
                    disabled={col.required}
                  />
                }
                label={col.label}
              />
              {col.required && (
                <Chip label="Required" size="small" color="primary" variant="outlined" />
              )}
            </Box>
          ))}
        </FormGroup>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnPickerDialog;
