'use client';

import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
import React, { memo, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ApprovalStatusBadge } from '@/components/approval';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseSort } from '@/types/enterprise-table';
import type { BusinessParameter } from './BusinessParameterDialog';
import BusinessDetailPanel from './BusinessDetailPanel';
import type { BusinessParameterDetail } from './BusinessDetailFormDialog';

interface BusinessParametersGridProps {
  rows: BusinessParameter[];
  loading: boolean;
  searchTerm: string;
  categoryFilter: string;
  paginationModel: { page: number; pageSize: number };
  totalCount: number;
  detailRefreshTrigger: number;
  canManage: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onResetFilters: () => void;
  onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  density?: EnterpriseDensity;
  onDensityChange?: (density: EnterpriseDensity) => void;
  columnFilters?: Record<string, EnterpriseColumnFilterValue>;
  onColumnFiltersChange?: (filters: Record<string, EnterpriseColumnFilterValue>) => void;
  sort?: EnterpriseSort[];
  onSortChange?: (sort: EnterpriseSort[]) => void;
  onSaveView?: () => void;
  onResetView?: () => void;
  onOpenPendingChanges: (row: BusinessParameter) => void;
  onEditParameter: (row: BusinessParameter) => void;
  onDeleteParameter: (row: BusinessParameter) => void;
  onEditDetail: (row: BusinessParameter, detail: BusinessParameterDetail) => void;
  onAddDetail: (paramCode: string, nextSeq: number) => void;
  onDeleteDetail: (detail: BusinessParameterDetail, reload: () => void) => void;
}

const columnFilters = useColumnFiltersFromUrl();

const BusinessParametersGrid = memo(function BusinessParametersGrid({
  rows,
  loading,
  searchTerm,
  categoryFilter,
  paginationModel,
  totalCount,
  detailRefreshTrigger,
  canManage,
  onSearchChange,
  onCategoryChange,
  onResetFilters,
  onPaginationModelChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  density,
  onDensityChange,
  columnFilters,
  onColumnFiltersChange,
  sort,
  onSortChange,
  onSaveView,
  onResetView,
  onOpenPendingChanges,
  onEditParameter,
  onDeleteParameter,
  onEditDetail,
  onAddDetail,
  onDeleteDetail,
}: BusinessParametersGridProps) {
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'param_code',
        headerName: 'Code',
        width: 150,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {String(p.value || '')}
          </Typography>
        ),
      },
      { field: 'param_desc', headerName: 'Description', flex: 1, minWidth: 250 },
      { field: 'param_value', headerName: 'Value', width: 150 },
      {
        field: 'param_category',
        headerName: 'Category',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (p) => (
          <Chip
            label={String(p.value || '')}
            size="small"
            variant="outlined"
            color={p.value === 'B' ? 'primary' : p.value === 'A' ? 'info' : 'secondary'}
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        field: 'active_flag',
        headerName: 'Active',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (p) => (
          <Chip label={p.value ? 'Yes' : 'No'} color={p.value ? 'success' : 'default'} size="small" sx={{ minWidth: 50 }} />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (p) => (
          <Box
            onClick={(e) => {
              if ((p.row as any).approvalStatus === 'pending') {
                e.stopPropagation();
                onOpenPendingChanges(p.row as BusinessParameter);
              }
            }}
            sx={{ cursor: (p.row as any).approvalStatus === 'pending' ? 'pointer' : 'default' }}
          >
            <ApprovalStatusBadge status={(p.row as any).approvalStatus || 'active'} size="small" />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 100,
        align: 'right',
        headerAlign: 'right',
        getActions: (p) =>
          canManage
            ? [
                <SafeGridActionsCellItem
                  key="edit"
                  label="Edit"
                  icon={<EditIcon fontSize="small" />}
                  onClick={() => onEditParameter(p.row as BusinessParameter)}
                  data-testid="btn-edit-business-setting"
                />,
                <SafeGridActionsCellItem
                  key="delete"
                  label="Delete"
                  icon={<DeleteIcon fontSize="small" color="error" />}
                  onClick={() => onDeleteParameter(p.row as BusinessParameter)}
                  data-testid="btn-delete-business-setting"
                />,
              ]
            : [],
      },
    ],
    [canManage, onDeleteParameter, onEditParameter, onOpenPendingChanges],
  );

  return (
    <Card sx={{ mt: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
      <CardContent sx={{ p: 0, minWidth: 0, overflowX: 'hidden', '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, rowGap: 1.5, flexWrap: 'wrap', alignItems: 'center', minWidth: 0, bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            inputProps={{ 'data-testid': 'input-search' }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              sx: { borderRadius: 2, bgcolor: 'background.paper' },
            }}
            sx={{ flex: '1 1 280px', minWidth: 0, width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: '100%', md: 400 } }}
          />
          <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' }, flex: { xs: '1 1 180px', sm: '0 0 auto' } }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} label="Category" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="B">Business</MenuItem>
              <MenuItem value="A">Application</MenuItem>
              <MenuItem value="S">System</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={onResetFilters}>
            <ClearIcon />
          </Button>
        </Box>

        <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <SafeDataGrid
            rows={rows}
            columns={columns}
            responsiveMode="cards"
            getRowId={(row) => ((row as BusinessParameter).pkid && (row as BusinessParameter).pkid !== '0' ? (row as BusinessParameter).pkid : (row as BusinessParameter).param_code)}
            loading={loading}
            rowCount={totalCount}
            paginationMode="offset"
            paginationModel={paginationModel}
            onPaginationModelChange={onPaginationModelChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
            sortModel={sort?.map((item) => ({ field: item.field, sort: item.direction }))}
            onSortModelChange={onSortChange ? (model) => {
              onSortChange(
                model
                  .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                  .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
              );
            } : undefined}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={onColumnVisibilityModelChange}
            density={density === 'dense' ? 'compact' : density}
            onDensityChange={onDensityChange}
            showEnterpriseControls
            onSaveView={onSaveView}
            onResetView={onResetView}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            getDetailPanelContent={(params) => (
              <BusinessDetailPanel
                row={params.row as BusinessParameter}
                refreshTrigger={detailRefreshTrigger}
                canManage={canManage}
                onEditDetail={(detail) => onEditDetail(params.row as BusinessParameter, detail)}
                onAddDetail={onAddDetail}
                onDeleteDetail={onDeleteDetail}
              />
            )}
            getDetailPanelHeight={() => 'auto'}
            sx={{
              minHeight: 400,
              width: '100%',
              maxWidth: '100%',
              '& .MuiDataGrid-main': { minHeight: 400 },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

export default BusinessParametersGrid;
