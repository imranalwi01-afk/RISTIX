'use client';

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTheme } from '@mui/material/styles';
import type { NativeTableColumn } from './NativeTable.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NativeTableCardViewProps<T = any> {
  rows: T[];
  columns: NativeTableColumn<T>[];
  visibleColumns: NativeTableColumn<T>[];
  loading: boolean;
  sx?: any;
  getRowId: (row: T) => string | number;
  getRowSx?: (params: { row: T; id: string | number }) => any;
  getCellValue: (row: T, column: NativeTableColumn<T>) => any;
  checkboxSelection: boolean;
  selected: Set<any>;
  onSelect: (id: any) => void;
  expandedRows: Set<any>;
  onToggleExpand: (id: any) => void;
  getDetailPanelContent?: (params: { row: T }) => React.ReactNode;
  onRowClick?: (params: { row: T; id: string | number }) => void;
  onRowDoubleClick?: (params: { row: T; id: string | number }) => void;
  hideFooter: boolean;
  hideFooterPagination: boolean;
  pageSizeOptions: number[];
  paginationCount: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NativeTableCardView<T = any>({
  rows,
  visibleColumns,
  loading,
  sx,
  getRowId,
  getRowSx,
  getCellValue,
  checkboxSelection,
  selected,
  onSelect,
  expandedRows,
  onToggleExpand,
  getDetailPanelContent,
  onRowClick,
  onRowDoubleClick,
  hideFooter,
  hideFooterPagination,
  pageSizeOptions,
  paginationCount,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}: NativeTableCardViewProps<T>) {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      {rows.map((row) => {
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
                      onClick={() => onToggleExpand(rowId)}
                      aria-label={isExpanded ? 'Hide details' : 'Show details'}
                    >
                      {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Tooltip>
                )}
                {checkboxSelection && (
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onSelect(rowId)}
                  />
                )}
              </Box>
              <Grid container spacing={1}>
                {visibleColumns.map((column, idx) => (
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
                ))}
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
      {loading && rows.length === 0 && (
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
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Box>
  );
}
