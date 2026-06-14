// Ifrs9ReportDataGrid.tsx – Data grid with pagination, search, and detail panel
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef } from '@mui/x-data-grid';
import type { ReportFilters, ReportResponse, ThemeStyles } from './types'
import type { EnterpriseFilterDefinition, EnterpriseColumnFilterValue } from '@/types/enterprise-table';

interface Ifrs9ReportDataGridProps {
  columns: GridColDef[];
  filteredData: Record<string, unknown>[];
  data: Record<string, unknown>[];
  loading: boolean;
  hideDataGrid: boolean;
  supportsPagination: boolean;
  reportType: string;
  pagination: NonNullable<ReportResponse['pagination']>;
  queryState: {
    paginationModel: { page: number; pageSize: number };
    columnFilters: Record<string, EnterpriseColumnFilterValue>;
    sort: Array<{ field: string; direction: 'asc' | 'desc' }>;
    columnVisibilityModel: Record<string, boolean>;
    density: string;
  };
  gridDensity: 'compact' | 'standard' | 'comfortable' | undefined;
  filterDefinitions: Record<string, EnterpriseFilterDefinition>;
  onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
  onColumnFiltersChange: (filters: Record<string, EnterpriseColumnFilterValue>) => void;
  onSortModelChange: (model: Array<{ field: string; sort: string }>) => void;
  onColumnVisibilityModelChange: (model: Record<string, boolean>) => void;
  onDensityChange: (density: string) => void;
  onSaveView?: () => void;
  onResetView?: () => void;
  renderDetailPanel?: (params: { row: any }) => React.ReactNode;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportDataGrid: React.FC<Ifrs9ReportDataGridProps> = ({
  columns,
  filteredData,
  data,
  loading,
  hideDataGrid,
  supportsPagination,
  reportType,
  pagination,
  queryState,
  gridDensity,
  filterDefinitions,
  onPaginationModelChange,
  onColumnFiltersChange,
  onSortModelChange,
  onColumnVisibilityModelChange,
  onDensityChange,
  onSaveView,
  onResetView,
  renderDetailPanel,
  themeStyles,
}) => {
  if (hideDataGrid) return null;

  if (columns.length > 0) {
    return (
      <Paper
        sx={{
          minHeight: 600,
          height: 'auto',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SafeDataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          getDetailPanelContent={reportType === 'lifetime-lgd' ? renderDetailPanel : undefined}
          getDetailPanelHeight={reportType === 'lifetime-lgd' ? () => 'auto' : undefined}
          pagination
          paginationMode={supportsPagination ? 'server' : 'client'}
          {...(supportsPagination && pagination.total > 0 && { rowCount: pagination.total })}
          paginationModel={{
            page: supportsPagination ? queryState.paginationModel.page : 0,
            pageSize: supportsPagination ? queryState.paginationModel.pageSize : 100
          }}
          onPaginationModelChange={(model) => {
            if (supportsPagination) {
              onPaginationModelChange(model);
            }
          }}
          columnFilters={supportsPagination ? queryState.columnFilters : undefined}
          onColumnFiltersChange={supportsPagination ? onColumnFiltersChange : undefined}
          sortModel={supportsPagination ? queryState.sort.map((item) => ({ field: item.field, sort: item.direction })) : undefined}
          onSortModelChange={supportsPagination ? (model) => {
            onSortModelChange(model as Array<{ field: string; sort: string }>);
          } : undefined}
          columnVisibilityModel={supportsPagination ? queryState.columnVisibilityModel : undefined}
          onColumnVisibilityModelChange={supportsPagination ? onColumnVisibilityModelChange : undefined}
          density={gridDensity}
          onDensityChange={supportsPagination ? onDensityChange : undefined}
          pageSizeOptions={supportsPagination ? [10, 25, 50, 75, 100] : [100]}
          getRowId={(row) => row.id || row.account_id || row.pkid || Math.random()}
          filterDefinitions={filterDefinitions}
          showEnterpriseControls
          onSaveView={supportsPagination ? onSaveView : undefined}
          onResetView={supportsPagination ? onResetView : undefined}
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem'
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: themeStyles.primary,
              color: '#ffffff',
              fontWeight: 'bold'
            }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  No Report Data Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please check your filter parameters and selected processing date.
                </Typography>
              </Box>
            )
          }}
        />
      </Paper>
    );
  }

  if (!loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
          No Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Unable to determine table structure. Please check your database connection and filter parameters.
        </Typography>
      </Paper>
    );
  }

  return null;
};

export default React.memo(Ifrs9ReportDataGrid);
