
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Chip,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface SegmentationToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFilterClick: () => void;
  onAddClick: () => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  canManage?: boolean;
}

export const SegmentationToolbar: React.FC<SegmentationToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
  onAddClick,
  activeFiltersCount,
  onClearFilters,
  searchInputRef,
  canManage = false
}) => {
  return (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.25 }, '&:last-child': { pb: { xs: 2, md: 2.25 } } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            inputRef={searchInputRef}
            placeholder="Search by group, segment, type... (/)"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            sx={{ 
                flex: '1 1 420px',
                '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    backgroundColor: '#f8fafc',
                    '&:hover': {
                        backgroundColor: '#f1f5f9',
                    },
                    '&.Mui-focused': {
                        backgroundColor: '#fff',
                    }
                }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              )
            }}
            inputProps={{ 'data-testid': 'segment-search-input' }}
          />

          <Tooltip title="Shortcut: F">
            <Button 
                variant="outlined" 
                startIcon={<FilterIcon />} 
                onClick={onFilterClick}
                sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 2.25,
                    minHeight: 40,
                    borderColor: activeFiltersCount > 0 ? 'primary.main' : 'divider',
                    color: activeFiltersCount > 0 ? 'primary.main' : 'text.secondary',
                    position: 'relative'
                }}
            >
              Filters
              {activeFiltersCount > 0 && (
                  <Box 
                    sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: 20, 
                        height: 20, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        border: '2px solid white'
                    }}
                  >
                      {activeFiltersCount}
                  </Box>
              )}
            </Button>
          </Tooltip>

          {canManage && (
            <Tooltip title="Shortcut: A">
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAddClick}
                  data-testid="add-segmentation-btn"
                  sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 3,
                      minHeight: 40,
                      boxShadow: '0 8px 18px rgba(2, 132, 199, 0.22)'
                  }}
              >
                Add Segmentation
              </Button>
            </Tooltip>
          )}
        </Stack>

        {activeFiltersCount > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
                Active Filters:
            </Typography>
            <Chip 
                label={`${activeFiltersCount} applied`} 
                size="small" 
                onDelete={onClearFilters}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 1.5 }}
            />
            <Button 
                variant="text" 
                size="small" 
                onClick={onClearFilters}
                sx={{ 
                    textTransform: 'none', 
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' }
                }}
            >
              Clear All
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
