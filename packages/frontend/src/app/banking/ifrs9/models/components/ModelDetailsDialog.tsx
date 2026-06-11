'use client';

import React, { memo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import type { ModelRecord } from './types';

interface ModelDetailsDialogProps {
  open: boolean;
  modelType: string;
  selectedModel: ModelRecord | null;
  onClose: () => void;
  onEdit: (model: ModelRecord) => void;
}

const getStatusLabel = (status: boolean) => (status ? 'Active' : 'Inactive');

const ModelDetailsDialog = memo(function ModelDetailsDialog({
  open,
  modelType,
  selectedModel,
  onClose,
  onEdit,
}: ModelDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{modelType} Model Details</DialogTitle>
      <DialogContent>
        {selectedModel && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Model Name" value={selectedModel.model_name || selectedModel.name || ''} disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Segment ID" value={selectedModel.segment_id || 'All'} disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Method"
                value={selectedModel.selected_method || selectedModel.lgd_method || selectedModel.ead_method || 'N/A'}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Status" value={getStatusLabel(Boolean(selectedModel.active_flag || selectedModel.isActive))} disabled />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Effective Date" value={selectedModel.effective_date || new Date().toLocaleDateString()} disabled />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => selectedModel && onEdit(selectedModel)}>
          Edit Model
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ModelDetailsDialog;
