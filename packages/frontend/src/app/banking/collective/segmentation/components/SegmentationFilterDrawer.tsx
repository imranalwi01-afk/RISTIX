
import React, { useState } from 'react';
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
  Divider,
  Chip
} from '@mui/material';
import { Close as CloseIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

interface SegmentationFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onClear: () => void;
  currentFilters: any;
}

export default function SegmentationFilterDrawer({
  open,
  onClose,
  onApply,
  onClear,
  currentFilters
}: SegmentationFilterDrawerProps) {
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
      segmentType: '',
      status: '',
      tableName: '',
      columnName: '',
      operator: '',
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
              <InputLabel>Segment Type</InputLabel>
              <Select
                value={localFilters.segmentType || ''}
                label="Segment Type"
                onChange={(e) => handleChange('segmentType', e.target.value)}
              >
                <MenuItem value=""><em>All Types</em></MenuItem>
                <MenuItem value="PD">PD</MenuItem>
                <MenuItem value="LGD">LGD</MenuItem>
                <MenuItem value="EAD">EAD</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={localFilters.status || ''}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value=""><em>All Statuses</em></MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <Divider>Rule Criteria</Divider>

            <TextField
              label="Table Name"
              fullWidth
              value={localFilters.tableName || ''}
              onChange={(e) => handleChange('tableName', e.target.value)}
              placeholder="e.g. frs9_customer"
            />

            <TextField
              label="Column Name"
              fullWidth
              value={localFilters.columnName || ''}
              onChange={(e) => handleChange('columnName', e.target.value)}
              placeholder="e.g. account_status"
            />

            <FormControl fullWidth>
              <InputLabel>Operator</InputLabel>
              <Select
                value={localFilters.operator || ''}
                label="Operator"
                onChange={(e) => handleChange('operator', e.target.value)}
              >
                <MenuItem value=""><em>Any</em></MenuItem>
                <MenuItem value="=">Equals (=)</MenuItem>
                <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                <MenuItem value="<">Less Than (&lt;)</MenuItem>
                <MenuItem value="LIKE">Like</MenuItem>
                <MenuItem value="IN">In</MenuItem>
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
