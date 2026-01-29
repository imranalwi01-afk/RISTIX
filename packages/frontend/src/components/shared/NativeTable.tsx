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
  renderCell?: (params: { row: T; value: any }) => React.ReactNode;
  valueGetter?: (params: { row: T }) => any;
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
}

/**
 * A native HTML table component with pagination, selection, and responsive support
 * @template T - The row data type (optional, defaults to any for backwards compatibility)
 */
export function NativeTable<T = any>({
  rows,
  columns,
  loading = false,
  getRowId = (row: T) => (row as any).id,
  pageSizeOptions = [5, 10, 25, 50],
  initialState,
  checkboxSelection = false,
  onRowSelectionModelChange,
  rowSelectionModel = [],
  sx,
  getDetailPanelContent,
  getDetailPanelHeight = () => 'auto',
  responsiveMode = 'scroll', // Default to horizontal scroll
}: NativeTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(initialState?.pagination?.paginationModel?.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(
    initialState?.pagination?.paginationModel?.pageSize || pageSizeOptions[0]
  );
  const [selected, setSelected] = useState<Set<any>>(new Set(rowSelectionModel));
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set());

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

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

          return (
            <Card key={rowId} sx={{ mb: 2, border: isSelected ? `2px solid ${theme.palette.primary.main}` : undefined }}>
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
                            {column.renderCell ? column.renderCell({ row, value }) : value}
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
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    );
  }

  // Desktop Table View (or mobile with horizontal scroll)
  return (
    <Box sx={{ width: '100%', overflow: 'auto', ...sx }}>
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

                return (
                  <React.Fragment key={rowId}>
                    <TableRow hover selected={isSelected}>
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
                        return (
                          <TableCell key={String(column.field)} align={column.align || 'left'}>
                            {column.renderCell ? column.renderCell({ row, value }) : value}
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
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
