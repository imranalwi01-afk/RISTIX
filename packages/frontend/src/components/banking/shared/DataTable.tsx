// packages/frontend/src/components/banking/shared/DataTable.tsx
// ============================================================================
// 🧹 CLEANUP: Shared Data Table Component
// ============================================================================
// Purpose: Eliminates duplicate table components and common patterns
// Replaces: Repetitive table structures and search/filter patterns
// ============================================================================

import React, { useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  Tooltip,
  IconButton,
  TableSortLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

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
  enableColumnFilters = true
}) => {
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortModel, setSortModel] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredData = useMemo(() => {
    const globalQuery = searchValue.trim().toLowerCase();
    const activeColumnFilters = Object.entries(columnFilters).filter(([, value]) => value.trim());

    return data.filter(item => {
      const matchesGlobal = globalQuery
        ? columns.some(column => String(item[column.id] ?? '').toLowerCase().includes(globalQuery))
        : true;

      if (!matchesGlobal) return false;

      return activeColumnFilters.every(([columnId, filterValue]) => {
        const column = columns.find(candidate => candidate.id === columnId);
        if (!column || column.filterable === false) return true;

        const rawValue = item[columnId];
        const formattedValue = column.format ? column.format(rawValue) : rawValue;
        const searchable = `${String(rawValue ?? '')} ${typeof formattedValue === 'string' || typeof formattedValue === 'number' ? String(formattedValue) : ''}`.toLowerCase();

        return searchable.includes(filterValue.trim().toLowerCase());
      });
    });
  }, [columnFilters, columns, data, searchValue]);

  const handleColumnFilterChange = (columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev, [columnId]: value };
      if (!value.trim()) delete next[columnId];
      return next;
    });
  };

  const compareValues = (left: any, right: any): number => {
    if (left === right) return 0;
    if (left === null || left === undefined) return 1;
    if (right === null || right === undefined) return -1;

    const leftNumber = typeof left === 'number' ? left : Number(left);
    const rightNumber = typeof right === 'number' ? right : Number(right);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
      return leftNumber - rightNumber;
    }

    const leftDate = left instanceof Date ? left.getTime() : Date.parse(String(left));
    const rightDate = right instanceof Date ? right.getTime() : Date.parse(String(right));
    if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
      return leftDate - rightDate;
    }

    return String(left).localeCompare(String(right), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };

  const sortedData = useMemo(() => {
    if (!sortModel) return filteredData;

    const column = columns.find(candidate => candidate.id === sortModel.field);
    if (!column || column.sortable === false) return filteredData;

    return [...filteredData].sort((left, right) => {
      const result = compareValues(left[sortModel.field], right[sortModel.field]);
      return sortModel.direction === 'asc' ? result : -result;
    });
  }, [columns, filteredData, sortModel]);

  const handleSortChange = (column: Column) => {
    if (column.sortable === false) return;

    setSortModel((prev) => {
      if (prev?.field !== column.id) return { field: column.id, direction: 'asc' };
      if (prev.direction === 'asc') return { field: column.id, direction: 'desc' };
      return null;
    });
  };

  return (
    <Box>
      {/* Search Bar */}
      {onSearchChange && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Chip label={`${sortedData.length} of ${data.length} records`} variant="outlined" size="small" />
        </Box>
      )}

      {/* Data Table */}
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Table
          sx={{ minWidth: 650 }}
          aria-label={ariaLabel}
          size="small"
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
                >
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <TableSortLabel
                      active={sortModel?.field === column.id}
                      direction={sortModel?.field === column.id ? sortModel.direction : 'asc'}
                      onClick={() => handleSortChange(column)}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              {actionButtons && (
                <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
            {enableColumnFilters && (
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={`${column.id}-filter`}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth }}
                    sx={{ backgroundColor: 'background.paper', pt: 0.5, pb: 1 }}
                  >
                    {column.filterable === false ? null : (
                      <TextField
                        variant="standard"
                        size="small"
                        fullWidth
                        placeholder="Search"
                        value={columnFilters[column.id] || ''}
                        onChange={(event) => handleColumnFilterChange(column.id, event.target.value)}
                        inputProps={{ 'aria-label': `Search ${column.label}` }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: '0.8rem',
                            py: 0.75,
                          },
                        }}
                      />
                    )}
                  </TableCell>
                ))}
                {actionButtons && <TableCell sx={{ backgroundColor: 'background.paper' }} />}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                  >
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </TableCell>
                ))}
                {actionButtons && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {actionButtons.onEdit && (
                        <Tooltip title={actionButtons.editTooltip || 'Edit'}>
                          <IconButton
                            size="small"
                            onClick={() => actionButtons.onEdit!(row.id || row.pkid)}
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
                            onClick={() => actionButtons.onDelete!(row.id || row.pkid)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {sortedData.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          {emptyMessage}
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
