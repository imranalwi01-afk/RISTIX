// packages/frontend/src/components/banking/shared/DataTable.tsx
// ============================================================================
// Shared Data Table Component
// ============================================================================

import React, { useMemo, useState } from 'react';
import { Box, Chip, IconButton, TextField, Tooltip } from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string | React.ReactNode;
  filterable?: boolean;
  sortable?: boolean;
}

interface ActionButtons {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  editTooltip?: string;
  deleteTooltip?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actionButtons?: ActionButtons;
  emptyMessage?: string;
  ariaLabel?: string;
  enableColumnFilters?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  actionButtons,
  emptyMessage = 'No records found',
  ariaLabel = 'data table',
  enableColumnFilters = true,
}) => {
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    const globalQuery = searchValue.trim().toLowerCase();
    const activeColumnFilters = Object.entries(columnFilters).filter(([, value]) => value.trim());

    return data.filter((item) => {
      const matchesGlobal = globalQuery
        ? columns.some((column) => String(item[column.id] ?? '').toLowerCase().includes(globalQuery))
        : true;

      if (!matchesGlobal) return false;

      return activeColumnFilters.every(([columnId, filterValue]) => {
        const column = columns.find((candidate) => candidate.id === columnId);
        if (!column || column.filterable === false) return true;

        const rawValue = item[columnId];
        const formattedValue = column.format ? column.format(rawValue) : rawValue;
        const searchable = `${String(rawValue ?? '')} ${typeof formattedValue === 'string' || typeof formattedValue === 'number' ? String(formattedValue) : ''}`.toLowerCase();

        return searchable.includes(filterValue.trim().toLowerCase());
      });
    });
  }, [columnFilters, columns, data, searchValue]);

  const gridColumns = useMemo<GridColDef[]>(() => {
    const baseColumns: GridColDef[] = columns.map((column) => ({
      field: column.id,
      headerName: column.label,
      minWidth: column.minWidth,
      flex: column.minWidth ? undefined : 1,
      align: column.align,
      filterable: column.filterable,
      sortable: column.sortable,
      renderCell: column.format
        ? (params) => column.format?.(params.value)
        : undefined,
    }));

    if (!actionButtons) return baseColumns;

    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 112,
        filterable: false,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {actionButtons.onEdit && (
              <Tooltip title={actionButtons.editTooltip || 'Edit'}>
                <IconButton
                  size="small"
                  onClick={() => actionButtons.onEdit?.(params.row.id || params.row.pkid)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {actionButtons.onDelete && (
              <Tooltip title={actionButtons.deleteTooltip || 'Delete'}>
                <IconButton
                  size="small"
                  onClick={() => actionButtons.onDelete?.(params.row.id || params.row.pkid)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ];
  }, [actionButtons, columns]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
      {onSearchChange && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Chip label={`${filteredData.length} of ${data.length} records`} variant="outlined" size="small" />
        </Box>
      )}

      <SafeDataGrid
        rows={filteredData}
        columns={gridColumns}
        loading={loading}
        getRowId={(row) => row.id || row.pkid || row.code || row.name || JSON.stringify(row)}
        enableColumnFilters={enableColumnFilters}
        disableRowSelectionOnClick
        hideFooterPagination
        tableStateKey={`banking-shared-data-table:${ariaLabel}`}
        fillAvailableHeight
        maxTableHeight="none"
      />

      {filteredData.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
          {emptyMessage}
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
