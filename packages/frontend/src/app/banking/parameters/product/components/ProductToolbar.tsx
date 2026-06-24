'use client';

import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface ProductToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  loading: boolean;
  activeFilterCount: number;
}

export default function ProductToolbar({
  searchTerm,
  onSearchChange,
  onFilterClick,
  loading,
  activeFilterCount,
}: ProductToolbarProps) {
  return (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      gap: 2,
      bgcolor: 'background.paper',
      borderRadius: 1,
      mb: 2
    }}>
      <Stack direction="row" spacing={2} sx={{ flexGrow: 1, maxWidth: 600 }}>
        <TextField
          placeholder="Search by Code or Description..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          inputProps={{ 'data-testid': 'input-search-product' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={onFilterClick}
          data-testid="btn-filter-product"
          sx={{ whiteSpace: 'nowrap' }}
          color={activeFilterCount > 0 ? "primary" : "inherit"}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </Stack>
    </Box>
  );
}
