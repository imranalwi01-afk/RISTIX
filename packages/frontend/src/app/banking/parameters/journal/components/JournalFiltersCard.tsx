'use client';

import React, { memo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Clear as ClearIcon, FilterList as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import type { JournalDropdownOption } from './JournalFormDialog';

interface JournalFiltersCardProps {
  searchTerm: string;
  filterGlGroup: string;
  filterCurrency: string;
  filterActive: 'all' | 'active' | 'inactive';
  totalRows: number;
  filteredRows: number;
  glGroupOptions: JournalDropdownOption[];
  currencyOptions: JournalDropdownOption[];
  onSearchChange: (value: string) => void;
  onGlGroupChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onActiveChange: (value: 'all' | 'active' | 'inactive') => void;
  onApply: () => void;
  onClear: () => void;
}

const JournalFiltersCard = memo(function JournalFiltersCard({
  searchTerm,
  filterGlGroup,
  filterCurrency,
  filterActive,
  totalRows,
  filteredRows,
  glGroupOptions,
  currencyOptions,
  onSearchChange,
  onGlGroupChange,
  onCurrencyChange,
  onActiveChange,
  onApply,
  onClear,
}: JournalFiltersCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by GL Code, Description, or GL Number"
            variant="outlined"
            size="small"
            sx={{ flex: '1 1 300px', minWidth: 200 }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            inputProps={{ 'data-testid': 'input-search-journal' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>GL Group</InputLabel>
            <Select value={filterGlGroup} onChange={(e) => onGlGroupChange(e.target.value)} label="GL Group">
              <MenuItem value="">All</MenuItem>
              {glGroupOptions.map((option, idx) => (
                <MenuItem key={`${option.id}-${idx}`} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Currency</InputLabel>
            <Select value={filterCurrency} onChange={(e) => onCurrencyChange(e.target.value)} label="Currency">
              <MenuItem value="">All</MenuItem>
              {currencyOptions.map((option, idx) => (
                <MenuItem key={`${option.id}-${idx}`} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterActive} onChange={(e) => onActiveChange(e.target.value as 'all' | 'active' | 'inactive')} label="Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" size="small" onClick={onApply} startIcon={<FilterIcon />}>
              Apply
            </Button>
            <Button variant="outlined" size="small" onClick={onClear} startIcon={<ClearIcon />} data-testid="btn-reset-journal-filters">
              Clear
            </Button>
          </Box>
        </Box>

        {filteredRows !== totalRows && (
          <Box sx={{ mt: 2 }}>
            <Chip label={`Showing ${filteredRows} of ${totalRows} records`} color="primary" variant="outlined" size="small" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

export default JournalFiltersCard;
