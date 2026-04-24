'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  TextField,
  TableSortLabel,
  Button,
  Chip,
  Stack,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseFilterDefinition, EnterprisePaginationMode, EnterpriseTableQueryState } from '@/types/enterprise-table';

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
  filterable?: boolean;
  sortable?: boolean;
}

export type NativeTableSortDirection = 'asc' | 'desc';
export type NativeTableSortModel = Array<{ field: string; sort: NativeTableSortDirection }>;

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
  onRowDoubleClick?: (params: { row: T; id: string | number }) => void;
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

  // Per-column search controls
  enableColumnFilters?: boolean;
  columnFilters?: Record<string, EnterpriseColumnFilterValue>;
  onColumnFiltersChange?: (filters: Record<string, EnterpriseColumnFilterValue>) => void;
  columnFilterPlaceholder?: string;
  filterDefinitions?: Record<string, EnterpriseFilterDefinition>;
  filteringMode?: 'client' | 'server';

  // Per-column sorting controls
  disableColumnSorting?: boolean;
  sortModel?: NativeTableSortModel;
  onSortModelChange?: (sortModel: NativeTableSortModel) => void;
  sortingMode?: 'client' | 'server';
  paginationMode?: EnterprisePaginationMode | 'server';
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  density?: EnterpriseDensity;
  onDensityChange?: (density: EnterpriseDensity) => void;
  showEnterpriseControls?: boolean;
  onSaveView?: () => void;
  onResetView?: () => void;
  onQueryChange?: (queryState: EnterpriseTableQueryState) => void;
}

const COLUMN_FILTER_COMMIT_DEBOUNCE_MS = 350;

interface DebouncedFilterTextFieldProps {
  value: string;
  placeholder: string;
  ariaLabel: string;
  minWidth?: number;
  onCommit: (value: string) => void;
}

const DebouncedFilterTextField = React.memo(function DebouncedFilterTextField({
  value,
  placeholder,
  ariaLabel,
  minWidth,
  onCommit,
}: DebouncedFilterTextFieldProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    if (draftValue === value) return;

    const timer = window.setTimeout(() => {
      onCommit(draftValue);
    }, COLUMN_FILTER_COMMIT_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draftValue, onCommit, value]);

  return (
    <TextField
      variant="standard"
      placeholder={placeholder}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      size="small"
      fullWidth
      inputProps={{ 'aria-label': ariaLabel }}
      sx={{
        minWidth,
        '& .MuiInputBase-input': {
          fontSize: '0.8rem',
          py: 0.75,
        },
      }}
    />
  );
});

function isFilterValueBlank(value: EnterpriseColumnFilterValue) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

function normalizeFilterMap(filters: Record<string, EnterpriseColumnFilterValue>) {
  const nextFilters: Record<string, EnterpriseColumnFilterValue> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (!isFilterValueBlank(value)) {
      nextFilters[key] = value;
    }
  });

  return nextFilters;
}

function areFilterMapsEqual(
  left: Record<string, EnterpriseColumnFilterValue>,
  right: Record<string, EnterpriseColumnFilterValue>,
) {
  const leftEntries = Object.entries(normalizeFilterMap(left));
  const rightEntries = Object.entries(normalizeFilterMap(right));

  if (leftEntries.length !== rightEntries.length) return false;

  return leftEntries.every(([key, value]) => {
    const rightValue = right[key];
    return JSON.stringify(value) === JSON.stringify(rightValue);
  });
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
  onRowDoubleClick,
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
  enableColumnFilters = true,
  columnFilters,
  onColumnFiltersChange,
  columnFilterPlaceholder = 'Search',
  filterDefinitions = {},
  filteringMode,
  disableColumnSorting = false,
  sortModel,
  onSortModelChange,
  sortingMode = 'client',
  paginationMode = 'client',
  columnVisibilityModel = {},
  onColumnVisibilityModelChange,
  density = 'standard',
  onDensityChange,
  showEnterpriseControls = false,
  onSaveView,
  onResetView,
  onQueryChange,
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
  const [internalColumnFilters, setInternalColumnFilters] = useState<Record<string, EnterpriseColumnFilterValue>>({});
  const [draftColumnFilters, setDraftColumnFilters] = useState<Record<string, EnterpriseColumnFilterValue>>(columnFilters ?? {});
  const [internalSortModel, setInternalSortModel] = useState<NativeTableSortModel>([]);
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState<null | HTMLElement>(null);

  const effectiveColumnFilters = columnFilters ?? internalColumnFilters;
  const effectiveSortModel = sortModel ?? internalSortModel;
  const activeSort = effectiveSortModel[0];
  const effectiveFilteringMode = filteringMode ?? (paginationMode === 'client' ? 'client' : 'server');

  useEffect(() => {
    if (columnFilters !== undefined) {
      setDraftColumnFilters((current) => (
        areFilterMapsEqual(current, columnFilters) ? current : columnFilters
      ));
    }
  }, [columnFilters]);

  useEffect(() => {
    if (columnFilters === undefined) {
      setDraftColumnFilters((current) => (
        areFilterMapsEqual(current, internalColumnFilters) ? current : internalColumnFilters
      ));
    }
  }, [columnFilters, internalColumnFilters]);

  useEffect(() => {
    onQueryChange?.({
      paginationMode: paginationMode === 'cursor' ? 'cursor' : paginationMode === 'client' ? 'client' : 'offset',
      paginationModel: { page, pageSize: rowsPerPage },
      columnFilters: effectiveColumnFilters,
      sort: effectiveSortModel.map((item) => ({ field: item.field, direction: item.sort })),
      columnVisibilityModel,
      density,
    });
  }, [
    columnVisibilityModel,
    density,
    effectiveColumnFilters,
    effectiveSortModel,
    onQueryChange,
    page,
    paginationMode,
    rowsPerPage,
  ]);

  useEffect(() => {
    if (areFilterMapsEqual(draftColumnFilters, effectiveColumnFilters)) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextFilters = normalizeFilterMap(draftColumnFilters);

      if (columnFilters === undefined) {
        setInternalColumnFilters(nextFilters);
      }
      onColumnFiltersChange?.(nextFilters);

      if (propOnPageChange) {
        propOnPageChange(null, 0);
      } else {
        setInternalPage(0);
      }
    }, COLUMN_FILTER_COMMIT_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    columnFilters,
    draftColumnFilters,
    effectiveColumnFilters,
    onColumnFiltersChange,
    propOnPageChange,
  ]);

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

  const visibleColumns = useMemo(() => {
    const enabledColumns = columns.filter((col) => columnVisibilityModel[String(col.field)] !== false);
    if (isMobile && responsiveMode === 'cards') {
      return enabledColumns.filter(col => !col.hideMobile);
    }
    return enabledColumns;
  }, [columns, columnVisibilityModel, isMobile, responsiveMode]);

  const getCellValue = (row: any, column: NativeTableColumn) => {
    if (column.valueGetter) {
      return column.valueGetter({ row });
    }
    return row[column.field];
  };

  const stringifyForFilter = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (React.isValidElement(value)) return '';
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const isColumnFilterable = (column: NativeTableColumn) => {
    return enableColumnFilters && column.type !== 'actions' && column.filterable !== false;
  };

  const isColumnSortable = (column: NativeTableColumn) => {
    return !disableColumnSorting && column.type !== 'actions' && column.sortable !== false;
  };

  const hasActiveColumnFilters = useMemo(() => {
    return Object.values(effectiveColumnFilters).some((value) => String(value ?? '').trim().length > 0);
  }, [effectiveColumnFilters]);

  const filteredRows = useMemo(() => {
    if (effectiveFilteringMode === 'server') return rows;
    if (!hasActiveColumnFilters) return rows;

    return rows.filter((row) => {
      return visibleColumns.every((column) => {
        if (!isColumnFilterable(column)) return true;

        const query = String(effectiveColumnFilters[String(column.field)] || '').trim().toLowerCase();
        if (!query) return true;

        const rawValue = getCellValue(row, column);
        const formattedValue = column.valueFormatter ? column.valueFormatter(rawValue, row) : rawValue;
        const searchable = `${stringifyForFilter(rawValue)} ${stringifyForFilter(formattedValue)}`.toLowerCase();

        return searchable.includes(query);
      });
    });
  }, [rows, visibleColumns, effectiveColumnFilters, hasActiveColumnFilters, effectiveFilteringMode]);

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

  const sortedRows = useMemo(() => {
    if (!activeSort || sortingMode === 'server') return filteredRows;

    const sortColumn = visibleColumns.find((column) => String(column.field) === activeSort.field);
    if (!sortColumn || !isColumnSortable(sortColumn)) return filteredRows;

    return [...filteredRows].sort((leftRow, rightRow) => {
      const leftValue = getCellValue(leftRow, sortColumn);
      const rightValue = getCellValue(rightRow, sortColumn);
      const result = compareValues(leftValue, rightValue);
      return activeSort.sort === 'asc' ? result : -result;
    });
  }, [activeSort, filteredRows, sortingMode, visibleColumns]);

  const paginatedRows = useMemo(() => {
    // If count is provided (server-side pagination), rows usually contains just the current page data.
    if (count !== undefined || paginationMode !== 'client') {
      return sortedRows;
    }
    // Client-side pagination: filter first, then slice.
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage, count, paginationMode]);

  const handleColumnFilterChange = (field: string, value: EnterpriseColumnFilterValue) => {
    const nextFilters = {
      ...draftColumnFilters,
      [field]: value,
    };

    if (isFilterValueBlank(value)) {
      delete nextFilters[field];
    }
    setDraftColumnFilters(nextFilters);
  };

  const handleColumnFilterCommit = (field: string, value: EnterpriseColumnFilterValue) => {
    const nextFilters = {
      ...effectiveColumnFilters,
      [field]: value,
    };

    if (isFilterValueBlank(value)) {
      delete nextFilters[field];
    }

    const normalizedFilters = normalizeFilterMap(nextFilters);
    setDraftColumnFilters(normalizedFilters);

    if (columnFilters === undefined) {
      setInternalColumnFilters(normalizedFilters);
    }
    onColumnFiltersChange?.(normalizedFilters);

    if (propOnPageChange) {
      propOnPageChange(null, 0);
    } else {
      setInternalPage(0);
    }
  };

  const showColumnFilters = enableColumnFilters && visibleColumns.some(isColumnFilterable);
  const paginationCount = count !== undefined ? count : filteredRows.length;
  const activeFilterEntries = Object.entries(effectiveColumnFilters)
    .filter(([, value]) => String(value ?? '').trim().length > 0);

  const handleClearColumnFilters = () => {
    setDraftColumnFilters({});
    if (columnFilters === undefined) {
      setInternalColumnFilters({});
    }
    onColumnFiltersChange?.({});

    if (propOnPageChange) {
      propOnPageChange(null, 0);
    } else {
      setInternalPage(0);
    }
  };

  const handleToggleColumn = (field: string) => {
    onColumnVisibilityModelChange?.({
      ...columnVisibilityModel,
      [field]: columnVisibilityModel[field] === false,
    });
  };

  const renderColumnFilterControl = (column: NativeTableColumn) => {
    const field = String(column.field);
    const definition = filterDefinitions[field];

    if (definition?.type === 'date') {
      return (
        <Stack direction="row" spacing={1}>
          <TextField
            variant="standard"
            type="date"
            label="From"
            value={String(draftColumnFilters[`${field}.from`] || '')}
            onChange={(event) => handleColumnFilterChange(`${field}.from`, event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            variant="standard"
            type="date"
            label="To"
            value={String(draftColumnFilters[`${field}.to`] || '')}
            onChange={(event) => handleColumnFilterChange(`${field}.to`, event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      );
    }

    if (definition?.type === 'number') {
      return (
        <Stack direction="row" spacing={1}>
          <TextField
            variant="standard"
            type="number"
            placeholder="Min"
            value={String(draftColumnFilters[`${field}.min`] || '')}
            onChange={(event) => handleColumnFilterChange(`${field}.min`, event.target.value)}
            size="small"
          />
          <TextField
            variant="standard"
            type="number"
            placeholder="Max"
            value={String(draftColumnFilters[`${field}.max`] || '')}
            onChange={(event) => handleColumnFilterChange(`${field}.max`, event.target.value)}
            size="small"
          />
        </Stack>
      );
    }

    if (definition?.type === 'enum') {
      return (
        <TextField
          select
          variant="standard"
          value={String(draftColumnFilters[field] || '')}
          onChange={(event) => handleColumnFilterChange(field, event.target.value)}
          size="small"
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          {(definition.options ?? []).map((option) => (
            <MenuItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (definition?.type === 'boolean') {
      return (
        <TextField
          select
          variant="standard"
          value={draftColumnFilters[field] === true ? 'true' : draftColumnFilters[field] === false ? 'false' : ''}
          onChange={(event) => handleColumnFilterChange(field, event.target.value === 'true' ? true : event.target.value === 'false' ? false : '')}
          size="small"
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>
      );
    }

    return (
      <DebouncedFilterTextField
        placeholder={columnFilterPlaceholder}
        value={String(effectiveColumnFilters[field] || '')}
        onCommit={(value) => handleColumnFilterCommit(field, value)}
        ariaLabel={`Search ${column.headerName}`}
        minWidth={column.minWidth || Math.min(column.width || 140, 220)}
      />
    );
  };

  const handleSortChange = (column: NativeTableColumn) => {
    if (!isColumnSortable(column)) return;

    const field = String(column.field);
    const nextSort: NativeTableSortModel = activeSort?.field === field
      ? (activeSort.sort === 'asc' ? [{ field, sort: 'desc' }] : [])
      : [{ field, sort: 'asc' }];

    if (sortModel === undefined) {
      setInternalSortModel(nextSort);
    }
    onSortModelChange?.(nextSort);

    if (propOnPageChange) {
      propOnPageChange(null, 0);
    } else {
      setInternalPage(0);
    }
  };

  // Mobile Card View (only if responsiveMode is 'cards')
  if (isMobile && responsiveMode === 'cards') {
    return (
      <Box sx={{ width: '100%', ...sx }}>
        {loading && <LinearProgress sx={{ mb: 1 }} />}
        {paginatedRows.map((row) => {
          const rowId = getRowId(row);
          const isSelected = selected.has(rowId);
          const isExpanded = expandedRows.has(rowId);
          const rowSx = getRowSx?.({ row, id: rowId });

          return (
            <Card
              key={rowId}
              onDoubleClick={() => onRowDoubleClick?.({ row, id: rowId })}
              sx={{
                mb: 2,
                cursor: onRowDoubleClick ? 'pointer' : undefined,
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
        {loading && paginatedRows.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {!hideFooter && !hideFooterPagination && (
          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={paginationCount}
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
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden', ...sx }}>
      {(showEnterpriseControls || activeFilterEntries.length > 0) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: 1, gap: 1 }}
        >
          {activeFilterEntries.map(([field, value]) => (
            <Chip
              key={field}
              size="small"
              label={`${field}: ${String(value)}`}
              onDelete={() => handleColumnFilterCommit(field, '')}
            />
          ))}
          {activeFilterEntries.length > 0 && (
            <Button size="small" onClick={handleClearColumnFilters}>
              Clear filters
            </Button>
          )}
          {showEnterpriseControls && (
            <>
              <Button size="small" onClick={(event) => setColumnsMenuAnchor(event.currentTarget)}>
                Columns
              </Button>
              <Menu
                anchorEl={columnsMenuAnchor}
                open={Boolean(columnsMenuAnchor)}
                onClose={() => setColumnsMenuAnchor(null)}
              >
                {columns.map((column) => {
                  const field = String(column.field);
                  return (
                    <MenuItem key={field} dense>
                      <FormControlLabel
                        control={(
                          <Switch
                            size="small"
                            checked={columnVisibilityModel[field] !== false}
                            onChange={() => handleToggleColumn(field)}
                          />
                        )}
                        label={column.headerName}
                      />
                    </MenuItem>
                  );
                })}
              </Menu>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={density}
                onChange={(_, nextDensity) => {
                  if (nextDensity) onDensityChange?.(nextDensity);
                }}
                aria-label="Table density"
              >
                <ToggleButton value="comfortable">Comfort</ToggleButton>
                <ToggleButton value="standard">Default</ToggleButton>
                <ToggleButton value="compact">Compact</ToggleButton>
              </ToggleButtonGroup>
              {onSaveView && <Button size="small" onClick={onSaveView}>Save view</Button>}
              {onResetView && <Button size="small" onClick={onResetView}>Reset view</Button>}
            </>
          )}
        </Stack>
      )}
      <Paper sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        {loading && <LinearProgress />}
        <TableContainer sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          maxHeight: 600,
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          <Table
            stickyHeader
            size={density === 'compact' || density === 'dense' ? 'small' : 'medium'}
            sx={{ minWidth: isMobile ? 800 : 960 }}
          >
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
                    {isColumnSortable(column) ? (
                      <TableSortLabel
                        active={activeSort?.field === String(column.field)}
                        direction={activeSort?.field === String(column.field) ? activeSort.sort : 'asc'}
                        onClick={() => handleSortChange(column)}
                      >
                        {column.headerName}
                      </TableSortLabel>
                    ) : (
                      column.headerName
                    )}
                  </TableCell>
                ))}
              </TableRow>
              {showColumnFilters && (
                <TableRow>
                  {getDetailPanelContent && <TableCell />}
                  {checkboxSelection && <TableCell />}
                  {visibleColumns.map((column) => {
                    const field = String(column.field);
                    const canFilter = isColumnFilterable(column);

                    return (
                      <TableCell
                        key={`${field}-filter`}
                        align={column.align || 'left'}
                        style={{ minWidth: column.minWidth || column.width }}
                        sx={{ bgcolor: 'background.paper', pt: 0.5, pb: 1 }}
                      >
                        {canFilter ? (
                          renderColumnFilterControl(column)
                        ) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              )}
            </TableHead>
            <TableBody sx={{ opacity: loading && paginatedRows.length > 0 ? 0.72 : 1, transition: 'opacity 120ms ease' }}>
              {loading && paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (checkboxSelection ? 1 : 0) + (getDetailPanelContent ? 1 : 0)}
                    align="center"
                    sx={{ py: 6, color: 'text.secondary' }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Loading data...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (checkboxSelection ? 1 : 0) + (getDetailPanelContent ? 1 : 0)}
                    align="center"
                    sx={{ py: 6, color: 'text.secondary' }}
                  >
                    {activeFilterEntries.length > 0 ? 'No rows match the current column search.' : 'No data available.'}
                  </TableCell>
                </TableRow>
              ) : paginatedRows.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selected.has(rowId);
                const isExpanded = expandedRows.has(rowId);
                const rowSx = getRowSx?.({ row, id: rowId });

                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      hover
                      selected={isSelected}
                      onDoubleClick={() => onRowDoubleClick?.({ row, id: rowId })}
                      sx={{
                        cursor: onRowDoubleClick ? 'pointer' : undefined,
                        ...rowSx,
                      }}
                    >
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
                          <TableCell
                            key={String(column.field)}
                            align={column.align || 'left'}
                            sx={density === 'comfortable' ? { py: 2.25 } : undefined}
                          >
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
            count={paginationCount}
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
