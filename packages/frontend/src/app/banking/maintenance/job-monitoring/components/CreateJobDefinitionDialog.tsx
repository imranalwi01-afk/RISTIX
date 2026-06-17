'use client';

import React, { memo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { CreateJobForm } from '../types';

interface CreateJobDefinitionDialogProps {
  open: boolean;
  loading: boolean;
  jobData: CreateJobForm;
  disabled: boolean;
  title?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
  onChange: React.Dispatch<React.SetStateAction<CreateJobForm>>;
}

export const CreateJobDefinitionDialog = memo(function CreateJobDefinitionDialog({
  open,
  loading,
  jobData,
  disabled,
  title = 'Create New Job Definition',
  submitLabel = 'Create',
  onClose,
  onSubmit,
  onChange,
}: CreateJobDefinitionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Job Name"
              value={jobData.name}
              onChange={(e) => onChange({ ...jobData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              value={jobData.description || ''}
              onChange={(e) => onChange({ ...jobData, description: e.target.value })}
              multiline
              minRows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Schema Name"
              placeholder="e.g. core, risk, public"
              value={jobData.schemaName || ''}
              onChange={(e) => onChange({ ...jobData, schemaName: e.target.value })}
              helperText="Database schema (optional, defaults to public/core)"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Stored Procedure Name"
              placeholder="e.g. sp_frs9_imp_sequence"
              value={jobData.procedureName || ''}
              onChange={(e) => onChange({ ...jobData, procedureName: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={jobData.priority}
                label="Priority"
                onChange={(e) => onChange({ ...jobData, priority: e.target.value })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Max Retries"
              type="number"
              value={jobData.maxRetries}
              onChange={(e) => onChange({ ...jobData, maxRetries: parseInt(e.target.value) || 0 })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Timeout (seconds)"
              type="number"
              value={jobData.timeout}
              onChange={(e) => onChange({ ...jobData, timeout: parseInt(e.target.value) || 0 })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={jobData.isEnabled} onChange={(e) => onChange({ ...jobData, isEnabled: e.target.checked })} />}
              label="Enabled"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={disabled || loading}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
