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
import { CreateJobForm, SupportedJobType } from '../types';

interface CreateJobDefinitionDialogProps {
  open: boolean;
  loading: boolean;
  jobData: CreateJobForm;
  supportedJobTypeOptions: Array<{ value: SupportedJobType; label: string }>;
  disabled: boolean;
  onClose: () => void;
  onCreate: () => void;
  onChange: React.Dispatch<React.SetStateAction<CreateJobForm>>;
}

export const CreateJobDefinitionDialog = memo(function CreateJobDefinitionDialog({
  open,
  loading,
  jobData,
  supportedJobTypeOptions,
  disabled,
  onClose,
  onCreate,
  onChange,
}: CreateJobDefinitionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Job Definition</DialogTitle>
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
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={jobData.type}
                label="Job Type"
                onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                    type: e.target.value as SupportedJobType,
                    procedureName: '',
                    schemaName: '',
                    handlerName: '',
                    command: '',
                    }))
                }
              >
                {supportedJobTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {jobData.type === 'SQL_SP' && (
            <>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Target Database</InputLabel>
                  <Select
                    value={jobData.targetDatabase || 'TENANT'}
                    label="Target Database"
                    onChange={(e) => onChange({ ...jobData, targetDatabase: e.target.value as 'TENANT' | 'LEGACY' })}
                  >
                    <MenuItem value="TENANT">Tenant DB (Default)</MenuItem>
                    <MenuItem value="LEGACY">Legacy DB (IFRS9 Engine)</MenuItem>
                  </Select>
                </FormControl>
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
                  placeholder="e.g. sp_frs9_imp_sequence or FRS9PRO.public.sp_frs9_imp_sequence"
                  value={jobData.procedureName || ''}
                  onChange={(e) => onChange({ ...jobData, procedureName: e.target.value })}
                  helperText="Required. Supports schema/db qualified format."
                  required
                />
              </Grid>
            </>
          )}

          {jobData.type === 'INTERNAL_SCRIPT' && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Handler Name"
                placeholder="e.g. test_handler"
                value={jobData.handlerName || ''}
                onChange={(e) => onChange({ ...jobData, handlerName: e.target.value })}
                helperText="Registered internal handler name"
                required
              />
            </Grid>
          )}

          {jobData.type === 'SHELL_COMMAND' && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Shell Command"
                placeholder="e.g. ls -la"
                value={jobData.command || ''}
                onChange={(e) => onChange({ ...jobData, command: e.target.value })}
                helperText="System command to execute (use with caution)"
                required
              />
            </Grid>
          )}

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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Schedule Expression (Cron)"
              placeholder="0 0 * * *"
              value={jobData.scheduleExpression}
              onChange={(e) => onChange({ ...jobData, scheduleExpression: e.target.value })}
              helperText="Leave empty for on-demand only"
            />
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
        <Button onClick={onCreate} variant="contained" disabled={disabled || loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
});
