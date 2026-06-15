'use client';

import React, { memo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PDConfiguration } from '@/services/api/pd-configurations.api';
import { PopulationSegment } from '@/services/api/population-segments.api';

interface PDConfigFormDialogProps {
  open: boolean;
  loading: boolean;
  selectedConfig: PDConfiguration | null;
  formData: Partial<PDConfiguration>;
  formErrors: Record<string, string>;
  isEditing: boolean;
  methodOptions: { value: string | number; label: string }[];
  popTypeOptions: { value: string | number; label: string }[];
  bucketGroups: any[];
  populationSegments: PopulationSegment[];
  flScalars: any[];
  onClose: () => void;
  onSave: () => void;
  onChange: (next: Partial<PDConfiguration>) => void;
  isFieldDisabled: (field: string) => boolean;
  canManage: boolean;
}

export const PDConfigFormDialog = memo(function PDConfigFormDialog({
  open,
  loading,
  selectedConfig,
  formData,
  formErrors,
  methodOptions,
  popTypeOptions,
  bucketGroups,
  populationSegments,
  flScalars,
  onClose,
  onSave,
  onChange,
  isFieldDisabled,
  canManage,
}: PDConfigFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{selectedConfig ? 'Edit PD Configuration' : 'New PD Configuration'}</DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="Model Name"
                value={formData.model_name || ''}
                onChange={(e) => onChange({ ...formData, model_name: e.target.value })}
                error={!!formErrors.model_name}
                helperText={formErrors.model_name}
                data-testid="model-name-input"
              />
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Population Segment</InputLabel>
                <Select
                  value={formData.population_segment_id || ''}
                  label="Population Segment"
                  onChange={(e) => onChange({ ...formData, population_segment_id: e.target.value as any })}
                  error={!!formErrors.population_segment_id}
                  data-testid="segment-select"
                >
                  {populationSegments.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.segment_name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={!!formErrors.population_segment_id}>
                  {formErrors.population_segment_id || 'Source: Population Segments table'}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth error={!!formErrors.selected_method}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={formData.selected_method || ''}
                  label="Method"
                  onChange={(e) => onChange({ ...formData, selected_method: e.target.value as any })}
                  data-testid="method-select"
                >
                  <MenuItem value="">
                    <em>Select Method</em>
                  </MenuItem>
                  {methodOptions.map((m, idx) => (
                    <MenuItem key={`${m.value}-${idx}`} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={!!formErrors.selected_method}>
                  {formErrors.selected_method || 'Source: Business Setting B0018'}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box>
              <TextField
                fullWidth
                type="number"
                label="Migration Interval (Months)"
                value={formData.migration_interval || ''}
                onChange={(e) => onChange({ ...formData, migration_interval: Number(e.target.value) as any })}
                disabled={isFieldDisabled('migration_interval')}
                error={!!formErrors.migration_interval}
                helperText={formErrors.migration_interval}
                data-testid="migration-interval-input"
              />
            </Box>

            <Box>
              <FormControl fullWidth error={!!formErrors.bucket}>
                <InputLabel>Bucket Group</InputLabel>
                <Select
                  value={formData.bucket || ''}
                  label="Bucket Group"
                  onChange={(e) => onChange({ ...formData, bucket: e.target.value as any })}
                  data-testid="bucket-group-select"
                >
                  {bucketGroups.map((b: any) => (
                    <MenuItem key={b.id} value={b.bucket_group}>
                      {b.bucket_group}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={!!formErrors.bucket}>
                  {formErrors.bucket || 'Source: Bucket Parameter table'}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth error={!!formErrors.population_type}>
                <InputLabel>Population Type</InputLabel>
                <Select
                  value={formData.population_type || ''}
                  label="Population Type"
                  onChange={(e) => onChange({ ...formData, population_type: e.target.value as any })}
                  disabled={isFieldDisabled('population_type')}
                  data-testid="population-type-select"
                >
                  <MenuItem value="">
                    <em>Select Population Type</em>
                  </MenuItem>
                  {popTypeOptions.map((m, idx) => (
                    <MenuItem key={`${m.value}-${idx}`} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={!!formErrors.population_type}>
                  {formErrors.population_type || 'Source: Business Setting B0019'}
                </FormHelperText>
              </FormControl>
            </Box>

            <Box>
              <TextField
                fullWidth
                type="number"
                label="Historical Month"
                value={formData.historical_month || ''}
                onChange={(e) => onChange({ ...formData, historical_month: Number(e.target.value) as any })}
                disabled={isFieldDisabled('historical_month')}
                error={!!formErrors.historical_month}
                helperText={formErrors.historical_month}
                data-testid="historical-month-input"
              />
            </Box>

            <Box>
              <DatePicker
                label="First Historical Date"
                value={formData.first_historical_date ? dayjs(formData.first_historical_date) : null}
                onChange={(date) =>
                  onChange({ ...formData, first_historical_date: date ? dayjs(date).format('YYYY-MM-DD') : undefined })
                }
                disabled={isFieldDisabled('first_historical_date')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.first_historical_date,
                    helperText: formErrors.first_historical_date,
                    'data-testid': 'first-historical-date-picker',
                  } as any,
                }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                type="number"
                label="Multiplication"
                value={formData.multiplication || ''}
                onChange={(e) => onChange({ ...formData, multiplication: Number(e.target.value) as any })}
                disabled={isFieldDisabled('multiplication')}
                error={!!formErrors.multiplication}
                helperText={formErrors.multiplication}
                data-testid="multiplication-input"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={!!formData.is_active} onChange={(e) => onChange({ ...formData, is_active: e.target.checked })} data-testid="active-switch" />}
                label="Active"
              />
              <FormControlLabel
                control={<Switch checked={!!formData.fl_flag} onChange={(e) => onChange({ ...formData, fl_flag: e.target.checked })} data-testid="fl-flag-switch" />}
                label="FL Flag"
              />
              <FormControlLabel
                control={<Switch checked={!!formData.ia_flag} onChange={(e) => onChange({ ...formData, ia_flag: e.target.checked })} data-testid="ia-flag-switch" />}
                label="IA Flag"
              />
            </Box>

            {formData.fl_flag && (
              <Box>
                <FormControl fullWidth error={!!formErrors.fl_scalar_id}>
                  <InputLabel>FL Scalar</InputLabel>
                  <Select
                    value={formData.fl_scalar_id || ''}
                    label="FL Scalar"
                    onChange={(e) => onChange({ ...formData, fl_scalar_id: Number(e.target.value) as any })}
                    data-testid="fl-scalar-select"
                  >
                    {flScalars.map((fs) => (
                      <MenuItem key={fs.pkid} value={fs.pkid}>
                        {fs.scalar_name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error={!!formErrors.fl_scalar_id}>
                    {formErrors.fl_scalar_id || 'Source: FL Scalar Parameters'}
                  </FormHelperText>
                </FormControl>
              </Box>
            )}
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="cancel-btn">
          Cancel
        </Button>
        {canManage && (
          <Button variant="contained" onClick={onSave} disabled={loading} data-testid="save-config-btn">
            {selectedConfig ? 'Update' : 'Create'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});
