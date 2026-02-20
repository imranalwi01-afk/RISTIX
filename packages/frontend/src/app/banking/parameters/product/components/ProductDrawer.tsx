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
        expectedLife: initialData.expectedLife ?? '',
        borrowingRate: initialData.borrowingRate ?? '',
        marketRate: initialData.marketRate ?? '',
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
        bmFlag: false,
        expectedLife: '',
        borrowingRate: '',
        marketRate: '',
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
      onSave(formData);
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
                  {options.dataSources.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                  ))}
                </Select>
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
                  {options.productGroups.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth error={!!errors.prdType} required>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={formData.prdType}
                  label="Product Type"
                  onChange={(e) => handleChange('prdType', e.target.value)}
                  disabled={loading}
                >
                  {options.productTypes.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                  ))}
                </Select>
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
                  {options.currencies.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.id} - {opt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Instrument Class</InputLabel>
                <Select
                  value={formData.alFlag}
                  label="Instrument Class"
                  onChange={(e) => handleChange('alFlag', e.target.value)}
                  disabled={loading}
                >
                  {options.instrumentClasses.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                  ))}
                </Select>
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
                {options.amortizationTypes.map(opt => (
                  <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Exp. Life (Mths)"
                type="number"
                value={formData.expectedLife}
                onChange={(e) => handleChange('expectedLife', e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Borrowing %"
                type="number"
                value={formData.borrowingRate}
                onChange={(e) => handleChange('borrowingRate', e.target.value)}
                disabled={loading}
              />
              <TextField
                label="Market %"
                type="number"
                value={formData.marketRate}
                onChange={(e) => handleChange('marketRate', e.target.value)}
                disabled={loading}
              />
            </Box>

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
                    checked={formData.bmFlag}
                    onChange={(e) => handleChange('bmFlag', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Below Market"
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
