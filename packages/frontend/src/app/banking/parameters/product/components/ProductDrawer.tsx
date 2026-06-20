'use client';

import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any | null;
  loading: boolean;
  canManage: boolean;
  options: {
    dataSources: any[];
    productGroups: any[];
    productTypes: any[];
    currencies: any[];
    amortizationTypes: any[];
    instrumentClasses: any[];
  };
}

export default function ProductDrawer({
  open,
  onClose,
  onSave,
  initialData,
  loading,
  canManage,
  options
}: ProductDrawerProps) {
  const [formData, setFormData] = useState<any>({
    dataSource: '',
    prdGroup: '',
    prdType: '',
    prdCode: '',
    prdDesc: '',
    currency: '',
    amortizationType: '',
    alFlag: '',
    impairedFlag: false,
    bmFlag: false,
    expectedLife: '',
    borrowingRate: '',
    marketRate: '',
    activeFlag: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    } else {
      setFormData({
        dataSource: options.dataSources[0]?.id || '',
        prdGroup: options.productGroups[0]?.id || '',
        prdType: options.productTypes[0]?.id || '',
        prdCode: '',
        prdDesc: '',
        currency: options.currencies[0]?.id || 'IDR',
        amortizationType: options.amortizationTypes[0]?.id || '',
        alFlag: options.instrumentClasses[0]?.id || '',
        impairedFlag: false,
        activeFlag: true
      });
    }
    setErrors({});
  }, [initialData, open, options]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.prdCode?.trim()) newErrors.prdCode = 'Code is required';
    if (!formData.prdDesc?.trim()) newErrors.prdDesc = 'Description is required';
    if (!formData.dataSource) newErrors.dataSource = 'Data Source is required';
    if (!formData.prdGroup) newErrors.prdGroup = 'Group is required';
    if (!formData.prdType) newErrors.prdType = 'Type is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // Clean up empty strings for optional fields
      const cleaned = { ...formData };
      for (const key of Object.keys(cleaned)) {
        if (cleaned[key] === '') cleaned[key] = undefined;
      }
      onSave(cleaned);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          <Stack spacing={3}>
            <Alert severity="info">
              Configure product parameters for IFRS9 classification and measurement.
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Product Code"
                value={formData.prdCode}
                onChange={(e) => handleChange('prdCode', e.target.value.toUpperCase())}
                error={!!errors.prdCode}
                helperText={errors.prdCode}
                disabled={!!initialData || loading}
                required
                fullWidth
              />
              <FormControl fullWidth error={!!errors.dataSource} required>
                <InputLabel>Data Source</InputLabel>
                <Select
                  value={formData.dataSource}
                  label="Data Source"
                  onChange={(e) => handleChange('dataSource', e.target.value)}
                  disabled={loading}
                >
                  {options.dataSources.length > 0 ? (
                    options.dataSources.map((opt, idx) => (
                      <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options — configure B0028 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText error={!!errors.dataSource}>
                  {errors.dataSource || 'Source: Business Setting B0028'}
                </FormHelperText>
              </FormControl>
            </Box>

            <TextField
              label="Product Description"
              value={formData.prdDesc}
              onChange={(e) => handleChange('prdDesc', e.target.value)}
              error={!!errors.prdDesc}
              helperText={errors.prdDesc}
              disabled={loading}
              required
              fullWidth
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth error={!!errors.prdGroup} required>
                <InputLabel>Product Group</InputLabel>
                <Select
                  value={formData.prdGroup}
                  label="Product Group"
                  onChange={(e) => handleChange('prdGroup', e.target.value)}
                  disabled={loading}
                >
                  {options.productGroups.length > 0 ? (
                    options.productGroups.map((opt, idx) => (
                      <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options — configure B0029 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText error={!!errors.prdGroup}>
                  {errors.prdGroup || 'Source: Business Setting B0029'}
                </FormHelperText>
              </FormControl>
              <FormControl fullWidth error={!!errors.prdType} required>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={formData.prdType}
                  label="Product Type"
                  onChange={(e) => handleChange('prdType', e.target.value)}
                  disabled={loading}
                >
                  {options.productTypes.length > 0 ? (
                    options.productTypes.map((opt, idx) => (
                      <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options — configure B0030 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText error={!!errors.prdType}>
                  {errors.prdType || 'Source: Business Setting B0030'}
                </FormHelperText>
              </FormControl>
            </Box>

            <Divider>Financial Parameters</Divider>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth error={!!errors.currency} required>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  label="Currency"
                  onChange={(e) => handleChange('currency', e.target.value)}
                  disabled={loading}
                >
                  {options.currencies.length > 0 ? (
                    options.currencies.map((opt, idx) => (
                      <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.id} - {opt.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options — configure B0001 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText error={!!errors.currency}>
                  {errors.currency || 'Source: Business Setting B0001'}
                </FormHelperText>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Instrument Class</InputLabel>
                <Select
                  value={formData.alFlag}
                  label="Instrument Class"
                  onChange={(e) => handleChange('alFlag', e.target.value)}
                  disabled={loading}
                >
                  {options.instrumentClasses.length > 0 ? (
                    options.instrumentClasses.map((opt, idx) => (
                      <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No options — configure B0003 in Business Settings
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>Source: Business Setting B0003</FormHelperText>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Amortization Type</InputLabel>
              <Select
                value={formData.amortizationType}
                label="Amortization Type"
                onChange={(e) => handleChange('amortizationType', e.target.value)}
                disabled={loading}
              >
                {options.amortizationTypes.length > 0 ? (
                  options.amortizationTypes.map((opt, idx) => (
                    <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No options — configure B0002 in Business Settings
                  </MenuItem>
                )}
              </Select>
              <FormHelperText>Source: Business Setting B0002</FormHelperText>
            </FormControl>

            <Divider>Flags & Status</Divider>

            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.impairedFlag}
                    onChange={(e) => handleChange('impairedFlag', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Impaired"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activeFlag}
                    onChange={(e) => handleChange('activeFlag', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Active"
              />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading || !canManage}
            fullWidth
          >
            Save Product
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
