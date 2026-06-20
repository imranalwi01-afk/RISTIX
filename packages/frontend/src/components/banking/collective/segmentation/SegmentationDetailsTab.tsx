'use client';


import React, { useEffect, useMemo, useState } from 'react';
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
  Typography,
  Paper,
  Divider,
  Stack,
  FormHelperText
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { api } from '@/services/api';

type SegmentationHeaderFormData = {
  group_segment?: string;
  segment?: string;
  sub_segment?: string;
  segment_type?: string;
  seq?: number;
  active_flag?: boolean;
  requires_approval?: boolean;
  description?: string;
  [key: string]: string | number | boolean | undefined;
};

interface SegmentationDetailsTabProps {
  formData: SegmentationHeaderFormData;
  setFormData: (data: Partial<SegmentationHeaderFormData>) => void;
  readOnly?: boolean;
}

export const SegmentationDetailsTab: React.FC<SegmentationDetailsTabProps> = ({
  formData,
  setFormData,
  readOnly = false
}) => {
  const [segmentTypeOptions, setSegmentTypeOptions] = useState<Array<{ code: string; name: string }>>([]);

  const selectedSegmentType = useMemo(
    () => String(formData.segment_type || ''),
    [formData.segment_type]
  );

  const handleChange = (field: keyof SegmentationHeaderFormData, value: SegmentationHeaderFormData[keyof SegmentationHeaderFormData]) => {
    setFormData({ [field]: value });
  };

  useEffect(() => {
    const loadSegmentTypes = async () => {
      try {
        const response = await api.banking.segmentation.getSegmentTypes();
        const payload = response?.data && typeof response.data === 'object' ? response.data : response;
        const rows = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        const mapped = rows
          .map((row: unknown) => {
            const rowData = row as { type_code?: unknown; value1?: unknown; type_name?: unknown; paramdesc?: unknown };
            const code = String(rowData?.type_code ?? rowData?.value1 ?? '').trim();
            if (!code) return null;
            const name = String(rowData?.type_name ?? rowData?.paramdesc ?? code).trim() || code;
            return { code, name };
          })
          .filter(Boolean) as Array<{ code: string; name: string }>;

        setSegmentTypeOptions(mapped);
      } catch (error) {
        console.warn('Failed to load segment type options (B0011):', error);
        setSegmentTypeOptions([]);
      }
    };

    loadSegmentTypes();
  }, []);

  useEffect(() => {
    if (segmentTypeOptions.length === 0) return;
    const existsInOptions = segmentTypeOptions.some((option) => option.code === selectedSegmentType);
    if (!selectedSegmentType || !existsInOptions) {
      setFormData({ segment_type: segmentTypeOptions[0].code });
    }
  }, [segmentTypeOptions, selectedSegmentType, setFormData]);

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Basic Information Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: '#fff' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <InfoIcon color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight="bold">Basic Information</Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Group Segment"
                  placeholder="e.g., RETAIL_LOANS"
                  value={formData.group_segment || ''}
                  onChange={(e) => handleChange('group_segment', e.target.value)}
                  disabled={readOnly}
                  required
                  variant="outlined"
                  inputProps={{ 'data-testid': 'segment-group-field' }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  helperText="Unique identifier for the segmentation group"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Segment Name"
                  placeholder="e.g., Commercial Real Estate"
                  value={formData.segment || ''}
                  onChange={(e) => handleChange('segment', e.target.value)}
                  disabled={readOnly}
                  required
                  variant="outlined"
                  inputProps={{ 'data-testid': 'segment-name-field' }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Sub-Segment"
                  placeholder="e.g., Office Buildings"
                  value={formData.sub_segment || ''}
                  onChange={(e) => handleChange('sub_segment', e.target.value)}
                  disabled={readOnly}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  placeholder="Provide a detailed description of this segmentation criteria..."
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={readOnly}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Configuration Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: '#fff', height: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <SettingsIcon color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight="bold">Configuration</Typography>
            </Stack>

            <Stack spacing={4}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel id="segment-type-label">Segment Type</InputLabel>
                <Select
                  labelId="segment-type-label"
                  value={selectedSegmentType}
                  label="Segment Type"
                  onChange={(e) => handleChange('segment_type', e.target.value)}
                  data-testid="segment-type-select"
                  sx={{ borderRadius: 1.5 }}
                >
                  {segmentTypeOptions.length > 0 ? (
                    segmentTypeOptions.map((option) => (
                      <MenuItem key={option.code} value={option.code}>
                        {option.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options - configure B0011 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>Source: Business Setting B0011</FormHelperText>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Execution Sequence"
                value={formData.seq || 1}
                onChange={(e) => handleChange('seq', parseInt(e.target.value) || 1)}
                disabled={readOnly}
                required
                variant="outlined"
                inputProps={{ 'data-testid': 'segment-seq-field' }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                helperText="Priority level in calculation engine"
              />

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="medium">Active Status</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active_flag !== false}
                      onChange={(e) => handleChange('active_flag', e.target.checked)}
                      disabled={readOnly}
                      color="primary"
                    />
                  }
                  label={formData.active_flag !== false ? "Enabled" : "Disabled"}
                  sx={{ m: 0 }}
                />
              </Box>
          </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
