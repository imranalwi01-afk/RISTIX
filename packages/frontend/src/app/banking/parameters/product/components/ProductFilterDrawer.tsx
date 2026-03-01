import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { Close as CloseIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

interface ProductFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onClear: () => void;
  currentFilters: any;
  options: {
    currencies: any[];
    dataSources: any[];
  };
}

export default function ProductFilterDrawer({
  open,
  onClose,
  onApply,
  onClear,
  currentFilters,
  options
}: ProductFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleChange = (field: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters = {
      currency: '',
      activeOnly: 'all',
      dataSource: ''
    };
    setLocalFilters(emptyFilters);
    onClear();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">Advanced Filters</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          <Stack spacing={3}>

            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={localFilters.currency || ''}
                label="Currency"
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <MenuItem value=""><em>All Currencies</em></MenuItem>
                {options.currencies.map((opt, idx) => (
                  <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.id} - {opt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={localFilters.activeOnly || 'all'}
                label="Status"
                onChange={(e) => handleChange('activeOnly', e.target.value)}
              >
                <MenuItem value="all"><em>All Statuses</em></MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Data Source</InputLabel>
              <Select
                value={localFilters.dataSource || ''}
                label="Data Source"
                onChange={(e) => handleChange('dataSource', e.target.value)}
              >
                <MenuItem value=""><em>All Sources</em></MenuItem>
                {options.dataSources.map((opt, idx) => (
                  <MenuItem key={`${opt.id}-${idx}`} value={opt.id}>{opt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

          </Stack>
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Button startIcon={<ClearIcon />} onClick={handleClear} color="inherit">
            Clear All
          </Button>
          <Button variant="contained" onClick={handleApply}>
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
