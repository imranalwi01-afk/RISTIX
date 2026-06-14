'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import TextField from '@mui/material/TextField'
import TableSortLabel from '@mui/material/TableSortLabel'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseFilterDefinition, EnterprisePaginationMode, EnterpriseTableQueryState } from '@/types/enterprise-table';
import { TableCard } from './TableCard';

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
  onRowClick?: (params: { row: T; id: string | number }) => void;
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
  tableStateKey?: string;
  maxTableHeight?: any;
  fillAvailableHeight?: boolean;
  onSaveView?: () => void;
  onResetView?: () => void;
  onQueryChange?: (queryState: EnterpriseTableQueryState) => void;
  /** Custom URL param key for column filters (default: 'cf'). Use different keys for multiple tables on one page. */
  urlFilterKey?: string;
}

const COLUMN_FILTER_COMMIT_DEBOUNCE_MS = 350;
const NATIVE_TABLE_STATE_VERSION = 1;

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

function areVisibilityMapsEqual(left: Record<string, boolean>, right: Record<string, boolean>) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

function normalizeVisibilityModel(
  model: Record<string, boolean>,
  columns: NativeTableColumn[],
) {
  const allowedFields = new Set(columns.map((column) => String(column.field)));
  const nextModel: Record<string, boolean> = {};

  Object.entries(model).forEach(([field, visible]) => {
    if (allowedFields.has(field) && visible === false) {
      nextModel[field] = false;
    }
  });

  const visibleCount = columns.filter((column) => nextModel[String(column.field)] !== false).length;
  if (columns.length > 0 && visibleCount === 0) {
    delete nextModel[String(columns[0].field)];
  }

  return nextModel;
}

function readStoredTableState(storageKey: string) {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as {
      version?: number;
      columnVisibilityModel?: Record<string, boolean>;
      density?: EnterpriseDensity;
    };

    if (parsed.version !== NATIVE_TABLE_STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredTableState(
  storageKey: string,
  state: {
    columnVisibilityModel: Record<string, boolean>;
    density: EnterpriseDensity;
  },
) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify({
      version: NATIVE_TABLE_STATE_VERSION,
      ...state,
    }));
  } catch {
    // Storage can be blocked in private browsing or strict browser settings.
  }
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
  pageSizeOptions = [10, 25, 50, 75, 100],
  initialState,
  checkboxSelection = false,
  onRowSelectionModelChange,
  rowSelectionModel = [],
  onRowClick,
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
  columnVisibilityModel: propColumnVisibilityModel,
  onColumnVisibilityModelChange,
  density: propDensity,
  onDensityChange,
  showEnterpriseControls = true,
  tableStateKey,
  maxTableHeight,
  fillAvailableHeight = true,
  onSaveView,
  onResetView,
  onQueryChange,
  urlFilterKey = 'cf',
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
  const getInitialFilters = (): Record<string, EnterpriseColumnFilterValue> => {
    if (typeof window !== 'undefined') {
      try {
        const raw = new URL(window.location.href).searchParams.get(urlFilterKey);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse URL filter', e);
      }
    }
    return {};
  };
  const [internalColumnFilters, setInternalColumnFilters] = useState<Record<string, EnterpriseColumnFilterValue>>(getInitialFilters);
  const [draftColumnFilters, setDraftColumnFilters] = useState<Record<string, EnterpriseColumnFilterValue>>(columnFilters ?? internalColumnFilters);
  const [internalSortModel, setInternalSortModel] = useState<NativeTableSortModel>([]);
  const [internalColumnVisibilityModel, setInternalColumnVisibilityModel] = useState<Record<string, boolean>>({});
  const [internalDensity, setInternalDensity] = useState<EnterpriseDensity>('standard');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState<null | HTMLElement>(null);

  const resolvedTableStateKey = useMemo(() => {
    if (tableStateKey) return tableStateKey;
    const columnSignature = columns.map((column) => String(column.field)).join('|');
    const path = typeof window !== 'undefined' ? window.location.pathname : 'unknown-path';
    return `native-table:${path}:${columnSignature}`;
  }, [columns, tableStateKey]);
  const effectiveColumnVisibilityModel = propColumnVisibilityModel ?? internalColumnVisibilityModel;
  const effectiveDensity = propDensity ?? internalDensity;
  const effectiveColumnFilters = columnFilters ?? internalColumnFilters;
  const effectiveSortModel = sortModel ?? internalSortModel;
  const activeSort = effectiveSortModel[0];
  const effectiveFilteringMode = filteringMode ?? (paginationMode === 'client' || !onColumnFiltersChange ? 'client' : 'server');

  useEffect(() => {
    if (columnFilters !== undefined) {
      setDraftColumnFilters((current) => (
        areFilterMapsEqual(current, columnFilters) ? current : columnFilters
      ));
    }
  }, [columnFilters]);

  useEffect(() => {
    if (propColumnVisibilityModel !== undefined || propDensity !== undefined) return;

    const storedState = readStoredTableState(resolvedTableStateKey);
    if (!storedState) return;

    if (storedState.columnVisibilityModel) {
      const normalizedModel = normalizeVisibilityModel(storedState.columnVisibilityModel, columns);
      setInternalColumnVisibilityModel((current) => (
        areVisibilityMapsEqual(current, normalizedModel) ? current : normalizedModel
      ));
    }

    if (storedState.density) {
      setInternalDensity(storedState.density);
    }
  }, [columns, propColumnVisibilityModel, propDensity, resolvedTableStateKey]);

  useEffect(() => {
    if (propColumnVisibilityModel !== undefined || propDensity !== undefined) return;

    writeStoredTableState(resolvedTableStateKey, {
      columnVisibilityModel: internalColumnVisibilityModel,
      density: internalDensity,
    });
  }, [
    internalColumnVisibilityModel,
    internalDensity,
    propColumnVisibilityModel,
    propDensity,
    resolvedTableStateKey,
  ]);

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
      columnVisibilityModel: effectiveColumnVisibilityModel,
      density: effectiveDensity,
    });
  }, [
    effectiveColumnVisibilityModel,
    effectiveDensity,
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
    const enabledColumns = columns.filter((col) => effectiveColumnVisibilityModel[String(col.field)] !== false);
    if (isMobile && responsiveMode === 'cards') {
      return enabledColumns.filter(col => !col.hideMobile);
    }
    return enabledColumns;
  }, [columns, effectiveColumnVisibilityModel, isMobile, responsiveMode]);

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

    // Sync to URL search params so filters persist across navigation
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const activeFilters = Object.fromEntries(
          Object.entries(normalizedFilters).filter(([_, v]) => !isFilterValueBlank(v))
        );
        if (Object.keys(activeFilters).length > 0) {
          url.searchParams.set(urlFilterKey, JSON.stringify(activeFilters));
        } else {
          url.searchParams.delete(urlFilterKey);
        }
        window.history.replaceState({}, '', url.toString());
      } catch { /* ignore URL errors */ }
    }

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
  const visibleColumnCount = visibleColumns.length;
  const tableMinWidth = useMemo(() => {
    const contentWidth = visibleColumns.reduce((total, column) => {
      if (column.width) return total + column.width;
      if (column.minWidth) return total + column.minWidth;
      return total + (column.type === 'actions' ? 96 : 160);
    }, getDetailPanelContent ? 88 : 0);

    return isMobile ? Math.max(800, contentWidth) : Math.max(960, contentWidth);
  }, [getDetailPanelContent, isMobile, visibleColumns]);
  const densityConfig = useMemo(() => {
    if (effectiveDensity === 'comfortable') {
      return {
        tableSize: 'medium' as const,
        bodyPy: 1.75,
        headPy: 1.2,
        fontSize: '0.875rem',
      };
    }

    if (effectiveDensity === 'compact' || effectiveDensity === 'dense') {
      return {
        tableSize: 'small' as const,
        bodyPy: 0.85,
        headPy: 0.9,
        fontSize: '0.825rem',
      };
    }

    return {
      tableSize: 'small' as const,
      bodyPy: 1.15,
      headPy: 1,
      fontSize: '0.85rem',
    };
  }, [effectiveDensity]);
  const resolvedMaxTableHeight = maxTableHeight ?? 'none';

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
    if (effectiveColumnVisibilityModel[field] !== false && visibleColumnCount <= 1) {
      return;
    }

    const nextModel = normalizeVisibilityModel({
      ...effectiveColumnVisibilityModel,
      [field]: effectiveColumnVisibilityModel[field] === false,
    }, columns);

    if (propColumnVisibilityModel === undefined) {
      setInternalColumnVisibilityModel(nextModel);
    }
    onColumnVisibilityModelChange?.(nextModel);
  };

  const handleDensityChange = (nextDensity: EnterpriseDensity) => {
    if (propDensity === undefined) {
      setInternalDensity(nextDensity);
    }
    onDensityChange?.(nextDensity);
  };

  const handleResetTableView = () => {
    if (propColumnVisibilityModel === undefined) {
      setInternalColumnVisibilityModel({});
    }
    if (propDensity === undefined) {
      setInternalDensity('standard');
    }
    onColumnVisibilityModelChange?.({});
    onDensityChange?.('standard');
    onResetView?.();
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
      const enumOptions = Array.isArray(definition.options) ? definition.options : [];
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
          {enumOptions.map((option) => (
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
              onClick={() => onRowClick?.({ row, id: rowId })}
              onDoubleClick={() => onRowDoubleClick?.({ row, id: rowId })}
              sx={{
                mb: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                boxShadow: 'none',
                cursor: onRowClick || onRowDoubleClick ? 'pointer' : undefined,
                ...rowSx,
              }}
            >
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getDetailPanelContent && (
                    <Tooltip title={isExpanded ? 'Hide details' : 'Show details'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleExpand(rowId)}
                        aria-label={isExpanded ? 'Hide details' : 'Show details'}
                      >
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Tooltip>
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
                          <Box
                            sx={{
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              lineHeight: 1.43,
                              minWidth: 0,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {(() => {
                              const value = getCellValue(row, column);
                              const formattedValue = column.valueFormatter ? column.valueFormatter(value, row) : value;
                              return column.renderCell ? column.renderCell({ row, value, formattedValue }) : formattedValue;
                            })()}
                          </Box>
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
    <TableCard
      fillAvailableHeight={fillAvailableHeight}
      sx={{
        ...sx,
      }}
    >
      {(showEnterpriseControls || activeFilterEntries.length > 0) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            mb: 1.25,
            gap: 1,
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
            flexShrink: 0,
          }}
        >
          {activeFilterEntries.map(([field, value]) => (
            <Chip
              key={field}
              size="small"
              label={`${columns.find((column) => String(column.field) === field)?.headerName ?? field}: ${String(value)}`}
              onDelete={() => handleColumnFilterCommit(field, '')}
              sx={{ maxWidth: 260 }}
            />
          ))}
          {activeFilterEntries.length > 0 && (
            <Button size="small" onClick={handleClearColumnFilters}>
              Clear filters
            </Button>
          )}
          {showEnterpriseControls && (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={(event) => setColumnsMenuAnchor(event.currentTarget)}
                sx={{ borderRadius: 1, bgcolor: 'background.paper' }}
              >
                Columns ({visibleColumnCount})
              </Button>
              <Menu
                anchorEl={columnsMenuAnchor}
                open={Boolean(columnsMenuAnchor)}
                onClose={() => setColumnsMenuAnchor(null)}
                PaperProps={{ sx: { minWidth: 240 } }}
              >
                {columns.map((column) => {
                  const field = String(column.field);
                  const checked = effectiveColumnVisibilityModel[field] !== false;
                  const disableToggle = checked && visibleColumnCount <= 1;

                  return (
                    <MenuItem key={field} dense>
                      <FormControlLabel
                        control={(
                          <Switch
                            size="small"
                            checked={checked}
                            disabled={disableToggle}
                            onChange={() => handleToggleColumn(field)}
                          />
                        )}
                        label={column.headerName}
                        sx={{
                          m: 0,
                          width: '100%',
                          '.MuiFormControlLabel-label': {
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </Menu>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={effectiveDensity}
                onChange={(_, nextDensity) => {
                  if (nextDensity) handleDensityChange(nextDensity);
                }}
                aria-label="Table density"
                sx={{
                  '.MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.55,
                    textTransform: 'none',
                  },
                }}
              >
                <ToggleButton value="comfortable">Comfort</ToggleButton>
                <ToggleButton value="standard">Default</ToggleButton>
                <ToggleButton value="compact">Compact</ToggleButton>
              </ToggleButtonGroup>
              {onSaveView && <Button size="small" onClick={onSaveView}>Save view</Button>}
              <Button size="small" onClick={handleResetTableView}>Reset view</Button>
            </>
          )}
        </Stack>
      )}
      <Paper sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: fillAvailableHeight ? '1 1 auto' : undefined,
        minHeight: fillAvailableHeight ? 0 : undefined,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
      }}>
        {loading && <LinearProgress />}
        <TableContainer sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          maxHeight: resolvedMaxTableHeight,
          flex: fillAvailableHeight ? '1 1 auto' : undefined,
          overflowX: 'auto',
          overflowY: resolvedMaxTableHeight === 'none' ? 'visible' : 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: 10,
            width: 10,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(15, 23, 42, 0.18)',
            borderRadius: 999,
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
          },
        }}>
          <Table
            stickyHeader
            size={densityConfig.tableSize}
            sx={{
              minWidth: tableMinWidth,
              tableLayout: 'fixed',
              '& .MuiTableCell-root': {
                borderColor: 'divider',
              },
              '& .MuiTableCell-head': {
                bgcolor: '#f8fafc',
                color: 'text.secondary',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: 0,
                lineHeight: 1.35,
                py: densityConfig.headPy,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              },
              '& .MuiTableCell-body': {
                color: 'text.primary',
                fontSize: densityConfig.fontSize,
                py: densityConfig.bodyPy,
                verticalAlign: 'middle',
              },
              '& .MuiTableRow-root:hover .MuiTableCell-body': {
                bgcolor: 'rgba(14, 165, 233, 0.04)',
              },
              '& .MuiTableRow-root.Mui-selected .MuiTableCell-body': {
                bgcolor: 'rgba(14, 165, 233, 0.08)',
              },
            }}
          >
            <TableHead>
              <TableRow>
                {getDetailPanelContent && (
                  <TableCell
                    width={88}
                    sx={{
                      whiteSpace: 'nowrap',
                      minWidth: 88,
                    }}
                  >
                    Details
                  </TableCell>
                )}
                {checkboxSelection && (
                  <TableCell padding="checkbox" width={48}>
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
                    width={column.width}
                    style={{ minWidth: column.minWidth || column.width }}
                    sx={{
                      '& .MuiTableSortLabel-root': {
                        color: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                      },
                    }}
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
                  {getDetailPanelContent && (
                    <TableCell
                      width={88}
                      sx={{
                        bgcolor: '#f8fafc',
                        pt: 0.5,
                        pb: 1,
                        minWidth: 88,
                      }}
                    />
                  )}
                  {checkboxSelection && <TableCell width={48} sx={{ bgcolor: '#f8fafc' }} />}
                  {visibleColumns.map((column) => {
                    const field = String(column.field);
                    const canFilter = isColumnFilterable(column);

                    return (
                      <TableCell
                        key={`${field}-filter`}
                        align={column.align || 'left'}
                        width={column.width}
                        style={{ minWidth: column.minWidth || column.width }}
                        sx={{ bgcolor: '#f8fafc', pt: 0.5, pb: 1 }}
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
                      onClick={() => onRowClick?.({ row, id: rowId })}
                      onDoubleClick={() => onRowDoubleClick?.({ row, id: rowId })}
                      sx={{
                        cursor: onRowClick || onRowDoubleClick ? 'pointer' : undefined,
                        ...rowSx,
                      }}
                    >
                      {getDetailPanelContent && (
                        <TableCell width={88}>
                          <Tooltip title={isExpanded ? 'Hide details' : 'Show details'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleExpand(rowId)}
                              aria-label={isExpanded ? 'Hide details' : 'Show details'}
                            >
                              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                      {checkboxSelection && (
                        <TableCell padding="checkbox" width={48}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelect(rowId)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => {
                        const value = getCellValue(row, column);
                        const formattedValue = column.valueFormatter ? column.valueFormatter(value, row) : value;
                        const renderedCell = column.renderCell ? column.renderCell({ row, value, formattedValue }) : formattedValue;
                        const allowWrap = column.type === 'actions' || React.isValidElement(renderedCell);
                        const titleValue = typeof formattedValue === 'string' || typeof formattedValue === 'number'
                          ? String(formattedValue)
                          : undefined;

                        return (
                          <TableCell
                            key={String(column.field)}
                            align={column.align || 'left'}
                            width={column.width}
                            title={allowWrap ? undefined : titleValue}
                            sx={{
                              minWidth: column.minWidth || column.width,
                              maxWidth: column.width || column.minWidth || 240,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: allowWrap ? 'normal' : 'nowrap',
                            }}
                          >
                            {allowWrap ? (
                              renderedCell
                            ) : (
                              <Box
                                component="span"
                                sx={{
                                  display: 'block',
                                  minWidth: 0,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {renderedCell}
                              </Box>
                            )}
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
            sx={{
              flexShrink: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              '.MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                rowGap: 1,
                minHeight: 60,
              },
            }}
          />
        )}
      </Paper>
    </TableCard>
  );
}
