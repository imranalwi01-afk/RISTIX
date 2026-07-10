// packages/frontend/src/app/banking/setup/application/components/ApplicationToolbar.tsx
// ============================================================================
// Application Toolbar - search, filters, export, and add button
// ============================================================================

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

import AddIcon from '@mui/icons-material/Add';
import FilterIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

import { Can } from '@/components/rbac/Can';

interface ApplicationToolbarProps {
  // Search & filter state
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showColumnFilters: boolean;
  setShowColumnFilters: (value: boolean) => void;
  columnFilters: {
    commonCode: string;
    description: string;
    value: string;
    createdBy: string;
  };
  setColumnFilters: (filters: { commonCode: string; description: string; value: string; createdBy: string }) => void;

  // Pagination
  pageSize: number;
  setPaginationModel: (model: { page: number; pageSize: number }) => void;

  // Actions
  loading: boolean;
  hasData: boolean;
  handleCreate: () => void;
  handleExport: (format: 'xlsx' | 'csv' | 'pdf') => void;
  handleResetFilters: () => void;
  handleSaveView: () => void;
}

export function ApplicationToolbar({
  searchTerm,
  setSearchTerm,
  showColumnFilters,
  setShowColumnFilters,
  columnFilters,
  setColumnFilters,
  pageSize,
  setPaginationModel,
  loading,
  hasData,
  handleCreate,
  handleExport,
  handleResetFilters,
  handleSaveView,
}: ApplicationToolbarProps) {
  const [exportAnchorEl, setExportAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={(event) => setExportAnchorEl(event.currentTarget)}
          disabled={loading || !hasData}
        >
          Export
        </Button>

        <Can permission={['banking.setup.application.create']}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Add Application Setting
          </Button>
        </Can>
      </Box>
      <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
        <MenuItem onClick={() => { setExportAnchorEl(null); handleExport('xlsx'); }}>
          <ListItemText>Export to Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setExportAnchorEl(null); handleExport('csv'); }}>
          <ListItemText>Export to CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setExportAnchorEl(null); handleExport('pdf'); }}>
          <ListItemText>Export to PDF</ListItemText>
        </MenuItem>
      </Menu>

      <Box sx={{ display: 'flex', gap: 2, rowGap: 1.5, flexWrap: 'wrap', alignItems: 'center', minWidth: 0, mb: 2 }}>
        <TextField
          placeholder="Search..."
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPaginationModel({ page: 0, pageSize });
          }}
          InputProps={{ startAdornment: <SearchIcon color="action" /> }}
          sx={{ flex: '1 1 260px', minWidth: 0, width: { xs: '100%', sm: 'auto' } }}
        />
        <Button
          variant={showColumnFilters ? 'contained' : 'outlined'}
          onClick={() => setShowColumnFilters(!showColumnFilters)}
          startIcon={<FilterIcon />}
        >
          Filters
        </Button>
        <Button onClick={() => { void handleResetFilters(); }}>
          <ClearIcon /> Clear
        </Button>
        <Button variant="text" onClick={handleSaveView}>
          Save View
        </Button>
      </Box>

      {showColumnFilters && (
        <Box sx={{ display: 'flex', gap: 2, rowGap: 1.5, flexWrap: 'wrap', mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, minWidth: 0 }}>
          <TextField sx={{ flex: '1 1 180px', minWidth: 0 }} label="Code" size="small" value={columnFilters.commonCode} onChange={e => { setColumnFilters({ ...columnFilters, commonCode: e.target.value }); setPaginationModel({ page: 0, pageSize }); }} />
          <TextField sx={{ flex: '1 1 220px', minWidth: 0 }} label="Description" size="small" value={columnFilters.description} onChange={e => { setColumnFilters({ ...columnFilters, description: e.target.value }); setPaginationModel({ page: 0, pageSize }); }} />
          <TextField sx={{ flex: '1 1 180px', minWidth: 0 }} label="Value" size="small" value={columnFilters.value} onChange={e => { setColumnFilters({ ...columnFilters, value: e.target.value }); setPaginationModel({ page: 0, pageSize }); }} />
          <TextField sx={{ flex: '1 1 180px', minWidth: 0 }} label="Created By" size="small" value={columnFilters.createdBy} onChange={e => { setColumnFilters({ ...columnFilters, createdBy: e.target.value }); setPaginationModel({ page: 0, pageSize }); }} />
        </Box>
      )}
    </>
  );
}
