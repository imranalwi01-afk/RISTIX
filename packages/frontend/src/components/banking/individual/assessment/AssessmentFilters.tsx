import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { FILTER_DEFAULTS } from '@/app/banking/individual/assessment/constants';
// import { useDebounce } from '@/hooks/useDebounce'; // Removed invalid import

// Simplistic debounce hook if not available globally
function useLocalDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface AssessmentFiltersProps {
  filters: typeof FILTER_DEFAULTS;
  onFilterChange: (field: string, value: string) => void;
  onReset: () => void;
}

export const AssessmentFilters: React.FC<AssessmentFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  // Using 500ms debounce as per spec
  const debouncedSearch = useLocalDebounce(searchTerm, 500);

  // Effect to trigger parent filter change on debounce
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange('search', debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  // Sync internal state if parent updates filter (e.g. reset)
  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        size="small"
        placeholder="Search accounts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onFilterChange('search', searchTerm);
          } else if (e.key === 'Escape') {
            setSearchTerm('');
            onFilterChange('search', '');
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ minWidth: 250 }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Stage</InputLabel>
        <Select
          value={filters.stage}
          label="Stage"
          onChange={(e) => onFilterChange('stage', e.target.value)}
        >
          <MenuItem value="">All Stages</MenuItem>
          <MenuItem value="1">Stage 1</MenuItem>
          <MenuItem value="2">Stage 2</MenuItem>
          <MenuItem value="3">Stage 3</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Impaired Status</InputLabel>
        <Select
          value={filters.impairedFlag}
          label="Impaired Status"
          onChange={(e) => onFilterChange('impairedFlag', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="I">Impaired</MenuItem>
          <MenuItem value="N">Non-Impaired</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priorityLevel}
          label="Priority"
          onChange={(e) => onFilterChange('priorityLevel', e.target.value)}
        >
          <MenuItem value="">All Priorities</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="CRITICAL">Critical</MenuItem>
        </Select>
      </FormControl>

      <Button 
        variant="text" 
        color="inherit" 
        startIcon={<ClearIcon />}
        onClick={onReset}
      >
        Reset Filters
      </Button>
    </Box>
  );
};
