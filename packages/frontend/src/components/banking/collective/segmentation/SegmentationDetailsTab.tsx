
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
  Typography,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface SegmentationDetailsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  readOnly?: boolean;
}

export const SegmentationDetailsTab: React.FC<SegmentationDetailsTabProps> = ({
  formData,
  setFormData,
  readOnly = false
}) => {
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

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
                  value={formData.segment_type || 'PD'}
                  label="Segment Type"
                  onChange={(e) => handleChange('segment_type', e.target.value)}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="PD">Probability of Default (PD)</MenuItem>
                  <MenuItem value="LGD">Loss Given Default (LGD)</MenuItem>
                  <MenuItem value="EAD">Exposure at Default (EAD)</MenuItem>
                  <MenuItem value="PREPAYMENT">Prepayment</MenuItem>
                </Select>
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="medium">Requires Approval</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requires_approval !== false}
                      onChange={(e) => handleChange('requires_approval', e.target.checked)}
                      disabled={readOnly}
                      color="secondary"
                    />
                  }
                  label={formData.requires_approval !== false ? "Yes" : "No"}
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
