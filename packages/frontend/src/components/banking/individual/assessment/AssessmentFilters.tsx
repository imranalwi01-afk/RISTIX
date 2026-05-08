// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Search as SearchIcon, Clear as ClearIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
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
  mode?: string;
}

export const AssessmentFilters: React.FC<AssessmentFiltersProps> = ({ filters, onFilterChange, onReset, mode }) => {
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
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filters & Search
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{
          p: 2.5,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap'
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name, CIF, or account..."
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
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 1.5, bgcolor: 'action.hover' }
          }}
          sx={{ minWidth: { md: 300 }, flexGrow: 1 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Download Date"
            value={filters.downloadDate ? dayjs(filters.downloadDate) : null}
            onChange={(newValue) => {
              const formattedDate = newValue
                ? (dayjs.isDayjs(newValue)
                    ? (newValue as Dayjs).format('YYYY-MM-DD')
                    : dayjs(newValue as Date).format('YYYY-MM-DD'))
                : '';
              onFilterChange('downloadDate', formattedDate);
            }}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 180 },
                InputProps: { sx: { borderRadius: 1.5 } }
              }
            }}
            format="DD/MM/YYYY"
          />
        </LocalizationProvider>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Stage</InputLabel>
          <Select
            value={filters.stage}
            label="Stage"
            onChange={(e) => onFilterChange('stage', e.target.value)}
            sx={{ borderRadius: 1.5 }}
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
            sx={{ borderRadius: 1.5 }}
          >
            <MenuItem value="">All Status</MenuItem>
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
            sx={{ borderRadius: 1.5 }}
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.assessmentStatus}
            label="Status"
            onChange={(e) => onFilterChange('assessmentStatus', e.target.value)}
            sx={{ borderRadius: 1.5 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="SUBMITTED">Submitted</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="error"
          size="medium"
          startIcon={<ClearIcon />}
          onClick={onReset}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: 'error.lighter'
            }
          }}
        >
          Clear All
        </Button>
      </Stack>
    </Box>
  );
};
