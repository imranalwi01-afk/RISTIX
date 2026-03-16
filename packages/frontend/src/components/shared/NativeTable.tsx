'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Checkbox,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Divider,
  Collapse,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

/**
 * Column definition for NativeTable
 * @template T - The row data type (optional, defaults to any)
 */
export interface NativeTableColumn<T = any> {
  field: Extract<keyof T, string> | (string & {});
  headerName: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  renderCell?: (params: { row: T; value: any; formattedValue: any }) => React.ReactNode;
  valueGetter?: (params: { row: T }) => any;
  valueFormatter?: (value: any, row: T) => any;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions';
  hideMobile?: boolean; // Hide column on mobile
}

/**
 * Props for NativeTable component
 * @template T - The row data type (optional, defaults to any)
 */
export interface NativeTableProps<T = any> {
  rows: T[];
  columns: NativeTableColumn<T>[];
  loading?: boolean;
  getRowId?: (row: T) => string | number;
  getRowSx?: (params: { row: T; id: string | number }) => any;
  pageSizeOptions?: number[];
  initialState?: {
    pagination?: {
      paginationModel?: {
        pageSize?: number;
        page?: number;
      };
    };
  };
  disableRowSelectionOnClick?: boolean;
  checkboxSelection?: boolean;
  onRowSelectionModelChange?: (ids: (string | number)[]) => void;
  rowSelectionModel?: (string | number)[];
  sx?: any;
  // Detail panel support
  getDetailPanelContent?: (params: { row: T }) => React.ReactNode;
  getDetailPanelHeight?: (params: { row: T }) => number | 'auto';
  // Responsive mode: 'cards' (mobile cards) or 'scroll' (horizontal scroll)
  responsiveMode?: 'cards' | 'scroll';

  // Controlled pagination props (for server-side pagination)
  count?: number; // Total number of rows (if different from rows.length)
  page?: number; // Zero-based page index
  onPageChange?: (event: unknown, newPage: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Global UI controls
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
}

/**
 * A native HTML table component with pagination, selection, and responsive support
 * @template T - The row data type (optional, defaults to any for backwards compatibility)
 */
export function NativeTable<T = any>({
  rows = [],
  columns,
  loading = false,
  getRowId = (row: T) => (row as any).id,
  getRowSx,
  pageSizeOptions = [5, 10, 25, 50],
  initialState,
  checkboxSelection = false,
  onRowSelectionModelChange,
  rowSelectionModel = [],
  sx,
  getDetailPanelContent,
  getDetailPanelHeight = () => 'auto',
  responsiveMode = 'scroll', // Default to horizontal scroll
  count,
  page: propPage,
  onPageChange: propOnPageChange,
  rowsPerPage: propRowsPerPage,
  onRowsPerPageChange: propOnRowsPerPageChange,
  hideFooter = false,
  hideFooterPagination = false,
}: NativeTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Internal state for uncontrolled pagination
  const [internalPage, setInternalPage] = useState(initialState?.pagination?.paginationModel?.page || 0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(
    initialState?.pagination?.paginationModel?.pageSize || pageSizeOptions[0]
  );

  // Use controlled props if available, otherwise internal state
  const page = propPage !== undefined ? propPage : internalPage;
  const rowsPerPage = propRowsPerPage !== undefined ? propRowsPerPage : internalRowsPerPage;

  const [selected, setSelected] = useState<Set<any>>(new Set(rowSelectionModel));
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set());

  const handleChangePage = (event: unknown, newPage: number) => {
    if (propOnPageChange) {
      propOnPageChange(event, newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (propOnRowsPerPageChange) {
      propOnRowsPerPageChange(event);
    } else {
      setInternalRowsPerPage(parseInt(event.target.value, 10));
      setInternalPage(0);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(rows.map((row) => getRowId(row)));
      setSelected(newSelected);
      onRowSelectionModelChange?.(Array.from(newSelected));
    } else {
      setSelected(new Set());
      onRowSelectionModelChange?.([]);
    }
  };

  const handleSelect = (id: any) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onRowSelectionModelChange?.(Array.from(newSelected));
  };

  const handleToggleExpand = (id: any) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const paginatedRows = useMemo(() => {
    // If count is provided (server-side pagination), rows usually contains just the current page data
    // So we don't slice unless rows.length > rowsPerPage (which might indicate a cache or pre-fetch, but typically server returns page)
    if (count !== undefined) {
      return rows;
    }
    // Client-side pagination: slice the full rows array
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage, count]);

  const visibleColumns = useMemo(() => {
    if (isMobile && responsiveMode === 'cards') {
      return columns.filter(col => !col.hideMobile);
    }
    return columns;
  }, [columns, isMobile, responsiveMode]);

  const getCellValue = (row: any, column: NativeTableColumn) => {
    if (column.valueGetter) {
      return column.valueGetter({ row });
    }
    return row[column.field];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, ...sx }}>
        <CircularProgress />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, ...sx }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  // Mobile Card View (only if responsiveMode is 'cards')
  if (isMobile && responsiveMode === 'cards') {
    return (
      <Box sx={{ width: '100%', ...sx }}>
        {paginatedRows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selected.has(rowId);
          const isExpanded = expandedRows.has(rowId);
          const rowSx = getRowSx?.({ row, id: rowId });

          return (
            <Card
              key={rowId}
              sx={{
                mb: 2,
                border: isSelected ? `2px solid ${theme.palette.primary.main}` : undefined,
                ...rowSx,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getDetailPanelContent && (
                    <IconButton size="small" onClick={() => handleToggleExpand(rowId)}>
                      {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  )}
                  {checkboxSelection && (
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelect(rowId)}
                    />
                  )}
                </Box>
                <Grid container spacing={1}>
                  {visibleColumns.map((column, idx) => {
                    const value = getCellValue(row, column);
                    return (
                      <React.Fragment key={String(column.field)}>
                        {idx > 0 && <Grid size={{ xs: 12 }}><Divider /></Grid>}
                        <Grid size={{ xs: 5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {column.headerName}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 7 }}>
                          <Typography variant="body2">
                            {(() => {
                              const value = getCellValue(row, column);
                              const formattedValue = column.valueFormatter ? column.valueFormatter(value, row) : value;
                              return column.renderCell ? column.renderCell({ row, value, formattedValue }) : formattedValue;
                            })()}
                          </Typography>
                        </Grid>
                      </React.Fragment>
                    );
                  })}
                </Grid>
                {getDetailPanelContent && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      {getDetailPanelContent({ row }) as any}
                    </Box>
                  </Collapse>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!hideFooter && !hideFooterPagination && (
          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={count !== undefined ? count : rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Box>
    );
  }

  // Desktop Table View (or mobile with horizontal scroll)
  return (
    <Box sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      <Paper sx={{
        width: 0,
        minWidth: '100%',
      }}>
        <TableContainer sx={{
          maxHeight: 600,
          overflowX: 'auto',
          overflowY: 'auto',
        }}>
          <Table stickyHeader sx={{ minWidth: isMobile ? 800 : 'auto' }}>
            <TableHead>
              <TableRow>
                {getDetailPanelContent && <TableCell />}
                {checkboxSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.size > 0 && selected.size < rows.length}
                      checked={rows.length > 0 && selected.size === rows.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell
                    key={String(column.field)}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth || column.width }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selected.has(rowId);
                const isExpanded = expandedRows.has(rowId);
                const rowSx = getRowSx?.({ row, id: rowId });

                return (
                  <React.Fragment key={rowId}>
                    <TableRow hover selected={isSelected} sx={rowSx}>
                      {getDetailPanelContent && (
                        <TableCell>
                          <IconButton size="small" onClick={() => handleToggleExpand(rowId)}>
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                      )}
                      {checkboxSelection && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelect(rowId)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => {
                        const value = getCellValue(row, column);
                        const formattedValue = column.valueFormatter ? column.valueFormatter(value, row) : value;
                        return (
                          <TableCell key={String(column.field)} align={column.align || 'left'}>
                            {column.renderCell ? column.renderCell({ row, value, formattedValue }) : formattedValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {getDetailPanelContent && (
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={visibleColumns.length + (checkboxSelection ? 2 : 1)}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              {getDetailPanelContent({ row }) as any}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {!hideFooter && !hideFooterPagination && (
          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={count !== undefined ? count : rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
}
