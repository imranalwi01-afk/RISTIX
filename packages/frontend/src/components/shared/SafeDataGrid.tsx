'use client';

import React from 'react';
import { NativeTable, NativeTableColumn } from './NativeTable';
import type { DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { IconButton, Tooltip } from '@mui/material';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseFilterDefinition, EnterprisePaginationMode, EnterpriseTableQueryState } from '@/types/enterprise-table';

/**
 * Safe replacement for GridActionsCellItem that doesn't require DataGrid context
 */
export interface SafeGridActionsCellItemProps {
  label: string;
  icon: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  showInMenu?: boolean; // Ignored for now, kept for compatibility
  [key: string]: any;
}

export function SafeGridActionsCellItem({ label, icon, onClick, showInMenu, ...other }: SafeGridActionsCellItemProps) {
  return (
    <Tooltip title={label}>
      <IconButton size="small" onClick={onClick} {...other}>
        {icon as any}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Props for SafeDataGrid component
 * @template T - The row data type (optional, defaults to any)
 */
export interface SafeDataGridProps<T extends GridValidRowModel = any> extends Omit<DataGridProps, 'rows' | 'columns' | 'paginationMode'> {
  rows: T[];
  columns: GridColDef<T>[];
  getRowSx?: (params: { row: T; id: string | number }) => any;
  responsiveMode?: 'cards' | 'scroll';
  // Detail panel support (not in base DataGridProps)
  getDetailPanelContent?: (params: { row: T }) => any;
  getDetailPanelHeight?: (params: { row: T }) => number | 'auto';
  // Standard DataGrid footer controls
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
  enableColumnFilters?: boolean;
  columnFilters?: Record<string, EnterpriseColumnFilterValue>;
  onColumnFiltersChange?: (filters: Record<string, EnterpriseColumnFilterValue>) => void;
  columnFilterPlaceholder?: string;
  filterDefinitions?: Record<string, EnterpriseFilterDefinition>;
  paginationMode?: DataGridProps['paginationMode'] | EnterprisePaginationMode;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
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

/**
 * Safe wrapper that uses native HTML table instead of MUI DataGrid
 * to avoid bundling issues with DataGrid v8
 * @template T - The row data type (optional, defaults to any for backwards compatibility)
 */
export function SafeDataGrid<T extends GridValidRowModel = any>(props: SafeDataGridProps<T>) {
  // Convert DataGrid columns to NativeTable columns
  const nativeColumns: NativeTableColumn<T>[] = props.columns.map((col: any) => {
    // Support for getActions (MUI DataGrid 'actions' column type)
    let renderCell = col.renderCell;
    if (col.type === 'actions' && col.getActions && !renderCell) {
      renderCell = (params: { row: T }) => {
        // Create params compatible with GridRowParams
        const rowId = props.getRowId ? props.getRowId(params.row) : (params.row as any).id;
        const gridParams = { id: rowId, row: params.row };

        // Get actions from the callback
        const actions = col.getActions(gridParams);

        // Render actions in a flex container
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {React.Children.map(actions, (action, index) =>
              React.isValidElement(action)
                ? React.cloneElement(action as React.ReactElement<any>, { key: action.key || index })
                : action
            )}
          </div>
        );
      };
    }

    return {
      field: col.field,
      headerName: col.headerName || col.field,
      width: col.width,
      minWidth: col.minWidth,
      flex: col.flex,
      align: col.align,
      renderCell: renderCell,
      valueGetter: col.valueGetter,
      valueFormatter: col.valueFormatter,
      type: col.type,
      filterable: col.filterable,
      sortable: col.sortable,
    };
  });

  const nativeSortModel = props.sortModel
    ?.filter((item: any) => item.sort === 'asc' || item.sort === 'desc')
    .map((item: any) => ({ field: item.field, sort: item.sort }));

  return (
    <NativeTable<T>
      rows={props.rows}
      columns={nativeColumns}
      loading={props.loading}
      getRowId={props.getRowId as ((row: T) => string | number) | undefined}
      getRowSx={props.getRowSx}
      pageSizeOptions={props.pageSizeOptions as number[] | undefined}
      initialState={props.initialState}
      checkboxSelection={props.checkboxSelection}
      onRowSelectionModelChange={props.onRowSelectionModelChange as ((ids: (string | number)[]) => void) | undefined}
      rowSelectionModel={props.rowSelectionModel as (string | number)[] | undefined}
      onRowClick={props.onRowClick as ((params: { row: T; id: string | number }) => void) | undefined}
      onRowDoubleClick={props.onRowDoubleClick as ((params: { row: T; id: string | number }) => void) | undefined}
      sx={props.sx}
      getDetailPanelContent={props.getDetailPanelContent}
      getDetailPanelHeight={props.getDetailPanelHeight}
      responsiveMode={props.responsiveMode}
      enableColumnFilters={props.enableColumnFilters ?? !props.disableColumnFilter}
      columnFilters={props.columnFilters}
      onColumnFiltersChange={props.onColumnFiltersChange}
      columnFilterPlaceholder={props.columnFilterPlaceholder}
      urlFilterKey={props.urlFilterKey}
      filterDefinitions={props.filterDefinitions}
      filteringMode={props.filterMode === 'server' || (props.onColumnFiltersChange && (props.paginationMode === 'server' || props.paginationMode === 'offset' || props.paginationMode === 'cursor')) ? 'server' : 'client'}
      disableColumnSorting={props.disableColumnSorting}
      sortModel={nativeSortModel}
      onSortModelChange={props.onSortModelChange ? (model) => {
        props.onSortModelChange?.(model as any, {} as any);
      } : undefined}
      sortingMode={props.sortingMode}
      paginationMode={props.paginationMode === 'server' ? 'offset' : props.paginationMode}
      columnVisibilityModel={props.columnVisibilityModel}
      onColumnVisibilityModelChange={props.onColumnVisibilityModelChange}
      density={props.density as any}
      onDensityChange={props.onDensityChange}
      showEnterpriseControls={props.showEnterpriseControls}
      tableStateKey={props.tableStateKey}
      maxTableHeight={props.maxTableHeight}
      fillAvailableHeight={props.fillAvailableHeight}
      onSaveView={props.onSaveView}
      onResetView={props.onResetView}
      onQueryChange={props.onQueryChange}
      // Pagination mapping
      count={props.rowCount}
      page={props.paginationModel?.page}
      rowsPerPage={props.paginationModel?.pageSize}
      onPageChange={props.onPaginationModelChange ? (_e, newPage) => {
        props.onPaginationModelChange?.({
          page: newPage,
          pageSize: props.paginationModel?.pageSize || 10
        }, {} as any);
      } : undefined}
      onRowsPerPageChange={props.onPaginationModelChange ? (e) => {
        const newPageSize = parseInt(e.target.value, 10);
        props.onPaginationModelChange?.({
          page: 0, // Reset to first page on size change
          pageSize: newPageSize
        }, {} as any);
      } : undefined}
      hideFooter={props.hideFooter}
      hideFooterPagination={props.hideFooterPagination}
    />
  );
}
