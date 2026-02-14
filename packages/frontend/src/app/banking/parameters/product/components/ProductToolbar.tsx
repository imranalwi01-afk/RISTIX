import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ProductToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onExportClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAddClick: () => void;
  onRefreshClick: () => void;
  loading: boolean;
  activeFilterCount: number;
  canManage: boolean;
  canExport: boolean;
}

export default function ProductToolbar({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onExportClick,
  onAddClick,
  onRefreshClick,
  loading,
  activeFilterCount,
  canManage,
  canExport
}: ProductToolbarProps) {
  return (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
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
          startIcon={<FilterIcon />}
          onClick={onFilterClick}
          sx={{ whiteSpace: 'nowrap' }}
          color={activeFilterCount > 0 ? "primary" : "inherit"}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Tooltip title="Refresh Data">
          <IconButton onClick={onRefreshClick} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {canExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportClick}
            disabled={loading}
          >
            Export
          </Button>
        )}
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            disabled={loading}
          >
            Add Product
          </Button>
        )}
      </Stack>
    </Box>
  );
}
