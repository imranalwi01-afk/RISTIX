'use client';


import React from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography
} from '@mui/material';

interface OverviewTabProps {
  formData: any;
  setFormData: (data: any) => void;
  readOnly?: boolean;
}

export default function OverviewTab({ formData, setFormData, readOnly = false }: OverviewTabProps) {
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">General Information</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Group Segment"
            value={formData.group_segment || ''}
            onChange={(e) => handleChange('group_segment', e.target.value)}
            disabled={readOnly}
            required
            helperText="Unique identifier for the segmentation group"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Segment"
            value={formData.segment || ''}
            onChange={(e) => handleChange('segment', e.target.value)}
            disabled={readOnly}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Sub Segment"
            value={formData.sub_segment || ''}
            onChange={(e) => handleChange('sub_segment', e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={readOnly}>
            <InputLabel>Segment Type</InputLabel>
            <Select
              value={formData.segment_type || 'PD'}
              label="Segment Type"
              onChange={(e) => handleChange('segment_type', e.target.value)}
            >
              <MenuItem value="PD">PD</MenuItem>
              <MenuItem value="LGD">LGD</MenuItem>
              <MenuItem value="EAD">EAD</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Sequence"
            value={formData.seq || 1}
            onChange={(e) => handleChange('seq', parseInt(e.target.value))}
            disabled={readOnly}
            required
            helperText="Processing order priority"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active_flag !== false}
                onChange={(e) => handleChange('active_flag', e.target.checked)}
                disabled={readOnly}
              />
            }
            label={formData.active_flag !== false ? "Active" : "Inactive"}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
