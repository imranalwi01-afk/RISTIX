// packages/frontend/src/components/banking/shared/DataTable.tsx
// ============================================================================
// 🧹 CLEANUP: Shared Data Table Component
// ============================================================================
// Purpose: Eliminates duplicate table components and common patterns
// Replaces: Repetitive table structures and search/filter patterns
// ============================================================================

import React from 'react';
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
  IconButton
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
  ariaLabel = 'data table'
}) => {
  const filteredData = searchValue
    ? data.filter(item =>
        columns.some(column =>
          String(item[column.id]).toLowerCase().includes(searchValue.toLowerCase())
        )
      )
    : data;

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
          <Chip label={`${filteredData.length} of ${data.length} records`} variant="outlined" size="small" />
        </Box>
      )}

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                  {column.label}
                </TableCell>
              ))}
              {actionButtons && (
                <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
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
      {filteredData.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          {emptyMessage}
        </Box>
      )}
    </Box>
  );
};

export default DataTable;