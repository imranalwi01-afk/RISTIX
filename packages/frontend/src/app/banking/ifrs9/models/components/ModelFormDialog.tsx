'use client';

import React, { memo } from 'react';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, TextField } from '@mui/material';
import type { ModelRecord } from './types';

interface ModelFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  modelType: string;
  activeTab: number;
  model: ModelRecord | null;
  onClose: () => void;
  onSave: (data: Record<string, FormDataEntryValue>) => void;
}

function renderTabFields(activeTab: number, model: ModelRecord | null) {
  if (activeTab === 0) {
    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Selected Method" name="selected_method" type="number" defaultValue={model?.selected_method || '1'} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Migration Interval" name="migration_interval" type="number" defaultValue={model?.migration_interval || '12'} />
        </Grid>
        {model ? null : (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Population Type" name="population_type" type="number" defaultValue="2" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Historical Months" name="historical_month" type="number" defaultValue="24" />
            </Grid>
          </>
        )}
      </>
    );
  }

  if (activeTab === 1) {
    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="LGD Method" name="lgd_method" type="number" defaultValue={model?.lgd_method || '1'} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Population Type" name="population_type" defaultValue={model?.population_type || '2'} />
        </Grid>
        {model ? null : (
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Observation Period" name="observation_period" defaultValue="120" />
          </Grid>
        )}
      </>
    );
  }

  if (activeTab === 2) {
    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="EAD Method" name="ead_method" defaultValue={model?.ead_method || '2'} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Calc Method" name="calc_method" defaultValue={model?.calc_method || '1'} />
        </Grid>
      </>
    );
  }

  if (activeTab === 3) {
    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Module" name="module" type="number" defaultValue={model?.module || '1'} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Effective Date"
            name="effective_date"
            type="date"
            defaultValue={model?.effective_date || new Date().toISOString().split('T')[0]}
          />
        </Grid>
      </>
    );
  }

  return null;
}

const ModelFormDialog = memo(function ModelFormDialog({
  open,
  mode,
  modelType,
  activeTab,
  model,
  onClose,
  onSave,
}: ModelFormDialogProps) {
  const formId = `${mode}-model-form`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'create' ? `Create New ${modelType} Model` : `Edit ${modelType} Model`}</DialogTitle>
      <DialogContent>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSave(Object.fromEntries(formData.entries()));
          }}
        >
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Model Name" name="model_name" defaultValue={model?.model_name || ''} required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Segment ID"
                name="segment_id"
                type="number"
                defaultValue={model?.segment_id || model?.segmentId || '1'}
              />
            </Grid>
            {renderTabFields(activeTab, model)}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox defaultChecked={Boolean(model?.is_active || model?.isActive || mode === 'create')} name="is_active" />}
                label="Active"
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" type="submit" form={formId}>
          {mode === 'create' ? 'Create Model' : 'Update Model'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ModelFormDialog;
