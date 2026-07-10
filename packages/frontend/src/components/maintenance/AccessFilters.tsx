'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Can } from '@/components/rbac/Can';
import type { RoleFilters } from './access-management.types';

interface AccessFiltersProps {
  filters: RoleFilters;
  loading: boolean;
  onFilterChange: (field: keyof RoleFilters, value: any) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onCreateRole: () => void;
}

export const AccessFilters: React.FC<AccessFiltersProps> = ({
  filters,
  loading,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onCreateRole,
}) => (
  <Card sx={{ mb: 3 }}>
    <CardHeader
      title="Filters"
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            size="small"
          >
            Clear
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
          <Can permission={['admin.roles.create']}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateRole}
              size="small"
              data-testid="access-management-add-role"
            >
              Add Role
            </Button>
          </Can>
        </Box>
      }
    />
    <CardContent>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type || ''}
              onChange={(e) => onFilterChange('type', e.target.value)}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SYSTEM">System</MenuItem>
              <MenuItem value="BANKING">Banking</MenuItem>
              <MenuItem value="CUSTOM">Custom</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Level</InputLabel>
            <Select
              value={filters.level || ''}
              onChange={(e) => onFilterChange('level', e.target.value)}
              label="Level"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PLATFORM">Platform</MenuItem>
              <MenuItem value="TENANT">Tenant</MenuItem>
              <MenuItem value="DEPARTMENT">Department</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Search roles..."
            value={filters.searchTerm || ''}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
