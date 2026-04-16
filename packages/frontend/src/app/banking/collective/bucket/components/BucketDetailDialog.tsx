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
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import { BucketParameterDetail } from '@/services/api.bucketparameter';

interface BucketDetailDialogProps {
  open: boolean;
  editMode: boolean;
  canManageBucket: boolean;
  detailFormData: Partial<BucketParameterDetail>;
  detailValidationMessage: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (next: Partial<BucketParameterDetail>) => void;
}

function BucketDetailDialogComponent({
  open,
  editMode,
  canManageBucket,
  detailFormData,
  detailValidationMessage,
  onClose,
  onSave,
  onChange,
}: BucketDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Bucket Detail' : 'Add Bucket Detail'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {detailValidationMessage ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {detailValidationMessage}
            </Alert>
          ) : null}
          <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextField
                fullWidth
                label="Bucket Name"
                value={detailFormData.bucket_name || ''}
                onChange={(e) => onChange({ ...detailFormData, bucket_name: e.target.value })}
                required
                data-testid="bucket-name-field"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                type="number"
                label="Range Start"
                value={detailFormData.range_start || 0}
                onChange={(e) => onChange({ ...detailFormData, range_start: Number(e.target.value) })}
                required
                data-testid="range-start-field"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                type="number"
                label="Range End (Leave empty for infinity)"
                value={detailFormData.range_end || ''}
                onChange={(e) => onChange({ ...detailFormData, range_end: e.target.value ? Number(e.target.value) : undefined })}
                data-testid="range-end-field"
              />
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={detailFormData.active_flag !== false}
                    onChange={(e) => onChange({ ...detailFormData, active_flag: e.target.checked })}
                    data-testid="active-detail-switch"
                  />
                }
                label="Active"
              />
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
            data-testid="save-detail-btn"
            disabled={Boolean(detailValidationMessage)}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export const BucketDetailDialog = memo(BucketDetailDialogComponent);
