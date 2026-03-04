
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
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            inputRef={searchInputRef}
            placeholder="Search by group, segment, type... (/)"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            sx={{ 
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
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
          />

          <Tooltip title="Shortcut: F">
            <Button 
                variant="outlined" 
                startIcon={<FilterIcon />} 
                onClick={onFilterClick}
                sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
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
                  sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 4,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
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
