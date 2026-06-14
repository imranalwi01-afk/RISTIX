import type React from 'react';
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

export const COLUMN_FILTER_COMMIT_DEBOUNCE_MS = 350;
export const NATIVE_TABLE_STATE_VERSION = 1;
