'use client';

import React, { memo } from 'react';
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, TextField } from '@mui/material';
import { Download as ExportIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';

interface UserManagementFiltersProps {
  searchTerm: string;
  filterDepartment: string;
  filterBankingAccess: string;
  filterActive: boolean | null;
  departments: string[];
  loading: boolean;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onBankingAccessChange: (value: string) => void;
  onActiveChange: (value: boolean | null) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const UserManagementFilters = memo(function UserManagementFilters({
  searchTerm,
  filterDepartment,
  filterBankingAccess,
  filterActive,
  departments,
  loading,
  onSearchChange,
  onDepartmentChange,
  onBankingAccessChange,
  onActiveChange,
  onRefresh,
  onExport,
}: UserManagementFiltersProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select value={filterDepartment} onChange={(e) => onDepartmentChange(e.target.value)} label="Department">
              <MenuItem value="">All</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Banking Access</InputLabel>
            <Select value={filterBankingAccess} onChange={(e) => onBankingAccessChange(e.target.value)} label="Banking Access">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CONVENTIONAL">Conventional</MenuItem>
              <MenuItem value="BOTH">Both</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => onActiveChange(e.target.value === '' ? null : e.target.value === 'true')}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={onExport}>
              Export
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
});

export default UserManagementFilters;
