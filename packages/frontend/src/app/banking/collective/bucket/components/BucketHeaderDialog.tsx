'use client';

import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { BucketParameterHeader } from '@/services/api.bucketparameter';

interface BucketHeaderDialogProps {
  open: boolean;
  editMode: boolean;
  canManageBucket: boolean;
  basisOptions: { value1: string; paramdesc: string }[];
  headerFormData: Partial<BucketParameterHeader>;
  headerValidationMessage: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (next: Partial<BucketParameterHeader>) => void;
}

function BucketHeaderDialogComponent({
  open,
  editMode,
  canManageBucket,
  basisOptions,
  headerFormData,
  headerValidationMessage,
  onClose,
  onSave,
  onChange,
}: BucketHeaderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Bucket Parameter Group' : 'Add Bucket Parameter Group'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {headerValidationMessage ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {headerValidationMessage}
            </Alert>
          ) : null}
          <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="Bucket Group ID"
                value={headerFormData.bucket_group || ''}
                onChange={(e) => onChange({ ...headerFormData, bucket_group: e.target.value })}
                required
                data-testid="bucket-group-field"
              />
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Basis</InputLabel>
                <Select
                  value={headerFormData.basis || ''}
                  label="Basis"
                  onChange={(e) => onChange({ ...headerFormData, basis: e.target.value })}
                  data-testid="bucket-basis-field"
                >
                  {basisOptions.map((option, idx) => (
                    <MenuItem key={`${option.value1}-${idx}`} value={option.value1}>
                      {option.paramdesc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextField
                fullWidth
                label="Description"
                value={headerFormData.bucket_group_desc || ''}
                onChange={(e) => onChange({ ...headerFormData, bucket_group_desc: e.target.value })}
                data-testid="bucket-desc-field"
              />
            </Box>
            <Box sx={{ display: 'grid', gridColumn: 'span 2', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={headerFormData.include_close || false}
                      onChange={(e) => onChange({ ...headerFormData, include_close: e.target.checked })}
                      data-testid="include-close-switch"
                    />
                  }
                  label="Include Closed"
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={headerFormData.include_wo || false}
                      onChange={(e) => onChange({ ...headerFormData, include_wo: e.target.checked })}
                      data-testid="include-wo-switch"
                    />
                  }
                  label="Include WO"
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={headerFormData.active_flag !== false}
                      onChange={(e) => onChange({ ...headerFormData, active_flag: e.target.checked })}
                      data-testid="active-flag-switch"
                    />
                  }
                  label="Active"
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {canManageBucket && (
          <Button
            variant="contained"
            onClick={onSave}
            data-testid="save-header-btn"
            disabled={Boolean(headerValidationMessage)}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export const BucketHeaderDialog = memo(BucketHeaderDialogComponent);
