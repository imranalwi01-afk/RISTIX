// @ts-nocheck
'use client';
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
  Typography,
  Paper
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
        component={Paper}
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
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
                <SearchIcon fontSize="small" color="primary" />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '12px', 
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
              transition: 'all 0.2s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&.Mui-focused': {
                border: `1px solid ${theme.palette.primary.main}`,
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
              }
            }
          }}
          sx={{ minWidth: { md: 320 }, flexGrow: 1 }}
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
                InputProps: { sx: { borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.03) } }
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
            sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.03) }}
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
            sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.03) }}
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
            sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.03) }}
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Assessment Status</InputLabel>
          <Select
            value={filters.assessmentStatus}
            label="Assessment Status"
            onChange={(e) => onFilterChange('assessmentStatus', e.target.value)}
            sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.03) }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="NEW">Unprocessed (New)</MenuItem>
            <MenuItem value="PENDING">In Assessment (Pending)</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="inherit"
          size="medium"
          startIcon={<ClearIcon />}
          onClick={onReset}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderColor: alpha(theme.palette.divider, 0.2),
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.05)
            },
            transition: 'all 0.2s ease'
          }}
        >
          Reset Filters
        </Button>
      </Stack>
    </Box>
  );
};
