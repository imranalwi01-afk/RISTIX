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
import Collapse from '@mui/material/Collapse'
import TableSortLabel from '@mui/material/TableSortLabel'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseTableQueryState } from '@/types/enterprise-table';
import { TableCard } from './TableCard';
import type { NativeTableColumn, NativeTableProps, NativeTableSortModel } from './NativeTable.types';
import { COLUMN_FILTER_COMMIT_DEBOUNCE_MS } from './NativeTable.types';
import {
  isFilterValueBlank,
  normalizeFilterMap,
  areFilterMapsEqual,
  areVisibilityMapsEqual,
  normalizeVisibilityModel,
  readStoredTableState,
  writeStoredTableState,
  getCellValue,
  stringifyForFilter,
  compareValues,
  isColumnFilterable,
  isColumnSortable,
  ColumnFilterControl,
} from './NativeTable.utils';
import { NativeTableToolbar } from './NativeTableToolbar';
import { NativeTableCardView } from './NativeTableCardView';

// Re-export types so consumers can still import from NativeTable
export type { NativeTableColumn, NativeTableSortDirection, NativeTableSortModel, NativeTableProps } from './NativeTable.types';

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
  responsiveMode = 'scroll',
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

  // ---- Internal state for uncontrolled pagination ----
  const [internalPage, setInternalPage] = useState(initialState?.pagination?.paginationModel?.page || 0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(
    initialState?.pagination?.paginationModel?.pageSize || pageSizeOptions[0]
  );
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

  // ---- Derived / effective values ----
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

  // ---- Effects ----

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
  }, [internalColumnVisibilityModel, internalDensity, propColumnVisibilityModel, propDensity, resolvedTableStateKey]);

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
  }, [effectiveColumnVisibilityModel, effectiveDensity, effectiveColumnFilters, effectiveSortModel, onQueryChange, page, paginationMode, rowsPerPage]);

  useEffect(() => {
    if (areFilterMapsEqual(draftColumnFilters, effectiveColumnFilters)) return;
    const timer = window.setTimeout(() => {
      const nextFilters = normalizeFilterMap(draftColumnFilters);
      if (columnFilters === undefined) setInternalColumnFilters(nextFilters);
      onColumnFiltersChange?.(nextFilters);
      if (propOnPageChange) { propOnPageChange(null, 0); } else { setInternalPage(0); }
    }, COLUMN_FILTER_COMMIT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [columnFilters, draftColumnFilters, effectiveColumnFilters, onColumnFiltersChange, propOnPageChange]);

  // ---- Handlers ----

  const handleChangePage = (event: unknown, newPage: number) => {
    if (propOnPageChange) { propOnPageChange(event, newPage); } else { setInternalPage(newPage); }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (propOnRowsPerPageChange) { propOnRowsPerPageChange(event); } else { setInternalRowsPerPage(parseInt(event.target.value, 10)); setInternalPage(0); }
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
    if (newSelected.has(id)) { newSelected.delete(id); } else { newSelected.add(id); }
    setSelected(newSelected);
    onRowSelectionModelChange?.(Array.from(newSelected));
  };

  const handleToggleExpand = (id: any) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) { newExpanded.delete(id); } else { newExpanded.add(id); }
    setExpandedRows(newExpanded);
  };

  const handleColumnFilterChange = (field: string, value: EnterpriseColumnFilterValue) => {
    const nextFilters = { ...draftColumnFilters, [field]: value };
    if (isFilterValueBlank(value)) delete nextFilters[field];
    setDraftColumnFilters(nextFilters);
  };

  const handleColumnFilterCommit = (field: string, value: EnterpriseColumnFilterValue) => {
    const nextFilters = { ...effectiveColumnFilters, [field]: value };
    if (isFilterValueBlank(value)) delete nextFilters[field];
    const normalizedFilters = normalizeFilterMap(nextFilters);
    setDraftColumnFilters(normalizedFilters);
    if (columnFilters === undefined) setInternalColumnFilters(normalizedFilters);
    onColumnFiltersChange?.(normalizedFilters);
    // Sync to URL search params
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
    if (propOnPageChange) { propOnPageChange(null, 0); } else { setInternalPage(0); }
  };

  const handleClearColumnFilters = () => {
    setDraftColumnFilters({});
    if (columnFilters === undefined) setInternalColumnFilters({});
    onColumnFiltersChange?.({});
    if (propOnPageChange) { propOnPageChange(null, 0); } else { setInternalPage(0); }
  };

  const handleToggleColumn = (field: string) => {
    if (effectiveColumnVisibilityModel[field] !== false && visibleColumnCount <= 1) return;
    const nextModel = normalizeVisibilityModel({
      ...effectiveColumnVisibilityModel,
      [field]: effectiveColumnVisibilityModel[field] === false,
    }, columns);
    if (propColumnVisibilityModel === undefined) setInternalColumnVisibilityModel(nextModel);
    onColumnVisibilityModelChange?.(nextModel);
  };

  const handleDensityChange = (nextDensity: EnterpriseDensity) => {
    if (propDensity === undefined) setInternalDensity(nextDensity);
    onDensityChange?.(nextDensity);
  };

  const handleResetTableView = () => {
    if (propColumnVisibilityModel === undefined) setInternalColumnVisibilityModel({});
    if (propDensity === undefined) setInternalDensity('standard');
    onColumnVisibilityModelChange?.({});
    onDensityChange?.('standard');
    onResetView?.();
  };

  const handleSortChange = (column: NativeTableColumn) => {
    if (!isColumnSortable(column, disableColumnSorting)) return;
    const field = String(column.field);
    const nextSort: NativeTableSortModel = activeSort?.field === field
      ? (activeSort.sort === 'asc' ? [{ field, sort: 'desc' }] : [])
      : [{ field, sort: 'asc' }];
    if (sortModel === undefined) setInternalSortModel(nextSort);
    onSortModelChange?.(nextSort);
    if (propOnPageChange) { propOnPageChange(null, 0); } else { setInternalPage(0); }
  };

  // ---- Derived rows ----

  const visibleColumns = useMemo(() => {
    const enabledColumns = columns.filter((col) => effectiveColumnVisibilityModel[String(col.field)] !== false);
    if (isMobile && responsiveMode === 'cards') return enabledColumns.filter(col => !col.hideMobile);
    return enabledColumns;
  }, [columns, effectiveColumnVisibilityModel, isMobile, responsiveMode]);

  const hasActiveColumnFilters = useMemo(() => {
    return Object.values(effectiveColumnFilters).some((value) => String(value ?? '').trim().length > 0);
  }, [effectiveColumnFilters]);

  const filteredRows = useMemo(() => {
    if (effectiveFilteringMode === 'server') return rows;
    if (!hasActiveColumnFilters) return rows;
    return rows.filter((row) => {
      return visibleColumns.every((column) => {
        if (!isColumnFilterable(column, enableColumnFilters)) return true;
        const query = String(effectiveColumnFilters[String(column.field)] || '').trim().toLowerCase();
        if (!query) return true;
        const rawValue = getCellValue(row, column);
        const formattedValue = column.valueFormatter ? column.valueFormatter(rawValue, row) : rawValue;
        const searchable = `${stringifyForFilter(rawValue)} ${stringifyForFilter(formattedValue)}`.toLowerCase();
        return searchable.includes(query);
      });
    });
  }, [rows, visibleColumns, effectiveColumnFilters, hasActiveColumnFilters, effectiveFilteringMode, enableColumnFilters]);

  const sortedRows = useMemo(() => {
    if (!activeSort || sortingMode === 'server') return filteredRows;
    const sortColumn = visibleColumns.find((column) => String(column.field) === activeSort.field);
    if (!sortColumn || !isColumnSortable(sortColumn, disableColumnSorting)) return filteredRows;
    return [...filteredRows].sort((leftRow, rightRow) => {
      const leftValue = getCellValue(leftRow, sortColumn);
      const rightValue = getCellValue(rightRow, sortColumn);
      const result = compareValues(leftValue, rightValue);
      return activeSort.sort === 'asc' ? result : -result;
    });
  }, [activeSort, filteredRows, sortingMode, visibleColumns, disableColumnSorting]);

  const paginatedRows = useMemo(() => {
    if (count !== undefined || paginationMode !== 'client') return sortedRows;
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage, count, paginationMode]);

  // ---- Computed values ----
  const showColumnFilters = enableColumnFilters && visibleColumns.some((col) => isColumnFilterable(col, enableColumnFilters));
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
    if (effectiveDensity === 'comfortable') return { tableSize: 'medium' as const, bodyPy: 1.75, headPy: 1.2, fontSize: '0.875rem' };
    if (effectiveDensity === 'compact' || effectiveDensity === 'dense') return { tableSize: 'small' as const, bodyPy: 0.85, headPy: 0.9, fontSize: '0.825rem' };
    return { tableSize: 'small' as const, bodyPy: 1.15, headPy: 1, fontSize: '0.85rem' };
  }, [effectiveDensity]);
  const resolvedMaxTableHeight = maxTableHeight ?? 'none';

  // ---- Mobile Card View ----
  if (isMobile && responsiveMode === 'cards') {
    return (
      <NativeTableCardView<T>
        rows={paginatedRows}
        columns={columns}
        visibleColumns={visibleColumns}
        loading={loading}
        sx={sx}
        getRowId={getRowId}
        getRowSx={getRowSx}
        getCellValue={getCellValue}
        checkboxSelection={checkboxSelection}
        selected={selected}
        onSelect={handleSelect}
        expandedRows={expandedRows}
        onToggleExpand={handleToggleExpand}
        getDetailPanelContent={getDetailPanelContent}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        hideFooter={hideFooter}
        hideFooterPagination={hideFooterPagination}
        pageSizeOptions={pageSizeOptions}
        paginationCount={paginationCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    );
  }

  // ---- Desktop Table View ----
  return (
    <TableCard fillAvailableHeight={fillAvailableHeight} sx={{ ...sx }}>
      <NativeTableToolbar
        columns={columns}
        activeFilterEntries={activeFilterEntries as any}
        onClearFilters={handleClearColumnFilters}
        onRemoveFilter={(field) => handleColumnFilterCommit(field, '')}
        showEnterpriseControls={showEnterpriseControls}
        visibleColumnCount={visibleColumnCount}
        columnsMenuAnchor={columnsMenuAnchor}
        onOpenColumnsMenu={(anchor) => setColumnsMenuAnchor(anchor)}
        onCloseColumnsMenu={() => setColumnsMenuAnchor(null)}
        columnVisibilityModel={effectiveColumnVisibilityModel}
        onToggleColumn={handleToggleColumn}
        density={effectiveDensity}
        onDensityChange={handleDensityChange}
        onSaveView={onSaveView}
        onResetView={handleResetTableView}
      />
      <Paper sx={{
        width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        flex: fillAvailableHeight ? '1 1 auto' : undefined,
        minHeight: fillAvailableHeight ? 0 : undefined,
        border: '1px solid', borderColor: 'divider', borderRadius: 2,
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
      }}>
        {loading && <LinearProgress />}
        <TableContainer sx={{
          width: '100%', maxWidth: '100%', minWidth: 0,
          maxHeight: resolvedMaxTableHeight,
          flex: fillAvailableHeight ? '1 1 auto' : undefined,
          overflowX: 'auto',
          overflowY: resolvedMaxTableHeight === 'none' ? 'visible' : 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: 10, width: 10 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(15, 23, 42, 0.18)', borderRadius: 999, border: '2px solid transparent', backgroundClip: 'padding-box' },
        }}>
          <Table stickyHeader size={densityConfig.tableSize} sx={{
            minWidth: tableMinWidth, tableLayout: 'fixed',
            '& .MuiTableCell-root': { borderColor: 'divider' },
            '& .MuiTableCell-head': { bgcolor: '#f8fafc', color: 'text.secondary', fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0, lineHeight: 1.35, py: densityConfig.headPy, textTransform: 'uppercase', whiteSpace: 'nowrap' },
            '& .MuiTableCell-body': { color: 'text.primary', fontSize: densityConfig.fontSize, py: densityConfig.bodyPy, verticalAlign: 'middle' },
            '& .MuiTableRow-root:hover .MuiTableCell-body': { bgcolor: 'rgba(14, 165, 233, 0.04)' },
            '& .MuiTableRow-root.Mui-selected .MuiTableCell-body': { bgcolor: 'rgba(14, 165, 233, 0.08)' },
          }}>
            <TableHead>
              <TableRow>
                {getDetailPanelContent && (
                  <TableCell width={88} sx={{ whiteSpace: 'nowrap', minWidth: 88 }}>Details</TableCell>
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
                  <TableCell key={String(column.field)} align={column.align || 'left'} width={column.width} style={{ minWidth: column.minWidth || column.width }} sx={{ '& .MuiTableSortLabel-root': { color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' } }}>
                    {isColumnSortable(column, disableColumnSorting) ? (
                      <TableSortLabel active={activeSort?.field === String(column.field)} direction={activeSort?.field === String(column.field) ? activeSort.sort : 'asc'} onClick={() => handleSortChange(column)}>
                        {column.headerName}
                      </TableSortLabel>
                    ) : column.headerName}
                  </TableCell>
                ))}
              </TableRow>
              {showColumnFilters && (
                <TableRow>
                  {getDetailPanelContent && <TableCell width={88} sx={{ bgcolor: '#f8fafc', pt: 0.5, pb: 1, minWidth: 88 }} />}
                  {checkboxSelection && <TableCell width={48} sx={{ bgcolor: '#f8fafc' }} />}
                  {visibleColumns.map((column) => (
                    <TableCell key={`${String(column.field)}-filter`} align={column.align || 'left'} width={column.width} style={{ minWidth: column.minWidth || column.width }} sx={{ bgcolor: '#f8fafc', pt: 0.5, pb: 1 }}>
                      {isColumnFilterable(column, enableColumnFilters) ? (
                        <ColumnFilterControl
                          column={column}
                          filterDefinitions={filterDefinitions}
                          draftColumnFilters={draftColumnFilters}
                          effectiveColumnFilters={effectiveColumnFilters}
                          columnFilterPlaceholder={columnFilterPlaceholder}
                          onFilterChange={handleColumnFilterChange}
                          onFilterCommit={handleColumnFilterCommit}
                        />
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableHead>
            <TableBody sx={{ opacity: loading && paginatedRows.length > 0 ? 0.72 : 1, transition: 'opacity 120ms ease' }}>
              {loading && paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (checkboxSelection ? 1 : 0) + (getDetailPanelContent ? 1 : 0)} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">Loading data...</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (checkboxSelection ? 1 : 0) + (getDetailPanelContent ? 1 : 0)} align="center" sx={{ py: 6, color: 'text.secondary' }}>
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
                    <TableRow hover selected={isSelected} onClick={() => onRowClick?.({ row, id: rowId })} onDoubleClick={() => onRowDoubleClick?.({ row, id: rowId })} sx={{ cursor: onRowClick || onRowDoubleClick ? 'pointer' : undefined, ...rowSx }}>
                      {getDetailPanelContent && (
                        <TableCell width={88}>
                          <Tooltip title={isExpanded ? 'Hide details' : 'Show details'}>
                            <IconButton size="small" onClick={() => handleToggleExpand(rowId)} aria-label={isExpanded ? 'Hide details' : 'Show details'}>
                              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                      {checkboxSelection && (
                        <TableCell padding="checkbox" width={48}>
                          <Checkbox checked={isSelected} onChange={() => handleSelect(rowId)} />
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => {
                        const value = getCellValue(row, column);
                        const formattedValue = column.valueFormatter ? column.valueFormatter(value, row) : value;
                        const renderedCell = column.renderCell ? column.renderCell({ row, value, formattedValue }) : formattedValue;
                        const allowWrap = column.type === 'actions' || React.isValidElement(renderedCell);
                        const titleValue = typeof formattedValue === 'string' || typeof formattedValue === 'number' ? String(formattedValue) : undefined;

                        return (
                          <TableCell key={String(column.field)} align={column.align || 'left'} width={column.width} title={allowWrap ? undefined : titleValue} sx={{ minWidth: column.minWidth || column.width, maxWidth: column.width || column.minWidth || 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: allowWrap ? 'normal' : 'nowrap' }}>
                            {allowWrap ? renderedCell : (
                              <Box component="span" sx={{ display: 'block', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            <Box sx={{ margin: 2 }}>{getDetailPanelContent({ row }) as any}</Box>
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
              '.MuiTablePagination-toolbar': { flexWrap: 'wrap', rowGap: 1, minHeight: 60 },
            }}
          />
        )}
      </Paper>
    </TableCard>
  );
}
