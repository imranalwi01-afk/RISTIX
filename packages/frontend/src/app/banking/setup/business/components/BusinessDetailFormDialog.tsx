'use client';

import React, { memo, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

export interface BusinessParameterDetail {
  pkid?: string;
  param_code: string;
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc: string;
}

export interface BusinessParameterDetailFormData {
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc: string;
}

interface BusinessDetailFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BusinessParameterDetailFormData) => void;
  detail?: BusinessParameterDetail;
  paramCode: string;
  defaultSeq?: number;
}

const BusinessDetailFormDialog = memo(function BusinessDetailFormDialog({
  open,
  onClose,
  onSave,
  detail,
  paramCode,
  defaultSeq = 1,
}: BusinessDetailFormDialogProps) {
  const [formData, setFormData] = useState<BusinessParameterDetailFormData>({
    param_seq: 1,
    value1: '',
    value2: '',
    value3: '',
    paramdesc: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (detail) {
      setFormData({
        param_seq: detail.param_seq,
        value1: detail.value1,
        value2: detail.value2 || '',
        value3: detail.value3 || '',
        paramdesc: detail.paramdesc,
      });
    } else {
      setFormData({
        param_seq: defaultSeq,
        value1: '',
        value2: '',
        value3: '',
        paramdesc: '',
      });
    }
    setError(null);
  }, [detail, open, defaultSeq]);

  const handleSubmit = () => {
    if (!formData.param_seq || formData.param_seq <= 0) {
      setError('Sequence > 0 required');
      return;
    }
    if (!formData.value1?.trim()) {
      setError('Value 1 required');
      return;
    }
    if (!formData.paramdesc?.trim()) {
      setError('Description required');
      return;
    }
    setError(null);
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{detail ? 'Edit Detail' : 'Add Detail'}</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption">
              Param Code: <strong>{paramCode}</strong>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sequence"
              type="number"
              value={formData.param_seq}
              onChange={(e) => setFormData({ ...formData, param_seq: parseInt(e.target.value, 10) || 1 })}
              inputProps={{ 'data-testid': 'input-detail-seq' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} />
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Value 1"
              value={formData.value1}
              onChange={(e) => setFormData({ ...formData, value1: e.target.value })}
              inputProps={{ 'data-testid': 'input-detail-value1' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Value 2"
              value={formData.value2}
              onChange={(e) => setFormData({ ...formData, value2: e.target.value })}
              inputProps={{ 'data-testid': 'input-detail-value2' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Value 3"
              value={formData.value3}
              onChange={(e) => setFormData({ ...formData, value3: e.target.value })}
              inputProps={{ 'data-testid': 'input-detail-value3' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={formData.paramdesc}
              onChange={(e) => setFormData({ ...formData, paramdesc: e.target.value })}
              inputProps={{ 'data-testid': 'input-detail-desc' }}
            />
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" data-testid="btn-submit-detail">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default BusinessDetailFormDialog;
