'use client';

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
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ApprovalStatusBadge } from '@/components/approval';
import type { BusinessParameter } from './BusinessParameterDialog';
import BusinessDetailPanel from './BusinessDetailPanel';
import type { BusinessParameterDetail } from './BusinessDetailFormDialog';

interface BusinessParametersGridProps {
  rows: BusinessParameter[];
  loading: boolean;
  searchTerm: string;
  categoryFilter: string;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  detailRefreshTrigger: number;
  canManage: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onOpenPendingChanges: (row: BusinessParameter) => void;
  onEditParameter: (row: BusinessParameter) => void;
  onDeleteParameter: (row: BusinessParameter) => void;
  onEditDetail: (row: BusinessParameter, detail: BusinessParameterDetail) => void;
  onAddDetail: (paramCode: string, nextSeq: number) => void;
  onDeleteDetail: (detail: BusinessParameterDetail, reload: () => void) => void;
}

const BusinessParametersGrid = memo(function BusinessParametersGrid({
  rows,
  loading,
  searchTerm,
  categoryFilter,
  page,
  rowsPerPage,
  totalCount,
  detailRefreshTrigger,
  canManage,
  onSearchChange,
  onCategoryChange,
  onResetFilters,
  onPageChange,
  onRowsPerPageChange,
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
    <Card sx={{ mt: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: 'divider' }}>
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
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
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

        <Box sx={{ height: 600, width: '100%' }}>
          <SafeDataGrid
            rows={rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
            columns={columns}
            getRowId={(row) => ((row as BusinessParameter).pkid && (row as BusinessParameter).pkid !== '0' ? (row as BusinessParameter).pkid : (row as BusinessParameter).param_code)}
            loading={loading}
            rowCount={totalCount}
            hideFooterPagination
            hideFooter
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
              '& .MuiDataGrid-main': { minHeight: 400 },
            }}
          />
        </Box>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, nextPage) => onPageChange(nextPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          labelDisplayedRows={({ from, to, count }) => `Showing ${from}–${to} of ${count} • Page ${page + 1}`}
          sx={{
            borderTop: '2px solid #e0e0e0',
            bgcolor: '#fafafa',
          }}
        />
      </CardContent>
    </Card>
  );
});

export default BusinessParametersGrid;
