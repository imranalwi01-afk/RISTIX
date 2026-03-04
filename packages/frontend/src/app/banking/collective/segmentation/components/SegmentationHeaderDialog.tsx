'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  IconButton,
  Stack,
  FormHelperText
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { api } from '@/services/api';

interface SegmentationHeaderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: any;
}

export default function SegmentationHeaderDialog({
  open,
  onClose,
  onSave,
  mode,
  initialData
}: SegmentationHeaderDialogProps) {
  const [formData, setFormData] = useState<any>({
    group_segment: '',
    segment: '',
    sub_segment: '',
    segment_type: '',
    seq: 1,
    active_flag: true
  });

  const [segmentTypes, setSegmentTypes] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSegmentTypes();
      if (initialData) {
        setFormData({
          ...initialData,
          active_flag: initialData.active_flag ?? true
        });
      } else {
        setFormData({
          group_segment: '',
          segment: '',
          sub_segment: '',
          segment_type: '',
          seq: 1,
          active_flag: true
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const loadSegmentTypes = async () => {
    try {
      const response = await api.banking.segmentation.getSegmentTypes();
      if (response && response.data) {
        setSegmentTypes(response.data);
      }
    } catch (err) {
      console.error('Error loading segment types:', err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.group_segment) newErrors.group_segment = 'Group Segment is required';
    if (!formData.segment) newErrors.segment = 'Segment is required';
    if (!formData.segment_type) newErrors.segment_type = 'Segment Type is required';
    if (formData.seq === undefined || formData.seq === null) newErrors.seq = 'Sequence is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const readOnly = mode === 'view';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" fontWeight="bold">
          {mode === 'add' ? 'Add New Segmentation' : mode === 'edit' ? 'Edit Segmentation' : 'View Segmentation'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'primary.contrastText' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Group Segment *"
              value={formData.group_segment || ''}
              onChange={(e) => handleChange('group_segment', e.target.value)}
              disabled={readOnly}
              error={!!errors.group_segment}
              helperText={errors.group_segment || "Main classification group"}
              placeholder="e.g. RETAIL_LOAN"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Segment *"
              value={formData.segment || ''}
              onChange={(e) => handleChange('segment', e.target.value)}
              disabled={readOnly}
              error={!!errors.segment}
              helperText={errors.segment || "Specific segment name"}
              placeholder="e.g. Mortgage"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sub Segment"
              value={formData.sub_segment || ''}
              onChange={(e) => handleChange('sub_segment', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. First Time Buyer"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.segment_type} disabled={readOnly}>
              <InputLabel>Segment Type *</InputLabel>
              <Select
                value={formData.segment_type || ''}
                label="Segment Type *"
                onChange={(e) => handleChange('segment_type', e.target.value)}
              >
                {segmentTypes.map((type, idx) => (
                  <MenuItem key={`${type.type_code}-${idx}`} value={type.type_code}>
                    {type.type_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.segment_type && <FormHelperText>{errors.segment_type}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Sequence *"
              value={formData.seq || ''}
              onChange={(e) => handleChange('seq', e.target.value ? parseInt(e.target.value) : '')}
              disabled={readOnly}
              error={!!errors.seq}
              helperText={errors.seq || "Processing priority"}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active_flag !== false}
                    onChange={(e) => handleChange('active_flag', e.target.checked)}
                    disabled={readOnly}
                    color="primary"
                  />
                }
                label={
                  <Typography fontWeight={500}>
                    {formData.active_flag !== false ? "Active Status" : "Inactive Status"}
                  </Typography>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ px: 4 }}>
          Cancel
        </Button>
        {!readOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ px: 4 }}
          >
            {mode === 'add' ? 'Create' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
