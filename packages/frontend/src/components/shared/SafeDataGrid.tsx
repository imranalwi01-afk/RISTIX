'use client';

import React from 'react';
import { NativeTable, NativeTableColumn } from './NativeTable';
import type { DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';

/**
 * Props for SafeDataGrid component
 * @template T - The row data type (optional, defaults to any)
 */
export interface SafeDataGridProps<T extends GridValidRowModel = any> extends Omit<DataGridProps, 'rows' | 'columns'> {
  rows: T[];
  columns: GridColDef<T>[];
  // Detail panel support (not in base DataGridProps)
  getDetailPanelContent?: (params: { row: T }) => React.ReactNode;
  getDetailPanelHeight?: (params: { row: T }) => number | 'auto';
}

/**
 * Safe wrapper that uses native HTML table instead of MUI DataGrid
 * to avoid bundling issues with DataGrid v8
 * @template T - The row data type (optional, defaults to any for backwards compatibility)
 */
export function SafeDataGrid<T extends GridValidRowModel = any>(props: SafeDataGridProps<T>) {
  // Convert DataGrid columns to NativeTable columns
  const nativeColumns: NativeTableColumn<T>[] = props.columns.map((col: any) => ({
    field: col.field,
    headerName: col.headerName || col.field,
    width: col.width,
    minWidth: col.minWidth,
    flex: col.flex,
    align: col.align,
    renderCell: col.renderCell,
    valueGetter: col.valueGetter,
    type: col.type,
  }));

  return (
    <NativeTable<T>
      rows={props.rows}
      columns={nativeColumns}
      loading={props.loading}
      getRowId={props.getRowId as ((row: T) => string | number) | undefined}
      pageSizeOptions={props.pageSizeOptions as number[] | undefined}
      initialState={props.initialState}
      checkboxSelection={props.checkboxSelection}
      onRowSelectionModelChange={props.onRowSelectionModelChange as ((ids: (string | number)[]) => void) | undefined}
      rowSelectionModel={props.rowSelectionModel as (string | number)[] | undefined}
      sx={props.sx}
      getDetailPanelContent={props.getDetailPanelContent}
      getDetailPanelHeight={props.getDetailPanelHeight}
    />
  );
}
